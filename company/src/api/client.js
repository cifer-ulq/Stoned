/**
 * CHMSU HireMe — API Client — Company Portal
 * With Smart Caching, Background SWR, and Mutation-driven Invalidation.
 */
import { mockData } from './mock-data.js';
import { setLoading, setError, clearError } from '../store.js';
import { apiCache, fastHash } from './cache.js';

export { apiCache, fastHash };

const SIMULATED_DELAY = 600;
const API_BASE = 'http://localhost:8000/api';

/* ── Auth helpers ── */
export function getToken() {
  return localStorage.getItem('hireme_token');
}

export function clearAuth() {
  apiCache.clear();
  try {
    window.dispatchEvent(new CustomEvent('hireme:clear-views'));
  } catch { /* ignore */ }
  localStorage.removeItem('hireme_token');
  localStorage.removeItem('hireme_company_user');
  localStorage.removeItem('hireme_user');
}

/**
 * Automatically invalidate cached endpoints based on the mutated path.
 */
function handleMutationInvalidation(path) {
  const p = path.toLowerCase();

  // Chat messages and conversations should NEVER invalidate company views or cause re-renders
  if (p.startsWith('/chat')) {
    return;
  }

  if (p.includes('/jobs')) {
    apiCache.invalidate([
      '/company/jobs*',
      '/company/dashboard*',
      '/company/analytics*',
      '/company/profile*'
    ]);
  } else if (p.includes('/ojt-postings') || p.includes('/ojt-trainees') || p.includes('/endorsement') || p.includes('/set-ojt-start') || p.includes('/evaluat')) {
    apiCache.invalidate([
      '/company/ojt-postings*',
      '/company/ojt-trainees*',
      '/company/applications*',
      '/company/dashboard*',
      '/company/analytics*',
      '/company/profile*'
    ]);
  } else if (p.includes('/application') || p.includes('/interview')) {
    apiCache.invalidate([
      '/company/applications*',
      '/company/interviews*',
      '/company/dashboard*',
      '/company/analytics*'
    ]);
  } else if (p.includes('/profile') || p.includes('/request-moa')) {
    apiCache.invalidate([
      '/company/profile*',
      '/auth/me*',
      '/company/dashboard*',
      '/company/jobs*',
      '/company/ojt-postings*'
    ]);
  } else {
    apiCache.invalidate([
      '/company/dashboard*',
      '/company/analytics*'
    ]);
  }
}

/**
 * Real API call to backend.
 * Automatically attaches Bearer token.
 * On 401, clears auth and redirects to login.
 */
export async function apiRequest(method, path, body = null, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);

  const endpoint = path;

  // De-duplicate in-flight GET requests
  if (method === 'GET' && !options.skipDedup) {
    const existingPromise = apiCache.getInFlight(endpoint);
    if (existingPromise) return existingPromise;
  }

  const fetchPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE}${path}`, opts);

      if (res.status === 401) {
        clearAuth();
        window.location.href = '../login/';
        return null;
      }

      const data = await res.json();

      // On successful GET, update cache (exempt chat endpoints from caching)
      if (method === 'GET' && res.ok && data) {
        if (!endpoint.startsWith('/chat')) {
          apiCache.set(endpoint, data);
        }
      }

      // On successful mutation (POST/PUT/PATCH/DELETE), trigger invalidation
      if (method !== 'GET' && res.ok) {
        handleMutationInvalidation(endpoint);
      }

      return data;
    } catch (err) {
      if (method === 'GET') {
        const cached = apiCache.get(endpoint);
        if (cached) return cached.data;
      }
      throw err;
    }
  })();

  if (method === 'GET' && !options.skipDedup) {
    return apiCache.setInFlight(endpoint, fetchPromise);
  }

  return fetchPromise;
}

/**
 * Smart GET with cache support:
 * - If cached data exists and options.forceRefresh is false, returns cached data immediately.
 * - If no cache or forceRefresh is true, fetches from server and caches.
 */
export async function apiGet(path, options = {}) {
  const isChat = path.startsWith('/chat');
  const forceRefresh = isChat || options.forceRefresh;
  const bypassCache = isChat || options.bypassCache;

  if (!bypassCache && !forceRefresh) {
    const cached = apiCache.get(path);
    if (cached) {
      return cached.data;
    }
  }

  return apiRequest('GET', path, null, { ...options, skipDedup: isChat ? true : options.skipDedup });
}

/**
 * Fetch fresh data directly from server (bypassing cache) and update cache.
 */
export async function apiGetFresh(path) {
  return apiRequest('GET', path, null, { skipDedup: true });
}

/**
 * Revalidate an endpoint in background:
 * Checks if server response differs from cached data.
 * Returns { changed: boolean, data: freshData, oldData }
 */
export async function revalidateEndpoint(path) {
  const oldCached = apiCache.get(path);
  try {
    const freshData = await apiGetFresh(path);
    if (!freshData) return { changed: false, data: null };

    const changed = !oldCached || apiCache.hasChanged(path, freshData);
    return {
      changed,
      data: freshData,
      oldData: oldCached?.data ?? null,
    };
  } catch {
    return { changed: false, data: oldCached?.data ?? null };
  }
}

export const apiPost   = (path, body) => apiRequest('POST',   path, body);
export const apiPut    = (path, body) => apiRequest('PUT',    path, body);
export const apiPatch  = (path, body) => apiRequest('PATCH',  path, body);
export const apiDelete = (path)       => apiRequest('DELETE', path);

/**
 * Multipart file upload — sends FormData without Content-Type header
 */
export async function apiUpload(path, formData) {
  const token = getToken();
  const headers = { 'Accept': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { method: 'POST', headers, body: formData });
  if (res.status === 401) { clearAuth(); window.location.href = '../login/'; return null; }

  const data = await res.json();
  if (res.ok) {
    handleMutationInvalidation(path);
  }
  return data;
}

function delay(ms = SIMULATED_DELAY) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function apiFetch(endpoint, options = {}) {
  const key = options.loadingKey || endpoint;

  setLoading(key, true);
  clearError(key);

  try {
    // Try real API first if endpoint starts with '/'
    if (endpoint.startsWith('/')) {
      const data = await apiGet(endpoint);
      setLoading(key, false);
      return { success: true, data };
    }

    await delay(options.delay || SIMULATED_DELAY);

    const data = mockData[endpoint];
    if (!data) {
      throw new Error(`No mock data found for endpoint: ${endpoint}`);
    }

    setLoading(key, false);
    return { success: true, data };
  } catch (err) {
    setLoading(key, false);
    setError(key, err.message);
    return { success: false, error: err.message };
  }
}
