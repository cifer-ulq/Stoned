/**
 * CHMSU HireMe — Job Seeker Portal Navbar
 */
import { icon } from './icons.js';
import { getState } from '../store.js';
import { navigate } from '../router.js';
import { apiPost, clearAuth } from '../api/client.js';
import { initNotifications } from './notifications.js';
import { initChat } from './chat.js';

export function createNavbar() {
  const user = getState('user');
  const nav = document.createElement('header');
  nav.className = 'navbar';
  nav.id = 'main-navbar';

  const avatarHtml = user.avatar
    ? `<img src="${user.avatar}" alt="${user.name}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" />`
    : user.initials;

  nav.innerHTML = `
    <div class="navbar__inner">
      <div class="navbar__left">
        <a class="navbar__logo" href="#/" data-route="/">
          <div class="navbar__logo-icon">H</div>
          <span class="navbar__logo-text">HireMe</span>
        </a>
      </div>

      <!-- Center: Icon Tabs — no OJT tabs -->
      <nav class="navbar__center" id="navbar-tabs">
        <a class="navbar__tab navbar__tab--active" href="#/" data-route="/" title="Home">
          ${icon('home', 22)}
          <span class="navbar__tab-indicator"></span>
        </a>
        <a class="navbar__tab" href="#/portfolio" data-route="/portfolio" title="My Portfolio">
          ${icon('user', 22)}
          <span class="navbar__tab-indicator"></span>
        </a>
        <a class="navbar__tab" href="#/jobs" data-route="/jobs" title="Job Match">
          ${icon('briefcase', 22)}
          <span class="navbar__tab-indicator"></span>
        </a>
        <a class="navbar__tab" href="#/applications" data-route="/applications" title="My Applications">
          ${icon('inbox', 22)}
          <span class="navbar__tab-indicator"></span>
        </a>
        <a class="navbar__tab" href="#/interview" data-route="/interview" title="Interviews">
          ${icon('video', 22)}
          <span class="navbar__tab-indicator"></span>
        </a>
      </nav>

      <div class="navbar__right">
        <button class="navbar__action-btn" id="theme-toggle" aria-label="Toggle theme">
          ${icon('moon', 18)}
        </button>

        <!-- Chat icon -->
        <div class="notif-dropdown" id="chat-dropdown" style="position:relative;">
          <button class="navbar__action-btn notif-bell-btn" id="chat-btn" aria-label="Messages" title="Messages">
            ${icon('messageCircle', 18)}
            <span class="notif-badge" id="chat-badge" style="display:none">0</span>
          </button>
        </div>

        <!-- Notification bell + dropdown -->
        <div class="notif-dropdown" id="notif-dropdown">
          <button class="navbar__action-btn notif-bell-btn" id="notif-bell" aria-label="Notifications">
            ${icon('bell', 18)}
            <span class="notif-badge" id="notif-badge" style="display:none">0</span>
          </button>
          <div class="notif-panel" id="notif-panel">
            <div class="notif-panel__header">
              <span class="notif-panel__title">${icon('bell', 15)} Notifications</span>
              <button class="notif-panel__read-all" id="notif-read-all">Mark all read</button>
            </div>
            <div class="notif-panel__body" id="notif-list">
              <div class="notif-panel__loading">Loading…</div>
            </div>
          </div>
        </div>

        <div class="profile-dropdown" id="profile-dropdown">
          <button class="navbar__avatar-btn" id="profile-trigger">
            <div class="navbar__avatar">${avatarHtml}</div>
          </button>
          <div class="profile-dropdown__menu" id="profile-menu">
            <div class="profile-dropdown__header">
              <div class="profile-dropdown__avatar-lg">${user.initials}</div>
              <div>
                <div class="profile-dropdown__name">${user.name}</div>
                <div class="profile-dropdown__role">${user.role || 'Graduate'}</div>
              </div>
            </div>
            <div class="sidebar-divider"></div>
            <button class="profile-dropdown__item" data-action="profile">
              ${icon('user', 16)} My Portfolio
            </button>
            <div class="sidebar-divider"></div>
            <button class="profile-dropdown__item profile-dropdown__item--danger" data-action="logout">
              ${icon('logOut', 16)} Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  const themeBtn = nav.querySelector('#theme-toggle');
  themeBtn.addEventListener('click', () => {
    const html = document.documentElement;
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('hireme-theme', next);
    themeBtn.innerHTML = next === 'dark' ? icon('sun', 18) : icon('moon', 18);
  });
  const currentTheme = document.documentElement.getAttribute('data-theme');
  themeBtn.innerHTML = currentTheme === 'dark' ? icon('sun', 18) : icon('moon', 18);

  const profileDropdown = nav.querySelector('#profile-dropdown');
  const profileTrigger  = nav.querySelector('#profile-trigger');

  profileTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    profileDropdown.classList.toggle('profile-dropdown--open');
  });
  document.addEventListener('click', () => {
    profileDropdown.classList.remove('profile-dropdown--open');
  });

  nav.querySelector('#profile-menu').addEventListener('click', (e) => {
    const item = e.target.closest('[data-action]');
    if (!item) return;
    const action = item.getAttribute('data-action');
    if (action === 'profile') navigate('/portfolio');
    if (action === 'logout') {
      apiPost('/auth/logout').catch(() => {});
      clearAuth();
      window.location.href = '../login/';
    }
    profileDropdown.classList.remove('profile-dropdown--open');
  });

  // Wire up notification panel
  initNotifications(nav);

  // Wire up chat panel
  initChat(nav);

  return nav;
}
