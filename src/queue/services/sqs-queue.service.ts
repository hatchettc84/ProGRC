import { Injectable } from "@nestjs/common";
import {
  SQSClient,
  SendMessageCommand,
  DeleteMessageCommand,
  ReceiveMessageCommand,
} from "@aws-sdk/client-sqs";
import { BaseQueueService, QueueMessage } from "./base-queue.service";

@Injectable()
export class SQSQueueService implements BaseQueueService {
  private sqsClient: SQSClient;
  private queueUrl: string;

  constructor() {
    this.createClient(process.env.AWS_REGION, process.env.AWS_SQS_ENDPOINT);
  }

  configure(config: Record<string, any>): void {
    if (process.env.AWS_SQS_ENABLED === 'false') {
      this.queueUrl = undefined;
      return;
    }
    if (config.queueUrl) {
      this.queueUrl = config.queueUrl;
    }
    this.createClient(config.region || process.env.AWS_REGION, config.endpoint || process.env.AWS_SQS_ENDPOINT);
  }

  async connect(): Promise<void> {
    // SQS doesn't require explicit connection
  }

  async disconnect(): Promise<void> {
    // SQS doesn't require explicit disconnection
  }

  async receiveMessages(
    callback: (message: QueueMessage) => Promise<void>
  ): Promise<void> {
    if (!this.queueUrl) {
      return;
    }

    const command = new ReceiveMessageCommand({
      QueueUrl: this.queueUrl,
      MaxNumberOfMessages: 10,
      WaitTimeSeconds: 5,
    });

    const response = await this.sqsClient.send(command);

    if (response.Messages) {
      for (const message of response.Messages) {
        try {
          const queueMessage: QueueMessage = {
            body: message.Body,
            receiptHandle: message.ReceiptHandle,
            messageId: message.MessageId,
          };
          await callback(queueMessage);
        } catch (error) {}
      }
    }
  }

  async deleteMessage(message: QueueMessage): Promise<void> {
    if (!this.queueUrl) return;
    if (!message.receiptHandle) return;

    const command = new DeleteMessageCommand({
      QueueUrl: this.queueUrl,
      ReceiptHandle: message.receiptHandle,
    });

    await this.sqsClient.send(command);
  }

  async sendMessage(message: any, type: string): Promise<void> {
    if (!this.queueUrl) return;
    const data = {
      payload: message,
      type,
    };

    const command = new SendMessageCommand({
      QueueUrl: this.queueUrl,
      MessageBody: JSON.stringify(data),
    });

    await this.sqsClient.send(command);
  }

  private createClient(region?: string, endpoint?: string) {
    const useLocalstack = (process.env.USE_LOCALSTACK || 'false') === 'true';
    const resolvedEndpoint = endpoint || (useLocalstack ? process.env.LOCALSTACK_ENDPOINT || 'http://localhost:4566' : undefined);
    const resolvedRegion = region || 'us-east-1';

    this.sqsClient = new SQSClient({
      region: resolvedRegion,
      endpoint: resolvedEndpoint,
      credentials: resolvedEndpoint
        ? {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'test',
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'test',
          }
        : undefined,
    });
  }
}
