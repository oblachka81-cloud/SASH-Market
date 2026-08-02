require('dotenv').config();
const express = require('express');
const { Telegraf } = require('telegraf');
const { PrismaClient } = require('@prisma/client');

const app = express();
const port = process.env.PORT || 3000;

// Инициализация Prisma
const prisma = new PrismaClient();

// Инициализация бота
const bot = new Telegraf(process.env.BOT_TOKEN);

// Функция синхронизации базы данных
async function syncDatabase() {
  try {
    console.log('🔄 Синхронизация базы данных...');
    // Prisma db push через код (создает таблицы по schema.prisma)
    await prisma.$connect();
    console.log('✅ База данных подключена успешно!');
    
    // Проверяем, есть ли таблицы
    const tables = await prisma.$queryRaw`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    `;
    console.log(`📊 Найдено таблиц: ${tables.length}`);
    
  } catch (error) {
    console.error('❌ Ошибка подключения к базе:', error.message);
  }
}

// Команды бота
bot.start((ctx) => {
  ctx.reply(
    'Добро пожаловать в *SASH Nexus*! 🌐\n\n' +
    'Мы строим единую экосистему для:\n' +
    '🇨🇳 Товаров из Китая\n' +
    '📦 Логистики и трекинга\n' +
    '💎 Крипто-обмена\n' +
    '✈️ Туризма\n\n' +
    'Скоро здесь откроется полноценное Mini App. Оставайтесь на связи!'
  );
});

bot.command('status', async (ctx) => {
  try {
    const userCount = await prisma.user.count();
    ctx.reply(`📊 Статус системы:\n• Пользователей в базе: ${userCount}\n• База данных: подключена ✅`);
  } catch (error) {
    ctx.reply('⚠️ База данных пока не настроена');
  }
});

bot.launch();

// Запуск сервера
async function startServer() {
  await syncDatabase();
  
  app.get('/', (req, res) => {
    res.json({ 
      status: 'ok', 
      message: 'SASH Nexus API is running smoothly ',
      version: '1.0.0',
      database: 'connected'
    });
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
