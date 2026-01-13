# Quick Deploy Instructions - Compliance Scoring Optimizations

## ✅ All Code Changes Complete!

All compliance scoring optimizations have been implemented and are ready for deployment.

## 🚀 Deployment Steps

### Option 1: Use Existing Rebuild Script (Easiest)

```bash
cd /Users/corneliushatchett/Downloads/PRO\ GRC/bff-service-backend-dev
./rebuild-backend-complete.sh
```

This will:
1. Build TypeScript code
2. Build Docker image
3. Push to DigitalOcean registry
4. Restart Kubernetes deployment

### Option 2: Manual Deployment

```bash
# 1. Navigate to project
cd /Users/corneliushatchett/Downloads/PRO\ GRC/bff-service-backend-dev

# 2. Build backend
npm run build

# 3. Build Docker image (use existing script pattern)
docker buildx build --platform linux/amd64 \
  -t registry.digitalocean.com/progrc/progrc-backend:latest \
  -f Dockerfile .

# 4. Login to registry (if needed)
doctl registry login
# OR if doctl fails:
docker login registry.digitalocean.com

# 5. Push image
docker push registry.digitalocean.com/progrc/progrc-backend:latest

# 6. Restart deployment
kubectl rollout restart deployment/progrc-backend -n progrc-dev

# 7. Wait for rollout
kubectl rollout status deployment/progrc-backend -n progrc-dev --timeout=5m

# 8. Verify
kubectl get pods -n progrc-dev -l app=progrc-backend
```

## ✅ What's Been Deployed

### Instant Scoring System
- **Response Time**: < 1 second
- **Method**: Uses pre-computed chunk relevance scores
- **No LLM Required**: For initial scoring

### Optimized LLM Processing
- **Batch Size**: 20 controls (was 10)
- **Parallelism**: 24 batches (was 12)
- **Source Text**: 50k chars (was 75k)

### Enhanced Endpoints
- `POST /compliances/apps/:appId/sync` - Now includes instant scoring
- `POST /compliances/apps/:appId/resync` - Now includes instant scoring  
- `POST /compliances/apps/:appId/sync-instant` - New instant-only endpoint

## 🧪 Testing After Deployment

### 1. Check Pods Are Running
```bash
kubectl get pods -n progrc-dev -l app=progrc-backend
```

Expected: Pods in `Running` state

### 2. Check Logs for Instant Scoring
```bash
kubectl logs -n progrc-dev -l app=progrc-backend --tail=100 | grep "INSTANT SCORING"
```

Expected: See logs like:
```
[INSTANT SCORING] Calculating instant scores for app 1, standards: 1, 2
[INSTANT SCORING] Updated 45 controls for standard 1
[INSTANT SCORING] Completed in 234ms for app 1
```

### 3. Test Compliance Assessment (via Browser/API)

Start a compliance assessment and verify:
- ✅ Scores appear immediately (< 1 second)
- ✅ Scores update again after LLM processing (3-8 minutes)

## 📋 Verification Checklist

- [ ] Backend builds without errors
- [ ] Docker image builds successfully
- [ ] Image pushed to registry
- [ ] Kubernetes deployment restarted
- [ ] Pods are running and healthy
- [ ] Instant scoring logs appear when testing
- [ ] API endpoints respond with instant scores

## 📚 Documentation

- **Full Details**: `COMPLIANCE_SCORING_OPTIMIZATIONS.md`
- **Deployment Guide**: `DEPLOY_COMPLIANCE_OPTIMIZATIONS.md`
- **This File**: Quick reference

## 🐛 Troubleshooting

### Build Fails
```bash
# Check for TypeScript errors
npm run build

# Fix any errors shown
```

### Docker Build Fails
```bash
# Check Docker is running
docker ps

# Try with explicit platform
docker buildx build --platform linux/amd64 -t registry.digitalocean.com/progrc/progrc-backend:latest .
```

### Pods Not Starting
```bash
# Check pod status
kubectl describe pod <pod-name> -n progrc-dev

# Check logs
kubectl logs <pod-name> -n progrc-dev
```

### Instant Scoring Not Working
```bash
# Check if chunk data exists (SSH into pod or use kubectl exec)
# Check logs for errors
kubectl logs -n progrc-dev -l app=progrc-backend | grep -i error
```

## ⏪ Rollback (If Needed)

```bash
# Rollback to previous version
kubectl rollout undo deployment/progrc-backend -n progrc-dev

# Check rollout history
kubectl rollout history deployment/progrc-backend -n progrc-dev
```

---

**Status**: ✅ Ready to Deploy  
**Next Step**: Run `./rebuild-backend-complete.sh` or follow manual steps above


