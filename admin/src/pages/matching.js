/* ── Skills & OJT Matching Page — Admin Portal (Dual-Mode Weighted Suitability) ── */
import { apiGet, apiGetCached, getCached } from '../api/client.js';
import { icon, renderIcons } from '../components/icons.js';
import { escapeHtml } from '../components/data-table.js';

/* ----------------------------------------------------------------
   Factor Definitions
---------------------------------------------------------------- */
const JOB_FACTORS = [
  { key: 'skill_match',    label: 'Skills Match',    weight: '40%', pct: 40, color: '#6366F1' },
  { key: 'experience',     label: 'Experience',      weight: '25%', pct: 25, color: '#0EA5E9' },
  { key: 'proficiency',    label: 'Proficiency',     weight: '20%', pct: 20, color: '#8B5CF6' },
  { key: 'certifications', label: 'Certifications',  weight: '10%', pct: 10, color: '#F59E0B' },
  { key: 'projects',       label: 'Projects',        weight: '5%',  pct: 5,  color: '#10B981' },
];

const OJT_FACTORS = [
  { key: 'skill_match',      label: 'Skills Match',      weight: '35%', pct: 35, color: '#6366F1' },
  { key: 'course_alignment', label: 'Program Alignment', weight: '30%', pct: 30, color: '#005930' },
  { key: 'proficiency',      label: 'Proficiency',       weight: '15%', pct: 15, color: '#8B5CF6' },
  { key: 'projects',         label: 'Projects',          weight: '15%', pct: 15, color: '#10B981' },
  { key: 'certifications',   label: 'Certifications',    weight: '5%',  pct: 5,  color: '#F59E0B' },
];

/* ----------------------------------------------------------------
   Helpers
---------------------------------------------------------------- */
function scoreColor(score) {
  if (score > 70) return '#10B981';
  if (score >= 40) return '#F59E0B';
  return '#EF4444';
}

function scoreBadge(score) {
  if (score > 70) return '<span class="badge badge--success" style="font-weight:600;padding:3px 8px;">Strong</span>';
  if (score >= 40) return '<span class="badge badge--warning" style="font-weight:600;padding:3px 8px;">Moderate</span>';
  return '<span class="badge badge--danger" style="font-weight:600;padding:3px 8px;">Weak</span>';
}

function alignmentBadge(alignment) {
  if (alignment === 'Direct Match') {
    return `<span class="badge badge--success" style="font-size:0.72rem;padding:3px 8px;font-weight:600;">Direct Match</span>`;
  }
  if (alignment === 'Related Discipline') {
    return `<span class="badge badge--info" style="font-size:0.72rem;padding:3px 8px;background:rgba(59,130,246,0.12);color:#2563EB;border:1px solid rgba(59,130,246,0.25);font-weight:600;">Related Field</span>`;
  }
  if (alignment === 'All Programs Welcome') {
    return `<span class="badge" style="font-size:0.72rem;padding:3px 8px;background:rgba(16,185,129,0.08);color:#059669;border:1px solid rgba(16,185,129,0.2);font-weight:600;">Open Eligibility</span>`;
  }
  return `<span class="badge badge--warning" style="font-size:0.72rem;padding:3px 8px;font-weight:600;">Different Field</span>`;
}

function initials(name) {
  return (name || '?').split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

/* ----------------------------------------------------------------
   Universal Pagination Builder (5 per page standard)
---------------------------------------------------------------- */
function buildPaginationHtml({ currentPage, totalPages, totalItems, perPage, itemName = 'candidates' }) {
  if (totalPages <= 1) {
    if (totalItems > 0) {
      return `
        <div style="display:flex;justify-content:space-between;align-items:center;width:100%;font-size:var(--text-xs);color:var(--text-tertiary);padding:4px 0;">
          <span>Showing all <strong>${totalItems}</strong> ${itemName}</span>
        </div>
      `;
    }
    return '';
  }

  const start = (currentPage - 1) * perPage + 1;
  const end = Math.min(currentPage * perPage, totalItems);

  const pages = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push('…');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push('…');
    pages.push(totalPages);
  }

  const pageButtons = pages.map(p => p === '…'
    ? `<span style="padding:0 4px;align-self:center;color:var(--text-tertiary);font-size:var(--text-xs);">…</span>`
    : `<button type="button" class="an-pg-btn ${p === currentPage ? 'an-pg-btn--active' : ''}" data-p="${p}">${p}</button>`
  ).join('');

  return `
    <div style="display:flex;align-items:center;justify-content:space-between;width:100%;flex-wrap:wrap;gap:12px;font-size:var(--text-xs);color:var(--text-secondary);">
      <div>Showing <strong>${start}–${end}</strong> of <strong>${totalItems}</strong> ${itemName} (5 per page)</div>
      <div style="display:flex;align-items:center;gap:4px;">
        <button type="button" class="an-pg-btn an-pg-btn--nav" data-p="${currentPage - 1}" ${currentPage <= 1 ? 'disabled' : ''} title="Previous Page">
          ${icon('chevron-left', 14)}
        </button>
        ${pageButtons}
        <button type="button" class="an-pg-btn an-pg-btn--nav" data-p="${currentPage + 1}" ${currentPage >= totalPages ? 'disabled' : ''} title="Next Page">
          ${icon('chevron-right', 14)}
        </button>
      </div>
    </div>
  `;
}

/* ----------------------------------------------------------------
   Breakdown mini-bar (5 factors)
---------------------------------------------------------------- */
function renderBreakdownBar(breakdown, factors = JOB_FACTORS) {
  if (!breakdown) return '<span style="font-size:var(--text-xs);color:var(--text-tertiary);">—</span>';

  const bars = factors.map(f => {
    const val = breakdown[f.key] ?? 0;
    return `
      <div title="${f.label} (${f.weight}): ${val}%"
           style="flex:1;height:8px;background:var(--bg-secondary, #e2e8f0);border-radius:2px;overflow:hidden;cursor:default;">
        <div style="width:${val}%;height:100%;background:${f.color};border-radius:2px;transition:width 0.5s ease;"></div>
      </div>`;
  }).join('');

  const dots = factors.map(f => {
    const val = breakdown[f.key] ?? 0;
    return `<span style="font-size:9px;color:var(--text-secondary);font-weight:600;" title="${f.label}: ${val}%">${val}</span>`;
  }).join('<span style="color:var(--text-tertiary);font-size:8px;padding:0 1px;">·</span>');

  return `
    <div style="display:flex;flex-direction:column;gap:3px;min-width:130px;">
      <div style="display:flex;gap:3px;align-items:center;">${bars}</div>
      <div style="display:flex;gap:2px;align-items:center;justify-content:space-between;">${dots}</div>
    </div>`;
}

/* ----------------------------------------------------------------
   Card Component: Formula & Scoring Methodology
---------------------------------------------------------------- */
function renderFormulaCard(factors, title, desc) {
  const rows = factors.map(f => `
    <div class="matching-formula-item">
      <div class="matching-formula-row">
        <span class="matching-formula-label">
          <span class="matching-formula-dot" style="background:${f.color};"></span>
          ${escapeHtml(f.label)}
        </span>
        <span class="matching-formula-weight">${f.weight}</span>
      </div>
      <div class="matching-formula-track">
        <div class="matching-formula-fill" style="width:${f.pct}%;background:${f.color};"></div>
      </div>
    </div>
  `).join('');

  return `
    <div class="ojt-chart-card anim-fade-in-up">
      <div class="ojt-chart-card__header">
        <div class="ojt-chart-card__title-group">
          <div class="ojt-chart-card__icon">${icon('sliders', 16)}</div>
          <div>
            <h3 class="ojt-chart-card__title">${escapeHtml(title)}</h3>
            <p class="ojt-chart-card__subtitle">Weighted scoring criteria (100% total)</p>
          </div>
        </div>
        <span class="ojt-chart-card__badge">${factors.length} Factors</span>
      </div>
      <div class="ojt-chart-card__body">
        <p style="font-size:var(--text-xs);color:var(--text-secondary);margin:0 0 12px;line-height:1.4;">
          ${escapeHtml(desc)}
        </p>
        <div class="matching-formula-list">${rows}</div>
        <div class="matching-thresholds">
          <span class="matching-threshold-pill matching-threshold-pill--strong">
            ${icon('check-circle', 11)} <strong>Strong</strong> &gt; 70
          </span>
          <span class="matching-threshold-pill matching-threshold-pill--mod">
            ${icon('alert-circle', 11)} <strong>Moderate</strong> 40–70
          </span>
          <span class="matching-threshold-pill matching-threshold-pill--weak">
            ${icon('x-circle', 11)} <strong>Weak</strong> &lt; 40
          </span>
        </div>
      </div>
    </div>
  `;
}

/* ----------------------------------------------------------------
   Card Component: Donut Chart
---------------------------------------------------------------- */
function renderDonutCard(stats = {}, title = 'Overall Alignment') {
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const segments = [
    { pct: stats.matchRate    ?? 0, color: '#10B981', label: 'Strong Match' },
    { pct: stats.partialMatch ?? 0, color: '#F59E0B', label: 'Moderate Match' },
    { pct: stats.mismatch     ?? 0, color: '#EF4444', label: 'Low Match' },
  ];

  let offset = 0;
  const totalPct = segments.reduce((a, b) => a + b.pct, 0) || 100;
  const paths = segments.filter(s => s.pct > 0).map(seg => {
    const dash = (seg.pct / totalPct) * circumference;
    const gap  = circumference - dash;
    const segSvg = `<circle cx="65" cy="65" r="${radius}" fill="none" stroke="${seg.color}" stroke-width="12" stroke-dasharray="${dash.toFixed(2)} ${gap.toFixed(2)}" stroke-dashoffset="-${offset.toFixed(2)}" stroke-linecap="round" style="transition:stroke-dasharray 0.6s ease;"/>`;
    offset += dash;
    return segSvg;
  }).join('');

  return `
    <div class="ojt-chart-card anim-fade-in-up">
      <div class="ojt-chart-card__header">
        <div class="ojt-chart-card__title-group">
          <div class="ojt-chart-card__icon">${icon('pie-chart', 16)}</div>
          <div>
            <h3 class="ojt-chart-card__title">${escapeHtml(title)}</h3>
            <p class="ojt-chart-card__subtitle">Candidate suitability distribution</p>
          </div>
        </div>
        <span class="ojt-chart-card__badge">Live Ratio</span>
      </div>
      <div class="ojt-chart-card__body">
        <div class="ojt-status-layout" style="gap:20px;">
          <div class="ojt-donut-container">
            <svg viewBox="0 0 130 130" width="130" height="130" style="transform:rotate(-90deg);">
              <circle cx="65" cy="65" r="${radius}" fill="none" stroke="#E2E8F0" stroke-width="12" opacity=".4"/>
              ${paths || `<circle cx="65" cy="65" r="${radius}" fill="none" stroke="#E2E8F0" stroke-width="12" />`}
            </svg>
            <div class="ojt-donut-center">
              <span class="ojt-donut-number" style="font-size:1.6rem;">${stats.matchRate ?? 0}%</span>
              <span class="ojt-donut-label">STRONG</span>
            </div>
          </div>
          <div class="ojt-status-list">
            ${segments.map(seg => `
              <div class="ojt-status-row">
                <div class="ojt-status-row__meta">
                  <span class="ojt-status-row__name">
                    <span class="ojt-status-row__dot" style="background:${seg.color};"></span>
                    ${escapeHtml(seg.label)}
                  </span>
                  <div class="ojt-status-row__counts">
                    <span class="ojt-status-row__pct" style="font-size:0.75rem;font-weight:700;">${seg.pct}%</span>
                  </div>
                </div>
                <div class="ojt-status-row__track">
                  <div class="ojt-status-row__fill" style="width:${seg.pct}%;background:${seg.color};"></div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

/* ----------------------------------------------------------------
   Card Component: Top Skills in Demand
---------------------------------------------------------------- */
function renderTopSkillsCard(topSkills, title = 'Top Skills in Demand', emptyMsg = 'No skill requirements found.') {
  if (!topSkills.length) {
    return `
      <div class="ojt-chart-card anim-fade-in-up">
        <div class="ojt-chart-card__header">
          <div class="ojt-chart-card__title-group">
            <div class="ojt-chart-card__icon">${icon('layers', 16)}</div>
            <div>
              <h3 class="ojt-chart-card__title">${escapeHtml(title)}</h3>
              <p class="ojt-chart-card__subtitle">Market frequency ranking</p>
            </div>
          </div>
        </div>
        <div class="ojt-chart-card__body"><p style="color:var(--text-tertiary);font-size:var(--text-sm);margin:0;">${emptyMsg}</p></div>
      </div>
    `;
  }

  const maxCount = topSkills[0].count || 1;
  const list = topSkills.slice(0, 6).map(({ skill, count }, i) => {
    const pct = Math.round((count / maxCount) * 100);
    const rankStr = `0${i + 1}`;
    return `
      <div class="matching-skill-row">
        <span class="matching-skill-rank">${rankStr}</span>
        <span class="matching-skill-name" title="${escapeHtml(skill)}">${escapeHtml(skill)}</span>
        <div class="matching-skill-track">
          <div class="matching-skill-fill" style="width:${pct}%;"></div>
        </div>
        <span class="matching-skill-count">${count}</span>
      </div>
    `;
  }).join('');

  return `
    <div class="ojt-chart-card anim-fade-in-up">
      <div class="ojt-chart-card__header">
        <div class="ojt-chart-card__title-group">
          <div class="ojt-chart-card__icon">${icon('layers', 16)}</div>
          <div>
            <h3 class="ojt-chart-card__title">${escapeHtml(title)}</h3>
            <p class="ojt-chart-card__subtitle">Required by active employer postings</p>
          </div>
        </div>
        <span class="ojt-chart-card__badge">${topSkills.length} Tracked</span>
      </div>
      <div class="ojt-chart-card__body">
        <div class="matching-skills-list">${list}</div>
      </div>
    </div>
  `;
}

/* ----------------------------------------------------------------
   Card Component: Candidate Skill Coverage Diagnostics
---------------------------------------------------------------- */
function renderGapSkillsCard(gapSkills, title = 'Candidate Coverage of In-Demand Job Skills', sub = '% of candidates who possess each in-demand employment skill') {
  if (!gapSkills.length) return '';

  const rows = gapSkills.map(({ skill, demand, have, coverage }) => {
    let tagClass = 'matching-gap-pct--high';
    if (coverage < 30) tagClass = 'matching-gap-pct--low';
    else if (coverage < 60) tagClass = 'matching-gap-pct--mid';

    return `
      <div class="matching-gap-item">
        <div class="matching-gap-meta">
          <span class="matching-gap-skill" title="${escapeHtml(skill)}">${escapeHtml(skill)}</span>
          <div class="matching-gap-stats">
            <span class="matching-gap-demand">${demand} postings</span>
            <span class="matching-gap-pct ${tagClass}">${coverage}% coverage</span>
          </div>
        </div>
        <div class="matching-gap-track">
          <div class="matching-gap-fill" style="width:${coverage}%;"></div>
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="ojt-chart-card anim-fade-in-up" style="margin-top:var(--space-4, 16px);">
      <div class="ojt-chart-card__header">
        <div class="ojt-chart-card__title-group">
          <div class="ojt-chart-card__icon" style="background:rgba(245,158,11,0.08);color:#d97706;">
            ${icon('activity', 16)}
          </div>
          <div>
            <h3 class="ojt-chart-card__title">${escapeHtml(title)}</h3>
            <p class="ojt-chart-card__subtitle">${escapeHtml(sub)}</p>
          </div>
        </div>
        <span class="ojt-chart-card__badge">Skill Gap Telemetry</span>
      </div>
      <div class="ojt-chart-card__body">
        <div class="matching-gap-grid">${rows}</div>
      </div>
    </div>
  `;
}

/* ----------------------------------------------------------------
   State for Pagination & Filtering
---------------------------------------------------------------- */
let _activeTab = 'jobs'; // 'jobs' | 'ojt'
let _cachedData = null;
let _jobPage = 1;
let _ojtPage = 1;
let _jobSearch = '';
let _ojtSearch = '';
let _jobFilter = 'all'; // 'all' | 'strong' | 'moderate' | 'weak'
let _ojtFilter = 'all'; // 'all' | 'strong' | 'moderate' | 'weak'
const PAGE_SIZE = 5;

/* ----------------------------------------------------------------
   CAREER / JOB MATCHING VIEW (FULL-WIDTH 5 PER PAGINATION TABLE)
---------------------------------------------------------------- */
function renderJobView(jobData) {
  const stats     = jobData.stats     ?? { matchRate: 0, partialMatch: 0, mismatch: 0 };
  const topSkills = Array.isArray(jobData.topSkills) ? jobData.topSkills : [];
  const gapSkills = Array.isArray(jobData.gapSkills) ? jobData.gapSkills : [];
  const matches   = Array.isArray(jobData.matches)   ? jobData.matches   : [];
  const meta      = jobData.meta ?? null;

  // 1. KPI Top Summary Cards
  const statItems = [
    {
      label: 'Strong Job Match',
      value: (stats.matchRate ?? 0) + '%',
      ic: 'check-circle',
      color: '#10B981',
      bg: 'rgba(16,185,129,0.08)',
      footnote: 'Suitability Score &gt; 70%',
      dotColor: '#10B981'
    },
    {
      label: 'Moderate Match',
      value: (stats.partialMatch ?? 0) + '%',
      ic: 'alert-circle',
      color: '#F59E0B',
      bg: 'rgba(245,158,11,0.08)',
      footnote: 'Suitability Score 40–70%',
      dotColor: '#F59E0B'
    },
    {
      label: 'Low Match Ratio',
      value: (stats.mismatch ?? 0) + '%',
      ic: 'x-circle',
      color: '#EF4444',
      bg: 'rgba(239,68,68,0.08)',
      footnote: 'Suitability Score &lt; 40%',
      dotColor: '#EF4444'
    },
    {
      label: 'Evaluated Pool',
      value: (meta?.totalUsers ?? matches.length).toLocaleString(),
      ic: 'users',
      color: '#005930',
      bg: 'rgba(0,89,48,0.08)',
      footnote: `${meta?.totalJobs ?? 0} active job listings`,
      dotColor: '#005930'
    },
  ];

  const statsHtml = `
    <div class="ojt-kpi-grid">
      ${statItems.map(s => `
        <div class="ojt-kpi-card anim-fade-in-up">
          <div class="ojt-kpi-card__top">
            <span class="ojt-kpi-card__label">${escapeHtml(s.label)}</span>
            <div class="ojt-kpi-card__icon" style="background:${s.bg};color:${s.color};">
              ${icon(s.ic, 18)}
            </div>
          </div>
          <div class="ojt-kpi-card__value">${s.value}</div>
          <div class="ojt-kpi-card__footnote">
            <span class="ojt-kpi-card__footnote-dot" style="background:${s.dotColor};"></span>
            <span>${s.footnote}</span>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  // 2. Middle Row: Alignment Donut + Job Suitability Formula + Top In-Demand Skills
  const middleRowHtml = `
    <div class="matching-analytics-grid">
      ${renderDonutCard(stats, 'Career Job Alignment')}
      ${renderFormulaCard(
        JOB_FACTORS,
        'Job Suitability Formula',
        'Candidate–job compatibility scored 0–100 combining 5 weighted career pillars:'
      )}
      ${renderTopSkillsCard(topSkills, 'Top Skills in Job Postings', 'No active job postings with skill requirements found.')}
    </div>
  `;

  // 3. Diagnostics: Candidate Coverage
  const gapHtml = renderGapSkillsCard(
    gapSkills,
    'Candidate Coverage of In-Demand Job Skills',
    '% of evaluated candidates possessing skills required by active employer postings'
  );

  // 4. Filtering & Pagination (5 per page)
  let filtered = matches;
  if (_jobFilter === 'strong') filtered = filtered.filter(m => m.score > 70);
  else if (_jobFilter === 'moderate') filtered = filtered.filter(m => m.score >= 40 && m.score <= 70);
  else if (_jobFilter === 'weak') filtered = filtered.filter(m => m.score < 40);

  if (_jobSearch.trim()) {
    const q = _jobSearch.toLowerCase().trim();
    filtered = filtered.filter(m =>
      (m.student_name && m.student_name.toLowerCase().includes(q)) ||
      (m.student_program && m.student_program.toLowerCase().includes(q)) ||
      (m.job_title && m.job_title.toLowerCase().includes(q)) ||
      (m.company && m.company.toLowerCase().includes(q))
    );
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  if (_jobPage > totalPages) _jobPage = totalPages;
  const pagedMatches = filtered.slice((_jobPage - 1) * PAGE_SIZE, _jobPage * PAGE_SIZE);

  const rowsHtml = pagedMatches.length
    ? pagedMatches.map(m => {
        const bd = m.breakdown ?? null;
        const inits = initials(m.student_name);
        return `
        <tr>
          <td>
            <div style="display:flex;align-items:center;gap:10px;">
              <div class="entity-card__avatar" style="width:34px;height:34px;font-size:0.75rem;background:rgba(0,89,48,0.08);color:#005930;border:1px solid rgba(0,89,48,0.15);font-weight:700;">
                ${inits}
              </div>
              <div>
                <div style="font-size:var(--text-sm);font-weight:600;color:var(--text-primary);">${escapeHtml(m.student_name)}</div>
                <div style="font-size:var(--text-xs);color:var(--text-secondary);">${escapeHtml(m.student_program || 'Student')}</div>
              </div>
            </div>
          </td>
          <td>
            <div style="font-size:var(--text-sm);font-weight:600;color:var(--text-primary);">${escapeHtml(m.job_title)}</div>
          </td>
          <td>
            <div style="display:flex;align-items:center;gap:6px;font-size:var(--text-sm);color:var(--text-secondary);">
              <span style="color:#64748b;display:inline-flex;">${icon('building', 13)}</span>
              <span>${escapeHtml(m.company)}</span>
            </div>
          </td>
          <td>
            <div style="display:flex;align-items:center;gap:8px;">
              <div style="width:64px;height:6px;background:var(--bg-secondary, #e2e8f0);border-radius:999px;overflow:hidden;">
                <div style="width:${m.score}%;height:100%;background:${scoreColor(m.score)};border-radius:999px;"></div>
              </div>
              <span style="font-size:var(--text-sm);font-weight:700;color:${scoreColor(m.score)};font-variant-numeric:tabular-nums;">${m.score}%</span>
            </div>
          </td>
          <td>${renderBreakdownBar(bd, JOB_FACTORS)}</td>
          <td>
            <span class="badge" style="font-size:0.72rem;padding:2px 8px;background:#f1f5f9;border:1px solid #e2e8f0;font-weight:600;color:var(--text-secondary);">
              ${m.matched_count}/${m.total_required} skills
            </span>
          </td>
          <td>${scoreBadge(m.score)}</td>
        </tr>`;
      }).join('')
    : `<tr><td colspan="7" style="text-align:center;color:var(--text-tertiary);padding:var(--space-10);">No candidate match records found matching current criteria.</td></tr>`;

  const paginationFooterHtml = buildPaginationHtml({
    currentPage: _jobPage,
    totalPages,
    totalItems: filtered.length,
    perPage: PAGE_SIZE,
    itemName: 'candidates'
  });

  return `
    ${statsHtml}
    ${middleRowHtml}
    ${gapHtml}

    <!-- Best Career Matches per Candidate (Full-Width, 5 per pagination) -->
    <div class="ojt-table-card anim-fade-in-up" style="margin-top:var(--space-5, 20px);" id="job-matches-table-card">
      <div class="ojt-table-card__header">
        <div class="ojt-table-card__title-group">
          <div class="ojt-table-card__icon">
            ${icon('zap', 18)}
          </div>
          <div>
            <h3 class="ojt-table-card__title">Best Career Matches per Candidate</h3>
            <p class="ojt-table-card__subtitle">Top algorithmic employment match for each candidate (5 per page)</p>
          </div>
        </div>
        <div class="ojt-table-card__actions">
          <div class="matching-filter-bar">
            <div class="matching-search-input">
              ${icon('search', 14)}
              <input type="text" id="job-search-input" placeholder="Search candidate, job, or company..." value="${escapeHtml(_jobSearch)}" />
            </div>
            <select class="matching-select" id="job-filter-select">
              <option value="all" ${_jobFilter === 'all' ? 'selected' : ''}>All Matches</option>
              <option value="strong" ${_jobFilter === 'strong' ? 'selected' : ''}>Strong (&gt; 70%)</option>
              <option value="moderate" ${_jobFilter === 'moderate' ? 'selected' : ''}>Moderate (40–70%)</option>
              <option value="weak" ${_jobFilter === 'weak' ? 'selected' : ''}>Weak (&lt; 40%)</option>
            </select>
            <span class="ojt-count-pill">
              <span class="ojt-count-pill__dot"></span>
              <span>${filtered.length} Matches</span>
            </span>
            <button class="btn btn--primary btn--sm" id="btn-run-job-matching" style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border-radius:20px;">
              <span class="ojt-refresh-icon" style="display:inline-flex;">${icon('refresh-cw', 13)}</span> Run Matching
            </button>
          </div>
        </div>
      </div>
      <div class="ojt-table-responsive">
        <table class="ojt-table">
          <thead>
            <tr>
              <th style="min-width:210px;">Candidate Profile</th>
              <th style="min-width:180px;">Target Opportunity</th>
              <th style="min-width:160px;">Company</th>
              <th style="min-width:140px;">Suitability Score</th>
              <th style="min-width:150px;">Weighted Factors</th>
              <th style="min-width:120px;">Skill Overlap</th>
              <th style="min-width:100px;">Match Status</th>
            </tr>
          </thead>
          <tbody id="job-matches-tbody">${rowsHtml}</tbody>
        </table>
      </div>
      <div class="ojt-table-card__footer" id="job-matches-pagination">
        ${paginationFooterHtml}
      </div>
    </div>
  `;
}

/* ----------------------------------------------------------------
   OJT INTERNSHIP MATCHING VIEW (FULL-WIDTH 5 PER PAGINATION TABLE)
---------------------------------------------------------------- */
function renderOjtView(ojtData) {
  const stats     = ojtData.stats     ?? { matchRate: 0, partialMatch: 0, mismatch: 0 };
  const topSkills = Array.isArray(ojtData.topSkills) ? ojtData.topSkills : [];
  const gapSkills = Array.isArray(ojtData.gapSkills) ? ojtData.gapSkills : [];
  const matches   = Array.isArray(ojtData.matches)   ? ojtData.matches   : [];
  const meta      = ojtData.meta ?? null;

  // 1. KPI Summary Cards
  const statItems = [
    {
      label: 'Strong OJT Match',
      value: (stats.matchRate ?? 0) + '%',
      ic: 'check-circle',
      color: '#10B981',
      bg: 'rgba(16,185,129,0.08)',
      footnote: 'Immediate Deployment (&gt; 70%)',
      dotColor: '#10B981'
    },
    {
      label: 'Moderate Match',
      value: (stats.partialMatch ?? 0) + '%',
      ic: 'alert-circle',
      color: '#F59E0B',
      bg: 'rgba(245,158,11,0.08)',
      footnote: 'Partial Skill Overlap (40–70%)',
      dotColor: '#F59E0B'
    },
    {
      label: 'Available OJT Slots',
      value: (meta?.totalSlotsRemaining ?? '0').toLocaleString(),
      ic: 'building-2',
      color: '#0284C7',
      bg: 'rgba(2,132,199,0.08)',
      footnote: `Across ${meta?.totalPostings ?? 0} active postings`,
      dotColor: '#0284C7'
    },
    {
      label: 'Enrolled Intern Pool',
      value: (meta?.totalStudents ?? matches.length).toLocaleString(),
      ic: 'users',
      color: '#005930',
      bg: 'rgba(0,89,48,0.08)',
      footnote: 'Enrolled trainees in pool',
      dotColor: '#005930'
    },
  ];

  const statsHtml = `
    <div class="ojt-kpi-grid">
      ${statItems.map(s => `
        <div class="ojt-kpi-card anim-fade-in-up">
          <div class="ojt-kpi-card__top">
            <span class="ojt-kpi-card__label">${escapeHtml(s.label)}</span>
            <div class="ojt-kpi-card__icon" style="background:${s.bg};color:${s.color};">
              ${icon(s.ic, 18)}
            </div>
          </div>
          <div class="ojt-kpi-card__value">${s.value}</div>
          <div class="ojt-kpi-card__footnote">
            <span class="ojt-kpi-card__footnote-dot" style="background:${s.dotColor};"></span>
            <span>${s.footnote}</span>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  // 2. Middle Row: Alignment Donut + OJT Suitability Formula + Top Skills in OJT Slot Postings
  const middleRowHtml = `
    <div class="matching-analytics-grid">
      ${renderDonutCard(stats, 'OJT Internship Readiness')}
      ${renderFormulaCard(
        OJT_FACTORS,
        'OJT Suitability Formula',
        'Student–internship suitability combines discipline alignment & technical competencies:'
      )}
      ${renderTopSkillsCard(topSkills, 'Top Skills in OJT Slot Postings', 'No active OJT slot postings with skill requirements found.')}
    </div>
  `;

  // 3. Diagnostics: Student Coverage
  const gapHtml = renderGapSkillsCard(
    gapSkills,
    'Student Coverage of Demanded OJT Skills',
    '% of enrolled students possessing skills required by accredited OJT partner companies'
  );

  // 4. Filtering & Pagination (5 per page)
  let filtered = matches;
  if (_ojtFilter === 'strong') filtered = filtered.filter(m => m.score > 70);
  else if (_ojtFilter === 'moderate') filtered = filtered.filter(m => m.score >= 40 && m.score <= 70);
  else if (_ojtFilter === 'weak') filtered = filtered.filter(m => m.score < 40);

  if (_ojtSearch.trim()) {
    const q = _ojtSearch.toLowerCase().trim();
    filtered = filtered.filter(m =>
      (m.student_name && m.student_name.toLowerCase().includes(q)) ||
      (m.student_program && m.student_program.toLowerCase().includes(q)) ||
      (m.posting_title && m.posting_title.toLowerCase().includes(q)) ||
      (m.department && m.department.toLowerCase().includes(q)) ||
      (m.company && m.company.toLowerCase().includes(q))
    );
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  if (_ojtPage > totalPages) _ojtPage = totalPages;
  const pagedMatches = filtered.slice((_ojtPage - 1) * PAGE_SIZE, _ojtPage * PAGE_SIZE);

  const rowsHtml = pagedMatches.length
    ? pagedMatches.map(m => {
        const bd = m.breakdown ?? null;
        const inits = initials(m.student_name);
        return `
        <tr>
          <td>
            <div style="display:flex;align-items:center;gap:10px;">
              <div class="entity-card__avatar" style="width:34px;height:34px;font-size:0.75rem;background:rgba(2,132,199,0.08);color:#0284C7;border:1px solid rgba(2,132,199,0.2);font-weight:700;">
                ${inits}
              </div>
              <div>
                <div style="font-size:var(--text-sm);font-weight:600;color:var(--text-primary);">${escapeHtml(m.student_name)}</div>
                <div style="font-size:var(--text-xs);color:var(--text-secondary);">${escapeHtml(m.student_program)} ${m.student_section ? `· <strong>${escapeHtml(m.student_section)}</strong>` : ''}</div>
              </div>
            </div>
          </td>
          <td>
            <div style="font-size:var(--text-sm);font-weight:600;color:var(--text-primary);">${escapeHtml(m.posting_title)}</div>
            ${m.department ? `<div style="font-size:var(--text-xs);color:var(--text-tertiary);">${escapeHtml(m.department)}</div>` : ''}
          </td>
          <td>
            <div style="display:flex;align-items:center;gap:6px;font-size:var(--text-sm);color:var(--text-secondary);">
              <span style="color:#64748b;display:inline-flex;">${icon('building-2', 13)}</span>
              <span>${escapeHtml(m.company)}</span>
            </div>
          </td>
          <td>${alignmentBadge(m.course_alignment)}</td>
          <td>
            <span class="badge" style="font-size:0.75rem;padding:3px 8px;background:rgba(14,165,233,0.08);color:#0284C7;border:1px solid rgba(14,165,233,0.2);font-weight:600;">
              ${m.slots_remaining} of ${m.slots_total} slots left
            </span>
          </td>
          <td>
            <div style="display:flex;align-items:center;gap:8px;">
              <div style="width:64px;height:6px;background:var(--bg-secondary, #e2e8f0);border-radius:999px;overflow:hidden;">
                <div style="width:${m.score}%;height:100%;background:${scoreColor(m.score)};border-radius:999px;"></div>
              </div>
              <span style="font-size:var(--text-sm);font-weight:700;color:${scoreColor(m.score)};font-variant-numeric:tabular-nums;">${m.score}%</span>
            </div>
          </td>
          <td>${renderBreakdownBar(bd, OJT_FACTORS)}</td>
          <td>${scoreBadge(m.score)}</td>
        </tr>`;
      }).join('')
    : `<tr><td colspan="8" style="text-align:center;color:var(--text-tertiary);padding:var(--space-10);">No student OJT placement records found matching current criteria.</td></tr>`;

  const paginationFooterHtml = buildPaginationHtml({
    currentPage: _ojtPage,
    totalPages,
    totalItems: filtered.length,
    perPage: PAGE_SIZE,
    itemName: 'interns'
  });

  return `
    ${statsHtml}
    ${middleRowHtml}
    ${gapHtml}

    <!-- Best OJT Placements per Student (Full-Width, 5 per pagination) -->
    <div class="ojt-table-card anim-fade-in-up" style="margin-top:var(--space-5, 20px);" id="ojt-matches-table-card">
      <div class="ojt-table-card__header">
        <div class="ojt-table-card__title-group">
          <div class="ojt-table-card__icon">
            ${icon('graduation-cap', 18)}
          </div>
          <div>
            <h3 class="ojt-table-card__title">Best OJT Placements per Student</h3>
            <p class="ojt-table-card__subtitle">Top algorithmic internship match for each trainee (5 per page)</p>
          </div>
        </div>
        <div class="ojt-table-card__actions">
          <div class="matching-filter-bar">
            <div class="matching-search-input">
              ${icon('search', 14)}
              <input type="text" id="ojt-search-input" placeholder="Search student, role, or company..." value="${escapeHtml(_ojtSearch)}" />
            </div>
            <select class="matching-select" id="ojt-filter-select">
              <option value="all" ${_ojtFilter === 'all' ? 'selected' : ''}>All Matches</option>
              <option value="strong" ${_ojtFilter === 'strong' ? 'selected' : ''}>Strong (&gt; 70%)</option>
              <option value="moderate" ${_ojtFilter === 'moderate' ? 'selected' : ''}>Moderate (40–70%)</option>
              <option value="weak" ${_ojtFilter === 'weak' ? 'selected' : ''}>Weak (&lt; 40%)</option>
            </select>
            <span class="ojt-count-pill">
              <span class="ojt-count-pill__dot"></span>
              <span>${filtered.length} Matches</span>
            </span>
            <button class="btn btn--primary btn--sm" id="btn-run-ojt-matching" style="display:inline-flex;align-items:center;gap:6px;padding:6px 14px;border-radius:20px;">
              <span class="ojt-refresh-icon" style="display:inline-flex;">${icon('refresh-cw', 13)}</span> Run Matching
            </button>
          </div>
        </div>
      </div>
      <div class="ojt-table-responsive">
        <table class="ojt-table">
          <thead>
            <tr>
              <th style="min-width:210px;">Student Intern</th>
              <th style="min-width:180px;">Target OJT Slot</th>
              <th style="min-width:160px;">Host Company</th>
              <th style="min-width:130px;">Program Alignment</th>
              <th style="min-width:130px;">Slot Quota</th>
              <th style="min-width:140px;">Suitability Score</th>
              <th style="min-width:150px;">Weighted Factors</th>
              <th style="min-width:100px;">Status</th>
            </tr>
          </thead>
          <tbody id="ojt-matches-tbody">${rowsHtml}</tbody>
        </table>
      </div>
      <div class="ojt-table-card__footer" id="ojt-matches-pagination">
        ${paginationFooterHtml}
      </div>
    </div>
  `;
}

/* ----------------------------------------------------------------
   Main Page Controller & Segmented Tab Switcher
---------------------------------------------------------------- */
function renderPage(container, data) {
  if (!data || typeof data !== 'object') {
    showError(container, 'Received invalid data from the server.');
    return;
  }

  _cachedData = data;

  const jobData = data.jobs || {
    stats:     data.stats     ?? { matchRate: 0, partialMatch: 0, mismatch: 0 },
    topSkills: data.topSkills ?? [],
    gapSkills: data.gapSkills ?? [],
    matches:   data.matches   ?? [],
    meta:      data.meta      ?? null,
  };

  const ojtData = data.ojt || {
    stats:     { matchRate: 0, partialMatch: 0, mismatch: 0 },
    topSkills: [],
    gapSkills: [],
    matches:   [],
    meta:      null,
  };

  const jobMatchesCount = (jobData.matches || []).length;
  const ojtMatchesCount = (ojtData.matches || []).length;

  container.innerHTML = `
    <div class="page-header" style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:16px;">
      <div>
        <h1 class="page-header__title" style="margin:0;display:flex;align-items:center;gap:10px;">
          ${icon('zap', 24)} Matching &amp; Scoring Intelligence
        </h1>
        <p class="page-header__subtitle" style="margin:4px 0 0;">
          ${_activeTab === 'jobs'
            ? 'Career &amp; Job Suitability — Scoring students &amp; graduates against open company employment opportunities.'
            : 'OJT Internship Suitability — Scoring enrolled students against accredited partner company OJT slot postings.'}
        </p>
      </div>

      <!-- Segmented Clickable Swap Tabs -->
      <div class="peo-view-tabs" id="matching-mode-tabs" style="margin:0;">
        <button class="peo-tab-btn ${_activeTab === 'jobs' ? 'peo-tab-btn--active' : ''}" data-tab="jobs" style="cursor:pointer;outline:none;">
          ${icon('briefcase', 14)} Career &amp; Job Matching
          <span style="background:var(--bg-secondary, #e2e8f0);padding:1px 7px;border-radius:10px;font-size:11px;font-weight:700;margin-left:4px;">${jobMatchesCount}</span>
        </button>
        <button class="peo-tab-btn ${_activeTab === 'ojt' ? 'peo-tab-btn--active' : ''}" data-tab="ojt" style="cursor:pointer;outline:none;">
          ${icon('graduation-cap', 14)} OJT Internship Matching
          <span style="background:var(--bg-secondary, #e2e8f0);padding:1px 7px;border-radius:10px;font-size:11px;font-weight:700;margin-left:4px;">${ojtMatchesCount}</span>
        </button>
      </div>
    </div>

    <!-- Active Mode Dynamic Container -->
    <div id="matching-content-view">
      ${_activeTab === 'jobs' ? renderJobView(jobData) : renderOjtView(ojtData)}
    </div>
  `;

  renderIcons();
  bindViewEvents(container);
}

function bindViewEvents(container) {
  // Tab Switcher
  const modeTabs = container.querySelector('#matching-mode-tabs');
  if (modeTabs) {
    modeTabs.addEventListener('click', (e) => {
      const btn = e.target.closest('.peo-tab-btn');
      if (!btn || btn.dataset.tab === _activeTab) return;

      _activeTab = btn.dataset.tab;
      renderPage(container, _cachedData);
    });
  }

  // Job Matching View Handlers
  if (_activeTab === 'jobs') {
    const searchInput = container.querySelector('#job-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        _jobSearch = e.target.value;
        _jobPage = 1;
        refreshActiveView(container);
      });
    }

    const filterSelect = container.querySelector('#job-filter-select');
    if (filterSelect) {
      filterSelect.addEventListener('change', (e) => {
        _jobFilter = e.target.value;
        _jobPage = 1;
        refreshActiveView(container);
      });
    }

    const refreshBtn = container.querySelector('#btn-run-job-matching');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', async () => {
        const iconEl = refreshBtn.querySelector('.ojt-refresh-icon');
        if (iconEl) iconEl.style.animation = 'spin 0.8s linear infinite';
        refreshBtn.disabled = true;
        try {
          await loadAndRender(container, true);
        } finally {
          if (iconEl) iconEl.style.animation = '';
          refreshBtn.disabled = false;
        }
      });
    }

    const pagEl = container.querySelector('#job-matches-pagination');
    if (pagEl) {
      pagEl.querySelectorAll('.an-pg-btn[data-p]:not([disabled])').forEach(btn => {
        btn.addEventListener('click', () => {
          const targetPage = parseInt(btn.dataset.p, 10);
          if (targetPage && targetPage !== _jobPage) {
            _jobPage = targetPage;
            refreshActiveView(container);
          }
        });
      });
    }
  }

  // OJT Matching View Handlers
  if (_activeTab === 'ojt') {
    const searchInput = container.querySelector('#ojt-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        _ojtSearch = e.target.value;
        _ojtPage = 1;
        refreshActiveView(container);
      });
    }

    const filterSelect = container.querySelector('#ojt-filter-select');
    if (filterSelect) {
      filterSelect.addEventListener('change', (e) => {
        _ojtFilter = e.target.value;
        _ojtPage = 1;
        refreshActiveView(container);
      });
    }

    const refreshBtn = container.querySelector('#btn-run-ojt-matching');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', async () => {
        const iconEl = refreshBtn.querySelector('.ojt-refresh-icon');
        if (iconEl) iconEl.style.animation = 'spin 0.8s linear infinite';
        refreshBtn.disabled = true;
        try {
          await loadAndRender(container, true);
        } finally {
          if (iconEl) iconEl.style.animation = '';
          refreshBtn.disabled = false;
        }
      });
    }

    const pagEl = container.querySelector('#ojt-matches-pagination');
    if (pagEl) {
      pagEl.querySelectorAll('.an-pg-btn[data-p]:not([disabled])').forEach(btn => {
        btn.addEventListener('click', () => {
          const targetPage = parseInt(btn.dataset.p, 10);
          if (targetPage && targetPage !== _ojtPage) {
            _ojtPage = targetPage;
            refreshActiveView(container);
          }
        });
      });
    }
  }
}

function refreshActiveView(container) {
  if (!_cachedData) return;
  const contentView = container.querySelector('#matching-content-view');
  if (!contentView) return;

  const jobData = _cachedData.jobs || {
    stats:     _cachedData.stats     ?? { matchRate: 0, partialMatch: 0, mismatch: 0 },
    topSkills: _cachedData.topSkills ?? [],
    gapSkills: _cachedData.gapSkills ?? [],
    matches:   _cachedData.matches   ?? [],
    meta:      _cachedData.meta      ?? null,
  };

  const ojtData = _cachedData.ojt || {
    stats:     { matchRate: 0, partialMatch: 0, mismatch: 0 },
    topSkills: [],
    gapSkills: [],
    matches:   [],
    meta:      null,
  };

  contentView.innerHTML = _activeTab === 'jobs' ? renderJobView(jobData) : renderOjtView(ojtData);
  renderIcons();
  bindViewEvents(container);
}

/* ----------------------------------------------------------------
   Loading and Error States
---------------------------------------------------------------- */
function showLoading(container) {
  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-header__title" style="margin:0;display:flex;align-items:center;gap:10px;">
        ${icon('zap', 24)} Matching &amp; Scoring Intelligence
      </h1>
      <p class="page-header__subtitle" style="margin:4px 0 0;">Running weighted suitability analysis across career and OJT internship tracks...</p>
    </div>
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:var(--space-16);gap:var(--space-4);">
      <div class="spinner"></div>
      <p style="color:var(--text-secondary);font-size:var(--text-sm);">Evaluating candidate profiles, skills, and academic alignment...</p>
    </div>
  `;
}

function showError(container, message) {
  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-header__title" style="margin:0;display:flex;align-items:center;gap:10px;">
        ${icon('zap', 24)} Matching &amp; Scoring Intelligence
      </h1>
    </div>
    <div class="empty-state" style="padding:var(--space-16);">
      <div class="empty-state__icon">${icon('alert-triangle', 40)}</div>
      <h3 class="empty-state__title">Failed to load matching data</h3>
      <p class="empty-state__text">${message}</p>
      <button class="btn btn--primary" id="btn-retry">Retry</button>
    </div>
  `;
  renderIcons();
  container.querySelector('#btn-retry').addEventListener('click', () => loadAndRender(container, true));
}

/* ----------------------------------------------------------------
   Fetch & Render with SWR Caching
---------------------------------------------------------------- */
async function loadAndRender(container, force = false) {
  const cached = !force ? getCached('/admin/skills-matching') : null;

  if (cached?.data) {
    renderPage(container, cached.data);
  } else {
    showLoading(container);
  }

  try {
    const data = await apiGetCached('/admin/skills-matching', {
      force,
      onUpdate: (fresh) => {
        if (!container.isConnected) return;
        if (fresh && !fresh.error) {
          renderPage(container, fresh);
        }
      },
    });

    if (data && !cached) {
      if (data.error) {
        showError(container, data.message || 'The server encountered an error. Check Laravel logs for details.');
        return;
      }
      renderPage(container, data);
    }
  } catch (err) {
    if (!cached) {
      console.error('[MatchingPage]', err);
      showError(container, err && err.message ? err.message : 'Unknown error. Check that the API server is running.');
    }
  }
}

/* ----------------------------------------------------------------
   Entry Point
---------------------------------------------------------------- */
export default function MatchingPage(container) {
  loadAndRender(container);
}
