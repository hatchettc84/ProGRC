import { Injectable, LoggerService } from "@nestjs/common";
import { CreateAssessmentService } from "src/assessment/createAssessment.service";

@Injectable()
export class AssessmentHandler {
  constructor(
    private readonly createAssessmentService: CreateAssessmentService
  ) {}

  async handle(payload: any) {
    try {
      await this.createAssessmentService.processMessage(payload);
    } catch (error) {
      console.error("Error processing assessment:", error);
    }
  }
}
