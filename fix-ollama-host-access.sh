#!/bin/bash
# Fix Ollama to listen on all interfaces for Docker access

set -e

echo "Configuring Ollama to listen on all interfaces..."

# Stop Ollama
echo "Stopping Ollama..."
sudo systemctl stop ollama || true

# Create override directory
sudo mkdir -p /etc/systemd/system/ollama.service.d

# Create override file
echo "Creating systemd override..."
sudo tee /etc/systemd/system/ollama.service.d/override.conf > /dev/null << 'EOF'
[Service]
Environment="OLLAMA_HOST=0.0.0.0:11434"
EOF

# Reload systemd
echo "Reloading systemd..."
sudo systemctl daemon-reload

# Start Ollama
echo "Starting Ollama..."
sudo systemctl start ollama

# Wait a moment
sleep 2

# Verify
echo "Verifying Ollama is listening on all interfaces..."
ss -tlnp | grep 11434 || netstat -tlnp | grep 11434

echo "✅ Ollama configured to listen on 0.0.0.0:11434"
echo ""
echo "Test from host:"
echo "  curl http://localhost:11434/api/tags"
echo ""
echo "Test from Docker:"
echo "  docker-compose exec app node -e \"const http = require('http'); http.get('http://host.docker.internal:11434/api/tags', (res) => { let data = ''; res.on('data', (chunk) => data += chunk); res.on('end', () => console.log(data)); }).on('error', (e) => console.error('Error:', e.message));\""
