/* ── Hash-Based Router — Admin Portal ── */

const routes = {};
let currentCleanup = null;
let _resolving = false;

export function registerRoute(path, handler) {
  routes[path] = handler;
}

export function navigateTo(path) {
  window.location.hash = '#' + path;
}

function resolve() {
  if (_resolving) return;
  _resolving = true;
  try {
    const raw = window.location.hash.slice(1) || '/';
    const [routePath] = raw.split('?');
    const handler = routes[routePath || '/'];
    const container = document.getElementById('main-content');
    if (!container) return;
    if (currentCleanup && typeof currentCleanup === 'function') {
      try { currentCleanup(); } catch (e) { console.error('[router cleanup]', e); }
      currentCleanup = null;
    }
    if (handler) {
      currentCleanup = handler(container) || null;
    } else {
      container.innerHTML = '<div class="empty-state"><h3 class="empty-state__title">Page not found</h3><p class="empty-state__text">The requested page does not exist.</p></div>';
    }
  } finally {
    _resolving = false;
  }
}

export function initRouter() {
  window.addEventListener('hashchange', resolve);
  resolve();
}
