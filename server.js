require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const express = require('express');
const { initDB, getUserLang, setUserLang } = require('./database');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
const BOT_TOKEN = process.env.BOT_TOKEN || '';
const DOMAIN = process.env.DOMAIN || '';
const MINI_APP_URL = 'https://oblachka81-cloud.github.io/SASH-Market/mini_app/';

const LOCALES = {
  ru: require('./locales/ru.json'),
  en: require('./locales/en.json'),
  es: require('./locales/es.json'),
  fr: require('./locales/fr.json')
};

function t(ctx, key, vars = {}) {
  const lang = ctx.userLang || 'ru';
  let text = LOCALES[lang]?.[key] || key;
  for (const [k, v] of Object.entries(vars)) {
    text = text.replace(`{${k}}`, v);
  }
  return text;
}

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

// /start
bot.start(async (ctx) => {
  const userId = ctx.from.id;
  const username = ctx.from.username;
  await setUserLang(userId, username, 'ru');
  
  ctx.reply(LOCALES.ru.welcome, {
    parse_mode: 'Markdown',
    ...Markup.inlineKeyboard([
      [
        Markup.button.callback('🇷🇺 Русский', 'lang_ru'),
        Markup.button.callback('🇬🇧 English', 'lang_en')
      ],
      [
        Markup.button.callback('🇪🇸 Español', 'lang_es'),
        Markup.button.callback('🇫🇷 Français', 'lang_fr')
      ]
    ])
  });
});

// Выбор языка
bot.action(/lang_(.+)/, async (ctx) => {
  const lang = ctx.match[1];
  const userId = ctx.from.id;
  const username = ctx.from.username;
  
  // Отвечаем СРАЗУ, не ждём
  await ctx.answerCbQuery(LOCALES[lang].lang_set);
  
  // Потом обновляем базу и показываем меню
  await setUserLang(userId, username, lang);
  ctx.userLang = lang;
  
  showMainMenu(ctx);
});

// Главное меню
function showMainMenu(ctx) {
  ctx.reply(t(ctx, 'main_menu'), {
    parse_mode: 'Markdown',
    ...Markup.keyboard([
      [Markup.button.webView(t(ctx, 'open_app'), MINI_APP_URL)],
      [Markup.button.text(t(ctx, 'buy')), Markup.button.text(t(ctx, 'sell'))],
      [Markup.button.text(t(ctx, 'logistics')), Markup.button.text(t(ctx, 'profile'))],
      [Markup.button.text(t(ctx, 'support'))]
    ]).resize()
  });
}

// Обработка кнопок
bot.hears((text, ctx) => {
  const arr = [
    t(ctx, 'buy'), t(ctx, 'sell'), t(ctx, 'logistics'),
    t(ctx, 'profile'), t(ctx, 'support')
  ];
  return arr.includes(text);
}, (ctx) => {
  const text = ctx.message.text;
  
  if (text === t(ctx, 'buy') || text === t(ctx, 'sell') || text === t(ctx, 'logistics')) {
    ctx.reply(t(ctx, 'in_dev'), { parse_mode: 'Markdown' });
  } else if (text === t(ctx, 'profile')) {
    ctx.reply(t(ctx, 'profile_info', { user_id: ctx.from.id, lang: ctx.userLang }), { parse_mode: 'Markdown' });
  } else if (text === t(ctx, 'support')) {
    ctx.reply(t(ctx, 'support_info'), { parse_mode: 'Markdown' });
  }
});

// Express middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Webhook endpoint
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

// Запуск
async function start() {
  await initDB();
  
  if (DOMAIN) {
    const webhookUrl = `https://${DOMAIN}/webhook`;
    await bot.telegram.setWebhook(webhookUrl);
    console.log(`🎯 Webhook установлен: ${webhookUrl}`);
  } else {
    console.log('⚠️ DOMAIN не указан, запускаю long polling');
    bot.launch();
  }
  
  app.listen(port, () => {
    console.log(`🌐 Сервер на порту ${port}`);
  });
}

start();
