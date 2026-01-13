import { Injectable } from "@nestjs/common";
import { LoggerService } from "src/logger/logger.service";
import { SourcesService } from "src/sources/sources.service";

@Injectable()
export class ArtifactHandler {
  constructor(
    private readonly sourcesService: SourcesService,
    private readonly logger: LoggerService
  ) {}

  async handle(payload: any) {
    try {
      await this.sourcesService.processMessage(payload);
    } catch (error) {
      this.logger.error("Error processing artifact:", error);
    }
  }
}
