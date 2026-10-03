/**
 * CHMSU HireMe — OJT Page
 * 3 states: Browsing (no OJT) | Active (applied/deployed) | Completed
 */
import { icon } from '../components/icons.js';
import { apiFetch, apiGet, apiPost, apiDelete } from '../api/client.js';

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* ── Match-score color helper ── */
function scoreColor(score) {
  if (score >= 80) return { bg: 'var(--color-success-bg)', color: 'var(--color-success)', gradient: 'linear-gradient(135deg, #005930, #22c55e)' };
  if (score >= 60) return { bg: 'var(--color-primary-bg)', color: 'var(--color-primary)', gradient: 'linear-gradient(135deg, #005930, #16a34a)' };
  if (score > 0)   return { bg: 'var(--color-warning-bg)', color: 'var(--color-warning)', gradient: 'linear-gradient(135deg, #d97706, #f59e0b)' };
  return { bg: 'var(--bg-subtle,#f1f5f9)', color: 'var(--text-tertiary,#94a3b8)', gradient: 'linear-gradient(135deg, #64748b, #94a3b8)' };
}

/* ── Course Acronym Normalizer & Helper ── */
const COURSE_ACRONYM_MAP = {
  'Bachelor of Science in Information Technology': 'BSIT',
  'Bachelor of Science in Computer Science': 'BSCS',
  'Bachelor of Science in Information Systems': 'BSIS',
  'Bachelor of Science in Entertainment and Multimedia Computing': 'BSEMC',
  'Bachelor of Science in Electronics Engineering': 'BSECE',
  'Bachelor of Science in Civil Engineering': 'BSCE',
  'Bachelor of Science in Mechanical Engineering': 'BSME',
  'Bachelor of Science in Electrical Engineering': 'BSEE',
  'Bachelor of Science in Business Administration': 'BSBA',
  'Bachelor of Science in Hospitality Management': 'BSHM',
};

function formatCourseAcronym(course) {
  if (!course) return '';
  const s = String(course).trim();
  return COURSE_ACRONYM_MAP[s] || s;
}

function getUniqueCourseAcronyms(courses) {
  if (!courses || !Array.isArray(courses)) return [];
  const set = new Set();
  courses.forEach(c => {
    const acr = formatCourseAcronym(c);
    if (acr) set.add(acr);
  });
  return Array.from(set);
}

/* ── Modern match badge pill ── */
function renderMatchBadge(score) {
  const num = typeof score === 'number' ? Math.round(score) : Math.round(Number(score) || 0);
  if (num >= 71) {
    return `<span class="ojt-match-pill ojt-match-pill--high" title="${num}% Profile Match — Highly Recommended">
      ${icon('award', 11)} <span>${num}% Match</span>
    </span>`;
  }
  if (num > 25) {
    return `<span class="ojt-match-pill ojt-match-pill--mid" title="${num}% Profile Match — Recommended">
      ${icon('checkCircle', 11)} <span>${num}% Match</span>
    </span>`;
  }
  return `<span class="ojt-match-pill ojt-match-pill--not-rec" title="${num}% Profile Match — Not Recommended">
    ${icon('alertTriangle', 11)} <span>${num}% Match</span>
  </span>`;
}

/** Normalize API snake_case posting → camelCase shape expected by card renderers */
function normalizePosting(p, studentSkills = []) {
  const req = Array.isArray(p.required_skills) ? p.required_skills : (Array.isArray(p.skills) ? p.skills : []);
  let matched = Array.isArray(p.matched_skills) ? p.matched_skills : [];
  let score = p.match_score;

  // If match_score wasn't supplied by backend (or mock data), calculate client-side
  if (score == null) {
    const userSkillSet = new Set(studentSkills.map(s => String(s).toLowerCase().trim()));
    matched = req.filter(s => userSkillSet.has(String(s).toLowerCase().trim()));
    score = req.length > 0 ? Math.round((matched.length / req.length) * 100) : (studentSkills.length > 0 ? 60 : 50);
  }

  return {
    id:               p.id,
    slotTitle:        p.title || p.slotTitle || 'OJT Position',
    company:          p.company_name || p.company || 'Company',
    companyUserId:    p.company_user_id || null,
    companyInitial:   p.company_initial || (p.company_name || p.company)?.[0] || '?',
    companyColor:     p.company_color   || '#005930',
    companyDesc:      p.description     || p.companyDesc || '',
    department:       p.department      || '',
    industry:         p.industry        || '',
    scheduleType:     p.schedule_type   || p.scheduleType || 'full_day',
    schedule:         (p.schedule_type || p.scheduleType) === 'half_day' ? 'Half Day' : 'Full Day',
    duration:         p.duration        || '5 months (600 hours)',
    location:         p.location        || 'Philippines',
    slots:            p.slots_total     || p.slots     || 1,
    slotsRemaining:   p.slots_remaining != null ? p.slots_remaining : (p.slotsRemaining || 0),
    status:           p.status          || 'open',
    preferredCourses: Array.isArray(p.preferred_courses) ? p.preferred_courses : (p.preferredCourses ? (Array.isArray(p.preferredCourses) ? p.preferredCourses : [p.preferredCourses]) : []),
    requiredSkills:   req,
    matchedSkills:    matched,
    matchScore:       score,
    requiredDocuments: Array.isArray(p.required_documents) ? p.required_documents : (Array.isArray(p.requirements) ? p.requirements : ['OJT endorsement letter from school']),
    qualifications:   Array.isArray(p.qualifications) ? p.qualifications : [],
    postedDate:       p.posted_date      || (p.created_at ? new Date(p.created_at).toLocaleDateString() : ''),
    rawDate:          p.created_at       || null,
    description:      p.description      || '',
    tasks:            p.description       || p.tasks || '',
    learningOutcomes: p.learning_outcomes|| '',
    requirements:     Array.isArray(p.required_documents) ? p.required_documents : (p.requirements || ['OJT endorsement letter from school']),
    contactName:      p.contact_name     || 'CIER Office',
    mapLat:           p.latitude         ?? p.map_lat ?? 10.6766,
    mapLon:           p.longitude        ?? p.map_lon ?? 122.9498,
    is_interested:    p.is_interested    || false,
    interest_status:  p.interest_status  || null,
  };
}

// ── State labels ──────────────────────────────────────────────────────────────
// ── State labels ──────────────────────────────────────────────────────────────
const STATUS_META = {
  browsing:              { label: 'No Active OJT',          color: 'var(--text-tertiary)',  bg: 'var(--bg-tertiary)' },
  applied:               { label: 'Applied',                color: 'var(--color-info)',     bg: 'var(--color-info-bg)' },
  interested:            { label: 'Applied',                color: 'var(--color-info)',     bg: 'var(--color-info-bg)' },
  company_reviewed:      { label: 'Reviewed by Company',    color: '#D97706',               bg: 'rgba(217,119,6,0.1)' },
  endorsement_requested: { label: 'Endorsement Requested',  color: '#8B5CF6',               bg: 'rgba(139,92,246,0.1)' },
  endorsed:              { label: 'Endorsed',               color: 'var(--color-warning)',  bg: 'var(--color-warning-bg)' },
  interview_scheduled:   { label: 'Interview Scheduled',    color: '#059669',               bg: 'rgba(5,150,105,0.1)' },
  company_accepted:      { label: 'Accepted by Company',    color: '#059669',               bg: 'rgba(5,150,105,0.1)' },
  accepted:              { label: 'OJT Approved',           color: 'var(--color-success)',  bg: 'var(--color-success-bg)' },
  confirmed:             { label: 'Confirmed',              color: '#9B59B6',               bg: 'rgba(155,89,182,0.12)' },
  ojt_confirmed:         { label: 'OJT Confirmed',          color: '#8B5CF6',               bg: 'rgba(139,92,246,0.1)' },
  ojt_started:           { label: 'OJT Started',            color: 'var(--color-success)',  bg: 'var(--color-success-bg)' },
  active:                { label: 'Active OJT',             color: 'var(--color-success)',  bg: 'var(--color-success-bg)' },
  completed:             { label: 'Completed',              color: 'var(--color-accent)',   bg: 'var(--color-accent-bg)' },
  incomplete:            { label: 'Incomplete',             color: 'var(--color-error)',    bg: 'var(--color-error-bg)' },
};

const STATE_NEXT_ACTION = {
  applied:               'Your application is under review. The host company will evaluate your portfolio and credentials.',
  interested:            'Your application is under review. The host company will evaluate your portfolio and credentials.',
  company_reviewed:      'The company reviewed your application and will request an official endorsement letter.',
  endorsement_requested: 'Your supervisor has been asked to send your endorsement letter to the company.',
  endorsed:              'Your endorsement letter was received by the company. They will schedule your interview next.',
  interview_scheduled:   'An interview has been scheduled. Check your Applications page for details.',
  company_accepted:      'The company accepted you after the interview! Waiting for your OJT Coordinator\'s final approval.',
  accepted:              'The OJT Coordinator approved your OJT! The company will set your official start date soon.',
  confirmed:             'Company has confirmed your deployment. Download your endorsement letter and bring it on your first day.',
  ojt_confirmed:         'Your OJT start date and reporting instructions are set! Prepare for Day 1.',
  ojt_started:           'Your OJT training has officially started! Check your OJT Tracker.',
  active:                'You have unverified time records. Your company supervisor needs to confirm them.',
  completed:             'Your OJT is complete. You may now download your Certificate of Completion.',
  incomplete:            'Your OJT ended without completing the required hours. Contact CIER for guidance.',
};

// ── localStorage interest helpers ───────────────────────────────────────────
const LS_INTERESTS = 'hireme_ojt_interests';

function getLocalInterests() {
  try { return JSON.parse(localStorage.getItem(LS_INTERESTS) || '[]'); } catch { return []; }
}

function saveInterestLocally(slotId, slot) {
  const user = JSON.parse(localStorage.getItem('hireme_user') || '{}');
  const all  = getLocalInterests().filter(i => !(i.slotId === slotId && i.studentEmail === (user.email || '')));
  all.push({
    id:            Date.now(),
    slotId,
    slotTitle:     slot?.slotTitle || '',
    company:       slot?.company   || '',
    studentName:   user.name       || 'You',
    studentEmail:  user.email      || '',
    studentCourse: user.course || user.program || 'BSIT',
    message:       '',
    status:        'interested',
    createdAt:     new Date().toISOString(),
  });
  localStorage.setItem(LS_INTERESTS, JSON.stringify(all));
}

function removeInterestLocally(slotId) {
  const user = JSON.parse(localStorage.getItem('hireme_user') || '{}');
  const all  = getLocalInterests().filter(i => !(i.slotId === slotId && i.studentEmail === (user.email || '')));
  localStorage.setItem(LS_INTERESTS, JSON.stringify(all));
}

function loadLocalInterests(slots) {
  const user = JSON.parse(localStorage.getItem('hireme_user') || '{}');
  const mine = getLocalInterests().filter(i => !user.email || i.studentEmail === user.email);
  slots.forEach(s => {
    const rec = mine.find(i => i.slotId === s.id);
    if (rec) { s.is_interested = true; s.interest_status = rec.status; }
  });
}

// ── Entry point ───────────────────────────────────────────────────────────────
export async function renderOJT(container) {
  container.innerHTML = `
    <div style="padding: 12px 0;">
      <div class="skeleton skeleton--text" style="width:220px; height:28px; margin-bottom:8px;"></div>
      <div class="skeleton skeleton--text" style="width:380px;"></div>
    </div>
    <div class="skeleton skeleton--card" style="height:100px; margin-bottom:16px;"></div>
    <div class="skeleton skeleton--card" style="height:300px;"></div>
  `;

  // Fetch employment status to know whether to gate apply buttons
  let empStatus = null;
  try {
    empStatus = await apiGet('/student/employment-status');
  } catch { /* non-blocking */ }

  await renderBrowsingState(container, empStatus);
}

// ─────────────────────────────────────────────────────────────────────────────
// STATE 1 — BROWSING
// ─────────────────────────────────────────────────────────────────────────────
async function renderBrowsingState(container, empStatus = null) {
  const [eligRes, empRes, myInterestsRes, portfolioRes] = await Promise.all([
    apiFetch('ojt/eligibility').catch(() => ({ data: { status: 'eligible' } })),
    empStatus ? Promise.resolve(empStatus) : apiGet('/student/employment-status').catch(() => null),
    apiGet('/ojt/my-interests').catch(() => null),
    apiGet('/student/portfolio').catch(() => null),
  ]);
  const elig = eligRes?.data || { status: 'eligible' };
  const isHired = empRes?.hired === true;
  const hiredJob = empRes?.hired_job ?? null;
  const isActiveOjt = empRes?.active_ojt === true;
  const ojtInfo = empRes?.ojt_info ?? null;

  // Requirements gate status
  let ojtReqs = empRes?.ojt_requirements;
  if (!ojtReqs && !isActiveOjt && !isHired) {
    try {
      const r = await apiGet('/student/requirements');
      const reqList = r?.requirements || [];
      const latest = reqList[0] || null;
      ojtReqs = {
        has_requirement: !!latest,
        status: latest?.status || 'unassigned',
        is_verified: latest?.status === 'verified',
        title: latest?.title,
        supervisor_name: latest?.supervisor?.name,
        remarks: latest?.supervisor_remarks,
      };
    } catch (_) {}
  }
  const isReqVerified = ojtReqs?.is_verified === true;
  const reqStatus = ojtReqs?.status || 'unassigned';

  // Student skills for matching calculation
  const rawSkills = portfolioRes?.skills || portfolioRes?.data?.skills || [];
  const studentSkills = (Array.isArray(rawSkills) ? rawSkills : []).map(s => s?.name || s);

  // Active applications — show status timeline
  const myInterests = (myInterestsRes?.success && Array.isArray(myInterestsRes.data))
    ? myInterestsRes.data
    : [];

  // Build a quick lookup: ojt_posting_id → interest record id (for chat keys)
  const interestIdByPostingId = {};
  myInterests.forEach(i => {
    if (i.ojt_posting_id) interestIdByPostingId[i.ojt_posting_id] = i.id;
  });

  // Try real API first; fall back to mock data
  let allSlots = [];
  try {
    const res = await apiGet('/ojt/postings');
    const raw = res?.data ?? (Array.isArray(res) ? res : []);
    allSlots = raw.map(p => normalizePosting(p, studentSkills));
  } catch {
    const mock = await apiFetch('ojt/slots');
    allSlots = (mock.data || []).map(p => normalizePosting(p, studentSkills));
  }
  loadLocalInterests(allSlots);

  // Recommendations calculation
  const recommendedSlots = allSlots.filter(s => s.matchScore > 25);
  const highlyRecSlots = allSlots.filter(s => s.matchScore >= 71);
  const totalScore = allSlots.reduce((sum, s) => sum + (s.matchScore || 0), 0);
  const avgScore = allSlots.length ? Math.round(totalScore / allSlots.length) : 0;
  const uniqueCompanies = [...new Set(allSlots.map(s => s.company).filter(Boolean))].sort();

  container.innerHTML = `
    ${myInterests.length ? `
    <!-- Active applications shortcut banner -->
    <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 16px;background:var(--color-primary-bg);border:1px solid rgba(0,89,48,0.2);border-radius:12px;margin-bottom:16px;">
      <span style="font-size:0.82rem;color:var(--color-primary);font-weight:600;display:flex;align-items:center;gap:7px;">
        ${icon('send', 14)} You have <strong>${myInterests.length}</strong> active OJT application${myInterests.length > 1 ? 's' : ''}.
      </span>
      <a href="#/applications" style="font-size:0.8rem;font-weight:700;color:var(--color-primary);text-decoration:none;display:inline-flex;align-items:center;gap:4px;" onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'">
        View in My Applications ${icon('arrowRight', 12)}
      </a>
    </div>` : ''}
    ${isActiveOjt ? `
    <!-- Active OJT gate banner -->
    <div style="display:flex;align-items:flex-start;gap:14px;padding:16px 20px;
                background:linear-gradient(135deg,#f0fdf4,#dcfce7);
                border:1.5px solid #22c55e;border-radius:12px;margin-bottom:16px;">
      <span style="color:#15803d;flex-shrink:0;margin-top:2px;">${icon('graduationCap', 22)}</span>
      <div>
        <strong style="font-size:.95rem;color:#14532d;">You are currently on active OJT training</strong>
        ${ojtInfo ? `<p style="margin:2px 0 0;font-size:.83rem;color:#15803d;">${ojtInfo.position} at ${ojtInfo.company}</p>` : ''}
        <p style="margin:6px 0 0;font-size:.82rem;color:#166534;line-height:1.5;">You can browse slots but cannot apply while your OJT training is active. Use the <strong>OJT Tracker</strong> to manage your current training.</p>
      </div>
    </div>` : isHired ? `
    <!-- Hired gate banner -->
    <div style="display:flex;align-items:flex-start;gap:14px;padding:16px 20px;
                background:linear-gradient(135deg,#fef3c7,#fde68a);
                border:1.5px solid #f59e0b;border-radius:12px;margin-bottom:16px;">
      <span style="color:#92400e;flex-shrink:0;margin-top:2px;">${icon('briefcase', 22)}</span>
      <div>
        <strong style="font-size:.95rem;color:#92400e;">You are currently employed</strong>
        ${hiredJob ? `<p style="margin:2px 0 0;font-size:.83rem;color:#78350f;">${hiredJob.title} at ${hiredJob.company}</p>` : ''}
        <p style="margin:6px 0 0;font-size:.82rem;color:#92400e;line-height:1.5;">You cannot apply for OJT training while you have an active employment.</p>
      </div>
    </div>` : (!isReqVerified) ? `
    <!-- OJT Requirements Gate Warning Banner -->
    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;padding:16px 20px;
                background:${reqStatus === 'needs_revision' ? 'linear-gradient(135deg,#fef2f2,#fee2e2)' : reqStatus === 'submitted' ? 'linear-gradient(135deg,#eff6ff,#dbeafe)' : 'linear-gradient(135deg,#fffbeb,#fef3c7)'};
                border:1.5px solid ${reqStatus === 'needs_revision' ? '#ef4444' : reqStatus === 'submitted' ? '#3b82f6' : '#f59e0b'};border-radius:14px;margin-bottom:16px;box-shadow:0 2px 10px rgba(0,0,0,0.04);flex-wrap:wrap;">
      <div style="display:flex;align-items:flex-start;gap:14px;min-width:0;flex:1;">
        <span style="color:${reqStatus === 'needs_revision' ? '#b91c1c' : reqStatus === 'submitted' ? '#1d4ed8' : '#b45309'};flex-shrink:0;margin-top:2px;">
          ${icon(reqStatus === 'submitted' ? 'clock' : 'alertTriangle', 24)}
        </span>
        <div>
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
            <strong style="font-size:.95rem;color:${reqStatus === 'needs_revision' ? '#991b1b' : reqStatus === 'submitted' ? '#1e40af' : '#92400e'};">
              ${reqStatus === 'submitted'
                ? 'OJT Requirements Under Review &mdash; Verification Pending'
                : reqStatus === 'needs_revision'
                ? 'OJT Requirements Revision Requested'
                : reqStatus === 'pending'
                ? 'Pre-Deployment OJT Requirements Required Before Applying'
                : 'OJT Pre-Deployment Requirements Needed'}
            </strong>
            <span style="padding:2px 8px;border-radius:99px;font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;background:${reqStatus === 'needs_revision' ? '#fee2e2;color:#b91c1c;border:1px solid #fca5a5;' : reqStatus === 'submitted' ? '#dbeafe;color:#1e40af;border:1px solid #93c5fd;' : '#fef3c7;color:#92400e;border:1px solid #fcd34d;'}">
              ${reqStatus === 'submitted' ? 'Under Review' : reqStatus === 'needs_revision' ? 'Revision Needed' : 'Submission Required'}
            </span>
          </div>
          <p style="margin:4px 0 0;font-size:.84rem;color:${reqStatus === 'needs_revision' ? '#7f1d1d' : reqStatus === 'submitted' ? '#1e3a8a' : '#78350f'};line-height:1.5;">
            ${reqStatus === 'submitted'
              ? `You have submitted your requirements Google Drive folder for <strong>"${escapeHtml(ojtReqs?.title || 'Document Packet')}"</strong>. Your OJT Coordinator (${ojtReqs?.supervisor_name ? 'Prof. ' + escapeHtml(ojtReqs.supervisor_name) : 'Coordinator'}) must verify and approve your packet before you can apply to host companies.`
              : reqStatus === 'needs_revision'
              ? `Your OJT Coordinator requested changes to your requirements packet: <em>"${escapeHtml(ojtReqs?.remarks || 'Please update your uploaded documents.')}"</em> Please update your Google Drive link in your Portfolio.`
              : reqStatus === 'pending'
              ? `Your OJT Coordinator has assigned <strong>"${escapeHtml(ojtReqs?.title || 'Pre-Deployment OJT Document Packet')}"</strong>. You must upload your signed documents (Waiver, Medical, COR, etc.) to Google Drive, submit the link in your <strong>Portfolio</strong>, and receive coordinator verification before applying for OJT slots.`
              : 'Before applying for any OJT slot, you must complete your pre-deployment document packet and have it verified by your OJT Coordinator.'}
          </p>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:8px;flex-shrink:0;margin-left:auto;align-self:center;">
        <a href="#portfolio" class="btn btn--sm" style="background:${reqStatus === 'needs_revision' ? '#dc2626;color:#fff;' : reqStatus === 'submitted' ? '#2563eb;color:#fff;' : '#d97706;color:#fff;'}font-weight:700;display:inline-flex;align-items:center;gap:6px;box-shadow:0 2px 6px rgba(0,0,0,0.12);text-decoration:none;padding:0 14px;height:34px;border-radius:8px;">
          ${icon('folder', 14)} <span>${reqStatus === 'submitted' ? 'View Status in Portfolio' : 'Go to Portfolio &amp; Submit'}</span>
        </a>
      </div>
    </div>` : ''}

    <!-- ── Hero Banner ── -->
    <section class="page-section animate-fade-in-up">
      <div style="background:linear-gradient(135deg,#00381E 0%,#005930 45%,#0B7A44 100%);border-radius:16px;padding:28px 30px;position:relative;overflow:hidden;box-shadow:0 8px 30px rgba(0,89,48,0.18);">
        <div style="position:absolute;right:-40px;top:-40px;width:240px;height:240px;border-radius:50%;background:rgba(34,197,94,0.18);pointer-events:none;"></div>
        <div style="position:absolute;right:160px;bottom:-60px;width:180px;height:180px;border-radius:50%;background:rgba(52,199,89,0.12);pointer-events:none;"></div>
        <div style="position:absolute;left:38%;top:-30px;width:120px;height:120px;border-radius:50%;background:rgba(255,255,255,0.06);pointer-events:none;"></div>

        <div style="position:relative;z-index:1;">
          <!-- Title + stats -->
          <div>
            <div style="display:inline-flex;align-items:center;gap:6px;background:rgba(34,197,94,0.22);border:1px solid rgba(74,222,128,0.4);border-radius:99px;padding:4px 12px 4px 8px;margin-bottom:10px;">
              <span style="color:#4ade80;">${icon('graduationCap', 13)}</span>
              <span style="font-size:0.67rem;font-weight:700;color:#4ade80;text-transform:uppercase;letter-spacing:0.07em;">Skill-Matched OJT Opportunities</span>
            </div>
            <h1 style="font-size:1.75rem;font-weight:800;color:#fff;margin:0 0 6px;line-height:1.2;">Recommended OJT Openings</h1>
            <p style="color:rgba(255,255,255,0.78);font-size:0.86rem;margin:0;max-width:700px;line-height:1.6;">OJT positions matched to your profile based on your verified skills, program requirements, and academic background.</p>

            <!-- Stats row -->
            <div style="display:flex;gap:22px;flex-wrap:wrap;margin-top:18px;padding-top:14px;border-top:1px solid rgba(255,255,255,0.15);">
              <div>
                <p style="font-size:1.35rem;font-weight:800;color:#fff;margin:0;line-height:1;">${allSlots.length}</p>
                <p style="font-size:0.64rem;color:rgba(255,255,255,0.65);margin:2px 0 0;text-transform:uppercase;letter-spacing:0.05em;">Total Slots</p>
              </div>
              <div style="width:1px;background:rgba(255,255,255,0.15);"></div>
              <div>
                <p style="font-size:1.35rem;font-weight:800;color:#4ade80;margin:0;line-height:1;">${recommendedSlots.length}</p>
                <p style="font-size:0.64rem;color:rgba(255,255,255,0.65);margin:2px 0 0;text-transform:uppercase;letter-spacing:0.05em;">Recommended</p>
              </div>
              <div style="width:1px;background:rgba(255,255,255,0.15);"></div>
              <div>
                <p style="font-size:1.35rem;font-weight:800;color:#38bdf8;margin:0;line-height:1;">${avgScore}%</p>
                <p style="font-size:0.64rem;color:rgba(255,255,255,0.65);margin:2px 0 0;text-transform:uppercase;letter-spacing:0.05em;">Avg Match Score</p>
              </div>
              <div style="width:1px;background:rgba(255,255,255,0.15);"></div>
              <div>
                <p style="font-size:1.35rem;font-weight:800;color:#FFB547;margin:0;line-height:1;">${allSlots.filter(s => s.status === 'open').length}</p>
                <p style="font-size:0.64rem;color:rgba(255,255,255,0.65);margin:2px 0 0;text-transform:uppercase;letter-spacing:0.05em;">Open Now</p>
              </div>
              <div style="width:1px;background:rgba(255,255,255,0.15);"></div>
              <div>
                <p style="font-size:1.35rem;font-weight:800;color:rgba(255,255,255,0.9);margin:0;line-height:1;">${[...new Set(allSlots.map(s => s.company))].length}</p>
                <p style="font-size:0.64rem;color:rgba(255,255,255,0.65);margin:2px 0 0;text-transform:uppercase;letter-spacing:0.05em;">Companies</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Tabs Row ── -->
    <section class="page-section animate-fade-in-up" style="animation-delay:40ms;margin-bottom:12px;">
      <div class="jm-tabs" id="ojt-tabs">
        <button class="jm-tabs__btn jm-tabs__btn--active" data-tab="all">
          <span class="jm-tabs__icon">${icon('briefcase', 15)}</span>
          All Openings
          <span class="jm-tabs__count" id="tab-all-count">${allSlots.length}</span>
        </button>
        <button class="jm-tabs__btn" data-tab="recommended">
          <span class="jm-tabs__icon">${icon('zap', 15)}</span>
          Recommended for You
          <span class="jm-tabs__count" id="tab-rec-count">${recommendedSlots.length}</span>
        </button>
      </div>
    </section>

    <!-- ── Search & Filter bar ── -->
    <section class="page-section animate-fade-in-up" style="animation-delay:60ms;">
      <div class="jp-card" style="padding:14px 16px;">
        <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;">

          <!-- Search -->
          <div style="flex:1;min-width:200px;position:relative;">
            <span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--text-tertiary);pointer-events:none;">${icon('search', 15)}</span>
            <input type="text" id="ojt-search" class="form-input" placeholder="Search company, role or skills..." style="padding-left:36px;height:40px;font-size:0.84rem;" />
          </div>

          <!-- Industry -->
          <div class="filter-select-wrap">
            <span class="filter-select-wrap__icon">${icon('briefcase', 13)}</span>
            <select id="ojt-filter-industry" class="filter-select-wrap__select">
              <option value="">All Industries</option>
              <option value="Information Technology">IT</option>
              <option value="Marketing & Analytics">Marketing</option>
              <option value="Finance & Accounting">Finance</option>
              <option value="Healthcare Technology">Healthcare</option>
              <option value="Creative & Design">Design</option>
            </select>
            <span class="filter-select-wrap__arrow">${icon('chevronDown', 12)}</span>
          </div>

          <!-- Company Filter -->
          <div class="filter-select-wrap">
            <span class="filter-select-wrap__icon">${icon('briefcase', 13)}</span>
            <select id="ojt-filter-company" class="filter-select-wrap__select">
              <option value="">All Companies</option>
              ${uniqueCompanies.map(c => `<option value="${c.replace(/"/g, '&quot;')}">${c}</option>`).join('')}
            </select>
            <span class="filter-select-wrap__arrow">${icon('chevronDown', 12)}</span>
          </div>

          <!-- Status -->
          <div class="filter-select-wrap">
            <span class="filter-select-wrap__icon">${icon('zap', 13)}</span>
            <select id="ojt-filter-status" class="filter-select-wrap__select">
              <option value="">Any Status</option>
              <option value="open">Open</option>
              <option value="filling_up">Filling Up</option>
            </select>
            <span class="filter-select-wrap__arrow">${icon('chevronDown', 12)}</span>
          </div>

          <!-- Sort (Default: match!) -->
          <div class="filter-select-wrap">
            <span class="filter-select-wrap__icon">${icon('trendingUp', 13)}</span>
            <select id="ojt-sort" class="filter-select-wrap__select">
              <option value="match" selected>Best Match (Recommended)</option>
              <option value="newest">Newest First</option>
              <option value="slots">Most Slots</option>
            </select>
            <span class="filter-select-wrap__arrow">${icon('chevronDown', 12)}</span>
          </div>

        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;margin-top:10px;padding-top:10px;border-top:1px solid var(--border-default);flex-wrap:wrap;gap:8px;">
          <p class="text-xs text-tertiary" id="ojt-result-count"></p>
          <div style="display:flex;gap:6px;align-items:center;">
            <span style="font-size:0.7rem;color:var(--text-tertiary);">Quick:</span>
            <button class="ojt-qf btn" data-type="rec" style="height:24px;padding:0 10px;font-size:0.67rem;font-weight:700;border-radius:99px;background:var(--color-primary-bg);color:var(--color-primary);border:1px solid rgba(0,89,48,0.3);">🌟 71%+ Match</button>
            <button class="ojt-qf btn" data-status="open" style="height:24px;padding:0 10px;font-size:0.67rem;font-weight:700;border-radius:99px;background:var(--color-success-bg);color:var(--color-success);border:1px solid rgba(52,199,89,0.3);">Open</button>
            <button class="ojt-qf btn" data-status="filling_up" style="height:24px;padding:0 10px;font-size:0.67rem;font-weight:700;border-radius:99px;background:var(--color-warning-bg);color:var(--color-warning);border:1px solid rgba(255,181,71,0.3);">Filling Up</button>
          </div>
        </div>
      </div>
    </section>

    <!-- ── Slot cards grid ── -->
    <section class="page-section animate-fade-in-up" style="animation-delay:100ms;">
      <div id="ojt-slots-grid" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(330px,1fr));gap:16px;"></div>
      <div id="ojt-empty" style="display:none;text-align:center;padding:56px 0;">
        <div style="width:72px;height:72px;border-radius:50%;background:var(--bg-secondary);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">
          ${icon('search', 28)}
        </div>
        <p style="font-weight:700;font-size:1rem;margin-bottom:6px;">No matching OJT slots found</p>
        <p class="text-sm text-secondary">Try adjusting your search or clearing the recommendation filters.</p>
      </div>
    </section>

    <div id="slot-detail-backdrop" style="display:none;"></div>
  `;

  let currentTab = 'all';
  let isRecQuickActive = false;
  const grid    = container.querySelector('#ojt-slots-grid');
  const empty   = container.querySelector('#ojt-empty');
  const counter = container.querySelector('#ojt-result-count');
  const tabAllBtn = container.querySelector('[data-tab="all"]');
  const tabRecBtn = container.querySelector('[data-tab="recommended"]');

  function renderCards(slots) {
    counter.textContent = `${slots.length} slot${slots.length !== 1 ? 's' : ''} found`;
    if (!slots.length) { grid.innerHTML = ''; empty.style.display = 'block'; return; }
    empty.style.display = 'none';

    const statusCfg = {
      open:       { label: 'Open',        color: 'var(--color-success)',   bg: 'var(--color-success-bg)' },
      filling_up: { label: 'Filling Up',  color: 'var(--color-warning)',   bg: 'var(--color-warning-bg)' },
      closed:     { label: 'Closed',      color: 'var(--text-tertiary)',   bg: 'var(--bg-tertiary)' },
    };

    grid.innerHTML = slots.map(s => {
      const sc = statusCfg[s.status] || statusCfg.open;
      const pct = s.slots > 0 ? Math.round((s.slotsRemaining / s.slots) * 100) : 0;
      const barColor = pct > 50 ? 'var(--color-success)' : pct > 20 ? 'var(--color-warning)' : 'var(--color-error)';
      const isHighlyRec = s.matchScore >= 71;
      const isNotRec = s.matchScore <= 25;

      const matchedLower = (s.matchedSkills || []).map(m => String(m).toLowerCase().trim());
      const sortedSkills = [...s.requiredSkills].sort((a, b) => {
        const aM = matchedLower.includes(String(a).toLowerCase().trim()) ? 1 : 0;
        const bM = matchedLower.includes(String(b).toLowerCase().trim()) ? 1 : 0;
        return bM - aM;
      });

      const uniqueCourses = getUniqueCourseAcronyms(s.preferredCourses);

      // Clean metadata pieces
      const cleanLoc = (s.location || '').split(',')[0].trim();
      const cleanDuration = s.duration ? s.duration.replace(/\s*\(600\s*hours\)/i, ' · 600h') : '5 mos';
      const cleanSchedule = s.schedule || 'Full Day';

      return `
        <article class="ojt-card slot-card" data-id="${s.id}">

          <!-- Clean accent line -->
          <div class="ojt-card__accent" style="background:${isHighlyRec ? 'linear-gradient(90deg, #005930, #22c55e)' : (isNotRec ? '#ef4444' : 'var(--color-primary, #005930)')};"></div>

          <!-- Top Section: Avatar + Title/Company + Match Pill -->
          <div class="ojt-card__header">
            <div class="ojt-card__logo" style="background:${s.companyColor}15;color:${s.companyColor};">
              ${s.companyInitial}
            </div>

            <div class="ojt-card__header-main">
              <h3 class="ojt-card__title" title="${s.slotTitle}">${s.slotTitle}</h3>
              <p class="ojt-card__company">
                ${s.companyUserId
                  ? `<a href="#/company/${s.companyUserId}" onclick="event.stopPropagation()" class="ojt-card__company-name" style="color:inherit;text-decoration:none;" onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'">${s.company}</a>`
                  : `<span class="ojt-card__company-name">${s.company}</span>`
                }
                ${s.department ? `<span class="ojt-card__dept-dot">&middot;</span><span>${s.department}</span>` : ''}
              </p>
            </div>

            <div class="ojt-card__badges">
              ${renderMatchBadge(s.matchScore)}
              ${isNotRec ? `
                <span class="ojt-not-rec-tag" title="Not recommended: Only ${s.matchScore}% skill match">
                  ${icon('alertTriangle', 10)} Not Recommended
                </span>
              ` : (isHighlyRec ? `
                <span class="ojt-rec-tag ojt-rec-tag--high" title="Highly Recommended: ${s.matchScore}% skill match">
                  ${icon('award', 10)} Highly Recommended
                </span>
              ` : '')}
              <span class="ojt-status-pill ojt-status-pill--${s.status}">${sc.label}</span>
            </div>
          </div>

          <!-- Key Meta Bar (Location, Duration, Schedule) -->
          <div class="ojt-card__meta-bar">
            <span class="ojt-card__meta-item">${icon('mapPin', 12)} ${cleanLoc}</span>
            <span class="ojt-card__meta-item">${icon('clock', 12)} ${cleanDuration}</span>
            <span class="ojt-card__meta-item">${icon('calendar', 12)} ${cleanSchedule}</span>
          </div>

          <!-- Match Insight Callout -->
          ${s.matchScore <= 25 ? `
            <div class="ojt-card__match-callout ojt-card__match-callout--not-rec">
              ${icon('alertTriangle', 13)} <span><strong>Not Recommended:</strong> Low skill match (${s.matchScore}%). ${s.matchedSkills.length ? `You match only ${s.matchedSkills.length} of ${s.requiredSkills.length} required skills.` : 'No required skills matched yet.'}</span>
            </div>
          ` : `
            <div class="ojt-card__match-callout ${s.matchedSkills.length > 0 ? 'ojt-card__match-callout--matched' : 'ojt-card__match-callout--neutral'}">
              ${s.matchedSkills.length > 0
                ? `${icon('checkCircle', 13)} <span>You match <strong>${s.matchedSkills.length} of ${s.requiredSkills.length}</strong> required skills</span>`
                : (s.requiredSkills.length > 0
                  ? `${icon('zap', 13)} <span>Add skills to your profile to improve match</span>`
                  : `${icon('star', 13)} <span>Open to all academic backgrounds</span>`
                )
              }
            </div>
          `}

          <!-- Body: Excerpt & Tags -->
          <div class="ojt-card__body">
            <p class="ojt-card__desc">${s.description}</p>

            <div class="ojt-card__tags">
              ${uniqueCourses.slice(0, 3).map(c => `<span class="ojt-tag ojt-tag--course">${c}</span>`).join('')}
              ${uniqueCourses.length > 3 ? `<span class="ojt-tag ojt-tag--more">+${uniqueCourses.length - 3}</span>` : ''}

              ${sortedSkills.slice(0, 4).map(sk => {
                const isM = matchedLower.includes(sk.toLowerCase().trim());
                return `<span class="ojt-tag ${isM ? 'ojt-tag--skill-matched' : 'ojt-tag--skill'}">
                  ${isM ? icon('checkCircle', 10) + ' ' : ''}${sk}
                </span>`;
              }).join('')}
              ${sortedSkills.length > 4 ? `<span class="ojt-tag ojt-tag--more">+${sortedSkills.length - 4}</span>` : ''}
            </div>
          </div>

          <!-- Slot Availability Progress -->
          <div class="ojt-card__slots">
            <div class="ojt-card__slots-info">
              <span class="ojt-card__slots-label">${icon('users', 11)} Availability</span>
              <span class="ojt-card__slots-count" style="color:${barColor};">${s.slotsRemaining} of ${s.slots} slots left</span>
            </div>
            <div class="ojt-card__slots-track">
              <div class="ojt-card__slots-fill" style="width:${pct}%;background:${barColor};"></div>
            </div>
          </div>

          <!-- Card Footer -->
          <div class="ojt-card__footer">
            <span class="ojt-card__posted">${icon('clock', 11)} ${s.postedDate || 'Recently posted'}</span>

            <div class="ojt-card__actions">
              ${s.is_interested
                ? `<span class="applied-badge" data-id="${s.id}" style="display:inline-flex;align-items:center;gap:5px;background:var(--color-success-bg);color:var(--color-success);font-size:0.72rem;font-weight:700;padding:5px 12px;border-radius:99px;cursor:pointer;" title="Click to withdraw application">${icon('checkCircle', 12)} Applied</span>`
                : (isActiveOjt || isHired)
                  ? `<button class="btn btn--sm" disabled style="background:var(--bg-tertiary);color:var(--text-tertiary);border:1px solid var(--border-default);font-size:0.73rem;border-radius:6px;cursor:not-allowed;" title="${isActiveOjt ? 'You are currently on active OJT' : 'You are currently employed'}">${icon('alertTriangle', 12)} Blocked</button>`
                  : !isReqVerified
                    ? `
                      <button class="btn btn--outline btn--sm" data-view="${s.id}" style="font-size:0.73rem;padding:0 10px;height:28px;border-radius:6px;">Details</button>
                      <button class="btn btn--sm btn--apply-direct" data-id="${s.id}" style="font-size:0.73rem;padding:0 10px;height:28px;border-radius:6px;background:#fef3c7;color:#92400e;border:1px solid #f59e0b;font-weight:700;" title="OJT requirements must be verified first">${icon('lock', 11)} Apply</button>
                    `
                    : `
                      <button class="btn btn--outline btn--sm" data-view="${s.id}" style="font-size:0.73rem;padding:0 10px;height:28px;border-radius:6px;">Details</button>
                      <button class="btn btn--primary btn--sm btn--apply-direct" data-id="${s.id}" style="font-size:0.73rem;padding:0 12px;height:28px;border-radius:6px;" ${s.status === 'closed' ? 'disabled' : ''}>${icon('send', 12)} Apply</button>
                    `
              }
              ${s.is_interested && interestIdByPostingId[s.id]
                ? `<button
                     class="btn-chat-ojt btn btn--sm btn--ghost"
                     data-interest-id="${interestIdByPostingId[s.id]}"
                     onclick="event.stopPropagation(); window.openChat && window.openChat('ojt_interest_${interestIdByPostingId[s.id]}')"
                     style="height:28px;padding:0 9px;font-size:0.72rem;border-radius:6px;"
                     title="Message company"
                   ><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg> Chat</button>`
                : ''
              }
            </div>
          </div>

        </article>
      `;
    }).join('');

    // Card click
    grid.querySelectorAll('.slot-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = parseInt(card.dataset.id);
        showSlotDetail(allSlots.find(s => s.id === id), elig.status === 'eligible');
      });
    });
    grid.querySelectorAll('[data-view]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const id = parseInt(btn.dataset.view);
        showSlotDetail(allSlots.find(s => s.id === id), elig.status === 'eligible');
      });
    });

    // ── Direct Apply button ────────────────────────────────────────────────
    grid.querySelectorAll('.btn--apply-direct').forEach(btn => {
      btn.addEventListener('click', async e => {
        e.stopPropagation();
        if (isActiveOjt) {
          showToast('You already have an active OJT training. You cannot apply for another slot.', 'error');
          return;
        }
        if (isHired) {
          showToast(`You are currently employed${hiredJob ? ` (${hiredJob.title} at ${hiredJob.company})` : ''}. You cannot apply for OJT while employed.`, 'error');
          return;
        }
        if (!isReqVerified) {
          showRequirementsRequiredModal(ojtReqs);
          return;
        }
        const id   = parseInt(btn.dataset.id);
        const slot = allSlots.find(s => s.id === id);
        showApplyConfirm(slot);
      });
    });
    grid.querySelectorAll('.applied-badge').forEach(badge => {
      badge.addEventListener('click', async e => {
        e.stopPropagation();
        const id = parseInt(badge.dataset.id);
        if (!confirm('Withdraw your application from this OJT slot?')) return;
        try {
          const res = await apiDelete(`/ojt/interest/${id}`);
          if (res && !res.success && res.message) {
            showToast(res.message, 'error'); return;
          }
        } catch { /* fallback to local removal */ }
        removeInterestLocally(id);
        const slot = allSlots.find(s => s.id === id);
        if (slot) { slot.is_interested = false; slot.interest_status = null; }
        applyFilters();
        showToast('Application withdrawn.', 'info');
      });
    });
  }

  function applyFilters() {
    const q        = container.querySelector('#ojt-search').value.toLowerCase().trim();
    const industry = container.querySelector('#ojt-filter-industry').value;
    const company  = container.querySelector('#ojt-filter-company')?.value || '';
    const status   = container.querySelector('#ojt-filter-status').value;
    const sort     = container.querySelector('#ojt-sort').value;

    let list = allSlots.filter(s => {
      if (currentTab === 'recommended' && s.matchScore <= 25) return false;
      if (isRecQuickActive && s.matchScore < 71) return false;
      if (q) {
        const matchesQuery = (s.company || '').toLowerCase().includes(q) ||
                             (s.industry || '').toLowerCase().includes(q) ||
                             (s.slotTitle || '').toLowerCase().includes(q) ||
                             (s.department || '').toLowerCase().includes(q) ||
                             (s.requiredSkills || []).some(sk => sk.toLowerCase().includes(q));
        if (!matchesQuery) return false;
      }
      if (industry && s.industry !== industry) return false;
      if (company && s.company !== company) return false;
      if (status && s.status !== status) return false;
      return true;
    });

    if (sort === 'match') {
      list = list.slice().sort((a, b) => b.matchScore - a.matchScore);
    } else if (sort === 'slots') {
      list = list.slice().sort((a, b) => b.slotsRemaining - a.slotsRemaining);
    } else if (sort === 'newest') {
      list = list.slice().sort((a, b) => new Date(b.rawDate || 0) - new Date(a.rawDate || 0));
    }

    renderCards(list);
  }

  // Tabs event listeners
  container.querySelector('#ojt-tabs')?.addEventListener('click', (e) => {
    const btn = e.target.closest('.jm-tabs__btn');
    if (!btn) return;
    currentTab = btn.dataset.tab;
    container.querySelectorAll('#ojt-tabs .jm-tabs__btn').forEach(b => b.classList.remove('jm-tabs__btn--active'));
    btn.classList.add('jm-tabs__btn--active');
    applyFilters();
  });

  ['#ojt-search', '#ojt-filter-industry', '#ojt-filter-company', '#ojt-filter-status', '#ojt-sort'].forEach(sel => {
    container.querySelector(sel)?.addEventListener('input', applyFilters);
    container.querySelector(sel)?.addEventListener('change', applyFilters);
  });

  // Quick filter pill buttons
  container.querySelectorAll('.ojt-qf').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.type === 'rec') {
        isRecQuickActive = !isRecQuickActive;
        btn.style.boxShadow = isRecQuickActive ? '0 0 0 2px var(--color-primary)' : 'none';
      } else {
        const sel = container.querySelector('#ojt-filter-status');
        sel.value = sel.value === btn.dataset.status ? '' : btn.dataset.status;
      }
      applyFilters();
    });
  });

  // Initial filter & sort (defaults to 'match'!)
  applyFilters();

  function showSlotDetail(slot, canApply) {
    const pct = slot.slots > 0 ? Math.round((slot.slotsRemaining / slot.slots) * 100) : 0;
    const barColor = pct > 50 ? 'var(--color-success)' : pct > 20 ? 'var(--color-warning)' : 'var(--color-error)';
    const isClosed = slot.status === 'closed';
    const uniqueCourses = getUniqueCourseAcronyms(slot.preferredCourses);

    const matchedLower = (slot.matchedSkills || []).map(m => String(m).toLowerCase().trim());
    const matchedSkillsList = (slot.requiredSkills || []).filter(s => matchedLower.includes(s.toLowerCase().trim()));
    const missingSkillsList = (slot.requiredSkills || []).filter(s => !matchedLower.includes(s.toLowerCase().trim()));

    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop modal-backdrop--visible';
    backdrop.innerHTML = `
      <div class="modal modal--visible" style="max-width:680px;border-radius:16px;overflow:hidden;">

        <!-- Header -->
        <div class="ojt-modal__header">
          <div class="ojt-modal__title-row">
            <div class="ojt-modal__logo" style="background:${slot.companyColor}18;color:${slot.companyColor};">
              ${slot.companyInitial}
            </div>
            <div style="min-width:0;flex:1;">
              <h2 class="ojt-modal__title">${slot.slotTitle}</h2>
              <p class="ojt-modal__company-info">
                ${slot.companyUserId
                  ? `<a href="#/company/${slot.companyUserId}" onclick="event.stopPropagation()" style="color:inherit;font-weight:600;text-decoration:none;" onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'">${slot.company}</a>`
                  : `<span style="font-weight:600;color:var(--text-primary);">${slot.company}</span>`
                }
                ${slot.department ? `<span>&middot;</span><span>${slot.department}</span>` : ''}
                ${slot.location ? `<span>&middot;</span><span style="color:var(--text-tertiary);">${slot.location.split(',')[0]}</span>` : ''}
              </p>
            </div>
          </div>

          <div style="display:flex;align-items:center;gap:8px;flex-shrink:0;">
            ${renderMatchBadge(slot.matchScore)}
            ${slot.matchScore <= 25 ? `
              <span class="ojt-not-rec-tag" title="Only ${slot.matchScore}% skill match">
                ${icon('alertTriangle', 10)} Not Recommended
              </span>
            ` : (slot.matchScore >= 71 ? `
              <span class="ojt-rec-tag ojt-rec-tag--high" title="Highly Recommended: ${slot.matchScore}% skill match">
                ${icon('award', 10)} Highly Recommended
              </span>
            ` : '')}
            <button class="modal__close" id="slot-detail-close" aria-label="Close" style="background:var(--bg-secondary);border:1px solid var(--border-subtle);border-radius:8px;padding:5px;cursor:pointer;display:flex;align-items:center;justify-content:center;">
              ${icon('x', 18)}
            </button>
          </div>
        </div>

        <!-- Body -->
        <div class="ojt-modal__body">

          <!-- 4-Stat Highlights Grid -->
          <div class="ojt-modal__stats">
            <div class="ojt-modal__stat-box">
              <div class="ojt-modal__stat-val" style="color:${slot.matchScore >= 71 ? 'var(--color-success, #15803d)' : (slot.matchScore <= 25 ? 'var(--color-error, #dc2626)' : 'var(--color-primary, #005930)')};">
                ${slot.matchScore}%
              </div>
              <div class="ojt-modal__stat-lbl">${slot.matchScore >= 71 ? 'Highly Recommended' : (slot.matchScore <= 25 ? 'Not Recommended' : 'Recommended')}</div>
            </div>

            <div class="ojt-modal__stat-box">
              <div class="ojt-modal__stat-val">
                ${slot.duration.replace(/\s*\(.*?\)/g, '') || '5 Months'}
              </div>
              <div class="ojt-modal__stat-lbl">Duration</div>
            </div>

            <div class="ojt-modal__stat-box">
              <div class="ojt-modal__stat-val">
                ${slot.schedule || 'Full Day'}
              </div>
              <div class="ojt-modal__stat-lbl">Schedule</div>
            </div>

            <div class="ojt-modal__stat-box">
              <div class="ojt-modal__stat-val" style="color:${barColor};">
                ${slot.slotsRemaining}/${slot.slots}
              </div>
              <div class="ojt-modal__stat-lbl">Slots Left</div>
            </div>
          </div>

          <!-- Description / About Role -->
          <div class="ojt-modal__section">
            <h4 class="ojt-modal__section-title">${icon('briefcase', 13)} About This Opportunity</h4>
            <p class="text-sm text-secondary" style="line-height:1.65;margin:0;">${slot.companyDesc || slot.description}</p>
          </div>

          <!-- Skills Compatibility Breakdown -->
          ${slot.requiredSkills?.length ? `
          <div class="ojt-modal__section">
            <h4 class="ojt-modal__section-title">
              ${icon('zap', 13)} Skills Compatibility
              <span style="font-size:0.7rem;font-weight:600;color:var(--color-primary);margin-left:auto;text-transform:none;letter-spacing:normal;">
                ${matchedSkillsList.length} of ${slot.requiredSkills.length} skills matched
              </span>
            </h4>

            ${matchedSkillsList.length ? `
              <p style="font-size:0.75rem;font-weight:600;color:var(--color-success);margin:0 0 6px;">Matching Skills You Have:</p>
              <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px;">
                ${matchedSkillsList.map(s => `
                  <span class="ojt-tag ojt-tag--skill-matched" style="font-size:0.74rem;padding:3px 10px;">
                    ${icon('checkCircle', 12)} ${s}
                  </span>
                `).join('')}
              </div>
            ` : ''}

            ${missingSkillsList.length ? `
              <p style="font-size:0.75rem;font-weight:600;color:var(--text-tertiary);margin:0 0 6px;">Other Required Skills:</p>
              <div style="display:flex;gap:6px;flex-wrap:wrap;">
                ${missingSkillsList.map(s => `
                  <span class="ojt-tag ojt-tag--skill" style="font-size:0.74rem;padding:3px 10px;">
                    ${s}
                  </span>
                `).join('')}
              </div>
            ` : ''}
          </div>` : ''}

          <!-- Preferred Degree Programs -->
          <div class="ojt-modal__section">
            <h4 class="ojt-modal__section-title">${icon('graduationCap', 13)} Eligible Degree Programs</h4>
            <div style="display:flex;gap:6px;flex-wrap:wrap;">
              ${uniqueCourses.length
                ? uniqueCourses.map(c => `<span class="ojt-tag ojt-tag--course" style="font-size:0.74rem;padding:3px 10px;">${c}</span>`).join('')
                : '<span class="text-xs text-secondary">Open to all degree programs</span>'
              }
            </div>
          </div>

          <!-- Required Documents & Checklist -->
          ${(slot.requiredDocuments || slot.requirements)?.length ? `
          <div class="ojt-modal__section">
            <h4 class="ojt-modal__section-title">${icon('fileText', 13)} Required Documents</h4>
            <ul class="ojt-modal__checklist">
              ${(slot.requiredDocuments || slot.requirements).map(r => `
                <li class="ojt-modal__checklist-item">
                  ${icon('check', 14)}
                  <span>${r}</span>
                </li>
              `).join('')}
            </ul>
          </div>` : ''}

          <!-- Qualifications (if any) -->
          ${slot.qualifications?.length ? `
          <div class="ojt-modal__section">
            <h4 class="ojt-modal__section-title">${icon('award', 13)} Candidate Qualifications</h4>
            <ul class="ojt-modal__checklist">
              ${slot.qualifications.map(q => `
                <li class="ojt-modal__checklist-item">
                  ${icon('check', 14)}
                  <span>${q}</span>
                </li>
              `).join('')}
            </ul>
          </div>` : ''}

          <!-- Location & Map -->
          <div class="ojt-modal__section" style="margin-bottom:0;">
            <h4 class="ojt-modal__section-title">${icon('mapPin', 13)} Location &amp; Deployment Address</h4>
            <p class="text-sm text-secondary" style="margin:0 0 10px;">${slot.location}</p>
            <div style="border-radius:10px;overflow:hidden;border:1px solid var(--border-default);height:170px;background:var(--bg-secondary);">
              <iframe
                src="https://www.openstreetmap.org/export/embed.html?bbox=${slot.mapLon - 0.03}%2C${slot.mapLat - 0.02}%2C${slot.mapLon + 0.03}%2C${slot.mapLat + 0.02}&layer=mapnik&marker=${slot.mapLat}%2C${slot.mapLon}"
                style="width:100%; height:100%; border:none;"
                loading="lazy"
                referrerpolicy="no-referrer"
                title="OJT Location"
              ></iframe>
            </div>
            <p class="text-xs text-tertiary" style="margin-top:6px;display:flex;align-items:center;gap:4px;">
              ${icon('alertCircle', 11)} Official deployment address is confirmed upon supervisor endorsement.
            </p>
          </div>

        </div>

        <!-- Footer -->
        <div class="modal__footer" style="padding:14px 24px;display:flex;justify-content:space-between;align-items:center;background:var(--bg-secondary);">
          <button class="btn btn--outline btn--sm" id="slot-detail-cancel" style="padding:0 16px;height:34px;">Close</button>

          <div style="display:flex;gap:8px;align-items:center;">
            ${isClosed
              ? `<button class="btn btn--sm" style="background:var(--bg-tertiary);color:var(--text-tertiary);cursor:not-allowed;height:34px;" disabled>${icon('x', 14)} Slot Closed</button>`
              : (isActiveOjt || isHired)
                ? `<button class="btn btn--sm" style="background:var(--bg-tertiary);color:var(--text-tertiary);cursor:not-allowed;height:34px;" disabled title="${isActiveOjt ? 'You are currently on active OJT training' : 'You are currently employed'}">${icon('alertTriangle', 14)} ${isActiveOjt ? 'Active OJT — Blocked' : 'Employed — Blocked'}</button>`
                : slot.is_interested
                  ? `<button class="btn btn--sm" style="background:var(--color-success-bg);color:var(--color-success);border:1px solid var(--color-success);cursor:default;height:34px;">${icon('checkCircle', 14)} Application Submitted</button>`
                  : !isReqVerified
                    ? `<button class="btn btn--sm" id="slot-apply-req-blocked" style="background:#fef3c7;color:#92400e;border:1.5px solid #f59e0b;font-weight:700;height:34px;padding:0 16px;display:inline-flex;align-items:center;gap:6px;cursor:pointer;" title="Requirements must be verified before applying">${icon('lock', 14)} Requirements Required</button>`
                    : `<button class="btn btn--primary btn--sm" id="slot-apply-btn" style="padding:0 20px;height:34px;">${icon('send', 14)} Apply for this Slot</button>`
            }
          </div>
        </div>

      </div>
    `;

    document.body.appendChild(backdrop);

    const close = () => backdrop.remove();
    backdrop.querySelector('#slot-detail-close').addEventListener('click', close);
    backdrop.querySelector('#slot-detail-cancel').addEventListener('click', close);
    backdrop.addEventListener('click', e => { if (e.target === backdrop) close(); });

    const applyBtn = backdrop.querySelector('#slot-apply-btn');
    if (applyBtn) {
      applyBtn.addEventListener('click', () => {
        if (isActiveOjt) {
          close();
          showToast('You already have an active OJT training. You cannot apply for another slot.', 'error');
          return;
        }
        if (isHired) {
          close();
          showToast(`You are currently employed${hiredJob ? ` (${hiredJob.title} at ${hiredJob.company})` : ''}. You cannot apply for OJT while employed.`, 'error');
          return;
        }
        if (!isReqVerified) {
          close();
          showRequirementsRequiredModal(ojtReqs);
          return;
        }
        close();
        showApplyConfirm(slot);
      });
    }

    const reqBlockedBtn = backdrop.querySelector('#slot-apply-req-blocked');
    if (reqBlockedBtn) {
      reqBlockedBtn.addEventListener('click', () => {
        close();
        showRequirementsRequiredModal(ojtReqs);
      });
    }
  }

  function showRequirementsRequiredModal(reqs) {
    const bd = document.createElement('div');
    bd.className = 'modal-backdrop modal-backdrop--visible';

    const st = reqs?.status || 'unassigned';
    const title = reqs?.title || 'Pre-Deployment OJT Document Packet';
    const isSubmitted = st === 'submitted';
    const isRevision = st === 'needs_revision';

    bd.innerHTML = `
      <div class="modal modal--visible" style="max-width:480px; text-align:center; border-radius:18px; overflow:hidden; box-shadow:0 24px 60px rgba(0,0,0,0.25);">
        <div style="height:5px; background:linear-gradient(90deg, #f59e0b, #d97706); width:100%;"></div>
        <div class="modal__body" style="padding:30px 24px 22px;">
          <div style="width:60px; height:60px; border-radius:50%; background:#fef3c7; color:#d97706; display:flex; align-items:center; justify-content:center; margin:0 auto 14px; border:1px solid rgba(217,119,6,0.25);">
            ${icon('lock', 28)}
          </div>
          <div style="display:inline-flex; align-items:center; gap:6px; background:#fef3c7; color:#92400e; border:1px solid #fcd34d; border-radius:99px; padding:3px 12px; font-size:0.75rem; font-weight:700; margin-bottom:8px;">
            ${icon('alertTriangle', 12)} OJT Requirements Verification Required
          </div>
          <h3 style="font-size:1.22rem; font-weight:800; margin-bottom:8px; color:var(--text-primary);">
            ${isSubmitted ? 'Requirements Awaiting Approval' : isRevision ? 'Requirements Need Revision' : 'Submit Requirements First'}
          </h3>
          <p class="text-sm text-secondary" style="line-height:1.6; margin-bottom:18px;">
            ${isSubmitted
              ? `Your submission for <strong>"${escapeHtml(title)}"</strong> has been received and is currently under review by your OJT Coordinator. Once verified, you will be able to apply for this slot.`
              : isRevision
              ? `Your coordinator requested changes to your documents: <em>"${escapeHtml(reqs?.remarks || 'See feedback in your portfolio')}"</em>. Please update your Drive link in your Portfolio.`
              : `Before applying for any OJT position, your OJT Coordinator requires you to submit your <strong>"${escapeHtml(title)}"</strong> (Waiver, Medical Cert, COR, etc.) and receive coordinator verification.`}
          </p>
          <div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap;">
            <button class="btn btn--outline" id="req-modal-cancel" style="padding:0 18px; height:38px; border-radius:8px;">Dismiss</button>
            <a href="#portfolio" class="btn btn--primary" id="req-modal-portfolio" style="padding:0 18px; height:38px; display:inline-flex; align-items:center; gap:6px; border-radius:8px; text-decoration:none;">
              ${icon('folder', 14)} Go to Portfolio
            </a>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(bd);
    bd.addEventListener('click', e => { if (e.target === bd) bd.remove(); });
    bd.querySelector('#req-modal-cancel').addEventListener('click', () => bd.remove());
    bd.querySelector('#req-modal-portfolio').addEventListener('click', () => bd.remove());
  }

  function showApplyConfirm(slot) {
    if (!isReqVerified) {
      showRequirementsRequiredModal(ojtReqs);
      return;
    }
    const isNotRec = (slot.matchScore <= 25) || (slot.match_tier === 'not_recommended');
    const bd = document.createElement('div');
    bd.className = 'modal-backdrop modal-backdrop--visible';

    const safeTitle = escapeHtml(slot.slotTitle);
    const safeCompany = escapeHtml(slot.company);
    const score = typeof slot.matchScore === 'number' ? Math.round(slot.matchScore) : Math.round(Number(slot.matchScore) || 0);

    let modalHtml = '';

    if (isNotRec) {
      modalHtml = `
        <div class="modal modal--visible" style="max-width:520px; border-radius:18px; overflow:hidden; box-shadow:0 24px 60px rgba(0,0,0,0.3); text-align:center;">
          <!-- Top Accent Warning Stripe -->
          <div style="height:5px; background:linear-gradient(90deg, #ef4444, #dc2626); width:100%;"></div>

          <div class="modal__body" style="padding:28px 24px 22px;">
            <!-- Warning Icon Badge -->
            <div class="ojt-apply-warn-icon">
              ${icon('alertTriangle', 34)}
            </div>

            <!-- Warning Tag -->
            <div style="display:inline-flex; align-items:center; gap:6px; background:rgba(239,68,68,0.12); color:#dc2626; border:1px solid rgba(239,68,68,0.25); border-radius:99px; padding:4px 12px; font-size:0.75rem; font-weight:700; margin-bottom:8px;">
              ${icon('alertTriangle', 12)} Not Recommended OJT Listing (${score}% Match)
            </div>

            <h3 style="font-size:1.28rem; font-weight:800; color:#dc2626; margin:4px 0 10px; line-height:1.3;">
              You are not likely to get accepted!
            </h3>

            <!-- Notice Box -->
            <div class="ojt-apply-warn-box">
              <p class="ojt-apply-warn-title">
                ${icon('alertCircle', 15)} It is not a recommended OJT listing
              </p>
              <p class="ojt-apply-warn-text">
                Your profile has only a <strong>${score}% skill match</strong> with <strong>${safeTitle}</strong> at <strong>${safeCompany}</strong>. Host companies prioritize student applicants whose skills match their requirements, making acceptance unlikely.
              </p>
              ${(slot.requiredSkills && slot.requiredSkills.length > 0) ? `
                <div class="ojt-apply-warn-skills">
                  <span><strong>Matched Skills:</strong> ${slot.matchedSkills ? slot.matchedSkills.length : 0} of ${slot.requiredSkills.length} required</span>
                  <span style="font-weight:700; color:#dc2626;">${score}% Match</span>
                </div>
              ` : ''}
            </div>

            <p style="font-size:0.8rem; color:var(--text-secondary); line-height:1.5; margin:0 0 20px;">
              This notification acts as an advisory warning. You can still apply, or cancel to explore recommended openings tailored to your skills.
            </p>

            <!-- Action buttons -->
            <div style="display:flex; gap:10px; justify-content:center; flex-wrap:wrap;">
              <button class="btn btn--outline" id="apply-cancel" style="padding:0 18px; height:40px; font-weight:600; border-radius:10px;">
                Cancel &amp; Review Others
              </button>
              <button class="btn" id="apply-confirm" style="background:#dc2626; color:#ffffff; border:1px solid #b91c1c; padding:0 20px; height:40px; font-weight:700; border-radius:10px; display:inline-flex; align-items:center; gap:7px; box-shadow:0 4px 12px rgba(220,38,38,0.25); cursor:pointer;">
                ${icon('send', 14)} Proceed &amp; Apply Anyway
              </button>
            </div>
          </div>
        </div>
      `;
    } else {
      modalHtml = `
        <div class="modal modal--visible" style="max-width:480px; text-align:center; border-radius:18px; overflow:hidden; box-shadow:0 24px 60px rgba(0,0,0,0.22);">
          <div style="height:5px; background:linear-gradient(90deg, #005930, #22c55e); width:100%;"></div>
          <div class="modal__body" style="padding:32px 28px 24px;">
            <div style="width:64px; height:64px; border-radius:50%; background:var(--color-primary-bg); color:var(--color-primary); display:flex; align-items:center; justify-content:center; margin:0 auto 16px; border:1px solid rgba(0,89,48,0.2);">
              ${icon('send', 28)}
            </div>
            <div style="margin-bottom:8px;">
              ${renderMatchBadge(slot.matchScore)}
            </div>
            <h3 style="font-size:1.2rem; font-weight:800; margin-bottom:8px; color:var(--text-primary);">Apply for this OJT Slot?</h3>
            <p class="text-sm text-secondary" style="line-height:1.6; margin-bottom:20px;">
              You are applying for <strong>${safeTitle}</strong> at <strong>${safeCompany}</strong>. Your student profile and academic credentials will be submitted directly to the host company.
            </p>
            <div style="display:flex; gap:10px; justify-content:center;">
              <button class="btn btn--outline" id="apply-cancel" style="padding:0 18px; height:38px;">Cancel</button>
              <button class="btn btn--primary" id="apply-confirm" style="padding:0 20px; height:38px; display:inline-flex; align-items:center; gap:6px;">
                ${icon('checkCircle', 15)} Confirm Application
              </button>
            </div>
          </div>
        </div>
      `;
    }

    bd.innerHTML = modalHtml;
    document.body.appendChild(bd);

    bd.addEventListener('click', e => { if (e.target === bd) bd.remove(); });
    bd.querySelector('#apply-cancel').addEventListener('click', () => bd.remove());
    bd.querySelector('#apply-confirm').addEventListener('click', async () => {
      const confirmBtn = bd.querySelector('#apply-confirm');
      confirmBtn.disabled = true;
      confirmBtn.innerHTML = `${icon('clock', 15)} Submitting...`;
      try {
        const res = await apiPost(`/ojt/interest/${slot.id}`, {});
        if (res && !res.success) {
          if (res.code === 'REQUIREMENTS_UNVERIFIED') {
            bd.remove();
            showRequirementsRequiredModal(ojtReqs);
            return;
          }
          showToast(res.message || 'Could not submit application.', 'error');
          confirmBtn.disabled = false;
          confirmBtn.innerHTML = isNotRec ? `${icon('send', 14)} Proceed &amp; Apply Anyway` : `${icon('checkCircle', 15)} Confirm Application`;
          return;
        }
        showToast(isNotRec ? `Application submitted to ${slot.company} (Not Recommended).` : 'Application submitted! CIER and company notified.', 'success');
      } catch {
        // Fallback: save locally
        saveInterestLocally(slot.id, slot);
        showToast('Application submitted (local record saved).', 'success');
      }
      slot.is_interested = true;
      slot.interest_status = 'interested';
      bd.remove();
      applyFilters();
    });
  }

}

// ── Toast notification helper ────────────────────────────────────────────────
function showToast(msg, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast--${type} toast--visible`;
  toast.innerHTML = `
    <span class="toast__icon">${icon(type === 'success' ? 'checkCircle' : type === 'error' ? 'alertTriangle' : 'info', 16)}</span>
    <span class="toast__message">${msg}</span>
  `;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.classList.remove('toast--visible');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
