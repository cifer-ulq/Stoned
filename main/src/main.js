/**
 * CHMSU HireMe — Application Entry Point (Facebook-style 3-column layout)
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
import { registerRoute, initRouter } from './router.js';
import { getState, setState } from './store.js';
import { apiGet, apiGetFresh, apiCache, revalidateEndpoint, clearAuth } from './api/client.js';

// Components
import { createNavbar } from './components/navbar.js';
import { createLeftSidebar } from './components/sidebar-left.js';
import { createRightSidebar } from './components/sidebar-right.js';
import { showPromotionCelebrationModal } from './components/promotion-modal.js';

// Pages
import { renderHome } from './pages/home.js';
import { renderPortfolio } from './pages/portfolio.js';
import { renderJobs } from './pages/jobs.js';
import { renderApplications } from './pages/applications.js';
import { renderOJT } from './pages/ojt.js';
import { renderOJTTracker } from './pages/ojt-tracker.js';
import { renderAlumni } from './pages/alumni.js';
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
      if (u.role === 'graduate' || u.role === 'jobseeker' || u.status === 'alumni') {
        window.location.href = '../jobseeker/';
        return false;
      }
      applyUserToStore(u);
    } catch (_) { /* ignore bad cache */ }
  }

  // Verify + refresh user from API in background
  try {
    const data = await apiGet('/auth/me');
    if (!data) return false; // 401 handled inside apiGet → redirects

    // Role guard — only students can access this portal
    const role = data.data?.role || data.role;
    if (role && role !== 'student') {
      const destinations = {
        graduate:   '../jobseeker/',
        jobseeker:  '../jobseeker/',
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
    // Network error — keep using cached user, don't redirect
  }

  return true;
}

function applyUserToStore(data) {
  const nameParts = (data.name || '').trim().split(/\s+/);
  const initials  = nameParts.map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const isAlumni  = data.role === 'graduate' || data.status === 'alumni' || data.student_profile?.status === 'alumni' || data.year_level === 'Graduated';
  const isActiveOjt = !isAlumni && (data.is_active_ojt === true || data.status === 'active_ojt');

  setState('user', {
    id:                  data.id,
    name:                data.name,
    email:               data.email,
    initials,
    rawRole:             data.role,
    role:                isAlumni ? 'Alumni / Graduate' : (data.role === 'student' ? 'BSIT Student' : (data.role || 'Student')),
    status:              isAlumni ? 'alumni' : (isActiveOjt ? 'active_ojt' : (data.status || 'regular')),
    is_active_ojt:       isActiveOjt,
    is_alumni:           isAlumni,
    avatar:              data.avatar_url ?? null,
    onboardingCompleted: data.onboarding_completed,
  });
}

/* ─────────────────────────────────────────
   BUILD APP SHELL
   ───────────────────────────────────────── */
function buildShell() {
  // Navbar (top)
  const navbar = createNavbar();
  app.appendChild(navbar);

  // Toast container
  const toastContainer = document.createElement('div');
  toastContainer.className = 'toast-container';
  app.appendChild(toastContainer);

  // 3-column layout wrapper
  const layoutWrapper = document.createElement('div');
  layoutWrapper.className = 'layout';
  layoutWrapper.id = 'app-layout';

  // Left sidebar
  const leftSidebar = createLeftSidebar();
  layoutWrapper.appendChild(leftSidebar);

  // Center content
  const mainContent = document.createElement('main');
  mainContent.className = 'layout__center';
  mainContent.id = 'main-content';
  layoutWrapper.appendChild(mainContent);

  // Right sidebar
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
  '/':             ['/student/dashboard', '/auth/me', '/student/employment-status'],
  '/portfolio':    ['/student/portfolio', '/student/requirements', '/auth/me', '/student/employment-status'],
  '/jobs':         ['/student/employment-status', '/student/jobs', '/student/applications', '/student/external-jobs'],
  '/applications': ['/student/applications', '/ojt/my-interests'],
  '/ojt':          ['/student/employment-status', '/ojt/my-interests', '/student/portfolio', '/student/requirements', '/ojt/postings'],
  '/ojt-tracker':  ['/student/ojt-tracker', '/student/evaluation', '/student/employment-status'],
  '/interview':    ['/student/interviews'],
  '/companies':    ['/companies'],
  '/alumni':       [],
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

    // Save previous route scroll position
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
            // Seamlessly re-render with the new data
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
        // Active page! Check if user is typing or modal is open
        const hasOpenModal = !!document.querySelector('.modal-overlay, .modal-backdrop');
        const isInteracting = view.container.contains(document.activeElement) &&
          ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName);

        if (hasOpenModal || isInteracting) {
          // Postpone until blur or modal close
          view.dirty = true;
        } else {
          view.dirty = false;
          view.renderer(view.container, view.params);
        }
      } else {
        // Background page: mark dirty so it re-renders fresh when navigated to
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

// ── Background Active View Revalidation Engine (Zero Hard Refresh) ──
let activeSyncTimer = null;

async function checkActiveViewFreshness() {
  if (document.hidden || !activeRouteKey) return;
  const view = pageViews.get(activeRouteKey);
  if (!view || !view.endpoints || view.endpoints.length === 0) return;

  // Don't interrupt user typing or active modal interaction
  const hasOpenModal = !!document.querySelector('.modal-overlay, .modal-backdrop');
  const isInteracting = view.container.contains(document.activeElement) &&
    ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName);

  if (hasOpenModal || isInteracting) {
    return;
  }

  try {
    const results = await Promise.all(
      view.endpoints.map(ep => revalidateEndpoint(ep))
    );
    const hasChange = view.dirty || results.some(r => r.changed);
    if (hasChange) {
      view.dirty = false;
      await view.renderer(view.container, view.params);
    }
  } catch (_) {}
}

function scheduleActiveViewCheck(delay = 6000) {
  clearTimeout(activeSyncTimer);
  activeSyncTimer = setTimeout(async () => {
    await checkActiveViewFreshness();
    scheduleActiveViewCheck(document.hidden ? 30000 : 6000);
  }, delay);
}

// ── Real-Time Graduation & Promotion Listener ──
window.addEventListener('hireme:graduated-promoted', (e) => {
  const notif = e.detail || {};
  showPromotionCelebrationModal(notif);
});

window.addEventListener('focus', async () => {
  checkActiveViewFreshness();
  try {
    const u = getState('user');
    if (u && (u.rawRole === 'student' || !u.is_alumni)) {
      const fresh = await apiGetFresh('/auth/me');
      const r = fresh?.data?.role || fresh?.role;
      if (r === 'graduate' || r === 'jobseeker') {
        showPromotionCelebrationModal({ data: fresh?.data || fresh });
      }
    }
  } catch (_) {}
});

document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    checkActiveViewFreshness();
    scheduleActiveViewCheck(6000);
  } else {
    scheduleActiveViewCheck(30000);
  }
});

/* ─────────────────────────────────────────
   BOOT — auth guard then mount
   ───────────────────────────────────────── */
initAuth().then(authenticated => {
  if (!authenticated) return;
  buildShell();

  registerRoute('/',             renderPage('/', renderHome));
  registerRoute('/portfolio',    renderPage('/portfolio', renderPortfolio));
  registerRoute('/jobs',         renderPage('/jobs', renderJobs));
  registerRoute('/applications', renderPage('/applications', renderApplications));
  registerRoute('/ojt',          (params) => {
    const user = getState('user');
    const isAlumni = user?.is_alumni || user?.status === 'alumni' || user?.rawRole === 'graduate' || user?.role?.toLowerCase().includes('graduate') || user?.role?.toLowerCase().includes('alumni');
    if (isAlumni) {
      window.location.hash = '#/jobs';
      return;
    }
    return renderPage('/ojt', renderOJT)(params);
  });
  registerRoute('/ojt-tracker',  (params) => {
    const user = getState('user');
    const isAlumni = user?.is_alumni || user?.status === 'alumni' || user?.rawRole === 'graduate' || user?.role?.toLowerCase().includes('graduate') || user?.role?.toLowerCase().includes('alumni');
    if (isAlumni) {
      window.location.hash = '#/jobs';
      return;
    }
    return renderPage('/ojt-tracker', renderOJTTracker)(params);
  });
  registerRoute('/alumni',       renderPage('/alumni', renderAlumni));
  registerRoute('/interview',    renderPage('/interview', renderInterview));
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

  initRouter(app);
  scheduleActiveViewCheck(6000);
});
