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
      if (t.evaluation?.status === 'submitted') {
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
      if (t.evaluation?.status === 'pending') {
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
            <div style="font-size:0.7rem;color:var(--text-secondary);">${t.shift_start || '08:00'} &ndash; ${t.shift_end || '17:00'}</div>
          </td>
          <td>${statusBadge}</td>
          <td style="text-align:right;" onclick="event.stopPropagation();">${actionBtn}</td>
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

    if (t.evaluation?.status === 'pending') {
      statusPill = `<span class="co-status-pill co-status-pill--action">${icon('clock', 11)} Action: Evaluation Requested</span>`;
      actionBtn = `
        <button class="btn btn--primary btn--sm btn-trigger-eval" data-eval-id="${t.evaluation.id}" style="background:#F59E0B;border-color:#F59E0B;gap:4px;font-size:0.75rem;padding:4px 11px;font-weight:700;">
          ★ Complete Evaluation
        </button>`;
    } else if (t.evaluation?.status === 'submitted') {
      statusPill = `<span class="co-status-pill co-status-pill--done">${icon('checkCircle', 11)} Graded (${Number(t.evaluation.overall_score).toFixed(1)}/5.0)</span>`;
      actionBtn = `
        <button class="btn btn--outline btn--sm btn-view-eval-scorecard" data-eval-id="${t.evaluation.id}" style="font-size:0.75rem;padding:4px 10px;">
          View Scorecard
        </button>`;
    } else if (completed >= required) {
      statusPill = `<span class="co-status-pill co-status-pill--ready">${icon('checkCircle', 11)} 100% Hours Rendered</span>`;
    } else {
      statusPill = `<span class="co-status-pill co-status-pill--progress">Active Intern (${pct}%)</span>`;
    }

    const scheduleDays = Array.isArray(t.schedule_days) && t.schedule_days.length
      ? t.schedule_days.join(', ')
      : 'Mon – Fri';

    return `
      <div class="co-trainee-row ${isInspected ? 'is-active-inspected' : ''}" data-trainee-id="${t.id}">
        <!-- Left: Student Info -->
        <div style="display:flex;align-items:center;gap:12px;min-width:0;flex:1.2;">
          <div style="width:38px;height:38px;border-radius:10px;background:rgba(0,89,48,0.08);color:var(--color-primary, #005930);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.85rem;flex-shrink:0;">
            ${init}
          </div>
          <div style="min-width:0;">
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:2px;">
              <span style="font-weight:700;font-size:0.88rem;color:var(--text-primary);">${escapeHtml(st.name || 'Intern')}</span>
              ${statusPill}
            </div>
            <div style="font-size:0.74rem;color:var(--text-secondary);display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
              <span>${escapeHtml(st.program || '—')}${st.year_level ? ` &bull; ${escapeHtml(st.year_level)}` : ''}</span>
              <span style="font-family:monospace;color:var(--text-tertiary);">ID: ${escapeHtml(st.student_id || '—')}</span>
            </div>
          </div>
        </div>

        <!-- Middle: Hours Progress -->
        <div style="flex:0.9;min-width:140px;">
          <div class="co-hours-gauge">
            <div class="co-hours-gauge__track">
              <div class="co-hours-gauge__fill" style="width:${pct}%;background:${barColor};"></div>
            </div>
            <div class="co-hours-gauge__meta">
              <span>${completed} of ${required} hrs</span>
              <span style="font-weight:700;color:var(--text-primary);">${pct}%</span>
            </div>
          </div>
          <div style="font-size:0.7rem;color:var(--text-tertiary);margin-top:2px;">
            ${scheduleDays} &bull; ${t.shift_start || '08:00'} - ${t.shift_end || '17:00'}
          </div>
        </div>

        <!-- Coordinator badge snippet -->
        <div style="display:none;flex-direction:column;font-size:0.72rem;color:var(--text-secondary);min-width:130px;" class="desktop-only-slots">
          <span style="font-size:0.68rem;font-weight:700;text-transform:uppercase;color:var(--text-tertiary);">Academic Coordinator</span>
          <span style="font-weight:600;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:140px;">
            ${escapeHtml(sup.name || 'Faculty Mentor')}
          </span>
        </div>

        <!-- Right: Actions -->
        <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;" onclick="event.stopPropagation();">
          ${actionBtn}
          <button class="btn btn--ghost btn--sm btn-inspect-trainee" data-trainee-id="${t.id}" title="Inspect Intern Dossier" style="padding:4px 8px;font-size:0.75rem;">
            ${icon('eye', 13)} Dossier
          </button>
          <button
            type="button"
            class="btn btn--ghost btn--sm"
            onclick="window.openChat && window.openChat('ojt_interest_${t.interest_id || t.id}')"
            title="Message Intern"
            style="color:var(--color-primary, #005930);padding:4px 8px;font-size:0.75rem;"
          >
            ${icon('messageCircle', 13)} Message
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
  }

  // =========================================================================
  // LIVE TRAINEE DOSSIER (INSPECTOR DRAWER)
  // =========================================================================

  function inspectTrainee(trainee) {
    selectedTraineeForDossier = trainee;
    dossierPane.classList.add('co-dossier-pane--visible');

    // Highlight row
    container.querySelectorAll('.is-active-inspected').forEach(el => el.classList.remove('is-active-inspected'));
    container.querySelectorAll(`[data-trainee-id="${trainee.id}"]`).forEach(el => el.classList.add('is-active-inspected'));

    renderDossierContent(trainee);
  }

  function closeDossier() {
    selectedTraineeForDossier = null;
    dossierPane.classList.remove('co-dossier-pane--visible');
    container.querySelectorAll('.is-active-inspected').forEach(el => el.classList.remove('is-active-inspected'));
  }

  btnDossierClose.addEventListener('click', closeDossier);

  function renderDossierContent(t) {
    const st = t.student || {};
    const sup = t.supervisor || {};
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

    const skills = Array.isArray(st.skills) ? st.skills : [];

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

      <!-- Academic Coordinator Endorsement -->
      <div class="co-dossier__box">
        <div class="co-dossier__box-title">${icon('shield', 13)} Academic Coordinator</div>
        <div style="font-weight:700;font-size:0.85rem;color:var(--text-primary);">${escapeHtml(sup.name || 'Faculty Coordinator')}</div>
        <div style="font-size:0.74rem;color:var(--text-secondary);">${escapeHtml(sup.position || 'CHMSU Practicum Coordinator')}</div>
        ${sup.email ? `<div style="font-size:0.72rem;color:var(--text-tertiary);margin-top:2px;">${escapeHtml(sup.email)}</div>` : ''}
        <div style="font-size:0.7rem;color:var(--color-primary, #005930);font-weight:600;margin-top:4px;">
          ✓ Officially Endorsed & Approved
        </div>
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
          title="Message University OJT Coordinator"
        >
          ${icon('award', 13)} Message Coordinator
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

    dossierBody.querySelector('#btn-dossier-chat')?.addEventListener('click', () => {
      if (window.openChat) window.openChat(`ojt_interest_${t.interest_id || t.id}`);
    });

    dossierBody.querySelector('#btn-dossier-chat-coord')?.addEventListener('click', () => {
      if (window.openCoordinatorChat) window.openCoordinatorChat(t.endorsed_by || 0);
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

  // =========================================================================
  // BOOTSTRAP INITIAL LOAD
  // =========================================================================
  loadData();
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

    backdrop.innerHTML = `
      <div class="modal modal--visible" style="max-width:780px;border-radius:14px;overflow:hidden;background:#fff;box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);max-height:90vh;display:flex;flex-direction:column;">
        <!-- Header -->
        <div class="modal__header" style="border-bottom:1px solid #E2E8F0;background:#FAFBFD;padding:18px 24px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="width:42px;height:42px;border-radius:10px;background:rgba(245,158,11,0.12);color:#B45309;display:flex;align-items:center;justify-content:center;font-size:1.3rem;font-weight:700;">
              ★
            </div>
            <div>
              <h3 class="modal__title" style="margin:0;font-size:1.15rem;font-weight:700;">OJT Performance Appraisal</h3>
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
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
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

    backdrop.innerHTML = `
      <div class="modal modal--visible" style="max-width:720px;border-radius:14px;overflow:hidden;background:#fff;box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);max-height:88vh;display:flex;flex-direction:column;">
        <div class="modal__header" style="border-bottom:1px solid #E2E8F0;background:#FAFBFD;padding:18px 24px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;">
          <div>
            <h3 class="modal__title" style="margin:0;font-size:1.1rem;font-weight:700;">Submitted OJT Performance Appraisal</h3>
            <p class="text-sm text-secondary" style="margin:2px 0 0;">${escapeHtml(st.name || 'Intern')} &bull; ${escapeHtml(st.program || '')}</p>
          </div>
          <button class="modal__close" id="comp-view-close">${icon('x', 18)}</button>
        </div>
        <div class="modal__body" id="print-company-eval" style="flex:1;overflow-y:auto;padding:24px;">
          <!-- Score banner -->
          <div style="display:flex;align-items:center;justify-content:space-between;background:#FAFBFD;border:1px solid #E2E8F0;border-radius:10px;padding:16px 20px;margin-bottom:20px;">
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
