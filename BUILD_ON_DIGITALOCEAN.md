# Build on DigitalOcean - Bypass Local Docker Push

## 🎯 Goal

Bypass local Docker push issues by building the Docker image directly on DigitalOcean infrastructure.

## 📋 Options

### Option 1: Build on DigitalOcean Droplet (Recommended)

This is the simplest and most reliable approach:

```bash
# 1. SSH into a DigitalOcean Droplet (or create one)
# 2. Clone/pull your code
# 3. Build and push from there (better network connection)
```

**Steps:**
1. **Create or use existing Droplet**:
   ```bash
   doctl compute droplet create build-server \
     --size s-2vcpu-4gb \
     --image ubuntu-22-04-x64 \
     --region nyc1 \
     --ssh-keys YOUR_SSH_KEY_ID
   ```

2. **SSH into Droplet**:
   ```bash
   ssh root@<droplet-ip>
   ```

3. **Install Docker**:
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   ```

4. **Install doctl** (if not installed):
   ```bash
   cd ~
   wget https://github.com/digitalocean/doctl/releases/download/v1.104.0/doctl-1.104.0-linux-amd64.tar.gz
   tar xf doctl-1.104.0-linux-amd64.tar.gz
   sudo mv doctl /usr/local/bin
   doctl auth init  # Use your API token
   ```

5. **Clone your code**:
   ```bash
   # Option A: If code is in git
   git clone <your-repo-url>
   cd <repo-name>
   
   # Option B: Transfer files via SCP from local
   # From your local machine:
   # scp -r /Users/corneliushatchett/Downloads/PRO\ GRC/bff-service-backend-dev root@<droplet-ip>:/root/
   ```

6. **Build and push from Droplet**:
   ```bash
   cd bff-service-backend-dev
   doctl registry login
   docker build --platform linux/amd64 \
     -t registry.digitalocean.com/progrc/progrc-backend:latest \
     -f Dockerfile .
   docker push registry.digitalocean.com/progrc/progrc-backend:latest
   ```

7. **Restart Kubernetes deployment**:
   ```bash
   # From your local machine or from Droplet if kubectl is configured
   kubectl rollout restart deployment/progrc-backend -n progrc-dev
   kubectl rollout status deployment/progrc-backend -n progrc-dev --timeout=5m
   ```

### Option 2: Use Kaniko Build Pod (Kubernetes)

Build directly in Kubernetes using Kaniko (no Docker daemon needed):

```bash
# 1. Create build job YAML (already created: k8s/jobs/build-on-digitalocean.yaml)
# 2. Apply the job
kubectl apply -f k8s/jobs/build-on-digitalocean.yaml

# 3. Watch the build
kubectl logs -f job/build-progrc-backend -n progrc-dev

# 4. Restart deployment after successful build
kubectl rollout restart deployment/progrc-backend -n progrc-dev
```

**Note**: This requires setting up source code in ConfigMap or mounting from a volume.

### Option 3: Use DigitalOcean App Platform Build Feature

If you're using DigitalOcean App Platform:

1. **Connect GitHub/GitLab repository**
2. **Configure build settings**:
   ```yaml
   build_command: npm run build
   dockerfile_path: Dockerfile
   ```
3. **Deploy** - App Platform will build and push automatically

### Option 4: Build in Kubernetes Pod with Docker-in-Docker

Use the automated script I created:

```bash
cd /Users/corneliushatchett/Downloads/PRO\ GRC/bff-service-backend-dev
bash deploy-to-digitalocean-direct.sh
```

This script:
- Creates a pod with Docker-in-Docker
- Copies source code to the pod
- Builds the image inside the pod
- Pushes from the pod (better network)
- Cleans up automatically

## 🚀 Recommended: Quick Deploy Script

I've created a script that builds directly on DigitalOcean. Run:

```bash
cd /Users/corneliushatchett/Downloads/PRO\ GRC/bff-service-backend-dev
bash deploy-to-digitalocean-direct.sh
```

## 📝 Manual Steps (Simplest)

If scripts don't work, here's the simplest manual approach:

### 1. Transfer Code to DigitalOcean Droplet

```bash
# From your local machine
cd /Users/corneliushatchett/Downloads/PRO\ GRC/bff-service-backend-dev

# Create a tarball (exclude large files)
tar -czf /tmp/progrc-source.tar.gz \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='dist' \
  --exclude='*.log' \
  .

# Transfer to Droplet
scp /tmp/progrc-source.tar.gz root@<droplet-ip>:/root/
```

### 2. Build on Droplet

```bash
# SSH into Droplet
ssh root@<droplet-ip>

# Extract code
cd /root
tar -xzf progrc-source.tar.gz
cd bff-service-backend-dev

# Install Docker (if not installed)
curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh

# Login to registry
doctl registry login
# OR
docker login registry.digitalocean.com

# Build image
docker build --platform linux/amd64 \
  -t registry.digitalocean.com/progrc/progrc-backend:latest \
  -f Dockerfile .

# Push image (this should work better from DO infrastructure)
docker push registry.digitalocean.com/progrc/progrc-backend:latest
```

### 3. Restart Deployment

```bash
# From your local machine
kubectl rollout restart deployment/progrc-backend -n progrc-dev
kubectl rollout status deployment/progrc-backend -n progrc-dev --timeout=5m

# Verify
kubectl get pods -n progrc-dev -l app=progrc-backend
kubectl logs -n progrc-dev -l app=progrc-backend --tail=100 | grep "INSTANT SCORING"
```

## 🎯 Why This Works Better

- **No proxy issues**: Building on DigitalOcean infrastructure bypasses local proxy
- **Better network**: Direct connection to DigitalOcean registry
- **Faster uploads**: Same data center = faster transfers
- **More reliable**: No local network interruptions

## 📋 Checklist

- [ ] Code changes verified locally
- [ ] Choose build method (Droplet recommended)
- [ ] Transfer code to build location
- [ ] Build Docker image
- [ ] Push to registry
- [ ] Restart Kubernetes deployment
- [ ] Verify pods are running
- [ ] Test instant scoring functionality

## 🆘 Troubleshooting

### If Droplet Build Fails

```bash
# Check Docker is running
docker ps

# Check registry login
docker login registry.digitalocean.com

# Try build with verbose output
docker build --platform linux/amd64 --progress=plain -t registry.digitalocean.com/progrc/progrc-backend:latest -f Dockerfile .
```

### If Kaniko Build Fails

```bash
# Check job status
kubectl describe job/build-progrc-backend -n progrc-dev

# Check logs
kubectl logs job/build-progrc-backend -n progrc-dev

# Delete and retry
kubectl delete job/build-progrc-backend -n progrc-dev
kubectl apply -f k8s/jobs/build-on-digitalocean.yaml
```

## Summary

**Best Approach**: Build on a DigitalOcean Droplet - it bypasses all local network/proxy issues and has better connectivity to the registry.

**Quick Option**: Use the `deploy-to-digitalocean-direct.sh` script which automates building in a Kubernetes pod.


