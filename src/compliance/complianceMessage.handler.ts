import { DeleteMessageCommand, Message, SQSClient } from "@aws-sdk/client-sqs";
import { Injectable } from "@nestjs/common";
import { SqsMessageHandler } from "@ssut/nestjs-sqs";
import { UpdateComplianceService } from "./service/updateCompliance.service";
import { LoggerService } from "src/logger/logger.service";
import { TaskOps } from "src/entities/asyncTasks.entity";
import { CrmService } from "./service/crm.service";

@Injectable()
export class ComplianceMessageHandler {
  constructor(
    private readonly updateComplianceService: UpdateComplianceService,
    private readonly sqsClient: SQSClient,
    private readonly logger: LoggerService,
    private readonly crmService: CrmService
  ) {}

  async handleMessageV2(message: Message) {
    try {
      const messageBody = message.Body;
      const messageParsed = JSON.parse(messageBody);
      await this.processMessage(messageParsed);
    } catch (error) {
      this.logger.error("Error processing SQS message:", error, message);
    } finally {
      await this.deleteMessage(
        message,
        process.env.SQS_COMPLIANCE_V2_RESPONSE_QUEUE_URL
      );
    }
  }

  async processMessage(body: any) {
    if (
      body &&
      body?.messageType &&
      body?.messageType.toString() === TaskOps.PROCESS_CRM.toString()
    ) {
      await this.crmService.processCrm(body);
    } else {
      await this.updateComplianceService.processComplianceV2(body);
    }
  }

  private async deleteMessage(message: any, queueUrl: string) {
    this.logger.log("deleting sqs compliance", message);
    try {
      const deleteParams = {
        QueueUrl: queueUrl,
        ReceiptHandle: message.ReceiptHandle,
      };
      await this.sqsClient.send(new DeleteMessageCommand(deleteParams));
      this.logger.log("sqs compliance deleted", message);
    } catch (error) {
      this.logger.log("failed to delete compliance because", error, message);
    }
  }
}
