# Fix Docker Push "Broken Pipe" Error

## Error Analysis

The error `write: broken pipe` on port `3128` indicates a **proxy connection issue** during Docker image push.

**Error**: `192.168.65.3:59328->192.168.65.1:3128: write: broken pipe`

Port 3128 is commonly used for HTTP proxies. This suggests:
1. Docker is trying to use a proxy that's not responding
2. Proxy connection is unstable/timing out
3. Network interruption during large file transfer

## Solutions

### Solution 1: Retry the Push (Simplest)

Sometimes the push fails due to temporary network issues. Simply retry:

```bash
docker push registry.digitalocean.com/progrc/progrc-backend:latest
```

**If it fails again, try the solutions below.**

### Solution 2: Disable Proxy for Docker (Recommended)

If you're using a proxy but don't need it for DigitalOcean registry:

```bash
# Check current proxy settings
echo $HTTP_PROXY
echo $HTTPS_PROXY
echo $http_proxy
echo $https_proxy

# Temporarily disable proxy for this session
unset HTTP_PROXY
unset HTTPS_PROXY
unset http_proxy
unset https_proxy

# Retry push
docker push registry.digitalocean.com/progrc/progrc-backend:latest
```

### Solution 3: Configure Docker to Skip Proxy for Registry

Configure Docker to bypass proxy for DigitalOcean registry:

```bash
# Create/edit Docker daemon configuration
sudo mkdir -p /etc/docker
sudo nano /etc/docker/daemon.json
```

Add this configuration:

```json
{
  "proxies": {
    "no-proxy": ["registry.digitalocean.com", "*.digitalocean.com"]
  }
}
```

Then restart Docker:
```bash
sudo systemctl restart docker
# OR on macOS
killall Docker && open -a Docker
```

### Solution 4: Increase Docker Push Timeout

The push might be timing out. Increase timeout:

```bash
# Set longer timeout
export DOCKER_CLIENT_TIMEOUT=300
export COMPOSE_HTTP_TIMEOUT=300

# Retry push
docker push registry.digitalocean.com/progrc/progrc-backend:latest
```

### Solution 5: Use Smaller Chunks / Compress Less

If the image is very large, try building with less compression:

```bash
# Rebuild with less compression
docker build --platform linux/amd64 \
  --compress=false \
  -t registry.digitalocean.com/progrc/progrc-backend:latest \
  -f Dockerfile .

# Retry push
docker push registry.digitalocean.com/progrc/progrc-backend:latest
```

### Solution 6: Check Docker Desktop Proxy Settings (macOS)

If using Docker Desktop on macOS:

1. Open Docker Desktop
2. Go to Settings → Resources → Proxies
3. Check if proxy is configured
4. Either:
   - Remove proxy settings if not needed
   - OR add `registry.digitalocean.com` to "No proxy" list
5. Apply & Restart

### Solution 7: Use Different Network

Try pushing from a different network:

```bash
# Check current network
ifconfig | grep "inet "

# If on VPN, try disconnecting temporarily
# If on corporate network, try mobile hotspot
# Then retry push
docker push registry.digitalocean.com/progrc/progrc-backend:latest
```

### Solution 8: Push with Resume Capability

If push keeps failing, use experimental features:

```bash
# Enable experimental features (if not already)
export DOCKER_CLI_EXPERIMENTAL=enabled

# Use buildx with cache
docker buildx build --platform linux/amd64 \
  --push \
  --cache-from registry.digitalocean.com/progrc/progrc-backend:latest \
  -t registry.digitalocean.com/progrc/progrc-backend:latest \
  -f Dockerfile .
```

### Solution 9: Manual Image Save/Load (If Push Keeps Failing)

As a last resort, save image and upload manually:

```bash
# Save image to file
docker save registry.digitalocean.com/progrc/progrc-backend:latest \
  | gzip > progrc-backend-image.tar.gz

# Then upload to a server with better connection
# On that server:
# gunzip -c progrc-backend-image.tar.gz | docker load
# docker push registry.digitalocean.com/progrc/progrc-backend:latest
```

## Recommended Quick Fix

**Try this first** (in order):

1. **Retry the push**:
   ```bash
   docker push registry.digitalocean.com/progrc/progrc-backend:latest
   ```

2. **Disable proxy temporarily**:
   ```bash
   unset HTTP_PROXY HTTPS_PROXY http_proxy https_proxy
   docker push registry.digitalocean.com/progrc/progrc-backend:latest
   ```

3. **Check Docker Desktop proxy settings** (if on macOS):
   - Open Docker Desktop → Settings → Resources → Proxies
   - Add `registry.digitalocean.com` to "No proxy" list
   - Apply & Restart Docker

4. **Increase timeout and retry**:
   ```bash
   export DOCKER_CLIENT_TIMEOUT=600
   docker push registry.digitalocean.com/progrc/progrc-backend:latest
   ```

## After Successful Push

Once the push succeeds, continue with deployment:

```bash
# Restart Kubernetes deployment
kubectl rollout restart deployment/progrc-backend -n progrc-dev

# Wait for rollout
kubectl rollout status deployment/progrc-backend -n progrc-dev --timeout=5m

# Verify
kubectl get pods -n progrc-dev -l app=progrc-backend
```

## Prevention for Future

To avoid this issue in the future:

1. **Configure Docker to skip proxy for registries**:
   ```bash
   # Add to ~/.docker/config.json or Docker Desktop settings
   {
     "proxies": {
       "no-proxy": "registry.digitalocean.com,*.digitalocean.com"
     }
   }
   ```

2. **Use stable network connection** for large pushes

3. **Consider using CI/CD** for automated deployments (avoids local network issues)

## Debugging Commands

If none of the above works, gather more info:

```bash
# Check Docker daemon logs
# macOS:
tail -f ~/Library/Containers/com.docker.docker/Data/log/host/Docker.log

# Linux:
sudo journalctl -u docker.service -f

# Check network connectivity to registry
curl -I https://registry.digitalocean.com/v2/

# Check if proxy is interfering
curl -v --proxy http://192.168.65.1:3128 https://registry.digitalocean.com/v2/ 2>&1 | head -20
```

## Summary

The "broken pipe" error is usually caused by:
- **Proxy timeout/interruption** (most common)
- **Network instability**
- **Large image size causing timeout**

**Quick fix**: Disable proxy temporarily and retry the push.


