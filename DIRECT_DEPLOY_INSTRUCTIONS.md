# Direct Deploy to DigitalOcean - Bypass Local Docker

## ✅ Solution: Build on DigitalOcean Infrastructure

Since local Docker push is failing due to proxy issues, we'll build the Docker image directly on DigitalOcean where there are no proxy problems.

## 🚀 Quick Start (Recommended)

### Option 1: Automated Script

Run this script which handles everything:

```bash
cd /Users/corneliushatchett/Downloads/PRO\ GRC/bff-service-backend-dev
bash transfer-and-build-on-do.sh
```

This script will:
1. ✅ Create code archive (excluding large files)
2. ✅ Transfer to DigitalOcean Droplet (or use existing)
3. ✅ Build Docker image on Droplet
4. ✅ Push to registry (no proxy issues!)
5. ✅ Restart Kubernetes deployment
6. ✅ Verify deployment

### Option 2: Manual Steps

#### 1. Create Code Archive (Local)

```bash
cd /Users/corneliushatchett/Downloads/PRO\ GRC/bff-service-backend-dev

tar -czf /tmp/progrc-backend-source.tar.gz \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='dist' \
  --exclude='*.log' \
  --exclude='.DS_Store' \
  .
```

#### 2. Transfer to Droplet

```bash
# Use existing Droplet or create new one
DROPLET_IP="<your-droplet-ip>"

scp /tmp/progrc-backend-source.tar.gz root@$DROPLET_IP:/root/
```

#### 3. Build on Droplet

```bash
# SSH into Droplet
ssh root@$DROPLET_IP

# Extract and build
cd /root
tar -xzf progrc-backend-source.tar.gz
cd bff-service-backend-dev

# Install Docker (if needed)
curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh

# Install doctl (if needed)
wget https://github.com/digitalocean/doctl/releases/latest/download/doctl-1.104.0-linux-amd64.tar.gz
tar xf doctl-*.tar.gz && mv doctl /usr/local/bin/

# Authenticate
doctl auth init  # Enter your API token

# Login to registry
doctl registry login

# Build image
docker build --platform linux/amd64 \
  -t registry.digitalocean.com/progrc/progrc-backend:latest \
  -f Dockerfile .

# Push image (this works perfectly from DO infrastructure!)
docker push registry.digitalocean.com/progrc/progrc-backend:latest

exit
```

#### 4. Restart Deployment (Local)

```bash
# Restart Kubernetes deployment
kubectl rollout restart deployment/progrc-backend -n progrc-dev

# Wait for rollout
kubectl rollout status deployment/progrc-backend -n progrc-dev --timeout=5m

# Verify
kubectl get pods -n progrc-dev -l app=progrc-backend
kubectl logs -n progrc-dev -l app=progrc-backend --tail=100 | grep "INSTANT SCORING"
```

## 🎯 Why This Works

- ✅ **No Proxy Issues**: Building on DigitalOcean infrastructure
- ✅ **Better Network**: Direct connection to DigitalOcean registry  
- ✅ **Faster**: Same data center = much faster uploads
- ✅ **More Reliable**: No local network interruptions

## 📋 Prerequisites

- DigitalOcean Droplet (or create one with the script)
- SSH access to Droplet
- `doctl` installed and authenticated (on Droplet)
- `kubectl` configured (on local machine)

## 🔍 Find Existing Droplet

```bash
# List all Droplets
doctl compute droplet list

# Use any Droplet's Public IPv4 address
```

## 📝 What Gets Deployed

All compliance scoring optimizations:
- ✅ Instant scoring method (`calculateInstantScores`)
- ✅ Optimized LLM processing (batch size 20, parallelism 24)
- ✅ New instant scoring endpoint
- ✅ Enhanced sync endpoints with instant scoring

## ✅ Verification After Deployment

```bash
# Check pods
kubectl get pods -n progrc-dev -l app=progrc-backend

# Check logs
kubectl logs -n progrc-dev -l app=progrc-backend --tail=100

# Test instant scoring (when you start a compliance assessment)
kubectl logs -n progrc-dev -l app=progrc-backend -f | grep "INSTANT SCORING"
```

## 🧹 Cleanup

If you created a temporary Droplet for building:

```bash
# List Droplets
doctl compute droplet list

# Delete build Droplet (optional)
doctl compute droplet delete <droplet-id>
```

## Summary

**Best Solution**: Build Docker image on DigitalOcean Droplet, push to registry, restart Kubernetes deployment.

**Quick Command**: `bash transfer-and-build-on-do.sh`

This completely bypasses all local Docker/proxy issues!


