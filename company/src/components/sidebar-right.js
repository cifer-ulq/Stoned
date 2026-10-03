/**
 * CHMSU HireMe — Company Portal Right Sidebar
 */
import { icon } from './icons.js';
import { apiFetch } from '../api/client.js';

export function createRightSidebar() {
  const sidebar = document.createElement('aside');
  sidebar.className = 'sidebar-right';
  sidebar.id = 'sidebar-right';

  sidebar.innerHTML = `
    <div class="widget" id="hiring-widget">
      <h4 class="widget__title">Hiring Pipeline</h4>
      <div class="widget__content" id="pipeline-content">
        <div class="skeleton skeleton--text"></div>
        <div class="skeleton skeleton--text-sm"></div>
      </div>
    </div>

    <div class="widget" id="upcoming-widget">
      <h4 class="widget__title">Today's Schedule</h4>
      <div class="widget__content" id="schedule-content">
        <div class="skeleton skeleton--text"></div>
        <div class="skeleton skeleton--text-sm"></div>
      </div>
    </div>

    <div class="widget" id="recent-applicants-widget">
      <div class="widget__header">
        <h4 class="widget__title" style="margin-bottom: 0;">Recent Applicants</h4>
      </div>
      <div class="widget__content" id="recent-applicants-content">
        <div class="skeleton skeleton--text"></div>
        <div class="skeleton skeleton--text-sm"></div>
      </div>
    </div>
  `;

  loadWidgetData(sidebar);

  return sidebar;
}

async function loadWidgetData(sidebar) {
  // Pipeline widget
  const analyticsRes = await apiFetch('analytics/overview', { delay: 400 });
  if (analyticsRes.success) {
    const funnel = analyticsRes.data.hiringFunnel;
    sidebar.querySelector('#pipeline-content').innerHTML = `
      <div class="progress-list">
        <div class="progress-item">
          <div class="progress-item__header">
            <span class="text-xs">Applied</span>
            <span class="text-xs font-semibold">${funnel.applied}</span>
          </div>
          <div class="progress-item__bar">
            <div class="progress-item__fill" style="width: 100%; background: var(--color-primary);"></div>
          </div>
        </div>
        <div class="progress-item">
          <div class="progress-item__header">
            <span class="text-xs">Screened</span>
            <span class="text-xs font-semibold">${funnel.screened}</span>
          </div>
          <div class="progress-item__bar">
            <div class="progress-item__fill" style="width: ${Math.round(funnel.screened / funnel.applied * 100)}%; background: var(--color-info);"></div>
          </div>
        </div>
        <div class="progress-item">
          <div class="progress-item__header">
            <span class="text-xs">Interviewed</span>
            <span class="text-xs font-semibold">${funnel.interviewed}</span>
          </div>
          <div class="progress-item__bar">
            <div class="progress-item__fill" style="width: ${Math.round(funnel.interviewed / funnel.applied * 100)}%; background: var(--color-warning);"></div>
          </div>
        </div>
        <div class="progress-item">
          <div class="progress-item__header">
            <span class="text-xs">Offered</span>
            <span class="text-xs font-semibold">${funnel.offered}</span>
          </div>
          <div class="progress-item__bar">
            <div class="progress-item__fill" style="width: ${Math.round(funnel.offered / funnel.applied * 100)}%; background: var(--color-success);"></div>
          </div>
        </div>
        <div class="progress-item">
          <div class="progress-item__header">
            <span class="text-xs">Hired</span>
            <span class="text-xs font-semibold">${funnel.hired}</span>
          </div>
          <div class="progress-item__bar">
            <div class="progress-item__fill" style="width: ${Math.round(funnel.hired / funnel.applied * 100)}%; background: var(--color-success);"></div>
          </div>
        </div>
      </div>
    `;
  }

  // Schedule widget
  const schedRes = await apiFetch('interviews/schedule', { delay: 500 });
  if (schedRes.success) {
    sidebar.querySelector('#schedule-content').innerHTML = schedRes.data.map(item => `
      <div class="iv-schedule__item ${item.current ? 'iv-schedule__current' : ''}">
        <div class="iv-schedule__time">${item.time}</div>
        <div class="iv-schedule__content">
          <div class="iv-schedule__title">${item.title}</div>
          <div class="iv-schedule__detail">${item.detail}</div>
        </div>
      </div>
    `).join('');
  }

  // Recent applicants
  const appRes = await apiFetch('applicants', { delay: 600 });
  if (appRes.success) {
    sidebar.querySelector('#recent-applicants-content').innerHTML = appRes.data.slice(0, 5).map(a => `
      <div class="widget-contact">
        <div class="widget-contact__avatar">${a.initials}</div>
        <div class="widget-contact__info">
          <span class="text-sm">${a.name}</span>
          <span class="text-xs text-tertiary">${a.appliedFor}</span>
        </div>
        <span class="badge badge--${a.status === 'offered' ? 'success' : a.status === 'interview' ? 'info' : a.status === 'reviewed' ? 'warning' : a.status === 'rejected' ? 'error' : 'neutral'}" style="font-size: 0.6rem; padding: 1px 6px;">${a.status}</span>
      </div>
    `).join('');
  }
}
