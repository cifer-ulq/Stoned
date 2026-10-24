/**
 * CHMSU HireMe — Company Portal Employee Directory & Staff Roster
 * Complete workforce management for hired CHMSU graduates & regular staff.
 */
import { icon } from '../components/icons.js';
import { apiGet, apiPost, apiPut } from '../api/client.js';

export async function renderEmployees(container) {
  let employees = [];
  let meta = { total: 0, regular: 0, probationary: 0, contractual: 0, on_leave: 0, departments: [] };
  let activeDept = 'all';
  let activeStatus = 'all';
  let searchQuery = '';
  let selectedEmployee = null;

  container.innerHTML = `
    <style id="company-employees-styles">
      .co-emp-page {
        display: flex;
        flex-direction: column;
        gap: 20px;
        padding-bottom: 50px;
        color: var(--text-primary);
        font-family: inherit;
      }

      /* ── Masthead ── */
      .co-emp-masthead {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        flex-wrap: wrap;
        padding: 4px 0 2px 0;
      }
      .co-emp-tagline {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: #005930;
        margin-bottom: 4px;
      }
      .co-emp-tagline__pulse {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: #005930;
        box-shadow: 0 0 0 3px rgba(0, 89, 48, 0.15);
      }
      .co-emp-title {
        font-size: 1.55rem;
        font-weight: 800;
        color: var(--text-primary);
        margin: 0 0 4px 0;
        line-height: 1.25;
        letter-spacing: -0.015em;
      }
      .co-emp-subtitle {
        font-size: 0.88rem;
        color: var(--text-secondary);
        margin: 0;
        line-height: 1.45;
      }
      .co-emp-actions {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
      }

      /* ── KPI Pulse Strip ── */
      .co-emp-pulse {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 14px;
      }
      .co-emp-kpi {
        background: var(--bg-surface, #ffffff);
        border: 1px solid var(--border-color, #e2e8f0);
        border-radius: 14px;
        padding: 16px 18px;
        display: flex;
        align-items: center;
        gap: 14px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
        transition: transform 0.15s ease, box-shadow 0.15s ease;
      }
      .co-emp-kpi:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
      }
      .co-emp-kpi__icon {
        width: 44px;
        height: 44px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .co-emp-kpi__val {
        font-size: 1.45rem;
        font-weight: 800;
        line-height: 1.2;
        color: var(--text-primary);
      }
      .co-emp-kpi__lbl {
        font-size: 0.78rem;
        font-weight: 600;
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }

      /* ── Filter / Control Bar ── */
      .co-emp-controls {
        background: var(--bg-surface, #ffffff);
        border: 1px solid var(--border-color, #e2e8f0);
        border-radius: 14px;
        padding: 14px 18px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
      }
      .co-emp-controls__top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        flex-wrap: wrap;
      }
      .co-emp-search {
        position: relative;
        flex: 1;
        min-width: 260px;
      }
      .co-emp-search__icon {
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        color: var(--text-tertiary, #94a3b8);
        pointer-events: none;
        display: flex;
      }
      .co-emp-search input {
        width: 100%;
        height: 38px;
        border-radius: 9px;
        border: 1px solid var(--border-color, #cbd5e1);
        padding: 0 12px 0 36px;
        font-size: 0.88rem;
        background: var(--bg-primary, #f8fafc);
        color: var(--text-primary);
        outline: none;
        transition: border-color 0.15s ease;
      }
      .co-emp-search input:focus {
        border-color: #005930;
        background: #ffffff;
      }
      .co-emp-status-tabs {
        display: flex;
        align-items: center;
        gap: 6px;
        background: var(--bg-primary, #f1f5f9);
        padding: 4px;
        border-radius: 9px;
      }
      .co-emp-tab {
        border: none;
        background: none;
        font-size: 0.8rem;
        font-weight: 600;
        padding: 5px 12px;
        border-radius: 7px;
        cursor: pointer;
        color: var(--text-secondary);
        transition: all 0.15s ease;
      }
      .co-emp-tab--active {
        background: #ffffff;
        color: #005930;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
      }
      .co-emp-dept-scroll {
        display: flex;
        gap: 6px;
        overflow-x: auto;
        padding-bottom: 2px;
      }
      .co-dept-chip {
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 0.77rem;
        font-weight: 600;
        border: 1px solid var(--border-color, #e2e8f0);
        background: var(--bg-surface, #ffffff);
        color: var(--text-secondary);
        cursor: pointer;
        white-space: nowrap;
        transition: all 0.15s ease;
      }
      .co-dept-chip:hover {
        border-color: #005930;
        color: #005930;
      }
      .co-dept-chip--active {
        background: #005930;
        color: #ffffff;
        border-color: #005930;
      }

      /* ── Roster Table ── */
      .co-emp-card {
        background: var(--bg-surface, #ffffff);
        border: 1px solid var(--border-color, #e2e8f0);
        border-radius: 14px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
      }
      .co-emp-table {
        width: 100%;
        min-width: 680px;
        border-collapse: collapse;
        text-align: left;
        font-size: 0.88rem;
      }
      .co-emp-table th {
        background: var(--bg-primary, #f8fafc);
        padding: 12px 16px;
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--text-secondary);
        border-bottom: 1px solid var(--border-color, #e2e8f0);
      }
      .co-emp-table td {
        padding: 14px 16px;
        border-bottom: 1px solid var(--border-color, #f1f5f9);
        vertical-align: middle;
      }
      .co-emp-table tr:hover td {
        background: rgba(0, 89, 48, 0.015);
      }

      /* ── Status Pills ── */
      .co-status-pill {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        font-size: 0.76rem;
        font-weight: 700;
        padding: 3px 10px;
        border-radius: 20px;
        text-transform: capitalize;
      }
      .co-status-pill--regular {
        background: rgba(16, 185, 129, 0.12);
        color: #059669;
      }
      .co-status-pill--probationary {
        background: rgba(245, 158, 11, 0.14);
        color: #d97706;
      }
      .co-status-pill--contractual {
        background: rgba(59, 130, 246, 0.12);
        color: #2563eb;
      }
      .co-status-pill--on-leave {
        background: rgba(107, 114, 128, 0.12);
        color: #4b5563;
      }
      .co-status-pill--resigned {
        background: rgba(239, 68, 68, 0.12);
        color: #dc2626;
      }

      /* ── Member Info Cell ── */
      .co-emp-cell {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .co-emp-avatar {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: #005930;
        color: #ffffff;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.95rem;
        overflow: hidden;
        flex-shrink: 0;
      }
      .co-emp-avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .co-emp-meta__name {
        font-weight: 700;
        color: var(--text-primary);
        line-height: 1.3;
      }
      .co-emp-meta__chmsu {
        font-size: 0.74rem;
        color: #005930;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .co-emp-meta__num {
        font-size: 0.73rem;
        color: var(--text-tertiary);
        font-family: monospace;
      }

      /* ── Modal & Overlays ── */
      .co-emp-modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(15, 23, 42, 0.6);
        backdrop-filter: blur(4px);
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        animation: fadeIn 0.2s ease-out;
      }
      .co-emp-modal-card {
        background: #ffffff;
        border-radius: 18px;
        width: 100%;
        max-width: 600px;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        display: flex;
        flex-direction: column;
      }
      .co-emp-modal-header {
        padding: 18px 22px;
        border-bottom: 1px solid var(--border-color, #e2e8f0);
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .co-emp-modal-body {
        padding: 22px;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .co-emp-modal-footer {
        padding: 14px 22px;
        border-top: 1px solid var(--border-color, #e2e8f0);
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 10px;
        background: var(--bg-primary, #f8fafc);
        border-radius: 0 0 18px 18px;
      }
      .co-emp-empty {
        padding: 60px 20px;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        color: var(--text-secondary);
      }
      .co-emp-empty__icon {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: rgba(0, 89, 48, 0.08);
        color: #005930;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 6px;
      }

      /* ── Responsive Form Grids & Dossier ── */
      .co-emp-grid-2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
      .co-emp-grid-full {
        grid-column: span 2;
      }
      .co-emp-table-wrapper {
        width: 100%;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
      }
      .co-emp-dossier-profile {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px;
        background: var(--bg-primary, #f8fafc);
        border-radius: 12px;
        border: 1px solid var(--border-color, #e2e8f0);
      }
      .co-emp-dossier-avatar {
        width: 54px;
        height: 54px;
        border-radius: 50%;
        background: #005930;
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;
        font-weight: 700;
        overflow: hidden;
        flex-shrink: 0;
      }
      .co-emp-dossier-avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .co-emp-dossier-info {
        flex: 1;
        min-width: 0;
      }
      .co-emp-dossier-name {
        margin: 0 0 4px 0;
        font-size: 1.15rem;
        font-weight: 800;
        color: var(--text-primary);
        word-break: break-word;
      }
      .co-emp-dossier-meta {
        font-size: 0.82rem;
        color: var(--text-secondary);
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        word-break: break-word;
      }
      .co-emp-dossier-status {
        flex-shrink: 0;
      }

      @media (max-width: 900px) {
        .co-emp-pulse {
          grid-template-columns: repeat(2, 1fr);
        }
      }
      @media (max-width: 768px) {
        .co-emp-masthead {
          flex-direction: column;
          align-items: stretch;
          gap: 12px;
        }
        .co-emp-title {
          font-size: 1.38rem;
        }
        .co-emp-subtitle {
          font-size: 0.84rem;
        }
        .co-emp-actions {
          width: 100%;
          display: flex;
          gap: 8px;
        }
        .co-emp-actions .btn {
          flex: 1 1 calc(50% - 4px);
          min-height: 42px;
          justify-content: center;
        }
        .co-emp-controls__top {
          flex-direction: column;
          align-items: stretch;
          gap: 10px;
        }
        .co-emp-search {
          width: 100%;
          min-width: 0;
        }
        .co-emp-search input {
          font-size: 16px;
          height: 40px;
        }
        .co-emp-status-tabs {
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          flex-wrap: nowrap;
          justify-content: flex-start;
          padding: 4px;
        }
        .co-emp-status-tabs::-webkit-scrollbar {
          display: none;
        }
        .co-emp-tab {
          flex-shrink: 0;
          white-space: nowrap;
          min-height: 36px;
          padding: 6px 12px;
        }
        .co-emp-dept-scroll {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          flex-wrap: nowrap;
        }
        .co-emp-dept-scroll::-webkit-scrollbar {
          display: none;
        }
        .co-dept-chip {
          flex-shrink: 0;
          white-space: nowrap;
          min-height: 32px;
        }
        .co-emp-table {
          min-width: 700px;
        }
        .co-emp-modal-body .form-input {
          font-size: 16px;
        }
      }
      @media (max-width: 576px) {
        .co-emp-actions {
          flex-direction: column;
        }
        .co-emp-actions .btn {
          width: 100%;
          flex: 1 1 100%;
        }
        .co-emp-pulse {
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }
        .co-emp-kpi {
          padding: 12px 14px;
          gap: 10px;
        }
        .co-emp-kpi__icon {
          width: 38px;
          height: 38px;
        }
        .co-emp-kpi__val {
          font-size: 1.25rem;
        }
        .co-emp-kpi__lbl {
          font-size: 0.7rem;
        }
        .co-emp-grid-2 {
          grid-template-columns: 1fr;
          gap: 10px;
        }
        .co-emp-grid-full {
          grid-column: span 1;
        }
        .co-emp-table th,
        .co-emp-table td {
          padding: 10px 12px;
          font-size: 0.82rem;
        }
        .co-emp-modal-overlay {
          padding: 10px 8px;
          align-items: center;
          justify-content: center;
        }
        .co-emp-modal-card {
          width: 100%;
          max-width: 100%;
          max-height: 92vh;
          border-radius: 16px;
          margin: 0;
        }
        .co-emp-modal-header {
          padding: 14px 16px;
        }
        .co-emp-modal-body {
          padding: 16px 14px;
          gap: 12px;
        }
        .co-emp-modal-footer {
          padding: 12px 14px;
          flex-direction: column-reverse;
          gap: 8px;
        }
        .co-emp-modal-footer .btn {
          width: 100%;
          min-height: 44px;
          justify-content: center;
        }
        .co-emp-dossier-profile {
          flex-wrap: wrap;
          gap: 12px;
          padding: 12px;
        }
        .co-emp-dossier-status {
          width: 100%;
          margin-top: 2px;
        }
      }
      @media (max-width: 360px) {
        .co-emp-pulse {
          grid-template-columns: 1fr;
          gap: 8px;
        }
        .co-emp-kpi {
          padding: 10px 12px;
        }
        .co-emp-title {
          font-size: 1.2rem;
        }
        .co-emp-subtitle {
          font-size: 0.78rem;
        }
        .co-emp-tab {
          padding: 5px 10px;
          font-size: 0.76rem;
        }
        .co-dept-chip {
          padding: 4px 10px;
          font-size: 0.74rem;
        }
        .co-emp-modal-header h3 {
          font-size: 1rem;
        }
      }
    </style>

    <div class="co-emp-page">
      <!-- Masthead -->
      <div class="co-emp-masthead">
        <div>
          <div class="co-emp-tagline">
            <span class="co-emp-tagline__pulse"></span>
            Company Workforce &bull; Active Employees &amp; Staff Roster
          </div>
          <h1 class="co-emp-title">Employee Directory &amp; Staff Roster</h1>
          <p class="co-emp-subtitle">
            Manage hired CHMSU graduates, job roles, department deployment, salary compensation, and active employment records.
          </p>
        </div>
        <div class="co-emp-actions">
          <button type="button" class="btn btn--outline" id="btn-export-roster">
            ${icon('fileText', 16)} Export Roster
          </button>
          <button type="button" class="btn btn--primary" id="btn-add-hire" style="background:#005930;border-color:#005930;">
            ${icon('userPlus', 16)} Add Hired Staff
          </button>
        </div>
      </div>

      <!-- KPI Strip -->
      <div class="co-emp-pulse" id="emp-pulse-strip">
        <div class="co-emp-kpi">
          <div class="co-emp-kpi__icon" style="background:rgba(0,89,48,0.1);color:#005930;">
            ${icon('users', 22)}
          </div>
          <div>
            <div class="co-emp-kpi__val" id="kpi-total">0</div>
            <div class="co-emp-kpi__lbl">Total Employees</div>
          </div>
        </div>
        <div class="co-emp-kpi">
          <div class="co-emp-kpi__icon" style="background:rgba(16,185,129,0.12);color:#059669;">
            ${icon('userCheck', 22)}
          </div>
          <div>
            <div class="co-emp-kpi__val" id="kpi-regular">0</div>
            <div class="co-emp-kpi__lbl">Regular Staff</div>
          </div>
        </div>
        <div class="co-emp-kpi">
          <div class="co-emp-kpi__icon" style="background:rgba(245,158,11,0.12);color:#d97706;">
            ${icon('clock', 22)}
          </div>
          <div>
            <div class="co-emp-kpi__val" id="kpi-probationary">0</div>
            <div class="co-emp-kpi__lbl">Probationary</div>
          </div>
        </div>
        <div class="co-emp-kpi">
          <div class="co-emp-kpi__icon" style="background:rgba(59,130,246,0.12);color:#2563eb;">
            ${icon('layers', 22)}
          </div>
          <div>
            <div class="co-emp-kpi__val" id="kpi-departments">0</div>
            <div class="co-emp-kpi__lbl">Departments</div>
          </div>
        </div>
      </div>

      <!-- Control Bar -->
      <div class="co-emp-controls">
        <div class="co-emp-controls__top">
          <div class="co-emp-search">
            <span class="co-emp-search__icon">${icon('search', 16)}</span>
            <input type="text" id="emp-search-input" placeholder="Search employee name, role, skills, or degree..." />
          </div>
          <div class="co-emp-status-tabs" id="emp-status-tabs">
            <button type="button" class="co-emp-tab co-emp-tab--active" data-status="all">All (${meta.total || 0})</button>
            <button type="button" class="co-emp-tab" data-status="regular">Regular</button>
            <button type="button" class="co-emp-tab" data-status="probationary">Probationary</button>
            <button type="button" class="co-emp-tab" data-status="contractual">Contractual</button>
          </div>
        </div>

        <!-- Department filter scroll -->
        <div class="co-emp-dept-scroll" id="emp-dept-scroll">
          <button type="button" class="co-dept-chip co-dept-chip--active" data-dept="all">All Departments</button>
        </div>
      </div>

      <!-- Roster Card Table -->
      <div class="co-emp-card">
        <div id="emp-table-container" class="co-emp-table-wrapper">
          <div style="padding:40px;text-align:center;color:var(--text-secondary);">
            Loading staff roster...
          </div>
        </div>
      </div>
    </div>
  `;

  // Fetch data
  await loadData();

  async function loadData() {
    try {
      const res = await apiGet('/company/employees');
      if (res?.success) {
        employees = res.data || [];
        meta = res.meta || { total: 0, regular: 0, probationary: 0, contractual: 0, on_leave: 0, departments: [] };
        updateKpis();
        renderDeptChips();
        renderTable();
      }
    } catch (err) {
      console.error('Failed to load employees:', err);
      container.querySelector('#emp-table-container').innerHTML = `
        <div class="co-emp-empty">
          <div class="co-emp-empty__icon">${icon('alertCircle', 26)}</div>
          <h3 style="margin:0;font-weight:700;">Failed to Load Roster</h3>
          <p style="margin:0;font-size:0.88rem;">Please check your internet connection and try refreshing.</p>
          <button type="button" class="btn btn--primary" id="btn-retry-emp" style="margin-top:10px;">Retry</button>
        </div>
      `;
      container.querySelector('#btn-retry-emp')?.addEventListener('click', loadData);
    }
  }

  function updateKpis() {
    container.querySelector('#kpi-total').textContent = meta.total || 0;
    container.querySelector('#kpi-regular').textContent = meta.regular || 0;
    container.querySelector('#kpi-probationary').textContent = meta.probationary || 0;
    container.querySelector('#kpi-departments').textContent = (meta.departments || []).length || 0;

    const allTab = container.querySelector('[data-status="all"]');
    if (allTab) allTab.textContent = `All (${meta.total || 0})`;
  }

  function renderDeptChips() {
    const scrollEl = container.querySelector('#emp-dept-scroll');
    const depts = meta.departments || [];
    scrollEl.innerHTML = `
      <button type="button" class="co-dept-chip ${activeDept === 'all' ? 'co-dept-chip--active' : ''}" data-dept="all">All Departments</button>
      ${depts.map(d => `
        <button type="button" class="co-dept-chip ${activeDept === d ? 'co-dept-chip--active' : ''}" data-dept="${escapeHtml(d)}">
          ${escapeHtml(d)}
        </button>
      `).join('')}
    `;

    scrollEl.querySelectorAll('.co-dept-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        scrollEl.querySelectorAll('.co-dept-chip').forEach(b => b.classList.remove('co-dept-chip--active'));
        btn.classList.add('co-dept-chip--active');
        activeDept = btn.dataset.dept;
        renderTable();
      });
    });
  }

  function filterEmployees() {
    return employees.filter(emp => {
      // Dept filter
      if (activeDept !== 'all' && emp.department !== activeDept) return false;

      // Status filter
      if (activeStatus !== 'all' && (emp.employment_status || '').toLowerCase() !== activeStatus.toLowerCase()) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const skillsStr = (emp.skills || []).join(' ').toLowerCase();
        const combined = `${emp.name} ${emp.job_title} ${emp.department} ${emp.course} ${emp.employee_number} ${skillsStr}`.toLowerCase();
        if (!combined.includes(q)) return false;
      }

      return true;
    });
  }

  function renderTable() {
    const tableWrap = container.querySelector('#emp-table-container');
    const filtered = filterEmployees();

    if (!filtered.length) {
      tableWrap.innerHTML = `
        <div class="co-emp-empty">
          <div class="co-emp-empty__icon">${icon('users', 28)}</div>
          <h3 style="margin:0;font-weight:700;color:var(--text-primary);">No Employees Found</h3>
          <p style="margin:0;font-size:0.88rem;max-width:400px;">
            ${employees.length === 0
              ? 'Your company does not have any recorded employees yet. When an applicant accepts your job offer or you click "Add Hired Staff", they will appear here.'
              : 'No staff members match the selected department or status filters.'}
          </p>
          ${employees.length === 0 ? `
            <button type="button" class="btn btn--primary" id="btn-empty-add" style="margin-top:12px;background:#005930;border-color:#005930;">
              ${icon('userPlus', 16)} Add First Hired Staff
            </button>
          ` : ''}
        </div>
      `;
      tableWrap.querySelector('#btn-empty-add')?.addEventListener('click', openAddHireModal);
      return;
    }

    tableWrap.innerHTML = `
      <table class="co-emp-table">
        <thead>
          <tr>
            <th>Employee &amp; Academic Background</th>
            <th>Role &amp; Department</th>
            <th>Status</th>
            <th>Start Date</th>
            <th>Salary</th>
            <th style="text-align:right;">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${filtered.map(emp => {
            const initials = (emp.name || 'EM').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
            const avatarHtml = emp.avatar_url
              ? `<img src="${escapeHtml(emp.avatar_url)}" alt="${escapeHtml(emp.name)}" />`
              : initials;

            const st = (emp.employment_status || 'Probationary').toLowerCase();
            const pillCls = st.includes('reg') ? 'regular' : (st.includes('prob') ? 'probationary' : (st.includes('cont') ? 'contractual' : (st.includes('leave') ? 'on-leave' : 'regular')));

            return `
              <tr>
                <td>
                  <div class="co-emp-cell">
                    <div class="co-emp-avatar">${avatarHtml}</div>
                    <div class="co-emp-meta">
                      <div class="co-emp-meta__name">${escapeHtml(emp.name)}</div>
                      <div class="co-emp-meta__chmsu">
                        ${icon('graduationCap', 12)} ${escapeHtml(emp.course || 'CHMSU Graduate')} &bull; ${escapeHtml(emp.campus || 'Main')}
                      </div>
                      <div class="co-emp-meta__num">${escapeHtml(emp.employee_number || 'EMP-N/A')} &bull; Class of ${escapeHtml(emp.year_graduated || 'Alumni')}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div style="font-weight:700;color:var(--text-primary);">${escapeHtml(emp.job_title)}</div>
                  <div style="font-size:0.78rem;color:var(--text-secondary);">${escapeHtml(emp.department)} &bull; ${escapeHtml(emp.employment_type || 'Full-time')}</div>
                </td>
                <td>
                  <span class="co-status-pill co-status-pill--${pillCls}">
                    ${escapeHtml(emp.employment_status || 'Probationary')}
                  </span>
                </td>
                <td>
                  <div style="font-weight:600;font-size:0.85rem;">${formatDate(emp.start_date)}</div>
                  <div style="font-size:0.74rem;color:var(--text-tertiary);">Hired ${escapeHtml(emp.hired_date || '')}</div>
                </td>
                <td>
                  <div style="font-weight:700;color:#005930;font-size:0.87rem;">${escapeHtml(emp.salary || 'Negotiable')}</div>
                </td>
                <td style="text-align:right;white-space:nowrap;">
                  <div style="display:inline-flex;gap:6px;flex-wrap:nowrap;">
                    <button type="button" class="btn btn--outline btn--sm btn-view-dossier" data-id="${emp.id}" title="View Details" style="white-space:nowrap;min-height:32px;">
                      ${icon('eye', 14)} Dossier
                    </button>
                    <button type="button" class="btn btn--outline btn--sm btn-edit-emp" data-id="${emp.id}" title="Update Status" style="white-space:nowrap;min-height:32px;">
                      ${icon('edit', 14)} Edit
                    </button>
                  </div>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;

    // Bind action buttons
    tableWrap.querySelectorAll('.btn-view-dossier').forEach(btn => {
      btn.addEventListener('click', () => {
        const emp = employees.find(e => String(e.id) === btn.dataset.id);
        if (emp) openDossierModal(emp);
      });
    });

    tableWrap.querySelectorAll('.btn-edit-emp').forEach(btn => {
      btn.addEventListener('click', () => {
        const emp = employees.find(e => String(e.id) === btn.dataset.id);
        if (emp) openEditEmpModal(emp);
      });
    });
  }

  // Search input binding
  const searchInput = container.querySelector('#emp-search-input');
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderTable();
  });

  // Status tabs binding
  container.querySelectorAll('#emp-status-tabs .co-emp-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      container.querySelectorAll('#emp-status-tabs .co-emp-tab').forEach(t => t.classList.remove('co-emp-tab--active'));
      tab.classList.add('co-emp-tab--active');
      activeStatus = tab.dataset.status;
      renderTable();
    });
  });

  // Export Roster button
  container.querySelector('#btn-export-roster').addEventListener('click', () => {
    if (!employees.length) {
      alert('No employee records to export.');
      return;
    }
    const headers = ['Employee ID', 'Name', 'Email', 'Role', 'Department', 'Course', 'Campus', 'Year Graduated', 'Status', 'Start Date', 'Salary'];
    const rows = employees.map(e => [
      e.employee_number,
      `"${e.name}"`,
      e.email,
      `"${e.job_title}"`,
      `"${e.department}"`,
      `"${e.course}"`,
      `"${e.campus}"`,
      e.year_graduated,
      e.employment_status,
      e.start_date,
      `"${e.salary}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CHMSU_HireMe_Employee_Roster_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  // Add Hired Staff button
  container.querySelector('#btn-add-hire').addEventListener('click', openAddHireModal);

  /* ── Modal: View Employee Dossier ── */
  function openDossierModal(emp) {
    const overlay = document.createElement('div');
    overlay.className = 'co-emp-modal-overlay';
    const initials = (emp.name || 'EM').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

    overlay.innerHTML = `
      <div class="co-emp-modal-card">
        <div class="co-emp-modal-header">
          <div style="display:flex;align-items:center;gap:10px;">
            <div style="width:34px;height:34px;border-radius:50%;background:rgba(0,89,48,0.1);color:#005930;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
              ${icon('award', 18)}
            </div>
            <div>
              <h3 style="margin:0;font-size:1.15rem;font-weight:700;">Employee Dossier</h3>
              <div style="font-size:0.75rem;color:var(--text-tertiary);">${escapeHtml(emp.employee_number)}</div>
            </div>
          </div>
          <button type="button" class="btn btn--outline btn--sm" id="btn-close-dossier" style="padding:4px 8px;min-width:32px;min-height:32px;">&times;</button>
        </div>

        <div class="co-emp-modal-body">
          <!-- Profile Card -->
          <div class="co-emp-dossier-profile">
            <div class="co-emp-dossier-avatar">
              ${emp.avatar_url ? `<img src="${escapeHtml(emp.avatar_url)}" alt="${escapeHtml(emp.name)}" />` : initials}
            </div>
            <div class="co-emp-dossier-info">
              <h4 class="co-emp-dossier-name">${escapeHtml(emp.name)}</h4>
              <div class="co-emp-dossier-meta">
                <span>${icon('mail', 12)} ${escapeHtml(emp.email)}</span>
                ${emp.work_email && emp.work_email !== emp.email ? `<span>&bull; ${icon('briefcase', 12)} ${escapeHtml(emp.work_email)}</span>` : ''}
              </div>
            </div>
            <div class="co-emp-dossier-status">
              <span class="co-status-pill co-status-pill--${(emp.employment_status || '').toLowerCase().includes('reg') ? 'regular' : 'probationary'}">
                ${escapeHtml(emp.employment_status || 'Probationary')}
              </span>
            </div>
          </div>

          <!-- Academic & Degree Alignment -->
          <div style="border:1px solid var(--border-color,#e2e8f0);border-radius:12px;padding:14px;">
            <div style="font-size:0.75rem;font-weight:700;text-transform:uppercase;color:#005930;letter-spacing:0.04em;margin-bottom:8px;">
              ${icon('graduationCap', 13)} CHMSU Academic Profile
            </div>
            <div class="co-emp-grid-2" style="font-size:0.85rem;">
              <div>
                <span style="color:var(--text-tertiary);display:block;font-size:0.72rem;">DEGREE PROGRAM</span>
                <strong>${escapeHtml(emp.course || 'BSIT')}</strong>
              </div>
              <div>
                <span style="color:var(--text-tertiary);display:block;font-size:0.72rem;">CAMPUS &amp; BATCH</span>
                <strong>${escapeHtml(emp.campus || 'Main')} &bull; Class of ${escapeHtml(emp.year_graduated || 'Alumni')}</strong>
              </div>
            </div>
          </div>

          <!-- Employment Details -->
          <div style="border:1px solid var(--border-color,#e2e8f0);border-radius:12px;padding:14px;">
            <div style="font-size:0.75rem;font-weight:700;text-transform:uppercase;color:#005930;letter-spacing:0.04em;margin-bottom:8px;">
              ${icon('briefcase', 13)} Company Deployment Details
            </div>
            <div class="co-emp-grid-2" style="font-size:0.85rem;">
              <div>
                <span style="color:var(--text-tertiary);display:block;font-size:0.72rem;">DESIGNATION</span>
                <strong>${escapeHtml(emp.job_title)}</strong>
              </div>
              <div>
                <span style="color:var(--text-tertiary);display:block;font-size:0.72rem;">DEPARTMENT</span>
                <strong>${escapeHtml(emp.department)}</strong>
              </div>
              <div>
                <span style="color:var(--text-tertiary);display:block;font-size:0.72rem;">START DATE</span>
                <strong>${formatDate(emp.start_date)}</strong>
              </div>
              <div>
                <span style="color:var(--text-tertiary);display:block;font-size:0.72rem;">COMPENSATION</span>
                <strong style="color:#005930;">${escapeHtml(emp.salary || 'Negotiable')}</strong>
              </div>
              ${emp.supervisor_name ? `
                <div class="co-emp-grid-full">
                  <span style="color:var(--text-tertiary);display:block;font-size:0.72rem;">REPORTING SUPERVISOR</span>
                  <strong>${escapeHtml(emp.supervisor_name)}</strong>
                </div>
              ` : ''}
            </div>
          </div>

          <!-- Skills -->
          ${emp.skills && emp.skills.length ? `
            <div>
              <div style="font-size:0.75rem;font-weight:700;text-transform:uppercase;color:var(--text-secondary);letter-spacing:0.04em;margin-bottom:6px;">
                Verified Skills &amp; Competencies
              </div>
              <div style="display:flex;flex-wrap:wrap;gap:6px;">
                ${emp.skills.map(s => `
                  <span style="font-size:0.75rem;padding:3px 10px;border-radius:12px;background:var(--bg-primary,#f1f5f9);color:var(--text-primary);border:1px solid var(--border-color,#e2e8f0);font-weight:600;">
                    ${escapeHtml(s)}
                  </span>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <!-- Notes -->
          ${emp.employee_notes ? `
            <div style="padding:12px;background:rgba(0,89,48,0.03);border-left:3px solid #005930;border-radius:4px;font-size:0.84rem;color:var(--text-secondary);">
              <strong style="color:var(--text-primary);display:block;margin-bottom:3px;">HR &amp; Performance Remarks:</strong>
              ${escapeHtml(emp.employee_notes)}
            </div>
          ` : ''}
        </div>

        <div class="co-emp-modal-footer">
          <button type="button" class="btn btn--outline" id="btn-dossier-close">Close</button>
          <button type="button" class="btn btn--primary" id="btn-dossier-edit" style="background:#005930;border-color:#005930;">
            ${icon('edit', 14)} Edit Employment Record
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelector('#btn-close-dossier').onclick = () => overlay.remove();
    overlay.querySelector('#btn-dossier-close').onclick = () => overlay.remove();
    overlay.querySelector('#btn-dossier-edit').onclick = () => {
      overlay.remove();
      openEditEmpModal(emp);
    };
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });
  }

  /* ── Modal: Edit Employee Record ── */
  function openEditEmpModal(emp) {
    const overlay = document.createElement('div');
    overlay.className = 'co-emp-modal-overlay';

    overlay.innerHTML = `
      <div class="co-emp-modal-card">
        <div class="co-emp-modal-header">
          <div style="display:flex;align-items:center;gap:10px;">
            <div style="width:34px;height:34px;border-radius:50%;background:rgba(0,89,48,0.1);color:#005930;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
              ${icon('edit', 18)}
            </div>
            <div>
              <h3 style="margin:0;font-size:1.15rem;font-weight:700;">Update Employment Record</h3>
              <div style="font-size:0.75rem;color:var(--text-tertiary);">${escapeHtml(emp.name)} &bull; ${escapeHtml(emp.employee_number)}</div>
            </div>
          </div>
          <button type="button" class="btn btn--outline btn--sm" id="btn-close-edit" style="padding:4px 8px;min-width:32px;min-height:32px;">&times;</button>
        </div>

        <form id="form-edit-emp">
          <div class="co-emp-modal-body">
            <div class="form-group">
              <label class="form-label">Employment Status *</label>
              <select class="form-input" name="employment_status" required>
                <option value="Probationary" ${emp.employment_status === 'Probationary' ? 'selected' : ''}>Probationary</option>
                <option value="Regular" ${emp.employment_status === 'Regular' ? 'selected' : ''}>Regular (Tenured)</option>
                <option value="Contractual" ${emp.employment_status === 'Contractual' ? 'selected' : ''}>Contractual</option>
                <option value="On Leave" ${emp.employment_status === 'On Leave' ? 'selected' : ''}>On Leave</option>
                <option value="Resigned" ${emp.employment_status === 'Resigned' ? 'selected' : ''}>Resigned</option>
              </select>
            </div>

            <div class="co-emp-grid-2">
              <div class="form-group">
                <label class="form-label">Employee ID / Number</label>
                <input type="text" class="form-input" name="employee_number" value="${escapeHtml(emp.employee_number || '')}" />
              </div>
              <div class="form-group">
                <label class="form-label">Start Date *</label>
                <input type="date" class="form-input" name="start_date" value="${escapeHtml(emp.start_date || '')}" required />
              </div>
            </div>

            <div class="co-emp-grid-2">
              <div class="form-group">
                <label class="form-label">Monthly Salary</label>
                <input type="text" class="form-input" name="salary" value="${escapeHtml(emp.salary || '')}" placeholder="e.g. ₱45,000/month" />
              </div>
              <div class="form-group">
                <label class="form-label">Department</label>
                <input type="text" class="form-input" name="department" value="${escapeHtml(emp.department || '')}" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Reporting Supervisor / Lead</label>
              <input type="text" class="form-input" name="supervisor_name" value="${escapeHtml(emp.supervisor_name || '')}" placeholder="e.g. Engineering Lead" />
            </div>

            <div class="form-group">
              <label class="form-label">HR / Employment Notes</label>
              <textarea class="form-input form-textarea" name="employee_notes" rows="3" placeholder="Performance appraisal notes, promotion remarks, or probationary milestones...">${escapeHtml(emp.employee_notes || '')}</textarea>
            </div>

            <p id="edit-emp-error" style="color:#dc2626;font-size:0.83rem;margin:0;"></p>
          </div>

          <div class="co-emp-modal-footer">
            <button type="button" class="btn btn--outline" id="btn-cancel-edit">Cancel</button>
            <button type="submit" class="btn btn--primary" id="btn-submit-edit" style="background:#005930;border-color:#005930;">
              ${icon('checkCircle', 14)} Save Record Changes
            </button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelector('#btn-close-edit').onclick = () => overlay.remove();
    overlay.querySelector('#btn-cancel-edit').onclick = () => overlay.remove();
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });

    overlay.querySelector('#form-edit-emp').addEventListener('submit', async (e) => {
      e.preventDefault();
      const form = new FormData(e.target);
      const submitBtn = overlay.querySelector('#btn-submit-edit');
      const errEl = overlay.querySelector('#edit-emp-error');
      errEl.textContent = '';
      submitBtn.disabled = true;
      submitBtn.textContent = 'Saving...';

      const payload = {
        employment_status: form.get('employment_status'),
        employee_number: form.get('employee_number'),
        start_date: form.get('start_date'),
        salary: form.get('salary'),
        department: form.get('department'),
        supervisor_name: form.get('supervisor_name'),
        employee_notes: form.get('employee_notes'),
      };

      try {
        const res = await apiPut(`/company/employees/${emp.id}`, payload);
        if (res?.success) {
          overlay.remove();
          showToast('Employee record updated successfully!');
          await loadData();
        } else {
          errEl.textContent = res?.message || 'Failed to update employee record.';
          submitBtn.disabled = false;
          submitBtn.innerHTML = `${icon('checkCircle', 14)} Save Record Changes`;
        }
      } catch (err) {
        errEl.textContent = 'A network error occurred. Please try again.';
        submitBtn.disabled = false;
        submitBtn.innerHTML = `${icon('checkCircle', 14)} Save Record Changes`;
      }
    });
  }

  /* ── Modal: Add Hired Staff ── */
  async function openAddHireModal() {
    const overlay = document.createElement('div');
    overlay.className = 'co-emp-modal-overlay';

    overlay.innerHTML = `
      <div class="co-emp-modal-card">
        <div class="co-emp-modal-header">
          <div style="display:flex;align-items:center;gap:10px;">
            <div style="width:34px;height:34px;border-radius:50%;background:rgba(0,89,48,0.1);color:#005930;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
              ${icon('userPlus', 18)}
            </div>
            <div>
              <h3 style="margin:0;font-size:1.15rem;font-weight:700;">Record Hired CHMSU Graduate</h3>
              <div style="font-size:0.75rem;color:var(--text-tertiary);">Add an alumni hire to your company roster</div>
            </div>
          </div>
          <button type="button" class="btn btn--outline btn--sm" id="btn-close-add" style="padding:4px 8px;min-width:32px;min-height:32px;">&times;</button>
        </div>

        <div id="add-hire-modal-content" style="padding:40px;text-align:center;color:var(--text-secondary);">
          Loading available CHMSU graduates &amp; job listings...
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    overlay.querySelector('#btn-close-add').onclick = () => overlay.remove();
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });

    try {
      const res = await apiGet('/company/employees/available-candidates');
      if (!res?.success) throw new Error();

      const candidates = res.candidates || [];
      const jobs = res.jobs || [];

      const bodyEl = overlay.querySelector('#add-hire-modal-content');
      bodyEl.style.padding = '0';
      bodyEl.style.textAlign = 'left';

      bodyEl.innerHTML = `
        <form id="form-add-hire">
          <div class="co-emp-modal-body">
            <!-- Candidate picker -->
            <div class="form-group">
              <label class="form-label">Select CHMSU Graduate / Candidate *</label>
              <select class="form-input" name="candidate_user_id" required>
                <option value="">-- Choose a graduate --</option>
                ${candidates.map(c => `
                  <option value="${c.id}">${escapeHtml(c.name)} &bull; ${escapeHtml(c.course)} (${escapeHtml(c.campus)}, ${c.year_graduated})</option>
                `).join('')}
              </select>
            </div>

            <!-- Job listing picker -->
            <div class="form-group">
              <label class="form-label">Position / Job Opening *</label>
              <select class="form-input" name="job_listing_id" required>
                <option value="">-- Choose job opening --</option>
                ${jobs.map(j => `
                  <option value="${j.id}" data-dept="${escapeHtml(j.department || '')}" data-salary="${escapeHtml(j.salary_range || '')}">
                    ${escapeHtml(j.title)} &bull; ${escapeHtml(j.department || 'General')} (${escapeHtml(j.employment_type || 'Full-time')})
                  </option>
                `).join('')}
              </select>
            </div>

            <div class="co-emp-grid-2">
              <div class="form-group">
                <label class="form-label">Employment Status *</label>
                <select class="form-input" name="employment_status" required>
                  <option value="Probationary">Probationary</option>
                  <option value="Regular">Regular</option>
                  <option value="Contractual">Contractual</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Start Date *</label>
                <input type="date" class="form-input" name="start_date" value="${new Date().toISOString().split('T')[0]}" required />
              </div>
            </div>

            <div class="co-emp-grid-2">
              <div class="form-group">
                <label class="form-label">Monthly Salary *</label>
                <input type="text" class="form-input" name="salary" id="add-salary" placeholder="e.g. ₱40,000/month" required />
              </div>
              <div class="form-group">
                <label class="form-label">Employee ID (Optional)</label>
                <input type="text" class="form-input" name="employee_number" placeholder="e.g. EMP-2026-009" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Department</label>
              <input type="text" class="form-input" name="department" id="add-dept" placeholder="Department" />
            </div>

            <div class="form-group">
              <label class="form-label">HR / Onboarding Remarks</label>
              <textarea class="form-input form-textarea" name="employee_notes" rows="2" placeholder="Hiring notes or onboarding checklist..."></textarea>
            </div>

            <p id="add-hire-error" style="color:#dc2626;font-size:0.83rem;margin:0;"></p>
          </div>

          <div class="co-emp-modal-footer">
            <button type="button" class="btn btn--outline" id="btn-cancel-add">Cancel</button>
            <button type="submit" class="btn btn--primary" id="btn-submit-add" style="background:#005930;border-color:#005930;">
              ${icon('award', 14)} Confirm &amp; Add to Roster
            </button>
          </div>
        </form>
      `;

      overlay.querySelector('#btn-cancel-add').onclick = () => overlay.remove();

      // Auto-populate dept and salary when job is selected
      const jobSelect = overlay.querySelector('select[name="job_listing_id"]');
      const deptInput = overlay.querySelector('#add-dept');
      const salaryInput = overlay.querySelector('#add-salary');
      jobSelect.addEventListener('change', () => {
        const selectedOpt = jobSelect.selectedOptions[0];
        if (selectedOpt) {
          if (selectedOpt.dataset.dept) deptInput.value = selectedOpt.dataset.dept;
          if (selectedOpt.dataset.salary) salaryInput.value = selectedOpt.dataset.salary;
        }
      });

      overlay.querySelector('#form-add-hire').addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = new FormData(e.target);
        const submitBtn = overlay.querySelector('#btn-submit-add');
        const errEl = overlay.querySelector('#add-hire-error');
        errEl.textContent = '';
        submitBtn.disabled = true;
        submitBtn.textContent = 'Recording hire...';

        const payload = {
          candidate_user_id: form.get('candidate_user_id'),
          job_listing_id: form.get('job_listing_id'),
          employment_status: form.get('employment_status'),
          start_date: form.get('start_date'),
          salary: form.get('salary'),
          employee_number: form.get('employee_number'),
          department: form.get('department'),
          employee_notes: form.get('employee_notes'),
        };

        try {
          const addRes = await apiPost('/company/employees', payload);
          if (addRes?.success) {
            overlay.remove();
            showToast('Graduate successfully added to Employee Roster!');
            await loadData();
          } else {
            errEl.textContent = addRes?.message || 'Failed to record hired staff.';
            submitBtn.disabled = false;
            submitBtn.innerHTML = `${icon('award', 14)} Confirm &amp; Add to Roster`;
          }
        } catch (err) {
          errEl.textContent = 'A network error occurred. Please try again.';
          submitBtn.disabled = false;
          submitBtn.innerHTML = `${icon('award', 14)} Confirm &amp; Add to Roster`;
        }
      });
    } catch (err) {
      overlay.querySelector('#add-hire-modal-content').innerHTML = `
        <div style="color:#dc2626;padding:20px;">Failed to load candidate list. Please try again.</div>
      `;
    }
  }

  /* ── Helpers ── */
  function formatDate(dStr) {
    if (!dStr) return 'N/A';
    try {
      const d = new Date(dStr);
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dStr;
    }
  }

  function escapeHtml(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast toast--success toast--visible';
    toast.innerHTML = `${icon('checkCircle', 16)} <span>${message}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.classList.remove('toast--visible');
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }
}
