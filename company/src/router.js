/**
 * CHMSU HireMe — Company Portal Router (Hash-based SPA)
 */

const routes = {};
let currentRoute = null;

export function registerRoute(path, handler) {
  routes[path] = handler;
}

export function navigate(path) {
  window.location.hash = path;
}

export function getCurrentRoute() {
  return currentRoute;
}

function resolveRoute() {
  const raw = window.location.hash.slice(1);
  if (raw && !raw.startsWith('/')) return;

  const fullHash = raw || '/';
  const [path] = fullHash.split('?');
  const routePath = path || '/';
  const handler = routes[routePath];

  if (!handler) {
    const fallback = routes['/'];
    if (fallback) {
      navigate('/');
    }
    return;
  }

  currentRoute = routePath;
  const mainContent = document.getElementById('main-content');
  handler(mainContent);

  document.querySelectorAll('.navbar__tab').forEach(tab => {
    const route = tab.getAttribute('data-route');
    tab.classList.toggle('navbar__tab--active', route === routePath);
  });

  document.querySelectorAll('.sidebar-nav__item').forEach(item => {
    const route = item.getAttribute('data-route');
    item.classList.toggle('sidebar-nav__item--active', route === routePath);
  });
}

export function initRouter() {
  window.addEventListener('hashchange', resolveRoute);
  resolveRoute();
}
