# Run Fix Script on AI Droplet

## Quick Fix Instructions

Since we can't SSH directly into the droplet from here, please run this script on the AI Droplet:

### Option 1: Copy and Run Script

1. **Copy the script to the droplet:**

```bash
# From your local machine, copy the script
scp fix-ollama-external-access.sh root@64.225.20.65:/root/

# Or create it directly on the droplet
```

2. **SSH into the droplet and run:**

```bash
ssh root@64.225.20.65
chmod +x fix-ollama-external-access.sh
./fix-ollama-external-access.sh
```

### Option 2: Run Commands Manually

If you prefer to run commands manually, execute these on the droplet:

```bash
# 1. Fix dpkg
dpkg --configure -a

# 2. Create override directory
mkdir -p /etc/systemd/system/ollama.service.d

# 3. Create override file
cat > /etc/systemd/system/ollama.service.d/override.conf << 'EOF'
[Service]
Environment="OLLAMA_HOST=0.0.0.0"
EOF

# 4. Reload and restart
systemctl daemon-reload
systemctl restart ollama

# 5. Verify
ss -tlnp | grep 11434
# Should show: 0.0.0.0:11434 (not 127.0.0.1:11434)

# 6. Test
curl http://64.225.20.65:11434/api/tags
```

### Option 3: Use DigitalOcean Console

1. Go to DigitalOcean Control Panel
2. Navigate to Droplets → `progrc-ai-droplet`
3. Click **Access** → **Launch Droplet Console**
4. Run the commands above or the script

## What the Script Does

1. ✅ Fixes any dpkg issues
2. ✅ Creates systemd override directory
3. ✅ Sets `OLLAMA_HOST=0.0.0.0` in override file
4. ✅ Reloads systemd configuration
5. ✅ Restarts Ollama service
6. ✅ Verifies Ollama is listening on all interfaces
7. ✅ Tests local and external API access
8. ✅ Checks firewall configuration

## Verification

After running the script, verify:

```bash
# Should show 0.0.0.0:11434 (not 127.0.0.1:11434)
ss -tlnp | grep 11434

# Should return JSON (may be empty if no models)
curl http://64.225.20.65:11434/api/tags
```

## Next Steps

Once Ollama is accessible externally:

```bash
# Install models
ollama pull llama3.2:1b
ollama pull nomic-embed-text

# Verify
ollama list
curl http://64.225.20.65:11434/api/tags
```
