/**
 * CHMSU HireMe — Job Seeker Portal Left Sidebar
 */
import { icon } from './icons.js';
import { getState, subscribe } from '../store.js';

export function createLeftSidebar() {
  const user = getState('user');

  const avatarHtml = user.avatar
    ? `<img src="${user.avatar}" alt="${user.name}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" />`
    : user.initials;

  const sidebar = document.createElement('aside');
  sidebar.className = 'sidebar-left';
  sidebar.id = 'sidebar-left';

  sidebar.innerHTML = `
    <a class="sidebar-user" href="#/portfolio" data-route="/portfolio">
      <div class="sidebar-user__avatar">${avatarHtml}</div>
      <div class="sidebar-user__info">
        <div class="sidebar-user__name">${user.name}</div>
        <div class="sidebar-user__role">${user.desiredJobTitle || 'Graduate'}</div>
      </div>
    </a>

    <div class="sidebar-divider"></div>

    <nav class="sidebar-nav" id="sidebar-nav">
      <a class="sidebar-nav__item sidebar-nav__item--active" href="#/" data-route="/">
        <span class="sidebar-nav__icon" style="background:var(--color-accent-bg);color:var(--color-accent);">${icon('home', 20)}</span>
        <span class="sidebar-nav__label">Home</span>
      </a>
      <a class="sidebar-nav__item" href="#/portfolio" data-route="/portfolio">
        <span class="sidebar-nav__icon" style="background:var(--color-info-bg);color:var(--color-info);">${icon('user', 20)}</span>
        <span class="sidebar-nav__label">My Portfolio</span>
      </a>
      <a class="sidebar-nav__item" href="#/jobs" data-route="/jobs">
        <span class="sidebar-nav__icon" style="background:var(--color-success-bg);color:var(--color-success);">${icon('briefcase', 20)}</span>
        <span class="sidebar-nav__label">Job Match</span>
      </a>
      <a class="sidebar-nav__item" href="#/companies" data-route="/companies">
        <span class="sidebar-nav__icon" style="background:var(--color-accent-bg);color:var(--color-accent);">${icon('building', 20)}</span>
        <span class="sidebar-nav__label">Companies</span>
      </a>
      <a class="sidebar-nav__item" href="#/applications" data-route="/applications" id="nav-applications">
        <span class="sidebar-nav__icon" style="background:var(--color-warning-bg);color:var(--color-warning);">${icon('inbox', 20)}</span>
        <span class="sidebar-nav__label">My Applications</span>
        <span class="sidebar-nav__lock" id="lock-applications" style="display:none;">${icon('lock', 13)}</span>
      </a>
      <a class="sidebar-nav__item" href="#/interview" data-route="/interview" id="nav-interview">
        <span class="sidebar-nav__icon" style="background:var(--color-error-bg);color:var(--color-error);">${icon('video', 20)}</span>
        <span class="sidebar-nav__label">Interviews</span>
        <span class="sidebar-nav__lock" id="lock-interview" style="display:none;">${icon('lock', 13)}</span>
      </a>
    </nav>

    <div class="sidebar-divider"></div>

    <div class="sidebar-section">
      <h4 class="sidebar-section__title">Shortcuts</h4>
      <a class="sidebar-nav__item sidebar-nav__item--compact" href="#/jobs">
        <span class="sidebar-nav__icon sidebar-nav__icon--sm" style="background:var(--bg-tertiary);color:var(--text-secondary);">${icon('search', 16)}</span>
        <span class="sidebar-nav__label">Find Opportunities</span>
      </a>
      <a class="sidebar-nav__item sidebar-nav__item--compact" href="#/companies">
        <span class="sidebar-nav__icon sidebar-nav__icon--sm" style="background:var(--bg-tertiary);color:var(--text-secondary);">${icon('building', 16)}</span>
        <span class="sidebar-nav__label">Browse Companies</span>
      </a>
      <a class="sidebar-nav__item sidebar-nav__item--compact" href="#/portfolio">
        <span class="sidebar-nav__icon sidebar-nav__icon--sm" style="background:var(--bg-tertiary);color:var(--text-secondary);">${icon('fileText', 16)}</span>
        <span class="sidebar-nav__label">Edit Portfolio</span>
      </a>
      <a class="sidebar-nav__item sidebar-nav__item--compact" href="#/interview">
        <span class="sidebar-nav__icon sidebar-nav__icon--sm" style="background:var(--bg-tertiary);color:var(--text-secondary);">${icon('messageSquare', 16)}</span>
        <span class="sidebar-nav__label">Interviews</span>
      </a>
    </div>
  `;

  /* Apply lock indicators from current state, then watch for updates */
  function applyLockState(comp) {
    const lockApps  = sidebar.querySelector('#lock-applications');
    const lockInt   = sidebar.querySelector('#lock-interview');
    const navApps   = sidebar.querySelector('#nav-applications');
    const navInt    = sidebar.querySelector('#nav-interview');
    if (!lockApps || !lockInt) return;

    const locked = comp && !comp.is_complete;
    lockApps.style.display = locked ? 'flex' : 'none';
    lockInt.style.display  = locked ? 'flex' : 'none';
    navApps.classList.toggle('sidebar-nav__item--locked', locked);
    navInt.classList.toggle('sidebar-nav__item--locked',  locked);
  }

  applyLockState(getState('profileCompleteness'));
  subscribe('profileCompleteness', (val) => applyLockState(val));

  return sidebar;
}
