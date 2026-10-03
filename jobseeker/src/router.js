/**
 * CHMSU HireMe — Lightweight SPA Router (Hash-based)
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
  const hash = window.location.hash.slice(1) || '/';
  
  // First try exact match
  let handler = routes[hash];
  let params = {};

  // Then try parameterized routes (e.g. /company/:id)
  if (!handler) {
    for (const pattern of Object.keys(routes)) {
      if (!pattern.includes(':')) continue;
      const patternParts = pattern.split('/');
      const hashParts = hash.split('/');
      if (patternParts.length !== hashParts.length) continue;
      let matched = true;
      const extracted = {};
      for (let i = 0; i < patternParts.length; i++) {
        if (patternParts[i].startsWith(':')) {
          extracted[patternParts[i].slice(1)] = hashParts[i];
        } else if (patternParts[i] !== hashParts[i]) {
          matched = false;
          break;
        }
      }
      if (matched) {
        handler = routes[pattern];
        params = extracted;
        break;
      }
    }
  }

  if (!handler) {
    if (routes['/']) navigate('/');
    return;
  }

  currentRoute = hash;
  handler(params);

  // Map parameterized routes to their parent nav item for sidebar highlighting
  const activeRoute = hash.startsWith('/company/') ? '/companies' : hash;
  document.querySelectorAll('.sidebar-nav__item').forEach(item => {
    item.classList.toggle('sidebar-nav__item--active', item.getAttribute('data-route') === activeRoute);
  });
  document.querySelectorAll('.navbar__tab').forEach(tab => {
    tab.classList.toggle('navbar__tab--active', tab.getAttribute('data-route') === activeRoute);
  });
}

export function initRouter() {
  window.addEventListener('hashchange', resolveRoute);
  resolveRoute();
}
