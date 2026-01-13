#!/bin/bash
# Verify Ollama integration and test that it's being used instead of API calls

set -e

echo "=========================================="
echo "Ollama Integration Verification"
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

# Check 1: Ollama service status
print_info "Check 1: Ollama service status..."
OLLAMA_POD=$(kubectl get pods -n "$NAMESPACE" -l app=ollama -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")
if [ -n "$OLLAMA_POD" ]; then
    POD_STATUS=$(kubectl get pod "$OLLAMA_POD" -n "$NAMESPACE" -o jsonpath='{.status.phase}' 2>/dev/null || echo "Unknown")
    if [ "$POD_STATUS" = "Running" ]; then
        print_success "Ollama pod is running: $OLLAMA_POD"
    else
        print_warning "Ollama pod status: $POD_STATUS"
    fi
else
    print_error "Ollama pod not found"
fi
echo ""

# Check 2: Ollama models
print_info "Check 2: Ollama models..."
if [ -n "$OLLAMA_POD" ]; then
    MODELS=$(kubectl exec -n "$NAMESPACE" "$OLLAMA_POD" -- ollama list 2>/dev/null || echo "")
    if echo "$MODELS" | grep -q "llama3.2"; then
        print_success "LLM model (llama3.2) is available"
    else
        print_warning "LLM model not found. Pull with: kubectl exec -n $NAMESPACE $OLLAMA_POD -- ollama pull llama3.2:1b"
    fi
    
    if echo "$MODELS" | grep -q "nomic-embed"; then
        print_success "Embedding model (nomic-embed-text) is available"
    else
        print_warning "Embedding model not found. Pull with: kubectl exec -n $NAMESPACE $OLLAMA_POD -- ollama pull nomic-embed-text"
    fi
else
    print_warning "Cannot check models - Ollama pod not found"
fi
echo ""

# Check 3: ConfigMap configuration
print_info "Check 3: ConfigMap configuration..."
USE_OLLAMA=$(kubectl get configmap progrc-config -n "$NAMESPACE" -o jsonpath='{.data.USE_OLLAMA}' 2>/dev/null || echo "")
OLLAMA_URL=$(kubectl get configmap progrc-config -n "$NAMESPACE" -o jsonpath='{.data.OLLAMA_BASE_URL}' 2>/dev/null || echo "")

if [ "$USE_OLLAMA" = "true" ]; then
    print_success "USE_OLLAMA is enabled"
else
    print_warning "USE_OLLAMA is not set to 'true'"
fi

if [ -n "$OLLAMA_URL" ]; then
    print_success "OLLAMA_BASE_URL: $OLLAMA_URL"
else
    print_warning "OLLAMA_BASE_URL not configured"
fi
echo ""

# Check 4: Backend pod environment
print_info "Check 4: Backend pod environment variables..."
BACKEND_POD=$(kubectl get pods -n "$NAMESPACE" -l app=progrc-backend -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")
if [ -n "$BACKEND_POD" ]; then
    BACKEND_USE_OLLAMA=$(kubectl exec -n "$NAMESPACE" "$BACKEND_POD" -- sh -c 'echo $USE_OLLAMA' 2>/dev/null || echo "")
    BACKEND_OLLAMA_URL=$(kubectl exec -n "$NAMESPACE" "$BACKEND_POD" -- sh -c 'echo $OLLAMA_BASE_URL' 2>/dev/null || echo "")
    
    if [ "$BACKEND_USE_OLLAMA" = "true" ]; then
        print_success "Backend pod has USE_OLLAMA=true"
    else
        print_warning "Backend pod USE_OLLAMA: $BACKEND_USE_OLLAMA"
    fi
    
    if [ -n "$BACKEND_OLLAMA_URL" ]; then
        print_success "Backend pod OLLAMA_BASE_URL: $BACKEND_OLLAMA_URL"
    else
        print_warning "Backend pod OLLAMA_BASE_URL not set"
    fi
else
    print_warning "Backend pod not found"
fi
echo ""

# Check 5: Ollama connectivity from backend
print_info "Check 5: Testing Ollama connectivity from backend pod..."
if [ -n "$BACKEND_POD" ] && [ -n "$OLLAMA_POD" ]; then
    if kubectl exec -n "$NAMESPACE" "$BACKEND_POD" -- sh -c 'curl -s --max-time 5 http://ollama:11434/api/tags' 2>/dev/null | grep -q "models"; then
        print_success "Backend can connect to Ollama service"
    else
        print_warning "Backend cannot connect to Ollama (may still be starting)"
    fi
else
    print_warning "Cannot test connectivity - pods not found"
fi
echo ""

# Check 6: Recent backend logs for Ollama usage
print_info "Check 6: Checking backend logs for Ollama usage..."
if [ -n "$BACKEND_POD" ]; then
    OLLAMA_LOGS=$(kubectl logs "$BACKEND_POD" -n "$NAMESPACE" --tail=100 2>/dev/null | grep -i "ollama\|local, no API calls" | tail -5 || echo "")
    if [ -n "$OLLAMA_LOGS" ]; then
        print_success "Found Ollama usage in logs:"
        echo "$OLLAMA_LOGS" | sed 's/^/  /'
    else
        print_warning "No recent Ollama usage found in logs (may need to trigger compliance scoring)"
    fi
else
    print_warning "Cannot check logs - backend pod not found"
fi
echo ""

# Summary
echo "=========================================="
echo "Verification Summary"
echo "=========================================="
echo ""
print_info "To test Ollama integration:"
echo "  1. Start a compliance assessment"
echo "  2. Upload a document for chunking"
echo "  3. Check logs: kubectl logs -n $NAMESPACE -l app=progrc-backend --tail=100 | grep -i ollama"
echo ""
print_info "Expected behavior:"
echo "  - No external API calls to Gemini/Gradient/OpenAI"
echo "  - Logs should show 'Using Ollama for AI processing (local, no API calls)'"
echo "  - Logs should show 'Using Ollama for embedding generation (local, no API calls)'"
echo ""
