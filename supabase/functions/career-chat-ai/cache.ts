
// Simple in-memory cache for AI responses
// Note: This will reset when the function is redeployed, 
// but provides significant speedup during active usage

interface CacheEntry {
  response: any;
  timestamp: number;
  expiresAt: number;
}

// Cache storage
const responseCache: Record<string, CacheEntry> = {};

// Cache configuration
const CACHE_TTL = 60 * 60 * 1000; // 1 hour cache lifetime
const CACHE_SIZE_LIMIT = 500; // Maximum number of cached items

/**
 * Generates a cache key from request parameters
 */
export function generateCacheKey(category: string, questionNumber: number, context?: string): string {
  if (context) {
    // For contextual responses, include a hash of the context
    const contextHash = hashString(context);
    return `${category}:${questionNumber}:${contextHash}`;
  }
  
  // For standard category questions
  return `${category}:${questionNumber}`;
}

/**
 * Simple string hashing function
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString(16);
}

/**
 * Store response in cache
 */
export function cacheResponse(key: string, response: any): void {
  // Enforce cache size limit - remove oldest entries if needed
  const cacheKeys = Object.keys(responseCache);
  if (cacheKeys.length >= CACHE_SIZE_LIMIT) {
    // Find and remove the oldest entries
    const oldestKeys = cacheKeys
      .map(k => ({ key: k, timestamp: responseCache[k].timestamp }))
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(0, Math.floor(CACHE_SIZE_LIMIT * 0.2)) // Remove oldest 20%
      .map(item => item.key);
    
    oldestKeys.forEach(k => delete responseCache[k]);
  }

  // Store new cache entry
  responseCache[key] = {
    response,
    timestamp: Date.now(),
    expiresAt: Date.now() + CACHE_TTL
  };
}

/**
 * Get response from cache if available and not expired
 */
export function getCachedResponse(key: string): any | null {
  const entry = responseCache[key];
  
  // Return null if no cache entry or entry has expired
  if (!entry || Date.now() > entry.expiresAt) {
    if (entry) {
      // Clean up expired entry
      delete responseCache[key];
    }
    return null;
  }
  
  // Return cached response
  return entry.response;
}

/**
 * Check if a response exists in cache
 */
export function hasCache(key: string): boolean {
  const entry = responseCache[key];
  return entry !== undefined && Date.now() <= entry.expiresAt;
}

/**
 * Clear expired cache entries
 */
export function clearExpiredCache(): void {
  const now = Date.now();
  Object.keys(responseCache).forEach(key => {
    if (now > responseCache[key].expiresAt) {
      delete responseCache[key];
    }
  });
}

// Periodically clean up expired cache entries (every 15 minutes)
setInterval(clearExpiredCache, 15 * 60 * 1000);
