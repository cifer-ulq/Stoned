/**
 * CHMSU HireMe — OJT Trainees & Workforce Operations Hub (Company Portal)
 * Professional UI/UX Redesign: Operational Pulse, Department Streams, Unified Roster,
 * Live Trainee Dossier, and High-Precision Performance Appraisal Workflow.
 */

import { icon } from '../components/icons.js';
import { apiGet, apiPost, apiCache } from '../api/client.js';

export async function renderOjtTrainees(container) {
  // State
  let rawData = [];
  let activeViewMode = 'departments'; // 'departments' | 'roster'
  let activeStageFilter = 'all'; // 'all' | 'action_required' | 'hours_completed' | 'in_progress' | 'evaluated'
  let activeDeptFilter = 'all';
  let activeSortBy = 'progress_desc'; // 'progress_desc' | 'name_asc' | 'status'
  let searchQuery = '';
  let selectedTraineeForDossier = null;

  container.innerHTML = `
    <!-- ═══ Scoped Corporate Workforce Styles ═══ -->
    <style id="ojt-company-trainees-styles">
      .co-trainees-page {
        display: flex;
        flex-direction: column;
        gap: 18px;
        padding-bottom: 50px;
        color: var(--text-primary);
        font-family: inherit;
      }

      /* ── Executive Header ── */
      .co-trainees-masthead {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        flex-wrap: wrap;
        padding: 4px 0 2px 0;
      }
      .co-trainees-masthead__left {
        max-width: 680px;
      }
      .co-tagline {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        font-size: 0.72rem;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: var(--color-primary, #005930);
        margin-bottom: 5px;
      }
      .co-tagline__pulse {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: var(--color-primary, #005930);
        box-shadow: 0 0 0 3px rgba(0, 89, 48, 0.15);
      }
      .co-trainees-title {
        font-size: 1.55rem;
        font-weight: 700;
        color: var(--text-primary);
        margin: 0 0 5px 0;
        line-height: 1.25;
        letter-spacing: -0.015em;
      }
      .co-trainees-subtitle {
        font-size: 0.86rem;
        color: var(--text-secondary);
        margin: 0;
        line-height: 1.45;
      }
      .co-trainees-actions {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
      }

      /* ── Urgent Action Alert Ribbon ── */
      .co-action-ribbon {
        display: none;
        align-items: center;
        justify-content: space-between;
        background: #FFFBEB;
        border: 1px solid rgba(245, 158, 11, 0.35);
        border-left: 4px solid #F59E0B;
        border-radius: 10px;
        padding: 12px 18px;
        box-shadow: 0 2px 8px rgba(245, 158, 11, 0.06);
        animation: fadeIn 0.2s ease-out;
      }
      .co-action-ribbon__left {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .co-action-ribbon__icon {
        width: 34px;
        height: 34px;
        border-radius: 8px;
        background: rgba(245, 158, 11, 0.15);
        color: #B45309;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.1rem;
        font-weight: 700;
        flex-shrink: 0;
      }

      /* ── Workforce Operational Pulse Strip ── */
      .co-pulse-strip {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 12px;
      }
      .co-pulse-card {
        background: #ffffff;
        border: 1px solid var(--border-light, #E2E8F0);
        border-radius: 12px;
        padding: 14px 16px;
        display: flex;
        flex-direction: column;
        cursor: pointer;
        position: relative;
        transition: all 0.18s ease;
        box-shadow: 0 1px 3px rgba(0,0,0,0.02);
      }
      .co-pulse-card:hover {
        border-color: var(--color-primary, #005930);
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.04);
      }
      .co-pulse-card--active {
        border-color: var(--color-primary, #005930);
        background: #F8FAF9;
        box-shadow: 0 0 0 1.5px var(--color-primary, #005930), 0 4px 12px rgba(0,89,48,0.08);
      }
      .co-pulse-card__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
      }
      .co-pulse-card__icon-box {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .co-pulse-card__label-tag {
        font-size: 0.68rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--text-tertiary);
      }
      .co-pulse-card__value {
        font-size: 1.55rem;
        font-weight: 700;
        color: var(--text-primary);
        line-height: 1.15;
        font-feature-settings: 'tnum';
      }
      .co-pulse-card__title {
        font-size: 0.82rem;
        font-weight: 600;
        color: var(--text-primary);
        margin-top: 3px;
      }
      .co-pulse-card__desc {
        font-size: 0.72rem;
        color: var(--text-secondary);
        margin-top: 2px;
      }

      @media (max-width: 980px) {
        .co-pulse-strip {
          grid-template-columns: repeat(2, 1fr);
        }
      }
      @media (max-width: 580px) {
        .co-pulse-strip {
          grid-template-columns: 1fr;
        }
      }

      /* ── Operations Command Toolbar ── */
      .co-command-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        flex-wrap: wrap;
        background: #ffffff;
        border: 1px solid var(--border-light, #E2E8F0);
        border-radius: 10px;
        padding: 10px 14px;
      }
      .co-command-search {
        position: relative;
        flex: 1;
        min-width: 240px;
        max-width: 380px;
      }
      .co-command-search input {
        width: 100%;
        padding: 8px 12px 8px 34px;
        font-size: 0.84rem;
        border: 1px solid var(--border-default, #E2E8F0);
        border-radius: 7px;
        background: #FAFBFD;
        color: var(--text-primary);
        transition: all 0.15s ease;
      }
      .co-command-search input:focus {
        outline: none;
        background: #ffffff;
        border-color: var(--color-primary, #005930);
        box-shadow: 0 0 0 3px rgba(0,89,48,0.08);
      }
      .co-command-search__icon {
        position: absolute;
        left: 10px;
        top: 50%;
        transform: translateY(-50%);
        color: var(--text-tertiary);
        pointer-events: none;
      }
      .co-command-filters {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }
      .co-select-compact {
        font-size: 0.82rem;
        padding: 7px 11px;
        border-radius: 7px;
        border: 1px solid var(--border-default, #E2E8F0);
        background: #ffffff;
        color: var(--text-primary);
        font-weight: 500;
        cursor: pointer;
      }
      .co-view-toggle {
        display: inline-flex;
        background: #F1F4F8;
        border-radius: 7px;
        padding: 2px;
        border: 1px solid var(--border-default, #E2E8F0);
      }
      .co-view-toggle__btn {
        background: transparent;
        border: none;
        padding: 5px 10px;
        border-radius: 5px;
        font-size: 0.78rem;
        font-weight: 600;
        color: var(--text-secondary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 5px;
        transition: all 0.12s ease;
      }
      .co-view-toggle__btn--active {
        background: #ffffff;
        color: var(--color-primary, #005930);
        box-shadow: 0 1px 2px rgba(0,0,0,0.05);
      }

      /* ── Dual Workspace Body ── */
      .co-workspace-layout {
        display: flex;
        gap: 18px;
        align-items: flex-start;
        position: relative;
      }
      .co-main-pane {
        flex: 1;
        min-width: 0;
      }
      .co-dossier-pane {
        width: 375px;
        flex-shrink: 0;
        background: #ffffff;
        border: 1px solid var(--border-light, #E2E8F0);
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 16px rgba(0,0,0,0.05);
        display: none;
        flex-direction: column;
        position: sticky;
        top: 80px;
        max-height: calc(100vh - 100px);
      }
      .co-dossier-pane--visible {
        display: flex;
      }

      @media (max-width: 1100px) {
        .co-workspace-layout {
          flex-direction: column;
        }
        .co-dossier-pane {
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

      /* ── Stream & Department Cards ── */
      .co-stream-card {
        background: #ffffff;
        border: 1px solid var(--border-light, #E2E8F0);
        border-radius: 12px;
        overflow: hidden;
        margin-bottom: 16px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.02);
      }
      .co-stream-header {
        padding: 16px 20px;
        background: #FAFBFD;
        border-bottom: 1px solid var(--border-light, #E2E8F0);
        display: flex;
        align-items: center;
        justify-content: space-between;
        cursor: pointer;
        user-select: none;
      }
      .co-stream-header:hover {
        background: #F8FAF9;
      }
      .co-stream-body {
        padding: 12px 16px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      /* ── Trainee Item Row ── */
      .co-trainee-row {
        background: #ffffff;
        border: 1px solid var(--border-light, #E2E8F0);
        border-radius: 10px;
        padding: 12px 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
        transition: all 0.15s ease;
        cursor: pointer;
      }
      .co-trainee-row:hover {
        border-color: rgba(0,89,48,0.3);
        box-shadow: 0 2px 8px rgba(0,0,0,0.03);
      }
      .co-trainee-row.is-active-inspected {
        border-color: var(--color-primary, #005930);
        background: #F8FAF9;
        box-shadow: 0 0 0 1.5px var(--color-primary, #005930);
      }

      /* ── Roster Table View ── */
      .co-roster-frame {
        background: #ffffff;
        border: 1px solid var(--border-light, #E2E8F0);
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 1px 3px rgba(0,0,0,0.02);
      }
      .co-roster-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 0.85rem;
      }
      .co-roster-table th {
        background: #FAFBFD;
        padding: 11px 14px;
        text-align: left;
        font-size: 0.7rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--text-secondary);
        border-bottom: 1px solid var(--border-light, #E2E8F0);
        white-space: nowrap;
      }
      .co-roster-table td {
        padding: 12px 14px;
        border-bottom: 1px solid #F3F5F9;
        color: var(--text-primary);
        vertical-align: middle;
      }
      .co-roster-table tbody tr {
        transition: background-color 0.12s ease;
        cursor: pointer;
      }
      .co-roster-table tbody tr:hover {
        background-color: #F8FAF9;
      }
      .co-roster-table tbody tr.is-active-inspected {
        background-color: rgba(0,89,48,0.07);
        border-left: 3px solid var(--color-primary, #005930);
      }

      /* ── Status Pills & Gauges ── */
      .co-status-pill {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 3px 8px;
        border-radius: 6px;
        font-size: 0.72rem;
        font-weight: 700;
        white-space: nowrap;
      }
      .co-status-pill--action {
        background: rgba(245, 158, 11, 0.12);
        color: #B45309;
        border: 1px solid rgba(245, 158, 11, 0.3);
      }
      .co-status-pill--done {
        background: rgba(16, 185, 129, 0.1);
        color: #065F46;
        border: 1px solid rgba(16, 185, 129, 0.25);
      }
      .co-status-pill--ready {
        background: rgba(0, 89, 48, 0.09);
        color: var(--color-primary, #005930);
        border: 1px solid rgba(0, 89, 48, 0.2);
      }
      .co-status-pill--progress {
        background: #F1F4F8;
        color: var(--text-secondary);
        border: 1px solid #E2E5EE;
      }

      .co-hours-gauge {
        display: flex;
        flex-direction: column;
        gap: 3px;
        min-width: 120px;
      }
      .co-hours-gauge__track {
        height: 5px;
        width: 100%;
        background: #E8ECEF;
        border-radius: 99px;
        overflow: hidden;
      }
      .co-hours-gauge__fill {
        height: 100%;
        border-radius: 99px;
        transition: width 0.3s ease;
      }
      .co-hours-gauge__meta {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 0.7rem;
        color: var(--text-secondary);
      }

      /* ── Trainee Dossier Drawer Styling ── */
      .co-dossier__header {
        padding: 14px 18px;
        background: #FAFBFD;
        border-bottom: 1px solid var(--border-light, #E2E8F0);
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-shrink: 0;
      }
      .co-dossier__body {
        padding: 18px;
        overflow-y: auto;
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      .co-dossier__hero {
        display: flex;
        align-items: center;
        gap: 12px;
        padding-bottom: 14px;
        border-bottom: 1px solid var(--border-light, #E2E8F0);
      }
      .co-dossier__avatar {
        width: 44px;
        height: 44px;
        border-radius: 10px;
        background: rgba(0,89,48,0.1);
        color: var(--color-primary, #005930);
        font-size: 1rem;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .co-dossier__box {
        background: #FAFBFD;
        border: 1px solid var(--border-light, #E2E8F0);
        border-radius: 8px;
        padding: 12px;
      }
      .co-dossier__box-title {
        font-size: 0.7rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: var(--text-tertiary);
        margin-bottom: 6px;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      /* ── Responsive Trainee Row & Console Optimizations ── */
      @media (max-width: 900px) {
        .co-trainee-row {
          flex-direction: column !important;
          align-items: stretch !important;
          gap: 12px !important;
          padding: 14px 14px 12px !important;
        }
        .co-trainee-row__info {
          width: 100% !important;
          flex: none !important;
        }
        .co-trainee-row__gauge {
          width: 100% !important;
          min-width: 0 !important;
          flex: none !important;
        }
        .co-trainee-row__actions {
          display: flex !important;
          flex-wrap: wrap !important;
          gap: 8px !important;
          width: 100% !important;
          padding-top: 10px !important;
          border-top: 1px solid var(--border-light, #E2E8F0) !important;
        }
        .co-trainee-row__actions .btn {
          flex: 1 1 calc(50% - 8px) !important;
          min-height: 38px !important;
          justify-content: center !important;
        }
        .co-stream-header {
          padding: 12px 14px !important;
        }
        .co-command-bar {
          flex-direction: column !important;
          align-items: stretch !important;
          gap: 10px !important;
        }
        .co-command-search {
          max-width: 100% !important;
          width: 100% !important;
        }
        .co-command-filters {
          width: 100% !important;
          display: flex !important;
          flex-wrap: wrap !important;
          gap: 8px !important;
        }
        .co-select-compact {
          flex: 1 1 140px !important;
          min-width: 0 !important;
          height: 38px !important;
        }
        .co-view-toggle {
          width: 100% !important;
          display: flex !important;
        }
        .co-view-toggle__btn {
          flex: 1 !important;
          justify-content: center !important;
          min-height: 34px !important;
        }
      }

      @media (max-width: 768px) {
        .co-trainees-masthead {
          flex-direction: column !important;
          align-items: stretch !important;
          gap: 14px !important;
        }
        .co-trainees-actions {
          width: 100% !important;
        }
        .co-trainees-actions .btn {
          flex: 1 1 auto !important;
          min-height: 40px !important;
          justify-content: center !important;
        }
        .co-action-ribbon {
          flex-direction: column !important;
          align-items: stretch !important;
          gap: 10px !important;
          padding: 12px 14px !important;
        }
        .co-action-ribbon button {
          width: 100% !important;
          justify-content: center !important;
          min-height: 38px !important;
        }
      }

      @media (max-width: 576px) {
        .co-trainee-row__actions .btn {
          flex: 1 1 100% !important;
        }
        .co-pulse-strip {
          grid-template-columns: repeat(2, 1fr) !important;
          gap: 8px !important;
        }
        .co-pulse-card {
          padding: 10px 12px !important;
        }
        .co-pulse-card__value {
          font-size: 1.25rem !important;
        }
        .co-pulse-card__title {
          font-size: 0.78rem !important;
        }
        .co-pulse-card__desc {
          font-size: 0.68rem !important;
          line-height: 1.2 !important;
        }
      }

      @media (max-width: 360px) {
        .co-pulse-strip {
          grid-template-columns: 1fr !important;
          gap: 6px !important;
        }
        .co-trainees-title {
          font-size: 1.25rem !important;
        }
      }
    </style>

    <div class="co-trainees-page">
      <!-- ═══ 1. Executive Operations Masthead ═══ -->
      <div class="co-trainees-masthead">
        <div class="co-trainees-masthead__left">
          <div class="co-tagline">
            <span class="co-tagline__pulse"></span>
            <span>Workforce & Internship Operations Console</span>
          </div>
          <h1 class="co-trainees-title">OJT Trainees Management</h1>
          <p class="co-trainees-subtitle">
            Oversee active university interns, verify scheduled shifts, track completed practicum hours, and complete official student performance appraisals.
          </p>
        </div>
        <div class="co-trainees-actions">
          <button class="btn btn--outline btn--sm" id="btn-refresh-trainees" style="gap:6px;">
            ${icon('refreshCw', 14)} Refresh Roster
          </button>
          <a href="#/ojt-slots" class="btn btn--primary btn--sm" style="gap:6px;">
            ${icon('briefcase', 14)} Manage OJT Openings
          </a>
        </div>
      </div>

      <!-- ═══ 2. Urgent Action Alert Ribbon (Appears when evaluations are pending) ═══ -->
      <div class="co-action-ribbon" id="co-action-ribbon">
        <div class="co-action-ribbon__left">
          <div class="co-action-ribbon__icon">★</div>
          <div>
            <div style="font-weight:700;font-size:0.9rem;color:#92400E;">
              <span id="ribbon-pending-count">0</span> Performance Evaluation(s) Awaiting Your Review
            </div>
            <div style="font-size:0.78rem;color:#B45309;margin-top:2px;">
              CHMSU OJT Coordinators have requested official employer assessments for trainees who have completed their required practicum hours.
            </div>
          </div>
        </div>
        <button class="btn btn--sm" id="btn-ribbon-filter-action" style="background:#B45309;border-color:#B45309;color:#ffffff;font-size:0.78rem;font-weight:700;padding:6px 14px;white-space:nowrap;">
          View Action Items
        </button>
      </div>

      <!-- ═══ 3. Workforce Operational Pulse Strip ═══ -->
      <div class="co-pulse-strip" id="co-pulse-strip">
        <!-- Metric 1: Total Interns -->
        <div class="co-pulse-card co-pulse-card--active" data-pulse-filter="all">
          <div class="co-pulse-card__header">
            <div class="co-pulse-card__icon-box" style="background:rgba(0,89,48,0.08);color:var(--color-primary, #005930);">
              ${icon('users', 16)}
            </div>
            <span class="co-pulse-card__label-tag">Roster</span>
          </div>
          <div class="co-pulse-card__value" id="stat-total-trainees">—</div>
          <div class="co-pulse-card__title">Total Active Interns</div>
          <div class="co-pulse-card__desc">Deployed across company departments</div>
        </div>

        <!-- Metric 2: Department Postings -->
        <div class="co-pulse-card" data-pulse-filter="postings">
          <div class="co-pulse-card__header">
            <div class="co-pulse-card__icon-box" style="background:#F1F4F8;color:var(--text-secondary);">
              ${icon('briefcase', 16)}
            </div>
            <span class="co-pulse-card__label-tag">Streams</span>
          </div>
          <div class="co-pulse-card__value" id="stat-active-postings">—</div>
          <div class="co-pulse-card__title">Department Roles</div>
          <div class="co-pulse-card__desc">Positions with deployed trainees</div>
        </div>

        <!-- Metric 3: Hours Completed -->
        <div class="co-pulse-card" data-pulse-filter="hours_completed">
          <div class="co-pulse-card__header">
            <div class="co-pulse-card__icon-box" style="background:rgba(16,185,129,0.1);color:#065F46;">
              ${icon('checkCircle', 16)}
            </div>
            <span class="co-pulse-card__label-tag">Qualified</span>
          </div>
          <div class="co-pulse-card__value" id="stat-hours-completed" style="color:#065F46;">—</div>
          <div class="co-pulse-card__title">Hours Fulfilled</div>
          <div class="co-pulse-card__desc">Reached 100% required training hours</div>
        </div>

        <!-- Metric 4: Pending Evaluations -->
        <div class="co-pulse-card" data-pulse-filter="action_required">
          <div class="co-pulse-card__header">
            <div class="co-pulse-card__icon-box" style="background:rgba(245,158,11,0.12);color:#B45309;">
              <span style="font-weight:800;">★</span>
            </div>
            <span class="co-pulse-card__label-tag" style="color:#B45309;">Action Required</span>
          </div>
          <div class="co-pulse-card__value" id="stat-pending-evals" style="color:#B45309;">0</div>
          <div class="co-pulse-card__title">Appraisals Pending</div>
          <div class="co-pulse-card__desc">Awaiting your supervisor scoring</div>
        </div>
      </div>

      <!-- ═══ 4. Command Toolbar ═══ -->
      <div class="co-command-bar">
        <div class="co-command-search">
          <span class="co-command-search__icon">${icon('search', 14)}</span>
          <input id="co-trainee-search-input" placeholder="Search by intern name, academic program, student ID, or role..." />
        </div>

        <div class="co-command-filters">
          <!-- Stage Filter -->
          <select class="co-select-compact" id="co-stage-filter" title="Filter by Practicum / Appraisal State">
            <option value="all">All Interns</option>
            <option value="action_required">★ Action Required (Pending Appraisal)</option>
            <option value="hours_completed">Hours Completed (100%)</option>
            <option value="in_progress">Currently Rendering Hours</option>
            <option value="evaluated">Certified & Evaluated</option>
          </select>

          <!-- Department Filter -->
          <select class="co-select-compact" id="co-dept-filter" title="Filter by Department Role">
            <option value="all">All Departments</option>
          </select>

          <!-- Sort Selector -->
          <select class="co-select-compact" id="co-sort-filter" title="Sort interns list">
            <option value="progress_desc">Hours Progress: High to Low</option>
            <option value="name_asc">Intern Name: A to Z</option>
            <option value="status">Urgency Status</option>
          </select>

          <!-- View Switcher -->
          <div class="co-view-toggle">
            <button class="co-view-toggle__btn co-view-toggle__btn--active" id="btn-view-departments" title="Grouped by Position / Department">
              ${icon('layers', 13)} Departments
            </button>
            <button class="co-view-toggle__btn" id="btn-view-roster" title="Unified Intern Ledger">
              ${icon('clipboardList', 13)} Full Roster
            </button>
          </div>
        </div>
      </div>

      <!-- ═══ 5. Dual Workspace Body ═══ -->
      <div class="co-workspace-layout">
        <!-- Main Pane -->
        <main class="co-main-pane">
          <!-- Department Streams View -->
          <div id="co-view-departments-wrap">
            <div id="co-streams-body">
              ${renderLoadingSkeleton()}
            </div>
          </div>

          <!-- Unified Full Roster Table View -->
          <div id="co-view-roster-wrap" style="display:none;">
            <div class="co-roster-frame">
              <div style="overflow-x:auto;">
                <table class="co-roster-table">
                  <thead>
                    <tr>
                      <th style="min-width:200px;">Trainee Dossier</th>
                      <th style="width:110px;">Student ID</th>
                      <th style="min-width:160px;">Assigned Role & Dept</th>
                      <th style="min-width:150px;">Practicum Hours</th>
                      <th style="min-width:140px;">Work Schedule</th>
                      <th style="width:130px;">Appraisal State</th>
                      <th style="width:110px;text-align:right;">Actions</th>
                    </tr>
                  </thead>
                  <tbody id="co-roster-tbody">
                    ${[1, 2, 3, 4].map(() => '<tr><td colspan="7"><div class="skeleton" style="height:38px;border-radius:6px;margin:4px 0;"></div></td></tr>').join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>

        <!-- Right Side: Live Trainee Dossier Slide-Over -->
        <div class="co-dossier-backdrop" id="co-dossier-backdrop"></div>
        <aside class="co-dossier-pane" id="co-dossier-pane">
          <div class="co-dossier__header">
            <div style="display:flex;align-items:center;gap:8px;">
              <span class="badge badge--neutral" style="font-size:0.68rem;text-transform:uppercase;letter-spacing:0.04em;">Intern Dossier</span>
            </div>
            <div style="display:flex;align-items:center;gap:4px;">
              <button class="btn btn--ghost btn--sm" id="btn-co-dossier-close" title="Close Dossier" style="padding:4px 6px;">
                ${icon('x', 15)}
              </button>
            </div>
          </div>
          <div class="co-dossier__body" id="co-dossier-body">
            <!-- Populated via renderDossier() -->
          </div>
        </aside>
      </div>
    </div>
  `;

  // Element Selectors
  const actionRibbon        = container.querySelector('#co-action-ribbon');
  const ribbonPendingCount  = container.querySelector('#ribbon-pending-count');
  const btnRibbonFilter     = container.querySelector('#btn-ribbon-filter-action');
  const pulseCards          = container.querySelectorAll('.co-pulse-card');

  const searchInput         = container.querySelector('#co-trainee-search-input');
  const stageFilterSelect   = container.querySelector('#co-stage-filter');
  const deptFilterSelect    = container.querySelector('#co-dept-filter');
  const sortFilterSelect    = container.querySelector('#co-sort-filter');

  const btnViewDepartments  = container.querySelector('#btn-view-departments');
  const btnViewRoster       = container.querySelector('#btn-view-roster');
  const viewDepartmentsWrap = container.querySelector('#co-view-departments-wrap');
  const viewRosterWrap      = container.querySelector('#co-view-roster-wrap');
  const streamsBody         = container.querySelector('#co-streams-body');
  const rosterTbody         = container.querySelector('#co-roster-tbody');

  const dossierPane         = container.querySelector('#co-dossier-pane');
  const dossierBackdrop     = container.querySelector('#co-dossier-backdrop');
  const dossierBody         = container.querySelector('#co-dossier-body');
  const btnDossierClose     = container.querySelector('#btn-co-dossier-close');

  // =========================================================================
  // DATA FETCHING & SYNCHRONIZATION
  // =========================================================================

  async function loadData() {
    try {
      const res = await apiGet('/company/ojt-trainees', { forceRefresh: true });
      if (res?.success && Array.isArray(res.data)) {
        rawData = res.data;
      } else {
        rawData = [];
      }
    } catch {
      rawData = [];
    }

    populateDepartmentOptions();
    updateOperationalStats();
    renderActiveView();

    // If an intern was already being inspected, re-render their dossier with fresh data
    if (selectedTraineeForDossier) {
      const allFlat = getAllTraineesFlat(rawData);
      const fresh = allFlat.find(t => t.id === selectedTraineeForDossier.id);
      if (fresh) inspectTrainee(fresh);
      else closeDossier();
    }
  }

  // Populate department filter dropdown
  function populateDepartmentOptions() {
    const depts = new Set();
    rawData.forEach(g => {
      const deptName = g.posting?.department || g.posting?.title;
      if (deptName) depts.add(deptName);
    });

    deptFilterSelect.innerHTML = `
      <option value="all">All Departments (${depts.size})</option>
      ${Array.from(depts).map(d => `<option value="${escapeHtml(d)}" ${activeDeptFilter === d ? 'selected' : ''}>${escapeHtml(d)}</option>`).join('')}
    `;
  }

  // Calculate and update KPIs & Action Ribbon
  function updateOperationalStats() {
    const flatList = getAllTraineesFlat(rawData);
    const totalTrainees = flatList.length;
    const activePostingsCount = rawData.length;

    let pendingEvalsCount = 0;
    let hoursCompletedCount = 0;

    flatList.forEach(t => {
      const isCompleted = t.required_hours > 0 && t.completed_hours >= t.required_hours;
      if (isCompleted) hoursCompletedCount++;
      if (t.evaluation?.status === 'pending') pendingEvalsCount++;
    });

    container.querySelector('#stat-total-trainees').textContent = totalTrainees;
    container.querySelector('#stat-active-postings').textContent = activePostingsCount;
    container.querySelector('#stat-hours-completed').textContent = hoursCompletedCount;
    container.querySelector('#stat-pending-evals').textContent   = pendingEvalsCount;

    // Urgent Ribbon Visibility
    if (pendingEvalsCount > 0) {
      actionRibbon.style.display = 'flex';
      ribbonPendingCount.textContent = pendingEvalsCount;
    } else {
      actionRibbon.style.display = 'none';
    }
  }

  // Flat array extractor of all trainees with their parent posting attached
  function getAllTraineesFlat(groups) {
    const all = [];
    groups.forEach(g => {
      const p = g.posting || {};
      const trainees = Array.isArray(g.trainees) ? g.trainees : [];
      trainees.forEach(t => {
        all.push({ ...t, parentPosting: p });
      });
    });
    return all;
  }

  // =========================================================================
  // FILTERING & SORTING LOGIC
  // =========================================================================

  function getFilteredGroups() {
    const q = searchQuery.toLowerCase().trim();

    return rawData.map(group => {
      const p = group.posting || {};
      const deptName = p.department || p.title;

      // Department filter
      if (activeDeptFilter !== 'all' && deptName !== activeDeptFilter) {
        return null;
      }

      const filteredTrainees = (Array.isArray(group.trainees) ? group.trainees : []).filter(t => {
        const st = t.student || {};
        const isHoursCompleted = t.required_hours > 0 && t.completed_hours >= t.required_hours;

        // Stage filter
        if (activeStageFilter === 'action_required' && t.evaluation?.status !== 'pending') return false;
        if (activeStageFilter === 'hours_completed' && !isHoursCompleted) return false;
        if (activeStageFilter === 'in_progress' && (isHoursCompleted || t.evaluation?.status === 'submitted')) return false;
        if (activeStageFilter === 'evaluated' && t.evaluation?.status !== 'submitted') return false;

        // Text search
        if (q) {
          const match = (st.name || '').toLowerCase().includes(q) ||
                        (st.program || '').toLowerCase().includes(q) ||
                        (st.student_id || '').toLowerCase().includes(q) ||
                        (st.email || '').toLowerCase().includes(q) ||
                        (p.title || '').toLowerCase().includes(q) ||
                        (p.department || '').toLowerCase().includes(q);
          if (!match) return false;
        }

        return true;
      });

      // Trainee sorting
      filteredTrainees.sort((a, b) => {
        if (activeSortBy === 'progress_desc') {
          const aPct = a.required_hours > 0 ? (a.completed_hours / a.required_hours) : 0;
          const bPct = b.required_hours > 0 ? (b.completed_hours / b.required_hours) : 0;
          return bPct - aPct;
        } else if (activeSortBy === 'name_asc') {
          return (a.student?.name || '').localeCompare(b.student?.name || '');
        } else if (activeSortBy === 'status') {
          const aScore = a.evaluation?.status === 'pending' ? 3 : (a.completed_hours >= a.required_hours ? 2 : 1);
          const bScore = b.evaluation?.status === 'pending' ? 3 : (b.completed_hours >= b.required_hours ? 2 : 1);
          return bScore - aScore;
        }
        return 0;
      });

      if (!filteredTrainees.length && (q || activeStageFilter !== 'all' || activeDeptFilter !== 'all')) {
        return null;
      }

      return {
        ...group,
        trainees: filteredTrainees
      };
    }).filter(Boolean);
  }

  function getFilteredFlatTrainees() {
    const groups = getFilteredGroups();
    return getAllTraineesFlat(groups);
  }

  // =========================================================================
  // VIEW SWITCHING & RENDERING
  // =========================================================================

  function renderActiveView() {
    if (activeViewMode === 'departments') {
      viewDepartmentsWrap.style.display = 'block';
      viewRosterWrap.style.display = 'none';
      renderDepartmentStreams();
    } else {
      viewDepartmentsWrap.style.display = 'none';
      viewRosterWrap.style.display = 'block';
      renderUnifiedRoster();
    }
  }

  function setViewMode(mode) {
    activeViewMode = mode;
    btnViewDepartments.classList.toggle('co-view-toggle__btn--active', mode === 'departments');
    btnViewRoster.classList.toggle('co-view-toggle__btn--active', mode === 'roster');
    renderActiveView();
  }

  btnViewDepartments.addEventListener('click', () => setViewMode('departments'));
  btnViewRoster.addEventListener('click', () => setViewMode('roster'));

  // 1. Render Department Streams (Grouped View)
  function renderDepartmentStreams() {
    const groups = getFilteredGroups();

    if (!groups.length) {
      streamsBody.innerHTML = renderEmptyState();
      return;
    }

    streamsBody.innerHTML = groups.map((group, gi) => {
      const p = group.posting || {};
      const trainees = Array.isArray(group.trainees) ? group.trainees : [];
      const scheduleLabel = p.schedule_type === 'half_day' ? 'Half Day Shifts' : 'Full Day Shifts';
      const filled = (p.slots_total || 0) - (p.slots_remaining || 0);
      const fillPct = p.slots_total ? Math.min(100, Math.round((filled / p.slots_total) * 100)) : 0;
      const barColor = fillPct >= 90 ? '#005930' : '#10B981';

      return `
        <div class="co-stream-card" data-group-index="${gi}">
          <!-- Stream Header -->
          <div class="co-stream-header" data-toggle-stream="${gi}">
            <div style="display:flex;align-items:center;gap:14px;flex:1;min-width:0;">
              <div style="width:42px;height:42px;border-radius:10px;background:rgba(0,89,48,0.08);color:var(--color-primary, #005930);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.9rem;flex-shrink:0;">
                ${(p.department || 'OJT').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div style="min-width:0;">
                <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:2px;">
                  <h3 style="font-size:0.98rem;font-weight:700;color:var(--text-primary);margin:0;">${escapeHtml(p.title || 'OJT Role')}</h3>
                  <span class="badge badge--success" style="font-size:0.68rem;padding:2px 7px;">${escapeHtml(p.status || 'Active')}</span>
                </div>
                <div style="font-size:0.75rem;color:var(--text-secondary);display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                  <span>${escapeHtml(p.department || 'Department')}</span>
                  ${p.location ? `<span>&bull; ${escapeHtml(p.location.split(',')[0])}</span>` : ''}
                  <span>&bull; ${scheduleLabel}</span>
                </div>
              </div>
            </div>

            <div style="display:flex;align-items:center;gap:14px;flex-shrink:0;">
              <!-- Slots Progress Mini -->
              ${p.slots_total ? `
                <div style="display:none;align-items:center;gap:8px;min-width:130px;" class="desktop-only-slots">
                  <div style="flex:1;height:5px;background:#E8ECEF;border-radius:99px;overflow:hidden;">
                    <div style="height:100%;width:${fillPct}%;background:${barColor};"></div>
                  </div>
                  <span style="font-size:0.72rem;color:var(--text-secondary);">${filled}/${p.slots_total} slots</span>
                </div>` : ''}

              <span style="display:inline-flex;align-items:center;gap:5px;font-size:0.8rem;font-weight:700;color:var(--color-primary, #005930);background:rgba(0,89,48,0.08);padding:4px 12px;border-radius:99px;">
                ${icon('users', 13)} ${trainees.length} Intern${trainees.length !== 1 ? 's' : ''}
              </span>
              <span class="stream-chevron" data-chevron="${gi}" style="color:var(--text-tertiary);transition:transform .2s;">
                ${icon('chevronDown', 16)}
              </span>
            </div>
          </div>

          <!-- Trainees Cards List -->
          <div class="co-stream-body" id="stream-trainees-${gi}">
            ${trainees.map((t) => renderTraineeRowHtml(t, p)).join('')}
          </div>
        </div>
      `;
    }).join('');

    // Toggle collapse listeners
    streamsBody.querySelectorAll('[data-toggle-stream]').forEach(header => {
      header.addEventListener('click', () => {
        const gi = header.getAttribute('data-toggle-stream');
        const bodyEl = streamsBody.querySelector(`#stream-trainees-${gi}`);
        const chevron = header.querySelector(`[data-chevron="${gi}"]`);
        if (!bodyEl) return;
        const isHidden = bodyEl.style.display === 'none';
        bodyEl.style.display = isHidden ? 'flex' : 'none';
        if (chevron) chevron.style.transform = isHidden ? 'rotate(0deg)' : 'rotate(-90deg)';
      });
    });

    attachTraineeActionListeners(streamsBody);
  }

  // 2. Render Full Roster (Flat Table View)
  function renderUnifiedRoster() {
    const list = getFilteredFlatTrainees();

    if (!list.length) {
      rosterTbody.innerHTML = `<tr><td colspan="7">${renderEmptyState()}</td></tr>`;
      return;
    }

    rosterTbody.innerHTML = list.map(t => {
      const st = t.student || {};
      const p = t.parentPosting || {};
      const init = (st.name || 'Student').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
      const isInspected = selectedTraineeForDossier?.id === t.id;

      const completed = t.completed_hours || 0;
      const required = t.required_hours || 486;
      const pct = required > 0 ? Math.min(100, Math.round((completed / required) * 100)) : 0;
      const barColor = pct >= 100 ? 'var(--color-primary, #005930)' : '#10B981';

      // Status pill
      let statusBadge = '';
      if (t.status === 'withdrawn_emergency' || (t.emergency_request?.type === 'permanent_withdrawal' && t.emergency_request?.coordinator_status === 'approved')) {
        statusBadge = `<span class="co-status-pill" style="background:#FEE2E2;color:#991B1B;border-color:rgba(239,68,68,0.3);">${icon('alertTriangle', 11)} Withdrawn (Emergency)</span>`;
      } else if (t.status === 'on_leave') {
        statusBadge = `<span class="co-status-pill" style="background:#E0F2FE;color:#0369a1;border-color:rgba(2,132,199,0.3);">${icon('shieldCheck', 11)} On Medical Leave</span>`;
      } else if (t.status === 'stoppage_requested' || t.emergency_request?.coordinator_status === 'pending') {
        statusBadge = `<span class="co-status-pill co-status-pill--action" style="background:#FEF3C7;color:#92400e;border-color:rgba(245,158,11,0.35);">${icon('clock', 11)} Emergency Notice Filed</span>`;
      } else if (t.evaluation?.status === 'submitted') {
        statusBadge = `<span class="co-status-pill co-status-pill--done">${icon('checkCircle', 11)} Graded (★ ${Number(t.evaluation.overall_score).toFixed(1)})</span>`;
      } else if (t.evaluation?.status === 'pending') {
        statusBadge = `<span class="co-status-pill co-status-pill--action">${icon('clock', 11)} Action Needed</span>`;
      } else if (completed >= required) {
        statusBadge = `<span class="co-status-pill co-status-pill--ready">${icon('checkCircle', 11)} 100% Rendered</span>`;
      } else {
        statusBadge = `<span class="co-status-pill co-status-pill--progress">In Training</span>`;
      }

      // Action button
      let actionBtn = '';
      if (t.emergency_request) {
        actionBtn = `
          <button class="btn btn--outline btn--sm btn-emergency-clearance" data-emergency-id="${t.emergency_request.id}" data-trainee-id="${t.id}" style="padding:4px 9px;font-size:0.75rem;gap:4px;color:#d97706;border-color:rgba(245,158,11,0.4);font-weight:600;">
            ${icon('checkSquare', 12)} Exit Clearance
          </button>`;
      } else if (t.evaluation?.status === 'pending') {
        actionBtn = `
          <button class="btn btn--primary btn--sm btn-trigger-eval" data-eval-id="${t.evaluation.id}" style="padding:4px 10px;font-size:0.75rem;background:#F59E0B;border-color:#F59E0B;gap:4px;">
            ★ Evaluate
          </button>`;
      } else if (t.evaluation?.status === 'submitted') {
        actionBtn = `
          <button class="btn btn--outline btn--sm btn-view-eval-scorecard" data-eval-id="${t.evaluation.id}" style="padding:4px 10px;font-size:0.75rem;gap:4px;">
            Scorecard
          </button>`;
      } else {
        actionBtn = `
          <button class="btn btn--ghost btn--sm btn-inspect-trainee" data-trainee-id="${t.id}" style="padding:4px 9px;font-size:0.75rem;">
            Dossier
          </button>`;
      }

      const scheduleDaysText = Array.isArray(t.schedule_days) && t.schedule_days.length
        ? t.schedule_days.join(', ')
        : 'Mon – Fri';

      const dtrBadgeHtml = renderTodayDtrBadge(t.today_dtr);

      return `
        <tr data-trainee-id="${t.id}" class="${isInspected ? 'is-active-inspected' : ''}">
          <td>
            <div style="display:flex;align-items:center;gap:10px;">
              <div style="width:34px;height:34px;border-radius:8px;background:rgba(0,89,48,0.08);color:var(--color-primary, #005930);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.75rem;flex-shrink:0;">
                ${init}
              </div>
              <div style="min-width:0;">
                <div style="font-weight:600;color:var(--text-primary);font-size:0.86rem;">${escapeHtml(st.name || 'Intern')}</div>
                <div style="font-size:0.72rem;color:var(--text-secondary);">${escapeHtml(st.program || '—')}</div>
              </div>
            </div>
          </td>
          <td><span style="font-family:monospace;font-size:0.75rem;color:var(--text-secondary);">${escapeHtml(st.student_id || '—')}</span></td>
          <td>
            <div style="font-weight:600;font-size:0.83rem;color:var(--text-primary);">${escapeHtml(p.title || 'OJT Role')}</div>
            <div style="font-size:0.72rem;color:var(--text-secondary);">${escapeHtml(p.department || '')}</div>
          </td>
          <td>
            <div class="co-hours-gauge">
              <div class="co-hours-gauge__track">
                <div class="co-hours-gauge__fill" style="width:${pct}%;background:${barColor};"></div>
              </div>
              <div class="co-hours-gauge__meta">
                <span>${completed}/${required}h</span>
                <span style="font-weight:700;">${pct}%</span>
              </div>
            </div>
          </td>
          <td>
            <div style="font-size:0.75rem;color:var(--text-primary);font-weight:500;">${scheduleDaysText}</div>
            <div style="font-size:0.7rem;color:var(--text-secondary);margin-bottom:4px;">${t.shift_start || '08:00'} &ndash; ${t.shift_end || '17:00'}</div>
            ${dtrBadgeHtml}
          </td>
          <td>${statusBadge}</td>
          <td style="text-align:right;" onclick="event.stopPropagation();">
            <div style="display:inline-flex;align-items:center;gap:6px;justify-content:flex-end;">
              <button class="btn btn--outline btn--sm btn-open-trainee-dtr" data-student-id="${st.id}" data-trainee-id="${t.id}" title="View Student Daily Time Record (DTR)" style="padding:4px 9px;font-size:0.75rem;gap:4px;color:var(--color-primary, #005930);border-color:rgba(0,89,48,0.28);font-weight:600;">
                ${icon('clock', 12)} DTR
              </button>
              ${actionBtn}
            </div>
          </td>
        </tr>
      `;
    }).join('');

    attachTraineeActionListeners(rosterTbody);
  }

  // Trainee card html generator
  function renderTraineeRowHtml(t, posting) {
    const st = t.student || {};
    const sup = t.supervisor || {};
    const init = (st.name || 'Student').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const isInspected = selectedTraineeForDossier?.id === t.id;

    const completed = t.completed_hours || 0;
    const required = t.required_hours || 486;
    const pct = required > 0 ? Math.min(100, Math.round((completed / required) * 100)) : 0;
    const barColor = pct >= 100 ? 'var(--color-primary, #005930)' : '#10B981';

    // Status pill
    let statusPill = '';
    let actionBtn = '';

    if (t.status === 'withdrawn_emergency' || (t.emergency_request?.type === 'permanent_withdrawal' && t.emergency_request?.coordinator_status === 'approved')) {
      statusPill = `<span class="co-status-pill" style="background:#FEE2E2;color:#991B1B;border-color:rgba(239,68,68,0.3);">${icon('alertTriangle', 11)} Withdrawn (Emergency)</span>`;
    } else if (t.status === 'on_leave') {
      statusPill = `<span class="co-status-pill" style="background:#E0F2FE;color:#0369a1;border-color:rgba(2,132,199,0.3);">${icon('shieldCheck', 11)} On Medical Leave</span>`;
    } else if (t.status === 'stoppage_requested' || t.emergency_request?.coordinator_status === 'pending') {
      statusPill = `<span class="co-status-pill co-status-pill--action" style="background:#FEF3C7;color:#92400e;border-color:rgba(245,158,11,0.35);">${icon('clock', 11)} Emergency Notice Filed</span>`;
    } else if (t.evaluation?.status === 'pending') {
      statusPill = `<span class="co-status-pill co-status-pill--action">${icon('clock', 11)} Action: Evaluation Requested</span>`;
    } else if (t.evaluation?.status === 'submitted') {
      statusPill = `<span class="co-status-pill co-status-pill--done">${icon('checkCircle', 11)} Graded (${Number(t.evaluation.overall_score).toFixed(1)}/5.0)</span>`;
    } else if (completed >= required) {
      statusPill = `<span class="co-status-pill co-status-pill--ready">${icon('checkCircle', 11)} 100% Hours Rendered</span>`;
    } else {
      statusPill = `<span class="co-status-pill co-status-pill--progress">Active Intern (${pct}%)</span>`;
    }

    if (t.emergency_request) {
      actionBtn = `
        <button class="btn btn--outline btn--sm btn-emergency-clearance" data-emergency-id="${t.emergency_request.id}" data-trainee-id="${t.id}" style="padding:4px 9px;font-size:0.75rem;gap:4px;color:#d97706;border-color:rgba(245,158,11,0.4);font-weight:600;">
          ${icon('checkSquare', 12)} Exit Clearance
        </button>`;
    } else if (t.evaluation?.status === 'pending') {
      actionBtn = `
        <button class="btn btn--primary btn--sm btn-trigger-eval" data-eval-id="${t.evaluation.id}" style="background:#F59E0B;border-color:#F59E0B;gap:4px;font-size:0.75rem;padding:4px 11px;font-weight:700;">
          ★ Complete Evaluation
        </button>`;
    } else if (t.evaluation?.status === 'submitted') {
      actionBtn = `
        <button class="btn btn--outline btn--sm btn-view-eval-scorecard" data-eval-id="${t.evaluation.id}" style="font-size:0.75rem;padding:4px 10px;">
          View Scorecard
        </button>`;
    }

    const scheduleDays = Array.isArray(t.schedule_days) && t.schedule_days.length
      ? t.schedule_days.join(', ')
      : 'Mon – Fri';

    const dtrBadgeHtml = renderTodayDtrBadge(t.today_dtr);

    return `
      <div class="co-trainee-row ${isInspected ? 'is-active-inspected' : ''}" data-trainee-id="${t.id}">
        <!-- Left: Student Info -->
        <div class="co-trainee-row__info" style="display:flex;align-items:center;gap:12px;min-width:0;flex:1.2;">
          <div class="co-trainee-row__avatar" style="width:38px;height:38px;border-radius:10px;background:rgba(0,89,48,0.08);color:var(--color-primary, #005930);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.85rem;flex-shrink:0;">
            ${init}
          </div>
          <div style="min-width:0;">
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:2px;">
              <span class="co-trainee-name" style="font-weight:700;font-size:0.88rem;color:var(--text-primary);">${escapeHtml(st.name || 'Intern')}</span>
              ${statusPill}
            </div>
            <div style="font-size:0.74rem;color:var(--text-secondary);display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
              <span>${escapeHtml(st.program || '—')}${st.year_level ? ` &bull; ${escapeHtml(st.year_level)}` : ''}</span>
              <span style="font-family:monospace;color:var(--text-tertiary);">ID: ${escapeHtml(st.student_id || '—')}</span>
            </div>
          </div>
        </div>

        <!-- Middle: Hours Progress & Today's Live DTR -->
        <div class="co-trainee-row__gauge" style="flex:0.95;min-width:160px;">
          <div class="co-hours-gauge">
            <div class="co-hours-gauge__track">
              <div class="co-hours-gauge__fill" style="width:${pct}%;background:${barColor};"></div>
            </div>
            <div class="co-hours-gauge__meta">
              <span>${completed} of ${required} hrs</span>
              <span style="font-weight:700;color:var(--text-primary);">${pct}%</span>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-top:4px;">
            <span style="font-size:0.7rem;color:var(--text-tertiary);">
              ${scheduleDays} &bull; ${t.shift_start || '08:00'} - ${t.shift_end || '17:00'}
            </span>
            ${dtrBadgeHtml}
          </div>
        </div>

        <!-- Coordinator badge snippet -->
        <div class="co-trainee-row__coord desktop-only-slots" style="display:none;flex-direction:column;font-size:0.72rem;color:var(--text-secondary);min-width:130px;">
          <span style="font-size:0.68rem;font-weight:700;text-transform:uppercase;color:var(--text-tertiary);">
            OJT Coordinator${Array.isArray(t.coordinators) && t.coordinators.length > 1 ? `s (${t.coordinators.length})` : ''}
          </span>
          <span style="font-weight:600;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:140px;" title="${escapeHtml((Array.isArray(t.coordinators) && t.coordinators.length ? t.coordinators.map(c => `${c.name}${c.email ? ` (${c.email})` : ''}`).join(', ') : sup.name) || 'Faculty Mentor')}">
            ${escapeHtml(sup.name || (Array.isArray(t.coordinators) && t.coordinators[0]?.name) || 'Faculty Mentor')}
          </span>
          ${(sup.email || (Array.isArray(t.coordinators) && t.coordinators[0]?.email)) ? `
            <span style="font-size:0.66rem;color:var(--text-tertiary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:140px;">
              ${escapeHtml(sup.email || t.coordinators[0]?.email)}
            </span>
          ` : ''}
        </div>

        <!-- Right: Actions -->
        <div class="co-trainee-row__actions" style="display:flex;align-items:center;gap:6px;flex-shrink:0;" onclick="event.stopPropagation();">
          ${actionBtn}
          <button class="btn btn--outline btn--sm btn-open-trainee-dtr" data-student-id="${st.id}" data-trainee-id="${t.id}" title="View Student Daily Time Record (DTR)" style="padding:4px 9px;font-size:0.75rem;gap:4px;color:var(--color-primary, #005930);border-color:rgba(0,89,48,0.28);font-weight:600;">
            ${icon('clock', 13)} DTR
          </button>
          <button class="btn btn--ghost btn--sm btn-inspect-trainee" data-trainee-id="${t.id}" title="Inspect Intern Dossier" style="padding:4px 8px;font-size:0.75rem;">
            ${icon('eye', 13)} Dossier
          </button>
          <button
            type="button"
            class="btn btn--ghost btn--sm btn-trainee-coord-chat"
            data-trainee-id="${t.id}"
            title="View Coordinator Contact Info & Message Coordinator"
            style="color:var(--color-primary, #005930);padding:4px 8px;font-size:0.75rem;"
          >
            ${icon('award', 13)} Coordinator${Array.isArray(t.coordinators) && t.coordinators.length > 1 ? ` (${t.coordinators.length})` : ''}
          </button>
          <button
            type="button"
            class="btn btn--ghost btn--sm"
            onclick="window.openChat && window.openChat('ojt_interest_${t.interest_id || t.id}')"
            title="Message Intern"
            style="color:var(--color-primary, #005930);padding:4px 8px;font-size:0.75rem;"
          >
            ${icon('messageCircle', 13)} Intern
          </button>
        </div>
      </div>
    `;
  }

  // Attach event listeners to trainee rows and action buttons
  function attachTraineeActionListeners(rootEl) {
    const allFlat = getAllTraineesFlat(rawData);

    // Row click -> Inspect Dossier
    rootEl.querySelectorAll('[data-trainee-id]').forEach(el => {
      el.addEventListener('click', (e) => {
        // Prevent if clicked directly on a button or link
        if (e.target.closest('button') || e.target.closest('a')) return;
        const tId = parseInt(el.getAttribute('data-trainee-id'));
        const target = allFlat.find(t => t.id === tId);
        if (target) inspectTrainee(target);
      });
    });

    rootEl.querySelectorAll('.btn-inspect-trainee').forEach(btn => {
      btn.addEventListener('click', () => {
        const tId = parseInt(btn.getAttribute('data-trainee-id'));
        const target = allFlat.find(t => t.id === tId);
        if (target) inspectTrainee(target);
      });
    });

    rootEl.querySelectorAll('.btn-trainee-coord-chat').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const tId = parseInt(btn.getAttribute('data-trainee-id'));
        const target = allFlat.find(t => t.id === tId);
        if (!target) return;
        const st = target.student || {};
        const sup = target.supervisor || {};
        const coords = Array.isArray(target.coordinators) && target.coordinators.length > 0
          ? target.coordinators
          : (sup.id ? [sup] : []);
        if (window.openCoordinatorSelector) {
          window.openCoordinatorSelector({
            studentName: st.name || 'Intern',
            course: st.program || '',
            coordinators: coords,
            endorsedById: target.endorsed_by || sup.id || null,
          });
        } else if (window.openCoordinatorChat) {
          window.openCoordinatorChat(target.endorsed_by || sup.id || 0);
        }
      });
    });

    // Open DTR Table Modal button
    rootEl.querySelectorAll('.btn-open-trainee-dtr').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const studentId = parseInt(btn.getAttribute('data-student-id'));
        const tId = parseInt(btn.getAttribute('data-trainee-id'));
        const target = allFlat.find(t => t.id === tId || t.student?.id === studentId);
        if (studentId) {
          openCompanyTraineeDtrModal(studentId, target);
        }
      });
    });

    // Complete evaluation button
    rootEl.querySelectorAll('.btn-trigger-eval').forEach(btn => {
      btn.addEventListener('click', () => {
        const evalId = btn.getAttribute('data-eval-id');
        if (evalId) openCompanyEvaluationModal(evalId, () => loadData());
      });
    });

    // View submitted scorecard
    rootEl.querySelectorAll('.btn-view-eval-scorecard').forEach(btn => {
      btn.addEventListener('click', () => {
        const evalId = btn.getAttribute('data-eval-id');
        if (evalId) openCompanyViewSubmittedModal(evalId);
      });
    });

    // Emergency exit clearance button
    rootEl.querySelectorAll('.btn-emergency-clearance').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const tId = parseInt(btn.getAttribute('data-trainee-id'));
        const target = allFlat.find(t => t.id === tId);
        if (target && target.emergency_request) {
          openCompanyEmergencyClearanceModal(target.emergency_request, target, () => loadData());
        }
      });
    });
  }

  // =========================================================================
  // LIVE TRAINEE DOSSIER (INSPECTOR DRAWER)
  // =========================================================================

  function inspectTrainee(trainee) {
    selectedTraineeForDossier = trainee;
    dossierPane.classList.add('co-dossier-pane--visible');
    if (dossierBackdrop) dossierBackdrop.classList.add('co-dossier-backdrop--visible');

    // Highlight row
    container.querySelectorAll('.is-active-inspected').forEach(el => el.classList.remove('is-active-inspected'));
    container.querySelectorAll(`[data-trainee-id="${trainee.id}"]`).forEach(el => el.classList.add('is-active-inspected'));

    renderDossierContent(trainee);
  }

  function closeDossier() {
    selectedTraineeForDossier = null;
    dossierPane.classList.remove('co-dossier-pane--visible');
    if (dossierBackdrop) dossierBackdrop.classList.remove('co-dossier-backdrop--visible');
    container.querySelectorAll('.is-active-inspected').forEach(el => el.classList.remove('is-active-inspected'));
  }

  btnDossierClose.addEventListener('click', closeDossier);
  if (dossierBackdrop) dossierBackdrop.addEventListener('click', closeDossier);

  function renderDossierContent(t) {
    const st = t.student || {};
    const sup = t.supervisor || {};
    const coords = Array.isArray(t.coordinators) && t.coordinators.length > 0
      ? t.coordinators
      : (sup.id ? [{ ...sup, is_endorser: true }] : []);
    const p = t.parentPosting || {};
    const init = (st.name || 'Student').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const completed = t.completed_hours || 0;
    const required = t.required_hours || 486;
    const pct = required > 0 ? Math.min(100, Math.round((completed / required) * 100)) : 0;
    const barColor = pct >= 100 ? 'var(--color-primary, #005930)' : '#10B981';

    let actionSectionHtml = '';
    if (t.evaluation?.status === 'pending') {
      actionSectionHtml = `
        <div style="background:#FFFBEB;border:1px solid rgba(245,158,11,0.3);border-radius:10px;padding:14px;text-align:center;">
          <div style="color:#B45309;font-weight:700;font-size:0.85rem;margin-bottom:4px;display:flex;align-items:center;justify-content:center;gap:6px;">
            ★ Official Performance Appraisal Required
          </div>
          <p style="font-size:0.75rem;color:var(--text-secondary);margin:0 0 10px;">
            The academic coordinator has dispatched this evaluation for your review. Your ratings are essential for certifying this intern's practicum.
          </p>
          <button class="btn btn--primary btn--sm" id="btn-dossier-eval-action" style="width:100%;background:#F59E0B;border-color:#F59E0B;color:#fff;font-weight:700;font-size:0.82rem;">
            ★ Complete Appraisal Now
          </button>
        </div>`;
    } else if (t.evaluation?.status === 'submitted') {
      actionSectionHtml = `
        <div style="background:#F0F7F4;border:1px solid rgba(0,89,48,0.25);border-radius:10px;padding:14px;text-align:center;">
          <div style="font-size:0.7rem;font-weight:700;text-transform:uppercase;color:var(--color-primary, #005930);">Official Rating Certified</div>
          <div style="display:flex;align-items:baseline;justify-content:center;gap:6px;margin:4px 0;">
            <span style="font-size:1.8rem;font-weight:800;color:var(--color-primary, #005930);">${Number(t.evaluation.overall_score || 5.0).toFixed(1)}</span>
            <span style="font-size:0.95rem;color:var(--text-secondary);font-weight:600;">/ 5.00</span>
          </div>
          <div style="font-size:0.74rem;color:var(--text-secondary);margin-bottom:10px;">
            Submitted on ${t.evaluation.submitted_at || '—'}
          </div>
          <button class="btn btn--outline btn--sm" id="btn-dossier-view-scorecard" style="width:100%;font-size:0.78rem;">
            View Submitted Scorecard
          </button>
        </div>`;
    } else if (completed >= required) {
      actionSectionHtml = `
        <div style="background:#F0F7F4;border:1px solid rgba(0,89,48,0.2);border-radius:10px;padding:12px;text-align:center;">
          <div style="color:var(--color-primary, #005930);font-weight:700;font-size:0.82rem;margin-bottom:2px;">
            ✓ 100% Practicum Hours Rendered
          </div>
          <div style="font-size:0.74rem;color:var(--text-secondary);">
            Awaiting evaluation dispatch from CHMSU Academic Coordinator.
          </div>
        </div>`;
    }

    const dtr = t.today_dtr || {};
    const dtrLocBadge = dtr.location_validity === 'In Site'
      ? `<span style="display:inline-flex;align-items:center;gap:3px;padding:2px 7px;border-radius:99px;font-size:0.68rem;font-weight:700;background:#ECFDF5;color:#047857;border:1px solid #A7F3D0;">✓ In Site${dtr.distance_meters != null ? ` (${dtr.distance_meters}m)` : ''}</span>`
      : (dtr.location_validity === 'Too Far'
        ? `<span style="display:inline-flex;align-items:center;gap:3px;padding:2px 7px;border-radius:99px;font-size:0.68rem;font-weight:700;background:#FEF2F2;color:#B91C1C;border:1px solid #FECACA;">⚠ Too Far${dtr.distance_meters != null ? ` (${dtr.distance_meters}m)` : ''}</span>`
        : '');

    dossierBody.innerHTML = `
      <!-- Hero Header -->
      <div class="co-dossier__hero">
        <div class="co-dossier__avatar">${init}</div>
        <div style="min-width:0;flex:1;">
          <div style="font-weight:700;font-size:0.96rem;color:var(--text-primary);">${escapeHtml(st.name || 'Intern')}</div>
          <div style="font-size:0.76rem;color:var(--text-secondary);margin-top:2px;">
            ${escapeHtml(st.program || '—')} ${st.year_level ? `&bull; ${escapeHtml(st.year_level)}` : ''}
          </div>
          <div style="font-size:0.72rem;font-family:monospace;color:var(--text-tertiary);margin-top:1px;">
            Student ID: ${escapeHtml(st.student_id || '—')}
          </div>
        </div>
      </div>

      <!-- Action Button Box (if applicable) -->
      ${actionSectionHtml}

      ${t.emergency_request ? `
        <!-- Emergency Notice & Company Clearance Box -->
        <div class="co-dossier__box" style="background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.3);border-left:4px solid #f59e0b;">
          <div class="co-dossier__box-title" style="color:#b45309;display:flex;align-items:center;justify-content:space-between;">
            <span style="display:inline-flex;align-items:center;gap:5px;">
              ${icon('alertTriangle', 13)} Emergency Notice
            </span>
            <span class="badge ${t.emergency_request.company_status === 'cleared' ? 'badge--success' : 'badge--warning'}" style="font-size:0.65rem;padding:2px 6px;">
              ${t.emergency_request.company_status === 'cleared' ? 'Exit Cleared' : 'Exit Clearance Pending'}
            </span>
          </div>
          <div style="font-size:0.75rem;color:var(--text-secondary);margin-top:4px;">
            Category: <strong>${(t.emergency_request.category || '').replace(/_/g, ' ').toUpperCase()}</strong> &bull; ${t.emergency_request.type === 'permanent_withdrawal' ? 'Permanent Stoppage' : 'Leave Notice'}
          </div>
          ${t.emergency_request.reason ? `
            <div style="font-size:0.74rem;color:var(--text-primary);margin-top:5px;font-style:italic;background:var(--bg-card);padding:6px 8px;border-radius:4px;border:1px solid #E2E8F0;">
              &ldquo;${escapeHtml(t.emergency_request.reason)}&rdquo;
            </div>
          ` : ''}
          <div style="margin-top:8px;padding-top:8px;border-top:1px dashed rgba(245,158,11,0.3);display:flex;align-items:center;justify-content:space-between;gap:8px;">
            <span style="font-size:0.72rem;color:var(--text-secondary);">
              Assets Returned: <strong>${t.emergency_request.assets_returned ? 'Yes ✓' : 'Pending ⏳'}</strong>
            </span>
            <button class="btn btn--outline btn--xs" id="btn-dossier-clearance" style="font-size:0.72rem;padding:3px 8px;color:#b45309;border-color:rgba(245,158,11,0.4);">
              ${icon('checkSquare', 11)} Exit Clearance
            </button>
          </div>
        </div>
      ` : ''}

      <!-- Practicum Progress Box -->
      <div class="co-dossier__box">
        <div class="co-dossier__box-title">${icon('checkCircle', 13)} Practicum Completion</div>
        <div class="co-hours-gauge" style="margin-bottom:6px;">
          <div class="co-hours-gauge__track" style="height:6px;">
            <div class="co-hours-gauge__fill" style="width:${pct}%;background:${barColor};"></div>
          </div>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:0.75rem;color:var(--text-secondary);">
          <span>Completed: <strong>${completed} hrs</strong></span>
          <span>Requirement: <strong>${required} hrs</strong></span>
        </div>
      </div>

      <!-- Daily Time Record (DTR) & Attendance Box -->
      <div class="co-dossier__box" style="background:linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%);border:1px solid rgba(0,89,48,0.2);">
        <div class="co-dossier__box-title" style="display:flex;align-items:center;justify-content:space-between;">
          <span style="display:inline-flex;align-items:center;gap:5px;color:var(--color-primary, #005930);">
            ${icon('clock', 13)} Daily Time Record (DTR)
          </span>
          <span style="font-size:0.68rem;font-weight:700;color:var(--text-secondary);">
            ${dtr.total_logs_count || 0} Day${(dtr.total_logs_count || 0) === 1 ? '' : 's'} Logged
          </span>
        </div>

        <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;flex-wrap:wrap;margin:6px 0 8px;">
          ${renderTodayDtrBadge(dtr)}
          ${dtrLocBadge}
        </div>

        ${dtr.logged_today ? `
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;background:#fff;border:1px solid #E2E8F0;border-radius:8px;padding:8px 10px;font-size:0.72rem;margin-bottom:10px;">
            <div>
              <span style="color:var(--text-tertiary);display:block;font-size:0.65rem;text-transform:uppercase;">Morning Shift</span>
              <span style="font-weight:600;color:var(--text-primary);">${dtr.morning_in || dtr.time_in || '—'} &ndash; ${dtr.morning_out || '—'}</span>
            </div>
            <div>
              <span style="color:var(--text-tertiary);display:block;font-size:0.65rem;text-transform:uppercase;">Afternoon Shift</span>
              <span style="font-weight:600;color:var(--text-primary);">${dtr.afternoon_in || '—'} &ndash; ${dtr.afternoon_out || '—'}</span>
            </div>
          </div>
        ` : ''}

        <button type="button" class="btn btn--primary btn--sm" id="btn-dossier-open-dtr" style="width:100%;gap:6px;font-size:0.78rem;font-weight:600;">
          ${icon('clipboardList', 13)} View Full DTR Table
        </button>
      </div>

      <!-- Assigned Role & Position -->
      <div class="co-dossier__box">
        <div class="co-dossier__box-title">${icon('briefcase', 13)} Assigned Position</div>
        <div style="font-weight:700;font-size:0.88rem;color:var(--text-primary);">${escapeHtml(p.title || 'OJT Role')}</div>
        <div style="font-size:0.75rem;color:var(--text-secondary);margin-top:2px;">
          ${escapeHtml(p.department || 'General')} ${p.location ? `&bull; ${escapeHtml(p.location.split(',')[0])}` : ''}
        </div>
      </div>

      <!-- Work Schedule & Shift Rules -->
      <div class="co-dossier__box">
        <div class="co-dossier__box-title">${icon('calendar', 13)} Work Terms & Schedule</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:0.75rem;">
          <div>
            <span style="color:var(--text-tertiary);display:block;font-size:0.68rem;text-transform:uppercase;">Working Days</span>
            <span style="font-weight:600;color:var(--text-primary);">${Array.isArray(t.schedule_days) && t.schedule_days.length ? t.schedule_days.join(', ') : 'Mon, Tue, Wed, Thu, Fri'}</span>
          </div>
          <div>
            <span style="color:var(--text-tertiary);display:block;font-size:0.68rem;text-transform:uppercase;">Daily Shift</span>
            <span style="font-weight:600;color:var(--text-primary);">${t.shift_start || '08:00'} &ndash; ${t.shift_end || '17:00'}</span>
          </div>
          <div>
            <span style="color:var(--text-tertiary);display:block;font-size:0.68rem;text-transform:uppercase;">Lunch Break</span>
            <span style="color:var(--text-secondary);">${t.has_lunch_break !== false ? `${t.lunch_start || '12:00'} – ${t.lunch_end || '13:00'} (1h)` : 'None'}</span>
          </div>
          <div>
            <span style="color:var(--text-tertiary);display:block;font-size:0.68rem;text-transform:uppercase;">Target End Date</span>
            <span style="font-weight:600;color:var(--color-primary, #005930);">${t.estimated_end_date || 'Calculated automatically'}</span>
          </div>
        </div>

        ${t.ojt_instructions ? `
          <div style="margin-top:10px;padding-top:8px;border-top:1px solid var(--border-light, #E2E8F0);font-size:0.74rem;color:var(--text-secondary);">
            <strong>Reporting Notes:</strong> "${escapeHtml(t.ojt_instructions)}"
          </div>` : ''}
      </div>

      <!-- Academic Coordinator(s) & Contact Info -->
      <div class="co-dossier__box">
        <div class="co-dossier__box-title" style="display:flex;align-items:center;justify-content:space-between;gap:6px;">
          <span style="display:inline-flex;align-items:center;gap:5px;">
            ${icon('shield', 13)} Course OJT Coordinator${coords.length > 1 ? `s (${coords.length})` : ''}
          </span>
          <span style="font-size:0.66rem;color:var(--color-primary, #005930);font-weight:700;">
            ✓ Endorsed
          </span>
        </div>
        ${coords.length > 0 ? `
          <div style="display:flex;flex-direction:column;gap:8px;margin-top:6px;">
            ${coords.map(c => `
              <div style="padding:8px 10px;border-radius:8px;background:var(--bg-elevated, #F8FAFC);border:1px solid ${c.is_endorser ? 'rgba(0,89,48,0.35)' : 'var(--border-light, #E2E8F0)'};">
                <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:6px;">
                  <div style="min-width:0;flex:1;">
                    <div style="display:flex;align-items:center;gap:5px;flex-wrap:wrap;">
                      <span style="font-weight:700;font-size:0.82rem;color:var(--text-primary);">${escapeHtml(c.name || 'Faculty Coordinator')}</span>
                      ${c.is_endorser ? `<span style="font-size:0.6rem;font-weight:700;padding:1px 5px;border-radius:99px;background:#005930;color:#fff;text-transform:uppercase;">Endorsing</span>` : ''}
                      ${c.course ? `<span style="font-size:0.62rem;font-weight:700;padding:1px 5px;border-radius:4px;background:rgba(0,89,48,0.1);color:var(--color-primary, #005930);">${escapeHtml(c.course)}</span>` : ''}
                    </div>
                    <div style="font-size:0.71rem;color:var(--text-secondary);margin-top:1px;">${escapeHtml(c.position || 'CHMSU Practicum Coordinator')}</div>
                  </div>
                  <button
                    type="button"
                    class="btn btn--outline btn--xs btn-dossier-direct-coord"
                    data-coord-id="${c.id}"
                    style="padding:3px 8px;font-size:0.7rem;color:var(--color-primary, #005930);border-color:rgba(0,89,48,0.3);flex-shrink:0;"
                    title="Message ${escapeHtml(c.name || 'Coordinator')}"
                  >
                    ${icon('messageCircle', 11)} Chat
                  </button>
                </div>
                <div style="display:flex;flex-direction:column;gap:2px;margin-top:5px;padding-top:5px;border-top:1px dashed var(--border-light, #E2E8F0);font-size:0.71rem;color:var(--text-secondary);">
                  ${c.email ? `<a href="mailto:${escapeHtml(c.email)}" style="color:var(--color-primary, #005930);text-decoration:none;display:inline-flex;align-items:center;gap:4px;word-break:break-all;">${icon('mail', 11)} ${escapeHtml(c.email)}</a>` : ''}
                  ${c.phone ? `<a href="tel:${escapeHtml(c.phone)}" style="color:var(--text-secondary);text-decoration:none;display:inline-flex;align-items:center;gap:4px;">${icon('phone', 11)} ${escapeHtml(c.phone)}</a>` : ''}
                </div>
              </div>
            `).join('')}
          </div>
        ` : `
          <div style="font-weight:700;font-size:0.85rem;color:var(--text-primary);">${escapeHtml(sup.name || 'Faculty Coordinator')}</div>
          <div style="font-size:0.74rem;color:var(--text-secondary);">${escapeHtml(sup.position || 'CHMSU Practicum Coordinator')}</div>
          ${sup.email ? `<div style="font-size:0.72rem;color:var(--text-tertiary);margin-top:2px;">${escapeHtml(sup.email)}</div>` : ''}
        `}
      </div>

      <!-- Quick Communication -->
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <button
          type="button"
          class="btn btn--outline btn--sm"
          id="btn-dossier-chat"
          style="flex:1;min-width:130px;gap:6px;font-size:0.78rem;"
        >
          ${icon('messageCircle', 13)} Message Intern
        </button>
        <button
          type="button"
          class="btn btn--outline btn--sm"
          id="btn-dossier-chat-coord"
          style="flex:1;min-width:145px;gap:6px;font-size:0.78rem;color:var(--color-primary, #005930);"
          title="Choose or Message University OJT Coordinator"
        >
          ${icon('award', 13)} ${coords.length > 1 ? `Choose Coordinator (${coords.length})` : 'Message Coordinator'}
        </button>
        ${st.email ? `
          <a href="mailto:${st.email}" class="btn btn--ghost btn--sm" style="gap:6px;font-size:0.78rem;" title="Send Direct Email">
            ${icon('mail', 13)}
          </a>` : ''}
      </div>
    `;

    // Dossier actions listeners
    dossierBody.querySelector('#btn-dossier-eval-action')?.addEventListener('click', () => {
      if (t.evaluation?.id) openCompanyEvaluationModal(t.evaluation.id, () => loadData());
    });

    dossierBody.querySelector('#btn-dossier-view-scorecard')?.addEventListener('click', () => {
      if (t.evaluation?.id) openCompanyViewSubmittedModal(t.evaluation.id);
    });

    dossierBody.querySelector('#btn-dossier-open-dtr')?.addEventListener('click', () => {
      if (st.id) openCompanyTraineeDtrModal(st.id, t);
    });

    dossierBody.querySelector('#btn-dossier-chat')?.addEventListener('click', () => {
      if (window.openChat) window.openChat(`ojt_interest_${t.interest_id || t.id}`);
    });

    dossierBody.querySelectorAll('.btn-dossier-direct-coord').forEach(btn => {
      btn.addEventListener('click', () => {
        const coordId = parseInt(btn.getAttribute('data-coord-id'), 10);
        if (coordId && window.openCoordinatorChat) {
          window.openCoordinatorChat(coordId);
        }
      });
    });

    dossierBody.querySelector('#btn-dossier-chat-coord')?.addEventListener('click', () => {
      if (window.openCoordinatorSelector) {
        window.openCoordinatorSelector({
          studentName: st.name || 'Intern',
          course: st.program || '',
          coordinators: coords,
          endorsedById: t.endorsed_by || sup.id || null,
        });
      } else if (window.openCoordinatorChat) {
        window.openCoordinatorChat(t.endorsed_by || sup.id || 0);
      }
    });

    dossierBody.querySelector('#btn-dossier-clearance')?.addEventListener('click', () => {
      if (t.emergency_request) {
        openCompanyEmergencyClearanceModal(t.emergency_request, t, () => loadData());
      }
    });
  }

  // =========================================================================
  // CONTROLS & EVENT LISTENERS
  // =========================================================================

  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderActiveView();
  });

  stageFilterSelect.addEventListener('change', (e) => {
    activeStageFilter = e.target.value;
    updatePulseActiveCard(activeStageFilter);
    renderActiveView();
  });

  deptFilterSelect.addEventListener('change', (e) => {
    activeDeptFilter = e.target.value;
    renderActiveView();
  });

  sortFilterSelect.addEventListener('change', (e) => {
    activeSortBy = e.target.value;
    renderActiveView();
  });

  // Pulse card clicking filters the view
  pulseCards.forEach(card => {
    card.addEventListener('click', () => {
      const filter = card.getAttribute('data-pulse-filter');
      if (filter === 'postings') {
        setViewMode('departments');
        stageFilterSelect.value = 'all';
        activeStageFilter = 'all';
      } else {
        stageFilterSelect.value = filter;
        activeStageFilter = filter;
      }
      updatePulseActiveCard(filter);
      renderActiveView();
    });
  });

  function updatePulseActiveCard(activeVal) {
    pulseCards.forEach(card => {
      card.classList.toggle('co-pulse-card--active', card.getAttribute('data-pulse-filter') === activeVal);
    });
  }

  // Ribbon "View Action Items" button
  btnRibbonFilter.addEventListener('click', () => {
    stageFilterSelect.value = 'action_required';
    activeStageFilter = 'action_required';
    updatePulseActiveCard('action_required');
    renderActiveView();
  });

  container.querySelector('#btn-refresh-trainees').addEventListener('click', () => {
    apiCache.invalidate(['/company/ojt-trainees*']);
    loadData();
  });

  // Real-time refresh when student logs time-in / time-out or OJT status changes
  if (window.__coTraineesRefreshHandler) {
    window.removeEventListener('hireme:ojt-trainees-refresh', window.__coTraineesRefreshHandler);
  }
  window.__coTraineesRefreshHandler = () => {
    if (!document.body.contains(container)) return;
    apiCache.invalidate(['/company/ojt-trainees*']);
    loadData();
    if (window.__activeCompanyDtrModal && typeof window.__activeCompanyDtrModal.refresh === 'function') {
      window.__activeCompanyDtrModal.refresh();
    }
  };
  window.addEventListener('hireme:ojt-trainees-refresh', window.__coTraineesRefreshHandler);

  if (window.__coOpenStudentDtrHandler) {
    window.removeEventListener('hireme:open-student-dtr', window.__coOpenStudentDtrHandler);
  }
  window.__coOpenStudentDtrHandler = (e) => {
    if (!document.body.contains(container)) return;
    const studentId = parseInt(e.detail?.studentId || sessionStorage.getItem('co_open_dtr_student_id'));
    if (studentId) {
      sessionStorage.removeItem('co_open_dtr_student_id');
      const allFlat = getAllTraineesFlat(rawData);
      const target = allFlat.find(t => t.student?.id === studentId);
      openCompanyTraineeDtrModal(studentId, target);
    }
  };
  window.addEventListener('hireme:open-student-dtr', window.__coOpenStudentDtrHandler);

  if (window.__coOpenCompanyEvalHandler) {
    window.removeEventListener('hireme:open-company-eval', window.__coOpenCompanyEvalHandler);
  }
  window.__coOpenCompanyEvalHandler = (e) => {
    if (!document.body.contains(container)) return;
    const evalId = parseInt(e.detail?.evaluationId || sessionStorage.getItem('co_open_eval_id'));
    if (evalId) {
      sessionStorage.removeItem('co_open_eval_id');
      openCompanyEvaluationModal(evalId, () => loadData());
    }
  };
  window.addEventListener('hireme:open-company-eval', window.__coOpenCompanyEvalHandler);

  // =========================================================================
  // BOOTSTRAP INITIAL LOAD
  // =========================================================================
  loadData().then(() => {
    const pendingDtrStudentId = parseInt(sessionStorage.getItem('co_open_dtr_student_id'));
    if (pendingDtrStudentId) {
      sessionStorage.removeItem('co_open_dtr_student_id');
      const allFlat = getAllTraineesFlat(rawData);
      const target = allFlat.find(t => t.student?.id === pendingDtrStudentId);
      openCompanyTraineeDtrModal(pendingDtrStudentId, target);
    }
    const pendingEvalId = parseInt(sessionStorage.getItem('co_open_eval_id'));
    if (pendingEvalId) {
      sessionStorage.removeItem('co_open_eval_id');
      openCompanyEvaluationModal(pendingEvalId, () => loadData());
    }
  });
}

// =========================================================================
// EVALUATION MODALS (PRESERVED & ENHANCED)
// =========================================================================

/**
 * Company Evaluation Modal: Interactive form to rate trainee, answer MCQs, and input feedback
 */
async function openCompanyEvaluationModal(evalId, onComplete) {
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop modal-backdrop--visible';
  backdrop.style.cssText = `
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(15, 23, 42, 0.65); backdrop-filter: blur(4px);
    z-index: 99999; display: flex; align-items: center; justify-content: center;
    padding: 20px; box-sizing: border-box; animation: fadeIn 0.15s ease-out;
  `;
  backdrop.innerHTML = `
    <div class="modal modal--visible" style="max-width:740px;border-radius:14px;overflow:hidden;background:#fff;">
      <div style="padding:40px;text-align:center;">
        <div class="skeleton" style="height:28px;width:240px;margin:0 auto 14px;"></div>
        <div class="skeleton skeleton--card" style="height:240px;"></div>
      </div>
    </div>
  `;
  document.body.appendChild(backdrop);

  try {
    const res = await apiGet(`/company/evaluations/${evalId}`, { forceRefresh: true });
    if (!res?.success || !res.data) throw new Error('Could not load evaluation form.');

    const ev = res.data;
    const st = ev.student || {};
    const questions = ev.template?.questions || [];

    const scaleLabels = {
      1: 'Poor / Unsatisfactory',
      2: 'Fair / Needs Improvement',
      3: 'Satisfactory / Competent',
      4: 'Very Good / Exceeds Target',
      5: 'Excellent / Outstanding',
    };

    const termTitle = ev.term === 'midterm' ? 'Midterm OJT Performance Appraisal' : 'Final / Endterm Performance Appraisal';
    const termBadge = ev.term === 'midterm'
      ? `<span class="badge" style="background:#EFF6FF;color:#1D4ED8;border:1px solid #BFDBFE;font-size:0.7rem;font-weight:700;padding:2px 8px;margin-left:8px;">MIDTERM (50% WEIGHT)</span>`
      : `<span class="badge" style="background:#ECFDF5;color:#047857;border:1px solid #A7F3D0;font-size:0.7rem;font-weight:700;padding:2px 8px;margin-left:8px;">FINAL (50% WEIGHT)</span>`;

    backdrop.innerHTML = `
      <div class="modal modal--visible co-eval-modal" style="max-width:780px;border-radius:14px;overflow:hidden;background:#fff;box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);max-height:90vh;display:flex;flex-direction:column;">
        <!-- Header -->
        <div class="modal__header" style="border-bottom:1px solid #E2E8F0;background:#FAFBFD;padding:18px 24px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:42px;height:42px;border-radius:10px;background:rgba(245,158,11,0.12);color:#B45309;display:flex;align-items:center;justify-content:center;font-size:1.3rem;font-weight:700;">
              ★
            </div>
            <div>
              <div style="display:flex;align-items:center;">
                <h3 class="modal__title" style="margin:0;font-size:1.15rem;font-weight:700;">${termTitle}</h3>
                ${termBadge}
              </div>
              <p style="font-size:0.8rem;color:var(--text-secondary);margin:2px 0 0;">
                Evaluating <strong>${escapeHtml(st.name || 'Intern')}</strong> &bull; ${escapeHtml(st.program || '')} &bull; ${ev.ojt?.completed_hours}/${ev.ojt?.required_hours}h completed
              </p>
            </div>
          </div>
          <button class="modal__close" id="comp-eval-close">${icon('x', 18)}</button>
        </div>

        <!-- Body -->
        <div class="modal__body" style="flex:1;overflow-y:auto;padding:24px;">
          <!-- Trainee Card Summary -->
          <div style="background:#FAFBFD;border:1px solid #E2E8F0;border-radius:8px;padding:14px 18px;margin-bottom:20px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;">
            <div>
              <div style="font-size:0.72rem;font-weight:700;color:var(--text-secondary);text-transform:uppercase;">Practicum Role</div>
              <div style="font-weight:700;font-size:0.92rem;color:var(--text-primary);">${escapeHtml(ev.posting?.title || 'OJT Intern')}</div>
            </div>
            <div>
              <div style="font-size:0.72rem;font-weight:700;color:var(--text-secondary);text-transform:uppercase;">Completed Hours</div>
              <div style="font-weight:700;font-size:0.92rem;color:var(--color-primary, #005930);">${ev.ojt?.completed_hours} / ${ev.ojt?.required_hours} Hours</div>
            </div>
            <div>
              <div style="font-size:0.72rem;font-weight:700;color:var(--text-secondary);text-transform:uppercase;">Training Duration</div>
              <div style="font-size:0.84rem;color:var(--text-primary);font-weight:600;">${ev.ojt?.start_date || '—'} &ndash; ${ev.ojt?.end_date || 'Present'}</div>
            </div>
          </div>

          <p class="text-sm text-secondary" style="margin:0 0 20px;line-height:1.5;">
            ${escapeHtml(ev.template?.description || 'Please provide an objective appraisal of the trainee’s competencies, attendance, workplace attitude, and performance outputs during their OJT assignment.')}
          </p>

          <!-- Dynamic Questions List -->
          <form id="company-eval-form">
            ${questions.map((q, idx) => {
              return `
                <div class="eval-q-card" data-qid="${q.id}" data-type="${q.question_type}" data-required="${q.is_required ? 'true' : 'false'}" style="background:#ffffff;border:1px solid #E2E8F0;border-radius:8px;padding:16px 18px;margin-bottom:14px;">
                  <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
                    <span style="font-size:0.72rem;font-weight:700;color:var(--color-primary, #005930);text-transform:uppercase;letter-spacing:0.04em;">${escapeHtml(q.category || 'Competency Criteria')}</span>
                    ${q.is_required ? '<span style="color:var(--color-error);font-size:0.7rem;font-weight:700;">* Required</span>' : '<span style="color:var(--text-tertiary);font-size:0.7rem;">Optional</span>'}
                  </div>
                  <div style="font-weight:600;font-size:0.9rem;color:var(--text-primary);line-height:1.4;margin-bottom:12px;">
                    ${idx + 1}. ${escapeHtml(q.question_text)}
                  </div>

                  ${q.question_type === 'rating' ? `
                    <div class="star-rating-control" data-qid="${q.id}" style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                      <div class="star-buttons-wrap" style="display:flex;gap:5px;">
                        ${[1, 2, 3, 4, 5].map(starNum => `
                          <button type="button" class="eval-star-btn" data-val="${starNum}" style="width:38px;height:38px;border-radius:6px;border:1px solid #CBD5E1;background:#fff;font-size:1.15rem;color:#94A3B8;cursor:pointer;transition:all 0.15s ease;">
                            ★
                          </button>
                        `).join('')}
                      </div>
                      <span class="rating-label-display" style="font-size:0.84rem;font-weight:700;color:var(--color-primary, #005930);margin-left:8px;">
                        Select score (1–5)
                      </span>
                      <input type="hidden" class="q-rating-input" name="rating_${q.id}" value="" />
                    </div>
                  ` : q.question_type === 'multiple_choice' ? `
                    <div class="mcq-options-control" style="display:flex;flex-direction:column;gap:8px;">
                      ${(q.options || []).map(opt => `
                        <label style="display:flex;align-items:center;gap:10px;padding:8px 12px;background:#FAFBFD;border:1px solid #E2E8F0;border-radius:6px;cursor:pointer;font-size:0.85rem;color:var(--text-primary);">
                          <input type="radio" name="mcq_${q.id}" value="${escapeHtml(opt)}" style="width:16px;height:16px;" />
                          <span>${escapeHtml(opt)}</span>
                        </label>
                      `).join('')}
                    </div>
                  ` : `
                    <div>
                      <textarea class="form-textarea q-text-input" name="text_${q.id}" rows="3" placeholder="Enter specific observations or qualitative feedback..." style="width:100%;padding:10px 12px;border:1px solid #CBD5E1;border-radius:6px;resize:vertical;font-family:inherit;font-size:0.85rem;"></textarea>
                    </div>
                  `}
                </div>
              `;
            }).join('')}

            <!-- Overall Recommendation -->
            <div style="background:#ffffff;border:1px solid #E2E8F0;border-radius:8px;padding:16px 18px;margin-bottom:14px;">
              <label style="font-weight:700;font-size:0.86rem;color:var(--text-primary);display:block;margin-bottom:6px;">
                Overall Employment Endorsement / Recommendation
              </label>
              <select class="form-select" id="eval-recommendation-select" style="width:100%;padding:8px 12px;border:1px solid #CBD5E1;border-radius:6px;font-size:0.85rem;">
                <option value="Highly Recommended - Ready for immediate employment">Highly Recommended - Ready for immediate employment</option>
                <option value="Recommended - Would consider after graduation">Recommended - Would consider after graduation</option>
                <option value="Satisfactory - Completed requirements satisfactorily">Satisfactory - Completed requirements satisfactorily</option>
                <option value="Needs further preparation/training">Needs further preparation/training</option>
              </select>
            </div>

            <!-- General Feedback -->
            <div style="background:#ffffff;border:1px solid #E2E8F0;border-radius:8px;padding:16px 18px;margin-bottom:20px;">
              <label style="font-weight:700;font-size:0.86rem;color:var(--text-primary);display:block;margin-bottom:4px;">
                Summary Remarks & Advice for the Student
              </label>
              <textarea class="form-textarea" id="eval-general-feedback" rows="3" placeholder="Commendations, career guidance, or recommendations for the student's future..." style="width:100%;padding:10px 12px;border:1px solid #CBD5E1;border-radius:6px;resize:vertical;font-family:inherit;font-size:0.85rem;"></textarea>
            </div>

            <!-- Evaluator Signatory Details -->
            <div style="background:#FAFBFD;border:1px solid #E2E8F0;border-radius:8px;padding:16px 18px;margin-bottom:20px;">
              <h4 style="font-size:0.75rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--text-secondary);margin:0 0 12px;">Evaluator Signatory Block</h4>
              <div class="co-eval-signatory-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                <div>
                  <label style="font-size:0.82rem;font-weight:600;display:block;margin-bottom:4px;">Evaluator Full Name <span style="color:var(--color-error);">*</span></label>
                  <input type="text" class="form-input" id="eval-name" placeholder="e.g. Engr. Ricardo Santos" style="width:100%;padding:8px 12px;border:1px solid #CBD5E1;border-radius:6px;" />
                </div>
                <div>
                  <label style="font-size:0.82rem;font-weight:600;display:block;margin-bottom:4px;">Designation / Title <span style="color:var(--color-error);">*</span></label>
                  <input type="text" class="form-input" id="eval-pos" placeholder="e.g. Lead Engineer / HR Director" style="width:100%;padding:8px 12px;border:1px solid #CBD5E1;border-radius:6px;" />
                </div>
              </div>
            </div>
          </form>
        </div>

        <!-- Footer -->
        <div class="modal__footer" style="display:flex;justify-content:flex-end;gap:10px;padding:14px 24px;border-top:1px solid #E2E8F0;background:#FAFBFD;flex-shrink:0;">
          <button class="btn btn--outline" id="comp-eval-cancel">Cancel</button>
          <button class="btn btn--primary" id="comp-eval-submit" style="gap:6px;">
            ${icon('checkCircle', 15)} Submit Official Appraisal
          </button>
        </div>
      </div>
    `;

    // Star rating interactions
    backdrop.querySelectorAll('.star-rating-control').forEach(ctrl => {
      const buttons = ctrl.querySelectorAll('.eval-star-btn');
      const label = ctrl.querySelector('.rating-label-display');
      const hiddenInput = ctrl.querySelector('.q-rating-input');

      buttons.forEach(btn => {
        const val = parseInt(btn.dataset.val);

        btn.addEventListener('mouseenter', () => {
          buttons.forEach((b, i) => {
            b.style.color = (i + 1 <= val) ? '#F59E0B' : '#94A3B8';
          });
        });

        btn.addEventListener('mouseleave', () => {
          const current = parseInt(hiddenInput.value) || 0;
          buttons.forEach((b, i) => {
            b.style.color = (i + 1 <= current) ? '#F59E0B' : '#94A3B8';
          });
        });

        btn.addEventListener('click', () => {
          hiddenInput.value = val;
          buttons.forEach((b, i) => {
            const isFilled = (i + 1 <= val);
            b.style.color = isFilled ? '#F59E0B' : '#94A3B8';
            b.style.background = isFilled ? 'rgba(245,158,11,0.08)' : '#fff';
            b.style.borderColor = isFilled ? '#F59E0B' : '#CBD5E1';
          });
          label.textContent = `${val}/5 - ${scaleLabels[val] || ''}`;
        });
      });
    });

    const close = () => backdrop.remove();
    backdrop.querySelector('#comp-eval-close').addEventListener('click', close);
    backdrop.querySelector('#comp-eval-cancel').addEventListener('click', close);

    // Form Submission
    backdrop.querySelector('#comp-eval-submit').addEventListener('click', async () => {
      const evalName = backdrop.querySelector('#eval-name').value.trim();
      const evalPos  = backdrop.querySelector('#eval-pos').value.trim();
      const rec      = backdrop.querySelector('#eval-recommendation-select').value;
      const feedback = backdrop.querySelector('#eval-general-feedback').value.trim();

      if (!evalName || !evalPos) {
        alert('Please fill in both your Evaluator Name and Title.');
        return;
      }

      const answers = [];
      const cards = backdrop.querySelectorAll('.eval-q-card');
      let missingRequired = false;

      cards.forEach(card => {
        const qid = parseInt(card.dataset.qid);
        const type = card.dataset.type;
        const required = card.dataset.required === 'true';

        let rating_value = null;
        let text_value = null;

        if (type === 'rating') {
          const val = card.querySelector('.q-rating-input').value;
          if (val) rating_value = parseInt(val);
          if (required && !rating_value) missingRequired = true;
        } else if (type === 'multiple_choice') {
          const checked = card.querySelector(`input[name="mcq_${qid}"]:checked`);
          if (checked) text_value = checked.value;
          if (required && !text_value) missingRequired = true;
        } else {
          text_value = card.querySelector('.q-text-input')?.value?.trim() || null;
          if (required && !text_value) missingRequired = true;
        }

        answers.push({
          question_id: qid,
          rating_value,
          text_value,
        });
      });

      if (missingRequired) {
        alert('Please answer all required evaluation criteria before submitting.');
        return;
      }

      const submitBtn = backdrop.querySelector('#comp-eval-submit');
      submitBtn.disabled = true;
      submitBtn.innerHTML = `${icon('loader', 14)} Submitting...`;

      try {
        const payload = {
          evaluator_name: evalName,
          evaluator_position: evalPos,
          recommendation: rec,
          general_feedback: feedback,
          answers,
        };

        const result = await apiPost(`/company/evaluations/${evalId}/submit`, payload);

        if (result?.success) {
          backdrop.remove();
          apiCache.invalidate(['/company/ojt-trainees*']);
          alert('Performance evaluation submitted successfully! Thank you for supporting the trainee.');
          if (typeof onComplete === 'function') onComplete();
        } else {
          alert(result?.message || 'Failed to submit evaluation.');
          submitBtn.disabled = false;
          submitBtn.innerHTML = `${icon('checkCircle', 15)} Submit Official Appraisal`;
        }
      } catch (err) {
        alert(err.message || 'Error occurred while submitting evaluation.');
        submitBtn.disabled = false;
        submitBtn.innerHTML = `${icon('checkCircle', 15)} Submit Official Appraisal`;
      }
    });

  } catch (e) {
    alert(e.message || 'Failed to load evaluation.');
    backdrop.remove();
  }
}

/**
 * Read-only modal for company to view a previously submitted evaluation
 */
async function openCompanyViewSubmittedModal(evalId) {
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop modal-backdrop--visible';
  backdrop.style.cssText = `
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(15, 23, 42, 0.65); backdrop-filter: blur(4px);
    z-index: 99999; display: flex; align-items: center; justify-content: center;
    padding: 20px; box-sizing: border-box; animation: fadeIn 0.15s ease-out;
  `;
  backdrop.innerHTML = `
    <div class="modal modal--visible" style="max-width:700px;border-radius:14px;overflow:hidden;background:#fff;">
      <div style="padding:40px;text-align:center;">
        <div class="skeleton" style="height:28px;width:240px;margin:0 auto 14px;"></div>
        <div class="skeleton skeleton--card" style="height:200px;"></div>
      </div>
    </div>
  `;
  document.body.appendChild(backdrop);

  try {
    const res = await apiGet(`/company/evaluations/${evalId}`, { forceRefresh: true });
    if (!res?.success || !res.data) throw new Error('Could not load evaluation.');

    const ev = res.data;
    const st = ev.student || {};
    const answers = ev.existing_answers || [];
    const questions = ev.template?.questions || [];

    const ansMap = {};
    answers.forEach(a => { ansMap[a.evaluation_question_id] = a; });

    const termTitle = ev.term === 'midterm' ? 'Submitted Midterm OJT Appraisal' : 'Submitted Final / Endterm Appraisal';
    const termBadge = ev.term === 'midterm'
      ? `<span class="badge" style="background:#EFF6FF;color:#1D4ED8;border:1px solid #BFDBFE;font-size:0.7rem;font-weight:700;padding:2px 8px;margin-left:8px;">MIDTERM (50% WEIGHT)</span>`
      : `<span class="badge" style="background:#ECFDF5;color:#047857;border:1px solid #A7F3D0;font-size:0.7rem;font-weight:700;padding:2px 8px;margin-left:8px;">FINAL (50% WEIGHT)</span>`;

    backdrop.innerHTML = `
      <div class="modal modal--visible co-scorecard-modal" style="max-width:720px;border-radius:14px;overflow:hidden;background:#fff;box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);max-height:88vh;display:flex;flex-direction:column;">
        <div class="modal__header" style="border-bottom:1px solid #E2E8F0;background:#FAFBFD;padding:18px 24px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">
          <div>
            <div style="display:flex;align-items:center;">
              <h3 class="modal__title" style="margin:0;font-size:1.1rem;font-weight:700;">${termTitle}</h3>
              ${termBadge}
            </div>
            <p class="text-sm text-secondary" style="margin:2px 0 0;">${escapeHtml(st.name || 'Intern')} &bull; ${escapeHtml(st.program || '')}</p>
          </div>
          <button class="modal__close" id="comp-view-close">${icon('x', 18)}</button>
        </div>
        <div class="modal__body" id="print-company-eval" style="flex:1;overflow-y:auto;padding:24px;">
          <!-- Score banner -->
          <div class="co-scorecard-banner" style="display:flex;align-items:center;justify-content:space-between;background:#FAFBFD;border:1px solid #E2E8F0;border-radius:10px;padding:16px 20px;margin-bottom:20px;">
            <div>
              <div style="font-size:0.72rem;font-weight:700;text-transform:uppercase;color:var(--text-secondary);letter-spacing:0.04em;">Certified Overall Score</div>
              <div style="font-size:1.8rem;font-weight:800;color:var(--color-primary, #005930);">${Number(ev.overall_score || 5).toFixed(1)} <span style="font-size:0.9rem;color:var(--text-secondary);">/ 5.0</span></div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:0.72rem;font-weight:700;text-transform:uppercase;color:var(--text-secondary);">Evaluator Signatory</div>
              <div style="font-weight:700;font-size:0.92rem;color:var(--text-primary);">${escapeHtml(ev.evaluator_name || 'HR Supervisor')}</div>
              <div class="text-xs text-secondary">${escapeHtml(ev.evaluator_position || 'Company Representative')}</div>
            </div>
          </div>

          ${ev.recommendation ? `
            <div style="background:rgba(16,185,129,0.08);border-left:4px solid var(--color-success);border-radius:4px;padding:12px 16px;margin-bottom:20px;">
              <div style="font-size:0.72rem;font-weight:700;text-transform:uppercase;color:var(--color-success);margin-bottom:2px;">Company Recommendation</div>
              <div style="font-weight:600;font-size:0.88rem;color:var(--text-primary);">${escapeHtml(ev.recommendation)}</div>
            </div>` : ''}

          <!-- Questions & answers -->
          <h4 style="font-size:0.78rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:var(--text-tertiary);margin:0 0 12px;">Submitted Criteria Ratings</h4>
          <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:20px;">
            ${questions.map((q, idx) => {
              const ans = ansMap[q.id];
              return `
                <div style="background:#FAFBFD;border:1px solid #F1F4F9;border-radius:6px;padding:12px 14px;">
                  <div style="font-size:0.85rem;font-weight:600;color:var(--text-primary);margin-bottom:6px;">${idx + 1}. ${escapeHtml(q.question_text)}</div>
                  ${q.question_type === 'rating' ? `
                    <div style="display:flex;align-items:center;gap:6px;font-size:0.9rem;font-weight:700;color:#F59E0B;">
                      <span>★</span> ${ans?.rating_value || '—'} / 5
                    </div>
                  ` : `
                    <div style="font-size:0.84rem;color:var(--text-secondary);font-style:italic;">
                      "${escapeHtml(ans?.text_value || 'No response')}"
                    </div>
                  `}
                </div>
              `;
            }).join('')}
          </div>

          ${ev.general_feedback ? `
            <div style="background:#FAFBFD;border:1px solid #E2E8F0;border-radius:8px;padding:14px;margin-bottom:14px;">
              <div style="font-size:0.72rem;font-weight:700;text-transform:uppercase;color:var(--text-secondary);margin-bottom:4px;">Supervisor Written Remarks</div>
              <div style="font-size:0.88rem;color:var(--text-primary);line-height:1.5;">"${escapeHtml(ev.general_feedback)}"</div>
            </div>` : ''}
        </div>
        <div class="modal__footer" style="display:flex;justify-content:space-between;padding:14px 24px;border-top:1px solid #E2E8F0;background:#FAFBFD;flex-shrink:0;">
          <button class="btn btn--outline" id="comp-print-eval-btn" style="gap:6px;">
            ${icon('download', 14)} Print Scorecard
          </button>
          <button class="btn btn--primary" id="comp-view-close-btn">Close</button>
        </div>
      </div>
    `;

    const close = () => backdrop.remove();
    backdrop.querySelector('#comp-view-close').addEventListener('click', close);
    backdrop.querySelector('#comp-view-close-btn').addEventListener('click', close);
    backdrop.querySelector('#comp-print-eval-btn')?.addEventListener('click', () => {
      window.print();
    });
  } catch (e) {
    alert(e.message || 'Failed to load evaluation.');
    backdrop.remove();
  }
}

/**
 * Company Emergency Exit Clearance Modal:
 * Confirms receipt of company assets/keys and records company turnover notes
 */
function openCompanyEmergencyClearanceModal(emergency, trainee, onComplete) {
  const existing = document.getElementById('company-clearance-modal-overlay');
  if (existing) existing.remove();

  const backdrop = document.createElement('div');
  backdrop.id = 'company-clearance-modal-overlay';
  backdrop.className = 'modal-backdrop modal-backdrop--visible';
  backdrop.style.cssText = `
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(15, 23, 42, 0.65); backdrop-filter: blur(4px);
    z-index: 99999; display: flex; align-items: center; justify-content: center;
    padding: 20px; box-sizing: border-box; animation: fadeIn 0.15s ease-out;
  `;

  const st = trainee?.student || {};
  const isCleared = emergency.company_status === 'cleared' || emergency.assets_returned;

  backdrop.innerHTML = `
    <div class="modal modal--visible co-clearance-modal" style="max-width:540px;width:100%;border-radius:14px;overflow:hidden;background:#fff;box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);">
      <div class="modal__header" style="border-bottom:1px solid #E2E8F0;background:linear-gradient(135deg, rgba(245,158,11,0.06) 0%, rgba(239,68,68,0.06) 100%);padding:18px 22px;display:flex;align-items:center;justify-content:space-between;">
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="width:38px;height:38px;border-radius:10px;background:rgba(245,158,11,0.15);color:#d97706;display:flex;align-items:center;justify-content:center;">
            ${icon('checkSquare', 18)}
          </div>
          <div>
            <h3 style="margin:0;font-size:1.05rem;font-weight:700;color:var(--text-primary);">Host Company Exit Clearance</h3>
            <p style="margin:2px 0 0;font-size:0.78rem;color:var(--text-secondary);">${escapeHtml(st.name || 'Intern')} &bull; ${emergency.type === 'permanent_withdrawal' ? 'Permanent Stoppage' : 'Leave Notice'}</p>
          </div>
        </div>
        <button type="button" id="clearance-close-btn" style="background:none;border:none;cursor:pointer;color:var(--text-secondary);padding:4px;">
          ${icon('x', 18)}
        </button>
      </div>

      <form id="company-clearance-form" style="padding:20px 22px;display:flex;flex-direction:column;gap:16px;">
        <div id="clearance-error-box" style="display:none;background:#FEF2F2;border:1px solid #FCA5A5;color:#991B1B;padding:10px 14px;border-radius:8px;font-size:0.83rem;"></div>

        <!-- Emergency Statement Box -->
        <div style="background:#FFFBEB;border:1px solid rgba(245,158,11,0.3);border-left:4px solid #F59E0B;border-radius:8px;padding:12px 14px;font-size:0.82rem;line-height:1.45;">
          <strong style="color:#92400e;display:block;margin-bottom:3px;">Student Notice Statement:</strong>
          <span style="color:#78350f;">"${escapeHtml(emergency.reason || 'Medical / Emergency reasons.')}"</span>
        </div>

        <!-- Asset Return Checklist -->
        <div style="background:#FAFBFD;border:1px solid #E2E8F0;border-radius:10px;padding:14px;">
          <label style="font-weight:700;font-size:0.84rem;color:var(--text-primary);display:block;margin-bottom:8px;">Company Asset Return Verification</label>
          <label style="display:flex;align-items:flex-start;gap:10px;cursor:pointer;">
            <input type="checkbox" name="assets_returned" value="1" ${isCleared ? 'checked' : ''} style="accent-color:var(--color-primary, #005930);margin-top:3px;width:16px;height:16px;">
            <span style="font-size:0.82rem;color:var(--text-primary);line-height:1.4;">
              <strong>Company Assets &amp; Items Returned</strong><br>
              <span style="color:var(--text-secondary);font-size:0.76rem;">All company IDs, building access badges/keys, project laptops, tools, and confidential materials have been surrendered and turned over.</span>
            </span>
          </label>
        </div>

        <!-- Clearance Notes / Turnover Summary -->
        <div>
          <label style="display:block;font-size:0.82rem;font-weight:700;margin-bottom:6px;color:var(--text-primary);">Clearance Remarks / Turnover Notes</label>
          <textarea name="notes" class="input" rows="3" style="width:100%;resize:vertical;font-family:inherit;font-size:0.82rem;" placeholder="Add exit clearance remarks, turnover notes, or condition of returned equipment...">${escapeHtml(emergency.company_clearance_notes || '')}</textarea>
        </div>

        <div style="display:flex;align-items:center;justify-content:flex-end;gap:10px;margin-top:4px;">
          <button type="button" class="btn btn--outline" id="clearance-cancel-btn">Cancel</button>
          <button type="submit" class="btn btn--primary" id="clearance-submit-btn" style="gap:6px;">
            ${icon('check', 14)} Submit Clearance
          </button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(backdrop);

  const close = () => backdrop.remove();
  backdrop.querySelector('#clearance-close-btn').addEventListener('click', close);
  backdrop.querySelector('#clearance-cancel-btn').addEventListener('click', close);
  backdrop.addEventListener('click', e => { if (e.target === backdrop) close(); });

  const form = backdrop.querySelector('#company-clearance-form');
  const errBox = backdrop.querySelector('#clearance-error-box');
  const submitBtn = backdrop.querySelector('#clearance-submit-btn');

  form.addEventListener('submit', async e => {
    e.preventDefault();
    errBox.style.display = 'none';
    submitBtn.disabled = true;
    submitBtn.innerHTML = `${icon('clock', 14)} Submitting…`;

    const fd = new FormData(form);
    const assetsReturned = fd.get('assets_returned') === '1';
    const notes = fd.get('notes') || '';

    try {
      const res = await apiPost(`/company/emergency-requests/${emergency.id}/clearance`, {
        assets_returned: assetsReturned,
        notes: notes,
      });

      if (res && res.success) {
        close();
        if (typeof onComplete === 'function') onComplete();
      } else {
        errBox.textContent = res?.message || 'Failed to submit clearance.';
        errBox.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.innerHTML = `${icon('check', 14)} Submit Clearance`;
      }
    } catch (err) {
      errBox.textContent = err.message || 'An error occurred while submitting clearance.';
      errBox.style.display = 'block';
      submitBtn.disabled = false;
      submitBtn.innerHTML = `${icon('check', 14)} Submit Clearance`;
    }
  });
}

/**
 * Render a compact live attendance badge for today's DTR state on a trainee row or dossier
 */
function renderTodayDtrBadge(todayDtr) {
  if (!todayDtr || !todayDtr.logged_today) {
    return `
      <span style="display:inline-flex;align-items:center;gap:4px;padding:2px 7px;border-radius:99px;font-size:0.68rem;font-weight:600;background:#F1F5F9;color:#64748B;border:1px solid #E2E8F0;" title="No attendance logged yet today">
        <span style="width:6px;height:6px;border-radius:50%;background:#94A3B8;"></span>
        ${escapeHtml(todayDtr?.label || 'No Log Today')}
      </span>
    `;
  }

  const state = todayDtr.session_state;
  const distSuffix = todayDtr.distance_meters != null ? ` (${todayDtr.distance_meters}m)` : '';
  const locPill = todayDtr.location_validity === 'In Site'
    ? ` &bull; In Site${distSuffix}`
    : (todayDtr.location_validity === 'Too Far' ? ` &bull; Too Far${distSuffix}` : '');

  if (state === 'in_morning' || state === 'in_afternoon') {
    return `
      <span style="display:inline-flex;align-items:center;gap:5px;padding:2px 8px;border-radius:99px;font-size:0.68rem;font-weight:700;background:#ECFDF5;color:#047857;border:1px solid #A7F3D0;" title="Student is currently timed in today">
        <span style="width:6px;height:6px;border-radius:50%;background:#10B981;box-shadow:0 0 0 2px rgba(16,185,129,0.25);"></span>
        ${escapeHtml(todayDtr.label)}${escapeHtml(locPill)}
      </span>
    `;
  }

  if (state === 'morning_done') {
    return `
      <span style="display:inline-flex;align-items:center;gap:5px;padding:2px 8px;border-radius:99px;font-size:0.68rem;font-weight:700;background:#FFFBEB;color:#B45309;border:1px solid #FDE68A;" title="Morning session completed; on lunch break">
        <span style="width:6px;height:6px;border-radius:50%;background:#F59E0B;"></span>
        ${escapeHtml(todayDtr.label)}${escapeHtml(locPill)}
      </span>
    `;
  }

  return `
    <span style="display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:99px;font-size:0.68rem;font-weight:700;background:#F0FDF4;color:#15803D;border:1px solid #BBF7D0;" title="Attendance completed for today">
      ${icon('checkCircle', 11)}
      ${escapeHtml(todayDtr.label)}${escapeHtml(locPill)}
    </span>
  `;
}

/**
 * Company Trainee Daily Time Record (DTR) Modal — Table-only view (No Map)
 * Displays Morning In/Out, Afternoon In/Out, Hours Rendered, Status, and Location Validity/Distance
 */
async function openCompanyTraineeDtrModal(studentId, traineeFallback = null) {
  const existing = document.getElementById('company-trainee-dtr-modal-overlay');
  if (existing) existing.remove();

  const backdrop = document.createElement('div');
  backdrop.id = 'company-trainee-dtr-modal-overlay';
  backdrop.className = 'modal-backdrop modal-backdrop--visible';
  backdrop.style.cssText = `
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(15, 23, 42, 0.65); backdrop-filter: blur(4px);
    z-index: 99999; display: flex; align-items: center; justify-content: center;
    padding: 20px; box-sizing: border-box; animation: fadeIn 0.15s ease-out;
  `;

  backdrop.innerHTML = `
    <div class="modal modal--visible" style="max-width:1020px;width:100%;border-radius:14px;overflow:hidden;background:#fff;box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);">
      <div style="padding:40px;text-align:center;">
        <div class="skeleton" style="height:28px;width:280px;margin:0 auto 14px;"></div>
        <div class="skeleton skeleton--card" style="height:280px;"></div>
      </div>
    </div>
  `;
  document.body.appendChild(backdrop);

  let logsData = [];
  let studentInfo = traineeFallback?.student || {};
  let summaryInfo = {};
  let searchFilter = '';
  let validityFilter = 'all';

  const close = () => {
    if (window.__activeCompanyDtrModal?.studentId === studentId) {
      window.__activeCompanyDtrModal = null;
    }
    backdrop.remove();
  };

  async function fetchAndRenderDtr() {
    try {
      const res = await apiGet(`/company/ojt-trainees/${studentId}/logs`, { forceRefresh: true });
      if (!res?.success) throw new Error(res?.message || 'Unable to load student DTR logs.');

      logsData = Array.isArray(res.data) ? res.data : [];
      studentInfo = res.student || studentInfo;
      summaryInfo = res.summary || {};

      renderModalShell();
    } catch (err) {
      backdrop.innerHTML = `
        <div class="modal modal--visible" style="max-width:480px;width:100%;border-radius:14px;overflow:hidden;background:#fff;padding:28px;text-align:center;">
          <div style="width:48px;height:48px;border-radius:50%;background:#FEE2E2;color:#DC2626;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;">
            ${icon('alertTriangle', 24)}
          </div>
          <h3 style="margin:0 0 6px;font-size:1.05rem;font-weight:700;color:var(--text-primary);">Could Not Load DTR</h3>
          <p style="margin:0 0 18px;font-size:0.84rem;color:var(--text-secondary);">${escapeHtml(err.message || 'Failed to fetch time logs.')}</p>
          <button type="button" class="btn btn--outline" id="dtr-err-close-btn">Close</button>
        </div>
      `;
      backdrop.querySelector('#dtr-err-close-btn')?.addEventListener('click', close);
    }
  }

  function getFilteredLogs() {
    const q = searchFilter.toLowerCase().trim();
    return logsData.filter(log => {
      if (validityFilter === 'in_site' && log.locationValidity !== 'In Site') return false;
      if (validityFilter === 'too_far' && log.locationValidity !== 'Too Far') return false;
      if (validityFilter === 'no_gps' && (log.locationValidity === 'In Site' || log.locationValidity === 'Too Far')) return false;

      if (q) {
        const hay = `${log.dayLabel || ''} ${log.date || ''} ${log.rawDate || ''} ${log.locationValidity || ''} ${log.siteLocation || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }

  function renderLocationCell(log) {
    const val = log.locationValidity;
    const dist = log.distanceMeters != null ? `${log.distanceMeters}m` : '';
    let badgeHtml = '';

    if (val === 'In Site') {
      badgeHtml = `
        <span style="display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:99px;font-size:0.72rem;font-weight:700;background:#ECFDF5;color:#047857;border:1px solid #A7F3D0;">
          ✓ In Site${dist ? ` (${dist})` : ''}
        </span>`;
    } else if (val === 'Too Far') {
      badgeHtml = `
        <span style="display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:99px;font-size:0.72rem;font-weight:700;background:#FEF2F2;color:#B91C1C;border:1px solid #FECACA;">
          ⚠ Too Far${dist ? ` (${dist})` : ''}
        </span>`;
    } else {
      badgeHtml = `
        <span style="display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:99px;font-size:0.72rem;font-weight:600;background:#F1F5F9;color:#64748B;border:1px solid #E2E8F0;">
          No GPS
        </span>`;
    }

    const inCoords = (log.inLat != null && log.inLon != null)
      ? `In: ${Number(log.inLat).toFixed(5)}, ${Number(log.inLon).toFixed(5)}`
      : '';
    const outCoords = (log.outLat != null && log.outLon != null)
      ? `Out: ${Number(log.outLat).toFixed(5)}, ${Number(log.outLon).toFixed(5)}`
      : '';
    const coordsLine = [inCoords, outCoords].filter(Boolean).join(' · ');

    return `
      <div style="display:flex;flex-direction:column;gap:3px;align-items:flex-start;">
        ${badgeHtml}
        ${log.siteLocation ? `<span style="font-size:0.7rem;color:var(--text-secondary);font-weight:500;">${escapeHtml(log.siteLocation)}</span>` : ''}
        ${coordsLine ? `<span style="font-size:0.66rem;font-family:monospace;color:var(--text-tertiary);">${escapeHtml(coordsLine)}</span>` : ''}
      </div>
    `;
  }

  function renderStatusBadge(log) {
    const st = (log.status || '').toLowerCase();
    const isOngoing = (log.morningIn && !log.morningOut && !log.afternoonIn) || (log.afternoonIn && !log.afternoonOut) || (log.timeIn && !log.timeOut);

    if (isOngoing) {
      return `<span style="display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:99px;font-size:0.7rem;font-weight:700;background:#EFF6FF;color:#1D4ED8;border:1px solid #BFDBFE;">In Session</span>`;
    }
    if (st === 'valid' || log.locationValidity === 'In Site') {
      return `<span style="display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:99px;font-size:0.7rem;font-weight:700;background:#F0FDF4;color:#15803D;border:1px solid #BBF7D0;">Valid</span>`;
    }
    if (st === 'too far' || log.locationValidity === 'Too Far') {
      return `<span style="display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:99px;font-size:0.7rem;font-weight:700;background:#FEF2F2;color:#B91C1C;border:1px solid #FECACA;">Out of Range</span>`;
    }
    return `<span style="display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:99px;font-size:0.7rem;font-weight:600;background:#F8FAFC;color:#475569;border:1px solid #E2E8F0;">${escapeHtml(log.status || 'Logged')}</span>`;
  }

  function renderTableRowsHtml(rows) {
    if (!rows.length) {
      return `
        <tr>
          <td colspan="8" style="padding:42px 20px;text-align:center;color:var(--text-secondary);">
            <div style="width:42px;height:42px;border-radius:50%;background:rgba(0,89,48,0.06);color:var(--color-primary, #005930);display:flex;align-items:center;justify-content:center;margin:0 auto 10px;">
              ${icon('clock', 20)}
            </div>
            <div style="font-weight:700;font-size:0.9rem;color:var(--text-primary);margin-bottom:3px;">No DTR attendance records found</div>
            <div style="font-size:0.78rem;color:var(--text-secondary);">Time-in and time-out entries will appear here automatically as the trainee logs attendance.</div>
          </td>
        </tr>
      `;
    }

    return rows.map(log => {
      const mIn = log.morningIn || (!log.afternoonIn && log.timeIn ? log.timeIn : null);
      const mOut = log.morningOut || null;
      const aIn = log.afternoonIn || null;
      const aOut = log.afternoonOut || (!log.morningIn && !log.afternoonIn && log.timeOut ? log.timeOut : null);

      const mInHtml = mIn
        ? `<span style="font-weight:600;color:#0F172A;">${escapeHtml(mIn)}</span>`
        : `<span style="color:#94A3B8;">—</span>`;

      const mOutHtml = mOut
        ? `<div style="display:flex;align-items:center;gap:5px;flex-wrap:wrap;">
             <span style="font-weight:600;color:#0F172A;">${escapeHtml(mOut)}</span>
             ${log.autoMorningTimeout ? `<span style="font-size:0.63rem;font-weight:700;padding:1px 5px;border-radius:4px;background:#FEF3C7;color:#92400E;" title="Automatically closed at lunch break">Auto 12:00</span>` : ''}
           </div>`
        : (mIn && !aIn
          ? `<span style="font-size:0.72rem;font-weight:700;color:#059669;background:#ECFDF5;padding:2px 7px;border-radius:99px;">Active (AM)</span>`
          : `<span style="color:#94A3B8;">—</span>`);

      const aInHtml = aIn
        ? `<span style="font-weight:600;color:#0F172A;">${escapeHtml(aIn)}</span>`
        : `<span style="color:#94A3B8;">—</span>`;

      const aOutHtml = aOut
        ? `<div style="display:flex;align-items:center;gap:5px;flex-wrap:wrap;">
             <span style="font-weight:600;color:#0F172A;">${escapeHtml(aOut)}</span>
             ${log.autoAfternoonTimeout ? `<span style="font-size:0.63rem;font-weight:700;padding:1px 5px;border-radius:4px;background:#FEF3C7;color:#92400E;" title="Automatically closed at scheduled shift end (No exit GPS)">Auto ${escapeHtml(aOut)}</span>` : ''}
           </div>`
        : (aIn
          ? `<span style="font-size:0.72rem;font-weight:700;color:#059669;background:#ECFDF5;padding:2px 7px;border-radius:99px;">Active (PM)</span>`
          : `<span style="color:#94A3B8;">—</span>`);

      const hrs = Number(log.hours || 0).toFixed(2);
      const hasSplitHrs = (log.morningHours > 0 || log.afternoonHours > 0);
      const splitSub = hasSplitHrs
        ? `<div style="font-size:0.67rem;color:var(--text-tertiary);">AM: ${Number(log.morningHours || 0).toFixed(1)}h &bull; PM: ${Number(log.afternoonHours || 0).toFixed(1)}h</div>`
        : '';

      return `
        <tr style="border-bottom:1px solid #F1F5F9;">
          <td style="padding:11px 14px;white-space:nowrap;">
            <div style="font-weight:700;font-size:0.82rem;color:var(--text-primary);">${escapeHtml(log.dayLabel || log.date || '—')}</div>
            <div style="font-size:0.69rem;color:var(--text-tertiary);font-family:monospace;">${escapeHtml(log.rawDate || '')}</div>
          </td>
          <td style="padding:11px 12px;white-space:nowrap;font-size:0.81rem;">${mInHtml}</td>
          <td style="padding:11px 12px;white-space:nowrap;font-size:0.81rem;">${mOutHtml}</td>
          <td style="padding:11px 12px;white-space:nowrap;font-size:0.81rem;">${aInHtml}</td>
          <td style="padding:11px 12px;white-space:nowrap;font-size:0.81rem;">${aOutHtml}</td>
          <td style="padding:11px 12px;white-space:nowrap;">
            <div style="font-weight:700;font-size:0.83rem;color:var(--color-primary, #005930);">${hrs} hrs</div>
            ${splitSub}
          </td>
          <td style="padding:11px 12px;white-space:nowrap;">${renderStatusBadge(log)}</td>
          <td style="padding:11px 14px;min-width:190px;">${renderLocationCell(log)}</td>
        </tr>
      `;
    }).join('');
  }

  function renderModalShell() {
    const init = (studentInfo.name || 'Student').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const filteredRows = getFilteredLogs();

    backdrop.innerHTML = `
      <div class="modal modal--visible co-dtr-modal" style="max-width:1040px;width:100%;border-radius:14px;overflow:hidden;background:#fff;box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);max-height:90vh;display:flex;flex-direction:column;">
        <!-- Modal Header -->
        <div class="modal__header" style="border-bottom:1px solid #E2E8F0;background:#FAFBFD;padding:16px 24px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-shrink:0;flex-wrap:wrap;">
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:42px;height:42px;border-radius:10px;background:rgba(0,89,48,0.1);color:var(--color-primary, #005930);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:0.95rem;flex-shrink:0;">
              ${init}
            </div>
            <div>
              <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                <h3 style="margin:0;font-size:1.08rem;font-weight:800;color:var(--text-primary);">${escapeHtml(studentInfo.name || 'Trainee')} &mdash; Daily Time Record (DTR)</h3>
                ${renderTodayDtrBadge(summaryInfo.todayDtr)}
              </div>
              <p style="margin:3px 0 0;font-size:0.78rem;color:var(--text-secondary);">
                ${escapeHtml(studentInfo.program || '—')}
                ${studentInfo.student_id ? ` &bull; ID: <span style="font-family:monospace;">${escapeHtml(studentInfo.student_id)}</span>` : ''}
                &bull; Listing: <strong>${escapeHtml(studentInfo.posting_title || 'OJT Placement')}</strong>
                ${studentInfo.site_location ? ` &bull; Site: ${escapeHtml(studentInfo.site_location)}` : ''}
              </p>
            </div>
          </div>

          <div style="display:flex;align-items:center;gap:8px;">
            <button type="button" class="btn btn--outline btn--sm" id="dtr-modal-export-csv" style="gap:5px;font-size:0.76rem;">
              ${icon('download', 13)} Export CSV
            </button>
            <button type="button" class="btn btn--ghost btn--sm" id="dtr-modal-refresh" title="Refresh DTR Logs" style="gap:5px;font-size:0.76rem;">
              ${icon('refreshCw', 13)} Refresh
            </button>
            <button type="button" id="dtr-modal-close" style="background:none;border:none;cursor:pointer;color:var(--text-secondary);padding:6px;border-radius:8px;">
              ${icon('x', 18)}
            </button>
          </div>
        </div>

        <!-- Summary KPI Strip -->
        <div class="co-dtr-kpi-grid" style="display:grid;grid-template-columns:repeat(auto-fit, minmax(190px, 1fr));gap:12px;padding:14px 24px;background:#F8FAFC;border-bottom:1px solid #E2E8F0;flex-shrink:0;">
          <div style="background:#fff;border:1px solid #E2E8F0;border-radius:10px;padding:10px 14px;">
            <div style="font-size:0.68rem;font-weight:700;text-transform:uppercase;color:var(--text-tertiary);">Total Hours Rendered</div>
            <div style="font-size:1.1rem;font-weight:800;color:var(--color-primary, #005930);margin-top:2px;">
              ${summaryInfo.completedHours ?? 0} <span style="font-size:0.8rem;font-weight:600;color:var(--text-secondary);">/ ${summaryInfo.requiredHours ?? 600} hrs (${summaryInfo.progressPct ?? 0}%)</span>
            </div>
          </div>
          <div style="background:#fff;border:1px solid #E2E8F0;border-radius:10px;padding:10px 14px;">
            <div style="font-size:0.68rem;font-weight:700;text-transform:uppercase;color:var(--text-tertiary);">Total Days Logged</div>
            <div style="font-size:1.1rem;font-weight:800;color:var(--text-primary);margin-top:2px;">
              ${summaryInfo.totalLogs ?? 0} <span style="font-size:0.8rem;font-weight:600;color:var(--text-secondary);">Attendance Days</span>
            </div>
          </div>
          <div style="background:#fff;border:1px solid #E2E8F0;border-radius:10px;padding:10px 14px;">
            <div style="font-size:0.68rem;font-weight:700;text-transform:uppercase;color:var(--text-tertiary);">Location Compliance (100m)</div>
            <div style="display:flex;align-items:center;gap:10px;margin-top:3px;font-size:0.82rem;font-weight:700;">
              <span style="color:#047857;">✓ ${summaryInfo.inSiteCount ?? 0} In Site</span>
              <span style="color:#B91C1C;">⚠ ${summaryInfo.tooFarCount ?? 0} Too Far</span>
            </div>
          </div>
          <div style="background:#fff;border:1px solid #E2E8F0;border-radius:10px;padding:10px 14px;">
            <div style="font-size:0.68rem;font-weight:700;text-transform:uppercase;color:var(--text-tertiary);">Assigned Shift Schedule</div>
            <div style="font-size:0.9rem;font-weight:700;color:var(--text-primary);margin-top:3px;">
              ${escapeHtml(studentInfo.shift_start || '08:00')} &ndash; ${escapeHtml(studentInfo.shift_end || '17:00')}
            </div>
          </div>
        </div>

        <!-- Filter & Search Bar -->
        <div class="co-dtr-filter-bar" style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 24px;border-bottom:1px solid #E2E8F0;background:#fff;flex-shrink:0;flex-wrap:wrap;">
          <div style="display:flex;align-items:center;gap:10px;flex:1;min-width:240px;">
            <div style="position:relative;flex:1;max-width:320px;">
              <span style="position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--text-tertiary);display:flex;">${icon('search', 14)}</span>
              <input
                type="text"
                id="dtr-modal-search-input"
                class="input"
                value="${escapeHtml(searchFilter)}"
                placeholder="Search by date, day, or location..."
                style="width:100%;padding:6px 10px 6px 32px;font-size:0.8rem;height:34px;"
              />
            </div>
            <select id="dtr-modal-validity-filter" class="input" style="width:auto;min-width:160px;height:34px;padding:4px 10px;font-size:0.8rem;">
              <option value="all" ${validityFilter === 'all' ? 'selected' : ''}>All Locations (${logsData.length})</option>
              <option value="in_site" ${validityFilter === 'in_site' ? 'selected' : ''}>In Site Only (${summaryInfo.inSiteCount ?? 0})</option>
              <option value="too_far" ${validityFilter === 'too_far' ? 'selected' : ''}>Too Far Only (${summaryInfo.tooFarCount ?? 0})</option>
              <option value="no_gps" ${validityFilter === 'no_gps' ? 'selected' : ''}>No GPS (${summaryInfo.noGpsCount ?? 0})</option>
            </select>
          </div>
          <div style="font-size:0.75rem;color:var(--text-secondary);" id="dtr-modal-count-label">
            Showing <strong>${filteredRows.length}</strong> of <strong>${logsData.length}</strong> daily records
          </div>
        </div>

        <!-- DTR Table Body (Scrollable, No Map) -->
        <div style="overflow-y:auto;flex:1;padding:0;">
          <table style="width:100%;border-collapse:collapse;text-align:left;">
            <thead style="position:sticky;top:0;background:#F8FAFC;border-bottom:1px solid #E2E8F0;z-index:2;">
              <tr>
                <th style="padding:10px 14px;font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;color:#475569;">Date</th>
                <th style="padding:10px 12px;font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;color:#475569;">Time In (Morning)</th>
                <th style="padding:10px 12px;font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;color:#475569;">Time Out (Morning)</th>
                <th style="padding:10px 12px;font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;color:#475569;">Time In (Afternoon)</th>
                <th style="padding:10px 12px;font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;color:#475569;">Time Out (Afternoon)</th>
                <th style="padding:10px 12px;font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;color:#475569;">Hrs Rendered</th>
                <th style="padding:10px 12px;font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;color:#475569;">Status</th>
                <th style="padding:10px 14px;font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;color:#475569;">Location &amp; Geofence</th>
              </tr>
            </thead>
            <tbody id="dtr-modal-tbody">
              ${renderTableRowsHtml(filteredRows)}
            </tbody>
          </table>
        </div>

        <!-- Modal Footer -->
        <div style="border-top:1px solid #E2E8F0;background:#FAFBFD;padding:12px 24px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">
          <span style="font-size:0.74rem;color:var(--text-secondary);">
            💡 Real-time sync active &mdash; this table updates automatically when the trainee logs Time-In or Time-Out.
          </span>
          <button type="button" class="btn btn--outline btn--sm" id="dtr-modal-footer-close">Close</button>
        </div>
      </div>
    `;

    backdrop.querySelector('#dtr-modal-close')?.addEventListener('click', close);
    backdrop.querySelector('#dtr-modal-footer-close')?.addEventListener('click', close);
    backdrop.querySelector('#dtr-modal-refresh')?.addEventListener('click', () => fetchAndRenderDtr());

    const searchInputEl = backdrop.querySelector('#dtr-modal-search-input');
    const validitySelectEl = backdrop.querySelector('#dtr-modal-validity-filter');
    const tbodyEl = backdrop.querySelector('#dtr-modal-tbody');
    const countLabelEl = backdrop.querySelector('#dtr-modal-count-label');

    function updateTableOnly() {
      const rows = getFilteredLogs();
      if (tbodyEl) tbodyEl.innerHTML = renderTableRowsHtml(rows);
      if (countLabelEl) {
        countLabelEl.innerHTML = `Showing <strong>${rows.length}</strong> of <strong>${logsData.length}</strong> daily records`;
      }
    }

    searchInputEl?.addEventListener('input', (e) => {
      searchFilter = e.target.value;
      updateTableOnly();
    });

    validitySelectEl?.addEventListener('change', (e) => {
      validityFilter = e.target.value;
      updateTableOnly();
    });

    backdrop.querySelector('#dtr-modal-export-csv')?.addEventListener('click', () => {
      const rows = getFilteredLogs();
      const headers = ['Date', 'Morning In', 'Morning Out', 'Afternoon In', 'Afternoon Out', 'Hours Rendered', 'Status', 'Location Validity', 'Distance (m)', 'Site Location'];
      const csvLines = [
        headers.join(','),
        ...rows.map(r => [
          `"${(r.rawDate || r.date || '').replace(/"/g, '""')}"`,
          `"${(r.morningIn || r.timeIn || '—').replace(/"/g, '""')}"`,
          `"${(r.morningOut || '—').replace(/"/g, '""')}${r.autoMorningTimeout ? ' (Auto)' : ''}"`,
          `"${(r.afternoonIn || '—').replace(/"/g, '""')}"`,
          `"${(r.afternoonOut || r.timeOut || '—').replace(/"/g, '""')}${r.autoAfternoonTimeout ? ' (Auto)' : ''}"`,
          Number(r.hours || 0).toFixed(2),
          `"${(r.status || '').replace(/"/g, '""')}"`,
          `"${(r.locationValidity || 'No GPS').replace(/"/g, '""')}"`,
          r.distanceMeters != null ? r.distanceMeters : '',
          `"${(r.siteLocation || '').replace(/"/g, '""')}"`,
        ].join(','))
      ];
      const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const safeName = (studentInfo.name || 'trainee').toLowerCase().replace(/[^a-z0-9]+/g, '-');
      a.download = `dtr-${safeName}-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) close();
  });

  window.__activeCompanyDtrModal = {
    studentId,
    refresh: () => fetchAndRenderDtr(),
  };

  await fetchAndRenderDtr();
}

// Helpers
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderEmptyState() {
  return `
    <div style="background:#ffffff;border:1px solid var(--border-light, #E2E8F0);border-radius:12px;padding:48px 24px;text-align:center;">
      <div style="width:48px;height:48px;border-radius:50%;background:rgba(0,89,48,0.06);color:var(--color-primary, #005930);display:flex;align-items:center;justify-content:center;margin:0 auto 12px;">
        ${icon('clipboardList', 24)}
      </div>
      <h4 style="margin:0 0 6px;font-size:1rem;font-weight:700;color:var(--text-primary);">No matching trainees found</h4>
      <p style="margin:0;font-size:0.82rem;color:var(--text-secondary);max-width:440px;margin:0 auto;">
        Interns will appear here once their practicum is officially approved and started by their academic coordinator.
      </p>
    </div>
  `;
}

function renderLoadingSkeleton() {
  return `
    <div style="display:flex;flex-direction:column;gap:14px;">
      <div style="background:#ffffff;border:1px solid var(--border-light, #E2E8F0);border-radius:12px;padding:20px;">
        <div class="skeleton" style="height:24px;width:35%;margin-bottom:10px;"></div>
        <div class="skeleton" style="height:16px;width:60%;margin-bottom:16px;"></div>
        <div class="skeleton skeleton--card" style="height:80px;"></div>
      </div>
    </div>
  `;
}
