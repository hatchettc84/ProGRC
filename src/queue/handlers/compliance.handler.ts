import { Injectable } from "@nestjs/common";
import { LoggerService } from "src/logger/logger.service";
import { ComplianceMessageHandler } from "src/compliance/complianceMessage.handler";

@Injectable()
export class ComplianceHandler {
  constructor(
    private readonly logger: LoggerService,
    private readonly complianceMessageHandler: ComplianceMessageHandler
  ) {}

  async handle(payload: any) {
    try {
      await this.complianceMessageHandler.processMessage(payload);
    } catch (error) {
      this.logger.error("Error processing compliance:", error);
    }
  }
}
