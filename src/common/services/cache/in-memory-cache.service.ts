import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { CacheService, CacheEntry, RateLimitService, RateLimitEntry } from './cache.interface';

@Injectable()
export class InMemoryCacheService implements CacheService, RateLimitService, OnModuleDestroy {
  private cache = new Map<string, CacheEntry>();
  private rateLimits = new Map<string, RateLimitEntry>();
  private cleanupInterval: NodeJS.Timeout;
  private stats = {
    hits: 0,
    misses: 0,
  };

  constructor() {
    // Initialize cleanup interval (runs every 5 minutes)
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  onModuleDestroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }

  // === Cache Service Implementation ===

  async set<T>(key: string, value: T, ttlMs?: number): Promise<void> {
    const expiry = ttlMs ? Date.now() + ttlMs : Infinity;
    this.cache.set(key, { value, expiry });
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }
    
    if (entry.expiry < Date.now()) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }
    
    this.stats.hits++;
    return entry.value as T;
  }

  async has(key: string): Promise<boolean> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }
    
    if (entry.expiry < Date.now()) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
    this.rateLimits.clear();
    this.stats.hits = 0;
    this.stats.misses = 0;
  }

  async getMany<T>(keys: string[]): Promise<(T | null)[]> {
    const results: (T | null)[] = [];
    for (const key of keys) {
      results.push(await this.get<T>(key));
    }
    return results;
  }

  async setMany<T>(entries: Array<{ key: string; value: T; ttlMs?: number }>): Promise<void> {
    for (const entry of entries) {
      await this.set(entry.key, entry.value, entry.ttlMs);
    }
  }

  async deleteMany(keys: string[]): Promise<void> {
    for (const key of keys) {
      this.cache.delete(key);
    }
  }

  async getStats(): Promise<{
    size: number;
    hits: number;
    misses: number;
    hitRate: number;
  }> {
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? this.stats.hits / totalRequests : 0;
    
    return {
      size: this.cache.size,
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: Math.round(hitRate * 100) / 100,
    };
  }

  async cleanup(): Promise<void> {
    const now = Date.now();
    let cleanedCount = 0;
    
    // Clean up expired cache entries
    for (const [key, entry] of this.cache.entries()) {
      if (entry.expiry < now) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }
    
    // Clean up expired rate limits (older than 1 hour)
    const rateLimitExpiry = now - (60 * 60 * 1000);
    for (const [key, entry] of this.rateLimits.entries()) {
      if (entry.windowStart < rateLimitExpiry) {
        this.rateLimits.delete(key);
        cleanedCount++;
      }
    }
    
    // Log cleanup activity if significant
    if (cleanedCount > 10) {
      console.log(`InMemoryCache cleanup: Removed ${cleanedCount} expired entries`);
    }
    
    // Log cache sizes for monitoring (only if significant)
    if (this.cache.size > 100 || this.rateLimits.size > 1000) {
      console.log(`InMemoryCache stats - Cache: ${this.cache.size}, Rate limits: ${this.rateLimits.size}`);
    }
  }

  // === Rate Limit Service Implementation ===

  async checkLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
    const entry = this.rateLimits.get(key);
    const now = Date.now();
    
    if (!entry) {
      console.log(`[IN-MEMORY RATE LIMIT] Checking limit for key: ${key}, attempts: 0/${limit}, within limit: true, window: ${windowMs}ms (no entry)`);
      return true; // No attempts yet, allow
    }
    
    // Check if window has expired
    if (now > entry.windowStart + windowMs) {
      this.rateLimits.delete(key);
      console.log(`[IN-MEMORY RATE LIMIT] Checking limit for key: ${key}, attempts: 0/${limit}, within limit: true, window: ${windowMs}ms (window expired)`);
      return true; // Window expired, allow
    }
    
    const isWithinLimit = entry.attempts < limit;
    console.log(`[IN-MEMORY RATE LIMIT] Checking limit for key: ${key}, attempts: ${entry.attempts}/${limit}, within limit: ${isWithinLimit}, window: ${windowMs}ms`);
    
    return isWithinLimit;
  }

  async increment(key: string, windowMs: number): Promise<number> {
    const now = Date.now();
    const entry = this.rateLimits.get(key);
    
    if (!entry || now > entry.windowStart + windowMs) {
      // Create new window
      const newEntry = { attempts: 1, windowStart: now };
      this.rateLimits.set(key, newEntry);
      console.log(`[IN-MEMORY RATE LIMIT] Incremented key: ${key}, new count: 1, window: ${windowMs}ms (new window)`);
      return 1;
    } else {
      // Increment existing window
      entry.attempts++;
      this.rateLimits.set(key, entry);
      console.log(`[IN-MEMORY RATE LIMIT] Incremented key: ${key}, new count: ${entry.attempts}, window: ${windowMs}ms`);
      return entry.attempts;
    }
  }

  async reset(key: string): Promise<void> {
    this.rateLimits.delete(key);
  }

  async getAttempts(key: string): Promise<number> {
    const entry = this.rateLimits.get(key);
    
    if (!entry) {
      return 0;
    }
    
    // Check if window has expired
    const now = Date.now();
    if (now > entry.windowStart + (60 * 60 * 1000)) { // 1 hour default
      this.rateLimits.delete(key);
      return 0;
    }
    
    return entry.attempts;
  }
} 