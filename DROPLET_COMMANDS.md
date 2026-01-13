# Useful Commands for Connected Droplet

## 🔍 System Information

### Basic System Info:
```bash
# System information
uname -a
hostname
uptime

# Disk usage
df -h

# Memory usage
free -h

# CPU info
lscpu
```

### Network Information:
```bash
# Network interfaces
ip addr show
# or
ifconfig

# Listening ports
ss -tlnp
# or
netstat -tlnp

# Check connectivity
ping -c 3 8.8.8.8
```

## 🔧 Service Management

### Check Running Services:
```bash
# List all running services
systemctl list-units --type=service --state=running

# Check specific service status
systemctl status ollama
systemctl status docker
systemctl status nginx

# View service logs
journalctl -u ollama -n 50
journalctl -u docker -n 50
```

### Service Control:
```bash
# Start service
systemctl start ollama

# Stop service
systemctl stop ollama

# Restart service
systemctl restart ollama

# Enable on boot
systemctl enable ollama

# Disable on boot
systemctl disable ollama
```

## 🤖 For AI Droplet (64.225.20.65)

### Check Ollama:
```bash
# Check Ollama service
systemctl status ollama

# List installed models
ollama list

# Test Ollama API locally
curl http://localhost:11434/api/tags

# Check if Ollama is listening externally
ss -tlnp | grep 11434
# Should show: 0.0.0.0:11434 (not 127.0.0.1:11434)

# Test external access
curl http://64.225.20.65:11434/api/tags
```

### Ollama Management:
```bash
# Pull a model
ollama pull llama3.2:1b
ollama pull nomic-embed-text

# Run a model
ollama run llama3.2:1b

# Check model info
ollama show llama3.2:1b
```

## 📁 File System

### Navigation:
```bash
# Current directory
pwd

# List files
ls -la

# Change directory
cd /var/www
cd /opt
cd /root

# Find files
find / -name "*.log" 2>/dev/null
find / -name "config*" 2>/dev/null
```

### Check Application Files:
```bash
# Common locations
ls -la /var/www
ls -la /opt
ls -la /root
ls -la /home

# Check for Docker
docker ps
docker images

# Check for Kubernetes
kubectl get nodes
```

## 📊 System Monitoring

### Resource Usage:
```bash
# Real-time monitoring
top
# or
htop

# Disk usage by directory
du -sh /* | sort -h

# Memory usage
free -h
cat /proc/meminfo

# CPU usage
mpstat 1 5
```

### Logs:
```bash
# System logs
journalctl -xe
journalctl -f

# Specific service logs
journalctl -u ollama -f
journalctl -u docker -f

# Log files
tail -f /var/log/syslog
tail -f /var/log/auth.log
```

## 🔒 Security

### Check Firewall:
```bash
# UFW status
ufw status
ufw status verbose

# iptables
iptables -L -n

# Check open ports
ss -tlnp
```

### Check SSH:
```bash
# SSH config
cat /etc/ssh/sshd_config

# SSH keys
cat ~/.ssh/authorized_keys

# SSH service status
systemctl status ssh
systemctl status sshd
```

## 🐳 Docker (if installed)

```bash
# Running containers
docker ps

# All containers
docker ps -a

# Docker images
docker images

# Docker logs
docker logs <container_id>
```

## ☸️ Kubernetes (if installed)

```bash
# Check if kubectl is available
kubectl version

# Get nodes
kubectl get nodes

# Get pods
kubectl get pods --all-namespaces
```

## 🔧 Troubleshooting

### Check System Health:
```bash
# System load
uptime

# Disk space
df -h

# Memory
free -h

# Check for errors
dmesg | tail -20
journalctl -p err -n 20
```

### Network Troubleshooting:
```bash
# Test connectivity
ping -c 3 8.8.8.8
ping -c 3 google.com

# Check DNS
nslookup google.com
dig google.com

# Check routing
ip route
```

## 📝 Quick Reference

### Most Common Commands:
```bash
# System info
uname -a && df -h && free -h

# Running services
systemctl list-units --type=service --state=running

# Network ports
ss -tlnp

# Recent logs
journalctl -n 50
```

---

**What would you like to check or do on this droplet?**
