
//БЛОК КЕРУВАННЯ АКЦІЯМИ.
// 1. НАЛАШТУВАННЯ
const GLOBAL_SETTINGS = {
    isSaleActive: false, 
    discountPercent: 10, 
    saleDeadline: "2026-02-05", 
    promoText: "ПЕКЕЛЬНИЙ ТИЖДЕНЬ: -10%!"
};

// 2. ЦІНИ ТА АКЦІЇ
function applyGlobalSale() {
    const discount = GLOBAL_SETTINGS.isSaleActive ? GLOBAL_SETTINGS.discountPercent : 0;

    // Картки в каталозі
    document.querySelectorAll('.card-price').forEach(el => {
        const isSaleAllowed = el.getAttribute('data-allow-sale') === 'true';
        const basePrice = parseFloat(el.getAttribute('data-base-price'));
        if (!basePrice) return;

        if (GLOBAL_SETTINGS.isSaleActive && isSaleAllowed) {
            const newPrice = Math.round(basePrice * (1 - discount / 100));
            el.innerHTML = `<span style="text-decoration: line-through; opacity: 0.5;">${basePrice} ₴</span> <span style="color: #ffeb3b; font-weight: bold; margin-left: 8px;">${newPrice} ₴</span>`;
            const card = el.closest('.product-card');
            if (card) {
                const cardBtn = card.querySelector('.quick-add-btn');
                if (cardBtn) cardBtn.setAttribute('data-price', newPrice);
            }
        }
    });

    // Ціна на сторінці товару
    const mainPriceContainer = document.getElementById('p-price');
    if (mainPriceContainer) {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');
        const currentProduct = (typeof allProducts !== 'undefined') ? allProducts[productId] : null;
        const unitLabel = (currentProduct && currentProduct.meta && currentProduct.meta.count) ? `/ ${currentProduct.meta.count}` : `/ шт.`;
        
        const basePrice = parseFloat(mainPriceContainer.getAttribute('data-val')) || 0;
        const isSaleAllowed = mainPriceContainer.getAttribute('data-allow-sale') === 'true';

        if (GLOBAL_SETTINGS.isSaleActive && isSaleAllowed) {
            const newPrice = Math.round(basePrice * (1 - discount / 100));
            mainPriceContainer.innerHTML = `<span style="text-decoration: line-through; opacity: 0.5; font-size: 0.8em; margin-right: 10px; color: white;">${basePrice.toFixed(2)} ₴</span><span style="color: #ffeb3b; font-weight: bold;">${newPrice.toFixed(2)} ₴</span><span style="font-size: 16px; opacity: 0.6;"> ${unitLabel}</span>`;
            const addBtn = document.querySelector('.add-btn');
            if (addBtn) addBtn.setAttribute('data-price', newPrice);
        } else {
            mainPriceContainer.innerHTML = `<span style="color: #ffeb3b; font-weight: bold;">${basePrice.toFixed(2)} ₴</span><span style="font-size: 16px; opacity: 0.6;"> ${unitLabel}</span>`;
        }
    }
}
document.addEventListener('DOMContentLoaded', applyGlobalSale);

// 3. КОШИК
function getFreshCart() { try { return JSON.parse(localStorage.getItem('homestead_cart')) || []; } catch (e) { return []; } }
function saveCart(cart) { localStorage.setItem('homestead_cart', JSON.stringify(cart)); }

function updateCartUI() {
    const cart = getFreshCart(); 
    const totalSum = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
    document.querySelectorAll('.cart-count, #cart-count').forEach(c => { c.innerText = cart.reduce((a, b) => a + b.qty, 0); });
    
    const container = document.getElementById('final-list') || document.querySelector('.cart-items-container');
    if (container) {
        container.innerHTML = cart.length === 0 ? '<p>Порожньо</p>' : cart.map((item, idx) => `
            <div style="display:flex; justify-content:space-between; margin-bottom:10px; color:#eaddcf; border-bottom:1px solid #333;">
                <div><b>${item.name}</b><br><small>${item.qty} x ${item.price} ₴</small></div>
                <button onclick="removeFromCart(${idx})" style="background:none; border:none; color:red; cursor:pointer;">&times;</button>
            </div>`).join('');
    }
    document.querySelectorAll('#final-price, #cart-total').forEach(el => el.innerText = `${totalSum.toFixed(2)} ₴`);
}

window.addToCartDirectly = function(id, btn) {
    const product = allProducts[id];
    if (!product) return;
    let cart = getFreshCart();
    const price = btn.hasAttribute('data-price') ? parseFloat(btn.getAttribute('data-price')) : product.price;
    const existing = cart.find(i => i.name === product.name);
    if (existing) { existing.qty += 1; } else { cart.push({ name: product.name, price: price, qty: 1 }); }
    saveCart(cart); updateCartUI(); alert(`🌶️ ${product.name} додано!`);
};

window.removeFromCart = function(index) {
    let cart = getFreshCart(); cart.splice(index, 1);
    saveCart(cart); updateCartUI();
};

window.openCheckout = function() { 
    document.getElementById('checkoutModal').style.display = 'flex'; 
    updateCartUI(); 
};
window.closeCheckout = function() { document.getElementById('checkoutModal').style.display = 'none'; };

// 4. ВІДПРАВКА ЗАМОВЛЕННЯ (ОНОВЛЕНО: ОПЛАТА ТУТ)
window.submitOrder = async function() {
    const cart = getFreshCart();
    if (cart.length === 0) {
        alert("Кошик порожній!");
        return;
    }

    // 1. Отримуємо дані з полів (включаючи оплату)
    const data = {
        name: document.getElementById('cust-name').value.trim(),
        phone: document.getElementById('cust-phone').value.trim(),
        city: document.getElementById('cust-city').value.trim(),
        branch: document.getElementById('cust-branch').value.trim(),
        payment: document.getElementById('cust-payment')?.value || "Не вказано",
        comment: document.getElementById('cust-comment')?.value.trim() || "-"
    };

    // 2. Перевірка обов'язкових полів
    if (!data.name || !data.phone || !data.city) { 
        alert("Будь ласка, заповніть дані доставки!"); 
        return; 
    }

    const submitBtn = document.querySelector('#checkoutModal .add-btn');
    const originalText = submitBtn.innerHTML;
    const totalSum = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
    
    // ГЕНЕРУЄМО НОМЕР ЗАМОВЛЕННЯ (ось він!)
    const currentNum = Date.now().toString().slice(-6);

    submitBtn.disabled = true;
    submitBtn.innerText = "Відправляємо...";

    // 3. Формуємо текст для Telegram/Google Sheets
    let orderText = `📦 ЗАМОВЛЕННЯ №${currentNum}\n👤 ${data.name}\n📞 ${data.phone}\n📍 ${data.city}, ${data.branch}\n💳 ОПЛАТА: ${data.payment}\n💬 Коментар: ${data.comment}\n\n🛒 Товари:\n`;
    orderText += cart.map(i => `- ${i.name} (${i.price} ₴) x ${i.qty}`).join("\n");
    orderText += `\n\n💰 РАЗОМ: ${totalSum.toFixed(2)} ₴`;

    try {
        // 4. Відправка
        await fetch("https://script.google.com/macros/s/AKfycbzk1Yeg_GjGZ52KZCnmP2yf_i6jpR3AfwL2BxWT4HoE4VTkn1x_ksg9LuEm8PDS7GmH/exec", {
            method: "POST", 
            mode: "no-cors", 
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: orderText })
        });
        
        // 5. ПОКАЗУЄМО УСПІХ (Твоя гарна кінцівка)
        document.getElementById('modal-main-content').style.display = 'none';
        const successMsg = document.getElementById('success-msg');
        successMsg.style.display = 'block';
        successMsg.innerHTML = `
            <div style="padding: 40px 20px; text-align: center;">
                <h2 style="color: #6ba86b;">🌿 Замовлення №${currentNum} прийнято!</h2>
                <p>Дякуємо, ми скоро зв'яжемося з Вами для підтвердження.</p>
                <button class="add-btn" onclick="location.reload()" style="margin-top:20px;">На головну</button>
            </div>`;
        
        // Очищення
        saveCart([]);
        updateCartUI();

    } catch (e) {
        alert("Помилка відправки. Спробуйте ще раз або напишіть нам у месенджер.");
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
};
