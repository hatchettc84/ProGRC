# 🎯 Recommended Deployment Approach

## My Recommendation: **DigitalOcean Container Registry**

### Why This is Best for You:

1. ✅ **You're already on DigitalOcean** - No context switching
2. ✅ **Integrated with your cluster** - Automatic authentication
3. ✅ **Production-ready** - No need to migrate later
4. ✅ **Simple setup** - Just a few commands
5. ✅ **Team-friendly** - Easy to share and collaborate

---

## Quick Start (3 Steps)

### Step 1: Install doctl (if not installed)
```bash
brew install doctl
doctl auth init
# Enter your DigitalOcean API token when prompted
```

### Step 2: Run the automated setup script
```bash
cd /Users/corneliushatchett/Downloads/PRO\ GRC/bff-service-backend-dev
./k8s/setup-registry-and-deploy.sh
```

This script will:
- Create/verify Container Registry
- Build Docker image
- Push to registry
- Update Kubernetes manifests
- Create image pull secrets

### Step 3: Deploy to Kubernetes
```bash
./k8s/deploy-to-do.sh
```

---

## Manual Alternative (If You Prefer Step-by-Step)

### 1. Create Container Registry
```bash
doctl registry create progrc-registry
doctl registry login
```

### 2. Build and Push Image
```bash
cd /Users/corneliushatchett/Downloads/PRO\ GRC/bff-service-backend-dev
docker build -f Dockerfile.simple -t registry.digitalocean.com/progrc-registry/progrc-backend:latest .
docker push registry.digitalocean.com/progrc-registry/progrc-backend:latest
```

### 3. Update backend.yaml
Change line 18 in `k8s/services/backend.yaml`:
```yaml
image: registry.digitalocean.com/progrc-registry/progrc-backend:latest
```

### 4. Create Image Pull Secret
```bash
kubectl create secret docker-registry regcred \
  --docker-server=registry.digitalocean.com \
  --docker-username="$(doctl registry get-token)" \
  --docker-password="$(doctl registry get-token)" \
  --docker-email="your-email@example.com" \
  --namespace=progrc-dev
```

### 5. Add imagePullSecrets to backend.yaml
Add this to the `spec.template.spec` section:
```yaml
imagePullSecrets:
- name: regcred
```

### 6. Deploy
```bash
./k8s/deploy-to-do.sh
```

---

## Time Estimate

- **Automated script**: ~15-20 minutes (includes build time)
- **Manual steps**: ~20-25 minutes

---

## Why Not Docker Hub?

Docker Hub works, but:
- ❌ Requires separate account
- ❌ Rate limits on free tier
- ❌ Not integrated with DO
- ❌ Extra authentication step

**Use Docker Hub only if:**
- You already have an account
- You want the absolute fastest setup
- This is just for testing

---

## Next Steps After Deployment

1. **Verify pods are running:**
   ```bash
   kubectl get pods -n progrc-dev
   ```

2. **Check logs:**
   ```bash
   kubectl logs -n progrc-dev -l app=progrc-backend -f
   ```

3. **Port forward for testing:**
   ```bash
   kubectl port-forward -n progrc-dev svc/progrc-backend 3001:3000
   ```

4. **Set up Ingress** (for external access):
   ```bash
   kubectl apply -f k8s/ingress/ingress.yaml
   ```

---

## Questions?

- **Q: Do I need to install Docker locally?**
  - A: Yes, for building the image. Or use GitHub Actions/CI to build and push.

- **Q: Can I use a different registry?**
  - A: Yes! Just update the image name in backend.yaml and create appropriate pull secrets.

- **Q: What if the build fails?**
  - A: Check Dockerfile.simple and ensure all dependencies are correct. The script will show errors.

- **Q: How do I update the image later?**
  - A: Rebuild, push with same tag, then restart pods: `kubectl rollout restart deployment/progrc-backend -n progrc-dev`



