#!/bin/bash
# Add Gemini API Key to Kubernetes Secret and Test It

set -e

NAMESPACE="progrc-dev"
SECRET_NAME="progrc-bff-dev-secrets"
GEMINI_KEY="AIzaSyBbXF6oj-tnf9ofUy1u6Hex2i-Fr5xC69o"

echo "🔑 Adding Gemini API Key to Kubernetes Secret"
echo "=============================================="
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
KEY_LENGTH=$(echo -n "$GEMINI_KEY" | wc -c | tr -d ' ')
if [ "$KEY_LENGTH" -lt 35 ] || [ "$KEY_LENGTH" -gt 50 ]; then
    print_warning "Key length is $KEY_LENGTH (expected 35-50 characters)"
fi

if ! echo "$GEMINI_KEY" | grep -q "^AIza"; then
    print_warning "Key doesn't start with 'AIza' (unexpected format)"
else
    print_success "Key format looks correct (starts with AIza, length: $KEY_LENGTH)"
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
    
    # Check if GEMINI_API_KEY already exists
    EXISTING_KEY=$(kubectl get secret "$SECRET_NAME" -n "$NAMESPACE" -o jsonpath='{.data.GEMINI_API_KEY}' 2>/dev/null || echo "")
    
    if [ -n "$EXISTING_KEY" ]; then
        print_warning "GEMINI_API_KEY already exists in secret"
        echo "   Updating existing key..."
        OPERATION="replace"
    else
        print_info "GEMINI_API_KEY not found in secret"
        echo "   Adding new key..."
        OPERATION="add"
    fi
else
    print_warning "Secret '$SECRET_NAME' not found"
    echo "   Creating secret with Gemini key..."
    
    # Create secret with Gemini key
    kubectl create secret generic "$SECRET_NAME" \
      --from-literal=GEMINI_API_KEY="$GEMINI_KEY" \
      --namespace="$NAMESPACE"
    
    if [ $? -eq 0 ]; then
        print_success "Secret created with Gemini API key"
        exit 0
    else
        print_error "Failed to create secret"
        exit 1
    fi
fi

# Base64 encode the key
KEY_B64=$(echo -n "$GEMINI_KEY" | base64)

# Update secret
echo ""
echo "Updating secret with Gemini API key..."
kubectl patch secret "$SECRET_NAME" -n "$NAMESPACE" \
  --type='json' \
  -p="[{\"op\": \"$OPERATION\", \"path\": \"/data/GEMINI_API_KEY\", \"value\": \"$KEY_B64\"}]"

if [ $? -eq 0 ]; then
    print_success "Secret updated successfully"
else
    print_error "Failed to update secret"
    exit 1
fi

# Verify the key was added
echo ""
echo "Verifying key was added..."
VERIFIED_KEY=$(kubectl get secret "$SECRET_NAME" -n "$NAMESPACE" -o jsonpath='{.data.GEMINI_API_KEY}' 2>/dev/null)

if [ -n "$VERIFIED_KEY" ]; then
    DECODED_KEY=$(echo -n "$VERIFIED_KEY" | base64 -d 2>/dev/null)
    VERIFIED_LENGTH=$(echo -n "$DECODED_KEY" | wc -c | tr -d ' ')
    
    print_success "GEMINI_API_KEY verified in secret"
    echo "   Key length: ${VERIFIED_LENGTH} characters"
    echo "   First 10 chars: ${DECODED_KEY:0:10}..."
    
    # Verify it matches
    if [ "$DECODED_KEY" = "$GEMINI_KEY" ]; then
        print_success "Key matches input ✅"
    else
        print_warning "Key might not match input (verifying again...)"
    fi
else
    print_error "Failed to verify key in secret"
    exit 1
fi

# Test the API key with Gemini API
echo ""
echo "Testing Gemini API key..."
print_info "Sending test request to Gemini API..."

TEST_RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{
      "parts": [{
        "text": "Say hello in one word"
      }]
    }]
  }' \
  --max-time 15 2>&1 || echo "000")

HTTP_CODE=$(echo "$TEST_RESPONSE" | tail -n 1)
BODY=$(echo "$TEST_RESPONSE" | sed '$d')

echo ""
if [ "$HTTP_CODE" = "200" ]; then
    print_success "Gemini API key is VALID and WORKING! ✅"
    print_success "HTTP Status: $HTTP_CODE"
    
    # Extract response
    RESPONSE_TEXT=$(echo "$BODY" | grep -o '"text":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "")
    if [ -n "$RESPONSE_TEXT" ]; then
        echo ""
        print_info "Gemini Response:"
        echo "   $RESPONSE_TEXT"
    fi
    
elif [ "$HTTP_CODE" = "400" ]; then
    ERROR_MSG=$(echo "$BODY" | grep -o '"message":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "")
    print_warning "Bad Request (HTTP 400)"
    echo "   Error: $ERROR_MSG"
    print_info "This might be a request format issue, but key format is correct"
    
elif [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "403" ]; then
    print_error "Gemini API key is INVALID (HTTP $HTTP_CODE)"
    print_warning "This API key is not valid or has been revoked"
    print_info "Please get a new key from: https://makersuite.google.com/app/apikey"
    exit 1
    
elif [ "$HTTP_CODE" = "429" ]; then
    print_warning "Rate Limit Exceeded (HTTP 429)"
    print_info "The API key is valid but you've hit rate limits"
    print_info "Wait a moment and try again"
    
elif [ "$HTTP_CODE" = "000" ] || [ -z "$HTTP_CODE" ]; then
    print_warning "Could not test Gemini API key (network issue or timeout)"
    print_info "Key was added successfully to secret"
    print_info "Key format looks correct, but connectivity could not be verified"
    print_info "You may need to test from a different network"
    
else
    print_warning "Unexpected response from Gemini API (HTTP $HTTP_CODE)"
    echo "   Response:"
    echo "$BODY" | head -10 | sed 's/^/      /'
fi

# Summary and next steps
echo ""
echo "==========================================="
echo "📋 Summary and Next Steps"
echo "==========================================="
echo ""

print_success "Gemini API key has been added to Kubernetes secret!"
echo ""

if [ "$HTTP_CODE" = "200" ]; then
    print_success "API key is VALID and tested successfully ✅"
elif [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "403" ]; then
    print_error "API key is INVALID - please update with a valid key"
    print_info "Get new key from: https://makersuite.google.com/app/apikey"
else
    print_warning "API key connectivity could not be verified"
    print_info "Key was added to secret, but test from network was not successful"
    print_info "You may need to verify the key manually"
fi

echo ""
print_info "Next Steps:"
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
echo "   kubectl logs -n $NAMESPACE deployment/progrc-backend --tail=100 | grep -i 'gemini\\|gradient\\|ai service initialized'"
echo ""

print_info "Expected log output:"
echo "   Gemini service initialized with model: gemini-2.0-flash-exp"
echo "   Gradient AI service initialized: https://lyfxj4kyx25h6oj3zymh656q.agents.do-ai.run, model:"


