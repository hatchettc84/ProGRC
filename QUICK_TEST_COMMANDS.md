# Quick Test Commands - Instant Scoring

## 🚀 Quick Verification

### 1. Check Everything is Running
```bash
kubectl get pods -n progrc-dev -l app=progrc-backend
```

### 2. Verify Ollama Config
```bash
kubectl exec -n progrc-dev deployment/progrc-backend -- env | grep OLLAMA
```

### 3. Test Ollama Connectivity
```bash
kubectl run test-ollama --image=curlimages/curl --rm -i --restart=Never -- \
  curl -s http://64.225.20.65:11434/api/tags | jq '.models[].name'
```

### 4. Monitor Instant Scoring (Real-time)
```bash
kubectl logs -n progrc-dev -l app=progrc-backend -f | grep "INSTANT SCORING"
```

### 5. Check Recent Instant Scoring Activity
```bash
kubectl logs -n progrc-dev -l app=progrc-backend --tail=500 | grep "INSTANT SCORING"
```

---

## 🧪 Test the Endpoint

### Get Your Token First
1. Log into your application
2. Open browser DevTools → Network tab
3. Find any API request and copy the `Authorization: Bearer <token>` header

### Test Sync Endpoint
```bash
# Replace YOUR_TOKEN and YOUR_APP_ID
curl -X POST "https://your-domain.com/api/v1/compliances/apps/YOUR_APP_ID/sync" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -w "\n\nTime: %{time_total}s\n"
```

**Expected**: Response in < 1 second with success message

### Check Scores Immediately After
```bash
curl "https://your-domain.com/api/v1/compliances?appId=YOUR_APP_ID" \
  -H "Authorization: Bearer YOUR_TOKEN" | jq '.data[].percentage_completion'
```

**Expected**: Non-zero percentage values

---

## 📊 What Success Looks Like

### In Logs:
```
[INSTANT SCORING] Calculating instant scores for app 1, standards: 1, 2
[INSTANT SCORING] Updated 45 controls for standard 1
[INSTANT SCORING] Updated 38 controls for standard 2
[INSTANT SCORING] Completed in 234ms for app 1
[INSTANT SCORING] Instant scores calculated for app 1
```

### In API Response:
```json
{
  "code": "200",
  "message": "Compliance sync started successfully. Instant scores applied, LLM refinement running in background.",
  "data": {
    "appId": 1,
    "message": "Scores calculated instantly using chunk data. LLM refinement running in background for enhanced accuracy."
  }
}
```

### In UI:
- ✅ Completion percentages appear immediately
- ✅ Implementation explanations visible
- ✅ Progress indicators show completion
- ✅ Scores improve over time (background LLM)

---

## 🔍 Troubleshooting Quick Checks

### No Instant Scoring Logs?
```bash
# Check if code is deployed
kubectl exec -n progrc-dev deployment/progrc-backend -- \
  ls -la /app/dist/compliance/complianceV2.controller.js
```

### Ollama Not Working?
```bash
# Test from cluster
kubectl run test-ollama --image=curlimages/curl --rm -i --restart=Never -- \
  curl -v http://64.225.20.65:11434/api/tags
```

### No Scores Appearing?
```bash
# Check for errors
kubectl logs -n progrc-dev -l app=progrc-backend --tail=200 | grep -i error
```

---

**Ready to Test!** 🚀
