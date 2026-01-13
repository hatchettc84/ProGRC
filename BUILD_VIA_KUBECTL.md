# Build via kubectl + Kaniko - No SSH, No Privileged Containers

## ✅ Solution: Build with Kaniko (Pod Security Compatible)

Since the cluster has **Pod Security Standards (restricted)** enabled, we can't use Docker-in-Docker. Instead, we use **Kaniko** - it builds Docker images without needing privileged containers or Docker daemon!

## 🚀 Quick Start

Run this script which builds using Kaniko (works with restricted Pod Security):

```bash
cd /Users/corneliushatchett/Downloads/PRO\ GRC/bff-service-backend-dev
bash build-via-kubectl.sh
```

## 📋 How It Works

1. **Creates code archive** (locally)
2. **Creates a Kubernetes pod** with Kaniko (no privileged containers!)
3. **Copies code via kubectl** (`kubectl cp`) - no SSH needed!
4. **Kaniko builds Docker image** (no Docker daemon needed!)
5. **Pushes to registry** automatically
6. **Restarts deployment**
7. **Cleans up** automatically

## ✅ Advantages

- ✅ **No SSH needed** - Uses kubectl API
- ✅ **No privileged containers** - Works with restricted Pod Security
- ✅ **No Docker daemon** - Kaniko builds directly
- ✅ **No proxy issues** - Pod has direct access to registry
- ✅ **Faster** - Builds in same cluster as deployment
- ✅ **Automatic cleanup** - Pod deleted after build

## 🔒 Pod Security Compatible

This solution is fully compatible with **Pod Security Standards (restricted)** because:
- ✅ No `privileged: true`
- ✅ No privilege escalation
- ✅ Runs as non-root user (65532)
- ✅ Seccomp profile enabled
- ✅ Capabilities dropped

## 📝 What the Script Does

```bash
# 1. Creates code archive
tar -czf /tmp/progrc-source.tar.gz ...

# 2. Creates pod with Kaniko (restricted-compliant)
kubectl apply -f kaniko-pod.yaml

# 3. Copies code via kubectl (no SSH!)
kubectl cp source.tar.gz namespace/pod:/workspace/ -c prepare

# 4. Kaniko builds automatically (no Docker daemon!)
# Kaniko container starts building when files are ready

# 5. Kaniko pushes to registry automatically
# (configured via registry secret)

# 6. Restarts deployment
kubectl rollout restart deployment/progrc-backend

# 7. Cleans up
kubectl delete pod build-pod
```

## 🔍 Prerequisites

- ✅ `kubectl` installed and configured
- ✅ Access to Kubernetes cluster
- ✅ Registry secret exists (`registry-progrc` in `progrc-dev` namespace)

## 📊 How Kaniko Works

Kaniko is a Google project that builds Docker images from a Dockerfile **without a Docker daemon**. It:
- Reads Dockerfile directly
- Executes each instruction in userspace
- Pushes layers to registry as it builds
- Works in restricted Kubernetes environments
- No privileged containers needed!

## 🚨 Troubleshooting

### If kubectl cp fails:

```bash
# Check pod is running
kubectl get pods -n progrc-dev | grep builder

# Check pod logs
kubectl logs <pod-name> -n progrc-dev -c prepare

# Try manual copy
kubectl cp <local-file> progrc-dev/<pod-name>:/workspace/ -c prepare
```

### If Kaniko build fails:

```bash
# Check Kaniko logs
kubectl logs <pod-name> -n progrc-dev -c kaniko --tail=200

# Check pod status
kubectl describe pod <pod-name> -n progrc-dev

# Common issues:
# - Registry authentication (check secret)
# - Dockerfile not found (check context path)
# - Build context issues (check workspace mount)
```

### If registry secret missing:

```bash
# Check if secret exists
kubectl get secret registry-progrc -n progrc-dev

# Create registry secret if missing
kubectl create secret docker-registry registry-progrc \
  --docker-server=registry.digitalocean.com \
  --docker-username=<your-token> \
  --docker-password=<your-token> \
  --docker-email=<your-email> \
  -n progrc-dev
```

### If build is slow:

Kaniko builds can take 10-20 minutes. This is normal for large images. You can:
- Watch progress: `kubectl logs -f <pod-name> -n progrc-dev -c kaniko`
- Check cache usage (Kaniko caches layers)
- Reduce Dockerfile layers if possible

## 📊 Expected Output

```
==========================================
Build in Kubernetes via kubectl + Kaniko
==========================================

✅ kubectl found
✅ Connected to Kubernetes cluster
✅ Registry secret found
✅ Archive created: 15M
✅ Pod is running
✅ Code copied successfully
✅ Build started
Build completed and image pushed!
✅ Kaniko build completed successfully!
✅ Build pod deleted
✅ Deployment restarted
✅ Rollout completed successfully
✅ Build and Deployment Complete!
```

## 🎯 Next Steps

After deployment:

1. **Verify pods**:
   ```bash
   kubectl get pods -n progrc-dev -l app=progrc-backend
   ```

2. **Check logs**:
   ```bash
   kubectl logs -n progrc-dev -l app=progrc-backend --tail=100 | grep "INSTANT SCORING"
   ```

3. **Test instant scoring**: Start a compliance assessment in the UI

## 📚 More About Kaniko

Kaniko is designed for building container images in environments where you don't have root access, such as:
- Kubernetes clusters with Pod Security Standards
- CI/CD pipelines
- Serverless environments
- Sandboxed build environments

It's used by Google Cloud Build and many other CI/CD systems.

## Summary

**This approach completely bypasses SSH and works with restricted Pod Security** - it uses kubectl API to transfer files and Kaniko to build images without needing privileged containers or Docker daemon!
