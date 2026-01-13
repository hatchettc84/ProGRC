# Gradient Agent Endpoint Configuration

## ✅ Agent Endpoint Configured

Your Gradient AI Platform agent endpoint has been configured:
- **Endpoint**: `https://lyfxj4kyx25h6oj3zymh656q.agents.do-ai.run`
- **Type**: Agent endpoint (custom deployment)

## 🔧 Configuration Updates Made

### 1. ConfigMap Updated
- `GRADIENT_API_URL`: Set to your agent endpoint
- `GRADIENT_MODEL`: Empty (agent has model pre-configured)

### 2. Service Updated
- `gradient.service.ts` updated to handle agent endpoints
- Automatically detects agent endpoints (contains `agents.do-ai.run`)
- Removes `model` parameter for agent endpoints (pre-configured)
- Uses `/chat/completions` endpoint path (OpenAI-compatible format)

## 🔑 Required: API Key

You need to add your **Agent Access Key** to Kubernetes secrets:

```bash
# Add GRADIENT_API_KEY to Kubernetes secret
kubectl create secret generic progrc-bff-secrets \
  --from-literal=GRADIENT_API_KEY='your-agent-access-key-here' \
  --namespace=progrc-dev \
  --dry-run=client -o yaml | kubectl apply -f -
```

**OR** if secret already exists, edit it:

```bash
kubectl edit secret progrc-bff-secrets -n progrc-dev
```

Add this line in the `data` section:
```yaml
data:
  GRADIENT_API_KEY: <base64-encoded-api-key>
  # ... other keys
```

To base64 encode your key:
```bash
echo -n 'your-api-key' | base64
```

## 📍 Getting Your Agent Access Key

1. Go to your Gradient AI Platform dashboard
2. Navigate to your agent (the one with endpoint `lyfxj4kyx25h6oj3zymh656q`)
3. Go to **Settings** or **API Keys** section
4. Find **Agent Access Key** (different from workspace API key)
5. Copy the key

## 🧪 Testing the Agent

Once API key is added, test with:

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

Expected response:
```json
{
  "choices": [{
    "message": {
      "role": "assistant",
      "content": "..."
    }
  }]
}
```

## 🔄 Deploy Updates

After adding the API key:

1. **Restart backend pods** to pick up new configuration:
   ```bash
   kubectl rollout restart deployment/progrc-backend -n progrc-dev
   ```

2. **Check logs** for initialization:
   ```bash
   kubectl logs -n progrc-dev deployment/progrc-backend | grep -i gradient
   ```

   Should see:
   ```
   Gradient AI service initialized: https://lyfxj4kyx25h6oj3zymh656q.agents.do-ai.run, model: 
   ```

3. **Verify agent is being used**:
   ```bash
   kubectl logs -n progrc-dev deployment/progrc-backend | grep "Using Gradient AI"
   ```

## ✅ Verification Checklist

- [x] Agent endpoint configured: `https://lyfxj4kyx25h6oj3zymh656q.agents.do-ai.run`
- [x] ConfigMap updated with endpoint
- [x] Service code updated to handle agent endpoints
- [ ] Agent Access Key obtained from dashboard
- [ ] Agent Access Key added to Kubernetes secret: `progrc-bff-secrets`
- [ ] Backend pods restarted
- [ ] Backend logs show "Gradient AI service initialized"
- [ ] Test request successful

## 🎯 Next Steps

1. **Get Agent Access Key** from Gradient dashboard
2. **Add to Kubernetes secret** using command above
3. **Restart backend** to apply changes
4. **Verify in logs** that service initialized
5. **Test agent** with a sample request

Once the API key is added, your agent will be automatically used when Gemini is unavailable!


