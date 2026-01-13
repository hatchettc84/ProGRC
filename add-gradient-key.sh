#!/bin/bash
# Add Gradient AI Agent Access Key to Kubernetes Secret

set -e

NAMESPACE="progrc-dev"
SECRET_NAME="progrc-bff-dev-secrets"
GRADIENT_KEY="r3xnBCu7VH5-WiD_Wp9DNLQr9Vi8boZt"

echo "🔑 Adding Gradient AI Agent Access Key to Kubernetes Secret"
echo "============================================================"
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

# Check if secret exists
echo ""
echo "Checking secret '$SECRET_NAME'..."
if kubectl get secret "$SECRET_NAME" -n "$NAMESPACE" > /dev/null 2>&1; then
    print_success "Secret '$SECRET_NAME' exists"
    
    # Check if GRADIENT_API_KEY already exists
    EXISTING_KEY=$(kubectl get secret "$SECRET_NAME" -n "$NAMESPACE" -o jsonpath='{.data.GRADIENT_API_KEY}' 2>/dev/null || echo "")
    
    if [ -n "$EXISTING_KEY" ]; then
        print_warning "GRADIENT_API_KEY already exists in secret"
        echo "   Updating existing key..."
        OPERATION="replace"
    else
        print_info "GRADIENT_API_KEY not found in secret"
        echo "   Adding new key..."
        OPERATION="add"
    fi
else
    print_warning "Secret '$SECRET_NAME' not found"
    echo "   Creating secret with Gradient AI key..."
    
    # Create secret with Gradient key
    kubectl create secret generic "$SECRET_NAME" \
      --from-literal=GRADIENT_API_KEY="$GRADIENT_KEY" \
      --namespace="$NAMESPACE"
    
    if [ $? -eq 0 ]; then
        print_success "Secret created with Gradient AI key"
        exit 0
    else
        print_error "Failed to create secret"
        exit 1
    fi
fi

# Base64 encode the key
KEY_B64=$(echo -n "$GRADIENT_KEY" | base64)

# Update secret
echo ""
echo "Updating secret with Gradient AI key..."
kubectl patch secret "$SECRET_NAME" -n "$NAMESPACE" \
  --type='json' \
  -p="[{\"op\": \"$OPERATION\", \"path\": \"/data/GRADIENT_API_KEY\", \"value\": \"$KEY_B64\"}]"

if [ $? -eq 0 ]; then
    print_success "Secret updated successfully"
else
    print_error "Failed to update secret"
    exit 1
fi

# Verify the key was added
echo ""
echo "Verifying key was added..."
VERIFIED_KEY=$(kubectl get secret "$SECRET_NAME" -n "$NAMESPACE" -o jsonpath='{.data.GRADIENT_API_KEY}' 2>/dev/null)

if [ -n "$VERIFIED_KEY" ]; then
    DECODED_KEY=$(echo -n "$VERIFIED_KEY" | base64 -d 2>/dev/null)
    KEY_LENGTH=$(echo -n "$DECODED_KEY" | wc -c | tr -d ' ')
    
    print_success "GRADIENT_API_KEY verified in secret"
    echo "   Key length: ${KEY_LENGTH} characters"
    echo "   First 10 chars: ${DECODED_KEY:0:10}..."
    
    # Verify it matches
    if [ "$DECODED_KEY" = "$GRADIENT_KEY" ]; then
        print_success "Key matches input ✅"
    else
        print_warning "Key might not match input (verifying again...)"
    fi
else
    print_error "Failed to verify key in secret"
    exit 1
fi

# Test the agent endpoint
echo ""
echo "Testing Gradient AI agent endpoint..."
GRADIENT_URL="https://lyfxj4kyx25h6oj3zymh656q.agents.do-ai.run"

print_info "Sending test request to: $GRADIENT_URL"

TEST_RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST "${GRADIENT_URL}/chat/completions" \
  -H "Authorization: Bearer ${GRADIENT_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Say hello"}
    ],
    "temperature": 0.3
  }' \
  --max-time 15 2>&1 || echo "000")

HTTP_CODE=$(echo "$TEST_RESPONSE" | tail -n 1)
BODY=$(echo "$TEST_RESPONSE" | sed '$d')

echo ""
if [ "$HTTP_CODE" = "200" ]; then
    print_success "Gradient AI agent is WORKING! ✅"
    print_success "HTTP Status: $HTTP_CODE"
    
    # Extract response if available
    RESPONSE_TEXT=$(echo "$BODY" | grep -o '"content":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "")
    if [ -n "$RESPONSE_TEXT" ]; then
        echo "   Agent Response: $RESPONSE_TEXT"
    fi
    
elif [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "403" ]; then
    print_error "Gradient AI API key is INVALID (HTTP $HTTP_CODE)"
    print_warning "Please verify your Agent Access Key is correct"
    print_info "Make sure you're using the Agent Access Key, not the workspace key"
    exit 1
    
elif [ "$HTTP_CODE" = "000" ] || [ -z "$HTTP_CODE" ]; then
    print_warning "Could not test Gradient AI agent (network issue or timeout)"
    print_info "Key was added successfully, but connectivity could not be verified"
    print_info "You may need to test from a different network or wait for DNS propagation"
    
else
    print_warning "Unexpected response from Gradient AI (HTTP $HTTP_CODE)"
    echo "   Response:"
    echo "$BODY" | head -10 | sed 's/^/      /'
fi

echo ""
echo "==========================================="
echo "📋 Next Steps"
echo "==========================================="
echo ""

print_info "1. Apply ConfigMap (if not already done):"
echo "   kubectl apply -f k8s/base/configmap.yaml -n $NAMESPACE"
echo ""

print_info "2. Restart backend to pick up new secret:"
echo "   kubectl rollout restart deployment/progrc-backend -n $NAMESPACE"
echo ""

print_info "3. Wait for rollout:"
echo "   kubectl rollout status deployment/progrc-backend -n $NAMESPACE"
echo ""

print_info "4. Verify initialization in logs:"
echo "   kubectl logs -n $NAMESPACE deployment/progrc-backend --tail=100 | grep -i gradient"
echo ""

print_success "Gradient AI key has been added to Kubernetes secret!"
echo ""
print_info "Expected log output:"
echo "   Gradient AI service initialized: https://lyfxj4kyx25h6oj3zymh656q.agents.do-ai.run, model:"


