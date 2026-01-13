#!/bin/bash
# Switch Ollama configuration to use AI Droplet instead of in-cluster service

set -e

echo "=========================================="
echo "Switching to AI Droplet Ollama"
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

# Step 1: Verify kubectl access
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
if kubectl run -it --rm test-ollama-connectivity-$(date +%s) \
    --image=curlimages/curl:latest \
    --restart=Never \
    --rm=true \
    -- sh -c "curl -s --max-time 10 ${OLLAMA_URL}/api/tags | head -20" 2>/dev/null; then
    print_success "AI Droplet is accessible from cluster"
else
    print_warning "Could not verify connectivity (may need to test from backend pod)"
fi
echo ""

# Step 3: Update ConfigMap
echo "Step 3: Updating ConfigMap..."
print_info "Updating OLLAMA_BASE_URL to ${OLLAMA_URL}..."
kubectl patch configmap progrc-config -n "${NAMESPACE}" --type merge -p "{\"data\":{\"OLLAMA_BASE_URL\":\"${OLLAMA_URL}\"}}"
print_success "ConfigMap updated"
echo ""

# Step 4: Scale down in-cluster Ollama (optional, saves resources)
echo "Step 4: Scaling down in-cluster Ollama deployment..."
if kubectl get deployment ollama -n "${NAMESPACE}" &> /dev/null; then
    print_info "Scaling down in-cluster Ollama to 0 replicas (using external AI Droplet instead)..."
    kubectl scale deployment ollama -n "${NAMESPACE}" --replicas=0
    print_success "In-cluster Ollama scaled down"
else
    print_info "No in-cluster Ollama deployment found (already using external)"
fi
echo ""

# Step 5: Restart backend to pick up new configuration
echo "Step 5: Restarting backend deployment..."
print_info "Rolling restart to apply new Ollama configuration..."
kubectl rollout restart deployment/progrc-backend -n "${NAMESPACE}"
print_info "Waiting for rollout to complete..."
if kubectl rollout status deployment/progrc-backend -n "${NAMESPACE}" --timeout=5m; then
    print_success "Backend deployment restarted successfully"
else
    print_warning "Rollout may still be in progress, check with: kubectl rollout status deployment/progrc-backend -n ${NAMESPACE}"
fi
echo ""

# Step 6: Verify configuration
echo "Step 6: Verifying configuration..."
print_info "Checking backend environment variables..."
sleep 5  # Wait for pod to be ready
BACKEND_POD=$(kubectl get pods -n "${NAMESPACE}" -l app=progrc-backend -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")
if [ -n "${BACKEND_POD}" ]; then
    print_info "Backend pod: ${BACKEND_POD}"
    echo ""
    print_info "OLLAMA_BASE_URL:"
    kubectl exec -n "${NAMESPACE}" "${BACKEND_POD}" -- env | grep OLLAMA_BASE_URL || print_warning "OLLAMA_BASE_URL not found in environment"
    echo ""
    print_info "USE_OLLAMA:"
    kubectl exec -n "${NAMESPACE}" "${BACKEND_POD}" -- env | grep USE_OLLAMA || print_warning "USE_OLLAMA not found in environment"
    echo ""
    print_info "OLLAMA_MODEL:"
    kubectl exec -n "${NAMESPACE}" "${BACKEND_POD}" -- env | grep OLLAMA_MODEL || print_warning "OLLAMA_MODEL not found in environment"
else
    print_warning "Backend pod not found, may still be starting"
fi
echo ""

# Step 7: Test connectivity from backend pod
echo "Step 7: Testing Ollama connectivity from backend pod..."
if [ -n "${BACKEND_POD}" ]; then
    print_info "Testing connection to AI Droplet from backend pod..."
    if kubectl exec -n "${NAMESPACE}" "${BACKEND_POD}" -- sh -c "curl -s --max-time 10 ${OLLAMA_URL}/api/tags 2>/dev/null | head -5"; then
        print_success "Backend can connect to AI Droplet Ollama"
    else
        print_warning "Could not test connectivity (curl may not be installed in backend pod)"
        print_info "You can test manually: kubectl exec -n ${NAMESPACE} ${BACKEND_POD} -- sh -c 'wget -qO- ${OLLAMA_URL}/api/tags'"
    fi
else
    print_warning "Backend pod not ready yet, skipping connectivity test"
fi
echo ""

# Summary
echo "=========================================="
echo "✅ Configuration Complete"
echo "=========================================="
echo ""
print_success "Ollama configuration updated to use AI Droplet"
echo ""
print_info "Configuration Summary:"
echo "  • OLLAMA_BASE_URL: ${OLLAMA_URL}"
echo "  • OLLAMA_MODEL: llama3.2:1b"
echo "  • In-cluster Ollama: Scaled down (using external)"
echo ""
print_info "Next Steps:"
echo "  1. Monitor backend logs: kubectl logs -n ${NAMESPACE} -l app=progrc-backend -f | grep -i ollama"
echo "  2. Test AI features in the application"
echo "  3. Verify no API calls are being made (check logs for Gemini/Gradient/OpenAI usage)"
echo ""
print_info "To revert to in-cluster Ollama:"
echo "  kubectl patch configmap progrc-config -n ${NAMESPACE} --type merge -p '{\"data\":{\"OLLAMA_BASE_URL\":\"http://ollama:11434\"}}'"
echo "  kubectl scale deployment ollama -n ${NAMESPACE} --replicas=1"
echo "  kubectl rollout restart deployment/progrc-backend -n ${NAMESPACE}"
echo ""
