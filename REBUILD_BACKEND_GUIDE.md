# 🔨 Backend Rebuild Guide

## Quick Rebuild Steps

### Option 1: Automated Script (Recommended)

Run the complete rebuild script:

```bash
cd /Users/corneliushatchett/Downloads/PRO\ GRC/bff-service-backend-dev
./rebuild-backend-complete.sh
```

This script will:
1. ✅ Build TypeScript (optional)
2. ✅ Build Docker image
3. ✅ Push to DigitalOcean Container Registry (if logged in)
4. ✅ Restart Kubernetes deployment
5. ✅ Verify pod status

### Option 2: Manual Step-by-Step

#### Step 1: Build TypeScript (Optional but Recommended)

```bash
cd /Users/corneliushatchett/Downloads/PRO\ GRC/bff-service-backend-dev
npm ci
npm run build
```

#### Step 2: Build Docker Image

```bash
# Build image with correct platform
docker build \
  --platform linux/amd64 \
  -f Dockerfile.simple \
  -t registry.digitalocean.com/progrc/progrc-backend:latest \
  -t progrc-backend:latest \
  .
```

**Note:** This may take 5-15 minutes depending on your system.

#### Step 3: Login to DigitalOcean Container Registry

```bash
# Option A: Using doctl (recommended)
doctl auth init  # Only needed once
doctl registry login

# Option B: Using docker directly
docker login registry.digitalocean.com
```

**If you get certificate errors with doctl**, use docker login directly:
```bash
docker login registry.digitalocean.com
# Enter your DigitalOcean username and access token when prompted
```

#### Step 4: Push Image to Registry

```bash
docker push registry.digitalocean.com/progrc/progrc-backend:latest
```

#### Step 5: Restart Kubernetes Deployment

```bash
# Restart backend deployment
kubectl rollout restart deployment/progrc-backend -n progrc-dev

# Wait for rollout to complete
kubectl rollout status deployment/progrc-backend -n progrc-dev --timeout=180s
```

#### Step 6: Verify Deployment

```bash
# Check pod status
kubectl get pods -n progrc-dev -l app=progrc-backend

# View logs
kubectl logs -n progrc-dev deployment/progrc-backend --tail=100

# Watch logs in real-time
kubectl logs -n progrc-dev deployment/progrc-backend -f
```

## Troubleshooting

### Certificate Error with doctl

If you see this error:
```
Error: Get "https://api.digitalocean.com/v2/registry/docker-credentials?expiry_seconds=2592000&read_write=true": tls: failed to verify certificate: x509: OSStatus -26276
```

**Solution:** Use docker login directly:
```bash
docker login registry.digitalocean.com
```

### Image Pull Errors in Kubernetes

If pods fail to pull the image:

1. **Check image pull secret:**
   ```bash
   kubectl get secret registry-progrc -n progrc-dev
   ```

2. **Recreate image pull secret:**
   ```bash
   # Get registry token
   DOCTL_TOKEN=$(doctl registry get-token)
   
   # Create secret
   kubectl create secret docker-registry registry-progrc \
     --docker-server=registry.digitalocean.com \
     --docker-username=$DOCTL_TOKEN \
     --docker-password=$DOCTL_TOKEN \
     --docker-email=your-email@example.com \
     --namespace=progrc-dev \
     --dry-run=client -o yaml | kubectl apply -f -
   ```

### Build Failures

If Docker build fails:

1. **Check build logs:**
   ```bash
   cat /tmp/docker-build.log
   ```

2. **Try building without cache:**
   ```bash
   docker build --no-cache --platform linux/amd64 -f Dockerfile.simple -t registry.digitalocean.com/progrc/progrc-backend:latest .
   ```

3. **Check TypeScript build first:**
   ```bash
   npm ci
   npm run build
   ```

### Pod Status Issues

If pods are not starting:

1. **Check pod events:**
   ```bash
   kubectl describe pod -n progrc-dev -l app=progrc-backend
   ```

2. **Check pod logs:**
   ```bash
   kubectl logs -n progrc-dev -l app=progrc-backend --tail=100
   ```

3. **Check image pull policy:**
   ```bash
   kubectl get deployment progrc-backend -n progrc-dev -o yaml | grep imagePullPolicy
   ```
   Should be `Always` to pull new images.

## Quick Commands Reference

```bash
# Build image
docker build --platform linux/amd64 -f Dockerfile.simple -t registry.digitalocean.com/progrc/progrc-backend:latest .

# Push image
docker push registry.digitalocean.com/progrc/progrc-backend:latest

# Restart deployment
kubectl rollout restart deployment/progrc-backend -n progrc-dev

# Check status
kubectl rollout status deployment/progrc-backend -n progrc-dev

# View logs
kubectl logs -n progrc-dev deployment/progrc-backend --tail=100

# Check pods
kubectl get pods -n progrc-dev -l app=progrc-backend

# Get pod events
kubectl describe pod -n progrc-dev -l app=progrc-backend
```

## Image Details

- **Registry:** `registry.digitalocean.com`
- **Repository:** `progrc/progrc-backend`
- **Tag:** `latest`
- **Platform:** `linux/amd64`
- **Dockerfile:** `Dockerfile.simple` (recommended) or `Dockerfile`

## Expected Results

After successful rebuild:

1. ✅ Docker image built locally
2. ✅ Image pushed to registry
3. ✅ Backend deployment restarted
4. ✅ Pods running and healthy
5. ✅ Application logs show successful startup

## Need Help?

If you encounter issues:

1. Check the build logs: `/tmp/docker-build.log`
2. Check pod events: `kubectl describe pod -n progrc-dev -l app=progrc-backend`
3. Check pod logs: `kubectl logs -n progrc-dev -l app=progrc-backend --tail=100`
4. Verify registry login: `docker login registry.digitalocean.com`
5. Verify Kubernetes cluster: `kubectl cluster-info`


