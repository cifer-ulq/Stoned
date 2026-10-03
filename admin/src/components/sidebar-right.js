/* -- Sidebar Right -- Admin Portal -- */
import { icon, renderIcons } from './icons.js';
import { apiGetCached, getCached } from '../api/client.js';

const TYPE_ICON = {
  company: 'briefcase',
  ojt:     'layers',
  moa:     'file',
  student: 'users',
};
const TYPE_COLOR = {
  company: 'var(--color-primary)',
  ojt:     'var(--color-warning)',
  moa:     'var(--color-info)',
  student: 'var(--color-success)',
};
const ACT_COLOR = {
  success: 'var(--color-success)',
  primary: 'var(--color-primary)',
  warning: 'var(--color-warning)',
  info:    'var(--color-info)',
};

function renderAllWidgets(el, data) {
  if (!el || !data) return;
  const pendingEl = el.querySelector('#pending-content');
  const activityEl = el.querySelector('#activity-content');
  const upcomingEl = el.querySelector('#upcoming-content');
  if (pendingEl) renderPending(pendingEl, data.pending || []);
  if (activityEl) renderActivity(activityEl, data.activities || []);
  if (upcomingEl) renderUpcoming(upcomingEl, data.upcoming || []);
  renderIcons(el);
}

export async function initSidebarRight() {
  const el = document.getElementById('sidebar-right');
  if (!el) return;

  const cached = getCached('/admin/sidebar');

  // Base shell
  el.innerHTML = `
    <div class="widget">
      <div class="widget__title">${icon('clock', 13)} Pending</div>
      <div class="widget__content" id="pending-content">
        ${cached ? '' : skeletonRows(3)}
      </div>
    </div>
    <div class="widget">
      <div class="widget__title">${icon('activity', 13)} Activity</div>
      <div class="widget__content" id="activity-content">
        ${cached ? '' : skeletonRows(4)}
      </div>
    </div>
    <div class="widget">
      <div class="widget__title">${icon('calendar', 13)} Upcoming</div>
      <div class="widget__content" id="upcoming-content">
        ${cached ? '' : skeletonRows(2)}
      </div>
    </div>
  `;

  if (cached?.data) {
    renderAllWidgets(el, cached.data);
  } else {
    renderIcons(el);
  }

  try {
    const data = await apiGetCached('/admin/sidebar', {
      onUpdate: (fresh) => {
        renderAllWidgets(el, fresh);
      },
    });

    if (data && !cached) {
      renderAllWidgets(el, data);
    }
  } catch (_) {
    if (!cached) {
      el.querySelectorAll('.widget__content').forEach(c => {
        c.innerHTML = emptyState('No data available');
      });
    }
  }
}

/* -- Pending Approvals -- */
function renderPending(container, items) {
  if (!items.length) {
    container.innerHTML = emptyState('No pending approvals');
    return;
  }

  container.innerHTML = items.map((p, i) => `
    <div class="approval-item" ${i < items.length - 1 ? '' : 'style="border-bottom:none;"'}>
      <div class="approval-item__icon" style="background:${TYPE_COLOR[p.type] ?? 'var(--color-primary)'}15;color:${TYPE_COLOR[p.type] ?? 'var(--color-primary)'};">
        ${icon(TYPE_ICON[p.type] ?? 'file', 14)}
      </div>
      <div class="approval-item__info">
        <div class="approval-item__name">${p.name}</div>
        <div class="approval-item__detail">${p.detail}</div>
      </div>
    </div>
  `).join('');
}

/* -- Recent Activity -- */
function renderActivity(container, items) {
  if (!items.length) {
    container.innerHTML = emptyState('No recent activity');
    return;
  }

  container.innerHTML = items.map((a, i) => `
    <div class="activity-item" ${i === items.length - 1 ? 'style="border-bottom:none;"' : ''}>
      <div class="activity-item__icon" style="background:${ACT_COLOR[a.color] ?? 'var(--color-primary)'}15;color:${ACT_COLOR[a.color] ?? 'var(--color-primary)'};">
        ${icon(a.icon ?? 'activity', 13)}
      </div>
      <div class="activity-item__content">
        <div class="activity-item__text">${a.text}</div>
        <div class="activity-item__time">${a.time}</div>
      </div>
    </div>
  `).join('');
}

/* -- Upcoming (Expiring MOAs) -- */
function renderUpcoming(container, items) {
  if (!items.length) {
    container.innerHTML = emptyState('No upcoming deadlines');
    return;
  }

  container.innerHTML = items.map((e, i) => `
    <div class="widget-event" ${i === items.length - 1 ? 'style="border-bottom:none;"' : ''}>
      <div class="widget-event__dot" style="background:${e.days <= 14 ? 'var(--color-error)' : e.days <= 30 ? 'var(--color-warning)' : 'var(--color-primary)'};"></div>
      <div class="widget-event__info">
        <div class="text-sm font-semibold" style="font-size:var(--text-xs);font-weight:var(--weight-semibold);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${e.title}</div>
        <div class="text-xs text-secondary" style="font-size:0.625rem;color:var(--text-tertiary);margin-top:2px;">${e.date} &middot; ${e.days}d left</div>
      </div>
    </div>
  `).join('');
}

/* -- Helpers -- */
function skeletonRows(n) {
  return Array(n).fill(0).map(() => `
    <div style="display:flex;align-items:center;gap:8px;padding:6px 0;">
      <div style="width:28px;height:28px;border-radius:var(--radius-md);background:var(--bg-secondary);flex-shrink:0;animation:pulse 1.5s ease-in-out infinite;"></div>
      <div style="flex:1;display:flex;flex-direction:column;gap:4px;">
        <div style="height:10px;background:var(--bg-secondary);border-radius:3px;width:80%;animation:pulse 1.5s ease-in-out infinite;"></div>
        <div style="height:8px;background:var(--bg-secondary);border-radius:3px;width:55%;animation:pulse 1.5s ease-in-out infinite;"></div>
      </div>
    </div>
  `).join('');
}

function emptyState(msg) {
  return `
    <div style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px 0;color:var(--text-tertiary);text-align:center;">
      <span style="font-size:0.72rem;">${msg}</span>
    </div>
  `;
}