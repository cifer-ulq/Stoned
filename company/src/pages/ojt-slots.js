import { icon } from '../components/icons.js';
import { apiFetch, apiGet, apiPost, apiPut } from '../api/client.js';
import { openSetOjtScheduleModal } from '../components/ojt-schedule-modal.js';
import { getState } from '../store.js';
import { showPostingRestrictedModal, openMoaRequestModal } from '../components/moa-modal.js';

export const POPULAR_OJT_SKILLS = [
  'HTML', 'CSS', 'JavaScript', 'PHP', 'MySQL', 'Python', 'React',
  'Technical Support', 'Troubleshooting', 'Networking', 'Hardware Troubleshooting',
  'Excel / Spreadsheets', 'Bookkeeping', 'Financial Reporting',
  'Customer Service', 'Figma / UI Design', 'Graphic Design',
  'Communication', 'Problem Solving', 'Data Entry', 'Documentation'
];

export const DEPARTMENT_ROLE_SUGGESTIONS = {
  'IT Department': [
    'IT Support Intern',
    'Web Development Trainee',
    'Network Assistant Intern',
    'QA / Software Tester Intern',
    'Helpdesk Technician Intern',
    'Systems Analyst Trainee',
    'Database Admin Intern',
    'Cybersecurity Assistant Intern'
  ],
  'Accounting Department': [
    'Accounting Assistant Intern',
    'Bookkeeping Trainee',
    'Audit Assistant Intern',
    'Payroll Trainee',
    'Accounts Payable/Receivable Intern',
    'Tax Associate Trainee'
  ],
  'Human Resources': [
    'HR Assistant Intern',
    'Recruitment & Talent Trainee',
    'Employee Relations Intern',
    'HR Training & Development Intern',
    'HR Records & Compliance Intern'
  ],
  'Marketing Department': [
    'Digital Marketing Intern',
    'Social Media Specialist Trainee',
    'Content Creator & Copywriter Intern',
    'Graphic Design & Media Intern',
    'Market Research Intern',
    'SEO / SEM Trainee'
  ],
  'Finance Department': [
    'Financial Analyst Trainee',
    'Budget & Planning Intern',
    'Investment Research Trainee',
    'Billing & Collections Assistant'
  ],
  'Operations': [
    'Operations Assistant Intern',
    'Supply Chain & Logistics Trainee',
    'Inventory Control Intern',
    'Facilities Management Trainee',
    'Process Improvement Intern'
  ],
  'Engineering': [
    'Software Engineering Intern',
    'Hardware / Electronics Trainee',
    'Network Engineering Intern',
    'DevOps / Systems Trainee',
    'CAD / Drafting Intern'
  ],
  'Administration': [
    'Administrative Assistant Intern',
    'Office Operations Trainee',
    'Executive Assistant Intern',
    'Document Controller Trainee',
    'Front Desk & Records Intern'
  ],
  'Customer Service': [
    'Customer Support Representative Intern',
    'Technical Helpdesk Trainee',
    'Client Relations Intern',
    'Guest Services Trainee'
  ]
};

export const CHMSU_COURSES = [
  { code: 'Bachelor of Science in Information Technology', name: 'Bachelor of Science in Information Technology' },
  { code: 'Bachelor of Science in Computer Science', name: 'Bachelor of Science in Computer Science' },
  { code: 'Bachelor of Science in Information Systems', name: 'Bachelor of Science in Information Systems' },
  { code: 'Bachelor of Science in Computer Engineering', name: 'Bachelor of Science in Computer Engineering' },
  { code: 'Bachelor of Science in Accountancy', name: 'Bachelor of Science in Accountancy' },
  { code: 'Bachelor of Science in Business Administration', name: 'Bachelor of Science in Business Administration' },
  { code: 'Bachelor of Science in Hospitality Management', name: 'Bachelor of Science in Hospitality Management' },
  { code: 'Bachelor of Science in Tourism Management', name: 'Bachelor of Science in Tourism Management' },
  { code: 'Bachelor of Secondary Education', name: 'Bachelor of Secondary Education' },
  { code: 'Bachelor of Science in Criminology', name: 'Bachelor of Science in Criminology' },
  { code: 'Bachelor of Science in Nursing', name: 'Bachelor of Science in Nursing' },
  { code: 'Bachelor of Science in Civil Engineering', name: 'Bachelor of Science in Civil Engineering' },
  { code: 'Bachelor of Science in Electrical Engineering', name: 'Bachelor of Science in Electrical Engineering' },
  { code: 'Bachelor of Science in Mechanical Engineering', name: 'Bachelor of Science in Mechanical Engineering' },
];

export const DEPARTMENT_COURSE_SUGGESTIONS = {
  'IT Department': [
    'Bachelor of Science in Information Technology',
    'Bachelor of Science in Computer Science',
    'Bachelor of Science in Information Systems',
    'Bachelor of Science in Computer Engineering',
  ],
  'Accounting Department': [
    'Bachelor of Science in Accountancy',
    'Bachelor of Science in Business Administration',
  ],
  'Human Resources': [
    'Bachelor of Science in Business Administration',
    'Bachelor of Science in Psychology',
    'Open to All Courses',
  ],
  'Marketing Department': [
    'Bachelor of Science in Business Administration',
    'Bachelor of Science in Information Technology',
    'Open to All Courses',
  ],
  'Finance Department': [
    'Bachelor of Science in Accountancy',
    'Bachelor of Science in Business Administration',
  ],
  'Operations': [
    'Bachelor of Science in Business Administration',
    'Bachelor of Science in Information Technology',
    'Bachelor of Science in Computer Engineering',
    'Open to All Courses',
  ],
  'Engineering': [
    'Bachelor of Science in Computer Engineering',
    'Bachelor of Science in Civil Engineering',
    'Bachelor of Science in Electrical Engineering',
    'Bachelor of Science in Mechanical Engineering',
    'Bachelor of Science in Computer Science',
  ],
  'Administration': [
    'Bachelor of Science in Business Administration',
    'Bachelor of Science in Information Technology',
    'Open to All Courses',
  ],
  'Customer Service': [
    'Bachelor of Science in Business Administration',
    'Bachelor of Science in Hospitality Management',
    'Bachelor of Science in Tourism Management',
    'Open to All Courses',
  ],
};

export const STANDARD_OJT_DOCUMENTS = [
  'OJT Endorsement Letter from School / CIER',
  'Parent / Guardian Consent & Waiver Form',
  'Medical Certificate / Fit to Work',
  'Barangay Clearance / Police Clearance',
  'Certificate of Registration (COR) / School ID',
  'Memorandum of Agreement (MOA)',
  'Insurance Policy Certificate',
  'Updated Resume / Curriculum Vitae',
  'NBI Clearance'
];

export const STANDARD_OJT_QUALIFICATIONS = [
  'Currently enrolled in 3rd or 4th Year',
  'Good academic standing (no failing grades)',
  'Willing to render 486 - 600 required hours',
  'Strong verbal and written communication skills',
  'Self-motivated and detail-oriented',
  'Punctual and dependable work ethic',
  'Able to report on-site in Bacolod City / Negros Occ.',
  'Basic knowledge in relevant software & tools'
];

function escapeHtml(str) {
  return String(str ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Normalize API snake_case → shape used by render functions */
function normalizeSlot(p) {
  let reqSkills = [];
  if (Array.isArray(p.required_skills)) {
    reqSkills = p.required_skills;
  } else if (typeof p.required_skills === 'string') {
    try { reqSkills = JSON.parse(p.required_skills) || []; } catch { reqSkills = []; }
  }

  let reqDocs = [];
  if (Array.isArray(p.required_documents)) {
    reqDocs = p.required_documents;
  } else if (typeof p.required_documents === 'string') {
    try { reqDocs = JSON.parse(p.required_documents) || []; } catch { reqDocs = []; }
  } else if (Array.isArray(p.requirements)) {
    reqDocs = p.requirements;
  }

  let quals = [];
  if (Array.isArray(p.qualifications)) {
    quals = p.qualifications;
  } else if (typeof p.qualifications === 'string') {
    try { quals = JSON.parse(p.qualifications) || []; } catch { quals = []; }
  }

  let prefCourses = [];
  if (Array.isArray(p.preferred_courses)) {
    prefCourses = p.preferred_courses;
  } else if (typeof p.preferred_courses === 'string') {
    try { prefCourses = JSON.parse(p.preferred_courses) || []; } catch { prefCourses = [p.preferred_courses]; }
  }

  return {
    id:                   p.id,
    slotTitle:            p.title,
    department:           p.department       || '',
    industry:             p.industry         || '',
    preferredCourse:      prefCourses.length ? prefCourses.join(', ') : 'Open to All Courses',
    preferredCoursesList: prefCourses,
    requiredSkills:       reqSkills,
    requiredDocuments:    reqDocs.length ? reqDocs : ['OJT Endorsement Letter from School / CIER'],
    qualifications:       quals,
    duration:             p.duration         || '5 months (600 hours)',
    slots:                p.slots_total      || 1,
    slotsRemaining:       p.slots_remaining  || 0,
    status:               p.status           || 'open',
    location:             p.location         || '',
    branchName:           p.branch_name      || '',
    latitude:             p.latitude         ?? null,
    longitude:            p.longitude        ?? null,
    tasks:                p.description      || '',
    learningOutcomes:     p.learning_outcomes|| '—',
    contactName:          p.contact_name     || 'CIER Office',
    contactPhone:         p.contact_phone    || '',
    supervisor:           p.contact_name     || 'CIER',
    supervisorContact:    p.contact_phone    || '',
    startDate:            p.start_date       || 'Set per student',
    endorsed:             p.endorsed_count   || 0,
    deployed:             p.deployed_count   || 0,
    interests_count:      p.interests_count  || 0,
    endorsed_count:       p.endorsed_count   || 0,
  };
}

/**
 * Dynamic Role Title Recommender
 * Automatically suggests roles based on chosen department + allows custom entry.
 */
function renderRoleRecommender(scopeEl, initialRole = '', deptSelectEl, prefix = 'slot') {
  const input = scopeEl.querySelector(`#${prefix}-title`);
  const suggsWrap = scopeEl.querySelector(`#${prefix}-role-suggestions`);
  const deptHint = scopeEl.querySelector(`#${prefix}-role-dept-hint`);

  function updateSuggestions() {
    const dept = (deptSelectEl ? deptSelectEl.value : '') || '';
    const roles = DEPARTMENT_ROLE_SUGGESTIONS[dept] || [
      'IT Support Intern', 'Administrative Assistant Intern', 'Marketing Trainee',
      'Accounting Assistant Intern', 'Customer Support Intern', 'Operations Trainee'
    ];

    if (deptHint) {
      deptHint.textContent = dept ? `Recommended for ${dept}:` : 'Popular Trainee Roles:';
    }

    if (suggsWrap) {
      suggsWrap.innerHTML = roles.map(r => `
        <button type="button" class="ojt-sugg-pill ojt-sugg-pill--role ${input.value.trim().toLowerCase() === r.toLowerCase() ? 'ojt-sugg-pill--role-active' : ''}" data-role="${r}">
          ${r}
        </button>
      `).join('');

      suggsWrap.querySelectorAll('.ojt-sugg-pill--role').forEach(pill => {
        pill.addEventListener('click', e => {
          e.preventDefault();
          input.value = pill.dataset.role;
          updateHighlight();
          input.dispatchEvent(new Event('input', { bubbles: true }));
        });
      });
    }
  }

  function updateHighlight() {
    if (!suggsWrap) return;
    const cur = (input.value || '').trim().toLowerCase();
    suggsWrap.querySelectorAll('.ojt-sugg-pill--role').forEach(pill => {
      if (pill.dataset.role.toLowerCase() === cur) {
        pill.classList.add('ojt-sugg-pill--role-active');
      } else {
        pill.classList.remove('ojt-sugg-pill--role-active');
      }
    });
  }

  if (deptSelectEl) {
    deptSelectEl.addEventListener('change', () => {
      updateSuggestions();
    });
  }

  if (input) {
    if (initialRole) input.value = initialRole;
    input.addEventListener('input', updateHighlight);
  }

  updateSuggestions();
  updateHighlight();
}

/**
 * Reusable Course Multi-Picker
 */
function renderCourseMultiPicker(scopeEl, initialCourses = [], deptSelectEl, prefix = 'slot') {
  const selected = new Set(initialCourses.map(c => String(c).trim()).filter(Boolean));
  const chipsWrap = scopeEl.querySelector(`#${prefix}-courses-chips`);
  const emptyNote = scopeEl.querySelector(`#${prefix}-courses-empty`);
  const countSpan = scopeEl.querySelector(`#${prefix}-courses-count`);
  const input = scopeEl.querySelector(`#${prefix}-course-input`);
  const addBtn = scopeEl.querySelector(`#btn-add-${prefix}-course`);
  const suggsWrap = scopeEl.querySelector(`#${prefix}-courses-suggestions`);

  function update() {
    if (emptyNote) emptyNote.style.display = selected.size === 0 ? 'inline' : 'none';
    if (countSpan) countSpan.textContent = `${selected.size} course${selected.size === 1 ? '' : 's'} selected`;

    if (chipsWrap) {
      chipsWrap.querySelectorAll('.ojt-tag-chip').forEach(el => el.remove());
      selected.forEach(course => {
        const chip = document.createElement('span');
        chip.className = 'ojt-tag-chip ojt-tag-chip--course';
        chip.innerHTML = `<span>${course}</span><button type="button" class="ojt-tag-chip__remove" title="Remove">&times;</button>`;
        chip.querySelector('.ojt-tag-chip__remove').addEventListener('click', () => {
          selected.delete(course);
          update();
        });
        chipsWrap.appendChild(chip);
      });
    }

    if (suggsWrap) {
      suggsWrap.querySelectorAll('.ojt-sugg-pill').forEach(pill => {
        const c = pill.dataset.course;
        if (selected.has(c)) {
          pill.classList.add('ojt-sugg-pill--active');
        } else {
          pill.classList.remove('ojt-sugg-pill--active');
        }
      });
    }
  }

  function addCourse(val) {
    const clean = (val || '').trim();
    if (!clean) return;
    clean.split(',').map(s => s.trim()).filter(Boolean).forEach(s => selected.add(s));
    if (input) input.value = '';
    update();
  }

  function renderSuggestions() {
    if (!suggsWrap) return;
    const dept = deptSelectEl ? deptSelectEl.value : '';
    const recommendedCodes = DEPARTMENT_COURSE_SUGGESTIONS[dept] || [
      'Bachelor of Science in Information Technology',
      'Bachelor of Science in Computer Science',
      'Bachelor of Science in Accountancy',
      'Bachelor of Science in Business Administration'
    ];

    const sortedCourses = [...CHMSU_COURSES].sort((a, b) => {
      const aRec = recommendedCodes.includes(a.code) ? 1 : 0;
      const bRec = recommendedCodes.includes(b.code) ? 1 : 0;
      return bRec - aRec;
    });

    suggsWrap.innerHTML = `
      <button type="button" class="ojt-sugg-pill" data-course="Open to All Courses" style="font-weight:700;">★ Open to All Courses</button>
      ${sortedCourses.map(c => `
        <button type="button" class="ojt-sugg-pill ${recommendedCodes.includes(c.code) ? 'ojt-sugg-pill--dept-match' : ''}" data-course="${c.code}" title="${c.name}">
          + ${c.code}
        </button>
      `).join('')}
    `;

    suggsWrap.querySelectorAll('.ojt-sugg-pill').forEach(pill => {
      pill.addEventListener('click', e => {
        e.preventDefault();
        const c = pill.dataset.course;
        if (c === 'Open to All Courses') {
          if (selected.has('Open to All Courses')) {
            selected.delete('Open to All Courses');
          } else {
            selected.clear();
            selected.add('Open to All Courses');
          }
        } else {
          selected.delete('Open to All Courses');
          if (selected.has(c)) {
            selected.delete(c);
          } else {
            selected.add(c);
          }
        }
        update();
      });
    });
    update();
  }

  if (deptSelectEl) {
    deptSelectEl.addEventListener('change', () => {
      renderSuggestions();
    });
  }

  if (input) {
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        addCourse(input.value);
      }
    });
  }

  if (addBtn) {
    addBtn.addEventListener('click', e => {
      e.preventDefault();
      addCourse(input.value);
    });
  }

  renderSuggestions();

  return {
    getCourses: () => Array.from(selected)
  };
}

/**
 * Reusable dynamic tag picker for Skills, Required Documents, and Qualifications
 */
function renderTagPicker(scopeEl, initialItems = [], suggestions = [], prefix, itemType = 'item', chipClass = '') {
  const selected = new Set(initialItems.map(s => String(s).trim()).filter(Boolean));
  const chipsWrap = scopeEl.querySelector(`#${prefix}-chips`);
  const emptyNote = scopeEl.querySelector(`#${prefix}-empty`);
  const countSpan = scopeEl.querySelector(`#${prefix}-count`);
  const input = scopeEl.querySelector(`#${prefix}-input`);
  const addBtn = scopeEl.querySelector(`#btn-add-${prefix}`);
  const suggsWrap = scopeEl.querySelector(`#${prefix}-suggestions`);

  function update() {
    if (emptyNote) emptyNote.style.display = selected.size === 0 ? 'inline' : 'none';
    if (countSpan) countSpan.textContent = `${selected.size} ${itemType}${selected.size === 1 ? '' : 's'} added`;

    if (chipsWrap) {
      chipsWrap.querySelectorAll('.ojt-tag-chip').forEach(el => el.remove());
      selected.forEach(item => {
        const chip = document.createElement('span');
        chip.className = `ojt-tag-chip ${chipClass}`;
        chip.innerHTML = `<span>${escapeHtml(item)}</span><button type="button" class="ojt-tag-chip__remove" title="Remove">&times;</button>`;
        chip.querySelector('.ojt-tag-chip__remove').addEventListener('click', () => {
          selected.delete(item);
          update();
        });
        chipsWrap.appendChild(chip);
      });
    }

    if (suggsWrap) {
      suggsWrap.querySelectorAll('.ojt-sugg-pill').forEach(pill => {
        const val = pill.dataset.val;
        if (selected.has(val)) {
          pill.classList.add('ojt-sugg-pill--active');
        } else {
          pill.classList.remove('ojt-sugg-pill--active');
        }
      });
    }
  }

  function addItem(val) {
    const clean = (val || '').trim();
    if (!clean) return;
    clean.split('\n').map(s => s.trim()).filter(Boolean).forEach(s => selected.add(s));
    if (input) input.value = '';
    update();
  }

  if (input) {
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addItem(input.value);
      }
    });
  }

  if (addBtn) {
    addBtn.addEventListener('click', e => {
      e.preventDefault();
      addItem(input.value);
    });
  }

  if (suggsWrap) {
    suggsWrap.innerHTML = suggestions.map(s => `
      <button type="button" class="ojt-sugg-pill" data-val="${escapeHtml(s)}">+ ${escapeHtml(s)}</button>
    `).join('');

    suggsWrap.querySelectorAll('.ojt-sugg-pill').forEach(pill => {
      pill.addEventListener('click', e => {
        e.preventDefault();
        const val = pill.dataset.val;
        if (selected.has(val)) {
          selected.delete(val);
        } else {
          selected.add(val);
        }
        update();
      });
    });
  }

  update();

  return {
    getItems: () => Array.from(selected)
  };
}

export async function renderOjtSlots(container) {
  const company = getState('company') || {};
  const isCompleted = !!company.profileCompleted;
  const moaStatus = company.moaStatus || 'Pending';
  const isMoaValid = ['active', 'expiring soon'].includes(moaStatus.toLowerCase());
  const canPost = company.canPostOpportunities !== undefined
    ? Boolean(company.canPostOpportunities)
    : (isCompleted && isMoaValid);

  container.innerHTML = `
    <!-- ── Page Header ── -->
    <div class="ojts-page-header anim-fade-in-up">
      <div class="ojts-page-header__left">
        <div class="ojts-page-header__icon">${icon('graduationCap', 22)}</div>
        <div>
          <h2 class="ojts-page-header__title">OJT Postings</h2>
          <p class="ojts-page-header__sub">Post and manage trainee slots — students can apply directly or be recommended by their supervisors</p>
        </div>
      </div>
      <button class="btn btn--primary" id="btn-post-slot" style="gap:8px;height:40px;padding:0 18px;">
        ${icon('plus', 16)} Post New Slot
      </button>
    </div>

    <!-- ── MOA Restriction Banner ── -->
    ${!canPost ? `
      <div class="anim-fade-in-up" style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:14px 18px;margin-bottom:16px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
        <div style="display:flex;align-items:center;gap:12px;">
          <span style="color:#d97706;">${icon('alertCircle', 20)}</span>
          <div>
            <strong style="color:#92400e;font-size:0.88rem;display:block;">MOA Partnership Required to Post OJT Slots</strong>
            <p style="margin:2px 0 0;font-size:0.8rem;color:#b45309;">
              ${!isCompleted ? 'Please complete your company profile before requesting an MOA and creating slots.' : (moaStatus === 'Requested' ? 'Your MOA request has been submitted to CHMSU CIER and is under review.' : 'An active Memorandum of Agreement (MOA) with CHMSU CIER is required before posting OJT slots.')}
            </p>
          </div>
        </div>
        ${!isCompleted ? `
          <a href="#/profile" class="btn btn--sm btn--primary" style="background:#005930;border-color:#005930;gap:4px;">Complete Profile</a>
        ` : (moaStatus === 'Requested' ? `
          <span style="background:#fef3c7;color:#b45309;font-size:0.75rem;font-weight:700;padding:4px 10px;border-radius:6px;border:1px solid #fde68a;">Under CIER Review</span>
        ` : `
          <button type="button" class="btn btn--sm btn--primary" id="btn-ojt-req-moa" style="background:#005930;border-color:#005930;gap:6px;font-weight:600;">${icon('send', 13)} Request MOA with CIER</button>
        `)}
      </div>
    ` : ''}

    <!-- ── Stats Strip ── -->
    <div class="ojts-stats anim-fade-in-up">
      <div class="ojts-stat ojts-stat--blue">
        <span class="ojts-stat__icon">${icon('layers', 18)}</span>
        <div><span class="ojts-stat__value" id="stat-total">—</span><span class="ojts-stat__label">Total Postings</span></div>
      </div>
      <div class="ojts-stat ojts-stat--green">
        <span class="ojts-stat__icon">${icon('checkCircle', 18)}</span>
        <div><span class="ojts-stat__value" id="stat-open">—</span><span class="ojts-stat__label">Open</span></div>
      </div>
      <div class="ojts-stat ojts-stat--amber">
        <span class="ojts-stat__icon">${icon('zap', 18)}</span>
        <div><span class="ojts-stat__value" id="stat-filling">—</span><span class="ojts-stat__label">Filling Up</span></div>
      </div>
      <div class="ojts-stat ojts-stat--purple">
        <span class="ojts-stat__icon">${icon('users', 18)}</span>
        <div><span class="ojts-stat__value" id="stat-interests">—</span><span class="ojts-stat__label">Total Applicants</span></div>
      </div>
    </div>

    <!-- ── Notice ── -->
    <div class="ojts-notice anim-fade-in-up">
      ${icon('alertCircle', 14)}
      <p>Students can apply directly to your OJT postings. Supervisors may also recommend (endorse) students — recommended applicants are highlighted with an indicator.</p>
    </div>

    <!-- ── Toolbar ── -->
    <div class="ojts-toolbar anim-fade-in-up">
      <div class="ojts-status-tabs" id="slot-status-tabs">
        <button class="ojts-status-tab ojts-status-tab--active" data-status="all">All</button>
        <button class="ojts-status-tab" data-status="open">Open</button>
        <button class="ojts-status-tab" data-status="filling_up">Filling Up</button>
        <button class="ojts-status-tab" data-status="full">Full</button>
        <button class="ojts-status-tab" data-status="draft">Draft</button>
        <button class="ojts-status-tab" data-status="closed">Closed</button>
      </div>
      <input type="text" id="slot-search-input" class="ojts-search" placeholder="Search postings...">
    </div>

    <!-- ── Grid ── -->
    <div class="ojts-grid anim-fade-in-up" id="slots-grid">
      ${skeletonCards(3)}
    </div>
  `;

  let allSlots = [];

  try {
    const res = await apiGet('/company/ojt-postings');
    if (res?.success && Array.isArray(res.data)) {
      allSlots = res.data.map(normalizeSlot);
    } else {
      const mock = await apiFetch('ojt-slots', { delay: 400 });
      if (mock.success) allSlots = mock.data;
    }
  } catch {
    const mock = await apiFetch('ojt-slots', { delay: 400 });
    if (mock.success) allSlots = mock.data;
  }
  updateStats(container, allSlots);
  renderSlotCards(container, allSlots);

  let activeStatus = 'all';

  container.querySelector('#btn-post-slot').addEventListener('click', () => {
    const curCo = getState('company') || {};
    const curMoa = (curCo.moaStatus || '').toLowerCase();
    const curCanPost = curCo.canPostOpportunities !== undefined
      ? Boolean(curCo.canPostOpportunities)
      : (Boolean(curCo.profileCompleted) && ['active', 'expiring soon'].includes(curMoa));
    if (!curCanPost) {
      showPostingRestrictedModal('post OJT trainee slots');
      return;
    }
    showPostSlotModal(container, allSlots);
  });

  container.querySelector('#btn-ojt-req-moa')?.addEventListener('click', () => {
    openMoaRequestModal({
      onSuccess: () => {
        renderOjtSlots(container);
      }
    });
  });

  container.querySelector('#slot-status-tabs').addEventListener('click', e => {
    const tab = e.target.closest('.ojts-status-tab');
    if (!tab) return;
    activeStatus = tab.dataset.status;
    container.querySelectorAll('.ojts-status-tab').forEach(t => t.classList.remove('ojts-status-tab--active'));
    tab.classList.add('ojts-status-tab--active');
    applyFilters(container, allSlots, activeStatus, container.querySelector('#slot-search-input').value);
  });

  container.querySelector('#slot-search-input').addEventListener('input', e => {
    applyFilters(container, allSlots, activeStatus, e.target.value);
  });
}

function updateStats(container, slots) {
  const open     = slots.filter(s => s.status === 'open').length;
  const filling  = slots.filter(s => s.status === 'filling_up' || s.status === 'full').length;
  const totalApplicants = slots.reduce((sum, s) => sum + (s.interests_count || 0), 0);
  container.querySelector('#stat-total').textContent     = slots.length;
  container.querySelector('#stat-open').textContent      = open;
  container.querySelector('#stat-filling').textContent   = filling;
  container.querySelector('#stat-interests').textContent = totalApplicants;
}

function applyFilters(container, slots, status, query) {
  let filtered = slots;
  if (status !== 'all') filtered = filtered.filter(s => s.status === status);
  if (query) {
    const q = query.toLowerCase();
    filtered = filtered.filter(s =>
      (s.slotTitle || '').toLowerCase().includes(q) ||
      s.department.toLowerCase().includes(q) ||
      s.preferredCourse.toLowerCase().includes(q)
    );
  }
  renderSlotCards(container, filtered);
}

const STATUS_CONFIG = {
  open:       { label: 'Open',       color: 'var(--color-success)',  bg: 'rgba(16,185,129,0.12)',  badge: 'success' },
  filling_up: { label: 'Filling Up', color: 'var(--color-warning)',  bg: 'rgba(245,158,11,0.12)',  badge: 'warning' },
  full:       { label: 'Full',       color: 'var(--color-warning)',  bg: 'rgba(245,158,11,0.12)',  badge: 'warning' },
  draft:      { label: 'Draft',      color: 'var(--text-tertiary)',  bg: 'var(--bg-tertiary)',     badge: 'neutral' },
  closed:     { label: 'Closed',     color: 'var(--color-error)',    bg: 'rgba(239,68,68,0.12)',   badge: 'error'   },
};

const COURSE_ACRONYM_MAP = {
  'Bachelor of Science in Information Technology': 'BSIT',
  'Bachelor of Science in Computer Science': 'BSCS',
  'Bachelor of Science in Information Systems': 'BSIS',
  'Bachelor of Science in Entertainment and Multimedia Computing': 'BSEMC',
  'Bachelor of Science in Hospitality Management': 'BSHM',
  'Bachelor of Science in Tourism Management': 'BSTM',
  'Bachelor of Science in Business Administration': 'BSBA',
  'Bachelor of Science in Accountancy': 'BSA',
  'Bachelor of Secondary Education': 'BSED',
  'Bachelor of Elementary Education': 'BEED',
  'Bachelor of Technology and Livelihood Education': 'BTLED',
  'Bachelor of Science in Civil Engineering': 'BSCE',
  'Bachelor of Science in Mechanical Engineering': 'BSME',
  'Bachelor of Science in Electrical Engineering': 'BSEE',
  'Bachelor of Science in Electronics Engineering': 'BSEcE',
  'Bachelor of Science in Agriculture': 'BSA-Agri',
  'Bachelor of Science in Fisheries': 'BSFi'
};

function getUniqueCourseAcronyms(coursesList, fallbackStr = '') {
  let raw = [];
  if (Array.isArray(coursesList) && coursesList.length) {
    raw = coursesList;
  } else if (fallbackStr) {
    raw = fallbackStr.split(',').map(s => s.trim()).filter(Boolean);
  }
  if (!raw.length) return ['Open to All Courses'];

  const acronyms = new Set();
  for (const item of raw) {
    const trimmed = item.trim();
    if (!trimmed) continue;
    if (trimmed.toLowerCase().includes('open to all')) {
      return ['Open to All Courses'];
    }
    if (COURSE_ACRONYM_MAP[trimmed]) {
      acronyms.add(COURSE_ACRONYM_MAP[trimmed]);
    } else {
      acronyms.add(trimmed);
    }
  }
  return Array.from(acronyms);
}

function getRoleIcon(title = '', dept = '') {
  const str = (title + ' ' + dept).toLowerCase();
  if (str.includes('design') || str.includes('ui') || str.includes('ux') || str.includes('frontend') || str.includes('multimedia')) return 'eye';
  if (str.includes('qa') || str.includes('quality') || str.includes('test')) return 'fileCheck';
  if (str.includes('full-stack') || str.includes('developer') || str.includes('software') || str.includes('engineer') || str.includes('backend')) return 'fileText';
  if (str.includes('network') || str.includes('system') || str.includes('infrastructure') || str.includes('server')) return 'layers';
  if (str.includes('helpdesk') || str.includes('support') || str.includes('technician') || str.includes('service')) return 'userCheck';
  if (str.includes('account') || str.includes('finance') || str.includes('audit')) return 'barChart';
  if (str.includes('market') || str.includes('sales') || str.includes('business')) return 'trendingUp';
  return 'graduationCap';
}

function fillPct(slot) {
  if (!slot.slots) return 0;
  return Math.round(((slot.slots - slot.slotsRemaining) / slot.slots) * 100);
}

function fillBarColor(pct) {
  if (pct >= 90) return '#ef4444';
  if (pct >= 60) return '#f59e0b';
  return '#10b981';
}

function renderSlotCards(container, slots) {
  const grid = container.querySelector('#slots-grid');
  if (!slots.length) {
    grid.innerHTML = `
      <div class="ojts-empty">
        <div class="ojts-empty__icon">${icon('graduationCap', 40)}</div>
        <h3>No postings found</h3>
        <p>Try adjusting your filters or post your first OJT slot.</p>
        <button class="btn btn--primary" id="empty-post-btn">${icon('plus', 15)} Post OJT Slot</button>
      </div>
    `;
    grid.querySelector('#empty-post-btn')?.addEventListener('click', () => {
      container.querySelector('#btn-post-slot').click();
    });
    return;
  }

  grid.innerHTML = slots.map(slot => {
    const cfg = STATUS_CONFIG[slot.status] || STATUS_CONFIG.draft;
    const pct = fillPct(slot);
    const barColor = fillBarColor(pct);
    const loc = slot.location ? slot.location.split(',')[0].trim() : 'Location TBD';
    const courseAcronyms = getUniqueCourseAcronyms(slot.preferredCoursesList, slot.preferredCourse);
    const roleIcon = getRoleIcon(slot.slotTitle, slot.department);

    const maxSkills = 3;
    const skillsToShow = (slot.requiredSkills || []).slice(0, maxSkills);
    const extraSkillsCount = Math.max(0, (slot.requiredSkills || []).length - maxSkills);

    return `
      <div class="ojts-card" data-slot-id="${slot.id}">
        <div class="ojts-card__accent" style="background:${cfg.color};"></div>
        <div class="ojts-card__head">
          <div class="ojts-card__avatar" aria-hidden="true">
            ${icon(roleIcon, 20)}
          </div>
          <div class="ojts-card__title-wrap">
            <h3 class="ojts-card__title" title="${escapeHtml(slot.slotTitle || slot.department)}">${escapeHtml(slot.slotTitle || slot.department)}</h3>
            <p class="ojts-card__dept">${escapeHtml(slot.department || 'General')}</p>
          </div>
          <span class="badge badge--${cfg.badge}">${cfg.label}</span>
        </div>

        <div class="ojts-card__meta-bar">
          <span class="ojts-meta-item">${icon('calendar', 13)} ${escapeHtml(slot.duration || 'Flexible')}</span>
          <span class="ojts-meta-item">${icon('mapPin', 13)} ${escapeHtml(loc)}</span>
        </div>

        <div class="ojts-card__tags">
          ${courseAcronyms.map(acronym => `<span class="ojts-tag ojts-tag--course">${icon('bookOpen', 11)} ${escapeHtml(acronym)}</span>`).join('')}
          ${skillsToShow.map(skill => `<span class="ojts-tag ojts-tag--skill">${escapeHtml(skill)}</span>`).join('')}
          ${extraSkillsCount > 0 ? `<span class="ojts-tag ojts-tag--more">+${extraSkillsCount} more</span>` : ''}
        </div>

        <div class="ojts-card__fill">
          <div class="ojts-card__fill-top">
            <span class="ojts-card__fill-label"><strong>${slot.slotsRemaining}</strong> of ${slot.slots} slots available</span>
            <span class="ojts-card__fill-pct" style="color:${pct > 0 ? barColor : 'var(--text-tertiary, #94a3b8)'};">${pct}% filled</span>
          </div>
          <div class="ojts-card__fill-bar">
            <div class="ojts-card__fill-progress" style="width:${pct}%;background:${barColor};"></div>
          </div>
        </div>

        <div class="ojts-card__footer">
          <div class="ojts-card__interest">
            ${(slot.interests_count || 0) > 0
              ? `<button class="ojts-btn-applicants btn--view-applicants" data-id="${slot.id}">
                  ${icon('users', 13)}
                  <span><strong>${slot.interests_count}</strong> ${slot.interests_count === 1 ? 'Applicant' : 'Applicants'}</span>
                  ${(slot.endorsed_count || 0) > 0 ? `<span class="ojts-badge-endorsed">${icon('shield', 11)} ${slot.endorsed_count}</span>` : ''}
                </button>`
              : `<span class="ojts-interest-pill ojts-interest-pill--muted">${icon('users', 12)} No applicants yet</span>`
            }
          </div>
          <div class="ojts-card__actions">
            <button class="btn btn--ghost btn--sm btn--edit-slot" data-id="${slot.id}" title="Edit posting">${icon('edit', 13)} Edit</button>
            <button class="btn btn--primary btn--sm btn--view-slot" data-id="${slot.id}">View ${icon('arrowRight', 13)}</button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  grid.querySelectorAll('.btn--view-slot').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      showSlotDetail(slots.find(s => String(s.id) === btn.dataset.id), container, slots);
    });
  });
  grid.querySelectorAll('.btn--edit-slot').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const slot = slots.find(s => String(s.id) === btn.dataset.id);
      if (slot) showEditSlotModal(slot, container, slots);
    });
  });
  grid.querySelectorAll('.btn--view-applicants').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const slot = slots.find(s => String(s.id) === btn.dataset.id);
      if (slot) showApplicantsModal(slot, container, slots);
    });
  });
  grid.querySelectorAll('.ojts-card').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.closest('button')) return;
      showSlotDetail(slots.find(s => String(s.id) === card.dataset.slotId), container, slots);
    });
  });
}

function showSlotDetail(slot, container, allSlots) {
  if (!slot) return;
  const cfg = STATUS_CONFIG[slot.status] || STATUS_CONFIG.draft;
  const pct = fillPct(slot);
  const barColor = fillBarColor(pct);
  const courseAcronyms = getUniqueCourseAcronyms(slot.preferredCoursesList, slot.preferredCourse);
  const roleIcon = getRoleIcon(slot.slotTitle, slot.department);

  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop modal-backdrop--visible';

  backdrop.innerHTML = `
    <div class="modal modal--visible" style="max-width: 680px; width: 100%; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.25);">
      <!-- Top Accent Line -->
      <div style="height: 4px; background: ${cfg.color}; width: 100%;"></div>

      <!-- Header -->
      <div class="modal__header" style="border-bottom: 1px solid var(--border-default, #e2e8f0); padding: 18px 24px; background: #ffffff; display: flex; align-items: center; justify-content: space-between; gap: 14px;">
        <div style="display: flex; align-items: center; gap: 14px; min-width: 0;">
          <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(0,89,48,0.08); color: #005930; display: flex; align-items: center; justify-content: center; flex-shrink: 0; border: 1px solid rgba(0,89,48,0.2);">
            ${icon(roleIcon, 22)}
          </div>
          <div style="min-width: 0;">
            <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
              <h3 class="modal__title" style="margin: 0; font-size: 1.15rem; font-weight: 800; color: #0f172a;">
                ${escapeHtml(slot.slotTitle || slot.department)}
              </h3>
              <span class="badge badge--${cfg.badge}">${cfg.label}</span>
            </div>
            <p style="font-size: 0.8rem; color: #64748b; margin: 3px 0 0; font-weight: 500;">
              ${escapeHtml(slot.department || 'General')}
            </p>
          </div>
        </div>
        <button class="modal__close" id="sd-close" aria-label="Close modal">${icon('x', 20)}</button>
      </div>

      <!-- Body -->
      <div class="modal__body" style="max-height: 70vh; overflow-y: auto; padding: 22px 24px; background: #ffffff;">

        <!-- 4 KPI Stat Tiles -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 10px; text-align: center;">
            <div style="font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: #64748b; margin-bottom: 4px; display: flex; align-items: center; justify-content: center; gap: 4px;">
              ${icon('layers', 12)} Total Slots
            </div>
            <div style="font-size: 1.25rem; font-weight: 800; color: #0f172a; line-height: 1.2;">${slot.slots || 1}</div>
            <div style="font-size: 0.7rem; color: #64748b; margin-top: 3px;">${slot.slotsRemaining} available</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 10px; text-align: center;">
            <div style="font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: #64748b; margin-bottom: 4px; display: flex; align-items: center; justify-content: center; gap: 4px;">
              ${icon('zap', 12)} Fill Rate
            </div>
            <div style="font-size: 1.25rem; font-weight: 800; color: ${pct > 0 ? barColor : '#64748b'}; line-height: 1.2;">${pct}%</div>
            <div style="font-size: 0.7rem; color: #64748b; margin-top: 3px;">${slot.slots - slot.slotsRemaining} filled</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 10px; text-align: center;">
            <div style="font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: #64748b; margin-bottom: 4px; display: flex; align-items: center; justify-content: center; gap: 4px;">
              ${icon('users', 12)} Applicants
            </div>
            <div style="font-size: 1.25rem; font-weight: 800; color: #005930; line-height: 1.2;">${slot.interests_count || 0}</div>
            <div style="font-size: 0.7rem; color: #64748b; margin-top: 3px;">Active interest</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 10px; text-align: center;">
            <div style="font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: #64748b; margin-bottom: 4px; display: flex; align-items: center; justify-content: center; gap: 4px;">
              ${icon('shield', 12)} Endorsed
            </div>
            <div style="font-size: 1.25rem; font-weight: 800; color: #059669; line-height: 1.2;">${slot.endorsed_count || 0}</div>
            <div style="font-size: 0.7rem; color: #64748b; margin-top: 3px;">School endorsed</div>
          </div>
        </div>

        <!-- Slot Capacity Progress -->
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 14px; margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-size: 0.78rem; font-weight: 600; color: #475569;">Slot Allocation</span>
            <span style="font-size: 0.78rem; font-weight: 700; color: ${pct > 0 ? barColor : '#64748b'};">
              ${slot.slotsRemaining} of ${slot.slots} slots available (${pct}% filled)
            </span>
          </div>
          <div style="height: 6px; background: #e2e8f0; border-radius: 99px; overflow: hidden;">
            <div style="height: 100%; width: ${pct}%; background: ${barColor}; border-radius: 99px; transition: width 0.4s ease;"></div>
          </div>
        </div>

        <!-- Structured 2x2 Info Grid -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px;">
            <div style="font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: #64748b; margin-bottom: 6px; display: flex; align-items: center; gap: 5px;">
              ${icon('bookOpen', 12)} Preferred Courses
            </div>
            <div style="display: flex; flex-wrap: wrap; gap: 4px;">
              ${courseAcronyms.map(c => `<span style="display:inline-flex;align-items:center;font-size:0.75rem;font-weight:600;padding:2px 7px;border-radius:5px;background:rgba(0,89,48,0.08);color:#005930;border:1px solid rgba(0,89,48,0.2);">${escapeHtml(c)}</span>`).join('')}
            </div>
          </div>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px;">
            <div style="font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: #64748b; margin-bottom: 6px; display: flex; align-items: center; gap: 5px;">
              ${icon('clock', 12)} Duration
            </div>
            <div style="font-size: 0.85rem; font-weight: 600; color: #0f172a;">${escapeHtml(slot.duration || 'Flexible duration')}</div>
          </div>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; grid-column: 1 / -1;">
            <div style="font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: #64748b; margin-bottom: 6px; display: flex; align-items: center; gap: 5px;">
              ${icon('mapPin', 12)} Deployment Location
            </div>
            <div style="font-size: 0.85rem; font-weight: 500; color: #0f172a;">${escapeHtml(slot.location || 'Company Assigned Location')}</div>
          </div>
        </div>

        <!-- Tasks & Activities -->
        <div style="margin-bottom: 20px;">
          <h4 style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #64748b; margin: 0 0 8px 0; display: flex; align-items: center; gap: 6px;">
            ${icon('fileText', 13)} Tasks &amp; Activities
          </h4>
          <p style="font-size: 0.86rem; line-height: 1.6; color: #334155; margin: 0; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px; white-space: pre-line;">
            ${escapeHtml(slot.tasks || 'No specific tasks described.')}
          </p>
        </div>

        <!-- Learning Outcomes (if present) -->
        ${slot.learningOutcomes && slot.learningOutcomes !== '—' ? `
        <div style="margin-bottom: 20px;">
          <h4 style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #64748b; margin: 0 0 8px 0; display: flex; align-items: center; gap: 6px;">
            ${icon('target', 13)} Learning Outcomes
          </h4>
          <p style="font-size: 0.86rem; line-height: 1.6; color: #334155; margin: 0; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
            ${escapeHtml(slot.learningOutcomes)}
          </p>
        </div>` : ''}

        <!-- Required Skills -->
        ${(slot.requiredSkills || []).length ? `
        <div style="margin-bottom: 20px;">
          <h4 style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #64748b; margin: 0 0 8px 0; display: flex; align-items: center; gap: 6px;">
            ${icon('checkCircle', 13)} Required Skills
          </h4>
          <div style="display: flex; flex-wrap: wrap; gap: 6px;">
            ${slot.requiredSkills.map(s => `<span style="font-size: 0.78rem; font-weight: 500; padding: 4px 10px; border-radius: 6px; background: #f1f5f9; color: #334155; border: 1px solid #e2e8f0;">${escapeHtml(s)}</span>`).join('')}
          </div>
        </div>` : ''}

        <!-- Requirements Checklist -->
        ${(slot.requirements || slot.requiredDocuments || []).length ? `
        <div style="margin-bottom: 20px;">
          <h4 style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #64748b; margin: 0 0 8px 0; display: flex; align-items: center; gap: 6px;">
            ${icon('clipboardList', 13)} Requirements &amp; Documents
          </h4>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
            <ul style="padding-left: 18px; margin: 0; display: flex; flex-direction: column; gap: 6px;">
              ${(slot.requirements || slot.requiredDocuments || []).map(r => `<li style="font-size: 0.84rem; color: #334155; line-height: 1.5;">${escapeHtml(r)}</li>`).join('')}
            </ul>
          </div>
        </div>` : ''}

        <!-- Designated Contact -->
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 14px; display: flex; align-items: center; gap: 12px;">
          <div style="width: 38px; height: 38px; border-radius: 50%; background: rgba(0,89,48,0.1); color: #005930; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            ${icon('user', 18)}
          </div>
          <div style="flex: 1; min-width: 0;">
            <p style="font-size: 0.68rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 2px;">Designated Contact</p>
            <p style="font-weight: 700; font-size: 0.88rem; color: #0f172a; margin: 0 0 2px;">${escapeHtml(slot.contactName || slot.supervisor || 'Company Representative')}</p>
            ${slot.contactPhone ? `<p style="font-size: 0.78rem; color: #64748b; display: flex; align-items: center; gap: 5px; margin: 0;">${icon('phone', 12)} ${escapeHtml(slot.contactPhone)}</p>` : ''}
          </div>
        </div>

      </div>

      <!-- Footer -->
      <div class="modal__footer" style="padding: 14px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
        <button class="btn btn--outline" id="sd-close-btn" style="height: 38px; padding: 0 16px;">Close</button>
        <div style="display: flex; gap: 8px;">
          ${(slot.interests_count || 0) > 0 ? `
            <button class="btn btn--ghost" id="sd-view-apps-btn" style="height: 38px; padding: 0 14px; color: #005930; font-weight: 600; display: flex; align-items: center; gap: 6px;">
              ${icon('users', 14)} View Applicants (${slot.interests_count})
            </button>
          ` : ''}
          <button class="btn btn--primary" id="sd-edit-btn" style="height: 38px; padding: 0 16px; display: flex; align-items: center; gap: 6px;">
            ${icon('edit', 14)} Edit Posting
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(backdrop);
  backdrop.querySelector('#sd-close').addEventListener('click', () => backdrop.remove());
  backdrop.querySelector('#sd-close-btn').addEventListener('click', () => backdrop.remove());
  backdrop.querySelector('#sd-edit-btn')?.addEventListener('click', () => {
    backdrop.remove();
    if (typeof showEditSlotModal === 'function') {
      showEditSlotModal(slot, container, allSlots);
    }
  });
  backdrop.querySelector('#sd-view-apps-btn')?.addEventListener('click', () => {
    backdrop.remove();
    if (typeof showApplicantsModal === 'function') {
      showApplicantsModal(slot, container, allSlots);
    }
  });
  backdrop.addEventListener('click', e => { if (e.target === backdrop) backdrop.remove(); });
}

// ── Student Applications Modal ────────────────────────────────────────────────
async function showApplicantsModal(slot, container, allSlots) {
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop modal-backdrop--visible';
  backdrop.innerHTML = `
    <div class="modal modal--visible" style="max-width:860px;width:100%;border-radius:16px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.25);">
      <div class="modal__header" style="border-bottom:1px solid #e2e8f0;padding:18px 24px;background:#ffffff;">
        <div style="display:flex;align-items:center;gap:14px;min-width:0;">
          <div style="width:44px;height:44px;border-radius:12px;background:rgba(0,89,48,0.1);color:#005930;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:1.1rem;flex-shrink:0;border:1px solid rgba(0,89,48,0.2);">
            ${icon('users', 22)}
          </div>
          <div style="min-width:0;">
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
              <h3 class="modal__title" style="margin:0;font-size:1.15rem;font-weight:800;color:#0f172a;">Student Applications</h3>
              <span style="background:rgba(0,89,48,0.08);color:#005930;border:1px solid rgba(0,89,48,0.2);font-size:0.72rem;font-weight:700;padding:2px 8px;border-radius:99px;">
                ${slot.slotTitle || slot.department}
              </span>
            </div>
            <p style="font-size:0.8rem;color:#64748b;margin:3px 0 0;">
              Review student candidate profiles, interview schedules, and endorsement letters
            </p>
          </div>
        </div>
        <button class="modal__close" id="rec-modal-close">${icon('x', 20)}</button>
      </div>
      <div class="modal__body" id="rec-modal-body" style="max-height:72vh;overflow-y:auto;padding:20px 24px;background:#f8fafc;">
        <div style="display:flex;justify-content:center;padding:40px 0;">
          <div class="skeleton" style="width:200px;height:20px;border-radius:8px;"></div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(backdrop);
  const close = () => backdrop.remove();
  backdrop.querySelector('#rec-modal-close').addEventListener('click', close);
  backdrop.addEventListener('click', e => { if (e.target === backdrop) close(); });

  const body = backdrop.querySelector('#rec-modal-body');
  try {
    const res = await apiGet(`/company/ojt-postings/${slot.id}/interests`);
    if (res?.success && Array.isArray(res.data)) {
      renderApplicantsList(body, res.data, slot, backdrop, container, allSlots);
    } else {
      body.innerHTML = emptyApplicantsState();
    }
  } catch {
    body.innerHTML = emptyApplicantsState();
  }
}

function emptyApplicantsState() {
  return `
    <div style="text-align:center;padding:52px 20px;">
      <div style="width:64px;height:64px;border-radius:50%;background:rgba(0,89,48,0.08);color:#005930;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">
        ${icon('users', 28)}
      </div>
      <h4 style="font-weight:800;font-size:1.05rem;color:#0f172a;margin:0 0 6px;">No Applicants Yet</h4>
      <p style="font-size:0.84rem;color:#64748b;margin:0;max-width:360px;margin:0 auto;line-height:1.5;">
        Students matching your required course and qualifications will appear here once they express interest.
      </p>
    </div>`;
}

function renderApplicantsList(body, students, slot, backdrop, container, allSlots) {
  const newApplicants        = students.filter(s => s.status === 'interested');
  const companyReviewed      = students.filter(s => s.status === 'company_reviewed');
  const awaitingLetter       = students.filter(s => s.status === 'endorsement_requested');
  const endorsed             = students.filter(s => s.status === 'endorsed');
  const interviewScheduled   = students.filter(s => s.status === 'interview_scheduled');
  const companyAccepted      = students.filter(s => s.status === 'company_accepted');
  const coordinatorApproved  = students.filter(s => s.status === 'accepted');
  const ojtConfirmed         = students.filter(s => s.status === 'ojt_confirmed');
  const ojtActive            = students.filter(s => s.status === 'ojt_started' || s.status === 'accepted');
  const rejected             = students.filter(s => s.status === 'rejected');

  if (!students.length) {
    body.innerHTML = emptyApplicantsState();
    return;
  }

  // ── Stage Filter Pills ───────────────────────────────────────────────────
  const stages = [
    { key: 'all', label: 'All Applicants', count: students.length },
    { key: 'interview_scheduled', label: 'Interview Scheduled', count: interviewScheduled.length },
    { key: 'endorsed', label: 'Ready for Interview', count: endorsed.length },
    { key: 'awaiting_letter', label: 'Awaiting Letter', count: awaitingLetter.length },
    { key: 'company_reviewed', label: 'Reviewed', count: companyReviewed.length },
    { key: 'new_applicant', label: 'New Applicants', count: newApplicants.length },
    { key: 'active', label: 'Active / Confirmed', count: ojtActive.length + companyAccepted.length + coordinatorApproved.length + ojtConfirmed.length },
    { key: 'rejected', label: 'Rejected', count: rejected.length },
  ].filter(st => st.key === 'all' || st.count > 0);

  let html = `
    <div class="ojt-modal-filters" style="display:flex;gap:8px;margin-bottom:20px;overflow-x:auto;padding-bottom:4px;">
      ${stages.map((st, idx) => `
        <button type="button" class="ojt-stage-tab ${idx === 0 ? 'active' : ''}" data-target="${st.key}" style="
          background: ${idx === 0 ? '#005930' : '#ffffff'};
          color: ${idx === 0 ? '#ffffff' : '#475569'};
          border: 1px solid ${idx === 0 ? '#005930' : '#e2e8f0'};
          padding: 6px 14px;
          border-radius: 99px;
          font-size: 0.76rem;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
          transition: all 0.15s ease;
          box-shadow: ${idx === 0 ? '0 2px 6px rgba(0,89,48,0.2)' : 'none'};
        ">
          <span>${st.label}</span>
          <span style="background:${idx === 0 ? 'rgba(255,255,255,0.25)' : '#f1f5f9'};color:${idx === 0 ? '#ffffff' : '#334155'};font-size:0.68rem;padding:1px 7px;border-radius:99px;">${st.count}</span>
        </button>
      `).join('')}
    </div>`;

  function sectionHeader(labelHtml, color, bg, count) {
    return `
      <div style="display:flex;align-items:center;justify-content:space-between;background:${bg};border-left:4px solid ${color};border-radius:8px;padding:10px 16px;margin-bottom:12px;">
        <span style="font-size:0.75rem;font-weight:800;text-transform:uppercase;letter-spacing:0.05em;color:${color};display:flex;align-items:center;gap:8px;">
          ${labelHtml}
        </span>
        <span style="background:${color};color:#ffffff;font-size:0.72rem;font-weight:800;padding:2px 10px;border-radius:99px;">
          ${count}
        </span>
      </div>`;
  }

  // ── 1. ACTIVE OJT ────────────────────────────────────────────────────────
  if (ojtActive.length) {
    html += `<div class="ojt-stage-group" data-stage="ojt_started">`;
    html += sectionHeader(`${icon('graduationCap', 14)} Active OJT Trainees`, '#005930', 'rgba(16,185,129,0.1)', ojtActive.length);
    html += `<div style="display:flex;flex-direction:column;gap:12px;margin-bottom:24px;">`;
    ojtActive.forEach(s => { html += applicantCard(s, 'ojt_started'); });
    html += `</div></div>`;
  }

  // ── 1b. OJT CONFIRMED — Start Date Set, Awaiting Start Day ───────────────
  if (ojtConfirmed.length) {
    html += `<div class="ojt-stage-group" data-stage="ojt_confirmed">`;
    html += sectionHeader(`${icon('calendar', 14)} OJT Confirmed — Starts on Set Date`, 'rgb(139,92,246)', 'rgba(139,92,246,0.08)', ojtConfirmed.length);
    html += `<div style="margin-bottom:10px;padding:10px 14px;background:rgba(139,92,246,0.06);border:1px solid rgba(139,92,246,0.2);border-radius:8px;font-size:0.78rem;color:rgb(139,92,246);display:flex;align-items:center;gap:8px;">${icon('calendar', 13)} Start date has been set. Student's OJT Tracker will unlock automatically on the start date.</div>`;
    html += `<div style="display:flex;flex-direction:column;gap:12px;margin-bottom:24px;">`;
    ojtConfirmed.forEach(s => { html += applicantCard(s, 'ojt_confirmed'); });
    html += `</div></div>`;
  }

  // ── 1c. COORDINATOR APPROVED — Set OJT Start Date ────────────────────────
  if (coordinatorApproved.length) {
    html += `<div class="ojt-stage-group" data-stage="coordinator_approved">`;
    html += sectionHeader(`${icon('shield', 14)} Coordinator Approved — Set OJT Start Date`, '#005930', 'rgba(16,185,129,0.1)', coordinatorApproved.length);
    html += `<div style="margin-bottom:10px;padding:10px 14px;background:rgba(16,185,129,0.06);border:1px solid rgba(16,185,129,0.2);border-radius:8px;font-size:0.78rem;color:#005930;display:flex;align-items:center;gap:8px;">${icon('alertCircle', 13)} The OJT Coordinator has approved these students. Set a start date and reporting instructions.</div>`;
    html += `<div style="display:flex;flex-direction:column;gap:12px;margin-bottom:24px;">`;
    coordinatorApproved.forEach(s => { html += applicantCard(s, 'coordinator_approved'); });
    html += `</div></div>`;
  }

  // ── 2. COMPANY ACCEPTED — Awaiting Coordinator Final Approval ─────────────
  if (companyAccepted.length) {
    html += `<div class="ojt-stage-group" data-stage="company_accepted">`;
    html += sectionHeader(`${icon('checkCircle', 14)} Accepted — Awaiting Coordinator OJT Approval`, '#047857', 'rgba(16,185,129,0.08)', companyAccepted.length);
    html += `<div style="display:flex;flex-direction:column;gap:12px;margin-bottom:24px;">`;
    companyAccepted.forEach(s => { html += applicantCard(s, 'company_accepted'); });
    html += `</div></div>`;
  }

  // ── 3. INTERVIEW SCHEDULED — Company Decides Accept/Decline ───────────────
  if (interviewScheduled.length) {
    html += `<div class="ojt-stage-group" data-stage="interview_scheduled">`;
    html += sectionHeader(`${icon('calendar', 14)} Interview Scheduled — Accept or Decline`, '#005930', 'rgba(16,185,129,0.1)', interviewScheduled.length);
    html += `<div style="display:flex;flex-direction:column;gap:12px;margin-bottom:24px;">`;
    interviewScheduled.forEach(s => { html += applicantCard(s, 'interview_scheduled'); });
    html += `</div></div>`;
  }

  // ── 4. ENDORSED — Ready to Schedule Interview ─────────────────────────────
  if (endorsed.length) {
    html += `<div class="ojt-stage-group" data-stage="endorsed">`;
    html += sectionHeader(`${icon('fileCheck', 14)} Letter Received — Schedule Interview`, 'rgb(139,92,246)', 'rgba(139,92,246,0.08)', endorsed.length);
    html += `<div style="display:flex;flex-direction:column;gap:12px;margin-bottom:24px;">`;
    endorsed.forEach(s => { html += applicantCard(s, 'endorsed'); });
    html += `</div></div>`;
  }

  // ── 5. AWAITING LETTER — Coordinator Uploading ────────────────────────────
  if (awaitingLetter.length) {
    html += `<div class="ojt-stage-group" data-stage="awaiting_letter">`;
    html += sectionHeader(`${icon('fileText', 14)} Awaiting Endorsement Letter from Coordinator`, 'rgb(168,85,247)', 'rgba(168,85,247,0.08)', awaitingLetter.length);
    html += `<div style="display:flex;flex-direction:column;gap:12px;margin-bottom:24px;">`;
    awaitingLetter.forEach(s => { html += applicantCard(s, 'awaiting_letter'); });
    html += `</div></div>`;
  }

  // ── 6. COMPANY REVIEWED — Request Endorsement ────────────────────────────
  if (companyReviewed.length) {
    html += `<div class="ojt-stage-group" data-stage="company_reviewed">`;
    html += sectionHeader(`${icon('userCheck', 14)} Reviewed — Request Endorsement Letter`, '#D97706', 'rgba(245,158,11,0.08)', companyReviewed.length);
    html += `<div style="display:flex;flex-direction:column;gap:12px;margin-bottom:24px;">`;
    companyReviewed.forEach(s => { html += applicantCard(s, 'company_reviewed'); });
    html += `</div></div>`;
  }

  // ── 7. NEW APPLICANTS ─────────────────────────────────────────────────────
  if (newApplicants.length) {
    html += `<div class="ojt-stage-group" data-stage="new_applicant">`;
    html += sectionHeader(`${icon('clock', 14)} New Applicants — Review Required`, '#005930', 'rgba(0,89,48,0.08)', newApplicants.length);
    html += `<div style="display:flex;flex-direction:column;gap:12px;margin-bottom:24px;">`;
    newApplicants.forEach(s => { html += applicantCard(s, 'new_applicant'); });
    html += `</div></div>`;
  }

  // ── 8. REJECTED ──────────────────────────────────────────────────────────
  if (rejected.length) {
    html += `<div class="ojt-stage-group" data-stage="rejected">`;
    html += sectionHeader(`${icon('x', 14)} Rejected / Closed`, '#64748B', '#f1f5f9', rejected.length);
    html += `<div style="display:flex;flex-direction:column;gap:12px;margin-bottom:24px;">`;
    rejected.forEach(s => { html += applicantCard(s, 'rejected'); });
    html += `</div></div>`;
  }

  body.innerHTML = html;

  // ── Wire Filter Tabs ──────────────────────────────────────────────────────
  body.querySelectorAll('.ojt-stage-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      body.querySelectorAll('.ojt-stage-tab').forEach(t => {
        t.style.background = '#ffffff';
        t.style.color = '#475569';
        t.style.borderColor = '#e2e8f0';
        t.style.boxShadow = 'none';
        const pill = t.querySelector('span:last-child');
        if (pill) { pill.style.background = '#f1f5f9'; pill.style.color = '#334155'; }
      });
      tab.style.background = '#005930';
      tab.style.color = '#ffffff';
      tab.style.borderColor = '#005930';
      tab.style.boxShadow = '0 2px 6px rgba(0,89,48,0.2)';
      const pill = tab.querySelector('span:last-child');
      if (pill) { pill.style.background = 'rgba(255,255,255,0.25)'; pill.style.color = '#ffffff'; }

      const target = tab.dataset.target;
      body.querySelectorAll('.ojt-stage-group').forEach(grp => {
        if (target === 'all' || grp.dataset.stage === target || (target === 'active' && ['ojt_started', 'ojt_confirmed', 'coordinator_approved', 'company_accepted'].includes(grp.dataset.stage))) {
          grp.style.display = 'block';
        } else {
          grp.style.display = 'none';
        }
      });
    });
  });

  // ── View Full Profile — opens new tab + marks as viewed in background ────
  body.querySelectorAll('.btn--mark-viewed').forEach(btn => {
    btn.addEventListener('click', () => {
      const interestId = btn.dataset.id;
      const applicant  = students.find(s => String(s.id) === String(interestId));
      if (!applicant) return;

      const studentUserId = applicant.student?.id;
      if (!studentUserId) return;

      // Open the full-page profile in a new tab
      const profileUrl = `./student-profile.html?student=${studentUserId}&slot=${slot.id}&interest=${interestId}&category=ojt`;
      window.open(profileUrl, '_blank');

      // Mark as viewed in the background (only if not already viewed)
      if (!applicant.resume_viewed_at) {
        apiPost(`/company/ojt-postings/${slot.id}/mark-viewed/${interestId}`, {})
          .then(res => {
            if (res?.success || res?.success === undefined) {
              // Update the card button to "viewed" state
              const cardBtn = body.querySelector(`.btn--mark-viewed[data-id="${interestId}"]`);
              if (cardBtn) {
                cardBtn.innerHTML = `${icon('checkCircle', 13)} Viewed Profile ${icon('externalLink', 11)}`;
                cardBtn.style.background   = 'rgba(16,185,129,0.1)';
                cardBtn.style.color        = '#005930';
                cardBtn.style.borderColor  = 'rgba(16,185,129,0.3)';
              }
              // Enable the Review button if it's locked
              const reviewBtn = body.querySelector(`.btn--review-student[data-id="${interestId}"]`);
              if (reviewBtn) {
                reviewBtn.disabled = false;
                reviewBtn.title    = '';
                reviewBtn.style.opacity = '1';
                reviewBtn.style.cursor  = 'pointer';
                reviewBtn.removeAttribute('disabled');
              }
              // Update local data so re-renders are correct
              applicant.resume_viewed_at = new Date().toISOString();
            }
          })
          .catch(() => { /* silent */ });
      }
    });
  });

  // ── Review (Accept) with required note ───────────────────────────────────
  body.querySelectorAll('.btn--review-student').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.disabled) return;
      const interestId = btn.dataset.id;
      const studentName = btn.dataset.name || 'Student';
      showReviewModal(slot, interestId, studentName, body, container, allSlots, backdrop);
    });
  });

  // ── Request Endorsement Letter ────────────────────────────────────────────
  body.querySelectorAll('.btn--request-endorsement').forEach(btn => {
    btn.addEventListener('click', () => {
      const interestId = btn.dataset.id;
      const studentName = btn.dataset.name || 'Student';
      showRequestEndorsementModal(slot, interestId, studentName, body, container, allSlots, backdrop);
    });
  });

  // ── Reject with required note ─────────────────────────────────────────────
  body.querySelectorAll('.btn--reject-modal').forEach(btn => {
    btn.addEventListener('click', () => {
      const interestId = btn.dataset.id;
      const studentName = btn.dataset.name || 'Student';
      showRejectModal(slot, interestId, studentName, body, container, allSlots, backdrop);
    });
  });

  // ── Schedule Interview (only after endorsed) ──────────────────────────────
  body.querySelectorAll('.btn--schedule-interview').forEach(btn => {
    btn.addEventListener('click', () => {
      const interestId = btn.dataset.id;
      const studentName = btn.dataset.name || 'Student';
      showScheduleInterviewModal(slot, interestId, studentName, body, container, allSlots, backdrop);
    });
  });

  // ── Accept After Interview ────────────────────────────────────────────────
  body.querySelectorAll('.btn--accept-after-interview').forEach(btn => {
    btn.addEventListener('click', () => {
      const interestId = btn.dataset.id;
      const studentName = btn.dataset.name || 'Student';
      showAcceptAfterInterviewModal(slot, interestId, studentName, body, container, allSlots, backdrop);
    });
  });

  // ── Set OJT Start Date & Instructions (after coordinator approves) ────────
  body.querySelectorAll('.btn--set-ojt-start').forEach(btn => {
    btn.addEventListener('click', () => {
      const interestId = btn.dataset.id;
      const studentName = btn.dataset.name || 'Student';
      showSetOjtStartModal(slot, interestId, studentName, body, container, allSlots, backdrop);
    });
  });
}

function applicantCard(s, state) {
  const st = s.student || {};
  const name = st.name || 'Student';
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const program = st.program || '—';
  const yearLevel = st.year_level || '';
  const email = st.email || '';
  const phone = st.phone || '';
  const headline = st.headline || '';
  const location = st.location || '';
  const skills = Array.isArray(st.skills) ? st.skills : [];
  const studentMessage = s.student_message || '';
  const companyNote = s.company_note || '';
  const resumeViewed = !!s.resume_viewed_at;
  const interviewAt = s.interview_scheduled_at || '';
  const interviewType = s.interview_type || '';
  const interviewLocation = s.interview_location || '';
  const endorsementLetterUrl = s.endorsement_letter_url || null;
  const endorsedAt = s.endorsed_at || '';
  const ojtStartDate = s.ojt_start_date || '';
  const ojtInstructions = s.ojt_instructions || '';
  const avatarUrl = st.avatar_url || null;

  const BADGE = {
    new_applicant:        { bg: 'rgba(0,89,48,0.08)',     color: '#005930',         border: 'rgba(0,89,48,0.2)',     label: 'New Applicant',                        ico: 'clock' },
    company_reviewed:     { bg: 'rgba(245,158,11,0.1)',   color: '#D97706',         border: 'rgba(245,158,11,0.25)', label: 'Reviewed',                             ico: 'userCheck' },
    awaiting_letter:      { bg: 'rgba(168,85,247,0.1)',   color: 'rgb(168,85,247)', border: 'rgba(168,85,247,0.25)',label: 'Awaiting Letter',                      ico: 'fileText' },
    endorsed:             { bg: 'rgba(139,92,246,0.1)',   color: 'rgb(139,92,246)', border: 'rgba(139,92,246,0.25)',label: 'Letter Received — Schedule Interview', ico: 'calendar' },
    interview_scheduled:  { bg: 'rgba(16,185,129,0.12)',  color: '#005930',         border: 'rgba(16,185,129,0.3)',  label: 'Interview Scheduled',                  ico: 'calendar' },
    company_accepted:     { bg: 'rgba(16,185,129,0.12)',  color: '#047857',         border: 'rgba(16,185,129,0.25)', label: 'Accepted — Awaiting Approval',         ico: 'checkCircle' },
    coordinator_approved: { bg: 'rgba(16,185,129,0.16)',  color: '#005930',         border: 'rgba(16,185,129,0.35)', label: 'Coordinator Approved',                 ico: 'shield' },
    ojt_confirmed:        { bg: 'rgba(139,92,246,0.12)',  color: 'rgb(139,92,246)', border: 'rgba(139,92,246,0.25)',label: 'OJT Confirmed',                        ico: 'calendar' },
    ojt_started:          { bg: 'rgba(16,185,129,0.16)',  color: '#005930',         border: 'rgba(16,185,129,0.35)', label: 'OJT Active',                          ico: 'graduationCap' },
    accepted:             { bg: 'rgba(16,185,129,0.16)',  color: '#005930',         border: 'rgba(16,185,129,0.35)', label: 'OJT Active',                          ico: 'graduationCap' },
    rejected:             { bg: '#f1f5f9',                color: '#64748b',         border: '#e2e8f0',               label: 'Rejected',                            ico: 'x' },
    pending:              { bg: 'rgba(0,89,48,0.08)',     color: '#005930',         border: 'rgba(0,89,48,0.2)',     label: 'Pending',                             ico: 'clock' },
  };
  const badge = BADGE[state] || BADGE.new_applicant;

  const statusBadgeHtml = `
    <span style="display:inline-flex;align-items:center;gap:5px;background:${badge.bg};color:${badge.color};border:1px solid ${badge.border};font-size:0.73rem;font-weight:700;padding:3px 10px;border-radius:99px;">
      ${icon(badge.ico, 12)} ${badge.label}
    </span>`;

  // ── Detailed Stage / Appointment Box ────────────────────────────────────
  let stageDetailsBox = '';
  if (state === 'interview_scheduled') {
    const typeLabel = interviewType === 'face_to_face' ? 'Face-to-Face / On-site' : (interviewType === 'online' ? 'Online Video Meeting' : 'Interview');
    const isOnline = interviewType === 'online';
    stageDetailsBox = `
      <div style="margin:0 20px 14px;background:#f0fdf4;border:1px solid rgba(16,185,129,0.25);border-radius:10px;padding:14px 16px;">
        <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:8px;">
          <span style="display:inline-flex;align-items:center;gap:6px;font-size:0.82rem;font-weight:800;color:#005930;">
            ${icon('calendar', 14)} ${typeLabel}
          </span>
          <span style="font-size:0.77rem;font-weight:700;color:#005930;background:rgba(16,185,129,0.18);padding:2px 10px;border-radius:99px;">
            ${interviewAt}
          </span>
        </div>

        ${interviewLocation ? `
          <div style="display:flex;align-items:flex-start;gap:6px;font-size:0.78rem;color:#334155;margin-bottom:6px;">
            <span style="color:#005930;flex-shrink:0;margin-top:1px;">${icon(isOnline ? 'video' : 'mapPin', 13)}</span>
            <span><strong>${isOnline ? 'Meeting Link:' : 'Location:'}</strong> ${interviewLocation}</span>
          </div>` : ''}

        ${companyNote ? `
          <div style="font-size:0.77rem;color:#475569;font-style:italic;margin-bottom:8px;background:rgba(255,255,255,0.7);border-left:3px solid #005930;padding:6px 12px;border-radius:4px;">
            &ldquo;${companyNote}&rdquo;
          </div>` : ''}

        <div style="display:flex;align-items:center;gap:6px;font-size:0.74rem;color:#047857;margin-top:6px;padding-top:8px;border-top:1px solid rgba(16,185,129,0.18);">
          ${icon('alertCircle', 13)}
          <span>After conducting the interview, accept or decline the student using the buttons below.</span>
        </div>
      </div>`;
  } else if (state === 'new_applicant') {
    stageDetailsBox = `
      <div style="margin:0 20px 14px;padding:10px 14px;background:rgba(0,89,48,0.05);border:1px solid rgba(0,89,48,0.18);border-radius:8px;display:flex;align-items:center;gap:8px;font-size:0.76rem;color:#005930;">
        ${icon('alertCircle', 14)}
        <span>Please click <strong>View Full Profile</strong> to review the student's portfolio before making a decision.</span>
      </div>`;
  } else if (state === 'company_reviewed') {
    stageDetailsBox = `
      <div style="margin:0 20px 14px;padding:12px 14px;background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.22);border-radius:8px;display:flex;flex-direction:column;gap:5px;">
        <span style="display:flex;align-items:center;gap:7px;font-size:0.78rem;font-weight:700;color:#D97706;">
          ${icon('userCheck', 14)} Candidate Reviewed
        </span>
        <span style="font-size:0.76rem;color:#475569;">
          Click "Request Endorsement Letter" to ask the coordinator to issue the official letter.
        </span>
        ${companyNote ? `<span style="font-size:0.74rem;color:#64748b;font-style:italic;">Your note: "${companyNote}"</span>` : ''}
      </div>`;
  } else if (state === 'awaiting_letter') {
    stageDetailsBox = `
      <div style="margin:0 20px 14px;padding:12px 14px;background:rgba(168,85,247,0.06);border:1px solid rgba(168,85,247,0.22);border-radius:8px;display:flex;align-items:center;gap:8px;font-size:0.76rem;color:rgb(168,85,247);font-weight:600;">
        ${icon('clock', 14)} Endorsement letter requested. Waiting for the OJT Coordinator to upload it.
      </div>`;
  } else if (state === 'endorsed') {
    stageDetailsBox = `
      <div style="margin:0 20px 14px;padding:12px 14px;background:rgba(139,92,246,0.06);border:1px solid rgba(139,92,246,0.22);border-radius:8px;display:flex;flex-direction:column;gap:6px;">
        <span style="display:flex;align-items:center;gap:7px;font-size:0.78rem;color:rgb(139,92,246);font-weight:700;">
          ${icon('fileCheck', 14)} Endorsement letter uploaded${endorsedAt ? ` on ${endorsedAt}` : ''}.
        </span>
        ${endorsementLetterUrl ? `
          <a href="${endorsementLetterUrl}" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:5px;font-size:0.76rem;color:rgb(139,92,246);text-decoration:underline;font-weight:600;">
            ${icon('externalLink', 12)} View Endorsement Letter PDF
          </a>` : ''}
      </div>`;
  } else if (state === 'company_accepted') {
    stageDetailsBox = `
      <div style="margin:0 20px 14px;padding:12px 14px;background:rgba(16,185,129,0.06);border:1px solid rgba(16,185,129,0.22);border-radius:8px;display:flex;flex-direction:column;gap:4px;">
        <span style="display:flex;align-items:center;gap:7px;font-size:0.78rem;color:#047857;font-weight:700;">
          ${icon('checkCircle', 14)} Student Accepted After Interview
        </span>
        <span style="font-size:0.76rem;color:#475569;">
          Waiting for the OJT Coordinator to provide final approval.
        </span>
        ${companyNote ? `<span style="font-size:0.74rem;color:#64748b;font-style:italic;">Acceptance note: "${companyNote}"</span>` : ''}
      </div>`;
  } else if (state === 'coordinator_approved') {
    stageDetailsBox = `
      <div style="margin:0 20px 14px;padding:12px 14px;background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.25);border-radius:8px;display:flex;flex-direction:column;gap:4px;">
        <span style="display:flex;align-items:center;gap:7px;font-size:0.78rem;color:#005930;font-weight:800;">
          ${icon('shield', 14)} Coordinator Approved!
        </span>
        <span style="font-size:0.76rem;color:#334155;">
          Click "Set Start Date & Instructions" so the student knows when and where to report.
        </span>
      </div>`;
  } else if (state === 'ojt_confirmed') {
    const daysStr = Array.isArray(s.schedule_days) && s.schedule_days.length ? s.schedule_days.join(', ') : '';
    const shiftStr = s.shift_start && s.shift_end ? `${s.shift_start} – ${s.shift_end}` : '';
    stageDetailsBox = `
      <div style="margin:0 20px 14px;padding:12px 14px;background:rgba(139,92,246,0.06);border:1px solid rgba(139,92,246,0.22);border-radius:8px;display:flex;flex-direction:column;gap:6px;">
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:6px;">
          <span style="display:flex;align-items:center;gap:7px;font-size:0.78rem;color:rgb(139,92,246);font-weight:700;">
            ${icon('calendar', 14)} OJT Confirmed &middot; Starts: <strong>${ojtStartDate || '—'}</strong>
          </span>
          ${s.estimated_end_date ? `<span style="font-size:0.72rem;color:var(--text-tertiary);">Target End: <strong>${s.estimated_end_date}</strong></span>` : ''}
        </div>
        ${daysStr || shiftStr ? `
          <div style="display:flex;align-items:center;gap:6px;font-size:0.74rem;color:#005930;background:rgba(0,89,48,0.06);padding:5px 10px;border-radius:6px;">
            ${icon('clock', 12)}
            <span><strong>Schedule:</strong> ${daysStr || 'Mon-Fri'} &middot; ${shiftStr || '08:00 - 17:00'} ${s.daily_hours ? `(${s.daily_hours}h/day)` : ''}</span>
          </div>` : ''}
        ${ojtInstructions ? `<span style="font-size:0.74rem;color:#475569;font-style:italic;">Instructions: "${ojtInstructions}"</span>` : ''}
        <span style="font-size:0.72rem;color:#64748b;">The student's OJT tracker will unlock automatically on this start date.</span>
      </div>`;
  } else if (state === 'ojt_started' || state === 'accepted') {
    stageDetailsBox = `
      <div style="margin:0 20px 14px;padding:12px 14px;background:rgba(16,185,129,0.1);border:1px solid rgba(16,185,129,0.25);border-radius:8px;display:flex;align-items:center;gap:8px;font-size:0.78rem;color:#005930;font-weight:700;">
        ${icon('graduationCap', 14)} OJT Training Active &middot; Trainee is logged into CHMSU Tracker
      </div>`;
  } else if (state === 'rejected') {
    stageDetailsBox = `
      <div style="margin:0 20px 14px;padding:10px 14px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;font-size:0.76rem;color:#64748b;">
        <span>Application Closed / Declined</span>
        ${companyNote ? `<span style="display:block;margin-top:3px;font-style:italic;">"${companyNote}"</span>` : ''}
      </div>`;
  }

  // ── Action buttons per stage ──────────────────────────────────────────────
  let actionButtons = '';
  if (state === 'new_applicant' || state === 'pending') {
    actionButtons = `
      <button class="btn btn--sm btn--outline btn--reject-modal" data-id="${s.id}" data-name="${name}" style="color:#ef4444;border-color:#fca5a5;background:#fef2f2;border-radius:8px;height:34px;padding:0 14px;font-size:0.78rem;font-weight:700;display:inline-flex;align-items:center;gap:5px;">${icon('x', 12)} Reject</button>
      <button class="btn btn--sm btn--primary btn--review-student" data-id="${s.id}" data-name="${name}" style="height:34px;padding:0 18px;font-size:0.78rem;font-weight:700;display:inline-flex;align-items:center;gap:5px;background:#005930;border-color:#005930;border-radius:8px;${!resumeViewed ? 'opacity:0.5;cursor:not-allowed;' : 'box-shadow:0 2px 8px rgba(0,89,48,0.2);'}" ${!resumeViewed ? 'disabled title="View portfolio first"' : ''}>${icon('userCheck', 12)} Review</button>`;
  } else if (state === 'company_reviewed') {
    actionButtons = `
      <button class="btn btn--sm btn--outline btn--reject-modal" data-id="${s.id}" data-name="${name}" style="color:#ef4444;border-color:#fca5a5;background:#fef2f2;border-radius:8px;height:34px;padding:0 14px;font-size:0.78rem;font-weight:700;display:inline-flex;align-items:center;gap:5px;">${icon('x', 12)} Reject</button>
      <button class="btn btn--sm btn--primary btn--request-endorsement" data-id="${s.id}" data-name="${name}" style="height:34px;padding:0 18px;font-size:0.78rem;font-weight:700;display:inline-flex;align-items:center;gap:5px;background:#D97706;border-color:#D97706;border-radius:8px;box-shadow:0 2px 8px rgba(217,119,6,0.2);">${icon('fileText', 12)} Request Endorsement Letter</button>`;
  } else if (state === 'endorsed') {
    actionButtons = `
      <button class="btn btn--sm btn--outline btn--reject-modal" data-id="${s.id}" data-name="${name}" style="color:#ef4444;border-color:#fca5a5;background:#fef2f2;border-radius:8px;height:34px;padding:0 14px;font-size:0.78rem;font-weight:700;display:inline-flex;align-items:center;gap:5px;">${icon('x', 12)} Decline</button>
      <button class="btn btn--sm btn--primary btn--schedule-interview" data-id="${s.id}" data-name="${name}" style="height:34px;padding:0 18px;font-size:0.78rem;font-weight:700;display:inline-flex;align-items:center;gap:5px;background:#005930;border-color:#005930;border-radius:8px;box-shadow:0 2px 8px rgba(0,89,48,0.2);">${icon('calendar', 12)} Schedule Interview</button>`;
  } else if (state === 'interview_scheduled') {
    const interviewRaw = s.interview_scheduled_at_raw || '';
    const interviewPassed = interviewRaw ? new Date(interviewRaw) <= new Date() : true;

    let daysUntil = '';
    if (!interviewPassed && interviewRaw) {
      const diffMs  = new Date(interviewRaw) - new Date();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      daysUntil = diffDays === 1 ? 'tomorrow' : `in ${diffDays} days`;
    }

    actionButtons = `
      <button class="btn btn--sm btn--outline btn--reject-modal" data-id="${s.id}" data-name="${name}" style="color:#ef4444;border-color:#fca5a5;background:#fef2f2;border-radius:8px;height:34px;padding:0 14px;font-size:0.78rem;font-weight:700;display:inline-flex;align-items:center;gap:5px;">${icon('x', 12)} Decline</button>
      ${interviewPassed
        ? `<button class="btn btn--sm btn--primary btn--accept-after-interview" data-id="${s.id}" data-name="${name}" style="height:34px;padding:0 18px;font-size:0.78rem;font-weight:700;display:inline-flex;align-items:center;gap:5px;background:#005930;border-color:#005930;border-radius:8px;box-shadow:0 2px 8px rgba(0,89,48,0.2);">${icon('checkCircle', 12)} Accept After Interview</button>`
        : `<button class="btn btn--sm btn--primary" disabled title="Interview hasn't happened yet" style="height:34px;padding:0 18px;font-size:0.78rem;font-weight:700;display:inline-flex;align-items:center;gap:5px;opacity:0.55;cursor:not-allowed;background:#005930;border-color:#005930;border-radius:8px;">${icon('clock', 12)} Interview ${daysUntil}</button>`
      }`;
  } else if (state === 'coordinator_approved') {
    actionButtons = `
      <button class="btn btn--sm btn--primary btn--set-ojt-start" data-id="${s.id}" data-name="${name}" style="height:34px;padding:0 18px;font-size:0.78rem;font-weight:700;display:inline-flex;align-items:center;gap:5px;background:#005930;border-color:#005930;border-radius:8px;box-shadow:0 2px 8px rgba(0,89,48,0.2);">${icon('calendar', 12)} Set Start Date & Instructions</button>`;
  }

  return `
    <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:14px;box-shadow:0 2px 8px rgba(0,0,0,0.03);margin-bottom:16px;overflow:hidden;${state === 'rejected' ? 'opacity:0.65;' : ''}">
      <div style="padding:16px 20px 12px;display:flex;align-items:flex-start;gap:14px;">
        <div style="width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg, #005930, #10b981);color:#ffffff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:1rem;flex-shrink:0;box-shadow:0 4px 12px rgba(0,89,48,0.18);overflow:hidden;">
          ${avatarUrl
            ? `<img src="http://localhost:8000${avatarUrl}" alt="${name}" style="width:100%;height:100%;object-fit:cover;">`
            : initials}
        </div>
        <div style="flex:1;min-width:0;">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:3px;">
            <p style="font-weight:800;font-size:0.98rem;color:#0f172a;margin:0;">${name}</p>
            ${statusBadgeHtml}
          </div>
          ${headline ? `<p style="font-size:0.8rem;color:#64748b;margin:0 0 3px;font-style:italic;">${headline}</p>` : ''}
          <p style="font-size:0.78rem;color:#334155;margin:0;font-weight:500;">${program}${yearLevel ? ` &middot; ${yearLevel}` : ''}</p>
        </div>
      </div>

      <div style="padding:0 20px 12px;display:flex;align-items:center;gap:16px;flex-wrap:wrap;font-size:0.77rem;color:#64748b;">
        ${email    ? `<span style="display:inline-flex;align-items:center;gap:5px;">${icon('mail', 12)} <a href="mailto:${email}" style="color:#005930;text-decoration:none;">${email}</a></span>` : ''}
        ${phone    ? `<span style="display:inline-flex;align-items:center;gap:5px;">${icon('phone', 12)} ${phone}</span>` : ''}
        ${location ? `<span style="display:inline-flex;align-items:center;gap:5px;">${icon('mapPin', 12)} ${location}</span>` : ''}
      </div>

      ${skills.length ? `
      <div style="padding:0 20px 12px;display:flex;gap:5px;flex-wrap:wrap;">
        ${skills.slice(0, 6).map(sk => `<span style="background:rgba(0,89,48,0.06);color:#005930;border:1px solid rgba(0,89,48,0.15);font-size:0.71rem;font-weight:600;padding:2px 8px;border-radius:99px;">${sk}</span>`).join('')}
        ${skills.length > 6 ? `<span style="font-size:0.71rem;color:#94a3b8;align-self:center;">+${skills.length - 6} more</span>` : ''}
      </div>` : ''}

      ${studentMessage ? `
      <div style="padding:0 20px 12px;">
        <p style="font-size:0.76rem;color:#475569;font-style:italic;margin:0;background:#f8fafc;padding:8px 12px;border-radius:6px;border-left:3px solid #005930;">&ldquo;${studentMessage}&rdquo;</p>
      </div>` : ''}

      ${stageDetailsBox}

      <!-- Unified Card Footer: Profile on left, actions on right -->
      <div style="padding:12px 20px;background:#f8fafc;border-top:1px solid #edf2f7;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;">
        <button class="btn btn--sm btn--mark-viewed" data-id="${s.id}" style="${
          resumeViewed
            ? 'background:rgba(16,185,129,0.1);color:#005930;border:1px solid rgba(16,185,129,0.3);'
            : 'background:rgba(0,89,48,0.08);color:#005930;border:1px solid rgba(0,89,48,0.25);'
        }height:34px;padding:0 14px;border-radius:8px;font-size:0.78rem;font-weight:700;display:inline-flex;align-items:center;gap:6px;cursor:pointer;">
          ${resumeViewed ? `${icon('checkCircle', 13)} Viewed Profile ${icon('externalLink', 11)}` : `${icon('user', 13)} View Full Profile ${icon('externalLink', 11)}`}
        </button>

        <div style="display:flex;align-items:center;gap:8px;margin-left:auto;">
          ${actionButtons}
        </div>
      </div>
    </div>`;
}

// ── Student Portfolio Viewer Modal ────────────────────────────────────────────
function showPortfolioModal(applicant, slot, interestId, body, container, allSlots, backdrop) {
  const st = applicant.student || {};
  const resume = applicant.resume || {};
  const name = st.name || 'Student';
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const program = st.program || '—';
  const yearLevel = st.year_level || '';
  const headline = st.headline || '';
  const bio = st.bio || '';
  const email = st.email || '';
  const phone = st.phone || '';
  const location = st.location || '';
  const gpa = st.gpa || '';
  const githubUrl = st.github_url || '';
  const linkedinUrl = st.linkedin_url || '';
  const resumeObjective = st.resume_objective || '';
  const education = Array.isArray(resume.education) ? resume.education : [];
  const experience = Array.isArray(resume.experience) ? resume.experience : [];
  const skills = Array.isArray(resume.skills) ? resume.skills : (Array.isArray(st.skills) ? st.skills : []);
  const projects = Array.isArray(resume.projects) ? resume.projects : [];
  const achievements = Array.isArray(resume.achievements) ? resume.achievements : [];
  const alreadyViewed = !!applicant.resume_viewed_at;

  // ── Tab content builders ───────────────────────────────────────────────────
  function tabProfile() {
    const skillCategories = {};
    if (Array.isArray(resume.skills)) {
      resume.skills.forEach(sk => {
        const cat = sk.category || 'Other';
        if (!skillCategories[cat]) skillCategories[cat] = [];
        skillCategories[cat].push(sk);
      });
    }
    return `
      <div style="display:flex;flex-direction:column;gap:20px;">
        <!-- Hero -->
        <div style="background:linear-gradient(135deg,rgba(74,108,247,0.08),rgba(99,102,241,0.05));border:1px solid rgba(74,108,247,0.15);border-radius:var(--radius-lg);padding:24px;">
          <div style="display:flex;align-items:flex-start;gap:18px;flex-wrap:wrap;">
            <div style="width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,var(--color-primary),#6366f1);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:1.5rem;flex-shrink:0;">${initials}</div>
            <div style="flex:1;min-width:200px;">
              <h2 style="font-size:1.3rem;font-weight:800;margin:0 0 4px;">${name}</h2>
              ${headline ? `<p style="font-size:0.9rem;color:var(--text-secondary);margin:0 0 8px;font-style:italic;">${headline}</p>` : ''}
              <p style="font-size:0.82rem;color:var(--text-secondary);margin:0 0 12px;">${program}${yearLevel ? ` · ${yearLevel}` : ''}${gpa ? ` · GPA: ${gpa}` : ''}</p>
              <div style="display:flex;flex-wrap:wrap;gap:8px;">
                ${email ? `<a href="mailto:${email}" style="display:flex;align-items:center;gap:5px;font-size:0.78rem;color:var(--color-primary);text-decoration:none;">${icon('mail', 13)} ${email}</a>` : ''}
                ${phone ? `<span style="display:flex;align-items:center;gap:5px;font-size:0.78rem;color:var(--text-secondary);">${icon('phone', 13)} ${phone}</span>` : ''}
                ${location ? `<span style="display:flex;align-items:center;gap:5px;font-size:0.78rem;color:var(--text-secondary);">${icon('mapPin', 13)} ${location}</span>` : ''}
                ${githubUrl ? `<a href="${githubUrl}" target="_blank" rel="noopener" style="display:flex;align-items:center;gap:5px;font-size:0.78rem;color:var(--color-primary);text-decoration:none;">${icon('github', 13)} GitHub</a>` : ''}
                ${linkedinUrl ? `<a href="${linkedinUrl}" target="_blank" rel="noopener" style="display:flex;align-items:center;gap:5px;font-size:0.78rem;color:#0A66C2;text-decoration:none;">${icon('linkedin', 13)} LinkedIn</a>` : ''}
              </div>
            </div>
          </div>
        </div>
        <!-- Bio / About -->
        ${bio ? `<div>
          <p style="font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:var(--text-tertiary);margin:0 0 8px;">About Me</p>
          <p style="font-size:0.87rem;color:var(--text-primary);line-height:1.7;margin:0;padding:14px 16px;background:var(--bg-secondary);border-radius:var(--radius-md);border-left:3px solid var(--color-primary);">${bio}</p>
        </div>` : ''}
        <!-- Skills by category -->
        ${Object.keys(skillCategories).length ? `<div>
          <p style="font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:var(--text-tertiary);margin:0 0 10px;">Skills</p>
          <div style="display:flex;flex-direction:column;gap:10px;">
            ${Object.entries(skillCategories).map(([cat, skList]) => `
              <div>
                <p style="font-size:0.74rem;font-weight:600;color:var(--text-secondary);margin:0 0 6px;">${cat}</p>
                <div style="display:flex;flex-wrap:wrap;gap:6px;">
                  ${skList.map(sk => `
                    <span style="display:inline-flex;align-items:center;gap:4px;background:var(--bg-secondary);border:1px solid var(--border-light);border-radius:99px;padding:4px 12px;font-size:0.76rem;">
                      ${sk.name}
                      ${sk.level ? `<span style="font-size:0.65rem;color:var(--text-tertiary);font-weight:600;">${sk.level}/5</span>` : ''}
                    </span>
                  `).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </div>` : ''}
      </div>`;
  }

  function tabResume() {
    return `
      <div style="display:flex;flex-direction:column;gap:24px;">
        ${resumeObjective ? `<div>
          <p style="font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:var(--text-tertiary);margin:0 0 8px;">Objective / Summary</p>
          <p style="font-size:0.87rem;color:var(--text-primary);line-height:1.7;margin:0;padding:14px 16px;background:var(--bg-secondary);border-radius:var(--radius-md);border-left:3px solid var(--color-primary);">${resumeObjective}</p>
        </div>` : ''}
        ${education.length ? `<div>
          <p style="font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:var(--text-tertiary);margin:0 0 10px;">${icon('graduationCap', 13)} Education</p>
          <div style="display:flex;flex-direction:column;gap:8px;">
            ${education.map(e => `
              <div style="padding:12px 16px;background:var(--bg-secondary);border-radius:var(--radius-md);border-left:3px solid #6366f1;">
                <p style="font-size:0.9rem;font-weight:700;margin:0 0 2px;">${e.school}</p>
                <p style="font-size:0.8rem;color:var(--text-secondary);margin:0 0 2px;">${e.degree}</p>
                <p style="font-size:0.76rem;color:var(--text-tertiary);margin:0;">${e.period}${e.gpa ? ` · GPA: ${e.gpa}` : ''}</p>
                ${e.description ? `<p style="font-size:0.78rem;color:var(--text-secondary);margin:6px 0 0;">${e.description}</p>` : ''}
              </div>`).join('')}
          </div>
        </div>` : ''}
        ${experience.length ? `<div>
          <p style="font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:var(--text-tertiary);margin:0 0 10px;">${icon('briefcase', 13)} Experience</p>
          <div style="display:flex;flex-direction:column;gap:8px;">
            ${experience.map(e => `
              <div style="padding:12px 16px;background:var(--bg-secondary);border-radius:var(--radius-md);border-left:3px solid var(--color-primary);">
                <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;flex-wrap:wrap;">
                  <div>
                    <p style="font-size:0.9rem;font-weight:700;margin:0 0 2px;">${e.role}</p>
                    <p style="font-size:0.8rem;color:var(--text-secondary);margin:0 0 2px;">${e.company}${e.type ? ` · ${e.type}` : ''}</p>
                  </div>
                  <span style="font-size:0.74rem;color:var(--text-tertiary);white-space:nowrap;">${e.period}</span>
                </div>
                ${e.description ? `<p style="font-size:0.78rem;color:var(--text-secondary);margin:6px 0 0;line-height:1.6;">${e.description}</p>` : ''}
                ${e.skills && e.skills.length ? `<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:8px;">${(Array.isArray(e.skills) ? e.skills : []).map(sk => `<span style="background:rgba(74,108,247,0.1);color:var(--color-primary);font-size:0.7rem;padding:2px 8px;border-radius:99px;">${sk}</span>`).join('')}</div>` : ''}
              </div>`).join('')}
          </div>
        </div>` : ''}
        ${!education.length && !experience.length && !resumeObjective ? `<p style="text-align:center;color:var(--text-tertiary);font-size:0.85rem;padding:32px 0;">No resume information provided yet.</p>` : ''}
      </div>`;
  }

  function tabProjects() {
    if (!projects.length) return `<p style="text-align:center;color:var(--text-tertiary);font-size:0.85rem;padding:32px 0;">No projects added yet.</p>`;
    const gradients = ['linear-gradient(135deg,#4A6CF7,#6D8DFF)','linear-gradient(135deg,#10B981,#34D399)','linear-gradient(135deg,#F59E0B,#FCD34D)','linear-gradient(135deg,#8B5CF6,#A78BFA)','linear-gradient(135deg,#EC4899,#F472B6)'];
    return `<div style="display:flex;flex-direction:column;gap:12px;">
      ${projects.map((p, i) => `
        <div style="background:var(--bg-secondary);border-radius:var(--radius-md);overflow:hidden;">
          <div style="height:6px;background:${gradients[i % gradients.length]};"></div>
          <div style="padding:14px 16px;">
            <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:6px;">
              <p style="font-size:0.9rem;font-weight:700;margin:0;">${p.title}</p>
              ${p.project_url ? `<a href="${p.project_url}" target="_blank" rel="noopener" style="display:flex;align-items:center;gap:4px;font-size:0.74rem;color:var(--color-primary);text-decoration:none;flex-shrink:0;">${icon('externalLink', 12)} View</a>` : ''}
            </div>
            ${p.description ? `<p style="font-size:0.8rem;color:var(--text-secondary);margin:0 0 8px;line-height:1.6;">${p.description}</p>` : ''}
            ${p.tech_stack && p.tech_stack.length ? `<div style="display:flex;flex-wrap:wrap;gap:4px;">${(Array.isArray(p.tech_stack) ? p.tech_stack : []).map(t => `<span style="background:rgba(99,102,241,0.1);color:#6366f1;font-size:0.7rem;padding:2px 8px;border-radius:99px;">${t}</span>`).join('')}</div>` : ''}
          </div>
        </div>`).join('')}
    </div>`;
  }

  function tabAchievements() {
    if (!achievements.length) return `<p style="text-align:center;color:var(--text-tertiary);font-size:0.85rem;padding:32px 0;">No achievements added yet.</p>`;
    const achColors = { academic: '#6366f1', certification: '#3B82F6', competition: '#F59E0B', professional: '#10B981' };
    return `<div style="display:flex;flex-direction:column;gap:10px;">
      ${achievements.map(a => `
        <div style="padding:12px 16px;background:var(--bg-secondary);border-radius:var(--radius-md);border-left:3px solid ${achColors[a.type] || '#6366f1'};">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;flex-wrap:wrap;">
            <p style="font-size:0.9rem;font-weight:700;margin:0 0 2px;">${a.title}</p>
            <div style="display:flex;align-items:center;gap:6px;">
              ${a.type ? `<span style="font-size:0.68rem;font-weight:700;text-transform:uppercase;color:${achColors[a.type] || '#6366f1'};background:${(achColors[a.type] || '#6366f1')}1a;padding:2px 8px;border-radius:99px;">${a.type}</span>` : ''}
              ${a.date ? `<span style="font-size:0.74rem;color:var(--text-tertiary);">${a.date}</span>` : ''}
            </div>
          </div>
          ${a.description ? `<p style="font-size:0.8rem;color:var(--text-secondary);margin:4px 0 0;line-height:1.6;">${a.description}</p>` : ''}
        </div>`).join('')}
    </div>`;
  }

  const modal = document.createElement('div');
  modal.className = 'modal-backdrop modal-backdrop--visible';
  modal.style.zIndex = '9999';
  modal.style.alignItems = 'stretch';
  modal.style.padding = '0';

  modal.innerHTML = `
    <div style="background:var(--bg-elevated);width:100%;max-width:780px;margin:0 auto;height:100vh;max-height:100vh;display:flex;flex-direction:column;box-shadow:0 0 60px rgba(0,0,0,0.2);">
      <!-- Header -->
      <div style="padding:18px 24px;border-bottom:1px solid var(--border-light);display:flex;align-items:center;justify-content:space-between;gap:12px;flex-shrink:0;background:var(--bg-elevated);">
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,var(--color-primary),#6366f1);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:1rem;flex-shrink:0;">${initials}</div>
          <div>
            <p style="font-weight:700;font-size:1rem;margin:0;">${name}</p>
            <p style="font-size:0.76rem;color:var(--text-secondary);margin:0;">${program}${yearLevel ? ` · ${yearLevel}` : ''}</p>
          </div>
          ${alreadyViewed ? `<span style="display:inline-flex;align-items:center;gap:4px;background:rgba(16,185,129,0.12);color:var(--color-success);font-size:0.7rem;font-weight:700;padding:3px 10px;border-radius:99px;">${icon('checkCircle', 11)} Portfolio Viewed</span>` : `<span style="display:inline-flex;align-items:center;gap:4px;background:rgba(74,108,247,0.1);color:var(--color-primary);font-size:0.7rem;font-weight:700;padding:3px 10px;border-radius:99px;">${icon('eye', 11)} Viewing Now…</span>`}
        </div>
        <div style="display:flex;align-items:center;gap:8px;">
          <button id="pf-mark-btn" style="background:${alreadyViewed ? 'rgba(16,185,129,0.12)' : 'var(--color-primary)'};color:${alreadyViewed ? 'var(--color-success)' : '#fff'};border:${alreadyViewed ? '1px solid rgba(16,185,129,0.3)' : 'none'};border-radius:var(--radius-md);padding:8px 16px;font-size:0.8rem;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:6px;">
            ${alreadyViewed ? `${icon('checkCircle', 14)} Viewed` : `${icon('checkCircle', 14)} Mark as Viewed & Close`}
          </button>
          <button id="pf-close" style="background:var(--bg-secondary);border:1px solid var(--border-light);border-radius:var(--radius-md);width:36px;height:36px;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--text-secondary);">${icon('x', 18)}</button>
        </div>
      </div>
      <!-- Tabs -->
      <div style="display:flex;gap:0;border-bottom:1px solid var(--border-light);background:var(--bg-elevated);flex-shrink:0;overflow-x:auto;">
        <button class="pf-tab pf-tab--active" data-tab="profile" style="padding:12px 20px;background:none;border:none;border-bottom:2px solid var(--color-primary);color:var(--color-primary);font-weight:600;font-size:0.82rem;cursor:pointer;white-space:nowrap;display:flex;align-items:center;gap:6px;">${icon('user', 14)} Profile</button>
        <button class="pf-tab" data-tab="resume" style="padding:12px 20px;background:none;border:none;border-bottom:2px solid transparent;color:var(--text-secondary);font-size:0.82rem;cursor:pointer;white-space:nowrap;display:flex;align-items:center;gap:6px;">${icon('fileText', 14)} Resume</button>
        <button class="pf-tab" data-tab="projects" style="padding:12px 20px;background:none;border:none;border-bottom:2px solid transparent;color:var(--text-secondary);font-size:0.82rem;cursor:pointer;white-space:nowrap;display:flex;align-items:center;gap:6px;">${icon('folder', 14)} Projects <span style="background:var(--bg-secondary);border-radius:99px;font-size:0.65rem;padding:1px 6px;">${projects.length}</span></button>
        <button class="pf-tab" data-tab="achievements" style="padding:12px 20px;background:none;border:none;border-bottom:2px solid transparent;color:var(--text-secondary);font-size:0.82rem;cursor:pointer;white-space:nowrap;display:flex;align-items:center;gap:6px;">${icon('award', 14)} Achievements <span style="background:var(--bg-secondary);border-radius:99px;font-size:0.65rem;padding:1px 6px;">${achievements.length}</span></button>
      </div>
      <!-- Tab Content -->
      <div id="pf-tab-content" style="flex:1;overflow-y:auto;padding:24px;">
        ${tabProfile()}
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Tab switching
  const tabContent = modal.querySelector('#pf-tab-content');
  const tabBuilders = { profile: tabProfile, resume: tabResume, projects: tabProjects, achievements: tabAchievements };
  modal.querySelectorAll('.pf-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      modal.querySelectorAll('.pf-tab').forEach(t => {
        t.style.borderBottomColor = 'transparent';
        t.style.color = 'var(--text-secondary)';
        t.style.fontWeight = '400';
      });
      tab.style.borderBottomColor = 'var(--color-primary)';
      tab.style.color = 'var(--color-primary)';
      tab.style.fontWeight = '600';
      tabContent.innerHTML = tabBuilders[tab.dataset.tab]();
    });
  });

  // Close
  const closeModal = () => modal.remove();
  modal.querySelector('#pf-close').addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

  // Mark as viewed button
  const markBtn = modal.querySelector('#pf-mark-btn');
  markBtn.addEventListener('click', async () => {
    markBtn.disabled = true;
    markBtn.innerHTML = `${icon('clock', 14)} Marking…`;
    try {
      const res = await apiPost(`/company/ojt-postings/${slot.id}/mark-viewed/${interestId}`, {});
      if (!res?.success && res?.success !== undefined) {
        // API returned a failure response (e.g. 422/403)
        markBtn.disabled = false;
        markBtn.innerHTML = `${icon('checkCircle', 14)} Mark as Viewed & Close`;
        showToast(res?.message || 'Failed to mark as viewed. Please try again.', 'error');
        return;
      }
      // Success — update the card's mark-viewed button in the background list
      const cardBtn = body.querySelector(`.btn--mark-viewed[data-id="${interestId}"]`);
      if (cardBtn) {
        cardBtn.innerHTML = `${icon('checkCircle', 13)} Portfolio & Resume Viewed — Click to View Again`;
        cardBtn.style.background = 'rgba(16,185,129,0.1)';
        cardBtn.style.color = 'var(--color-success)';
        cardBtn.style.borderColor = 'rgba(16,185,129,0.3)';
      }
      // Enable the Review button
      const reviewBtn = body.querySelector(`.btn--review-student[data-id="${interestId}"]`);
      if (reviewBtn) {
        reviewBtn.disabled = false;
        reviewBtn.title = '';
        reviewBtn.style.opacity = '1';
        reviewBtn.style.cursor = 'pointer';
        reviewBtn.removeAttribute('disabled');
      }
      showToast('Portfolio marked as viewed. You can now Review this student.', 'success');
      closeModal();
    } catch {
      markBtn.disabled = false;
      markBtn.innerHTML = `${icon('checkCircle', 14)} Mark as Viewed & Close`;
      showToast('Network error. Please check your connection.', 'error');
    }
  });
}

// ── Review Modal (requires note) ──────────────────────────────────────────────

function showReviewModal(slot, interestId, studentName, body, container, allSlots, backdrop) {
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop modal-backdrop--visible';
  modal.style.zIndex = '9999';
  modal.innerHTML = `
    <div class="modal modal--visible" style="max-width:480px;">
      <div class="modal__header" style="border-bottom:3px solid var(--color-success);">
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="width:40px;height:40px;border-radius:10px;background:rgba(16,185,129,0.1);color:var(--color-success);display:flex;align-items:center;justify-content:center;">${icon('userCheck', 20)}</div>
          <div>
            <h3 class="modal__title" style="margin:0;">Review Applicant</h3>
            <p style="font-size:0.76rem;color:var(--text-secondary);margin:2px 0 0;">${studentName}</p>
          </div>
        </div>
        <button class="modal__close" id="rv-close">${icon('x', 20)}</button>
      </div>
      <div class="modal__body" style="padding:20px 24px;">
        <div style="background:rgba(74,108,247,0.06);border:1px solid rgba(74,108,247,0.2);border-radius:var(--radius-md);padding:12px 14px;margin-bottom:18px;font-size:0.8rem;color:var(--text-secondary);display:flex;gap:8px;">
          ${icon('alertCircle', 14)} After reviewing, the OJT Coordinator will be notified to process the endorsement.
        </div>
        <div class="form-group">
          <label class="form-label">Message / Note for Student <span style="color:var(--color-error);">*</span></label>
          <textarea id="rv-note" class="form-textarea" rows="4" placeholder="e.g. We would like to invite you for an initial assessment. Please come prepared with your portfolio." style="resize:vertical;"></textarea>
          <span class="form-hint">This note will be shown to the student. Be clear and professional.</span>
        </div>
        <p id="rv-error" style="color:var(--color-error);font-size:0.8rem;margin:8px 0 0;display:none;"></p>
      </div>
      <div class="modal__footer">
        <button class="btn btn--outline" id="rv-cancel">Cancel</button>
        <button class="btn btn--primary" id="rv-submit" style="background:var(--color-success);border-color:var(--color-success);gap:6px;">${icon('checkCircle', 14)} Confirm Review</button>
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
    if (!note || note.length < 5) { errEl.textContent = 'Please enter a note of at least 5 characters.'; errEl.style.display = 'block'; return; }
    const submitBtn = modal.querySelector('#rv-submit');
    submitBtn.disabled = true; submitBtn.innerHTML = `${icon('clock', 14)} Processing…`; errEl.style.display = 'none';
    try {
      const res = await apiPost(`/company/ojt-postings/${slot.id}/accept/${interestId}`, { company_note: note });
      if (res?.success) {
        close(); showToast(res.message || 'Student reviewed successfully!', 'success');
        const refreshed = await apiGet(`/company/ojt-postings/${slot.id}/interests`);
        if (refreshed?.success) renderApplicantsList(body, refreshed.data, slot, backdrop, container, allSlots);
        refreshSlotCards(container, allSlots);
      } else { errEl.textContent = res?.message || 'Failed to review student.'; errEl.style.display = 'block'; submitBtn.disabled = false; submitBtn.innerHTML = `${icon('checkCircle', 14)} Confirm Review`; }
    } catch { errEl.textContent = 'Network error. Please try again.'; errEl.style.display = 'block'; submitBtn.disabled = false; submitBtn.innerHTML = `${icon('checkCircle', 14)} Confirm Review`; }
  });
}

// ── Reject Modal (requires note) ──────────────────────────────────────────────
function showRejectModal(slot, interestId, studentName, body, container, allSlots, backdrop) {
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop modal-backdrop--visible';
  modal.style.zIndex = '9999';
  modal.innerHTML = `
    <div class="modal modal--visible" style="max-width:440px;">
      <div class="modal__header" style="border-bottom:3px solid var(--color-error);">
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="width:40px;height:40px;border-radius:10px;background:rgba(239,68,68,0.1);color:var(--color-error);display:flex;align-items:center;justify-content:center;">${icon('x', 20)}</div>
          <div>
            <h3 class="modal__title" style="margin:0;">Reject Applicant</h3>
            <p style="font-size:0.76rem;color:var(--text-secondary);margin:2px 0 0;">${studentName}</p>
          </div>
        </div>
        <button class="modal__close" id="rj-close">${icon('x', 20)}</button>
      </div>
      <div class="modal__body" style="padding:20px 24px;">
        <div class="form-group">
          <label class="form-label">Reason for Rejection <span style="color:var(--color-error);">*</span></label>
          <textarea id="rj-note" class="form-textarea" rows="4" placeholder="e.g. Declined due to schedule mismatch. We are unable to accommodate your preferred OJT period." style="resize:vertical;"></textarea>
          <span class="form-hint">The student will see this reason. Be respectful and clear.</span>
        </div>
        <p id="rj-error" style="color:var(--color-error);font-size:0.8rem;margin:8px 0 0;display:none;"></p>
      </div>
      <div class="modal__footer">
        <button class="btn btn--outline" id="rj-cancel">Cancel</button>
        <button class="btn btn--primary" id="rj-submit" style="background:var(--color-error);border-color:var(--color-error);gap:6px;">${icon('x', 14)} Confirm Rejection</button>
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
    if (!note || note.length < 5) { errEl.textContent = 'Please enter a rejection reason of at least 5 characters.'; errEl.style.display = 'block'; return; }
    const submitBtn = modal.querySelector('#rj-submit');
    submitBtn.disabled = true; submitBtn.innerHTML = `${icon('clock', 14)} Processing…`; errEl.style.display = 'none';
    try {
      const res = await apiPost(`/company/ojt-postings/${slot.id}/reject/${interestId}`, { company_note: note });
      if (res?.success) {
        close(); showToast('Student rejected.', 'info');
        const refreshed = await apiGet(`/company/ojt-postings/${slot.id}/interests`);
        if (refreshed?.success) renderApplicantsList(body, refreshed.data, slot, backdrop, container, allSlots);
        refreshSlotCards(container, allSlots);
      } else { errEl.textContent = res?.message || 'Failed to reject student.'; errEl.style.display = 'block'; submitBtn.disabled = false; submitBtn.innerHTML = `${icon('x', 14)} Confirm Rejection`; }
    } catch { errEl.textContent = 'Network error. Please try again.'; errEl.style.display = 'block'; submitBtn.disabled = false; submitBtn.innerHTML = `${icon('x', 14)} Confirm Rejection`; }
  });
}

// ── Schedule Interview Modal ──────────────────────────────────────────────────
function showScheduleInterviewModal(slot, interestId, studentName, body, container, allSlots, backdrop) {
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop modal-backdrop--visible';
  modal.style.zIndex = '9999';
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().slice(0, 16);
  modal.innerHTML = `
    <div class="modal modal--visible" style="max-width:520px;">
      <div class="modal__header" style="border-bottom:3px solid rgb(139,92,246);">
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="width:40px;height:40px;border-radius:10px;background:rgba(139,92,246,0.1);color:rgb(139,92,246);display:flex;align-items:center;justify-content:center;">${icon('calendar', 20)}</div>
          <div>
            <h3 class="modal__title" style="margin:0;">Schedule Interview</h3>
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
          <textarea id="si-note" class="form-textarea" rows="3" placeholder="e.g. Please bring your resume, portfolio, and 2 valid IDs." style="resize:vertical;"></textarea>
          <span class="form-hint">The student will receive these instructions along with the interview details.</span>
        </div>
        <p id="si-error" style="color:var(--color-error);font-size:0.8rem;margin:0;display:none;"></p>
      </div>
      <div class="modal__footer">
        <button class="btn btn--outline" id="si-cancel">Cancel</button>
        <button class="btn btn--primary" id="si-submit" style="background:rgb(139,92,246);border-color:rgb(139,92,246);gap:6px;">${icon('calendar', 14)} Schedule Interview</button>
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
    if (e.target.value === 'online') { label.innerHTML = 'Meeting Link <span style="color:var(--color-error);">*</span>'; loc.placeholder = 'e.g. https://meet.google.com/xyz-abc-def'; }
    else { label.innerHTML = 'Interview Location <span style="color:var(--color-error);">*</span>'; loc.placeholder = 'e.g. 2nd Floor, Main Office, Lacson St.'; }
  });
  modal.querySelector('#si-submit').addEventListener('click', async () => {
    const dt = modal.querySelector('#si-datetime').value;
    const type = modal.querySelector('#si-type').value;
    const loc = modal.querySelector('#si-location').value.trim();
    const note = modal.querySelector('#si-note').value.trim();
    const errEl = modal.querySelector('#si-error');
    if (!dt || !type || !loc || !note || note.length < 5) { errEl.textContent = 'Please fill in all fields.'; errEl.style.display = 'block'; return; }
    const submitBtn = modal.querySelector('#si-submit');
    submitBtn.disabled = true; submitBtn.innerHTML = `${icon('clock', 14)} Scheduling…`; errEl.style.display = 'none';
    try {
      const res = await apiPost(`/company/ojt-postings/${slot.id}/schedule-interview/${interestId}`, { interview_scheduled_at: dt, interview_type: type, interview_location: loc, company_note: note });
      if (res?.success) {
        close(); showToast(res.message || 'Interview scheduled successfully!', 'success');
        const refreshed = await apiGet(`/company/ojt-postings/${slot.id}/interests`);
        if (refreshed?.success) renderApplicantsList(body, refreshed.data, slot, backdrop, container, allSlots);
        refreshSlotCards(container, allSlots);
      } else { errEl.textContent = res?.message || 'Failed to schedule interview.'; errEl.style.display = 'block'; submitBtn.disabled = false; submitBtn.innerHTML = `${icon('calendar', 14)} Schedule Interview`; }
    } catch { errEl.textContent = 'Network error. Please try again.'; errEl.style.display = 'block'; submitBtn.disabled = false; submitBtn.innerHTML = `${icon('calendar', 14)} Schedule Interview`; }
  });
}



async function refreshSlotCards(container, allSlots) {
  try {
    const res = await apiGet('/company/ojt-postings');
    if (res?.success && Array.isArray(res.data)) {
      allSlots.length = 0;
      res.data.map(normalizeSlot).forEach(s => allSlots.push(s));
      updateStats(container, allSlots);
      renderSlotCards(container, allSlots);
    }
  } catch {}
}

// ── Request Endorsement Letter Modal ──────────────────────────────────────────
function showRequestEndorsementModal(slot, interestId, studentName, body, container, allSlots, backdrop) {
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop modal-backdrop--visible';
  modal.style.zIndex = '9999';
  modal.innerHTML = `
    <div class="modal modal--visible" style="max-width:440px;">
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
          ${icon('alertCircle', 14)} You are requesting the <strong>OJT Coordinator</strong> to upload an endorsement letter for <strong>${studentName}</strong>. The coordinator will be notified and will upload the letter. You will be able to schedule an interview only after the letter is uploaded.
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
    const res = await apiPost(`/company/ojt-postings/${slot.id}/request-endorsement/${interestId}`, {});
    if (res?.success) {
      close();
      showToast(res.message || 'Endorsement letter requested. The coordinator will be notified.', 'success');
      const refreshed = await apiGet(`/company/ojt-postings/${slot.id}/interests`);
      if (refreshed?.success) renderApplicantsList(body, refreshed.data, slot, backdrop, container, allSlots);
      refreshSlotCards(container, allSlots);
    } else {
      errEl.textContent = res?.message || 'Failed to send request.';
      errEl.style.display = 'block';
      submitBtn.disabled = false;
      submitBtn.innerHTML = `${icon('fileText', 14)} Send Request`;
    }
  });
}

// ── Accept After Interview Modal ───────────────────────────────────────────────
function showAcceptAfterInterviewModal(slot, interestId, studentName, body, container, allSlots, backdrop) {
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop modal-backdrop--visible';
  modal.style.zIndex = '9999';
  modal.innerHTML = `
    <div class="modal modal--visible" style="max-width:480px;">
      <div class="modal__header" style="border-bottom:3px solid var(--color-success);">
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="width:40px;height:40px;border-radius:10px;background:rgba(16,185,129,0.1);color:var(--color-success);display:flex;align-items:center;justify-content:center;">${icon('checkCircle', 20)}</div>
          <div>
            <h3 class="modal__title" style="margin:0;">Accept After Interview</h3>
            <p style="font-size:0.76rem;color:var(--text-secondary);margin:2px 0 0;">${studentName}</p>
          </div>
        </div>
        <button class="modal__close" id="ai-close">${icon('x', 20)}</button>
      </div>
      <div class="modal__body" style="padding:20px 24px;">
        <div style="background:rgba(16,185,129,0.06);border:1px solid rgba(16,185,129,0.2);border-radius:var(--radius-md);padding:12px 14px;margin-bottom:18px;font-size:0.8rem;color:var(--text-secondary);display:flex;gap:8px;">
          ${icon('alertCircle', 14)} After accepting, the OJT Coordinator will be notified to give final approval and start the student's OJT.
        </div>
        <div class="form-group">
          <label class="form-label">Final Message for Student <span style="color:var(--color-error);">*</span></label>
          <textarea id="ai-note" class="form-textarea" rows="4" placeholder='e.g. "Congratulations! Please report to the office on Monday, September 9 at 8:00 AM. Bring your documents."' style="resize:vertical;"></textarea>
          <span class="form-hint">This message will be sent to the student. Be clear and welcoming.</span>
        </div>
        <p id="ai-error" style="color:var(--color-error);font-size:0.8rem;margin:8px 0 0;display:none;"></p>
      </div>
      <div class="modal__footer">
        <button class="btn btn--outline" id="ai-cancel">Cancel</button>
        <button class="btn btn--primary" id="ai-submit" style="background:var(--color-success);border-color:var(--color-success);gap:6px;">${icon('checkCircle', 14)} Confirm Acceptance</button>
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
    if (!note || note.length < 5) { errEl.textContent = 'Please enter a message of at least 5 characters.'; errEl.style.display = 'block'; return; }
    const submitBtn = modal.querySelector('#ai-submit');
    submitBtn.disabled = true;
    submitBtn.innerHTML = `${icon('clock', 14)} Processing…`;
    errEl.style.display = 'none';
    const res = await apiPost(`/company/ojt-postings/${slot.id}/accept-after-interview/${interestId}`, { company_note: note });
    if (res?.success) {
      close();
      showToast(res.message || 'Student accepted! The coordinator will give final OJT approval.', 'success');
      const refreshed = await apiGet(`/company/ojt-postings/${slot.id}/interests`);
      if (refreshed?.success) renderApplicantsList(body, refreshed.data, slot, backdrop, container, allSlots);
      refreshSlotCards(container, allSlots);
    } else {
      errEl.textContent = res?.message || 'Failed to accept student.';
      errEl.style.display = 'block';
      submitBtn.disabled = false;
      submitBtn.innerHTML = `${icon('checkCircle', 14)} Confirm Acceptance`;
    }
  });
}

/**
 * Shows a modal for the company to set the OJT start date and instructions.
 * Called after the coordinator approves the student's OJT (status: accepted).
 * Transitions to ojt_confirmed and creates OjtRecord with status=pending.
 */
function showSetOjtStartModal(slot, interestId, studentName, body, container, allSlots, backdrop) {
  openSetOjtScheduleModal({
    studentName,
    postingTitle: slot?.title || 'OJT Placement',
    slotId: slot?.id,
    interestId,
    requiredHours: slot?.required_hours || 486,
    onSuccess: async () => {
      const { apiGet } = await import('../api/client.js');
      const fresh = await apiGet(`/company/ojt-postings/${slot.id}/interests`);
      if (fresh?.success) renderApplicantsList(body, fresh.data, slot, backdrop, container, allSlots);
    }
  });
}

function showPostSlotModal(container, allSlots) {
  openSlotWizard({ isEdit: false, slot: null, container, allSlots });
}

function showEditSlotModal(slot, container, allSlots) {
  if (!slot) return;
  openSlotWizard({ isEdit: true, slot, container, allSlots });
}

/**
 * Dramatic, uncluttered 3-Step Guided OJT Slot Wizard (Create & Edit)
 */
function openSlotWizard({ isEdit = false, slot = null, container, allSlots }) {
  const companyAddress = (slot && slot.location) || 'Unit 4, TechPark Building, Lacson St., Bacolod City, Negros Occidental';

  let currentStep = 1;
  const totalSteps = 3;

  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop modal-backdrop--visible';

  backdrop.innerHTML = `
    <div class="modal modal--visible ojt-wizard-modal">
      
      <!-- ── Wizard Dramatic Header ── -->
      <div class="ojt-wizard-header">
        <div class="ojt-wizard-header__top">
          <h3 class="ojt-wizard-header__title">
            ${icon('graduationCap', 22)} ${isEdit ? 'Edit OJT Slot Posting' : 'Post New OJT Trainee Slot'}
          </h3>
          <button class="ojt-wizard-header__close" id="wiz-close" title="Close">${icon('x', 18)}</button>
        </div>

        <!-- Stepper Progress Bar -->
        <div class="ojt-stepper-bar">
          <div class="ojt-stepper-line">
            <div class="ojt-stepper-line__fill" id="wiz-progress-line" style="width: 0%;"></div>
          </div>
          
          <div class="ojt-step-item ojt-step-item--active" data-step="1" id="step-node-1">
            <div class="ojt-step-item__circle" id="step-circle-1">1</div>
            <span class="ojt-step-item__label">Role &amp; Degree</span>
          </div>

          <div class="ojt-step-item" data-step="2" id="step-node-2">
            <div class="ojt-step-item__circle" id="step-circle-2">2</div>
            <span class="ojt-step-item__label">Skills &amp; Requirements</span>
          </div>

          <div class="ojt-step-item" data-step="3" id="step-node-3">
            <div class="ojt-step-item__circle" id="step-circle-3">3</div>
            <span class="ojt-step-item__label">Deployment &amp; Review</span>
          </div>
        </div>
      </div>

      <!-- ── Wizard Step Panels Body ── -->
      <div class="ojt-wizard-body">
        
        <!-- STEP 1: Role & Eligibility -->
        <div class="ojt-step-panel ojt-step-panel--active" id="wiz-panel-1">
          <div class="ojt-form-card">
            <div class="ojt-form-card__head">
              <div class="ojt-form-card__icon">${icon('layers', 17)}</div>
              <div>
                <h4 class="ojt-form-card__title">Department &amp; Capacity</h4>
                <p class="ojt-form-card__subtitle">Choose the hosting department and available trainee slots</p>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group" style="flex:1;">
                <label class="form-label">Department Accepting Trainees *</label>
                <select class="form-select" id="wiz-dept" required>
                  <option value="">Select department</option>
                  <option value="IT Department">IT Department</option>
                  <option value="Accounting Department">Accounting Department</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Marketing Department">Marketing Department</option>
                  <option value="Finance Department">Finance Department</option>
                  <option value="Operations">Operations</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Administration">Administration</option>
                  <option value="Customer Service">Customer Service</option>
                </select>
              </div>

              <div class="form-group" style="flex:1;">
                <label class="form-label">Number of Slots Available *</label>
                <input type="number" class="form-input" id="wiz-slots" min="1" max="50" placeholder="e.g. 3" value="${slot?.slots || 2}" required />
              </div>
            </div>
          </div>

          <div class="ojt-form-card">
            <div class="ojt-form-card__head">
              <div class="ojt-form-card__icon">${icon('award', 17)}</div>
              <div>
                <h4 class="ojt-form-card__title">Role Title</h4>
                <p class="ojt-form-card__subtitle">Select a curated department role or type a custom role title</p>
              </div>
            </div>

            <div class="form-group" style="margin-bottom:8px;">
              <input type="text" class="form-input" id="wiz-title" placeholder="e.g. IT Support Intern" value="${escapeHtml(slot?.slotTitle || '')}" required />
            </div>

            <div>
              <span class="text-xs text-secondary" id="wiz-role-hint" style="font-weight:600;">Recommended Roles:</span>
              <div id="wiz-role-suggestions" style="display:flex;flex-wrap:wrap;gap:6px;margin-top:6px;"></div>
            </div>
          </div>

          <div class="ojt-form-card">
            <div class="ojt-form-card__head">
              <div class="ojt-form-card__icon">${icon('bookOpen', 17)}</div>
              <div style="flex:1;">
                <div style="display:flex;align-items:center;justify-content:space-between;">
                  <h4 class="ojt-form-card__title">Preferred Degree Programs *</h4>
                  <span class="text-xs text-secondary" id="wiz-courses-count">0 courses selected</span>
                </div>
                <p class="ojt-form-card__subtitle">CHMSU academic programs eligible for this training placement</p>
              </div>
            </div>

            <div id="wiz-courses-chips" class="ojt-picker-box">
              <span class="ojt-picker-box--empty" id="wiz-courses-empty">Click recommendations below or add custom degree program.</span>
            </div>

            <div style="display:flex;gap:8px;margin-bottom:10px;">
              <input type="text" class="form-input" id="wiz-course-input" placeholder="Type course code (e.g. BSIT, BSCS) and press Enter..." />
              <button type="button" class="btn btn--outline" id="btn-add-wiz-course" style="white-space:nowrap;padding:0 14px;">+ Add</button>
            </div>

            <div>
              <span class="text-xs text-secondary" style="font-weight:600;">Recommendations for this slot:</span>
              <div id="wiz-courses-suggestions" style="display:flex;flex-wrap:wrap;gap:5px;margin-top:6px;"></div>
            </div>
          </div>
        </div>

        <!-- STEP 2: Skills & Requirements -->
        <div class="ojt-step-panel" id="wiz-panel-2">
          
          <div class="ojt-form-card" style="border-left: 4px solid #005930;">
            <div class="ojt-form-card__head">
              <div class="ojt-form-card__icon" style="background:#ecfdf5;color:#005930;">${icon('zap', 17)}</div>
              <div style="flex:1;">
                <div style="display:flex;align-items:center;justify-content:space-between;">
                  <h4 class="ojt-form-card__title">Required Skills (Match Score Evaluator)</h4>
                  <span class="text-xs text-secondary" id="wiz-skills-count">0 skills added</span>
                </div>
                <p class="ojt-form-card__subtitle">Candidates matching 25% or below receive "NOT RECOMMENDED"; 26%–70% receive "RECOMMENDED"; 71%+ receive "HIGHLY RECOMMENDED"</p>
              </div>
            </div>

            <div id="wiz-skills-chips" class="ojt-picker-box">
              <span class="ojt-picker-box--empty" id="wiz-skills-empty">No skills added yet. Select popular OJT skills below or type custom.</span>
            </div>

            <div style="display:flex;gap:8px;margin-bottom:10px;">
              <input type="text" class="form-input" id="wiz-skills-input" placeholder="Type a skill and press Enter (e.g. PHP, MySQL, Technical Support)..." />
              <button type="button" class="btn btn--outline" id="btn-add-wiz-skills" style="white-space:nowrap;padding:0 14px;">+ Add</button>
            </div>

            <div>
              <span class="text-xs text-secondary" style="font-weight:600;">Popular OJT skills:</span>
              <div id="wiz-skills-suggestions" style="display:flex;flex-wrap:wrap;gap:5px;margin-top:6px;"></div>
            </div>
          </div>

          <div class="ojt-form-card">
            <div class="ojt-form-card__head">
              <div class="ojt-form-card__icon" style="background:#f0f9ff;color:#0284c7;">${icon('fileText', 17)}</div>
              <div style="flex:1;">
                <div style="display:flex;align-items:center;justify-content:space-between;">
                  <h4 class="ojt-form-card__title">Required Documents</h4>
                  <span class="text-xs text-secondary" id="wiz-docs-count">0 documents added</span>
                </div>
                <p class="ojt-form-card__subtitle">Clearance and onboarding documents trainees must provide</p>
              </div>
            </div>

            <div id="wiz-docs-chips" class="ojt-picker-box">
              <span class="ojt-picker-box--empty" id="wiz-docs-empty">No documents added yet. Select standard recommendations or add custom.</span>
            </div>

            <div style="display:flex;gap:8px;margin-bottom:10px;">
              <input type="text" class="form-input" id="wiz-docs-input" placeholder="Add custom document requirement and press Enter..." />
              <button type="button" class="btn btn--outline" id="btn-add-wiz-docs" style="white-space:nowrap;padding:0 14px;">+ Add</button>
            </div>

            <div>
              <span class="text-xs text-secondary" style="font-weight:600;">Standard OJT Documents:</span>
              <div id="wiz-docs-suggestions" style="display:flex;flex-wrap:wrap;gap:5px;margin-top:6px;"></div>
            </div>
          </div>

          <div class="ojt-form-card">
            <div class="ojt-form-card__head">
              <div class="ojt-form-card__icon" style="background:#fdf4ff;color:#86198f;">${icon('checkCircle', 17)}</div>
              <div style="flex:1;">
                <div style="display:flex;align-items:center;justify-content:space-between;">
                  <h4 class="ojt-form-card__title">Qualifications &amp; Eligibility</h4>
                  <span class="text-xs text-secondary" id="wiz-quals-count">0 qualifications added</span>
                </div>
                <p class="ojt-form-card__subtitle">Prerequisites and student qualities for placement</p>
              </div>
            </div>

            <div id="wiz-quals-chips" class="ojt-picker-box">
              <span class="ojt-picker-box--empty" id="wiz-quals-empty">No qualifications added yet. Select recommendations or add custom.</span>
            </div>

            <div style="display:flex;gap:8px;margin-bottom:10px;">
              <input type="text" class="form-input" id="wiz-quals-input" placeholder="Add custom qualification and press Enter..." />
              <button type="button" class="btn btn--outline" id="btn-add-wiz-quals" style="white-space:nowrap;padding:0 14px;">+ Add</button>
            </div>

            <div>
              <span class="text-xs text-secondary" style="font-weight:600;">Recommended Qualifications:</span>
              <div id="wiz-quals-suggestions" style="display:flex;flex-wrap:wrap;gap:5px;margin-top:6px;"></div>
            </div>
          </div>
        </div>

        <!-- STEP 3: Deployment & Final Review -->
        <div class="ojt-step-panel" id="wiz-panel-3">
          
          <div class="ojt-form-card">
            <div class="ojt-form-card__head">
              <div class="ojt-form-card__icon">${icon('mapPin', 17)}</div>
              <div>
                <h4 class="ojt-form-card__title">Trainee Deployment Location</h4>
                <p class="ojt-form-card__subtitle">Specify main office address or designated satellite branch</p>
              </div>
            </div>

            <div class="form-group">
              <div style="position: relative;">
                <input type="text" class="form-input" id="wiz-location" value="${escapeHtml(companyAddress)}" style="padding-right: 90px;" />
                <span id="wiz-location-pill" style="position:absolute;right:12px;top:50%;transform:translateY(-50%);font-size:0.68rem;font-weight:700;color:#005930;background:#ecfdf5;padding:2px 8px;border-radius:99px;">Main Office</span>
              </div>
            </div>

            <label style="display:flex;align-items:center;gap:8px;cursor:pointer;margin:6px 0 10px;">
              <input type="checkbox" id="wiz-branch-toggle" style="width:15px;height:15px;cursor:pointer;" />
              <span class="text-sm text-secondary">Trainees will report to a branch / satellite office</span>
            </label>

            <div id="wiz-branch-wrap" style="display:none;margin-bottom:14px;padding:12px;background:var(--bg-secondary);border-radius:var(--radius-md);">
              <div class="form-group" style="margin-bottom:8px;">
                <label class="form-label" style="font-size:0.75rem;">Branch / Site Name *</label>
                <input type="text" class="form-input" id="wiz-branch-name" placeholder="e.g. Ayala Branch, North Campus Site" />
              </div>
              <div class="form-group" style="margin-bottom:0;">
                <label class="form-label" style="font-size:0.75rem;">Branch Office Address *</label>
                <input type="text" class="form-input" id="wiz-branch-address" placeholder="e.g. 2nd Floor, Ayala Mall, Bacolod City" />
              </div>
            </div>

            <!-- Map Coordinates Compact -->
            <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:var(--bg-secondary);border-radius:var(--radius-md);border:1px solid var(--border-light);">
              <div>
                <p style="font-size:0.78rem;font-weight:700;margin:0 0 2px;">Map Coordinates</p>
                <p id="wiz-coords-status" style="font-size:0.7rem;color:var(--text-tertiary);margin:0;">
                  ${(slot && slot.latitude && slot.longitude) ? `<span style="color:#005930;font-weight:600;">Pinned: ${slot.latitude.toFixed(4)}, ${slot.longitude.toFixed(4)}</span>` : 'Coordinates not pinned (uses text address)'}
                </p>
              </div>
              <button type="button" id="btn-wiz-map" class="btn btn--outline" style="height:32px;padding:0 12px;font-size:0.76rem;gap:5px;">
                ${icon('mapPin', 13)} Pin on Map
              </button>
              <input type="hidden" id="wiz-lat" value="${slot?.latitude != null ? slot.latitude : ''}" />
              <input type="hidden" id="wiz-lon" value="${slot?.longitude != null ? slot.longitude : ''}" />
            </div>
          </div>

          <div class="ojt-form-card">
            <div class="ojt-form-card__head">
              <div class="ojt-form-card__icon">${icon('user', 17)}</div>
              <div>
                <h4 class="ojt-form-card__title">Contact Person &amp; Publishing</h4>
                <p class="ojt-form-card__subtitle">Designate the company coordinator trainees can reach</p>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group" style="flex:1;">
                <label class="form-label">Contact Person Name *</label>
                <input type="text" class="form-input" id="wiz-contact-name" value="${escapeHtml(slot?.contactName || '')}" placeholder="e.g. Engr. Mark Rivera" required />
              </div>
              <div class="form-group" style="flex:1;">
                <label class="form-label">Phone / Mobile Number *</label>
                <input type="tel" class="form-input" id="wiz-contact-phone" value="${escapeHtml(slot?.contactPhone || '')}" placeholder="e.g. 0917-123-4567" required />
              </div>
            </div>

            <div class="form-group" style="max-width: 220px;margin-bottom:0;">
              <label class="form-label">Posting Status</label>
              <select class="form-select" id="wiz-status">
                <option value="open" ${slot?.status === 'open' ? 'selected' : ''}>Publish Now (Open)</option>
                <option value="draft" ${slot?.status === 'draft' ? 'selected' : ''}>Save as Draft</option>
                ${isEdit ? `
                  <option value="filling_up" ${slot?.status === 'filling_up' ? 'selected' : ''}>Filling Up</option>
                  <option value="closed" ${slot?.status === 'closed' ? 'selected' : ''}>Closed</option>
                ` : ''}
              </select>
            </div>
          </div>

          <!-- Dramatic Live Card Preview -->
          <div class="ojt-preview-box">
            <span class="ojt-preview-box__badge">${icon('eye', 12)} Trainee Card Preview</span>
            <div id="wiz-card-preview-target"></div>
          </div>

        </div>

      </div>

      <!-- ── Wizard Footer Navigation ── -->
      <div class="ojt-wizard-footer">
        <button type="button" class="btn btn--outline" id="wiz-btn-cancel">Cancel</button>
        <div style="display:flex;gap:10px;">
          <button type="button" class="btn btn--ghost" id="wiz-btn-back" style="display:none;">
            ${icon('arrowLeft', 14)} Back
          </button>
          <button type="button" class="btn btn--primary" id="wiz-btn-next" style="gap:6px;background:#005930;border-color:#005930;">
            Next: Skills &amp; Requirements ${icon('arrowRight', 14)}
          </button>
        </div>
      </div>

    </div>
  `;

  document.body.appendChild(backdrop);

  // Wizard state & DOM elements
  const deptSelect = backdrop.querySelector('#wiz-dept');
  if (slot?.department) deptSelect.value = slot.department;

  renderRoleRecommender(backdrop, slot?.slotTitle || '', deptSelect, 'wiz');
  const coursePicker = renderCourseMultiPicker(backdrop, slot?.preferredCoursesList || [], deptSelect, 'wiz');
  const skillsPicker = renderTagPicker(backdrop, slot?.requiredSkills || [], POPULAR_OJT_SKILLS, 'wiz-skills', 'skill');
  const docsPicker = renderTagPicker(backdrop, slot?.requiredDocuments || ['OJT Endorsement Letter from School / CIER', 'Parent / Guardian Consent & Waiver Form'], STANDARD_OJT_DOCUMENTS, 'wiz-docs', 'document', 'ojt-tag-chip--doc');
  const qualsPicker = renderTagPicker(backdrop, slot?.qualifications || ['Currently enrolled in 3rd or 4th Year', 'Willing to render 486 - 600 required hours'], STANDARD_OJT_QUALIFICATIONS, 'wiz-quals', 'qualification', 'ojt-tag-chip--qual');

  // Branch toggle
  const branchToggle = backdrop.querySelector('#wiz-branch-toggle');
  const branchWrap = backdrop.querySelector('#wiz-branch-wrap');
  const locationPill = backdrop.querySelector('#wiz-location-pill');
  if (slot?.branchName) {
    branchToggle.checked = true;
    branchWrap.style.display = 'block';
    backdrop.querySelector('#wiz-branch-name').value = slot.branchName;
    backdrop.querySelector('#wiz-branch-address').value = slot.location;
    if (locationPill) locationPill.textContent = 'Branch';
  }

  branchToggle.addEventListener('change', e => {
    branchWrap.style.display = e.target.checked ? 'block' : 'none';
    backdrop.querySelector('#wiz-branch-name').required = e.target.checked;
    backdrop.querySelector('#wiz-branch-address').required = e.target.checked;
    if (locationPill) locationPill.textContent = e.target.checked ? 'Branch' : 'Main Office';
  });

  // Map picker
  backdrop.querySelector('#btn-wiz-map').addEventListener('click', () => {
    const lat = parseFloat(backdrop.querySelector('#wiz-lat').value) || null;
    const lon = parseFloat(backdrop.querySelector('#wiz-lon').value) || null;
    showMapPicker(lat, lon, (pickedLat, pickedLon) => {
      backdrop.querySelector('#wiz-lat').value = pickedLat.toFixed(7);
      backdrop.querySelector('#wiz-lon').value = pickedLon.toFixed(7);
      const status = backdrop.querySelector('#wiz-coords-status');
      status.innerHTML = `<span style="color:#005930;font-weight:600;">${icon('checkCircle', 11)} Coordinates Pinned: ${pickedLat.toFixed(4)}, ${pickedLon.toFixed(4)}</span>`;
    });
  });

  // Live preview builder in Step 3
  function updateLivePreview() {
    const target = backdrop.querySelector('#wiz-card-preview-target');
    if (!target) return;
    const dept = deptSelect.value || 'IT Department';
    const title = backdrop.querySelector('#wiz-title').value.trim() || 'Trainee Position';
    const courses = coursePicker.getCourses();
    const skills = skillsPicker.getItems();
    const slotsCount = parseInt(backdrop.querySelector('#wiz-slots').value) || 2;
    const isBranch = branchToggle.checked;
    const loc = isBranch
      ? (backdrop.querySelector('#wiz-branch-address').value || 'Branch Office')
      : (backdrop.querySelector('#wiz-location').value || companyAddress);

    target.innerHTML = `
      <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:10px;padding:16px;box-shadow:0 1px 3px rgba(0,0,0,0.03);">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">
          <div style="width:42px;height:42px;border-radius:10px;background:#ecfdf5;color:#005930;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:1rem;">
            ${deptInitials(dept)}
          </div>
          <div style="flex:1;min-width:0;">
            <h4 style="margin:0;font-size:1rem;font-weight:800;color:#0f172a;">${title}</h4>
            <p style="margin:2px 0 0;font-size:0.75rem;color:#64748b;">${dept}</p>
          </div>
          <span class="badge badge--success">Open</span>
        </div>

        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px;">
          <span class="ojts-tag" style="font-size:0.72rem;">${icon('bookOpen', 11)} ${courses.length ? courses.join(', ') : 'Open to All'}</span>
          <span class="ojts-tag" style="font-size:0.72rem;">${icon('calendar', 11)} 5 months (600 hours)</span>
          <span class="ojts-tag" style="font-size:0.72rem;">${icon('mapPin', 11)} ${loc.split(',')[0]}</span>
        </div>

        ${skills.length ? `
        <div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:12px;">
          ${skills.slice(0, 4).map(s => `<span class="ap-skill-chip" style="font-size:0.68rem;padding:2px 7px;">${s}</span>`).join('')}
          ${skills.length > 4 ? `<span class="ap-skill-chip ap-skill-chip--more" style="font-size:0.68rem;padding:2px 6px;">+${skills.length - 4}</span>` : ''}
        </div>
        ` : ''}

        <div style="background:#f8fafc;border-radius:6px;padding:8px 10px;display:flex;align-items:center;justify-content:space-between;font-size:0.75rem;">
          <span style="color:#64748b;">Availability: <strong>${slotsCount} of ${slotsCount} slots remaining</strong></span>
          <span style="font-weight:700;color:#10b981;">100% Available</span>
        </div>
      </div>
    `;
  }

  // Stepper Controller
  function goToStep(step) {
    if (step < 1 || step > totalSteps) return;

    // Validation when moving forward
    if (step > currentStep) {
      if (currentStep === 1) {
        if (!deptSelect.value) {
          showToast('Please select a department.', 'error');
          deptSelect.focus();
          return;
        }
        const titleVal = backdrop.querySelector('#wiz-title').value.trim();
        if (!titleVal) {
          showToast('Please enter or pick a role title.', 'error');
          backdrop.querySelector('#wiz-title').focus();
          return;
        }
        const selCourses = coursePicker.getCourses();
        if (selCourses.length === 0) {
          showToast('Please select at least one preferred degree program.', 'error');
          return;
        }
      }
    }

    currentStep = step;

    // Update Progress Line & Nodes
    const linePercent = ((currentStep - 1) / (totalSteps - 1)) * 100;
    backdrop.querySelector('#wiz-progress-line').style.width = `${linePercent}%`;

    for (let i = 1; i <= totalSteps; i++) {
      const node = backdrop.querySelector(`#step-node-${i}`);
      const circle = backdrop.querySelector(`#step-circle-${i}`);
      const panel = backdrop.querySelector(`#wiz-panel-${i}`);

      if (panel) panel.classList.toggle('ojt-step-panel--active', i === currentStep);

      node.classList.remove('ojt-step-item--active', 'ojt-step-item--done');
      if (i === currentStep) {
        node.classList.add('ojt-step-item--active');
        circle.innerHTML = `${i}`;
      } else if (i < currentStep) {
        node.classList.add('ojt-step-item--done');
        circle.innerHTML = icon('check', 14);
      } else {
        circle.innerHTML = `${i}`;
      }
    }

    // Update Buttons
    const backBtn = backdrop.querySelector('#wiz-btn-back');
    const nextBtn = backdrop.querySelector('#wiz-btn-next');

    backBtn.style.display = currentStep > 1 ? 'inline-flex' : 'none';

    if (currentStep === 1) {
      nextBtn.innerHTML = `Continue to Skills &amp; Requirements ${icon('arrowRight', 14)}`;
      nextBtn.style.background = '#005930';
    } else if (currentStep === 2) {
      nextBtn.innerHTML = `Continue to Deployment Details ${icon('arrowRight', 14)}`;
      nextBtn.style.background = '#005930';
    } else if (currentStep === 3) {
      nextBtn.innerHTML = `${icon('checkCircle', 16)} ${isEdit ? 'Save Changes' : 'Publish OJT Slot'}`;
      nextBtn.style.background = '#005930';
      updateLivePreview();
    }
  }

  // Clickable step nodes
  backdrop.querySelectorAll('.ojt-step-item').forEach(node => {
    node.addEventListener('click', () => {
      const target = parseInt(node.dataset.step);
      if (target <= currentStep || target === currentStep + 1) {
        goToStep(target);
      }
    });
  });

  backdrop.querySelector('#wiz-btn-back').addEventListener('click', () => goToStep(currentStep - 1));

  // Next / Submit Button
  backdrop.querySelector('#wiz-btn-next').addEventListener('click', async () => {
    if (currentStep < totalSteps) {
      goToStep(currentStep + 1);
      return;
    }

    // Submission on Step 3
    const contactName = backdrop.querySelector('#wiz-contact-name').value.trim();
    const contactPhone = backdrop.querySelector('#wiz-contact-phone').value.trim();

    if (!contactName) {
      showToast('Please provide a contact person name.', 'error');
      backdrop.querySelector('#wiz-contact-name').focus();
      return;
    }
    if (!contactPhone) {
      showToast('Please provide a contact phone number.', 'error');
      backdrop.querySelector('#wiz-contact-phone').focus();
      return;
    }

    const nextBtn = backdrop.querySelector('#wiz-btn-next');
    nextBtn.disabled = true;
    nextBtn.innerHTML = `${icon('clock', 16)} ${isEdit ? 'Saving...' : 'Publishing...'}`;

    const useBranch = branchToggle.checked;
    const location = useBranch
      ? backdrop.querySelector('#wiz-branch-address').value.trim()
      : backdrop.querySelector('#wiz-location').value.trim();
    const branchName = useBranch ? backdrop.querySelector('#wiz-branch-name').value.trim() : null;

    const latVal = parseFloat(backdrop.querySelector('#wiz-lat').value);
    const lonVal = parseFloat(backdrop.querySelector('#wiz-lon').value);

    const payload = {
      title:              backdrop.querySelector('#wiz-title').value.trim(),
      department:         deptSelect.value,
      location:           location || companyAddress,
      branch_name:        branchName || null,
      latitude:           !isNaN(latVal) ? latVal : null,
      longitude:          !isNaN(lonVal) ? lonVal : null,
      preferred_courses:  coursePicker.getCourses(),
      required_skills:    skillsPicker.getItems(),
      required_documents: docsPicker.getItems(),
      qualifications:     qualsPicker.getItems(),
      slots_total:        parseInt(backdrop.querySelector('#wiz-slots').value) || 1,
      status:             backdrop.querySelector('#wiz-status').value,
      contact_name:       contactName,
      contact_phone:      contactPhone,
    };

    try {
      let res;
      if (isEdit) {
        res = await apiPut(`/company/ojt-postings/${slot.id}`, payload);
      } else {
        res = await apiPost('/company/ojt-postings', payload);
      }

      backdrop.remove();

      if (res?.success) {
        showToast(isEdit ? 'OJT slot updated successfully!' : 'OJT slot published successfully!', 'success');
        await refreshSlotCards(container, allSlots);
      } else {
        showToast(res?.message || 'Failed to save slot. Please try again.', 'error');
      }
    } catch {
      backdrop.remove();
      showToast('Error saving slot. Make sure you are logged in.', 'error');
    }
  });

  const closeModal = () => backdrop.remove();
  backdrop.querySelector('#wiz-close').addEventListener('click', closeModal);
  backdrop.querySelector('#wiz-btn-cancel').addEventListener('click', closeModal);
  backdrop.addEventListener('click', e => { if (e.target === backdrop) closeModal(); });
}

function showMapPicker(initialLat, initialLon, onConfirm) {
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop modal-backdrop--visible';
  backdrop.style.cssText = 'z-index:9999;';
  backdrop.innerHTML = `
    <div class="modal modal--visible" style="max-width:680px;width:95vw;">
      <div class="modal__header">
        <h3 class="modal__title" style="display:flex;align-items:center;gap:8px;">
          ${icon('mapPin', 18)} Pin Deployment Location
        </h3>
        <button class="modal__close" id="map-picker-close">${icon('x', 20)}</button>
      </div>
      <div class="modal__body" style="padding:0;">
        <div style="padding:10px 16px;background:rgba(59,130,246,0.08);border-bottom:1px solid var(--border-light);font-size:0.78rem;color:var(--text-secondary);display:flex;align-items:center;gap:8px;">
          ${icon('alertCircle', 13)} Click anywhere on the map to place the pin. Drag the pin to adjust precisely.
        </div>
        <div id="map-picker-container" style="height:420px;width:100%;"></div>
        <div style="padding:12px 16px;background:var(--bg-secondary);border-top:1px solid var(--border-light);display:flex;align-items:center;gap:10px;">
          ${icon('mapPin', 14)}
          <div style="flex:1;">
            <p style="font-size:0.7rem;color:var(--text-tertiary);margin:0 0 2px;text-transform:uppercase;letter-spacing:0.05em;">Selected Coordinates</p>
            <p id="map-picker-coords" style="font-size:0.92rem;font-weight:700;margin:0;font-family:monospace;">— Click the map to set a pin —</p>
          </div>
        </div>
      </div>
      <div class="modal__footer">
        <button class="btn btn--outline" id="map-picker-cancel">Cancel</button>
        <button class="btn btn--primary" id="map-picker-confirm" disabled style="gap:6px;">
          ${icon('checkCircle', 15)} Use These Coordinates
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(backdrop);

  const closeModal = () => backdrop.remove();
  backdrop.querySelector('#map-picker-close').addEventListener('click', closeModal);
  backdrop.querySelector('#map-picker-cancel').addEventListener('click', closeModal);
  backdrop.addEventListener('click', e => { if (e.target === backdrop) closeModal(); });

  let pickedLat = initialLat;
  let pickedLon = initialLon;

  function updateCoordsDisplay() {
    const coordsEl  = backdrop.querySelector('#map-picker-coords');
    const confirmBtn = backdrop.querySelector('#map-picker-confirm');
    if (pickedLat != null && pickedLon != null) {
      coordsEl.textContent = `${pickedLat.toFixed(7)},  ${pickedLon.toFixed(7)}`;
      confirmBtn.disabled = false;
    }
  }

  function bootMap() {
    const L = window.L;
    const defaultLat = initialLat ?? 10.6840;
    const defaultLon = initialLon ?? 122.9563;

    const map = L.map('map-picker-container', { zoomControl: true, scrollWheelZoom: true })
      .setView([defaultLat, defaultLon], initialLat ? 16 : 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 19,
    }).addTo(map);

    const redIcon = L.divIcon({
      html: `<div style="width:30px;height:30px;border-radius:50% 50% 50% 0;background:#ef4444;border:3px solid #fff;box-shadow:0 3px 10px rgba(0,0,0,0.35);transform:rotate(-45deg);"></div>`,
      className: '',
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -32],
    });

    let marker = null;

    function placePin(lat, lon) {
      pickedLat = lat;
      pickedLon = lon;
      if (marker) {
        marker.setLatLng([lat, lon]);
      } else {
        marker = L.marker([lat, lon], { icon: redIcon, draggable: true }).addTo(map);
        marker.on('dragend', () => {
          const pos = marker.getLatLng();
          pickedLat = pos.lat;
          pickedLon = pos.lng;
          updateCoordsDisplay();
        });
      }
      updateCoordsDisplay();
    }

    if (initialLat != null && initialLon != null) {
      placePin(initialLat, initialLon);
    }

    map.on('click', e => placePin(e.latlng.lat, e.latlng.lng));

    if (initialLat == null && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(pos => {
        map.setView([pos.coords.latitude, pos.coords.longitude], 16);
      }, () => {}, { enableHighAccuracy: true, timeout: 6000 });
    }

    setTimeout(() => map.invalidateSize(), 100);
  }

  if (!document.querySelector('link[href*="leaflet"]')) {
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(css);
  }
  if (window.L) {
    bootMap();
  } else {
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = bootMap;
    document.head.appendChild(script);
  }

  backdrop.querySelector('#map-picker-confirm').addEventListener('click', () => {
    if (pickedLat != null && pickedLon != null) {
      closeModal();
      onConfirm(pickedLat, pickedLon);
    }
  });
}

function skeletonCards(count) {
  return Array.from({ length: count }, () => `
    <div class="ojts-card" style="pointer-events:none;">
      <div class="ojts-card__accent" style="background:var(--border-default);"></div>
      <div class="ojts-card__head">
        <div class="skeleton" style="width:44px;height:44px;border-radius:10px;flex-shrink:0;"></div>
        <div style="flex:1;">
          <div class="skeleton skeleton--text" style="width:55%;"></div>
          <div class="skeleton skeleton--text-sm" style="width:35%;margin-top:6px;"></div>
        </div>
      </div>
      <div style="padding:0 18px 14px;display:flex;gap:8px;flex-wrap:wrap;">
        <div class="skeleton" style="height:22px;width:80px;border-radius:99px;"></div>
        <div class="skeleton" style="height:22px;width:70px;border-radius:99px;"></div>
        <div class="skeleton" style="height:22px;width:90px;border-radius:99px;"></div>
      </div>
      <div style="padding:0 18px 18px;"><div class="skeleton" style="height:8px;border-radius:99px;"></div></div>
    </div>
  `).join('');
}

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast--${type} toast--visible`;
  toast.innerHTML = `${icon(type === 'success' ? 'checkCircle' : 'alertCircle', 16)} <span>${message}</span>`;
  document.body.appendChild(toast);
  setTimeout(() => { toast.classList.remove('toast--visible'); setTimeout(() => toast.remove(), 300); }, 3000);
}
