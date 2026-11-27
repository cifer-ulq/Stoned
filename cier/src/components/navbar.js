/* ── Navbar — CIER Portal ── */
import { getState, setState } from '../store.js';
import { icon, renderIcons } from './icons.js';
import { initNotifications } from './notifications.js';
import { storageUrl } from '../api/client.js';

const pageNames = {
  '/': 'Partner Companies & MOAs',
  '/companies': 'Partner Companies & MOAs',
  '/settings': 'Settings',
};

function getActive() {
  return window.location.hash.slice(1) || '/';
}

function getPageName() {
  return pageNames[getActive()] || 'Partner Companies & MOAs';
}

export function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  function render() {
    const user = getState('user') || {};
    const currentTheme = getState('ui.theme');
    const avatarSrc = user.avatar || user.avatar_url;
    const avatarHtml = avatarSrc
      ? `<img src="${storageUrl(avatarSrc)}" alt="${user.name || 'CIER'}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" onerror="this.onerror=null;this.parentElement.textContent='${user.initials || 'CI'}';" />`
      : (user.initials || 'CI');

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
            <button class="navbar__action-btn" id="theme-toggle" title="Toggle theme">
              ${icon(currentTheme === 'dark' ? 'sun' : 'moon', 17)}
            </button>
            <div class="navbar__notif-wrapper">
              <button class="navbar__action-btn" id="admin-notif-btn" title="Notifications" aria-label="Notifications">
                ${icon('bell', 17)}
                <span class="admin-notif-badge" style="display:none;">0</span>
              </button>
            </div>
            <div class="navbar__divider"></div>
            <div class="navbar__user">
              <div class="navbar__avatar">${avatarHtml}</div>
              <div class="navbar__user-info">
                <span class="navbar__user-name">${(user.name || 'CHMSU CIER').split(' ').slice(0, 3).join(' ')}</span>
                <span class="navbar__user-role">CIER Office</span>
              </div>
            </div>
          </div>
        </div>
      </nav>
    `;

    renderIcons();
    initNotifications(navbar.querySelector('#admin-notif-btn'));
  }

  render();

  navbar.addEventListener('click', (e) => {
    const themeBtn = e.target.closest('#theme-toggle');
    if (themeBtn) {
      const next = getState('ui.theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('cier-theme', next);
      setState('ui.theme', next);
      render();
    }
  });

  window.addEventListener('hashchange', () => render());
}
