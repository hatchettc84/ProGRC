#!/bin/bash
# Update Gemini API Key in Kubernetes Secret

NAMESPACE="progrc-dev"
SECRET_NAME="progrc-bff-dev-secrets"

echo "🔑 Update Gemini API Key"
echo "========================"
echo ""

# Check if secret exists
if ! kubectl get secret "$SECRET_NAME" -n "$NAMESPACE" > /dev/null 2>&1; then
    echo "❌ Secret '$SECRET_NAME' not found in namespace '$NAMESPACE'"
    echo ""
    echo "Creating secret..."
    read -p "Enter your Gemini API key: " API_KEY
    
    if [ -z "$API_KEY" ]; then
        echo "No API key provided. Exiting."
        exit 1
    fi
    
    kubectl create secret generic "$SECRET_NAME" \
      --from-literal=GEMINI_API_KEY="$API_KEY" \
      --namespace="$NAMESPACE"
    
    echo "✅ Secret created with API key"
    exit 0
fi

# Get current key (if exists)
CURRENT_KEY_B64=$(kubectl get secret "$SECRET_NAME" -n "$NAMESPACE" -o jsonpath='{.data.GEMINI_API_KEY}' 2>/dev/null)
if [ -n "$CURRENT_KEY_B64" ]; then
    CURRENT_KEY=$(echo -n "$CURRENT_KEY_B64" | base64 -d 2>/dev/null)
    echo "📋 Current API Key (first 10 chars): ${CURRENT_KEY:0:10}..."
    echo ""
    read -p "Do you want to replace it? (y/n): " REPLACE
    
    if [ "$REPLACE" != "y" ] && [ "$REPLACE" != "Y" ]; then
        echo "Update cancelled."
        exit 0
    fi
fi

# Get new API key
echo ""
echo "Enter your Gemini API key:"
echo "(Get it from: https://makersuite.google.com/app/apikey)"
read -p "API Key: " API_KEY

if [ -z "$API_KEY" ]; then
    echo "No API key provided. Exiting."
    exit 1
fi

# Validate format
KEY_LENGTH=$(echo -n "$API_KEY" | wc -c | tr -d ' ')
if [ "$KEY_LENGTH" -lt 35 ] || [ "$KEY_LENGTH" -gt 50 ]; then
    echo "⚠️  Warning: Key length is $KEY_LENGTH (expected 35-50 characters)"
    read -p "Continue anyway? (y/n): " CONTINUE
    if [ "$CONTINUE" != "y" ] && [ "$CONTINUE" != "Y" ]; then
        exit 1
    fi
fi

if ! echo "$API_KEY" | grep -q "^AIza"; then
    echo "⚠️  Warning: Key doesn't start with 'AIza' (unexpected format for Gemini)"
    read -p "Continue anyway? (y/n): " CONTINUE
    if [ "$CONTINUE" != "y" ] && [ "$CONTINUE" != "Y" ]; then
        exit 1
    fi
fi

# Update secret
echo ""
echo "Updating secret..."
API_KEY_B64=$(echo -n "$API_KEY" | base64)

kubectl patch secret "$SECRET_NAME" -n "$NAMESPACE" \
  --type='json' \
  -p="[{\"op\": \"replace\", \"path\": \"/data/GEMINI_API_KEY\", \"value\": \"$API_KEY_B64\"}]" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Secret updated successfully"
else
    # Try add if replace fails (key doesn't exist)
    echo "Key doesn't exist, adding it..."
    kubectl patch secret "$SECRET_NAME" -n "$NAMESPACE" \
      --type='json' \
      -p="[{\"op\": \"add\", \"path\": \"/data/GEMINI_API_KEY\", \"value\": \"$API_KEY_B64\"}]"
    
    if [ $? -eq 0 ]; then
        echo "✅ API key added successfully"
    else
        echo "❌ Failed to update secret"
        echo ""
        echo "Try manually:"
        echo "kubectl edit secret $SECRET_NAME -n $NAMESPACE"
        exit 1
    fi
fi

echo ""
echo "🔄 Next steps:"
echo "   1. Restart backend: kubectl rollout restart deployment/progrc-backend -n $NAMESPACE"
echo "   2. Check logs: kubectl logs -n $NAMESPACE deployment/progrc-backend | grep -i gemini"
echo "   3. Verify: ./verify-gemini-key.sh"


