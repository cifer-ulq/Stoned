/* ── API Client — CIER Portal ── */
import {
  getCached,
  setCache,
  hasCached,
  isFresh,
  invalidateCache,
  clearCache,
  hashData,
  isDataEqual,
} from './cache.js';

export {
  getCached,
  setCache,
  hasCached,
  isFresh,
  invalidateCache,
  clearCache,
  hashData,
  isDataEqual,
};

const API_BASE = 'http://localhost:8000/api';

export function storageUrl(path) {
  if (!path || typeof path !== 'string') return null;
  if (path.startsWith('data:') || path.startsWith('blob:')) return path;
  const clean = path.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i, '')
                    .replace(/^https?:\/\/stoned\.onrender\.com/i, '');
  if (clean.startsWith('http://') || clean.startsWith('https://')) return clean;
  const relative = clean.replace(/^\//, '');
  return relative.startsWith('storage/') ? `/${relative}` : `/storage/${relative}`;
}

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
  if (cleanPath.includes('/cier/companies')) {
    invalidateCache('/cier/companies');
    invalidateCache('/cier/sidebar');
  } else {
    invalidateCache('/cier/sidebar');
    invalidateCache(cleanPath);
  }
}

export async function apiRequest(method, path, body = null) {
  if (_redirecting) return null;
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const opts = { method, headers, credentials: 'include' };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${API_BASE}${path}`, opts);

  if (res.status === 401) {
    redirectToLogin();
    return null;
  }

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

export async function apiGetCached(path, { onUpdate, force = false, ttl } = {}) {
  if (_redirecting) return null;
  const cached = !force ? getCached(path) : null;

  const fetchPromise = (async () => {
    try {
      const fresh = await apiRequest('GET', path);
      if (!fresh) return null;
      const freshHash = hashData(fresh);
      const hasChanged = !cached || cached.hash !== freshHash;
      setCache(path, fresh, ttl);
      if (hasChanged && typeof onUpdate === 'function') {
        try { onUpdate(fresh, true); } catch (e) { console.error(`[apiGetCached onUpdate error] ${path}`, e); }
      }
      return fresh;
    } catch (err) {
      console.error(`[apiGetCached fetch error] ${path}`, err);
      return cached ? cached.data : null;
    }
  })();

  if (cached) return cached.data;
  return await fetchPromise;
}

export async function revalidateEndpoint(path) {
  if (_redirecting) return { changed: false, data: null };
  const oldCached = getCached(path);
  try {
    const freshData = await apiRequest('GET', path);
    if (!freshData) return { changed: false, data: null };
    const freshHash = hashData(freshData);
    const changed = !oldCached || oldCached.hash !== freshHash;
    setCache(path, freshData);
    return { changed, data: freshData, oldData: oldCached?.data ?? null };
  } catch {
    return { changed: false, data: oldCached?.data ?? null };
  }
}

export async function apiPostForm(path, formData) {
  if (_redirecting) return null;
  const token = getToken();
  const headers = { 'Accept': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { method: 'POST', headers, body: formData, credentials: 'include' });
  if (res.status === 401) {
    redirectToLogin();
    return null;
  }
  if (res.ok) invalidateForMutation(path);

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    if (!res.ok) throw new Error(`Server returned HTTP ${res.status}: ${res.statusText || 'Request failed'}`);
    throw new Error('Server returned an invalid response format.');
  }

  if (!res.ok) {
    const err = new Error(data?.message || data?.error || `Server error (${res.status})`);
    err.response = data;
    throw err;
  }

  return data;
}

export const apiUpload = apiPostForm;
