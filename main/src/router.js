/**
 * CHMSU HireMe — Lightweight SPA Router (Hash-based)
 */

const routes = {};
let currentRoute = null;
let appContainer = null;

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

  // Ignore non-route hashes (e.g. Leaflet popup close button sets href="#close")
  if (raw && !raw.startsWith('/')) return;

  const hash = raw || '/';

  // Try exact match first
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
    const fallback = routes['/'];
    if (fallback) navigate('/');
    return;
  }

  currentRoute = hash;

  if (appContainer) {
    const content = appContainer.querySelector('.main-content');
    if (content) {
      content.classList.remove('page-enter');
      void content.offsetWidth;
      content.classList.add('page-enter');
    }
  }

  handler(params);

  // Map parameterized routes to their parent nav item for sidebar highlighting
  const activeRoute = hash.startsWith('/company/') ? '/companies' : hash;

  // Update active nav links
  document.querySelectorAll('.navbar__link').forEach(link => {
    const linkPath = link.getAttribute('data-route');
    link.classList.toggle('navbar__link--active', linkPath === activeRoute);
  });
  document.querySelectorAll('.mobile-nav__link').forEach(link => {
    const linkPath = link.getAttribute('data-route');
    link.classList.toggle('mobile-nav__link--active', linkPath === activeRoute);
  });
  document.querySelectorAll('.sidebar-nav__item').forEach(item => {
    item.classList.toggle('sidebar-nav__item--active', item.getAttribute('data-route') === activeRoute);
  });
}

export function initRouter(container) {
  appContainer = container;
  window.addEventListener('hashchange', resolveRoute);
  resolveRoute();
}
