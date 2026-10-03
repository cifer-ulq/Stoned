/* -- Skills-Job Matching Page -- Admin Portal (Weighted Suitability) -- */
import { apiGet, apiGetCached, getCached } from '../api/client.js';
import { icon, renderIcons } from '../components/icons.js';

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

function initials(name) {
  return (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

/* ----------------------------------------------------------------
   Breakdown mini-bar (5 factors)
---------------------------------------------------------------- */
const FACTORS = [
  { key: 'skill_match',    label: 'Skills',          weight: '40%', color: '#6366F1' },
  { key: 'proficiency',    label: 'Proficiency',     weight: '20%', color: '#8B5CF6' },
  { key: 'experience',     label: 'Experience',      weight: '25%', color: '#0EA5E9' },
  { key: 'certifications', label: 'Certifications',  weight: '10%', color: '#F59E0B' },
  { key: 'projects',       label: 'Projects',        weight: '5%',  color: '#10B981' },
];

function renderBreakdownBar(breakdown) {
  if (!breakdown) return '<span style="font-size:var(--text-xs);color:var(--text-tertiary);">—</span>';

  const bars = FACTORS.map(f => {
    const val = breakdown[f.key] ?? 0;
    return `
      <div title="${f.label} (${f.weight} weight): ${val}%"
           style="flex:1;height:10px;background:var(--bg-secondary);border-radius:3px;overflow:hidden;cursor:default;">
        <div style="width:${val}%;height:100%;background:${f.color};border-radius:3px;transition:width 0.5s ease;"></div>
      </div>`;
  }).join('');

  const dots = FACTORS.map(f => {
    const val = breakdown[f.key] ?? 0;
    return `<span style="font-size:9px;color:var(--text-tertiary);" title="${f.label}: ${val}%">${val}</span>`;
  }).join('<span style="color:var(--text-tertiary);font-size:9px;padding:0 1px;">·</span>');

  return `
    <div style="display:flex;flex-direction:column;gap:3px;min-width:120px;">
      <div style="display:flex;gap:3px;align-items:center;">${bars}</div>
      <div style="display:flex;gap:2px;align-items:center;justify-content:space-between;">${dots}</div>
    </div>`;
}

/* ----------------------------------------------------------------
   Score legend panel
---------------------------------------------------------------- */
function renderLegend() {
  const rows = FACTORS.map(f => `
    <div style="display:flex;align-items:center;gap:8px;">
      <span style="width:10px;height:10px;border-radius:2px;background:${f.color};flex-shrink:0;"></span>
      <span style="font-size:var(--text-xs);color:var(--text-secondary);flex:1;">${f.label}</span>
      <span style="font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-primary);">${f.weight}</span>
    </div>`).join('');

  return `
    <div class="card anim-fade-in-up">
      <div class="card__header">
        <h3 class="card__title">${icon('info', 16)} Suitability Score Formula</h3>
      </div>
      <div class="card__body">
        <p style="font-size:var(--text-xs);color:var(--text-tertiary);margin-bottom:var(--space-3);">
          Each student–job pair is scored 0–100 using a weighted combination of five factors:
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
   Stat cards row
---------------------------------------------------------------- */
function renderStats(stats = {}) {
  const items = [
    { label: 'Strong Match',   value: (stats.matchRate    ?? 0) + '%', ic: 'check-circle', color: '#10B981', sub: 'Students with weighted suitability > 70%' },
    { label: 'Moderate Match', value: (stats.partialMatch ?? 0) + '%', ic: 'alert-circle', color: '#F59E0B', sub: 'Students with weighted suitability 40–70%' },
    { label: 'Low Match',      value: (stats.mismatch     ?? 0) + '%', ic: 'x-circle',     color: '#EF4444', sub: 'Students with weighted suitability < 40%' },
  ];
  return items.map(s => `
    <div class="stat-card anim-fade-in-up" style="--stat-accent:${s.color};">
      <div class="stat-card__top">
        <div class="stat-card__icon" style="background:${s.color}12;color:${s.color};">${icon(s.ic, 20)}</div>
        <span class="stat-card__label">${s.label}</span>
      </div>
      <div class="stat-card__value">${s.value}</div>
      <div class="stat-card__sub">${s.sub}</div>
    </div>
  `).join('');
}

/* ----------------------------------------------------------------
   Donut chart (inline SVG)
---------------------------------------------------------------- */
function renderDonut(stats = {}) {
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
        <h3 class="card__title">${icon('pie-chart', 16)} Overall Alignment</h3>
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
    </div>
  `;
}

/* ----------------------------------------------------------------
   Top Skills in Demand bar chart
---------------------------------------------------------------- */
function renderTopSkills(topSkills) {
  if (!topSkills.length) {
    return `
      <div class="card anim-fade-in-up">
        <div class="card__header"><h3 class="card__title">${icon('layers', 16)} Top Skills in Demand</h3></div>
        <div class="card__body"><p style="color:var(--text-secondary);font-size:var(--text-sm);">No job listings with skill requirements found.</p></div>
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
      <div class="card__header"><h3 class="card__title">${icon('layers', 16)} Top Skills in Demand</h3></div>
      <div class="card__body"><div style="display:flex;flex-direction:column;gap:10px;">${bars}</div></div>
    </div>
  `;
}

/* ----------------------------------------------------------------
   Gap Analysis panel
---------------------------------------------------------------- */
function renderGapSkills(gapSkills) {
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
      <div class="card__header"><h3 class="card__title">${icon('alert-triangle', 16)} Student Coverage of In-Demand Skills</h3></div>
      <div class="card__body">
        <p style="font-size:var(--text-xs);color:var(--text-tertiary);margin-bottom:var(--space-3);">% of students who have each in-demand skill</p>
        <div style="display:flex;flex-direction:column;gap:10px;">${rows}</div>
      </div>
    </div>
  `;
}

/* ----------------------------------------------------------------
   Recent Matches table
---------------------------------------------------------------- */
function renderMatches(matches, meta, onRefresh) {
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
          <td style="font-size:var(--text-sm);">${m.job_title}</td>
          <td style="font-size:var(--text-sm);">${m.company}</td>
          <td>
            <div style="display:flex;align-items:center;gap:6px;">
              <div style="width:56px;height:6px;background:var(--bg-secondary);border-radius:3px;overflow:hidden;">
                <div style="width:${m.score}%;height:100%;background:${scoreColor(m.score)};border-radius:3px;"></div>
              </div>
              <span style="font-size:var(--text-xs);font-weight:var(--weight-semibold);">${m.score}%</span>
            </div>
          </td>
          <td>${renderBreakdownBar(bd)}</td>
          <td><div style="font-size:var(--text-xs);color:var(--text-tertiary);">${m.matched_count}/${m.total_required} skills</div></td>
          <td>${scoreBadge(m.score)}</td>
        </tr>`;
      }).join('')
    : `<tr><td colspan="7" style="text-align:center;color:var(--text-tertiary);padding:var(--space-8);">No matches found. Ensure students have skills and jobs have skill requirements.</td></tr>`;

  const metaHtml = meta
    ? `<span style="font-size:var(--text-xs);color:var(--text-tertiary);">${meta.totalUsers} students &amp; graduates &middot; ${meta.totalJobs} open jobs</span>`
    : '';

  const wrap = document.createElement('div');
  wrap.className = 'card anim-fade-in-up';
  wrap.innerHTML = `
    <div class="card__header">
      <h3 class="card__title">${icon('zap', 16)} Best Matches per Student</h3>
      <div style="display:flex;align-items:center;gap:var(--space-3);">
        ${metaHtml}
        <button class="btn btn--primary btn--sm" id="btn-run-matching">${icon('refresh-cw', 14)} Run Matching</button>
      </div>
    </div>
    <div class="card__body">
      <div class="table-wrapper">
        <table class="table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Best Matched Job</th>
              <th>Company</th>
              <th>Score</th>
              <th>Breakdown <span style="font-size:9px;font-weight:normal;color:var(--text-tertiary);">Skills · Prof · Exp · Certs · Projects</span></th>
              <th>Skill Match</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>
  `;

  wrap.querySelector('#btn-run-matching').addEventListener('click', onRefresh);
  return wrap;
}

/* ----------------------------------------------------------------
   Full render
---------------------------------------------------------------- */
function renderPage(container, data) {
  if (!data || typeof data !== 'object') {
    showError(container, 'Received invalid data from the server.');
    return;
  }
  const stats     = data.stats     ?? { matchRate: 0, partialMatch: 0, mismatch: 0 };
  const topSkills = Array.isArray(data.topSkills) ? data.topSkills : [];
  const gapSkills = Array.isArray(data.gapSkills) ? data.gapSkills : [];
  const matches   = Array.isArray(data.matches)   ? data.matches   : [];
  const meta      = data.meta ?? null;

  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-header__title">Skills-Job Matching</h1>
      <p class="page-header__subtitle">Weighted suitability analysis — skills, proficiency, experience, certifications &amp; projects</p>
    </div>
    <div class="stats-grid stats-grid--3 anim-stagger" id="match-stats"></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-5);margin-top:var(--space-5);" id="match-panels"></div>
    <div style="display:grid;grid-template-columns:1fr;gap:var(--space-5);margin-top:var(--space-5);" id="match-gap"></div>
    <div style="display:grid;grid-template-columns:1fr 300px;gap:var(--space-5);margin-top:var(--space-5);" id="match-bottom"></div>
  `;

  container.querySelector('#match-stats').innerHTML = renderStats(stats);

  const panels = container.querySelector('#match-panels');
  panels.innerHTML = renderDonut(stats) + renderTopSkills(topSkills);

  const gapEl = container.querySelector('#match-gap');
  gapEl.innerHTML = renderGapSkills(gapSkills);

  const bottomEl = container.querySelector('#match-bottom');
  const tableWrap = document.createElement('div');
  tableWrap.appendChild(renderMatches(matches, meta, () => loadAndRender(container)));
  bottomEl.appendChild(tableWrap);

  const legendWrap = document.createElement('div');
  legendWrap.innerHTML = renderLegend();
  bottomEl.appendChild(legendWrap);

  renderIcons();
}

/* ----------------------------------------------------------------
   Loading and error states
---------------------------------------------------------------- */
function showLoading(container) {
  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-header__title">Skills-Job Matching</h1>
      <p class="page-header__subtitle">Weighted suitability analysis — skills, proficiency, experience, certifications &amp; projects</p>
    </div>
    <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:var(--space-16);gap:var(--space-4);">
      <div class="spinner"></div>
      <p style="color:var(--text-secondary);font-size:var(--text-sm);">Running weighted suitability analysis...</p>
    </div>
  `;
}

function showError(container, message) {
  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-header__title">Skills-Job Matching</h1>
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
   Fetch + render
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
   Entry point
---------------------------------------------------------------- */
export default function MatchingPage(container) {
  loadAndRender(container);
}
