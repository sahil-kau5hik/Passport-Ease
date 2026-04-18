/* ================================================================
   shared.js — Utility functions shared across all pages
   Backend: Supabase (real-time database)
   ================================================================ */

const SUPABASE_URL = 'https://ycpivhefrggsjrpdmfxe.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_KGS_gOQ8gYLeAOnE97J0fw_hnRtrNwR';

const LS_KEYS = {
  THEME:        'pe_theme',
  DRAFT:        'pe_draft',
  APPLICATIONS: 'pe_applications',
  BOOKED_SLOTS: 'pe_booked_slots',
  COUNTER:      'pe_id_counter',
};

/* ─── In-memory cache ────────────────────────────────────────── */
window.DB_CACHE = {};
window.DB_READY = false;

window.onDBReady = function (cb) {
  if (window.DB_READY) cb();
  else document.addEventListener('DBLoaded', cb);
};

/* ─── Generic Supabase REST helpers ─────────────────────────── */
function sbHeaders(extras = {}) {
  return {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    ...extras
  };
}

async function sbGet(table, query = '') {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}${query}`, {
    headers: sbHeaders()
  });
  if (!res.ok) throw new Error(`sbGet ${table}: ${res.status}`);
  return res.json();
}

async function sbUpsert(table, body) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: sbHeaders({ 'Prefer': 'resolution=merge-duplicates' }),
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`sbUpsert ${table}: ${res.status}`);
  return res.status;
}

async function sbPatch(table, matchParam, body) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${matchParam}`, {
    method: 'PATCH',
    headers: sbHeaders({ 'Prefer': 'return=representation' }),
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`sbPatch ${table}: ${res.status}`);
  return res.json();
}

/* ─── KV store helpers (pe_store table) ─────────────────────── */
async function loadAllFromSupabase() {
  try {
    const rows = await sbGet('pe_store', '?select=key,data');
    if (Array.isArray(rows)) {
      rows.forEach(r => { window.DB_CACHE[r.key] = r.data; });
    }
  } catch (e) {
    console.warn('Supabase load failed, using localStorage fallback:', e);
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('pe_')) {
        try { window.DB_CACHE[k] = JSON.parse(localStorage.getItem(k)); } catch (_) {}
      }
    }
  }
}

function lsGet(key, fallback) {
  return window.DB_CACHE[key] !== undefined ? window.DB_CACHE[key] : fallback;
}

function lsSet(key, value) {
  window.DB_CACHE[key] = value;
  // fire-and-forget async write
  sbUpsert('pe_store', { key, data: value }).catch(e => {
    console.warn('Supabase write failed, falling back to localStorage:', e);
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {}
  });
  return true;
}

/* ─── Applications CRUD (pe_applications table) ─────────────── */
window.PE = window.PE || {};

PE.saveApplication = async function (app) {
  try {
    await sbUpsert('pe_applications', app);
  } catch (e) {
    console.warn('PE.saveApplication fallback to KV store:', e);
    const apps = lsGet(LS_KEYS.APPLICATIONS, []);
    const idx = apps.findIndex(a => a.id === app.id);
    if (idx >= 0) apps[idx] = app; else apps.push(app);
    lsSet(LS_KEYS.APPLICATIONS, apps);
  }
};

PE.loadApplications = async function () {
  try {
    const rows = await sbGet('pe_applications', '?select=*&order=submitted_at.desc');
    if (Array.isArray(rows) && rows.length > 0) {
      window.DB_CACHE[LS_KEYS.APPLICATIONS] = rows;
      return rows;
    }
  } catch (e) {
    console.warn('PE.loadApplications fallback:', e);
  }
  return lsGet(LS_KEYS.APPLICATIONS, []);
};

PE.patchApplication = async function (appId, fields) {
  try {
    await sbPatch('pe_applications', `id=eq.${encodeURIComponent(appId)}`, fields);
    // update local cache
    const apps = lsGet(LS_KEYS.APPLICATIONS, []);
    const app = apps.find(a => a.id === appId);
    if (app) Object.assign(app, fields);
    window.DB_CACHE[LS_KEYS.APPLICATIONS] = apps;
  } catch (e) {
    console.warn('PE.patchApplication fallback:', e);
    const apps = lsGet(LS_KEYS.APPLICATIONS, []);
    const app = apps.find(a => a.id === appId);
    if (app) Object.assign(app, fields);
    lsSet(LS_KEYS.APPLICATIONS, apps);
  }
};

/* ─── Users (pe_users table) ─────────────────────────────────── */
PE.saveUser = async function (user) {
  try {
    await sbUpsert('pe_users', user);
  } catch (e) {
    console.warn('PE.saveUser fallback:', e);
    const users = lsGet('pe_users', []);
    const idx = users.findIndex(u => u.email === user.email || u.phone === user.phone);
    if (idx >= 0) users[idx] = user; else users.push(user);
    lsSet('pe_users', users);
  }
};

PE.loadUsers = async function () {
  try {
    const rows = await sbGet('pe_users', '?select=*');
    if (Array.isArray(rows)) {
      window.DB_CACHE['pe_users'] = rows;
      return rows;
    }
  } catch (e) {
    console.warn('PE.loadUsers fallback:', e);
  }
  return lsGet('pe_users', []);
};

/* ─── Boot ───────────────────────────────────────────────────── */
async function initBackendCache() {
  await loadAllFromSupabase();
  window.DB_READY = true;
  document.dispatchEvent(new Event('DBLoaded'));

  initTheme();
  setActiveNav();
  initFontSize();
  initFontSizeControls();
  initAccessibilityDate();
  const themeBtn = document.getElementById('themeToggle');
  if (themeBtn) themeBtn.addEventListener('click', toggleTheme);
}

document.addEventListener('DOMContentLoaded', initBackendCache);

/* ─── Theme ──────────────────────────────────────────────────── */
function initTheme() {
  const saved = lsGet(LS_KEYS.THEME, 'light');
  document.documentElement.setAttribute('data-theme', saved);
  const btn = document.getElementById('themeToggle');
  if (btn) btn.textContent = saved === 'dark' ? '☀️' : '🌙';
}

function toggleTheme() {
  const cur = document.documentElement.getAttribute('data-theme');
  const next = cur === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  const btn = document.getElementById('themeToggle');
  if (btn) btn.textContent = next === 'dark' ? '☀️' : '🌙';
  lsSet(LS_KEYS.THEME, next);
}

/* ─── Toast ──────────────────────────────────────────────────── */
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  t.innerHTML = `<span class="toast-icon">${icons[type] || icons.info}</span><span>${message}</span>`;
  container.appendChild(t);
  setTimeout(() => { t.classList.add('toast-exit'); setTimeout(() => t.remove(), 300); }, 3500);
}

/* ─── Helpers ────────────────────────────────────────────────── */
function getStatusClass(status) {
  const map = {
    'Submitted':         'submitted',
    'Documents Verified':'docs-verified',
    'Documents Failed':  'rejected',
    'Police Verified':   'police-verified',
    'Admin Approved':    'approved',
    'Passport Issued':   'passport-issued',
    'Rejected':          'rejected',
  };
  return map[status] || 'submitted';
}

function generateApplicationId() {
  const year = new Date().getFullYear();
  let counter = lsGet(LS_KEYS.COUNTER, 0);
  counter++;
  const apps = lsGet(LS_KEYS.APPLICATIONS, []);
  let id;
  do {
    id = `PASS-${year}-${String(counter).padStart(5, '0')}`;
    counter++;
  } while (apps.some(a => a.id === id));
  lsSet(LS_KEYS.COUNTER, counter - 1);
  return id;
}

/* ─── Active Nav ─────────────────────────────────────────────── */
function setActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === path);
  });
}

/* ─── Font Size ──────────────────────────────────────────────── */
function initFontSize() {
  const saved = lsGet('pe_fontsize', 'normal');
  applyFontSize(saved);
}

function applyFontSize(size) {
  const html = document.documentElement;
  html.classList.remove('font-small', 'font-normal', 'font-large');
  html.classList.add(`font-${size}`);
  document.querySelectorAll('.font-size-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.fontsize === size);
  });
  lsSet('pe_fontsize', size);
}

function initFontSizeControls() {
  document.querySelectorAll('.font-size-btn').forEach(btn => {
    btn.addEventListener('click', () => applyFontSize(btn.dataset.fontsize));
  });
}

/* ─── Accessibility Bar Date ─────────────────────────────────── */
function initAccessibilityDate() {
  const el = document.getElementById('accessDate');
  if (!el) return;
  const now = new Date();
  const opts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  el.textContent = `${now.toLocaleDateString('en-IN', opts)} | ${now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
}
