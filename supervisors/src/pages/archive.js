/* ==========================================================================
   Trainee Archive Page — Supervisor Portal
   Permanent Repository of Graduated OJT Trainees, Practicum Records & Dossiers
   ========================================================================== */

import { icon } from '../components/icons.js';
import { apiGet, storageUrl } from '../api/client.js';
import { getState } from '../store.js';

const PER_PAGE = 10;

function escapeHtml(str = '') {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function initials(name = '') {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

export default function archivePage(container) {
  const user = getState('user') || {};
  const programName = user.course || 'OJT';

  container.innerHTML = `
    <!-- ═══ Page Header ═══ -->
    <div class="tr2-page-head anim-fade-in-up">
      <div class="tr2-page-head__left">
        <div class="tr2-page-head__badge-row">
          <span class="tr2-program-pill">${escapeHtml(programName)} Program Coordinator</span>
          <span class="tr2-cohort-pill" id="arch-cohort-count" style="background:rgba(0,89,48,0.1);color:#005930;border-color:rgba(0,89,48,0.25);">
            Loading archive…
          </span>
        </div>
        <h1 class="tr2-page-head__title">
          <span>Trainee Archive &amp; Historical Records</span>
        </h1>
        <p class="tr2-page-head__sub">Permanent historical repository of promoted and graduated OJT trainees, completed practicum records, company evaluations, and career tracer statuses.</p>
      </div>
      <div class="tr2-page-head__actions">
        <button class="tr2-refresh-btn" id="arch-refresh-btn" title="Refresh Archived Records">
          ${icon('refreshCw', 15)} <span>Refresh Data</span>
        </button>
        <button class="btn btn--outline btn--sm" id="arch-export-btn" style="gap:7px;font-size:0.85rem;font-weight:600;padding:8px 16px;border-color:#A7F3D0;background:#ECFDF5;color:#005930;" title="Download accredited OJT completion report for accreditation audits">
          ${icon('download', 15)} <span>Export CSV Roster</span>
        </button>
      </div>
    </div>

    <!-- ═══ Interactive KPI Metric Strip ═══ -->
    <div class="tr2-kpi-row anim-stagger" id="arch-kpis">
      ${[1, 2, 3, 4].map(() => '<div class="skeleton skeleton--card" style="height:96px;border-radius:16px;"></div>').join('')}
    </div>

    <!-- ═══ Filter & Search Control Card ═══ -->
    <div class="tr2-control-card anim-fade-in-up">
      <div class="tr2-filter-toolbar">
        <div class="tr2-search-wrap">
          ${icon('search', 16)}
          <input class="tr2-search-input" id="arch-search" placeholder="Search by student name, student ID, company, email, or section…" autocomplete="off" />
          <button class="tr2-search-clear" id="arch-search-clear" aria-label="Clear search" style="display:none;" type="button">
            ${icon('x', 14)}
          </button>
        </div>

        <div class="tr2-filter-tools">
          <!-- Batch Selector -->
          <div class="tr2-select-wrap">
            ${icon('graduationCap', 14)}
            <select class="tr2-select" id="arch-batch-filter" title="Filter by Graduating Batch">
              <option value="">All Batches</option>
            </select>
          </div>

          <!-- Section Selector -->
          <div class="tr2-select-wrap">
            ${icon('filter', 14)}
            <select class="tr2-select" id="arch-section-filter" title="Filter by Section">
              <option value="">All Sections</option>
            </select>
          </div>

          <!-- Employment Status Selector -->
          <div class="tr2-select-wrap">
            ${icon('briefcase', 14)}
            <select class="tr2-select" id="arch-employment-filter" title="Filter by Employment Tracer Status">
              <option value="">All Employment Statuses</option>
              <option value="employed">Employed / Working</option>
              <option value="freelance">Freelance / Self-Employed</option>
              <option value="looking">Looking for Work (Seeking)</option>
              <option value="studying">Pursuing Further Studies</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ Enterprise Data Table Card ═══ -->
    <div class="tr2-table-card anim-fade-in-up">
      <div class="tr2-table-wrap">
        <table class="tr2-table" id="arch-table">
          <thead>
            <tr>
              <th style="min-width:240px;">Graduated Trainee</th>
              <th style="min-width:140px;">Batch &amp; Section</th>
              <th style="min-width:200px;">Host Training Establishment</th>
              <th style="min-width:160px;">Rendered Hours</th>
              <th style="min-width:130px;">Company Rating</th>
              <th style="min-width:130px;">Tracer Status</th>
              <th style="text-align:right;min-width:130px;">Actions</th>
            </tr>
          </thead>
          <tbody id="arch-tbody">
            <tr>
              <td colspan="7" style="text-align:center;padding:48px 16px;">
                <div class="skeleton" style="height:32px;width:180px;margin:0 auto 12px;border-radius:8px;"></div>
                <div class="skeleton" style="height:16px;width:300px;margin:0 auto;border-radius:4px;"></div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Footer -->
      <div class="tr2-table-footer" id="arch-footer" style="display:none;">
        <div class="tr2-footer-info" id="arch-info">Showing 0 of 0 graduates</div>
        <div class="tr2-pagination" id="arch-pagination"></div>
      </div>
    </div>

    <!-- Container for Detail Dossier Modal -->
    <div id="arch-modal-container"></div>
  `;

  let allGraduates = [];
  let filteredGraduates = [];
  let currentPage = 1;
  let activeKpiKey = 'all';

  const searchInput = container.querySelector('#arch-search');
  const searchClear = container.querySelector('#arch-search-clear');
  const batchFilter = container.querySelector('#arch-batch-filter');
  const sectionFilter = container.querySelector('#arch-section-filter');
  const employmentFilter = container.querySelector('#arch-employment-filter');
  const tbody = container.querySelector('#arch-tbody');
  const footer = container.querySelector('#arch-footer');
  const info = container.querySelector('#arch-info');
  const pagination = container.querySelector('#arch-pagination');
  const cohortCount = container.querySelector('#arch-cohort-count');
  const refreshBtn = container.querySelector('#arch-refresh-btn');
  const exportBtn = container.querySelector('#arch-export-btn');

  // ── Fetch Archive Data ──────────────────────────────────────────────────
  async function loadArchiveData() {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center;padding:48px 16px;">
          <div style="display:inline-flex;align-items:center;gap:10px;font-size:0.95rem;color:var(--text-secondary);font-weight:500;">
            <div class="spinner-sm" style="width:20px;height:20px;border:2px solid #CED2E2;border-top-color:#005930;border-radius:50%;animation:spin 0.8s linear infinite;"></div>
            Loading archived trainee cohorts…
          </div>
        </td>
      </tr>`;

    try {
      const res = await apiGet('/supervisor/archive');
      if (res && res.success) {
        allGraduates = res.data || [];
        populateFilters(res.batches || [], res.sections || []);
        renderKpis(res.kpis || {});
        cohortCount.textContent = `${allGraduates.length} Archived Trainees`;
        applyFilters();
      } else {
        tbody.innerHTML = `
          <tr>
            <td colspan="7" style="text-align:center;padding:40px 16px;color:#DC2626;">
              ${icon('alertCircle', 20)} Failed to load archive records.
            </td>
          </tr>`;
      }
    } catch (err) {
      console.error('[archive] load error', err);
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center;padding:40px 16px;color:#DC2626;">
            Error communicating with server. Please try refreshing.
          </td>
        </tr>`;
    }
  }

  // ── Populate Filter Dropdowns ──────────────────────────────────────────
  function populateFilters(batches, sections) {
    const currentBatch = batchFilter.value;
    const currentSection = sectionFilter.value;

    batchFilter.innerHTML = '<option value="">All Batches</option>' +
      batches.map(b => `<option value="${escapeHtml(b)}" ${b === currentBatch ? 'selected' : ''}>Batch ${escapeHtml(b)}</option>`).join('');

    sectionFilter.innerHTML = '<option value="">All Sections</option>' +
      sections.map(s => `<option value="${escapeHtml(s)}" ${s === currentSection ? 'selected' : ''}>Section ${escapeHtml(s)}</option>`).join('');
  }

  // ── Render KPI Cards ───────────────────────────────────────────────────
  function renderKpis(kpis) {
    const kpiRow = container.querySelector('#arch-kpis');
    const total = kpis.total_graduates ?? allGraduates.length;
    const hours = (kpis.total_hours ?? 0).toLocaleString();
    const rating = kpis.avg_score ? `${Number(kpis.avg_score).toFixed(2)} / 5.0` : '5.0 / 5.0';
    const rate = `${kpis.employment_rate ?? 0}%`;

    const kpiData = [
      {
        key: 'all',
        val: total,
        label: 'Graduated Trainees',
        sub: 'Archived alumni records',
        ic: 'graduationCap',
        bg: 'rgba(0, 89, 48, 0.12)',
        color: '#005930',
      },
      {
        key: 'hours',
        val: hours + ' h',
        label: 'OJT Hours Rendered',
        sub: 'Verified curriculum hours',
        ic: 'clock',
        bg: 'rgba(16, 185, 129, 0.12)',
        color: '#10B981',
      },
      {
        key: 'eval',
        val: rating,
        label: 'Avg. Host Evaluation',
        sub: 'Verified company rubrics',
        ic: 'starFilled',
        bg: 'rgba(245, 158, 11, 0.12)',
        color: '#F59E0B',
      },
      {
        key: 'employed',
        val: rate,
        label: 'Employment Placement',
        sub: `${kpis.employed_count ?? 0} confirmed employed`,
        ic: 'briefcase',
        bg: 'rgba(99, 102, 241, 0.12)',
        color: '#6366F1',
      },
    ];

    kpiRow.innerHTML = kpiData.map(k => `
      <div class="tr2-kpi ${activeKpiKey === k.key ? 'is-selected' : ''}" data-kpi="${k.key}" style="cursor:pointer;">
        <div class="tr2-kpi__icon" style="background:${k.bg};color:${k.color};">
          ${icon(k.ic, 24)}
        </div>
        <div class="tr2-kpi__content">
          <div class="tr2-kpi__val">${k.val}</div>
          <div class="tr2-kpi__lbl">${k.label}</div>
          <div class="tr2-kpi__sub">${k.sub}</div>
        </div>
      </div>
    `).join('');

    kpiRow.querySelectorAll('.tr2-kpi').forEach(card => {
      card.addEventListener('click', () => {
        const key = card.dataset.kpi;
        activeKpiKey = key;
        kpiRow.querySelectorAll('.tr2-kpi').forEach(c => c.classList.remove('is-selected'));
        card.classList.add('is-selected');

        if (key === 'employed') {
          employmentFilter.value = 'employed';
        } else {
          employmentFilter.value = '';
        }
        currentPage = 1;
        applyFilters();
      });
    });
  }

  // ── Apply Filters ──────────────────────────────────────────────────────
  function applyFilters() {
    const q = searchInput.value.trim().toLowerCase();
    const batch = batchFilter.value;
    const section = sectionFilter.value;
    const employment = employmentFilter.value.toLowerCase();

    filteredGraduates = allGraduates.filter(g => {
      if (q) {
        const nameMatch = (g.name || '').toLowerCase().includes(q);
        const idMatch = (g.student_id || '').toLowerCase().includes(q);
        const emailMatch = (g.email || '').toLowerCase().includes(q);
        const compMatch = (g.company_name || '').toLowerCase().includes(q);
        const secMatch = (g.section || '').toLowerCase().includes(q);
        if (!nameMatch && !idMatch && !emailMatch && !compMatch && !secMatch) return false;
      }
      if (batch && g.batch !== batch) return false;
      if (section && g.section !== section) return false;
      if (employment) {
        const emp = (g.employment_status || '').toLowerCase();
        if (employment === 'employed' && emp !== 'employed' && emp !== 'freelance') return false;
        if (employment !== 'employed' && emp !== employment) return false;
      }
      return true;
    });

    renderTable();
  }

  // ── Render Data Table ──────────────────────────────────────────────────
  function renderTable() {
    const totalItems = filteredGraduates.length;

    if (totalItems === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center;padding:56px 20px;">
            <div style="width:64px;height:64px;border-radius:50%;background:rgba(0,89,48,0.08);color:#005930;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
              ${icon('graduationCap', 32)}
            </div>
            <h3 style="font-size:1.1rem;font-weight:700;color:var(--text-primary);margin:0 0 6px;">No Archived Trainees Found</h3>
            <p style="font-size:0.875rem;color:var(--text-secondary);max-width:440px;margin:0 auto 16px;">
              ${allGraduates.length === 0
                ? 'No students have been promoted to Graduate/Alumni status in your program yet. When students complete their 600 hours and are promoted by the administration, their permanent records will appear here.'
                : 'No archived records match your selected search terms or filters. Try resetting the filters.'}
            </p>
            ${allGraduates.length > 0 ? `<button class="btn btn--outline btn--sm" id="arch-reset-filters-btn" style="gap:6px;">${icon('refreshCw', 13)} Reset Filters</button>` : ''}
          </td>
        </tr>`;

      footer.style.display = 'none';

      container.querySelector('#arch-reset-filters-btn')?.addEventListener('click', () => {
        searchInput.value = '';
        searchClear.style.display = 'none';
        batchFilter.value = '';
        sectionFilter.value = '';
        employmentFilter.value = '';
        currentPage = 1;
        applyFilters();
      });
      return;
    }

    const totalPages = Math.max(1, Math.ceil(totalItems / PER_PAGE));
    if (currentPage > totalPages) currentPage = totalPages;
    const startIndex = (currentPage - 1) * PER_PAGE;
    const endIndex = Math.min(totalItems, startIndex + PER_PAGE);
    const pageData = filteredGraduates.slice(startIndex, endIndex);

    tbody.innerHTML = pageData.map(g => {
      const avatarSrc = g.avatar ? storageUrl(g.avatar) : null;
      const avatarHtml = avatarSrc
        ? `<img src="${avatarSrc}" alt="${escapeHtml(g.name)}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" onerror="this.onerror=null;this.parentElement.textContent='${initials(g.name)}';" />`
        : initials(g.name);

      const ratingBadge = g.evaluation_score
        ? `<div style="display:inline-flex;align-items:center;gap:4px;background:#FFFBEB;color:#B45309;border:1px solid #FDE68A;border-radius:20px;padding:3px 9px;font-size:0.82rem;font-weight:700;">
             ${icon('starFilled', 13)} ${Number(g.evaluation_score).toFixed(2)}
           </div>`
        : `<span style="color:var(--text-tertiary);font-size:0.82rem;">Not Graded</span>`;

      let empCls = 'tr2-badge--undeployed';
      let empText = 'Seeking Work';
      const emp = (g.employment_status || '').toLowerCase();
      if (emp === 'employed' || emp === 'freelance') {
        empCls = 'tr2-badge--active';
        empText = emp === 'freelance' ? 'Self-Employed' : 'Employed';
      } else if (emp === 'studying') {
        empCls = 'tr2-badge--leave';
        empText = 'Further Studies';
      }

      return `
        <tr data-student-id="${g.id}">
          <!-- Trainee Info -->
          <td>
            <div style="display:flex;align-items:center;gap:12px;">
              <div style="width:40px;height:40px;border-radius:50%;background:rgba(0,89,48,0.1);color:#005930;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.85rem;flex-shrink:0;">
                ${avatarHtml}
              </div>
              <div style="min-width:0;">
                <div style="font-weight:700;font-size:0.92rem;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                  ${escapeHtml(g.name)}
                </div>
                <div style="font-size:0.75rem;color:var(--text-secondary);display:flex;gap:6px;align-items:center;margin-top:2px;">
                  <span>ID: <strong>${escapeHtml(g.student_id)}</strong></span>
                  <span>•</span>
                  <span>${escapeHtml(g.email)}</span>
                </div>
              </div>
            </div>
          </td>

          <!-- Batch & Section -->
          <td>
            <div style="display:flex;flex-direction:column;gap:3px;align-items:flex-start;">
              <span class="badge-req-indicator badge-req-indicator--verified" style="font-size:0.75rem;padding:3px 8px;">
                ${icon('graduationCap', 12)} Batch ${escapeHtml(g.batch)}
              </span>
              <span style="font-size:0.78rem;color:var(--text-secondary);font-weight:600;padding-left:2px;">
                Sec: ${escapeHtml(g.section)}
              </span>
            </div>
          </td>

          <!-- Host Company -->
          <td>
            <div style="min-width:0;">
              <div style="font-weight:600;font-size:0.88rem;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${escapeHtml(g.company_name)}">
                ${escapeHtml(g.company_name)}
              </div>
              <div style="font-size:0.75rem;color:var(--text-secondary);margin-top:2px;">
                Supervisor: ${escapeHtml(g.supervisor_name)}
              </div>
            </div>
          </td>

          <!-- Rendered Hours -->
          <td>
            <div style="display:flex;flex-direction:column;gap:4px;min-width:130px;">
              <div style="display:flex;justify-content:space-between;font-size:0.8rem;font-weight:700;">
                <span style="color:#005930;">${Math.round(g.completed_hours)} hrs</span>
                <span style="color:var(--text-secondary);font-size:0.75rem;">100% Completed</span>
              </div>
              <div style="width:100%;height:6px;background:#E2E8F0;border-radius:99px;overflow:hidden;">
                <div style="width:100%;height:100%;background:#005930;border-radius:99px;"></div>
              </div>
            </div>
          </td>

          <!-- Company Evaluation -->
          <td>
            ${ratingBadge}
          </td>

          <!-- Tracer Status -->
          <td>
            <span class="tr2-badge ${empCls}" style="font-size:0.75rem;">
              ${escapeHtml(empText)}
            </span>
          </td>

          <!-- Actions -->
          <td style="text-align:right;">
            <button class="btn btn--outline btn--sm arch-view-dossier-btn" data-id="${g.id}" style="gap:6px;font-size:0.8rem;padding:6px 12px;border-color:var(--color-primary);color:var(--color-primary);">
              ${icon('fileText', 14)} <span>View Dossier</span>
            </button>
          </td>
        </tr>`;
    }).join('');

    // Pagination display
    footer.style.display = 'flex';
    info.textContent = `Showing ${startIndex + 1} to ${endIndex} of ${totalItems} archived trainees`;

    pagination.innerHTML = `
      <button class="tr2-page-btn" id="arch-prev-btn" ${currentPage === 1 ? 'disabled' : ''}>
        ${icon('chevronLeft', 16)}
      </button>
      <span class="tr2-page-indicator">Page ${currentPage} of ${totalPages}</span>
      <button class="tr2-page-btn" id="arch-next-btn" ${currentPage === totalPages ? 'disabled' : ''}>
        ${icon('chevronRight', 16)}
      </button>`;

    container.querySelector('#arch-prev-btn')?.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        renderTable();
      }
    });

    container.querySelector('#arch-next-btn')?.addEventListener('click', () => {
      if (currentPage < totalPages) {
        currentPage++;
        renderTable();
      }
    });

    // Wire up Dossier Buttons
    tbody.querySelectorAll('.arch-view-dossier-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const studentId = btn.dataset.id;
        openDossierModal(studentId);
      });
    });
  }

  // ── Open Full OJT Dossier Modal ─────────────────────────────────────────
  async function openDossierModal(userId) {
    const modalContainer = container.querySelector('#arch-modal-container');
    modalContainer.innerHTML = `
      <div class="modal-backdrop modal-backdrop-open" id="dossier-backdrop" style="position:fixed;inset:0;background:rgba(26,26,46,0.6);backdrop-filter:blur(4px);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;">
        <div class="modal-box" style="background:var(--bg-elevated);width:100%;max-width:820px;max-height:90vh;border-radius:18px;box-shadow:0 20px 40px rgba(0,0,0,0.2);display:flex;flex-direction:column;overflow:hidden;animation:fadeIn 0.2s ease;">
          <div style="padding:24px 28px;border-bottom:1px solid var(--border-default);display:flex;justify-content:space-between;align-items:center;">
            <div style="display:flex;align-items:center;gap:12px;">
              <div style="width:40px;height:40px;border-radius:10px;background:rgba(0,89,48,0.12);color:#005930;display:flex;align-items:center;justify-content:center;">
                ${icon('graduationCap', 22)}
              </div>
              <div>
                <h3 style="margin:0;font-size:1.15rem;font-weight:700;color:var(--text-primary);">OJT Historical Dossier</h3>
                <p style="margin:2px 0 0;font-size:0.8rem;color:var(--text-secondary);">Comprehensive practicum records &amp; verified performance rubrics</p>
              </div>
            </div>
            <button id="dossier-close-btn" style="background:none;border:none;cursor:pointer;color:var(--text-secondary);padding:6px;border-radius:8px;display:flex;">
              ${icon('x', 20)}
            </button>
          </div>
          <div id="dossier-modal-body" style="padding:28px;overflow-y:auto;flex:1;">
            <div style="text-align:center;padding:40px 0;">
              <div class="spinner-sm" style="width:28px;height:28px;border:3px solid #CED2E2;border-top-color:#005930;border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto 12px;"></div>
              <div style="font-size:0.9rem;color:var(--text-secondary);">Fetching trainee dossier from historical vault…</div>
            </div>
          </div>
        </div>
      </div>`;

    const closeBtn = modalContainer.querySelector('#dossier-close-btn');
    const backdrop = modalContainer.querySelector('#dossier-backdrop');
    const closeModal = () => { modalContainer.innerHTML = ''; };
    closeBtn.addEventListener('click', closeModal);
    backdrop.addEventListener('click', e => { if (e.target === backdrop) closeModal(); });

    try {
      const res = await apiGet(`/supervisor/archive/${userId}`);
      if (res && res.success && res.data) {
        renderDossierContent(modalContainer.querySelector('#dossier-modal-body'), res.data);
      } else {
        modalContainer.querySelector('#dossier-modal-body').innerHTML = `
          <div style="text-align:center;padding:32px;color:#DC2626;">
            ${icon('alertCircle', 24)}<br>Failed to retrieve dossier data.
          </div>`;
      }
    } catch (err) {
      console.error('[dossier] fetch error', err);
      modalContainer.querySelector('#dossier-modal-body').innerHTML = `
        <div style="text-align:center;padding:32px;color:#DC2626;">
          An error occurred while loading this trainee dossier.
        </div>`;
    }
  }

  // ── Render Dossier Details Inside Modal ─────────────────────────────────
  function renderDossierContent(containerEl, data) {
    const ojt = data.ojt || {};
    const evals = data.evaluations || [];
    const logs = data.logs || [];
    const reqs = data.requirements || [];

    const avatarSrc = data.avatar ? storageUrl(data.avatar) : null;
    const avatarHtml = avatarSrc
      ? `<img src="${avatarSrc}" alt="${escapeHtml(data.name)}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" onerror="this.onerror=null;this.parentElement.textContent='${initials(data.name)}';" />`
      : initials(data.name);

    containerEl.innerHTML = `
      <!-- Trainee Profile Card -->
      <div style="display:flex;align-items:center;gap:18px;background:var(--bg-primary);border:1px solid var(--border-default);border-radius:14px;padding:18px;margin-bottom:24px;">
        <div style="width:60px;height:60px;border-radius:50%;background:rgba(0,89,48,0.12);color:#005930;display:flex;align-items:center;justify-content:center;font-size:1.25rem;font-weight:700;flex-shrink:0;">
          ${avatarHtml}
        </div>
        <div style="flex:1;min-width:0;">
          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
            <h2 style="margin:0;font-size:1.2rem;font-weight:700;color:var(--text-primary);">${escapeHtml(data.name)}</h2>
            <span class="badge-req-indicator badge-req-indicator--verified" style="font-size:0.75rem;">
              🎓 Batch ${escapeHtml(data.batch)}
            </span>
          </div>
          <div style="display:flex;gap:14px;color:var(--text-secondary);font-size:0.82rem;margin-top:6px;flex-wrap:wrap;">
            <span>Student ID: <strong>${escapeHtml(data.student_id)}</strong></span>
            <span>Program: <strong>${escapeHtml(data.program)}</strong></span>
            <span>Section: <strong>${escapeHtml(data.section)}</strong></span>
            <span>Campus: <strong>${escapeHtml(data.campus)}</strong></span>
          </div>
        </div>
      </div>

      <!-- Dossier Tabs -->
      <div style="display:flex;gap:8px;border-bottom:1px solid var(--border-default);margin-bottom:20px;">
        <button class="dossier-tab-btn is-active" data-tab="tab-practicum" style="padding:10px 16px;background:none;border:none;border-bottom:2px solid #005930;color:#005930;font-weight:700;font-size:0.88rem;cursor:pointer;">
          Practicum &amp; Hours
        </button>
        <button class="dossier-tab-btn" data-tab="tab-evals" style="padding:10px 16px;background:none;border:none;border-bottom:2px solid transparent;color:var(--text-secondary);font-weight:600;font-size:0.88rem;cursor:pointer;">
          Company Evaluations (${evals.length})
        </button>
        <button class="dossier-tab-btn" data-tab="tab-logs" style="padding:10px 16px;background:none;border:none;border-bottom:2px solid transparent;color:var(--text-secondary);font-weight:600;font-size:0.88rem;cursor:pointer;">
          Time Record Logs (${logs.length})
        </button>
      </div>

      <!-- Tab Content: Practicum -->
      <div id="tab-practicum" class="dossier-tab-content" style="display:block;">
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:16px;margin-bottom:20px;">
          <div style="background:var(--bg-secondary);padding:14px;border-radius:12px;border:1px solid var(--border-default);">
            <div style="font-size:0.75rem;color:var(--text-secondary);font-weight:600;text-transform:uppercase;">Host Company</div>
            <div style="font-size:1rem;font-weight:700;color:var(--text-primary);margin-top:4px;">${escapeHtml(ojt.company)}</div>
            <div style="font-size:0.78rem;color:var(--text-secondary);margin-top:2px;">${escapeHtml(ojt.location)}</div>
          </div>
          <div style="background:var(--bg-secondary);padding:14px;border-radius:12px;border:1px solid var(--border-default);">
            <div style="font-size:0.75rem;color:var(--text-secondary);font-weight:600;text-transform:uppercase;">Company Supervisor</div>
            <div style="font-size:1rem;font-weight:700;color:var(--text-primary);margin-top:4px;">${escapeHtml(ojt.supervisor)}</div>
            <div style="font-size:0.78rem;color:var(--text-secondary);margin-top:2px;">Authorized Mentor</div>
          </div>
          <div style="background:var(--bg-secondary);padding:14px;border-radius:12px;border:1px solid var(--border-default);">
            <div style="font-size:0.75rem;color:var(--text-secondary);font-weight:600;text-transform:uppercase;">Internship Period</div>
            <div style="font-size:0.95rem;font-weight:700;color:var(--text-primary);margin-top:4px;">${escapeHtml(ojt.start_date)} — ${escapeHtml(ojt.end_date)}</div>
            <div style="font-size:0.78rem;color:#005930;font-weight:600;margin-top:2px;">✓ 600 Hours Completed</div>
          </div>
        </div>
      </div>

      <!-- Tab Content: Company Evaluations -->
      <div id="tab-evals" class="dossier-tab-content" style="display:none;">
        ${evals.length === 0 ? `
          <div style="text-align:center;padding:32px;color:var(--text-secondary);">No submitted evaluations found.</div>
        ` : evals.map((ev, i) => `
          <div style="border:1px solid var(--border-default);border-radius:12px;padding:16px;margin-bottom:12px;background:var(--bg-elevated);">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:10px;">
              <div>
                <strong style="font-size:0.95rem;color:var(--text-primary);">${escapeHtml(ev.month_label || `Evaluation #${i+1}`)}</strong>
                <span style="font-size:0.78rem;color:var(--text-secondary);margin-left:8px;">Evaluated on ${escapeHtml(ev.submitted_at)}</span>
              </div>
              <div style="display:inline-flex;align-items:center;gap:4px;background:#FFFBEB;color:#B45309;border:1px solid #FDE68A;border-radius:16px;padding:4px 10px;font-weight:700;font-size:0.85rem;">
                ${icon('starFilled', 14)} ${Number(ev.overall_score).toFixed(2)} / 5.0
              </div>
            </div>
            <div style="font-size:0.85rem;color:var(--text-secondary);background:var(--bg-primary);padding:10px 14px;border-radius:8px;font-style:italic;">
              "${escapeHtml(ev.recommendation || 'Satisfactorily completed training competencies with commendable dedication.')}"
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Tab Content: Time Logs -->
      <div id="tab-logs" class="dossier-tab-content" style="display:none;">
        ${logs.length === 0 ? `
          <div style="text-align:center;padding:32px;color:var(--text-secondary);">No approved daily time logs found.</div>
        ` : `
          <div style="border:1px solid var(--border-default);border-radius:12px;overflow:hidden;">
            <table style="width:100%;border-collapse:collapse;font-size:0.85rem;">
              <thead style="background:var(--bg-secondary);border-bottom:1px solid var(--border-default);">
                <tr>
                  <th style="padding:10px 14px;text-align:left;font-weight:600;">Date</th>
                  <th style="padding:10px 14px;text-align:left;font-weight:600;">Hours</th>
                  <th style="padding:10px 14px;text-align:left;font-weight:600;">Task Summary</th>
                  <th style="padding:10px 14px;text-align:right;font-weight:600;">Status</th>
                </tr>
              </thead>
              <tbody>
                ${logs.map(l => `
                  <tr style="border-bottom:1px solid var(--border-default);">
                    <td style="padding:10px 14px;font-weight:600;">${escapeHtml(l.date)}</td>
                    <td style="padding:10px 14px;color:#005930;font-weight:700;">${l.hours_rendered} hrs</td>
                    <td style="padding:10px 14px;color:var(--text-secondary);">${escapeHtml(l.description)}</td>
                    <td style="padding:10px 14px;text-align:right;">
                      <span class="tr2-badge tr2-badge--active" style="font-size:0.72rem;">Approved</span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    `;

    // Dossier tab navigation
    containerEl.querySelectorAll('.dossier-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.tab;
        containerEl.querySelectorAll('.dossier-tab-btn').forEach(b => {
          b.style.borderBottomColor = 'transparent';
          b.style.color = 'var(--text-secondary)';
          b.classList.remove('is-active');
        });
        btn.style.borderBottomColor = '#005930';
        btn.style.color = '#005930';
        btn.classList.add('is-active');

        containerEl.querySelectorAll('.dossier-tab-content').forEach(c => c.style.display = 'none');
        const showEl = containerEl.querySelector(`#${target}`);
        if (showEl) showEl.style.display = 'block';
      });
    });
  }

  // ── CSV Export Functionality ───────────────────────────────────────────
  function exportCsvRoster() {
    if (filteredGraduates.length === 0) {
      alert('No records available to export.');
      return;
    }

    const headers = [
      'Student ID',
      'Full Name',
      'Email',
      'Program',
      'Campus',
      'Section',
      'Batch',
      'Host Training Establishment',
      'Company Supervisor',
      'Completed Hours',
      'Required Hours',
      'Company Evaluation Rating',
      'Employment Tracer Status',
      'Graduation Promoted Date'
    ];

    const rows = filteredGraduates.map(g => [
      `"${g.student_id || ''}"`,
      `"${(g.name || '').replace(/"/g, '""')}"`,
      `"${g.email || ''}"`,
      `"${g.program || ''}"`,
      `"${g.campus || ''}"`,
      `"${g.section || ''}"`,
      `"${g.batch || ''}"`,
      `"${(g.company_name || '').replace(/"/g, '""')}"`,
      `"${(g.supervisor_name || '').replace(/"/g, '""')}"`,
      g.completed_hours || 0,
      g.required_hours || 600,
      g.evaluation_score || 'N/A',
      `"${g.employment_status || 'Seeking'}"`,
      `"${g.promoted_at || ''}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CHMSU_OJT_Trainee_Archive_${programName.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // ── Event Listeners ────────────────────────────────────────────────────
  let debounceTimer = null;
  searchInput.addEventListener('input', () => {
    const hasVal = Boolean(searchInput.value.trim());
    searchClear.style.display = hasVal ? 'flex' : 'none';
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      currentPage = 1;
      applyFilters();
    }, 250);
  });

  searchClear.addEventListener('click', () => {
    searchInput.value = '';
    searchClear.style.display = 'none';
    currentPage = 1;
    applyFilters();
    searchInput.focus();
  });

  batchFilter.addEventListener('change', () => {
    currentPage = 1;
    applyFilters();
  });

  sectionFilter.addEventListener('change', () => {
    currentPage = 1;
    applyFilters();
  });

  employmentFilter.addEventListener('change', () => {
    currentPage = 1;
    applyFilters();
  });

  refreshBtn.addEventListener('click', () => {
    loadArchiveData();
  });

  exportBtn.addEventListener('click', () => {
    exportCsvRoster();
  });

  // Initial load
  loadArchiveData();
}
