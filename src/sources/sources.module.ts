import { SQSClient } from "@aws-sdk/client-sqs";
import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SqsModule } from "@ssut/nestjs-sqs";
import { AwsS3ConfigService } from "src/app/aws-s3-config.service";
import { UploadService } from "src/app/fileUpload.service";
import { AuthModule } from "src/auth/auth.module";
import { UpdateComplianceService } from "src/compliance/service/updateCompliance.service";
import { App } from "src/entities/app.entity";
import { AppStandard } from "src/entities/appStandard.entity";
import { AppUser } from "src/entities/appUser.entity";
import { AsyncTask } from "src/entities/asyncTasks.entity";
import { Customer } from "src/entities/customer.entity";
import { SourceAsset } from "src/entities/source/applicationSourceType.entity";
import { Asset } from "src/entities/source/assets.entity";
//import { Source } from 'src/entities/source/source.entity';
import { SourceType } from "src/entities/source/sourceType.entity";
import { SourceVersion } from "src/entities/source/sourceVersion.entity";
import { User } from "src/entities/user.entity";
import { CreateDummyAssetService } from "./createDummyAsset.service";
import { LlmDocumentProcessorService } from "./llmDocumentProcessor.service";
import { SourcePolicyService } from "./sourcePolicy.service";
import { SourcesController } from "./sources.controller";
import { SourcesService } from "./sources.service";
import { CloudFrontService } from "src/app/cloudfront.service";
import { UploadedFileDetails } from "src/entities/uploadedFiles.entity";
import { SourceV1 } from "src/entities/source/sourceV1.entity";
import { ControlChunkMapping } from "src/entities/compliance/controlChunkMapping.entity";
import { SourceChunkMapping } from "src/entities/compliance/sourceChunkMapping.entity";
import { ControlEvidenceV2Service } from "src/compliance/service/controlEvidenceV2.service";
import { ApplicationControlMapping } from "src/entities/compliance/applicationControlMapping.entity";
import { ApplicationControlEvidence } from "src/entities/compliance/applicationControlEvidence.entity";
import { Control } from "src/entities/compliance/control.entity";
import { LoggerService } from "src/logger/logger.service";
import { StandardControlMapping } from "src/entities/compliance/standardControlMapping.entity";
import { FileDownloadService } from "src/app/fileDownload.service";
import { SourceTextService } from "./sourceText.service";
import { PolicyDetails } from "src/entities/policyDetails.entity";
import { ApplicationConnection } from "src/entities/connection/applicationConnections.entity";
import { Templates } from "src/entities/template.entity";
import { AssessmentDetail } from "src/entities/assessments/assessmentDetails.entity";
import { HttpModule } from "@nestjs/axios";
import { OllamaService } from "src/llms/ollama.service";
import { GeminiService } from "src/llms/gemini.service";
import { OpenAiService } from "src/llms/openAi.service";
import { GradientService } from "src/llms/gradient.service";
import { AiHelperService } from "src/common/services/ai-helper.service";
import { RecommendationModule } from "src/recommendation/recommendation.module";
import { PromptVariablesService } from "src/compliance/prompts/prompt-variables.service";
import { AssessmentHistoryService } from "src/compliance/history/assessment-history.service";
import { LLMOutputValidatorService } from "src/compliance/validation/llm-output-validator.service";
import { EvidenceSuggestionService } from "src/compliance/validation/evidence-suggestion.service";
import { Standard } from "src/entities/standard_v1.entity";
import { AssessmentHistory } from "src/entities/assessments/assessmentHistory.entity";
@Module({
  providers: [
    SourcesService,
    UploadService,
    AwsS3ConfigService,
    CreateDummyAssetService,
    LlmDocumentProcessorService,
    OllamaService,
    GeminiService,
    OpenAiService,
    GradientService,
    AiHelperService,
    PromptVariablesService,
    AssessmentHistoryService,
    LLMOutputValidatorService,
    EvidenceSuggestionService,
    UpdateComplianceService,
    SourcePolicyService,
    CloudFrontService,
    ControlEvidenceV2Service,
    LoggerService,
    FileDownloadService,
    SourceTextService,
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
  controllers: [SourcesController],
  imports: [
    TypeOrmModule.forFeature([
      Customer,
      App,
      SourceType,
      User,
      SourceVersion,
      AsyncTask,
      SourceAsset,
      Asset,
      AppStandard,
      AppUser,
      AsyncTask,
      UploadedFileDetails,
      SourceV1,
      ControlChunkMapping,
      SourceChunkMapping,
      ApplicationControlMapping,
      ApplicationControlEvidence,
      Control,
      StandardControlMapping,
      SourceVersion,
      PolicyDetails,
      ApplicationConnection,
      Templates,
      AssessmentDetail,
      Standard,
      AssessmentHistory
    ]),
    forwardRef(() => AuthModule),
    forwardRef(() => RecommendationModule),
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
    HttpModule,
  ],
  exports: [SourcesService, LlmDocumentProcessorService],
})
export class SourcesModule { }
