/* ── Client-Side Cache & SWR Layer — CIER Portal ── */

const STORAGE_PREFIX = 'hireme_cier_cache_';
const memoryCache = new Map();

export function hashData(data) {
  if (data == null) return '';
  try { return JSON.stringify(data); } catch { return String(data); }
}

export function isDataEqual(a, b) {
  return hashData(a) === hashData(b);
}

export function getCached(key) {
  if (!key) return null;
  let entry = memoryCache.get(key);
  if (entry) return entry;
  try {
    const raw = sessionStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (raw) {
      entry = JSON.parse(raw);
      memoryCache.set(key, entry);
      return entry;
    }
  } catch (_) {}
  return null;
}

export function setCache(key, data, ttlMs = 5 * 60 * 1000) {
  if (!key || data == null) return null;
  const entry = {
    data,
    hash: hashData(data),
    timestamp: Date.now(),
    expiresAt: Date.now() + ttlMs,
  };
  memoryCache.set(key, entry);
  try {
    sessionStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(entry));
  } catch (_) {}
  return entry;
}

export function hasCached(key) {
  return memoryCache.has(key) || !!getCached(key);
}

export function isFresh(key, cooldownMs = 15000) {
  const cached = getCached(key);
  if (!cached) return false;
  return (Date.now() - (cached.timestamp || 0)) < cooldownMs;
}

export function invalidateCache(pattern) {
  if (!pattern) return;
  const patterns = Array.isArray(pattern) ? pattern : [pattern];
  const matches = (k) => patterns.some(p => {
    if (p instanceof RegExp) return p.test(k);
    const str = String(p).replace(/\*/g, '.*');
    return new RegExp('^' + str + '$').test(k) || k.includes(p);
  });

  for (const k of Array.from(memoryCache.keys())) {
    if (matches(k)) memoryCache.delete(k);
  }
  try {
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const sKey = sessionStorage.key(i);
      if (sKey && sKey.startsWith(STORAGE_PREFIX)) {
        const rawKey = sKey.slice(STORAGE_PREFIX.length);
        if (matches(rawKey)) sessionStorage.removeItem(sKey);
      }
    }
  } catch (_) {}

  try {
    window.dispatchEvent(new CustomEvent('hireme:cache-invalidated', {
      detail: { patterns, timestamp: Date.now() },
    }));
  } catch (_) {}
}

export function clearCache() {
  memoryCache.clear();
  try {
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const sKey = sessionStorage.key(i);
      if (sKey && sKey.startsWith(STORAGE_PREFIX)) {
        sessionStorage.removeItem(sKey);
      }
    }
  } catch (_) {}
}
