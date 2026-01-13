#!/bin/bash
# Add OpenAI API Key to Kubernetes Secret

set -e

NAMESPACE="progrc-dev"
SECRET_NAME="progrc-bff-dev-secrets"
OPENAI_API_KEY="secret-T56GGH0LEQC2maknh73t1XAAaVizZ1jbUItr8FJ6QLrvtyDe8XJcAkYYpDFGic1I"

echo "🔑 Adding OpenAI API Key to Kubernetes Secret"
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
KEY_LENGTH=$(echo -n "$OPENAI_API_KEY" | wc -c | tr -d ' ')
if [ "$KEY_LENGTH" -lt 20 ]; then
    print_warning "Key length is $KEY_LENGTH (seems short for an API key)"
else
    print_success "Key format looks correct (length: $KEY_LENGTH)"
fi

# Check if it looks like an OpenAI key (usually starts with "sk-" but this might be a different format)
if echo "$OPENAI_API_KEY" | grep -q "^sk-"; then
    print_success "Format matches OpenAI key pattern (starts with sk-)"
elif echo "$OPENAI_API_KEY" | grep -q "^secret-"; then
    print_info "Key starts with 'secret-' (might be OpenAI or another service)"
    print_info "Adding as OPENAI_API_KEY - if incorrect, you can update later"
else
    print_info "Key format doesn't match typical OpenAI pattern"
    print_info "Adding as OPENAI_API_KEY - verify if correct"
fi

# Check namespace
if ! kubectl get namespace "$NAMESPACE" > /dev/null 2>&1; then
    print_error "Namespace '$NAMESPACE' not found"
    exit 1
fi

print_success "Namespace '$NAMESPACE' exists"

# Update Secret with OPENAI_API_KEY
echo ""
echo "1️⃣  Updating Secret with OPENAI_API_KEY..."
if kubectl get secret "$SECRET_NAME" -n "$NAMESPACE" > /dev/null 2>&1; then
    # Check if OPENAI_API_KEY already exists
    EXISTING_KEY=$(kubectl get secret "$SECRET_NAME" -n "$NAMESPACE" -o jsonpath='{.data.OPENAI_API_KEY}' 2>/dev/null || echo "")
    
    if [ -n "$EXISTING_KEY" ]; then
        EXISTING_DECODED=$(echo -n "$EXISTING_KEY" | base64 -d 2>/dev/null)
        if [ "$EXISTING_DECODED" = "" ]; then
            print_info "OPENAI_API_KEY exists but is empty"
            echo "   Updating with new key..."
            OPERATION="replace"
        else
            print_warning "OPENAI_API_KEY already exists in secret (length: $(echo -n "$EXISTING_DECODED" | wc -c | tr -d ' ') chars)"
            echo "   Updating existing key..."
            OPERATION="replace"
        fi
    else
        print_info "OPENAI_API_KEY not found in secret"
        echo "   Adding new key..."
        OPERATION="add"
    fi
    
    # Base64 encode the key
    KEY_B64=$(echo -n "$OPENAI_API_KEY" | base64)
    
    # Update secret
    kubectl patch secret "$SECRET_NAME" -n "$NAMESPACE" \
      --type='json' \
      -p="[{\"op\": \"$OPERATION\", \"path\": \"/data/OPENAI_API_KEY\", \"value\": \"$KEY_B64\"}]"
    
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
echo "2️⃣  Verifying configuration..."
VERIFIED_KEY=$(kubectl get secret "$SECRET_NAME" -n "$NAMESPACE" -o jsonpath='{.data.OPENAI_API_KEY}' 2>/dev/null)

if [ -n "$VERIFIED_KEY" ]; then
    DECODED_KEY=$(echo -n "$VERIFIED_KEY" | base64 -d 2>/dev/null)
    VERIFIED_LENGTH=$(echo -n "$DECODED_KEY" | wc -c | tr -d ' ')
    
    print_success "OPENAI_API_KEY verified in secret"
    echo "   Key length: ${VERIFIED_LENGTH} characters"
    echo "   First 10 chars: ${DECODED_KEY:0:10}..."
    
    if [ "$DECODED_KEY" = "$OPENAI_API_KEY" ]; then
        print_success "Key matches input ✅"
    fi
else
    print_error "Failed to verify key in secret"
    exit 1
fi

# Test the API key with OpenAI API (if key format looks valid)
echo ""
echo "3️⃣  Testing OpenAI API key..."
print_info "Sending test request to OpenAI API..."

# Note: OpenAI keys typically start with "sk-", but this key starts with "secret-"
# This might be a different format or different service. We'll test anyway.
TEST_RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST "https://api.openai.com/v1/chat/completions" \
  -H "Authorization: Bearer ${OPENAI_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [
      {"role": "user", "content": "Say hello"}
    ],
    "max_tokens": 10
  }' \
  --max-time 15 2>&1 || echo "000")

HTTP_CODE=$(echo "$TEST_RESPONSE" | tail -n 1)
BODY=$(echo "$TEST_RESPONSE" | sed '$d')

echo ""
if [ "$HTTP_CODE" = "200" ]; then
    print_success "OpenAI API key is VALID and WORKING! ✅"
    print_success "HTTP Status: $HTTP_CODE"
    
    # Extract response
    RESPONSE_TEXT=$(echo "$BODY" | grep -o '"content":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "")
    if [ -n "$RESPONSE_TEXT" ]; then
        echo ""
        print_info "OpenAI Response:"
        echo "   $RESPONSE_TEXT"
    fi
    
elif [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "403" ]; then
    print_error "OpenAI API key is INVALID (HTTP $HTTP_CODE)"
    print_warning "This API key is not valid for OpenAI or has been revoked"
    print_info "Key was added to secret, but may not be an OpenAI key"
    print_info "If this is for a different service, you may need to update the configuration"
    
elif [ "$HTTP_CODE" = "000" ] || [ -z "$HTTP_CODE" ]; then
    print_warning "Could not test OpenAI API key (network issue or timeout)"
    print_info "Key was added successfully to secret"
    print_info "Key format might not be standard OpenAI format (starts with 'secret-' instead of 'sk-')"
    print_info "This might be for a different service - verify the key is correct"
    
else
    print_warning "Unexpected response from OpenAI API (HTTP $HTTP_CODE)"
    echo "   Response:"
    echo "$BODY" | head -10 | sed 's/^/      /'
    print_info "Key was added to secret, but verification was inconclusive"
fi

# Summary and next steps
echo ""
echo "==========================================="
echo "📋 Summary and Next Steps"
echo "==========================================="
echo ""

print_success "API key has been added to Kubernetes secret as OPENAI_API_KEY!"
echo ""

print_info "Note: The key format (starts with 'secret-') is unusual for OpenAI."
print_info "OpenAI keys typically start with 'sk-'. This might be:"
echo "   - A different format of OpenAI key"
echo "   - A key for another service"
echo "   - A secret token for another purpose"
echo ""

if [ "$HTTP_CODE" != "200" ]; then
    print_warning "The key might not be a valid OpenAI API key"
    print_info "If this is for a different service, please let me know what service it's for"
    print_info "Otherwise, you may need to verify the key is correct"
fi

echo ""
print_info "Next Steps:"
echo ""
print_info "1. Verify what service this key is for (if not OpenAI):"
echo "   - If it's for another service, we can configure it accordingly"
echo "   - If it's OpenAI, verify it's correct"
echo ""

print_info "2. Restart backend to pick up new secret (if needed):"
echo "   kubectl rollout restart deployment/progrc-backend -n $NAMESPACE"
echo ""

print_info "3. Verify initialization in logs:"
echo "   kubectl logs -n $NAMESPACE deployment/progrc-backend --tail=100 | grep -i openai"
echo ""

print_info "OpenAI Service Priority:"
echo "   The platform uses LLM services in this order:"
echo "   1. Gemini (Primary) ✅"
echo "   2. Gradient AI (Secondary) ✅"
echo "   3. OpenAI (Fallback) - Now configured"
echo "   4. Ollama (Local Fallback) - Optional"
echo ""

print_success "Key added to secret successfully!"


