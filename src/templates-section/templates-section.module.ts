import { forwardRef, MiddlewareConsumer, Module } from '@nestjs/common';
import { TemplatesSectionService } from './templates-section.service';
import { TemplatesSectionController } from './templates-section.controller';
import { TemplateSection } from 'src/entities/templatesSection.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { RequestMiddleware } from 'src/middlewares/request.middleware';
import { LoggerService } from 'src/logger/logger.service';
import { RequestContextService } from 'src/request-context/request-context.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TemplateSection
    ]),
    forwardRef(() => AuthModule)
  ],
  providers: [TemplatesSectionService, LoggerService, ],
  controllers: [TemplatesSectionController]
})
export class TemplatesSectionModule { }
