# Fix Docker Proxy "Use of Closed Network Connection" Error

## 🔴 Error: `use of closed network connection` on port 3128

The proxy connection is closing during large blob uploads to DigitalOcean registry.

## ✅ Solution: Bypass Proxy for DigitalOcean Registry

### Step 1: Disable Proxy in Current Session

```bash
# Completely clear all proxy variables
unset HTTP_PROXY HTTPS_PROXY http_proxy https_proxy NO_PROXY no_proxy
export HTTP_PROXY=""
export HTTPS_PROXY=""
export http_proxy=""
export https_proxy=""

# Verify they're cleared
env | grep -i proxy
# Should return nothing
```

### Step 2: Configure Docker Desktop to Bypass Proxy (macOS)

**IMPORTANT**: This is the most critical step!

1. Open **Docker Desktop**
2. Click the **Settings** (gear) icon
3. Go to **Resources** → **Proxies**
4. In the **"No proxy"** field, add:
   ```
   registry.digitalocean.com,*.digitalocean.com,localhost,127.0.0.1
   ```
5. **OR** if you don't need proxy, completely disable it
6. Click **"Apply & Restart"**
7. Wait for Docker to restart

### Step 3: Increase Timeout and Retry Push

```bash
# Set very long timeout
export DOCKER_CLIENT_TIMEOUT=1200
export COMPOSE_HTTP_TIMEOUT=1200
export DOCKER_BUILDKIT=0

# Login to registry first (if needed)
doctl registry login
# OR
docker login registry.digitalocean.com

# Retry push
docker push registry.digitalocean.com/progrc/progrc-backend:latest
```

### Step 4: Use Automated Fix Script

I've created a script that does all of the above:

```bash
cd /Users/corneliushatchett/Downloads/PRO\ GRC/bff-service-backend-dev
bash fix-proxy-push.sh
```

This script will:
- ✅ Clear all proxy variables
- ✅ Configure Docker config to bypass proxy
- ✅ Increase timeout settings
- ✅ Test registry connectivity
- ✅ Guide you through Docker Desktop settings
- ✅ Retry push with all fixes

## 🔍 Why This Happens

1. **Proxy closes connections** during large uploads (blobs)
2. **Docker registry uses chunked uploads** which proxy may not handle well
3. **Port 3128** is an HTTP proxy that's timing out or closing connections
4. **Network instability** through proxy during long transfers

## 🎯 Best Solution: Docker Desktop Proxy Settings

**The most reliable fix** is to configure Docker Desktop to bypass proxy for DigitalOcean:

1. **Docker Desktop** → **Settings** → **Resources** → **Proxies**
2. Add to **"No proxy"**: `registry.digitalocean.com,*.digitalocean.com`
3. **Apply & Restart**

This ensures Docker never uses the proxy for registry operations.

## 🚀 Alternative: Push Without Proxy Entirely

If you don't need proxy for anything, disable it completely:

1. **Docker Desktop** → **Settings** → **Resources** → **Proxies**
2. Uncheck/disable all proxy settings
3. **Apply & Restart**
4. Retry push

## 📋 After Successful Push

Once push succeeds, complete deployment:

```bash
# Restart Kubernetes deployment
kubectl rollout restart deployment/progrc-backend -n progrc-dev

# Wait for rollout (2-5 minutes)
kubectl rollout status deployment/progrc-backend -n progrc-dev --timeout=5m

# Verify pods
kubectl get pods -n progrc-dev -l app=progrc-backend

# Check logs for instant scoring
kubectl logs -n progrc-dev -l app=progrc-backend --tail=100 | grep "INSTANT SCORING"
```

## 🆘 If Still Failing After Proxy Bypass

### Option 1: Try Different Network
```bash
# Try from mobile hotspot or different WiFi
# Corporate networks often have restrictive proxies
```

### Option 2: Push in Smaller Chunks
```bash
# Rebuild with less compression
docker build --platform linux/amd64 \
  --compress=false \
  -t registry.digitalocean.com/progrc/progrc-backend:latest \
  -f Dockerfile .
```

### Option 3: Use Docker Buildx with Cache
```bash
# Use buildx with push and cache
docker buildx build --platform linux/amd64 \
  --push \
  --cache-from registry.digitalocean.com/progrc/progrc-backend:latest \
  -t registry.digitalocean.com/progrc/progrc-backend:latest \
  -f Dockerfile .
```

### Option 4: Manual Image Transfer
If proxy keeps interfering, save image and transfer:

```bash
# Save image locally
docker save registry.digitalocean.com/progrc/progrc-backend:latest | gzip > backend-image.tar.gz

# Transfer to server with better connection (scp, rsync, etc.)
# On that server:
# gunzip -c backend-image.tar.gz | docker load
# docker push registry.digitalocean.com/progrc/progrc-backend:latest
```

## 📊 Verify Proxy is Bypassed

After configuring Docker Desktop, verify:

```bash
# Check Docker is using no proxy for registry
docker info | grep -i proxy

# Test direct connection
curl -v --noproxy "*" https://registry.digitalocean.com/v2/
```

## Summary

**Root Cause**: Proxy (port 3128) is closing connections during large blob uploads

**Best Fix**: Configure Docker Desktop to bypass proxy for `registry.digitalocean.com`

**Quick Fix**: Run `bash fix-proxy-push.sh` script

**Alternative**: Disable proxy entirely if not needed


