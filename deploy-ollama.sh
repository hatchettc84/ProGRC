#!/bin/bash
# Deploy Ollama service to Kubernetes and configure it as primary LLM
# This eliminates external API calls for compliance scoring and chunking

set -e

echo "=========================================="
echo "Ollama Deployment & Configuration"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_info() { echo -e "ℹ️  $1"; }

NAMESPACE="progrc-dev"

# Step 1: Check prerequisites
print_info "Step 1: Checking prerequisites..."
if ! command -v kubectl &> /dev/null; then
    print_error "kubectl is not installed"
    exit 1
fi
print_success "kubectl found"

if ! kubectl cluster-info &> /dev/null; then
    print_error "Cannot connect to Kubernetes cluster"
    exit 1
fi
print_success "Connected to Kubernetes cluster"
echo ""

# Step 2: Deploy Ollama service
print_info "Step 2: Deploying Ollama service..."
if kubectl apply -f k8s/services/ollama.yaml; then
    print_success "Ollama deployment created"
else
    print_error "Failed to deploy Ollama"
    exit 1
fi
echo ""

# Step 3: Wait for Ollama to be ready
print_info "Step 3: Waiting for Ollama pod to be ready..."
sleep 5

POD_READY=false
for i in {1..60}; do
    POD_STATUS=$(kubectl get pods -n "$NAMESPACE" -l app=ollama -o jsonpath='{.items[0].status.phase}' 2>/dev/null || echo "Unknown")
    if [ "$POD_STATUS" = "Running" ]; then
        READY=$(kubectl get pods -n "$NAMESPACE" -l app=ollama -o jsonpath='{.items[0].status.containerStatuses[0].ready}' 2>/dev/null || echo "false")
        if [ "$READY" = "true" ]; then
            print_success "Ollama pod is ready"
            POD_READY=true
            break
        fi
    fi
    if [ $((i % 10)) -eq 0 ]; then
        echo -n "."
    fi
    sleep 2
done
echo ""

if [ "$POD_READY" != true ]; then
    print_warning "Ollama pod may still be starting. Check with: kubectl get pods -n $NAMESPACE -l app=ollama"
fi

# Step 4: Pull required models
print_info "Step 4: Pulling required Ollama models..."
print_info "This may take several minutes depending on your connection..."

OLLAMA_POD=$(kubectl get pods -n "$NAMESPACE" -l app=ollama -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")

if [ -n "$OLLAMA_POD" ]; then
    print_info "Pulling LLM model: llama3.2:1b"
    kubectl exec -n "$NAMESPACE" "$OLLAMA_POD" -- ollama pull llama3.2:1b 2>&1 | tail -5 || print_warning "Model pull may have failed, check logs"
    
    print_info "Pulling embedding model: nomic-embed-text"
    kubectl exec -n "$NAMESPACE" "$OLLAMA_POD" -- ollama pull nomic-embed-text 2>&1 | tail -5 || print_warning "Model pull may have failed, check logs"
    
    print_info "Verifying models..."
    kubectl exec -n "$NAMESPACE" "$OLLAMA_POD" -- ollama list 2>&1 | grep -E "(llama3.2|nomic-embed)" || print_warning "Models may not be listed yet"
else
    print_warning "Ollama pod not found, skipping model pull"
    print_info "You can pull models manually once the pod is ready:"
    echo "  kubectl exec -n $NAMESPACE <ollama-pod> -- ollama pull llama3.2:1b"
    echo "  kubectl exec -n $NAMESPACE <ollama-pod> -- ollama pull nomic-embed-text"
fi
echo ""

# Step 5: Update ConfigMap
print_info "Step 5: Updating ConfigMap to prioritize Ollama..."
if kubectl apply -f k8s/base/configmap.yaml; then
    print_success "ConfigMap updated"
else
    print_error "Failed to update ConfigMap"
    exit 1
fi
echo ""

# Step 6: Restart backend deployment to pick up new config
print_info "Step 6: Restarting backend deployment to apply Ollama configuration..."
if kubectl rollout restart deployment/progrc-backend -n "$NAMESPACE"; then
    print_success "Deployment restart initiated"
    print_info "Waiting for rollout to complete..."
    if kubectl rollout status deployment/progrc-backend -n "$NAMESPACE" --timeout=5m; then
        print_success "Rollout completed"
    else
        print_warning "Rollout status check timed out, but continuing..."
    fi
else
    print_error "Failed to restart deployment"
    exit 1
fi
echo ""

# Step 7: Verify Ollama connectivity
print_info "Step 7: Verifying Ollama connectivity from backend pods..."
BACKEND_POD=$(kubectl get pods -n "$NAMESPACE" -l app=progrc-backend -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")

if [ -n "$BACKEND_POD" ]; then
    print_info "Testing Ollama connection from backend pod..."
    if kubectl exec -n "$NAMESPACE" "$BACKEND_POD" -- sh -c 'curl -s http://ollama:11434/api/tags' 2>/dev/null | grep -q "models"; then
        print_success "Ollama is accessible from backend pods"
    else
        print_warning "Ollama connectivity test failed, but service may still be starting"
    fi
else
    print_warning "Backend pod not found for connectivity test"
fi
echo ""

# Summary
echo "=========================================="
echo "Deployment Complete!"
echo "=========================================="
echo ""
print_success "Ollama service deployed"
print_success "Configuration updated to prioritize Ollama"
print_success "Backend deployment restarted"
echo ""
print_info "Next steps:"
echo "  1. Monitor Ollama logs:"
echo "     kubectl logs -n $NAMESPACE -l app=ollama -f"
echo ""
echo "  2. Verify models are loaded:"
echo "     kubectl exec -n $NAMESPACE <ollama-pod> -- ollama list"
echo ""
echo "  3. Test compliance scoring - it should now use Ollama (no API calls)"
echo ""
echo "  4. Check backend logs for Ollama usage:"
echo "     kubectl logs -n $NAMESPACE -l app=progrc-backend --tail=100 | grep -i ollama"
echo ""
print_info "Note: Ollama is now the PRIMARY LLM service. External API calls (Gemini/Gradient/OpenAI) are disabled."
echo ""
