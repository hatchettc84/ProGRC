import { Module } from "@nestjs/common";
import { DiscoveryModule } from "@nestjs/core";
import { QueueHandlerService } from "./services/queue-handler.service";
import { SQSQueueService } from "./services/sqs-queue.service";
import { MessageQueueHandler } from "./handlers/queue.handler";
import { QUEUE_SERVICES } from "./services/queue-tokens";
import { QueueFactoryService } from "./services/queue-factory.service";
import { LoggerService } from "src/logger/logger.service";
import { AppCloneHandler } from "./handlers/appclone.handler";
import { ApplicationModule } from "src/application/application.module";
import { SourcesModule } from "src/sources/sources.module";
import { ArtifactHandler } from "./handlers/artifact.handler";
import { AssessmentHandler } from "./handlers/assessment.handler";
import { AssessmentModule } from "src/assessment/assessment.module";
import { ComplianceHandler } from "./handlers/compliance.handler";
import { ComplianceModule } from "src/compliance/compliance.module";
import { PolicyHandler } from "./handlers/policy.handler";
import { PolicyModule } from "src/policy/policy.module";
import { AssessmentPDFHandler } from "./handlers/assessment-pdf.handler";

@Module({
  imports: [
    DiscoveryModule,
    ApplicationModule,
    SourcesModule,
    AssessmentModule,
    ComplianceModule,
    PolicyModule,
  ],
  providers: [
    QueueHandlerService,
    SQSQueueService,
    MessageQueueHandler,
    QueueFactoryService,
    LoggerService,
    AppCloneHandler,
    ArtifactHandler,
    AssessmentHandler,
    ComplianceHandler,
    PolicyHandler,
    AssessmentPDFHandler,
    {
      provide: QUEUE_SERVICES,
      useFactory: (sqs: SQSQueueService) => [sqs],
      inject: [SQSQueueService],
    },
  ],
  exports: [QueueHandlerService, QueueFactoryService, SQSQueueService],
})
export class QueueModule {
  constructor() {}
}
