/**
 * ============================================================
 *  JIVAN TELEHEALTH — Browser Frontend API Client
 *  This file runs IN THE BROWSER — talks to server.js via fetch
 * ============================================================
 */

const API = 'http://localhost:3000/api';

const Session = {
  save(token, session) {
    sessionStorage.setItem('jivan_token', token);
    sessionStorage.setItem('jivan_session', JSON.stringify(session));
  },
  getToken() { return sessionStorage.getItem('jivan_token'); },
  get() {
    try { return JSON.parse(sessionStorage.getItem('jivan_session')); }
    catch { return null; }
  },
  clear() {
    sessionStorage.removeItem('jivan_token');
    sessionStorage.removeItem('jivan_session');
  }
};

async function api(method, path, body) {
  const headers = { 'Content-Type': 'application/json' };
  const token = Session.getToken();
  if (token) headers['x-session-token'] = token;
  try {
    const res = await fetch(API + path, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });
    return res.json();
  } catch(e) {
    showToast('Cannot connect to server. Make sure server.js is running.', 'error', 6000);
    return { ok: false, msg: 'Server not reachable' };
  }
}

const Auth = {
  async register(data) {
    const result = await api('POST', '/auth/register', data);
    if (result.ok) Session.save(result.token, result.session);
    return result;
  },
  async login(identifier, password, role) {
    const result = await api('POST', '/auth/login', { identifier, password, role });
    if (result.ok) Session.save(result.token, result.session);
    return result;
  },
  async logout() {
    await api('POST', '/auth/logout');
    Session.clear();
    window.location.href = 'login.html';
  },
  async me() { return api('GET', '/auth/me'); },
  getSession() { return Session.get(); },
  require(role) {
    const session = Session.get();
    if (!session) { window.location.href = 'login.html'; return false; }
    if (role && session.role !== role) { window.location.href = 'login.html'; return false; }
    return true;
  }
};

const Appointments = {
  async book(data)            { return api('POST', '/appointments/book', data); },
  async mine()                { return api('GET', '/appointments/mine'); },
  async all()                 { return api('GET', '/appointments/all'); },
  async setStatus(id, status) { return api('PATCH', `/appointments/${id}/status`, { status }); }
};

const Records = {
  async mine()     { return api('GET', '/records/mine'); },
  async add(data)  { return api('POST', '/records/add', data); },
  async delete(id) { return api('DELETE', `/records/${id}`); }
};

const BloodBank = {
  async search(bloodGroup, city) {
    const p = new URLSearchParams();
    if (bloodGroup) p.set('bloodGroup', bloodGroup);
    if (city) p.set('city', city);
    return api('GET', '/donors?' + p.toString());
  },
  async getAll()       { return api('GET', '/donors'); },
  async register(data) { return api('POST', '/donors/register', data); }
};

const Doctors = {
  async list()                   { return api('GET', '/doctors'); },
  async updateSubscription(plan) { return api('PATCH', '/doctors/subscription', { plan }); }
};

const Emergency = {
  async request(location) { return api('POST', '/emergency/request', { location }); },
  async all()             { return api('GET', '/emergency/all'); }
};

// ── Live Notifications via SSE ──────────────────────────────
// Call LiveUpdates.connect(doctorId, onNewAppointment) from admin.html
const LiveUpdates = {
  _es: null,
  connect(callbacks) {
    if (this._es) { this._es.close(); this._es = null; }
    const token = Session.getToken();
    if (!token) return;
    // Pass token as query param because SSE doesn't support custom headers
    const url = API + '/events?token=' + encodeURIComponent(token);
    try {
      this._es = new EventSource(url);
    } catch(e) { return; }

    this._es.addEventListener('connected', () => {
      console.log('[SSE] Live updates connected');
    });

    this._es.addEventListener('new_appointment', (e) => {
      try {
        const appt = JSON.parse(e.data);
        if (callbacks.onNewAppointment) callbacks.onNewAppointment(appt);
      } catch(err) {}
    });

    this._es.onerror = () => {
      // Auto-reconnect is handled by the browser — no manual retry needed
    };
  },
  disconnect() {
    if (this._es) { this._es.close(); this._es = null; }
  }
};

const DarkMode = {
  init() {
    const saved = localStorage.getItem('jivan-dark');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.set(saved !== null ? saved === 'true' : prefersDark);
  },
  set(on) {
    document.documentElement.classList.toggle('dark', on);
    localStorage.setItem('jivan-dark', on);
    document.querySelectorAll('[data-dark-icon]').forEach(el => {
      el.textContent = on ? 'light_mode' : 'dark_mode';
    });
  },
  toggle() { this.set(!document.documentElement.classList.contains('dark')); }
};

const MobileMenu = {
  open() {
    const d = document.getElementById('mobile-drawer');
    const o = document.getElementById('menu-overlay');
    if (!d) return;
    d.classList.remove('-translate-x-full');
    d.classList.add('translate-x-0');
    o && o.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  },
  close() {
    const d = document.getElementById('mobile-drawer');
    const o = document.getElementById('menu-overlay');
    if (!d) return;
    d.classList.add('-translate-x-full');
    d.classList.remove('translate-x-0');
    o && o.classList.add('hidden');
    document.body.style.overflow = '';
  }
};

function showToast(message, type = 'success', duration = 3500) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none';
    document.body.appendChild(container);
  }
  const icons  = { success:'check_circle', error:'error', info:'info', warning:'warning' };
  const colors = { success:'bg-green-600', error:'bg-red-600', info:'bg-sky-600', warning:'bg-amber-500' };
  const toast  = document.createElement('div');
  toast.className = `pointer-events-auto flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl font-semibold text-sm text-white max-w-sm transition-all duration-300 translate-y-4 opacity-0 ${colors[type]}`;
  toast.innerHTML = `<span class="material-symbols-outlined text-xl">${icons[type]}</span><span>${message}</span>`;
  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.remove('translate-y-4', 'opacity-0'));
  setTimeout(() => {
    toast.classList.add('translate-y-4', 'opacity-0');
    setTimeout(() => toast.remove(), 350);
  }, duration);
}

function setLoading(btn, loading) {
  if (loading) {
    btn.dataset.origHtml = btn.innerHTML;
    btn.innerHTML = `<span class="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Please wait...`;
    btn.disabled = true;
    btn.classList.add('opacity-75', 'cursor-not-allowed');
  } else {
    if (btn.dataset.origHtml) btn.innerHTML = btn.dataset.origHtml;
    btn.disabled = false;
    btn.classList.remove('opacity-75', 'cursor-not-allowed');
  }
}

const Validator = {
  rules: {
    required: v => !!v.trim() || 'This field is required.',
    email:    v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Enter a valid email.',
    phone:    v => /^[6-9]\d{9}$/.test(v.replace(/\D/g,'')) || 'Enter valid 10-digit number.',
    password: v => {
      if (v.length < 8)     return 'Minimum 8 characters required.';
      if (!/[A-Z]/.test(v)) return 'Include at least one uppercase letter.';
      if (!/[0-9]/.test(v)) return 'Include at least one number.';
      return true;
    }
  },
  showError(input, msg) {
    input.classList.add('border-red-400');
    let err = input.parentElement.querySelector('.field-error');
    if (!err) { err = document.createElement('p'); err.className = 'field-error text-red-500 text-xs mt-1'; input.parentElement.appendChild(err); }
    err.textContent = msg;
  },
  clearError(input) {
    input.classList.remove('border-red-400');
    input.classList.add('border-green-400');
    const err = input.parentElement.querySelector('.field-error');
    if (err) err.remove();
  },
  validate(input, ruleNames) {
    for (const rule of ruleNames) {
      const fn = typeof rule === 'function' ? rule : this.rules[rule];
      if (!fn) continue;
      const result = fn(input.value);
      if (result !== true) { this.showError(input, result); return false; }
    }
    this.clearError(input); return true;
  },
  passwordStrength(password) {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    const labels = ['','Very Weak','Weak','Fair','Strong','Very Strong'];
    const colors = ['','bg-red-500','bg-orange-400','bg-yellow-400','bg-green-400','bg-green-600'];
    return { score, label: labels[score], color: colors[score], percent: (score/5)*100 };
  }
};

function updateNavAuth() {
  const session = Session.get();
  const loginBtn    = document.getElementById('nav-login-btn');
  const registerBtn = document.getElementById('nav-register-btn');
  const userChip    = document.getElementById('nav-user-chip');
  const userName    = document.getElementById('nav-user-name');
  if (session) {
    if (loginBtn)    loginBtn.style.display    = 'none';
    if (registerBtn) registerBtn.style.display = 'none';
    if (userChip)    userChip.style.display    = 'flex';
    if (userName)    userName.textContent      = session.name;
  } else {
    if (loginBtn)    loginBtn.style.display    = '';
    if (registerBtn) registerBtn.style.display = '';
    if (userChip)    userChip.style.display    = 'none';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  DarkMode.init();
  updateNavAuth();
  document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
  document.querySelectorAll('#mobile-drawer a').forEach(a => a.addEventListener('click', () => MobileMenu.close()));
});
