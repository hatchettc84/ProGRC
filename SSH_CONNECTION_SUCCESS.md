# SSH Connection - Firewall Rule Added ✅

## ✅ Status

The SSH firewall rule (port 22) has been added to your DigitalOcean firewall.

## 🧪 Test SSH Connection

### Quick Test:
```bash
ssh root@142.93.183.7
```

### With Verbose Output (to see connection details):
```bash
ssh -v root@142.93.183.7
```

### Test Port Connectivity:
```bash
nc -zv 142.93.183.7 22
```

## 📋 Once Connected

### Basic System Info:
```bash
# System information
uname -a
df -h
free -h
```

### Check Running Services:
```bash
systemctl list-units --type=service --state=running
```

### Check Network:
```bash
ip addr show
ss -tlnp
```

### Check if this is related to your application:
```bash
# Check for Docker/Kubernetes
docker ps
kubectl get nodes

# Check for application files
ls -la /var/www
ls -la /opt
ls -la /root
```

## 🔍 If Connection Still Fails

### 1. Wait a Few Seconds
- Firewall rules can take 10-30 seconds to propagate
- Try again after waiting

### 2. Check Droplet Status
- DigitalOcean Dashboard → Droplets
- Ensure droplet is "Active" (not "Off")
- Power on if needed

### 3. Verify Firewall is Attached
- Dashboard → Droplet → Networking tab
- Check if firewall is listed and active

### 4. Check for Multiple Firewalls
- You might have multiple firewalls
- Ensure the one with SSH rule is attached to the droplet

### 5. Check Droplet's Built-in Firewall (ufw)
If you can access via DigitalOcean Console:
```bash
# Check ufw status
ufw status

# If active and blocking, allow SSH
ufw allow 22/tcp
ufw reload
```

## 🎯 Next Steps

Once SSH is working:

1. **Identify the Droplet Purpose**:
   - Check what's running on it
   - Determine if it's related to your application

2. **For AI Droplet (64.225.20.65)**:
   - Check Ollama status: `systemctl status ollama`
   - Verify models: `ollama list`
   - Test API: `curl http://localhost:11434/api/tags`

3. **For Other Droplets**:
   - Check what services are running
   - Verify configuration
   - Check logs if needed

## 📝 Quick Commands Reference

### Connect:
```bash
ssh root@142.93.183.7
```

### Test Port:
```bash
nc -zv 142.93.183.7 22
```

### Check Your IP (if needed for firewall):
```bash
curl ifconfig.me
```

---

**Status**: ✅ Firewall rule added  
**Next**: Test SSH connection  
**Command**: `ssh root@142.93.183.7`
