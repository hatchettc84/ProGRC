#!/bin/bash
# Test Gemini API Key Directly

echo "🔍 Testing Gemini API Key"
echo "========================="
echo ""

# Get API key from secret file or environment
if [ -z "$GEMINI_API_KEY" ]; then
    # Try to get from secret file
    API_KEY=$(grep "GEMINI_API_KEY:" k8s/base/secret.yaml 2>/dev/null | cut -d'"' -f2)
    
    if [ -z "$API_KEY" ]; then
        echo "❌ GEMINI_API_KEY not found in secret file or environment"
        echo ""
        echo "Please provide your Gemini API key:"
        read -p "Enter API key (or press Enter to skip): " API_KEY
        
        if [ -z "$API_KEY" ]; then
            echo "No API key provided. Skipping test."
            exit 1
        fi
    else
        echo "📋 Found API key in secret file (first 10 chars): ${API_KEY:0:10}..."
    fi
else
    API_KEY="$GEMINI_API_KEY"
    echo "📋 Using API key from environment"
fi

echo ""
echo "🔑 API Key Info:"
KEY_LENGTH=$(echo -n "$API_KEY" | wc -c | tr -d ' ')
echo "   Length: ${KEY_LENGTH} characters"

# Check format
if echo "$API_KEY" | grep -q "^AIza"; then
    echo "   ✅ Format: Correct (starts with 'AIza')"
else
    echo "   ⚠️  Format: Unexpected (should start with 'AIza')"
fi

echo ""
echo "🧪 Testing API key with Gemini API..."
echo "   Endpoint: https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent"
echo ""

# Test with a simple request
TEST_RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{
      "parts": [{
        "text": "Say hello in one word"
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
    echo ""
    
    # Extract response text
    RESPONSE_TEXT=$(echo "$BODY" | grep -o '"text":"[^"]*"' | head -1 | cut -d'"' -f4)
    if [ -n "$RESPONSE_TEXT" ]; then
        echo "   💬 Gemini Response:"
        echo "   $RESPONSE_TEXT"
    else
        echo "   📄 Full Response:"
        echo "$BODY" | head -20 | sed 's/^/      /'
    fi
    
    echo ""
    echo "   ✅ Your Gemini API key is valid and can be used!"
    
elif [ "$HTTP_CODE" = "400" ]; then
    ERROR_MSG=$(echo "$BODY" | grep -o '"message":"[^"]*"' | head -1 | cut -d'"' -f4)
    echo "   ⚠️  API returned 400 (Bad Request)"
    echo "   Error: $ERROR_MSG"
    echo ""
    echo "   This might be a request format issue, not necessarily an invalid key."
    echo "   However, the key format looks correct."
    
elif [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "403" ]; then
    echo "   ❌ API key is INVALID (HTTP $HTTP_CODE)"
    echo ""
    echo "   Response body:"
    echo "$BODY" | head -10 | sed 's/^/      /'
    echo ""
    echo "   ⚠️  This API key is not valid or has insufficient permissions."
    echo "   Please check:"
    echo "   1. The API key is correct"
    echo "   2. The API key has proper permissions"
    echo "   3. The API key hasn't expired or been revoked"
    echo "   4. Get a new key from: https://makersuite.google.com/app/apikey"
    
elif [ "$HTTP_CODE" = "429" ]; then
    echo "   ⚠️  Rate limit exceeded (HTTP 429)"
    echo "   The API key is valid but you've hit rate limits."
    echo "   Wait a moment and try again."
    
elif [ "$HTTP_CODE" = "000" ] || [ -z "$HTTP_CODE" ]; then
    echo "   ⚠️  Could not reach Gemini API"
    echo "   Possible reasons:"
    echo "   - Network connectivity issue"
    echo "   - API endpoint changed"
    echo "   - Request timeout"
    echo ""
    echo "   Key format looks correct but cannot verify connectivity."
    
else
    echo "   ⚠️  Unexpected response (HTTP $HTTP_CODE)"
    echo ""
    echo "   Response body:"
    echo "$BODY" | head -20 | sed 's/^/      /'
fi

echo ""
echo "✅ Test complete!"


