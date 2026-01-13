#!/bin/bash
# Script to verify Gradient AI Platform agent configuration

echo "🔍 Verifying Gradient AI Platform Agent Configuration"
echo "=================================================="
echo ""

# Check if API key is set
if [ -z "$GRADIENT_API_KEY" ]; then
    echo "❌ GRADIENT_API_KEY environment variable is not set"
    echo "   You need to set this in your Kubernetes secrets"
    exit 1
else
    echo "✅ GRADIENT_API_KEY is set"
fi

# Check ConfigMap values
echo ""
echo "📋 Checking ConfigMap values..."
echo "   USE_GRADIENT: ${USE_GRADIENT:-not set}"
echo "   GRADIENT_API_URL: ${GRADIENT_API_URL:-https://api.gradient.ai/v1}"
echo "   GRADIENT_MODEL: ${GRADIENT_MODEL:-llama-3.1-70b-instruct}"
echo ""

# Test API connectivity
echo "🔌 Testing API connectivity..."
API_URL="${GRADIENT_API_URL:-https://api.gradient.ai/v1}"

# Test health endpoint (if available)
if curl -s -f -X GET "${API_URL}/models" \
    -H "Authorization: Bearer ${GRADIENT_API_KEY}" \
    -H "Content-Type: application/json" \
    --max-time 10 > /dev/null 2>&1; then
    echo "✅ API endpoint is reachable: ${API_URL}"
else
    echo "⚠️  Could not reach standard endpoint: ${API_URL}/models"
    echo "   This might be normal if Gradient uses agent-specific endpoints"
fi

echo ""
echo "📝 Next Steps:"
echo "1. Verify your agent API endpoint in Gradient AI Platform dashboard"
echo "2. If your agent has a specific endpoint, update GRADIENT_API_URL"
echo "3. If your agent uses a specific model, update GRADIENT_MODEL"
echo "4. Ensure GRADIENT_API_KEY is in Kubernetes secret: progrc-bff-secrets"
echo ""


