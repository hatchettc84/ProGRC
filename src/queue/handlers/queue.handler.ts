import { Injectable } from "@nestjs/common";
import { QueueHandler } from "../decorators/queue-handler.decorator";
import { AppCloneHandler } from "./appclone.handler";
import { LoggerService } from "src/logger/logger.service";
import { AssessmentHandler } from "./assessment.handler";
import { AssessmentPDFHandler } from "./assessment-pdf.handler";
import { ComplianceHandler } from "./compliance.handler";
import { PolicyHandler } from "./policy.handler";
import { ArtifactHandler } from "./artifact.handler";

@Injectable()
export class MessageQueueHandler {
  constructor(
    private readonly appCloneHandler: AppCloneHandler,
    private readonly artifactHandler: ArtifactHandler,
    private readonly assessmentHandler: AssessmentHandler,
    private readonly complianceHandler: ComplianceHandler,
    private readonly policyHandler: PolicyHandler,
    private readonly assessmentPDFHandler: AssessmentPDFHandler,
    private readonly logger: LoggerService
  ) {}

  @QueueHandler({
    type: "sqs",
    config: {
      queueUrl: process.env.BACKEND_QUEUE,
      region: process.env.AWS_REGION,
    },
  })
  async handle(message: any) {
    try {
      const data = JSON.parse(message);
      const { type, payload } = data;
      if (!type || !payload) {
        throw new Error("Missing required fields in message");
      }
      switch (type) {
        case "app-clone":
          await this.appCloneHandler.handle(payload);
          break;
        case "artifacts":
          await this.artifactHandler.handle(payload);
          break;
        case "assessment":
          await this.assessmentHandler.handle(payload);
          break;
        case "compliance":
          await this.complianceHandler.handle(payload);
          break;
        case "policy":
          await this.policyHandler.handle(payload);
          break;
        case "assessment-pdf":
          await this.assessmentPDFHandler.handle(payload);
          break;
      }
    } catch (error) {
      console.log("Error in processing queue message", error);
      this.logger.error("Error processing message:", error);
    }
  }
}
