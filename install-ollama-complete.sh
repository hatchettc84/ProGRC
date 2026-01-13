#!/bin/bash
set -e

echo "🚀 Starting Ollama installation..."

# Update system
echo "📦 Updating system..."
apt-get update -y
apt-get install -y curl wget ufw

# Method 1: Try official install script first
echo "📥 Attempting official installation method..."
if curl -fsSL https://ollama.com/install.sh | sh; then
    echo "✅ Official installation successful"
    OLLAMA_BIN=$(which ollama)
else
    echo "⚠️  Official install failed, trying manual installation..."
    
    # Method 2: Manual binary installation
    cd /tmp
    wget -q https://github.com/ollama/ollama/releases/latest/download/ollama-linux-amd64 -O ollama-linux-amd64
    chmod +x ollama-linux-amd64
    mkdir -p /usr/local/bin
    mv ollama-linux-amd64 /usr/local/bin/ollama
    OLLAMA_BIN=/usr/local/bin/ollama
    
    echo "✅ Manual installation complete"
fi

# Verify installation
if ! command -v ollama &> /dev/null; then
    echo "❌ Ollama installation failed. Trying snap method..."
    snap install ollama
    OLLAMA_BIN=/snap/bin/ollama
fi

# Verify ollama is available
if ! command -v ollama &> /dev/null; then
    echo "❌ ERROR: Ollama could not be installed. Please check logs."
    exit 1
fi

echo "✅ Ollama binary found at: $(which ollama)"
ollama --version

# Create ollama user if it doesn't exist
if ! id "ollama" &>/dev/null; then
    echo "👤 Creating ollama user..."
    useradd -r -s /bin/false -m -d /usr/share/ollama ollama || true
fi

# Create systemd service
echo "⚙️  Creating systemd service..."
cat > /etc/systemd/system/ollama.service <<'EOF'
[Unit]
Description=Ollama Service
After=network-online.target

[Service]
ExecStart=/usr/local/bin/ollama serve
User=ollama
Group=ollama
Restart=always
RestartSec=3
Environment="OLLAMA_HOST=0.0.0.0:11434"
Environment="OLLAMA_MODELS=/usr/share/ollama"

[Install]
WantedBy=default.target
EOF

# Update ExecStart if using snap
if [ -f /snap/bin/ollama ]; then
    sed -i 's|ExecStart=/usr/local/bin/ollama serve|ExecStart=/snap/bin/ollama serve|' /etc/systemd/system/ollama.service
    sed -i 's|Environment="OLLAMA_MODELS=/usr/share/ollama"|Environment="OLLAMA_MODELS=/var/snap/ollama/common/models"|' /etc/systemd/system/ollama.service
fi

# Update ExecStart with actual path
ACTUAL_OLLAMA=$(which ollama)
sed -i "s|ExecStart=.*|ExecStart=$ACTUAL_OLLAMA serve|" /etc/systemd/system/ollama.service

# Set permissions
mkdir -p /usr/share/ollama
chown -R ollama:ollama /usr/share/ollama 2>/dev/null || true

# Configure firewall
echo "🔥 Configuring firewall..."
ufw allow 22/tcp
ufw allow 11434/tcp
ufw --force enable || true

# Enable and start service
echo "🔄 Starting Ollama service..."
systemctl daemon-reload
systemctl enable ollama
systemctl start ollama

# Wait for service to start
echo "⏳ Waiting for Ollama to start..."
sleep 10

# Check status
if systemctl is-active --quiet ollama; then
    echo "✅ Ollama service is running!"
else
    echo "⚠️  Service may not be running. Checking logs..."
    journalctl -u ollama -n 20 --no-pager
    echo "🔄 Attempting to start again..."
    systemctl restart ollama
    sleep 5
fi

# Verify Ollama is accessible
echo "🔍 Verifying Ollama is accessible..."
if curl -s http://localhost:11434/api/version > /dev/null; then
    echo "✅ Ollama is responding!"
    
    # Download models
    echo "📥 Downloading models (this may take a few minutes)..."
    ollama pull llama3.2:1b
    ollama pull nomic-embed-text
    
    echo ""
    echo "✅ Installation complete!"
    echo "📋 Installed models:"
    ollama list
    
    echo ""
    echo "🌐 Ollama is accessible at: http://64.225.20.65:11434"
    echo "📊 Service status:"
    systemctl status ollama --no-pager -l
else
    echo "⚠️  Ollama is not responding. Checking status..."
    systemctl status ollama --no-pager -l
    journalctl -u ollama -n 30 --no-pager
fi


