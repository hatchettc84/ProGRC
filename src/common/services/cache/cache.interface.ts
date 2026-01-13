export interface CacheEntry<T = any> {
  value: T;
  expiry: number;
}

/**
 * Cache service interface for basic cache operations
 */
export interface CacheService {
  /**
   * Store a value in cache with optional TTL
   * @param key Cache key
   * @param value Value to store
   * @param ttlMs Time to live in milliseconds (optional)
   */
  set<T>(key: string, value: T, ttlMs?: number): Promise<void>;

  /**
   * Retrieve a value from cache
   * @param key Cache key
   * @returns The cached value or null if not found/expired
   */
  get<T>(key: string): Promise<T | null>;

  /**
   * Delete a specific key from cache
   * @param key Cache key to delete
   */
  delete(key: string): Promise<void>;

  /**
   * Check if a key exists in cache
   * @param key Cache key
   * @returns true if key exists and is not expired
   */
  has(key: string): Promise<boolean>;

  /**
   * Clear all cache entries
   */
  clear(): Promise<void>;

  /**
   * Get multiple values at once
   * @param keys Array of cache keys
   * @returns Array of values (null for missing/expired keys)
   */
  getMany<T>(keys: string[]): Promise<(T | null)[]>;

  /**
   * Set multiple values at once
   * @param entries Array of key-value pairs with optional TTL
   */
  setMany<T>(entries: Array<{ key: string; value: T; ttlMs?: number }>): Promise<void>;

  /**
   * Get cache statistics for monitoring
   */
  getStats(): Promise<{
    size: number;
    hits: number;
    misses: number;
    hitRate: number;
    [key: string]: any;
  }>;
}

export interface RateLimitEntry {
  attempts: number;
  windowStart: number;
}

/**
 * Rate limiting service interface
 */
export interface RateLimitService {
  /**
   * Check if an operation is within rate limits
   * @param key Identifier for the rate limit (e.g., user ID, IP address)
   * @param limit Maximum number of operations allowed
   * @param windowMs Time window in milliseconds
   * @returns true if within limits, false if rate limited
   */
  checkLimit(key: string, limit: number, windowMs: number): Promise<boolean>;

  /**
   * Increment the counter for a rate limit key
   * @param key Identifier for the rate limit
   * @param windowMs Time window in milliseconds
   * @returns Current count after increment
   */
  increment(key: string, windowMs: number): Promise<number>;

  /**
   * Reset the counter for a rate limit key
   * @param key Identifier for the rate limit
   */
  reset(key: string): Promise<void>;

  /**
   * Get current number of attempts for a key
   * @param key Identifier for the rate limit
   * @returns Current count
   */
  getAttempts(key: string): Promise<number>;
}

// Injection tokens for dependency injection
export const CACHE_SERVICE_TOKEN = Symbol('CacheService');
export const RATE_LIMIT_SERVICE_TOKEN = Symbol('RateLimitService'); 