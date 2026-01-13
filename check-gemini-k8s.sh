#!/bin/bash
# Check Gemini Configuration in Kubernetes

NAMESPACE="progrc-dev"
SECRET_NAME="progrc-bff-dev-secrets"
CONFIGMAP_NAME="progrc-config"

echo "🔍 Checking Gemini Configuration in Kubernetes"
echo "=============================================="
echo ""

# Check ConfigMap
echo "1️⃣  Checking ConfigMap..."
if kubectl get configmap "$CONFIGMAP_NAME" -n "$NAMESPACE" > /dev/null 2>&1; then
    USE_GEMINI=$(kubectl get configmap "$CONFIGMAP_NAME" -n "$NAMESPACE" -o jsonpath='{.data.USE_GEMINI}' 2>/dev/null)
    GEMINI_MODEL=$(kubectl get configmap "$CONFIGMAP_NAME" -n "$NAMESPACE" -o jsonpath='{.data.GEMINI_MODEL}' 2>/dev/null)
    
    echo "   ✅ ConfigMap exists"
    echo "   USE_GEMINI: ${USE_GEMINI:-not set}"
    echo "   GEMINI_MODEL: ${GEMINI_MODEL:-not set (using default)}"
    
    if [ "$USE_GEMINI" = "true" ]; then
        echo "   ✅ Gemini is enabled"
    else
        echo "   ⚠️  Gemini is NOT enabled"
    fi
else
    echo "   ❌ ConfigMap not found"
fi

echo ""

# Check Secret
echo "2️⃣  Checking Secret..."
if kubectl get secret "$SECRET_NAME" -n "$NAMESPACE" > /dev/null 2>&1; then
    HAS_KEY=$(kubectl get secret "$SECRET_NAME" -n "$NAMESPACE" -o jsonpath='{.data.GEMINI_API_KEY}' 2>/dev/null)
    
    if [ -n "$HAS_KEY" ]; then
        API_KEY=$(echo -n "$HAS_KEY" | base64 -d 2>/dev/null)
        KEY_LENGTH=$(echo -n "$API_KEY" | wc -c | tr -d ' ')
        
        echo "   ✅ Secret exists"
        echo "   ✅ GEMINI_API_KEY found"
        echo "   Key length: ${KEY_LENGTH} characters"
        echo "   First 10 chars: ${API_KEY:0:10}..."
        
        if echo "$API_KEY" | grep -q "^AIza"; then
            echo "   ✅ Format: Correct (starts with AIza)"
        else
            echo "   ⚠️  Format: Unexpected (should start with AIza)"
        fi
    else
        echo "   ✅ Secret exists"
        echo "   ❌ GEMINI_API_KEY NOT found in secret"
    fi
else
    echo "   ❌ Secret '$SECRET_NAME' not found"
fi

echo ""

# Check Backend Pods
echo "3️⃣  Checking Backend Pods..."
PODS=$(kubectl get pods -n "$NAMESPACE" -l app=progrc-backend -o name 2>/dev/null | head -1)
if [ -n "$PODS" ]; then
    POD_NAME=$(echo "$PODS" | cut -d'/' -f2)
    echo "   ✅ Backend pod found: $POD_NAME"
    
    # Check environment variables
    echo ""
    echo "   📋 Environment Variables:"
    USE_GEMINI_ENV=$(kubectl exec "$POD_NAME" -n "$NAMESPACE" -- env 2>/dev/null | grep "^USE_GEMINI=" | cut -d'=' -f2)
    HAS_GEMINI_KEY=$(kubectl exec "$POD_NAME" -n "$NAMESPACE" -- env 2>/dev/null | grep "^GEMINI_API_KEY=" | wc -c | tr -d ' ')
    GEMINI_MODEL_ENV=$(kubectl exec "$POD_NAME" -n "$NAMESPACE" -- env 2>/dev/null | grep "^GEMINI_MODEL=" | cut -d'=' -f2)
    
    echo "   USE_GEMINI: ${USE_GEMINI_ENV:-not set}"
    echo "   GEMINI_MODEL: ${GEMINI_MODEL_ENV:-not set (using default)}"
    
    if [ "$HAS_GEMINI_KEY" -gt 0 ] 2>/dev/null; then
        echo "   ✅ GEMINI_API_KEY: Set (hidden)"
    else
        echo "   ❌ GEMINI_API_KEY: Not set in pod"
    fi
    
    # Check logs
    echo ""
    echo "   📋 Recent Gemini Logs:"
    GEMINI_LOGS=$(kubectl logs "$POD_NAME" -n "$NAMESPACE" --tail=50 2>/dev/null | grep -i gemini | head -5)
    
    if [ -n "$GEMINI_LOGS" ]; then
        echo "$GEMINI_LOGS" | sed 's/^/      /'
        
        if echo "$GEMINI_LOGS" | grep -qi "initialized\|service initialized"; then
            echo ""
            echo "   ✅ Gemini service initialized successfully"
        elif echo "$GEMINI_LOGS" | grep -qi "not set\|missing\|error\|not available"; then
            echo ""
            echo "   ⚠️  Gemini service has issues - check logs above"
        fi
    else
        echo "   (No Gemini-related logs found - service might not have been used yet)"
    fi
else
    echo "   ❌ No backend pods found"
fi

echo ""
echo "✅ Kubernetes check complete!"
