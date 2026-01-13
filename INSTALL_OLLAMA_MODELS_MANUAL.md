# Install Ollama Models - Manual Instructions

## Overview

Since SSH access isn't available from this environment, here are the manual steps to install the required Ollama models on your AI Droplet.

## Required Models

- **LLM Model**: `llama3.2:1b` (~1.3GB) - For text generation and chat
- **Embedding Model**: `nomic-embed-text` (~274MB) - For document embeddings

## Installation Methods

### Method 1: SSH into AI Droplet (Recommended)

```bash
# 1. SSH into the AI Droplet
ssh root@64.225.20.65

# 2. Verify Ollama is installed and running
systemctl status ollama

# If Ollama is not running, start it:
systemctl start ollama

# 3. Install LLM model (this will take several minutes)
ollama pull llama3.2:1b

# 4. Install embedding model (this will take a few minutes)
ollama pull nomic-embed-text

# 5. Verify installation
ollama list

# Should show:
# llama3.2:1b
# nomic-embed-text
```

### Method 2: Use DigitalOcean Console

1. Log in to [DigitalOcean Control Panel](https://cloud.digitalocean.com)
2. Navigate to **Droplets**
3. Find the droplet: `progrc-ai-droplet` (64.225.20.65)
4. Click **Access** → **Launch Droplet Console**
5. In the console, run:

```bash
# Verify Ollama is running
systemctl status ollama

# Install models
ollama pull llama3.2:1b
ollama pull nomic-embed-text

# Verify installation
ollama list
```

### Method 3: Use doctl (If Configured)

```bash
# If doctl is installed and configured with your API key
doctl compute ssh 543191898

# Or by IP
doctl compute ssh 64.225.20.65

# Then install models:
ollama pull llama3.2:1b
ollama pull nomic-embed-text
ollama list
```

### Method 4: Copy Script to Droplet

If you can access the droplet via SSH but want to use the script:

```bash
# 1. SSH into droplet
ssh root@64.225.20.65

# 2. Copy the installation script (or create it manually)
cat > /tmp/install-models.sh << 'EOF'
#!/bin/bash
ollama pull llama3.2:1b
ollama pull nomic-embed-text
ollama list
EOF

# 3. Make executable and run
chmod +x /tmp/install-models.sh
/tmp/install-models.sh
```

## Verification

After installing the models, verify from your local machine or Kubernetes cluster:

### From Local Machine

```bash
# List installed models
curl http://64.225.20.65:11434/api/tags | jq '.models[].name'

# Should show:
# - llama3.2:1b
# - nomic-embed-text
```

### From Kubernetes Cluster

```bash
# Test connectivity
kubectl run test-ollama --image=curlimages/curl --rm -it -- \
  curl -s http://64.225.20.65:11434/api/tags | jq '.models[].name'

# Test LLM model
kubectl run test-llm --image=curlimages/curl --rm -it -- \
  curl -s -X POST http://64.225.20.65:11434/api/chat \
  -H 'Content-Type: application/json' \
  -d '{"model":"llama3.2:1b","messages":[{"role":"user","content":"Hello"}],"stream":false}'

# Test embedding model
kubectl run test-embed --image=curlimages/curl --rm -it -- \
  curl -s -X POST http://64.225.20.65:11434/api/embeddings \
  -H 'Content-Type: application/json' \
  -d '{"model":"nomic-embed-text","prompt":"test"}'
```

## Troubleshooting

### Issue: Cannot SSH into Droplet

**Check:**
1. Droplet is running in DigitalOcean dashboard
2. SSH key is configured for root user
3. Firewall allows SSH (port 22)

**Solution:**
- Use DigitalOcean Console instead (Method 2)
- Check SSH key in DigitalOcean → Settings → Security → SSH Keys

### Issue: Ollama Not Installed

**Solution:**
```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Start Ollama service
systemctl start ollama
systemctl enable ollama

# Verify installation
ollama --version
```

### Issue: Model Download Fails

**Solutions:**
1. Check internet connectivity: `ping google.com`
2. Check disk space: `df -h` (need at least 2GB free)
3. Try again: `ollama pull llama3.2:1b`
4. Check Ollama logs: `journalctl -u ollama -f`

### Issue: Models Installed but Not Accessible

**Check:**
1. Ollama service is running: `systemctl status ollama`
2. Port 11434 is open: `netstat -tlnp | grep 11434`
3. Firewall allows port 11434: `ufw status` or `iptables -L`

**Solution:**
```bash
# Ensure Ollama is listening on all interfaces
export OLLAMA_HOST=0.0.0.0
systemctl restart ollama

# Or edit systemd service
systemctl edit ollama
# Add:
# [Service]
# Environment="OLLAMA_HOST=0.0.0.0"
# Then restart:
systemctl restart ollama
```

## Expected Output

After successful installation, `ollama list` should show:

```
NAME                SIZE        ID      MODIFIED
llama3.2:1b         1.3 GB      abc123  2 minutes ago
nomic-embed-text    274 MB      def456  1 minute ago
```

## Next Steps

Once models are installed:

1. ✅ **Verify from Kubernetes**: Test connectivity from cluster
2. ✅ **Test Backend**: Check backend logs for Ollama usage
3. ✅ **Test Features**: Run compliance assessment or document upload
4. ✅ **Monitor**: Watch logs for any errors

## Quick Reference

```bash
# AI Droplet IP
64.225.20.65

# SSH Command
ssh root@64.225.20.65

# Install Models
ollama pull llama3.2:1b
ollama pull nomic-embed-text

# Verify
ollama list
curl http://64.225.20.65:11434/api/tags | jq '.models[].name'

# Test from Kubernetes
kubectl run test --image=curlimages/curl --rm -it -- \
  curl -s http://64.225.20.65:11434/api/tags
```

---

**Status**: Configuration Complete, Models Need Installation  
**AI Droplet**: 64.225.20.65  
**Next Action**: Install models using one of the methods above
