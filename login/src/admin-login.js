/**
 * CHMSU HireMe — Admin Login
 */

import './styles/variables.css';
import './styles/reset.css';
import './styles/admin-login.css';
import { icon } from './icons.js';

/* ── Theme ── */
const savedTheme = localStorage.getItem('hireme-theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);

const app = document.getElementById('app');

/* ═══════════════════════════════════════
   RENDER
   ═══════════════════════════════════════ */
function render() {
  app.innerHTML = `
    <div class="al-root">
      <div class="al-card">

        <button class="al-theme-toggle" id="theme-toggle" aria-label="Toggle theme">
          ${document.documentElement.getAttribute('data-theme') === 'dark' ? icon('sun', 16) : icon('moon', 16)}
        </button>

        <div class="al-badge">
          <span class="al-badge__dot"></span>
          CIER Admin Portal
        </div>

        <div class="al-header">
          <div class="al-logo">
            <div class="al-logo__mark">H</div>
            <span class="al-logo__text">Hire<span>Me</span></span>
          </div>
          <h1 class="al-title">Administrator Access</h1>
          <p class="al-subtitle">Restricted to authorized CIER personnel only.</p>
        </div>

        <form class="al-form" id="admin-login-form" novalidate>
          <div class="al-field">
            <label class="al-field__label" for="email">Email Address</label>
            <div class="al-field__wrap" id="wrap-email">
              <span class="al-field__icon">${icon('mail', 16)}</span>
              <input class="al-field__input" type="email" id="email" name="email"
                placeholder="admin@chmsu.edu.ph" autocomplete="email" />
            </div>
            <span class="al-field__error" id="err-email"></span>
          </div>

          <div class="al-field">
            <label class="al-field__label" for="password">Password</label>
            <div class="al-field__wrap" id="wrap-password">
              <span class="al-field__icon">${icon('lock', 16)}</span>
              <input class="al-field__input" type="password" id="password" name="password"
                placeholder="••••••••" autocomplete="current-password" />
              <button class="al-field__toggle" id="pw-toggle" type="button" aria-label="Toggle password visibility">
                ${icon('eye', 16)}
              </button>
            </div>
            <span class="al-field__error" id="err-password"></span>
          </div>

          <button class="al-submit" id="submit-btn" type="submit">
            <span id="submit-label">Sign In</span>
          </button>
        </form>

        <p class="al-footer">
          <a href="./index.html">← Back to main login</a>
        </p>

      </div>
    </div>
  `;

  attachEvents();
}

/* ═══════════════════════════════════════
   EVENTS
   ═══════════════════════════════════════ */
function attachEvents() {
  document.getElementById('theme-toggle')?.addEventListener('click', () => {
    const html = document.documentElement;
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('hireme-theme', next);
    render();
  });

  document.getElementById('pw-toggle')?.addEventListener('click', () => {
    const input = document.getElementById('password');
    const btn = document.getElementById('pw-toggle');
    if (!input) return;
    const isHidden = input.type === 'password';
    input.type = isHidden ? 'text' : 'password';
    btn.innerHTML = icon(isHidden ? 'eyeOff' : 'eye', 16);
  });

  document.getElementById('admin-login-form')?.addEventListener('submit', handleSubmit);
}

/* ── Field error helpers ── */
function showError(id, msg) {
  document.getElementById('wrap-' + id)?.classList.add('al-field__wrap--error');
  const err = document.getElementById('err-' + id);
  if (err) { err.textContent = msg; err.classList.add('al-field__error--visible'); }
}

function clearErrors() {
  document.querySelectorAll('.al-field__wrap--error').forEach(el => el.classList.remove('al-field__wrap--error'));
  document.querySelectorAll('.al-field__error--visible').forEach(el => {
    el.textContent = '';
    el.classList.remove('al-field__error--visible');
  });
}

/* ── Submit ── */
async function handleSubmit(e) {
  e.preventDefault();
  clearErrors();

  const email    = document.getElementById('email')?.value.trim() || '';
  const password = document.getElementById('password')?.value || '';

  let valid = true;
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email || !emailRe.test(email)) {
    showError('email', 'Please enter a valid email address.');
    valid = false;
  }
  if (!password || password.length < 6) {
    showError('password', 'Please enter your password.');
    valid = false;
  }
  if (!valid) return;

  const btn = document.getElementById('submit-btn');
  const lbl = document.getElementById('submit-label');
  btn.disabled = true;
  lbl.innerHTML = '<span class="al-spinner"></span> Authenticating…';

  try {
    const res = await fetch('http://localhost:8000/api/auth/admin-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (res.status === 403) {
      showError('email', 'Access denied. Admin accounts only.');
      btn.disabled = false;
      lbl.textContent = 'Sign In';
      return;
    }

    if (!res.ok) {
      const msg = data.errors?.email?.[0] || data.message || 'Invalid credentials.';
      showError('email', msg);
      btn.disabled = false;
      lbl.textContent = 'Sign In';
      return;
    }

    localStorage.setItem('hireme_token', data.token);
    localStorage.setItem('hireme_user', JSON.stringify(data.user));
    window.location.href = '/admin/';
  } catch {
    showError('email', 'Could not connect to server. Is the backend running?');
    btn.disabled = false;
    lbl.textContent = 'Sign In';
  }
}

/* ── Init ── */
render();
