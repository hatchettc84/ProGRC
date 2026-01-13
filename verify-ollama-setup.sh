#!/bin/bash
# Script to verify and fix Ollama setup on the AI droplet

echo "🔍 Checking Ollama status..."

# Check if Ollama is installed
if ! command -v ollama &> /dev/null; then
    echo "❌ Ollama is not installed. Installing now..."
    curl -fsSL https://ollama.com/install.sh | sh
fi

# Check if Ollama service is running
if ! systemctl is-active --quiet ollama; then
    echo "⚠️  Ollama service is not running. Starting..."
    systemctl enable ollama
    systemctl start ollama
    sleep 5
fi

# Check if Ollama is listening on the correct port
if ! netstat -tuln | grep -q ":11434"; then
    echo "⚠️  Ollama is not listening on port 11434. Checking configuration..."
    
    # Ensure Ollama is configured to listen on all interfaces
    mkdir -p /etc/systemd/system/ollama.service.d
    cat > /etc/systemd/system/ollama.service.d/override.conf <<EOF
[Service]
Environment="OLLAMA_HOST=0.0.0.0:11434"
EOF
    
    systemctl daemon-reload
    systemctl restart ollama
    sleep 5
fi

# Check firewall
if command -v ufw &> /dev/null; then
    if ! ufw status | grep -q "11434"; then
        echo "🔥 Configuring firewall..."
        ufw allow 11434/tcp
        ufw --force enable
    fi
fi

# Verify Ollama is accessible
sleep 3
if curl -s http://localhost:11434/api/tags > /dev/null; then
    echo "✅ Ollama is running locally!"
    
    # Check models
    MODELS=$(ollama list 2>/dev/null | tail -n +2 | wc -l)
    echo "📦 Models installed: $MODELS"
    
    if [ "$MODELS" -eq 0 ]; then
        echo "📥 No models found. Downloading models..."
        ollama pull llama3.2:1b
        ollama pull nomic-embed-text
    fi
    
    # Test external access
    EXTERNAL_IP=$(curl -s ifconfig.me)
    echo "🌐 External IP: $EXTERNAL_IP"
    echo "✅ Setup complete! Ollama should be accessible at http://$EXTERNAL_IP:11434"
else
    echo "❌ Ollama is not responding. Checking logs..."
    journalctl -u ollama --no-pager -n 20
fi


