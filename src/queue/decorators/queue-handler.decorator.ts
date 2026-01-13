import { SetMetadata } from "@nestjs/common";

export const QUEUE_HANDLER_METADATA = "queue:handler";

export type QueueType = "sqs" | "azure" | "rabbitmq" | "kafka";

export interface QueueHandlerOptions {
  type: QueueType;
  config: Record<string, any>; // Generic config object that can hold any queue-specific parameters
}

export const QueueHandler = (options: QueueHandlerOptions) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    SetMetadata(QUEUE_HANDLER_METADATA, {
      type: options.type,
      config: options.config,
      methodName: propertyKey,
    })(target, propertyKey, descriptor);
    return descriptor;
  };
};
