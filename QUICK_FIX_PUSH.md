# Quick Fix for Docker Push "Broken Pipe" Error

## 🔴 Error: `write: broken pipe` on port 3128

This is a **proxy/network issue** during Docker push.

## ✅ Quick Fix (Try This First)

### Option 1: Disable Proxy and Retry (Recommended)

```bash
# Temporarily disable proxy
unset HTTP_PROXY HTTPS_PROXY http_proxy https_proxy

# Retry push
docker push registry.digitalocean.com/progrc/progrc-backend:latest
```

### Option 2: Use Retry Script

```bash
cd /Users/corneliushatchett/Downloads/PRO\ GRC/bff-service-backend-dev
bash retry-push.sh
```

This script will:
- Check proxy settings
- Disable proxy if needed
- Increase timeout
- Retry push with better settings

### Option 3: Fix Docker Desktop Proxy Settings (macOS)

1. Open **Docker Desktop**
2. Go to **Settings** → **Resources** → **Proxies**
3. Either:
   - **Remove proxy** if not needed, OR
   - Add `registry.digitalocean.com` to **"No proxy"** list
4. Click **Apply & Restart**
5. Retry push:
   ```bash
   docker push registry.digitalocean.com/progrc/progrc-backend:latest
   ```

### Option 4: Increase Timeout and Retry

```bash
# Set longer timeout
export DOCKER_CLIENT_TIMEOUT=600
export COMPOSE_HTTP_TIMEOUT=600

# Retry push
docker push registry.digitalocean.com/progrc/progrc-backend:latest
```

## 🔍 Why This Happens

- Port 3128 is a common HTTP proxy port
- Docker is trying to use a proxy that's not responding
- Network interruption during large file transfer
- Proxy timeout during push

## 📋 After Successful Push

Once push succeeds, continue deployment:

```bash
# Restart Kubernetes deployment
kubectl rollout restart deployment/progrc-backend -n progrc-dev

# Wait for rollout
kubectl rollout status deployment/progrc-backend -n progrc-dev --timeout=5m

# Verify pods
kubectl get pods -n progrc-dev -l app=progrc-backend

# Check logs
kubectl logs -n progrc-dev -l app=progrc-backend --tail=100 | grep "INSTANT SCORING"
```

## 🆘 If Still Failing

See `FIX_PUSH_ERROR.md` for more detailed solutions, including:
- Configuring Docker to skip proxy for registries
- Using different network
- Alternative push methods
- Debugging commands

## Summary

**Quick fix**: Disable proxy temporarily and retry push
**Best fix**: Configure Docker Desktop to skip proxy for DigitalOcean registry


