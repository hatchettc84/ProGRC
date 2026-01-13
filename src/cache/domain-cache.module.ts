import { Module } from '@nestjs/common';
// Old cache service removed - using pluggable cache infrastructure
import { DomainCacheService } from './domain-cache.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LicenseRule } from 'src/entities/licenseRule.entity';
import { Permission } from 'src/entities/permission.entity';
import { LoggerService } from 'src/logger/logger.service';
import { UserRoles } from 'src/masterData/userRoles.entity';
import { CacheModule as InfrastructureCacheModule } from '../common/services/cache';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([LicenseRule, Permission, UserRoles]),
    // Import the new pluggable cache infrastructure with environment-based configuration
    InfrastructureCacheModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: configService.get<string>('CACHE_TYPE', 'memory') as 'memory' | 'redis',
      }),
      inject: [ConfigService],
    }),
    ConfigModule,
  ],
  providers: [
    // Enhanced domain cache service using pluggable backend
    DomainCacheService,
    LoggerService
  ],
  exports: [
    // Export enhanced domain cache service
    DomainCacheService
  ],
})
export class DomainCacheModule {}
