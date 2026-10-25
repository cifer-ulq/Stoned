/**
 * CHMSU HireMe — Password Reset Page
 * Accessed via emailed reset link: ?token=xxx&email=yyy
 */

import './styles/variables.css';
import './styles/reset.css';
import './styles/admin-login.css';
import './styles/set-password.css';
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

/* ── Invalid or Expired Token View ── */
function renderInvalid(title, message) {
  app.innerHTML = `
    <div class="sp-page">
      ${renderNav()}
      <main class="sp-main">
        <div class="sp-card" style="max-width: 480px; text-align: center;">
          <div class="sp-card__accent" style="background: linear-gradient(90deg, #EF4444, #F59E0B);"></div>
          <div class="sp-card__body" style="padding: 3rem 2rem;">
            <div style="width: 68px; height: 68px; border-radius: 50%; background: rgba(239, 68, 68, 0.1); color: #EF4444; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; font-size: 2rem;">
              ⚠️
            </div>
            <div class="sp-badge" style="background: rgba(239, 68, 68, 0.1); border-color: rgba(239, 68, 68, 0.25); color: #EF4444; margin-bottom: 1rem;">
              <span class="sp-badge__dot" style="background: #EF4444;"></span>
              Link Unavailable
            </div>
            <h1 class="sp-title" style="font-size: 1.35rem; margin-bottom: 0.75rem;">${escapeHtml(title)}</h1>
            <p class="sp-subtitle" style="font-size: 0.88rem; line-height: 1.6; margin-bottom: 2rem;">
              ${escapeHtml(message)}
            </p>
            <div style="display: flex; flex-direction: column; gap: 0.75rem;">
              <a href="./?view=forgot" class="sp-btn sp-btn--primary" style="text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 8px;">
                Request a New Reset Link ${icon('arrow-right', 16)}
              </a>
              <a href="./" class="sp-btn sp-btn--secondary" style="text-decoration: none; display: flex; align-items: center; justify-content: center;">
                Back to Sign In
              </a>
            </div>
          </div>
        </div>
      </main>
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
          <div class="sp-card__body" style="padding: 3rem 2rem;">
            <div style="width: 68px; height: 68px; border-radius: 50%; background: rgba(16, 185, 129, 0.12); color: #10B981; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; font-size: 2.2rem;">
              ✓
            </div>
            <div class="sp-badge" style="background: rgba(16, 185, 129, 0.1); border-color: rgba(16, 185, 129, 0.25); color: #059669; margin-bottom: 1rem;">
              <span class="sp-badge__dot" style="background: #10B981;"></span>
              Password Updated
            </div>
            <h1 class="sp-title" style="font-size: 1.4rem; margin-bottom: 0.75rem;">Password Reset Successfully!</h1>
            <p class="sp-subtitle" style="font-size: 0.88rem; line-height: 1.6; margin-bottom: 2rem;">
              ${escapeHtml(message)}
            </p>
            <a href="${redirectUrl}" class="sp-btn sp-btn--primary" id="btn-continue" style="text-decoration: none; display: flex; align-items: center; justify-content: center; gap: 8px;">
              Continue to Portal ${icon('arrow-right', 16)}
            </a>
          </div>
        </div>
      </main>
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
        <div class="sp-card" style="max-width: 520px;">
          <div class="sp-card__accent"></div>

          <div class="sp-card__body" style="padding: 2.25rem 2rem;">

            <!-- Header Badge & Title -->
            <div style="text-align: center; margin-bottom: 1.75rem;">
              <div class="sp-badge" style="background: rgba(0, 89, 48, 0.08); border-color: rgba(0, 89, 48, 0.2); color: var(--color-primary); margin-bottom: 0.75rem;">
                <span class="sp-badge__dot" style="background: var(--color-primary);"></span>
                Secure Account Recovery
              </div>
              <h1 class="sp-title" style="font-size: 1.5rem; margin-bottom: 0.4rem;">Create New Password</h1>
              <p class="sp-subtitle" style="font-size: 0.84rem;">
                Please choose a strong, secure password for your account.
              </p>
            </div>

            <!-- Account Email Verified Pill -->
            <div style="background: var(--bg-secondary); border: 1.5px solid var(--border-default); border-radius: 12px; padding: 12px 16px; margin-bottom: 1.75rem; display: flex; align-items: center; justify-content: space-between; gap: 10px;">
              <div style="display: flex; align-items: center; gap: 10px; overflow: hidden;">
                <span style="color: var(--color-primary); font-size: 1.1rem; flex-shrink: 0;">👤</span>
                <div style="overflow: hidden;">
                  <div style="font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-tertiary); font-weight: 600;">Account Email</div>
                  <div style="font-size: 0.86rem; font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(email)}</div>
                </div>
              </div>
              <span style="font-size: 0.68rem; font-weight: 600; padding: 3px 8px; border-radius: 999px; background: rgba(16, 185, 129, 0.12); color: #059669; border: 1px solid rgba(16, 185, 129, 0.25); white-space: nowrap;">Verified</span>
            </div>

            <!-- Form -->
            <form id="reset-form" novalidate style="display: flex; flex-direction: column; gap: 1.25rem;">

              <!-- New Password -->
              <div class="sp-field">
                <label class="sp-label" for="password">New Password</label>
                <div class="sp-input-wrap" id="wrap-password">
                  <span class="sp-input-icon">${icon('lock', 18)}</span>
                  <input class="sp-input" type="password" id="password" name="password"
                    placeholder="Enter at least 8 characters" autocomplete="new-password" />
                  <button class="sp-eye-toggle" id="pw-toggle" type="button" aria-label="Toggle password visibility">
                    ${icon('eye', 18)}
                  </button>
                </div>
                
                <!-- Password Strength Meter -->
                <div class="pw-strength" style="display: flex; gap: 4px; margin-top: 6px;">
                  <div class="pw-strength__bar" id="ps-1" style="flex: 1; height: 4px; border-radius: 999px; background: var(--border-default); transition: background 0.3s;"></div>
                  <div class="pw-strength__bar" id="ps-2" style="flex: 1; height: 4px; border-radius: 999px; background: var(--border-default); transition: background 0.3s;"></div>
                  <div class="pw-strength__bar" id="ps-3" style="flex: 1; height: 4px; border-radius: 999px; background: var(--border-default); transition: background 0.3s;"></div>
                  <div class="pw-strength__bar" id="ps-4" style="flex: 1; height: 4px; border-radius: 999px; background: var(--border-default); transition: background 0.3s;"></div>
                </div>
                <div id="pw-label" style="font-size: 0.72rem; color: var(--text-tertiary); margin-top: 4px;"></div>
                <span class="sp-field__error" id="err-password" style="font-size: 0.75rem; color: var(--color-error); display: none; margin-top: 4px;"></span>
              </div>

              <!-- Confirm Password -->
              <div class="sp-field">
                <label class="sp-label" for="password_confirmation">Confirm New Password</label>
                <div class="sp-input-wrap" id="wrap-confirm">
                  <span class="sp-input-icon">${icon('lock', 18)}</span>
                  <input class="sp-input" type="password" id="password_confirmation" name="password_confirmation"
                    placeholder="Re-enter your new password" autocomplete="new-password" />
                  <button class="sp-eye-toggle" id="confirm-toggle" type="button" aria-label="Toggle password confirmation visibility">
                    ${icon('eye', 18)}
                  </button>
                </div>
                <span class="sp-field__error" id="err-confirm" style="font-size: 0.75rem; color: var(--color-error); display: none; margin-top: 4px;"></span>
              </div>

              <!-- Global Alert Box -->
              <div id="reset-alert" style="display: none; padding: 12px 16px; border-radius: 10px; font-size: 0.82rem; line-height: 1.5; background: #FEF2F2; border: 1.5px solid #EF4444; color: #991B1B;"></div>

              <!-- Submit Button -->
              <button class="sp-btn sp-btn--primary" id="submit-btn" type="submit" style="width: 100%; padding: 14px; font-size: 0.92rem; font-weight: 600; margin-top: 0.5rem; justify-content: center; box-shadow: 0 4px 16px rgba(0, 89, 48, 0.3);">
                <span id="submit-label">Update Password &amp; Sign In</span>
              </button>

              <div style="text-align: center; margin-top: 0.5rem;">
                <a href="./" style="font-size: 0.82rem; color: var(--text-tertiary); text-decoration: none; transition: color 0.2s;">
                  ← Back to Sign In
                </a>
              </div>

            </form>
          </div>
        </div>
      </main>
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
    pwBtn.innerHTML = icon(isHidden ? 'eye-off' : 'eye', 18);
  });

  const confirmInput = document.getElementById('password_confirmation');
  const confirmBtn   = document.getElementById('confirm-toggle');
  confirmBtn?.addEventListener('click', () => {
    if (!confirmInput) return;
    const isHidden = confirmInput.type === 'password';
    confirmInput.type = isHidden ? 'text' : 'password';
    confirmBtn.innerHTML = icon(isHidden ? 'eye-off' : 'eye', 18);
  });

  // Password Strength Evaluation
  pwInput?.addEventListener('input', (e) => {
    const val = e.target.value;
    updateStrength(val);
  });

  // Form Submission
  document.getElementById('reset-form')?.addEventListener('submit', handleResetSubmit);
}

/* ── Password Strength Logic ── */
function updateStrength(pw) {
  const bars = [1, 2, 3, 4].map(i => document.getElementById(`ps-${i}`));
  const label = document.getElementById('pw-label');
  if (!bars[0] || !label) return;

  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  const colors = ['', '#EF4444', '#F59E0B', '#3B82F6', '#10B981'];
  const labels = ['', 'Weak (8+ characters needed)', 'Fair', 'Good', 'Strong'];

  bars.forEach((bar, i) => {
    bar.style.background = i < score ? colors[score] : 'var(--border-default)';
  });

  label.textContent = pw.length ? labels[score] : '';
  label.style.color = pw.length ? colors[score] : 'var(--text-tertiary)';
}

/* ── Field Error Display ── */
function setFieldError(field, msg) {
  const wrap = document.getElementById(`wrap-${field}`);
  const err  = document.getElementById(`err-${field}`);
  if (wrap) wrap.style.borderColor = 'var(--color-error)';
  if (err) {
    err.textContent = msg;
    err.style.display = 'block';
  }
}

function clearFieldErrors() {
  ['password', 'confirm'].forEach(f => {
    const wrap = document.getElementById(`wrap-${f}`);
    const err  = document.getElementById(`err-${f}`);
    if (wrap) wrap.style.borderColor = '';
    if (err) {
      err.textContent = '';
      err.style.display = 'none';
    }
  });
  const alert = document.getElementById('reset-alert');
  if (alert) {
    alert.style.display = 'none';
    alert.textContent = '';
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
    setFieldError('password', 'Password must be at least 8 characters long.');
    valid = false;
  }
  if (!cp) {
    setFieldError('confirm', 'Please confirm your new password.');
    valid = false;
  } else if (pw !== cp) {
    setFieldError('confirm', 'Passwords do not match.');
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
      if (res.status === 422 && data.message && data.message.includes('expired')) {
        renderInvalid('Reset Link Expired or Used', data.message);
        return;
      }

      const alert = document.getElementById('reset-alert');
      if (alert) {
        alert.textContent = data.message || 'Unable to reset password. Please check your inputs.';
        alert.style.display = 'block';
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
    const alert = document.getElementById('reset-alert');
    if (alert) {
      alert.textContent = 'Could not connect to server. Please check your network connection.';
      alert.style.display = 'block';
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
