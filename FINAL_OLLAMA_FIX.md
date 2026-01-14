# Final Ollama Fix on VPS

## Issue
Ollama is only listening on `127.0.0.1:11434`, Docker container can't access it.

## Quick Fix

Run these commands on your VPS:

```bash
cd /opt/progrc/bff-service-backend-dev

# Option 1: Use the fix script
chmod +x fix-ollama-host-access.sh
sudo ./fix-ollama-host-access.sh

# Option 2: Manual fix
sudo systemctl stop ollama
sudo mkdir -p /etc/systemd/system/ollama.service.d
sudo tee /etc/systemd/system/ollama.service.d/override.conf > /dev/null << 'EOF'
[Service]
Environment="OLLAMA_HOST=0.0.0.0:11434"
EOF
sudo systemctl daemon-reload
sudo systemctl start ollama

# Verify
ss -tlnp | grep 11434
# Should show: 0.0.0.0:11434 (not 127.0.0.1:11434)

# Test from Docker
docker-compose exec app node -e "const http = require('http'); http.get('http://host.docker.internal:11434/api/tags', (res) => { let data = ''; res.on('data', (chunk) => data += chunk); res.on('end', () => console.log(data)); }).on('error', (e) => console.error('Error:', e.message));"
```

## Fix Database Password

```bash
# Use the fix script
chmod +x fix-database-password.sh
./fix-database-password.sh

# Or manually sync passwords between .env and docker-compose.yml
```

## After Fixes

1. Ollama accessible from container ✅
2. Database connection working ✅
3. Test compliance scoring:
   - Upload source document
   - Trigger compliance sync
   - Watch percentage scores increase
   - Check control statements are generated
