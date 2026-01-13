import { MiddlewareConsumer, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CloudFrontService } from "src/app/cloudfront.service";
import { ApplicationModule } from "src/application/application.module";
import { AskAiModule } from "src/ask-ai/ask-ai.module";
import { AssessmentModule } from "src/assessment/assessment.module";
import { AssetsModule } from "src/assets/assets.module";
import { AsyncTasksModule } from "src/async_tasks/async_tasks.module";
import { AuthModule } from "src/auth/auth.module";
import { ComplianceModule } from "src/compliance/compliance.module";
import { typeOrmConfig } from "src/config/typeorm.config";
import { CustomerModule } from "src/customer/customer.module";
import { DocumentModule } from "src/document/document.module";
import { Customer } from "src/entities/customer.entity";
import { SourceType } from "src/entities/source/sourceType.entity";
import { TemplateSection } from "src/entities/templatesSection.entity";
import { HelpCenterModule } from "src/help-center/helpCenter.module";
import { HelpdeskModule } from "src/helpdesk/helpdesk.module";
import { OpenAiService } from "src/llms/openAi.service";
import { OllamaService } from "src/llms/ollama.service";
import { GradientService } from "src/llms/gradient.service";
import { UserRoles } from "src/masterData/userRoles.entity";
import { NotificationsModule } from "src/notifications/notifications.module";
import { OnboardingModule } from "src/onboarding/onboarding.module";
import { SourcesModule } from "src/sources/sources.module";
import { SspModule } from "src/ssp/ssp.module";
import { TemplatesSectionModule } from "src/templates-section/templates-section.module";
import { TemplatesSectionService } from "src/templates-section/templates-section.service";
import { TemplateModule } from "src/templates/template.module";
import { TrustCenterModule } from "src/trust-center/trustCenter.module";
import { UserModule } from "src/user/user.module";
import { AppController } from "./app.controller";
import { RootController } from "./root.controller";
import { AppService } from "./app.service";
import { AwsS3ConfigService } from "./aws-s3-config.service";
import { UploadService } from "./fileUpload.service";
import { SeedService } from "./seedService";
import { FeatureFlagModule } from "src/feature-flag/feature-flag.module";
import { LoggerService } from "src/logger/logger.service";
import { TypeOrmLoggerService } from "src/logger/typeorm-logger.service";
import { LogArchiverService } from "src/logger/logarchiver.service";
import { ScheduleModule } from "@nestjs/schedule";
import { AppUser } from "src/entities/appUser.entity";
import { User } from "src/entities/user.entity";
import { ApplicationControlEvidence } from "src/entities/compliance/applicationControlEvidence.entity";
import { SourceV1 } from "src/entities/source/sourceV1.entity";
import { FileDownloadService } from "./fileDownload.service";
import { App } from "src/entities/app.entity";
import { QuickStartModule } from "src/quick-start/quickStart.module";
import { S3GarbageCollectorService } from "./s3GarbageCollector.service";
import { TerminusModule } from "@nestjs/terminus";
import { HealthController } from "src/health/health.controller";
import { RecommendationModule } from "src/recommendation/recommendation.module";
import { LicenseRule } from "src/entities/licenseRule.entity";
import { LicenseType } from "src/entities/lincenseType.entity";
import { Permission } from "src/entities/permission.entity";
import { DomainCacheModule } from "src/cache/domain-cache.module";
import { LicenseExpiryScheduler } from "./licenseExpiryScheduler.service";
import { CustomerCsm } from "src/entities/customerCsm.entity";
import { AuditModule } from "src/audit/audit/audit.module";
import { EmailValidationService } from "src/auth/emailValidation.service";
import { EmailService } from "src/notifications/email.service";
import { SESClient } from "@aws-sdk/client-ses";
import { UserCommentModule } from "src/user-comment/user-comment.module";
import { ConnectionsModule } from "src/connections/connections.module";
import { PoamModule } from "src/poam/poam.module";
import { PolicyModule } from "src/policy/policy.module";
import { SourceVersion } from "src/entities/source/sourceVersion.entity";
import { AppStandard } from "src/entities/appStandard.entity";
import { AssessmentDetail } from "src/entities/assessments/assessmentDetails.entity";
import { Templates } from "src/entities/template.entity";
import { PromptTemplateVariable } from "src/entities/promptTemplateVariable.entity";
import { JwtModule } from "@nestjs/jwt";
import { FeaturesModule } from "src/customer/features.module";
import { ProfilerModule } from "src/profiler/profiler.module";
import platformOneConfig from "src/config/platform-one.config";
import gameWardenConfig from "src/config/game-warden.config";
import { RateLimiterModule } from 'nestjs-rate-limiter';
import { PromptVariablesModule } from "src/prompt-variables/prompt-variables.module";
import { FrontendModule } from "../frontend/frontend.module";
import { QueueModule } from "src/queue/queue.module";
import { HttpModule } from "@nestjs/axios";
import { VendorModule } from "src/vendor/vendor.module";

// Helper function to determine if profiler should be enabled
const shouldEnableProfiler = (): boolean => {
  const env = process.env.NODE_ENV || "development";
  const isLocal = process.env.IS_LOCAL === "true";
  const isDev = env === "development" || env === "dev";
  return isDev || isLocal;
};

@Module({
  controllers: [RootController, AppController, HealthController],
  providers: [
    AppService,
    OpenAiService,
    OllamaService,
    GradientService,
    SeedService,
    UploadService,
    AwsS3ConfigService,
    CloudFrontService,
    TemplatesSectionService,
    LoggerService,
    TypeOrmLoggerService,
    LogArchiverService,
    FileDownloadService,
    S3GarbageCollectorService,
    LicenseExpiryScheduler,
    EmailValidationService,
    EmailService,
    SESClient,
  ],
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [platformOneConfig, gameWardenConfig],
    }),
    JwtModule.register({
      global: true,
    }),
    HttpModule,
    TerminusModule,
    TypeOrmModule.forRoot(typeOrmConfig),
    TypeOrmModule.forFeature([
      UserRoles,
      Customer,
      TemplateSection,
      SourceType,
      AppUser,
      User,
      ApplicationControlEvidence,
      SourceV1,
      App,
      LicenseRule,
      LicenseType,
      Permission,
      CustomerCsm,
      SourceVersion,
      AppStandard,
      AssessmentDetail,
      Templates,
      PromptTemplateVariable,
    ]),
    RateLimiterModule.register({
      points: 5,
      duration: 60,
      errorMessage: "Too many requests, please try again later.",
    }),
    AuthModule,
    DocumentModule,
    SspModule,
    OnboardingModule,
    SourcesModule,
    AssessmentModule,
    AsyncTasksModule,
    NotificationsModule,
    ApplicationModule,
    AssetsModule,
    ComplianceModule,
    CustomerModule,
    TemplatesSectionModule,
    UserModule,
    HelpdeskModule,
    TrustCenterModule,
    HelpCenterModule,
    AskAiModule,
    TemplateModule,
    RecommendationModule,
    FeatureFlagModule,
    QuickStartModule,
    DomainCacheModule,
    AuditModule,
    UserCommentModule,
    ConnectionsModule,
    PoamModule,
    PolicyModule,
    FeaturesModule,
    PromptVariablesModule,
    VendorModule,
    // QueueModule,  // TEMPORARILY DISABLED for initial setup
    ...(shouldEnableProfiler() ? [ProfilerModule] : []),
    // FrontendModule,  // TEMPORARILY DISABLED for initial setup
  ],
})
export class AppModule {
  // configure(consumer: MiddlewareConsumer) {
  //   consumer.apply(RequestMiddleware).forRoutes('*');
  // }
}
