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

    await ctx.reply(
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
    console.log(`Sent welcome message with Web App button to user ${ctx.from?.id}`);
  } catch (error) {
    console.error('Error in /start handler:', error);
    await ctx.reply('Произошла ошибка. Попробуй еще раз.');
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

// запуск бота
bot.launch().then(() => {
  console.log('Bot started...');
});

// аккуратная остановка при завершении процесса
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
