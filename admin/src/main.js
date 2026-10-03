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
import { apiGet } from './api/client.js';

/* Pages */
import DashboardPage from './pages/dashboard.js';
import StudentsPage from './pages/students.js';
import CompaniesPage from './pages/companies.js';
import OjtPage from './pages/ojt-management.js';
import JobPostingsPage from './pages/job-postings.js';
import MatchingPage from './pages/matching.js';
import AnalyticsPage from './pages/analytics.js';
import SettingsPage from './pages/settings.js';

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
  } catch (_) {
    // Network error — allow cached session to proceed
  }

  /* Register routes */
  registerRoute('/', container => DashboardPage(container));
  registerRoute('/students', container => StudentsPage(container));
  registerRoute('/companies', container => CompaniesPage(container));
  registerRoute('/ojt', container => OjtPage(container));
  registerRoute('/jobs', container => JobPostingsPage(container));
  registerRoute('/matching', container => MatchingPage(container));
  registerRoute('/reports', container => AnalyticsPage(container));
  registerRoute('/settings', container => SettingsPage(container));

  /* Init */
  const theme = getState('ui.theme');
  document.documentElement.setAttribute('data-theme', theme);
  buildShell();
  initNavbar();
  initSidebarLeft();
  initSidebarRight();
  initRouter();
}

initApp();
