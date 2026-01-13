# Gradient AI Platform Agent Verification Guide

## ✅ Agent Created - Next Steps

Since you've created an agent in Gradient AI Platform, we need to verify the configuration and potentially update the backend to use the agent-specific endpoint.

## 🔍 What to Check in Gradient AI Platform Dashboard

### 1. Agent Details
In your Gradient AI Platform dashboard, check:
- **Agent Name**: Note the exact name
- **Agent ID/Endpoint**: Look for the API endpoint URL (might be different from standard `/v1/chat/completions`)
- **Model**: Note which model is assigned to your agent
- **API Key**: Verify you have the API key (different from workspace API key)

### 2. Agent API Endpoint Format
Gradient AI Platform agents might use one of these endpoint formats:
- Standard: `https://api.gradient.ai/v1/chat/completions`
- Agent-specific: `https://api.gradient.ai/v1/agents/{agent_id}/chat`
- Agent-specific: `https://api.gradient.ai/v1/agent-deployments/{deployment_id}/chat`

Check your agent's documentation or API endpoint in the dashboard.

### 3. Required Information
Please provide:
1. **Agent API Endpoint**: The full URL to call your agent
2. **Agent Model**: The model your agent is using (if different from default)
3. **API Key**: Your Gradient API key (we'll add it to Kubernetes secrets)

## 🔧 Current Backend Configuration

The backend is currently configured to use:
- **API URL**: `https://api.gradient.ai/v1` (ConfigMap)
- **Model**: `llama-3.1-70b-instruct` (ConfigMap)
- **Endpoint**: `/chat/completions` (hardcoded in service)

## 📝 Potential Updates Needed

### Option 1: Standard API (No Changes Needed)
If your agent uses the standard OpenAI-compatible API format, no changes are needed.

### Option 2: Agent-Specific Endpoint
If your agent uses a specific endpoint format, we may need to update `gradient.service.ts`:

```typescript
// Current endpoint
`${this.gradientApiUrl}/chat/completions`

// May need to change to:
`${this.gradientApiUrl}/agents/${agentId}/chat`
// or
`${this.gradientApiUrl}/agent-deployments/${deploymentId}/chat`
```

## 🧪 Testing Your Agent

### Test 1: Verify API Key
```bash
# Check if API key is set in Kubernetes
kubectl get secret progrc-bff-secrets -n progrc-dev -o jsonpath='{.data.GRADIENT_API_KEY}' | base64 -d
```

### Test 2: Test Agent Directly
```bash
# Replace with your actual values
curl -X POST "https://api.gradient.ai/v1/chat/completions" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "your-agent-model",
    "messages": [
      {"role": "system", "content": "You are a GRC analyst."},
      {"role": "user", "content": "Test message"}
    ]
  }'
```

### Test 3: Check Backend Logs
```bash
# Check if Gradient service initialized
kubectl logs -n progrc-dev deployment/progrc-backend | grep -i gradient

# Should see:
# "Gradient AI service initialized: https://api.gradient.ai/v1, model: llama-3.1-70b-instruct"
```

## 🔄 Update Configuration (If Needed)

### If Agent Uses Different Endpoint:

1. **Update ConfigMap** (`k8s/base/configmap.yaml`):
```yaml
GRADIENT_API_URL: "https://api.gradient.ai/v1/agents/your-agent-id"
# or
GRADIENT_API_URL: "https://api.gradient.ai/v1/agent-deployments/your-deployment-id"
```

2. **Update Service** (if endpoint path differs):
   - Modify `gradient.service.ts` to use the correct endpoint path
   - May need to adjust request format if agent API differs

3. **Update Model** (if different):
```yaml
GRADIENT_MODEL: "your-agent-model-name"
```

### Add API Key to Kubernetes:
```bash
# Add GRADIENT_API_KEY to existing secret
kubectl create secret generic progrc-bff-secrets \
  --from-literal=GRADIENT_API_KEY='your-api-key-here' \
  --namespace=progrc-dev \
  --dry-run=client -o yaml | kubectl apply -f -

# Or edit existing secret
kubectl edit secret progrc-bff-secrets -n progrc-dev
```

## ✅ Verification Checklist

- [ ] Agent created in Gradient AI Platform
- [ ] API endpoint URL noted (check dashboard)
- [ ] Model name noted (check dashboard)
- [ ] API key obtained (check dashboard)
- [ ] API key added to Kubernetes secret: `progrc-bff-secrets`
- [ ] ConfigMap updated with correct `GRADIENT_API_URL` (if needed)
- [ ] ConfigMap updated with correct `GRADIENT_MODEL` (if needed)
- [ ] Backend pods restarted: `kubectl rollout restart deployment/progrc-backend -n progrc-dev`
- [ ] Backend logs checked for "Gradient AI service initialized"
- [ ] Test request sent to verify agent responds correctly

## 📞 Need Help?

If you need to update the service code for a different API format, please provide:
1. The exact API endpoint format from your agent dashboard
2. Any example API requests/responses from Gradient documentation
3. Whether the agent uses OpenAI-compatible format or a custom format


