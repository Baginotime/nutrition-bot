// bot/index.ts
import dotenv from 'dotenv';
import { Telegraf, Context } from 'telegraf';

dotenv.config();

// токен бота и урл мини-аппа берём из .env
const BOT_TOKEN = process.env.BOT_TOKEN;
const WEBAPP_URL = process.env.WEBAPP_URL; // или MINI_APP_URL, если хочешь так назвать

if (!BOT_TOKEN) {
  throw new Error('BOT_TOKEN is not set in .env');
}

if (!WEBAPP_URL) {
  throw new Error('WEBAPP_URL is not set in .env');
}

// создаём экземпляр бота
const bot = new Telegraf<Context>(BOT_TOKEN);

// /start — приветствие + кнопка с WebApp
bot.start(async (ctx) => {
  try {
    const name = ctx.from?.first_name ?? 'друг';
    console.log(`/start command from user ${ctx.from?.id} (${name})`);
    console.log(`WEBAPP_URL: ${WEBAPP_URL}`);

    if (!WEBAPP_URL) {
      throw new Error('WEBAPP_URL is not set');
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
    console.log(`✅ Sent welcome message with Web App button to user ${ctx.from?.id}`);
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
