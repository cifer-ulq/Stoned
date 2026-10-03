/* ===========================
   OJT Monitoring Page — Supervisor Portal
   Executive UI/UX Redesign matching CHMSU Portal Theme
   =========================== */

import { icon } from '../components/icons.js';
import { apiFetch, apiGet } from '../api/client.js';

/* ── Module state ── */
let mapInstance   = null;
let markersLayer  = null;
let logsLayer     = null;
let allCompanies  = [];
let currentFilter = 'all';
let currentSearch = '';
let activeStudentMarkers = {};

/* ── Brand Theme Colors ── */
const THEME = {
  primary:   '#005930', // CHMSU Forest Green
  primaryBg: 'rgba(0, 89, 48, 0.08)',
  emerald:   '#059669', // On Track / Success
  emeraldBg: 'rgba(5, 150, 105, 0.10)',
  amber:     '#D97706', // Warning / In Progress
  amberBg:   'rgba(217, 119, 6, 0.10)',
  rose:      '#DC2626', // Flagged / Error
  roseBg:    'rgba(220, 38, 38, 0.10)',
  sky:       '#0284C7', // Neutral Info
  skyBg:     'rgba(2, 132, 199, 0.10)',
};

/* ══════════════════════════════════════
   ENTRY POINT
══════════════════════════════════════ */
export default function monitoringMapPage(container) {
  container.innerHTML = `
    <div class="mon-wrap">

      <!-- Page Head -->
      <div class="mon-page-head anim-fade-in-up">
        <div class="mon-page-head__title-group">
          <h2 class="mon-page-head__title">
            <span class="mon-head-icon">${icon('map', 20)}</span>
            OJT Monitoring &amp; Site Geofencing
          </h2>
          <p class="mon-page-head__sub">
            Track host training sites, real-time student check-in geolocations, and cumulative hours progress.
          </p>
        </div>
        <div class="mon-page-head__actions">
          <button id="mon-refresh-btn" class="btn btn--outline btn--sm" title="Refresh monitoring data">
            ${icon('refreshCw', 14)} Refresh
          </button>
          <a href="#/trainees" class="btn btn--primary btn--sm">
            ${icon('users', 14)} Trainees Directory
          </a>
        </div>
      </div>

      <!-- Main Content View -->
      <div id="mon-view" class="anim-fade-in-up"></div>
    </div>
  `;

  const refreshBtn = container.querySelector('#mon-refresh-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      refreshBtn.disabled = true;
      refreshBtn.innerHTML = `${icon('refreshCw', 14)} Refreshing...`;
      loadOverview(container).finally(() => {
        refreshBtn.disabled = false;
        refreshBtn.innerHTML = `${icon('refreshCw', 14)} Refresh`;
      });
    });
  }

  loadOverview(container);
  return () => destroyMap();
}

/* ── Destroy Leaflet map cleanly ── */
function destroyMap() {
  if (mapInstance) {
    try {
      mapInstance.remove();
    } catch (_) {}
    mapInstance  = null;
    markersLayer = null;
    logsLayer    = null;
  }
}

const vr = c => c.querySelector('#mon-view');

/* ══════════════════════════════════════
   FETCH DATA
══════════════════════════════════════ */
async function loadOverview(container) {
  const el = vr(container);
  if (!el) return;
  el.innerHTML = `
    <div class="mon-skeleton-stats">
      ${[1, 2, 3, 4].map(() => `<div class="skeleton" style="height:92px;border-radius:var(--radius-xl)"></div>`).join('')}
    </div>
    <div class="mon-skeleton-filter skeleton" style="height:46px;border-radius:var(--radius-lg);margin-bottom:var(--space-5);"></div>
    <div class="mon-grid">
      ${[1, 2, 3, 4, 5, 6].map(() => `<div class="skeleton" style="height:280px;border-radius:var(--radius-xl)"></div>`).join('')}
    </div>`;

  try {
    let companies = null;
    try {
      const res = await apiGet('/supervisor/monitoring');
      if (res && Array.isArray(res.data)) companies = res.data;
    } catch (_) {}
    if (!companies) companies = await apiFetch('monitoring/overview');

    allCompanies = Array.isArray(companies) ? companies : [];
    renderOverview(container, allCompanies);
  } catch (err) {
    const elErr = vr(container);
    if (elErr) {
      elErr.innerHTML = `
        <div class="tr2-empty">
          <div class="tr2-empty__icon">${icon('alertTriangle', 36)}</div>
          <h3>Failed to load monitoring data</h3>
          <p>${err.message || 'Please check your connection and try again.'}</p>
          <button id="mon-retry-btn" class="btn btn--primary btn--sm" style="margin-top:var(--space-3)">
            ${icon('refreshCw', 14)} Retry
          </button>
        </div>`;
      elErr.querySelector('#mon-retry-btn')?.addEventListener('click', () => loadOverview(container));
    }
  }
}

/* ══════════════════════════════════════
   VIEW 1 — Overview (Sites Grid & KPIs)
══════════════════════════════════════ */
function renderOverview(container, companies) {
  destroyMap();
  const view = vr(container);
  if (!view) return;

  const totalSites    = companies.length;
  const totalTrainees = companies.reduce((a, c) => a + (c.activeCount || c.students?.length || 0), 0);

  // Group progress computation helper
  const getAvg = co => co.students && co.students.length
    ? Math.round(co.students.reduce((a, s) => a + Math.min(100, Math.round(((s.completedHours || 0) / (s.requiredHours || 1)) * 100)), 0) / co.students.length)
    : 0;

  const onTrackSites = companies.filter(co => {
    const hasFlag = co.students?.some(s => s.status === 'flagged');
    return !hasFlag && getAvg(co) >= 60;
  }).length;

  const flaggedSites = companies.filter(co => co.students?.some(s => s.status === 'flagged')).length;

  view.innerHTML = `
    <!-- ── KPI Strip ── -->
    <div class="mon-kpi-strip">
      <div class="mon-stat-card">
        <div class="mon-stat-card__top">
          <span class="mon-stat-card__label">Active OJT Sites</span>
          <div class="mon-stat-card__icon" style="background:${THEME.primaryBg};color:${THEME.primary}">
            ${icon('building', 18)}
          </div>
        </div>
        <div class="mon-stat-card__val">${totalSites}</div>
        <div class="mon-stat-card__footer">
          <span class="mon-stat-card__trend mon-trend--good">Approved partner sites</span>
        </div>
      </div>

      <div class="mon-stat-card">
        <div class="mon-stat-card__top">
          <span class="mon-stat-card__label">Deployed Trainees</span>
          <div class="mon-stat-card__icon" style="background:${THEME.skyBg};color:${THEME.sky}">
            ${icon('users', 18)}
          </div>
        </div>
        <div class="mon-stat-card__val">${totalTrainees}</div>
        <div class="mon-stat-card__footer">
          <span class="mon-stat-card__trend mon-trend--neutral">Total students on-site</span>
        </div>
      </div>

      <div class="mon-stat-card">
        <div class="mon-stat-card__top">
          <span class="mon-stat-card__label">Sites On Track</span>
          <div class="mon-stat-card__icon" style="background:${THEME.emeraldBg};color:${THEME.emerald}">
            ${icon('checkCircle', 18)}
          </div>
        </div>
        <div class="mon-stat-card__val">${onTrackSites}</div>
        <div class="mon-stat-card__footer">
          <span class="mon-stat-card__trend mon-trend--good">&ge;60% target pace</span>
        </div>
      </div>

      <div class="mon-stat-card">
        <div class="mon-stat-card__top">
          <span class="mon-stat-card__label">Action Required</span>
          <div class="mon-stat-card__icon" style="background:${flaggedSites > 0 ? THEME.roseBg : THEME.emeraldBg};color:${flaggedSites > 0 ? THEME.rose : THEME.emerald}">
            ${icon(flaggedSites > 0 ? 'alertTriangle' : 'shieldCheck', 18)}
          </div>
        </div>
        <div class="mon-stat-card__val" style="color:${flaggedSites > 0 ? THEME.rose : 'inherit'}">${flaggedSites > 0 ? flaggedSites : 'None'}</div>
        <div class="mon-stat-card__footer">
          <span class="mon-stat-card__trend ${flaggedSites > 0 ? 'mon-trend--warn' : 'mon-trend--good'}">
            ${flaggedSites > 0 ? 'Sites with flagged logs' : 'All geofences clear'}
          </span>
        </div>
      </div>
    </div>

    <!-- ── Search & Filter Controls ── -->
    <div class="mon-filter-bar">
      <div class="mon-search-box">
        <span class="mon-search-icon">${icon('search', 15)}</span>
        <input
          type="text"
          id="mon-search-input"
          class="mon-search-input"
          placeholder="Search by company name, job posting, or location..."
          value="${escapeHtml(currentSearch)}"
        />
        ${currentSearch ? `<button id="mon-search-clear" class="mon-search-clear" title="Clear search">${icon('x', 13)}</button>` : ''}
      </div>

      <div class="mon-filter-tabs" id="mon-filter-tabs">
        <button class="mon-filter-btn ${currentFilter === 'all' ? 'mon-filter-btn--active' : ''}" data-filter="all">
          All Sites <span class="mon-filter-count">${totalSites}</span>
        </button>
        <button class="mon-filter-btn ${currentFilter === 'on_track' ? 'mon-filter-btn--active' : ''}" data-filter="on_track">
          On Track <span class="mon-filter-count">${onTrackSites}</span>
        </button>
        <button class="mon-filter-btn ${currentFilter === 'flagged' ? 'mon-filter-btn--active' : ''}" data-filter="flagged">
          Needs Attention ${flaggedSites > 0 ? `<span class="mon-filter-count mon-filter-count--warn">${flaggedSites}</span>` : ''}
        </button>
      </div>
    </div>

    <!-- ── Cards Grid Container ── -->
    <div id="mon-grid-container">
      ${renderFilteredGrid(companies)}
    </div>
  `;

  // Bind search & filter events
  const searchInput = view.querySelector('#mon-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', e => {
      currentSearch = e.target.value.trim();
      updateGridDisplay(container, companies);
    });
  }

  const searchClear = view.querySelector('#mon-search-clear');
  if (searchClear) {
    searchClear.addEventListener('click', () => {
      currentSearch = '';
      if (searchInput) searchInput.value = '';
      updateGridDisplay(container, companies);
    });
  }

  view.querySelectorAll('.mon-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      view.querySelectorAll('.mon-filter-btn').forEach(b => b.classList.remove('mon-filter-btn--active'));
      btn.classList.add('mon-filter-btn--active');
      currentFilter = btn.dataset.filter;
      updateGridDisplay(container, companies);
    });
  });

  bindCardClickEvents(view, container);
}

/* ── Filter logic ── */
function getFilteredCompanies(companies) {
  return companies.filter(co => {
    // Tab filter
    const hasFlag = co.students?.some(s => s.status === 'flagged');
    const avgPct  = co.students?.length
      ? Math.round(co.students.reduce((a, s) => a + Math.min(100, Math.round(((s.completedHours || 0) / (s.requiredHours || 1)) * 100)), 0) / co.students.length)
      : 0;

    if (currentFilter === 'flagged' && !hasFlag) return false;
    if (currentFilter === 'on_track' && (hasFlag || avgPct < 60)) return false;

    // Search query
    if (currentSearch) {
      const q = currentSearch.toLowerCase();
      const matchName    = co.company?.toLowerCase().includes(q);
      const matchPosting = co.postingTitle?.toLowerCase().includes(q);
      const matchAddr    = co.companyAddress?.toLowerCase().includes(q);
      const matchStudent = co.students?.some(s => s.name?.toLowerCase().includes(q));
      if (!matchName && !matchPosting && !matchAddr && !matchStudent) return false;
    }

    return true;
  });
}

function renderFilteredGrid(companies) {
  const filtered = getFilteredCompanies(companies);

  if (!filtered.length) {
    return `
      <div class="tr2-empty" style="padding:var(--space-10) var(--space-4);">
        <div class="tr2-empty__icon">${icon('search', 36)}</div>
        <h3>No matching OJT sites found</h3>
        <p>Try adjusting your search criteria or switching the filter tab.</p>
      </div>`;
  }

  return `
    <div class="mon-grid">
      ${filtered.map(co => siteCard(co)).join('')}
    </div>`;
}

function updateGridDisplay(container, companies) {
  const gridContainer = container.querySelector('#mon-grid-container');
  if (!gridContainer) return;
  gridContainer.innerHTML = renderFilteredGrid(companies);
  bindCardClickEvents(gridContainer, container);
}

function bindCardClickEvents(scope, container) {
  scope.querySelectorAll('.mon-site-card').forEach(card => {
    card.addEventListener('click', () => {
      const pid = parseInt(card.dataset.pid);
      const co = allCompanies.find(c => c.postingId === pid);
      if (co) openCompanyDetail(container, co);
    });
  });
}

/* ── Refined Site Card HTML ── */
function siteCard(co) {
  const students   = co.students || [];
  const hasFlagged = students.some(s => s.status === 'flagged');
  const avgPct     = students.length
    ? Math.round(students.reduce((a, s) => a + Math.min(100, Math.round(((s.completedHours || 0) / (s.requiredHours || 1)) * 100)), 0) / students.length)
    : 0;

  // Status configuration
  let statusText  = 'In Progress';
  let statusClass = 'mon-pill--amber';
  let statusIcon  = 'clock';

  if (hasFlagged) {
    statusText  = 'Needs Attention';
    statusClass = 'mon-pill--red';
    statusIcon  = 'alertTriangle';
  } else if (avgPct >= 75) {
    statusText  = 'On Track';
    statusClass = 'mon-pill--green';
    statusIcon  = 'checkCircle';
  } else if (avgPct < 30) {
    statusText  = 'Early Stage';
    statusClass = 'mon-pill--neutral';
    statusIcon  = 'compass';
  }

  const totalHrs   = students.reduce((a, s) => a + (s.completedHours || 0), 0);
  const reqHrs     = students.reduce((a, s) => a + (s.requiredHours || 0), 0);
  const preview    = students.slice(0, 4);
  const extraCount = students.length - preview.length;
  const initial    = (co.company || 'C').trim().charAt(0).toUpperCase();

  return `
    <div class="mon-site-card ${hasFlagged ? 'mon-site-card--flagged' : ''}" data-pid="${co.postingId}">

      <!-- Top Row: Avatar, Names, and Status Pill -->
      <div class="mon-site-card__header">
        <div class="mon-site-avatar">
          <span>${initial}</span>
          ${hasFlagged ? `<span class="mon-avatar-alert-dot" title="Flagged student activity"></span>` : ''}
        </div>
        <div class="mon-site-card__title-col">
          <h3 class="mon-site-card__company" title="${escapeHtml(co.company || '')}">${escapeHtml(co.company || 'Host Company')}</h3>
          <p class="mon-site-card__role">
            <span class="mon-role-ic">${icon('briefcase', 12)}</span>
            <span>${escapeHtml(co.postingTitle || 'OJT Placement')}</span>
          </p>
        </div>
        <div class="mon-status-pill ${statusClass}">
          ${icon(statusIcon, 11)} ${statusText}
        </div>
      </div>

      <!-- Address / Location Row -->
      <div class="mon-site-card__location" title="${escapeHtml(co.companyAddress || 'No address specified')}">
        <span class="mon-loc-ic">${icon('mapPin', 12)}</span>
        <span class="mon-loc-text">${escapeHtml(co.companyAddress || 'Location on file')}</span>
      </div>

      <!-- Compact Metrics Badges -->
      <div class="mon-site-card__chips">
        <span class="mon-chip">
          ${icon('users', 11)} <strong>${co.activeCount || students.length}</strong> Trainee${(co.activeCount || students.length) !== 1 ? 's' : ''}
        </span>
        ${reqHrs > 0 ? `
          <span class="mon-chip">
            ${icon('clock', 11)} <strong>${totalHrs}</strong> / ${reqHrs} hrs
          </span>
        ` : ''}
      </div>

      <!-- Progress Track -->
      <div class="mon-site-card__progress">
        <div class="mon-prog-meta">
          <span class="mon-prog-lbl">Group Avg. Completion</span>
          <span class="mon-prog-pct" style="color:${hasFlagged ? THEME.rose : avgPct >= 60 ? THEME.emerald : THEME.amber}">${avgPct}%</span>
        </div>
        <div class="mon-track">
          <div class="mon-track__fill" style="width:${avgPct}%;background:${hasFlagged ? THEME.rose : avgPct >= 60 ? THEME.emerald : THEME.amber}"></div>
        </div>
      </div>

      <!-- Footer: Avatar Stack + Open Button -->
      <div class="mon-site-card__footer">
        <div class="mon-avatar-group">
          ${preview.map(s => `
            <div class="mon-avatar-dot" title="${escapeHtml(s.name || '')}">
              ${escapeHtml(s.initials || s.name?.[0] || 'S')}
            </div>
          `).join('')}
          ${extraCount > 0 ? `<div class="mon-avatar-dot mon-avatar-dot--more">+${extraCount}</div>` : ''}
        </div>
        <button class="mon-card-action" tabindex="-1">
          <span>View Site &amp; Map</span>
          ${icon('chevronRight', 13)}
        </button>
      </div>

    </div>
  `;
}

/* ══════════════════════════════════════
   VIEW 2 — Company Detail (Map + Trainees)
══════════════════════════════════════ */
function openCompanyDetail(container, company) {
  const view       = vr(container);
  const students   = company.students || [];
  const hasFlagged = students.some(s => s.status === 'flagged');
  const avgPct     = students.length
    ? Math.round(students.reduce((a, s) => a + Math.min(100, Math.round(((s.completedHours || 0) / (s.requiredHours || 1)) * 100)), 0) / students.length)
    : 0;
  const initial    = (company.company || 'C').trim().charAt(0).toUpperCase();

  view.innerHTML = `
    <!-- ── Breadcrumb Navigation ── -->
    <div class="mon-nav-bar">
      <button class="mon-back-link" id="mon-back-overview">
        ${icon('arrowLeft', 14)} Back to All Sites
      </button>
      <span class="mon-nav-sep">/</span>
      <span class="mon-nav-current">${escapeHtml(company.company || 'Company')}</span>
    </div>

    <!-- ── Executive Company Hero Banner ── -->
    <div class="mon-co-header">
      <div class="mon-co-header__profile">
        <div class="mon-co-avatar">${initial}</div>
        <div class="mon-co-header__info">
          <div class="mon-co-header__tags">
            <span class="mon-status-pill ${hasFlagged ? 'mon-pill--red' : avgPct >= 60 ? 'mon-pill--green' : 'mon-pill--amber'}">
              ${icon(hasFlagged ? 'alertTriangle' : avgPct >= 60 ? 'checkCircle' : 'clock', 11)}
              ${hasFlagged ? 'Needs Attention' : avgPct >= 60 ? 'On Track' : 'In Progress'}
            </span>
          </div>
          <h2 class="mon-co-header__title">${escapeHtml(company.company || '')}</h2>
          <p class="mon-co-header__posting">
            ${icon('briefcase', 13)} ${escapeHtml(company.postingTitle || 'OJT Placement')}
          </p>
          <p class="mon-co-header__location">
            ${icon('mapPin', 13)} ${escapeHtml(company.companyAddress || 'No address specified')}
          </p>
        </div>
      </div>

      <div class="mon-co-stats">
        <div class="mon-co-stat-box">
          <span class="mon-co-stat-val" style="color:${THEME.primary}">${company.activeCount || students.length}</span>
          <span class="mon-co-stat-lbl">Active Trainees</span>
        </div>
        <div class="mon-co-stat-sep"></div>
        <div class="mon-co-stat-box">
          <span class="mon-co-stat-val" style="color:${avgPct >= 60 ? THEME.emerald : THEME.amber}">${avgPct}%</span>
          <span class="mon-co-stat-lbl">Avg. Completion</span>
        </div>
        ${hasFlagged ? `
          <div class="mon-co-stat-sep"></div>
          <div class="mon-co-stat-box">
            <span class="mon-co-stat-val" style="color:${THEME.rose}">
              ${students.filter(s => s.status === 'flagged').length}
            </span>
            <span class="mon-co-stat-lbl">Flagged Issues</span>
          </div>
        ` : ''}
      </div>
    </div>

    <!-- ── Two Column Map & Roster Layout ── -->
    <div class="mon-split-layout">

      <!-- LEFT: Leaflet Map Frame -->
      <div class="mon-split-main">
        <div class="mon-panel">
          <div class="mon-panel__header">
            <div class="mon-panel__title-wrap">
              <span class="mon-panel__icon" style="background:${THEME.primaryBg};color:${THEME.primary}">${icon('map', 14)}</span>
              <span class="mon-panel__title">Live Geofence Map</span>
            </div>
            <span class="mon-panel__badge">${students.filter(s => s.lastSeen?.lat).length} Located</span>
          </div>

          <div class="mon-map-container" id="mon-map"></div>

          <!-- Clean Map Legend -->
          <div class="mon-map-legend">
            <div class="mon-legend-item">
              <span class="mon-legend-marker mon-legend-marker--building"></span> Host Site
            </div>
            <div class="mon-legend-item">
              <span class="mon-legend-dot" style="background:${THEME.emerald}"></span> On Track (&ge;60%)
            </div>
            <div class="mon-legend-item">
              <span class="mon-legend-dot" style="background:${THEME.amber}"></span> In Progress (&lt;60%)
            </div>
            <div class="mon-legend-item">
              <span class="mon-legend-dot" style="background:${THEME.rose}"></span> Flagged Geofence
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT: Trainee Roster -->
      <div class="mon-split-side">
        <div class="mon-panel mon-panel--scrollable">
          <div class="mon-panel__header">
            <div class="mon-panel__title-wrap">
              <span class="mon-panel__icon" style="background:${THEME.emeraldBg};color:${THEME.emerald}">${icon('users', 14)}</span>
              <span class="mon-panel__title">Assigned Trainees</span>
            </div>
            <span class="mon-panel__badge">${students.length}</span>
          </div>

          <div class="mon-roster-list">
            ${students.length
              ? students.map(s => traineeCardRow(s)).join('')
              : `
                <div class="tr2-empty" style="padding:var(--space-8) var(--space-4)">
                  <div class="tr2-empty__icon">${icon('users', 28)}</div>
                  <p>No active trainees at this location.</p>
                </div>
              `}
          </div>
        </div>
      </div>

    </div>
  `;

  view.querySelector('#mon-back-overview').addEventListener('click', () => {
    renderOverview(container, allCompanies);
  });

  view.querySelectorAll('.mon-roster-item').forEach(row => {
    row.addEventListener('click', () => {
      const sid = parseInt(row.dataset.sid);
      const student = students.find(s => s.id === sid);
      if (student) openStudentDetail(container, company, student);
    });
  });

  requestAnimationFrame(() => initCompanyMap(container, company));
}

/* ── Trainee Roster Item ── */
function traineeCardRow(s) {
  const pct     = Math.min(100, Math.round(((s.completedHours || 0) / (s.requiredHours || 1)) * 100));
  const isFlag  = s.status === 'flagged';
  const clr     = isFlag ? THEME.rose : pct >= 60 ? THEME.emerald : THEME.amber;
  const hasGps  = s.lastSeen?.lat && s.lastSeen?.lng;

  return `
    <div class="mon-roster-item ${isFlag ? 'mon-roster-item--flagged' : ''}" data-sid="${s.id}">
      <div class="mon-roster-avatar" style="background:${clr}15;color:${clr}">
        ${escapeHtml(s.initials || s.name?.[0] || 'S')}
      </div>

      <div class="mon-roster-body">
        <div class="mon-roster-top">
          <span class="mon-roster-name">${escapeHtml(s.name || 'Student')}</span>
          <span class="mon-roster-pct" style="color:${clr}">${pct}%</span>
        </div>

        <div class="mon-roster-sub">
          ${escapeHtml(s.course || 'Degree Program')}
          ${s.studentId ? ` &middot; ${escapeHtml(s.studentId)}` : ''}
        </div>

        <!-- Progress track -->
        <div class="mon-track mon-track--sm">
          <div class="mon-track__fill" style="width:${pct}%;background:${clr}"></div>
        </div>

        <div class="mon-roster-footer">
          <span class="mon-roster-hrs">${s.completedHours || 0} / ${s.requiredHours || 0} hrs</span>
          ${hasGps
            ? `<span class="mon-gps-badge mon-gps-badge--active">${icon('mapPin', 9)} GPS Logged</span>`
            : `<span class="mon-gps-badge mon-gps-badge--none">${icon('mapPin', 9)} No GPS</span>`}
        </div>

        ${isFlag ? `
          <div class="mon-roster-flag-msg">
            ${icon('alertTriangle', 10)} Flagged log requires review
          </div>
        ` : ''}
      </div>

      <div class="mon-roster-chevron">
        ${icon('chevronRight', 14)}
      </div>
    </div>
  `;
}

/* ── Initialize Company Leaflet Map ── */
function initCompanyMap(container, company) {
  const L = window.L;
  const el = container.querySelector('#mon-map');
  if (!L || !el) return;

  destroyMap();

  const centerLat = company.lat || 10.3157;
  const centerLng = company.lng || 123.8854;

  mapInstance = L.map('mon-map', {
    zoomControl: true,
    attributionControl: false,
  }).setView([centerLat, centerLng], 15);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
  }).addTo(mapInstance);

  markersLayer = L.layerGroup().addTo(mapInstance);
  logsLayer    = L.layerGroup().addTo(mapInstance);

  const coords = [];

  // Host site pin
  if (company.lat && company.lng) {
    coords.push([company.lat, company.lng]);
    L.marker([company.lat, company.lng], {
      icon: buildingPin(company.company?.[0] || 'C'),
      zIndexOffset: 300,
    })
      .addTo(markersLayer)
      .bindPopup(`
        <div class="mon-popup">
          <div class="mon-popup__title">${escapeHtml(company.company)}</div>
          <div class="mon-popup__sub">${escapeHtml(company.companyAddress || 'Host Training Site')}</div>
        </div>
      `)
      .openPopup();
  }

  // Student pins
  (company.students || []).forEach(s => {
    if (!s.lastSeen?.lat || !s.lastSeen?.lng) return;
    coords.push([s.lastSeen.lat, s.lastSeen.lng]);

    const pct      = Math.min(100, Math.round(((s.completedHours || 0) / (s.requiredHours || 1)) * 100));
    const isFlag   = s.status === 'flagged';
    const pinColor = isFlag ? THEME.rose : pct >= 60 ? THEME.emerald : THEME.amber;

    L.marker([s.lastSeen.lat, s.lastSeen.lng], {
      icon: studentPin(s.initials || 'S', pinColor),
    })
      .addTo(markersLayer)
      .bindPopup(`
        <div class="mon-popup">
          <div class="mon-popup__title">${escapeHtml(s.name)}</div>
          <div class="mon-popup__sub">${escapeHtml(s.course || '')}</div>
          <div class="mon-popup__prog">Progress: <strong style="color:${pinColor}">${s.completedHours}/${s.requiredHours} hrs (${pct}%)</strong></div>
          <div class="mon-popup__time">Last check-in: ${escapeHtml(s.lastSeen.time || 'On record')}</div>
        </div>
      `);
  });

  if (coords.length > 1) {
    try {
      mapInstance.fitBounds(L.latLngBounds(coords), { padding: [40, 40], maxZoom: 16 });
    } catch (_) {}
  }

  setTimeout(() => mapInstance && mapInstance.invalidateSize(), 250);
}

/* ══════════════════════════════════════
   VIEW 3 — Student Detail (GPS Logs & Map)
══════════════════════════════════════ */
async function openStudentDetail(container, company, student) {
  const view    = vr(container);
  const pct     = Math.min(100, Math.round(((student.completedHours || 0) / (student.requiredHours || 1)) * 100));
  const isFlag  = student.status === 'flagged';
  const fillClr = isFlag ? THEME.rose : pct >= 60 ? THEME.emerald : THEME.amber;

  // Circular progress ring calculations
  const r = 26, circ = 2 * Math.PI * r;
  const ringDash = ((100 - pct) / 100) * circ;

  view.innerHTML = `
    <!-- ── Breadcrumb Navigation ── -->
    <div class="mon-nav-bar">
      <button class="mon-back-link" id="mon-back-company">
        ${icon('arrowLeft', 14)} Back to ${escapeHtml(company.company || 'Site')}
      </button>
      <span class="mon-nav-sep">/</span>
      <span class="mon-nav-current">${escapeHtml(student.name || 'Student')}</span>
    </div>

    <!-- ── Student Executive Hero Banner ── -->
    <div class="mon-student-header">
      <div class="mon-student-header__profile">
        <div class="mon-student-avatar" style="background:${fillClr}15;color:${fillClr}">
          ${escapeHtml(student.initials || student.name?.[0] || 'S')}
        </div>
        <div class="mon-student-header__info">
          <div class="mon-student-header__badges">
            <span class="mon-status-pill ${isFlag ? 'mon-pill--red' : 'mon-pill--green'}">
              ${icon(isFlag ? 'alertTriangle' : 'checkCircle', 11)}
              ${isFlag ? 'Needs Attention' : 'Active Training'}
            </span>
            <span class="mon-company-tag">${icon('building', 11)} ${escapeHtml(company.company || '')}</span>
          </div>
          <h2 class="mon-student-header__name">${escapeHtml(student.name || '')}</h2>
          <p class="mon-student-header__course">
            ${escapeHtml(student.course || 'Degree Program')}
            ${student.studentId ? ` &middot; Student ID: ${escapeHtml(student.studentId)}` : ''}
          </p>
        </div>
      </div>

      <div class="mon-student-progress-card">
        <div class="mon-ring-wrapper">
          <svg class="mon-svg-ring" width="68" height="68" viewBox="0 0 68 68">
            <circle cx="34" cy="34" r="${r}" fill="none" stroke="${fillClr}18" stroke-width="6"/>
            <circle cx="34" cy="34" r="${r}" fill="none" stroke="${fillClr}" stroke-width="6"
              stroke-linecap="round"
              stroke-dasharray="${circ}"
              stroke-dashoffset="${ringDash}"
              transform="rotate(-90 34 34)"/>
          </svg>
          <div class="mon-ring-data">
            <span class="mon-ring-num" style="color:${fillClr}">${pct}%</span>
          </div>
        </div>
        <div class="mon-student-hrs-summary">
          <div class="mon-hrs-val">${student.completedHours || 0} / ${student.requiredHours || 0}</div>
          <div class="mon-hrs-lbl">Total Hours Rendered</div>
        </div>
      </div>
    </div>

    <!-- ── Two Column GPS Map & Time Log Timeline ── -->
    <div class="mon-split-layout">

      <!-- LEFT: GPS Map -->
      <div class="mon-split-main">
        <div class="mon-panel">
          <div class="mon-panel__header">
            <div class="mon-panel__title-wrap">
              <span class="mon-panel__icon" style="background:${THEME.primaryBg};color:${THEME.primary}">${icon('mapPin', 14)}</span>
              <span class="mon-panel__title">GPS Geofence History</span>
            </div>
          </div>

          <div class="mon-map-container" id="mon-map"></div>

          <div class="mon-map-legend">
            <div class="mon-legend-item">
              <span class="mon-legend-dot" style="background:${THEME.emerald}"></span> Valid Check-in
            </div>
            <div class="mon-legend-item">
              <span class="mon-legend-dot" style="background:${THEME.rose}"></span> Invalid / Out of Range
            </div>
            <div class="mon-legend-item">
              <span class="mon-legend-dot" style="background:${THEME.amber}"></span> Check-out Location
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT: Time Log History -->
      <div class="mon-split-side">
        <div class="mon-panel mon-panel--scrollable">
          <div class="mon-panel__header" id="logs-head">
            <div class="mon-panel__title-wrap">
              <span class="mon-panel__icon" style="background:${THEME.primaryBg};color:${THEME.primary}">${icon('clock', 14)}</span>
              <span class="mon-panel__title">Time Log Records</span>
            </div>
          </div>

          <div id="mon-logs-body" class="mon-logs-body">
            ${[1, 2, 3].map(() => `<div class="skeleton" style="height:72px;border-radius:var(--radius-lg);margin-bottom:8px"></div>`).join('')}
          </div>
        </div>
      </div>

    </div>
  `;

  view.querySelector('#mon-back-company').addEventListener('click', () => {
    openCompanyDetail(container, company);
  });

  initLogMap(container, company);

  try {
    let logs = null;
    try {
      const res = await apiGet(`/supervisor/monitoring/student/${student.id}/logs`);
      if (res && Array.isArray(res.data)) logs = res.data;
    } catch (_) {}
    if (!logs) logs = await apiFetch(`monitoring/student/${student.id}/logs`);

    const logList = Array.isArray(logs) ? logs : [];
    renderLogMarkers(company, student, logList);
    renderLogsPanel(container, logList);
  } catch (err) {
    const body = container.querySelector('#mon-logs-body');
    if (body) {
      body.innerHTML = `
        <div class="tr2-empty" style="padding:var(--space-6) var(--space-4)">
          <div class="tr2-empty__icon">${icon('alertTriangle', 24)}</div>
          <p>Failed to load time log entries.</p>
        </div>`;
    }
  }
}

/* ── Init Log Map ── */
function initLogMap(container, company) {
  const L = window.L;
  const el = container.querySelector('#mon-map');
  if (!L || !el) return;

  destroyMap();

  const centerLat = company?.lat ? parseFloat(company.lat) : 10.6765;
  const centerLng = company?.lng ? parseFloat(company.lng) : 122.9509;

  mapInstance = L.map('mon-map', {
    zoomControl: true,
    attributionControl: false,
  }).setView([centerLat, centerLng], 15);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
  }).addTo(mapInstance);

  markersLayer = L.layerGroup().addTo(mapInstance);
  logsLayer    = L.layerGroup().addTo(mapInstance);

  // If host site coordinates exist, plot company marker and 100m geofence radius
  if (company?.lat && company?.lng) {
    const cLat = parseFloat(company.lat);
    const cLng = parseFloat(company.lng);

    L.circle([cLat, cLng], {
      radius: 100,
      color: THEME.emerald,
      fillColor: THEME.emerald,
      fillOpacity: 0.12,
      weight: 2,
      dashArray: '6 6',
    }).addTo(markersLayer).bindPopup(`
      <div class="mon-popup">
        <div class="mon-popup__badge" style="background:${THEME.emeraldBg};color:${THEME.emerald}">Verified Geofence</div>
        <div class="mon-popup__title">${escapeHtml(company.company || 'Host Training Site')}</div>
        <div class="mon-popup__sub">100-meter valid check-in radius</div>
      </div>
    `);

    L.marker([cLat, cLng], {
      icon: buildingPin(company.company?.[0] || 'C'),
      zIndexOffset: 400,
    }).addTo(markersLayer).bindPopup(`
      <div class="mon-popup">
        <div class="mon-popup__badge" style="background:${THEME.primaryBg};color:${THEME.primary}">Host Training Site</div>
        <div class="mon-popup__title">${escapeHtml(company.company || 'Site Location')}</div>
        <div class="mon-popup__sub">${escapeHtml(company.companyAddress || '')}</div>
      </div>
    `);
  }

  setTimeout(() => mapInstance && mapInstance.invalidateSize(), 250);
}

/* ── Render Log GPS Pins on Map ── */
function renderLogMarkers(company, student, logs) {
  const L = window.L;
  if (!L || !logsLayer) return;

  logsLayer.clearLayers();
  activeStudentMarkers = {};

  const coords = [];
  if (company?.lat && company?.lng) {
    coords.push([parseFloat(company.lat), parseFloat(company.lng)]);
  }

  logs.forEach((log, idx) => {
    const num     = idx + 1;
    const isValid = log.distanceMeters != null ? Number(log.distanceMeters) <= 100 : (log.locationValidity !== 'Too Far' && log.locationValidity !== 'not_valid');
    const inLat   = log.inLat != null ? parseFloat(log.inLat) : null;
    const inLon   = log.inLon != null ? parseFloat(log.inLon) : null;
    const outLat  = log.outLat != null ? parseFloat(log.outLat) : null;
    const outLon  = log.outLon != null ? parseFloat(log.outLon) : null;

    let inMarker = null;
    let outMarker = null;

    // Check-in marker
    if (inLat && inLon && !isNaN(inLat) && !isNaN(inLon)) {
      const clr = isValid ? THEME.emerald : THEME.rose;
      coords.push([inLat, inLon]);

      inMarker = L.marker([inLat, inLon], { icon: logPin('IN', num, clr) })
        .addTo(logsLayer)
        .bindPopup(`
          <div class="mon-popup">
            <div class="mon-popup__badge" style="background:${clr}15;color:${clr}">Check-in #${num}</div>
            <div class="mon-popup__title">${escapeHtml(log.date || '')} &middot; ${escapeHtml(log.timeIn || '')}</div>
            <div class="mon-popup__status" style="color:${clr}">
              ${isValid ? `&check; Within site geofence (${log.distanceMeters || 0}m)` : `&excl; Out of geofence range (${log.distanceMeters || 0}m)`}
            </div>
            ${log.task ? `<div class="mon-popup__sub" style="margin-top:6px;font-size:11px;color:#475569;">${escapeHtml(truncate(log.task, 80))}</div>` : ''}
          </div>
        `);
    }

    // Check-out marker
    if (outLat && outLon && !isNaN(outLat) && !isNaN(outLon)) {
      coords.push([outLat, outLon]);
      outMarker = L.marker([outLat, outLon], { icon: logPin('OUT', num, THEME.amber) })
        .addTo(logsLayer)
        .bindPopup(`
          <div class="mon-popup">
            <div class="mon-popup__badge" style="background:${THEME.amberBg};color:${THEME.amber}">Check-out #${num}</div>
            <div class="mon-popup__title">${escapeHtml(log.date || '')} &middot; ${escapeHtml(log.timeOut || '—')}</div>
            <div class="mon-popup__sub">Duration: <strong>${log.hours || 0} hrs</strong></div>
          </div>
        `);

      // Connection line between check-in and check-out
      if (inLat && inLon && !isNaN(inLat) && !isNaN(inLon)) {
        L.polyline([[inLat, inLon], [outLat, outLon]], {
          color: '#64748B',
          weight: 2,
          opacity: 0.6,
          dashArray: '4 4',
        }).addTo(logsLayer);
      }
    }

    if (inMarker || outMarker) {
      activeStudentMarkers[log.id] = { inMarker, outMarker, log };
    }
  });

  if (coords.length > 0 && mapInstance) {
    try {
      mapInstance.fitBounds(L.latLngBounds(coords), { padding: [50, 50], maxZoom: 16 });
    } catch (_) {}
  }
}

/* ── Render Logs Timeline Panel ── */
function renderLogsPanel(container, logs) {
  const body   = container.querySelector('#mon-logs-body');
  const headEl = container.querySelector('#logs-head');
  if (!body) return;

  const totalHrs     = logs.reduce((a, l) => a + (l.hours || 0), 0).toFixed(1);
  const invalidCount = logs.filter(l => (l.distanceMeters != null ? Number(l.distanceMeters) > 100 : (l.locationValidity === 'Too Far' || l.locationValidity === 'not_valid'))).length;

  if (headEl) {
    headEl.innerHTML = `
      <div class="mon-panel__title-wrap">
        <span class="mon-panel__icon" style="background:${THEME.primaryBg};color:${THEME.primary}">${icon('clock', 14)}</span>
        <span class="mon-panel__title">Time Log Records</span>
      </div>
      <span class="mon-panel__meta-pill">
        ${logs.length} logs &middot; ${totalHrs} hrs
        ${invalidCount > 0 ? `<span class="mon-meta-alert">&middot; ${invalidCount} flagged</span>` : ''}
      </span>
    `;
  }

  if (!logs.length) {
    body.innerHTML = `
      <div class="tr2-empty" style="padding:var(--space-8) var(--space-4)">
        <div class="tr2-empty__icon">${icon('clock', 28)}</div>
        <p>No time log records found for this student.</p>
      </div>`;
    return;
  }

  body.innerHTML = `
    <div style="padding: 8px 12px; margin-bottom: 8px; border-radius: var(--radius-md); background: rgba(0, 89, 48, 0.05); color: #005930; font-size: 11px; display: flex; align-items: center; gap: 6px;">
      ${icon('info', 12)} Click any log below to inspect its GPS location on the map
    </div>
    <div class="mon-timeline">
      ${logs.map((log, idx) => {
        const isInvalid = log.distanceMeters != null ? Number(log.distanceMeters) > 100 : (log.locationValidity === 'Too Far' || log.locationValidity === 'not_valid');
        const statusCls = log.status === 'approved' ? 'mon-badge--green'
          : log.status === 'pending' ? 'mon-badge--amber' : 'mon-badge--neutral';

        return `
          <div class="mon-timeline-card ${isInvalid ? 'mon-timeline-card--warn' : ''}" data-log-id="${log.id}">
            <div class="mon-timeline-num">${idx + 1}</div>
            <div class="mon-timeline-body">
              <div class="mon-timeline-top">
                <span class="mon-timeline-date">${escapeHtml(log.dayLabel || log.date || 'Log Entry')}</span>
                <span class="mon-status-pill ${statusCls}">${escapeHtml(log.status || 'recorded')}</span>
              </div>

              <div class="mon-timeline-chips">
                <span class="mon-time-chip">${icon('logIn', 10)} ${escapeHtml(log.timeIn || '—')}</span>
                <span class="mon-time-chip">${icon('logOut', 10)} ${escapeHtml(log.timeOut || '—')}</span>
                <span class="mon-time-chip mon-time-chip--hrs">${log.hours || 0} hrs</span>
              </div>

              ${log.task ? `
                <div class="mon-timeline-task" title="${escapeHtml(log.task)}">
                  ${escapeHtml(truncate(log.task, 70))}
                </div>
              ` : ''}

              <div class="mon-geo-status ${isInvalid ? 'mon-geo-status--bad' : 'mon-geo-status--good'}">
                ${icon(isInvalid ? 'alertTriangle' : 'checkCircle', 10)}
                <span>${isInvalid ? `Out of range (${log.distanceMeters ?? '?'}m from site)` : `Valid location (${log.distanceMeters ?? 0}m from site)`}</span>
              </div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  // Interactive timeline cards click to locate on map
  body.querySelectorAll('.mon-timeline-card').forEach(card => {
    card.addEventListener('click', () => {
      body.querySelectorAll('.mon-timeline-card').forEach(c => c.classList.remove('mon-timeline-card--active'));
      card.classList.add('mon-timeline-card--active');

      const logId = parseInt(card.dataset.logId);
      const entry = activeStudentMarkers[logId];

      if (entry && mapInstance) {
        if (entry.inMarker && entry.outMarker) {
          mapInstance.fitBounds(window.L.latLngBounds([
            entry.inMarker.getLatLng(),
            entry.outMarker.getLatLng()
          ]), { padding: [80, 80], maxZoom: 18 });
          entry.inMarker.openPopup();
        } else if (entry.inMarker) {
          mapInstance.setView(entry.inMarker.getLatLng(), 17);
          entry.inMarker.openPopup();
        } else if (entry.outMarker) {
          mapInstance.setView(entry.outMarker.getLatLng(), 17);
          entry.outMarker.openPopup();
        }
      }
    });
  });
}

/* ══════════════════════════════════════
   LEAFLET MARKER GENERATORS
══════════════════════════════════════ */
function buildingPin(letter) {
  return window.L.divIcon({
    className: 'mon-map-div-icon',
    html: `
      <div style="width:36px;height:36px;border-radius:10px;background:#005930;border:2.5px solid #ffffff;
        box-shadow:0 3px 10px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;
        color:#ffffff;font-size:14px;font-weight:800;font-family:inherit;">
        ${escapeHtml(letter || 'C')}
      </div>
    `,
    iconSize:   [36, 36],
    iconAnchor: [18, 18],
    popupAnchor:[0, -20],
  });
}

function studentPin(initials, color) {
  return window.L.divIcon({
    className: 'mon-map-div-icon',
    html: `
      <div style="width:30px;height:30px;border-radius:50%;background:${color};border:2.5px solid #ffffff;
        box-shadow:0 3px 8px rgba(0,0,0,0.2);display:flex;align-items:center;justify-content:center;
        color:#ffffff;font-size:9px;font-weight:800;font-family:inherit;">
        ${escapeHtml(initials || 'S')}
      </div>
    `,
    iconSize:   [30, 30],
    iconAnchor: [15, 15],
    popupAnchor:[0, -18],
  });
}

function logPin(type, num, color) {
  return window.L.divIcon({
    className: 'mon-map-div-icon',
    html: `
      <div style="position:relative;">
        <div style="width:26px;height:26px;border-radius:50%;background:${color};border:2px solid #ffffff;
          box-shadow:0 2px 8px rgba(0,0,0,0.22);display:flex;align-items:center;justify-content:center;
          color:#ffffff;font-size:8px;font-weight:800;font-family:inherit;">
          ${escapeHtml(type)}
        </div>
        <div style="position:absolute;top:-6px;right:-6px;width:15px;height:15px;border-radius:50%;
          background:#1E293B;color:#ffffff;font-size:7px;font-weight:800;display:flex;align-items:center;
          justify-content:center;border:1px solid #ffffff;">
          ${num}
        </div>
      </div>
    `,
    iconSize:   [26, 26],
    iconAnchor: [13, 13],
    popupAnchor:[0, -16],
  });
}

/* ── Utilities ── */
function truncate(str, len) {
  return str && str.length > len ? str.slice(0, len) + '\u2026' : (str || '');
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
