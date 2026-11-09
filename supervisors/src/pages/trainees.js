/* ===========================
   My Trainees Page — Supervisor Portal
   Senior UI/UX Redesign — Modern Enterprise Data Table
   =========================== */

import { icon } from '../components/icons.js';
import { apiGet, apiPost, apiCache, storageUrl } from '../api/client.js';
import { getState } from '../store.js';
import { openStudentImportModal } from '../components/student-import-modal.js';
import { openAssignRequirementsModal, openReviewRequirementsModal } from '../components/requirements-modal.js';
import { openReviewEmergencyModal } from '../components/review-emergency-modal.js';
import { openReviewPullOutModal } from '../components/review-pullout-modal.js';

const REAL = v => v && v !== '—' && v !== '';
const PER_PAGE = 10;

const STATUS_BADGES = {
  'Pending Approval': { cls: 'tr2-badge--warning', text: 'Pending Approval' },
  'Active OJT': { cls: 'tr2-badge--active', text: 'Active OJT' },
  'Undeployed': { cls: 'tr2-badge--undeployed', text: 'Undeployed' },
  'Emergency Pending': { cls: 'tr2-badge--warning', text: 'Emergency Pending' },
  'On Medical Leave': { cls: 'tr2-badge--leave', text: 'On Medical Leave' },
  'Withdrawn (Emergency)': { cls: 'tr2-badge--withdrawn', text: 'Withdrawn (Emergency)' },
  'Pull-Out Requested': { cls: 'tr2-badge--warning', text: 'Pull-Out Requested' },
  'Pull-Out Recommended': { cls: 'tr2-badge--leave', text: 'Pull-Out Recommended' },
  'Pulled Out (Approved)': { cls: 'tr2-badge--withdrawn', text: 'Pulled Out (Approved)' },
};

const BAR_COLOR = pct => pct >= 75 ? '#005930' : pct >= 40 ? '#10B981' : '#F59E0B';

/* ── Requirements Indicator Helper ──
   Only shows an indicator when requirements require action (not submitted, revision needed, or awaiting review).
   When requirements are met and approved (verified), the indicator is completely gone. ── */
function renderRequirementsIndicator(t) {
  const req = t.requirements;
  if (!req) return '';

  // If requirements are verified and approved, the indicator is GONE
  if (req.status === 'verified' || req.is_verified) {
    return '';
  }

  // Revision requested by supervisor
  if (req.status === 'needs_revision' || req.needs_revision) {
    return `
      <div style="margin-top:4px;">
        <span class="badge" style="background:#FEE2E2;color:#991B1B;border:1px solid #FCA5A5;font-size:0.74rem;padding:2px 8px;font-weight:700;border-radius:4px;display:inline-flex;align-items:center;gap:4px;" title="Revision requested: ${escapeHtml(req.supervisor_remarks || 'Update required documents')}">
          ${icon('alertTriangle', 11)} Reqs: Revision Needed
        </span>
      </div>`;
  }

  // Student submitted, waiting for supervisor review/verification
  if (req.status === 'submitted') {
    return `
      <div style="margin-top:4px;">
        <span class="badge" style="background:#EFF6FF;color:#1D4ED8;border:1px solid #93C5FD;font-size:0.74rem;padding:2px 8px;font-weight:700;border-radius:4px;display:inline-flex;align-items:center;gap:4px;" title="Student submitted Google Drive folder — click to review and verify">
          ${icon('folder', 11)} Reqs: Ready for Review
        </span>
      </div>`;
  }

  // Assigned but student has not submitted yet
  if (req.status === 'pending' || req.is_pending) {
    return `
      <div style="margin-top:4px;">
        <span class="badge" style="background:#FFFBEB;color:#B45309;border:1px solid #FCD34D;font-size:0.74rem;padding:2px 8px;font-weight:700;border-radius:4px;display:inline-flex;align-items:center;gap:4px;" title="Document packet assigned but student has not submitted files yet">
          ${icon('clock', 11)} Reqs: Not Submitted
        </span>
      </div>`;
  }

  return '';
}

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

/* ── Toast Notification Helper ── */
function showToast(msg, type = 'success') {
  const existing = document.getElementById('tr2-toast-msg');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'tr2-toast-msg';
  const bg = type === 'error' ? '#DC2626' : type === 'warning' ? '#D97706' : type === 'info' ? '#2563EB' : '#005930';
  toast.style.cssText = `position:fixed;bottom:24px;right:24px;background:${bg};color:#ffffff;padding:14px 22px;border-radius:12px;font-size:0.9rem;font-weight:600;box-shadow:0 12px 30px rgba(0,0,0,0.22);z-index:999999;display:flex;align-items:center;gap:12px;animation:modalIn 0.2s ease;max-width:440px;line-height:1.4;`;
  toast.innerHTML = `<span>${type === 'error' ? icon('alertTriangle', 20) : icon('check', 20)}</span><span>${escapeHtml(msg)}</span>`;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.25s ease';
    setTimeout(() => toast.remove(), 250);
  }, 4000);
}

/* ── Student Approval Modal ── */
function openStudentApprovalModal({ student, onApproved, apiEndpoint = `/supervisor/trainees/${student.id}/approve` }) {
  const existing = document.querySelector('.modal-backdrop-sp-action');
  if (existing) existing.remove();

  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop modal-backdrop-sp-action';
  backdrop.style.zIndex = '1200';

  const init = initials(student.name);

  backdrop.innerHTML = `
    <div class="modal sp-action-modal">
      <div class="sp-action-modal__header" style="background:linear-gradient(135deg,rgba(0,89,48,0.08),rgba(16,185,129,0.04));">
        <div class="sp-action-modal__header-left">
          <div class="sp-action-modal__icon sp-action-modal__icon--approve">
            ${icon('check', 20)}
          </div>
          <div>
            <h3 class="sp-action-modal__title">Approve Student Registration</h3>
            <p class="sp-action-modal__subtitle">Verify enrollment and grant OJT Portal access</p>
          </div>
        </div>
        <button class="modal__close" id="sp-approve-close" aria-label="Close modal">${icon('x', 16)}</button>
      </div>

      <div class="sp-action-modal__body">
        <!-- Student Info Card -->
        <div class="sp-student-card">
          ${student.avatar_url
            ? `<img src="${storageUrl(student.avatar_url)}" alt="${escapeHtml(student.name)}" class="sp-student-card__avatar" style="object-fit:cover;" />`
            : `<div class="sp-student-card__avatar">${init}</div>`}
          <div class="sp-student-card__info">
            <h4 class="sp-student-card__name">${escapeHtml(student.name)}</h4>
            <div class="sp-student-card__id-row">
              <span class="sp-student-card__id">${escapeHtml(student.studentId || student.student_id || 'No ID')}</span>
              <span class="sp-student-card__course">${escapeHtml(student.course || student.program || 'CHMSU Program')}</span>
            </div>
            <div class="sp-student-card__meta-grid">
              <div class="sp-student-card__meta-item">
                <span>Email:</span>
                <strong title="${escapeHtml(student.email)}">${escapeHtml(student.email || '—')}</strong>
              </div>
              <div class="sp-student-card__meta-item">
                <span>Section:</span>
                <strong>${escapeHtml(student.section || '—')}</strong>
              </div>
              <div class="sp-student-card__meta-item">
                <span>Year:</span>
                <strong>${escapeHtml(student.year || student.year_level || '—')}</strong>
              </div>
              <div class="sp-student-card__meta-item">
                <span>Source:</span>
                <strong style="text-transform:capitalize;color:#D97706;">${escapeHtml(student.registration_source || 'Self-Registered')}</strong>
              </div>
            </div>
          </div>
        </div>

        <!-- Verification Highlights -->
        <div class="sp-activation-box">
          <div class="sp-activation-box__item">
            ${icon('checkCircle', 15)}
            <div>
              <strong>Instant Portal Activation:</strong> Student will be immediately unlocked and allowed to log in to their student dashboard and browse verified OJT postings.
            </div>
          </div>
          <div class="sp-activation-box__item">
            ${icon('mail', 15)}
            <div>
              <strong>Welcome Email Dispatch:</strong> An automatic confirmation email will be sent to <strong>${escapeHtml(student.email)}</strong> with their login link.
            </div>
          </div>
        </div>

        <div id="sp-approve-error" style="display:none;background:#FEE2E2;border:1px solid #FCA5A5;color:#991B1B;padding:10px 14px;border-radius:8px;font-size:0.82rem;"></div>
      </div>

      <div class="sp-action-modal__footer">
        <button class="btn btn--outline btn--sm" id="sp-approve-cancel" type="button">Cancel</button>
        <button class="btn btn--primary btn--sm" id="sp-approve-confirm" type="button" style="background:#005930;border-color:#005930;gap:7px;font-weight:600;">
          ${icon('check', 15)} Confirm &amp; Approve Student
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(backdrop);

  const close = () => backdrop.remove();
  backdrop.querySelector('#sp-approve-close').addEventListener('click', close);
  backdrop.querySelector('#sp-approve-cancel').addEventListener('click', close);
  backdrop.addEventListener('click', e => { if (e.target === backdrop) close(); });

  const confirmBtn = backdrop.querySelector('#sp-approve-confirm');
  const errBox = backdrop.querySelector('#sp-approve-error');

  confirmBtn.addEventListener('click', async () => {
    confirmBtn.disabled = true;
    confirmBtn.innerHTML = `<span class="spinner-sm"></span> Approving…`;
    errBox.style.display = 'none';

    try {
      const res = await apiPost(apiEndpoint, {});
      close();
      if (typeof onApproved === 'function') onApproved(res);
    } catch (err) {
      errBox.textContent = err?.message || 'Failed to approve student. Please try again.';
      errBox.style.display = 'block';
      confirmBtn.disabled = false;
      confirmBtn.innerHTML = `${icon('check', 15)} Confirm &amp; Approve Student`;
    }
  });
}

/* ── Student Rejection Modal ── */
function openStudentRejectionModal({ student, onRejected, apiEndpoint = `/supervisor/trainees/${student.id}/reject` }) {
  const existing = document.querySelector('.modal-backdrop-sp-action');
  if (existing) existing.remove();

  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop modal-backdrop-sp-action';
  backdrop.style.zIndex = '1200';

  const REASON_PRESETS = [
    'Student ID not found in official CHMSU enrollment records.',
    'Incorrect course program or section selected.',
    'Duplicate account registered for this student.',
    'Incomplete or invalid registration credentials.',
  ];

  backdrop.innerHTML = `
    <div class="modal sp-action-modal">
      <div class="sp-action-modal__header" style="background:linear-gradient(135deg,rgba(220,38,38,0.08),rgba(244,63,94,0.04));">
        <div class="sp-action-modal__header-left">
          <div class="sp-action-modal__icon sp-action-modal__icon--reject">
            ${icon('x', 20)}
          </div>
          <div>
            <h3 class="sp-action-modal__title">Reject Student Registration</h3>
            <p class="sp-action-modal__subtitle">Decline enrollment and provide feedback to the applicant</p>
          </div>
        </div>
        <button class="modal__close" id="sp-reject-close" aria-label="Close modal">${icon('x', 16)}</button>
      </div>

      <div class="sp-action-modal__body">
        <!-- Target Student Pill -->
        <div style="background:var(--bg-surface,#f8fafc);border:1px solid var(--border-default,#e2e8f0);border-radius:12px;padding:12px 16px;display:flex;align-items:center;justify-content:space-between;gap:12px;">
          <div style="min-width:0;">
            <strong style="display:block;font-size:0.92rem;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(student.name)}</strong>
            <span style="font-size:0.8rem;color:var(--text-tertiary);">${escapeHtml(student.studentId || student.student_id || 'No ID')} &bull; ${escapeHtml(student.course || student.program || 'CHMSU Program')}</span>
          </div>
          <span class="badge badge--warning" style="font-size:0.75rem;padding:3px 8px;flex-shrink:0;">Pending Review</span>
        </div>

        <!-- Reason Selection & Textarea -->
        <div class="sp-reason-section">
          <div class="sp-reason-label">
            <span style="font-weight:600;font-size:0.88rem;">Reason for Rejection <span style="color:#EF4444;">*</span></span>
            <span style="font-size:0.75rem;color:var(--text-tertiary);">Visible to student on login</span>
          </div>

          <div class="sp-reason-chips">
            ${REASON_PRESETS.map((p, idx) => `
              <button type="button" class="sp-reason-chip ${idx === 0 ? 'is-active' : ''}" data-reason="${escapeHtml(p)}">${escapeHtml(p)}</button>
            `).join('')}
          </div>

          <textarea class="sp-reason-textarea" id="sp-rejection-reason" placeholder="Enter reason for declining this student registration..." style="font-size:0.88rem;">${escapeHtml(REASON_PRESETS[0])}</textarea>
        </div>

        <div class="sp-warning-box">
          ${icon('alertTriangle', 16)}
          <div style="font-size:0.82rem;">
            <strong>Student Access Restricted:</strong> This student will not be permitted to access the system and will see this reason when attempting to sign in.
          </div>
        </div>

        <div id="sp-reject-error" style="display:none;background:#FEE2E2;border:1px solid #FCA5A5;color:#991B1B;padding:10px 14px;border-radius:8px;font-size:0.82rem;"></div>
      </div>

      <div class="sp-action-modal__footer">
        <button class="btn btn--outline btn--sm" id="sp-reject-cancel" type="button">Cancel</button>
        <button class="btn btn--sm" id="sp-reject-confirm" type="button" style="background:#DC2626;color:#ffffff;border:1px solid #DC2626;gap:6px;font-weight:600;">
          ${icon('x', 14)} Confirm Rejection
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(backdrop);

  const close = () => backdrop.remove();
  backdrop.querySelector('#sp-reject-close').addEventListener('click', close);
  backdrop.querySelector('#sp-reject-cancel').addEventListener('click', close);
  backdrop.addEventListener('click', e => { if (e.target === backdrop) close(); });

  const textarea = backdrop.querySelector('#sp-rejection-reason');
  const chips = backdrop.querySelectorAll('.sp-reason-chip');

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('is-active'));
      chip.classList.add('is-active');
      textarea.value = chip.dataset.reason;
      textarea.focus();
    });
  });

  textarea.addEventListener('input', () => {
    chips.forEach(c => {
      if (c.dataset.reason === textarea.value.trim()) {
        c.classList.add('is-active');
      } else {
        c.classList.remove('is-active');
      }
    });
  });

  const confirmBtn = backdrop.querySelector('#sp-reject-confirm');
  const errBox = backdrop.querySelector('#sp-reject-error');

  confirmBtn.addEventListener('click', async () => {
    const reason = textarea.value.trim();
    if (!reason) {
      errBox.textContent = 'Please specify a rejection reason before confirming.';
      errBox.style.display = 'block';
      textarea.focus();
      return;
    }

    confirmBtn.disabled = true;
    confirmBtn.innerHTML = `<span class="spinner-sm"></span> Rejecting…`;
    errBox.style.display = 'none';

    try {
      const res = await apiPost(apiEndpoint, { reason });
      close();
      if (typeof onRejected === 'function') onRejected(res);
    } catch (err) {
      errBox.textContent = err?.message || 'Failed to reject student registration.';
      errBox.style.display = 'block';
      confirmBtn.disabled = false;
      confirmBtn.innerHTML = `${icon('x', 14)} Confirm Rejection`;
    }
  });
}

export default function traineesPage(container) {
  const user = getState('user') || {};
  const programName = user.course || 'OJT';

  container.innerHTML = `
    <!-- ═══ Page Header ═══ -->
    <div class="tr2-page-head anim-fade-in-up">
      <div class="tr2-page-head__left">
        <div class="tr2-page-head__badge-row">
          <span class="tr2-program-pill">${escapeHtml(programName)} Program Coordinator</span>
          <span class="tr2-cohort-pill" id="tr2-cohort-count">Loading trainees…</span>
        </div>
        <h1 class="tr2-page-head__title">
          <span>My Trainees</span>
        </h1>
        <p class="tr2-page-head__sub">Monitor student deployment, verify host company assignments, and track real-time OJT training hours.</p>
      </div>
      <div class="tr2-page-head__actions">
        <button class="tr2-refresh-btn" id="trainee-refresh-btn" title="Refresh Trainee List">
          ${icon('refreshCw', 15)} <span>Refresh Data</span>
        </button>
        <button class="btn btn--outline btn--sm" onclick="location.hash='/map'" style="gap:7px;font-size:0.85rem;font-weight:600;padding:8px 14px;">
          ${icon('map', 15)} <span>Trainee Map</span>
        </button>
        <button class="btn btn--primary btn--sm" id="batch-register-btn" style="gap:7px;font-size:0.85rem;font-weight:600;padding:8px 16px;">
          ${icon('upload', 15)} <span>Batch Register</span>
        </button>
      </div>
    </div>

    <!-- ═══ Interactive KPI Metric Strip ═══ -->
    <div class="tr2-kpi-row anim-stagger" id="tr2-kpis">
      ${[1, 2, 3, 4].map(() => '<div class="skeleton skeleton--card" style="height:96px;border-radius:16px;"></div>').join('')}
    </div>

    <!-- ═══ Filter & Search Control Card ═══ -->
    <div class="tr2-control-card anim-fade-in-up">
      <!-- Status Tabs -->
      <div class="tr2-status-tabs" id="tr2-status-tabs">
        <button class="tr2-tab-btn is-active" data-status="">
          All Trainees <span class="tr2-tab-count" id="count-all">0</span>
        </button>
        <button class="tr2-tab-btn" data-status="Active OJT">
          Active OJT <span class="tr2-tab-count" id="count-active">0</span>
        </button>
        <button class="tr2-tab-btn" data-status="Pending Approval">
          Pending Approval <span class="tr2-tab-count tr2-tab-count--amber" id="count-pending">0</span>
        </button>
        <button class="tr2-tab-btn" data-status="Undeployed">
          Undeployed <span class="tr2-tab-count" id="count-undeployed">0</span>
        </button>
        <button class="tr2-tab-btn" data-status="Emergency">
          Leave &amp; Notice <span class="tr2-tab-count" id="count-emergency">0</span>
        </button>
      </div>

      <!-- Filter & Search Toolbar -->
      <div class="tr2-filter-toolbar">
        <div class="tr2-search-wrap">
          ${icon('search', 16)}
          <input class="tr2-search-input" id="trainee-search" placeholder="Search by student name, email, company, section, or student ID…" autocomplete="off" />
          <button class="tr2-search-clear" id="trainee-search-clear" aria-label="Clear search" style="display:none;" type="button">
            ${icon('x', 14)}
          </button>
        </div>

        <div class="tr2-filter-tools">
          <div class="tr2-select-wrap">
            ${icon('filter', 14)}
            <select class="tr2-select" id="trainee-section-filter" title="Filter by Section">
              <option value="">All Sections</option>
            </select>
          </div>

          <div class="tr2-select-wrap">
            ${icon('barChart2', 14)}
            <select class="tr2-select" id="trainee-sort-filter" title="Sort Trainees">
              <option value="name_asc">Sort: Name (A–Z)</option>
              <option value="name_desc">Sort: Name (Z–A)</option>
              <option value="progress_desc">Sort: Progress (High to Low)</option>
              <option value="progress_asc">Sort: Progress (Low to High)</option>
              <option value="hours_desc">Sort: Hours Rendered</option>
            </select>
          </div>

          <button class="btn btn--ghost btn--sm" id="trainee-reset-filters" style="display:none;padding:9px 12px;font-size:0.82rem;gap:5px;" title="Reset all filters" type="button">
            ${icon('x', 14)} Reset
          </button>
        </div>
      </div>
    </div>

    <!-- ═══ Redesigned Table Card (7 Neat Columns, No Student ID Column) ═══ -->
    <div class="tr2-table-card anim-fade-in-up">
      <div class="tr2-table-wrap">
        <table class="tr2-table" id="trainee-table">
          <thead>
            <tr>
              <th style="min-width:260px;">Student Trainee</th>
              <th style="width:125px;">Year Level</th>
              <th style="width:115px;">Section</th>
              <th style="min-width:200px;">Host Company</th>
              <th style="min-width:200px;">OJT Progress</th>
              <th style="width:155px;">Status</th>
              <th style="width:175px;text-align:right;">Actions</th>
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
  let activeStatusTab = '';
  let activeKpiKey = 'all';

  loadTrainees();

  async function loadTrainees(isManualRefresh = false) {
    const tbody = container.querySelector('#trainee-tbody');
    const refreshBtn = container.querySelector('#trainee-refresh-btn');

    if (isManualRefresh && refreshBtn) {
      refreshBtn.classList.add('is-spinning');
      refreshBtn.disabled = true;
    }

    if (!isManualRefresh) {
      showSkeleton(tbody, 6);
    }

    try {
      const res = await apiGet('/supervisor/trainees', { forceRefresh: true });
      if (!res || !res.success) throw new Error('Failed to load trainees');
      allTrainees = Array.isArray(res.data) ? res.data : [];

      // Update cohort badge
      const cohortBadge = container.querySelector('#tr2-cohort-count');
      if (cohortBadge) {
        cohortBadge.textContent = `${allTrainees.length} Enrolled Students`;
      }

      if (Array.isArray(res.sections)) {
        populateSectionFilter(res.sections);
      }

      renderKpis(allTrainees);
      updateTabCounts(allTrainees);
      applyFilters();
      handleDeepLink();

      if (isManualRefresh) {
        showToast('Trainee records updated successfully!', 'success');
      }
    } catch (err) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7">
            <div class="tr2-empty">
              <div class="tr2-empty__icon" style="background:#FEE2E2;color:#DC2626;">${icon('alertTriangle', 30)}</div>
              <h3 style="margin:4px 0 2px;font-size:1.15rem;font-weight:700;color:var(--text-primary);">Could not load trainees</h3>
              <p class="text-tertiary" style="margin:0 0 14px;font-size:0.9rem;">${escapeHtml(err.message)}</p>
              <button class="btn btn--outline btn--sm" id="tr2-retry-btn" style="font-weight:600;">Try Again</button>
            </div>
          </td>
        </tr>`;
      const retryBtn = tbody.querySelector('#tr2-retry-btn');
      if (retryBtn) retryBtn.addEventListener('click', () => loadTrainees(true));
    } finally {
      if (refreshBtn) {
        refreshBtn.classList.remove('is-spinning');
        refreshBtn.disabled = false;
      }
    }
  }

  function handleDeepLink() {
    const raw = window.location.hash.slice(1);
    if (!raw.includes('?')) return;
    const search = raw.slice(raw.indexOf('?') + 1);
    const params = new URLSearchParams(search);
    const targetStudentId = parseInt(params.get('student_id'), 10);
    const action = params.get('action');

    if (targetStudentId && action === 'review_emergency') {
      const target = allTrainees.find(x => x.id === targetStudentId);
      if (target && target.emergency_request) {
        openReviewEmergencyModal({
          trainee: target,
          onReviewed: () => loadTrainees(),
        });
        window.history.replaceState(null, '', '#/trainees');
      }
    }
  }

  /* ── Skeleton loader (7 Columns) ── */
  function showSkeleton(tbody, count = 6) {
    tbody.innerHTML = Array.from({ length: count }, () => `
      <tr style="opacity:0.45;">
        <td>
          <div class="tr2-trainee-cell">
            <div style="width:44px;height:44px;border-radius:50%;background:var(--bg-tertiary);flex-shrink:0;"></div>
            <div style="flex:1;">
              <div style="height:14px;width:140px;background:var(--bg-tertiary);border-radius:4px;margin-bottom:6px;"></div>
              <div style="height:11px;width:190px;background:var(--bg-tertiary);border-radius:4px;"></div>
            </div>
          </div>
        </td>
        <td><div style="height:13px;width:75px;background:var(--bg-tertiary);border-radius:4px;"></div></td>
        <td><div style="height:24px;width:70px;background:var(--bg-tertiary);border-radius:6px;"></div></td>
        <td><div style="height:14px;width:140px;background:var(--bg-tertiary);border-radius:4px;"></div></td>
        <td><div style="height:14px;width:120px;background:var(--bg-tertiary);border-radius:4px;"></div></td>
        <td><div style="height:26px;width:95px;background:var(--bg-tertiary);border-radius:999px;"></div></td>
        <td style="text-align:right;"><div style="height:32px;width:80px;background:var(--bg-tertiary);border-radius:8px;display:inline-block;"></div></td>
      </tr>`).join('');
  }

  /* ── Interactive KPI Summary Metrics ── */
  function renderKpis(list) {
    const total      = list.length;
    const activeOjt  = list.filter(t => t.status === 'Active OJT').length;
    const placed     = list.filter(t => t.hasPlacement).length;
    const pending    = list.filter(t => t.approval_status === 'pending' || t.emergency_status !== 'none' || t.pull_out_status === 'pending_supervisor').length;

    const kpiData = [
      { key: 'all',     label: 'Total Trainees',    val: total,     sub: 'Enrolled cohort',       ic: 'users',       bg: 'rgba(0, 89, 48, 0.08)', color: '#005930' },
      { key: 'active',  label: 'Active OJT',        val: activeOjt, sub: 'Rendering hours',        ic: 'checkCircle', bg: 'rgba(16, 185, 129, 0.12)', color: '#059669' },
      { key: 'placed',  label: 'Company Placed',    val: placed,    sub: 'Host assignments',       ic: 'briefcase',   bg: 'rgba(37, 99, 235, 0.12)', color: '#2563EB' },
      { key: 'pending', label: 'Action Needed',     val: pending,   sub: 'Approvals & leaves',    ic: 'clock',       bg: 'rgba(245, 158, 11, 0.12)', color: '#D97706' },
    ];

    const kpiRow = container.querySelector('#tr2-kpis');
    kpiRow.innerHTML = kpiData.map(k => `
      <div class="tr2-kpi ${activeKpiKey === k.key ? 'is-selected' : ''}" data-kpi="${k.key}">
        <div class="tr2-kpi__icon" style="background:${k.bg};color:${k.color};">
          ${icon(k.ic, 24)}
        </div>
        <div class="tr2-kpi__content">
          <div class="tr2-kpi__val">${k.val}</div>
          <div class="tr2-kpi__lbl">${k.label}</div>
          <div class="tr2-kpi__sub">${k.sub}</div>
        </div>
      </div>`).join('');

    // Wire up click-to-filter on KPI cards
    kpiRow.querySelectorAll('.tr2-kpi').forEach(card => {
      card.addEventListener('click', () => {
        const key = card.dataset.kpi;
        activeKpiKey = key;
        kpiRow.querySelectorAll('.tr2-kpi').forEach(c => c.classList.remove('is-selected'));
        card.classList.add('is-selected');

        // Sync with status tabs
        if (key === 'all') {
          activeStatusTab = '';
        } else if (key === 'active') {
          activeStatusTab = 'Active OJT';
        } else if (key === 'pending') {
          activeStatusTab = 'Pending Approval';
        } else if (key === 'placed') {
          activeStatusTab = 'Placed';
        }

        syncStatusTabUi();
        currentPage = 1;
        applyFilters();
      });
    });
  }

  function updateTabCounts(list) {
    const total      = list.length;
    const active     = list.filter(t => t.status === 'Active OJT').length;
    const pending    = list.filter(t => t.approval_status === 'pending').length;
    const undeployed = list.filter(t => t.status === 'Undeployed').length;
    const emergency  = list.filter(t => t.emergency_status !== 'none' || t.status.includes('Leave') || t.status.includes('Emergency')).length;

    const setEl = (id, val) => {
      const el = container.querySelector(id);
      if (el) el.textContent = val;
    };

    setEl('#count-all', total);
    setEl('#count-active', active);
    setEl('#count-pending', pending);
    setEl('#count-undeployed', undeployed);
    setEl('#count-emergency', emergency);
  }

  function syncStatusTabUi() {
    container.querySelectorAll('.tr2-tab-btn').forEach(btn => {
      const btnStatus = btn.dataset.status;
      if (btnStatus === activeStatusTab) {
        btn.classList.add('is-active');
      } else {
        btn.classList.remove('is-active');
      }
    });
  }

  /* ── Populate dynamic sections ── */
  function populateSectionFilter(sections) {
    const sel = container.querySelector('#trainee-section-filter');
    if (!sel) return;
    const current = sel.value;
    sel.innerHTML = '<option value="">All Sections</option>' +
      sections.map(s => `<option value="${escapeHtml(s)}"${s === current ? ' selected' : ''}>Section ${escapeHtml(s)}</option>`).join('');
  }

  /* ── Event listeners for filtering ── */
  const searchInput    = container.querySelector('#trainee-search');
  const searchClear    = container.querySelector('#trainee-search-clear');
  const sectionSelect  = container.querySelector('#trainee-section-filter');
  const sortSelect     = container.querySelector('#trainee-sort-filter');
  const resetBtn       = container.querySelector('#trainee-reset-filters');
  const statusTabsWrap = container.querySelector('#tr2-status-tabs');
  const refreshBtn     = container.querySelector('#trainee-refresh-btn');

  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => loadTrainees(true));
  }

  // Status Tab Clicks
  if (statusTabsWrap) {
    statusTabsWrap.querySelectorAll('.tr2-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        statusTabsWrap.querySelectorAll('.tr2-tab-btn').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        activeStatusTab = btn.dataset.status || '';

        // Update active KPI key sync
        if (activeStatusTab === '') activeKpiKey = 'all';
        else if (activeStatusTab === 'Active OJT') activeKpiKey = 'active';
        else if (activeStatusTab === 'Pending Approval') activeKpiKey = 'pending';
        else activeKpiKey = '';

        container.querySelectorAll('#tr2-kpis .tr2-kpi').forEach(c => {
          c.classList.toggle('is-selected', c.dataset.kpi === activeKpiKey);
        });

        currentPage = 1;
        applyFilters();
      });
    });
  }

  let debounceTimer = null;
  searchInput.addEventListener('input', () => {
    const hasVal = Boolean(searchInput.value.trim());
    searchClear.style.display = hasVal ? 'flex' : 'none';

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      currentPage = 1;
      applyFilters();
    }, 200);
  });

  searchClear.addEventListener('click', () => {
    searchInput.value = '';
    searchClear.style.display = 'none';
    currentPage = 1;
    applyFilters();
    searchInput.focus();
  });

  sectionSelect.addEventListener('change', () => {
    currentPage = 1;
    applyFilters();
  });

  sortSelect.addEventListener('change', () => {
    currentPage = 1;
    applyFilters();
  });

  resetBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchClear.style.display = 'none';
    sectionSelect.value = '';
    sortSelect.value = 'name_asc';
    activeStatusTab = '';
    activeKpiKey = 'all';
    syncStatusTabUi();
    container.querySelectorAll('#tr2-kpis .tr2-kpi').forEach(c => {
      c.classList.toggle('is-selected', c.dataset.kpi === 'all');
    });
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
    const section = sectionSelect.value;
    const sortVal = sortSelect.value;

    const hasActiveFilters = Boolean(q || activeStatusTab || section || sortVal !== 'name_asc');
    resetBtn.style.display = hasActiveFilters ? 'inline-flex' : 'none';

    filteredTrainees = allTrainees.filter(t => {
      // Search matching: name, email, company, section, studentId
      if (q) {
        const nameMatch    = t.name && t.name.toLowerCase().includes(q);
        const emailMatch   = t.email && t.email.toLowerCase().includes(q);
        const compMatch    = t.company && t.company.toLowerCase().includes(q);
        const idMatch      = t.studentId && String(t.studentId).toLowerCase().includes(q);
        const sectionMatch = t.section && String(t.section).toLowerCase().includes(q);

        if (!nameMatch && !emailMatch && !compMatch && !idMatch && !sectionMatch) {
          return false;
        }
      }

      // Status matching
      if (activeStatusTab) {
        if (activeStatusTab === 'Pending Approval') {
          if (t.approval_status !== 'pending' && t.status !== 'Pending Approval') return false;
        } else if (activeStatusTab === 'Emergency') {
          if (t.emergency_status === 'none' && !t.status.includes('Leave') && !t.status.includes('Emergency')) return false;
        } else if (activeStatusTab === 'Placed') {
          if (!t.hasPlacement) return false;
        } else {
          if (t.status !== activeStatusTab) return false;
        }
      }

      // Section matching
      if (section && t.section !== section) return false;

      return true;
    });

    // Sorting
    filteredTrainees.sort((a, b) => {
      if (sortVal === 'name_asc') {
        return (a.name || '').localeCompare(b.name || '');
      } else if (sortVal === 'name_desc') {
        return (b.name || '').localeCompare(a.name || '');
      } else if (sortVal === 'progress_desc') {
        const pctA = (a.requiredHours > 0 && a.completedHours > 0) ? (a.completedHours / a.requiredHours) : 0;
        const pctB = (b.requiredHours > 0 && b.completedHours > 0) ? (b.completedHours / b.requiredHours) : 0;
        return pctB - pctA;
      } else if (sortVal === 'progress_asc') {
        const pctA = (a.requiredHours > 0 && a.completedHours > 0) ? (a.completedHours / a.requiredHours) : 0;
        const pctB = (b.requiredHours > 0 && b.completedHours > 0) ? (b.completedHours / b.requiredHours) : 0;
        return pctA - pctB;
      } else if (sortVal === 'hours_desc') {
        return (b.completedHours || 0) - (a.completedHours || 0);
      }
      return 0;
    });

    renderTable();
  }

  /* ── Render table with pagination (7 Clean Columns) ── */
  function renderTable() {
    const tbody          = container.querySelector('#trainee-tbody');
    const paginationWrap = container.querySelector('#trainee-pagination-wrap');
    const pageInfo       = container.querySelector('#trainee-page-info');
    const pageControls   = container.querySelector('#trainee-page-controls');

    const totalItems = filteredTrainees.length;

    // Empty state (7 Columns)
    if (!totalItems) {
      paginationWrap.style.display = 'none';
      tbody.innerHTML = `
        <tr>
          <td colspan="7">
            <div class="tr2-empty">
              <div class="tr2-empty__icon">${icon('users', 34)}</div>
              <h3 style="margin:4px 0 2px;font-size:1.15rem;font-weight:700;color:var(--text-primary);">No trainees found</h3>
              <p class="text-tertiary" style="margin:0 0 14px;font-size:0.9rem;">No students matched your active filters or search query.</p>
              <button class="btn btn--outline btn--sm" id="empty-reset-btn" style="font-size:0.85rem;font-weight:600;">Clear all filters</button>
            </div>
          </td>
        </tr>`;
      const emptyReset = tbody.querySelector('#empty-reset-btn');
      if (emptyReset) {
        emptyReset.addEventListener('click', () => {
          searchInput.value = '';
          searchClear.style.display = 'none';
          sectionSelect.value = '';
          sortSelect.value = 'name_asc';
          activeStatusTab = '';
          activeKpiKey = 'all';
          syncStatusTabUi();
          container.querySelectorAll('#tr2-kpis .tr2-kpi').forEach(c => {
            c.classList.toggle('is-selected', c.dataset.kpi === 'all');
          });
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

    // Rows rendering (7 Columns)
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
          <!-- 1. Student Trainee (with Avatar, Name, Email, & Neat Student ID micro-pill) -->
          <td>
            <div class="tr2-trainee-cell">
              ${t.avatar_url
                ? `<img src="${storageUrl(t.avatar_url)}" alt="${escapeHtml(t.name)}" class="tr2-trainee-avatar" onerror="this.onerror=null;this.parentElement.innerHTML='<div class=\\'tr2-trainee-avatar--fallback\\'>${init}</div>';" />`
                : `<div class="tr2-trainee-avatar--fallback">${init}</div>`}
              <div class="tr2-trainee-info">
                <div class="tr2-trainee-name" title="${escapeHtml(t.name)}">${escapeHtml(t.name)}</div>
                <div class="tr2-trainee-meta">
                  <span class="tr2-trainee-email" title="${escapeHtml(t.email || '')}">${escapeHtml(t.email || 'No email')}</span>
                  ${REAL(t.studentId) ? `<span class="tr2-id-pill" title="Student ID Number">ID: ${escapeHtml(t.studentId)}</span>` : ''}
                </div>
              </div>
            </div>
          </td>

          <!-- 2. Year Level -->
          <td>
            <span style="font-size:0.925rem;font-weight:600;color:var(--text-primary);">${escapeHtml(t.year || '—')}</span>
          </td>

          <!-- 3. Section -->
          <td>
            ${REAL(t.section)
              ? `<span class="tr2-badge tr2-badge--section">Sec ${escapeHtml(t.section)}</span>`
              : `<span style="color:var(--text-tertiary);font-size:0.85rem;">—</span>`}
          </td>

          <!-- 4. Host Company -->
          <td>
            ${REAL(t.company)
              ? `<div class="tr2-company-cell">
                   <div class="tr2-company-name">
                     ${icon('building', 15)}
                     <span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:210px;" title="${escapeHtml(t.company)}">${escapeHtml(t.company)}</span>
                   </div>
                   ${REAL(t.supervisor) ? `<div class="tr2-company-sub" title="Supervisor: ${escapeHtml(t.supervisor)}">${escapeHtml(t.supervisor)}</div>` : ''}
                 </div>`
              : (t.is_pulled_out && t.previous_company
                  ? `<div class="tr2-company-cell">
                       <span class="tr2-undeployed-pill">${icon('clock', 13)} Undeployed</span>
                       <span style="font-size:0.75rem;color:var(--text-tertiary);padding-left:18px;">(Prev: ${escapeHtml(t.previous_company)})</span>
                     </div>`
                  : `<span class="tr2-undeployed-pill">${icon('clock', 13)} Undeployed</span>`)}
          </td>

          <!-- 5. OJT Training Progress -->
          <td>
            ${t.hasPlacement && t.requiredHours > 0 ? `
              <div class="tr2-prog-wrap">
                <div class="tr2-prog-header">
                  <span class="tr2-prog-hours">
                    <strong>${t.completedHours}</strong> / ${t.requiredHours}h
                    ${t.accreditedHours > 0 ? `<span style="font-size:0.72rem;color:#005930;font-weight:700;" title="${t.accreditedHours}h accredited from prior OJT">(+${t.accreditedHours}h)</span>` : ''}
                  </span>
                  <span class="tr2-prog-pct" style="color:${barColor};background:${pct >= 75 ? '#ECFDF5' : (pct >= 40 ? '#F0FDF4' : '#FEF3C7')};">${pct}%</span>
                </div>
                <div class="tr2-prog-track">
                  <div class="tr2-prog-fill" style="width:${pct}%;background:${barColor};"></div>
                </div>
              </div>
            ` : `
              <span style="font-size:0.85rem;color:var(--text-tertiary);font-style:italic;">—</span>
            `}
          </td>

          <!-- 6. Status & Badges -->
          <td style="white-space:nowrap;">
            ${t.approval_status === 'pending'
              ? `<span class="tr2-badge tr2-badge--warning">
                   <span class="tr2-badge-dot"></span>
                   <span>Pending Approval</span>
                 </span>`
              : `<span class="tr2-badge ${badgeCfg.cls}">
                   <span class="tr2-badge-dot"></span>
                   <span>${badgeCfg.text}</span>
                 </span>`}
            ${t.is_pulled_out ? `
              <div style="margin-top:4px;">
                <span class="badge" style="background:#FEE2E2;color:#991B1B;font-size:0.72rem;padding:3px 8px;font-weight:700;border-radius:4px;">
                  Pulled Out
                </span>
              </div>
            ` : ''}
            ${renderRequirementsIndicator(t)}
            ${t.flag ? `<div style="margin-top:4px;"><span class="badge badge--error" style="font-size:0.72rem;padding:2px 8px;border-radius:4px;">${icon('alertTriangle', 12)} Flagged</span></div>` : ''}
          </td>

          <!-- 7. Actions Column -->
          <td style="text-align:right;white-space:nowrap;">
            <div class="tr2-actions-group">
              ${t.approval_status === 'pending' ? `
                <button class="tr2-btn-action tr2-approve-btn" data-id="${t.id}" data-name="${escapeHtml(t.name)}" style="background:#005930;color:#ffffff;border:1px solid #005930;box-shadow:0 1px 3px rgba(0,89,48,0.2);" title="Approve student registration">
                  ${icon('check', 14)} Approve
                </button>
                <button class="tr2-btn-action tr2-reject-btn" data-id="${t.id}" data-name="${escapeHtml(t.name)}" style="background:#FFF1F2;color:#E11D48;border:1px solid #FECDD3;" title="Reject student registration">
                  ${icon('x', 14)} Reject
                </button>
                <button class="btn btn--outline btn--sm tr2-view-btn" data-id="${t.id}" style="padding:7px 11px;font-size:0.83rem;font-weight:600;" title="View Student Profile">
                  ${icon('eye', 14)}
                </button>
              ` : `
                ${t.emergency_status && t.emergency_status !== 'none' ? `
                  <button class="btn btn--outline btn--sm tr2-emer-btn" data-id="${t.id}" style="padding:6px 10px;font-size:0.78rem;gap:5px;font-weight:700;color:${t.emergency_status === 'pending' ? '#b45309' : (t.emergency_status === 'on_leave' ? (t.emergency_request?.has_fit_to_work ? '#059669' : '#0284c7') : '#dc2626')};border-color:${t.emergency_status === 'pending' ? 'rgba(245,158,11,0.5)' : (t.emergency_status === 'on_leave' ? (t.emergency_request?.has_fit_to_work ? 'rgba(16,185,129,0.5)' : 'rgba(2,132,199,0.5)') : 'rgba(239,68,68,0.5)')};background:${t.emergency_status === 'pending' ? 'rgba(245,158,11,0.08)' : (t.emergency_request?.has_fit_to_work ? 'rgba(16,185,129,0.1)' : 'transparent')};" title="${t.emergency_request?.has_fit_to_work ? 'Fit-to-Work Clearance Uploaded' : 'Review Emergency / Leave Notice'}">
                    ${icon(t.emergency_request?.has_fit_to_work ? 'shieldCheck' : 'alertTriangle', 14)} ${t.emergency_status === 'pending' ? 'Notice' : (t.emergency_status === 'on_leave' ? (t.emergency_request?.has_fit_to_work ? 'Clearance' : 'On Leave') : 'Withdrawn')}
                  </button>
                ` : ''}
                ${t.pull_out_status && t.pull_out_status !== 'none' ? `
                  <button class="btn btn--outline btn--sm tr2-pullout-btn" data-id="${t.id}" style="padding:6px 10px;font-size:0.78rem;gap:5px;color:#b91c1c;border-color:rgba(185,28,28,0.45);font-weight:700;background:rgba(185,28,28,0.06);" title="Review OJT Pull-Out Request">
                    ${icon('fileText', 14)} ${t.pull_out_status === 'pending_supervisor' ? 'Pull-Out' : (t.pull_out_status === 'approved' ? 'Pulled Out' : 'Pull-Out Rec.')}
                  </button>
                ` : ''}
                ${t.company_user_id ? `
                  <button class="btn btn--outline btn--sm tr2-chat-co-btn" data-company-id="${t.company_user_id}" style="padding:6px 10px;font-size:0.8rem;gap:5px;color:#0284c7;border-color:rgba(2,132,199,0.35);font-weight:600;" title="Message Host Company (${escapeHtml(t.company || 'Company')})">
                    ${icon('building', 14)} Company
                  </button>
                ` : ''}
                <button class="btn btn--outline btn--sm tr2-chat-btn" data-id="${t.id}" style="padding:6px 11px;font-size:0.8rem;gap:5px;color:var(--color-primary);font-weight:600;" title="Message student">
                  ${icon('messageCircle', 14)} Message
                </button>
                <button class="btn btn--primary btn--sm tr2-view-btn" data-id="${t.id}" style="padding:6px 13px;font-size:0.82rem;gap:5px;font-weight:600;" title="View Trainee Profile">
                  ${icon('eye', 14)} View
                </button>
              `}
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Wire up approve button clicks
    tbody.querySelectorAll('.tr2-approve-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const studentId = parseInt(btn.dataset.id, 10);
        const t = allTrainees.find(x => x.id === studentId);
        if (t) {
          openStudentApprovalModal({
            student: t,
            apiEndpoint: `/supervisor/trainees/${t.id}/approve`,
            onApproved: (res) => {
              showToast(res?.message || `${t.name} has been approved successfully!`, 'success');
              loadTrainees();
            }
          });
        }
      });
    });

    // Wire up reject button clicks
    tbody.querySelectorAll('.tr2-reject-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const studentId = parseInt(btn.dataset.id, 10);
        const t = allTrainees.find(x => x.id === studentId);
        if (t) {
          openStudentRejectionModal({
            student: t,
            apiEndpoint: `/supervisor/trainees/${t.id}/reject`,
            onRejected: (res) => {
              showToast(res?.message || `${t.name} registration declined.`, 'warning');
              loadTrainees();
            }
          });
        }
      });
    });

    // Wire up emergency review button clicks
    tbody.querySelectorAll('.tr2-emer-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const studentId = parseInt(btn.dataset.id, 10);
        const t = allTrainees.find(x => x.id === studentId);
        if (t) {
          openReviewEmergencyModal({
            trainee: t,
            onReviewed: () => {
              loadTrainees();
            }
          });
        }
      });
    });

    // Wire up pull-out review button clicks
    tbody.querySelectorAll('.tr2-pullout-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const studentId = parseInt(btn.dataset.id, 10);
        const t = allTrainees.find(x => x.id === studentId);
        if (t) {
          openReviewPullOutModal({
            trainee: t,
            onReviewed: () => {
              loadTrainees();
            }
          });
        }
      });
    });

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
      ${icon('chevronLeft', 15)}
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
      ${icon('chevronRight', 15)}
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

  /* ── Redesigned Profile Modal (Enlarged & Neat) ── */
  function openModal(t) {
    const root     = container.querySelector('#trainee-modal-root');
    const init     = initials(t.name);
    const targetHours = (t.requiredHours && t.requiredHours > 0) ? t.requiredHours : 600;
    const pct      = (targetHours > 0 && t.completedHours > 0)
      ? Math.min(100, Math.round((t.completedHours / targetHours) * 100))
      : 0;
    const badgeCfg = STATUS_BADGES[t.status] || { cls: 'tr2-badge--undeployed', text: t.status };
    const barColor = BAR_COLOR(pct);
    const info     = [t.course, t.year, t.section ? `Section ${t.section}` : null, t.studentId ? `ID: ${t.studentId}` : null].filter(REAL).join(' · ');

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
      ? t.dailyLogs.map(l => {
          const isAbsent = l.status === 'absent';
          const isExcused = l.status === 'excused';
          const isHalfDayAm = l.status === 'half_day_am';
          const isHalfDayPm = l.status === 'half_day_pm';
          const isPending = (l.approvalStatus || '') === 'pending_company';
          const isRejected = (l.approvalStatus || '') === 'rejected';

          let badgeText = 'recorded';
          let badgeClass = 'badge--warning';
          let hrsText = `${l.hoursCredited ?? l.hours}h`;

          if (isAbsent) {
            badgeText = 'Absent';
            badgeClass = 'badge--danger';
            hrsText = '0h';
          } else if (isExcused) {
            badgeText = 'Excused';
            badgeClass = 'badge--neutral';
            hrsText = '0h';
          } else if (isHalfDayAm) {
            badgeText = 'Half Day (AM)';
            badgeClass = 'badge--primary';
          } else if (isHalfDayPm) {
            badgeText = 'Half Day (PM)';
            badgeClass = 'badge--primary';
          } else if (isPending) {
            badgeText = 'Pending Review';
            badgeClass = 'badge--warning';
            hrsText = `${l.hours}h (Escrow)`;
          } else if (isRejected) {
            badgeText = 'Rejected';
            badgeClass = 'badge--danger';
            hrsText = `${l.hours}h (Rejected)`;
          } else {
            badgeText = escapeHtml(l.status || 'recorded');
            badgeClass = l.status === 'approved' ? 'badge--success' : 'badge--warning';
          }

          return `
          <div class="tr2-log-row">
            <span class="tr2-log-date">${l.date}</span>
            <span class="tr2-log-hrs">${hrsText}</span>
            <span class="tr2-log-task">${REAL(l.task) ? escapeHtml(l.task) : (l.outOfRangeReason ? `Off-site: ${escapeHtml(l.outOfRangeReason)}` : '—')}</span>
            <span class="badge ${badgeClass}" style="font-size:0.75rem;padding:2px 8px;font-weight:600;">${badgeText}</span>
          </div>`;
        }).join('')
      : `<p class="text-sm text-tertiary" style="padding:var(--space-3) 0;margin:0;">No daily time logs recorded yet.</p>`;

    root.innerHTML = `
      <div class="modal-backdrop" id="tr2-modal-bd">
        <div class="modal modal--scrollable" style="width:95vw;max-width:720px;border-radius:18px;box-shadow:var(--shadow-2xl);">
          <div class="modal__header" style="border-bottom:1px solid var(--border-default);padding:18px 24px;flex-shrink:0;">
            <div style="display:flex;align-items:center;gap:10px;">
              <span class="modal__title" style="font-size:1.15rem;font-weight:700;">Trainee Academic Profile</span>
              <span class="tr2-id-pill">${escapeHtml(t.studentId || 'No ID')}</span>
            </div>
            <button class="modal__close" id="tr2-cls" style="cursor:pointer;" aria-label="Close modal">${icon('x', 18)}</button>
          </div>
          <div class="modal__body" style="padding:24px;flex:1;min-height:0;overflow-y:auto;-webkit-overflow-scrolling:touch;">

            <!-- Identity Header -->
            <div class="tr2-modal-id">
              ${t.avatar_url
                ? `<img src="${storageUrl(t.avatar_url)}" alt="${escapeHtml(t.name)}" class="tr2-modal-avatar" style="object-fit:cover;border:2px solid var(--border-default);" onerror="this.onerror=null;this.parentElement.innerHTML='<div class=\\'tr2-modal-avatar\\' style=\\'background:var(--color-primary-bg);color:var(--color-primary);border:1px solid rgba(0,89,48,0.2);\\'>${init}</div>';" />`
                : `<div class="tr2-modal-avatar" style="background:var(--color-primary-bg);color:var(--color-primary);border:1px solid rgba(0,89,48,0.2);">${init}</div>`}
              <div class="tr2-modal-id__info">
                <h3>${escapeHtml(t.name)}</h3>
                ${info ? `<p style="font-size:0.9rem;color:var(--text-secondary);margin:0 0 6px;">${escapeHtml(info)}</p>` : ''}
                <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;margin-top:4px;">
                  ${t.email ? `<span style="font-size:0.84rem;color:var(--text-secondary);display:inline-flex;align-items:center;gap:6px;">${icon('mail', 14)} ${escapeHtml(t.email)}</span>` : ''}
                  ${REAL(t.phone) ? `<span style="font-size:0.84rem;color:var(--text-secondary);display:inline-flex;align-items:center;gap:6px;">${icon('phone', 14)} ${escapeHtml(t.phone)}</span>` : ''}
                </div>
              </div>
              <span class="tr2-badge ${badgeCfg.cls}" style="align-self:flex-start;">
                <span class="tr2-badge-dot"></span>
                <span>${badgeCfg.text}</span>
              </span>
            </div>

            <!-- Pending Student Approval Banner -->
            ${t.approval_status === 'pending' ? `
              <div class="sp-pending-banner" style="margin-bottom:20px;">
                <div class="sp-pending-banner__left">
                  <div class="sp-pending-banner__icon">
                    ${icon('clock', 20)}
                  </div>
                  <div>
                    <h4 class="sp-pending-banner__title">Awaiting Supervisor Verification &amp; Approval</h4>
                    <p class="sp-pending-banner__desc">This student self-registered and is waiting for your authorization before they can log in, access assignments, and submit daily time records.</p>
                  </div>
                </div>
                <div class="sp-pending-banner__actions">
                  <button type="button" class="btn btn--sm tr2-modal-approve-btn" style="background:#005930;color:#ffffff;border:1px solid #005930;gap:6px;font-weight:600;padding:8px 14px;">
                    ${icon('check', 14)} Approve Trainee
                  </button>
                  <button type="button" class="btn btn--sm tr2-modal-reject-btn" style="background:#FFF1F2;color:#E11D48;border:1px solid #FECDD3;gap:5px;font-weight:600;padding:8px 12px;">
                    ${icon('x', 14)} Reject
                  </button>
                </div>
              </div>
            ` : ''}

            <!-- Emergency & Leave Banner if applicable -->
            ${t.emergency_status && t.emergency_status !== 'none' ? `
              <div style="background:rgba(239,68,68,0.05);border:1.5px solid rgba(239,68,68,0.25);border-left:4px solid #dc2626;border-radius:14px;padding:16px 18px;margin-bottom:20px;">
                <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:14px;flex-wrap:wrap;">
                  <div style="display:flex;align-items:flex-start;gap:12px;">
                    <div style="width:38px;height:38px;border-radius:10px;background:rgba(239,68,68,0.12);color:#dc2626;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                      ${icon('alertTriangle', 20)}
                    </div>
                    <div>
                      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                        <strong style="font-size:0.92rem;color:#b91c1c;">Emergency Notice / Medical Leave Active</strong>
                        <span class="badge ${STATUS_BADGES[t.status]?.cls || 'badge--warning'}" style="font-size:0.75rem;padding:3px 8px;">
                          ${t.status}
                        </span>
                      </div>
                      <p style="margin:6px 0 0;font-size:0.84rem;color:var(--text-secondary);line-height:1.4;">
                        ${t.emergency_request?.type === 'permanent_withdrawal' ? 'Permanent OJT Stoppage Notice' : 'Temporary Leave of Absence'} &bull; Category: <strong>${(t.emergency_request?.category || '').replace(/_/g, ' ').toUpperCase()}</strong>
                      </p>
                      ${t.emergency_request?.has_fit_to_work ? `
                        <div style="margin-top:8px;display:inline-flex;align-items:center;gap:6px;background:rgba(16,185,129,0.12);color:#065f46;border:1px solid rgba(16,185,129,0.3);padding:5px 10px;border-radius:6px;font-size:0.8rem;font-weight:600;">
                          ${icon('shieldCheck', 15)} Fit-to-Work Clearance certificate submitted and awaiting review
                        </div>
                      ` : ''}
                      ${t.emergency_request?.reason ? `
                        <div style="margin-top:8px;font-size:0.82rem;color:var(--text-primary);background:var(--bg-card);padding:8px 12px;border-radius:8px;border:1px solid var(--border-default);">
                          <em>&ldquo;${escapeHtml(t.emergency_request.reason)}&rdquo;</em>
                        </div>
                      ` : ''}
                    </div>
                  </div>
                  <button class="btn btn--primary btn--sm tr2-modal-rev-emer-btn" style="gap:6px;background:${t.emergency_request?.has_fit_to_work ? '#059669' : '#dc2626'};border-color:${t.emergency_request?.has_fit_to_work ? '#059669' : '#dc2626'};font-size:0.82rem;font-weight:600;">
                    ${icon(t.emergency_request?.has_fit_to_work ? 'shieldCheck' : 'alertTriangle', 14)} ${t.emergency_request?.has_fit_to_work ? 'Inspect Fit-to-Work Clearance' : 'Review Emergency Decision'}
                  </button>
                </div>
              </div>
            ` : ''}

            <!-- Pull-Out Status Banner if applicable -->
            ${t.pull_out_status && t.pull_out_status !== 'none' ? `
              <div style="background:${t.pull_out_status === 'approved' ? 'rgba(16,185,129,0.06)' : 'rgba(245,158,11,0.06)'};border:1.5px solid ${t.pull_out_status === 'approved' ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'};border-left:4px solid ${t.pull_out_status === 'approved' ? '#059669' : '#d97706'};border-radius:14px;padding:16px 18px;margin-bottom:20px;">
                <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:14px;flex-wrap:wrap;">
                  <div style="display:flex;align-items:flex-start;gap:12px;">
                    <div style="width:38px;height:38px;border-radius:10px;background:${t.pull_out_status === 'approved' ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)'};color:${t.pull_out_status === 'approved' ? '#059669' : '#d97706'};display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                      ${icon('fileText', 20)}
                    </div>
                    <div>
                      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                        <strong style="font-size:0.92rem;color:${t.pull_out_status === 'approved' ? '#065F46' : '#92400e'};">
                          ${t.pull_out_status === 'approved' ? 'OJT Pull-Out Approved &middot; Cleared for Re-deployment' : (t.pull_out_status === 'pending_supervisor' ? 'Pull-Out Request Awaiting Your Review' : 'Pull-Out Under Dean Review')}
                        </strong>
                        <span class="badge" style="font-size:0.75rem;padding:3px 8px;background:${t.pull_out_status === 'approved' ? '#D1FAE5' : '#FEF3C7'};color:${t.pull_out_status === 'approved' ? '#065F46' : '#92400e'};">
                          ${t.pull_out_status.replace(/_/g, ' ').toUpperCase()}
                        </span>
                      </div>
                      <p style="margin:6px 0 0;font-size:0.84rem;color:var(--text-secondary);line-height:1.4;">
                        ${t.previous_company ? `Previous Host: <strong>${escapeHtml(t.previous_company)}</strong> &bull; ` : ''}Category: <strong>${(t.pull_out_request?.reason_category || '').replace(/_/g, ' ').toUpperCase()}</strong>
                        ${t.pull_out_request?.credited_hours !== null && t.pull_out_request?.credited_hours !== undefined ? ` &bull; Credited: <strong>${t.pull_out_request.credited_hours} hrs</strong>` : ''}
                      </p>
                    </div>
                  </div>
                  <button class="btn btn--outline btn--sm tr2-modal-rev-pullout-btn" style="gap:6px;color:#b91c1c;border-color:rgba(185,28,28,0.4);font-size:0.82rem;font-weight:600;">
                    ${icon('fileText', 14)} ${t.pull_out_status === 'pending_supervisor' ? 'Review & Recommend' : 'View Pull-Out Details'}
                  </button>
                </div>
              </div>
            ` : ''}

            <!-- Hours Progress -->
            <div class="tr2-modal-prog" style="background:var(--bg-secondary);padding:18px 20px;border-radius:14px;margin-bottom:20px;">
              <div class="tr2-modal-prog__labels" style="margin-bottom:8px;">
                <span style="font-size:0.84rem;font-weight:700;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.04em;">OJT Logged Hours</span>
                <strong style="color:${barColor};font-size:0.95rem;font-weight:700;">${t.completedHours} / ${targetHours} hrs · ${pct}%${!t.hasPlacement ? ' <span style="font-size:0.8rem;font-weight:500;color:var(--text-tertiary);">(Target)</span>' : ''}</strong>
              </div>
              <div class="tr2-prog-track" style="height:10px;background:var(--border-default);">
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
            };border-radius:14px;padding:18px 20px;margin-bottom:20px;">
              
              <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:12px;">
                <div style="display:flex;align-items:center;gap:12px;min-width:0;">
                  <div style="width:40px;height:40px;border-radius:10px;background:${
                    t.requirements?.status === 'verified' ? 'rgba(22,163,74,0.12)' :
                    t.requirements?.status === 'submitted' ? 'rgba(37,99,235,0.12)' :
                    'rgba(2,132,199,0.12)'
                  };color:${
                    t.requirements?.status === 'verified' ? '#16a34a' :
                    t.requirements?.status === 'submitted' ? '#2563eb' :
                    '#0284c7'
                  };display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                    ${icon(t.requirements?.status === 'verified' ? 'checkCircle' : 'folder', 20)}
                  </div>
                  <div>
                    <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                      <span style="font-size:0.88rem;font-weight:700;color:var(--text-primary);text-transform:uppercase;letter-spacing:0.04em;">
                        ${escapeHtml(t.requirements?.title || 'OJT Requirements Packet')}
                      </span>
                      ${t.requirements ? (
                        t.requirements.status === 'verified' ? `
                          <span class="badge badge--success" style="font-size:0.75rem;font-weight:700;padding:2px 8px;display:inline-flex;align-items:center;gap:4px;">
                            ${icon('checkCircle', 12)} All Documents Approved
                          </span>
                        ` : `
                          <span class="badge ${
                            t.requirements.status === 'submitted' ? 'badge--info' :
                            t.requirements.status === 'needs_revision' ? 'badge--warning' : 'badge--neutral'
                          }" style="font-size:0.74rem;text-transform:capitalize;font-weight:700;padding:2px 8px;">
                            ${t.requirements.status === 'submitted' ? 'Ready for Review' : (t.requirements.status === 'needs_revision' ? 'Revision Needed' : 'Not Submitted')}
                          </span>
                        `
                      ) : `
                        <span class="badge badge--neutral" style="font-size:0.74rem;font-weight:600;padding:2px 8px;">Not Assigned</span>
                      `}
                    </div>
                    <div style="font-size:0.84rem;color:var(--text-secondary);margin-top:3px;">
                      ${t.requirements?.status === 'verified'
                        ? `<span style="color:#16a34a;font-weight:600;">Verified &amp; Approved &middot; </span>`
                        : (t.requirements?.due_date ? `Due Date: <strong>${t.requirements.due_date}</strong> &middot; ` : '')}
                      ${Array.isArray(t.requirements?.items) ? `${t.requirements.items.length} required documents` : 'No checklist items assigned yet'}
                    </div>
                  </div>
                </div>

                <!-- Action Button in card -->
                <div>
                  <button type="button" class="btn btn--sm ${t.requirements?.status === 'submitted' ? 'btn--primary' : 'btn--outline'}" id="tr2-open-req-btn" style="gap:6px;font-size:0.84rem;font-weight:600;padding:7px 14px;">
                    ${t.requirements
                      ? (t.requirements.status === 'submitted' ? `${icon('checkSquare', 14)} Review Submission` : (t.requirements.status === 'verified' ? `${icon('checkCircle', 14)} View Verified Packet` : `${icon('list', 14)} Manage Packet`))
                      : `${icon('plus', 14)} Assign Requirements`
                    }
                  </button>
                </div>
              </div>

              <!-- Drive link sub-box -->
              <div style="background:var(--bg-card);border:1px solid var(--border-default);border-radius:10px;padding:10px 14px;display:flex;align-items:center;justify-content:space-between;gap:10px;">
                <div style="display:flex;align-items:center;gap:8px;min-width:0;flex:1;">
                  <span style="color:#0284c7;display:inline-flex;">${icon('externalLink', 15)}</span>
                  <div style="min-width:0;">
                    ${(t.requirements?.drive_url || t.requirements_drive_url) ? `
                      <a href="${t.requirements?.drive_url || t.requirements_drive_url}" target="_blank" rel="noopener" style="font-size:0.86rem;color:var(--text-primary);font-weight:600;text-decoration:underline;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${t.requirements?.drive_url || t.requirements_drive_url}">
                        ${escapeHtml(t.requirements?.drive_url || t.requirements_drive_url)}
                      </a>
                    ` : `
                      <span style="font-size:0.84rem;color:var(--text-tertiary);">No Google Drive link submitted by student yet</span>
                    `}
                  </div>
                </div>
                ${(t.requirements?.drive_url || t.requirements_drive_url) ? `
                  <a href="${t.requirements?.drive_url || t.requirements_drive_url}" target="_blank" rel="noopener" class="btn btn--ghost btn--xs" style="color:#0284c7;font-weight:700;font-size:0.8rem;gap:5px;white-space:nowrap;">
                    ${icon('externalLink', 12)} Open Folder
                  </a>
                ` : ''}
              </div>

              <!-- Instructions / remarks snippet -->
              ${t.requirements?.supervisor_remarks ? `
                <div style="margin-top:10px;font-size:0.82rem;color:#b45309;background:rgba(245,158,11,0.08);padding:8px 12px;border-radius:8px;border:1px solid rgba(245,158,11,0.2);">
                  <strong>Last Revision Note:</strong> ${escapeHtml(t.requirements.supervisor_remarks)}
                </div>
              ` : ''}
            </div>

            <!-- Placement Details -->
            <div class="tr2-modal-section">
              <h4 class="tr2-modal-sec-title">${icon('building', 16)} Placement Information</h4>
              ${placement.length ? `
                <div class="tr2-detail-grid">
                  ${placement.map(([k, v]) => `
                    <div class="tr2-detail-row">
                      <span>${escapeHtml(k)}</span>
                      <strong>${escapeHtml(v)}</strong>
                    </div>`).join('')}
                </div>` : `
                <div class="tr2-modal-empty" style="padding:18px;border:1px dashed var(--border-default);border-radius:12px;text-align:center;">
                  <p class="text-tertiary" style="margin:0;font-size:0.88rem;">No OJT host company placement recorded yet.</p>
                </div>`}
            </div>

            <!-- Flag alert -->
            ${t.flag ? `
              <div style="background:rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.25);border-radius:10px;padding:12px 16px;display:flex;align-items:center;gap:10px;color:#DC2626;font-size:0.85rem;margin-bottom:20px;">
                ${icon('alertTriangle', 16)} <strong>Needs Review:</strong> Student time logs or progress require supervisor attention.
              </div>` : ''}

            <!-- Daily Logs -->
            <div class="tr2-modal-section">
              <h4 class="tr2-modal-sec-title">${icon('clock', 16)} Recent Daily Time Records</h4>
              <div class="tr2-logs">${logsHtml}</div>
            </div>

          </div><!-- /.modal__body -->

          <!-- Actions Footer (Pinned) -->
          <div class="modal__footer" style="flex-shrink:0;border-top:1px solid var(--border-default);padding:14px 24px;display:flex;justify-content:flex-end;gap:10px;background:var(--bg-secondary);">
            <button class="btn btn--outline btn--sm" id="modal-close-btn" type="button" style="font-weight:600;font-size:0.86rem;">Close</button>
            ${t.approval_status === 'pending' ? `
              <button type="button" class="btn btn--sm tr2-modal-footer-reject-btn" style="background:#FFF1F2;color:#E11D48;border:1px solid #FECDD3;gap:5px;font-weight:600;font-size:0.86rem;">
                ${icon('x', 14)} Reject Registration
              </button>
              <button type="button" class="btn btn--primary btn--sm tr2-modal-footer-approve-btn" style="gap:6px;font-weight:600;background:#005930;border-color:#005930;font-size:0.86rem;">
                ${icon('check', 14)} Approve Student
              </button>
            ` : `
              ${(t.company_user_id || (t.company && t.company !== '—')) ? `
                <button type="button" class="btn btn--outline btn--sm tr2-modal-chat-co-btn" data-company-id="${t.company_user_id || ''}" style="gap:6px;color:#0284c7;border-color:rgba(2,132,199,0.35);font-size:0.86rem;font-weight:600;" title="Message Host Company (${escapeHtml(t.company || 'Company')})">
                  ${icon('building', 14)} Message Company
                </button>
              ` : ''}
              <button type="button" class="btn btn--primary btn--sm tr2-modal-chat-btn" data-id="${t.id}" style="gap:6px;font-size:0.86rem;font-weight:600;" title="Message Student (${escapeHtml(t.name)})">
                ${icon('messageCircle', 14)} Message Student
              </button>
            `}
          </div>
        </div>
      </div>`;

    const close = () => { root.innerHTML = ''; };
    root.querySelector('#tr2-cls').addEventListener('click', close);
    root.querySelector('#modal-close-btn').addEventListener('click', close);

    const triggerApprove = () => {
      close();
      openStudentApprovalModal({
        student: t,
        apiEndpoint: `/supervisor/trainees/${t.id}/approve`,
        onApproved: (res) => {
          showToast(res?.message || `${t.name} has been approved successfully!`, 'success');
          loadTrainees();
        }
      });
    };

    const triggerReject = () => {
      close();
      openStudentRejectionModal({
        student: t,
        apiEndpoint: `/supervisor/trainees/${t.id}/reject`,
        onRejected: (res) => {
          showToast(res?.message || `${t.name} registration declined.`, 'warning');
          loadTrainees();
        }
      });
    };

    root.querySelector('.tr2-modal-approve-btn')?.addEventListener('click', triggerApprove);
    root.querySelector('.tr2-modal-footer-approve-btn')?.addEventListener('click', triggerApprove);
    root.querySelector('.tr2-modal-reject-btn')?.addEventListener('click', triggerReject);
    root.querySelector('.tr2-modal-footer-reject-btn')?.addEventListener('click', triggerReject);
    root.querySelector('.tr2-modal-rev-emer-btn')?.addEventListener('click', () => {
      close();
      openReviewEmergencyModal({
        trainee: t,
        onReviewed: () => {
          loadTrainees();
        }
      });
    });
    root.querySelector('.tr2-modal-rev-pullout-btn')?.addEventListener('click', () => {
      close();
      openReviewPullOutModal({
        trainee: t,
        onReviewed: () => {
          loadTrainees();
        }
      });
    });
    root.querySelector('.tr2-modal-chat-co-btn')?.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      let compId = t.company_user_id;
      if (!compId && t.company && t.company !== '—') {
        try {
          const companiesRes = await apiGet('/chat/companies', { bypassCache: true });
          const found = (companiesRes?.data || []).find(c =>
            (c.name && c.name.toLowerCase().includes(t.company.toLowerCase())) ||
            (c.company_name && c.company_name.toLowerCase().includes(t.company.toLowerCase()))
          );
          if (found) compId = found.id;
        } catch (_) {}
      }
      close();
      if (compId && window.openCompanyChat) {
        window.openCompanyChat(compId);
      } else if (window.openChat) {
        window.openChat();
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
    root.querySelector('.tr2-modal-chat-btn')?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      close();
      if (window.openStudentChat) {
        window.openStudentChat(t.id);
      } else {
        openStudentChat(t.id);
      }
    });
    root.querySelector('#tr2-modal-bd').addEventListener('click', e => {
      if (e.target.id === 'tr2-modal-bd') close();
    });
  }

  async function openStudentChat(studentId) {
    if (window.openStudentChat) {
      window.openStudentChat(studentId);
      return;
    }
    try {
      const res = await apiGet(`/chat/init/coordinator/${studentId}`);
      if (res?.key && window.openChat) {
        window.openChat(res.key);
      }
    } catch (err) {
      console.error('Failed to open chat with student:', err);
    }
  }

  // ── Reactive Real-Time Event Listener ──
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
