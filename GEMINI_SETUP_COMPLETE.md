# Gemini Setup Complete Guide

## ✅ What's Been Fixed

1. **Secret Name** ✅
   - Fixed from `progrc-secrets` to `progrc-bff-dev-secrets` (matches deployment)

2. **ConfigMap** ✅
   - Added explicit `GEMINI_MODEL: "gemini-2.0-flash-exp"`
   - `USE_GEMINI: "true"` is set

3. **Configuration Files** ✅
   - All files updated and ready to deploy

## 🔍 Verify Current Configuration

### Step 1: Check Kubernetes Configuration

Run this to see what's currently deployed:

```bash
./check-gemini-k8s.sh
```

This will show:
- ConfigMap settings
- Secret existence and API key
- Backend pod environment variables
- Recent Gemini logs

### Step 2: Verify API Key Validity

Test if the API key is valid:

```bash
./verify-gemini-key.sh
```

This will:
- Extract the API key
- Validate format
- Test with Gemini API
- Report if valid or invalid

## 🔑 Update API Key (If Needed)

### Option 1: Interactive Script (Recommended)

Run the update script:

```bash
./update-gemini-key.sh
```

This will:
- Check if secret exists
- Show current key (first 10 chars)
- Prompt for new key
- Validate format
- Update the secret in Kubernetes

### Option 2: Manual Update with kubectl

```bash
# Get your API key from: https://makersuite.google.com/app/apikey
# Then update:

kubectl patch secret progrc-bff-dev-secrets -n progrc-dev \
  --type='json' \
  -p='[{"op": "replace", "path": "/data/GEMINI_API_KEY", "value": "'$(echo -n 'your-api-key-here' | base64)'"}]'
```

### Option 3: Edit Secret Directly

```bash
kubectl edit secret progrc-bff-dev-secrets -n progrc-dev
```

Add or update:
```yaml
data:
  GEMINI_API_KEY: <base64-encoded-key>
```

To encode your key:
```bash
echo -n 'your-api-key-here' | base64
```

### Option 4: Update Secret File

1. Edit `k8s/base/secret.yaml`
2. Replace the API key with your real key:
   ```yaml
   GEMINI_API_KEY: "your-real-api-key-here"
   ```
3. Apply:
   ```bash
   kubectl apply -f k8s/base/secret.yaml -n progrc-dev
   ```

## 🚀 Deploy Configuration

After updating the API key (if needed), deploy the configurations:

### Step 1: Apply ConfigMap

```bash
kubectl apply -f k8s/base/configmap.yaml -n progrc-dev
```

### Step 2: Apply Secret

```bash
kubectl apply -f k8s/base/secret.yaml -n progrc-dev
```

### Step 3: Restart Backend

```bash
kubectl rollout restart deployment/progrc-backend -n progrc-dev
```

### Step 4: Wait for Rollout

```bash
kubectl rollout status deployment/progrc-backend -n progrc-dev
```

### Step 5: Verify Initialization

Check logs to ensure Gemini initialized:

```bash
kubectl logs -n progrc-dev deployment/progrc-backend --tail=100 | grep -i gemini
```

**Expected Output:**
```
Gemini service initialized with model: gemini-2.0-flash-exp
```

**If you see errors:**
```
Gemini is enabled but GEMINI_API_KEY is not set
```
→ API key is missing in secret

```
Gemini not available: API key is invalid
```
→ API key is invalid or expired

## 🧪 Test Gemini Integration

### Test 1: Check Service Availability

From inside a backend pod:

```bash
kubectl exec -n progrc-dev deployment/progrc-backend -- env | grep GEMINI
```

Expected:
```
USE_GEMINI=true
GEMINI_API_KEY=AIzaSy... (hidden)
GEMINI_MODEL=gemini-2.0-flash-exp
```

### Test 2: Check Logs

```bash
kubectl logs -n progrc-dev deployment/progrc-backend --tail=200 | grep -i gemini
```

Look for:
- ✅ "Gemini service initialized"
- ✅ "Using Gemini for AI processing"
- ❌ "Gemini not available"
- ❌ "API key is invalid"

### Test 3: Test API Endpoint (If Available)

If your backend has a test endpoint for LLM services:

```bash
curl -X POST "https://your-backend-url/api/v1/llm/test" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Say hello", "service": "gemini"}'
```

## 📋 Complete Checklist

- [ ] Run `./check-gemini-k8s.sh` to verify current state
- [ ] Run `./verify-gemini-key.sh` to test API key validity
- [ ] If key is invalid, run `./update-gemini-key.sh` to update
- [ ] Apply ConfigMap: `kubectl apply -f k8s/base/configmap.yaml -n progrc-dev`
- [ ] Apply Secret: `kubectl apply -f k8s/base/secret.yaml -n progrc-dev`
- [ ] Restart backend: `kubectl rollout restart deployment/progrc-backend -n progrc-dev`
- [ ] Wait for rollout: `kubectl rollout status deployment/progrc-backend -n progrc-dev`
- [ ] Check logs: `kubectl logs -n progrc-dev deployment/progrc-backend | grep -i gemini`
- [ ] Verify initialization: Look for "Gemini service initialized" in logs

## 🔧 Troubleshooting

### Issue: "Gemini is enabled but GEMINI_API_KEY is not set"

**Solution:**
1. Check if secret exists: `kubectl get secret progrc-bff-dev-secrets -n progrc-dev`
2. Check if key exists: `kubectl get secret progrc-bff-dev-secrets -n progrc-dev -o jsonpath='{.data.GEMINI_API_KEY}'`
3. If missing, add it using `./update-gemini-key.sh` or manual method above
4. Restart backend

### Issue: "Gemini not available: API key is invalid"

**Solution:**
1. Verify API key is correct: `./verify-gemini-key.sh`
2. Get a new key from: https://makersuite.google.com/app/apikey
3. Update secret using `./update-gemini-key.sh`
4. Restart backend

### Issue: Secret not found

**Solution:**
1. Check namespace: `kubectl get namespace progrc-dev`
2. Create secret: `kubectl create secret generic progrc-bff-dev-secrets --from-literal=GEMINI_API_KEY='your-key' --namespace=progrc-dev`
3. Or apply secret file: `kubectl apply -f k8s/base/secret.yaml -n progrc-dev`

### Issue: Backend pod not picking up changes

**Solution:**
1. Force restart: `kubectl delete pod -n progrc-dev -l app=progrc-backend`
2. Wait for new pod: `kubectl get pods -n progrc-dev -l app=progrc-backend -w`
3. Check new pod logs: `kubectl logs -n progrc-dev -l app=progrc-backend --tail=100 | grep -i gemini`

## 📚 Helpful Commands

```bash
# Check ConfigMap
kubectl get configmap progrc-config -n progrc-dev -o yaml | grep -i gemini

# Check Secret
kubectl get secret progrc-bff-dev-secrets -n progrc-dev -o yaml | grep -i gemini

# Check Backend Environment
kubectl exec -n progrc-dev deployment/progrc-backend -- env | grep GEMINI

# Watch Backend Logs
kubectl logs -n progrc-dev deployment/progrc-backend -f | grep -i gemini

# Restart Backend
kubectl rollout restart deployment/progrc-backend -n progrc-dev

# Check Rollout Status
kubectl rollout status deployment/progrc-backend -n progrc-dev
```

## ✅ Success Indicators

You'll know Gemini is configured correctly when you see:

1. **In ConfigMap:**
   - `USE_GEMINI: "true"`
   - `GEMINI_MODEL: "gemini-2.0-flash-exp"`

2. **In Secret:**
   - `GEMINI_API_KEY` exists and is valid format (starts with "AIza", 35-50 chars)

3. **In Backend Pod:**
   - Environment variables are set: `USE_GEMINI=true`, `GEMINI_API_KEY=...`, `GEMINI_MODEL=...`

4. **In Backend Logs:**
   - "Gemini service initialized with model: gemini-2.0-flash-exp"
   - No errors about missing or invalid API key

5. **When Using AI Features:**
   - "Using Gemini for AI processing"
   - Successful AI responses

## 🎯 Next Steps

1. **Run the verification scripts** to check current state
2. **Update API key if needed** using the provided script
3. **Deploy configurations** to Kubernetes
4. **Restart backend** and verify initialization
5. **Test AI features** in your application

Once all checks pass, Gemini will be fully configured and ready to use! 🚀


