/**
 * CHMSU HireMe — Applicants Page (Professional ATS Redesign)
 * Data sourced entirely from the real API.
 */
import { icon } from '../components/icons.js';
import { apiGet, apiPost, apiPatch, resolveStorageUrl } from '../api/client.js';
import { openSetOjtScheduleModal } from '../components/ojt-schedule-modal.js';

const STATUS_LABELS = {
  all:       'All Stages',
  applied:   'Applied',
  reviewed:  'Under Review / Endorsed',
  interview: 'Interview',
  offered:   'Offered / Accepted',
  rejected:  'Rejected',
};

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}

/** Safely coerce a DB value that should be an array */
function parseJsonArray(val) {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try { const p = JSON.parse(val); return Array.isArray(p) ? p : []; } catch { return []; }
  }
  return [];
}

/**
 * Compute the match score recommendation tier and badge configuration.
 * Exact thresholds:
 *  - 71%+        => HIGHLY RECOMMENDED
 *  - 26% - 70%   => RECOMMENDED
 *  - <= 25%      => NOT RECOMMENDED
 */
export function getMatchRecommendation(score) {
  const num = typeof score === 'number' ? Math.round(score) : Math.round(Number(score) || 0);
  if (num >= 71) {
    return {
      tier: 'highly',
      score: num,
      label: 'HIGHLY RECOMMENDED',
      shortLabel: 'Highly Recommended',
      icon: `<svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" style="display:inline-block;vertical-align:-1px;"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`
    };
  }
  if (num > 25) {
    return {
      tier: 'recommended',
      score: num,
      label: 'RECOMMENDED',
      shortLabel: 'Recommended',
      icon: `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:-1px;"><polyline points="20 6 9 17 4 12"/></svg>`
    };
  }
  return {
    tier: 'not-recommended',
    score: num,
    label: 'NOT RECOMMENDED',
    shortLabel: 'Not Recommended',
    icon: `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:-1px;"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`
  };
}

/* ══════════════════════════════════════════════════
   MAIN RENDER
   ══════════════════════════════════════════════════ */
export async function renderApplicants(container) {
  if (typeof container._cleanup === 'function') {
    container._cleanup();
  }
  container.innerHTML = `
    <section class="co-hero fade-in" style="padding:20px 0 12px;">
      <div class="co-hero__content">
        <h1 class="co-hero__title" style="font-size:1.5rem;">${icon('users', 24)} Applicant Pipeline</h1>
        <p class="co-hero__subtitle" style="margin-bottom:var(--space-4);">Review, screen, and manage candidates across both regular Job Openings and Student OJT Internships.</p>
      </div>
    </section>

    <!-- Category Filter Tabs -->
    <div class="ap-cat-tabs fade-in" id="ap-cat-tabs">
      <button type="button" class="ap-cat-tab ap-cat-tab--active" data-cat="all">
        All Applicants <span class="ap-cat-count" id="count-cat-all">0</span>
      </button>
      <button type="button" class="ap-cat-tab" data-cat="job">
        💼 Job Applicants <span class="ap-cat-count" id="count-cat-job">0</span>
      </button>
      <button type="button" class="ap-cat-tab" data-cat="ojt">
        🎓 OJT Applicants <span class="ap-cat-count" id="count-cat-ojt">0</span>
      </button>
    </div>

    <!-- Pipeline Stage Tabs -->
    <div class="ap-pipeline fade-in" id="pipeline-tabs">
      ${Object.entries(STATUS_LABELS).map(([key, label]) => `
        <button class="ap-pipe-btn ${key === 'all' ? 'ap-pipe-btn--active' : ''}" data-status="${key}">
          ${label}
          <span class="ap-pipe-btn__count" id="count-${key}">0</span>
        </button>`).join('')}
    </div>

    <div class="jp-toolbar fade-in" style="margin-top:0;">
      <div style="display:flex;align-items:center;gap:12px;flex:1;">
        <div class="search-box" style="flex:1;max-width:380px;">
          ${icon('search', 16)}
          <input type="text" class="search-box__input" placeholder="Search by name, role, email..." id="applicant-search" />
        </div>
      </div>
    </div>

    <div class="ap-grid fade-in" id="applicants-grid">
      ${skeletonCards(6)}
    </div>`;

  let allApps        = [];
  let activeCategory = 'all';
  let activeStatus   = 'all';

  const res = await apiGet('/company/applications');
  if (res && res.success && Array.isArray(res.data)) {
    allApps = res.data || [];
    updateCategoryCounts(container, allApps);
    updatePipelineCounts(container, allApps, activeCategory);
    renderCards(container, allApps, allApps);
  } else {
    container.querySelector('#applicants-grid').innerHTML = `
      <div class="empty-state">
        ${icon('alertCircle', 48)}
        <h3 class="empty-state__title">Could not load applicants</h3>
        <p class="empty-state__text">Make sure the API server is running.</p>
      </div>`;
  }

  // Category filter click
  container.querySelector('#ap-cat-tabs').addEventListener('click', e => {
    const btn = e.target.closest('.ap-cat-tab');
    if (!btn) return;
    activeCategory = btn.dataset.cat;
    container.querySelectorAll('.ap-cat-tab').forEach(b => b.classList.remove('ap-cat-tab--active'));
    btn.classList.add('ap-cat-tab--active');
    updatePipelineCounts(container, allApps, activeCategory);
    applyFilters(container, allApps, activeCategory, activeStatus, container.querySelector('#applicant-search').value);
  });

  // Pipeline stage click
  container.querySelector('#pipeline-tabs').addEventListener('click', e => {
    const btn = e.target.closest('.ap-pipe-btn');
    if (!btn) return;
    activeStatus = btn.dataset.status;
    container.querySelectorAll('.ap-pipe-btn').forEach(b => b.classList.remove('ap-pipe-btn--active'));
    btn.classList.add('ap-pipe-btn--active');
    applyFilters(container, allApps, activeCategory, activeStatus, container.querySelector('#applicant-search').value);
  });

  // Search input
  container.querySelector('#applicant-search').addEventListener('input', e => {
    applyFilters(container, allApps, activeCategory, activeStatus, e.target.value);
  });

  // Auto-refresh when returning to tab or receiving real-time applicant notification
  const reloadPipeline = () => {
    if (document.body.contains(container)) {
      apiGet('/company/applications').then(res => {
        if (res && res.success && Array.isArray(res.data)) {
          allApps = res.data;
          updateCategoryCounts(container, allApps);
          updatePipelineCounts(container, allApps, activeCategory);
          applyFilters(container, allApps, activeCategory, activeStatus, container.querySelector('#applicant-search')?.value || '');
        }
      });
    }
  };
  const cleanup = () => {
    window.removeEventListener('focus', reloadPipeline);
    window.removeEventListener('hireme:applicants-refresh', reloadPipeline);
  };
  container._cleanup = cleanup;
  window.addEventListener('focus', reloadPipeline);
  window.addEventListener('hireme:applicants-refresh', reloadPipeline);
}

/* ══════════════════════════════════════════════════
   FILTER & COUNT HELPERS
   ══════════════════════════════════════════════════ */
function applyFilters(container, allApps, category, status, query) {
  let filtered = allApps;

  // Filter by category
  if (category === 'job') {
    filtered = filtered.filter(a => a.category === 'job');
  } else if (category === 'ojt') {
    filtered = filtered.filter(a => a.category === 'ojt');
  }

  // Filter by pipeline status
  if (status !== 'all') {
    filtered = filtered.filter(a => a.status === status);
  }

  // Filter by search query
  if (query) {
    const q = query.toLowerCase();
    filtered = filtered.filter(a =>
      (a.applicant?.name || '').toLowerCase().includes(q) ||
      (a.job?.title || '').toLowerCase().includes(q) ||
      (a.applicant?.email || '').toLowerCase().includes(q) ||
      (a.applicant?.headline || '').toLowerCase().includes(q)
    );
  }

  renderCards(container, filtered, allApps);
}

function updateCategoryCounts(container, apps) {
  const countAll = apps.length;
  const countJob = apps.filter(a => a.category === 'job').length;
  const countOjt = apps.filter(a => a.category === 'ojt').length;

  const elAll = container.querySelector('#count-cat-all');
  const elJob = container.querySelector('#count-cat-job');
  const elOjt = container.querySelector('#count-cat-ojt');

  if (elAll) elAll.textContent = countAll;
  if (elJob) elJob.textContent = countJob;
  if (elOjt) elOjt.textContent = countOjt;
}

function updatePipelineCounts(container, apps, category) {
  let scoped = apps;
  if (category === 'job') scoped = apps.filter(a => a.category === 'job');
  if (category === 'ojt') scoped = apps.filter(a => a.category === 'ojt');

  const counts = { all: scoped.length };
  for (const key of Object.keys(STATUS_LABELS)) {
    if (key !== 'all') counts[key] = scoped.filter(a => a.status === key).length;
  }
  for (const [key, count] of Object.entries(counts)) {
    const el = container.querySelector(`#count-${key}`);
    if (el) el.textContent = count;
  }
}

/* ══════════════════════════════════════════════════
   CARDS (Professional ATS Redesign)
   ══════════════════════════════════════════════════ */
function renderCards(container, apps, allApps) {
  const grid = container.querySelector('#applicants-grid');
  if (!grid) return;

  if (!apps.length) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1;padding:48px 16px;text-align:center;">
        ${icon('users', 48)}
        <h3 class="empty-state__title" style="margin-top:12px;">No applicants found</h3>
        <p class="empty-state__text text-secondary text-sm">Applicants will appear here when candidates apply to your job listings or student OJT slots.</p>
      </div>`;
    return;
  }

  grid.innerHTML = apps.map(a => {
    const isOjt = a.category === 'ojt';
    const scoreVal = a.match_score != null ? Math.round(Number(a.match_score)) : 0;
    const rec = getMatchRecommendation(scoreVal);

    const chips = (a.applicant.skills || []).slice(0, 3)
      .map(s => `<span class="ap-skill-chip">${s}</span>`).join('') +
      ((a.applicant.skills || []).length > 3
        ? `<span class="ap-skill-chip ap-skill-chip--more">+${a.applicant.skills.length - 3}</span>`
        : '');

    const roleSubtitle = isOjt
      ? (a.applicant.program ? `${a.applicant.program}${a.applicant.year_level ? ' · ' + a.applicant.year_level : ''}` : 'Student Trainee')
      : (a.applicant.headline || 'Job Applicant');

    const id = a.id;
    const chatKey = isOjt ? `ojt_interest_${a.raw_id}` : `job_app_${id}`;

    // Status label, status class, notice box, and action buttons per category
    let statusBadge = a.status_label || (a.status ? a.status.toUpperCase() : 'APPLIED');
    let statusClass = a.status;
    let ojtNotice = '';
    let primaryBtn = '';
    const isPast = isInterviewPast(a);

    if (isOjt) {
      const raw = a.raw_status || 'interested';
      const isViewed = !!a.resume_viewed;

      if (raw === 'interested') {
        if (!isViewed) {
          statusBadge = 'Pending Review';
          statusClass = 'applied';
          ojtNotice = `
            <div class="ap-ojt-notice" style="margin:10px 0 6px;padding:8px 12px;background:rgba(245,158,11,0.08);border-left:3px solid #f59e0b;border-radius:4px;font-size:0.75rem;color:#b45309;line-height:1.4;">
              ${icon('alertCircle', 13)} <strong>Profile Unreviewed</strong> &bull; Review candidate portfolio & requirements before making screening decisions.
            </div>`;
          primaryBtn = `<button class="ap-btn ap-btn--primary ap-btn-view-profile" data-id="${id}" style="background:#005930;border-color:#005930;" title="Inspect student portfolio & application">${icon('userCheck', 14)} View & Review Profile</button>`;
        } else {
          statusBadge = 'Profile Inspected';
          statusClass = 'applied';
          ojtNotice = `
            <div class="ap-ojt-notice" style="margin:10px 0 6px;padding:8px 12px;background:rgba(16,185,129,0.08);border-left:3px solid #10b981;border-radius:4px;font-size:0.75rem;color:#065f46;line-height:1.4;">
              ${icon('checkCircle', 13)} <strong>Profile Inspected</strong> &bull; Submit review note to proceed with coordinator endorsement.
            </div>`;
          primaryBtn = `<button class="ap-btn ap-btn--primary ap-btn-ojt-review" data-id="${id}" style="background:#005930;border-color:#005930;" title="Review candidate portfolio & application">${icon('fileText', 14)} Submit Review Note</button>`;
        }
      } else if (raw === 'company_reviewed') {
        statusBadge = 'Reviewed';
        statusClass = 'reviewed';
        ojtNotice = `
          <div class="ap-ojt-notice" style="margin:10px 0 6px;padding:8px 12px;background:rgba(217,119,6,0.08);border-left:3px solid #D97706;border-radius:4px;font-size:0.75rem;color:#92400e;line-height:1.4;">
            ${icon('fileText', 13)} <strong>Candidate Reviewed</strong> &bull; Request official endorsement letter from coordinator.
          </div>`;
        primaryBtn = `<button class="ap-btn ap-btn--primary ap-btn-ojt-endorse" data-id="${id}" style="background:#D97706;border-color:#D97706;" title="Request official endorsement letter from OJT coordinator">${icon('fileText', 14)} Request Endorsement Letter</button>`;
      } else if (raw === 'endorsement_requested') {
        statusBadge = 'Endorsement Requested';
        statusClass = 'reviewed';
        ojtNotice = `
          <div class="ap-ojt-notice" style="margin:10px 0 6px;padding:8px 12px;background:rgba(168,85,247,0.08);border-left:3px solid #a855f7;border-radius:4px;font-size:0.75rem;color:#6b21a8;line-height:1.4;">
            ${icon('clock', 13)} <strong>Endorsement Requested</strong> &bull; Awaiting coordinator to upload official letter.
          </div>`;
        primaryBtn = `<button class="ap-btn ap-btn--disabled" disabled title="Waiting for OJT coordinator to upload endorsement letter">${icon('clock', 14)} Awaiting Endorsement Letter</button>`;
      } else if (raw === 'endorsed') {
        statusBadge = 'Letter Received';
        statusClass = 'reviewed';
        ojtNotice = `
          <div class="ap-ojt-notice" style="margin:10px 0 6px;padding:8px 12px;background:rgba(16,185,129,0.08);border-left:3px solid #10b981;border-radius:4px;font-size:0.75rem;color:#065f46;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px;">
            <span>${icon('checkCircle', 13)} <strong>Endorsement Letter Received</strong></span>
            ${a.endorsement_letter_url ? `
              <a href="${resolveStorageUrl(a.endorsement_letter_url)}" target="_blank" rel="noopener" class="btn-view-endorsement-pdf" data-url="${resolveStorageUrl(a.endorsement_letter_url)}" data-name="${escapeHtml(a.applicant?.name || 'Student')}" style="color:#005930;font-weight:700;text-decoration:underline;display:inline-flex;align-items:center;gap:4px;cursor:pointer;">
                ${icon('externalLink', 11)} View Letter PDF
              </a>` : ''}
          </div>`;
        primaryBtn = `<button class="ap-btn ap-btn--primary ap-btn-ojt-schedule" data-id="${id}" style="background:#005930;border-color:#005930;" title="Schedule face-to-face or online interview">${icon('calendar', 14)} Schedule Interview</button>`;
      } else if (raw === 'interview_scheduled') {
        statusBadge = 'Interview Scheduled';
        statusClass = 'interview';
        const typeLabel = a.interview_type === 'face_to_face' ? 'Face-to-Face' : 'Online Video';
        ojtNotice = `
          <div class="ap-ojt-notice" style="margin:10px 0 6px;padding:8px 12px;background:rgba(16,185,129,0.08);border-left:3px solid #005930;border-radius:4px;font-size:0.75rem;color:#005930;line-height:1.4;">
            ${icon('calendar', 13)} <strong>Interview Scheduled</strong>: ${a.interview_date || 'Scheduled'} (${typeLabel})${a.interview_location ? ` &bull; ${a.interview_location}` : ''}
          </div>`;
        if (isPast) {
          primaryBtn = `<button class="ap-btn ap-btn--primary ap-btn-ojt-accept" data-id="${id}" style="background:#005930;border-color:#005930;" title="Accept candidate after completed interview">${icon('checkCircle', 14)} Accept After Interview</button>`;
        } else {
          const dateLabel = a.interview_date || 'scheduled date';
          primaryBtn = `<button class="ap-btn ap-btn--disabled" disabled title="Interview on ${dateLabel} must take place first">${icon('clock', 14)} Interview Scheduled</button>`;
        }
      } else if (raw === 'company_accepted') {
        statusBadge = 'Accepted — Pending Approval';
        statusClass = 'offered';
        ojtNotice = `
          <div class="ap-ojt-notice" style="margin:10px 0 6px;padding:8px 12px;background:rgba(16,185,129,0.08);border-left:3px solid #047857;border-radius:4px;font-size:0.75rem;color:#047857;line-height:1.4;">
            ${icon('checkCircle', 13)} <strong>Accepted</strong> &bull; Waiting for OJT Coordinator to grant final sign-off.
          </div>`;
        primaryBtn = `<button class="ap-btn ap-btn--disabled" disabled title="Waiting for coordinator final approval">${icon('clock', 14)} Awaiting Coordinator Approval</button>`;
      } else if (raw === 'accepted') {
        statusBadge = 'Coordinator Approved';
        statusClass = 'offered';
        ojtNotice = `
          <div class="ap-ojt-notice" style="margin:10px 0 6px;padding:8px 12px;background:rgba(16,185,129,0.12);border-left:3px solid #005930;border-radius:4px;font-size:0.75rem;color:#005930;line-height:1.4;">
            ${icon('shield', 13)} <strong>Coordinator Approved!</strong> Set OJT start date & reporting instructions.
          </div>`;
        primaryBtn = `<button class="ap-btn ap-btn--primary ap-btn-ojt-start" data-id="${id}" style="background:#005930;border-color:#005930;" title="Set start date and reporting instructions">${icon('calendar', 14)} Set Start Date & Instructions</button>`;
      } else if (raw === 'ojt_confirmed') {
        statusBadge = 'OJT Confirmed';
        statusClass = 'offered';
        ojtNotice = `
          <div class="ap-ojt-notice" style="margin:10px 0 6px;padding:8px 12px;background:rgba(139,92,246,0.08);border-left:3px solid #8b5cf6;border-radius:4px;font-size:0.75rem;color:#5b21b6;line-height:1.4;">
            ${icon('calendar', 13)} <strong>Reporting Date: ${a.ojt_start_date || 'Confirmed'}</strong>${a.ojt_instructions ? ` &bull; Instructions sent` : ''}
          </div>`;
        primaryBtn = `<span class="ap-btn ap-btn--static-success">${icon('calendar', 14)} Confirmed: ${a.ojt_start_date || 'Set'}</span>`;
      } else if (raw === 'ojt_started') {
        statusBadge = 'OJT Active';
        statusClass = 'offered';
        ojtNotice = `
          <div class="ap-ojt-notice" style="margin:10px 0 6px;padding:8px 12px;background:rgba(16,185,129,0.1);border-left:3px solid #005930;border-radius:4px;font-size:0.75rem;color:#005930;line-height:1.4;">
            ${icon('graduationCap', 13)} <strong>Active Trainee</strong> &bull; Logging hours in CHMSU tracker.
          </div>`;
        primaryBtn = `<span class="ap-btn ap-btn--static-success">${icon('graduationCap', 14)} Active Trainee</span>`;
      } else if (raw === 'rejected') {
        statusBadge = 'Declined';
        statusClass = 'rejected';
        primaryBtn = `<span class="ap-btn ap-btn--static">${icon('x', 14)} Application Closed</span>`;
      }
    } else {
      // Regular Job Applicant
      const isViewed = a.status !== 'applied' || !!a.resume_viewed;
      if (a.status === 'applied') {
        if (!isViewed) {
          statusBadge = 'Pending Review';
          statusClass = 'applied';
          primaryBtn = `<button class="ap-btn ap-btn--primary ap-btn-view-profile" data-id="${id}" style="background:#005930;border-color:#005930;" title="Review candidate resume & credentials">${icon('userCheck', 14)} View & Review Profile</button>`;
        } else {
          statusBadge = 'Reviewed';
          statusClass = 'reviewed';
          primaryBtn = `<button class="ap-btn ap-btn--primary ap-btn-status" data-action="interview" data-id="${id}">${icon('video', 14)} Schedule Interview</button>`;
        }
      } else if (a.status === 'reviewed') {
        primaryBtn = `<button class="ap-btn ap-btn--primary ap-btn-status" data-action="interview" data-id="${id}">${icon('video', 14)} Schedule Interview</button>`;
      } else if (a.status === 'interview') {
        if (isPast) {
          primaryBtn = `<button class="ap-btn ap-btn--primary ap-btn-offer" data-id="${id}">${icon('award', 14)} Extend Offer</button>`;
        } else {
          const dateLabel = a.interview_date || 'scheduled date';
          primaryBtn = `<button class="ap-btn ap-btn--disabled" disabled title="Interview on ${dateLabel} must take place first">${icon('clock', 14)} Interview Scheduled</button>`;
        }
      } else if (a.status === 'offered') {
        primaryBtn = `<span class="ap-btn ap-btn--static-success">${icon('checkCircle', 14)} Job Offer Sent</span>`;
      } else if (a.status === 'rejected') {
        primaryBtn = `<span class="ap-btn ap-btn--static">${icon('x', 14)} Application Closed</span>`;
      }
    }

    const isViewed = isOjt ? !!a.resume_viewed : (a.status !== 'applied' || !!a.resume_viewed);
    const showReject = isOjt
      ? (!['rejected', 'ojt_confirmed', 'ojt_started'].includes(a.raw_status) && (a.raw_status !== 'interested' || isViewed))
      : (a.status !== 'rejected' && a.status !== 'offered' && (a.status !== 'applied' || isViewed));

    return `
      <div class="ap-card ap-card--${isOjt ? 'ojt' : 'job'}" data-id="${a.id}">
        
        <!-- Top Bar: Category on left, Status on right -->
        <div class="ap-card__top">
          <span class="ap-badge ap-badge--${isOjt ? 'ojt' : 'job'}">
            ${isOjt ? icon('award', 12) + ' OJT Internship' : icon('briefcase', 12) + ' Job Opening'}
          </span>
          <span class="ap-status ap-status--${statusClass}">
            <span class="ap-status__dot"></span>
            <span>${statusBadge}</span>
          </span>
        </div>

        <!-- Profile identity block -->
        <div class="ap-card__profile">
          <div class="ap-card__avatar ${isOjt ? 'ap-card__avatar--ojt' : 'ap-card__avatar--job'}">
            ${a.applicant.initials || 'CA'}
          </div>
          <div class="ap-card__info">
            <h4 class="ap-card__name" title="${a.applicant.name}">${a.applicant.name}</h4>
            <div class="ap-card__target-role">
              <span class="ap-card__role-title">${a.job.title}</span>
            </div>
            <div class="ap-card__sub-role" title="${roleSubtitle}">
              ${roleSubtitle}
            </div>
          </div>
        </div>

        <!-- Match score meter -->
        <div class="ap-card__score-section">
          <div class="ap-card__score-header">
            <div class="ap-card__score-title-group">
              <span class="ap-card__score-label">Skill Match</span>
              <span class="ap-card__score-pct ap-card__score-pct--${rec.tier}">${scoreVal}%</span>
            </div>
            <span class="ap-rec-tag ap-rec-tag--${rec.tier}" title="${scoreVal}% Skill Match — ${rec.shortLabel}">
              ${rec.icon}
              <span>${rec.label}</span>
            </span>
          </div>
          <div class="ap-card__score-track" title="${scoreVal}% Skill Match — ${rec.shortLabel}">
            <div class="ap-card__score-bar ap-card__score-bar--${rec.tier}" style="width:${Math.max(scoreVal, scoreVal === 0 ? 0 : 3)}%;"></div>
          </div>
        </div>

        <!-- Meta list -->
        <div class="ap-card__meta-list">
          <div class="ap-card__meta-item" title="${a.applicant.email}">
            ${icon('mail', 12)}
            <span>${a.applicant.email}</span>
          </div>
          <div class="ap-card__meta-item">
            ${icon('calendar', 12)}
            <span>Applied ${a.applied_at || 'Recently'}</span>
          </div>
          ${a.raw_status === 'endorsed' ? `
            <div class="ap-card__meta-item ap-card__meta-item--highlight">
              ${icon('checkCircle', 12)}
              <span>Coordinator Endorsed</span>
            </div>` : ''}
        </div>

        ${ojtNotice}
        ${chips ? `<div class="ap-card__skills-row">${chips}</div>` : ''}

        <!-- Footer actions -->
        <div class="ap-card__footer">
          <div class="ap-card__actions-primary">
            ${primaryBtn}
          </div>
          <div class="ap-card__actions-secondary">
            ${showReject
              ? (isOjt
                  ? `<button class="ap-btn ap-btn--ghost-danger ap-btn-ojt-reject" data-id="${id}" title="Decline applicant">${icon('x', 13)} Decline</button>`
                  : `<button class="ap-btn ap-btn--ghost-danger ap-btn-status" data-action="rejected" data-id="${id}" title="Reject candidate">${icon('x', 13)} Reject</button>`)
              : (!isViewed
                  ? `<button class="ap-btn ap-btn--ghost ap-btn-view-profile" data-id="${id}" title="Inspect candidate profile first">${icon('eye', 13)} Inspect Profile</button>`
                  : `<button class="ap-btn ap-btn--ghost ap-btn-status" disabled style="opacity:0.4;cursor:default;">${icon('x', 13)} Closed</button>`)
            }
            <button type="button" class="ap-btn ap-btn--ghost ap-btn-chat" data-id="${id}" onclick="event.stopPropagation(); window.openChat && window.openChat('${chatKey}')" title="Message candidate">
              ${icon('messageSquare', 13)} Chat
            </button>
            <button class="ap-btn ap-btn--ghost ap-btn-profile" data-id="${id}" title="View full candidate portfolio in new tab">
              ${icon('externalLink', 13)} Portfolio
            </button>
          </div>
        </div>

      </div>`;
  }).join('');

  // Wire View & Review Profile buttons (open resume modal + mark viewed)
  grid.querySelectorAll('.ap-btn-view-profile').forEach(btn => {
    btn.addEventListener('click', () => {
      const app = allApps.find(a => String(a.id) === btn.dataset.id);
      if (app) showResumeModal(app, allApps, container, app.category === 'job' ? 'reviewed' : null);
    });
  });

  // Wire Job Review buttons (open resume + mark reviewed)
  grid.querySelectorAll('.ap-btn-review').forEach(btn => {
    btn.addEventListener('click', () => {
      const app = allApps.find(a => String(a.id) === btn.dataset.id);
      if (app) showResumeModal(app, allApps, container, 'reviewed');
    });
  });

  // Wire OJT Review buttons (opens modal with required note)
  grid.querySelectorAll('.ap-btn-ojt-review').forEach(btn => {
    btn.addEventListener('click', () => {
      const app = allApps.find(a => String(a.id) === btn.dataset.id);
      if (app) showOjtReviewModal(app, allApps, container, null);
    });
  });

  // Wire OJT Request Endorsement buttons
  grid.querySelectorAll('.ap-btn-ojt-endorse').forEach(btn => {
    btn.addEventListener('click', () => {
      const app = allApps.find(a => String(a.id) === btn.dataset.id);
      if (app) showOjtRequestEndorsementModal(app, allApps, container, null);
    });
  });

  // Wire View Endorsement Letter PDF buttons (opens PDF preview modal)
  grid.querySelectorAll('.btn-view-endorsement-pdf').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const url = btn.dataset.url;
      const name = btn.dataset.name;
      if (url) openEndorsementLetterModal(url, name);
    });
  });

  // Wire OJT Schedule Interview buttons (only after endorsed)
  grid.querySelectorAll('.ap-btn-ojt-schedule').forEach(btn => {
    btn.addEventListener('click', () => {
      const app = allApps.find(a => String(a.id) === btn.dataset.id);
      if (app) showOjtScheduleInterviewModal(app, allApps, container, null);
    });
  });

  // Wire OJT Accept After Interview buttons
  grid.querySelectorAll('.ap-btn-ojt-accept').forEach(btn => {
    btn.addEventListener('click', () => {
      const app = allApps.find(a => String(a.id) === btn.dataset.id);
      if (app) showOjtAcceptAfterInterviewModal(app, allApps, container, null);
    });
  });

  // Wire OJT Set Start Date & Instructions buttons
  grid.querySelectorAll('.ap-btn-ojt-start').forEach(btn => {
    btn.addEventListener('click', () => {
      const app = allApps.find(a => String(a.id) === btn.dataset.id);
      if (app) showOjtSetStartModal(app, allApps, container, null);
    });
  });

  // Wire OJT Decline / Reject buttons
  grid.querySelectorAll('.ap-btn-ojt-reject').forEach(btn => {
    btn.addEventListener('click', () => {
      const app = allApps.find(a => String(a.id) === btn.dataset.id);
      if (app) showOjtRejectModal(app, allApps, container, null);
    });
  });

  // Wire Job status-change buttons (reject / interview for regular jobs)
  grid.querySelectorAll('.ap-btn-status').forEach(btn => {
    if (btn.dataset.action === 'interview') {
      btn.addEventListener('click', () => {
        const app = allApps.find(a => String(a.id) === btn.dataset.id);
        if (app) openScheduleModal(app, allApps, container, null);
      });
    } else if (btn.dataset.action === 'rejected') {
      btn.addEventListener('click', () => {
        if (!confirm('Are you sure you want to reject this applicant?')) return;
        doStatusUpdate(btn.dataset.id, btn.dataset.action, allApps, container);
      });
    } else if (btn.dataset.action) {
      btn.addEventListener('click', () =>
        doStatusUpdate(btn.dataset.id, btn.dataset.action, allApps, container));
    }
  });

  // Wire Job Offer buttons
  grid.querySelectorAll('.ap-btn-offer').forEach(btn => {
    btn.addEventListener('click', () => {
      const app = allApps.find(a => String(a.id) === btn.dataset.id);
      if (app) openOfferModal(app, allApps, container, null);
    });
  });

  // Wire Profile buttons (open full profile in a new tab + mark viewed in background)
  grid.querySelectorAll('.ap-btn-profile').forEach(btn => {
    btn.addEventListener('click', () => {
      const app = allApps.find(a => String(a.id) === btn.dataset.id);
      if (!app) return;
      const studentUserId = app.applicant?.id;
      if (!studentUserId) return;

      // Mark viewed in background
      if (app.category === 'ojt') {
        const slotId = app.job?.id || app.posting_id;
        const interestId = app.raw_id;
        if (slotId && interestId && !app.resume_viewed) {
          apiPost(`/company/ojt-postings/${slotId}/mark-viewed/${interestId}`, {}).then(() => {
            app.resume_viewed = true;
            refreshApplicantUI(container, allApps);
          });
        }
      } else if (app.status === 'applied') {
        apiPatch(`/company/applications/${app.id}/status`, { status: 'reviewed' }).then(() => {
          app.status = 'reviewed';
          app.status_label = 'Reviewed';
          app.resume_viewed = true;
          refreshApplicantUI(container, allApps);
        });
      }

      let profileUrl;
      if (app.category === 'ojt') {
        const slotId = app.job?.id || '';
        const interestId = app.raw_id || '';
        profileUrl = `./student-profile.html?student=${studentUserId}&slot=${slotId}&interest=${interestId}&category=ojt`;
      } else {
        const jobId = app.job?.id || '';
        const appId = app.id || app.raw_id || '';
        profileUrl = `./student-profile.html?student=${studentUserId}&job=${jobId}&application=${appId}&category=job`;
      }
      window.open(profileUrl, '_blank');
    });
  });
}

function refreshApplicantUI(container, allApps) {
  const cat = container.querySelector('.ap-cat-tab--active')?.dataset.cat || 'all';
  updatePipelineCounts(container, allApps, cat);
  updateCategoryCounts(container, allApps);
  const q = container.querySelector('#applicant-search')?.value || '';
  const st = container.querySelector('.ap-pipe-btn--active')?.dataset.status || 'all';
  applyFilters(container, allApps, cat, st, q);
}

function isInterviewPast(a) {
  if (a.interview_scheduled_at_raw) {
    return new Date(a.interview_scheduled_at_raw) <= new Date();
  }
  if (!a.interview_date) return false;
  const today = new Date().toISOString().split('T')[0];
  return a.interview_date <= today;
}

/* ══════════════════════════════════════════════════
   OJT WORKFLOW MODALS
   ══════════════════════════════════════════════════ */

function showOjtReviewModal(app, allApps, container, parentBackdrop) {
  // Guard: Candidate profile must be inspected first
  if (!app.resume_viewed) {
    showToast('Please review the candidate\'s profile before submitting a review note.', 'warning');
    showResumeModal(app, allApps, container, null);
    return;
  }

  const modal = document.createElement('div');
  modal.className = 'modal-backdrop modal-backdrop--visible';
  modal.style.zIndex = '10002';
  const studentName = app.applicant?.name || 'Applicant';
  const slotId = app.job?.id || app.posting_id;
  const interestId = app.raw_id;

  modal.innerHTML = `
    <div class="modal modal--visible" style="max-width:480px;">
      <div class="modal__header" style="border-bottom:3px solid #005930;">
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="width:40px;height:40px;border-radius:10px;background:rgba(0,89,48,0.1);color:#005930;display:flex;align-items:center;justify-content:center;">${icon('userCheck', 20)}</div>
          <div>
            <h3 class="modal__title" style="margin:0;">Review OJT Applicant</h3>
            <p style="font-size:0.76rem;color:var(--text-secondary);margin:2px 0 0;">${studentName}</p>
          </div>
        </div>
        <button class="modal__close" id="rv-close">${icon('x', 20)}</button>
      </div>
      <div class="modal__body" style="padding:20px 24px;">
        <div style="background:rgba(0,89,48,0.06);border:1px solid rgba(0,89,48,0.2);border-radius:var(--radius-md);padding:12px 14px;margin-bottom:18px;font-size:0.8rem;color:#005930;display:flex;gap:8px;">
          ${icon('alertCircle', 14)} <span>After reviewing, you will be able to request an official endorsement letter from the school coordinator.</span>
        </div>
        <div class="form-group">
          <label class="form-label">Review Note for Student <span style="color:var(--color-error);">*</span></label>
          <textarea id="rv-note" class="form-textarea" rows="4" placeholder="e.g. We have reviewed your profile and would like to proceed with your application." style="resize:vertical;"></textarea>
          <span class="form-hint">This note will be shown to the student. Minimum 5 characters.</span>
        </div>
        <p id="rv-error" style="color:var(--color-error);font-size:0.8rem;margin:8px 0 0;display:none;"></p>
      </div>
      <div class="modal__footer">
        <button class="btn btn--outline" id="rv-cancel">Cancel</button>
        <button class="btn btn--primary" id="rv-submit" style="background:#005930;border-color:#005930;gap:6px;">${icon('checkCircle', 14)} Confirm Review</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  const close = () => modal.remove();
  modal.querySelector('#rv-close').addEventListener('click', close);
  modal.querySelector('#rv-cancel').addEventListener('click', close);
  modal.addEventListener('click', e => { if (e.target === modal) close(); });

  modal.querySelector('#rv-submit').addEventListener('click', async () => {
    const note = modal.querySelector('#rv-note').value.trim();
    const errEl = modal.querySelector('#rv-error');
    if (!note || note.length < 5) {
      errEl.textContent = 'Please enter a note of at least 5 characters.';
      errEl.style.display = 'block';
      return;
    }
    const submitBtn = modal.querySelector('#rv-submit');
    submitBtn.disabled = true;
    submitBtn.innerHTML = `${icon('clock', 14)} Processing…`;
    errEl.style.display = 'none';

    try {
      const res = await apiPost(`/company/ojt-postings/${slotId}/accept/${interestId}`, { company_note: note });
      if (res?.success) {
        close();
        if (parentBackdrop) parentBackdrop.remove();
        app.raw_status = 'company_reviewed';
        app.status = 'reviewed';
        app.status_label = 'Reviewed';
        app.company_note = note;
        refreshApplicantUI(container, allApps);
        showToast(res.message || 'Student reviewed successfully! You can now request an endorsement letter.', 'success');
      } else {
        errEl.textContent = res?.message || 'Failed to review student.';
        errEl.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.innerHTML = `${icon('checkCircle', 14)} Confirm Review`;
      }
    } catch {
      errEl.textContent = 'Network error. Please try again.';
      errEl.style.display = 'block';
      submitBtn.disabled = false;
      submitBtn.innerHTML = `${icon('checkCircle', 14)} Confirm Review`;
    }
  });
}

function openEndorsementLetterModal(url, studentName) {
  const fullUrl = resolveStorageUrl(url);
  if (!fullUrl) return;

  const modal = document.createElement('div');
  modal.className = 'modal-backdrop modal-backdrop--visible';
  modal.style.zIndex = '10005';
  modal.innerHTML = `
    <div class="modal modal--visible" style="max-width:900px;width:95vw;height:88vh;display:flex;flex-direction:column;padding:0;overflow:hidden;border-radius:12px;box-shadow:var(--shadow-xl, 0 20px 25px -5px rgba(0,0,0,0.2));">
      <div class="modal__header" style="padding:14px 20px;border-bottom:1px solid var(--border-color, #e2e8f0);display:flex;align-items:center;justify-content:space-between;background:var(--bg-card, #ffffff);flex-shrink:0;">
        <div style="display:flex;align-items:center;gap:12px;min-width:0;">
          <div style="width:38px;height:38px;border-radius:8px;background:rgba(0,89,48,0.1);color:#005930;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            ${icon('fileText', 20)}
          </div>
          <div style="min-width:0;">
            <h3 class="modal__title" style="margin:0;font-size:1.05rem;font-weight:700;line-height:1.2;">Official Endorsement Letter</h3>
            <p style="font-size:0.75rem;color:var(--text-secondary, #64748b);margin:2px 0 0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${studentName ? `Issued for ${escapeHtml(studentName)}` : 'Candidate Endorsement Document'}</p>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:8px;flex-shrink:0;">
          <a href="${fullUrl}" target="_blank" rel="noopener" class="btn btn--outline" style="font-size:0.75rem;padding:6px 12px;text-decoration:none;display:inline-flex;align-items:center;gap:5px;color:var(--text-primary);">
            ${icon('externalLink', 12)} Open in New Tab
          </a>
          <a href="${fullUrl}" download class="btn btn--outline" style="font-size:0.75rem;padding:6px 12px;text-decoration:none;display:inline-flex;align-items:center;gap:5px;color:var(--text-primary);">
            ${icon('download', 12)} Download PDF
          </a>
          <button class="modal__close btn-close-endorsement-modal" style="background:none;border:none;cursor:pointer;padding:6px;color:var(--text-muted, #94a3b8);display:flex;align-items:center;justify-content:center;border-radius:6px;">
            ${icon('x', 20)}
          </button>
        </div>
      </div>
      <div class="modal__body" style="flex:1;padding:0;background:#525659;display:flex;align-items:center;justify-content:center;position:relative;overflow:hidden;">
        <iframe src="${fullUrl}" style="width:100%;height:100%;border:none;" title="Endorsement Letter Preview"></iframe>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const close = () => modal.remove();
  modal.querySelector('.btn-close-endorsement-modal').addEventListener('click', close);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });
}

function showOjtRequestEndorsementModal(app, allApps, container, parentBackdrop) {
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop modal-backdrop--visible';
  modal.style.zIndex = '10002';
  const studentName = app.applicant?.name || 'Applicant';
  const slotId = app.job?.id || app.posting_id;
  const interestId = app.raw_id;

  modal.innerHTML = `
    <div class="modal modal--visible" style="max-width:460px;">
      <div class="modal__header" style="border-bottom:3px solid #D97706;">
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="width:40px;height:40px;border-radius:10px;background:rgba(245,158,11,0.1);color:#D97706;display:flex;align-items:center;justify-content:center;">${icon('fileText', 20)}</div>
          <div>
            <h3 class="modal__title" style="margin:0;">Request Endorsement Letter</h3>
            <p style="font-size:0.76rem;color:var(--text-secondary);margin:2px 0 0;">${studentName}</p>
          </div>
        </div>
        <button class="modal__close" id="re-close">${icon('x', 20)}</button>
      </div>
      <div class="modal__body" style="padding:20px 24px;">
        <div style="background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.25);border-radius:var(--radius-md);padding:14px 16px;font-size:0.82rem;color:var(--text-secondary);line-height:1.5;">
          ${icon('alertCircle', 14)} You are requesting the <strong>OJT Coordinator</strong> to upload an endorsement letter for <strong>${studentName}</strong>. The coordinator will be notified. Once the letter is uploaded, you can schedule an interview.
        </div>
        <p id="re-error" style="color:var(--color-error);font-size:0.8rem;margin:12px 0 0;display:none;"></p>
      </div>
      <div class="modal__footer">
        <button class="btn btn--outline" id="re-cancel">Cancel</button>
        <button class="btn btn--primary" id="re-submit" style="background:#D97706;border-color:#D97706;gap:6px;">${icon('fileText', 14)} Send Request</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  const close = () => modal.remove();
  modal.querySelector('#re-close').addEventListener('click', close);
  modal.querySelector('#re-cancel').addEventListener('click', close);
  modal.addEventListener('click', e => { if (e.target === modal) close(); });

  modal.querySelector('#re-submit').addEventListener('click', async () => {
    const submitBtn = modal.querySelector('#re-submit');
    const errEl = modal.querySelector('#re-error');
    submitBtn.disabled = true;
    submitBtn.innerHTML = `${icon('clock', 14)} Sending…`;
    errEl.style.display = 'none';

    try {
      const res = await apiPost(`/company/ojt-postings/${slotId}/request-endorsement/${interestId}`, {});
      if (res?.success) {
        close();
        if (parentBackdrop) parentBackdrop.remove();
        app.raw_status = 'endorsement_requested';
        refreshApplicantUI(container, allApps);
        showToast(res.message || 'Endorsement letter requested. The coordinator will be notified.', 'success');
      } else {
        errEl.textContent = res?.message || 'Failed to send request.';
        errEl.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.innerHTML = `${icon('fileText', 14)} Send Request`;
      }
    } catch {
      errEl.textContent = 'Network error. Please try again.';
      errEl.style.display = 'block';
      submitBtn.disabled = false;
      submitBtn.innerHTML = `${icon('fileText', 14)} Send Request`;
    }
  });
}

function showOjtScheduleInterviewModal(app, allApps, container, parentBackdrop) {
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop modal-backdrop--visible';
  modal.style.zIndex = '10002';
  const studentName = app.applicant?.name || 'Applicant';
  const slotId = app.job?.id || app.posting_id;
  const interestId = app.raw_id;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().slice(0, 16);

  modal.innerHTML = `
    <div class="modal modal--visible" style="max-width:520px;">
      <div class="modal__header" style="border-bottom:3px solid #005930;">
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="width:40px;height:40px;border-radius:10px;background:rgba(0,89,48,0.1);color:#005930;display:flex;align-items:center;justify-content:center;">${icon('calendar', 20)}</div>
          <div>
            <h3 class="modal__title" style="margin:0;">Schedule OJT Interview</h3>
            <p style="font-size:0.76rem;color:var(--text-secondary);margin:2px 0 0;">${studentName}</p>
          </div>
        </div>
        <button class="modal__close" id="si-close">${icon('x', 20)}</button>
      </div>
      <div class="modal__body" style="padding:20px 24px;display:flex;flex-direction:column;gap:16px;">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Interview Date & Time <span style="color:var(--color-error);">*</span></label>
            <input type="datetime-local" id="si-datetime" class="form-input" min="${minDate}" required />
          </div>
          <div class="form-group">
            <label class="form-label">Interview Type <span style="color:var(--color-error);">*</span></label>
            <select id="si-type" class="form-select" required>
              <option value="">Select type…</option>
              <option value="face_to_face">Face-to-Face</option>
              <option value="online">Online</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label" id="si-location-label">Interview Location <span style="color:var(--color-error);">*</span></label>
          <input type="text" id="si-location" class="form-input" placeholder="e.g. 2nd Floor, Main Office, Lacson St." required />
        </div>
        <div class="form-group">
          <label class="form-label">Instructions / Note for Student <span style="color:var(--color-error);">*</span></label>
          <textarea id="si-note" class="form-textarea" rows="3" placeholder="e.g. Please bring your endorsement letter, portfolio, and 2 valid IDs." style="resize:vertical;"></textarea>
          <span class="form-hint">The student will receive these instructions along with the interview details. Minimum 5 characters.</span>
        </div>
        <p id="si-error" style="color:var(--color-error);font-size:0.8rem;margin:0;display:none;"></p>
      </div>
      <div class="modal__footer">
        <button class="btn btn--outline" id="si-cancel">Cancel</button>
        <button class="btn btn--primary" id="si-submit" style="background:#005930;border-color:#005930;gap:6px;">${icon('calendar', 14)} Schedule Interview</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  const close = () => modal.remove();
  modal.querySelector('#si-close').addEventListener('click', close);
  modal.querySelector('#si-cancel').addEventListener('click', close);
  modal.addEventListener('click', e => { if (e.target === modal) close(); });

  modal.querySelector('#si-type').addEventListener('change', e => {
    const label = modal.querySelector('#si-location-label');
    const loc = modal.querySelector('#si-location');
    if (e.target.value === 'online') {
      label.innerHTML = 'Meeting Link <span style="color:var(--color-error);">*</span>';
      loc.placeholder = 'e.g. https://meet.google.com/xyz-abc-def';
    } else {
      label.innerHTML = 'Interview Location <span style="color:var(--color-error);">*</span>';
      loc.placeholder = 'e.g. 2nd Floor, Main Office, Lacson St.';
    }
  });

  modal.querySelector('#si-submit').addEventListener('click', async () => {
    const dt = modal.querySelector('#si-datetime').value;
    const type = modal.querySelector('#si-type').value;
    const loc = modal.querySelector('#si-location').value.trim();
    const note = modal.querySelector('#si-note').value.trim();
    const errEl = modal.querySelector('#si-error');

    if (!dt || !type || !loc || !note || note.length < 5) {
      errEl.textContent = 'Please fill in all fields (note at least 5 characters).';
      errEl.style.display = 'block';
      return;
    }
    const submitBtn = modal.querySelector('#si-submit');
    submitBtn.disabled = true;
    submitBtn.innerHTML = `${icon('clock', 14)} Scheduling…`;
    errEl.style.display = 'none';

    try {
      const res = await apiPost(`/company/ojt-postings/${slotId}/schedule-interview/${interestId}`, {
        interview_scheduled_at: dt,
        interview_type: type,
        interview_location: loc,
        company_note: note
      });
      if (res?.success) {
        close();
        if (parentBackdrop) parentBackdrop.remove();
        app.raw_status = 'interview_scheduled';
        app.status = 'interview';
        app.status_label = 'Interview';
        app.interview_date = dt.split('T')[0];
        app.interview_scheduled_at_raw = dt;
        app.interview_type = type;
        app.interview_location = loc;
        app.company_note = note;
        refreshApplicantUI(container, allApps);
        showToast(res.message || 'Interview scheduled successfully!', 'success');
      } else {
        errEl.textContent = res?.message || 'Failed to schedule interview.';
        errEl.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.innerHTML = `${icon('calendar', 14)} Schedule Interview`;
      }
    } catch {
      errEl.textContent = 'Network error. Please try again.';
      errEl.style.display = 'block';
      submitBtn.disabled = false;
      submitBtn.innerHTML = `${icon('calendar', 14)} Schedule Interview`;
    }
  });
}

function showOjtAcceptAfterInterviewModal(app, allApps, container, parentBackdrop) {
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop modal-backdrop--visible';
  modal.style.zIndex = '10002';
  const studentName = app.applicant?.name || 'Applicant';
  const slotId = app.job?.id || app.posting_id;
  const interestId = app.raw_id;

  modal.innerHTML = `
    <div class="modal modal--visible" style="max-width:480px;">
      <div class="modal__header" style="border-bottom:3px solid #005930;">
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="width:40px;height:40px;border-radius:10px;background:rgba(0,89,48,0.1);color:#005930;display:flex;align-items:center;justify-content:center;">${icon('checkCircle', 20)}</div>
          <div>
            <h3 class="modal__title" style="margin:0;">Accept After Interview</h3>
            <p style="font-size:0.76rem;color:var(--text-secondary);margin:2px 0 0;">${studentName}</p>
          </div>
        </div>
        <button class="modal__close" id="ai-close">${icon('x', 20)}</button>
      </div>
      <div class="modal__body" style="padding:20px 24px;">
        <div style="background:rgba(0,89,48,0.06);border:1px solid rgba(0,89,48,0.2);border-radius:var(--radius-md);padding:12px 14px;margin-bottom:18px;font-size:0.8rem;color:#005930;display:flex;gap:8px;">
          ${icon('alertCircle', 14)} <span>After accepting, the OJT Coordinator will be notified to give final academic sign-off before training can begin.</span>
        </div>
        <div class="form-group">
          <label class="form-label">Acceptance Message for Student <span style="color:var(--color-error);">*</span></label>
          <textarea id="ai-note" class="form-textarea" rows="4" placeholder='e.g. Congratulations! We are pleased to accept you into our OJT program.' style="resize:vertical;"></textarea>
          <span class="form-hint">This message will be sent to the student. Minimum 5 characters.</span>
        </div>
        <p id="ai-error" style="color:var(--color-error);font-size:0.8rem;margin:8px 0 0;display:none;"></p>
      </div>
      <div class="modal__footer">
        <button class="btn btn--outline" id="ai-cancel">Cancel</button>
        <button class="btn btn--primary" id="ai-submit" style="background:#005930;border-color:#005930;gap:6px;">${icon('checkCircle', 14)} Confirm Acceptance</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  const close = () => modal.remove();
  modal.querySelector('#ai-close').addEventListener('click', close);
  modal.querySelector('#ai-cancel').addEventListener('click', close);
  modal.addEventListener('click', e => { if (e.target === modal) close(); });

  modal.querySelector('#ai-submit').addEventListener('click', async () => {
    const note = modal.querySelector('#ai-note').value.trim();
    const errEl = modal.querySelector('#ai-error');
    if (!note || note.length < 5) {
      errEl.textContent = 'Please enter a message of at least 5 characters.';
      errEl.style.display = 'block';
      return;
    }
    const submitBtn = modal.querySelector('#ai-submit');
    submitBtn.disabled = true;
    submitBtn.innerHTML = `${icon('clock', 14)} Processing…`;
    errEl.style.display = 'none';

    try {
      const res = await apiPost(`/company/ojt-postings/${slotId}/accept-after-interview/${interestId}`, { company_note: note });
      if (res?.success) {
        close();
        if (parentBackdrop) parentBackdrop.remove();
        app.raw_status = 'company_accepted';
        app.status = 'offered';
        app.status_label = 'Accepted — Pending Approval';
        app.company_note = note;
        refreshApplicantUI(container, allApps);
        showToast(res.message || 'Student accepted! The coordinator will give final OJT approval.', 'success');
      } else {
        errEl.textContent = res?.message || 'Failed to accept student.';
        errEl.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.innerHTML = `${icon('checkCircle', 14)} Confirm Acceptance`;
      }
    } catch {
      errEl.textContent = 'Network error. Please try again.';
      errEl.style.display = 'block';
      submitBtn.disabled = false;
      submitBtn.innerHTML = `${icon('checkCircle', 14)} Confirm Acceptance`;
    }
  });
}

function showOjtSetStartModal(app, allApps, container, parentBackdrop) {
  const slotId = app.job?.id || app.posting_id || app.ojt_posting_id;
  const interestId = app.raw_id || (typeof app.id === 'string' && app.id.startsWith('ojt_') ? parseInt(app.id.replace('ojt_', ''), 10) : app.id);
  const requiredHours = app.job?.required_hours || 600;

  if (!slotId || !interestId) {
    showToast('Could not resolve OJT placement details for this applicant.', 'error');
    return;
  }

  openSetOjtScheduleModal({
    studentName: app.applicant?.name || 'Applicant',
    postingTitle: app.job?.title || 'OJT Placement',
    slotId,
    interestId,
    requiredHours,
    existingData: app,
    onSuccess: (res, scheduleData) => {
      if (parentBackdrop) parentBackdrop.remove();
      app.raw_status = 'ojt_confirmed';
      app.status_label = 'OJT Confirmed';
      app.ojt_start_date = scheduleData.startDate;
      app.ojt_instructions = scheduleData.instructions;
      app.schedule_days = scheduleData.selectedDays;
      app.shift_start = scheduleData.shiftStart;
      app.shift_end = scheduleData.shiftEnd;
      app.lunch_start = scheduleData.lunchStart;
      app.lunch_end = scheduleData.lunchEnd;
      app.daily_hours = scheduleData.dailyHrs;
      app.weekly_hours = scheduleData.weeklyHrs;
      app.allow_overtime = scheduleData.allowOt;
      app.max_overtime_hours = scheduleData.maxOt;
      refreshApplicantUI(container, allApps);
      showToast('OJT start date & weekly schedule confirmed!', 'success');
    },
  });
}

function showOjtRejectModal(app, allApps, container, parentBackdrop) {
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop modal-backdrop--visible';
  modal.style.zIndex = '10002';
  const studentName = app.applicant?.name || 'Applicant';
  const slotId = app.job?.id || app.posting_id;
  const interestId = app.raw_id;

  modal.innerHTML = `
    <div class="modal modal--visible" style="max-width:440px;">
      <div class="modal__header" style="border-bottom:3px solid var(--color-error);">
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="width:40px;height:40px;border-radius:10px;background:rgba(239,68,68,0.1);color:var(--color-error);display:flex;align-items:center;justify-content:center;">${icon('x', 20)}</div>
          <div>
            <h3 class="modal__title" style="margin:0;">Decline OJT Applicant</h3>
            <p style="font-size:0.76rem;color:var(--text-secondary);margin:2px 0 0;">${studentName}</p>
          </div>
        </div>
        <button class="modal__close" id="rj-close">${icon('x', 20)}</button>
      </div>
      <div class="modal__body" style="padding:20px 24px;">
        <div class="form-group">
          <label class="form-label">Reason for Declining <span style="color:var(--color-error);">*</span></label>
          <textarea id="rj-note" class="form-textarea" rows="4" placeholder="e.g. Declined due to schedule mismatch or capacity limit." style="resize:vertical;"></textarea>
          <span class="form-hint">The student will see this reason. Minimum 5 characters.</span>
        </div>
        <p id="rj-error" style="color:var(--color-error);font-size:0.8rem;margin:8px 0 0;display:none;"></p>
      </div>
      <div class="modal__footer">
        <button class="btn btn--outline" id="rj-cancel">Cancel</button>
        <button class="btn btn--primary" id="rj-submit" style="background:var(--color-error);border-color:var(--color-error);gap:6px;">${icon('x', 14)} Confirm Decline</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  const close = () => modal.remove();
  modal.querySelector('#rj-close').addEventListener('click', close);
  modal.querySelector('#rj-cancel').addEventListener('click', close);
  modal.addEventListener('click', e => { if (e.target === modal) close(); });

  modal.querySelector('#rj-submit').addEventListener('click', async () => {
    const note = modal.querySelector('#rj-note').value.trim();
    const errEl = modal.querySelector('#rj-error');
    if (!note || note.length < 5) {
      errEl.textContent = 'Please enter a reason of at least 5 characters.';
      errEl.style.display = 'block';
      return;
    }
    const submitBtn = modal.querySelector('#rj-submit');
    submitBtn.disabled = true;
    submitBtn.innerHTML = `${icon('clock', 14)} Processing…`;
    errEl.style.display = 'none';

    try {
      const res = await apiPost(`/company/ojt-postings/${slotId}/reject/${interestId}`, { company_note: note });
      if (res?.success) {
        close();
        if (parentBackdrop) parentBackdrop.remove();
        app.raw_status = 'rejected';
        app.status = 'rejected';
        app.status_label = 'Rejected';
        app.company_note = note;
        refreshApplicantUI(container, allApps);
        showToast('Application declined.', 'info');
      } else {
        errEl.textContent = res?.message || 'Failed to decline applicant.';
        errEl.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.innerHTML = `${icon('x', 14)} Confirm Decline`;
      }
    } catch {
      errEl.textContent = 'Network error. Please try again.';
      errEl.style.display = 'block';
      submitBtn.disabled = false;
      submitBtn.innerHTML = `${icon('x', 14)} Confirm Decline`;
    }
  });
}

/* ══════════════════════════════════════════════════
   STATUS UPDATE
   ══════════════════════════════════════════════════ */
async function doStatusUpdate(appId, newStatus, allApps, container) {
  const app = allApps.find(a => String(a.id) === String(appId));
  if (!app) return;
  const res = await apiPatch(`/company/applications/${appId}/status`, { status: newStatus });
  if (res && res.success) {
    app.status = newStatus;
    app.status_label = ucfirst(newStatus);
    refreshApplicantUI(container, allApps);
    showToast(`${app.applicant.name} moved to "${newStatus}"`);
  } else {
    showToast('Failed to update status. Try again.', 'error');
  }
}

function ucfirst(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/* ══════════════════════════════════════════════════
   SCHEDULE INTERVIEW MODAL (Online & Face-to-Face)
   ══════════════════════════════════════════════════ */
function openScheduleModal(app, allApps, container, parentBackdrop) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-backdrop modal-backdrop--visible';
  overlay.style.cssText = 'z-index:10001;background:rgba(10,12,20,.72);backdrop-filter:blur(3px);';

  const today = new Date().toISOString().split('T')[0];
  const isOjt = app.category === 'ojt';

  overlay.innerHTML = `
    <div class="modal-box" role="dialog" aria-modal="true" style="max-width:540px;width:100%;padding:0;overflow:hidden;">

      <!-- Header -->
      <div style="background:${isOjt ? 'linear-gradient(135deg,#005930,#047857)' : 'linear-gradient(135deg,#1e293b,#334155)'};padding:20px 24px 16px;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:4px;">
          <div style="width:42px;height:42px;border-radius:50%;background:rgba(255,255,255,.25);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:1rem;color:#fff;flex-shrink:0;">
            ${app.applicant.initials || 'CA'}
          </div>
          <div>
            <div style="display:flex;align-items:center;gap:8px;">
              <h3 style="color:#fff;font-size:1rem;font-weight:700;margin:0;">${icon('video', 16)} Schedule Interview</h3>
              <span style="background:rgba(255,255,255,0.2);color:#fff;font-size:0.68rem;padding:2px 8px;border-radius:99px;font-weight:600;">
                ${isOjt ? '🎓 OJT' : '💼 JOB'}
              </span>
            </div>
            <p style="color:rgba(255,255,255,.9);font-size:.8rem;margin:2px 0 0;">
              ${app.applicant.name} · ${app.job.title}
            </p>
          </div>
          <button id="sched-close" style="margin-left:auto;background:rgba(255,255,255,.2);border:none;color:#fff;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;cursor:pointer;">
            ${icon('x', 15)}
          </button>
        </div>
      </div>

      <!-- Form body -->
      <form id="sched-form" style="padding:20px 24px;display:flex;flex-direction:column;gap:14px;max-height:80vh;overflow-y:auto;">
        <p id="sched-error" style="color:#ef4444;font-size:.83rem;min-height:1em;margin:0;"></p>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div>
            <label style="display:block;font-size:.78rem;font-weight:600;color:var(--text-secondary);margin-bottom:5px;">Date *</label>
            <input name="scheduled_date" type="date" min="${today}" class="form-input" required value="${today}" style="width:100%;">
          </div>
          <div>
            <label style="display:block;font-size:.78rem;font-weight:600;color:var(--text-secondary);margin-bottom:5px;">Time *</label>
            <input name="scheduled_time" type="time" class="form-input" required value="10:00" style="width:100%;">
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div>
            <label style="display:block;font-size:.78rem;font-weight:600;color:var(--text-secondary);margin-bottom:5px;">Duration</label>
            <select name="duration" class="form-input form-select" style="width:100%;">
              <option value="30 min">30 minutes</option>
              <option value="45 min" selected>45 minutes</option>
              <option value="1 hour">1 hour</option>
              <option value="1.5 hours">1.5 hours</option>
              <option value="2 hours">2 hours</option>
            </select>
          </div>
          <div>
            <label style="display:block;font-size:.78rem;font-weight:600;color:var(--text-secondary);margin-bottom:5px;">Interview Format *</label>
            <select name="interview_type" id="ap-format-select" class="form-input form-select" required style="width:100%;">
              <option value="online">🌐 Online Video Meeting</option>
              <option value="face_to_face">🏢 Face-to-Face / On-site</option>
            </select>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div>
            <label style="display:block;font-size:.78rem;font-weight:600;color:var(--text-secondary);margin-bottom:5px;">Interview Type *</label>
            <select name="type" class="form-input form-select" required style="width:100%;">
              ${isOjt
                ? `<option value="Face-to-Face Interview">Face-to-Face Interview</option>
                   <option value="Online Interview">Online Interview</option>
                   <option value="OJT Screening">OJT Screening</option>
                   <option value="Technical Assessment">Technical Assessment</option>`
                : `<option value="Technical Interview">Technical Interview</option>
                   <option value="HR Screening">HR Screening</option>
                   <option value="Initial Interview">Initial Interview</option>
                   <option value="Final Interview">Final Interview</option>
                   <option value="Panel Interview">Panel Interview</option>`
              }
            </select>
          </div>
          <div>
            <label style="display:block;font-size:.78rem;font-weight:600;color:var(--text-secondary);margin-bottom:5px;">Interviewer / Host</label>
            <input name="interviewer_name" type="text" class="form-input" placeholder="e.g. Engr. Mark Rivera" style="width:100%;">
          </div>
        </div>

        <div id="ap-online-fields">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <div>
              <label style="display:block;font-size:.78rem;font-weight:600;color:var(--text-secondary);margin-bottom:5px;">Platform</label>
              <select name="platform" class="form-input form-select" style="width:100%;">
                <option value="Google Meet">Google Meet</option>
                <option value="Zoom">Zoom</option>
                <option value="Microsoft Teams">Microsoft Teams</option>
                <option value="Phone Call">Phone Call</option>
              </select>
            </div>
            <div>
              <label style="display:block;font-size:.78rem;font-weight:600;color:var(--text-secondary);margin-bottom:5px;">Meeting Link</label>
              <input name="meeting_link" type="url" class="form-input" placeholder="https://meet.google.com/..." style="width:100%;">
            </div>
          </div>
        </div>

        <div id="ap-onsite-fields" style="display:none;">
          <div>
            <label style="display:block;font-size:.78rem;font-weight:600;color:var(--text-secondary);margin-bottom:5px;">On-site Location / Room / Instructions</label>
            <input name="location" type="text" class="form-input" placeholder="e.g. Main Campus Bldg 2, Room 304 or Company Office" style="width:100%;">
          </div>
        </div>

        <div>
          <label style="display:block;font-size:.78rem;font-weight:600;color:var(--text-secondary);margin-bottom:5px;">Notes / Focus Areas / Student Instructions</label>
          <textarea name="notes" class="form-input form-textarea" rows="3" placeholder="e.g. Please bring a printed copy of your endorsement letter and resume." style="width:100%;resize:vertical;"></textarea>
        </div>

        <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:4px;padding-top:12px;border-top:1px solid var(--border-subtle);">
          <button type="button" id="sched-cancel" class="btn btn--ghost">Cancel</button>
          <button type="submit" id="sched-submit" class="btn btn--primary" style="background:#005930;border-color:#005930;">${icon('video', 14)} Schedule Interview</button>
        </div>
      </form>
    </div>`;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.querySelector('.modal-box')?.classList.add('modal-box--visible'));

  const close = () => overlay.remove();
  overlay.querySelector('#sched-close').onclick  = close;
  overlay.querySelector('#sched-cancel').onclick = close;
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

  const formatSelect = overlay.querySelector('#ap-format-select');
  const onlineFields = overlay.querySelector('#ap-online-fields');
  const onsiteFields = overlay.querySelector('#ap-onsite-fields');

  formatSelect.addEventListener('change', () => {
    if (formatSelect.value === 'face_to_face') {
      onlineFields.style.display = 'none';
      onsiteFields.style.display = 'block';
    } else {
      onlineFields.style.display = 'block';
      onsiteFields.style.display = 'none';
    }
  });

  overlay.querySelector('#sched-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form      = new FormData(e.target);
    const submitBtn = overlay.querySelector('#sched-submit');
    const errEl     = overlay.querySelector('#sched-error');
    errEl.textContent = '';

    const formatVal = form.get('interview_type');
    const payload = {
      type:             form.get('type'),
      interview_type:   formatVal,
      scheduled_date:   form.get('scheduled_date'),
      scheduled_time:   form.get('scheduled_time'),
      duration:         form.get('duration'),
      platform:         formatVal === 'face_to_face' ? 'On-site / In-person' : (form.get('platform') || 'Google Meet'),
      meeting_link:     formatVal === 'face_to_face' ? '#' : (form.get('meeting_link') || undefined),
      location:         formatVal === 'face_to_face' ? (form.get('location') || 'Company Office') : (form.get('meeting_link') || 'Online Meeting'),
      interviewer_name: form.get('interviewer_name') || undefined,
      notes:            form.get('notes') || undefined,
    };

    submitBtn.disabled = true;
    submitBtn.innerHTML = icon('clock', 14) + ' Scheduling…';

    const res = await apiPost(`/company/applications/${app.id}/interview`, payload);

    if (res && res.success) {
      close();
      if (parentBackdrop) parentBackdrop.remove();
      app.status = 'interview';
      app.status_label = 'Interview Scheduled';
      app.interview_date = payload.scheduled_date;
      const cat = container.querySelector('.ap-cat-tab--active')?.dataset.cat || 'all';
      updatePipelineCounts(container, allApps, cat);
      const q = container.querySelector('#applicant-search')?.value || '';
      const st = container.querySelector('.ap-pipe-btn--active')?.dataset.status || 'all';
      applyFilters(container, allApps, cat, st, q);
      showToast(`Interview scheduled for ${app.applicant.name}`, 'success');
    } else {
      errEl.textContent = res?.message || 'Failed to schedule interview. Please try again.';
      submitBtn.disabled = false;
      submitBtn.innerHTML = icon('video', 14) + ' Schedule Interview';
    }
  });
}

/* ══════════════════════════════════════════════════
   OFFER / ACCEPT MODAL
   ══════════════════════════════════════════════════ */
function openOfferModal(app, allApps, container, parentBackdrop) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-backdrop modal-backdrop--visible';
  overlay.style.cssText = 'z-index:10001;background:rgba(10,12,20,.72);backdrop-filter:blur(3px);';

  const isOjt = app.category === 'ojt';
  const today = new Date().toISOString().split('T')[0];
  const expiry = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
  const start = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];

  overlay.innerHTML = `
    <div class="modal-box" role="dialog" aria-modal="true" style="max-width:540px;width:100%;padding:0;overflow:hidden;">

      <!-- Header -->
      <div style="background:${isOjt ? 'linear-gradient(135deg,#005930,#047857)' : 'linear-gradient(135deg,#1e293b,#334155)'};padding:20px 24px 16px;">
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="width:42px;height:42px;border-radius:50%;background:rgba(255,255,255,.25);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:1rem;color:#fff;flex-shrink:0;">
            ${app.applicant.initials || 'CA'}
          </div>
          <div>
            <h3 style="color:#fff;font-size:1rem;font-weight:700;margin:0;">
              ${icon('award', 16)} ${isOjt ? 'Accept Student for OJT' : 'Send Job Offer'}
            </h3>
            <p style="color:rgba(255,255,255,.85);font-size:.8rem;margin:2px 0 0;">
              ${app.applicant.name} &middot; ${app.job.title}
            </p>
          </div>
          <button id="offer-close" style="margin-left:auto;background:rgba(255,255,255,.2);border:none;color:#fff;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;cursor:pointer;">
            ${icon('x', 15)}
          </button>
        </div>
      </div>

      <!-- Form body -->
      <form id="offer-form" style="padding:20px 24px;display:flex;flex-direction:column;gap:14px;max-height:70vh;overflow-y:auto;">
        <p id="offer-error" style="color:#ef4444;font-size:.83rem;min-height:1em;margin:0;"></p>

        ${isOjt ? `
          <div>
            <label style="display:block;font-size:.78rem;font-weight:600;color:var(--text-secondary);margin-bottom:5px;">OJT Allowance / Stipend</label>
            <input name="salary" type="text" class="form-input" value="${app.job.salary_range || 'Unpaid OJT'}" style="width:100%;">
          </div>
          <div>
            <label style="display:block;font-size:.78rem;font-weight:600;color:var(--text-secondary);margin-bottom:5px;">${icon('messageSquare', 12)} Acceptance Message & Instructions for Student *</label>
            <textarea name="notes" class="form-input form-textarea" required rows="4" style="width:100%;resize:vertical;"
              placeholder="e.g. Congratulations! We are glad to accept you for our OJT program. The coordinator will be notified to give final approval.">Congratulations ${app.applicant.name}! We were impressed by your interview and are happy to accept you for the ${app.job.title} OJT program.</textarea>
          </div>
        ` : `
          <!-- Salary -->
          <div>
            <label style="display:block;font-size:.78rem;font-weight:600;color:var(--text-secondary);margin-bottom:5px;">${icon('zap', 12)} Offered Salary *</label>
            <input name="salary" type="text" class="form-input" required placeholder="e.g. ₱55,000 / month"
              value="${app.job.salary_range || ''}" style="width:100%;">
          </div>

          <!-- Dates -->
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <div>
              <label style="display:block;font-size:.78rem;font-weight:600;color:var(--text-secondary);margin-bottom:5px;">${icon('calendar', 12)} Start Date</label>
              <input name="start_date" type="date" class="form-input" value="${start}" style="width:100%;">
            </div>
            <div>
              <label style="display:block;font-size:.78rem;font-weight:600;color:var(--text-secondary);margin-bottom:5px;">${icon('alertCircle', 12)} Offer Expires *</label>
              <input name="expiry_date" type="date" class="form-input" required value="${expiry}" min="${today}" style="width:100%;">
            </div>
          </div>

          <!-- Benefits -->
          <div>
            <label style="display:block;font-size:.78rem;font-weight:600;color:var(--text-secondary);margin-bottom:5px;">${icon('star', 12)} Benefits <span style="font-weight:400;opacity:.7;">(one per line)</span></label>
            <textarea name="benefits" class="form-input form-textarea" rows="3" style="width:100%;resize:vertical;"
              placeholder="Health Insurance&#10;Remote Work&#10;Performance Bonus">${(app.job.benefits || []).join('\n')}</textarea>
          </div>

          <!-- Message -->
          <div>
            <label style="display:block;font-size:.78rem;font-weight:600;color:var(--text-secondary);margin-bottom:5px;">${icon('messageSquare', 12)} Message to Candidate</label>
            <textarea name="message" class="form-input form-textarea" rows="4" style="width:100%;resize:vertical;"
              placeholder="Write a personal note to the candidate...">Dear ${app.applicant.name},\n\nWe are thrilled to extend an offer for the ${app.job.title} position. We were impressed by your skills and believe you would be a fantastic addition to our team.\n\nBest regards,\n${app.job.company || 'HR Team'}</textarea>
          </div>
        `}

        <!-- Footer -->
        <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:4px;padding-top:12px;border-top:1px solid var(--border-subtle);">
          <button type="button" id="offer-cancel" class="btn btn--ghost">Cancel</button>
          <button type="submit" id="offer-submit" class="btn btn--primary" style="background:#005930;border-color:#005930;">${icon('award', 14)} ${isOjt ? 'Confirm Acceptance' : 'Send Offer'}</button>
        </div>
      </form>
    </div>`;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.querySelector('.modal-box')?.classList.add('modal-box--visible'));

  const close = () => overlay.remove();
  overlay.querySelector('#offer-close').onclick  = close;
  overlay.querySelector('#offer-cancel').onclick = close;
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

  overlay.querySelector('#offer-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form      = new FormData(e.target);
    const submitBtn = overlay.querySelector('#offer-submit');
    const errEl     = overlay.querySelector('#offer-error');
    errEl.textContent = '';

    const payload = isOjt ? {
      status: 'offered',
      notes: form.get('notes'),
    } : {
      status: 'offered',
      offer_details: {
        salary:      form.get('salary'),
        start_date:  form.get('start_date'),
        expiry_date: form.get('expiry_date'),
        benefits:    (form.get('benefits') || '').split('\n').map(b => b.trim()).filter(Boolean),
        message:     form.get('message'),
      },
    };

    submitBtn.disabled = true;
    submitBtn.innerHTML = icon('clock', 14) + (isOjt ? ' Accepting…' : ' Sending…');

    const res = await apiPatch(`/company/applications/${app.id}/status`, payload);

    if (res && res.success) {
      close();
      if (parentBackdrop) parentBackdrop.remove();
      app.status = 'offered';
      app.status_label = isOjt ? 'Accepted (Pending Coordinator)' : 'Offered';
      const cat = container.querySelector('.ap-cat-tab--active')?.dataset.cat || 'all';
      updatePipelineCounts(container, allApps, cat);
      const q = container.querySelector('#applicant-search')?.value || '';
      const st = container.querySelector('.ap-pipe-btn--active')?.dataset.status || 'all';
      applyFilters(container, allApps, cat, st, q);
      showToast(isOjt ? `${app.applicant.name} accepted for OJT!` : `Offer sent to ${app.applicant.name}!`, 'success');
    } else {
      errEl.textContent = res?.message || 'Failed to submit. Please try again.';
      submitBtn.disabled = false;
      submitBtn.innerHTML = icon('award', 14) + (isOjt ? ' Confirm Acceptance' : ' Send Offer');
    }
  });
}

/* ══════════════════════════════════════════════════
   RESUME MODAL  (PDF-document style)
   ══════════════════════════════════════════════════ */
async function showResumeModal(app, allApps, container, newStatus) {
  const isOjt = app.category === 'ojt';

  // Mark candidate profile as inspected in background
  if (isOjt) {
    const slotId = app.job?.id || app.posting_id;
    const interestId = app.raw_id;
    if (slotId && interestId && !app.resume_viewed) {
      apiPost(`/company/ojt-postings/${slotId}/mark-viewed/${interestId}`, {}).then(res => {
        if (res?.success !== false) {
          app.resume_viewed = true;
          refreshApplicantUI(container, allApps);
        }
      });
    }
  } else {
    if (newStatus && app.status !== newStatus) {
      apiPatch(`/company/applications/${app.id}/status`, { status: newStatus }).then(res => {
        if (res && res.success) {
          app.status = newStatus;
          app.status_label = ucfirst(newStatus);
          app.resume_viewed = true;
          refreshApplicantUI(container, allApps);
        }
      });
    } else {
      app.resume_viewed = true;
    }
  }

  // PDF-viewer style backdrop
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop modal-backdrop--visible';
  backdrop.style.cssText = 'background:rgba(20,22,30,.94);backdrop-filter:blur(4px);align-items:flex-start;padding:20px 0;overflow-y:auto;';

  const scoreVal = app.match_score != null ? Math.round(Number(app.match_score)) : 0;
  const rec = getMatchRecommendation(scoreVal);

  backdrop.innerHTML = `
    <div id="pdf-shell" style="width:100%;max-width:860px;margin:0 auto;display:flex;flex-direction:column;border-radius:8px;overflow:hidden;box-shadow:0 30px 90px rgba(0,0,0,.6);">

      <!-- PDF viewer toolbar -->
      <div style="background:#1e293b;padding:10px 18px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-shrink:0;">
        <div style="display:flex;align-items:center;gap:8px;color:#94a3b8;font-size:.8rem;">
          ${icon('fileText', 15)}
          <span style="color:#e2e8f0;font-weight:600;">${app.applicant.name}</span>
          <span style="opacity:.4;">·</span>
          <span>${isOjt ? 'Student_Profile.pdf' : 'Resume.pdf'}</span>
          ${isOjt ? '<span class="ap-badge ap-badge--ojt" style="font-size:0.65rem;padding:1px 6px;">🎓 OJT</span>' : '<span class="ap-badge ap-badge--job" style="font-size:0.65rem;padding:1px 6px;">💼 JOB</span>'}
        </div>
        <div style="display:flex;align-items:center;gap:10px;font-size:.77rem;color:#94a3b8;">
          <span>Applied for <strong style="color:#e2e8f0;">${app.job.title}</strong></span>
          <span style="opacity:.35;">|</span>
          <span class="ap-rec-tag ap-rec-tag--${rec.tier}" style="font-size:0.7rem;padding:2px 8px;" title="${scoreVal}% Skill Match">
            ${rec.icon}
            <span>${rec.label} (${scoreVal}%)</span>
          </span>
          <a href="./student-profile.html?student=${app.applicant.id}&${isOjt ? `slot=${app.job?.id || ''}&interest=${app.raw_id || ''}&category=ojt` : `job=${app.job?.id || ''}&application=${app.id}&category=job`}" target="_blank" rel="noopener noreferrer"
             style="color:#10b981;text-decoration:none;display:inline-flex;align-items:center;gap:4px;background:rgba(16,185,129,.12);padding:3px 10px;border-radius:4px;font-size:.73rem;font-weight:600;border:1px solid rgba(16,185,129,0.3);">
            ${icon('externalLink', 12)} Full Profile
          </a>
          <button id="ar-close" style="background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.15);color:#d1d5db;border-radius:50%;width:26px;height:26px;display:flex;align-items:center;justify-content:center;cursor:pointer;margin-left:4px;">${icon('x', 14)}</button>
        </div>
      </div>

      <!-- Gray PDF reader area + loading paper -->
      <div id="pdf-paper-area" style="background:#475569;overflow-y:auto;max-height:calc(96vh - 100px);padding:28px 40px;display:flex;justify-content:center;">
        <div id="pdf-paper" style="width:100%;max-width:720px;background:#fff;border-radius:2px;box-shadow:0 6px 30px rgba(0,0,0,.45);padding:52px 56px;min-height:400px;display:flex;align-items:center;justify-content:center;">
          <div style="display:flex;flex-direction:column;gap:14px;width:100%;align-items:center;">
            <div style="width:200px;height:16px;background:#e5e7eb;border-radius:3px;"></div>
            <div style="width:140px;height:12px;background:#f3f4f6;border-radius:3px;"></div>
            <div style="width:100%;height:1px;background:#e5e7eb;margin:8px 0;"></div>
            <div style="width:90%;height:10px;background:#f3f4f6;border-radius:2px;"></div>
            <div style="width:85%;height:10px;background:#f3f4f6;border-radius:2px;"></div>
            <div style="width:80%;height:10px;background:#f3f4f6;border-radius:2px;"></div>
          </div>
        </div>
      </div>

      <!-- Footer toolbar -->
      <div id="pdf-footer" style="background:#1e293b;padding:10px 18px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;border-top:1px solid rgba(255,255,255,.08);">
        <button id="ar-close-footer" style="background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.18);color:#d1d5db;border-radius:6px;padding:6px 14px;cursor:pointer;font-size:.79rem;">Close</button>
        <div id="pdf-footer-actions" style="display:flex;gap:8px;"></div>
      </div>
    </div>`;

  document.body.appendChild(backdrop);
  backdrop.addEventListener('click', e => { if (e.target === backdrop) backdrop.remove(); });
  backdrop.querySelector('#ar-close').onclick = () => backdrop.remove();
  backdrop.querySelector('#ar-close-footer').onclick = () => backdrop.remove();

  const res = await apiGet(`/company/applications/${app.id}/resume`);
  if (!res || !res.success) {
    backdrop.querySelector('#pdf-paper').innerHTML = `
      <div style="text-align:center;color:#ef4444;font-family:sans-serif;">
        ${icon('alertCircle', 36)}
        <p style="margin-top:10px;font-size:.9rem;">Could not load resume. Try again.</p>
      </div>`;
    return;
  }

  const d   = res.data;
  const P   = d.profile    || {};
  const EDU = d.education  || [];
  const EXP = d.experience || [];
  const SKL = d.skills     || [];
  const PRJ = d.projects   || [];

  const lvlColor = lvl => lvl >= 80 ? '#005930' : lvl >= 50 ? '#0284c7' : '#64748b';
  const lvlLabel = lvl => lvl >= 80 ? 'Expert'  : lvl >= 50 ? 'Mid'     : 'Junior';

  const css = `
    .rc-name{font-size:1.6rem;font-weight:800;color:#0f172a;margin:0 0 2px;}
    .rc-headline{font-size:.9rem;color:#005930;font-weight:600;margin:0 0 10px;}
    .rc-contact{display:flex;flex-wrap:wrap;gap:6px 16px;font-size:.76rem;color:#64748b;}
    .rc-contact span,.rc-contact a{display:inline-flex;align-items:center;gap:4px;color:#64748b;text-decoration:none;}
    .rc-divider{height:1px;background:#e2e8f0;margin:16px 0;}
    .rc-sec-title{font-size:.7rem;font-weight:800;letter-spacing:.12em;text-transform:uppercase;color:#005930;margin:0 0 12px;}
    .rc-entry{padding:8px 0;}
    .rc-entry+.rc-entry{border-top:1px solid #f1f5f9;}
    .rc-entry-header{display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;gap:4px;}
    .rc-entry-title{font-size:.88rem;font-weight:700;color:#0f172a;margin:0;}
    .rc-entry-date{font-size:.73rem;color:#94a3b8;white-space:nowrap;}
    .rc-entry-sub{font-size:.8rem;color:#64748b;margin:2px 0 0;}
    .rc-entry-desc{font-size:.78rem;color:#374151;margin:5px 0 0;line-height:1.6;}
    .rc-skills{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;}
    .rc-chip{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:4px;background:#f8fafc;border:1px solid #e2e8f0;font-size:.73rem;font-weight:600;color:#334155;}
    .rc-chip-lvl{font-size:.62rem;padding:1px 5px;border-radius:2px;font-weight:700;}
    .rc-match{margin-top:8px;padding:8px 12px;background:#ecfdf5;border-left:3px solid #005930;border-radius:0 4px 4px 0;font-size:.75rem;color:#065f46;}
    .rc-cover{padding:10px 14px;background:#f8fafc;border-left:3px solid #005930;border-radius:0 4px 4px 0;font-size:.8rem;color:#374151;font-style:italic;line-height:1.7;}
    .rc-proj{padding:10px 14px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:4px;margin-bottom:8px;}
    .rc-proj-title{font-size:.86rem;font-weight:700;color:#0f172a;margin:0 0 4px;}
    .rc-proj-desc{font-size:.78rem;color:#475569;margin:0 0 7px;line-height:1.55;}
  `;

  const matchNotice = (app.matched_skills?.length && app.job.required_skills?.length)
    ? `<div class="rc-match"><strong>Position match:</strong> Matched ${app.matched_skills.length} of ${app.job.required_skills.length} required skills — ${app.matched_skills.join(', ')}</div>`
    : '';

  const objText = P.bio || P.resume_objective || '';
  const objLabel = P.resume_type === 'summary' ? 'Professional Summary' : 'Objective';

  let footerActions = '';
  if (isOjt) {
    const rawSt = app.raw_status || 'interested';
    if (rawSt === 'interested') {
      footerActions = `
        <button class="btn btn--error ar-ojt-action" data-ojt-action="reject" style="font-size:.79rem;">${icon('x', 13)} Decline</button>
        <button class="btn btn--primary ar-ojt-action" data-ojt-action="review" style="font-size:.79rem;background:#005930;border-color:#005930;">${icon('fileText', 13)} Submit Review Note</button>`;
    } else if (rawSt === 'company_reviewed') {
      footerActions = `
        <button class="btn btn--error ar-ojt-action" data-ojt-action="reject" style="font-size:.79rem;">${icon('x', 13)} Decline</button>
        <button class="btn btn--primary ar-ojt-action" data-ojt-action="endorse" style="font-size:.79rem;background:#D97706;border-color:#D97706;">${icon('fileText', 13)} Request Endorsement Letter</button>`;
    } else if (rawSt === 'endorsement_requested') {
      footerActions = `
        <button class="btn btn--error ar-ojt-action" data-ojt-action="reject" style="font-size:.79rem;">${icon('x', 13)} Decline</button>
        <button class="btn btn--primary" disabled style="font-size:.79rem;opacity:0.6;cursor:not-allowed;background:#8B5CF6;border-color:#8B5CF6;">${icon('clock', 13)} Awaiting Endorsement Letter</button>`;
    } else if (rawSt === 'endorsed') {
      footerActions = `
        <button class="btn btn--error ar-ojt-action" data-ojt-action="reject" style="font-size:.79rem;">${icon('x', 13)} Decline</button>
        <button class="btn btn--primary ar-ojt-action" data-ojt-action="schedule" style="font-size:.79rem;background:#005930;border-color:#005930;">${icon('calendar', 13)} Schedule Interview</button>`;
    } else if (rawSt === 'interview_scheduled') {
      const interviewPassed = isInterviewPast(app);
      footerActions = `
        <button class="btn btn--error ar-ojt-action" data-ojt-action="reject" style="font-size:.79rem;">${icon('x', 13)} Decline</button>
        ${interviewPassed
          ? `<button class="btn btn--primary ar-ojt-action" data-ojt-action="accept" style="font-size:.79rem;background:#005930;border-color:#005930;">${icon('checkCircle', 13)} Accept After Interview</button>`
          : `<button class="btn btn--primary" disabled style="font-size:.79rem;opacity:0.55;cursor:not-allowed;background:#005930;border-color:#005930;">${icon('clock', 13)} Interview Scheduled</button>`
        }`;
    } else if (rawSt === 'company_accepted') {
      footerActions = `
        <button class="btn btn--primary" disabled style="font-size:.79rem;opacity:0.6;cursor:not-allowed;background:#005930;border-color:#005930;">${icon('clock', 13)} Awaiting Coordinator Approval</button>`;
    } else if (rawSt === 'accepted') {
      footerActions = `
        <button class="btn btn--primary ar-ojt-action" data-ojt-action="start" style="font-size:.79rem;background:#005930;border-color:#005930;">${icon('calendar', 13)} Set Start Date & Instructions</button>`;
    } else if (rawSt === 'ojt_confirmed') {
      footerActions = `
        <button class="btn btn--primary" disabled style="font-size:.79rem;opacity:0.75;cursor:default;background:#8B5CF6;border-color:#8B5CF6;">${icon('calendar', 13)} Confirmed · Start: ${app.ojt_start_date || 'Set'}</button>`;
    } else if (rawSt === 'ojt_started') {
      footerActions = `
        <button class="btn btn--primary" disabled style="font-size:.79rem;opacity:0.75;cursor:default;background:#005930;border-color:#005930;">${icon('graduationCap', 13)} Active Trainee</button>`;
    } else if (rawSt === 'rejected') {
      footerActions = `
        <button class="btn btn--error" disabled style="font-size:.79rem;opacity:0.6;cursor:default;">${icon('x', 13)} Application Closed</button>`;
    }
  } else {
    // Regular Job
    const st = app.status;
    if (st === 'applied' || st === 'reviewed') {
      footerActions = `
        <button class="btn btn--error ar-modal-action" data-action="rejected" data-id="${app.id}" style="font-size:.79rem;">${icon('x', 13)} Reject</button>
        <button class="btn btn--primary ar-modal-action" data-action="interview" data-id="${app.id}" style="font-size:.79rem;background:#005930;border-color:#005930;">${icon('video', 13)} Schedule Interview</button>`;
    } else if (st === 'interview') {
      const canOffer = isInterviewPast(app);
      const offerBtn = canOffer
        ? `<button class="btn btn--success ar-offer-btn" data-id="${app.id}" style="font-size:.79rem;background:#005930;border-color:#005930;">${icon('award', 13)} Send Offer</button>`
        : `<button class="btn btn--success" disabled title="Interview on ${app.interview_date || 'scheduled date'} must be completed first" style="font-size:.79rem;opacity:.45;cursor:not-allowed;">${icon('award', 13)} Send Offer</button>`;
      footerActions = `
        <button class="btn btn--error ar-modal-action" data-action="rejected" data-id="${app.id}" style="font-size:.79rem;">${icon('x', 13)} Reject</button>
        ${offerBtn}`;
    }
  }
  backdrop.querySelector('#pdf-footer-actions').innerHTML = footerActions;

  backdrop.querySelector('#pdf-paper').innerHTML = `
    <style>${css}</style>
    <div style="font-family:'Segoe UI',system-ui,sans-serif;line-height:1.5;">

      <!-- Header -->
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:20px;padding-bottom:16px;border-bottom:2px solid #0f172a;margin-bottom:0;">
        <div style="flex:1;">
          <h1 class="rc-name">${P.name || app.applicant.name}</h1>
          ${(P.headline || app.applicant.headline) ? `<p class="rc-headline">${P.headline || app.applicant.headline}</p>` : ''}
          <div class="rc-contact">
            ${P.phone || app.applicant.phone ? `<span>${icon('phone', 12)} ${P.phone || app.applicant.phone}</span>` : ''}
            ${P.email || app.applicant.email ? `<span>${icon('mail', 12)} ${P.email || app.applicant.email}</span>` : ''}
            ${P.location || app.applicant.location ? `<span>${icon('mapPin', 12)} ${P.location || app.applicant.location}</span>` : ''}
            ${P.linkedin_url ? `<a href="https://${P.linkedin_url}" target="_blank" rel="noopener">${icon('linkedin', 12)} ${P.linkedin_url}</a>` : ''}
            ${P.portfolio_url ? `<a href="https://${P.portfolio_url}" target="_blank" rel="noopener">${icon('externalLink', 12)} ${P.portfolio_url}</a>` : ''}
            ${(P.requirements_drive_url || app.applicant?.requirements_drive_url) ? `<a href="${P.requirements_drive_url || app.applicant?.requirements_drive_url}" target="_blank" rel="noopener" style="color:#0284c7;font-weight:700;">${icon('folder', 12)} Requirements Drive</a>` : ''}
          </div>
        </div>
        ${P.avatar_url
          ? `<img src="${P.avatar_url}" style="width:68px;height:68px;border-radius:50%;object-fit:cover;border:3px solid #e2e8f0;flex-shrink:0;">`
          : `<div style="width:68px;height:68px;border-radius:50%;background:${isOjt ? 'linear-gradient(135deg,#005930,#047857)' : 'linear-gradient(135deg,#1e293b,#334155)'};display:flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:800;color:#fff;flex-shrink:0;">${app.applicant.initials || 'CA'}</div>`}
      </div>

      ${app.endorsement_letter_url ? `
        <div style="margin:14px 0 4px;padding:12px 16px;background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.3);border-radius:8px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;">
          <div style="display:flex;align-items:center;gap:10px;">
            <div style="width:32px;height:32px;border-radius:8px;background:#005930;color:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
              ${icon('fileText', 16)}
            </div>
            <div>
              <span style="font-size:0.82rem;color:#065f46;font-weight:700;">Official Endorsement Letter Issued</span>
              <p style="margin:1px 0 0;font-size:0.73rem;color:#047857;">Uploaded by school OJT coordinator for this candidate.</p>
            </div>
          </div>
          <button type="button" class="btn btn--outline btn-modal-view-endorsement" data-url="${resolveStorageUrl(app.endorsement_letter_url)}" data-name="${escapeHtml(app.applicant?.name || 'Student')}" style="font-size:0.75rem;padding:5px 12px;color:#005930;border-color:#005930;background:#fff;display:inline-flex;align-items:center;gap:5px;cursor:pointer;">
            ${icon('externalLink', 12)} View Letter PDF
          </button>
        </div>` : ''}

      ${objText ? `
        <div class="rc-divider"></div>
        <div>
          <h4 class="rc-sec-title">${objLabel}</h4>
          <p style="font-size:.83rem;color:#374151;line-height:1.7;margin:0;">${objText}</p>
        </div>` : ''}

      ${app.cover_letter ? `
        <div class="rc-divider"></div>
        <div>
          <h4 class="rc-sec-title">${isOjt ? 'Student Statement / Letter of Intent' : 'Cover Letter'}</h4>
          <div class="rc-cover">"${app.cover_letter}"</div>
        </div>` : ''}

      ${EDU.length ? `
        <div class="rc-divider"></div>
        <div>
          <h4 class="rc-sec-title">Education</h4>
          ${EDU.map(e => {
            const years = `${e.year_start || ''}${e.year_end ? ' – ' + e.year_end : e.year_start ? ' – Present' : ''}`;
            return `<div class="rc-entry">
              <div class="rc-entry-header">
                <strong class="rc-entry-title">${e.school}</strong>
                ${years ? `<span class="rc-entry-date">${years}</span>` : ''}
              </div>
              <p class="rc-entry-sub">${e.degree}${e.gpa ? ' · GPA: ' + e.gpa : ''}</p>
              ${e.description ? `<p class="rc-entry-desc">${e.description}</p>` : ''}
            </div>`;
          }).join('')}
        </div>` : ''}

      ${EXP.length ? `
        <div class="rc-divider"></div>
        <div>
          <h4 class="rc-sec-title">Experience</h4>
          ${EXP.map(e => {
            const expSkills = parseJsonArray(e.skills);
            const period = `${e.period_start || ''}${e.period_end ? ' – ' + e.period_end : e.period_start ? ' – Present' : ''}`;
            return `<div class="rc-entry">
              <div class="rc-entry-header">
                <strong class="rc-entry-title">${e.role}</strong>
                ${period ? `<span class="rc-entry-date">${period}</span>` : ''}
              </div>
              <p class="rc-entry-sub">${e.company} · ${e.type || ''}</p>
              ${e.description ? `<p class="rc-entry-desc">${e.description}</p>` : ''}
              ${expSkills.length ? `<div class="rc-skills">${expSkills.map(s => `<span class="rc-chip">${s}</span>`).join('')}</div>` : ''}
            </div>`;
          }).join('')}
        </div>` : ''}

      ${SKL.length ? `
        <div class="rc-divider"></div>
        <div>
          <h4 class="rc-sec-title">Skills</h4>
          <div class="rc-skills">
            ${SKL.map(s => `
              <span class="rc-chip">
                ${s.name}
                <span class="rc-chip-lvl" style="background:${lvlColor(s.level||0)}18;color:${lvlColor(s.level||0)};">${lvlLabel(s.level||0)}</span>
              </span>`).join('')}
          </div>
          ${matchNotice}
        </div>` : (matchNotice ? `<div class="rc-divider"></div>${matchNotice}` : '')}

      ${PRJ.length ? `
        <div class="rc-divider"></div>
        <div>
          <h4 class="rc-sec-title">Projects</h4>
          ${PRJ.slice(0, 4).map(p => {
            const tech = parseJsonArray(p.tech_stack);
            return `<div class="rc-proj">
              <p class="rc-proj-title">${p.title}</p>
              ${p.description ? `<p class="rc-proj-desc">${p.description}</p>` : ''}
              ${tech.length ? `<div class="rc-skills">${tech.map(t => `<span class="rc-chip">${t}</span>`).join('')}</div>` : ''}
            </div>`;
          }).join('')}
        </div>` : ''}

    </div>`;

  backdrop.querySelectorAll('.ar-modal-action').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (btn.dataset.action === 'interview') {
        openScheduleModal(app, allApps, container, backdrop);
      } else {
        backdrop.remove();
        await doStatusUpdate(btn.dataset.id, btn.dataset.action, allApps, container);
      }
    });
  });

  backdrop.querySelectorAll('.ar-offer-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      openOfferModal(app, allApps, container, backdrop);
    });
  });

  backdrop.querySelectorAll('.ar-ojt-action').forEach(btn => {
    btn.addEventListener('click', () => {
      const act = btn.dataset.ojtAction;
      backdrop.remove();
      if (act === 'review') showOjtReviewModal(app, allApps, container, null);
      else if (act === 'endorse') showOjtRequestEndorsementModal(app, allApps, container, null);
      else if (act === 'schedule') showOjtScheduleInterviewModal(app, allApps, container, null);
      else if (act === 'accept') showOjtAcceptAfterInterviewModal(app, allApps, container, null);
      else if (act === 'start') showOjtSetStartModal(app, allApps, container, null);
      else if (act === 'reject') showOjtRejectModal(app, allApps, container, null);
    });
  });

  backdrop.querySelectorAll('.btn-modal-view-endorsement').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const url = btn.dataset.url;
      const name = btn.dataset.name;
      if (url) openEndorsementLetterModal(url, name);
    });
  });
}

/* ══════════════════════════════════════════════════
   UTILITIES
   ══════════════════════════════════════════════════ */
function skeletonCards(count) {
  return Array.from({ length: count }, () => `
    <div class="ap-card">
      <div style="display:flex;justify-content:space-between;margin-bottom:12px;">
        <div class="skeleton" style="width:80px;height:20px;border-radius:4px;"></div>
        <div class="skeleton" style="width:70px;height:20px;border-radius:99px;"></div>
      </div>
      <div class="ap-card__profile">
        <div class="skeleton" style="width:44px;height:44px;border-radius:50%;flex-shrink:0;"></div>
        <div style="flex:1;display:flex;flex-direction:column;gap:6px;">
          <div class="skeleton skeleton--text" style="width:60%;"></div>
          <div class="skeleton skeleton--text-sm" style="width:45%;"></div>
        </div>
      </div>
      <div class="skeleton skeleton--text-sm" style="width:100%;height:6px;border-radius:99px;margin:8px 0;"></div>
      <div class="skeleton skeleton--text-sm" style="width:80%;margin-top:6px;"></div>
      <div class="skeleton" style="width:100%;height:34px;border-radius:6px;margin-top:14px;"></div>
    </div>`).join('');
}

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast--${type} toast--visible`;
  toast.innerHTML = `${icon(type === 'success' ? 'checkCircle' : 'alertCircle', 16)} <span>${message}</span>`;
  document.body.appendChild(toast);
  setTimeout(() => { toast.classList.remove('toast--visible'); setTimeout(() => toast.remove(), 300); }, 3000);
}
