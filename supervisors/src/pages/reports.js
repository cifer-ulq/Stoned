/* ==========================================================================
   OJT Analysis & Insights — Supervisor Portal
   Executive Analytical Suite & Reporting Center
   Clean, Neat, Polished UI/UX
   ========================================================================== */

import { icon } from '../components/icons.js';
import { apiGet } from '../api/client.js';
import { getState } from '../store.js';

const PALETTE = ['#005930', '#059669', '#0284C7', '#D97706', '#7C3AED', '#0D9488', '#E11D48', '#4F46E5'];

const PROGRAM_ACRONYMS = {
  'Bachelor of Science in Information Technology': 'BSIT',
  'Bachelor of Science in Computer Science': 'BSCS',
  'Bachelor of Science in Information Systems': 'BSIS',
  'Bachelor of Science in Entertainment and Multimedia Computing': 'BSEMC',
  'Bachelor of Science in Industrial Technology': 'BSIndTech',
  'Bachelor of Science in Hospitality Management': 'BSHM',
  'Bachelor of Science in Tourism Management': 'BSTM',
  'Bachelor of Science in Business Administration': 'BSBA',
  'Bachelor of Science in Accountancy': 'BSA',
  'Bachelor of Secondary Education': 'BSED',
  'Bachelor of Elementary Education': 'BEED',
};

function shortenProgram(str = '') {
  if (!str) return '—';
  return PROGRAM_ACRONYMS[str] || str;
}

// ─────────────────────────────────────────────────────────────────────────────
// Primitives & Helpers
// ─────────────────────────────────────────────────────────────────────────────

function donutSvg(pct, color = '#059669', size = 114, stroke = 10) {
  const r    = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const fill = circ * (Math.min(100, Math.max(0, pct)) / 100);
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" class="an-donut-svg" style="transform:rotate(-90deg);display:block;flex-shrink:0">
      <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="var(--border-default)" stroke-width="${stroke}"/>
      <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="${color}" stroke-width="${stroke}"
        stroke-dasharray="${fill.toFixed(1)} ${circ.toFixed(1)}" stroke-linecap="round"
        style="transition:stroke-dasharray .8s cubic-bezier(.16,1,.3,1)"/>
    </svg>`;
}

function cardHead(ic, title, sub = '', extra = '') {
  return `
    <div class="an-card__head">
      <div class="an-card__head-left">
        <div class="an-card__head-icon">${icon(ic, 18)}</div>
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
      <div class="an-empty__icon">${icon(iconName, 26)}</div>
      <p class="an-empty__text">${msg}</p>
    </div>`;
}

function exportCsv(trainees) {
  if (!trainees || !trainees.length) {
    alert('No trainee cohort records to export.');
    return;
  }
  const headers = ['Student ID', 'Student Name', 'Program / Course', 'Host Partner Company', 'Completed Hours', 'Required Hours', 'Completion Rate (%)', 'Current Status', 'Start Date', 'Target End Date'];
  const rows = trainees.map(t => [
    `"${(t.id ?? '').toString().replace(/"/g, '""')}"`,
    `"${(t.name || '').replace(/"/g, '""')}"`,
    `"${(t.course || '').replace(/"/g, '""')}"`,
    `"${(t.company || '').replace(/"/g, '""')}"`,
    t.completedHours ?? 0,
    t.requiredHours ?? 600,
    `${t.pct ?? 0}%`,
    `"${(t.status || 'active').replace(/"/g, '""')}"`,
    `"${(t.startDate || '—').replace(/"/g, '""')}"`,
    `"${(t.endDate || '—').replace(/"/g, '""')}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\r\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `CHMSU_OJT_Cohort_Analysis_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ─────────────────────────────────────────────────────────────────────────────
// Skeleton Placeholder
// ─────────────────────────────────────────────────────────────────────────────

function renderSkeleton() {
  const sk = h => `<div class="skeleton skeleton--card" style="height:${h}px;border-radius:14px"></div>`;
  return `
    <div class="an-skeleton-stack">
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px">
        ${sk(115)}${sk(115)}${sk(115)}${sk(115)}
      </div>
      <div style="margin-top:16px;display:grid;grid-template-columns:repeat(3,1fr);gap:16px">
        ${sk(90)}${sk(90)}${sk(90)}
      </div>
      <div style="display:grid;grid-template-columns:1.55fr 1fr;gap:24px;margin-top:24px">
        ${sk(320)}${sk(320)}
      </div>
    </div>`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Page Entry
// ─────────────────────────────────────────────────────────────────────────────

export default function analyticsPage(container) {
  const supervisorName = getState('user.name') || 'Prof. Maria Garcia';
  const supervisorDept = getState('user.department') || 'College of Computer Studies';
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  container.innerHTML = `
    <div class="an-page fade-in">
      <!-- Printable Official Header (Hidden on screen, visible on print) -->
      <div class="an-print-header">
        <div class="an-print-header__top">
          <div class="an-print-header__school">CARLOS HILADO MEMORIAL STATE UNIVERSITY</div>
          <div class="an-print-header__office">Office of Student Internship &amp; Supervisory Oversight</div>
          <div class="an-print-header__doc">Executive OJT Analysis &amp; Cohort Performance Insights</div>
        </div>
        <div class="an-print-header__meta">
          <div><strong>Faculty Supervisor:</strong> ${supervisorName}</div>
          <div><strong>Department:</strong> ${supervisorDept}</div>
          <div><strong>Report Generated:</strong> ${todayFormatted}</div>
          <div><strong>System:</strong> CHMSU HireMe OJT Suite 2.0</div>
        </div>
      </div>

      <!-- Top Header -->
      <div class="an-header">
        <div class="an-header__left">
          <div class="an-header__icon">${icon('barChart2', 24)}</div>
          <div>
            <div class="an-header__title-row">
              <h1 class="an-header__title">Analysis &amp; Insights</h1>
              <span class="an-live-badge"><span class="an-live-dot"></span>Live Sync Active</span>
            </div>
            <p class="an-header__sub">Cohort milestone analytics, attendance velocity, and geofence compliance oversight · ${todayFormatted}</p>
          </div>
        </div>
        <div class="an-header__actions">
          <button class="an-btn-action" id="an-csv-btn" title="Export full cohort data to CSV spreadsheet">
            ${icon('download', 15)}
            <span>Export CSV</span>
          </button>
          <button class="an-btn-action an-btn-action--primary" id="an-print-btn" title="Print executive report or save as PDF">
            ${icon('printer', 15)}
            <span>Print Report</span>
          </button>
          <button class="an-btn-refresh" id="an-refresh-btn" title="Refresh metrics from server">
            ${icon('refreshCw', 14)}
          </button>
        </div>
      </div>

      <!-- Segmented Tab Navigation -->
      <div class="an-nav-bar">
        <div class="an-segmented" role="tablist">
          <button class="an-seg-btn an-seg-btn--active" data-tab="overview" role="tab" aria-selected="true">
            ${icon('layout', 15)} <span>Overview &amp; Trends</span>
          </button>
          <button class="an-seg-btn" data-tab="attendance" role="tab" aria-selected="false">
            ${icon('clipboardCheck', 15)} <span>Attendance Ledger</span>
          </button>
          <button class="an-seg-btn" data-tab="demographics" role="tab" aria-selected="false">
            ${icon('pieChart', 15)} <span>Cohort Demographics</span>
          </button>
        </div>
      </div>

      <!-- Content Root -->
      <div id="an-root">${renderSkeleton()}</div>
    </div>
  `;

  injectStyles();
  loadAnalytics(container);

  // Top header button listeners
  container.querySelector('#an-refresh-btn')?.addEventListener('click', () => {
    const btn = container.querySelector('#an-refresh-btn');
    if (btn) btn.classList.add('an-rotating');
    loadAnalytics(container).finally(() => {
      btn?.classList.remove('an-rotating');
    });
  });

  container.querySelector('#an-print-btn')?.addEventListener('click', () => {
    window.print();
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Load & Render Analytics Data
// ─────────────────────────────────────────────────────────────────────────────

async function loadAnalytics(container) {
  let data = null;
  try {
    const res = await apiGet('/supervisor/analytics');
    data = res?.data ?? null;
  } catch (err) {
    console.error('[Analytics] Failed to fetch data:', err);
  }

  const root = container.querySelector('#an-root');
  if (!root) return;

  if (!data) {
    root.innerHTML = `
      <div class="an-empty an-empty--error">
        <div class="an-empty__icon" style="color:#EF4444">${icon('alertCircle', 36)}</div>
        <p class="an-empty__title">Unable to synchronize cohort analytics</p>
        <p class="an-empty__text">We could not load real-time analytics data. Please check your connection and retry.</p>
        <button class="btn btn-secondary" id="an-retry-btn" style="margin-top:14px">
          ${icon('refreshCw', 15)} Try Again
        </button>
      </div>`;
    root.querySelector('#an-retry-btn')?.addEventListener('click', () => analyticsPage(container));
    return;
  }

  const {
    kpi: k, funnel, trainees, hoursBuckets, courseDist, companyDist,
    topPerformers, flagged, last14Days, locationStats, recentLogs
  } = data;

  // CSV export hook
  container.querySelector('#an-csv-btn')?.addEventListener('click', () => {
    exportCsv(trainees);
  });

  // Calculate advanced diagnostic metrics
  const totalTrainees = trainees.length || k.activeTrainees || 1;
  const onTrackCount  = trainees.filter(t => t.pct >= 40).length;
  const onTrackPct    = Math.round((onTrackCount / totalTrainees) * 100);

  const locTotal  = (locationStats.inSite + locationStats.tooFar + locationStats.noGps) || 1;
  const inSitePct = Math.round((locationStats.inSite / locTotal) * 100);
  const tooFarPct = Math.round((locationStats.tooFar / locTotal) * 100);
  const noGpsPct  = Math.max(0, 100 - inSitePct - tooFarPct);

  const totalActionRequired = (k.flaggedCount || 0) + (k.pendingLetters || 0);

  // ── 1. Hero KPI Cards (4 High-Impact Grid) ──────────────────────────────────
  const heroKpis = [
    {
      label: 'Active Trainees',
      val: k.activeTrainees,
      sub: `${k.totalEndorsed} total endorsed to date`,
      trend: `${Math.max(0, k.totalEndorsed - k.activeTrainees)} completed cohort`,
      icon: 'users',
      color: '#005930',
      badgeClass: 'an-hero-badge--good'
    },
    {
      label: 'Total Hours Rendered',
      val: `${Number(k.totalHoursLogged || 0).toLocaleString()} hrs`,
      sub: `${k.logsMonth} logs recorded this month`,
      trend: `${k.logsToday} check-ins logged today`,
      icon: 'clock',
      color: '#0284C7',
      badgeClass: 'an-hero-badge--info'
    },
    {
      label: 'On-Site Geofence Compliance',
      val: `${inSitePct}%`,
      sub: `${locationStats.inSite.toLocaleString()} verified in-site check-ins`,
      trend: locationStats.tooFar > 0 ? `${locationStats.tooFar} out of bounds` : 'Zero location flags',
      icon: 'mapPin',
      color: '#059669',
      badgeClass: locationStats.tooFar > 0 ? 'an-hero-badge--warn' : 'an-hero-badge--good'
    },
    {
      label: 'Action Required & Risk',
      val: totalActionRequired,
      sub: `${k.pendingLetters} pending review · ${k.flaggedCount} flagged`,
      trend: totalActionRequired > 0 ? 'Immediate action required' : 'All trainees compliant',
      icon: totalActionRequired > 0 ? 'alertTriangle' : 'checkCircle',
      color: totalActionRequired > 0 ? '#D97706' : '#059669',
      badgeClass: totalActionRequired > 0 ? 'an-hero-badge--urgent' : 'an-hero-badge--good'
    }
  ];

  const heroGridHtml = `
    <div class="an-hero-grid">
      ${heroKpis.map(c => `
        <div class="an-hero-card">
          <div class="an-hero-card__top">
            <span class="an-hero-card__label">${c.label}</span>
            <div class="an-hero-card__icon" style="background:${c.color}15;color:${c.color}">
              ${icon(c.icon, 20)}
            </div>
          </div>
          <div class="an-hero-card__value">${c.val}</div>
          <div class="an-hero-card__footer">
            <span class="an-hero-badge ${c.badgeClass}">${c.trend}</span>
            <span class="an-hero-card__sub">${c.sub}</span>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  // ── 2. Three Modular Executive Metric Insight Cards (Balanced & Polished) ──
  const insightCardsHtml = `
    <div class="an-insights-grid">
      <!-- Card 1: Cohort Pacing -->
      <div class="an-insight-card">
        <div class="an-insight-card__top">
          <div class="an-insight-card__header-left">
            <div class="an-insight-card__icon an-insight-card__icon--blue">
              ${icon('trendingUp', 18)}
            </div>
            <span class="an-insight-card__title">Cohort Pacing Health</span>
          </div>
          <span class="an-insight-pill an-insight-pill--blue">${onTrackPct}% on-schedule</span>
        </div>
        <div class="an-insight-card__body">
          <div class="an-insight-card__track">
            <div class="an-insight-card__fill an-insight-card__fill--blue" style="width:${onTrackPct}%"></div>
          </div>
          <span class="an-insight-card__desc"><strong>${onTrackCount} of ${totalTrainees}</strong> trainees meeting benchmark hours</span>
        </div>
      </div>

      <!-- Card 2: Geofence Integrity -->
      <div class="an-insight-card">
        <div class="an-insight-card__top">
          <div class="an-insight-card__header-left">
            <div class="an-insight-card__icon an-insight-card__icon--green">
              ${icon('shieldCheck', 18)}
            </div>
            <span class="an-insight-card__title">Geofence Integrity</span>
          </div>
          <span class="an-insight-pill an-insight-pill--green">${inSitePct}% verified in-site</span>
        </div>
        <div class="an-insight-card__body">
          <div class="an-insight-card__track">
            <div class="an-insight-card__fill an-insight-card__fill--green" style="width:${inSitePct}%"></div>
          </div>
          <span class="an-insight-card__desc"><strong>${locationStats.inSite.toLocaleString()}</strong> verified check-ins at host worksite</span>
        </div>
      </div>

      <!-- Card 3: Supervisory Priority -->
      <div class="an-insight-card">
        <div class="an-insight-card__top">
          <div class="an-insight-card__header-left">
            <div class="an-insight-card__icon ${totalActionRequired > 0 ? 'an-insight-card__icon--warn' : 'an-insight-card__icon--forest'}">
              ${icon(totalActionRequired > 0 ? 'alertTriangle' : 'checkCircle2', 18)}
            </div>
            <span class="an-insight-card__title">Supervisory Priority</span>
          </div>
          <span class="an-insight-pill ${totalActionRequired > 0 ? 'an-insight-pill--warn' : 'an-insight-pill--forest'}">
            ${totalActionRequired > 0 ? `${totalActionRequired} Action Items` : 'All compliant'}
          </span>
        </div>
        <div class="an-insight-card__body">
          <div class="an-insight-card__track">
            <div class="an-insight-card__fill ${totalActionRequired > 0 ? 'an-insight-card__fill--warn' : 'an-insight-card__fill--forest'}" style="width:100%"></div>
          </div>
          <span class="an-insight-card__desc">
            ${totalActionRequired > 0
              ? `<strong>${k.pendingLetters}</strong> pending letters · <strong>${k.flaggedCount}</strong> flagged trainees`
              : 'No attendance flags or unverified logs requiring review'}
          </span>
        </div>
      </div>
    </div>
  `;

  // ── 3. Priority Action & Attention Card ──────────────────────────────────────
  let priorityAlertHtml = '';
  if (totalActionRequired > 0) {
    priorityAlertHtml = `
      <div class="an-card an-card--priority">
        <div class="an-priority-header">
          <div class="an-priority-header__left">
            <div class="an-priority-icon">${icon('alertTriangle', 18)}</div>
            <div>
              <h3 class="an-priority-title">Supervisory Attention Required</h3>
              <p class="an-priority-sub">The following students require prompt follow-up or administrative action</p>
            </div>
          </div>
          <div class="an-priority-actions">
            ${k.pendingLetters > 0 ? `
              <a href="#/interests" class="btn btn-sm btn-primary">
                ${icon('fileText', 14)} Review ${k.pendingLetters} Pending Letter${k.pendingLetters > 1 ? 's' : ''}
              </a>
            ` : ''}
          </div>
        </div>

        ${flagged && flagged.length ? `
          <div class="an-flag-grid">
            ${flagged.map(f => {
              const ini = (f.name || 'Student').trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
              return `
                <div class="an-flag-card">
                  <div class="an-flag-card__avatar"><span>${ini}</span></div>
                  <div class="an-flag-card__info">
                    <span class="an-flag-card__name">${f.name}</span>
                    <span class="an-flag-card__company">${f.company || 'Assigned Host Partner'}</span>
                    <span class="an-flag-card__reason">⚠️ Irregular time logs or missing entries</span>
                  </div>
                  <div class="an-flag-card__meta">
                    <span class="an-flag-card__pct">${f.pct}% Complete</span>
                    <a href="#/trainees" class="btn btn-sm btn-secondary" style="padding:4px 10px;font-size:0.75rem">
                      View Logs
                    </a>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }

  // ── 4. Interactive Attendance Velocity Chart ──────────────────────────────
  const sparkMax = Math.max(...last14Days.map(d => d.count), 1);
  const totalLogs = last14Days.reduce((s, d) => s + d.count, 0);
  const activeDaysCount = last14Days.filter(d => d.count > 0).length || 1;
  const avgLogs = (totalLogs / activeDaysCount).toFixed(1);

  const attendanceVelocityCard = `
    <div class="an-card">
      ${cardHead('trendingUp', 'Daily Attendance Velocity', 'Daily student check-ins and log submissions across the last 14 days', `
        <div class="an-velocity-legend">
          <div class="an-velocity-stat">
            <span class="an-velocity-stat__num">${totalLogs}</span>
            <span class="an-velocity-stat__label">Total Logs</span>
          </div>
          <div class="an-velocity-stat-sep"></div>
          <div class="an-velocity-stat">
            <span class="an-velocity-stat__num">${avgLogs}</span>
            <span class="an-velocity-stat__label">Daily Avg</span>
          </div>
          <div class="an-velocity-stat-sep"></div>
          <div class="an-velocity-stat">
            <span class="an-velocity-stat__num" style="color:#059669">${k.logsToday}</span>
            <span class="an-velocity-stat__label">Today</span>
          </div>
        </div>
      `)}

      <div class="an-chart-container">
        <!-- Average Guideline across chart -->
        <div class="an-chart-avg-line" style="bottom:${Math.min(90, Math.max(15, (Number(avgLogs) / sparkMax) * 82))}%"></div>

        <div class="an-chart-columns">
          ${last14Days.map((d, idx) => {
            const h = sparkMax > 0 ? Math.max(6, Math.round((d.count / sparkMax) * 88)) : 6;
            const isToday = idx === last14Days.length - 1;
            const isWeekend = d.date.startsWith('Sat') || d.date.startsWith('Sun');

            return `
              <div class="an-col-wrap${isWeekend ? ' an-col-wrap--weekend' : ''}${isToday ? ' an-col-wrap--today' : ''}">
                <div class="an-col-track">
                  <div class="an-col-fill" style="height:${h}%;">
                    <div class="an-col-tooltip">
                      <strong>${d.count} logs</strong>
                      <span>${d.hours} hrs rendered</span>
                      <small>${d.date}${isWeekend ? ' (Weekend)' : ''}</small>
                    </div>
                  </div>
                </div>
                <div class="an-col-label">${d.date.replace(/\s+\d{4}/, '')}</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
      <div class="an-chart-footer">
        <span class="an-chart-note">${icon('info', 13)} Lighter columns indicate non-working weekend cycles; active weekday attendance averages ${avgLogs} logs/day.</span>
      </div>
    </div>
  `;

  // ── 5. Endorsement Pipeline Flow ───────────────────────────────────────────
  const funnelSteps = [
    { label: 'Pending Review',    val: funnel.pending,     color: '#D97706', step: 1, sub: 'Awaiting supervisor endorsement' },
    { label: 'Letters Endorsed',  val: funnel.endorsed,    color: '#0284C7', step: 2, sub: 'Endorsement issued to company' },
    { label: 'OJT Started',       val: funnel.ojt_started, color: '#005930', step: 3, sub: 'Accepted and rendering hours' },
    { label: 'Rejected / Paused', val: funnel.rejected,    color: '#E11D48', step: 4, sub: 'Application closed or withdrawn' },
  ];
  const funnelMax = Math.max(...funnelSteps.map(s => s.val), 1);

  const funnelCard = `
    <div class="an-card">
      ${cardHead('gitCommit', 'Endorsement Pipeline', 'Cohort progression from placement application to active internship')}
      <div class="an-funnel-stack">
        ${funnelSteps.map((s, i) => {
          const w = Math.max(3, Math.round((s.val / funnelMax) * 100));
          let convLabel = null;
          if (i === 1) {
            convLabel = funnel.pending === 0 ? '100% processed' : `${funnel.endorsed} endorsed`;
          } else if (i === 2) {
            const rate = funnel.endorsed > 0 ? Math.round((funnel.ojt_started / funnel.endorsed) * 100) : 100;
            convLabel = `${rate}% deployment`;
          } else if (i === 3 && funnel.rejected > 0) {
            convLabel = `${funnel.rejected} archived`;
          }

          return `
            ${convLabel ? `
              <div class="an-funnel-connector">
                <div class="an-funnel-stem"></div>
                <span class="an-funnel-conversion">${convLabel}</span>
              </div>
            ` : ''}
            <div class="an-funnel-row">
              <div class="an-funnel-meta">
                <span class="an-funnel-num" style="background:${s.color}18;color:${s.color}">${s.step}</span>
                <div class="an-funnel-titles">
                  <span class="an-funnel-label">${s.label}</span>
                  <span class="an-funnel-sub">${s.sub}</span>
                </div>
              </div>
              <div class="an-funnel-bar-track">
                <div class="an-funnel-bar-fill" style="width:${w}%;background:${s.color}"></div>
              </div>
              <div class="an-funnel-count">
                <strong>${s.val}</strong>
                <span>trainees</span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  // ── 6. Location Compliance Donut & Breakdown ──────────────────────────────
  const locCard = `
    <div class="an-card">
      ${cardHead('navigation', 'Location & Geofence Compliance', 'GPS radius verification against registered partner facility coordinates')}
      <div class="an-loc-content">
        <div class="an-loc-donut-area">
          <div class="an-donut-container">
            ${donutSvg(inSitePct, '#059669', 114, 10)}
            <div class="an-donut-inner">
              <span class="an-donut-pct" style="color:#059669">${inSitePct}%</span>
              <span class="an-donut-sub">On-Site</span>
            </div>
          </div>
        </div>

        <div class="an-loc-breakdown">
          <div class="an-loc-item">
            <div class="an-loc-item__header">
              <span class="an-loc-item__title"><span class="an-status-dot" style="background:#059669"></span> Within Worksite Geofence</span>
              <strong>${locationStats.inSite.toLocaleString()} logs (${inSitePct}%)</strong>
            </div>
            <div class="an-loc-progress">
              <div class="an-loc-progress-bar" style="width:${inSitePct}%;background:#059669"></div>
            </div>
          </div>

          <div class="an-loc-item">
            <div class="an-loc-item__header">
              <span class="an-loc-item__title"><span class="an-status-dot" style="background:#E11D48"></span> Out of Bounds (&gt;100m)</span>
              <strong>${locationStats.tooFar.toLocaleString()} logs (${tooFarPct}%)</strong>
            </div>
            <div class="an-loc-progress">
              <div class="an-loc-progress-bar" style="width:${tooFarPct}%;background:#E11D48"></div>
            </div>
          </div>

          <div class="an-loc-item">
            <div class="an-loc-item__header">
              <span class="an-loc-item__title"><span class="an-status-dot" style="background:var(--text-tertiary)"></span> Unrecorded / Mobile GPS Off</span>
              <strong>${locationStats.noGps.toLocaleString()} logs (${noGpsPct}%)</strong>
            </div>
            <div class="an-loc-progress">
              <div class="an-loc-progress-bar" style="width:${noGpsPct}%;background:var(--text-tertiary)"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // ── 7. Top Performers Leaderboard ─────────────────────────────────────────
  const topPerformersCard = `
    <div class="an-card">
      ${cardHead('award', 'Top Performing Trainees', 'Leading students by cumulative hours completed towards requirement')}
      ${topPerformers && topPerformers.length ? `
        <div class="an-top-stack">
          ${topPerformers.map((t, idx) => {
            const medals = ['🥇', '🥈', '🥉'];
            const ini = (t.name || 'Student').trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
            const barColor = t.pct >= 80 ? '#059669' : t.pct >= 40 ? '#005930' : '#0284C7';
            const programCode = shortenProgram(t.course);

            return `
              <div class="an-top-row">
                <div class="an-top-rank">${medals[idx] || `<span class="an-top-number">#${idx + 1}</span>`}</div>
                <div class="an-top-avatar"><span>${ini}</span></div>
                <div class="an-top-details">
                  <span class="an-top-name" title="${t.name}">${t.name}</span>
                  <span class="an-top-sub" title="${t.course} · ${t.company}">${programCode} · ${t.company}</span>
                </div>
                <div class="an-top-meter">
                  <div class="an-top-stats">
                    <strong style="color:${barColor}">${t.pct}%</strong>
                    <span>${t.completedHours} / ${t.requiredHours} hrs</span>
                  </div>
                  <div class="an-top-track">
                    <div class="an-top-fill" style="width:${t.pct}%;background:${barColor}"></div>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      ` : emptyState('No trainee progress recorded yet.')}
    </div>
  `;

  // ── 8. Cohort Hours Brackets & Demographics ──────────────────────────────
  const maxBucket = Math.max(...hoursBuckets.map(b => b.count), 1);
  const hoursBracketCard = `
    <div class="an-card">
      ${cardHead('clock', 'Required Hours Completion', 'Cohort volume distribution by hours milestone brackets')}
      <div class="an-bracket-stack">
        ${hoursBuckets.map(b => {
          const w = maxBucket > 0 ? Math.round((b.count / maxBucket) * 100) : 0;
          return `
            <div class="an-bracket-row">
              <span class="an-bracket-label">${b.label} Target</span>
              <div class="an-bracket-track">
                <div class="an-bracket-fill" style="width:${w}%;background:${b.color}"></div>
              </div>
              <div class="an-bracket-badge" style="background:${b.color}15;color:${b.color}">
                <strong>${b.count}</strong> trainees
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  const courseEntries  = Object.entries(courseDist || {});
  const companyEntries = Object.entries(companyDist || {});
  const maxCourse  = courseEntries.length  ? Math.max(...courseEntries.map(e => e[1]), 1)  : 1;
  const maxCompany = companyEntries.length ? Math.max(...companyEntries.map(e => e[1]), 1) : 1;

  function renderDistCard(title, ic, entries, max) {
    return `
      <div class="an-card">
        ${cardHead(ic, title, 'Cohort enrollment representation')}
        ${entries.length ? `
          <div class="an-dist-stack">
            ${entries.map(([name, count], i) => {
              const color = PALETTE[i % PALETTE.length];
              const pctVal = Math.round((count / max) * 100);
              return `
                <div class="an-dist-row">
                  <span class="an-dist-label" title="${name}">${shortenProgram(name)}</span>
                  <div class="an-dist-track">
                    <div class="an-dist-fill" style="width:${pctVal}%;background:${color}"></div>
                  </div>
                  <span class="an-dist-badge" style="background:${color}15;color:${color}">${count}</span>
                </div>
              `;
            }).join('')}
          </div>
        ` : emptyState('No distribution records available.')}
      </div>
    `;
  }

  // ── 9. Recent Attendance Ledger Table ─────────────────────────────────────
  const recentLogsCard = `
    <div class="an-card an-card--flush">
      ${cardHead('clipboardCheck', 'Recent Attendance Time Records', 'Latest verified supervisor check-ins and geofenced timestamp logs', `
        <div class="an-table-filter-group">
          <button class="an-table-filter an-table-filter--active" data-filter="all">All</button>
          <button class="an-table-filter" data-filter="insite">Verified In-Site</button>
          <button class="an-table-filter" data-filter="toofar">Out of Bounds</button>
        </div>
      `)}
      ${recentLogs && recentLogs.length ? `
        <div class="an-table-wrap">
          <table class="an-table" id="an-logs-table">
            <thead>
              <tr>
                <th>Student Trainee</th>
                <th>Date</th>
                <th>Time In</th>
                <th>Time Out</th>
                <th>Hours Rendered</th>
                <th>Location Compliance</th>
              </tr>
            </thead>
            <tbody>
              ${recentLogs.map(l => {
                const isInSite = l.validity === 'In Site' || l.validity === 'valid';
                const isTooFar = l.validity === 'Too Far' || l.validity === 'not_valid';
                const statusType = isInSite ? 'insite' : (isTooFar ? 'toofar' : 'nogps');

                const pillHtml = isInSite
                  ? `<span class="an-status-chip an-status-chip--good">${icon('checkCircle', 12)} Verified In-Site</span>`
                  : (isTooFar
                    ? `<span class="an-status-chip an-status-chip--warn">${icon('alertTriangle', 12)} Out of Bounds</span>`
                    : `<span class="an-status-chip an-status-chip--neutral">${icon('helpCircle', 12)} No GPS Log</span>`);

                const ini = (l.student || 'Student').trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();

                return `
                  <tr data-status="${statusType}">
                    <td>
                      <div class="an-user-cell">
                        <div class="an-user-avatar"><span>${ini}</span></div>
                        <span class="an-user-name">${l.student}</span>
                      </div>
                    </td>
                    <td class="an-cell-muted">${l.date}</td>
                    <td><span class="an-time-tag">${l.timeIn}</span></td>
                    <td>${l.timeOut !== '—' ? `<span class="an-time-tag">${l.timeOut}</span>` : '<span class="an-cell-muted">—</span>'}</td>
                    <td><strong>${l.hours > 0 ? `${l.hours} hrs` : '—'}</strong></td>
                    <td>${pillHtml}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      ` : emptyState('No verified attendance logs recorded yet.')}
    </div>
  `;

  // ── Assemble Final Executive Layout with Tab Views ─────────────────────────
  root.innerHTML = `
    <!-- Top Hero KPIs (Permanent Executive Overview) -->
    ${heroGridHtml}

    <!-- Three Modular Executive Insight Cards -->
    ${insightCardsHtml}

    <!-- Priority Alerts (If any action needed) -->
    ${priorityAlertHtml}

    <!-- Tab View 1: Overview & Trends -->
    <div class="an-tab-pane an-tab-pane--active" id="pane-overview">
      <div class="an-layout-row an-layout-row--velocity">
        ${attendanceVelocityCard}
        ${locCard}
      </div>

      <div class="an-layout-row">
        ${funnelCard}
        ${topPerformersCard}
      </div>
    </div>

    <!-- Tab View 2: Attendance Ledger -->
    <div class="an-tab-pane" id="pane-attendance" style="display:none">
      ${recentLogsCard}
    </div>

    <!-- Tab View 3: Cohort Demographics -->
    <div class="an-tab-pane" id="pane-demographics" style="display:none">
      <div class="an-layout-row an-layout-row--3col">
        ${hoursBracketCard}
        ${renderDistCard('Academic Programs', 'bookOpen', courseEntries, maxCourse)}
        ${renderDistCard('Host Partner Companies', 'building', companyEntries, maxCompany)}
      </div>
    </div>
  `;

  // Segmented tab navigation listener
  const segBtns = container.querySelectorAll('.an-seg-btn');
  const panes = {
    overview: container.querySelector('#pane-overview'),
    attendance: container.querySelector('#pane-attendance'),
    demographics: container.querySelector('#pane-demographics')
  };

  segBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      segBtns.forEach(b => {
        b.classList.remove('an-seg-btn--active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('an-seg-btn--active');
      btn.setAttribute('aria-selected', 'true');

      const targetTab = btn.dataset.tab;
      Object.entries(panes).forEach(([key, pane]) => {
        if (!pane) return;
        if (key === targetTab) {
          pane.style.display = 'flex';
          pane.classList.add('an-fade-enter');
          setTimeout(() => pane.classList.remove('an-fade-enter'), 250);
        } else {
          pane.style.display = 'none';
        }
      });
    });
  });

  // Table status filter interactions
  const filterBtns = container.querySelectorAll('.an-table-filter');
  const tableRows  = container.querySelectorAll('#an-logs-table tbody tr');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('an-table-filter--active'));
      btn.classList.add('an-table-filter--active');
      const filter = btn.dataset.filter;

      tableRows.forEach(row => {
        if (filter === 'all') {
          row.style.display = '';
        } else {
          row.style.display = row.dataset.status === filter ? '' : 'none';
        }
      });
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Scoped Professional Stylesheet
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
    gap: 24px;
    padding-bottom: var(--space-12);
  }

  /* ── Printable Header (Official Institutional Mode) ── */
  .an-print-header {
    display: none;
    border-bottom: 2px solid #005930;
    padding-bottom: 12px;
    margin-bottom: 20px;
  }
  .an-print-header__school {
    font-size: 16pt;
    font-weight: 800;
    color: #005930;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }
  .an-print-header__office {
    font-size: 11pt;
    color: #374151;
    font-weight: 600;
    margin-top: 2px;
  }
  .an-print-header__doc {
    font-size: 13pt;
    font-weight: 700;
    color: #111827;
    margin-top: 6px;
  }
  .an-print-header__meta {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 6px;
    font-size: 9pt;
    color: #4B5563;
    margin-top: 10px;
    padding-top: 8px;
    border-top: 1px dashed #D1D5DB;
  }

  /* ── Top Header ── */
  .an-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-4);
    flex-wrap: wrap;
    padding: var(--space-2) 0 0;
  }
  .an-header__left {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }
  .an-header__icon {
    width: 48px;
    height: 48px;
    border-radius: var(--radius-xl);
    background: #00593015;
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
    margin-bottom: 3px;
  }
  .an-header__title {
    font-size: 1.55rem;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--text-primary);
    margin: 0;
    line-height: 1.2;
  }
  .an-header__sub {
    font-size: 0.85rem;
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.4;
  }
  .an-live-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.75rem;
    font-weight: 600;
    color: #059669;
    background: #05966914;
    border: 1px solid #05966930;
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

  /* ── Header Action Buttons ── */
  .an-header__actions {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }
  .an-btn-action {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 8px 14px;
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--text-primary);
    background: var(--bg-elevated);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all var(--duration-fast);
  }
  .an-btn-action:hover {
    background: var(--bg-secondary);
    border-color: var(--border-strong);
    transform: translateY(-1px);
  }
  .an-btn-action--primary {
    background: #005930;
    color: #ffffff;
    border-color: #005930;
  }
  .an-btn-action--primary:hover {
    background: #004525;
    border-color: #004525;
    color: #ffffff;
  }
  .an-btn-refresh {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-md);
    border: 1px solid var(--border-default);
    background: var(--bg-elevated);
    color: var(--text-secondary);
    cursor: pointer;
    transition: all var(--duration-fast);
  }
  .an-btn-refresh:hover {
    background: var(--bg-secondary);
    color: var(--text-primary);
    border-color: var(--border-strong);
  }
  .an-rotating {
    animation: an-spin 0.8s linear infinite;
  }
  @keyframes an-spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }

  /* ── Segmented Tab Navigation Bar ── */
  .an-nav-bar {
    display: flex;
    align-items: center;
    border-bottom: 1px solid var(--border-default);
    padding-bottom: 12px;
    margin-top: 2px;
  }
  .an-segmented {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    background: var(--bg-secondary);
    padding: 4px;
    border-radius: var(--radius-lg);
    border: 1px solid var(--border-default);
  }
  .an-seg-btn {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 8px 18px;
    border: none;
    background: transparent;
    border-radius: calc(var(--radius-lg) - 3px);
    font-size: 0.82rem;
    font-weight: 500;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all var(--duration-fast);
    white-space: nowrap;
  }
  .an-seg-btn svg { opacity: 0.7; }
  .an-seg-btn:hover { color: var(--text-primary); }
  .an-seg-btn--active {
    background: var(--bg-elevated);
    color: #005930;
    font-weight: 600;
    box-shadow: 0 1px 3px rgba(0,0,0,0.06);
  }
  .an-seg-btn--active svg { opacity: 1; color: #005930; }

  /* ── Tab Panes ── */
  .an-tab-pane {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
  .an-fade-enter {
    animation: an-fade-in 0.22s cubic-bezier(0.4, 0, 0.2, 1) both;
  }
  @keyframes an-fade-in {
    from { opacity: 0; transform: translateY(4px); }
    to   { opacity: 1; transform: none; }
  }

  /* ── 4-Column Hero KPI Grid ── */
  .an-hero-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }
  .an-hero-card {
    background: var(--bg-elevated);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-xl);
    padding: 22px 24px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    transition: transform var(--duration-fast), box-shadow var(--duration-fast), border-color var(--duration-fast);
  }
  .an-hero-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
    border-color: var(--border-strong);
  }
  .an-hero-card__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2);
    margin-bottom: 8px;
  }
  .an-hero-card__label {
    font-size: 0.84rem;
    font-weight: 600;
    color: var(--text-secondary);
  }
  .an-hero-card__icon {
    width: 40px;
    height: 40px;
    border-radius: var(--radius-lg);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .an-hero-card__value {
    font-size: 1.95rem;
    font-weight: 700;
    letter-spacing: -0.025em;
    color: var(--text-primary);
    line-height: 1.15;
    margin-bottom: 12px;
  }
  .an-hero-card__footer {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  .an-hero-badge {
    display: inline-flex;
    align-items: center;
    font-size: 0.74rem;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: var(--radius-sm);
    width: fit-content;
  }
  .an-hero-badge--good   { background: #05966914; color: #059669; }
  .an-hero-badge--info   { background: #0284C714; color: #0284C7; }
  .an-hero-badge--warn   { background: #D9770614; color: #D97706; }
  .an-hero-badge--urgent { background: #EF444414; color: #EF4444; }
  .an-hero-card__sub {
    font-size: 0.76rem;
    color: var(--text-tertiary);
  }

  /* ── 3-Column Executive Metric Insight Cards (High Polish & Visual Balance) ── */
  .an-insights-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }
  .an-insight-card {
    background: var(--bg-elevated);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-xl);
    padding: 18px 22px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    transition: transform var(--duration-fast), box-shadow var(--duration-fast), border-color var(--duration-fast);
  }
  .an-insight-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
    border-color: var(--border-strong);
  }
  .an-insight-card__top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  .an-insight-card__header-left {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
  }
  .an-insight-card__icon {
    width: 38px;
    height: 38px;
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .an-insight-card__icon--blue   { background: #0284C714; color: #0284C7; }
  .an-insight-card__icon--green  { background: #05966914; color: #059669; }
  .an-insight-card__icon--forest { background: #00593014; color: #005930; }
  .an-insight-card__icon--warn   { background: #D9770614; color: #D97706; }
  .an-insight-card__title {
    font-size: 0.92rem;
    font-weight: 700;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .an-insight-pill {
    display: inline-flex;
    align-items: center;
    padding: 3px 10px;
    border-radius: var(--radius-full);
    font-size: 0.74rem;
    font-weight: 700;
    white-space: nowrap;
    flex-shrink: 0;
  }
  .an-insight-pill--blue   { background: #0284C714; color: #0284C7; border: 1px solid #0284C728; }
  .an-insight-pill--green  { background: #05966914; color: #059669; border: 1px solid #05966928; }
  .an-insight-pill--forest { background: #00593014; color: #005930; border: 1px solid #00593028; }
  .an-insight-pill--warn   { background: #D9770614; color: #D97706; border: 1px solid #D9770628; }
  .an-insight-card__body {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .an-insight-card__track {
    height: 5px;
    background: var(--bg-secondary);
    border-radius: var(--radius-full);
    overflow: hidden;
  }
  .an-insight-card__fill {
    height: 100%;
    border-radius: var(--radius-full);
    transition: width 0.8s ease;
  }
  .an-insight-card__fill--blue   { background: #0284C7; }
  .an-insight-card__fill--green  { background: #059669; }
  .an-insight-card__fill--forest { background: #005930; }
  .an-insight-card__fill--warn   { background: #D97706; }
  .an-insight-card__desc {
    font-size: 0.77rem;
    color: var(--text-secondary);
    line-height: 1.35;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .an-insight-card__desc strong {
    color: var(--text-primary);
  }

  /* ── Priority Action Card ── */
  .an-card--priority {
    border-left: 4px solid #D97706;
    background: var(--bg-elevated);
  }
  .an-priority-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-4);
    flex-wrap: wrap;
    margin-bottom: var(--space-2);
  }
  .an-priority-header__left {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }
  .an-priority-icon {
    width: 36px;
    height: 36px;
    border-radius: var(--radius-md);
    background: #D9770615;
    color: #D97706;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .an-priority-title {
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 0;
  }
  .an-priority-sub {
    font-size: 0.78rem;
    color: var(--text-secondary);
    margin: 0;
  }
  .an-flag-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 16px;
    margin-top: var(--space-3);
  }
  .an-flag-card {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: 14px 18px;
    border-radius: var(--radius-lg);
    background: var(--bg-secondary);
    border: 1px solid var(--border-default);
  }
  .an-flag-card__avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: #EF444415;
    color: #EF4444;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    font-weight: 700;
    flex-shrink: 0;
  }
  .an-flag-card__info {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  .an-flag-card__name {
    font-size: 0.84rem;
    font-weight: 600;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .an-flag-card__company {
    font-size: 0.75rem;
    color: var(--text-secondary);
  }
  .an-flag-card__reason {
    font-size: 0.74rem;
    color: #D97706;
    font-weight: 500;
  }
  .an-flag-card__meta {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 5px;
    flex-shrink: 0;
  }
  .an-flag-card__pct {
    font-size: 0.76rem;
    font-weight: 700;
    color: #EF4444;
  }

  /* ── Layout Rows ── */
  .an-layout-row {
    display: grid;
    grid-template-columns: 1.4fr 1fr;
    gap: 24px;
  }
  .an-layout-row--velocity {
    grid-template-columns: 1.55fr 1fr;
    gap: 24px;
  }
  .an-layout-row--3col {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 24px;
  }

  /* ── Clean Card Shell ── */
  .an-card {
    background: var(--bg-elevated);
    border: 1px solid var(--border-default);
    border-radius: var(--radius-xl);
    padding: 24px 26px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    display: flex;
    flex-direction: column;
    gap: 22px;
  }
  .an-card--flush {
    padding: 0;
    overflow: hidden;
  }
  .an-card--flush .an-card__head {
    padding: 18px 26px;
    border-bottom: 1px solid var(--border-default);
  }
  .an-card__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 2px;
  }
  .an-card__head-left {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    min-width: 0;
  }
  .an-card__head-icon {
    width: 38px;
    height: 38px;
    border-radius: var(--radius-md);
    background: #00593014;
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
    font-size: 0.96rem;
    font-weight: 700;
    color: var(--text-primary);
  }
  .an-card__sub {
    font-size: 0.76rem;
    color: var(--text-tertiary);
    line-height: 1.3;
  }
  .an-card__head-extra {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-shrink: 0;
  }

  /* ── 14-Day Attendance Velocity Chart ── */
  .an-velocity-legend {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }
  .an-velocity-stat {
    display: flex;
    align-items: baseline;
    gap: 5px;
  }
  .an-velocity-stat__num {
    font-size: 1.15rem;
    font-weight: 700;
    color: var(--text-primary);
  }
  .an-velocity-stat__label {
    font-size: 0.72rem;
    color: var(--text-tertiary);
  }
  .an-velocity-stat-sep {
    width: 1px;
    height: 14px;
    background: var(--border-default);
  }

  .an-chart-container {
    position: relative;
    width: 100%;
    height: 205px;
    padding-top: var(--space-4);
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
  }
  .an-chart-avg-line {
    position: absolute;
    left: 0;
    right: 0;
    border-bottom: 1px dashed var(--border-strong);
    pointer-events: none;
    z-index: 1;
    display: flex;
    justify-content: flex-end;
  }
  .an-chart-columns {
    display: flex;
    align-items: flex-end;
    gap: 10px;
    height: 100%;
    position: relative;
    z-index: 2;
  }
  .an-col-wrap {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    height: 100%;
    gap: 6px;
    cursor: pointer;
  }
  .an-col-track {
    flex: 1;
    width: 100%;
    display: flex;
    align-items: flex-end;
    justify-content: center;
  }
  .an-col-fill {
    width: 70%;
    max-width: 28px;
    background: #005930;
    border-radius: 5px 5px 2px 2px;
    position: relative;
    transition: opacity var(--duration-fast), background var(--duration-fast);
  }
  .an-col-fill:hover {
    background: #059669;
  }
  .an-col-wrap--weekend .an-col-fill {
    background: var(--border-strong);
    opacity: 0.45;
  }
  .an-col-wrap--today .an-col-fill {
    background: #059669;
    box-shadow: 0 0 8px #05966940;
  }
  .an-col-label {
    font-size: 0.72rem;
    color: var(--text-tertiary);
    white-space: nowrap;
  }
  .an-col-wrap--today .an-col-label {
    font-weight: 700;
    color: #059669;
  }
  .an-col-tooltip {
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%) translateY(-6px);
    background: var(--text-primary);
    color: var(--bg-primary);
    padding: 4px 8px;
    border-radius: var(--radius-sm);
    font-size: 0.72rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: opacity var(--duration-fast);
    box-shadow: 0 4px 10px rgba(0,0,0,0.15);
    z-index: 10;
  }
  .an-col-tooltip strong { font-size: 0.76rem; }
  .an-col-tooltip small  { color: var(--text-tertiary); margin-top: 1px; }
  .an-col-fill:hover .an-col-tooltip {
    opacity: 1;
  }
  .an-chart-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 14px;
    margin-top: 6px;
    border-top: 1px solid var(--border-default);
  }
  .an-chart-note {
    font-size: 0.72rem;
    color: var(--text-tertiary);
    display: flex;
    align-items: center;
    gap: 5px;
  }

  /* ── Location Compliance Box ── */
  .an-loc-content {
    display: flex;
    align-items: center;
    gap: 36px;
  }
  .an-loc-donut-area {
    display: flex;
    justify-content: center;
    flex-shrink: 0;
  }
  .an-donut-container {
    position: relative;
    width: 114px;
    height: 114px;
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
    font-size: 1.45rem;
    font-weight: 700;
    line-height: 1;
  }
  .an-donut-sub {
    font-size: 0.68rem;
    color: var(--text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin-top: 3px;
  }
  .an-loc-breakdown {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .an-loc-item {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  .an-loc-item__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.78rem;
    color: var(--text-secondary);
  }
  .an-loc-item__header strong {
    color: var(--text-primary);
  }
  .an-loc-item__title {
    display: flex;
    align-items: center;
    gap: 7px;
  }
  .an-status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .an-loc-progress {
    height: 7px;
    background: var(--bg-secondary);
    border-radius: var(--radius-full);
    overflow: hidden;
  }
  .an-loc-progress-bar {
    height: 100%;
    border-radius: var(--radius-full);
    transition: width 0.8s ease;
  }

  /* ── Pipeline Funnel ── */
  .an-funnel-stack {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .an-funnel-row {
    display: grid;
    grid-template-columns: 160px 1fr 85px;
    align-items: center;
    gap: 16px;
    padding: 10px 0;
  }
  .an-funnel-meta {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }
  .an-funnel-num {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    font-size: 0.75rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .an-funnel-titles {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  .an-funnel-label {
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--text-primary);
  }
  .an-funnel-sub {
    font-size: 0.7rem;
    color: var(--text-tertiary);
    line-height: 1.25;
  }
  .an-funnel-bar-track {
    height: 22px;
    background: var(--bg-secondary);
    border-radius: var(--radius-sm);
    overflow: hidden;
    border: 1px solid var(--border-default);
  }
  .an-funnel-bar-fill {
    height: 100%;
    border-radius: calc(var(--radius-sm) - 1px);
    transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  }
  .an-funnel-count {
    display: flex;
    align-items: baseline;
    justify-content: flex-end;
    gap: 4px;
  }
  .an-funnel-count strong {
    font-size: 0.95rem;
    color: var(--text-primary);
  }
  .an-funnel-count span {
    font-size: 0.72rem;
    color: var(--text-tertiary);
  }
  .an-funnel-connector {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 2px 0 2px 172px;
  }
  .an-funnel-stem {
    width: 1px;
    height: 10px;
    background: var(--border-default);
  }
  .an-funnel-conversion {
    font-size: 0.7rem;
    color: var(--text-tertiary);
    padding: 1px 7px;
    border-radius: var(--radius-sm);
    background: var(--bg-secondary);
  }

  /* ── Top Performers ── */
  .an-top-stack {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .an-top-row {
    display: grid;
    grid-template-columns: 28px 36px 1fr 180px;
    align-items: center;
    gap: 14px;
    padding: 10px 0;
    border-bottom: 1px solid var(--border-default);
  }
  .an-top-row:last-child {
    border-bottom: none;
  }
  .an-top-rank {
    font-size: 1.1rem;
    text-align: center;
  }
  .an-top-number {
    font-size: 0.8rem;
    font-weight: 700;
    color: var(--text-tertiary);
  }
  .an-top-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: #005930;
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    font-weight: 700;
    flex-shrink: 0;
  }
  .an-top-details {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 1px;
  }
  .an-top-name {
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .an-top-sub {
    font-size: 0.72rem;
    color: var(--text-tertiary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .an-top-meter {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }
  .an-top-stats {
    display: flex;
    justify-content: space-between;
    font-size: 0.72rem;
    color: var(--text-tertiary);
  }
  .an-top-stats strong {
    font-weight: 700;
  }
  .an-top-track {
    height: 7px;
    background: var(--bg-secondary);
    border-radius: var(--radius-full);
    overflow: hidden;
  }
  .an-top-fill {
    height: 100%;
    border-radius: var(--radius-full);
    transition: width 0.8s ease;
  }

  /* ── Hours Brackets & Distributions ── */
  .an-bracket-stack, .an-dist-stack {
    display: flex;
    flex-direction: column;
    gap: 11px;
  }
  .an-bracket-row, .an-dist-row {
    display: grid;
    grid-template-columns: 100px 1fr 90px;
    align-items: center;
    gap: var(--space-3);
  }
  .an-bracket-label, .an-dist-label {
    font-size: 0.78rem;
    font-weight: 500;
    color: var(--text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .an-bracket-track, .an-dist-track {
    height: 7px;
    background: var(--bg-secondary);
    border-radius: var(--radius-full);
    overflow: hidden;
  }
  .an-bracket-fill, .an-dist-fill {
    height: 100%;
    border-radius: var(--radius-full);
    transition: width 0.8s ease;
  }
  .an-bracket-badge, .an-dist-badge {
    font-size: 0.74rem;
    font-weight: 600;
    text-align: right;
    padding: 2px 7px;
    border-radius: var(--radius-sm);
  }

  /* ── Recent Attendance Table ── */
  .an-table-filter-group {
    display: flex;
    align-items: center;
    gap: 4px;
    background: var(--bg-secondary);
    padding: 2px;
    border-radius: var(--radius-md);
  }
  .an-table-filter {
    border: none;
    background: transparent;
    font-size: 0.74rem;
    font-weight: 500;
    color: var(--text-secondary);
    padding: 3px 9px;
    border-radius: calc(var(--radius-md) - 2px);
    cursor: pointer;
    transition: all var(--duration-fast);
  }
  .an-table-filter--active {
    background: var(--bg-elevated);
    color: var(--text-primary);
    font-weight: 600;
    box-shadow: 0 1px 2px rgba(0,0,0,0.06);
  }
  .an-table-wrap {
    overflow-x: auto;
  }
  .an-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.8rem;
  }
  .an-table thead tr {
    background: var(--bg-secondary);
  }
  .an-table th {
    padding: 12px 18px;
    font-size: 0.74rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--text-tertiary);
    border-bottom: 1px solid var(--border-default);
    text-align: left;
    white-space: nowrap;
  }
  .an-table td {
    padding: 12px 18px;
    vertical-align: middle;
    border-bottom: 1px solid var(--border-default);
    color: var(--text-primary);
  }
  .an-table tbody tr:hover {
    background: var(--bg-secondary);
  }
  .an-user-cell {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .an-user-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #005930;
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 700;
    flex-shrink: 0;
  }
  .an-user-name {
    font-weight: 600;
    color: var(--text-primary);
  }
  .an-cell-muted {
    color: var(--text-secondary);
  }
  .an-time-tag {
    display: inline-block;
    padding: 3px 8px;
    border-radius: var(--radius-sm);
    background: var(--bg-secondary);
    font-weight: 600;
    font-size: 0.76rem;
    color: var(--text-primary);
  }
  .an-status-chip {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 3px 9px;
    border-radius: var(--radius-full);
    font-size: 0.74rem;
    font-weight: 600;
    white-space: nowrap;
  }
  .an-status-chip--good {
    background: #05966914;
    color: #059669;
    border: 1px solid #05966930;
  }
  .an-status-chip--warn {
    background: #EF444414;
    color: #EF4444;
    border: 1px solid #EF444430;
  }
  .an-status-chip--neutral {
    background: var(--bg-secondary);
    color: var(--text-tertiary);
    border: 1px solid var(--border-default);
  }

  /* ── Empty States ── */
  .an-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: var(--space-8) var(--space-4);
    gap: 6px;
  }
  .an-empty__icon { margin-bottom: var(--space-1); color: var(--text-tertiary); }
  .an-empty__title { font-size: 0.9rem; font-weight: 600; color: var(--text-primary); margin: 0; }
  .an-empty__text { font-size: 0.78rem; color: var(--text-tertiary); margin: 0; }
  .an-empty--error { padding: var(--space-12) var(--space-4); }

  /* ── Responsive Adaptations ── */
  @media (max-width: 1200px) {
    .an-hero-grid { grid-template-columns: repeat(2, 1fr); }
    .an-insights-grid { grid-template-columns: 1fr; }
    .an-layout-row { grid-template-columns: 1fr; }
    .an-layout-row--velocity { grid-template-columns: 1fr; }
    .an-layout-row--3col { grid-template-columns: 1fr; }
  }
  @media (max-width: 768px) {
    .an-hero-grid { grid-template-columns: 1fr; }
    .an-header { flex-direction: column; align-items: flex-start; }
    .an-header__actions { width: 100%; justify-content: flex-start; }
    .an-loc-content { flex-direction: column; align-items: flex-start; }
    .an-velocity-legend { display: none; }
    .an-funnel-row { grid-template-columns: 120px 1fr 60px; }
  }

  /* ── Print Stylesheet ── */
  @media print {
    /* Hide navigation, sidebars, header buttons, tab bar */
    .sidebar-left, .navbar, .mobile-bottom-nav, .an-header__actions, .an-nav-bar, .an-table-filter-group {
      display: none !important;
    }
    body, .an-page {
      background: #ffffff !important;
      color: #000000 !important;
      padding: 0 !important;
      font-size: 9pt !important;
    }
    .an-print-header {
      display: block !important;
    }
    .an-tab-pane {
      display: flex !important;
    }
    .an-hero-grid {
      grid-template-columns: repeat(4, 1fr) !important;
      gap: 8px !important;
    }
    .an-hero-card {
      border: 1px solid #D1D5DB !important;
      box-shadow: none !important;
      padding: 10px !important;
      break-inside: avoid;
    }
    .an-card {
      border: 1px solid #D1D5DB !important;
      box-shadow: none !important;
      padding: 12px !important;
      break-inside: avoid;
    }
    .an-layout-row {
      grid-template-columns: 1fr 1fr !important;
      gap: 12px !important;
    }
    .an-layout-row--velocity {
      grid-template-columns: 1.5fr 1fr !important;
    }
    .an-layout-row--3col {
      grid-template-columns: repeat(3, 1fr) !important;
    }
    .an-table {
      font-size: 8pt !important;
    }
    .an-table th, .an-table td {
      padding: 6px 10px !important;
    }
  }
  `;
  document.head.appendChild(s);
}
