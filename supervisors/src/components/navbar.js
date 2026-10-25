/* ===========================
   Navbar — Supervisor Portal (matches student portal style)
   =========================== */

import { icon } from './icons.js';
import { getState, setState } from '../store.js';
import { navigate } from '../router.js';
import { clearAuth, apiUpload, storageUrl } from '../api/client.js';
import { initNotifications } from './notifications.js';
import { initChat } from './chat.js';

export function createNavbar() {
  const user = getState('user') || {};
  const nav = document.createElement('header');
  nav.className = 'navbar';
  nav.id = 'main-navbar';

  const avatarSrc = user.avatar || user.avatar_url;
  const avatarHtml = avatarSrc
    ? `<img src="${storageUrl(avatarSrc)}" alt="${user.name}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" onerror="this.onerror=null;this.parentElement.textContent='${user.initials || 'SP'}';" />`
    : (user.initials || 'SP');

  const theme = getState('ui.theme');

  nav.innerHTML = `
    <div class="navbar__inner">
      <!-- Left: Mobile Toggle + Logo -->
      <div class="navbar__left">
        <button class="navbar__mobile-toggle" id="mobile-sidebar-toggle" aria-label="Open navigation menu" title="Menu">
          ${icon('menu', 20)}
        </button>
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
            <div class="navbar__avatar">${avatarHtml}</div>
          </button>
          <div class="profile-dropdown__menu" id="profile-menu">
            <div class="profile-dropdown__header">
              <div class="profile-dropdown__avatar-lg">${avatarHtml}</div>
              <div>
                <div class="profile-dropdown__name">${user.name}</div>
                <div class="profile-dropdown__role">${user.role}${user.department ? ' · ' + user.department : ''}</div>
              </div>
            </div>
            <div class="sidebar-divider"></div>
            <label class="profile-dropdown__item" style="cursor: pointer; display: flex; align-items: center; gap: 8px; margin: 0;">
              ${icon('camera', 16)} <span>Change Profile Photo</span>
              <input type="file" id="sup-avatar-input" accept="image/png,image/jpeg,image/webp,image/gif" hidden />
            </label>
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

  // Profile Photo Upload
  const avatarInput = nav.querySelector('#sup-avatar-input');
  avatarInput?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Photo file size is too large. Maximum allowed size is 5 MB.');
      return;
    }

    const form = new FormData();
    form.append('avatar', file);

    const triggerBtn = nav.querySelector('#profile-trigger');
    if (triggerBtn) triggerBtn.style.opacity = '0.5';

    try {
      const res = await apiUpload('/auth/avatar', form);
      if (res?.avatar_url) {
        const photoUrl = storageUrl(res.avatar_url);
        const currentUser = getState('user') || {};
        currentUser.avatar = photoUrl;
        currentUser.avatar_url = photoUrl;
        setState('user', currentUser);
        try {
          const cached = JSON.parse(localStorage.getItem('hireme_user') || '{}');
          cached.avatar_url = photoUrl;
          localStorage.setItem('hireme_user', JSON.stringify(cached));
        } catch (_) {}

        const newImg = `<img src="${photoUrl}" alt="${currentUser.name || 'User'}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" onerror="this.onerror=null;this.parentElement.textContent='${currentUser.initials || 'SP'}';" />`;
        nav.querySelectorAll('.navbar__avatar, .profile-dropdown__avatar-lg').forEach(el => { el.innerHTML = newImg; });
        document.querySelectorAll('.sidebar-user__avatar').forEach(el => { el.innerHTML = newImg; });

        profileDropdown.classList.remove('profile-dropdown--open');
        alert('Profile photo updated successfully!');
      } else {
        alert(res?.message || 'Failed to update profile photo.');
      }
    } catch (err) {
      alert('Error uploading profile photo. Please try again.');
    } finally {
      if (triggerBtn) triggerBtn.style.opacity = '';
      e.target.value = '';
    }
  });

  nav.querySelector('#profile-menu').addEventListener('click', (e) => {
    const item = e.target.closest('[data-action]');
    if (!item) return;
    const action = item.getAttribute('data-action');
    if (action === 'logout') {
      fetch('/api/auth/logout', {
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

/**
 * Sticky Mobile Bottom Navigation Bar (matches student & company portal design)
 */
export function createMobileBottomNav() {
  const bottomNav = document.createElement('nav');
  bottomNav.className = 'mobile-bottom-nav';
  bottomNav.id = 'mobile-bottom-nav';
  bottomNav.setAttribute('aria-label', 'Mobile Navigation');

  bottomNav.innerHTML = `
    <a class="mobile-bottom-nav__tab mobile-bottom-nav__tab--active" href="#/" data-route="/" title="Dashboard">
      ${icon('home', 20)}
      <span>Home</span>
    </a>
    <a class="mobile-bottom-nav__tab" href="#/trainees" data-route="/trainees" title="My Trainees">
      ${icon('users', 20)}
      <span>Trainees</span>
    </a>
    <a class="mobile-bottom-nav__tab" href="#/interests" data-route="/interests" title="OJT Management">
      ${icon('star', 20)}
      <span>OJT</span>
    </a>
    <a class="mobile-bottom-nav__tab" href="#/map" data-route="/map" title="Monitoring Map">
      ${icon('map', 20)}
      <span>Map</span>
    </a>
    <a class="mobile-bottom-nav__tab" href="#/evaluations" data-route="/evaluations" title="Evaluations">
      ${icon('clipboardCheck', 20)}
      <span>Grades</span>
    </a>
    <a class="mobile-bottom-nav__tab" href="#/reports" data-route="/reports" title="Reports">
      ${icon('fileText', 20)}
      <span>Reports</span>
    </a>
  `;

  return bottomNav;
}
