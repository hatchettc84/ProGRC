import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, forwardRef, Inject } from '@nestjs/common';
import { ProfilerService, MemorySnapshot, CPUSnapshot } from './profiler.service';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  namespace: '/profiler',
})
export class ProfilerGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ProfilerGateway.name);
  private clients: Set<Socket> = new Set();
  private dataStreamInterval: NodeJS.Timeout;

  constructor(
    @Inject(forwardRef(() => ProfilerService))
    private readonly profilerService: ProfilerService
  ) {
    this.logger.log('🔧 ProfilerGateway constructor called');
  }

  afterInit(server: Server) {
    this.logger.log('🔌 ProfilerGateway initialized successfully');
    this.logger.log(`🌐 WebSocket server listening on namespace: /profiler`);
    
    // Register this gateway with the profiler service
    this.profilerService.setProfilerGateway(this);
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    this.clients.add(client);

    // Send initial data to the new client
    this.sendInitialData(client);

    // Start streaming if this is the first client
    if (this.clients.size === 1) {
      this.startDataStreaming();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.clients.delete(client);

    // Stop streaming if no clients are connected
    if (this.clients.size === 0) {
      this.stopDataStreaming();
    }
  }

  @SubscribeMessage('requestSnapshot')
  handleRequestSnapshot(@MessageBody() data: any) {
    const stats = this.profilerService.getStats();
    this.server.emit('profilerSnapshot', stats);
  }

  @SubscribeMessage('requestSystemInfo')
  async handleRequestSystemInfo(@MessageBody() data: any) {
    try {
      const systemInfo = await this.profilerService.getSystemInfo();
      this.server.emit('systemInfo', systemInfo);
    } catch (error) {
      this.logger.error('Failed to get system info for WebSocket', error);
    }
  }

  @SubscribeMessage('generateHeapSnapshot')
  async handleGenerateHeapSnapshot(@MessageBody() data: any) {
    try {
      const snapshotPath = await this.profilerService.forceHeapSnapshot();
      this.server.emit('heapSnapshotGenerated', { snapshotPath });
    } catch (error) {
      this.logger.error('Failed to generate heap snapshot for WebSocket', error);
    }
  }

  private sendInitialData(client: Socket) {
    const stats = this.profilerService.getStats();
    client.emit('profilerSnapshot', stats);
  }

  private startDataStreaming() {
    this.logger.log('Starting real-time data streaming');
    
    this.dataStreamInterval = setInterval(() => {
      if (this.clients.size > 0) {
        const stats = this.profilerService.getStats();
        
        // Send latest data points
        const latestMemory = stats.memorySnapshots[stats.memorySnapshots.length - 1];
        const latestCPU = stats.cpuSnapshots[stats.cpuSnapshots.length - 1];
        
        if (latestMemory || latestCPU) {
          this.server.emit('realtimeData', {
            memory: latestMemory,
            cpu: latestCPU,
            timestamp: Date.now(),
            memoryTrend: stats.memoryTrend,
            averageCPU: stats.averageCPU,
            peakMemory: stats.peakMemory,
            memoryLeakDetected: stats.memoryLeakDetected,
          });
        }

        // Send full stats every 30 seconds
        if (Date.now() % 30000 < 2000) {
          this.server.emit('profilerSnapshot', stats);
        }
      }
    }, 2000); // Stream every 2 seconds
  }

  private stopDataStreaming() {
    this.logger.log('Stopping real-time data streaming');
    if (this.dataStreamInterval) {
      clearInterval(this.dataStreamInterval);
    }
  }

  // Method to broadcast memory leak alerts
  public broadcastMemoryLeakAlert(data: any) {
    this.server.emit('memoryLeakAlert', data);
  }

  // Method to broadcast profiler events
  public broadcastProfilerEvent(event: string, data: any) {
    this.server.emit('profilerEvent', { event, data, timestamp: Date.now() });
  }
} 