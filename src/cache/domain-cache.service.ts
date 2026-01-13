import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LicenseRule } from 'src/entities/licenseRule.entity';
import { Permission } from 'src/entities/permission.entity';
import { LoggerService } from 'src/logger/logger.service';
import { UserRoles } from 'src/masterData/userRoles.entity';
import { CacheService, CACHE_SERVICE_TOKEN } from '../common/services/cache';
import { Inject } from '@nestjs/common';
import { Repository } from 'typeorm';

/**
 * Domain-specific cache service for application data.
 * Uses the pluggable cache infrastructure as its backend.
 * 
 * Multi-instance support: Uses Redis pub/sub for cache invalidation
 * coordination across ECS tasks.
 */
@Injectable()
export class DomainCacheService implements OnModuleInit {
  // Cache keys
  private static readonly KEYS = {
    LICENSE_RULES: 'domain:license_rules',
    PERMISSIONS: 'domain:permissions',
    USER_ROLES: 'domain:user_roles',
  } as const;

  // Cache invalidation channels
  private static readonly CHANNELS = {
    INVALIDATE_LICENSE_RULES: 'cache:invalidate:license_rules',
    INVALIDATE_PERMISSIONS: 'cache:invalidate:permissions',
    INVALIDATE_USER_ROLES: 'cache:invalidate:user_roles',
    REFRESH_ALL: 'cache:refresh:all',
  } as const;

  // Default TTL: 10 minutes (in milliseconds)
  private static readonly DEFAULT_TTL = 10 * 60 * 1000;

  private subscriber: any; // Redis subscriber client
  private publisher: any; // Redis publisher client
  private instanceId: string;

  constructor(
    @InjectRepository(LicenseRule)
    private readonly licenseRuleRepo: Repository<LicenseRule>,

    @InjectRepository(Permission)
    private readonly permissionsRepo: Repository<Permission>,

    @InjectRepository(UserRoles)
    private readonly userRoles: Repository<UserRoles>,

    private readonly logger: LoggerService,
    @Inject(CACHE_SERVICE_TOKEN)
    private readonly cacheService: CacheService,
  ) {
    // Generate unique instance ID for this ECS task
    this.instanceId = `${process.env.HOSTNAME || 'unknown'}-${Date.now()}`;
  }

  async onModuleInit() {
    this.logger.info(`Initializing domain cache for instance: ${this.instanceId}`);

    // Setup Redis pub/sub for multi-instance coordination
    await this.setupPubSub();

    // Preload cache with staggered delay to avoid race conditions
    const delay = Math.random() * 2000; // 0-2 second random delay
    setTimeout(async () => {
      await this.preloadCache();
    }, delay);
  }

  private async setupPubSub(): Promise<void> {
    try {
      // Get Redis clients from cache service
      const redisClient = (this.cacheService as any).getClient();
      
      if (!redisClient) {
        this.logger.warn('Redis client not available for pub/sub setup');
        return;
      }

      // Create separate subscriber and publisher connections
      this.subscriber = redisClient.duplicate();
      this.publisher = redisClient.duplicate();

      // Connect the duplicated clients (required for lazyConnect: true)
      await this.subscriber.connect();
      await this.publisher.connect();

      // Subscribe to cache invalidation events
      await this.subscriber.subscribe(
        DomainCacheService.CHANNELS.INVALIDATE_LICENSE_RULES,
        DomainCacheService.CHANNELS.INVALIDATE_PERMISSIONS,
        DomainCacheService.CHANNELS.INVALIDATE_USER_ROLES,
        DomainCacheService.CHANNELS.REFRESH_ALL
      );

      // Handle incoming invalidation messages
      this.subscriber.on('message', async (channel: string, message: string) => {
        const data = JSON.parse(message);
        
        // Ignore messages from this instance
        if (data.instanceId === this.instanceId) {
          return;
        }

        this.logger.info(`Received cache invalidation: ${channel} from ${data.instanceId}`);

        switch (channel) {
          case DomainCacheService.CHANNELS.INVALIDATE_LICENSE_RULES:
            await this.localInvalidateLicenseRules();
            break;
          case DomainCacheService.CHANNELS.INVALIDATE_PERMISSIONS:
            await this.localInvalidatePermissions();
            break;
          case DomainCacheService.CHANNELS.INVALIDATE_USER_ROLES:
            await this.localInvalidateUserRoles();
            break;
          case DomainCacheService.CHANNELS.REFRESH_ALL:
            await this.localRefreshAll();
            break;
        }
      });

      this.logger.info('Redis pub/sub setup completed for cache coordination');
    } catch (error) {
      this.logger.error('Failed to setup Redis pub/sub for cache coordination:', error);
    }
  }

  private async preloadCache(): Promise<void> {
    this.logger.info('Preloading domain cache on app start...');

    try {
      // Preload all domain data
      await Promise.all([
        this.preloadLicenseRules(),
        this.preloadPermissions(),
        this.preloadUserRoles(),
      ]);

      this.logger.info('Domain cache preloaded successfully');
    } catch (error) {
      this.logger.error('Error preloading domain cache:', error);
    }
  }

  // === License Rules ===

  async getLicenseRules(): Promise<LicenseRule[]> {
    return this.getWithFallback(
      DomainCacheService.KEYS.LICENSE_RULES,
      () => this.licenseRuleRepo.find(),
      'license rules'
    );
  }

  private async preloadLicenseRules(): Promise<void> {
    const licenseRules = await this.licenseRuleRepo.find();
    await this.cacheService.set(
      DomainCacheService.KEYS.LICENSE_RULES,
      licenseRules,
      DomainCacheService.DEFAULT_TTL
    );
    this.logger.info(`Preloaded ${licenseRules.length} license rules`);
  }

  async invalidateLicenseRules(): Promise<void> {
    await this.localInvalidateLicenseRules();
    
    // Broadcast invalidation to other instances
    if (this.publisher) {
      await this.publisher.publish(
        DomainCacheService.CHANNELS.INVALIDATE_LICENSE_RULES,
        JSON.stringify({ instanceId: this.instanceId })
      );
    }
  }

  private async localInvalidateLicenseRules(): Promise<void> {
    await this.cacheService.delete(DomainCacheService.KEYS.LICENSE_RULES);
    this.logger.info('Invalidated license rules cache (local)');
  }

  // === Permissions ===

  async getPermissions(): Promise<Permission[]> {
    return this.getWithFallback(
      DomainCacheService.KEYS.PERMISSIONS,
      () => this.permissionsRepo.find(),
      'permissions'
    );
  }

  private async preloadPermissions(): Promise<void> {
    const permissions = await this.permissionsRepo.find();
    await this.cacheService.set(
      DomainCacheService.KEYS.PERMISSIONS,
      permissions,
      DomainCacheService.DEFAULT_TTL
    );
    this.logger.info(`Preloaded ${permissions.length} permissions`);
  }

  async invalidatePermissions(): Promise<void> {
    await this.localInvalidatePermissions();
    
    // Broadcast invalidation to other instances
    if (this.publisher) {
      await this.publisher.publish(
        DomainCacheService.CHANNELS.INVALIDATE_PERMISSIONS,
        JSON.stringify({ instanceId: this.instanceId })
      );
    }
  }

  private async localInvalidatePermissions(): Promise<void> {
    await this.cacheService.delete(DomainCacheService.KEYS.PERMISSIONS);
    this.logger.info('Invalidated permissions cache (local)');
  }

  // === User Roles ===

  async getUserRoles(): Promise<UserRoles[]> {
    return this.getWithFallback(
      DomainCacheService.KEYS.USER_ROLES,
      () => this.userRoles.find(),
      'user roles'
    );
  }

  private async preloadUserRoles(): Promise<void> {
    const userRoles = await this.userRoles.find();
    await this.cacheService.set(
      DomainCacheService.KEYS.USER_ROLES,
      userRoles,
      DomainCacheService.DEFAULT_TTL
    );
    this.logger.info(`Preloaded ${userRoles.length} user roles`);
  }

  async invalidateUserRoles(): Promise<void> {
    await this.localInvalidateUserRoles();
    
    // Broadcast invalidation to other instances
    if (this.publisher) {
      await this.publisher.publish(
        DomainCacheService.CHANNELS.INVALIDATE_USER_ROLES,
        JSON.stringify({ instanceId: this.instanceId })
      );
    }
  }

  private async localInvalidateUserRoles(): Promise<void> {
    await this.cacheService.delete(DomainCacheService.KEYS.USER_ROLES);
    this.logger.info('Invalidated user roles cache (local)');
  }

  // === Generic Methods ===

  /**
   * Get data from cache with database fallback
   */
  private async getWithFallback<T>(
    key: string,
    fetchFunction: () => Promise<T>,
    dataType: string
  ): Promise<T> {
    try {
      // Try to get from cache first
      const cached = await this.cacheService.get<T>(key);
      if (cached !== null) {
        return cached;
      }

      // Cache miss - fetch from database
      this.logger.info(`Cache miss for ${dataType}, fetching from database`);
      const data = await fetchFunction();
      
      // Store in cache for next time
      await this.cacheService.set(key, data, DomainCacheService.DEFAULT_TTL);
      
      return data;
    } catch (error) {
      this.logger.error(`Error getting ${dataType} from cache:`, error);
      // Fallback to database on cache error
      return fetchFunction();
    }
  }

  /**
   * Set data in cache with TTL
   */
  async set<T>(key: string, value: T, ttlMs?: number): Promise<void> {
    const ttl = ttlMs || DomainCacheService.DEFAULT_TTL;
    await this.cacheService.set(key, value, ttl);
  }

  /**
   * Get data from cache (returns null if not found)
   */
  async get<T>(key: string): Promise<T | null> {
    return this.cacheService.get<T>(key);
  }

  /**
   * Delete specific key from cache
   */
  async delete(key: string): Promise<void> {
    await this.cacheService.delete(key);
  }

  /**
   * Clear all domain cache
   */
  async clearAll(): Promise<void> {
    await Promise.all([
      this.invalidateLicenseRules(),
      this.invalidatePermissions(),
      this.invalidateUserRoles(),
    ]);
    this.logger.info('Cleared all domain cache');
  }

  /**
   * Refresh all domain cache (useful after data updates)
   */
  async refreshAll(): Promise<void> {
    await this.localRefreshAll();
    
    // Broadcast refresh to other instances
    if (this.publisher) {
      await this.publisher.publish(
        DomainCacheService.CHANNELS.REFRESH_ALL,
        JSON.stringify({ instanceId: this.instanceId })
      );
    }
  }

  private async localRefreshAll(): Promise<void> {
    this.logger.info('Refreshing all domain cache...');
    
    await this.clearAll();
    
    await Promise.all([
      this.preloadLicenseRules(),
      this.preloadPermissions(),
      this.preloadUserRoles(),
    ]);
    
    this.logger.info('Domain cache refresh completed');
  }

  /**
   * Get cache statistics for monitoring
   */
  async getStats(): Promise<{
    cacheStats: any;
    domainKeys: string[];
  }> {
    const cacheStats = await this.cacheService.getStats();
    const domainKeys = Object.values(DomainCacheService.KEYS);
    
    return {
      cacheStats,
      domainKeys,
    };
  }

  // === Backward Compatibility Methods ===
  // These maintain compatibility with the existing API

  /**
   * @deprecated Use getPermissions() instead
   */
  async getPermissionRules<T>(): Promise<T> {
    return this.getPermissions() as Promise<T>;
  }

  /**
   * @deprecated Use getUserRoles() instead
   */
  async getRoles<T>(): Promise<T> {
    return this.getUserRoles() as Promise<T>;
  }

  /**
   * @deprecated Use set() instead
   */
  setSync(key: string, value: any, ttlSeconds?: number): void {
    const ttlMs = ttlSeconds ? ttlSeconds * 1000 : DomainCacheService.DEFAULT_TTL;
    // Fire and forget for backward compatibility
    this.set(key, value, ttlMs).catch(error => {
      this.logger.error('Error in sync set operation:', error);
    });
  }

  /**
   * @deprecated Use clearAll() instead
   */
  clear(): void {
    // Fire and forget for backward compatibility
    this.clearAll().catch(error => {
      this.logger.error('Error in sync clear operation:', error);
    });
  }
} 