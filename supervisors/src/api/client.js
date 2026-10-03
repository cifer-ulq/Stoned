/* ===========================
   API Client — Supervisor Portal
   With Smart Caching, Background SWR, and Auto-Invalidation
   =========================== */

import { mockData } from './mock-data.js';
import { setLoading, setError, clearError } from '../store.js';
import { apiCache, fastHash } from './cache.js';

export { apiCache, fastHash };

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
  localStorage.removeItem('hireme_user');
}

/**
 * Automatically invalidate cached endpoints based on the mutated path.
 */
function handleMutationInvalidation(path) {
  const p = path.toLowerCase();

  if (p.includes('/recommend') || p.includes('/reject') || p.includes('/final-accept') || p.includes('/interests') || p.includes('/requirements')) {
    apiCache.invalidate([
      '/supervisor/interests*',
      '/supervisor/posting*',
      '/ojt/postings*',
      '/supervisor/dashboard*',
      '/supervisor/trainees*',
      '/supervisor/monitoring*',
      '/supervisor/analytics*'
    ]);
  } else if (p.includes('/evaluat') || p.includes('/students') || p.includes('/import')) {
    apiCache.invalidate([
      '/supervisor/evaluations*',
      '/supervisor/trainees*',
      '/supervisor/dashboard*',
      '/supervisor/analytics*'
    ]);
  } else {
    apiCache.invalidate([
      '/supervisor/dashboard*',
      '/supervisor/analytics*'
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

      if (!res.ok) {
        return null;
      }

      const data = await res.json();

      // On successful GET, update cache
      if (method === 'GET' && data) {
        apiCache.set(endpoint, data);
      }

      // On successful mutation (POST/PUT/PATCH/DELETE), trigger invalidation
      if (method !== 'GET') {
        handleMutationInvalidation(endpoint);
      }

      return data;
    } catch (err) {
      if (method === 'GET') {
        const cached = apiCache.get(endpoint);
        if (cached) return cached.data;
      }
      return null;
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
  const { forceRefresh = false, bypassCache = false } = options;

  if (!bypassCache && !forceRefresh && apiCache.isFresh(path)) {
    const cached = apiCache.get(path);
    if (cached) {
      return cached.data;
    }
  }

  return apiRequest('GET', path, null, options);
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

const SIMULATED_DELAY = 600;

export async function apiFetch(endpoint, options = {}) {
  const { method = 'GET', body = null, showLoading = true } = options;

  if (showLoading) setLoading(true);
  clearError();

  try {
    // Try real API first if endpoint starts with '/'
    if (endpoint.startsWith('/')) {
      const data = await apiGet(endpoint);
      if (data) return data;
    }

    await new Promise(r => setTimeout(r, SIMULATED_DELAY));

    const dataKey = endpoint.replace(/^\//, '').replace(/\//g, '_');
    const data = mockData[dataKey] ?? mockData[endpoint] ?? null;

    if (data === null) {
      throw new Error(`Endpoint not found: ${endpoint}`);
    }

    return structuredClone(data);
  } catch (err) {
    setError(err.message);
    throw err;
  } finally {
    if (showLoading) setLoading(false);
  }
}

export function storageUrl(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `http://localhost:8000/storage/${path.replace(/^\//, '')}`;
}
