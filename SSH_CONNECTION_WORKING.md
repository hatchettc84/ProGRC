# SSH Connection Working ✅

## ✅ Status

SSH key has been successfully added to both droplets and connections are working!

## 🔐 Connect to Your Droplets

### Droplet 1: 142.93.183.7
```bash
ssh -i ~/.ssh/progrc_droplet root@142.93.183.7
```

### AI Droplet: 64.225.20.65
```bash
ssh -i ~/.ssh/progrc_droplet root@64.225.20.65
```

## 🚀 Quick Commands for Each Droplet

### For Droplet 142.93.183.7:

```bash
# Connect
ssh -i ~/.ssh/progrc_droplet root@142.93.183.7

# Once connected, check system
uname -a
df -h
free -h
systemctl list-units --type=service --state=running
```

### For AI Droplet (64.225.20.65):

```bash
# Connect
ssh -i ~/.ssh/progrc_droplet root@64.225.20.65

# Check Ollama
systemctl status ollama
ollama list
curl http://localhost:11434/api/tags

# Verify Ollama is accessible externally
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

Save (`Ctrl+X`, then `Y`, then `Enter`) and set permissions:
```bash
chmod 600 ~/.ssh/config
```

Then connect easily:
```bash
ssh progrc-droplet-142
ssh progrc-droplet-ai
```

## 🎯 What to Check

### On Droplet 142.93.183.7:
- [ ] System resources (CPU, memory, disk)
- [ ] Running services
- [ ] Network configuration
- [ ] Any application files or configurations

### On AI Droplet (64.225.20.65):
- [ ] Ollama service is running
- [ ] Models are installed (llama3.2:1b, nomic-embed-text)
- [ ] Ollama listening on 0.0.0.0:11434 (not just 127.0.0.1)
- [ ] API accessible from Kubernetes cluster

## ✅ Success!

You can now:
- ✅ SSH into both droplets without passwords
- ✅ Manage services and configurations
- ✅ Check logs and system status
- ✅ Troubleshoot issues directly

---

**Status**: ✅ SSH Working  
**Ready to Use**: Yes  
**Next**: Connect and explore your droplets!
