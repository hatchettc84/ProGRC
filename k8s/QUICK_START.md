# ProGRC Kubernetes Deployment - Quick Start Guide

## Recommended Approach: Two-Phase Deployment

### Phase 1: Quick Test (Local Image) ⚡
**Best for:** Initial testing, rapid iteration, development

**Steps:**
1. Build image locally
2. Load into cluster (if using minikube) OR use local registry
3. Deploy and test quickly

**Pros:**
- Fast iteration
- No registry setup needed
- Good for development/testing

**Cons:**
- Image only available on local machine
- Not suitable for production
- Harder to share across team

### Phase 2: Production Setup (Container Registry) 🚀
**Best for:** Production, team collaboration, CI/CD

**Steps:**
1. Create DigitalOcean Container Registry
2. Build and push image
3. Update manifests with registry image
4. Deploy with production-ready setup

**Pros:**
- Image persistence
- Team collaboration
- CI/CD integration
- Production-ready
- Image versioning

**Cons:**
- Requires registry setup
- Slightly more setup time

---

## My Recommendation: **Start with Phase 1, then move to Phase 2**

### Why?
1. **Quick validation** - Verify everything works first
2. **Faster feedback** - See results in minutes, not hours
3. **Easier debugging** - Fix issues before investing in registry setup
4. **Then scale** - Once working, migrate to registry for production

---

## Phase 1: Quick Test Deployment

### Option A: Using Docker Hub (Easiest)
```bash
# 1. Build image
cd /Users/corneliushatchett/Downloads/PRO\ GRC/bff-service-backend-dev
docker build -f Dockerfile.simple -t YOUR_DOCKERHUB_USER/progrc-backend:latest .

# 2. Push to Docker Hub
docker login
docker push YOUR_DOCKERHUB_USER/progrc-backend:latest

# 3. Update backend.yaml image to: YOUR_DOCKERHUB_USER/progrc-backend:latest
# 4. Deploy
./k8s/deploy-to-do.sh
```

### Option B: Using DigitalOcean Container Registry (Recommended for DO)
```bash
# 1. Create registry (if not exists)
doctl registry create progrc-registry

# 2. Login to registry
doctl registry login

# 3. Build and tag
docker build -f Dockerfile.simple -t registry.digitalocean.com/progrc-registry/progrc-backend:latest .

# 4. Push
docker push registry.digitalocean.com/progrc-registry/progrc-backend:latest

# 5. Update backend.yaml image to: registry.digitalocean.com/progrc-registry/progrc-backend:latest
# 6. Deploy
./k8s/deploy-to-do.sh
```

### Option C: Local Build + Manual Load (For Testing Only)
```bash
# 1. Build locally
docker build -f Dockerfile.simple -t progrc-backend:latest .

# 2. Save image
docker save progrc-backend:latest | gzip > progrc-backend.tar.gz

# 3. Transfer to cluster node (if you have SSH access)
# scp progrc-backend.tar.gz user@node-ip:/tmp/

# 4. Load on node
# ssh user@node-ip "docker load < /tmp/progrc-backend.tar.gz"

# Note: This is complex and not recommended. Use registry instead.
```

---

## Phase 2: Production Setup

Once Phase 1 is working:

1. **Set up DigitalOcean Container Registry** (if not done)
2. **Update CI/CD** to build and push on commits
3. **Use image tags** for versioning (e.g., `:v1.0.0`, `:latest`)
4. **Set up image pull secrets** if using private registry
5. **Configure auto-scaling** and monitoring

---

## Quick Decision Tree

**Q: Do you have a Docker Hub account?**
- ✅ Yes → Use Docker Hub (fastest)
- ❌ No → Use DigitalOcean Registry (best for DO)

**Q: Is this for production?**
- ✅ Yes → Use Container Registry (Phase 2)
- ❌ No → Use Docker Hub or DO Registry (Phase 1)

**Q: Do you need team collaboration?**
- ✅ Yes → Use Container Registry (Phase 2)
- ❌ No → Docker Hub is fine (Phase 1)

---

## My Specific Recommendation for You:

**Start with DigitalOcean Container Registry** because:
1. ✅ You're already on DigitalOcean
2. ✅ Integrated with your cluster
3. ✅ No extra accounts needed
4. ✅ Production-ready from the start
5. ✅ Easy to set up (just a few commands)

**Time estimate:** 10-15 minutes for registry setup + build + push + deploy



