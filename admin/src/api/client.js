/* ── API Client — Admin Portal ── */
import { mockData } from './mock-data.js';
import {
  getCached,
  setCache,
  hasCached,
  invalidateCache,
  clearCache,
  hashData,
  isDataEqual,
} from './cache.js';

export {
  getCached,
  setCache,
  hasCached,
  invalidateCache,
  clearCache,
  hashData,
  isDataEqual,
};

const API_BASE = 'http://localhost:8000/api';
const STORAGE_BASE = 'http://localhost:8000';
const DELAY = 600;

export function storageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return STORAGE_BASE + path;
}

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/* ── Real API helpers ── */
export function getToken() {
  return localStorage.getItem('hireme_token');
}

let _redirecting = false;

function redirectToLogin() {
  if (_redirecting) return;
  _redirecting = true;
  clearCache();
  localStorage.removeItem('hireme_token');
  localStorage.removeItem('hireme_user');
  window.location.href = '../login/';
}

function invalidateForMutation(path) {
  if (!path) return;
  const cleanPath = path.split('?')[0];

  if (cleanPath.includes('/admin/companies')) {
    invalidateCache('/admin/companies');
    invalidateCache('/admin/dashboard');
    invalidateCache('/admin/sidebar');
  } else if (cleanPath.includes('/admin/students')) {
    invalidateCache('/admin/students');
    invalidateCache('/admin/dashboard');
    invalidateCache('/admin/alumni-analytics');
    invalidateCache('/admin/ojt');
    invalidateCache('/admin/sidebar');
  } else if (cleanPath.includes('/admin/supervisors')) {
    invalidateCache('/admin/supervisors');
    invalidateCache('/admin/ojt');
    invalidateCache('/admin/dashboard');
  } else if (cleanPath.includes('/admin/ojt')) {
    invalidateCache('/admin/ojt');
    invalidateCache('/admin/dashboard');
    invalidateCache('/admin/sidebar');
  } else if (cleanPath.includes('/admin/jobs')) {
    invalidateCache('/admin/jobs');
    invalidateCache('/admin/dashboard');
  } else {
    invalidateCache('/admin/dashboard');
    invalidateCache('/admin/sidebar');
    invalidateCache(cleanPath);
  }
}

export async function apiRequest(method, path, body = null) {
  if (_redirecting) return null; // ← stop any in-flight calls
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${API_BASE}${path}`, opts);

  if (res.status === 401) {
    redirectToLogin();
    return null;
  }

  // If mutation was successful, invalidate corresponding caches
  if (method !== 'GET' && res.ok) {
    invalidateForMutation(path);
  }

  return res.json();
}

export const apiGet    = (path)       => apiRequest('GET',    path);
export const apiPost   = (path, body) => apiRequest('POST',   path, body);
export const apiPut    = (path, body) => apiRequest('PUT',    path, body);
export const apiPatch  = (path, body) => apiRequest('PATCH',  path, body);
export const apiDelete = (path)       => apiRequest('DELETE', path);

/**
 * Stale-While-Revalidate GET request.
 * - If cached: immediately returns cached data, then revalidates in the background.
 *   If the fresh data has changed, onUpdate(freshData) is invoked.
 * - If not cached or force=true: awaits the network request, caches result, and returns it.
 */
export async function apiGetCached(path, { onUpdate, force = false, ttl } = {}) {
  if (_redirecting) return null;

  const cached = !force ? getCached(path) : null;

  // Background or primary fetch
  const fetchPromise = (async () => {
    try {
      const fresh = await apiRequest('GET', path);
      if (!fresh) return null;

      const freshHash = hashData(fresh);
      const hasChanged = !cached || cached.hash !== freshHash;

      // Update cache
      setCache(path, fresh, ttl);

      // Notify caller if data has changed
      if (hasChanged && typeof onUpdate === 'function') {
        try {
          onUpdate(fresh, true);
        } catch (e) {
          console.error(`[apiGetCached onUpdate error] ${path}`, e);
        }
      }

      return fresh;
    } catch (err) {
      console.error(`[apiGetCached fetch error] ${path}`, err);
      return cached ? cached.data : null;
    }
  })();

  if (cached) {
    return cached.data;
  }

  return await fetchPromise;
}

/* ── Multipart (file upload) ── */
export async function apiPostForm(path, formData) {
  if (_redirecting) return null;
  const token = getToken();
  const headers = { 'Accept': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { method: 'POST', headers, body: formData });
  if (res.status === 401) {
    redirectToLogin();
    return null;
  }

  if (res.ok) {
    invalidateForMutation(path);
  }

  return res.json();
}

/* ── Mock data fetch ── */
export async function apiFetch(endpoint, _opts = {}) {
  await delay(DELAY);
  const key = endpoint.replace(/^\//, '').replace(/\//g, '_');
  if (mockData[key] !== undefined) return clone(mockData[key]);
  console.warn('[api] unknown endpoint:', endpoint);
  return null;
}
