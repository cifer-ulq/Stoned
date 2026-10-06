/* ── Pub/Sub Store — Admin Portal ── */

const state = {
  user: {
    name: 'Marites Manganti',
    initials: 'MM',
    role: 'CIER Administrator',
    department: 'Center for Institutional Effectiveness & Research',
    employeeId: 'ADM-2024-001',
  },
  ui: {
    theme: localStorage.getItem('admin-theme') || 'dark',
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

export function setLoading(v) { setState('ui.loading', v); }
export function setError(msg) { setState('ui.error', msg); }
export function clearError() { setState('ui.error', null); }
