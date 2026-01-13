# Activate All AI Features - Step-by-Step Guide

## 🎯 Goal

Activate all AI features in the ProGRC platform by verifying and configuring API keys for Gemini and Gradient AI.

## 📋 Prerequisites

- `kubectl` installed and configured
- Access to Kubernetes cluster (`progrc-dev` namespace)
- Network access to test API keys
- Gemini API key (get from https://makersuite.google.com/app/apikey)
- Gradient AI Agent Access Key (from your Gradient AI Platform dashboard)

## 🚀 Quick Start (Automated)

Run the comprehensive setup script:

```bash
./setup-ai-keys.sh
```

This will:
1. ✅ Check Kubernetes namespace and resources
2. ✅ Verify ConfigMap settings
3. ✅ Check existing API keys in secrets
4. ✅ Test Gemini API key validity
5. ✅ Test Gradient AI agent endpoint
6. ✅ Provide clear instructions for any missing keys

## 📝 Manual Setup Steps

### Step 1: Check Current Configuration

```bash
# Check namespace
kubectl get namespace progrc-dev

# Check ConfigMap
kubectl get configmap progrc-config -n progrc-dev -o yaml | grep -i gemini
kubectl get configmap progrc-config -n progrc-dev -o yaml | grep -i gradient

# Check Secret
kubectl get secret progrc-bff-dev-secrets -n progrc-dev
```

### Step 2: Verify Gemini API Key

#### Option A: Interactive Update Script

```bash
./update-gemini-key.sh
```

#### Option B: Manual Update

1. **Get your Gemini API key:**
   - Go to: https://makersuite.google.com/app/apikey
   - Sign in with Google account
   - Create or copy your API key

2. **Update Kubernetes Secret:**

   ```bash
   # Replace 'your-gemini-api-key-here' with your actual key
   kubectl patch secret progrc-bff-dev-secrets -n progrc-dev \
     --type='json' \
     -p='[{"op": "replace", "path": "/data/GEMINI_API_KEY", "value": "'$(echo -n 'your-gemini-api-key-here' | base64)'"}]'
   ```

   If the key doesn't exist yet, use `add` instead of `replace`:

   ```bash
   kubectl patch secret progrc-bff-dev-secrets -n progrc-dev \
     --type='json' \
     -p='[{"op": "add", "path": "/data/GEMINI_API_KEY", "value": "'$(echo -n 'your-gemini-api-key-here' | base64)'"}]'
   ```

3. **Verify the key:**

   ```bash
   # Check if key exists
   kubectl get secret progrc-bff-dev-secrets -n progrc-dev \
     -o jsonpath='{.data.GEMINI_API_KEY}' | base64 -d | head -c 20 && echo "..."

   # Test the key directly
   GEMINI_KEY=$(kubectl get secret progrc-bff-dev-secrets -n progrc-dev \
     -o jsonpath='{.data.GEMINI_API_KEY}' | base64 -d)
   
   curl -X POST \
     "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_KEY}" \
     -H "Content-Type: application/json" \
     -d '{"contents":[{"parts":[{"text":"Say hello"}]}]}'
   ```

   **Expected Success (HTTP 200):**
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

### Step 3: Configure Gradient AI Agent Key

1. **Get your Gradient AI Agent Access Key:**
   - Go to your Gradient AI Platform dashboard
   - Navigate to your agent: `lyfxj4kyx25h6oj3zymh656q`
   - Go to **Settings** → **API Keys**
   - Copy your **Agent Access Key** (not workspace key)

2. **Update Kubernetes Secret:**

   ```bash
   # Replace 'your-gradient-api-key-here' with your actual Agent Access Key
   kubectl patch secret progrc-bff-dev-secrets -n progrc-dev \
     --type='json' \
     -p='[{"op": "add", "path": "/data/GRADIENT_API_KEY", "value": "'$(echo -n 'your-gradient-api-key-here' | base64)'"}]'
   ```

   If updating existing key, use `replace`:

   ```bash
   kubectl patch secret progrc-bff-dev-secrets -n progrc-dev \
     --type='json' \
     -p='[{"op": "replace", "path": "/data/GRADIENT_API_KEY", "value": "'$(echo -n 'your-gradient-api-key-here' | base64)'"}]'
   ```

3. **Verify the agent endpoint:**

   ```bash
   # Test Gradient AI agent
   GRADIENT_KEY=$(kubectl get secret progrc-bff-dev-secrets -n progrc-dev \
     -o jsonpath='{.data.GRADIENT_API_KEY}' | base64 -d)
   
   curl -X POST \
     "https://lyfxj4kyx25h6oj3zymh656q.agents.do-ai.run/chat/completions" \
     -H "Authorization: Bearer ${GRADIENT_KEY}" \
     -H "Content-Type: application/json" \
     -d '{
       "messages": [
         {"role": "user", "content": "Say hello"}
       ]
     }'
   ```

   **Expected Success (HTTP 200):**
   ```json
   {
     "choices": [{
       "message": {
         "role": "assistant",
         "content": "Hello"
       }
     }]
   }
   ```

### Step 4: Apply Configuration Files

```bash
# Apply ConfigMap (contains USE_GEMINI, USE_GRADIENT, GEMINI_MODEL, GRADIENT_API_URL)
kubectl apply -f k8s/base/configmap.yaml -n progrc-dev

# Apply Secret (if you updated the file, otherwise skip - we updated via patch)
# kubectl apply -f k8s/base/secret.yaml -n progrc-dev
```

### Step 5: Restart Backend to Pick Up Changes

```bash
# Restart the backend deployment
kubectl rollout restart deployment/progrc-backend -n progrc-dev

# Wait for rollout to complete
kubectl rollout status deployment/progrc-backend -n progrc-dev

# This might take 1-2 minutes
```

### Step 6: Verify AI Services Initialized

```bash
# Check backend logs for AI service initialization
kubectl logs -n progrc-dev deployment/progrc-backend --tail=100 | grep -i "gemini\|gradient\|ai service initialized"
```

**Expected Output:**
```
Gemini service initialized with model: gemini-2.0-flash-exp
Gradient AI service initialized: https://lyfxj4kyx25h6oj3zymh656q.agents.do-ai.run, model: 
```

**If you see errors:**
```
Gemini is enabled but GEMINI_API_KEY is not set
```
→ API key is missing in secret

```
Gemini not available: API key is invalid
```
→ API key is invalid, update it

### Step 7: Verify Backend Pod Environment

```bash
# Check environment variables in running pod
kubectl exec -n progrc-dev deployment/progrc-backend -- env | grep -E "GEMINI|GRADIENT"
```

**Expected Output:**
```
USE_GEMINI=true
GEMINI_API_KEY=AIza... (hidden)
GEMINI_MODEL=gemini-2.0-flash-exp
USE_GRADIENT=true
GRADIENT_API_URL=https://lyfxj4kyx25h6oj3zymh656q.agents.do-ai.run
GRADIENT_API_KEY=... (hidden)
```

### Step 8: Test AI Features

Once the backend is running with valid API keys, test the AI features:

#### Test 1: Ask AI Endpoint

```bash
# Test Ask AI (requires authentication token)
curl -X POST "https://your-backend-url/api/v1/ask-ai/query" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "assessment_id": 1,
    "query_text": "What is access control in NIST 800-53?"
  }'
```

#### Test 2: Document Processing (Upload a document)

The document processing will automatically use AI to:
- Generate embeddings
- Map to controls
- Extract evidence
- Calculate relevance scores

## 🔍 Troubleshooting

### Issue: "Gemini is enabled but GEMINI_API_KEY is not set"

**Solution:**
1. Check if secret exists: `kubectl get secret progrc-bff-dev-secrets -n progrc-dev`
2. Check if key exists: `kubectl get secret progrc-bff-dev-secrets -n progrc-dev -o jsonpath='{.data.GEMINI_API_KEY}'`
3. If missing, add it using Step 2 above
4. Restart backend: `kubectl rollout restart deployment/progrc-backend -n progrc-dev`

### Issue: "Gemini not available: API key is invalid"

**Solution:**
1. Verify your API key is correct: `./verify-gemini-key.sh`
2. Get a new key from: https://makersuite.google.com/app/apikey
3. Update secret using Step 2 above
4. Restart backend

### Issue: "Gradient AI agent not responding"

**Solution:**
1. Check agent endpoint is correct in ConfigMap
2. Verify API key is Agent Access Key (not workspace key)
3. Test agent directly: `./test-gradient-agent.sh`
4. Check agent status in Gradient AI Platform dashboard

### Issue: Backend pod not picking up changes

**Solution:**
1. Force delete pod: `kubectl delete pod -n progrc-dev -l app=progrc-backend`
2. Wait for new pod: `kubectl get pods -n progrc-dev -l app=progrc-backend -w`
3. Check new pod logs: `kubectl logs -n progrc-dev -l app=progrc-backend --tail=100 | grep -i gemini`

## ✅ Verification Checklist

After completing all steps, verify:

- [ ] ConfigMap has `USE_GEMINI: "true"`
- [ ] ConfigMap has `USE_GRADIENT: "true"`
- [ ] ConfigMap has `GEMINI_MODEL: "gemini-2.0-flash-exp"`
- [ ] ConfigMap has `GRADIENT_API_URL` set correctly
- [ ] Secret has `GEMINI_API_KEY` (valid format, starts with "AIza")
- [ ] Secret has `GRADIENT_API_KEY` (valid Agent Access Key)
- [ ] Gemini API key is valid (test with curl)
- [ ] Gradient AI agent is accessible (test with curl)
- [ ] Backend pod has all environment variables set
- [ ] Backend logs show "Gemini service initialized"
- [ ] Backend logs show "Gradient AI service initialized"
- [ ] No errors in backend logs about missing/invalid keys

## 🎉 Success Indicators

When everything is configured correctly, you'll see:

1. **In Backend Logs:**
   ```
   Gemini service initialized with model: gemini-2.0-flash-exp
   Gradient AI service initialized: https://lyfxj4kyx25h6oj3zymh656q.agents.do-ai.run, model: 
   ```

2. **When Using AI Features:**
   - Document uploads will process with embeddings
   - Ask AI endpoint will respond with AI-generated answers
   - POAM generation will work
   - Recommendations will be enhanced
   - Control evaluation will provide suggestions

3. **In Application:**
   - AI features are available in the UI
   - Document analysis completes successfully
   - Interactive AI chat works
   - Automated compliance assistance is active

## 📚 Related Scripts

- `./setup-ai-keys.sh` - Complete automated setup check
- `./verify-gemini-key.sh` - Test Gemini API key
- `./update-gemini-key.sh` - Update Gemini API key interactively
- `./check-gemini-k8s.sh` - Check Gemini configuration in Kubernetes
- `./test-gradient-agent.sh` - Test Gradient AI agent
- `./verify-k8s-gradient-config.sh` - Verify Gradient AI Kubernetes config

## 🚀 Next Steps

Once AI is activated:

1. **Test Document Processing**: Upload a policy document and verify embeddings are generated
2. **Test Ask AI**: Use the interactive chat to ask compliance questions
3. **Test POAM Generation**: Generate POAMs from control gaps
4. **Test Recommendations**: Generate AI-powered recommendations
5. **Monitor Logs**: Watch for any AI service errors

## 📞 Support

If you encounter issues:
1. Check logs: `kubectl logs -n progrc-dev deployment/progrc-backend | grep -i "error\|gemini\|gradient"`
2. Verify API keys are valid using the test scripts
3. Check ConfigMap and Secret are applied correctly
4. Ensure backend pods have restarted after configuration changes

## ✅ Summary

All AI features are **implemented and ready**. You just need to:
1. ✅ Configure valid API keys (Gemini & Gradient AI)
2. ✅ Apply configuration files
3. ✅ Restart backend
4. ✅ Verify initialization in logs

Once done, **all 10+ AI features will be fully active**! 🎉


