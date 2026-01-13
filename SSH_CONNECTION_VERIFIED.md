# SSH Connection Verified ✅

## ✅ Status

SSH key has been added to DigitalOcean and your droplets. You can now connect without passwords!

## 🔐 Connect to Your Droplets

### Droplet 1: 142.93.183.7
```bash
ssh -i ~/.ssh/progrc_droplet root@142.93.183.7
```

### AI Droplet: 64.225.20.65
```bash
ssh -i ~/.ssh/progrc_droplet root@64.225.20.65
```

## 🚀 Quick Commands Once Connected

### Basic System Info:
```bash
# System information
uname -a
df -h
free -h
uptime
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

### For AI Droplet (64.225.20.65):
```bash
# Check Ollama status
systemctl status ollama

# List Ollama models
ollama list

# Test Ollama API
curl http://localhost:11434/api/tags

# Check Ollama is listening on all interfaces
ss -tlnp | grep 11434
```

## 📝 Optional: Add to SSH Config

For easier access, add to `~/.ssh/config`:

```bash
nano ~/.ssh/config
```

Add:
```
Host progrc-droplet-142
    HostName 142.93.183.7
    User root
    IdentityFile ~/.ssh/progrc_droplet
    IdentitiesOnly yes

Host progrc-droplet-ai
    HostName 64.225.20.65
    User root
    IdentityFile ~/.ssh/progrc_droplet
    IdentitiesOnly yes
```

Save and set permissions:
```bash
chmod 600 ~/.ssh/config
```

Then connect easily:
```bash
ssh progrc-droplet-142
ssh progrc-droplet-ai
```

## 🎯 What to Check on Each Droplet

### For Droplet 142.93.183.7:
- [ ] System status and resources
- [ ] Running services
- [ ] Network configuration
- [ ] Application files (if any)
- [ ] Logs location

### For AI Droplet (64.225.20.65):
- [ ] Ollama service status
- [ ] Models installed (llama3.2:1b, nomic-embed-text)
- [ ] Ollama listening on 0.0.0.0:11434
- [ ] Firewall allows port 11434
- [ ] API accessible from Kubernetes cluster

## 🔍 Troubleshooting

### If connection fails:

1. **Verify key is added to droplet**:
   - Dashboard → Droplet → Settings → SSH Keys
   - Ensure `progrc-droplet-key` is checked

2. **Check key permissions**:
   ```bash
   chmod 600 ~/.ssh/progrc_droplet
   ```

3. **Test with verbose output**:
   ```bash
   ssh -v -i ~/.ssh/progrc_droplet root@142.93.183.7
   ```

4. **Verify firewall allows SSH**:
   - Dashboard → Networking → Firewalls
   - Ensure SSH (port 22) is in inbound rules

## ✅ Next Steps

1. **Connect to droplets** and verify they're working
2. **Check services** running on each
3. **Verify configurations** are correct
4. **Test connectivity** between services

---

**Status**: ✅ SSH Key Added  
**Ready to Connect**: Yes  
**Command**: `ssh -i ~/.ssh/progrc_droplet root@142.93.183.7`
