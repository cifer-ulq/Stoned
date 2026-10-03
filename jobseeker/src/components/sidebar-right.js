/**
 * CHMSU HireMe — Job Seeker Portal Right Sidebar
 */
import { icon } from './icons.js';
import { apiGet } from '../api/client.js';
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
      <h4 class="widget__title">People You May Know</h4>
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

async function loadPeopleYouMayKnow(sidebar) {
  const container = sidebar.querySelector('#people-content');
  try {
    const data = await apiGet('/jobseeker/people-you-may-know');
    const people = data?.data || [];
    if (people.length === 0) {
      container.innerHTML = `<p class="text-secondary text-sm">No suggestions yet.</p>`;
      return;
    }
    container.innerHTML = people.slice(0, 5).map(p => `
      <div class="widget-person-item">
        <div class="widget-person-item__avatar">${p.initials}</div>
        <div class="widget-person-item__info">
          <div class="widget-person-item__name">${p.name}</div>
          <div class="widget-person-item__role">${p.desired_job_title}${p.work_preference ? ' · ' + p.work_preference : ''}</div>
        </div>
      </div>
    `).join('');
  } catch {
    container.innerHTML = `<p class="text-secondary text-sm">Could not load suggestions.</p>`;
  }
}
