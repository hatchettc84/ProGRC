import { SQSClient } from "@aws-sdk/client-sqs";
import { forwardRef, MiddlewareConsumer, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SqsModule } from "@ssut/nestjs-sqs";
import { AwsS3ConfigService } from "src/app/aws-s3-config.service";
import { UploadService } from "src/app/fileUpload.service";
import { AuthModule } from "src/auth/auth.module";
import { App } from "src/entities/app.entity";
import { AppStandard } from "src/entities/appStandard.entity";
import { AppUser } from "src/entities/appUser.entity";
import { AssessmentDetail } from "src/entities/assessments/assessmentDetails.entity";
import { AssessmentHistory } from "src/entities/assessments/assessmentHistory.entity";
import { AssessmentOutline } from "src/entities/assessments/assessmentOutline.entity";
import { AssessmentSections } from "src/entities/assessments/assessmentSections.entity";
import { AssessmentSectionsHistory } from "src/entities/assessments/assessmentSectionsHistory.entity";
import { AsyncTask } from "src/entities/asyncTasks.entity";
import { Customer } from "src/entities/customer.entity";
import { OrganizationTemplate } from "src/entities/organizationTemplate.entity";
import { OrganizationStandards } from "src/entities/orgnizationStandards.entity";
//import { Standards } from 'src/entities/standard.entity';
import { Templates } from "src/entities/template.entity";
import { TemplateSection } from "src/entities/templatesSection.entity";
import { TrustCenter } from "src/entities/trustCenter.entity";
import { User } from "src/entities/user.entity";
import { AssessmentController } from "./assessment.controller";
import { AssessmentService } from "./assessment.service";
import { AssessmentQueueHandler } from "./assessmentQueue.handler";
import { AssessmentWebhookController } from "./assessmentWebhook.controller";
import { CreateAssessmentService } from "./createAssessment.service";
import { AssessmentPolicyService } from "./service/assessmentPolicy.service";
import { AssessmentsWebhookService } from "./service/assessmentsWebhook.service";
import { AssessmentToPDF } from "./service/assessmentToPdf.service";
import { CreateTrusCenter } from "./service/createTrustCenter.service";
import { ExportTrustCenterService } from "./service/exportTrustCenter.service";
import { Standard } from "src/entities/standard_v1.entity";
import { Framework } from "src/entities/framework.entity";
import { CustomAssessmentTemplateProcessor } from "./service/customAssessmentTemplateProcessor.service";
import { StandardControlMapping } from "src/entities/compliance/standardControlMapping.entity";
import { ApplicationControlMapping } from "src/entities/compliance/applicationControlMapping.entity";
import { SourceChunkMapping } from "src/entities/compliance/sourceChunkMapping.entity";
import { ControlChunkMapping } from "src/entities/compliance/controlChunkMapping.entity";
import { Control } from "src/entities/compliance/control.entity";
import { LoggerService } from "src/logger/logger.service";
import { RequestContextService } from "src/request-context/request-context.service";
import { RequestMiddleware } from "src/middlewares/request.middleware";
import { SourceType } from "src/entities/source/sourceType.entity";
import { ApplicationControlEvidence } from "src/entities/compliance/applicationControlEvidence.entity";
import { SourceV1 } from "src/entities/source/sourceV1.entity";
import { LicenseRule } from "src/entities/licenseRule.entity";
import { LicenseType } from "src/entities/lincenseType.entity";
import { UserComment } from "src/entities/userComment.entity";
import { SourceVersion } from "src/entities/source/sourceVersion.entity";
import { FileDownloadService } from "src/app/fileDownload.service";
import { PromptVariablesModule } from "src/prompt-variables/prompt-variables.module";

@Module({
  providers: [
    AssessmentService,
    CreateAssessmentService,
    AssessmentsWebhookService,
    SQSClient,
    AssessmentToPDF,
    CreateTrusCenter,
    UploadService,
    AwsS3ConfigService,
    ExportTrustCenterService,
    AssessmentQueueHandler,
    AssessmentPolicyService,
    CustomAssessmentTemplateProcessor,
    LoggerService,
    FileDownloadService,
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
  exports: [CreateAssessmentService, AssessmentQueueHandler],
  controllers: [AssessmentController, AssessmentWebhookController],
  imports: [
    TypeOrmModule.forFeature([
      Customer,
      User,
      App,
      OrganizationTemplate,
      OrganizationStandards,
      Templates,
      AppStandard,
      AssessmentDetail,
      AssessmentOutline,
      AssessmentHistory,
      AssessmentSections,
      AssessmentSectionsHistory,
      AsyncTask,
      TemplateSection,
      TrustCenter,
      AppUser,
      Standard,
      Framework,
      StandardControlMapping,
      ApplicationControlMapping,
      Control,
      SourceChunkMapping,
      ControlChunkMapping,
      SourceType,
      ApplicationControlEvidence,
      SourceV1,
      LicenseRule,
      LicenseType,
      UserComment,
      SourceVersion,
    ]),
    forwardRef(() => AuthModule),
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
    PromptVariablesModule,
  ],
})
export class AssessmentModule {}
