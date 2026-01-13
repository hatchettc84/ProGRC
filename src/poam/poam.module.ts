import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PoamController } from './poam.controller';
import { PoamService } from './poam.service';
import { Poam } from 'src/entities/poam.entity';
import { Customer } from 'src/entities/customer.entity';
import { AppUser } from 'src/entities/appUser.entity';
import { App } from 'src/entities/app.entity';
import { CustomerCsm } from 'src/entities/customerCsm.entity';
import { User } from 'src/entities/user.entity';
import { LoggerService } from 'src/logger/logger.service';
import { AuthService } from 'src/auth/auth.service';
import { CognitoService } from 'src/auth/cognitoAuth.service';
import { LicenseType } from 'src/entities/lincenseType.entity';
import { LicenseRule } from 'src/entities/licenseRule.entity';
import { Permission } from 'src/entities/permission.entity';
import { EmailService } from 'src/notifications/email.service';
import { ResetPasswordTokenService } from 'src/user/services/resetPasswordToken.service';
import { SESClient } from '@aws-sdk/client-ses';
import { ResetPasswordToken } from 'src/entities/resetPasswordToken.entity';
import { RoleHierarchyService } from 'src/auth/roleHierarchy.service';
import { PermissionValidatorService } from 'src/auth/permissionValidator.service';
import { DomainCacheModule } from 'src/cache/domain-cache.module';
import { UserRoles } from 'src/masterData/userRoles.entity';
import { TransformInterceptor } from 'src/interceptors/transform.interceptor';
import { AppStandard } from 'src/entities/appStandard.entity';
import { AsyncTask } from 'src/entities/asyncTasks.entity';
import { SyncComplianceV2Service } from 'src/compliance/service/syncComplianceV2.service';
import { SourceV1 } from 'src/entities/source/sourceV1.entity';
import { StandardControlMapping } from 'src/entities/compliance/standardControlMapping.entity';
import { ApplicationControlMapping } from 'src/entities/compliance/applicationControlMapping.entity';
import { Standard } from 'src/entities/standard_v1.entity';
import { Control } from 'src/entities/compliance/control.entity';
import { ApplicationControlEvidence } from 'src/entities/compliance/applicationControlEvidence.entity';
import { ControlChunkMapping } from 'src/entities/compliance/controlChunkMapping.entity';
import { SourceChunkMapping } from 'src/entities/compliance/sourceChunkMapping.entity';
import { ApplicationControlRecommendation } from 'src/entities/recommendation/applicationControlRecommendation.entity';
import { SourceType } from 'src/entities/source/sourceType.entity';
import { AuditFeedback } from 'src/entities/auditFeedback.entity';
import { UserComment } from 'src/entities/userComment.entity';
import { ControlEvaluationResult } from 'src/entities/controlEvaluation.entity';
import { SourceVersion } from 'src/entities/source/sourceVersion.entity';
import { AuditService } from 'src/audit/audit/audit.service';
import { SqsModule } from '@ssut/nestjs-sqs';
import { ApplicationControlMappingView } from 'src/entities/compliance/applicationControlMappingView.entity';
import { PasswordHistory } from 'src/entities/auth/passwordHistory.entity';
import { RefreshToken } from 'src/entities/auth/refreshToken.entity';
import { GeminiService } from 'src/llms/gemini.service';
import { GradientService } from 'src/llms/gradient.service';
import { OpenAiService } from 'src/llms/openAi.service';
import { OllamaService } from 'src/llms/ollama.service';
import { AiHelperService } from 'src/common/services/ai-helper.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Poam,
      Customer,
      AppUser,
      App,
      CustomerCsm,
      User,
      LicenseType,
      LicenseRule,
      Permission,
      ResetPasswordToken,
      UserRoles,
      AppStandard,
      SourceV1,
      AsyncTask,
      SourceVersion,
      StandardControlMapping,
      ApplicationControlMapping,
      Standard,
      StandardControlMapping,
      ApplicationControlMapping,
      SourceV1,
      Control,
      ApplicationControlEvidence,
      ControlChunkMapping,
      SourceChunkMapping,
      ApplicationControlRecommendation,
      SourceType,
      AuditFeedback,
      UserComment,
      ControlEvaluationResult,
      ApplicationControlMappingView,
      PasswordHistory,
      RefreshToken
    ]),
    DomainCacheModule,
    HttpModule,
    SqsModule.registerAsync({
      useFactory: () => {
        const sqsEnabled = process.env.AWS_SQS_ENABLED !== 'false';
        const endpoint = process.env.AWS_SQS_ENDPOINT || ((process.env.USE_LOCALSTACK || 'false') === 'true'
          ? process.env.LOCALSTACK_ENDPOINT || 'http://localhost:4566'
          : undefined);
        const region = process.env.AWS_SQS_REGION || process.env.AWS_REGION || 'us-east-1';
        const credentials = endpoint ? {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test',
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'test',
        } : undefined;

        const buildProducer = (nameEnv: string, urlEnv: string) => {
          const name = process.env[nameEnv];
          const queueUrl = process.env[urlEnv];
          if (!sqsEnabled || !name || !queueUrl) {
            return null;
          }
          return {
            name,
            queueUrl,
            region,
            endpoint,
            credentials,
          };
        };

        const producers = ([
          buildProducer('BACKEND_QUEUE_NAME', 'BACKEND_QUEUE'),
          buildProducer('DS_QUEUE_NAME', 'DS_QUEUE'),
        ].filter(Boolean)) as any[];
        return {
          producers,
        }
      }
    }),
  ],
  controllers: [PoamController],
  providers: [
    PoamService,
    LoggerService,
    AuthService,
    CognitoService,
    EmailService,
    ResetPasswordTokenService,
    SESClient,
    RoleHierarchyService,
    PermissionValidatorService,
    TransformInterceptor,
    SyncComplianceV2Service,
    AuditService,
    GeminiService,
    GradientService,
    OpenAiService,
    OllamaService,
    AiHelperService
  ],
  exports: [PoamService],
})
export class PoamModule { } 
