import { icon, renderIcons } from '../components/icons.js';
import { apiGet, apiGetCached, getCached } from '../api/client.js';
import { openAlumniImportModal } from '../components/alumni-import-modal.js';

/* ─────────────────────────────────────────────────────────────
   HELPERS & SVG GRAPH GENERATORS (ORIGINAL CAREER PATH)
   ───────────────────────────────────────────────────────────── */

function pct(n, total) { return total > 0 ? Math.round((n / total) * 100) : 0; }

function barChart(labels, values, max, color = '#6366F1') {
  return labels.map((lbl, i) => {
    const w = max > 0 ? Math.round((values[i] / max) * 100) : 0;
    return `
      <div class="an-bar-row">
        <span class="an-bar-label">${lbl}</span>
        <div class="an-bar-track"><div class="an-bar-fill" style="width:${w}%;background:${color}"></div></div>
        <span class="an-bar-val">${values[i]}</span>
      </div>`;
  }).join('');
}

function sparkline(values, width = 600, height = 72, color = '#6366F1') {
  if (values.length < 2) return '';
  const dataMin = Math.min(...values), dataMax = Math.max(...values);
  const pad  = Math.max((dataMax - dataMin) * 0.25, 6);
  const yMin = Math.max(0, dataMin - pad), yMax = Math.min(100, dataMax + pad);
  const yRange = yMax - yMin || 1;
  const stepX  = width / (values.length - 1);
  const pts    = values.map((v, i) => ({
    x: (i * stepX).toFixed(2),
    y: (height - ((v - yMin) / yRange) * height).toFixed(2),
    v,
  }));
  const ptsStr   = pts.map(p => `${p.x},${p.y}`).join(' ');
  const lastPt   = pts[pts.length - 1];
  const areaPath = `M0,${pts[0].y} L${ptsStr.replace(/^\S+/, '')} L${lastPt.x},${height} L0,${height} Z`;
  const uid      = values.join('').replace(/\./g, '') + Math.floor(Math.random() * 1000);
  const dots     = pts.map((p, i) => {
    const isLast  = i === pts.length - 1;
    const leftPct = ((i / (pts.length - 1)) * 100).toFixed(2);
    const topPct  = (parseFloat(p.y) / height * 100).toFixed(2);
    return `<div class="an-spark-dot${isLast ? ' an-spark-dot--last' : ''}" style="left:${leftPct}%;top:${topPct}%;--dot-color:${color}"></div>`;
  }).join('');
  return `
    <div class="an-spark-wrap">
      <svg class="an-sparkline" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
        <defs>
          <linearGradient id="sg${uid}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stop-color="${color}" stop-opacity="0.22"/>
            <stop offset="100%" stop-color="${color}" stop-opacity="0.01"/>
          </linearGradient>
        </defs>
        <path d="${areaPath}" fill="url(#sg${uid})"/>
        <polyline points="${ptsStr}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      ${dots}
    </div>`;
}

function donut(inPct, size = 80, strokeW = 10, colorIn = '#6366F1', colorOut = '#E2E8F0') {
  const r = (size - strokeW) / 2;
  const circ   = 2 * Math.PI * r;
  const dashIn = (inPct / 100) * circ;
  const cx = size / 2, cy = size / 2;
  return `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="transform:rotate(-90deg)">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${colorOut}" stroke-width="${strokeW}"/>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${colorIn}" stroke-width="${strokeW}"
        stroke-dasharray="${dashIn.toFixed(2)} ${(circ - dashIn).toFixed(2)}" stroke-linecap="round"/>
    </svg>`;
}

/* ─────────────────────────────────────────────────────────────
   ORIGINAL STUDENT TABLE (PAGINATED IN BATCH PANEL)
   ───────────────────────────────────────────────────────────── */
const PAGE_SIZE = 10;

function studentTableRows(students, page) {
  const start = page * PAGE_SIZE;
  return students.slice(start, start + PAGE_SIZE).map((s, i) => `
    <tr class="an-tbl-row">
      <td class="an-tbl-td an-tbl-td--num">${start + i + 1}</td>
      <td class="an-tbl-td">
        <div class="an-tbl-name">
          <div class="an-tbl-avatar">${s.name.split(' ').map(w => w[0]).slice(0,2).join('')}</div>
          ${s.name}
        </div>
      </td>
      <td class="an-tbl-td"><span class="an-tbl-section">Section ${s.section}</span></td>
      <td class="an-tbl-td">${s.role}</td>
      <td class="an-tbl-td an-tbl-td--emp">${s.employer}</td>
      <td class="an-tbl-td">
        <span class="an-path-badge ${s.inPath ? 'an-path-badge--yes' : 'an-path-badge--no'}">
          ${s.inPath ? icon('checkCircle', 12) + ' In Path' : icon('alertCircle', 12) + ' Not in Path'}
        </span>
      </td>
    </tr>`).join('');
}

function studentTablePagination(total, page) {
  const totalPages = Math.ceil(total / PAGE_SIZE);
  if (totalPages <= 1) return '';
  const pageButtons = Array.from({ length: totalPages }, (_, i) =>
    `<button class="an-pg-btn${i === page ? ' an-pg-btn--active' : ''}" data-page="${i}">${i + 1}</button>`
  ).join('');
  return `
    <div class="an-pagination">
      <button class="an-pg-btn an-pg-btn--nav" data-page="${page - 1}"${page === 0 ? ' disabled' : ''}>${icon('chevronLeft', 14)}</button>
      ${pageButtons}
      <button class="an-pg-btn an-pg-btn--nav" data-page="${page + 1}"${page >= totalPages - 1 ? ' disabled' : ''}>${icon('chevronRight', 14)}</button>
      <span class="an-pg-info">Page ${page + 1} of ${totalPages}</span>
    </div>`;
}

function studentTable(students, course, batch, batchId, page = 0) {
  const inCount  = students.filter(s => s.inPath).length;
  const outCount = students.length - inCount;
  const start    = page * PAGE_SIZE;
  const end      = Math.min(start + PAGE_SIZE, students.length);
  const countLabel = students.length > PAGE_SIZE
    ? `${start + 1}–${end} of ${students.length}`
    : `${students.length} shown`;

  return `
    <div class="an-student-section" data-batch-id="${batchId}" data-page="${page}">
      <div class="an-student-header">
        <div class="an-student-title">
          ${icon('users', 14)}
          Student Records – ${course} Batch ${batch}
          <span class="an-student-count">${countLabel}</span>
        </div>
        <div class="an-student-summary">
          <span class="an-path-badge an-path-badge--yes">${icon('checkCircle', 11)} ${inCount} in path</span>
          <span class="an-path-badge an-path-badge--no">${icon('alertCircle', 11)} ${outCount} not in path</span>
        </div>
      </div>
      <div class="an-tbl-wrap">
        <table class="an-tbl">
          <thead>
            <tr>
              <th class="an-tbl-th an-tbl-th--num">#</th>
              <th class="an-tbl-th">Student Name</th>
              <th class="an-tbl-th">Section</th>
              <th class="an-tbl-th">Current Role</th>
              <th class="an-tbl-th">Employer</th>
              <th class="an-tbl-th">Path Status</th>
            </tr>
          </thead>
          <tbody>${studentTableRows(students, page)}</tbody>
        </table>
      </div>
      ${studentTablePagination(students.length, page)}
    </div>`;
}

/* ─────────────────────────────────────────────────────────────
   ORIGINAL COLLAPSIBLE BATCH PANEL (UNTOUCHED)
   ───────────────────────────────────────────────────────────── */
function renderBatchPanel(b) {
  const inPct  = pct(b.inPath, b.total);
  const outPct = 100 - inPct;
  const topMax = b.topRoleCounts.length ? Math.max(...b.topRoleCounts) : 1;
  const notMax = b.notInPathCounts.length ? Math.max(...b.notInPathCounts) : 1;
  const color  = inPct >= 70 ? '#6366F1' : inPct >= 50 ? '#F59E0B' : '#EF4444';

  const trendRows = b.trendLabels.map((lbl, i) => `
    <div class="an-trend-row">
      <span class="an-trend-year">${lbl}</span>
      <div class="an-trend-bar-track">
        <div class="an-trend-bar-fill" style="width:${b.trend[i]}%;background:${color}"></div>
      </div>
      <span class="an-trend-pct">${b.trend[i]}%</span>
    </div>`).join('');

  const statusClass = inPct >= 70 ? 'an-card__status--good' : inPct >= 50 ? 'an-card__status--mid' : 'an-card__status--low';
  const statusText  = inPct >= 70 ? 'On Track' : inPct >= 50 ? 'Moderate' : 'Low In-Path';
  const statusIcon  = inPct >= 70 ? icon('checkCircle', 14) : icon('info', 14);

  return `
    <div class="an-panel" id="${b.id}" data-campus="${b.campus}" data-course="${b.course}" data-status="${inPct >= 70 ? 'good' : inPct >= 50 ? 'mid' : 'low'}">
      <button class="an-panel__trigger" aria-expanded="false" aria-controls="${b.id}-body">
        <div class="an-panel__trigger-left">
          <span class="an-panel__chevron">${icon('chevronRight', 16)}</span>
          <div class="an-card__badge">${b.course}</div>
          <div class="an-panel__title-block">
            <span class="an-panel__title">Batch ${b.label}</span>
            <span class="an-panel__sub">${b.campus} &middot; ${b.total} alumni tracked</span>
          </div>
        </div>
        <div class="an-panel__trigger-right">
          <div class="an-panel__mini-bar">
            <div class="an-panel__mini-fill" style="width:${inPct}%;background:${color}"></div>
          </div>
          <span class="an-panel__mini-pct" style="color:${color}">${inPct}%</span>
          <span class="an-card__status ${statusClass}">
            ${statusIcon} ${statusText}
          </span>
        </div>
      </button>

      <div class="an-panel__body" id="${b.id}-body">
        <div class="an-panel__body-inner">
          <div class="an-stats-row">
            <div class="an-donut-wrap">
              <div class="an-donut-chart">
                ${donut(inPct, 90, 11, color)}
                <div class="an-donut-label">
                  <span class="an-donut-pct">${inPct}%</span>
                  <span class="an-donut-sub">in path</span>
                </div>
              </div>
              <div class="an-donut-legend">
                <div class="an-legend-row"><span class="an-legend-dot" style="background:${color}"></span><span>${b.inPath} in IT path (${inPct}%)</span></div>
                <div class="an-legend-row"><span class="an-legend-dot" style="background:#E2E8F0"></span><span>${b.notInPath} not in path (${outPct}%)</span></div>
              </div>
            </div>
            <div class="an-trend-wrap">
              <p class="an-section-label" style="margin-bottom:var(--space-3)">In-Path Rate Over Time</p>
              ${b.trend.length >= 2 ? sparkline(b.trend, 600, 72, color) : '<p style="color:var(--text-secondary);font-size:.85rem">Not enough trend data yet.</p>'}
              <div class="an-spark-xaxis">${b.trendLabels.map(l => `<span>${l}</span>`).join('')}</div>
            </div>
          </div>

          <div class="an-detail-grid">
            <div class="an-detail-col">
              <p class="an-section-label">${icon('checkCircle', 12)} Top IT Roles Held</p>
              ${b.topRoles.length
                ? `<div class="an-bars">${barChart(b.topRoles, b.topRoleCounts, topMax, '#6366F1')}</div>`
                : '<p style="color:var(--text-secondary);font-size:.85rem">No IT roles recorded yet.</p>'}
            </div>
            <div class="an-detail-col">
              <p class="an-section-label">${icon('alertCircle', 12)} Not in IT Path</p>
              ${b.notInPathRoles.length
                ? `<div class="an-bars">${barChart(b.notInPathRoles, b.notInPathCounts, notMax, '#EF4444')}</div>`
                : '<p style="color:var(--text-secondary);font-size:.85rem">All graduates are in the IT path.</p>'}
            </div>
            <div class="an-detail-col">
              <p class="an-section-label">${icon('barChart2', 12)} Year-by-Year Breakdown</p>
              ${trendRows ? `<div class="an-trend-rows">${trendRows}</div>` : '<p style="color:var(--text-secondary);font-size:.85rem">No data.</p>'}
            </div>
          </div>

          ${studentTable(b.students, b.course, b.label, b.id)}
        </div>
      </div>
    </div>`;
}

function renderCareerKpiStrip(overall) {
  return `
    <div class="an-kpi">
      <span class="an-kpi__icon" style="background:rgba(99,102,241,.1);color:#6366F1">${icon('users', 18)}</span>
      <div><p class="an-kpi__val">${overall.totalAlumni}</p><p class="an-kpi__label">Total Alumni Tracked</p></div>
    </div>
    <div class="an-kpi">
      <span class="an-kpi__icon" style="background:rgba(16,185,129,.1);color:#10B981">${icon('checkCircle', 18)}</span>
      <div><p class="an-kpi__val">${overall.inPath}</p><p class="an-kpi__label">In IT Career Path</p></div>
    </div>
    <div class="an-kpi">
      <span class="an-kpi__icon" style="background:rgba(99,102,241,.1);color:#6366F1">${icon('target', 18)}</span>
      <div><p class="an-kpi__val">${overall.avgRate}%</p><p class="an-kpi__label">Overall In-Path Rate</p></div>
    </div>
    <div class="an-kpi">
      <span class="an-kpi__icon" style="background:rgba(245,158,11,.1);color:#F59E0B">${icon('bookOpen', 18)}</span>
      <div><p class="an-kpi__val">${overall.batchCount}</p><p class="an-kpi__label">Batches Analysed</p></div>
    </div>`;
}

function buildFilterOptions(batches, field) {
  return [...new Set(batches.map(b => b[field]).filter(Boolean))].sort()
    .map(v => `<option value="${v}">${v}</option>`).join('');
}

function renderCareerView(batches, overall) {
  return `
    <div class="an-kpi-strip">
      ${renderCareerKpiStrip(overall)}
    </div>

    <div class="toolbar" style="margin-bottom:var(--space-5)">
      <div class="toolbar__left">
        <select class="form-select an-filter" id="filter-campus" style="width:auto;padding:7px 32px 7px 10px;">
          <option value="">All Campuses</option>
          ${buildFilterOptions(batches, 'campus')}
        </select>
        <select class="form-select an-filter" id="filter-course" style="width:auto;padding:7px 32px 7px 10px;">
          <option value="">All Courses</option>
          ${buildFilterOptions(batches, 'course')}
        </select>
        <select class="form-select an-filter" id="filter-status" style="width:auto;padding:7px 32px 7px 10px;">
          <option value="">All Status</option>
          <option value="good">On Track (&ge;70%)</option>
          <option value="mid">Moderate (50-69%)</option>
          <option value="low">Low In-Path (&lt;50%)</option>
        </select>
      </div>
      <div class="toolbar__right" style="display:flex;align-items:center;gap:12px;">
        <span class="an-note">
          ${icon('users', 13)}
          ${overall.totalAlumni} graduate${overall.totalAlumni !== 1 ? 's' : ''} &middot;
          ${overall.batchCount} batch${overall.batchCount !== 1 ? 'es' : ''}
        </span>
      </div>
    </div>

    <div class="an-batch-list" id="an-batch-list">
      ${batches.length
        ? batches.map(renderBatchPanel).join('')
        : `<div style="padding:64px;text-align:center;color:var(--text-secondary)">
             ${icon('users', 40)}<p style="margin-top:12px">No graduate records found.</p>
           </div>`}
    </div>
  `;
}

function setupCareerViewListeners(container, batches) {
  /* Collapse toggle */
  container.querySelectorAll('.an-panel__trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
      btn.closest('.an-panel').classList.toggle('an-panel--open', !expanded);
    });
  });

  /* Original Filter */
  function applyFilters() {
    const campus = container.querySelector('#filter-campus')?.value;
    const course = container.querySelector('#filter-course')?.value;
    const status = container.querySelector('#filter-status')?.value;
    container.querySelectorAll('.an-panel').forEach(el => {
      const match =
        (!campus || el.dataset.campus === campus) &&
        (!course || el.dataset.course === course) &&
        (!status || el.dataset.status === status);
      el.style.display = match ? '' : 'none';
    });
  }
  container.querySelectorAll('.an-filter').forEach(sel => sel.addEventListener('change', applyFilters));

  /* Original Pagination */
  container.querySelector('#an-batch-list')?.addEventListener('click', e => {
    const pgBtn = e.target.closest('.an-pg-btn');
    if (!pgBtn || pgBtn.disabled) return;
    const page    = parseInt(pgBtn.dataset.page, 10);
    const section = pgBtn.closest('.an-student-section');
    const batchId = section.dataset.batchId;
    const batch   = batches.find(b => b.id === batchId);
    if (!batch) return;
    const tmp = document.createElement('div');
    tmp.innerHTML = studentTable(batch.students, batch.course, batch.label, batch.id, page);
    section.replaceWith(tmp.firstElementChild);
    renderIcons();
  });
}

/* ─────────────────────────────────────────────────────────────
   REDESIGNED 3 PEO ANALYTICS (CIRCULAR GAUGES, TOP FILTER, PAGINATION)
   ───────────────────────────────────────────────────────────── */

function renderRadialGauge(attainmentPct, size = 90, strokeW = 8, color = '#005930') {
  const r = (size - strokeW) / 2;
  const circ = 2 * Math.PI * r;
  const clamped = Math.min(100, Math.max(0, attainmentPct));
  const dashIn = (clamped / 100) * circ;
  const cx = size / 2, cy = size / 2;

  return `
    <div class="peo-radial-wrap">
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="transform:rotate(-90deg)">
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="var(--bg-secondary)" stroke-width="${strokeW}"/>
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="${strokeW}"
          stroke-dasharray="${dashIn.toFixed(2)} ${(circ - dashIn).toFixed(2)}" stroke-linecap="round"/>
      </svg>
      <div class="peo-radial-center">
        <span class="peo-radial-pct" style="color:${color}">${attainmentPct}%</span>
        <span class="peo-radial-sub">Attained</span>
      </div>
    </div>
  `;
}

function renderPeoTriad(peoData) {
  if (!peoData || !peoData.peo_objectives || peoData.peo_objectives.length === 0) {
    return `<div style="padding:48px;text-align:center;color:var(--text-secondary)">No PEO telemetry available for this cohort selection.</div>`;
  }

  const pillars = peoData.pillars || {};
  const align = pillars.alignment || {};
  const prog  = pillars.progression || {};
  const skill = pillars.skill_relevancy || {};

  const peo1 = peoData.peo_objectives.find(o => o.code === 'PEO 1') || peoData.peo_objectives[0];
  const peo2 = peoData.peo_objectives.find(o => o.code === 'PEO 2') || peoData.peo_objectives[1];
  const peo3 = peoData.peo_objectives.find(o => o.code === 'PEO 3') || peoData.peo_objectives[2];

  function getCardColor(pctVal, benchVal) {
    if (pctVal >= benchVal) return '#005930';
    if (pctVal >= benchVal - 10) return '#D97706';
    return '#EF4444';
  }

  function getBadgeClass(status) {
    const s = (status || '').toLowerCase();
    if (s.includes('achieved')) return 'peo-triad-card__badge--achieved';
    if (s.includes('approach')) return 'peo-triad-card__badge--approaching';
    return 'peo-triad-card__badge--needs-intervention';
  }

  function renderDeltaTag(actual, target) {
    const diff = (actual - target).toFixed(1);
    if (diff >= 0) {
      return `<span class="peo-variance-tag" style="color:#005930">${icon('trendingUp', 12)} +${diff}% Above Target</span>`;
    }
    return `<span class="peo-variance-tag" style="color:#EF4444">${icon('trendingDown', 12)} ${diff}% Below Target</span>`;
  }

  const c1Color = getCardColor(peo1.attainment_pct, peo1.target_benchmark);
  const topSectors = (align.sectors || []).slice(0, 3).map(s => `
    <div class="peo-submetric-row">
      <span class="peo-submetric-label">${icon('chevronRight', 11)} ${s.name}</span>
      <span class="peo-submetric-val">${s.pct}% <span style="font-size:0.65rem;color:var(--text-tertiary);">(${s.count})</span></span>
    </div>
  `).join('') || '<div class="peo-submetric-row"><span class="peo-submetric-label">Aggregating role taxonomy...</span></div>';

  const c2Color = getCardColor(peo2.attainment_pct, peo2.target_benchmark);

  const c3Color = getCardColor(peo3.attainment_pct, peo3.target_benchmark);
  const strengthsPills = (skill.curriculum_strengths || []).slice(0, 3).map(cs => `
    <span class="peo-tag-pill" style="border:1px solid rgba(0,89,48,0.25);color:#005930;background:rgba(0,89,48,0.06);">
      ${cs.skill} &middot; ${cs.coverage_pct}%
    </span>
  `).join('') || '<span style="font-size:0.7rem;color:var(--text-tertiary);">Analyzing job market skills...</span>';

  const gapPills = (skill.emerging_gap_skills || []).slice(0, 2).map(g => `
    <span class="peo-tag-pill" style="border:1px solid rgba(217,119,6,0.25);color:#D97706;background:rgba(245,158,11,0.06);">
      ${g.skill}
    </span>
  `).join('') || '<span style="font-size:0.7rem;color:var(--text-tertiary);">Curriculum aligned with postings</span>';

  return `
    <div class="peo-triad-grid">
      <!-- PEO 1: Employment Alignment -->
      <div class="peo-triad-card">
        <div>
          <div class="peo-triad-card__top">
            <span class="peo-triad-card__code">${icon('briefcase', 14)} PEO 1</span>
            <span class="peo-triad-card__badge ${getBadgeClass(peo1.status)}">${peo1.status}</span>
          </div>

          <h3 class="peo-triad-title">Employment Alignment</h3>

          <div class="peo-gauge-section">
            ${renderRadialGauge(peo1.attainment_pct, 90, 8, c1Color)}
            <div class="peo-gauge-meta">
              <div class="peo-gauge-score">
                ${peo1.avg_score} <span class="peo-gauge-score-sub">/ 5.00 Rating</span>
              </div>
              <div style="font-size:0.75rem;color:var(--text-secondary);">
                Target Benchmark: <strong>${peo1.target_benchmark}%</strong>
              </div>
              ${renderDeltaTag(peo1.attainment_pct, peo1.target_benchmark)}
            </div>
          </div>

          <p class="peo-triad-question">
            &ldquo;What percentage of graduates are working in jobs that align with their degree's educational objectives?&rdquo;
          </p>

          <div class="peo-submetrics-list">
            <div class="peo-submetric-row">
              <span class="peo-submetric-label">${icon('checkCircle', 12)} Core IT Degree Roles</span>
              <span class="peo-submetric-val" style="color:#005930">${align.aligned_count || 0} (${align.rate || 0}%)</span>
            </div>
            <div class="peo-submetric-row">
              <span class="peo-submetric-label">${icon('alertCircle', 12)} Non-IT / Adjacent Field</span>
              <span class="peo-submetric-val">${(align.adjacent_count || 0) + (align.unrelated_count || 0)}</span>
            </div>
            <div style="font-size:0.68rem;font-weight:600;color:var(--text-tertiary);text-transform:uppercase;margin-top:4px;">
              Top Employment Sectors:
            </div>
            ${topSectors}
          </div>
        </div>

        <div class="peo-meter-wrap">
          <div class="peo-meter-header">
            <span style="font-weight:600;color:var(--text-primary);">${peo1.alumni_meeting_benchmark} / ${peo1.alumni_assessed} Met Standard</span>
            <span class="peo-meter-bench">${peo1.meeting_benchmark_pct}% Compliance</span>
          </div>
          <div class="peo-meter-track">
            <div class="peo-meter-target-line" style="left:${peo1.target_benchmark}%" title="Target Benchmark (${peo1.target_benchmark}%)"></div>
            <div class="peo-meter-fill" style="width:${Math.min(100, peo1.attainment_pct)}%;background:${c1Color}"></div>
          </div>
        </div>
      </div>

      <!-- PEO 2: Career Progression -->
      <div class="peo-triad-card">
        <div>
          <div class="peo-triad-card__top">
            <span class="peo-triad-card__code">${icon('trendingUp', 14)} PEO 2</span>
            <span class="peo-triad-card__badge ${getBadgeClass(peo2.status)}">${peo2.status}</span>
          </div>

          <h3 class="peo-triad-title">Career Progression</h3>

          <div class="peo-gauge-section">
            ${renderRadialGauge(peo2.attainment_pct, 90, 8, c2Color)}
            <div class="peo-gauge-meta">
              <div class="peo-gauge-score">
                ${peo2.avg_score} <span class="peo-gauge-score-sub">/ 5.00 Rating</span>
              </div>
              <div style="font-size:0.75rem;color:var(--text-secondary);">
                Target Benchmark: <strong>${peo2.target_benchmark}%</strong>
              </div>
              ${renderDeltaTag(peo2.attainment_pct, peo2.target_benchmark)}
            </div>
          </div>

          <p class="peo-triad-question">
            &ldquo;Are alumni achieving leadership roles, starting businesses, or passing board exams within 3–5 years of graduating?&rdquo;
          </p>

          <div class="peo-submetrics-list">
            <div class="peo-submetric-row">
              <span class="peo-submetric-label">${icon('award', 12)} Senior &amp; Leadership Roles</span>
              <span class="peo-submetric-val">${prog.leadership_count || 0} (${prog.leadership_rate || 0}%)</span>
            </div>
            <div class="peo-submetric-row">
              <span class="peo-submetric-label">${icon('fileText', 12)} Industry &amp; Board Credentials</span>
              <span class="peo-submetric-val">${prog.certification_count || 0} (${prog.certification_rate || 0}%)</span>
            </div>
            <div class="peo-submetric-row">
              <span class="peo-submetric-label">${icon('zap', 12)} Founders &amp; Entrepreneurs</span>
              <span class="peo-submetric-val">${prog.entrepreneurship_count || 0} (${prog.entrepreneurship_rate || 0}%)</span>
            </div>
            <div class="peo-submetric-row">
              <span class="peo-submetric-label">${icon('bookOpen', 12)} Post-Graduate Studies</span>
              <span class="peo-submetric-val">${prog.postgrad_count || 0} (${prog.postgrad_rate || 0}%)</span>
            </div>
          </div>
        </div>

        <div class="peo-meter-wrap">
          <div class="peo-meter-header">
            <span style="font-weight:600;color:var(--text-primary);">${peo2.alumni_meeting_benchmark} / ${peo2.alumni_assessed} Met Standard</span>
            <span class="peo-meter-bench">${peo2.meeting_benchmark_pct}% Compliance</span>
          </div>
          <div class="peo-meter-track">
            <div class="peo-meter-target-line" style="left:${peo2.target_benchmark}%" title="Target Benchmark (${peo2.target_benchmark}%)"></div>
            <div class="peo-meter-fill" style="width:${Math.min(100, peo2.attainment_pct)}%;background:${c2Color}"></div>
          </div>
        </div>
      </div>

      <!-- PEO 3: Skill Relevancy -->
      <div class="peo-triad-card">
        <div>
          <div class="peo-triad-card__top">
            <span class="peo-triad-card__code">${icon('target', 14)} PEO 3</span>
            <span class="peo-triad-card__badge ${getBadgeClass(peo3.status)}">${peo3.status}</span>
          </div>

          <h3 class="peo-triad-title">Skill Relevancy</h3>

          <div class="peo-gauge-section">
            ${renderRadialGauge(peo3.attainment_pct, 90, 8, c3Color)}
            <div class="peo-gauge-meta">
              <div class="peo-gauge-score">
                ${peo3.avg_score} <span class="peo-gauge-score-sub">/ 5.00 Rating</span>
              </div>
              <div style="font-size:0.75rem;color:var(--text-secondary);">
                Target Benchmark: <strong>${peo3.target_benchmark}%</strong>
              </div>
              ${renderDeltaTag(peo3.attainment_pct, peo3.target_benchmark)}
            </div>
          </div>

          <p class="peo-triad-question">
            &ldquo;How well did the academic program prepare them for the industry's actual requirements?&rdquo;
          </p>

          <div class="peo-submetrics-list">
            <div class="peo-submetric-row">
              <span class="peo-submetric-label">${icon('cpu', 12)} Employer Postings Coverage</span>
              <span class="peo-submetric-val" style="color:#005930">${skill.relevancy_score || 0}%</span>
            </div>
            <div style="margin-top:4px;">
              <div style="font-size:0.68rem;font-weight:600;color:var(--text-tertiary);text-transform:uppercase;margin-bottom:4px;">
                Verified Curriculum Strengths:
              </div>
              <div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px;">
                ${strengthsPills}
              </div>
            </div>
            <div>
              <div style="font-size:0.68rem;font-weight:600;color:var(--text-tertiary);text-transform:uppercase;margin-bottom:4px;">
                Emerging Market Skills:
              </div>
              <div style="display:flex;flex-wrap:wrap;gap:4px;">
                ${gapPills}
              </div>
            </div>
          </div>
        </div>

        <div class="peo-meter-wrap">
          <div class="peo-meter-header">
            <span style="font-weight:600;color:var(--text-primary);">${peo3.alumni_meeting_benchmark} / ${peo3.alumni_assessed} Met Standard</span>
            <span class="peo-meter-bench">${peo3.meeting_benchmark_pct}% Compliance</span>
          </div>
          <div class="peo-meter-track">
            <div class="peo-meter-target-line" style="left:${peo3.target_benchmark}%" title="Target Benchmark (${peo3.target_benchmark}%)"></div>
            <div class="peo-meter-fill" style="width:${Math.min(100, peo3.attainment_pct)}%;background:${c3Color}"></div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderCqiInsights(peoData) {
  const strengthsHtml = (peoData.strengths || []).map(s => `
    <li class="peo-insight-item">
      <span style="color:#005930">${icon('checkCircle', 14)}</span>
      <span>${s}</span>
    </li>
  `).join('') || `<li class="peo-insight-item"><span>Collating baseline accreditation telemetry.</span></li>`;

  const interventionsHtml = (peoData.interventions || []).map(item => `
    <li class="peo-insight-item">
      <span style="color:#D97706">${icon('alertTriangle', 14)}</span>
      <span>${item}</span>
    </li>
  `).join('') || `<li class="peo-insight-item"><span style="color:#005930">${icon('check', 14)} All 3 Program Educational Objectives meet or exceed CHED/PACUCOA target benchmarks.</span></li>`;

  return `
    <div class="peo-insights-box">
      <div class="peo-insight-col">
        <h4 style="color:#005930">${icon('award', 16)} Program Strengths (Accreditation Ready)</h4>
        <ul class="peo-insight-list">
          ${strengthsHtml}
        </ul>
      </div>
      <div class="peo-insight-col">
        <h4 style="color:#D97706">${icon('trendingUp', 16)} Continuous Quality Improvement (CQI Action Plan)</h4>
        <ul class="peo-insight-list">
          ${interventionsHtml}
        </ul>
      </div>
    </div>
  `;
}

/* ─────────────────────────────────────────────────────────────
   PAGINATED ALUMNI EVALUATION MATRIX TABLE & MODAL
   ───────────────────────────────────────────────────────────── */
let _tableSearch = '';
let _tablePage = 0;
let _tablePageSize = 10;
let _tableStatusFilter = '';

function renderAlumniMatrixTable(drilldown) {
  const list = drilldown || [];

  const filtered = list.filter(a => {
    if (_tableSearch) {
      const q = _tableSearch.toLowerCase();
      const matchName = (a.name || '').toLowerCase().includes(q);
      const matchRole = (a.current_role || '').toLowerCase().includes(q);
      const matchEmp  = (a.employer || '').toLowerCase().includes(q);
      const matchSec  = (a.section || '').toLowerCase().includes(q);
      if (!matchName && !matchRole && !matchEmp && !matchSec) return false;
    }

    if (_tableStatusFilter) {
      const p1Met = a.peo_scores['PEO 1']?.is_met;
      const p2Met = a.peo_scores['PEO 2']?.is_met;
      const p3Met = a.peo_scores['PEO 3']?.is_met;
      const metCount = (p1Met ? 1 : 0) + (p2Met ? 1 : 0) + (p3Met ? 1 : 0);

      if (_tableStatusFilter === 'good' && metCount < 3) return false;
      if (_tableStatusFilter === 'mid'  && (metCount === 3 || metCount === 0)) return false;
      if (_tableStatusFilter === 'low'  && metCount > 0) return false;
    }

    return true;
  });

  const totalCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / _tablePageSize));
  if (_tablePage >= totalPages) _tablePage = totalPages - 1;
  if (_tablePage < 0) _tablePage = 0;

  const startIdx = _tablePage * _tablePageSize;
  const endIdx = Math.min(startIdx + _tablePageSize, totalCount);
  const pageItems = filtered.slice(startIdx, endIdx);

  const rowsHtml = pageItems.map((a, idx) => {
    const p1 = a.peo_scores['PEO 1'] || { score: '—', is_met: false, evidence: '' };
    const p2 = a.peo_scores['PEO 2'] || { score: '—', is_met: false, evidence: '' };
    const p3 = a.peo_scores['PEO 3'] || { score: '—', is_met: false, evidence: '' };

    const metCount = (p1.is_met ? 1 : 0) + (p2.is_met ? 1 : 0) + (p3.is_met ? 1 : 0);
    const overallBadge = metCount === 3
      ? `<span class="badge" style="background:rgba(0,89,48,0.1);color:#005930;font-weight:600;font-size:0.68rem;">3/3 Achieved</span>`
      : (metCount >= 1
        ? `<span class="badge" style="background:rgba(245,158,11,0.12);color:#D97706;font-weight:600;font-size:0.68rem;">${metCount}/3 Progressing</span>`
        : `<span class="badge" style="background:rgba(239,68,68,0.12);color:#EF4444;font-weight:600;font-size:0.68rem;">Under Review</span>`);

    return `
      <tr class="an-tbl-row">
        <td class="an-tbl-td an-tbl-td--num">${startIdx + idx + 1}</td>
        <td class="an-tbl-td">
          <div class="an-tbl-name">
            <div class="an-tbl-avatar">${(a.name || 'Alum').split(' ').map(w => w[0]).slice(0, 2).join('')}</div>
            <div>
              <div style="font-weight:600;color:var(--text-primary);">${a.name}</div>
              <div style="font-size:0.68rem;color:var(--text-tertiary);">${a.current_role} &middot; <strong>${a.employer}</strong></div>
            </div>
          </div>
        </td>
        <td class="an-tbl-td"><span class="an-tbl-section">${a.batch}</span></td>
        <td class="an-tbl-td"><span class="an-tbl-section">Sec ${a.section}</span></td>
        <td class="an-tbl-td">
          <span class="peo-alumni-cell-score ${p1.is_met ? 'peo-alumni-cell-score--met' : 'peo-alumni-cell-score--unmet'}" title="${p1.evidence || ''}">
            ${p1.score} ${p1.is_met ? icon('check', 11) : ''}
          </span>
        </td>
        <td class="an-tbl-td">
          <span class="peo-alumni-cell-score ${p2.is_met ? 'peo-alumni-cell-score--met' : 'peo-alumni-cell-score--unmet'}" title="${p2.evidence || ''}">
            ${p2.score} ${p2.is_met ? icon('check', 11) : ''}
          </span>
        </td>
        <td class="an-tbl-td">
          <span class="peo-alumni-cell-score ${p3.is_met ? 'peo-alumni-cell-score--met' : 'peo-alumni-cell-score--unmet'}" title="${p3.evidence || ''}">
            ${p3.score} ${p3.is_met ? icon('check', 11) : ''}
          </span>
        </td>
        <td class="an-tbl-td">${overallBadge}</td>
        <td class="an-tbl-td" style="text-align:right;">
          <button class="btn btn--outline btn--sm btn-inspect-alumni" data-alumni-id="${a.id}" style="padding:4px 8px;font-size:0.7rem;display:inline-flex;align-items:center;gap:4px;">
            ${icon('eye', 12)} Evidence
          </button>
        </td>
      </tr>
    `;
  }).join('');

  const pageButtons = [];
  const maxButtons = 5;
  let startPage = Math.max(0, _tablePage - Math.floor(maxButtons / 2));
  let endPage = Math.min(totalPages, startPage + maxButtons);
  if (endPage - startPage < maxButtons) {
    startPage = Math.max(0, endPage - maxButtons);
  }

  for (let p = startPage; p < endPage; p++) {
    pageButtons.push(`
      <button class="peo-pg-btn ${p === _tablePage ? 'peo-pg-btn--active' : ''}" data-page="${p}">
        ${p + 1}
      </button>
    `);
  }

  return `
    <div class="peo-table-card" id="peo-matrix-container">
      <div class="peo-table-toolbar">
        <div class="peo-table-title">
          ${icon('clipboardCheck', 16)} Individual Graduate PEO Evaluation Matrix
          <span class="badge badge--neutral" style="font-size:0.7rem;margin-left:6px;">${totalCount} In Cohort</span>
        </div>
        <div class="peo-table-actions">
          <div class="peo-search-box" style="min-width:200px;">
            ${icon('search', 13)}
            <input type="text" id="alumni-table-search" class="peo-search-input"
              placeholder="Search graduate name, employer, role..." value="${_tableSearch.replace(/"/g, '&quot;')}" />
          </div>
          <select id="alumni-page-size" class="peo-filter-select" style="padding:5px 24px 5px 8px;">
            <option value="10" ${_tablePageSize === 10 ? 'selected' : ''}>10 per page</option>
            <option value="25" ${_tablePageSize === 25 ? 'selected' : ''}>25 per page</option>
            <option value="50" ${_tablePageSize === 50 ? 'selected' : ''}>50 per page</option>
          </select>
        </div>
      </div>

      <div class="an-tbl-wrap">
        <table class="an-tbl">
          <thead>
            <tr>
              <th class="an-tbl-th an-tbl-th--num">#</th>
              <th class="an-tbl-th">Graduate &amp; Verified Role</th>
              <th class="an-tbl-th">Batch</th>
              <th class="an-tbl-th">Section</th>
              <th class="an-tbl-th" title="PEO 1: Degree Employment Alignment">PEO 1 Alignment</th>
              <th class="an-tbl-th" title="PEO 2: Career Mobility, Leadership & Certifications">PEO 2 Progression</th>
              <th class="an-tbl-th" title="PEO 3: Industry Skill & Project Relevancy">PEO 3 Relevancy</th>
              <th class="an-tbl-th">Accreditation Status</th>
              <th class="an-tbl-th" style="text-align:right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml || `<tr><td colspan="9" style="text-align:center;padding:32px;color:var(--text-secondary);">No graduates match the active filter and search query.</td></tr>`}
          </tbody>
        </table>
      </div>

      <div class="peo-pagination">
        <div class="peo-pagination-info">
          ${totalCount > 0
            ? `Showing <strong>${startIdx + 1}–${endIdx}</strong> of <strong>${totalCount}</strong> graduates`
            : 'No matching records'}
        </div>
        <div class="peo-pagination-btns">
          <button class="peo-pg-btn" id="btn-pg-prev" ${_tablePage === 0 ? 'disabled' : ''} title="Previous Page">
            ${icon('chevronLeft', 13)}
          </button>
          ${pageButtons.join('')}
          <button class="peo-pg-btn" id="btn-pg-next" ${_tablePage >= totalPages - 1 ? 'disabled' : ''} title="Next Page">
            ${icon('chevronRight', 13)}
          </button>
        </div>
      </div>
    </div>
  `;
}

function openEvidenceModal(alumni) {
  let modal = document.getElementById('peo-evidence-modal');
  if (modal) modal.remove();

  modal = document.createElement('div');
  modal.id = 'peo-evidence-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.55);display:flex;align-items:center;justify-content:center;z-index:9999;padding:16px;backdrop-filter:blur(2px);';

  const p1 = alumni.peo_scores['PEO 1'] || {};
  const p2 = alumni.peo_scores['PEO 2'] || {};
  const p3 = alumni.peo_scores['PEO 3'] || {};

  modal.innerHTML = `
    <div style="background:var(--bg-elevated);border-radius:var(--radius-2xl);max-width:620px;width:100%;max-height:90vh;display:flex;flex-direction:column;box-shadow:var(--shadow-xl);border:1px solid var(--border-default);overflow:hidden;">
      <div style="padding:var(--space-4) var(--space-5);border-bottom:1px solid var(--border-default);display:flex;justify-content:space-between;align-items:center;">
        <div>
          <h3 style="font-size:var(--text-base);font-weight:700;color:var(--text-primary);margin:0;">
            ${alumni.name}
          </h3>
          <p style="font-size:var(--text-xs);color:var(--text-secondary);margin:2px 0 0 0;">
            Batch ${alumni.batch} &middot; Section ${alumni.section} &middot; ${alumni.course}
          </p>
        </div>
        <button id="modal-close-btn" style="background:none;border:none;cursor:pointer;color:var(--text-tertiary);">${icon('x', 20)}</button>
      </div>

      <div style="padding:var(--space-5);overflow-y:auto;display:flex;flex-direction:column;gap:var(--space-4);">
        <div style="background:var(--bg-secondary);padding:var(--space-3) var(--space-4);border-radius:var(--radius-lg);border:1px solid var(--border-default);">
          <div style="font-size:0.72rem;font-weight:600;color:var(--text-tertiary);text-transform:uppercase;">Current Position</div>
          <div style="font-size:0.88rem;font-weight:700;color:var(--text-primary);margin-top:2px;">${alumni.current_role}</div>
          <div style="font-size:0.75rem;color:var(--text-secondary);">${alumni.employer}</div>
        </div>

        <div style="border:1px solid var(--border-default);border-radius:var(--radius-lg);padding:var(--space-4);">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
            <span style="font-weight:700;font-size:0.8rem;color:var(--color-primary);">PEO 1: Employment Alignment</span>
            <span class="peo-alumni-cell-score ${p1.is_met ? 'peo-alumni-cell-score--met' : 'peo-alumni-cell-score--unmet'}">
              Score: ${p1.score || 0} / 5.00 ${p1.is_met ? '(Met Target)' : '(Approaching)'}
            </span>
          </div>
          <p style="font-size:0.74rem;color:var(--text-secondary);line-height:1.4;margin:0;">
            ${p1.evidence || 'Evaluated based on post-graduation IT industry role and taxonomy match.'}
          </p>
        </div>

        <div style="border:1px solid var(--border-default);border-radius:var(--radius-lg);padding:var(--space-4);">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
            <span style="font-weight:700;font-size:0.8rem;color:var(--color-primary);">PEO 2: Career Progression</span>
            <span class="peo-alumni-cell-score ${p2.is_met ? 'peo-alumni-cell-score--met' : 'peo-alumni-cell-score--unmet'}">
              Score: ${p2.score || 0} / 5.00 ${p2.is_met ? '(Met Target)' : '(Approaching)'}
            </span>
          </div>
          <p style="font-size:0.74rem;color:var(--text-secondary);line-height:1.4;margin:0;">
            ${p2.evidence || 'Evaluated based on 3-5 year leadership mobility, board examinations, and achievements.'}
          </p>
        </div>

        <div style="border:1px solid var(--border-default);border-radius:var(--radius-lg);padding:var(--space-4);">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
            <span style="font-weight:700;font-size:0.8rem;color:var(--color-primary);">PEO 3: Skill Relevancy</span>
            <span class="peo-alumni-cell-score ${p3.is_met ? 'peo-alumni-cell-score--met' : 'peo-alumni-cell-score--unmet'}">
              Score: ${p3.score || 0} / 5.00 ${p3.is_met ? '(Met Target)' : '(Approaching)'}
            </span>
          </div>
          <p style="font-size:0.74rem;color:var(--text-secondary);line-height:1.4;margin:0;">
            ${p3.evidence || 'Evaluated based on candidate portfolio technical competencies matched against active employer job requirements.'}
          </p>
        </div>
      </div>

      <div style="padding:var(--space-3) var(--space-5);border-top:1px solid var(--border-default);display:flex;justify-content:flex-end;background:var(--bg-primary);">
        <button class="btn btn--secondary btn--sm" id="modal-ok-btn">Close</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  renderIcons();

  const close = () => modal.remove();
  modal.querySelector('#modal-close-btn')?.addEventListener('click', close);
  modal.querySelector('#modal-ok-btn')?.addEventListener('click', close);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });
}

function refreshTableView(container, drilldown) {
  const tableContainer = container.querySelector('#peo-matrix-container');
  if (tableContainer) {
    const tmp = document.createElement('div');
    tmp.innerHTML = renderAlumniMatrixTable(drilldown);
    tableContainer.replaceWith(tmp.firstElementChild);
    setupTableEvents(container, drilldown);
    renderIcons();
  }
}

function setupTableEvents(container, drilldown) {
  const searchInput = container.querySelector('#alumni-table-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      _tableSearch = e.target.value.trim();
      _tablePage = 0;
      refreshTableView(container, drilldown);
    });
  }

  const pageSizeSelect = container.querySelector('#alumni-page-size');
  if (pageSizeSelect) {
    pageSizeSelect.addEventListener('change', (e) => {
      _tablePageSize = parseInt(e.target.value, 10);
      _tablePage = 0;
      refreshTableView(container, drilldown);
    });
  }

  container.querySelector('#btn-pg-prev')?.addEventListener('click', () => {
    if (_tablePage > 0) {
      _tablePage--;
      refreshTableView(container, drilldown);
    }
  });

  container.querySelector('#btn-pg-next')?.addEventListener('click', () => {
    _tablePage++;
    refreshTableView(container, drilldown);
  });

  container.querySelectorAll('.peo-pg-btn[data-page]').forEach(btn => {
    btn.addEventListener('click', () => {
      _tablePage = parseInt(btn.dataset.page, 10);
      refreshTableView(container, drilldown);
    });
  });

  container.querySelectorAll('.btn-inspect-alumni').forEach(btn => {
    btn.addEventListener('click', () => {
      const alumniId = parseInt(btn.dataset.alumniId, 10);
      const target = drilldown.find(a => a.id === alumniId);
      if (target) {
        openEvidenceModal(target);
      }
    });
  });
}

/* ─────────────────────────────────────────────────────────────
   PAGE RENDERER (CAREER PATH & BATCH TRENDS + REDESIGNED 3 PEO)
   ───────────────────────────────────────────────────────────── */
let _currentTab = 'peo'; // 'peo' | 'career'

function renderAnalytics(container, batches, overall, peoData, onImportSuccess, onPeoFilterChange) {
  const available = peoData?.available_filters || {};
  const batchList   = available.batches || [];
  const sectionList = available.sections || [];
  const courseList  = available.courses || [];

  const curBatch   = peoData?.filter?.batch !== 'All Batches' ? (peoData?.filter?.batch || '') : '';
  const curSection = peoData?.filter?.section !== 'All Sections' ? (peoData?.filter?.section || '') : '';
  const curCourse  = peoData?.filter?.course !== 'All Programs' ? (peoData?.filter?.course || '') : '';

  const activeChips = [];
  if (curBatch) activeChips.push(`<span class="peo-filter-chip">Batch: ${curBatch} <span class="peo-filter-chip__clear" data-clear="batch">&times;</span></span>`);
  if (curSection) activeChips.push(`<span class="peo-filter-chip">Section: ${curSection} <span class="peo-filter-chip__clear" data-clear="section">&times;</span></span>`);
  if (curCourse) activeChips.push(`<span class="peo-filter-chip">Course: ${curCourse} <span class="peo-filter-chip__clear" data-clear="course">&times;</span></span>`);
  if (_tableStatusFilter) {
    const statusLabels = { good: 'Achieved (≥70%)', mid: 'Approaching (50-69%)', low: 'Needs Intervention (<50%)' };
    activeChips.push(`<span class="peo-filter-chip">Benchmark: ${statusLabels[_tableStatusFilter] || _tableStatusFilter} <span class="peo-filter-chip__clear" data-clear="status">&times;</span></span>`);
  }

  container.innerHTML = `
    <!-- Top Executive Header -->
    <div class="page-header" style="margin-bottom:var(--space-4);">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;">
        <div>
          <h1 class="page-header__title" style="display:flex;align-items:center;gap:10px;">
            ${icon('award', 24)} Alumni Tracker &amp; Outcomes
          </h1>
          <p class="page-header__subtitle">
            Longitudinal graduate outcomes &amp; Program Educational Objectives (PEO) attainment assessment
          </p>
        </div>
        <div style="display:flex;gap:10px;">
          <button class="btn btn--primary btn--sm" id="btn-batch-alumni" style="display:inline-flex;align-items:center;gap:6px;">
            ${icon('upload', 14)} Batch Register Alumni
          </button>
        </div>
      </div>
    </div>

    <!-- Segmented View Tabs (Separating PEO Analytics from Original Career Path) -->
    <div class="peo-view-tabs" id="analytics-tabs" style="margin-bottom:var(--space-5);">
      <button class="peo-tab-btn ${_currentTab === 'peo' ? 'peo-tab-btn--active' : ''}" data-tab="peo">
        ${icon('target', 14)} 3-Pillar PEO Analytics
      </button>
      <button class="peo-tab-btn ${_currentTab === 'career' ? 'peo-tab-btn--active' : ''}" data-tab="career">
        ${icon('briefcase', 14)} Career Path &amp; Batch Trends
      </button>
    </div>

    <!-- Main Dynamic Content Container -->
    <div id="analytics-view-content">
      ${_currentTab === 'peo' ? `
        <!-- Top Cohort & Database Filter Control Center for PEO Analytics -->
        <div class="peo-filter-card">
          <div class="peo-filter-row-top">
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="font-weight:700;font-size:var(--text-xs);text-transform:uppercase;color:var(--text-secondary);letter-spacing:0.05em;">
                ${icon('filter', 13)} PEO Cohort Filters
              </span>
            </div>
            <div class="peo-filter-controls">
              <select class="peo-filter-select" id="peo-filter-course" title="Filter by Course">
                <option value="">All Programs / Courses</option>
                ${courseList.map(c => `<option value="${c}" ${curCourse === c ? 'selected' : ''}>${c}</option>`).join('')}
              </select>
              <select class="peo-filter-select" id="peo-filter-batch" title="Filter by Batch">
                <option value="">All Batches</option>
                ${batchList.map(b => `<option value="${b}" ${curBatch === b ? 'selected' : ''}>Batch ${b}</option>`).join('')}
              </select>
              <select class="peo-filter-select" id="peo-filter-section" title="Filter by Section">
                <option value="">All Sections</option>
                ${sectionList.map(s => `<option value="${s}" ${curSection === s ? 'selected' : ''}>Section ${s}</option>`).join('')}
              </select>
              <select class="peo-filter-select" id="peo-filter-status" title="Filter by Benchmark Compliance">
                <option value="" ${_tableStatusFilter === '' ? 'selected' : ''}>All Attainment Levels</option>
                <option value="good" ${_tableStatusFilter === 'good' ? 'selected' : ''}>Achieved (≥70%)</option>
                <option value="mid" ${_tableStatusFilter === 'mid' ? 'selected' : ''}>Approaching (50-69%)</option>
                <option value="low" ${_tableStatusFilter === 'low' ? 'selected' : ''}>Needs Intervention (&lt;50%)</option>
              </select>
              <button class="btn btn--outline btn--sm" id="btn-peo-reset-filters" style="padding:6px 10px;font-size:0.75rem;">
                ${icon('refreshCw', 12)} Reset
              </button>
            </div>
          </div>

          <div class="peo-filter-row-bottom">
            <div class="peo-filter-summary">
              <span>Active Scope: <strong>${peoData?.total_alumni || (peoData?.alumni_drilldown || []).length}</strong> Registered Graduate${peoData?.total_alumni !== 1 ? 's' : ''}</span>
              ${activeChips.length ? activeChips.join('') : '<span style="color:var(--text-tertiary);font-size:0.72rem;">(Unfiltered Institutional Overview)</span>'}
            </div>
            <div style="font-size:0.72rem;color:var(--text-tertiary);">
              Database-driven PEO tracer filters
            </div>
          </div>
        </div>

        <!-- 3 PEO Core Accreditation Triad Grid (Replacing Spider Graph) -->
        ${renderPeoTriad(peoData)}

        <!-- CQI Accreditation Insights -->
        ${renderCqiInsights(peoData)}

        <!-- Paginated Graduate Evaluation Table -->
        ${renderAlumniMatrixTable(peoData?.alumni_drilldown || [])}
      ` : renderCareerView(batches, overall)}
    </div>
  `;

  renderIcons();

  // Batch register modal
  container.querySelector('#btn-batch-alumni')?.addEventListener('click', () => {
    openAlumniImportModal(() => {
      if (typeof onImportSuccess === 'function') onImportSuccess();
    });
  });

  // Tab switcher
  container.querySelector('#analytics-tabs')?.addEventListener('click', (e) => {
    const btn = e.target.closest('.peo-tab-btn');
    if (!btn) return;
    _currentTab = btn.dataset.tab;
    container.querySelectorAll('.peo-tab-btn').forEach(b => b.classList.remove('peo-tab-btn--active'));
    btn.classList.add('peo-tab-btn--active');

    const viewWrap = container.querySelector('#analytics-view-content');
    if (_currentTab === 'peo') {
      viewWrap.innerHTML = `
        <div class="peo-filter-card">
          <div class="peo-filter-row-top">
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="font-weight:700;font-size:var(--text-xs);text-transform:uppercase;color:var(--text-secondary);letter-spacing:0.05em;">
                ${icon('filter', 13)} PEO Cohort Filters
              </span>
            </div>
            <div class="peo-filter-controls">
              <select class="peo-filter-select" id="peo-filter-course" title="Filter by Course">
                <option value="">All Programs / Courses</option>
                ${courseList.map(c => `<option value="${c}" ${curCourse === c ? 'selected' : ''}>${c}</option>`).join('')}
              </select>
              <select class="peo-filter-select" id="peo-filter-batch" title="Filter by Batch">
                <option value="">All Batches</option>
                ${batchList.map(b => `<option value="${b}" ${curBatch === b ? 'selected' : ''}>Batch ${b}</option>`).join('')}
              </select>
              <select class="peo-filter-select" id="peo-filter-section" title="Filter by Section">
                <option value="">All Sections</option>
                ${sectionList.map(s => `<option value="${s}" ${curSection === s ? 'selected' : ''}>Section ${s}</option>`).join('')}
              </select>
              <select class="peo-filter-select" id="peo-filter-status" title="Filter by Benchmark Compliance">
                <option value="" ${_tableStatusFilter === '' ? 'selected' : ''}>All Attainment Levels</option>
                <option value="good" ${_tableStatusFilter === 'good' ? 'selected' : ''}>Achieved (≥70%)</option>
                <option value="mid" ${_tableStatusFilter === 'mid' ? 'selected' : ''}>Approaching (50-69%)</option>
                <option value="low" ${_tableStatusFilter === 'low' ? 'selected' : ''}>Needs Intervention (&lt;50%)</option>
              </select>
              <button class="btn btn--outline btn--sm" id="btn-peo-reset-filters" style="padding:6px 10px;font-size:0.75rem;">
                ${icon('refreshCw', 12)} Reset
              </button>
            </div>
          </div>

          <div class="peo-filter-row-bottom">
            <div class="peo-filter-summary">
              <span>Active Scope: <strong>${peoData?.total_alumni || (peoData?.alumni_drilldown || []).length}</strong> Registered Graduate${peoData?.total_alumni !== 1 ? 's' : ''}</span>
              ${activeChips.length ? activeChips.join('') : '<span style="color:var(--text-tertiary);font-size:0.72rem;">(Unfiltered Institutional Overview)</span>'}
            </div>
            <div style="font-size:0.72rem;color:var(--text-tertiary);">
              Database-driven PEO tracer filters
            </div>
          </div>
        </div>

        ${renderPeoTriad(peoData)}
        ${renderCqiInsights(peoData)}
        ${renderAlumniMatrixTable(peoData?.alumni_drilldown || [])}
      `;
      setupPeoListeners(container, peoData, onPeoFilterChange);
    } else {
      viewWrap.innerHTML = renderCareerView(batches, overall);
      setupCareerViewListeners(container, batches);
    }
    renderIcons();
  });

  if (_currentTab === 'peo') {
    setupPeoListeners(container, peoData, onPeoFilterChange);
  } else {
    setupCareerViewListeners(container, batches);
  }
}

function setupPeoListeners(container, peoData, onPeoFilterChange) {
  function triggerPeoFilter() {
    const batchVal   = container.querySelector('#peo-filter-batch')?.value || '';
    const sectionVal = container.querySelector('#peo-filter-section')?.value || '';
    const courseVal  = container.querySelector('#peo-filter-course')?.value || '';
    const statusVal  = container.querySelector('#peo-filter-status')?.value || '';

    _tableStatusFilter = statusVal;
    _tablePage = 0;

    if (typeof onPeoFilterChange === 'function') {
      onPeoFilterChange({
        batch: batchVal,
        section: sectionVal,
        course: courseVal,
      });
    }
  }

  container.querySelector('#peo-filter-batch')?.addEventListener('change', triggerPeoFilter);
  container.querySelector('#peo-filter-section')?.addEventListener('change', triggerPeoFilter);
  container.querySelector('#peo-filter-course')?.addEventListener('change', triggerPeoFilter);
  container.querySelector('#peo-filter-status')?.addEventListener('change', () => {
    _tableStatusFilter = container.querySelector('#peo-filter-status')?.value || '';
    _tablePage = 0;
    refreshTableView(container, peoData?.alumni_drilldown || []);
  });

  container.querySelector('#btn-peo-reset-filters')?.addEventListener('click', () => {
    _tableSearch = '';
    _tableStatusFilter = '';
    _tablePage = 0;
    if (typeof onPeoFilterChange === 'function') {
      onPeoFilterChange({ batch: '', section: '', course: '' });
    }
  });

  container.querySelectorAll('.peo-filter-chip__clear').forEach(chip => {
    chip.addEventListener('click', () => {
      const type = chip.dataset.clear;
      if (type === 'batch') container.querySelector('#peo-filter-batch').value = '';
      if (type === 'section') container.querySelector('#peo-filter-section').value = '';
      if (type === 'course') container.querySelector('#peo-filter-course').value = '';
      if (type === 'status') {
        _tableStatusFilter = '';
        if (container.querySelector('#peo-filter-status')) {
          container.querySelector('#peo-filter-status').value = '';
        }
      }
      triggerPeoFilter();
    });
  });

  setupTableEvents(container, peoData?.alumni_drilldown || []);
}

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE EXPORT & CONTROLLER
   ───────────────────────────────────────────────────────────── */
export default function AnalyticsPage(container) {
  let activePeoFilters = { batch: '', section: '', course: '' };
  let currentBatches = [];
  let currentOverall = { totalAlumni: 0, inPath: 0, batchCount: 0, avgRate: 0 };
  let currentPeoData = null;

  const cached = getCached('/admin/alumni-analytics');

  if (cached?.data?.batches) {
    currentBatches = cached.data.batches;
    currentOverall = cached.data.overall;
    currentPeoData = cached.data.peo;
    renderAnalytics(
      container,
      currentBatches,
      currentOverall,
      currentPeoData,
      () => load(true),
      (newFilters) => {
        activePeoFilters = newFilters;
        loadPeoOnly();
      }
    );
  } else {
    container.innerHTML = `
      <div class="page-header">
        <h1 class="page-header__title" style="display:flex;align-items:center;gap:10px;">
          ${icon('award', 24)} Alumni Tracker &amp; Outcomes
        </h1>
        <p class="page-header__subtitle">Loading graduate outcomes and analytics...</p>
      </div>
      <div style="display:flex;align-items:center;gap:10px;padding:48px 24px;color:var(--text-secondary)">
        ${icon('loader', 20)} Loading analytics data...
      </div>`;
    renderIcons();
  }

  // Load initial data
  async function load(force = false) {
    try {
      const data = await apiGetCached('/admin/alumni-analytics', {
        force,
        onUpdate: (fresh) => {
          if (!container.isConnected) return;
          if (fresh?.batches) {
            currentBatches = fresh.batches;
            currentOverall = fresh.overall;
            currentPeoData = fresh.peo;
            renderAnalytics(
              container,
              currentBatches,
              currentOverall,
              currentPeoData,
              () => load(true),
              (newFilters) => {
                activePeoFilters = newFilters;
                loadPeoOnly();
              }
            );
          }
        },
      });

      if (data?.batches && !cached) {
        currentBatches = data.batches;
        currentOverall = data.overall;
        currentPeoData = data.peo;
        renderAnalytics(
          container,
          currentBatches,
          currentOverall,
          currentPeoData,
          () => load(true),
          (newFilters) => {
            activePeoFilters = newFilters;
            loadPeoOnly();
          }
        );
      }
    } catch (_err) {
      if (!cached) {
        container.innerHTML = `
          <div class="page-header">
            <h1 class="page-header__title">${icon('award', 22)} Alumni Tracker</h1>
          </div>
          <div style="display:flex;align-items:center;gap:12px;padding:48px 24px;color:#EF4444">
            ${icon('alertCircle', 20)} Failed to load analytics.
            <button class="btn btn--outline" id="an-retry" style="margin-left:8px">Retry</button>
          </div>`;
        renderIcons();
        container.querySelector('#an-retry')?.addEventListener('click', () => load(true));
      }
    }
  }

  // Load PEO with specific filters without touching Career Path data
  async function loadPeoOnly() {
    try {
      const queryParams = new URLSearchParams();
      if (activePeoFilters.batch)   queryParams.set('batch', activePeoFilters.batch);
      if (activePeoFilters.section) queryParams.set('section', activePeoFilters.section);
      if (activePeoFilters.course)  queryParams.set('course', activePeoFilters.course);

      const url = `/admin/peo-analytics${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      const peoData = await apiGet(url);

      if (peoData) {
        currentPeoData = peoData;
        renderAnalytics(
          container,
          currentBatches,
          currentOverall,
          currentPeoData,
          () => load(true),
          (newFilters) => {
            activePeoFilters = newFilters;
            loadPeoOnly();
          }
        );
      }
    } catch (err) {
      console.error('Failed to update PEO analytics:', err);
    }
  }

  load();
}
