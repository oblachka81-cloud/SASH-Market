require('dotenv').config();
const { Telegraf } = require('telegraf');
const express = require('express');
const { initDB, getUserLang, setUserLang } = require('./database');

const app = express();
const port = process.env.PORT || 3000;

const BOT_TOKEN = process.env.BOT_TOKEN || '';

// Локализация
const LOCALES = {
  ru: { welcome: '🌟 *Добро пожаловать в SASH Market!*\n\nГлобальная торговая экосистема.\nВыберите язык:', lang_set: '✅ Язык: Русский', main_menu: '🏠 *Главное меню*' },
  en: { welcome: '🌟 *Welcome to SASH Market!*\n\nGlobal trading ecosystem.\nChoose language:', lang_set: '✅ Language: English', main_menu: '🏠 *Main Menu*' },
  es: { welcome: '🌟 *¡Bienvenido a SASH Market!*\n\nEcosistema comercial global.\nElija idioma:', lang_set: '✅ Idioma: Español', main_menu: '🏠 *Menú Principal*' },
  fr: { welcome: '🌟 *Bienvenue sur SASH Market!*\n\nÉcosystème commercial mondial.\nChoisissez la langue:', lang_set: '✅ Langue: Français', main_menu: '🏠 *Menu Principal*' }
};

if (BOT_TOKEN) {
  const bot = new Telegraf(BOT_TOKEN);

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
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.send('SASH Market API is running');
});

app.listen(port, async () => {
  await initDB();
  console.log(`🌐 Сервер на порту ${port}`);
});
