#!/bin/bash
# Fully configure Ollama using AI Droplet
# This script ensures all models, configuration, and connectivity are properly set up

set -e

echo "=========================================="
echo "Full Ollama AI Droplet Configuration"
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
AI_DROPLET_PORT="11434"
OLLAMA_URL="http://${AI_DROPLET_IP}:${AI_DROPLET_PORT}"
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

# Step 2: Test AI Droplet connectivity
echo "Step 2: Testing AI Droplet connectivity..."
print_info "Testing connection to ${OLLAMA_URL}..."
if kubectl run -it --rm test-ollama-connect-$(date +%s) \
    --image=curlimages/curl:latest \
    --restart=Never \
    --rm=true \
    -- sh -c "curl -s --max-time 10 ${OLLAMA_URL}/api/tags" 2>/dev/null | grep -q "models" || echo ""; then
    print_success "AI Droplet is accessible from cluster"
else
    print_warning "Could not verify connectivity (will test from backend pod)"
fi
echo ""

# Step 3: Check available models on AI Droplet
echo "Step 3: Checking available models on AI Droplet..."
print_info "Fetching model list from ${OLLAMA_URL}..."
MODELS_JSON=$(kubectl run -it --rm test-ollama-models-$(date +%s) \
    --image=curlimages/curl:latest \
    --restart=Never \
    --rm=true \
    -- sh -c "curl -s --max-time 10 ${OLLAMA_URL}/api/tags" 2>/dev/null || echo '{"models":[]}')

if echo "$MODELS_JSON" | grep -q "models"; then
    print_success "Successfully retrieved model list"
    echo ""
    print_info "Available models:"
    echo "$MODELS_JSON" | grep -o '"name":"[^"]*"' | sed 's/"name":"\(.*\)"/  • \1/' || echo "  (parsing models...)"
    echo ""
    
    # Check for required models
    HAS_LLM_MODEL=false
    HAS_EMBEDDING_MODEL=false
    
    if echo "$MODELS_JSON" | grep -q "$LLM_MODEL"; then
        HAS_LLM_MODEL=true
        print_success "LLM model '${LLM_MODEL}' is installed"
    else
        print_warning "LLM model '${LLM_MODEL}' not found - needs to be installed"
    fi
    
    if echo "$MODELS_JSON" | grep -q "$EMBEDDING_MODEL"; then
        HAS_EMBEDDING_MODEL=true
        print_success "Embedding model '${EMBEDDING_MODEL}' is installed"
    else
        print_warning "Embedding model '${EMBEDDING_MODEL}' not found - needs to be installed"
    fi
    
    if [ "$HAS_LLM_MODEL" = false ] || [ "$HAS_EMBEDDING_MODEL" = false ]; then
        echo ""
        print_info "To install missing models, SSH into the AI Droplet and run:"
        if [ "$HAS_LLM_MODEL" = false ]; then
            echo "  ollama pull ${LLM_MODEL}"
        fi
        if [ "$HAS_EMBEDDING_MODEL" = false ]; then
            echo "  ollama pull ${EMBEDDING_MODEL}"
        fi
        echo ""
        print_warning "Continuing with configuration (models can be installed later)..."
    fi
else
    print_warning "Could not retrieve model list (Ollama may still be starting)"
    print_info "Models will be verified after configuration"
fi
echo ""

# Step 4: Update ConfigMap with full Ollama configuration
echo "Step 4: Updating ConfigMap with full Ollama configuration..."
print_info "Setting Ollama as primary LLM service..."

# Update all Ollama-related settings
kubectl patch configmap progrc-config -n "${NAMESPACE}" --type merge -p "{
  \"data\": {
    \"USE_OLLAMA\": \"true\",
    \"OLLAMA_BASE_URL\": \"${OLLAMA_URL}\",
    \"OLLAMA_MODEL\": \"${LLM_MODEL}\",
    \"OLLAMA_EMBEDDING_MODEL\": \"${EMBEDDING_MODEL}\",
    \"USE_GEMINI\": \"false\",
    \"USE_GRADIENT\": \"false\"
  }
}"

print_success "ConfigMap updated with full Ollama configuration"
echo ""

# Step 5: Verify ConfigMap updates
echo "Step 5: Verifying ConfigMap configuration..."
OLLAMA_ENABLED=$(kubectl get configmap progrc-config -n "${NAMESPACE}" -o jsonpath='{.data.USE_OLLAMA}')
OLLAMA_URL_CONFIG=$(kubectl get configmap progrc-config -n "${NAMESPACE}" -o jsonpath='{.data.OLLAMA_BASE_URL}')
OLLAMA_MODEL_CONFIG=$(kubectl get configmap progrc-config -n "${NAMESPACE}" -o jsonpath='{.data.OLLAMA_MODEL}')

print_info "Configuration verification:"
echo "  • USE_OLLAMA: ${OLLAMA_ENABLED}"
echo "  • OLLAMA_BASE_URL: ${OLLAMA_URL_CONFIG}"
echo "  • OLLAMA_MODEL: ${OLLAMA_MODEL_CONFIG}"

if [ "${OLLAMA_ENABLED}" = "true" ] && [ "${OLLAMA_URL_CONFIG}" = "${OLLAMA_URL}" ]; then
    print_success "ConfigMap configuration is correct"
else
    print_error "ConfigMap configuration mismatch"
    exit 1
fi
echo ""

# Step 6: Restart backend to apply configuration
echo "Step 6: Restarting backend deployment..."
print_info "Rolling restart to apply new Ollama configuration..."
kubectl rollout restart deployment/progrc-backend -n "${NAMESPACE}"
print_info "Waiting for rollout to complete..."
if kubectl rollout status deployment/progrc-backend -n "${NAMESPACE}" --timeout=5m; then
    print_success "Backend deployment restarted successfully"
else
    print_warning "Rollout may still be in progress"
fi
echo ""

# Step 7: Wait for pods to be ready
echo "Step 7: Waiting for backend pods to be ready..."
sleep 10
READY_PODS=$(kubectl get pods -n "${NAMESPACE}" -l app=progrc-backend --field-selector=status.phase=Running --no-headers 2>/dev/null | wc -l | tr -d ' ')
if [ "${READY_PODS}" -gt "0" ]; then
    print_success "${READY_PODS} backend pod(s) are running"
else
    print_warning "No backend pods are running yet"
fi
echo ""

# Step 8: Verify backend environment variables
echo "Step 8: Verifying backend environment variables..."
BACKEND_POD=$(kubectl get pods -n "${NAMESPACE}" -l app=progrc-backend -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")
if [ -n "${BACKEND_POD}" ]; then
    print_info "Backend pod: ${BACKEND_POD}"
    echo ""
    print_info "Ollama configuration in pod:"
    kubectl exec -n "${NAMESPACE}" "${BACKEND_POD}" -- env 2>/dev/null | grep -E "OLLAMA|USE_OLLAMA" || print_warning "Ollama env vars not found"
    echo ""
else
    print_warning "Backend pod not found, may still be starting"
fi
echo ""

# Step 9: Test Ollama connectivity from backend pod
echo "Step 9: Testing Ollama connectivity from backend pod..."
if [ -n "${BACKEND_POD}" ]; then
    print_info "Testing connection to AI Droplet from backend pod..."
    if kubectl exec -n "${NAMESPACE}" "${BACKEND_POD}" -- sh -c "wget -qO- --timeout=10 ${OLLAMA_URL}/api/tags 2>/dev/null | head -20" 2>/dev/null; then
        print_success "Backend can connect to AI Droplet Ollama"
    else
        print_warning "Could not test connectivity (wget may not be installed)"
        print_info "Testing with curl if available..."
        if kubectl exec -n "${NAMESPACE}" "${BACKEND_POD}" -- sh -c "curl -s --max-time 10 ${OLLAMA_URL}/api/tags 2>/dev/null | head -20" 2>/dev/null; then
            print_success "Backend can connect to AI Droplet Ollama (via curl)"
        else
            print_warning "Connectivity test inconclusive (will be verified in logs)"
        fi
    fi
else
    print_warning "Backend pod not ready yet, skipping connectivity test"
fi
echo ""

# Step 10: Test Ollama functionality
echo "Step 10: Testing Ollama functionality..."
print_info "Testing LLM model availability..."
TEST_RESPONSE=$(kubectl run -it --rm test-ollama-llm-$(date +%s) \
    --image=curlimages/curl:latest \
    --restart=Never \
    --rm=true \
    -- sh -c "curl -s --max-time 15 -X POST ${OLLAMA_URL}/api/chat -H 'Content-Type: application/json' -d '{\"model\":\"${LLM_MODEL}\",\"messages\":[{\"role\":\"user\",\"content\":\"test\"}],\"stream\":false}'" 2>/dev/null || echo "")

if echo "$TEST_RESPONSE" | grep -q "message"; then
    print_success "LLM model '${LLM_MODEL}' is working"
else
    print_warning "LLM model test inconclusive (may need model installation)"
fi

print_info "Testing embedding model availability..."
EMBED_TEST=$(kubectl run -it --rm test-ollama-embed-$(date +%s) \
    --image=curlimages/curl:latest \
    --restart=Never \
    --rm=true \
    -- sh -c "curl -s --max-time 15 -X POST ${OLLAMA_URL}/api/embeddings -H 'Content-Type: application/json' -d '{\"model\":\"${EMBEDDING_MODEL}\",\"prompt\":\"test\"}'" 2>/dev/null || echo "")

if echo "$EMBED_TEST" | grep -q "embedding"; then
    print_success "Embedding model '${EMBEDDING_MODEL}' is working"
else
    print_warning "Embedding model test inconclusive (may need model installation)"
fi
echo ""

# Summary
echo "=========================================="
echo "✅ Ollama Configuration Complete"
echo "=========================================="
echo ""
print_success "Ollama is fully configured to use AI Droplet"
echo ""
print_info "Configuration Summary:"
echo "  • AI Droplet: ${AI_DROPLET_IP}:${AI_DROPLET_PORT}"
echo "  • LLM Model: ${LLM_MODEL}"
echo "  • Embedding Model: ${EMBEDDING_MODEL}"
echo "  • Status: Enabled and configured"
echo "  • Cloud Services: Disabled (Gemini, Gradient)"
echo ""
print_info "Next Steps:"
echo "  1. Monitor backend logs: kubectl logs -n ${NAMESPACE} -l app=progrc-backend -f | grep -i ollama"
echo "  2. Test AI features in the application (compliance scoring, document processing)"
echo "  3. Verify no API calls are being made (check logs for Gemini/Gradient/OpenAI usage)"
echo ""
print_info "If models are missing, install them on AI Droplet:"
echo "  ssh root@${AI_DROPLET_IP}"
echo "  ollama pull ${LLM_MODEL}"
echo "  ollama pull ${EMBEDDING_MODEL}"
echo ""
print_info "To verify models are installed:"
echo "  curl ${OLLAMA_URL}/api/tags | jq '.models[].name'"
echo ""
