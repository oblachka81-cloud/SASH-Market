const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://bothost_db_1e7a3eabefbd:fuV_53wVHgUs2gES6mCA0Dh37yJInzTkuaW6bDe_BXk@node1.pghost.ru:15792/bothost_db_1e7a3eabefbd',
  ssl: false
});

async function initDB() {
  const client = await pool.connect();
  try {
    // Таблица пользователей
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id BIGINT PRIMARY KEY,
        username TEXT,
        language TEXT DEFAULT 'ru',
        role TEXT DEFAULT 'user',
        registered_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Таблица товаров
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        seller_id BIGINT REFERENCES users(user_id),
        name TEXT,
        price DECIMAL(10,2),
        description TEXT,
        photo_id TEXT,
        category TEXT,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    console.log('✅ База данных готова');
  } finally {
    client.release();
  }
}

async function getUserLang(userId) {
  const result = await pool.query('SELECT language FROM users WHERE user_id = $1', [userId]);
  return result.rows[0]?.language || 'ru';
}

async function setUserLang(userId, username, lang) {
  await pool.query(`
    INSERT INTO users (user_id, username, language) 
    VALUES ($1, $2, $3)
    ON CONFLICT (user_id) DO UPDATE SET language = $3, username = $2
  `, [userId, username, lang]);
}

module.exports = { pool, initDB, getUserLang, setUserLang };
