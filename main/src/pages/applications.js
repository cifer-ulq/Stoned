/**
 * CHMSU HireMe — My Applications Page
 * Single unified list for all applications (OJT & Jobs) with distinct type tags
 */
import { icon } from '../components/icons.js';
import { apiGet, apiDelete } from '../api/client.js';

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
  toast.innerHTML = icon(iconName, 16) + ' <span>' + message + '</span>';
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.classList.remove('toast--visible');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

/* ─────────────────────────────────────────────────────────────────────────────
   CONFIGURATIONS & METAS
   ───────────────────────────────────────────────────────────────────────────── */
// Job Status
const jobStatusConfig = {
  applied:   { label: 'Applied',   color: 'var(--color-gray-500)', bg: 'var(--bg-tertiary)',       icon: 'inbox',       gradient: 'linear-gradient(135deg, #9CA3BF, #6B7194)', step: 1 },
  reviewed:  { label: 'Reviewed',  color: 'var(--color-info)',     bg: 'var(--color-info-bg)',     icon: 'eye',         gradient: 'linear-gradient(135deg, #005930, #16a34a)', step: 2 },
  interview: { label: 'Interview', color: 'var(--color-warning)',  bg: 'var(--color-warning-bg)',  icon: 'video',       gradient: 'linear-gradient(135deg, #FFB547, #FFCC70)', step: 3 },
  offered:   { label: 'Offered',   color: 'var(--color-success)',  bg: 'var(--color-success-bg)',  icon: 'checkCircle', gradient: 'linear-gradient(135deg, #34C759, #30D158)', step: 4 },
};
const jobStatusOrder = ['applied', 'reviewed', 'interview', 'offered'];
const jobStatusAlias = { screened: 'reviewed', interviewed: 'interview', offer: 'offered' };

// OJT 9-Stage Steps (Official CHMSU Internship Flow)
const OJT_STEPS = [
  { key: 'interested',            label: 'Applied',             icon: 'send',          desc: 'Your application has been submitted.' },
  { key: 'company_reviewed',      label: 'Reviewed',            icon: 'userCheck',     desc: 'Company has reviewed your profile & resume.' },
  { key: 'endorsement_requested', label: 'Endorsement Sent',    icon: 'fileText',      desc: 'Company requested an official endorsement letter.' },
  { key: 'endorsed',              label: 'Letter Received',     icon: 'shield',        desc: 'Endorsement letter received by the host company.' },
  { key: 'interview_scheduled',   label: 'Interview',           icon: 'calendar',      desc: 'Company scheduled your interview.' },
  { key: 'company_accepted',      label: 'Accepted',            icon: 'checkCircle',   desc: 'Company accepted you after the interview!' },
  { key: 'accepted',              label: 'OJT Approved',        icon: 'award',         desc: 'OJT Coordinator granted final sign-off.' },
  { key: 'ojt_confirmed',         label: 'Start Date Set',      icon: 'calendar',      desc: 'Company confirmed your start date and instructions.' },
  { key: 'ojt_started',           label: 'OJT Started',         icon: 'graduationCap', desc: 'Your OJT training is officially underway!' },
];

const OJT_STATUS_ORDER = {
  interested:            0,
  company_reviewed:      1,
  endorsement_requested: 2,
  endorsed:              3,
  interview_scheduled:   4,
  company_accepted:      5,
  accepted:              6,
  ojt_confirmed:         7,
  ojt_started:           8,
};

const OJT_STEP_COLOR = {
  interested:            '#10B981',
  company_reviewed:      '#10B981',
  endorsement_requested: '#10B981',
  endorsed:              '#10B981',
  interview_scheduled:   '#10B981',
  company_accepted:      '#10B981',
  accepted:              '#10B981',
  ojt_confirmed:         '#10B981',
  ojt_started:           '#10B981',
  rejected:              '#EF4444',
};

const OJT_STEP_GUIDANCE = {
  interested:            'Your application is under review. The host company will evaluate your portfolio and credentials.',
  company_reviewed:      'The company reviewed your application! They will request an official endorsement letter from your coordinator.',
  endorsement_requested: 'The company requested an endorsement letter. Your school supervisor/coordinator has been notified to upload it.',
  endorsed:              'Your endorsement letter was received by the company. They will schedule your interview next.',
  interview_scheduled:   'An interview has been scheduled. Check your interview details below and prepare well.',
  company_accepted:      'Congratulations! The company accepted you after the interview. Waiting for your OJT Coordinator\'s final approval.',
  accepted:              'The OJT Coordinator has approved your OJT! The host company will set your official start date and instructions soon.',
  ojt_confirmed:         'Your OJT is confirmed! Check the instructions from your company and prepare for your start date.',
  ojt_started:           'Congratulations! Your OJT has officially started. Check your OJT Tracker.',
  rejected:              'Your application was not selected. You may apply to other OJT listings.',
};

function getOjtStepIndex(item) {
  const status = typeof item === 'string' ? item : (item?.rawStatus || 'interested');
  return OJT_STATUS_ORDER[status] ?? 0;
}

function isOjtInterviewPast(item) {
  const dtStr = item?.interviewScheduledAt || item?.raw?.interview_scheduled_at;
  if (!dtStr) return false;
  const d = new Date(dtStr);
  return !isNaN(d.getTime()) && d <= new Date();
}

function getOjtStatusBadge(item) {
  const status = item?.rawStatus || 'interested';
  if (status === 'interview_scheduled') {
    if (isOjtInterviewPast(item)) {
      return 'Interview Conducted (Awaiting Result)';
    }
    return 'Interview Scheduled';
  }
  if (status === 'company_accepted') {
    return 'Accepted (Awaiting Coordinator)';
  }
  const sIdx = getOjtStepIndex(item);
  return OJT_STEPS[Math.min(sIdx, OJT_STEPS.length - 1)]?.label || status;
}

function getOjtGuidance(item) {
  const status = item?.rawStatus || 'interested';
  if (status === 'interview_scheduled') {
    if (isOjtInterviewPast(item)) {
      const dt = item?.interviewScheduledAt ? new Date(item.interviewScheduledAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'recently';
      return `Your interview took place on ${dt}. The company is currently deliberating and will release your acceptance decision shortly.`;
    }
    return 'An interview has been scheduled. Please review the interview schedule and venue details below and prepare well.';
  }
  if (status === 'company_accepted') {
    return 'Congratulations! The company accepted you after the interview. Waiting for your OJT Coordinator to grant final approval.';
  }
  return OJT_STEP_GUIDANCE[status] || '';
}

/* ── Relative time helper ── */
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

/* ─────────────────────────────────────────────────────────────────────────────
   APPLICATION DETAILS MODAL
   ───────────────────────────────────────────────────────────────────────────── */
function openApplicationDetailsModal(item, onWithdrawSuccess, existingOverlay = null) {
  if (!existingOverlay) {
    const existing = document.getElementById('app-details-modal');
    if (existing) existing.remove();
  }

  const isOjt = item.type === 'ojt';
  const color = isOjt ? (OJT_STEP_COLOR[item.rawStatus || 'interested'] || '#10B981') : '#005930';
  const appliedDate = item.appliedDate ? new Date(item.appliedDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Recently';

  // Status Meta
  let statusBadgeLabel = '';
  if (isOjt) {
    statusBadgeLabel = getOjtStatusBadge(item);
  } else {
    const sc = jobStatusConfig[item.status] || jobStatusConfig.applied;
    statusBadgeLabel = sc.label;
  }

  const overlay = existingOverlay || document.createElement('div');
  overlay.id = 'app-details-modal';
  overlay.className = 'modal-overlay';
  overlay.dataset.modalAppId = String(item.id);
  overlay.dataset.modalType = item.type;
  overlay.innerHTML = `
    <div class="modal-box app-details-modal__box" role="dialog" aria-modal="true">
      <!-- Modal Header -->
      <div class="app-details-modal__header">
        <div class="app-details-modal__top-left">
          <div class="app-details-modal__avatar" style="background:${isOjt ? color + '1a' : 'linear-gradient(135deg, #005930, #16a34a)'}; color:${isOjt ? color : '#fff'};">
            ${isOjt ? icon('graduationCap', 24) : escapeHtml(item.companyInitial)}
          </div>
          <div class="app-details-modal__title-wrap">
            <div class="app-details-modal__badges">
              <span class="app-badge-type app-badge-type--${item.type}">
                ${icon(isOjt ? 'graduationCap' : 'briefcase', 12)} ${isOjt ? 'OJT Internship' : 'Job Application'}
              </span>
              <span class="ojt-app-card__badge" style="background:${color}20; color:${color}; border: 1px solid ${color}44;">
                ${statusBadgeLabel}
              </span>
              <span class="app-details-modal__ref">
                Ref: #APP-${item.type.toUpperCase()}-${String(item.id).padStart(4, '0')}
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
            ${isOjt ? `
              <div class="ojt-timeline" style="min-width:0; overflow-x:auto; padding-bottom:6px;">
                ${OJT_STEPS.map((step, sIdx) => {
                  const stepIndex = getOjtStepIndex(item);
                  const isDone    = sIdx < stepIndex;
                  const isCurrent = sIdx === stepIndex;
                  const stepColor = isDone ? '#10B981' : isCurrent ? color : 'var(--border-default)';
                  const textColor = isDone ? '#10B981' : isCurrent ? color : 'var(--text-tertiary)';
                  return `
                    <div class="ojt-timeline__step">
                      ${sIdx < OJT_STEPS.length - 1 ? `
                        <div class="ojt-timeline__line ${isDone ? 'ojt-timeline__line--done' : ''}"></div>
                      ` : ''}
                      <div class="ojt-timeline__dot ${isCurrent ? 'ojt-timeline__dot--current' : isDone ? 'ojt-timeline__dot--done' : ''}" style="border-color:${stepColor}; ${isCurrent ? 'background:' + color + ';' : isDone ? 'background:#10B981;' : ''}">
                        <span style="color:${isCurrent || isDone ? '#fff' : 'var(--text-tertiary)'}; display:flex; align-items:center; justify-content:center;">
                          ${icon(step.icon, 11)}
                        </span>
                      </div>
                      <p class="ojt-timeline__label" style="color:${textColor}; font-weight:${isCurrent ? '700' : '500'};">
                        ${step.label}
                      </p>
                    </div>`;
                }).join('')}
              </div>
            ` : `
              <div class="app-tracker" style="margin:0; padding:8px 4px;">
                ${jobStatusOrder.map((s, sIdx) => {
                  const sc          = jobStatusConfig[item.status] || jobStatusConfig.applied;
                  const currentStep = sc.step || 0;
                  const stepCfg     = jobStatusConfig[s];
                  const done        = (sIdx + 1) <= currentStep;
                  const active      = (sIdx + 1) === currentStep;
                  return `
                    <div class="app-tracker__step ${done ? 'app-tracker__step--done' : ''} ${active ? 'app-tracker__step--active' : ''}">
                      <div class="app-tracker__dot" style="${done ? 'background:' + stepCfg.gradient : ''}">
                        ${done ? icon('checkCircle', 10) : ''}
                      </div>
                      ${sIdx < jobStatusOrder.length - 1 ? '<div class="app-tracker__line' + (done && (sIdx + 2) <= currentStep ? ' app-tracker__line--done' : '') + '"></div>' : ''}
                    </div>`;
                }).join('')}
              </div>
            `}
          </div>

          <!-- Current Guidance Callout -->
          ${(isOjt && getOjtGuidance(item)) ? `
            <div class="app-details-note-box" style="border-left-color:${color}; background:${color}0c;">
              <strong style="color:${color}; display:flex; align-items:center; gap:6px; margin-bottom:4px;">
                ${icon('sparkles', 14)} Next Step Guidance:
              </strong>
              <p style="margin:0;">${escapeHtml(getOjtGuidance(item))}</p>
            </div>
          ` : ''}

          <!-- Interview Details Card (If scheduled or past) -->
          ${(item.interview || item.interviewScheduledAt) ? `
            <div class="app-details-note-box" style="border-left-color:${item.rawStatus === 'company_accepted' || item.rawStatus === 'accepted' || item.rawStatus === 'ojt_confirmed' || item.rawStatus === 'ojt_started' ? '#059669' : (isOjt && isOjtInterviewPast(item) ? '#059669' : 'var(--color-warning)')}; background:${item.rawStatus === 'company_accepted' || item.rawStatus === 'accepted' || item.rawStatus === 'ojt_confirmed' || item.rawStatus === 'ojt_started' ? 'rgba(5,150,105,0.08)' : (isOjt && isOjtInterviewPast(item) ? 'rgba(5,150,105,0.08)' : 'var(--color-warning-bg)')};">
              <strong style="color:${item.rawStatus === 'company_accepted' || item.rawStatus === 'accepted' || item.rawStatus === 'ojt_confirmed' || item.rawStatus === 'ojt_started' ? '#059669' : (isOjt && isOjtInterviewPast(item) ? '#059669' : 'var(--color-warning)')}; display:flex; align-items:center; gap:6px; margin-bottom:4px;">
                ${icon(item.rawStatus === 'company_accepted' || item.rawStatus === 'accepted' || item.rawStatus === 'ojt_confirmed' || item.rawStatus === 'ojt_started' || (isOjt && isOjtInterviewPast(item)) ? 'checkCircle' : 'video', 14)} 
                ${item.rawStatus === 'company_accepted' 
                  ? 'Interview Completed · Accepted by Company 🎉' 
                  : (['accepted', 'ojt_confirmed', 'ojt_started'].includes(item.rawStatus)
                    ? 'Interview Completed · Accepted'
                    : (isOjt && isOjtInterviewPast(item) ? 'Interview Completed (Awaiting Company Result)' : 'Interview Scheduled'))}
              </strong>
              <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap:8px; margin-top:8px;">
                ${item.interview?.scheduled_date ? `<div><span style="font-size:0.75rem; color:var(--text-tertiary);">Date:</span> <strong>${escapeHtml(item.interview.scheduled_date)}</strong></div>` : ''}
                ${item.interview?.scheduled_time ? `<div><span style="font-size:0.75rem; color:var(--text-tertiary);">Time:</span> <strong>${escapeHtml(item.interview.scheduled_time)}</strong></div>` : ''}
                ${item.interview?.platform ? `<div><span style="font-size:0.75rem; color:var(--text-tertiary);">Platform / Venue:</span> <strong>${escapeHtml(item.interview.platform)}</strong></div>` : ''}
                ${item.interview?.interviewer_name ? `<div><span style="font-size:0.75rem; color:var(--text-tertiary);">Interviewer:</span> <strong>${escapeHtml(item.interview.interviewer_name)}</strong></div>` : ''}
                ${item.interviewScheduledAt ? `<div><span style="font-size:0.75rem; color:var(--text-tertiary);">Interview Date & Time:</span> <strong>${new Date(item.interviewScheduledAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</strong></div>` : ''}
                ${item.interviewType ? `<div><span style="font-size:0.75rem; color:var(--text-tertiary);">Format:</span> <strong>${item.interviewType === 'face_to_face' ? 'Face-to-Face' : 'Online'}</strong></div>` : ''}
                ${item.interviewLocation ? `<div><span style="font-size:0.75rem; color:var(--text-tertiary);">Location / Venue:</span> <strong>${escapeHtml(item.interviewLocation)}</strong></div>` : ''}
              </div>
              ${item.companyNote ? `
                <div style="margin-top:8px; padding-top:8px; border-top:1px dashed rgba(0,0,0,0.1); font-size:0.8rem;">
                  <span style="color:var(--text-tertiary);">${item.rawStatus === 'company_accepted' ? 'Company Acceptance Message:' : 'Company Instructions:'}</span> <em>"${escapeHtml(item.companyNote)}"</em>
                </div>
              ` : ''}
              ${item.coordinatorNote ? `
                <div style="margin-top:8px; padding-top:8px; border-top:1px dashed rgba(0,0,0,0.1); font-size:0.8rem;">
                  <span style="color:var(--text-tertiary);">Coordinator Note:</span> <em>"${escapeHtml(item.coordinatorNote)}"</em>
                </div>
              ` : ''}
              ${item.interview?.meeting_link && !['company_accepted', 'accepted', 'ojt_confirmed', 'ojt_started'].includes(item.rawStatus) ? `
                <div style="margin-top:10px;">
                  <a href="${escapeHtml(item.interview.meeting_link)}" target="_blank" rel="noopener noreferrer" class="btn btn--sm" style="background:var(--color-warning); color:#fff; text-decoration:none; display:inline-flex; align-items:center; gap:6px;">
                    ${icon('video', 14)} Join Interview Meeting
                  </a>
                </div>
              ` : ''}
            </div>
          ` : ''}

          <!-- OJT Start Instructions (if confirmed) -->
          ${item.ojtStartDate ? `
            <div class="app-details-note-box" style="border-left-color:var(--color-primary); background:var(--color-primary-bg);">
              <strong style="color:var(--color-primary); display:flex; align-items:center; gap:6px; margin-bottom:4px;">
                ${icon('calendar', 14)} OJT Start Confirmation:
              </strong>
              <p style="margin:0 0 6px;">Start Date: <strong>${new Date(item.ojtStartDate).toLocaleDateString(undefined, { dateStyle: 'full' })}</strong></p>
              ${item.ojtInstructions ? `<p style="margin:0;">${escapeHtml(item.ojtInstructions)}</p>` : ''}
            </div>
          ` : ''}
        </div>

        <!-- 2. Role Specifications & Overview -->
        <div class="app-details-section">
          <h4 class="app-details-section__title">${icon('briefcase', 14)} Position Details</h4>
          <div class="app-details-grid">
            <div class="app-details-grid__item">
              <div class="app-details-grid__icon">${icon('building', 18)}</div>
              <div>
                <div class="app-details-grid__label">Department</div>
                <div class="app-details-grid__value">${escapeHtml(item.department || 'General / All')}</div>
              </div>
            </div>

            <div class="app-details-grid__item">
              <div class="app-details-grid__icon">${icon('mapPin', 18)}</div>
              <div>
                <div class="app-details-grid__label">Location / Setup</div>
                <div class="app-details-grid__value">${escapeHtml(item.location || 'CHMSU Area')}</div>
              </div>
            </div>

            <div class="app-details-grid__item">
              <div class="app-details-grid__icon">${icon('clock', 18)}</div>
              <div>
                <div class="app-details-grid__label">${isOjt ? 'Schedule / Hours' : 'Employment Type'}</div>
                <div class="app-details-grid__value">${escapeHtml(isOjt ? (item.scheduleType || item.duration) : item.employmentType)}</div>
              </div>
            </div>

            <div class="app-details-grid__item">
              <div class="app-details-grid__icon">${icon('dollarSign', 18)}</div>
              <div>
                <div class="app-details-grid__label">${isOjt ? 'Allowance / Duration' : 'Salary Range'}</div>
                <div class="app-details-grid__value">${escapeHtml(isOjt ? (item.duration || 'Standard Allowance') : item.salaryRange)}</div>
              </div>
            </div>

            <div class="app-details-grid__item">
              <div class="app-details-grid__icon">${icon(isOjt ? 'graduationCap' : 'award', 18)}</div>
              <div>
                <div class="app-details-grid__label">${isOjt ? 'Slot Availability' : 'Experience Level'}</div>
                <div class="app-details-grid__value">
                  ${isOjt
                    ? (item.slotsRemaining != null ? `${item.slotsRemaining} of ${item.slotsTotal || item.slotsRemaining} slots remaining` : 'Internship Placement')
                    : escapeHtml(item.experienceLevel || 'Entry Level')
                  }
                </div>
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

        <!-- 3. Role Description -->
        ${item.description ? `
          <div class="app-details-section">
            <h4 class="app-details-section__title">${icon('fileText', 14)} Description & Objectives</h4>
            <p class="app-details-text">${escapeHtml(item.description)}</p>
          </div>
        ` : ''}

        <!-- 4. Responsibilities / Learning Outcomes -->
        ${(item.responsibilities && item.responsibilities.length > 0) ? `
          <div class="app-details-section">
            <h4 class="app-details-section__title">${icon('target', 14)} Key Responsibilities</h4>
            <ul class="app-details-list">
              ${item.responsibilities.map(r => `<li>${icon('checkCircle', 15)} <span>${escapeHtml(r)}</span></li>`).join('')}
            </ul>
          </div>
        ` : (item.learningOutcomes ? `
          <div class="app-details-section">
            <h4 class="app-details-section__title">${icon('target', 14)} Learning Outcomes</h4>
            <p class="app-details-text">${escapeHtml(item.learningOutcomes)}</p>
          </div>
        ` : '')}

        <!-- 5. Requirements -->
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
            <h4 class="app-details-section__title">${icon('code', 14)} Required / Recommended Skills</h4>
            <div class="app-details-tags">
              ${item.requiredSkills.map(sk => `<span class="app-details-tag">${escapeHtml(sk)}</span>`).join('')}
            </div>
          </div>
        ` : ''}

        <!-- 7. Preferred Courses (OJT) -->
        ${(item.preferredCourses && item.preferredCourses.length > 0) ? `
          <div class="app-details-section">
            <h4 class="app-details-section__title">${icon('graduationCap', 14)} Preferred Programs / Courses</h4>
            <div class="app-details-tags">
              ${item.preferredCourses.map(c => `<span class="app-details-tag" style="background:var(--bg-secondary);color:var(--text-secondary);">${escapeHtml(c)}</span>`).join('')}
            </div>
          </div>
        ` : ''}

        <!-- 8. Submission & Student Notes -->
        <div class="app-details-section">
          <h4 class="app-details-section__title">${icon('mail', 14)} Submission Details</h4>
          <div class="app-details-note-box">
            ${(item.coverLetter || item.studentMessage) ? `
              <strong style="display:block; margin-bottom:4px; color:var(--text-primary);">
                Message / Note Submitted With Application:
              </strong>
              <p style="margin:0; font-style:italic;">"${escapeHtml(item.coverLetter || item.studentMessage)}"</p>
            ` : `
              <p style="margin:0; color:var(--text-secondary);">
                ${icon('checkCircle', 14)} Profile, credentials, and digital resume submitted successfully.
              </p>
            `}
          </div>
          ${item.coordinatorNote ? `
            <div class="app-details-note-box" style="border-left-color:var(--color-info); background:var(--color-info-bg); margin-top:8px;">
              <strong style="color:var(--color-info); display:block; margin-bottom:4px;">Supervisor / Coordinator Note:</strong>
              <p style="margin:0;">${escapeHtml(item.coordinatorNote)}</p>
            </div>
          ` : ''}
          ${item.companyNote ? `
            <div class="app-details-note-box" style="border-left-color:var(--color-warning); background:var(--color-warning-bg); margin-top:8px;">
              <strong style="color:var(--color-warning); display:block; margin-bottom:4px;">Company Feedback / Note:</strong>
              <p style="margin:0;">${escapeHtml(item.companyNote)}</p>
            </div>
          ` : ''}
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="app-details-modal__footer">
        <button
          class="app-card__btn app-card__btn--ghost app-card__btn--danger modal-btn-withdraw"
          data-id="${item.id}"
          data-type="${item.type}"
        >
          ${icon('x', 14)} Withdraw Application
        </button>
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

  if (!existingOverlay) {
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.querySelector('.modal-box')?.classList.add('modal-box--visible'));
  }

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
      window.openChat(isOjt ? `ojt_interest_${item.id}` : `job_app_${item.id}`);
    }
  });

  // Wire withdraw button in modal
  overlay.querySelector('.modal-btn-withdraw')?.addEventListener('click', async () => {
    if (onWithdrawSuccess) {
      const confirmed = await onWithdrawSuccess(item.id, item.type);
      if (confirmed) closeModal();
    }
  });
}

/* ─────────────────────────────────────────────────────────────────────────────
   CARD RENDERERS
   ───────────────────────────────────────────────────────────────────────────── */
// Unified Application Card: renders either OJT or Job Application
function unifiedApplicationCard(item, idx) {
  const isOjt = item.type === 'ojt';

  if (isOjt) {
    // ── OJT Card with 9-stage progress tracker ──
    const status      = item.rawStatus || 'interested';
    const stepIndex   = getOjtStepIndex(item);
    const color       = OJT_STEP_COLOR[status] || '#10B981';
    const guidance    = getOjtGuidance(item);
    const badgeLabel  = getOjtStatusBadge(item);
    const appliedDate = relativeDate(item.appliedDate);

    return `
      <article class="ojt-app-card animate-fade-in-up" style="--enter-delay:${idx * 60}ms; border: 1.5px solid ${color}44;" data-app-id="${item.id}" data-type="ojt">
        <!-- Header -->
        <div class="ojt-app-card__header">
          <div class="ojt-app-card__avatar" style="background:${color}1a; color:${color};">
            ${icon('graduationCap', 20)}
          </div>
          <div class="ojt-app-card__info">
            <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:3px;">
              <h3 class="ojt-app-card__title" style="margin:0;">${escapeHtml(item.title)}</h3>
              <span class="app-badge-type app-badge-type--ojt">
                ${icon('graduationCap', 12)} OJT Internship
              </span>
            </div>
            <p class="ojt-app-card__company" style="margin:0;">
              ${item.companyUserId
                ? `<a href="#/company/${item.companyUserId}" style="color:inherit;font-weight:600;text-decoration:none;" onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'">${escapeHtml(item.company)}</a>`
                : escapeHtml(item.company)
              }
            </p>
          </div>
          <span class="ojt-app-card__badge" style="background:${color}1e; color:${color}; border: 1px solid ${color}44;">
            ${escapeHtml(badgeLabel)}
          </span>
        </div>

        <!-- 9-Stage Step Progress Strip -->
        <div class="ojt-app-card__timeline">
          <div class="ojt-timeline">
            ${OJT_STEPS.map((step, sIdx) => {
              const isDone    = sIdx < stepIndex;
              const isCurrent = sIdx === stepIndex;
              const stepColor = isDone ? '#10B981' : isCurrent ? color : 'var(--border-default)';
              const textColor = isDone ? '#10B981' : isCurrent ? color : 'var(--text-tertiary)';
              return `
                <div class="ojt-timeline__step">
                  ${sIdx < OJT_STEPS.length - 1 ? `
                    <div class="ojt-timeline__line ${isDone ? 'ojt-timeline__line--done' : ''}"></div>
                  ` : ''}
                  <div class="ojt-timeline__dot ${isCurrent ? 'ojt-timeline__dot--current' : isDone ? 'ojt-timeline__dot--done' : ''}" style="border-color:${stepColor}; ${isCurrent ? 'background:' + color + ';' : isDone ? 'background:#10B981;' : ''}">
                    <span style="color:${isCurrent || isDone ? '#fff' : 'var(--text-tertiary)'}; display:flex; align-items:center; justify-content:center;">
                      ${icon(step.icon, 11)}
                    </span>
                  </div>
                  <p class="ojt-timeline__label" style="color:${textColor}; font-weight:${isCurrent ? '700' : '500'};">
                    ${step.label}
                  </p>
                </div>`;
            }).join('')}
          </div>
        </div>

        <!-- Guidance Note Box -->
        ${guidance ? `
        <div class="ojt-app-card__guidance" style="background:${color}0d; border-left: 3px solid ${color};">
          <p>${escapeHtml(guidance)}</p>
        </div>` : ''}

        <!-- Bottom Actions Row -->
        <div class="ojt-app-card__footer">
          <span class="ojt-app-card__date">${icon('calendar', 12)} Applied ${appliedDate}</span>
          <div class="ojt-app-card__actions">
            <button
              class="app-card__btn app-card__btn--details btn-details"
              data-id="${item.id}"
              data-type="ojt"
              title="View application details"
            >
              ${icon('eye', 13)} Details
            </button>
            <button
              class="app-card__btn app-card__btn--ghost app-card__btn--danger btn-withdraw"
              data-id="${item.id}"
              data-type="ojt"
              title="Withdraw application"
            >
              ${icon('x', 13)} Withdraw
            </button>
            <button
              class="app-card__btn app-card__btn--msg"
              data-id="${item.id}"
              onclick="event.stopPropagation(); window.openChat && window.openChat('ojt_interest_${item.id}')"
              title="Message ${escapeHtml(item.company)}"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
              Message
            </button>
          </div>
        </div>
      </article>
    `;
  } else {
    // ── Job Card with 4-stage progress tracker ──
    const sc          = jobStatusConfig[item.status] || jobStatusConfig.applied;
    const currentStep = sc.step || 0;
    const appliedDate = relativeDate(item.appliedDate);

    return `
      <article class="app-card animate-fade-in-up" style="--enter-delay:${idx * 60}ms;" data-app-id="${item.id}" data-type="job">
        <div class="app-card__left">
          <div class="app-card__logo" style="background:${sc.gradient};">
            ${escapeHtml(item.companyInitial)}
          </div>
        </div>
        <div class="app-card__body">
          <div class="app-card__row-top">
            <div class="app-card__info">
              <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:2px;">
                <h3 class="app-card__title" style="margin:0;">${escapeHtml(item.title)}</h3>
                <span class="app-badge-type app-badge-type--job">
                  ${icon('briefcase', 12)} Job Application
                </span>
              </div>
              <p class="app-card__company" style="margin:0;">${escapeHtml(item.company)}</p>
            </div>
            <span class="app-card__badge" style="background:${sc.bg};color:${sc.color};">
              ${icon(sc.icon, 12)} ${sc.label}
            </span>
          </div>

          <div class="app-tracker">
            ${jobStatusOrder.map((s, sIdx) => {
              const stepCfg = jobStatusConfig[s];
              const done = (sIdx + 1) <= currentStep;
              const active = (sIdx + 1) === currentStep;
              return `
                <div class="app-tracker__step ${done ? 'app-tracker__step--done' : ''} ${active ? 'app-tracker__step--active' : ''}">
                  <div class="app-tracker__dot" style="${done ? 'background:' + stepCfg.gradient : ''}">
                    ${done ? icon('checkCircle', 10) : ''}
                  </div>
                  ${sIdx < jobStatusOrder.length - 1 ? '<div class="app-tracker__line' + (done && (sIdx + 2) <= currentStep ? ' app-tracker__line--done' : '') + '"></div>' : ''}
                </div>`;
            }).join('')}
          </div>

          <div class="app-card__row-bottom">
            <span class="app-card__date">${icon('calendar', 12)} Applied ${appliedDate}</span>
            <div class="app-card__actions">
              <button
                class="app-card__btn app-card__btn--details btn-details"
                data-id="${item.id}"
                data-type="job"
                title="View application details"
              >
                ${icon('eye', 13)} Details
              </button>
              <button
                class="app-card__btn app-card__btn--ghost app-card__btn--danger btn-withdraw"
                data-id="${item.id}"
                data-type="job"
                title="Withdraw application"
              >
                ${icon('x', 13)} Withdraw
              </button>
              <button
                class="app-card__btn app-card__btn--msg"
                data-id="${item.id}"
                onclick="event.stopPropagation(); window.openChat && window.openChat('job_app_${item.id}')"
                title="Message ${escapeHtml(item.company)}"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
                Message
              </button>
            </div>
          </div>
        </div>
      </article>
    `;
  }
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN RENDER FUNCTION
   ───────────────────────────────────────────────────────────────────────────── */
export async function renderApplications(container) {
  if (typeof container._appCleanup === 'function') {
    container._appCleanup();
  }
  let currentTypeFilter = 'all';

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
            Track all your job and OJT internship applications in one place
          </p>
        </div>
      </section>

      <!-- KPI Stats Row (Unified Overview) -->
      <section class="app-stats animate-fade-in-up" style="animation-delay:100ms;" id="app-stats">
        <div class="app-stats__loading">Loading applications overview…</div>
      </section>

      <!-- Filter Controls (All / OJT / Jobs) -->
      <section class="app-type-tabs-wrapper animate-fade-in-up" style="animation-delay:140ms; display:flex; align-items:center; justify-content:space-between; gap:14px; flex-wrap:wrap;">
        <div class="app-type-tabs" id="app-type-tabs">
          <button class="app-type-tab app-type-tab--active" data-filter="all">
            All Applications
            <span class="app-type-tab__count" id="tab-all-count">0</span>
          </button>
          <button class="app-type-tab" data-filter="ojt">
            <span class="app-type-tab__icon">${icon('graduationCap', 14)}</span>
            OJT Applications
            <span class="app-type-tab__count" id="tab-ojt-count">0</span>
          </button>
          <button class="app-type-tab" data-filter="job">
            <span class="app-type-tab__icon">${icon('briefcase', 14)}</span>
            Job Applications
            <span class="app-type-tab__count" id="tab-job-count">0</span>
          </button>
        </div>

        <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
          <button id="btn-sync-apps" class="btn btn--sm app-sync-btn" style="background:var(--bg-secondary);color:var(--text-secondary);border:1px solid var(--border-default);border-radius:99px;font-size:0.75rem;display:inline-flex;align-items:center;gap:6px;cursor:pointer;padding:6px 12px;height:32px;" title="Check for real-time application updates">
            <span class="sync-icon" style="display:flex;align-items:center;">${icon('refreshCw', 12)}</span>
            <span class="sync-label" style="font-weight:600;">Sync Status</span>
            <span id="app-sync-indicator" style="font-size:0.68rem;opacity:0.75;margin-left:2px;">• Just now</span>
          </button>
          <a href="#/ojt" class="btn btn--sm" style="background:var(--bg-secondary);color:var(--text-primary);border:1px solid var(--border-default);border-radius:99px;font-size:0.76rem;text-decoration:none;display:inline-flex;align-items:center;gap:4px;height:32px;">
            ${icon('graduationCap', 13)} Browse OJT
          </a>
          <a href="#/jobs" class="btn btn--sm" style="background:var(--bg-secondary);color:var(--text-primary);border:1px solid var(--border-default);border-radius:99px;font-size:0.76rem;text-decoration:none;display:inline-flex;align-items:center;gap:4px;height:32px;">
            ${icon('briefcase', 13)} Browse Jobs
          </a>
        </div>
      </section>

      <!-- Unified Applications Feed -->
      <section class="app-list" id="application-feed" style="margin-top:16px;">
        <div class="app-card--skeleton"></div>
        <div class="app-card--skeleton"></div>
      </section>

      <!-- Unified Empty State -->
      <div id="app-empty" class="app-empty" style="display:none;">
        <div class="app-empty__icon" style="color:var(--color-primary);">${icon('inbox', 52)}</div>
        <h3 id="empty-title">No applications found</h3>
        <p id="empty-desc">You haven't submitted any applications yet.</p>
        <div style="display:flex;gap:10px;margin-top:14px;flex-wrap:wrap;justify-content:center;">
          <a href="#/ojt" class="btn btn--primary" style="text-decoration:none;height:36px;display:inline-flex;align-items:center;gap:6px;padding:0 18px;border-radius:99px;font-size:0.82rem;font-weight:600;">
            Browse OJT Slots ${icon('arrowRight', 14)}
          </a>
          <a href="#/jobs" class="btn" style="text-decoration:none;height:36px;display:inline-flex;align-items:center;gap:6px;padding:0 18px;border-radius:99px;font-size:0.82rem;font-weight:600;background:var(--bg-secondary);color:var(--text-primary);border:1px solid var(--border-default);">
            Browse Jobs ${icon('arrowRight', 14)}
          </a>
        </div>
      </div>
    </div>
  `;

  let allApplications = [];
  let isSyncing = false;
  let lastSyncTime = Date.now();
  let pollTimer = null;
  let syncTimeTimer = null;

  // Stats calculation
  function renderStats() {
    const statsEl = container.querySelector('#app-stats');
    if (!statsEl) return;

    const totalCount = allApplications.length;
    const ojtCount = allApplications.filter(a => a.type === 'ojt').length;
    const jobCount = allApplications.filter(a => a.type === 'job').length;
    const interviewCount = allApplications.filter(a => 
      a.status === 'interview' || a.rawStatus === 'interview_scheduled'
    ).length;
    const activePipelineCount = allApplications.filter(a => 
      a.status === 'offered' || a.rawStatus === 'company_accepted' || a.rawStatus === 'accepted' || a.rawStatus === 'ojt_confirmed' || a.rawStatus === 'ojt_started'
    ).length;

    statsEl.innerHTML = `
      <div class="app-stat-card app-stat-card--total">
        <div class="app-stat-card__icon" style="background:var(--color-primary-bg);color:var(--color-primary);">
          ${icon('inbox', 20)}
        </div>
        <div class="app-stat-card__data">
          <span class="app-stat-card__value" data-counter="${totalCount}">${totalCount}</span>
          <span class="app-stat-card__label">Total Applications</span>
        </div>
      </div>

      <div class="app-stat-card">
        <div class="app-stat-card__icon" style="background:rgba(0,89,48,0.1);color:#005930;">
          ${icon('graduationCap', 20)}
        </div>
        <div class="app-stat-card__data">
          <span class="app-stat-card__value" data-counter="${ojtCount}">${ojtCount}</span>
          <span class="app-stat-card__label">OJT Applications</span>
        </div>
      </div>

      <div class="app-stat-card">
        <div class="app-stat-card__icon" style="background:rgba(78,83,114,0.1);color:var(--text-secondary);">
          ${icon('briefcase', 20)}
        </div>
        <div class="app-stat-card__data">
          <span class="app-stat-card__value" data-counter="${jobCount}">${jobCount}</span>
          <span class="app-stat-card__label">Job Applications</span>
        </div>
      </div>

      <div class="app-stat-card">
        <div class="app-stat-card__icon" style="background:rgba(255,181,71,0.12);color:#FFB547;">
          ${icon('calendar', 20)}
        </div>
        <div class="app-stat-card__data">
          <span class="app-stat-card__value" data-counter="${interviewCount}">${interviewCount}</span>
          <span class="app-stat-card__label">In Interview</span>
        </div>
      </div>

      <div class="app-stat-card">
        <div class="app-stat-card__icon" style="background:rgba(52,199,89,0.12);color:#34C759;">
          ${icon('checkCircle', 20)}
        </div>
        <div class="app-stat-card__data">
          <span class="app-stat-card__value" data-counter="${activePipelineCount}">${activePipelineCount}</span>
          <span class="app-stat-card__label">Offered / Approved</span>
        </div>
      </div>
    `;

    // Tab counts
    const tabAllCount = container.querySelector('#tab-all-count');
    const tabOjtCount = container.querySelector('#tab-ojt-count');
    const tabJobCount = container.querySelector('#tab-job-count');
    if (tabAllCount) tabAllCount.textContent = totalCount;
    if (tabOjtCount) tabOjtCount.textContent = ojtCount;
    if (tabJobCount) tabJobCount.textContent = jobCount;
  }

  // Render unified feed
  function renderFeed(filterType = 'all') {
    const feed = container.querySelector('#application-feed');
    const emptyEl = container.querySelector('#app-empty');
    if (!feed) return;

    const filtered = filterType === 'all'
      ? allApplications
      : allApplications.filter(a => a.type === filterType);

    if (filtered.length === 0) {
      feed.innerHTML = '';
      if (emptyEl) {
        emptyEl.style.display = 'flex';
        const titleEl = emptyEl.querySelector('#empty-title');
        const descEl = emptyEl.querySelector('#empty-desc');
        if (filterType === 'ojt') {
          if (titleEl) titleEl.textContent = 'No OJT applications';
          if (descEl) descEl.textContent = 'You have not applied for any OJT internship slots yet.';
        } else if (filterType === 'job') {
          if (titleEl) titleEl.textContent = 'No job applications';
          if (descEl) descEl.textContent = 'You have not applied for any regular jobs yet.';
        } else {
          if (titleEl) titleEl.textContent = 'No applications yet';
          if (descEl) descEl.textContent = 'Start exploring OJT slots and job opportunities to begin your career journey.';
        }
      }
      return;
    }

    if (emptyEl) emptyEl.style.display = 'none';
    feed.innerHTML = filtered.map((item, idx) => unifiedApplicationCard(item, idx)).join('');
    attachActions();
  }

  // Withdrawal helper used by both card buttons and modal
  async function handleWithdraw(id, type) {
    const isOjt = type === 'ojt';
    const item = allApplications.find(a => String(a.id) === String(id) && a.type === type);
    const name = item ? item.title : 'this application';

    if (!confirm(`Are you sure you want to withdraw your ${isOjt ? 'OJT' : 'job'} application for "${name}"?`)) return false;

    try {
      if (isOjt) {
        await apiDelete(`/ojt/interest/${id}`);
        try {
          const local = JSON.parse(localStorage.getItem('hireme_ojt_interests') || '[]');
          const updated = local.filter(i => String(i.id) !== String(id));
          localStorage.setItem('hireme_ojt_interests', JSON.stringify(updated));
        } catch (_) {}
      } else {
        await apiDelete(`/student/applications/${id}`);
      }
    } catch (_) {}

    const card = container.querySelector(`[data-app-id="${id}"][data-type="${type}"]`);
    if (card) {
      card.classList.add(card.classList.contains('ojt-app-card') ? 'ojt-app-card--removing' : 'app-card--removing');
    }

    setTimeout(() => {
      allApplications = allApplications.filter(a => !(String(a.id) === String(id) && a.type === type));
      renderStats();
      renderFeed(currentTypeFilter);
      showToast(`${isOjt ? 'OJT' : 'Job'} application withdrawn.`, 'info');
    }, 300);

    return true;
  }

  // Action handlers
  function attachActions() {
    container.querySelectorAll('.ojt-app-card, .app-card').forEach(card => {
      const id = card.dataset.appId;
      const type = card.dataset.type;
      const item = allApplications.find(a => String(a.id) === String(id) && a.type === type);
      if (item) wireCardActions(card, item, handleWithdraw);
    });
  }

  // Real-time synchronization engine
  async function syncApplications(showSpinner = false) {
    if (isSyncing) return;
    isSyncing = true;
    const syncBtn = container.querySelector('#btn-sync-apps');
    const syncIndicator = container.querySelector('#app-sync-indicator');
    if (showSpinner && syncBtn) syncBtn.classList.add('is-spinning');

    try {
      const freshApps = await fetchApplicationsData(true);
      if (!container.isConnected) {
        stopSyncLoop();
        return;
      }

      // Check for structural changes vs in-place status progressions
      let hasStructuralChanges = freshApps.length !== allApplications.length;
      const changedItems = [];

      if (!hasStructuralChanges) {
        for (const fresh of freshApps) {
          const existing = allApplications.find(a => String(a.id) === String(fresh.id) && a.type === fresh.type);
          if (!existing) {
            hasStructuralChanges = true;
            break;
          }
          if (
            existing.rawStatus !== fresh.rawStatus ||
            existing.status !== fresh.status ||
            existing.interviewScheduledAt !== fresh.interviewScheduledAt ||
            existing.companyNote !== fresh.companyNote ||
            existing.coordinatorNote !== fresh.coordinatorNote ||
            existing.ojtStartDate !== fresh.ojtStartDate ||
            existing.endorsedAt !== fresh.endorsedAt
          ) {
            changedItems.push({ prev: existing, next: fresh });
          }
        }
      }

      if (hasStructuralChanges) {
        allApplications = freshApps;
        renderStats();
        renderFeed(currentTypeFilter);
      } else if (changedItems.length > 0) {
        allApplications = freshApps;
        renderStats();

        changedItems.forEach(({ prev, next }) => {
          // 1. Patch the card in-place & trigger forward-pulse animation
          patchApplicationCard(container, next, prev, handleWithdraw);

          // 2. Patch the open details modal in-place if currently open
          patchOpenModalIfApplicable(next, handleWithdraw);

          // 3. If step moved forward, notify the student
          if (next.rawStatus !== prev.rawStatus) {
            const isOjt = next.type === 'ojt';
            const badge = isOjt ? getOjtStatusBadge(next) : (jobStatusConfig[next.status]?.label || next.status);
            showToast(`Application updated: "${next.title}" is now "${badge}"`, 'info');
          }
        });
      }

      lastSyncTime = Date.now();
      if (syncIndicator) syncIndicator.textContent = '• Just now';
    } catch (err) {
      console.warn('Silent application sync error:', err);
    } finally {
      isSyncing = false;
      if (syncBtn) syncBtn.classList.remove('is-spinning');
    }
  }

  // Filter tabs listener
  const typeTabs = container.querySelector('#app-type-tabs');
  if (typeTabs) {
    typeTabs.addEventListener('click', (e) => {
      const btn = e.target.closest('.app-type-tab');
      if (!btn) return;
      const filter = btn.dataset.filter;
      if (filter === currentTypeFilter) return;

      currentTypeFilter = filter;
      typeTabs.querySelectorAll('.app-type-tab').forEach(b => {
        b.classList.toggle('app-type-tab--active', b.dataset.filter === filter);
      });

      renderFeed(filter);
    });
  }

  // Manual Sync Button listener
  const syncBtn = container.querySelector('#btn-sync-apps');
  if (syncBtn) {
    syncBtn.addEventListener('click', (e) => {
      e.preventDefault();
      syncApplications(true);
    });
  }

  // Polling loop management (active tab only)
  function startSyncLoop() {
    stopSyncLoop();
    pollTimer = setInterval(() => {
      if (document.hidden) return; // Tab in background, skip
      if (!container.isConnected) {
        stopSyncLoop();
        return;
      }
      syncApplications(false);
    }, 6000); // 6 seconds live poll

    syncTimeTimer = setInterval(() => {
      if (!container.isConnected) {
        stopSyncLoop();
        return;
      }
      const syncIndicator = container.querySelector('#app-sync-indicator');
      if (!syncIndicator) return;
      const sec = Math.floor((Date.now() - lastSyncTime) / 1000);
      if (sec < 15) syncIndicator.textContent = '• Just now';
      else if (sec < 60) syncIndicator.textContent = `• ${sec}s ago`;
      else syncIndicator.textContent = `• ${Math.floor(sec / 60)}m ago`;
    }, 5000);
  }

  function stopSyncLoop() {
    if (pollTimer) clearInterval(pollTimer);
    if (syncTimeTimer) clearInterval(syncTimeTimer);
    pollTimer = null;
    syncTimeTimer = null;
  }

  // Tab visibility & focus wakeup listeners
  const handleVisibilityChange = () => {
    if (!document.hidden && container.isConnected) {
      syncApplications(false);
    }
  };

  const handleWindowFocus = () => {
    if (container.isConnected) {
      syncApplications(false);
    }
  };

  const handleNotifRefresh = () => {
    if (container.isConnected) {
      syncApplications(false);
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('focus', handleWindowFocus);
  window.addEventListener('hireme:applications-refresh', handleNotifRefresh);

  const cleanup = () => {
    stopSyncLoop();
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('focus', handleWindowFocus);
    window.removeEventListener('hireme:applications-refresh', handleNotifRefresh);
    window.removeEventListener('hashchange', cleanup);
  };
  container._appCleanup = cleanup;
  window.addEventListener('hashchange', cleanup);

  // Initial load
  allApplications = await fetchApplicationsData(true);
  renderStats();
  renderFeed('all');
  startSyncLoop();
}

/* ─────────────────────────────────────────────────────────────────────────────
   HELPERS & APPLICATION DATA PIPELINE
   ───────────────────────────────────────────────────────────────────────────── */
function parseApplications(jobRes, ojtRes) {
  // Parse Jobs
  const rawJobs = (jobRes?.success && Array.isArray(jobRes?.data))
    ? jobRes.data
    : (Array.isArray(jobRes) ? jobRes : (jobRes?.data || []));

  const jobItems = rawJobs.map(a => {
    const listing = a.job_listing;
    const compName = listing?.company_name ?? 'Company';
    return {
      id:               a.id,
      type:             'job',
      title:            listing?.title ?? 'Unknown Position',
      company:          compName,
      companyInitial:   compName?.[0]?.toUpperCase() ?? 'J',
      companyUserId:    listing?.company_user_id || null,
      status:           jobStatusAlias[a.status] ?? a.status ?? 'applied',
      rawStatus:        a.status,
      appliedDate:      a.created_at,
      timestamp:        new Date(a.created_at || 0).getTime(),
      department:       listing?.department || 'General / Tech',
      location:         listing?.location || 'Not specified',
      employmentType:   listing?.employment_type || 'Full-time',
      experienceLevel:  listing?.experience_level || 'Entry Level',
      salaryRange:      listing?.salary_range || 'Competitive',
      description:      listing?.description || '',
      responsibilities: Array.isArray(listing?.responsibilities) ? listing.responsibilities : (typeof listing?.responsibilities === 'string' ? JSON.parse(listing.responsibilities || '[]') : []),
      requirements:     Array.isArray(listing?.requirements) ? listing.requirements : (typeof listing?.requirements === 'string' ? JSON.parse(listing.requirements || '[]') : []),
      benefits:         Array.isArray(listing?.benefits) ? listing.benefits : [],
      requiredSkills:   Array.isArray(listing?.required_skills) ? listing.required_skills : [],
      coverLetter:      a.cover_letter || '',
      notes:            a.notes || '',
      interview:        a.latest_interview || null,
      raw:              a,
    };
  });

  // Parse OJT
  let rawOjt = (ojtRes?.success && Array.isArray(ojtRes?.data))
    ? ojtRes.data
    : (Array.isArray(ojtRes) ? ojtRes : (ojtRes?.data || []));

  // Merge localStorage interests if any
  try {
    const user = JSON.parse(localStorage.getItem('hireme_user') || '{}');
    const local = JSON.parse(localStorage.getItem('hireme_ojt_interests') || '[]');
    const myLocal = local.filter(i => !user.email || i.studentEmail === user.email);
    myLocal.forEach(loc => {
      const exists = rawOjt.some(o => o.id === loc.id || (o.ojt_posting_id && o.ojt_posting_id === loc.slotId));
      if (!exists) {
        rawOjt.push({
          id: loc.id,
          status: loc.status || 'interested',
          created_at: loc.createdAt,
          posting: {
            title: loc.slotTitle,
            company_name: loc.company,
          }
        });
      }
    });
  } catch (_) {}

  const ojtItems = rawOjt
    .filter(i => i.status !== 'rejected')
    .map(interest => {
      const posting = interest.posting || {};
      const company = posting.company_name || posting.company || 'Partner Company';
      return {
        id:                     interest.id,
        type:                   'ojt',
        title:                  posting.title || posting.slotTitle || 'OJT Slot',
        company:                company,
        companyInitial:         company?.[0]?.toUpperCase() ?? 'O',
        companyUserId:          posting.company_user_id || null,
        status:                 interest.status || 'interested',
        rawStatus:              interest.status || 'interested',
        appliedDate:            interest.created_at || interest.applied_date,
        timestamp:              new Date(interest.created_at || interest.applied_date || 0).getTime(),
        department:             posting.department || 'General / OJT Placement',
        industry:               posting.industry || '',
        location:               posting.location || 'CHMSU Partner Area',
        branchName:             posting.branch_name || '',
        scheduleType:           posting.schedule_type || 'Full-time OJT (Mon-Fri)',
        duration:               posting.duration || 'Standard OJT Hours',
        slotsTotal:             posting.slots_total || null,
        slotsRemaining:         posting.slots_remaining || null,
        description:            posting.description || '',
        learningOutcomes:       posting.learning_outcomes || '',
        requiredSkills:         Array.isArray(posting.required_skills) ? posting.required_skills : [],
        preferredCourses:       Array.isArray(posting.preferred_courses) ? posting.preferred_courses : [],
        studentMessage:         interest.student_message || '',
        companyNote:            interest.company_note || '',
        coordinatorNote:        interest.coordinator_note || '',
        interviewScheduledAt:   interest.interview_scheduled_at || null,
        interviewType:          interest.interview_type || null,
        interviewLocation:      interest.interview_location || null,
        ojtStartDate:           interest.ojt_start_date || null,
        ojtInstructions:        interest.ojt_instructions || '',
        endorsedAt:             interest.endorsed_at || null,
        endorsementRequestedAt: interest.endorsement_requested_at || null,
        endorsementLetterSentAt:interest.endorsement_letter_sent_at || null,
        raw:                    interest,
      };
    });

  return [...jobItems, ...ojtItems].sort((a, b) => b.timestamp - a.timestamp);
}

async function fetchApplicationsData(forceRefresh = true) {
  const options = forceRefresh ? { forceRefresh: true, bypassCache: true } : {};
  const [jobRes, ojtRes] = await Promise.all([
    apiGet('/student/applications', options).catch(() => null),
    apiGet('/ojt/my-interests', options).catch(() => null),
  ]);
  return parseApplications(jobRes, ojtRes);
}

function wireCardActions(card, item, handleWithdraw) {
  card.style.cursor = 'pointer';
  card.addEventListener('click', (e) => {
    if (e.target.closest('button, a, input, select')) return;
    openApplicationDetailsModal(item, handleWithdraw);
  });

  const btnDetails = card.querySelector('.btn-details');
  if (btnDetails) {
    btnDetails.addEventListener('click', (e) => {
      e.stopPropagation();
      openApplicationDetailsModal(item, handleWithdraw);
    });
  }

  const btnWithdraw = card.querySelector('.btn-withdraw');
  if (btnWithdraw) {
    btnWithdraw.addEventListener('click', async (e) => {
      e.stopPropagation();
      btnWithdraw.disabled = true;
      await handleWithdraw(item.id, item.type);
    });
  }
}

function patchApplicationCard(container, next, prev, handleWithdraw) {
  const oldCard = container.querySelector(`[data-app-id="${next.id}"][data-type="${next.type}"]`);
  if (!oldCard) return;

  const temp = document.createElement('div');
  temp.innerHTML = unifiedApplicationCard(next, 0).trim();
  const newCard = temp.firstElementChild;

  // Visual feedback: remove enter delay & add subtle advance pulse animation
  newCard.classList.remove('animate-fade-in-up');
  newCard.classList.add('app-card--step-advanced');

  oldCard.replaceWith(newCard);
  wireCardActions(newCard, next, handleWithdraw);
}

function patchOpenModalIfApplicable(next, handleWithdraw) {
  const overlay = document.querySelector(`.modal-overlay[data-modal-app-id="${next.id}"][data-modal-type="${next.type}"]`);
  if (!overlay) return;
  openApplicationDetailsModal(next, handleWithdraw, overlay);
}
