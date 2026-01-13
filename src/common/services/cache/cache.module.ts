import { Module, DynamicModule, Provider } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheService, RateLimitService, CACHE_SERVICE_TOKEN, RATE_LIMIT_SERVICE_TOKEN } from './cache.interface';
import { InMemoryCacheService } from './in-memory-cache.service';
import { RedisCacheService } from './redis-cache.service';

export interface CacheModuleOptions {
  type?: 'memory' | 'redis';
  redis?: {
    host?: string;
    port?: number;
    password?: string;
    db?: number;
    url?: string;
  };
}

@Module({})
export class CacheModule {
  static forRoot(options: CacheModuleOptions = {}): DynamicModule {
    const cacheProviders: Provider[] = [
      {
        provide: 'CACHE_OPTIONS',
        useValue: options,
      },
      {
        provide: CACHE_SERVICE_TOKEN,
        useFactory: async (configService: ConfigService) => {
          const cacheType = options.type || configService.get<string>('CACHE_TYPE', 'memory');
          
          console.log(`[CACHE MODULE] Initializing cache service with type: ${cacheType}`);
          
          switch (cacheType) {
            case 'redis':
              console.log('[CACHE MODULE] Creating Redis cache service');
              return new RedisCacheService(configService);
            case 'memory':
            default:
              console.log('[CACHE MODULE] Creating in-memory cache service');
              return new InMemoryCacheService();
          }
        },
        inject: [ConfigService],
      },
      {
        provide: RATE_LIMIT_SERVICE_TOKEN,
        useFactory: (cacheService: CacheService) => {
          // Rate limit service is the same as cache service in our implementations
          return cacheService;
        },
        inject: [CACHE_SERVICE_TOKEN],
      },
    ];

    return {
      module: CacheModule,
      imports: [ConfigModule],
      providers: cacheProviders,
      exports: [CACHE_SERVICE_TOKEN, RATE_LIMIT_SERVICE_TOKEN],
      global: true,
    };
  }

  static forRootAsync(options: {
    useFactory: (...args: any[]) => Promise<CacheModuleOptions> | CacheModuleOptions;
    inject?: any[];
  }): DynamicModule {
    const providers: Provider[] = [
      {
        provide: 'CACHE_OPTIONS',
        useFactory: options.useFactory,
        inject: options.inject || [],
      },
      {
        provide: CACHE_SERVICE_TOKEN,
        useFactory: async (configService: ConfigService, cacheOptions: CacheModuleOptions) => {
          const cacheType = cacheOptions.type || configService.get<string>('CACHE_TYPE', 'memory');
          
          console.log(`[CACHE MODULE] Initializing cache service with type: ${cacheType}`);
          
          switch (cacheType) {
            case 'redis':
              console.log('[CACHE MODULE] Creating Redis cache service');
              return new RedisCacheService(configService);
            case 'memory':
            default:
              console.log('[CACHE MODULE] Creating in-memory cache service');
              return new InMemoryCacheService();
          }
        },
        inject: [ConfigService, 'CACHE_OPTIONS'],
      },
      {
        provide: RATE_LIMIT_SERVICE_TOKEN,
        useFactory: (cacheService: CacheService) => {
          return cacheService;
        },
        inject: [CACHE_SERVICE_TOKEN],
      },
    ];

    return {
      module: CacheModule,
      imports: [ConfigModule],
      providers,
      exports: [CACHE_SERVICE_TOKEN, RATE_LIMIT_SERVICE_TOKEN],
      global: true,
    };
  }
} 