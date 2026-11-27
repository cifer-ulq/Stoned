/* ── Sidebar Left — CIER Portal ── */
import { navigateTo } from '../router.js';
import { icon, renderIcons } from './icons.js';
import { apiGetCached, clearCache } from '../api/client.js';

const navItems = [
  { path: '/', icon: 'building-2', label: 'Companies & MOAs', badgeKey: 'totalCompanies' },
  { path: '/settings', icon: 'settings', label: 'Settings' },
];

const quickActions = [
  { icon: 'plus', label: 'Register Company', tab: 'All', openRegister: true },
  { icon: 'clock', label: 'Pending Approvals', tab: 'Pending' },
  { icon: 'file-text', label: 'MOA Attention', tab: 'MOA Attention' },
];

function getActive() { return window.location.hash.slice(1) || '/'; }

function updateActiveNav(el) {
  if (!el) return;
  const active = getActive();
  el.querySelectorAll('.sidebar-nav__item[data-nav]').forEach(item => {
    const isMatch = item.dataset.nav === active || (item.dataset.nav === '/' && active === '/companies');
    item.classList.toggle('sidebar-nav__item--active', isMatch);
  });
}

function updateBadges(el, companies) {
  if (!el || !Array.isArray(companies)) return;
  const badge = el.querySelector('[data-badge="totalCompanies"]');
  if (badge) badge.textContent = companies.length.toLocaleString();
}

let _initialized = false;

export function initSidebarLeft() {
  const el = document.getElementById('sidebar-left');
  if (!el) return;

  if (_initialized) {
    updateActiveNav(el);
    return;
  }
  _initialized = true;

  el.innerHTML = `
    <div class="sidebar-brand">
      <div class="sidebar-brand__icon">H</div>
      <div class="sidebar-brand__text">
        <span class="sidebar-brand__name">HireMe</span>
        <span class="sidebar-brand__label">CIER Portal</span>
      </div>
    </div>

    <div style="padding-top:var(--space-3);flex:1;display:flex;flex-direction:column;">
      <div class="sidebar-section__title">Navigation</div>
      <nav class="sidebar-nav">
        ${navItems.map(n => `
          <div class="sidebar-nav__item${getActive() === n.path ? ' sidebar-nav__item--active' : ''}" data-nav="${n.path}">
            <span class="sidebar-nav__icon">${icon(n.icon, 18)}</span>
            <span class="sidebar-nav__label">${n.label}</span>
            ${n.badgeKey ? `<span class="sidebar-nav__badge" data-badge="${n.badgeKey}"></span>` : ''}
          </div>
        `).join('')}
      </nav>

      <div class="sidebar-section">
        <div class="sidebar-section__title">Quick Actions</div>
        <nav class="sidebar-nav">
          ${quickActions.map((q, idx) => `
            <div class="sidebar-nav__item sidebar-nav__item--compact" data-quick-idx="${idx}">
              <span class="sidebar-nav__icon sidebar-nav__icon--sm">${icon(q.icon, 14)}</span>
              <span class="sidebar-nav__label">${q.label}</span>
            </div>
          `).join('')}
        </nav>
      </div>
    </div>

    <div class="sidebar-footer">
      <div class="sidebar-nav__item sidebar-nav__item--compact" id="sidebar-logout">
        <span class="sidebar-nav__icon sidebar-nav__icon--sm">${icon('log-out', 14)}</span>
        <span class="sidebar-nav__label">Log Out</span>
      </div>
    </div>
  `;

  renderIcons();

  apiGetCached('/cier/companies', {
    onUpdate: (fresh) => updateBadges(el, fresh),
  }).then(data => {
    updateBadges(el, data);
  }).catch(() => {});

  el.addEventListener('click', (e) => {
    const item = e.target.closest('[data-nav]');
    if (item) {
      navigateTo(item.dataset.nav);
      return;
    }

    const quick = e.target.closest('[data-quick-idx]');
    if (quick) {
      const action = quickActions[Number(quick.dataset.quickIdx)];
      if (!action) return;
      const payload = { tab: action.tab, openRegister: Boolean(action.openRegister) };
      if (getActive() !== '/') {
        try { sessionStorage.setItem('cier_quick_action', JSON.stringify(payload)); } catch (_) {}
        navigateTo('/');
      } else {
        window.dispatchEvent(new CustomEvent('hireme:companies-quick-action', { detail: payload }));
      }
      return;
    }

    if (e.target.closest('#sidebar-logout')) {
      const token = localStorage.getItem('hireme_token');
      fetch('http://localhost:8000/api/auth/logout', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        credentials: 'include',
      }).catch(() => {});
      clearCache();
      localStorage.removeItem('hireme_token');
      localStorage.removeItem('hireme_user');
      window.location.href = '../login/';
    }
  });

  window.addEventListener('hashchange', () => updateActiveNav(el));
}
