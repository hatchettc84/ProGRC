# Gemini Configuration Check

## ✅ Current Configuration Status

Based on the codebase review, here's the Gemini configuration status:

### ✅ What's Configured Correctly:

1. **ConfigMap** (`k8s/base/configmap.yaml`):
   - ✅ `USE_GEMINI: "true"` - Gemini is enabled

2. **Secret** (`k8s/base/secret.yaml`):
   - ✅ `GEMINI_API_KEY: "AIzaSyBbXF6oj-tnf9ofUy1u6Hex2i-Fr5xC69o"` - API key is set
   - ⚠️  **Note**: This looks like a placeholder/example key. You should replace it with your real API key.

3. **Service Code** (`src/llms/gemini.service.ts`):
   - ✅ Service is properly implemented
   - ✅ Checks for `USE_GEMINI === "true"` AND `GEMINI_API_KEY` exists
   - ✅ Default model: `gemini-2.0-flash-exp` (if not specified)
   - ✅ Proper error handling and availability checks

### ⚠️  Potential Issues:

1. **Secret Name Mismatch**:
   - Secret file name: `progrc-secrets`
   - But other docs reference: `progrc-bff-secrets`
   - **Action**: Verify which secret name is actually used in your deployment

2. **API Key Verification**:
   - The key in `secret.yaml` looks like a placeholder
   - **Action**: Ensure a valid Gemini API key is in Kubernetes

3. **Model Not Explicitly Set**:
   - `GEMINI_MODEL` not in ConfigMap (optional, defaults to `gemini-2.0-flash-exp`)
   - **Action**: Optional - add to ConfigMap if you want a different model

## 🔍 Verification Steps

### Step 1: Check Which Secret Is Used

Run this to see what secrets are in your cluster:
```bash
kubectl get secrets -n progrc-dev | grep progrc
```

### Step 2: Verify Gemini API Key Exists

Check if the key is in the secret:
```bash
# If secret is named "progrc-secrets"
kubectl get secret progrc-secrets -n progrc-dev -o jsonpath='{.data.GEMINI_API_KEY}' | base64 -d

# OR if secret is named "progrc-bff-secrets"
kubectl get secret progrc-bff-secrets -n progrc-dev -o jsonpath='{.data.GEMINI_API_KEY}' | base64 -d
```

### Step 3: Check Backend Pods

Verify the key is available in pods:
```bash
kubectl exec -n progrc-dev deployment/progrc-backend -- env | grep GEMINI
```

Expected output:
```
USE_GEMINI=true
GEMINI_API_KEY=AIzaSy...
GEMINI_MODEL=gemini-2.0-flash-exp (if set, otherwise uses default)
```

### Step 4: Check Logs

Check if Gemini initialized correctly:
```bash
kubectl logs -n progrc-dev deployment/progrc-backend --tail=100 | grep -i gemini
```

Expected logs:
```
Gemini service initialized with model: gemini-2.0-flash-exp
```

If you see:
```
Gemini is enabled but GEMINI_API_KEY is not set
```
→ API key is missing in Kubernetes

### Step 5: Test Gemini Availability

The service automatically checks availability. Look for logs showing:
```
Using Gemini for AI processing
```

## 🔧 Configuration Recommendations

### 1. Add GEMINI_MODEL to ConfigMap (Optional)

If you want to use a different model explicitly:

```yaml
# Add to k8s/base/configmap.yaml
GEMINI_MODEL: "gemini-2.0-flash-exp"  # or gemini-pro, gemini-1.5-pro, etc.
```

### 2. Verify Secret Name

Make sure your deployment uses the correct secret name. Check your deployment manifest for:
```yaml
envFrom:
  - secretRef:
      name: progrc-secrets  # or progrc-bff-secrets
```

### 3. Update API Key If Needed

If the API key in `secret.yaml` is a placeholder, replace it:

```bash
# Get your real API key from: https://makersuite.google.com/app/apikey
kubectl create secret generic progrc-secrets \
  --from-literal=GEMINI_API_KEY='your-real-api-key-here' \
  --namespace=progrc-dev \
  --dry-run=client -o yaml | kubectl apply -f -
```

## ✅ Quick Verification Script

Run the verification script:
```bash
./verify-gemini-config.sh
```

This will check:
- ✅ ConfigMap settings
- ✅ Secret existence and API key
- ✅ Backend pod environment variables
- ✅ Backend logs for initialization

## 🎯 Summary

**Gemini Configuration Status:**
- ✅ Service code: Correctly implemented
- ✅ ConfigMap: `USE_GEMINI=true` (enabled)
- ⚠️  Secret: API key exists but may be placeholder
- ❓ Secret name: Need to verify which one is used (`progrc-secrets` vs `progrc-bff-secrets`)
- ⚠️  Model: Not explicitly set (uses default - OK)

**Action Items:**
1. Verify secret name used in deployment
2. Confirm API key is valid (not placeholder)
3. Run verification script: `./verify-gemini-config.sh`
4. Check backend logs for initialization

If Gemini is working, you'll see logs like:
```
Gemini service initialized with model: gemini-2.0-flash-exp
Using Gemini for AI processing
```


