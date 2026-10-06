/**
 * CHMSU HireMe — Job Seeker Portal Entry Point
 * With intelligent DOM Keep-Alive page caching and Stale-While-Revalidate data syncing.
 */

// Styles
import './styles/variables.css';
import './styles/reset.css';
import './styles/base.css';
import './styles/components.css';
import './styles/pages.css';
import './styles/animations.css';
import './styles/responsive.css';

// Core
import { registerRoute, navigate, initRouter } from './router.js';
import { getState, setState } from './store.js';
import { apiGet, apiCache, revalidateEndpoint, clearAuth } from './api/client.js';

// Components
import { createNavbar } from './components/navbar.js';
import { createLeftSidebar } from './components/sidebar-left.js';
import { createRightSidebar } from './components/sidebar-right.js';

// Pages
import { renderHome } from './pages/home.js';
import { renderPortfolio } from './pages/portfolio.js';
import { renderJobs } from './pages/jobs.js';
import { renderApplications } from './pages/applications.js';
import { renderInterview } from './pages/interview.js';
import { renderCompanies } from './pages/companies.js';
import { renderCompanyProfile } from './pages/company-profile.js';

// ── Initialize Theme ──
const savedTheme = localStorage.getItem('hireme-theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);

const app = document.getElementById('app');

/* ─────────────────────────────────────────
   AUTH GUARD — check token, load user
   ───────────────────────────────────────── */
async function initAuth() {
  const token = localStorage.getItem('hireme_token');
  if (!token) {
    window.location.href = '../login/';
    return false;
  }

  // Use cached user immediately for instant render
  const cached = localStorage.getItem('hireme_user');
  if (cached) {
    try {
      const u = JSON.parse(cached);
      applyUserToStore(u);
    } catch (_) { /* ignore */ }
  }

  // Verify + refresh from API
  try {
    const data = await apiGet('/auth/me');
    if (!data) return false;

    const role = data.data?.role || data.role;
    if (role && role !== 'jobseeker' && role !== 'graduate') {
      const destinations = {
        student:    '../main/',
        company:    '../company/',
        supervisor: '../supervisors/',
        admin:      '../admin/',
      };
      window.location.href = destinations[role] || '../login/';
      return false;
    }

    applyUserToStore(data.data || data);
    localStorage.setItem('hireme_user', JSON.stringify(data.data || data));
  } catch {
    // Network error — keep using cached user
  }

  return true;
}

function applyUserToStore(data) {
  const nameParts = (data.name || '').trim().split(/\s+/);
  const initials  = nameParts.map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const jp = data.jobseeker_profile || {};
  const gp = data.graduate_profile  || {};

  setState('user', {
    id:                   data.id,
    name:                 data.name,
    email:                data.email,
    initials,
    role:                 'Graduate',
    avatar:               data.avatar_url ?? null,
    desiredJobTitle:      jp.desired_job_title || '',
    workPreference:       jp.work_preference || '',
    yearsOfExperience:    jp.years_of_experience || '',
    // Graduate-specific
    course:               gp.course || '',
    campus:               gp.campus || '',
    yearGraduated:        gp.year_graduated || '',
    employmentStatus:     gp.employment_status || '',
    onboardingCompleted:  data.onboarding_completed,
  });
}

/* ─────────────────────────────────────────
   TOAST UTILITY
   ───────────────────────────────────────── */
import { showToast } from './utils.js';

/* ─────────────────────────────────────────
   BUILD APP SHELL
   ───────────────────────────────────────── */
function buildShell() {
  const navbar = createNavbar();
  app.appendChild(navbar);

  const toastContainer = document.createElement('div');
  toastContainer.className = 'toast-container';
  app.appendChild(toastContainer);

  const layoutWrapper = document.createElement('div');
  layoutWrapper.className = 'layout';
  layoutWrapper.id = 'app-layout';

  const leftSidebar = createLeftSidebar();
  layoutWrapper.appendChild(leftSidebar);

  const mainContent = document.createElement('main');
  mainContent.className = 'layout__center';
  mainContent.id = 'main-content';
  layoutWrapper.appendChild(mainContent);

  const rightSidebar = createRightSidebar();
  layoutWrapper.appendChild(rightSidebar);

  app.appendChild(layoutWrapper);

  return { leftSidebar, mainContent };
}

/* ─────────────────────────────────────────
   SMART PAGE VIEW & CACHING MANAGER
   ───────────────────────────────────────── */
const pageViews = new Map();
const scrollPositions = new Map();
let activeRouteKey = null;

const routeEndpointMap = {
  '/':             ['/jobseeker/dashboard'],
  '/portfolio':    ['/jobseeker/portfolio', '/jobseeker/profile-completeness'],
  '/jobs':         ['/jobseeker/employment-status', '/jobseeker/jobs', '/jobseeker/applications'],
  '/applications': ['/jobseeker/applications'],
  '/interview':    ['/jobseeker/interviews'],
  '/companies':    ['/companies'],
};

function getEndpointsForRoute(routePath, params = {}) {
  if (routePath.startsWith('/company/')) {
    const id = params.id;
    return id ? [`/companies/${id}`, `/companies/${id}/jobs`, `/companies/${id}/ojt-postings`] : ['/companies'];
  }
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
  return async (params = {}) => {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;

    const routeKey = params.id ? `${routePath.replace(':id', params.id)}` : routePath;

    if (activeRouteKey && activeRouteKey !== routeKey) {
      scrollPositions.set(activeRouteKey, window.scrollY);
    }
    activeRouteKey = routeKey;

    const endpoints = getEndpointsForRoute(routePath, params);

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

      // 2. STALE-WHILE-REVALIDATE: Check for new data
      const isStaleOrExpired = existingView.dirty || endpoints.some(ep => !apiCache.isFresh(ep));

      if (isStaleOrExpired && endpoints.length > 0) {
        try {
          const results = await Promise.all(
            endpoints.map(ep => revalidateEndpoint(ep))
          );
          const hasNewData = existingView.dirty || results.some(r => r.changed);

          if (hasNewData) {
            existingView.dirty = false;
            await renderer(existingView.container, params);
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
        params,
        dirty: false,
      };
      pageViews.set(routeKey, viewRecord);

      await renderer(pageContainer, params);
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  };
}

// Gate: blocks gated pages if profile is not fully set up
function profileGate(routePath, renderer) {
  const pageHandler = renderPage(routePath, renderer);
  return async (params = {}) => {
    const c = getState('profileCompleteness');
    if (c && !c.is_complete) {
      showToast('Complete your profile first — About Me, Education, Experience, and Skills are required.', 'warning', 5000);
      navigate('/portfolio');
      return;
    }
    await pageHandler(params);
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
        view.renderer(view.container, view.params);
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

/* ─────────────────────────────────────────
   BOOT
   ───────────────────────────────────────── */
initAuth().then(async (authenticated) => {
  if (!authenticated) return;
  buildShell();

  // Welcome banner if transitioned from student promotion
  if (sessionStorage.getItem('hireme_just_promoted') === 'true') {
    sessionStorage.removeItem('hireme_just_promoted');
    setTimeout(() => {
      showToast('🎓 Welcome to your Alumni & Career Portal! Your account and records are ready.', 'success', 6000);
    }, 600);
  }

  // Load profile completeness before registering routes
  const comp = await apiGet('/jobseeker/profile-completeness');
  if (comp) setState('profileCompleteness', comp);

  registerRoute('/',             renderPage('/', renderHome));
  registerRoute('/portfolio',    renderPage('/portfolio', renderPortfolio));
  registerRoute('/jobs',         renderPage('/jobs', renderJobs));
  registerRoute('/applications', profileGate('/applications', renderApplications));
  registerRoute('/interview',    profileGate('/interview', renderInterview));
  registerRoute('/companies',    renderPage('/companies', renderCompanies));
  registerRoute('/company/:id',  (params) => renderPage('/company/:id', renderCompanyProfile)(params));

  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.slice(1) || '/';
    // Map parameterized routes to their parent nav item (e.g. /company/3 → /companies)
    const activeRoute = hash.startsWith('/company/') ? '/companies' : hash;
    document.querySelectorAll('.sidebar-nav__item').forEach(item => {
      item.classList.toggle('sidebar-nav__item--active', item.getAttribute('data-route') === activeRoute);
    });
    document.querySelectorAll('.navbar__tab').forEach(tab => {
      tab.classList.toggle('navbar__tab--active', tab.getAttribute('data-route') === activeRoute);
    });
  });

  document.addEventListener('click', (e) => {
    const leftSidebar = document.getElementById('sidebar-left');
    if (e.target.closest('#mobile-sidebar-toggle')) {
      leftSidebar?.classList.toggle('sidebar-left--open');
    }
    if (!e.target.closest('.sidebar-left') && !e.target.closest('#mobile-sidebar-toggle')) {
      leftSidebar?.classList.remove('sidebar-left--open');
    }
  });

  initRouter();
});
