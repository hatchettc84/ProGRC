import { DeleteMessageCommand, Message, SQSClient } from '@aws-sdk/client-sqs';
import { Injectable } from "@nestjs/common";
import { SqsMessageHandler } from "@ssut/nestjs-sqs";
import { LoggerService } from 'src/logger/logger.service';
import { CreateApplicationService } from './createApplication.service';

@Injectable()
export class ApplicationQueueHandler {
    constructor(
        private readonly sqsClient: SQSClient,
        private readonly createApplicationService: CreateApplicationService,
        private readonly logger: LoggerService
    ) { }

    async handleMessage(message: Message) {
        try {
            const body = message ? JSON.parse(message.Body) : {};
            const { taskId, appId, customerId, userId, newName } = body;

            if (!taskId || !appId || !customerId || !userId) {
                throw new Error('Missing required fields in message');
            }

            await this.createApplicationService.processApplicationClone({
                taskId,
                appId,
                customerId,
                userId,
                newName
            });

            await this.deleteMessage(message);
        } catch (error) {
            this.logger.error('Error processing application clone message:', error);
            throw error;
        }
    }

    private async deleteMessage(message: Message) {
        const deleteParams = {
            QueueUrl: process.env.APP_CLONE_QUEUE_URL,
            ReceiptHandle: message.ReceiptHandle,
        };
        await this.sqsClient.send(new DeleteMessageCommand(deleteParams));
        this.logger.info('Deleted message:', message.MessageId);
    }
} 