/* ===========================
   Main Entry — Supervisor Portal
   Equipped with Keep-Alive Page View Manager and Background SWR
   =========================== */

import './styles/variables.css';
import './styles/reset.css';
import './styles/base.css';
import './styles/components.css';
import './styles/pages.css';
import './styles/animations.css';
import './styles/responsive.css';

import { getState, setState } from './store.js';
import { registerRoute, initRouter } from './router.js';
import { createNavbar } from './components/navbar.js';
import { createSidebarLeft } from './components/sidebar-left.js';
import { apiGet, apiCache, revalidateEndpoint } from './api/client.js';

import dashboardPage from './pages/dashboard.js';
import traineesPage from './pages/trainees.js';
import monitoringMapPage from './pages/monitoring-map.js';
import analyticsPage from './pages/reports.js';
import interestsPage from './pages/interests.js';
import evaluationsPage from './pages/evaluations.js';

/* ─────────────────────────────────────────
   SMART PAGE VIEW & CACHING MANAGER
   ───────────────────────────────────────── */
const pageViews = new Map();
const scrollPositions = new Map();
let activeRouteKey = null;

const routeEndpointMap = {
  '/':            ['/supervisor/dashboard'],
  '/trainees':    ['/supervisor/trainees'],
  '/interests':   ['/ojt/postings', '/supervisor/interests'],
  '/map':         ['/supervisor/monitoring'],
  '/reports':     ['/supervisor/analytics'],
  '/evaluations': ['/supervisor/evaluations/trainees', '/supervisor/evaluations/templates'],
};

function getEndpointsForRoute(routePath) {
  return routeEndpointMap[routePath] || [];
}

/**
 * Smart Page View Manager:
 * - Keeps page views mounted in DOM (display: none / block).
 * - Instant 0ms transition when switching between previously visited pages.
 * - Preserves scroll positions, input search states, and active sub-tabs.
 * - Checks in background for new or updated data; refreshes page only if data changed.
 */
function renderPage(routePath, renderer) {
  return async (mainContent) => {
    if (!mainContent) {
      mainContent = document.getElementById('main-content');
    }
    if (!mainContent) return;

    const routeKey = routePath;

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

      // Special handling for Leaflet map in /map
      if (routeKey === '/map') {
        window.dispatchEvent(new Event('resize'));
      }

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
        // Active page! Check if user is typing or modal is open
        const hasOpenModal = !!document.querySelector('.modal-overlay, .modal-backdrop, .modal-box, .swal2-container');
        const isInteracting = view.container.contains(document.activeElement) &&
          ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName);

        if (hasOpenModal || isInteracting) {
          // Defer until modal closes or interaction finishes
          view.dirty = true;
        } else {
          view.dirty = false;
          view.renderer(view.container);
        }
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

// ── Background Active View Revalidation Engine (Zero Hard Refresh) ──
let activeSyncTimer = null;

async function checkActiveViewFreshness() {
  if (document.hidden || !activeRouteKey) return;
  const view = pageViews.get(activeRouteKey);
  if (!view || !view.endpoints || view.endpoints.length === 0) return;

  // Don't interrupt user typing or active modal interaction
  const hasOpenModal = !!document.querySelector('.modal-overlay, .modal-backdrop, .modal-box, .swal2-container');
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
      await view.renderer(view.container);
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

window.addEventListener('focus', () => {
  checkActiveViewFreshness();
});

document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    checkActiveViewFreshness();
    scheduleActiveViewCheck(6000);
  } else {
    scheduleActiveViewCheck(30000);
  }
});

async function initApp() {
  // ── Auth + Role check ──────────────────────────────────────────────────
  const token = localStorage.getItem('hireme_token');
  const cachedUser = (() => {
    try { return JSON.parse(localStorage.getItem('hireme_user') || 'null'); } catch { return null; }
  })();

  if (!token && !cachedUser) {
    window.location.href = '/login/';
    return;
  }

  // Attempt to refresh user data from API in background or apply cached
  if (cachedUser) {
    if (cachedUser.role && cachedUser.role !== 'supervisor') {
      const destinations = { student: '/main/', company: '/company/', admin: '/admin/', jobseeker: '/jobseeker/' };
      window.location.href = destinations[cachedUser.role] || '/login/';
      return;
    }
    applyUserToStore(cachedUser);
  }

  try {
    const me = await apiGet('/auth/me');
    if (me && (me.data || me.role)) {
      const u = me.data || me;
      if (u.role && u.role !== 'supervisor') {
        const destinations = { student: '/main/', company: '/company/', admin: '/admin/', jobseeker: '/jobseeker/' };
        window.location.href = destinations[u.role] || '/login/';
        return;
      }
      applyUserToStore(u);
      localStorage.setItem('hireme_user', JSON.stringify(u));
    }
  } catch (_) {
    // Network or server error — proceed with cached store session
  }

  // Apply saved theme
  const theme = getState('ui.theme');
  document.documentElement.setAttribute('data-theme', theme);

  // Build shell
  const app = document.getElementById('app');

  // Navbar
  app.appendChild(createNavbar());

  // 3-column layout
  const layout = document.createElement('div');
  layout.className = 'layout';

  layout.appendChild(createSidebarLeft());

  const mainContent = document.createElement('main');
  mainContent.id = 'main-content';
  mainContent.className = 'layout__center';
  layout.appendChild(mainContent);

  app.appendChild(layout);

  // Register routes with Keep-Alive View Manager
  registerRoute('/', renderPage('/', dashboardPage));
  registerRoute('/trainees', renderPage('/trainees', traineesPage));
  registerRoute('/map', renderPage('/map', monitoringMapPage));
  registerRoute('/reports', renderPage('/reports', analyticsPage));
  registerRoute('/interests', renderPage('/interests', interestsPage));
  registerRoute('/evaluations', renderPage('/evaluations', evaluationsPage));

  // Boot router
  initRouter();
  scheduleActiveViewCheck(6000);
}

function applyUserToStore(u) {
  if (!u) return;
  if (u.name) {
    const initials = u.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    setState('user.name', u.name);
    setState('user.initials', initials);
    setState('user.email', u.email || '');
    const sp = u.supervisor_profile || u.supervisor || u.profile;
    if (sp) {
      setState('user.role', sp.position || 'OJT Coordinator');
      setState('user.department', sp.company_name || 'Carlos Hilado Memorial State University');
      setState('user.course', sp.course || u.course || '');
    } else if (u.course) {
      setState('user.course', u.course);
    }
  }
}

initApp();
