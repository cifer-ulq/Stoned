/**
 * CHMSU HireMe — Slim Top Navbar (Facebook-style)
 */
import { icon } from './icons.js';
import { getState } from '../store.js';
import { navigate } from '../router.js';
import { apiPost, clearAuth } from '../api/client.js';
import { initNotifications } from './notifications.js';
import { initChat } from './chat.js';

export function createNavbar() {
  const user = getState('user');
  const isAlumni = user.is_alumni || user.status === 'alumni' || user.rawRole === 'graduate' || user.role?.toLowerCase().includes('graduate') || user.role?.toLowerCase().includes('alumni');
  const avatarSrc = user.avatar
    ? (user.avatar.startsWith('http') ? user.avatar : `http://localhost:8000${user.avatar}`)
    : null;
  const avatarInner = avatarSrc
    ? `<img src="${avatarSrc}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;">`
    : user.initials;
  const nav = document.createElement('header');
  nav.className = 'navbar';
  nav.id = 'main-navbar';

  nav.innerHTML = `
    <div class="navbar__inner">
      <!-- Left: Logo -->
      <div class="navbar__left">
        <a class="navbar__logo" href="#/" data-route="/">
          <div class="navbar__logo-icon">H</div>
          <span class="navbar__logo-text">HireMe</span>
        </a>
      </div>

      <!-- Center: Icon Tabs (Facebook-style) -->
      <nav class="navbar__center" id="navbar-tabs">
        <a class="navbar__tab navbar__tab--active" href="#/" data-route="/" title="Home">
          ${icon('home', 22)}
          <span class="navbar__tab-indicator"></span>
        </a>
        <a class="navbar__tab" href="#/portfolio" data-route="/portfolio" title="Portfolio">
          ${icon('user', 22)}
          <span class="navbar__tab-indicator"></span>
        </a>
        <a class="navbar__tab" href="#/jobs" data-route="/jobs" title="Job Match">
          ${icon('briefcase', 22)}
          <span class="navbar__tab-indicator"></span>
        </a>
        <a class="navbar__tab" href="#/applications" data-route="/applications" title="Applications">
          ${icon('inbox', 22)}
          <span class="navbar__tab-indicator"></span>
        </a>
        ${!isAlumni ? `
        <a class="navbar__tab" href="#/ojt" data-route="/ojt" title="OJT List">
          ${icon('graduationCap', 22)}
          <span class="navbar__tab-indicator"></span>
        </a>
        <a class="navbar__tab" href="#/ojt-tracker" data-route="/ojt-tracker" title="OJT Tracker">
          ${icon('clock', 22)}
          <span class="navbar__tab-indicator"></span>
        </a>
        ` : `
        <a class="navbar__tab" href="#/alumni" data-route="/alumni" title="Alumni Hub">
          ${icon('award', 22)}
          <span class="navbar__tab-indicator"></span>
        </a>
        `}
        <a class="navbar__tab" href="#/interview" data-route="/interview" title="Interviews">
          ${icon('video', 22)}
          <span class="navbar__tab-indicator"></span>
        </a>
      </nav>

      <!-- Right: Actions -->
      <div class="navbar__right">
        <button class="navbar__action-btn" id="theme-toggle" aria-label="Toggle theme" title="Toggle theme">
          ${icon('moon', 18)}
        </button>

        <!-- Chat icon -->
        <button class="navbar__action-btn" id="chat-btn" aria-label="Messages" title="Messages" style="position:relative;">
          ${icon('messageCircle', 18)}
          <span class="notif-badge" id="chat-badge" style="display:none">0</span>
        </button>

        <button class="navbar__action-btn" id="notif-btn" aria-label="Notifications" title="Notifications">
          ${icon('bell', 18)}
          <span class="navbar__notif-dot"></span>
        </button>

        <div class="profile-dropdown" id="profile-dropdown">
          <button class="navbar__avatar-btn" id="profile-trigger">
            <div class="navbar__avatar" data-user-avatar>${avatarInner}</div>
          </button>
          <div class="profile-dropdown__menu" id="profile-menu">
            <div class="profile-dropdown__header">
              <div class="profile-dropdown__avatar-lg" data-user-avatar>${avatarInner}</div>
              <div>
                <div class="profile-dropdown__name">${user.name}</div>
                <div class="profile-dropdown__role">${user.role}</div>
              </div>
            </div>
            <div class="sidebar-divider"></div>
            <button class="profile-dropdown__item" data-action="profile">
              ${icon('user', 16)} View Profile
            </button>
            <button class="profile-dropdown__item" data-action="settings">
              ${icon('settings', 16)} Settings
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

  // Notifications
  initNotifications(nav.querySelector('#notif-btn'));

  // Chat
  initChat(nav);

  // Theme toggle
  const themeBtn = nav.querySelector('#theme-toggle');
  themeBtn.addEventListener('click', () => {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('hireme-theme', next);
    themeBtn.innerHTML = next === 'dark' ? icon('sun', 18) : icon('moon', 18);
  });

  const currentTheme = document.documentElement.getAttribute('data-theme');
  themeBtn.innerHTML = currentTheme === 'dark' ? icon('sun', 18) : icon('moon', 18);

  // Profile dropdown
  const profileDropdown = nav.querySelector('#profile-dropdown');
  const profileTrigger = nav.querySelector('#profile-trigger');

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
    if (action === 'settings') navigate('/settings');
    if (action === 'logout') {
      apiPost('/auth/logout').catch(() => {});
      clearAuth();
      window.location.href = '../login/';
    }
    profileDropdown.classList.remove('profile-dropdown--open');
  });

  return nav;
}
