/**
 * CHMSU HireMe — Company Portal Left Sidebar
 */
import { icon } from './icons.js';
import { getState } from '../store.js';

export function createLeftSidebar() {
  const company = getState('company');
  const profileCompleted = !!company.profileCompleted;

  const sidebar = document.createElement('aside');
  sidebar.className = 'sidebar-left';
  sidebar.id = 'sidebar-left';

  const logoHtml = company.logoUrl
    ? `<img src="${company.logoUrl}" alt="${company.name}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" />`
    : (company.initials || 'CO');

  sidebar.innerHTML = `
    <a class="sidebar-user" href="#/" data-route="/">
      <div class="sidebar-user__avatar">${logoHtml}</div>
      <div class="sidebar-user__info">
        <div class="sidebar-user__name">${company.contactPerson || company.name}</div>
        <div class="sidebar-user__role">${company.role || 'HR Manager'}</div>
      </div>
    </a>
    <div class="sidebar-divider"></div>
    <nav class="sidebar-nav" id="sidebar-nav">
      <a class="sidebar-nav__item sidebar-nav__item--active" href="#/" data-route="/">
        <span class="sidebar-nav__icon" style="background:var(--color-accent-bg);color:var(--color-accent);">${icon('home',20)}</span>
        <span class="sidebar-nav__label">Dashboard</span>
      </a>
      <a class="sidebar-nav__item${profileCompleted ? '' : ' sidebar-nav__item--disabled'}"
         href="${profileCompleted ? '#/jobs' : '#/'}" data-route="/jobs">
        <span class="sidebar-nav__icon" style="background:var(--color-success-bg);color:var(--color-success);">${icon('briefcase',20)}</span>
        <span class="sidebar-nav__label">Job Postings</span>
      </a>
      <a class="sidebar-nav__item${profileCompleted ? '' : ' sidebar-nav__item--disabled'}"
         href="${profileCompleted ? '#/ojt-slots' : '#/'}" data-route="/ojt-slots">
        <span class="sidebar-nav__icon" style="background:rgba(99,102,241,.12);color:#6366F1;">${icon('graduationCap',20)}</span>
        <span class="sidebar-nav__label">OJT Slots</span>
      </a>
      <a class="sidebar-nav__item${profileCompleted ? '' : ' sidebar-nav__item--disabled'}"
         href="${profileCompleted ? '#/ojt-trainees' : '#/'}" data-route="/ojt-trainees">
        <span class="sidebar-nav__icon" style="background:rgba(16,185,129,.12);color:#10B981;">${icon('clipboardList',20)}</span>
        <span class="sidebar-nav__label">OJT Trainees</span>
      </a>
      <a class="sidebar-nav__item${profileCompleted ? '' : ' sidebar-nav__item--disabled'}"
         href="${profileCompleted ? '#/applicants' : '#/'}" data-route="/applicants">
        <span class="sidebar-nav__icon" style="background:var(--color-warning-bg);color:var(--color-warning);">${icon('users',20)}</span>
        <span class="sidebar-nav__label">Applicants</span>
      </a>
      <a class="sidebar-nav__item${profileCompleted ? '' : ' sidebar-nav__item--disabled'}"
         href="${profileCompleted ? '#/interviews' : '#/'}" data-route="/interviews">
        <span class="sidebar-nav__icon" style="background:var(--color-error-bg);color:var(--color-error);">${icon('video',20)}</span>
        <span class="sidebar-nav__label">Interviews</span>
      </a>
      <a class="sidebar-nav__item${profileCompleted ? '' : ' sidebar-nav__item--disabled'}"
         href="${profileCompleted ? '#/analytics' : '#/'}" data-route="/analytics">
        <span class="sidebar-nav__icon" style="background:var(--color-info-bg);color:var(--color-info);">${icon('barChart',20)}</span>
        <span class="sidebar-nav__label">Analytics</span>
      </a>
      ${profileCompleted
        ? `<a class="sidebar-nav__item" href="#/profile" data-route="/profile">
             <span class="sidebar-nav__icon" style="background:rgba(74,108,247,.1);color:var(--color-accent);">${icon('building',20)}</span>
             <span class="sidebar-nav__label">Company Profile</span>
           </a>`
        : `<a class="sidebar-nav__item sidebar-nav__item--highlight" href="#/profile-setup" data-route="/profile-setup">
             <span class="sidebar-nav__icon" style="background:rgba(245,158,11,.15);color:#F59E0B;">${icon('alertCircle',20)}</span>
             <span class="sidebar-nav__label">Set Up Profile</span>
           </a>`}
    </nav>
    <div class="sidebar-divider"></div>
    ${profileCompleted ? `
    <div class="sidebar-section">
      <h4 class="sidebar-section__title">Shortcuts</h4>
      <a class="sidebar-nav__item sidebar-nav__item--compact" href="#/post-job">
        <span class="sidebar-nav__icon sidebar-nav__icon--sm" style="background:var(--bg-tertiary);color:var(--text-secondary);">${icon('plus',16)}</span>
        <span class="sidebar-nav__label">Post New Job</span>
      </a>
      <a class="sidebar-nav__item sidebar-nav__item--compact" href="#/ojt-slots">
        <span class="sidebar-nav__icon sidebar-nav__icon--sm" style="background:var(--bg-tertiary);color:var(--text-secondary);">${icon('graduationCap',16)}</span>
        <span class="sidebar-nav__label">Post OJT Slot</span>
      </a>
      <a class="sidebar-nav__item sidebar-nav__item--compact" href="#/applicants">
        <span class="sidebar-nav__icon sidebar-nav__icon--sm" style="background:var(--bg-tertiary);color:var(--text-secondary);">${icon('search',16)}</span>
        <span class="sidebar-nav__label">Search Candidates</span>
      </a>
    </div>
    ` : `
    <div class="sidebar-section">
      <p class="text-xs text-secondary" style="padding:.5rem .75rem;background:rgba(245,158,11,.08);border-radius:8px;border-left:3px solid #F59E0B;margin:0 .5rem;">
        ${icon('alertCircle',13)} Complete your profile to unlock all features.
      </p>
    </div>
    `}
    <div class="sidebar-footer">
      <span class="text-xs text-tertiary">CHMSU HireMe &copy; 2026</span>
    </div>
  `;

  // Guard clicks on disabled nav items
  sidebar.querySelectorAll('.sidebar-nav__item--disabled').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      showGuardPopup();
    });
  });

  return sidebar;
}

function showGuardPopup() {
  if (document.getElementById('profile-guard-overlay')) return;
  const overlay = document.createElement('div');
  overlay.id = 'profile-guard-overlay';
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-box modal-box--sm" role="dialog" aria-modal="true"
         style="max-width:420px;text-align:center;padding:2rem;">
      <div style="font-size:3rem;margin-bottom:1rem;">&#127970;</div>
      <h2 style="font-size:1.25rem;font-weight:700;margin-bottom:.5rem;color:var(--text-primary)">
        Complete Your Company Profile
      </h2>
      <p style="color:var(--text-secondary);margin-bottom:1.5rem;font-size:.95rem;">
        You need to set up your company profile before you can access this section.
      </p>
      <div style="display:flex;gap:.75rem;justify-content:center;">
        <button id="guard-dismiss-btn" class="btn btn--ghost">Not Now</button>
        <button id="guard-setup-btn" class="btn btn--primary">Set Up Profile</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.querySelector('.modal-box')?.classList.add('modal-box--visible'));
  overlay.querySelector('#guard-dismiss-btn').addEventListener('click', () => overlay.remove());
  overlay.querySelector('#guard-setup-btn').addEventListener('click', () => {
    overlay.remove();
    window.location.hash = '/profile-setup';
  });
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
}