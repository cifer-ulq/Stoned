/* ==========================================================================
   Evaluations & Assessment Studio — OJT Coordinator Portal
   Executive Institutional Appraisal & Rubric Architect
   Designed with High-End Information Hierarchy & Dual-Pane Dossier UX
   ========================================================================== */

import { icon } from '../components/icons.js';
import { apiGet, apiPost, apiPut, apiDelete, apiCache } from '../api/client.js';
import { getState } from '../store.js';

export default function evaluationsPage(container) {
  const user = getState('user');
  const courseBadge = user?.course
    ? `<span class="eval-masthead__course-tag">${user.course}</span>`
    : '';

  // State Management
  let traineesList = [];
  let templatesList = [];
  let currentTemplateId = null;
  let currentTemplate = null;
  let selectedStudentIds = new Set();
  let activeTab = 'trainees'; // 'trainees' | 'builder'
  let activeFilter = 'all'; // 'all' | 'ready' | 'pending' | 'submitted' | 'in_progress'
  let activeViewMode = 'table'; // 'table' | 'cards'
  let activeSortBy = 'progress_desc'; // 'progress_desc' | 'name_asc' | 'score_desc' | 'status'
  let selectedTraineeForDossier = null; // Trainee currently inspected in right drawer
  let activeCategoryFilter = 'all'; // In builder: filter questions by category

  container.innerHTML = `
    <!-- ═══ Scoped Professional Styles ═══ -->
    <style id="eval-executive-styles">
      .eval-workspace {
        display: flex;
        flex-direction: column;
        gap: 18px;
        padding-bottom: 50px;
        color: var(--text-primary);
        font-family: inherit;
      }

      /* ── Executive Masthead ── */
      .eval-hero-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        flex-wrap: wrap;
        padding: 4px 0 2px 0;
      }
      .eval-hero-header__left {
        max-width: 680px;
      }
      .eval-tagline {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--color-primary);
        margin-bottom: 5px;
      }
      .eval-tagline__pulse {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: var(--color-primary);
        box-shadow: 0 0 0 3px rgba(0, 89, 48, 0.15);
      }
      .eval-masthead__course-tag {
        background: var(--color-primary-bg, rgba(0,89,48,0.08));
        color: var(--color-primary);
        padding: 2px 9px;
        border-radius: 6px;
        font-size: 0.72rem;
        font-weight: 600;
        border: 1px solid rgba(0,89,48,0.18);
        text-transform: none;
        letter-spacing: normal;
      }
      .eval-title {
        font-size: 1.55rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 5px 0;
        line-height: 1.25;
        letter-spacing: -0.015em;
      }
      .eval-subtitle {
        font-size: 0.86rem;
        color: var(--text-secondary);
        margin: 0;
        line-height: 1.45;
      }
      .eval-hero-actions {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
      }

      /* ── Mode Switcher & Segmented Control ── */
      .eval-tab-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 12px;
        border-bottom: 1px solid var(--border-default);
        padding-bottom: 12px;
      }
      .eval-nav-pills {
        display: inline-flex;
        align-items: center;
        background: #EBF1ED;
        padding: 4px;
        border-radius: 10px;
        gap: 4px;
        border: 1px solid rgba(0,89,48,0.12);
      }
      .eval-nav-pill {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 7px 16px;
        border-radius: 7px;
        font-size: 0.83rem;
        font-weight: 500;
        color: var(--text-secondary);
        background: transparent;
        border: none;
        cursor: pointer;
        transition: all 0.15s ease;
        user-select: none;
      }
      .eval-nav-pill:hover {
        color: var(--text-primary);
      }
      .eval-nav-pill--active {
        background: #ffffff;
        color: var(--color-primary);
        font-weight: 600;
        box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
      }
      .eval-nav-pill__badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 1px 7px;
        font-size: 0.72rem;
        font-weight: 700;
        border-radius: 99px;
        background: rgba(0,0,0,0.06);
        color: inherit;
      }
      .eval-nav-pill--active .eval-nav-pill__badge {
        background: var(--color-primary-bg, rgba(0,89,48,0.1));
        color: var(--color-primary);
      }

      /* ── Interactive Workflow Pipeline Bar ── */
      .eval-pipeline-strip {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 12px;
      }
      .eval-pipeline-card {
        background: #ffffff;
        border: 1px solid var(--border-default);
        border-radius: 12px;
        padding: 14px 16px;
        display: flex;
        flex-direction: column;
        cursor: pointer;
        position: relative;
        transition: all 0.18s ease;
        box-shadow: 0 1px 2px rgba(0,0,0,0.02);
      }
      .eval-pipeline-card:hover {
        border-color: var(--border-strong);
        transform: translateY(-1px);
        box-shadow: 0 4px 10px rgba(0,0,0,0.04);
      }
      .eval-pipeline-card--active {
        border-color: var(--color-primary);
        background: #F8FAF9;
        box-shadow: 0 0 0 1.5px var(--color-primary), 0 4px 12px rgba(0,89,48,0.08);
      }
      .eval-pipeline-card__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
      }
      .eval-pipeline-card__icon-box {
        width: 30px;
        height: 30px;
        border-radius: 7px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .eval-pipeline-card__step-num {
        font-size: 0.68rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--text-tertiary);
      }
      .eval-pipeline-card__value {
        font-size: 1.55rem;
        font-weight: 700;
        color: var(--text-primary);
        line-height: 1.15;
        font-feature-settings: 'tnum';
      }
      .eval-pipeline-card__title {
        font-size: 0.8rem;
        font-weight: 600;
        color: var(--text-primary);
        margin-top: 3px;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .eval-pipeline-card__desc {
        font-size: 0.72rem;
        color: var(--text-secondary);
        margin-top: 2px;
      }
      .eval-pipeline-card__indicator {
        position: absolute;
        bottom: 0;
        left: 14px;
        right: 14px;
        height: 3px;
        border-radius: 3px 3px 0 0;
        background: transparent;
        transition: background 0.15s ease;
      }
      .eval-pipeline-card--active .eval-pipeline-card__indicator {
        background: var(--color-primary);
      }

      @media (max-width: 980px) {
        .eval-pipeline-strip {
          grid-template-columns: repeat(2, 1fr);
        }
      }
      @media (max-width: 580px) {
        .eval-pipeline-strip {
          grid-template-columns: 1fr;
        }
      }

      /* ── Trainee View Command Toolbar ── */
      .eval-command-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        flex-wrap: wrap;
        background: #ffffff;
        border: 1px solid var(--border-default);
        border-radius: 10px;
        padding: 10px 14px;
      }
      .eval-command-search {
        position: relative;
        flex: 1;
        min-width: 240px;
        max-width: 380px;
      }
      .eval-command-search input {
        width: 100%;
        padding: 8px 12px 8px 34px;
        font-size: 0.84rem;
        border: 1px solid var(--border-default);
        border-radius: 7px;
        background: #FAFBFD;
        color: var(--text-primary);
        transition: all 0.15s ease;
      }
      .eval-command-search input:focus {
        outline: none;
        background: #ffffff;
        border-color: var(--color-primary);
        box-shadow: 0 0 0 3px rgba(0,89,48,0.08);
      }
      .eval-command-search__icon {
        position: absolute;
        left: 10px;
        top: 50%;
        transform: translateY(-50%);
        color: var(--text-tertiary);
        pointer-events: none;
      }
      .eval-command-filters {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }
      .eval-select-compact {
        font-size: 0.82rem;
        padding: 7px 11px;
        border-radius: 7px;
        border: 1px solid var(--border-default);
        background: #ffffff;
        color: var(--text-primary);
        font-weight: 500;
        cursor: pointer;
      }
      .eval-view-toggle {
        display: inline-flex;
        background: #F1F4F8;
        border-radius: 7px;
        padding: 2px;
        border: 1px solid var(--border-default);
      }
      .eval-view-toggle__btn {
        background: transparent;
        border: none;
        padding: 5px 9px;
        border-radius: 5px;
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.12s ease;
      }
      .eval-view-toggle__btn--active {
        background: #ffffff;
        color: var(--color-primary);
        box-shadow: 0 1px 2px rgba(0,0,0,0.05);
      }

      /* ── Floating / Docked Batch Bar ── */
      .eval-floating-batch-bar {
        display: none;
        align-items: center;
        justify-content: space-between;
        background: #005930;
        color: #ffffff;
        border-radius: 10px;
        padding: 10px 18px;
        box-shadow: 0 6px 18px rgba(0,89,48,0.22);
        animation: fadeIn 0.18s ease-out;
      }
      .eval-floating-batch-bar__left {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 0.86rem;
      }

      /* ── Master-Detail Dual Pane Workspace ── */
      .eval-workspace-body {
        display: flex;
        gap: 18px;
        align-items: flex-start;
        position: relative;
      }
      .eval-master-pane {
        flex: 1;
        min-width: 0;
        background: #ffffff;
        border: 1px solid var(--border-default);
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 1px 3px rgba(0,0,0,0.02);
      }
      .eval-dossier-pane {
        width: 370px;
        flex-shrink: 0;
        background: #ffffff;
        border: 1px solid var(--border-default);
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 16px rgba(0,0,0,0.05);
        display: none;
        flex-direction: column;
        position: sticky;
        top: 80px;
        max-height: calc(100vh - 100px);
      }
      .eval-dossier-pane--visible {
        display: flex;
      }

      @media (max-width: 1100px) {
        .eval-workspace-body {
          flex-direction: column;
        }
        .eval-dossier-pane {
          width: 100%;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          top: auto;
          max-height: 85vh;
          border-radius: 18px 18px 0 0;
          z-index: 999;
          box-shadow: 0 -10px 30px rgba(0,0,0,0.2);
        }
      }

      /* ── Structured Table Styling ── */
      .eval-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.85rem;
      }
      .eval-table th {
        background: #FAFBFD;
        padding: 11px 14px;
        text-align: left;
        font-size: 0.7rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--text-secondary);
        border-bottom: 1px solid var(--border-default);
        white-space: nowrap;
      }
      .eval-table td {
        padding: 12px 14px;
        border-bottom: 1px solid #F3F5F9;
        color: var(--text-primary);
        vertical-align: middle;
      }
      .eval-table tbody tr {
        transition: background-color 0.12s ease;
        cursor: pointer;
      }
      .eval-table tbody tr:hover {
        background-color: #F8FAF9;
      }
      .eval-table tbody tr.is-selected {
        background-color: rgba(0,89,48,0.038);
      }
      .eval-table tbody tr.is-active-inspected {
        background-color: rgba(0,89,48,0.07);
        border-left: 3px solid var(--color-primary);
      }
      .eval-table tbody tr:last-child td {
        border-bottom: none;
      }

      /* ── Micro Badges & Performance Tags ── */
      .eval-status-badge {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 3px 8px;
        border-radius: 6px;
        font-size: 0.72rem;
        font-weight: 600;
        white-space: nowrap;
      }
      .eval-status-badge--ready {
        background: rgba(0, 89, 48, 0.09);
        color: var(--color-primary);
        border: 1px solid rgba(0, 89, 48, 0.2);
      }
      .eval-status-badge--pending {
        background: rgba(245, 158, 11, 0.1);
        color: #B45309;
        border: 1px solid rgba(245, 158, 11, 0.22);
      }
      .eval-status-badge--submitted {
        background: rgba(16, 185, 129, 0.1);
        color: #065F46;
        border: 1px solid rgba(16, 185, 129, 0.22);
      }
      .eval-status-badge--in_progress {
        background: #F1F4F8;
        color: var(--text-secondary);
        border: 1px solid #E2E5EE;
      }

      .eval-score-chip {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-weight: 700;
        padding: 3px 8px;
        border-radius: 6px;
        font-size: 0.8rem;
        letter-spacing: -0.01em;
      }
      .eval-score-chip--high {
        background: rgba(16, 185, 129, 0.1);
        color: #065F46;
        border: 1px solid rgba(16, 185, 129, 0.25);
      }
      .eval-score-chip--mid {
        background: rgba(0, 89, 48, 0.08);
        color: var(--color-primary);
        border: 1px solid rgba(0, 89, 48, 0.2);
      }

      /* ── Linear Hours Progress Micro-Meter ── */
      .eval-hours-meter {
        display: flex;
        flex-direction: column;
        gap: 3px;
        min-width: 125px;
      }
      .eval-hours-meter__track {
        height: 5px;
        width: 100%;
        background: #E8ECEF;
        border-radius: 99px;
        overflow: hidden;
      }
      .eval-hours-meter__fill {
        height: 100%;
        border-radius: 99px;
        transition: width 0.3s ease;
      }
      .eval-hours-meter__meta {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 0.7rem;
        color: var(--text-secondary);
      }

      /* ── Cards View Grid ── */
      .eval-cards-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
        gap: 14px;
        padding: 16px;
      }
      .eval-trainee-card {
        background: #ffffff;
        border: 1px solid var(--border-default);
        border-radius: 10px;
        padding: 14px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        transition: all 0.15s ease;
        cursor: pointer;
        position: relative;
      }
      .eval-trainee-card:hover {
        border-color: rgba(0,89,48,0.35);
        box-shadow: 0 4px 12px rgba(0,0,0,0.04);
      }
      .eval-trainee-card.is-active-inspected {
        border-color: var(--color-primary);
        box-shadow: 0 0 0 1.5px var(--color-primary);
        background: #FAFBFD;
      }

      /* ── Live Appraisal Dossier Drawer ── */
      .eval-dossier__header {
        padding: 14px 18px;
        background: #FAFBFD;
        border-bottom: 1px solid var(--border-default);
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-shrink: 0;
      }
      .eval-dossier__content {
        padding: 18px;
        overflow-y: auto;
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .eval-dossier__hero {
        display: flex;
        align-items: center;
        gap: 12px;
        padding-bottom: 14px;
        border-bottom: 1px solid var(--border-default);
      }
      .eval-dossier__avatar {
        width: 44px;
        height: 44px;
        border-radius: 10px;
        background: rgba(0,89,48,0.1);
        color: var(--color-primary);
        font-size: 1rem;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .eval-dossier__metric-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }
      .eval-dossier__metric-box {
        background: #FAFBFD;
        border: 1px solid var(--border-default);
        border-radius: 8px;
        padding: 10px;
      }
      .eval-dossier__score-highlight {
        background: #F0F7F4;
        border: 1px solid rgba(0,89,48,0.25);
        border-radius: 10px;
        padding: 14px;
        text-align: center;
      }

      /* ── Form Studio & Rubrics Architect (Tab 2) ── */
      .eval-architect-frame {
        background: #ffffff;
        border: 1px solid var(--border-default);
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 1px 3px rgba(0,0,0,0.02);
      }
      .eval-architect-topbar {
        padding: 16px 20px;
        background: #FAFBFD;
        border-bottom: 1px solid var(--border-default);
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 14px;
      }
      .eval-architect-body {
        padding: 22px;
      }
      .eval-category-tabs {
        display: flex;
        align-items: center;
        gap: 6px;
        overflow-x: auto;
        padding-bottom: 8px;
        margin-bottom: 16px;
        border-bottom: 1px solid #F1F4F9;
      }
      .eval-cat-pill {
        padding: 5px 12px;
        border-radius: 99px;
        font-size: 0.76rem;
        font-weight: 600;
        background: #FAFBFD;
        border: 1px solid var(--border-default);
        color: var(--text-secondary);
        cursor: pointer;
        white-space: nowrap;
        transition: all 0.15s ease;
      }
      .eval-cat-pill:hover {
        border-color: var(--color-primary);
        color: var(--text-primary);
      }
      .eval-cat-pill--active {
        background: var(--color-primary);
        color: #ffffff;
        border-color: var(--color-primary);
      }
      .eval-criterion-row {
        background: #ffffff;
        border: 1px solid var(--border-default);
        border-radius: 8px;
        padding: 12px 16px;
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 8px;
        transition: all 0.15s ease;
      }
      .eval-criterion-row:hover {
        border-color: rgba(0,89,48,0.3);
        box-shadow: 0 2px 6px rgba(0,0,0,0.03);
      }

      /* ── Print Styles for Official Appraisal Certification ── */
      @media print {
        body * {
          visibility: hidden !important;
        }
        #print-eval-area, #print-eval-area * {
          visibility: visible !important;
        }
        #print-eval-area {
          position: fixed !important;
          left: 0 !important;
          top: 0 !important;
          width: 100vw !important;
          margin: 0 !important;
          padding: 20px !important;
          background: #fff !important;
        }
        .modal__footer, .modal__close {
          display: none !important;
        }
      }
    </style>

    <div class="eval-workspace">
      <!-- ═══ 1. Executive Institutional Masthead ═══ -->
      <div class="eval-hero-header">
        <div class="eval-hero-header__left">
          <div class="eval-tagline">
            <span class="eval-tagline__pulse"></span>
            <span>Academic Performance Appraisal Console</span>
            ${courseBadge}
          </div>
          <h1 class="eval-title">Evaluations & Assessment Studio</h1>
          <p class="eval-subtitle">
            Oversee host company performance reviews, dispatch standardized evaluation rubrics, and certify final trainee competency ratings.
          </p>
        </div>
        <div class="eval-hero-actions">
          <button class="btn btn--outline btn--sm" id="btn-refresh-hub" style="gap:6px;">
            ${icon('refreshCw', 14)} Refresh Hub
          </button>
          <button class="btn btn--primary btn--sm" id="btn-top-batch-dispatch" style="gap:6px;">
            ${icon('send', 14)} Quick Dispatch
          </button>
        </div>
      </div>

      <!-- ═══ 2. Segmented Navigation & Mode Switcher ═══ -->
      <div class="eval-tab-bar">
        <div class="eval-nav-pills">
          <button class="eval-nav-pill eval-nav-pill--active" id="tab-btn-trainees">
            ${icon('users', 15)}
            <span>Trainee Appraisals</span>
            <span class="eval-nav-pill__badge" id="eval-count-trainees">—</span>
          </button>
          <button class="eval-nav-pill" id="tab-btn-builder">
            ${icon('fileText', 15)}
            <span>Rubric & Form Architect</span>
            <span class="eval-nav-pill__badge" id="eval-count-templates">—</span>
          </button>
        </div>

        <div style="font-size:0.75rem;color:var(--text-tertiary);display:flex;align-items:center;gap:6px;">
          ${icon('shield', 13)}
          <span>CHMSU OJT Standard v2.4</span>
        </div>
      </div>

      <!-- ═══ 3. Connected Workflow Pipeline Bar ═══ -->
      <div class="eval-pipeline-strip" id="eval-pipeline-strip">
        <!-- Step 1: All Placements -->
        <div class="eval-pipeline-card eval-pipeline-card--active" data-filter="all">
          <div class="eval-pipeline-card__header">
            <div class="eval-pipeline-card__icon-box" style="background:#F1F4F8;color:var(--text-secondary);">
              ${icon('briefcase', 16)}
            </div>
            <span class="eval-pipeline-card__step-num">Stage 1</span>
          </div>
          <div class="eval-pipeline-card__value" id="kpi-total">—</div>
          <div class="eval-pipeline-card__title">Total In Placement</div>
          <div class="eval-pipeline-card__desc">Trainees active with host companies</div>
          <div class="eval-pipeline-card__indicator"></div>
        </div>

        <!-- Step 2: Ready for Dispatch -->
        <div class="eval-pipeline-card" data-filter="ready">
          <div class="eval-pipeline-card__header">
            <div class="eval-pipeline-card__icon-box" style="background:rgba(0,89,48,0.08);color:var(--color-primary);">
              ${icon('zap', 16)}
            </div>
            <span class="eval-pipeline-card__step-num" style="color:var(--color-primary);">Action Needed</span>
          </div>
          <div class="eval-pipeline-card__value" id="kpi-ready" style="color:var(--color-primary);">—</div>
          <div class="eval-pipeline-card__title">Ready for Dispatch</div>
          <div class="eval-pipeline-card__desc">100% hours rendered • Pending dispatch</div>
          <div class="eval-pipeline-card__indicator"></div>
        </div>

        <!-- Step 3: Pending Employer Review -->
        <div class="eval-pipeline-card" data-filter="pending">
          <div class="eval-pipeline-card__header">
            <div class="eval-pipeline-card__icon-box" style="background:rgba(245,158,11,0.1);color:#B45309;">
              ${icon('clock', 16)}
            </div>
            <span class="eval-pipeline-card__step-num" style="color:#B45309;">Follow-Up</span>
          </div>
          <div class="eval-pipeline-card__value" id="kpi-pending" style="color:#B45309;">—</div>
          <div class="eval-pipeline-card__title">Awaiting Host Company</div>
          <div class="eval-pipeline-card__desc">Dispatched • Pending mentor scoring</div>
          <div class="eval-pipeline-card__indicator"></div>
        </div>

        <!-- Step 4: Finalized & Scored -->
        <div class="eval-pipeline-card" data-filter="submitted">
          <div class="eval-pipeline-card__header">
            <div class="eval-pipeline-card__icon-box" style="background:rgba(16,185,129,0.1);color:#065F46;">
              ${icon('checkCircle', 16)}
            </div>
            <span class="eval-pipeline-card__step-num" style="color:#065F46;">Certified</span>
          </div>
          <div class="eval-pipeline-card__value" id="kpi-done" style="color:#065F46;">—</div>
          <div class="eval-pipeline-card__title">Finalized & Certified</div>
          <div class="eval-pipeline-card__desc">Official ratings received & archived</div>
          <div class="eval-pipeline-card__indicator"></div>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════════════════════════════
           TAB 1: TRAINEE APPRAISAL WORKSPACE (MASTER-DETAIL DUAL PANE)
           ═══════════════════════════════════════════════════════════════════ -->
      <div id="eval-tab-trainees-view">
        <!-- Command Toolbar -->
        <div class="eval-command-bar" style="margin-bottom:12px;">
          <div class="eval-command-search">
            <span class="eval-command-search__icon">${icon('search', 14)}</span>
            <input id="eval-search-input" placeholder="Search trainee, student ID, or employer..." />
          </div>

          <div class="eval-command-filters">
            <!-- Stage Filter Dropdown -->
            <select class="eval-select-compact" id="eval-stage-dropdown" title="Filter by appraisal stage">
              <option value="all">All Stages</option>
              <option value="ready">Ready for Dispatch (100% Hours)</option>
              <option value="pending">Awaiting Host Company</option>
              <option value="submitted">Finalized & Evaluated</option>
              <option value="in_progress">Rendering Hours (In Training)</option>
            </select>

            <!-- Sort By Dropdown -->
            <select class="eval-select-compact" id="eval-sort-dropdown" title="Sort trainees list">
              <option value="progress_desc">Hours Progress: High to Low</option>
              <option value="name_asc">Trainee Name: A to Z</option>
              <option value="score_desc">Rating: Highest First</option>
              <option value="status">Status Priority</option>
            </select>

            <!-- View Mode Switcher -->
            <div class="eval-view-toggle">
              <button class="eval-view-toggle__btn eval-view-toggle__btn--active" id="btn-view-table" title="Compact Ledger View">
                ${icon('clipboardList', 14)}
              </button>
              <button class="eval-view-toggle__btn" id="btn-view-cards" title="Appraisal Cards View">
                ${icon('target', 14)}
              </button>
            </div>
          </div>
        </div>

        <!-- Floating Batch Action Bar -->
        <div class="eval-floating-batch-bar" id="eval-batch-bar" style="margin-bottom:12px;">
          <div class="eval-floating-batch-bar__left">
            ${icon('checkCircle', 18)}
            <span><strong id="eval-batch-selected-count">0</strong> trainee(s) selected for bulk dispatch</span>
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            <button class="btn btn--ghost btn--sm" id="btn-eval-batch-clear" style="color:#ffffff;border-color:rgba(255,255,255,0.3);font-size:0.78rem;">
              Cancel
            </button>
            <button class="btn btn--sm" id="btn-eval-batch-dispatch-trigger" style="background:#ffffff;color:var(--color-primary);font-weight:700;font-size:0.82rem;gap:6px;">
              ${icon('send', 13)} Dispatch Evaluation (<span id="eval-batch-dispatch-num">0</span>)
            </button>
          </div>
        </div>

        <!-- Dual-Pane Master & Dossier Container -->
        <div class="eval-workspace-body">
          <!-- Master Pane: Trainee Table / Cards -->
          <div class="eval-master-pane">
            <!-- Table View Container -->
            <div id="eval-view-table-wrap" style="overflow-x:auto;">
              <table class="eval-table">
                <thead>
                  <tr>
                    <th style="width:36px;text-align:center;">
                      <input type="checkbox" id="eval-check-all" title="Select all eligible trainees" style="cursor:pointer;" />
                    </th>
                    <th style="min-width:200px;">Trainee Dossier</th>
                    <th style="width:110px;">Student ID</th>
                    <th style="min-width:170px;">Host Company</th>
                    <th style="min-width:160px;">Training Hours</th>
                    <th style="width:130px;">Appraisal State</th>
                    <th style="width:110px;">Score</th>
                    <th style="width:120px;text-align:right;">Actions</th>
                  </tr>
                </thead>
                <tbody id="eval-trainee-tbody">
                  ${[1, 2, 3, 4, 5].map(() => '<tr><td colspan="8"><div class="skeleton" style="height:38px;border-radius:6px;margin:4px 0;"></div></td></tr>').join('')}
                </tbody>
              </table>
            </div>

            <!-- Cards View Container -->
            <div id="eval-view-cards-wrap" class="eval-cards-grid" style="display:none;"></div>
          </div>

          <!-- Dossier Detail Pane (Slide-in / Sticky Inspection Drawer) -->
          <aside class="eval-dossier-pane" id="eval-dossier-pane">
            <div class="eval-dossier__header">
              <div style="display:flex;align-items:center;gap:8px;">
                <span class="badge badge--neutral" style="font-size:0.68rem;text-transform:uppercase;letter-spacing:0.04em;">Dossier Inspection</span>
              </div>
              <div style="display:flex;align-items:center;gap:4px;">
                <button class="btn btn--ghost btn--sm" id="btn-dossier-prev" title="Previous Trainee" style="padding:4px 6px;">
                  ${icon('chevronLeft', 14)}
                </button>
                <button class="btn btn--ghost btn--sm" id="btn-dossier-next" title="Next Trainee" style="padding:4px 6px;">
                  ${icon('chevronRight', 14)}
                </button>
                <button class="btn btn--ghost btn--sm" id="btn-dossier-close" title="Close Dossier" style="padding:4px 6px;margin-left:4px;">
                  ${icon('x', 15)}
                </button>
              </div>
            </div>
            <div class="eval-dossier__content" id="eval-dossier-content">
              <!-- Rendered via renderDossierContent() -->
            </div>
          </aside>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════════════════════════════
           TAB 2: RUBRIC & FORM ARCHITECT (STUDIO VIEW)
           ═══════════════════════════════════════════════════════════════════ -->
      <div id="eval-tab-builder-view" style="display:none;">
        <div class="eval-architect-frame">
          <!-- Top Bar: Form Switcher & Actions -->
          <div class="eval-architect-topbar">
            <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
              <span style="font-size:0.8rem;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;color:var(--text-secondary);">
                Active Rubric:
              </span>
              <select id="builder-form-select" class="eval-select-compact" style="min-width:280px;font-weight:600;">
                <option value="">Loading rubrics...</option>
              </select>
              <span id="builder-active-badge"></span>
            </div>

            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
              <button class="btn btn--outline btn--sm" id="btn-create-form" style="gap:6px;">
                ${icon('plus', 14)} New Form
              </button>
              <button class="btn btn--outline btn--sm" id="btn-edit-form-meta" style="gap:6px;">
                ${icon('edit', 14)} Edit Info
              </button>
              <button class="btn btn--outline btn--sm" id="btn-delete-form" style="gap:6px;color:var(--color-error);border-color:var(--color-error);">
                ${icon('x', 14)} Archive Form
              </button>
              <button class="btn btn--outline btn--sm" id="btn-preview-form-studio" style="gap:6px;">
                ${icon('eye', 14)} Live Preview
              </button>
              <button class="btn btn--primary btn--sm" id="btn-add-criterion" style="gap:6px;">
                ${icon('plus', 14)} Add Criterion
              </button>
            </div>
          </div>

          <div class="eval-architect-body">
            <!-- Active Rubric Metadata Card -->
            <div style="background:#FAFBFD;border:1px solid var(--border-default);border-left:4px solid var(--color-primary);border-radius:8px;padding:16px 20px;margin-bottom:20px;">
              <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-bottom:6px;">
                <h3 id="architect-title" style="margin:0;font-size:1.1rem;font-weight:700;color:var(--text-primary);">...</h3>
                <span id="architect-count-badge" class="badge badge--neutral" style="font-size:0.72rem;padding:3px 9px;">— Criteria</span>
              </div>
              <p id="architect-desc" style="margin:0;font-size:0.84rem;color:var(--text-secondary);max-width:760px;line-height:1.5;">...</p>
            </div>

            <!-- Category Fast-Filter Pills -->
            <div class="eval-category-tabs" id="architect-cat-tabs">
              <button class="eval-cat-pill eval-cat-pill--active" data-cat="all">All Criteria</button>
            </div>

            <!-- Criteria Canvas -->
            <div id="architect-criteria-canvas">
              ${[1, 2, 3].map(() => '<div class="skeleton skeleton--card" style="height:84px;margin-bottom:10px;"></div>').join('')}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Element Cache
  const tabTraineesBtn   = container.querySelector('#tab-btn-trainees');
  const tabBuilderBtn    = container.querySelector('#tab-btn-builder');
  const viewTrainees     = container.querySelector('#eval-tab-trainees-view');
  const viewBuilder      = container.querySelector('#eval-tab-builder-view');

  const pipelineStrip    = container.querySelector('#eval-pipeline-strip');
  const searchInput      = container.querySelector('#eval-search-input');
  const stageDropdown    = container.querySelector('#eval-stage-dropdown');
  const sortDropdown     = container.querySelector('#eval-sort-dropdown');
  const btnViewTable     = container.querySelector('#btn-view-table');
  const btnViewCards     = container.querySelector('#btn-view-cards');
  const viewTableWrap    = container.querySelector('#eval-view-table-wrap');
  const viewCardsWrap    = container.querySelector('#eval-view-cards-wrap');
  const traineeTbody     = container.querySelector('#eval-trainee-tbody');
  const checkAllBox      = container.querySelector('#eval-check-all');
  const dossierPane      = container.querySelector('#eval-dossier-pane');
  const dossierContent   = container.querySelector('#eval-dossier-content');

  const batchBar         = container.querySelector('#eval-batch-bar');
  const batchSelectedEl  = container.querySelector('#eval-batch-selected-count');
  const batchDispatchEl  = container.querySelector('#eval-batch-dispatch-num');
  const batchClearBtn    = container.querySelector('#btn-eval-batch-clear');
  const batchTriggerBtn  = container.querySelector('#btn-eval-batch-dispatch-trigger');

  // =========================================================================
  // TAB NAVIGATION
  // =========================================================================

  function switchTab(tab) {
    activeTab = tab;
    if (tab === 'trainees') {
      tabTraineesBtn.classList.add('eval-nav-pill--active');
      tabBuilderBtn.classList.remove('eval-nav-pill--active');
      viewTrainees.style.display = 'block';
      viewBuilder.style.display = 'none';
      loadTraineesData();
    } else {
      tabBuilderBtn.classList.add('eval-nav-pill--active');
      tabTraineesBtn.classList.remove('eval-nav-pill--active');
      viewTrainees.style.display = 'none';
      viewBuilder.style.display = 'block';
      loadTemplatesData(currentTemplateId);
    }
  }

  tabTraineesBtn.addEventListener('click', () => switchTab('trainees'));
  tabBuilderBtn.addEventListener('click', () => switchTab('builder'));

  container.querySelector('#btn-refresh-hub').addEventListener('click', () => {
    apiCache.invalidate(['/supervisor/evaluations*']);
    if (activeTab === 'trainees') loadTraineesData();
    else loadTemplatesData(currentTemplateId);
  });

  // Top quick dispatch trigger
  container.querySelector('#btn-top-batch-dispatch').addEventListener('click', () => {
    if (selectedStudentIds.size > 0) {
      openBatchSendModal(Array.from(selectedStudentIds));
      return;
    }
    const eligible = traineesList.filter(t => isTraineeReadyToDispatch(t));
    if (eligible.length === 0) {
      showToast('Select trainees with completed hours using the checkboxes to dispatch evaluations.', 'warning');
      return;
    }
    eligible.forEach(t => selectedStudentIds.add(String(t.id)));
    updateBatchBar();
    renderTraineeList();
    openBatchSendModal(Array.from(selectedStudentIds));
  });

  // =========================================================================
  // PIPELINE STRIP / STAGE FILTER HANDLERS
  // =========================================================================

  pipelineStrip.querySelectorAll('.eval-pipeline-card').forEach(card => {
    card.addEventListener('click', () => {
      const targetFilter = card.getAttribute('data-filter');
      setStageFilter(targetFilter);
    });
  });

  stageDropdown.addEventListener('change', (e) => {
    setStageFilter(e.target.value);
  });

  function setStageFilter(filterVal) {
    activeFilter = filterVal;
    stageDropdown.value = filterVal;

    pipelineStrip.querySelectorAll('.eval-pipeline-card').forEach(c => {
      c.classList.toggle('eval-pipeline-card--active', c.getAttribute('data-filter') === filterVal);
    });

    renderTraineeList();
  }

  // Search & Sort Handlers
  searchInput.addEventListener('input', () => renderTraineeList());
  sortDropdown.addEventListener('change', (e) => {
    activeSortBy = e.target.value;
    renderTraineeList();
  });

  // View Mode Handlers
  btnViewTable.addEventListener('click', () => setViewMode('table'));
  btnViewCards.addEventListener('click', () => setViewMode('cards'));

  function setViewMode(mode) {
    activeViewMode = mode;
    btnViewTable.classList.toggle('eval-view-toggle__btn--active', mode === 'table');
    btnViewCards.classList.toggle('eval-view-toggle__btn--active', mode === 'cards');

    if (mode === 'table') {
      viewTableWrap.style.display = 'block';
      viewCardsWrap.style.display = 'none';
    } else {
      viewTableWrap.style.display = 'none';
      viewCardsWrap.style.display = 'grid';
    }
  }

  // Check all checkbox
  checkAllBox.addEventListener('change', (e) => {
    const eligible = getFilteredTrainees().filter(t => isTraineeSelectable(t));
    if (e.target.checked) {
      eligible.forEach(t => selectedStudentIds.add(String(t.id)));
    } else {
      eligible.forEach(t => selectedStudentIds.delete(String(t.id)));
    }
    updateBatchBar();
    renderTraineeList();
  });

  // Batch Bar handlers
  batchClearBtn.addEventListener('click', () => {
    selectedStudentIds.clear();
    updateBatchBar();
    renderTraineeList();
  });

  batchTriggerBtn.addEventListener('click', () => {
    if (selectedStudentIds.size === 0) return;
    openBatchSendModal(Array.from(selectedStudentIds));
  });

  function updateBatchBar() {
    const count = selectedStudentIds.size;
    batchSelectedEl.textContent = count;
    batchDispatchEl.textContent = count;
    batchBar.style.display = count > 0 ? 'flex' : 'none';

    // Update Select-All Box State
    const eligible = getFilteredTrainees().filter(t => isTraineeSelectable(t));
    if (eligible.length > 0 && eligible.every(t => selectedStudentIds.has(String(t.id)))) {
      checkAllBox.checked = true;
      checkAllBox.indeterminate = false;
    } else if (eligible.some(t => selectedStudentIds.has(String(t.id)))) {
      checkAllBox.checked = false;
      checkAllBox.indeterminate = true;
    } else {
      checkAllBox.checked = false;
      checkAllBox.indeterminate = false;
    }
  }

  // Dossier close & navigation
  container.querySelector('#btn-dossier-close').addEventListener('click', () => {
    selectedTraineeForDossier = null;
    dossierPane.classList.remove('eval-dossier-pane--visible');
    container.querySelectorAll('.is-active-inspected').forEach(el => el.classList.remove('is-active-inspected'));
  });

  container.querySelector('#btn-dossier-prev').addEventListener('click', () => navigateDossier(-1));
  container.querySelector('#btn-dossier-next').addEventListener('click', () => navigateDossier(1));

  function navigateDossier(dir) {
    if (!selectedTraineeForDossier) return;
    const list = getFilteredTrainees();
    const curIdx = list.findIndex(t => t.id === selectedTraineeForDossier.id);
    if (curIdx === -1) return;
    const nextIdx = curIdx + dir;
    if (nextIdx >= 0 && nextIdx < list.length) {
      inspectTraineeDossier(list[nextIdx]);
    }
  }

  // =========================================================================
  // DATA LOADERS
  // =========================================================================

  async function loadTraineesData() {
    try {
      const res = await apiGet('/supervisor/evaluations/trainees', { forceRefresh: true });
      if (res?.success && Array.isArray(res.data)) {
        traineesList = res.data;
        const validCount = traineesList.filter(t => t.hasPlacement !== false && t.company !== '—').length;
        container.querySelector('#eval-count-trainees').textContent = validCount;
        renderPipelineKPIs(res.kpis || {});
        renderTraineeList();
        updateBatchBar();

        // If previously inspecting a student, refresh their dossier
        if (selectedTraineeForDossier) {
          const fresh = traineesList.find(t => t.id === selectedTraineeForDossier.id);
          if (fresh) inspectTraineeDossier(fresh);
        }
      }
    } catch (err) {
      traineeTbody.innerHTML = `
        <tr><td colspan="8" class="text-center" style="padding:32px;color:var(--color-error);">
          Failed to load trainee evaluations: ${err.message}
        </td></tr>`;
    }
  }

  async function loadTemplatesData(preferredId = null) {
    try {
      const res = await apiGet('/supervisor/evaluations/templates', { forceRefresh: true });
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        templatesList = res.data;
        container.querySelector('#eval-count-templates').textContent = templatesList.length;

        if (preferredId && templatesList.some(t => t.id === preferredId)) {
          currentTemplateId = preferredId;
        } else if (!currentTemplateId || !templatesList.some(t => t.id === currentTemplateId)) {
          const defaultTpl = templatesList.find(t => t.is_default) || templatesList[0];
          currentTemplateId = defaultTpl.id;
        }

        renderTemplateDropdown();
        await loadTemplateDetail(currentTemplateId);
      }
    } catch (err) {
      console.error('Failed to load templates:', err);
    }
  }

  async function loadTemplateDetail(templateId) {
    try {
      const res = await apiGet(`/supervisor/evaluations/templates/${templateId}`, { forceRefresh: true });
      if (res?.success && res.data) {
        currentTemplate = res.data;
        renderArchitectCriteria(currentTemplate);
        updateArchitectMetadata(currentTemplate);
      }
    } catch (err) {
      container.querySelector('#architect-criteria-canvas').innerHTML = `
        <div style="padding:24px;text-align:center;color:var(--color-error);">
          Failed to load rubric criteria: ${err.message}
        </div>`;
    }
  }

  // =========================================================================
  // RENDER PIPELINE KPIS
  // =========================================================================

  function renderPipelineKPIs(kpis) {
    const totalEl = container.querySelector('#kpi-total');
    const readyEl = container.querySelector('#kpi-ready');
    const pendingEl = container.querySelector('#kpi-pending');
    const doneEl = container.querySelector('#kpi-done');

    const totalCount = kpis.totalTrainees ?? traineesList.filter(t => t.hasPlacement !== false && t.company !== '—').length;
    const readyCount = kpis.readyToSend ?? traineesList.filter(t => isTraineeReadyToDispatch(t)).length;
    const pendingCount = kpis.evaluationPending ?? traineesList.filter(t => t.evaluationStatus === 'pending').length;
    const doneCount = kpis.evaluationDone ?? traineesList.filter(t => t.evaluationStatus === 'submitted').length;

    if (totalEl) totalEl.textContent = totalCount;
    if (readyEl) readyEl.textContent = readyCount;
    if (pendingEl) pendingEl.textContent = pendingCount;
    if (doneEl) doneEl.textContent = doneCount;
  }

  // =========================================================================
  // FILTER & SORT TRAINEES
  // =========================================================================

  function isTraineeSelectable(t) {
    return t.hasPlacement !== false && t.company !== '—' && t.company_user_id && t.evaluationStatus !== 'submitted';
  }

  function isTraineeReadyToDispatch(t) {
    return t.hasPlacement !== false && t.company !== '—' && t.isHoursCompleted && t.evaluationStatus === 'not_sent' && t.company_user_id;
  }

  function getFilteredTrainees() {
    const q = searchInput.value.toLowerCase().trim();

    let list = traineesList.filter(t => {
      if (t.hasPlacement === false || !t.company || t.company === '—') return false;

      // Text search
      if (q) {
        const match = (t.name || '').toLowerCase().includes(q) ||
                      (t.email || '').toLowerCase().includes(q) ||
                      (t.studentId || '').toLowerCase().includes(q) ||
                      (t.company || '').toLowerCase().includes(q);
        if (!match) return false;
      }

      // Stage filter
      if (activeFilter === 'ready') {
        return t.isHoursCompleted && t.evaluationStatus === 'not_sent';
      } else if (activeFilter === 'pending') {
        return t.evaluationStatus === 'pending';
      } else if (activeFilter === 'submitted') {
        return t.evaluationStatus === 'submitted';
      } else if (activeFilter === 'in_progress') {
        return !t.isHoursCompleted;
      }
      return true;
    });

    // Sorting
    list.sort((a, b) => {
      if (activeSortBy === 'progress_desc') {
        return (b.progressPercent || 0) - (a.progressPercent || 0);
      } else if (activeSortBy === 'name_asc') {
        return (a.name || '').localeCompare(b.name || '');
      } else if (activeSortBy === 'score_desc') {
        return (b.evaluationScore || 0) - (a.evaluationScore || 0);
      } else if (activeSortBy === 'status') {
        const statusRank = { submitted: 4, pending: 3, not_sent: 2, in_progress: 1 };
        return (statusRank[b.evaluationStatus] || 0) - (statusRank[a.evaluationStatus] || 0);
      }
      return 0;
    });

    return list;
  }

  // =========================================================================
  // RENDER TRAINEE LIST (TABLE & CARDS)
  // =========================================================================

  function renderTraineeList() {
    const filtered = getFilteredTrainees();

    if (!filtered.length) {
      const emptyHtml = `
        <div style="padding:48px 24px;text-align:center;">
          <div style="width:48px;height:48px;border-radius:50%;background:rgba(0,89,48,0.06);color:var(--color-primary);display:flex;align-items:center;justify-content:center;margin:0 auto 12px;">
            ${icon('users', 24)}
          </div>
          <h4 style="margin:0 0 4px;font-size:0.95rem;font-weight:600;color:var(--text-primary);">No matching trainees</h4>
          <p class="text-tertiary text-xs" style="margin:0;">Try adjusting your search criteria or stage filter.</p>
        </div>`;
      traineeTbody.innerHTML = `<tr><td colspan="8">${emptyHtml}</td></tr>`;
      viewCardsWrap.innerHTML = emptyHtml;
      return;
    }

    // 1. Render Table Rows
    traineeTbody.innerHTML = filtered.map(t => {
      const init = (t.name || '').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
      const pct = t.progressPercent || 0;
      const barColor = pct >= 100 ? 'var(--color-primary)' : pct >= 50 ? '#10B981' : '#F59E0B';
      const selectable = isTraineeSelectable(t);
      const isChecked = selectedStudentIds.has(String(t.id));
      const isInspected = selectedTraineeForDossier?.id === t.id;

      // Status pill
      let statusBadge = '';
      if (t.evaluationStatus === 'submitted') {
        statusBadge = `<span class="eval-status-badge eval-status-badge--submitted">${icon('checkCircle', 12)} Finalized</span>`;
      } else if (t.evaluationStatus === 'pending') {
        statusBadge = `<span class="eval-status-badge eval-status-badge--pending">${icon('clock', 12)} In Review</span>`;
      } else if (t.isHoursCompleted) {
        statusBadge = `<span class="eval-status-badge eval-status-badge--ready">${icon('zap', 12)} Ready</span>`;
      } else {
        statusBadge = `<span class="eval-status-badge eval-status-badge--in_progress">In Training</span>`;
      }

      // Rating/Score display
      let scoreDisplay = '<span style="color:var(--text-tertiary);font-size:0.8rem;">—</span>';
      if (t.evaluationStatus === 'submitted' && t.evaluationScore) {
        const sc = Number(t.evaluationScore).toFixed(1);
        const chipClass = t.evaluationScore >= 4.5 ? 'eval-score-chip--high' : 'eval-score-chip--mid';
        scoreDisplay = `
          <div class="eval-score-chip ${chipClass}">
            <span style="color:#F59E0B;font-size:0.85rem;">★</span> ${sc}
          </div>`;
      }

      // Actions button
      let actionBtn = '';
      if (t.evaluationStatus === 'submitted') {
        actionBtn = `
          <button class="btn btn--outline btn--sm btn-row-inspect" data-student-id="${t.id}" style="padding:4px 9px;font-size:0.75rem;gap:4px;">
            ${icon('eye', 13)} Dossier
          </button>`;
      } else if (t.evaluationStatus === 'pending') {
        actionBtn = `
          <button class="btn btn--outline btn--sm btn-row-remind" data-eval-id="${t.evaluationId}" style="padding:4px 9px;font-size:0.75rem;gap:4px;color:#B45309;border-color:rgba(245,158,11,0.4);" title="Send reminder to employer">
            ${icon('bell', 13)} Remind
          </button>`;
      } else if (t.company_user_id) {
        actionBtn = `
          <button class="btn btn--primary btn--sm btn-row-send-single" data-student-id="${t.id}" data-name="${t.name}" data-company="${t.company}" style="padding:4px 11px;font-size:0.75rem;gap:4px;">
            ${icon('send', 13)} Send
          </button>`;
      } else {
        actionBtn = `<span class="text-xs text-tertiary" title="Company does not have an active employer portal account">No portal link</span>`;
      }

      return `
        <tr data-student-id="${t.id}" class="${isChecked ? 'is-selected' : ''} ${isInspected ? 'is-active-inspected' : ''}">
          <td style="text-align:center;" onclick="event.stopPropagation();">
            <input type="checkbox" class="eval-row-checkbox" data-student-id="${t.id}" ${selectable ? '' : 'disabled title="Evaluation already completed"'} ${isChecked ? 'checked' : ''} style="cursor:pointer;" />
          </td>
          <td class="eval-td-inspect-trigger">
            <div style="display:flex;align-items:center;gap:10px;">
              <div style="width:34px;height:34px;border-radius:8px;background:rgba(0,89,48,0.08);color:var(--color-primary);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.75rem;flex-shrink:0;">
                ${init}
              </div>
              <div style="min-width:0;">
                <div style="font-weight:600;color:var(--text-primary);font-size:0.86rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:180px;">${t.name}</div>
                <div style="font-size:0.72rem;color:var(--text-secondary);">${t.course} ${t.section ? `• ${t.section}` : ''}</div>
              </div>
            </div>
          </td>
          <td><span style="font-family:monospace;font-size:0.75rem;color:var(--text-secondary);">${t.studentId || '—'}</span></td>
          <td>
            <div style="display:flex;align-items:center;gap:6px;font-size:0.83rem;font-weight:500;">
              ${icon('building', 13)} <span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:160px;">${t.company || '—'}</span>
            </div>
          </td>
          <td>
            <div class="eval-hours-meter">
              <div class="eval-hours-meter__track">
                <div class="eval-hours-meter__fill" style="width:${pct}%;background:${barColor};"></div>
              </div>
              <div class="eval-hours-meter__meta">
                <span>${t.completedHours}/${t.requiredHours}h</span>
                <span style="font-weight:600;">${pct}%</span>
              </div>
            </div>
          </td>
          <td>${statusBadge}</td>
          <td>${scoreDisplay}</td>
          <td style="text-align:right;" onclick="event.stopPropagation();">${actionBtn}</td>
        </tr>
      `;
    }).join('');

    // 2. Render Cards View
    viewCardsWrap.innerHTML = filtered.map(t => {
      const init = (t.name || '').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
      const pct = t.progressPercent || 0;
      const barColor = pct >= 100 ? 'var(--color-primary)' : pct >= 50 ? '#10B981' : '#F59E0B';
      const isInspected = selectedTraineeForDossier?.id === t.id;

      let scoreBadge = '';
      if (t.evaluationStatus === 'submitted' && t.evaluationScore) {
        scoreBadge = `<div class="eval-score-chip eval-score-chip--high"><span style="color:#F59E0B;">★</span> ${Number(t.evaluationScore).toFixed(1)}</div>`;
      }

      return `
        <div class="eval-trainee-card ${isInspected ? 'is-active-inspected' : ''}" data-student-id="${t.id}">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;">
            <div style="display:flex;align-items:center;gap:10px;">
              <div style="width:38px;height:38px;border-radius:8px;background:rgba(0,89,48,0.08);color:var(--color-primary);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.8rem;flex-shrink:0;">
                ${init}
              </div>
              <div>
                <div style="font-weight:700;font-size:0.88rem;color:var(--text-primary);">${t.name}</div>
                <div style="font-size:0.72rem;color:var(--text-secondary);font-family:monospace;">${t.studentId || 'ID —'} • ${t.section || t.course}</div>
              </div>
            </div>
            ${scoreBadge}
          </div>

          <div style="background:#FAFBFD;padding:8px 10px;border-radius:6px;border:1px solid #F1F4F9;display:flex;align-items:center;gap:6px;font-size:0.8rem;color:var(--text-secondary);">
            ${icon('building', 13)}
            <span style="font-weight:600;color:var(--text-primary);">${t.company || '—'}</span>
          </div>

          <div class="eval-hours-meter">
            <div class="eval-hours-meter__track">
              <div class="eval-hours-meter__fill" style="width:${pct}%;background:${barColor};"></div>
            </div>
            <div class="eval-hours-meter__meta">
              <span>Completed Hours: ${t.completedHours} of ${t.requiredHours}</span>
              <span style="font-weight:700;color:var(--text-primary);">${pct}%</span>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Attach Table Row Click Listeners
    traineeTbody.querySelectorAll('tr').forEach(tr => {
      tr.addEventListener('click', () => {
        const sId = parseInt(tr.getAttribute('data-student-id'));
        const target = traineesList.find(item => item.id === sId);
        if (target) inspectTraineeDossier(target);
      });
    });

    // Attach Card Click Listeners
    viewCardsWrap.querySelectorAll('.eval-trainee-card').forEach(card => {
      card.addEventListener('click', () => {
        const sId = parseInt(card.getAttribute('data-student-id'));
        const target = traineesList.find(item => item.id === sId);
        if (target) inspectTraineeDossier(target);
      });
    });

    // Attach Checkbox Handlers
    traineeTbody.querySelectorAll('.eval-row-checkbox').forEach(cb => {
      cb.addEventListener('change', (e) => {
        const sId = e.target.getAttribute('data-student-id');
        if (e.target.checked) selectedStudentIds.add(sId);
        else selectedStudentIds.delete(sId);
        updateBatchBar();
        const tr = cb.closest('tr');
        if (tr) tr.classList.toggle('is-selected', e.target.checked);
      });
    });

    // Action button handlers
    traineeTbody.querySelectorAll('.btn-row-inspect').forEach(btn => {
      btn.addEventListener('click', () => {
        const sId = parseInt(btn.getAttribute('data-student-id'));
        const target = traineesList.find(item => item.id === sId);
        if (target) inspectTraineeDossier(target);
      });
    });

    traineeTbody.querySelectorAll('.btn-row-send-single').forEach(btn => {
      btn.addEventListener('click', () => {
        const sId   = btn.getAttribute('data-student-id');
        const name  = btn.getAttribute('data-name');
        const comp  = btn.getAttribute('data-company');
        openSendConfirmModal(sId, name, comp);
      });
    });

    traineeTbody.querySelectorAll('.btn-row-remind').forEach(btn => {
      btn.addEventListener('click', async () => {
        const evalId = btn.getAttribute('data-eval-id');
        btn.disabled = true;
        btn.innerHTML = `${icon('loader', 12)} Reminding...`;
        try {
          const res = await apiPost(`/supervisor/evaluations/remind/${evalId}`, {});
          if (res?.success) {
            showToast(res.message || 'Reminder notification sent to company.', 'success');
          } else {
            showToast(res?.message || 'Failed to send reminder.', 'error');
          }
        } catch (e) {
          showToast(e.message || 'Error sending reminder.', 'error');
        } finally {
          btn.disabled = false;
          btn.innerHTML = `${icon('bell', 13)} Remind`;
        }
      });
    });
  }

  // =========================================================================
  // INSPECT TRAINEE DOSSIER (LIVE RIGHT-SIDE DRAWER)
  // =========================================================================

  function inspectTraineeDossier(trainee) {
    selectedTraineeForDossier = trainee;
    dossierPane.classList.add('eval-dossier-pane--visible');

    // Highlight row / card
    container.querySelectorAll('.is-active-inspected').forEach(el => el.classList.remove('is-active-inspected'));
    const targetTr = container.querySelector(`tr[data-student-id="${trainee.id}"]`);
    if (targetTr) targetTr.classList.add('is-active-inspected');
    const targetCard = container.querySelector(`.eval-trainee-card[data-student-id="${trainee.id}"]`);
    if (targetCard) targetCard.classList.add('is-active-inspected');

    renderDossierContent(trainee);
  }

  function renderDossierContent(t) {
    const init = (t.name || '').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const pct = t.progressPercent || 0;
    const barColor = pct >= 100 ? 'var(--color-primary)' : pct >= 50 ? '#10B981' : '#F59E0B';

    let statusPill = '';
    if (t.evaluationStatus === 'submitted') {
      statusPill = `<span class="badge badge--success" style="font-size:0.72rem;padding:3px 8px;">Finalized & Certified</span>`;
    } else if (t.evaluationStatus === 'pending') {
      statusPill = `<span class="badge badge--warning" style="font-size:0.72rem;padding:3px 8px;">Awaiting Host Company</span>`;
    } else if (t.isHoursCompleted) {
      statusPill = `<span class="badge badge--info" style="font-size:0.72rem;padding:3px 8px;">Ready for Dispatch</span>`;
    } else {
      statusPill = `<span class="badge badge--neutral" style="font-size:0.72rem;padding:3px 8px;">Rendering Hours (${pct}%)</span>`;
    }

    // Action button area based on state
    let actionAreaHtml = '';
    if (t.evaluationStatus === 'submitted') {
      actionAreaHtml = `
        <div class="eval-dossier__score-highlight">
          <div style="font-size:0.7rem;font-weight:700;text-transform:uppercase;color:var(--color-primary);letter-spacing:0.04em;">Official Performance Rating</div>
          <div style="display:flex;align-items:baseline;justify-content:center;gap:6px;margin:4px 0;">
            <span style="font-size:2rem;font-weight:800;color:var(--color-primary);">${Number(t.evaluationScore || 5.0).toFixed(1)}</span>
            <span style="font-size:1rem;color:var(--text-secondary);font-weight:600;">/ 5.00</span>
          </div>
          <div style="font-size:0.75rem;color:var(--text-secondary);margin-bottom:12px;">
            Evaluator: <strong>${t.evaluatorName || 'Company Mentor'}</strong>
          </div>
          <div style="display:flex;gap:8px;justify-content:center;">
            <button class="btn btn--primary btn--sm" id="btn-dossier-view-scorecard" style="font-size:0.78rem;gap:6px;">
              ${icon('clipboardCheck', 13)} Full Scorecard
            </button>
          </div>
        </div>`;
    } else if (t.evaluationStatus === 'pending') {
      actionAreaHtml = `
        <div style="background:#FFFBEB;border:1px solid rgba(245,158,11,0.25);border-radius:10px;padding:14px;text-align:center;">
          <div style="color:#B45309;font-weight:700;font-size:0.85rem;margin-bottom:4px;display:flex;align-items:center;justify-content:center;gap:6px;">
            ${icon('clock', 14)} Form Dispatched
          </div>
          <p style="font-size:0.75rem;color:var(--text-secondary);margin:0 0 10px;">
            Sent on ${t.evaluationSentAt || 'recently'}. Waiting for employer mentor to complete scoring.
          </p>
          <div style="display:flex;gap:6px;">
            <button class="btn btn--outline btn--sm" id="btn-dossier-remind" style="font-size:0.78rem;gap:6px;color:#B45309;border-color:rgba(245,158,11,0.4);flex:1;">
              ${icon('bell', 13)} Send Nudge
            </button>
            ${t.company_user_id ? `
              <button class="btn btn--outline btn--sm" id="btn-dossier-chat-company" style="font-size:0.78rem;gap:6px;color:#0284c7;border-color:rgba(2,132,199,0.35);flex:1;" title="Chat with Company">
                ${icon('messageCircle', 13)} Chat
              </button>
            ` : ''}
          </div>
        </div>`;
    } else if (t.isHoursCompleted) {
      actionAreaHtml = `
        <div style="background:#F0F7F4;border:1px solid rgba(0,89,48,0.25);border-radius:10px;padding:14px;text-align:center;">
          <div style="color:var(--color-primary);font-weight:700;font-size:0.85rem;margin-bottom:4px;display:flex;align-items:center;justify-content:center;gap:6px;">
            ${icon('checkCircle', 14)} Hours Completed
          </div>
          <p style="font-size:0.75rem;color:var(--text-secondary);margin:0 0 10px;">
            This trainee has met their required OJT hours. You can now dispatch the institutional evaluation form.
          </p>
          <button class="btn btn--primary btn--sm" id="btn-dossier-dispatch" style="font-size:0.78rem;gap:6px;width:100%;">
            ${icon('send', 13)} Dispatch Evaluation Form
          </button>
        </div>`;
    } else {
      actionAreaHtml = `
        <div style="background:#FAFBFD;border:1px solid var(--border-default);border-radius:10px;padding:14px;text-align:center;">
          <div style="color:var(--text-secondary);font-weight:600;font-size:0.82rem;margin-bottom:4px;">
            Currently Rendering Hours
          </div>
          <p style="font-size:0.75rem;color:var(--text-tertiary);margin:0;">
            ${t.completedHours} of ${t.requiredHours} hours rendered (${pct}%). Evaluation dispatch will be unlocked once required hours are fulfilled.
          </p>
        </div>`;
    }

    dossierContent.innerHTML = `
      <!-- Trainee Identification -->
      <div class="eval-dossier__hero">
        <div class="eval-dossier__avatar">${init}</div>
        <div style="min-width:0;flex:1;">
          <div style="font-weight:700;font-size:0.95rem;color:var(--text-primary);line-height:1.3;">${t.name}</div>
          <div style="font-size:0.75rem;color:var(--text-secondary);margin-top:2px;">
            ${t.course} ${t.section ? `• ${t.section}` : ''}
          </div>
          <div style="font-size:0.72rem;font-family:monospace;color:var(--text-tertiary);margin-top:1px;">
            ID: ${t.studentId || '—'}
          </div>
        </div>
      </div>

      <!-- Stage Status Banner -->
      <div style="display:flex;align-items:center;justify-content:space-between;background:#FAFBFD;padding:8px 12px;border-radius:8px;border:1px solid var(--border-default);">
        <span style="font-size:0.72rem;font-weight:700;text-transform:uppercase;color:var(--text-secondary);">Workflow Status</span>
        ${statusPill}
      </div>

      <!-- Host Company Deployment Card -->
      <div class="eval-dossier__metric-box">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
          <div style="font-size:0.7rem;font-weight:700;text-transform:uppercase;color:var(--text-tertiary);">Host Organization</div>
          ${t.company_user_id ? `
            <button type="button" class="btn btn--ghost btn--xs btn-dossier-chat-direct" style="color:#0284c7;font-size:0.7rem;padding:2px 6px;gap:4px;font-weight:600;" title="Message Company">
              ${icon('messageCircle', 12)} Message
            </button>
          ` : ''}
        </div>
        <div style="font-weight:700;font-size:0.88rem;color:var(--text-primary);display:flex;align-items:center;gap:6px;">
          ${icon('building', 14)} ${t.company || '—'}
        </div>
        <div style="font-size:0.72rem;color:var(--text-secondary);margin-top:2px;">
          ${t.company_user_id ? '✓ Linked Employer Account' : '⚠️ No portal account linked'}
        </div>
      </div>

      <!-- Training Hours Progress Meter -->
      <div class="eval-dossier__metric-box">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
          <span style="font-size:0.7rem;font-weight:700;text-transform:uppercase;color:var(--text-tertiary);">Hours Progress</span>
          <span style="font-weight:700;font-size:0.82rem;color:var(--color-primary);">${pct}%</span>
        </div>
        <div class="eval-hours-meter__track" style="height:6px;margin-bottom:6px;">
          <div class="eval-hours-meter__fill" style="width:${pct}%;background:${barColor};"></div>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:0.72rem;color:var(--text-secondary);">
          <span>Rendered: ${t.completedHours}h</span>
          <span>Target: ${t.requiredHours}h</span>
        </div>
      </div>

      <!-- State Action Section -->
      ${actionAreaHtml}
    `;

    // Attach action listeners inside dossier
    dossierContent.querySelector('#btn-dossier-view-scorecard')?.addEventListener('click', () => {
      if (t.evaluationId) openEvaluationDetailsModal(t.evaluationId);
    });

    dossierContent.querySelector('#btn-dossier-dispatch')?.addEventListener('click', () => {
      openSendConfirmModal(t.id, t.name, t.company);
    });

    const triggerCompanyChat = () => {
      if (t.company_user_id && window.openCompanyChat) {
        window.openCompanyChat(t.company_user_id);
      }
    };
    dossierContent.querySelector('#btn-dossier-chat-company')?.addEventListener('click', triggerCompanyChat);
    dossierContent.querySelector('.btn-dossier-chat-direct')?.addEventListener('click', triggerCompanyChat);

    dossierContent.querySelector('#btn-dossier-remind')?.addEventListener('click', async () => {
      const btn = dossierContent.querySelector('#btn-dossier-remind');
      btn.disabled = true;
      btn.innerHTML = `${icon('loader', 12)} Reminding...`;
      try {
        const res = await apiPost(`/supervisor/evaluations/remind/${t.evaluationId}`, {});
        if (res?.success) {
          showToast(res.message || 'Reminder sent to company.', 'success');
        } else {
          showToast(res?.message || 'Failed to send reminder.', 'error');
        }
      } catch (e) {
        showToast(e.message || 'Error sending reminder.', 'error');
      } finally {
        btn.disabled = false;
        btn.innerHTML = `${icon('bell', 13)} Send Nudge Reminder`;
      }
    });
  }

  // =========================================================================
  // TAB 2: RUBRIC ARCHITECT RENDERERS
  // =========================================================================

  function renderTemplateDropdown() {
    const sel = container.querySelector('#builder-form-select');
    if (!sel) return;

    sel.innerHTML = templatesList.map(tpl => {
      const isCur = tpl.id === currentTemplateId;
      const count = tpl.questions_count ?? (tpl.questions?.length || 0);
      const defBadge = tpl.is_default ? ' (Standard Default)' : '';
      return `<option value="${tpl.id}" ${isCur ? 'selected' : ''}>${tpl.title}${defBadge} — ${count} Criteria</option>`;
    }).join('');
  }

  function updateArchitectMetadata(tpl) {
    const titleEl = container.querySelector('#architect-title');
    const descEl  = container.querySelector('#architect-desc');
    const badgeEl = container.querySelector('#builder-active-badge');
    const countBadge = container.querySelector('#architect-count-badge');

    if (titleEl) titleEl.textContent = tpl.title || 'Institutional OJT Rubric';
    if (descEl) descEl.textContent = tpl.description || 'Standard institutional performance assessment rubric for host employer evaluation.';
    if (countBadge) countBadge.textContent = `${tpl.questions?.length || 0} Total Criteria`;

    if (badgeEl) {
      if (tpl.is_default) {
        badgeEl.innerHTML = `<span class="badge badge--success" style="font-size:0.7rem;padding:2px 8px;">Institutional Standard</span>`;
      } else {
        badgeEl.innerHTML = `<span class="badge badge--info" style="font-size:0.7rem;padding:2px 8px;">Customized Form</span>`;
      }
    }
  }

  function renderArchitectCriteria(tpl) {
    const canvas = container.querySelector('#architect-criteria-canvas');
    const catTabs = container.querySelector('#architect-cat-tabs');
    if (!canvas || !catTabs) return;

    const questions = tpl.questions || [];

    if (!questions.length) {
      canvas.innerHTML = `
        <div style="padding:40px 24px;text-align:center;background:#FAFBFD;border:1px dashed var(--border-default);border-radius:10px;">
          <div style="width:44px;height:44px;border-radius:50%;background:rgba(0,89,48,0.06);color:var(--color-primary);display:flex;align-items:center;justify-content:center;margin:0 auto 12px;">
            ${icon('fileText', 22)}
          </div>
          <h4 style="margin:0 0 6px;font-size:0.95rem;font-weight:600;color:var(--text-primary);">No criteria in this evaluation form</h4>
          <p style="margin:0 0 16px;font-size:0.82rem;color:var(--text-secondary);">Start adding competency ratings or qualitative criteria below.</p>
          <button class="btn btn--primary btn--sm" id="btn-architect-first-q" style="gap:6px;">
            ${icon('plus', 14)} Add Criterion
          </button>
        </div>`;
      canvas.querySelector('#btn-architect-first-q')?.addEventListener('click', () => openAddQuestionModal());
      catTabs.innerHTML = '';
      return;
    }

    // Extract unique categories
    const categoriesMap = {};
    questions.forEach(q => {
      const cat = q.category || 'General Assessment';
      if (!categoriesMap[cat]) categoriesMap[cat] = [];
      categoriesMap[cat].push(q);
    });

    const categoryNames = Object.keys(categoriesMap);

    // Render category tabs
    catTabs.innerHTML = `
      <button class="eval-cat-pill ${activeCategoryFilter === 'all' ? 'eval-cat-pill--active' : ''}" data-cat="all">
        All Criteria (${questions.length})
      </button>
      ${categoryNames.map(c => `
        <button class="eval-cat-pill ${activeCategoryFilter === c ? 'eval-cat-pill--active' : ''}" data-cat="${c}">
          ${c} (${categoriesMap[c].length})
        </button>
      `).join('')}
    `;

    catTabs.querySelectorAll('.eval-cat-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        activeCategoryFilter = pill.getAttribute('data-cat');
        renderArchitectCriteria(tpl);
      });
    });

    // Filter questions by active category
    const displayCategories = activeCategoryFilter === 'all'
      ? categoriesMap
      : { [activeCategoryFilter]: categoriesMap[activeCategoryFilter] || [] };

    let globalIndex = 1;

    canvas.innerHTML = Object.entries(displayCategories).map(([catName, qList]) => `
      <div style="margin-bottom:20px;">
        <div style="display:flex;align-items:center;gap:8px;font-size:0.78rem;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;color:var(--color-primary);margin-bottom:10px;">
          ${icon('folderOpen', 14)}
          <span>${catName}</span>
          <span class="badge badge--neutral" style="font-size:0.68rem;padding:2px 6px;">${qList.length} criteria</span>
        </div>
        <div>
          ${qList.map(q => {
            let typeBadge = '';
            if (q.question_type === 'rating') {
              typeBadge = `<span class="badge badge--warning" style="font-size:0.68rem;gap:4px;">★ Rating (1–${q.scale_max || 5})</span>`;
            } else if (q.question_type === 'multiple_choice') {
              typeBadge = `<span class="badge badge--info" style="font-size:0.68rem;gap:4px;">🔘 Choice</span>`;
            } else {
              typeBadge = `<span class="badge badge--success" style="font-size:0.68rem;gap:4px;">📝 Qualitative Text</span>`;
            }

            const optionsHtml = Array.isArray(q.options) && q.options.length ? `
              <div style="display:flex;flex-wrap:wrap;gap:5px;margin-top:6px;">
                ${q.options.map(opt => `<span style="font-size:0.72rem;background:#F1F4F8;padding:2px 7px;border-radius:4px;color:var(--text-secondary);">${opt}</span>`).join('')}
              </div>` : '';

            const currentIndex = String(globalIndex++).padStart(2, '0');

            return `
              <div class="eval-criterion-row">
                <div style="width:24px;height:24px;border-radius:6px;background:#F1F4F8;color:var(--text-secondary);display:flex;align-items:center;justify-content:center;font-size:0.72rem;font-weight:700;flex-shrink:0;margin-top:2px;">
                  ${currentIndex}
                </div>
                <div style="flex:1;min-width:0;">
                  <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;flex-wrap:wrap;">
                    ${typeBadge}
                    ${q.is_required ? '<span class="badge badge--error" style="font-size:0.65rem;padding:1px 5px;">Required</span>' : '<span class="text-xs text-tertiary">Optional</span>'}
                  </div>
                  <div style="font-size:0.88rem;font-weight:600;color:var(--text-primary);line-height:1.4;">${q.question_text}</div>
                  ${optionsHtml}
                </div>
                <div style="display:flex;align-items:center;gap:4px;flex-shrink:0;">
                  <button class="btn btn--ghost btn--sm btn-edit-crit" data-id="${q.id}" title="Edit Criterion" style="padding:5px 7px;color:var(--text-secondary);">
                    ${icon('edit', 14)}
                  </button>
                  <button class="btn btn--ghost btn--sm btn-delete-crit" data-id="${q.id}" title="Delete Criterion" style="padding:5px 7px;color:var(--color-error);">
                    ${icon('x', 14)}
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `).join('');

    // Attach criteria edit/delete listeners
    canvas.querySelectorAll('.btn-edit-crit').forEach(btn => {
      btn.addEventListener('click', () => {
        const qId = parseInt(btn.getAttribute('data-id'));
        const q = questions.find(item => item.id === qId);
        if (q) openEditQuestionModal(q);
      });
    });

    canvas.querySelectorAll('.btn-delete-crit').forEach(btn => {
      btn.addEventListener('click', async () => {
        const qId = btn.getAttribute('data-id');
        if (!confirm('Are you sure you want to remove this criterion from this evaluation rubric?')) return;
        try {
          const res = await apiDelete(`/supervisor/evaluations/template/question/${qId}`);
          if (res?.success) {
            showToast('Criterion deleted successfully.', 'success');
            apiCache.invalidate(['/supervisor/evaluations*']);
            loadTemplatesData(currentTemplateId);
          }
        } catch (e) {
          showToast(e.message || 'Failed to delete criterion.', 'error');
        }
      });
    });
  }

  // Builder toolbar listeners
  const formSelectEl = container.querySelector('#builder-form-select');
  formSelectEl.addEventListener('change', (e) => {
    const newId = parseInt(e.target.value);
    if (newId) {
      currentTemplateId = newId;
      loadTemplateDetail(newId);
    }
  });

  container.querySelector('#btn-create-form').addEventListener('click', () => openNewTemplateModal());
  container.querySelector('#btn-edit-form-meta').addEventListener('click', () => openEditTemplateInfoModal());
  container.querySelector('#btn-delete-form').addEventListener('click', () => openDeleteTemplateModal());
  container.querySelector('#btn-preview-form-studio').addEventListener('click', () => openPreviewModal(currentTemplate));
  container.querySelector('#btn-add-criterion').addEventListener('click', () => openAddQuestionModal());

  // =========================================================================
  // INITIAL BOOTSTRAP
  // =========================================================================
  loadTraineesData();
  loadTemplatesData();

  // =========================================================================
  // BULLETPROOF MODAL PORTAL WRAPPER
  // =========================================================================

  function showModal(htmlContent, { backdropId = 'eval-active-backdrop', onClose } = {}) {
    document.querySelectorAll('.eval-modal-backdrop-portal').forEach(el => el.remove());

    const bd = document.createElement('div');
    bd.className = 'eval-modal-backdrop-portal';
    bd.id = backdropId;
    bd.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(15, 23, 42, 0.65);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      box-sizing: border-box;
      animation: fadeIn 0.15s ease-out;
    `;
    bd.innerHTML = htmlContent;
    document.body.appendChild(bd);

    const close = () => {
      bd.remove();
      document.removeEventListener('keydown', onEsc);
      if (onClose) onClose();
    };

    const onEsc = (e) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onEsc);

    bd.querySelectorAll('.modal__close, [data-dismiss="modal"]').forEach(btn => {
      btn.addEventListener('click', close);
    });

    bd.addEventListener('click', e => {
      if (e.target === bd) close();
    });

    return { bd, close };
  }

  // =========================================================================
  // MODALS & DIALOGS
  // =========================================================================

  // Single Evaluation Dispatch Modal
  function openSendConfirmModal(studentId, name, company) {
    if (!templatesList.length) {
      showToast('No evaluation forms available. Please create one first.', 'warning');
      return;
    }

    const defaultTplId = currentTemplateId || templatesList[0].id;

    const html = `
      <div class="modal" style="width:95vw;max-width:540px;max-height:88vh;display:flex;flex-direction:column;border-radius:14px;overflow:hidden;background:#ffffff;box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);">
        <div class="modal__header" style="border-bottom:1px solid var(--border-default);background:#FAFBFD;padding:18px 24px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:36px;height:36px;border-radius:8px;background:rgba(0,89,48,0.08);color:var(--color-primary);display:flex;align-items:center;justify-content:center;">
              ${icon('send', 18)}
            </div>
            <div>
              <h3 class="modal__title" style="margin:0;font-size:1.05rem;font-weight:700;">Dispatch Trainee Appraisal</h3>
              <p class="text-xs text-secondary" style="margin:2px 0 0;">Host Company Performance Evaluation</p>
            </div>
          </div>
          <button class="modal__close" data-dismiss="modal" title="Close">${icon('x', 18)}</button>
        </div>
        <div class="modal__body" style="padding:22px 24px;flex:1;min-height:0;overflow-y:auto;">
          <!-- Trainee Summary Chip -->
          <div style="background:#FAFBFD;border:1px solid var(--border-default);border-radius:8px;padding:12px 16px;margin-bottom:18px;display:flex;align-items:center;justify-content:space-between;">
            <div>
              <div style="font-weight:700;color:var(--text-primary);font-size:0.92rem;">${name}</div>
              <div style="font-size:0.75rem;color:var(--text-secondary);display:flex;align-items:center;gap:4px;margin-top:2px;">
                ${icon('building', 12)} ${company}
              </div>
            </div>
            <span class="badge badge--success" style="font-size:0.7rem;padding:3px 8px;">Active Deployment</span>
          </div>

          <!-- Form Selector -->
          <div class="form-group" style="margin-bottom:14px;">
            <label class="form-label" style="font-weight:700;font-size:0.85rem;margin-bottom:6px;display:flex;align-items:center;justify-content:space-between;">
              <span>Select Evaluation Form:</span>
              <button type="button" class="btn btn--ghost btn--sm" id="btn-preview-send-form" style="font-size:0.75rem;padding:2px 8px;gap:4px;color:var(--color-primary);">
                ${icon('eye', 13)} Preview Form
              </button>
            </label>
            <select class="form-select" id="send-eval-template-select" style="width:100%;padding:9px 12px;border:1px solid var(--border-default);border-radius:8px;font-weight:600;font-size:0.86rem;">
              ${templatesList.map(tpl => {
                const qCount = tpl.questions_count ?? (tpl.questions?.length || 0);
                const isSel = tpl.id === defaultTplId;
                return `<option value="${tpl.id}" ${isSel ? 'selected' : ''}>${tpl.title} (${qCount} Questions)</option>`;
              }).join('')}
            </select>
          </div>

          <div id="send-tpl-preview-box" style="background:#F0F7F4;border-radius:8px;padding:14px;border:1px solid rgba(0,89,48,0.2);margin-bottom:12px;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
              <strong id="send-tpl-preview-title" style="font-size:0.88rem;color:var(--color-primary);">...</strong>
              <span id="send-tpl-preview-badge" class="badge badge--info" style="font-size:0.7rem;"></span>
            </div>
            <p id="send-tpl-preview-desc" class="text-xs text-secondary" style="margin:0;line-height:1.45;">...</p>
          </div>
          
          <p class="text-xs text-tertiary" style="margin:0;line-height:1.4;">
            The employer representative will receive an instant portal notification directing them to evaluate the trainee against this question set.
          </p>
        </div>
        <div class="modal__footer" style="display:flex;justify-content:flex-end;gap:10px;padding:14px 24px;border-top:1px solid var(--border-default);background:#FAFBFD;flex-shrink:0;">
          <button class="btn btn--outline" data-dismiss="modal">Cancel</button>
          <button class="btn btn--primary" id="confirm-send-btn" style="gap:6px;">
            ${icon('send', 14)} Confirm & Dispatch
          </button>
        </div>
      </div>
    `;

    const { bd, close } = showModal(html, { backdropId: 'send-eval-modal-backdrop' });

    const sendTplSelect = bd.querySelector('#send-eval-template-select');
    function updateSendTplCard() {
      const chosenId = parseInt(sendTplSelect.value);
      const chosen = templatesList.find(t => t.id === chosenId);
      if (!chosen) return;
      bd.querySelector('#send-tpl-preview-title').textContent = chosen.title;
      bd.querySelector('#send-tpl-preview-desc').textContent = chosen.description || 'Standard institutional performance appraisal form.';
      bd.querySelector('#send-tpl-preview-badge').textContent = `${chosen.questions_count ?? (chosen.questions?.length || 0)} Questions`;
    }

    sendTplSelect.addEventListener('change', updateSendTplCard);
    updateSendTplCard();

    bd.querySelector('#btn-preview-send-form').addEventListener('click', async () => {
      const chosenId = parseInt(sendTplSelect.value);
      try {
        const res = await apiGet(`/supervisor/evaluations/templates/${chosenId}`);
        if (res?.success && res.data) {
          openPreviewModal(res.data);
        }
      } catch (e) {
        showToast('Could not load preview.', 'error');
      }
    });

    bd.querySelector('#confirm-send-btn').addEventListener('click', async () => {
      const chosenTemplateId = parseInt(sendTplSelect.value);
      const btn = bd.querySelector('#confirm-send-btn');
      btn.disabled = true;
      btn.innerHTML = `${icon('loader', 14)} Dispatching...`;
      try {
        const res = await apiPost(`/supervisor/evaluations/send/${studentId}`, {
          template_id: chosenTemplateId
        });
        if (res?.success) {
          close();
          showToast(res.message || 'Evaluation request sent successfully!', 'success');
          apiCache.invalidate(['/supervisor/evaluations*']);
          loadTraineesData();
        } else {
          showToast(res?.message || 'Failed to send evaluation.', 'error');
          btn.disabled = false;
          btn.innerHTML = `${icon('send', 14)} Confirm & Dispatch`;
        }
      } catch (err) {
        showToast(err.message || 'Error occurred.', 'error');
        btn.disabled = false;
        btn.innerHTML = `${icon('send', 14)} Confirm & Dispatch`;
      }
    });
  }

  // Batch Evaluation Dispatch Modal
  function openBatchSendModal(selectedIds) {
    if (!selectedIds.length) {
      showToast('No trainees selected.', 'warning');
      return;
    }
    if (!templatesList.length) {
      showToast('No evaluation forms available. Please create one first.', 'warning');
      return;
    }

    const selectedTrainees = traineesList.filter(t => selectedIds.includes(String(t.id)));
    const defaultTplId = currentTemplateId || templatesList[0].id;

    const html = `
      <div class="modal" style="width:95vw;max-width:580px;max-height:88vh;display:flex;flex-direction:column;border-radius:14px;overflow:hidden;background:#ffffff;box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);">
        <div class="modal__header" style="border-bottom:1px solid var(--border-default);background:#FAFBFD;padding:18px 24px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:36px;height:36px;border-radius:8px;background:rgba(0,89,48,0.08);color:var(--color-primary);display:flex;align-items:center;justify-content:center;">
              ${icon('send', 18)}
            </div>
            <div>
              <h3 class="modal__title" style="margin:0;font-size:1.05rem;font-weight:700;">Batch Dispatch Appraisals</h3>
              <p class="text-xs text-secondary" style="margin:2px 0 0;">Dispatching to ${selectedIds.length} host companies</p>
            </div>
          </div>
          <button class="modal__close" data-dismiss="modal" title="Close">${icon('x', 18)}</button>
        </div>
        <div class="modal__body" style="padding:22px 24px;flex:1;min-height:0;overflow-y:auto;">
          <label class="form-label" style="font-weight:700;font-size:0.82rem;margin-bottom:6px;display:block;text-transform:uppercase;letter-spacing:0.04em;color:var(--text-secondary);">
            Selected Trainees (${selectedIds.length})
          </label>
          <div style="background:#FAFBFD;border:1px solid var(--border-default);border-radius:8px;padding:8px;max-height:130px;overflow-y:auto;display:flex;flex-direction:column;gap:6px;margin-bottom:16px;">
            ${selectedTrainees.map(t => `
              <div style="display:flex;align-items:center;justify-content:space-between;font-size:0.8rem;padding:5px 8px;background:#ffffff;border:1px solid var(--border-default);border-radius:6px;">
                <span style="font-weight:600;color:var(--text-primary);">${t.name}</span>
                <span style="color:var(--color-primary);font-size:0.75rem;font-weight:500;">${t.company}</span>
              </div>
            `).join('')}
          </div>

          <div class="form-group" style="margin-bottom:14px;">
            <label class="form-label" style="font-weight:700;font-size:0.85rem;margin-bottom:6px;display:flex;align-items:center;justify-content:space-between;">
              <span>Choose Evaluation Form for Batch:</span>
              <button type="button" class="btn btn--ghost btn--sm" id="btn-preview-batch-form" style="font-size:0.75rem;padding:2px 8px;gap:4px;color:var(--color-primary);">
                ${icon('eye', 13)} Preview Form
              </button>
            </label>
            <select class="form-select" id="batch-eval-template-select" style="width:100%;padding:9px 12px;border:1px solid var(--border-default);border-radius:8px;font-weight:600;font-size:0.86rem;">
              ${templatesList.map(tpl => {
                const qCount = tpl.questions_count ?? (tpl.questions?.length || 0);
                const isSel = tpl.id === defaultTplId;
                return `<option value="${tpl.id}" ${isSel ? 'selected' : ''}>${tpl.title} (${qCount} Questions)</option>`;
              }).join('')}
            </select>
          </div>

          <div id="batch-tpl-preview-box" style="background:#F0F7F4;border-radius:8px;padding:14px;border:1px solid rgba(0,89,48,0.2);margin-bottom:12px;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
              <strong id="batch-tpl-preview-title" style="font-size:0.88rem;color:var(--color-primary);">...</strong>
              <span id="batch-tpl-preview-badge" class="badge badge--info" style="font-size:0.7rem;"></span>
            </div>
            <p id="batch-tpl-preview-desc" class="text-xs text-secondary" style="margin:0;line-height:1.45;">...</p>
          </div>
          
          <p class="text-xs text-tertiary" style="margin:0;line-height:1.4;">
            All ${selectedIds.length} host companies will receive evaluation requests standardized on this selected form.
          </p>
        </div>
        <div class="modal__footer" style="display:flex;justify-content:flex-end;gap:10px;padding:14px 24px;border-top:1px solid var(--border-default);background:#FAFBFD;flex-shrink:0;">
          <button class="btn btn--outline" data-dismiss="modal">Cancel</button>
          <button class="btn btn--primary" id="confirm-batch-btn" style="gap:6px;">
            ${icon('send', 14)} Dispatch to All (${selectedIds.length})
          </button>
        </div>
      </div>
    `;

    const { bd, close } = showModal(html, { backdropId: 'batch-eval-modal-backdrop' });

    const batchTplSelect = bd.querySelector('#batch-eval-template-select');
    function updateBatchTplCard() {
      const chosenId = parseInt(batchTplSelect.value);
      const chosen = templatesList.find(t => t.id === chosenId);
      if (!chosen) return;
      bd.querySelector('#batch-tpl-preview-title').textContent = chosen.title;
      bd.querySelector('#batch-tpl-preview-desc').textContent = chosen.description || 'Standard institutional performance appraisal form.';
      bd.querySelector('#batch-tpl-preview-badge').textContent = `${chosen.questions_count ?? (chosen.questions?.length || 0)} Questions`;
    }

    batchTplSelect.addEventListener('change', updateBatchTplCard);
    updateBatchTplCard();

    bd.querySelector('#btn-preview-batch-form').addEventListener('click', async () => {
      const chosenId = parseInt(batchTplSelect.value);
      try {
        const res = await apiGet(`/supervisor/evaluations/templates/${chosenId}`);
        if (res?.success && res.data) {
          openPreviewModal(res.data);
        }
      } catch (e) {
        showToast('Could not load preview.', 'error');
      }
    });

    bd.querySelector('#confirm-batch-btn').addEventListener('click', async () => {
      const chosenTemplateId = parseInt(batchTplSelect.value);
      const btn = bd.querySelector('#confirm-batch-btn');
      btn.disabled = true;
      btn.innerHTML = `${icon('loader', 14)} Dispatching Batch...`;
      try {
        const res = await apiPost('/supervisor/evaluations/send-batch', {
          student_ids: selectedIds,
          template_id: chosenTemplateId
        });
        if (res?.success) {
          close();
          selectedStudentIds.clear();
          updateBatchBar();
          showToast(res.message || 'Evaluations dispatched successfully!', 'success');
          apiCache.invalidate(['/supervisor/evaluations*']);
          loadTraineesData();
        } else {
          showToast(res?.message || 'Failed to dispatch evaluations.', 'error');
          btn.disabled = false;
          btn.innerHTML = `${icon('send', 14)} Dispatch to All (${selectedIds.length})`;
        }
      } catch (err) {
        showToast(err.message || 'Error occurred.', 'error');
        btn.disabled = false;
        btn.innerHTML = `${icon('send', 14)} Dispatch to All (${selectedIds.length})`;
      }
    });
  }

  // Create New Form Modal
  function openNewTemplateModal() {
    const html = `
      <div class="modal" style="width:95vw;max-width:540px;max-height:88vh;display:flex;flex-direction:column;border-radius:14px;overflow:hidden;background:#ffffff;box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);">
        <div class="modal__header" style="border-bottom:1px solid var(--border-default);background:#FAFBFD;padding:18px 24px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">
          <div style="display:flex;align-items:center;gap:10px;">
            <div style="width:36px;height:36px;border-radius:8px;background:rgba(0,89,48,0.08);color:var(--color-primary);display:flex;align-items:center;justify-content:center;">
              ${icon('plus', 18)}
            </div>
            <h3 class="modal__title" style="margin:0;font-size:1.05rem;font-weight:700;">Create Evaluation Rubric</h3>
          </div>
          <button class="modal__close" data-dismiss="modal" title="Close">${icon('x', 18)}</button>
        </div>
        <div class="modal__body" style="padding:22px 24px;flex:1;min-height:0;overflow-y:auto;">
          <div class="form-group" style="margin-bottom:16px;">
            <label class="form-label" style="font-weight:700;font-size:0.85rem;margin-bottom:6px;display:block;">Form Title</label>
            <input type="text" class="form-input" id="new-tpl-title" placeholder="e.g. BSIT Software Engineering Practicum Appraisal" style="width:100%;padding:9px 12px;border:1px solid var(--border-default);border-radius:8px;" />
          </div>

          <div class="form-group" style="margin-bottom:16px;">
            <label class="form-label" style="font-weight:700;font-size:0.85rem;margin-bottom:6px;display:block;">Instructions for Host Company</label>
            <textarea class="form-textarea" id="new-tpl-desc" rows="3" placeholder="Provide guidelines or criteria focus for the company supervisor..." style="width:100%;padding:9px 12px;border:1px solid var(--border-default);border-radius:8px;resize:vertical;"></textarea>
          </div>

          <div class="form-group" style="margin-bottom:10px;">
            <label class="form-label" style="font-weight:700;font-size:0.85rem;margin-bottom:6px;display:block;">Question Setup</label>
            <select class="form-select" id="new-tpl-clone-select" style="width:100%;padding:9px 12px;border:1px solid var(--border-default);border-radius:8px;font-size:0.85rem;">
              <option value="">Start empty (0 questions)</option>
              ${templatesList.map(t => `<option value="${t.id}">Clone questions from: ${t.title} (${t.questions_count ?? 0} questions)</option>`).join('')}
            </select>
            <span class="text-xs text-secondary" style="margin-top:4px;display:block;">Cloning allows you to quickly adjust existing institutional criteria.</span>
          </div>
        </div>
        <div class="modal__footer" style="display:flex;justify-content:flex-end;gap:10px;padding:14px 24px;border-top:1px solid var(--border-default);background:#FAFBFD;flex-shrink:0;">
          <button class="btn btn--outline" data-dismiss="modal">Cancel</button>
          <button class="btn btn--primary" id="save-new-tpl-btn" style="gap:6px;">
            ${icon('checkCircle', 15)} Create Form
          </button>
        </div>
      </div>
    `;

    const { bd, close } = showModal(html, { backdropId: 'new-template-backdrop' });

    bd.querySelector('#save-new-tpl-btn').addEventListener('click', async () => {
      const title = bd.querySelector('#new-tpl-title').value.trim();
      const description = bd.querySelector('#new-tpl-desc').value.trim();
      const clone_template_id = bd.querySelector('#new-tpl-clone-select').value || null;

      if (!title) {
        showToast('Please enter a title for the evaluation form.', 'warning');
        return;
      }

      const btn = bd.querySelector('#save-new-tpl-btn');
      btn.disabled = true;
      btn.innerHTML = `${icon('loader', 14)} Creating...`;

      try {
        const res = await apiPost('/supervisor/evaluations/templates', {
          title,
          description,
          clone_template_id: clone_template_id ? parseInt(clone_template_id) : null
        });

        if (res?.success && res.data) {
          close();
          showToast('Evaluation form created successfully!', 'success');
          apiCache.invalidate(['/supervisor/evaluations*']);
          await loadTemplatesData(res.data.id);
        } else {
          showToast(res?.message || 'Failed to create form.', 'error');
          btn.disabled = false;
          btn.innerHTML = `${icon('checkCircle', 15)} Create Form`;
        }
      } catch (err) {
        showToast(err.message || 'Error occurred.', 'error');
        btn.disabled = false;
        btn.innerHTML = `${icon('checkCircle', 15)} Create Form`;
      }
    });
  }

  // Edit Template Info Modal
  function openEditTemplateInfoModal() {
    if (!currentTemplate) return;

    const html = `
      <div class="modal" style="width:95vw;max-width:540px;max-height:88vh;display:flex;flex-direction:column;border-radius:14px;overflow:hidden;background:#ffffff;box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);">
        <div class="modal__header" style="border-bottom:1px solid var(--border-default);background:#FAFBFD;padding:18px 24px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">
          <h3 class="modal__title" style="margin:0;font-size:1.05rem;font-weight:700;">Edit Form Metadata</h3>
          <button class="modal__close" data-dismiss="modal" title="Close">${icon('x', 18)}</button>
        </div>
        <div class="modal__body" style="padding:22px 24px;flex:1;min-height:0;overflow-y:auto;">
          <div class="form-group" style="margin-bottom:16px;">
            <label class="form-label" style="font-weight:700;font-size:0.85rem;margin-bottom:6px;display:block;">Form Title</label>
            <input type="text" class="form-input" id="edit-tpl-title" value="${currentTemplate.title || ''}" style="width:100%;padding:9px 12px;border:1px solid var(--border-default);border-radius:8px;" />
          </div>

          <div class="form-group" style="margin-bottom:14px;">
            <label class="form-label" style="font-weight:700;font-size:0.85rem;margin-bottom:6px;display:block;">Instructions for Host Company</label>
            <textarea class="form-textarea" id="edit-tpl-desc" rows="4" style="width:100%;padding:9px 12px;border:1px solid var(--border-default);border-radius:8px;resize:vertical;">${currentTemplate.description || ''}</textarea>
          </div>
        </div>
        <div class="modal__footer" style="display:flex;justify-content:flex-end;gap:10px;padding:14px 24px;border-top:1px solid var(--border-default);background:#FAFBFD;flex-shrink:0;">
          <button class="btn btn--outline" data-dismiss="modal">Cancel</button>
          <button class="btn btn--primary" id="save-edit-tpl-btn" style="gap:6px;">
            ${icon('checkCircle', 15)} Save Changes
          </button>
        </div>
      </div>
    `;

    const { bd, close } = showModal(html, { backdropId: 'edit-tpl-backdrop' });

    bd.querySelector('#save-edit-tpl-btn').addEventListener('click', async () => {
      const title = bd.querySelector('#edit-tpl-title').value.trim();
      const description = bd.querySelector('#edit-tpl-desc').value.trim();

      if (!title) {
        showToast('Please enter a title for the evaluation form.', 'warning');
        return;
      }

      const btn = bd.querySelector('#save-edit-tpl-btn');
      btn.disabled = true;
      btn.innerHTML = `${icon('loader', 14)} Saving...`;

      try {
        const res = await apiPut(`/supervisor/evaluations/templates/${currentTemplateId}`, {
          title,
          description
        });

        if (res?.success) {
          close();
          showToast('Form updated successfully!', 'success');
          apiCache.invalidate(['/supervisor/evaluations*']);
          await loadTemplatesData(currentTemplateId);
        } else {
          showToast(res?.message || 'Failed to update form.', 'error');
          btn.disabled = false;
          btn.innerHTML = `${icon('checkCircle', 15)} Save Changes`;
        }
      } catch (err) {
        showToast(err.message || 'Error occurred.', 'error');
        btn.disabled = false;
        btn.innerHTML = `${icon('checkCircle', 15)} Save Changes`;
      }
    });
  }

  // Delete Template Action
  function openDeleteTemplateModal() {
    if (!currentTemplate) return;

    if (templatesList.length <= 1) {
      showToast('You must keep at least one active evaluation form.', 'warning');
      return;
    }

    if (!confirm(`Are you sure you want to delete or archive the form "${currentTemplate.title}"?`)) {
      return;
    }

    deleteCurrentTemplate();
  }

  async function deleteCurrentTemplate() {
    try {
      const res = await apiDelete(`/supervisor/evaluations/templates/${currentTemplateId}`);
      if (res?.success) {
        showToast(res.message || 'Form deleted successfully.', 'success');
        apiCache.invalidate(['/supervisor/evaluations*']);
        currentTemplateId = null;
        await loadTemplatesData();
      } else {
        showToast(res?.message || 'Failed to delete form.', 'error');
      }
    } catch (err) {
      showToast(err.message || 'Error occurred while deleting form.', 'error');
    }
  }

  function getAvailableCategories(template = currentTemplate) {
    const defaults = [
      'Technical Competence',
      'Professionalism & Work Ethic',
      'Communication & Teamwork',
      'Quality & Accuracy of Work',
      'Overall Recommendation',
      'Company Feedback & Remarks'
    ];

    const inTemplate = (template?.questions || [])
      .map(q => q.category?.trim())
      .filter(Boolean);

    const list = [];
    [...inTemplate, ...defaults].forEach(c => {
      if (!list.includes(c)) list.push(c);
    });
    return list;
  }

  // Add Question Modal
  function openAddQuestionModal() {
    const categories = getAvailableCategories(currentTemplate);
    const defaultCategory = categories[0] || 'Technical Competence';

    const html = `
      <div class="modal" style="width:95vw;max-width:560px;max-height:88vh;display:flex;flex-direction:column;border-radius:14px;overflow:hidden;background:#ffffff;box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);">
        <div class="modal__header" style="border-bottom:1px solid var(--border-default);background:#FAFBFD;padding:18px 24px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">
          <div>
            <span class="badge badge--info" style="font-size:0.68rem;margin-bottom:4px;padding:2px 8px;">Adding to: ${currentTemplate?.title || 'Active Form'}</span>
            <h3 class="modal__title" style="margin:0;font-size:1.05rem;font-weight:700;">Add Evaluation Criterion</h3>
          </div>
          <button class="modal__close" data-dismiss="modal" title="Close">${icon('x', 18)}</button>
        </div>
        <div class="modal__body" style="padding:22px 24px;flex:1;min-height:0;overflow-y:auto;">
          <div class="form-group" style="margin-bottom:16px;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
              <label class="form-label" style="font-weight:700;font-size:0.85rem;margin:0;">Category / Competency Group</label>
              <button type="button" id="btn-toggle-custom-cat" class="btn btn--ghost btn--sm" style="font-size:0.75rem;padding:2px 8px;color:var(--color-primary);gap:4px;">
                ${icon('plus', 12)} New Custom Category
              </button>
            </div>

            <select class="form-select" id="q-category-select" style="width:100%;padding:9px 12px;border:1px solid var(--border-default);border-radius:8px;font-size:0.86rem;font-weight:600;background:#ffffff;cursor:pointer;">
              <optgroup label="Preset & Form Categories">
                ${categories.map(c => `<option value="${c}" ${c === defaultCategory ? 'selected' : ''}>${c}</option>`).join('')}
              </optgroup>
              <optgroup label="Custom Category">
                <option value="__custom__">✨ + Create New Custom Category...</option>
              </optgroup>
            </select>

            <div id="q-custom-cat-wrap" style="display:none;margin-top:8px;">
              <div style="display:flex;gap:6px;align-items:center;">
                <input type="text" class="form-input" id="q-custom-cat-input" placeholder="Type new custom category name (e.g. Leadership & Initiative)..." style="flex:1;padding:8px 12px;border:1px solid var(--color-primary);border-radius:8px;font-size:0.85rem;background:#F0F7F4;" />
                <button type="button" class="btn btn--outline btn--sm" id="btn-cancel-custom-cat" style="padding:8px 10px;font-size:0.75rem;">Cancel</button>
              </div>
            </div>
          </div>

          <div class="form-group" style="margin-bottom:16px;">
            <label class="form-label" style="font-weight:700;font-size:0.85rem;margin-bottom:6px;display:block;">Question Statement / Criteria</label>
            <textarea class="form-textarea" id="q-text" rows="3" placeholder="Enter the competency statement to be evaluated..." style="width:100%;padding:9px 12px;border:1px solid var(--border-default);border-radius:8px;resize:vertical;"></textarea>
          </div>

          <div class="form-group" style="margin-bottom:16px;">
            <label class="form-label" style="font-weight:700;font-size:0.85rem;margin-bottom:6px;display:block;">Response Type</label>
            <select class="form-select" id="q-type" style="width:100%;padding:9px 12px;border:1px solid var(--border-default);border-radius:8px;">
              <option value="rating">★ 1 to 5 Rating Scale</option>
              <option value="multiple_choice">🔘 Multiple Choice (Select One)</option>
              <option value="text">📝 Open-ended Text Feedback</option>
            </select>
          </div>

          <div id="q-mcq-options-wrap" style="display:none;background:#FAFBFD;padding:14px;border:1px solid var(--border-default);border-radius:8px;margin-bottom:16px;">
            <label class="form-label" style="font-weight:700;font-size:0.82rem;margin-bottom:6px;display:block;">Options (one per line):</label>
            <textarea class="form-textarea" id="q-mcq-options" rows="4" placeholder="Exceeds Expectations&#10;Meets Expectations&#10;Needs Improvement" style="width:100%;padding:8px 10px;border:1px solid var(--border-default);border-radius:6px;"></textarea>
          </div>

          <div style="display:flex;align-items:center;gap:8px;margin-top:10px;">
            <input type="checkbox" id="q-required" checked style="width:16px;height:16px;" />
            <label for="q-required" style="font-size:0.85rem;font-weight:600;cursor:pointer;">Mandatory question for submission</label>
          </div>
        </div>
        <div class="modal__footer" style="display:flex;justify-content:flex-end;gap:10px;padding:14px 24px;border-top:1px solid var(--border-default);background:#FAFBFD;flex-shrink:0;">
          <button class="btn btn--outline" data-dismiss="modal">Cancel</button>
          <button class="btn btn--primary" id="save-q-btn" style="gap:6px;">
            ${icon('checkCircle', 15)} Save Criterion
          </button>
        </div>
      </div>
    `;

    const { bd, close } = showModal(html, { backdropId: 'q-modal-backdrop' });

    const categorySelect = bd.querySelector('#q-category-select');
    const customCatWrap  = bd.querySelector('#q-custom-cat-wrap');
    const customCatInput = bd.querySelector('#q-custom-cat-input');
    const toggleCustomBtn = bd.querySelector('#btn-toggle-custom-cat');
    const cancelCustomBtn = bd.querySelector('#btn-cancel-custom-cat');

    function showCustomCategory() {
      categorySelect.value = '__custom__';
      customCatWrap.style.display = 'block';
      customCatInput.focus();
    }

    function hideCustomCategory() {
      customCatWrap.style.display = 'none';
      if (categorySelect.value === '__custom__') {
        categorySelect.value = defaultCategory;
      }
    }

    categorySelect.addEventListener('change', () => {
      if (categorySelect.value === '__custom__') {
        showCustomCategory();
      } else {
        customCatWrap.style.display = 'none';
      }
    });

    toggleCustomBtn.addEventListener('click', showCustomCategory);
    cancelCustomBtn.addEventListener('click', hideCustomCategory);

    const typeSelect = bd.querySelector('#q-type');
    const mcqWrap = bd.querySelector('#q-mcq-options-wrap');

    typeSelect.addEventListener('change', () => {
      mcqWrap.style.display = typeSelect.value === 'multiple_choice' ? 'block' : 'none';
    });

    bd.querySelector('#save-q-btn').addEventListener('click', async () => {
      let category = '';
      if (categorySelect.value === '__custom__') {
        category = customCatInput.value.trim();
        if (!category) {
          showToast('Please enter a name for your custom category.', 'warning');
          customCatInput.focus();
          return;
        }
      } else {
        category = categorySelect.value.trim();
      }

      const question_text = bd.querySelector('#q-text').value.trim();
      const question_type = typeSelect.value;
      const is_required = bd.querySelector('#q-required').checked;

      if (!category || !question_text) {
        showToast('Please fill in both the category and question statement.', 'warning');
        return;
      }

      let options = null;
      if (question_type === 'multiple_choice') {
        const rawOpts = bd.querySelector('#q-mcq-options').value;
        options = rawOpts.split('\n').map(o => o.trim()).filter(Boolean);
        if (options.length < 2) {
          showToast('Please provide at least 2 choices.', 'warning');
          return;
        }
      }

      const saveBtn = bd.querySelector('#save-q-btn');
      saveBtn.disabled = true;
      saveBtn.innerHTML = `${icon('loader', 14)} Saving...`;

      try {
        const res = await apiPost('/supervisor/evaluations/template/question', {
          template_id: currentTemplateId,
          category,
          question_text,
          question_type,
          options,
          scale_min: 1,
          scale_max: 5,
          is_required,
        });

        if (res?.success) {
          close();
          showToast('Criterion added successfully!', 'success');
          apiCache.invalidate(['/supervisor/evaluations*']);
          loadTemplatesData(currentTemplateId);
        } else {
          showToast(res?.message || 'Failed to save question.', 'error');
          saveBtn.disabled = false;
          saveBtn.innerHTML = `${icon('checkCircle', 15)} Save Criterion`;
        }
      } catch (err) {
        showToast(err.message || 'Error occurred.', 'error');
        saveBtn.disabled = false;
        saveBtn.innerHTML = `${icon('checkCircle', 15)} Save Criterion`;
      }
    });
  }

  // Edit Question Modal
  function openEditQuestionModal(q) {
    const isMcq = q.question_type === 'multiple_choice';
    const mcqOptsText = Array.isArray(q.options) ? q.options.join('\n') : '';
    const categories = getAvailableCategories(currentTemplate);
    if (q.category && !categories.includes(q.category)) {
      categories.unshift(q.category);
    }
    const currentCategory = q.category || categories[0] || 'Technical Competence';

    const html = `
      <div class="modal" style="width:95vw;max-width:560px;max-height:88vh;display:flex;flex-direction:column;border-radius:14px;overflow:hidden;background:#ffffff;box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);">
        <div class="modal__header" style="border-bottom:1px solid var(--border-default);background:#FAFBFD;padding:18px 24px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">
          <h3 class="modal__title" style="margin:0;font-size:1.05rem;font-weight:700;">Edit Evaluation Criterion</h3>
          <button class="modal__close" data-dismiss="modal" title="Close">${icon('x', 18)}</button>
        </div>
        <div class="modal__body" style="padding:22px 24px;flex:1;min-height:0;overflow-y:auto;">
          <div class="form-group" style="margin-bottom:16px;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
              <label class="form-label" style="font-weight:700;font-size:0.85rem;margin:0;">Category / Competency Group</label>
              <button type="button" id="btn-edit-toggle-custom-cat" class="btn btn--ghost btn--sm" style="font-size:0.75rem;padding:2px 8px;color:var(--color-primary);gap:4px;">
                ${icon('plus', 12)} New Custom Category
              </button>
            </div>

            <select class="form-select" id="edit-q-category-select" style="width:100%;padding:9px 12px;border:1px solid var(--border-default);border-radius:8px;font-size:0.86rem;font-weight:600;background:#ffffff;cursor:pointer;">
              <optgroup label="Preset & Form Categories">
                ${categories.map(c => `<option value="${c}" ${c === currentCategory ? 'selected' : ''}>${c}</option>`).join('')}
              </optgroup>
              <optgroup label="Custom Category">
                <option value="__custom__">✨ + Create New Custom Category...</option>
              </optgroup>
            </select>

            <div id="edit-q-custom-cat-wrap" style="display:none;margin-top:8px;">
              <div style="display:flex;gap:6px;align-items:center;">
                <input type="text" class="form-input" id="edit-q-custom-cat-input" placeholder="Enter custom category name..." style="flex:1;padding:8px 12px;border:1px solid var(--color-primary);border-radius:8px;font-size:0.85rem;background:#F0F7F4;" />
                <button type="button" class="btn btn--outline btn--sm" id="btn-edit-cancel-custom-cat" style="padding:8px 10px;font-size:0.75rem;">Cancel</button>
              </div>
            </div>
          </div>

          <div class="form-group" style="margin-bottom:16px;">
            <label class="form-label" style="font-weight:700;font-size:0.85rem;margin-bottom:6px;display:block;">Question Statement / Criteria</label>
            <textarea class="form-textarea" id="edit-q-text" rows="3" style="width:100%;padding:9px 12px;border:1px solid var(--border-default);border-radius:8px;resize:vertical;">${q.question_text}</textarea>
          </div>

          <div class="form-group" style="margin-bottom:16px;">
            <label class="form-label" style="font-weight:700;font-size:0.85rem;margin-bottom:6px;display:block;">Response Type</label>
            <select class="form-select" id="edit-q-type" style="width:100%;padding:9px 12px;border:1px solid var(--border-default);border-radius:8px;">
              <option value="rating" ${q.question_type === 'rating' ? 'selected' : ''}>★ 1 to 5 Star Rating Scale</option>
              <option value="multiple_choice" ${isMcq ? 'selected' : ''}>🔘 Multiple Choice (Select One)</option>
              <option value="text" ${q.question_type === 'text' ? 'selected' : ''}>📝 Open-ended Text Feedback</option>
            </select>
          </div>

          <div id="edit-q-mcq-wrap" style="display:${isMcq ? 'block' : 'none'};background:#FAFBFD;padding:14px;border:1px solid var(--border-default);border-radius:8px;margin-bottom:16px;">
            <label class="form-label" style="font-weight:700;font-size:0.82rem;margin-bottom:6px;display:block;">Options (one per line):</label>
            <textarea class="form-textarea" id="edit-q-mcq-options" rows="4" style="width:100%;padding:8px 10px;border:1px solid var(--border-default);border-radius:6px;">${mcqOptsText}</textarea>
          </div>

          <div style="display:flex;align-items:center;gap:8px;margin-top:10px;">
            <input type="checkbox" id="edit-q-required" ${q.is_required ? 'checked' : ''} style="width:16px;height:16px;" />
            <label for="edit-q-required" style="font-size:0.85rem;font-weight:600;cursor:pointer;">Mandatory question for submission</label>
          </div>
        </div>
        <div class="modal__footer" style="display:flex;justify-content:flex-end;gap:10px;padding:14px 24px;border-top:1px solid var(--border-default);background:#FAFBFD;flex-shrink:0;">
          <button class="btn btn--outline" data-dismiss="modal">Cancel</button>
          <button class="btn btn--primary" id="save-edit-q" style="gap:6px;">
            ${icon('checkCircle', 15)} Update Criterion
          </button>
        </div>
      </div>
    `;

    const { bd, close } = showModal(html, { backdropId: 'edit-q-backdrop' });

    const editCategorySelect = bd.querySelector('#edit-q-category-select');
    const editCustomCatWrap  = bd.querySelector('#edit-q-custom-cat-wrap');
    const editCustomCatInput = bd.querySelector('#edit-q-custom-cat-input');
    const editToggleCustomBtn = bd.querySelector('#btn-edit-toggle-custom-cat');
    const editCancelCustomBtn = bd.querySelector('#btn-edit-cancel-custom-cat');

    function showEditCustomCategory() {
      editCategorySelect.value = '__custom__';
      editCustomCatWrap.style.display = 'block';
      editCustomCatInput.focus();
    }

    function hideEditCustomCategory() {
      editCustomCatWrap.style.display = 'none';
      if (editCategorySelect.value === '__custom__') {
        editCategorySelect.value = currentCategory;
      }
    }

    editCategorySelect.addEventListener('change', () => {
      if (editCategorySelect.value === '__custom__') {
        showEditCustomCategory();
      } else {
        editCustomCatWrap.style.display = 'none';
      }
    });

    editToggleCustomBtn.addEventListener('click', showEditCustomCategory);
    editCancelCustomBtn.addEventListener('click', hideEditCustomCategory);

    const typeSelect = bd.querySelector('#edit-q-type');
    const mcqWrap = bd.querySelector('#edit-q-mcq-wrap');
    typeSelect.addEventListener('change', () => {
      mcqWrap.style.display = typeSelect.value === 'multiple_choice' ? 'block' : 'none';
    });

    bd.querySelector('#save-edit-q').addEventListener('click', async () => {
      let category = '';
      if (editCategorySelect.value === '__custom__') {
        category = editCustomCatInput.value.trim();
        if (!category) {
          showToast('Please enter a name for your custom category.', 'warning');
          editCustomCatInput.focus();
          return;
        }
      } else {
        category = editCategorySelect.value.trim();
      }

      const question_text = bd.querySelector('#edit-q-text').value.trim();
      const question_type = typeSelect.value;
      const is_required = bd.querySelector('#edit-q-required').checked;

      let options = null;
      if (question_type === 'multiple_choice') {
        options = bd.querySelector('#edit-q-mcq-options').value.split('\n').map(o => o.trim()).filter(Boolean);
      }

      try {
        const res = await apiPut(`/supervisor/evaluations/template/question/${q.id}`, {
          category,
          question_text,
          question_type,
          options,
          is_required,
        });

        if (res?.success) {
          close();
          showToast('Criterion updated successfully!', 'success');
          apiCache.invalidate(['/supervisor/evaluations*']);
          loadTemplatesData(currentTemplateId);
        }
      } catch (err) {
        showToast(err.message || 'Update failed.', 'error');
      }
    });
  }

  // Live Form Preview Modal
  function openPreviewModal(tpl = currentTemplate) {
    if (!tpl) return;
    const questions = tpl.questions || [];

    const html = `
      <div class="modal" style="width:95vw;max-width:760px;max-height:88vh;display:flex;flex-direction:column;border-radius:14px;overflow:hidden;background:#ffffff;box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);">
        <div class="modal__header" style="border-bottom:1px solid var(--border-default);background:#FAFBFD;padding:18px 24px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">
          <div>
            <span class="badge badge--info" style="font-size:0.7rem;margin-bottom:4px;padding:2px 8px;">Host Employer View Simulator</span>
            <h3 class="modal__title" style="margin:0;font-size:1.15rem;font-weight:700;color:var(--text-primary);">${tpl.title}</h3>
          </div>
          <button class="modal__close" data-dismiss="modal" title="Close Preview">${icon('x', 18)}</button>
        </div>
        <div class="modal__body" style="flex:1;min-height:0;overflow-y:auto;padding:24px;">
          <p class="text-sm text-secondary" style="margin:0 0 20px;line-height:1.5;">${tpl.description || 'Institutional OJT performance evaluation form.'}</p>
          ${!questions.length ? '<p class="text-tertiary text-center" style="padding:32px;">No criteria added to this form yet.</p>' : ''}
          ${questions.map((q, idx) => `
            <div style="background:#ffffff;border:1px solid var(--border-default);border-radius:8px;padding:16px;margin-bottom:12px;">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
                <span style="font-size:0.72rem;font-weight:700;color:var(--color-primary);text-transform:uppercase;letter-spacing:0.04em;">${q.category}</span>
                ${q.is_required ? '<span style="color:var(--color-error);font-size:0.75rem;">* Required</span>' : ''}
              </div>
              <div style="font-weight:600;font-size:0.92rem;color:var(--text-primary);margin-bottom:12px;line-height:1.4;">${idx + 1}. ${q.question_text}</div>

              ${q.question_type === 'rating' ? `
                <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
                  ${[1, 2, 3, 4, 5].map(n => `
                    <button type="button" style="border:1px solid var(--border-default);background:#FAFBFD;width:40px;height:40px;border-radius:8px;font-size:1.05rem;color:#D97706;cursor:default;">★</button>
                  `).join('')}
                  <span class="text-xs text-tertiary" style="margin-left:6px;">(1 = Poor, 5 = Excellent)</span>
                </div>
              ` : q.question_type === 'multiple_choice' ? `
                <div style="display:flex;flex-direction:column;gap:8px;">
                  ${(q.options || []).map(opt => `
                    <label style="display:flex;align-items:center;gap:8px;font-size:0.85rem;color:var(--text-secondary);cursor:default;">
                      <input type="radio" disabled name="prev_q_${q.id}" /> ${opt}
                    </label>
                  `).join('')}
                </div>
              ` : `
                <textarea disabled class="form-textarea" rows="2" placeholder="Employer supervisor will enter written feedback here..." style="width:100%;font-size:0.85rem;"></textarea>
              `}
            </div>
          `).join('')}
        </div>
        <div class="modal__footer" style="display:flex;justify-content:flex-end;padding:14px 24px;border-top:1px solid var(--border-default);background:#FAFBFD;flex-shrink:0;">
          <button class="btn btn--primary" data-dismiss="modal">Close Preview</button>
        </div>
      </div>
    `;

    showModal(html, { backdropId: 'preview-backdrop' });
  }

  // Official Evaluation Details Modal & Printable Certification
  async function openEvaluationDetailsModal(evalId) {
    const loadingHtml = `
      <div class="modal" style="width:95vw;max-width:740px;border-radius:14px;overflow:hidden;background:#ffffff;padding:40px;text-align:center;">
        <div class="skeleton" style="height:28px;width:240px;margin:0 auto 16px;"></div>
        <div class="skeleton skeleton--card" style="height:200px;"></div>
      </div>
    `;

    const { bd: loadingBd, close: closeLoading } = showModal(loadingHtml, { backdropId: 'detail-loading-backdrop' });

    try {
      const res = await apiGet(`/supervisor/evaluations/${evalId}/details`, { forceRefresh: true });
      closeLoading();

      if (!res?.success || !res.data) throw new Error('Could not load evaluation details.');

      const ev = res.data;
      const score = ev.overall_score ? Number(ev.overall_score).toFixed(2) : '5.00';

      const html = `
        <div class="modal" style="width:95vw;max-width:760px;max-height:88vh;display:flex;flex-direction:column;border-radius:14px;overflow:hidden;background:#ffffff;box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);">
          <div class="modal__header" style="border-bottom:1px solid var(--border-default);background:#FAFBFD;padding:18px 24px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">
            <div style="display:flex;align-items:center;gap:12px;">
              <div style="width:40px;height:40px;border-radius:8px;background:rgba(16,185,129,0.1);color:#065F46;display:flex;align-items:center;justify-content:center;font-size:1.2rem;font-weight:700;">
                ★
              </div>
              <div>
                <h3 class="modal__title" style="margin:0;font-size:1.1rem;font-weight:700;">OJT Performance Appraisal Report</h3>
                <p class="text-xs text-secondary" style="margin:2px 0 0;">${ev.student?.name} • ${ev.student?.program}</p>
              </div>
            </div>
            <button class="modal__close" data-dismiss="modal" title="Close">${icon('x', 18)}</button>
          </div>

          <div class="modal__body" id="print-eval-area" style="flex:1;min-height:0;overflow-y:auto;padding:24px;">
            <!-- Institutional Certificate Header (Visible in Print & Screen) -->
            <div style="text-align:center;padding-bottom:16px;border-bottom:2px solid var(--color-primary);margin-bottom:20px;">
              <div style="font-size:0.75rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:var(--color-primary);margin-bottom:2px;">
                Carlos Hilado Memorial State University
              </div>
              <div style="font-size:1.15rem;font-weight:800;color:var(--text-primary);letter-spacing:-0.01em;">
                OFFICIAL OJT PRACTICUM PERFORMANCE APPRAISAL
              </div>
              <div style="font-size:0.75rem;color:var(--text-secondary);margin-top:2px;">
                Academic Quality Assurance & Student Internship Certification
              </div>
            </div>

            <!-- Score Banner -->
            <div style="display:flex;align-items:center;justify-content:space-between;background:#FAFBFD;border:1px solid var(--border-default);border-radius:10px;padding:18px 22px;margin-bottom:20px;">
              <div>
                <div style="font-size:0.72rem;font-weight:700;text-transform:uppercase;color:var(--text-secondary);letter-spacing:0.04em;">Final Cumulative Appraisal Score</div>
                <div style="display:flex;align-items:baseline;gap:6px;margin-top:2px;">
                  <span style="font-size:2.2rem;font-weight:800;color:var(--color-primary);">${score}</span>
                  <span style="font-size:1.05rem;color:var(--text-secondary);font-weight:600;">/ 5.00</span>
                </div>
                <div class="text-xs text-secondary" style="margin-top:2px;">Submitted on ${ev.submitted_at || '—'}</div>
              </div>
              <div style="text-align:right;">
                <div style="font-size:0.72rem;font-weight:700;text-transform:uppercase;color:var(--text-secondary);">Host Partner Entity</div>
                <div style="font-size:1rem;font-weight:700;color:var(--text-primary);margin-top:2px;">${ev.company?.name}</div>
                <div class="text-xs text-secondary">${ev.ojt?.completed_hours} of ${ev.ojt?.required_hours} certified training hours</div>
              </div>
            </div>

            <!-- Recommendation badge if exists -->
            ${ev.recommendation ? `
              <div style="background:rgba(16,185,129,0.06);border-left:4px solid #10B981;border-radius:6px;padding:12px 16px;margin-bottom:20px;">
                <span style="font-size:0.72rem;font-weight:700;text-transform:uppercase;color:#065F46;display:block;margin-bottom:2px;">Host Company Endorsement / Recommendation</span>
                <div style="font-weight:600;font-size:0.9rem;color:var(--text-primary);">${ev.recommendation}</div>
              </div>
            ` : ''}

            <!-- Itemized Competency Breakdown -->
            <h4 style="font-size:0.78rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--text-tertiary);margin:0 0 14px;">Detailed Competency Breakdown</h4>
            ${(ev.categories || []).map(group => `
              <div style="margin-bottom:18px;">
                <div style="font-weight:700;font-size:0.82rem;color:var(--color-primary);margin-bottom:8px;border-bottom:1px solid var(--border-default);padding-bottom:4px;">
                  ${group.category}
                </div>
                <div style="display:flex;flex-direction:column;gap:8px;">
                  ${group.questions.map(q => {
                    if (q.question_type === 'rating') {
                      const stars = '★'.repeat(q.rating_value || 0) + '☆'.repeat(Math.max(0, (q.scale_max || 5) - (q.rating_value || 0)));
                      return `
                        <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;background:#FAFBFD;border:1px solid #F1F4F9;border-radius:6px;gap:12px;">
                          <span style="font-size:0.85rem;color:var(--text-primary);">${q.question_text}</span>
                          <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
                            <span style="color:#F59E0B;letter-spacing:2px;font-size:0.95rem;">${stars}</span>
                            <span style="font-weight:700;font-size:0.85rem;color:var(--text-primary);">${q.rating_value}/${q.scale_max}</span>
                          </div>
                        </div>
                      `;
                    } else if (q.question_type === 'multiple_choice') {
                      return `
                        <div style="padding:10px 12px;background:#FAFBFD;border:1px solid #F1F4F9;border-radius:6px;">
                          <div style="font-size:0.85rem;color:var(--text-primary);margin-bottom:4px;">${q.question_text}</div>
                          <div style="font-weight:600;font-size:0.82rem;color:var(--color-primary);background:rgba(0,89,48,0.08);padding:3px 8px;border-radius:4px;display:inline-block;">
                            ${q.text_value || '—'}
                          </div>
                        </div>
                      `;
                    } else {
                      return `
                        <div style="padding:10px 12px;background:#FAFBFD;border:1px solid #F1F4F9;border-radius:6px;">
                          <div style="font-size:0.85rem;font-weight:600;color:var(--text-primary);margin-bottom:4px;">${q.question_text}</div>
                          <div style="font-size:0.84rem;color:var(--text-secondary);font-style:italic;line-height:1.45;">"${q.text_value || 'No feedback provided'}"</div>
                        </div>
                      `;
                    }
                  }).join('')}
                </div>
              </div>
            `).join('')}

            <!-- Overall Remarks -->
            ${ev.general_feedback ? `
              <div style="background:#FAFBFD;border:1px solid var(--border-default);border-radius:8px;padding:16px;margin-bottom:20px;">
                <span style="font-size:0.72rem;font-weight:700;text-transform:uppercase;color:var(--text-secondary);display:block;margin-bottom:4px;">Overall Evaluator Qualitative Remarks</span>
                <div style="font-size:0.88rem;color:var(--text-primary);line-height:1.5;">"${ev.general_feedback}"</div>
              </div>
            ` : ''}

            <!-- Signatory Section -->
            <div style="border-top:1px solid var(--border-default);padding-top:16px;margin-top:20px;display:flex;align-items:flex-end;justify-content:space-between;flex-wrap:wrap;gap:20px;">
              <div>
                <div style="font-size:0.7rem;color:var(--text-tertiary);text-transform:uppercase;margin-bottom:28px;">Host Employer Signatory</div>
                <div style="font-weight:700;font-size:0.92rem;color:var(--text-primary);">${ev.evaluator_name || 'HR Supervisor'}</div>
                <div style="font-size:0.78rem;color:var(--text-secondary);">${ev.evaluator_position || 'Industry Practicum Mentor'}</div>
                <div style="font-size:0.72rem;color:var(--text-tertiary);margin-top:2px;">${ev.company?.name}</div>
              </div>
              <div style="text-align:right;">
                <div style="font-size:0.7rem;color:var(--text-tertiary);text-transform:uppercase;margin-bottom:28px;">OJT Academic Coordinator</div>
                <div style="font-weight:700;font-size:0.92rem;color:var(--text-primary);">${user?.name || 'Practicum Coordinator'}</div>
                <div style="font-size:0.78rem;color:var(--text-secondary);">${user?.course || 'Academic Program Head'}</div>
                <div style="font-size:0.72rem;color:var(--text-tertiary);margin-top:2px;">Carlos Hilado Memorial State University</div>
              </div>
            </div>
          </div>

          <div class="modal__footer" style="display:flex;align-items:center;justify-content:space-between;padding:14px 24px;border-top:1px solid var(--border-default);background:#FAFBFD;flex-shrink:0;">
            <button class="btn btn--outline" id="print-eval-btn" style="gap:6px;">
              ${icon('download', 14)} Print Official Scorecard (PDF)
            </button>
            <button class="btn btn--primary" data-dismiss="modal">Close</button>
          </div>
        </div>
      `;

      const { bd } = showModal(html, { backdropId: 'detail-backdrop' });

      bd.querySelector('#print-eval-btn').addEventListener('click', () => {
        window.print();
      });

    } catch (err) {
      closeLoading();
      showToast(err.message || 'Failed to load evaluation.', 'error');
    }
  }

  // Toast notification helper
  function showToast(msg, type = 'info') {
    const existing = document.getElementById('eval-toast-msg');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'eval-toast-msg';
    const bg = type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : type === 'warning' ? '#F59E0B' : '#005930';
    toast.style.cssText = `position:fixed;bottom:24px;right:24px;background:${bg};color:#fff;padding:10px 18px;border-radius:8px;font-size:0.86rem;font-weight:600;box-shadow:0 8px 20px rgba(0,0,0,0.12);z-index:999999;display:flex;align-items:center;gap:8px;animation:fadeIn 0.2s ease;`;
    toast.innerHTML = `${icon(type === 'success' ? 'checkCircle' : 'info', 16)} <span>${msg}</span>`;
    document.body.appendChild(toast);
    setTimeout(() => { toast.remove(); }, 3500);
  }
}
