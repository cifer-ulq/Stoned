/**
 * CHMSU HireMe — Job Seeker Portal Right Sidebar
 */
import { icon } from './icons.js';
import { apiGet, storageUrl } from '../api/client.js';
import { getState } from '../store.js';

export function createRightSidebar() {
  const user = getState('user');

  const sidebar = document.createElement('aside');
  sidebar.className = 'sidebar-right';
  sidebar.id = 'sidebar-right';

  sidebar.innerHTML = `
    <!-- Career Status Widget -->
    <div class="widget" id="status-widget">
      <h4 class="widget__title">Career Status</h4>
      <div class="widget__content" id="career-widget-content">
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

    <!-- People You May Know -->
    <div class="widget" id="people-widget">
      <div class="widget__header" id="people-widget-header" style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
        <h4 class="widget__title" style="margin-bottom:0;">People You May Know</h4>
      </div>
      <div class="widget__content" id="people-content">
        <div class="skeleton skeleton--text"></div>
        <div class="skeleton skeleton--text-sm"></div>
      </div>
    </div>
  `;

  loadWidgetData(sidebar);
  return sidebar;
}

async function loadWidgetData(sidebar) {
  loadCareerStatus(sidebar);
  loadUpcomingInterviews(sidebar);
  loadPeopleYouMayKnow(sidebar);
}

async function loadCareerStatus(sidebar) {
  const container = sidebar.querySelector('#career-widget-content');
  try {
    const data = await apiGet('/jobseeker/dashboard');
    if (data && data.stats) {
      container.innerHTML = `
        <div class="widget-stat-row">
          <span class="widget-stat__label">${icon('send', 13)} Applications Sent</span>
          <span class="widget-stat__value">${data.stats.applications_sent ?? 0}</span>
        </div>
        <div class="widget-stat-row">
          <span class="widget-stat__label">${icon('clock', 13)} Pending Review</span>
          <span class="widget-stat__value">${data.stats.applications_pending ?? 0}</span>
        </div>
        <div class="widget-stat-row">
          <span class="widget-stat__label">${icon('video', 13)} Upcoming Interviews</span>
          <span class="widget-stat__value">${data.stats.upcoming_interviews ?? 0}</span>
        </div>
      `;
    } else {
      container.innerHTML = `<p class="text-secondary text-sm">No activity yet.</p>`;
    }
  } catch {
    container.innerHTML = `<p class="text-secondary text-sm">Could not load stats.</p>`;
  }
}

function fmtInterviewDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

async function loadUpcomingInterviews(sidebar) {
  const container = sidebar.querySelector('#upcoming-content');
  try {
    const data = await apiGet('/jobseeker/interviews');
    const todayIso = new Date().toISOString().split('T')[0];
    const upcoming = Array.isArray(data) ? data.filter(i => i.scheduled_date >= todayIso).slice(0, 3) : [];
    if (upcoming.length === 0) {
      container.innerHTML = `<p class="text-secondary text-sm">No upcoming interviews.</p>`;
      return;
    }
    container.innerHTML = upcoming.map(iv => `
      <div class="widget-upcoming-item">
        <div class="widget-upcoming-item__icon" style="background:var(--color-error-bg);color:var(--color-error);">${icon('video', 14)}</div>
        <div>
          <div class="widget-upcoming-item__title">${iv.type || 'Interview'}</div>
          <div class="widget-upcoming-item__meta">${fmtInterviewDate(iv.scheduled_date)} · ${iv.scheduled_time?.slice(0,5) || ''}</div>
        </div>
      </div>
    `).join('');
  } catch {
    container.innerHTML = `<p class="text-secondary text-sm">Could not load interviews.</p>`;
  }
}

const PAGE_SIZE = 5;

async function loadPeopleYouMayKnow(sidebar) {
  const widget = sidebar.querySelector('#people-widget');
  const container = sidebar.querySelector('#people-content');
  try {
    const data = await apiGet('/jobseeker/people-you-may-know');
    const people = data?.data || [];
    renderPeopleYouMayKnow(widget, people, 1);
  } catch {
    container.innerHTML = `<p class="text-secondary text-sm">Could not load suggestions.</p>`;
  }
}

function renderPeopleYouMayKnow(widget, allPeople, currentPage = 1) {
  const container = widget.querySelector('#people-content');
  const header = widget.querySelector('#people-widget-header');

  if (!allPeople || allPeople.length === 0) {
    if (header) {
      const existingPager = header.querySelector('.widget-pager-controls');
      if (existingPager) existingPager.remove();
    }
    container.innerHTML = `<p class="text-secondary text-sm">No suggestions yet.</p>`;
    return;
  }

  const total = allPeople.length;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  currentPage = Math.max(1, Math.min(currentPage, totalPages));

  const startIdx = (currentPage - 1) * PAGE_SIZE;
  const visible = allPeople.slice(startIdx, startIdx + PAGE_SIZE);

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
        if (currentPage > 1) renderPeopleYouMayKnow(widget, allPeople, currentPage - 1);
      });
      pager.querySelector('#people-next-top')?.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentPage < totalPages) renderPeopleYouMayKnow(widget, allPeople, currentPage + 1);
      });
    } else if (pager) {
      pager.remove();
    }
  }

  // Render list of peers (no green dot, tight near spacing)
  container.innerHTML = `
    <div id="people-list" style="display:flex;flex-direction:column;gap:2px;">
      ${visible.map(p => renderPersonRow(p)).join('')}
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
      if (currentPage > 1) renderPeopleYouMayKnow(widget, allPeople, currentPage - 1);
    });
    container.querySelector('#people-next-bottom')?.addEventListener('click', (e) => {
      e.preventDefault();
      if (currentPage < totalPages) renderPeopleYouMayKnow(widget, allPeople, currentPage + 1);
    });
  }
}

function renderPersonRow(p) {
  const avatarHtml = p.avatar_url
    ? `<img src="${storageUrl(p.avatar_url)}" alt="${p.name}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" onerror="this.onerror=null;this.parentElement.textContent='${p.initials}';" />`
    : `<span>${p.initials}</span>`;

  const roleBadge = p.is_alumni
    ? `<span style="font-size:0.6rem;font-weight:700;padding:1px 5px;border-radius:99px;background:rgba(16,185,129,0.12);color:#059669;margin-left:4px;display:inline-flex;align-items:center;flex-shrink:0;letter-spacing:0.02em;line-height:1.2;">Graduate</span>`
    : `<span style="font-size:0.6rem;font-weight:700;padding:1px 5px;border-radius:99px;background:rgba(74,108,247,0.12);color:#4A6CF7;margin-left:4px;display:inline-flex;align-items:center;flex-shrink:0;letter-spacing:0.02em;line-height:1.2;">Student</span>`;

  return `
    <a href="#/portfolio/${p.id}" class="widget-person-item widget-person-item--link" style="text-decoration:none;color:inherit;display:flex;align-items:center;gap:8px;padding:5px 6px;border-radius:var(--radius-md);transition:background 0.15s ease;" title="View ${p.name}'s Portfolio">
      <div class="widget-person-item__avatar" style="width:32px;height:32px;border-radius:50%;overflow:hidden;flex-shrink:0;background:var(--bg-tertiary);display:flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:700;color:var(--text-secondary);border:1px solid var(--border-default);">${avatarHtml}</div>
      <div class="widget-person-item__info" style="flex:1;min-width:0;display:flex;flex-direction:column;justify-content:center;">
        <div class="widget-person-item__name" style="display:flex;align-items:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:0.8125rem;line-height:1.25;">
          <span style="overflow:hidden;text-overflow:ellipsis;">${p.name}</span>
          ${roleBadge}
        </div>
        <div class="widget-person-item__role" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:0.7rem;line-height:1.2;margin-top:1px;">${p.headline || p.desired_job_title || p.program || ''}</div>
      </div>
    </a>
  `;
}
