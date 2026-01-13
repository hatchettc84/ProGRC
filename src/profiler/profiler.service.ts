import { Injectable, Logger, OnModuleInit, OnModuleDestroy, Inject, forwardRef } from '@nestjs/common';
import * as pidusage from 'pidusage';
import * as si from 'systeminformation';
import * as fs from 'fs';
import * as path from 'path';

export interface MemorySnapshot {
  timestamp: number;
  heapUsed: number;
  heapTotal: number;
  external: number;
  rss: number;
  arrayBuffers: number;
}

export interface CPUSnapshot {
  timestamp: number;
  cpu: number;
  memory: number;
  pid: number;
}

export interface ProfilerStats {
  memorySnapshots: MemorySnapshot[];
  cpuSnapshots: CPUSnapshot[];
  memoryLeakDetected: boolean;
  memoryTrend: 'increasing' | 'decreasing' | 'stable';
  averageCPU: number;
  peakMemory: number;
}

@Injectable()
export class ProfilerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ProfilerService.name);
  private profilerGateway: any;
  private memorySnapshots: MemorySnapshot[] = [];
  private cpuSnapshots: CPUSnapshot[] = [];
  private monitoringInterval: NodeJS.Timeout;
  private heapSnapshotInterval: NodeJS.Timeout;
  private isMonitoring = false;
  private readonly maxSnapshots = 1000; // Keep last 1000 snapshots
  private readonly monitoringIntervalMs = 5000; // 5 seconds
  private readonly heapSnapshotIntervalMs = 60000; // 1 minute
  private readonly memoryLeakThreshold = 50 * 1024 * 1024; // 50MB increase threshold
  private readonly profilesDir = path.join(process.cwd(), 'profiles');

  async onModuleInit() {
    // Only start profiling in development or local environments
    if (this.shouldEnableProfiling()) {
      this.logger.log('🔍 Profiler enabled for development environment');
      // await this.ensureProfilesDirectory();
      // this.startMonitoring();
    } else {
      this.logger.log('Profiler disabled for production environment');
    }
  }

  onModuleDestroy() {
    this.stopMonitoring();
  }

  private shouldEnableProfiling(): boolean {
    const env = process.env.NODE_ENV || 'development';
    const isLocal = process.env.IS_LOCAL === 'true';
    const isDev = env === 'development' || env === 'dev';
    
    return isDev || isLocal;
  }

  private async ensureProfilesDirectory() {
    try {
      if (!fs.existsSync(this.profilesDir)) {
        fs.mkdirSync(this.profilesDir, { recursive: true });
        this.logger.log(`Created profiles directory: ${this.profilesDir}`);
      }
    } catch (error) {
      this.logger.error('Failed to create profiles directory', error);
    }
  }

  startMonitoring() {
    if (this.isMonitoring) {
      this.logger.warn('Monitoring is already active');
      return;
    }

    this.isMonitoring = true;
    this.logger.log('🚀 Starting memory and CPU monitoring...');

    // Memory and CPU monitoring
    this.monitoringInterval = setInterval(async () => {
      await this.captureSnapshot();
    }, this.monitoringIntervalMs);

    // Heap snapshot generation (less frequent)
    this.heapSnapshotInterval = setInterval(() => {
      this.generateHeapSnapshot();
    }, this.heapSnapshotIntervalMs);

    // Initial snapshot
    this.captureSnapshot();
  }

  stopMonitoring() {
    if (!this.isMonitoring) {
      return;
    }

    this.isMonitoring = false;
    this.logger.log('⏹️ Stopping profiler monitoring...');

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    if (this.heapSnapshotInterval) {
      clearInterval(this.heapSnapshotInterval);
    }
  }

  private async captureSnapshot() {
    try {
      const timestamp = Date.now();
      
      // Capture memory usage
      const memoryUsage = process.memoryUsage();
      const memorySnapshot: MemorySnapshot = {
        timestamp,
        heapUsed: memoryUsage.heapUsed,
        heapTotal: memoryUsage.heapTotal,
        external: memoryUsage.external,
        rss: memoryUsage.rss,
        arrayBuffers: memoryUsage.arrayBuffers,
      };

      // Capture CPU usage
      try {
        const stats = await pidusage(process.pid);
        const cpuSnapshot: CPUSnapshot = {
          timestamp,
          cpu: stats.cpu,
          memory: stats.memory,
          pid: process.pid,
        };
        
        this.cpuSnapshots.push(cpuSnapshot);
      } catch (cpuError) {
        this.logger.warn('Failed to capture CPU stats', cpuError);
      }

      this.memorySnapshots.push(memorySnapshot);

      // Maintain snapshot limits
      if (this.memorySnapshots.length > this.maxSnapshots) {
        this.memorySnapshots = this.memorySnapshots.slice(-this.maxSnapshots);
      }
      if (this.cpuSnapshots.length > this.maxSnapshots) {
        this.cpuSnapshots = this.cpuSnapshots.slice(-this.maxSnapshots);
      }

      // Check for memory leaks
      this.detectMemoryLeak();

      // Log periodic summary
      if (this.memorySnapshots.length % 12 === 0) { // Every minute (12 * 5s)
        this.logSummary();
      }

    } catch (error) {
      this.logger.error('Failed to capture snapshot', error);
    }
  }

  private detectMemoryLeak() {
    if (this.memorySnapshots.length < 10) {
      return; // Need at least 10 snapshots for trend analysis
    }

    const recent = this.memorySnapshots.slice(-10);
    const oldest = recent[0];
    const newest = recent[recent.length - 1];
    
    const memoryIncrease = newest.heapUsed - oldest.heapUsed;
    const timeSpan = newest.timestamp - oldest.timestamp;
    
    if (memoryIncrease > this.memoryLeakThreshold) {
      const alertData = {
        memoryIncrease: this.formatBytes(memoryIncrease),
        timeSpan: `${timeSpan / 1000}s`,
        currentHeap: this.formatBytes(newest.heapUsed),
        trend: this.getMemoryTrend(),
      };
      
      this.logger.warn(`🚨 Potential memory leak detected!`, alertData);
      
      // Broadcast alert to WebSocket clients
      if (this.profilerGateway) {
        this.profilerGateway.broadcastMemoryLeakAlert(alertData);
      }
      
      // Generate heap snapshot for analysis
      this.generateHeapSnapshot('memory-leak');
    }
  }

  private getMemoryTrend(): 'increasing' | 'decreasing' | 'stable' {
    if (this.memorySnapshots.length < 5) {
      return 'stable';
    }

    const recent = this.memorySnapshots.slice(-5);
    const increases = recent.reduce((count, snapshot, index) => {
      if (index === 0) return count;
      return snapshot.heapUsed > recent[index - 1].heapUsed ? count + 1 : count;
    }, 0);

    if (increases >= 4) return 'increasing';
    if (increases <= 1) return 'decreasing';
    return 'stable';
  }

  private generateHeapSnapshot(prefix = 'heap') {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${prefix}-snapshot-${timestamp}.heapsnapshot`;
      const filepath = path.join(this.profilesDir, filename);

      // Use v8.writeHeapSnapshot if available (Node.js 12+)
      if (require('v8').writeHeapSnapshot) {
        const snapshotPath = require('v8').writeHeapSnapshot(filepath);
        this.logger.log(`📸 Heap snapshot saved: ${snapshotPath}`);
      } else {
        this.logger.warn('Heap snapshot generation not available in this Node.js version');
      }
    } catch (error) {
      this.logger.error('Failed to generate heap snapshot', error);
    }
  }

  private logSummary() {
    const latest = this.memorySnapshots[this.memorySnapshots.length - 1];
    const latestCPU = this.cpuSnapshots[this.cpuSnapshots.length - 1];
    
    if (!latest) return;

    const avgCPU = this.getAverageCPU();
    const peakMemory = this.getPeakMemory();
    const trend = this.getMemoryTrend();

    this.logger.log(`📊 Profiler Summary:`, {
      currentHeap: this.formatBytes(latest.heapUsed),
      totalHeap: this.formatBytes(latest.heapTotal),
      rss: this.formatBytes(latest.rss),
      external: this.formatBytes(latest.external),
      cpu: latestCPU ? `${latestCPU.cpu.toFixed(1)}%` : 'N/A',
      avgCPU: `${avgCPU.toFixed(1)}%`,
      peakMemory: this.formatBytes(peakMemory),
      memoryTrend: trend,
      snapshots: this.memorySnapshots.length,
    });
  }

  getStats(): ProfilerStats {
    return {
      memorySnapshots: [...this.memorySnapshots],
      cpuSnapshots: [...this.cpuSnapshots],
      memoryLeakDetected: this.isMemoryLeakDetected(),
      memoryTrend: this.getMemoryTrend(),
      averageCPU: this.getAverageCPU(),
      peakMemory: this.getPeakMemory(),
    };
  }

  private isMemoryLeakDetected(): boolean {
    if (this.memorySnapshots.length < 10) return false;
    
    const recent = this.memorySnapshots.slice(-10);
    const oldest = recent[0];
    const newest = recent[recent.length - 1];
    
    return (newest.heapUsed - oldest.heapUsed) > this.memoryLeakThreshold;
  }

  private getAverageCPU(): number {
    if (this.cpuSnapshots.length === 0) return 0;
    
    const sum = this.cpuSnapshots.reduce((acc, snapshot) => acc + snapshot.cpu, 0);
    return sum / this.cpuSnapshots.length;
  }

  private getPeakMemory(): number {
    if (this.memorySnapshots.length === 0) return 0;
    
    return Math.max(...this.memorySnapshots.map(s => s.heapUsed));
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  // Manual profiling methods
  async forceHeapSnapshot(): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `manual-heap-snapshot-${timestamp}.heapsnapshot`;
    const filepath = path.join(this.profilesDir, filename);

    try {
      if (require('v8').writeHeapSnapshot) {
        const snapshotPath = require('v8').writeHeapSnapshot(filepath);
        this.logger.log(`📸 Manual heap snapshot saved: ${snapshotPath}`);
        return snapshotPath;
      } else {
        throw new Error('Heap snapshot generation not available');
      }
    } catch (error) {
      this.logger.error('Failed to generate manual heap snapshot', error);
      throw error;
    }
  }

  async getSystemInfo() {
    try {
      const [cpu, mem, osInfo] = await Promise.all([
        si.cpu(),
        si.mem(),
        si.osInfo(),
      ]);

      return {
        cpu: {
          manufacturer: cpu.manufacturer,
          brand: cpu.brand,
          cores: cpu.cores,
          physicalCores: cpu.physicalCores,
          speed: cpu.speed,
        },
        memory: {
          total: this.formatBytes(mem.total),
          free: this.formatBytes(mem.free),
          used: this.formatBytes(mem.used),
          active: this.formatBytes(mem.active),
        },
        os: {
          platform: osInfo.platform,
          distro: osInfo.distro,
          release: osInfo.release,
          arch: osInfo.arch,
        },
        node: {
          version: process.version,
          pid: process.pid,
          uptime: process.uptime(),
        },
      };
    } catch (error) {
      this.logger.error('Failed to get system info', error);
      throw error;
    }
  }

  clearSnapshots() {
    this.memorySnapshots = [];
    this.cpuSnapshots = [];
    this.logger.log('📝 Profiler snapshots cleared');
  }

  // Method to set the gateway reference (for circular dependency)
  setProfilerGateway(gateway: any) {
    this.profilerGateway = gateway;
  }
} 