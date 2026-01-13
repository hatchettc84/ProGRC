# Run Deployment - Compliance Scoring Optimizations

## ⚠️ Shell Issue Detected

There appears to be a shell configuration issue preventing automated script execution. 

## Manual Deployment Steps

Please run these commands **manually in your terminal**:

### Step 1: Navigate to Project Directory
```bash
cd /Users/corneliushatchett/Downloads/PRO\ GRC/bff-service-backend-dev
```

### Step 2: Build TypeScript Code
```bash
npm run build
```

**Expected Output**: Should complete successfully with no errors

### Step 3: Build Docker Image
```bash
docker buildx build --platform linux/amd64 \
  -t registry.digitalocean.com/progrc/progrc-backend:latest \
  -f Dockerfile .
```

**Expected Output**: Image builds successfully

### Step 4: Login to Registry (if needed)
```bash
# Try doctl first
doctl registry login

# OR if doctl fails, use docker directly
docker login registry.digitalocean.com
```

**Note**: You'll need your DigitalOcean credentials

### Step 5: Push Image to Registry
```bash
docker push registry.digitalocean.com/progrc/progrc-backend:latest
```

**Expected Output**: Image pushes successfully

### Step 6: Restart Kubernetes Deployment
```bash
kubectl rollout restart deployment/progrc-backend -n progrc-dev
```

**Expected Output**: `deployment.apps/progrc-backend restarted`

### Step 7: Wait for Rollout
```bash
kubectl rollout status deployment/progrc-backend -n progrc-dev --timeout=5m
```

**Expected Output**: `deployment "progrc-backend" successfully rolled out`

### Step 8: Verify Deployment
```bash
# Check pods are running
kubectl get pods -n progrc-dev -l app=progrc-backend

# Check logs for instant scoring
kubectl logs -n progrc-dev -l app=progrc-backend --tail=100 | grep "INSTANT SCORING"
```

**Expected Output**: 
- Pods in `Running` state
- Logs showing instant scoring initialization (if any requests made)

## Alternative: Use Existing Script Directly

If you can run scripts, try:

```bash
cd /Users/corneliushatchett/Downloads/PRO\ GRC/bff-service-backend-dev
bash rebuild-backend-complete.sh
```

This script will guide you through the entire process interactively.

## What to Expect After Deployment

### When Testing Compliance Assessment:

1. **Start Assessment**: 
   - Call `POST /api/v1/compliances/apps/:appId/sync`
   - **Response**: < 1 second

2. **Check Scores**:
   - Call `GET /api/v1/compliances?appId=:appId`
   - **Expected**: Scores appear immediately

3. **Background Processing**:
   - LLM refinement runs in background (3-8 minutes)
   - Scores update again when LLM completes

## Verification Checklist

- [ ] Backend builds without errors (`npm run build`)
- [ ] Docker image builds successfully
- [ ] Image pushes to registry
- [ ] Kubernetes deployment restarts
- [ ] Pods are running and healthy
- [ ] Instant scoring logs appear when testing
- [ ] API endpoints respond with instant scores

## Troubleshooting

### If Build Fails
```bash
# Check for TypeScript errors
npm run build

# Check Node version
node --version  # Should be compatible with project

# Install dependencies if needed
npm install
```

### If Docker Build Fails
```bash
# Check Docker is running
docker ps

# Check Docker buildx is available
docker buildx version

# Try without buildx
docker build --platform linux/amd64 \
  -t registry.digitalocean.com/progrc/progrc-backend:latest \
  -f Dockerfile .
```

### If Registry Login Fails
```bash
# Try docker login directly
docker login registry.digitalocean.com
# Enter your DigitalOcean username and access token
```

### If Pods Don't Start
```bash
# Check pod status
kubectl describe pod <pod-name> -n progrc-dev

# Check logs
kubectl logs <pod-name> -n progrc-dev

# Check deployment
kubectl describe deployment/progrc-backend -n progrc-dev
```

## Rollback (If Needed)

If deployment causes issues:

```bash
# Rollback to previous version
kubectl rollout undo deployment/progrc-backend -n progrc-dev

# Check rollout history
kubectl rollout history deployment/progrc-backend -n progrc-dev
```

## Status

✅ **Code Changes**: Complete
✅ **Documentation**: Complete  
⏳ **Deployment**: Pending (needs manual execution)

## Support

If you encounter issues:
1. Check logs: `kubectl logs -n progrc-dev -l app=progrc-backend`
2. Review `COMPLIANCE_SCORING_OPTIMIZATIONS.md` for details
3. Review `DEPLOY_COMPLIANCE_OPTIMIZATIONS.md` for deployment guide

---

**Next Step**: Run the commands above manually in your terminal


