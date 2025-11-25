// bot/index.ts
import dotenv from 'dotenv';
import { Telegraf, Context } from 'telegraf';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

// токен бота и урл мини-аппа берём из .env
const BOT_TOKEN = process.env.BOT_TOKEN;
const WEBAPP_URL = process.env.WEBAPP_URL;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Создаём Supabase клиент для бота
let supabase: ReturnType<typeof createClient> | null = null;
if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
    },
  });
  console.log('✅ Supabase client initialized for bot');
} else {
  console.warn('⚠️ Supabase credentials not set, user creation will be skipped');
}

if (!BOT_TOKEN) {
  throw new Error('BOT_TOKEN is not set in .env');
}

if (!WEBAPP_URL) {
  throw new Error('WEBAPP_URL is not set in .env');
}

// Валидация URL
if (!WEBAPP_URL.startsWith('https://')) {
  throw new Error(`WEBAPP_URL должен начинаться с https://. Текущее значение: ${WEBAPP_URL}\n\nTelegram Web Apps работают только с HTTPS ссылками. Используйте URL вашего задеплоенного приложения на Vercel (например: https://your-project.vercel.app)`);
}

if (WEBAPP_URL.includes('localhost') || WEBAPP_URL.includes('127.0.0.1')) {
  throw new Error(`WEBAPP_URL не может быть localhost. Текущее значение: ${WEBAPP_URL}\n\nИспользуйте URL вашего задеплоенного приложения на Vercel (например: https://your-project.vercel.app)`);
}

// создаём экземпляр бота
const bot = new Telegraf<Context>(BOT_TOKEN);

// Функция для создания/обновления пользователя в базе
async function ensureUserExists(telegramId: number, userData: any) {
  if (!supabase) {
    console.log('⚠️ Supabase not configured, skipping user creation');
    return null;
  }

  try {
    // Проверяем, существует ли пользователь
    const { data: existingUser, error: findError } = await supabase
      .from('users')
      .select('id')
      .eq('telegram_id', telegramId.toString())
      .maybeSingle();

    if (findError && findError.code !== 'PGRST116') {
      console.error('❌ Error finding user:', findError);
      return null;
    }

    if (existingUser) {
      console.log(`✅ User already exists: ${existingUser.id}`);
      return existingUser.id;
    }

    // Создаём нового пользователя
    const userInsert: any = {
      telegram_id: telegramId.toString(),
    };

    if (userData?.username) userInsert.username = userData.username;
    if (userData?.first_name) userInsert.first_name = userData.first_name;
    if (userData?.last_name) userInsert.last_name = userData.last_name;

    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert(userInsert)
      .select('id')
      .single();

    if (insertError) {
      console.error('❌ Error creating user:', insertError);
      console.error('Error details:', JSON.stringify(insertError, null, 2));
      return null;
    }

    console.log(`✅ Created new user: ${newUser.id}`);
    return newUser.id;
  } catch (error: any) {
    console.error('❌ Unexpected error in ensureUserExists:', error);
    return null;
  }
}

// /start — приветствие + кнопка с WebApp + создание пользователя
bot.start(async (ctx) => {
  try {
    const name = ctx.from?.first_name ?? 'друг';
    const telegramId = ctx.from?.id;
    console.log(`/start command from user ${telegramId} (${name})`);
    console.log(`WEBAPP_URL: ${WEBAPP_URL}`);

    if (!WEBAPP_URL) {
      throw new Error('WEBAPP_URL is not set');
    }

    // Создаём/обновляем пользователя в базе данных
    if (telegramId) {
      await ensureUserExists(telegramId, ctx.from);
    }

    const message = await ctx.reply(
      `Привет, ${name}! 👋\n\n` +
      `Это первый шаг к ЗОЖ.\n\n` +
      `Нажми кнопку ниже, ответь на пару вопросов — и я посчитаю твою норму калорий и базу для плана питания.`,
      {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: 'Заполнить анкету ✅',
                web_app: { url: WEBAPP_URL },
              },
            ],
          ],
        },
      }
    );
    console.log(`✅ Sent welcome message with Web App button to user ${telegramId}`);
    console.log(`Message ID: ${message.message_id}`);
  } catch (error: any) {
    console.error('❌ Error in /start handler:');
    console.error('Error message:', error?.message);
    console.error('Error stack:', error?.stack);
    console.error('Full error:', JSON.stringify(error, null, 2));
    
    try {
      await ctx.reply(
        `Произошла ошибка: ${error?.message || 'Неизвестная ошибка'}\n\n` +
        `Проверь настройки бота. WEBAPP_URL: ${WEBAPP_URL || 'не задан'}`
      );
    } catch (replyError) {
      console.error('Failed to send error message:', replyError);
    }
  }
});

// Обработка всех остальных сообщений
bot.on('message', async (ctx) => {
  // Игнорируем команды, которые уже обработаны
  if ('text' in ctx.message && ctx.message.text?.startsWith('/')) {
    return;
  }
  
  console.log('Новое сообщение от', ctx.from?.id, ctx.message);
  
  // Отвечаем на неизвестные сообщения
  await ctx.reply(
    'Не понял. Напиши /start для начала работы.',
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'Заполнить анкету ✅',
              web_app: { url: WEBAPP_URL },
            },
          ],
        ],
      },
    }
  );
});

// Обработка ошибок бота
bot.catch((err, ctx) => {
  console.error('❌ Bot error:', err);
  console.error('Context:', ctx);
  ctx.reply('Произошла ошибка бота. Попробуй еще раз.').catch(console.error);
});

// запуск бота
bot.launch().then(() => {
  console.log('✅ Bot started successfully!');
  console.log(`Bot is listening for commands...`);
  console.log(`WEBAPP_URL: ${WEBAPP_URL}`);
}).catch((error) => {
  console.error('❌ Failed to start bot:');
  console.error(error);
  process.exit(1);
});

// аккуратная остановка при завершении процесса
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
