/**
 * CHMSU HireMe — Password Reset Page
 * Fully Responsive (320px to 1440px+)
 * Accessed via emailed reset link: ?token=xxx&email=yyy
 */

import './styles/variables.css';
import './styles/reset.css';
import './styles/admin-login.css';
import './styles/set-password.css';
import './styles/reset-password.css';
import { icon } from './icons.js';

/* ── Theme Initialization ── */
const savedTheme = localStorage.getItem('hireme-theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);

/* ── URL Parameters ── */
const params = new URLSearchParams(window.location.search);
const token = params.get('token') || '';
const email = (params.get('email') || '').trim();

const app = document.getElementById('app');

/* ── Safe HTML Escaper ── */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/* ── Top Navigation Bar ── */
function renderNav() {
  const theme = document.documentElement.getAttribute('data-theme');
  return `
    <header class="sp-nav">
      <a href="./" class="sp-brand" aria-label="CHMSU HireMe Home">
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

/* ── Invalid or Expired Token View ── */
function renderInvalid(title, message) {
  app.innerHTML = `
    <div class="sp-page">
      ${renderNav()}
      <main class="sp-main">
        <div class="sp-card" style="max-width: 480px; text-align: center;">
          <div class="sp-card__accent" style="background: linear-gradient(90deg, #EF4444, #F59E0B);"></div>
          <div class="sp-card__body">
            <div style="width: 64px; height: 64px; border-radius: 50%; background: rgba(239, 68, 68, 0.1); color: #EF4444; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.25rem;">
              ${icon('alert-triangle', 32)}
            </div>
            <div class="sp-badge" style="background: rgba(239, 68, 68, 0.1); border-color: rgba(239, 68, 68, 0.25); color: #EF4444; margin-bottom: 0.85rem;">
              <span class="sp-badge__dot" style="background: #EF4444;"></span>
              Link Unavailable
            </div>
            <h1 class="sp-title" style="font-size: 1.35rem; margin-bottom: 0.75rem;">${escapeHtml(title)}</h1>
            <p class="sp-subtitle" style="font-size: 0.86rem; line-height: 1.6; margin-bottom: 1.75rem;">
              ${escapeHtml(message)}
            </p>
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
              <a href="./?view=forgot" class="sp-btn-submit" style="text-decoration: none;">
                Request a New Reset Link ${icon('arrow-right', 16)}
              </a>
              <a href="./" style="display: inline-block; padding: 10px; color: var(--text-secondary); text-decoration: none; font-size: 0.86rem; font-weight: 500;">
                Return to Login
              </a>
            </div>
          </div>
        </div>
      </main>
      <footer class="sp-footer">
        Carlos Hilado Memorial State University &bull; CIER Portal &bull; <a href="./">Back to Login</a>
      </footer>
    </div>
  `;
  attachNavEvents();
}

/* ── Success View ── */
function renderSuccess(message, redirectUrl) {
  app.innerHTML = `
    <div class="sp-page">
      ${renderNav()}
      <main class="sp-main">
        <div class="sp-card" style="max-width: 480px; text-align: center;">
          <div class="sp-card__accent" style="background: linear-gradient(90deg, #10B981, #005930);"></div>
          <div class="sp-card__body">
            <div style="width: 68px; height: 68px; border-radius: 50%; background: rgba(16, 185, 129, 0.12); color: #10B981; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.25rem;">
              ${icon('check-circle', 36)}
            </div>
            <div class="sp-badge" style="background: rgba(16, 185, 129, 0.1); border-color: rgba(16, 185, 129, 0.25); color: #059669; margin-bottom: 0.85rem;">
              <span class="sp-badge__dot" style="background: #10B981;"></span>
              Password Updated
            </div>
            <h1 class="sp-title" style="font-size: 1.4rem; margin-bottom: 0.75rem;">Password Reset Successfully!</h1>
            <p class="sp-subtitle" style="font-size: 0.88rem; line-height: 1.6; margin-bottom: 1.75rem;">
              ${escapeHtml(message)}
            </p>
            <a href="${redirectUrl}" class="sp-btn-submit" id="btn-continue" style="text-decoration: none;">
              Continue to Portal ${icon('arrow-right', 16)}
            </a>
          </div>
        </div>
      </main>
      <footer class="sp-footer">
        Carlos Hilado Memorial State University &bull; CIER &bull; <a href="./">Return to Login</a>
      </footer>
    </div>
  `;
  attachNavEvents();
}

/* ── Main Reset Password Form View ── */
function renderResetForm() {
  app.innerHTML = `
    <div class="sp-page">
      ${renderNav()}

      <main class="sp-main">
        <div class="sp-card">
          <div class="sp-card__accent"></div>

          <div class="sp-card__body">

            <!-- Header Badge & Title -->
            <div class="sp-header">
              <div class="sp-badge">
                <span class="sp-badge__dot"></span>
                Secure Account Recovery
              </div>
              <h1 class="sp-title">Create New Password</h1>
              <p class="sp-subtitle">
                Please choose a strong, secure password for your account.
              </p>
            </div>

            <!-- Account Email Verified Pill -->
            <div class="sp-account-badge">
              <span style="color: var(--color-primary); flex-shrink: 0;">${icon('mail', 18)}</span>
              <div style="min-width: 0; overflow: hidden; flex: 1;">
                <span style="display: block; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-tertiary); font-weight: 700;">Account</span>
                <strong style="display: block; word-break: break-all; font-size: 0.88rem; line-height: 1.3;">${escapeHtml(email)}</strong>
              </div>
              <span style="font-size: 0.68rem; font-weight: 700; padding: 3px 8px; border-radius: 999px; background: rgba(16, 185, 129, 0.12); color: #059669; border: 1px solid rgba(16, 185, 129, 0.25); white-space: nowrap; flex-shrink: 0;">Verified</span>
            </div>

            <!-- Server Error Alert -->
            <div class="sp-alert-error" id="sp-server-error" style="display: none;">
              <span style="flex-shrink: 0;">${icon('alert-triangle', 18)}</span>
              <span id="sp-server-error-msg" style="flex: 1;"></span>
            </div>

            <form class="sp-form" id="reset-form" novalidate>

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
                    name="password"
                    placeholder="Enter at least 8 characters"
                    autocomplete="new-password"
                    required
                  />
                  <button class="sp-toggle-btn" id="pw-toggle" type="button" aria-label="Toggle password visibility">
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
                  Confirm New Password <span class="sp-required">*</span>
                </label>
                <div class="sp-input-box" id="box-confirm">
                  <span class="sp-input-icon">${icon('lock', 16)}</span>
                  <input
                    class="sp-input"
                    type="password"
                    id="password_confirmation"
                    name="password_confirmation"
                    placeholder="Re-enter your new password"
                    autocomplete="new-password"
                    required
                  />
                  <button class="sp-toggle-btn" id="confirm-toggle" type="button" aria-label="Toggle password confirmation visibility">
                    ${icon('eye', 16)}
                  </button>
                </div>
                <div class="sp-field-error" id="err-confirm"></div>
              </div>

              <!-- Submit Button -->
              <button class="sp-btn-submit" id="submit-btn" type="submit">
                <span id="submit-label">Update Password &amp; Sign In</span>
              </button>

              <div style="text-align: center; margin-top: 0.5rem;">
                <a href="./" style="font-size: 0.85rem; color: var(--text-secondary); text-decoration: none; font-weight: 500; display: inline-flex; align-items: center; gap: 4px;">
                  &larr; Back to Sign In
                </a>
              </div>

            </form>
          </div>
        </div>
      </main>
      <footer class="sp-footer">
        Carlos Hilado Memorial State University &bull; CIER &bull; <a href="./">Return to Login</a>
      </footer>
    </div>
  `;

  attachNavEvents();
  attachFormEvents();
}

/* ── Attach Nav Events (Theme) ── */
function attachNavEvents() {
  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    const html = document.documentElement;
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('hireme-theme', next);
    init();
  });
}

/* ── Attach Form Events ── */
function attachFormEvents() {
  // Password Visibility Toggles
  const pwInput = document.getElementById('password');
  const pwBtn   = document.getElementById('pw-toggle');
  pwBtn?.addEventListener('click', () => {
    if (!pwInput) return;
    const isHidden = pwInput.type === 'password';
    pwInput.type = isHidden ? 'text' : 'password';
    pwBtn.innerHTML = icon(isHidden ? 'eye-off' : 'eye', 16);
  });

  const confirmInput = document.getElementById('password_confirmation');
  const confirmBtn   = document.getElementById('confirm-toggle');
  confirmBtn?.addEventListener('click', () => {
    if (!confirmInput) return;
    const isHidden = confirmInput.type === 'password';
    confirmInput.type = isHidden ? 'text' : 'password';
    confirmBtn.innerHTML = icon(isHidden ? 'eye-off' : 'eye', 16);
  });

  // Password Input & Real-time Validation
  pwInput?.addEventListener('input', () => {
    evaluatePassword();
  });

  confirmInput?.addEventListener('input', () => {
    evaluatePassword();
  });

  // Form Submission
  document.getElementById('reset-form')?.addEventListener('submit', handleResetSubmit);
}

/* ── Password Strength & Criteria Evaluation ── */
function evaluatePassword() {
  const pw = document.getElementById('password')?.value || '';
  const confirmPw = document.getElementById('password_confirmation')?.value || '';

  const hasLen = pw.length >= 8;
  const hasUpper = /[A-Z]/.test(pw);
  const hasNumOrSpec = /[0-9]|[^A-Za-z0-9]/.test(pw);

  const updateCrit = (id, valid) => {
    const el = document.getElementById(id);
    if (el) el.classList.toggle('valid', valid);
  };

  updateCrit('crit-len', hasLen);
  updateCrit('crit-upper', hasUpper);
  updateCrit('crit-num', hasNumOrSpec);

  // Score
  let score = 0;
  if (hasLen) score++;
  if (hasUpper) score++;
  if (hasNumOrSpec) score++;
  if (pw.length >= 12 && hasUpper && hasNumOrSpec) score++;

  const bars = [1, 2, 3, 4].map(i => document.getElementById(`str-${i}`));
  const label = document.getElementById('str-label');

  const colors = ['', '#EF4444', '#F59E0B', '#10B981', '#005930'];
  const labels = ['', 'Weak (8+ characters needed)', 'Fair', 'Good', 'Strong'];

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
  if (confirmPw.length > 0) {
    if (pw !== confirmPw) {
      boxConfirm?.classList.add('sp-input-box--error');
      if (errConfirm) {
        errConfirm.textContent = 'Passwords do not match.';
        errConfirm.style.display = 'block';
      }
    } else {
      boxConfirm?.classList.remove('sp-input-box--error');
      if (errConfirm) {
        errConfirm.textContent = '';
        errConfirm.style.display = 'none';
      }
    }
  } else {
    boxConfirm?.classList.remove('sp-input-box--error');
    if (errConfirm) {
      errConfirm.textContent = '';
      errConfirm.style.display = 'none';
    }
  }
}

/* ── Field Error Display ── */
function setFieldError(boxId, errId, msg) {
  const box = document.getElementById(boxId);
  const err = document.getElementById(errId);
  box?.classList.add('sp-input-box--error');
  if (err) {
    err.textContent = msg;
    err.style.display = 'block';
  }
}

function clearFieldErrors() {
  document.querySelectorAll('.sp-input-box--error').forEach(el => el.classList.remove('sp-input-box--error'));
  document.querySelectorAll('.sp-field-error').forEach(el => {
    el.textContent = '';
    el.style.display = 'none';
  });
  const alert = document.getElementById('sp-server-error');
  if (alert) {
    alert.style.display = 'none';
  }
}

/* ── Submit Handler ── */
async function handleResetSubmit(e) {
  e.preventDefault();
  clearFieldErrors();

  const pw = document.getElementById('password')?.value || '';
  const cp = document.getElementById('password_confirmation')?.value || '';

  let valid = true;
  if (!pw || pw.length < 8) {
    setFieldError('box-password', 'err-password', 'Password must be at least 8 characters long.');
    valid = false;
  }
  if (!cp) {
    setFieldError('box-confirm', 'err-confirm', 'Please confirm your new password.');
    valid = false;
  } else if (pw !== cp) {
    setFieldError('box-confirm', 'err-confirm', 'Passwords do not match.');
    valid = false;
  }

  if (!valid) return;

  const btn = document.getElementById('submit-btn');
  const lbl = document.getElementById('submit-label');
  btn.disabled = true;
  lbl.innerHTML = '<span class="login-spinner"></span> Updating password…';

  try {
    const res = await fetch('http://localhost:8000/api/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        email,
        token,
        password: pw,
        password_confirmation: cp,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      // Check if token was expired or invalid
      if (res.status === 422 && data.message && (data.message.includes('expired') || data.message.includes('invalid'))) {
        renderInvalid('Reset Link Expired or Used', data.message);
        return;
      }

      const alert = document.getElementById('sp-server-error');
      const alertMsg = document.getElementById('sp-server-error-msg');
      if (alert && alertMsg) {
        alertMsg.textContent = data.message || 'Unable to reset password. Please check your inputs.';
        alert.style.display = 'flex';
      }
      btn.disabled = false;
      lbl.textContent = 'Update Password & Sign In';
      return;
    }

    // Success Handling
    if (data.requires_verification) {
      renderSuccess(
        data.message || 'Your password was updated, but your account is currently pending verification by your OJT Coordinator.',
        './'
      );
      return;
    }

    if (data.token) {
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

      const targetPortal = destinations[data.user?.role] || '/main/';
      renderSuccess('You have successfully updated your password. Redirecting to your portal…', targetPortal);

      setTimeout(() => {
        window.location.href = targetPortal;
      }, 1500);
      return;
    }

    // Fallback: Redirect to signin with reset=success parameter
    window.location.href = './?reset=success';

  } catch (err) {
    console.error('[ResetPassword] Error:', err);
    const alert = document.getElementById('sp-server-error');
    const alertMsg = document.getElementById('sp-server-error-msg');
    if (alert && alertMsg) {
      alertMsg.textContent = 'Could not connect to server. Please check your network connection.';
      alert.style.display = 'flex';
    }
    btn.disabled = false;
    lbl.textContent = 'Update Password & Sign In';
  }
}

/* ── Initialization ── */
function init() {
  if (!token || !email) {
    renderInvalid(
      'Missing Reset Credentials',
      'This password reset link is missing its authentication token or email address. Please click the exact link sent to your email.'
    );
    return;
  }
  renderResetForm();
}

init();
