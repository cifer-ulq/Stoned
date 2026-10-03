/**
 * CHMSU HireMe — Company Onboarding & Setup Page
 * Accessed via emailed invitation link: ?token=xxx&email=yyy
 *
 * Streamlined 2-Step Flow:
 *   Step 1: Set Secure Password
 *   Step 2: Complete Company Profile
 *   Step 3: Account Ready & Redirect to Portal
 */

import './styles/variables.css';
import './styles/reset.css';
import './styles/admin-login.css';
import './styles/set-password.css';
import { icon } from './icons.js';

/* ── Theme Initialization ── */
const savedTheme = localStorage.getItem('hireme-theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);

/* ── URL Query Parameters ── */
const params = new URLSearchParams(window.location.search);
const token  = params.get('token') || '';
const email  = params.get('email') || '';

const app = document.getElementById('app');

/* ── Session & Auth State ── */
let authToken   = '';
let authUser    = null;
let companyData = null;

/* ═══════════════════════════════════════════════════════════
   STEPPER NAVIGATION COMPONENT
   ═══════════════════════════════════════════════════════════ */
function renderStepper(currentStep) {
  const steps = [
    { num: 1, label: 'Password Setup' },
    { num: 2, label: 'Company Profile' },
  ];

  return `
    <div class="sp-stepper">
      ${steps.map((s, idx) => {
        const isActive = currentStep === s.num;
        const isDone   = currentStep > s.num;
        return `
          ${idx > 0 ? `<div class="sp-step-item__line ${isDone ? 'sp-step-item__line--done' : ''}"></div>` : ''}
          <div class="sp-step-item ${isActive ? 'sp-step-item--active' : ''} ${isDone ? 'sp-step-item--done' : ''}">
            <div class="sp-step-item__num">${isDone ? icon('check', 14) : s.num}</div>
            <span>${s.label}</span>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

/* ═══════════════════════════════════════════════════════════
   TOP NAVIGATION BAR
   ═══════════════════════════════════════════════════════════ */
function renderNav() {
  const theme = document.documentElement.getAttribute('data-theme');
  return `
    <header class="sp-nav">
      <a href="./" class="sp-brand">
        <div class="sp-brand__logo">H</div>
        <div class="sp-brand__info">
          <span class="sp-brand__sub">Carlos Hilado Memorial State University</span>
          <div class="sp-brand__name">Hire<span>Me</span></div>
        </div>
      </a>
      <div class="sp-nav__actions">
        <button class="sp-theme-btn" id="theme-toggle" type="button" aria-label="Toggle theme">
          ${theme === 'dark' ? icon('sun', 18) : icon('moon', 18)}
        </button>
      </div>
    </header>
  `;
}

/* ═══════════════════════════════════════════════════════════
   INVALID / EXPIRED LINK SCREEN
   ═══════════════════════════════════════════════════════════ */
function renderInvalid() {
  app.innerHTML = `
    <div class="sp-page">
      ${renderNav()}
      <main class="sp-main">
        <div class="sp-card" style="max-width: 480px; text-align: center;">
          <div class="sp-card__accent" style="background: linear-gradient(90deg, #EF4444, #F59E0B);"></div>
          <div class="sp-card__body" style="padding: 3rem 2rem;">
            <div style="width: 64px; height: 64px; border-radius: 50%; background: rgba(239, 68, 68, 0.1); color: #EF4444; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem;">
              ${icon('alert-triangle', 32)}
            </div>
            <div class="sp-badge" style="background: rgba(239, 68, 68, 0.1); border-color: rgba(239, 68, 68, 0.25); color: #EF4444; margin-bottom: 1rem;">
              <span class="sp-badge__dot" style="background: #EF4444;"></span>
              Invalid or Expired Link
            </div>
            <h1 class="sp-title" style="font-size: 1.4rem;">Activation Link Unavailable</h1>
            <p class="sp-subtitle" style="margin-bottom: 2rem;">
              This registration invitation link is missing required verification tokens or has exceeded the 60-minute security window.
            </p>
            <div style="display: flex; flex-direction: column; gap: 10px;">
              <a href="mailto:gimaranganvhan@gmail.com" class="sp-btn-submit" style="text-decoration: none;">
                ${icon('mail', 16)} Contact CIER Office
              </a>
              <a href="./" style="display: inline-block; padding: 10px; color: var(--text-secondary); text-decoration: none; font-size: 0.85rem; font-weight: 500;">
                Return to Login
              </a>
            </div>
          </div>
        </div>
      </main>
      <footer class="sp-footer">
        Carlos Hilado Memorial State University &bull; CIER Partner Onboarding &bull; Need help? <a href="mailto:gimaranganvhan@gmail.com">gimaranganvhan@gmail.com</a>
      </footer>
    </div>
  `;

  attachThemeToggle();
}

/* ═══════════════════════════════════════════════════════════
   STEP 1: SET PASSWORD
   ═══════════════════════════════════════════════════════════ */
function renderStep1() {
  app.innerHTML = `
    <div class="sp-page">
      ${renderNav()}
      <main class="sp-main">
        <div class="sp-card">
          <div class="sp-card__accent"></div>
          <div class="sp-card__body">

            ${renderStepper(1)}

            <div class="sp-header">
              <div class="sp-badge">
                <span class="sp-badge__dot"></span>
                Partner Account Setup
              </div>
              <h1 class="sp-title">Create Your Password</h1>
              <p class="sp-subtitle">
                Set a secure password for your official <strong>CHMSU HireMe</strong> company account.
              </p>
            </div>

            <!-- Email Identity Notice -->
            <div class="sp-account-badge">
              <span style="color: var(--color-primary);">${icon('mail', 16)}</span>
              <span>Registering account for: <strong>${email}</strong></span>
            </div>

            <form class="sp-form" id="sp-password-form" novalidate>

              <!-- New Password Field -->
              <div class="sp-field-group">
                <label class="sp-field-label" for="password">
                  New Password <span class="sp-required">*</span>
                </label>
                <div class="sp-input-box" id="box-password">
                  <span class="sp-input-icon">${icon('lock', 16)}</span>
                  <input
                    class="sp-input"
                    type="password"
                    id="password"
                    placeholder="Create a strong password"
                    autocomplete="new-password"
                    required
                  />
                  <button class="sp-toggle-btn" id="toggle-pw-1" type="button" aria-label="Show password">
                    ${icon('eye', 16)}
                  </button>
                </div>
                <div class="sp-field-error" id="err-password"></div>

                <!-- Password Strength Visual Indicator -->
                <div class="sp-strength-meter">
                  <div class="sp-strength-bar" id="str-1"></div>
                  <div class="sp-strength-bar" id="str-2"></div>
                  <div class="sp-strength-bar" id="str-3"></div>
                  <div class="sp-strength-bar" id="str-4"></div>
                </div>
                <div class="sp-strength-label" id="str-label"></div>

                <!-- Requirements Checklist -->
                <div class="sp-criteria">
                  <div class="sp-criteria-item" id="crit-len">
                    <span class="sp-criteria-item__icon">${icon('check', 10)}</span>
                    <span>At least 8 characters</span>
                  </div>
                  <div class="sp-criteria-item" id="crit-upper">
                    <span class="sp-criteria-item__icon">${icon('check', 10)}</span>
                    <span>Contains an uppercase letter</span>
                  </div>
                  <div class="sp-criteria-item" id="crit-num">
                    <span class="sp-criteria-item__icon">${icon('check', 10)}</span>
                    <span>Contains a number or special symbol</span>
                  </div>
                </div>
              </div>

              <!-- Confirm Password Field -->
              <div class="sp-field-group">
                <label class="sp-field-label" for="password_confirmation">
                  Confirm Password <span class="sp-required">*</span>
                </label>
                <div class="sp-input-box" id="box-confirm">
                  <span class="sp-input-icon">${icon('lock', 16)}</span>
                  <input
                    class="sp-input"
                    type="password"
                    id="password_confirmation"
                    placeholder="Re-enter your password to confirm"
                    autocomplete="new-password"
                    required
                  />
                  <button class="sp-toggle-btn" id="toggle-pw-2" type="button" aria-label="Show password">
                    ${icon('eye', 16)}
                  </button>
                </div>
                <div class="sp-field-error" id="err-confirm"></div>
              </div>

              <!-- Server Error Message Box -->
              <div id="sp-server-error" class="sp-alert-error" style="display: none;"></div>

              <!-- Submit Button -->
              <button class="sp-btn-submit" id="sp-submit-btn" type="submit">
                <span id="sp-submit-text">Save Password &amp; Continue &rarr;</span>
              </button>

            </form>

          </div>
        </div>
      </main>

      <footer class="sp-footer">
        Carlos Hilado Memorial State University &bull; Center for International and External Relations (CIER)<br>
        Questions? Contact us at <a href="mailto:gimaranganvhan@gmail.com">gimaranganvhan@gmail.com</a>
      </footer>
    </div>
  `;

  attachThemeToggle();
  attachStep1Events();
}

/* ═══════════════════════════════════════════════════════════
   STEP 2: COMPLETE COMPANY PROFILE
   (Note: MOA Review/Acceptance completely removed per user request)
   ═══════════════════════════════════════════════════════════ */
async function renderStep2() {
  const currentYear = new Date().getFullYear();

  app.innerHTML = `
    <div class="sp-page">
      ${renderNav()}
      <main class="sp-main">
        <div class="sp-card sp-card--wide">
          <div class="sp-card__accent"></div>
          <div class="sp-card__body">

            ${renderStepper(2)}

            <div class="sp-header">
              <div class="sp-badge">
                <span class="sp-badge__dot"></span>
                Step 2 of 2
              </div>
              <h1 class="sp-title">Complete Company Profile</h1>
              <p class="sp-subtitle">
                Provide details about your organization so CHMSU coordinators and students can connect with you.
              </p>
            </div>

            <!-- Loading Skeleton for Pre-fetched Profile Data -->
            <div id="profile-prefill-banner" style="margin-bottom: 1.5rem;">
              <div class="sp-account-badge" style="border-left-color: #10B981;">
                <span style="color: #10B981;">${icon('shield-check', 16)}</span>
                <span>Account activated. Finalize your profile details to launch your company portal.</span>
              </div>
            </div>

            <form class="sp-form" id="company-profile-form" novalidate>

              <!-- ── Section 1: About the Company ── -->
              <div class="sp-section-box">
                <div class="sp-section-head">
                  <div class="sp-section-icon">${icon('building-2', 18)}</div>
                  <div>
                    <div class="sp-section-title">Organization Information</div>
                    <div class="sp-section-desc">Key details visible to prospective student applicants</div>
                  </div>
                </div>

                <div class="sp-grid-2">
                  <!-- Company Description -->
                  <div class="sp-field-group sp-grid-full">
                    <label class="sp-field-label" for="p-description">
                      Company Overview &amp; Mission <span class="sp-required">*</span>
                    </label>
                    <textarea
                      class="sp-textarea"
                      id="p-description"
                      rows="4"
                      maxlength="1000"
                      placeholder="Describe your organization's mission, core services, industry focus, and work culture…"
                      required
                    ></textarea>
                    <div class="sp-char-counter"><span id="p-desc-count">0</span> / 1000 characters</div>
                    <div class="sp-field-error" id="err-p-description"></div>
                  </div>

                  <!-- Ownership Type -->
                  <div class="sp-field-group">
                    <label class="sp-field-label" for="p-ownership">
                      Ownership Structure <span class="sp-required">*</span>
                    </label>
                    <select class="sp-select" id="p-ownership" required>
                      <option value="">Select ownership type</option>
                      <option value="Private Corporation">Private Corporation</option>
                      <option value="Public Corporation">Public Corporation</option>
                      <option value="Sole Proprietorship">Sole Proprietorship</option>
                      <option value="Partnership">Partnership</option>
                      <option value="Cooperative">Cooperative</option>
                      <option value="Non-profit / NGO">Non-profit / NGO</option>
                      <option value="Government Agency">Government Agency</option>
                      <option value="State-owned Enterprise">State-owned Enterprise</option>
                    </select>
                    <div class="sp-field-error" id="err-p-ownership"></div>
                  </div>

                  <!-- Company Size -->
                  <div class="sp-field-group">
                    <label class="sp-field-label" for="p-size">
                      Company Size <span class="sp-required">*</span>
                    </label>
                    <select class="sp-select" id="p-size" required>
                      <option value="">Select workforce size</option>
                      <option value="1-10">1 – 10 employees (Startup / Boutique)</option>
                      <option value="11-50">11 – 50 employees (Small Enterprise)</option>
                      <option value="51-200">51 – 200 employees (Medium Business)</option>
                      <option value="201-500">201 – 500 employees (Mid-to-Large)</option>
                      <option value="501-1000">501 – 1,000 employees (Large Enterprise)</option>
                      <option value="1001-5000">1,001 – 5,000 employees (Corporation)</option>
                      <option value="5001+">5,001+ employees (Conglomerate)</option>
                    </select>
                    <div class="sp-field-error" id="err-p-size"></div>
                  </div>

                  <!-- Year Founded -->
                  <div class="sp-field-group">
                    <label class="sp-field-label" for="p-year">
                      Year Founded
                    </label>
                    <div class="sp-input-box">
                      <span class="sp-input-icon">${icon('calendar', 16)}</span>
                      <input
                        class="sp-input"
                        type="number"
                        id="p-year"
                        min="1900"
                        max="${currentYear}"
                        placeholder="e.g. 2015"
                      />
                    </div>
                  </div>

                  <!-- Company Website -->
                  <div class="sp-field-group">
                    <label class="sp-field-label" for="p-website">
                      Official Website
                    </label>
                    <div class="sp-input-box">
                      <span class="sp-input-icon">${icon('globe', 16)}</span>
                      <input
                        class="sp-input"
                        type="url"
                        id="p-website"
                        placeholder="https://example.com"
                      />
                    </div>
                    <div class="sp-field-error" id="err-p-website"></div>
                  </div>
                </div>
              </div>

              <!-- ── Section 2: Workplace Address ── -->
              <div class="sp-section-box">
                <div class="sp-section-head">
                  <div class="sp-section-icon">${icon('map-pin', 18)}</div>
                  <div>
                    <div class="sp-section-title">Office &amp; Workplace Location</div>
                    <div class="sp-section-desc">Physical address where students and interns report</div>
                  </div>
                </div>

                <div class="sp-grid-2">
                  <div class="sp-field-group sp-grid-full">
                    <label class="sp-field-label" for="p-address">
                      Full Office Address <span class="sp-required">*</span>
                    </label>
                    <div class="sp-input-box">
                      <span class="sp-input-icon">${icon('navigation', 16)}</span>
                      <input
                        class="sp-input"
                        type="text"
                        id="p-address"
                        placeholder="Floor / Unit, Building, Street, Barangay, City / Municipality, Province"
                        required
                      />
                    </div>
                    <div class="sp-field-error" id="err-p-address"></div>
                  </div>
                </div>
              </div>

              <!-- ── Section 3: Primary Contact Person ── -->
              <div class="sp-section-box">
                <div class="sp-section-head">
                  <div class="sp-section-icon">${icon('user', 18)}</div>
                  <div>
                    <div class="sp-section-title">Authorized Representative</div>
                    <div class="sp-section-desc">Designated company coordinator for CHMSU communications</div>
                  </div>
                </div>

                <div class="sp-grid-2">
                  <!-- Contact Title / Position -->
                  <div class="sp-field-group">
                    <label class="sp-field-label" for="p-title">
                      Job Title / Position <span class="sp-required">*</span>
                    </label>
                    <div class="sp-input-box">
                      <span class="sp-input-icon">${icon('award', 16)}</span>
                      <input
                        class="sp-input"
                        type="text"
                        id="p-title"
                        placeholder="e.g. HR Director, Talent Acquisition Manager"
                        required
                      />
                    </div>
                    <div class="sp-field-error" id="err-p-title"></div>
                  </div>

                  <!-- Direct Phone Number -->
                  <div class="sp-field-group">
                    <label class="sp-field-label" for="p-phone">
                      Direct Contact Phone <span class="sp-required">*</span>
                    </label>
                    <div class="sp-input-box">
                      <span class="sp-input-icon">${icon('phone', 16)}</span>
                      <input
                        class="sp-input"
                        type="tel"
                        id="p-phone"
                        placeholder="e.g. +63 917 123 4567"
                        required
                      />
                    </div>
                    <div class="sp-field-error" id="err-p-phone"></div>
                  </div>

                  <!-- LinkedIn Profile -->
                  <div class="sp-field-group sp-grid-full">
                    <label class="sp-field-label" for="p-linkedin">
                      Company LinkedIn Profile <span style="font-weight: 400; color: var(--text-tertiary);">(Optional)</span>
                    </label>
                    <div class="sp-input-box">
                      <span class="sp-input-icon">${icon('link', 16)}</span>
                      <input
                        class="sp-input"
                        type="url"
                        id="p-linkedin"
                        placeholder="https://linkedin.com/company/your-organization"
                      />
                    </div>
                    <div class="sp-field-error" id="err-p-linkedin"></div>
                  </div>
                </div>
              </div>

              <!-- Server Error Box -->
              <div id="profile-server-error" class="sp-alert-error" style="display: none;"></div>

              <!-- Submit Button -->
              <button class="sp-btn-submit" id="profile-submit-btn" type="submit">
                <span id="profile-submit-text">Complete Setup &amp; Access Dashboard &rarr;</span>
              </button>

            </form>

          </div>
        </div>
      </main>

      <footer class="sp-footer">
        Carlos Hilado Memorial State University &bull; Center for International and External Relations (CIER)<br>
        All information is strictly safeguarded in accordance with the Data Privacy Act of 2012.
      </footer>
    </div>
  `;

  attachThemeToggle();
  attachStep2Events();

  // Try to pre-fill available profile data from API
  try {
    const res = await fetch('http://localhost:8000/api/company/profile', {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Accept': 'application/json',
      },
    });
    if (res.ok) {
      const json = await res.json();
      companyData = json?.data || null;
      if (companyData) {
        if (companyData.company_location && !document.getElementById('p-address').value) {
          document.getElementById('p-address').value = companyData.company_location;
        }
        if (companyData.contact_phone && !document.getElementById('p-phone').value) {
          document.getElementById('p-phone').value = companyData.contact_phone;
        }
        if (companyData.company_name) {
          const banner = document.getElementById('profile-prefill-banner');
          if (banner) {
            banner.innerHTML = `
              <div class="sp-account-badge" style="border-left-color: var(--color-primary);">
                <span style="color: var(--color-primary);">${icon('building', 16)}</span>
                <span>Configuring profile for: <strong style="color: var(--color-primary); font-size: 0.95rem;">${companyData.company_name}</strong></span>
              </div>
            `;
          }
        }
      }
    }
  } catch {
    // Gracefully ignore fetch failures; user can enter fields manually
  }
}

/* ═══════════════════════════════════════════════════════════
   SUCCESS / COMPLETION SCREEN
   ═══════════════════════════════════════════════════════════ */
function renderSuccess() {
  app.innerHTML = `
    <div class="sp-page">
      ${renderNav()}
      <main class="sp-main">
        <div class="sp-card" style="max-width: 520px; text-align: center;">
          <div class="sp-card__accent" style="background: linear-gradient(90deg, #10B981, #005930);"></div>
          <div class="sp-card__body sp-success-view">
            <div class="sp-success-icon-wrap">
              ${icon('check-circle', 40)}
            </div>
            <div class="sp-badge" style="background: rgba(16, 185, 129, 0.1); border-color: rgba(16, 185, 129, 0.3); color: #10B981;">
              <span class="sp-badge__dot" style="background: #10B981;"></span>
              Registration Complete
            </div>
            <h1 class="sp-title" style="font-size: 1.6rem; margin-bottom: 0.5rem;">
              Welcome to CHMSU HireMe!
            </h1>
            <p class="sp-subtitle" style="font-size: 0.9rem;">
              Your company credentials and profile have been successfully established. Your partner dashboard is now ready.
            </p>

            <div class="sp-success-timer">
              Redirecting you to the company portal in <strong id="countdown-sec" style="color: var(--color-primary);">2</strong> seconds…
            </div>

            <a href="/company/" class="sp-btn-submit" style="text-decoration: none; display: inline-flex;">
              Launch Company Dashboard &rarr;
            </a>
          </div>
        </div>
      </main>
      <footer class="sp-footer">
        Carlos Hilado Memorial State University &bull; CIER Partner Portal
      </footer>
    </div>
  `;

  attachThemeToggle();

  let remaining = 2;
  const timer = setInterval(() => {
    remaining--;
    const el = document.getElementById('countdown-sec');
    if (el) el.textContent = remaining;
    if (remaining <= 0) {
      clearInterval(timer);
      window.location.href = '/company/';
    }
  }, 1000);
}

/* ═══════════════════════════════════════════════════════════
   THEME TOGGLE ATTACHMENT
   ═══════════════════════════════════════════════════════════ */
function attachThemeToggle() {
  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    const html = document.documentElement;
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('hireme-theme', next);

    const btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.innerHTML = next === 'dark' ? icon('sun', 18) : icon('moon', 18);
    }
  });
}

/* ═══════════════════════════════════════════════════════════
   STEP 1 EVENT HANDLERS
   ═══════════════════════════════════════════════════════════ */
function attachStep1Events() {
  // Password Visibility Toggles
  const setupToggle = (btnId, inputId) => {
    document.getElementById(btnId)?.addEventListener('click', () => {
      const inp = document.getElementById(inputId);
      const btn = document.getElementById(btnId);
      if (!inp || !btn) return;
      const isPassword = inp.type === 'password';
      inp.type = isPassword ? 'text' : 'password';
      btn.innerHTML = isPassword ? icon('eye-off', 16) : icon('eye', 16);
    });
  };

  setupToggle('toggle-pw-1', 'password');
  setupToggle('toggle-pw-2', 'password_confirmation');

  // Real-time strength and criteria checks
  const pwInput = document.getElementById('password');
  const confirmInput = document.getElementById('password_confirmation');

  pwInput?.addEventListener('input', () => {
    evaluatePassword(pwInput.value, confirmInput?.value);
  });

  confirmInput?.addEventListener('input', () => {
    evaluatePassword(pwInput?.value, confirmInput.value);
  });

  document.getElementById('sp-password-form')?.addEventListener('submit', handleStep1Submit);
}

function evaluatePassword(pw, confirmPw) {
  const hasLength = pw.length >= 8;
  const hasUpper  = /[A-Z]/.test(pw);
  const hasNumOrSpec = /[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pw);

  // Update Checklist items
  const updateCrit = (id, isValid) => {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('valid', isValid);
  };
  updateCrit('crit-len', hasLength);
  updateCrit('crit-upper', hasUpper);
  updateCrit('crit-num', hasNumOrSpec);

  // Score calculation
  let score = 0;
  if (hasLength) score++;
  if (hasUpper) score++;
  if (hasNumOrSpec) score++;
  if (pw.length >= 12 && hasUpper && hasNumOrSpec) score++;

  const bars = [1, 2, 3, 4].map(i => document.getElementById('str-' + i));
  const label = document.getElementById('str-label');

  const colors = ['', '#EF4444', '#F59E0B', '#10B981', '#005930'];
  const labels = ['', 'Weak password', 'Fair password', 'Good password', 'Strong password'];

  bars.forEach((bar, idx) => {
    if (bar) {
      bar.style.background = idx < score ? colors[score] : 'var(--border-default)';
    }
  });

  if (label) {
    label.textContent = pw.length ? labels[score] : '';
    label.style.color = colors[score] || 'var(--text-tertiary)';
  }

  // Real-time Confirm Password Validation
  const errConfirm = document.getElementById('err-confirm');
  const boxConfirm = document.getElementById('box-confirm');
  if (confirmPw && confirmPw.length > 0) {
    if (pw !== confirmPw) {
      if (boxConfirm) boxConfirm.classList.add('sp-input-box--error');
      if (errConfirm) {
        errConfirm.textContent = 'Passwords do not match.';
        errConfirm.style.display = 'block';
      }
    } else {
      if (boxConfirm) boxConfirm.classList.remove('sp-input-box--error');
      if (errConfirm) {
        errConfirm.style.display = 'none';
      }
    }
  }
}

async function handleStep1Submit(e) {
  e.preventDefault();

  // Reset errors
  document.querySelectorAll('.sp-input-box--error').forEach(el => el.classList.remove('sp-input-box--error'));
  document.querySelectorAll('.sp-field-error').forEach(el => { el.textContent = ''; el.style.display = 'none'; });
  const serverErr = document.getElementById('sp-server-error');
  if (serverErr) serverErr.style.display = 'none';

  const password = document.getElementById('password')?.value || '';
  const confirm  = document.getElementById('password_confirmation')?.value || '';

  const triggerError = (boxId, errId, msg) => {
    document.getElementById(boxId)?.classList.add('sp-input-box--error');
    const errEl = document.getElementById(errId);
    if (errEl) {
      errEl.textContent = msg;
      errEl.style.display = 'block';
    }
  };

  let isValid = true;
  if (!password || password.length < 8) {
    triggerError('box-password', 'err-password', 'Password must be at least 8 characters long.');
    isValid = false;
  }
  if (password !== confirm) {
    triggerError('box-confirm', 'err-confirm', 'Passwords do not match.');
    isValid = false;
  }
  if (!isValid) return;

  const btn = document.getElementById('sp-submit-btn');
  const txt = document.getElementById('sp-submit-text');
  btn.disabled = true;
  txt.innerHTML = `Saving Credentials…`;

  try {
    const res = await fetch('http://localhost:8000/api/auth/set-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        email,
        token,
        password,
        password_confirmation: confirm,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      if (serverErr) {
        serverErr.textContent = data.message || 'Unable to update password. Please check your link.';
        serverErr.style.display = 'flex';
      }
      btn.disabled = false;
      txt.innerHTML = `Save Password &amp; Continue &rarr;`;
      return;
    }

    authToken = data.token;
    authUser  = data.user;
    localStorage.setItem('hireme_token', authToken);
    localStorage.setItem('hireme_user', JSON.stringify(authUser));

    // Transition straight to Step 2 (Company Profile) without MOA prompt
    renderStep2();
  } catch {
    if (serverErr) {
      serverErr.textContent = 'Network error: could not connect to server. Ensure API is running.';
      serverErr.style.display = 'flex';
    }
    btn.disabled = false;
    txt.innerHTML = `Save Password &amp; Continue &rarr;`;
  }
}

/* ═══════════════════════════════════════════════════════════
   STEP 2 EVENT HANDLERS
   ═══════════════════════════════════════════════════════════ */
function attachStep2Events() {
  const descEl = document.getElementById('p-description');
  const countEl = document.getElementById('p-desc-count');

  descEl?.addEventListener('input', () => {
    if (countEl) countEl.textContent = descEl.value.length;
  });

  document.getElementById('company-profile-form')?.addEventListener('submit', handleStep2Submit);
}

async function handleStep2Submit(e) {
  e.preventDefault();

  document.querySelectorAll('.sp-field-error').forEach(el => { el.textContent = ''; el.style.display = 'none'; });
  const serverErr = document.getElementById('profile-server-error');
  if (serverErr) serverErr.style.display = 'none';

  const description = document.getElementById('p-description')?.value.trim() || '';
  const ownership   = document.getElementById('p-ownership')?.value || '';
  const size        = document.getElementById('p-size')?.value || '';
  const year        = document.getElementById('p-year')?.value.trim() || '';
  const website     = document.getElementById('p-website')?.value.trim() || '';
  const address     = document.getElementById('p-address')?.value.trim() || '';
  const title       = document.getElementById('p-title')?.value.trim() || '';
  const phone       = document.getElementById('p-phone')?.value.trim() || '';
  const linkedin    = document.getElementById('p-linkedin')?.value.trim() || '';

  const triggerError = (errId, msg) => {
    const el = document.getElementById(errId);
    if (el) {
      el.textContent = msg;
      el.style.display = 'block';
    }
  };

  let isValid = true;
  if (!description) {
    triggerError('err-p-description', 'Please provide a brief company overview.');
    isValid = false;
  }
  if (!ownership) {
    triggerError('err-p-ownership', 'Please select your ownership structure.');
    isValid = false;
  }
  if (!size) {
    triggerError('err-p-size', 'Please select your workforce size.');
    isValid = false;
  }
  if (!address) {
    triggerError('err-p-address', 'Full office address is required for intern placement.');
    isValid = false;
  }
  if (!title) {
    triggerError('err-p-title', 'Job title or position is required.');
    isValid = false;
  }
  if (!phone) {
    triggerError('err-p-phone', 'Contact phone number is required.');
    isValid = false;
  }

  if (!isValid) return;

  const btn = document.getElementById('profile-submit-btn');
  const txt = document.getElementById('profile-submit-text');
  btn.disabled = true;
  txt.innerHTML = `Saving Profile…`;

  try {
    const res = await fetch('http://localhost:8000/api/company/profile/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        moa_accepted:   true,
        description,
        ownership_type: ownership,
        company_size:   size,
        year_founded:   year,
        website,
        full_address:   address,
        contact_title:  title,
        contact_phone:  phone,
        linkedin,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      if (serverErr) {
        serverErr.textContent = data.message || 'Error saving company profile. Please review your entries.';
        serverErr.style.display = 'flex';
      }
      btn.disabled = false;
      txt.innerHTML = `Complete Setup &amp; Access Dashboard &rarr;`;
      return;
    }

    // Success! Show celebratory completion screen and redirect to company dashboard
    renderSuccess();
  } catch {
    if (serverErr) {
      serverErr.textContent = 'Could not connect to server. Please check your network connection.';
      serverErr.style.display = 'flex';
    }
    btn.disabled = false;
    txt.innerHTML = `Complete Setup &amp; Access Dashboard &rarr;`;
  }
}

/* ═══════════════════════════════════════════════════════════
   INITIALIZATION
   ═══════════════════════════════════════════════════════════ */
if (!token || !email) {
  renderInvalid();
} else {
  renderStep1();
}
