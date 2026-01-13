import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { DiscoveryService, Reflector } from "@nestjs/core";
import { QUEUE_HANDLER_METADATA } from "../decorators/queue-handler.decorator";
import { BaseQueueService } from "./base-queue.service";
import { QUEUE_SERVICES } from "./queue-tokens";

@Injectable()
export class QueueHandlerService implements OnModuleInit {
  private isPolling = false;
  private handlers: Array<{
    instance: any;
    method: string;
    service: BaseQueueService;
    config: Record<string, any>;
  }> = [];

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly reflector: Reflector,
    @Inject(QUEUE_SERVICES)
    private readonly queueServices: BaseQueueService[]
  ) {}

  async onModuleInit() {
    await this.discoverHandlers();
    this.startPolling();
  }

  private async discoverHandlers() {
    const providers = this.discoveryService.getProviders();
    let found = false;
    for (const provider of providers) {
      if (!provider.instance) continue;
      const prototype = Object.getPrototypeOf(provider.instance);
      const methodNames = Object.getOwnPropertyNames(prototype).filter(
        (name) => {
          let valid = true;

          if (name === "constructor") {
            valid = false;
          }

          try {
            if (typeof prototype[name] !== "function") {
              valid = false;
            }
          } catch (error) {
            valid = false;
          }

          return valid;
        }
      );
      for (const methodName of methodNames) {
        const metadata = this.reflector.get(
          QUEUE_HANDLER_METADATA,
          prototype[methodName]
        );
        if (metadata) {
          found = true;
          const queueService = this.getQueueService(metadata.type);
          if (queueService) {
            queueService.configure(metadata.config);
            this.handlers.push({
              instance: provider.instance,
              method: methodName,
              service: queueService,
              config: metadata.config,
            });
          } else {
          }
        }
      }
    }
  }

  private getQueueService(type: string): BaseQueueService | null {
    const service = this.queueServices.find((s) =>
      s.constructor.name.toLowerCase().includes(type.toLowerCase())
    );
    return service || null;
  }

  private async startPolling() {
    this.isPolling = true;
    await Promise.all(
      this.handlers.map((handler) => this.pollHandler(handler))
    );
  }

  private async pollHandler(handler: {
    instance: any;
    method: string;
    service: BaseQueueService;
    config: Record<string, any>;
  }) {
    while (this.isPolling) {
      try {
        await handler.service.receiveMessages(async (message) => {
          try {
            await handler.instance[handler.method](message.body);
            await handler.service.deleteMessage(message);
          } catch (error) {}
        });
      } catch (error) {
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }
  }
}
