import telebot
from telebot import types
from config import BOT_TOKEN, ADMIN_ID, LANGUAGES

bot = telebot.TeleBot(BOT_TOKEN)

# Временное хранилище языка (пока без БД)
user_lang = {}

# Главные тексты на 4 языках
TEXTS = {
    "ru": {
        "welcome": "🌟 *Добро пожаловать в SASH Market!*\n\nГлобальная торговая экосистема.\nВыберите язык:",
        "lang_set": "✅ Язык: Русский",
        "main_menu": "🏠 *Главное меню*\n\nЧто хотите сделать?",
        "buy": "🛒 Купить",
        "sell": "📢 Продать",
        "logistics": "🚚 Логистика",
        "profile": "👤 Профиль",
        "support": "ℹ️ Поддержка"
    },
    "en": {
        "welcome": "🌟 *Welcome to SASH Market!*\n\nGlobal trading ecosystem.\nChoose language:",
        "lang_set": "✅ Language: English",
        "main_menu": "🏠 *Main Menu*\n\nWhat do you want to do?",
        "buy": "🛒 Buy",
        "sell": "📢 Sell",
        "logistics": "🚚 Logistics",
        "profile": "👤 Profile",
        "support": "ℹ️ Support"
    },
    "es": {
        "welcome": "🌟 *¡Bienvenido a SASH Market!*\n\nEcosistema comercial global.\nElija idioma:",
        "lang_set": "✅ Idioma: Español",
        "main_menu": "🏠 *Menú Principal*\n\n¿Qué desea hacer?",
        "buy": "🛒 Comprar",
        "sell": "📢 Vender",
        "logistics": "🚚 Logística",
        "profile": "👤 Perfil",
        "support": "ℹ️ Soporte"
    },
    "fr": {
        "welcome": "🌟 *Bienvenue sur SASH Market!*\n\nÉcosystème commercial mondial.\nChoisissez la langue:",
        "lang_set": "✅ Langue: Français",
        "main_menu": "🏠 *Menu Principal*\n\nQue voulez-vous faire?",
        "buy": "🛒 Acheter",
        "sell": "📢 Vendre",
        "logistics": "🚚 Logistique",
        "profile": "👤 Profil",
        "support": "ℹ️ Assistance"
    }
}

def get_text(user_id, key):
    """Получить текст на языке пользователя"""
    lang = user_lang.get(user_id, "ru")
    return TEXTS.get(lang, TEXTS["ru"]).get(key, key)

@bot.message_handler(commands=['start'])
def start(message):
    user_id = message.from_user.id
    user_lang[user_id] = "ru"
    
    keyboard = types.InlineKeyboardMarkup(row_width=2)
    keyboard.add(
        types.InlineKeyboardButton("🇷🇺 Русский", callback_data="lang_ru"),
        types.InlineKeyboardButton("🇬🇧 English", callback_data="lang_en")
    )
    keyboard.add(
        types.InlineKeyboardButton("🇪🇸 Español", callback_data="lang_es"),
        types.InlineKeyboardButton("🇫🇷 Français", callback_data="lang_fr")
    )
    
    bot.send_message(message.chat.id, TEXTS["ru"]["welcome"], parse_mode="Markdown", reply_markup=keyboard)

@bot.callback_query_handler(func=lambda call: call.data.startswith("lang_"))
def set_language(call):
    user_id = call.from_user.id
    lang = call.data.split("_")[1]
    user_lang[user_id] = lang
    
    bot.answer_callback_query(call.id, TEXTS[lang]["lang_set"])
    show_main_menu(user_id, call.message.chat.id)

def show_main_menu(user_id, chat_id):
    """Показать главное меню"""
    keyboard = types.ReplyKeyboardMarkup(resize_keyboard=True, row_width=2)
    keyboard.add(
        get_text(user_id, "buy"),
        get_text(user_id, "sell")
    )
    keyboard.add(
        get_text(user_id, "logistics"),
        get_text(user_id, "profile")
    )
    keyboard.add(get_text(user_id, "support"))
    
    bot.send_message(chat_id, get_text(user_id, "main_menu"), parse_mode="Markdown", reply_markup=keyboard)

@bot.message_handler(func=lambda msg: True)
def handle_menu(message):
    user_id = message.from_user.id
    text = message.text
    
    if text == get_text(user_id, "buy"):
        bot.send_message(message.chat.id, "🛒 *Каталог товаров*\n\nЭтот раздел в разработке. Скоро здесь будут товары из Китая!", parse_mode="Markdown")
    elif text == get_text(user_id, "sell"):
        bot.send_message(message.chat.id, "📢 *Разместить объявление*\n\nЭтот раздел в разработке. Скоро вы сможете продавать здесь!", parse_mode="Markdown")
    elif text == get_text(user_id, "logistics"):
        bot.send_message(message.chat.id, "🚚 *Логистика*\n\nЭтот раздел в разработке. Отслеживание доставки будет здесь!", parse_mode="Markdown")
    elif text == get_text(user_id, "profile"):
        bot.send_message(message.chat.id, f"👤 *Профиль*\n\nID: `{user_id}`\nЯзык: {user_lang.get(user_id, 'ru')}", parse_mode="Markdown")
    elif text == get_text(user_id, "support"):
        bot.send_message(message.chat.id, "ℹ️ *Поддержка SASH*\n\nПо всем вопросам: @brotherly_heart1", parse_mode="Markdown")

print("🚀 SASH Market запущен!")
bot.polling(none_stop=True)
