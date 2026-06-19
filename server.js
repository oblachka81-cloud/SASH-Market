require('dotenv').config();
const { Telegraf } = require('telegraf');
const express = require('express');
const { initDB, getUserLang, setUserLang } = require('./database');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
const BOT_TOKEN = process.env.BOT_TOKEN || '';
const DOMAIN = process.env.DOMAIN || '';
const MINI_APP_URL = 'https://oblachka81-cloud.github.io/SASH-Market/mini_app/';

const bot = new Telegraf(BOT_TOKEN);

// /start — сразу кидаем в Mini App
bot.start(async (ctx) => {
  const userId = ctx.from.id;
  const username = ctx.from.username;
  const firstName = ctx.from.first_name || username || 'User';
  
  // Сохраняем юзера с дефолтным русским
  await setUserLang(userId, username, 'ru');
  
  // Кнопка открытия Mini App
  const keyboard = {
    inline_keyboard: [[
      { text: '🚀 Открыть SASH Market', web_app: { url: MINI_APP_URL } }
    ]]
  };
  
  ctx.reply(`🌟 Привет, ${firstName}!\n\nДобро пожаловать в SASH Market — глобальную торговую экосистему.\n\nЖми на кнопку, чтобы начать:`, {
    reply_markup: keyboard
  });
});

// Express
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/webhook', async (req, res) => {
  try {
    await bot.handleUpdate(req.body);
    res.sendStatus(200);
  } catch (err) {
    console.error('Webhook error:', err);
    res.sendStatus(500);
  }
});

app.get('/', (req, res) => {
  res.send('SASH Market API is running');
});

async function start() {
  await initDB();
  
  if (DOMAIN) {
    const webhookUrl = `https://${DOMAIN}/webhook`;
    await bot.telegram.setWebhook(webhookUrl);
    console.log(`🎯 Webhook: ${webhookUrl}`);
  } else {
    bot.launch();
  }
  
  app.listen(port, () => {
    console.log(`🌐 Сервер на порту ${port}`);
  });
}

start();
