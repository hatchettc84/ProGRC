# Testing Guide - Instant Scoring Fix

## ✅ Pre-Deployment Verification

### 1. Check Deployment Status
```bash
kubectl get pods -n progrc-dev -l app=progrc-backend
```
**Expected**: All pods in `Running` state

### 2. Verify Ollama Configuration
```bash
kubectl exec -n progrc-dev deployment/progrc-backend -- env | grep OLLAMA
```
**Expected**:
```
USE_OLLAMA=true
OLLAMA_BASE_URL=http://64.225.20.65:11434
OLLAMA_MODEL=llama3.2:1b
OLLAMA_EMBEDDING_MODEL=nomic-embed-text
```

### 3. Test Ollama Connectivity
```bash
kubectl run test-ollama --image=curlimages/curl --rm -i --restart=Never -- \
  curl -s http://64.225.20.65:11434/api/tags
```
**Expected**: JSON response with both models listed

---

## 🧪 Testing Instant Scoring

### Method 1: Using the Test Script

```bash
chmod +x test-instant-scoring.sh
./test-instant-scoring.sh
```

This script will:
- ✅ Check pod status
- ✅ Verify Ollama configuration
- ✅ Test Ollama connectivity
- ✅ Monitor logs for instant scoring activity

### Method 2: Manual Testing

#### Step 1: Monitor Logs (Terminal 1)
```bash
kubectl logs -n progrc-dev -l app=progrc-backend -f | grep "INSTANT SCORING"
```

#### Step 2: Start Compliance Assessment (Frontend or API)

**Option A: Via Frontend UI**
1. Log into your application
2. Navigate to an application with compliance standards
3. Click "Start Compliance Assessment" or "Sync Compliance"
4. **Expected**: Scores should appear immediately (< 1 second)

**Option B: Via API**
```bash
# Replace with your actual token and app ID
curl -X POST "https://your-domain.com/api/v1/compliances/apps/1/sync" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response** (< 1 second):
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

#### Step 3: Verify Instant Scores

**Check Compliance Scores**:
```bash
curl "https://your-domain.com/api/v1/compliances?appId=1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected**: 
- `percentage_completion` values should be > 0 immediately
- `implementation_explanation` should be populated
- Scores visible in UI

#### Step 4: Check Logs

**Expected Log Messages**:
```
[INSTANT SCORING] Calculating instant scores for app 1, standards: 1, 2
[INSTANT SCORING] Updated 45 controls for standard 1
[INSTANT SCORING] Updated 38 controls for standard 2
[INSTANT SCORING] Completed in 234ms for app 1
[INSTANT SCORING] Instant scores calculated for app 1
```

---

## 📊 What to Look For

### ✅ Success Indicators

1. **Immediate Response**:
   - API returns in < 1 second
   - Success message mentions "instant scores"

2. **Scores Visible**:
   - Completion percentages appear immediately
   - Implementation explanations populated
   - UI shows progress indicators

3. **Log Messages**:
   - `[INSTANT SCORING]` messages appear
   - Completion time < 1000ms
   - Control update counts shown

4. **Background Processing**:
   - LLM refinement starts after instant scores
   - Scores improve over time (3-8 minutes)
   - No errors in logs

### ❌ Failure Indicators

1. **No Instant Scores**:
   - API takes > 5 seconds
   - No `[INSTANT SCORING]` logs
   - Scores remain at 0

2. **Errors**:
   - `[INSTANT SCORING] Failed to calculate instant scores`
   - Database connection errors
   - Missing chunk data errors

3. **Ollama Issues**:
   - Connection refused errors
   - Model not found errors
   - Timeout errors

---

## 🔍 Troubleshooting

### Issue: No Instant Scoring Logs

**Check**:
```bash
# Verify code is deployed
kubectl exec -n progrc-dev deployment/progrc-backend -- \
  grep -c "calculateInstantScores" /app/dist/compliance/complianceV2.controller.js

# Check if endpoint is being called
kubectl logs -n progrc-dev -l app=progrc-backend | grep "syncComplianceForApp"
```

**Solution**: Redeploy if code not found

### Issue: Scores Not Appearing

**Check**:
```bash
# Verify chunk data exists
kubectl exec -n progrc-dev deployment/progrc-backend -- \
  psql $DATABASE_URL -c "SELECT COUNT(*) FROM control_chunk_mapping WHERE app_id = 1 AND is_active = true;"
```

**Solution**: Ensure documents have been processed and chunks created

### Issue: Ollama Connection Failed

**Check**:
```bash
# Test from cluster
kubectl run test-ollama --image=curlimages/curl --rm -i --restart=Never -- \
  curl -s http://64.225.20.65:11434/api/tags

# Check Ollama service on AI Droplet
ssh root@64.225.20.65 "systemctl status ollama"
```

**Solution**: Verify Ollama is running and accessible

---

## 📈 Performance Benchmarks

### Expected Performance:

- **Instant Scoring**: < 1 second
- **API Response**: < 1 second
- **UI Update**: < 2 seconds
- **Background LLM**: 3-8 minutes

### Test Results Template:

```
Test Date: ___________
App ID: ___________
Standards: ___________

Instant Scoring Time: _____ ms
API Response Time: _____ ms
Controls Updated: _____
Scores Visible: Yes/No
LLM Started: Yes/No
```

---

## ✅ Success Checklist

- [ ] Backend pods running
- [ ] Ollama configured correctly
- [ ] Ollama accessible from cluster
- [ ] Instant scoring logs appear
- [ ] API responds in < 1 second
- [ ] Scores visible immediately
- [ ] Completion percentages > 0
- [ ] Implementation explanations present
- [ ] Background LLM processing starts
- [ ] No errors in logs

---

## 🎯 Next Steps After Testing

1. **If Successful**:
   - Document test results
   - Monitor production usage
   - Collect user feedback

2. **If Issues Found**:
   - Check logs for errors
   - Verify chunk data exists
   - Test Ollama connectivity
   - Redeploy if needed

---

**Last Updated**: January 13, 2026  
**Status**: Ready for Testing
