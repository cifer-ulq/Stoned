/**
 * CHMSU HireMe — Home Page (Dynamic with Instant Cache Rendering)
 */
import { icon } from '../components/icons.js';
import { apiFetch, apiGet, apiCache } from '../api/client.js';
import { navigate } from '../router.js';
import { getState } from '../store.js';

function renderStatsHtml(stats) {
  if (!stats) return '';
  const iconMap  = { ojtHours: 'clock', applications: 'briefcase', interviews: 'video', pending: 'inbox', jobMatches: 'target' };
  const colorMap = { ojtHours: 'accent', applications: 'warning', interviews: 'info', pending: 'success', jobMatches: 'success' };

  return Object.entries(stats).map(([key, stat]) => `
    <div class="stat-card hover-lift">
      <div class="stat-card__icon" style="background: var(--color-${colorMap[key] ?? 'accent'}-bg); color: var(--color-${colorMap[key] ?? 'accent'});">
        ${icon(iconMap[key] ?? 'award', 24)}
      </div>
      <div class="stat-card__value">${stat.value}${stat.total ? `<span class="text-sm text-secondary">/${stat.total}</span>` : ''}</div>
      <div class="stat-card__label">${stat.label}</div>
    </div>
  `).join('');
}

function renderActivityHtml(activity) {
  if (!activity) return '';
  const colorByType = { application: 'accent', interview: 'info', feedback: 'success', match: 'warning', log: 'accent' };

  if (activity.length === 0) {
    return `
      <div class="empty-state" style="padding: 2rem; text-align: center;">
        ${icon('inbox', 32)}
        <p class="text-secondary mt-2">No activity yet. Start by applying to jobs!</p>
      </div>`;
  }

  return activity.map(item => `
    <div class="activity-item hover-lift">
      <div class="activity-item__icon" style="background: var(--color-${colorByType[item.type] ?? 'accent'}-bg); color: var(--color-${colorByType[item.type] ?? 'accent'});">
        ${icon(item.icon, 20)}
      </div>
      <div class="activity-item__content">
        <div class="activity-item__title">${item.title}</div>
        <div class="activity-item__time">${item.time}</div>
      </div>
      <span style="color: var(--text-tertiary);">${icon('arrowRight', 16)}</span>
    </div>
  `).join('');
}

export async function renderHome(container) {
  const user = getState('user');
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user.name ? user.name.split(' ')[0] : 'there';

  const cachedDash = apiCache.get('/student/dashboard')?.data;
  const hasCachedStats = cachedDash && cachedDash.stats;
  const hasCachedActivity = cachedDash && cachedDash.activity;

  container.innerHTML = `
    <div class="page-enter">
      <!-- Hero Section -->
      <section class="home-hero">
        <h1 class="home-hero__title animate-fade-in-up">
          ${greeting}, <span>${firstName}!</span>
        </h1>
        <p class="home-hero__subtitle animate-fade-in-up" style="animation-delay: 100ms;">
          Here's your career overview for today.
        </p>
        <div class="home-hero__actions animate-fade-in-up" style="animation-delay: 200ms;">
          <button class="btn btn--primary btn--lg" id="hero-portfolio-btn">
            ${icon('eye', 18)} View My Portfolio
          </button>
          <button class="btn btn--secondary btn--lg" id="hero-jobs-btn">
            ${icon('search', 18)} Explore Jobs
          </button>
        </div>
      </section>

      <!-- Stats -->
      <section class="page-section" id="stats-section">
        <div class="home-stats stagger-children" id="stats-grid">
          ${hasCachedStats ? renderStatsHtml(cachedDash.stats) : `
            <div class="skeleton skeleton--card"></div>
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
            <p class="section-subtitle">Common tasks to get you moving</p>
          </div>
        </div>
        <div class="quick-actions stagger-children" id="quick-actions">
          <button class="quick-action" data-route="/portfolio">
            <div class="quick-action__icon" style="background: var(--color-accent-bg); color: var(--color-accent);">
              ${icon('user', 24)}
            </div>
            <span class="quick-action__label">My Portfolio</span>
          </button>
          <button class="quick-action" data-route="/jobs">
            <div class="quick-action__icon" style="background: var(--color-success-bg); color: var(--color-success);">
              ${icon('target', 24)}
            </div>
            <span class="quick-action__label">Find Jobs</span>
          </button>
          <button class="quick-action" data-route="/applications">
            <div class="quick-action__icon" style="background: var(--color-warning-bg); color: var(--color-warning);">
              ${icon('inbox', 24)}
            </div>
            <span class="quick-action__label">Applications</span>
          </button>
          <button class="quick-action" data-route="/interview">
            <div class="quick-action__icon" style="background: var(--color-info-bg); color: var(--color-info);">
              ${icon('video', 24)}
            </div>
            <span class="quick-action__label">Interviews</span>
          </button>
        </div>
      </section>

      <!-- Activity Feed -->
      <section class="page-section">
        <div class="section-header">
          <div>
            <h2 class="section-title">Recent Activity</h2>
            <p class="section-subtitle">Your latest updates and actions</p>
          </div>
        </div>
        <div class="activity-feed" id="activity-feed">
          ${hasCachedActivity ? renderActivityHtml(cachedDash.activity) : `
            <div class="skeleton skeleton--card" style="height: 72px;"></div>
            <div class="skeleton skeleton--card" style="height: 72px;"></div>
            <div class="skeleton skeleton--card" style="height: 72px;"></div>
          `}
        </div>
      </section>
    </div>
  `;

  // Hero CTAs
  container.querySelector('#hero-portfolio-btn')?.addEventListener('click', () => navigate('/portfolio'));
  container.querySelector('#hero-jobs-btn')?.addEventListener('click', () => navigate('/jobs'));

  // Quick action navigations
  container.querySelectorAll('.quick-action[data-route]').forEach(btn => {
    btn.addEventListener('click', () => navigate(btn.dataset.route));
  });

  // Load real dashboard data from API
  try {
    const dash = await apiGet('/student/dashboard');

    if (dash && dash.stats) {
      const grid = container.querySelector('#stats-grid');
      if (grid) grid.innerHTML = renderStatsHtml(dash.stats);
    }

    if (dash && dash.activity) {
      const feed = container.querySelector('#activity-feed');
      if (feed) feed.innerHTML = renderActivityHtml(dash.activity);
    }
  } catch (err) {
    // Fallback: load mock data if API fails and no cache
    if (!hasCachedStats) {
      const statsRes = await apiFetch('dashboard/stats');
      if (statsRes.success) {
        const grid = container.querySelector('#stats-grid');
        if (grid) grid.innerHTML = renderStatsHtml(statsRes.data);
      }
    }

    if (!hasCachedActivity) {
      const actRes = await apiFetch('dashboard/activities');
      if (actRes.success) {
        const feed = container.querySelector('#activity-feed');
        if (feed) feed.innerHTML = renderActivityHtml(actRes.data);
      }
    }
  }
}
