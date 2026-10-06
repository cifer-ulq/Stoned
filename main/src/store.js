/**
 * CHMSU HireMe — Lightweight Pub/Sub State Store
 */

const state = {
  user: {
    id:      null,
    name:    '',
    email:   '',
    initials: '',
    role:    'Student',
    status:  'regular', // 'regular' | 'active_ojt' | 'alumni'
    is_active_ojt: false,
    avatar:  null,
  },
  theme: localStorage.getItem('hireme-theme') || 'light',
  currentPage: '/',
  loading: {},
  errors: {},
};

const listeners = new Map();

export function getState(key) {
  if (key) {
    return key.split('.').reduce((obj, k) => obj?.[k], state);
  }
  return { ...state };
}

export function setState(key, value) {
  const keys = key.split('.');
  let obj = state;
  for (let i = 0; i < keys.length - 1; i++) {
    obj = obj[keys[i]];
  }
  obj[keys[keys.length - 1]] = value;

  // Notify subscribers
  listeners.forEach((callbacks, pattern) => {
    if (key.startsWith(pattern) || pattern === '*') {
      callbacks.forEach(cb => cb(value, key));
    }
  });
}

export function subscribe(pattern, callback) {
  if (!listeners.has(pattern)) {
    listeners.set(pattern, new Set());
  }
  listeners.get(pattern).add(callback);

  return () => {
    const callbacks = listeners.get(pattern);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) listeners.delete(pattern);
    }
  };
}

export function setLoading(key, isLoading) {
  setState(`loading.${key}`, isLoading);
}

export function isLoading(key) {
  return getState(`loading.${key}`) === true;
}

export function setError(key, error) {
  setState(`errors.${key}`, error);
}

export function getError(key) {
  return getState(`errors.${key}`);
}

export function clearError(key) {
  setState(`errors.${key}`, null);
}
