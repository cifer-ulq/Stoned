/* ===========================
   OJT Analytics & Insights — Supervisor Portal
   Clean, Neat, Executive Redesign
   =========================== */

import { icon } from '../components/icons.js';
import { apiGet } from '../api/client.js';

const PALETTE = ['#005930', '#059669', '#0284C7', '#D97706', '#7C3AED', '#0D9488', '#E11D48'];

// ─────────────────────────────────────────────────────────────────────────────
// Primitives & Helpers
// ─────────────────────────────────────────────────────────────────────────────

function donut(pct, color, size = 96, stroke = 9) {
  const r    = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const fill = circ * (Math.min(100, Math.max(0, pct)) / 100);
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="transform:rotate(-90deg);display:block;flex-shrink:0">
      <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="var(--border-default)" stroke-width="${stroke}"/>
      <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="${color}" stroke-width="${stroke}"
        stroke-dasharray="${fill.toFixed(1)} ${circ.toFixed(1)}" stroke-linecap="round"
        style="transition:stroke-dasharray .8s cubic-bezier(.16,1,.3,1)"/>
    </svg>`;
}

function pill(text, color, bg) {
  return `<span class="an-status-chip" style="background:${bg};color:${color};border:1px solid ${color}25">${text}</span>`;
}

function cardHead(ic, title, sub = '', extra = '') {
  return `
    <div class="an-card__head">
      <div class="an-card__head-left">
        <div class="an-card__head-icon">${icon(ic, 16)}</div>
        <div class="an-card__head-titles">
          <span class="an-card__title">${title}</span>
          ${sub ? `<span class="an-card__sub">${sub}</span>` : ''}
        </div>
      </div>
      ${extra ? `<div class="an-card__head-extra">${extra}</div>` : ''}
    </div>`;
}

function emptyState(msg, iconName = 'inbox') {
  return `
    <div class="an-empty">
      <div class="an-empty__icon">${icon(iconName, 24)}</div>
      <p class="an-empty__text">${msg}</p>
    </div>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton Placeholder
// ─────────────────────────────────────────────────────────────────────────────

function skeleton() {
  const sk = h => `<div class="skeleton skeleton--card" style="height:${h}px;border-radius:12px"></div>`;
  return `
    <div class="an-skeleton">
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px">
        ${sk(100)}${sk(100)}${sk(100)}
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:14px">
        ${sk(100)}${sk(100)}${sk(100)}
      </div>
      <div style="display:grid;grid-template-columns:1.4fr 1fr;gap:16px;margin-top:16px">
        ${sk(260)}${sk(260)}
      </div>
    </div>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Page Entry
// ─────────────────────────────────────────────────────────────────────────────

export default function analyticsPage(container) {
  const now = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  container.innerHTML = `
    <div class="an-page fade-in">
      <!-- Top Header -->
      <div class="an-header">
        <div class="an-header__left">
          <div class="an-header__icon">${icon('barChart2', 22)}</div>
          <div>
            <div class="an-header__title-row">
              <h1 class="an-header__title">OJT Analytics &amp; Insights</h1>
              <span class="an-live-badge"><span class="an-live-dot"></span>Live Sync Active</span>
            </div>
            <p class="an-header__sub">Supervisory oversight of cohort milestones, attendance logs, and location compliance · ${now}</p>
          </div>
        </div>
        <div class="an-header__actions">
          <button class="an-btn-refresh" id="an-refresh-btn" title="Refresh metrics">
            ${icon('refreshCw', 14)}
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <!-- Segmented Tab Bar -->
      <div class="an-tabs-bar">
        <div class="an-tabs" role="tablist">
          <button class="an-tab an-tab--active" data-tab="overview" role="tab" aria-selected="true">
            ${icon('layout', 14)} <span>Overview &amp; Pipeline</span>
          </button>
          <button class="an-tab" data-tab="attendance" role="tab" aria-selected="false">
            ${icon('calendar', 14)} <span>Daily Attendance &amp; Logs</span>
          </button>
          <button class="an-tab" data-tab="progress" role="tab" aria-selected="false">
            ${icon('trendingUp', 14)} <span>Cohort Progress &amp; Demographics</span>
          </button>
          <div class="an-tabs__ink" id="an-tabs-ink"></div>
        </div>
      </div>

      <!-- Content Root -->
      <div id="an-root">${skeleton()}</div>
    </div>
  `;

  injectStyles();
  loadAnalytics(container);

  // Refresh button
  container.querySelector('#an-refresh-btn')?.addEventListener('click', () => {
    analyticsPage(container);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Load & Render
// ─────────────────────────────────────────────────────────────────────────────

async function loadAnalytics(container) {
  let data = null;
  try {
    const res = await apiGet('/supervisor/analytics');
    data = res?.data ?? null;
  } catch {}

  const root = container.querySelector('#an-root');
  if (!data) {
    root.innerHTML = `
      <div class="an-empty an-empty--error">
        <div class="an-empty__icon" style="color:#EF4444">${icon('alertCircle', 32)}</div>
        <p class="an-empty__title">Unable to load analytics data</p>
        <p class="an-empty__text">Please check your network connection and try reloading.</p>
        <button class="btn btn-secondary" id="an-retry-btn" style="margin-top:12px">
          ${icon('refreshCw', 14)} Retry
        </button>
      </div>`;
    root.querySelector('#an-retry-btn')?.addEventListener('click', () => analyticsPage(container));
    return;
  }

  const { kpi: k, funnel, trainees, hoursBuckets, courseDist, companyDist,
          topPerformers, flagged, last14Days, locationStats, recentLogs } = data;

  // ── 1. KPI Cards (6 Cards) ───────────────────────────────────────────────
  const kpis = [
    { label: 'Active Trainees',    value: k.activeTrainees,                   icon: 'users',        color: '#005930', sub: 'Currently deployed', trend: 'Active cohort',   isUp: true },
    { label: 'Total Endorsed',     value: k.totalEndorsed,                    icon: 'send',         color: '#059669', sub: 'Approved students',  trend: `${k.totalEndorsed - k.activeTrainees} completed`, isUp: true },
    { label: 'Pending Letters',    value: k.pendingLetters,                   icon: 'fileText',     color: '#D97706', sub: 'Awaiting signature', trend: k.pendingLetters > 0 ? 'Requires action' : 'All clear', isUp: k.pendingLetters > 0 ? false : true },
    { label: 'Total Hours Rendered', value: k.totalHoursLogged.toLocaleString(), icon: 'clock',     color: '#0284C7', sub: 'Cumulative hours',   trend: `${k.logsMonth} logs this month`, isUp: true },
    { label: 'Attendance Today',   value: k.logsToday,                        icon: 'checkCircle',  color: '#0D9488', sub: 'Active logs submitted', trend: `${k.logsWeek} this week`, isUp: true },
    { label: 'Flagged Trainees',   value: k.flaggedCount,                     icon: 'alertTriangle', color: k.flaggedCount > 0 ? '#EF4444' : '#059669', sub: 'Location/missing logs', trend: k.flaggedCount > 0 ? 'Needs attention' : 'All clear', isUp: k.flaggedCount > 0 ? false : true },
  ];

  const kpiGridHtml = `
    <div class="an-kpi-grid">
      ${kpis.map(c => `
        <div class="an-kpi-card">
          <div class="an-kpi-card__top">
            <span class="an-kpi-card__label">${c.label}</span>
            <div class="an-kpi-card__icon" style="background:${c.color}14;color:${c.color}">
              ${icon(c.icon, 16)}
            </div>
          </div>
          <div class="an-kpi-card__value">${c.value}</div>
          <div class="an-kpi-card__footer">
            <span class="an-kpi-card__trend ${c.isUp === true ? 'an-trend--good' : c.isUp === false ? 'an-trend--warn' : 'an-trend--neutral'}">
              ${c.trend}
            </span>
            <span class="an-kpi-card__sub">${c.sub}</span>
          </div>
        </div>`).join('')}
    </div>`;

  // ── 2. Endorsement Funnel ────────────────────────────────────────────────
  const funnelSteps = [
    { label: 'Pending Review',    val: funnel.pending,     color: '#D97706', step: 1 },
    { label: 'Letters Endorsed',  val: funnel.endorsed,    color: '#0284C7', step: 2 },
    { label: 'OJT Started',       val: funnel.ojt_started, color: '#005930', step: 3 },
    { label: 'Rejected/Archived', val: funnel.rejected,    color: '#E11D48', step: 4 },
  ];
  const funnelMax = Math.max(...funnelSteps.map(s => s.val), 1);

  const funnelCard = `
    <div class="an-card">
      ${cardHead('route', 'Endorsement Pipeline', 'Progression from endorsement request to host deployment')}
      <div class="an-funnel">
        ${funnelSteps.map((s, i) => {
          const w = Math.max(4, Math.round((s.val / funnelMax) * 100));
          const prev = i > 0 ? (funnelSteps[i - 1].val || 1) : null;
          const conv = prev !== null && s.step !== 4 ? Math.round((s.val / prev) * 100) : null;
          return `
            ${i > 0 ? `
              <div class="an-funnel__transition">
                <div class="an-funnel__stem"></div>
                ${conv !== null ? `<span class="an-funnel__rate">${conv}% conversion</span>` : ''}
              </div>` : ''}
            <div class="an-funnel__row">
              <div class="an-funnel__meta">
                <span class="an-funnel__badge" style="background:${s.color}14;color:${s.color}">${s.step}</span>
                <span class="an-funnel__label">${s.label}</span>
              </div>
              <div class="an-funnel__track">
                <div class="an-funnel__fill" style="width:${w}%;background:${s.color}"></div>
              </div>
              <div class="an-funnel__stats">
                <span class="an-funnel__count">${s.val}</span>
                <span class="an-funnel__pct">${w}%</span>
              </div>
            </div>`;
        }).join('')}
      </div>
    </div>`;

  // ── 3. Location Compliance Gauge ─────────────────────────────────────────
  const locTotal  = locationStats.inSite + locationStats.tooFar + locationStats.noGps || 1;
  const inSitePct = Math.round((locationStats.inSite / locTotal) * 100);
  const tooFarPct = Math.round((locationStats.tooFar / locTotal) * 100);
  const noGpsPct  = Math.max(0, 100 - inSitePct - tooFarPct);

  const locCard = `
    <div class="an-card">
      ${cardHead('mapPin', 'Location Compliance', 'Geofence verification for student time logs')}
      <div class="an-loc-box">
        <div class="an-loc-donut-area">
          <div class="an-donut-wrap">
            ${donut(inSitePct, '#059669', 100, 11)}
            <div class="an-donut-inner">
              <span class="an-donut-pct" style="color:#059669">${inSitePct}%</span>
              <span class="an-donut-lbl">On-Site</span>
            </div>
          </div>
        </div>
        <div class="an-loc-stats">
          <div class="an-loc-stat">
            <div class="an-loc-stat__meta">
              <span class="an-loc-stat__title"><span class="an-dot" style="background:#059669"></span> Verified In-Site</span>
              <strong>${locationStats.inSite} logs</strong>
            </div>
            <div class="an-loc-stat__bar">
              <div style="width:${inSitePct}%;background:#059669"></div>
            </div>
          </div>
          <div class="an-loc-stat">
            <div class="an-loc-stat__meta">
              <span class="an-loc-stat__title"><span class="an-dot" style="background:#E11D48"></span> Out of Bounds (Too Far)</span>
              <strong>${locationStats.tooFar} logs</strong>
            </div>
            <div class="an-loc-stat__bar">
              <div style="width:${tooFarPct}%;background:#E11D48"></div>
            </div>
          </div>
          <div class="an-loc-stat">
            <div class="an-loc-stat__meta">
              <span class="an-loc-stat__title"><span class="an-dot" style="background:var(--text-tertiary)"></span> Unrecorded / No GPS</span>
              <strong>${locationStats.noGps} logs</strong>
            </div>
            <div class="an-loc-stat__bar">
              <div style="width:${noGpsPct}%;background:var(--border-strong)"></div>
            </div>
          </div>
        </div>
      </div>
    </div>`;

  // ── 4. Daily Attendance Column Chart ─────────────────────────────────────
  const sparkMax  = Math.max(...last14Days.map(d => d.count), 1);
  const totalLogs = last14Days.reduce((s, d) => s + d.count, 0);
  const activeDaysCount = last14Days.filter(d => d.count > 0).length || 1;
  const avgLogs   = (totalLogs / activeDaysCount).toFixed(1);

  const attendanceCard = `
    <div class="an-card">
      ${cardHead('trendingUp', 'Daily Attendance Velocity', 'Attendance logs submitted over the last 14 days', `
        <div class="an-chart-stat-group">
          <div class="an-chart-stat"><span class="an-chart-stat__val">${totalLogs}</span> <span class="an-chart-stat__lbl">total logs</span></div>
          <div class="an-chart-stat-sep"></div>
          <div class="an-chart-stat"><span class="an-chart-stat__val">${avgLogs}</span> <span class="an-chart-stat__lbl">daily avg</span></div>
          <div class="an-chart-stat-sep"></div>
          <div class="an-chart-stat"><span class="an-chart-stat__val" style="color:#059669">${k.logsToday}</span> <span class="an-chart-stat__lbl">today</span></div>
        </div>
      `)}
      <div class="an-chart-wrap">
        <div class="an-chart-guides">
          <div class="an-guide-line"><span>${sparkMax}</span></div>
          <div class="an-guide-line"><span>${Math.round(sparkMax / 2)}</span></div>
          <div class="an-guide-line"><span>0</span></div>
        </div>
        <div class="an-chart">
          ${last14Days.map(d => {
            const h = sparkMax > 0 ? Math.max(5, Math.round((d.count / sparkMax) * 100)) : 5;
            const isToday = d.date === new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            return `
              <div class="an-chart__col">
                <div class="an-chart__track">
                  <div class="an-chart__bar${isToday ? ' an-chart__bar--today' : ''}" style="height:${h}%">
                    <span class="an-chart__tooltip">${d.count} logs</span>
                  </div>
                </div>
                <span class="an-chart__date${isToday ? ' an-chart__date--today' : ''}">${d.date}</span>
              </div>`;
          }).join('')}
        </div>
      </div>
    </div>`;

  // ── 5. Recent Attendance Logs Table ──────────────────────────────────────
  const logsCard = `
    <div class="an-card an-card--flush">
      ${cardHead('clipboardList', 'Recent Attendance Time Records', 'Latest verified check-in entries from assigned trainees')}
      ${recentLogs.length ? `
        <div class="an-table-wrap">
          <table class="an-table">
            <thead>
              <tr>
                <th>Student Trainee</th>
                <th>Date</th>
                <th>Time In</th>
                <th>Time Out</th>
                <th>Rendered</th>
                <th>Location Compliance</th>
              </tr>
            </thead>
            <tbody>
              ${recentLogs.map(l => {
                const locPill = (l.validity === 'In Site' || l.validity === 'valid')
                  ? pill('Verified In-Site', '#059669', '#05966912')
                  : (l.validity === 'Too Far' || l.validity === 'not_valid')
                    ? pill('Out of Bounds', '#EF4444', '#EF444412')
                    : pill('No GPS Log', 'var(--text-tertiary)', 'var(--bg-secondary)');
                const ini = l.student.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
                return `
                  <tr>
                    <td class="an-td--user">
                      <div class="an-avatar"><span>${ini}</span></div>
                      <span class="an-user-name">${l.student}</span>
                    </td>
                    <td class="an-td--muted">${l.date}</td>
                    <td><span class="an-time-badge">${l.timeIn}</span></td>
                    <td>${l.timeOut !== '—' ? `<span class="an-time-badge">${l.timeOut}</span>` : '<span class="an-td--muted">—</span>'}</td>
                    <td>${l.hours > 0 ? `<strong>${l.hours} hrs</strong>` : '<span class="an-td--muted">—</span>'}</td>
                    <td>${locPill}</td>
                  </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>` : emptyState('No verified attendance logs recorded yet.')}
    </div>`;

  // ── 6. Hours Completion Brackets ─────────────────────────────────────────
  const maxBucket = Math.max(...hoursBuckets.map(b => b.count), 1);
  const hoursCard = `
    <div class="an-card">
      ${cardHead('clock', 'Required Hours Completion', 'Cohort volume breakdown by progress brackets')}
      <div class="an-dist-list">
        ${hoursBuckets.map(b => `
          <div class="an-dist-row">
            <span class="an-dist-label">${b.label}</span>
            <div class="an-dist-track">
              <div class="an-dist-fill" style="width:${maxBucket > 0 ? Math.round((b.count / maxBucket) * 100) : 0}%;background:${b.color}"></div>
            </div>
            <span class="an-dist-badge" style="background:${b.color}14;color:${b.color}">${b.count} trainees</span>
          </div>`).join('')}
      </div>
    </div>`;

  // ── 7. Top Performers Leaderboard ─────────────────────────────────────────
  const topCard = `
    <div class="an-card">
      ${cardHead('award', 'Top Performing Trainees', 'Leading students by cumulative hours completed')}
      ${topPerformers.length ? `
        <div class="an-top-list">
          ${topPerformers.map((t, i) => {
            const medals = ['🥇', '🥈', '🥉'];
            const barColor = t.pct >= 80 ? '#059669' : t.pct >= 40 ? '#005930' : '#0284C7';
            const ini = t.name.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
            return `
              <div class="an-top-row">
                <div class="an-top-rank">${medals[i] || `<span class="an-top-num">#${i + 1}</span>`}</div>
                <div class="an-avatar an-avatar--sm"><span>${ini}</span></div>
                <div class="an-top-info">
                  <span class="an-top-name">${t.name}</span>
                  <span class="an-top-sub">${t.course}</span>
                </div>
                <div class="an-top-progress">
                  <div class="an-top-bar">
                    <div style="width:${t.pct}%;background:${barColor}"></div>
                  </div>
                  <span class="an-top-pct" style="color:${barColor}">${t.pct}%</span>
                </div>
              </div>`;
          }).join('')}
        </div>` : emptyState('No trainee progress data available yet.')}
    </div>`;

  // ── 8. Academic Course & Company Distribution ────────────────────────────
  const courseEntries  = Object.entries(courseDist);
  const companyEntries = Object.entries(companyDist);
  const maxCourse  = courseEntries.length  ? Math.max(...courseEntries.map(e => e[1]), 1)  : 1;
  const maxCompany = companyEntries.length ? Math.max(...companyEntries.map(e => e[1]), 1) : 1;

  function distCard(title, ic, entries, max, color = '#005930') {
    return `
      <div class="an-card">
        ${cardHead(ic, title, 'Cohort enrollment representation')}
        ${entries.length ? `
          <div class="an-dist-list">
            ${entries.map(([n, c], i) => {
              const barColor = PALETTE[i % PALETTE.length];
              const pct = Math.round((c / max) * 100);
              return `
                <div class="an-dist-row">
                  <span class="an-dist-label" title="${n}">${n}</span>
                  <div class="an-dist-track">
                    <div class="an-dist-fill" style="width:${pct}%;background:${barColor}"></div>
                  </div>
                  <span class="an-dist-badge" style="background:${barColor}14;color:${barColor}">${c}</span>
                </div>`;
            }).join('')}
          </div>` : emptyState('No distribution records yet.')}
      </div>`;
  }

  // ── 9. Flagged Trainees Attention List ────────────────────────────────────
  const flagCard = `
    <div class="an-card">
      ${cardHead('alertTriangle', 'Flagged Trainees Attention', flagged.length > 0 ? `${flagged.length} require immediate follow-up` : 'All trainees meeting attendance standards')}
      ${flagged.length ? `
        <div class="an-flag-list">
          ${flagged.map(t => {
            const ini = t.name.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
            return `
              <div class="an-flag-row">
                <div class="an-flag-avatar"><span>${ini}</span></div>
                <div class="an-flag-info">
                  <span class="an-flag-name">${t.name}</span>
                  <span class="an-flag-sub">${t.company}</span>
                </div>
                <div class="an-flag-status">
                  <span class="an-status-chip an-status-chip--warn">Review Logs</span>
                  <span class="an-flag-pct">${t.pct}% hours</span>
                </div>
              </div>`;
          }).join('')}
        </div>` : `
        <div class="an-empty an-empty--success">
          <div class="an-empty__icon" style="color:#059669">${icon('checkCircle', 28)}</div>
          <p class="an-empty__title">All Trainees Compliant</p>
          <p class="an-empty__text">No attendance flags or location anomalies detected.</p>
        </div>`}
    </div>`;

  // ── Assemble Tab Panels ──────────────────────────────────────────────────
  root.innerHTML = `
    <!-- Panel 1: Overview & Pipeline -->
    <div class="an-panel" id="tab-overview">
      ${kpiGridHtml}

      <div class="an-row an-row--3-2">
        ${funnelCard}
        ${locCard}
      </div>
    </div>

    <!-- Panel 2: Daily Attendance & Logs -->
    <div class="an-panel an-panel--hidden" id="tab-attendance">
      ${attendanceCard}
      ${logsCard}
    </div>

    <!-- Panel 3: Cohort Progress & Demographics -->
    <div class="an-panel an-panel--hidden" id="tab-progress">
      <div class="an-row">
        ${hoursCard}
        ${topCard}
      </div>

      <div class="an-row">
        ${distCard('Enrolled Programs / Majors', 'bookOpen', courseEntries, maxCourse)}
        ${distCard('Host Partner Companies', 'building', companyEntries, maxCompany)}
      </div>

      ${flagCard}
    </div>
  `;

  // ── Segmented Tab Logic ──────────────────────────────────────────────────
  const tabs   = container.querySelectorAll('.an-tab');
  const panels = container.querySelectorAll('.an-panel');
  const ink    = container.querySelector('#an-tabs-ink');

  function moveInk(btn) {
    if (!ink || !btn) return;
    ink.style.left  = btn.offsetLeft + 'px';
    ink.style.width = btn.offsetWidth + 'px';
  }

  requestAnimationFrame(() => {
    const active = container.querySelector('.an-tab--active');
    if (active) moveInk(active);
  });

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        t.classList.remove('an-tab--active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('an-tab--active');
      tab.setAttribute('aria-selected', 'true');
      moveInk(tab);

      const target = tab.dataset.tab;
      panels.forEach(p => {
        const show = p.id === `tab-${target}`;
        p.classList.toggle('an-panel--hidden', !show);
        if (show) {
          p.classList.add('an-panel--enter');
          setTimeout(() => p.classList.remove('an-panel--enter'), 250);
        }
      });
    });
  });

  window.addEventListener('resize', () => {
    const active = container.querySelector('.an-tab--active');
    if (active) moveInk(active);
  }, { passive: true });
}

// ─────────────────────────────────────────────────────────────────────────────
// Scoped Styles
// ─────────────────────────────────────────────────────────────────────────────

function injectStyles() {
  if (document.getElementById('an-styles')) return;
  const s = document.createElement('style');
  s.id = 'an-styles';
  s.textContent = `
  /* ── Page Layout ── */
  .an-page {
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
    padding-bottom: var(--space-12);
  }

  /* ── Top Header ── */
  .an-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-2) 0 var(--space-1);
    gap: var(--space-4);
    flex-wrap: wrap;
  }
  .an-header__left {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }
  .an-header__icon {
    width: 44px;
    height: 44px;
    border-radius: var(--radius-lg);
    background: #00593014;
    color: #005930;
    border: 1px solid #00593025;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .an-header__title-row {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    margin-bottom: 2px;
  }
  .an-header__title {
    font-size: 1.4rem;
    font-weight: 700;
    letter-spacing: -0.015em;
    color: var(--text-primary);
    margin: 0;
    line-height: 1.2;
  }
  .an-header__sub {
    font-size: var(--text-xs);
    color: var(--text-secondary);
    margin: 0;
  }
  .an-live-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.72rem;
    font-weight: 600;
    color: #059669;
    background: #05966910;
    border: 1px solid #05966928;
    border-radius: var(--radius-full);
    padding: 3px 10px;
  }
  .an-live-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #059669;
    animation: an-pulse 2s infinite ease-in-out;
  }
  @keyframes an-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50%       { opacity: 0.4; transform: scale(0.85); }
  }

  .an-header__actions {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }
  .an-btn-refresh {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 7px 14px;
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--text-secondary);
    background: var(--bg-elevated);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all var(--duration-fast);
  }
  .an-btn-refresh:hover {
    background: var(--bg-secondary);
    color: var(--text-primary);
    border-color: var(--border-strong);
  }

  /* ── Segmented Tabs Bar ── */
  .an-tabs-bar {
    display: flex;
    align-items: center;
    border-bottom: 1px solid var(--border-default);
    padding-bottom: var(--space-3);
  }
  .an-tabs {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: var(--bg-secondary);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-lg);
    padding: 4px;
    position: relative;
  }
  .an-tabs__ink {
    position: absolute;
    top: 4px;
    bottom: 4px;
    background: var(--bg-elevated);
    border: 1px solid var(--border-default);
    border-radius: calc(var(--radius-lg) - 2px);
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    transition: left 0.22s cubic-bezier(0.4, 0, 0.2, 1), width 0.22s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 0;
    pointer-events: none;
  }
  .an-tab {
    position: relative;
    z-index: 1;
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 7px 18px;
    border: none;
    background: transparent;
    border-radius: calc(var(--radius-lg) - 3px);
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--text-secondary);
    cursor: pointer;
    white-space: nowrap;
    transition: color var(--duration-fast);
  }
  .an-tab svg { opacity: 0.7; transition: opacity var(--duration-fast); }
  .an-tab--active { color: #005930; font-weight: 600; }
  .an-tab--active svg { opacity: 1; color: #005930; }
  .an-tab:hover:not(.an-tab--active) { color: var(--text-primary); }

  /* ── Tab Panels ── */
  .an-panel {
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
    animation: an-panel-in 0.25s cubic-bezier(0.4, 0, 0.2, 1) both;
  }
  .an-panel--hidden { display: none !important; }
  .an-panel--enter  { animation: an-panel-in 0.25s cubic-bezier(0.4, 0, 0.2, 1) both; }
  @keyframes an-panel-in {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: none; }
  }

  /* ── Layout Grid ── */
  .an-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-5);
  }
  .an-row--3-2 {
    grid-template-columns: 1.45fr 1fr;
  }

  /* ── KPI Grid ── */
  .an-kpi-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: var(--space-3);
  }
  .an-kpi-card {
    background: var(--bg-elevated);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-lg);
    padding: var(--space-4);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
    transition: transform var(--duration-fast), box-shadow var(--duration-fast), border-color var(--duration-fast);
  }
  .an-kpi-card:hover {
    border-color: var(--border-strong);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    transform: translateY(-1px);
  }
  .an-kpi-card__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2);
    margin-bottom: var(--space-2);
  }
  .an-kpi-card__label {
    font-size: 0.7rem;
    font-weight: 600;
    color: var(--text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .an-kpi-card__icon {
    width: 26px;
    height: 26px;
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .an-kpi-card__value {
    font-size: 1.55rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--text-primary);
    line-height: 1.15;
    margin-bottom: var(--space-2);
  }
  .an-kpi-card__footer {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .an-kpi-card__trend {
    font-size: 0.68rem;
    font-weight: 600;
    display: inline-block;
  }
  .an-trend--good { color: #059669; }
  .an-trend--warn { color: #E11D48; }
  .an-trend--neutral { color: var(--text-tertiary); }
  .an-kpi-card__sub {
    font-size: 0.65rem;
    color: var(--text-tertiary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* ── Clean Card ── */
  .an-card {
    background: var(--bg-elevated);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-xl);
    padding: var(--space-5);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }
  .an-card--flush {
    padding: 0;
    overflow: hidden;
  }
  .an-card--flush .an-card__head {
    padding: var(--space-4) var(--space-5);
    border-bottom: 1px solid var(--border-default);
  }
  .an-card__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
  }
  .an-card__head-left {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    min-width: 0;
  }
  .an-card__head-icon {
    width: 32px;
    height: 32px;
    border-radius: var(--radius-md);
    background: #00593012;
    color: #005930;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .an-card__head-titles {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  .an-card__title {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--text-primary);
  }
  .an-card__sub {
    font-size: var(--text-xs);
    color: var(--text-tertiary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .an-card__head-extra {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  /* ── Funnel ── */
  .an-funnel {
    display: flex;
    flex-direction: column;
    padding: var(--space-1) 0;
  }
  .an-funnel__row {
    display: grid;
    grid-template-columns: 140px 1fr 75px;
    align-items: center;
    gap: var(--space-3);
    padding: 6px 0;
  }
  .an-funnel__meta {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .an-funnel__badge {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    font-size: 11px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .an-funnel__label {
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--text-secondary);
  }
  .an-funnel__track {
    height: 18px;
    background: var(--bg-secondary);
    border-radius: var(--radius-sm);
    overflow: hidden;
    border: 1px solid var(--border-default);
  }
  .an-funnel__fill {
    height: 100%;
    border-radius: calc(var(--radius-sm) - 1px);
    transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .an-funnel__stats {
    display: flex;
    align-items: baseline;
    justify-content: flex-end;
    gap: 6px;
  }
  .an-funnel__count {
    font-size: var(--text-sm);
    font-weight: 700;
    color: var(--text-primary);
  }
  .an-funnel__pct {
    font-size: 0.68rem;
    color: var(--text-tertiary);
  }
  .an-funnel__transition {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 1px 0 1px 148px;
  }
  .an-funnel__stem {
    width: 1px;
    height: 8px;
    background: var(--border-default);
  }
  .an-funnel__rate {
    font-size: 0.68rem;
    color: var(--text-tertiary);
    padding: 1px 6px;
    border-radius: var(--radius-sm);
    background: var(--bg-secondary);
  }

  /* ── Location Compliance ── */
  .an-loc-box {
    display: flex;
    align-items: center;
    gap: var(--space-5);
  }
  .an-loc-donut-area {
    display: flex;
    justify-content: center;
    flex-shrink: 0;
  }
  .an-donut-wrap {
    position: relative;
    width: 100px;
    height: 100px;
  }
  .an-donut-inner {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .an-donut-pct {
    font-size: 1.25rem;
    font-weight: 700;
    line-height: 1;
  }
  .an-donut-lbl {
    font-size: 0.62rem;
    color: var(--text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin-top: 2px;
  }
  .an-loc-stats {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .an-loc-stat {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .an-loc-stat__meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: var(--text-xs);
    color: var(--text-secondary);
  }
  .an-loc-stat__meta strong {
    color: var(--text-primary);
    font-size: 0.72rem;
  }
  .an-loc-stat__title {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .an-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .an-loc-stat__bar {
    height: 5px;
    background: var(--bg-secondary);
    border-radius: var(--radius-full);
    overflow: hidden;
  }
  .an-loc-stat__bar div {
    height: 100%;
    border-radius: var(--radius-full);
    transition: width 0.8s ease;
  }

  /* ── 14-Day Attendance Chart ── */
  .an-chart-stat-group {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }
  .an-chart-stat {
    display: flex;
    align-items: baseline;
    gap: 4px;
  }
  .an-chart-stat__val {
    font-size: 1rem;
    font-weight: 700;
    color: var(--text-primary);
  }
  .an-chart-stat__lbl {
    font-size: 0.68rem;
    color: var(--text-tertiary);
  }
  .an-chart-stat-sep {
    width: 1px;
    height: 14px;
    background: var(--border-default);
  }

  .an-chart-wrap {
    position: relative;
    width: 100%;
    padding-top: var(--space-2);
  }
  .an-chart-guides {
    position: absolute;
    inset: 10px 0 24px 0;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    pointer-events: none;
    z-index: 0;
  }
  .an-guide-line {
    display: flex;
    align-items: center;
    border-bottom: 1px dashed var(--border-default);
    width: 100%;
    opacity: 0.6;
  }
  .an-guide-line span {
    font-size: 0.65rem;
    color: var(--text-tertiary);
    margin-right: 6px;
    transform: translateY(-50%);
  }
  .an-chart {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: flex-end;
    gap: 8px;
    height: 175px;
    padding: 0 var(--space-2);
  }
  .an-chart__col {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
    gap: 6px;
  }
  .an-chart__track {
    flex: 1;
    width: 100%;
    display: flex;
    align-items: flex-end;
    justify-content: center;
  }
  .an-chart__bar {
    width: 55%;
    max-width: 28px;
    background: #005930;
    border-radius: 4px 4px 1px 1px;
    min-height: 4px;
    position: relative;
    cursor: default;
    transition: opacity var(--duration-fast);
  }
  .an-chart__bar:hover { opacity: 0.85; }
  .an-chart__bar--today { background: #059669; }
  .an-chart__tooltip {
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%) translateY(-4px);
    background: var(--text-primary);
    color: var(--bg-primary);
    font-size: 0.65rem;
    font-weight: 600;
    padding: 2px 6px;
    border-radius: var(--radius-sm);
    white-space: nowrap;
    pointer-events: none;
    opacity: 0;
    transition: opacity var(--duration-fast);
  }
  .an-chart__bar:hover .an-chart__tooltip { opacity: 1; }
  .an-chart__date {
    font-size: 0.68rem;
    color: var(--text-tertiary);
    white-space: nowrap;
  }
  .an-chart__date--today {
    font-weight: 700;
    color: #059669;
  }

  /* ── Recent Attendance Table ── */
  .an-table-wrap {
    overflow-x: auto;
  }
  .an-table {
    width: 100%;
    border-collapse: collapse;
    font-size: var(--text-xs);
  }
  .an-table thead tr {
    background: var(--bg-secondary);
  }
  .an-table th {
    padding: 10px 16px;
    font-size: 0.68rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-tertiary);
    border-bottom: 1px solid var(--border-default);
    text-align: left;
    white-space: nowrap;
  }
  .an-table td {
    padding: 11px 16px;
    vertical-align: middle;
    border-bottom: 1px solid var(--border-default);
    color: var(--text-primary);
  }
  .an-table tbody tr:hover {
    background: var(--bg-secondary);
  }
  .an-td--user {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .an-avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: #005930;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.68rem;
    font-weight: 700;
    flex-shrink: 0;
  }
  .an-avatar--sm {
    width: 26px;
    height: 26px;
    font-size: 0.62rem;
  }
  .an-user-name {
    font-weight: 600;
    color: var(--text-primary);
  }
  .an-td--muted {
    color: var(--text-secondary);
  }
  .an-time-badge {
    display: inline-block;
    padding: 2px 7px;
    border-radius: var(--radius-sm);
    background: var(--bg-secondary);
    font-weight: 600;
    font-size: 0.72rem;
    color: var(--text-primary);
  }
  .an-status-chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    border-radius: var(--radius-full);
    font-size: 0.68rem;
    font-weight: 600;
    white-space: nowrap;
  }
  .an-status-chip--warn {
    background: #EF444412;
    color: #EF4444;
    border: 1px solid #EF444425;
  }

  /* ── Distribution Lists ── */
  .an-dist-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .an-dist-row {
    display: grid;
    grid-template-columns: 140px 1fr 65px;
    align-items: center;
    gap: var(--space-3);
  }
  .an-dist-label {
    font-size: var(--text-xs);
    font-weight: 500;
    color: var(--text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .an-dist-track {
    height: 6px;
    background: var(--bg-secondary);
    border-radius: var(--radius-full);
    overflow: hidden;
  }
  .an-dist-fill {
    height: 100%;
    border-radius: var(--radius-full);
    transition: width 0.8s ease;
  }
  .an-dist-badge {
    font-size: 0.68rem;
    font-weight: 600;
    text-align: right;
    padding: 1px 6px;
    border-radius: var(--radius-sm);
  }

  /* ── Top Performers ── */
  .an-top-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .an-top-row {
    display: grid;
    grid-template-columns: 24px 28px 1fr 110px;
    align-items: center;
    gap: 8px;
    padding: 5px 0;
    border-bottom: 1px solid var(--border-default);
  }
  .an-top-row:last-child { border-bottom: none; }
  .an-top-rank { font-size: 14px; text-align: center; }
  .an-top-num { font-size: 0.72rem; font-weight: 700; color: var(--text-tertiary); }
  .an-top-info { min-width: 0; display: flex; flex-direction: column; }
  .an-top-name { font-size: var(--text-xs); font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .an-top-sub { font-size: 0.65rem; color: var(--text-tertiary); }
  .an-top-progress { display: flex; align-items: center; gap: 6px; }
  .an-top-bar { flex: 1; height: 5px; background: var(--bg-secondary); border-radius: var(--radius-full); overflow: hidden; }
  .an-top-bar div { height: 100%; border-radius: var(--radius-full); }
  .an-top-pct { font-size: 0.68rem; font-weight: 700; min-width: 28px; text-align: right; }

  /* ── Flagged Trainees ── */
  .an-flag-list {
    display: flex;
    flex-direction: column;
    gap: 0;
  }
  .an-flag-row {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: 10px 0;
    border-bottom: 1px solid var(--border-default);
  }
  .an-flag-row:last-child { border-bottom: none; }
  .an-flag-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #EF444414;
    color: #EF4444;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.72rem;
    font-weight: 700;
    flex-shrink: 0;
  }
  .an-flag-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
  .an-flag-name { font-size: var(--text-xs); font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .an-flag-sub { font-size: 0.68rem; color: var(--text-tertiary); }
  .an-flag-status { display: flex; align-items: center; gap: 8px; }
  .an-flag-pct { font-size: 0.72rem; font-weight: 600; color: #EF4444; }

  /* ── Empty States ── */
  .an-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: var(--space-8) var(--space-4);
    gap: 4px;
  }
  .an-empty__icon { margin-bottom: var(--space-1); }
  .an-empty__title { font-size: var(--text-xs); font-weight: 600; color: var(--text-primary); margin: 0; }
  .an-empty__text { font-size: var(--text-xs); color: var(--text-tertiary); margin: 0; }
  .an-empty--success { padding: var(--space-6) var(--space-4); }
  .an-empty--error { padding: var(--space-12) var(--space-4); }

  /* ── Responsive ── */
  @media (max-width: 1200px) {
    .an-kpi-grid { grid-template-columns: repeat(3, 1fr); }
    .an-row--3-2 { grid-template-columns: 1fr; }
  }
  @media (max-width: 860px) {
    .an-row { grid-template-columns: 1fr; }
    .an-kpi-grid { grid-template-columns: repeat(2, 1fr); }
    .an-loc-box { flex-direction: column; align-items: flex-start; }
    .an-chart-stat-group { display: none; }
  }
  @media (max-width: 580px) {
    .an-header { flex-direction: column; align-items: flex-start; }
    .an-kpi-grid { grid-template-columns: 1fr; }
    .an-tabs-bar { width: 100%; overflow-x: auto; }
    .an-tabs { width: 100%; }
    .an-tab { flex: 1; justify-content: center; padding: 7px 10px; }
  }
  `;
  document.head.appendChild(s);
}
