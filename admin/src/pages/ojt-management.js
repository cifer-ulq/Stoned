import { apiGet, apiGetCached, getCached, apiPost, apiDelete, storageUrl } from '../api/client.js';
import { icon, renderIcons } from '../components/icons.js';
import { openAdminPullOutModal } from '../components/admin-pullout-modal.js';

const STATUS_COLORS = {
  'Ongoing':                 'success',
  'On Track':                'success',
  'Completed':               'info',
  'Delayed':                 'warning',
  'At Risk':                 'error',
  'Endorsed':                'info',
  'Accepted':                'success',
  'Endorsement Requested':   'warning',
  'Interested':              'neutral',
};

const CAMPUSES = [
  'Alijis Campus',
  'Talisay Campus',
  'Fortune Towne Campus',
  'Binalbagan Campus',
];

const COURSE_GROUPS = [
  {
    id: 'ccs',
    group: 'College of Computer Studies (CCS)',
    short: 'CCS',
    icon: 'cpu',
    color: '#005930',
    badgeBg: 'rgba(0, 89, 48, 0.08)',
    courses: [
      'Bachelor of Science in Information Technology',
      'Bachelor of Science in Information Systems',
      'Bachelor of Science in Computer Science',
    ],
  },
  {
    id: 'coe',
    group: 'College of Engineering',
    short: 'Engineering',
    icon: 'layers',
    color: '#2563EB',
    badgeBg: 'rgba(37, 99, 235, 0.08)',
    courses: [
      'Bachelor of Science in Computer Engineering',
      'Bachelor of Science in Electronics Engineering',
    ],
  },
  {
    id: 'cit',
    group: 'College of Industrial Technology (CIT)',
    short: 'Industrial Tech',
    icon: 'tool',
    color: '#D97706',
    badgeBg: 'rgba(217, 119, 6, 0.08)',
    courses: [
      'Bachelor of Science in Industrial Technology - Major in Architectural Drafting Technology',
      'Bachelor of Science in Industrial Technology - Major in Automotive Technology',
      'Bachelor of Science in Industrial Technology - Major in Computer Technology',
      'Bachelor of Science in Industrial Technology - Major in Electrical Technology',
      'Bachelor of Science in Industrial Technology - Major in Electronics Technology',
      'Bachelor of Science in Industrial Technology - Major in Food Trades Technology',
      'Bachelor of Science in Industrial Technology - Major in Mechanical Technology',
    ],
  },
  {
    id: 'cotv',
    group: 'College of Education / Technical-Vocational',
    short: 'Education',
    icon: 'book-open',
    color: '#7C3AED',
    badgeBg: 'rgba(124, 58, 237, 0.08)',
    courses: [
      'Bachelor of Technical Vocational Teacher Education - Major in Electrical Technology',
      'Bachelor of Technical Vocational Teacher Education - Major in Electronics Technology',
    ],
  },
  {
    id: 'other',
    group: 'Business & Other Programs',
    short: 'Business & Others',
    icon: 'briefcase',
    color: '#0D9488',
    badgeBg: 'rgba(13, 148, 136, 0.08)',
    courses: [
      'Bachelor of Science in Business Administration',
      'Bachelor of Science in Accountancy',
      'Bachelor of Secondary Education',
      'Bachelor of Science in Hospitality Management',
      'Bachelor of Science in Criminology',
      'Bachelor of Science in Nursing',
      'Bachelor of Science in Agriculture',
      'Bachelor of Science in Fisheries',
    ],
  },
];

const COURSES = COURSE_GROUPS.flatMap(g => g.courses);

function formatCourseDisplay(courseName) {
  if (courseName.includes(' - Major in ')) {
    const [base, major] = courseName.split(' - Major in ');
    const shortBase = base.replace('Bachelor of Science in ', 'BS ').replace('Bachelor of ', 'B ');
    return {
      primaryTitle: `Major in ${major}`,
      degreeBadge: shortBase,
      fullName: courseName,
      isTrade: true,
    };
  }
  return {
    primaryTitle: courseName,
    degreeBadge: null,
    fullName: courseName,
    isTrade: false,
  };
}

const COURSE_META = {
  'Bachelor of Science in Information Technology': {
    code: 'BSIT',
    category: 'College of Computer Studies',
    icon: 'cpu',
  },
  'Bachelor of Science in Computer Science': {
    code: 'BSCS',
    category: 'College of Computer Studies',
    icon: 'cpu',
  },
  'Bachelor of Science in Information Systems': {
    code: 'BSIS',
    category: 'College of Computer Studies',
    icon: 'layers',
  },
  'Bachelor of Science in Computer Engineering': {
    code: 'BSCpE',
    category: 'College of Engineering',
    icon: 'cpu',
  },
  'Bachelor of Science in Electronics Engineering': {
    code: 'BSECE',
    category: 'College of Engineering',
    icon: 'activity',
  },
  'Bachelor of Science in Industrial Technology - Major in Architectural Drafting Technology': {
    code: 'BSIT-ADT',
    category: 'College of Industrial Technology',
    icon: 'compass',
  },
  'Bachelor of Science in Industrial Technology - Major in Automotive Technology': {
    code: 'BSIT-AT',
    category: 'College of Industrial Technology',
    icon: 'tool',
  },
  'Bachelor of Science in Industrial Technology - Major in Computer Technology': {
    code: 'BSIT-CT',
    category: 'College of Industrial Technology',
    icon: 'cpu',
  },
  'Bachelor of Science in Industrial Technology - Major in Electrical Technology': {
    code: 'BSIT-ET',
    category: 'College of Industrial Technology',
    icon: 'zap',
  },
  'Bachelor of Science in Industrial Technology - Major in Electronics Technology': {
    code: 'BSIT-ELX',
    category: 'College of Industrial Technology',
    icon: 'activity',
  },
  'Bachelor of Science in Industrial Technology - Major in Food Trades Technology': {
    code: 'BSIT-FT',
    category: 'College of Industrial Technology',
    icon: 'coffee',
  },
  'Bachelor of Science in Industrial Technology - Major in Mechanical Technology': {
    code: 'BSIT-MT',
    category: 'College of Industrial Technology',
    icon: 'settings',
  },
  'Bachelor of Technical Vocational Teacher Education - Major in Electrical Technology': {
    code: 'BTVTEd-ET',
    category: 'College of Education / Tech-Voc',
    icon: 'book-open',
  },
  'Bachelor of Technical Vocational Teacher Education - Major in Electronics Technology': {
    code: 'BTVTEd-ELX',
    category: 'College of Education / Tech-Voc',
    icon: 'book-open',
  },
  'Bachelor of Science in Business Administration': {
    code: 'BSBA',
    category: 'Business & Management',
    icon: 'briefcase',
  },
  'Bachelor of Science in Accountancy': {
    code: 'BSA',
    category: 'Finance & Accountancy',
    icon: 'bar-chart-2',
  },
  'Bachelor of Secondary Education': {
    code: 'BSEd',
    category: 'Teacher Education',
    icon: 'book-open',
  },
  'Bachelor of Science in Hospitality Management': {
    code: 'BSHM',
    category: 'Hospitality & Tourism',
    icon: 'award',
  },
  'Bachelor of Science in Criminology': {
    code: 'BSCrim',
    category: 'Criminal Justice',
    icon: 'shield',
  },
  'Bachelor of Science in Nursing': {
    code: 'BSN',
    category: 'Health & Nursing',
    icon: 'activity',
  },
  'Bachelor of Science in Agriculture': {
    code: 'BSAgr',
    category: 'Agriculture & Bio-Sciences',
    icon: 'target',
  },
  'Bachelor of Science in Fisheries': {
    code: 'BSFish',
    category: 'Aquatic & Fisheries',
    icon: 'target',
  },
};

function getCourseMeta(courseName) {
  if (COURSE_META[courseName]) return COURSE_META[courseName];
  const words = courseName.replace(/^(Bachelor of Science in|Bachelor of)/i, '').trim().split(/\s+/);
  const code = (words.length > 1 ? words.map(w => w[0]).join('') : words[0]?.slice(0, 4) || 'PROG').toUpperCase();
  return {
    code: 'BS' + code,
    category: 'Academic Program',
    icon: 'graduation-cap',
  };
}

export default async function OjtManagementPage(container) {
  container.innerHTML = `
    <div class="page-header" style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;">
      <div>
        <h1 class="page-header__title">OJT Management</h1>
        <p class="page-header__subtitle">Track and manage on-the-job training deployments</p>
      </div>
      <button class="btn btn--primary" id="btn-register-supervisor" style="gap:6px;">${icon('user-check',15)} Register Supervisor</button>
    </div>
    <div class="stats-grid stats-grid--4 anim-stagger" id="ojt-stats">
      ${Array(4).fill(`<div class="stat-card" style="opacity:.35;min-height:90px;"></div>`).join('')}
    </div>

    <!-- Analytics Section -->
    <div style="margin:var(--space-6) 0 var(--space-4);">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-4);">
        <h2 style="font-size:var(--text-lg);font-weight:var(--weight-semibold);display:flex;align-items:center;gap:8px;margin:0;">${icon('bar-chart-3',18)} OJT Analytics</h2>
        <span style="font-size:var(--text-xs);color:var(--text-tertiary);background:var(--bg-elevated);padding:4px 10px;border-radius:20px;border:1px solid var(--border-subtle);">Real-time data</span>
      </div>
      <!-- Analytics Summary Mini-Stats -->
      <div id="analytics-summary" style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:var(--space-4);"></div>
      <!-- Charts Grid -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:var(--space-4);">
        <div class="stat-card" style="padding:20px;" id="chart-status"><p style="color:var(--text-tertiary);font-size:var(--text-sm);">Loading analytics…</p></div>
        <div class="stat-card" style="padding:20px;" id="chart-histogram"><p style="color:var(--text-tertiary);font-size:var(--text-sm);">Loading…</p></div>
      </div>
      <div style="display:grid;grid-template-columns:1.4fr 1fr;gap:var(--space-4);margin-top:var(--space-4);">
        <div class="stat-card" style="padding:20px;" id="chart-companies"><p style="color:var(--text-tertiary);font-size:var(--text-sm);">Loading…</p></div>
        <div class="stat-card" style="padding:20px;" id="chart-positions"><p style="color:var(--text-tertiary);font-size:var(--text-sm);">Loading…</p></div>
      </div>
    </div>

    <!-- Program Coordinators Section -->
    <div class="ojt-table-card anim-fade-in-up" id="sup-section">
      <div class="ojt-table-card__header">
        <div class="ojt-table-card__title-group">
          <div class="ojt-table-card__icon" style="background:rgba(16,185,129,0.12);color:#047857;">
            ${icon('users', 18)}
          </div>
          <div>
            <h3 class="ojt-table-card__title">Program Coordinators</h3>
            <p class="ojt-table-card__subtitle">Academic supervisors designated to oversee student internships by campus &amp; discipline (3 per page)</p>
          </div>
        </div>
        <div class="ojt-table-card__actions">
          <span class="ojt-count-pill" id="sup-count-pill">
            <span class="ojt-count-pill__dot" style="background:#10B981;"></span>
            <span id="sup-count-text">0 Coordinators</span>
          </span>
        </div>
      </div>
      <div class="ojt-table-responsive">
        <table class="ojt-table" id="sup-table">
          <thead>
            <tr>
              <th style="min-width:200px;">Coordinator</th>
              <th style="min-width:180px;">Email</th>
              <th style="min-width:130px;">Campus</th>
              <th style="min-width:220px;">Assigned Program</th>
              <th style="min-width:110px;">Registered</th>
              <th class="text-right" style="width:88px;min-width:88px;">Actions</th>
            </tr>
          </thead>
          <tbody id="sup-tbody">
            <tr><td colspan="6" style="text-align:center;color:var(--text-tertiary);padding:32px;">Loading coordinators…</td></tr>
          </tbody>
        </table>
      </div>
      <div class="ojt-table-card__footer" id="sup-pagination"></div>
    </div>

    <!-- OJT Pull-Out Requests & Dean Endorsement Section -->
    <div class="ojt-table-card anim-fade-in-up" id="pullout-section">
      <div class="ojt-table-card__header">
        <div class="ojt-table-card__title-group">
          <div class="ojt-table-card__icon" style="background:rgba(99,102,241,0.12);color:#4F46E5;">
            ${icon('file-text', 18)}
          </div>
          <div>
            <h3 class="ojt-table-card__title">
              OJT Pull-Out Requests &amp; Dean Endorsement
              <span id="pullout-badge-count" class="badge badge--warning" style="font-size:0.72rem;padding:2px 8px;border-radius:12px;display:none;margin-left:6px;">0 Pending</span>
            </h3>
            <p class="ojt-table-card__subtitle">Review coordinator-recommended pull-outs, generate official Dean letters, and dispatch via print or email (5 per page)</p>
          </div>
        </div>
        <div class="ojt-table-card__actions">
          <select class="form-select" id="filter-pullout-status" style="width:auto;padding:6px 28px 6px 10px;font-size:0.75rem;border-radius:8px;height:34px;">
            <option value="">All Requests</option>
            <option value="recommended_by_supervisor" selected>Awaiting Dean Letter / Action</option>
            <option value="printed_pending_signature">Printed (Awaiting Physical Signature)</option>
            <option value="emailed_to_dean">Emailed (Awaiting Dean Reply)</option>
            <option value="approved">Approved by Dean</option>
            <option value="pending_supervisor">Pending Coordinator Review</option>
          </select>
        </div>
      </div>
      <div class="ojt-table-responsive">
        <table class="ojt-table" id="pullout-table">
          <thead>
            <tr>
              <th style="min-width:200px;">Student</th>
              <th style="min-width:180px;">Program &amp; Section</th>
              <th style="min-width:180px;">Company</th>
              <th style="min-width:140px;">Reason</th>
              <th style="min-width:180px;">Coordinator Recommendation</th>
              <th style="min-width:140px;">Status</th>
              <th class="text-right" style="width:88px;min-width:88px;">Actions</th>
            </tr>
          </thead>
          <tbody id="pullout-tbody">
            <tr><td colspan="7" style="text-align:center;color:var(--text-tertiary);padding:32px;">Loading pull-out requests…</td></tr>
          </tbody>
        </table>
      </div>
      <div class="ojt-table-card__footer" id="pullout-pagination"></div>
    </div>

    <!-- Trainees Section -->
    <div class="ojt-table-card anim-fade-in-up" id="trainees-section">
      <div class="ojt-table-card__header">
        <div class="ojt-table-card__title-group">
          <div class="ojt-table-card__icon" style="background:rgba(139,92,246,0.12);color:#7C3AED;">
            ${icon('briefcase', 18)}
          </div>
          <div>
            <h3 class="ojt-table-card__title">Trainees</h3>
            <p class="ojt-table-card__subtitle">Active student placements, hours rendered tracking, and host companies (10 per page)</p>
          </div>
        </div>
        <div class="ojt-table-card__actions">
          <div class="search-box" style="width:230px;">
            ${icon('search', 14)}
            <input class="search-box__input" id="ojt-search" placeholder="Search trainee or company…" style="height:34px;padding-top:4px;padding-bottom:4px;font-size:0.78rem;" />
          </div>
          <select class="form-select" id="filter-status" style="width:auto;padding:6px 28px 6px 10px;font-size:0.75rem;border-radius:8px;height:34px;">
            <option value="">All Statuses</option>
            <option>Ongoing</option>
            <option>Completed</option>
            <option>Endorsed</option>
            <option>Accepted</option>
            <option>Endorsement Requested</option>
            <option>Interested</option>
          </select>
          <span class="ojt-count-pill" id="ojt-count-pill">
            <span class="ojt-count-pill__dot" style="background:#7C3AED;"></span>
            <span id="ojt-count">0 Trainees</span>
          </span>
        </div>
      </div>
      <div class="ojt-table-responsive">
        <table class="ojt-table" id="ojt-table">
          <thead>
            <tr>
              <th style="min-width:210px;">Student</th>
              <th style="min-width:190px;">Host Company</th>
              <th style="min-width:180px;">Hours Progress</th>
              <th style="min-width:120px;">Status</th>
              <th class="text-right" style="width:88px;min-width:88px;">Actions</th>
            </tr>
          </thead>
          <tbody id="ojt-tbody">
            <tr><td colspan="5" style="text-align:center;color:var(--text-tertiary);padding:32px;">Loading trainees…</td></tr>
          </tbody>
        </table>
      </div>
      <div class="ojt-table-card__footer" id="ojt-pagination"></div>
    </div>
  `;

  renderIcons();

  const statsEl = container.querySelector('#ojt-stats');
  const tbody   = container.querySelector('#ojt-tbody');
  const countEl = container.querySelector('#ojt-count');
  const pagEl   = container.querySelector('#ojt-pagination');

  let currentPage   = 1;
  let debounceTimer = null;

  /* ── Stats ── */
  function renderStats(s) {
    const ongoingVal = (s.ongoing != null ? s.ongoing : s.onTrack) || 0;
    const completedVal = s.completed || 0;
    const rateVal = s.total > 0 ? Math.round((completedVal / s.total) * 100) : 0;

    const items = [
      { label: 'Total Deployed',  value: (s.total || 0).toLocaleString(), ic: 'briefcase',   color: '#6366F1' },
      { label: 'Ongoing OJT',     value: ongoingVal.toLocaleString(),     ic: 'activity',    color: '#10B981' },
      { label: 'Completed',       value: completedVal.toLocaleString(),   ic: 'award',       color: '#3B82F6' },
      { label: 'Completion Rate', value: `${rateVal}%`,                   ic: 'trending-up', color: '#8B5CF6' },
    ];
    statsEl.innerHTML = items.map(st => `
      <div class="stat-card anim-fade-in-up">
        <div class="stat-card__top">
          <div class="stat-card__icon" style="background:${st.color}20;color:${st.color};">${icon(st.ic, 18)}</div>
        </div>
        <div class="stat-card__body">
          <div class="stat-card__value">${st.value}</div>
          <div class="stat-card__label">${st.label}</div>
        </div>
      </div>
    `).join('');
    renderIcons();
  }

  /* ── Universal Pagination Builder ── */
  function buildPaginationHtml({ currentPage, totalPages, totalItems, perPage, itemName = 'items' }) {
    if (totalPages <= 1) {
      if (totalItems > 0) {
        return `
          <div style="display:flex;justify-content:space-between;align-items:center;width:100%;font-size:var(--text-xs);color:var(--text-tertiary);padding:4px 0;">
            <span>Showing all <strong>${totalItems}</strong> ${itemName}</span>
          </div>
        `;
      }
      return '';
    }

    const start = (currentPage - 1) * perPage + 1;
    const end = Math.min(currentPage * perPage, totalItems);

    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('…');
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('…');
      pages.push(totalPages);
    }

    const pageButtons = pages.map(p => p === '…'
      ? `<span style="padding:0 4px;align-self:center;color:var(--text-tertiary);font-size:var(--text-xs);">…</span>`
      : `<button type="button" class="an-pg-btn ${p === currentPage ? 'an-pg-btn--active' : ''}" data-p="${p}">${p}</button>`
    ).join('');

    return `
      <div style="display:flex;justify-content:space-between;align-items:center;width:100%;flex-wrap:wrap;gap:12px;padding:4px 0;">
        <span style="font-size:var(--text-xs);color:var(--text-tertiary);">
          Showing <strong>${start}–${end}</strong> of <strong>${totalItems}</strong> ${itemName}
        </span>
        <div style="display:flex;align-items:center;gap:6px;">
          <button type="button" class="an-pg-btn an-pg-btn--nav" data-p="${currentPage - 1}" ${currentPage === 1 ? 'disabled' : ''} aria-label="Previous page">
            ${icon('chevronLeft', 14)}
          </button>
          ${pageButtons}
          <button type="button" class="an-pg-btn an-pg-btn--nav" data-p="${currentPage + 1}" ${currentPage >= totalPages ? 'disabled' : ''} aria-label="Next page">
            ${icon('chevronRight', 14)}
          </button>
        </div>
      </div>
    `;
  }

  /* ── Trainee Details Modal ── */
  function openTraineeDetailModal(t) {
    const existing = document.getElementById('trainee-detail-modal-overlay');
    if (existing) existing.remove();

    const backdrop = document.createElement('div');
    backdrop.id = 'trainee-detail-modal-overlay';
    backdrop.className = 'modal-backdrop';
    backdrop.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(15,23,42,0.65);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;z-index:99999;padding:16px;';

    const initials = (t.name || 'ST').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const barColor = t.pct >= 100 ? '#3B82F6' : t.pct >= 40 ? '#10B981' : '#F59E0B';

    backdrop.innerHTML = `
      <div class="modal ac-modal" style="max-width:540px;width:100%;max-height:90vh;overflow-y:auto;background:var(--bg-card,#fff);border-radius:14px;box-shadow:0 25px 50px rgba(0,0,0,0.25);">
        <div class="ac-modal__header" style="background:linear-gradient(135deg, #005930 0%, #00361d 100%);color:#fff;padding:18px 22px;display:flex;align-items:center;justify-content:space-between;border-radius:14px 14px 0 0;">
          <div style="display:flex;align-items:center;gap:12px;">
            ${t.avatar_url
              ? `<img src="${storageUrl(t.avatar_url)}" style="width:40px;height:40px;border-radius:10px;object-fit:cover;border:2px solid rgba(255,255,255,0.2);" />`
              : `<div class="entity-card__avatar" style="width:40px;height:40px;font-size:0.85rem;background:rgba(255,255,255,0.2);color:#fff;font-weight:700;border-radius:10px;display:flex;align-items:center;justify-content:center;">${initials}</div>`}
            <div>
              <h3 style="margin:0;font-size:1.1rem;font-weight:700;color:#fff;">${t.name}</h3>
              <p style="margin:2px 0 0;font-size:0.78rem;color:rgba(255,255,255,0.85);">${t.program || 'Student'}${t.campus ? ' &bull; ' + t.campus : ''}</p>
            </div>
          </div>
          <button type="button" class="modal__close" id="trainee-modal-close" style="background:none;border:none;color:#fff;cursor:pointer;padding:4px;" aria-label="Close">
            ${icon('x', 18)}
          </button>
        </div>

        <div style="padding:20px 22px;display:flex;flex-direction:column;gap:16px;">
          <!-- Status & Placement Card -->
          <div style="background:var(--bg-elevated);border:1px solid var(--border-subtle);border-radius:10px;padding:14px 16px;">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px;">
              <div>
                <span style="font-size:0.7rem;text-transform:uppercase;letter-spacing:0.05em;color:var(--text-tertiary);font-weight:600;">Host Company</span>
                <div style="font-size:1rem;font-weight:700;color:var(--text-primary);margin-top:2px;">${t.company}</div>
                ${t.posting_title ? `<div style="font-size:0.82rem;color:var(--text-secondary);">${t.posting_title}</div>` : ''}
                ${t.location ? `<div style="font-size:0.75rem;color:var(--text-tertiary);margin-top:2px;">${t.location}</div>` : ''}
              </div>
              <span class="badge badge--${STATUS_COLORS[t.status] || 'neutral'}" style="font-size:0.75rem;">${t.status}</span>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;padding-top:10px;border-top:1px solid var(--border-subtle);font-size:0.8rem;">
              <div>
                <span style="color:var(--text-tertiary);font-size:0.72rem;display:block;">Contact Email</span>
                <span style="color:var(--text-primary);font-weight:500;">${t.email || '—'}</span>
              </div>
              <div>
                <span style="color:var(--text-tertiary);font-size:0.72rem;display:block;">Placement Date</span>
                <span style="color:var(--text-primary);font-weight:500;">${t.accepted_at || '—'}</span>
              </div>
            </div>
          </div>

          <!-- Hours Progress Card -->
          <div style="background:var(--bg-elevated);border:1px solid var(--border-default,#e2e8f0);border-radius:10px;padding:14px 16px;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
              <span style="font-size:0.75rem;font-weight:600;color:var(--text-secondary);">OJT Hours Progress</span>
              <span style="font-size:0.85rem;font-weight:700;color:var(--text-primary);">${parseFloat(t.hours_done || 0)} / ${parseFloat(t.hours_required || 0)} hrs (${t.pct || 0}%)</span>
            </div>
            <div style="width:100%;height:8px;background:#E2E8F0;border-radius:9999px;overflow:hidden;">
              <div style="width:${Math.min(100, Math.max(0, t.pct || 0))}%;background:${barColor};height:100%;border-radius:9999px;transition:width 0.3s ease;"></div>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px;font-size:0.72rem;color:var(--text-tertiary);">
              <span>0 hrs rendered</span>
              <span>Target: ${parseFloat(t.hours_required || 0)} hrs</span>
            </div>
          </div>
        </div>

        <div class="ac-modal__footer" style="padding:14px 22px;border-top:1px solid var(--border-subtle);display:flex;justify-content:space-between;align-items:center;background:var(--bg-secondary);border-radius:0 0 14px 14px;">
          <button type="button" class="btn btn--outline btn--sm" id="trainee-modal-close-btn" style="padding:6px 14px;">Close</button>
          <button type="button" class="btn btn--primary btn--sm" id="trainee-modal-goto-student" style="background:#005930;border-color:#005930;padding:6px 14px;gap:6px;display:inline-flex;align-items:center;">
            ${icon('user', 14)} <span>View in Student Directory</span>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);
    renderIcons();

    const close = () => backdrop.remove();
    backdrop.querySelector('#trainee-modal-close')?.addEventListener('click', close);
    backdrop.querySelector('#trainee-modal-close-btn')?.addEventListener('click', close);
    backdrop.addEventListener('click', e => { if (e.target === backdrop) close(); });
    backdrop.querySelector('#trainee-modal-goto-student')?.addEventListener('click', () => {
      close();
      window.location.hash = `#/students?search=${encodeURIComponent(t.name)}`;
    });
  }

  /* ── Trainees Table rows ── */
  let currentTrainees = [];
  function renderRows(data) {
    currentTrainees = data || [];
    if (!currentTrainees.length) {
      tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><p class="empty-state__text">No trainees found</p></div></td></tr>`;
      return;
    }
    tbody.innerHTML = currentTrainees.map((s, idx) => {
      const barColor = s.pct >= 100 ? '#3B82F6' : s.pct >= 40 ? '#10B981' : '#F59E0B';
      const initials = (s.name || 'ST').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
      const doneHours = parseFloat(s.hours_done || 0);
      const reqHours = parseFloat(s.hours_required || 0);
      const formattedDone = doneHours % 1 === 0 ? doneHours.toString() : doneHours.toFixed(1);
      const formattedReq = reqHours % 1 === 0 ? reqHours.toString() : reqHours.toFixed(1);
      const safePct = Math.min(100, Math.max(0, s.pct || 0));

      return `
        <tr>
          <td>
            <div style="display:flex;align-items:center;gap:10px;">
              ${s.avatar_url
                ? `<img src="${storageUrl(s.avatar_url)}" style="width:34px;height:34px;border-radius:8px;object-fit:cover;flex-shrink:0;" />`
                : `<div class="entity-card__avatar" style="width:34px;height:34px;font-size:0.65rem;flex-shrink:0;">${initials}</div>`}
              <div>
                <div style="font-weight:var(--weight-semibold);font-size:var(--text-sm);color:var(--text-primary);">${s.name}</div>
                <div style="font-size:var(--text-xs);color:var(--text-tertiary);">${s.program}${s.campus ? ' · ' + s.campus : ''}</div>
              </div>
            </div>
          </td>
          <td>
            <div style="font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-primary);">${s.company}</div>
            ${s.posting_title ? `<div style="font-size:var(--text-xs);color:var(--text-secondary);">${s.posting_title}</div>` : ''}
            ${s.location ? `<div style="font-size:var(--text-xs);color:var(--text-tertiary);">${s.location}</div>` : ''}
          </td>
          <td>
            ${reqHours > 0 ? `
            <div class="st-progress-wrap" style="max-width:160px;">
              <div class="st-progress-header">
                <span class="st-progress-hours">${formattedDone} / ${formattedReq}h</span>
                <span class="st-progress-pct" style="color:${barColor};font-weight:700;">${safePct}%</span>
              </div>
              <div class="st-progress-track" style="width:100%;height:6px;background:#E2E8F0;border-radius:9999px;overflow:hidden;">
                <div class="st-progress-fill" style="width:${safePct}%;background:${barColor};height:100%;border-radius:9999px;transition:width 0.3s ease;"></div>
              </div>
            </div>` : `<span style="font-size:var(--text-xs);color:var(--text-tertiary);">${s.duration || 'Tracking not started'}</span>`}
          </td>
          <td><span class="badge badge--${STATUS_COLORS[s.status] || 'neutral'}">${s.status}</span></td>
          <td class="text-right" style="white-space:nowrap;">
            <div class="ojt-action-group">
              <button type="button" class="ojt-btn-icon ojt-btn-icon--view btn-view-trainee" data-idx="${idx}" title="View Full Trainee Details" aria-label="View Details">
                ${icon('eye', 15)}
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
    renderIcons();

    tbody.querySelectorAll('.btn-view-trainee').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.idx, 10);
        const trainee = currentTrainees[idx];
        if (trainee) openTraineeDetailModal(trainee);
      });
    });
  }

  /* ── Trainees Pagination (10 per page) ── */
  let lastTraineeTotal = 0;
  function renderPagination(meta) {
    pagEl.innerHTML = buildPaginationHtml({
      currentPage: meta.current_page || 1,
      totalPages: meta.last_page || 1,
      totalItems: lastTraineeTotal,
      perPage: 10,
      itemName: 'trainees'
    });
    renderIcons();

    pagEl.querySelectorAll('.an-pg-btn[data-p]:not([disabled])').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetPage = parseInt(btn.dataset.p, 10);
        if (targetPage && targetPage !== currentPage) {
          currentPage = targetPage;
          fetchAndRender();
        }
      });
    });
  }

  /* ── Fetch + render (Trainees: 10 per page) ── */
  function applyOjtResponse(res) {
    if (!res || res.message) {
      tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><h3 class="empty-state__title">Failed to load</h3><p class="empty-state__text">${res?.message || 'Check your connection or login session.'}</p></div></td></tr>`;
      return;
    }

    if (res.stats) renderStats(res.stats);
    lastTraineeTotal = res.total != null ? res.total : 0;
    countEl.textContent = res.total != null ? `${res.total} trainee${res.total !== 1 ? 's' : ''}` : '';
    renderRows(Array.isArray(res.data) ? res.data : []);
    renderPagination({ current_page: res.current_page, last_page: res.last_page });
  }

  async function fetchAndRender(force = false) {
    const search = container.querySelector('#ojt-search').value.trim();
    const status = container.querySelector('#filter-status').value;
    const params = new URLSearchParams({ per_page: 10, page: currentPage });
    if (search) params.set('search', search);
    if (status) params.set('status', status);

    const url = `/admin/ojt?${params}`;
    const cached = !force ? getCached(url) : null;

    if (cached?.data) {
      applyOjtResponse(cached.data);
    } else {
      tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state"><p class="empty-state__text" style="display:flex;align-items:center;gap:6px;">${icon('refresh-cw', 14)} Loading…</p></div></td></tr>`;
      pagEl.innerHTML = '';
      renderIcons();
    }

    const res = await apiGetCached(url, {
      force,
      onUpdate: (fresh) => applyOjtResponse(fresh),
    });

    if (res && !cached) {
      applyOjtResponse(res);
    }
  }

  fetchAndRender();

  /* ── Filter listeners ── */
  container.querySelector('#ojt-search').addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => { currentPage = 1; fetchAndRender(); }, 400);
  });
  container.querySelector('#filter-status').addEventListener('change', () => {
    currentPage = 1;
    fetchAndRender();
  });

  /* ── Load Supervisors (3 per page) ── */
  let currentSupervisors = [];
  let supCurrentPage = 1;
  const supPerPage = 3;
  const supPagEl = container.querySelector('#sup-pagination');

  function renderSupervisorsTable() {
    const stb = container.querySelector('#sup-tbody');
    if (!stb) return;

    const supCountText = container.querySelector('#sup-count-text');
    if (supCountText) {
      supCountText.textContent = `${currentSupervisors.length} Coordinator${currentSupervisors.length !== 1 ? 's' : ''}`;
    }

    if (!currentSupervisors.length) {
      stb.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--text-tertiary);padding:32px;">No coordinators registered yet</td></tr>`;
      if (supPagEl) supPagEl.innerHTML = '';
      return;
    }

    const supTotalPages = Math.max(1, Math.ceil(currentSupervisors.length / supPerPage));
    if (supCurrentPage > supTotalPages) supCurrentPage = supTotalPages;
    if (supCurrentPage < 1) supCurrentPage = 1;

    const pageSlice = currentSupervisors.slice((supCurrentPage - 1) * supPerPage, supCurrentPage * supPerPage);

    stb.innerHTML = pageSlice.map(s => {
      const init = (s.name || 'CO').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
      const cDisp = formatCourseDisplay(s.course || '');
      const cMeta = getCourseMeta(s.course || '');
      return `
        <tr>
          <td>
            <div style="display:flex;align-items:center;gap:10px;">
              <div class="entity-card__avatar" style="width:34px;height:34px;font-size:0.68rem;background:linear-gradient(135deg,rgba(0,89,48,0.12),rgba(16,185,129,0.06));border:1px solid rgba(0,89,48,0.18);color:#005930;font-weight:700;border-radius:8px;flex-shrink:0;">${init}</div>
              <div>
                <div style="font-weight:var(--weight-semibold);font-size:var(--text-sm);color:var(--text-primary);">${s.name}</div>
                <div style="font-size:var(--text-xs);color:var(--text-tertiary);">Academic Coordinator</div>
              </div>
            </div>
          </td>
          <td style="font-size:var(--text-sm);color:var(--text-secondary);font-weight:500;">${s.email}</td>
          <td>
            <span class="badge" style="background:#ECFDF5;color:#047857;border:1px solid #A7F3D0;font-size:0.7rem;font-weight:600;padding:2px 8px;border-radius:6px;">
              ${s.campus || 'Alijis Campus'}
            </span>
          </td>
          <td>
            <div style="display:flex;flex-direction:column;gap:3px;max-width:320px;">
              <span style="font-size:0.82rem;font-weight:600;color:var(--text-primary);line-height:1.35;" title="${s.course || ''}">
                ${s.course || '—'}
              </span>
              ${cMeta.category ? `<span style="font-size:0.7rem;color:var(--text-tertiary);">${cMeta.category}</span>` : ''}
            </div>
          </td>
          <td style="font-size:var(--text-xs);color:var(--text-tertiary);">${s.created_at || '—'}</td>
          <td class="text-right" style="white-space:nowrap;">
            <div class="ojt-action-group">
              <button type="button" class="ojt-btn-icon ojt-btn-icon--mail btn-resend-supervisor" data-id="${s.id}" data-name="${s.name}" data-email="${s.email}" title="Reset Temporary Password &amp; Resend Welcome Email" aria-label="Resend Email">
                ${icon('mail', 15)}
              </button>
              <button type="button" class="ojt-btn-icon ojt-btn-icon--delete btn-del-supervisor" data-id="${s.id}" data-name="${s.name}" title="Remove Coordinator" aria-label="Remove Coordinator">
                ${icon('trash-2', 15)}
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    renderIcons();

    if (supPagEl) {
      supPagEl.innerHTML = buildPaginationHtml({
        currentPage: supCurrentPage,
        totalPages: supTotalPages,
        totalItems: currentSupervisors.length,
        perPage: supPerPage,
        itemName: 'coordinators'
      });
      renderIcons();

      supPagEl.querySelectorAll('.an-pg-btn[data-p]:not([disabled])').forEach(btn => {
        btn.addEventListener('click', () => {
          const targetPage = parseInt(btn.dataset.p, 10);
          if (targetPage && targetPage !== supCurrentPage) {
            supCurrentPage = targetPage;
            renderSupervisorsTable();
          }
        });
      });
    }

    stb.querySelectorAll('.btn-resend-supervisor').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const name = btn.dataset.name;
        const email = btn.dataset.email;
        if (!confirm(`Reset temporary password and resend welcome email to coordinator "${name}" (${email})?`)) return;
        btn.disabled = true;
        btn.innerHTML = `<span class="spinner-sm" style="margin:0;"></span>`;
        try {
          const res = await apiPost(`/admin/supervisors/${id}/resend-welcome`, {});
          if (res?.success) {
            alert(`${res.message}\n\nTemporary Password: ${res.temp_password}`);
          } else {
            alert(res?.message || 'Failed to resend welcome email.');
          }
        } catch {
          alert('Network error while requesting password reset.');
        } finally {
          btn.disabled = false;
          btn.innerHTML = icon('mail', 15);
          renderIcons();
        }
      });
    });

    stb.querySelectorAll('.btn-del-supervisor').forEach(btn => {
      btn.addEventListener('mouseenter', () => { btn.style.color = '#DC2626'; btn.style.background = 'rgba(239,68,68,0.1)'; });
      btn.addEventListener('mouseleave', () => { btn.style.color = 'var(--color-error,#ef4444)'; btn.style.background = 'transparent'; });
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const name = btn.dataset.name;
        if (!confirm(`Are you sure you want to remove coordinator "${name}"?`)) return;
        btn.disabled = true;
        try {
          const delRes = await apiDelete(`/admin/supervisors/${id}`);
          if (delRes?.success) {
            loadSupervisors(true);
          } else {
            alert(delRes?.message || 'Failed to remove coordinator.');
            btn.disabled = false;
          }
        } catch {
          alert('Network error while attempting to remove coordinator.');
          btn.disabled = false;
        }
      });
    });
  }

  function renderSupervisors(stb, list) {
    currentSupervisors = list || [];
    renderSupervisorsTable();
  }

  async function loadSupervisors(force = false) {
    const stb = container.querySelector('#sup-tbody');
    if (!stb) return;
    const cached = !force ? getCached('/admin/supervisors') : null;
    if (cached?.data) {
      renderSupervisors(stb, cached.data?.data ?? cached.data ?? []);
    }
    const res = await apiGetCached('/admin/supervisors', {
      force,
      onUpdate: (fresh) => {
        renderSupervisors(stb, fresh?.data ?? fresh ?? []);
      }
    });
    if (res && !cached) {
      renderSupervisors(stb, res?.data ?? res ?? []);
    }
  }
  loadSupervisors();

  /* ── Load Pull-Out Requests (5 per page) ── */
  let allPullOuts = [];
  let pullOutCurrentPage = 1;
  const pullOutPerPage = 5;
  const poPagEl = container.querySelector('#pullout-pagination');

  async function loadPullOutRequests(force = false) {
    const ptbody = container.querySelector('#pullout-tbody');
    if (!ptbody) return;

    try {
      const res = await apiGet('/admin/pull-out-requests');
      allPullOuts = Array.isArray(res?.data) ? res.data : [];
      renderPullOutTable();
    } catch (err) {
      ptbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--text-tertiary);padding:20px;">Could not load pull-out requests: ${err.message}</td></tr>`;
      if (poPagEl) poPagEl.innerHTML = '';
    }
  }

  function renderPullOutTable() {
    const ptbody = container.querySelector('#pullout-tbody');
    const badgeCount = container.querySelector('#pullout-badge-count');
    if (!ptbody) return;

    const statusFilter = container.querySelector('#filter-pullout-status')?.value || '';

    const pendingCount = allPullOuts.filter(p => p.status === 'recommended_by_supervisor' || p.status === 'pending_supervisor').length;
    if (badgeCount) {
      if (pendingCount > 0) {
        badgeCount.style.display = 'inline-block';
        badgeCount.textContent = `${pendingCount} Action Needed`;
      } else {
        badgeCount.style.display = 'none';
      }
    }

    let filtered = allPullOuts;
    if (statusFilter) {
      filtered = allPullOuts.filter(p => p.status === statusFilter);
    }

    if (!filtered.length) {
      ptbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--text-tertiary);padding:32px;">No pull-out requests found in this filter view.</td></tr>`;
      if (poPagEl) poPagEl.innerHTML = '';
      return;
    }

    const pullOutTotalPages = Math.max(1, Math.ceil(filtered.length / pullOutPerPage));
    if (pullOutCurrentPage > pullOutTotalPages) pullOutCurrentPage = pullOutTotalPages;
    if (pullOutCurrentPage < 1) pullOutCurrentPage = 1;

    const pageSlice = filtered.slice((pullOutCurrentPage - 1) * pullOutPerPage, pullOutCurrentPage * pullOutPerPage);

    ptbody.innerHTML = pageSlice.map(p => {
      const statusBadge = 
        p.status === 'recommended_by_supervisor' ? '<span class="badge badge--warning" style="font-size:0.7rem;font-weight:600;padding:2px 8px;border-radius:6px;">Recommended &bull; Action Needed</span>' :
        p.status === 'printed_pending_signature' ? '<span class="badge" style="background:#EEF2FF;color:#4338ca;font-weight:700;font-size:0.7rem;padding:2px 8px;border-radius:6px;">Printed &bull; Awaiting Signature</span>' :
        p.status === 'emailed_to_dean' ? '<span class="badge badge--info" style="font-size:0.7rem;font-weight:600;padding:2px 8px;border-radius:6px;">Emailed &bull; Awaiting Dean Reply</span>' :
        p.status === 'approved' ? '<span class="badge badge--success" style="font-size:0.7rem;font-weight:600;padding:2px 8px;border-radius:6px;">Approved by Dean</span>' :
        p.status === 'rejected' ? '<span class="badge badge--error" style="font-size:0.7rem;font-weight:600;padding:2px 8px;border-radius:6px;">Declined</span>' :
        '<span class="badge badge--neutral" style="font-size:0.7rem;padding:2px 8px;border-radius:6px;">Pending Coordinator</span>';

      const stInit = (p.student_name || 'S').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

      return `
        <tr>
          <td>
            <div style="display:flex;align-items:center;gap:10px;">
              <div class="entity-card__avatar" style="width:34px;height:34px;font-size:0.68rem;background:linear-gradient(135deg,rgba(99,102,241,0.12),rgba(139,92,246,0.06));border:1px solid rgba(99,102,241,0.18);color:#4F46E5;font-weight:700;border-radius:8px;flex-shrink:0;">${stInit}</div>
              <div>
                <div style="font-weight:var(--weight-semibold);font-size:var(--text-sm);color:var(--text-primary);">${p.student_name}</div>
                <div style="font-size:var(--text-xs);color:var(--text-tertiary);">${p.student_number || 'No ID'} &bull; ${p.student_email || ''}</div>
              </div>
            </div>
          </td>
          <td>
            <div style="font-size:0.8rem;font-weight:600;color:var(--text-primary);max-width:200px;line-height:1.3;" title="${p.course}">${p.course}</div>
            <div style="font-size:var(--text-xs);color:var(--text-tertiary);margin-top:2px;">Section: <strong style="color:var(--text-secondary);">${p.section || '—'}</strong></div>
          </td>
          <td>
            <div style="font-size:0.82rem;font-weight:600;color:var(--text-primary);">${p.company_name}</div>
            <div style="font-size:var(--text-xs);color:var(--text-tertiary);margin-top:2px;">${p.hours_rendered_snapshot} / ${p.required_hours_snapshot} hrs rendered</div>
          </td>
          <td>
            <span class="badge badge--neutral" style="text-transform:capitalize;font-size:0.7rem;font-weight:600;padding:2px 8px;border-radius:6px;">
              ${(p.reason_category || '').replace(/_/g, ' ')}
            </span>
          </td>
          <td>
            <div style="font-size:0.78rem;font-weight:600;color:var(--text-primary);">${p.supervisor_name || 'Coordinator'}</div>
            <div style="font-size:var(--text-xs);color:var(--text-tertiary);max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-top:2px;" title="${p.supervisor_remarks || ''}">
              ${p.supervisor_remarks || 'No remarks'}
            </div>
          </td>
          <td>${statusBadge}</td>
          <td class="text-right" style="white-space:nowrap;">
            <div class="ojt-action-group">
              <button type="button" class="ojt-btn-icon ojt-btn-icon--primary btn-process-pullout" data-id="${p.id}" title="Process Dean Endorsement &amp; Official Letter" aria-label="Process Request">
                ${icon('file-text', 15)}
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    renderIcons();

    if (poPagEl) {
      poPagEl.innerHTML = buildPaginationHtml({
        currentPage: pullOutCurrentPage,
        totalPages: pullOutTotalPages,
        totalItems: filtered.length,
        perPage: pullOutPerPage,
        itemName: 'requests'
      });
      renderIcons();

      poPagEl.querySelectorAll('.an-pg-btn[data-p]:not([disabled])').forEach(btn => {
        btn.addEventListener('click', () => {
          const targetPage = parseInt(btn.dataset.p, 10);
          if (targetPage && targetPage !== pullOutCurrentPage) {
            pullOutCurrentPage = targetPage;
            renderPullOutTable();
          }
        });
      });
    }

    ptbody.querySelectorAll('.btn-process-pullout').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.dataset.id, 10);
        const po = allPullOuts.find(x => x.id === id);
        if (po) {
          openAdminPullOutModal(po, () => {
            loadPullOutRequests(true);
          });
        }
      });
    });
  }

  container.querySelector('#filter-pullout-status')?.addEventListener('change', () => {
    pullOutCurrentPage = 1;
    renderPullOutTable();
  });
  loadPullOutRequests();

  // Real-time reactive updates when supervisor recommends or pull-out updates occur
  const onPullOutNotification = (e) => {
    if (!document.body.contains(container)) {
      window.removeEventListener('hireme:notification-received', onPullOutNotification);
      return;
    }
    const notifs = Array.isArray(e.detail) ? e.detail : [e.detail];
    const hasPullOutEvent = notifs.some(n => (n?.type || '').includes('pull_out'));
    if (hasPullOutEvent) {
      loadPullOutRequests();
    }
  };
  window.addEventListener('hireme:notification-received', onPullOutNotification);

  /* ── Load Analytics ── */
  function renderAnalyticsData(res) {
    if (!res || res.message) return;
    if (!container.querySelector('#analytics-summary')) return;
    const sm = res.summary || {};
    const sb = res.statusBreakdown || {};

    // Summary mini-stats
    const summaryEl = container.querySelector('#analytics-summary');
    const miniStats = [
      {label:'Deployed',val:sm.totalDeployed||0,ic:'check-circle',color:'#10B981',bg:'rgba(16,185,129,.12)'},
      {label:'Endorsed',val:sm.totalEndorsed||0,ic:'clipboard',color:'#8B5CF6',bg:'rgba(139,92,246,.12)'},
      {label:'Supervisors',val:sm.supervisorCount||0,ic:'user-check',color:'#3B82F6',bg:'rgba(59,130,246,.12)'},
      {label:'Trainee/Supervisor',val:sm.traineeRatio||0,ic:'activity',color:'#F59E0B',bg:'rgba(245,158,11,.12)'},
    ];
    summaryEl.innerHTML = miniStats.map(s => `
      <div style="background:var(--bg-elevated);border:1px solid var(--border-subtle);border-radius:12px;padding:14px 16px;display:flex;align-items:center;gap:12px;">
        <div style="width:36px;height:36px;border-radius:10px;background:${s.bg};color:${s.color};display:flex;align-items:center;justify-content:center;flex-shrink:0;">${icon(s.ic,16)}</div>
        <div><div style="font-size:1.15rem;font-weight:var(--weight-bold);line-height:1.2;">${s.val}</div><div style="font-size:var(--text-xs);color:var(--text-tertiary);">${s.label}</div></div>
      </div>`).join('');
    renderIcons();

    // Status Donut with center label
    const ongoingCount = (sb.ongoing != null ? sb.ongoing : sb.onTrack) || 0;
    const statusItems = [
      {label:'Ongoing',val:ongoingCount,color:'#10B981'},
      {label:'Completed',val:sb.completed||0,color:'#3B82F6'},
      {label:'Pipeline Pending',val:sb.pending||0,color:'#8B5CF6'},
    ];
    const total = statusItems.reduce((a,b)=>a+b.val,0)||1;
    let offset=0;
    const circumference = 2 * Math.PI * 38;
    const segs = statusItems.filter(s=>s.val>0).map(s=>{
      const pct=s.val/total; const len=pct*circumference; const gap=circumference-len;
      const seg=`<circle cx="60" cy="60" r="38" fill="none" stroke="${s.color}" stroke-width="12" stroke-dasharray="${len.toFixed(1)} ${gap.toFixed(1)}" stroke-dashoffset="-${offset.toFixed(1)}" stroke-linecap="round" style="transition:stroke-dasharray .8s,stroke-dashoffset .8s;"/>`;
      offset+=len; return seg;
    }).join('');
    container.querySelector('#chart-status').innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
        <h3 style="font-size:.85rem;font-weight:var(--weight-semibold);margin:0;">Status Breakdown</h3>
        <span style="font-size:var(--text-xs);color:var(--text-tertiary);">${total} total</span>
      </div>
      <div style="display:flex;align-items:center;gap:28px;">
        <div style="position:relative;flex-shrink:0;">
          <svg viewBox="0 0 120 120" width="140" height="140" style="transform:rotate(-90deg);">
            <circle cx="60" cy="60" r="38" fill="none" stroke="var(--border-subtle)" stroke-width="12" opacity=".3"/>
            ${segs}
          </svg>
          <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;">
            <span style="font-size:1.5rem;font-weight:800;line-height:1;">${total}</span>
            <span style="font-size:.6rem;color:var(--text-tertiary);margin-top:2px;">TRAINEES</span>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;flex:1;">
          ${statusItems.map(s => {
            const pct = total > 0 ? Math.round(s.val/total*100) : 0;
            return `<div style="display:flex;align-items:center;gap:8px;">
              <div style="width:8px;height:8px;border-radius:50%;background:${s.color};flex-shrink:0;"></div>
              <span style="font-size:var(--text-xs);flex:1;">${s.label}</span>
              <span style="font-size:var(--text-xs);font-weight:var(--weight-semibold);min-width:20px;text-align:right;">${s.val}</span>
              <span style="font-size:9px;color:var(--text-tertiary);width:30px;text-align:right;">${pct}%</span>
            </div>`;
          }).join('')}
        </div>
      </div>`;

    // Hours Histogram
    const hh = res.hoursHistogram||{};
    const hhEntries = Object.entries(hh);
    const maxHh = Math.max(...hhEntries.map(e=>e[1]),1);
    const barGradients = ['linear-gradient(180deg,#EF4444,#DC2626)','linear-gradient(180deg,#F59E0B,#D97706)','linear-gradient(180deg,#3B82F6,#2563EB)','linear-gradient(180deg,#10B981,#059669)'];
    const barLabels = ['Early Stage','In Progress','Almost There','Complete'];
    container.querySelector('#chart-histogram').innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
        <h3 style="font-size:.85rem;font-weight:var(--weight-semibold);margin:0;">Hours Completion</h3>
        <span style="font-size:var(--text-xs);color:var(--text-tertiary);">by progress range</span>
      </div>
      <div style="position:relative;height:160px;display:flex;align-items:flex-end;gap:16px;padding:0 8px;">
        ${[75,50,25].map(v => `<div style="position:absolute;left:0;right:0;bottom:${v/100*140}px;border-bottom:1px dashed var(--border-subtle);opacity:.3;"></div>`).join('')}
        ${hhEntries.map(([label,val],i) => {
          const h = maxHh > 0 ? Math.max(val/maxHh*140,6) : 6;
          return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:6px;z-index:1;">
            <span style="font-size:.75rem;font-weight:700;">${val}</span>
            <div style="width:100%;max-width:52px;background:${barGradients[i]};border-radius:8px 8px 4px 4px;height:${h}px;box-shadow:0 2px 8px ${['rgba(239,68,68,.3)','rgba(245,158,11,.3)','rgba(59,130,246,.3)','rgba(16,185,129,.3)'][i]};transition:height .6s;"></div>
            <div style="text-align:center;"><div style="font-size:9px;font-weight:600;color:var(--text-secondary);">${label}</div><div style="font-size:8px;color:var(--text-tertiary);">${barLabels[i]}</div></div>
          </div>`;
        }).join('')}
      </div>`;

    // Company Distribution
    const cd = res.companyDistribution||{};
    const cdEntries = Object.entries(cd);
    const maxCd = Math.max(...cdEntries.map(e=>e[1]),1);
    const companyColors = ['#6366F1','#8B5CF6','#EC4899','#F59E0B','#10B981','#3B82F6','#EF4444','#14B8A6','#F97316','#6B7280'];
    container.querySelector('#chart-companies').innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
        <h3 style="font-size:.85rem;font-weight:var(--weight-semibold);margin:0;">Company Distribution</h3>
        <span style="font-size:var(--text-xs);color:var(--text-tertiary);">${cdEntries.length} partner${cdEntries.length!==1?'s':''}</span>
      </div>
      ${cdEntries.length ? cdEntries.map(([name,val],i) => {
        const pct = Math.round(val/maxCd*100);
        const c = companyColors[i % companyColors.length];
        return `<div style="margin-bottom:12px;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;">
            <div style="display:flex;align-items:center;gap:8px;font-size:var(--text-xs);">
              <div style="width:6px;height:6px;border-radius:50%;background:${c};flex-shrink:0;"></div>
              <span style="font-weight:var(--weight-medium);">${name}</span>
            </div>
            <span style="font-size:var(--text-xs);font-weight:var(--weight-bold);color:${c};">${val} trainee${val!==1?'s':''}</span>
          </div>
          <div style="height:8px;background:var(--border-subtle);border-radius:4px;overflow:hidden;">
            <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,${c},${c}cc);border-radius:4px;transition:width .6s;"></div>
          </div>
        </div>`;
      }).join('') : '<div style="display:flex;flex-direction:column;align-items:center;padding:30px;color:var(--text-tertiary);"><div style="width:40px;height:40px;border-radius:50%;background:var(--border-subtle);display:flex;align-items:center;justify-content:center;margin-bottom:8px;">' + icon('building-2',18) + '</div><p style="font-size:var(--text-sm);margin:0;">No deployments yet</p></div>'}`;

    // Top Positions
    const tp = res.topPositions||{};
    const tpEntries = Object.entries(tp);
    const medalColors = ['#F59E0B','#94A3B8','#CD7F32'];
    container.querySelector('#chart-positions').innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
        <h3 style="font-size:.85rem;font-weight:var(--weight-semibold);margin:0;">Top OJT Positions</h3>
        <span style="font-size:var(--text-xs);color:var(--text-tertiary);">${tpEntries.length} role${tpEntries.length!==1?'s':''}</span>
      </div>
      ${tpEntries.length ? `<div style="display:flex;flex-direction:column;gap:6px;">
        ${tpEntries.map(([title,cnt],i) => {
          const mc = i < 3 ? medalColors[i] : 'var(--text-tertiary)';
          const bg = i < 3 ? mc + '18' : 'var(--border-subtle)';
          return `<div style="display:flex;align-items:center;gap:10px;padding:8px 10px;border-radius:8px;background:${i===0 ? 'rgba(245,158,11,.06)' : 'transparent'};border:1px solid ${i===0 ? 'rgba(245,158,11,.15)' : 'transparent'};transition:background .2s;">
            <div style="width:24px;height:24px;border-radius:50%;background:${bg};color:${mc};display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;flex-shrink:0;">${i<3 ? `<span style="display:inline-flex;align-items:center;justify-content:center;">${icon('medal', 14)}</span>` : i+1}</div>
            <span style="flex:1;font-size:var(--text-sm);font-weight:var(--weight-medium);">${title}</span>
            <span style="font-size:var(--text-xs);font-weight:var(--weight-bold);background:var(--border-subtle);padding:2px 8px;border-radius:10px;">${cnt}</span>
          </div>`;
        }).join('')}
      </div>` : '<div style="display:flex;flex-direction:column;align-items:center;padding:30px;color:var(--text-tertiary);"><div style="width:40px;height:40px;border-radius:50%;background:var(--border-subtle);display:flex;align-items:center;justify-content:center;margin-bottom:8px;">' + icon('briefcase',18) + '</div><p style="font-size:var(--text-sm);margin:0;">No positions yet</p></div>'}`;
  }

  async function loadAnalytics(force = false) {
    const cached = !force ? getCached('/admin/ojt-analytics') : null;
    if (cached?.data) {
      renderAnalyticsData(cached.data);
    }
    const res = await apiGetCached('/admin/ojt-analytics', {
      force,
      onUpdate: (fresh) => renderAnalyticsData(fresh),
    });
    if (res && !cached) {
      renderAnalyticsData(res);
    }
  }
  loadAnalytics();

  /* ── Register Supervisor Modal ── */
  container.querySelector('#btn-register-supervisor').addEventListener('click', () => {
    const existing = container.querySelector('.modal-backdrop');
    if (existing) existing.remove();

    const courseCountMap = {};
    currentSupervisors.forEach(s => {
      if (s.course) {
        courseCountMap[s.course] = (courseCountMap[s.course] || 0) + 1;
      }
    });

    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.innerHTML = `
      <div class="modal ac-modal sup-modal" style="max-width:540px;width:95vw;">

        <!-- Header -->
        <div class="ac-modal__header" style="background:linear-gradient(135deg,var(--color-primary-bg-strong),var(--color-primary-bg));">
          <div class="ac-modal__header-left">
            <div class="ac-modal__icon" style="background:linear-gradient(135deg,#6366F1,#8B5CF6);color:#fff;">
              ${icon('user-check', 20)}
            </div>
            <div>
              <h3 class="ac-modal__title">Register Supervisor</h3>
              <p class="ac-modal__subtitle">Create an OJT coordinator account for a program</p>
            </div>
          </div>
          <button class="modal__close" id="sup-close">${icon('x', 16)}</button>
        </div>

        <!-- Status Banner -->
        <div class="ac-modal__status-banner">
          ${icon('shield', 14)}
          <span>Supervisor will receive a <strong>temporary password</strong> to log in and manage assigned trainees.</span>
        </div>

        <div class="ac-modal__body">
          <form id="sup-form" novalidate>

            <!-- Section 1: Account Info -->
            <div class="ac-section">
              <div class="ac-section__label">
                <span class="ac-section__num">1</span>
                Account Information
              </div>
              <div class="ac-grid ac-grid--3col">
                <div class="ac-field ac-field--full">
                  <label class="ac-label">Full Name <span class="ac-req">*</span></label>
                  <div class="ac-input-wrap" id="wrap-sup-name">
                    <span class="ac-input-icon">${icon('user', 15)}</span>
                    <input class="ac-input" id="sup-name" type="text" placeholder="e.g. Juan Dela Cruz" />
                  </div>
                  <span class="ac-error" id="err-sup-name"></span>
                </div>
                <div class="ac-field ac-field--full">
                  <label class="ac-label">Email Address <span class="ac-req">*</span></label>
                  <div class="ac-input-wrap" id="wrap-sup-email">
                    <span class="ac-input-icon">${icon('mail', 15)}</span>
                    <input class="ac-input" id="sup-email" type="email" placeholder="supervisor@company.com" autocomplete="email" />
                  </div>
                  <span class="ac-error" id="err-sup-email"></span>
                </div>
              </div>
            </div>

            <!-- Section 2: Campus Assignment -->
            <div class="ac-section">
              <div class="ac-section__label">
                <span class="ac-section__num">2</span>
                Campus Assignment
              </div>
              <div class="ac-grid">
                <div class="ac-field ac-field--full">
                  <label class="ac-label">Designated CHMSU Campus <span class="ac-req">*</span></label>
                  <div style="display:grid;grid-template-columns:repeat(2, 1fr);gap:8px;" id="sup-campus-grid">
                    ${CAMPUSES.map((camp) => `
                      <button type="button" class="sup-campus-btn ${camp === 'Alijis Campus' ? 'sup-campus-btn--active' : ''}" data-campus="${camp}" style="display:flex;align-items:center;gap:8px;padding:9px 12px;border:1.5px solid ${camp === 'Alijis Campus' ? '#005930' : 'var(--border-subtle)'};border-radius:8px;background:${camp === 'Alijis Campus' ? 'rgba(0,89,48,0.06)' : 'var(--bg-elevated)'};cursor:pointer;text-align:left;font-size:var(--text-xs);font-weight:var(--weight-medium);transition:all .15s;">
                        <span class="sup-campus-radio" style="width:14px;height:14px;border-radius:50%;border:2px solid ${camp === 'Alijis Campus' ? '#005930' : 'var(--text-tertiary)'};display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                          ${camp === 'Alijis Campus' ? '<span style="width:6px;height:6px;border-radius:50%;background:#005930;"></span>' : ''}
                        </span>
                        <span class="sup-campus-text" style="color:${camp === 'Alijis Campus' ? '#005930' : 'var(--text-primary)'};font-weight:${camp === 'Alijis Campus' ? '600' : '500'};">${camp}</span>
                      </button>
                    `).join('')}
                  </div>
                  <input type="hidden" id="sup-campus" name="campus" value="Alijis Campus" />
                  <span class="ac-error" id="err-sup-campus"></span>
                </div>
              </div>
            </div>

            <!-- Section 3: Course -->
            <div class="ac-section ac-section--last">
              <div class="ac-section__label">
                <span class="ac-section__num">3</span>
                Program / Course
              </div>
              <div class="ac-grid">
                <div class="ac-field ac-field--full">
                  <label class="ac-label">Assigned Course <span class="ac-req">*</span></label>
                  
                  <div class="sup-course-picker" id="wrap-sup-course">
                    <input type="hidden" id="sup-course" name="course" value="" />
                    
                    <button type="button" class="sup-course-trigger" id="sup-course-trigger" aria-haspopup="listbox" aria-expanded="false">
                      <span class="sup-course-trigger__icon" id="sup-course-trigger-icon">${icon('graduation-cap', 16)}</span>
                      <div class="sup-course-trigger__content">
                        <span class="sup-course-trigger__placeholder" id="sup-course-placeholder">Select course program</span>
                        <div class="sup-course-trigger__selected" id="sup-course-selected-wrap" style="display:none;"></div>
                      </div>
                      <div class="sup-course-trigger__actions">
                        <span class="sup-course-trigger__clear" id="sup-course-clear" title="Clear selection" style="display:none;">${icon('x', 13)}</span>
                        <span class="sup-course-trigger__chevron">${icon('chevron-down', 16)}</span>
                      </div>
                    </button>

                    <!-- Dropdown Popover Menu -->
                    <div class="sup-course-dropdown" id="sup-course-dropdown" role="listbox">
                      <div class="sup-course-search-wrap">
                        <span class="sup-course-search-icon">${icon('search', 14)}</span>
                        <input type="text" class="sup-course-search-input" id="sup-course-search" placeholder="Search program, code (e.g. BSIT), or college..." autocomplete="off" />
                        <button type="button" class="sup-course-search-clear" id="sup-course-search-clear" style="display:none;" title="Clear search">${icon('x', 12)}</button>
                      </div>

                      <!-- College Filter Tabs -->
                      <div class="sup-college-tabs" id="sup-college-tabs">
                        <button type="button" class="sup-college-tab sup-college-tab--active" data-college="all">
                          All <span class="sup-tab-badge">${COURSES.length}</span>
                        </button>
                        ${COURSE_GROUPS.map(g => `
                          <button type="button" class="sup-college-tab" data-college="${g.id}">
                            ${g.short} <span class="sup-tab-badge">${g.courses.length}</span>
                          </button>
                        `).join('')}
                      </div>

                      <div class="sup-course-list-header">
                        <span>PROGRAMS GROUPED BY COLLEGE</span>
                        <span class="sup-course-count" id="sup-course-count">${COURSES.length} programs</span>
                      </div>
                      <div class="sup-course-list" id="sup-course-list"></div>
                      <div class="sup-course-empty" id="sup-course-empty" style="display:none;">
                        <div class="sup-course-empty__icon">${icon('search', 18)}</div>
                        <div class="sup-course-empty__title">No matching courses</div>
                        <div class="sup-course-empty__hint">Try searching with a different keyword or acronym</div>
                      </div>
                    </div>
                  </div>

                  <span class="ac-error" id="err-sup-course"></span>
                </div>
              </div>
            </div>

            <!-- Server Messages -->
            <div id="sup-server-error" class="ac-server-error" style="display:none;"></div>
            <div id="sup-success" style="display:none;margin:0 24px 16px;background:rgba(16,185,129,.08);border:1px solid rgba(16,185,129,.3);border-radius:var(--radius-md);padding:12px 16px;font-size:var(--text-sm);color:#065F46;"></div>

          </form>
        </div>

        <!-- Footer -->
        <div class="ac-modal__footer">
          <div class="ac-modal__footer-note">
            ${icon('shield', 13)}
            Auto-generated password will be shown after registration
          </div>
          <div class="ac-modal__footer-actions">
            <button class="btn btn--outline btn--sm" id="sup-cancel">Cancel</button>
            <button class="btn btn--primary" id="sup-submit">${icon('user-check', 15)} Register Supervisor</button>
          </div>
        </div>

      </div>
    `;

    container.appendChild(backdrop);
    renderIcons();

    // ── Dropdown Controller ──
    const pickerWrap = backdrop.querySelector('#wrap-sup-course');
    const triggerBtn = backdrop.querySelector('#sup-course-trigger');
    const hiddenCourseInput = backdrop.querySelector('#sup-course');
    const dropdownMenu = backdrop.querySelector('#sup-course-dropdown');
    const searchInput = backdrop.querySelector('#sup-course-search');
    const searchClearBtn = backdrop.querySelector('#sup-course-search-clear');
    const listContainer = backdrop.querySelector('#sup-course-list');
    const emptyState = backdrop.querySelector('#sup-course-empty');
    const countBadgeEl = backdrop.querySelector('#sup-course-count');
    const placeholderEl = backdrop.querySelector('#sup-course-placeholder');
    const selectedWrapEl = backdrop.querySelector('#sup-course-selected-wrap');
    const clearBtn = backdrop.querySelector('#sup-course-clear');
    const triggerIconEl = backdrop.querySelector('#sup-course-trigger-icon');

    let activeCollegeId = 'all';
    let selectedCourse = '';
    let focusedIndex = -1;
    let filteredCourses = [...COURSES];

    function updateTriggerDisplay() {
      if (selectedCourse) {
        const meta = getCourseMeta(selectedCourse);
        const display = formatCourseDisplay(selectedCourse);
        const count = courseCountMap[selectedCourse] || 0;
        const countTag = count > 0
          ? `<span class="sup-course-trigger__badge sup-badge--busy">${icon('user-check', 11)} ${count} active</span>`
          : `<span class="sup-course-trigger__badge sup-badge--free">${icon('check', 11)} Available</span>`;

        placeholderEl.style.display = 'none';
        selectedWrapEl.innerHTML = `
          <span class="sup-course-trigger__code">${meta.code}</span>
          <div class="sup-course-trigger__text">
            <span class="sup-course-trigger__title" title="${selectedCourse}">
              ${display.isTrade ? `${display.primaryTitle} (${display.degreeBadge})` : selectedCourse}
            </span>
            <span class="sup-course-trigger__sub">${meta.category}</span>
          </div>
          ${countTag}
        `;
        selectedWrapEl.style.display = 'flex';
        clearBtn.style.display = 'flex';
        triggerIconEl.innerHTML = icon(meta.icon || 'graduation-cap', 16);
      } else {
        placeholderEl.style.display = 'block';
        selectedWrapEl.innerHTML = '';
        selectedWrapEl.style.display = 'none';
        clearBtn.style.display = 'none';
        triggerIconEl.innerHTML = icon('graduation-cap', 16);
      }
    }

    function renderOptions(query = '') {
      const q = query.trim().toLowerCase();

      let totalVisibleCourses = 0;
      const visibleGroups = [];
      const flatListForFocus = [];

      COURSE_GROUPS.forEach(group => {
        if (activeCollegeId !== 'all' && group.id !== activeCollegeId) {
          return;
        }

        const matchedInGroup = group.courses.filter(c => {
          if (!q) return true;
          const meta = getCourseMeta(c);
          return c.toLowerCase().includes(q) ||
                 meta.code.toLowerCase().includes(q) ||
                 meta.category.toLowerCase().includes(q) ||
                 group.group.toLowerCase().includes(q) ||
                 group.short.toLowerCase().includes(q);
        });

        if (matchedInGroup.length > 0) {
          totalVisibleCourses += matchedInGroup.length;
          matchedInGroup.forEach(c => flatListForFocus.push(c));
          visibleGroups.push({
            group,
            courses: matchedInGroup,
          });
        }
      });

      filteredCourses = flatListForFocus;
      countBadgeEl.textContent = `${totalVisibleCourses} program${totalVisibleCourses === 1 ? '' : 's'}`;

      if (totalVisibleCourses === 0) {
        listContainer.style.display = 'none';
        emptyState.style.display = 'flex';
        return;
      }

      listContainer.style.display = 'flex';
      emptyState.style.display = 'none';

      let runningIndex = 0;
      listContainer.innerHTML = visibleGroups.map(({ group, courses }) => {
        const groupItemsHtml = courses.map(c => {
          const meta = getCourseMeta(c);
          const display = formatCourseDisplay(c);
          const count = courseCountMap[c] || 0;
          const isSelected = c === selectedCourse;
          const isFocused = runningIndex === focusedIndex;
          runningIndex++;

          const countTag = count > 0
            ? `<span class="sup-item-badge sup-item-badge--busy">${icon('user-check', 11)} ${count} active coordinator${count > 1 ? 's' : ''}</span>`
            : `<span class="sup-item-badge sup-item-badge--free">${icon('check', 11)} Available &bull; No coordinator</span>`;

          return `
            <div class="sup-course-item ${isSelected ? 'sup-course-item--selected' : ''} ${isFocused ? 'sup-course-item--focused' : ''}" 
                 data-course="${c}" 
                 role="option" 
                 aria-selected="${isSelected}"
                 tabindex="-1">
              <div class="sup-course-item__avatar" style="background:${group.badgeBg};border:1px solid ${group.color}22;">
                <span class="sup-course-item__code" style="color:${group.color};">${meta.code}</span>
              </div>
              <div class="sup-course-item__info">
                <div class="sup-course-item__name">
                  ${display.primaryTitle}
                </div>
                <div class="sup-course-item__meta">
                  ${display.degreeBadge ? `<span class="sup-course-item__degree-tag">${display.degreeBadge}</span>` : ''}
                  <span class="sup-course-item__dept">${meta.category}</span>
                  <span style="opacity:0.35;">&bull;</span>
                  ${countTag}
                </div>
              </div>
              <div class="sup-course-item__check">
                ${icon('check', 15)}
              </div>
            </div>
          `;
        }).join('');

        return `
          <div class="sup-course-group-card">
            <div class="sup-course-group-header">
              <div class="sup-course-group-left">
                <span class="sup-course-group-icon" style="color:${group.color};background:${group.badgeBg};">
                  ${icon(group.icon, 13)}
                </span>
                <span class="sup-course-group-name">${group.group}</span>
              </div>
              <span class="sup-course-group-pill">${courses.length} ${courses.length === 1 ? 'program' : 'programs'}</span>
            </div>
            <div class="sup-course-group-items">
              ${groupItemsHtml}
            </div>
          </div>
        `;
      }).join('');

      renderIcons();

      listContainer.querySelectorAll('.sup-course-item').forEach(itemEl => {
        itemEl.addEventListener('click', (e) => {
          e.stopPropagation();
          const chosen = itemEl.getAttribute('data-course');
          selectCourse(chosen);
        });
      });
    }

    // College tabs filter handler
    backdrop.querySelectorAll('.sup-college-tab').forEach(tabBtn => {
      tabBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        activeCollegeId = tabBtn.getAttribute('data-college') || 'all';
        backdrop.querySelectorAll('.sup-college-tab').forEach(t => {
          t.classList.toggle('sup-college-tab--active', t.getAttribute('data-college') === activeCollegeId);
        });
        focusedIndex = -1;
        renderOptions(searchInput.value);
      });
    });

    function selectCourse(course) {
      selectedCourse = course;
      hiddenCourseInput.value = course;
      updateTriggerDisplay();
      closeDropdown();

      const errEl = backdrop.querySelector('#err-sup-course');
      if (errEl) { errEl.textContent = ''; errEl.style.display = 'none'; }
      pickerWrap.classList.remove('ac-input-wrap--error');
    }

    function clearCourseSelection() {
      selectedCourse = '';
      hiddenCourseInput.value = '';
      updateTriggerDisplay();
      renderOptions(searchInput.value);
    }

    function openDropdown() {
      if (pickerWrap.classList.contains('is-open')) return;

      const rect = triggerBtn.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      if (spaceBelow < 280 && rect.top > 280) {
        dropdownMenu.classList.add('sup-course-dropdown--upward');
      } else {
        dropdownMenu.classList.remove('sup-course-dropdown--upward');
      }

      pickerWrap.classList.add('is-open');
      triggerBtn.setAttribute('aria-expanded', 'true');
      renderOptions(searchInput.value);

      setTimeout(() => {
        searchInput.focus();
      }, 50);
    }

    function closeDropdown() {
      if (!pickerWrap.classList.contains('is-open')) return;
      pickerWrap.classList.remove('is-open');
      triggerBtn.setAttribute('aria-expanded', 'false');
      dropdownMenu.classList.remove('sup-course-dropdown--upward');
      focusedIndex = -1;
    }

    function toggleDropdown() {
      if (pickerWrap.classList.contains('is-open')) {
        closeDropdown();
      } else {
        openDropdown();
      }
    }

    triggerBtn.addEventListener('click', (e) => {
      e.preventDefault();
      toggleDropdown();
    });

    clearBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      clearCourseSelection();
    });

    searchInput.addEventListener('input', () => {
      searchClearBtn.style.display = searchInput.value ? 'flex' : 'none';
      focusedIndex = 0;
      renderOptions(searchInput.value);
    });

    searchClearBtn.addEventListener('click', () => {
      searchInput.value = '';
      searchClearBtn.style.display = 'none';
      focusedIndex = -1;
      renderOptions('');
      searchInput.focus();
    });

    const onPickerKeydown = (e) => {
      if (!pickerWrap.classList.contains('is-open')) {
        if (document.activeElement === triggerBtn && (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          openDropdown();
        }
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        closeDropdown();
        triggerBtn.focus();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (filteredCourses.length > 0) {
          focusedIndex = (focusedIndex + 1) % filteredCourses.length;
          renderOptions(searchInput.value);
          const focusedEl = listContainer.querySelector('.sup-course-item--focused');
          if (focusedEl) focusedEl.scrollIntoView({ block: 'nearest' });
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (filteredCourses.length > 0) {
          focusedIndex = (focusedIndex - 1 + filteredCourses.length) % filteredCourses.length;
          renderOptions(searchInput.value);
          const focusedEl = listContainer.querySelector('.sup-course-item--focused');
          if (focusedEl) focusedEl.scrollIntoView({ block: 'nearest' });
        }
      } else if (e.key === 'Enter') {
        if (filteredCourses.length > 0) {
          e.preventDefault();
          const targetIndex = focusedIndex >= 0 && focusedIndex < filteredCourses.length ? focusedIndex : 0;
          selectCourse(filteredCourses[targetIndex]);
        }
      }
    };

    backdrop.addEventListener('keydown', onPickerKeydown);

    const onDocClick = (e) => {
      if (!pickerWrap.contains(e.target)) {
        closeDropdown();
      }
    };
    document.addEventListener('click', onDocClick);

    // Campus selector logic
    backdrop.querySelectorAll('.sup-campus-btn').forEach(cBtn => {
      cBtn.addEventListener('click', () => {
        const chosenCampus = cBtn.getAttribute('data-campus');
        backdrop.querySelector('#sup-campus').value = chosenCampus;
        backdrop.querySelectorAll('.sup-campus-btn').forEach(b => {
          const isActive = b.getAttribute('data-campus') === chosenCampus;
          b.style.borderColor = isActive ? '#005930' : 'var(--border-subtle)';
          b.style.background = isActive ? 'rgba(0,89,48,0.06)' : 'var(--bg-elevated)';
          const radio = b.querySelector('.sup-campus-radio');
          if (radio) {
            radio.style.borderColor = isActive ? '#005930' : 'var(--text-tertiary)';
            radio.innerHTML = isActive ? '<span style="width:6px;height:6px;border-radius:50%;background:#005930;"></span>' : '';
          }
          const txt = b.querySelector('.sup-campus-text');
          if (txt) {
            txt.style.color = isActive ? '#005930' : 'var(--text-primary)';
            txt.style.fontWeight = isActive ? '600' : '500';
          }
        });
        const errCampus = backdrop.querySelector('#err-sup-campus');
        if (errCampus) { errCampus.textContent = ''; errCampus.style.display = 'none'; }
      });
    });

    // Initial populate
    renderOptions('');

    const close = () => {
      document.removeEventListener('click', onDocClick);
      backdrop.remove();
    };
    backdrop.querySelector('#sup-close').addEventListener('click', close);
    backdrop.querySelector('#sup-cancel').addEventListener('click', close);
    backdrop.addEventListener('click', e => { if (e.target === backdrop) close(); });

    backdrop.querySelector('#sup-submit').addEventListener('click', async () => {
      // Clear errors
      backdrop.querySelectorAll('.ac-error').forEach(el => { el.textContent = ''; el.style.display = 'none'; });
      backdrop.querySelectorAll('.ac-input-wrap--error').forEach(el => el.classList.remove('ac-input-wrap--error'));
      backdrop.querySelector('#sup-server-error').style.display = 'none';
      backdrop.querySelector('#sup-success').style.display = 'none';

      const name = backdrop.querySelector('#sup-name').value.trim();
      const email = backdrop.querySelector('#sup-email').value.trim();
      const campus = backdrop.querySelector('#sup-campus').value.trim();
      const course = backdrop.querySelector('#sup-course').value;

      let valid = true;
      const setErr = (id, msg) => {
        const errEl = backdrop.querySelector('#err-' + id);
        if (errEl) { errEl.textContent = msg; errEl.style.display = 'block'; }
        const wrap = backdrop.querySelector('#wrap-' + id);
        if (wrap) wrap.classList.add('ac-input-wrap--error');
        valid = false;
      };

      if (!name) setErr('sup-name', 'Full name is required.');
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) setErr('sup-email', 'Valid email is required.');
      if (!campus) setErr('sup-campus', 'Please select a designated campus.');
      if (!course) setErr('sup-course', 'Please select a course program.');
      if (!valid) return;

      const btn = backdrop.querySelector('#sup-submit');
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner-sm"></span> Registering…';

      try {
        const res = await apiPost('/admin/supervisors', { name, email, campus, course });

        if (res?.supervisor) {
          const sucEl = backdrop.querySelector('#sup-success');
          const emailBadge = res.mail_sent
            ? `<div style="display:inline-flex;align-items:center;gap:6px;background:#ECFDF5;border:1px solid #A7F3D0;color:#047857;font-size:11.5px;font-weight:600;padding:4px 10px;border-radius:100px;margin-bottom:8px;">${icon('check', 12)} Welcome email sent to ${res.supervisor.email}</div>`
            : `<div style="display:inline-flex;align-items:center;gap:6px;background:#FFFBEB;border:1px solid #FDE68A;color:#B45309;font-size:11.5px;font-weight:600;padding:4px 10px;border-radius:100px;margin-bottom:8px;">${icon('alert-triangle', 12)} Email skipped (relay offline) &bull; Please share credentials directly</div>`;

          sucEl.innerHTML = `
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
              ${icon('check-circle', 16)}
              <strong style="color:#047857;">${res.supervisor.name}</strong> registered successfully!
            </div>
            ${emailBadge}
            <div style="background:#fff;border:1px solid rgba(16,185,129,.2);border-radius:6px;padding:8px 12px;margin-top:6px;display:flex;align-items:center;justify-content:space-between;gap:8px;">
              <div>
                <span style="font-size:var(--text-xs);color:var(--text-tertiary);display:block;margin-bottom:2px;">Temporary Password</span>
                <code style="font-size:var(--text-base);font-weight:700;color:#111;letter-spacing:.5px;">${res.temp_password}</code>
              </div>
              <button type="button" id="btn-copy-sup-cred" class="btn btn--secondary btn--sm" style="display:inline-flex;align-items:center;gap:4px;font-size:11.5px;padding:5px 10px;cursor:pointer;">
                ${icon('copy', 12)} <span id="lbl-copy-sup-cred">Copy</span>
              </button>
            </div>
            <p style="font-size:var(--text-xs);color:var(--text-tertiary);margin:8px 0 0;">
              The coordinator will be prompted to create a personal password upon first login.
            </p>
          `;
          renderIcons();

          const copyBtn = sucEl.querySelector('#btn-copy-sup-cred');
          copyBtn?.addEventListener('click', () => {
            const textToCopy = `CHMSU HireMe Coordinator Credentials:\nEmail: ${res.supervisor.email}\nTemporary Password: ${res.temp_password}\nLogin URL: https://stoned-two.vercel.app/login/`;
            navigator.clipboard.writeText(textToCopy).then(() => {
              copyBtn.innerHTML = `${icon('check', 12)} <span id="lbl-copy-sup-cred">Copied!</span>`;
              renderIcons();
              setTimeout(() => {
                if (copyBtn.isConnected) {
                  copyBtn.innerHTML = `${icon('copy', 12)} <span id="lbl-copy-sup-cred">Copy</span>`;
                  renderIcons();
                }
              }, 2000);
            });
          });

          sucEl.style.display = 'block';
          btn.style.display = 'none';
          backdrop.querySelector('#sup-cancel').textContent = 'Done';
          loadSupervisors();
        } else {
          const serverErr = backdrop.querySelector('#sup-server-error');
          const msg = res?.message || (res?.errors ? Object.values(res.errors).flat().join(', ') : 'Registration failed.');
          serverErr.textContent = msg;
          serverErr.style.display = 'block';
          btn.disabled = false;
          btn.innerHTML = `${icon('user-check', 15)} Register Supervisor`;
          renderIcons();
        }
      } catch {
        const serverErr = backdrop.querySelector('#sup-server-error');
        serverErr.textContent = 'Could not connect to server.';
        serverErr.style.display = 'block';
        btn.disabled = false;
        btn.innerHTML = `${icon('user-check', 15)} Register Supervisor`;
        renderIcons();
      }
    });
  });
}
