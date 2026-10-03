/**
 * CHMSU HireMe Jobseeker — Lightweight Pub/Sub State Store
 */

const state = {
  user: {
    id:      null,
    name:    '',
    email:   '',
    initials: '',
    role:    'Graduate',
    avatar:  null,
    desiredJobTitle: '',
    workPreference: '',
    yearsOfExperience: '',
    onboardingCompleted: false,
  },
  profileCompleteness: null,   // null = loading, object from API once loaded
  theme: localStorage.getItem('hireme-theme') || 'light',
  currentPage: '/',
  loading: {},
  errors: {},
};

const listeners = new Map();

export function getState(key) {
  if (key) return key.split('.').reduce((obj, k) => obj?.[k], state);
  return { ...state };
}

export function setState(key, value) {
  const keys = key.split('.');
  let obj = state;
  for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
  obj[keys[keys.length - 1]] = value;
  listeners.forEach((callbacks, pattern) => {
    if (key.startsWith(pattern) || pattern === '*') {
      callbacks.forEach(cb => cb(value, key));
    }
  });
}

export function subscribe(pattern, callback) {
  if (!listeners.has(pattern)) listeners.set(pattern, new Set());
  listeners.get(pattern).add(callback);
  return () => {
    const cbs = listeners.get(pattern);
    if (cbs) {
      cbs.delete(callback);
      if (cbs.size === 0) listeners.delete(pattern);
    }
  };
}

export function setLoading(key, val) { setState(`loading.${key}`, val); }
export function setError(key, msg)   { setState(`errors.${key}`, msg); }
export function clearError(key)      { setState(`errors.${key}`, null); }
