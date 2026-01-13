import { Injectable, LoggerService } from "@nestjs/common";
import { CreateApplicationService } from "src/application/createApplication.service";

@Injectable()
export class AppCloneHandler {
  constructor(
    private readonly createApplicationService: CreateApplicationService
  ) {}

  async handle(payload: any) {
    try {
      await this.createApplicationService.processMessage(payload);
    } catch (error) {
      console.error("Error processing application clone:", error);
    }
  }
}
