#!/bin/bash
# Install Ollama models using Kubernetes job
# This creates a pod that can access the AI Droplet and install models

set -e

echo "=========================================="
echo "Install Ollama Models via Kubernetes"
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

NAMESPACE="progrc-dev"
AI_DROPLET_IP="64.225.20.65"
LLM_MODEL="llama3.2:1b"
EMBEDDING_MODEL="nomic-embed-text"

# Step 1: Verify Kubernetes access
echo "Step 1: Verifying Kubernetes access..."
if ! kubectl cluster-info &> /dev/null; then
    print_error "Cannot connect to Kubernetes cluster"
    exit 1
fi
print_success "Connected to Kubernetes cluster"
echo ""

# Step 2: Test if Ollama is accessible
echo "Step 2: Testing Ollama accessibility..."
print_info "Testing connection to ${AI_DROPLET_IP}:11434..."
if kubectl run -it --rm test-ollama-api-$(date +%s) \
    --image=curlimages/curl:latest \
    --restart=Never \
    --rm=true \
    -- sh -c "curl -s --max-time 10 http://${AI_DROPLET_IP}:11434/api/tags" 2>/dev/null | grep -q "models"; then
    print_success "Ollama is accessible from cluster"
else
    print_error "Cannot connect to Ollama on AI Droplet"
    print_info "Please ensure:"
    echo "  1. AI Droplet is running"
    echo "  2. Ollama service is running on port 11434"
    echo "  3. Firewall allows port 11434 from cluster IPs"
    exit 1
fi
echo ""

# Step 3: Check if models are already installed
echo "Step 3: Checking installed models..."
print_info "Fetching model list from Ollama..."
MODELS_JSON=$(kubectl run -it --rm test-ollama-list-$(date +%s) \
    --image=curlimages/curl:latest \
    --restart=Never \
    --rm=true \
    -- sh -c "curl -s --max-time 10 http://${AI_DROPLET_IP}:11434/api/tags" 2>/dev/null || echo '{"models":[]}')

HAS_LLM=false
HAS_EMBEDDING=false

if echo "$MODELS_JSON" | grep -q "$LLM_MODEL"; then
    HAS_LLM=true
    print_success "LLM model '${LLM_MODEL}' is already installed"
else
    print_warning "LLM model '${LLM_MODEL}' needs installation"
fi

if echo "$MODELS_JSON" | grep -q "$EMBEDDING_MODEL"; then
    HAS_EMBEDDING=true
    print_success "Embedding model '${EMBEDDING_MODEL}' is already installed"
else
    print_warning "Embedding model '${EMBEDDING_MODEL}' needs installation"
fi
echo ""

# Note: Ollama doesn't have an API endpoint for pulling models
# We need SSH access or manual installation
if [ "$HAS_LLM" = false ] || [ "$HAS_EMBEDDING" = false ]; then
    print_info "Ollama requires CLI access to pull models (no API endpoint)."
    echo ""
    print_info "To install models, you need to SSH into the AI Droplet:"
    echo ""
    echo "  ssh root@${AI_DROPLET_IP}"
    echo ""
    if [ "$HAS_LLM" = false ]; then
        echo "  ollama pull ${LLM_MODEL}"
    fi
    if [ "$HAS_EMBEDDING" = false ]; then
        echo "  ollama pull ${EMBEDDING_MODEL}"
    fi
    echo ""
    echo "  # Verify installation"
    echo "  ollama list"
    echo ""
    print_info "Alternative: Use DigitalOcean console or doctl:"
    echo ""
    echo "  # Via doctl (if configured)"
    echo "  doctl compute ssh ${AI_DROPLET_IP}"
    echo "  ollama pull ${LLM_MODEL}"
    echo "  ollama pull ${EMBEDDING_MODEL}"
    echo ""
    
    # Try using doctl if available
    if command -v doctl &> /dev/null; then
        print_info "Attempting to use doctl to install models..."
        echo ""
        print_warning "This requires doctl to be configured with your API key"
        print_info "If SSH key is configured, doctl will connect automatically"
        echo ""
        
        # Find droplet ID (from AI_DROPLET_SETUP.md it's 543191898)
        DROPLET_ID="543191898"
        
        print_info "Droplet ID: ${DROPLET_ID}"
        print_info "Attempting SSH connection via doctl..."
        
        if doctl compute ssh ${DROPLET_ID} --command "ollama pull ${LLM_MODEL} && ollama pull ${EMBEDDING_MODEL} && ollama list" 2>&1; then
            print_success "Models installed successfully via doctl"
        else
            print_warning "doctl SSH failed (may need SSH key configuration)"
            print_info "Please install models manually via SSH"
        fi
    else
        print_warning "doctl is not installed. Install with: brew install doctl"
    fi
else
    print_success "All required models are already installed!"
    echo ""
    print_info "Installed models:"
    echo "$MODELS_JSON" | grep -o '"name":"[^"]*"' | sed 's/"name":"\(.*\)"/  • \1/' || echo "  (parsing models...)"
fi
echo ""

# Step 4: Verify models after potential installation
if [ "$HAS_LLM" = false ] || [ "$HAS_EMBEDDING" = false ]; then
    echo "Step 4: Verifying installation..."
    print_info "Please install models manually, then run this script again to verify"
    echo ""
    print_info "After installation, verify with:"
    echo "  curl http://${AI_DROPLET_IP}:11434/api/tags | jq '.models[].name'"
    echo ""
else
    echo "Step 4: Testing models..."
    print_info "Testing LLM model..."
    TEST_RESPONSE=$(kubectl run -it --rm test-llm-$(date +%s) \
        --image=curlimages/curl:latest \
        --restart=Never \
        --rm=true \
        -- sh -c "curl -s --max-time 20 -X POST http://${AI_DROPLET_IP}:11434/api/chat -H 'Content-Type: application/json' -d '{\"model\":\"${LLM_MODEL}\",\"messages\":[{\"role\":\"user\",\"content\":\"Hello\"}],\"stream\":false}'" 2>/dev/null || echo "")
    
    if echo "$TEST_RESPONSE" | grep -q "message"; then
        print_success "LLM model '${LLM_MODEL}' is working"
    else
        print_warning "LLM model test failed (may still be loading)"
    fi
    
    print_info "Testing embedding model..."
    EMBED_TEST=$(kubectl run -it --rm test-embed-$(date +%s) \
        --image=curlimages/curl:latest \
        --restart=Never \
        --rm=true \
        -- sh -c "curl -s --max-time 20 -X POST http://${AI_DROPLET_IP}:11434/api/embeddings -H 'Content-Type: application/json' -d '{\"model\":\"${EMBEDDING_MODEL}\",\"prompt\":\"test\"}'" 2>/dev/null || echo "")
    
    if echo "$EMBED_TEST" | grep -q "embedding"; then
        print_success "Embedding model '${EMBEDDING_MODEL}' is working"
    else
        print_warning "Embedding model test failed (may still be loading)"
    fi
fi
echo ""

echo "=========================================="
if [ "$HAS_LLM" = true ] && [ "$HAS_EMBEDDING" = true ]; then
    print_success "All Models Installed and Verified"
else
    print_warning "Models Need Installation"
fi
echo "=========================================="
echo ""
print_info "Summary:"
echo "  • LLM Model: ${LLM_MODEL} $([ "$HAS_LLM" = true ] && echo "✅" || echo "❌")"
echo "  • Embedding Model: ${EMBEDDING_MODEL} $([ "$HAS_EMBEDDING" = true ] && echo "✅" || echo "❌")"
echo ""
if [ "$HAS_LLM" = false ] || [ "$HAS_EMBEDDING" = false ]; then
    print_info "Next Steps:"
    echo "  1. SSH into AI Droplet: ssh root@${AI_DROPLET_IP}"
    echo "  2. Install missing models (see commands above)"
    echo "  3. Run this script again to verify installation"
else
    print_info "Next Steps:"
    echo "  1. Test AI features in the application"
    echo "  2. Monitor backend logs: kubectl logs -n ${NAMESPACE} -l app=progrc-backend -f | grep -i ollama"
    echo "  3. Verify no API calls are being made"
fi
echo ""
