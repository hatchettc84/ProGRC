import { Injectable } from "@nestjs/common";
import { LoggerService } from "src/logger/logger.service";
import { PolicyService } from "src/policy/policy.service";

@Injectable()
export class PolicyHandler {
  constructor(
    private readonly logger: LoggerService,
    private readonly policyService: PolicyService
  ) {}

  async handle(payload: any) {
    try {
      await this.policyService.processMessage(payload);
    } catch (error) {
      this.logger.error("Error processing policy:", error);
    }
  }
}
