// Состояние приложения
let currentLang = 'ru';
let currentTab = 'buy';
let products = [];

// Локализация
const LOCALES = {
    ru: {
        buy: '🛒 Купить',
        sell: '📢 Продать',
        logistics: '🚚 Логистика',
        search: 'Поиск товаров...',
        empty: '🛒 Товары скоро появятся',
        emptyLogistics: '🚚 Отслеживание заказов скоро будет доступно',
        itemName: 'Название товара',
        itemPrice: 'Цена (руб)',
        itemDesc: 'Описание',
        itemContact: 'Контакт (телефон или @username)',
        itemPhoto: 'Фото (ссылка)',
        publish: '📢 Опубликовать'
    },
    en: {
        buy: '🛒 Buy',
        sell: '📢 Sell',
        logistics: '🚚 Logistics',
        search: 'Search products...',
        empty: '🛒 Products coming soon',
        emptyLogistics: '🚚 Order tracking coming soon',
        itemName: 'Product name',
        itemPrice: 'Price (rub)',
        itemDesc: 'Description',
        itemContact: 'Contact (phone or @username)',
        itemPhoto: 'Photo (link)',
        publish: '📢 Publish'
    },
    es: {
        buy: '🛒 Comprar',
        sell: '📢 Vender',
        logistics: '🚚 Logística',
        search: 'Buscar productos...',
        empty: '🛒 Productos próximamente',
        emptyLogistics: '🚚 Seguimiento de pedidos próximamente',
        itemName: 'Nombre del producto',
        itemPrice: 'Precio (rub)',
        itemDesc: 'Descripción',
        itemContact: 'Contacto (teléfono o @username)',
        itemPhoto: 'Foto (enlace)',
        publish: '📢 Publicar'
    },
    fr: {
        buy: '🛒 Acheter',
        sell: '📢 Vendre',
        logistics: '🚚 Logistique',
        search: 'Rechercher des produits...',
        empty: '🛒 Produits à venir',
        emptyLogistics: '🚚 Suivi des commandes à venir',
        itemName: 'Nom du produit',
        itemPrice: 'Prix (rub)',
        itemDesc: 'Description',
        itemContact: 'Contact (téléphone ou @username)',
        itemPhoto: 'Photo (lien)',
        publish: '📢 Publier'
    }
};

// Инициализация
function init() {
    setupLangButtons();
    setupTabs();
    setupSellForm();
    updateUI();
}

// Переключение языка
function setupLangButtons() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentLang = btn.dataset.lang;
            document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            updateUI();
        });
    });
}

// Переключение табов
function setupTabs() {
    document.querySelectorAll('.tab, .nav-btn').forEach(el => {
        el.addEventListener('click', () => {
            currentTab = el.dataset.tab;
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.nav-btn').forEach(n => n.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            document.querySelector(`.tab[data-tab="${currentTab}"]`)?.classList.add('active');
            document.querySelector(`.nav-btn[data-tab="${currentTab}"]`)?.classList.add('active');
            document.getElementById(`tab-${currentTab}`)?.classList.add('active');
        });
    });
}

// Форма добавления товара
function setupSellForm() {
    document.getElementById('sellForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const newProduct = {
            id: Date.now(),
            name: document.getElementById('itemName').value,
            price: document.getElementById('itemPrice').value,
            description: document.getElementById('itemDesc').value,
            contact: document.getElementById('itemContact').value,
            photo: document.getElementById('itemPhoto').value || 'https://via.placeholder.com/300x200/333/fff?text=No+Photo'
        };
        products.unshift(newProduct);
        document.getElementById('sellForm').reset();
        currentTab = 'buy';
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        document.querySelector('.tab[data-tab="buy"]').classList.add('active');
        document.getElementById('tab-buy').classList.add('active');
        renderProducts();
        updateUI();
    });
}

// Обновление интерфейса
function updateUI() {
    const loc = LOCALES[currentLang];
    document.querySelectorAll('.tab').forEach(tab => {
        const key = tab.dataset.tab;
        if (loc[key]) tab.textContent = loc[key];
    });
    document.getElementById('searchInput').placeholder = loc.search;
    
    const emptyBuy = document.querySelector('#tab-buy .empty-state');
    const emptyLog = document.querySelector('#tab-logistics .empty-state');
    if (emptyBuy) emptyBuy.textContent = loc.empty;
    if (emptyLog) emptyLog.textContent = loc.emptyLogistics;
    
    document.querySelector('.sell-form label[for="itemName"]').textContent = loc.itemName;
    document.querySelector('.sell-form label[for="itemPrice"]').textContent = loc.itemPrice;
    document.querySelector('.sell-form label[for="itemDesc"]').textContent = loc.itemDesc;
    document.querySelector('.sell-form label[for="itemContact"]').textContent = loc.itemContact;
    document.querySelector('.sell-form label[for="itemPhoto"]').textContent = loc.itemPhoto;
    document.querySelector('.submit-btn').textContent = loc.publish;
    
    renderProducts();
}

// Отрисовка товаров
function renderProducts() {
    const grid = document.getElementById('productGrid');
    if (products.length === 0) {
        grid.innerHTML = `<div class="empty-state">${LOCALES[currentLang].empty}</div>`;
        return;
    }
    grid.innerHTML = products.map(p => `
        <div class="product-card">
            <img src="${p.photo}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/300x200/333/fff?text=No+Photo'">
            <div class="info">
                <div class="name">${p.name}</div>
                <div class="price">${p.price} ₽</div>
            </div>
        </div>
    `).join('');
}

// Поиск
document.addEventListener('DOMContentLoaded', () => {
    init();
    document.getElementById('searchInput').addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const grid = document.getElementById('productGrid');
        const filtered = products.filter(p => p.name.toLowerCase().includes(query));
        if (filtered.length === 0) {
            grid.innerHTML = `<div class="empty-state">🔍 Ничего не найдено</div>`;
        } else {
            grid.innerHTML = filtered.map(p => `
                <div class="product-card">
                    <img src="${p.photo}" alt="${p.name}">
                    <div class="info">
                        <div class="name">${p.name}</div>
                        <div class="price">${p.price} ₽</div>
                    </div>
                </div>
            `).join('');
        }
    });
});
