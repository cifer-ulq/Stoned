/**
 * CHMSU HireMe — Company Portal: Candidate Portfolio & Dossier View
 * Standalone applicant profile opened in a new tab by the company portal.
 * Exact mirror of the Student/Graduate My Portfolio page (main/src/pages/portfolio.js)
 * with interactive tabs (About, Resume, Projects, Achievements) and 1-Page ATS PDF download.
 */
import '../styles/reset.css';
import '../styles/variables.css';
import '../styles/base.css';
import '../styles/components.css';
import '../styles/portfolio.css';
import { icon } from '../components/icons.js';

const BASE  = 'http://localhost:8000/api';
const token = localStorage.getItem('hireme_token');

function storageUrl(path) {
  if (!path) return '';
  return path.startsWith('http') ? path : `http://localhost:8000${path}`;
}

async function apiFetch(path, options = {}) {
  const res = await fetch(BASE + path, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept:        'application/json',
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });
  return res.json();
}

// ── Shared Palette & Constants ───────────────────────────────────────────────

const projectGradients = [
  'linear-gradient(135deg,#005930,#10B981)',
  'linear-gradient(135deg,#4A6CF7,#6D8DFF)',
  'linear-gradient(135deg,#8B5CF6,#A78BFA)',
  'linear-gradient(135deg,#F59E0B,#FCD34D)',
  'linear-gradient(135deg,#0D9488,#14B8A6)',
  'linear-gradient(135deg,#EC4899,#F472B6)',
];

const typeColor = {
  OJT: 'accent',
  Freelance: 'success',
  Volunteer: 'warning',
  'Full-time': 'info',
  'Part-time': 'neutral',
};

const CATEGORY_META = {
  language:  { label: 'Languages',              emoji: '💻', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.12)' },
  framework: { label: 'Frameworks & Libraries', emoji: '🧩', color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.12)' },
  tool:      { label: 'Tools & Software',       emoji: '🔧', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.12)' },
  database:  { label: 'Databases',              emoji: '🗄️', color: '#06B6D4', bg: 'rgba(6, 182, 212, 0.12)' },
  other:     { label: 'Other Competencies',     emoji: '✨', color: '#EC4899', bg: 'rgba(236, 72, 153, 0.12)' },
};

const SKILL_LEVELS = [
  { key: 'beginner',     label: 'Beginner',     value: 25,  color: '#64748B' },
  { key: 'intermediate', label: 'Intermediate',  value: 50,  color: '#3B82F6' },
  { key: 'advanced',     label: 'Advanced',      value: 75,  color: '#8B5CF6' },
  { key: 'expert',       label: 'Expert',        value: 100, color: '#10B981' },
];

function skillLevelMeta(level) {
  const v = level ?? 50;
  if (v <= 25)  return SKILL_LEVELS[0];
  if (v <= 50)  return SKILL_LEVELS[1];
  if (v <= 75)  return SKILL_LEVELS[2];
  return SKILL_LEVELS[3];
}

function safeArray(val) {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) return parsed;
    } catch {}
    return val.split(',').map(s => s.trim()).filter(Boolean);
  }
  return [];
}

function groupSkillsForResume(skills) {
  if (!skills || skills.length === 0) return [];

  const catMap = {
    'Languages': [],
    'Frameworks & Libraries': [],
    'Databases & Backend': [],
    'Tools & Platforms': [],
    'Core Competencies': [],
  };

  const lowerCats = {
    frontend: 'Frameworks & Libraries',
    backend: 'Databases & Backend',
    database: 'Databases & Backend',
    databases: 'Databases & Backend',
    languages: 'Languages',
    programming: 'Languages',
    tools: 'Tools & Platforms',
    devops: 'Tools & Platforms',
    mobile: 'Frameworks & Libraries',
    cloud: 'Tools & Platforms',
    soft: 'Core Competencies',
    design: 'Core Competencies',
  };

  let hasCategorized = false;
  skills.forEach(s => {
    const rawCat = (s.category || '').toLowerCase();
    const mapped = lowerCats[rawCat];
    if (mapped) {
      catMap[mapped].push(s.name);
      hasCategorized = true;
    } else if (s.category && s.category !== 'General' && s.category !== 'Other') {
      if (!catMap[s.category]) catMap[s.category] = [];
      catMap[s.category].push(s.name);
      hasCategorized = true;
    }
  });

  if (hasCategorized) {
    const result = [];
    for (const [catName, list] of Object.entries(catMap)) {
      if (list.length > 0) {
        result.push({ label: catName, items: [...new Set(list)].join(', ') });
      }
    }
    const handled = new Set(result.flatMap(r => r.items.split(', ')));
    const unhandled = skills.filter(s => !handled.has(s.name)).map(s => s.name);
    if (unhandled.length > 0) {
      result.push({ label: 'Additional Skills', items: unhandled.join(', ') });
    }
    return result;
  }

  return [{ label: 'Technical & Domain Skills', items: skills.map(s => s.name).join(', ') }];
}

// ── Bootstrap ────────────────────────────────────────────────────────────────

const app = document.getElementById('app');

if (!token) {
  window.location.replace('../login/');
} else {
  const params   = new URLSearchParams(window.location.search);
  const userId   = params.get('student') || params.get('id');

  if (!userId) {
    renderError('No student or candidate ID specified in the URL.');
  } else {
    renderLoading();
    apiFetch(`/students/${userId}/public-profile`)
      .then(res => {
        if (!res?.success || !res?.data) {
          renderError(res?.message || 'Candidate not found or profile is unavailable.');
        } else {
          renderProfile(res.data, params);
        }
      })
      .catch(() => renderError('Network error. Please check your connection and try again.'));
  }
}

// ── Error & Loading States ───────────────────────────────────────────────────

function renderLoading() {
  app.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f8fafc;">
      <div style="text-align:center;padding:32px;">
        <div style="width:52px;height:52px;border-radius:50%;border:4px solid #005930;border-top-color:transparent;animation:sp-spin 0.8s linear infinite;margin:0 auto 18px;"></div>
        <p style="color:#334155;font-weight:700;font-size:1.05rem;margin:0 0 6px;">Loading Candidate Portfolio</p>
        <p style="color:#64748b;font-size:0.85rem;margin:0;">Fetching academic, project, and resume records from CHMSU HireMe…</p>
      </div>
    </div>
    <style>@keyframes sp-spin{to{transform:rotate(360deg)}}</style>`;
}

function renderError(msg) {
  app.innerHTML = `
    <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f8fafc;padding:24px;">
      <div style="text-align:center;padding:44px 32px;max-width:460px;background:#fff;border-radius:16px;border:1px solid #e2e8f0;box-shadow:0 12px 36px rgba(0,0,0,0.06);">
        <div style="width:68px;height:68px;border-radius:50%;background:rgba(239,68,68,0.1);display:flex;align-items:center;justify-content:center;margin:0 auto 20px;color:#ef4444;">
          ${icon('alertCircle', 32)}
        </div>
        <h2 style="font-size:1.35rem;font-weight:800;color:#0f172a;margin:0 0 10px;">Portfolio Unavailable</h2>
        <p style="color:#64748b;font-size:0.9rem;line-height:1.6;margin:0 0 24px;">${msg}</p>
        <div style="display:flex;gap:12px;justify-content:center;">
          <button onclick="window.close()" style="background:#005930;color:#fff;border:none;border-radius:8px;padding:10px 24px;font-size:0.88rem;font-weight:600;cursor:pointer;">
            Close Tab
          </button>
          <button onclick="window.location.reload()" style="background:#f1f5f9;color:#334155;border:1px solid #cbd5e1;border-radius:8px;padding:10px 20px;font-size:0.88rem;font-weight:600;cursor:pointer;">
            Retry
          </button>
        </div>
      </div>
    </div>`;
}

// ── Main Profile Renderer ────────────────────────────────────────────────────

function renderProfile(d, params) {
  const p          = d.profile || {};
  const name       = d.name   || 'Candidate';
  const email      = d.email  || '';
  const role       = d.role   || 'student';
  const initials   = name.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const program    = p.program || '';
  const yearLevel  = p.year_level || '';
  const headline   = p.headline  || program || 'CHMSU Candidate';
  const bio        = p.bio       || '';
  const location   = p.location  || '';
  const phone      = p.phone     || '';
  const campus     = p.campus    || '';
  const school     = p.school    || 'Carlos Hilado Memorial State University';
  const studentId  = p.student_id || '';
  const section    = p.section   || '';
  const githubUrl  = p.github_url   || '';
  const linkedinUrl= p.linkedin_url || '';
  const portfolioUrl = p.portfolio_url || '';
  const resumeObj  = p.resume_objective || '';
  const requirementsDriveUrl = p.requirements_drive_url || '';
  const avatarUrl  = p.avatar_url  ? storageUrl(p.avatar_url) : null;
  const skills       = Array.isArray(d.skills)       ? d.skills       : [];
  const education    = Array.isArray(d.education)    ? d.education    : [];
  const experience   = Array.isArray(d.experience)   ? d.experience   : [];
  const projects     = Array.isArray(d.projects)     ? d.projects     : [];
  const achievements = Array.isArray(d.achievements) ? d.achievements : [];

  // Parse contextual reviewer parameters
  const slotId     = params.get('slot') || params.get('slotId');
  const interestId = params.get('interest') || params.get('interestId');
  const jobId      = params.get('job') || params.get('jobId');
  const appId      = params.get('application') || params.get('appId');
  const isOjt      = (params.get('category') === 'ojt') || !!(slotId && interestId);
  const isJob      = (params.get('category') === 'job') || !!(jobId || appId);

  // Document Title
  document.title = `${name} — Portfolio | CHMSU HireMe`;

  // Avatar HTML
  const avatarHtml = avatarUrl
    ? `<img src="${avatarUrl}" alt="${name}" />`
    : `<span class="profile-hero__initials">${initials}</span>`;

  // Context snippet for reviewer bar
  let contextLabel = 'Candidate Portfolio Review';
  if (isOjt) {
    contextLabel = 'OJT Internship Applicant';
  } else if (isJob) {
    contextLabel = 'Job Opening Applicant';
  }

  // Links array
  const links = [];
  if (githubUrl)   links.push(`<a class="profile-social-chip" href="https://${githubUrl.replace(/^https?:\/\//, '')}" target="_blank" rel="noopener">${icon('github', 13)} GitHub</a>`);
  if (linkedinUrl) links.push(`<a class="profile-social-chip" href="https://${linkedinUrl.replace(/^https?:\/\//, '')}" target="_blank" rel="noopener">${icon('linkedin', 13)} LinkedIn</a>`);
  if (portfolioUrl)links.push(`<a class="profile-social-chip" href="https://${portfolioUrl.replace(/^https?:\/\//, '')}" target="_blank" rel="noopener">${icon('externalLink', 13)} Portfolio Website</a>`);
  if (requirementsDriveUrl) links.push(`<a class="profile-social-chip" href="${requirementsDriveUrl}" target="_blank" rel="noopener" style="color:#0284c7;border-color:rgba(2,132,199,0.3);background:rgba(2,132,199,0.06);font-weight:600;">${icon('folder', 13)} Requirements Drive</a>`);
  if (email)       links.push(`<a class="profile-social-chip" href="mailto:${email}">${icon('mail', 13)} ${email}</a>`);
  if (phone)       links.push(`<span class="profile-social-chip">${icon('phone', 13)} ${phone}</span>`);

  app.innerHTML = `
    <!-- Sticky Reviewer Context Bar -->
    <header class="sp-review-bar">
      <div class="sp-review-bar__inner">
        <div class="sp-review-bar__left">
          <span class="sp-review-bar__logo">
            ${icon('graduationCap', 14)} CHMSU HIREME
          </span>
          <span class="sp-review-bar__context">
            &bull; <span class="sp-review-bar__context-pill">${contextLabel}</span>
          </span>
        </div>
        <div class="sp-review-bar__actions">
          <button id="sp-btn-mark-viewed" class="sp-review-btn sp-review-btn--mark" title="Candidate profile officially inspected">
            ${icon('checkCircle', 14)} <span>Profile Inspected</span>
          </button>
          ${isOjt && slotId && interestId ? `
            <button id="sp-btn-review-proceed" class="sp-review-btn" style="background:#005930;color:#fff;border-color:#005930;font-weight:700;display:inline-flex;align-items:center;gap:6px;" title="Submit review note to proceed with coordinator endorsement">
              ${icon('fileText', 14)} <span>Submit Review Note</span>
            </button>
          ` : ''}
          <button onclick="window.close()" class="sp-review-btn sp-review-btn--secondary" title="Close this tab">
            ${icon('x', 14)} Close
          </button>
        </div>
      </div>
    </header>

    <!-- Main Portfolio Canvas -->
    <main class="portfolio-container">

      <!-- Executive Hero Card -->
      <div class="profile-hero">
        <div class="profile-hero__cover">
          <div class="profile-hero__cover-badge">
            <span class="pulse-dot"></span>
            ${isOjt ? `${icon('award', 13)} OJT Intern Candidate` : `${icon('shieldCheck', 13)} Verified CHMSU Candidate`}
          </div>
        </div>

        <div class="profile-hero__body">
          <div class="profile-hero__main">
            <div class="profile-hero__avatar-box">
              ${avatarHtml}
            </div>

            <div class="profile-hero__info">
              <div class="profile-hero__name-row">
                <h1 class="profile-hero__name">${name}</h1>
                <span class="profile-hero__verified-badge">
                  ${icon('checkCircle', 12)} Verified Student
                </span>
                ${isOjt ? `<span class="profile-hero__candidate-pill">${icon('award', 12)} Seeking OJT</span>` : ''}
              </div>

              <p class="profile-hero__headline">${headline}</p>

              <div class="profile-hero__meta-strip">
                ${location ? `<span class="profile-hero__meta-item">${icon('mapPin', 14)} <span>${location}</span></span>` : ''}
                ${program ? `<span class="profile-hero__meta-item">${icon('graduationCap', 14)} <span><strong>${program}</strong>${yearLevel ? ` (${yearLevel})` : ''}</span></span>` : ''}
                <span class="profile-hero__meta-item">${icon('bookOpen', 14)} <span>${school}${campus ? ` &middot; ${campus}` : ''}</span></span>
                ${studentId ? `<span class="profile-hero__meta-item">${icon('user', 14)} <span>ID: ${studentId}</span></span>` : ''}
              </div>
            </div>

            <div class="profile-hero__actions">
              <button class="profile-btn-primary" id="download-resume-top-btn" title="Download ATS Resume as PDF">
                ${icon('download', 15)} <span>Download Resume</span>
              </button>
              ${email ? `
                <a href="mailto:${email}?subject=CHMSU%20HireMe%20Candidate%20Inquiry%20-%20${encodeURIComponent(name)}" class="profile-btn-secondary" title="Email candidate directly">
                  ${icon('mail', 15)} <span>Email Candidate</span>
                </a>` : ''}
            </div>
          </div>

          ${links.length > 0 ? `
            <div class="profile-hero__footer">
              <div class="profile-hero__links-group">
                ${links.join('')}
              </div>
            </div>
          ` : ''}
        </div>
      </div>

      <!-- High-Level Metric Strip (4 Cards) -->
      <div class="profile-stats-strip">
        <div class="profile-stat-card" data-jump-tab="about" title="View skills matrix">
          <div class="profile-stat-card__icon">
            ${icon('checkCircle', 20)}
          </div>
          <div>
            <div class="profile-stat-card__val">${skills.length}</div>
            <div class="profile-stat-card__lbl">Verified Skills</div>
          </div>
        </div>

        <div class="profile-stat-card" data-jump-tab="about" title="View work experience">
          <div class="profile-stat-card__icon">
            ${icon('briefcase', 20)}
          </div>
          <div>
            <div class="profile-stat-card__val">${experience.length}</div>
            <div class="profile-stat-card__lbl">Experience Entries</div>
          </div>
        </div>

        <div class="profile-stat-card" data-jump-tab="projects" title="View showcase projects">
          <div class="profile-stat-card__icon">
            ${icon('layers', 20)}
          </div>
          <div>
            <div class="profile-stat-card__val">${projects.length}</div>
            <div class="profile-stat-card__lbl">Featured Projects</div>
          </div>
        </div>

        <div class="profile-stat-card" data-jump-tab="achievements" title="View credentials & honors">
          <div class="profile-stat-card__icon">
            ${icon('award', 20)}
          </div>
          <div>
            <div class="profile-stat-card__val">${achievements.length}</div>
            <div class="profile-stat-card__lbl">Honors & Certs</div>
          </div>
        </div>
      </div>

      <!-- Modern Segmented Tab Bar -->
      <div class="profile-tabs-nav" id="profile-tabs" role="tablist">
        <button class="profile-tab-btn active" data-tab="about">
          ${icon('user', 15)} <span>Overview &amp; About</span>
        </button>
        <button class="profile-tab-btn" data-tab="resume">
          ${icon('fileText', 15)} <span>ATS Resume (1-Page)</span>
        </button>
        <button class="profile-tab-btn" data-tab="projects">
          ${icon('layers', 15)} <span>Projects Showcase</span>
          <span class="profile-tab-counter">${projects.length}</span>
        </button>
        <button class="profile-tab-btn" data-tab="achievements">
          ${icon('award', 15)} <span>Certifications &amp; Honors</span>
          <span class="profile-tab-counter">${achievements.length}</span>
        </button>
      </div>

      <!-- Tab Content Area -->
      <div id="profile-tab-content"></div>

    </main>`;

  // ── Tab 1: About ─────────────────────────────────────────────────────────

  function renderAbout() {
    // Categorize skills
    const groups = { language: [], framework: [], tool: [], database: [], other: [] };
    skills.forEach(s => {
      const cat = (s.category || 'other').toLowerCase();
      if (groups[cat]) {
        groups[cat].push(s);
      } else {
        groups.other.push(s);
      }
    });

    const counts = { expert: 0, advanced: 0, intermediate: 0, beginner: 0 };
    skills.forEach(s => {
      const k = skillLevelMeta(s.level).key;
      counts[k] = (counts[k] || 0) + 1;
    });

    return `
      <!-- About Me / Bio Card -->
      <div class="profile-section">
        <div class="profile-section__header">
          <h3 class="profile-section__title">${icon('user', 18)} About Candidate</h3>
        </div>
        <p class="profile-section__bio">
          ${bio || '<span style="color:var(--text-tertiary);font-style:italic;">No personal biography provided yet.</span>'}
        </p>
        <div class="profile-contact-grid">
          ${email ? `<span class="contact-chip">${icon('mail', 13)} <a href="mailto:${email}" style="color:inherit;text-decoration:none;">${email}</a></span>` : ''}
          ${phone ? `<span class="contact-chip">${icon('phone', 13)} ${phone}</span>` : ''}
          ${location ? `<span class="contact-chip">${icon('mapPin', 13)} ${location}</span>` : ''}
          ${githubUrl ? `<a class="contact-chip contact-chip--link" href="https://${githubUrl.replace(/^https?:\/\//,'')}" target="_blank" rel="noopener">${icon('github', 13)} ${githubUrl}</a>` : ''}
          ${linkedinUrl ? `<a class="contact-chip contact-chip--link" href="https://${linkedinUrl.replace(/^https?:\/\//,'')}" target="_blank" rel="noopener">${icon('linkedin', 13)} ${linkedinUrl}</a>` : ''}
          ${requirementsDriveUrl ? `<a class="contact-chip contact-chip--link" href="${requirementsDriveUrl}" target="_blank" rel="noopener" style="color:#0284c7;border-color:rgba(2,132,199,0.3);background:rgba(2,132,199,0.06);">${icon('folder', 13)} OJT Requirements Drive</a>` : ''}
        </div>
      </div>

      ${requirementsDriveUrl ? `
      <!-- OJT Requirements Drive Section -->
      <div class="profile-section" style="border:1px solid rgba(2,132,199,0.25);background:linear-gradient(180deg, rgba(2,132,199,0.03) 0%, rgba(2,132,199,0.005) 100%);border-radius:12px;padding:20px;">
        <div class="profile-section__header" style="align-items:flex-start;">
          <div style="display:flex;align-items:flex-start;gap:12px;">
            <div style="width:38px;height:38px;border-radius:10px;background:rgba(2,132,199,0.12);color:#0284c7;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
              ${icon('folder', 20)}
            </div>
            <div>
              <h3 class="profile-section__title" style="margin:0;font-size:1.05rem;">OJT Requirements Drive</h3>
              <p style="font-size:0.8rem;color:var(--text-tertiary);margin:3px 0 0;line-height:1.4;">
                Uploaded requirements folder containing applicant OJT documents (medical certificate, waiver, endorsement forms, etc.).
              </p>
            </div>
          </div>
          <a href="${requirementsDriveUrl}" target="_blank" rel="noopener" class="profile-btn-primary" style="padding:6px 14px;font-size:0.8rem;gap:6px;text-decoration:none;white-space:nowrap;margin-left:auto;">
            ${icon('externalLink', 13)} <span>Open Drive Folder</span>
          </a>
        </div>
      </div>
      ` : ''}

      <!-- Experience Section -->
      <div class="profile-section">
        <div class="profile-section__header">
          <h3 class="profile-section__title">${icon('briefcase', 18)} Work & Internship Experience</h3>
        </div>
        <div class="profile-timeline">
          ${experience.length === 0 ? `
            <div class="empty-state">
              ${icon('briefcase', 32)}
              <p style="margin-top:6px;">No work or internship entries recorded yet.</p>
            </div>
          ` : experience.map(exp => `
            <div class="profile-timeline-item">
              <div class="profile-timeline-item__content">
                <div class="profile-timeline-item__header">
                  <div>
                    <h4 class="profile-timeline-item__title">${exp.title || exp.role}</h4>
                    <p class="profile-timeline-item__subtitle">
                      ${exp.company} &middot; <span class="badge badge--${typeColor[exp.type] || 'neutral'}">${exp.type || 'Internship'}</span>
                    </p>
                  </div>
                  <span class="profile-timeline-item__date">
                    ${exp.period_start || ''}${exp.period_start ? ' – ' : ''}${exp.is_current ? 'Present' : (exp.period_end || 'Present')}
                  </span>
                </div>
                ${exp.description ? `<p class="profile-timeline-item__desc">${exp.description}</p>` : ''}
                ${exp.location ? `<div style="font-size:0.76rem;color:var(--text-tertiary);margin-top:6px;">${icon('mapPin', 12)} ${exp.location}</div>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Education Section -->
      <div class="profile-section">
        <div class="profile-section__header">
          <h3 class="profile-section__title">${icon('bookOpen', 18)} Education History</h3>
        </div>
        <div class="profile-timeline">
          <!-- Pinned CHMSU record -->
          <div class="profile-timeline-item profile-timeline-item--pinned">
            <div class="profile-timeline-item__content">
              <div class="profile-timeline-item__header">
                <div>
                  <h4 class="profile-timeline-item__title">${school}</h4>
                  <p class="profile-timeline-item__subtitle">
                    ${[program, campus].filter(Boolean).join(' &mdash; ')}
                    ${section ? `<span style="color:var(--text-tertiary);font-size:0.8rem;margin-left:6px;">Section ${section}</span>` : ''}
                  </p>
                </div>
                <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;justify-content:flex-end;">
                  ${yearLevel ? `<span class="badge badge--accent">${yearLevel}</span>` : ''}
                  <span class="badge badge--info" style="background:linear-gradient(135deg,#4A6CF7,#6D8DFF);color:#fff;">Enrolled Student</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Other Education entries -->
          ${education.map(edu => `
            <div class="profile-timeline-item">
              <div class="profile-timeline-item__content">
                <div class="profile-timeline-item__header">
                  <div>
                    <h4 class="profile-timeline-item__title">${edu.school}</h4>
                    <p class="profile-timeline-item__subtitle">${edu.degree}</p>
                  </div>
                  <span class="profile-timeline-item__date">
                    ${edu.year_start || ''}${edu.year_start ? ' – ' : ''}${edu.is_current ? 'Present' : (edu.year_end || '')}
                  </span>
                </div>
                ${edu.description ? `<p class="profile-timeline-item__desc">${edu.description}</p>` : ''}
                ${edu.gpa ? `<div style="font-size:0.78rem;color:var(--color-primary);font-weight:700;margin-top:4px;">GPA / Academic Standing: ${edu.gpa}</div>` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Skills Matrix Section -->
      <div class="profile-section">
        <div class="skills-header">
          <div class="skills-header__left">
            <div class="skills-header__icon-box">
              ${icon('zap', 22)}
            </div>
            <div>
              <div class="skills-header__title-row">
                <h3 class="skills-header__title">Skills & Proficiencies</h3>
                ${skills.length > 0 ? `<span class="skills-header__total-badge">${skills.length}</span>` : ''}
              </div>
              <p class="skills-header__subtitle">Technical competencies and candidate-assessed proficiency ratings</p>
            </div>
          </div>
        </div>

        ${skills.length === 0 ? `
          <div class="empty-state">
            ${icon('zap', 32)}
            <p style="margin-top:6px;">No specific skills recorded for this candidate yet.</p>
          </div>
        ` : `
          <!-- Stats Summary Banner -->
          <div class="skills-stats-banner">
            <div class="skills-stat-pill">
              <span class="skills-stat-pill__dot"></span>
              <span style="color:var(--text-secondary);">Total:</span>
              <span class="skills-stat-pill__count">${skills.length}</span>
            </div>
            ${counts.expert > 0 ? `
              <div class="skills-stat-pill skills-stat-pill--expert">
                <span class="skills-stat-pill__dot"></span>
                <span style="color:var(--text-secondary);">Expert:</span>
                <span class="skills-stat-pill__count">${counts.expert}</span>
              </div>` : ''}
            ${counts.advanced > 0 ? `
              <div class="skills-stat-pill skills-stat-pill--advanced">
                <span class="skills-stat-pill__dot"></span>
                <span style="color:var(--text-secondary);">Advanced:</span>
                <span class="skills-stat-pill__count">${counts.advanced}</span>
              </div>` : ''}
            ${counts.intermediate > 0 ? `
              <div class="skills-stat-pill skills-stat-pill--intermediate">
                <span class="skills-stat-pill__dot"></span>
                <span style="color:var(--text-secondary);">Intermediate:</span>
                <span class="skills-stat-pill__count">${counts.intermediate}</span>
              </div>` : ''}
            ${counts.beginner > 0 ? `
              <div class="skills-stat-pill skills-stat-pill--beginner">
                <span class="skills-stat-pill__dot"></span>
                <span style="color:var(--text-secondary);">Beginner:</span>
                <span class="skills-stat-pill__count">${counts.beginner}</span>
              </div>` : ''}
          </div>

          <!-- Categories Grid -->
          <div class="skills-categories-grid">
            ${Object.entries(CATEGORY_META)
              .filter(([cat]) => groups[cat]?.length > 0)
              .map(([cat, meta]) => `
                <div class="skill-category-card">
                  <div class="skill-category-card__header">
                    <div class="skill-category-card__badge" style="background:${meta.bg};color:${meta.color};">
                      <span>${meta.emoji}</span>
                    </div>
                    <h4 class="skill-category-card__title">${meta.label}</h4>
                    <span class="skill-category-card__count">${groups[cat].length}</span>
                  </div>
                  <div class="skill-category-card__list">
                    ${groups[cat].map(s => {
                      const lvl = skillLevelMeta(s.level);
                      return `
                        <div class="skill-item-card">
                          <div class="skill-item-card__main">
                            <span class="skill-item-card__name">${s.name}</span>
                            <div class="skill-level-badge skill-level-badge--${lvl.key}">
                              <span class="skill-level-badge__dot"></span>
                              <span class="skill-level-badge__text">${lvl.label}</span>
                              <span class="skill-level-meter" title="${lvl.label} (${lvl.value}%)">
                                <span class="skill-meter-bar ${lvl.value >= 25 ? 'skill-meter-bar--active' : ''}"></span>
                                <span class="skill-meter-bar ${lvl.value >= 50 ? 'skill-meter-bar--active' : ''}"></span>
                                <span class="skill-meter-bar ${lvl.value >= 75 ? 'skill-meter-bar--active' : ''}"></span>
                                <span class="skill-meter-bar ${lvl.value >= 100 ? 'skill-meter-bar--active' : ''}"></span>
                              </span>
                            </div>
                          </div>
                        </div>`;
                    }).join('')}
                  </div>
                </div>
              `).join('')}
          </div>
        `}
      </div>
    `;
  }

  // ── Tab 2: Resume (1-Page ATS Standard Canvas & Download) ─────────────────

  function renderResume() {
    const objText = resumeObj || bio || 'Dedicated and goal-driven candidate eager to apply technical skills and professional competencies in dynamic environments.';

    // Single-line contact details
    const contacts = [];
    if (phone) contacts.push(`<span>${phone}</span>`);
    if (email) contacts.push(`<a href="mailto:${email}">${email}</a>`);
    if (location) contacts.push(`<span>${location}</span>`);
    if (linkedinUrl) {
      const clean = linkedinUrl.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
      contacts.push(`<a href="https://${clean}" target="_blank" rel="noopener">linkedin.com/${clean.replace(/^linkedin\.com\//, '')}</a>`);
    }
    if (githubUrl) {
      const clean = githubUrl.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
      contacts.push(`<a href="https://${clean}" target="_blank" rel="noopener">github.com/${clean.replace(/^github\.com\//, '')}</a>`);
    }
    if (portfolioUrl) {
      const clean = portfolioUrl.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
      contacts.push(`<a href="https://${clean}" target="_blank" rel="noopener">${clean}</a>`);
    }

    // Education
    let eduList = education;
    if ((!eduList || eduList.length === 0) && program) {
      eduList = [{
        school: school,
        degree: program,
        period: yearLevel ? `${yearLevel} &middot; Expected Graduation` : 'Undergraduate',
        gpa: '',
        description: '',
      }];
    }

    // Top 2-3 projects
    const featured = projects.filter(p => p.is_featured);
    const resumeProjects = (featured.length >= 2 ? featured : projects).slice(0, 3);

    // Grouped skills
    const skillGroups = groupSkillsForResume(skills);

    return `
      <!-- Top Action Toolbar -->
      <div class="resume-toolbar">
        <div class="resume-toolbar__info">
          <span class="resume-toolbar__tag">${icon('fileText', 13)} 1-Page Standard</span>
          <span class="resume-toolbar__desc">Executive single-page ATS-ready format</span>
        </div>
        <div class="resume-toolbar__actions">
          <button class="resume-action-btn" id="view-resume-btn">
            ${icon('eye', 14)} Fullscreen / Print
          </button>
          <button class="resume-download-btn" id="download-resume-btn">
            ${icon('download', 14)} Download PDF
          </button>
        </div>
      </div>

      <!-- Printable 1-Page Document Paper Canvas -->
      <div class="resume-paper-wrap">
        <div class="resume-card resume-card--onepage" id="resume-card">

          <!-- Executive Header -->
          <div class="resume-doc-header">
            <h1 class="resume-doc-name">${name}</h1>
            <p class="resume-doc-headline">${headline}</p>
            <div class="resume-contact-bar">
              ${contacts.join('<span class="resume-sep">&bull;</span>')}
            </div>
          </div>

          <!-- Professional Summary / Objective -->
          <div class="resume-section">
            <div class="resume-section__title">Professional Summary</div>
            <p class="resume-section__text">${objText}</p>
          </div>

          <!-- Education -->
          ${eduList && eduList.length > 0 ? `
            <div class="resume-section">
              <div class="resume-section__title">Education</div>
              ${eduList.map(e => `
                <div class="resume-entry">
                  <div class="resume-entry__header">
                    <div class="resume-entry__title-group">
                      <strong class="resume-entry__title">${e.degree || 'Bachelor of Science'}</strong>
                      <span class="resume-entry__sub">&mdash; ${e.school}</span>
                      ${e.gpa ? `<span class="resume-entry__gpa">&middot; GPA: ${e.gpa}</span>` : ''}
                    </div>
                    <span class="resume-entry__date">
                      ${e.year_start || ''}${e.year_start ? ' – ' : ''}${e.is_current ? 'Present' : (e.year_end || (e.period || ''))}
                    </span>
                  </div>
                  ${e.description ? `<p class="resume-entry__desc">${e.description}</p>` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}

          <!-- Experience / Internships -->
          ${experience.length > 0 ? `
            <div class="resume-section">
              <div class="resume-section__title">Experience & Internships</div>
              ${experience.slice(0, 3).map(e => {
                const eSkills = safeArray(e.skills);
                return `
                  <div class="resume-entry">
                    <div class="resume-entry__header">
                      <div class="resume-entry__title-group">
                        <strong class="resume-entry__title">${e.title || e.role}</strong>
                        <span class="resume-entry__sub">&mdash; ${e.company}${e.type ? ` (${e.type})` : ''}</span>
                      </div>
                      <span class="resume-entry__date">
                        ${e.period_start || ''}${e.period_start ? ' – ' : ''}${e.is_current ? 'Present' : (e.period_end || 'Present')}
                      </span>
                    </div>
                    ${e.description ? `<p class="resume-entry__desc">${e.description}</p>` : ''}
                    ${eSkills.length ? `<p class="resume-entry__meta"><strong>Key Tools:</strong> ${eSkills.join(', ')}</p>` : ''}
                  </div>`;
              }).join('')}
            </div>
          ` : ''}

          <!-- Projects -->
          ${resumeProjects.length > 0 ? `
            <div class="resume-section">
              <div class="resume-section__title">Technical Projects</div>
              ${resumeProjects.map(p => {
                const tech = safeArray(p.tech_stack);
                return `
                  <div class="resume-entry">
                    <div class="resume-entry__header">
                      <div class="resume-entry__title-group">
                        <strong class="resume-entry__title">${p.title}</strong>
                        ${p.role ? `<span class="resume-entry__sub">&mdash; ${p.role}</span>` : ''}
                        <span class="resume-entry__links">
                          ${p.project_url ? `<a href="${p.project_url}" target="_blank" rel="noopener">[Demo]</a>` : ''}
                          ${p.github_url || p.repo_url ? `<a href="${p.github_url || p.repo_url}" target="_blank" rel="noopener">[Code]</a>` : ''}
                        </span>
                      </div>
                      <span class="resume-entry__date">${p.date_completed || ''}</span>
                    </div>
                    ${p.description ? `<p class="resume-entry__desc">${p.description}</p>` : ''}
                    ${p.outcomes ? `<p class="resume-entry__outcome"><strong>Outcome:</strong> ${p.outcomes}</p>` : ''}
                    ${tech.length ? `<p class="resume-entry__meta"><strong>Technologies:</strong> ${tech.join(', ')}</p>` : ''}
                  </div>`;
              }).join('')}
            </div>
          ` : ''}

          <!-- Technical Skills (Categorized Inline) -->
          ${skillGroups.length > 0 ? `
            <div class="resume-section">
              <div class="resume-section__title">Technical Skills</div>
              <div class="resume-skills-grid">
                ${skillGroups.map(g => `
                  <div class="resume-skill-row">
                    <span class="resume-skill-label">${g.label}:</span>
                    <span class="resume-skill-text">${g.items}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <!-- Honors & Certifications -->
          ${achievements.length > 0 ? `
            <div class="resume-section">
              <div class="resume-section__title">Honors & Certifications</div>
              ${achievements.slice(0, 4).map(a => `
                <div class="resume-entry">
                  <div class="resume-entry__header">
                    <div class="resume-entry__title-group">
                      <strong class="resume-entry__title">${a.title}</strong>
                      ${a.issuer ? `<span class="resume-entry__sub">&mdash; ${a.issuer}</span>` : ''}
                      ${a.award_level ? `<span class="resume-entry__badge">${a.award_level}</span>` : ''}
                      ${a.credential_id ? `<span class="resume-entry__cred">ID: ${a.credential_id}</span>` : ''}
                      ${a.credential_url ? `<a href="${a.credential_url}" target="_blank" rel="noopener" class="resume-entry__verify">[Verify]</a>` : ''}
                    </div>
                    <span class="resume-entry__date">${a.date || a.date_awarded || ''}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : ''}

        </div>
      </div>
    `;
  }

  // ── Tab 3: Projects ──────────────────────────────────────────────────────

  function renderProjects() {
    if (projects.length === 0) {
      return `
        <div class="profile-section empty-state">
          ${icon('layers', 36)}
          <h4 style="font-size:1.1rem;font-weight:800;color:var(--text-primary);margin:10px 0 4px;">No Portfolio Projects Yet</h4>
          <p style="font-size:0.85rem;color:var(--text-secondary);margin:0;">The candidate has not yet showcased any academic capstones, hackathon submissions, or personal projects.</p>
        </div>
      `;
    }

    return `
      <div class="works-gallery">
        ${projects.map((p, i) => {
          const cat = p.category || 'Project Showcase';
          const role = p.role || 'Developer';
          const grad = projectGradients[i % projectGradients.length];
          const tech = safeArray(p.tech_stack);

          return `
            <div class="work-card">
              <div class="work-card__preview">
                ${p.thumbnail_url || p.image_url ? `
                  <img src="${storageUrl(p.thumbnail_url || p.image_url)}" alt="${p.title}" class="work-card__thumb" />
                ` : `
                  <div class="work-card__banner-placeholder" style="background:${grad};">
                    ${icon('folder', 32)}
                    <span style="font-size:0.75rem;font-weight:700;letter-spacing:0.04em;">PORTFOLIO DELIVERABLE</span>
                  </div>
                `}
                <span class="work-card__cat-pill">${cat}</span>
                ${p.is_featured ? `<span class="work-card__featured-badge">${icon('star', 11)} Featured</span>` : ''}
              </div>

              <div class="work-card__body">
                <div class="work-card__header-row">
                  <h3 class="work-card__title">${p.title}</h3>
                </div>

                <div class="work-card__meta">
                  <span class="work-card__role-pill">${role}</span>
                  ${p.date_completed ? `<span>&middot; ${p.date_completed}</span>` : ''}
                </div>

                <p class="work-card__desc">${p.description || 'No description provided.'}</p>

                ${p.outcomes ? `
                  <div class="work-card__outcomes-box">
                    <strong>Measurable Outcome:</strong> ${p.outcomes}
                  </div>
                ` : ''}

                ${tech.length ? `
                  <div class="work-card__tech-stack">
                    ${tech.map(t => `<span class="work-card__tech-tag">${t}</span>`).join('')}
                  </div>
                ` : ''}

                <div class="work-card__footer">
                  ${p.project_url ? `
                    <a href="${p.project_url}" target="_blank" rel="noopener" class="work-card__link">
                      ${icon('externalLink', 13)} <span>Live Demo</span>
                    </a>
                  ` : ''}
                  ${p.github_url || p.repo_url ? `
                    <a href="${p.github_url || p.repo_url}" target="_blank" rel="noopener" class="work-card__link">
                      ${icon('github', 13)} <span>Source Code</span>
                    </a>
                  ` : ''}
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  // ── Tab 4: Achievements ──────────────────────────────────────────────────

  function renderAchievements() {
    if (achievements.length === 0) {
      return `
        <div class="profile-section empty-state">
          ${icon('award', 36)}
          <h4 style="font-size:1.1rem;font-weight:800;color:var(--text-primary);margin:10px 0 4px;">No Achievements Listed</h4>
          <p style="font-size:0.85rem;color:var(--text-secondary);margin:0;">No verified certifications, awards, or honors currently uploaded.</p>
        </div>
      `;
    }

    return `
      <div class="achievements-gallery">
        ${achievements.map(a => `
          <div class="achievement-card">
            <div class="achievement-card__cat-bar"></div>
            <div class="achievement-card__body">
              <h3 class="achievement-card__title">${a.title}</h3>

              <div class="achievement-card__pill-row">
                ${a.award_level ? `<span class="achievement-card__distinction-badge">${icon('award', 12)} ${a.award_level}</span>` : ''}
                ${a.category || a.type ? `<span class="achievement-card__distinction-badge" style="color:#d97706;background:rgba(245,158,11,0.1);border-color:rgba(245,158,11,0.25);">${a.category || a.type}</span>` : ''}
                ${a.credential_id ? `<span class="achievement-card__id-chip">ID: ${a.credential_id}</span>` : ''}
              </div>

              ${a.description ? `<p class="achievement-card__desc">${a.description}</p>` : ''}

              <div class="achievement-card__meta-row">
                ${a.issuer ? `<span>Issued by <strong>${a.issuer}</strong></span>` : ''}
                ${a.date || a.date_awarded ? `<span>&bull; ${a.date || a.date_awarded}</span>` : ''}
              </div>

              <div class="achievement-card__proof-bar">
                <span class="achievement-card__proof-status">
                  ${icon('checkCircle', 13)} Verified Credential
                </span>
                <div style="display:flex;gap:6px;">
                  ${a.credential_url ? `
                    <a href="${a.credential_url}" target="_blank" rel="noopener" class="cert-proof-btn">
                      ${icon('externalLink', 12)} Verify Link
                    </a>
                  ` : ''}
                  ${a.certificate_url ? `
                    <button type="button" class="cert-proof-btn view-cert-btn" data-ach-id="${a.id}">
                      ${icon('shieldCheck', 12)} View Document
                    </button>
                  ` : ''}
                </div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // ── Certificate Lightbox Viewer Modal ─────────────────────────────────────

  function openCertificateViewer(ach) {
    const existing = document.getElementById('cert-viewer-overlay');
    if (existing) existing.remove();

    const isPdf = ach.certificate_url?.toLowerCase().endsWith('.pdf');
    const fullUrl = storageUrl(ach.certificate_url);

    const overlay = document.createElement('div');
    overlay.id = 'cert-viewer-overlay';
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-box" role="dialog" aria-modal="true">
        <div class="pfm-header">
          <div class="pfm-header-left">
            <div class="pfm-icon-box" style="background:linear-gradient(135deg,#005930,#10B981);">
              ${icon('shieldCheck', 20)}
            </div>
            <div>
              <h3 class="pfm-title">${ach.title}</h3>
              <p class="pfm-subtitle">${ach.issuer || 'Official Credential'}${ach.credential_id ? ` &middot; ID: ${ach.credential_id}` : ''}</p>
            </div>
          </div>
          <button class="pfm-close-btn" id="viewer-close-btn" aria-label="Close">${icon('x', 18)}</button>
        </div>

        <div style="flex:1;overflow:auto;padding:20px;background:#0d1117;display:flex;align-items:center;justify-content:center;min-height:360px;">
          ${isPdf ? `
            <div style="text-align:center;color:#fff;padding:32px;">
              <div style="font-size:3.5rem;margin-bottom:12px;">📄</div>
              <h4 style="color:#fff;margin:0 0 6px;font-size:1.1rem;">Official PDF Certificate</h4>
              <p style="color:#94a3b8;font-size:0.85rem;margin-bottom:18px;">Authentic credential document stored in PDF format.</p>
              <a href="${fullUrl}" target="_blank" rel="noopener" class="profile-btn profile-btn--primary" style="display:inline-flex;">
                ${icon('download', 14)} Open / Download PDF Document
              </a>
            </div>
          ` : `
            <img src="${fullUrl}" alt="${ach.title}" style="max-width:100%;max-height:68vh;object-fit:contain;border-radius:8px;box-shadow:0 8px 30px rgba(0,0,0,0.5);" />
          `}
        </div>

        <div class="pfm-footer">
          <div style="font-size:0.75rem;color:var(--text-secondary);">
            ${ach.award_level ? `Distinction: <strong>${ach.award_level}</strong>` : 'Verified Portfolio Document'}
          </div>
          <div style="display:flex;gap:8px;">
            ${ach.credential_url ? `
              <a href="${ach.credential_url}" target="_blank" rel="noopener" class="cert-proof-btn">
                ${icon('externalLink', 12)} Issuer Verification
              </a>` : ''}
            <a href="${fullUrl}" target="_blank" rel="noopener" download class="cert-proof-btn" style="background:var(--color-primary);color:#fff;border-color:var(--color-primary);">
              ${icon('download', 12)} Download
            </a>
            <button type="button" class="cert-proof-btn" id="viewer-close-footer">Close</button>
          </div>
        </div>
      </div>`;

    document.body.appendChild(overlay);

    const close = () => overlay.remove();
    overlay.querySelector('#viewer-close-btn').onclick = close;
    overlay.querySelector('#viewer-close-footer').onclick = close;
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  }

  // ── Tab Switching & Wiring ────────────────────────────────────────────────

  const tabContainer = document.getElementById('profile-tab-content');
  const tabRenderers = {
    about: renderAbout,
    resume: renderResume,
    projects: renderProjects,
    achievements: renderAchievements,
  };

  function switchTab(name) {
    document.querySelectorAll('.profile-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === name);
    });

    if (tabRenderers[name]) {
      tabContainer.innerHTML = tabRenderers[name]();
    }

    // Attach sub-handlers
    if (name === 'resume') {
      wireResumeHandlers();
    } else if (name === 'achievements') {
      wireAchievementHandlers();
    }
  }

  // Wire main tabs
  document.querySelectorAll('.profile-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Wire stat cards jump to tabs
  document.querySelectorAll('.profile-stat-card').forEach(card => {
    card.addEventListener('click', () => {
      const targetTab = card.dataset.jumpTab;
      if (targetTab) {
        switchTab(targetTab);
        document.getElementById('profile-tabs')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Top header "Download Resume" button jumps to Resume tab & triggers download
  document.getElementById('download-resume-top-btn')?.addEventListener('click', () => {
    switchTab('resume');
    setTimeout(() => {
      document.getElementById('download-resume-btn')?.click();
    }, 250);
  });

  // Initial tab: About
  switchTab('about');

  // ── Resume Handlers (Download PDF + Fullscreen Print) ──────────────────────

  function wireResumeHandlers() {
    const downloadBtn = document.getElementById('download-resume-btn');
    const viewBtn     = document.getElementById('view-resume-btn');
    const card        = document.getElementById('resume-card');

    // Download PDF with html2pdf.js
    if (downloadBtn && card) {
      downloadBtn.addEventListener('click', async () => {
        downloadBtn.disabled = true;
        downloadBtn.innerHTML = `${icon('loader', 14)} <span>Generating PDF…</span>`;

        try {
          const html2pdfMod = await import('html2pdf.js');
          const html2pdf    = html2pdfMod.default || html2pdfMod;

          const safeName = (name || 'Candidate_Resume')
            .replace(/[^a-zA-Z0-9 _-]/g, '')
            .trim()
            .replace(/\s+/g, '_');

          card.classList.add('resume-card--exporting');

          await html2pdf()
            .set({
              margin:      [8, 10, 8, 10],
              filename:    `Resume_${safeName}.pdf`,
              image:       { type: 'jpeg', quality: 0.98 },
              html2canvas: { scale: 2, useCORS: true, backgroundColor: '#ffffff', letterRendering: true },
              jsPDF:       { unit: 'mm', format: 'a4', orientation: 'portrait' },
              pagebreak:   { mode: ['avoid-all', 'css', 'legacy'] },
            })
            .from(card)
            .save();

          card.classList.remove('resume-card--exporting');
        } catch (err) {
          console.error('html2pdf error:', err);
          card.classList.remove('resume-card--exporting');
          // Fallback to window.print
          window.print();
        } finally {
          downloadBtn.disabled = false;
          downloadBtn.innerHTML = `${icon('download', 14)} <span>Download PDF</span>`;
        }
      });
    }

    // Fullscreen / Print preview
    if (viewBtn && card) {
      viewBtn.addEventListener('click', () => {
        const styles = Array.from(document.styleSheets)
          .map(ss => {
            try { return Array.from(ss.cssRules).map(r => r.cssText).join('\n'); }
            catch { return ''; }
          })
          .join('\n');

        const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Resume — ${name}</title>
  <style>
    ${styles}
    @page { size: A4 portrait; margin: 8mm 10mm; }
    html, body { background: #525659; margin: 0; padding: 20px 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
    .print-bar { max-width: 800px; margin: 0 auto 16px; display: flex; justify-content: space-between; align-items: center; padding: 10px 18px; background: #1e293b; color: #fff; border-radius: 8px; font-size: 13px; box-shadow: 0 4px 12px rgba(0,0,0,0.25); }
    .print-btn { background: #005930; color: #fff; border: none; padding: 7px 16px; border-radius: 6px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; font-size: 13px; }
    .print-btn:hover { background: #00733e; }
    .resume-card { box-shadow: 0 4px 20px rgba(0,0,0,0.3) !important; border: none !important; width: 800px; min-height: 1120px; margin: 0 auto; background: #fff !important; }
    @media print {
      html, body { background: #fff !important; padding: 0 !important; }
      .print-bar { display: none !important; }
      .resume-card { box-shadow: none !important; border: none !important; width: 100% !important; min-height: 0 !important; margin: 0 !important; padding: 0 !important; }
    }
  </style>
</head>
<body>
  <div class="print-bar">
    <span><strong>1-Page Executive Resume</strong> &mdash; A4 Print Preview (${name})</span>
    <button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
  </div>
  ${card.outerHTML}
</body>
</html>`;

        const blob = new Blob([html], { type: 'text/html' });
        const url  = URL.createObjectURL(blob);
        const win  = window.open(url, '_blank');
        if (win) win.focus();
      });
    }
  }

  // ── Achievement Certificate Viewer Wiring ─────────────────────────────────

  function wireAchievementHandlers() {
    document.querySelectorAll('.view-cert-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const achId = btn.dataset.achId;
        const targetAch = achievements.find(a => String(a.id) === String(achId));
        if (targetAch) {
          openCertificateViewer(targetAch);
        }
      });
    });
  }

  // ── Auto-mark profile as inspected on load ────────────────────────────────
  (async () => {
    try {
      if (isOjt && slotId && interestId) {
        await apiFetch(`/company/ojt-postings/${slotId}/mark-viewed/${interestId}`, { method: 'POST' });
      } else if (isJob && appId) {
        await apiFetch(`/company/applications/${appId}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ status: 'reviewed' }),
        });
      }
      if (markBtn) {
        markBtn.innerHTML = `${icon('checkCircle', 14)} <span>Profile Inspected</span>`;
        markBtn.disabled = true;
      }
    } catch (e) {
      console.warn('Auto mark viewed:', e);
    }
  })();

  // ── Reviewer "Mark as Reviewed" Action ────────────────────────────────────
  const markBtn = document.getElementById('sp-btn-mark-viewed');
  if (markBtn) {
    markBtn.addEventListener('click', async () => {
      markBtn.disabled = true;
      markBtn.innerHTML = `${icon('loader', 14)} <span>Updating…</span>`;

      let success = false;
      try {
        if (isOjt && slotId && interestId) {
          const res = await apiFetch(`/company/ojt-postings/${slotId}/mark-viewed/${interestId}`, {
            method: 'POST',
          });
          success = res?.success !== false;
        } else if (isJob && appId) {
          const res = await apiFetch(`/company/applications/${appId}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status: 'reviewed' }),
          });
          success = res?.success !== false;
        } else {
          success = true;
        }
      } catch {
        success = true;
      }

      if (success) {
        markBtn.innerHTML = `${icon('checkCircle', 14)} <span>Profile Inspected</span>`;
        markBtn.disabled = true;
      } else {
        markBtn.disabled = false;
        markBtn.innerHTML = `${icon('checkCircle', 14)} <span>Mark as Reviewed</span>`;
      }
    });
  }

  // ── Reviewer "Submit Review Note" Modal Action ─────────────────────────────
  const reviewProceedBtn = document.getElementById('sp-btn-review-proceed');
  if (reviewProceedBtn) {
    reviewProceedBtn.addEventListener('click', () => {
      const modal = document.createElement('div');
      modal.className = 'modal-backdrop modal-backdrop--visible';
      modal.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,0.7);z-index:99999;display:flex;align-items:center;justify-content:center;padding:16px;';

      modal.innerHTML = `
        <div style="background:#fff;border-radius:14px;max-width:480px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,0.3);overflow:hidden;animation:fadeIn 0.2s ease;">
          <div style="padding:18px 22px;border-bottom:1px solid #e2e8f0;display:flex;align-items:center;justify-content:space-between;background:#f8fafc;">
            <div style="display:flex;align-items:center;gap:10px;">
              <div style="width:36px;height:36px;border-radius:8px;background:rgba(0,89,48,0.1);color:#005930;display:flex;align-items:center;justify-content:center;">${icon('fileText', 18)}</div>
              <div>
                <h3 style="margin:0;font-size:1.05rem;font-weight:700;color:#0f172a;">Submit Review Note</h3>
                <p style="margin:2px 0 0;font-size:0.78rem;color:#64748b;">${name} &bull; OJT Applicant</p>
              </div>
            </div>
            <button id="sp-note-close" style="background:none;border:none;color:#64748b;cursor:pointer;padding:4px;">${icon('x', 18)}</button>
          </div>
          <div style="padding:22px;">
            <div style="background:rgba(0,89,48,0.06);border:1px solid rgba(0,89,48,0.2);border-radius:8px;padding:12px 14px;margin-bottom:16px;font-size:0.8rem;color:#005930;line-height:1.45;">
              ${icon('checkCircle', 14)} <strong>Profile Inspected!</strong> Submitting this review note marks the candidate as reviewed and notifies the OJT Coordinator to prepare the endorsement letter.
            </div>
            <div style="margin-bottom:14px;">
              <label style="display:block;font-size:0.8rem;font-weight:700;color:#334155;margin-bottom:6px;">Review Note / Message for Student <span style="color:#ef4444;">*</span></label>
              <textarea id="sp-note-text" style="width:100%;box-sizing:border-box;border:1px solid #cbd5e1;border-radius:8px;padding:10px 12px;font-size:0.85rem;line-height:1.5;min-height:90px;resize:vertical;" placeholder="e.g. We have reviewed your profile and portfolio and would like to proceed with your application.">We have reviewed your profile and portfolio and would like to proceed with your application.</textarea>
              <p id="sp-note-err" style="color:#ef4444;font-size:0.78rem;margin:4px 0 0;display:none;"></p>
            </div>
          </div>
          <div style="padding:14px 22px;background:#f8fafc;border-top:1px solid #e2e8f0;display:flex;justify-content:flex-end;gap:10px;">
            <button id="sp-note-cancel" style="padding:8px 16px;border-radius:6px;border:1px solid #cbd5e1;background:#fff;color:#334155;font-weight:600;font-size:0.84rem;cursor:pointer;">Cancel</button>
            <button id="sp-note-submit" style="padding:8px 18px;border-radius:6px;border:none;background:#005930;color:#fff;font-weight:700;font-size:0.84rem;cursor:pointer;display:inline-flex;align-items:center;gap:6px;">${icon('checkCircle', 14)} Confirm &amp; Submit</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      const closeModal = () => modal.remove();
      modal.querySelector('#sp-note-close').addEventListener('click', closeModal);
      modal.querySelector('#sp-note-cancel').addEventListener('click', closeModal);
      modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

      modal.querySelector('#sp-note-submit').addEventListener('click', async () => {
        const note = modal.querySelector('#sp-note-text').value.trim();
        const err = modal.querySelector('#sp-note-err');
        if (!note || note.length < 5) {
          err.textContent = 'Please enter a note of at least 5 characters.';
          err.style.display = 'block';
          return;
        }
        const submitBtn = modal.querySelector('#sp-note-submit');
        submitBtn.disabled = true;
        submitBtn.innerHTML = `${icon('loader', 14)} Processing…`;
        err.style.display = 'none';

        try {
          const res = await apiFetch(`/company/ojt-postings/${slotId}/accept/${interestId}`, {
            method: 'POST',
            body: JSON.stringify({ company_note: note }),
          });

          if (res?.success) {
            closeModal();
            reviewProceedBtn.disabled = true;
            reviewProceedBtn.style.background = '#10b981';
            reviewProceedBtn.style.borderColor = '#10b981';
            reviewProceedBtn.innerHTML = `${icon('checkCircle', 14)} <span>Candidate Reviewed</span>`;
            alert('Student application reviewed successfully! The OJT Coordinator will be notified to process the endorsement.');
          } else {
            err.textContent = res?.message || 'Failed to submit review note.';
            err.style.display = 'block';
            submitBtn.disabled = false;
            submitBtn.innerHTML = `${icon('checkCircle', 14)} Confirm &amp; Submit`;
          }
        } catch {
          err.textContent = 'Network error. Please try again.';
          err.style.display = 'block';
          submitBtn.disabled = false;
          submitBtn.innerHTML = `${icon('checkCircle', 14)} Confirm &amp; Submit`;
        }
      });
    });
  }
}
