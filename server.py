import telebot
from telebot import types
from config import BOT_TOKEN, ADMIN_ID, LANGUAGES
from database import init_db, get_user_lang, set_user_lang

bot = telebot.TeleBot(BOT_TOKEN)

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
        "support": "ℹ️ Поддержка",
        "in_dev": "🚧 Раздел в разработке. Скоро здесь будет кое-что грандиозное!",
        "profile_info": "👤 *Профиль*\n\nID: `{user_id}`\nЯзык: {lang}",
        "support_info": "ℹ️ *Поддержка SASH*\n\nПо всем вопросам: @brotherly_heart1"
    },
    "en": {
        "welcome": "🌟 *Welcome to SASH Market!*\n\nGlobal trading ecosystem.\nChoose language:",
        "lang_set": "✅ Language: English",
        "main_menu": "🏠 *Main Menu*\n\nWhat do you want to do?",
        "buy": "🛒 Buy",
        "sell": "📢 Sell",
        "logistics": "🚚 Logistics",
        "profile": "👤 Profile",
        "support": "ℹ️ Support",
        "in_dev": "🚧 Section under development. Something huge is coming!",
        "profile_info": "👤 *Profile*\n\nID: `{user_id}`\nLanguage: {lang}",
        "support_info": "ℹ️ *SASH Support*\n\nFor any questions: @brotherly_heart1"
    },
    "es": {
        "welcome": "🌟 *¡Bienvenido a SASH Market!*\n\nEcosistema comercial global.\nElija idioma:",
        "lang_set": "✅ Idioma: Español",
        "main_menu": "🏠 *Menú Principal*\n\n¿Qué desea hacer?",
        "buy": "🛒 Comprar",
        "sell": "📢 Vender",
        "logistics": "🚚 Logística",
        "profile": "👤 Perfil",
        "support": "ℹ️ Soporte",
        "in_dev": "🚧 Sección en desarrollo. ¡Algo enorme se acerca!",
        "profile_info": "👤 *Perfil*\n\nID: `{user_id}`\nIdioma: {lang}",
        "support_info": "ℹ️ *Soporte SASH*\n\nPara cualquier pregunta: @brotherly_heart1"
    },
    "fr": {
        "welcome": "🌟 *Bienvenue sur SASH Market!*\n\nÉcosystème commercial mondial.\nChoisissez la langue:",
        "lang_set": "✅ Langue: Français",
        "main_menu": "🏠 *Menu Principal*\n\nQue voulez-vous faire?",
        "buy": "🛒 Acheter",
        "sell": "📢 Vendre",
        "logistics": "🚚 Logistique",
        "profile": "👤 Profil",
        "support": "ℹ️ Assistance",
        "in_dev": "🚧 Section en développement. Quelque chose d'énorme arrive!",
        "profile_info": "👤 *Profil*\n\nID: `{user_id}`\nLangue: {lang}",
        "support_info": "ℹ️ *Assistance SASH*\n\nPour toute question: @brotherly_heart1"
    }
}

def get_text(user_id, key, **kwargs):
    """Получить текст на языке пользователя"""
    lang = get_user_lang(user_id)
    text = TEXTS.get(lang, TEXTS["ru"]).get(key, key)
    return text.format(**kwargs) if kwargs else text

@bot.message_handler(commands=['start'])
def start(message):
    user_id = message.from_user.id
    username = message.from_user.username
    set_user_lang(user_id, username, "ru")
    
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
    username = call.from_user.username
    lang = call.data.split("_")[1]
    set_user_lang(user_id, username, lang)
    
    bot.answer_callback_query(call.id, get_text(user_id, "lang_set"))
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
        bot.send_message(message.chat.id, get_text(user_id, "in_dev"), parse_mode="Markdown")
    elif text == get_text(user_id, "sell"):
        bot.send_message(message.chat.id, get_text(user_id, "in_dev"), parse_mode="Markdown")
    elif text == get_text(user_id, "logistics"):
        bot.send_message(message.chat.id, get_text(user_id, "in_dev"), parse_mode="Markdown")
    elif text == get_text(user_id, "profile"):
        lang = get_user_lang(user_id)
        bot.send_message(message.chat.id, get_text(user_id, "profile_info", user_id=user_id, lang=lang), parse_mode="Markdown")
    elif text == get_text(user_id, "support"):
        bot.send_message(message.chat.id, get_text(user_id, "support_info"), parse_mode="Markdown")

# Запуск
init_db()
print("🚀 SASH Market запущен с БД!")
bot.polling(none_stop=True)
