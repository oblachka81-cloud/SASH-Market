require('dotenv').config();
const express = require('express');
const { Telegraf } = require('telegraf');

const app = express();
const port = process.env.PORT || 3000;

// Инициализация бота SASH Nexus
const bot = new Telegraf(process.env.BOT_TOKEN);

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

bot.launch();

// Эндпоинт для проверки работы сервера (нужен для BotHost и Web App)
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'SASH Nexus API is running smoothly 🚀',
    version: '1.0.0'
  });
});

app.listen(port, () => {
  console.log(`🚀 SASH Nexus server is running on port ${port}`);
});

// Корректное завершение работы
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
