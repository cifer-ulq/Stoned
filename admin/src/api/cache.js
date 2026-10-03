/* ── Client-Side Cache & SWR Layer — Admin Portal ── */

const STORAGE_PREFIX = 'hireme_admin_cache_';
const memoryCache = new Map();

/**
 * Generate a deterministic string representation for change comparison.
 */
export function hashData(data) {
  if (data == null) return '';
  try {
    return JSON.stringify(data);
  } catch {
    return String(data);
  }
}

/**
 * Compare two data payloads to check if they have differences.
 */
export function isDataEqual(a, b) {
  return hashData(a) === hashData(b);
}

/**
 * Retrieve cached entry for a given key.
 * Checks memory cache first, then falls back to sessionStorage.
 */
export function getCached(key) {
  if (!key) return null;

  // 1. Check in-memory map
  let entry = memoryCache.get(key);
  if (entry) return entry;

  // 2. Check sessionStorage
  try {
    const raw = sessionStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (raw) {
      entry = JSON.parse(raw);
      memoryCache.set(key, entry);
      return entry;
    }
  } catch (_) {
    // sessionStorage might be restricted or full
  }

  return null;
}

/**
 * Store data in both memory cache and sessionStorage.
 * Default TTL: 5 minutes (stale-while-revalidate will still revalidate in background).
 */
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
  } catch (_) {
    // Gracefully ignore sessionStorage quota errors
  }

  return entry;
}

/**
 * Check if a valid cache exists for key.
 */
export function hasCached(key) {
  return memoryCache.has(key) || !!getCached(key);
}

/**
 * Invalidate cache entries matching a key prefix, substring, or RegExp.
 * E.g.: invalidateCache('/admin/companies') removes all company list & detail caches.
 */
export function invalidateCache(pattern) {
  if (!pattern) return;

  const matches = (k) => {
    if (pattern instanceof RegExp) return pattern.test(k);
    return k.includes(pattern);
  };

  // Memory cache
  for (const k of Array.from(memoryCache.keys())) {
    if (matches(k)) {
      memoryCache.delete(k);
    }
  }

  // SessionStorage
  try {
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const sKey = sessionStorage.key(i);
      if (sKey && sKey.startsWith(STORAGE_PREFIX)) {
        const rawKey = sKey.slice(STORAGE_PREFIX.length);
        if (matches(rawKey)) {
          sessionStorage.removeItem(sKey);
        }
      }
    }
  } catch (_) {}
}

/**
 * Completely purge all admin cache entries.
 */
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
