#!/bin/bash
# Quick check for Gradient AI configuration

echo "🔍 Checking Gradient AI Platform Configuration"
echo "=============================================="
echo ""

# Check ConfigMap
echo "📋 ConfigMap Values:"
kubectl get configmap progrc-config -n progrc-dev -o jsonpath='{.data.USE_GRADIENT}' 2>/dev/null && echo " - USE_GRADIENT: $(kubectl get configmap progrc-config -n progrc-dev -o jsonpath='{.data.USE_GRADIENT}')" || echo " - ConfigMap not found"
kubectl get configmap progrc-config -n progrc-dev -o jsonpath='{.data.GRADIENT_API_URL}' 2>/dev/null && echo " - GRADIENT_API_URL: $(kubectl get configmap progrc-config -n progrc-dev -o jsonpath='{.data.GRADIENT_API_URL}')" || echo ""
kubectl get configmap progrc-config -n progrc-dev -o jsonpath='{.data.GRADIENT_MODEL}' 2>/dev/null && echo " - GRADIENT_MODEL: $(kubectl get configmap progrc-config -n progrc-dev -o jsonpath='{.data.GRADIENT_MODEL}')" || echo ""

echo ""
echo "🔑 Secret Check:"
if kubectl get secret progrc-bff-secrets -n progrc-dev >/dev/null 2>&1; then
    if kubectl get secret progrc-bff-secrets -n progrc-dev -o jsonpath='{.data.GRADIENT_API_KEY}' 2>/dev/null | grep -q .; then
        echo "✅ GRADIENT_API_KEY exists in secret (hidden for security)"
    else
        echo "❌ GRADIENT_API_KEY not found in secret"
        echo "   Run: kubectl edit secret progrc-bff-secrets -n progrc-dev"
    fi
else
    echo "⚠️  Secret progrc-bff-secrets not found"
fi

echo ""
echo "📊 Backend Logs (last 20 lines with 'gradient' or 'Gradient'):"
kubectl logs -n progrc-dev deployment/progrc-backend --tail=100 2>/dev/null | grep -i gradient | tail -5 || echo "   No gradient-related logs found (may need to restart backend)"

echo ""
echo "✅ To verify your agent:"
echo "1. Check agent endpoint in Gradient dashboard"
echo "2. Test with: curl -X POST 'YOUR_AGENT_ENDPOINT' -H 'Authorization: Bearer YOUR_KEY' -H 'Content-Type: application/json' -d '{\"messages\":[{\"role\":\"user\",\"content\":\"test\"}]}'"
echo "3. Update GRADIENT_API_URL in ConfigMap if your agent uses a different endpoint"
echo "4. Restart backend: kubectl rollout restart deployment/progrc-backend -n progrc-dev"


