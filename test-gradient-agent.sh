#!/bin/bash
# Test Gradient Agent Endpoint Connection

echo "🧪 Testing Gradient Agent Endpoint"
echo "=================================="
echo ""

AGENT_ENDPOINT="https://lyfxj4kyx25h6oj3zymh656q.agents.do-ai.run"

# Check if API key is provided
if [ -z "$GRADIENT_API_KEY" ]; then
    echo "⚠️  GRADIENT_API_KEY environment variable not set"
    echo ""
    echo "Please set it first:"
    echo "  export GRADIENT_API_KEY='your-agent-access-key-here'"
    echo ""
    echo "Or test with inline key:"
    echo "  GRADIENT_API_KEY='your-key' ./test-gradient-agent.sh"
    echo ""
    read -p "Enter your Agent Access Key (or press Enter to skip test): " API_KEY
    
    if [ -z "$API_KEY" ]; then
        echo "❌ No API key provided. Skipping test."
        exit 1
    fi
    
    GRADIENT_API_KEY="$API_KEY"
fi

echo "🔗 Testing agent endpoint: $AGENT_ENDPOINT"
echo ""

# Test endpoint connectivity
echo "1️⃣  Testing endpoint connectivity..."
if curl -s --max-time 10 -o /dev/null -w "%{http_code}" "$AGENT_ENDPOINT/chat/completions" > /dev/null 2>&1; then
    echo "   ✅ Endpoint is reachable"
else
    echo "   ⚠️  Endpoint might not be reachable (this is normal if it requires auth)"
fi

echo ""
echo "2️⃣  Testing agent with authentication..."
echo "   Sending test request..."
echo ""

# Test agent with a simple request
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$AGENT_ENDPOINT/chat/completions" \
  -H "Authorization: Bearer $GRADIENT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "system", "content": "You are a GRC analyst. Always respond with valid JSON only."},
      {"role": "user", "content": "What is access control in NIST 800-53? Respond in one sentence."}
    ],
    "temperature": 0.3,
    "max_tokens": 200
  }' 2>&1)

# Extract HTTP status code (last line)
HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "   HTTP Status: $HTTP_CODE"
echo ""

if [ "$HTTP_CODE" = "200" ]; then
    echo "   ✅ SUCCESS! Agent responded successfully"
    echo ""
    echo "   📄 Response:"
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    echo ""
    
    # Extract content if JSON
    CONTENT=$(echo "$BODY" | jq -r '.choices[0].message.content' 2>/dev/null)
    if [ -n "$CONTENT" ] && [ "$CONTENT" != "null" ]; then
        echo "   💬 Agent Response:"
        echo "   $CONTENT"
        echo ""
        echo "   ✅ Agent is working correctly!"
    else
        echo "   ⚠️  Response received but content format unexpected"
        echo "   Response body: $BODY"
    fi
elif [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "403" ]; then
    echo "   ❌ Authentication failed (HTTP $HTTP_CODE)"
    echo ""
    echo "   Please check:"
    echo "   1. Your Agent Access Key is correct"
    echo "   2. The key has proper permissions"
    echo "   3. The key is for this specific agent"
    echo ""
    echo "   Response: $BODY"
elif [ "$HTTP_CODE" = "404" ]; then
    echo "   ❌ Endpoint not found (HTTP 404)"
    echo ""
    echo "   The endpoint path might be incorrect."
    echo "   Trying alternative endpoint formats..."
    
    # Try alternative paths
    for path in "/chat" "/v1/chat/completions" ""; do
        echo "   Testing: $AGENT_ENDPOINT$path"
        ALT_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$AGENT_ENDPOINT$path" \
          -H "Authorization: Bearer $GRADIENT_API_KEY" \
          -H "Content-Type: application/json" \
          -d '{"messages": [{"role": "user", "content": "test"}]}' 2>&1)
        ALT_CODE=$(echo "$ALT_RESPONSE" | tail -n 1)
        if [ "$ALT_CODE" = "200" ]; then
            echo "   ✅ Found working endpoint: $AGENT_ENDPOINT$path"
            break
        fi
    done
else
    echo "   ❌ Request failed (HTTP $HTTP_CODE)"
    echo ""
    echo "   Response:"
    echo "$BODY" | head -20
fi

echo ""
echo "✅ Test completed!"


