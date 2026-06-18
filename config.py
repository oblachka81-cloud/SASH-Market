import os
from dotenv import load_dotenv

load_dotenv()

# Токен бота из переменных окружения
BOT_TOKEN = os.getenv("BOT_TOKEN", "ВСТАВЬ_СВОЙ_ТОКЕН_СЮДА")

# ID админа (Саша)
ADMIN_ID = 5116812153  # Замени на Telegram ID Саши, когда узнаешь

# Поддерживаемые языки
LANGUAGES = {
    "ru": "🇷🇺 Русский",
    "en": "🇬🇧 English",
    "es": "🇪🇸 Español",
    "fr": "🇫🇷 Français"
}

# Настройки площадки
PLACEMENT_FEE = 100  # Цена размещения объявления (руб/мес)
MAX_LISTINGS_PER_USER = 3  # Максимум объявлений от одного продавца
LISTING_DURATION_DAYS = 30  # Длительность объявления

# Настройки БД
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/sash_db")
