#!/bin/bash
# Verify Gradient Agent Configuration in Kubernetes

echo "🔍 Verifying Gradient Agent Configuration in Kubernetes"
echo "========================================================"
echo ""

NAMESPACE="progrc-dev"
SECRET_NAME="progrc-bff-secrets"
CONFIGMAP_NAME="progrc-config"

# Check ConfigMap
echo "📋 Checking ConfigMap: $CONFIGMAP_NAME"
if kubectl get configmap "$CONFIGMAP_NAME" -n "$NAMESPACE" > /dev/null 2>&1; then
    USE_GRADIENT=$(kubectl get configmap "$CONFIGMAP_NAME" -n "$NAMESPACE" -o jsonpath='{.data.USE_GRADIENT}' 2>/dev/null)
    API_URL=$(kubectl get configmap "$CONFIGMAP_NAME" -n "$NAMESPACE" -o jsonpath='{.data.GRADIENT_API_URL}' 2>/dev/null)
    MODEL=$(kubectl get configmap "$CONFIGMAP_NAME" -n "$NAMESPACE" -o jsonpath='{.data.GRADIENT_MODEL}' 2>/dev/null)
    
    echo "   ✅ ConfigMap exists"
    echo "   USE_GRADIENT: ${USE_GRADIENT:-not set}"
    echo "   GRADIENT_API_URL: ${API_URL:-not set}"
    echo "   GRADIENT_MODEL: ${MODEL:-not set}"
    
    if [ "$API_URL" = "https://lyfxj4kyx25h6oj3zymh656q.agents.do-ai.run" ]; then
        echo "   ✅ Agent endpoint configured correctly"
    else
        echo "   ⚠️  Agent endpoint might be incorrect"
    fi
else
    echo "   ❌ ConfigMap not found: $CONFIGMAP_NAME"
fi

echo ""

# Check Secret
echo "🔑 Checking Secret: $SECRET_NAME"
if kubectl get secret "$SECRET_NAME" -n "$NAMESPACE" > /dev/null 2>&1; then
    HAS_KEY=$(kubectl get secret "$SECRET_NAME" -n "$NAMESPACE" -o jsonpath='{.data.GRADIENT_API_KEY}' 2>/dev/null)
    
    if [ -n "$HAS_KEY" ]; then
        echo "   ✅ GRADIENT_API_KEY exists in secret"
        KEY_LENGTH=$(echo -n "$HAS_KEY" | base64 -d 2>/dev/null | wc -c | tr -d ' ')
        echo "   Key length: ${KEY_LENGTH} characters"
        
        # Don't show the actual key for security
        echo "   ✅ API key is set (hidden for security)"
    else
        echo "   ❌ GRADIENT_API_KEY not found in secret"
        echo ""
        echo "   To add it, run:"
        echo "   kubectl create secret generic $SECRET_NAME \\"
        echo "     --from-literal=GRADIENT_API_KEY='your-key-here' \\"
        echo "     --namespace=$NAMESPACE \\"
        echo "     --dry-run=client -o yaml | kubectl apply -f -"
    fi
else
    echo "   ❌ Secret not found: $SECRET_NAME"
    echo ""
    echo "   To create it, run:"
    echo "   kubectl create secret generic $SECRET_NAME \\"
    echo "     --from-literal=GRADIENT_API_KEY='your-key-here' \\"
    echo "     --namespace=$NAMESPACE"
fi

echo ""

# Check Backend Pods
echo "📦 Checking Backend Pods"
PODS=$(kubectl get pods -n "$NAMESPACE" -l app=progrc-backend -o name 2>/dev/null | head -1)
if [ -n "$PODS" ]; then
    POD_NAME=$(echo "$PODS" | cut -d'/' -f2)
    echo "   ✅ Backend pod found: $POD_NAME"
    
    # Check if Gradient is initialized in logs
    echo ""
    echo "   📋 Checking Gradient initialization in logs..."
    GRADIENT_LOGS=$(kubectl logs "$POD_NAME" -n "$NAMESPACE" --tail=100 2>/dev/null | grep -i gradient | head -5)
    
    if [ -n "$GRADIENT_LOGS" ]; then
        echo "   Recent Gradient-related logs:"
        echo "$GRADIENT_LOGS" | sed 's/^/      /'
        
        if echo "$GRADIENT_LOGS" | grep -qi "initialized"; then
            echo ""
            echo "   ✅ Gradient service initialized in backend"
        elif echo "$GRADIENT_LOGS" | grep -qi "not set\|missing\|error"; then
            echo ""
            echo "   ⚠️  Gradient service might not be configured correctly"
        fi
    else
        echo "   ⚠️  No Gradient-related logs found (service might not be started yet)"
    fi
else
    echo "   ❌ No backend pods found"
fi

echo ""
echo "✅ Verification complete!"
echo ""
echo "📝 Next Steps:"
echo "   1. If API key is missing, add it to the secret (see command above)"
echo "   2. Restart backend: kubectl rollout restart deployment/progrc-backend -n $NAMESPACE"
echo "   3. Check logs: kubectl logs -n $NAMESPACE deployment/progrc-backend | grep -i gradient"
echo "   4. Test agent locally: ./test-gradient-agent.sh"


