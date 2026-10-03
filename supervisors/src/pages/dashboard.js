/* ===========================
   Dashboard Page — Supervisor Portal
   Clean, Neat, Executive Redesign
   Supports Instant Cache Rendering & Background SWR
   =========================== */

import { icon } from '../components/icons.js';
import { apiGet, apiCache } from '../api/client.js';
import { setState } from '../store.js';

/* ── helpers ── */
function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function todayLabel() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

function initials(name = '') {
  return name.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function pctColor(p) {
  return p >= 80 ? '#059669' : p >= 40 ? '#005930' : '#0284C7';
}

function populateDashboardData(container, apiData) {
  if (!container || !apiData) return;

  /* ── Update user info ── */
  const user = apiData.user;
  const greetEl = container.querySelector('#db-greeting');
  const scopeEl = container.querySelector('#db-scope');
  if (greetEl) {
    const name = user?.name || 'Supervisor';
    greetEl.textContent = `${greeting()}, ${name}`;
  }
  if (scopeEl && user?.company_name) {
    scopeEl.textContent = user.company_name;
  }
  if (user) {
    setState('user.name',       user.name);
    setState('user.initials',   user.initials);
    setState('user.role',       user.position);
    setState('user.department', user.company_name || '');
    const sidebarName = document.querySelector('.sidebar-user__name');
    const sidebarRole = document.querySelector('.sidebar-user__role');
    const navAvatar   = document.querySelector('.navbar__avatar');
    if (sidebarName) sidebarName.textContent = user.name;
    if (sidebarRole) sidebarRole.textContent = user.position + (user.company_name ? ` · ${user.company_name}` : '');
    if (navAvatar)   navAvatar.textContent = user.initials;
  }

  /* ── KPI cards ── */
  const stats = apiData.stats || {};
  const kpiRow = container.querySelector('#db-kpi-row');
  if (kpiRow) {
    const cards = [
      {
        label:  'Active Trainees',
        value:  stats.activeTrainees ?? 0,
        sub:    'Currently deployed',
        trend:  'Active cohort',
        isUp:   true,
        ic:     'users',
        color:  '#005930',
      },
      {
        label:  'Pending Endorsements',
        value:  stats.pendingInterests ?? 0,
        sub:    'Awaiting review',
        trend:  stats.pendingInterests > 0 ? 'Requires action' : 'Caught up',
        isUp:   stats.pendingInterests > 0 ? false : true,
        ic:     'fileText',
        color:  '#D97706',
      },
      {
        label:  'Flagged Issues',
        value:  stats.flaggedStudents ?? 0,
        sub:    'Attendance or location',
        trend:  stats.flaggedStudents > 0 ? 'Needs attention' : 'All clear',
        isUp:   stats.flaggedStudents > 0 ? false : null,
        ic:     'alertTriangle',
        color:  stats.flaggedStudents > 0 ? '#EF4444' : '#059669',
      },
      {
        label:  'Total Endorsed',
        value:  stats.totalEndorsed ?? 0,
        sub:    'Students endorsed',
        trend:  'Approved candidates',
        isUp:   true,
        ic:     'checkCircle',
        color:  '#0284C7',
      },
    ];

    kpiRow.innerHTML = cards.map(c => `
      <div class="db-kpi">
        <div class="db-kpi__header">
          <span class="db-kpi__label">${c.label}</span>
          <div class="db-kpi__icon" style="background:${c.color}14;color:${c.color}">
            ${icon(c.ic, 16)}
          </div>
        </div>
        <div class="db-kpi__value">${c.value}</div>
        <div class="db-kpi__footer">
          <span class="db-kpi__trend ${c.isUp === true ? 'db-kpi__trend--good' : c.isUp === false ? 'db-kpi__trend--warn' : 'db-kpi__trend--neutral'}">
            ${c.trend}
          </span>
          <span class="db-kpi__sub">${c.sub}</span>
        </div>
      </div>
    `).join('');
  }

  /* ── Ending soon ── */
  const ending = apiData.endingSoon || [];
  const endingEl = container.querySelector('#db-ending-body');
  if (endingEl) {
    if (!ending.length) {
      endingEl.innerHTML = `
        <div class="db-empty">
          <div class="db-empty__icon">${icon('clock', 22)}</div>
          <p class="db-empty__text">No trainees ending in the next 30 days.</p>
        </div>`;
    } else {
      endingEl.innerHTML = `
        <div class="db-ending-list">
          ${ending.map(t => {
            const urgencyColor = t.daysLeft <= 14 ? '#EF4444' : t.daysLeft <= 21 ? '#D97706' : '#059669';
            return `
              <div class="db-ending-row">
                <div class="db-ending-avatar" style="background:${urgencyColor}14;color:${urgencyColor}">
                  ${initials(t.name)}
                </div>
                <div class="db-ending-info">
                  <span class="db-ending-name">${t.name}</span>
                  <span class="db-ending-course">${t.course}</span>
                </div>
                <div class="db-ending-meta">
                  <span class="db-ending-days" style="color:${urgencyColor};background:${urgencyColor}12;border-color:${urgencyColor}25">
                    ${t.daysLeft}d left
                  </span>
                  <span class="db-ending-hrs">${t.hoursLeft} hrs rem.</span>
                </div>
              </div>`;
          }).join('')}
        </div>`;
    }
  }

  /* ── Recent Activity ── */
  const acts = apiData.recentActivity || [];
  const actEl = container.querySelector('#db-activity-body');
  if (actEl) {
    if (!acts.length) {
      actEl.innerHTML = `
        <div class="db-empty">
          <div class="db-empty__icon">${icon('inbox', 22)}</div>
          <p class="db-empty__text">No recent supervisory activity recorded.</p>
        </div>`;
    } else {
      const cfgMap = {
        visit:    { color: '#0284C7', ic: 'mapPin' },
        eval:     { color: '#059669', ic: 'clipboardCheck' },
        flag:     { color: '#EF4444', ic: 'alertTriangle' },
        report:   { color: '#7C3AED', ic: 'fileText' },
        endorsed: { color: '#005930', ic: 'checkCircle' },
        accepted: { color: '#059669', ic: 'userCheck' },
        rejected: { color: '#EF4444', ic: 'x' },
      };
      actEl.innerHTML = `
        <div class="db-activity-timeline">
          ${acts.slice(0, 6).map(a => {
            const cfg = cfgMap[a.type] || cfgMap[a.status] || { color: '#64748B', ic: 'clock' };
            const label = a.text || `${a.student_name} — ${a.posting_title}`;
            const time  = a.time || a.updated_at || '';
            return `
              <div class="db-act-row">
                <div class="db-act-dot" style="background:${cfg.color}14;color:${cfg.color}">
                  ${icon(cfg.ic, 13)}
                </div>
                <div class="db-act-content">
                  <span class="db-act-text">${label}</span>
                  <span class="db-act-time">${time}</span>
                </div>
              </div>`;
          }).join('')}
        </div>`;
    }
  }

  /* ── Active Trainees Table ── */
  const trainees = apiData.trainees || [];
  const trEl = container.querySelector('#db-trainees-body');
  if (trEl) {
    if (!trainees.length) {
      trEl.innerHTML = `
        <div class="db-empty">
          <div class="db-empty__icon">${icon('users', 24)}</div>
          <p class="db-empty__title">No active trainees enrolled</p>
          <p class="db-empty__text">Endorsed students currently completing hours will appear here.</p>
        </div>`;
    } else {
      trEl.innerHTML = `
        <div class="db-table-wrap">
          <table class="db-table">
            <thead>
              <tr>
                <th>Student Trainee</th>
                <th>Host Organization</th>
                <th>Required Hours Progress</th>
                <th>Compliance</th>
              </tr>
            </thead>
            <tbody>
              ${trainees.slice(0, 6).map(t => {
                const completed = t.completedHours ?? 0;
                const required  = t.requiredHours ?? 500;
                const pct       = Math.min(100, Math.round((completed / required) * 100));
                const bar       = pctColor(pct);
                const init      = initials(t.name || t.student_name || '');
                const name      = t.name || t.student_name || '—';
                const course    = t.course || t.program || 'Student';
                const co        = t.company || t.company_name || 'Partner Company';
                const coSub     = t.postingTitle || t.posting_title || '';
                const isFlagged = t.status === 'flagged';
                return `
                  <tr>
                    <td class="db-td--user">
                      <div class="db-avatar"><span>${init}</span></div>
                      <div class="db-user-info">
                        <span class="db-user-name">${name}</span>
                        <span class="db-user-sub">${course}</span>
                      </div>
                    </td>
                    <td>
                      <span class="db-company-name">${co}</span>
                      ${coSub ? `<span class="db-company-sub">${coSub}</span>` : ''}
                    </td>
                    <td style="min-width:180px">
                      <div class="db-progress-wrap">
                        <div class="db-progress-track">
                          <div class="db-progress-fill" style="width:${pct}%;background:${bar}"></div>
                        </div>
                        <span class="db-progress-pct" style="color:${bar}">${pct}%</span>
                      </div>
                      <span class="db-progress-hours">${completed} of ${required} hours completed</span>
                    </td>
                    <td>
                      <span class="db-status-badge ${isFlagged ? 'db-status-badge--flag' : 'db-status-badge--active'}">
                        ${isFlagged ? icon('alertTriangle', 11) + ' Flagged' : icon('check', 11) + ' Active'}
                      </span>
                    </td>
                  </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
        ${trainees.length > 6 ? `
          <div class="db-table-footer">
            <span>Showing 6 of ${trainees.length} active trainees</span>
            <a href="#/trainees" class="db-table-more-link">View all trainees ${icon('arrowRight', 12)}</a>
          </div>` : ''}
      `;
    }
  }
}

/* ══════════════════════════════════════
   ENTRY POINT
══════════════════════════════════════ */
export default async function dashboardPage(container) {
  container.innerHTML = `
    <div class="db-page fade-in">
      <!-- Top Header -->
      <div class="db-header">
        <div class="db-header__left">
          <div class="db-header__greeting-group">
            <h1 class="db-header__title" id="db-greeting">Loading dashboard…</h1>
            <span class="db-live-badge"><span class="db-live-dot"></span>Active Monitoring</span>
          </div>
          <p class="db-header__sub">
            <span class="db-header__date">${icon('calendar', 13)} ${todayLabel()}</span>
            <span class="db-header__dot-sep">·</span>
            <span class="db-header__scope" id="db-scope">Supervisory Overview</span>
          </p>
        </div>
        <div class="db-header__actions">
          <div class="db-header__nav-group">
            <a href="#/trainees" class="db-btn-link">${icon('users', 14)} <span>Trainees</span></a>
            <a href="#/map"      class="db-btn-link">${icon('map', 14)} <span>Map View</span></a>
            <a href="#/reports"  class="db-btn-link">${icon('barChart', 14)} <span>Analytics</span></a>
          </div>
          <button class="db-btn-refresh" id="db-refresh-btn" title="Refresh data">
            ${icon('refreshCw', 14)}
          </button>
        </div>
      </div>

      <!-- KPI Row (4 clean executive cards) -->
      <div class="db-kpi-row" id="db-kpi-row">
        ${[1, 2, 3, 4].map(() => '<div class="skeleton skeleton--card" style="height:100px;border-radius:12px"></div>').join('')}
      </div>

      <!-- Middle Row: Ending Soon + Recent Monitoring Activity -->
      <div class="db-mid-row">
        <!-- Trainees Ending Soon -->
        <div class="db-card" id="db-ending-card">
          <div class="db-card__head">
            <div class="db-card__head-title">
              <span class="db-card__icon" style="background:#D9770614;color:#D97706">${icon('clock', 15)}</span>
              <span>Ending Soon</span>
            </div>
            <a href="#/trainees" class="db-card__link">View all ${icon('arrowRight', 11)}</a>
          </div>
          <div class="db-card__body" id="db-ending-body">
            <div class="skeleton skeleton--text"></div>
            <div class="skeleton skeleton--text-sm" style="margin-top:8px"></div>
          </div>
        </div>

        <!-- Recent Monitoring Activity -->
        <div class="db-card" id="db-activity-card">
          <div class="db-card__head">
            <div class="db-card__head-title">
              <span class="db-card__icon" style="background:#00593014;color:#005930">${icon('zap', 15)}</span>
              <span>Monitoring Timeline</span>
            </div>
            <span class="db-card__tag">Latest updates</span>
          </div>
          <div class="db-card__body" id="db-activity-body">
            <div class="skeleton skeleton--text"></div>
            <div class="skeleton skeleton--text-sm" style="margin-top:8px"></div>
          </div>
        </div>
      </div>

      <!-- Bottom Card: Active Trainees Fleet Progress -->
      <div class="db-card db-card--wide" id="db-trainees-card">
        <div class="db-card__head">
          <div class="db-card__head-title">
            <span class="db-card__icon" style="background:#05966914;color:#059669">${icon('users', 15)}</span>
            <div>
              <span class="db-card__title-main">Active Trainee Progress</span>
              <span class="db-card__title-sub">Current students deployed with completed hours tracking</span>
            </div>
          </div>
          <a href="#/trainees" class="db-card__link">Full Directory ${icon('arrowRight', 12)}</a>
        </div>
        <div class="db-card__body db-card__body--flush" id="db-trainees-body">
          <div style="padding:16px"><div class="skeleton skeleton--text"></div></div>
        </div>
      </div>
    </div>
  `;

  // Attach refresh
  container.querySelector('#db-refresh-btn')?.addEventListener('click', () => {
    dashboardPage(container);
  });

  // Instant Cached Render if present
  const cached = apiCache.get('/supervisor/dashboard')?.data;
  if (cached) {
    populateDashboardData(container, cached);
  }

  /* ── Load API data (serves cached or fetches fresh) ── */
  let apiData = null;
  try {
    const res = await apiGet('/supervisor/dashboard');
    if (res?.success) apiData = res.data;
  } catch (_) {}

  if (apiData) {
    populateDashboardData(container, apiData);
  }
}
