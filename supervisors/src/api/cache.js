/**
 * CHMSU HireMe Supervisor — Smart API Cache & Invalidation Manager
 * Supports:
 * - In-memory and sessionStorage persistence (per-session)
 * - Deterministic fast payload hashing for exact change detection
 * - Mutation-driven tag and endpoint invalidation
 * - In-flight promise de-duplication
 * - Background revalidation cooldowns (TTL)
 */

const MEMORY_CACHE = new Map();
const IN_FLIGHT_REQUESTS = new Map();
const STALE_ENDPOINTS = new Set();
const STORAGE_PREFIX = 'hireme_cache_supervisor_';
const DEFAULT_COOLDOWN_MS = 15000; // 15 seconds cooldown between identical background revalidations

/**
 * Fast deterministic string hash for JSON responses.
 */
export function fastHash(obj) {
  if (obj === null || obj === undefined) return 'null';
  try {
    const str = typeof obj === 'string' ? obj : JSON.stringify(obj);
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) + hash) + str.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    return String(hash);
  } catch {
    return String(obj);
  }
}

/**
 * Get active supervisor user identifier for sessionStorage namespacing.
 */
function getStorageKey(endpoint) {
  let userId = 'anon';
  try {
    const u = JSON.parse(localStorage.getItem('hireme_user') || '{}');
    if (u?.id) userId = String(u.id);
  } catch { /* ignore */ }
  return `${STORAGE_PREFIX}${userId}:${endpoint}`;
}

export const apiCache = {
  /**
   * Get cached data for an endpoint.
   * Checks in-memory cache first, then sessionStorage.
   */
  get(endpoint) {
    if (MEMORY_CACHE.has(endpoint)) {
      return MEMORY_CACHE.get(endpoint);
    }

    try {
      const stored = sessionStorage.getItem(getStorageKey(endpoint));
      if (stored) {
        const entry = JSON.parse(stored);
        MEMORY_CACHE.set(endpoint, entry);
        return entry;
      }
    } catch { /* ignore sessionStorage error */ }

    return null;
  },

  /**
   * Set cached data for an endpoint.
   */
  set(endpoint, data) {
    const hash = fastHash(data);
    const entry = {
      data,
      hash,
      timestamp: Date.now(),
    };

    MEMORY_CACHE.set(endpoint, entry);
    STALE_ENDPOINTS.delete(endpoint);

    try {
      sessionStorage.setItem(getStorageKey(endpoint), JSON.stringify(entry));
    } catch { /* ignore storage quota errors */ }

    return entry;
  },

  /**
   * Check if an endpoint is cached.
   */
  has(endpoint) {
    return MEMORY_CACHE.has(endpoint) || !!sessionStorage.getItem(getStorageKey(endpoint));
  },

  /**
   * Compare new data against cached hash to see if the server content actually changed.
   */
  hasChanged(endpoint, freshData) {
    const cached = this.get(endpoint);
    if (!cached) return true;
    const freshHash = fastHash(freshData);
    return cached.hash !== freshHash;
  },

  /**
   * Check if endpoint was recently revalidated (within cooldown period) and not marked stale.
   */
  isFresh(endpoint, cooldownMs = DEFAULT_COOLDOWN_MS) {
    if (STALE_ENDPOINTS.has(endpoint)) return false;
    const cached = this.get(endpoint);
    if (!cached) return false;
    return (Date.now() - cached.timestamp) < cooldownMs;
  },

  /**
   * Mark endpoints as stale so next visit or check will definitely revalidate.
   */
  markStale(patterns) {
    const list = Array.isArray(patterns) ? patterns : [patterns];
    list.forEach(pattern => {
      const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
      for (const key of MEMORY_CACHE.keys()) {
        if (regex.test(key)) STALE_ENDPOINTS.add(key);
      }
    });
  },

  /**
   * Invalidate cached endpoints matching pattern (e.g. '/supervisor/*', '/ojt/*').
   */
  invalidate(patterns) {
    const list = Array.isArray(patterns) ? patterns : [patterns];
    list.forEach(pattern => {
      const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');

      // Clear from in-memory
      for (const key of Array.from(MEMORY_CACHE.keys())) {
        if (regex.test(key)) {
          MEMORY_CACHE.delete(key);
          STALE_ENDPOINTS.add(key);
        }
      }

      // Clear from sessionStorage
      try {
        for (let i = sessionStorage.length - 1; i >= 0; i--) {
          const sKey = sessionStorage.key(i);
          if (sKey && sKey.startsWith(STORAGE_PREFIX)) {
            const rawEndpoint = sKey.split(':').slice(1).join(':');
            if (regex.test(rawEndpoint)) {
              sessionStorage.removeItem(sKey);
            }
          }
        }
      } catch { /* ignore */ }
    });

    // Dispatch global invalidation event
    try {
      window.dispatchEvent(new CustomEvent('hireme:cache-invalidated', {
        detail: { patterns: list, timestamp: Date.now() }
      }));
    } catch { /* ignore */ }
  },

  /**
   * Deduplicate in-flight promises so multiple components requesting same endpoint share one network call.
   */
  getInFlight(endpoint) {
    return IN_FLIGHT_REQUESTS.get(endpoint) || null;
  },

  setInFlight(endpoint, promise) {
    IN_FLIGHT_REQUESTS.set(endpoint, promise);
    promise.finally(() => {
      IN_FLIGHT_REQUESTS.delete(endpoint);
    });
    return promise;
  },

  /**
   * Full cache clear (called on logout / session reset).
   */
  clear() {
    MEMORY_CACHE.clear();
    IN_FLIGHT_REQUESTS.clear();
    STALE_ENDPOINTS.clear();
    try {
      for (let i = sessionStorage.length - 1; i >= 0; i--) {
        const sKey = sessionStorage.key(i);
        if (sKey && sKey.startsWith(STORAGE_PREFIX)) {
          sessionStorage.removeItem(sKey);
        }
      }
    } catch { /* ignore */ }
  }
};
