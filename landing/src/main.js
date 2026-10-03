/**
 * CHMSU HireMe — Landing Page (Creative Redesign)
 * Scroll reveals · Animated counters · Parallax · Marquee
 */

import './styles/variables.css';
import './styles/reset.css';
import './styles/landing.css';
import { icon } from './icons.js';

/* ── Icons needed ── */
const icons = {
  menu: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>`,
  portfolio: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/></svg>`,
  jobMatch: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
  ojt: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 6 3 6 3s3 0 6-3v-5"/></svg>`,
  calendar: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>`,
  dashboard: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>`,
  alumni: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  arrowRight: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>`,
  sparkle: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>`,
  checkCircle: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  users: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  building: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>`,
  shield: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>`,
  close: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>`,
  github: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>`,
  facebook: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`,
  twitter: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
};

function App() {
  const app = document.getElementById('app');
  app.innerHTML = '';

  app.appendChild(renderNav());
  app.appendChild(renderDrawer());
  app.appendChild(renderHero());
  app.appendChild(renderMarquee());
  app.appendChild(renderStats());
  app.appendChild(renderFeatures());
  app.appendChild(renderSteps());
  app.appendChild(renderRoles());
  app.appendChild(renderCTA());
  app.appendChild(renderFooter());

  attachEvents();
  initScrollReveal();
  initCounters();
}

/* ── Nav ── */
function renderNav() {
  const nav = document.createElement('nav');
  nav.className = 'landing-nav';
  nav.innerHTML = `
    <div class="landing-nav__inner">
      <a href="/landing/" class="landing-nav__logo">
        <div class="landing-nav__logo-icon">H</div>
        <span class="landing-nav__logo-text">HireMe</span>
      </a>
      <div class="landing-nav__links">
        <a href="#features" class="landing-nav__link">Features</a>
        <a href="#how-it-works" class="landing-nav__link">How it Works</a>
        <a href="#roles" class="landing-nav__link">Who it's For</a>
      </div>
      <div class="landing-nav__actions">
        <button class="landing-nav__theme-btn" aria-label="Toggle theme">
          ${icon('sun', 16)}
        </button>
        <a href="/login/" class="landing-btn landing-btn--outline" style="padding:8px 16px;font-size:var(--text-xs)">Sign In</a>
        <a href="/login/" class="landing-btn landing-btn--primary" style="padding:8px 16px;font-size:var(--text-xs)">Get Started ${icons.arrowRight}</a>
        <button class="landing-nav__hamburger" aria-label="Menu">${icons.menu}</button>
      </div>
    </div>
  `;
  return nav;
}

/* ── Mobile drawer ── */
function renderDrawer() {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <div class="landing-backdrop" id="drawer-backdrop"></div>
    <aside class="landing-drawer" id="drawer">
      <button class="landing-drawer__close" aria-label="Close menu">${icons.close}</button>
      <a href="#features" class="landing-drawer__link">Features</a>
      <a href="#how-it-works" class="landing-drawer__link">How it Works</a>
      <a href="#roles" class="landing-drawer__link">Who it's For</a>
      <div class="landing-drawer__divider"></div>
      <div class="landing-drawer__cta">
        <a href="/login/" class="landing-btn landing-btn--outline" style="width:100%;justify-content:center">Sign In</a>
        <a href="/login/" class="landing-btn landing-btn--primary" style="width:100%;justify-content:center">Get Started ${icons.arrowRight}</a>
      </div>
    </aside>
  `;
  const frag = document.createDocumentFragment();
  while (wrapper.firstChild) frag.appendChild(wrapper.firstChild);
  return frag;
}

/* ── Hero ── */
function renderHero() {
  const section = document.createElement('section');
  section.className = 'landing-hero landing-section';
  section.innerHTML = `
    <!-- Floating gradient shapes -->
    <div class="hero-shape hero-shape--1"></div>
    <div class="hero-shape hero-shape--2"></div>
    <div class="hero-shape hero-shape--3"></div>

    <div class="landing-section__inner landing-hero__content">
      <div class="landing-hero__left">
        <span class="landing-section__label">${icons.sparkle} Built for CHMSU Students</span>
        <h1 class="landing-section__title">
          Your Career Journey<br/>Starts with <span>HireMe</span>
        </h1>
        <p class="landing-section__subtitle">
          Build professional portfolios, discover OJT placements, 
          and get matched with career opportunities — all in one platform 
          designed exclusively for CHMSU.
        </p>
        <div class="hero-actions">
          <a href="/login/" class="landing-btn landing-btn--primary landing-btn--large">
            Get Started Free ${icons.arrowRight}
          </a>
          <a href="#features" class="landing-btn landing-btn--outline landing-btn--large">
            Explore Features
          </a>
        </div>
        <div class="hero-trusted">
          <div class="hero-trusted__avatars">
            <div class="hero-trusted__avatar" style="background:#4A6CF7">J</div>
            <div class="hero-trusted__avatar" style="background:#8B5CF6">M</div>
            <div class="hero-trusted__avatar" style="background:#06b6d4">A</div>
            <div class="hero-trusted__avatar" style="background:#ec4899">R</div>
            <div class="hero-trusted__avatar" style="background:#f59e0b">+</div>
          </div>
          <p class="hero-trusted__text">
            <strong>2,500+ students</strong> already building their careers
          </p>
        </div>
      </div>

      <div class="landing-hero__right">
        <div class="hero-mockup" data-parallax>
          <!-- Floating accent card — top right -->
          <div class="hero-float-card hero-float-card--top">
            <div class="hero-float-card__icon hero-float-card__icon--success">
              ${icons.checkCircle}
            </div>
            <div>
              <div class="hero-float-card__text">Application Sent!</div>
              <div class="hero-float-card__sub">Frontend Developer Intern</div>
            </div>
          </div>

          <!-- Main dashboard preview -->
          <div class="hero-mockup__main">
            <div class="hero-mockup__topbar">
              <div class="hero-mockup__dots">
                <span class="hero-mockup__dot hero-mockup__dot--r"></span>
                <span class="hero-mockup__dot hero-mockup__dot--y"></span>
                <span class="hero-mockup__dot hero-mockup__dot--g"></span>
              </div>
              <span class="hero-mockup__topbar-title">HireMe Dashboard</span>
            </div>
            <div class="hero-mockup__grid">
              <div class="hero-mockup__stat">
                <div class="hero-mockup__stat-value">12</div>
                <div class="hero-mockup__stat-label">Applications</div>
              </div>
              <div class="hero-mockup__stat">
                <div class="hero-mockup__stat-value">5</div>
                <div class="hero-mockup__stat-label">Interviews</div>
              </div>
              <div class="hero-mockup__stat">
                <div class="hero-mockup__stat-value">89%</div>
                <div class="hero-mockup__stat-label">Profile</div>
              </div>
            </div>
            <div class="hero-mockup__bar-section">
              <div class="hero-mockup__bar-row">
                <span class="hero-mockup__bar-label">Portfolio</span>
                <div class="hero-mockup__bar-track"><div class="hero-mockup__bar-fill hero-mockup__bar-fill--1"></div></div>
              </div>
              <div class="hero-mockup__bar-row">
                <span class="hero-mockup__bar-label">Skills</span>
                <div class="hero-mockup__bar-track"><div class="hero-mockup__bar-fill hero-mockup__bar-fill--2"></div></div>
              </div>
              <div class="hero-mockup__bar-row">
                <span class="hero-mockup__bar-label">OJT Hours</span>
                <div class="hero-mockup__bar-track"><div class="hero-mockup__bar-fill hero-mockup__bar-fill--3"></div></div>
              </div>
              <div class="hero-mockup__bar-row">
                <span class="hero-mockup__bar-label">Network</span>
                <div class="hero-mockup__bar-track"><div class="hero-mockup__bar-fill hero-mockup__bar-fill--4"></div></div>
              </div>
            </div>
          </div>

          <!-- Floating accent card — bottom left -->
          <div class="hero-float-card hero-float-card--bottom">
            <div class="hero-float-card__icon hero-float-card__icon--purple">
              ${icons.sparkle}
            </div>
            <div>
              <div class="hero-float-card__text">New Match!</div>
              <div class="hero-float-card__sub">3 OJT positions found</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  return section;
}

/* ── Marquee ── */
function renderMarquee() {
  const section = document.createElement('section');
  section.className = 'landing-marquee';
  const items = [
    'Portfolio Builder', 'Job Matching', 'OJT Tracking',
    'Interview Prep', 'Supervisor Tools', 'Alumni Network',
    'Resume Export', 'Analytics', 'Company Dashboard', 'Career Roadmap',
  ];
  const repeated = [...items, ...items]; // duplicate for seamless loop
  section.innerHTML = `
    <p class="landing-marquee__label">Everything you need for your career</p>
    <div class="landing-marquee__track">
      ${repeated.map(t => `
        <span class="landing-marquee__item">
          <span class="landing-marquee__item-dot"></span>
          ${t}
        </span>
      `).join('')}
    </div>
  `;
  return section;
}

/* ── Stats ── */
function renderStats() {
  const stats = [
    { value: 2500, suffix: '+', label: 'Active Students' },
    { value: 150, suffix: '+', label: 'Partner Companies' },
    { value: 800, suffix: '+', label: 'OJT Placements' },
    { value: 95, suffix: '%', label: 'Satisfaction Rate' },
  ];

  const section = document.createElement('section');
  section.className = 'landing-stats stagger';
  section.innerHTML = stats.map(s => `
    <div class="landing-stat reveal">
      <div class="landing-stat__value" data-count="${s.value}" data-suffix="${s.suffix}">0${s.suffix}</div>
      <div class="landing-stat__label">${s.label}</div>
    </div>
  `).join('');
  return section;
}

/* ── Features (creative artistic bento) ── */
function renderFeatures() {
  const features = [
    { icon: icons.portfolio, color: '#4A6CF7', gradient: 'linear-gradient(135deg,#4A6CF7,#6D8DFF)',
      title: 'Portfolio Builder', tag: 'Core', num: '01',
      desc: 'Create a professional portfolio to showcase your projects, skills, and achievements to potential employers.',
      bullets: ['Drag-and-drop editor', 'Custom themes', 'Export to PDF'],
      type: 'hero' },
    { icon: icons.jobMatch, color: '#8B5CF6', gradient: 'linear-gradient(135deg,#8B5CF6,#A78BFA)',
      title: 'Smart Job Matching', tag: 'Core', num: '02',
      desc: 'Skill-based matching connects you with the right opportunities based on your skills and interests.',
      bullets: ['Skill-based matching', 'Real-time alerts', '1-click apply'] },
    { icon: icons.ojt, color: '#34C759', gradient: 'linear-gradient(135deg,#34C759,#6EE7A0)',
      title: 'OJT Tracking', tag: 'Tracking', num: '03',
      desc: 'Log hours, track progress, and manage evaluations for your On-the-Job Training in one place.',
      bullets: ['Hour logging', 'Progress reports', 'Supervisor tools'] },
    { icon: icons.calendar, color: '#06b6d4', gradient: 'linear-gradient(135deg,#06b6d4,#22d3ee)',
      title: 'Interview Scheduling', tag: 'Scheduling', num: '04',
      desc: 'Seamlessly schedule, prepare for, and manage interviews with partner companies.',
      bullets: ['Calendar sync', 'Reminders', 'Video prep tips'] },
    { icon: icons.dashboard, color: '#f59e0b', gradient: 'linear-gradient(135deg,#f59e0b,#fbbf24)',
      title: 'Supervisor Dashboard', tag: 'Management', num: '05',
      desc: 'Supervisors can monitor student progress, review portfolios and provide evaluations effortlessly.',
      bullets: ['Batch reviews', 'Analytics', 'Evaluation forms'],
      type: 'wide' },
    { icon: icons.alumni, color: '#ec4899', gradient: 'linear-gradient(135deg,#ec4899,#f472b6)',
      title: 'Alumni Network', tag: 'Community', num: '06',
      desc: 'Connect with CHMSU alumni who can offer guidance, mentorship and job referrals.',
      bullets: ['Mentorship', 'Job referrals', 'Career advice'],
      type: 'banner' },
  ];

  const section = document.createElement('section');
  section.className = 'landing-section landing-features';
  section.id = 'features';

  const cls = t => t === 'hero' ? 'ft-card--hero' : t === 'wide' ? 'ft-card--wide' : t === 'banner' ? 'ft-card--banner' : '';

  section.innerHTML = `
    <div class="ft-bg" aria-hidden="true">
      <div class="ft-orb ft-orb--1"></div>
      <div class="ft-orb ft-orb--2"></div>
      <div class="ft-orb ft-orb--3"></div>
    </div>

    <div class="landing-section__inner">
      <div class="ft-header reveal">
        <span class="landing-section__label">${icons.sparkle} Features</span>
        <h2 class="landing-section__title">Everything You Need<br/>to <span class="ft-gradient-text">Succeed</span></h2>
        <p class="landing-section__subtitle">Powerful tools designed specifically for CHMSU students, companies, and supervisors.</p>
        <div class="ft-header__line" aria-hidden="true"></div>
      </div>

      <div class="ft-filters reveal" style="--delay:.1s" id="ft-filters">
        <button class="ft-filter ft-filter--active" data-filter="all">All Features</button>
        ${[...new Set(features.map(f => f.tag))].map(t =>
          `<button class="ft-filter" data-filter="${t}">${t}</button>`
        ).join('')}
      </div>

      <div class="ft-bento" id="ft-bento">
        ${features.map((f, i) => `
          <div class="ft-card ${cls(f.type)} reveal"
               data-tag="${f.tag}"
               style="--card-color:${f.color};--card-gradient:${f.gradient};--i:${i}">
            <div class="ft-card__accent"></div>
            <div class="ft-card__glow"></div>
            <div class="ft-card__corner">
              <svg viewBox="0 0 80 80"><circle cx="80" cy="0" r="60" fill="none" stroke="var(--card-color)" stroke-width="1" opacity=".12"/><circle cx="80" cy="0" r="40" fill="none" stroke="var(--card-color)" stroke-width="1" opacity=".08"/></svg>
            </div>
            <span class="ft-card__num">${f.num}</span>

            <div class="ft-card__content">
              <div class="ft-card__icon-wrap">
                <div class="ft-card__icon">${f.icon}</div>
                <svg class="ft-card__icon-ring" viewBox="0 0 56 56"><circle cx="28" cy="28" r="26" fill="none" stroke="var(--card-color)" stroke-width="1.5" stroke-dasharray="5 5" opacity=".3"/></svg>
              </div>
              <span class="ft-card__tag">${f.tag}</span>
              <h3 class="ft-card__title">${f.title}</h3>
              <p class="ft-card__desc">${f.desc}</p>
              <ul class="ft-card__bullets">
                ${f.bullets.map(b => `<li class="ft-card__bullet">${icons.checkCircle} <span>${b}</span></li>`).join('')}
              </ul>
              <a href="#" class="ft-card__link">Learn more ${icons.arrowRight}</a>
            </div>

            ${f.type === 'hero' ? `
            <div class="ft-card__preview">
              <div class="ft-preview">
                <div class="ft-preview__bar">
                  <span class="ft-preview__dot" style="background:#FF5F57"></span>
                  <span class="ft-preview__dot" style="background:#FEBC2E"></span>
                  <span class="ft-preview__dot" style="background:#28C840"></span>
                </div>
                <div class="ft-preview__body">
                  <div class="ft-preview__avatar"></div>
                  <div class="ft-preview__lines">
                    <div class="ft-preview__line ft-preview__line--w70"></div>
                    <div class="ft-preview__line ft-preview__line--w50"></div>
                  </div>
                  <div class="ft-preview__blocks">
                    <div class="ft-preview__block"></div>
                    <div class="ft-preview__block"></div>
                    <div class="ft-preview__block"></div>
                  </div>
                  <div class="ft-preview__bars">
                    <div class="ft-preview__bar-item"><div class="ft-preview__bar-fill" style="--w:85%"></div></div>
                    <div class="ft-preview__bar-item"><div class="ft-preview__bar-fill" style="--w:65%"></div></div>
                    <div class="ft-preview__bar-item"><div class="ft-preview__bar-fill" style="--w:92%"></div></div>
                  </div>
                </div>
              </div>
            </div>` : ''}

            ${f.type === 'wide' || f.type === 'banner' ? `
            <div class="ft-card__visual" aria-hidden="true">
              <div class="ft-card__icon-lg">${f.icon}</div>
              <svg class="ft-card__orbit" viewBox="0 0 140 140">
                <circle cx="70" cy="70" r="60" fill="none" stroke="var(--card-color)" stroke-width="1" stroke-dasharray="8 4" opacity=".2"/>
                <circle cx="70" cy="70" r="40" fill="none" stroke="var(--card-color)" stroke-width="1" stroke-dasharray="4 6" opacity=".15"/>
                <circle cx="70" cy="10" r="4" fill="var(--card-color)" opacity=".5"/>
                <circle cx="130" cy="70" r="3" fill="var(--card-color)" opacity=".4"/>
                <circle cx="20" cy="110" r="3.5" fill="var(--card-color)" opacity=".35"/>
              </svg>
            </div>` : ''}
          </div>
        `).join('')}
      </div>
    </div>
  `;
  return section;
}

/* ── How It Works (timeline) ── */
function renderSteps() {
  const steps = [
    { num: 1, title: 'Create Your Account',
      desc: 'Sign up with your CHMSU credentials in seconds. Your student profile is automatically verified.' },
    { num: 2, title: 'Build Your Profile',
      desc: 'Add your skills, upload projects to your portfolio, and let our AI suggest improvements to stand out.' },
    { num: 3, title: 'Get Matched & Apply',
      desc: 'Receive curated job and OJT recommendations. Apply with one click and track every application.' },
  ];

  const section = document.createElement('section');
  section.className = 'landing-section';
  section.id = 'how-it-works';
  section.innerHTML = `
    <div class="landing-section__inner">
      <div class="landing-steps__header reveal">
        <span class="landing-section__label">${icons.sparkle} How It Works</span>
        <h2 class="landing-section__title">Three Steps to Your Future</h2>
        <p class="landing-section__subtitle">Getting started is simple — we do the heavy lifting so you can focus on what matters.</p>
      </div>
      <div class="landing-steps__timeline">
        ${steps.map(s => `
          <div class="step-card reveal">
            <div class="step-card__number">${s.num}</div>
            <div class="step-card__content">
              <h3 class="step-card__title">${s.title}</h3>
              <p class="step-card__desc">${s.desc}</p>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  return section;
}

/* ── Roles ── */
function renderRoles() {
  const roles = [
    { icon: icons.users, title: 'Students',
      desc: 'Build portfolios, find jobs & OJT placements, schedule interviews, and track your career progress.', color: '#4A6CF7' },
    { icon: icons.building, title: 'Companies',
      desc: 'Post job openings, browse student talent, schedule interviews, and manage applicants in one place.', color: '#8B5CF6' },
    { icon: icons.shield, title: 'Supervisors',
      desc: 'Monitor OJT progress, evaluate student performance, review portfolios, and submit assessments.', color: '#06b6d4' },
  ];

  const section = document.createElement('section');
  section.className = 'landing-section landing-roles';
  section.id = 'roles';
  section.innerHTML = `
    <div class="landing-section__inner">
      <div class="landing-roles__header reveal">
        <span class="landing-section__label">${icons.sparkle} Who It's For</span>
        <h2 class="landing-section__title">Built for Every Stakeholder</h2>
        <p class="landing-section__subtitle">Whether you're a student, employer, or supervisor — HireMe has the tools you need.</p>
      </div>
      <div class="landing-roles__grid stagger">
        ${roles.map(r => `
          <div class="role-card reveal">
            <div class="role-card__icon">${r.icon}</div>
            <h3 class="role-card__title">${r.title}</h3>
            <p class="role-card__desc">${r.desc}</p>
            <a href="/login/" class="landing-btn landing-btn--primary">
              Get Started ${icons.arrowRight}
            </a>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  return section;
}

/* ── CTA ── */
function renderCTA() {
  const section = document.createElement('section');
  section.className = 'landing-section landing-cta';
  section.innerHTML = `
    <div class="landing-section__inner reveal">
      <h2 class="landing-section__title">Ready to Build Your Future?</h2>
      <p class="landing-section__subtitle">
        Join thousands of CHMSU students already using HireMe to land their dream careers.
      </p>
      <div class="landing-cta__actions">
        <a href="/login/" class="landing-btn landing-btn--white landing-btn--large">
          Get Started Free ${icons.arrowRight}
        </a>
        <a href="#features" class="landing-btn landing-btn--white-outline landing-btn--large">
          Learn More
        </a>
      </div>
    </div>
  `;
  return section;
}

/* ── Footer ── */
function renderFooter() {
  const footer = document.createElement('footer');
  footer.className = 'landing-footer';
  footer.innerHTML = `
    <div class="landing-footer__inner">
      <div class="landing-footer__top">
        <div class="landing-footer__brand">
          <div class="landing-footer__brand-row">
            <div class="landing-footer__logo-icon">H</div>
            <span class="landing-footer__brand-name">HireMe</span>
          </div>
          <p class="landing-footer__brand-desc">
            The all-in-one career platform built exclusively for CHMSU students, companies, and supervisors.
          </p>
          <div class="landing-footer__socials">
            <a href="#" class="landing-footer__social" aria-label="Facebook">${icons.facebook}</a>
            <a href="#" class="landing-footer__social" aria-label="Twitter">${icons.twitter}</a>
            <a href="#" class="landing-footer__social" aria-label="GitHub">${icons.github}</a>
          </div>
        </div>
        <div class="landing-footer__col">
          <h4 class="landing-footer__col-title">Platform</h4>
          <div class="landing-footer__col-links">
            <a href="#features" class="landing-footer__link">Features</a>
            <a href="#how-it-works" class="landing-footer__link">How it Works</a>
            <a href="#roles" class="landing-footer__link">Who it's For</a>
          </div>
        </div>
        <div class="landing-footer__col">
          <h4 class="landing-footer__col-title">Resources</h4>
          <div class="landing-footer__col-links">
            <a href="#" class="landing-footer__link">Help Center</a>
            <a href="#" class="landing-footer__link">Documentation</a>
            <a href="#" class="landing-footer__link">Blog</a>
          </div>
        </div>
        <div class="landing-footer__col">
          <h4 class="landing-footer__col-title">Company</h4>
          <div class="landing-footer__col-links">
            <a href="#" class="landing-footer__link">About CHMSU</a>
            <a href="#" class="landing-footer__link">Contact</a>
            <a href="#" class="landing-footer__link">Careers</a>
          </div>
        </div>
      </div>
      <div class="landing-footer__bottom">
        <span class="landing-footer__copy">&copy; ${new Date().getFullYear()} CHMSU HireMe. All rights reserved.</span>
        <div class="landing-footer__bottom-links">
          <a href="#" class="landing-footer__bottom-link">Privacy Policy</a>
          <a href="#" class="landing-footer__bottom-link">Terms of Service</a>
        </div>
      </div>
    </div>
  `;
  return footer;
}

/* ================================================================
   Events & Interactions
   ================================================================ */
function attachEvents() {
  /* — Theme toggle — */
  const themeBtn = document.querySelector('.landing-nav__theme-btn');
  if (themeBtn) {
    const saved = localStorage.getItem('theme');
    if (saved) document.documentElement.setAttribute('data-theme', saved);

    const updateIcon = () => {
      const dark = document.documentElement.getAttribute('data-theme') === 'dark';
      themeBtn.innerHTML = dark ? icon('moon', 16) : icon('sun', 16);
    };
    updateIcon();

    themeBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      updateIcon();
    });
  }

  /* — Navbar scroll — */
  const nav = document.querySelector('.landing-nav');
  if (nav) {
    const onScroll = () => {
      nav.classList.toggle('landing-nav--scrolled', window.scrollY > 20);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* — Active link tracking — */
  const sections = document.querySelectorAll('[id]');
  const navLinks = document.querySelectorAll('.landing-nav__link');
  if (sections.length && navLinks.length) {
    const onScroll = () => {
      let current = '';
      sections.forEach(section => {
        const top = section.offsetTop - 120;
        if (window.scrollY >= top) current = section.id;
      });
      navLinks.forEach(link => {
        link.classList.toggle('landing-nav__link--active', link.getAttribute('href') === '#' + current);
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* — Mobile drawer — */
  const hamburger = document.querySelector('.landing-nav__hamburger');
  const drawer = document.getElementById('drawer');
  const backdrop = document.getElementById('drawer-backdrop');
  const closeBtn = document.querySelector('.landing-drawer__close');

  function openDrawer() {
    drawer?.classList.add('is-open');
    backdrop?.classList.add('is-visible');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    drawer?.classList.remove('is-open');
    backdrop?.classList.remove('is-visible');
    document.body.style.overflow = '';
  }

  hamburger?.addEventListener('click', openDrawer);
  closeBtn?.addEventListener('click', closeDrawer);
  backdrop?.addEventListener('click', closeDrawer);

  // Close drawer on link click
  document.querySelectorAll('.landing-drawer__link').forEach(link => {
    link.addEventListener('click', closeDrawer);
  });

  /* — Smooth anchor scroll — */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  /* — Parallax on hero mockup — */
  const mockup = document.querySelector('[data-parallax]');
  if (mockup && window.matchMedia('(min-width: 1024px)').matches) {
    const hero = document.querySelector('.landing-hero');
    hero.addEventListener('mousemove', e => {
      const rect = hero.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      mockup.style.transform = `rotateY(${x * 8}deg) rotateX(${-y * 6}deg)`;
    });
    hero.addEventListener('mouseleave', () => {
      mockup.style.transform = 'rotateY(-5deg) rotateX(2deg)';
    });
  }

  /* — Feature filter pills — */
  const filterBtns = document.querySelectorAll('.ft-filter');
  const featureCards = document.querySelectorAll('.ft-card');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('ft-filter--active'));
      btn.classList.add('ft-filter--active');
      const tag = btn.dataset.filter;
      featureCards.forEach((card, i) => {
        const show = tag === 'all' || card.dataset.tag === tag;
        if (show && card.classList.contains('ft-card--hidden')) {
          card.classList.remove('ft-card--hidden');
          card.animate([
            { opacity: 0, transform: 'scale(0.92)' },
            { opacity: 1, transform: 'scale(1)' }
          ], { duration: 350, easing: 'cubic-bezier(.4,0,.2,1)', delay: i * 50 });
        } else if (!show && !card.classList.contains('ft-card--hidden')) {
          const anim = card.animate([
            { opacity: 1, transform: 'scale(1)' },
            { opacity: 0, transform: 'scale(0.92)' }
          ], { duration: 250, easing: 'cubic-bezier(.4,0,.2,1)', delay: i * 30 });
          anim.onfinish = () => card.classList.add('ft-card--hidden');
        }
      });
    });
  });

  /* — Feature card tilt on hover — */
  if (window.matchMedia('(min-width: 768px)').matches) {
    featureCards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * 8;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * -8;
        card.style.transform = `perspective(800px) rotateY(${x}deg) rotateX(${y}deg) translateY(-4px)`;
        // Move glow to cursor position
        const glow = card.querySelector('.ft-card__glow');
        if (glow) {
          glow.style.background = `radial-gradient(400px circle at ${e.clientX - rect.left}px ${e.clientY - rect.top}px, color-mix(in srgb, var(--card-color) 12%, transparent), transparent 60%)`;
        }
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        const glow = card.querySelector('.ft-card__glow');
        if (glow) glow.style.background = '';
      });
    });
  }
}

/* ── Scroll Reveal (IntersectionObserver) ── */
function initScrollReveal() {
  const els = document.querySelectorAll('.reveal, .reveal--left, .reveal--right, .reveal--scale');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => observer.observe(el));
}

/* ── Animated Counters ── */
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
}

function animateCounter(el) {
  const target = parseInt(el.dataset.count, 10);
  const suffix = el.dataset.suffix || '';
  const duration = 1800;
  const start = performance.now();

  function tick(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(eased * target);
    el.textContent = current.toLocaleString() + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

/* ── Boot ── */
document.addEventListener('DOMContentLoaded', App);
