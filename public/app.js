// Инициализация Telegram Web App
const tg = window.Telegram.WebApp;
tg.expand();

// Логика Splash Screen (5 секунд)
const splash = document.getElementById('splash');
const mainApp = document.getElementById('main-app');

setTimeout(() => {
    // Fade out splash
    splash.classList.add('fade-out');
    
    // Показываем главное приложение
    setTimeout(() => {
        splash.style.display = 'none';
        mainApp.classList.remove('hidden');
        mainApp.classList.add('visible');
    }, 800);
}, 5000);

// Переключение вкладок
const navButtons = document.querySelectorAll('.nav-btn');
const tabContents = document.querySelectorAll('.tab-content');

navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        // Убираем активный класс у всех
        navButtons.forEach(b => b.classList.remove('active'));
        tabContents.forEach(t => t.classList.remove('active'));
        
        // Активируем нажатую кнопку
        btn.classList.add('active');
        
        // Показываем нужную вкладку
        const targetTab = btn.getAttribute('data-tab');
        document.getElementById(targetTab).classList.add('active');
        
        // Виброотклик
        if (tg.HapticFeedback) {
            tg.HapticFeedback.selectionChanged();
        }
    });
});
