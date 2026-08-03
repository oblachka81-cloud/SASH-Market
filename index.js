require('dotenv').config();
const express = require('express');
const path = require('path'); // Встроенный модуль для работы с путями
const { Telegraf } = require('telegraf');
const { PrismaClient } = require('@prisma/client');

const app = express();
const port = process.env.PORT || 3000;

// Инициализация Prisma
const prisma = new PrismaClient();

// Инициализация бота
const bot = new Telegraf(process.env.BOT_TOKEN);

// ВАЖНО: Говорим Express отдавать наши красивые файлы из папки public
app.use(express.static(path.join(__dirname, 'public')));

// Функция синхронизации базы данных
async function syncDatabase() {
  try {
    console.log('🔄 Синхронизация базы данных...');
    await prisma.$connect();
    console.log('✅ База данных подключена успешно!');
    
    const tables = await prisma.$queryRaw`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    `;
    console.log(`📊 Найдено таблиц: ${tables.length}`);
    
  } catch (error) {
    console.error('❌ Ошибка подключения к базе:', error.message);
  }
}

// Команды бота
bot.start(async (ctx) => {
  const keyboard = {
    inline_keyboard: [
      [{ text: '🚀 Открыть SASH Nexus', web_app: { url: process.env.WEB_APP_URL } }]
    ]
  };

  try {
    await ctx.replyWithPhoto(
      { source: path.join(__dirname, 'public', 'assets', 'enter-button.webp') },
      {
        caption:
          '🌐 *SASH Nexus* — единая экосистема:\n\n' +
          '🇨🇳 Товары из Китая\n' +
          '📦 Логистики и трекинга\n' +
          '💎 Крипто-обмена\n' +
          '✈️ Туризма\n\n' +
          'Нажми кнопку ниже, чтобы открыть приложение!',
        parse_mode: 'Markdown',
        reply_markup: keyboard
      }
    );
  } catch (e) {
    // если фотка не найдётся — шлём текст, бот не падает
    await ctx.reply('Добро пожаловать в *SASH Nexus*! 🌐', {
      parse_mode: 'Markdown',
      reply_markup: keyboard
    });
  }
});

bot.command('status', async (ctx) => {
  try {
    const userCount = await prisma.user.count();
    ctx.reply(` Статус системы:\n• Пользователей в базе: ${userCount}\n• База данных: подключена ✅`);
  } catch (error) {
    ctx.reply('⚠️ База данных пока не настроена');
  }
});

bot.launch();

// Запуск сервера
async function startServer() {
  await syncDatabase();
  
  // На всякий случай явно отдаем index.html при заходе на корень
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });

  app.listen(port, () => {
    console.log(`🚀 SASH Nexus server is running on port ${port}`);
  });
}

startServer();

// Корректное завершение работы
process.once('SIGINT', () => {
  bot.stop('SIGINT');
  prisma.$disconnect();
});
process.once('SIGTERM', () => {
  bot.stop('SIGTERM');
  prisma.$disconnect();
});
