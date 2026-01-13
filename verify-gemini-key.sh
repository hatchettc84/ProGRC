#!/bin/bash
# Verify Gemini API Key - Run this with network access or in Kubernetes

echo "🔍 Verifying Gemini API Key"
echo "============================"
echo ""

NAMESPACE="progrc-dev"
SECRET_NAME="progrc-bff-dev-secrets"

# Option 1: Check from Kubernetes (if kubectl available)
if command -v kubectl &> /dev/null; then
    echo "📋 Checking from Kubernetes..."
    
    # Check if secret exists
    if kubectl get secret "$SECRET_NAME" -n "$NAMESPACE" > /dev/null 2>&1; then
        echo "   ✅ Secret '$SECRET_NAME' exists"
        
        # Get API key from secret
        API_KEY_B64=$(kubectl get secret "$SECRET_NAME" -n "$NAMESPACE" -o jsonpath='{.data.GEMINI_API_KEY}' 2>/dev/null)
        
        if [ -n "$API_KEY_B64" ]; then
            API_KEY=$(echo -n "$API_KEY_B64" | base64 -d 2>/dev/null)
            echo "   ✅ GEMINI_API_KEY found in secret"
            KEY_LENGTH=$(echo -n "$API_KEY" | wc -c | tr -d ' ')
            echo "   Key length: ${KEY_LENGTH} characters"
        else
            echo "   ❌ GEMINI_API_KEY not found in secret"
            exit 1
        fi
    else
        echo "   ❌ Secret '$SECRET_NAME' not found"
        echo "   Trying to get from secret file..."
        API_KEY=$(grep "GEMINI_API_KEY:" k8s/base/secret.yaml 2>/dev/null | cut -d'"' -f2)
        if [ -z "$API_KEY" ]; then
            echo "   ❌ API key not found in secret file either"
            exit 1
        fi
    fi
else
    # Option 2: Check from secret file
    echo "📋 Checking from secret file..."
    API_KEY=$(grep "GEMINI_API_KEY:" k8s/base/secret.yaml 2>/dev/null | cut -d'"' -f2)
    
    if [ -z "$API_KEY" ]; then
        echo "   ❌ GEMINI_API_KEY not found in secret file"
        echo "   Please provide your API key:"
        read -p "Enter API key: " API_KEY
        if [ -z "$API_KEY" ]; then
            exit 1
        fi
    else
        echo "   ✅ Found API key in secret file"
    fi
fi

echo ""
echo "🔑 API Key Validation:"
echo "   First 10 chars: ${API_KEY:0:10}..."
KEY_LENGTH=$(echo -n "$API_KEY" | wc -c | tr -d ' ')
echo "   Length: ${KEY_LENGTH} characters"

# Validate format
VALID_FORMAT=false
if [ "$KEY_LENGTH" -ge 35 ] && [ "$KEY_LENGTH" -le 50 ]; then
    if echo "$API_KEY" | grep -q "^AIza"; then
        VALID_FORMAT=true
        echo "   ✅ Format: Correct (starts with 'AIza', length OK)"
    else
        echo "   ⚠️  Format: Should start with 'AIza'"
    fi
else
    echo "   ⚠️  Format: Length should be 35-50 characters (current: $KEY_LENGTH)"
fi

echo ""
if [ "$VALID_FORMAT" = true ]; then
    echo "🧪 Testing API key with Gemini API..."
    
    # Test with a simple request
    TEST_RESPONSE=$(curl -s -w "\n%{http_code}" \
      -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${API_KEY}" \
      -H "Content-Type: application/json" \
      -d '{
        "contents": [{
          "parts": [{
            "text": "Say hello"
          }]
        }]
      }' \
      --max-time 15 2>&1)
    
    HTTP_CODE=$(echo "$TEST_RESPONSE" | tail -n 1)
    BODY=$(echo "$TEST_RESPONSE" | sed '$d')
    
    echo "   HTTP Status: $HTTP_CODE"
    echo ""
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo "   ✅ SUCCESS! API key is VALID and working!"
        RESPONSE_TEXT=$(echo "$BODY" | grep -o '"text":"[^"]*"' | head -1 | cut -d'"' -f4)
        if [ -n "$RESPONSE_TEXT" ]; then
            echo "   💬 Gemini Response: $RESPONSE_TEXT"
        fi
        exit 0
        
    elif [ "$HTTP_CODE" = "400" ]; then
        ERROR_MSG=$(echo "$BODY" | grep -o '"message":"[^"]*"' | head -1 | cut -d'"' -f4)
        echo "   ⚠️  Bad Request (HTTP 400)"
        echo "   Error: $ERROR_MSG"
        echo "   (Might be request format, but key format is correct)"
        exit 1
        
    elif [ "$HTTP_CODE" = "401" ]; then
        echo "   ❌ INVALID API KEY (HTTP 401 - Unauthorized)"
        echo ""
        echo "   This API key is not valid or has been revoked."
        echo "   Please get a new key from: https://makersuite.google.com/app/apikey"
        exit 1
        
    elif [ "$HTTP_CODE" = "403" ]; then
        echo "   ❌ PERMISSION DENIED (HTTP 403 - Forbidden)"
        echo ""
        echo "   This API key is valid but doesn't have required permissions."
        echo "   Check API key permissions in Google Cloud Console."
        exit 1
        
    elif [ "$HTTP_CODE" = "429" ]; then
        echo "   ⚠️  Rate Limit Exceeded (HTTP 429)"
        echo "   The API key is valid but you've hit rate limits."
        echo "   Wait a moment and try again."
        exit 0
        
    elif [ "$HTTP_CODE" = "000" ] || [ -z "$HTTP_CODE" ]; then
        echo "   ⚠️  Network Error (HTTP 000)"
        echo "   Could not reach Gemini API."
        echo "   Key format looks correct but cannot verify due to network issue."
        echo ""
        echo "   Try running this script from a machine with internet access."
        exit 1
        
    else
        echo "   ⚠️  Unexpected response (HTTP $HTTP_CODE)"
        echo "   Response:"
        echo "$BODY" | head -10 | sed 's/^/      /'
        exit 1
    fi
else
    echo "   ⚠️  Cannot test API key - format validation failed"
    echo "   Please verify the API key format is correct"
    exit 1
fi


