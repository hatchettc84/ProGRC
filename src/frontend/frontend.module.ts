import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { FrontendController } from './frontend.controller';
import { FrontendService } from './frontend.service';
import { ConfigService } from '@nestjs/config';
import { FrontendRewriteMiddleware } from './rewrite.middleware';

@Module({
  controllers: [FrontendController],
  providers: [FrontendService, ConfigService],
})
export class FrontendModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(FrontendRewriteMiddleware)
      .forRoutes('*');
  }
} 