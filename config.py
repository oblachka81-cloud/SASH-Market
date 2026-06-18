import os
from dotenv import load_dotenv

load_dotenv()

# Токен бота
BOT_TOKEN = os.getenv("BOT_TOKEN", "ВСТАВЬ_СВОЙ_ТОКЕН_СЮДА")

# ID админа (Саша)
ADMIN_ID = 5116812153  # Пока ты, потом заменим на Сашу

# Поддерживаемые языки
LANGUAGES = {
    "ru": "🇷🇺 Русский",
    "en": "🇬🇧 English",
    "es": "🇪🇸 Español",
    "fr": "🇫🇷 Français"
}

# Настройки площадки
PLACEMENT_FEE = 100
MAX_LISTINGS_PER_USER = 3
LISTING_DURATION_DAYS = 30

# База данных (твоя строка подключения)
DATABASE_URL = "postgresql://bothost_db_1e7a3eabefbd:fuV_53wVHgUs2gES6mCA0Dh37yJInzTkuaW6bDe_BXk@node1.pghost.ru:15792/bothost_db_1e7a3eabefbd"
