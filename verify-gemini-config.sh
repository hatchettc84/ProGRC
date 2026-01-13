#!/bin/bash
# Verify Gemini Configuration in Kubernetes

echo "🔍 Verifying Gemini Configuration"
echo "=================================="
echo ""

NAMESPACE="progrc-dev"
SECRET_NAME="progrc-bff-secrets"
CONFIGMAP_NAME="progrc-config"

# Check ConfigMap
echo "📋 Checking ConfigMap: $CONFIGMAP_NAME"
if kubectl get configmap "$CONFIGMAP_NAME" -n "$NAMESPACE" > /dev/null 2>&1; then
    USE_GEMINI=$(kubectl get configmap "$CONFIGMAP_NAME" -n "$NAMESPACE" -o jsonpath='{.data.USE_GEMINI}' 2>/dev/null)
    GEMINI_MODEL=$(kubectl get configmap "$CONFIGMAP_NAME" -n "$NAMESPACE" -o jsonpath='{.data.GEMINI_MODEL}' 2>/dev/null)
    
    echo "   ✅ ConfigMap exists"
    echo "   USE_GEMINI: ${USE_GEMINI:-not set (defaults to false)}"
    echo "   GEMINI_MODEL: ${GEMINI_MODEL:-not set (defaults to gemini-2.0-flash-exp)}"
    
    if [ "$USE_GEMINI" = "true" ]; then
        echo "   ✅ Gemini is enabled in ConfigMap"
    else
        echo "   ⚠️  Gemini is NOT enabled (USE_GEMINI != true)"
    fi
else
    echo "   ❌ ConfigMap not found: $CONFIGMAP_NAME"
fi

echo ""

# Check Secret
echo "🔑 Checking Secret: $SECRET_NAME"
if kubectl get secret "$SECRET_NAME" -n "$NAMESPACE" > /dev/null 2>&1; then
    HAS_KEY=$(kubectl get secret "$SECRET_NAME" -n "$NAMESPACE" -o jsonpath='{.data.GEMINI_API_KEY}' 2>/dev/null)
    
    if [ -n "$HAS_KEY" ]; then
        KEY_LENGTH=$(echo -n "$HAS_KEY" | base64 -d 2>/dev/null | wc -c | tr -d ' ')
        echo "   ✅ GEMINI_API_KEY exists in secret"
        echo "   Key length: ${KEY_LENGTH} characters"
        echo "   ✅ API key is set (hidden for security)"
        
        # Check if key looks valid (Gemini keys usually start with "AIza")
        DECODED_KEY=$(echo -n "$HAS_KEY" | base64 -d 2>/dev/null)
        if echo "$DECODED_KEY" | grep -q "^AIza"; then
            echo "   ✅ API key format looks correct (starts with AIza)"
        else
            echo "   ⚠️  API key format unexpected (should start with 'AIza')"
        fi
    else
        echo "   ❌ GEMINI_API_KEY not found in secret"
        echo ""
        echo "   To add it, run:"
        echo "   kubectl create secret generic $SECRET_NAME \\"
        echo "     --from-literal=GEMINI_API_KEY='your-api-key-here' \\"
        echo "     --namespace=$NAMESPACE \\"
        echo "     --dry-run=client -o yaml | kubectl apply -f -"
        echo ""
        echo "   Or edit existing secret:"
        echo "   kubectl edit secret $SECRET_NAME -n $NAMESPACE"
    fi
else
    echo "   ❌ Secret not found: $SECRET_NAME"
    echo ""
    echo "   To create it with Gemini API key:"
    echo "   kubectl create secret generic $SECRET_NAME \\"
    echo "     --from-literal=GEMINI_API_KEY='your-api-key-here' \\"
    echo "     --namespace=$NAMESPACE"
fi

echo ""

# Check Backend Pods
echo "📦 Checking Backend Pods"
PODS=$(kubectl get pods -n "$NAMESPACE" -l app=progrc-backend -o name 2>/dev/null | head -1)
if [ -n "$PODS" ]; then
    POD_NAME=$(echo "$PODS" | cut -d'/' -f2)
    echo "   ✅ Backend pod found: $POD_NAME"
    
    # Check if Gemini is initialized in logs
    echo ""
    echo "   📋 Checking Gemini initialization in logs..."
    GEMINI_LOGS=$(kubectl logs "$POD_NAME" -n "$NAMESPACE" --tail=200 2>/dev/null | grep -i "gemini" | head -10)
    
    if [ -n "$GEMINI_LOGS" ]; then
        echo "   Recent Gemini-related logs:"
        echo "$GEMINI_LOGS" | sed 's/^/      /'
        echo ""
        
        if echo "$GEMINI_LOGS" | grep -qi "initialized\|service initialized"; then
            echo "   ✅ Gemini service initialized in backend"
        elif echo "$GEMINI_LOGS" | grep -qi "not set\|missing\|error\|not available"; then
            echo ""
            echo "   ⚠️  Gemini service might not be configured correctly"
            if echo "$GEMINI_LOGS" | grep -qi "GEMINI_API_KEY is not set"; then
                echo "   ❌ API key is missing - add GEMINI_API_KEY to secret"
            fi
        elif echo "$GEMINI_LOGS" | grep -qi "using gemini\|using Gemini"; then
            echo ""
            echo "   ✅ Gemini is being used by the backend"
        fi
    else
        echo "   ⚠️  No Gemini-related logs found"
        echo "   (Service might not have been used yet, or logs are old)"
    fi
    
    # Check environment variables in pod
    echo ""
    echo "   🔍 Checking environment variables in pod..."
    USE_GEMINI_ENV=$(kubectl exec "$POD_NAME" -n "$NAMESPACE" -- env 2>/dev/null | grep "^USE_GEMINI=" | cut -d'=' -f2)
    HAS_GEMINI_KEY=$(kubectl exec "$POD_NAME" -n "$NAMESPACE" -- env 2>/dev/null | grep "^GEMINI_API_KEY=" | wc -c | tr -d ' ')
    
    if [ -n "$USE_GEMINI_ENV" ]; then
        echo "   USE_GEMINI in pod: $USE_GEMINI_ENV"
    fi
    
    if [ "$HAS_GEMINI_KEY" -gt 0 ] 2>/dev/null; then
        echo "   ✅ GEMINI_API_KEY is set in pod environment"
    else
        echo "   ⚠️  GEMINI_API_KEY might not be set in pod environment"
    fi
else
    echo "   ❌ No backend pods found"
fi

echo ""
echo "✅ Verification complete!"
echo ""
echo "📝 Summary:"
if [ "$USE_GEMINI" = "true" ] && [ -n "$HAS_KEY" ]; then
    echo "   ✅ Gemini is enabled and API key is set"
    echo "   ✅ Configuration looks correct!"
else
    echo "   ⚠️  Gemini configuration needs attention:"
    if [ "$USE_GEMINI" != "true" ]; then
        echo "      - Set USE_GEMINI=true in ConfigMap"
    fi
    if [ -z "$HAS_KEY" ]; then
        echo "      - Add GEMINI_API_KEY to Kubernetes secret"
    fi
fi

echo ""
echo "📚 Next Steps:"
echo "   1. Get Gemini API key from: https://makersuite.google.com/app/apikey"
echo "   2. Add to secret: kubectl create secret generic $SECRET_NAME --from-literal=GEMINI_API_KEY='your-key' --namespace=$NAMESPACE --dry-run=client -o yaml | kubectl apply -f -"
echo "   3. Restart backend: kubectl rollout restart deployment/progrc-backend -n $NAMESPACE"
echo "   4. Check logs: kubectl logs -n $NAMESPACE deployment/progrc-backend | grep -i gemini"


