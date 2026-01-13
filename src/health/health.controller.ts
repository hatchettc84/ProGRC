import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, TypeOrmHealthIndicator, MemoryHealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private memory: MemoryHealthIndicator,
  ) {}

  private async versionCheck(): Promise<HealthIndicatorResult> {
    // Make version check non-critical - it's optional
    const version = process.env.VERSION || '1.0.0';
    const result: HealthIndicatorResult = {
      version: {
        status: 'up',
        details: { Version: version },
      },
    };
    return result;
  }

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      async () => this.db.pingCheck('database'),
      // async () => this.memory.checkHeap('memory_heap', 2000 * 1024 * 1024), // 2000MB max heap
      async () => this.versionCheck(),
    ]);
  }
}
