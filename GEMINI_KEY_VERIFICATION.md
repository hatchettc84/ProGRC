# Gemini API Key Verification

## ✅ Current API Key Status

Based on the secret file (`k8s/base/secret.yaml`):

**API Key Found:**
- Key: `AIzaSyBbXF6oj-tnf9ofUy1u6Hex2i-Fr5xC69o`
- Length: 39 characters ✅
- Format: Starts with "AIza" ✅ (correct Gemini key format)

**⚠️  Important:** This looks like a **placeholder/example key**. You should verify if this is your actual API key or replace it with a real one.

## 🔍 Verification Steps

### Step 1: Test API Key Locally

Run the verification script with network access:

```bash
./verify-gemini-key.sh
```

This will:
1. Extract the API key from Kubernetes secret or secret file
2. Validate the format (length, starts with "AIza")
3. Test the key with a real Gemini API call
4. Report if the key is valid or invalid

### Step 2: Check from Kubernetes

If you have `kubectl` access:

```bash
# Check if secret exists
kubectl get secret progrc-bff-dev-secrets -n progrc-dev

# Check if API key is set
kubectl get secret progrc-bff-dev-secrets -n progrc-dev \
  -o jsonpath='{.data.GEMINI_API_KEY}' | base64 -d

# Check backend pod environment
kubectl exec -n progrc-dev deployment/progrc-backend -- env | grep GEMINI
```

### Step 3: Test API Key Directly

Test the key with curl:

```bash
# Replace YOUR_API_KEY with your actual key
curl -X POST \
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{
      "parts": [{
        "text": "Say hello"
      }]
    }]
  }'
```

**Expected Success Response (HTTP 200):**
```json
{
  "candidates": [{
    "content": {
      "parts": [{
        "text": "Hello"
      }]
    }
  }]
}
```

**Invalid Key Response (HTTP 401):**
```json
{
  "error": {
    "code": 401,
    "message": "API key not valid. Please pass a valid API key.",
    "status": "UNAUTHENTICATED"
  }
}
```

## 🔧 If API Key Is Invalid

### Option 1: Get New API Key

1. Go to: https://makersuite.google.com/app/apikey
2. Sign in with your Google account
3. Click "Create API Key" or "Get API Key"
4. Copy the new key

### Option 2: Update Secret in Kubernetes

```bash
# Get your real API key, then:
kubectl patch secret progrc-bff-dev-secrets -n progrc-dev \
  --type='json' \
  -p='[{"op": "replace", "path": "/data/GEMINI_API_KEY", "value": "'$(echo -n 'your-real-api-key' | base64)'"}]'
```

Or edit the secret:
```bash
kubectl edit secret progrc-bff-dev-secrets -n progrc-dev
# Add/update: GEMINI_API_KEY: <base64-encoded-key>
```

### Option 3: Update Secret File (If Using GitOps)

1. Edit `k8s/base/secret.yaml`
2. Replace `GEMINI_API_KEY: "AIzaSyBbXF6oj-tnf9ofUy1u6Hex2i-Fr5xC69o"`
3. With your real key: `GEMINI_API_KEY: "your-real-api-key"`
4. Apply: `kubectl apply -f k8s/base/secret.yaml -n progrc-dev`

## ✅ Verification Checklist

- [ ] API key format is correct (starts with "AIza", 35-50 chars)
- [ ] API key is in Kubernetes secret: `progrc-bff-dev-secrets`
- [ ] API key is valid (test with curl or script)
- [ ] Backend pod has `GEMINI_API_KEY` environment variable
- [ ] Backend logs show: "Gemini service initialized"
- [ ] Test request to Gemini API returns 200 OK

## 🧪 Quick Test Commands

```bash
# Test 1: Format check
grep GEMINI_API_KEY k8s/base/secret.yaml | grep -q "^AIza" && echo "✅ Format OK" || echo "❌ Format invalid"

# Test 2: Length check
KEY=$(grep GEMINI_API_KEY k8s/base/secret.yaml | cut -d'"' -f2)
LEN=$(echo -n "$KEY" | wc -c)
if [ "$LEN" -ge 35 ] && [ "$LEN" -le 50 ]; then
    echo "✅ Length OK: $LEN chars"
else
    echo "⚠️  Length unexpected: $LEN chars (should be 35-50)"
fi

# Test 3: Actual API test (requires network)
./verify-gemini-key.sh
```

## 📊 Current Configuration

- **Secret Name**: `progrc-bff-dev-secrets` ✅ (matches deployment)
- **ConfigMap**: `USE_GEMINI: "true"` ✅
- **Model**: `gemini-2.0-flash-exp` ✅
- **API Key**: Exists in secret file ⚠️ (verify if valid)

## 🎯 Next Steps

1. **Run verification script**: `./verify-gemini-key.sh` (with network access)
2. **If key is invalid**: Get new key from https://makersuite.google.com/app/apikey
3. **Update secret** in Kubernetes with valid key
4. **Restart backend**: `kubectl rollout restart deployment/progrc-backend -n progrc-dev`
5. **Check logs**: `kubectl logs -n progrc-dev deployment/progrc-backend | grep -i gemini`

## 📝 Expected Results

**If everything is correct:**
```
✅ Secret exists
✅ API key found
✅ Format: Correct
✅ API key is VALID and working!
💬 Gemini Response: Hello
```

**If key is invalid:**
```
✅ Secret exists
✅ API key found
✅ Format: Correct
❌ INVALID API KEY (HTTP 401 - Unauthorized)
```


