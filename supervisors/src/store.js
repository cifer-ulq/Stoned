/* ===========================
   Pub/Sub Store — Supervisor Portal
   =========================== */

const state = {
  user: {
    name: 'Prof. Maria Garcia',
    initials: 'MG',
    role: 'OJT Supervisor',
    department: 'BSIT / BSCS',
    employeeId: 'SUP-2024-001',
  },
  ui: {
    theme: localStorage.getItem('sv-theme') || 'dark',
    sidebarOpen: false,
    loading: false,
    error: null,
  },
  data: {},
};

const listeners = [];

function getState(path) {
  if (!path) return state;
  return path.split('.').reduce((o, k) => (o != null ? o[k] : undefined), state);
}

function setState(path, value) {
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

function subscribe(pattern, cb) {
  const entry = { pattern, cb };
  listeners.push(entry);
  return () => {
    const idx = listeners.indexOf(entry);
    if (idx !== -1) listeners.splice(idx, 1);
  };
}

function setLoading(v) { setState('ui.loading', v); }
function setError(msg) { setState('ui.error', msg); }
function clearError() { setState('ui.error', null); }

export { getState, setState, subscribe, setLoading, setError, clearError };
