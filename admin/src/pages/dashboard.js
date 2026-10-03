/* -- Dashboard Page - Admin Portal -- */
import { icon, renderIcons } from '../components/icons.js';
import { apiGetCached, getCached } from '../api/client.js';

function num(n) { return (n ?? 0).toLocaleString(); }
function pct(part, total) { return total > 0 ? Math.round((part / total) * 100) : 0; }

/* -- Skeleton loading placeholder -- */
function skeleton() {
  return `
    <div style="background:var(--bg-elevated);border:1px solid var(--border-default);border-radius:var(--radius-lg);padding:var(--space-5);display:flex;flex-direction:column;gap:var(--space-3);">
      <div style="display:flex;justify-content:space-between;">
        <div style="width:40px;height:40px;border-radius:var(--radius-lg);background:var(--bg-secondary);animation:pulse 1.5s ease-in-out infinite;"></div>
      </div>
      <div style="height:28px;border-radius:var(--radius-sm);background:var(--bg-secondary);animation:pulse 1.5s ease-in-out infinite;width:60%;"></div>
      <div style="height:14px;border-radius:var(--radius-sm);background:var(--bg-secondary);animation:pulse 1.5s ease-in-out infinite;width:80%;"></div>
    </div>
  `;
}

/* -- KPI Stat Card -- */
function statCard({ label, value, subLabel, ic, color }) {
  return `
    <div class="stat-card anim-fade-in-up" style="--stat-accent:${color};">
      <div class="stat-card__top">
        <div class="stat-card__icon" style="background:${color}18;color:${color};">${icon(ic, 20)}</div>
      </div>
      <div class="stat-card__body">
        <div class="stat-card__value">${value}</div>
        <div class="stat-card__label">${label}</div>
        ${subLabel ? `<div style="font-size:var(--text-xs);color:var(--text-tertiary);margin-top:2px;">${subLabel}</div>` : ''}
      </div>
    </div>
  `;
}

/* -- OJT Pipeline Funnel -- */
function renderOjtFunnel(funnel) {
  const stages = [
    { key: 'interested', label: 'Interested', color: '#6366F1', ic: 'star' },
    { key: 'endorsed',   label: 'Endorsed',   color: '#F59E0B', ic: 'flag' },
    { key: 'accepted',   label: 'Deployed',   color: '#10B981', ic: 'layers' },
  ];
  const max = Math.max(...stages.map(s => funnel[s.key] || 0), 1);

  return `
    <div style="display:flex;flex-direction:column;gap:10px;padding:4px 0;">
      ${stages.map((s, i) => {
        const val = funnel[s.key] || 0;
        const barPct = Math.round((val / max) * 100);
        return `
          <div>
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;">
              <div style="display:flex;align-items:center;gap:7px;">
                <span style="display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:50%;background:${s.color}18;color:${s.color};">${icon(s.ic, 11)}</span>
                <span style="font-size:var(--text-sm);font-weight:var(--weight-medium);">${s.label}</span>
              </div>
              <span style="font-size:var(--text-sm);font-weight:var(--weight-bold);color:${s.color};">${num(val)}</span>
            </div>
            <div style="height:8px;border-radius:var(--radius-sm);background:var(--bg-secondary);overflow:hidden;">
              <div style="height:100%;width:${barPct}%;background:${s.color};border-radius:var(--radius-sm);transition:width 0.7s ease;"></div>
            </div>
          </div>
          ${i < stages.length - 1 ? '<div style="text-align:center;color:var(--text-tertiary);font-size:0.7rem;margin:-2px 0;">&#x25BC;</div>' : ''}
        `;
      }).join('')}
      ${funnel.completed ? `
        <div style="display:flex;align-items:center;justify-content:space-between;margin-top:4px;padding-top:10px;border-top:1px solid var(--border-default);">
          <span style="font-size:var(--text-xs);color:var(--text-secondary);">Completed OJT</span>
          <span style="font-size:var(--text-sm);font-weight:var(--weight-bold);color:#3B82F6;">${num(funnel.completed)}</span>
        </div>
      ` : ''}
    </div>
  `;
}

/* -- Company Status Breakdown -- */
function renderCompanyBreakdown(bd) {
  const configs = [
    { key: 'Active',    color: '#10B981', label: 'Active' },
    { key: 'Pending',   color: '#F59E0B', label: 'Pending' },
    { key: 'Suspended', color: '#EF4444', label: 'Suspended' },
    { key: 'Inactive',  color: '#94A3B8', label: 'Inactive' },
  ];
  const total = Object.values(bd).reduce((a, b) => a + b, 0) || 1;

  return `
    <div style="display:flex;flex-direction:column;gap:12px;">
      ${configs.map(c => {
        const val = bd[c.key] || 0;
        const p = pct(val, total);
        return `
          <div>
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;">
              <div style="display:flex;align-items:center;gap:7px;">
                <span style="width:9px;height:9px;border-radius:50%;background:${c.color};flex-shrink:0;display:inline-block;"></span>
                <span style="font-size:var(--text-sm);">${c.label}</span>
              </div>
              <div style="display:flex;align-items:center;gap:6px;">
                <span style="font-size:var(--text-xs);color:var(--text-tertiary);">${p}%</span>
                <span style="font-size:var(--text-sm);font-weight:var(--weight-semibold);min-width:24px;text-align:right;">${num(val)}</span>
              </div>
            </div>
            <div style="height:7px;border-radius:var(--radius-sm);background:var(--bg-secondary);overflow:hidden;">
              <div style="height:100%;width:${p}%;background:${c.color};border-radius:var(--radius-sm);transition:width 0.7s ease;"></div>
            </div>
          </div>
        `;
      }).join('')}
      <div style="padding-top:8px;border-top:1px solid var(--border-default);display:flex;justify-content:space-between;align-items:center;">
        <span style="font-size:var(--text-xs);color:var(--text-tertiary);">Total Companies</span>
        <span style="font-size:var(--text-base);font-weight:var(--weight-bold);">${num(total)}</span>
      </div>
    </div>
  `;
}

/* -- Job Statistics -- */
function renderJobStats(jobStats) {
  const bars = [
    { label: 'Open',   value: jobStats.open   || 0, color: '#10B981' },
    { label: 'Draft',  value: jobStats.draft  || 0, color: '#94A3B8' },
    { label: 'Closed', value: jobStats.closed || 0, color: '#EF4444' },
  ];
  const total = bars.reduce((a, b) => a + b.value, 0) || 1;

  return `
    <div style="display:flex;flex-direction:column;gap:14px;">
      ${bars.map(b => {
        const p = pct(b.value, total);
        return `
          <div>
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;">
              <span style="font-size:var(--text-sm);">${b.label} Postings</span>
              <span style="font-size:var(--text-sm);font-weight:var(--weight-semibold);color:${b.color};">${num(b.value)}</span>
            </div>
            <div style="height:10px;border-radius:var(--radius-sm);background:var(--bg-secondary);overflow:hidden;">
              <div style="height:100%;width:${p}%;background:${b.color};border-radius:var(--radius-sm);transition:width 0.7s ease;"></div>
            </div>
          </div>
        `;
      }).join('')}
      <div style="margin-top:4px;padding:10px;background:var(--bg-secondary);border-radius:var(--radius-md);display:flex;align-items:center;justify-content:space-between;">
        <div style="display:flex;align-items:center;gap:7px;color:var(--text-secondary);">${icon('clipboard', 14)} <span style="font-size:var(--text-sm);">Total Applications</span></div>
        <span style="font-size:var(--text-base);font-weight:var(--weight-bold);">${num(jobStats.totalApplications)}</span>
      </div>
    </div>
  `;
}

/* -- Monthly Registrations Bar Chart -- */
function renderMonthlyChart(months) {
  if (!months || !months.length) {
    return `<div style="padding:var(--space-5);text-align:center;color:var(--text-tertiary);font-size:var(--text-sm);">No registration data available</div>`;
  }
  const maxVal = Math.max(...months.map(m => m.count), 1);

  return `
    <div style="display:flex;align-items:flex-end;gap:6px;height:120px;padding-bottom:4px;">
      ${months.map(m => {
        const h = Math.max(4, Math.round((m.count / maxVal) * 100));
        return `
          <div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;height:100%;justify-content:flex-end;">
            <span style="font-size:0.6rem;color:var(--text-tertiary);font-weight:600;">${m.count}</span>
            <div style="width:100%;height:${h}%;background:var(--color-primary);border-radius:var(--radius-sm) var(--radius-sm) 0 0;min-height:4px;opacity:0.8;transition:height 0.6s ease;"></div>
            <span style="font-size:0.6rem;color:var(--text-tertiary);">${m.month}</span>
          </div>
        `;
      }).join('')}
    </div>
    <div style="margin-top:8px;font-size:var(--text-xs);color:var(--text-tertiary);text-align:center;">New registrations (students &amp; companies) &mdash; last 6 months</div>
  `;
}

/* -- Top Companies by Trainees -- */
function renderTopCompanies(companies) {
  if (!companies || !companies.length) {
    return `<div style="padding:var(--space-5);text-align:center;color:var(--text-tertiary);font-size:var(--text-sm);">No OJT placements yet</div>`;
  }
  return companies.map((c, i) => `
    <div style="display:flex;align-items:center;gap:10px;padding:8px 0;${i < companies.length - 1 ? 'border-bottom:1px solid var(--border-default);' : ''}">
      <span style="font-size:var(--text-xs);font-weight:var(--weight-bold);color:var(--text-tertiary);min-width:18px;text-align:right;">${i + 1}</span>
      <div style="flex:1;min-width:0;">
        <div style="font-size:var(--text-sm);font-weight:var(--weight-medium);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${c.name}</div>
      </div>
      <span style="font-size:var(--text-xs);font-weight:var(--weight-semibold);background:#10B98118;color:#10B981;padding:2px 8px;border-radius:9999px;white-space:nowrap;">${c.trainees} trainee${c.trainees !== 1 ? 's' : ''}</span>
    </div>
  `).join('');
}

/* -- Student Program Distribution -- */
function renderProgramDist(dist) {
  const entries = Object.entries(dist || {});
  if (!entries.length) {
    return `<div style="padding:var(--space-5);text-align:center;color:var(--text-tertiary);font-size:var(--text-sm);">No student program data</div>`;
  }
  const maxVal = Math.max(...entries.map(([, v]) => v), 1);
  const colors = ['#6366F1','#10B981','#F59E0B','#3B82F6','#EC4899','#14B8A6','#8B5CF6','#EF4444'];

  return entries.map(([prog, count], i) => `
    <div style="${i > 0 ? 'margin-top:10px;' : ''}">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
        <span style="font-size:var(--text-xs);color:var(--text-secondary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:75%;">${prog}</span>
        <span style="font-size:var(--text-xs);font-weight:var(--weight-semibold);">${count}</span>
      </div>
      <div style="height:7px;border-radius:var(--radius-sm);background:var(--bg-secondary);overflow:hidden;">
        <div style="height:100%;width:${pct(count, maxVal)}%;background:${colors[i % colors.length]};border-radius:var(--radius-sm);transition:width 0.7s ease;"></div>
      </div>
    </div>
  `).join('');
}

/* -- Recent Students -- */
function renderRecentStudents(students) {
  if (!students || !students.length) {
    return `<div style="padding:var(--space-4);text-align:center;color:var(--text-tertiary);font-size:var(--text-sm);">No students registered yet</div>`;
  }
  return students.map(s => {
    const initials = (s.name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    return `
      <div class="activity-item">
        <div style="width:32px;height:32px;border-radius:var(--radius-lg);background:linear-gradient(135deg,#6366F1,#818CF8);color:#fff;display:flex;align-items:center;justify-content:center;font-size:var(--text-xs);font-weight:var(--weight-bold);flex-shrink:0;">${initials}</div>
        <div class="activity-item__content">
          <div class="activity-item__text">${s.name} <span style="color:var(--text-tertiary);">&middot; ${s.program}</span></div>
          <div class="activity-item__time">${s.created_at}</div>
        </div>
      </div>
    `;
  }).join('');
}

/* -- Recent OJT Activity -- */
function renderRecentOjt(activity) {
  if (!activity || !activity.length) {
    return `<div style="padding:var(--space-4);text-align:center;color:var(--text-tertiary);font-size:var(--text-sm);">No recent OJT activity</div>`;
  }
  const statusColors = {
    interested:              '#6366F1',
    company_accepted:        '#3B82F6',
    endorsement_requested:   '#F59E0B',
    endorsed:                '#F59E0B',
    ojt_started:             '#10B981',
  };
  const statusIcons = {
    interested:              'star',
    company_accepted:        'check',
    endorsement_requested:   'clock',
    endorsed:                'flag',
    ojt_started:             'layers',
  };
  const statusLabels = {
    interested:              'Interested',
    company_accepted:        'Company Accepted',
    endorsement_requested:   'Endorsement Requested',
    endorsed:                'Endorsed',
    ojt_started:             'Deployed',
  };

  return activity.map(a => {
    const color = statusColors[a.status] || '#94A3B8';
    const ic    = statusIcons[a.status]  || 'user';
    const label = statusLabels[a.status] || a.status;
    return `
      <div class="activity-item">
        <div class="activity-item__icon" style="background:${color}18;color:${color};">${icon(ic, 13)}</div>
        <div class="activity-item__content">
          <div class="activity-item__text"><strong>${a.student}</strong> &rarr; ${a.company}</div>
          <div style="font-size:0.625rem;color:var(--text-tertiary);margin-top:1px;display:flex;gap:6px;align-items:center;">
            <span style="background:${color}18;color:${color};padding:1px 6px;border-radius:9999px;font-weight:600;">${label}</span>
            <span>${a.updated_at}</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

/* -- Card wrapper helper -- */
function card(title, badgeHtml, bodyHtml, ic) {
  return `
    <div class="card anim-fade-in-up">
      <div class="card__header">
        <h3 class="card__title">${ic ? icon(ic, 15) + ' ' : ''}${title}</h3>
        ${badgeHtml || ''}
      </div>
      <div class="card__body">${bodyHtml}</div>
    </div>
  `;
}

function renderDashboardData(container, data) {
  if (!container || !data) return;

  const {
    kpi = {},
    ojtFunnel = {},
    companyBreakdown = {},
    jobStats = {},
    programDist = {},
    topCompanies = [],
    recentStudents = [],
    recentOjt = [],
    monthlyRegistrations = [],
  } = data;

  /* KPI Cards */
  const kpiCards = [
    {
      label: 'Total Students',
      value: num(kpi.totalStudents),
      subLabel: `${kpi.totalSupervisors ?? 0} supervisors registered`,
      ic: 'users', color: '#6366F1',
    },
    {
      label: 'Partner Companies',
      value: num(kpi.totalCompanies),
      subLabel: `${kpi.activeCompanies ?? 0} active &middot; ${kpi.pendingCompanies ?? 0} pending`,
      ic: 'briefcase', color: '#10B981',
    },
    {
      label: 'Active Job Postings',
      value: num(kpi.activeJobs),
      subLabel: `${kpi.totalJobs ?? 0} total postings`,
      ic: 'target', color: '#8B5CF6',
    },
    {
      label: 'OJT Deployed',
      value: num(kpi.ojtDeployed),
      subLabel: `${kpi.ojtEndorsed ?? 0} pending deployment`,
      ic: 'layers', color: '#F59E0B',
    },
    {
      label: 'Job Applications',
      value: num(kpi.totalApplications),
      subLabel: `${kpi.pendingApplications ?? 0} pending review`,
      ic: 'clipboard', color: '#EC4899',
    },
    {
      label: 'Alumni / Graduates',
      value: num(kpi.totalGraduates),
      subLabel: 'Registered graduates',
      ic: 'award', color: '#14B8A6',
    },
  ];

  const kpiEl = container.querySelector('#dash-kpi');
  if (kpiEl) kpiEl.innerHTML = kpiCards.map(c => statCard(c)).join('');

  /* Row 1: OJT Funnel + Company Status */
  const funnelTotal = (ojtFunnel.interested || 0) + (ojtFunnel.endorsed || 0) + (ojtFunnel.accepted || 0);
  const companyTotal = Object.values(companyBreakdown).reduce((a, b) => a + b, 0);
  const row1 = container.querySelector('#dash-row1');
  if (row1) {
    row1.innerHTML =
      card('OJT Pipeline', `<span class="badge badge--info">${num(funnelTotal)} students</span>`, renderOjtFunnel(ojtFunnel), 'filter') +
      card('Company Status', `<span class="badge badge--neutral">${num(companyTotal)} total</span>`, renderCompanyBreakdown(companyBreakdown), 'briefcase');
  }

  /* Row 2: Job Stats + Monthly Registrations */
  const row2 = container.querySelector('#dash-row2');
  if (row2) {
    row2.innerHTML =
      card('Job Postings', null, renderJobStats(jobStats), 'target') +
      card('Monthly Registrations', `<span class="badge badge--success">Last 6 months</span>`, renderMonthlyChart(monthlyRegistrations), 'activity');
  }

  /* Row 3: Recent Students + Recent OJT Activity */
  const row3 = container.querySelector('#dash-row3');
  if (row3) {
    row3.innerHTML =
      card('Recent Students', `<span class="badge badge--info">Last 6</span>`, renderRecentStudents(recentStudents), 'users') +
      card('Recent OJT Activity', `<span class="badge badge--success">Latest</span>`, renderRecentOjt(recentOjt), 'layers');
  }

  /* Row 4: Top Companies + Program Distribution */
  const row4 = container.querySelector('#dash-row4');
  if (row4) {
    row4.innerHTML =
      card('Top Companies by Trainees', null, renderTopCompanies(topCompanies), 'briefcase') +
      card('Students by Program', null, renderProgramDist(programDist), 'users');
  }

  renderIcons(container);
}

/* ──────────────── PAGE ENTRY POINT ──────────────── */
export default async function DashboardPage(container) {
  const today = new Date().toLocaleDateString('en-PH', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const cached = getCached('/admin/dashboard');

  container.innerHTML = `
    <div class="page-header" style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:var(--space-3);">
      <div>
        <h1 class="page-header__title">Admin Dashboard</h1>
        <p class="page-header__subtitle">${today}</p>
      </div>
      <button id="dash-refresh" class="btn btn--secondary btn--sm" style="display:flex;align-items:center;gap:5px;">${icon('activity', 14)} <span>Refresh</span></button>
    </div>

    <div class="stats-grid stats-grid--6 anim-stagger" id="dash-kpi">
      ${cached?.data ? '' : Array(6).fill(0).map(() => skeleton()).join('')}
    </div>

    <div class="dash-panels" id="dash-row1"></div>
    <div class="dash-panels" id="dash-row2"></div>
    <div class="dash-panels" id="dash-row3"></div>
    <div class="dash-panels" id="dash-row4"></div>
  `;

  renderIcons(container);

  // If we have cached data, render immediately on this frame!
  if (cached?.data) {
    renderDashboardData(container, cached.data);
  }

  const refreshBtn = container.querySelector('#dash-refresh');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', async () => {
      refreshBtn.disabled = true;
      const span = refreshBtn.querySelector('span');
      if (span) span.textContent = 'Refreshing…';
      try {
        const fresh = await apiGetCached('/admin/dashboard', { force: true });
        if (fresh) renderDashboardData(container, fresh);
      } finally {
        refreshBtn.disabled = false;
        if (span) span.textContent = 'Refresh';
      }
    });
  }

  try {
    const data = await apiGetCached('/admin/dashboard', {
      onUpdate: (fresh) => {
        renderDashboardData(container, fresh);
      },
    });

    if (data && !cached) {
      renderDashboardData(container, data);
    }
  } catch (e) {
    if (!cached) {
      container.querySelector('#dash-kpi').innerHTML = `
        <div style="grid-column:1/-1;padding:var(--space-8);text-align:center;color:var(--text-tertiary);">
          <p style="margin-top:var(--space-3);">Failed to load dashboard data. Check your connection and try again.</p>
          <button class="btn btn--primary btn--sm" style="margin-top:var(--space-3);" onclick="window.location.reload()">Retry</button>
        </div>`;
    }
  }
}