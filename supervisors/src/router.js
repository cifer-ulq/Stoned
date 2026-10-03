/* ===========================
   Hash-Based Router — Supervisor Portal
   =========================== */

const routes = {};
let currentCleanup = null;

export function registerRoute(path, handler) {
  routes[path] = handler;
}

export function navigate(path) {
  window.location.hash = path;
}

function resolveRoute() {
  const hash = window.location.hash.slice(1) || '/';
  const handler = routes[hash];
  const mainContent = document.getElementById('main-content');

  if (typeof currentCleanup === 'function') {
    try { currentCleanup(); } catch (e) { console.error('[router] cleanup error', e); }
    currentCleanup = null;
  }

  if (mainContent) {
    if (handler) {
      const result = handler(mainContent);
      if (typeof result === 'function') {
        currentCleanup = result;
      }
    } else {
      mainContent.innerHTML = `
        <div class="empty-state">
          <h3 class="empty-state__title">Page not found</h3>
          <p class="empty-state__text">The page you're looking for doesn't exist.</p>
        </div>`;
    }
  }

  document.querySelectorAll('.navbar__tab').forEach(tab => {
    const href = tab.getAttribute('data-route');
    if (href === hash) {
      tab.classList.add('navbar__tab--active');
    } else {
      tab.classList.remove('navbar__tab--active');
    }
  });

  document.querySelectorAll('.sidebar-nav__item[data-route]').forEach(item => {
    const href = item.getAttribute('data-route');
    if (href === hash) {
      item.classList.add('sidebar-nav__item--active');
    } else {
      item.classList.remove('sidebar-nav__item--active');
    }
  });
}

export function initRouter() {
  window.addEventListener('hashchange', resolveRoute);
  resolveRoute();
}
