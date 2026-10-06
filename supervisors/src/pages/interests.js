/* ===========================
   OJT Management — Supervisor Portal
   Clean, Neat, Executive Redesign
   =========================== */

import { icon } from '../components/icons.js';
import { apiFetch, apiGet, apiGetFresh, apiPost, apiUpload, apiCache } from '../api/client.js';
import { getState } from '../store.js';
import { openAssignRequirementsModal, openReviewRequirementsModal } from '../components/requirements-modal.js';

// ── localStorage bridge (shared key with student portal) ────────────────────
const LS_KEY = 'hireme_ojt_interests';

function getLocalInterests() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch { return []; }
}
function saveLocalInterests(list) {
  localStorage.setItem(LS_KEY, JSON.stringify(list));
}

// ── Entry ───────────────────────────────────────────────────────────────────
export default function interestsPage(container) {
  container.innerHTML = `
    <div class="ojts-page fade-in">
      <!-- ── Header ── -->
      <div class="ojts-header">
        <div class="ojts-header__left">
          <div class="ojts-header__icon">${icon('send', 22)}</div>
          <div>
            <div class="ojts-header__title-row">
              <h1 class="ojts-header__title">OJT Management &amp; Endorsements</h1>
              <span class="ojts-live-badge"><span class="ojts-live-dot"></span>Supervisor Portal</span>
            </div>
            <p class="ojts-header__sub">Review partner listings, endorse student applications, upload official endorsement letters, and monitor host company placements.</p>
          </div>
        </div>
        <div class="ojts-header__actions">
          <button class="ojts-btn-refresh" id="ojts-refresh-btn" title="Refresh postings">
            ${icon('refreshCw', 14)} <span>Refresh</span>
          </button>
        </div>
      </div>

      <!-- ── KPI Stats Strip ── -->
      <div class="ojts-stats-grid">
        <div class="ojts-stat-card">
          <div class="ojts-stat-card__top">
            <span class="ojts-stat-card__label">Active Listings</span>
            <div class="ojts-stat-card__icon" style="background:#00593014;color:#005930">${icon('briefcase', 16)}</div>
          </div>
          <div class="ojts-stat-card__val" id="st-listings">—</div>
          <div class="ojts-stat-card__footer">
            <span class="ojts-stat-card__trend ojts-trend--good">Open opportunities</span>
          </div>
        </div>

        <div class="ojts-stat-card">
          <div class="ojts-stat-card__top">
            <span class="ojts-stat-card__label">Student Inquiries</span>
            <div class="ojts-stat-card__icon" style="background:#0284C714;color:#0284C7">${icon('users', 16)}</div>
          </div>
          <div class="ojts-stat-card__val" id="st-total">—</div>
          <div class="ojts-stat-card__footer">
            <span class="ojts-stat-card__trend ojts-trend--neutral">Total applications</span>
          </div>
        </div>

        <div class="ojts-stat-card">
          <div class="ojts-stat-card__top">
            <span class="ojts-stat-card__label">Action Required</span>
            <div class="ojts-stat-card__icon" style="background:#D9770614;color:#D97706">${icon('alertCircle', 16)}</div>
          </div>
          <div class="ojts-stat-card__val" id="st-pending">—</div>
          <div class="ojts-stat-card__footer">
            <span class="ojts-stat-card__trend ojts-trend--warn">Letters &amp; Approvals</span>
          </div>
        </div>

        <div class="ojts-stat-card">
          <div class="ojts-stat-card__top">
            <span class="ojts-stat-card__label">Endorsements Sent</span>
            <div class="ojts-stat-card__icon" style="background:#05966914;color:#059669">${icon('checkCircle', 16)}</div>
          </div>
          <div class="ojts-stat-card__val" id="st-recommended">—</div>
          <div class="ojts-stat-card__footer">
            <span class="ojts-stat-card__trend ojts-trend--good">Approved &amp; active</span>
          </div>
        </div>
      </div>

      <!-- ── Search & Filter Controls ── -->
      <div class="ojts-filter-bar">
        <div class="ojts-search-box">
          <span class="ojts-search-icon">${icon('search', 15)}</span>
          <input type="text" id="ojts-search-input" class="ojts-search-input" placeholder="Search by job position, host company, or course program..." />
        </div>
        <div class="ojts-filter-tabs" id="ojts-filter-tabs">
          <button class="ojts-filter-btn ojts-filter-btn--active" data-filter="all">All Listings</button>
          <button class="ojts-filter-btn" data-filter="pending" id="ojts-filter-pending-btn">Action Required</button>
          <button class="ojts-filter-btn" data-filter="open">Open</button>
          <button class="ojts-filter-btn" data-filter="filling_up">Filling Up</button>
        </div>
      </div>

      <!-- ── Postings Body ── -->
      <div id="int-body">
        ${skeletonGrid(4)}
      </div>
    </div>
  `;

  loadPage(container);

  container.querySelector('#ojts-refresh-btn')?.addEventListener('click', () => {
    interestsPage(container);
  });
}

// ── Load data ────────────────────────────────────────────────────────────────
async function loadPage(container) {
  const body = container.querySelector('#int-body');

  // Load OJT slots: real API → mock fallback
  let slots = [];
  try {
    const res = await apiGet('/ojt/postings');
    slots = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
  } catch {}

  if (!slots.length) {
    try {
      const mock = await apiFetch('ojt_slots');
      slots = mock?.data || [];
    } catch {}
  }

  // Load interests: real API → mock seed → localStorage merge
  let interests = [];
  try {
    const res = await apiGet('/supervisor/interests');
    if (res?.success && Array.isArray(res.data) && res.data.length) interests = res.data;
  } catch {}

  if (!interests.length) {
    try {
      const mock = await apiFetch('supervisor_interests');
      interests = mock?.data || [];
    } catch {}
  }

  // Normalize API interests to the same shape as localStorage entries
  interests = interests.map(i => ({
    ...i,
    slotId:        i.slotId        ?? i.posting?.id ?? i.ojt_posting_id,
    studentName:   i.studentName   ?? i.student?.name,
    studentEmail:  i.studentEmail  ?? i.student?.email,
    studentCourse: i.studentCourse ?? i.student?.program,
  }));

  // Merge any interests saved from the student portal's localStorage (scoped to coordinator's course)
  const user = getState('user');
  const userCourse = user?.course;
  const local = getLocalInterests();
  local.forEach(li => {
    if (!interests.find(i => i.id === li.id)) {
      if (!userCourse || !li.studentCourse || li.studentCourse === userCourse) {
        interests.push(li);
      }
    }
  });

  if (!container || !document.contains(container)) return;
  updateStats(container, slots, interests);
  setupFiltersAndRender(container, slots, interests);
}

// ── Stats ────────────────────────────────────────────────────────────────────
function updateStats(container, slots, interests) {
  if (!container) return;
  const stListings = container.querySelector('#st-listings');
  const stTotal    = container.querySelector('#st-total');
  const stPending  = container.querySelector('#st-pending');
  const stRecd     = container.querySelector('#st-recommended');

  const pendingInterests = interests.filter(i => i.status === 'endorsement_requested' || i.status === 'company_accepted');

  if (stListings) stListings.textContent = slots.filter(s => s.status !== 'closed').length;
  if (stTotal)    stTotal.textContent    = interests.length;
  if (stPending)  stPending.textContent  = pendingInterests.length;
  if (stRecd)     stRecd.textContent     = interests.filter(i => i.status === 'endorsed' || i.status === 'ojt_started' || i.status === 'accepted' || i.status === 'ojt_confirmed').length;

  const pendingFilterBtn = container.querySelector('#ojts-filter-pending-btn');
  if (pendingFilterBtn) {
    const lettersCount = interests.filter(i => i.status === 'endorsement_requested').length;
    const approvalsCount = interests.filter(i => i.status === 'company_accepted').length;
    const totalActions = lettersCount + approvalsCount;
    const isApprovalOnly = lettersCount === 0 && approvalsCount > 0;
    pendingFilterBtn.innerHTML = `
      ${icon('clock', 13)} Action Required
      ${totalActions > 0 ? `<span class="ojts-card__urgent-badge${isApprovalOnly ? ' ojts-card__urgent-badge--approve' : ''}" style="padding:1px 7px;font-size:0.68rem;margin-left:4px;"><span class="ojts-pulse-dot${isApprovalOnly ? ' ojts-pulse-dot--green' : ''}" style="width:5px;height:5px;"></span> ${totalActions}</span>` : ''}
    `;
  }
}

// ── Search and Filter Handling ───────────────────────────────────────────────
function setupFiltersAndRender(container, slots, interests) {
  const body = (container && container.querySelector('#int-body')) || document.getElementById('int-body');
  if (!body) return;
  const searchInput = (container && container.querySelector('#ojts-search-input')) || document.getElementById('ojts-search-input');
  const filterTabs = container ? container.querySelectorAll('.ojts-filter-btn') : document.querySelectorAll('.ojts-filter-btn');

  let currentFilter = 'all';
  let searchQuery = '';

  function applyFilter() {
    const currentBody = (container && container.querySelector('#int-body')) || document.getElementById('int-body');
    if (!currentBody) return;
    let filtered = [...slots];

    // Status / Pending filter (Letters required or OJT final approval required)
    if (currentFilter === 'pending') {
      filtered = filtered.filter(s => {
        const si = interests.filter(i => String(i.slotId ?? i.posting?.id ?? i.ojt_posting_id) === String(s.id));
        return si.some(i => i.status === 'endorsement_requested' || i.status === 'company_accepted');
      });
    } else if (currentFilter === 'open') {
      filtered = filtered.filter(s => s.status === 'open' || !s.status);
    } else if (currentFilter === 'filling_up') {
      filtered = filtered.filter(s => s.status === 'filling_up');
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(s => {
        const title   = (s.slotTitle || s.title || '').toLowerCase();
        const company = (s.company || s.company_name || '').toLowerCase();
        const dept    = (s.department || '').toLowerCase();
        const courses = Array.isArray(s.preferred_courses)
          ? s.preferred_courses.join(' ').toLowerCase()
          : (s.preferred_courses || s.preferredCourse || '').toLowerCase();
        return title.includes(q) || company.includes(q) || dept.includes(q) || courses.includes(q);
      });
    }

    renderGrid(currentBody, filtered, interests, container);
  }

  if (searchInput) {
    searchInput.addEventListener('input', e => {
      searchQuery = e.target.value;
      applyFilter();
    });
  }

  filterTabs.forEach(btn => {
    btn.addEventListener('click', () => {
      filterTabs.forEach(b => b.classList.remove('ojts-filter-btn--active'));
      btn.classList.add('ojts-filter-btn--active');
      currentFilter = btn.dataset.filter;
      applyFilter();
    });
  });

  applyFilter();
}

// ── Slot Grid ────────────────────────────────────────────────────────────────
function renderGrid(body, slots, interests, container) {
  if (!body) return;
  if (!slots.length) {
    body.innerHTML = `
      <div class="ojts-empty">
        <div class="ojts-empty__icon">${icon('briefcase', 32)}</div>
        <h3 class="ojts-empty__title">No OJT Listings Found</h3>
        <p class="ojts-empty__text">No partner listings matched your current search or filter criteria.</p>
      </div>`;
    return;
  }

  const STATUS_CFG = {
    open:       { label: 'Open',       color: '#059669', bg: '#05966914' },
    filling_up: { label: 'Filling Up', color: '#D97706', bg: '#D9770614' },
    closed:     { label: 'Closed',     color: '#64748B', bg: '#64748B14' },
  };

  body.innerHTML = `<div class="ojts-grid">
    ${slots.map(slot => {
      const sc         = STATUS_CFG[slot.status] || STATUS_CFG.open;
      const initial    = slot.companyInitial || slot.company_name?.[0] || slot.company?.[0] || '?';
      const title      = slot.slotTitle  || slot.title       || 'OJT Position';
      const company    = slot.company    || slot.company_name || 'Partner Company';
      const dept       = slot.department || 'General';
      const dur        = slot.duration   || '3 months';
      const loc        = (slot.location  || '—').split(',')[0];
      const desc       = slot.description || slot.tasks || '';
      const rawCourse  = Array.isArray(slot.preferred_courses) ? slot.preferred_courses[0] : (slot.preferred_courses || slot.preferredCourse || '');
      const sched      = slot.schedule_type === 'half_day' ? 'Half Day' : slot.schedule_type === 'full_day' ? 'Full Day' : (slot.schedule || '');

      const si            = interests.filter(i => String(i.slotId ?? i.posting?.id ?? i.ojt_posting_id) === String(slot.id));
      const pending       = si.filter(i => i.status === 'endorsement_requested').length;
      const pendingAccept = si.filter(i => i.status === 'company_accepted').length;
      const recd          = si.filter(i => i.status === 'recommended' || i.status === 'endorsed').length;
      const accepted      = si.filter(i => i.status === 'accepted' || i.status === 'ojt_confirmed' || i.status === 'ojt_started').length;
      const activeOrPlaced = si.filter(i => ['company_accepted', 'accepted', 'ojt_confirmed', 'ojt_started'].includes(i.status)).length;
      const slotsTotal    = Number(slot.slots_total || slot.slots || 0);

      // Remaining slots: use backend value, defensively clamped to actual active/placed trainees
      let slotsLeft = slot.slots_remaining !== undefined && slot.slots_remaining !== null
        ? Number(slot.slots_remaining)
        : (slotsTotal ? Math.max(0, slotsTotal - activeOrPlaced) : null);
      if (slotsTotal > 0 && activeOrPlaced > 0 && (slotsLeft === null || slotsLeft >= slotsTotal)) {
        slotsLeft = Math.max(0, slotsTotal - activeOrPlaced);
      }
      if (slotsTotal > 0 && slotsLeft !== null && (slotsTotal - slotsLeft) < activeOrPlaced) {
        slotsLeft = Math.max(0, slotsTotal - activeOrPlaced);
      }

      const slotsUsed     = slotsTotal ? Math.max(activeOrPlaced, (slotsLeft !== null ? slotsTotal - slotsLeft : 0)) : 0;
      const slotsPct      = slotsTotal ? Math.min(100, Math.round((slotsUsed / slotsTotal) * 100)) : 0;
      const hasUrgentEndorsement = pending > 0;
      const hasUrgentApproval    = pendingAccept > 0;
      const hasUrgentAction      = hasUrgentEndorsement || hasUrgentApproval;

      const cardClass = hasUrgentEndorsement
        ? ' ojts-card--action-required'
        : (hasUrgentApproval ? ' ojts-card--approval-required' : '');

      let avatarStyle = '';
      if (hasUrgentEndorsement) {
        avatarStyle = ' style="background:#D9770618;color:#D97706;border:1px solid #D9770635;"';
      } else if (hasUrgentApproval) {
        avatarStyle = ' style="background:#05966914;color:#059669;border:1px solid #05966935;"';
      }

      let btnStyle = '';
      let btnText = 'Manage';
      if (hasUrgentEndorsement && hasUrgentApproval) {
        btnStyle = ' style="background:#D97706;color:#fff;padding:5px 12px;border-radius:6px;font-weight:700;"';
        btnText = 'Review Actions';
      } else if (hasUrgentEndorsement) {
        btnStyle = ' style="background:#D97706;color:#fff;padding:5px 12px;border-radius:6px;font-weight:700;"';
        btnText = 'Upload Letter';
      } else if (hasUrgentApproval) {
        btnStyle = ' style="background:#005930;color:#fff;padding:5px 12px;border-radius:6px;font-weight:700;"';
        btnText = 'Approve OJT';
      }

      return `
        <div class="ojts-card int-slot-card${cardClass}" data-slot-id="${slot.id}">
          <!-- Top Row -->
          <div class="ojts-card__top">
            <div class="ojts-card__avatar"${avatarStyle}><span>${initial}</span></div>
            <div class="ojts-card__title-group">
              <div class="ojts-card__title-row">
                <h3 class="ojts-card__title" title="${title}">${title}</h3>
                <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
                  ${hasUrgentEndorsement ? `
                    <span class="ojts-card__urgent-badge" title="${pending} endorsement letter${pending > 1 ? 's' : ''} requested by host company">
                      <span class="ojts-pulse-dot"></span>
                      ${pending === 1 ? 'Endorsement Needed' : `${pending} Endorsements Needed`}
                    </span>
                  ` : ''}
                  ${hasUrgentApproval ? `
                    <span class="ojts-card__urgent-badge ojts-card__urgent-badge--approve" title="${pendingAccept} student${pendingAccept > 1 ? 's' : ''} accepted by host company awaiting coordinator OJT approval">
                      <span class="ojts-pulse-dot ojts-pulse-dot--green"></span>
                      ${pendingAccept === 1 ? 'Approval Needed' : `${pendingAccept} Approvals Needed`}
                    </span>
                  ` : ''}
                  <span class="ojts-card__status" style="background:${sc.bg};color:${sc.color};border:1px solid ${sc.color}25">${sc.label}</span>
                </div>
              </div>
              <p class="ojts-card__company">${icon('building', 12)} ${company} · ${loc}</p>
            </div>
          </div>

          ${hasUrgentEndorsement ? `
          <div class="ojts-card__alert-banner" data-action="upload">
            <span style="display:flex;align-items:center;gap:6px;">
              ${icon('mail', 13)}
              <strong>${pending} ${pending === 1 ? 'student requires' : 'students require'} an endorsement letter</strong>
            </span>
            <span style="color:#D97706;font-size:0.7rem;font-weight:700;">UPLOAD &rarr;</span>
          </div>
          ` : ''}

          ${hasUrgentApproval ? `
          <div class="ojts-card__alert-banner ojts-card__alert-banner--approve" data-action="approve">
            <span style="display:flex;align-items:center;gap:6px;">
              ${icon('checkCircle', 13)}
              <strong>${pendingAccept} ${pendingAccept === 1 ? 'student awaits' : 'students await'} final OJT approval</strong>
            </span>
            <span style="color:#059669;font-size:0.7rem;font-weight:700;">APPROVE &rarr;</span>
          </div>
          ` : ''}

          <!-- Tags Strip -->
          <div class="ojts-card__tags">
            ${rawCourse ? `<span class="ojts-card__tag ojts-card__tag--primary">${icon('bookOpen', 11)} ${rawCourse}</span>` : ''}
            ${sched ? `<span class="ojts-card__tag">${icon('zap', 11)} ${sched}</span>` : ''}
            <span class="ojts-card__tag">${icon('clock', 11)} ${dur}</span>
          </div>

          ${desc ? `<p class="ojts-card__desc">${desc.length > 95 ? desc.slice(0, 95) + '…' : desc}</p>` : ''}

          <!-- Slots Progress -->
          ${slotsTotal ? `
          <div class="ojts-card__progress-box">
            <div class="ojts-card__progress-head">
              <span class="ojts-card__progress-label">Deployment Capacity</span>
              <span class="ojts-card__progress-val">${slotsLeft !== null ? slotsLeft : slotsTotal} of ${slotsTotal} slots left</span>
            </div>
            <div class="ojts-card__progress-track">
              <div class="ojts-card__progress-fill" style="width:${slotsPct}%"></div>
            </div>
          </div>` : ''}

          <!-- Footer -->
          <div class="ojts-card__footer">
            <div class="ojts-card__applicants-summary">
              ${si.length === 0
                ? `<span class="ojts-card__app-none">${icon('inbox', 12)} No applicants yet</span>`
                : `<span class="ojts-card__app-pill">${icon('users', 12)} ${si.length} applied</span>`
              }
              ${pending > 0 ? `<span class="ojts-card__pill-warn" style="font-weight:700;background:#FEF3C7;color:#B45309;border:1px solid #F59E0B;"><span class="ojts-pulse-dot" style="width:5px;height:5px;"></span> ${pending} letter required</span>` : ''}
              ${pendingAccept > 0 ? `<span class="ojts-card__pill-good ojts-card__pill-good--urgent"><span class="ojts-pulse-dot ojts-pulse-dot--green" style="width:5px;height:5px;"></span> ${pendingAccept} approval required</span>` : ''}
              ${recd > 0 ? `<span class="ojts-card__pill-good">${icon('checkCircle', 11)} ${recd} endorsed</span>` : ''}
            </div>
            <button class="ojts-card__btn"${btnStyle}>
              <span>${btnText}</span> ${icon('arrowRight', 12)}
            </button>
          </div>
        </div>
      `;
    }).join('')}
  </div>`;

  body.querySelectorAll('.int-slot-card').forEach(card => {
    card.addEventListener('click', (e) => {
      const slotId = parseInt(card.dataset.slotId);
      const slot   = slots.find(s => s.id === slotId);
      if (!slot) return;

      const isActionClick = !!(e.target.closest('.ojts-card__alert-banner') ||
                               e.target.closest('.ojts-card__btn') ||
                               e.target.closest('.ojts-card__pill-warn') ||
                               e.target.closest('.ojts-card__pill-good--urgent') ||
                               e.target.closest('.ojts-card__pill-good'));
      const si = interests.filter(i => String(i.slotId ?? i.posting?.id ?? i.ojt_posting_id) === String(slot.id));
      const hasActionRequired = si.some(i => i.status === 'endorsement_requested' || i.status === 'company_accepted');
      const initialTab = (isActionClick && hasActionRequired) ? 'applications' : 'details';

      showInterestedModal(slot, interests, updated => {
        interests = updated;
        updateStats(container, slots, interests);
        setupFiltersAndRender(container, slots, interests);
      }, { initialTab });
    });
  });
}

// ── Normalize Interest to Candidate Card Shape ──────────────────────────────
function interestToStudentCard(i) {
  const st = i.student || {};
  return {
    id: i.id,
    status: i.status,
    student_message: i.student_message || i.message || '',
    created_at: i.created_at || (i.createdAt ? new Date(i.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''),
    endorsed_at: i.endorsed_at || (i.recommendedAt ? new Date(i.recommendedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''),
    endorsed_by_me: i.endorsed_by_me ?? false,
    company_note: i.company_note || '',
    coordinator_note: i.coordinator_note || '',
    interview_scheduled_at: i.interview_scheduled_at || '',
    interview_type: i.interview_type || '',
    interview_location: i.interview_location || '',
    endorsement_letter_url: i.endorsement_letter_url || i.endorsement_letter || null,
    ojt_start_date: i.ojt_start_date || '',
    ojt_instructions: i.ojt_instructions || '',
    student: {
      id: st.id ?? i.student_user_id ?? i.studentId,
      name: st.name || i.studentName || 'Student',
      email: st.email || i.studentEmail || '',
      program: st.program || i.studentCourse || '—',
      year_level: st.year_level || i.studentYear || '',
      headline: st.headline || '',
      location: st.location || '',
      phone: st.phone || '',
      skills: Array.isArray(st.skills) ? st.skills : [],
      gpa: st.gpa || '',
    },
    endorser: i.endorser || null,
  };
}

// ── OJT Listing Detail + Applications Modal ───────────────────────────────────
function showInterestedModal(slot, allInterests, onUpdate, options = {}) {
  const initialTab = options.initialTab || 'details';
  const initial = slot.companyInitial || slot.company_name?.[0] || slot.company?.[0] || '?';
  const title   = slot.slotTitle  || slot.title       || 'OJT Position';
  const company = slot.company    || slot.company_name || '—';
  const dept    = slot.department || '—';
  const dur     = slot.duration   || '3 months';
  const sched   = slot.schedule   || (slot.schedule_type === 'half_day' ? 'Half Day · Mon–Fri' : 'Full Day · Mon–Fri');
  const loc     = slot.location   || '—';
  const startDt = slot.start_date || slot.startDate   || 'ASAP';
  const courses    = Array.isArray(slot.preferred_courses) ? slot.preferred_courses.join(', ') : (slot.preferred_courses || slot.preferredCourse || 'Any');
  const desc     = slot.description || slot.tasks || '';
  const outcomes = slot.learning_outcomes || slot.learningOutcomes || '';
  const reqs     = Array.isArray(slot.requirements) ? slot.requirements : [];
  const contactName  = slot.contact_name  || slot.contactName  || '';
  const contactPhone = slot.contact_phone || slot.contactPhone || '';

  // Precompute applicant count, pending letters, and pending approvals for instant display
  const slotInterests = allInterests.filter(i => String(i.slotId ?? i.posting?.id ?? i.ojt_posting_id) === String(slot.id));
  const companyUserId = slot.company_user_id || slot.companyUserId || slotInterests.find(i => i.posting?.company_user_id)?.posting?.company_user_id;
  const pendingLettersCount = slotInterests.filter(i => i.status === 'endorsement_requested').length;
  const pendingApprovalsCount = slotInterests.filter(i => i.status === 'company_accepted').length;
  const totalPendingAction = pendingLettersCount + pendingApprovalsCount;
  const initialAppCount = slotInterests.length;

  const activeOrPlacedInModal = slotInterests.filter(i => ['company_accepted', 'accepted', 'ojt_confirmed', 'ojt_started'].includes(i.status)).length;
  const numSlotsTotal = Number(slot.slots_total || slot.slots || 0);
  let numSlotsLeft = slot.slots_remaining !== undefined && slot.slots_remaining !== null
    ? Number(slot.slots_remaining)
    : (numSlotsTotal ? Math.max(0, numSlotsTotal - activeOrPlacedInModal) : null);
  if (numSlotsTotal > 0 && activeOrPlacedInModal > 0 && (numSlotsLeft === null || numSlotsLeft >= numSlotsTotal)) {
    numSlotsLeft = Math.max(0, numSlotsTotal - activeOrPlacedInModal);
  }
  if (numSlotsTotal > 0 && numSlotsLeft !== null && (numSlotsTotal - numSlotsLeft) < activeOrPlacedInModal) {
    numSlotsLeft = Math.max(0, numSlotsTotal - activeOrPlacedInModal);
  }
  const slotsTotal = numSlotsTotal || slot.slots_total || slot.slots || '—';
  const slotsLeft  = numSlotsLeft !== null ? numSlotsLeft : (slot.slots_remaining ?? slot.slotsRemaining ?? '—');

  const STATUS_CFG = {
    open:       { label: 'Open',       color: '#059669', bg: '#05966914' },
    filling_up: { label: 'Filling Up', color: '#D97706', bg: '#D9770614' },
    full:       { label: 'Full',       color: '#D97706', bg: '#D9770614' },
    draft:      { label: 'Draft',      color: '#64748B', bg: '#64748B14' },
    closed:     { label: 'Closed',     color: '#EF4444', bg: '#EF444414' },
  };
  const sc = STATUS_CFG[slot.status] || STATUS_CFG.open;

  const bd = document.createElement('div');
  bd.className = 'modal-backdrop modal-backdrop--visible';
  bd.innerHTML = `
    <div class="modal modal--visible ojts-modal" style="max-width:880px;width:95vw;display:flex;flex-direction:column;max-height:92vh;padding:0;">

      <!-- ── Modal Header ── -->
      <div class="ojts-modal__head">
        <div class="ojts-modal__head-main">
          <div class="ojts-modal__avatar"><span>${initial}</span></div>
          <div class="ojts-modal__titles">
            <div class="ojts-modal__title-row">
              <h2 class="ojts-modal__title">${title}</h2>
              <span class="ojts-card__status" style="background:${sc.bg};color:${sc.color};border:1px solid ${sc.color}25">${sc.label}</span>
            </div>
            <p class="ojts-modal__company">${icon('building', 12)} ${company} · ${loc}</p>
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            ${companyUserId ? `
              <button type="button" class="btn btn--outline btn--sm" id="ojts-modal-chat-company-btn" style="gap:6px;color:#0284c7;border-color:rgba(2,132,199,0.35);font-size:0.75rem;" title="Message ${company}">
                ${icon('messageCircle', 13)} Message Company
              </button>
            ` : ''}
            <button class="modal__close" id="int-modal-close">${icon('x', 20)}</button>
          </div>
        </div>

        <!-- Quick Spec Strip -->
        <div class="ojts-modal__spec-strip">
          <div class="ojts-modal__spec-item">
            <span class="ojts-modal__spec-lbl">${icon('users', 12)} Available Slots</span>
            <span class="ojts-modal__spec-val">${slotsLeft} of ${slotsTotal} left${slotsLeft === 0 ? ' (Full)' : ''}</span>
          </div>
          <div class="ojts-modal__spec-item">
            <span class="ojts-modal__spec-lbl">${icon('clock', 12)} Duration</span>
            <span class="ojts-modal__spec-val">${dur}</span>
          </div>
          <div class="ojts-modal__spec-item">
            <span class="ojts-modal__spec-lbl">${icon('calendar', 12)} Schedule</span>
            <span class="ojts-modal__spec-val">${sched.split('·')[0].trim()}</span>
          </div>
          <div class="ojts-modal__spec-item">
            <span class="ojts-modal__spec-lbl">${icon('mapPin', 12)} Deployment</span>
            <span class="ojts-modal__spec-val">${loc.split(',')[0]}</span>
          </div>
        </div>

        <!-- Tab Bar -->
        <div class="ojts-modal__tabs" id="int-tab-bar">
          <button class="ojts-modal__tab${initialTab === 'details' ? ' ojts-modal__tab--active' : ''}" data-tab="details">
            ${icon('fileText', 14)} <span>Listing Details</span>
          </button>
          <button class="ojts-modal__tab${initialTab === 'applications' ? ' ojts-modal__tab--active' : ''}" data-tab="applications">
            ${icon('users', 14)} <span>Applicant Pipeline</span>
            <span class="ojts-modal__tab-pill${totalPendingAction > 0 ? (pendingLettersCount > 0 ? ' ojts-pipeline-filter__pill--warn' : ' ojts-pipeline-filter__pill--good') : ''}" id="int-app-count">
              ${totalPendingAction > 0 ? `<span class="ojts-pulse-dot${pendingLettersCount === 0 ? ' ojts-pulse-dot--green' : ''}" style="width:5px;height:5px;"></span> ` : ''}${initialAppCount}
            </span>
          </button>
        </div>
      </div>

      <!-- ── Modal Content ── -->
      <div class="ojts-modal__body" style="overflow-y:auto;flex:1;min-height:0;">

        <!-- Tab 1: Details -->
        <div id="int-tab-details" class="ojts-details-tab"${initialTab === 'applications' ? ' style="display:none;"' : ''}>
          <div class="ojts-details-grid">
            <div class="ojts-info-cell">
              <span class="ojts-info-cell__label">${icon('bookOpen', 12)} Preferred Degree Program</span>
              <span class="ojts-info-cell__value">${courses}</span>
            </div>
            <div class="ojts-info-cell">
              <span class="ojts-info-cell__label">${icon('briefcase', 12)} Assigned Department</span>
              <span class="ojts-info-cell__value">${dept}</span>
            </div>
            <div class="ojts-info-cell">
              <span class="ojts-info-cell__label">${icon('calendar', 12)} Target Start Date</span>
              <span class="ojts-info-cell__value">${startDt}</span>
            </div>
            <div class="ojts-info-cell">
              <span class="ojts-info-cell__label">${icon('zap', 12)} Daily Schedule</span>
              <span class="ojts-info-cell__value">${sched}</span>
            </div>
            ${loc !== '—' ? `
            <div class="ojts-info-cell" style="grid-column: 1 / -1;">
              <span class="ojts-info-cell__label">${icon('mapPin', 12)} Deployment Address</span>
              <span class="ojts-info-cell__value">${loc}</span>
            </div>` : ''}
          </div>

          ${desc ? `
          <div class="ojts-details-section">
            <h4 class="ojts-details-section__title">${icon('fileText', 13)} Tasks &amp; Scope of Work</h4>
            <p class="ojts-details-section__text">${desc}</p>
          </div>` : ''}

          ${outcomes ? `
          <div class="ojts-details-section">
            <h4 class="ojts-details-section__title">${icon('star', 13)} Learning Outcomes &amp; Competencies</h4>
            <p class="ojts-details-section__text">${outcomes}</p>
          </div>` : ''}

          ${reqs.length ? `
          <div class="ojts-details-section">
            <h4 class="ojts-details-section__title">${icon('clipboardList', 13)} Required Prerequisites</h4>
            <ul class="ojts-details-list">
              ${reqs.map(r => `<li>${r}</li>`).join('')}
            </ul>
          </div>` : ''}

          ${contactName ? `
          <div class="ojts-contact-card" style="display:flex;align-items:center;justify-content:space-between;gap:12px;">
            <div style="display:flex;align-items:center;gap:10px;">
              <div class="ojts-contact-card__avatar">${icon('user', 18)}</div>
              <div>
                <span class="ojts-contact-card__lbl">Partner Contact Person</span>
                <span class="ojts-contact-card__name">${contactName}</span>
                ${contactPhone ? `<span class="ojts-contact-card__phone">${icon('phone', 12)} ${contactPhone}</span>` : ''}
              </div>
            </div>
            ${companyUserId ? `
              <button type="button" class="btn btn--outline btn--sm ojts-contact-chat-btn" style="gap:6px;color:#0284c7;border-color:rgba(2,132,199,0.35);font-size:0.75rem;">
                ${icon('messageCircle', 13)} Chat with Company
              </button>
            ` : ''}
          </div>` : ''}
        </div>

        <!-- Tab 2: Applications Pipeline -->
        <div id="int-tab-applications" class="ojts-apps-tab"${initialTab === 'details' ? ' style="display:none;"' : ''}>
          <div id="int-app-body">
            <div class="ojts-loading-box">
              <div class="ojts-spinner"></div>
              <span>Loading applicants…</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  `;

  document.body.appendChild(bd);

  const close = () => bd.remove();
  bd.querySelector('#int-modal-close').addEventListener('click', close);
  bd.addEventListener('click', e => { if (e.target === bd) close(); });

  bd.querySelector('#ojts-modal-chat-company-btn')?.addEventListener('click', () => {
    if (companyUserId && window.openCompanyChat) {
      window.openCompanyChat(companyUserId);
    }
  });

  bd.querySelector('.ojts-contact-chat-btn')?.addEventListener('click', () => {
    if (companyUserId && window.openCompanyChat) {
      window.openCompanyChat(companyUserId);
    }
  });

  // Tab switching
  const tabs = bd.querySelectorAll('.ojts-modal__tab');
  const detailsPanel = bd.querySelector('#int-tab-details');
  const appsPanel    = bd.querySelector('#int-tab-applications');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('ojts-modal__tab--active'));
      tab.classList.add('ojts-modal__tab--active');

      if (tab.dataset.tab === 'details') {
        detailsPanel.style.display = '';
        appsPanel.style.display = 'none';
      } else {
        detailsPanel.style.display = 'none';
        appsPanel.style.display = '';
      }
    });
  });

  // Always load applications immediately on mount so data is pre-populated
  loadApplications(slot, allInterests, onUpdate, bd);
}

// ── Load Applications for Posting ────────────────────────────────────────────
async function loadApplications(slot, allInterests, onUpdate, bd) {
  const body = bd.querySelector('#int-app-body');
  const countEl = bd.querySelector('#int-app-count');

  // 1. Instant local render from pre-loaded allInterests (0ms latency, zero skeleton delay)
  const localCandidates = allInterests
    .filter(i => String(i.slotId ?? i.posting?.id ?? i.ojt_posting_id) === String(slot.id))
    .map(interestToStudentCard);

  if (localCandidates.length && body) {
    if (countEl) countEl.textContent = localCandidates.length;
    renderApplicationsBody(body, localCandidates, slot, bd, allInterests, onUpdate);
  }

  // 2. Fetch fresh data directly from server (bypassing any stale client-side cache)
  let serverStudents = [];
  try {
    const res = await apiGetFresh(`/supervisor/posting/${slot.id}/applications`);
    if (res?.success && Array.isArray(res.data)) {
      serverStudents = res.data;
    }
  } catch {}

  // 3. Fallback & Safety Merge: ensure any candidate from local allInterests is never lost
  const mergedMap = new Map();
  serverStudents.forEach(s => mergedMap.set(String(s.id), s));
  localCandidates.forEach(lc => {
    if (!mergedMap.has(String(lc.id))) {
      mergedMap.set(String(lc.id), lc);
    }
  });

  const finalStudents = Array.from(mergedMap.values());
  if (countEl) countEl.textContent = finalStudents.length || '0';

  if (body) {
    renderApplicationsBody(body, finalStudents, slot, bd, allInterests, onUpdate);
  }
}

function renderApplicationsBody(body, students, slot, bd, allInterests, onUpdate, activeFilter = 'all') {
  if (!students.length) {
    body.innerHTML = `
      <div class="ojts-empty" style="padding:40px 20px;">
        <div class="ojts-empty__icon">${icon('users', 32)}</div>
        <h3 class="ojts-empty__title">No Applications Submitted</h3>
        <p class="ojts-empty__text">No students have applied to this OJT posting yet.</p>
      </div>`;
    return;
  }

  // Partition by pipeline statuses
  const actionNeeded         = students.filter(s => s.status === 'endorsement_requested' || s.status === 'company_accepted');
  const endorsementRequested = students.filter(s => s.status === 'endorsement_requested');
  const awaitingFinalAccept  = students.filter(s => s.status === 'company_accepted');
  const interviewScheduled   = students.filter(s => s.status === 'interview_scheduled');
  const letterSent           = students.filter(s => s.status === 'endorsed');
  const coordinatorApproved  = students.filter(s => s.status === 'accepted');
  const ojtConfirmed         = students.filter(s => s.status === 'ojt_confirmed');
  const ojtActive            = students.filter(s => s.status === 'ojt_started');
  const placedActive         = students.filter(s => ['endorsed', 'accepted', 'ojt_confirmed', 'ojt_started'].includes(s.status));
  const rejected             = students.filter(s => s.status === 'rejected' || s.status === 'declined');

  // Clean, modern segmented filter bar
  let html = `
    <div class="ojts-pipeline-filter" id="ojts-pipeline-filter">
      <button class="ojts-pipeline-filter__btn${activeFilter === 'all' ? ' ojts-pipeline-filter__btn--active' : ''}" data-filter="all">
        <span>All Applicants</span> <span class="ojts-pipeline-filter__pill">${students.length}</span>
      </button>
      ${actionNeeded.length ? `
      <button class="ojts-pipeline-filter__btn${activeFilter === 'action' ? ' ojts-pipeline-filter__btn--active' : ''}" data-filter="action">
        <span>Action Needed</span> <span class="ojts-pipeline-filter__pill ojts-pipeline-filter__pill--warn">${actionNeeded.length}</span>
      </button>` : ''}
      ${interviewScheduled.length ? `
      <button class="ojts-pipeline-filter__btn${activeFilter === 'interviews' ? ' ojts-pipeline-filter__btn--active' : ''}" data-filter="interviews">
        <span>Interviews</span> <span class="ojts-pipeline-filter__pill">${interviewScheduled.length}</span>
      </button>` : ''}
      ${placedActive.length ? `
      <button class="ojts-pipeline-filter__btn${activeFilter === 'placed' ? ' ojts-pipeline-filter__btn--active' : ''}" data-filter="placed">
        <span>In Progress</span> <span class="ojts-pipeline-filter__pill">${placedActive.length}</span>
      </button>` : ''}
      ${rejected.length ? `
      <button class="ojts-pipeline-filter__btn${activeFilter === 'declined' ? ' ojts-pipeline-filter__btn--active' : ''}" data-filter="declined">
        <span>Declined</span> <span class="ojts-pipeline-filter__pill">${rejected.length}</span>
      </button>` : ''}
    </div>
  `;

  // Candidates container
  html += `<div class="ojts-candidates-list" id="ojts-filtered-candidates">`;

  function sectionHdr(label, count) {
    return `
      <div class="ojts-stage-header">
        <span class="ojts-stage-title">${label}</span>
        <span class="ojts-stage-count">${count}</span>
      </div>`;
  }

  // 1. Endorsement Letter Requested (Priority Action)
  if ((activeFilter === 'all' || activeFilter === 'action') && endorsementRequested.length) {
    html += sectionHdr(`${icon('mail', 13)} Endorsement Letter Requested`, endorsementRequested.length);
    endorsementRequested.forEach(s => { html += studentDetailCard(s, 'endorsement_requested'); });
  }

  // 2. Company Accepted — Final OJT Approval Required
  if ((activeFilter === 'all' || activeFilter === 'action') && awaitingFinalAccept.length) {
    html += sectionHdr(`${icon('checkCircle', 13)} Final OJT Approval Required`, awaitingFinalAccept.length);
    awaitingFinalAccept.forEach(s => { html += studentDetailCard(s, 'awaiting_final_accept'); });
  }

  // 3. Interview Scheduled
  if ((activeFilter === 'all' || activeFilter === 'interviews') && interviewScheduled.length) {
    html += sectionHdr(`${icon('calendar', 13)} Interview Scheduled`, interviewScheduled.length);
    interviewScheduled.forEach(s => { html += studentDetailCard(s, 'awaiting_company_decision'); });
  }

  // 4. Letter Sent / Endorsed
  if ((activeFilter === 'all' || activeFilter === 'placed') && letterSent.length) {
    html += sectionHdr(`${icon('fileText', 13)} Endorsement Letter Sent`, letterSent.length);
    letterSent.forEach(s => { html += studentDetailCard(s, 'letter_sent'); });
  }

  // 5. Coordinator Approved
  if ((activeFilter === 'all' || activeFilter === 'placed') && coordinatorApproved.length) {
    html += sectionHdr(`${icon('shield', 13)} Coordinator Approved`, coordinatorApproved.length);
    coordinatorApproved.forEach(s => { html += studentDetailCard(s, 'coordinator_approved'); });
  }

  // 6. OJT Confirmed
  if ((activeFilter === 'all' || activeFilter === 'placed') && ojtConfirmed.length) {
    html += sectionHdr(`${icon('calendar', 13)} OJT Confirmed`, ojtConfirmed.length);
    ojtConfirmed.forEach(s => { html += studentDetailCard(s, 'ojt_confirmed'); });
  }

  // 7. OJT Active
  if ((activeFilter === 'all' || activeFilter === 'placed') && ojtActive.length) {
    html += sectionHdr(`${icon('checkCircle', 13)} Active Trainees`, ojtActive.length);
    ojtActive.forEach(s => { html += studentDetailCard(s, 'ojt_active'); });
  }

  // 8. Rejected / Declined
  if ((activeFilter === 'all' || activeFilter === 'declined') && rejected.length) {
    html += sectionHdr(`${icon('x', 13)} Declined Applications`, rejected.length);
    rejected.forEach(s => { html += studentDetailCard(s, 'declined'); });
  }

  html += `</div>`;
  body.innerHTML = html;

  // Filter tab events
  body.querySelectorAll('.ojts-pipeline-filter__btn').forEach(btn => {
    btn.addEventListener('click', () => {
      renderApplicationsBody(body, students, slot, bd, allInterests, onUpdate, btn.dataset.filter);
    });
  });

  // Upload Endorsement Letter button
  body.querySelectorAll('.btn--upload-letter').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      showEndorsementUploadModal(id, slot, students, body, bd, allInterests, onUpdate);
    });
  });

  // Final Accept button
  body.querySelectorAll('.btn--final-accept').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const studentName = btn.dataset.name || 'Student';
      showFinalAcceptModal(id, studentName, slot, students, body, bd, allInterests, onUpdate);
    });
  });

  // Decline/Reject button
  body.querySelectorAll('.btn--decline-int').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = Number(btn.dataset.id);
      btn.disabled = true;
      btn.innerHTML = `${icon('clock', 12)} Saving…`;
      try { await apiPost(`/supervisor/reject/${id}`, {}); } catch {}
      showToast('Student application declined.', 'info');
      const refreshed = await apiGetFresh(`/supervisor/posting/${slot.id}/applications`).catch(() => null);
      const newStudents = (refreshed?.success && Array.isArray(refreshed.data))
        ? refreshed.data
        : students.map(s => s.id === id ? { ...s, status: 'rejected' } : s);
      const countEl = bd.querySelector('#int-app-count');
      if (countEl) countEl.textContent = newStudents.length;
      renderApplicationsBody(body, newStudents, slot, bd, allInterests, onUpdate, activeFilter);
    });
  });

  // Message Student button
  body.querySelectorAll('.btn--msg-student').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const studentId = parseInt(btn.dataset.studentId, 10);
      if (!studentId) return;
      try {
        const res = await apiGet(`/chat/init/coordinator/${studentId}`);
        if (res?.key && window.openChat) {
          window.openChat(res.key);
        }
      } catch (err) {
        console.error('Failed to open chat with student:', err);
      }
    });
  });

  // OJT Requirements button (Assign / Review)
  body.querySelectorAll('.btn--open-reqs').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const studentId = parseInt(btn.dataset.studentId, 10);
      const studentName = btn.dataset.name || 'Student';
      const program = btn.dataset.program || '';
      const interestId = btn.dataset.interestId ? parseInt(btn.dataset.interestId, 10) : null;
      const postingId = btn.dataset.postingId ? parseInt(btn.dataset.postingId, 10) : (slot?.id ? parseInt(slot.id, 10) : null);
      const hasReq = btn.dataset.hasReq === '1';

      const refreshCurrentList = async () => {
        const refreshed = await apiGetFresh(`/supervisor/posting/${slot.id}/applications`).catch(() => null);
        if (refreshed?.success && Array.isArray(refreshed.data)) {
          renderApplicationsBody(body, refreshed.data, slot, bd, allInterests, onUpdate, activeFilter);
        }
      };

      if (hasReq) {
        try {
          const reqRes = await apiGet(`/supervisor/requirements/student/${studentId}`);
          if (reqRes?.success && reqRes.data?.active_requirement) {
            openReviewRequirementsModal({
              requirement: reqRes.data.active_requirement,
              studentName,
              requirementsDriveUrl: reqRes.data.requirements_drive_url,
              onReviewed: () => {
                showToast(`Requirements review updated for ${studentName}!`, 'success');
                refreshCurrentList();
              },
              onReassign: () => {
                openAssignRequirementsModal({
                  studentId,
                  studentName,
                  program,
                  interestId,
                  postingId,
                  onAssigned: () => {
                    showToast(`OJT Requirements assigned to ${studentName}!`, 'success');
                    refreshCurrentList();
                  }
                });
              }
            });
            return;
          }
        } catch (err) {
          console.error('Failed to fetch requirement details:', err);
        }
      }

      openAssignRequirementsModal({
        studentId,
        studentName,
        program,
        interestId,
        postingId,
        onAssigned: () => {
          showToast(`OJT Requirements assigned to ${studentName}!`, 'success');
          refreshCurrentList();
        }
      });
    });
  });
}

function studentDetailCard(s, state) {
  const st       = s.student || {};
  const name     = st.name || 'Student';
  const initials = name.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const program  = st.program    || '—';
  const year     = st.year_level || '';
  const email    = st.email      || '';
  const phone    = st.phone      || '';
  const location = st.location   || '';
  const msg      = s.student_message || '';
  const date     = s.created_at  || '';
  const companyNote     = s.company_note || '';
  const interviewAt     = s.interview_scheduled_at || '';
  const interviewType   = s.interview_type || '';
  const interviewLocation = s.interview_location || '';
  const ojtStartDate    = s.ojt_start_date || '';
  const ojtInstructions = s.ojt_instructions || '';

  const reqList = s.ojt_requirements || st.ojt_requirements || s.ojtRequirements || st.ojtRequirements || [];
  const latestReq = Array.isArray(reqList) && reqList.length ? reqList[0] : null;
  const driveUrl = latestReq?.drive_url || st.requirements_drive_url || s.requirements_drive_url || '';

  // Clean, refined status badge
  let badgeHtml = '';
  const isUrgent = state === 'endorsement_requested';
  const isApprovalUrgent = state === 'awaiting_final_accept';

  if (isUrgent) {
    badgeHtml = `<span class="ojts-badge ojts-badge--warn"><span class="ojts-pulse-dot" style="width:5px;height:5px;"></span> Endorsement Requested</span>`;
  } else if (state === 'letter_sent' || state === 'endorsed') {
    badgeHtml = `<span class="ojts-badge ojts-badge--purple">${icon('fileText', 10)} Letter Sent</span>`;
  } else if (state === 'awaiting_company_decision') {
    const typeLabel = interviewType === 'face_to_face' ? 'In-Person' : interviewType === 'online' ? 'Online' : '';
    badgeHtml = `<span class="ojts-badge ojts-badge--blue">${icon('calendar', 10)} Interview Scheduled${typeLabel ? ' · ' + typeLabel : ''}</span>`;
  } else if (state === 'awaiting_final_accept') {
    badgeHtml = `<span class="ojts-badge ojts-badge--urgent-good"><span class="ojts-pulse-dot ojts-pulse-dot--green" style="width:5px;height:5px;"></span> Company Accepted · Approval Required</span>`;
  } else if (state === 'coordinator_approved') {
    badgeHtml = `<span class="ojts-badge ojts-badge--good">${icon('shield', 10)} Approved</span>`;
  } else if (state === 'ojt_confirmed') {
    badgeHtml = `<span class="ojts-badge ojts-badge--purple">${icon('calendar', 10)} Confirmed</span>`;
  } else if (state === 'ojt_active' || state === 'accepted') {
    badgeHtml = `<span class="ojts-badge ojts-badge--good">${icon('checkCircle', 10)} Active Trainee</span>`;
  } else if (state === 'declined') {
    badgeHtml = `<span class="ojts-badge ojts-badge--neutral">${icon('x', 10)} Declined</span>`;
  }

  // Clear, well-proportioned action button
  let actionBtn = '';
  if (isUrgent) {
    actionBtn = `<button class="ojts-action-btn ojts-action-btn--warn btn--upload-letter" data-id="${s.id}" data-name="${name}">${icon('upload', 13)} Upload Letter</button>`;
  } else if (state === 'awaiting_final_accept') {
    actionBtn = `<button class="ojts-action-btn ojts-action-btn--good btn--final-accept" data-id="${s.id}" data-name="${name}">${icon('checkCircle', 13)} Approve OJT</button>`;
  }

  return `
    <div class="ojts-candidate-card${state === 'declined' ? ' ojts-candidate-card--declined' : ''}${isUrgent ? ' ojts-candidate-card--urgent' : ''}${isApprovalUrgent ? ' ojts-candidate-card--approval-urgent' : ''}">
      <!-- Header Row: Avatar, Name, Program, Status Badge & Action -->
      <div class="ojts-candidate-card__head">
        <div class="ojts-candidate-card__head-left">
          <div class="ojts-candidate-card__avatar"><span>${initials}</span></div>
          <div class="ojts-candidate-card__info">
            <div class="ojts-candidate-card__name-row">
              <span class="ojts-candidate-card__name">${name}</span>
              ${badgeHtml}
            </div>
            <span class="ojts-candidate-card__program">${program}${year ? ' · ' + year : ''}</span>
          </div>
        </div>
        <div class="ojts-candidate-card__actions">
          ${st.id ? `<button class="ojts-candidate-card__msg-btn btn--open-reqs" data-student-id="${st.id}" data-name="${name}" data-program="${program}" data-interest-id="${s.id}" data-posting-id="${s.posting_id || ''}" data-has-req="${latestReq ? '1' : '0'}" data-req-id="${latestReq?.id || ''}" title="Manage OJT Requirements">
            ${latestReq ? (latestReq.status === 'submitted' ? `${icon('checkSquare', 12)} Review Reqs` : `${icon('list', 12)} Reqs`) : `${icon('clipboard', 12)} Assign Reqs`}
          </button>` : ''}
          ${st.id ? `<button class="ojts-candidate-card__msg-btn btn--msg-student" data-student-id="${st.id}" data-name="${name}" title="Message Student">${icon('messageCircle', 13)} Message</button>` : ''}
          ${actionBtn}
        </div>
      </div>

      <!-- Compact Metadata Line (eliminates heavy bottom footer band) -->
      <div class="ojts-candidate-card__meta-line">
        ${email ? `<span class="ojts-candidate-card__meta-item">${icon('mail', 11)} ${email}</span>` : ''}
        ${phone ? `<span class="ojts-candidate-card__meta-item">${icon('phone', 11)} ${phone}</span>` : ''}
        ${location ? `<span class="ojts-candidate-card__meta-item">${icon('mapPin', 11)} ${location}</span>` : ''}
        ${date ? `<span class="ojts-candidate-card__meta-item" style="margin-left:auto;color:var(--text-tertiary);">${icon('clock', 11)} Applied ${date}</span>` : ''}
      </div>

      <!-- Requirements & Drive Submission Status Section -->
      <div class="ojts-candidate-card__reqs-bar" style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;padding:7px 12px;background:${
        latestReq?.status === 'submitted' ? 'rgba(37,99,235,0.06)' :
        latestReq?.status === 'verified'  ? 'rgba(22,163,74,0.06)' :
        latestReq?.status === 'needs_revision' ? 'rgba(217,119,6,0.08)' :
        latestReq?.status === 'pending'   ? 'rgba(100,116,139,0.06)' :
        'rgba(2,132,199,0.06)'
      };border:1px solid ${
        latestReq?.status === 'submitted' ? 'rgba(37,99,235,0.25)' :
        latestReq?.status === 'verified'  ? 'rgba(22,163,74,0.25)' :
        latestReq?.status === 'needs_revision' ? 'rgba(217,119,6,0.28)' :
        'rgba(2,132,199,0.2)'
      };border-radius:var(--radius-sm);margin-top:8px;">
        <div style="display:flex;align-items:center;gap:6px;min-width:0;flex:1;">
          <span style="color:${
            latestReq?.status === 'verified' ? '#16a34a' :
            latestReq?.status === 'submitted' ? '#2563eb' :
            latestReq?.status === 'needs_revision' ? '#d97706' :
            '#0284c7'
          };display:inline-flex;">
            ${icon(latestReq?.status === 'verified' ? 'checkCircle' : latestReq?.status === 'submitted' ? 'clock' : latestReq?.status === 'needs_revision' ? 'alertTriangle' : 'folder', 13)}
          </span>
          <span style="font-weight:600;font-size:0.75rem;color:${
            latestReq?.status === 'verified' ? '#15803d' :
            latestReq?.status === 'submitted' ? '#1d4ed8' :
            latestReq?.status === 'needs_revision' ? '#b45309' :
            '#0f172a'
          };">
            ${
              latestReq
                ? `Requirements: <span style="text-transform:capitalize;font-weight:700;">${latestReq.status.replace('_', ' ')}</span>${latestReq.title ? ` &middot; <span style="font-weight:500;color:var(--text-secondary);">${latestReq.title}</span>` : ''}`
                : (driveUrl ? 'Requirements Folder Available (Unassigned Packet)' : 'Requirements: Not Assigned')
            }
          </span>
          ${latestReq?.items?.length ? `<span style="font-size:0.72rem;color:var(--text-tertiary);">(${latestReq.items.length} items)</span>` : ''}
        </div>
        <div style="display:flex;align-items:center;gap:8px;">
          ${driveUrl ? `
            <a href="${driveUrl}" target="_blank" rel="noopener" style="font-size:0.74rem;color:#0284c7;text-decoration:underline;font-weight:600;display:inline-flex;align-items:center;gap:3px;">
              ${icon('externalLink', 11)} Cloud Drive ↗
            </a>
          ` : ''}
          <button type="button" class="btn--open-reqs"
            data-student-id="${st.id}"
            data-name="${name}"
            data-program="${program}"
            data-interest-id="${s.id}"
            data-posting-id="${s.posting_id || ''}"
            data-has-req="${latestReq ? '1' : '0'}"
            data-req-id="${latestReq?.id || ''}"
            style="background:none;border:none;color:#005930;font-size:0.74rem;font-weight:700;cursor:pointer;padding:2px 6px;text-decoration:underline;">
            ${latestReq ? (latestReq.status === 'submitted' ? 'Review Submission' : 'Manage / Review') : '+ Assign Requirements'}
          </button>
        </div>
      </div>

      <!-- Candidate Cover Note / Student Message (if provided) -->
      ${msg ? `
      <p class="ojts-candidate-card__quote">&ldquo;${msg}&rdquo;</p>
      ` : ''}

      <!-- Context Box: Scheduled Interview Details -->
      ${interviewAt ? `
      <div class="ojts-candidate-card__context-box">
        <div class="ojts-candidate-card__context-row">
          <span style="font-weight:600;color:var(--text-primary);">${icon('calendar', 12)} Interview:</span>
          <span>${interviewAt}</span>
          ${interviewLocation ? `<span>· ${icon('mapPin', 11)} ${interviewLocation}</span>` : ''}
        </div>
        ${companyNote ? `<div style="font-style:italic;color:var(--text-secondary);margin-top:2px;">Company Note: &ldquo;${companyNote}&rdquo;</div>` : ''}
      </div>
      ` : ''}

      <!-- Context Box: Confirmed OJT Start Date -->
      ${ojtStartDate ? `
      <div class="ojts-candidate-card__context-box">
        <div class="ojts-candidate-card__context-row">
          <span style="font-weight:600;color:var(--text-primary);">${icon('calendar', 12)} Start Date:</span>
          <span>${ojtStartDate}</span>
          ${s.estimated_end_date ? `<span style="margin-left:auto;color:#005930;font-weight:600;">Target End: ${s.estimated_end_date}</span>` : ''}
        </div>
        ${Array.isArray(s.schedule_days) && s.schedule_days.length ? `
        <div style="font-size:0.73rem;color:var(--text-secondary);margin-top:3px;display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
          <span style="font-weight:700;color:#005930;background:rgba(0,89,48,0.08);padding:1px 6px;border-radius:4px;">
            ${s.schedule_days.join(', ')}
          </span>
          ${s.shift_start ? `<span>${s.shift_start} &ndash; ${s.shift_end} (${s.daily_hours || 8}h/day)</span>` : ''}
        </div>` : ''}
        ${ojtInstructions ? `<div style="color:var(--text-secondary);margin-top:2px;">Instructions: ${ojtInstructions}</div>` : ''}
      </div>
      ` : ''}
    </div>
  `;
}

// ── Upload Endorsement Letter Modal ───────────────────────────────────────────
function showEndorsementUploadModal(interestId, slot, students, body, bd, allInterests, onUpdate) {
  const record      = students.find(s => String(s.id) === String(interestId));
  const studentName = record?.student?.name || 'Student';
  const program     = record?.student?.program || '';
  const company     = slot.company || slot.company_name || '';
  const posting     = slot.title || slot.slotTitle || 'OJT Position';
  const hasExisting = !!record?.endorsement_letter;

  const modal = document.createElement('div');
  modal.className = 'modal-backdrop modal-backdrop--visible';
  modal.style.zIndex = '9999';
  modal.innerHTML = `
    <div class="modal modal--visible" style="max-width:520px;padding:0;">
      <div class="modal__header" style="border-bottom:1px solid var(--border-default);padding:18px 24px;">
        <div style="display:flex;align-items:center;gap:12px;min-width:0;">
          <div style="width:40px;height:40px;border-radius:10px;background:#00593014;color:#005930;display:flex;align-items:center;justify-content:center;flex-shrink:0;">${icon('fileText', 20)}</div>
          <div style="min-width:0;">
            <h3 class="modal__title" style="margin:0;font-size:1.1rem;font-weight:700;">Send Endorsement Letter</h3>
            <p style="font-size:0.76rem;color:var(--text-secondary);margin:2px 0 0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${studentName}${program ? ' · ' + program : ''}</p>
          </div>
        </div>
        <button class="modal__close" id="el-modal-close">${icon('x', 20)}</button>
      </div>

      <div class="modal__body" style="padding:20px 24px;">
        <!-- Posting Context -->
        <div style="background:var(--bg-secondary);border:1px solid var(--border-default);border-radius:var(--radius-md);padding:12px 14px;margin-bottom:18px;">
          <p style="font-size:0.68rem;color:var(--text-tertiary);margin:0 0 2px;text-transform:uppercase;letter-spacing:0.05em;">Placement For</p>
          <p style="font-weight:700;font-size:0.88rem;margin:0;color:var(--text-primary);">${posting}</p>
          ${company ? `<p style="font-size:0.76rem;color:var(--text-secondary);margin:2px 0 0;">${icon('building', 11)} ${company}</p>` : ''}
        </div>

        ${record?.endorsement_letter_url ? `
          <div style="margin-bottom:14px;padding:8px 12px;background:#ecfdf5;border:1px solid rgba(16,185,129,0.25);border-radius:6px;display:flex;align-items:center;justify-content:space-between;font-size:0.75rem;">
            <span style="color:#065f46;font-weight:600;display:inline-flex;align-items:center;gap:6px;">${icon('fileCheck', 13)} Current letter on file</span>
            <a href="${record.endorsement_letter_url.startsWith('http') ? record.endorsement_letter_url : 'http://localhost:8000' + (record.endorsement_letter_url.startsWith('/') ? '' : '/') + record.endorsement_letter_url}" target="_blank" rel="noopener" style="color:#005930;font-weight:700;text-decoration:underline;display:inline-flex;align-items:center;gap:4px;">${icon('externalLink', 11)} View Current PDF</a>
          </div>` : ''}

        <!-- File Upload Area -->
        <div class="form-group" style="margin-bottom:12px;">
          <label class="form-label" style="font-size:0.78rem;font-weight:600;margin-bottom:6px;display:block;">
            Endorsement Letter Document ${hasExisting ? '<span style="color:#D97706;font-size:0.7rem;">(replace existing)</span>' : ''}
          </label>
          <label id="el-drop-zone" class="ojts-dropzone">
            <span style="color:var(--text-tertiary)">${icon('upload', 24)}</span>
            <span style="font-size:0.82rem;font-weight:600;color:var(--text-primary)">Click to select file or drag &amp; drop</span>
            <span style="font-size:0.72rem;color:var(--text-tertiary)">PDF, DOCX, JPG or PNG (up to 5MB)</span>
            <input type="file" id="el-file-input" accept=".pdf,.docx,.jpg,.jpeg,.png" style="display:none;" />
          </label>
        </div>

        <!-- File Preview -->
        <div id="el-file-preview" style="display:none;padding:10px 14px;background:#05966910;border:1px solid #05966925;border-radius:var(--radius-md);align-items:center;gap:10px;margin-bottom:12px;">
          <span style="color:#059669;flex-shrink:0;">${icon('fileText', 18)}</span>
          <div style="flex:1;min-width:0;">
            <p id="el-file-name" style="font-weight:600;font-size:0.82rem;margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text-primary);"></p>
            <p id="el-file-size" style="font-size:0.72rem;color:var(--text-tertiary);margin:2px 0 0;"></p>
          </div>
          <button id="el-file-clear" style="background:none;border:none;cursor:pointer;color:var(--text-tertiary);padding:2px;">${icon('x', 14)}</button>
        </div>

        <p id="el-error" style="color:#EF4444;font-size:0.78rem;margin:0;display:none;padding:8px 12px;background:#EF444412;border-radius:var(--radius-sm);"></p>
      </div>

      <div class="modal__footer" style="border-top:1px solid var(--border-default);padding:14px 24px;display:flex;justify-content:flex-end;gap:8px;">
        <button class="btn btn--outline" id="el-cancel">Cancel</button>
        <button class="btn btn--primary" id="el-submit" style="background:#005930;border-color:#005930;color:#fff;gap:6px;">${icon('send', 14)} Send Endorsement Letter</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const closeModal = () => modal.remove();
  modal.querySelector('#el-modal-close').addEventListener('click', closeModal);
  modal.querySelector('#el-cancel').addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

  const fileInput = modal.querySelector('#el-file-input');
  const dropZone  = modal.querySelector('#el-drop-zone');
  const preview   = modal.querySelector('#el-file-preview');
  const fileName  = modal.querySelector('#el-file-name');
  const fileSize  = modal.querySelector('#el-file-size');
  const fileClear = modal.querySelector('#el-file-clear');
  const errEl     = modal.querySelector('#el-error');

  function showFile(file) {
    if (!file) return;
    fileName.textContent = file.name;
    fileSize.textContent = file.size < 1024 * 1024
      ? `${(file.size / 1024).toFixed(1)} KB`
      : `${(file.size / 1024 / 1024).toFixed(2)} MB`;
    preview.style.display = 'flex';
    dropZone.classList.add('ojts-dropzone--active');
    errEl.style.display = 'none';
  }

  function clearFile() {
    fileInput.value = '';
    preview.style.display = 'none';
    dropZone.classList.remove('ojts-dropzone--active');
  }

  fileInput.addEventListener('change', () => { if (fileInput.files[0]) showFile(fileInput.files[0]); });
  fileClear.addEventListener('click', e => { e.preventDefault(); clearFile(); });

  dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('ojts-dropzone--drag'); });
  dropZone.addEventListener('dragleave', () => { dropZone.classList.remove('ojts-dropzone--drag'); });
  dropZone.addEventListener('drop', e => {
    e.preventDefault();
    dropZone.classList.remove('ojts-dropzone--drag');
    const file = e.dataTransfer.files[0];
    if (file) {
      const dt = new DataTransfer();
      dt.items.add(file);
      fileInput.files = dt.files;
      showFile(file);
    }
  });

  modal.querySelector('#el-submit').addEventListener('click', async () => {
    const file      = fileInput.files[0];
    const submitBtn = modal.querySelector('#el-submit');

    if (!file) {
      errEl.textContent = 'Please select an endorsement letter document to upload.';
      errEl.style.display = 'block';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      errEl.textContent = 'File too large. Maximum size is 5MB.';
      errEl.style.display = 'block';
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = `${icon('clock', 14)} Sending…`;
    errEl.style.display = 'none';

    try {
      const formData = new FormData();
      formData.append('endorsement_letter', file);

      const res = await apiUpload(`/supervisor/recommend/${interestId}`, formData);

      if (res?.success) {
        closeModal();
        showToast(res.message || `Endorsement letter sent for ${studentName}!`, 'success');
        const refreshed = await apiGetFresh(`/supervisor/posting/${slot.id}/applications`).catch(() => null);
        const newStudents = (refreshed?.success && Array.isArray(refreshed.data))
          ? refreshed.data
          : students.map(s => String(s.id) === String(interestId) ? { ...s, status: 'endorsed' } : s);
        const countEl = bd.querySelector('#int-app-count');
        if (countEl) countEl.textContent = newStudents.length;

        // Immediately update allInterests and notify outer grid to remove the action indicator
        const updatedAllInterests = allInterests.map(i =>
          String(i.id) === String(interestId) ? { ...i, status: 'endorsed' } : i
        );
        allInterests = updatedAllInterests;
        onUpdate?.(updatedAllInterests);

        renderApplicationsBody(body, newStudents, slot, bd, allInterests, onUpdate);

        apiCache.invalidate([
          '/supervisor/interests*',
          `/supervisor/posting/${slot.id}/applications*`,
          '/supervisor/dashboard*',
          '/supervisor/trainees*',
          '/supervisor/analytics*'
        ]);
      } else {
        errEl.textContent = res?.message || 'Failed to send endorsement letter. Please try again.';
        errEl.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.innerHTML = `${icon('send', 14)} Send Endorsement Letter`;
      }
    } catch {
      errEl.textContent = 'Network error. Please try again.';
      errEl.style.display = 'block';
      submitBtn.disabled = false;
      submitBtn.innerHTML = `${icon('send', 14)} Send Endorsement Letter`;
    }
  });
}

// ── Final Accept Modal ────────────────────────────────────────────────────────
function showFinalAcceptModal(interestId, studentName, slot, students, body, bd, allInterests, onUpdate) {
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop modal-backdrop--visible';
  modal.style.zIndex = '9999';
  modal.innerHTML = `
    <div class="modal modal--visible" style="max-width:480px;padding:0;">
      <div class="modal__header" style="border-bottom:1px solid var(--border-default);padding:18px 24px;">
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="width:40px;height:40px;border-radius:10px;background:#05966914;color:#059669;display:flex;align-items:center;justify-content:center;">${icon('checkCircle', 20)}</div>
          <div>
            <h3 class="modal__title" style="margin:0;font-size:1.1rem;font-weight:700;">Final OJT Approval</h3>
            <p style="font-size:0.76rem;color:var(--text-secondary);margin:2px 0 0;">${studentName}</p>
          </div>
        </div>
        <button class="modal__close" id="fa-close">${icon('x', 20)}</button>
      </div>
      <div class="modal__body" style="padding:20px 24px;">
        <div style="background:#05966910;border:1px solid #05966925;border-radius:var(--radius-md);padding:12px 14px;margin-bottom:16px;font-size:0.78rem;color:#059669;display:flex;gap:8px;line-height:1.4;">
          ${icon('checkCircle', 14)} Giving final approval confirms that this student will officially render OJT hours at this host company.
        </div>
        <div class="form-group">
          <label class="form-label" style="font-size:0.78rem;font-weight:600;margin-bottom:6px;display:block;">
            Coordinator Recommendation / Note <span style="color:var(--text-tertiary);font-weight:400;">(optional)</span>
          </label>
          <textarea id="fa-note" class="form-textarea" rows="3" placeholder="e.g. Approved. Please ensure time logs are submitted daily." style="resize:vertical;"></textarea>
        </div>
        <p id="fa-error" style="color:#EF4444;font-size:0.78rem;margin:8px 0 0;display:none;"></p>
      </div>
      <div class="modal__footer" style="border-top:1px solid var(--border-default);padding:14px 24px;display:flex;justify-content:flex-end;gap:8px;">
        <button class="btn btn--outline" id="fa-cancel">Cancel</button>
        <button class="btn btn--primary" id="fa-submit" style="background:#005930;border-color:#005930;color:#fff;gap:6px;">${icon('checkCircle', 14)} Confirm OJT Approval</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  const close = () => modal.remove();
  modal.querySelector('#fa-close').addEventListener('click', close);
  modal.querySelector('#fa-cancel').addEventListener('click', close);
  modal.addEventListener('click', e => { if (e.target === modal) close(); });

  modal.querySelector('#fa-submit').addEventListener('click', async () => {
    const note = modal.querySelector('#fa-note').value.trim();
    const submitBtn = modal.querySelector('#fa-submit');
    const errEl = modal.querySelector('#fa-error');
    submitBtn.disabled = true;
    submitBtn.innerHTML = `${icon('clock', 14)} Processing…`;
    errEl.style.display = 'none';
    try {
      const res = await apiPost(`/supervisor/final-accept/${interestId}`, { coordinator_note: note });
      if (res?.success) {
        close();
        showToast(res.message || 'Student approved for OJT!', 'success');
        const refreshed = await apiGetFresh(`/supervisor/posting/${slot.id}/applications`).catch(() => null);
        const newStudents = (refreshed?.success && Array.isArray(refreshed.data)) ? refreshed.data : students.map(s => String(s.id) === String(interestId) ? { ...s, status: 'accepted' } : s);
        const countEl = bd.querySelector('#int-app-count');
        if (countEl) countEl.textContent = newStudents.length;

        const updatedAllInterests = allInterests.map(i =>
          String(i.id) === String(interestId) ? { ...i, status: 'accepted' } : i
        );
        allInterests = updatedAllInterests;
        onUpdate?.(updatedAllInterests);

        renderApplicationsBody(body, newStudents, slot, bd, allInterests, onUpdate);

        apiCache.invalidate([
          '/supervisor/interests*',
          `/supervisor/posting/${slot.id}/applications*`,
          '/supervisor/dashboard*',
          '/supervisor/trainees*',
          '/supervisor/analytics*'
        ]);
      } else {
        errEl.textContent = res?.message || 'Failed to approve student.';
        errEl.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.innerHTML = `${icon('checkCircle', 14)} Confirm OJT Approval`;
      }
    } catch {
      errEl.textContent = 'Network error. Please try again.';
      errEl.style.display = 'block';
      submitBtn.disabled = false;
      submitBtn.innerHTML = `${icon('checkCircle', 14)} Confirm OJT Approval`;
    }
  });
}

// ── Skeleton Placeholder ─────────────────────────────────────────────────────
function skeletonGrid(n) {
  return `<div class="ojts-grid">${Array(n).fill(`
    <div class="ojts-card" style="pointer-events:none;">
      <div style="padding:18px 20px;">
        <div style="display:flex;gap:12px;align-items:flex-start;margin-bottom:12px;">
          <div class="skeleton" style="width:44px;height:44px;border-radius:10px;flex-shrink:0;"></div>
          <div style="flex:1;">
            <div class="skeleton skeleton--text" style="width:70%;margin-bottom:6px;"></div>
            <div class="skeleton skeleton--text-sm" style="width:40%;"></div>
          </div>
        </div>
        <div style="display:flex;gap:6px;margin-bottom:12px;">
          <div class="skeleton" style="height:22px;width:90px;border-radius:99px;"></div>
          <div class="skeleton" style="height:22px;width:70px;border-radius:99px;"></div>
        </div>
        <div class="skeleton skeleton--text-sm" style="width:100%;margin-bottom:4px;"></div>
        <div class="skeleton skeleton--text-sm" style="width:75%;"></div>
      </div>
      <div style="padding:14px 20px;border-top:1px solid var(--border-default);display:flex;justify-content:space-between;align-items:center;">
        <div class="skeleton" style="height:22px;width:100px;border-radius:99px;"></div>
        <div class="skeleton" style="height:28px;width:80px;border-radius:6px;"></div>
      </div>
    </div>
  `).join('')}</div>`;
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function showToast(message, type = 'success') {
  const iconName = type === 'success' ? 'checkCircle' : 'alertCircle';
  const t = document.createElement('div');
  t.className = `toast toast--${type} toast--visible`;
  t.innerHTML = `${icon(iconName, 16)} <span>${message}</span>`;
  document.body.appendChild(t);
  setTimeout(() => { t.classList.remove('toast--visible'); setTimeout(() => t.remove(), 300); }, 3500);
}
