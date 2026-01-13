# Pluggable Cache Service

A flexible, pluggable caching system that supports multiple backends including in-memory and Redis.

## Features

- **Multiple Backends**: Support for in-memory caching and Redis
- **Unified Interface**: Single interface for all cache operations
- **Rate Limiting**: Built-in rate limiting functionality
- **Configuration**: Environment-based or programmatic configuration
- **Type Safety**: Full TypeScript support with generics
- **Production Ready**: Memory leak prevention, automatic cleanup, monitoring

## Quick Start

### Basic Usage

```typescript
import { CacheService, RateLimitService } from 'src/common/services/cache';

@Injectable()
export class MyService {
  constructor(
    private cacheService: CacheService,
    private rateLimitService: RateLimitService,
  ) {}

  async example() {
    // Store data with 5 minute expiration
    await this.cacheService.set('user:123', { name: 'John' }, 5 * 60 * 1000);
    
    // Retrieve data
    const user = await this.cacheService.get<{ name: string }>('user:123');
    
    // Rate limiting
    const canProceed = await this.rateLimitService.checkLimit(
      'api:user:123', 
      10,  // max attempts
      60 * 1000  // 1 minute window
    );
    
    if (!canProceed) {
      throw new Error('Rate limit exceeded');
    }
  }
}
```

## Configuration

### Environment Variables

```bash
# Cache type: 'memory' or 'redis'
CACHE_TYPE=memory

# Redis configuration (only needed when CACHE_TYPE=redis)
REDIS_URL=redis://localhost:6379
# OR
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_password
REDIS_DB=0
```

### Module Configuration

#### Option 1: Static Configuration

```typescript
@Module({
  imports: [
    CacheModule.forRoot({
      type: 'memory', // or 'redis'
    }),
  ],
})
export class AppModule {}
```

#### Option 2: Environment-based Configuration

```typescript
@Module({
  imports: [
    CacheModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: configService.get<string>('CACHE_TYPE', 'memory') as 'memory' | 'redis',
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

## Cache Backends

### In-Memory Cache

**Pros:**
- Fast access (no network overhead)
- No external dependencies
- Automatic cleanup and memory management

**Cons:**
- Data lost on app restart
- Limited to single instance
- Memory usage grows with cache size

**Best for:**
- Development environments
- Single-instance deployments
- Low-latency requirements

### Redis Cache

**Pros:**
- Persistent across app restarts
- Shared across multiple instances
- Built-in expiration handling
- High performance and scalability

**Cons:**
- Network latency
- External dependency
- Additional infrastructure

**Best for:**
- Production environments
- Multi-instance deployments
- Distributed applications

## API Reference

### CacheService

```typescript
interface CacheService {
  // Basic operations
  set<T>(key: string, value: T, ttlMs: number): Promise<void>;
  get<T>(key: string): Promise<T | null>;
  delete(key: string): Promise<void>;
  has(key: string): Promise<boolean>;
  clear(): Promise<void>;

  // Batch operations
  getMany<T>(keys: string[]): Promise<(T | null)[]>;
  setMany<T>(entries: Array<{ key: string; value: T; ttlMs: number }>): Promise<void>;
  deleteMany(keys: string[]): Promise<void>;

  // Monitoring
  getStats(): Promise<{
    size: number;
    hits?: number;
    misses?: number;
    hitRate?: number;
  }>;
  
  cleanup(): Promise<void>;
}
```

### RateLimitService

```typescript
interface RateLimitService {
  checkLimit(key: string, maxAttempts: number, windowMs: number): Promise<boolean>;
  increment(key: string, windowMs: number): Promise<number>;
  reset(key: string): Promise<void>;
  getAttempts(key: string): Promise<number>;
}
```

## Advanced Usage

### Redis-Specific Features

When using Redis, you get access to additional features:

```typescript
import { RedisCacheService } from 'src/common/services/cache';

@Injectable()
export class AdvancedService {
  constructor(
    @Inject(CacheService) private cacheService: CacheService,
  ) {}

  async advancedRedisOperations() {
    const redisService = this.cacheService as RedisCacheService;
    
    // Check if connected
    if (redisService.isConnected()) {
      // Set with advanced options
      await redisService.setWithOptions('key', 'value', {
        ttlMs: 60000,
        nx: true, // Only set if key doesn't exist
      });
      
      // Execute raw Redis commands
      await redisService.executeCommand('INCR', 'counter');
      
      // Get Redis client for complex operations
      const client = redisService.getClient();
      await client.lpush('list', 'item1', 'item2');
    }
  }
}
```

### Custom Cache Keys

Use consistent key patterns for better organization:

```typescript
// Good key patterns
const userCacheKey = `user:${userId}`;
const sessionKey = `session:${sessionId}`;
const rateLimitKey = `rate_limit:${action}:${userId}`;

// MFA-specific patterns (used internally)
const mfaChallengeKey = `mfa_challenge_${userId}`;
const mfaRateLimitKey = `mfa_rate_limit_${action}_${userId}`;
```

## Performance Considerations

### Memory Cache
- Monitor memory usage in production
- Configure appropriate cleanup intervals
- Set reasonable TTL values

### Redis Cache
- Use connection pooling for high traffic
- Consider Redis cluster for scalability
- Monitor Redis memory usage and eviction policies

## Migration Guide

### From Global Objects to Cache Service

**Before:**
```typescript
// Don't do this
global.cache = global.cache || {};
global.cache[key] = { value, expiry: Date.now() + ttl };
```

**After:**
```typescript
// Do this
await this.cacheService.set(key, value, ttl);
```

### From Old Cache Module

If migrating from an existing cache module:

1. Update imports:
   ```typescript
   import { CacheService } from 'src/common/services/cache';
   ```

2. Update constructor:
   ```typescript
   constructor(private cacheService: CacheService) {}
   ```

3. Update method calls:
   ```typescript
   // Old: this.cache.set(key, value, ttl)
   // New: await this.cacheService.set(key, value, ttl)
   ```

## Monitoring and Debugging

### Cache Statistics

```typescript
const stats = await this.cacheService.getStats();
console.log(`Cache size: ${stats.size}, Hit rate: ${stats.hitRate}%`);
```

### Redis Monitoring

Monitor Redis using:
- Redis CLI: `redis-cli info`
- Memory usage: `redis-cli info memory`
- Connected clients: `redis-cli info clients`

## Troubleshooting

### Common Issues

1. **Redis Connection Errors**
   - Check Redis server is running
   - Verify connection string/credentials
   - Check network connectivity

2. **Memory Leaks (In-Memory)**
   - Ensure TTL values are set
   - Monitor cache size growth
   - Check cleanup interval is running

3. **Performance Issues**
   - Use batch operations for multiple keys
   - Optimize TTL values
   - Consider using Redis for better performance

### Debug Logging

Enable debug logging:

```typescript
// Check cache stats periodically
setInterval(async () => {
  const stats = await this.cacheService.getStats();
  if (stats.size > 1000) {
    console.warn('Cache size is getting large:', stats);
  }
}, 60000);
```

## Best Practices

1. **Use meaningful key names** with consistent patterns
2. **Set appropriate TTL values** to prevent memory leaks
3. **Handle cache misses gracefully** with fallback logic
4. **Monitor cache performance** and hit rates
5. **Use batch operations** for multiple keys when possible
6. **Configure rate limits** based on business requirements
7. **Test with both backends** during development 