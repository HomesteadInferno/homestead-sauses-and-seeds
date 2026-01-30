// === БЛОК КЕРУВАННЯ АКЦІЯМИ ===
const GLOBAL_SETTINGS = {
    isSaleActive: true,
    discountPercent: 10,
    saleDeadline: "2026-02-05",
    promoText: "ПЕКЕЛЬНИЙ ТИЖДЕНЬ: -10%!"
};

function applyGlobalSale() {
    if (!GLOBAL_SETTINGS || !GLOBAL_SETTINGS.isSaleActive) return;
    const discount = GLOBAL_SETTINGS.discountPercent;
    const cardPrices = document.querySelectorAll('.card-price');
    
    cardPrices.forEach(el => {
        const isSaleAllowed = el.getAttribute('data-allow-sale') === 'true';
        if (isSaleAllowed) {
            const basePrice = parseFloat(el.getAttribute('data-base-price'));
            if (!basePrice) return;
            const newPrice = Math.round(basePrice * (1 - discount / 100));
            el.innerHTML = `<span style="text-decoration: line-through; opacity: 0.5; font-size: 0.85em;">${basePrice} ₴</span> 
                            <span style="color: #ffeb3b; font-weight: bold; margin-left: 8px;">${newPrice} ₴</span>`;
            const card = el.closest('.product-card'); 
            if (card) {
                const cardBtn = card.querySelector('.add-btn');
                if (cardBtn) cardBtn.setAttribute('data-price', newPrice);
                if (!card.querySelector('.sale-badge')) {
                    const badge = document.createElement('div');
                    badge.className = 'sale-badge';
                    badge.innerText = 'АКЦІЯ';
                    card.style.position = 'relative';
                    card.appendChild(badge);
                }
            }
        }
    });

    const mainPriceContainer = document.getElementById('p-price');
    if (mainPriceContainer) {
        const isSaleAllowed = mainPriceContainer.getAttribute('data-allow-sale') === 'true';
        if (isSaleAllowed) {
            const basePrice = parseFloat(mainPriceContainer.getAttribute('data-val'));
            const newPrice = Math.round(basePrice * (1 - discount / 100));
            mainPriceContainer.innerHTML = `<span style="text-decoration: line-through; opacity: 0.5; font-size: 0.8em; margin-right: 10px; color: white;">${basePrice.toFixed(2)} ₴</span>
                                            <span style="color: #ffeb3b; font-weight: bold;">${newPrice.toFixed(2)} ₴</span>
                                            <span style="font-size: 16px; opacity: 0.6;">/ 5 шт.</span>`;
            const mainBtn = document.querySelector('.add-btn');
            if (mainBtn) mainBtn.setAttribute('data-price', newPrice);
        }
    }
}
document.addEventListener('DOMContentLoaded', applyGlobalSale);

// === 1. РОБОТА З ПАМ'ЯТТЮ ===
function getFreshCart() {
    try { return JSON.parse(localStorage.getItem('homestead_cart')) || []; } catch (e) { return []; }
}
function saveCart(cart) { localStorage.setItem('homestead_cart', JSON.stringify(cart)); }

// === 2. ОНОВЛЕННЯ ІНТЕРФЕЙСУ ===
function updateCartUI() {
    const cart = getFreshCart(); 
    const totalQty = cart.reduce((acc, item) => acc + item.qty, 0);
    const totalSum = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);

    document.querySelectorAll('.cart-count, #cart-count, .cart-badge').forEach(c => c.innerText = totalQty);
    
    const containers = document.querySelectorAll('#final-list, .cart-items-container');
    containers.forEach(container => {
        if (cart.length === 0) {
            container.innerHTML = '<p style="text-align: center; opacity: 0.5; padding: 10px; color: #eaddcf;">Кошик порожній</p>';
        } else {
            container.innerHTML = cart.map((item, index) => `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; color: #eaddcf;">
                    <div><b>${item.name}</b><br><small>${item.qty} шт. x ${item.price} ₴</small></div>
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span>${(item.price * item.qty).toFixed(2)} ₴</span>
                        <button onclick="removeFromCart(${index})" style="background:none; border:none; color:#ff4d4d; cursor:pointer; font-size:18px;">&times;</button>
                    </div>
                </div>`).join('');
        }
    });

    document.querySelectorAll('#final-price, .total-price-display, #cart-total').forEach(el => el.innerText = `${totalSum.toFixed(2)} ₴`);
    const orderBtn = document.querySelector('.summary-side .add-btn');
    if (orderBtn) orderBtn.style.display = (cart.length === 0) ? 'none' : 'block';
}

// === 3. КЕРУВАННЯ КОШИКОМ ===
window.openCheckout = function() {
    const cart = getFreshCart();
    if (cart.length === 0) { alert("Кошик порожній! 🌶️"); return; }
    const modal = document.getElementById('checkoutModal');
    if (modal) {
        modal.style.display = 'flex';
        document.getElementById('modal-main-content').style.display = 'grid';
        document.getElementById('success-msg').style.display = 'none';
        
        ['name', 'phone', 'city', 'branch', 'email'].forEach(f => {
            const saved = localStorage.getItem('saved_' + f);
            const el = document.getElementById(f === 'email' ? 'email' : 'cust-' + f);
            if (saved && el) el.value = saved;
        });
        updateCartUI();
    }
};

window.closeCheckout = function() {
    const modal = document.getElementById('checkoutModal');
    if (modal) modal.style.display = 'none';
};

window.removeFromCart = function(index) {
    let cart = getFreshCart();
    cart.splice(index, 1);
    saveCart(cart);
    updateCartUI();
    if (cart.length === 0) closeCheckout();
};

window.pushToCart = function() {
    const name = document.getElementById('p-name')?.innerText;
    const priceEl = document.getElementById('p-price');
    const qty = parseInt(document.getElementById('p-qty')?.value) || 1;
    const btn = document.querySelector('.add-btn');
    if (!name || !priceEl) return;

    const isSale = priceEl.getAttribute('data-allow-sale') === 'true';
    const price = isSale && btn.hasAttribute('data-price') ? parseFloat(btn.getAttribute('data-price')) : parseFloat(priceEl.getAttribute('data-val'));

    let cart = getFreshCart();
    const existing = cart.find(i => i.name === name && i.price === price);
    if (existing) existing.qty += qty; else cart.push({ name, price, qty });
    
    saveCart(cart);
    updateCartUI();
    alert("Додано у кошик! 🌶️");
};

window.clearFullCart = function() {
    if (confirm("Очистити кошик?")) { saveCart([]); updateCartUI(); closeCheckout(); }
};

// === 4. ВІДПРАВКА ЗАМОВЛЕННЯ ===
window.submitOrder = async function() {
    const fieldIds = ['cust-name', 'cust-phone', 'cust-city', 'cust-branch'];
    let hasError = false;
    fieldIds.forEach(id => {
        const input = document.getElementById(id);
        if (input && !input.value.trim()) { input.classList.add('input-error'); hasError = true; } 
        else if (input) input.classList.remove('input-error');
    });
    if (hasError) { alert("Заповніть дані доставки!"); return; }

    const name = document.getElementById('cust-name').value;
    const phone = document.getElementById('cust-phone').value;
    const city = document.getElementById('cust-city').value;
    const branch = document.getElementById('cust-branch').value;
    const email = document.getElementById('email')?.value || '';
    const comment = document.getElementById('cust-comment')?.value || '';

    localStorage.setItem('saved_name', name);
    localStorage.setItem('saved_phone', phone);
    localStorage.setItem('saved_city', city);
    localStorage.setItem('saved_branch', branch);
    if (email) localStorage.setItem('saved_email', email);

    const btn = document.querySelector('.summary-side .add-btn');
    const oldText = btn.innerHTML;
    const cart = getFreshCart();
    const sum = cart.reduce((acc, i) => acc + (i.price * i.qty), 0);
    const num = Date.now().toString().slice(-6);

    btn.disabled = true;
    btn.innerHTML = "Відправляємо...";

    let msg = `📦 №${num}\n👤 ${name}\n📞 ${phone}\n📍 ${city}, ${branch}\n`;
    if (email) msg += `📧 ${email}\n`;
    if (comment) msg += `💬 Комент: ${comment}\n`;
    msg += `\n🛒 Товари:\n` + cart.map(i => `- ${i.name} x${i.qty}`).join('\n');
    msg += `\n\n💰 РАЗОМ: ${sum.toFixed(2)} ₴`;

    try {
        fetch("https://script.google.com/macros/s/AKfycbzk1Yeg_GjGZ52KZCnmP2yf_i6jpR3AfwL2BxWT4HoE4VTkn1x_ksg9LuEm8PDS7GmH/exec", {
            method: "POST", mode: "no-cors", body: JSON.stringify({ message: msg })
        });
        setTimeout(() => {
            document.getElementById('modal-main-content').style.display = 'none';
            const s = document.getElementById('success-msg');
            s.style.display = 'block';
            s.innerHTML = `<div style="text-align:center; padding:40px 20px;">
                <h2 style="color:#6ba86b;">🌿 №${num} прийнято!</h2>
                <p>Дякуємо за замовлення!</p>
                <button class="add-btn" onclick="closeCheckout()" style="margin-top:20px;">Закрити</button>
            </div>`;
            document.querySelector('.modal-content').scrollTop = 0;
            window.scrollTo({ top: 0, behavior: 'smooth' });
            saveCart([]);
            updateCartUI();
            btn.disabled = false;
            btn.innerHTML = oldText;
        }, 800);
    } catch (e) { alert("Помилка!"); btn.disabled = false; btn.innerHTML = oldText; }
};

// === ГАЛЕРЕЯ ТА ІНШЕ ===
let currentImgIndex = 0;
window.updateView = function(img) {
    const main = document.getElementById('main-view');
    if (main) {
        main.src = img.src;
        document.querySelectorAll('.thumb-img').forEach(t => t.classList.remove('active'));
        img.classList.add('active');
    }
};

window.changeImage = function(dir) {
    const thumbs = document.querySelectorAll('.thumb-img');
    if (thumbs.length > 0) {
        currentImgIndex = (currentImgIndex + dir + thumbs.length) % thumbs.length;
        window.updateView(thumbs[currentImgIndex]);
    }
};

window.goBack = function() {
    if (window.history.length > 1) window.history.back();
    else window.location.href = 'index.html';
};

document.addEventListener('DOMContentLoaded', updateCartUI);
window.addEventListener('pageshow', updateCartUI);
