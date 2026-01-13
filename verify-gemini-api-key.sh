#!/bin/bash
# Verify Gemini API Key

echo "🔍 Verifying Gemini API Key"
echo "============================"
echo ""

NAMESPACE="progrc-dev"
SECRET_NAME="progrc-bff-dev-secrets"

# Check if secret exists
echo "1️⃣  Checking if secret exists..."
if kubectl get secret "$SECRET_NAME" -n "$NAMESPACE" > /dev/null 2>&1; then
    echo "   ✅ Secret '$SECRET_NAME' exists"
    
    # Check if GEMINI_API_KEY exists in secret
    echo ""
    echo "2️⃣  Checking if GEMINI_API_KEY exists in secret..."
    API_KEY_B64=$(kubectl get secret "$SECRET_NAME" -n "$NAMESPACE" -o jsonpath='{.data.GEMINI_API_KEY}' 2>/dev/null)
    
    if [ -n "$API_KEY_B64" ]; then
        API_KEY=$(echo -n "$API_KEY_B64" | base64 -d 2>/dev/null)
        KEY_LENGTH=$(echo -n "$API_KEY" | wc -c | tr -d ' ')
        
        echo "   ✅ GEMINI_API_KEY found in secret"
        echo "   Key length: ${KEY_LENGTH} characters"
        
        # Check if key format looks correct (Gemini keys start with AIza)
        if echo "$API_KEY" | grep -q "^AIza"; then
            echo "   ✅ API key format looks correct (starts with 'AIza')"
            echo ""
            echo "3️⃣  Testing API key validity..."
            
            # Test the API key with a simple request
            TEST_RESPONSE=$(curl -s -w "\n%{http_code}" \
              -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${API_KEY}" \
              -H "Content-Type: application/json" \
              -d '{"contents":[{"parts":[{"text":"test"}]}]}' \
              --max-time 10 2>&1)
            
            HTTP_CODE=$(echo "$TEST_RESPONSE" | tail -n 1)
            BODY=$(echo "$TEST_RESPONSE" | sed '$d')
            
            echo "   HTTP Status: $HTTP_CODE"
            
            if [ "$HTTP_CODE" = "200" ]; then
                echo "   ✅ API key is VALID and working!"
                echo ""
                echo "   Response preview:"
                echo "$BODY" | head -5 | sed 's/^/      /'
            elif [ "$HTTP_CODE" = "400" ]; then
                ERROR_MSG=$(echo "$BODY" | grep -o '"message":"[^"]*"' | head -1 | cut -d'"' -f4)
                echo "   ⚠️  API returned 400 (Bad Request)"
                echo "   Error: $ERROR_MSG"
                echo "   (This might be a request format issue, not necessarily an invalid key)"
            elif [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "403" ]; then
                echo "   ❌ API key is INVALID or has insufficient permissions (HTTP $HTTP_CODE)"
                echo ""
                echo "   Please check:"
                echo "   1. The API key is correct"
                echo "   2. The API key has proper permissions"
                echo "   3. The API key hasn't expired"
                echo "   4. Get a new key from: https://makersuite.google.com/app/apikey"
            elif [ "$HTTP_CODE" = "000" ] || [ -z "$HTTP_CODE" ]; then
                echo "   ⚠️  Could not reach Gemini API (network issue or timeout)"
                echo "   Key format looks correct but cannot verify connectivity"
            else
                echo "   ⚠️  Unexpected response (HTTP $HTTP_CODE)"
                echo "   Response: $BODY" | head -10
            fi
        else
            echo "   ⚠️  API key format unexpected (should start with 'AIza')"
            echo "   First 20 characters: ${API_KEY:0:20}..."
            echo "   This might not be a valid Gemini API key"
        fi
    else
        echo "   ❌ GEMINI_API_KEY not found in secret"
        echo ""
        echo "   To add it, run:"
        echo "   kubectl patch secret $SECRET_NAME -n $NAMESPACE \\"
        echo "     --type='json' \\"
        echo "     -p='[{\"op\": \"add\", \"path\": \"/data/GEMINI_API_KEY\", \"value\": \"'$(echo -n 'your-api-key' | base64)'\"}]'"
    fi
else
    echo "   ❌ Secret '$SECRET_NAME' not found"
    echo ""
    echo "   To create it, run:"
    echo "   kubectl create secret generic $SECRET_NAME \\"
    echo "     --from-literal=GEMINI_API_KEY='your-api-key-here' \\"
    echo "     --namespace=$NAMESPACE"
fi

echo ""
echo "✅ Verification complete!"
