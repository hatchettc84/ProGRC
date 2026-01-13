import { Module } from '@nestjs/common';
import { ProfilerService } from './profiler.service';
import { ProfilerController } from './profiler.controller';
import { ProfilerGateway } from './profiler.gateway';
import { ProfilerDashboardController } from './profiler-dashboard.controller';

console.log('🔧 ProfilerModule is being loaded');

@Module({
  providers: [
    ProfilerService,
    ProfilerGateway,
  ],
  controllers: [ProfilerController, ProfilerDashboardController],
  exports: [ProfilerService],
})
export class ProfilerModule {} 