require('dotenv').config();
const { Telegraf } = require('telegraf');
const express = require('express');
const { initDB, getUserLang, setUserLang } = require('./database');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
const BOT_TOKEN = process.env.BOT_TOKEN || '';

// Загрузка локализации
const LOCALES = {
  ru: require('./locales/ru.json'),
  en: require('./locales/en.json'),
  es: require('./locales/es.json'),
  fr: require('./locales/fr.json')
};

function t(userId, key, vars = {}) {
  const lang = LOCALES[getUserLang] ? 'ru' : 'ru'; // заглушка, обновим ниже
  let text = LOCALES[lang]?.[key] || key;
  for (const [k, v] of Object.entries(vars)) {
    text = text.replace(`{${k}}`, v);
  }
  return text;
}

if (BOT_TOKEN) {
  const bot = new Telegraf(BOT_TOKEN);

  // Middleware для языка
  bot.use(async (ctx, next) => {
    const userId = ctx.from?.id;
    if (userId) {
      ctx.userLang = await getUserLang(userId);
    } else {
      ctx.userLang = 'ru';
    }
    return next();
  });

  bot.start(async (ctx) => {
    const userId = ctx.from.id;
    const username = ctx.from.username;
    await setUserLang(userId, username, 'ru');
    
    ctx.reply(LOCALES.ru.welcome, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '🇷🇺 Русский', callback_data: 'lang_ru' },
            { text: '🇬🇧 English', callback_data: 'lang_en' }
          ],
          [
            { text: '🇪🇸 Español', callback_data: 'lang_es' },
            { text: '🇫🇷 Français', callback_data: 'lang_fr' }
          ]
        ]
      }
    });
  });

  bot.action(/lang_(.+)/, async (ctx) => {
    const lang = ctx.match[1];
    const userId = ctx.from.id;
    const username = ctx.from.username;
    await setUserLang(userId, username, lang);
    
    await ctx.answerCbQuery(LOCALES[lang].lang_set);
    ctx.reply(LOCALES[lang].main_menu, { parse_mode: 'Markdown' });
  });

  bot.launch();
  console.log('🚀 Бот SASH Market запущен!');
}

// Express сервер
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.send('SASH Market API is running');
});

app.listen(port, async () => {
  await initDB();
  console.log(`🌐 Сервер на порту ${port}`);
});
