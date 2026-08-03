// Инициализация Telegram Web App
const tg = window.Telegram.WebApp;
tg.expand();

// ============ МУЛЬТИЯЗЫЧНОСТЬ ============
let translations = {};
let currentLang = 'ru';

// Загрузка переводов
async function loadTranslations() {
    try {
        const response = await fetch('translations.json');
        translations = await response.json();
    } catch (error) {
        console.error('Ошибка загрузки переводов:', error);
        // Fallback на русский
        translations = {
            ru: {
                splash: { title: "SASH NEXUS", subtitle: "Экосистема" },
                header: { title: "SASH NEXUS" },
                tabs: {
                    marketplace: "Маркет", marketplaceDesc: "Товары из Китая",
                    logistics: "Логистика", logisticsDesc: "Трекинг грузов",
                    crypto: "Крипта", cryptoDesc: "Обмен и кошелёк",
                    tourism: "Туризм", tourismDesc: "Туры и путешествия",
                    wallet: "Кошелёк", walletDesc: "Баланс и транзакции",
                    profile: "Профиль", profileDesc: "Настройки и информация"
                },
                placeholder: { developing: "Раздел в разработке" },
                footer: { text: "SASH NEXUS © 2026", subtext: "Все права защищены" }
            }
        };
    }
}

// Определение языка (гибридная система)
function detectLanguage() {
    // 1. Проверяем сохранённый выбор пользователя
    const savedLang = localStorage.getItem('sash_nexus_lang');
    if (savedLang && translations[savedLang]) {
        return savedLang;
    }
    
    // 2. Проверяем настройки Telegram
    if (tg.initDataUnsafe && tg.initDataUnsafe.user && tg.initDataUnsafe.user.language_code) {
        const tgLang = tg.initDataUnsafe.user.language_code;
        if (tgLang === 'ru' || tgLang === 'en' || tgLang === 'zh') {
            return tgLang;
        }
    }
    
    // 3. По умолчанию русский
    return 'ru';
}

// Применение переводов
function applyTranslations(lang) {
    currentLang = lang;
    localStorage.setItem('sash_nexus_lang', lang);
    
    const t = translations[lang];
    if (!t) return;
    
    // Обновляем все элементы с data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const keys = key.split('.');
        let value = t;
        for (const k of keys) {
            if (value && value[k]) {
                value = value[k];
            } else {
                value = null;
                break;
            }
        }
        if (value) {
            el.textContent = value;
        }
    });
    
    // Обновляем отображение текущего языка
    const langNames = { ru: '🇷🇺 RU', en: '🇬🇧 EN', zh: '🇨🇳 CN' };
    document.getElementById('langCurrent').textContent = langNames[lang] || '🇷🇺 RU';
    
    // Подсвечиваем активный язык в dropdown
    document.querySelectorAll('.lang-option').forEach(opt => {
        opt.classList.toggle('active', opt.getAttribute('data-lang') === lang);
    });
}

// Инициализация переключателя языка
function initLangSwitcher() {
    const switcher = document.getElementById('langSwitcher');
    const dropdown = document.getElementById('langDropdown');
    const options = document.querySelectorAll('.lang-option');
    
    // Открытие/закрытие dropdown
    switcher.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('show');
    });
    
    // Закрытие при клике вне
    document.addEventListener('click', () => {
        dropdown.classList.remove('show');
    });
    
    // Выбор языка
    options.forEach(opt => {
        opt.addEventListener('click', (e) => {
            e.stopPropagation();
            const lang = opt.getAttribute('data-lang');
            applyTranslations(lang);
            dropdown.classList.remove('show');
            
            // Виброотклик
            if (tg.HapticFeedback) {
                tg.HapticFeedback.selectionChanged();
            }
        });
    });
}

// ============ SPLASH SCREEN ============
const splash = document.getElementById('splash');
const mainApp = document.getElementById('main-app');

setTimeout(() => {
    splash.classList.add('fade-out');
    setTimeout(() => {
        splash.style.display = 'none';
        mainApp.classList.remove('hidden');
        mainApp.classList.add('visible');
    }, 800);
}, 5000);

// ============ ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК ============
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        // Убираем активный класс у всех кнопок
        tabButtons.forEach(b => b.classList.remove('active'));
        tabContents.forEach(t => t.classList.remove('active'));
        
        // Активируем нажатую кнопку
        btn.classList.add('active');
        
        // Показываем нужную вкладку
        const targetTab = btn.getAttribute('data-tab');
        document.getElementById('tab-' + targetTab).classList.add('active');
        
        // Виброотклик
        if (tg.HapticFeedback) {
            tg.HapticFeedback.selectionChanged();
        }
    });
});
// ============ ЛОГИКА ТУРИЗМА ============
const serviceBtns = document.querySelectorAll('.service-btn');
const searchFields = document.getElementById('search-fields');

// Шаблоны форм для разных сервисов
const formTemplates = {
    flights: `
        <div class="input-row">
            <div class="input-group">
                <label data-i18n="tourism.from">Откуда</label>
                <input type="text" placeholder="Пекин (PEK)" value="Пекин (PEK)">
            </div>
            <div class="input-group">
                <label data-i18n="tourism.to">Куда</label>
                <input type="text" placeholder="Москва (MOW)" value="Москва (MOW)">
            </div>
        </div>
        <div class="input-row">
            <div class="input-group full-width">
                <label data-i18n="tourism.dates">Даты</label>
                <input type="text" placeholder="15 Окт - 22 Окт" value="15 Окт - 22 Окт">
            </div>
        </div>
    `,
    hotels: `
        <div class="input-row">
            <div class="input-group full-width">
                <label data-i18n="tourism.destination">Направление</label>
                <input type="text" placeholder="Москва, Россия" value="Москва, Россия">
            </div>
        </div>
        <div class="input-row">
            <div class="input-group">
                <label data-i18n="tourism.checkin">Заезд</label>
                <input type="text" placeholder="15 Окт" value="15 Окт">
            </div>
            <div class="input-group">
                <label data-i18n="tourism.checkout">Выезд</label>
                <input type="text" placeholder="20 Окт" value="20 Окт">
            </div>
        </div>
    `,
    trains: `
        <div class="input-row">
            <div class="input-group">
                <label data-i18n="tourism.from">Откуда</label>
                <input type="text" placeholder="Москва" value="Москва">
            </div>
            <div class="input-group">
                <label data-i18n="tourism.to">Куда</label>
                <input type="text" placeholder="Санкт-Петербург" value="Санкт-Петербург">
            </div>
        </div>
        <div class="input-row">
            <div class="input-group full-width">
                <label data-i18n="tourism.date">Дата</label>
                <input type="text" placeholder="15 Окт" value="15 Окт">
            </div>
        </div>
    `,
    tours: `
        <div class="input-row">
            <div class="input-group full-width">
                <label data-i18n="tourism.destination">Направление</label>
                <input type="text" placeholder="Байкал, Россия" value="Байкал, Россия">
            </div>
        </div>
        <div class="input-row">
            <div class="input-group full-width">
                <label data-i18n="tourism.dates">Даты тура</label>
                <input type="text" placeholder="Любые даты" value="Любые даты">
            </div>
        </div>
    `
};

serviceBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Убираем активный класс у всех кнопок сервисов
        serviceBtns.forEach(b => b.classList.remove('active'));
        // Добавляем нажатой
        btn.classList.add('active');
        
        // Меняем форму
        const service = btn.getAttribute('data-service');
        if (formTemplates[service]) {
            searchFields.innerHTML = formTemplates[service];
            // Переприменяем переводы для новых полей
            applyTranslations(currentLang); 
        }

        // Виброотклик
        if (tg.HapticFeedback) {
            tg.HapticFeedback.selectionChanged();
        }
    });
});

// ============ ИНИЦИАЛИЗАЦИЯ ============
async function init() {
    await loadTranslations();
    const lang = detectLanguage();
    applyTranslations(lang);
    initLangSwitcher();
}

init();
