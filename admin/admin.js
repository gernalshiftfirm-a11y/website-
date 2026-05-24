/* =====================================================================
 * Jindal Dental Clinic — Admin Dashboard
 * ---------------------------------------------------------------------
 * • Supabase Auth (email + password) for the clinic owner
 * • Lists bookings + messages with live realtime subscription
 * • Status updates, internal notes, tap-to-WhatsApp / Call
 * • All access controlled by Supabase Row Level Security on the server
 * ==================================================================== */

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm';

// ---------------------------------------------------------------------
// Module state
// ---------------------------------------------------------------------
let supabase = null;
let session  = null;
let clinicPhone = '+919815171917';

const state = {
  tab:           'bookings',  // 'bookings' | 'messages'
  bookings:      [],
  messages:      [],
  statusFilter:  '',
  searchQuery:   '',
  notesTimers:   new Map(),
  realtimeChan:  null,
};

// ---------------------------------------------------------------------
// DOM refs
// ---------------------------------------------------------------------
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

const splash       = $('#splash');
const loginScreen  = $('#loginScreen');
const app          = $('#app');
const loginForm    = $('#loginForm');
const loginError   = $('#loginError');
const loginBtn     = $('#loginBtn');
const userEmail    = $('#userEmail');
const refreshBtn   = $('#refreshBtn');
const logoutBtn    = $('#logoutBtn');

const bookingsList   = $('#bookingsList');
const messagesList   = $('#messagesList');
const bookingsEmpty  = $('#bookingsEmpty');
const messagesEmpty  = $('#messagesEmpty');
const statusFilterEl = $('#statusFilter');
const searchInput    = $('#searchInput');
const tabsEl         = document.querySelector('.tabs');

const statToday    = $('#statToday');
const statPending  = $('#statPending');
const statWeek     = $('#statWeek');
const statTotal    = $('#statTotal');
const bookingsCountEl = $('#bookingsCount');
const messagesCountEl = $('#messagesCount');

const toastStack = $('#toastStack');

// ---------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------
const escapeHtml = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[c]);

const fmtDate = (iso) => {
  const d = new Date(iso + 'T00:00:00');
  if (isNaN(d.getTime())) return iso;
  return {
    day:   d.toLocaleDateString('en-IN', { weekday: 'short' }),
    date:  d.getDate(),
    month: d.toLocaleDateString('en-IN', { month: 'short' }),
  };
};

const fmtTimeAgo = (iso) => {
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.floor(ms / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
};

const normalizePhone = (input) => {
  if (!input) return '';
  let d = String(input).replace(/\D+/g, '');
  if (d.startsWith('0')) d = d.slice(1);
  if (d.length === 10) d = '91' + d;
  return d;
};

const toE164 = (input) => {
  const d = normalizePhone(input);
  return d ? '+' + d : '';
};

// ---------------------------------------------------------------------
// Toast
// ---------------------------------------------------------------------
function toast(msg, type = 'info', timeout = 3500) {
  const el = document.createElement('div');
  el.className = `toast toast--${type}`;
  const icon = type === 'success'
    ? '<svg viewBox="0 0 24 24"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg>'
    : type === 'error'
    ? '<svg viewBox="0 0 24 24"><path d="M12 2 1 21h22zM12 16h0v-1h0zm-1-3h2V8h-2z"/></svg>'
    : '<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 15h-2v-6h2zm0-8h-2V7h2z"/></svg>';
  el.innerHTML = `${icon}<div>${escapeHtml(msg)}</div>`;
  toastStack.appendChild(el);
  setTimeout(() => {
    el.classList.add('is-leaving');
    setTimeout(() => el.remove(), 320);
  }, timeout);
}

// ---------------------------------------------------------------------
// Bootstrap — fetch config, init Supabase, decide screen
// ---------------------------------------------------------------------
async function bootstrap() {
  let cfg;
  try {
    const res = await fetch('/api/config');
    cfg = await res.json();
  } catch (e) {
    return showFatalError(
      "Couldn't load configuration. The backend isn't deployed yet — see README.md."
    );
  }
  if (!cfg.supabaseUrl || !cfg.supabaseAnonKey) {
    return showFatalError(
      "Supabase isn't configured. Set PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_ANON_KEY in Netlify, then redeploy."
    );
  }

  clinicPhone = cfg.clinicPhone || clinicPhone;
  supabase = createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
    auth: { persistSession: true, autoRefreshToken: true },
  });

  // restore session
  const { data: { session: s } } = await supabase.auth.getSession();
  session = s;

  // react to future auth changes (sign-in, sign-out, token refresh)
  supabase.auth.onAuthStateChange((_evt, newSession) => {
    session = newSession;
    if (!session) showLogin();
  });

  splash.hidden = true;
  if (session) await enterApp();
  else         showLogin();
}

function showFatalError(msg) {
  splash.innerHTML = `
    <div style="background:#fff;color:#0f172a;border-radius:16px;padding:2rem;max-width:480px;text-align:left;">
      <h2 style="margin:0 0 .75rem;font-size:1.25rem;">Setup needed</h2>
      <p style="margin:0;color:#475569;">${escapeHtml(msg)}</p>
    </div>`;
}

function showLogin() {
  app.hidden = true;
  loginScreen.hidden = false;
  loginScreen.querySelector('#loginEmail')?.focus();
}

async function enterApp() {
  loginScreen.hidden = true;
  app.hidden = false;
  userEmail.textContent = session.user.email || '';
  await refreshAll();
  subscribeRealtime();
}

// ---------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  loginError.hidden = true;

  const email    = $('#loginEmail').value.trim();
  const password = $('#loginPassword').value;
  if (!email || !password) return;

  loginBtn.disabled = true;
  const label = loginBtn.querySelector('.btn__label');
  const orig = label.textContent;
  label.textContent = 'Signing in…';

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  loginBtn.disabled = false;
  label.textContent = orig;

  if (error) {
    loginError.hidden = false;
    loginError.textContent = error.message || 'Sign in failed.';
    return;
  }
  // onAuthStateChange will fire; manually enter app for snappy UX
  const { data: { session: s } } = await supabase.auth.getSession();
  session = s;
  await enterApp();
});

// ---------------------------------------------------------------------
// Logout
// ---------------------------------------------------------------------
logoutBtn.addEventListener('click', async () => {
  if (state.realtimeChan) {
    await supabase.removeChannel(state.realtimeChan);
    state.realtimeChan = null;
  }
  await supabase.auth.signOut();
  session = null;
  showLogin();
});

// ---------------------------------------------------------------------
// Refresh
// ---------------------------------------------------------------------
refreshBtn.addEventListener('click', async () => {
  refreshBtn.classList.add('is-loading');
  await refreshAll();
  setTimeout(() => refreshBtn.classList.remove('is-loading'), 400);
  toast('Refreshed', 'info', 1500);
});

async function refreshAll() {
  await Promise.all([loadBookings(), loadMessages()]);
}

// ---------------------------------------------------------------------
// Data loading
// ---------------------------------------------------------------------
async function loadBookings() {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .order('preferred_date', { ascending: true })
    .order('preferred_time', { ascending: true })
    .limit(500);

  if (error) {
    toast('Failed to load bookings: ' + error.message, 'error');
    return;
  }
  state.bookings = data || [];
  renderBookings();
  renderStats();
}

async function loadMessages() {
  const { data, error } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);

  if (error) {
    toast('Failed to load messages: ' + error.message, 'error');
    return;
  }
  state.messages = data || [];
  renderMessages();
  messagesCountEl.textContent = state.messages.length;
}

// ---------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------
function renderStats() {
  const todayISO = new Date().toISOString().slice(0, 10);
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);

  const today    = state.bookings.filter(b => b.preferred_date === todayISO).length;
  const pending  = state.bookings.filter(b => b.status === 'pending').length;
  const week     = state.bookings.filter(b => new Date(b.created_at) >= weekStart).length;
  const total    = state.bookings.length;

  statToday.textContent   = today;
  statPending.textContent = pending;
  statWeek.textContent    = week;
  statTotal.textContent   = total;
}

// ---------------------------------------------------------------------
// Bookings render
// ---------------------------------------------------------------------
function getFilteredBookings() {
  const q = state.searchQuery.toLowerCase().trim();
  return state.bookings.filter(b => {
    if (state.statusFilter && b.status !== state.statusFilter) return false;
    if (q) {
      const hay = `${b.name} ${b.phone} ${b.treatment}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

function renderBookings() {
  const list = getFilteredBookings();
  bookingsCountEl.textContent = list.length;
  bookingsEmpty.hidden = list.length > 0;

  bookingsList.innerHTML = list.map(b => bookingCardHtml(b)).join('');

  // wire row interactions
  bookingsList.querySelectorAll('select[data-status-id]').forEach(sel => {
    sel.addEventListener('change', () => updateStatus(sel.dataset.statusId, sel.value));
  });
  bookingsList.querySelectorAll('textarea[data-notes-id]').forEach(t => {
    t.addEventListener('input', () => debounceNotes(t.dataset.notesId, t.value));
  });
}

function bookingCardHtml(b) {
  const d = fmtDate(b.preferred_date);
  const wa = `https://wa.me/${normalizePhone(b.phone)}?text=${encodeURIComponent(
    `Hello ${b.name}, this is Jindal Dental Clinic. Your appointment for ${b.treatment} on ${b.preferred_date} at ${b.preferred_time} is confirmed. Please arrive 10 minutes early. Thank you!`
  )}`;
  const tel = toE164(b.phone);
  const idShort = (b.id || '').split('-')[0].toUpperCase();
  const newClass = (Date.now() - new Date(b.created_at).getTime() < 5 * 60_000)
    ? 'booking--new' : '';

  return `
    <article class="booking ${newClass}" data-id="${b.id}">
      <div class="booking__when">
        <span class="booking__day">${escapeHtml(d.day || '')}</span>
        <span class="booking__date">${escapeHtml(String(d.date || ''))}</span>
        <span class="booking__month">${escapeHtml(d.month || '')}</span>
        <span class="booking__time">${escapeHtml(b.preferred_time)}</span>
      </div>

      <div class="booking__main">
        <div class="booking__head">
          <span class="booking__name">${escapeHtml(b.name)}</span>
          <span class="status status--${b.status}">${escapeHtml(b.status)}</span>
          <span class="booking__id" title="Reference">#${escapeHtml(idShort)}</span>
        </div>

        <div class="booking__meta">
          <span>🦷 ${escapeHtml(b.treatment)}</span>
          <a href="tel:${escapeHtml(tel)}">📞 ${escapeHtml(tel)}</a>
          <span>⏱ ${fmtTimeAgo(b.created_at)}</span>
        </div>

        ${b.message ? `<div class="booking__msg">${escapeHtml(b.message)}</div>` : ''}

        <div class="booking__notes">
          <label class="booking__notes-label" for="n-${b.id}">Internal notes</label>
          <textarea id="n-${b.id}" data-notes-id="${b.id}" rows="2" placeholder="Add notes (auto-saves)…">${escapeHtml(b.notes || '')}</textarea>
        </div>
      </div>

      <div class="booking__actions">
        <select data-status-id="${b.id}" aria-label="Update status">
          ${['pending','confirmed','completed','cancelled','no_show'].map(s =>
            `<option value="${s}" ${b.status === s ? 'selected' : ''}>${s.replace('_',' ')}</option>`
          ).join('')}
        </select>
        <a class="wa" href="${wa}" target="_blank" rel="noopener">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 3.5A11.7 11.7 0 0 0 12 0 11.8 11.8 0 0 0 1.7 17.6L0 24l6.6-1.7A11.8 11.8 0 0 0 24 12a11.7 11.7 0 0 0-3.5-8.5z"/></svg>
          WhatsApp
        </a>
        <a class="call" href="tel:${escapeHtml(tel)}">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 15.5c-1.2 0-2.5-.2-3.6-.6a1 1 0 0 0-1 .2l-2.2 2.2a15 15 0 0 1-6.6-6.6l2.2-2.2a1 1 0 0 0 .2-1A11.4 11.4 0 0 1 8.5 4 1 1 0 0 0 7.5 3H4a1 1 0 0 0-1 1 17 17 0 0 0 17 17 1 1 0 0 0 1-1v-3.5a1 1 0 0 0-1-1z"/></svg>
          Call
        </a>
      </div>
    </article>`;
}

// ---------------------------------------------------------------------
// Messages render
// ---------------------------------------------------------------------
function renderMessages() {
  messagesEmpty.hidden = state.messages.length > 0;
  messagesList.innerHTML = state.messages.map(m => `
    <article class="message">
      <div class="message__head">
        <div>
          <div class="message__name">${escapeHtml(m.name)}</div>
          <a class="message__email" href="mailto:${escapeHtml(m.email)}">${escapeHtml(m.email)}</a>
        </div>
        <span class="message__time">${fmtTimeAgo(m.created_at)}</span>
      </div>
      <div class="message__body">${escapeHtml(m.message)}</div>
      <div class="message__actions">
        <a class="btn-ghost" href="mailto:${escapeHtml(m.email)}?subject=Re%3A%20your%20message%20to%20Jindal%20Dental%20Clinic">
          ✉ Reply
        </a>
      </div>
    </article>
  `).join('');
}

// ---------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------
async function updateStatus(id, newStatus) {
  const { error } = await supabase
    .from('bookings').update({ status: newStatus }).eq('id', id);
  if (error) {
    toast('Could not update status: ' + error.message, 'error');
    return;
  }
  // optimistic update
  const b = state.bookings.find(x => x.id === id);
  if (b) b.status = newStatus;
  renderBookings();
  renderStats();
  toast(`Status set to ${newStatus.replace('_', ' ')}`, 'success', 2000);
}

function debounceNotes(id, value) {
  if (state.notesTimers.has(id)) clearTimeout(state.notesTimers.get(id));
  state.notesTimers.set(id, setTimeout(async () => {
    const { error } = await supabase
      .from('bookings').update({ notes: value || null }).eq('id', id);
    if (error) toast('Notes save failed: ' + error.message, 'error');
    else {
      const b = state.bookings.find(x => x.id === id);
      if (b) b.notes = value;
    }
    state.notesTimers.delete(id);
  }, 700));
}

// ---------------------------------------------------------------------
// Realtime — new bookings appear instantly
// ---------------------------------------------------------------------
function subscribeRealtime() {
  if (state.realtimeChan) supabase.removeChannel(state.realtimeChan);
  state.realtimeChan = supabase
    .channel('admin-bookings')
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'bookings' },
      (payload) => {
        state.bookings.unshift(payload.new);
        renderBookings();
        renderStats();
        toast(`New booking from ${payload.new.name}`, 'success', 5000);
      })
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'contact_messages' },
      (payload) => {
        state.messages.unshift(payload.new);
        renderMessages();
        messagesCountEl.textContent = state.messages.length;
        toast(`New message from ${payload.new.name}`, 'info', 4000);
      })
    .subscribe();
}

// ---------------------------------------------------------------------
// Filter + search + tabs
// ---------------------------------------------------------------------
statusFilterEl.addEventListener('click', (e) => {
  const btn = e.target.closest('.filter-chip');
  if (!btn) return;
  state.statusFilter = btn.dataset.status || '';
  statusFilterEl.querySelectorAll('.filter-chip').forEach(b => {
    const active = b === btn;
    b.classList.toggle('is-active', active);
    b.setAttribute('aria-checked', String(active));
  });
  renderBookings();
});

searchInput.addEventListener('input', () => {
  state.searchQuery = searchInput.value;
  renderBookings();
});

tabsEl.addEventListener('click', (e) => {
  const btn = e.target.closest('.tab');
  if (!btn) return;
  const tab = btn.dataset.tab;
  state.tab = tab;
  $$('.tab').forEach(t => {
    const active = t === btn;
    t.classList.toggle('is-active', active);
    t.setAttribute('aria-selected', String(active));
  });
  $('#panel-bookings').hidden = tab !== 'bookings';
  $('#panel-messages').hidden = tab !== 'messages';
});

// ---------------------------------------------------------------------
// Auto-refresh every 30s as a safety net (in case realtime drops)
// ---------------------------------------------------------------------
setInterval(() => {
  if (!app.hidden) refreshAll();
}, 30_000);

// ---------------------------------------------------------------------
// Go!
// ---------------------------------------------------------------------
bootstrap().catch((err) => {
  console.error('bootstrap failed:', err);
  showFatalError('Unexpected error initializing the dashboard. Check the browser console.');
});
