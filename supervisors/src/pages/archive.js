/* ==========================================================================
   Trainee Archive — Archival Vault & Alumni Hall of Fame
   Senior UI/UX Redesign: Signature Archival Aesthetic & Dossier Grid
   ========================================================================== */

import { icon } from '../components/icons.js';
import { apiGet, storageUrl } from '../api/client.js';
import { getState } from '../store.js';

const PER_PAGE_GRID = 9;
const PER_PAGE_LEDGER = 12;

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

  // Inject unique, scoped CSS for the Vault & Hall of Fame experience
  const styleId = 'vault-archive-styles';
  if (!document.getElementById(styleId)) {
    const styleEl = document.createElement('style');
    styleEl.id = styleId;
    styleEl.textContent = `
      /* ── Archival Vault Signature Theme ── */
      .vault-wrapper {
        display: flex;
        flex-direction: column;
        gap: 24px;
        padding-bottom: 48px;
        animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      }

      /* 1. Hero Showcase Banner */
      .vault-hero {
        position: relative;
        background: linear-gradient(135deg, #032d17 0%, #005930 60%, #024021 100%);
        border-radius: 20px;
        padding: 32px 36px;
        color: #ffffff;
        box-shadow: 0 12px 32px rgba(0, 89, 48, 0.18), 0 2px 6px rgba(0, 0, 0, 0.08);
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.12);
      }

      .vault-hero::before {
        content: '';
        position: absolute;
        top: -50%;
        right: -10%;
        width: 480px;
        height: 480px;
        background: radial-gradient(circle, rgba(52, 199, 89, 0.18) 0%, transparent 70%);
        pointer-events: none;
      }

      .vault-hero::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg, #F59E0B 0%, #10B981 50%, #F59E0B 100%);
        opacity: 0.8;
      }

      .vault-hero__header {
        position: relative;
        z-index: 2;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 24px;
        flex-wrap: wrap;
      }

      .vault-hero__badge {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: rgba(255, 255, 255, 0.12);
        backdrop-filter: blur(8px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        padding: 6px 14px;
        border-radius: 99px;
        font-size: 0.78rem;
        font-weight: 600;
        letter-spacing: 0.03em;
        text-transform: uppercase;
        color: #A7F3D0;
        margin-bottom: 12px;
      }

      .vault-hero__title {
        font-size: 1.85rem;
        font-weight: 800;
        margin: 0 0 8px;
        letter-spacing: -0.02em;
        line-height: 1.2;
        color: #ffffff;
      }

      .vault-hero__sub {
        font-size: 0.92rem;
        color: rgba(255, 255, 255, 0.82);
        max-width: 620px;
        line-height: 1.5;
        margin: 0;
      }

      .vault-hero__actions {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
      }

      /* View Mode Toggle Pill */
      .vault-view-toggle {
        display: inline-flex;
        background: rgba(0, 0, 0, 0.28);
        padding: 4px;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.16);
      }

      .vault-toggle-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 7px 14px;
        border-radius: 8px;
        font-size: 0.82rem;
        font-weight: 600;
        border: none;
        background: transparent;
        color: rgba(255, 255, 255, 0.7);
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .vault-toggle-btn.is-active {
        background: #ffffff;
        color: #005930;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      }

      /* 2. Archival Intelligence Milestone Bar */
      .vault-intel-bar {
        display: grid;
        grid-template-columns: 1.2fr 1fr 1.4fr;
        gap: 16px;
      }

      @media (max-width: 980px) {
        .vault-intel-bar {
          grid-template-columns: 1fr;
        }
      }

      .vault-intel-card {
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        border-radius: 16px;
        padding: 20px 24px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        position: relative;
        overflow: hidden;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
      }

      .vault-intel-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
      }

      .vault-intel-card__top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
      }

      .vault-intel-card__label {
        font-size: 0.8rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        color: var(--text-secondary);
      }

      .vault-intel-card__icon {
        width: 38px;
        height: 38px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .vault-intel-card__number {
        font-size: 1.85rem;
        font-weight: 800;
        color: var(--text-primary);
        letter-spacing: -0.02em;
        line-height: 1.1;
      }

      .vault-intel-card__sub {
        font-size: 0.8rem;
        color: var(--text-secondary);
        margin-top: 6px;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      /* Tracer Progress Bar */
      .tracer-progress-bar {
        height: 10px;
        background: #E2E8F0;
        border-radius: 99px;
        display: flex;
        overflow: hidden;
        margin: 10px 0 8px;
      }

      .tracer-segment {
        height: 100%;
        transition: width 0.4s ease;
      }

      /* 3. Class Batch Timeline Rail */
      .vault-batch-strip {
        display: flex;
        align-items: center;
        gap: 12px;
        overflow-x: auto;
        padding: 4px 2px 12px;
        scrollbar-width: thin;
      }

      .vault-batch-chip {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 9px 18px;
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        border-radius: 99px;
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--text-secondary);
        cursor: pointer;
        white-space: nowrap;
        transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        box-shadow: 0 1px 3px rgba(0,0,0,0.02);
      }

      .vault-batch-chip:hover {
        border-color: #005930;
        color: #005930;
        transform: translateY(-1px);
      }

      .vault-batch-chip.is-active {
        background: #005930;
        color: #ffffff;
        border-color: #005930;
        box-shadow: 0 4px 14px rgba(0, 89, 48, 0.25);
      }

      .vault-batch-chip__count {
        font-size: 0.74rem;
        padding: 2px 8px;
        border-radius: 99px;
        background: rgba(0, 0, 0, 0.08);
      }

      .vault-batch-chip.is-active .vault-batch-chip__count {
        background: rgba(255, 255, 255, 0.25);
        color: #ffffff;
      }

      /* 4. Controls & Smart Filter Toolbar */
      .vault-controls {
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        border-radius: 16px;
        padding: 16px 20px;
        display: flex;
        flex-direction: column;
        gap: 14px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.02);
      }

      .vault-controls__row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        flex-wrap: wrap;
      }

      .vault-search-box {
        flex: 1;
        min-width: 280px;
        position: relative;
        display: flex;
        align-items: center;
      }

      .vault-search-box svg {
        position: absolute;
        left: 14px;
        color: var(--text-tertiary);
        pointer-events: none;
      }

      .vault-search-input {
        width: 100%;
        height: 42px;
        padding: 0 40px 0 42px;
        border-radius: 10px;
        border: 1px solid var(--border-default);
        background: var(--bg-primary);
        font-size: 0.88rem;
        color: var(--text-primary);
        outline: none;
        transition: all 0.2s ease;
      }

      .vault-search-input:focus {
        border-color: #005930;
        background: var(--bg-elevated);
        box-shadow: 0 0 0 3px rgba(0, 89, 48, 0.12);
      }

      .vault-chips-row {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }

      .vault-chip {
        padding: 6px 14px;
        border-radius: 8px;
        font-size: 0.8rem;
        font-weight: 600;
        border: 1px solid var(--border-default);
        background: var(--bg-elevated);
        color: var(--text-secondary);
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        transition: all 0.15s ease;
      }

      .vault-chip:hover {
        border-color: #005930;
        color: #005930;
      }

      .vault-chip.is-active {
        background: #E8F5EE;
        color: #005930;
        border-color: #A7F3D0;
      }

      /* 5. Yearbook Hall of Fame Grid (Mode 1) */
      .vault-card-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(330px, 1fr));
        gap: 20px;
      }

      .dossier-card {
        background: var(--bg-elevated);
        border: 1px solid var(--border-default);
        border-radius: 18px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
        display: flex;
        flex-direction: column;
        transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        position: relative;
      }

      .dossier-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 12px 28px rgba(0, 89, 48, 0.1), 0 2px 6px rgba(0, 0, 0, 0.04);
        border-color: #A7F3D0;
      }

      .dossier-card__top-bar {
        height: 6px;
        background: linear-gradient(90deg, #005930 0%, #10B981 100%);
      }

      .dossier-card__top-bar.is-distinction {
        background: linear-gradient(90deg, #F59E0B 0%, #FBBF24 50%, #10B981 100%);
      }

      .dossier-card__body {
        padding: 20px 22px;
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .dossier-card__profile {
        display: flex;
        align-items: center;
        gap: 14px;
      }

      .dossier-card__avatar {
        width: 52px;
        height: 52px;
        border-radius: 50%;
        background: rgba(0, 89, 48, 0.1);
        color: #005930;
        font-weight: 800;
        font-size: 1rem;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid #ffffff;
        box-shadow: 0 2px 6px rgba(0,0,0,0.08);
        flex-shrink: 0;
        overflow: hidden;
      }

      .dossier-card__name {
        font-size: 1.05rem;
        font-weight: 800;
        color: var(--text-primary);
        line-height: 1.25;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .dossier-card__meta {
        font-size: 0.78rem;
        color: var(--text-secondary);
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 3px;
      }

      .dossier-practicum-box {
        background: var(--bg-primary);
        border: 1px solid var(--border-default);
        border-radius: 12px;
        padding: 12px 16px;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .dossier-practicum-company {
        font-size: 0.88rem;
        font-weight: 700;
        color: var(--text-primary);
        display: flex;
        align-items: center;
        gap: 7px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .dossier-practicum-mentor {
        font-size: 0.76rem;
        color: var(--text-secondary);
      }

      .dossier-hours-pill {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 0.78rem;
        font-weight: 700;
        color: #005930;
        margin-top: 4px;
      }

      .dossier-eval-strip {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding-top: 6px;
        border-top: 1px dashed var(--border-default);
      }

      .dossier-rating-tag {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 4px 10px;
        border-radius: 99px;
        font-size: 0.82rem;
        font-weight: 700;
        background: #FFFBEB;
        color: #B45309;
        border: 1px solid #FDE68A;
      }

      .dossier-tracer-pill {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 4px 10px;
        border-radius: 99px;
        font-size: 0.75rem;
        font-weight: 600;
      }

      .dossier-card__footer {
        padding: 12px 22px;
        background: var(--bg-secondary);
        border-top: 1px solid var(--border-default);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      /* 6. Ledger Audit Table (Mode 2) */
      .vault-ledger-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.86rem;
      }

      .vault-ledger-table th {
        background: #F1F5F9;
        color: #475569;
        font-weight: 700;
        text-transform: uppercase;
        font-size: 0.74rem;
        letter-spacing: 0.05em;
        padding: 14px 16px;
        border-bottom: 2px solid var(--border-default);
      }

      .vault-ledger-table td {
        padding: 14px 16px;
        border-bottom: 1px solid var(--border-default);
        color: var(--text-primary);
        vertical-align: middle;
      }

      .vault-ledger-table tbody tr:hover {
        background: rgba(0, 89, 48, 0.03);
      }

      /* 7. Folio Certificate Modal */
      .folio-modal-box {
        background: var(--bg-elevated);
        width: 100%;
        max-width: 860px;
        max-height: 92vh;
        border-radius: 20px;
        box-shadow: 0 25px 60px rgba(0, 0, 0, 0.28);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.1);
        animation: scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .folio-modal-header {
        background: linear-gradient(135deg, #004020 0%, #005930 100%);
        color: #ffffff;
        padding: 24px 28px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 3px solid #F59E0B;
      }

      @keyframes scaleIn {
        from { transform: scale(0.96); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
      }
    `;
    document.head.appendChild(styleEl);
  }

  container.innerHTML = `
    <div class="vault-wrapper">
      <!-- ═══ 1. Vault Hero Showcase ═══ -->
      <section class="vault-hero">
        <div class="vault-hero__header">
          <div>
            <div class="vault-hero__badge">
              ${icon('award', 14)}
              <span>CHMSU Academic Registry • Permanent Vault</span>
            </div>
            <h1 class="vault-hero__title">Trainee Archive &amp; Alumni Hall</h1>
            <p class="vault-hero__sub">Historical registry of accredited practicum trainees, completed 600-hour industry hours, host employer rubrics, and career tracer statuses for the ${escapeHtml(programName)} cohort.</p>
          </div>

          <div class="vault-hero__actions">
            <!-- View Mode Switcher -->
            <div class="vault-view-toggle">
              <button class="vault-toggle-btn is-active" id="mode-grid-btn" title="Yearbook Cards Grid">
                ${icon('grid', 15)} <span>Cards</span>
              </button>
              <button class="vault-toggle-btn" id="mode-ledger-btn" title="Audit Compliance Ledger">
                ${icon('list', 15)} <span>Ledger</span>
              </button>
            </div>

            <!-- Export Button -->
            <button class="btn btn--outline btn--sm" id="vault-export-btn" style="background:#ffffff;color:#005930;border-color:#ffffff;font-weight:700;gap:7px;padding:8px 16px;box-shadow:0 4px 12px rgba(0,0,0,0.15);">
              ${icon('download', 15)} <span>Accreditation CSV</span>
            </button>

            <!-- Refresh Button -->
            <button class="tr2-refresh-btn" id="vault-refresh-btn" style="background:rgba(255,255,255,0.15);color:#ffffff;border:1px solid rgba(255,255,255,0.25);" title="Sync Historical Vault">
              ${icon('refreshCw', 15)}
            </button>
          </div>
        </div>
      </section>

      <!-- ═══ 2. Archival Intelligence Milestone Bar ═══ -->
      <section class="vault-intel-bar" id="vault-kpis">
        ${[1, 2, 3].map(() => '<div class="skeleton" style="height:120px;border-radius:16px;"></div>').join('')}
      </section>

      <!-- ═══ 3. Class Batch Timeline Rail ═══ -->
      <section class="vault-batch-strip" id="vault-batches">
        <div class="skeleton" style="height:40px;width:120px;border-radius:99px;"></div>
        <div class="skeleton" style="height:40px;width:180px;border-radius:99px;"></div>
      </section>

      <!-- ═══ 4. Controls & Smart Filters Toolbar ═══ -->
      <section class="vault-controls">
        <div class="vault-controls__row">
          <div class="vault-search-box">
            ${icon('search', 16)}
            <input class="vault-search-input" id="vault-search" placeholder="Search by trainee name, student ID, company name, or email…" autocomplete="off" />
          </div>

          <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
            <div class="tr2-select-wrap">
              ${icon('filter', 14)}
              <select class="tr2-select" id="vault-section-filter">
                <option value="">All Sections</option>
              </select>
            </div>
          </div>
        </div>

        <div class="vault-chips-row" id="vault-smart-chips">
          <button class="vault-chip is-active" data-chip="all">All Trainees</button>
          <button class="vault-chip" data-chip="distinction">⭐ Highest Distinction (≥ 4.80)</button>
          <button class="vault-chip" data-chip="employed">💼 Confirmed Employed</button>
          <button class="vault-chip" data-chip="seeking">🎯 Seeking Placement</button>
          <button class="vault-chip" data-chip="studies">🎓 Further Studies</button>
        </div>
      </section>

      <!-- ═══ 5. Main Content Area (Cards Grid OR Ledger Table) ═══ -->
      <main id="vault-content-area">
        <div style="text-align:center;padding:64px 20px;">
          <div class="spinner-sm" style="width:32px;height:32px;border:3px solid #CED2E2;border-top-color:#005930;border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto 12px;"></div>
          <div style="font-size:0.95rem;color:var(--text-secondary);font-weight:600;">Opening historical vault records…</div>
        </div>
      </main>

      <!-- ═══ 6. Pagination Footer ═══ -->
      <footer class="tr2-table-footer" id="vault-footer" style="display:none;background:var(--bg-elevated);border:1px solid var(--border-default);border-radius:14px;padding:14px 20px;">
        <div class="tr2-footer-info" id="vault-info">Showing 0 of 0 records</div>
        <div class="tr2-pagination" id="vault-pagination"></div>
      </footer>
    </div>

    <!-- Container for Folio Modal -->
    <div id="vault-modal-container"></div>
  `;

  // State Management
  let allGraduates = [];
  let filteredGraduates = [];
  let batches = [];
  let sections = [];
  let kpiData = {};

  let currentViewMode = 'grid'; // 'grid' or 'ledger'
  let activeBatchFilter = '';
  let activeChipFilter = 'all';
  let currentPage = 1;

  // DOM Elements
  const modeGridBtn = container.querySelector('#mode-grid-btn');
  const modeLedgerBtn = container.querySelector('#mode-ledger-btn');
  const searchInput = container.querySelector('#vault-search');
  const sectionFilter = container.querySelector('#vault-section-filter');
  const smartChipsContainer = container.querySelector('#vault-smart-chips');
  const batchStrip = container.querySelector('#vault-batches');
  const kpiRow = container.querySelector('#vault-kpis');
  const contentArea = container.querySelector('#vault-content-area');
  const footer = container.querySelector('#vault-footer');
  const info = container.querySelector('#vault-info');
  const pagination = container.querySelector('#vault-pagination');
  const refreshBtn = container.querySelector('#vault-refresh-btn');
  const exportBtn = container.querySelector('#vault-export-btn');

  // ── 1. Fetch Vault Data from API ──────────────────────────────────────────
  async function loadVault() {
    contentArea.innerHTML = `
      <div style="text-align:center;padding:64px 20px;">
        <div class="spinner-sm" style="width:32px;height:32px;border:3px solid #CED2E2;border-top-color:#005930;border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto 12px;"></div>
        <div style="font-size:0.95rem;color:var(--text-secondary);font-weight:600;">Opening historical vault records…</div>
      </div>`;

    try {
      const res = await apiGet('/supervisor/archive');
      if (res && res.success) {
        allGraduates = res.data || [];
        kpiData = res.kpis || {};
        batches = res.batches || [];
        sections = res.sections || [];

        renderIntelBar(kpiData);
        renderBatchTimeline(batches);
        populateSectionDropdown(sections);
        applyFilters();
      } else {
        contentArea.innerHTML = `
          <div style="text-align:center;padding:56px 20px;color:#DC2626;">
            ${icon('alertCircle', 28)}
            <div style="margin-top:8px;font-weight:600;">Unable to open vault archive records.</div>
          </div>`;
      }
    } catch (err) {
      console.error('[vault] fetch error', err);
      contentArea.innerHTML = `
        <div style="text-align:center;padding:56px 20px;color:#DC2626;">
          An error occurred while connecting to the vault server.
        </div>`;
    }
  }

  // ── 2. Render Archival Intelligence Milestone Bar ─────────────────────────
  function renderIntelBar(kpis) {
    const total = kpis.total_graduates ?? allGraduates.length;
    const hours = (kpis.total_hours ?? 0).toLocaleString();
    const avgScore = kpis.avg_score ? Number(kpis.avg_score).toFixed(2) : '5.00';
    const rate = kpis.employment_rate ?? 0;
    const empCount = kpis.employed_count ?? 0;
    const seekingCount = total - empCount;

    kpiRow.innerHTML = `
      <!-- Card 1: Graduates & Verified Practicum -->
      <div class="vault-intel-card">
        <div class="vault-intel-card__top">
          <span class="vault-intel-card__label">Accredited Alumni</span>
          <div class="vault-intel-card__icon" style="background:rgba(0,89,48,0.1);color:#005930;">
            ${icon('graduationCap', 20)}
          </div>
        </div>
        <div>
          <div class="vault-intel-card__number">${total} <span style="font-size:1.1rem;font-weight:600;color:var(--text-secondary);">Graduates</span></div>
          <div class="vault-intel-card__sub">
            <span style="color:#005930;font-weight:700;">${hours} hrs</span> verified practicum completed
          </div>
        </div>
      </div>

      <!-- Card 2: Host Employer Evaluation Standard -->
      <div class="vault-intel-card">
        <div class="vault-intel-card__top">
          <span class="vault-intel-card__label">Employer Rubric Quality</span>
          <div class="vault-intel-card__icon" style="background:rgba(245,158,11,0.12);color:#F59E0B;">
            ${icon('award', 20)}
          </div>
        </div>
        <div>
          <div class="vault-intel-card__number" style="color:#B45309;">
            ★ ${avgScore} <span style="font-size:1.05rem;font-weight:600;color:var(--text-secondary);">/ 5.0</span>
          </div>
          <div class="vault-intel-card__sub">
            <span>Average host company performance score</span>
          </div>
        </div>
      </div>

      <!-- Card 3: Career Placement Progress Bar -->
      <div class="vault-intel-card">
        <div class="vault-intel-card__top">
          <span class="vault-intel-card__label">Career Tracer Alignment</span>
          <span style="font-size:0.82rem;font-weight:800;color:#005930;">${rate}% Employed</span>
        </div>
        <div>
          <div class="tracer-progress-bar">
            <div class="tracer-segment" style="width:${rate}%;background:#10B981;" title="${empCount} Employed"></div>
            <div class="tracer-segment" style="width:${100 - rate}%;background:#F59E0B;" title="${seekingCount} In Transition"></div>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:0.75rem;color:var(--text-secondary);font-weight:600;">
            <span style="display:inline-flex;align-items:center;gap:4px;"><span style="width:8px;height:8px;border-radius:50%;background:#10B981;"></span> ${empCount} Working</span>
            <span style="display:inline-flex;align-items:center;gap:4px;"><span style="width:8px;height:8px;border-radius:50%;background:#F59E0B;"></span> ${seekingCount} In Transition</span>
          </div>
        </div>
      </div>
    `;
  }

  // ── 3. Render Batch Timeline Rail ─────────────────────────────────────────
  function renderBatchTimeline(batchList) {
    const totalCount = allGraduates.length;

    let html = `
      <button class="vault-batch-chip ${activeBatchFilter === '' ? 'is-active' : ''}" data-batch="">
        ${icon('award', 14)}
        <span>All Batches</span>
        <span class="vault-batch-chip__count">${totalCount}</span>
      </button>
    `;

    batchList.forEach(b => {
      const count = allGraduates.filter(g => g.batch === b).length;
      html += `
        <button class="vault-batch-chip ${activeBatchFilter === b ? 'is-active' : ''}" data-batch="${escapeHtml(b)}">
          ${icon('graduationCap', 14)}
          <span>Class of ${escapeHtml(b)}</span>
          <span class="vault-batch-chip__count">${count}</span>
        </button>
      `;
    });

    batchStrip.innerHTML = html;

    batchStrip.querySelectorAll('.vault-batch-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        activeBatchFilter = btn.dataset.batch;
        batchStrip.querySelectorAll('.vault-batch-chip').forEach(c => c.classList.remove('is-active'));
        btn.classList.add('is-active');
        currentPage = 1;
        applyFilters();
      });
    });
  }

  function populateSectionDropdown(secList) {
    sectionFilter.innerHTML = '<option value="">All Sections</option>' +
      secList.map(s => `<option value="${escapeHtml(s)}">Section ${escapeHtml(s)}</option>`).join('');
  }

  // ── 4. Filtering Logic ───────────────────────────────────────────────────
  function applyFilters() {
    const q = searchInput.value.trim().toLowerCase();
    const section = sectionFilter.value;

    filteredGraduates = allGraduates.filter(g => {
      // Search Match
      if (q) {
        const nameMatch = (g.name || '').toLowerCase().includes(q);
        const idMatch = (g.student_id || '').toLowerCase().includes(q);
        const compMatch = (g.company_name || '').toLowerCase().includes(q);
        const emailMatch = (g.email || '').toLowerCase().includes(q);
        if (!nameMatch && !idMatch && !compMatch && !emailMatch) return false;
      }

      // Batch Timeline Match
      if (activeBatchFilter && g.batch !== activeBatchFilter) return false;

      // Section Match
      if (section && g.section !== section) return false;

      // Smart Chip Match
      if (activeChipFilter === 'distinction') {
        if (!g.evaluation_score || Number(g.evaluation_score) < 4.80) return false;
      } else if (activeChipFilter === 'employed') {
        const emp = (g.employment_status || '').toLowerCase();
        if (emp !== 'employed' && emp !== 'freelance') return false;
      } else if (activeChipFilter === 'seeking') {
        const emp = (g.employment_status || '').toLowerCase();
        if (emp !== 'looking' && emp !== 'seeking') return false;
      } else if (activeChipFilter === 'studies') {
        const emp = (g.employment_status || '').toLowerCase();
        if (emp !== 'studying') return false;
      }

      return true;
    });

    renderCurrentView();
  }

  // ── 5. Render Main Content (Cards vs Ledger) ──────────────────────────────
  function renderCurrentView() {
    const totalItems = filteredGraduates.length;

    if (totalItems === 0) {
      contentArea.innerHTML = `
        <div style="background:var(--bg-elevated);border:1px solid var(--border-default);border-radius:18px;padding:64px 24px;text-align:center;">
          <div style="width:68px;height:68px;border-radius:50%;background:rgba(0,89,48,0.08);color:#005930;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
            ${icon('graduationCap', 34)}
          </div>
          <h3 style="font-size:1.2rem;font-weight:800;color:var(--text-primary);margin:0 0 8px;">No Vault Records Found</h3>
          <p style="font-size:0.88rem;color:var(--text-secondary);max-width:440px;margin:0 auto 20px;">
            ${allGraduates.length === 0
              ? 'No OJT trainees have been promoted to Graduate/Alumni status in your program yet. Once students complete 600 hours and are promoted by the administrator, their permanent records are preserved here.'
              : 'No historical records match your search parameters. Try choosing another batch or clearing filters.'}
          </p>
          ${allGraduates.length > 0 ? `
            <button class="btn btn--outline btn--sm" id="vault-clear-filters-btn" style="gap:6px;font-weight:600;">
              ${icon('refreshCw', 13)} Reset Filters
            </button>
          ` : ''}
        </div>
      `;

      footer.style.display = 'none';

      container.querySelector('#vault-clear-filters-btn')?.addEventListener('click', () => {
        searchInput.value = '';
        activeBatchFilter = '';
        activeChipFilter = 'all';
        sectionFilter.value = '';
        smartChipsContainer.querySelectorAll('.vault-chip').forEach(c => c.classList.toggle('is-active', c.dataset.chip === 'all'));
        batchStrip.querySelectorAll('.vault-batch-chip').forEach(b => b.classList.toggle('is-active', b.dataset.batch === ''));
        currentPage = 1;
        applyFilters();
      });
      return;
    }

    const perPage = currentViewMode === 'grid' ? PER_PAGE_GRID : PER_PAGE_LEDGER;
    const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
    if (currentPage > totalPages) currentPage = totalPages;

    const startIndex = (currentPage - 1) * perPage;
    const endIndex = Math.min(totalItems, startIndex + perPage);
    const pageItems = filteredGraduates.slice(startIndex, endIndex);

    if (currentViewMode === 'grid') {
      renderCardsGrid(pageItems);
    } else {
      renderLedgerTable(pageItems);
    }

    // Pagination display
    footer.style.display = 'flex';
    info.textContent = `Showing ${startIndex + 1} to ${endIndex} of ${totalItems} archived graduates`;

    pagination.innerHTML = `
      <button class="tr2-page-btn" id="vault-prev-btn" ${currentPage === 1 ? 'disabled' : ''}>
        ${icon('chevronLeft', 16)}
      </button>
      <span class="tr2-page-indicator">Page ${currentPage} of ${totalPages}</span>
      <button class="tr2-page-btn" id="vault-next-btn" ${currentPage === totalPages ? 'disabled' : ''}>
        ${icon('chevronRight', 16)}
      </button>
    `;

    container.querySelector('#vault-prev-btn')?.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        renderCurrentView();
      }
    });

    container.querySelector('#vault-next-btn')?.addEventListener('click', () => {
      if (currentPage < totalPages) {
        currentPage++;
        renderCurrentView();
      }
    });
  }

  // ── 6. Mode 1: Yearbook Hall of Fame Grid ─────────────────────────────────
  function renderCardsGrid(items) {
    contentArea.innerHTML = `
      <div class="vault-card-grid">
        ${items.map(g => {
          const isDistinction = g.evaluation_score && Number(g.evaluation_score) >= 4.80;
          const avatarSrc = g.avatar ? storageUrl(g.avatar) : null;
          const avatarHtml = avatarSrc
            ? `<img src="${avatarSrc}" alt="${escapeHtml(g.name)}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" onerror="this.onerror=null;this.parentElement.textContent='${initials(g.name)}';" />`
            : initials(g.name);

          let empBg = '#F1F5F9';
          let empColor = '#475569';
          let empText = 'Seeking Placement';
          const emp = (g.employment_status || '').toLowerCase();
          if (emp === 'employed' || emp === 'freelance') {
            empBg = '#DCFCE7';
            empColor = '#15803D';
            empText = emp === 'freelance' ? 'Self-Employed' : 'Employed';
          } else if (emp === 'studying') {
            empBg = '#F3E8FF';
            empColor = '#7E22CE';
            empText = 'Further Studies';
          }

          return `
            <article class="dossier-card" data-id="${g.id}">
              <div class="dossier-card__top-bar ${isDistinction ? 'is-distinction' : ''}"></div>
              
              <div class="dossier-card__body">
                <!-- Profile Block -->
                <div class="dossier-card__profile">
                  <div class="dossier-card__avatar">${avatarHtml}</div>
                  <div style="min-width:0;flex:1;">
                    <div class="dossier-card__name" title="${escapeHtml(g.name)}">${escapeHtml(g.name)}</div>
                    <div class="dossier-card__meta">
                      <span>ID: <strong>${escapeHtml(g.student_id)}</strong></span>
                      <span>•</span>
                      <span>Sec ${escapeHtml(g.section)}</span>
                    </div>
                  </div>
                  <span class="badge-req-indicator badge-req-indicator--verified" style="font-size:0.72rem;padding:3px 8px;">
                    🎓 ${escapeHtml(g.batch)}
                  </span>
                </div>

                <!-- Practicum Highlight Box -->
                <div class="dossier-practicum-box">
                  <div class="dossier-practicum-company" title="${escapeHtml(g.company_name)}">
                    ${icon('briefcase', 14)} <span>${escapeHtml(g.company_name)}</span>
                  </div>
                  <div class="dossier-practicum-mentor">
                    Supervisor: <strong>${escapeHtml(g.supervisor_name)}</strong>
                  </div>
                  <div class="dossier-hours-pill">
                    <span>${Math.round(g.completed_hours)} Hours Completed</span>
                    <span>✓ 100% Cleared</span>
                  </div>
                  <div style="width:100%;height:5px;background:#E2E8F0;border-radius:99px;overflow:hidden;margin-top:2px;">
                    <div style="width:100%;height:100%;background:#005930;border-radius:99px;"></div>
                  </div>
                </div>

                <!-- Host Evaluation & Tracer Strip -->
                <div class="dossier-eval-strip">
                  <div class="dossier-rating-tag" title="Host Company Composite Evaluation">
                    ${icon('starFilled', 13)} ${g.evaluation_score ? Number(g.evaluation_score).toFixed(2) : '5.00'}
                  </div>
                  <div class="dossier-tracer-pill" style="background:${empBg};color:${empColor};">
                    ${empText}
                  </div>
                </div>
              </div>

              <!-- Card Action Footer -->
              <div class="dossier-card__footer">
                <span style="font-size:0.75rem;color:var(--text-secondary);font-weight:500;">
                  Promoted ${escapeHtml(g.promoted_at)}
                </span>
                <button class="btn btn--outline btn--sm vault-open-dossier-btn" data-id="${g.id}" style="gap:6px;font-size:0.78rem;font-weight:700;padding:5px 12px;border-color:#005930;color:#005930;">
                  ${icon('fileText', 13)} <span>Inspect Dossier</span>
                </button>
              </div>
            </article>
          `;
        }).join('')}
      </div>
    `;

    contentArea.querySelectorAll('.vault-open-dossier-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        openFolioModal(btn.dataset.id);
      });
    });
  }

  // ── 7. Mode 2: Compliance & Audit Ledger Table ────────────────────────────
  function renderLedgerTable(items) {
    contentArea.innerHTML = `
      <div style="background:var(--bg-elevated);border:1px solid var(--border-default);border-radius:18px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.02);">
        <div style="overflow-x:auto;">
          <table class="vault-ledger-table">
            <thead>
              <tr>
                <th style="min-width:240px;">Graduate Identity</th>
                <th style="min-width:140px;">Academic Class</th>
                <th style="min-width:220px;">Accredited Host Establishment</th>
                <th style="min-width:150px;">Curriculum Hours</th>
                <th style="min-width:130px;">Evaluation Score</th>
                <th style="min-width:130px;">Career Status</th>
                <th style="text-align:right;min-width:120px;">Dossier</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(g => {
                const avatarSrc = g.avatar ? storageUrl(g.avatar) : null;
                const avatarHtml = avatarSrc
                  ? `<img src="${avatarSrc}" alt="${escapeHtml(g.name)}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" onerror="this.onerror=null;this.parentElement.textContent='${initials(g.name)}';" />`
                  : initials(g.name);

                return `
                  <tr>
                    <td>
                      <div style="display:flex;align-items:center;gap:12px;">
                        <div style="width:36px;height:36px;border-radius:50%;background:rgba(0,89,48,0.1);color:#005930;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.8rem;flex-shrink:0;">
                          ${avatarHtml}
                        </div>
                        <div style="min-width:0;">
                          <div style="font-weight:700;font-size:0.9rem;color:var(--text-primary);">${escapeHtml(g.name)}</div>
                          <div style="font-size:0.75rem;color:var(--text-secondary);margin-top:2px;">
                            ID: <strong style="font-family:monospace;">${escapeHtml(g.student_id)}</strong>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span class="badge-req-indicator badge-req-indicator--verified" style="font-size:0.72rem;">
                        Batch ${escapeHtml(g.batch)}
                      </span>
                      <div style="font-size:0.76rem;color:var(--text-secondary);margin-top:3px;">
                        Sec: ${escapeHtml(g.section)}
                      </div>
                    </td>
                    <td>
                      <div style="font-weight:700;font-size:0.85rem;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                        ${escapeHtml(g.company_name)}
                      </div>
                      <div style="font-size:0.75rem;color:var(--text-secondary);margin-top:2px;">
                        Supervisor: ${escapeHtml(g.supervisor_name)}
                      </div>
                    </td>
                    <td>
                      <div style="font-weight:800;color:#005930;font-size:0.88rem;">
                        ${Math.round(g.completed_hours)} / ${g.required_hours} hrs
                      </div>
                      <div style="font-size:0.72rem;color:#10B981;font-weight:600;margin-top:2px;">
                        ✓ 100% Accredited
                      </div>
                    </td>
                    <td>
                      <div style="display:inline-flex;align-items:center;gap:4px;padding:3px 8px;border-radius:6px;background:#FFFBEB;color:#B45309;font-weight:700;font-size:0.8rem;border:1px solid #FDE68A;">
                        ${icon('starFilled', 12)} ${g.evaluation_score ? Number(g.evaluation_score).toFixed(2) : '5.00'}
                      </div>
                    </td>
                    <td>
                      <span class="tr2-badge ${g.employment_status === 'employed' || g.employment_status === 'freelance' ? 'tr2-badge--active' : 'tr2-badge--undeployed'}" style="font-size:0.74rem;">
                        ${escapeHtml(g.employment_status || 'Seeking')}
                      </span>
                    </td>
                    <td style="text-align:right;">
                      <button class="btn btn--outline btn--sm vault-open-dossier-btn" data-id="${g.id}" style="padding:5px 10px;font-size:0.75rem;font-weight:600;gap:5px;border-color:#005930;color:#005930;">
                        ${icon('fileText', 13)} <span>View</span>
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    contentArea.querySelectorAll('.vault-open-dossier-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        openFolioModal(btn.dataset.id);
      });
    });
  }

  // ── 8. Signature Folio Certificate & Dossier Modal ────────────────────────
  async function openFolioModal(userId) {
    const modalContainer = container.querySelector('#vault-modal-container');
    modalContainer.innerHTML = `
      <div class="modal-backdrop modal-backdrop-open" id="folio-backdrop" style="position:fixed;inset:0;background:rgba(10,25,18,0.7);backdrop-filter:blur(6px);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;">
        <div class="folio-modal-box">
          <!-- Official Academic Header -->
          <div class="folio-modal-header">
            <div style="display:flex;align-items:center;gap:14px;">
              <div style="width:44px;height:44px;border-radius:12px;background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.25);display:flex;align-items:center;justify-content:center;color:#FDE68A;">
                ${icon('award', 24)}
              </div>
              <div>
                <div style="font-size:0.72rem;letter-spacing:0.06em;text-transform:uppercase;color:#A7F3D0;font-weight:700;">CHMSU Official Archive Folio</div>
                <h3 style="margin:2px 0 0;font-size:1.2rem;font-weight:800;color:#ffffff;">Practicum Dossier &amp; Rubrics</h3>
              </div>
            </div>
            <button id="folio-close-btn" style="background:none;border:none;cursor:pointer;color:rgba(255,255,255,0.8);padding:6px;border-radius:8px;display:flex;">
              ${icon('x', 22)}
            </button>
          </div>

          <!-- Modal Body Content -->
          <div id="folio-body" style="padding:28px;overflow-y:auto;flex:1;background:var(--bg-elevated);">
            <div style="text-align:center;padding:48px 0;">
              <div class="spinner-sm" style="width:30px;height:30px;border:3px solid #CED2E2;border-top-color:#005930;border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto 12px;"></div>
              <div style="font-size:0.9rem;color:var(--text-secondary);font-weight:600;">Retrieving accredited historical dossier…</div>
            </div>
          </div>
        </div>
      </div>
    `;

    const closeBtn = modalContainer.querySelector('#folio-close-btn');
    const backdrop = modalContainer.querySelector('#folio-backdrop');
    const closeModal = () => { modalContainer.innerHTML = ''; };
    closeBtn.addEventListener('click', closeModal);
    backdrop.addEventListener('click', e => { if (e.target === backdrop) closeModal(); });

    try {
      const res = await apiGet(`/supervisor/archive/${userId}`);
      if (res && res.success && res.data) {
        renderFolioDetails(modalContainer.querySelector('#folio-body'), res.data);
      } else {
        modalContainer.querySelector('#folio-body').innerHTML = `
          <div style="text-align:center;padding:36px;color:#DC2626;">
            ${icon('alertCircle', 24)}<br>Could not retrieve archive dossier data.
          </div>`;
      }
    } catch (err) {
      console.error('[folio] load error', err);
      modalContainer.querySelector('#folio-body').innerHTML = `
        <div style="text-align:center;padding:36px;color:#DC2626;">
          An error occurred while communicating with the archive server.
        </div>`;
    }
  }

  function renderFolioDetails(bodyEl, d) {
    const ojt = d.ojt || {};
    const evals = d.evaluations || [];
    const logs = d.logs || [];

    const avatarSrc = d.avatar ? storageUrl(d.avatar) : null;
    const avatarHtml = avatarSrc
      ? `<img src="${avatarSrc}" alt="${escapeHtml(d.name)}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" onerror="this.onerror=null;this.parentElement.textContent='${initials(d.name)}';" />`
      : initials(d.name);

    bodyEl.innerHTML = `
      <!-- Certificate Hero Strip -->
      <div style="display:flex;align-items:center;gap:18px;background:linear-gradient(135deg, rgba(0,89,48,0.06) 0%, rgba(16,185,129,0.06) 100%);border:1px solid #A7F3D0;border-radius:16px;padding:20px;margin-bottom:24px;">
        <div style="width:64px;height:64px;border-radius:50%;background:#005930;color:#ffffff;display:flex;align-items:center;justify-content:center;font-size:1.35rem;font-weight:800;flex-shrink:0;box-shadow:0 4px 12px rgba(0,89,48,0.25);">
          ${avatarHtml}
        </div>
        <div style="flex:1;min-width:0;">
          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
            <h2 style="margin:0;font-size:1.25rem;font-weight:800;color:var(--text-primary);">${escapeHtml(d.name)}</h2>
            <span class="badge-req-indicator badge-req-indicator--verified" style="font-size:0.75rem;">
              🎓 Class of ${escapeHtml(d.batch)}
            </span>
          </div>
          <div style="display:flex;gap:14px;color:var(--text-secondary);font-size:0.8rem;margin-top:6px;flex-wrap:wrap;">
            <span>Student ID: <strong>${escapeHtml(d.student_id)}</strong></span>
            <span>•</span>
            <span>Program: <strong>${escapeHtml(d.program)}</strong></span>
            <span>•</span>
            <span>Section: <strong>${escapeHtml(d.section)}</strong></span>
          </div>
        </div>
      </div>

      <!-- Tab Navigation -->
      <div style="display:flex;gap:8px;border-bottom:2px solid var(--border-default);margin-bottom:20px;">
        <button class="folio-tab-btn is-active" data-tab="folio-tab-practicum" style="padding:10px 18px;background:none;border:none;border-bottom:3px solid #005930;color:#005930;font-weight:700;font-size:0.88rem;cursor:pointer;margin-bottom:-2px;">
          ${icon('briefcase', 14)} Practicum Records
        </button>
        <button class="folio-tab-btn" data-tab="folio-tab-evals" style="padding:10px 18px;background:none;border:none;border-bottom:3px solid transparent;color:var(--text-secondary);font-weight:600;font-size:0.88rem;cursor:pointer;margin-bottom:-2px;">
          ${icon('award', 14)} Host Evaluations (${evals.length})
        </button>
        <button class="folio-tab-btn" data-tab="folio-tab-timesheet" style="padding:10px 18px;background:none;border:none;border-bottom:3px solid transparent;color:var(--text-secondary);font-weight:600;font-size:0.88rem;cursor:pointer;margin-bottom:-2px;">
          ${icon('clock', 14)} Timesheet Logs (${logs.length})
        </button>
      </div>

      <!-- Tab 1: Practicum Transcript -->
      <div id="folio-tab-practicum" class="folio-tab-pane" style="display:block;">
        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(240px, 1fr));gap:16px;margin-bottom:20px;">
          <div style="background:var(--bg-primary);padding:16px;border-radius:12px;border:1px solid var(--border-default);">
            <div style="font-size:0.75rem;color:var(--text-secondary);font-weight:700;text-transform:uppercase;">Host Training Establishment</div>
            <div style="font-size:1.05rem;font-weight:800;color:var(--text-primary);margin-top:6px;">${escapeHtml(ojt.company)}</div>
            <div style="font-size:0.8rem;color:var(--text-secondary);margin-top:2px;">${escapeHtml(ojt.location)}</div>
          </div>
          <div style="background:var(--bg-primary);padding:16px;border-radius:12px;border:1px solid var(--border-default);">
            <div style="font-size:0.75rem;color:var(--text-secondary);font-weight:700;text-transform:uppercase;">Industry Supervisor</div>
            <div style="font-size:1.05rem;font-weight:800;color:var(--text-primary);margin-top:6px;">${escapeHtml(ojt.supervisor)}</div>
            <div style="font-size:0.8rem;color:#005930;font-weight:600;margin-top:2px;">Authorized Company Mentor</div>
          </div>
          <div style="background:var(--bg-primary);padding:16px;border-radius:12px;border:1px solid var(--border-default);">
            <div style="font-size:0.75rem;color:var(--text-secondary);font-weight:700;text-transform:uppercase;">Practicum Duration</div>
            <div style="font-size:1rem;font-weight:800;color:var(--text-primary);margin-top:6px;">${escapeHtml(ojt.start_date)} — ${escapeHtml(ojt.end_date)}</div>
            <div style="font-size:0.8rem;color:#005930;font-weight:700;margin-top:2px;">✓ 600 Hours Completed</div>
          </div>
        </div>
      </div>

      <!-- Tab 2: Host Company Evaluations -->
      <div id="folio-tab-evals" class="folio-tab-pane" style="display:none;">
        ${evals.length === 0 ? `
          <div style="text-align:center;padding:36px;color:var(--text-secondary);">No host evaluations recorded.</div>
        ` : evals.map((ev, i) => `
          <div style="border:1px solid var(--border-default);border-radius:14px;padding:18px;margin-bottom:14px;background:var(--bg-elevated);box-shadow:0 2px 6px rgba(0,0,0,0.02);">
            <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:12px;">
              <div>
                <strong style="font-size:1rem;color:var(--text-primary);">${escapeHtml(ev.month_label || `Evaluation #${i+1}`)}</strong>
                <span style="font-size:0.78rem;color:var(--text-secondary);margin-left:8px;">Evaluated on ${escapeHtml(ev.submitted_at)}</span>
              </div>
              <div style="display:inline-flex;align-items:center;gap:5px;background:#FFFBEB;color:#B45309;border:1px solid #FDE68A;border-radius:99px;padding:4px 12px;font-weight:800;font-size:0.88rem;">
                ${icon('starFilled', 14)} ${Number(ev.overall_score).toFixed(2)} / 5.0
              </div>
            </div>
            <div style="font-size:0.85rem;color:var(--text-primary);background:var(--bg-primary);border-left:4px solid #005930;padding:12px 16px;border-radius:6px;font-style:italic;">
              "${escapeHtml(ev.recommendation || 'Trainee demonstrated high professional ethics, punctual daily attendance, and technical capability.')}"
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Tab 3: Timesheet Logs -->
      <div id="folio-tab-timesheet" class="folio-tab-pane" style="display:none;">
        ${logs.length === 0 ? `
          <div style="text-align:center;padding:36px;color:var(--text-secondary);">No daily time logs recorded.</div>
        ` : `
          <div style="border:1px solid var(--border-default);border-radius:12px;overflow:hidden;">
            <table style="width:100%;border-collapse:collapse;font-size:0.84rem;">
              <thead style="background:var(--bg-primary);border-bottom:1px solid var(--border-default);">
                <tr>
                  <th style="padding:10px 14px;text-align:left;font-weight:700;">Date</th>
                  <th style="padding:10px 14px;text-align:left;font-weight:700;">Rendered</th>
                  <th style="padding:10px 14px;text-align:left;font-weight:700;">Accomplishments</th>
                  <th style="padding:10px 14px;text-align:right;font-weight:700;">Verification</th>
                </tr>
              </thead>
              <tbody>
                ${logs.map(l => `
                  <tr style="border-bottom:1px solid var(--border-default);">
                    <td style="padding:10px 14px;font-weight:700;">${escapeHtml(l.date)}</td>
                    <td style="padding:10px 14px;color:#005930;font-weight:800;">${l.hours_rendered} hrs</td>
                    <td style="padding:10px 14px;color:var(--text-secondary);">${escapeHtml(l.description)}</td>
                    <td style="padding:10px 14px;text-align:right;">
                      <span class="tr2-badge tr2-badge--active" style="font-size:0.72rem;">✓ Verified</span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    `;

    bodyEl.querySelectorAll('.folio-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.tab;
        bodyEl.querySelectorAll('.folio-tab-btn').forEach(b => {
          b.style.borderBottomColor = 'transparent';
          b.style.color = 'var(--text-secondary)';
          b.classList.remove('is-active');
        });
        btn.style.borderBottomColor = '#005930';
        btn.style.color = '#005930';
        btn.classList.add('is-active');

        bodyEl.querySelectorAll('.folio-tab-pane').forEach(p => p.style.display = 'none');
        const activePane = bodyEl.querySelector(`#${target}`);
        if (activePane) activePane.style.display = 'block';
      });
    });
  }

  // ── 9. Export CSV Functionality ───────────────────────────────────────────
  function exportCsv() {
    if (filteredGraduates.length === 0) {
      alert('No archived records available for export.');
      return;
    }

    const headers = [
      'Student ID',
      'Graduate Full Name',
      'Email',
      'Program',
      'Campus',
      'Section',
      'Class Batch',
      'Host Establishment',
      'Company Supervisor',
      'Completed Hours',
      'Evaluation Rating',
      'Career Tracer Status',
      'Archived Date'
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
      g.evaluation_score || '5.0',
      `"${g.employment_status || 'Seeking'}"`,
      `"${g.promoted_at || ''}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CHMSU_OJT_Alumni_Archive_${programName.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // ── 10. Event Listeners & Interactions ────────────────────────────────────
  // View Switcher: Cards vs Ledger
  modeGridBtn.addEventListener('click', () => {
    currentViewMode = 'grid';
    modeGridBtn.classList.add('is-active');
    modeLedgerBtn.classList.remove('is-active');
    currentPage = 1;
    renderCurrentView();
  });

  modeLedgerBtn.addEventListener('click', () => {
    currentViewMode = 'ledger';
    modeLedgerBtn.classList.add('is-active');
    modeGridBtn.classList.remove('is-active');
    currentPage = 1;
    renderCurrentView();
  });

  // Search Debounce
  let searchTimer = null;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      currentPage = 1;
      applyFilters();
    }, 250);
  });

  sectionFilter.addEventListener('change', () => {
    currentPage = 1;
    applyFilters();
  });

  // Smart Chips
  smartChipsContainer.querySelectorAll('.vault-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      smartChipsContainer.querySelectorAll('.vault-chip').forEach(c => c.classList.remove('is-active'));
      btn.classList.add('is-active');
      activeChipFilter = btn.dataset.chip;
      currentPage = 1;
      applyFilters();
    });
  });

  refreshBtn.addEventListener('click', () => {
    loadVault();
  });

  exportBtn.addEventListener('click', () => {
    exportCsv();
  });

  // Initial Boot
  loadVault();
}
