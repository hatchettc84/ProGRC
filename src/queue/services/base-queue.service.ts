export interface QueueMessage {
  body: any;
  receiptHandle?: string;
  messageId?: string;
}

export interface BaseQueueService {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  receiveMessages(
    callback: (message: QueueMessage) => Promise<void>
  ): Promise<void>;
  deleteMessage(message: QueueMessage): Promise<void>;
  sendMessage(message: any, type: string): Promise<void>;
  configure(config: Record<string, any>): void;
}
