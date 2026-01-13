# Domain Cache Migration Guide

This guide helps you migrate from the old `InMemoryCacheService` to the new `DomainCacheService` that uses the pluggable cache infrastructure.

## Overview

### What Changed?

- **Old**: Direct in-memory Map with manual TTL management
- **New**: Pluggable cache backend (memory/Redis) with enhanced features

### Benefits of Migration

1. **Pluggable Backend**: Switch between memory and Redis easily
2. **Better Memory Management**: Automatic cleanup and leak prevention
3. **Enhanced Monitoring**: Built-in statistics and health checks
4. **Improved Error Handling**: Graceful fallbacks and recovery
5. **Rate Limiting**: Built-in rate limiting capabilities
6. **Future-Proof**: Ready for Redis/ElastiCache in production

## Migration Steps

### Step 1: Update Imports

**Before:**
```typescript
import { InMemoryCacheService } from 'src/cache/cache.service';

@Injectable()
export class MyService {
  constructor(private cacheService: InMemoryCacheService) {}
}
```

**After:**
```typescript
import { DomainCacheService } from 'src/cache/domain-cache.service';

@Injectable()
export class MyService {
  constructor(private cacheService: DomainCacheService) {}
}
```

### Step 2: Update Method Calls

#### License Rules
**Before:**
```typescript
const licenseRules = await this.cacheService.getLicenseRules<LicenseRule[]>();
```

**After:**
```typescript
const licenseRules = await this.cacheService.getLicenseRules();
// Or backward compatible:
const licenseRules = await this.cacheService.getLicenseRules<LicenseRule[]>();
```

#### Permissions
**Before:**
```typescript
const permissions = await this.cacheService.getPermissionRules<Permission[]>();
```

**After:**
```typescript
const permissions = await this.cacheService.getPermissions();
// Or backward compatible:
const permissions = await this.cacheService.getPermissionRules<Permission[]>();
```

#### User Roles
**Before:**
```typescript
const roles = await this.cacheService.getRoles<UserRoles[]>();
```

**After:**
```typescript
const roles = await this.cacheService.getUserRoles();
// Or backward compatible:
const roles = await this.cacheService.getRoles<UserRoles[]>();
```

#### Generic Cache Operations
**Before:**
```typescript
// Synchronous operations
this.cacheService.set('key', value, 600); // TTL in seconds
const data = await this.cacheService.get('key', () => fetchData(), 600);
this.cacheService.delete('key');
this.cacheService.clear();
```

**After:**
```typescript
// Asynchronous operations (more consistent)
await this.cacheService.set('key', value, 600000); // TTL in milliseconds
const data = await this.cacheService.get<MyType>('key');
await this.cacheService.delete('key');
await this.cacheService.clearAll();

// For backward compatibility (fire and forget):
this.cacheService.setSync('key', value, 600); // TTL in seconds
this.cacheService.clear(); // Fire and forget
```

### Step 3: Handle Async Operations

The new service is fully async for consistency. Update your code accordingly:

**Before:**
```typescript
public someMethod() {
  this.cacheService.set('key', value, 600); // Sync
  const data = this.cacheService.get('key'); // Mixed sync/async
}
```

**After:**
```typescript
public async someMethod() {
  await this.cacheService.set('key', value, 600000); // Async, TTL in ms
  const data = await this.cacheService.get<MyType>('key'); // Fully async
}
```

### Step 4: Update Module Imports

The cache module now includes both services for backward compatibility:

```typescript
@Module({
  imports: [CacheModule], // No changes needed
  providers: [MyService],
})
export class MyModule {}
```

## New Features Available

### Cache Invalidation

```typescript
// Invalidate specific domain data
await this.cacheService.invalidateLicenseRules();
await this.cacheService.invalidatePermissions();
await this.cacheService.invalidateUserRoles();

// Refresh all cache (useful after data updates)
await this.cacheService.refreshAll();
```

### Monitoring and Statistics

```typescript
// Get cache statistics
const stats = await this.cacheService.getStats();
console.log('Cache hit rate:', stats.cacheStats.hitRate);
console.log('Cache size:', stats.cacheStats.size);
console.log('Domain keys:', stats.domainKeys);
```

### Error Handling

The new service includes automatic fallback to database on cache errors:

```typescript
// This will fallback to database if cache fails
const licenseRules = await this.cacheService.getLicenseRules();
// No need for try/catch unless you want custom error handling
```

## Backward Compatibility

### Immediate Migration (Recommended)

Replace `InMemoryCacheService` with `DomainCacheService`:

```typescript
// Old import
// import { InMemoryCacheService } from 'src/cache/cache.service';

// New import
import { DomainCacheService } from 'src/cache/domain-cache.service';

@Injectable()
export class MyService {
  constructor(
    // private cacheService: InMemoryCacheService, // Old
    private cacheService: DomainCacheService,      // New
  ) {}
}
```

### Gradual Migration

Keep existing imports but use the enhanced features:

```typescript
import { InMemoryCacheService } from 'src/cache/cache.service';

@Injectable()
export class MyService {
  constructor(private cacheService: InMemoryCacheService) {}
  
  async someMethod() {
    // Old methods still work
    const licenseRules = await this.cacheService.getLicenseRules<LicenseRule[]>();
    
    // But you get enhanced reliability and features
  }
}
```

## Configuration for Production

### Environment Variables

```bash
# Development (default)
CACHE_TYPE=memory

# Production with Redis
CACHE_TYPE=redis
REDIS_URL=redis://your-redis-server:6379
```

### AWS ElastiCache

```bash
CACHE_TYPE=redis
REDIS_URL=redis://your-elasticache-cluster.cache.amazonaws.com:6379
```

## Testing

### Unit Tests

```typescript
describe('MyService', () => {
  let service: MyService;
  let cacheService: DomainCacheService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MyService,
        {
          provide: DomainCacheService,
          useValue: {
            getLicenseRules: jest.fn(),
            getPermissions: jest.fn(),
            getUserRoles: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MyService>(MyService);
    cacheService = module.get<DomainCacheService>(DomainCacheService);
  });

  it('should get license rules from cache', async () => {
    const mockRules = [{ id: 1, name: 'test' }];
    jest.spyOn(cacheService, 'getLicenseRules').mockResolvedValue(mockRules);

    const result = await service.someMethod();
    
    expect(cacheService.getLicenseRules).toHaveBeenCalled();
    expect(result).toEqual(mockRules);
  });
});
```

## Troubleshooting

### Common Issues

1. **TTL Units Changed**
   - Old: TTL in seconds
   - New: TTL in milliseconds
   - Solution: Multiply by 1000 or use constants

2. **Async/Await Required**
   - Old: Mixed sync/async
   - New: Fully async
   - Solution: Add `await` to all cache operations

3. **Type Safety**
   - Old: Manual type casting
   - New: Generic type support
   - Solution: Use `await cache.get<MyType>('key')`

### Migration Checklist

- [ ] Updated imports to use `DomainCacheService`
- [ ] Changed TTL values from seconds to milliseconds
- [ ] Added `await` to all cache operations
- [ ] Updated method names (optional, backward compatible)
- [ ] Added error handling for async operations
- [ ] Tested with both memory and Redis backends
- [ ] Updated unit tests

### Performance Verification

```typescript
// Monitor cache performance
setInterval(async () => {
  const stats = await domainCacheService.getStats();
  console.log('Domain cache stats:', {
    size: stats.cacheStats.size,
    hitRate: stats.cacheStats.hitRate,
    keys: stats.domainKeys,
  });
}, 60000); // Every minute
```

## Support

If you encounter issues during migration:

1. Check the logs for cache-related errors
2. Verify environment configuration
3. Test with both cache backends
4. Use the backward compatibility methods initially
5. Gradually migrate to new methods

The old `InMemoryCacheService` will remain available during the transition period. 