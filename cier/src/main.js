/* ── Main Entry — CIER Portal ── */
import '../../admin/src/styles/variables.css';
import '../../admin/src/styles/reset.css';
import '../../admin/src/styles/base.css';
import '../../admin/src/styles/components.css';
import '../../admin/src/styles/pages.css';
import '../../admin/src/styles/companies.css';
import '../../admin/src/styles/animations.css';
import '../../admin/src/styles/responsive.css';

import { registerRoute, initRouter } from './router.js';
import { getState, setState } from './store.js';
import { initNavbar } from './components/navbar.js';
import { initSidebarLeft } from './components/sidebar-left.js';
import { initSidebarRight } from './components/sidebar-right.js';
import { apiGet, isFresh, revalidateEndpoint } from './api/client.js';
import { checkAndEnforceTermsGate } from '@shared/terms-policy.js';

import CierCompaniesPage from './pages/companies.js';
import SettingsPage from './pages/settings.js';

const pageViews = new Map();
const scrollPositions = new Map();
let activeRouteKey = null;

const routeEndpointMap = {
  '/':          ['/cier/companies'],
  '/companies': ['/cier/companies'],
  '/settings':  [],
};

function getEndpointsForRoute(routePath) {
  return routeEndpointMap[routePath] || [];
}

function renderPage(routePath, renderer) {
  return async (mainContent) => {
    if (!mainContent) mainContent = document.getElementById('main-content');
    if (!mainContent) return;

    const routeKey = routePath === '/companies' ? '/' : routePath;

    if (activeRouteKey && activeRouteKey !== routeKey) {
      scrollPositions.set(activeRouteKey, window.scrollY);
    }
    activeRouteKey = routeKey;

    const endpoints = getEndpointsForRoute(routeKey);
    pageViews.forEach((view) => { view.container.style.display = 'none'; });

    const existingView = pageViews.get(routeKey);
    if (existingView) {
      existingView.container.style.display = 'block';
      window.scrollTo({ top: scrollPositions.get(routeKey) || 0, behavior: 'instant' });

      const isStaleOrExpired = existingView.dirty || endpoints.some(ep => !isFresh(ep));
      if (isStaleOrExpired && endpoints.length > 0) {
        try {
          const results = await Promise.all(endpoints.map(ep => revalidateEndpoint(ep)));
          if (existingView.dirty || results.some(r => r.changed)) {
            existingView.dirty = false;
            await renderer(existingView.container);
          }
        } catch {}
      }
    } else {
      const pageContainer = document.createElement('div');
      pageContainer.className = 'app-page-view page-enter';
      pageContainer.dataset.route = routeKey;
      pageContainer.style.width = '100%';
      mainContent.appendChild(pageContainer);

      pageViews.set(routeKey, { container: pageContainer, renderer, endpoints, dirty: false });
      await renderer(pageContainer);
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  };
}

window.addEventListener('hireme:cache-invalidated', (e) => {
  const patterns = e.detail?.patterns || [];
  pageViews.forEach((view, key) => {
    const isAffected = view.endpoints.some(ep => patterns.some(pattern => {
      const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
      return regex.test(ep);
    }));
    if (isAffected) {
      if (key === activeRouteKey) {
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

let activeSyncTimer = null;
async function checkActiveViewFreshness() {
  if (document.hidden || !activeRouteKey) return;
  const view = pageViews.get(activeRouteKey);
  if (!view || !view.endpoints || view.endpoints.length === 0) return;

  const hasOpenModal = !!document.querySelector('.modal-overlay, .modal-backdrop, .modal-box, .swal2-container');
  const isInteracting = view.container.contains(document.activeElement) &&
    ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName);
  if (hasOpenModal || isInteracting) return;

  try {
    const results = await Promise.all(view.endpoints.map(ep => revalidateEndpoint(ep)));
    if (view.dirty || results.some(r => r.changed)) {
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

window.addEventListener('focus', () => checkActiveViewFreshness());
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    checkActiveViewFreshness();
    scheduleActiveViewCheck(6000);
  } else {
    scheduleActiveViewCheck(30000);
  }
});

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
  const cachedUser = localStorage.getItem('hireme_user');
  if (!cachedUser) { window.location.href = '../login/'; return; }

  try {
    const me = await apiGet('/auth/me');
    if (!me) return;

    const u = me.data || me;
    if (u.role && u.role !== 'cier') {
      const destinations = {
        student:    '../main/',
        graduate:   '../jobseeker/',
        jobseeker:  '../jobseeker/',
        company:    '../company/',
        supervisor: '../supervisors/',
        admin:      '../admin/',
      };
      window.location.href = destinations[u.role] || '../login/';
      return;
    }

    if (u.name) {
      const initials = u.name.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'CI';
      setState('user.name', u.name);
      setState('user.initials', initials);
    }
    if (u.avatar_url) {
      setState('user.avatar_url', u.avatar_url);
    }
    localStorage.setItem('hireme_user', JSON.stringify(u));
  } catch (_) {}

  try {
    const activeUser = JSON.parse(localStorage.getItem('hireme_user') || 'null');
    if (activeUser && !activeUser.must_change_password) {
      checkAndEnforceTermsGate(activeUser);
    }
  } catch (_) {}

  registerRoute('/', renderPage('/', CierCompaniesPage));
  registerRoute('/companies', renderPage('/companies', CierCompaniesPage));
  registerRoute('/settings', renderPage('/settings', SettingsPage));

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
