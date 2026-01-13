import { forwardRef, MiddlewareConsumer, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AwsS3ConfigService } from "src/app/aws-s3-config.service";
import { UploadService } from "src/app/fileUpload.service";
import { CreateApplicationService } from "src/application/createApplication.service";
import { AuthModule } from "src/auth/auth.module";
import { CognitoService } from "src/auth/cognitoAuth.service";
import { EmailValidationService } from "src/auth/emailValidation.service";
import { App } from "src/entities/app.entity";
import { AppUser } from "src/entities/appUser.entity";
import { Customer } from "src/entities/customer.entity";
import { OrganizationTemplate } from "src/entities/organizationTemplate.entity";
import { OrganizationStandards } from "src/entities/orgnizationStandards.entity";
import { OrganizationFrameworks } from "src/entities/organizationFrameworks.entity";
import { ResetPasswordToken } from "src/entities/resetPasswordToken.entity";
//import { Standards } from 'src/entities/standard.entity';
import { Templates } from "src/entities/template.entity";
import { User } from "src/entities/user.entity";
import { UserRoles } from "src/masterData/userRoles.entity";
import { NotificationsModule } from "src/notifications/notifications.module";
import { ResetPasswordTokenService } from "src/user/services/resetPasswordToken.service";
import { OnboardingController } from "./onboarding.controller";
import { OnboardingService } from "./onboarding.service";
import { ResendInvitationService } from "./resentInvitation.service";
import { Framework } from "src/entities/framework.entity";
import { Standard } from "src/entities/standard_v1.entity";
import { TosHistory } from "src/entities/tosHistory.entity";
import { RequestContextService } from "src/request-context/request-context.service";
import { LoggerService } from "src/logger/logger.service";
import { RequestMiddleware } from "src/middlewares/request.middleware";
import { ApplicationControlEvidence } from "src/entities/compliance/applicationControlEvidence.entity";
import { SourceV1 } from "src/entities/source/sourceV1.entity";
import { SourceType } from "src/entities/source/sourceType.entity";
import { CustomerCsm } from "src/entities/customerCsm.entity";
import { LicenseType } from "src/entities/lincenseType.entity";
import { LicenseRule } from "src/entities/licenseRule.entity";
import { SourceVersion } from "src/entities/source/sourceVersion.entity";
import { AppStandard } from "src/entities/appStandard.entity";
import { AssessmentDetail } from "src/entities/assessments/assessmentDetails.entity";
import { SourceChunkMapping } from "src/entities/compliance/sourceChunkMapping.entity";
import { ApplicationControlMapping } from "src/entities/compliance/applicationControlMapping.entity";
import { ApplicationPolicyService } from "src/application/applicationPolicy.service";
import { AsyncTask } from "src/entities/asyncTasks.entity";
import { SQSClient } from "@aws-sdk/client-sqs";
import { SyncComplianceV2Service } from "src/compliance/service/syncComplianceV2.service";
import { StandardControlMapping } from "src/entities/compliance/standardControlMapping.entity";
import { ApplicationControlMappingView } from "src/entities/compliance/applicationControlMappingView.entity";
import { AuditService } from "src/audit/audit/audit.service";
import { AuditFeedback } from "src/entities/auditFeedback.entity";
import { ControlChunkMapping } from "src/entities/compliance/controlChunkMapping.entity";
import { Control } from "src/entities/compliance/control.entity";
import { ApplicationConnection } from "src/entities/connection/applicationConnections.entity";
import { AiHelperService } from "src/common/services/ai-helper.service";
import { GeminiService } from "src/llms/gemini.service";
import { GradientService } from "src/llms/gradient.service";
import { OpenAiService } from "src/llms/openAi.service";
import { OllamaService } from "src/llms/ollama.service";
import { HttpModule } from "@nestjs/axios";
@Module({
  controllers: [OnboardingController],
  providers: [
    OnboardingService,
    EmailValidationService,
    CognitoService,
    UploadService,
    AwsS3ConfigService,
    CreateApplicationService,
    ResetPasswordTokenService,
    ResendInvitationService,
    LoggerService,
    ApplicationPolicyService,
    SyncComplianceV2Service,
    AuditService,
    AiHelperService,
    GeminiService,
    GradientService,
    OpenAiService,
    OllamaService,
    {
      provide: SQSClient,
      useFactory: () => {
        const useLocalstack = (process.env.USE_LOCALSTACK || 'false') === 'true';
        const endpoint = process.env.AWS_SQS_ENDPOINT || (useLocalstack
          ? process.env.LOCALSTACK_ENDPOINT || 'http://localhost:4566'
          : undefined);
        const region = process.env.AWS_SQS_REGION || process.env.AWS_REGION || 'us-east-1';
        const credentials = endpoint ? {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test',
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'test',
        } : undefined;

        return new SQSClient({ region, endpoint, credentials });
      },
    },
  ],
  imports: [
    TypeOrmModule.forFeature([
      Customer,
      User,
      UserRoles,
      App,
      Templates,
      OrganizationStandards,
      OrganizationFrameworks,
      OrganizationTemplate,
      AppUser,
      ResetPasswordToken,
      Framework,
      Standard,
      TosHistory,
      SourceType,
      SourceV1,
      ApplicationControlEvidence,
      CustomerCsm,
      LicenseType,
      LicenseRule,
      SourceVersion,
      AppStandard,
      AssessmentDetail,
      SourceChunkMapping,
      ApplicationControlMapping,
      ApplicationControlEvidence,
      AsyncTask,
      StandardControlMapping,
      ApplicationControlMappingView,
      AuditFeedback,
      ControlChunkMapping,
      Control,
      ApplicationConnection,
    ]),
    forwardRef(() => AuthModule),
    NotificationsModule,
    HttpModule,
  ],
})
export class OnboardingModule {}
