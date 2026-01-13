import { Injectable } from "@nestjs/common";
import { LoggerService } from "src/logger/logger.service";
import { CreateAssessmentService } from "src/assessment/createAssessment.service";
import { AssessmentQueueHandler } from "src/assessment/assessmentQueue.handler";

@Injectable()
export class AssessmentPDFHandler {
  constructor(
    private readonly logger: LoggerService,
    private readonly assessmentQueueHandler: AssessmentQueueHandler
  ) {}

  async handle(payload: any) {
    try {
      await this.assessmentQueueHandler.processMessage(payload);
    } catch (error) {
      this.logger.error("Error processing assessment completion:", error);
    }
  }
}
