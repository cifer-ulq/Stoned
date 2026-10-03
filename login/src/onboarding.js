/**
 * CHMSU HireMe — Onboarding Wizard (Role-First Dynamic Flow) v2
 * Two-panel layout — professional redesign
 *   Student:   Role → Academic Info → Photo
 *   Graduate:  Role → Graduate Profile → Photo
 */

import './styles/variables.css';
import './styles/reset.css';
import './styles/login.css';
import './styles/onboarding.css';
import { icon } from './icons.js';

/* ── Year constants ── */
const CURRENT_YEAR = new Date().getFullYear();
const AUTO_BATCH   = `${CURRENT_YEAR}-${CURRENT_YEAR + 1}`;

/* ── SVG shorthand ── */
const svg = {
  graduationCap: icon('briefcase', 24),
  shield: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  building: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>`,
  mapPin: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`,
  sparkle: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>`,
  camera: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>`,
  check: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  arrowRight: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>`,
  arrowLeft: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>`,
};

/* ── Theme ── */
const savedTheme = localStorage.getItem('hireme-theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);

/* ── State ── */
let currentStep = 0;
let direction = 1;

const formData = {
  userType: '',
  avatar: null,
  // Student
  school: 'Carlos Hilado Memorial State University',
  campus: '',
  program: 'Bachelor of Science in Information Technology',
  yearLevel: '4th Year',
  section: '',
  batch: AUTO_BATCH,
  studentId: '',
  // Graduate
  graduateYearGraduated: '',
  graduateCampus: '',
  graduateCourse: '',
  graduateSection: '',
  graduateEmploymentStatus: ''
};

/* ── Per-role step definitions ── */
const ROLE_STEPS = {
  student:  ['role', 'student-info', 'photo'],
  graduate: ['role', 'graduate-info', 'photo'],
};

const STEP_META = {
  'role':         { label: 'Role',    name: 'Choose Role' },
  'student-info': { label: 'Details', name: 'Academic Info' },
  'graduate-info':{ label: 'Details', name: 'Graduate Profile' },
  'photo':        { label: 'Photo',   name: 'Profile Photo' },
};

function getSteps() {
  if (!formData.userType) return ['role'];
  return ROLE_STEPS[formData.userType] || ['role'];
}
function getCurrentStepId() { return getSteps()[currentStep] || 'role'; }
function getTotalSteps() { return getSteps().length; }

/* ── User types ── */
const userTypes = [
  {
    id: 'student',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>`,
    title: 'Student',
    subtitle: 'Currently enrolled',
    desc: 'Build your portfolio, find OJT placements, and track your academic journey.',
    color: '#4A6CF7',
    gradient: 'linear-gradient(135deg, #4A6CF7 0%, #6D8DFF 100%)',
    tags: ['OJT Tracking', 'Portfolio', 'Academic'],
  },
  {
    id: 'graduate',
    icon: svg.sparkle,
    title: 'Graduate',
    subtitle: 'Alumni & job seekers',
    desc: 'Discover career opportunities, track your applications, and launch your professional life.',
    color: '#10B981',
    gradient: 'linear-gradient(135deg, #059669 0%, #34D399 100%)',
    tags: ['Job Search', 'Career', 'Applications'],
  },
];

/* ══════════════════════════════════════
   FLOATING PARTICLES BACKGROUND
   ══════════════════════════════════════ */
function createParticles() {
  const existing = document.getElementById('ob-particles');
  if (existing) return;

  const canvas = document.createElement('canvas');
  canvas.id = 'ob-particles';
  canvas.className = 'ob-particles';
  document.body.prepend(canvas);

  const ctx = canvas.getContext('2d');
  let w, h, particles;
  const count = 40;

  function resize() { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; }

  function init() {
    resize();
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      r: Math.random() * 2.5 + 1,
      dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4,
      opacity: Math.random() * 0.4 + 0.1,
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    const color = '74, 108, 247';
    particles.forEach((p, i) => {
      p.x += p.dx; p.y += p.dy;
      if (p.x < 0 || p.x > w) p.dx *= -1;
      if (p.y < 0 || p.y > h) p.dy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${color}, ${p.opacity})`;
      ctx.fill();
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j];
        const dist = Math.hypot(p.x - q.x, p.y - q.y);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(${color}, ${0.06 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    });
    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  init();
  draw();
}

/* ══════════════════════════════════════
   CONFETTI
   ══════════════════════════════════════ */
function launchConfetti() {
  const colors = ['#4A6CF7', '#8B5CF6', '#06b6d4', '#f59e0b', '#34C759', '#FF6B6B'];
  const container = document.createElement('div');
  container.className = 'ob-confetti';
  document.body.appendChild(container);
  for (let i = 0; i < 80; i++) {
    const piece = document.createElement('div');
    piece.className = 'ob-confetti__piece';
    piece.style.setProperty('--x', `${(Math.random() - 0.5) * 600}px`);
    piece.style.setProperty('--y', `${-Math.random() * 500 - 200}px`);
    piece.style.setProperty('--r', `${Math.random() * 720 - 360}deg`);
    piece.style.setProperty('--d', `${Math.random() * 0.6 + 0.4}s`);
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.width = `${Math.random() * 8 + 4}px`;
    piece.style.height = `${Math.random() * 4 + 2}px`;
    container.appendChild(piece);
  }
  setTimeout(() => container.remove(), 3000);
}

/* ══════════════════════════════════════
   RENDER
   ══════════════════════════════════════ */
const app = document.getElementById('app');

function render(animate = true) {
  const slideClass = animate
    ? (direction > 0 ? 'ob-slide-in-right' : 'ob-slide-in-left')
    : '';
  const steps = getSteps();
  const total = getTotalSteps();
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

  app.innerHTML = `
    <div class="ob-page">
      <div class="ob-bg-orb ob-bg-orb--1"></div>
      <div class="ob-bg-orb ob-bg-orb--2"></div>
      <div class="ob-card">

        <!-- ═══ LEFT PANEL ═══ -->
        <aside class="ob-panel">
          <div class="ob-panel__logo">
            <div class="ob-panel__logo-icon">H</div>
            <span class="ob-panel__logo-text">HireMe</span>
          </div>
          <nav class="ob-panel__steps">
            ${steps.map((stepId, i) => {
              const meta  = STEP_META[stepId] || { label: stepId, name: stepId };
              const state = i < currentStep ? 'done' : i === currentStep ? 'active' : 'upcoming';
              return `
                <div class="ob-panel__step ob-panel__step--${state}">
                  <div class="ob-panel__step-dot">
                    ${state === 'done' ? svg.check : `<span>${i + 1}</span>`}
                  </div>
                  <div class="ob-panel__step-info">
                    <div class="ob-panel__step-num">Step ${i + 1}</div>
                    <div class="ob-panel__step-name">${meta.name}</div>
                  </div>
                </div>
              `;
            }).join('')}
          </nav>
          <div class="ob-panel__footer">
            <p>CHMSU HireMe — your career journey starts here.</p>
          </div>
        </aside>

        <!-- ═══ RIGHT MAIN ═══ -->
        <main class="ob-main">
          <div class="ob-main__topbar">
            <span class="ob-main__step-badge">Step ${currentStep + 1} of ${total}</span>
            <button class="ob-theme-toggle" id="theme-toggle" aria-label="Toggle theme">
              ${isDark ? icon('sun', 16) : icon('moon', 16)}
            </button>
          </div>
          <div class="ob-main__body">
            <div class="ob-step-wrapper ${slideClass}" id="step-wrapper">
              ${renderStepContent()}
            </div>
          </div>
          <div class="ob-main__footer">
            ${renderNavButtons(total)}
          </div>
        </main>

      </div>
    </div>
  `;

  attachEvents();
  createParticles();
}

/* ── Step Content Router ── */
function renderStepContent() {
  const stepId = getCurrentStepId();
  switch (stepId) {
    case 'role':          return renderRoleSelect();
    case 'student-info':  return renderStudentInfo();
    case 'graduate-info': return renderGraduateInfo();
    case 'photo':         return renderPhoto();
    default:              return '';
  }
}

/* ═══════════════════════════════════════
   STEP RENDERERS
   ═══════════════════════════════════════ */

/* ── Role Selection ── */
function renderRoleSelect() {
  return `
    <div class="ob-step" data-step="role">
      <div class="ob-step__header">
        <h2 class="ob-step__title ob-reveal">How will you use HireMe?</h2>
        <p class="ob-step__subtitle ob-reveal" style="--delay:.06s">
          Pick your role — this shapes your entire experience.
        </p>
      </div>
      <div class="ob-roles" id="roles-grid">
        ${userTypes.map((role, i) => `
          <button class="ob-role ${formData.userType === role.id ? 'ob-role--selected' : ''}"
            data-role="${role.id}" type="button"
            style="--delay:${0.08 + 0.09 * i}s;--role-color:${role.color};--role-gradient:${role.gradient}">
            <div class="ob-role__glow"></div>
            <div class="ob-role__icon-wrap">
              <div class="ob-role__icon">${role.icon}</div>
            </div>
            <div class="ob-role__body">
              <div class="ob-role__header-row">
                <div class="ob-role__title-group">
                  <h3 class="ob-role__title">${role.title}</h3>
                  <span class="ob-role__subtitle">${role.subtitle}</span>
                </div>
                <div class="ob-role__radio"><div class="ob-role__radio-dot"></div></div>
              </div>
              <p class="ob-role__desc">${role.desc}</p>
              <div class="ob-role__tags">
                ${role.tags.map(t => `<span class="ob-role__tag">${t}</span>`).join('')}
              </div>
            </div>
          </button>
        `).join('')}
      </div>
    </div>
  `;
}

/* ── Student Academic Info ── */
function renderStudentInfo() {
  return `
    <div class="ob-step" data-step="student-info">
      <div class="ob-step__header">
        <h2 class="ob-step__title ob-reveal">Your Academic Profile</h2>
        <p class="ob-step__subtitle ob-reveal" style="--delay:.06s">Tell us about your current studies at CHMSU.</p>
      </div>
      <div class="ob-form ob-form--grid">

        <div class="ob-field ob-field--full ob-reveal" style="--delay:.10s">
          <div class="ob-field__input-wrap">
            <span class="ob-field__icon">${icon('briefcase', 16)}</span>
            <input class="ob-field__input" type="text" id="school" placeholder=" " value="${formData.school}" />
            <label class="ob-field__label" for="school">School / University</label>
          </div>
        </div>

        <div class="ob-field ob-field--full ob-reveal" style="--delay:.14s">
          <div class="ob-picker">
            <span class="ob-picker__label">Campus</span>
            <div class="ob-picker__grid ob-picker__grid--2">
              ${['Talisay Campus','Binalbagan Campus','Alijis Campus','Fortune Towne Campus'].map(c => `
                <button type="button" class="ob-picker__opt ${formData.campus === c ? 'ob-picker__opt--on' : ''}" data-pick="campus" data-val="${c}">
                  <span class="ob-picker__opt-check">${svg.check}</span>
                  <span class="ob-picker__opt-text">${c}</span>
                </button>`).join('')}
            </div>
            <input type="hidden" id="campus" value="${formData.campus}">
          </div>
        </div>

        <div class="ob-field ob-reveal" style="--delay:.18s">
          <div class="ob-field__input-wrap ob-field__input-wrap--accent">
            <span class="ob-field__icon">${icon('award', 16)}</span>
            <input class="ob-field__input" type="text" id="year-level" value="4th Year" readonly />
            <label class="ob-field__label ob-field__label--float" for="year-level">Year Level</label>
            <span class="ob-field__badge">Fixed</span>
          </div>
        </div>

        <div class="ob-field ob-reveal" style="--delay:.22s">
          <div class="ob-field__input-wrap">
            <span class="ob-field__icon">${icon('hash', 16)}</span>
            <input class="ob-field__input" type="text" id="section" placeholder=" " value="${formData.section}" />
            <label class="ob-field__label" for="section">Section</label>
          </div>
        </div>

        <div class="ob-field ob-field--full ob-reveal" style="--delay:.26s">
          <div class="ob-field__input-wrap ob-field__input-wrap--accent">
            <span class="ob-field__icon">${icon('briefcase', 16)}</span>
            <input class="ob-field__input" type="text" id="program" value="Bachelor of Science in Information Technology" readonly />
            <label class="ob-field__label ob-field__label--float" for="program">Program</label>
            <span class="ob-field__badge">Fixed</span>
          </div>
        </div>

        <div class="ob-field ob-reveal" style="--delay:.30s">
          <div class="ob-field__input-wrap ob-field__input-wrap--accent">
            <span class="ob-field__icon">${icon('target', 16)}</span>
            <input class="ob-field__input" type="text" id="batch" placeholder=" " value="${formData.batch}" />
            <label class="ob-field__label" for="batch">School Year (Batch)</label>
            <span class="ob-field__badge">Auto-filled</span>
          </div>
        </div>

        <div class="ob-field ob-field--full ob-reveal" style="--delay:.34s">
          <div class="ob-field__input-wrap">
            <span class="ob-field__icon">${icon('hash', 16)}</span>
            <input class="ob-field__input" type="text" id="student-id" placeholder=" " value="${formData.studentId}" />
            <label class="ob-field__label" for="student-id">Student ID <span class="ob-field__optional">(optional)</span></label>
          </div>
        </div>

      </div>
    </div>
  `;
}

/* ── Graduate Profile ── */
function renderGraduateInfo() {
  const empOptions = [
    { id: 'looking',    label: 'Looking for Work',     emoji: '🔍' },
    { id: 'employed',   label: 'Employed',             emoji: '💼' },
    { id: 'freelance',  label: 'Freelancing',          emoji: '💻' },
    { id: 'studying',   label: 'Continuing Studies',   emoji: '📚' },
  ];
  const years = Array.from({ length: 11 }, (_, i) => {
    const start = CURRENT_YEAR - i;
    return { value: `${start}-${start + 1}`, label: `${start} - ${start + 1}` };
  });
  return `
    <div class="ob-step" data-step="graduate-info">
      <div class="ob-step__header">
        <h2 class="ob-step__title ob-reveal">Your Graduate Profile</h2>
        <p class="ob-step__subtitle ob-reveal" style="--delay:.06s">Help us personalise your job-matching experience.</p>
      </div>
      <div class="ob-form ob-form--grid">

        <div class="ob-field ob-reveal" style="--delay:.10s">
          <div class="ob-field__input-wrap ob-field__select-wrap">
            <span class="ob-field__icon">${icon('target', 16)}</span>
            <select class="ob-field__input ob-field__select" id="graduate-year">
              <option value="" disabled ${!formData.graduateYearGraduated ? 'selected' : ''}></option>
              ${years.map(y => `<option value="${y.value}" ${formData.graduateYearGraduated === y.value ? 'selected' : ''}>${y.label}</option>`).join('')}
            </select>
            <label class="ob-field__label ob-field__label--select" for="graduate-year">Year Graduated</label>
          </div>
        </div>

        <div class="ob-field ob-field--full ob-reveal" style="--delay:.14s">
          <div class="ob-picker">
            <span class="ob-picker__label">Campus</span>
            <div class="ob-picker__grid ob-picker__grid--2">
              ${['Talisay Campus','Binalbagan Campus','Alijis Campus','Fortune Towne Campus'].map(c => `
                <button type="button" class="ob-picker__opt ${formData.graduateCampus === c ? 'ob-picker__opt--on' : ''}" data-pick="graduate-campus" data-val="${c}">
                  <span class="ob-picker__opt-check">${svg.check}</span>
                  <span class="ob-picker__opt-text">${c}</span>
                </button>`).join('')}
            </div>
            <input type="hidden" id="graduate-campus" value="${formData.graduateCampus}">
          </div>
        </div>

        <div class="ob-field ob-field--full ob-reveal" style="--delay:.18s">
          <div class="ob-picker">
            <span class="ob-picker__label">Course / Program</span>
            <div class="ob-picker__grid ob-picker__grid--2 ob-picker__grid--prog">
              ${['Bachelor of Science in Information Technology','Bachelor of Science in Industrial Technology','Bachelor of Science in Information Systems','Bachelor of Science in Computer Engineering'].map(p => `
                <button type="button" class="ob-picker__opt ${formData.graduateCourse === p ? 'ob-picker__opt--on' : ''}" data-pick="graduate-course" data-val="${p}">
                  <span class="ob-picker__opt-check">${svg.check}</span>
                  <span class="ob-picker__opt-text">${p}</span>
                </button>`).join('')}
            </div>
            <input type="hidden" id="graduate-course" value="${formData.graduateCourse}">
          </div>
        </div>

        <div class="ob-field ob-reveal" style="--delay:.22s">
          <div class="ob-field__input-wrap">
            <span class="ob-field__icon">${icon('hash', 16)}</span>
            <input class="ob-field__input" type="text" id="graduate-section" placeholder=" " value="${formData.graduateSection}" />
            <label class="ob-field__label" for="graduate-section">Section</label>
          </div>
        </div>

        <div class="ob-field ob-field--full ob-reveal" style="--delay:.26s">
          <span class="ob-field__section-label">Current Status</span>
          <div class="ob-emp-grid" id="emp-grid">
            ${empOptions.map((opt, i) => `
              <button class="ob-emp-btn ${formData.graduateEmploymentStatus === opt.id ? 'ob-emp-btn--active' : ''}"
                data-emp="${opt.id}" type="button" style="--delay:${0.04 * i}s">
                <span class="ob-emp-btn__emoji">${opt.emoji}</span>
                <span class="ob-emp-btn__label">${opt.label}</span>
                <span class="ob-emp-btn__tick">${svg.check}</span>
              </button>
            `).join('')}
          </div>
        </div>

      </div>
    </div>
  `;
}

/* ── Photo Upload ── */
function renderPhoto() {
  return `
    <div class="ob-step" data-step="photo">
      <div class="ob-step__header">
        <h2 class="ob-step__title ob-reveal">Add a profile photo</h2>
        <p class="ob-step__subtitle ob-reveal" style="--delay:.06s">A photo helps others recognise you — you can skip this for now.</p>
      </div>
      <div class="ob-avatar ob-reveal" style="--delay:.2s">
        <div class="ob-avatar__ring" id="avatar-preview">
          <div class="ob-avatar__inner">
            ${formData.avatar
              ? `<img src="${formData.avatar}" alt="Avatar" />`
              : `<span class="ob-avatar__placeholder">${svg.camera}</span>`}
          </div>
          <svg class="ob-avatar__orbit" viewBox="0 0 140 140">
            <circle cx="70" cy="70" r="66" fill="none" stroke="url(#orbit-grad)" stroke-width="2" stroke-dasharray="6 8" />
            <defs>
              <linearGradient id="orbit-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="var(--color-primary)" />
                <stop offset="100%" stop-color="var(--color-primary-light)" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <input type="file" id="avatar-input" accept="image/*" hidden />
        <button class="ob-avatar__btn" id="avatar-btn" type="button">
          ${svg.camera} ${formData.avatar ? 'Change Photo' : 'Upload Photo'}
        </button>
        <span class="ob-avatar__hint">Optional — you can always add one later</span>
      </div>
    </div>
  `;
}

/* ═══════ NAV BUTTONS ═══════ */
function renderNavButtons(total) {
  const isFirst = currentStep === 0;
  const isLast  = currentStep === total - 1;
  return `
    <div class="ob-nav">
      ${!isFirst
        ? `<button class="ob-nav__btn ob-nav__btn--back" id="prev-btn" type="button">${svg.arrowLeft}<span>Back</span></button>`
        : `<div></div>`}
      <button class="ob-nav__btn ob-nav__btn--next" id="next-btn" type="button">
        <span>${isLast ? 'Complete Setup' : 'Continue'}</span>
        ${isLast ? svg.check : svg.arrowRight}
      </button>
    </div>
  `;
}

/* ══════════════════════════════════════
   EVENTS
   ══════════════════════════════════════ */
function attachEvents() {
  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    const html = document.documentElement;
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('hireme-theme', next);
    render(false);
  });

  document.getElementById('next-btn')?.addEventListener('click', handleNext);
  document.getElementById('prev-btn')?.addEventListener('click', handlePrev);
  document.addEventListener('keydown', handleKeyboard);

  const stepId = getCurrentStepId();
  switch (stepId) {
    case 'role':          attachRoleEvents(); break;
    case 'student-info':  attachPickerEvents(); break;
    case 'graduate-info': attachGraduateEvents(); break;
    case 'photo':         attachPhotoEvents(); break;
  }

  requestAnimationFrame(triggerReveals);
}

function triggerReveals() {
  document.querySelectorAll('.ob-reveal').forEach(el => el.classList.add('ob-reveal--visible'));
}

function handleKeyboard(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    if (document.activeElement?.tagName === 'TEXTAREA') return;
    handleNext();
  }
}

async function handleNext() {
  document.removeEventListener('keydown', handleKeyboard);
  saveStepData();
  const stepId = getCurrentStepId();
  const total  = getTotalSteps();

  if (stepId === 'role' && !formData.userType) {
    const grid = document.getElementById('roles-grid');
    grid?.classList.add('ob-roles--shake');
    setTimeout(() => grid?.classList.remove('ob-roles--shake'), 600);
    return;
  }

  if (currentStep < total - 1) {
    direction = 1;
    currentStep++;
    render();
  } else {
    // Complete onboarding — register via API if coming from sign-up
    const signup = sessionStorage.getItem('hireme-signup');

    if (signup) {
      await completeRegistration(JSON.parse(signup));
    } else {
      // Already logged in — just save locally (fallback)
      finishLocally();
    }
  }
}

async function completeRegistration(credentials) {
  const nextBtn = document.getElementById('next-btn');
  if (nextBtn) { nextBtn.disabled = true; nextBtn.querySelector('span').textContent = 'Creating account…'; }

  try {
    // 1. Register
    const regRes = await fetch('http://localhost:8000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        name:     credentials.name,
        email:    credentials.email,
        password: credentials.password,
        role:     formData.userType,
      }),
    });
    const regData = await regRes.json();

    if (!regRes.ok) {
      const msg = Object.values(regData.errors || {})[0]?.[0] || regData.message || 'Registration failed.';
      alert(msg);
      if (nextBtn) { nextBtn.disabled = false; nextBtn.querySelector('span').textContent = 'Complete Setup'; }
      return;
    }

    const token = regData.token;
    localStorage.setItem('hireme_token', token);
    localStorage.setItem('hireme_user', JSON.stringify(regData.user));
    sessionStorage.removeItem('hireme-signup');

    // 2. Post onboarding profile data
    const profilePayload = buildProfilePayload();
    await fetch('http://localhost:8000/api/auth/onboarding', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(profilePayload),
    });

    finishLocally();
  } catch {
    alert('Could not connect to server. Is the backend running on port 8000?');
    if (nextBtn) { nextBtn.disabled = false; nextBtn.querySelector('span').textContent = 'Complete Setup'; }
  }
}

function buildProfilePayload() {
  const role = formData.userType;
  if (role === 'student') {
    return {
      school:     formData.school,
      campus:     formData.campus,
      program:    formData.program,
      year_level: formData.yearLevel,
      section:    formData.section,
      batch:      formData.batch,
      student_id: formData.studentId,
    };
  }
  if (role === 'graduate') {
    return {
      year_graduated:    formData.graduateYearGraduated,
      campus:            formData.graduateCampus,
      course:            formData.graduateCourse,
      section:           formData.graduateSection,
      employment_status: formData.graduateEmploymentStatus,
    };
  }
  return {};
}

function finishLocally() {
  localStorage.setItem('hireme-onboarding', JSON.stringify({ userType: formData.userType, completedAt: new Date().toISOString() }));
  localStorage.setItem('hireme-user-type', formData.userType);
  launchConfetti();
  const destinations = {
    student:  '/main/',
    graduate: '/jobseeker/',
  };
  const dest = destinations[formData.userType] || '/main/';
  setTimeout(() => { window.location.href = dest; }, 1800);
}



function handlePrev() {
  document.removeEventListener('keydown', handleKeyboard);
  if (currentStep > 0) {
    direction = -1;
    currentStep--;
    render();
  }
}

function saveStepData() {
  const stepId = getCurrentStepId();

  if (stepId === 'student-info') {
    formData.school    = document.getElementById('school')?.value || formData.school;
    formData.campus    = document.getElementById('campus')?.value || '';
    formData.yearLevel = '4th Year';
    formData.program   = 'Bachelor of Science in Information Technology';
    formData.section   = document.getElementById('section')?.value || '';
    formData.batch     = document.getElementById('batch')?.value || AUTO_BATCH;
    formData.studentId = document.getElementById('student-id')?.value || '';
  } else if (stepId === 'graduate-info') {
    formData.graduateYearGraduated = document.getElementById('graduate-year')?.value || '';
    formData.graduateCampus        = document.getElementById('graduate-campus')?.value || '';
    formData.graduateCourse        = document.getElementById('graduate-course')?.value || '';
    formData.graduateSection       = document.getElementById('graduate-section')?.value || '';
    // graduateEmploymentStatus set via chip clicks
  }
}

/* ── Role event attachment ── */
function attachRoleEvents() {
  document.querySelectorAll('.ob-role').forEach(btn => {
    btn.addEventListener('click', () => {
      formData.userType = btn.dataset.role;
      document.querySelectorAll('.ob-role').forEach(b => b.classList.remove('ob-role--selected'));
      btn.classList.add('ob-role--selected');
    });
  });
}

/* ── Generic form field focus events ── */
function attachFormFieldEvents() {
  document.querySelectorAll('.ob-field__input-wrap').forEach(wrap => {
    const input = wrap.querySelector('.ob-field__input');
    if (!input) return;
    input.addEventListener('focus', () => wrap.classList.add('ob-field--focused'));
    input.addEventListener('blur',  () => wrap.classList.remove('ob-field--focused'));
    if (document.activeElement === input) wrap.classList.add('ob-field--focused');
  });
}

/* ── Option picker events ── */
function attachPickerEvents() {
  attachFormFieldEvents();
  document.querySelectorAll('[data-pick]').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.pick;
      const val = btn.dataset.val;
      const hidden = document.getElementById(key);
      if (hidden) hidden.value = val;
      document.querySelectorAll(`[data-pick="${key}"]`).forEach(b =>
        b.classList.toggle('ob-picker__opt--on', b === btn));
    });
  });
}

/* ── Graduate events (employment status chips) ── */
function attachGraduateEvents() {
  attachPickerEvents();
  document.querySelectorAll('[data-emp]').forEach(btn => {
    btn.addEventListener('click', () => {
      formData.graduateEmploymentStatus = btn.dataset.emp;
      document.querySelectorAll('[data-emp]').forEach(b => b.classList.remove('ob-emp-btn--active'));
      btn.classList.add('ob-emp-btn--active');
    });
  });
}

/* ── Photo events ── */
function attachPhotoEvents() {
  const input   = document.getElementById('avatar-input');
  const btn     = document.getElementById('avatar-btn');
  const preview = document.getElementById('avatar-preview');

  btn?.addEventListener('click', () => input?.click());
  preview?.querySelector('.ob-avatar__inner')?.addEventListener('click', () => input?.click());

  input?.addEventListener('change', () => {
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      formData.avatar = e.target.result;
      const inner = document.getElementById('avatar-preview')?.querySelector('.ob-avatar__inner');
      if (inner) {
        inner.innerHTML = `<img src="${formData.avatar}" alt="Avatar" />`;
        inner.classList.add('ob-avatar__inner--pop');
        setTimeout(() => inner.classList.remove('ob-avatar__inner--pop'), 400);
      }
      if (btn) btn.innerHTML = `${svg.camera} Change Photo`;
    };
    reader.readAsDataURL(file);
  });
}

/* ── Init ── */
render();
