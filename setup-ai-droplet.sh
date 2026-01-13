#!/bin/bash
set -e

echo "🚀 Setting up ProGRC AI Droplet..."

# Update system
echo "📦 Updating system packages..."
sudo apt-get update -y
sudo apt-get upgrade -y

# Install dependencies
echo "📦 Installing dependencies..."
sudo apt-get install -y curl wget git build-essential

# Install Ollama
echo "🤖 Installing Ollama..."
curl -fsSL https://ollama.com/install.sh | sh

# Start Ollama service
echo "🔄 Starting Ollama service..."
sudo systemctl enable ollama
sudo systemctl start ollama

# Wait for Ollama to be ready
echo "⏳ Waiting for Ollama to be ready..."
sleep 5

# Download models
echo "📥 Downloading AI models..."
ollama pull llama3.2:1b
ollama pull nomic-embed-text  # For embeddings

# Configure Ollama to listen on all interfaces (for K8s access)
echo "🔧 Configuring Ollama..."
sudo mkdir -p /etc/systemd/system/ollama.service.d
sudo tee /etc/systemd/system/ollama.service.d/override.conf > /dev/null <<EOF
[Service]
Environment="OLLAMA_HOST=0.0.0.0:11434"
EOF

sudo systemctl daemon-reload
sudo systemctl restart ollama

# Configure firewall (UFW)
echo "🔥 Configuring firewall..."
sudo ufw allow 22/tcp
sudo ufw allow 11434/tcp
sudo ufw --force enable

# Verify installation
echo "✅ Verifying installation..."
sleep 3
ollama list

echo ""
echo "✅ AI Droplet setup complete!"
echo "📍 Ollama is running on: http://167.172.29.161:11434"
echo "📋 Available models:"
ollama list


