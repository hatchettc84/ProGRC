import { DeleteMessageCommand, Message, SQSClient } from "@aws-sdk/client-sqs";
import { Injectable } from "@nestjs/common";
import { SqsMessageHandler } from "@ssut/nestjs-sqs";
import { ExportTrustCenterService } from "./service/exportTrustCenter.service";
import { LoggerService } from "src/logger/logger.service";

@Injectable()
export class AssessmentQueueHandler {
  constructor(
    private readonly sqsClient: SQSClient,
    private readonly exportTrustCenterService: ExportTrustCenterService,
    private readonly logger: LoggerService
  ) {}

  async handleMessage(message: Message) {
    const body = message ? JSON.parse(message.Body) : {};
    await this.processMessage(body, message);
    await this.deleteMessage(message);
  }

  async processMessage(body: any, message?: any) {
    switch (body.action) {
      case "TRUST_CENTER":
        console.log("Received TRUST_CENTER message:", body);
        await this.exportTrustCenterService.handle(body);
        break;
      default:
        if (message) {
          console.log("Received message:", message.Body);
        }
        break;
    }
  }

  private async deleteMessage(message: Message) {
    const deleteParams = {
      QueueUrl: process.env.EXPORT_ASSESSMENT_QUEUE_URL,
      ReceiptHandle: message.ReceiptHandle,
    };
    const output = await this.sqsClient.send(
      new DeleteMessageCommand(deleteParams)
    );
    console.log("Deleted message:", output);
  }
}
