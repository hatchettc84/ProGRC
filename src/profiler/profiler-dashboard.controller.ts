import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller('profiler/dashboard')
export class ProfilerDashboardController {
  
  @Get()
  getDashboard(@Res() res: Response) {
    const dashboardHTML = this.generateDashboardHTML();
    res.set('Content-Type', 'text/html');
    res.send(dashboardHTML);
  }

  private generateDashboardHTML(): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Profiler Dashboard - Real-time Memory & CPU Monitor</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdn.socket.io/4.7.2/socket.io.min.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #333;
            overflow-x: hidden;
        }
        
        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            text-align: center;
            color: white;
            margin-bottom: 30px;
        }
        
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .header p {
            font-size: 1.1rem;
            opacity: 0.9;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .stat-card {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 20px;
            text-align: center;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            transition: transform 0.3s ease;
        }
        
        .stat-card:hover {
            transform: translateY(-5px);
        }
        
        .stat-card h3 {
            color: #667eea;
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 10px;
        }
        
        .stat-card .value {
            font-size: 1.8rem;
            font-weight: bold;
            color: #333;
        }
        
        .stat-card.alert {
            background: rgba(255, 0, 0, 0.1);
            border: 2px solid #ff4757;
        }
        
        .charts-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 30px;
        }
        
        .chart-container {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 25px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
        }
        
        .chart-container h3 {
            color: #667eea;
            margin-bottom: 20px;
            text-align: center;
            font-size: 1.2rem;
        }
        
        .controls {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            padding: 25px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            margin-bottom: 20px;
        }
        
        .controls h3 {
            color: #667eea;
            margin-bottom: 15px;
        }
        
        .button-group {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }
        
        .btn {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 25px;
            cursor: pointer;
            font-size: 0.9rem;
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
        
        .status-indicator {
            display: inline-block;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            margin-right: 8px;
        }
        
        .status-connected {
            background: #2ed573;
            box-shadow: 0 0 10px #2ed573;
        }
        
        .status-disconnected {
            background: #ff4757;
            box-shadow: 0 0 10px #ff4757;
        }
        
        .logs {
            background: rgba(0, 0, 0, 0.8);
            color: #00ff00;
            border-radius: 15px;
            padding: 20px;
            height: 200px;
            overflow-y: auto;
            font-family: 'Courier New', monospace;
            font-size: 0.85rem;
        }
        
        .log-entry {
            margin-bottom: 5px;
        }
        
        .log-timestamp {
            color: #ffa726;
        }
        
        .log-error {
            color: #ff4757;
        }
        
        .log-warning {
            color: #ffa726;
        }
        
        @media (max-width: 768px) {
            .charts-grid {
                grid-template-columns: 1fr;
            }
            
            .header h1 {
                font-size: 2rem;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔍 Profiler Dashboard</h1>
            <p>Real-time Memory & CPU Monitoring</p>
            <p><span id="connectionStatus" class="status-indicator status-disconnected"></span><span id="statusText">Connecting...</span></p>
        </div>
        
        <div class="stats-grid">
            <div class="stat-card">
                <h3>Current Heap</h3>
                <div class="value" id="currentHeap">0 MB</div>
            </div>
            <div class="stat-card">
                <h3>Total Heap</h3>
                <div class="value" id="totalHeap">0 MB</div>
            </div>
            <div class="stat-card">
                <h3>RSS Memory</h3>
                <div class="value" id="rssMemory">0 MB</div>
            </div>
            <div class="stat-card">
                <h3>CPU Usage</h3>
                <div class="value" id="cpuUsage">0%</div>
            </div>
            <div class="stat-card">
                <h3>Average CPU</h3>
                <div class="value" id="avgCpu">0%</div>
            </div>
            <div class="stat-card" id="memoryTrendCard">
                <h3>Memory Trend</h3>
                <div class="value" id="memoryTrend">Stable</div>
            </div>
            <div class="stat-card">
                <h3>Peak Memory</h3>
                <div class="value" id="peakMemory">0 MB</div>
            </div>
            <div class="stat-card" id="leakCard">
                <h3>Memory Leak</h3>
                <div class="value" id="memoryLeak">None</div>
            </div>
        </div>
        
        <div class="controls">
            <h3>🎛️ Controls</h3>
            <div class="button-group">
                <button class="btn" onclick="generateHeapSnapshot()">📸 Generate Heap Snapshot</button>
                <button class="btn" onclick="requestSystemInfo()">💻 System Info</button>
                <button class="btn" onclick="clearCharts()">🗑️ Clear Charts</button>
                <button class="btn" onclick="togglePause()"">⏸️ Pause/Resume</button>
            </div>
        </div>
        
        <div class="charts-grid">
            <div class="chart-container">
                <h3>📊 Memory Usage Over Time</h3>
                <canvas id="memoryChart" width="400" height="200"></canvas>
            </div>
            <div class="chart-container">
                <h3>⚡ CPU Usage Over Time</h3>
                <canvas id="cpuChart" width="400" height="200"></canvas>
            </div>
        </div>
        
        <div class="chart-container">
            <h3>📝 Live Logs</h3>
            <div class="logs" id="logs"></div>
        </div>
    </div>

    <script>
        // WebSocket connection
        const socket = io('/profiler', {
            transports: ['websocket', 'polling'],
            upgrade: true,
            rememberUpgrade: true,
            timeout: 20000,
        });
        let isPaused = false;
        
        // Chart configurations
        const chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 0
            },
            interaction: {
                intersect: false,
            },
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    title: {
                        display: true,
                        text: 'Time (seconds ago)'
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Value'
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            }
        };
        
        // Initialize charts
        const memoryChart = new Chart(document.getElementById('memoryChart'), {
            type: 'line',
            data: {
                datasets: [
                    {
                        label: 'Heap Used (MB)',
                        data: [],
                        borderColor: '#667eea',
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'RSS (MB)',
                        data: [],
                        borderColor: '#764ba2',
                        backgroundColor: 'rgba(118, 75, 162, 0.1)',
                        tension: 0.4,
                        fill: false
                    }
                ]
            },
            options: {
                ...chartOptions,
                scales: {
                    ...chartOptions.scales,
                    y: {
                        ...chartOptions.scales.y,
                        title: {
                            display: true,
                            text: 'Memory (MB)'
                        }
                    }
                }
            }
        });
        
        const cpuChart = new Chart(document.getElementById('cpuChart'), {
            type: 'line',
            data: {
                datasets: [{
                    label: 'CPU Usage (%)',
                    data: [],
                    borderColor: '#ff6b6b',
                    backgroundColor: 'rgba(255, 107, 107, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                ...chartOptions,
                scales: {
                    ...chartOptions.scales,
                    y: {
                        ...chartOptions.scales.y,
                        max: 100,
                        title: {
                            display: true,
                            text: 'CPU Usage (%)'
                        }
                    }
                }
            }
        });
        
        // Utility functions
        function formatBytes(bytes) {
            if (bytes === 0) return '0 B';
            const k = 1024;
            const sizes = ['B', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }
        
        function formatTime(timestamp) {
            return new Date(timestamp).toLocaleTimeString();
        }
        
        function addToChart(chart, x, y, datasetIndex = 0) {
            const data = chart.data.datasets[datasetIndex].data;
            data.push({ x, y });
            
            // Keep only last 50 points
            if (data.length > 50) {
                data.shift();
            }
            
            chart.update('none');
        }
        
        function updateStatCard(id, value, isAlert = false) {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
                const card = element.closest('.stat-card');
                if (isAlert) {
                    card.classList.add('alert');
                } else {
                    card.classList.remove('alert');
                }
            }
        }
        
        function addLog(message, type = 'info') {
            const logs = document.getElementById('logs');
            const timestamp = formatTime(Date.now());
            const logEntry = document.createElement('div');
            logEntry.className = 'log-entry';
            
            let className = '';
            if (type === 'error') className = 'log-error';
            else if (type === 'warning') className = 'log-warning';
            
            logEntry.innerHTML = \`<span class="log-timestamp">[\${timestamp}]</span> <span class="\${className}">\${message}</span>\`;
            logs.appendChild(logEntry);
            logs.scrollTop = logs.scrollHeight;
            
            // Keep only last 100 log entries
            while (logs.children.length > 100) {
                logs.removeChild(logs.firstChild);
            }
        }
        
        // Socket event handlers
        socket.on('connect', () => {
            document.getElementById('connectionStatus').className = 'status-indicator status-connected';
            document.getElementById('statusText').textContent = 'Connected';
            addLog('Connected to profiler', 'info');
        });
        
        socket.on('disconnect', () => {
            document.getElementById('connectionStatus').className = 'status-indicator status-disconnected';
            document.getElementById('statusText').textContent = 'Disconnected';
            addLog('Disconnected from profiler', 'error');
        });
        
        socket.on('realtimeData', (data) => {
            if (isPaused) return;
            
            const now = Date.now();
            const secondsAgo = 0;
            
            if (data.memory) {
                const heapMB = data.memory.heapUsed / (1024 * 1024);
                const rssMB = data.memory.rss / (1024 * 1024);
                
                addToChart(memoryChart, secondsAgo, heapMB, 0);
                addToChart(memoryChart, secondsAgo, rssMB, 1);
                
                updateStatCard('currentHeap', formatBytes(data.memory.heapUsed));
                updateStatCard('totalHeap', formatBytes(data.memory.heapTotal));
                updateStatCard('rssMemory', formatBytes(data.memory.rss));
            }
            
            if (data.cpu) {
                addToChart(cpuChart, secondsAgo, data.cpu.cpu);
                updateStatCard('cpuUsage', data.cpu.cpu.toFixed(1) + '%');
            }
            
            updateStatCard('avgCpu', data.averageCPU.toFixed(1) + '%');
            updateStatCard('peakMemory', formatBytes(data.peakMemory));
            updateStatCard('memoryTrend', data.memoryTrend);
            updateStatCard('memoryLeak', data.memoryLeakDetected ? 'DETECTED' : 'None', data.memoryLeakDetected);
            
            // Update chart time references
            memoryChart.data.datasets.forEach(dataset => {
                dataset.data.forEach(point => {
                    point.x = (point.x || 0) - 2; // Subtract 2 seconds
                });
            });
            cpuChart.data.datasets.forEach(dataset => {
                dataset.data.forEach(point => {
                    point.x = (point.x || 0) - 2; // Subtract 2 seconds
                });
            });
        });
        
        socket.on('memoryLeakAlert', (data) => {
            addLog(\`🚨 MEMORY LEAK DETECTED! Increase: \${data.memoryIncrease}\`, 'error');
            updateStatCard('memoryLeak', 'DETECTED', true);
        });
        
        socket.on('heapSnapshotGenerated', (data) => {
            addLog(\`📸 Heap snapshot generated: \${data.snapshotPath}\`, 'info');
        });
        
        socket.on('systemInfo', (data) => {
            addLog(\`💻 System: \${data.os.platform} \${data.os.release}, Node: \${data.node.version}\`, 'info');
        });
        
        // Control functions
        function generateHeapSnapshot() {
            socket.emit('generateHeapSnapshot');
            addLog('Generating heap snapshot...', 'info');
        }
        
        function requestSystemInfo() {
            socket.emit('requestSystemInfo');
        }
        
        function clearCharts() {
            memoryChart.data.datasets.forEach(dataset => {
                dataset.data = [];
            });
            cpuChart.data.datasets.forEach(dataset => {
                dataset.data = [];
            });
            memoryChart.update();
            cpuChart.update();
            addLog('Charts cleared', 'info');
        }
        
        function togglePause() {
            isPaused = !isPaused;
            addLog(isPaused ? 'Monitoring paused' : 'Monitoring resumed', 'info');
        }
        
        // Initial load
        addLog('Profiler dashboard initialized', 'info');
        socket.emit('requestSnapshot');
    </script>
</body>
</html>
    `;
  }
} 