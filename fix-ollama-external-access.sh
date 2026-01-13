#!/bin/bash
# Fix Ollama to listen on all interfaces (0.0.0.0) instead of just localhost
# Run this script on the AI Droplet: root@64.225.20.65

set -e

echo "=========================================="
echo "Fixing Ollama External Access"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }

# Step 1: Fix dpkg if needed
echo "Step 1: Checking dpkg status..."
if dpkg --configure -a 2>&1 | grep -q "error"; then
    print_warning "Fixing interrupted dpkg..."
    dpkg --configure -a
    print_success "dpkg fixed"
else
    print_success "dpkg is OK"
fi
echo ""

# Step 2: Create override directory
echo "Step 2: Creating systemd override directory..."
mkdir -p /etc/systemd/system/ollama.service.d
print_success "Override directory created"
echo ""

# Step 3: Create override file
echo "Step 3: Creating override configuration..."
cat > /etc/systemd/system/ollama.service.d/override.conf << 'EOF'
[Service]
Environment="OLLAMA_HOST=0.0.0.0"
EOF
print_success "Override file created with OLLAMA_HOST=0.0.0.0"
echo ""

# Step 4: Verify override file
echo "Step 4: Verifying configuration..."
if grep -q "OLLAMA_HOST=0.0.0.0" /etc/systemd/system/ollama.service.d/override.conf; then
    print_success "Configuration verified"
    echo ""
    print_info "Override file contents:"
    cat /etc/systemd/system/ollama.service.d/override.conf
else
    print_error "Configuration verification failed"
    exit 1
fi
echo ""

# Step 5: Reload systemd
echo "Step 5: Reloading systemd daemon..."
systemctl daemon-reload
print_success "Systemd reloaded"
echo ""

# Step 6: Restart Ollama
echo "Step 6: Restarting Ollama service..."
systemctl stop ollama
sleep 2
systemctl start ollama
sleep 3
print_success "Ollama restarted"
echo ""

# Step 7: Check service status
echo "Step 7: Checking Ollama service status..."
if systemctl is-active --quiet ollama; then
    print_success "Ollama service is running"
else
    print_error "Ollama service is not running"
    systemctl status ollama --no-pager | head -20
    exit 1
fi
echo ""

# Step 8: Verify listening interface
echo "Step 8: Verifying Ollama is listening on all interfaces..."
if command -v ss >/dev/null 2>&1; then
    LISTENING=$(ss -tlnp | grep 11434 || echo "")
else
    # Install net-tools if needed
    apt install -y net-tools >/dev/null 2>&1
    LISTENING=$(netstat -tlnp | grep 11434 || echo "")
fi

if echo "$LISTENING" | grep -q "0.0.0.0:11434\|:::11434"; then
    print_success "Ollama is listening on all interfaces (0.0.0.0)"
    echo ""
    print_info "Listening on:"
    echo "$LISTENING"
elif echo "$LISTENING" | grep -q "127.0.0.1:11434"; then
    print_error "Ollama is still only listening on localhost (127.0.0.1)"
    echo ""
    print_info "Current listening:"
    echo "$LISTENING"
    echo ""
    print_warning "Trying alternative fix..."
    # Try setting environment variable directly in service file
    if [ -f /etc/systemd/system/ollama.service ]; then
        sed -i 's/ExecStart=\/usr\/local\/bin\/ollama serve/ExecStart=\/usr\/bin\/env OLLAMA_HOST=0.0.0.0 \/usr\/local\/bin\/ollama serve/' /etc/systemd/system/ollama.service
        systemctl daemon-reload
        systemctl restart ollama
        sleep 3
        LISTENING=$(ss -tlnp 2>/dev/null | grep 11434 || netstat -tlnp 2>/dev/null | grep 11434 || echo "")
        if echo "$LISTENING" | grep -q "0.0.0.0:11434\|:::11434"; then
            print_success "Fixed! Ollama is now listening on all interfaces"
        else
            print_error "Still not working. Please check manually."
        fi
    fi
else
    print_warning "Could not determine listening interface"
    echo "$LISTENING"
fi
echo ""

# Step 9: Test local access
echo "Step 9: Testing local API access..."
if curl -s http://localhost:11434/api/tags >/dev/null 2>&1; then
    print_success "Local API access working"
    curl -s http://localhost:11434/api/tags
else
    print_error "Local API access failed"
fi
echo ""

# Step 10: Test external access
echo "Step 10: Testing external API access..."
EXTERNAL_IP=$(curl -s ifconfig.me || curl -s icanhazip.com || echo "64.225.20.65")
if curl -s --max-time 5 http://${EXTERNAL_IP}:11434/api/tags >/dev/null 2>&1; then
    print_success "External API access working"
    curl -s http://${EXTERNAL_IP}:11434/api/tags
else
    print_warning "External API access test failed (may be firewall issue)"
    print_info "Check firewall: ufw status"
    print_info "Allow port: ufw allow 11434/tcp"
fi
echo ""

# Step 11: Check firewall
echo "Step 11: Checking firewall status..."
if command -v ufw >/dev/null 2>&1; then
    UFW_STATUS=$(ufw status | head -1)
    if echo "$UFW_STATUS" | grep -q "Status: active"; then
        print_warning "Firewall is active"
        if ufw status | grep -q "11434"; then
            print_success "Port 11434 is allowed in firewall"
        else
            print_warning "Port 11434 may not be allowed"
            print_info "To allow: ufw allow 11434/tcp && ufw reload"
        fi
    else
        print_info "Firewall is not active (or not configured)"
    fi
else
    print_info "ufw not installed, checking iptables..."
    if iptables -L -n 2>/dev/null | grep -q "11434"; then
        print_info "Found iptables rules for port 11434"
    else
        print_info "No iptables rules found for port 11434"
    fi
fi
echo ""

# Summary
echo "=========================================="
echo "✅ Configuration Complete"
echo "=========================================="
echo ""
print_info "Summary:"
echo "  • Override file: /etc/systemd/system/ollama.service.d/override.conf"
echo "  • OLLAMA_HOST: 0.0.0.0"
echo "  • Service status: $(systemctl is-active ollama)"
echo ""
print_info "Next steps:"
echo "  1. Verify: ss -tlnp | grep 11434 (should show 0.0.0.0:11434)"
echo "  2. Test: curl http://64.225.20.65:11434/api/tags"
echo "  3. Install models: ollama pull llama3.2:1b && ollama pull nomic-embed-text"
echo ""
