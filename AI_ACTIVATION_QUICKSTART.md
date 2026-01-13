# AI Features Activation - Quick Start Guide

## 🚀 One-Command Setup Check

```bash
./setup-ai-keys.sh
```

This comprehensive script will:
- ✅ Check all Kubernetes resources
- ✅ Verify ConfigMap settings
- ✅ Test existing API keys
- ✅ Guide you through any missing keys
- ✅ Provide exact commands to fix issues

## 📋 Quick Checklist

### Step 1: Verify Configuration (30 seconds)
```bash
./setup-ai-keys.sh
```

### Step 2: Update API Keys (if needed)

**Gemini API Key:**
```bash
./update-gemini-key.sh
# OR manually:
kubectl patch secret progrc-bff-dev-secrets -n progrc-dev \
  --type='json' \
  -p='[{"op": "replace", "path": "/data/GEMINI_API_KEY", "value": "'$(echo -n 'YOUR_KEY' | base64)'"}]'
```

**Gradient AI Key:**
```bash
# Get Agent Access Key from Gradient AI Platform dashboard
kubectl patch secret progrc-bff-dev-secrets -n progrc-dev \
  --type='json' \
  -p='[{"op": "add", "path": "/data/GRADIENT_API_KEY", "value": "'$(echo -n 'YOUR_KEY' | base64)'"}]'
```

### Step 3: Deploy & Restart (1 minute)
```bash
# Apply configurations
kubectl apply -f k8s/base/configmap.yaml -n progrc-dev

# Restart backend
kubectl rollout restart deployment/progrc-backend -n progrc-dev

# Wait for rollout
kubectl rollout status deployment/progrc-backend -n progrc-dev
```

### Step 4: Verify AI Services (30 seconds)
```bash
# Check logs for initialization
kubectl logs -n progrc-dev deployment/progrc-backend --tail=100 | grep -i "gemini\|gradient\|ai service initialized"
```

**Expected Output:**
```
Gemini service initialized with model: gemini-2.0-flash-exp
Gradient AI service initialized: https://lyfxj4kyx25h6oj3zymh656q.agents.do-ai.run
```

## ✅ Success Indicators

When everything is working, you'll see:

1. **Backend Logs:**
   - "Gemini service initialized"
   - "Gradient AI service initialized"

2. **AI Features Available:**
   - ✅ Document processing with embeddings
   - ✅ Ask AI interactive chat
   - ✅ POAM auto-generation
   - ✅ Recommendation enhancement
   - ✅ Control evaluation assistance
   - ✅ Audit feedback processing
   - ✅ Policy generation

## 🔑 API Keys Needed

### 1. Gemini API Key
- **Get from:** https://makersuite.google.com/app/apikey
- **Format:** Starts with "AIza", 35-50 characters
- **Test:** `./verify-gemini-key.sh`

### 2. Gradient AI Agent Access Key
- **Get from:** Gradient AI Platform dashboard → Your agent → Settings → API Keys
- **Type:** Agent Access Key (not workspace key)
- **Endpoint:** `https://lyfxj4kyx25h6oj3zymh656q.agents.do-ai.run`
- **Test:** `./test-gradient-agent.sh`

## 🆘 Troubleshooting

### "Gemini is enabled but GEMINI_API_KEY is not set"
→ Run: `./update-gemini-key.sh`

### "Gemini not available: API key is invalid"
→ Get new key from https://makersuite.google.com/app/apikey and update

### "Gradient AI agent not responding"
→ Verify Agent Access Key (not workspace key) and endpoint URL

### Backend not picking up changes
→ Restart: `kubectl rollout restart deployment/progrc-backend -n progrc-dev`

## 📚 Full Documentation

For detailed instructions, see:
- **`ACTIVATE_AI_FEATURES.md`** - Complete step-by-step guide
- **`AI_INTEGRATION_COMPLETE.md`** - All AI features overview
- **`setup-ai-keys.sh`** - Automated setup check script

## 🎯 That's It!

Once you see both services initialized in the logs, all 10+ AI features are active and ready to use! 🎉


