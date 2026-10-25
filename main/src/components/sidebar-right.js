/**
 * CHMSU HireMe — Right Sidebar (Facebook-style contacts/info panel)
 */
import { icon } from './icons.js';
import { apiGet, storageUrl } from '../api/client.js';
import { getState } from '../store.js';

const PAGE_SIZE = 5;

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
      <div class="widget__header" id="contacts-widget-header" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
        <h4 class="widget__title" style="margin-bottom:0;">People You Know</h4>
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
  const widget = sidebar.querySelector('#contacts-widget');
  const container = sidebar.querySelector('#contacts-content');
  let students = [];

  try {
    const res = await apiGet('/student/people-you-know');
    if (res && Array.isArray(res.data)) {
      students = res.data;
    }
  } catch (_) { /* no data available */ }

  renderPeopleYouKnow(widget, students, 1);
}

function renderPeopleYouKnow(widget, allStudents, currentPage = 1) {
  const container = widget.querySelector('#contacts-content');
  const header = widget.querySelector('#contacts-widget-header');

  if (!allStudents || allStudents.length === 0) {
    if (header) {
      const existingPager = header.querySelector('.widget-pager-controls');
      if (existingPager) existingPager.remove();
    }
    container.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px 0;color:var(--text-tertiary);text-align:center;">
        ${icon('users', 22)}
        <span style="font-size:0.72rem;">No connections yet</span>
      </div>`;
    return;
  }

  const total = allStudents.length;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  currentPage = Math.max(1, Math.min(currentPage, totalPages));

  const startIdx = (currentPage - 1) * PAGE_SIZE;
  const visible = allStudents.slice(startIdx, startIdx + PAGE_SIZE);

  // Update header pager controls
  if (header) {
    let pager = header.querySelector('.widget-pager-controls');
    if (totalPages > 1) {
      if (!pager) {
        pager = document.createElement('div');
        pager.className = 'widget-pager-controls';
        pager.style.cssText = 'display:flex;align-items:center;gap:4px;';
        header.appendChild(pager);
      }
      pager.innerHTML = `
        <span style="font-size:0.7rem;color:var(--text-tertiary);font-weight:600;">${currentPage} / ${totalPages}</span>
        <div style="display:flex;align-items:center;gap:2px;">
          <button type="button" class="pager-btn" id="people-prev-top" title="Previous page" ${currentPage === 1 ? 'disabled' : ''} style="width:20px;height:20px;border-radius:4px;border:1px solid var(--border-default);background:var(--bg-secondary);color:var(--text-secondary);display:inline-flex;align-items:center;justify-content:center;cursor:${currentPage === 1 ? 'not-allowed' : 'pointer'};opacity:${currentPage === 1 ? '0.4' : '1'};padding:0;transition:all 0.15s ease;">
            ${icon('chevronLeft', 11)}
          </button>
          <button type="button" class="pager-btn" id="people-next-top" title="Next page" ${currentPage === totalPages ? 'disabled' : ''} style="width:20px;height:20px;border-radius:4px;border:1px solid var(--border-default);background:var(--bg-secondary);color:var(--text-secondary);display:inline-flex;align-items:center;justify-content:center;cursor:${currentPage === totalPages ? 'not-allowed' : 'pointer'};opacity:${currentPage === totalPages ? '0.4' : '1'};padding:0;transition:all 0.15s ease;">
            ${icon('chevronRight', 11)}
          </button>
        </div>
      `;

      pager.querySelector('#people-prev-top')?.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentPage > 1) renderPeopleYouKnow(widget, allStudents, currentPage - 1);
      });
      pager.querySelector('#people-next-top')?.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentPage < totalPages) renderPeopleYouKnow(widget, allStudents, currentPage + 1);
      });
    } else if (pager) {
      pager.remove();
    }
  }

  // Render list of peers (no green dot, tight near spacing)
  container.innerHTML = `
    <div id="people-list" style="display:flex;flex-direction:column;gap:2px;">
      ${visible.map(s => renderPersonRow(s)).join('')}
    </div>
    ${totalPages > 1 ? `
      <div class="widget-pager-footer" style="display:flex;align-items:center;justify-content:space-between;margin-top:6px;padding-top:6px;border-top:1px solid var(--border-default);font-size:0.72rem;">
        <span style="color:var(--text-tertiary);font-size:0.7rem;">
          ${startIdx + 1}–${Math.min(startIdx + PAGE_SIZE, total)} of ${total}
        </span>
        <div style="display:flex;align-items:center;gap:3px;">
          <button type="button" id="people-prev-bottom" class="pager-nav-btn" ${currentPage === 1 ? 'disabled' : ''} style="display:inline-flex;align-items:center;gap:2px;padding:2px 7px;border-radius:4px;border:1px solid var(--border-default);background:var(--bg-secondary);color:var(--text-secondary);font-size:0.68rem;font-weight:600;cursor:${currentPage === 1 ? 'not-allowed' : 'pointer'};opacity:${currentPage === 1 ? '0.4' : '1'};">
            ${icon('chevronLeft', 10)} Prev
          </button>
          <button type="button" id="people-next-bottom" class="pager-nav-btn" ${currentPage === totalPages ? 'disabled' : ''} style="display:inline-flex;align-items:center;gap:2px;padding:2px 7px;border-radius:4px;border:1px solid var(--border-default);background:var(--bg-secondary);color:var(--text-secondary);font-size:0.68rem;font-weight:600;cursor:${currentPage === totalPages ? 'not-allowed' : 'pointer'};opacity:${currentPage === totalPages ? '0.4' : '1'};">
            Next ${icon('chevronRight', 10)}
          </button>
        </div>
      </div>
    ` : ''}
  `;

  if (totalPages > 1) {
    container.querySelector('#people-prev-bottom')?.addEventListener('click', (e) => {
      e.preventDefault();
      if (currentPage > 1) renderPeopleYouKnow(widget, allStudents, currentPage - 1);
    });
    container.querySelector('#people-next-bottom')?.addEventListener('click', (e) => {
      e.preventDefault();
      if (currentPage < totalPages) renderPeopleYouKnow(widget, allStudents, currentPage + 1);
    });
  }
}

function renderPersonRow(s) {
  const avatarHtml = s.avatar_url
    ? `<img src="${storageUrl(s.avatar_url)}" alt="${s.name}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" onerror="this.onerror=null;this.parentElement.textContent='${s.initials}';" />`
    : `<span>${s.initials}</span>`;

  const roleBadge = s.is_alumni
    ? `<span style="font-size:0.6rem;font-weight:700;padding:1px 5px;border-radius:99px;background:rgba(16,185,129,0.12);color:#059669;margin-left:4px;display:inline-flex;align-items:center;flex-shrink:0;letter-spacing:0.02em;line-height:1.2;">Graduate</span>`
    : `<span style="font-size:0.6rem;font-weight:700;padding:1px 5px;border-radius:99px;background:rgba(74,108,247,0.12);color:#4A6CF7;margin-left:4px;display:inline-flex;align-items:center;flex-shrink:0;letter-spacing:0.02em;line-height:1.2;">Student</span>`;

  return `
    <a href="#/portfolio/${s.id}" class="widget-contact widget-contact--link" style="text-decoration:none;color:inherit;display:flex;align-items:center;gap:8px;padding:5px 6px;border-radius:var(--radius-md);transition:background 0.15s ease;" title="View ${s.name}'s Portfolio">
      <div class="widget-contact__avatar" style="width:32px;height:32px;border-radius:50%;overflow:hidden;flex-shrink:0;background:var(--bg-tertiary);display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:700;color:var(--text-secondary);border:1px solid var(--border-default);">${avatarHtml}</div>
      <div class="widget-contact__info" style="flex:1;min-width:0;display:flex;flex-direction:column;justify-content:center;">
        <div class="text-sm font-semibold" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:flex;align-items:center;font-size:0.8125rem;line-height:1.25;">
          <span style="overflow:hidden;text-overflow:ellipsis;">${s.name}</span>
          ${roleBadge}
        </div>
        <div class="text-xs text-tertiary" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:0.7rem;line-height:1.2;margin-top:1px;">${s.headline || s.program || ''}</div>
      </div>
    </a>
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

