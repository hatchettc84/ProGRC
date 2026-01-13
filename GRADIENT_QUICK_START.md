# Gradient Agent Quick Start Guide

## ✅ What's Already Done

1. ✅ Agent endpoint configured: `https://lyfxj4kyx25h6oj3zymh656q.agents.do-ai.run`
2. ✅ ConfigMap updated with endpoint
3. ✅ Service code updated to handle agent endpoints
4. ✅ Test scripts created

## 🚀 Quick Setup (3 Steps)

### Step 1: Get Your Agent Access Key

1. Go to [Gradient AI Platform Dashboard](https://cloud.digitalocean.com/agents)
2. Click on your agent: `lyfxj4kyx25h6oj3zymh656q`
3. Go to **Settings** → **API Keys**
4. Copy your **Agent Access Key** (not workspace key)

### Step 2: Add API Key to Kubernetes

```bash
# Option A: If secret doesn't exist or you want to add just the key
kubectl create secret generic progrc-bff-secrets \
  --from-literal=GRADIENT_API_KEY='YOUR_AGENT_ACCESS_KEY_HERE' \
  --namespace=progrc-dev \
  --dry-run=client -o yaml | kubectl apply -f -

# Option B: If secret already exists, edit it
kubectl edit secret progrc-bff-secrets -n progrc-dev
# Then add: GRADIENT_API_KEY: <base64-encoded-key>
# To encode: echo -n 'your-key' | base64
```

### Step 3: Verify & Test

```bash
# Check Kubernetes configuration
./verify-k8s-gradient-config.sh

# Test agent locally (will prompt for API key if not set)
./test-gradient-agent.sh

# Or test directly with your key
GRADIENT_API_KEY='your-key' ./test-gradient-agent.sh
```

## 🔄 Deploy to Kubernetes

After adding the API key:

```bash
# 1. Apply updated ConfigMap (if not already done)
kubectl apply -f k8s/base/configmap.yaml -n progrc-dev

# 2. Restart backend to pick up new config
kubectl rollout restart deployment/progrc-backend -n progrc-dev

# 3. Wait for rollout
kubectl rollout status deployment/progrc-backend -n progrc-dev

# 4. Check logs
kubectl logs -n progrc-dev deployment/progrc-backend --tail=50 | grep -i gradient
```

Expected log output:
```
Gradient AI service initialized: https://lyfxj4kyx25h6oj3zymh656q.agents.do-ai.run, model: 
```

## 🧪 Test Your Agent

### Test 1: Local Test (Before Deploying)
```bash
./test-gradient-agent.sh
```

### Test 2: Direct API Test
```bash
curl -X POST "https://lyfxj4kyx25h6oj3zymh656q.agents.do-ai.run/chat/completions" \
  -H "Authorization: Bearer YOUR_AGENT_ACCESS_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "system", "content": "You are a GRC analyst."},
      {"role": "user", "content": "What is access control in NIST 800-53?"}
    ],
    "temperature": 0.3
  }'
```

### Test 3: Backend Integration Test
After deploying, test through your backend API:
```bash
# Test any AI feature in your app (Ask AI, document analysis, etc.)
# Check logs to see: "Using Gradient AI for LLM processing"
```

## ✅ Verification Checklist

Run this command to verify everything:
```bash
./verify-k8s-gradient-config.sh
```

Checklist:
- [ ] ConfigMap has correct endpoint
- [ ] API key added to Kubernetes secret
- [ ] Backend pods restarted
- [ ] Logs show "Gradient AI service initialized"
- [ ] Test request successful

## 📊 Priority Chain

Your LLM services are now prioritized as:
1. **Gemini** (if available)
2. **Gradient Agent** ← Your new agent (if Gemini unavailable)
3. **OpenAI** (fallback)
4. **Ollama** (final fallback)

The system will automatically use your Gradient agent when Gemini is unavailable!

## 🐛 Troubleshooting

### Agent Not Responding?
1. Check API key is correct: `kubectl get secret progrc-bff-secrets -n progrc-dev -o jsonpath='{.data.GRADIENT_API_KEY}' | base64 -d`
2. Test endpoint directly: `./test-gradient-agent.sh`
3. Check agent status in Gradient dashboard

### Backend Not Using Agent?
1. Check logs: `kubectl logs -n progrc-dev deployment/progrc-backend | grep -i gradient`
2. Verify ConfigMap: `kubectl get configmap progrc-config -n progrc-dev -o yaml | grep GRADIENT`
3. Ensure pods restarted: `kubectl rollout restart deployment/progrc-backend -n progrc-dev`

### Authentication Errors?
- Make sure you're using **Agent Access Key**, not workspace API key
- Verify key permissions in Gradient dashboard
- Check key hasn't expired

## 📚 Files Created

- `test-gradient-agent.sh` - Test agent locally
- `verify-k8s-gradient-config.sh` - Verify Kubernetes config
- `GRADIENT_AGENT_ENDPOINT_CONFIG.md` - Detailed configuration guide
- `GRADIENT_QUICK_START.md` - This file

## 🎯 You're All Set!

Once you add the API key and restart the backend, your Gradient agent will be automatically used for all AI features in ProGRC!


