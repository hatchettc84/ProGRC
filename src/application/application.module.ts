import { forwardRef, MiddlewareConsumer, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SqsModule } from "@ssut/nestjs-sqs";
import { AuthModule } from "src/auth/auth.module";
import { App } from "src/entities/app.entity";
import { AppStandard } from "src/entities/appStandard.entity";
import { AppUser } from "src/entities/appUser.entity";
import { AssessmentDetail } from "src/entities/assessments/assessmentDetails.entity";
import { AssessmentHistory } from "src/entities/assessments/assessmentHistory.entity";
import { AsyncTask } from "src/entities/asyncTasks.entity";
import { Customer } from "src/entities/customer.entity";
import { OrganizationStandards } from "src/entities/orgnizationStandards.entity";
import { User } from "src/entities/user.entity";
import { ApplicationController } from "./application.controller";
import { ApplicationPolicyService } from "./applicationPolicy.service";
import { CreateApplicationService } from "./createApplication.service";
import { DeleteApplicationService } from "./deleteApplication.service";
import { GetApplicationService } from "./getApplication.service";
import { GetAsyncTaskPendingService } from "./getAsyncTaskPending.service";
import { ManageMemberService } from "./manageMember.service";
import { UpdateApplicationService } from "./updateApplication.service";
import { SourceV1 } from "src/entities/source/sourceV1.entity";
import { Control } from "src/entities/compliance/control.entity";
import { Standard } from "src/entities/standard_v1.entity";
import { ApplicationControlMapping } from "src/entities/compliance/applicationControlMapping.entity";
import { GetStandardControlV2Service } from "src/compliance/service/getStandardControlV2.service";
import { StandardControlMapping } from "src/entities/compliance/standardControlMapping.entity";
import { SyncComplianceV2Service } from "src/compliance/service/syncComplianceV2.service";
import { SourceVersion } from "src/entities/source/sourceVersion.entity";
import { ControlChunkMapping } from "src/entities/compliance/controlChunkMapping.entity";
import { SourceChunkMapping } from "src/entities/compliance/sourceChunkMapping.entity";
import { ApplicationControlRecommendation } from "src/entities/recommendation/applicationControlRecommendation.entity";
import { RequestMiddleware } from "src/middlewares/request.middleware";
import { LoggerService } from "src/logger/logger.service";
import { RequestContextService } from "src/request-context/request-context.service";
import { AwsS3ConfigService } from "src/app/aws-s3-config.service";
import { SourcesService } from "src/sources/sources.service";
import { SourceType } from "src/entities/source/sourceType.entity";
import { SourceAsset } from "src/entities/source/applicationSourceType.entity";
import { Asset } from "src/entities/source/assets.entity";
import { UploadService } from "src/app/fileUpload.service";
import { CreateDummyAssetService } from "src/sources/createDummyAsset.service";
import { SQSClient } from "@aws-sdk/client-sqs";
import { FileDownloadService } from "src/app/fileDownload.service";
import { SourcePolicyService } from "src/sources/sourcePolicy.service";
import { ApplicationControlEvidence } from "src/entities/compliance/applicationControlEvidence.entity";
import { LicenseType } from "src/entities/lincenseType.entity";
import { LicenseRule } from "src/entities/licenseRule.entity";
import { AuditService } from "src/audit/audit/audit.service";
import { AuditFeedback } from "src/entities/auditFeedback.entity";
import { UserComment } from "src/entities/userComment.entity";
import { AiHelperService } from "src/common/services/ai-helper.service";
import { GeminiService } from "src/llms/gemini.service";
import { GradientService } from "src/llms/gradient.service";
import { OpenAiService } from "src/llms/openAi.service";
import { OllamaService } from "src/llms/ollama.service";
import { HttpModule } from "@nestjs/axios";
import { ControlEvaluationResult } from "src/entities/controlEvaluation.entity";
import { ApplicationConnection } from "src/entities/connection/applicationConnections.entity";
import { CrmData } from "src/entities/compliance/crmData.entity";
import { Templates } from "src/entities/template.entity";
import { ApplicationControlMappingView } from "src/entities/compliance/applicationControlMappingView.entity";
import { ApplicationQueueHandler } from "./applicationQueue.handler";
import { SourcesModule } from "src/sources/sources.module";

@Module({
  controllers: [ApplicationController],
  exports: [CreateApplicationService],
  providers: [
    GetApplicationService,
    CreateApplicationService,
    ManageMemberService,
    UpdateApplicationService,
    ApplicationPolicyService,
    DeleteApplicationService,
    GetAsyncTaskPendingService,
    GetStandardControlV2Service,
    SyncComplianceV2Service,
    LoggerService,
    AwsS3ConfigService,
    UploadService,
    CreateDummyAssetService,
    FileDownloadService,
    SourcePolicyService,
    AuditService,
    AiHelperService,
    GeminiService,
    GradientService,
    OpenAiService,
    OllamaService,
    ApplicationQueueHandler,
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
    SourcesModule,
    TypeOrmModule.forFeature([
      Customer,
      App,
      AppUser,
      OrganizationStandards,
      AppStandard,
      User,
      AssessmentHistory,
      AssessmentDetail,
      AsyncTask,
      SourceV1,
      Control,
      Standard,
      ApplicationControlMapping,
      StandardControlMapping,
      SourceVersion,
      ControlChunkMapping,
      SourceChunkMapping,
      ApplicationControlRecommendation,
      SourceType,
      SourceAsset,
      Asset,
      ApplicationControlEvidence,
      LicenseType,
      LicenseRule,
      AuditFeedback,
      UserComment,
      ControlEvaluationResult,
      ApplicationConnection,
      CrmData,
      Templates,
      ApplicationControlMappingView,
    ]),
    forwardRef(() => AuthModule),
    SourcesModule,
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
        };
      },
    }),
  ],
})
export class ApplicationModule {}
