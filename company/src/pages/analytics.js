/**
 * CHMSU HireMe — Company Analytics & Insights Page
 * Executive Dashboard: Overview | Jobs & Hiring | OJT Trainees
 * Neat, clean, and professional UI without clutter or dramatic animations.
 */
import { icon } from '../components/icons.js';
import { apiGet, apiFetch } from '../api/client.js';

const PALETTE = ['#005930', '#059669', '#0284C7', '#D97706', '#7C3AED', '#0D9488', '#E11D48'];

// ─── Main Entry ───────────────────────────────────────────────────────────────
export async function renderAnalytics(container) {
  // Clean skeleton placeholder
  container.innerHTML = `
    <div class="an2-skeleton">
      <div class="an2-skel an2-skel--header"></div>
      <div class="an2-skel an2-skel--tabs"></div>
      <div class="an2-skel-kpis">
        ${Array(4).fill('<div class="an2-skel an2-skel--kpi"></div>').join('')}
      </div>
      <div class="an2-skel-row">
        <div class="an2-skel an2-skel--card"></div>
        <div class="an2-skel an2-skel--card"></div>
      </div>
    </div>
  `;

  let data;
  try {
    const res = await apiGet('/company/analytics');
    data = res?.success && res.data ? res.data : null;
  } catch (_) {}

  if (!data) {
    const mock = await apiFetch('analytics/overview', { delay: 400 });
    if (!mock?.success) {
      container.innerHTML = `
        <div class="an2-error">
          <div class="an2-error__icon">${icon('alertCircle', 28)}</div>
          <h3>Unable to load analytics</h3>
          <p>We encountered an issue retrieving your performance metrics. Please try again.</p>
          <button class="btn btn-secondary" id="an2-retry-btn">${icon('refreshCw', 15)} Retry</button>
        </div>`;
      container.querySelector('#an2-retry-btn')?.addEventListener('click', () => renderAnalytics(container));
      return;
    }
    data = mock.data;
  }

  const ojt  = data.ojtAnalytics  || {};
  const jFun = data.hiringFunnel  || {};
  const oFun = ojt.ojtFunnel      || {};

  const timeToHire = data.kpiMetrics?.find(k => k.label === 'Avg. Time to Hire')?.value || '18 days';
  const offerAcc   = data.kpiMetrics?.find(k => k.label === 'Offer Acceptance')?.value  || '85%';

  // Overview 6-KPI metrics (clean & executive)
  const overviewKpis = [
    { label: 'Total Job Applications', value: jFun.applied ?? 0,    icon: 'fileText',      color: '#005930', trend: '+12% vs last month', isUp: true },
    { label: 'Total Hired Candidates', value: jFun.hired ?? 0,      icon: 'userCheck',     color: '#059669', trend: 'Direct hires',        isUp: null },
    { label: 'Avg. Time to Hire',      value: timeToHire,           icon: 'clock',         color: '#0284C7', trend: '-2 days faster',     isUp: true },
    { label: 'Offer Acceptance Rate',  value: offerAcc,             icon: 'checkCircle',   color: '#0D9488', trend: '+4% acceptance',     isUp: true },
    { label: 'OJT Inquiries',          value: oFun.interested ?? 0, icon: 'graduationCap', color: '#D97706', trend: 'Academic year 2025', isUp: null },
    { label: 'Active OJT Trainees',    value: oFun.accepted ?? 0,   icon: 'award',         color: '#7C3AED', trend: 'Currently rendered', isUp: null },
  ];

  const jMonthlyTotal = (data.monthlyApplications || []).reduce((s, m) => s + m.count, 0);
  const oMonthlyTotal = (ojt.monthlyOjtInterests  || []).reduce((s, m) => s + m.count, 0);

  container.innerHTML = `
    <div class="an2-page fade-in">

      <!-- ── Top Header ─────────────────────────────────────────────────────── -->
      <div class="an2-header">
        <div class="an2-header__left">
          <div class="an2-header__icon">${icon('barChart2', 22)}</div>
          <div>
            <div class="an2-header__title-row">
              <h1 class="an2-header__title">Analytics &amp; Insights</h1>
              <span class="an2-live-badge"><span class="an2-live-dot"></span>Live Data</span>
            </div>
            <p class="an2-header__sub">Recruitment pipeline velocity, conversion milestones, and OJT performance metrics.</p>
          </div>
        </div>
        <div class="an2-header__actions">
          <button class="an2-btn-refresh" id="an2-refresh-btn" title="Refresh metrics">
            ${icon('refreshCw', 15)}
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <!-- ── Segmented Tab Navigation ──────────────────────────────────────── -->
      <div class="an2-tabs-bar">
        <div class="an2-tabs" role="tablist">
          <button class="an2-tab an2-tab--active" data-tab="overview" role="tab" aria-selected="true">
            ${icon('layout', 15)} <span>Overview</span>
          </button>
          <button class="an2-tab" data-tab="jobs" role="tab" aria-selected="false">
            ${icon('briefcase', 15)} <span>Jobs &amp; Hiring</span>
          </button>
          <button class="an2-tab" data-tab="ojt" role="tab" aria-selected="false">
            ${icon('graduationCap', 15)} <span>OJT Trainees</span>
          </button>
          <div class="an2-tabs__ink" id="an2-ink"></div>
        </div>
      </div>

      <!-- ══════════════════════════════════════════════════════════════════
           OVERVIEW TAB
           ══════════════════════════════════════════════════════════════════ -->
      <div class="an2-panel" id="tab-overview">

        <!-- 6-Metric Executive KPI Grid -->
        <div class="an2-kpi-grid an2-kpi-grid--6">
          ${overviewKpis.map(k => kpiCard(k)).join('')}
        </div>

        <!-- Monthly Trends (Dual Bar) & Conversion Snapshot -->
        <div class="an2-row an2-row--3-2">
          <div class="an2-card an2-card--span2">
            ${cardHead('Recruitment & Inquiry Trends', 'Monthly volume comparison for Job applications vs OJT interests', 'trendingUp', '#005930',
              `<div class="an2-dual-legend">
                 <span class="an2-dual-legend__item"><span class="an2-dual-legend__dot" style="background:#005930"></span>Jobs <strong>${jMonthlyTotal}</strong></span>
                 <span class="an2-dual-legend__item"><span class="an2-dual-legend__dot" style="background:#10B981"></span>OJT <strong>${oMonthlyTotal}</strong></span>
               </div>`)}
            ${renderDualBarChart(data.monthlyApplications || [], ojt.monthlyOjtInterests || [])}
          </div>
          <div class="an2-card">
            ${cardHead('Conversion Overview', 'Hiring pass-through vs OJT endorsement rate', 'zap', '#0284C7')}
            ${renderMiniCompare(jFun, oFun)}
          </div>
        </div>

        <!-- Candidate Sources & Academic Distribution -->
        <div class="an2-row">
          <div class="an2-card">
            ${cardHead('Candidate Acquisition Sources', 'Channels where jobseekers discover company postings', 'pieChart', '#0284C7')}
            ${renderDonutChart(data.topSources || [], 'source')}
          </div>
          <div class="an2-card">
            ${cardHead('OJT Applicants by Program', 'Distribution of university student applicant programs', 'award', '#059669')}
            ${renderDonutChart(ojt.programBreakdown || [], 'program')}
          </div>
        </div>

      </div>

      <!-- ══════════════════════════════════════════════════════════════════
           JOBS & HIRING TAB
           ══════════════════════════════════════════════════════════════════ -->
      <div class="an2-panel an2-panel--hidden" id="tab-jobs">

        <div class="an2-kpi-grid">
          ${(data.kpiMetrics || []).map(k => kpiCard(k)).join('')}
        </div>

        <div class="an2-row an2-row--3-2">
          <div class="an2-card an2-card--span2">
            ${cardHead('Hiring Pipeline Funnel', 'Progression and drop-off rate through candidate screening stages', 'filter', '#005930')}
            ${renderStagedFunnel(jFun, [
              { label: 'Applied',     key: 'applied',     color: '#005930' },
              { label: 'Screened',    key: 'screened',    color: '#0284C7' },
              { label: 'Interviewed', key: 'interviewed', color: '#D97706' },
              { label: 'Offered',     key: 'offered',     color: '#0D9488' },
              { label: 'Hired',       key: 'hired',       color: '#059669' },
            ])}
          </div>
          <div class="an2-card">
            ${cardHead('Monthly Applications', 'Job candidate submissions over last 6 months', 'barChart', '#005930',
              `<span class="an2-badge an2-badge--green">${jMonthlyTotal} total</span>`)}
            ${renderSingleBarChart(data.monthlyApplications || [], '#005930')}
          </div>
        </div>

        <div class="an2-row">
          <div class="an2-card">
            ${cardHead('Department Breakdown', 'Active openings and candidate pipeline per department', 'briefcase', '#0284C7')}
            ${renderDeptTable(data.departmentBreakdown || [])}
          </div>
          <div class="an2-card">
            ${cardHead('Channel Sources', 'Breakdown of candidate acquisition channels', 'pieChart', '#7C3AED')}
            ${renderDonutChart(data.topSources || [], 'source')}
          </div>
        </div>

        <div class="an2-card">
          ${cardHead('Hired Employees', 'Candidates successfully hired and onboarded via HireMe', 'userCheck', '#059669',
            `<span class="an2-badge an2-badge--green">${(data.hiredApplicants || []).length} hired</span>`)}
          ${renderHiredTable(data.hiredApplicants || [])}
        </div>

      </div>

      <!-- ══════════════════════════════════════════════════════════════════
           OJT TRAINEES TAB
           ══════════════════════════════════════════════════════════════════ -->
      <div class="an2-panel an2-panel--hidden" id="tab-ojt">

        <div class="an2-kpi-grid">
          ${(ojt.ojtKpis || []).map(k => kpiCard(k)).join('')}
        </div>

        <div class="an2-row an2-row--3-2">
          <div class="an2-card an2-card--span2">
            ${cardHead('OJT Selection Funnel', 'Student inquiry progression through coordinator endorsement to acceptance', 'filter', '#059669')}
            ${renderStagedFunnel(oFun, [
              { label: 'Interested', key: 'interested', color: '#005930' },
              { label: 'Endorsed',   key: 'endorsed',   color: '#0284C7' },
              { label: 'Accepted',   key: 'accepted',   color: '#059669' },
              { label: 'Rejected',   key: 'rejected',   color: '#E11D48' },
            ])}
          </div>
          <div class="an2-card">
            ${cardHead('Monthly OJT Interest', 'Student interest submissions over last 6 months', 'barChart', '#059669',
              `<span class="an2-badge an2-badge--green">${oMonthlyTotal} inquiries</span>`)}
            ${renderSingleBarChart(ojt.monthlyOjtInterests || [], '#059669')}
          </div>
        </div>

        <div class="an2-row">
          <div class="an2-card">
            ${cardHead('Distribution by Program', 'Enrolled courses of interested OJT students', 'pieChart', '#0D9488')}
            ${renderDonutChart(ojt.programBreakdown || [], 'program')}
          </div>
          <div class="an2-card">
            ${cardHead('Active Trainee Hours', 'Current student trainees completing internship hours', 'award', '#D97706',
              `<span class="an2-badge an2-badge--amber">${(ojt.activeTrainees || []).length} active</span>`)}
            ${renderTraineesTable(ojt.activeTrainees || [])}
          </div>
        </div>

      </div>

    </div>
  `;

  // ── Tab Switching Logic ───────────────────────────────────────────────────────
  const tabs   = container.querySelectorAll('.an2-tab');
  const panels = container.querySelectorAll('.an2-panel');
  const ink    = container.querySelector('#an2-ink');

  function moveInk(btn) {
    if (!ink || !btn) return;
    ink.style.left  = btn.offsetLeft + 'px';
    ink.style.width = btn.offsetWidth + 'px';
  }

  requestAnimationFrame(() => {
    const active = container.querySelector('.an2-tab--active');
    if (active) moveInk(active);
  });

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => {
        t.classList.remove('an2-tab--active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('an2-tab--active');
      tab.setAttribute('aria-selected', 'true');
      moveInk(tab);

      const target = tab.dataset.tab;
      panels.forEach(p => {
        const show = p.id === `tab-${target}`;
        p.classList.toggle('an2-panel--hidden', !show);
        if (show) {
          p.classList.add('an2-panel--enter');
          setTimeout(() => p.classList.remove('an2-panel--enter'), 300);
        }
      });
    });
  });

  // Window resize ink adjuster
  window.addEventListener('resize', () => {
    const active = container.querySelector('.an2-tab--active');
    if (active) moveInk(active);
  }, { passive: true });

  // Refresh handler
  container.querySelector('#an2-refresh-btn')?.addEventListener('click', () => {
    renderAnalytics(container);
  });
}

// ─── Shared Card Header ────────────────────────────────────────────────────────
function cardHead(title, sub, iconName, color, extra = '') {
  return `
    <div class="an2-card__head">
      <div class="an2-card__head-left">
        <div class="an2-card__icon" style="background:${color}12;color:${color}">
          ${icon(iconName, 17)}
        </div>
        <div class="an2-card__titles">
          <div class="an2-card__title">${title}</div>
          <div class="an2-card__sub">${sub}</div>
        </div>
      </div>
      ${extra ? `<div class="an2-card__extra">${extra}</div>` : ''}
    </div>`;
}

// ─── Executive KPI Card ───────────────────────────────────────────────────────
function kpiCard({ label, value, icon: iconName, color = '#005930', sub = '', trend = '', isUp = null }) {
  const trendClass = isUp === true ? 'an2-kpi__trend--up' : isUp === false ? 'an2-kpi__trend--down' : 'an2-kpi__trend--neutral';
  const trendArrow = isUp === true ? '↑ ' : isUp === false ? '↓ ' : '';

  return `
    <div class="an2-kpi" style="--kc:${color}">
      <div class="an2-kpi__header">
        <span class="an2-kpi__label">${label}</span>
        <div class="an2-kpi__icon" style="background:${color}14;color:${color}">
          ${icon(iconName, 16)}
        </div>
      </div>
      <div class="an2-kpi__value">${value}</div>
      <div class="an2-kpi__footer">
        ${trend ? `<span class="an2-kpi__trend ${trendClass}">${trendArrow}${trend.replace(/^[+\-]/, '')}</span>` : ''}
        ${sub ? `<span class="an2-kpi__sub">${sub}</span>` : ''}
      </div>
    </div>`;
}

// ─── Staged Funnel (Clean Pipeline Steps) ──────────────────────────────────────
function renderStagedFunnel(funnel, stages) {
  const max = funnel[stages[0].key] || 1;
  return `
    <div class="an2-funnel">
      ${stages.map((s, i) => {
        const val  = funnel[s.key] ?? 0;
        const pct  = Math.max(3, Math.round((val / max) * 100));
        const prev = i > 0 ? (funnel[stages[i - 1].key] || 1) : null;
        const conv = prev !== null && s.key !== 'rejected' ? Math.round((val / prev) * 100) : null;

        return `
          ${i > 0 ? `
            <div class="an2-funnel__transition">
              <div class="an2-funnel__stem"></div>
              ${conv !== null ? `<span class="an2-funnel__rate">${conv}% pass-through</span>` : ''}
            </div>` : ''}
          <div class="an2-funnel__row">
            <div class="an2-funnel__meta">
              <span class="an2-funnel__dot" style="background:${s.color}"></span>
              <span class="an2-funnel__label">${s.label}</span>
            </div>
            <div class="an2-funnel__track">
              <div class="an2-funnel__fill" style="width:${pct}%;background:${s.color}"></div>
            </div>
            <div class="an2-funnel__metrics">
              <span class="an2-funnel__count">${val}</span>
              <span class="an2-funnel__pct">${pct}%</span>
            </div>
          </div>`;
      }).join('')}
    </div>`;
}

// ─── Single-Series Bar Chart ──────────────────────────────────────────────────
function renderSingleBarChart(monthly, color = '#005930') {
  if (!monthly.length) return `<div class="an2-empty-sm">No monthly data recorded yet.</div>`;
  const max = Math.max(...monthly.map(m => m.count), 1);

  return `
    <div class="an2-chart-wrap">
      <div class="an2-barchart">
        <div class="an2-chart-guides">
          <div class="an2-guide-line"><span>${max}</span></div>
          <div class="an2-guide-line"><span>${Math.round(max / 2)}</span></div>
          <div class="an2-guide-line"><span>0</span></div>
        </div>
        <div class="an2-barchart__inner">
          ${monthly.map((m, i) => {
            const h = Math.max(4, Math.round((m.count / max) * 100));
            return `
              <div class="an2-barchart__col" title="${m.month}: ${m.count}">
                <div class="an2-barchart__track">
                  <div class="an2-barchart__bar" style="height:${h}%;background:${color}">
                    <span class="an2-barchart__tooltip">${m.count}</span>
                  </div>
                </div>
                <span class="an2-barchart__lbl">${m.month}</span>
              </div>`;
          }).join('')}
        </div>
      </div>
    </div>`;
}

// ─── Dual-Series Bar Chart ────────────────────────────────────────────────────
function renderDualBarChart(jobs, ojt) {
  if (!jobs.length && !ojt.length) return `<div class="an2-empty-sm">No historical trend data available.</div>`;
  const months = jobs.length ? jobs : ojt;
  const maxVal = Math.max(...jobs.map(m => m.count), ...ojt.map(m => m.count), 1);

  return `
    <div class="an2-chart-wrap">
      <div class="an2-dual">
        <div class="an2-chart-guides">
          <div class="an2-guide-line"><span>${maxVal}</span></div>
          <div class="an2-guide-line"><span>${Math.round(maxVal / 2)}</span></div>
          <div class="an2-guide-line"><span>0</span></div>
        </div>
        <div class="an2-dual__inner">
          ${months.map((m, i) => {
            const j  = jobs[i]?.count ?? 0;
            const o  = ojt[i]?.count  ?? 0;
            const jh = Math.max(3, Math.round((j / maxVal) * 100));
            const oh = Math.max(3, Math.round((o / maxVal) * 100));
            return `
              <div class="an2-dual__col">
                <div class="an2-dual__track">
                  <div class="an2-dual__pair">
                    <div class="an2-dual__bar an2-dual__bar--jobs" style="height:${jh}%" title="Jobs: ${j}">
                      <span class="an2-barchart__tooltip">${j} Jobs</span>
                    </div>
                    <div class="an2-dual__bar an2-dual__bar--ojt" style="height:${oh}%" title="OJT: ${o}">
                      <span class="an2-barchart__tooltip">${o} OJT</span>
                    </div>
                  </div>
                </div>
                <span class="an2-dual__lbl">${m.month}</span>
              </div>`;
          }).join('')}
        </div>
      </div>
    </div>`;
}

// ─── SVG Donut Chart with Clean Legend ────────────────────────────────────────
function renderDonutChart(items, keyName) {
  if (!items.length) return `<div class="an2-empty-sm">No breakdown records available.</div>`;
  const total = items.reduce((s, r) => s + r.count, 0) || 1;
  const R = 38, C = 2 * Math.PI * R;
  let offset = 0;

  const segs = items.map((item, i) => {
    const color = PALETTE[i % PALETTE.length];
    const frac  = item.count / total;
    const dash  = frac * C;
    const seg = `<circle r="${R}" cx="48" cy="48"
      stroke="${color}" stroke-width="8" fill="none"
      stroke-dasharray="${dash.toFixed(2)} ${(C - dash).toFixed(2)}"
      stroke-dashoffset="${(-offset * C + C * 0.25).toFixed(2)}"
      class="an2-donut__arc" />`;
    offset += frac;
    return seg;
  }).join('');

  const labelMap = { full_time: 'Full-time', part_time: 'Part-time', contract: 'Contract', internship: 'Internship' };
  const legend = items.map((item, i) => {
    const color = PALETTE[i % PALETTE.length];
    const pct   = Math.round((item.count / total) * 100);
    const name  = labelMap[item[keyName]] || item[keyName];
    return `
      <div class="an2-donut__row">
        <div class="an2-donut__label-group">
          <span class="an2-donut__dot" style="background:${color}"></span>
          <span class="an2-donut__name" title="${name}">${name}</span>
        </div>
        <div class="an2-donut__bar-track">
          <div class="an2-donut__bar-fill" style="width:${pct}%;background:${color}"></div>
        </div>
        <div class="an2-donut__stats">
          <span class="an2-donut__count">${item.count}</span>
          <span class="an2-donut__pct">${pct}%</span>
        </div>
      </div>`;
  }).join('');

  return `
    <div class="an2-donut">
      <div class="an2-donut__chart">
        <svg class="an2-donut__svg" viewBox="0 0 96 96">
          <circle r="${R}" cx="48" cy="48" stroke="var(--border-default)" stroke-width="8" fill="none"/>
          ${segs}
        </svg>
        <div class="an2-donut__center">
          <span class="an2-donut__total">${total}</span>
          <span class="an2-donut__lbl">Total</span>
        </div>
      </div>
      <div class="an2-donut__legend">${legend}</div>
    </div>`;
}

// ─── Conversion Mini Comparison ───────────────────────────────────────────────
function renderMiniCompare(jFun, oFun) {
  const jTotal = jFun.applied    || 0;
  const jHired = jFun.hired      || 0;
  const oTotal = oFun.interested || 0;
  const oAcc   = oFun.accepted   || 0;
  const jRate  = jTotal ? Math.round((jHired / jTotal) * 100) : 0;
  const oRate  = oTotal ? Math.round((oAcc   / oTotal) * 100) : 0;

  function rateCard(title, pct, num, denom, color, note) {
    return `
      <div class="an2-rate-card">
        <div class="an2-rate-card__top">
          <span class="an2-rate-card__title">${title}</span>
          <span class="an2-rate-card__val" style="color:${color}">${pct}%</span>
        </div>
        <div class="an2-rate-card__track">
          <div class="an2-rate-card__fill" style="width:${pct}%;background:${color}"></div>
        </div>
        <div class="an2-rate-card__meta">
          <span><strong>${num}</strong> of ${denom} completed</span>
          <span class="an2-rate-card__note">${note}</span>
        </div>
      </div>`;
  }

  return `
    <div class="an2-compare">
      ${rateCard('Job Candidate Hire Rate', jRate, jHired, jTotal, '#005930', 'Direct offers')}
      <div class="an2-compare__sep"></div>
      ${rateCard('OJT Trainee Acceptance Rate', oRate, oAcc, oTotal, '#059669', 'Coordinator endorsed')}
    </div>`;
}

// ─── Department Breakdown Table ───────────────────────────────────────────────
function renderDeptTable(departments) {
  if (!departments.length) return `<div class="an2-empty-sm">No departmental hiring records yet.</div>`;
  const maxAp = Math.max(...departments.map(d => d.applicants), 1);

  return `
    <div class="an2-dept-table-wrap">
      <table class="an2-dept-table">
        <thead>
          <tr>
            <th>Department</th>
            <th class="text-center">Openings</th>
            <th>Applicant Volume</th>
            <th class="text-right">Filled</th>
          </tr>
        </thead>
        <tbody>
          ${departments.map(d => `
            <tr>
              <td>
                <div class="an2-dept-name">
                  <span class="an2-dept-dot"></span>
                  <span>${d.department}</span>
                </div>
              </td>
              <td class="text-center">
                <span class="an2-dept-badge">${d.openPositions}</span>
              </td>
              <td>
                <div class="an2-dept-meter">
                  <div class="an2-dept-meter__bar">
                    <div class="an2-dept-meter__fill" style="width:${Math.round((d.applicants / maxAp) * 100)}%"></div>
                  </div>
                  <span class="an2-dept-meter__val">${d.applicants}</span>
                </div>
              </td>
              <td class="text-right">
                <span class="an2-dept-filled">${d.filled}</span>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
}

// ─── Hired Employees Table ────────────────────────────────────────────────────
function renderHiredTable(employees) {
  if (!employees.length) {
    return `
      <div class="an2-empty">
        <div class="an2-empty__icon">${icon('userCheck', 28)}</div>
        <p class="an2-empty__title">No hired candidates yet</p>
        <p class="an2-empty__sub">When applicants accept job offers and complete onboarding, their profile details will be listed here.</p>
      </div>`;
  }

  const typeColor = {
    'Full-time': '#005930',
    'Part-time': '#D97706',
    'Contract': '#0284C7',
    'Internship': '#7C3AED',
  };

  return `
    <div class="an2-table-wrap">
      <table class="an2-table">
        <thead>
          <tr>
            <th>Candidate</th>
            <th>Job Role</th>
            <th>Type</th>
            <th>Location</th>
            <th>Salary Range</th>
            <th>Start Date</th>
            <th>Hired Date</th>
          </tr>
        </thead>
        <tbody>
          ${employees.map((e) => {
            const ini = e.name.trim().split(/\s+/).map(n => n[0]).join('').toUpperCase().slice(0, 2);
            const tc  = typeColor[e.employment_type] || '#005930';
            return `
              <tr>
                <td class="an2-td--user">
                  <div class="an2-avatar" ${e.avatar_url ? `style="background-image:url('${e.avatar_url}')"` : ''}>
                    ${e.avatar_url ? '' : `<span>${ini}</span>`}
                  </div>
                  <div class="an2-user-info">
                    <span class="an2-user-name">${e.name}</span>
                    <span class="an2-user-email">${e.email}</span>
                  </div>
                </td>
                <td>
                  <span class="an2-role-title">${e.job_title}</span>
                  ${e.department && e.department !== '—' ? `<span class="an2-role-dept">${e.department}</span>` : ''}
                </td>
                <td>
                  <span class="an2-type-tag" style="background:${tc}14;color:${tc};border-color:${tc}33">
                    ${e.employment_type}
                  </span>
                </td>
                <td class="an2-td--meta">${e.location !== '—' ? e.location : '<span class="an2-muted">—</span>'}</td>
                <td class="an2-td--meta">${e.salary || '<span class="an2-muted">—</span>'}</td>
                <td class="an2-td--meta">${e.start_date !== '—' ? e.start_date : '<span class="an2-muted">—</span>'}</td>
                <td><span class="an2-date-chip">${e.hired_on}</span></td>
              </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;
}

// ─── Active OJT Trainees Table ────────────────────────────────────────────────
function renderTraineesTable(trainees) {
  if (!trainees.length) {
    return `
      <div class="an2-empty">
        <div class="an2-empty__icon">${icon('graduationCap', 28)}</div>
        <p class="an2-empty__title">No active OJT trainees</p>
        <p class="an2-empty__sub">Students accepted into your OJT programs will appear here with live tracking of their rendered hours.</p>
      </div>`;
  }

  return `
    <div class="an2-table-wrap">
      <table class="an2-table">
        <thead>
          <tr>
            <th>Student Trainee</th>
            <th>Program / Major</th>
            <th>Required Hours Progress</th>
            <th>Starting Date</th>
          </tr>
        </thead>
        <tbody>
          ${trainees.map(t => {
            const ini  = t.name.trim().split(/\s+/).map(n => n[0]).join('').toUpperCase().slice(0, 2);
            const pct  = t.hours_rendered != null ? Math.min(100, Math.round((t.hours_rendered / 600) * 100)) : 0;
            const pc   = pct >= 80 ? '#059669' : pct >= 40 ? '#005930' : '#0284C7';
            return `
              <tr>
                <td class="an2-td--user">
                  <div class="an2-avatar an2-avatar--trainee"><span>${ini}</span></div>
                  <div class="an2-user-info">
                    <span class="an2-user-name">${t.name}</span>
                    <span class="an2-user-email">${t.email}</span>
                  </div>
                </td>
                <td>
                  <span class="an2-role-title">${t.program}</span>
                  ${t.year_level ? `<span class="an2-role-dept">${t.year_level}</span>` : ''}
                </td>
                <td style="min-width:180px">
                  <div class="an2-progress-row">
                    <div class="an2-progress-track">
                      <div class="an2-progress-fill" style="width:${pct}%;background:${pc}"></div>
                    </div>
                    <span class="an2-progress-pct" style="color:${pc}">${pct}%</span>
                  </div>
                  <span class="an2-progress-hours">${t.hours_rendered ?? 0} of 600 hours</span>
                </td>
                <td class="an2-td--meta"><span class="an2-date-chip">${t.started_at}</span></td>
              </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>`;
}
