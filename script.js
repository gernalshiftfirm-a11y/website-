/* ==========================================================
   Satija's Bakers & Cafe — Premium Bakery Website JS
   ========================================================== */

(() => {
  'use strict';

  /* =========================================================
     1) SHOP + MENU DATA — loaded from menu-data.js
     ========================================================= */
  const SHOP  = window.SATIJA_SHOP;
  const MENU  = window.SATIJA_MENU;
  const ICONS = window.SATIJA_ICONS;

  if (!SHOP || !MENU || !ICONS) {
    console.error('Satija: menu-data.js must be loaded before script.js');
    return;
  }

  /* =========================================================
     3) HELPERS & STATE
     ========================================================= */
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const fmt = n => '₹' + Math.round(n).toLocaleString('en-IN');

  let cart = JSON.parse(localStorage.getItem('satija_cart') || '[]');
  let activeCategory = 'All';
  let menuQuery = '';

  const saveCart = () => localStorage.setItem('satija_cart', JSON.stringify(cart));

  function toast(msg, icon = 'fa-circle-check') {
    const t = $('#toast');
    t.innerHTML = `<i class="fa-solid ${icon}"></i> ${msg}`;
    t.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove('show'), 2200);
  }

  /* =========================================================
     4) LOADING SCREEN
     ========================================================= */
  window.addEventListener('load', () => {
    setTimeout(() => $('#loader').classList.add('hidden'), 600);
  });

  /* =========================================================
     5) THEME TOGGLE
     ========================================================= */
  const savedTheme = localStorage.getItem('satija_theme');
  if (savedTheme) document.documentElement.setAttribute('data-theme', savedTheme);

  function updateThemeIcon() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    $$('#themeBtn i, #themeBtnMobile i').forEach(i => {
      i.className = isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    });
  }
  updateThemeIcon();

  function toggleTheme() {
    const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = cur === 'dark' ? 'light' : 'dark';
    if (next === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
    else document.documentElement.removeAttribute('data-theme');
    localStorage.setItem('satija_theme', next);
    updateThemeIcon();
  }
  $('#themeBtn')?.addEventListener('click', toggleTheme);
  $('#themeBtnMobile')?.addEventListener('click', toggleTheme);

  /* =========================================================
     6) MOBILE DRAWER
     ========================================================= */
  const drawer = $('#mobileDrawer');
  $('#menuToggle')?.addEventListener('click', () => drawer.classList.add('open'));
  $('#mobileDrawerClose')?.addEventListener('click', () => drawer.classList.remove('open'));
  drawer?.addEventListener('click', (e) => {
    if (e.target.classList.contains('mobile-drawer-bg') || e.target.closest('a:not(.icon-btn)')) {
      drawer.classList.remove('open');
    }
  });

  /* =========================================================
     7) RENDER MENU
     ========================================================= */
  const tabsEl = $('#menuTabs');
  const gridEl = $('#menuGrid');

  function renderTabs() {
    const cats = ['All', ...new Set(MENU.map(m => m.category))];
    tabsEl.innerHTML = cats.map(c => `
      <button class="menu-tab ${c === activeCategory ? 'active' : ''}" data-cat="${c}">
        <i class="${c === 'All' ? 'fa-solid fa-layer-group' : (ICONS[c] || 'fa-solid fa-utensils')}"></i> ${c}
      </button>
    `).join('');
    $$('.menu-tab', tabsEl).forEach(t => {
      t.addEventListener('click', () => {
        activeCategory = t.dataset.cat;
        renderTabs();
        renderMenu();
      });
    });
  }

  function renderMenu() {
    const q = menuQuery.trim().toLowerCase();
    const list = MENU.filter(m =>
      (activeCategory === 'All' || m.category === activeCategory) &&
      (!q || m.name.toLowerCase().includes(q) || (m.desc && m.desc.toLowerCase().includes(q)))
    );

    if (!list.length) {
      gridEl.innerHTML = `
        <div class="menu-empty">
          <i class="fa-regular fa-face-frown"></i>
          <h4>Nothing matches that search</h4>
          <p>Try a different keyword or category.</p>
        </div>`;
      return;
    }

    gridEl.innerHTML = list.map(m => `
      <article class="menu-card" data-id="${m.id}">
        <span class="veg-mark" title="Vegetarian"></span>
        <div class="emoji">${m.emoji}</div>
        <h4>${m.name}</h4>
        <p class="desc">${m.desc || ''}</p>
        <div class="row">
          <span class="price">${fmt(m.price)}</span>
          <button class="add-btn" aria-label="Add ${m.name} to cart">
            <i class="fa-solid fa-plus"></i>
          </button>
        </div>
      </article>
    `).join('');

    // 3D hover tilt
    $$('.menu-card', gridEl).forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const px = ((e.clientX - r.left) / r.width) * 100;
        const py = ((e.clientY - r.top) / r.height) * 100;
        card.style.setProperty('--mx', px + '%');
        card.style.setProperty('--my', py + '%');
      });
      card.addEventListener('click', () => addToCart(card.dataset.id));
    });
  }

  $('#menuSearch')?.addEventListener('input', e => {
    menuQuery = e.target.value;
    renderMenu();
  });

  /* =========================================================
     8) CAKES SHOWCASE (separate visual section)
     ========================================================= */
  function renderCakeShowcase() {
    const cakes = MENU.filter(m => m.category === 'Cakes' || m.category === 'Bento Cakes');
    const el = $('#cakeShowcase');
    if (!el) return;
    el.innerHTML = cakes.map((c, i) => `
      <article class="cake-tile" data-id="${c.id}">
        ${i < 3 ? `<span class="ribbon">${['BESTSELLER', 'NEW', 'POPULAR'][i]}</span>` : ''}
        <div class="emoji">${c.emoji}</div>
        <h4>${c.name}</h4>
        <p class="muted" style="font-size:.82rem;">${c.desc || ''}</p>
        <div class="price">${fmt(c.price)} <small>onwards</small></div>
        <button class="order-btn">
          <i class="fa-solid fa-cart-plus"></i> Add to Cart
        </button>
      </article>
    `).join('');
    $$('.cake-tile', el).forEach(t => {
      t.addEventListener('click', () => addToCart(t.dataset.id));
    });
  }

  /* =========================================================
     9) COMBOS
     ========================================================= */
  function renderCombos() {
    const combos = MENU.filter(m => m.category === 'Combos');
    const el = $('#combosGrid');
    if (!el) return;
    el.innerHTML = combos.map(c => `
      <article class="combo-card" data-id="${c.id}">
        <span class="icon">${c.emoji}</span>
        <h4>${c.name}</h4>
        <p class="desc">${c.desc || ''}</p>
        <div class="price">${fmt(c.price)} <small>combo</small></div>
      </article>
    `).join('');
    $$('.combo-card', el).forEach(t => {
      t.addEventListener('click', () => addToCart(t.dataset.id));
    });
  }

  /* =========================================================
     10) CART
     ========================================================= */
  function addToCart(id) {
    const item = MENU.find(m => m.id === id);
    if (!item) return;
    const line = cart.find(l => l.id === id);
    if (line) line.qty += 1;
    else cart.push({ id, qty: 1 });
    saveCart();
    renderCart();
    bumpCartIcon();
    toast(`Added ${item.name}`, 'fa-circle-check');
  }

  function changeQty(id, delta) {
    const line = cart.find(l => l.id === id);
    if (!line) return;
    line.qty += delta;
    if (line.qty <= 0) cart = cart.filter(l => l.id !== id);
    saveCart();
    renderCart();
  }

  function bumpCartIcon() {
    const badge = $('#cartBadge');
    const count = cart.reduce((s, l) => s + l.qty, 0);
    badge.textContent = count;
    badge.classList.toggle('show', count > 0);
    const btn = $('#cartBtn');
    btn.style.transform = 'scale(1.18)';
    setTimeout(() => btn.style.transform = '', 220);
  }

  function renderCart() {
    const itemsEl = $('#cartItems');
    const totalEl = $('#cartTotal');
    const footerEl = $('#cartFooter');

    const count = cart.reduce((s, l) => s + l.qty, 0);
    $('#cartBadge').textContent = count;
    $('#cartBadge').classList.toggle('show', count > 0);

    if (!cart.length) {
      itemsEl.innerHTML = `
        <div class="cart-empty">
          <i class="fa-solid fa-bag-shopping"></i>
          <h4 style="font-family: var(--display); margin-bottom: .4rem;">Your cart is empty</h4>
          <p>Browse the menu and add some delicious items!</p>
        </div>`;
      footerEl.style.display = 'none';
      return;
    }

    let total = 0;
    itemsEl.innerHTML = cart.map(l => {
      const m = MENU.find(x => x.id === l.id);
      if (!m) return '';
      const sub = m.price * l.qty;
      total += sub;
      return `
        <div class="cart-item">
          <div class="emoji">${m.emoji}</div>
          <div>
            <h5>${m.name}</h5>
            <div class="meta">
              <button class="qty-btn" data-act="dec" data-id="${m.id}" aria-label="Decrease"><i class="fa-solid fa-minus"></i></button>
              <span class="qty-num">${l.qty}</span>
              <button class="qty-btn" data-act="inc" data-id="${m.id}" aria-label="Increase"><i class="fa-solid fa-plus"></i></button>
            </div>
          </div>
          <div class="item-price">${fmt(sub)}</div>
        </div>`;
    }).join('');

    $$('.qty-btn', itemsEl).forEach(b => {
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        changeQty(b.dataset.id, b.dataset.act === 'inc' ? 1 : -1);
      });
    });

    totalEl.textContent = fmt(total);
    footerEl.style.display = 'block';
  }

  $('#cartBtn')?.addEventListener('click', () => {
    $('#cartDrawer').classList.add('open');
  });
  $('#cartClose')?.addEventListener('click', () => {
    $('#cartDrawer').classList.remove('open');
  });
  $('#cartDrawer')?.addEventListener('click', (e) => {
    if (e.target.classList.contains('cart-bg')) $('#cartDrawer').classList.remove('open');
  });

  /* =========================================================
     11) ORDER VIA WHATSAPP
     ========================================================= */
  function buildOrderMessage() {
    if (!cart.length) return '';
    const lines = cart.map(l => {
      const m = MENU.find(x => x.id === l.id);
      return `• ${m.name} x${l.qty} — ${fmt(m.price * l.qty)}`;
    });
    const total = cart.reduce((s, l) => {
      const m = MENU.find(x => x.id === l.id);
      return s + (m ? m.price * l.qty : 0);
    }, 0);
    return [
      `Hi ${SHOP.name}! I'd like to place an order:`,
      '',
      ...lines,
      '',
      `Total: ${fmt(total)}`,
      '',
      'Please confirm availability & delivery time. Thank you!'
    ].join('\n');
  }

  $('#cartCheckout')?.addEventListener('click', () => {
    const msg = buildOrderMessage();
    if (!msg) return;
    window.open(`https://wa.me/${SHOP.whatsapp}?text=${encodeURIComponent(msg)}`, '_blank');
  });

  $('#cartClear')?.addEventListener('click', () => {
    if (!cart.length) return;
    if (!confirm('Clear all items from your cart?')) return;
    cart = [];
    saveCart();
    renderCart();
    toast('Cart cleared', 'fa-trash');
  });

  /* =========================================================
     12) RESERVATION FORM
     ========================================================= */
  $('#reservationForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    const msg = [
      `Hi ${SHOP.name}! I'd like to make a reservation:`,
      '',
      `Name:    ${data.name}`,
      `Phone:   ${data.phone}`,
      `Date:    ${data.date}`,
      `Time:    ${data.time}`,
      `Guests:  ${data.guests}`,
      data.message ? `Note:    ${data.message}` : ''
    ].filter(Boolean).join('\n');
    window.open(`https://wa.me/${SHOP.whatsapp}?text=${encodeURIComponent(msg)}`, '_blank');
    toast('Sending your reservation via WhatsApp', 'fa-paper-plane');
    e.target.reset();
  });

  /* =========================================================
     13) CHATBOT (simple FAQ assistant)
     ========================================================= */
  const FAQ = [
    { q: 'timings|open|close|hours', a: `We're open every day from ${SHOP.timings}.` },
    { q: 'address|location|where|find|map', a: `We're at: ${SHOP.address}. Tap the map below for directions!` },
    { q: 'phone|call|number|contact', a: `You can reach us at ${SHOP.phoneDisplay}.` },
    { q: 'instagram|insta|social', a: `Follow us on Instagram @${SHOP.instagram} for daily fresh updates!` },
    { q: 'cake|order|birthday|custom', a: 'We make customized cakes! Browse our cake section or message us on WhatsApp with your design idea.' },
    { q: 'delivery|deliver', a: 'Yes, we offer delivery in Sangrur. Place your order via WhatsApp from the cart and we\'ll confirm.' },
    { q: 'best|signature|special|recommend', a: 'Our Satija Special Pizza, Truffle Pastry, and Bento Cakes are total crowd favourites! 😋' },
    { q: 'menu|food|eat', a: 'Scroll up to see our full menu — we have meals, pizza, pasta, burgers, cakes, drinks and much more!' },
    { q: 'price|cost|cheap', a: 'Our pastries start at just ₹25, snacks from ₹80, and meals from ₹140. There\'s something for everyone!' },
    { q: 'rating|review|reviews', a: `We're rated ${SHOP.rating}/5 by ${SHOP.reviewsCount}+ happy customers. We'd love to add you to that list!` },
  ];

  function findAnswer(text) {
    const t = text.toLowerCase();
    for (const item of FAQ) {
      if (new RegExp(item.q).test(t)) return item.a;
    }
    return "I'd love to help! For specific queries, please WhatsApp us at " + SHOP.phoneDisplay + ' or use the call button. 🥰';
  }

  function addChatMsg(text, who = 'bot') {
    const body = $('#chatBody');
    const div = document.createElement('div');
    div.className = `chat-msg ${who}`;
    div.textContent = text;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
  }

  function chatRespond(text) {
    setTimeout(() => addChatMsg(findAnswer(text)), 500);
  }

  $('#chatBtn')?.addEventListener('click', () => {
    const cb = $('#chatbot');
    cb.classList.toggle('open');
  });
  $('#chatClose')?.addEventListener('click', () => $('#chatbot').classList.remove('open'));

  $$('.chat-quick button').forEach(b => {
    b.addEventListener('click', () => {
      const q = b.textContent;
      addChatMsg(q, 'me');
      chatRespond(q);
    });
  });

  $('#chatForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const inp = $('#chatInput');
    const text = inp.value.trim();
    if (!text) return;
    addChatMsg(text, 'me');
    inp.value = '';
    chatRespond(text);
  });

  /* =========================================================
     14) SCROLL REVEAL
     ========================================================= */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  function observeReveals() {
    $$('.reveal').forEach(el => io.observe(el));
  }

  /* =========================================================
     15) INIT
     ========================================================= */
  renderTabs();
  renderMenu();
  renderCakeShowcase();
  renderCombos();
  renderCart();
  observeReveals();

})();
