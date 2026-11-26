/* ===========================
   OJT Management — Supervisor Portal
   Clean, Neat, Executive Redesign
   =========================== */

import { icon } from '../components/icons.js';
import { apiFetch, apiGet, apiGetFresh, apiPost, apiUpload, apiCache } from '../api/client.js';
import { getState } from '../store.js';
import { openAssignRequirementsModal, openReviewRequirementsModal } from '../components/requirements-modal.js';
import { openScheduleRequestModal } from '../components/schedule-request-modal.js';

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
          <input type="text" id="ojts-search-input" class="ojts-search-input" placeholder="Search by job position, host company, or course program..." autocomplete="off" />
          <button type="button" id="ojts-search-clear" class="ojts-search-clear" style="display:none;" aria-label="Clear search" title="Clear search">
            ${icon('x', 14)}
          </button>
        </div>

        <!-- Registered Company Filter Dropdown (Strictly Registered Companies in System) -->
        <div class="ojts-company-select-wrap">
          <span class="ojts-select-icon">${icon('building', 14)}</span>
          <select id="ojts-company-filter" class="ojts-select" title="Filter by Registered Host Company">
            <option value="">All Registered Companies</option>
          </select>
        </div>

        <!-- Status Filter Tabs with Live Count Badges (Including 5th Closed/Full Tab) -->
        <div class="ojts-filter-tabs" id="ojts-filter-tabs">
          <button class="ojts-filter-btn ojts-filter-btn--active" data-filter="all">
            All Listings <span class="ojts-tab-pill" id="tab-cnt-all">0</span>
          </button>
          <button class="ojts-filter-btn" data-filter="pending" id="ojts-filter-pending-btn">
            ${icon('clock', 12)} Action Required <span class="ojts-tab-pill ojts-tab-pill--warn" id="tab-cnt-pending">0</span>
          </button>
          <button class="ojts-filter-btn" data-filter="open">
            Open <span class="ojts-tab-pill ojts-tab-pill--green" id="tab-cnt-open">0</span>
          </button>
          <button class="ojts-filter-btn" data-filter="filling_up">
            Filling Up <span class="ojts-tab-pill ojts-tab-pill--fill" id="tab-cnt-filling">0</span>
          </button>
          <button class="ojts-filter-btn" data-filter="closed">
            Closed / Full <span class="ojts-tab-pill ojts-tab-pill--closed" id="tab-cnt-closed">0</span>
          </button>
        </div>

        <button type="button" class="btn btn--ghost btn--sm" id="ojts-reset-filters" style="display:none;font-size:0.8rem;gap:4px;padding:6px 12px;color:#b91c1c;" title="Reset all search and filter options">
          ${icon('x', 13)} Reset Filters
        </button>
      </div>

      <!-- Active Filter Summary Context Strip -->
      <div id="ojts-filter-summary" class="ojts-filter-active-summary" style="display:none;"></div>

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

  // Load registered companies: /supervisor/companies → fallback to /chat/companies
  let registeredCompanies = [];
  try {
    const cRes = await apiGet('/supervisor/companies');
    if (cRes?.success && Array.isArray(cRes.data)) {
      registeredCompanies = cRes.data;
    }
  } catch {}

  if (!registeredCompanies.length) {
    try {
      const cRes = await apiGet('/chat/companies');
      if (Array.isArray(cRes?.data)) {
        registeredCompanies = cRes.data;
      }
    } catch {}
  }

  if (!container || !document.contains(container)) return;
  updateStats(container, slots, interests);
  setupFiltersAndRender(container, slots, interests, registeredCompanies);
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function getSlotMetrics(slot, interests) {
  const si = interests.filter(i => String(i.slotId ?? i.posting?.id ?? i.ojt_posting_id) === String(slot.id));
  const pendingLetters   = si.filter(i => i.status === 'endorsement_requested').length;
  const pendingApprovals = si.filter(i => i.status === 'company_accepted').length;
  const activeOrPlaced   = si.filter(i => ['company_accepted', 'accepted', 'ojt_confirmed', 'ojt_started'].includes(i.status)).length;
  const slotsTotal       = Number(slot.slots_total || slot.slots || 0);

  let slotsLeft = slot.slots_remaining !== undefined && slot.slots_remaining !== null
    ? Number(slot.slots_remaining)
    : (slotsTotal ? Math.max(0, slotsTotal - activeOrPlaced) : null);
  if (slotsTotal > 0 && activeOrPlaced > 0 && (slotsLeft === null || slotsLeft >= slotsTotal)) {
    slotsLeft = Math.max(0, slotsTotal - activeOrPlaced);
  }
  if (slotsTotal > 0 && slotsLeft !== null && (slotsTotal - slotsLeft) < activeOrPlaced) {
    slotsLeft = Math.max(0, slotsTotal - activeOrPlaced);
  }

  const hasActionRequired = (pendingLetters > 0 || pendingApprovals > 0);
  const isClosed = slot.status === 'closed' || (slotsTotal > 0 && slotsLeft === 0);
  const isFillingUp = !isClosed && (slot.status === 'filling_up' || (slotsTotal > 0 && slotsLeft !== null && slotsLeft > 0 && slotsLeft <= 2 && (slotsTotal - slotsLeft) > 0));
  const isOpen = !isClosed && !isFillingUp && (slot.status === 'open' || !slot.status || slotsLeft === null || slotsLeft > 2);

  return {
    si,
    pendingLetters,
    pendingApprovals,
    hasActionRequired,
    slotsTotal,
    slotsLeft,
    isOpen,
    isFillingUp,
    isClosed,
  };
}

// ── Stats ────────────────────────────────────────────────────────────────────
function updateStats(container, slots, interests) {
  if (!container) return;
  const stListings = container.querySelector('#st-listings');
  const stTotal    = container.querySelector('#st-total');
  const stPending  = container.querySelector('#st-pending');
  const stRecd     = container.querySelector('#st-recommended');

  const pendingInterests = interests.filter(i => i.status === 'endorsement_requested' || i.status === 'company_accepted');

  if (stListings) stListings.textContent = slots.filter(s => !getSlotMetrics(s, interests).isClosed).length;
  if (stTotal)    stTotal.textContent    = interests.length;
  if (stPending)  stPending.textContent  = pendingInterests.length;
  if (stRecd)     stRecd.textContent     = interests.filter(i => i.status === 'endorsed' || i.status === 'ojt_started' || i.status === 'accepted' || i.status === 'ojt_confirmed').length;
}

// ── Search and Filter Handling ───────────────────────────────────────────────
function setupFiltersAndRender(container, slots, interests, registeredCompanies = []) {
  const body = (container && container.querySelector('#int-body')) || document.getElementById('int-body');
  if (!body) return;

  const searchInput    = (container && container.querySelector('#ojts-search-input')) || document.getElementById('ojts-search-input');
  const searchClearBtn = (container && container.querySelector('#ojts-search-clear')) || document.getElementById('ojts-search-clear');
  const companySelect  = (container && container.querySelector('#ojts-company-filter')) || document.getElementById('ojts-company-filter');
  const filterTabs     = container ? container.querySelectorAll('.ojts-filter-btn') : document.querySelectorAll('.ojts-filter-btn');
  const resetBtn       = (container && container.querySelector('#ojts-reset-filters')) || document.getElementById('ojts-reset-filters');
  const filterSummary  = (container && container.querySelector('#ojts-filter-summary')) || document.getElementById('ojts-filter-summary');

  let currentFilter     = 'all';
  let searchQuery       = '';
  let selectedCompanyId = '';

  // Populate registered company filter dropdown
  if (companySelect && registeredCompanies.length) {
    const prevVal = companySelect.value;
    const compOptions = registeredCompanies.map(c => {
      const compNameLower = (c.name || '').toLowerCase().trim();
      const count = slots.filter(s => {
        const matchId = s.company_user_id !== undefined && s.company_user_id !== null && String(s.company_user_id) === String(c.id);
        const matchName = compNameLower && (s.company || s.company_name || '').toLowerCase().trim() === compNameLower;
        return matchId || matchName;
      }).length;
      return { ...c, count };
    });

    compOptions.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

    companySelect.innerHTML = `
      <option value="">All Registered Companies (${registeredCompanies.length})</option>
      ${compOptions.map(c => `
        <option value="${c.id}">${c.name} (${c.count} listing${c.count === 1 ? '' : 's'})</option>
      `).join('')}
    `;
    if (prevVal) companySelect.value = prevVal;
  }

  function updateTabCounts(targetSlots) {
    let allCnt = targetSlots.length;
    let pendingCnt = 0;
    let openCnt = 0;
    let fillingCnt = 0;
    let closedCnt = 0;

    targetSlots.forEach(s => {
      const m = getSlotMetrics(s, interests);
      if (m.hasActionRequired) pendingCnt++;
      if (m.isOpen) openCnt++;
      if (m.isFillingUp) fillingCnt++;
      if (m.isClosed) closedCnt++;
    });

    const cAll    = (container && container.querySelector('#tab-cnt-all')) || document.getElementById('tab-cnt-all');
    const cPend   = (container && container.querySelector('#tab-cnt-pending')) || document.getElementById('tab-cnt-pending');
    const cOpen   = (container && container.querySelector('#tab-cnt-open')) || document.getElementById('tab-cnt-open');
    const cFill   = (container && container.querySelector('#tab-cnt-filling')) || document.getElementById('tab-cnt-filling');
    const cClosed = (container && container.querySelector('#tab-cnt-closed')) || document.getElementById('tab-cnt-closed');

    if (cAll)    cAll.textContent = allCnt;
    if (cPend)   cPend.textContent = pendingCnt;
    if (cOpen)   cOpen.textContent = openCnt;
    if (cFill)   cFill.textContent = fillingCnt;
    if (cClosed) cClosed.textContent = closedCnt;
  }

  function resetAllFilters() {
    currentFilter = 'all';
    searchQuery = '';
    selectedCompanyId = '';
    if (searchInput) searchInput.value = '';
    if (companySelect) companySelect.value = '';
    filterTabs.forEach(b => {
      b.classList.toggle('ojts-filter-btn--active', b.dataset.filter === 'all');
    });
    applyFilter();
  }

  function applyFilter() {
    const currentBody = (container && container.querySelector('#int-body')) || document.getElementById('int-body');
    if (!currentBody) return;

    // 1. Filter by Company (Strictly matches registered company ID or name)
    let baseList = [...slots];
    if (selectedCompanyId) {
      const compObj = registeredCompanies.find(c => String(c.id) === String(selectedCompanyId));
      const targetCompName = compObj?.name?.toLowerCase().trim();
      baseList = baseList.filter(s => {
        const matchesId = s.company_user_id !== undefined && s.company_user_id !== null && String(s.company_user_id) === String(selectedCompanyId);
        const compName = (s.company || s.company_name || '').toLowerCase().trim();
        const matchesName = targetCompName && compName === targetCompName;
        return matchesId || matchesName;
      });
    }

    // 2. Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      baseList = baseList.filter(s => {
        const title   = (s.slotTitle || s.title || '').toLowerCase();
        const company = (s.company || s.company_name || '').toLowerCase();
        const dept    = (s.department || '').toLowerCase();
        const loc     = (s.location || '').toLowerCase();
        const sched   = (s.schedule_type || s.schedule || '').toLowerCase();
        const courses = Array.isArray(s.preferred_courses)
          ? s.preferred_courses.join(' ').toLowerCase()
          : (s.preferred_courses || s.preferredCourse || '').toLowerCase();
        return title.includes(q) || company.includes(q) || dept.includes(q) || loc.includes(q) || sched.includes(q) || courses.includes(q);
      });
    }

    // Update live pill counts based on current search & company scope
    updateTabCounts(baseList);

    // 3. Filter by Status Tab
    let filtered = [...baseList];
    if (currentFilter === 'pending') {
      filtered = filtered.filter(s => getSlotMetrics(s, interests).hasActionRequired);
    } else if (currentFilter === 'open') {
      filtered = filtered.filter(s => getSlotMetrics(s, interests).isOpen);
    } else if (currentFilter === 'filling_up') {
      filtered = filtered.filter(s => getSlotMetrics(s, interests).isFillingUp);
    } else if (currentFilter === 'closed') {
      filtered = filtered.filter(s => getSlotMetrics(s, interests).isClosed);
    }

    // Update Clear button & Reset button states
    const hasActiveFilters = !!(searchQuery.trim() || selectedCompanyId || currentFilter !== 'all');
    if (resetBtn) resetBtn.style.display = hasActiveFilters ? 'inline-flex' : 'none';
    if (searchClearBtn) searchClearBtn.style.display = searchQuery.trim() ? 'inline-flex' : 'none';

    // Update Contextual Active Filter Summary Strip
    if (filterSummary) {
      if (hasActiveFilters) {
        const compObj = registeredCompanies.find(c => String(c.id) === String(selectedCompanyId));
        const parts = [];
        if (selectedCompanyId && compObj) {
          parts.push(`Company: <strong>${compObj.name}</strong>`);
        }
        if (currentFilter !== 'all') {
          const tabLabels = {
            pending: 'Action Required',
            open: 'Open',
            filling_up: 'Filling Up',
            closed: 'Closed / Full',
          };
          parts.push(`Status: <strong>${tabLabels[currentFilter] || currentFilter}</strong>`);
        }
        if (searchQuery.trim()) {
          parts.push(`Search: &ldquo;<strong>${searchQuery.trim()}</strong>&rdquo;`);
        }

        filterSummary.innerHTML = `
          <span>Showing <strong>${filtered.length}</strong> of <strong>${slots.length}</strong> listings (${parts.join(' &bull; ')})</span>
          <button type="button" id="ojts-summary-clear-btn" style="color:#0284C7;text-decoration:underline;cursor:pointer;padding:0;background:none;border:none;font-size:0.75rem;font-weight:600;">Clear all</button>
        `;
        filterSummary.style.display = 'flex';
        filterSummary.querySelector('#ojts-summary-clear-btn')?.addEventListener('click', () => {
          resetAllFilters();
        });
      } else {
        filterSummary.style.display = 'none';
        filterSummary.innerHTML = '';
      }
    }

    renderGrid(currentBody, filtered, interests, container, registeredCompanies, resetAllFilters);
  }

  // Event Listeners
  if (searchInput) {
    searchInput.oninput = (e) => {
      searchQuery = e.target.value;
      applyFilter();
    };
  }

  if (searchClearBtn) {
    searchClearBtn.onclick = () => {
      searchQuery = '';
      if (searchInput) searchInput.value = '';
      applyFilter();
    };
  }

  if (companySelect) {
    companySelect.onchange = (e) => {
      selectedCompanyId = e.target.value;
      applyFilter();
    };
  }

  if (resetBtn) {
    resetBtn.onclick = () => {
      resetAllFilters();
    };
  }

  filterTabs.forEach(btn => {
    btn.onclick = () => {
      filterTabs.forEach(b => b.classList.remove('ojts-filter-btn--active'));
      btn.classList.add('ojts-filter-btn--active');
      currentFilter = btn.dataset.filter;
      applyFilter();
    };
  });

  applyFilter();
}

// ── Slot Grid ────────────────────────────────────────────────────────────────
function renderGrid(body, slots, interests, container, registeredCompanies = [], resetAllFilters = null) {
  if (!body) return;
  if (!slots.length) {
    body.innerHTML = `
      <div class="ojts-empty">
        <div class="ojts-empty__icon">${icon('briefcase', 32)}</div>
        <h3 class="ojts-empty__title">No OJT Listings Found</h3>
        <p class="ojts-empty__text">No partner listings matched your current search or filter criteria.</p>
        <button type="button" class="btn btn--outline btn--sm" id="ojts-empty-reset" style="margin-top:14px;gap:6px;">
          ${icon('x', 13)} Reset Filters
        </button>
      </div>`;
    body.querySelector('#ojts-empty-reset')?.addEventListener('click', () => {
      if (resetAllFilters) resetAllFilters();
    });
    return;
  }

  const STATUS_CFG = {
    open:       { label: 'Open',          color: '#059669', bg: '#05966914' },
    filling_up: { label: 'Filling Up',    color: '#D97706', bg: '#D9770614' },
    closed:     { label: 'Closed / Full', color: '#64748B', bg: '#64748B14' },
  };

  body.innerHTML = `<div class="ojts-grid">
    ${slots.map(slot => {
      const m          = getSlotMetrics(slot, interests);
      let statusKey    = 'open';
      if (m.isClosed) statusKey = 'closed';
      else if (m.isFillingUp) statusKey = 'filling_up';

      const sc         = STATUS_CFG[statusKey] || STATUS_CFG.open;
      const initial    = slot.companyInitial || slot.company_name?.[0] || slot.company?.[0] || '?';
      const title      = slot.slotTitle  || slot.title       || 'OJT Position';
      const company    = slot.company    || slot.company_name || 'Partner Company';
      const dept       = slot.department || 'General';
      const dur        = slot.duration   || '3 months';
      const loc        = (slot.location  || '—').split(',')[0];
      const desc       = slot.description || slot.tasks || '';
      const rawCourse  = Array.isArray(slot.preferred_courses) ? slot.preferred_courses[0] : (slot.preferred_courses || slot.preferredCourse || '');
      const sched      = slot.schedule_type === 'half_day' ? 'Half Day' : slot.schedule_type === 'full_day' ? 'Full Day' : (slot.schedule || '');

      const si            = m.si;
      const pending       = m.pendingLetters;
      const pendingAccept = m.pendingApprovals;
      const recd          = si.filter(i => i.status === 'recommended' || i.status === 'endorsed').length;
      const slotsTotal    = m.slotsTotal;
      const slotsLeft     = m.slotsLeft;

      const slotsUsed     = slotsTotal ? Math.max(0, slotsTotal - (slotsLeft !== null ? slotsLeft : 0)) : 0;
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
            <span style="color:#D97706;font-size:0.73rem;font-weight:700;">UPLOAD &rarr;</span>
          </div>
          ` : ''}

          ${hasUrgentApproval ? `
          <div class="ojts-card__alert-banner ojts-card__alert-banner--approve" data-action="approve">
            <span style="display:flex;align-items:center;gap:6px;">
              ${icon('checkCircle', 13)}
              <strong>${pendingAccept} ${pendingAccept === 1 ? 'student awaits' : 'students await'} final OJT approval</strong>
            </span>
            <span style="color:#059669;font-size:0.73rem;font-weight:700;">APPROVE &rarr;</span>
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
      const m = getSlotMetrics(slot, interests);
      const initialTab = (isActionClick && m.hasActionRequired) ? 'applications' : 'details';

      showInterestedModal(slot, interests, updated => {
        interests = updated;
        updateStats(container, slots, interests);
        setupFiltersAndRender(container, slots, interests, registeredCompanies);
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
              <button type="button" class="btn btn--outline btn--sm" id="ojts-modal-chat-company-btn" style="gap:6px;color:#0284c7;border-color:rgba(2,132,199,0.35);font-size:0.78rem;" title="Message ${company}">
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
              <button type="button" class="btn btn--outline btn--sm ojts-contact-chat-btn" style="gap:6px;color:#0284c7;border-color:rgba(2,132,199,0.35);font-size:0.78rem;">
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

  function endorsementSectionHdr(label, count) {
    return `
      <div class="ojts-stage-header" style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">
        <div style="display:flex;align-items:center;gap:8px;">
          <label style="display:inline-flex;align-items:center;gap:6px;cursor:pointer;margin:0;font-size:0.77rem;font-weight:600;color:var(--text-secondary);" title="Select all eligible students for batch endorsement">
            <input type="checkbox" id="ojts-select-all-endorsements" class="ojts-card-checkbox" />
            <span>Select All (${count})</span>
          </label>
          <span style="color:var(--border-default);font-size:0.8rem;">|</span>
          <span class="ojts-stage-title">${label}</span>
          <span class="ojts-stage-count">${count}</span>
        </div>
        <div style="font-size:0.72rem;color:var(--text-tertiary);">
          Tip: Check trainees to batch send endorsements
        </div>
      </div>`;
  }

  const selectedInterestIds = new Set();

  // 1. Endorsement Letter Requested (Priority Action)
  if ((activeFilter === 'all' || activeFilter === 'action') && endorsementRequested.length) {
    if (endorsementRequested.length > 1) {
      html += endorsementSectionHdr(`${icon('mail', 13)} Endorsement Letter Requested`, endorsementRequested.length);
    } else {
      html += sectionHdr(`${icon('mail', 13)} Endorsement Letter Requested`, endorsementRequested.length);
    }
    endorsementRequested.forEach(s => { html += studentDetailCard(s, 'endorsement_requested', selectedInterestIds.has(String(s.id))); });
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

  // Batch Endorsement Sync & Action Bar Management
  const selectAllChk = body.querySelector('#ojts-select-all-endorsements');

  function updateBatchBar() {
    if (selectAllChk && endorsementRequested.length) {
      const totalEligible = endorsementRequested.length;
      const countSelected = endorsementRequested.filter(s => selectedInterestIds.has(String(s.id))).length;
      selectAllChk.checked = countSelected === totalEligible && totalEligible > 0;
      selectAllChk.indeterminate = countSelected > 0 && countSelected < totalEligible;
    }

    let batchBar = body.querySelector('#ojts-batch-action-bar');
    const n = selectedInterestIds.size;
    if (n > 0) {
      if (!batchBar) {
        batchBar = document.createElement('div');
        batchBar.id = 'ojts-batch-action-bar';
        batchBar.className = 'ojts-batch-action-bar';
        body.appendChild(batchBar);
      }
      batchBar.innerHTML = `
        <div class="ojts-batch-bar__left">
          <span class="ojts-batch-bar__badge">${n}</span>
          <span class="ojts-batch-bar__label">${n === 1 ? '1 trainee selected' : `${n} trainees selected`}</span>
          <button type="button" class="ojts-batch-bar__clear" id="ojts-batch-clear-btn">Clear selection</button>
        </div>
        <div class="ojts-batch-bar__right">
          <button type="button" class="btn btn--primary ojts-batch-bar__action-btn" id="ojts-batch-endorse-btn">
            ${icon('send', 14)} Batch Endorse (${n})
          </button>
        </div>
      `;

      batchBar.querySelector('#ojts-batch-clear-btn')?.addEventListener('click', () => {
        selectedInterestIds.clear();
        body.querySelectorAll('.ojts-endorse-check').forEach(c => { c.checked = false; });
        body.querySelectorAll('.ojts-candidate-card--selected').forEach(c => { c.classList.remove('ojts-candidate-card--selected'); });
        if (selectAllChk) { selectAllChk.checked = false; selectAllChk.indeterminate = false; }
        batchBar.remove();
      });

      batchBar.querySelector('#ojts-batch-endorse-btn')?.addEventListener('click', () => {
        showBatchEndorsementModal(Array.from(selectedInterestIds), slot, students, body, bd, allInterests, onUpdate);
      });
    } else {
      batchBar?.remove();
    }
  }

  // Individual card checkboxes
  body.querySelectorAll('.ojts-endorse-check').forEach(chk => {
    chk.addEventListener('change', () => {
      const id = String(chk.dataset.id);
      const card = body.querySelector(`.ojts-candidate-card[data-id="${id}"]`);
      if (chk.checked) {
        selectedInterestIds.add(id);
        card?.classList.add('ojts-candidate-card--selected');
      } else {
        selectedInterestIds.delete(id);
        card?.classList.remove('ojts-candidate-card--selected');
      }
      updateBatchBar();
    });
  });

  // Select-All checkbox
  selectAllChk?.addEventListener('change', () => {
    const isChecked = selectAllChk.checked;
    endorsementRequested.forEach(s => {
      const id = String(s.id);
      const card = body.querySelector(`.ojts-candidate-card[data-id="${id}"]`);
      const cardChk = body.querySelector(`.ojts-endorse-check[data-id="${id}"]`);
      if (isChecked) {
        selectedInterestIds.add(id);
        card?.classList.add('ojts-candidate-card--selected');
        if (cardChk) cardChk.checked = true;
      } else {
        selectedInterestIds.delete(id);
        card?.classList.remove('ojts-candidate-card--selected');
        if (cardChk) cardChk.checked = false;
      }
    });
    updateBatchBar();
  });

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

  // Request OJT Schedule from Company button
  body.querySelectorAll('.btn--request-schedule').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = String(btn.dataset.id);
      const s = students.find(item => String(item.id) === id);
      if (!s || !s.student) return;
      const mapped = {
        id: s.student.id,
        name: s.student.name,
        company: slot?.company_name || s.posting?.company_name || 'Host Company',
        company_user_id: slot?.company_user_id || s.posting?.company_user_id || null,
        hasPlacement: true,
        interest_status: s.status,
        has_confirmed_schedule: Boolean(s.has_confirmed_schedule),
        schedule_status: s.schedule_status || (s.has_confirmed_schedule ? 'confirmed' : 'not_set'),
        schedule_request: s.schedule_request || null,
      };
      openScheduleRequestModal({
        students: [mapped],
        onRequested: async (res) => {
          showToast(res?.message || 'OJT schedule request sent to host company!', 'success');
          const refreshed = await apiGetFresh(`/supervisor/posting/${slot.id}/applications`).catch(() => null);
          if (refreshed?.success && Array.isArray(refreshed.data)) {
            renderApplicationsBody(body, refreshed.data, slot, bd, allInterests, onUpdate, activeFilter);
          }
          if (typeof onUpdate === 'function') onUpdate();
        },
      });
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

function studentDetailCard(s, state, isSelected = false) {
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
    if (interviewType === 'waived') {
      badgeHtml = `<span class="ojts-badge ojts-badge--urgent-good" style="background:rgba(0,89,48,0.1);color:#005930;border:1px solid rgba(0,89,48,0.25);"><span class="ojts-pulse-dot ojts-pulse-dot--green" style="width:5px;height:5px;"></span> Direct Placement · Approval Required</span>`;
    } else {
      badgeHtml = `<span class="ojts-badge ojts-badge--urgent-good"><span class="ojts-pulse-dot ojts-pulse-dot--green" style="width:5px;height:5px;"></span> Company Accepted · Approval Required</span>`;
    }
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

  const checkboxHtml = isUrgent ? `
    <label class="ojts-card-checkbox-label" title="Select ${escHtml(name)} for batch endorsement">
      <input type="checkbox" class="ojts-card-checkbox ojts-endorse-check" data-id="${s.id}" data-name="${escHtml(name)}" ${isSelected ? 'checked' : ''} />
    </label>
  ` : '';

  return `
    <div class="ojts-candidate-card${state === 'declined' ? ' ojts-candidate-card--declined' : ''}${isUrgent ? ' ojts-candidate-card--urgent' : ''}${isApprovalUrgent ? ' ojts-candidate-card--approval-urgent' : ''}${isSelected ? ' ojts-candidate-card--selected' : ''}" data-id="${s.id}">
      <!-- Header Row: Avatar, Name, Program, Status Badge & Action -->
      <div class="ojts-candidate-card__head">
        <div class="ojts-candidate-card__head-left">
          ${checkboxHtml}
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
          ${st.id && ['coordinator_approved', 'ojt_confirmed', 'ojt_active', 'accepted'].includes(state) ? `
            <button class="ojts-candidate-card__msg-btn btn--request-schedule" data-id="${s.id}" style="${s.has_confirmed_schedule ? '' : 'color:#b45309;border-color:rgba(217,119,6,0.4);background:rgba(245,158,11,0.08);'}" title="${s.has_confirmed_schedule ? 'Request schedule update from company' : 'Ask host company for student OJT schedule'}">
              ${icon('calendar', 13)} ${s.has_confirmed_schedule ? 'Update Sched' : (s.schedule_status === 'requested' ? 'Remind Sched' : 'Ask Schedule')}
            </button>
          ` : ''}
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
          <span style="font-weight:600;font-size:0.78rem;color:${
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
          ${latestReq?.items?.length ? `<span style="font-size:0.75rem;color:var(--text-tertiary);">(${latestReq.items.length} items)</span>` : ''}
        </div>
        <div style="display:flex;align-items:center;gap:8px;">
          ${driveUrl ? `
            <a href="${driveUrl}" target="_blank" rel="noopener" style="font-size:0.77rem;color:#0284c7;text-decoration:underline;font-weight:600;display:inline-flex;align-items:center;gap:3px;">
              ${icon('externalLink', 11)} Cloud Drive
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
            style="background:none;border:none;color:#005930;font-size:0.77rem;font-weight:700;cursor:pointer;padding:2px 6px;text-decoration:underline;">
            ${latestReq ? (latestReq.status === 'submitted' ? 'Review Submission' : 'Manage / Review') : '+ Assign Requirements'}
          </button>
        </div>
      </div>

      <!-- Candidate Cover Note / Student Message (if provided) -->
      ${msg ? `
      <p class="ojts-candidate-card__quote">&ldquo;${msg}&rdquo;</p>
      ` : ''}

      <!-- Context Box: Direct Placement or Scheduled Interview Details -->
      ${interviewType === 'waived' ? `
      <div class="ojts-candidate-card__context-box" style="background:rgba(0,89,48,0.05);border-color:rgba(0,89,48,0.18);">
        <div class="ojts-candidate-card__context-row">
          <span style="font-weight:700;color:#005930;display:inline-flex;align-items:center;gap:4px;">${icon('award', 12)} Direct Placement:</span>
          <span style="color:#005930;font-size:0.77rem;">Interview waived by host company based on endorsement & academic evaluation.</span>
        </div>
        ${companyNote ? `<div style="font-style:italic;color:var(--text-secondary);margin-top:2px;">Company Welcome Note: &ldquo;${companyNote}&rdquo;</div>` : ''}
      </div>
      ` : (interviewAt ? `
      <div class="ojts-candidate-card__context-box">
        <div class="ojts-candidate-card__context-row">
          <span style="font-weight:600;color:var(--text-primary);">${icon('calendar', 12)} Interview:</span>
          <span>${interviewAt}</span>
          ${interviewLocation ? `<span>· ${icon('mapPin', 11)} ${interviewLocation}</span>` : ''}
        </div>
        ${companyNote ? `<div style="font-style:italic;color:var(--text-secondary);margin-top:2px;">Company Note: &ldquo;${companyNote}&rdquo;</div>` : ''}
      </div>
      ` : '')}

      <!-- Context Box: Confirmed OJT Start Date -->
      ${ojtStartDate ? `
      <div class="ojts-candidate-card__context-box">
        <div class="ojts-candidate-card__context-row">
          <span style="font-weight:600;color:var(--text-primary);">${icon('calendar', 12)} Start Date:</span>
          <span>${ojtStartDate}</span>
          ${s.estimated_end_date ? `<span style="margin-left:auto;color:#005930;font-weight:600;">Target End: ${s.estimated_end_date}</span>` : ''}
        </div>
        ${Array.isArray(s.schedule_days) && s.schedule_days.length ? `
        <div style="font-size:0.76rem;color:var(--text-secondary);margin-top:3px;display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
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

// ── Helper: Resolve College & Department by Program ─────────────────────────
function resolveCollegeAndDept(program) {
  const p = (program || '').toLowerCase();
  if (p.includes('information technology') || p.includes('computer science') || p.includes('information systems') || p.includes('bsit') || p.includes('bscs') || p.includes('bsis')) {
    let department = 'Department of Information Technology';
    if (p.includes('information systems') || p.includes('bsis')) {
      department = 'Department of Information Systems';
    } else if (p.includes('computer science') || p.includes('bscs')) {
      department = 'Department of Computer Science';
    }
    return {
      college: 'College of Computer Studies',
      department,
    };
  }
  if (p.includes('engineering') || p.includes('cpe') || p.includes('ece')) {
    let department = 'Department of Computer Engineering';
    if (p.includes('electronics')) {
      department = 'Department of Electronics Engineering';
    }
    return {
      college: 'College of Engineering',
      department,
    };
  }
  if (p.includes('industrial technology') || p.includes('automotive') || p.includes('drafting') || p.includes('mechanical') || p.includes('food trades')) {
    return {
      college: 'College of Industrial Technology',
      department: 'Department of Industrial Technology',
    };
  }
  if (p.includes('business') || p.includes('accountancy') || p.includes('hospitality') || p.includes('management')) {
    return {
      college: 'College of Business Management and Accountancy',
      department: 'Department of Business Administration',
    };
  }
  if (p.includes('teacher education') || p.includes('btvted') || p.includes('education')) {
    return {
      college: 'College of Education',
      department: 'Department of Technical-Vocational Education',
    };
  }
  return {
    college: 'College of Computer Studies',
    department: 'Department of Information Technology',
  };
}

function resolveCampusAddress(campus) {
  const c = (campus || '').toLowerCase();
  if (c.includes('alijis')) {
    return 'Alijis Campus, Brgy. Alijis, Bacolod City 6100, Negros Occidental &bull; www.chmsu.edu.ph';
  }
  if (c.includes('fortune') || c.includes('towne')) {
    return 'Fortune Towne Campus, Brgy. Estefania, Bacolod City 6100, Negros Occidental &bull; www.chmsu.edu.ph';
  }
  if (c.includes('binalbagan')) {
    return 'Binalbagan Campus, Enclaro, Binalbagan 6107, Negros Occidental &bull; www.chmsu.edu.ph';
  }
  return 'Talisay (Main) Campus, Mabini Street, Talisay City 6115, Negros Occidental &bull; www.chmsu.edu.ph';
}

function escHtml(str = '') {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ── Batch Endorsement Modal ──────────────────────────────────────────────────
function showBatchEndorsementModal(selectedIds, slot, students, body, bd, allInterests, onUpdate) {
  let selectedRecords = students.filter(s => selectedIds.map(String).includes(String(s.id)));
  if (!selectedRecords.length) return;

  const company        = slot.company || slot.company_name || 'Host Partner Company';
  const companyAddress = slot.location || slot.full_address || 'Negros Occidental, Philippines';
  const contactName    = slot.contact_name || 'The Internship Director / Human Resources Management';
  const posting        = slot.title || slot.slotTitle || 'OJT Industry Trainee';
  const duration       = slot.duration || '600 Hours';

  // Supervisor info from local storage
  let supervisorUser = {};
  try { supervisorUser = JSON.parse(localStorage.getItem('hireme_user') || '{}'); } catch {}
  const supervisorName    = supervisorUser?.name || 'Prof. Mariene Labrador';
  const supervisorEmail   = supervisorUser?.email || 'ojt.coordinator@chmsu.edu.ph';
  const supervisorTitle   = supervisorUser?.position || 'OJT Academic Coordinator';
  const supervisorCampus  = supervisorUser?.supervisor_profile?.campus || supervisorUser?.campus || 'Alijis Campus';
  const campusAddressLine = resolveCampusAddress(supervisorCampus);

  const todayDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  let activePreviewIdx = 0;
  const defaultBody = `Carlos Hilado Memorial State University, through the College of Computer Studies and the CIER Internship Directorate, is pleased to officially endorse our qualified bona fide student for deployment in your organization:`;

  const modal = document.createElement('div');
  modal.className = 'modal-backdrop modal-backdrop--visible';
  modal.style.zIndex = '9999';

  function renderModalContent() {
    const activeRec = selectedRecords[activePreviewIdx] || selectedRecords[0];
    const st        = activeRec?.student || {};
    const stName    = st.name || 'Student';
    const stId      = st.student_id || st.studentId || ('CHMSU-' + (st.id || activeRec.id));
    const prog      = st.program || 'Bachelor of Science in Information Technology';
    const sec       = st.section || 'A';
    const yLevel    = st.year_level || st.yearLevel || '4th Year';
    const deptInfo  = resolveCollegeAndDept(prog);
    const refCode   = `CHMSU-CIER-OJT-2026-${String(activeRec.id).padStart(4, '0')}`;

    modal.innerHTML = `
      <div class="modal modal--visible" style="max-width:920px;width:95vw;max-height:92vh;display:flex;flex-direction:column;padding:0;overflow:hidden;border-radius:14px;box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);">
        <!-- Header -->
        <div class="modal__header" style="border-bottom:1px solid var(--border-default);padding:16px 24px;display:flex;align-items:center;justify-content:space-between;background:var(--bg-card);flex-shrink:0;">
          <div style="display:flex;align-items:center;gap:12px;min-width:0;">
            <div style="width:40px;height:40px;border-radius:10px;background:#00593014;color:#005930;display:flex;align-items:center;justify-content:center;flex-shrink:0;">${icon('send', 20)}</div>
            <div style="min-width:0;">
              <h3 class="modal__title" style="margin:0;font-size:1.12rem;font-weight:700;">Batch Endorsement Memorandum</h3>
              <p style="font-size:0.78rem;color:var(--text-secondary);margin:2px 0 0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                <strong>${selectedRecords.length} Trainee(s) Selected</strong> &bull; ${escHtml(company)} &bull; ${escHtml(posting)}
              </p>
            </div>
          </div>
          <button class="modal__close" id="el-batch-close" style="background:none;border:none;cursor:pointer;color:var(--text-tertiary);">${icon('x', 20)}</button>
        </div>

        <!-- Trainee Cohort Roster Strip -->
        <div style="background:#f8fafc;padding:12px 24px;border-bottom:1px solid var(--border-default);flex-shrink:0;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
            <span style="font-size:0.75rem;font-weight:700;color:var(--text-secondary);text-transform:uppercase;letter-spacing:0.04em;">
              Selected Trainee Cohort (${selectedRecords.length}) — Click chip to switch preview:
            </span>
            <span style="font-size:0.72rem;color:var(--text-tertiary);">Previewing: <strong style="color:#005930;">${escHtml(stName)}</strong></span>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;max-height:85px;overflow-y:auto;" id="el-batch-chips">
            ${selectedRecords.map((rec, idx) => {
              const rst = rec.student || {};
              const rname = rst.name || 'Student';
              const rinitials = rname.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
              const isCur = idx === activePreviewIdx;
              return `
                <div class="ojts-roster-pill${isCur ? ' ojts-roster-pill--active' : ''}" style="${isCur ? 'border-color:#005930;background:#ecfdf5;font-weight:700;' : ''}cursor:pointer;" data-idx="${idx}" title="Click to view endorsement preview">
                  <div class="ojts-roster-pill__avatar" style="${isCur ? 'background:#005930;color:#fff;' : ''}">${rinitials}</div>
                  <span style="color:${isCur ? '#005930' : 'inherit'};">${escHtml(rname)}</span>
                  ${selectedRecords.length > 1 ? `<button type="button" class="ojts-roster-pill__remove" data-remove-id="${rec.id}" title="Remove from batch">&times;</button>` : ''}
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Modal Body (Scrollable) -->
        <div class="modal__body" style="flex:1;overflow-y:auto;padding:20px 24px;background:#f1f5f9;">
          <!-- Editor Customization Controls (Shared for Cohort) -->
          <div style="background:#ffffff;border:1px solid var(--border-default);border-radius:10px;padding:16px;margin-bottom:18px;box-shadow:0 1px 3px rgba(0,0,0,0.04);">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
              <span style="font-size:0.78rem;font-weight:700;color:#005930;text-transform:uppercase;letter-spacing:0.05em;display:inline-flex;align-items:center;gap:6px;">
                ${icon('edit3', 13)} Cohort Endorsement Details (Applied to All ${selectedRecords.length} Letters)
              </span>
              <span style="font-size:0.72rem;color:var(--text-tertiary);">Each student receives their official memorandum with personal ref code</span>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:12px;margin-bottom:12px;">
              <div>
                <label style="display:block;font-size:0.76rem;font-weight:600;color:var(--text-secondary);margin-bottom:4px;">
                  Addressee / Recipient (Company Contact)
                </label>
                <input type="text" id="el-input-contact" value="${escHtml(contactName)}" class="form-input" style="width:100%;font-size:0.84rem;padding:7px 10px;border-radius:6px;border:1px solid #cbd5e1;" />
              </div>
              <div>
                <label style="display:block;font-size:0.76rem;font-weight:600;color:var(--text-secondary);margin-bottom:4px;">
                  Special Coordinator Remarks / Instructions (Optional)
                </label>
                <input type="text" id="el-input-notes" placeholder="e.g. Cleared for 600 hours standard OJT. Orientation completed." value="" class="form-input" style="width:100%;font-size:0.84rem;padding:7px 10px;border-radius:6px;border:1px solid #cbd5e1;" />
              </div>
            </div>

            <div>
              <label style="display:block;font-size:0.76rem;font-weight:600;color:var(--text-secondary);margin-bottom:4px;">
                Introductory Endorsement Statement
              </label>
              <textarea id="el-input-body" rows="2" class="form-input" style="width:100%;font-size:0.82rem;padding:8px 10px;border-radius:6px;border:1px solid #cbd5e1;resize:vertical;">${escHtml(defaultBody)}</textarea>
            </div>
          </div>

          <!-- Official Stationery Paper Container (Real-Time Preview) -->
          <div id="el-letter-paper" style="background:#ffffff;border:1.5px solid #cbd5e1;border-radius:8px;padding:32px 36px;box-shadow:0 4px 20px rgba(0,0,0,0.06);font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;color:#1e293b;position:relative;">
            <!-- Top University Accent Bar -->
            <div style="height:4px;background:#005930;border-radius:2px 2px 0 0;margin:-32px -36px 20px -36px;"></div>
            <div style="height:2px;background:#D97706;margin:-20px -36px 24px -36px;"></div>

            <!-- Letterhead -->
            <div style="display:flex;align-items:flex-start;justify-content:space-between;border-bottom:2px solid #005930;padding-bottom:14px;margin-bottom:18px;">
              <div>
                <h2 style="margin:0;font-size:1.18rem;font-weight:800;color:#005930;letter-spacing:-0.01em;">CARLOS HILADO MEMORIAL STATE UNIVERSITY</h2>
                <p style="margin:2px 0 0;font-size:0.83rem;color:#475569;font-weight:600;">Center for Internationalization and External Relations (CIER)</p>
                <p style="margin:2px 0 0;font-size:0.82rem;color:#005930;font-weight:700;">${escHtml(deptInfo.college)} &mdash; ${escHtml(deptInfo.department)}</p>
                <p style="margin:2px 0 0;font-size:0.73rem;color:#64748b;">${campusAddressLine}</p>
              </div>
              <div style="text-align:right;">
                <span style="display:inline-block;padding:3px 8px;background:#ecfdf5;border:1px solid #00593033;border-radius:4px;font-size:0.71rem;font-weight:700;color:#005930;">
                  OFFICIAL ISSUANCE
                </span>
                <p style="margin:4px 0 0;font-size:0.72rem;color:#64748b;">Ref: ${refCode}</p>
              </div>
            </div>

            <!-- Document Title -->
            <div style="text-align:center;margin:16px 0 20px;">
              <h3 style="margin:0;font-size:1.02rem;font-weight:800;color:#005930;letter-spacing:0.04em;text-transform:uppercase;">
                OFFICIAL ENDORSEMENT MEMORANDUM FOR ON-THE-JOB TRAINING
              </h3>
              <p style="margin:4px 0 0;font-size:0.76rem;color:#64748b;">
                Date: <strong>${todayDate}</strong> &nbsp;|&nbsp; Academic Year 2026&ndash;2027
              </p>
            </div>

            <!-- Addressee Block -->
            <div style="margin-bottom:18px;font-size:0.84rem;line-height:1.45;">
              <p style="margin:0;font-weight:700;color:#0f172a;">TO: <span id="el-prev-contact">${escHtml(contactName)}</span></p>
              <p style="margin:1px 0 0;font-weight:700;color:#005930;">${escHtml(company)}</p>
              <p style="margin:1px 0 0;color:#64748b;font-size:0.78rem;">${escHtml(companyAddress)}</p>
            </div>

            <!-- Salutation -->
            <p style="margin:0 0 12px;font-size:0.86rem;font-weight:600;color:#0f172a;">Dear Industry Partner,</p>

            <!-- Paragraph 1 -->
            <p id="el-prev-body" style="margin:0 0 14px;font-size:0.85rem;line-height:1.6;color:#334155;">
              ${escHtml(defaultBody)}
            </p>

            <!-- Trainee Highlight Card -->
            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-left:4px solid #005930;border-radius:6px;padding:12px 16px;margin:0 0 16px;">
              <div id="el-prev-student-name" style="font-size:0.95rem;font-weight:800;color:#005930;margin-bottom:4px;">
                ${escHtml(stName)}
              </div>
              <div id="el-prev-student-sub" style="font-size:0.79rem;color:#334155;line-height:1.5;">
                <strong>Student ID:</strong> ${escHtml(stId)} &nbsp;&bull;&nbsp; <strong>Degree Program:</strong> ${escHtml(prog)}<br>
                <strong>Academic Standing:</strong> ${escHtml(yLevel)} &ndash; Section ${escHtml(sec)} &nbsp;&bull;&nbsp; <strong>Status:</strong> Cleared for Deployment
              </div>
            </div>

            <!-- Paragraph 2 -->
            <p style="margin:0 0 12px;font-size:0.85rem;line-height:1.6;color:#334155;">
              The aforementioned student has successfully completed all university pre-deployment clearances and academic prerequisites. The student is authorized to render a required minimum of <strong>${escHtml(duration)}</strong> of specialized industry training for the position of <strong>&ldquo;${escHtml(posting)}&rdquo;</strong>.
            </p>

            <!-- Paragraph 3 -->
            <p style="margin:0 0 14px;font-size:0.85rem;line-height:1.6;color:#334155;">
              This endorsement is anchored on our active Memorandum of Agreement (MOA). The student has been instructed to observe the utmost professionalism, workplace safety rules, data confidentiality, and your company's operating protocols.
            </p>

            <!-- Real-time Coordinator Remarks Box (if any) -->
            <div id="el-prev-notes-box" style="display:none;background:#fffbeb;border:1px solid #fde68a;border-left:3px solid #D97706;border-radius:6px;padding:8px 12px;margin:0 0 14px;font-size:0.8rem;color:#92400e;">
              <strong>SPECIAL INSTRUCTIONS / REMARKS:</strong> <span id="el-prev-notes-text"></span>
            </div>

            <!-- Paragraph 4 -->
            <p style="margin:0 0 24px;font-size:0.85rem;line-height:1.6;color:#334155;">
              Thank you very much for your continuous partnership and dedication in training our university students.
            </p>

            <!-- Sign-off & Seal Block -->
            <div style="display:flex;align-items:flex-end;justify-content:space-between;border-top:1px dashed #cbd5e1;padding-top:16px;margin-top:20px;">
              <div>
                <p style="margin:0 0 14px;font-size:0.75rem;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;">
                  ENDORSED AND CERTIFIED BY:
                </p>
                <p style="margin:0;font-size:0.98rem;font-weight:800;color:#005930;text-transform:uppercase;">
                  ${escHtml(supervisorName)}
                </p>
                <p style="margin:2px 0 0;font-size:0.78rem;color:#475569;">${escHtml(supervisorTitle)} &ndash; ${escHtml(deptInfo.department)}</p>
                <p style="margin:1px 0 0;font-size:0.76rem;color:#64748b;">${escHtml(deptInfo.college)}, CHMSU (${escHtml(supervisorCampus)})</p>
                <p style="margin:1px 0 0;font-size:0.74rem;color:#64748b;">Email: ${escHtml(supervisorEmail)}</p>
              </div>

              <!-- Digital Stamp Box -->
              <div style="background:#ecfdf5;border:1.5px solid #005930;border-radius:8px;padding:8px 12px;text-align:center;min-width:180px;">
                <span style="font-size:0.73rem;font-weight:800;color:#005930;display:block;">CHMSU CIER ENDORSED</span>
                <span style="font-size:0.69rem;color:#065f46;display:block;">Digitally Verified &bull; Official</span>
                <span style="font-size:0.66rem;color:#64748b;font-family:monospace;display:block;margin-top:2px;">SEC: ${refCode}</span>
              </div>
            </div>
          </div>

          <p id="el-batch-error" style="color:#EF4444;font-size:0.81rem;margin:12px 0 0;display:none;padding:8px 12px;background:#EF444412;border-radius:var(--radius-sm);"></p>
        </div>

        <!-- Footer -->
        <div class="modal__footer" style="border-top:1px solid var(--border-default);padding:14px 24px;display:flex;align-items:center;justify-content:space-between;background:var(--bg-card);flex-shrink:0;">
          <button type="button" class="btn btn--outline" id="el-batch-print" style="gap:6px;font-size:0.82rem;">
            ${icon('printer', 14)} Print Current Preview
          </button>

          <div style="display:flex;align-items:center;gap:8px;">
            <button class="btn btn--outline" id="el-batch-cancel">Cancel</button>
            <button class="btn btn--primary" id="el-batch-submit" style="background:#005930;border-color:#005930;color:#fff;gap:6px;font-weight:700;">
              ${icon('send', 14)} Send ${selectedRecords.length} Endorsement Letters
            </button>
          </div>
        </div>
      </div>
    `;

    // Wire events inside modal
    const closeModal = () => modal.remove();
    modal.querySelector('#el-batch-close')?.addEventListener('click', closeModal);
    modal.querySelector('#el-batch-cancel')?.addEventListener('click', closeModal);

    // Chip click to switch preview
    modal.querySelectorAll('.ojts-roster-pill').forEach(pill => {
      pill.addEventListener('click', (e) => {
        if (e.target.closest('.ojts-roster-pill__remove')) return;
        const idx = parseInt(pill.dataset.idx, 10);
        if (!isNaN(idx) && idx !== activePreviewIdx) {
          activePreviewIdx = idx;
          renderModalContent();
        }
      });
    });

    // Chip remove student
    modal.querySelectorAll('.ojts-roster-pill__remove').forEach(rmBtn => {
      rmBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const rmId = String(rmBtn.dataset.removeId);
        selectedRecords = selectedRecords.filter(r => String(r.id) !== rmId);
        if (!selectedRecords.length) {
          closeModal();
          return;
        }
        if (activePreviewIdx >= selectedRecords.length) {
          activePreviewIdx = 0;
        }
        renderModalContent();
      });
    });

    // Live preview listeners
    const inputContact = modal.querySelector('#el-input-contact');
    const prevContact  = modal.querySelector('#el-prev-contact');
    inputContact?.addEventListener('input', () => {
      prevContact.textContent = inputContact.value.trim() || 'The Internship Director / Human Resources Management';
    });

    const inputBody = modal.querySelector('#el-input-body');
    const prevBody  = modal.querySelector('#el-prev-body');
    inputBody?.addEventListener('input', () => {
      prevBody.textContent = inputBody.value.trim() || defaultBody;
    });

    const inputNotes    = modal.querySelector('#el-input-notes');
    const prevNotesBox  = modal.querySelector('#el-prev-notes-box');
    const prevNotesText = modal.querySelector('#el-prev-notes-text');
    inputNotes?.addEventListener('input', () => {
      const val = inputNotes.value.trim();
      if (val) {
        prevNotesBox.style.display = 'block';
        prevNotesText.textContent = val;
      } else {
        prevNotesBox.style.display = 'none';
      }
    });

    // Print button
    modal.querySelector('#el-batch-print')?.addEventListener('click', () => {
      const paperHtml = modal.querySelector('#el-letter-paper').innerHTML;
      const printWin = window.open('', '_blank', 'width=850,height=950');
      if (printWin) {
        printWin.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Official CHMSU Endorsement Memorandum - ${escHtml(stName)}</title>
              <style>
                @page { size: letter portrait; margin: 15mm; }
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; margin: 0; padding: 20px; line-height: 1.5; background: #fff; }
                @media print { body { padding: 0; } }
              </style>
            </head>
            <body>
              ${paperHtml}
              <script>window.onload = function() { window.print(); };</script>
            </body>
          </html>
        `);
        printWin.document.close();
      }
    });

    // Submit handler
    const submitBtn = modal.querySelector('#el-batch-submit');
    const errEl = modal.querySelector('#el-batch-error');
    submitBtn?.addEventListener('click', async () => {
      errEl.style.display = 'none';
      submitBtn.disabled = true;
      submitBtn.innerHTML = `${icon('clock', 14)} Dispatching ${selectedRecords.length} letters…`;

      const formData = new FormData();
      formData.append('posting_id', slot.id);
      selectedRecords.forEach(r => formData.append('interest_ids[]', r.id));
      const contactVal = inputContact?.value.trim();
      const notesVal   = inputNotes?.value.trim();
      const bodyVal    = inputBody?.value.trim();

      if (contactVal) formData.append('contact_person', contactVal);
      if (notesVal)   formData.append('coordinator_note', notesVal);
      if (bodyVal)    formData.append('custom_body', bodyVal);

      try {
        const res = await apiUpload('/supervisor/interests/batch-endorse', formData);
        if (res?.success) {
          closeModal();
          showToast(res.message || `Successfully sent ${selectedRecords.length} endorsement letters!`, 'success');

          const refreshed = await apiGetFresh(`/supervisor/posting/${slot.id}/applications`).catch(() => null);
          const endorsedIdsSet = new Set(selectedRecords.map(r => String(r.id)));

          const newStudents = (refreshed?.success && Array.isArray(refreshed.data))
            ? refreshed.data
            : students.map(s => endorsedIdsSet.has(String(s.id)) ? { ...s, status: 'endorsed' } : s);

          const countEl = bd.querySelector('#int-app-count');
          if (countEl) countEl.textContent = newStudents.length;

          const updatedAllInterests = allInterests.map(i =>
            endorsedIdsSet.has(String(i.id)) ? { ...i, status: 'endorsed' } : i
          );
          allInterests = updatedAllInterests;
          onUpdate?.(updatedAllInterests);

          apiCache.invalidate([
            '/supervisor/interests*',
            `/supervisor/posting/${slot.id}/applications*`,
            '/supervisor/dashboard*',
          ]);

          renderApplicationsBody(body, newStudents, slot, bd, allInterests, onUpdate);
        } else {
          errEl.textContent = res?.message || 'Failed to dispatch batch endorsement. Please try again.';
          errEl.style.display = 'block';
          submitBtn.disabled = false;
          submitBtn.innerHTML = `${icon('send', 14)} Send ${selectedRecords.length} Endorsement Letters`;
        }
      } catch (err) {
        errEl.textContent = 'Network or server error while dispatching batch. Please check connectivity.';
        errEl.style.display = 'block';
        submitBtn.disabled = false;
        submitBtn.innerHTML = `${icon('send', 14)} Send ${selectedRecords.length} Endorsement Letters`;
      }
    });
  }

  renderModalContent();
  document.body.appendChild(modal);
}

// ── Upload / Dynamic Endorsement Letter Modal ────────────────────────────────
function showEndorsementUploadModal(interestId, slot, students, body, bd, allInterests, onUpdate) {
  const record         = students.find(s => String(s.id) === String(interestId));
  const studentName    = record?.student?.name || 'Student';
  const studentId      = record?.student?.student_id || record?.student?.studentId || ('CHMSU-' + (record?.student?.id || interestId));
  const program        = record?.student?.program || 'Bachelor of Science in Information Technology';
  const section        = record?.student?.section || 'A';
  const yearLevel      = record?.student?.year_level || record?.student?.yearLevel || '4th Year';
  const company        = slot.company || slot.company_name || 'Host Partner Company';
  const companyAddress = slot.location || slot.full_address || 'Negros Occidental, Philippines';
  const contactName    = slot.contact_name || 'The Internship Director / Human Resources Management';
  const posting        = slot.title || slot.slotTitle || 'OJT Industry Trainee';
  const duration       = slot.duration || '600 Hours';
  const hasExisting    = !!record?.endorsement_letter;
  const existingUrl    = record?.endorsement_letter_url || null;

  // Resolve dynamic college & department based on program
  const deptInfo = resolveCollegeAndDept(program);

  // Supervisor info from local storage
  let supervisorUser = {};
  try { supervisorUser = JSON.parse(localStorage.getItem('hireme_user') || '{}'); } catch {}
  const supervisorName   = supervisorUser?.name || 'Prof. Mariene Labrador';
  const supervisorEmail  = supervisorUser?.email || 'ojt.coordinator@chmsu.edu.ph';
  const supervisorTitle  = supervisorUser?.position || 'OJT Academic Coordinator';
  const supervisorCampus = supervisorUser?.supervisor_profile?.campus || supervisorUser?.campus || record?.student?.campus || 'Alijis Campus';
  const campusAddressLine = resolveCampusAddress(supervisorCampus);

  const todayDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const refCode = `CHMSU-CIER-OJT-2026-${String(interestId).padStart(4, '0')}`;

  const defaultBody = `Carlos Hilado Memorial State University, through the ${deptInfo.college} and the CIER Internship Directorate, is pleased to officially endorse our qualified bona fide student for deployment in your organization:`;

  let currentMode = 'template'; // 'template' | 'upload'

  const modal = document.createElement('div');
  modal.className = 'modal-backdrop modal-backdrop--visible';
  modal.style.zIndex = '9999';
  modal.innerHTML = `
    <div class="modal modal--visible" style="max-width:880px;width:95vw;max-height:92vh;display:flex;flex-direction:column;padding:0;overflow:hidden;border-radius:14px;box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);">
      <!-- Header -->
      <div class="modal__header" style="border-bottom:1px solid var(--border-default);padding:16px 24px;display:flex;align-items:center;justify-content:space-between;background:var(--bg-card);flex-shrink:0;">
        <div style="display:flex;align-items:center;gap:12px;min-width:0;">
          <div style="width:40px;height:40px;border-radius:10px;background:#00593014;color:#005930;display:flex;align-items:center;justify-content:center;flex-shrink:0;">${icon('fileText', 20)}</div>
          <div style="min-width:0;">
            <h3 class="modal__title" style="margin:0;font-size:1.12rem;font-weight:700;">Official Endorsement Letter</h3>
            <p style="font-size:0.78rem;color:var(--text-secondary);margin:2px 0 0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
              <strong>${escHtml(studentName)}</strong> &bull; ${escHtml(program)} &bull; ${escHtml(company)}
            </p>
          </div>
        </div>
        <button class="modal__close" id="el-modal-close" style="background:none;border:none;cursor:pointer;color:var(--text-tertiary);">${icon('x', 20)}</button>
      </div>

      <!-- Mode Selector Tabs -->
      <div style="background:#f8fafc;padding:10px 24px;border-bottom:1px solid var(--border-default);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;flex-shrink:0;">
        <div style="display:flex;align-items:center;gap:6px;">
          <button type="button" class="btn btn--sm" id="el-tab-template" style="background:#005930;color:#ffffff;border-color:#005930;font-weight:700;display:inline-flex;align-items:center;gap:6px;border-radius:8px;">
            ${icon('sparkles', 13)} Official Dynamic Template
          </button>
          <button type="button" class="btn btn--sm btn--outline" id="el-tab-upload" style="color:var(--text-secondary);border-color:var(--border-default);background:#ffffff;font-weight:600;display:inline-flex;align-items:center;gap:6px;border-radius:8px;">
            ${icon('upload', 13)} Upload Custom File
          </button>
        </div>

        ${existingUrl ? `
          <a href="${existingUrl.startsWith('http') ? existingUrl : 'http://localhost:8000' + (existingUrl.startsWith('/') ? '' : '/') + existingUrl}" target="_blank" rel="noopener" style="font-size:0.76rem;color:#005930;font-weight:700;text-decoration:underline;display:inline-flex;align-items:center;gap:5px;">
            ${icon('fileCheck', 13)} View Current Letter PDF
          </a>` : ''}
      </div>

      <!-- Modal Body (Scrollable) -->
      <div class="modal__body" style="flex:1;overflow-y:auto;padding:20px 24px;background:#f1f5f9;">
        <!-- PANE 1: Dynamic Template & Real-time Live Letter -->
        <div id="el-pane-template">
          <!-- Editor Customization Controls (Collapsible / Compact) -->
          <div style="background:#ffffff;border:1px solid var(--border-default);border-radius:10px;padding:16px;margin-bottom:18px;box-shadow:0 1px 3px rgba(0,0,0,0.04);">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
              <span style="font-size:0.78rem;font-weight:700;color:#005930;text-transform:uppercase;letter-spacing:0.05em;display:inline-flex;align-items:center;gap:6px;">
                ${icon('edit3', 13)} Template Customization Controls (Editable)
              </span>
              <span style="font-size:0.72rem;color:var(--text-tertiary);">Adjust text below to update the preview in real-time</span>
            </div>

            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:12px;margin-bottom:12px;">
              <div>
                <label style="display:block;font-size:0.76rem;font-weight:600;color:var(--text-secondary);margin-bottom:4px;">
                  Addressee / Recipient (Company Contact)
                </label>
                <input type="text" id="el-input-contact" value="${escHtml(contactName)}" class="form-input" style="width:100%;font-size:0.84rem;padding:7px 10px;border-radius:6px;border:1px solid #cbd5e1;" />
              </div>
              <div>
                <label style="display:block;font-size:0.76rem;font-weight:600;color:var(--text-secondary);margin-bottom:4px;">
                  Special Coordinator Remarks / Instructions (Optional)
                </label>
                <input type="text" id="el-input-notes" placeholder="e.g. Cleared for hybrid schedule. Trainee has completed occupational safety orientation." value="${escHtml(record?.coordinator_note || '')}" class="form-input" style="width:100%;font-size:0.84rem;padding:7px 10px;border-radius:6px;border:1px solid #cbd5e1;" />
              </div>
            </div>

            <div>
              <label style="display:block;font-size:0.76rem;font-weight:600;color:var(--text-secondary);margin-bottom:4px;">
                Introductory Endorsement Statement
              </label>
              <textarea id="el-input-body" rows="2" class="form-input" style="width:100%;font-size:0.82rem;padding:8px 10px;border-radius:6px;border:1px solid #cbd5e1;resize:vertical;">${escHtml(defaultBody)}</textarea>
            </div>
          </div>

          <!-- Official Stationery Paper Container -->
          <div id="el-letter-paper" style="background:#ffffff;border:1.5px solid #cbd5e1;border-radius:8px;padding:32px 36px;box-shadow:0 4px 20px rgba(0,0,0,0.06);font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;color:#1e293b;position:relative;">
            <!-- Top University Accent Bar -->
            <div style="height:4px;background:#005930;border-radius:2px 2px 0 0;margin:-32px -36px 20px -36px;"></div>
            <div style="height:2px;background:#D97706;margin:-20px -36px 24px -36px;"></div>

            <!-- Letterhead -->
            <div style="display:flex;align-items:flex-start;justify-content:space-between;border-bottom:2px solid #005930;padding-bottom:14px;margin-bottom:18px;">
              <div>
                <h2 style="margin:0;font-size:1.18rem;font-weight:800;color:#005930;letter-spacing:-0.01em;">CARLOS HILADO MEMORIAL STATE UNIVERSITY</h2>
                <p style="margin:2px 0 0;font-size:0.83rem;color:#475569;font-weight:600;">Center for Internationalization and External Relations (CIER)</p>
                <p style="margin:2px 0 0;font-size:0.82rem;color:#005930;font-weight:700;">${escHtml(deptInfo.college)} &mdash; ${escHtml(deptInfo.department)}</p>
                <p style="margin:2px 0 0;font-size:0.73rem;color:#64748b;">${campusAddressLine}</p>
              </div>
              <div style="text-align:right;">
                <span style="display:inline-block;padding:3px 8px;background:#ecfdf5;border:1px solid #00593033;border-radius:4px;font-size:0.71rem;font-weight:700;color:#005930;">
                  OFFICIAL ISSUANCE
                </span>
                <p style="margin:4px 0 0;font-size:0.72rem;color:#64748b;">Ref: ${refCode}</p>
              </div>
            </div>

            <!-- Document Title -->
            <div style="text-align:center;margin:16px 0 20px;">
              <h3 style="margin:0;font-size:1.02rem;font-weight:800;color:#005930;letter-spacing:0.04em;text-transform:uppercase;">
                OFFICIAL ENDORSEMENT MEMORANDUM FOR ON-THE-JOB TRAINING
              </h3>
              <p style="margin:4px 0 0;font-size:0.76rem;color:#64748b;">
                Date: <strong>${todayDate}</strong> &nbsp;|&nbsp; Academic Year 2026&ndash;2027
              </p>
            </div>

            <!-- Addressee Block -->
            <div style="margin-bottom:18px;font-size:0.84rem;line-height:1.45;">
              <p style="margin:0;font-weight:700;color:#0f172a;">TO: <span id="el-prev-contact">${escHtml(contactName)}</span></p>
              <p style="margin:1px 0 0;font-weight:700;color:#005930;">${escHtml(company)}</p>
              <p style="margin:1px 0 0;color:#64748b;font-size:0.78rem;">${escHtml(companyAddress)}</p>
            </div>

            <!-- Salutation -->
            <p style="margin:0 0 12px;font-size:0.86rem;font-weight:600;color:#0f172a;">Dear Industry Partner,</p>

            <!-- Paragraph 1 -->
            <p id="el-prev-body" style="margin:0 0 14px;font-size:0.85rem;line-height:1.6;color:#334155;">
              ${escHtml(defaultBody)}
            </p>

            <!-- Trainee Highlight Card -->
            <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-left:4px solid #005930;border-radius:6px;padding:12px 16px;margin:0 0 16px;">
              <div style="font-size:0.95rem;font-weight:800;color:#005930;margin-bottom:4px;">
                ${escHtml(studentName)}
              </div>
              <div style="font-size:0.79rem;color:#334155;line-height:1.5;">
                <strong>Student ID:</strong> ${escHtml(studentId)} &nbsp;&bull;&nbsp; <strong>Degree Program:</strong> ${escHtml(program)}<br>
                <strong>Academic Standing:</strong> ${escHtml(yearLevel)} &ndash; Section ${escHtml(section)} &nbsp;&bull;&nbsp; <strong>Status:</strong> Cleared for Deployment
              </div>
            </div>

            <!-- Paragraph 2 -->
            <p style="margin:0 0 12px;font-size:0.85rem;line-height:1.6;color:#334155;">
              The aforementioned student has successfully completed all university pre-deployment clearances and academic prerequisites. The student is authorized to render a required minimum of <strong>${escHtml(duration)}</strong> of specialized industry training for the position of <strong>&ldquo;${escHtml(posting)}&rdquo;</strong>.
            </p>

            <!-- Paragraph 3 -->
            <p style="margin:0 0 14px;font-size:0.85rem;line-height:1.6;color:#334155;">
              This endorsement is anchored on our active Memorandum of Agreement (MOA). The student has been instructed to observe the utmost professionalism, workplace safety rules, data confidentiality, and your company's operating protocols.
            </p>

            <!-- Real-time Coordinator Remarks Box (if any) -->
            <div id="el-prev-notes-box" style="display:${record?.coordinator_note ? 'block' : 'none'};background:#fffbeb;border:1px solid #fde68a;border-left:3px solid #D97706;border-radius:6px;padding:8px 12px;margin:0 0 14px;font-size:0.8rem;color:#92400e;">
              <strong>SPECIAL INSTRUCTIONS / REMARKS:</strong> <span id="el-prev-notes-text">${escHtml(record?.coordinator_note || '')}</span>
            </div>

            <!-- Paragraph 4 -->
            <p style="margin:0 0 24px;font-size:0.85rem;line-height:1.6;color:#334155;">
              Thank you very much for your continuous partnership and dedication in training our university students.
            </p>

            <!-- Sign-off & Seal Block -->
            <div style="display:flex;align-items:flex-end;justify-content:space-between;border-top:1px dashed #cbd5e1;padding-top:16px;margin-top:20px;">
              <div>
                <p style="margin:0 0 14px;font-size:0.75rem;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;">
                  ENDORSED AND CERTIFIED BY:
                </p>
                <p style="margin:0;font-size:0.98rem;font-weight:800;color:#005930;text-transform:uppercase;">
                  ${escHtml(supervisorName)}
                </p>
                <p style="margin:2px 0 0;font-size:0.78rem;color:#475569;">${escHtml(supervisorTitle)} &ndash; ${escHtml(deptInfo.department)}</p>
                <p style="margin:1px 0 0;font-size:0.76rem;color:#64748b;">${escHtml(deptInfo.college)}, CHMSU (${escHtml(supervisorCampus)})</p>
                <p style="margin:1px 0 0;font-size:0.74rem;color:#64748b;">Email: ${escHtml(supervisorEmail)}</p>
              </div>

              <!-- Digital Stamp Box -->
              <div style="background:#ecfdf5;border:1.5px solid #005930;border-radius:8px;padding:8px 12px;text-align:center;min-width:180px;">
                <span style="font-size:0.73rem;font-weight:800;color:#005930;display:block;">CHMSU CIER ENDORSED</span>
                <span style="font-size:0.69rem;color:#065f46;display:block;">Digitally Verified &bull; Official</span>
                <span style="font-size:0.66rem;color:#64748b;font-family:monospace;display:block;margin-top:2px;">SEC: ${refCode}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- PANE 2: Custom Document Upload (Hidden by default) -->
        <div id="el-pane-upload" style="display:none;">
          <div class="form-group" style="margin-bottom:12px;">
            <label class="form-label" style="font-size:0.81rem;font-weight:600;margin-bottom:6px;display:block;">
              Select Scanned Endorsement Letter ${hasExisting ? '<span style="color:#D97706;font-size:0.73rem;">(replace existing)</span>' : ''}
            </label>
            <label id="el-drop-zone" class="ojts-dropzone">
              <span style="color:var(--text-tertiary)">${icon('upload', 24)}</span>
              <span style="font-size:0.85rem;font-weight:600;color:var(--text-primary)">Click to select file or drag &amp; drop</span>
              <span style="font-size:0.75rem;color:var(--text-tertiary)">PDF, DOCX, JPG or PNG (up to 5MB)</span>
              <input type="file" id="el-file-input" accept=".pdf,.docx,.jpg,.jpeg,.png" style="display:none;" />
            </label>
          </div>

          <!-- File Preview -->
          <div id="el-file-preview" style="display:none;padding:10px 14px;background:#05966910;border:1px solid #05966925;border-radius:var(--radius-md);align-items:center;gap:10px;margin-bottom:12px;">
            <span style="color:#059669;flex-shrink:0;">${icon('fileText', 18)}</span>
            <div style="flex:1;min-width:0;">
              <p id="el-file-name" style="font-weight:600;font-size:0.85rem;margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text-primary);"></p>
              <p id="el-file-size" style="font-size:0.75rem;color:var(--text-tertiary);margin:2px 0 0;"></p>
            </div>
            <button id="el-file-clear" style="background:none;border:none;cursor:pointer;color:var(--text-tertiary);padding:2px;">${icon('x', 14)}</button>
          </div>
        </div>

        <p id="el-error" style="color:#EF4444;font-size:0.81rem;margin:12px 0 0;display:none;padding:8px 12px;background:#EF444412;border-radius:var(--radius-sm);"></p>
      </div>

      <!-- Footer -->
      <div class="modal__footer" style="border-top:1px solid var(--border-default);padding:14px 24px;display:flex;align-items:center;justify-content:space-between;background:var(--bg-card);flex-shrink:0;">
        <button type="button" class="btn btn--outline" id="el-print-btn" style="gap:6px;font-size:0.82rem;">
          ${icon('printer', 14)} Print Official Letter
        </button>

        <div style="display:flex;align-items:center;gap:8px;">
          <button class="btn btn--outline" id="el-cancel">Cancel</button>
          <button class="btn btn--primary" id="el-submit" style="background:#005930;border-color:#005930;color:#fff;gap:6px;font-weight:700;">
            ${icon('send', 14)} Send Endorsement Letter
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const closeModal = () => modal.remove();
  modal.querySelector('#el-modal-close').addEventListener('click', closeModal);
  modal.querySelector('#el-cancel').addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

  // Tab switching
  const tabTemplate = modal.querySelector('#el-tab-template');
  const tabUpload   = modal.querySelector('#el-tab-upload');
  const paneTemplate = modal.querySelector('#el-pane-template');
  const paneUpload   = modal.querySelector('#el-pane-upload');
  const printBtn     = modal.querySelector('#el-print-btn');

  tabTemplate.addEventListener('click', () => {
    currentMode = 'template';
    tabTemplate.style.background = '#005930';
    tabTemplate.style.color = '#ffffff';
    tabTemplate.style.borderColor = '#005930';
    tabUpload.style.background = '#ffffff';
    tabUpload.style.color = 'var(--text-secondary)';
    tabUpload.style.borderColor = 'var(--border-default)';
    paneTemplate.style.display = 'block';
    paneUpload.style.display = 'none';
    printBtn.style.display = 'inline-flex';
  });

  tabUpload.addEventListener('click', () => {
    currentMode = 'upload';
    tabUpload.style.background = '#005930';
    tabUpload.style.color = '#ffffff';
    tabUpload.style.borderColor = '#005930';
    tabTemplate.style.background = '#ffffff';
    tabTemplate.style.color = 'var(--text-secondary)';
    tabTemplate.style.borderColor = 'var(--border-default)';
    paneUpload.style.display = 'block';
    paneTemplate.style.display = 'none';
    printBtn.style.display = 'none';
  });

  // Real-time Preview Synchronizers
  const inputContact = modal.querySelector('#el-input-contact');
  const prevContact  = modal.querySelector('#el-prev-contact');
  inputContact?.addEventListener('input', () => {
    prevContact.textContent = inputContact.value.trim() || 'The Internship Director / Human Resources Management';
  });

  const inputBody = modal.querySelector('#el-input-body');
  const prevBody  = modal.querySelector('#el-prev-body');
  inputBody?.addEventListener('input', () => {
    prevBody.textContent = inputBody.value.trim() || defaultBody;
  });

  const inputNotes     = modal.querySelector('#el-input-notes');
  const prevNotesBox   = modal.querySelector('#el-prev-notes-box');
  const prevNotesText  = modal.querySelector('#el-prev-notes-text');
  inputNotes?.addEventListener('input', () => {
    const val = inputNotes.value.trim();
    if (val) {
      prevNotesBox.style.display = 'block';
      prevNotesText.textContent = val;
    } else {
      prevNotesBox.style.display = 'none';
    }
  });

  // Print button
  printBtn.addEventListener('click', () => {
    const paperHtml = modal.querySelector('#el-letter-paper').innerHTML;
    const printWin = window.open('', '_blank', 'width=850,height=950');
    if (printWin) {
      printWin.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Official CHMSU Endorsement Letter - ${escHtml(studentName)}</title>
            <style>
              @page { size: letter portrait; margin: 15mm; }
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; margin: 0; padding: 20px; line-height: 1.5; background: #fff; }
              @media print { body { padding: 0; } }
            </style>
          </head>
          <body>
            ${paperHtml}
            <script>
              window.onload = function() { window.print(); };
            </script>
          </body>
        </html>
      `);
      printWin.document.close();
    }
  });

  // File Upload Handlers (for Tab 2)
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

  // Submit Handler
  modal.querySelector('#el-submit').addEventListener('click', async () => {
    const submitBtn = modal.querySelector('#el-submit');
    errEl.style.display = 'none';

    const formData = new FormData();

    if (currentMode === 'template') {
      formData.append('is_generated', '1');
      formData.append('contact_person', inputContact?.value?.trim() || '');
      formData.append('coordinator_note', inputNotes?.value?.trim() || '');
      formData.append('custom_body', inputBody?.value?.trim() || '');
    } else {
      const file = fileInput.files[0];
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
      formData.append('endorsement_letter', file);
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = `${icon('clock', 14)} Sending…`;

    try {
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
  const targetStudent = students.find(s => String(s.id) === String(interestId));
  const isDirectAccept = targetStudent?.interview_type === 'waived';
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop modal-backdrop--visible';
  modal.style.zIndex = '9999';
  modal.innerHTML = `
    <div class="modal modal--visible" style="max-width:480px;padding:0;">
      <div class="modal__header" style="border-bottom:1px solid var(--border-default);padding:18px 24px;">
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="width:40px;height:40px;border-radius:10px;background:#05966914;color:#059669;display:flex;align-items:center;justify-content:center;">${icon('checkCircle', 20)}</div>
          <div>
            <h3 class="modal__title" style="margin:0;font-size:1.14rem;font-weight:700;">Final OJT Approval</h3>
            <p style="font-size:0.79rem;color:var(--text-secondary);margin:2px 0 0;">${studentName}</p>
          </div>
        </div>
        <button class="modal__close" id="fa-close">${icon('x', 20)}</button>
      </div>
      <div class="modal__body" style="padding:20px 24px;">
        ${isDirectAccept ? `
        <div style="background:rgba(0,89,48,0.07);border:1px solid rgba(0,89,48,0.22);border-radius:var(--radius-md);padding:10px 14px;margin-bottom:14px;font-size:0.81rem;color:#005930;display:flex;align-items:center;gap:8px;line-height:1.4;">
          ${icon('award', 15)} <span><strong>Direct Placement:</strong> The host company accepted this student directly without an interview based on your endorsement letter and credentials.</span>
        </div>
        ` : ''}
        <div style="background:#05966910;border:1px solid #05966925;border-radius:var(--radius-md);padding:12px 14px;margin-bottom:16px;font-size:0.81rem;color:#059669;display:flex;gap:8px;line-height:1.4;">
          ${icon('checkCircle', 14)} Giving final approval confirms that this student will officially render OJT hours at this host company.
        </div>
        <div class="form-group">
          <label class="form-label" style="font-size:0.81rem;font-weight:600;margin-bottom:6px;display:block;">
            Coordinator Recommendation / Note <span style="color:var(--text-tertiary);font-weight:400;">(optional)</span>
          </label>
          <textarea id="fa-note" class="form-textarea" rows="3" placeholder="e.g. Approved. Please ensure time logs are submitted daily." style="resize:vertical;"></textarea>
        </div>
        <p id="fa-error" style="color:#EF4444;font-size:0.81rem;margin:8px 0 0;display:none;"></p>
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
