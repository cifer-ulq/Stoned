/**
 * CHMSU HireMe — Job Matching Page
 */
import { icon } from '../components/icons.js';
import { apiGet, apiPost } from '../api/client.js';
import { getState } from '../store.js';
import { navigate } from '../router.js';
import { showToast } from '../utils.js';

/* ── Filter presets ── */
const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Remote'];
const PH_CITIES = [
  'Bacolod City','Cebu City','Davao City','Manila','Quezon City',
  'Makati City','Taguig City','Pasig City','Iloilo City','Cagayan de Oro',
  'Zamboanga City','General Santos City','Remote / Work from Home',
];
const DEPARTMENTS = [
  'Engineering','Software Development','DevOps','QA / Testing','Data Science',
  'AI / Machine Learning','Cybersecurity','IT Support','Cloud Infrastructure',
  'UI / UX Design','Graphic Design','Product Management','Brand Design','Motion Design',
  'Sales','Business Development','Account Management','Partnerships','Customer Success',
  'Digital Marketing','Content Marketing','SEO / SEM','Social Media','Email Marketing',
  'Operations','Supply Chain','Logistics','Project Management','Process Improvement',
  'Finance','Accounting','Audit','Legal / Compliance','Risk Management',
  'Human Resources','Talent Acquisition','Learning & Development','Payroll',
  'Customer Support','Technical Support','Community Management','Client Relations',
];

/* ── Relative date helper ── */
function relativeDate(dateStr) {
  if (!dateStr) return '';
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return `${diff}d ago`;
  if (diff < 30) return `${Math.floor(diff / 7)}w ago`;
  return new Date(dateStr).toLocaleDateString();
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* ── Normalize raw API job to display format ── */
function normalizeJob(raw) {
  const matched = raw.matched_skills || [];
  const total   = (raw.skills || []).length;
  return {
    id:               raw.id,
    title:            raw.title,
    company:          raw.company || 'Company',
    companyUserId:    raw.company_user_id || null,
    companyInitial:   raw.company_initial || (raw.company || 'C').charAt(0).toUpperCase(),
    companyLogo:      raw.company_logo || null,
    department:       raw.department || '',
    location:         raw.location || 'Philippines',
    type:             raw.type || raw.employment_type || '',
    experienceLevel:  raw.experience_level || '',
    salary:           raw.salary || raw.salary_range || 'Competitive',
    description:      raw.description || '',
    skills:           raw.skills || [],
    matchedSkills:    matched,
    matchScore:       raw.match_score ?? 50,
    matchExplanation: matched.length > 0
      ? `You match ${matched.length} of ${total} required skill${total !== 1 ? 's' : ''}`
      : total > 0
        ? 'Add skills to your profile to improve your match score'
        : 'Open to all backgrounds',
    postedDate: relativeDate(raw.created_at),
    rawDate: raw.created_at,
  };
}

/* ── Match-score color helper ── */
function scoreColor(score) {
  const num = typeof score === 'number' ? Math.round(score) : Math.round(Number(score) || 0);
  if (num >= 71) {
    return {
      tier: 'highly_recommended',
      label: 'Highly Recommended',
      bg: 'rgba(16,185,129,0.12)',
      color: '#15803d',
      barColor: '#10b981',
      border: 'rgba(16,185,129,0.3)',
    };
  }
  if (num > 25) {
    return {
      tier: 'recommended',
      label: 'Recommended',
      bg: 'rgba(0,89,48,0.10)',
      color: '#005930',
      barColor: '#005930',
      border: 'rgba(0,89,48,0.25)',
    };
  }
  return {
    tier: 'not_recommended',
    label: 'Not Recommended',
    bg: 'rgba(239,68,68,0.10)',
    color: '#dc2626',
    barColor: '#ef4444',
    border: 'rgba(239,68,68,0.25)',
  };
}

/* ── Modern match badge ── */
function renderMatchBadge(score) {
  const num = typeof score === 'number' ? Math.round(score) : Math.round(Number(score) || 0);
  if (num >= 71) {
    return `<span class="jm-match-pill jm-match-pill--high" title="${num}% Match — Highly Recommended">${icon('award', 12)} <span>${num}% Match</span></span>`;
  }
  if (num > 25) {
    return `<span class="jm-match-pill jm-match-pill--mid" title="${num}% Match — Recommended">${icon('checkCircle', 12)} <span>${num}% Match</span></span>`;
  }
  return `<span class="jm-match-pill jm-match-pill--not-rec" title="${num}% Match — Not Recommended">${icon('alertTriangle', 11)} <span>${num}% Match</span></span>`;
}

/* ── Render Skills Capped ── */
function renderSkillsCapped(skills, matchedSkills, maxVisible = 4) {
  if (!skills || !skills.length) return '';
  const matchedLower = (matchedSkills || []).map(m => String(m).toLowerCase().trim());
  const sorted = [...skills].sort((a, b) => {
    const aMatch = matchedLower.includes(String(a).toLowerCase().trim());
    const bMatch = matchedLower.includes(String(b).toLowerCase().trim());
    return (bMatch ? 1 : 0) - (aMatch ? 1 : 0);
  });

  const visible = sorted.slice(0, maxVisible);
  const remaining = sorted.length - maxVisible;

  return `
    <div class="jm-card__skills">
      ${visible.map(s => {
        const isMatched = matchedLower.includes(String(s).toLowerCase().trim());
        return `<span class="jm-card__chip ${isMatched ? 'jm-card__chip--matched' : ''}">
          ${isMatched ? icon('check', 11) + ' ' : ''}${escapeHtml(s)}
        </span>`;
      }).join('')}
      ${remaining > 0 ? `<span class="jm-card__chip jm-card__chip--more">+${remaining} more</span>` : ''}
    </div>
  `;
}

/* ── Internal job card ── */
function internalCard(job, idx, appliedIds = new Set()) {
  const sc          = scoreColor(job.matchScore);
  const isHighlyRec = job.matchScore >= 71;
  const isNotRec    = job.matchScore <= 25;
  const applied     = appliedIds.has(job.id);
  const hasMatched  = (job.matchedSkills || []).length > 0;

  const logoContent = job.companyLogo
    ? `<img src="${escapeHtml(job.companyLogo)}" alt="${escapeHtml(job.company)}">`
    : escapeHtml(job.companyInitial || job.company?.[0] || 'C');

  return `
    <article class="jm-card${applied ? ' jm-card--applied' : ''}" style="--enter-delay:${idx*60}ms;" data-job-id="${job.id}">
      <div class="jm-card__accent" style="background:${sc.barColor};"></div>

      <div class="jm-card__top">
        <div class="jm-card__brand">
          <div class="jm-card__logo">
            ${logoContent}
          </div>
          <div class="jm-card__brand-info">
            <h3 class="jm-card__title" title="${escapeHtml(job.title)}">${escapeHtml(job.title)}</h3>
            <p class="jm-card__company">
              ${icon('briefcase', 13)}
              ${job.companyUserId
                ? `<a href="#/company/${job.companyUserId}" onclick="event.stopPropagation()" style="color:inherit;text-decoration:none;font-weight:600;" onmouseover="this.style.textDecoration='underline'" onmouseout="this.style.textDecoration='none'">${escapeHtml(job.company)}</a>`
                : `<span>${escapeHtml(job.company)}</span>`
              }
            </p>
          </div>
        </div>
        <div class="jm-card__status-col">
          ${renderMatchBadge(job.matchScore)}
          ${applied ? `<span class="jm-card__applied-badge">${icon('checkCircle', 11)} Applied</span>` : ''}
          ${isHighlyRec && !applied ? `<span class="jm-card__hot-badge" title="Highly Recommended">${icon('award', 11)} Highly Recommended</span>` : ''}
          ${isNotRec && !applied ? `<span class="jm-card__notrec-badge" title="Not Recommended">${icon('alertTriangle', 11)} Not Recommended</span>` : ''}
        </div>
      </div>

      <div class="jm-card__body">
        <div class="jm-card__meta">
          <span class="jm-meta-item">${icon('mapPin', 12)} ${escapeHtml(job.location)}</span>
          ${job.type ? `<span class="jm-meta-item">${icon('clock', 12)} ${escapeHtml(job.type)}</span>` : ''}
          ${job.experienceLevel ? `<span class="jm-meta-item">${icon('award', 12)} ${escapeHtml(job.experienceLevel)}</span>` : ''}
          <span class="jm-meta-item jm-meta-item--salary">${icon('dollarSign', 12)} ${escapeHtml(job.salary)}</span>
        </div>

        <p class="jm-card__desc">${escapeHtml(job.description)}</p>

        <div class="jm-card__insight ${isNotRec ? 'jm-card__insight--not-rec' : (isHighlyRec ? 'jm-card__insight--high' : 'jm-card__insight--matched')}">
          <div class="jm-card__insight-icon">${isNotRec ? icon('alertTriangle', 13) : (isHighlyRec ? icon('award', 13) : icon('checkCircle', 13))}</div>
          <span><strong>${sc.label}:</strong> ${escapeHtml(job.matchExplanation)}</span>
        </div>

        ${renderSkillsCapped(job.skills, job.matchedSkills, 4)}
      </div>

      <div class="jm-card__footer">
        <span class="jm-card__date">${icon('clock', 12)} ${job.postedDate ? 'Posted ' + escapeHtml(job.postedDate) : 'Recently posted'}</span>
        <div class="jm-card__actions">
          <button class="jm-card__bookmark" aria-label="Save job" data-saved="false" title="Save job">${icon('star', 15)}</button>
          ${applied
            ? `<span class="jm-card__applied-btn">${icon('checkCircle', 13)} Applied</span>`
            : `<button class="jm-card__apply btn btn--primary btn--sm" data-job-id="${job.id}" data-job-title="${escapeHtml(job.title)}" data-job-company="${escapeHtml(job.company)}" data-job-type="${escapeHtml(job.type)}" data-job-score="${job.matchScore}">
                 ${icon('send', 13)} Apply Now
               </button>`}
        </div>
      </div>
    </article>`;
}

// Alias for backwards compatibility
const jobCard = internalCard;

/* ── External job card (JSearch) ── */
function externalCard(job, idx) {
  const matchedSkills = job.matched_skills || job.matchedSkills || [];
  const skills        = job.skills || [];

  const fmtSlug = s => {
    const ov = { javascript:'JavaScript', typescript:'TypeScript', 'node-js':'Node.js',
      nodejs:'Node.js', 'vue-js':'Vue.js', vuejs:'Vue.js', react:'React', 'react-native':'React Native',
      'next-js':'Next.js', nextjs:'Next.js', mysql:'MySQL', postgresql:'PostgreSQL', mongodb:'MongoDB',
      php:'PHP', laravel:'Laravel', python:'Python', html:'HTML', css:'CSS', git:'Git',
      docker:'Docker', aws:'AWS', gcp:'GCP', kubernetes:'Kubernetes', redis:'Redis',
      graphql:'GraphQL', tailwindcss:'Tailwind CSS', 'tailwind-css':'Tailwind CSS',
      bootstrap:'Bootstrap', angular:'Angular', svelte:'Svelte', flutter:'Flutter',
      kotlin:'Kotlin', swift:'Swift', golang:'Go', rust:'Rust', java:'Java', csharp:'C#',
    };
    return ov[s] || String(s).split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const logoContent = job.company_logo
    ? `<img src="${escapeHtml(job.company_logo)}" alt="${escapeHtml(job.company)}">`
    : escapeHtml(job.company_initial || (job.company || 'C').charAt(0));

  return `
    <article class="jm-card jm-card--external" style="--enter-delay:${idx*60}ms;" data-job-id="${job.id}">
      <div class="jm-card__accent" style="background:var(--color-primary, #005930);"></div>

      <div class="jm-card__top">
        <div class="jm-card__brand">
          <div class="jm-card__logo">
            ${logoContent}
          </div>
          <div class="jm-card__brand-info">
            <h3 class="jm-card__title" title="${escapeHtml(job.title)}">${escapeHtml(job.title)}</h3>
            <p class="jm-card__company">
              ${icon('briefcase', 13)}
              <span>${escapeHtml(job.company)}</span>
              <span class="jm-card__ext-pill">${icon('externalLink', 10)} External</span>
            </p>
          </div>
        </div>
        <div class="jm-card__status-col">
          <span class="jm-card__hot-badge" title="Highly Recommended">${icon('award', 11)} Highly Recommended</span>
        </div>
      </div>


      <div class="jm-card__body">
        <div class="jm-card__meta">
          <span class="jm-meta-item">${icon('mapPin', 12)} ${escapeHtml(job.location || 'Remote')}${job.remote ? ' · Remote' : ''}</span>
          ${job.type ? `<span class="jm-meta-item">${icon('clock', 12)} ${escapeHtml(job.type)}</span>` : ''}
          ${job.salary ? `<span class="jm-meta-item jm-meta-item--salary">${icon('dollarSign', 12)} ${escapeHtml(job.salary)}</span>` : ''}
        </div>

        <p class="jm-card__desc">${escapeHtml(job.description || '')}</p>

        ${renderSkillsCapped(skills.map(fmtSlug), matchedSkills.map(fmtSlug), 4)}
      </div>

      <div class="jm-card__footer">
        <span class="jm-card__date">${icon('clock', 12)} ${job.posted_date ? relativeDate(job.posted_date) : 'Recently posted'}</span>
        <div class="jm-card__actions">
          <button class="jm-card__bookmark" aria-label="Save job" data-saved="false" title="Save job">${icon('star', 15)}</button>
          <button class="btn btn--outline btn--sm jm-ext-send-resume" data-job-id="${job.id}">
            ${icon('fileText', 13)} View &amp; Apply
          </button>
        </div>
      </div>
    </article>`;
}

/* ── Job Detail Modal ── */
function jobDetailModal(job, applied = false) {
  const sc = scoreColor(job.matchScore);
  const logoContent = job.companyLogo
    ? `<img src="${escapeHtml(job.companyLogo)}" alt="${escapeHtml(job.company)}" style="width:100%;height:100%;object-fit:contain;">`
    : escapeHtml(job.companyInitial || job.company?.[0] || 'C');

  const matchedLower = (job.matchedSkills || []).map(s => String(s).toLowerCase().trim());
  const allSkills = job.skills || [];
  const matchedList = allSkills.filter(s => matchedLower.includes(String(s).toLowerCase().trim()));
  const otherList = allSkills.filter(s => !matchedLower.includes(String(s).toLowerCase().trim()));

  return `
    <div class="modal-overlay" id="job-detail-modal">
      <div class="modal modal--visible" style="max-width: 680px; width: 100%; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.25);">
        <!-- Top Accent Stripe -->
        <div style="height: 4px; background: ${sc.barColor}; width: 100%;"></div>

        <!-- Header -->
        <div class="modal__header" style="border-bottom: 1px solid var(--border-default, #e2e8f0); padding: 18px 24px; background: #ffffff; display: flex; align-items: center; justify-content: space-between; gap: 14px;">
          <div style="display: flex; align-items: center; gap: 14px; min-width: 0;">
            <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(0,89,48,0.08); color: #005930; display: flex; align-items: center; justify-content: center; font-size: 1.15rem; font-weight: 800; flex-shrink: 0; border: 1px solid rgba(0,89,48,0.2); overflow: hidden;">
              ${logoContent}
            </div>
            <div style="min-width: 0;">
              <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                <h3 class="modal__title" style="margin: 0; font-size: 1.18rem; font-weight: 800; color: #0f172a;">
                  ${escapeHtml(job.title)}
                </h3>
                ${renderMatchBadge(job.matchScore)}
              </div>
              <p style="font-size: 0.82rem; color: #64748b; margin: 3px 0 0; font-weight: 500; display: flex; align-items: center; gap: 6px;">
                ${icon('briefcase', 12)}
                <span style="font-weight: 600; color: #334155;">${escapeHtml(job.company)}</span>
                ${job.location ? `<span>•</span><span>${escapeHtml(job.location)}</span>` : ''}
              </p>
            </div>
          </div>
          <button class="modal__close" id="jd-close" aria-label="Close modal">${icon('x', 20)}</button>
        </div>

        <!-- Body -->
        <div class="modal__body" style="max-height: 70vh; overflow-y: auto; padding: 22px 24px; background: #ffffff;">

          <!-- 4 KPI Stat Tiles -->
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px;">
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 10px; text-align: center;">
              <div style="font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: #64748b; margin-bottom: 4px; display: flex; align-items: center; justify-content: center; gap: 4px;">
                ${icon('zap', 12)} Match Score
              </div>
              <div style="font-size: 1.25rem; font-weight: 800; color: ${sc.barColor}; line-height: 1.2;">${job.matchScore}%</div>
              <div style="font-size: 0.7rem; color: ${sc.color}; font-weight: 700; margin-top: 3px;">
                ${sc.label}
              </div>
            </div>

            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 10px; text-align: center;">
              <div style="font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: #64748b; margin-bottom: 4px; display: flex; align-items: center; justify-content: center; gap: 4px;">
                ${icon('dollarSign', 12)} Compensation
              </div>
              <div style="font-size: 0.95rem; font-weight: 800; color: #005930; line-height: 1.2; word-break: break-word;">${escapeHtml(job.salary || 'Competitive')}</div>
              <div style="font-size: 0.7rem; color: #64748b; margin-top: 3px;">Salary range</div>
            </div>

            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 10px; text-align: center;">
              <div style="font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: #64748b; margin-bottom: 4px; display: flex; align-items: center; justify-content: center; gap: 4px;">
                ${icon('clock', 12)} Work Type
              </div>
              <div style="font-size: 0.95rem; font-weight: 800; color: #0f172a; line-height: 1.2;">${escapeHtml(job.type || 'Full-time')}</div>
              <div style="font-size: 0.7rem; color: #64748b; margin-top: 3px;">${escapeHtml(job.experienceLevel || 'All levels')}</div>
            </div>

            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 10px; text-align: center;">
              <div style="font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: #64748b; margin-bottom: 4px; display: flex; align-items: center; justify-content: center; gap: 4px;">
                ${icon('calendar', 12)} Posted
              </div>
              <div style="font-size: 0.95rem; font-weight: 800; color: #0f172a; line-height: 1.2;">${escapeHtml(job.postedDate || 'Recent')}</div>
              <div style="font-size: 0.7rem; color: #64748b; margin-top: 3px;">Active listing</div>
            </div>
          </div>

          <!-- Skills Compatibility Analysis -->
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 16px; margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; flex-wrap: wrap; gap: 8px;">
              <span style="font-size: 0.76rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: #475569; display: flex; align-items: center; gap: 5px;">
                ${icon('award', 13)} Skill Compatibility Analysis
              </span>
              <span style="font-size: 0.76rem; font-weight: 600; color: ${sc.barColor};">
                ${escapeHtml(job.matchExplanation)}
              </span>
            </div>

            ${matchedList.length ? `
              <div style="margin-bottom: 10px;">
                <span style="font-size: 0.72rem; color: #15803d; font-weight: 600; display: block; margin-bottom: 4px;">
                  Matched Skills (${matchedList.length}):
                </span>
                <div style="display: flex; flex-wrap: wrap; gap: 5px;">
                  ${matchedList.map(s => `<span style="display:inline-flex;align-items:center;gap:3px;font-size:0.75rem;font-weight:600;padding:2px 8px;border-radius:5px;background:#dcfce7;color:#15803d;border:1px solid #86efac;">${icon('check', 11)} ${escapeHtml(s)}</span>`).join('')}
                </div>
              </div>
            ` : ''}

            ${otherList.length ? `
              <div>
                <span style="font-size: 0.72rem; color: #64748b; font-weight: 600; display: block; margin-bottom: 4px;">
                  Other Required Skills (${otherList.length}):
                </span>
                <div style="display: flex; flex-wrap: wrap; gap: 5px;">
                  ${otherList.map(s => `<span style="font-size:0.75rem;font-weight:500;padding:2px 8px;border-radius:5px;background:#ffffff;color:#475569;border:1px solid #e2e8f0;">${escapeHtml(s)}</span>`).join('')}
                </div>
              </div>
            ` : ''}
          </div>

          <!-- Description & Responsibilities -->
          <div style="margin-bottom: 20px;">
            <h4 style="font-size: 0.76rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #64748b; margin: 0 0 8px 0; display: flex; align-items: center; gap: 6px;">
              ${icon('fileText', 13)} Job Description &amp; Requirements
            </h4>
            <div style="font-size: 0.88rem; line-height: 1.65; color: #334155; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px; white-space: pre-line;">
              ${escapeHtml(job.description || 'No detailed description provided.')}
            </div>
          </div>

          <!-- Company Overview Card -->
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 16px; display: flex; align-items: center; gap: 14px;">
            <div style="width: 40px; height: 40px; border-radius: 50%; background: rgba(0,89,48,0.1); color: #005930; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              ${icon('building', 20)}
            </div>
            <div style="flex: 1; min-width: 0;">
              <p style="font-size: 0.68rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 2px;">Company / Organization</p>
              <p style="font-weight: 700; font-size: 0.92rem; color: #0f172a; margin: 0 0 2px;">${escapeHtml(job.company)}</p>
              <p style="font-size: 0.78rem; color: #64748b; margin: 0;">
                ${escapeHtml(job.department || 'General')} • ${escapeHtml(job.location || 'Philippines')}
              </p>
            </div>
            ${job.companyUserId ? `
              <a href="#/company/${job.companyUserId}" class="btn btn--outline btn--sm" style="font-size:0.75rem;height:32px;padding:0 12px;text-decoration:none;">
                View Profile
              </a>
            ` : ''}
          </div>

        </div>

        <!-- Footer -->
        <div class="modal__footer" style="padding: 14px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center;">
          <button class="btn btn--outline" id="jd-close-btn" style="height: 38px; padding: 0 16px;">Close</button>
          <div style="display: flex; gap: 8px;">
            ${applied
              ? `<span class="jm-card__applied-btn" style="height:38px;">${icon('checkCircle', 13)} Already Applied</span>`
              : `<button class="btn btn--primary" id="jd-apply-btn" style="height: 38px; padding: 0 18px; display: flex; align-items: center; gap: 6px;">
                   ${icon('send', 14)} Apply for this Position
                 </button>`
            }
          </div>
        </div>
      </div>
    </div>`;
}

/* ── Send Resume modal (external jobs) ── */
function sendResumeModal(job) {
  const logoContent = job.company_logo
    ? `<img src="${escapeHtml(job.company_logo)}" alt="${escapeHtml(job.company)}" style="width:100%;height:100%;object-fit:contain;">`
    : escapeHtml(job.company_initial || (job.company || 'C').charAt(0));

  return `
    <div class="modal-overlay" id="send-resume-modal">
      <div class="modal" style="max-width: 520px; width: 100%; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.25);">
        <!-- Top Accent Line -->
        <div style="height: 4px; background: #005930; width: 100%;"></div>

        <!-- Header -->
        <div class="modal__header" style="border-bottom: 1px solid #e2e8f0; padding: 18px 24px; background: #ffffff; display: flex; align-items: center; justify-content: space-between; gap: 14px;">
          <div style="display: flex; align-items: center; gap: 12px; min-width: 0;">
            <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(0,89,48,0.08); color: #005930; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; font-weight: 800; flex-shrink: 0; border: 1px solid rgba(0,89,48,0.2); overflow: hidden;">
              ${logoContent}
            </div>
            <div style="min-width: 0;">
              <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                <h3 class="modal__title" style="margin: 0; font-size: 1.12rem; font-weight: 800; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                  ${escapeHtml(job.title)}
                </h3>
                <span class="jm-card__hot-badge" title="Highly Recommended" style="font-size:0.68rem; padding:2px 7px;">${icon('award', 11)} Highly Recommended</span>
              </div>
              <p style="font-size: 0.8rem; color: #64748b; margin: 2px 0 0; font-weight: 500;">
                ${escapeHtml(job.company)} • External Partner Listing
              </p>
            </div>
          </div>
          <button class="modal__close" id="send-resume-close" aria-label="Close modal">${icon('x', 20)}</button>
        </div>

        <!-- Body -->
        <div class="modal__body" style="padding: 20px 24px; background: #ffffff;">
          <div style="display: flex; align-items: flex-start; gap: 10px; padding: 12px 14px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; margin-bottom: 14px;">
            <span style="color: #2563eb; flex-shrink: 0; margin-top: 1px;">${icon('externalLink', 16)}</span>
            <p style="font-size: 0.83rem; color: #1e3a8a; margin: 0; line-height: 1.55;">
              This position is hosted on an external employer portal. You can copy or export your verified resume from <strong>My Portfolio</strong> and submit your application directly on the employer's website.
            </p>
          </div>

          <div style="display: flex; align-items: center; gap: 10px; padding: 10px 14px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px;">
            <span style="color: #15803d; flex-shrink: 0;">${icon('checkCircle', 16)}</span>
            <p style="font-size: 0.82rem; color: #166534; margin: 0; font-weight: 500;">Your portfolio &amp; resume are ready to export.</p>
          </div>
        </div>

        <!-- Footer -->
        <div class="modal__footer" style="padding: 14px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 8px;">
          <button class="btn btn--ghost" id="send-resume-cancel" style="height: 38px; padding: 0 16px;">Cancel</button>
          <a href="#/portfolio" class="btn btn--outline" style="height: 38px; padding: 0 16px; display: flex; align-items: center; gap: 6px; text-decoration: none;">
            ${icon('fileText', 14)} My Resume
          </a>
          ${job.link ? `
            <a href="${escapeHtml(job.link)}" target="_blank" rel="noopener noreferrer" class="btn btn--primary" style="height: 38px; padding: 0 18px; display: flex; align-items: center; gap: 6px; text-decoration: none;">
              ${icon('externalLink', 14)} Apply on Site
            </a>
          ` : ''}
        </div>
      </div>
    </div>`;
}

/* ── Apply confirmation modal ── */
function applyModal(job) {
  const sc = scoreColor(job.matchScore);
  const isNotRec = sc.tier === 'not_recommended' || (job.matchScore <= 25);
  const logoContent = job.companyLogo
    ? `<img src="${escapeHtml(job.companyLogo)}" alt="${escapeHtml(job.company)}" style="width:100%;height:100%;object-fit:contain;">`
    : escapeHtml(job.companyInitial || job.company?.[0] || 'C');

  return `
    <div class="modal-overlay" id="apply-modal">
      <div class="modal modal--visible" style="max-width: 540px; width: 100%; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.25);">
        <!-- Top Accent Line -->
        <div style="height: 4px; background: ${sc.barColor}; width: 100%;"></div>

        <!-- Header -->
        <div class="modal__header" style="border-bottom: 1px solid #e2e8f0; padding: 18px 24px; background: #ffffff; display: flex; align-items: center; justify-content: space-between; gap: 14px;">
          <div style="display: flex; align-items: center; gap: 12px; min-width: 0;">
            <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(0,89,48,0.08); color: #005930; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; font-weight: 800; flex-shrink: 0; border: 1px solid rgba(0,89,48,0.2); overflow: hidden;">
              ${logoContent}
            </div>
            <div style="min-width: 0;">
              <h3 class="modal__title" style="margin: 0; font-size: 1.12rem; font-weight: 800; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                ${escapeHtml(job.title)}
              </h3>
              <p style="font-size: 0.8rem; color: #64748b; margin: 2px 0 0; font-weight: 500;">
                ${escapeHtml(job.company)}${job.location ? ' • ' + escapeHtml(job.location) : ''}
              </p>
            </div>
          </div>
          <button class="modal__close" id="apply-modal-close" aria-label="Close modal">${icon('x', 20)}</button>
        </div>

        <!-- Body -->
        <div class="modal__body" style="padding: 20px 24px; background: #ffffff;">
          ${isNotRec ? `
          <!-- Not Recommended Warning Banner -->
          <div style="display: flex; align-items: flex-start; gap: 10px; padding: 12px 14px; background: rgba(239,68,68,0.08); border: 1.5px solid rgba(239,68,68,0.28); border-radius: 10px; margin-bottom: 16px;">
            <span style="color: #dc2626; flex-shrink: 0; margin-top: 1px;">${icon('alertTriangle', 18)}</span>
            <div style="font-size: 0.82rem; color: #1e293b; line-height: 1.45;">
              <strong style="color: #dc2626; font-size: 0.86rem; display: block; margin-bottom: 2px;">You are not likely to get accepted! It is not a recommended listing.</strong>
              Your profile has only a <strong>${Math.round(job.matchScore)}% skill match</strong> for this position. Host companies prioritize applicants with matching skills. You may still apply, but this serves as an advisory warning.
            </div>
          </div>
          ` : ''}

          <!-- Profile attachment notice -->
          <div style="display: flex; align-items: center; gap: 10px; padding: 12px 14px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; margin-bottom: 18px;">
            <span style="color: #15803d; flex-shrink: 0;">${icon('checkCircle', 18)}</span>
            <div style="font-size: 0.82rem; color: #166534; line-height: 1.45;">
              <strong>Profile Attached Automatically:</strong> Your graduate profile, verified skills, and portfolio will be submitted automatically.
            </div>
          </div>

          <!-- Cover letter textarea -->
          <div class="form-group" style="margin: 0;">
            <label class="form-label" style="font-size: 0.82rem; font-weight: 600; color: #334155; margin-bottom: 6px; display: block;">
              Cover Letter / Introduction <span style="color: #94a3b8; font-size: 0.85em; font-weight: 400;">(optional)</span>
            </label>
            <textarea id="apply-cover-letter" class="form-textarea" rows="4"
              style="resize: vertical; font-size: 0.88rem; line-height: 1.6; width: 100%; box-sizing: border-box; border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px 12px;"
              placeholder="Briefly introduce yourself and why you're interested in this role…"></textarea>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px;">
              <span style="font-size: 0.72rem; color: #94a3b8;">Max 500 characters</span>
              <span style="font-size: 0.72rem; color: #94a3b8;"><span id="char-count">0</span> / 500</span>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="modal__footer" style="padding: 14px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 8px;">
          <button class="btn btn--ghost" id="apply-modal-cancel" style="height: 38px; padding: 0 16px;">Cancel</button>
          <button class="btn ${isNotRec ? '' : 'btn--primary'}" id="apply-modal-submit" data-job-id="${job.id}" style="height: 38px; padding: 0 18px; display: flex; align-items: center; gap: 6px; ${isNotRec ? 'background: #dc2626; color: #ffffff; border: 1px solid #b91c1c;' : ''}">
            ${icon('send', 14)} ${isNotRec ? 'Proceed & Apply Anyway' : 'Submit Application'}
          </button>
        </div>
      </div>
    </div>`;
}

/* ── Main render ── */
export async function renderJobs(container) {
  container.innerHTML = `
    <div class="page-enter">
      <section class="jm-hero">
        <div class="jm-hero__bg">
          <div class="jm-hero__shape jm-hero__shape--1"></div>
          <div class="jm-hero__shape jm-hero__shape--2"></div>
          <div class="jm-hero__shape jm-hero__shape--3"></div>
        </div>
        <div class="jm-hero__content">
          <h1 class="jm-hero__title animate-fade-in-up">Find Your Perfect <span>Career Match</span></h1>
          <p class="jm-hero__subtitle animate-fade-in-up" style="animation-delay:80ms;">
            Matched to open positions based on your skills and experience
          </p>
          <div class="jm-hero__search animate-fade-in-up" style="animation-delay:160ms;">
            <div class="jm-search">
              <span class="jm-search__icon">${icon('search',18)}</span>
              <input type="text" class="jm-search__input" id="job-search"
                     placeholder="Search jobs, companies, or skills..." autocomplete="off"/>
              <kbd class="jm-search__kbd">Ctrl+K</kbd>
            </div>
          </div>
        </div>
        <div class="jm-hero__stats animate-fade-in-up" style="animation-delay:240ms;">
          <div class="jm-stat"><span class="jm-stat__value" id="stat-matches">0</span><span class="jm-stat__label">Open Jobs</span></div>
          <div class="jm-stat__divider"></div>
          <div class="jm-stat"><span class="jm-stat__value" id="stat-avg">0%</span><span class="jm-stat__label">Avg Match Score</span></div>
          <div class="jm-stat__divider"></div>
          <div class="jm-stat"><span class="jm-stat__value" id="stat-skills">0</span><span class="jm-stat__label">Skills Matched</span></div>
        </div>
      </section>

      <div id="banner-slot"></div>

      <section class="jm-toolbar animate-fade-in-up" style="animation-delay:300ms;">
        <div class="jm-tabs" id="job-filter">
          <button class="jm-tabs__btn jm-tabs__btn--active" data-filter="all">
            <span class="jm-tabs__icon">${icon('briefcase',15)}</span>
            All Jobs
            <span class="jm-tabs__count" id="all-count">0</span>
          </button>
          <button class="jm-tabs__btn" data-filter="top">
            <span class="jm-tabs__icon">${icon('zap',15)}</span>
            Best Match
            <span class="jm-tabs__count" id="top-count">0</span>
          </button>
          <button class="jm-tabs__btn" data-filter="external">
            <span class="jm-tabs__icon">${icon('globe',15)}</span>
            External Jobs
            <span class="jm-tabs__count" id="external-count">0</span>
          </button>
        </div>
        <div class="jm-toolbar__right">
          <button class="jf-toggle" id="jf-toggle" aria-expanded="false" title="Toggle advanced filters">
            <span class="jf-toggle__icon">${icon('sliders', 15)}</span>
            <span>Filters</span>
            <span class="jf-toggle__badge" id="jf-badge">0</span>
          </button>
          <div class="jm-sort" id="job-sort">
            <span class="jm-sort__label">${icon('arrowUpDown', 12)} Sort</span>
            <button class="jm-sort__btn jm-sort__btn--active" data-sort="match">${icon('trendingUp',13)} Best Match</button>
            <button class="jm-sort__btn" data-sort="recent">${icon('clock',13)} Most Recent</button>
          </div>
        </div>
      </section>

      <!-- Quick Filter Chips Row -->
      <div class="jf-quick-bar animate-fade-in-up" id="jf-quick-bar" style="animation-delay:330ms;">
        <span class="jf-quick-bar__title">${icon('sparkles', 13)} Quick Filters:</span>
        <div class="jf-quick-bar__chips">
          <button class="jf-quick-chip" data-quick="top-match">
            <span class="jf-quick-chip__icon">🌟</span> 71%+ Match
          </button>
          <button class="jf-quick-chip" data-quick="full-time">
            <span class="jf-quick-chip__icon">🏢</span> Full-Time
          </button>
          <button class="jf-quick-chip" data-quick="remote">
            <span class="jf-quick-chip__icon">🌐</span> Remote Only
          </button>
          <button class="jf-quick-chip" data-quick="salary-30k">
            <span class="jf-quick-chip__icon">💰</span> ₱30k+
          </button>
          <button class="jf-quick-chip" data-quick="recent-week">
            <span class="jf-quick-chip__icon">⏱️</span> Past 7 Days
          </button>
        </div>
      </div>

      <!-- Active Filters Tag Summary Bar -->
      <div class="jf-active-bar" id="jf-active-bar" style="display:none;">
        <div class="jf-active-bar__left">
          <span class="jf-active-bar__label">${icon('filter', 13)} Active:</span>
          <div class="jf-active-bar__tags" id="jf-active-tags"></div>
        </div>
        <div class="jf-active-bar__right">
          <span class="jf-active-bar__count" id="jf-active-count">0 matching jobs</span>
          <button class="jf-active-bar__clear" id="jf-active-clear" title="Clear all filters">
            ${icon('rotateCcw', 12)} Clear all
          </button>
        </div>
      </div>

      <!-- Expandable Comprehensive Filter Drawer -->
      <div class="jf-panel" id="jf-panel">
        <div class="jf-panel__inner">
          <div class="jf-panel__header">
            <div class="jf-panel__header-left">
              <div class="jf-panel__icon-badge">${icon('sliders', 17)}</div>
              <div>
                <h4 class="jf-panel__heading">Filter &amp; Refine Matches</h4>
                <p class="jf-panel__subheading">Customize matching parameters to find the ideal career opportunity</p>
              </div>
            </div>
            <div class="jf-panel__header-right">
              <span class="jf-panel__status-pill" id="jf-panel-status">No active filters</span>
              <button class="jf-panel__clear-btn" id="jf-clear" type="button">
                ${icon('rotateCcw', 12)} Reset All
              </button>
            </div>
          </div>

          <div class="jf-panel__grid">
            <!-- Section 1: Employment Type -->
            <div class="jf-card">
              <div class="jf-card__head">
                <span class="jf-card__icon">${icon('briefcase', 14)}</span>
                <span class="jf-card__title">Employment Type</span>
              </div>
              <div class="jf-card__body">
                <div class="jf-pill-group" id="jf-type-checks">
                  ${EMPLOYMENT_TYPES.map(t => {
                    const emojis = { 'Full-time':'🏢', 'Part-time':'⏱️', 'Contract':'📄', 'Freelance':'💼', 'Remote':'🌐' };
                    return `
                      <button class="jf-pill" data-value="${t}" type="button">
                        <span class="jf-pill__emoji">${emojis[t] || '📌'}</span>
                        <span class="jf-pill__text">${t}</span>
                        <span class="jf-pill__check">${icon('check', 11)}</span>
                      </button>
                    `;
                  }).join('')}
                </div>
              </div>
            </div>

            <!-- Section 2: Location -->
            <div class="jf-card">
              <div class="jf-card__head">
                <span class="jf-card__icon">${icon('mapPin', 14)}</span>
                <span class="jf-card__title">Location / City</span>
              </div>
              <div class="jf-card__body">
                <div class="jf-multiselect" id="jf-loc-ms">
                  <div class="jf-multiselect__trigger" id="jf-loc-trigger" tabindex="0">
                    <span class="jf-multiselect__placeholder">All Locations</span>
                    <span class="jf-multiselect__badge" id="jf-loc-badge" style="display:none;">0</span>
                    <span class="jf-multiselect__arrow">${icon('chevronDown', 14)}</span>
                  </div>
                  <div class="jf-multiselect__dropdown" id="jf-loc-dropdown">
                    <div class="jf-multiselect__search-box">
                      <span class="jf-multiselect__search-icon">${icon('search', 13)}</span>
                      <input type="text" class="jf-multiselect__search" placeholder="Search cities..." />
                    </div>
                    <div class="jf-multiselect__options-list" id="jf-loc-options">
                      ${PH_CITIES.map(c => `
                        <div class="jf-multiselect__option" data-value="${c}">
                          <div class="jf-multiselect__check-box">${icon('check', 10)}</div>
                          <span class="jf-multiselect__opt-label">${c}</span>
                        </div>
                      `).join('')}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Section 3: Department & Company -->
            <div class="jf-card" id="jf-dept-company-card">
              <div class="jf-card__head">
                <span class="jf-card__icon">${icon('layers', 14)}</span>
                <span class="jf-card__title">Department &amp; Company</span>
              </div>
              <div class="jf-card__body" style="display:flex;flex-direction:column;gap:10px;">
                <div class="jf-subgroup">
                  <span class="jf-subgroup__label">Department</span>
                  <div class="jf-multiselect" id="jf-dept-ms">
                    <div class="jf-multiselect__trigger" id="jf-dept-trigger" tabindex="0">
                      <span class="jf-multiselect__placeholder">All Departments</span>
                      <span class="jf-multiselect__badge" id="jf-dept-badge" style="display:none;">0</span>
                      <span class="jf-multiselect__arrow">${icon('chevronDown', 14)}</span>
                    </div>
                    <div class="jf-multiselect__dropdown" id="jf-dept-dropdown">
                      <div class="jf-multiselect__search-box">
                        <span class="jf-multiselect__search-icon">${icon('search', 13)}</span>
                        <input type="text" class="jf-multiselect__search" placeholder="Search departments..." />
                      </div>
                      <div class="jf-multiselect__options-list" id="jf-dept-options">
                        ${DEPARTMENTS.map(d => `
                          <div class="jf-multiselect__option" data-value="${d}">
                            <div class="jf-multiselect__check-box">${icon('check', 10)}</div>
                            <span class="jf-multiselect__opt-label">${d}</span>
                          </div>
                        `).join('')}
                      </div>
                    </div>
                  </div>
                </div>

                <div class="jf-subgroup" id="jf-company-group">
                  <span class="jf-subgroup__label">Company</span>
                  <div class="jf-multiselect" id="jf-company-ms">
                    <div class="jf-multiselect__trigger" id="jf-company-trigger" tabindex="0">
                      <span class="jf-multiselect__placeholder">All Companies</span>
                      <span class="jf-multiselect__badge" id="jf-company-badge" style="display:none;">0</span>
                      <span class="jf-multiselect__arrow">${icon('chevronDown', 14)}</span>
                    </div>
                    <div class="jf-multiselect__dropdown" id="jf-company-dropdown">
                      <div class="jf-multiselect__search-box">
                        <span class="jf-multiselect__search-icon">${icon('search', 13)}</span>
                        <input type="text" class="jf-multiselect__search" placeholder="Search companies..." />
                      </div>
                      <div class="jf-multiselect__options-list" id="jf-company-options"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Section 4: Match Score & Compensation -->
            <div class="jf-card">
              <div class="jf-card__head">
                <span class="jf-card__icon">${icon('zap', 14)}</span>
                <span class="jf-card__title">Match &amp; Compensation</span>
              </div>
              <div class="jf-card__body" style="display:flex;flex-direction:column;gap:14px;">
                <!-- Match Score Slider -->
                <div class="jf-slider-group">
                  <div class="jf-slider-header">
                    <span class="jf-slider-label">Min. Match Score</span>
                    <span class="jf-slider-badge jf-slider-badge--score" id="jf-score-val">0%</span>
                  </div>
                  <div class="jf-slider-track-wrap">
                    <input type="range" class="jf-slider" id="jf-score" min="0" max="100" step="5" value="0" />
                  </div>
                  <div class="jf-slider-presets">
                    <button class="jf-preset-btn jf-preset-btn--active" data-target="score" data-value="0" type="button">Any</button>
                    <button class="jf-preset-btn" data-target="score" data-value="50" type="button">50%+</button>
                    <button class="jf-preset-btn" data-target="score" data-value="71" type="button">71%+ 🌟</button>
                    <button class="jf-preset-btn" data-target="score" data-value="90" type="button">90%+ 🔥</button>
                  </div>
                </div>

                <!-- Salary Slider -->
                <div class="jf-slider-group">
                  <div class="jf-slider-header">
                    <span class="jf-slider-label">Minimum Salary</span>
                    <span class="jf-slider-badge" id="jf-salary-val">Any</span>
                  </div>
                  <div class="jf-slider-track-wrap">
                    <input type="range" class="jf-slider" id="jf-salary" min="0" max="100000" step="5000" value="0" />
                  </div>
                  <div class="jf-slider-presets">
                    <button class="jf-preset-btn jf-preset-btn--active" data-target="salary" data-value="0" type="button">Any</button>
                    <button class="jf-preset-btn" data-target="salary" data-value="25000" type="button">₱25k+</button>
                    <button class="jf-preset-btn" data-target="salary" data-value="50000" type="button">₱50k+</button>
                    <button class="jf-preset-btn" data-target="salary" data-value="75000" type="button">₱75k+</button>
                  </div>
                </div>

                <!-- Date Posted Segmented -->
                <div class="jf-slider-group">
                  <div class="jf-slider-header">
                    <span class="jf-slider-label">Date Posted</span>
                  </div>
                  <div class="jf-segment-control" id="jf-date-group">
                    <button class="jf-segment-btn jf-segment-btn--active" data-value="any" type="button">Any Time</button>
                    <button class="jf-segment-btn" data-value="today" type="button">Today</button>
                    <button class="jf-segment-btn" data-value="week" type="button">This Week</button>
                    <button class="jf-segment-btn" data-value="month" type="button">This Month</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="jf-panel__footer">
            <div class="jf-panel__footer-count">
              <span class="jf-footer-dot"></span>
              <span id="jf-footer-match-count">0 matching jobs found</span>
            </div>
            <div class="jf-panel__footer-actions">
              <button class="btn btn--ghost btn--sm" id="jf-footer-reset" type="button">
                ${icon('rotateCcw', 12)} Reset
              </button>
              <button class="btn btn--primary btn--sm" id="jf-footer-close" type="button">
                ${icon('check', 14)} Done
              </button>
            </div>
          </div>
        </div>
      </div>

      <section class="jm-grid" id="job-cards">
        <div class="jm-card--skeleton"></div>
        <div class="jm-card--skeleton"></div>
        <div class="jm-card--skeleton"></div>
      </section>
      <div class="jm-empty" id="job-empty" style="display:none;">
        <div class="jm-empty__icon">${icon('search',48)}</div>
        <h3>No jobs found</h3>
        <p>Try adjusting your search or filters</p>
      </div>
    </div>`;

  const filterBar  = container.querySelector('#job-filter');
  const cardsEl    = container.querySelector('#job-cards');
  const emptyEl    = container.querySelector('#job-empty');
  const searchInput= container.querySelector('#job-search');
  const sortBar    = container.querySelector('#job-sort');
  const bannerSlot = container.querySelector('#banner-slot');

  let currentFilter = 'all';
  let currentSort   = 'match';
  let searchQuery   = '';
  let allJobs       = [];
  let appliedIds    = new Set();
  let externalJobs    = null;   // null = not fetched yet
  let externalFetching = false;

  /* ── Filter state ── */
  const filters = {
    types: new Set(),
    companies: new Set(),
    locations: new Set(),
    departments: new Set(),
    minSalary: 0,
    minScore: 0,
    datePosted: 'any',
  };

  async function fetchExternalJobs() {
    if (externalFetching || externalJobs !== null) return;
    externalFetching = true;

    emptyEl.style.display = 'none';
    cardsEl.innerHTML = `
      <div style="grid-column:1/-1;display:flex;flex-direction:column;align-items:center;gap:16px;padding:60px 20px;color:var(--text-secondary);">
        <div style="width:44px;height:44px;border:3px solid var(--border-subtle);border-top-color:var(--color-primary);border-radius:50%;animation:spin 0.8s linear infinite;"></div>
        <p style="font-size:.9rem;">Finding jobs that match your skills…</p>
      </div>`;

    try {
      const res = await apiGet('/jobseeker/external-jobs');
      if (res?.success && Array.isArray(res.data)) {
        externalJobs = res.data;
        const ec = container.querySelector('#external-count');
        if (ec) ec.textContent = externalJobs.length;
      } else {
        externalJobs = [];
        const msg = res?.message || 'External job listings are temporarily unavailable.';
        cardsEl.innerHTML = `
          <div style="grid-column:1/-1;display:flex;flex-direction:column;align-items:center;gap:12px;padding:60px 20px;text-align:center;">
            <div style="width:56px;height:56px;border-radius:50%;background:var(--bg-secondary);display:flex;align-items:center;justify-content:center;font-size:1.6rem;">🌐</div>
            <p style="font-size:.925rem;font-weight:600;color:var(--text-primary);">External Jobs Unavailable</p>
            <p style="font-size:.825rem;color:var(--text-secondary);max-width:340px;line-height:1.6;">${msg}</p>
            <button id="ext-retry-btn" style="margin-top:4px;padding:8px 18px;border-radius:8px;border:1.5px solid var(--border-default);background:var(--bg-elevated);font-size:.8rem;font-weight:600;cursor:pointer;color:var(--text-primary);">
              Try Again
            </button>
          </div>`;
        container.querySelector('#ext-retry-btn')?.addEventListener('click', () => {
          externalJobs = null;
          fetchExternalJobs().then(() => renderCards(false));
        });
      }
    } catch {
      externalJobs = [];
      cardsEl.innerHTML = `
        <div style="grid-column:1/-1;display:flex;flex-direction:column;align-items:center;gap:12px;padding:60px 20px;text-align:center;">
          <div style="width:56px;height:56px;border-radius:50%;background:var(--bg-secondary);display:flex;align-items:center;justify-content:center;font-size:1.6rem;">⚠️</div>
          <p style="font-size:.925rem;font-weight:600;color:var(--text-primary);">Could Not Load External Jobs</p>
          <p style="font-size:.825rem;color:var(--text-secondary);max-width:340px;line-height:1.6;">Could not reach the server. Make sure the backend is running and try again.</p>
          <button id="ext-retry-btn2" style="margin-top:4px;padding:8px 18px;border-radius:8px;border:1.5px solid var(--border-default);background:var(--bg-elevated);font-size:.8rem;font-weight:600;cursor:pointer;color:var(--text-primary);">
            Retry
          </button>
        </div>`;
      container.querySelector('#ext-retry-btn2')?.addEventListener('click', () => {
        externalJobs = null;
        fetchExternalJobs().then(() => renderCards(false));
      });
    } finally {
      externalFetching = false;
    }
  }

  /* Load profile completeness & show banner if incomplete */
  const completeness = getState('profileCompleteness');
  if (completeness && !completeness.is_complete) {
    bannerSlot.innerHTML = incompleteBanner(completeness.sections);
  }

  /* Fetch employment status, real jobs + existing applications in parallel */
  const [empRes, res, appRes] = await Promise.all([
    apiGet('/jobseeker/employment-status'),
    apiGet('/jobseeker/jobs'),
    apiGet('/jobseeker/applications'),
  ]);

  /* ── Hired gate: block apply if already employed ── */
  const isHired = empRes?.hired === true;
  if (isHired) {
    const job = empRes.hired_job;
    bannerSlot.innerHTML = `
      <div style="display:flex;align-items:flex-start;gap:14px;padding:16px 20px;
                  background:linear-gradient(135deg,#fef3c7,#fde68a);
                  border:1.5px solid #f59e0b;border-radius:12px;margin-bottom:16px;">
        <span style="color:#d97706;flex-shrink:0;margin-top:2px;">${icon('briefcase', 22)}</span>
        <div style="flex:1;">
          <strong style="font-size:.95rem;color:#92400e;">You are currently employed</strong>
          ${job ? `<p style="margin:2px 0 0;font-size:.83rem;color:#78350f;">${job.title} at ${job.company}</p>` : ''}
          <p style="margin:6px 0 0;font-size:.82rem;color:#92400e;line-height:1.5;">
            You cannot apply for another job while you have an active employment. If your situation has changed, please contact support.
          </p>
        </div>
      </div>`;
  }
  if (res?.success && Array.isArray(res.data)) {
    allJobs = res.data.map(normalizeJob);
  }
  if (Array.isArray(appRes)) {
    appRes.forEach(a => { if (a.job_listing_id) appliedIds.add(a.job_listing_id); });
  } else if (appRes?.success && Array.isArray(appRes.data)) {
    appRes.data.forEach(a => { if (a.job_listing_id) appliedIds.add(a.job_listing_id); });
  }

  /* Counts */
  const topJobs = allJobs.filter(j => j.matchScore >= 71);
  container.querySelector('#all-count').textContent = allJobs.length;
  container.querySelector('#top-count').textContent = topJobs.length;

  /* Animate stats */
  function animateStats(jobs) {
    const skillSet = new Set();
    let totalScore = 0;
    let scoredCount = 0;
    jobs.forEach(j => {
      const s = j.matchScore ?? j.match_score;
      if (typeof s === 'number' && s > 0) {
        totalScore += s;
        scoredCount++;
      }
      (j.matchedSkills || j.matched_skills || []).forEach(sk => skillSet.add(sk));
    });
    animateNumber('stat-matches', jobs.length, '', 600);
    if (currentFilter === 'external') {
      const avgEl = container.querySelector('#stat-avg');
      if (avgEl) avgEl.textContent = 'Top';
    } else {
      animateNumber('stat-avg', scoredCount ? Math.round(totalScore / scoredCount) : 0, '%', 800);
    }
    animateNumber('stat-skills', skillSet.size, '', 700);
  }

  function animateNumber(id, target, suffix, duration) {
    const el = container.querySelector('#' + id);
    if (!el) return;
    const startTime = performance.now();
    function tick(now) {
      const p = Math.min((now - startTime) / duration, 1);
      const e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * e) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function getFilteredJobs() {
    if (currentFilter === 'external') {
      let jobs = Array.isArray(externalJobs) ? [...externalJobs] : [];
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        jobs = jobs.filter(j =>
          j.title.toLowerCase().includes(q) ||
          j.company.toLowerCase().includes(q) ||
          (j.skills || []).some(s => s.toLowerCase().includes(q))
        );
      }

      /* Advanced filters */
      if (filters.types.size > 0)
        jobs = jobs.filter(j => filters.types.has(j.type));
      if (filters.locations.size > 0)
        jobs = jobs.filter(j => filters.locations.has(j.location));
      // All external listings are Highly Recommended with no match percentage; minScore filter does not exclude them
      if (filters.minSalary > 0)
        jobs = jobs.filter(j => {
          const nums = (j.salary || '').match(/[\d,]+/g);
          if (!nums) return true;
          const maxVal = Math.max(...nums.map(n => parseInt(n.replace(/,/g, ''), 10)));
          return maxVal >= filters.minSalary;
        });
      if (filters.datePosted !== 'any') {
        const now = Date.now();
        const cutoffs = { today: 86400000, week: 604800000, month: 2592000000 };
        const cutoff = cutoffs[filters.datePosted];
        if (cutoff) jobs = jobs.filter(j => {
          if (!j.posted_date) return true;
          return (now - new Date(j.posted_date).getTime()) <= cutoff;
        });
      }

      if (currentSort === 'recent') {
        jobs.sort((a, b) => new Date(b.posted_date || 0) - new Date(a.posted_date || 0));
      }
      return jobs;
    }
    let jobs = currentFilter === 'top' ? allJobs.filter(j => j.matchScore >= 71) : [...allJobs];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      jobs = jobs.filter(j =>
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        j.skills.some(s => s.toLowerCase().includes(q))
      );
    }

    /* Advanced filters */
    if (filters.types.size > 0)
      jobs = jobs.filter(j => filters.types.has(j.type));
    if (filters.companies.size > 0)
      jobs = jobs.filter(j => filters.companies.has(j.company));
    if (filters.locations.size > 0)
      jobs = jobs.filter(j => filters.locations.has(j.location));
    if (filters.departments.size > 0)
      jobs = jobs.filter(j => j.department && filters.departments.has(j.department));
    if (filters.minScore > 0)
      jobs = jobs.filter(j => j.matchScore >= filters.minScore);
    if (filters.minSalary > 0)
      jobs = jobs.filter(j => {
        const nums = (j.salary || '').match(/[\d,]+/g);
        if (!nums) return true;
        const maxVal = Math.max(...nums.map(n => parseInt(n.replace(/,/g, ''), 10)));
        return maxVal >= filters.minSalary;
      });
    if (filters.datePosted !== 'any') {
      const now = Date.now();
      const cutoffs = { today: 86400000, week: 604800000, month: 2592000000 };
      const cutoff = cutoffs[filters.datePosted];
      if (cutoff) jobs = jobs.filter(j => {
        if (!j.rawDate) return true;
        return (now - new Date(j.rawDate).getTime()) <= cutoff;
      });
    }

    if (currentSort === 'match') {
      jobs.sort((a, b) => b.matchScore - a.matchScore);
    } else if (currentSort === 'recent') {
      jobs.sort((a, b) => new Date(b.rawDate || 0) - new Date(a.rawDate || 0));
    }
    return jobs;
  }

  function renderCards(animate = true) {
    const jobs = getFilteredJobs();
    if (animate) {
      cardsEl.classList.add('jm-grid--exit');
      setTimeout(() => { cardsEl.classList.remove('jm-grid--exit'); _insertCards(jobs); }, 200);
    } else {
      _insertCards(jobs);
    }
  }

  function _insertCards(jobs) {
    if (jobs.length === 0) {
      cardsEl.innerHTML = '';
      if (currentFilter === 'external') {
        emptyEl.innerHTML = `
          <div class="jm-empty__icon">${icon('externalLink', 48)}</div>
          <h3>No external jobs found</h3>
          <p style="margin-bottom:16px;">Try adding more technical skills to your profile or refresh below.</p>
          <button class="btn btn--primary btn--sm" id="ext-retry-btn">${icon('trendingUp',14)} Retry</button>`;
        emptyEl.style.display = 'flex';
        const retryBtn = emptyEl.querySelector('#ext-retry-btn');
        if (retryBtn) retryBtn.addEventListener('click', () => {
          externalJobs = null;
          fetchExternalJobs().then(() => renderCards(false));
        });
      } else {
        emptyEl.style.display = 'flex';
      }
      return;
    }
    emptyEl.style.display = 'none';
    if (currentFilter === 'external') {
      cardsEl.innerHTML = jobs.map((j, i) => externalCard(j, i)).join('');
    } else {
      cardsEl.innerHTML = jobs.map((j, i) => jobCard(j, i, appliedIds)).join('');
    }
    animateStats(jobs);
    observeRings();
    attachCardInteractions();
  }

  function observeRings() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.style.strokeDashoffset = e.target.style.getPropertyValue('--target-offset');
          observer.unobserve(e.target);
        }
      });
    }, { threshold: 0.3 });
    cardsEl.querySelectorAll('.jm-ring__fill').forEach(r => observer.observe(r));
  }

    function attachCardInteractions() {
    /* Card click opens detail modal */
    cardsEl.querySelectorAll('.jm-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('button') || e.target.closest('a') || e.target.closest('.jm-card__bookmark')) return;
        const jobId = card.dataset.jobId;
        const isExternal = card.classList.contains('jm-card--external');
        const job = isExternal
          ? (Array.isArray(externalJobs) ? externalJobs : []).find(j => String(j.id) === String(jobId))
          : allJobs.find(j => String(j.id) === String(jobId));
        if (job) {
          if (isExternal) {
            openSendResumeModal(job);
          } else {
            openJobDetailModal(job);
          }
        }
      });
    });

    /* Bookmark toggle */
    cardsEl.querySelectorAll('.jm-card__bookmark').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const saved = btn.dataset.saved === 'true';
        btn.dataset.saved = (!saved).toString();
        btn.classList.toggle('jm-card__bookmark--saved');
        btn.classList.add('jm-card__bookmark--bounce');
        setTimeout(() => btn.classList.remove('jm-card__bookmark--bounce'), 400);
      });
    });

    /* Hover chip animation */
    cardsEl.querySelectorAll('.jm-card').forEach(card => {
      card.addEventListener('mouseenter', () => {
        card.querySelectorAll('.jm-card__chip').forEach((chip, i) => {
          chip.style.transitionDelay = `${i * 40}ms`;
          chip.classList.add('jm-card__chip--visible');
        });
      });
    });

    /* Send Resume button (external jobs) */
    cardsEl.querySelectorAll('.jm-ext-send-resume').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const jobId = btn.dataset.jobId;
        const job   = (Array.isArray(externalJobs) ? externalJobs : []).find(j => String(j.id) === String(jobId));
        if (job) openSendResumeModal(job);
      });
    });

    /* Apply button */
    cardsEl.querySelectorAll('.jm-card__apply').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();

        if (isHired) {
          showToast('You are currently employed and cannot apply for another job.', 'warning');
          bannerSlot.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }

        const comp = getState('profileCompleteness');
        if (comp && !comp.is_complete) {
          const banner = container.querySelector('#profile-gate-banner');
          if (banner) {
            banner.classList.add('profile-gate-banner--shake');
            banner.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => banner.classList.remove('profile-gate-banner--shake'), 600);
          } else {
            showToast('Complete your profile before applying — go to My Portfolio.', 'warning');
          }
          return;
        }
        const jobId = btn.dataset.jobId;
        const job   = allJobs.find(j => String(j.id) === String(jobId));
        if (job) openApplyModal(job);
      });
    });
  }

  /* Job Detail modal */
  function openJobDetailModal(job) {
    const overlay = document.createElement('div');
    overlay.innerHTML = jobDetailModal(job, appliedIds.has(job.id));
    const el = overlay.firstElementChild;
    document.body.appendChild(el);

    const close = () => {
      el.classList.add('modal-overlay--exit');
      setTimeout(() => el.remove(), 200);
    };

    el.querySelector('#jd-close')?.addEventListener('click', close);
    el.querySelector('#jd-close-btn')?.addEventListener('click', close);
    el.addEventListener('click', (e) => { if (e.target === el) close(); });

    el.querySelector('#jd-apply-btn')?.addEventListener('click', () => {
      close();
      if (isHired) {
        showToast('You are currently employed and cannot apply for another job.', 'warning');
        bannerSlot.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      const comp = getState('profileCompleteness');
      if (comp && !comp.is_complete) {
        const banner = container.querySelector('#profile-gate-banner');
        if (banner) {
          banner.classList.add('profile-gate-banner--shake');
          banner.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(() => banner.classList.remove('profile-gate-banner--shake'), 600);
        } else {
          showToast('Complete your profile before applying — go to My Portfolio.', 'warning');
        }
        return;
      }
      openApplyModal(job);
    });
  }

  /* Apply modal */
  function openApplyModal(job) {
    const overlay = document.createElement('div');
    overlay.innerHTML = applyModal(job);
    const el = overlay.firstElementChild;
    document.body.appendChild(el);

    const close = () => {
      el.classList.add('modal-overlay--exit');
      setTimeout(() => el.remove(), 200);
    };

    el.querySelector('#apply-modal-close').addEventListener('click', close);
    el.querySelector('#apply-modal-cancel').addEventListener('click', close);
    el.addEventListener('click', (e) => { if (e.target === el) close(); });

    /* Character counter */
    const textarea   = el.querySelector('#apply-cover-letter');
    const charCount  = el.querySelector('#char-count');
    textarea.addEventListener('input', () => {
      const len = textarea.value.length;
      charCount.textContent = len;
      charCount.style.color = len > 500 ? 'var(--color-error)' : 'var(--text-tertiary)';
    });

    el.querySelector('#apply-modal-submit').addEventListener('click', async () => {
      const coverLetter = textarea.value.trim();
      if (coverLetter.length > 500) { showToast('Cover letter too long (max 500 characters).', 'warning'); return; }
      const submitBtn = el.querySelector('#apply-modal-submit');
      submitBtn.disabled = true;
      submitBtn.innerHTML = icon('clock', 14) + ' Sending…';

      const res = await apiPost(`/jobseeker/apply/${job.id}`, { cover_letter: coverLetter });

      if (res?.status === 409 || res?.message?.toLowerCase().includes('already')) {
        showToast('You have already applied for this job.', 'info');
        appliedIds.add(job.id);
        renderCards(false);
      } else if (res?.application || res?.message === 'Application sent.') {
        showToast('Application sent! Good luck! 🎉', 'success');
        appliedIds.add(job.id);
        renderCards(false);
      } else {
        showToast(res?.message || 'Something went wrong. Please try again.', 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = icon('send', 14) + ' Send Application';
        return;
      }
      close();
    });
  }

  /* Send Resume modal */
  function openSendResumeModal(job) {
    const overlay = document.createElement('div');
    overlay.innerHTML = sendResumeModal(job);
    const el = overlay.firstElementChild;
    document.body.appendChild(el);
    const close = () => {
      el.classList.add('modal-overlay--exit');
      setTimeout(() => el.remove(), 200);
    };
    el.querySelector('#send-resume-close').addEventListener('click', close);
    el.querySelector('#send-resume-cancel').addEventListener('click', close);
    el.addEventListener('click', (e) => { if (e.target === el) close(); });
  }

  /* Initial render */
  renderCards(false);

  /* ── Populate company filter from fetched jobs ── */
  const uniqueCompanies = [...new Set(allJobs.map(j => j.company))].sort();
  const companyOptionsEl = container.querySelector('#jf-company-options');
  if (companyOptionsEl) {
    companyOptionsEl.innerHTML = uniqueCompanies.map(c => `
      <div class="jf-multiselect__option" data-value="${c}">
        <div class="jf-multiselect__check-box">${icon('check', 10)}</div>
        <span class="jf-multiselect__opt-label">${c}</span>
      </div>
    `).join('');
  }
  const companyGroup = container.querySelector('#jf-company-group');

  /* ── Filter panel toggle ── */
  const filterToggle = container.querySelector('#jf-toggle');
  const filterPanel  = container.querySelector('#jf-panel');
  filterToggle.addEventListener('click', () => {
    const isOpen = filterPanel.classList.toggle('jf-panel--open');
    filterToggle.classList.toggle('jf-toggle--active', isOpen || getActiveFilterCount() > 0);
    filterToggle.setAttribute('aria-expanded', isOpen.toString());
  });

  container.querySelector('#jf-footer-close')?.addEventListener('click', () => {
    filterPanel.classList.remove('jf-panel--open');
    filterToggle.classList.toggle('jf-toggle--active', getActiveFilterCount() > 0);
    filterToggle.setAttribute('aria-expanded', 'false');
  });

  function getActiveFilterCount() {
    let count = filters.types.size + filters.companies.size + filters.locations.size + filters.departments.size;
    if (filters.datePosted !== 'any') count++;
    if (filters.minSalary > 0) count++;
    if (filters.minScore > 0) count++;
    return count;
  }

  function updateSliderFill(input, min, max, val) {
    const pct = ((val - min) / (max - min)) * 100;
    input.style.background = `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${pct}%, var(--border-subtle) ${pct}%, var(--border-subtle) 100%)`;
  }

  function updateActiveFilterTags() {
    const activeBar   = container.querySelector('#jf-active-bar');
    const tagsWrapper = container.querySelector('#jf-active-tags');
    const countEl     = container.querySelector('#jf-active-count');
    const footerCount = container.querySelector('#jf-footer-match-count');
    const statusPill  = container.querySelector('#jf-panel-status');
    const filteredJobs = getFilteredJobs();

    if (footerCount) {
      footerCount.textContent = `${filteredJobs.length} job${filteredJobs.length !== 1 ? 's' : ''} match your criteria`;
    }
    if (countEl) {
      countEl.textContent = `${filteredJobs.length} matching position${filteredJobs.length !== 1 ? 's' : ''}`;
    }

    const count = getActiveFilterCount() + (searchQuery ? 1 : 0);

    if (statusPill) {
      statusPill.textContent = count > 0 ? `${count} filter${count !== 1 ? 's' : ''} active` : 'No active filters';
      statusPill.classList.toggle('jf-panel__status-pill--active', count > 0);
    }

    if (count === 0) {
      activeBar.style.display = 'none';
      tagsWrapper.innerHTML = '';
      return;
    }

    activeBar.style.display = 'flex';
    let html = '';

    if (searchQuery) {
      html += `
        <span class="jf-active-tag">
          <span class="jf-active-tag__label">Search: "${searchQuery}"</span>
          <button class="jf-active-tag__remove" data-action="clear-search" title="Remove search">${icon('x', 12)}</button>
        </span>
      `;
    }

    filters.types.forEach(t => {
      html += `
        <span class="jf-active-tag">
          <span class="jf-active-tag__label">Type: ${t}</span>
          <button class="jf-active-tag__remove" data-action="remove-type" data-val="${t}" title="Remove ${t}">${icon('x', 12)}</button>
        </span>
      `;
    });

    filters.locations.forEach(l => {
      html += `
        <span class="jf-active-tag">
          <span class="jf-active-tag__label">Location: ${l}</span>
          <button class="jf-active-tag__remove" data-action="remove-loc" data-val="${l}" title="Remove ${l}">${icon('x', 12)}</button>
        </span>
      `;
    });

    filters.departments.forEach(d => {
      html += `
        <span class="jf-active-tag">
          <span class="jf-active-tag__label">Dept: ${d}</span>
          <button class="jf-active-tag__remove" data-action="remove-dept" data-val="${d}" title="Remove ${d}">${icon('x', 12)}</button>
        </span>
      `;
    });

    filters.companies.forEach(c => {
      html += `
        <span class="jf-active-tag">
          <span class="jf-active-tag__label">Company: ${c}</span>
          <button class="jf-active-tag__remove" data-action="remove-company" data-val="${c}" title="Remove ${c}">${icon('x', 12)}</button>
        </span>
      `;
    });

    if (filters.minScore > 0) {
      html += `
        <span class="jf-active-tag">
          <span class="jf-active-tag__label">Match: ≥${filters.minScore}%</span>
          <button class="jf-active-tag__remove" data-action="clear-score" title="Reset score filter">${icon('x', 12)}</button>
        </span>
      `;
    }

    if (filters.minSalary > 0) {
      html += `
        <span class="jf-active-tag">
          <span class="jf-active-tag__label">Min Salary: ₱${filters.minSalary.toLocaleString()}</span>
          <button class="jf-active-tag__remove" data-action="clear-salary" title="Reset salary filter">${icon('x', 12)}</button>
        </span>
      `;
    }

    if (filters.datePosted !== 'any') {
      const labels = { today: 'Today', week: 'Past 7 Days', month: 'Past Month' };
      html += `
        <span class="jf-active-tag">
          <span class="jf-active-tag__label">Posted: ${labels[filters.datePosted] || filters.datePosted}</span>
          <button class="jf-active-tag__remove" data-action="clear-date" title="Reset date filter">${icon('x', 12)}</button>
        </span>
      `;
    }

    tagsWrapper.innerHTML = html;
  }

  function updateQuickChips() {
    container.querySelectorAll('.jf-quick-chip').forEach(btn => {
      const q = btn.dataset.quick;
      let active = false;
      if (q === 'top-match') active = filters.minScore >= 75;
      else if (q === 'full-time') active = filters.types.has('Full-time');
      else if (q === 'remote') active = filters.types.has('Remote');
      else if (q === 'salary-30k') active = filters.minSalary >= 30000;
      else if (q === 'recent-week') active = filters.datePosted === 'week';
      btn.classList.toggle('jf-quick-chip--active', active);
    });
  }

  function updateFilterBadge() {
    const count = getActiveFilterCount();
    const badge = container.querySelector('#jf-badge');
    badge.textContent = count;
    badge.style.display = count > 0 ? 'inline-block' : 'none';
    filterToggle.classList.toggle('jf-toggle--active', count > 0 || filterPanel.classList.contains('jf-panel--open'));
    updateActiveFilterTags();
    updateQuickChips();
  }

  /* Active tag remove delegation */
  container.querySelector('#jf-active-bar')?.addEventListener('click', (e) => {
    const btn = e.target.closest('.jf-active-tag__remove');
    if (!btn) return;
    const action = btn.dataset.action;
    const val = btn.dataset.val;

    if (action === 'clear-search') {
      searchQuery = '';
      searchInput.value = '';
    } else if (action === 'remove-type') {
      filters.types.delete(val);
      container.querySelector(`.jf-pill[data-value="${CSS.escape(val)}"]`)?.classList.remove('jf-pill--active');
    } else if (action === 'remove-loc') {
      filters.locations.delete(val);
      locMs.updateSelection();
    } else if (action === 'remove-dept') {
      filters.departments.delete(val);
      deptMs.updateSelection();
    } else if (action === 'remove-company') {
      filters.companies.delete(val);
      compMs.updateSelection();
    } else if (action === 'clear-score') {
      filters.minScore = 0;
      scoreRange.value = 0;
      scoreVal.textContent = '0%';
      updateSliderFill(scoreRange, 0, 100, 0);
      container.querySelectorAll('.jf-preset-btn[data-target="score"]').forEach(b => b.classList.toggle('jf-preset-btn--active', b.dataset.value === '0'));
    } else if (action === 'clear-salary') {
      filters.minSalary = 0;
      salaryRange.value = 0;
      salaryVal.textContent = 'Any';
      updateSliderFill(salaryRange, 0, 100000, 0);
      container.querySelectorAll('.jf-preset-btn[data-target="salary"]').forEach(b => b.classList.toggle('jf-preset-btn--active', b.dataset.value === '0'));
    } else if (action === 'clear-date') {
      filters.datePosted = 'any';
      container.querySelectorAll('#jf-date-group .jf-segment-btn').forEach(b => b.classList.toggle('jf-segment-btn--active', b.dataset.value === 'any'));
    }

    updateFilterBadge();
    renderCards(false);
  });

  /* Active Bar Clear All & Panel Reset */
  const clearAllFilters = () => {
    filters.types.clear();
    filters.companies.clear();
    filters.locations.clear();
    filters.departments.clear();
    filters.minSalary = 0;
    filters.minScore = 0;
    filters.datePosted = 'any';
    searchQuery = '';
    searchInput.value = '';

    container.querySelectorAll('.jf-pill').forEach(l => l.classList.remove('jf-pill--active'));
    
    locMs?.clear();
    deptMs?.clear();
    compMs?.clear();

    container.querySelectorAll('#jf-date-group .jf-segment-btn').forEach(b => b.classList.toggle('jf-segment-btn--active', b.dataset.value === 'any'));
    
    salaryRange.value = 0;
    salaryVal.textContent = 'Any';
    updateSliderFill(salaryRange, 0, 100000, 0);
    container.querySelectorAll('.jf-preset-btn[data-target="salary"]').forEach(b => b.classList.toggle('jf-preset-btn--active', b.dataset.value === '0'));

    scoreRange.value = 0;
    scoreVal.textContent = '0%';
    updateSliderFill(scoreRange, 0, 100, 0);
    container.querySelectorAll('.jf-preset-btn[data-target="score"]').forEach(b => b.classList.toggle('jf-preset-btn--active', b.dataset.value === '0'));

    updateFilterBadge();
    renderCards(false);
  };

  container.querySelector('#jf-clear')?.addEventListener('click', clearAllFilters);
  container.querySelector('#jf-footer-reset')?.addEventListener('click', clearAllFilters);
  container.querySelector('#jf-active-clear')?.addEventListener('click', clearAllFilters);

  /* Quick filter chips */
  container.querySelector('#jf-quick-bar')?.addEventListener('click', (e) => {
    const chip = e.target.closest('.jf-quick-chip');
    if (!chip) return;
    const q = chip.dataset.quick;

    if (q === 'top-match') {
      filters.minScore = filters.minScore >= 71 ? 0 : 71;
      scoreRange.value = filters.minScore;
      scoreVal.textContent = filters.minScore > 0 ? filters.minScore + '%' : '0%';
      updateSliderFill(scoreRange, 0, 100, filters.minScore);
      container.querySelectorAll('.jf-preset-btn[data-target="score"]').forEach(b => b.classList.toggle('jf-preset-btn--active', parseInt(b.dataset.value, 10) === filters.minScore));
    } else if (q === 'full-time') {
      if (filters.types.has('Full-time')) filters.types.delete('Full-time');
      else filters.types.add('Full-time');
      container.querySelector('.jf-pill[data-value="Full-time"]')?.classList.toggle('jf-pill--active', filters.types.has('Full-time'));
    } else if (q === 'remote') {
      if (filters.types.has('Remote')) filters.types.delete('Remote');
      else filters.types.add('Remote');
      container.querySelector('.jf-pill[data-value="Remote"]')?.classList.toggle('jf-pill--active', filters.types.has('Remote'));
    } else if (q === 'salary-30k') {
      filters.minSalary = filters.minSalary >= 30000 ? 0 : 30000;
      salaryRange.value = filters.minSalary;
      salaryVal.textContent = filters.minSalary > 0 ? '₱' + filters.minSalary.toLocaleString() : 'Any';
      updateSliderFill(salaryRange, 0, 100000, filters.minSalary);
      container.querySelectorAll('.jf-preset-btn[data-target="salary"]').forEach(b => b.classList.toggle('jf-preset-btn--active', parseInt(b.dataset.value, 10) === filters.minSalary));
    } else if (q === 'recent-week') {
      filters.datePosted = filters.datePosted === 'week' ? 'any' : 'week';
      container.querySelectorAll('#jf-date-group .jf-segment-btn').forEach(b => b.classList.toggle('jf-segment-btn--active', b.dataset.value === filters.datePosted));
    }

    updateFilterBadge();
    renderCards(false);
  });

  /* Employment type pills */
  container.querySelectorAll('#jf-type-checks .jf-pill').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const val = btn.dataset.value;
      const isActive = btn.classList.toggle('jf-pill--active');
      if (isActive) filters.types.add(val);
      else filters.types.delete(val);
      updateFilterBadge();
      renderCards(false);
    });
  });

  /* Enhanced Multi-select helper */
  function initMultiSelect(triggerId, dropdownId, badgeId, filterSet, placeholder) {
    const trigger  = container.querySelector('#' + triggerId);
    const dropdown = container.querySelector('#' + dropdownId);
    const badge    = container.querySelector('#' + badgeId);
    const searchInput = dropdown?.querySelector('.jf-multiselect__search');
    const placeholderEl = trigger?.querySelector('.jf-multiselect__placeholder');

    trigger?.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = dropdown.classList.contains('jf-multiselect__dropdown--open');
      document.querySelectorAll('.jf-multiselect__dropdown--open').forEach(d => d.classList.remove('jf-multiselect__dropdown--open'));
      document.querySelectorAll('.jf-multiselect__trigger--active').forEach(t => t.classList.remove('jf-multiselect__trigger--active'));
      if (!isOpen) {
        dropdown.classList.add('jf-multiselect__dropdown--open');
        trigger.classList.add('jf-multiselect__trigger--active');
        searchInput?.focus();
      }
    });

    searchInput?.addEventListener('input', () => {
      const q = searchInput.value.toLowerCase();
      dropdown.querySelectorAll('.jf-multiselect__option').forEach(opt => {
        opt.style.display = opt.dataset.value.toLowerCase().includes(q) ? '' : 'none';
      });
    });

    function bindOptions() {
      dropdown.querySelectorAll('.jf-multiselect__option').forEach(opt => {
        opt.addEventListener('click', (e) => {
          e.stopPropagation();
          const val = opt.dataset.value;
          if (filterSet.has(val)) {
            filterSet.delete(val);
            opt.classList.remove('jf-multiselect__option--selected');
          } else {
            filterSet.add(val);
            opt.classList.add('jf-multiselect__option--selected');
          }
          updateDisplay();
          updateFilterBadge();
          renderCards(false);
        });
      });
    }

    function updateDisplay() {
      if (!placeholderEl) return;
      if (filterSet.size === 0) {
        placeholderEl.textContent = placeholder;
        placeholderEl.classList.remove('jf-multiselect__placeholder--has-value');
        if (badge) badge.style.display = 'none';
      } else {
        const first = [...filterSet][0];
        if (filterSet.size === 1) {
          placeholderEl.textContent = first;
        } else {
          placeholderEl.textContent = `${first} +${filterSet.size - 1} more`;
        }
        placeholderEl.classList.add('jf-multiselect__placeholder--has-value');
        if (badge) {
          badge.textContent = filterSet.size;
          badge.style.display = 'inline-flex';
        }
      }
    }

    function updateSelection() {
      dropdown.querySelectorAll('.jf-multiselect__option').forEach(opt => {
        opt.classList.toggle('jf-multiselect__option--selected', filterSet.has(opt.dataset.value));
      });
      updateDisplay();
    }

    function clear() {
      filterSet.clear();
      dropdown.querySelectorAll('.jf-multiselect__option--selected').forEach(o => o.classList.remove('jf-multiselect__option--selected'));
      updateDisplay();
    }

    bindOptions();
    return { bindOptions, updateDisplay, updateSelection, clear };
  }

  const locMs  = initMultiSelect('jf-loc-trigger', 'jf-loc-dropdown', 'jf-loc-badge', filters.locations, 'All Locations');
  const deptMs = initMultiSelect('jf-dept-trigger', 'jf-dept-dropdown', 'jf-dept-badge', filters.departments, 'All Departments');
  const compMs = initMultiSelect('jf-company-trigger', 'jf-company-dropdown', 'jf-company-badge', filters.companies, 'All Companies');

  /* Close multi-selects on outside click */
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.jf-multiselect')) {
      container.querySelectorAll('.jf-multiselect__dropdown--open').forEach(d => d.classList.remove('jf-multiselect__dropdown--open'));
      container.querySelectorAll('.jf-multiselect__trigger--active').forEach(t => t.classList.remove('jf-multiselect__trigger--active'));
    }
  });

  /* Salary range */
  const salaryRange = container.querySelector('#jf-salary');
  const salaryVal   = container.querySelector('#jf-salary-val');
  updateSliderFill(salaryRange, 0, 100000, 0);

  salaryRange.addEventListener('input', () => {
    const v = parseInt(salaryRange.value, 10);
    filters.minSalary = v;
    salaryVal.textContent = v > 0 ? '₱' + v.toLocaleString() : 'Any';
    updateSliderFill(salaryRange, 0, 100000, v);
    container.querySelectorAll('.jf-preset-btn[data-target="salary"]').forEach(b => {
      b.classList.toggle('jf-preset-btn--active', parseInt(b.dataset.value, 10) === v);
    });
    updateFilterBadge();
    renderCards(false);
  });

  /* Match score range */
  const scoreRange = container.querySelector('#jf-score');
  const scoreVal   = container.querySelector('#jf-score-val');
  updateSliderFill(scoreRange, 0, 100, 0);

  scoreRange.addEventListener('input', () => {
    const v = parseInt(scoreRange.value, 10);
    filters.minScore = v;
    scoreVal.textContent = v + '%';
    updateSliderFill(scoreRange, 0, 100, v);
    container.querySelectorAll('.jf-preset-btn[data-target="score"]').forEach(b => {
      b.classList.toggle('jf-preset-btn--active', parseInt(b.dataset.value, 10) === v);
    });
    updateFilterBadge();
    renderCards(false);
  });

  /* Slider presets */
  container.querySelectorAll('.jf-preset-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const target = btn.dataset.target;
      const val = parseInt(btn.dataset.value, 10);

      if (target === 'score') {
        filters.minScore = val;
        scoreRange.value = val;
        scoreVal.textContent = val + '%';
        updateSliderFill(scoreRange, 0, 100, val);
        container.querySelectorAll('.jf-preset-btn[data-target="score"]').forEach(b => b.classList.remove('jf-preset-btn--active'));
        btn.classList.add('jf-preset-btn--active');
      } else if (target === 'salary') {
        filters.minSalary = val;
        salaryRange.value = val;
        salaryVal.textContent = val > 0 ? '₱' + val.toLocaleString() : 'Any';
        updateSliderFill(salaryRange, 0, 100000, val);
        container.querySelectorAll('.jf-preset-btn[data-target="salary"]').forEach(b => b.classList.remove('jf-preset-btn--active'));
        btn.classList.add('jf-preset-btn--active');
      }

      updateFilterBadge();
      renderCards(false);
    });
  });

  /* Date posted segmented control */
  container.querySelector('#jf-date-group')?.addEventListener('click', (e) => {
    const btn = e.target.closest('.jf-segment-btn');
    if (!btn) return;
    container.querySelectorAll('#jf-date-group .jf-segment-btn').forEach(b => b.classList.remove('jf-segment-btn--active'));
    btn.classList.add('jf-segment-btn--active');
    filters.datePosted = btn.dataset.value;
    updateFilterBadge();
    renderCards(false);
  });

  /* Filter tabs */
  filterBar.addEventListener('click', async (e) => {
    const btn = e.target.closest('.jm-tabs__btn');
    if (!btn) return;
    const filter = btn.dataset.filter;
    if (filter === currentFilter) return;
    currentFilter = filter;
    
    // Hide company filter on external tab
    if (companyGroup) companyGroup.style.display = filter === 'external' ? 'none' : '';

    filterBar.querySelectorAll('.jm-tabs__btn').forEach(b => b.classList.remove('jm-tabs__btn--active'));
    btn.classList.add('jm-tabs__btn--active');

    if (filter === 'external' && externalJobs === null) {
      await fetchExternalJobs();
    }
    renderCards();
    updateFilterBadge();
  });

  /* Sort */
  sortBar.addEventListener('click', (e) => {
    const btn = e.target.closest('.jm-sort__btn');
    if (!btn) return;
    const sort = btn.dataset.sort;
    if (sort === currentSort) return;
    currentSort = sort;
    sortBar.querySelectorAll('.jm-sort__btn').forEach(b => b.classList.remove('jm-sort__btn--active'));
    btn.classList.add('jm-sort__btn--active');
    renderCards();
  });

  /* Search debounce */
  let searchTimer;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      searchQuery = searchInput.value.trim();
      updateFilterBadge();
      renderCards(false);
    }, 200);
  });

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); searchInput.focus(); }
    if (e.key === 'Escape') {
      container.querySelectorAll('.jf-multiselect__dropdown--open').forEach(d => d.classList.remove('jf-multiselect__dropdown--open'));
      container.querySelectorAll('.jf-multiselect__trigger--active').forEach(t => t.classList.remove('jf-multiselect__trigger--active'));
    }
  });

  updateFilterBadge();
}

