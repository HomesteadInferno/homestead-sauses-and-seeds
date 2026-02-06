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
                // Універсальний тег для смаків
if (product.isFlavor) {
    // Беремо текст прямо з властивості isFlavor
    tagsHTML += `<span class="product-tag flavor">${product.isFlavor}</span>`;
                }

                // Створюємо картку товару
                // Перевіряємо наявність (якщо в базі не вказано, вважаємо що є - true)
const isInStock = product.inStock !== false; 

// Створюємо картку товару
const cardHTML = `
    <a href="product.html?id=${id}" 
       class="product-card ${isInStock ? '' : 'out-of-stock'}" 
       data-id="${id}">
        
        <div class="product-tags">${tagsHTML}</div>
        
        <div class="img-container">
            <img src="${product.images[0]}" alt="${product.name}" 
                 style="${isInStock ? '' : 'filter: grayscale(0.8); opacity: 0.7;'}">
        </div>
        
        <div class="product-label">
            <h3 class="p-name">${product.name}</h3>
            <div class="price-row">
                <p class="card-price" style="${isInStock ? '' : 'opacity: 0.6;'}">${product.price} ₴</p>
                ${isInStock ? `
                    <button class="quick-add-btn" 
                            onclick="event.stopPropagation(); event.preventDefault(); addToCartDirectly('${id}', this); return false;">
                        🛒
                    </button>
                ` : `
                    <span style="font-size: 11px; color: var(--primary-orange); border: 1px solid rgba(214, 96, 58, 0.3); padding: 2px 6px; border-radius: 4px;">ОЧІКУЄТЬСЯ</span>
                `}
            </div>
        </div>
    </a>
`;
      container.insertAdjacentHTML('beforeend', cardHTML);
            }
        });
// ===== 3. ЛОГІКА ФІЛЬТРАЦІЇ (ДОДАЄМО СЮДИ) =====
        const filterButtons = document.querySelectorAll('.filter-btn');
        
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Видаляємо active у всіх, додаємо натиснутій
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                const selectedHeat = btn.getAttribute('data-heat');
                const cards = document.querySelectorAll('.product-card');
                
                cards.forEach(card => {
                    const productId = card.getAttribute('data-id');
                    const product = allProducts[productId];
                    
                    // Перевіряємо збіг рівня гостроти
                    // Важливо: використовуємо == для порівняння чисел і рядків
                    if (selectedHeat === 'all') {
                        card.style.display = 'flex';
                    } else if (product && String(product.heatLevel) === selectedHeat) {
                        card.style.display = 'flex';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }
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
