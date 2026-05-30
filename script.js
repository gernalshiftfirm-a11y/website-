/* ==========================================================
   Satija's Bakers & Cafe — Premium Bakery Website JS
   ========================================================== */

(() => {
  'use strict';

  /* =========================================================
     1) BUSINESS DATA
     ========================================================= */
  const SHOP = {
    name: "Satija's Bakers & Cafe",
    phone: '+919988799191',
    phoneDisplay: '+91 99887 99191',
    whatsapp: '919988799191',
    address: 'Sector-17, near Kidzee School, Guru Nanak Colony, Sangrur, Punjab 148001',
    timings: '8:00 AM – 9:00 PM',
    instagram: 'satija_bakers_and_cafe',
    rating: 4.8,
    reviewsCount: 150,
  };

  /* =========================================================
     2) MENU DATA — emojis chosen item-by-item, all veg
     ========================================================= */
  const ICONS = {
    Meals:       'fa-solid fa-utensils',
    Salads:      'fa-solid fa-leaf',
    Pizza:       'fa-solid fa-pizza-slice',
    Pasta:       'fa-solid fa-bowl-food',
    Burgers:     'fa-solid fa-burger',
    Sandwiches:  'fa-solid fa-bread-slice',
    Snacks:      'fa-solid fa-cookie-bite',
    Wraps:       'fa-solid fa-drumstick-bite',
    Desserts:    'fa-solid fa-ice-cream',
    Cakes:       'fa-solid fa-cake-candles',
    Pastries:    'fa-solid fa-stroopwafel',
    Drinks:      'fa-solid fa-mug-hot',
    Combos:      'fa-solid fa-box-archive',
    'Bento Cakes': 'fa-solid fa-heart',
  };

  const M = (name, category, price, emoji, desc) => ({ id: slug(name), name, category, price, emoji, desc, veg: true });

  const MENU = [
    // ===== MEALS =====
    M('Aloo Tikki Burger Meal', 'Meals', 140, '🍔', 'Crispy aloo tikki burger, fries & a chilled drink.'),
    M('Aloo Tikki Spicy Burger Meal', 'Meals', 150, '🌶️', 'Spice-loaded aloo tikki burger with fries & drink.'),
    M('Nuggets Burger Meal', 'Meals', 185, '🍟', 'Veg nuggets burger paired with fries & soft drink.'),
    M('Veggie Burger Meal', 'Meals', 160, '🥬', 'Garden-fresh veggie patty meal with fries & drink.'),
    M('Veggie Ginger Burger Meal', 'Meals', 175, '🫚', 'Ginger-spiced veggie patty meal with fries & drink.'),
    M('Paneer Ginger Burger Meal', 'Meals', 195, '🧀', 'Tandoori paneer & ginger burger with fries & drink.'),
    M('Satija Special Burger Meal', 'Meals', 210, '👑', "Our signature loaded burger meal — chef's pick."),

    // ===== SALADS =====
    M('American Veggie Salad', 'Salads', 120, '🥗', 'Crunchy greens, corn & tangy American dressing.'),
    M('Manchurian Veg Salad', 'Salads', 135, '🥢', 'Indo-Chinese veg manchurian over a fresh salad bed.'),
    M('Tandoori Paneer Salad', 'Salads', 160, '🔥', 'Smoky tandoori paneer over a crunchy salad mix.'),
    M('Shammi Kebab Veg Salad', 'Salads', 145, '🌿', 'Hand-rolled veg shammi kebabs with fresh greens.'),

    // ===== PIZZA =====
    M('Onion Corn Pizza', 'Pizza', 120, '🍕', 'Classic onion & corn on stretchy mozzarella base.'),
    M('Tomato Corn Pizza', 'Pizza', 120, '🍅', 'Juicy tomato & sweet corn over melted cheese.'),
    M('Cheese Pizza', 'Pizza', 135, '🧀', 'Pure indulgence — extra cheese on a crisp base.'),
    M('Corn On Pizza', 'Pizza', 255, '🌽', 'Loaded with sweet corn, herbs & double cheese.'),
    M('Paneer Tikka Pizza', 'Pizza', 195, '🥘', 'Smoky paneer tikka chunks with capsicum & onion.'),
    M('Spicy Paneer Pizza', 'Pizza', 255, '🌶️', 'Fiery paneer pizza for spice lovers.'),
    M('Veg Overloaded Pizza', 'Pizza', 280, '🥦', 'Capsicum, corn, onion, paneer, jalapeños — all on one.'),
    M('Satija Special Pizza', 'Pizza', 310, '👑', "Our signature loaded pizza — the house favourite."),

    // ===== PASTA =====
    M('White Sauce Pasta', 'Pasta', 145, '🍝', 'Creamy béchamel pasta with herbs & cheese.'),
    M('Red Sauce Pasta', 'Pasta', 160, '🍅', 'Tomato-basil sauce pasta with Italian herbs.'),
    M('Mix Sauce Pasta', 'Pasta', 175, '🍲', 'Best of both — creamy & tangy in one bowl.'),
    M('Italian Red Sauce Pasta', 'Pasta', 200, '🇮🇹', 'Authentic Italian pomodoro pasta with parmesan.'),
    M('Italian White Sauce Pasta', 'Pasta', 200, '🥛', 'Authentic Italian alfredo with garlic & cream.'),
    M('Italian Mixed Sauce Pasta', 'Pasta', 200, '🍷', 'House Italian-style mix sauce pasta.'),

    // ===== BURGERS =====
    M('Aloo Tikki Burger', 'Burgers', 60, '🥔', 'Soft bun, hot crispy aloo tikki, mint mayo.'),
    M('Veggie Burger', 'Burgers', 80, '🥗', 'Crunchy mixed-veg patty with melt-in cheese.'),
    M('Paneer Ginger Burger', 'Burgers', 115, '🧀', 'Tandoori paneer & ginger patty for that zing.'),
    M('Satija Special Burger', 'Burgers', 130, '👑', "Stacked tall, signature sauce — our pride."),

    // ===== SANDWICHES =====
    M('Cold Sandwich', 'Sandwiches', 80, '🥪', 'Fresh, crunchy & light — a daytime favourite.'),
    M('Mixed Veg Grilled Sandwich', 'Sandwiches', 105, '🍞', 'Garden veggies grilled to golden perfection.'),
    M('Grilled Paneer Sandwich', 'Sandwiches', 120, '🧀', 'Spiced paneer grilled with capsicum & onion.'),
    M('Super Veg Sandwich', 'Sandwiches', 145, '🥬', 'Triple-decker loaded with veggies & cheese.'),
    M('American Veggie Sub Sandwich', 'Sandwiches', 135, '🌭', 'Sub-style roll with veggies & house dressing.'),
    M('Tandoori Paneer Sub Sandwich', 'Sandwiches', 175, '🔥', 'Smoky paneer sub with mint chutney drizzle.'),

    // ===== SNACKS =====
    M('Potato Balls', 'Snacks', 80, '🥔', 'Golden-fried cheesy potato pops — kid favourite.'),
    M('Momos', 'Snacks', 80, '🥟', 'Steamed veg momos with spicy red chutney.'),
    M('Veg Nuggets', 'Snacks', 120, '🍗', 'Crispy outside, soft inside — pop-able veg bites.'),
    M('Salted Fries', 'Snacks', 80, '🍟', 'Classic salted fries, crisp golden batches.'),
    M('Peri Peri Fries', 'Snacks', 100, '🌶️', 'Tangy peri-peri tossed fries for the soul.'),
    M('Loaded Cheesy Fries', 'Snacks', 135, '🧀', 'Cheddar, jalapeños & house sauce over fries.'),
    M('Stuffed Garlic Bread', 'Snacks', 120, '🍞', 'Garlic bread loaded with veggies & mozzarella.'),
    M('Paneer Garlic Bread', 'Snacks', 135, '🧀', 'Garlic bread stuffed with spiced paneer.'),
    M('Crispy Momos', 'Snacks', 105, '🥟', 'Pan-fried momos with spicy schezwan glaze.'),
    M('Spring Roll', 'Snacks', 110, '🥬', 'Crisp veg spring rolls with sweet-chilli dip.'),

    // ===== WRAPS =====
    M('Potato Wrap', 'Wraps', 95, '🥔', 'Crispy aloo tikki wrapped with mint & onion.'),
    M('Crispy Veg Wrap', 'Wraps', 110, '🥬', 'Mixed crunchy veggies in a soft wrap.'),
    M('Nuggets Wrap', 'Wraps', 120, '🍗', 'Veg nuggets, crisp lettuce, mayo — rolled up.'),
    M('Paneer & Cheesy Wrap', 'Wraps', 135, '🧀', 'Spiced paneer + cheese pull in every bite.'),
    M('Super Veg Wrap', 'Wraps', 150, '👑', 'Loaded veggies, paneer, cheese & house sauce.'),

    // ===== DESSERTS =====
    M('Red Velvet Butter Roll', 'Desserts', 40, '❤️', 'Soft red velvet sponge rolled with butter cream.'),
    M('Chocolate Butter Roll', 'Desserts', 40, '🍫', 'Cocoa sponge rolled with rich butter cream.'),
    M('Brownie', 'Desserts', 65, '🟫', 'Fudgy chocolate brownie — warm on request.'),
    M('Choco Lava', 'Desserts', 65, '🌋', 'Molten chocolate centre — pour & melt.'),

    // ===== CAKES =====
    M('Strawberry Cake', 'Cakes', 350, '🍓', 'Pillowy sponge with fresh cream & strawberries (½ kg).'),
    M('Pineapple Cake', 'Cakes', 350, '🍍', 'Classic pineapple cream cake (½ kg).'),
    M('Butterscotch Cake', 'Cakes', 350, '🍯', 'Butterscotch crunch with caramel drizzle (½ kg).'),
    M('Blueberry Cake', 'Cakes', 350, '🫐', 'Soft sponge layered with blueberry compote (½ kg).'),
    M('Blackcurrant Cake', 'Cakes', 350, '🍇', 'Tangy blackcurrant cream layered cake (½ kg).'),
    M('Mango Cake', 'Cakes', 350, '🥭', 'Seasonal mango cream cake — alphonso bliss (½ kg).'),
    M('Red Velvet Cake', 'Cakes', 400, '❤️', 'Velvety red sponge with cream cheese (½ kg).'),
    M('Chocolate Cake', 'Cakes', 400, '🍫', 'Rich chocolate ganache layered cake (½ kg).'),
    M('Fruit Cake', 'Cakes', 475, '🍒', 'Loaded with seasonal fresh fruits (½ kg).'),
    M('Choco Chips Cake', 'Cakes', 475, '🍪', 'Chocolate cake studded with choco chips (½ kg).'),

    // ===== PASTRIES =====
    M('Pineapple Pastry', 'Pastries', 25, '🍍', 'Single-serve pineapple cream pastry.'),
    M('Chocolate Pastry', 'Pastries', 25, '🍫', 'Classic chocolate cream pastry.'),
    M('Red Velvet Pastry', 'Pastries', 35, '❤️', 'Single red-velvet slice with cream cheese.'),
    M('Black Forest Pastry', 'Pastries', 35, '🍒', 'Dark chocolate, cherries & whipped cream.'),
    M('Truffle Pastry', 'Pastries', 65, '🍫', 'Premium dark truffle ganache pastry.'),
    M('Choco Mousse Pastry', 'Pastries', 65, '🍮', 'Airy chocolate mousse on a sponge base.'),

    // ===== DRINKS =====
    M('Cold Coffee', 'Drinks', 120, '☕', 'Frothy iced coffee with vanilla scoop.'),
    M('Oreo Shake', 'Drinks', 120, '🍪', 'Crushed Oreos blended into thick milkshake.'),
    M('Brownie Shake', 'Drinks', 135, '🟫', 'Fudge brownie chunks in a creamy shake.'),
    M('KitKat Shake', 'Drinks', 145, '🍫', 'KitKat crunch swirled into a thick shake.'),
    M('Lemonade', 'Drinks', 105, '🍋', 'Fresh lime, mint & a splash of soda.'),
    M('Watermelon Mocktail', 'Drinks', 105, '🍉', 'Chilled watermelon mocktail with mint.'),
    M('Blue Lagoon Mojito', 'Drinks', 105, '💙', 'Blue curaçao styled refreshing mocktail.'),
    M('Mint Mojito', 'Drinks', 120, '🌿', 'Crushed mint, lime, soda — pure refreshment.'),

    // ===== COMBOS =====
    M('Pizza Combo', 'Combos', 850, '🍕', 'Large pizza + sides + drinks for the whole gang.'),
    M('Pasta Combo', 'Combos', 500, '🍝', 'Pasta + garlic bread + drinks combo.'),
    M('Sandwich Combo', 'Combos', 440, '🥪', 'Sandwich + fries + drinks combo.'),
    M('Garlic Bread Combo', 'Combos', 300, '🍞', 'Garlic bread duo + dip + drinks.'),
    M('Snack Combo', 'Combos', 460, '🍟', 'Mixed snack platter + dips + drinks.'),
    M('Wrap Combo', 'Combos', 360, '🌯', 'Wrap + fries + drink combo.'),
    M('Couple Combo 1', 'Combos', 240, '💑', 'For two — burger pair + fries + drinks.'),
    M('Couple Combo 2', 'Combos', 240, '💑', 'For two — wrap pair + fries + drinks.'),
    M('Couple Combo 3', 'Combos', 479, '💕', 'Premium duo combo with snacks & shakes.'),
    M('Family Combo 1', 'Combos', 335, '👨‍👩‍👧', 'Family of 4 — meals + sides.'),
    M('Family Combo 2', 'Combos', 350, '👨‍👩‍👧‍👦', 'Family of 4 — pizza + sides + drinks.'),
    M('Family Combo 3', 'Combos', 430, '🎉', 'Family feast with mixed favourites.'),

    // ===== BENTO / SPECIAL CAKES =====
    M('Bento Cake 150G', 'Bento Cakes', 245, '🎁', 'Mini personalised bento cake — 150 g (perfect gift).'),
    M('Bento Cake 250G', 'Bento Cakes', 295, '💝', 'Personalised bento cake — 250 g.'),
    M('Matki Cake 500G', 'Bento Cakes', 350, '🏺', 'Traditional matki (pot) style cake — 500 g.'),
  ];

  function slug(s) {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
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
