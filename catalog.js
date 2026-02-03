document.addEventListener('DOMContentLoaded', () => {
    // ===== 1. ГЕНЕРАЦІЯ КАТАЛОГУ =====
    const container = document.getElementById('catalog-container');
    const mainGrid = document.querySelector('.products-grid');
    
    // Перевірка наявності бази та контейнера
    if (container && typeof allProducts !== 'undefined') {
        // Отримуємо категорію сторінки (наприклад, "sauces" або "seeds")
        const pageCategory = mainGrid ? mainGrid.getAttribute('data-category') : null;

        container.innerHTML = ''; // Чистимо контейнер

        // Цикл по всіх товарах
        Object.keys(allProducts).forEach(id => {
            const product = allProducts[id];

            // Фільтрація: показуємо товар, якщо категорія збігається (або якщо категорії немає)
            if (!pageCategory || product.category === pageCategory) {
                
                // Формуємо теги (якщо є)
                let tagsHTML = '';
                if (product.isNew) {
                    tagsHTML += '<span class="product-tag">NEW</span>';
                }
                if (product.isHot) {
                    tagsHTML += '<span class="product-tag hot">🔥 HOT</span>';
                }
                if (product.isCitrus) {
                    tagsHTML += '<span class="product-tag citrus">🍋 Цитрус</span>';
                }

                // Створюємо картку товару
                const cardHTML = `
                    <a href="product.html?id=${id}" class="product-card" data-id="${id}">
                        <div class="product-tags">${tagsHTML}</div>
                        <div class="img-container">
                            <img src="${product.images[0]}" alt="${product.name}">
                        </div>
                        <div class="product-label">
                            <h3 class="p-name">${product.name}</h3>
                            <div class="price-row">
                                <p class="card-price">${product.price} ₴</p>
                                <button class="quick-add-btn" 
                                        onclick="event.stopPropagation(); event.preventDefault(); addToCartDirectly('${id}', this); return false;">
                                    🛒
                                </button>
                            </div>
                        </div>
                    </a>
                `;
                container.insertAdjacentHTML('beforeend', cardHTML);
            }
        });
    }

    // ===== 2. ПІДСВІТКА АКТИВНОГО ПУНКТУ МЕНЮ =====
    // Отримуємо назву поточного файлу (наприклад, "sauces.html")
    const currentPath = window.location.pathname.split("/").pop();

    // Знаходимо всі посилання в бічному меню
    const navLinks = document.querySelectorAll('.sidebar nav ul li a');

    navLinks.forEach(link => {
        // Якщо посилання веде на поточну сторінку — додаємо клас active
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
});

// Функція для кнопки "Назад"
function goBack() {
    if (window.history.length > 1) {
        window.history.back();
    } else {
        window.location.href = 'index.html';
    }
}
