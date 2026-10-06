/**
 * CHMSU HireMe — Right Sidebar (Facebook-style contacts/info panel)
 */
import { icon } from './icons.js';
import { apiGet } from '../api/client.js';
import { getState } from '../store.js';

const MAX_PEOPLE = 7;

export function createRightSidebar() {
  const user = getState('user');
  const isAlumni = user.is_alumni || user.status === 'alumni' || user.rawRole === 'graduate' || user.role?.toLowerCase().includes('graduate') || user.role?.toLowerCase().includes('alumni');
  const isOJT = !isAlumni && (user.is_active_ojt === true || user.status === 'active_ojt');

  const sidebar = document.createElement('aside');
  sidebar.className = 'sidebar-right';
  sidebar.id = 'sidebar-right';

  sidebar.innerHTML = `
    <!-- OJT / Status Widget -->
    <div class="widget" id="status-widget">
      <h4 class="widget__title">${isAlumni ? 'Alumni Status' : 'OJT Progress'}</h4>
      <div class="widget__content" id="ojt-widget-content">
        <div class="skeleton skeleton--text"></div>
        <div class="skeleton skeleton--text-sm"></div>
      </div>
    </div>

    <!-- Interview -->
    <div class="widget" id="upcoming-widget">
      <h4 class="widget__title">Interview</h4>
      <div class="widget__content" id="upcoming-content">
        <div class="skeleton skeleton--text"></div>
        <div class="skeleton skeleton--text-sm"></div>
      </div>
    </div>

    <!-- Contacts / Network -->
    <div class="widget" id="contacts-widget">
      <div class="widget__header">
        <h4 class="widget__title">People You Know</h4>
      </div>
      <div class="widget__content" id="contacts-content">
        <div class="skeleton skeleton--text"></div>
        <div class="skeleton skeleton--text-sm"></div>
      </div>
    </div>
  `;

  loadWidgetData(sidebar, isAlumni);

  return sidebar;
}

/* ── OJT Progress ── */
async function loadOjtProgress(sidebar) {
  const container = sidebar.querySelector('#ojt-widget-content');
  try {
    const res = await apiGet('/student/ojt-tracker');
    if (res && res.progress) {
      renderOjtProgress(container, {
        hoursRendered : res.progress.hoursRendered,
        totalHours    : res.progress.totalHours,
        company       : res.deployment?.company    || 'N/A',
        supervisor    : res.deployment?.supervisor || 'N/A',
      });
      return;
    }
    if (res?.locked) {
      renderOjtScheduled(container, {
        startDate     : res.startDate || 'TBA',
        daysRemaining : res.daysRemaining,
        company       : res.deployment?.company || 'Host Company',
        role          : res.deployment?.postingTitle || 'OJT Trainee',
      });
      return;
    }
  } catch (_) {}

  container.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px 0;color:var(--text-tertiary);text-align:center;">
      ${icon('clock', 22)}
      <span style="font-size:0.72rem;">No active OJT yet</span>
    </div>`;
}

function renderOjtScheduled(container, s) {
  const daysText = s.daysRemaining === 0
    ? 'Starts today'
    : s.daysRemaining === 1
      ? 'Starts tomorrow'
      : typeof s.daysRemaining === 'number'
        ? `Starts in ${s.daysRemaining} days`
        : 'Starting soon';

  container.innerHTML = `
    <div style="padding:4px 0;">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px;">
        <span class="badge badge--accent" style="font-size:0.68rem;padding:2px 8px;font-weight:600;">Scheduled</span>
        <span style="font-size:0.72rem;color:var(--text-accent);font-weight:600;">${daysText}</span>
      </div>
      <div style="font-size:0.85rem;font-weight:700;color:var(--text-primary);margin-bottom:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${s.company}">
        ${s.company}
      </div>
      <div class="widget-info-row" style="margin-bottom:8px;">
        <span class="text-xs text-secondary" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${icon('briefcase', 12)} ${s.role}</span>
      </div>
      <div style="display:flex;align-items:center;gap:6px;padding:6px 10px;background:var(--color-primary-bg);border-radius:var(--radius-sm);font-size:0.74rem;color:var(--color-primary);font-weight:600;">
        ${icon('calendar', 13)} ${s.startDate}
      </div>
    </div>
  `;
}

function renderOjtProgress(container, p) {
  const pct = Math.min(100, Math.round((p.hoursRendered / p.totalHours) * 100));
  container.innerHTML = `
    <div class="widget-progress">
      <div class="widget-progress__header">
        <span class="text-sm font-semibold">${p.hoursRendered} hrs</span>
        <span class="text-xs text-tertiary">${p.totalHours} hrs</span>
      </div>
      <div class="widget-progress__bar">
        <div class="widget-progress__fill" style="width: ${pct}%;"></div>
      </div>
      <span class="text-xs text-secondary">${pct}% complete</span>
    </div>
    <div class="widget-info-row mt-3">
      <span class="text-xs text-secondary">${icon('briefcase', 12)} ${p.company}</span>
    </div>
    <div class="widget-info-row mt-1">
      <span class="text-xs text-secondary">${icon('user', 12)} ${p.supervisor}</span>
    </div>
  `;
}

/* ── Upcoming Interviews ── */
async function loadUpcoming(sidebar) {
  const container = sidebar.querySelector('#upcoming-content');
  let interviews = [];
  try {
    const res = await apiGet('/student/interviews');
    if (res && Array.isArray(res.data)) interviews = res.data;
  } catch (_) {}

  if (!interviews.length) {
    container.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px 0;color:var(--text-tertiary);text-align:center;">
        ${icon('calendar', 22)}
        <span style="font-size:0.72rem;">No upcoming interviews</span>
      </div>`;
    return;
  }

  container.innerHTML = interviews.map(iv => {
    const title    = iv.job_title || iv.title || 'Interview';
    const company  = iv.company_name || iv.company || 'Company';
    const rawDate  = iv.scheduled_date || iv.date || '';
    const time     = iv.scheduled_time || iv.time || '';
    const duration = iv.duration || '45 mins';
    const isOjt    = iv.category === 'ojt' || String(iv.id || '').startsWith('ojt_');
    const catLabel = iv.category_label || (isOjt ? 'OJT Internship' : 'Job Opening');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let isPast = iv.status === 'past' || iv.status === 'done' || iv.status === 'completed' || iv.status === 'finished';
    let dateLabel = rawDate;
    if (rawDate) {
      const parts = String(rawDate).split(/[-\/]/);
      if (parts.length === 3) {
        const d = new Date(+parts[0], +parts[1] - 1, +parts[2]);
        if (d < today) isPast = true;
        dateLabel = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
    }

    return `
      <a href="#/interviews" class="widget-event" style="text-decoration:none;color:inherit;cursor:pointer;display:flex;align-items:flex-start;gap:10px;padding:8px 6px;border-radius:var(--radius-md);transition:background 0.15s;${isPast ? 'opacity:0.9;' : ''}" onmouseover="this.style.background='var(--bg-secondary)'" onmouseout="this.style.background='transparent'">
        <div class="widget-event__dot" style="margin-top:5px;background:${isPast ? '#059669' : (isOjt ? 'var(--color-primary)' : '#2563eb')};${isPast ? 'opacity:0.8;' : ''}"></div>
        <div class="widget-event__info" style="flex:1;min-width:0;">
          <div style="display:flex;align-items:center;gap:5px;margin-bottom:3px;flex-wrap:wrap;">
            <span style="font-size:0.6rem;font-weight:700;padding:1px 6px;border-radius:4px;background:${isOjt ? 'rgba(0,89,48,0.08)' : 'rgba(37,99,235,0.08)'};color:${isOjt ? '#005930' : '#2563eb'};text-transform:uppercase;letter-spacing:0.02em;">
              ${catLabel}
            </span>
            ${isPast ? `
              <span style="font-size:0.6rem;font-weight:700;padding:1px 6px;border-radius:4px;background:rgba(16,185,129,0.12);color:#059669;display:inline-flex;align-items:center;gap:3px;text-transform:uppercase;letter-spacing:0.02em;">
                ${icon('checkCircle', 10)} Finished
              </span>
            ` : `
              <span style="font-size:0.6rem;font-weight:700;padding:1px 6px;border-radius:4px;background:var(--color-primary-bg);color:var(--color-primary);display:inline-flex;align-items:center;gap:3px;text-transform:uppercase;letter-spacing:0.02em;">
                ${icon('clock', 10)} Upcoming
              </span>
            `}
          </div>
          <div class="text-sm font-semibold" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${title}">${title}</div>
          <div class="text-xs text-secondary" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${company}${dateLabel ? ' · ' + dateLabel : ''}</div>
          <div class="text-xs text-tertiary" style="margin-top:2px;">${time ? time + ' · ' : ''}${duration}</div>
        </div>
      </a>
    `;
  }).join('');
}

/* ── People You Know ── */
async function loadPeopleYouKnow(sidebar) {
  const container = sidebar.querySelector('#contacts-content');
  let students = [];
  let total = 0;

  try {
    // Try real API first
    const res = await apiGet('/student/people-you-know');
    if (res && Array.isArray(res.data)) {
      students = res.data;
      total = res.total ?? students.length;
    }
  } catch (_) { /* no data available */ }

  renderPeopleYouKnow(container, students, total);
}

function renderPeopleYouKnow(container, students, total) {
  const visible = students.slice(0, MAX_PEOPLE);
  const hasMore = total > MAX_PEOPLE;

  if (!visible.length) {
    container.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px 0;color:var(--text-tertiary);text-align:center;">
        ${icon('users', 22)}
        <span style="font-size:0.72rem;">No connections yet</span>
      </div>`;
    return;
  }

  container.innerHTML = `
    <div id="people-list">
      ${visible.map(s => renderPersonRow(s)).join('')}
    </div>
    ${hasMore ? `
      <a href="#" id="show-more-people" class="text-xs text-primary" style="display:block;margin-top:8px;text-align:center;">
        Show ${total - MAX_PEOPLE} more
      </a>
    ` : ''}
  `;

  if (hasMore) {
    container.querySelector('#show-more-people').addEventListener('click', e => {
      e.preventDefault();
      container.querySelector('#people-list').innerHTML = students.map(s => renderPersonRow(s)).join('');
      container.querySelector('#show-more-people')?.remove();
    });
  }
}

function renderPersonRow(s) {
  return `
    <div class="widget-contact">
      <div class="widget-contact__avatar">${s.initials}</div>
      <div class="widget-contact__info">
        <span class="text-sm">${s.name}</span>
        <span class="text-xs text-tertiary">${s.program || s.role || ''}</span>
      </div>
      <span class="status-indicator__dot status-indicator__dot--online" style="width:8px;height:8px;border-radius:50%;flex-shrink:0;"></span>
    </div>
  `;
}

/* ── Main loader ── */
async function loadWidgetData(sidebar, isAlumni) {
  if (isAlumni) {
    const user = getState('user');
    const gradYear = user.graduation_year || '';
    const honors   = user.honors || '';
    const detail   = [gradYear ? `Class of ${gradYear}` : '', honors].filter(Boolean).join(' · ');
    sidebar.querySelector('#ojt-widget-content').innerHTML = `
      <div class="widget-status-badge">
        <span class="badge badge--info">${icon('award', 12)} Graduate</span>
      </div>
      ${detail ? `<p class="text-xs text-secondary mt-2">${detail}</p>` : ''}
    `;
  } else {
    loadOjtProgress(sidebar);
  }

  loadUpcoming(sidebar);
  loadPeopleYouKnow(sidebar);
}

