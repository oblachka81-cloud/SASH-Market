require('dotenv').config();
const { Telegraf } = require('telegraf');
const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

// Заглушка, пока нет токена
const BOT_TOKEN = process.env.BOT_TOKEN || '';

if (BOT_TOKEN) {
  const bot = new Telegraf(BOT_TOKEN);

  bot.start((ctx) => {
    ctx.reply('🌟 SASH Market запущен! Добро пожаловать!');
  });

  bot.launch();
  console.log('🚀 Бот SASH Market запущен!');
} else {
  console.log('⚠️ BOT_TOKEN не указан. Бот не запущен.');
}

// Express сервер для Mini App
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send('SASH Market API is running');
});

app.listen(port, () => {
  console.log(`🌐 Сервер запущен на порту ${port}`);
});
