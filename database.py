import psycopg2
from config import DATABASE_URL

def get_connection():
    """Подключение к базе данных"""
    return psycopg2.connect(DATABASE_URL)

def init_db():
    """Создать все таблицы, если их нет"""
    conn = get_connection()
    cursor = conn.cursor()
    
    # Таблица пользователей
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            user_id BIGINT PRIMARY KEY,
            username TEXT,
            language TEXT DEFAULT 'ru',
            role TEXT DEFAULT 'user',
            registered_at TIMESTAMP DEFAULT NOW()
        )
    ''')
    
    # Таблица товаров
    cursor.execute('''
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
    ''')
    
    conn.commit()
    conn.close()
    print("✅ База данных готова!")

def get_user_lang(user_id):
    """Получить язык пользователя"""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT language FROM users WHERE user_id = %s", (user_id,))
    result = cursor.fetchone()
    conn.close()
    return result[0] if result else 'ru'

def set_user_lang(user_id, username, lang):
    """Сохранить язык пользователя"""
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO users (user_id, username, language) 
        VALUES (%s, %s, %s)
        ON CONFLICT (user_id) DO UPDATE SET language = %s, username = %s
    ''', (user_id, username, lang, lang, username))
    conn.commit()
    conn.close()
