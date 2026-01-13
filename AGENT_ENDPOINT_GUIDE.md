# Gradient AI Platform Agent Endpoint Guide

## 🔍 Important: Agent vs Standard API

If you created an **Agent** in Gradient AI Platform (not just using the standard API), you may need a different endpoint format.

## 📋 What to Check in Your Gradient Dashboard

### 1. Agent Details Page
When you click on your agent in the dashboard, look for:
- **Agent ID**: Usually a UUID or string identifier
- **API Endpoint**: May be shown as something like:
  - `https://api.gradient.ai/v1/agents/{agent-id}/chat`
  - `https://api.gradient.ai/v1/agent-deployments/{deployment-id}/chat`
  - Or just `https://api.gradient.ai/v1/chat/completions` (standard)

### 2. API Key
- Workspace API Key (standard API)
- Agent-specific API Key (if available)

### 3. Model
- The model your agent is using (may be auto-selected or you chose it)

## 🔧 Update Required?

### If Agent Uses Standard OpenAI-Compatible Format
**No changes needed!** The current configuration will work:
- Endpoint: `https://api.gradient.ai/v1/chat/completions`
- Model: Whatever model name you specify

### If Agent Uses Agent-Specific Endpoint
We'll need to update the service to use the agent endpoint. Common formats:
1. **Agent ID format**: `/v1/agents/{agent-id}/chat`
2. **Deployment format**: `/v1/agent-deployments/{deployment-id}/chat`

## 🧪 Test Your Agent Now

### Quick Test (Standard API)
```bash
curl -X POST "https://api.gradient.ai/v1/chat/completions" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama-3.1-70b-instruct",
    "messages": [
      {"role": "system", "content": "You are a GRC analyst."},
      {"role": "user", "content": "What is access control?"}
    ],
    "temperature": 0.3
  }'
```

### If That Fails, Try Agent Endpoint
```bash
# Replace {agent-id} with your actual agent ID
curl -X POST "https://api.gradient.ai/v1/agents/{agent-id}/chat" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "system", "content": "You are a GRC analyst."},
      {"role": "user", "content": "What is access control?"}
    ]
  }'
```

## 📝 Next Steps

Please provide:
1. ✅ **Agent Endpoint URL** from your dashboard
2. ✅ **API Response** from testing the endpoint
3. ✅ **Model Name** if different from default

Then I can:
- Update `gradient.service.ts` if needed
- Update ConfigMap with correct endpoint
- Verify everything works


