# Cache Service Installation

## Dependencies

### For In-Memory Cache Only
No additional dependencies required. The in-memory cache uses only Node.js built-in modules.

### For Redis Cache Support
Install the Redis client library:

```bash
npm install ioredis
npm install --save-dev @types/ioredis
```

## Environment Configuration

Create a `.env` file or add these variables to your existing environment configuration:

### Development (In-Memory)
```bash
# Use in-memory cache for development
CACHE_TYPE=memory
```

### Production (Redis)
```bash
# Use Redis for production
CACHE_TYPE=redis

# Option 1: Redis URL (recommended)
REDIS_URL=redis://localhost:6379

# Option 2: Individual Redis settings
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
REDIS_DB=0
```

### AWS ElastiCache Example
```bash
CACHE_TYPE=redis
REDIS_URL=redis://your-elasticache-cluster.cache.amazonaws.com:6379
```

### Redis Cloud Example
```bash
CACHE_TYPE=redis
REDIS_URL=redis://username:password@redis-cluster.cloud.redislabs.com:12345
```

## Module Setup

### Option 1: Environment-based (Recommended)
```typescript
// app.module.ts
import { CacheModule } from 'src/common/services/cache';

@Module({
  imports: [
    CacheModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: configService.get<string>('CACHE_TYPE', 'memory') as 'memory' | 'redis',
      }),
      inject: [ConfigService],
    }),
    // ... other modules
  ],
})
export class AppModule {}
```

### Option 2: Static Configuration
```typescript
// app.module.ts
import { CacheModule } from 'src/common/services/cache';

@Module({
  imports: [
    CacheModule.forRoot({
      type: 'memory', // or 'redis'
    }),
    // ... other modules
  ],
})
export class AppModule {}
```

## Verification

### Test In-Memory Cache
```typescript
import { CacheService } from 'src/common/services/cache';

@Injectable()
export class TestService {
  constructor(private cacheService: CacheService) {}

  async testCache() {
    await this.cacheService.set('test', 'value', 60000);
    const value = await this.cacheService.get('test');
    console.log('Cache test:', value); // Should log: Cache test: value
  }
}
```

### Test Redis Connection
```typescript
import { CacheService } from 'src/common/services/cache';
import { RedisCacheService } from 'src/common/services/cache';

@Injectable()
export class TestService {
  constructor(private cacheService: CacheService) {}

  async testRedis() {
    if (this.cacheService instanceof RedisCacheService) {
      const isConnected = this.cacheService.isConnected();
      console.log('Redis connected:', isConnected);
      
      const stats = await this.cacheService.getStats();
      console.log('Redis stats:', stats);
    }
  }
}
```

## Docker Setup

### Redis with Docker Compose
```yaml
# docker-compose.yml
version: '3.8'
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data

  app:
    build: .
    environment:
      - CACHE_TYPE=redis
      - REDIS_HOST=redis
      - REDIS_PORT=6379
    depends_on:
      - redis

volumes:
  redis_data:
```

### Environment for Docker
```bash
# .env.docker
CACHE_TYPE=redis
REDIS_HOST=redis
REDIS_PORT=6379
```

## Troubleshooting

### Common Issues

1. **Module not found: 'ioredis'**
   ```bash
   npm install ioredis @types/ioredis
   ```

2. **Redis connection refused**
   - Check if Redis server is running
   - Verify host and port settings
   - Check firewall/network settings

3. **Memory cache growing too large**
   - Monitor cache size with `getStats()`
   - Reduce TTL values
   - Implement cache size limits

### Health Checks

Add health checks to monitor cache status:

```typescript
@Controller('health')
export class HealthController {
  constructor(private cacheService: CacheService) {}

  @Get('cache')
  async checkCache() {
    try {
      const testKey = 'health_check';
      await this.cacheService.set(testKey, 'ok', 1000);
      const value = await this.cacheService.get(testKey);
      await this.cacheService.delete(testKey);
      
      const stats = await this.cacheService.getStats();
      
      return {
        status: value === 'ok' ? 'healthy' : 'unhealthy',
        stats,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
``` 