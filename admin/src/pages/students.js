import { apiGet, apiGetCached, getCached, apiPost, storageUrl } from '../api/client.js';
import { icon, renderIcons } from '../components/icons.js';
import { openStudentImportModal } from '../components/student-import-modal.js';
import { openBroadcastModal } from '../components/broadcast-modal.js';

const STATUS_COLORS = {
  'Active OJT': 'success',
  'Undeployed': 'warning',
};

const COURSE_ACRONYM_MAP = {
  'Bachelor of Science in Information Technology': 'BSIT',
  'Bachelor of Science in Computer Science': 'BSCS',
  'Bachelor of Science in Information Systems': 'BSIS',
  'Bachelor of Science in Computer Engineering': 'BSCpE',
  'Bachelor of Science in Entertainment and Multimedia Computing': 'BSEMC',
  'Bachelor of Science in Industrial Technology': 'BSIndTech',
  'Bachelor of Science in Business Administration': 'BSBA',
  'Bachelor of Science in Accountancy': 'BSA',
  'Bachelor of Science in Hospitality Management': 'BSHM',
  'Bachelor of Science in Tourism Management': 'BSTM',
  'Bachelor of Science in Criminology': 'BSCrim',
  'Bachelor of Science in Nursing': 'BSN',
  'Bachelor of Science in Civil Engineering': 'BSCE',
  'Bachelor of Science in Mechanical Engineering': 'BSME',
  'Bachelor of Science in Electrical Engineering': 'BSEE',
  'Bachelor of Science in Electronics Engineering': 'BSECE',
  'Bachelor of Science in Agriculture': 'BSA',
  'Bachelor of Science in Fisheries': 'BSF',
  'Bachelor of Science in Psychology': 'BSPsych',
  'Bachelor of Secondary Education': 'BSED',
  'Bachelor of Elementary Education': 'BEED',
  'Bachelor of Technology and Livelihood Education': 'BTLED',
};

function formatCourseOption(course) {
  const acr = COURSE_ACRONYM_MAP[course];
  return acr ? `${course} (${acr})` : course;
}

function getCourseAcronym(course) {
  if (!course) return '—';
  return COURSE_ACRONYM_MAP[course] || course;
}

function initials(name = '') {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
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

/* ─── Toast Notification Helper ─────────────────────────────────── */
function showToast(msg, type = 'success') {
  const existing = document.getElementById('adm-students-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'adm-students-toast';
  const bg = type === 'error' ? '#DC2626' : type === 'warning' ? '#D97706' : type === 'info' ? '#2563EB' : '#005930';
  toast.style.cssText = `position:fixed;bottom:24px;right:24px;background:${bg};color:#ffffff;padding:12px 20px;border-radius:10px;font-size:0.84rem;font-weight:600;box-shadow:0 10px 25px rgba(0,0,0,0.2);z-index:999999;display:flex;align-items:center;gap:10px;animation:modalIn 0.2s ease;max-width:420px;line-height:1.4;`;
  toast.innerHTML = `<span>${type === 'error' ? icon('alert-triangle', 18) : icon('check', 18)}</span><span>${escapeHtml(msg)}</span>`;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.25s ease';
    setTimeout(() => toast.remove(), 250);
  }, 4000);
}

/* ─── Student Approval Modal ────────────────────────────────────── */
function openStudentApprovalModal({ student, onApproved, apiEndpoint = `/admin/students/${student.id}/approve` }) {
  const existing = document.querySelector('.modal-backdrop-sp-action');
  if (existing) existing.remove();

  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop modal-backdrop-sp-action';
  backdrop.style.zIndex = '1200';

  const init = initials(student.name);

  backdrop.innerHTML = `
    <div class="modal sp-action-modal anim-scale-in">
      <div class="sp-action-modal__header" style="background:linear-gradient(135deg,rgba(0,89,48,0.08),rgba(16,185,129,0.04));">
        <div class="sp-action-modal__header-left">
          <div class="sp-action-modal__icon sp-action-modal__icon--approve">
            ${icon('check', 20)}
          </div>
          <div>
            <h3 class="sp-action-modal__title">Approve Student Registration</h3>
            <p class="sp-action-modal__subtitle">Authorize self-registered account and activate student privileges</p>
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
              <span class="sp-student-card__id">${escapeHtml(student.student_id || student.studentId || 'No ID')}</span>
              <span class="sp-student-card__course">${escapeHtml(student.program || student.course || 'CHMSU Program')}</span>
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
                <strong>${escapeHtml(student.year_level || student.year || '—')}</strong>
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
            ${icon('check-circle', 15)}
            <div>
              <strong>Instant Account Activation:</strong> The student is unlocked to access the Student Portal, search partner companies, submit requirements, and log attendance hours.
            </div>
          </div>
          <div class="sp-activation-box__item">
            ${icon('mail', 15)}
            <div>
              <strong>Welcome Notification Sent:</strong> System sends in-app and email notifications informing the student their account is active.
            </div>
          </div>
        </div>

        <div id="sp-approve-error" style="display:none;background:#FEE2E2;border:1px solid #FCA5A5;color:#991B1B;padding:8px 12px;border-radius:6px;font-size:0.75rem;"></div>
      </div>

      <div class="sp-action-modal__footer">
        <button class="btn btn--outline btn--sm" id="sp-approve-cancel" type="button">Cancel</button>
        <button class="btn btn--primary btn--sm" id="sp-approve-confirm" type="button" style="background:#005930;border-color:#005930;gap:6px;">
          ${icon('check', 14)} Confirm &amp; Approve Student
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
      confirmBtn.innerHTML = `${icon('check', 14)} Confirm &amp; Approve Student`;
    }
  });
}

/* ─── Student Rejection Modal ───────────────────────────────────── */
function openStudentRejectionModal({ student, onRejected, apiEndpoint = `/admin/students/${student.id}/reject` }) {
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
    <div class="modal sp-action-modal anim-scale-in">
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
        <div style="background:var(--bg-surface,#f8fafc);border:1px solid var(--border-default,#e2e8f0);border-radius:10px;padding:10px 14px;display:flex;align-items:center;justify-content:space-between;gap:12px;">
          <div style="min-width:0;">
            <strong style="display:block;font-size:0.86rem;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(student.name)}</strong>
            <span style="font-size:0.75rem;color:var(--text-tertiary);">${escapeHtml(student.student_id || student.studentId || 'No ID')} &bull; ${escapeHtml(student.program || student.course || 'CHMSU Program')}</span>
          </div>
          <span class="badge badge--warning" style="font-size:0.68rem;flex-shrink:0;">Pending Review</span>
        </div>

        <!-- Reason Selection & Textarea -->
        <div class="sp-reason-section">
          <div class="sp-reason-label">
            <span>Reason for Rejection <span style="color:#EF4444;">*</span></span>
            <span style="font-size:0.7rem;color:var(--text-tertiary);">Visible to student on login</span>
          </div>

          <div class="sp-reason-chips">
            ${REASON_PRESETS.map((p, idx) => `
              <button type="button" class="sp-reason-chip ${idx === 0 ? 'is-active' : ''}" data-reason="${escapeHtml(p)}">${escapeHtml(p)}</button>
            `).join('')}
          </div>

          <textarea class="sp-reason-textarea" id="sp-rejection-reason" placeholder="Enter reason for declining this student registration...">${escapeHtml(REASON_PRESETS[0])}</textarea>
        </div>

        <div class="sp-warning-box">
          ${icon('alert-triangle', 15)}
          <div>
            <strong>Student Access Restricted:</strong> This student will not be permitted to access the system and will see this reason when attempting to sign in.
          </div>
        </div>

        <div id="sp-reject-error" style="display:none;background:#FEE2E2;border:1px solid #FCA5A5;color:#991B1B;padding:8px 12px;border-radius:6px;font-size:0.75rem;"></div>
      </div>

      <div class="sp-action-modal__footer">
        <button class="btn btn--outline btn--sm" id="sp-reject-cancel" type="button">Cancel</button>
        <button class="btn btn--sm" id="sp-reject-confirm" type="button" style="background:#DC2626;color:#ffffff;border:1px solid #DC2626;gap:6px;">
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

/* ─── Graduation Promotion Modal ─────────────────────────────────── */
function openPromoteModal({ students, onPromote, container }) {
  if (!students || !students.length) return;

  const existing = container.querySelector('.modal-backdrop-promote');
  if (existing) existing.remove();

  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop modal-backdrop-promote';
  backdrop.style.zIndex = '1000';

  const getDynamicSchoolYear = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // 1-12
    return month >= 6 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
  };

  const candidatePortfolioBatch = students.map(s => s.batch).find(b => b && String(b).trim() !== '');
  const defaultBatch = candidatePortfolioBatch ? candidatePortfolioBatch.trim() : getDynamicSchoolYear();

  backdrop.innerHTML = `
    <div class="modal gpm-modal anim-scale-in">
      <div class="gpm-header">
        <div class="gpm-header__left">
          <div class="gpm-header__icon">
            ${icon('graduation-cap', 22)}
          </div>
          <div>
            <h3 class="gpm-header__title">Promote to Alumni / Graduate</h3>
            <p class="gpm-header__sub">${students.length} student${students.length !== 1 ? 's' : ''} verified (Hours + Company Evaluation)</p>
          </div>
        </div>
        <button class="modal__close" id="gpm-close" aria-label="Close">${icon('x', 16)}</button>
      </div>

      <div class="gpm-body">
        <div class="gpm-alert">
          <div class="gpm-alert__title">
            ${icon('award', 15)} Dual-Gate Requirements Verified
          </div>
          <div>Each candidate has completed the required 600 hours of on-the-job training and received an approved performance evaluation from their host company. Promoting them updates their status to <strong>Graduate / Alumni</strong> and records them in the alumni network.</div>
        </div>

        <div>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
            <label class="gpm-field-label" for="gpm-batch-year" style="margin-bottom:0;">
              Graduation Batch / School Year
            </label>
            <span class="badge badge--info" style="font-size:0.7rem;font-weight:600;display:inline-flex;align-items:center;gap:4px;">
              ${icon('calendar', 11)} Auto-detected from Portfolio
            </span>
          </div>
          <input type="text" id="gpm-batch-year" class="gpm-input" value="${defaultBatch}" placeholder="e.g. ${defaultBatch}" />
          <div style="font-size:var(--text-xs);color:var(--text-secondary);margin-top:5px;display:flex;align-items:center;gap:4px;">
            ${icon('info', 11)} Auto-filled with 4th Year Academic School Year (S.Y. ${defaultBatch}). You can edit if needed.
          </div>
        </div>

        <div>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
            <label class="gpm-field-label" style="margin-bottom:0;">
              Selected Candidate${students.length !== 1 ? 's' : ''}
            </label>
            <span class="badge badge--neutral" style="font-size:0.7rem;font-weight:600;">
              ${students.length} Total
            </span>
          </div>
          <div class="gpm-students-list">
            ${students.map(st => `
              <div class="gpm-student-item">
                <div>
                  <div class="gpm-student-item__name">${st.name}</div>
                  <div class="gpm-student-item__meta">
                    ${st.program || 'No Program'}${st.section ? ' &middot; ' + st.section : ''} &middot; ID: ${st.student_id || '—'}
                    ${st.batch ? ` &middot; <strong style="color:var(--color-primary);">S.Y. ${st.batch}</strong>` : ''}
                  </div>
                </div>
                <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
                  <span class="badge badge--info" style="font-size:0.72rem;font-weight:600;display:inline-flex;align-items:center;gap:4px;">
                    ${icon('check-circle', 11)} ${st.ojt_hours}h / ${st.ojt_required || 600}h
                  </span>
                  <span class="badge badge--success" style="font-size:0.72rem;font-weight:600;display:inline-flex;align-items:center;gap:4px;">
                    <span style="color:#F59E0B;">★</span> ${Number(st.evaluation_score || 5).toFixed(1)} Eval
                  </span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <div class="gpm-footer">
        <button class="btn btn--outline btn--sm" id="gpm-cancel">Cancel</button>
        <button class="btn btn--primary btn--sm" id="gpm-confirm-btn" style="display:inline-flex;align-items:center;gap:6px;">
          ${icon('graduation-cap', 14)} Confirm & Promote
        </button>
      </div>
    </div>
  `;

  container.appendChild(backdrop);
  renderIcons();

  const close = () => backdrop.remove();
  backdrop.querySelector('#gpm-close').addEventListener('click', close);
  backdrop.querySelector('#gpm-cancel').addEventListener('click', close);
  backdrop.addEventListener('click', e => { if (e.target === backdrop) close(); });

  const confirmBtn = backdrop.querySelector('#gpm-confirm-btn');
  confirmBtn.addEventListener('click', async () => {
    const batch = backdrop.querySelector('#gpm-batch-year').value.trim() || defaultBatch;
    const studentIds = students.map(s => s.id);

    confirmBtn.disabled = true;
    confirmBtn.innerHTML = `<span class="sim-spinner"></span> Promoting...`;

    try {
      const res = await apiPost('/admin/students/promote-graduates', {
        student_ids: studentIds,
        batch,
      });

      if (res && res.success) {
        close();
        if (typeof onPromote === 'function') onPromote(res);
      } else {
        alert(res?.message || 'Failed to promote students. Please verify all requirements.');
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = `${icon('graduation-cap', 14)} Confirm & Promote`;
        renderIcons();
      }
    } catch (err) {
      alert('Error promoting students: ' + (err.message || 'Network error'));
      confirmBtn.disabled = false;
      confirmBtn.innerHTML = `${icon('graduation-cap', 14)} Confirm & Promote`;
      renderIcons();
    }
  });
}

/* ─── Modal ─────────────────────────────────────────────────────── */
function showModal(s, container, onRefresh) {
  const existing = container.querySelector('.modal-backdrop');
  if (existing) existing.remove();

  const pct = s.ojt_required > 0
    ? Math.min(100, Math.round((s.ojt_hours / s.ojt_required) * 100))
    : 0;

  const statusKey = s.status === 'Active OJT' ? 'ojt' : 'other';

  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.innerHTML = `
    <div class="modal spm-modal">
      <!-- Hero -->
      <div class="spm-hero">
        <div class="spm-hero__inner">
          <div class="spm-hero__avatar">
            ${s.avatar_url
              ? `<img src="${storageUrl(s.avatar_url)}" alt="${s.name}" />`
              : initials(s.name)}
          </div>
          <div class="spm-hero__info">
            <h3 class="spm-hero__name">${s.name}</h3>
            <p class="spm-hero__program">${s.program || 'No Program'}${s.year_level ? ' &middot; ' + s.year_level : ''}</p>
            <div class="spm-hero__badges">
              <span class="spm-badge spm-badge--${statusKey}">
                <span class="spm-badge__dot"></span>${s.status}
              </span>
              <span class="spm-badge">${icon('mail', 11)} ${s.email}</span>
            </div>
          </div>
        </div>
        <button class="spm-hero__close" id="modal-close" aria-label="Close">${icon('x', 16)}</button>
      </div>

      <!-- Body -->
      <div class="spm-body">
        ${s.approval_status === 'pending' ? `
          <div class="sp-pending-banner">
            <div class="sp-pending-banner__left">
              <div class="sp-pending-banner__icon">
                ${icon('clock', 18)}
              </div>
              <div>
                <h4 class="sp-pending-banner__title">Awaiting Admin Verification & Approval</h4>
                <p class="sp-pending-banner__desc">This student self-registered and requires authorization before they can log in, access placements, and track OJT hours.</p>
              </div>
            </div>
            <div class="sp-pending-banner__actions">
              <button type="button" class="btn btn--sm spm-approve-btn" style="background:#005930;color:#ffffff;border:1px solid #005930;gap:5px;font-weight:600;">
                ${icon('check', 13)} Approve Student
              </button>
              <button type="button" class="btn btn--sm spm-reject-btn" style="background:#FFF1F2;color:#E11D48;border:1px solid #FECDD3;gap:4px;font-weight:600;">
                ${icon('x', 13)} Reject
              </button>
            </div>
          </div>
        ` : ''}

        <!-- Quick stat tiles -->
        <div class="spm-tiles">
          <div class="spm-tile">
            <div class="spm-tile__icon">${icon('map-pin', 14)}</div>
            <span class="spm-tile__val">${s.campus || '—'}</span>
            <div class="spm-tile__lbl">Campus</div>
          </div>
          <div class="spm-tile">
            <div class="spm-tile__icon">${icon('users', 14)}</div>
            <span class="spm-tile__val">${s.section || '—'}</span>
            <div class="spm-tile__lbl">Section</div>
          </div>
          <div class="spm-tile">
            <div class="spm-tile__icon">${icon('calendar', 14)}</div>
            <span class="spm-tile__val">${s.batch || '—'}</span>
            <div class="spm-tile__lbl">Batch</div>
          </div>
          <div class="spm-tile">
            <div class="spm-tile__icon">${icon('award', 14)}</div>
            <span class="spm-tile__val">${s.year_level || '—'}</span>
            <div class="spm-tile__lbl">Year</div>
          </div>
        </div>

        <!-- OJT Progress -->
        <div>
          <div class="spm-sec-head">${icon('briefcase', 12)} OJT Progress</div>
          <div class="spm-ojt">
            <div class="spm-ojt__top">
              <span class="spm-ojt__company${!s.ojt_company ? ' spm-ojt__company--none' : ''}">
                ${s.ojt_company || 'Not yet assigned'}
              </span>
              <span class="spm-ojt__pct">${pct}%</span>
            </div>
            <div class="spm-ojt__track">
              <div class="spm-ojt__fill" data-pct="${pct}"></div>
            </div>
            <div class="spm-ojt__meta">
              <span>${s.ojt_hours || 0} / ${s.ojt_required || 0} hours logged</span>
              <span>${s.ojt_status || 'No record'}</span>
            </div>
          </div>
        </div>

        <!-- Host Company Evaluation Assessment -->
        <div>
          <div class="spm-sec-head">${icon('award', 12)} Host Company Performance Assessment</div>
          <div style="background:var(--bg-secondary);border:1px solid var(--border-default);border-radius:var(--radius-md);padding:12px 14px;">
            ${s.evaluation_status === 'submitted' ? `
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
                <div style="display:flex;align-items:center;gap:8px;">
                  <span class="badge badge--success" style="display:inline-flex;align-items:center;gap:4px;font-weight:700;">
                    ${icon('check-circle', 12)} Evaluation Verified
                  </span>
                  ${s.evaluation_date ? `<span style="font-size:var(--text-xs);color:var(--text-tertiary);">${s.evaluation_date}</span>` : ''}
                </div>
                <div style="font-size:var(--text-sm);font-weight:700;color:var(--text-primary);display:flex;align-items:center;gap:4px;">
                  <span style="color:#F59E0B;">★</span> ${Number(s.evaluation_score || 5).toFixed(1)} <span style="font-size:var(--text-xs);color:var(--text-tertiary);font-weight:var(--weight-normal);">/ 5.0</span>
                </div>
              </div>
              <div style="font-size:var(--text-xs);color:var(--text-secondary);display:flex;align-items:center;gap:6px;">
                ${icon('user-check', 13)} Evaluated by: <strong>${s.evaluator_name || 'Host Company Supervisor'}</strong> ${s.evaluator_position ? `(${s.evaluator_position})` : ''}
              </div>
            ` : s.evaluation_status === 'pending' ? `
              <div style="display:flex;align-items:center;gap:8px;">
                <span class="badge badge--warning" style="display:inline-flex;align-items:center;gap:4px;font-weight:600;">
                  ${icon('clock', 12)} Evaluation Pending
                </span>
                <span style="font-size:var(--text-xs);color:var(--text-secondary);">
                  Requested from ${s.ojt_company || 'Host Company'}. Required before graduation promotion.
                </span>
              </div>
            ` : `
              <div style="display:flex;align-items:center;gap:8px;">
                <span class="badge badge--neutral" style="display:inline-flex;align-items:center;gap:4px;font-size:var(--text-xs);color:var(--text-tertiary);">
                  ${icon('alert-circle', 12)} Not Evaluated
                </span>
                <span style="font-size:var(--text-xs);color:var(--text-secondary);">
                  Host company has not submitted an evaluation yet. Required before graduation promotion.
                </span>
              </div>
            `}
          </div>
        </div>

        <!-- Skills -->
        <div>
          <div class="spm-sec-head">${icon('layers', 12)} Skills</div>
          <div class="spm-skills">
            ${s.skills && s.skills.length
              ? s.skills.map(sk => `<span class="spm-skill">${sk}</span>`).join('')
              : `<span class="spm-skill spm-skill--empty">No skills listed yet</span>`}
          </div>
        </div>

        ${(s.portfolio_url || s.phone) ? `
        <!-- Links -->
        <div class="spm-links">
          ${s.portfolio_url
            ? `<a href="${s.portfolio_url}" target="_blank" rel="noopener noreferrer" class="spm-link-btn spm-link-btn--portfolio">${icon('link', 12)} Portfolio</a>`
            : ''}
          ${s.phone
            ? `<span class="spm-link-btn spm-link-btn--phone">${icon('phone', 12)} ${s.phone}</span>`
            : ''}
        </div>` : ''}
      </div>

      <!-- Footer -->
      <div class="spm-footer">
        <div class="spm-footer__id">
          ${icon('user', 12)}
          <span class="spm-footer__id-val">${s.student_id || 'No ID'}</span>
        </div>
        <div class="spm-footer__actions">
          <button class="btn btn--outline btn--sm" id="modal-cancel">Close</button>
          ${s.approval_status === 'pending' ? `
            <button type="button" class="btn btn--sm spm-footer-reject-btn" style="background:#FFF1F2;color:#E11D48;border:1px solid #FECDD3;gap:4px;font-weight:600;">
              ${icon('x', 13)} Reject Registration
            </button>
            <button type="button" class="btn btn--primary btn--sm spm-footer-approve-btn" style="gap:5px;font-weight:600;background:#005930;border-color:#005930;">
              ${icon('check', 13)} Approve Student
            </button>
          ` : `
            ${s.is_eligible_for_promotion ? `
              <button class="btn btn--primary btn--sm" id="modal-promote-btn" style="display:inline-flex;align-items:center;gap:6px;">
                ${icon('graduation-cap', 14)} Promote to Graduate
              </button>
            ` : `
              <span class="badge badge--neutral" title="${s.ineligible_reason || 'Dual-gate requirements not met'}" style="font-size:0.75rem;padding:6px 10px;cursor:help;display:inline-flex;align-items:center;gap:5px;background:var(--bg-secondary);border:1px solid var(--border-default);color:var(--text-secondary);">
                ${icon('lock', 12)} Promotion Locked: ${s.evaluation_status !== 'submitted' ? 'Evaluation Required' : 'Hours Incomplete'}
              </span>
            `}
          `}
          <a href="mailto:${s.email}" class="btn btn--outline btn--sm">${icon('mail', 13)} Contact</a>
        </div>
      </div>
    </div>
  `;

  container.appendChild(backdrop);
  renderIcons();

  // Animate OJT bar after paint
  requestAnimationFrame(() => {
    const fill = backdrop.querySelector('.spm-ojt__fill');
    if (fill) fill.style.width = (fill.dataset.pct || 0) + '%';
  });

  const close = () => backdrop.remove();
  backdrop.querySelector('#modal-close').addEventListener('click', close);
  backdrop.querySelector('#modal-cancel').addEventListener('click', close);
  backdrop.addEventListener('click', e => { if (e.target === backdrop) close(); });

  const triggerApprove = () => {
    close();
    openStudentApprovalModal({
      student: s,
      apiEndpoint: `/admin/students/${s.id}/approve`,
      onApproved: (res) => {
        showToast(res?.message || `Student ${s.name} approved successfully!`, 'success');
        if (typeof onRefresh === 'function') onRefresh();
      }
    });
  };

  const triggerReject = () => {
    close();
    openStudentRejectionModal({
      student: s,
      apiEndpoint: `/admin/students/${s.id}/reject`,
      onRejected: (res) => {
        showToast(res?.message || `Student registration rejected.`, 'info');
        if (typeof onRefresh === 'function') onRefresh();
      }
    });
  };

  backdrop.querySelector('.spm-approve-btn')?.addEventListener('click', triggerApprove);
  backdrop.querySelector('.spm-footer-approve-btn')?.addEventListener('click', triggerApprove);
  backdrop.querySelector('.spm-reject-btn')?.addEventListener('click', triggerReject);
  backdrop.querySelector('.spm-footer-reject-btn')?.addEventListener('click', triggerReject);

  const promoteBtn = backdrop.querySelector('#modal-promote-btn');
  if (promoteBtn) {
    promoteBtn.addEventListener('click', () => {
      openPromoteModal({
        students: [s],
        onPromote: () => {
          close();
          if (typeof onRefresh === 'function') onRefresh();
        },
        container,
      });
    });
  }
}

/* ─── Table rows renderer ───────────────────────────────────────── */
function renderTable(tbody, list, container, selectedStudents, updateSelectionUI, onRefresh) {
  const mobileContainer = container ? container.querySelector('#students-mobile-cards') : null;

  if (!list.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8">
          <div class="empty-state" style="padding:var(--space-8) var(--space-4);">
            <h3 class="empty-state__title">No students found</h3>
            <p class="empty-state__text">Try adjusting your search or filters</p>
          </div>
        </td>
      </tr>`;
    if (mobileContainer) {
      mobileContainer.innerHTML = `
        <div class="empty-state" style="padding:var(--space-6) var(--space-4);text-align:center;">
          <h3 class="empty-state__title" style="font-size:var(--text-base);margin-bottom:4px;">No students found</h3>
          <p class="empty-state__text" style="font-size:var(--text-xs);color:var(--text-secondary);">Try adjusting your search or filters</p>
        </div>`;
    }
    if (typeof updateSelectionUI === 'function') updateSelectionUI();
    return;
  }

  // 1. Generate Desktop & Tablet Table Rows
  tbody.innerHTML = list.map(s => {
    const pct = s.ojt_required > 0
      ? Math.min(100, Math.round((s.ojt_hours / s.ojt_required) * 100))
      : 0;
    const barColor = pct >= 100 ? '#3B82F6' : pct >= 40 ? '#10B981' : '#F59E0B';
    const isEligible = Boolean(s.is_eligible_for_promotion);
    const isChecked = selectedStudents ? selectedStudents.has(s.id) : false;

    // Distinct Section pill formatting (Section A / Section B)
    const secRaw = s.section ? String(s.section).trim() : '';
    const isSecA = secRaw === 'A' || secRaw === 'BSIT 4-A' || secRaw === '4-A' || secRaw === '4A';
    const isSecB = secRaw === 'B' || secRaw === 'BSIT 4-B' || secRaw === '4-B' || secRaw === '4B';
    const sectionBadge = isSecA
      ? `<span class="st-section-pill st-section-pill--A">Section A</span>`
      : isSecB
        ? `<span class="st-section-pill st-section-pill--B">Section B</span>`
        : secRaw
          ? `<span class="st-section-pill st-section-pill--neutral">${escapeHtml(secRaw)}</span>`
          : '';

    const programTitle = s.program || 'Bachelor of Science in Information Technology';
    const programAcr = getCourseAcronym(programTitle);

    return `
      <tr data-id="${s.id}" class="${isChecked ? 'is-selected' : ''}">
        <!-- Checkbox -->
        <td class="st-checkbox-cell">
          ${isEligible
            ? `<input type="checkbox" class="student-select-cb st-checkbox" data-id="${s.id}" ${isChecked ? 'checked' : ''} title="Eligible: Completed ${s.ojt_hours}h / ${s.ojt_required || 600}h OJT + Company Evaluated (${Number(s.evaluation_score || 5).toFixed(1)}★)" />`
            : `<input type="checkbox" disabled class="st-checkbox" title="Ineligible: ${escapeHtml(s.ineligible_reason || 'Requirements not met')}" style="cursor:not-allowed;opacity:0.25;" />`}
        </td>

        <!-- Student Identity -->
        <td class="st-student-cell">
          <div class="st-student-profile">
            ${s.avatar_url
              ? `<img src="${storageUrl(s.avatar_url)}" alt="${escapeHtml(s.name)}" class="st-student-avatar" />`
              : `<div class="st-student-avatar--initials">${initials(s.name)}</div>`}
            <div class="st-student-meta">
              <div class="st-student-name" title="${escapeHtml(s.name)}">${escapeHtml(s.name)}</div>
              <div class="st-student-email" title="${escapeHtml(s.email)}">${escapeHtml(s.email)}</div>
            </div>
          </div>
        </td>

        <!-- Student ID -->
        <td>
          <span class="st-id-badge">${escapeHtml(s.student_id || '—')}</span>
        </td>

        <!-- Program & Section -->
        <td class="st-program-cell">
          <div class="st-program-name" title="${escapeHtml(programTitle)}">${escapeHtml(programTitle)}</div>
          <div class="st-program-sub">
            <span>${escapeHtml(s.year_level || '4th Year')}</span>
            ${sectionBadge ? `<span>&bull;</span>${sectionBadge}` : ''}
          </div>
        </td>

        <!-- Host Company & Eval -->
        <td class="st-company-cell">
          ${s.ojt_company
            ? `<div class="st-company-name" title="${escapeHtml(s.ojt_company)}">
                ${icon('briefcase', 14)} <span>${escapeHtml(s.ojt_company)}</span>
               </div>
               <div>
                 ${s.evaluation_status === 'submitted'
                   ? `<span class="st-eval-badge st-eval-badge--submitted" title="Evaluated by ${escapeHtml(s.evaluator_name || 'Host Company')} on ${escapeHtml(s.evaluation_date || 'N/A')}"><span class="star">★</span> ${Number(s.evaluation_score || 5).toFixed(1)} Eval</span>`
                   : s.evaluation_status === 'pending'
                     ? `<span class="st-eval-badge st-eval-badge--pending">${icon('clock', 11)} Eval Pending</span>`
                     : `<span style="font-size:0.75rem;color:var(--text-tertiary);font-style:italic;">No Eval yet</span>`}
               </div>`
            : `<span class="st-undeployed-pill">${icon('briefcase', 13)} Undeployed</span>`}
        </td>

        <!-- OJT Progress -->
        <td class="st-progress-cell">
          ${s.ojt_required > 0 ? `
          <div class="st-progress-wrap">
            <div class="st-progress-header">
              <span class="st-progress-hours">${s.ojt_hours} / ${s.ojt_required} hrs</span>
              <span class="st-progress-pct">${pct}%</span>
            </div>
            <div class="st-progress-track">
              <div class="st-progress-fill" style="width:${pct}%;background:${barColor};"></div>
            </div>
          </div>` : `
            <span style="font-size:var(--text-xs);color:var(--text-tertiary);">—</span>
          `}
        </td>

        <!-- Status -->
        <td class="st-status-cell">
          ${s.approval_status === 'pending'
            ? `<span class="st-status-pill st-status-pill--pending">
                 <span class="st-status-dot"></span>
                 <span>Pending Approval</span>
               </span>`
            : s.status === 'Active OJT'
              ? `<span class="st-status-pill st-status-pill--active">
                   <span class="st-status-dot"></span>
                   <span>Active OJT</span>
                 </span>`
              : `<span class="st-status-pill st-status-pill--undeployed">
                   <span class="st-status-dot"></span>
                   <span>${escapeHtml(s.status || 'Undeployed')}</span>
                 </span>`}
        </td>

        <!-- Actions -->
        <td class="st-action-cell">
          <div class="st-action-group">
            ${s.approval_status === 'pending' ? `
              <button class="approve-btn btn btn--primary btn--sm" data-id="${s.id}" data-name="${escapeHtml(s.name)}" style="height:36px;padding:0 12px;font-size:0.775rem;gap:4px;" title="Approve student registration">
                ${icon('check', 13)} Approve
              </button>
              <button class="reject-btn btn btn--outline btn--sm" data-id="${s.id}" data-name="${escapeHtml(s.name)}" style="height:36px;padding:0 10px;font-size:0.775rem;color:#DC2626;border-color:#FCA5A5;gap:3px;" title="Reject student registration">
                ${icon('x', 13)} Reject
              </button>
              <button class="view-btn st-btn-view" data-id="${s.id}" title="View Student Details">
                ${icon('eye', 14)} View
              </button>
            ` : `
              <button class="view-btn st-btn-view" data-id="${s.id}">
                ${icon('eye', 14)} View
              </button>
            `}
          </div>
        </td>
      </tr>
    `;
  }).join('');

  // 2. Generate Mobile Responsive Card View (< 768px)
  if (mobileContainer) {
    mobileContainer.innerHTML = list.map(s => {
      const pct = s.ojt_required > 0
        ? Math.min(100, Math.round((s.ojt_hours / s.ojt_required) * 100))
        : 0;
      const barColor = pct >= 100 ? '#3B82F6' : pct >= 40 ? '#10B981' : '#F59E0B';
      const isEligible = Boolean(s.is_eligible_for_promotion);
      const isChecked = selectedStudents ? selectedStudents.has(s.id) : false;
      const secRaw = s.section ? String(s.section).trim() : '';
      const isSecA = secRaw === 'A' || secRaw === 'BSIT 4-A' || secRaw === '4-A' || secRaw === '4A';
      const isSecB = secRaw === 'B' || secRaw === 'BSIT 4-B' || secRaw === '4-B' || secRaw === '4B';
      const sectionBadge = isSecA
        ? `<span class="st-section-pill st-section-pill--A">Section A</span>`
        : isSecB
          ? `<span class="st-section-pill st-section-pill--B">Section B</span>`
          : secRaw
            ? `<span class="st-section-pill st-section-pill--neutral">${escapeHtml(secRaw)}</span>`
            : '';
      const programTitle = s.program || 'Bachelor of Science in Information Technology';

      return `
        <div class="st-mobile-card ${isChecked ? 'is-selected' : ''}" data-id="${s.id}">
          <div class="st-mobile-card__header">
            <div class="st-mobile-card__user">
              ${isEligible
                ? `<input type="checkbox" class="student-select-cb st-checkbox" data-id="${s.id}" ${isChecked ? 'checked' : ''} style="margin-right:2px;" />`
                : ''}
              ${s.avatar_url
                ? `<img src="${storageUrl(s.avatar_url)}" alt="${escapeHtml(s.name)}" class="st-student-avatar" />`
                : `<div class="st-student-avatar--initials">${initials(s.name)}</div>`}
              <div style="min-width:0;flex:1;">
                <div class="st-student-name">${escapeHtml(s.name)}</div>
                <div class="st-student-email">${escapeHtml(s.email)}</div>
              </div>
            </div>
            <div>
              ${s.status === 'Active OJT'
                ? `<span class="st-status-pill st-status-pill--active"><span class="st-status-dot"></span> Active</span>`
                : `<span class="st-status-pill st-status-pill--undeployed"><span class="st-status-dot"></span> ${escapeHtml(s.status || 'Undeployed')}</span>`}
            </div>
          </div>

          <div class="st-mobile-card__grid">
            <div class="st-mobile-card__grid-item">
              <span class="st-mobile-card__grid-label">Student ID</span>
              <span class="st-mobile-card__grid-value font-mono">${escapeHtml(s.student_id || '—')}</span>
            </div>
            <div class="st-mobile-card__grid-item">
              <span class="st-mobile-card__grid-label">Section &amp; Year</span>
              <div style="display:flex;align-items:center;gap:4px;margin-top:2px;">
                ${sectionBadge || '—'}
                <span style="font-size:0.75rem;color:var(--text-secondary);">${escapeHtml(s.year_level || '4th Year')}</span>
              </div>
            </div>
            <div class="st-mobile-card__grid-item" style="grid-column: span 2;">
              <span class="st-mobile-card__grid-label">Degree Program</span>
              <span class="st-mobile-card__grid-value" style="font-size:0.8rem;">${escapeHtml(programTitle)}</span>
            </div>
            <div class="st-mobile-card__grid-item" style="grid-column: span 2;">
              <span class="st-mobile-card__grid-label">Host Company</span>
              <span class="st-mobile-card__grid-value">${escapeHtml(s.ojt_company || 'Undeployed (No host company)')}</span>
            </div>
          </div>

          <!-- OJT Progress -->
          ${s.ojt_required > 0 ? `
          <div class="st-progress-wrap" style="padding:0 2px;">
            <div class="st-progress-header">
              <span class="st-progress-hours">OJT Progress: ${s.ojt_hours} / ${s.ojt_required} hrs</span>
              <span class="st-progress-pct">${pct}%</span>
            </div>
            <div class="st-progress-track">
              <div class="st-progress-fill" style="width:${pct}%;background:${barColor};"></div>
            </div>
          </div>` : ''}

          <div class="st-mobile-card__actions">
            ${s.approval_status === 'pending' ? `
              <button class="approve-btn btn btn--primary btn--sm" data-id="${s.id}" data-name="${escapeHtml(s.name)}" style="flex:1;height:42px;">
                ${icon('check', 14)} Approve
              </button>
              <button class="reject-btn btn btn--outline btn--sm" data-id="${s.id}" data-name="${escapeHtml(s.name)}" style="flex:1;height:42px;color:#DC2626;">
                ${icon('x', 14)} Reject
              </button>
            ` : ''}
            <button class="view-btn st-btn-view" data-id="${s.id}">
              ${icon('eye', 14)} View Student Details
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  renderIcons();

  // Attach unified event handlers across both Table rows and Mobile cards
  const root = container || tbody;

  // Approve student action
  root.querySelectorAll('.approve-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.id, 10);
      const student = list.find(s => s.id === id);
      if (student) {
        openStudentApprovalModal({
          student,
          apiEndpoint: `/admin/students/${student.id}/approve`,
          onApproved: (res) => {
            showToast(res?.message || `Student ${student.name} approved successfully!`, 'success');
            if (typeof onRefresh === 'function') onRefresh();
          }
        });
      }
    });
  });

  // Reject student action
  root.querySelectorAll('.reject-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = parseInt(btn.dataset.id, 10);
      const student = list.find(s => s.id === id);
      if (student) {
        openStudentRejectionModal({
          student,
          apiEndpoint: `/admin/students/${student.id}/reject`,
          onRejected: (res) => {
            showToast(res?.message || `Student registration rejected.`, 'info');
            if (typeof onRefresh === 'function') onRefresh();
          }
        });
      }
    });
  });

  // Checkbox selection handling (syncing both desktop and mobile inputs)
  root.querySelectorAll('.student-select-cb').forEach(cb => {
    cb.addEventListener('change', () => {
      const id = parseInt(cb.dataset.id, 10);
      const student = list.find(s => s.id === id);
      if (student) {
        if (cb.checked) {
          selectedStudents.set(id, student);
        } else {
          selectedStudents.delete(id);
        }
        // Mirror state across both views
        root.querySelectorAll(`.student-select-cb[data-id="${id}"]`).forEach(box => {
          box.checked = cb.checked;
        });
        if (typeof updateSelectionUI === 'function') updateSelectionUI();
      }
    });
  });

  root.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const st = list.find(s => String(s.id) === btn.dataset.id);
      if (st) showModal(st, container, onRefresh);
    });
  });

  if (typeof updateSelectionUI === 'function') updateSelectionUI();
}

/* ─── Skeleton loader ───────────────────────────────────────────── */
function showSkeleton(tbody, count = 8, container = null) {
  tbody.innerHTML = Array.from({ length: count }, () => `
    <tr class="st-skeleton-row" style="opacity: 0.6;">
      <td class="st-checkbox-cell"><div style="height:17px;width:17px;background:var(--bg-tertiary);border-radius:4px;margin:auto;"></div></td>
      <td class="st-student-cell">
        <div style="display:flex;align-items:center;gap:14px;">
          <div style="width:42px;height:42px;border-radius:var(--radius-lg);background:var(--bg-tertiary);flex-shrink:0;"></div>
          <div style="flex:1;">
            <div style="height:15px;width:140px;background:var(--bg-tertiary);border-radius:4px;margin-bottom:6px;"></div>
            <div style="height:12px;width:180px;background:var(--bg-tertiary);border-radius:4px;"></div>
          </div>
        </div>
      </td>
      <td><div style="height:26px;width:110px;background:var(--bg-tertiary);border-radius:6px;"></div></td>
      <td class="st-program-cell">
        <div style="height:15px;width:190px;background:var(--bg-tertiary);border-radius:4px;margin-bottom:6px;"></div>
        <div style="height:13px;width:110px;background:var(--bg-tertiary);border-radius:12px;"></div>
      </td>
      <td class="st-company-cell">
        <div style="height:15px;width:120px;background:var(--bg-tertiary);border-radius:4px;margin-bottom:6px;"></div>
        <div style="height:13px;width:75px;background:var(--bg-tertiary);border-radius:12px;"></div>
      </td>
      <td class="st-progress-cell">
        <div style="height:13px;width:90px;background:var(--bg-tertiary);border-radius:4px;margin-bottom:6px;"></div>
        <div style="height:8px;width:100%;background:var(--bg-tertiary);border-radius:9999px;"></div>
      </td>
      <td class="st-status-cell"><div style="height:26px;width:95px;background:var(--bg-tertiary);border-radius:9999px;"></div></td>
      <td class="st-action-cell"><div style="height:36px;width:75px;background:var(--bg-tertiary);border-radius:8px;display:inline-block;"></div></td>
    </tr>`).join('');

  const mobileContainer = container ? container.querySelector('#students-mobile-cards') : null;
  if (mobileContainer) {
    mobileContainer.innerHTML = Array.from({ length: 4 }, () => `
      <div class="st-mobile-card" style="opacity: 0.6;">
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="width:42px;height:42px;border-radius:var(--radius-lg);background:var(--bg-tertiary);"></div>
          <div style="flex:1;">
            <div style="height:14px;width:140px;background:var(--bg-tertiary);border-radius:4px;margin-bottom:6px;"></div>
            <div style="height:11px;width:170px;background:var(--bg-tertiary);border-radius:4px;"></div>
          </div>
        </div>
        <div style="height:50px;background:var(--bg-primary);border-radius:var(--radius-lg);"></div>
        <div style="height:36px;background:var(--bg-tertiary);border-radius:var(--radius-md);"></div>
      </div>`).join('');
  }
}

/* ─── Main page ─────────────────────────────────────────────────── */
export default async function StudentsPage(container) {
  container.innerHTML = `
    <div class="st-page">
      <!-- Header -->
      <div class="st-header">
        <div class="st-header__title-group">
          <h1 class="st-header__title">
            <span>Students</span>
          </h1>
          <p class="st-header__subtitle">Academic records, section placement, OJT progress, and graduation readiness</p>
        </div>
        <div class="st-header__actions" style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
          <button class="btn btn--outline btn--sm" id="broadcast-students-btn" style="display:inline-flex;align-items:center;gap:6px;height:40px;padding:0 16px;border-radius:var(--radius-lg);font-weight:600;">
            ${icon('bell', 14)} Broadcast Notice
          </button>
          <button class="btn btn--primary btn--sm" id="import-students-btn" style="display:inline-flex;align-items:center;gap:6px;height:40px;padding:0 16px;border-radius:var(--radius-lg);font-weight:600;">
            ${icon('upload', 15)} Import Students
          </button>
        </div>
      </div>

      <!-- Executive KPI / Filter Quick Pills -->
      <div class="st-kpi-bar" id="student-kpi-bar">
        <div class="st-kpi-pill st-kpi-pill--primary">
          ${icon('users', 14)}
          <span>Total: <strong id="kpi-total-count">...</strong></span>
        </div>
        <div class="st-kpi-pill">
          <span>Section A: <strong id="kpi-sec-a">...</strong></span>
        </div>
        <div class="st-kpi-pill">
          <span>Section B: <strong id="kpi-sec-b">...</strong></span>
        </div>
        <div class="st-kpi-pill">
          <span>Active OJT: <strong id="kpi-active-ojt">...</strong></span>
        </div>
      </div>

      <!-- Responsive Toolbar -->
      <div class="st-toolbar">
        <div class="st-toolbar__left">
          <div class="st-search-box">
            ${icon('search', 16)}
            <input class="st-search-input" id="student-search" placeholder="Search by student name, email, or ID…" />
          </div>
          <select class="st-select" id="filter-course">
            <option value="">All Courses</option>
          </select>
          <select class="st-select" id="filter-section">
            <option value="">All Sections</option>
          </select>
          <select class="st-select" id="filter-status">
            <option value="">All Statuses</option>
            <option value="pending">⏳ Pending Approval</option>
            <option value="Eligible for Promotion">Ready for Graduation (Eligible)</option>
            <option value="Needs Evaluation">Needs Company Evaluation</option>
            <option value="Completed OJT">Completed OJT (600h+)</option>
            <option value="Active OJT">Active OJT</option>
            <option value="Undeployed">Undeployed</option>
          </select>
        </div>
        <div class="st-toolbar__right">
          <span id="student-count" style="font-size:var(--text-sm);font-weight:600;color:var(--text-secondary);"></span>
        </div>
      </div>

      <!-- Primary Table Card -->
      <div class="st-table-card anim-fade-in-up">
        <!-- Desktop / Tablet Table View -->
        <div class="st-table-responsive">
          <table class="st-table" id="students-table">
            <thead>
              <tr>
                <th class="st-checkbox-cell">
                  <input type="checkbox" id="select-all-students" class="st-checkbox" title="Select all eligible students on this page" />
                </th>
                <th class="st-student-cell">Student</th>
                <th style="min-width:130px;">Student ID</th>
                <th class="st-program-cell">Course &amp; Section</th>
                <th class="st-company-cell">Host Company</th>
                <th class="st-progress-cell">OJT Progress</th>
                <th class="st-status-cell">Status</th>
                <th class="st-action-cell">Actions</th>
              </tr>
            </thead>
            <tbody id="students-tbody"></tbody>
          </table>
        </div>

        <!-- Mobile Responsive Cards View (Active on screens < 768px) -->
        <div class="st-mobile-cards" id="students-mobile-cards"></div>
      </div>

      <!-- Pagination -->
      <div id="students-pagination" style="display:flex;justify-content:center;gap:8px;margin-top:var(--space-2);flex-wrap:wrap;"></div>

      <!-- Floating Batch Action Bar for Graduation Promotion -->
      <div id="batch-action-bar" class="batch-action-bar" style="display:none;">
        <div class="batch-action-bar__info">
          <span class="batch-action-bar__count-badge" id="batch-selected-count">0</span>
          <span style="font-weight:var(--weight-semibold);color:var(--text-primary);">Selected</span>
          <span class="batch-action-bar__divider"></span>
          <span class="batch-action-bar__pill">${icon('award', 13)} Dual-Gate Qualified</span>
        </div>
        <div class="batch-action-bar__actions">
          <button class="btn btn--outline btn--sm" id="batch-clear-btn" type="button">Deselect</button>
          <button class="btn btn--primary btn--sm" id="batch-promote-btn" type="button" style="display:inline-flex;align-items:center;gap:6px;">
            ${icon('graduation-cap', 14)} Promote to Graduate
          </button>
        </div>
      </div>
    </div>
  `;

  renderIcons();

  const tbody        = container.querySelector('#students-tbody');
  const countEl      = container.querySelector('#student-count');
  const paginationEl = container.querySelector('#students-pagination');

  let currentPage         = 1;
  let debounceTimer       = null;
  const selectedStudents  = new Map();
  let currentStudentsList = [];

  function updateSelectionUI() {
    const selectAllCb = container.querySelector('#select-all-students');
    const bar = container.querySelector('#batch-action-bar');
    const countBadge = container.querySelector('#batch-selected-count');

    const eligibleOnPage = currentStudentsList.filter(s => Boolean(s.is_eligible_for_promotion));
    const selectedOnPageCount = eligibleOnPage.filter(s => selectedStudents.has(s.id)).length;

    if (selectAllCb) {
      if (eligibleOnPage.length === 0) {
        selectAllCb.checked = false;
        selectAllCb.indeterminate = false;
        selectAllCb.disabled = true;
      } else {
        selectAllCb.disabled = false;
        selectAllCb.checked = selectedOnPageCount === eligibleOnPage.length;
        selectAllCb.indeterminate = selectedOnPageCount > 0 && selectedOnPageCount < eligibleOnPage.length;
      }
    }

    if (bar) {
      if (selectedStudents.size > 0) {
        bar.style.display = 'flex';
        if (countBadge) countBadge.textContent = selectedStudents.size;
      } else {
        bar.style.display = 'none';
      }
    }
  }

  function applyStudentsResponse(res) {
    if (!res || res.message) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8">
            <div class="empty-state" style="padding:var(--space-8) var(--space-4);">
              <h3 class="empty-state__title">Failed to load students</h3>
              <p class="empty-state__text">${res?.message || 'Check your connection or login session.'}</p>
            </div>
          </td>
        </tr>`;
      updateSelectionUI();
      return;
    }

    // Populate dynamic courses dropdown if returned
    if (Array.isArray(res.courses)) {
      const courseSelect = container.querySelector('#filter-course');
      if (courseSelect) {
        const currentSelected = courseSelect.value;
        const currentOptions = Array.from(courseSelect.options).slice(1).map(o => o.value);
        const isSame = currentOptions.length === res.courses.length && currentOptions.every((v, i) => v === res.courses[i]);
        if (!isSame) {
          courseSelect.innerHTML = '<option value="">All Courses</option>' +
            res.courses.map(course => `<option value="${course}"${course === currentSelected ? ' selected' : ''}>${formatCourseOption(course)}</option>`).join('');
        }
      }
    }

    // Populate dynamic sections dropdown if returned
    if (Array.isArray(res.sections)) {
      const secSelect = container.querySelector('#filter-section');
      if (secSelect) {
        const currentSelected = secSelect.value;
        const currentOptions = Array.from(secSelect.options).slice(1).map(o => o.value);
        const isSame = currentOptions.length === res.sections.length && currentOptions.every((v, i) => v === res.sections[i]);
        if (!isSame) {
          secSelect.innerHTML = '<option value="">All Sections</option>' +
            res.sections.map(sec => {
              const label = sec === 'A' ? 'Section A' : sec === 'B' ? 'Section B' : sec;
              return `<option value="${sec}"${sec === currentSelected ? ' selected' : ''}>${label}</option>`;
            }).join('');
        }
      }
    }

    currentStudentsList = Array.isArray(res.data) ? res.data : [];
    if (countEl) countEl.textContent = res.total != null ? `${res.total} student${res.total !== 1 ? 's' : ''}` : '';

    // Update KPI stats strip
    const kpiTotal = container.querySelector('#kpi-total-count');
    const kpiSecA = container.querySelector('#kpi-sec-a');
    const kpiSecB = container.querySelector('#kpi-sec-b');
    const kpiActiveOjt = container.querySelector('#kpi-active-ojt');

    if (kpiTotal) kpiTotal.textContent = res.total ?? currentStudentsList.length;
    if (kpiSecA) {
      const aCount = currentStudentsList.filter(s => {
        const sec = (s.section || '').trim();
        return sec === 'A' || sec === 'BSIT 4-A' || sec === '4-A' || sec === '4A';
      }).length;
      kpiSecA.textContent = aCount;
    }
    if (kpiSecB) {
      const bCount = currentStudentsList.filter(s => {
        const sec = (s.section || '').trim();
        return sec === 'B' || sec === 'BSIT 4-B' || sec === '4-B' || sec === '4B';
      }).length;
      kpiSecB.textContent = bCount;
    }
    if (kpiActiveOjt) {
      const ojtCount = currentStudentsList.filter(s => s.status === 'Active OJT').length;
      kpiActiveOjt.textContent = ojtCount;
    }

    renderTable(tbody, currentStudentsList, container, selectedStudents, updateSelectionUI, () => {
      selectedStudents.clear();
      fetchAndRender(true);
    });
    renderPagination(res);
  }

  async function fetchAndRender(force = false) {
    const search  = container.querySelector('#student-search').value.trim();
    const course  = container.querySelector('#filter-course')?.value || '';
    const status  = container.querySelector('#filter-status').value;
    const section = container.querySelector('#filter-section').value;

    const params = new URLSearchParams({ per_page: 8, page: currentPage });
    if (search)  params.set('search', search);
    if (course)  params.set('course', course);
    if (status)  params.set('status', status);
    if (section) params.set('section', section);

    const url = `/admin/students?${params}`;
    const cached = !force ? getCached(url) : null;

    if (cached?.data) {
      applyStudentsResponse(cached.data);
    } else {
      showSkeleton(tbody, 8, container);
      paginationEl.innerHTML = '';
    }

    const res = await apiGetCached(url, {
      force,
      onUpdate: (fresh) => {
        applyStudentsResponse(fresh);
      },
    });

    if (res && !cached) {
      applyStudentsResponse(res);
    }
  }

  function renderPagination(meta) {
    if (!meta || meta.last_page <= 1) { paginationEl.innerHTML = ''; return; }

    const pages = meta.last_page;
    const cur   = meta.current_page;
    let html = '';

    html += `<button class="an-pg-btn an-pg-btn--nav" data-page="${cur - 1}"${cur === 1 ? ' disabled' : ''}>${icon('chevronLeft', 14)}</button>`;
    for (let i = 1; i <= pages; i++) {
      if (pages > 7 && Math.abs(i - cur) > 2 && i !== 1 && i !== pages) {
        if (i === cur - 3 || i === cur + 3) html += `<span style="padding:0 4px;color:var(--text-tertiary)">…</span>`;
        continue;
      }
      html += `<button class="an-pg-btn${i === cur ? ' an-pg-btn--active' : ''}" data-page="${i}">${i}</button>`;
    }
    html += `<button class="an-pg-btn an-pg-btn--nav" data-page="${cur + 1}"${cur >= pages ? ' disabled' : ''}>${icon('chevronRight', 14)}</button>`;

    paginationEl.innerHTML = html;
    renderIcons();

    paginationEl.querySelectorAll('.an-pg-btn:not([disabled])').forEach(btn => {
      btn.addEventListener('click', () => {
        currentPage = parseInt(btn.dataset.page, 10);
        fetchAndRender();
      });
    });
  }

  /* ── Filter & search events ── */
  container.querySelector('#filter-course')?.addEventListener('change', () => { currentPage = 1; fetchAndRender(); });
  container.querySelector('#filter-status').addEventListener('change', () => { currentPage = 1; fetchAndRender(); });
  container.querySelector('#filter-section').addEventListener('change', () => { currentPage = 1; fetchAndRender(); });
  container.querySelector('#student-search').addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => { currentPage = 1; fetchAndRender(); }, 400);
  });

  /* ── Batch selection events ── */
  container.querySelector('#select-all-students')?.addEventListener('change', (e) => {
    const isChecked = e.target.checked;
    const eligibleOnPage = currentStudentsList.filter(s => Boolean(s.is_eligible_for_promotion));
    eligibleOnPage.forEach(s => {
      if (isChecked) {
        selectedStudents.set(s.id, s);
      } else {
        selectedStudents.delete(s.id);
      }
    });

    container.querySelectorAll('.student-select-cb').forEach(cb => {
      const id = parseInt(cb.dataset.id, 10);
      cb.checked = selectedStudents.has(id);
    });

    updateSelectionUI();
  });

  container.querySelector('#batch-clear-btn')?.addEventListener('click', () => {
    selectedStudents.clear();
    container.querySelectorAll('.student-select-cb').forEach(cb => { cb.checked = false; });
    updateSelectionUI();
  });

  container.querySelector('#batch-promote-btn')?.addEventListener('click', () => {
    if (selectedStudents.size === 0) return;
    openPromoteModal({
      students: Array.from(selectedStudents.values()),
      onPromote: () => {
        selectedStudents.clear();
        fetchAndRender(true);
      },
      container,
    });
  });

  /* ── Broadcast button ── */
  container.querySelector('#broadcast-students-btn')?.addEventListener('click', () => {
    openBroadcastModal({
      container,
      onSuccess: () => {
        // Broadcast dispatched successfully
      },
    });
  });

  /* ── Import students button ── */
  container.querySelector('#import-students-btn').addEventListener('click', () => {
    openStudentImportModal(() => {
      currentPage = 1;
      fetchAndRender(true);
    });
  });

  /* ── Initial load ── */
  fetchAndRender();
}
