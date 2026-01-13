#!/bin/bash
# Add Hume API Key to Kubernetes Secret and ConfigMap

set -e

NAMESPACE="progrc-dev"
SECRET_NAME="progrc-bff-dev-secrets"
CONFIGMAP_NAME="progrc-config"
HUME_API_KEY="api-ut0Uwg102x4XXEa7rRBslijbdu1ofs5gieCya61UnGofQjxz"
HUME_API_URL="https://api.hume.ai"

echo "🔑 Adding Hume API Key for Voice Chat Features"
echo "================================================"
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

# Validate key format
KEY_LENGTH=$(echo -n "$HUME_API_KEY" | wc -c | tr -d ' ')
if [ "$KEY_LENGTH" -lt 20 ]; then
    print_warning "Key length is $KEY_LENGTH (seems short for an API key)"
else
    print_success "Key format looks correct (length: $KEY_LENGTH)"
fi

# Check namespace
if ! kubectl get namespace "$NAMESPACE" > /dev/null 2>&1; then
    print_error "Namespace '$NAMESPACE' not found"
    exit 1
fi

print_success "Namespace '$NAMESPACE' exists"

# Update ConfigMap with HUME_API_URL
echo ""
echo "1️⃣  Updating ConfigMap with HUME_API_URL..."
if kubectl get configmap "$CONFIGMAP_NAME" -n "$NAMESPACE" > /dev/null 2>&1; then
    # Check if HUME_API_URL already exists
    EXISTING_URL=$(kubectl get configmap "$CONFIGMAP_NAME" -n "$NAMESPACE" -o jsonpath='{.data.HUME_API_URL}' 2>/dev/null || echo "")
    
    if [ -n "$EXISTING_URL" ]; then
        print_info "HUME_API_URL already exists: $EXISTING_URL"
        if [ "$EXISTING_URL" != "$HUME_API_URL" ]; then
            print_warning "Updating HUME_API_URL to: $HUME_API_URL"
            kubectl patch configmap "$CONFIGMAP_NAME" -n "$NAMESPACE" \
              --type='json' \
              -p="[{\"op\": \"replace\", \"path\": \"/data/HUME_API_URL\", \"value\": \"$HUME_API_URL\"}]"
            print_success "HUME_API_URL updated"
        else
            print_success "HUME_API_URL is already correct"
        fi
    else
        print_info "Adding HUME_API_URL to ConfigMap..."
        kubectl patch configmap "$CONFIGMAP_NAME" -n "$NAMESPACE" \
          --type='json' \
          -p="[{\"op\": \"add\", \"path\": \"/data/HUME_API_URL\", \"value\": \"$HUME_API_URL\"}]"
        print_success "HUME_API_URL added to ConfigMap"
    fi
else
    print_error "ConfigMap '$CONFIGMAP_NAME' not found"
    exit 1
fi

# Update Secret with HUME_API_KEY
echo ""
echo "2️⃣  Updating Secret with HUME_API_KEY..."
if kubectl get secret "$SECRET_NAME" -n "$NAMESPACE" > /dev/null 2>&1; then
    # Check if HUME_API_KEY already exists
    EXISTING_KEY=$(kubectl get secret "$SECRET_NAME" -n "$NAMESPACE" -o jsonpath='{.data.HUME_API_KEY}' 2>/dev/null || echo "")
    
    if [ -n "$EXISTING_KEY" ]; then
        print_warning "HUME_API_KEY already exists in secret"
        echo "   Updating existing key..."
        OPERATION="replace"
    else
        print_info "HUME_API_KEY not found in secret"
        echo "   Adding new key..."
        OPERATION="add"
    fi
    
    # Base64 encode the key
    KEY_B64=$(echo -n "$HUME_API_KEY" | base64)
    
    # Update secret
    kubectl patch secret "$SECRET_NAME" -n "$NAMESPACE" \
      --type='json' \
      -p="[{\"op\": \"$OPERATION\", \"path\": \"/data/HUME_API_KEY\", \"value\": \"$KEY_B64\"}]"
    
    if [ $? -eq 0 ]; then
        print_success "Secret updated successfully"
    else
        print_error "Failed to update secret"
        exit 1
    fi
else
    print_error "Secret '$SECRET_NAME' not found"
    exit 1
fi

# Verify the key was added
echo ""
echo "3️⃣  Verifying configuration..."
VERIFIED_KEY=$(kubectl get secret "$SECRET_NAME" -n "$NAMESPACE" -o jsonpath='{.data.HUME_API_KEY}' 2>/dev/null)
VERIFIED_URL=$(kubectl get configmap "$CONFIGMAP_NAME" -n "$NAMESPACE" -o jsonpath='{.data.HUME_API_URL}' 2>/dev/null)

if [ -n "$VERIFIED_KEY" ]; then
    DECODED_KEY=$(echo -n "$VERIFIED_KEY" | base64 -d 2>/dev/null)
    VERIFIED_LENGTH=$(echo -n "$DECODED_KEY" | wc -c | tr -d ' ')
    
    print_success "HUME_API_KEY verified in secret"
    echo "   Key length: ${VERIFIED_LENGTH} characters"
    echo "   First 10 chars: ${DECODED_KEY:0:10}..."
    
    if [ "$DECODED_KEY" = "$HUME_API_KEY" ]; then
        print_success "Key matches input ✅"
    fi
else
    print_error "Failed to verify key in secret"
    exit 1
fi

if [ -n "$VERIFIED_URL" ]; then
    print_success "HUME_API_URL verified in ConfigMap"
    echo "   URL: $VERIFIED_URL"
else
    print_warning "HUME_API_URL not found in ConfigMap"
fi

# Summary and next steps
echo ""
echo "==========================================="
echo "📋 Summary and Next Steps"
echo "==========================================="
echo ""

print_success "Hume API key has been added to Kubernetes secret!"
print_success "Hume API URL has been configured in ConfigMap!"
echo ""

print_info "Next Steps:"
echo ""
print_info "1. Restart backend to pick up new configuration:"
echo "   kubectl rollout restart deployment/progrc-backend -n $NAMESPACE"
echo ""

print_info "2. Wait for rollout:"
echo "   kubectl rollout status deployment/progrc-backend -n $NAMESPACE"
echo ""

print_info "3. Verify Hume service initialization in logs:"
echo "   kubectl logs -n $NAMESPACE deployment/progrc-backend --tail=100 | grep -i hume"
echo ""

print_info "Expected behavior:"
echo "   - Hume voice chat features will be available in ProGPT (Ask AI)"
echo "   - Voice chat WebSocket endpoint will be active"
echo "   - No errors about missing HUME_API_KEY in logs"
echo ""

print_info "Hume Voice Chat Features:"
echo "   ✅ Real-time audio streaming"
echo "   ✅ Speech-to-text and text-to-speech"
echo "   ✅ Compliance-aware voice responses"
echo "   ✅ Emotion detection (if configured)"
echo "   ✅ Session management"
echo ""

print_success "Hume configuration complete!"


