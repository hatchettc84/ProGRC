import { MiddlewareConsumer, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeatureFlagService } from './feature-flag.service';
import { FeatureFlagController } from './feature-flag.controller';
import { FeatureFlag } from '../entities/featureFlag.entity';
import { AuthModule } from 'src/auth/auth.module';
import { RequestMiddleware } from 'src/middlewares/request.middleware';
import { LoggerService } from 'src/logger/logger.service';
import { RequestContextService } from 'src/request-context/request-context.service';

@Module({
  imports: [TypeOrmModule.forFeature([FeatureFlag]), AuthModule],
  controllers: [FeatureFlagController],
  providers: [FeatureFlagService, LoggerService, ],
  exports: [FeatureFlagService],
})
export class FeatureFlagModule {}
