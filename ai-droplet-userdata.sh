#!/bin/bash
# Cloud-init script for ProGRC AI Droplet

# Update system
apt-get update -y
apt-get upgrade -y

# Install dependencies
apt-get install -y curl wget git build-essential ufw

# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Configure Ollama to listen on all interfaces
mkdir -p /etc/systemd/system/ollama.service.d
cat > /etc/systemd/system/ollama.service.d/override.conf <<EOF
[Service]
Environment="OLLAMA_HOST=0.0.0.0:11434"
EOF

systemctl daemon-reload
systemctl enable ollama
systemctl start ollama

# Wait for Ollama to be ready
sleep 10

# Download models
ollama pull llama3.2:1b
ollama pull nomic-embed-text

# Configure firewall
ufw allow 22/tcp
ufw allow 11434/tcp
ufw --force enable

# Create a status file
echo "Ollama setup complete at $(date)" > /root/ollama-setup-complete.txt


