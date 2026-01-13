# SSH Access to Droplet 142.93.183.7

## 🔐 Direct SSH Command

From your local terminal, run:

```bash
ssh root@142.93.183.7
```

Or if you have a specific SSH key:

```bash
ssh -i ~/.ssh/your_key root@142.93.183.7
```

## 🔍 Troubleshooting

### Connection Timeout

If you get "Connection timed out":

1. **Check if droplet is running**:
   ```bash
   doctl compute droplet list | grep 142.93.183.7
   ```

2. **Verify SSH port is open**:
   ```bash
   # Check DigitalOcean firewall rules
   doctl compute firewall list
   ```

3. **Test connectivity**:
   ```bash
   ping 142.93.183.7
   telnet 142.93.183.7 22
   ```

### Alternative: Use DigitalOcean Console

1. Go to [DigitalOcean Dashboard](https://cloud.digitalocean.com)
2. Navigate to Droplets
3. Find the droplet with IP `142.93.183.7`
4. Click "Access" → "Launch Droplet Console"
5. This opens a web-based terminal

### Alternative: Use doctl

If the droplet is in your DigitalOcean account:

```bash
# List droplets to find the ID
doctl compute droplet list

# SSH using doctl (replace DROPLET_ID)
doctl compute ssh DROPLET_ID
```

## 📋 Once Connected

### Check System Info
```bash
uname -a
df -h
free -h
```

### Check Running Services
```bash
systemctl list-units --type=service --state=running
```

### Check Network
```bash
ip addr show
netstat -tlnp
```

### Check if this is related to the application
```bash
# Check for Docker/Kubernetes
docker ps
kubectl get nodes

# Check for application files
ls -la /var/www
ls -la /opt
```

## 🔧 Common Tasks

### Update System
```bash
apt update && apt upgrade -y
```

### Check Logs
```bash
journalctl -xe
tail -f /var/log/syslog
```

### Check Disk Space
```bash
df -h
du -sh /*
```

---

**IP**: 142.93.183.7  
**Default User**: root (or check DigitalOcean dashboard)  
**Port**: 22
