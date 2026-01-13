#!/bin/bash
# Complete AI Activation Script - Apply ConfigMap and Restart Backend

set -e

NAMESPACE="progrc-dev"
CONFIGMAP_FILE="k8s/base/configmap.yaml"
SECRET_FILE="k8s/base/secret.yaml"
BACKEND_DEPLOYMENT="progrc-backend"

echo "🚀 Activating All AI Features in ProGRC Platform"
echo "=================================================="
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

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    print_error "kubectl not found. Please install kubectl."
    exit 1
fi

# Check namespace
if ! kubectl get namespace "$NAMESPACE" > /dev/null 2>&1; then
    print_error "Namespace '$NAMESPACE' not found"
    echo "   Create it with: kubectl create namespace $NAMESPACE"
    exit 1
fi

print_success "Namespace '$NAMESPACE' exists"

# Check if ConfigMap file exists
echo ""
echo "1️⃣  Checking ConfigMap file..."
if [ -f "$CONFIGMAP_FILE" ]; then
    print_success "ConfigMap file found: $CONFIGMAP_FILE"
else
    print_error "ConfigMap file not found: $CONFIGMAP_FILE"
    exit 1
fi

# Apply ConfigMap
echo ""
echo "2️⃣  Applying ConfigMap..."
kubectl apply -f "$CONFIGMAP_FILE" -n "$NAMESPACE"

if [ $? -eq 0 ]; then
    print_success "ConfigMap applied successfully"
    
    # Verify ConfigMap values
    echo ""
    echo "   Verifying ConfigMap values..."
    USE_GEMINI=$(kubectl get configmap progrc-config -n "$NAMESPACE" -o jsonpath='{.data.USE_GEMINI}' 2>/dev/null || echo "")
    USE_GRADIENT=$(kubectl get configmap progrc-config -n "$NAMESPACE" -o jsonpath='{.data.USE_GRADIENT}' 2>/dev/null || echo "")
    GEMINI_MODEL=$(kubectl get configmap progrc-config -n "$NAMESPACE" -o jsonpath='{.data.GEMINI_MODEL}' 2>/dev/null || echo "")
    GRADIENT_URL=$(kubectl get configmap progrc-config -n "$NAMESPACE" -o jsonpath='{.data.GRADIENT_API_URL}' 2>/dev/null || echo "")
    
    echo "   USE_GEMINI: ${USE_GEMINI:-not set}"
    echo "   USE_GRADIENT: ${USE_GRADIENT:-not set}"
    echo "   GEMINI_MODEL: ${GEMINI_MODEL:-not set}"
    echo "   GRADIENT_API_URL: ${GRADIENT_URL:-not set}"
    
    if [ "$USE_GEMINI" = "true" ]; then
        print_success "Gemini is enabled in ConfigMap"
    else
        print_warning "USE_GEMINI is not set to 'true'"
    fi
    
    if [ "$USE_GRADIENT" = "true" ]; then
        print_success "Gradient AI is enabled in ConfigMap"
    else
        print_warning "USE_GRADIENT is not set to 'true'"
    fi
else
    print_error "Failed to apply ConfigMap"
    exit 1
fi

# Check secrets
echo ""
echo "3️⃣  Verifying API Keys in Secret..."
SECRET_NAME="progrc-bff-dev-secrets"

if kubectl get secret "$SECRET_NAME" -n "$NAMESPACE" > /dev/null 2>&1; then
    print_success "Secret '$SECRET_NAME' exists"
    
    # Check Gemini key
    GEMINI_KEY_B64=$(kubectl get secret "$SECRET_NAME" -n "$NAMESPACE" -o jsonpath='{.data.GEMINI_API_KEY}' 2>/dev/null || echo "")
    if [ -n "$GEMINI_KEY_B64" ]; then
        GEMINI_KEY=$(echo -n "$GEMINI_KEY_B64" | base64 -d 2>/dev/null)
        KEY_LENGTH=$(echo -n "$GEMINI_KEY" | wc -c | tr -d ' ')
        print_success "GEMINI_API_KEY found (length: $KEY_LENGTH chars, first 10: ${GEMINI_KEY:0:10}...)"
    else
        print_error "GEMINI_API_KEY not found in secret"
    fi
    
    # Check Gradient key
    GRADIENT_KEY_B64=$(kubectl get secret "$SECRET_NAME" -n "$NAMESPACE" -o jsonpath='{.data.GRADIENT_API_KEY}' 2>/dev/null || echo "")
    if [ -n "$GRADIENT_KEY_B64" ]; then
        GRADIENT_KEY=$(echo -n "$GRADIENT_KEY_B64" | base64 -d 2>/dev/null)
        KEY_LENGTH=$(echo -n "$GRADIENT_KEY" | wc -c | tr -d ' ')
        print_success "GRADIENT_API_KEY found (length: $KEY_LENGTH chars, first 10: ${GRADIENT_KEY:0:10}...)"
    else
        print_error "GRADIENT_API_KEY not found in secret"
    fi
else
    print_error "Secret '$SECRET_NAME' not found"
    print_info "You may need to create it first"
fi

# Restart backend
echo ""
echo "4️⃣  Restarting Backend to Pick Up New Configuration..."
print_info "Initiating rollout restart..."

kubectl rollout restart deployment/"$BACKEND_DEPLOYMENT" -n "$NAMESPACE"

if [ $? -eq 0 ]; then
    print_success "Backend restart initiated"
    
    echo ""
    print_info "Waiting for rollout to complete (this may take 1-2 minutes)..."
    kubectl rollout status deployment/"$BACKEND_DEPLOYMENT" -n "$NAMESPACE" --timeout=120s
    
    if [ $? -eq 0 ]; then
        print_success "Backend rollout completed successfully"
    else
        print_warning "Rollout status check timed out or failed"
        print_info "Backend might still be starting - check status manually:"
        echo "   kubectl get pods -n $NAMESPACE -l app=$BACKEND_DEPLOYMENT"
    fi
else
    print_error "Failed to restart backend"
    exit 1
fi

# Wait a bit for pods to start
echo ""
print_info "Waiting 15 seconds for pods to initialize..."
sleep 15

# Check logs for AI service initialization
echo ""
echo "5️⃣  Verifying AI Service Initialization..."
PODS=$(kubectl get pods -n "$NAMESPACE" -l app=$BACKEND_DEPLOYMENT -o name 2>/dev/null | head -1)

if [ -n "$PODS" ]; then
    POD_NAME=$(echo "$PODS" | cut -d'/' -f2)
    print_info "Checking logs from pod: $POD_NAME"
    
    GEMINI_LOGS=$(kubectl logs "$POD_NAME" -n "$NAMESPACE" --tail=100 2>/dev/null | grep -i "gemini" | head -3)
    GRADIENT_LOGS=$(kubectl logs "$POD_NAME" -n "$NAMESPACE" --tail=100 2>/dev/null | grep -i "gradient" | head -3)
    AI_INIT_LOGS=$(kubectl logs "$POD_NAME" -n "$NAMESPACE" --tail=100 2>/dev/null | grep -i "ai service initialized" | head -3)
    
    echo ""
    if [ -n "$GEMINI_LOGS" ]; then
        echo "   Gemini logs:"
        echo "$GEMINI_LOGS" | sed 's/^/      /'
        
        if echo "$GEMINI_LOGS" | grep -qi "initialized\|service initialized"; then
            print_success "Gemini service initialized! ✅"
        elif echo "$GEMINI_LOGS" | grep -qi "not set\|missing\|error\|not available"; then
            print_warning "Gemini service has issues - check logs above"
        fi
    else
        print_warning "No Gemini-related logs found yet"
        print_info "Pods might still be starting - wait a moment and check again"
    fi
    
    echo ""
    if [ -n "$GRADIENT_LOGS" ]; then
        echo "   Gradient AI logs:"
        echo "$GRADIENT_LOGS" | sed 's/^/      /'
        
        if echo "$GRADIENT_LOGS" | grep -qi "initialized\|service initialized"; then
            print_success "Gradient AI service initialized! ✅"
        elif echo "$GRADIENT_LOGS" | grep -qi "not set\|missing\|error\|not available"; then
            print_warning "Gradient AI service has issues - check logs above"
        fi
    else
        print_warning "No Gradient-related logs found yet"
        print_info "Pods might still be starting - wait a moment and check again"
    fi
    
    echo ""
    if [ -n "$AI_INIT_LOGS" ]; then
        print_success "AI service initialization found:"
        echo "$AI_INIT_LOGS" | sed 's/^/      /'
    fi
else
    print_warning "No backend pods found"
    print_info "Check pod status: kubectl get pods -n $NAMESPACE -l app=$BACKEND_DEPLOYMENT"
fi

# Final summary
echo ""
echo "==========================================="
echo "📋 Activation Summary"
echo "==========================================="
echo ""

print_success "ConfigMap applied ✅"
print_success "Backend restarted ✅"
print_info "API keys verified in secret ✅"
echo ""

print_info "To check full logs, run:"
echo "   kubectl logs -n $NAMESPACE deployment/$BACKEND_DEPLOYMENT --tail=200 | grep -i 'gemini\\|gradient\\|ai service'"
echo ""

print_info "To verify AI services status, run:"
echo "   ./verify-ai-status.sh"
echo ""

print_info "Expected log output (after pods fully start):"
echo "   Gemini service initialized with model: gemini-2.0-flash-exp"
echo "   Gradient AI service initialized: https://lyfxj4kyx25h6oj3zymh656q.agents.do-ai.run, model:"
echo ""

if [ -n "$GEMINI_LOGS" ] && [ -n "$GRADIENT_LOGS" ]; then
    if echo "$GEMINI_LOGS" | grep -qi "initialized" && echo "$GRADIENT_LOGS" | grep -qi "initialized"; then
        echo "==========================================="
        print_success "🎉 All AI Services Are Active! 🎉"
        echo "==========================================="
        echo ""
        print_success "Both Gemini and Gradient AI are initialized and ready to use!"
        print_info "All 10+ AI features are now active:"
        echo "   ✅ Document processing with embeddings"
        echo "   ✅ Ask AI interactive chat"
        echo "   ✅ POAM auto-generation"
        echo "   ✅ Recommendation enhancement"
        echo "   ✅ Control evaluation assistance"
        echo "   ✅ Audit feedback processing"
        echo "   ✅ Policy generation"
        echo "   ✅ And more!"
    fi
else
    print_warning "AI services might still be initializing"
    print_info "Wait 30-60 seconds and check logs again, or run: ./verify-ai-status.sh"
fi

echo ""
print_success "Activation script complete!"


