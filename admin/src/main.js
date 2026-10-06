/* ── Main Entry — Admin Portal ── */
import './styles/variables.css';
import './styles/reset.css';
import './styles/base.css';
import './styles/components.css';
import './styles/pages.css';
import './styles/companies.css';
import './styles/animations.css';
import './styles/responsive.css';

import { registerRoute, initRouter } from './router.js';
import { getState } from './store.js';
import { initNavbar } from './components/navbar.js';
import { initSidebarLeft } from './components/sidebar-left.js';
import { initSidebarRight } from './components/sidebar-right.js';
import { apiGet, isFresh, revalidateEndpoint } from './api/client.js';

/* Pages */
import DashboardPage from './pages/dashboard.js';
import StudentsPage from './pages/students.js';
import CompaniesPage from './pages/companies.js';
import OjtPage from './pages/ojt-management.js';
import JobPostingsPage from './pages/job-postings.js';
import MatchingPage from './pages/matching.js';
import AnalyticsPage from './pages/analytics.js';
import SettingsPage from './pages/settings.js';

/* ─────────────────────────────────────────
   SMART PAGE VIEW & CACHING MANAGER
   ───────────────────────────────────────── */
const pageViews = new Map();
const scrollPositions = new Map();
let activeRouteKey = null;

const routeEndpointMap = {
  '/':          ['/admin/dashboard'],
  '/students':  ['/admin/students'],
  '/companies': ['/admin/companies'],
  '/ojt':       ['/admin/ojt', '/admin/supervisors', '/admin/ojt-analytics'],
  '/jobs':      ['/admin/jobs'],
  '/matching':  ['/admin/skills-matching'],
  '/reports':   ['/admin/alumni-analytics'],
  '/settings':  [],
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

      // 2. STALE-WHILE-REVALIDATE: Check for new data in background
      const isStaleOrExpired = existingView.dirty || endpoints.some(ep => !isFresh(ep));

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

/* Build layout shell */
function buildShell() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <aside class="sidebar-left" id="sidebar-left"></aside>
    <div id="navbar"></div>
    <div class="layout">
      <main class="layout__center" id="main-content"></main>
      <aside class="sidebar-right" id="sidebar-right"></aside>
    </div>
  `;
}

async function initApp() {
  // ── Auth + Role guard ──────────────────────────────────────────────────
  const token = localStorage.getItem('hireme_token');
  if (!token) { window.location.href = '../login/'; return; }

  try {
    const me = await apiGet('/auth/me');
    if (!me) return; // 401 → already redirected

    const u = me.data || me;
    if (u.role && u.role !== 'admin') {
      const destinations = { student: '../main/', company: '../company/', supervisor: '../supervisors/' };
      window.location.href = destinations[u.role] || '../login/';
      return;
    }

    if (u.name) {
      const initials = u.name.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'MM';
      import('./store.js').then(({ setState }) => {
        setState('user.name', u.name);
        setState('user.initials', initials);
      });
    }
  } catch (_) {
    // Network error — allow cached session to proceed
  }

  /* Register routes with Keep-Alive View Manager */
  registerRoute('/', renderPage('/', DashboardPage));
  registerRoute('/students', renderPage('/students', StudentsPage));
  registerRoute('/companies', renderPage('/companies', CompaniesPage));
  registerRoute('/ojt', renderPage('/ojt', OjtPage));
  registerRoute('/jobs', renderPage('/jobs', JobPostingsPage));
  registerRoute('/matching', renderPage('/matching', MatchingPage));
  registerRoute('/reports', renderPage('/reports', AnalyticsPage));
  registerRoute('/settings', renderPage('/settings', SettingsPage));

  /* Init */
  const theme = getState('ui.theme');
  document.documentElement.setAttribute('data-theme', theme);
  buildShell();
  initNavbar();
  initSidebarLeft();
  initSidebarRight();
  initRouter();
  scheduleActiveViewCheck(6000);
}

initApp();
