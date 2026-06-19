require('dotenv').config();
const { Telegraf } = require('telegraf');
const express = require('express');
const { initDB, getUserLang, setUserLang } = require('./database');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
const BOT_TOKEN = process.env.BOT_TOKEN || '';
const DOMAIN = process.env.DOMAIN || '';
const MINI_APP_URL = 'https://oblachka81-cloud.github.io/SASH-Market/public/index.html';

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
// Раздача файлов локализации
app.use('/locales', express.static(path.join(__dirname, 'locales')));

// API: Профиль пользователя
app.get('/api/profile', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM products WHERE status = 'active') as listings_count,
        (SELECT COUNT(*) FROM products WHERE status = 'sold') as sold,
        0 as bought,
        0 as orders_count,
        0 as rating
    `);
    res.json({
      first_name: 'Пользователь',
      username: 'sash_user',
      registered_at: new Date().toISOString(),
      ...result.rows[0]
    });
  } catch (err) {
    console.error('Ошибка профиля:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// API: Получить товары
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, price, description, photo_id, category FROM products WHERE status = 'active' ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Ошибка получения товаров:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// API: Добавить товар
app.post('/api/products', async (req, res) => {
  try {
    const { name, price, description, photo_id, category } = req.body;
    if (!name || !price) {
      return res.status(400).json({ error: 'Название и цена обязательны' });
    }
    const result = await pool.query(
      `INSERT INTO products (seller_id, name, price, description, photo_id, category) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id, name, price`,
      [0, name, price, description || '', photo_id || '', category || '']
    );
    res.status(201).json({ success: true, product: result.rows[0] });
  } catch (err) {
    console.error('Ошибка добавления товара:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

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
