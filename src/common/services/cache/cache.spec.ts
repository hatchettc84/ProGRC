import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { CacheModule } from './cache.module';
import { CacheService, RateLimitService, CACHE_SERVICE_TOKEN, RATE_LIMIT_SERVICE_TOKEN } from './cache.interface';

describe('Cache Services', () => {
  let module: TestingModule;
  let cacheService: CacheService;
  let rateLimitService: RateLimitService;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        CacheModule.forRoot({
          type: 'memory', // Use memory for testing
        }),
      ],
      providers: [
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('memory'),
          },
        },
      ],
    }).compile();

    cacheService = module.get<CacheService>(CACHE_SERVICE_TOKEN);
    rateLimitService = module.get<RateLimitService>(RATE_LIMIT_SERVICE_TOKEN);
  });

  afterEach(async () => {
    await module.close();
  });

  describe('CacheService', () => {
    it('should be defined', () => {
      expect(cacheService).toBeDefined();
    });

    it('should set and get values', async () => {
      const key = 'test-key';
      const value = { message: 'Hello, World!' };

      await cacheService.set(key, value, 5000); // 5 seconds TTL
      const retrieved = await cacheService.get<typeof value>(key);

      expect(retrieved).toEqual(value);
    });

    it('should return null for non-existent keys', async () => {
      const result = await cacheService.get('non-existent-key');
      expect(result).toBeNull();
    });

    it('should check if key exists', async () => {
      const key = 'exists-test';
      const value = 'test-value';

      expect(await cacheService.has(key)).toBe(false);
      
      await cacheService.set(key, value, 5000);
      expect(await cacheService.has(key)).toBe(true);
    });

    it('should delete keys', async () => {
      const key = 'delete-test';
      const value = 'test-value';

      await cacheService.set(key, value, 5000);
      expect(await cacheService.has(key)).toBe(true);

      await cacheService.delete(key);
      expect(await cacheService.has(key)).toBe(false);
    });

    it('should handle multiple keys', async () => {
      const entries = [
        { key: 'key1', value: 'value1', ttlMs: 5000 },
        { key: 'key2', value: 'value2', ttlMs: 5000 },
        { key: 'key3', value: 'value3', ttlMs: 5000 },
      ];

      await cacheService.setMany(entries);
      const results = await cacheService.getMany(['key1', 'key2', 'key3', 'non-existent']);

      expect(results).toEqual(['value1', 'value2', 'value3', null]);
    });

    it('should provide cache statistics', async () => {
      await cacheService.set('stats-test', 'value', 5000);
      await cacheService.get('stats-test'); // Hit
      await cacheService.get('non-existent'); // Miss

      const stats = await cacheService.getStats();
      
      expect(stats).toHaveProperty('size');
      expect(stats).toHaveProperty('hits');
      expect(stats).toHaveProperty('misses');
      expect(stats).toHaveProperty('hitRate');
      expect(typeof stats.size).toBe('number');
      expect(typeof stats.hits).toBe('number');
      expect(typeof stats.misses).toBe('number');
      expect(typeof stats.hitRate).toBe('number');
    });

    it('should clear all cache', async () => {
      await cacheService.set('clear-test-1', 'value1', 5000);
      await cacheService.set('clear-test-2', 'value2', 5000);

      expect(await cacheService.has('clear-test-1')).toBe(true);
      expect(await cacheService.has('clear-test-2')).toBe(true);

      await cacheService.clear();

      expect(await cacheService.has('clear-test-1')).toBe(false);
      expect(await cacheService.has('clear-test-2')).toBe(false);
    });
  });

  describe('RateLimitService', () => {
    it('should be defined', () => {
      expect(rateLimitService).toBeDefined();
    });

    it('should allow requests within limits', async () => {
      const key = 'rate-limit-test';
      const limit = 5;
      const windowMs = 60000; // 1 minute

      // First few requests should be allowed
      for (let i = 0; i < limit; i++) {
        const allowed = await rateLimitService.checkLimit(key, limit, windowMs);
        expect(allowed).toBe(true);
        await rateLimitService.increment(key, windowMs);
      }

      // Next request should be blocked
      const blocked = await rateLimitService.checkLimit(key, limit, windowMs);
      expect(blocked).toBe(false);
    });

    it('should track attempts correctly', async () => {
      const key = 'attempts-test';
      const windowMs = 60000;

      expect(await rateLimitService.getAttempts(key)).toBe(0);

      await rateLimitService.increment(key, windowMs);
      expect(await rateLimitService.getAttempts(key)).toBe(1);

      await rateLimitService.increment(key, windowMs);
      expect(await rateLimitService.getAttempts(key)).toBe(2);
    });

    it('should reset rate limits', async () => {
      const key = 'reset-test';
      const windowMs = 60000;

      await rateLimitService.increment(key, windowMs);
      await rateLimitService.increment(key, windowMs);
      expect(await rateLimitService.getAttempts(key)).toBe(2);

      await rateLimitService.reset(key);
      expect(await rateLimitService.getAttempts(key)).toBe(0);
    });
  });

  describe('Integration', () => {
    it('should work with both cache and rate limiting', async () => {
      // Test that both services work together
      const cacheKey = 'integration-cache';
      const rateLimitKey = 'integration-rate-limit';
      
      // Cache operation
      await cacheService.set(cacheKey, { test: 'data' }, 5000);
      const cached = await cacheService.get(cacheKey);
      expect(cached).toEqual({ test: 'data' });

      // Rate limiting operation
      const allowed = await rateLimitService.checkLimit(rateLimitKey, 10, 60000);
      expect(allowed).toBe(true);
      
      const attempts = await rateLimitService.increment(rateLimitKey, 60000);
      expect(attempts).toBe(1);
    });
  });
}); 