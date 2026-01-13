import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CacheService, RateLimitService } from './cache.interface';

// Conditional import for ioredis to handle cases where it's not installed
let Redis: any;
try {
  Redis = require('ioredis');
} catch (error) {
  console.warn('ioredis package not found. Install it with: npm install ioredis');
  Redis = null;
}

@Injectable()
export class RedisCacheService implements CacheService, RateLimitService, OnModuleInit, OnModuleDestroy {
  private client: any; // Redis.Redis when available
  private isConnecting = false;
  private stats = {
    hits: 0,
    misses: 0,
  };

  constructor(private configService: ConfigService) {
    if (!Redis) {
      throw new Error(
        'ioredis package is required for Redis cache service. ' +
        'Install it with: npm install ioredis @types/ioredis'
      );
    }
  }

  async onModuleInit() {
    if (!this.isConnecting && !this.client) {
      await this.connect();
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit();
    }
  }

  private async connect(): Promise<void> {
    if (this.isConnecting || this.client) {
      return;
    }
    
    this.isConnecting = true;
    
    try {
      const redisUrl = this.configService.get<string>('REDIS_URL');
      const redisHost = this.configService.get<string>('REDIS_HOST', 'localhost');
      const redisPort = this.configService.get<number>('REDIS_PORT', 6379);
      const redisPassword = this.configService.get<string>('REDIS_PASSWORD');
      const redisDb = this.configService.get<number>('REDIS_DB', 0);

      // Optimized for multi-instance ECS deployment
      const redisOptions = {
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
        enableReadyCheck: true,
        // Prevent connection hanging in ECS
        connectTimeout: 10000,
        // Instance identification for debugging
        connectionName: `progrc-bff-${process.env.HOSTNAME || 'unknown'}-${Date.now()}`,
      };

      if (redisUrl) {
        this.client = new Redis(redisUrl, redisOptions);
      } else {
        this.client = new Redis({
          host: redisHost,
          port: redisPort,
          password: redisPassword,
          db: redisDb,
          ...redisOptions,
        });
      }

      this.client.on('error', (error) => {
        console.error('Redis connection error:', error);
        this.isConnecting = false;
      });

      this.client.on('connect', () => {
        console.log('Redis connected successfully');
      });

      this.client.on('ready', () => {
        console.log('Redis client ready');
        this.isConnecting = false;
      });

      this.client.on('close', () => {
        console.log('Redis connection closed');
        this.isConnecting = false;
      });

      // Only connect if the client is in wait status
      if (this.client.status === 'wait') {
        await this.client.connect();
      }
    } catch (error) {
      this.isConnecting = false;
      console.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  // === Cache Service Implementation ===

  async set<T>(key: string, value: T, ttlMs?: number): Promise<void> {
    const serializedValue = JSON.stringify(value);
    
    if (ttlMs) {
      const ttlSeconds = Math.ceil(ttlMs / 1000);
      await this.client.setex(key, ttlSeconds, serializedValue);
    } else {
      await this.client.set(key, serializedValue);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      
      if (value === null) {
        this.stats.misses++;
        return null;
      }
      
      this.stats.hits++;
      return JSON.parse(value) as T;
    } catch (error) {
      console.error('Redis get error:', error);
      this.stats.misses++;
      return null;
    }
  }

  async has(key: string): Promise<boolean> {
    const exists = await this.client.exists(key);
    return exists === 1;
  }

  async delete(key: string): Promise<void> {
    await this.client.del(key);
  }

  async clear(): Promise<void> {
    // Be careful with this in production - it clears the entire database
    await this.client.flushdb();
    this.stats.hits = 0;
    this.stats.misses = 0;
  }

  async getMany<T>(keys: string[]): Promise<(T | null)[]> {
    if (keys.length === 0) {
      return [];
    }

    const values = await this.client.mget(...keys);
    const results: (T | null)[] = [];

    for (const value of values) {
      if (value === null) {
        this.stats.misses++;
        results.push(null);
      } else {
        try {
          this.stats.hits++;
          results.push(JSON.parse(value) as T);
        } catch (error) {
          console.error('Redis getMany parse error:', error);
          this.stats.misses++;
          results.push(null);
        }
      }
    }

    return results;
  }

  async setMany<T>(entries: Array<{ key: string; value: T; ttlMs?: number }>): Promise<void> {
    if (entries.length === 0) {
      return;
    }

    const pipeline = this.client.pipeline();
    
    for (const entry of entries) {
      const serializedValue = JSON.stringify(entry.value);
      
      if (entry.ttlMs) {
        const ttlSeconds = Math.ceil(entry.ttlMs / 1000);
        pipeline.setex(entry.key, ttlSeconds, serializedValue);
      } else {
        pipeline.set(entry.key, serializedValue);
      }
    }

    await pipeline.exec();
  }

  async deleteMany(keys: string[]): Promise<void> {
    if (keys.length === 0) {
      return;
    }

    await this.client.del(...keys);
  }

  async getStats(): Promise<{
    size: number;
    hits: number;
    misses: number;
    hitRate: number;
  }> {
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? this.stats.hits / totalRequests : 0;
    
    // Get database size from Redis
    const dbSize = await this.client.dbsize();
    
    return {
      size: dbSize,
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: Math.round(hitRate * 100) / 100,
    };
  }

  async cleanup(): Promise<void> {
    // Redis handles expiration automatically, so this is mostly a no-op
    // We could potentially run SCAN to find keys that need cleanup if needed
    console.log('Redis cleanup: Redis handles expiration automatically');
  }

  // === Rate Limit Service Implementation ===

  async checkLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
    const rateLimitKey = `rate_limit:${key}`;
    const attempts = await this.getAttempts(key);
    const isWithinLimit = attempts < limit;
    
    console.log(`[REDIS RATE LIMIT] Checking limit for key: ${key}, attempts: ${attempts}/${limit}, within limit: ${isWithinLimit}, window: ${windowMs}ms`);
    
    return isWithinLimit;
  }

  async increment(key: string, windowMs: number): Promise<number> {
    const rateLimitKey = `rate_limit:${key}`;
    const ttlSeconds = Math.ceil(windowMs / 1000);
    
    // Use Redis INCR with EXPIRE for atomic operation
    const pipeline = this.client.pipeline();
    pipeline.incr(rateLimitKey);
    pipeline.expire(rateLimitKey, ttlSeconds);
    
    const results = await pipeline.exec();
    
    // Return the incremented value
    const newCount = results[0][1] as number;
    console.log(`[REDIS RATE LIMIT] Incremented key: ${key}, new count: ${newCount}, window: ${windowMs}ms`);
    
    return newCount;
  }

  async reset(key: string): Promise<void> {
    const rateLimitKey = `rate_limit:${key}`;
    await this.client.del(rateLimitKey);
  }

  async getAttempts(key: string): Promise<number> {
    const rateLimitKey = `rate_limit:${key}`;
    const attempts = await this.client.get(rateLimitKey);
    return attempts ? parseInt(attempts, 10) : 0;
  }

  // === Additional Redis-specific methods ===

  /**
   * Execute Redis commands directly (for advanced use cases)
   */
  async executeCommand(command: string, ...args: any[]): Promise<any> {
    return this.client.sendCommand(new Redis.Command(command, args));
  }

  /**
   * Get Redis client instance (for advanced operations)
   */
  getClient(): any {
    return this.client;
  }

  /**
   * Check Redis connection status
   */
  isConnected(): boolean {
    return this.client && this.client.status === 'ready';
  }

  /**
   * Set with additional Redis options
   */
  async setWithOptions<T>(
    key: string, 
    value: T, 
    options: {
      ttlMs?: number;
      nx?: boolean; // Set only if key doesn't exist
      xx?: boolean; // Set only if key exists
    } = {}
  ): Promise<boolean> {
    const serializedValue = JSON.stringify(value);
    const args: any[] = [key, serializedValue];
    
    if (options.ttlMs) {
      args.push('PX', options.ttlMs);
    }
    
    if (options.nx) {
      args.push('NX');
    } else if (options.xx) {
      args.push('XX');
    }
    
    const result = await this.client.set(...args);
    return result === 'OK';
  }
} 