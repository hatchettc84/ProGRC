# CSP eval() Error Fix for Emulate Button

## Problem
The emulate button (and potentially TinyMCE editor) is failing with:
```
Content Security Policy of your site blocks the use of 'eval' in JavaScript
```

## Root Cause
TinyMCE (used in the DisplayOrgView component) requires `eval()` for some of its functionality, especially in its iframe-based editing mode. The CSP must include `unsafe-eval` in the `script-src` directive.

## Solution

### ✅ Configuration Already Correct
The `nginx.conf` file already includes `unsafe-eval` in the CSP header:

```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' 'unsafe-hashes' https://www.clarity.ms data: blob: *; ..." always;
```

**Location**: `/Users/corneliushatchett/Downloads/PRO GRC/frontend-app-main/nginx.conf`
- Line 21: Main CSP header
- Line 41: CSP for static assets
- Line 50: CSP for HTML pages

### ⚠️ Issue: Frontend Docker Image Not Rebuilt
The frontend Docker image needs to be rebuilt with the updated `nginx.conf` that includes `unsafe-eval`.

## Fix Steps

### Step 1: Rebuild Frontend Docker Image

Navigate to the frontend directory and rebuild:

```bash
cd /Users/corneliushatchett/Downloads/PRO\ GRC/frontend-app-main

# Build frontend
npm ci
npm run build

# Build Docker image
docker build \
  --platform linux/amd64 \
  -f Dockerfile \
  -t registry.digitalocean.com/progrc/progrc-frontend:latest \
  .
```

### Step 2: Push Image to DigitalOcean Container Registry

```bash
# Login to registry (if not already logged in)
doctl registry login
# OR
docker login registry.digitalocean.com

# Push image
docker push registry.digitalocean.com/progrc/progrc-frontend:latest
```

### Step 3: Restart Frontend Deployment

```bash
kubectl rollout restart deployment/progrc-frontend -n progrc-dev
kubectl rollout status deployment/progrc-frontend -n progrc-dev --timeout=180s
```

### Step 4: Verify Deployment

```bash
# Check pod status
kubectl get pods -n progrc-dev -l app=progrc-frontend

# Check logs
kubectl logs -n progrc-dev deployment/progrc-frontend --tail=100

# Verify CSP header in browser
# 1. Access the frontend URL
# 2. Open browser DevTools (F12)
# 3. Go to Network tab
# 4. Reload the page
# 5. Check Response Headers for 'Content-Security-Policy'
# 6. Verify it includes 'unsafe-eval' in script-src
```

## Alternative: Automated Script

A rebuild script has been created at:
`/Users/corneliushatchett/Downloads/PRO GRC/frontend-app-main/rebuild-frontend.sh`

To use it:
```bash
cd /Users/corneliushatchett/Downloads/PRO\ GRC/frontend-app-main
chmod +x rebuild-frontend.sh
./rebuild-frontend.sh
```

## Verification

After deployment, verify the CSP header includes `unsafe-eval`:

1. **Browser DevTools**:
   - Open DevTools (F12)
   - Go to Network tab
   - Reload the page
   - Check Response Headers for `Content-Security-Policy`
   - Verify it includes: `script-src ... 'unsafe-eval' ...`

2. **Console**:
   - Open browser Console (F12)
   - Click "Emulate" button
   - Verify no CSP errors about `eval()` blocking

3. **TinyMCE Editor**:
   - Navigate to a page with TinyMCE editor (e.g., Organization Notes)
   - Verify the editor loads without CSP errors

## Current CSP Configuration

The CSP in `nginx.conf` is:
```
default-src 'self'; 
script-src 'self' 'unsafe-inline' 'unsafe-eval' 'unsafe-hashes' https://www.clarity.ms data: blob: *; 
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com data: blob: *; 
font-src 'self' https://fonts.gstatic.com data: blob: *; 
img-src 'self' data: https: blob: *; 
connect-src 'self' http://143.244.221.38 https://www.clarity.ms https://o4508489105408000.ingest.us.sentry.io ws: wss: blob: data: *; 
frame-ancestors 'self'; 
base-uri 'self'; 
form-action 'self';
```

**Note**: `unsafe-eval` is included in `script-src` which is correct.

## Files Modified

1. ✅ `frontend-app-main/nginx.conf` - Already has `unsafe-eval` in CSP
2. ✅ `frontend-app-main/src/components/TinyEditor/TinyEditor.tsx` - Removed invalid `content_security_policy` option

## Status

✅ **Configuration**: Correct - `unsafe-eval` is in nginx.conf  
⏳ **Deployment**: Pending - Frontend Docker image needs to be rebuilt

## Next Steps

1. Rebuild frontend Docker image with updated nginx.conf
2. Push image to DigitalOcean Container Registry
3. Restart frontend deployment
4. Verify CSP header includes `unsafe-eval`
5. Test emulate button and TinyMCE editor

## Quick Command Summary

```bash
# Navigate to frontend directory
cd /Users/corneliushatchett/Downloads/PRO\ GRC/frontend-app-main

# Build frontend
npm ci && npm run build

# Build and push Docker image
docker build --platform linux/amd64 -f Dockerfile -t registry.digitalocean.com/progrc/progrc-frontend:latest .
docker push registry.digitalocean.com/progrc/progrc-frontend:latest

# Restart deployment
kubectl rollout restart deployment/progrc-frontend -n progrc-dev
kubectl rollout status deployment/progrc-frontend -n progrc-dev --timeout=180s
```


