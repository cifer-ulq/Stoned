/**
 * CHMSU HireMe — Graduate / Jobseeker My Applications Page
 * Unified application list and interactive details modal matching the student experience
 */
import { icon } from '../components/icons.js';
import { apiGet, apiPost, apiDelete } from '../api/client.js';

/* ── HTML Escape Helper ── */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ── Toast Helper ── */
function showToast(message, type = 'success') {
  const iconName = type === 'success' ? 'checkCircle' : type === 'info' ? 'alertCircle' : 'alertTriangle';
  const toast = document.createElement('div');
  toast.className = 'toast toast--' + type + ' toast--visible';
  toast.innerHTML = icon(iconName, 16) + ' <span>' + escapeHtml(message) + '</span>';
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.classList.remove('toast--visible');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

/* ─────────────────────────────────────────────────────────────────────────────
   CONFIGURATIONS & METAS
   ───────────────────────────────────────────────────────────────────────────── */
const jobStatusConfig = {
  applied:     { label: 'Applied',    color: 'var(--color-primary, #005930)', bg: 'rgba(0,89,48,0.08)', icon: 'inbox', gradient: 'linear-gradient(135deg, #005930, #10B981)', step: 1 },
  screened:    { label: 'Reviewed',   color: 'var(--color-info)',  bg: 'var(--color-info-bg)',   icon: 'eye',         gradient: 'linear-gradient(135deg, #005930, #16a34a)', step: 2 },
  interview:   { label: 'Interview',  color: '#d97706',            bg: '#fef3c7',                icon: 'video',       gradient: 'linear-gradient(135deg, #FFB547, #FFCC70)', step: 3 },
  interviewed: { label: 'Interview',  color: '#d97706',            bg: '#fef3c7',                icon: 'video',       gradient: 'linear-gradient(135deg, #FFB547, #FFCC70)', step: 3 },
  offered:     { label: 'Offered',    color: '#16a34a',            bg: '#dcfce7',                icon: 'checkCircle', gradient: 'linear-gradient(135deg, #34C759, #30D158)', step: 4 },
  hired:       { label: 'Hired',      color: '#15803d',            bg: '#bbf7d0',                icon: 'award',       gradient: 'linear-gradient(135deg, #16a34a, #22c55e)', step: 5 },
  rejected:    { label: 'Rejected',   color: 'var(--color-error)', bg: 'var(--color-error-bg)',  icon: 'x',           gradient: 'linear-gradient(135deg, #FF3B30, #FF6B6B)', step: 0 },
};

const jobStatusOrder = ['applied', 'screened', 'interview', 'offered'];
const jobStatusAlias = { reviewed: 'screened', interviewed: 'interview', offer: 'offered' };

const jobGuidance = {
  applied:   'Your application has been received and is currently under review by the hiring team.',
  screened:  'Your application has been screened and shortlisted! The company will contact you for the next interview step.',
  interview: 'An interview has been scheduled! Review the schedule, format, and venue or meeting link below.',
  offered:   'Congratulations! The employer has extended a formal job offer. Review the compensation and details below.',
  hired:     'Congratulations on your new career role! You have officially accepted the job offer and are hired.',
  rejected:  'Your application was not selected for this position. Explore more career opportunities on your job match feed.',
};

/* ── Date formatting helpers ── */
function relativeDate(dateStr) {
  if (!dateStr) return 'Recently';
  const now = new Date();
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'Recently';
  const diff = Math.floor((now - d) / (1000 * 60 * 60 * 24));
  if (diff <= 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return diff + ' days ago';
  if (diff < 30) return Math.floor(diff / 7) + 'w ago';
  return d.toLocaleDateString();
}

function fmtDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

/* ─────────────────────────────────────────────────────────────────────────────
   APPLICATION DETAILS MODAL (Exact match to student portal experience)
   ───────────────────────────────────────────────────────────────────────────── */
function openApplicationDetailsModal(item, onWithdrawSuccess, onDecisionSuccess) {
  const existing = document.getElementById('app-details-modal');
  if (existing) existing.remove();

  const statusKey = item.status;
  const sc = jobStatusConfig[statusKey] || jobStatusConfig.applied;
  const isHired = item.status === 'hired';
  const isOffered = item.status === 'offered';
  const color = isHired ? '#16a34a' : (sc.color || '#005930');
  const appliedDate = item.appliedDate ? new Date(item.appliedDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Recently';

  const canWithdraw = !['hired', 'rejected', 'offered'].includes(item.status);
  const guidanceText = jobGuidance[item.status] || 'Your application is progressing through the company hiring pipeline.';

  const overlay = document.createElement('div');
  overlay.id = 'app-details-modal';
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-box app-details-modal__box" role="dialog" aria-modal="true">
      <!-- Modal Header -->
      <div class="app-details-modal__header">
        <div class="app-details-modal__top-left">
          <div class="app-details-modal__avatar" style="background: linear-gradient(135deg, #00381E 0%, #005930 60%, #0B7A44 100%); color:#fff;">
            ${escapeHtml(item.companyInitial)}
          </div>
          <div class="app-details-modal__title-wrap">
            <div class="app-details-modal__badges">
              <span class="app-badge-type app-badge-type--job">
                ${icon('briefcase', 12)} Job Application
              </span>
              <span class="app-card__badge" style="background:${sc.bg}; color:${sc.color}; border: 1px solid ${sc.color}44;">
                ${icon(sc.icon, 12)} ${escapeHtml(sc.label)}
              </span>
              <span class="app-details-modal__ref">
                Ref: #APP-JOB-${String(item.id).padStart(4, '0')}
              </span>
            </div>
            <h2 class="app-details-modal__title">${escapeHtml(item.title)}</h2>
            <p class="app-details-modal__company">
              ${item.companyUserId
                ? `<a href="#/company/${item.companyUserId}">${escapeHtml(item.company)}</a>`
                : escapeHtml(item.company)
              }
            </p>
          </div>
        </div>
        <button class="modal-close btn btn--icon modal-close-x" aria-label="Close modal">
          ${icon('x', 20)}
        </button>
      </div>

      <!-- Modal Body -->
      <div class="app-details-modal__body">
        <!-- 1. Pipeline & Status Progress -->
        <div class="app-details-section">
          <h4 class="app-details-section__title">${icon('trendingUp', 14)} Application Pipeline & Progress</h4>
          <div class="app-details-timeline-card">
            <div class="app-tracker" style="margin:0; padding:10px 6px;">
              ${(() => {
                const steps = isHired ? [...jobStatusOrder, 'hired'] : jobStatusOrder;
                const labels = isHired ? ['Applied', 'Reviewed', 'Interview', 'Offered', 'Hired!'] : ['Applied', 'Reviewed', 'Interview', 'Offered'];
                const currentStep = isHired ? 5 : (sc.step || 1);

                return steps.map((s, sIdx) => {
                  const stepCfg = jobStatusConfig[s] || jobStatusConfig.applied;
                  const done = (sIdx + 1) <= currentStep;
                  const active = (sIdx + 1) === currentStep;
                  const dotBg = done
                    ? (active
                        ? (s === 'hired' ? 'linear-gradient(135deg,#16a34a,#22c55e)' : (stepCfg.gradient || 'linear-gradient(135deg, #005930, #16a34a)'))
                        : 'linear-gradient(135deg, #005930, #10B981)')
                    : '';

                  return `
                    <div class="app-tracker__step ${done ? 'app-tracker__step--done' : ''} ${active ? 'app-tracker__step--active' : ''}">
                      <div class="app-tracker__dot" style="${dotBg ? 'background:' + dotBg + ';' : ''}">
                        ${done ? icon(active ? stepCfg.icon : 'checkCircle', 11) : ''}
                      </div>
                      <span class="app-tracker__label">${labels[sIdx]}</span>
                      ${sIdx < steps.length - 1 ? '<div class="app-tracker__line' + (done && (sIdx + 2) <= currentStep ? ' app-tracker__line--done' : '') + '"></div>' : ''}
                    </div>`;
                }).join('');
              })()}
            </div>
          </div>

          <!-- Current Guidance Callout -->
          <div class="app-details-note-box" style="border-left-color:${color}; background:rgba(0,89,48,0.06);">
            <strong style="color:${color}; display:flex; align-items:center; gap:6px; margin-bottom:4px;">
              ${icon('sparkles', 14)} Current Status Guidance:
            </strong>
            <p style="margin:0;">${escapeHtml(guidanceText)}</p>
          </div>

          <!-- Interview Details Card (If scheduled) -->
          ${(() => {
            if (!item.interview) return '';
            const iv = item.interview;
            const ivPlatformLower = (iv.platform || '').toLowerCase();
            const ivIsFaceToFace = ivPlatformLower.includes('on-site') || ivPlatformLower.includes('in-person') || ivPlatformLower.includes('office') || iv.type === 'face_to_face';
            const ivFormatText = ivIsFaceToFace ? 'In-Person / On-site' : 'Online Video Call';
            let ivTypeName = iv.type || 'Interview';
            if (ivTypeName === 'face_to_face') ivTypeName = 'In-Person Interview';
            else if (ivTypeName === 'online') ivTypeName = 'Online Video Interview';

            return `
              <div class="app-details-note-box" style="border-left-color:var(--color-warning); background:var(--color-warning-bg);">
                <strong style="color:#d97706; display:flex; align-items:center; gap:6px; margin-bottom:6px;">
                  ${icon(ivIsFaceToFace ? 'mapPin' : 'video', 15)} Scheduled Interview Details: ${escapeHtml(ivTypeName)}
                </strong>
                <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap:10px; margin-top:8px;">
                  ${iv.scheduled_date ? `<div><span style="font-size:0.75rem; color:var(--text-tertiary);">Date:</span> <strong>${fmtDate(iv.scheduled_date)}</strong></div>` : ''}
                  ${iv.scheduled_time ? `<div><span style="font-size:0.75rem; color:var(--text-tertiary);">Time:</span> <strong>${String(iv.scheduled_time).slice(0,5)}</strong></div>` : ''}
                  <div><span style="font-size:0.75rem; color:var(--text-tertiary);">Format:</span> <strong>${escapeHtml(ivFormatText)}</strong></div>
                  ${iv.platform ? `<div><span style="font-size:0.75rem; color:var(--text-tertiary);">Platform / Venue:</span> <strong>${escapeHtml(iv.platform)}</strong></div>` : ''}
                  ${iv.interviewer_name ? `<div><span style="font-size:0.75rem; color:var(--text-tertiary);">Interviewer:</span> <strong>${escapeHtml(iv.interviewer_name)}</strong></div>` : ''}
                </div>
                ${iv.meeting_link && !ivIsFaceToFace ? `
                  <div style="margin-top:12px;">
                    <a href="${escapeHtml(iv.meeting_link)}" target="_blank" rel="noopener noreferrer" class="btn btn--sm" style="background:#d97706; color:#fff; text-decoration:none; display:inline-flex; align-items:center; gap:6px; border-radius:99px; padding:6px 16px; font-weight:600;">
                      ${icon('video', 14)} Join Interview Meeting
                    </a>
                  </div>
                ` : ''}
              </div>
            `;
          })()}

          <!-- Job Offer Box (If offered or hired) -->
          ${(isOffered || (isHired && item.offerDetails)) ? `
            <div class="app-details-note-box" style="border-left-color:#16a34a; background:#dcfce7; padding:16px;">
              <strong style="color:#15803d; display:flex; align-items:center; gap:6px; margin-bottom:8px; font-size:0.92rem;">
                ${icon('award', 18)} Official Job Offer Extended
              </strong>
              <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap:10px; margin-bottom:12px;">
                <div>
                  <span style="font-size:0.75rem; color:#166534; display:block;">Offered Salary:</span>
                  <strong style="color:#14532d;">${escapeHtml(item.offerDetails?.salary || item.salaryRange || 'Competitive')}</strong>
                </div>
                ${item.offerDetails?.start_date ? `
                  <div>
                    <span style="font-size:0.75rem; color:#166534; display:block;">Target Start Date:</span>
                    <strong style="color:#14532d;">${fmtDate(item.offerDetails.start_date)}</strong>
                  </div>
                ` : ''}
                ${item.offerDetails?.expiry_date ? `
                  <div>
                    <span style="font-size:0.75rem; color:#166534; display:block;">Offer Expiration:</span>
                    <strong style="color:#14532d;">${fmtDate(item.offerDetails.expiry_date)}</strong>
                  </div>
                ` : ''}
              </div>
              ${item.offerDetails?.benefits && item.offerDetails.benefits.length > 0 ? `
                <div style="margin-top:8px; padding-top:8px; border-top:1px dashed rgba(22,101,52,0.2);">
                  <span style="font-size:0.75rem; color:#166534; font-weight:600; display:block; margin-bottom:4px;">Offered Benefits:</span>
                  <ul style="margin:0; padding-left:18px; color:#14532d; font-size:0.82rem;">
                    ${(Array.isArray(item.offerDetails.benefits) ? item.offerDetails.benefits : []).map(b => `<li>${escapeHtml(b)}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}
              ${item.offerDetails?.message ? `
                <div style="margin-top:8px; padding-top:8px; border-top:1px dashed rgba(22,101,52,0.2); font-size:0.82rem; color:#14532d;">
                  <span style="font-size:0.75rem; color:#166534; font-weight:600; display:block;">Message from ${escapeHtml(item.company)}:</span>
                  <em>"${escapeHtml(item.offerDetails.message)}"</em>
                </div>
              ` : ''}
              ${isOffered && !item.offerDecision ? `
                <div style="display:flex; gap:10px; margin-top:14px; flex-wrap:wrap;">
                  <button class="btn btn--sm js-modal-accept" style="background:#16a34a; color:#fff; border:none; border-radius:99px; padding:6px 18px; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:6px;">
                    ${icon('checkCircle', 14)} Accept Job Offer
                  </button>
                  <button class="btn btn--sm js-modal-decline" style="background:#dc2626; color:#fff; border:none; border-radius:99px; padding:6px 18px; font-weight:700; cursor:pointer; display:inline-flex; align-items:center; gap:6px;">
                    ${icon('x', 14)} Decline Offer
                  </button>
                </div>
              ` : (item.offerDecision ? `
                <div style="margin-top:10px; font-size:0.82rem; font-weight:600; color:#15803d;">
                  Decision: You ${item.offerDecision === 'accepted' ? 'accepted' : 'declined'} this offer${item.offerDecidedAt ? ' on ' + fmtDate(item.offerDecidedAt) : ''}.
                </div>
              ` : '')}
            </div>
          ` : ''}
        </div>

        <!-- 2. Position Details Grid -->
        <div class="app-details-section">
          <h4 class="app-details-section__title">${icon('briefcase', 14)} Position Details</h4>
          <div class="app-details-grid">
            <div class="app-details-grid__item">
              <div class="app-details-grid__icon">${icon('building', 18)}</div>
              <div>
                <div class="app-details-grid__label">Department</div>
                <div class="app-details-grid__value">${escapeHtml(item.department || 'General / Tech')}</div>
              </div>
            </div>

            <div class="app-details-grid__item">
              <div class="app-details-grid__icon">${icon('mapPin', 18)}</div>
              <div>
                <div class="app-details-grid__label">Location / Setup</div>
                <div class="app-details-grid__value">${escapeHtml(item.location || 'Negros Occidental')}</div>
              </div>
            </div>

            <div class="app-details-grid__item">
              <div class="app-details-grid__icon">${icon('clock', 18)}</div>
              <div>
                <div class="app-details-grid__label">Employment Type</div>
                <div class="app-details-grid__value">${escapeHtml(item.employmentType || 'Full-time')}</div>
              </div>
            </div>

            <div class="app-details-grid__item">
              <div class="app-details-grid__icon">${icon('dollarSign', 18)}</div>
              <div>
                <div class="app-details-grid__label">Salary Range</div>
                <div class="app-details-grid__value">${escapeHtml(item.salaryRange || 'Competitive')}</div>
              </div>
            </div>

            <div class="app-details-grid__item">
              <div class="app-details-grid__icon">${icon('award', 18)}</div>
              <div>
                <div class="app-details-grid__label">Experience Level</div>
                <div class="app-details-grid__value">${escapeHtml(item.experienceLevel || 'Entry Level')}</div>
              </div>
            </div>

            <div class="app-details-grid__item">
              <div class="app-details-grid__icon">${icon('calendar', 18)}</div>
              <div>
                <div class="app-details-grid__label">Date Applied</div>
                <div class="app-details-grid__value">${appliedDate}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 3. Description & Objectives -->
        ${item.description ? `
          <div class="app-details-section">
            <h4 class="app-details-section__title">${icon('fileText', 14)} Role Description & Scope</h4>
            <p class="app-details-text">${escapeHtml(item.description)}</p>
          </div>
        ` : ''}

        <!-- 4. Key Responsibilities -->
        ${(item.responsibilities && item.responsibilities.length > 0) ? `
          <div class="app-details-section">
            <h4 class="app-details-section__title">${icon('target', 14)} Key Responsibilities</h4>
            <ul class="app-details-list">
              ${item.responsibilities.map(r => `<li>${icon('checkCircle', 15)} <span>${escapeHtml(r)}</span></li>`).join('')}
            </ul>
          </div>
        ` : ''}

        <!-- 5. Requirements & Qualifications -->
        ${(item.requirements && item.requirements.length > 0) ? `
          <div class="app-details-section">
            <h4 class="app-details-section__title">${icon('award', 14)} Requirements & Qualifications</h4>
            <ul class="app-details-list">
              ${item.requirements.map(req => `<li>${icon('checkCircle', 15)} <span>${escapeHtml(req)}</span></li>`).join('')}
            </ul>
          </div>
        ` : ''}

        <!-- 6. Required / Recommended Skills -->
        ${(item.requiredSkills && item.requiredSkills.length > 0) ? `
          <div class="app-details-section">
            <h4 class="app-details-section__title">${icon('code', 14)} Required & Matching Skills</h4>
            <div class="app-details-tags">
              ${item.requiredSkills.map(sk => `<span class="app-details-tag">${escapeHtml(sk)}</span>`).join('')}
            </div>
          </div>
        ` : ''}

        <!-- 7. Benefits & Perks -->
        ${(item.benefits && item.benefits.length > 0) ? `
          <div class="app-details-section">
            <h4 class="app-details-section__title">${icon('star', 14)} Compensation & Benefits</h4>
            <ul class="app-details-list">
              ${item.benefits.map(b => `<li>${icon('checkCircle', 15)} <span>${escapeHtml(b)}</span></li>`).join('')}
            </ul>
          </div>
        ` : ''}

        <!-- 8. Submission Details -->
        <div class="app-details-section">
          <h4 class="app-details-section__title">${icon('mail', 14)} Submission Details</h4>
          <div class="app-details-note-box">
            ${item.coverLetter ? `
              <strong style="display:block; margin-bottom:4px; color:var(--text-primary);">
                Message / Note Submitted With Application:
              </strong>
              <p style="margin:0; font-style:italic;">"${escapeHtml(item.coverLetter)}"</p>
            ` : `
              <p style="margin:0; color:var(--text-secondary);">
                ${icon('checkCircle', 14)} Full graduate profile, academic credentials, and digital resume submitted successfully.
              </p>
            `}
          </div>
          ${item.notes ? `
            <div class="app-details-note-box" style="border-left-color:var(--color-warning); background:var(--color-warning-bg); margin-top:8px;">
              <strong style="color:var(--color-warning); display:block; margin-bottom:4px;">Employer Notes / Feedback:</strong>
              <p style="margin:0;">${escapeHtml(item.notes)}</p>
            </div>
          ` : ''}
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="app-details-modal__footer">
        <div>
          ${canWithdraw ? `
            <button
              class="app-card__btn app-card__btn--ghost app-card__btn--danger modal-btn-withdraw"
              data-id="${item.id}"
            >
              ${icon('x', 14)} Withdraw Application
            </button>
          ` : ''}
        </div>
        <div style="display:flex; gap:10px; align-items:center;">
          <button
            class="app-card__btn app-card__btn--msg modal-btn-msg"
            data-id="${item.id}"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
            Message Company
          </button>
          <button
            class="btn btn--sm modal-btn-close"
            style="background:var(--bg-secondary); border:1px solid var(--border-default); border-radius:99px; padding:6px 18px; font-size:0.78rem; font-weight:600; cursor:pointer;"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.querySelector('.modal-box')?.classList.add('modal-box--visible'));

  const closeModal = () => {
    overlay.classList.add('modal-overlay--exit');
    setTimeout(() => overlay.remove(), 200);
  };

  overlay.querySelector('.modal-close-x')?.addEventListener('click', closeModal);
  overlay.querySelector('.modal-btn-close')?.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  // Wire message button
  overlay.querySelector('.modal-btn-msg')?.addEventListener('click', () => {
    closeModal();
    if (window.openChat) {
      window.openChat(`job_app_${item.id}`);
    }
  });

  // Wire withdraw button in modal
  overlay.querySelector('.modal-btn-withdraw')?.addEventListener('click', async () => {
    if (onWithdrawSuccess) {
      const confirmed = await onWithdrawSuccess(item.id);
      if (confirmed) closeModal();
    }
  });

  // Wire modal offer accept/decline
  overlay.querySelector('.js-modal-accept')?.addEventListener('click', async () => {
    if (onDecisionSuccess) {
      await onDecisionSuccess(item.id, 'accept-offer');
      closeModal();
    }
  });

  overlay.querySelector('.js-modal-decline')?.addEventListener('click', async () => {
    if (onDecisionSuccess) {
      await onDecisionSuccess(item.id, 'reject-offer');
      closeModal();
    }
  });
}


/* ─────────────────────────────────────────────────────────────────────────────
   OFFER MODAL (Interactive Offer Inspection & Decision)
   ───────────────────────────────────────────────────────────────────────────── */
function showOfferModal(app, onDecision) {
  const od = app.offerDetails || {};
  const alreadyDecided = !!app.offerDecision;

  const detailRow = (iconName, label, value) => value ? `
    <div class="app-offer-detail-row">
      <span class="app-offer-detail-row__icon">${icon(iconName, 15)}</span>
      <div>
        <span class="app-offer-detail-row__label">${label}</span>
        <span class="app-offer-detail-row__value">${escapeHtml(value)}</span>
      </div>
    </div>` : '';

  const salary    = od.salary    || app.salaryRange || 'Competitive';
  const startDate = od.start_date ? fmtDate(od.start_date) : '';
  const expiry    = od.expiry_date ? fmtDate(od.expiry_date) : '';
  const message   = od.message   || app.notes     || '';
  const benefitsList = (od.benefits || app.benefits || []);

  const decisionHtml = alreadyDecided
    ? `<div class="app-offer-decision app-offer-decision--${app.offerDecision}">
         ${icon(app.offerDecision === 'accepted' ? 'checkCircle' : 'x', 18)}
         <span>You <strong>${app.offerDecision === 'accepted' ? 'accepted' : 'declined'}</strong> this offer${app.offerDecidedAt ? ' on ' + fmtDate(app.offerDecidedAt) : ''}.</span>
       </div>`
    : `<div class="app-offer-modal__actions">
         <button class="app-offer-modal__btn app-offer-modal__btn--accept js-offer-accept" data-app-id="${app.id}">
           ${icon('checkCircle', 16)} Accept Job Offer
         </button>
         <button class="app-offer-modal__btn app-offer-modal__btn--decline js-offer-decline" data-app-id="${app.id}">
           ${icon('x', 16)} Decline Offer
         </button>
       </div>`;

  const overlay = document.createElement('div');
  overlay.className = 'app-offer-overlay';
  overlay.innerHTML = `
    <div class="app-offer-modal" role="dialog" aria-modal="true">
      <div class="app-offer-modal__header">
        <div class="app-offer-modal__logo" style="background:${jobStatusConfig['offered'].gradient};">${escapeHtml(app.companyInitial)}</div>
        <div>
          <p class="app-offer-modal__company">${escapeHtml(app.company)}</p>
          <h2 class="app-offer-modal__title">${escapeHtml(app.title)}</h2>
        </div>
        <button class="app-offer-modal__close js-modal-close">${icon('x', 18)}</button>
      </div>

      <div class="app-offer-modal__hero">
        ${icon('award', 28)}
        <span>Official Job Offer Extended</span>
      </div>

      <div class="app-offer-modal__body">
        ${detailRow('zap',      'Offered Salary',   salary)}
        ${detailRow('mapPin',   'Location',         app.location)}
        ${detailRow('clock',    'Employment Type',  app.employmentType)}
        ${detailRow('calendar', 'Target Start Date',startDate)}
        ${detailRow('alertCircle', 'Offer Expiration', expiry)}

        ${benefitsList.length > 0 ? `
          <div class="app-offer-benefits">
            <p class="app-offer-benefits__label">${icon('star', 13)} Offered Benefits & Perks</p>
            <ul class="app-offer-benefits__list">
              ${benefitsList.map(b => `<li>${icon('checkCircle', 12)} ${escapeHtml(b)}</li>`).join('')}
            </ul>
          </div>` : ''}

        ${message ? `
          <div class="app-offer-message">
            <p class="app-offer-message__label">${icon('messageSquare', 13)} Message from ${escapeHtml(app.company)}</p>
            <p class="app-offer-message__text">${escapeHtml(message)}</p>
          </div>` : ''}
      </div>

      <div class="app-offer-modal__footer">
        ${decisionHtml}
      </div>
    </div>`;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('app-offer-overlay--in'));

  function close() {
    overlay.classList.remove('app-offer-overlay--in');
    overlay.addEventListener('transitionend', () => overlay.remove(), { once: true });
  }

  overlay.querySelector('.js-modal-close').addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

  const acceptBtn = overlay.querySelector('.js-offer-accept');
  const declineBtn = overlay.querySelector('.js-offer-decline');

  async function handleDecision(endpoint, btnEl) {
    btnEl.disabled = true;
    btnEl.textContent = 'Processing…';
    try {
      await apiPost(`/jobseeker/applications/${app.id}/${endpoint}`, {});
      close();
      showToast(endpoint === 'accept-offer' ? 'Job offer accepted! Congratulations!' : 'Job offer declined.', endpoint === 'accept-offer' ? 'success' : 'info');
      onDecision?.();
    } catch (err) {
      btnEl.disabled = false;
      btnEl.textContent = endpoint === 'accept-offer' ? 'Accept Job Offer' : 'Decline Offer';
      alert('Could not record decision. Please try again.');
    }
  }

  acceptBtn?.addEventListener('click', () => handleDecision('accept-offer', acceptBtn));
  declineBtn?.addEventListener('click', () => handleDecision('reject-offer', declineBtn));
}

/* ─────────────────────────────────────────────────────────────────────────────
   CARD RENDERER (Matching student unified card layout)
   ───────────────────────────────────────────────────────────────────────────── */
function unifiedApplicationCard(item, idx) {
  const sc = jobStatusConfig[item.status] || jobStatusConfig.applied;
  const isHired = item.status === 'hired';
  const isRejected = item.status === 'rejected';
  const isOffered = item.status === 'offered';
  const appliedDate = relativeDate(item.appliedDate);

  const visSkills = item.requiredSkills.slice(0, 3);
  const extraSkills = item.requiredSkills.length > 3 ? item.requiredSkills.length - 3 : 0;
  const canWithdraw = !['hired', 'rejected', 'offered'].includes(item.status);

  // Latest interview
  const iv = item.interview;
  let interviewHtml = '';
  if (iv) {
    const ivDate = iv.scheduled_date ? fmtDate(iv.scheduled_date) : '';
    const ivTime = iv.scheduled_time ? String(iv.scheduled_time).slice(0, 5) : '';
    const platformLower = (iv.platform || '').toLowerCase();
    const isFaceToFace = platformLower.includes('on-site') || platformLower.includes('in-person') || platformLower.includes('office') || iv.type === 'face_to_face';
    const ivIconName = isFaceToFace ? 'mapPin' : 'video';

    let ivTitle = iv.type || 'Interview';
    if (ivTitle === 'face_to_face') ivTitle = 'In-Person Interview';
    else if (ivTitle === 'online') ivTitle = 'Online Video Interview';

    const platformDisplay = iv.platform || (isFaceToFace ? 'On-site / In-person' : 'Online Video Call');

    interviewHtml = `
      <div class="app-card__iv">
        <div class="app-card__iv-left">
          <div class="app-card__iv-icon">${icon(ivIconName, 15)}</div>
          <div class="app-card__iv-info">
            <span class="app-card__iv-type">${escapeHtml(ivTitle)}</span>
            <div class="app-card__iv-meta">
              ${ivDate ? `<span>${ivDate}</span>` : ''}
              ${ivTime ? `<span class="app-card__iv-meta-dot">&bull;</span><span>${ivTime}</span>` : ''}
              <span class="app-card__iv-meta-dot">&bull;</span>
              <span>${escapeHtml(platformDisplay)}</span>
            </div>
          </div>
        </div>
        <span class="app-card__iv-badge">
          ${icon('clock', 11)} Interview Scheduled
        </span>
      </div>`;
  }

  // Offer banner
  let offerBannerHtml = '';
  if (isOffered) {
    offerBannerHtml = `
      <div class="app-offer-banner">
        <div class="app-offer-banner__icon">${icon('award', 18)}</div>
        <div class="app-offer-banner__text">
          <strong>Job Offer Extended!</strong>
          <span>${escapeHtml(item.company)} has extended an official employment offer.</span>
        </div>
        <button class="app-offer-banner__btn js-view-offer" data-app-id="${item.id}">
          View Offer Details ${icon('arrowRight', 14)}
        </button>
      </div>`;
  } else if (isHired && item.offerDecision === 'accepted') {
    offerBannerHtml = `
      <div class="app-offer-banner app-offer-banner--hired">
        <div class="app-offer-banner__icon">${icon('checkCircle', 18)}</div>
        <div class="app-offer-banner__text">
          <strong>Offer Accepted — Congratulations!</strong>
          <span>You accepted this offer${item.offerDecidedAt ? ' on ' + fmtDate(item.offerDecidedAt) : ''}.</span>
        </div>
      </div>`;
  }

  // Step tracker
  const steps = isHired ? [...jobStatusOrder, 'hired'] : jobStatusOrder;
  const labels = isHired ? ['Applied', 'Reviewed', 'Interview', 'Offered', 'Hired!'] : ['Applied', 'Reviewed', 'Interview', 'Offered'];
  const currentStep = isHired ? 5 : (sc.step || 1);
  const borderAccent = isHired ? '#16a34a' : isRejected ? 'var(--color-error)' : 'var(--color-primary, #005930)';

  return `
    <article class="app-card animate-fade-in-up ${isHired ? 'app-card--hired' : ''} ${isRejected ? 'app-card--rejected' : ''}" style="--enter-delay:${idx * 60}ms; border-left: 3.5px solid ${borderAccent};" data-app-id="${item.id}">
      <div class="app-card__left">
        <div class="app-card__logo" style="background: linear-gradient(135deg, #00381E 0%, #005930 60%, #0B7A44 100%); color: #fff;">
          ${escapeHtml(item.companyInitial)}
        </div>
      </div>

      <div class="app-card__body">
        <!-- Top row -->
        <div class="app-card__row-top">
          <div class="app-card__info">
            <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:2px;">
              <h3 class="app-card__title" style="margin:0;">${escapeHtml(item.title)}</h3>
              <span class="app-badge-type app-badge-type--job">
                ${icon('briefcase', 12)} Job Application
              </span>
            </div>
            <p class="app-card__company" style="margin:0;">
              ${item.companyUserId
                ? `<a href="#/company/${item.companyUserId}" style="color:inherit;font-weight:600;text-decoration:none;" onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'">${escapeHtml(item.company)}</a>`
                : escapeHtml(item.company)
              }
              ${item.department ? `<span style="color:var(--text-tertiary);">&nbsp;&middot;&nbsp;${escapeHtml(item.department)}</span>` : ''}
            </p>
          </div>

          <span class="app-card__badge" style="background:${sc.bg}; color:${sc.color}; border:1px solid ${sc.color}33;">
            ${icon(sc.icon, 12)} ${escapeHtml(sc.label)}
          </span>
        </div>

        <!-- Meta Details Row (Location, Type, Salary) -->
        <div class="app-card__meta-line">
          ${item.location ? `
            <span class="app-card__meta-item">
              ${icon('mapPin', 12)}
              <span>${escapeHtml(item.location)}</span>
            </span>` : ''}
          ${item.employmentType ? `
            <span class="app-card__meta-item">
              ${icon('clock', 12)}
              <span>${escapeHtml(item.employmentType)}</span>
            </span>` : ''}
          ${item.salaryRange ? `
            <span class="app-card__meta-item app-card__meta-item--salary">
              ${icon('zap', 11)}
              <span>${escapeHtml(item.salaryRange)}</span>
            </span>` : ''}
        </div>

        <!-- Latest interview snippet -->
        ${interviewHtml}

        <!-- Offer banner -->
        ${offerBannerHtml}

        <!-- Progress Tracker -->
        <div class="app-tracker">
          ${steps.map((s, sIdx) => {
            const stepCfg = jobStatusConfig[s] || jobStatusConfig.applied;
            const done = !isRejected && (sIdx + 1) <= currentStep;
            const active = !isRejected && (sIdx + 1) === currentStep;
            const dotBg = done
              ? (active
                  ? (s === 'hired' ? 'linear-gradient(135deg,#16a34a,#22c55e)' : (stepCfg.gradient || 'linear-gradient(135deg, #005930, #16a34a)'))
                  : 'linear-gradient(135deg, #005930, #10B981)')
              : '';

            return `
              <div class="app-tracker__step ${done ? 'app-tracker__step--done' : ''} ${active ? 'app-tracker__step--active' : ''}">
                <div class="app-tracker__dot" style="${dotBg ? 'background:' + dotBg + ';' : ''}">
                  ${done ? icon(active ? stepCfg.icon : 'checkCircle', 11) : ''}
                </div>
                <span class="app-tracker__label">${labels[sIdx]}</span>
                ${sIdx < steps.length - 1 ? '<div class="app-tracker__line' + (done && (sIdx + 2) <= currentStep ? ' app-tracker__line--done' : '') + '"></div>' : ''}
              </div>`;
          }).join('')}
        </div>

        <!-- Bottom actions row -->
        <div class="app-card__row-bottom">
          <span class="app-card__date">${icon('calendar', 12)} Applied ${appliedDate}</span>
          <div class="app-card__actions">
            <button
              class="app-card__btn app-card__btn--details btn-details"
              data-id="${item.id}"
              title="View full application details"
            >
              ${icon('eye', 13)} Details
            </button>
            ${canWithdraw ? `
              <button
                class="app-card__btn app-card__btn--ghost app-card__btn--danger btn-withdraw"
                data-id="${item.id}"
                title="Withdraw application"
              >
                ${icon('x', 13)} Withdraw
              </button>
            ` : ''}
            <button
              class="app-card__btn app-card__btn--msg"
              data-id="${item.id}"
              onclick="event.stopPropagation(); window.openChat && window.openChat('job_app_${item.id}')"
              title="Message ${escapeHtml(item.company)}"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
              Message
            </button>
            ${isOffered ? `
              <button
                class="app-card__btn app-card__btn--offer js-view-offer"
                data-app-id="${item.id}"
              >
                ${icon('award', 13)} Review Offer
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    </article>
  `;
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN RENDER FUNCTION
   ───────────────────────────────────────────────────────────────────────────── */
export async function renderApplications(container) {
  let activeFilter = 'all';

  container.innerHTML = `
    <div class="page-enter">
      <!-- Header Banner -->
      <section class="app-hero">
        <div class="app-hero__bg">
          <div class="app-hero__shape app-hero__shape--1"></div>
          <div class="app-hero__shape app-hero__shape--2"></div>
        </div>
        <div class="app-hero__content">
          <h1 class="app-hero__title animate-fade-in-up">My Applications</h1>
          <p class="app-hero__subtitle animate-fade-in-up" style="animation-delay:60ms;">
            Track all your job applications, scheduled interviews, and employment offers in one place
          </p>
        </div>
      </section>

      <!-- KPI Stats Row (Unified Overview) -->
      <section class="app-stats animate-fade-in-up" style="animation-delay:100ms;" id="app-stats">
        <div class="app-stats__loading">Loading applications overview…</div>
      </section>

      <!-- Filter Controls & Quick Link -->
      <section class="app-type-tabs-wrapper animate-fade-in-up" style="animation-delay:140ms; display:flex; align-items:center; justify-content:space-between; gap:14px; flex-wrap:wrap;">
        <div class="app-type-tabs" id="app-type-tabs">
          <button class="app-type-tab app-type-tab--active" data-filter="all">
            All Applications
            <span class="app-type-tab__count" id="tab-all-count">0</span>
          </button>
          <button class="app-type-tab" data-filter="screened">
            <span class="app-type-tab__icon">${icon('eye', 14)}</span>
            In Review
            <span class="app-type-tab__count" id="tab-screened-count">0</span>
          </button>
          <button class="app-type-tab" data-filter="interview">
            <span class="app-type-tab__icon">${icon('video', 14)}</span>
            Interview
            <span class="app-type-tab__count" id="tab-interview-count">0</span>
          </button>
          <button class="app-type-tab" data-filter="offered">
            <span class="app-type-tab__icon">${icon('award', 14)}</span>
            Offers & Hired
            <span class="app-type-tab__count" id="tab-offered-count">0</span>
          </button>
        </div>

        <div style="display:flex; gap:10px; align-items:center;">
          <a href="#/jobs" class="btn btn--sm" style="background:var(--bg-secondary); color:var(--text-primary); border:1px solid var(--border-default); border-radius:99px; font-size:0.76rem; text-decoration:none; display:inline-flex; align-items:center; gap:5px; font-weight:600; padding:6px 14px;">
            ${icon('briefcase', 13)} Browse Job Matches
          </a>
        </div>
      </section>

      <!-- Applications Feed -->
      <section class="app-list" id="application-feed" style="margin-top:16px;">
        <div class="app-card--skeleton"></div>
        <div class="app-card--skeleton"></div>
      </section>

      <!-- Unified Empty State -->
      <div id="app-empty" class="app-empty" style="display:none;">
        <div class="app-empty__icon" style="color:var(--color-primary);">${icon('inbox', 52)}</div>
        <h3 id="empty-title">No applications found</h3>
        <p id="empty-desc">You haven't submitted any job applications yet.</p>
        <div style="display:flex; gap:10px; margin-top:14px; flex-wrap:wrap; justify-content:center;">
          <a href="#/jobs" class="btn btn--primary" style="text-decoration:none; height:38px; display:inline-flex; align-items:center; gap:6px; padding:0 20px; border-radius:99px; font-size:0.84rem; font-weight:600;">
            Explore Recommended Jobs ${icon('arrowRight', 14)}
          </a>
        </div>
      </div>
    </div>
  `;

  // Fetch applications
  let allApplications = [];

  async function loadData() {
    let rawJobs = [];
    try {
      rawJobs = await apiGet('/jobseeker/applications');
    } catch (_) {
      rawJobs = [];
    }
    if (!rawJobs || !Array.isArray(rawJobs)) rawJobs = [];

    allApplications = rawJobs.map(a => {
      const listing = a.job_listing || {};
      const compName = listing.company_name || 'Company';
      const rawStatus = a.status || 'applied';
      const status = jobStatusAlias[rawStatus] ?? rawStatus;

      // Required skills
      let requiredSkills = listing.required_skills || [];
      if (typeof requiredSkills === 'string') {
        try { requiredSkills = JSON.parse(requiredSkills); } catch { requiredSkills = []; }
      }

      // Benefits
      let benefits = listing.benefits || [];
      if (typeof benefits === 'string') {
        try { benefits = JSON.parse(benefits); } catch { benefits = []; }
      }

      // Responsibilities
      let responsibilities = listing.responsibilities || [];
      if (typeof responsibilities === 'string') {
        try { responsibilities = JSON.parse(responsibilities); } catch { responsibilities = []; }
      }

      // Requirements
      let requirements = listing.requirements || [];
      if (typeof requirements === 'string') {
        try { requirements = JSON.parse(requirements); } catch { requirements = []; }
      }

      return {
        id:               a.id,
        type:             'job',
        title:            listing.title || 'Job Application',
        company:          compName,
        companyInitial:   compName.trim().charAt(0).toUpperCase() || 'C',
        companyUserId:    listing.company_user_id || null,
        status:           status,
        rawStatus:        rawStatus,
        appliedDate:      a.created_at,
        timestamp:        new Date(a.created_at || 0).getTime(),
        department:       listing.department || 'General / Engineering',
        location:         listing.location || 'Negros Occidental',
        employmentType:   listing.employment_type || 'Full-time',
        experienceLevel:  listing.experience_level || 'Entry Level',
        salaryRange:      listing.salary_range || 'Competitive',
        description:      listing.description || '',
        responsibilities: Array.isArray(responsibilities) ? responsibilities : [],
        requirements:     Array.isArray(requirements) ? requirements : [],
        benefits:         Array.isArray(benefits) ? benefits : [],
        requiredSkills:   Array.isArray(requiredSkills) ? requiredSkills : [],
        coverLetter:      a.cover_letter || '',
        notes:            a.notes || '',
        offerDetails:     a.offer_details || null,
        offerDecision:    a.offer_decision || null,
        offerDecidedAt:   a.offer_decided_at || null,
        interview:        a.latest_interview || null,
        raw:              a,
      };
    }).sort((a, b) => b.timestamp - a.timestamp);
  }

  // Render stats
  function renderStats() {
    const statsEl = container.querySelector('#app-stats');
    if (!statsEl) return;

    const totalCount = allApplications.length;
    const reviewedCount = allApplications.filter(a => a.status === 'screened').length;
    const interviewCount = allApplications.filter(a => a.status === 'interview' || a.rawStatus === 'interviewed').length;
    const offeredCount = allApplications.filter(a => a.status === 'offered' || a.status === 'hired').length;

    statsEl.innerHTML = `
      <div class="app-stat-card app-stat-card--total">
        <div class="app-stat-card__icon" style="background:var(--color-primary-bg); color:var(--color-primary);">
          ${icon('inbox', 20)}
        </div>
        <div class="app-stat-card__data">
          <span class="app-stat-card__value" data-counter="${totalCount}">${totalCount}</span>
          <span class="app-stat-card__label">Total Applications</span>
        </div>
      </div>

      <div class="app-stat-card">
        <div class="app-stat-card__icon" style="background:var(--color-info-bg); color:var(--color-info);">
          ${icon('eye', 20)}
        </div>
        <div class="app-stat-card__data">
          <span class="app-stat-card__value" data-counter="${reviewedCount}">${reviewedCount}</span>
          <span class="app-stat-card__label">In Review</span>
        </div>
      </div>

      <div class="app-stat-card">
        <div class="app-stat-card__icon" style="background:#fef3c7; color:#d97706;">
          ${icon('video', 20)}
        </div>
        <div class="app-stat-card__data">
          <span class="app-stat-card__value" data-counter="${interviewCount}">${interviewCount}</span>
          <span class="app-stat-card__label">In Interview</span>
        </div>
      </div>

      <div class="app-stat-card">
        <div class="app-stat-card__icon" style="background:#dcfce7; color:#16a34a;">
          ${icon('award', 20)}
        </div>
        <div class="app-stat-card__data">
          <span class="app-stat-card__value" data-counter="${offeredCount}">${offeredCount}</span>
          <span class="app-stat-card__label">Offered / Hired</span>
        </div>
      </div>
    `;

    // Counter animation
    statsEl.querySelectorAll('[data-counter]').forEach(el => {
      const target = parseInt(el.dataset.counter, 10);
      const start = performance.now();
      (function tick(now) {
        const p = Math.min((now - start) / 600, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      })(start);
    });

    // Tab counts
    const tabAll = container.querySelector('#tab-all-count');
    const tabScreened = container.querySelector('#tab-screened-count');
    const tabInterview = container.querySelector('#tab-interview-count');
    const tabOffered = container.querySelector('#tab-offered-count');
    if (tabAll) tabAll.textContent = totalCount;
    if (tabScreened) tabScreened.textContent = reviewedCount;
    if (tabInterview) tabInterview.textContent = interviewCount;
    if (tabOffered) tabOffered.textContent = offeredCount;
  }

  // Render Feed
  function renderFeed(filterType = 'all') {
    const feed = container.querySelector('#application-feed');
    const emptyEl = container.querySelector('#app-empty');
    if (!feed) return;

    let filtered = allApplications;
    if (filterType === 'screened') {
      filtered = allApplications.filter(a => a.status === 'screened');
    } else if (filterType === 'interview') {
      filtered = allApplications.filter(a => a.status === 'interview' || a.rawStatus === 'interviewed');
    } else if (filterType === 'offered') {
      filtered = allApplications.filter(a => a.status === 'offered' || a.status === 'hired');
    }

    if (filtered.length === 0) {
      feed.innerHTML = '';
      if (emptyEl) {
        emptyEl.style.display = 'flex';
        const titleEl = emptyEl.querySelector('#empty-title');
        const descEl = emptyEl.querySelector('#empty-desc');
        if (filterType === 'screened') {
          if (titleEl) titleEl.textContent = 'No applications in review';
          if (descEl) descEl.textContent = 'Applications reviewed by employers will appear here.';
        } else if (filterType === 'interview') {
          if (titleEl) titleEl.textContent = 'No scheduled interviews';
          if (descEl) descEl.textContent = 'Interview invitations will appear here with date and meeting link.';
        } else if (filterType === 'offered') {
          if (titleEl) titleEl.textContent = 'No offers yet';
          if (descEl) descEl.textContent = 'Formal job offers from hiring companies will appear here.';
        } else {
          if (titleEl) titleEl.textContent = 'No applications yet';
          if (descEl) descEl.textContent = 'Start applying to job openings to track your progress and offers here.';
        }
      }
      return;
    }

    if (emptyEl) emptyEl.style.display = 'none';
    feed.innerHTML = filtered.map((item, idx) => unifiedApplicationCard(item, idx)).join('');
    attachActions();
  }

  // Offer Decision Handler
  async function handleDecision(id, endpoint) {
    try {
      await apiPost(`/jobseeker/applications/${id}/${endpoint}`, {});
      showToast(endpoint === 'accept-offer' ? 'Job offer accepted! Congratulations!' : 'Job offer declined.', endpoint === 'accept-offer' ? 'success' : 'info');
      await loadData();
      renderStats();
      renderFeed(activeFilter);
    } catch (_) {
      alert('Could not update offer decision. Please try again.');
    }
  }

  // Withdrawal Handler
  async function handleWithdraw(id) {
    const item = allApplications.find(a => String(a.id) === String(id));
    const name = item ? item.title : 'this application';

    if (!confirm(`Are you sure you want to withdraw your application for "${name}"?`)) return false;

    try {
      await apiDelete(`/jobseeker/applications/${id}`);
    } catch (_) {}

    const card = container.querySelector(`[data-app-id="${id}"]`);
    if (card) {
      card.classList.add('app-card--removing');
    }

    setTimeout(() => {
      allApplications = allApplications.filter(a => String(a.id) !== String(id));
      renderStats();
      renderFeed(activeFilter);
      showToast('Application withdrawn successfully.', 'info');
    }, 300);

    return true;
  }

  // Attach interactive listeners
  function attachActions() {
    // 1. Details Button
    container.querySelectorAll('.btn-details').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const item = allApplications.find(a => String(a.id) === String(id));
        if (item) openApplicationDetailsModal(item, handleWithdraw, handleDecision);
      });
    });

    // 2. Withdraw Button on card
    container.querySelectorAll('.btn-withdraw').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        if (!id) return;
        btn.disabled = true;
        await handleWithdraw(id);
      });
    });

    // 3. View Offer button on card
    container.querySelectorAll('.js-view-offer').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.appId;
        const item = allApplications.find(a => String(a.id) === String(id));
        if (item) openApplicationDetailsModal(item, handleWithdraw, handleDecision);
      });
    });

    // 4. Card click opens details modal
    container.querySelectorAll('.app-card').forEach(card => {
      card.style.cursor = 'pointer';
      card.addEventListener('click', (e) => {
        if (e.target.closest('button, a, input, select')) return;
        const id = card.dataset.appId;
        const item = allApplications.find(a => String(a.id) === String(id));
        if (item) openApplicationDetailsModal(item, handleWithdraw, handleDecision);
      });
    });
  }

  // Filter tabs listener
  const typeTabs = container.querySelector('#app-type-tabs');
  if (typeTabs) {
    typeTabs.addEventListener('click', (e) => {
      const btn = e.target.closest('.app-type-tab');
      if (!btn) return;
      const filter = btn.dataset.filter;
      if (filter === activeFilter) return;

      activeFilter = filter;
      typeTabs.querySelectorAll('.app-type-tab').forEach(b => {
        b.classList.toggle('app-type-tab--active', b.dataset.filter === filter);
      });

      renderFeed(filter);
    });
  }

  // Initial load
  await loadData();
  renderStats();
  renderFeed('all');
}


