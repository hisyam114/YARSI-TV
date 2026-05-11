/**
 * Cache utility for storing schedule and inventory data
 * Cache is invalidated when spreadsheet is updated via executeApi
 */

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  version: string;
}

const CACHE_PREFIX = 'yarsi_tv_cache_';
const CACHE_VERSION_KEY = 'yarsi_tv_cache_version';
const AUTO_CLEAR_INTERVAL = 5000; // 5 seconds

// Cache keys for different data types
export const CACHE_KEYS = {
  SCHEDULE: `${CACHE_PREFIX}schedule`,
  EQUIPMENT: `${CACHE_PREFIX}equipment`,
  USERS: `${CACHE_PREFIX}users`,
  BLOGS: `${CACHE_PREFIX}blogs`,
} as const;

// Track if auto-clear is active
let autoClearIntervalId: number | null = null;

/**
 * Get the current cache version (timestamp of last spreadsheet update)
 * Initialize with current timestamp if not set
 */
export const getCacheVersion = (): string => {
  let version = localStorage.getItem(CACHE_VERSION_KEY);
  if (!version) {
    version = Date.now().toString();
    localStorage.setItem(CACHE_VERSION_KEY, version);
  }
  return version;
};

/**
 * Set a new cache version (called when spreadsheet is updated)
 */
export const setCacheVersion = (version: string): void => {
  localStorage.setItem(CACHE_VERSION_KEY, version);
};

/**
 * Generate a new cache version based on current timestamp
 */
export const generateNewCacheVersion = (): string => {
  const newVersion = Date.now().toString();
  setCacheVersion(newVersion);
  return newVersion;
};

/**
 * Get cached data if it exists and matches current version
 */
export const getCachedData = <T>(key: string): T | null => {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const entry: CacheEntry<T> = JSON.parse(cached);
    const currentVersion = getCacheVersion();

    // Check if cache is still valid (version matches)
    if (entry.version === currentVersion) {
      return entry.data;
    }

    // Cache is stale, remove it
    localStorage.removeItem(key);
    return null;
  } catch (error) {
    console.error(`Error reading cache for ${key}:`, error);
    return null;
  }
};

/**
 * Store data in cache with current version
 */
export const setCachedData = <T>(key: string, data: T): void => {
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      version: getCacheVersion(),
    };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch (error) {
    console.error(`Error setting cache for ${key}:`, error);
  }
};

/**
 * Clear all cached data
 */
export const clearAllCache = (): void => {
  Object.values(CACHE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
  console.log('[Cache] All cache cleared');
};

/**
 * Clear specific cache entry
 */
export const clearCache = (key: string): void => {
  localStorage.removeItem(key);
};

/**
 * Invalidate cache by updating the version
 * This makes all existing cache entries stale
 */
export const invalidateCache = (): string => {
  const newVersion = generateNewCacheVersion();
  console.log('[Cache] Invalidated cache with new version:', newVersion);
  return newVersion;
};

/**
 * Start auto-clear cache every 5 seconds
 * This ensures fresh data is fetched regularly
 */
export const startAutoClearCache = (): void => {
  if (autoClearIntervalId !== null) return;
  
  console.log('[Cache] Starting auto-clear interval (5 seconds)');
  autoClearIntervalId = window.setInterval(() => {
    clearAllCache();
  }, AUTO_CLEAR_INTERVAL);
};

/**
 * Stop auto-clear cache interval
 */
export const stopAutoClearCache = (): void => {
  if (autoClearIntervalId !== null) {
    console.log('[Cache] Stopping auto-clear interval');
    window.clearInterval(autoClearIntervalId);
    autoClearIntervalId = null;
  }
};

/**
 * Clear cache on page unload/refresh
 * This ensures fresh data is fetched when user returns
 */
export const setupCacheRefreshOnReload = (): void => {
  // Clear cache when page is about to unload
  window.addEventListener('beforeunload', () => {
    clearAllCache();
    console.log('[Cache] Cache cleared on page unload');
  });

  // Also clear on visibility change (when user switches tabs and comes back)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      console.log('[Cache] Page became visible, clearing cache for fresh data');
      clearAllCache();
    }
  });
};
