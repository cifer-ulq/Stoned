/* ── Pub/Sub Store — CIER Portal ── */

const state = {
  user: {
    name: 'CHMSU CIER Office',
    initials: 'CI',
    role: 'CIER Officer',
    department: 'Center for Internationalization and External Relations',
  },
  ui: {
    theme: localStorage.getItem('cier-theme') || localStorage.getItem('admin-theme') || 'dark',
    sidebarOpen: false,
    loading: false,
    error: null,
  },
  data: {},
};

const listeners = [];

export function getState(path) {
  if (!path) return state;
  return path.split('.').reduce((o, k) => (o != null ? o[k] : undefined), state);
}

export function setState(path, value) {
  const keys = path.split('.');
  let cur = state;
  for (let i = 0; i < keys.length - 1; i++) {
    if (cur[keys[i]] == null) cur[keys[i]] = {};
    cur = cur[keys[i]];
  }
  cur[keys[keys.length - 1]] = value;
  listeners.forEach(({ pattern, cb }) => {
    if (path === pattern || path.startsWith(pattern + '.') || pattern === '*') {
      try { cb(value, path); } catch (e) { console.error('[store]', e); }
    }
  });
}

export function subscribe(pattern, cb) {
  const entry = { pattern, cb };
  listeners.push(entry);
  return () => { const i = listeners.indexOf(entry); if (i !== -1) listeners.splice(i, 1); };
}
