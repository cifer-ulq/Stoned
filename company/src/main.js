/**
 * CHMSU HireMe — Company Portal Entry Point
 * Equipped with Keep-Alive Page View Manager and Background SWR
 */
import './styles/reset.css';
import './styles/variables.css';
import './styles/base.css';
import './styles/components.css';
import './styles/pages.css';
import './styles/animations.css';
import './styles/responsive.css';

import { createNavbar } from './components/navbar.js';
import { createLeftSidebar } from './components/sidebar-left.js';
import { registerRoute, initRouter } from './router.js';
import { getState, setState } from './store.js';
import { apiGet, apiCache, revalidateEndpoint } from './api/client.js';

import { renderDashboard } from './pages/dashboard.js';
import { renderJobs } from './pages/jobs.js';
import { renderPostJob } from './pages/post-job.js';
import { renderApplicants } from './pages/applicants.js';
import { renderInterviews } from './pages/interviews.js';
import { renderAnalytics } from './pages/analytics.js';
import { renderProfileSetup } from './pages/profile-setup.js';
import { renderCompanyProfile } from './pages/profile.js';
import { renderOjtSlots } from './pages/ojt-slots.js';
import { renderOjtTrainees } from './pages/ojt-trainees.js';

/* ─────────────────────────────────────────
   SMART PAGE VIEW & CACHING MANAGER
   ───────────────────────────────────────── */
const pageViews = new Map();
const scrollPositions = new Map();
let activeRouteKey = null;

const routeEndpointMap = {
  '/':             ['/company/dashboard'],
  '/jobs':         ['/company/jobs'],
  '/ojt-slots':    ['/company/ojt-postings'],
  '/ojt-trainees': ['/company/ojt-trainees'],
  '/applicants':   ['/company/applications'],
  '/interviews':   ['/company/interviews'],
  '/analytics':    ['/company/analytics'],
  '/profile':      ['/company/profile'],
  '/profile-setup':['/company/profile', '/auth/me'],
};

function getEndpointsForRoute(routePath) {
  return routeEndpointMap[routePath] || [];
}

/**
 * Smart Page View Manager:
 * - Keeps page views mounted in DOM (display: none / block).
 * - Instant 0ms transition when switching between previously visited pages.
 * - Preserves scroll positions and input/filter states.
 * - Checks in background for new or updated data; refreshes page only if data changed.
 */
function renderPage(routePath, renderer) {
  return async (mainContent) => {
    if (!mainContent) {
      mainContent = document.getElementById('main-content');
    }
    if (!mainContent) return;

    // For routes like /post-job?edit=12, include query params in key
    const rawHash = window.location.hash.slice(1) || '/';
    const routeKey = routePath === '/post-job' ? rawHash : routePath;

    if (activeRouteKey && activeRouteKey !== routeKey) {
      scrollPositions.set(activeRouteKey, window.scrollY);
    }
    activeRouteKey = routeKey;

    const endpoints = getEndpointsForRoute(routePath);

    // Hide all existing page containers
    pageViews.forEach((view) => {
      view.container.style.display = 'none';
    });

    const existingView = pageViews.get(routeKey);

    if (existingView) {
      // 1. INSTANT DISPLAY: Unhide existing container
      existingView.container.style.display = 'block';

      // Restore scroll position
      const savedScroll = scrollPositions.get(routeKey) || 0;
      window.scrollTo({ top: savedScroll, behavior: 'instant' });

      // 2. STALE-WHILE-REVALIDATE: Check for new data in background
      const isStaleOrExpired = existingView.dirty || endpoints.some(ep => !apiCache.isFresh(ep));

      if (isStaleOrExpired && endpoints.length > 0) {
        try {
          const results = await Promise.all(
            endpoints.map(ep => revalidateEndpoint(ep))
          );
          const hasNewData = existingView.dirty || results.some(r => r.changed);

          if (hasNewData) {
            existingView.dirty = false;
            await renderer(existingView.container);
          }
        } catch {
          // Network error: continue showing existing cached view safely
        }
      }
    } else {
      // First visit: create container and mount
      const pageContainer = document.createElement('div');
      pageContainer.className = 'app-page-view page-enter';
      pageContainer.dataset.route = routeKey;
      pageContainer.style.width = '100%';
      mainContent.appendChild(pageContainer);

      const viewRecord = {
        container: pageContainer,
        renderer,
        endpoints,
        dirty: false,
      };
      pageViews.set(routeKey, viewRecord);

      await renderer(pageContainer);
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  };
}

// ── Global listeners for cache invalidation & session cleanup ──
window.addEventListener('hireme:cache-invalidated', (e) => {
  const patterns = e.detail?.patterns || [];
  pageViews.forEach((view, key) => {
    const isAffected = view.endpoints.some(ep => {
      return patterns.some(pattern => {
        const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
        return regex.test(ep);
      });
    });

    if (isAffected) {
      if (key === activeRouteKey) {
        view.dirty = false;
        view.renderer(view.container);
      } else {
        view.dirty = true;
      }
    }
  });
});

window.addEventListener('hireme:clear-views', () => {
  pageViews.forEach(v => v.container.remove());
  pageViews.clear();
  scrollPositions.clear();
  activeRouteKey = null;
});

async function initApp() {
  const app = document.getElementById('app');

  // ── Auth + Role guard ──────────────────────────────────────────────────
  const token = localStorage.getItem('hireme_token');
  if (!token) { window.location.href = '../login/'; return; }

  // Load company identity: try real API first, then localStorage, then dev fallback
  let identity;
  try {
    const me = await apiGet('/auth/me');
    if (!me || (!me.success && !me.data && !me.role)) {
      window.location.href = '../login/'; return;
    }

    const u = me.data || me;

    // Role guard — only company users can access this portal
    if (u.role && u.role !== 'company') {
      const destinations = { student: '../main/', supervisor: '../supervisors/', admin: '../admin/', jobseeker: '../jobseeker/' };
      window.location.href = destinations[u.role] || '../login/';
      return;
    }

    const cp = u.company_profile || {};
    identity = {
      id: u.id,
      name: cp.company_name || u.name,
      contactPerson: u.name,
      initials: u.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2),
      role: 'HR Manager',
      email: u.email,
      industry: cp.company_type || '',
      location: cp.company_location || '',
      companySize: cp.company_size || '',
      contactEmail: cp.contact_email || '',
      contactPhone: cp.contact_phone || '',
      website: cp.website || '',
      description: cp.description || '',
      logoUrl: cp.logo_url || null,
      profileCompleted: !!(cp.profile_completed),
      moaStatus: cp.moa_status || 'Pending',
      moaRequestedAt: cp.moa_requested_at || null,
      moaRequestNotes: cp.moa_request_notes || '',
      registrationSource: cp.registration_source || 'admin',
      canPostOpportunities: cp.can_post_opportunities !== undefined
        ? Boolean(cp.can_post_opportunities)
        : (Boolean(cp.profile_completed) && ['active', 'expiring soon'].includes((cp.moa_status || '').toLowerCase())),
    };
    localStorage.setItem('hireme_company_user', JSON.stringify(identity));
  } catch (_) {
    const raw = localStorage.getItem('hireme_company_user');
    identity = raw ? JSON.parse(raw) : {
      id: 1,
      name: 'TechCorp Solutions',
      contactPerson: 'Maria Clara',
      initials: 'TC',
      role: 'HR Manager',
      email: 'hr@techcorp.ph',
      industry: 'Information Technology',
    };
  }
  setState('company', identity);

  // Restore theme
  const savedTheme = localStorage.getItem('hireme-company-theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);

  // Build layout (no right sidebar)
  const navbar = createNavbar();
  app.appendChild(navbar);

  const layout = document.createElement('div');
  layout.className = 'layout layout--no-right';

  const leftSidebar = createLeftSidebar();
  layout.appendChild(leftSidebar);

  const mainContent = document.createElement('main');
  mainContent.className = 'layout__center';
  mainContent.id = 'main-content';
  layout.appendChild(mainContent);

  app.appendChild(layout);

  // Mobile overlay
  const overlay = document.createElement('div');
  overlay.className = 'mobile-overlay';
  overlay.id = 'mobile-overlay';
  overlay.addEventListener('click', closeMobileMenu);
  app.appendChild(overlay);

  // Mobile button
  const mobileBtn = document.createElement('button');
  mobileBtn.className = 'mobile-menu-btn';
  mobileBtn.id = 'mobile-menu-btn';
  mobileBtn.innerHTML = '☰';
  mobileBtn.addEventListener('click', toggleMobileMenu);
  app.appendChild(mobileBtn);

  // Register routes with Keep-Alive View Manager
  registerRoute('/', renderPage('/', renderDashboard));
  registerRoute('/jobs', renderPage('/jobs', renderJobs));
  registerRoute('/post-job', renderPage('/post-job', renderPostJob));
  registerRoute('/ojt-slots', renderPage('/ojt-slots', renderOjtSlots));
  registerRoute('/ojt-trainees', renderPage('/ojt-trainees', renderOjtTrainees));
  registerRoute('/applicants', renderPage('/applicants', renderApplicants));
  registerRoute('/interviews', renderPage('/interviews', renderInterviews));
  registerRoute('/analytics', renderPage('/analytics', renderAnalytics));
  registerRoute('/profile-setup', renderPage('/profile-setup', renderProfileSetup));
  registerRoute('/profile', renderPage('/profile', renderCompanyProfile));

  // Profile-guard: routes that require profile to be set up
  const GUARDED_ROUTES = ['/jobs', '/post-job', '/ojt-slots', '/ojt-trainees', '/applicants', '/interviews', '/analytics'];
  window.addEventListener('hashchange', () => {
    const raw = window.location.hash.slice(1) || '/';
    const path = raw.split('?')[0];
    const comp = getState('company');
    if (!comp?.profileCompleted && GUARDED_ROUTES.includes(path)) {
      // Redirect back and show popup
      history.replaceState(null, '', window.location.pathname + '#/');
      window.dispatchEvent(new CustomEvent('hashchange'));
      showProfileIncompleteModal();
    }
  });

  initRouter();
}

function toggleMobileMenu() {
  document.getElementById('sidebar-left').classList.toggle('sidebar-left--open');
  document.getElementById('mobile-overlay').classList.toggle('mobile-overlay--visible');
}

function closeMobileMenu() {
  document.getElementById('sidebar-left').classList.remove('sidebar-left--open');
  document.getElementById('mobile-overlay').classList.remove('mobile-overlay--visible');
}

function showProfileIncompleteModal() {
  const existing = document.getElementById('profile-guard-overlay');
  if (existing) return;

  const overlay = document.createElement('div');
  overlay.id = 'profile-guard-overlay';
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-box modal-box--sm" role="dialog" aria-modal="true" style="max-width:420px;text-align:center;padding:2rem;">
      <div style="font-size:3rem;margin-bottom:1rem;">🏢</div>
      <h2 style="font-size:1.25rem;font-weight:700;margin-bottom:.5rem;color:var(--text-primary)">Complete Your Company Profile</h2>
      <p style="color:var(--text-secondary);margin-bottom:1.5rem;font-size:.95rem;">
        You need to set up your company profile before you can post jobs, OJT slots, or access other features.
      </p>
      <div style="display:flex;gap:.75rem;justify-content:center;">
        <button id="guard-dismiss-btn" class="btn btn--ghost">Not Now</button>
        <button id="guard-setup-btn" class="btn btn--primary">Set Up Profile</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.querySelector('.modal-box')?.classList.add('modal-box--visible'));

  overlay.querySelector('#guard-dismiss-btn').addEventListener('click', () => overlay.remove());
  overlay.querySelector('#guard-setup-btn').addEventListener('click', () => {
    overlay.remove();
    window.location.hash = '/profile-setup';
  });
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
}

window.addEventListener('hashchange', closeMobileMenu);

initApp();
