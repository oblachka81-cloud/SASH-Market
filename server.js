require('dotenv').config();
const { Telegraf } = require('telegraf');
const express = require('express');
const { initDB, pool } = require('./database');
const path = require('path');
const crypto = require('crypto');

const app = express();
const port = process.env.PORT || 3000;
const BOT_TOKEN = process.env.BOT_TOKEN;
const DOMAIN = process.env.DOMAIN;
const MINI_APP_URL = 'https://oblachka81-cloud.github.io/SASH-Market/public/index.html';

if (!BOT_TOKEN) {
    console.error('BOT_TOKEN не задан');
    process.exit(1);
}

const bot = new Telegraf(BOT_TOKEN);

// Раздаём статику
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Middleware для проверки данных из Telegram
function verifyTelegramData(initData) {
    if (!initData || !initData.hash) return false;
    
    const hash = initData.hash;
    delete initData.hash;
    
    const dataCheckArr = Object.keys(initData)
        .sort()
        .map(key => `${key}=${initData[key]}`);
    const dataCheckString = dataCheckArr.join('\n');
    
    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(BOT_TOKEN).digest();
    const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
    
    return calculatedHash === hash;
}

// API: Получить фото профиля из Telegram
app.get('/api/user-photo/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const photos = await bot.telegram.getUserProfilePhotos(userId, 0, 1);
        
        if (photos.total_count > 0) {
            const fileId = photos.photos[0][0].file_id;
            const fileUrl = await bot.telegram.getFileLink(fileId);
            res.json({ photo_url: fileUrl.href });
        } else {
            res.json({ photo_url: null });
        }
    } catch (err) {
        console.error('Ошибка получения фото:', err);
        res.json({ photo_url: null });
    }
});

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

// Бот
bot.start(async (ctx) => {
    const userId = ctx.from.id;
    const firstName = ctx.from.first_name || 'Пользователь';

    const keyboard = {
        inline_keyboard: [[
            { text: '🚀 ОТКРЫТЬ SASH MARKET', web_app: { url: MINI_APP_URL } }
        ]]
    };

    ctx.reply(`🌟 Привет, ${firstName}!\n\nДобро пожаловать в SASH Market.\nЖми на кнопку, чтобы начать:`, {
        reply_markup: keyboard
    });
});

app.post('/webhook', async (req, res) => {
    try {
        await bot.handleUpdate(req.body);
        res.sendStatus(200);
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

// Старт
async function start() {
    await initDB();
    await bot.telegram.setWebhook(`https://${DOMAIN}/webhook`);
    console.log(`Webhook установлен: https://${DOMAIN}/webhook`);
    app.listen(port, () => console.log(`Сервер на порту ${port}`));
}

start();
