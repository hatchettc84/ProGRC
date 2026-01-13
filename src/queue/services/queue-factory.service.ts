import { Injectable } from "@nestjs/common";
import { BaseQueueService } from "./base-queue.service";
import { SQSQueueService } from "./sqs-queue.service";

@Injectable()
export class QueueFactoryService {
  constructor(private readonly sqsQueueService: SQSQueueService) {}

  getQueueService(config: {
    type: string;
    [key: string]: any;
  }): BaseQueueService {
    switch (config.type) {
      case "sqs":
        this.sqsQueueService.configure(config);
        return this.sqsQueueService;
      default:
        throw new Error(`Unknown queue type: ${config.type}`);
    }
  }
}
