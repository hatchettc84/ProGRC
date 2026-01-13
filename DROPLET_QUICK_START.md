# Quick Start - Connected to Droplet

## ✅ You're Connected!

Now you can manage the droplet directly. Here are quick commands to get started:

## 🚀 First Things to Check

### 1. What Droplet Is This?
```bash
hostname
uname -a
cat /etc/os-release
```

### 2. System Resources
```bash
df -h          # Disk space
free -h        # Memory
uptime         # System load
```

### 3. What's Running?
```bash
systemctl list-units --type=service --state=running
```

### 4. Network Status
```bash
ip addr show
ss -tlnp
```

## 🎯 Common Tasks

### If This Is the AI Droplet (64.225.20.65):

```bash
# Check Ollama
systemctl status ollama
ollama list
curl http://localhost:11434/api/tags

# Verify external access
ss -tlnp | grep 11434
```

### If This Is the Other Droplet (142.93.183.7):

```bash
# Check what's running
systemctl list-units --type=service --state=running

# Check for applications
ls -la /var/www
ls -la /opt
docker ps  # if Docker is installed
```

## 📋 What Would You Like to Do?

1. **Check Ollama** (if AI droplet)
2. **Check system status**
3. **View logs**
4. **Configure services**
5. **Troubleshoot issues**
6. **Something else?**

---

**Tell me what you'd like to check or do!**
