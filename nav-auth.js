/**
 * ============================================================
 *  JIVAN TELEHEALTH — Shared Nav Auth Manager
 *  Injects logout button / user chip on every page dynamically
 * ============================================================
 */
(function () {
  function updateNav() {
    const session = (function () {
      try { return JSON.parse(sessionStorage.getItem('jivan_session')); } catch { return null; }
    })();

    // ── Elements that may exist on this page ──
    const loginBtn    = document.getElementById('nav-login-btn');
    const registerBtn = document.getElementById('nav-register-btn');
    const userChip    = document.getElementById('nav-user-chip');
    const userName    = document.getElementById('nav-user-name');

    if (session) {
      // Hide login/register
      if (loginBtn)    loginBtn.style.display    = 'none';
      if (registerBtn) registerBtn.style.display = 'none';

      // Show user chip
      if (userChip) {
        userChip.style.display = 'flex';
        if (userName) userName.textContent = session.name.split(' ')[0]; // first name only
      }

      // Inject logout into every page header that doesn't already have one
      injectLogout(session);

      // Update mobile drawer too
      updateMobileDrawer(session);
    } else {
      if (loginBtn)    loginBtn.style.display    = '';
      if (registerBtn) registerBtn.style.display = '';
      if (userChip)    userChip.style.display    = 'none';
    }
  }

  function doLogout() {
    const token = sessionStorage.getItem('jivan_token');
    if (token) {
      fetch('http://localhost:3000/api/auth/logout', {
        method: 'POST', headers: { 'x-session-token': token }
      }).catch(() => {});
    }
    sessionStorage.removeItem('jivan_token');
    sessionStorage.removeItem('jivan_session');
    window.location.href = 'login.html';
  }

  function injectLogout(session) {
    // Don't double-inject
    if (document.getElementById('jivan-logout-btn')) return;

    // Find the header's action area — the div that contains the dark mode button
    const header = document.querySelector('header');
    if (!header) return;

    // Find the dark mode button as an anchor point
    const darkBtn = header.querySelector('[data-dark-icon]');
    if (!darkBtn) return;
    const actionArea = darkBtn.closest('div') || darkBtn.parentElement;
    if (!actionArea) return;

    // Build user chip + logout
    const frag = document.createDocumentFragment();

    // User info chip (shows name + role)
    const chip = document.createElement('div');
    chip.id = 'jivan-user-chip';
    chip.style.cssText = 'display:flex;align-items:center;gap:0.4rem;padding:0.3rem 0.75rem 0.3rem 0.35rem;background:rgba(14,165,233,.1);border-radius:9999px;cursor:pointer;position:relative;';
    chip.innerHTML = `
      <div style="width:1.75rem;height:1.75rem;border-radius:50%;background:#0ea5e9;display:flex;align-items:center;justify-content:center;color:white;font-size:0.65rem;font-weight:700;flex-shrink:0;">
        ${session.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}
      </div>
      <span style="font-size:0.75rem;font-weight:700;color:#0ea5e9;max-width:6rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" class="hidden sm:block">
        ${session.name.split(' ')[0]}
      </span>
    `;

    // Dropdown
    const dropdown = document.createElement('div');
    dropdown.id = 'jivan-logout-dropdown';
    dropdown.style.cssText = 'position:absolute;top:calc(100% + 8px);right:0;background:white;border:1px solid #e2e8f0;border-radius:1rem;box-shadow:0 10px 40px rgba(0,0,0,.12);min-width:180px;z-index:9999;display:none;overflow:hidden;';
    dropdown.innerHTML = `
      <div style="padding:.75rem 1rem;border-bottom:1px solid #f1f5f9;">
        <p style="font-weight:700;font-size:.8rem;color:#0f172a;">${session.name}</p>
        <p style="font-size:.7rem;color:#64748b;text-transform:capitalize;">${session.role}</p>
        <p style="font-size:.65rem;color:#94a3b8;margin-top:.15rem;">${session.jivanId||''}</p>
      </div>
      ${session.role === 'doctor' ?
        '<a href="admin.html" style="display:flex;align-items:center;gap:.5rem;padding:.65rem 1rem;font-size:.8rem;font-weight:600;color:#0ea5e9;text-decoration:none;"><span class="material-symbols-outlined" style="font-size:1rem;">dashboard</span>Dashboard</a>' :
        '<a href="health.html" style="display:flex;align-items:center;gap:.5rem;padding:.65rem 1rem;font-size:.8rem;font-weight:600;color:#0ea5e9;text-decoration:none;"><span class="material-symbols-outlined" style="font-size:1rem;">folder_shared</span>My Records</a>'
      }
      <a href="id.html" style="display:flex;align-items:center;gap:.5rem;padding:.65rem 1rem;font-size:.8rem;font-weight:600;color:#64748b;text-decoration:none;border-top:1px solid #f1f5f9;">
        <span class="material-symbols-outlined" style="font-size:1rem;">badge</span>My ID Card
      </a>
      <button id="jivan-logout-btn" onclick="window._jivanLogout()" style="width:100%;display:flex;align-items:center;gap:.5rem;padding:.65rem 1rem;font-size:.8rem;font-weight:700;color:#ef4444;background:none;border:none;border-top:1px solid #f1f5f9;cursor:pointer;text-align:left;">
        <span class="material-symbols-outlined" style="font-size:1rem;">logout</span>Logout
      </button>
    `;

    chip.style.position = 'relative';
    chip.appendChild(dropdown);
    frag.appendChild(chip);

    // Toggle on click
    chip.addEventListener('click', (e) => {
      e.stopPropagation();
      const dd = document.getElementById('jivan-logout-dropdown');
      if (!dd) return;
      const isOpen = dd.style.display === 'block';
      dd.style.display = isOpen ? 'none' : 'block';
      // Dark mode support
      const dark = document.documentElement.classList.contains('dark');
      dd.style.background = dark ? '#1e293b' : 'white';
      dd.style.borderColor = dark ? '#334155' : '#e2e8f0';
      dd.querySelectorAll('a,div,button').forEach(el => {
        if (el.tagName === 'DIV') el.style.borderColor = dark ? '#334155' : '#f1f5f9';
      });
    });

    // Close on outside click
    document.addEventListener('click', () => {
      const dd = document.getElementById('jivan-logout-dropdown');
      if (dd) dd.style.display = 'none';
    });

    // Insert before dark mode button
    actionArea.insertBefore(frag, darkBtn);
  }

  function updateMobileDrawer(session) {
    const drawer = document.getElementById('mobile-drawer');
    if (!drawer) return;
    if (drawer.querySelector('#mobile-logout-btn')) return; // already added

    // Find the nav in mobile drawer
    const nav = drawer.querySelector('nav');
    if (!nav) return;

    // Add user info + logout at the bottom of mobile nav
    const logoutEl = document.createElement('div');
    logoutEl.style.cssText = 'margin-top:auto;padding:1rem;border-top:1px solid rgba(0,0,0,.07);';
    logoutEl.innerHTML = `
      <div style="padding:.6rem;background:rgba(14,165,233,.08);border-radius:.75rem;margin-bottom:.5rem;">
        <p style="font-size:.8rem;font-weight:700;color:#0ea5e9;">${session.name}</p>
        <p style="font-size:.7rem;color:#64748b;text-transform:capitalize;">${session.role}</p>
      </div>
      <button id="mobile-logout-btn" onclick="window._jivanLogout()"
        style="width:100%;display:flex;align-items:center;gap:.5rem;padding:.7rem .9rem;background:rgba(239,68,68,.08);border:none;border-radius:.75rem;color:#ef4444;font-weight:700;font-size:.8rem;cursor:pointer;">
        <span class="material-symbols-outlined" style="font-size:1rem;">logout</span> Logout
      </button>
    `;

    // Insert after nav
    nav.parentNode.insertBefore(logoutEl, nav.nextSibling);
  }

  // Expose logout globally
  window._jivanLogout = function () {
    const token = sessionStorage.getItem('jivan_token');
    if (token) {
      fetch('http://localhost:3000/api/auth/logout', {
        method: 'POST', headers: { 'x-session-token': token }
      }).catch(() => {});
    }
    sessionStorage.removeItem('jivan_token');
    sessionStorage.removeItem('jivan_session');
    window.location.href = 'login.html';
  };

  // Run after DOM ready
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', updateNav);
  else updateNav();

})();
