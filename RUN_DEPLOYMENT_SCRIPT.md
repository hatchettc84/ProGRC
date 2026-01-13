# Deployment Script - Build on DigitalOcean

## 🚀 Script to Run

Run this command to deploy your compliance scoring optimizations:

```bash
cd /Users/corneliushatchett/Downloads/PRO\ GRC/bff-service-backend-dev
bash build-via-kubectl-baseline.sh
```

## 📋 What This Script Does

1. ✅ **Creates a temporary namespace** with baseline Pod Security (allows root for Kaniko)
2. ✅ **Creates code archive** (excludes large files)
3. ✅ **Creates build pod** with Kaniko (no privileged containers needed!)
4. ✅ **Copies code via kubectl** (no SSH needed)
5. ✅ **Kaniko builds Docker image** (no Docker daemon needed)
6. ✅ **Pushes to registry** automatically
7. ✅ **Restarts deployment** in your main namespace
8. ✅ **Cleans up** temporary namespace

## ✅ Prerequisites

- ✅ `kubectl` installed and configured
- ✅ Access to Kubernetes cluster (`kubectl cluster-info` works)
- ✅ Registry secret exists (`registry-progrc` in `progrc-dev` namespace)

## 📊 Expected Duration

- **Code archive creation**: ~10 seconds
- **Pod creation**: ~10 seconds
- **File copy**: 1-5 minutes (depends on file size)
- **Docker build**: 10-20 minutes (this is normal!)
- **Image push**: 2-5 minutes
- **Deployment restart**: 1-2 minutes

**Total**: ~15-30 minutes

## 🔍 Monitoring Progress

The script will show progress, but you can also monitor manually:

```bash
# Watch build pod (in temporary namespace)
kubectl get pods -n progrc-build-* -w

# Watch Kaniko logs
kubectl logs -f <pod-name> -n <build-namespace> -c kaniko

# Watch deployment rollout
kubectl rollout status deployment/progrc-backend -n progrc-dev
```

## ✅ What Gets Deployed

All compliance scoring optimizations:
- ✅ Instant scoring method (`calculateInstantScores`)
- ✅ Optimized LLM processing (batch size 20, parallelism 24)
- ✅ New instant scoring endpoint (`/sync-instant`)
- ✅ Enhanced sync endpoints with instant scoring

## 🎯 After Deployment

Test the instant scoring:

1. **Check logs**:
   ```bash
   kubectl logs -n progrc-dev -l app=progrc-backend --tail=100 | grep "INSTANT SCORING"
   ```

2. **Start a compliance assessment** in the UI to see instant scores

3. **Verify deployment**:
   ```bash
   kubectl get pods -n progrc-dev -l app=progrc-backend
   ```

## 🆘 Troubleshooting

If the script fails:

1. **Check cluster connectivity**:
   ```bash
   kubectl cluster-info
   ```

2. **Check registry secret**:
   ```bash
   kubectl get secret registry-progrc -n progrc-dev
   ```

3. **Check build namespace** (if it exists):
   ```bash
   kubectl get namespaces | grep progrc-build
   ```

4. **Clean up if needed**:
   ```bash
   kubectl delete namespace progrc-build-*  # Replace * with actual namespace name
   ```

## Summary

**Command to run**:
```bash
bash build-via-kubectl-baseline.sh
```

This builds your Docker image directly in Kubernetes (no local Docker push needed!), then deploys it to your DigitalOcean cluster.
