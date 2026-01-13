# Deploy to DigitalOcean - Bypass Local Docker

## 🎯 Simplest Solution: Build on DigitalOcean Droplet

Build the Docker image directly on DigitalOcean infrastructure to avoid local proxy/network issues.

## 📋 Step-by-Step Instructions

### Step 1: Create/Use a DigitalOcean Droplet

```bash
# Check if you have an existing Droplet you can use
doctl compute droplet list

# If you need to create one (optional):
doctl compute droplet create build-server \
  --size s-2vcpu-4gb \
  --image ubuntu-22-04-x64 \
  --region nyc1 \
  --ssh-keys YOUR_SSH_KEY_ID
```

### Step 2: Prepare Code Archive (Local Machine)

```bash
cd /Users/corneliushatchett/Downloads/PRO\ GRC/bff-service-backend-dev

# Create archive excluding large files
tar -czf /tmp/progrc-backend-source.tar.gz \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='dist' \
  --exclude='*.log' \
  --exclude='.DS_Store' \
  --exclude='*.md' \
  .
```

### Step 3: Transfer to Droplet

```bash
# Get Droplet IP (use existing or from creation above)
DROPLET_IP="<your-droplet-ip>"

# Transfer archive
scp /tmp/progrc-backend-source.tar.gz root@$DROPLET_IP:/root/
```

### Step 4: Build on Droplet (SSH into Droplet)

```bash
# SSH into Droplet
ssh root@$DROPLET_IP

# Extract code
cd /root
tar -xzf progrc-backend-source.tar.gz
cd bff-service-backend-dev

# Install Docker (if not installed)
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install doctl (if not installed)
cd /tmp
wget https://github.com/digitalocean/doctl/releases/latest/download/doctl-1.104.0-linux-amd64.tar.gz
tar xf doctl-1.104.0-linux-amd64.tar.gz
mv doctl /usr/local/bin/

# Authenticate doctl
doctl auth init
# Enter your DigitalOcean API token when prompted

# Login to registry
doctl registry login

# Build Docker image (this will work much better from DO infrastructure)
docker build --platform linux/amd64 \
  -t registry.digitalocean.com/progrc/progrc-backend:latest \
  -f Dockerfile .

# Push image (no proxy issues on DO!)
docker push registry.digitalocean.com/progrc/progrc-backend:latest

# Exit Droplet
exit
```

### Step 5: Restart Deployment (From Local Machine)

```bash
# Restart Kubernetes deployment
kubectl rollout restart deployment/progrc-backend -n progrc-dev

# Wait for rollout
kubectl rollout status deployment/progrc-backend -n progrc-dev --timeout=5m

# Verify
kubectl get pods -n progrc-dev -l app=progrc-backend

# Check logs
kubectl logs -n progrc-dev -l app=progrc-backend --tail=100 | grep "INSTANT SCORING"
```

## 🚀 Quick All-in-One Script

I've created a script that automates most of this. Run from your local machine:

```bash
cd /Users/corneliushatchett/Downloads/PRO\ GRC/bff-service-backend-dev
bash deploy-to-digitalocean-direct.sh
```

**Note**: This script builds in a Kubernetes pod, which also bypasses local Docker issues.

## ✅ Why This Works

- ✅ **No proxy issues**: Building on DigitalOcean infrastructure
- ✅ **Better network**: Direct connection to DigitalOcean registry
- ✅ **Faster uploads**: Same data center = much faster
- ✅ **More reliable**: No local network interruptions

## 📝 Alternative: Use Existing Droplet/Server

If you already have a server on DigitalOcean, you can use that:

```bash
# Just transfer code and build there
scp /tmp/progrc-backend-source.tar.gz user@your-existing-server:/tmp/
# Then SSH and follow build steps above
```

## Summary

**Best Approach**: Build Docker image on a DigitalOcean Droplet, then push to registry and restart Kubernetes deployment. This completely bypasses local Docker/proxy issues.


