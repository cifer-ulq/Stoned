/* ── Sidebar Left — Admin Portal (Redesigned) ── */
import { getState } from '../store.js';
import { navigateTo } from '../router.js';
import { icon, renderIcons } from './icons.js';
import { apiGetCached, clearCache } from '../api/client.js';

const navItems = [
  { path: '/', icon: 'home', label: 'Dashboard' },
  { path: '/students', icon: 'users', label: 'Students', badgeKey: 'totalStudents' },
  { path: '/companies', icon: 'building-2', label: 'Companies', badgeKey: 'totalCompanies' },
  { path: '/ojt', icon: 'briefcase', label: 'OJT Management' },
  { path: '/jobs', icon: 'clipboard-check', label: 'Job Postings', badgeKey: 'totalJobs' },
  { path: '/matching', icon: 'target', label: 'Matching & Scoring' },
  { path: '/reports', icon: 'award', label: 'Alumni Tracker' },
];

const quickActions = [
  { icon: 'plus', label: 'Register Company', action: '/companies' },
  { icon: 'upload', label: 'Import Students', action: '/students' },
  { icon: 'flag', label: 'Review Flagged', action: '/jobs' },
];

function getActive() { return window.location.hash.slice(1) || '/'; }

function updateActiveNav(el) {
  if (!el) return;
  const active = getActive();
  el.querySelectorAll('.sidebar-nav__item[data-nav]').forEach(item => {
    item.classList.toggle('sidebar-nav__item--active', item.dataset.nav === active);
  });
}

function updateBadges(el, data) {
  if (!el || !data || !data.kpi) return;
  el.querySelectorAll('[data-badge]').forEach(badge => {
    const val = data.kpi[badge.dataset.badge];
    if (val != null) badge.textContent = val.toLocaleString();
  });
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
    <!-- Brand -->
    <div class="sidebar-brand">
      <div class="sidebar-brand__icon">H</div>
      <div class="sidebar-brand__text">
        <span class="sidebar-brand__name">HireMe</span>
        <span class="sidebar-brand__label">Admin Panel</span>
      </div>
    </div>

    <!-- Main Navigation -->
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
          ${quickActions.map(q => `
            <div class="sidebar-nav__item sidebar-nav__item--compact" data-nav="${q.action}">
              <span class="sidebar-nav__icon sidebar-nav__icon--sm">${icon(q.icon, 14)}</span>
              <span class="sidebar-nav__label">${q.label}</span>
            </div>
          `).join('')}
        </nav>
      </div>
    </div>

    <!-- Footer -->
    <div class="sidebar-footer">
      <div class="sidebar-nav__item sidebar-nav__item--compact" id="sidebar-logout">
        <span class="sidebar-nav__icon sidebar-nav__icon--sm">${icon('log-out', 14)}</span>
        <span class="sidebar-nav__label">Log Out</span>
      </div>
    </div>
  `;

  renderIcons();

  // Load cached badges immediately, revalidate in background
  apiGetCached('/admin/dashboard', {
    onUpdate: (fresh) => updateBadges(el, fresh),
  }).then(data => {
    updateBadges(el, data);
  }).catch(() => {});

  el.addEventListener('click', (e) => {
    const item = e.target.closest('[data-nav]');
    if (item) {
      navigateTo(item.dataset.nav);
    }
    if (e.target.closest('#sidebar-logout')) {
      fetch('http://localhost:8000/api/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('hireme_token')}`, 'Accept': 'application/json' },
      }).catch(() => {});
      clearCache();
      localStorage.removeItem('hireme_token');
      localStorage.removeItem('hireme_user');
      window.location.href = '../login/';
    }
  });

  window.addEventListener('hashchange', () => updateActiveNav(el));
}
