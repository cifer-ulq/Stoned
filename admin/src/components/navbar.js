/* â”€â”€ Navbar â€” Admin Portal (Redesigned) â”€â”€ */
import { getState, setState } from '../store.js';
import { icon, renderIcons } from './icons.js';

const pageNames = {
  '/': 'Dashboard',
  '/students': 'Students',
  '/companies': 'Companies',
  '/ojt': 'OJT Management',
  '/jobs': 'Job Postings',
  '/matching': 'Matching & Scoring',
  '/reports': 'Reports & Analytics',
  '/settings': 'System Settings',
};

function getActive() {
  return window.location.hash.slice(1) || '/';
}

function getPageName() {
  return pageNames[getActive()] || 'Page';
}

export function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const user = getState('user');
  const theme = getState('ui.theme');

  function render() {
    const currentTheme = getState('ui.theme');
    navbar.innerHTML = `
      <nav class="navbar">
        <div class="navbar__inner">
          <div class="navbar__left">
            <div class="navbar__breadcrumb">
              <span class="navbar__breadcrumb-sep">${icon('home', 14)}</span>
              <span class="navbar__breadcrumb-sep">/</span>
              <span class="navbar__breadcrumb-current">${getPageName()}</span>
            </div>
          </div>
          <div class="navbar__right">
            <div class="navbar__search">
              ${icon('search', 15)}
              <input class="navbar__search-input" placeholder="Search anything..." />
            </div>
            <button class="navbar__action-btn" id="theme-toggle" title="Toggle theme">
              ${icon(currentTheme === 'dark' ? 'sun' : 'moon', 17)}
            </button>
            <button class="navbar__action-btn" title="Notifications">
              ${icon('bell', 17)}
              <span class="notification-dot"></span>
            </button>
            <div class="navbar__divider"></div>
            <div class="navbar__user">
              <div class="navbar__avatar">${user.initials}</div>
              <div class="navbar__user-info">
                <span class="navbar__user-name">${user.name.split(' ').slice(0, 2).join(' ')}</span>
                <span class="navbar__user-role">${user.role}</span>
              </div>
            </div>
          </div>
        </div>
      </nav>
    `;

    renderIcons();
  }

  render();

  navbar.addEventListener('click', (e) => {
    const themeBtn = e.target.closest('#theme-toggle');
    if (themeBtn) {
      const next = getState('ui.theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('admin-theme', next);
      setState('ui.theme', next);
      render();
    }
  });

  window.addEventListener('hashchange', () => render());
}
