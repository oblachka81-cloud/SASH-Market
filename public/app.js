// Инициализация Telegram Web App
const tg = window.Telegram.WebApp;
tg.expand(); // Разворачиваем на весь экран

// Логика переключения вкладок
const navButtons = document.querySelectorAll('.nav-btn');
const pages = document.querySelectorAll('.page');

navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        // Убираем активный класс у всех кнопок и страниц
        navButtons.forEach(b => b.classList.remove('active'));
        pages.forEach(p => p.classList.remove('active'));

        // Добавляем активный класс нажатой кнопке
        btn.classList.add('active');

        // Показываем нужную страницу с плавной анимацией
        const targetId = btn.getAttribute('data-target');
        const targetPage = document.getElementById(targetId);
        
        // Небольшая задержка, чтобы CSS успел применить display: block перед анимацией opacity
        targetPage.style.display = 'block';
        setTimeout(() => {
            targetPage.classList.add('active');
        }, 10);

        // Виброотклик при нажатии (работает в Telegram)
        if (tg.HapticFeedback) {
            tg.HapticFeedback.selectionChanged();
        }
    });
});
