import { Controller, Get, Post, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProfilerService, ProfilerStats } from './profiler.service';
import { StandardResponse } from '../common/dto/standardResponse.dto';

@ApiTags('profiler')
@Controller('profiler')
export class ProfilerController {
  constructor(private readonly profilerService: ProfilerService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get current profiler statistics' })
  @ApiResponse({ status: 200, description: 'Profiler statistics retrieved successfully' })
  async getStats(): Promise<StandardResponse<ProfilerStats>> {
    try {
      const stats = this.profilerService.getStats();
      return StandardResponse.success('Profiler statistics retrieved successfully', stats);
    } catch (error) {
      console.error('Failed to get profiler stats:', error);
      return StandardResponse.error('Failed to retrieve profiler statistics', error.message);
    }
  }

  @Get('system-info')
  @ApiOperation({ summary: 'Get system information' })
  @ApiResponse({ status: 200, description: 'System information retrieved successfully' })
  async getSystemInfo(): Promise<StandardResponse<any>> {
    try {
      const systemInfo = await this.profilerService.getSystemInfo();
      return StandardResponse.success('System information retrieved successfully', systemInfo);
    } catch (error) {
      console.error('Failed to get system info:', error);
      return StandardResponse.error('Failed to retrieve system information', error.message);
    }
  }

  @Post('heap-snapshot')
  @ApiOperation({ summary: 'Generate a manual heap snapshot' })
  @ApiResponse({ status: 200, description: 'Heap snapshot generated successfully' })
  async generateHeapSnapshot(): Promise<StandardResponse<{ snapshotPath: string }>> {
    try {
      const snapshotPath = await this.profilerService.forceHeapSnapshot();
      return StandardResponse.success('Heap snapshot generated successfully', { snapshotPath });
    } catch (error) {
      console.error('Failed to generate heap snapshot:', error);
      return StandardResponse.error('Failed to generate heap snapshot', error.message);
    }
  }

  @Post('start-monitoring')
  @ApiOperation({ summary: 'Start profiler monitoring' })
  @ApiResponse({ status: 200, description: 'Monitoring started successfully' })
  async startMonitoring(): Promise<StandardResponse<{ message: string }>> {
    try {
      this.profilerService.startMonitoring();
      return StandardResponse.success('Profiler monitoring started successfully', { 
        message: 'Monitoring is now active' 
      });
    } catch (error) {
      console.error('Failed to start monitoring:', error);
      return StandardResponse.error('Failed to start monitoring', error.message);
    }
  }

  @Post('stop-monitoring')
  @ApiOperation({ summary: 'Stop profiler monitoring' })
  @ApiResponse({ status: 200, description: 'Monitoring stopped successfully' })
  async stopMonitoring(): Promise<StandardResponse<{ message: string }>> {
    try {
      this.profilerService.stopMonitoring();
      return StandardResponse.success('Profiler monitoring stopped successfully', { 
        message: 'Monitoring has been stopped' 
      });
    } catch (error) {
      console.error('Failed to stop monitoring:', error);
      return StandardResponse.error('Failed to stop monitoring', error.message);
    }
  }

  @Delete('snapshots')
  @ApiOperation({ summary: 'Clear all profiler snapshots' })
  @ApiResponse({ status: 200, description: 'Snapshots cleared successfully' })
  async clearSnapshots(): Promise<StandardResponse<{ message: string }>> {
    try {
      this.profilerService.clearSnapshots();
      return StandardResponse.success('Profiler snapshots cleared successfully', { 
        message: 'All snapshots have been cleared' 
      });
    } catch (error) {
      console.error('Failed to clear snapshots:', error);
      return StandardResponse.error('Failed to clear snapshots', error.message);
    }
  }

  @Get('memory-usage')
  @ApiOperation({ summary: 'Get current memory usage' })
  @ApiResponse({ status: 200, description: 'Memory usage retrieved successfully' })
  async getMemoryUsage(): Promise<StandardResponse<any>> {
    try {
      const memoryUsage = process.memoryUsage();
      const formatBytes = (bytes: number): string => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
      };

      const formattedUsage = {
        raw: memoryUsage,
        formatted: {
          heapUsed: formatBytes(memoryUsage.heapUsed),
          heapTotal: formatBytes(memoryUsage.heapTotal),
          external: formatBytes(memoryUsage.external),
          rss: formatBytes(memoryUsage.rss),
          arrayBuffers: formatBytes(memoryUsage.arrayBuffers),
        },
        timestamp: new Date().toISOString(),
      };

      return StandardResponse.success('Memory usage retrieved successfully', formattedUsage);
    } catch (error) {
      console.error('Failed to get memory usage:', error);
      return StandardResponse.error('Failed to retrieve memory usage', error.message);
    }
  }
} 