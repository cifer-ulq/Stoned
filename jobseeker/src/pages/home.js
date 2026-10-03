/**
 * CHMSU HireMe — Job Seeker Home Page (with Instant Cache Rendering)
 */
import { icon } from '../components/icons.js';
import { apiGet, apiCache } from '../api/client.js';
import { navigate } from '../router.js';
import { getState } from '../store.js';

function renderStatsHtml(stats = {}) {
  return `
    <div class="stat-card animate-fade-in-up">
      <div class="stat-card__icon" style="background:var(--color-accent-bg);color:var(--color-accent);">${icon('send', 22)}</div>
      <div class="stat-card__value">${stats.applications_sent ?? 0}</div>
      <div class="stat-card__label">Applications Sent</div>
    </div>
    <div class="stat-card animate-fade-in-up" style="animation-delay:80ms;">
      <div class="stat-card__icon" style="background:var(--color-warning-bg);color:var(--color-warning);">${icon('clock', 22)}</div>
      <div class="stat-card__value">${stats.applications_pending ?? 0}</div>
      <div class="stat-card__label">Pending Review</div>
    </div>
    <div class="stat-card animate-fade-in-up" style="animation-delay:160ms;">
      <div class="stat-card__icon" style="background:var(--color-error-bg);color:var(--color-error);">${icon('video', 22)}</div>
      <div class="stat-card__value">${stats.upcoming_interviews ?? 0}</div>
      <div class="stat-card__label">Upcoming Interviews</div>
    </div>
  `;
}

function renderRecentAppsHtml(apps = []) {
  if (apps.length === 0) {
    return `
      <div class="empty-state">
        ${icon('inbox', 36)}
        <p class="text-secondary mt-2">No applications yet. Start applying!</p>
        <button class="btn btn--primary btn--sm mt-2" id="start-applying-btn">${icon('briefcase', 14)} Browse Jobs</button>
      </div>`;
  }

  return apps.map(app => {
    const statusColor = { applied:'accent', screened:'info', interviewed:'warning', offered:'success', hired:'success', rejected:'error' };
    const col = statusColor[app.status] || 'neutral';
    return `
      <div class="activity-item">
        <div class="activity-item__icon" style="background:var(--color-${col}-bg);color:var(--color-${col});">${icon('briefcase', 18)}</div>
        <div class="activity-item__content">
          <div class="activity-item__title">${app.job_listing?.title || 'Job Application'}</div>
          <div class="activity-item__time">${app.job_listing?.location || ''} · <span class="badge badge--${col}">${app.status}</span></div>
        </div>
        <span class="activity-item__time">${timeAgo(app.created_at)}</span>
      </div>`;
  }).join('');
}

export async function renderHome(container) {
  const user = getState('user');
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user.name ? user.name.split(' ')[0] : 'there';

  const cached = apiCache.get('/jobseeker/dashboard')?.data;
  const hasCachedStats = cached && cached.stats;
  const hasCachedApps = cached && Array.isArray(cached.recent_applications);

  container.innerHTML = `
    <div class="page-enter">
      <section class="home-hero">
        <h1 class="home-hero__title animate-fade-in-up">
          ${greeting}, <span>${firstName}!</span>
        </h1>
        <p class="home-hero__subtitle animate-fade-in-up" style="animation-delay:100ms;">
          ${user.desiredJobTitle ? `Looking for <strong>${user.desiredJobTitle}</strong> roles — here's your career overview today.` : "Here's your career overview for today."}
        </p>
        <div class="home-hero__actions animate-fade-in-up" style="animation-delay:200ms;">
          <button class="btn btn--primary btn--lg" id="hero-portfolio-btn">
            ${icon('user', 18)} My Portfolio
          </button>
          <button class="btn btn--secondary btn--lg" id="hero-jobs-btn">
            ${icon('search', 18)} Find Jobs
          </button>
        </div>
      </section>

      <!-- Stats -->
      <section class="page-section" id="stats-section">
        <div class="home-stats stagger-children" id="stats-grid" style="grid-template-columns:repeat(3,1fr);">
          ${hasCachedStats ? renderStatsHtml(cached.stats) : `
            <div class="skeleton skeleton--card"></div>
            <div class="skeleton skeleton--card"></div>
            <div class="skeleton skeleton--card"></div>
          `}
        </div>
      </section>

      <!-- Quick Actions -->
      <section class="page-section">
        <div class="section-header">
          <div>
            <h2 class="section-title">Quick Actions</h2>
            <p class="section-subtitle">Jump to what matters most</p>
          </div>
        </div>
        <div class="quick-actions stagger-children">
          <button class="quick-action" data-route="/portfolio">
            <div class="quick-action__icon" style="background:var(--color-accent-bg);color:var(--color-accent);">${icon('user', 24)}</div>
            <span class="quick-action__label">My Portfolio</span>
          </button>
          <button class="quick-action" data-route="/jobs">
            <div class="quick-action__icon" style="background:var(--color-success-bg);color:var(--color-success);">${icon('target', 24)}</div>
            <span class="quick-action__label">Find Jobs</span>
          </button>
          <button class="quick-action" data-route="/applications">
            <div class="quick-action__icon" style="background:var(--color-warning-bg);color:var(--color-warning);">${icon('inbox', 24)}</div>
            <span class="quick-action__label">Applications</span>
          </button>
          <button class="quick-action" data-route="/interview">
            <div class="quick-action__icon" style="background:var(--color-info-bg);color:var(--color-info);">${icon('video', 24)}</div>
            <span class="quick-action__label">Interviews</span>
          </button>
        </div>
      </section>

      <!-- Recent Applications -->
      <section class="page-section">
        <div class="section-header">
          <div>
            <h2 class="section-title">Recent Applications</h2>
            <p class="section-subtitle">Your latest job applications</p>
          </div>
          <button class="btn btn--secondary btn--sm" id="view-all-apps">${icon('arrowRight', 14)} View All</button>
        </div>
        <div class="activity-feed" id="activity-feed">
          ${hasCachedApps ? renderRecentAppsHtml(cached.recent_applications) : `
            <div class="skeleton skeleton--card" style="height:72px;"></div>
            <div class="skeleton skeleton--card" style="height:72px;"></div>
            <div class="skeleton skeleton--card" style="height:72px;"></div>
          `}
        </div>
      </section>
    </div>
  `;

  container.querySelector('#hero-portfolio-btn')?.addEventListener('click', () => navigate('/portfolio'));
  container.querySelector('#hero-jobs-btn')?.addEventListener('click', () => navigate('/jobs'));
  container.querySelector('#view-all-apps')?.addEventListener('click', () => navigate('/applications'));

  container.querySelectorAll('.quick-action[data-route]').forEach(btn => {
    btn.addEventListener('click', () => navigate(btn.getAttribute('data-route')));
  });

  container.querySelector('#start-applying-btn')?.addEventListener('click', () => navigate('/jobs'));

  loadDashboardData(container);
}

async function loadDashboardData(container) {
  try {
    const data = await apiGet('/jobseeker/dashboard');
    if (!data) return;

    const stats = data.stats || {};
    const statsGrid = container.querySelector('#stats-grid');
    if (statsGrid) {
      statsGrid.innerHTML = renderStatsHtml(stats);
    }

    const feed = container.querySelector('#activity-feed');
    const apps = data.recent_applications || [];
    if (feed) {
      feed.innerHTML = renderRecentAppsHtml(apps);
      feed.querySelector('#start-applying-btn')?.addEventListener('click', () => navigate('/jobs'));
    }
  } catch {
    // silently fail
  }
}

function timeAgo(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
