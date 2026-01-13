import { SQSClient } from "@aws-sdk/client-sqs";
import { forwardRef, MiddlewareConsumer, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SqsModule } from "@ssut/nestjs-sqs";
import { AwsS3ConfigService } from "src/app/aws-s3-config.service";
import { CloudFrontService } from "src/app/cloudfront.service";
import { UploadService } from "src/app/fileUpload.service";
import { ApplicationPolicyService } from "src/application/applicationPolicy.service";
import { AuthModule } from "src/auth/auth.module";
import { App } from "src/entities/app.entity";
import { AppStandard } from "src/entities/appStandard.entity";
import { AppUser } from "src/entities/appUser.entity";
import { AsyncTask } from "src/entities/asyncTasks.entity";
import { ApplicationControlEvidence } from "src/entities/compliance/applicationControlEvidence.entity";
import { ApplicationControlMapping } from "src/entities/compliance/applicationControlMapping.entity";
import { Control } from "src/entities/compliance/control.entity";
import { ControlChunkMapping } from "src/entities/compliance/controlChunkMapping.entity";
import { SourceChunkMapping } from "src/entities/compliance/sourceChunkMapping.entity";
import { StandardControlMapping } from "src/entities/compliance/standardControlMapping.entity";
import { CrmData } from "src/entities/compliance/crmData.entity";
import { Customer } from "src/entities/customer.entity";
import { Asset } from "src/entities/source/assets.entity";
//import { Source } from "src/entities/source/source.entity";
import { SourceV1 } from "src/entities/source/sourceV1.entity";
import { SourceVersion } from "src/entities/source/sourceVersion.entity";
//import { Standards } from "src/entities/standard.entity";
import { Standard } from "src/entities/standard_v1.entity";
import { User } from "src/entities/user.entity";
import { ApplicationComplianceController } from "./applicationCompliance.controller";
import { ComplianceMessageHandler } from "./complianceMessage.handler";
import { ComplianceV2Controller } from "./complianceV2.controller";
import { CrmController } from "./crm.controller";
//import { ComplianceWebhookController } from "./complianceWebhook.controller";
//import { ControlDetailsRepository } from "./controlDetails.repository";
//import { AppStandardControlService } from "./service/appStandardControl.service";
import { CompliancePolicy } from "./service/compliance.policy";
import { ControlEvidenceV2Service } from "./service/controlEvidenceV2.service";
import { ControlExceptionV2Service } from "./service/controlExceptionV2.service";
import { EnhancementEvidenceService } from "./service/enhancementEvidence.service";
import { GetComplianceV2Service } from "./service/getComplianceV2.service";
import { GetControlEnhancementV2Service } from "./service/getControlEnhancementV2.service";
import { GetReferenceV2Service } from "./service/getReferenceV2Service.service";
import { GetSourceV2Service } from "./service/getSource.service";
import { GetStandardControlV2Service } from "./service/getStandardControlV2.service";
import { SetRiskLevelV2Service } from "./service/setRiskLevelV2.service";
import { SyncComplianceV2Service } from "./service/syncComplianceV2.service";
import { UpdateComplianceService } from "./service/updateCompliance.service";
import { GetControlDetailsService } from "./service/getControlDetails.service";
import { CrmService } from "./service/crm.service";
import { ApplicationControlRecommendation } from "src/entities/recommendation/applicationControlRecommendation.entity";
import { LoggerService } from "src/logger/logger.service";
import { SourceType } from "src/entities/source/sourceType.entity";
import { FileDownloadService } from "src/app/fileDownload.service";
import { AuditService } from "src/audit/audit/audit.service";
import { AuditFeedback } from "src/entities/auditFeedback.entity";
import { UserComment } from "src/entities/userComment.entity";
import { GetControlEvaluationService } from "./service/getControlEvaluation.service";
import { ControlEvaluationResult } from "src/entities/controlEvaluation.entity";
import { PolicyDetails } from "src/entities/policyDetails.entity";
import { Templates } from "src/entities/template.entity";
import { AssessmentDetail } from "src/entities/assessments/assessmentDetails.entity";
import { ApplicationControlMappingView } from "src/entities/compliance/applicationControlMappingView.entity";
import { GeminiService } from "src/llms/gemini.service";
import { GradientService } from "src/llms/gradient.service";
import { OpenAiService } from "src/llms/openAi.service";
import { OllamaService } from "src/llms/ollama.service";
import { AiHelperService } from "src/common/services/ai-helper.service";
import { HttpModule } from "@nestjs/axios";
import { RecommendationModule } from "src/recommendation/recommendation.module";
import { PromptVariablesService } from "./prompts/prompt-variables.service";
import { LLMOutputValidatorService } from "./validation/llm-output-validator.service";
import { EvidenceSuggestionService } from "./validation/evidence-suggestion.service";
import { AssessmentHistoryService } from "./history/assessment-history.service";
import { AutoRemediationService } from "./automation/auto-remediation.service";
import { POAMGenerationService } from "./automation/poam-generation.service";

@Module({
  controllers: [
    ApplicationComplianceController,
    ComplianceV2Controller,
    CrmController,
  ],
  providers: [
    ApplicationPolicyService,
    CompliancePolicy,
    EnhancementEvidenceService,
    UploadService,
    AwsS3ConfigService,
    UpdateComplianceService,
    ComplianceMessageHandler,
    GetComplianceV2Service,
    SyncComplianceV2Service,
    GetStandardControlV2Service,
    GetControlEnhancementV2Service,
    ControlEvidenceV2Service,
    ControlExceptionV2Service,
    GetSourceV2Service,
    GetReferenceV2Service,
    SetRiskLevelV2Service,
    CloudFrontService,
    GetControlDetailsService,
    LoggerService,
    FileDownloadService,
    AuditService,
    GetControlEvaluationService,
    CrmService,
    GeminiService,
    GradientService,
    OpenAiService,
    OllamaService,
    AiHelperService,
    PromptVariablesService,
    LLMOutputValidatorService,
    EvidenceSuggestionService,
    AssessmentHistoryService,
    AutoRemediationService,
    POAMGenerationService,
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
      App,
      AppUser,
      AppStandard,
      Asset,
      Customer,
      AsyncTask,
      SourceVersion,
      User,
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
      PolicyDetails,
      CrmData,
      Templates,
      AssessmentDetail,
      ApplicationControlMappingView,
    ]),
    forwardRef(() => AuthModule),
    forwardRef(() => RecommendationModule),
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
      },
    }),
  ],
  exports: [
    CrmService, // Export the CrmService so it can be used by other modules if needed
    ComplianceMessageHandler,
  ],
})
export class ComplianceModule { }
