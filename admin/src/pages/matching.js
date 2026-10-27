/* -- Skills & OJT Matching Page -- Admin Portal (Dual-Mode Weighted Suitability) -- */
import { apiGet, apiGetCached, getCached } from '../api/client.js';
import { icon, renderIcons } from '../components/icons.js';

/* ----------------------------------------------------------------
   Factor Definitions
---------------------------------------------------------------- */
const JOB_FACTORS = [
  { key: 'skill_match',    label: 'Skills',          weight: '40%', color: '#6366F1' },
  { key: 'proficiency',    label: 'Proficiency',     weight: '20%', color: '#8B5CF6' },
  { key: 'experience',     label: 'Experience',      weight: '25%', color: '#0EA5E9' },
  { key: 'certifications', label: 'Certifications',  weight: '10%', color: '#F59E0B' },
  { key: 'projects',       label: 'Projects',        weight: '5%',  color: '#10B981' },
];

const OJT_FACTORS = [
  { key: 'course_alignment', label: 'Program',        weight: '30%', color: '#3B82F6' },
  { key: 'skill_match',      label: 'Skills',         weight: '35%', color: '#6366F1' },
  { key: 'proficiency',      label: 'Proficiency',    weight: '15%', color: '#8B5CF6' },
  { key: 'projects',         label: 'Projects',       weight: '15%', color: '#10B981' },
  { key: 'certifications',   label: 'Certifications', weight: '5%',  color: '#F59E0B' },
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
  if (score > 70) return '<span class="badge badge--success">Strong</span>';
  if (score >= 40) return '<span class="badge badge--warning">Moderate</span>';
  return '<span class="badge badge--danger">Weak</span>';
}

function alignmentBadge(alignment) {
  if (alignment === 'Direct Match') {
    return `<span class="badge badge--success" style="font-size:0.72rem;padding:2px 8px;">Direct Match</span>`;
  }
  if (alignment === 'Related Discipline') {
    return `<span class="badge badge--info" style="font-size:0.72rem;padding:2px 8px;background:rgba(59,130,246,0.12);color:#2563EB;border:1px solid rgba(59,130,246,0.25);">Related Field</span>`;
  }
  if (alignment === 'All Programs Welcome') {
    return `<span class="badge" style="font-size:0.72rem;padding:2px 8px;background:rgba(16,185,129,0.08);color:#059669;border:1px solid rgba(16,185,129,0.2);">Open Eligibility</span>`;
  }
  return `<span class="badge badge--warning" style="font-size:0.72rem;padding:2px 8px;">Different Field</span>`;
}

function initials(name) {
  return (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

/* ----------------------------------------------------------------
   Breakdown mini-bar (generalized for both factor sets)
---------------------------------------------------------------- */
function renderBreakdownBar(breakdown, factors = JOB_FACTORS) {
  if (!breakdown) return '<span style="font-size:var(--text-xs);color:var(--text-tertiary);">—</span>';

  const bars = factors.map(f => {
    const val = breakdown[f.key] ?? 0;
    return `
      <div title="${f.label} (${f.weight} weight): ${val}%"
           style="flex:1;height:10px;background:var(--bg-secondary);border-radius:3px;overflow:hidden;cursor:default;">
        <div style="width:${val}%;height:100%;background:${f.color};border-radius:3px;transition:width 0.5s ease;"></div>
      </div>`;
  }).join('');

  const dots = factors.map(f => {
    const val = breakdown[f.key] ?? 0;
    return `<span style="font-size:9px;color:var(--text-tertiary);" title="${f.label}: ${val}%">${val}</span>`;
  }).join('<span style="color:var(--text-tertiary);font-size:9px;padding:0 1px;">·</span>');

  return `
    <div style="display:flex;flex-direction:column;gap:3px;min-width:130px;">
      <div style="display:flex;gap:3px;align-items:center;">${bars}</div>
      <div style="display:flex;gap:2px;align-items:center;justify-content:space-between;">${dots}</div>
    </div>`;
}

/* ----------------------------------------------------------------
   Formula legend panel
---------------------------------------------------------------- */
function renderLegend(factors, title, desc) {
  const rows = factors.map(f => `
    <div style="display:flex;align-items:center;gap:8px;">
      <span style="width:10px;height:10px;border-radius:2px;background:${f.color};flex-shrink:0;"></span>
      <span style="font-size:var(--text-xs);color:var(--text-secondary);flex:1;">${f.label}</span>
      <span style="font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-primary);">${f.weight}</span>
    </div>`).join('');

  return `
    <div class="card anim-fade-in-up">
      <div class="card__header">
        <h3 class="card__title">${icon('info', 16)} ${title}</h3>
      </div>
      <div class="card__body">
        <p style="font-size:var(--text-xs);color:var(--text-tertiary);margin-bottom:var(--space-3);">
          ${desc}
        </p>
        <div style="display:flex;flex-direction:column;gap:8px;">${rows}</div>
        <div style="margin-top:var(--space-3);padding-top:var(--space-3);border-top:1px solid var(--border-primary);">
          <p style="font-size:var(--text-xs);color:var(--text-tertiary);">
            ${icon('zap', 11)} <strong>Strong</strong> &gt; 70 &nbsp;·&nbsp;
            ${icon('alert-circle', 11)} <strong>Moderate</strong> 40–70 &nbsp;·&nbsp;
            ${icon('x-circle', 11)} <strong>Weak</strong> &lt; 40
          </p>
        </div>
      </div>
    </div>`;
}

/* ----------------------------------------------------------------
   Donut chart (inline SVG)
---------------------------------------------------------------- */
function renderDonut(stats = {}, title = 'Overall Alignment') {
  const r = 60, cx = 80, cy = 80, stroke = 20;
  const circumference = 2 * Math.PI * r;
  const segments = [
    { pct: stats.matchRate    ?? 0, color: '#10B981', label: 'Strong Match' },
    { pct: stats.partialMatch ?? 0, color: '#F59E0B', label: 'Moderate Match' },
    { pct: stats.mismatch     ?? 0, color: '#EF4444', label: 'Low Match' },
  ];

  let offset = 0;
  const paths = segments.map(seg => {
    const dash   = (seg.pct / 100) * circumference;
    const gap    = circumference - dash;
    const rotate = (offset / 100) * 360 - 90;
    offset += seg.pct;
    return `<circle cx="${cx}" cy="${cy}" r="${r}"
      fill="none" stroke="${seg.color}" stroke-width="${stroke}"
      stroke-dasharray="${dash.toFixed(2)} ${gap.toFixed(2)}"
      transform="rotate(${rotate.toFixed(2)} ${cx} ${cy})"
      style="transition:stroke-dasharray 0.6s var(--ease-out);"
    />`;
  }).join('');

  const legend = segments.map(seg => `
    <div style="display:flex;align-items:center;gap:6px;font-size:var(--text-xs);">
      <span style="width:10px;height:10px;border-radius:50%;background:${seg.color};flex-shrink:0;"></span>
      <span style="color:var(--text-secondary);">${seg.label}</span>
      <span style="font-weight:var(--weight-semibold);margin-left:auto;">${seg.pct}%</span>
    </div>
  `).join('');

  return `
    <div class="card anim-fade-in-up">
      <div class="card__header">
        <h3 class="card__title">${icon('pie-chart', 16)} ${title}</h3>
      </div>
      <div class="card__body" style="display:flex;flex-direction:column;align-items:center;gap:var(--space-4);">
        <svg width="160" height="160" viewBox="0 0 160 160">${paths}
          <text x="${cx}" y="${cy - 6}" text-anchor="middle" fill="var(--text-primary)"
            style="font-size:22px;font-weight:700;">${stats.matchRate}%</text>
          <text x="${cx}" y="${cy + 14}" text-anchor="middle" fill="var(--text-tertiary)"
            style="font-size:10px;">strong match</text>
        </svg>
        <div style="width:100%;display:flex;flex-direction:column;gap:8px;">${legend}</div>
      </div>
    </div>`;
}

/* ----------------------------------------------------------------
   Top Skills in Demand bar chart
---------------------------------------------------------------- */
function renderTopSkills(topSkills, title = 'Top Skills in Demand', emptyMsg = 'No skill requirements found.') {
  if (!topSkills.length) {
    return `
      <div class="card anim-fade-in-up">
        <div class="card__header"><h3 class="card__title">${icon('layers', 16)} ${title}</h3></div>
        <div class="card__body"><p style="color:var(--text-secondary);font-size:var(--text-sm);">${emptyMsg}</p></div>
      </div>`;
  }
  const maxCount = topSkills[0].count || 1;
  const bars = topSkills.map(({ skill, count }) => `
    <div style="display:flex;align-items:center;gap:10px;">
      <span style="font-size:var(--text-xs);color:var(--text-secondary);width:90px;flex-shrink:0;text-align:right;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${skill}">${skill}</span>
      <div style="flex:1;height:20px;background:var(--bg-secondary);border-radius:var(--radius-sm);overflow:hidden;">
        <div style="width:${(count / maxCount * 100).toFixed(0)}%;height:100%;background:linear-gradient(90deg,var(--color-primary),var(--color-primary-light));border-radius:var(--radius-sm);transition:width 0.6s var(--ease-out);"></div>
      </div>
      <span style="font-size:var(--text-xs);font-weight:var(--weight-semibold);width:28px;text-align:right;">${count}</span>
    </div>
  `).join('');

  return `
    <div class="card anim-fade-in-up">
      <div class="card__header"><h3 class="card__title">${icon('layers', 16)} ${title}</h3></div>
      <div class="card__body"><div style="display:flex;flex-direction:column;gap:10px;">${bars}</div></div>
    </div>
  `;
}

/* ----------------------------------------------------------------
   Gap Analysis panel
---------------------------------------------------------------- */
function renderGapSkills(gapSkills, title = 'Student Coverage of In-Demand Skills', sub = '% of students who have each in-demand skill') {
  if (!gapSkills.length) return '';
  const rows = gapSkills.map(({ skill, demand, have, coverage }) => `
    <div style="display:flex;align-items:center;gap:10px;">
      <span style="font-size:var(--text-xs);color:var(--text-secondary);width:110px;flex-shrink:0;text-align:right;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${skill}">${skill}</span>
      <div style="flex:1;height:20px;background:var(--bg-secondary);border-radius:var(--radius-sm);overflow:hidden;">
        <div style="width:${coverage}%;height:100%;background:#10B981;border-radius:var(--radius-sm);transition:width 0.6s var(--ease-out);"></div>
      </div>
      <span style="font-size:var(--text-xs);font-weight:var(--weight-semibold);width:36px;text-align:right;">${coverage}%</span>
    </div>
  `).join('');

  return `
    <div class="card anim-fade-in-up" style="grid-column:1/-1;">
      <div class="card__header"><h3 class="card__title">${icon('alert-triangle', 16)} ${title}</h3></div>
      <div class="card__body">
        <p style="font-size:var(--text-xs);color:var(--text-tertiary);margin-bottom:var(--space-3);">${sub}</p>
        <div style="display:flex;flex-direction:column;gap:10px;">${rows}</div>
      </div>
    </div>
  `;
}

/* ----------------------------------------------------------------
   CAREER / JOB MATCHING VIEW
---------------------------------------------------------------- */
function renderJobView(jobData, onRefresh) {
  const stats     = jobData.stats     ?? { matchRate: 0, partialMatch: 0, mismatch: 0 };
  const topSkills = Array.isArray(jobData.topSkills) ? jobData.topSkills : [];
  const gapSkills = Array.isArray(jobData.gapSkills) ? jobData.gapSkills : [];
  const matches   = Array.isArray(jobData.matches)   ? jobData.matches   : [];
  const meta      = jobData.meta ?? null;

  const statItems = [
    { label: 'Strong Job Match',   value: (stats.matchRate    ?? 0) + '%', ic: 'check-circle', color: '#10B981', sub: 'Candidates with suitability > 70%' },
    { label: 'Moderate Match',     value: (stats.partialMatch ?? 0) + '%', ic: 'alert-circle', color: '#F59E0B', sub: 'Candidates with suitability 40–70%' },
    { label: 'Low Match',          value: (stats.mismatch     ?? 0) + '%', ic: 'x-circle',     color: '#EF4444', sub: 'Candidates with suitability < 40%' },
    { label: 'Evaluated Pool',     value: meta?.totalUsers ?? '0',         ic: 'users',        color: '#6366F1', sub: `${meta?.totalJobs ?? 0} active job listings` },
  ];

  const statsHtml = statItems.map(s => `
    <div class="stat-card anim-fade-in-up" style="--stat-accent:${s.color};">
      <div class="stat-card__top">
        <div class="stat-card__icon" style="background:${s.color}12;color:${s.color};">${icon(s.ic, 20)}</div>
        <span class="stat-card__label">${s.label}</span>
      </div>
      <div class="stat-card__value">${s.value}</div>
      <div class="stat-card__sub">${s.sub}</div>
    </div>
  `).join('');

  const rows = matches.length
    ? matches.map(m => {
        const bd = m.breakdown ?? null;
        return `
        <tr>
          <td>
            <div style="display:flex;align-items:center;gap:8px;">
              <div class="entity-card__avatar" style="width:28px;height:28px;font-size:0.55rem;">${initials(m.student_name)}</div>
              <div>
                <div style="font-size:var(--text-sm);font-weight:var(--weight-medium);">${m.student_name}</div>
                <div style="font-size:var(--text-xs);color:var(--text-tertiary);">${m.student_program}</div>
              </div>
            </div>
          </td>
          <td style="font-size:var(--text-sm);font-weight:500;">${m.job_title}</td>
          <td style="font-size:var(--text-sm);color:var(--text-secondary);">${m.company}</td>
          <td>
            <div style="display:flex;align-items:center;gap:6px;">
              <div style="width:56px;height:6px;background:var(--bg-secondary);border-radius:3px;overflow:hidden;">
                <div style="width:${m.score}%;height:100%;background:${scoreColor(m.score)};border-radius:3px;"></div>
              </div>
              <span style="font-size:var(--text-xs);font-weight:var(--weight-semibold);">${m.score}%</span>
            </div>
          </td>
          <td>${renderBreakdownBar(bd, JOB_FACTORS)}</td>
          <td><div style="font-size:var(--text-xs);color:var(--text-tertiary);">${m.matched_count}/${m.total_required} skills</div></td>
          <td>${scoreBadge(m.score)}</td>
        </tr>`;
      }).join('')
    : `<tr><td colspan="7" style="text-align:center;color:var(--text-tertiary);padding:var(--space-8);">No job matches found. Ensure candidates have skills and jobs have skill requirements.</td></tr>`;

  const metaHtml = meta
    ? `<span style="font-size:var(--text-xs);color:var(--text-tertiary);">${meta.totalUsers} candidates &middot; ${meta.totalJobs} open jobs</span>`
    : '';

  return `
    <div class="stats-grid stats-grid--4 anim-stagger">${statsHtml}</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-5);margin-top:var(--space-5);">
      ${renderDonut(stats, 'Career Job Alignment')}
      ${renderTopSkills(topSkills, 'Top Skills in Job Postings', 'No job listings with skill requirements found.')}
    </div>
    <div style="display:grid;grid-template-columns:1fr;gap:var(--space-5);margin-top:var(--space-5);">
      ${renderGapSkills(gapSkills, 'Candidate Coverage of In-Demand Job Skills', '% of candidates who possess each in-demand employment skill')}
    </div>
    <div style="display:grid;grid-template-columns:1fr 300px;gap:var(--space-5);margin-top:var(--space-5);">
      <div class="card anim-fade-in-up">
        <div class="card__header">
          <h3 class="card__title">${icon('zap', 16)} Best Career Matches per Candidate</h3>
          <div style="display:flex;align-items:center;gap:var(--space-3);">
            ${metaHtml}
            <button class="btn btn--primary btn--sm" id="btn-run-job-matching">${icon('refresh-cw', 14)} Run Matching</button>
          </div>
        </div>
        <div class="card__body">
          <div class="table-wrapper">
            <table class="table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Best Matched Job</th>
                  <th>Company</th>
                  <th>Score</th>
                  <th>Breakdown <span style="font-size:9px;font-weight:normal;color:var(--text-tertiary);">Skills · Prof · Exp · Certs · Proj</span></th>
                  <th>Skill Match</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
        </div>
      </div>
      <div>
        ${renderLegend(JOB_FACTORS, 'Job Suitability Formula', 'Each candidate–job pair is scored 0–100 using a weighted combination of 5 career factors:')}
      </div>
    </div>
  `;
}

/* ----------------------------------------------------------------
   OJT INTERNSHIP MATCHING VIEW
---------------------------------------------------------------- */
function renderOjtView(ojtData, onRefresh) {
  const stats     = ojtData.stats     ?? { matchRate: 0, partialMatch: 0, mismatch: 0 };
  const topSkills = Array.isArray(ojtData.topSkills) ? ojtData.topSkills : [];
  const gapSkills = Array.isArray(ojtData.gapSkills) ? ojtData.gapSkills : [];
  const matches   = Array.isArray(ojtData.matches)   ? ojtData.matches   : [];
  const meta      = ojtData.meta ?? null;

  const statItems = [
    { label: 'Strong OJT Match',     value: (stats.matchRate    ?? 0) + '%', ic: 'check-circle', color: '#10B981', sub: 'Students ready for immediate deployment (> 70%)' },
    { label: 'Moderate Match',       value: (stats.partialMatch ?? 0) + '%', ic: 'alert-circle', color: '#F59E0B', sub: 'Students with partial skill match (40–70%)' },
    { label: 'Available OJT Slots',  value: meta?.totalSlotsRemaining ?? '0', ic: 'building',     color: '#0EA5E9', sub: `Across ${meta?.totalPostings ?? 0} active OJT postings` },
    { label: 'Enrolled Intern Pool', value: meta?.totalStudents ?? '0',       ic: 'users',        color: '#8B5CF6', sub: 'Active enrolled students evaluated' },
  ];

  const statsHtml = statItems.map(s => `
    <div class="stat-card anim-fade-in-up" style="--stat-accent:${s.color};">
      <div class="stat-card__top">
        <div class="stat-card__icon" style="background:${s.color}12;color:${s.color};">${icon(s.ic, 20)}</div>
        <span class="stat-card__label">${s.label}</span>
      </div>
      <div class="stat-card__value">${s.value}</div>
      <div class="stat-card__sub">${s.sub}</div>
    </div>
  `).join('');

  const rows = matches.length
    ? matches.map(m => {
        const bd = m.breakdown ?? null;
        return `
        <tr>
          <td>
            <div style="display:flex;align-items:center;gap:8px;">
              <div class="entity-card__avatar" style="width:28px;height:28px;font-size:0.55rem;background:rgba(59,130,246,0.12);color:#2563EB;">${initials(m.student_name)}</div>
              <div>
                <div style="font-size:var(--text-sm);font-weight:var(--weight-medium);">${m.student_name}</div>
                <div style="font-size:var(--text-xs);color:var(--text-tertiary);">${m.student_program} &middot; <span style="font-weight:600;">${m.student_section}</span></div>
              </div>
            </div>
          </td>
          <td>
            <div style="font-size:var(--text-sm);font-weight:500;">${m.posting_title}</div>
            <div style="font-size:var(--text-xs);color:var(--text-tertiary);">${m.department}</div>
          </td>
          <td style="font-size:var(--text-sm);color:var(--text-secondary);">${m.company}</td>
          <td>${alignmentBadge(m.course_alignment)}</td>
          <td>
            <span class="badge" style="font-size:0.75rem;padding:3px 8px;background:rgba(14,165,233,0.1);color:#0284C7;border:1px solid rgba(14,165,233,0.25);font-weight:600;">
              ${m.slots_remaining} of ${m.slots_total} slots left
            </span>
          </td>
          <td>
            <div style="display:flex;align-items:center;gap:6px;">
              <div style="width:56px;height:6px;background:var(--bg-secondary);border-radius:3px;overflow:hidden;">
                <div style="width:${m.score}%;height:100%;background:${scoreColor(m.score)};border-radius:3px;"></div>
              </div>
              <span style="font-size:var(--text-xs);font-weight:var(--weight-semibold);">${m.score}%</span>
            </div>
          </td>
          <td>${renderBreakdownBar(bd, OJT_FACTORS)}</td>
          <td>${scoreBadge(m.score)}</td>
        </tr>`;
      }).join('')
    : `<tr><td colspan="8" style="text-align:center;color:var(--text-tertiary);padding:var(--space-8);">No OJT matches found. Ensure active students have skills and OJT postings have open slots.</td></tr>`;

  const metaHtml = meta
    ? `<span style="font-size:var(--text-xs);color:var(--text-tertiary);">${meta.totalStudents} enrolled students &middot; ${meta.totalSlotsRemaining} available slots</span>`
    : '';

  return `
    <div class="stats-grid stats-grid--4 anim-stagger">${statsHtml}</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-5);margin-top:var(--space-5);">
      ${renderDonut(stats, 'OJT Internship Readiness')}
      ${renderTopSkills(topSkills, 'Top Skills in OJT Slot Postings', 'No active OJT slot postings with skill requirements found.')}
    </div>
    <div style="display:grid;grid-template-columns:1fr;gap:var(--space-5);margin-top:var(--space-5);">
      ${renderGapSkills(gapSkills, 'Student Coverage of Demanded OJT Skills', '% of enrolled students who possess skills required by OJT partner companies')}
    </div>
    <div style="display:grid;grid-template-columns:1fr 300px;gap:var(--space-5);margin-top:var(--space-5);">
      <div class="card anim-fade-in-up">
        <div class="card__header">
          <h3 class="card__title">${icon('zap', 16)} Best OJT Placements per Student</h3>
          <div style="display:flex;align-items:center;gap:var(--space-3);">
            ${metaHtml}
            <button class="btn btn--primary btn--sm" id="btn-run-ojt-matching">${icon('refresh-cw', 14)} Run Matching</button>
          </div>
        </div>
        <div class="card__body">
          <div class="table-wrapper">
            <table class="table">
              <thead>
                <tr>
                  <th>Student Intern</th>
                  <th>Best Matched OJT Slot</th>
                  <th>Company</th>
                  <th>Program Match</th>
                  <th>Availability</th>
                  <th>Score</th>
                  <th>Breakdown <span style="font-size:9px;font-weight:normal;color:var(--text-tertiary);">Prog · Skills · Prof · Proj · Certs</span></th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
        </div>
      </div>
      <div>
        ${renderLegend(OJT_FACTORS, 'OJT Suitability Formula', 'Each student–OJT slot pair is scored 0–100 combining academic alignment and technical readiness:')}
      </div>
    </div>
  `;
}

/* ----------------------------------------------------------------
   Main Page Controller & Segmented Tab Switcher
---------------------------------------------------------------- */
let _activeTab = 'jobs'; // 'jobs' | 'ojt'
let _cachedData = null;

function renderPage(container, data) {
  if (!data || typeof data !== 'object') {
    showError(container, 'Received invalid data from the server.');
    return;
  }

  _cachedData = data;

  // Extract separate datasets with clean fallbacks
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
        <h1 class="page-header__title">Matching &amp; Scoring</h1>
        <p class="page-header__subtitle">
          ${_activeTab === 'jobs'
            ? 'Career &amp; Job Suitability — Scoring students &amp; graduates against open company employment opportunities.'
            : 'OJT Internship Suitability — Scoring enrolled students against accredited partner company OJT slot postings.'}
        </p>
      </div>

      <!-- Segmented Clickable Swap Tabs -->
      <div class="peo-view-tabs" id="matching-mode-tabs" style="margin:0;">
        <button class="peo-tab-btn ${_activeTab === 'jobs' ? 'peo-tab-btn--active' : ''}" data-tab="jobs" style="cursor:pointer;outline:none;">
          ${icon('briefcase', 14)} Career &amp; Job Matching
          <span style="background:var(--bg-secondary);padding:1px 7px;border-radius:10px;font-size:11px;font-weight:700;margin-left:4px;">${jobMatchesCount}</span>
        </button>
        <button class="peo-tab-btn ${_activeTab === 'ojt' ? 'peo-tab-btn--active' : ''}" data-tab="ojt" style="cursor:pointer;outline:none;">
          ${icon('graduation-cap', 14)} OJT Internship Matching
          <span style="background:var(--bg-secondary);padding:1px 7px;border-radius:10px;font-size:11px;font-weight:700;margin-left:4px;">${ojtMatchesCount}</span>
        </button>
      </div>
    </div>

    <!-- Active Mode Dynamic Container -->
    <div id="matching-content-view">
      ${_activeTab === 'jobs'
        ? renderJobView(jobData, () => loadAndRender(container, true))
        : renderOjtView(ojtData, () => loadAndRender(container, true))}
    </div>
  `;

  renderIcons();

  // Wire up refresh buttons in active view
  container.querySelector('#btn-run-job-matching')?.addEventListener('click', () => loadAndRender(container, true));
  container.querySelector('#btn-run-ojt-matching')?.addEventListener('click', () => loadAndRender(container, true));

  // Wire up segmented tab swap listeners (Instant 0ms swap without page reload)
  container.querySelector('#matching-mode-tabs')?.addEventListener('click', (e) => {
    const btn = e.target.closest('.peo-tab-btn');
    if (!btn || btn.dataset.tab === _activeTab) return;

    _activeTab = btn.dataset.tab;
    renderPage(container, _cachedData);
  });
}

/* ----------------------------------------------------------------
   Loading and Error States
---------------------------------------------------------------- */
function showLoading(container) {
  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-header__title">Matching &amp; Scoring</h1>
      <p class="page-header__subtitle">Running weighted suitability analysis across career and OJT internship tracks...</p>
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
      <h1 class="page-header__title">Matching &amp; Scoring</h1>
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
