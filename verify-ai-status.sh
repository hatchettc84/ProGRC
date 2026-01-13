#!/bin/bash
# Verify AI Services Status in Backend

NAMESPACE="progrc-dev"
DEPLOYMENT="progrc-backend"

echo "🔍 Verifying AI Services Status"
echo "================================"
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

# Check if backend pod exists
PODS=$(kubectl get pods -n "$NAMESPACE" -l app=progrc-backend -o name 2>/dev/null | head -1)

if [ -z "$PODS" ]; then
    print_error "No backend pods found"
    exit 1
fi

POD_NAME=$(echo "$PODS" | cut -d'/' -f2)
print_success "Backend pod found: $POD_NAME"

# Check pod status
echo ""
echo "1️⃣  Checking Pod Status..."
POD_STATUS=$(kubectl get pod "$POD_NAME" -n "$NAMESPACE" -o jsonpath='{.status.phase}' 2>/dev/null)
echo "   Status: $POD_STATUS"

if [ "$POD_STATUS" != "Running" ]; then
    print_warning "Pod is not in Running state yet"
    print_info "Wait for pod to be ready: kubectl wait --for=condition=ready pod/$POD_NAME -n $NAMESPACE --timeout=120s"
    exit 1
fi

# Check environment variables
echo ""
echo "2️⃣  Checking Environment Variables..."
GEMINI_ENABLED=$(kubectl exec "$POD_NAME" -n "$NAMESPACE" -- env 2>/dev/null | grep "^USE_GEMINI=" | cut -d'=' -f2)
GRADIENT_ENABLED=$(kubectl exec "$POD_NAME" -n "$NAMESPACE" -- env 2>/dev/null | grep "^USE_GRADIENT=" | cut -d'=' -f2)
GEMINI_KEY_SET=$(kubectl exec "$POD_NAME" -n "$NAMESPACE" -- env 2>/dev/null | grep "^GEMINI_API_KEY=" | wc -c | tr -d ' ')
GRADIENT_KEY_SET=$(kubectl exec "$POD_NAME" -n "$NAMESPACE" -- env 2>/dev/null | grep "^GRADIENT_API_KEY=" | wc -c | tr -d ' ')
GEMINI_MODEL=$(kubectl exec "$POD_NAME" -n "$NAMESPACE" -- env 2>/dev/null | grep "^GEMINI_MODEL=" | cut -d'=' -f2)
GRADIENT_URL=$(kubectl exec "$POD_NAME" -n "$NAMESPACE" -- env 2>/dev/null | grep "^GRADIENT_API_URL=" | cut -d'=' -f2)

echo "   USE_GEMINI: ${GEMINI_ENABLED:-not set}"
echo "   USE_GRADIENT: ${GRADIENT_ENABLED:-not set}"
echo "   GEMINI_MODEL: ${GEMINI_MODEL:-not set (using default)}"
echo "   GRADIENT_API_URL: ${GRADIENT_URL:-not set}"

if [ "$GEMINI_KEY_SET" -gt 0 ] 2>/dev/null; then
    print_success "GEMINI_API_KEY is set"
else
    print_error "GEMINI_API_KEY is NOT set"
fi

if [ "$GRADIENT_KEY_SET" -gt 0 ] 2>/dev/null; then
    print_success "GRADIENT_API_KEY is set"
else
    print_error "GRADIENT_API_KEY is NOT set"
fi

# Check logs for initialization
echo ""
echo "3️⃣  Checking Backend Logs for AI Service Initialization..."
GEMINI_LOGS=$(kubectl logs "$POD_NAME" -n "$NAMESPACE" --tail=200 2>/dev/null | grep -i "gemini" | head -5)
GRADIENT_LOGS=$(kubectl logs "$POD_NAME" -n "$NAMESPACE" --tail=200 2>/dev/null | grep -i "gradient" | head -5)

if [ -n "$GEMINI_LOGS" ]; then
    echo "   Gemini-related logs:"
    echo "$GEMINI_LOGS" | sed 's/^/      /'
    
    if echo "$GEMINI_LOGS" | grep -qi "initialized\|service initialized"; then
        print_success "Gemini service initialized"
    elif echo "$GEMINI_LOGS" | grep -qi "not set\|missing\|error\|not available"; then
        print_warning "Gemini service has issues - check logs above"
    fi
else
    print_warning "No Gemini-related logs found"
fi

echo ""

if [ -n "$GRADIENT_LOGS" ]; then
    echo "   Gradient-related logs:"
    echo "$GRADIENT_LOGS" | sed 's/^/      /'
    
    if echo "$GRADIENT_LOGS" | grep -qi "initialized\|service initialized"; then
        print_success "Gradient AI service initialized"
    elif echo "$GRADIENT_LOGS" | grep -qi "not set\|missing\|error\|not available"; then
        print_warning "Gradient AI service has issues - check logs above"
    fi
else
    print_warning "No Gradient-related logs found"
fi

# Summary
echo ""
echo "==========================================="
echo "📋 Summary"
echo "==========================================="
echo ""

if [ "$GEMINI_ENABLED" = "true" ] && [ "$GEMINI_KEY_SET" -gt 0 ] 2>/dev/null; then
    print_success "Gemini: Configured ✅"
else
    print_warning "Gemini: Needs configuration ⚠️"
fi

if [ "$GRADIENT_ENABLED" = "true" ] && [ "$GRADIENT_KEY_SET" -gt 0 ] 2>/dev/null; then
    print_success "Gradient AI: Configured ✅"
else
    print_warning "Gradient AI: Needs configuration ⚠️"
fi

echo ""
print_info "For full logs, run:"
echo "   kubectl logs -n $NAMESPACE deployment/$DEPLOYMENT | grep -i 'gemini\\|gradient'"


