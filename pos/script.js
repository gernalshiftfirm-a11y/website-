/* ==========================================================
   Spice Garden — Restaurant POS
   Menu, cart, orders, billing & earnings (localStorage based)
   ========================================================== */

(() => {
  'use strict';

  /* =========================================================
     1) MENU DATA
     ========================================================= */
  const MENU = [
    // Starters
    { id: 's1', name: 'Paneer Tikka',        category: 'Starters',     price: 220, veg: true,  emoji: '🧀', desc: 'Char-grilled cottage cheese cubes in tandoori spices.' },
    { id: 's2', name: 'Chicken Tikka',       category: 'Starters',     price: 260, veg: false, emoji: '🍗', desc: 'Boneless chicken marinated in yoghurt & spices.' },
    { id: 's3', name: 'Veg Spring Roll',     category: 'Starters',     price: 160, veg: true,  emoji: '🥟', desc: 'Crispy rolls stuffed with stir-fried veggies.' },
    { id: 's4', name: 'Fish Amritsari',      category: 'Starters',     price: 320, veg: false, emoji: '🐟', desc: 'Punjabi-style batter fried fish.' },

    // Main Course
    { id: 'm1', name: 'Paneer Butter Masala',category: 'Main Course',  price: 280, veg: true,  emoji: '🍲', desc: 'Cottage cheese in rich tomato & cashew gravy.' },
    { id: 'm2', name: 'Dal Makhani',         category: 'Main Course',  price: 240, veg: true,  emoji: '🥘', desc: 'Slow-cooked black lentils with butter & cream.' },
    { id: 'm3', name: 'Butter Chicken',      category: 'Main Course',  price: 340, veg: false, emoji: '🍛', desc: 'The classic creamy tomato chicken curry.' },
    { id: 'm4', name: 'Mutton Rogan Josh',   category: 'Main Course',  price: 420, veg: false, emoji: '🍖', desc: 'Aromatic Kashmiri-style lamb curry.' },
    { id: 'm5', name: 'Chana Masala',        category: 'Main Course',  price: 220, veg: true,  emoji: '🫘', desc: 'Spiced chickpeas in onion-tomato gravy.' },

    // Breads
    { id: 'b1', name: 'Butter Naan',         category: 'Breads',       price:  60, veg: true,  emoji: '🫓', desc: 'Soft tandoor-baked bread brushed with butter.' },
    { id: 'b2', name: 'Garlic Naan',         category: 'Breads',       price:  80, veg: true,  emoji: '🧄', desc: 'Naan topped with fresh garlic & coriander.' },
    { id: 'b3', name: 'Tandoori Roti',       category: 'Breads',       price:  40, veg: true,  emoji: '🥖', desc: 'Whole wheat flatbread baked in tandoor.' },
    { id: 'b4', name: 'Laccha Paratha',      category: 'Breads',       price:  70, veg: true,  emoji: '🥞', desc: 'Layered, flaky tandoor paratha.' },

    // Rice
    { id: 'r1', name: 'Veg Biryani',         category: 'Rice',         price: 240, veg: true,  emoji: '🍚', desc: 'Fragrant basmati rice with mixed vegetables.' },
    { id: 'r2', name: 'Chicken Biryani',     category: 'Rice',         price: 320, veg: false, emoji: '🥘', desc: 'Long grain rice layered with spiced chicken.' },
    { id: 'r3', name: 'Jeera Rice',          category: 'Rice',         price: 160, veg: true,  emoji: '🍚', desc: 'Basmati rice tempered with cumin.' },
    { id: 'r4', name: 'Veg Pulao',           category: 'Rice',         price: 200, veg: true,  emoji: '🍛', desc: 'Mildly spiced rice with seasonal vegetables.' },

    // Beverages
    { id: 'd1', name: 'Masala Chai',         category: 'Beverages',    price:  40, veg: true,  emoji: '☕', desc: 'Indian spiced milk tea.' },
    { id: 'd2', name: 'Sweet Lassi',         category: 'Beverages',    price:  90, veg: true,  emoji: '🥛', desc: 'Yogurt drink, sweet & chilled.' },
    { id: 'd3', name: 'Fresh Lime Soda',     category: 'Beverages',    price:  70, veg: true,  emoji: '🍋', desc: 'Refreshing salted/sweet lime soda.' },
    { id: 'd4', name: 'Cold Coffee',         category: 'Beverages',    price: 130, veg: true,  emoji: '🥤', desc: 'Frothy iced coffee with ice cream.' },

    // Desserts
    { id: 'x1', name: 'Gulab Jamun',         category: 'Desserts',     price: 110, veg: true,  emoji: '🍩', desc: 'Soft milk dumplings in rose syrup (2 pcs).' },
    { id: 'x2', name: 'Rasmalai',            category: 'Desserts',     price: 140, veg: true,  emoji: '🍮', desc: 'Cottage cheese discs in saffron milk (2 pcs).' },
    { id: 'x3', name: 'Ice Cream Sundae',    category: 'Desserts',     price: 160, veg: true,  emoji: '🍨', desc: 'Vanilla ice cream with chocolate & nuts.' },
  ];

  const TAX_RATE = 0.05; // 5% GST
  const RESTAURANT = {
    name: 'Spice Garden',
    address: '12 MG Road, Sangrur, Punjab',
    phone: '+91 98765 43210',
    gstin: '03ABCDE1234F1Z5',
  };

  /* =========================================================
     2) STATE
     ========================================================= */
  const STORE_KEY = 'spiceGarden_orders_v1';
  let cart = [];          // [{ id, qty }]
  let orders = loadOrders();
  let activeCategory = 'All';
  let menuQuery = '';
  let orderFilter = 'active';

  function loadOrders() {
    try {
      return JSON.parse(localStorage.getItem(STORE_KEY)) || [];
    } catch { return []; }
  }
  function saveOrders() {
    localStorage.setItem(STORE_KEY, JSON.stringify(orders));
  }

  /* =========================================================
     3) HELPERS
     ========================================================= */
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const fmt = (n) => '₹' + Math.round(n).toLocaleString('en-IN');
  const uid = () => 'O' + Date.now().toString(36).toUpperCase().slice(-5) + Math.floor(Math.random() * 99);

  function toast(msg, type = '') {
    const el = $('#toast');
    el.textContent = msg;
    el.className = 'toast show ' + type;
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { el.className = 'toast ' + type; }, 2200);
  }

  function isSameDay(a, b) {
    return a.getFullYear() === b.getFullYear() &&
           a.getMonth()    === b.getMonth() &&
           a.getDate()     === b.getDate();
  }

  /* =========================================================
     4) MODE SWITCH (Customer / Admin)
     ========================================================= */
  $$('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.mode;
      $$('.mode-btn').forEach(b => {
        const active = b === btn;
        b.classList.toggle('active', active);
        b.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      $('#viewCustomer').classList.toggle('active', mode === 'customer');
      $('#viewAdmin').classList.toggle('active', mode === 'admin');
      if (mode === 'admin') renderAdmin();
    });
  });

  /* =========================================================
     5) LIVE DATE/TIME
     ========================================================= */
  function tickClock() {
    const now = new Date();
    $('#liveDateTime').textContent = now.toLocaleString('en-IN', {
      weekday: 'short', day: '2-digit', month: 'short',
      hour: '2-digit', minute: '2-digit'
    });
  }
  tickClock();
  setInterval(tickClock, 30 * 1000);

  /* =========================================================
     6) MENU RENDERING
     ========================================================= */
  const categoriesEl = $('#categories');
  const menuGridEl   = $('#menuGrid');

  function renderCategories() {
    const cats = ['All', ...new Set(MENU.map(m => m.category))];
    categoriesEl.innerHTML = cats.map(c => {
      const icon = ({
        'All':         'fa-layer-group',
        'Starters':    'fa-pepper-hot',
        'Main Course': 'fa-bowl-food',
        'Breads':      'fa-bread-slice',
        'Rice':        'fa-wheat-awn',
        'Beverages':   'fa-mug-hot',
        'Desserts':    'fa-ice-cream',
      })[c] || 'fa-utensils';
      return `<button class="cat-btn ${c === activeCategory ? 'active' : ''}" data-cat="${c}">
                <i class="fa-solid ${icon}"></i> ${c}
              </button>`;
    }).join('');

    $$('.cat-btn', categoriesEl).forEach(b => {
      b.addEventListener('click', () => {
        activeCategory = b.dataset.cat;
        renderCategories();
        renderMenu();
      });
    });
  }

  function renderMenu() {
    const q = menuQuery.trim().toLowerCase();
    const list = MENU.filter(m =>
      (activeCategory === 'All' || m.category === activeCategory) &&
      (!q || m.name.toLowerCase().includes(q) || m.desc.toLowerCase().includes(q))
    );

    if (!list.length) {
      menuGridEl.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1">
          <i class="fa-regular fa-face-frown"></i>
          <p>No dishes match your search.</p>
        </div>`;
      return;
    }

    menuGridEl.innerHTML = list.map(m => `
      <div class="menu-item ${m.veg ? '' : 'nonveg'}" data-id="${m.id}">
        <span class="veg-dot" title="${m.veg ? 'Veg' : 'Non-veg'}"></span>
        <div class="emoji">${m.emoji}</div>
        <h4>${m.name}</h4>
        <p class="desc">${m.desc}</p>
        <div class="price-row">
          <span class="price">${fmt(m.price)}</span>
          <button class="add-btn" aria-label="Add ${m.name}"><i class="fa-solid fa-plus"></i></button>
        </div>
      </div>
    `).join('');

    $$('.menu-item', menuGridEl).forEach(card => {
      card.addEventListener('click', () => addToCart(card.dataset.id));
    });
  }

  $('#menuSearch').addEventListener('input', (e) => {
    menuQuery = e.target.value;
    renderMenu();
  });

  /* =========================================================
     7) CART
     ========================================================= */
  function addToCart(id) {
    const existing = cart.find(c => c.id === id);
    if (existing) existing.qty += 1;
    else cart.push({ id, qty: 1 });
    renderCart();
    const item = MENU.find(m => m.id === id);
    toast(`Added ${item.name}`, 'success');
  }

  function changeQty(id, delta) {
    const line = cart.find(c => c.id === id);
    if (!line) return;
    line.qty += delta;
    if (line.qty <= 0) cart = cart.filter(c => c.id !== id);
    renderCart();
  }

  function clearCart() {
    cart = [];
    renderCart();
  }

  function cartTotals(items = cart) {
    const subtotal = items.reduce((sum, c) => {
      const m = MENU.find(x => x.id === c.id);
      return sum + (m ? m.price * c.qty : 0);
    }, 0);
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax;
    return { subtotal, tax, total };
  }

  function renderCart() {
    const itemsEl   = $('#cartItems');
    const summaryEl = $('#cartSummary');

    if (!cart.length) {
      itemsEl.innerHTML = `
        <div class="cart-empty">
          <i class="fa-solid fa-bowl-food"></i>
          <p>No items yet. Pick something delicious!</p>
        </div>`;
      summaryEl.hidden = true;
      return;
    }

    itemsEl.innerHTML = cart.map(c => {
      const m = MENU.find(x => x.id === c.id);
      if (!m) return '';
      return `
        <div class="cart-line">
          <div>
            <h5>${m.emoji} ${m.name}</h5>
            <div class="meta">
              <button class="qty-btn" data-act="dec" data-id="${m.id}" aria-label="Decrease"><i class="fa-solid fa-minus"></i></button>
              <span class="qty-num">${c.qty}</span>
              <button class="qty-btn" data-act="inc" data-id="${m.id}" aria-label="Increase"><i class="fa-solid fa-plus"></i></button>
              <span class="muted small">× ${fmt(m.price)}</span>
            </div>
          </div>
          <span class="price">${fmt(m.price * c.qty)}</span>
        </div>
      `;
    }).join('');

    $$('.qty-btn', itemsEl).forEach(b => {
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        changeQty(b.dataset.id, b.dataset.act === 'inc' ? 1 : -1);
      });
    });

    const { subtotal, tax, total } = cartTotals();
    $('#sumSubtotal').textContent = fmt(subtotal);
    $('#sumTax').textContent      = fmt(tax);
    $('#sumTotal').textContent    = fmt(total);
    summaryEl.hidden = false;
  }

  $('#clearCart').addEventListener('click', () => {
    if (!cart.length) return;
    clearCart();
    toast('Cart cleared');
  });

  /* =========================================================
     8) PLACE ORDER
     ========================================================= */
  $('#placeOrderBtn').addEventListener('click', () => {
    if (!cart.length) return;

    const tableInput = $('#tableInput');
    const table = tableInput.value.trim() || 'Walk-in';

    const items = cart.map(c => {
      const m = MENU.find(x => x.id === c.id);
      return { id: m.id, name: m.name, price: m.price, qty: c.qty };
    });
    const { subtotal, tax, total } = cartTotals();

    const order = {
      id: uid(),
      table,
      items,
      subtotal, tax, total,
      status: 'pending',          // pending → preparing → ready → billed
      createdAt: new Date().toISOString(),
      billedAt: null,
    };
    orders.push(order);
    saveOrders();

    cart = [];
    tableInput.value = '';
    renderCart();
    toast(`Order placed for ${table}!`, 'success');
  });

  /* =========================================================
     9) ADMIN — STATS, CHART, ORDERS
     ========================================================= */
  function renderAdmin() {
    renderStats();
    renderChart();
    renderOrders();
  }

  function renderStats() {
    const today = new Date();
    const weekAgo = new Date(); weekAgo.setDate(today.getDate() - 6);

    const billed = orders.filter(o => o.status === 'billed' && o.billedAt);

    const todayTotal = billed
      .filter(o => isSameDay(new Date(o.billedAt), today))
      .reduce((s, o) => s + o.total, 0);

    const weekTotal = billed
      .filter(o => new Date(o.billedAt) >= new Date(weekAgo.toDateString()))
      .reduce((s, o) => s + o.total, 0);

    const allTotal = billed.reduce((s, o) => s + o.total, 0);

    const pending = orders.filter(o => o.status !== 'billed').length;

    $('#statToday').textContent   = fmt(todayTotal);
    $('#statWeek').textContent    = fmt(weekTotal);
    $('#statTotal').textContent   = fmt(allTotal);
    $('#statPending').textContent = pending;
  }

  function renderChart() {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      days.push(d);
    }

    const billed = orders.filter(o => o.status === 'billed' && o.billedAt);
    const dayTotals = days.map(d =>
      billed.filter(o => isSameDay(new Date(o.billedAt), d))
            .reduce((s, o) => s + o.total, 0)
    );
    const max = Math.max(...dayTotals, 1);
    const today = new Date();
    const grand = dayTotals.reduce((a, b) => a + b, 0);

    $('#chartTotal').textContent = `Total ${fmt(grand)}`;

    $('#earningsChart').innerHTML = days.map((d, i) => {
      const v = dayTotals[i];
      const h = (v / max) * 100;
      const isToday = isSameDay(d, today);
      const label = d.toLocaleDateString('en-IN', { weekday: 'short' });
      return `
        <div class="bar ${isToday ? 'today' : ''}">
          <div class="bar-fill" style="height:${Math.max(h, 2)}%" data-value="${v ? fmt(v) : ''}"></div>
          <span class="bar-label">${label}</span>
        </div>`;
    }).join('');
  }

  function renderOrders() {
    const grid = $('#ordersGrid');
    let list = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (orderFilter === 'active') list = list.filter(o => o.status !== 'billed');
    else if (orderFilter === 'billed') list = list.filter(o => o.status === 'billed');

    if (!list.length) {
      grid.innerHTML = `
        <div class="empty-state">
          <i class="fa-regular fa-folder-open"></i>
          <p>No ${orderFilter === 'all' ? '' : orderFilter} orders yet.</p>
        </div>`;
      return;
    }

    grid.innerHTML = list.map(o => {
      const time = new Date(o.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      const itemsHTML = o.items.map(i => `
        <div class="line">
          <span class="name"><span class="qty">${i.qty}×</span>${i.name}</span>
          <span class="price">${fmt(i.price * i.qty)}</span>
        </div>`).join('');

      const actions = orderActions(o);

      return `
        <div class="order-card ${o.status === 'billed' ? 'billed' : ''}" data-id="${o.id}">
          <div class="order-head">
            <div>
              <h4><i class="fa-solid fa-chair"></i> ${o.table}</h4>
              <div class="order-id">#${o.id} · ${time}</div>
            </div>
            <span class="status ${o.status}">${o.status}</span>
          </div>
          <div class="order-items">${itemsHTML}</div>
          <div class="order-total"><span>Total</span><span>${fmt(o.total)}</span></div>
          <div class="order-actions">${actions}</div>
        </div>`;
    }).join('');

    // wire up action buttons
    $$('.order-card', grid).forEach(card => {
      const id = card.dataset.id;
      card.querySelectorAll('[data-act]').forEach(btn => {
        btn.addEventListener('click', () => handleOrderAction(id, btn.dataset.act));
      });
    });
  }

  function orderActions(o) {
    if (o.status === 'pending') {
      return `
        <button class="btn btn-ghost" data-act="preparing"><i class="fa-solid fa-fire-burner"></i> Start Preparing</button>
        <button class="btn btn-danger" data-act="cancel"><i class="fa-solid fa-xmark"></i></button>`;
    }
    if (o.status === 'preparing') {
      return `
        <button class="btn btn-ghost" data-act="ready"><i class="fa-solid fa-check"></i> Mark Ready</button>
        <button class="btn btn-primary" data-act="bill"><i class="fa-solid fa-receipt"></i> Bill</button>`;
    }
    if (o.status === 'ready') {
      return `
        <button class="btn btn-primary" data-act="bill"><i class="fa-solid fa-receipt"></i> Generate Bill</button>`;
    }
    // billed
    return `
      <button class="btn btn-ghost" data-act="view"><i class="fa-solid fa-eye"></i> View Bill</button>
      <button class="btn btn-danger" data-act="delete"><i class="fa-solid fa-trash"></i></button>`;
  }

  function handleOrderAction(id, act) {
    const o = orders.find(x => x.id === id);
    if (!o) return;

    if (act === 'cancel') {
      if (!confirm(`Cancel order ${o.id}?`)) return;
      orders = orders.filter(x => x.id !== id);
      saveOrders();
      toast('Order cancelled');
      renderAdmin();
      return;
    }

    if (act === 'delete') {
      if (!confirm(`Delete bill ${o.id}? This will subtract its amount from earnings.`)) return;
      orders = orders.filter(x => x.id !== id);
      saveOrders();
      toast('Bill deleted');
      renderAdmin();
      return;
    }

    if (act === 'preparing' || act === 'ready') {
      o.status = act;
      saveOrders();
      toast(`Order is now ${act}`, 'success');
      renderAdmin();
      return;
    }

    if (act === 'bill') {
      o.status = 'billed';
      o.billedAt = new Date().toISOString();
      saveOrders();
      toast('Bill generated', 'success');
      renderAdmin();
      openBill(o);
      return;
    }

    if (act === 'view') {
      openBill(o);
    }
  }

  /* =========================================================
    10) BILL MODAL
     ========================================================= */
  const billModal   = $('#billModal');
  const billContent = $('#billContent');

  function openBill(o) {
    const billed = o.billedAt ? new Date(o.billedAt) : new Date();
    const dateStr = billed.toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });

    billContent.innerHTML = `
      <div class="bill-header">
        <h2>${RESTAURANT.name}</h2>
        <p>${RESTAURANT.address}</p>
        <p>Phone: ${RESTAURANT.phone} · GSTIN: ${RESTAURANT.gstin}</p>
      </div>

      <div class="bill-meta">
        <div><strong>Bill No:</strong> ${o.id}</div>
        <div><strong>Date:</strong> ${dateStr}</div>
        <div><strong>Table:</strong> ${o.table}</div>
      </div>

      <table class="bill-table">
        <thead>
          <tr>
            <th>Item</th>
            <th class="num">Qty</th>
            <th class="num">Rate</th>
            <th class="num">Amt</th>
          </tr>
        </thead>
        <tbody>
          ${o.items.map(i => `
            <tr>
              <td>${i.name}</td>
              <td class="num">${i.qty}</td>
              <td class="num">${fmt(i.price)}</td>
              <td class="num">${fmt(i.price * i.qty)}</td>
            </tr>`).join('')}
        </tbody>
      </table>

      <div class="bill-totals">
        <div class="row"><span>Subtotal</span><span>${fmt(o.subtotal)}</span></div>
        <div class="row"><span>CGST (2.5%)</span><span>${fmt(o.tax / 2)}</span></div>
        <div class="row"><span>SGST (2.5%)</span><span>${fmt(o.tax / 2)}</span></div>
        <div class="row grand"><span>Grand Total</span><span>${fmt(o.total)}</span></div>
      </div>

      <div class="bill-footer">
        <p>*** Thank you for dining with us ***</p>
        <p>Visit again at ${RESTAURANT.name}!</p>
      </div>
    `;
    billModal.classList.add('open');
    billModal.setAttribute('aria-hidden', 'false');
  }

  function closeBill() {
    billModal.classList.remove('open');
    billModal.setAttribute('aria-hidden', 'true');
  }

  billModal.addEventListener('click', (e) => {
    if (e.target.matches('[data-close]')) closeBill();
  });
  $('#printBillBtn').addEventListener('click', () => window.print());
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && billModal.classList.contains('open')) closeBill();
  });

  /* =========================================================
    11) ORDER FILTERS
     ========================================================= */
  $$('#orderFilters .filter').forEach(b => {
    b.addEventListener('click', () => {
      $$('#orderFilters .filter').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      orderFilter = b.dataset.filter;
      renderOrders();
    });
  });

  /* =========================================================
    12) EXPORT / RESET
     ========================================================= */
  $('#exportBtn').addEventListener('click', () => {
    const data = JSON.stringify(orders, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spice-garden-sales-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast('Sales exported', 'success');
  });

  $('#resetBtn').addEventListener('click', () => {
    if (!orders.length) { toast('Nothing to reset'); return; }
    if (!confirm('This will permanently delete ALL orders & earnings. Continue?')) return;
    orders = [];
    saveOrders();
    toast('All data reset', 'error');
    renderAdmin();
  });

  /* =========================================================
    13) INIT
     ========================================================= */
  renderCategories();
  renderMenu();
  renderCart();

})();
