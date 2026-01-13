#!/bin/bash
# Complete AI Setup Script - Verify and Configure Gemini & Gradient AI Keys

set -e

NAMESPACE="progrc-dev"
SECRET_NAME="progrc-bff-dev-secrets"
CONFIGMAP_NAME="progrc-config"
BACKEND_DEPLOYMENT="progrc-backend"

echo "🚀 ProGRC AI Setup - Complete Configuration"
echo "==========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    print_error "kubectl not found. Please install kubectl to use this script."
    exit 1
fi

print_success "kubectl found"

# Check namespace
echo ""
echo "1️⃣  Checking Kubernetes Namespace..."
if kubectl get namespace "$NAMESPACE" > /dev/null 2>&1; then
    print_success "Namespace '$NAMESPACE' exists"
else
    print_error "Namespace '$NAMESPACE' not found"
    echo "   Create it with: kubectl create namespace $NAMESPACE"
    exit 1
fi

# Check ConfigMap
echo ""
echo "2️⃣  Checking ConfigMap..."
if kubectl get configmap "$CONFIGMAP_NAME" -n "$NAMESPACE" > /dev/null 2>&1; then
    USE_GEMINI=$(kubectl get configmap "$CONFIGMAP_NAME" -n "$NAMESPACE" -o jsonpath='{.data.USE_GEMINI}' 2>/dev/null)
    USE_GRADIENT=$(kubectl get configmap "$CONFIGMAP_NAME" -n "$NAMESPACE" -o jsonpath='{.data.USE_GRADIENT}' 2>/dev/null)
    GEMINI_MODEL=$(kubectl get configmap "$CONFIGMAP_NAME" -n "$NAMESPACE" -o jsonpath='{.data.GEMINI_MODEL}' 2>/dev/null)
    GRADIENT_URL=$(kubectl get configmap "$CONFIGMAP_NAME" -n "$NAMESPACE" -o jsonpath='{.data.GRADIENT_API_URL}' 2>/dev/null)
    
    print_success "ConfigMap '$CONFIGMAP_NAME' exists"
    echo "   USE_GEMINI: ${USE_GEMINI:-not set}"
    echo "   USE_GRADIENT: ${USE_GRADIENT:-not set}"
    echo "   GEMINI_MODEL: ${GEMINI_MODEL:-not set}"
    echo "   GRADIENT_API_URL: ${GRADIENT_URL:-not set}"
    
    if [ "$USE_GEMINI" != "true" ]; then
        print_warning "USE_GEMINI is not set to 'true' in ConfigMap"
    fi
    
    if [ "$USE_GRADIENT" != "true" ]; then
        print_warning "USE_GRADIENT is not set to 'true' in ConfigMap"
    fi
else
    print_warning "ConfigMap '$CONFIGMAP_NAME' not found"
    print_info "Will be created when applying k8s/base/configmap.yaml"
fi

# Check Secret
echo ""
echo "3️⃣  Checking Secret..."
if kubectl get secret "$SECRET_NAME" -n "$NAMESPACE" > /dev/null 2>&1; then
    print_success "Secret '$SECRET_NAME' exists"
    
    # Check Gemini API Key
    GEMINI_KEY_B64=$(kubectl get secret "$SECRET_NAME" -n "$NAMESPACE" -o jsonpath='{.data.GEMINI_API_KEY}' 2>/dev/null)
    if [ -n "$GEMINI_KEY_B64" ]; then
        GEMINI_KEY=$(echo -n "$GEMINI_KEY_B64" | base64 -d 2>/dev/null)
        KEY_LENGTH=$(echo -n "$GEMINI_KEY" | wc -c | tr -d ' ')
        
        print_success "GEMINI_API_KEY found in secret"
        echo "   Key length: ${KEY_LENGTH} characters"
        echo "   First 10 chars: ${GEMINI_KEY:0:10}..."
        
        if echo "$GEMINI_KEY" | grep -q "^AIza"; then
            print_success "Format correct (starts with AIza)"
            
            # Test the key
            echo ""
            print_info "Testing Gemini API key..."
            TEST_RESPONSE=$(curl -s -w "\n%{http_code}" \
              -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_KEY}" \
              -H "Content-Type: application/json" \
              -d '{"contents":[{"parts":[{"text":"test"}]}]}' \
              --max-time 10 2>&1 || echo "000")
            
            HTTP_CODE=$(echo "$TEST_RESPONSE" | tail -n 1)
            
            if [ "$HTTP_CODE" = "200" ]; then
                print_success "Gemini API key is VALID and working!"
            elif [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "403" ]; then
                print_error "Gemini API key is INVALID (HTTP $HTTP_CODE)"
                print_warning "Please update the key from: https://makersuite.google.com/app/apikey"
                GEMINI_NEEDS_UPDATE=true
            elif [ "$HTTP_CODE" = "000" ]; then
                print_warning "Could not test Gemini API key (network issue or timeout)"
                print_info "Key format looks correct, but validity could not be verified"
            else
                print_warning "Unexpected response from Gemini API (HTTP $HTTP_CODE)"
                print_info "Key format is correct, but response was unexpected"
            fi
        else
            print_warning "Format unexpected (should start with AIza)"
            GEMINI_NEEDS_UPDATE=true
        fi
    else
        print_error "GEMINI_API_KEY not found in secret"
        GEMINI_NEEDS_UPDATE=true
    fi
    
    # Check Gradient AI API Key
    echo ""
    GRADIENT_KEY_B64=$(kubectl get secret "$SECRET_NAME" -n "$NAMESPACE" -o jsonpath='{.data.GRADIENT_API_KEY}' 2>/dev/null)
    if [ -n "$GRADIENT_KEY_B64" ]; then
        GRADIENT_KEY=$(echo -n "$GRADIENT_KEY_B64" | base64 -d 2>/dev/null)
        KEY_LENGTH=$(echo -n "$GRADIENT_KEY" | wc -c | tr -d ' ')
        
        print_success "GRADIENT_API_KEY found in secret"
        echo "   Key length: ${KEY_LENGTH} characters"
        echo "   First 10 chars: ${GRADIENT_KEY:0:10}..."
        
        # Test Gradient AI agent endpoint if URL is set
        if [ -n "$GRADIENT_URL" ]; then
            echo ""
            print_info "Testing Gradient AI agent endpoint..."
            TEST_RESPONSE=$(curl -s -w "\n%{http_code}" \
              -X POST "${GRADIENT_URL}/chat/completions" \
              -H "Authorization: Bearer ${GRADIENT_KEY}" \
              -H "Content-Type: application/json" \
              -d '{"messages":[{"role":"user","content":"test"}]}' \
              --max-time 10 2>&1 || echo "000")
            
            HTTP_CODE=$(echo "$TEST_RESPONSE" | tail -n 1)
            
            if [ "$HTTP_CODE" = "200" ]; then
                print_success "Gradient AI agent is working!"
            elif [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "403" ]; then
                print_error "Gradient AI API key is INVALID (HTTP $HTTP_CODE)"
                print_warning "Please check your Agent Access Key from Gradient AI Platform"
                GRADIENT_NEEDS_UPDATE=true
            elif [ "$HTTP_CODE" = "000" ]; then
                print_warning "Could not test Gradient AI agent (network issue or timeout)"
                print_info "Key exists, but connectivity could not be verified"
            else
                print_warning "Unexpected response from Gradient AI (HTTP $HTTP_CODE)"
                print_info "Check agent endpoint and API key"
            fi
        else
            print_warning "GRADIENT_API_URL not set in ConfigMap"
        fi
    else
        print_error "GRADIENT_API_KEY not found in secret"
        GRADIENT_NEEDS_UPDATE=true
    fi
else
    print_error "Secret '$SECRET_NAME' not found"
    print_info "Will be created when applying k8s/base/secret.yaml"
    GEMINI_NEEDS_UPDATE=true
    GRADIENT_NEEDS_UPDATE=true
fi

# Summary and next steps
echo ""
echo "==========================================="
echo "📋 Summary and Next Steps"
echo "==========================================="
echo ""

if [ "$GEMINI_NEEDS_UPDATE" = true ] || [ "$GRADIENT_NEEDS_UPDATE" = true ]; then
    print_warning "Some API keys need to be updated"
    echo ""
    
    if [ "$GEMINI_NEEDS_UPDATE" = true ]; then
        echo "🔑 Gemini API Key:"
        echo "   1. Get your key from: https://makersuite.google.com/app/apikey"
        echo "   2. Update secret:"
        echo "      kubectl patch secret $SECRET_NAME -n $NAMESPACE \\"
        echo "        --type='json' \\"
        echo "        -p='[{\"op\": \"replace\", \"path\": \"/data/GEMINI_API_KEY\", \"value\": \"'$(echo -n 'your-key' | base64)'\"}]'"
        echo "   OR run: ./update-gemini-key.sh"
        echo ""
    fi
    
    if [ "$GRADIENT_NEEDS_UPDATE" = true ]; then
        echo "🔑 Gradient AI API Key:"
        echo "   1. Get your Agent Access Key from Gradient AI Platform dashboard"
        echo "   2. Update secret:"
        echo "      kubectl patch secret $SECRET_NAME -n $NAMESPACE \\"
        echo "        --type='json' \\"
        echo "        -p='[{\"op\": \"add\", \"path\": \"/data/GRADIENT_API_KEY\", \"value\": \"'$(echo -n 'your-key' | base64)'\"}]'"
        echo ""
    fi
else
    print_success "All API keys are configured and valid!"
fi

echo ""
echo "🚀 Deploy Configuration:"
echo "   1. Apply ConfigMap: kubectl apply -f k8s/base/configmap.yaml -n $NAMESPACE"
echo "   2. Apply Secret: kubectl apply -f k8s/base/secret.yaml -n $NAMESPACE"
echo "   3. Restart backend: kubectl rollout restart deployment/$BACKEND_DEPLOYMENT -n $NAMESPACE"
echo "   4. Wait for rollout: kubectl rollout status deployment/$BACKEND_DEPLOYMENT -n $NAMESPACE"
echo "   5. Check logs: kubectl logs -n $NAMESPACE deployment/$BACKEND_DEPLOYMENT | grep -i 'gemini\\|gradient\\|ai service initialized'"
echo ""

echo "✅ Setup check complete!"


