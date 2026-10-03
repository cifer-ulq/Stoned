/* ===========================
   Left Sidebar — Supervisor Portal (matches student portal style)
   =========================== */

import { icon } from './icons.js';
import { getState } from '../store.js';

export function createSidebarLeft() {
  const user = getState('user');

  const aside = document.createElement('aside');
  aside.className = 'sidebar-left';
  aside.id = 'sidebar-left';

  aside.innerHTML = `
    <!-- User Card -->
    <a class="sidebar-user" href="#/" data-route="/">
      <div class="sidebar-user__avatar">${user.initials}</div>
      <div class="sidebar-user__info">
        <div class="sidebar-user__name">${user.name}</div>
        <div class="sidebar-user__role" title="${user.course || user.role}" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:180px;">${user.course ? `${user.course} Coordinator` : user.role}</div>
      </div>
    </a>

    <div class="sidebar-divider"></div>

    <!-- Navigation -->
    <nav class="sidebar-nav" id="sidebar-nav">
      <a class="sidebar-nav__item sidebar-nav__item--active" href="#/" data-route="/">
        <span class="sidebar-nav__icon" style="background: var(--color-accent-bg); color: var(--color-accent);">${icon('home', 20)}</span>
        <span class="sidebar-nav__label">Dashboard</span>
      </a>
      <a class="sidebar-nav__item" href="#/trainees" data-route="/trainees">
        <span class="sidebar-nav__icon" style="background: var(--color-info-bg); color: var(--color-info);">${icon('users', 20)}</span>
        <span class="sidebar-nav__label">My Trainees</span>
      </a>
      <a class="sidebar-nav__item" href="#/interests" data-route="/interests">
        <span class="sidebar-nav__icon" style="background: var(--color-warning-bg); color: var(--color-warning);">${icon('send', 20)}</span>
        <span class="sidebar-nav__label">OJT Management</span>
      </a>
      <a class="sidebar-nav__item" href="#/map" data-route="/map">
        <span class="sidebar-nav__icon" style="background: rgba(16,185,129,0.12); color: #10B981;">${icon('map', 20)}</span>
        <span class="sidebar-nav__label">Monitoring Map</span>
      </a>
      <a class="sidebar-nav__item" href="#/evaluations" data-route="/evaluations">
        <span class="sidebar-nav__icon" style="background: rgba(245,158,11,0.12); color: #F59E0B;">${icon('clipboardCheck', 20)}</span>
        <span class="sidebar-nav__label">Evaluations</span>
      </a>
      <a class="sidebar-nav__item" href="#/reports" data-route="/reports">
        <span class="sidebar-nav__icon" style="background: rgba(99,102,241,0.12); color: #6366F1;">${icon('barChart', 20)}</span>
        <span class="sidebar-nav__label">Analytics</span>
      </a>
    </nav>

    <div class="sidebar-divider"></div>

    <!-- Quick Links -->
    <div class="sidebar-section">
      <h4 class="sidebar-section__title">Shortcuts</h4>
      <a class="sidebar-nav__item sidebar-nav__item--compact" href="#/map">
        <span class="sidebar-nav__icon sidebar-nav__icon--sm" style="background: var(--bg-tertiary); color: var(--text-secondary);">${icon('navigation', 16)}</span>
        <span class="sidebar-nav__label">Plan Today's Route</span>
      </a>

    </div>

    <!-- Footer -->
    <div class="sidebar-footer">
      <span class="text-xs text-tertiary">CHMSU HireMe © 2026</span>
    </div>
  `;

  return aside;
}
