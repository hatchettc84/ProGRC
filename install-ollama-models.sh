#!/bin/bash
# Install required Ollama models on AI Droplet
# This script can be run locally or on the AI Droplet

set -e

echo "=========================================="
echo "Install Ollama Models on AI Droplet"
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

AI_DROPLET_IP="64.225.20.65"
LLM_MODEL="llama3.2:1b"
EMBEDDING_MODEL="nomic-embed-text"

# Check if running on AI Droplet or remotely
if [ -f /etc/os-release ] && grep -q "Ubuntu" /etc/os-release; then
    IS_DROPLET=true
    print_info "Running on AI Droplet directly"
else
    IS_DROPLET=false
    print_info "Running remotely, will SSH into AI Droplet"
fi

install_models() {
    local host=$1
    print_info "Installing models on ${host}..."
    echo ""
    
    # Check if Ollama is installed
    if ssh -o StrictHostKeyChecking=no root@${host} "command -v ollama >/dev/null 2>&1"; then
        print_success "Ollama is installed"
    else
        print_error "Ollama is not installed on ${host}"
        print_info "Please install Ollama first:"
        echo "  curl -fsSL https://ollama.com/install.sh | sh"
        exit 1
    fi
    echo ""
    
    # Check if Ollama service is running
    if ssh root@${host} "systemctl is-active --quiet ollama"; then
        print_success "Ollama service is running"
    else
        print_warning "Ollama service is not running, starting it..."
        ssh root@${host} "systemctl start ollama || service ollama start"
        sleep 2
    fi
    echo ""
    
    # Install LLM model
    print_info "Installing LLM model: ${LLM_MODEL}..."
    print_warning "This may take several minutes (model size ~1.3GB)..."
    if ssh root@${host} "ollama pull ${LLM_MODEL}"; then
        print_success "LLM model '${LLM_MODEL}' installed successfully"
    else
        print_error "Failed to install LLM model"
        exit 1
    fi
    echo ""
    
    # Install embedding model
    print_info "Installing embedding model: ${EMBEDDING_MODEL}..."
    print_warning "This may take several minutes (model size ~274MB)..."
    if ssh root@${host} "ollama pull ${EMBEDDING_MODEL}"; then
        print_success "Embedding model '${EMBEDDING_MODEL}' installed successfully"
    else
        print_error "Failed to install embedding model"
        exit 1
    fi
    echo ""
    
    # Verify models are installed
    print_info "Verifying installed models..."
    echo ""
    ssh root@${host} "ollama list"
    echo ""
    
    # Test models
    print_info "Testing LLM model..."
    TEST_RESPONSE=$(ssh root@${host} "curl -s -X POST http://localhost:11434/api/chat -H 'Content-Type: application/json' -d '{\"model\":\"${LLM_MODEL}\",\"messages\":[{\"role\":\"user\",\"content\":\"Say hello\"}],\"stream\":false}'" | grep -q "message" && echo "OK" || echo "FAIL")
    if [ "$TEST_RESPONSE" = "OK" ]; then
        print_success "LLM model is working"
    else
        print_warning "LLM model test failed (may need more time to load)"
    fi
    echo ""
    
    print_info "Testing embedding model..."
    EMBED_TEST=$(ssh root@${host} "curl -s -X POST http://localhost:11434/api/embeddings -H 'Content-Type: application/json' -d '{\"model\":\"${EMBEDDING_MODEL}\",\"prompt\":\"test\"}'" | grep -q "embedding" && echo "OK" || echo "FAIL")
    if [ "$EMBED_TEST" = "OK" ]; then
        print_success "Embedding model is working"
    else
        print_warning "Embedding model test failed (may need more time to load)"
    fi
    echo ""
}

if [ "$IS_DROPLET" = true ]; then
    # Running directly on droplet
    print_info "Installing models locally..."
    echo ""
    
    # Check if Ollama is installed
    if command -v ollama >/dev/null 2>&1; then
        print_success "Ollama is installed"
    else
        print_error "Ollama is not installed"
        exit 1
    fi
    
    # Start Ollama if not running
    if systemctl is-active --quiet ollama || service ollama status >/dev/null 2>&1; then
        print_success "Ollama service is running"
    else
        print_warning "Starting Ollama service..."
        systemctl start ollama || service ollama start
        sleep 2
    fi
    
    # Install models
    print_info "Installing LLM model: ${LLM_MODEL}..."
    ollama pull ${LLM_MODEL}
    print_success "LLM model installed"
    
    print_info "Installing embedding model: ${EMBEDDING_MODEL}..."
    ollama pull ${EMBEDDING_MODEL}
    print_success "Embedding model installed"
    
    # Verify
    print_info "Installed models:"
    ollama list
    
else
    # Running remotely, SSH into droplet
    print_info "Connecting to AI Droplet at ${AI_DROPLET_IP}..."
    
    # Test SSH connectivity
    if ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no root@${AI_DROPLET_IP} "echo 'Connected'" >/dev/null 2>&1; then
        print_success "SSH connection successful"
        install_models ${AI_DROPLET_IP}
    else
        print_error "Cannot connect to AI Droplet via SSH"
        print_info "Please ensure:"
        echo "  1. SSH key is configured for root@${AI_DROPLET_IP}"
        echo "  2. Firewall allows SSH (port 22)"
        echo "  3. Droplet is running"
        echo ""
        print_info "Alternative: Run this script directly on the AI Droplet:"
        echo "  ssh root@${AI_DROPLET_IP}"
        echo "  curl -O https://raw.githubusercontent.com/your-repo/install-ollama-models.sh"
        echo "  bash install-ollama-models.sh"
        exit 1
    fi
fi

echo "=========================================="
print_success "Model Installation Complete"
echo "=========================================="
echo ""
print_info "Installed models:"
echo "  • LLM: ${LLM_MODEL}"
echo "  • Embedding: ${EMBEDDING_MODEL}"
echo ""
print_info "Next steps:"
echo "  1. Verify models: curl http://${AI_DROPLET_IP}:11434/api/tags | jq '.models[].name'"
echo "  2. Test from Kubernetes: kubectl run test --image=curlimages/curl --rm -it -- curl http://${AI_DROPLET_IP}:11434/api/tags"
echo "  3. Monitor backend logs: kubectl logs -n progrc-dev -l app=progrc-backend -f | grep -i ollama"
echo ""
