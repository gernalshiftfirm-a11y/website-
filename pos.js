/* ==========================================================
   Satija's Bakers & Cafe — Staff POS
   Counter ordering · live orders · billing · earnings
   Uses shared data from menu-data.js
   ========================================================== */

(() => {
  'use strict';

  const SHOP  = window.SATIJA_SHOP;
  const MENU  = window.SATIJA_MENU;
  const ICONS = window.SATIJA_ICONS;

  if (!SHOP || !MENU || !ICONS) {
    document.body.innerHTML =
      '<div style="padding:2rem;font-family:sans-serif;">Failed to load menu data. Make sure menu-data.js loads before pos.js.</div>';
    return;
  }

  const TAX_RATE = SHOP.taxRate || 0.05;
  const STORE_KEY = 'satija_pos_orders_v1';

  /* =========================================================
     STATE
     ========================================================= */
  let cart = [];
  let orders = loadOrders();
  let activeCategory = 'All';
  let menuQuery = '';
  let orderFilter = 'active';

  function loadOrders() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || []; }
    catch { return []; }
  }
  function saveOrders() { localStorage.setItem(STORE_KEY, JSON.stringify(orders)); }

  /* =========================================================
     HELPERS
     ========================================================= */
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const fmt = n => '₹' + Math.round(n).toLocaleString('en-IN');
  const uid = () => 'O' + Date.now().toString(36).toUpperCase().slice(-5) + Math.floor(Math.random() * 99);
  const isSameDay = (a, b) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth()    === b.getMonth() &&
    a.getDate()     === b.getDate();

  function toast(msg, type = '') {
    const el = $('#toast');
    el.textContent = msg;
    el.className = 'toast show ' + type;
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { el.className = 'toast ' + type; }, 2200);
  }

  /* =========================================================
     THEME TOGGLE (mirrors main site)
     ========================================================= */
  const savedTheme = localStorage.getItem('satija_theme');
  if (savedTheme) document.documentElement.setAttribute('data-theme', savedTheme);

  function updateThemeIcon() {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const i = $('#themeBtn i');
    if (i) i.className = isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
  }
  updateThemeIcon();

  $('#themeBtn')?.addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    const next = cur === 'dark' ? 'light' : 'dark';
    if (next === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
    else document.documentElement.removeAttribute('data-theme');
    localStorage.setItem('satija_theme', next);
    updateThemeIcon();
  });

  /* =========================================================
     MODE SWITCH (Counter / Admin)
     ========================================================= */
  $$('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.mode;
      $$('.mode-btn').forEach(b => {
        const active = b === btn;
        b.classList.toggle('active', active);
        b.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      $('#viewCounter').classList.toggle('active', mode === 'counter');
      $('#viewAdmin').classList.toggle('active', mode === 'admin');
      if (mode === 'admin') renderAdmin();
    });
  });

  /* =========================================================
     LIVE CLOCK
     ========================================================= */
  function tickClock() {
    const now = new Date();
    const el = $('#liveDateTime');
    if (el) el.textContent = now.toLocaleString('en-IN', {
      weekday: 'short', day: '2-digit', month: 'short',
      hour: '2-digit', minute: '2-digit'
    });
  }
  tickClock();
  setInterval(tickClock, 30 * 1000);

  /* =========================================================
     COUNTER — MENU
     ========================================================= */
  const categoriesEl = $('#categories');
  const menuGridEl   = $('#menuGrid');

  function renderCategories() {
    const cats = ['All', ...new Set(MENU.map(m => m.category))];
    categoriesEl.innerHTML = cats.map(c => {
      const icon = c === 'All' ? 'fa-solid fa-layer-group' : (ICONS[c] || 'fa-solid fa-utensils');
      return `<button class="cat-btn ${c === activeCategory ? 'active' : ''}" data-cat="${c}">
                <i class="${icon}"></i> ${c}
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
      (!q || m.name.toLowerCase().includes(q) || (m.desc && m.desc.toLowerCase().includes(q)))
    );

    if (!list.length) {
      menuGridEl.innerHTML = `
        <div class="menu-empty">
          <i class="fa-regular fa-face-frown"></i>
          <p>No dishes match your search.</p>
        </div>`;
      return;
    }

    menuGridEl.innerHTML = list.map(m => `
      <div class="menu-item" data-id="${m.id}">
        <span class="veg-mark"></span>
        <div class="emoji">${m.emoji}</div>
        <div class="cat">${m.category}</div>
        <h4>${m.name}</h4>
        <div class="row">
          <span class="price">${fmt(m.price)}</span>
          <button class="add-btn" aria-label="Add ${m.name}"><i class="fa-solid fa-plus"></i></button>
        </div>
      </div>
    `).join('');

    $$('.menu-item', menuGridEl).forEach(card => {
      card.addEventListener('click', () => addToCart(card.dataset.id));
    });
  }

  $('#menuSearch').addEventListener('input', e => {
    menuQuery = e.target.value;
    renderMenu();
  });

  /* =========================================================
     COUNTER — CART
     ========================================================= */
  function addToCart(id) {
    const existing = cart.find(c => c.id === id);
    if (existing) existing.qty += 1;
    else cart.push({ id, qty: 1 });
    renderCart();
    const item = MENU.find(m => m.id === id);
    if (item) toast(`Added ${item.name}`, 'success');
  }

  function changeQty(id, delta) {
    const line = cart.find(c => c.id === id);
    if (!line) return;
    line.qty += delta;
    if (line.qty <= 0) cart = cart.filter(c => c.id !== id);
    renderCart();
  }

  function cartTotals(items = cart) {
    const subtotal = items.reduce((s, c) => {
      const m = MENU.find(x => x.id === c.id);
      return s + (m ? m.price * c.qty : 0);
    }, 0);
    const tax = subtotal * TAX_RATE;
    return { subtotal, tax, total: subtotal + tax };
  }

  function renderCart() {
    const itemsEl   = $('#cartItems');
    const summaryEl = $('#cartSummary');

    if (!cart.length) {
      itemsEl.innerHTML = `
        <div class="cart-empty">
          <i class="fa-solid fa-bowl-food"></i>
          <p>No items yet. Pick from the menu!</p>
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
        </div>`;
    }).join('');

    $$('.qty-btn', itemsEl).forEach(b => {
      b.addEventListener('click', e => {
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
    cart = [];
    renderCart();
    toast('Cart cleared');
  });

  /* =========================================================
     PLACE ORDER
     ========================================================= */
  $('#placeOrderBtn').addEventListener('click', () => {
    if (!cart.length) return;

    const tableInput = $('#tableInput');
    const table = tableInput.value.trim() || 'Walk-in';

    const items = cart.map(c => {
      const m = MENU.find(x => x.id === c.id);
      return { id: m.id, name: m.name, price: m.price, qty: c.qty, emoji: m.emoji };
    });
    const { subtotal, tax, total } = cartTotals();

    orders.push({
      id: uid(),
      table,
      items,
      subtotal, tax, total,
      status: 'pending',
      createdAt: new Date().toISOString(),
      billedAt: null,
    });
    saveOrders();

    cart = [];
    tableInput.value = '';
    renderCart();
    toast(`Order placed for ${table}!`, 'success');
  });

  /* =========================================================
     ADMIN — STATS, CHART, ORDERS
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
    const pending  = orders.filter(o => o.status !== 'billed').length;

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

    if (orderFilter === 'active')      list = list.filter(o => o.status !== 'billed');
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
          <div class="order-actions">${orderActions(o)}</div>
        </div>`;
    }).join('');

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
        <button class="btn btn-danger" data-act="cancel" aria-label="Cancel"><i class="fa-solid fa-xmark"></i></button>`;
    }
    if (o.status === 'preparing') {
      return `
        <button class="btn btn-ghost" data-act="ready"><i class="fa-solid fa-check"></i> Mark Ready</button>
        <button class="btn btn-primary" data-act="bill"><i class="fa-solid fa-receipt"></i> Bill</button>`;
    }
    if (o.status === 'ready') {
      return `<button class="btn btn-primary" data-act="bill"><i class="fa-solid fa-receipt"></i> Generate Bill</button>`;
    }
    return `
      <button class="btn btn-ghost" data-act="view"><i class="fa-solid fa-eye"></i> View Bill</button>
      <button class="btn btn-danger" data-act="delete" aria-label="Delete"><i class="fa-solid fa-trash"></i></button>`;
  }

  function handleOrderAction(id, act) {
    const o = orders.find(x => x.id === id);
    if (!o) return;

    if (act === 'cancel') {
      if (!confirm(`Cancel order ${o.id}?`)) return;
      orders = orders.filter(x => x.id !== id);
      saveOrders(); toast('Order cancelled'); renderAdmin(); return;
    }
    if (act === 'delete') {
      if (!confirm(`Delete bill ${o.id}? This will subtract its amount from earnings.`)) return;
      orders = orders.filter(x => x.id !== id);
      saveOrders(); toast('Bill deleted'); renderAdmin(); return;
    }
    if (act === 'preparing' || act === 'ready') {
      o.status = act;
      saveOrders(); toast(`Order is now ${act}`, 'success'); renderAdmin(); return;
    }
    if (act === 'bill') {
      o.status = 'billed';
      o.billedAt = new Date().toISOString();
      saveOrders(); toast('Bill generated', 'success');
      renderAdmin();
      openBill(o);
      return;
    }
    if (act === 'view') {
      openBill(o);
    }
  }

  /* =========================================================
     BILL MODAL (printable, branded)
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
        <h2>Satija's <em>Bakers</em> &amp; Cafe</h2>
        <p>${SHOP.address}</p>
        <p>Phone: ${SHOP.phoneDisplay} · GSTIN: ${SHOP.gstin}</p>
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
        <p>*** <strong>Thank you for your visit!</strong> ***</p>
        <p>Open every day · ${SHOP.timings}</p>
        <p>Follow us @${SHOP.instagram}</p>
      </div>
    `;
    billModal.classList.add('open');
    billModal.setAttribute('aria-hidden', 'false');
  }

  function closeBill() {
    billModal.classList.remove('open');
    billModal.setAttribute('aria-hidden', 'true');
  }

  billModal.addEventListener('click', e => {
    if (e.target.matches('[data-close]')) closeBill();
  });
  $('#printBillBtn').addEventListener('click', () => window.print());
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && billModal.classList.contains('open')) closeBill();
  });

  /* =========================================================
     ORDER FILTERS
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
     EXPORT / RESET
     ========================================================= */
  $('#exportBtn').addEventListener('click', () => {
    const data = JSON.stringify(orders, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `satija-sales-${new Date().toISOString().slice(0, 10)}.json`;
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
     INIT
     ========================================================= */
  renderCategories();
  renderMenu();
  renderCart();
})();
