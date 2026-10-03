/**
 * CHMSU HireMe — Login Page (Split-Panel Redesign)
 */

import './styles/variables.css';
import './styles/reset.css';
import './styles/login.css';
import './styles/company-register.css';
import { icon } from './icons.js';

/* ── Theme ── */
const savedTheme = localStorage.getItem('hireme-theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);

/* ── State ── */
let currentView = 'signin'; // 'signin' | 'signup' | 'company-signup' | 'company-success'

/* ── App root ── */
const app = document.getElementById('app');

/* ═══════════════════════════════════════
   RENDER
   ═══════════════════════════════════════ */
function render() {
  const isSignin        = currentView === 'signin';
  const isCompanySignup = currentView === 'company-signup';
  const isSuccess       = currentView === 'company-success';
  const isSignup        = currentView === 'signup';

  app.innerHTML = `
    <div class="login-root">

      <!-- ══ LEFT BRAND PANEL ══ -->
      <aside class="lp-brand" aria-hidden="true">
        <div class="lp-aurora">
          <div class="lp-aurora__blob lp-aurora__blob--1"></div>
          <div class="lp-aurora__blob lp-aurora__blob--2"></div>
          <div class="lp-aurora__blob lp-aurora__blob--3"></div>
          <div class="lp-aurora__blob lp-aurora__blob--4"></div>
        </div>
        <div class="lp-grid"></div>

        <div class="lp-brand-content">
          <div class="lp-logo">
            <div class="lp-logo__mark">H</div>
            <span class="lp-logo__name">Hire<em>Me</em></span>
          </div>

          <h1 class="lp-headline">
            ${isCompanySignup || isSuccess
              ? 'Partner with<br><span>CHMSU HireMe.</span>'
              : 'Connect. Learn.<br><span>Launch Your Career.</span>'}
          </h1>
          <p class="lp-subtitle">
            ${isCompanySignup || isSuccess
              ? 'Register your company and connect with talented CHMSU students ready for OJT and career opportunities.'
              : 'CHMSU\'s official OJT and career management platform — built for students, supervisors, and companies to collaborate seamlessly.'}
          </p>

          ${isCompanySignup || isSuccess ? `
          <div class="lp-company-perks">
            <div class="lp-perk">
              <div class="lp-perk__icon">🎯</div>
              <div class="lp-perk__text">
                <div class="lp-perk__title">Access Top Talent</div>
                <div class="lp-perk__desc">Recruit from 1,200+ qualified CHMSU students</div>
              </div>
            </div>
            <div class="lp-perk">
              <div class="lp-perk__icon">📋</div>
              <div class="lp-perk__text">
                <div class="lp-perk__title">Post OJT Slots</div>
                <div class="lp-perk__desc">Easily manage internship openings and applications</div>
              </div>
            </div>
            <div class="lp-perk">
              <div class="lp-perk__icon">🤝</div>
              <div class="lp-perk__text">
                <div class="lp-perk__title">MOA Partnership</div>
                <div class="lp-perk__desc">Formalize your partnership with CHMSU CIER</div>
              </div>
            </div>
          </div>
          ` : `
          <div class="lp-deck">
            <div class="lp-deck-card" style="--dur:4.5s;--delay:0s">
              <div class="lp-deck-card__icon" style="background:rgba(74,108,247,0.15);color:#818CF8">🎓</div>
              <div class="lp-deck-card__text">
                <div class="lp-deck-card__title">Students</div>
                <div class="lp-deck-card__desc">Track OJT, build portfolio, find placements</div>
              </div>
              <div class="lp-deck-card__pill">Active</div>
            </div>
            <div class="lp-deck-card" style="--dur:5s;--delay:-1.5s">
              <div class="lp-deck-card__icon" style="background:rgba(6,182,212,0.15);color:#38bdf8">🛡️</div>
              <div class="lp-deck-card__text">
                <div class="lp-deck-card__title">Supervisors</div>
                <div class="lp-deck-card__desc">Evaluate interns, submit assessments</div>
              </div>
              <div class="lp-deck-card__pill">Ready</div>
            </div>
            <div class="lp-deck-card" style="--dur:3.8s;--delay:-3s">
              <div class="lp-deck-card__icon" style="background:rgba(245,158,11,0.15);color:#fbbf24">🏢</div>
              <div class="lp-deck-card__text">
                <div class="lp-deck-card__title">Companies</div>
                <div class="lp-deck-card__desc">Post OJT slots, manage applicants</div>
              </div>
              <div class="lp-deck-card__pill">Hiring</div>
            </div>
          </div>
          `}

          <div class="lp-stats">
            <div class="lp-stat">
              <div class="lp-stat__value">1,200+</div>
              <div class="lp-stat__label">Students</div>
            </div>
            <div class="lp-stat">
              <div class="lp-stat__value">300+</div>
              <div class="lp-stat__label">Companies</div>
            </div>
            <div class="lp-stat">
              <div class="lp-stat__value">98%</div>
              <div class="lp-stat__label">Placement Rate</div>
            </div>
          </div>
        </div>
      </aside>

      <!-- ══ RIGHT FORM PANEL ══ -->
      <main class="lp-form-panel">
        <div class="lp-form-inner">

          <button class="login-theme-toggle" id="theme-toggle" aria-label="Toggle theme">
            ${document.documentElement.getAttribute('data-theme') === 'dark' ? icon('sun', 18) : icon('moon', 18)}
          </button>

          <div class="login-logo">
            <div class="login-logo__icon">H</div>
            <span class="login-logo__text">Hire<span>Me</span></span>
          </div>

          ${isSuccess ? renderSuccessView() : ''}
          ${isCompanySignup ? renderCompanySignupForm() : ''}
          ${!isCompanySignup && !isSuccess ? renderStandardForm(isSignin, isSignup) : ''}

        </div>
      </main>
    </div>
  `;

  attachEvents();
}

/* ─── Standard Sign In / Sign Up form ─── */
function renderStandardForm(isSignin, isSignup) {
  return `
    <div class="login-header">
      <h2 class="login-header__title">${isSignin ? 'Welcome back' : 'Create account'}</h2>
      <p class="login-header__subtitle">
        ${isSignin
          ? 'Sign in to your HireMe account to continue.'
          : 'Join CHMSU HireMe — it only takes a minute.'}
      </p>
    </div>

    <!-- Tabs -->
    <div class="login-tabs" role="tablist">
      <button class="login-tabs__btn ${isSignin ? 'login-tabs__btn--active' : ''}"
        id="tab-signin" role="tab" aria-selected="${isSignin}" data-tab="signin">Sign In</button>
      <button class="login-tabs__btn ${!isSignin ? 'login-tabs__btn--active' : ''}"
        id="tab-signup" role="tab" aria-selected="${!isSignin}" data-tab="signup">Sign Up</button>
      <div class="login-tabs__slider ${!isSignin ? 'login-tabs__slider--right' : ''}"></div>
    </div>

    <!-- Social Buttons -->
    <div class="login-social">
      <button class="login-social__btn" id="google-btn" type="button">
        <span class="login-social__btn-icon">
          <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
        </span>
        Google
      </button>
      <button class="login-social__btn" id="linkedin-btn" type="button">
        <span class="login-social__btn-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#0A66C2"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
        </span>
        LinkedIn
      </button>
    </div>

    <div class="login-divider">
      <div class="login-divider__line"></div>
      <span class="login-divider__text">or continue with email</span>
      <div class="login-divider__line"></div>
    </div>

    <!-- Form -->
    <form class="login-form" id="login-form" novalidate>
      ${!isSignin ? `
      <div class="lf-field">
        <div class="lf-field__wrap" id="wrap-name">
          <span class="lf-field__icon">${icon('user', 18)}</span>
          <input class="lf-field__input" type="text" id="name" name="name"
            placeholder="x" autocomplete="name" />
          <label class="lf-field__label" for="name">Full Name</label>
        </div>
        <span class="lf-field__error" id="err-name"></span>
      </div>
      ` : ''}

      <div class="lf-field">
        <div class="lf-field__wrap" id="wrap-email">
          <span class="lf-field__icon">${icon('mail', 18)}</span>
          <input class="lf-field__input" type="email" id="email" name="email"
            placeholder="x" autocomplete="email" />
          <label class="lf-field__label" for="email">Email Address</label>
        </div>
        <span class="lf-field__error" id="err-email"></span>
      </div>

      <div class="lf-field">
        <div class="lf-field__wrap" id="wrap-password">
          <span class="lf-field__icon">${icon('lock', 18)}</span>
          <input class="lf-field__input" type="password" id="password" name="password"
            placeholder="x" autocomplete="${isSignin ? 'current-password' : 'new-password'}" />
          <label class="lf-field__label" for="password">Password</label>
          <button class="lf-field__toggle" id="pw-toggle" type="button" aria-label="Toggle password visibility">
            ${icon('eye', 18)}
          </button>
        </div>
        <span class="lf-field__error" id="err-password"></span>
        ${!isSignin ? `
        <div class="pw-strength" id="pw-strength">
          <div class="pw-strength__bar" id="ps-1"></div>
          <div class="pw-strength__bar" id="ps-2"></div>
          <div class="pw-strength__bar" id="ps-3"></div>
          <div class="pw-strength__bar" id="ps-4"></div>
        </div>
        <div class="pw-strength__label" id="pw-label"></div>
        ` : ''}
      </div>

      ${isSignin ? `
      <div class="login-options">
        <label class="login-remember">
          <input class="login-remember__checkbox" type="checkbox" id="remember" />
          Remember me
        </label>
        <a class="login-forgot" href="#">Forgot password?</a>
      </div>
      ` : ''}

      <button class="login-submit" id="submit-btn" type="submit">
        <span id="submit-label">${isSignin ? 'Sign In' : 'Create Account'}</span>
      </button>
    </form>

    ${!isSignin ? `
    <!-- Company Registration CTA -->
    <div class="cr-cta-banner" id="company-cta">
      <div class="cr-cta-banner__icon">🏢</div>
      <div class="cr-cta-banner__text">
        <span class="cr-cta-banner__title">Are you a company?</span>
        <span class="cr-cta-banner__desc">Register your business to post OJT slots and job openings</span>
      </div>
      <button class="cr-cta-banner__btn" id="go-company-signup">
        Register Company ${icon('arrow-right', 14)}
      </button>
    </div>
    ` : ''}

    <p class="login-toggle">
      ${isSignin ? "Don't have an account?" : 'Already have an account?'}
      <span class="login-toggle__link" id="view-toggle">
        ${isSignin ? 'Sign Up' : 'Sign In'}
      </span>
    </p>

    <p class="login-footer">
      By continuing you agree to our <a href="#">Terms</a> and <a href="#">Privacy Policy</a>.
    </p>

    <a class="login-admin-link" href="./admin-login.html">Admin Login</a>
  `;
}

/* ─── Company Sign-Up Form ─── */
function renderCompanySignupForm() {
  return `
    <div class="login-header">
      <h2 class="login-header__title">Register Your Company</h2>
      <p class="login-header__subtitle">
        Create a free account. Full access unlocks once admin approves your profile and MOA is signed.
      </p>
    </div>

    <!-- MOA notice banner -->
    <div class="cr-notice">
      <div class="cr-notice__icon">${icon('info', 15)}</div>
      <div class="cr-notice__text">
        Your account will be <strong>Pending</strong> until our CIER team verifies your profile and a Memorandum of Agreement is established. You will receive a confirmation email after registering.
      </div>
    </div>

    <form class="login-form cr-form" id="company-form" novalidate>

      <!-- Row 1: Company Name -->
      <div class="lf-field">
        <div class="lf-field__wrap" id="wrap-cr-company">
          <span class="lf-field__icon">${icon('building-2', 18)}</span>
          <input class="lf-field__input" type="text" id="cr-company" name="company_name"
            placeholder="x" autocomplete="organization" />
          <label class="lf-field__label" for="cr-company">Company Name</label>
        </div>
        <span class="lf-field__error" id="err-cr-company"></span>
      </div>

      <!-- Row 2: Industry + Location (two columns) -->
      <div class="cr-row2">
        <div class="lf-field">
          <div class="lf-field__wrap cr-select-wrap" id="wrap-cr-industry">
            <span class="lf-field__icon">${icon('briefcase', 18)}</span>
            <select class="lf-field__input cr-select" id="cr-industry" name="industry">
              <option value="">Select industry…</option>
              <option>Software Development</option>
              <option>IT Consulting</option>
              <option>Cloud Services</option>
              <option>Data Analytics &amp; AI</option>
              <option>Cybersecurity</option>
              <option>Digital Design &amp; UX</option>
              <option>IT Outsourcing</option>
              <option>Telecommunications</option>
              <option>BPO / Call Center</option>
              <option>Accounting &amp; Finance</option>
              <option>Marketing &amp; Advertising</option>
              <option>Manufacturing</option>
              <option>Healthcare &amp; Medical</option>
              <option>Education</option>
              <option>Government</option>
              <option>Non-profit / NGO</option>
              <option>Retail &amp; E-commerce</option>
              <option>Hospitality &amp; Tourism</option>
              <option>Construction &amp; Engineering</option>
              <option>Logistics &amp; Transportation</option>
              <option>Other</option>
            </select>
          </div>
          <span class="lf-field__error" id="err-cr-industry"></span>
        </div>
        <div class="lf-field">
          <div class="lf-field__wrap" id="wrap-cr-location">
            <span class="lf-field__icon">${icon('map-pin', 18)}</span>
            <input class="lf-field__input" type="text" id="cr-location" name="location"
              placeholder="x" />
            <label class="lf-field__label" for="cr-location">City / Location</label>
          </div>
        </div>
      </div>

      <!-- Row 3: Contact Person + Phone (two columns) -->
      <div class="cr-row2">
        <div class="lf-field">
          <div class="lf-field__wrap" id="wrap-cr-contact">
            <span class="lf-field__icon">${icon('user', 18)}</span>
            <input class="lf-field__input" type="text" id="cr-contact" name="contact_person"
              placeholder="x" />
            <label class="lf-field__label" for="cr-contact">Contact Person</label>
          </div>
          <span class="lf-field__error" id="err-cr-contact"></span>
        </div>
        <div class="lf-field">
          <div class="lf-field__wrap">
            <span class="lf-field__icon">${icon('phone', 18)}</span>
            <input class="lf-field__input" type="text" id="cr-phone" name="phone"
              placeholder="x" />
            <label class="lf-field__label" for="cr-phone">Phone Number</label>
          </div>
        </div>
      </div>

      <!-- Row 4: Email -->
      <div class="lf-field">
        <div class="lf-field__wrap" id="wrap-cr-email">
          <span class="lf-field__icon">${icon('mail', 18)}</span>
          <input class="lf-field__input" type="email" id="cr-email" name="email"
            placeholder="x" autocomplete="email" />
          <label class="lf-field__label" for="cr-email">Official Email Address</label>
        </div>
        <span class="lf-field__error" id="err-cr-email"></span>
      </div>

      <!-- Row 5: Password -->
      <div class="lf-field">
        <div class="lf-field__wrap" id="wrap-cr-password">
          <span class="lf-field__icon">${icon('lock', 18)}</span>
          <input class="lf-field__input" type="password" id="cr-password" name="password"
            placeholder="x" autocomplete="new-password" />
          <label class="lf-field__label" for="cr-password">Password</label>
          <button class="lf-field__toggle" id="cr-pw-toggle" type="button" aria-label="Toggle password visibility">
            ${icon('eye', 18)}
          </button>
        </div>
        <span class="lf-field__error" id="err-cr-password"></span>
        <div class="pw-strength" id="cr-pw-strength">
          <div class="pw-strength__bar" id="cr-ps-1"></div>
          <div class="pw-strength__bar" id="cr-ps-2"></div>
          <div class="pw-strength__bar" id="cr-ps-3"></div>
          <div class="pw-strength__bar" id="cr-ps-4"></div>
        </div>
        <div class="pw-strength__label" id="cr-pw-label"></div>
      </div>

      <!-- Row 6: Confirm Password -->
      <div class="lf-field">
        <div class="lf-field__wrap" id="wrap-cr-confirm">
          <span class="lf-field__icon">${icon('shield-check', 18)}</span>
          <input class="lf-field__input" type="password" id="cr-confirm" name="password_confirmation"
            placeholder="x" autocomplete="new-password" />
          <label class="lf-field__label" for="cr-confirm">Confirm Password</label>
          <button class="lf-field__toggle" id="cr-confirm-toggle" type="button" aria-label="Toggle confirm password">
            ${icon('eye', 18)}
          </button>
        </div>
        <span class="lf-field__error" id="err-cr-confirm"></span>
      </div>

      <!-- Server error -->
      <div id="cr-server-error" class="cr-server-error" style="display:none;"></div>

      <button class="login-submit" id="cr-submit" type="submit">
        <span id="cr-submit-label">${icon('building-2', 16)} Register Company</span>
      </button>
    </form>

    <p class="login-toggle">
      Already have an account?
      <span class="login-toggle__link" id="back-to-signin">Sign In</span>
    </p>

    <p class="login-footer">
      By registering you agree to our <a href="#">Terms</a> and <a href="#">Privacy Policy</a>.
    </p>

    <a class="login-admin-link" href="./admin-login.html">Admin Login</a>
  `;
}

/* ─── Company Registration Success View ─── */
function renderSuccessView() {
  const info = JSON.parse(sessionStorage.getItem('cr-success') || '{}');
  return `
    <div class="cr-success">
      <div class="cr-success__icon-wrap">
        <div class="cr-success__ring cr-success__ring--1"></div>
        <div class="cr-success__ring cr-success__ring--2"></div>
        <div class="cr-success__icon">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
      </div>

      <h2 class="cr-success__title">Registration Submitted!</h2>
      <p class="cr-success__subtitle">
        <strong>${info.company || 'Your company'}</strong> has been successfully registered on CHMSU HireMe.
      </p>

      <div class="cr-success__status-card">
        <div class="cr-success__status-row">
          <span class="cr-success__status-label">Account Status</span>
          <span class="cr-success__badge cr-success__badge--pending">⏳ Pending Review</span>
        </div>
        <div class="cr-success__status-row">
          <span class="cr-success__status-label">MOA Status</span>
          <span class="cr-success__badge cr-success__badge--moa">📋 Not Yet Established</span>
        </div>
        <div class="cr-success__status-row">
          <span class="cr-success__status-label">Email Sent To</span>
          <span class="cr-success__email">${info.email || '—'}</span>
        </div>
      </div>

      <div class="cr-success__steps">
        <div class="cr-success__step">
          <div class="cr-success__step-dot cr-success__step-dot--done">✓</div>
          <div class="cr-success__step-text">Account created &amp; confirmation email sent</div>
        </div>
        <div class="cr-success__step">
          <div class="cr-success__step-dot cr-success__step-dot--wait">2</div>
          <div class="cr-success__step-text">Admin reviews your company profile</div>
        </div>
        <div class="cr-success__step">
          <div class="cr-success__step-dot cr-success__step-dot--wait">3</div>
          <div class="cr-success__step-text">MOA signed → full access to post OJT &amp; jobs</div>
        </div>
      </div>

      <p class="cr-success__note">
        You can already <strong>log in</strong> to explore your company dashboard while your profile is under review.
      </p>

      <button class="login-submit" id="go-to-dashboard" type="button" style="margin-top:0.5rem;">
        Go to My Dashboard ${icon('arrow-right', 16)}
      </button>

      <p class="login-toggle" style="margin-top:1rem;">
        <span class="login-toggle__link" id="back-to-signin-from-success">← Back to Sign In</span>
      </p>
    </div>
  `;
}

/* ═══════════════════════════════════════
   EVENTS
   ═══════════════════════════════════════ */
function attachEvents() {
  // Theme toggle
  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    const html = document.documentElement;
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('hireme-theme', next);
    render();
  });

  // Tab switch
  document.querySelectorAll('.login-tabs__btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentView = btn.dataset.tab;
      render();
    });
  });

  // Toggle link (sign in ↔ sign up)
  document.getElementById('view-toggle')?.addEventListener('click', () => {
    currentView = currentView === 'signin' ? 'signup' : 'signin';
    render();
  });

  // Company CTA button
  document.getElementById('go-company-signup')?.addEventListener('click', () => {
    currentView = 'company-signup';
    render();
  });

  // Back to sign in from company form
  document.getElementById('back-to-signin')?.addEventListener('click', () => {
    currentView = 'signin';
    render();
  });

  // Back to sign in from success page
  document.getElementById('back-to-signin-from-success')?.addEventListener('click', () => {
    sessionStorage.removeItem('cr-success');
    currentView = 'signin';
    render();
  });

  // Go to dashboard from success page
  document.getElementById('go-to-dashboard')?.addEventListener('click', () => {
    window.location.href = '/company/';
  });

  // Password toggle — standard form
  document.getElementById('pw-toggle')?.addEventListener('click', () => {
    const input = document.getElementById('password');
    const btn = document.getElementById('pw-toggle');
    if (!input) return;
    const isHidden = input.type === 'password';
    input.type = isHidden ? 'text' : 'password';
    btn.innerHTML = icon(isHidden ? 'eye-off' : 'eye', 18);
  });

  // Password toggle — company form
  document.getElementById('cr-pw-toggle')?.addEventListener('click', () => {
    const input = document.getElementById('cr-password');
    const btn = document.getElementById('cr-pw-toggle');
    if (!input) return;
    const isHidden = input.type === 'password';
    input.type = isHidden ? 'text' : 'password';
    btn.innerHTML = icon(isHidden ? 'eye-off' : 'eye', 18);
  });

  // Confirm password toggle
  document.getElementById('cr-confirm-toggle')?.addEventListener('click', () => {
    const input = document.getElementById('cr-confirm');
    const btn = document.getElementById('cr-confirm-toggle');
    if (!input) return;
    const isHidden = input.type === 'password';
    input.type = isHidden ? 'text' : 'password';
    btn.innerHTML = icon(isHidden ? 'eye-off' : 'eye', 18);
  });

  // Password strength — standard signup
  document.getElementById('password')?.addEventListener('input', (e) => {
    if (currentView === 'signup') updatePasswordStrength(e.target.value, 'ps', 'pw-label');
  });

  // Password strength — company form
  document.getElementById('cr-password')?.addEventListener('input', (e) => {
    updatePasswordStrength(e.target.value, 'cr-ps', 'cr-pw-label');
  });

  // Social buttons (stub)
  document.getElementById('google-btn')?.addEventListener('click', () => {
    showToast('Google sign-in coming soon');
  });
  document.getElementById('linkedin-btn')?.addEventListener('click', () => {
    showToast('LinkedIn sign-in coming soon');
  });

  // Form submit — standard
  document.getElementById('login-form')?.addEventListener('submit', handleSubmit);

  // Form submit — company
  document.getElementById('company-form')?.addEventListener('submit', handleCompanySubmit);
}

/* ── Password Strength ── */
function updatePasswordStrength(pw, barPrefix, labelId) {
  const bars = [1,2,3,4].map(i => document.getElementById(barPrefix + '-' + i));
  const label = document.getElementById(labelId);
  if (!bars[0] || !label) return;

  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  const levels = ['', 'weak', 'medium', 'medium', 'strong'];
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  bars.forEach((bar, i) => {
    bar.className = 'pw-strength__bar';
    if (i < score) bar.classList.add('pw-strength__bar--' + levels[score]);
  });
  label.textContent = pw.length ? labels[score] : '';
}

/* ── Show field error ── */
function showError(id, msg) {
  const wrap = document.getElementById('wrap-' + id);
  const err  = document.getElementById('err-' + id);
  wrap?.classList.add('lf-field__wrap--error');
  if (err) { err.textContent = msg; err.classList.add('lf-field__error--visible'); }
}

function clearErrors() {
  document.querySelectorAll('.lf-field__wrap--error').forEach(el => el.classList.remove('lf-field__wrap--error'));
  document.querySelectorAll('.lf-field__error--visible').forEach(el => {
    el.textContent = '';
    el.classList.remove('lf-field__error--visible');
  });
}

/* ── Toast notification ── */
function showToast(msg) {
  const existing = document.querySelector('.lp-toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = 'lp-toast';
  toast.textContent = msg;
  toast.style.cssText = `
    position:fixed;bottom:1.5rem;left:50%;transform:translateX(-50%);
    background:var(--bg-elevated);border:1px solid var(--border-default);
    color:var(--text-primary);padding:12px 24px;border-radius:999px;
    font-size:0.825rem;font-weight:500;box-shadow:var(--shadow-lg);
    animation:lp-enter 0.35s ease both;z-index:9999;white-space:nowrap;
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2800);
}

/* ── Company Registration Submit ── */
async function handleCompanySubmit(e) {
  e.preventDefault();
  clearErrors();

  const company  = document.getElementById('cr-company')?.value.trim() || '';
  const industry = document.getElementById('cr-industry')?.value || '';
  const location = document.getElementById('cr-location')?.value.trim() || '';
  const contact  = document.getElementById('cr-contact')?.value.trim() || '';
  const phone    = document.getElementById('cr-phone')?.value.trim() || '';
  const email    = document.getElementById('cr-email')?.value.trim() || '';
  const password = document.getElementById('cr-password')?.value || '';
  const confirm  = document.getElementById('cr-confirm')?.value || '';

  let valid = true;
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!company)                        { showError('cr-company',  'Company name is required.'); valid = false; }
  if (!industry)                       { showError('cr-industry', 'Please select an industry.'); valid = false; }
  if (!contact)                        { showError('cr-contact',  'Contact person is required.'); valid = false; }
  if (!email || !emailRe.test(email))  { showError('cr-email',    'Please enter a valid email address.'); valid = false; }
  if (!password || password.length < 8){ showError('cr-password', 'Password must be at least 8 characters.'); valid = false; }
  if (password && confirm !== password){ showError('cr-confirm',  'Passwords do not match.'); valid = false; }
  if (!valid) return;

  const btn = document.getElementById('cr-submit');
  const lbl = document.getElementById('cr-submit-label');
  btn.disabled = true;
  lbl.innerHTML = '<span class="login-spinner"></span> Registering…';

  const serverErr = document.getElementById('cr-server-error');
  serverErr.style.display = 'none';

  try {
    const res = await fetch('http://localhost:8000/api/auth/register/company', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        company_name:          company,
        industry,
        location:              location || undefined,
        contact_person:        contact,
        phone:                 phone || undefined,
        email,
        password,
        password_confirmation: confirm,
      }),
    });
    const data = await res.json();

    if (!res.ok) {
      // Show field-level or server error
      const errors = data.errors || {};
      let shown = false;
      if (errors.email)         { showError('cr-email',    errors.email[0]); shown = true; }
      if (errors.company_name)  { showError('cr-company',  errors.company_name[0]); shown = true; }
      if (errors.password)      { showError('cr-password', errors.password[0]); shown = true; }
      if (!shown) {
        serverErr.textContent = data.message || 'Registration failed. Please try again.';
        serverErr.style.display = 'block';
      }
      btn.disabled = false;
      lbl.innerHTML = `${icon('building-2', 16)} Register Company`;
      return;
    }

    // Save token + user
    localStorage.setItem('hireme_token', data.token);
    localStorage.setItem('hireme_user', JSON.stringify(data.user));

    // Store info for success page
    sessionStorage.setItem('cr-success', JSON.stringify({
      company,
      email,
      emailSent: data.email_sent,
    }));

    // Show the success / confirmation view
    currentView = 'company-success';
    render();

  } catch {
    serverErr.textContent = 'Could not connect to server. Is the backend running?';
    serverErr.style.display = 'block';
    btn.disabled = false;
    lbl.innerHTML = `${icon('building-2', 16)} Register Company`;
  }
}

/* ── Standard Sign In / Sign Up Submit ── */
async function handleSubmit(e) {
  e.preventDefault();
  clearErrors();

  const email    = document.getElementById('email')?.value.trim() || '';
  const password = document.getElementById('password')?.value || '';
  const name     = document.getElementById('name')?.value.trim() || '';

  let valid = true;
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (currentView === 'signup' && !name) {
    showError('name', 'Please enter your full name.');
    valid = false;
  }
  if (!email || !emailRe.test(email)) {
    showError('email', 'Please enter a valid email address.');
    valid = false;
  }
  if (!password || password.length < 8) {
    showError('password', 'Password must be at least 8 characters.');
    valid = false;
  }
  if (!valid) return;

  const btn = document.getElementById('submit-btn');
  const lbl = document.getElementById('submit-label');
  btn.disabled = true;
  lbl.innerHTML = '<span class="login-spinner"></span> Please wait…';

  if (currentView === 'signup') {
    // Store credentials temporarily — role + profile collected on onboarding
    sessionStorage.setItem('hireme-signup', JSON.stringify({ name, email, password }));
    window.location.href = './onboarding.html';
    return;
  }

  // Sign-in: call real API
  try {
    const res = await fetch('http://localhost:8000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (!res.ok) {
      const msg = data.errors?.email?.[0] || data.message || 'Invalid credentials.';
      showError('email', msg);
      btn.disabled = false;
      lbl.textContent = 'Sign In';
      return;
    }

    localStorage.setItem('hireme_token', data.token);
    localStorage.setItem('hireme_user', JSON.stringify(data.user));

    const destinations = {
      student:    '/main/',
      graduate:   '/jobseeker/',
      jobseeker:  '/jobseeker/',
      company:    '/company/',
      supervisor: '/supervisors/',
      admin:      '/admin/',
    };
    window.location.href = destinations[data.user.role] || '/main/';
  } catch {
    showError('email', 'Could not connect to server. Is the backend running?');
    btn.disabled = false;
    lbl.textContent = 'Sign In';
  }
}

/* ── Init ── */
render();
