document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('catalog-container');
    const mainGrid = document.querySelector('.products-grid');
    
    // 1. Перевірка наявності бази та контейнера
    if (!container || typeof allProducts === 'undefined') {
        console.error("База allProducts не знайдена або відсутній контейнер!");
        return;
    }

    // 2. Отримуємо категорію (наприклад, "sauces")
    const pageCategory = mainGrid ? mainGrid.getAttribute('data-category') : null;

    container.innerHTML = ''; // Чистимо від старого контенту

    // 3. Цикл по товарах
    Object.keys(allProducts).forEach(id => {
        const product = allProducts[id];

        // 4. Фільтрація: показуємо, якщо категорія збігається
        if (!pageCategory || product.category === pageCategory) {
            
            // Формуємо теги (якщо є)
            let tagsHTML = product.isNew ? '<span class="product-tag">NEW</span>' : '';

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
});

function goBack() {
    window.history.back();
}
document.addEventListener('DOMContentLoaded', () => {
    // Отримуємо назву поточного файлу з адресної стрічки (наприклад, "sauses.html")
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