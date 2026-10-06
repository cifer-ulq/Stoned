/**
 * CHMSU HireMe — Graduation & Alumni Promotion Celebration Modal
 * Displays an engaging full-screen celebratory modal when a student is promoted to Alumni/Graduate.
 * Automatically updates user session credentials and transitions to the Alumni/Jobseeker portal without re-login.
 */

import { icon } from './icons.js';
import { apiGetFresh, apiCache } from '../api/client.js';

let isModalActive = false;

export function showPromotionCelebrationModal(notification = {}) {
  if (isModalActive) return;
  if (document.getElementById('promotion-celebration-modal')) return;

  isModalActive = true;
  injectCelebrationStyles();

  const data = notification?.data || {};
  const batchYear = data.year_graduated || `Batch ${new Date().getFullYear()}`;
  const hours = data.completed_hours ? Math.round(Number(data.completed_hours)) : 600;
  const evalScore = data.evaluation_score
    ? `${Number(data.evaluation_score).toFixed(1)} / 5.0`
    : 'Verified & Approved';

  const overlay = document.createElement('div');
  overlay.id = 'promotion-celebration-modal';
  overlay.className = 'gpm-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');

  overlay.innerHTML = `
    <!-- Ambient Aurora Glow Behind Modal -->
    <div class="gpm-aurora">
      <div class="gpm-aurora__blob gpm-aurora__blob--1"></div>
      <div class="gpm-aurora__blob gpm-aurora__blob--2"></div>
      <div class="gpm-aurora__blob gpm-aurora__blob--3"></div>
    </div>

    <!-- Confetti Particle Canvas -->
    <canvas id="gpm-confetti-canvas" class="gpm-canvas"></canvas>

    <!-- Modal Card -->
    <div class="gpm-card">
      <!-- Top Decorative Ribbon -->
      <div class="gpm-badge-wrap">
        <div class="gpm-emblem">
          ${icon('graduationCap', 38)}
        </div>
        <div class="gpm-sparkle gpm-sparkle--1">✨</div>
        <div class="gpm-sparkle gpm-sparkle--2">🎓</div>
      </div>

      <!-- Title & Subtitle -->
      <h2 class="gpm-title">Congratulations, Graduate!</h2>
      <p class="gpm-status-pill">
        ${icon('award', 14)} Promoted to Official CHMSU Alumni
      </p>

      <p class="gpm-message">
        Your On-the-Job Training (OJT) practicum requirements have been completed and officially certified by your host company and coordinator. Welcome to the CHMSU Alumni & Career Network!
      </p>

      <!-- Achievement Highlights Grid -->
      <div class="gpm-stats">
        <div class="gpm-stat-box">
          <div class="gpm-stat-icon" style="background: rgba(0, 89, 48, 0.12); color: #005930;">
            ${icon('clock', 18)}
          </div>
          <div class="gpm-stat-info">
            <span class="gpm-stat-val">${hours} hrs</span>
            <span class="gpm-stat-lbl">Practicum Rendered</span>
          </div>
        </div>

        <div class="gpm-stat-box">
          <div class="gpm-stat-icon" style="background: rgba(217, 119, 6, 0.14); color: #D97706;">
            ${icon('star', 18)}
          </div>
          <div class="gpm-stat-info">
            <span class="gpm-stat-val">${evalScore}</span>
            <span class="gpm-stat-lbl">Evaluation Rating</span>
          </div>
        </div>

        <div class="gpm-stat-box gpm-stat-box--full">
          <div class="gpm-stat-icon" style="background: rgba(79, 70, 229, 0.12); color: #4F46E5;">
            ${icon('certificate', 18)}
          </div>
          <div class="gpm-stat-info">
            <span class="gpm-stat-val">${batchYear}</span>
            <span class="gpm-stat-lbl">Graduation Batch & Degree Complete</span>
          </div>
        </div>
      </div>

      <!-- Transition Notice -->
      <div class="gpm-notice">
        <span class="gpm-notice-icon">${icon('checkCircle', 16)}</span>
        <span>Your student trackers are now safely archived. The portal will automatically load your new <strong>Alumni & Career Hub</strong> without logging out.</span>
      </div>

      <!-- Progress countdown bar -->
      <div class="gpm-countdown-wrap">
        <div class="gpm-countdown-bar" id="gpm-progress-bar"></div>
      </div>
      <div class="gpm-countdown-text" id="gpm-timer-label">Entering Alumni Portal in 5 seconds...</div>

      <!-- Action Button -->
      <button class="gpm-cta-btn" id="gpm-enter-btn">
        <span>Enter Alumni Portal Now</span>
        ${icon('arrowRight', 18)}
      </button>
    </div>
  `;

  document.body.appendChild(overlay);
  startConfetti('gpm-confetti-canvas');

  // Request animation frame to trigger entry transitions
  requestAnimationFrame(() => {
    overlay.classList.add('gpm-overlay--visible');
  });

  const enterBtn = overlay.querySelector('#gpm-enter-btn');
  const timerLabel = overlay.querySelector('#gpm-timer-label');
  const progressBar = overlay.querySelector('#gpm-progress-bar');

  let secondsLeft = 5;
  let hasTransitioned = false;

  // Countdown timer
  const intervalId = setInterval(() => {
    secondsLeft -= 1;
    if (timerLabel) {
      timerLabel.textContent = secondsLeft > 0
        ? `Entering Alumni Portal in ${secondsLeft} second${secondsLeft === 1 ? '' : 's'}...`
        : 'Loading your Alumni Portal...';
    }

    if (secondsLeft <= 0) {
      clearInterval(intervalId);
      triggerTransition();
    }
  }, 1000);

  // Smooth CSS progress bar fill
  if (progressBar) {
    requestAnimationFrame(() => {
      progressBar.style.transition = 'width 5s linear';
      progressBar.style.width = '100%';
    });
  }

  // Handle immediate click
  enterBtn.addEventListener('click', () => {
    clearInterval(intervalId);
    triggerTransition();
  });

  async function triggerTransition() {
    if (hasTransitioned) return;
    hasTransitioned = true;

    enterBtn.disabled = true;
    enterBtn.innerHTML = `
      <span class="gpm-spinner"></span>
      <span>Transitioning Account...</span>
    `;

    try {
      // 1. Fetch fresh authenticated user from API
      const freshUserResponse = await apiGetFresh('/auth/me');
      if (freshUserResponse && (freshUserResponse.data || freshUserResponse.id)) {
        const userData = freshUserResponse.data || freshUserResponse;
        localStorage.setItem('hireme_user', JSON.stringify(userData));
      }

      // 2. Mark promotion notification as read if id available
      if (notification?.id) {
        const token = localStorage.getItem('hireme_token');
        fetch(`http://localhost:8000/api/notifications/${notification.id}/read`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
          },
        }).catch(() => {});
      }

      // 3. Set one-time welcome flag for jobseeker portal
      sessionStorage.setItem('hireme_just_promoted', 'true');

      // 4. Invalidate caches and clear current DOM views
      if (typeof apiCache?.clear === 'function') {
        apiCache.clear();
      }
      window.dispatchEvent(new CustomEvent('hireme:clear-views'));

      // 5. Seamless redirect to Jobseeker/Alumni Portal
      overlay.classList.add('gpm-overlay--fadeout');
      setTimeout(() => {
        window.location.href = '../jobseeker/';
      }, 400);

    } catch (err) {
      console.warn('Transition refresh completed with fallback:', err);
      sessionStorage.setItem('hireme_just_promoted', 'true');
      window.location.href = '../jobseeker/';
    }
  }
}

/* ── Lightweight Confetti Engine ── */
function startConfetti(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const w = canvas.width = window.innerWidth;
  const h = canvas.height = window.innerHeight;

  const colors = ['#005930', '#10B981', '#F59E0B', '#3B82F6', '#8B5CF6', '#EC4899', '#FBBF24'];
  const particles = [];
  const count = Math.min(120, Math.floor(w / 12));

  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * w,
      y: Math.random() * (h * 0.4) - 20,
      r: Math.random() * 6 + 4,
      d: Math.random() * count,
      color: colors[Math.floor(Math.random() * colors.length)],
      tilt: Math.floor(Math.random() * 10) - 10,
      tiltAngleIncremental: (Math.random() * 0.07) + 0.05,
      tiltAngle: 0,
      vx: (Math.random() - 0.5) * 2,
      vy: Math.random() * 2.5 + 1.8,
    });
  }

  let animationFrame;
  let angle = 0;

  function draw() {
    ctx.clearRect(0, 0, w, h);
    angle += 0.01;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.tiltAngle += p.tiltAngleIncremental;
      p.y += p.vy;
      p.x += Math.sin(angle) * 1.2 + p.vx;
      p.tilt = Math.sin(p.tiltAngle) * 15;

      ctx.beginPath();
      ctx.lineWidth = p.r / 2;
      ctx.strokeStyle = p.color;
      ctx.moveTo(p.x + p.tilt + (p.r / 4), p.y);
      ctx.lineTo(p.x + p.tilt, p.y + p.tilt + (p.r / 4));
      ctx.stroke();

      if (p.y > h + 20) {
        p.y = -20;
        p.x = Math.random() * w;
      }
    }

    animationFrame = requestAnimationFrame(draw);
  }

  draw();

  setTimeout(() => {
    cancelAnimationFrame(animationFrame);
    ctx.clearRect(0, 0, w, h);
  }, 10000);
}

/* ── Modal Styles ── */
function injectCelebrationStyles() {
  if (document.getElementById('gpm-styles')) return;

  const style = document.createElement('style');
  style.id = 'gpm-styles';
  style.textContent = `
    .gpm-overlay {
      position: fixed;
      inset: 0;
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      background: rgba(5, 25, 15, 0.75);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      opacity: 0;
      transition: opacity 0.35s ease;
      overflow-y: auto;
    }
    .gpm-overlay--visible {
      opacity: 1;
    }
    .gpm-overlay--fadeout {
      opacity: 0;
      transition: opacity 0.4s ease;
    }
    .gpm-canvas {
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 1;
    }

    /* Ambient Aurora Glow */
    .gpm-aurora {
      position: absolute;
      inset: 0;
      pointer-events: none;
      overflow: hidden;
      z-index: 0;
    }
    .gpm-aurora__blob {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.35;
      animation: gpm-float 10s ease-in-out infinite alternate;
    }
    .gpm-aurora__blob--1 {
      width: 450px; height: 450px;
      background: #005930;
      top: 15%; left: 20%;
    }
    .gpm-aurora__blob--2 {
      width: 400px; height: 400px;
      background: #D97706;
      bottom: 10%; right: 20%;
      animation-delay: -3s;
    }
    .gpm-aurora__blob--3 {
      width: 320px; height: 320px;
      background: #10B981;
      top: 40%; right: 35%;
      animation-delay: -6s;
    }
    @keyframes gpm-float {
      0% { transform: translate(0, 0) scale(1); }
      100% { transform: translate(30px, 40px) scale(1.15); }
    }

    /* Card */
    .gpm-card {
      position: relative;
      z-index: 2;
      width: 100%;
      max-width: 520px;
      background: #ffffff;
      border-radius: 24px;
      box-shadow: 0 25px 60px -15px rgba(0, 40, 20, 0.4), 0 0 0 1px rgba(0, 89, 48, 0.15);
      padding: 36px 32px 30px;
      text-align: center;
      transform: scale(0.92) translateY(16px);
      transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .gpm-overlay--visible .gpm-card {
      transform: scale(1) translateY(0);
    }

    [data-theme="dark"] .gpm-card {
      background: #151d18;
      box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.1);
      color: #f1f5f9;
    }

    /* Emblem */
    .gpm-badge-wrap {
      position: relative;
      display: inline-block;
      margin-bottom: 20px;
    }
    .gpm-emblem {
      width: 84px;
      height: 84px;
      border-radius: 50%;
      background: linear-gradient(135deg, #005930, #1A7A4A);
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto;
      box-shadow: 0 10px 25px -4px rgba(0, 89, 48, 0.45), 0 0 0 6px rgba(0, 89, 48, 0.1);
      animation: gpm-bounce 2s ease-in-out infinite;
    }
    @keyframes gpm-bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-6px); }
    }
    .gpm-sparkle {
      position: absolute;
      font-size: 20px;
      animation: gpm-twinkle 1.8s ease-in-out infinite alternate;
    }
    .gpm-sparkle--1 { top: -6px; right: -12px; }
    .gpm-sparkle--2 { bottom: 2px; left: -14px; animation-delay: 0.9s; }
    @keyframes gpm-twinkle {
      0% { transform: scale(0.8) rotate(-10deg); opacity: 0.5; }
      100% { transform: scale(1.2) rotate(15deg); opacity: 1; }
    }

    .gpm-title {
      font-size: 1.65rem;
      font-weight: 800;
      color: #0f172a;
      letter-spacing: -0.02em;
      margin: 0 0 8px;
    }
    [data-theme="dark"] .gpm-title {
      color: #f8fafc;
    }

    .gpm-status-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 14px;
      border-radius: 9999px;
      font-size: 0.82rem;
      font-weight: 700;
      background: rgba(0, 89, 48, 0.1);
      color: #005930;
      margin-bottom: 14px;
    }
    [data-theme="dark"] .gpm-status-pill {
      background: rgba(16, 185, 129, 0.18);
      color: #34D399;
    }

    .gpm-message {
      font-size: 0.88rem;
      color: #475569;
      line-height: 1.55;
      margin: 0 0 22px;
    }
    [data-theme="dark"] .gpm-message {
      color: #94a3b8;
    }

    /* Stats Grid */
    .gpm-stats {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 20px;
      text-align: left;
    }
    .gpm-stat-box {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 14px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 14px;
    }
    [data-theme="dark"] .gpm-stat-box {
      background: #1c2620;
      border-color: #27372d;
    }
    .gpm-stat-box--full {
      grid-column: span 2;
    }
    .gpm-stat-icon {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .gpm-stat-info {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    .gpm-stat-val {
      font-size: 0.88rem;
      font-weight: 700;
      color: #0f172a;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    [data-theme="dark"] .gpm-stat-val {
      color: #f1f5f9;
    }
    .gpm-stat-lbl {
      font-size: 0.72rem;
      color: #64748b;
    }
    [data-theme="dark"] .gpm-stat-lbl {
      color: #94a3b8;
    }

    /* Notice */
    .gpm-notice {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 11px 14px;
      background: rgba(16, 185, 129, 0.08);
      border: 1px solid rgba(16, 185, 129, 0.25);
      border-radius: 12px;
      font-size: 0.78rem;
      color: #065f46;
      text-align: left;
      line-height: 1.45;
      margin-bottom: 18px;
    }
    [data-theme="dark"] .gpm-notice {
      background: rgba(16, 185, 129, 0.12);
      border-color: rgba(16, 185, 129, 0.3);
      color: #a7f3d0;
    }
    .gpm-notice-icon {
      flex-shrink: 0;
      margin-top: 1px;
    }

    /* Progress & Countdown */
    .gpm-countdown-wrap {
      width: 100%;
      height: 4px;
      background: #e2e8f0;
      border-radius: 2px;
      overflow: hidden;
      margin-bottom: 8px;
    }
    [data-theme="dark"] .gpm-countdown-wrap {
      background: #334155;
    }
    .gpm-countdown-bar {
      width: 0%;
      height: 100%;
      background: linear-gradient(90deg, #005930, #10B981);
    }
    .gpm-countdown-text {
      font-size: 0.75rem;
      color: #64748b;
      margin-bottom: 16px;
    }
    [data-theme="dark"] .gpm-countdown-text {
      color: #94a3b8;
    }

    /* CTA Button */
    .gpm-cta-btn {
      width: 100%;
      padding: 13px 20px;
      border: none;
      border-radius: 14px;
      background: linear-gradient(135deg, #005930, #1A7A4A);
      color: #ffffff;
      font-size: 0.95rem;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      box-shadow: 0 10px 22px -5px rgba(0, 89, 48, 0.4);
      transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s;
    }
    .gpm-cta-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 12px 26px -4px rgba(0, 89, 48, 0.5);
    }
    .gpm-cta-btn:active {
      transform: translateY(0);
    }
    .gpm-cta-btn:disabled {
      opacity: 0.8;
      cursor: not-allowed;
    }

    .gpm-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: #ffffff;
      border-radius: 50%;
      animation: gpm-spin 0.6s linear infinite;
    }
    @keyframes gpm-spin {
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}
