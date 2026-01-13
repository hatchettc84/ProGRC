# Profiler Module

This module provides comprehensive memory and CPU profiling capabilities for the NestJS application, specifically designed for development and local environments.

## Features

- **Memory Monitoring**: Tracks heap usage, RSS, external memory, and array buffers
- **CPU Monitoring**: Monitors CPU usage percentage over time
- **Memory Leak Detection**: Automatically detects potential memory leaks based on configurable thresholds
- **Heap Snapshots**: Generates V8 heap snapshots for detailed memory analysis
- **System Information**: Provides detailed system and Node.js runtime information
- **REST API**: Full REST API for controlling and monitoring the profiler

## Environment Configuration

The profiler is automatically enabled only in development environments:
- `NODE_ENV=development` or `NODE_ENV=dev`
- `IS_LOCAL=true`

In production environments, the profiler module is not loaded at all, ensuring zero performance impact.

## Getting Started

### 1. Start the application with profiling enabled

```bash
# Using the profile script (recommended)
npm run start:profile

# Or manually set environment variables
NODE_ENV=development IS_LOCAL=true npm run start:dev
```

### 2. Access the profiler dashboard

The profiler provides a beautiful real-time dashboard with live charts and monitoring:

**🎯 Live Dashboard**: Visit `http://localhost:3000/api/v1/profiler/dashboard`

**Features:**
- **Real-time Charts**: Live memory and CPU usage graphs
- **WebSocket Streaming**: Data updates every 2 seconds
- **Interactive Controls**: Generate heap snapshots, view system info
- **Memory Leak Alerts**: Real-time alerts when leaks are detected
- **Live Logs**: Console-style logging with timestamps
- **Responsive Design**: Works on desktop and mobile devices

### 3. REST API Endpoints

The profiler also provides REST endpoints under `/api/v1/profiler`:

- `GET /profiler/stats` - Get comprehensive profiling statistics
- `GET /profiler/memory-usage` - Get current memory usage
- `GET /profiler/system-info` - Get system information
- `POST /profiler/heap-snapshot` - Generate a manual heap snapshot
- `POST /profiler/start-monitoring` - Start profiler monitoring
- `POST /profiler/stop-monitoring` - Stop profiler monitoring
- `DELETE /profiler/snapshots` - Clear all stored snapshots

## API Endpoints

### Get Profiler Statistics
```http
GET /api/v1/profiler/stats
```

Returns comprehensive profiling data including:
- Memory snapshots over time
- CPU usage snapshots
- Memory leak detection status
- Memory trend analysis
- Average CPU usage
- Peak memory usage

### Get Current Memory Usage
```http
GET /api/v1/profiler/memory-usage
```

Returns current Node.js memory usage in both raw bytes and human-readable format.

### Get System Information
```http
GET /api/v1/profiler/system-info
```

Returns detailed system information including:
- CPU details (manufacturer, brand, cores, speed)
- Memory information (total, free, used, active)
- Operating system details
- Node.js runtime information

### Generate Heap Snapshot
```http
POST /api/v1/profiler/heap-snapshot
```

Generates a V8 heap snapshot file that can be analyzed in Chrome DevTools.

## Memory Leak Detection

The profiler automatically monitors for memory leaks by:

1. **Threshold-based Detection**: Alerts when heap usage increases by more than 50MB over a 10-snapshot window
2. **Trend Analysis**: Analyzes memory usage trends (increasing, decreasing, stable)
3. **Automatic Snapshots**: Generates heap snapshots when potential leaks are detected

### Configurable Parameters

- **Monitoring Interval**: 5 seconds (captures snapshots every 5 seconds)
- **Heap Snapshot Interval**: 60 seconds (generates automatic heap snapshots every minute)
- **Memory Leak Threshold**: 50MB increase over 10 snapshots
- **Max Snapshots**: 1000 (keeps the last 1000 snapshots in memory)

## Heap Snapshot Analysis

Heap snapshots are saved to the `profiles/` directory in the project root. These files can be analyzed using:

1. **Chrome DevTools**:
   - Open Chrome DevTools
   - Go to Memory tab
   - Click "Load" and select the `.heapsnapshot` file

2. **Node.js Inspector**:
   - Use `node --inspect` to start the application
   - Connect Chrome DevTools to the inspector

## File Structure

```
src/profiler/
├── profiler.module.ts                # NestJS module definition
├── profiler.service.ts               # Core profiling logic
├── profiler.controller.ts            # REST API endpoints
├── profiler.gateway.ts               # WebSocket gateway for real-time data
├── profiler-dashboard.controller.ts  # Dashboard HTML serving
└── README.md                         # This documentation
```

## Monitoring Output

The profiler logs periodic summaries to the console:

```
📊 Profiler Summary: {
  currentHeap: "45.2 MB",
  totalHeap: "67.8 MB", 
  rss: "123.4 MB",
  external: "2.1 MB",
  cpu: "15.3%",
  avgCPU: "12.7%",
  peakMemory: "52.1 MB",
  memoryTrend: "stable",
  snapshots: 120
}
```

## Memory Leak Alerts

When a potential memory leak is detected:

```
🚨 Potential memory leak detected! {
  memoryIncrease: "52.3 MB",
  timeSpan: "50s",
  currentHeap: "97.5 MB",
  trend: "increasing"
}
```

## Best Practices

1. **Development Only**: Never enable profiling in production
2. **Regular Monitoring**: Check profiler stats during development to catch issues early
3. **Heap Analysis**: Use generated heap snapshots to identify memory leaks
4. **Baseline Comparison**: Compare memory usage before and after code changes
5. **Clean Up**: Regularly clear snapshots to prevent disk space issues

## Troubleshooting

### Profiler Not Starting
- Ensure `NODE_ENV=development` or `IS_LOCAL=true`
- Check console logs for profiler initialization messages

### High Memory Usage
- Generate a heap snapshot for analysis
- Check for event listener leaks
- Look for unclosed database connections
- Verify proper cleanup in async operations

### Performance Impact
- The profiler has minimal impact in development
- Monitoring interval can be adjusted if needed
- Automatic heap snapshots can be disabled by modifying the service

## Dependencies

- `pidusage`: For CPU and memory usage monitoring
- `systeminformation`: For detailed system information
- `@nestjs/websockets`: For real-time WebSocket communication
- `@nestjs/platform-socket.io`: Socket.IO platform adapter
- `socket.io`: WebSocket library for real-time updates
- `Chart.js`: Client-side charting library for visualizations
- Node.js built-in `v8` module: For heap snapshot generation
- Node.js built-in `process` module: For memory usage data 