/* ===========================
   My Trainees Page — Supervisor Portal
   Professional Table View & Client-Side Pagination
   =========================== */

import { icon } from '../components/icons.js';
import { apiGet, apiCache, storageUrl } from '../api/client.js';
import { getState } from '../store.js';
import { openStudentImportModal } from '../components/student-import-modal.js';
import { openAssignRequirementsModal, openReviewRequirementsModal } from '../components/requirements-modal.js';

const REAL = v => v && v !== '—' && v !== '';
const PER_PAGE = 10;

const STATUS_BADGES = {
  'Active OJT': { cls: 'tr2-badge--active', text: 'Active OJT' },
  'Undeployed': { cls: 'tr2-badge--undeployed', text: 'Undeployed' },
};

const BAR_COLOR = pct => pct >= 75 ? '#005930' : pct >= 40 ? '#10B981' : '#F59E0B';

function initials(name = '') {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

export default function traineesPage(container) {
  const user = getState('user');
  const courseBadge = user?.course
    ? `<span class="badge badge--info" style="font-size:0.75rem;font-weight:600;padding:3px 10px;vertical-align:middle;margin-left:6px;">${user.course}</span>`
    : '';

  container.innerHTML = `
    <!-- ═══ Page Header ═══ -->
    <div class="tr2-page-head anim-fade-in-up">
      <div class="tr2-page-head__left">
        <h2 class="tr2-page-head__title" style="display:flex;align-items:center;flex-wrap:wrap;gap:8px;">
          ${icon('users', 22)} <span>My Trainees</span> ${courseBadge}
        </h2>
        <p class="tr2-page-head__sub">Monitor student deployment, host companies, and OJT training progress for your program</p>
      </div>
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
        <button class="btn btn--primary btn--sm" id="batch-register-btn" style="gap:6px;">
          ${icon('upload', 14)} Batch Register Students
        </button>
        <button class="btn btn--outline btn--sm" onclick="location.hash='/map'" style="gap:6px;">
          ${icon('map', 14)} View Trainee Map
        </button>
      </div>
    </div>

    <!-- ═══ KPI Summary Row ═══ -->
    <div class="tr2-kpi-row anim-stagger" id="tr2-kpis">
      ${[1, 2, 3, 4].map(() => '<div class="skeleton skeleton--card" style="height:84px;border-radius:var(--radius-lg)"></div>').join('')}
    </div>

    <!-- ═══ Filter & Search Toolbar ═══ -->
    <div class="tr2-toolbar anim-fade-in-up">
      <div class="tr2-search-wrap">
        ${icon('search', 15)}
        <input class="tr2-search-input" id="trainee-search" placeholder="Search by name, email, company, or student ID…" />
      </div>
      <div class="tr2-filter-row">
        <select class="tr2-select" id="trainee-status-filter" title="Filter by Status">
          <option value="">All Status</option>
          <option value="Active OJT">Active OJT</option>
          <option value="Undeployed">Undeployed</option>
        </select>
        <select class="tr2-select" id="trainee-section-filter" title="Filter by Section">
          <option value="">All Sections</option>
        </select>
        <button class="btn btn--ghost btn--sm" id="trainee-reset-filters" style="display:none;padding:8px 12px;font-size:var(--text-xs);color:var(--text-tertiary);" title="Reset filters">
          ${icon('x', 14)} Reset
        </button>
      </div>
    </div>

    <!-- ═══ Table Card ═══ -->
    <div class="tr2-table-card anim-fade-in-up">
      <div class="tr2-table-wrap">
        <table class="tr2-table" id="trainee-table">
          <thead>
            <tr>
              <th style="min-width:220px;">Student</th>
              <th style="width:130px;">Student ID</th>
              <th style="width:100px;">Year Level</th>
              <th style="width:90px;">Section</th>
              <th style="min-width:180px;">Host Company</th>
              <th style="min-width:170px;">OJT Progress</th>
              <th style="width:120px;">Status</th>
              <th style="width:110px;text-align:right;">Actions</th>
            </tr>
          </thead>
          <tbody id="trainee-tbody"></tbody>
        </table>
      </div>

      <!-- ═══ Pagination Footer ═══ -->
      <div class="tr2-table-footer" id="trainee-pagination-wrap" style="display:none;">
        <div class="tr2-table-footer__info" id="trainee-page-info"></div>
        <div class="tr2-pagination" id="trainee-page-controls"></div>
      </div>
    </div>

    <!-- ═══ Modal Root ═══ -->
    <div id="trainee-modal-root"></div>
  `;

  let allTrainees = [];
  let filteredTrainees = [];
  let currentPage = 1;

  loadTrainees();

  async function loadTrainees() {
    apiCache.invalidate(['/supervisor/trainees*']);
    const tbody = container.querySelector('#trainee-tbody');
    showSkeleton(tbody, 6);
    try {
      const res = await apiGet('/supervisor/trainees', { forceRefresh: true });
      if (!res || !res.success) throw new Error('Failed to load trainees');
      allTrainees = Array.isArray(res.data) ? res.data : [];
      filteredTrainees = [...allTrainees];

      if (Array.isArray(res.sections)) {
        populateSectionFilter(res.sections);
      }
      renderKpis(allTrainees);
      renderTable();
    } catch (err) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8">
            <div class="tr2-empty">
              <h3 style="margin:0 0 4px;font-size:var(--text-base);color:var(--text-primary);">Could not load trainees</h3>
              <p class="text-tertiary text-sm">${err.message}</p>
            </div>
          </td>
        </tr>`;
    }
  }

  /* ── Skeleton loader ── */
  function showSkeleton(tbody, count = 6) {
    tbody.innerHTML = Array.from({ length: count }, () => `
      <tr style="opacity:0.4;">
        <td>
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:34px;height:34px;border-radius:var(--radius-full);background:var(--bg-tertiary);flex-shrink:0;"></div>
            <div>
              <div style="height:12px;width:120px;background:var(--bg-tertiary);border-radius:4px;margin-bottom:6px;"></div>
              <div style="height:10px;width:150px;background:var(--bg-tertiary);border-radius:4px;"></div>
            </div>
          </div>
        </td>
        <td><div style="height:12px;width:80px;background:var(--bg-tertiary);border-radius:4px;"></div></td>
        <td><div style="height:12px;width:60px;background:var(--bg-tertiary);border-radius:4px;"></div></td>
        <td><div style="height:20px;width:42px;background:var(--bg-tertiary);border-radius:4px;"></div></td>
        <td><div style="height:12px;width:130px;background:var(--bg-tertiary);border-radius:4px;"></div></td>
        <td><div style="height:12px;width:110px;background:var(--bg-tertiary);border-radius:4px;"></div></td>
        <td><div style="height:20px;width:75px;background:var(--bg-tertiary);border-radius:12px;"></div></td>
        <td style="text-align:right;"><div style="height:28px;width:70px;background:var(--bg-tertiary);border-radius:6px;display:inline-block;"></div></td>
      </tr>`).join('');
  }

  /* ── KPI summary metrics ── */
  function renderKpis(list) {
    const total      = list.length;
    const activeOjt  = list.filter(t => t.status === 'Active OJT').length;
    const undeployed = list.filter(t => t.status === 'Undeployed').length;
    const placed     = list.filter(t => t.hasPlacement).length;

    container.querySelector('#tr2-kpis').innerHTML = [
      { label: 'Total Trainees', value: total,      ic: 'users',          bg: 'rgba(0, 89, 48, 0.08)', color: 'var(--color-primary)' },
      { label: 'Active OJT',     value: activeOjt,  ic: 'checkCircle',    bg: 'rgba(52, 199, 89, 0.12)', color: '#005930' },
      { label: 'With Placement', value: placed,     ic: 'briefcase',      bg: 'rgba(59, 130, 246, 0.12)', color: '#2563EB' },
      { label: 'Undeployed',     value: undeployed, ic: 'clock',          bg: 'rgba(245, 158, 11, 0.12)', color: '#B45309' },
    ].map(k => `
      <div class="tr2-kpi">
        <div class="tr2-kpi__icon" style="background:${k.bg};color:${k.color}">
          ${icon(k.ic, 20)}
        </div>
        <div>
          <div class="tr2-kpi__val">${k.value}</div>
          <div class="tr2-kpi__lbl">${k.label}</div>
        </div>
      </div>`).join('');
  }

  /* ── Populate dynamic sections ── */
  function populateSectionFilter(sections) {
    const sel = container.querySelector('#trainee-section-filter');
    if (!sel) return;
    const current = sel.value;
    sel.innerHTML = '<option value="">All Sections</option>' +
      sections.map(s => `<option value="${s}"${s === current ? ' selected' : ''}>Section ${s}</option>`).join('');
  }

  /* ── Event listeners for filtering ── */
  const searchInput  = container.querySelector('#trainee-search');
  const statusSelect = container.querySelector('#trainee-status-filter');
  const sectionSelect= container.querySelector('#trainee-section-filter');
  const resetBtn     = container.querySelector('#trainee-reset-filters');

  let debounceTimer = null;
  searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      currentPage = 1;
      applyFilters();
    }, 250);
  });

  statusSelect.addEventListener('change', () => {
    currentPage = 1;
    applyFilters();
  });

  sectionSelect.addEventListener('change', () => {
    currentPage = 1;
    applyFilters();
  });

  resetBtn.addEventListener('click', () => {
    searchInput.value = '';
    statusSelect.value = '';
    sectionSelect.value = '';
    currentPage = 1;
    applyFilters();
  });

  const batchRegisterBtn = container.querySelector('#batch-register-btn');
  if (batchRegisterBtn) {
    batchRegisterBtn.addEventListener('click', () => {
      openStudentImportModal(() => {
        loadTrainees();
      });
    });
  }

  function applyFilters() {
    const q       = searchInput.value.toLowerCase().trim();
    const status  = statusSelect.value;
    const section = sectionSelect.value;

    const hasActiveFilters = Boolean(q || status || section);
    resetBtn.style.display = hasActiveFilters ? 'inline-flex' : 'none';

    filteredTrainees = allTrainees.filter(t => {
      if (q && !t.name.toLowerCase().includes(q) &&
          !t.email?.toLowerCase().includes(q) &&
          !t.company?.toLowerCase().includes(q) &&
          !t.studentId?.toLowerCase().includes(q)) {
        return false;
      }
      if (status && t.status !== status) return false;
      if (section && t.section !== section) return false;
      return true;
    });

    renderTable();
  }

  /* ── Render table with pagination ── */
  function renderTable() {
    const tbody          = container.querySelector('#trainee-tbody');
    const paginationWrap = container.querySelector('#trainee-pagination-wrap');
    const pageInfo       = container.querySelector('#trainee-page-info');
    const pageControls   = container.querySelector('#trainee-page-controls');

    const totalItems = filteredTrainees.length;

    // Empty state
    if (!totalItems) {
      paginationWrap.style.display = 'none';
      tbody.innerHTML = `
        <tr>
          <td colspan="8">
            <div class="tr2-empty">
              <div class="tr2-empty__icon">${icon('users', 38)}</div>
              <h3 style="margin:4px 0 2px;font-size:var(--text-base);font-weight:600;color:var(--text-primary);">No trainees found</h3>
              <p class="text-tertiary text-sm" style="margin:0 0 10px;">Try adjusting your search query, status, or section filter.</p>
              <button class="btn btn--outline btn--sm" id="empty-reset-btn" style="font-size:var(--text-xs);">Clear all filters</button>
            </div>
          </td>
        </tr>`;
      const emptyReset = tbody.querySelector('#empty-reset-btn');
      if (emptyReset) {
        emptyReset.addEventListener('click', () => {
          searchInput.value = '';
          statusSelect.value = '';
          sectionSelect.value = '';
          currentPage = 1;
          applyFilters();
        });
      }
      return;
    }

    // Pagination calculations
    const totalPages = Math.max(1, Math.ceil(totalItems / PER_PAGE));
    if (currentPage > totalPages) currentPage = totalPages;
    const startIndex = (currentPage - 1) * PER_PAGE;
    const endIndex   = Math.min(totalItems, startIndex + PER_PAGE);
    const pageData   = filteredTrainees.slice(startIndex, endIndex);

    // Rows rendering
    tbody.innerHTML = pageData.map(t => {
      const init = initials(t.name);
      const targetHours = (t.requiredHours && t.requiredHours > 0) ? t.requiredHours : 600;
      const pct  = (targetHours > 0 && t.completedHours > 0)
        ? Math.min(100, Math.round((t.completedHours / targetHours) * 100))
        : 0;
      const barColor = BAR_COLOR(pct);
      const badgeCfg = STATUS_BADGES[t.status] || { cls: 'tr2-badge--undeployed', text: t.status };

      return `
        <tr data-id="${t.id}">
          <td>
            <div style="display:flex;align-items:center;gap:10px;">
              ${t.avatar_url
                ? `<img src="${storageUrl(t.avatar_url)}" alt="${t.name}" style="width:34px;height:34px;border-radius:var(--radius-full);object-fit:cover;flex-shrink:0;border:1px solid var(--border-default);" />`
                : `<div style="width:34px;height:34px;border-radius:var(--radius-full);background:var(--color-primary-bg);color:var(--color-primary);display:flex;align-items:center;justify-content:center;font-weight:var(--weight-semibold);font-size:0.75rem;flex-shrink:0;border:1px solid rgba(0,89,48,0.15);">${init}</div>`}
              <div style="min-width:0;">
                <div style="font-weight:600;color:var(--text-primary);font-size:var(--text-sm);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${t.name}</div>
                <div style="font-size:0.75rem;color:var(--text-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${t.email}</div>
              </div>
            </div>
          </td>
          <td>
            <span style="font-family:monospace;font-size:0.75rem;color:var(--text-secondary);font-weight:600;">${t.studentId || '—'}</span>
          </td>
          <td>
            <span style="font-size:var(--text-sm);color:var(--text-primary);">${t.year || '—'}</span>
          </td>
          <td>
            ${REAL(t.section)
              ? `<span class="tr2-badge tr2-badge--section">${t.section}</span>`
              : `<span style="color:var(--text-tertiary);font-size:var(--text-xs);">—</span>`}
          </td>
          <td>
            ${REAL(t.company)
              ? `<div style="display:flex;align-items:center;gap:6px;font-size:var(--text-sm);font-weight:500;color:var(--text-primary);">${icon('building', 13)} <span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:180px;">${t.company}</span></div>`
              : `<span style="color:var(--text-tertiary);font-size:var(--text-xs);font-style:italic;">Undeployed</span>`}
          </td>
          <td>
            ${t.hasPlacement && t.requiredHours > 0 ? `
              <div class="tr2-prog">
                <div class="tr2-prog-bar">
                  <div class="tr2-prog-fill" style="width:${pct}%;background:${barColor};"></div>
                </div>
                <span class="tr2-prog-val">${t.completedHours}/${t.requiredHours}h</span>
              </div>
            ` : `
              <span style="font-size:var(--text-xs);color:var(--text-tertiary);">—</span>
            `}
          </td>
          <td>
            <span class="tr2-badge ${badgeCfg.cls}">${badgeCfg.text}</span>
            ${t.requirements ? `
              <div style="margin-top:3px;">
                <span class="badge ${
                  t.requirements.status === 'verified' ? 'badge--success' :
                  t.requirements.status === 'submitted' ? 'badge--info' :
                  t.requirements.status === 'needs_revision' ? 'badge--warning' : 'badge--neutral'
                }" style="font-size:0.65rem;padding:2px 6px;text-transform:capitalize;font-weight:600;">
                  Reqs: ${t.requirements.status.replace('_', ' ')}
                </span>
              </div>
            ` : ''}
            ${t.flag ? `<div style="margin-top:2px;"><span class="badge badge--error" style="font-size:0.65rem;padding:2px 6px;">${icon('alertTriangle', 10)} Flagged</span></div>` : ''}
          </td>
          <td style="text-align:right;">
            <div style="display:flex;align-items:center;justify-content:flex-end;gap:4px;">
              ${t.company_user_id ? `
                <button class="btn btn--outline btn--sm tr2-chat-co-btn" data-company-id="${t.company_user_id}" style="padding:4px 8px;font-size:0.72rem;gap:4px;color:#0284c7;border-color:rgba(2,132,199,0.35);" title="Message Host Company (${t.company || 'Company'})">
                  ${icon('building', 13)} Company
                </button>
              ` : ''}
              <button class="btn btn--outline btn--sm tr2-chat-btn" data-id="${t.id}" style="padding:4px 8px;font-size:0.72rem;gap:4px;color:var(--color-primary);" title="Message student">
                ${icon('messageCircle', 13)} Message
              </button>
              <button class="btn btn--outline btn--sm tr2-view-btn" data-id="${t.id}" style="padding:4px 9px;font-size:0.72rem;gap:4px;">
                ${icon('eye', 13)} View
              </button>
              <button class="btn btn--ghost btn--sm" style="padding:4px 6px;" onclick="location.hash='/map'" title="Locate on Map">
                ${icon('mapPin', 13)}
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Wire up company chat button clicks
    tbody.querySelectorAll('.tr2-chat-co-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const companyId = parseInt(btn.dataset.companyId, 10);
        if (companyId && window.openCompanyChat) {
          window.openCompanyChat(companyId);
        }
      });
    });

    // Wire up chat button clicks
    tbody.querySelectorAll('.tr2-chat-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const studentId = parseInt(btn.dataset.id, 10);
        openStudentChat(studentId);
      });
    });

    // Wire up view button clicks
    tbody.querySelectorAll('.tr2-view-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const t = allTrainees.find(x => x.id === parseInt(btn.dataset.id, 10));
        if (t) openModal(t);
      });
    });

    // Pagination info & controls
    paginationWrap.style.display = 'flex';
    pageInfo.innerHTML = `Showing <strong>${startIndex + 1}</strong>–<strong>${endIndex}</strong> of <strong>${totalItems}</strong> trainees`;

    renderPaginationControls(pageControls, totalPages);
  }

  /* ── Render pagination controls ── */
  function renderPaginationControls(containerEl, totalPages) {
    if (totalPages <= 1) {
      containerEl.innerHTML = '';
      return;
    }

    let html = '';

    // Previous Button
    html += `<button class="tr2-pg-btn" data-action="prev" ${currentPage === 1 ? 'disabled' : ''} aria-label="Previous page">
      ${icon('chevronLeft', 13)}
    </button>`;

    // Page Number Buttons
    for (let p = 1; p <= totalPages; p++) {
      if (totalPages > 6 && Math.abs(p - currentPage) > 2 && p !== 1 && p !== totalPages) {
        if (p === currentPage - 3 || p === currentPage + 3) {
          html += `<span class="tr2-pg-ellipsis">…</span>`;
        }
        continue;
      }
      html += `<button class="tr2-pg-btn ${p === currentPage ? 'tr2-pg-btn--active' : ''}" data-page="${p}">${p}</button>`;
    }

    // Next Button
    html += `<button class="tr2-pg-btn" data-action="next" ${currentPage === totalPages ? 'disabled' : ''} aria-label="Next page">
      ${icon('chevronRight', 13)}
    </button>`;

    containerEl.innerHTML = html;

    // Attach click events
    containerEl.querySelectorAll('button:not([disabled])').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.dataset.action === 'prev') {
          currentPage = Math.max(1, currentPage - 1);
        } else if (btn.dataset.action === 'next') {
          currentPage = Math.min(totalPages, currentPage + 1);
        } else if (btn.dataset.page) {
          currentPage = parseInt(btn.dataset.page, 10);
        }
        renderTable();
      });
    });
  }

  /* ── Profile Modal ── */
  function openModal(t) {
    const root     = container.querySelector('#trainee-modal-root');
    const init     = initials(t.name);
    const targetHours = (t.requiredHours && t.requiredHours > 0) ? t.requiredHours : 600;
    const pct      = (targetHours > 0 && t.completedHours > 0)
      ? Math.min(100, Math.round((t.completedHours / targetHours) * 100))
      : 0;
    const badgeCfg = STATUS_BADGES[t.status] || { cls: 'tr2-badge--undeployed', text: t.status };
    const barColor = BAR_COLOR(pct);
    const info     = [t.course, t.year, t.section ? `Section ${t.section}` : null, t.studentId].filter(REAL).join(' · ');

    const schedDays = Array.isArray(t.schedule_days) && t.schedule_days.length ? t.schedule_days.join(', ') : null;
    const shiftStr = t.shift_start && t.shift_end ? `${t.shift_start} – ${t.shift_end} (${t.daily_hours || 8}h/day)` : null;
    const lunchStr = t.has_lunch_break !== false && t.lunch_start ? `${t.lunch_start} – ${t.lunch_end} (1h break)` : null;
    const otStr = t.allow_overtime ? `Allowed (max ${t.max_overtime_hours || 2}h/day)` : (t.schedule_days ? 'Not permitted' : null);

    const placement = [
      REAL(t.company)        ? ['Host Company',       t.company]        : null,
      REAL(t.supervisor)     ? ['Company Supervisor', t.supervisor]     : null,
      REAL(t.startDate)      ? ['Start Date',         t.startDate]      : null,
      REAL(t.estimated_end_date || t.endDate) ? [t.estimated_end_date ? 'Target End Date' : 'End Date', t.estimated_end_date || t.endDate] : null,
      REAL(schedDays)        ? ['Working Days',       schedDays]        : null,
      REAL(shiftStr)         ? ['Shift Hours',        shiftStr]         : null,
      REAL(lunchStr)         ? ['Midday Lunch',       lunchStr]         : null,
      REAL(otStr)            ? ['Overtime Policy',    otStr]            : null,
      REAL(t.companyAddress) ? ['Location',           t.companyAddress] : null,
    ].filter(Boolean);

    const logsHtml = t.dailyLogs?.length
      ? t.dailyLogs.map(l => `
          <div class="tr2-log-row">
            <span class="tr2-log-date">${l.date}</span>
            <span class="tr2-log-hrs">${l.hours}h</span>
            <span class="tr2-log-task">${REAL(l.task) ? l.task : '—'}</span>
            <span class="badge ${l.status === 'approved' ? 'badge--success' : 'badge--warning'}" style="font-size:0.65rem;">${l.status}</span>
          </div>`).join('')
      : `<p class="text-sm text-tertiary" style="padding:var(--space-3) 0;">No time logs recorded yet.</p>`;

    root.innerHTML = `
      <div class="modal-backdrop" id="tr2-modal-bd">
        <div class="modal" style="max-width:640px;border-radius:var(--radius-xl);overflow:hidden;">
          <div class="modal__header" style="border-bottom:1px solid var(--border-default);padding:var(--space-4) var(--space-6);">
            <span class="modal__title" style="font-size:var(--text-base);font-weight:700;">Trainee Academic Profile</span>
            <button class="modal__close" id="tr2-cls" style="cursor:pointer;" aria-label="Close modal">${icon('x', 18)}</button>
          </div>
          <div class="modal__body" style="padding:var(--space-6);">

            <!-- Identity Header -->
            <div class="tr2-modal-id">
              ${t.avatar_url
                ? `<img src="${storageUrl(t.avatar_url)}" alt="${t.name}" style="width:50px;height:50px;border-radius:var(--radius-full);object-fit:cover;flex-shrink:0;border:1px solid var(--border-default);" />`
                : `<div class="tr2-modal-avatar" style="background:var(--color-primary-bg);color:var(--color-primary);border:1px solid rgba(0,89,48,0.2);">${init}</div>`}
              <div class="tr2-modal-id__info">
                <h3 style="font-size:var(--text-lg);font-weight:700;margin:0 0 4px;">${t.name}</h3>
                ${info ? `<p class="text-sm text-secondary" style="margin:0 0 4px;">${info}</p>` : ''}
                <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-top:2px;">
                  ${t.email ? `<span style="font-size:0.75rem;color:var(--text-secondary);display:inline-flex;align-items:center;gap:4px;">${icon('mail', 12)} ${t.email}</span>` : ''}
                  ${REAL(t.phone) ? `<span style="font-size:0.75rem;color:var(--text-secondary);display:inline-flex;align-items:center;gap:4px;">${icon('phone', 12)} ${t.phone}</span>` : ''}
                </div>
              </div>
              <span class="tr2-badge ${badgeCfg.cls}" style="align-self:flex-start;">${badgeCfg.text}</span>
            </div>

            <!-- Hours Progress -->
            <div class="tr2-modal-prog" style="background:var(--bg-secondary);padding:var(--space-4);border-radius:var(--radius-lg);margin-bottom:var(--space-4);">
              <div class="tr2-modal-prog__labels" style="margin-bottom:6px;">
                <span style="font-size:var(--text-xs);font-weight:600;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.04em;">OJT Logged Hours</span>
                <strong style="color:${barColor};font-size:var(--text-sm);">${t.completedHours} / ${targetHours} hrs · ${pct}%${!t.hasPlacement ? ' <span style="font-size:0.75rem;font-weight:500;color:var(--text-tertiary);">(Target)</span>' : ''}</strong>
              </div>
              <div class="tr2-prog-track tr2-prog-track--lg" style="height:8px;background:var(--border-default);">
                <div class="tr2-prog-fill" style="width:${pct}%;background:${barColor};"></div>
              </div>
            </div>

            <!-- OJT Requirements Section -->
            <div style="background:${
              t.requirements?.status === 'submitted' ? 'rgba(37,99,235,0.05)' :
              t.requirements?.status === 'verified'  ? 'rgba(22,163,74,0.05)' :
              t.requirements?.status === 'needs_revision' ? 'rgba(217,119,6,0.06)' :
              'rgba(2,132,199,0.05)'
            };border:1px solid ${
              t.requirements?.status === 'submitted' ? 'rgba(37,99,235,0.22)' :
              t.requirements?.status === 'verified'  ? 'rgba(22,163,74,0.22)' :
              t.requirements?.status === 'needs_revision' ? 'rgba(217,119,6,0.25)' :
              'rgba(2,132,199,0.22)'
            };border-radius:var(--radius-lg);padding:14px 16px;margin-bottom:var(--space-5);">
              
              <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:10px;">
                <div style="display:flex;align-items:center;gap:10px;min-width:0;">
                  <div style="width:34px;height:34px;border-radius:8px;background:${
                    t.requirements?.status === 'verified' ? 'rgba(22,163,74,0.12)' :
                    t.requirements?.status === 'submitted' ? 'rgba(37,99,235,0.12)' :
                    'rgba(2,132,199,0.12)'
                  };color:${
                    t.requirements?.status === 'verified' ? '#16a34a' :
                    t.requirements?.status === 'submitted' ? '#2563eb' :
                    '#0284c7'
                  };display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                    ${icon(t.requirements?.status === 'verified' ? 'checkCircle' : 'folder', 18)}
                  </div>
                  <div>
                    <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                      <span style="font-size:var(--text-xs);font-weight:700;color:var(--text-primary);text-transform:uppercase;letter-spacing:0.04em;">
                        ${t.requirements?.title || 'OJT Requirements Packet'}
                      </span>
                      ${t.requirements ? `
                        <span class="badge ${
                          t.requirements.status === 'verified' ? 'badge--success' :
                          t.requirements.status === 'submitted' ? 'badge--info' :
                          t.requirements.status === 'needs_revision' ? 'badge--warning' : 'badge--neutral'
                        }" style="font-size:0.65rem;text-transform:capitalize;font-weight:700;padding:1px 6px;">
                          ${t.requirements.status.replace('_', ' ')}
                        </span>
                      ` : `
                        <span class="badge badge--neutral" style="font-size:0.65rem;font-weight:600;">Not Assigned</span>
                      `}
                    </div>
                    <div style="font-size:0.75rem;color:var(--text-secondary);margin-top:2px;">
                      ${t.requirements?.due_date ? `Due Date: <strong>${t.requirements.due_date}</strong> &middot; ` : ''}
                      ${Array.isArray(t.requirements?.items) ? `${t.requirements.items.length} required documents` : 'No checklist items assigned yet'}
                    </div>
                  </div>
                </div>

                <!-- Action Button in card -->
                <div>
                  <button type="button" class="btn btn--sm ${t.requirements?.status === 'submitted' ? 'btn--primary' : 'btn--outline'}" id="tr2-open-req-btn" style="gap:5px;font-size:0.75rem;">
                    ${t.requirements
                      ? (t.requirements.status === 'submitted' ? `${icon('checkSquare', 12)} Review Submission` : `${icon('list', 12)} Manage Packet`)
                      : `${icon('plus', 12)} Assign Requirements`
                    }
                  </button>
                </div>
              </div>

              <!-- Drive link sub-box -->
              <div style="background:var(--bg-card);border:1px solid var(--border-default);border-radius:8px;padding:8px 12px;display:flex;align-items:center;justify-content:space-between;gap:8px;">
                <div style="display:flex;align-items:center;gap:6px;min-width:0;flex:1;">
                  <span style="color:#0284c7;display:inline-flex;">${icon('externalLink', 12)}</span>
                  <div style="min-width:0;">
                    ${(t.requirements?.drive_url || t.requirements_drive_url) ? `
                      <a href="${t.requirements?.drive_url || t.requirements_drive_url}" target="_blank" rel="noopener" style="font-size:0.78rem;color:var(--text-primary);font-weight:600;text-decoration:underline;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${t.requirements?.drive_url || t.requirements_drive_url}">
                        ${t.requirements?.drive_url || t.requirements_drive_url}
                      </a>
                    ` : `
                      <span style="font-size:0.76rem;color:var(--text-tertiary);">No Google Drive link submitted by student yet</span>
                    `}
                  </div>
                </div>
                ${(t.requirements?.drive_url || t.requirements_drive_url) ? `
                  <a href="${t.requirements?.drive_url || t.requirements_drive_url}" target="_blank" rel="noopener" class="btn btn--ghost btn--xs" style="color:#0284c7;font-weight:600;font-size:0.72rem;gap:4px;white-space:nowrap;">
                    Open Folder ↗
                  </a>
                ` : ''}
              </div>

              <!-- Instructions / remarks snippet -->
              ${t.requirements?.supervisor_remarks ? `
                <div style="margin-top:8px;font-size:0.73rem;color:#b45309;background:rgba(245,158,11,0.08);padding:6px 10px;border-radius:6px;border:1px solid rgba(245,158,11,0.2);">
                  <strong>Last Revision Note:</strong> ${t.requirements.supervisor_remarks}
                </div>
              ` : ''}
            </div>

            <!-- Placement Details -->
            <div class="tr2-modal-section">
              <h4 class="tr2-modal-sec-title">${icon('building', 14)} Placement Information</h4>
              ${placement.length ? `
                <div class="tr2-detail-grid">
                  ${placement.map(([k, v]) => `
                    <div class="tr2-detail-row">
                      <span style="color:var(--text-secondary);font-size:var(--text-xs);font-weight:500;">${k}</span>
                      <strong style="color:var(--text-primary);font-size:var(--text-sm);font-weight:600;">${v}</strong>
                    </div>`).join('')}
                </div>` : `
                <div class="tr2-modal-empty" style="padding:var(--space-4);border:1px dashed var(--border-default);border-radius:var(--radius-lg);text-align:center;">
                  <p class="text-tertiary text-sm" style="margin:0;">No OJT host company placement recorded yet.</p>
                </div>`}
            </div>

            <!-- Flag alert -->
            ${t.flag ? `
              <div style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.25);border-radius:var(--radius-md);padding:10px 14px;display:flex;align-items:center;gap:8px;color:#DC2626;font-size:var(--text-xs);margin-bottom:var(--space-4);">
                ${icon('alertTriangle', 14)} <strong>Needs Review:</strong> Student time logs or progress require supervisor attention.
              </div>` : ''}

            <!-- Daily Logs -->
            <div class="tr2-modal-section">
              <h4 class="tr2-modal-sec-title">${icon('clock', 14)} Recent Time Logs</h4>
              <div class="tr2-logs">${logsHtml}</div>
            </div>

            <!-- Actions Footer -->
            <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:var(--space-5);padding-top:var(--space-4);border-top:1px solid var(--border-default);">
              <button class="btn btn--outline btn--sm" id="modal-close-btn">Close</button>
              ${t.company_user_id ? `
                <button class="btn btn--outline btn--sm tr2-modal-chat-co-btn" data-company-id="${t.company_user_id}" style="gap:6px;color:#0284c7;border-color:rgba(2,132,199,0.35);">
                  ${icon('building', 13)} Message Company
                </button>
              ` : ''}
              <button class="btn btn--primary btn--sm tr2-modal-chat-btn" data-id="${t.id}" style="gap:6px;">
                ${icon('messageCircle', 13)} Message Student
              </button>
              ${t.email ? `<a href="mailto:${t.email}" class="btn btn--outline btn--sm" style="gap:6px;">${icon('mail', 13)} Email Student</a>` : ''}
            </div>

          </div>
        </div>
      </div>`;

    const close = () => { root.innerHTML = ''; };
    root.querySelector('#tr2-cls').addEventListener('click', close);
    root.querySelector('#modal-close-btn').addEventListener('click', close);
    root.querySelector('.tr2-modal-chat-co-btn')?.addEventListener('click', () => {
      const compId = t.company_user_id;
      close();
      if (compId && window.openCompanyChat) {
        window.openCompanyChat(compId);
      }
    });
    root.querySelector('#tr2-open-req-btn')?.addEventListener('click', () => {
      close();
      if (t.requirements) {
        openReviewRequirementsModal({
          requirement: t.requirements,
          studentName: t.name,
          requirementsDriveUrl: t.requirements.drive_url || t.requirements_drive_url || '',
          onReviewed: () => {
            loadTrainees();
          },
          onReassign: () => {
            openAssignRequirementsModal({
              studentId: t.id,
              studentName: t.name,
              program: t.course || '',
              onAssigned: () => {
                loadTrainees();
              }
            });
          }
        });
      } else {
        openAssignRequirementsModal({
          studentId: t.id,
          studentName: t.name,
          program: t.course || '',
          onAssigned: () => {
            loadTrainees();
          }
        });
      }
    });
    root.querySelector('.tr2-modal-chat-btn')?.addEventListener('click', () => {
      close();
      openStudentChat(t.id);
    });
    root.querySelector('#tr2-modal-bd').addEventListener('click', e => {
      if (e.target.id === 'tr2-modal-bd') close();
    });
  }

  async function openStudentChat(studentId) {
    try {
      const res = await apiGet(`/chat/init/coordinator/${studentId}`);
      if (res?.key && window.openChat) {
        window.openChat(res.key);
      }
    } catch (err) {
      console.error('Failed to open chat with student:', err);
    }
  }

  // ── Reactive Real-Time Event Listener (Zero Hard Refresh) ──
  const onTraineesRefresh = () => {
    if (document.body.contains(container)) {
      loadTrainees();
    }
  };
  if (container._refreshHandler) {
    window.removeEventListener('hireme:trainees-refresh', container._refreshHandler);
  }
  container._refreshHandler = onTraineesRefresh;
  window.addEventListener('hireme:trainees-refresh', onTraineesRefresh);
}

