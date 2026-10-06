/**
 * CHMSU HireMe — Left Sidebar Navigation (Facebook-style)
 */
import { icon } from './icons.js';
import { getState, subscribe } from '../store.js';
import { navigate } from '../router.js';

export function createLeftSidebar() {
  const user = getState('user');
  const isAlumni = user.is_alumni || user.status === 'alumni' || user.rawRole === 'graduate' || user.role?.toLowerCase().includes('graduate') || user.role?.toLowerCase().includes('alumni');
  const isOJT = !isAlumni && (user.is_active_ojt === true || user.status === 'active_ojt');
  const avatarSrc = user.avatar
    ? (user.avatar.startsWith('http') ? user.avatar : `http://localhost:8000${user.avatar}`)
    : null;
  const avatarInner = avatarSrc
    ? `<img src="${avatarSrc}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;">`
    : user.initials;

  const sidebar = document.createElement('aside');
  sidebar.className = 'sidebar-left';
  sidebar.id = 'sidebar-left';

  sidebar.innerHTML = `
    <!-- User Card -->
    <a class="sidebar-user" href="#/portfolio" data-route="/portfolio">
      <div class="sidebar-user__avatar" data-user-avatar>${avatarInner}</div>
      <div class="sidebar-user__info">
        <div class="sidebar-user__name">${user.name}</div>
        <div class="sidebar-user__role">${user.role}</div>
      </div>
    </a>

    <div class="sidebar-divider"></div>

    <!-- Navigation -->
    <nav class="sidebar-nav" id="sidebar-nav">
      <a class="sidebar-nav__item sidebar-nav__item--active" href="#/" data-route="/">
        <span class="sidebar-nav__icon" style="background: var(--color-accent-bg); color: var(--color-accent);">${icon('home', 20)}</span>
        <span class="sidebar-nav__label">Home</span>
      </a>
      <a class="sidebar-nav__item" href="#/portfolio" data-route="/portfolio">
        <span class="sidebar-nav__icon" style="background: var(--color-info-bg); color: var(--color-info);">${icon('user', 20)}</span>
        <span class="sidebar-nav__label">My Portfolio</span>
      </a>
      <a class="sidebar-nav__item" href="#/jobs" data-route="/jobs">
        <span class="sidebar-nav__icon" style="background: var(--color-success-bg); color: var(--color-success);">${icon('briefcase', 20)}</span>
        <span class="sidebar-nav__label">Job Match</span>
      </a>
      <a class="sidebar-nav__item" href="#/companies" data-route="/companies">
        <span class="sidebar-nav__icon" style="background: var(--color-accent-bg); color: var(--color-accent);">${icon('layers', 20)}</span>
        <span class="sidebar-nav__label">Companies</span>
      </a>
      <a class="sidebar-nav__item" href="#/applications" data-route="/applications">
        <span class="sidebar-nav__icon" style="background: var(--color-warning-bg); color: var(--color-warning);">${icon('inbox', 20)}</span>
        <span class="sidebar-nav__label">My Applications</span>
      </a>
      ${!isAlumni ? `
      <a class="sidebar-nav__item" href="#/ojt" data-route="/ojt">
        <span class="sidebar-nav__icon" style="background: var(--color-info-bg); color: var(--color-info);">${icon('graduationCap', 20)}</span>
        <span class="sidebar-nav__label">OJT List</span>
      </a>
      <a class="sidebar-nav__item" href="#/ojt-tracker" data-route="/ojt-tracker">
        <span class="sidebar-nav__icon" style="background: var(--color-accent-bg); color: var(--color-accent);">${icon('clock', 20)}</span>
        <span class="sidebar-nav__label">OJT Tracker</span>
        <span class="sidebar-nav__badge" id="sidebar-ojt-badge" style="${isOJT ? '' : 'display:none;'}">Active</span>
      </a>
      ` : `
      <a class="sidebar-nav__item" href="#/alumni" data-route="/alumni">
        <span class="sidebar-nav__icon" style="background: var(--color-warning-bg); color: var(--color-warning);">${icon('award', 20)}</span>
        <span class="sidebar-nav__label">Alumni Hub</span>
      </a>
      `}
      <a class="sidebar-nav__item" href="#/interview" data-route="/interview">
        <span class="sidebar-nav__icon" style="background: var(--color-error-bg); color: var(--color-error);">${icon('video', 20)}</span>
        <span class="sidebar-nav__label">Interviews</span>
      </a>
    </nav>

    <div class="sidebar-divider"></div>

    <!-- Quick Links -->
    <div class="sidebar-section">
      <h4 class="sidebar-section__title">Shortcuts</h4>
      <a class="sidebar-nav__item sidebar-nav__item--compact" href="#/jobs">
        <span class="sidebar-nav__icon sidebar-nav__icon--sm" style="background: var(--bg-tertiary); color: var(--text-secondary);">${icon('search', 16)}</span>
        <span class="sidebar-nav__label">Find Opportunities</span>
      </a>
      <a class="sidebar-nav__item sidebar-nav__item--compact" href="#/companies">
        <span class="sidebar-nav__icon sidebar-nav__icon--sm" style="background: var(--bg-tertiary); color: var(--text-secondary);">${icon('layers', 16)}</span>
        <span class="sidebar-nav__label">Browse Companies</span>
      </a>
      <a class="sidebar-nav__item sidebar-nav__item--compact" href="#/portfolio">
        <span class="sidebar-nav__icon sidebar-nav__icon--sm" style="background: var(--bg-tertiary); color: var(--text-secondary);">${icon('fileText', 16)}</span>
        <span class="sidebar-nav__label">Edit Portfolio</span>
      </a>
      <a class="sidebar-nav__item sidebar-nav__item--compact" href="#/interview">
        <span class="sidebar-nav__icon sidebar-nav__icon--sm" style="background: var(--bg-tertiary); color: var(--text-secondary);">${icon('messageSquare', 16)}</span>
        <span class="sidebar-nav__label">Messages</span>
      </a>
    </div>

    <!-- Footer -->
    <div class="sidebar-footer">
      <span class="text-xs text-tertiary">CHMSU HireMe © 2026</span>
    </div>
  `;

  subscribe('user', (updatedUser) => {
    if (!updatedUser) return;
    const alumni = updatedUser.is_alumni || updatedUser.status === 'alumni' || updatedUser.rawRole === 'graduate' || updatedUser.role?.toLowerCase().includes('graduate') || updatedUser.role?.toLowerCase().includes('alumni');
    const active = !alumni && (updatedUser.is_active_ojt === true || updatedUser.status === 'active_ojt');
    const badge = sidebar.querySelector('#sidebar-ojt-badge');
    if (badge) {
      badge.style.display = active ? '' : 'none';
    }
  });

  return sidebar;
}
