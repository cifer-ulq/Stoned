/* ===========================
   Navbar — Supervisor Portal (matches student portal style)
   =========================== */

import { icon } from './icons.js';
import { getState, setState } from '../store.js';
import { navigate } from '../router.js';
import { clearAuth } from '../api/client.js';
import { initNotifications } from './notifications.js';
import { initChat } from './chat.js';

export function createNavbar() {
  const user = getState('user');
  const nav = document.createElement('header');
  nav.className = 'navbar';
  nav.id = 'main-navbar';

  const theme = getState('ui.theme');

  nav.innerHTML = `
    <div class="navbar__inner">
      <!-- Left: Logo -->
      <div class="navbar__left">
        <a class="navbar__logo" href="#/" data-route="/">
          <div class="navbar__logo-icon">H</div>
          <span class="navbar__logo-text">HireMe</span>
          <span class="navbar__logo-badge">Supervisor</span>
        </a>
      </div>

      <!-- Center: Icon Tabs -->
      <nav class="navbar__center" id="navbar-tabs">
        <a class="navbar__tab navbar__tab--active" href="#/" data-route="/" title="Dashboard">
          ${icon('home', 22)}
          <span class="navbar__tab-indicator"></span>
        </a>
        <a class="navbar__tab" href="#/trainees" data-route="/trainees" title="My Trainees">
          ${icon('users', 22)}
          <span class="navbar__tab-indicator"></span>
        </a>
        <a class="navbar__tab" href="#/interests" data-route="/interests" title="OJT Management">
          ${icon('star', 22)}
          <span class="navbar__tab-indicator"></span>
        </a>
        <a class="navbar__tab" href="#/map" data-route="/map" title="Monitoring Map">
          ${icon('map', 22)}
          <span class="navbar__tab-indicator"></span>
        </a>
        <a class="navbar__tab" href="#/evaluations" data-route="/evaluations" title="Evaluations">
          ${icon('clipboardCheck', 22)}
          <span class="navbar__tab-indicator"></span>
        </a>
        <a class="navbar__tab" href="#/reports" data-route="/reports" title="Reports">
          ${icon('fileText', 22)}
          <span class="navbar__tab-indicator"></span>
        </a>
      </nav>

      <!-- Right: Actions -->
      <div class="navbar__right">
        <button class="navbar__action-btn" id="theme-toggle" aria-label="Toggle theme" title="Toggle theme">
          ${theme === 'dark' ? icon('sun', 18) : icon('moon', 18)}
        </button>

        <!-- Chat icon -->
        <button class="navbar__action-btn" id="chat-btn" aria-label="Messages" title="Trainee Messages" style="position:relative;">
          ${icon('messageCircle', 18)}
          <span class="navbar__chat-badge" id="chat-badge" style="display:none">0</span>
        </button>

        <button class="navbar__action-btn" id="notif-btn" aria-label="Notifications" title="Notifications">
          ${icon('bell', 18)}
          <span class="navbar__notif-dot"></span>
        </button>

        <div class="profile-dropdown" id="profile-dropdown">
          <button class="navbar__avatar-btn" id="profile-trigger">
            <div class="navbar__avatar">${user.initials}</div>
          </button>
          <div class="profile-dropdown__menu" id="profile-menu">
            <div class="profile-dropdown__header">
              <div class="profile-dropdown__avatar-lg">${user.initials}</div>
              <div>
                <div class="profile-dropdown__name">${user.name}</div>
                <div class="profile-dropdown__role">${user.role}${user.department ? ' · ' + user.department : ''}</div>
              </div>
            </div>
            <div class="sidebar-divider"></div>
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

  // Tab navigation
  nav.querySelectorAll('.navbar__tab').forEach(tab => {
    tab.addEventListener('click', e => {
      e.preventDefault();
      navigate(tab.getAttribute('data-route'));
    });
  });

  // Notifications
  initNotifications(nav.querySelector('#notif-btn'));

  // Trainee & Coordinator Chat
  initChat(nav);

  // Logo click
  nav.querySelector('.navbar__logo').addEventListener('click', e => {
    e.preventDefault();
    navigate('/');
  });

  // Theme toggle
  const themeBtn = nav.querySelector('#theme-toggle');
  themeBtn.addEventListener('click', () => {
    const cur = getState('ui.theme');
    const next = cur === 'dark' ? 'light' : 'dark';
    setState('ui.theme', next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('sv-theme', next);
    themeBtn.innerHTML = next === 'dark' ? icon('sun', 18) : icon('moon', 18);
  });

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
    if (action === 'logout') {
      fetch('http://localhost:8000/api/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('hireme_token')}`, 'Accept': 'application/json' },
      }).catch(() => {});
      clearAuth();
      window.location.href = '../login/';
    }
    profileDropdown.classList.remove('profile-dropdown--open');
  });

  return nav;
}
