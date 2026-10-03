import { icon, renderIcons } from '../components/icons.js';
import { apiGet, apiGetCached, getCached } from '../api/client.js';
import { openAlumniImportModal } from '../components/alumni-import-modal.js';

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   STATIC DATA  (replace with real API calls later)
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

const BATCHES = [
  {
    id: 'b2021', label: '2021 â€“ 2022', course: 'BSIT', campus: 'Alijis Campus',
    total: 112, inPath: 90, notInPath: 22,
    topRoles: ['Software Developer', 'Web Developer', 'IT Support', 'Systems Analyst', 'Network Engineer'],
    topRoleCounts: [34, 26, 14, 10, 6],
    trend: [38, 52, 67, 78, 84, 90],
    trendLabels: ['2022', '2023', '2024', '2025', '2026 (est.)'],
    notInPathRoles: ['Sales Associate', 'Call Center Agent', 'Admin Staff'],
    notInPathCounts: [9, 8, 5],
    students: [
      { name: 'Jermaine La Marcole', section: 'A', role: 'Full Stack Developer',      employer: 'TikTok',          inPath: true  },
      { name: 'Maria Santos',        section: 'A', role: 'Web Developer',             employer: 'Accenture',       inPath: true  },
      { name: 'Carlo Reyes',         section: 'B', role: 'IT Support Specialist',     employer: 'Concentrix',      inPath: true  },
      { name: 'Ana Villanueva',      section: 'B', role: 'Systems Analyst',           employer: 'BDO Unibank',     inPath: true  },
      { name: 'Ryan Torres',         section: 'C', role: 'Network Engineer',          employer: 'PLDT',            inPath: true  },
      { name: 'Liza Maglalang',      section: 'C', role: 'Frontend Developer',        employer: 'Freelance',       inPath: true  },
      { name: 'Mark Evangelista',    section: 'D', role: 'Software Engineer',         employer: 'Exist Global',    inPath: true  },
      { name: 'Jenny Cruz',          section: 'D', role: 'QA Engineer',               employer: 'Cloudstaff',      inPath: true  },
      { name: 'Paolo Aquino',        section: 'A', role: 'Sales Associate',           employer: 'SM Hypermarket',  inPath: false },
      { name: 'Rose Dela PeÃ±a',      section: 'B', role: 'Call Center Agent',         employer: 'Teleperformance', inPath: false },
      { name: 'Kevin Soriano',       section: 'C', role: 'Admin Staff',               employer: 'City Hall',       inPath: false },
      { name: 'Trisha Hernandez',    section: 'D', role: 'Call Center Agent',         employer: 'Sutherland',      inPath: false },
    ],
  },
  {
    id: 'b2022', label: '2022 â€“ 2023', course: 'BSIT', campus: 'Alijis Campus',
    total: 98, inPath: 71, notInPath: 27,
    topRoles: ['Frontend Developer', 'QA Tester', 'IT Support', 'Database Admin', 'Mobile Dev'],
    topRoleCounts: [22, 18, 15, 10, 6],
    trend: [30, 48, 60, 71],
    trendLabels: ['2023', '2024', '2025', '2026 (est.)'],
    notInPathRoles: ['Call Center Agent', 'Sales Representative', 'Cashier'],
    notInPathCounts: [12, 10, 5],
    students: [
      { name: 'Luis Ferrer',         section: 'A', role: 'Frontend Developer',        employer: 'Freelance',       inPath: true  },
      { name: 'Camille Bautista',    section: 'A', role: 'QA Tester',                 employer: 'TaskUs',          inPath: true  },
      { name: 'Bernard Lim',         section: 'B', role: 'Database Administrator',    employer: 'UnionBank',       inPath: true  },
      { name: 'Patricia Gomez',      section: 'B', role: 'IT Support',                employer: 'SM Group',        inPath: true  },
      { name: 'Jerome Castillo',     section: 'C', role: 'Mobile Developer',          employer: 'Sari-Sari Tech',  inPath: true  },
      { name: 'Alyssa Navarro',      section: 'C', role: 'Call Center Agent',         employer: 'TTEC',            inPath: false },
      { name: 'Francis Padilla',     section: 'D', role: 'Sales Representative',      employer: 'Jollibee Corp',   inPath: false },
      { name: 'Sheila Domingo',      section: 'D', role: 'Cashier',                   employer: 'Robinsons',       inPath: false },
    ],
  },
  {
    id: 'b2023', label: '2023 â€“ 2024', course: 'BSIT', campus: 'Talisay Campus',
    total: 134, inPath: 87, notInPath: 47,
    topRoles: ['Software Engineer', 'IT Support', 'Web Developer', 'Systems Analyst', 'DevOps'],
    topRoleCounts: [30, 24, 18, 9, 6],
    trend: [25, 44, 65, 87],
    trendLabels: ['2024', '2025', '2026 (est.)'],
    notInPathRoles: ['BPO Agent', 'Admin Staff', 'Store Crew'],
    notInPathCounts: [20, 18, 9],
    students: [
      { name: 'Danielle Cruz',       section: 'A', role: 'Software Engineer',         employer: 'Exist Global',    inPath: true  },
      { name: 'Marco Villanueva',    section: 'A', role: 'IT Support',                employer: 'Citco',           inPath: true  },
      { name: 'Sofia Ramos',         section: 'B', role: 'Web Developer',             employer: 'Freelance',       inPath: true  },
      { name: 'Nathan Tan',          section: 'B', role: 'DevOps Engineer',           employer: 'Pointwest Tech',  inPath: true  },
      { name: 'Isabela Morales',     section: 'C', role: 'Systems Analyst',           employer: 'Metrobank',       inPath: true  },
      { name: 'Gian Dela Cruz',      section: 'C', role: 'BPO Agent',                 employer: 'Convergys',       inPath: false },
      { name: 'Carmela Santos',      section: 'D', role: 'Admin Staff',               employer: 'Bacolod City Hall',inPath: false },
      { name: 'Rodel Mercado',       section: 'D', role: 'Store Crew',                employer: 'Puregold',        inPath: false },
    ],
  },
  {
    id: 'b2024', label: '2024 â€“ 2025', course: 'BSCS', campus: 'Fortune Towne Campus',
    total: 88, inPath: 44, notInPath: 44,
    topRoles: ['Junior Developer', 'IT Intern', 'Tech Support', 'Data Analyst'],
    topRoleCounts: [18, 14, 8, 4],
    trend: [20, 50],
    trendLabels: ['2025', '2026 (est.)'],
    notInPathRoles: ['Call Center Agent', 'Sales', 'Unemployed'],
    notInPathCounts: [20, 14, 10],
    students: [
      { name: 'Kyla Reyes',          section: 'A', role: 'Junior Developer',          employer: 'Sari-Sari Tech',  inPath: true  },
      { name: 'Aldrin Macaraeg',     section: 'A', role: 'IT Intern',                 employer: 'Smart Comms',     inPath: true  },
      { name: 'Bianca Laguardia',    section: 'B', role: 'Data Analyst',              employer: 'UnionBank',       inPath: true  },
      { name: 'Nico Fabian',         section: 'B', role: 'Tech Support',              employer: 'Globe Telecom',   inPath: true  },
      { name: 'Hanna Espinosa',      section: 'C', role: 'Call Center Agent',         employer: 'Teleperformance', inPath: false },
      { name: 'Elmer Santiago',      section: 'C', role: 'Sales',                     employer: 'LBC Express',     inPath: false },
      { name: 'Tricia Buenaventura', section: 'D', role: 'Unemployed',                employer: 'â€”',               inPath: false },
      { name: 'Josef Magbanua',      section: 'D', role: 'Call Center Agent',         employer: 'TTEC',            inPath: false },
    ],
  },
];

/* Overall summary across all batches */
const OVERALL = {
  totalAlumni: BATCHES.reduce((s, b) => s + b.total, 0),
  inPath:      BATCHES.reduce((s, b) => s + b.inPath, 0),
  batchCount:  BATCHES.length,
  avgRate: 0,
};
OVERALL.avgRate = Math.round((OVERALL.inPath / OVERALL.totalAlumni) * 100);

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   HELPERS
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

function pct(n, total) { return Math.round((n / total) * 100); }

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
  const uid      = values.join('').replace(/\./g, '');
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
   STUDENT TABLE  (paginated – PAGE_SIZE rows per page)
   ───────────────────────────────────────────────────────────── */
const PAGE_SIZE = 12;

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


/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   COLLAPSIBLE BATCH PANEL
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
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

      <!-- â”€â”€ Collapse Header (always visible) â”€â”€ -->
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
          <!-- Mini inline bar -->
          <div class="an-panel__mini-bar">
            <div class="an-panel__mini-fill" style="width:${inPct}%;background:${color}"></div>
          </div>
          <span class="an-panel__mini-pct" style="color:${color}">${inPct}%</span>
          <span class="an-card__status ${statusClass}">
            ${statusIcon} ${statusText}
          </span>
        </div>
      </button>

      <!-- â”€â”€ Collapse Body â”€â”€ -->
      <div class="an-panel__body" id="${b.id}-body">
        <div class="an-panel__body-inner">

          <!-- Stats row -->
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

          <!-- Detail grid -->
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

          <!-- Student table -->
          ${studentTable(b.students, b.course, b.label, b.id)}

        </div>
      </div>
    </div>`;
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   MAIN EXPORT
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function _OLD_AnalyticsPage(container) {
  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-header__title">${icon('award', 22)} Alumni Tracker</h1>
      <p class="page-header__subtitle">Track whether graduates are following their IT career path by batch and course</p>
    </div>

    <!-- KPI strip -->
    <div class="an-kpi-strip">
      <div class="an-kpi">
        <span class="an-kpi__icon" style="background:rgba(99,102,241,.1);color:#6366F1">${icon('users', 18)}</span>
        <div><p class="an-kpi__val">${OVERALL.totalAlumni}</p><p class="an-kpi__label">Total Alumni Tracked</p></div>
      </div>
      <div class="an-kpi">
        <span class="an-kpi__icon" style="background:rgba(16,185,129,.1);color:#10B981">${icon('check-circle', 18)}</span>
        <div><p class="an-kpi__val">${OVERALL.inPath}</p><p class="an-kpi__label">In IT Career Path</p></div>
      </div>
      <div class="an-kpi">
        <span class="an-kpi__icon" style="background:rgba(99,102,241,.1);color:#6366F1">${icon('target', 18)}</span>
        <div><p class="an-kpi__val">${OVERALL.avgRate}%</p><p class="an-kpi__label">Overall In-Path Rate</p></div>
      </div>
      <div class="an-kpi">
        <span class="an-kpi__icon" style="background:rgba(245,158,11,.1);color:#F59E0B">${icon('book-open', 18)}</span>
        <div><p class="an-kpi__val">${OVERALL.batchCount}</p><p class="an-kpi__label">Batches Analysed</p></div>
      </div>
    </div>

    <!-- Filter bar -->
    <div class="toolbar" style="margin-bottom:var(--space-5)">
      <div class="toolbar__left">
        <select class="form-select an-filter" id="filter-campus" style="width:auto;padding:7px 32px 7px 10px;">
          <option value="">All Campuses</option>
          <option>Alijis Campus</option><option>Talisay Campus</option><option>Fortune Towne Campus</option>
        </select>
        <select class="form-select an-filter" id="filter-course" style="width:auto;padding:7px 32px 7px 10px;">
          <option value="">All Courses</option>
          <option>BSIT</option><option>BSCS</option>
        </select>
        <select class="form-select an-filter" id="filter-status" style="width:auto;padding:7px 32px 7px 10px;">
          <option value="">All Status</option>
          <option value="good">On Track (&ge;70%)</option>
          <option value="mid">Moderate (50-69%)</option>
          <option value="low">Low In-Path (&lt;50%)</option>
        </select>
      </div>
      <div class="toolbar__right">
        <span class="an-note">${icon('alertCircle', 13)} Static demo data â€” live data coming soon</span>
      </div>
    </div>

    <!-- Batch panels -->
    <div class="an-batch-list" id="an-batch-list">
      ${BATCHES.map(renderBatchPanel).join('')}
    </div>
  `;

  renderIcons();

  /* â”€â”€ Collapse toggle â”€â”€ */
  container.querySelectorAll('.an-panel__trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
      const panel = btn.closest('.an-panel');
      panel.classList.toggle('an-panel--open', !expanded);
    });
  });

  /* â”€â”€ Filter logic â”€â”€ */
  function applyFilters() {
    const campus = container.querySelector('#filter-campus').value;
    const course = container.querySelector('#filter-course').value;
    const status = container.querySelector('#filter-status').value;
    container.querySelectorAll('.an-panel').forEach(el => {
      const match =
        (!campus || el.dataset.campus === campus) &&
        (!course || el.dataset.course === course) &&
        (!status || el.dataset.status === status);
      el.style.display = match ? '' : 'none';
    });
  }
  container.querySelectorAll('.an-filter').forEach(sel => sel.addEventListener('change', applyFilters));

  /* -- Pagination -- */
  container.querySelector('#an-batch-list').addEventListener('click', e => {
    const pgBtn = e.target.closest('.an-pg-btn');
    if (!pgBtn || pgBtn.disabled) return;
    const page = parseInt(pgBtn.dataset.page, 10);
    const section = pgBtn.closest('.an-student-section');
    const batchId = section.dataset.batchId;
    const batch = BATCHES.find(b => b.id === batchId);
    if (!batch) return;
    const tmp = document.createElement('div');
    tmp.innerHTML = studentTable(batch.students, batch.course, batch.label, batch.id, page);
    section.replaceWith(tmp.firstElementChild);
    renderIcons();
  });
}
/* ── REPLACED BELOW: all new dynamic helpers live here ── */

/* ── Build KPI strip HTML ── */
function renderKpiStrip(overall) {
  return `
    <div class="an-kpi">
      <span class="an-kpi__icon" style="background:rgba(99,102,241,.1);color:#6366F1">${icon('users', 18)}</span>
      <div><p class="an-kpi__val">${overall.totalAlumni}</p><p class="an-kpi__label">Total Alumni Tracked</p></div>
    </div>
    <div class="an-kpi">
      <span class="an-kpi__icon" style="background:rgba(16,185,129,.1);color:#10B981">${icon('check-circle', 18)}</span>
      <div><p class="an-kpi__val">${overall.inPath}</p><p class="an-kpi__label">In IT Career Path</p></div>
    </div>
    <div class="an-kpi">
      <span class="an-kpi__icon" style="background:rgba(99,102,241,.1);color:#6366F1">${icon('target', 18)}</span>
      <div><p class="an-kpi__val">${overall.avgRate}%</p><p class="an-kpi__label">Overall In-Path Rate</p></div>
    </div>
    <div class="an-kpi">
      <span class="an-kpi__icon" style="background:rgba(245,158,11,.1);color:#F59E0B">${icon('book-open', 18)}</span>
      <div><p class="an-kpi__val">${overall.batchCount}</p><p class="an-kpi__label">Batches Analysed</p></div>
    </div>`;
}

/* ── Build dynamic <option> list from unique batch field values ── */
function buildFilterOptions(batches, field) {
  return [...new Set(batches.map(b => b[field]).filter(Boolean))].sort()
    .map(v => `<option value="${v}">${v}</option>`).join('');
}

/* ── Full page render once data is loaded ── */
function renderAnalytics(container, batches, overall, onImportSuccess) {
  container.innerHTML = `
    <div class="page-header">
      <h1 class="page-header__title">${icon('award', 22)} Alumni Tracker</h1>
      <p class="page-header__subtitle">Track whether graduates are following their IT career path by batch and course</p>
    </div>

    <div class="an-kpi-strip">
      ${renderKpiStrip(overall)}
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
        <button class="btn btn--primary btn--sm" id="btn-batch-alumni" style="display:inline-flex;align-items:center;gap:6px;">
          ${icon('upload', 14)} Batch Register Alumni
        </button>
      </div>
    </div>

    <div class="an-batch-list" id="an-batch-list">
      ${batches.length
        ? batches.map(renderBatchPanel).join('')
        : `<div style="padding:64px;text-align:center;color:var(--text-secondary)">
             ${icon('users', 40)}<p style="margin-top:12px">No graduate records found.</p>
           </div>`}
    </div>`;

  renderIcons();

  /* Batch Register Alumni button */
  container.querySelector('#btn-batch-alumni')?.addEventListener('click', () => {
    openAlumniImportModal(() => {
      if (typeof onImportSuccess === 'function') onImportSuccess();
    });
  });

  /* Collapse toggle */
  container.querySelectorAll('.an-panel__trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
      btn.closest('.an-panel').classList.toggle('an-panel--open', !expanded);
    });
  });

  /* Filter */
  function applyFilters() {
    const campus = container.querySelector('#filter-campus').value;
    const course = container.querySelector('#filter-course').value;
    const status = container.querySelector('#filter-status').value;
    container.querySelectorAll('.an-panel').forEach(el => {
      const match =
        (!campus || el.dataset.campus === campus) &&
        (!course || el.dataset.course === course) &&
        (!status || el.dataset.status === status);
      el.style.display = match ? '' : 'none';
    });
  }
  container.querySelectorAll('.an-filter').forEach(sel => sel.addEventListener('change', applyFilters));

  /* Pagination */
  container.querySelector('#an-batch-list').addEventListener('click', e => {
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

/* ── Main export ── */
export default function AnalyticsPage(container) {
  const cached = getCached('/admin/alumni-analytics');

  if (cached?.data?.batches) {
    renderAnalytics(container, cached.data.batches, cached.data.overall, () => load(true));
  } else {
    container.innerHTML = `
      <div class="page-header">
        <h1 class="page-header__title">${icon('award', 22)} Alumni Tracker</h1>
        <p class="page-header__subtitle">Track whether graduates are following their IT career path by batch and course</p>
      </div>
      <div style="display:flex;align-items:center;gap:10px;padding:48px 24px;color:var(--text-secondary)">
        ${icon('loader', 20)} Loading analytics data...
      </div>`;
    renderIcons();
  }

  async function load(force = false) {
    try {
      const data = await apiGetCached('/admin/alumni-analytics', {
        force,
        onUpdate: (fresh) => {
          if (!container.isConnected) return;
          if (fresh?.batches) {
            renderAnalytics(container, fresh.batches, fresh.overall, () => load(true));
          }
        },
      });

      if (data?.batches && !cached) {
        renderAnalytics(container, data.batches, data.overall, () => load(true));
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

  load();
}

