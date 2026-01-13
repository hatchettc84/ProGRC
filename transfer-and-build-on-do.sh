#!/bin/bash
# Transfer code to DigitalOcean Droplet and build there
# This bypasses all local Docker push issues

set -e

echo "=========================================="
echo "Transfer & Build on DigitalOcean Droplet"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_info() { echo -e "ℹ️  $1"; }

# Get Droplet IP
echo "Step 1: Getting DigitalOcean Droplet information..."
if command -v doctl &> /dev/null; then
    print_info "Available Droplets:"
    doctl compute droplet list --format ID,Name,PublicIPv4,Status
    
    echo ""
    read -p "Enter Droplet IP address (or press Enter to create new): " DROPLET_IP
    
    if [ -z "$DROPLET_IP" ]; then
        print_info "Creating new Droplet for build..."
        DROPLET_NAME="progrc-build-$(date +%s)"
        print_warning "This will create a new Droplet. Press Ctrl+C to cancel, or Enter to continue..."
        read
        
        # Get SSH key ID
        SSH_KEY_ID=$(doctl compute ssh-key list --format ID,Name | head -2 | tail -1 | awk '{print $1}')
        
        if [ -z "$SSH_KEY_ID" ]; then
            print_error "No SSH keys found. Please add an SSH key to DigitalOcean first."
            exit 1
        fi
        
        print_info "Creating Droplet: $DROPLET_NAME"
        DROPLET_OUTPUT=$(doctl compute droplet create "$DROPLET_NAME" \
            --size s-2vcpu-4gb \
            --image ubuntu-22-04-x64 \
            --region nyc1 \
            --ssh-keys "$SSH_KEY_ID" \
            --wait \
            --format ID,PublicIPv4)
        
        DROPLET_IP=$(echo "$DROPLET_OUTPUT" | tail -1 | awk '{print $2}')
        print_success "Droplet created: $DROPLET_IP"
        
        # Wait for SSH to be ready
        print_info "Waiting for SSH to be ready..."
        sleep 30
    fi
else
    print_warning "doctl not found. Please provide Droplet IP manually:"
    read -p "Droplet IP: " DROPLET_IP
fi

if [ -z "$DROPLET_IP" ]; then
    print_error "Droplet IP is required"
    exit 1
fi

print_success "Using Droplet: $DROPLET_IP"
echo ""

# Step 2: Create code archive
echo "Step 2: Creating code archive..."
TAR_FILE="/tmp/progrc-backend-source-$(date +%s).tar.gz"
cd "$(dirname "$0")"

tar -czf "$TAR_FILE" \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='dist' \
    --exclude='*.log' \
    --exclude='.DS_Store' \
    --exclude='k8s/jobs' \
    --exclude='*.sh' \
    --exclude='*.md' \
    .

if [ -f "$TAR_FILE" ]; then
    FILE_SIZE=$(du -h "$TAR_FILE" | cut -f1)
    print_success "Archive created: $FILE_SIZE"
else
    print_error "Failed to create archive"
    exit 1
fi
echo ""

# Step 3: Transfer to Droplet
echo "Step 3: Transferring code to Droplet..."
print_info "This may take a few minutes depending on file size..."
if scp "$TAR_FILE" root@"$DROPLET_IP":/root/progrc-source.tar.gz; then
    print_success "Code transferred successfully"
    rm -f "$TAR_FILE"  # Clean up local archive
else
    print_error "Failed to transfer code"
    exit 1
fi
echo ""

# Step 4: Build on Droplet
echo "Step 4: Building on Droplet..."
print_info "SSHing into Droplet and building..."
print_warning "This will take 10-20 minutes..."

ssh root@"$DROPLET_IP" << 'ENDSSH'
set -e

echo "Extracting code..."
cd /root
rm -rf bff-service-backend-dev
tar -xzf progrc-source.tar.gz
cd bff-service-backend-dev

echo "Installing Docker..."
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
fi

echo "Installing doctl..."
if ! command -v doctl &> /dev/null; then
    cd /tmp
    wget -q https://github.com/digitalocean/doctl/releases/latest/download/doctl-1.104.0-linux-amd64.tar.gz
    tar xf doctl-1.104.0-linux-amd64.tar.gz
    mv doctl /usr/local/bin/
fi

echo "Authenticating with DigitalOcean..."
if [ ! -f ~/.config/doctl/config.yaml ]; then
    echo "Please run: doctl auth init"
    echo "Or provide API token manually for registry login"
fi

echo "Logging into registry..."
doctl registry login || {
    echo "doctl login failed, trying docker login..."
    echo "You may need to login manually: docker login registry.digitalocean.com"
}

echo "Building Docker image..."
cd /root/bff-service-backend-dev
docker build --platform linux/amd64 \
  -t registry.digitalocean.com/progrc/progrc-backend:latest \
  -f Dockerfile .

echo "Pushing image to registry..."
docker push registry.digitalocean.com/progrc/progrc-backend:latest

echo "Build and push complete!"
ENDSSH

if [ $? -eq 0 ]; then
    print_success "Build completed on Droplet!"
else
    print_error "Build failed on Droplet. Check SSH connection and try again."
    exit 1
fi
echo ""

# Step 5: Restart deployment
echo "Step 5: Restarting Kubernetes deployment..."
if kubectl rollout restart deployment/progrc-backend -n progrc-dev; then
    print_success "Deployment restarted"
else
    print_error "Failed to restart deployment"
    exit 1
fi

echo ""
print_info "Waiting for rollout to complete (this may take 2-5 minutes)..."
if kubectl rollout status deployment/progrc-backend -n progrc-dev --timeout=5m; then
    print_success "Rollout completed successfully"
else
    print_warning "Rollout status check failed or timed out"
fi
echo ""

# Step 6: Verify
echo "Step 6: Verifying deployment..."
PODS=$(kubectl get pods -n progrc-dev -l app=progrc-backend --no-headers 2>/dev/null | head -3)
if [ -n "$PODS" ]; then
    print_success "Pods status:"
    echo "$PODS"
else
    print_warning "Could not get pod status"
fi
echo ""

print_success "=========================================="
print_success "✅ Deployment Complete!"
print_success "=========================================="
echo ""
echo "📋 Summary:"
echo "  • Code transferred to DigitalOcean Droplet"
echo "  • Docker image built on Droplet"
echo "  • Image pushed to registry"
echo "  • Kubernetes deployment restarted"
echo ""
echo "🧪 Testing:"
echo "  • Check logs: kubectl logs -n progrc-dev -l app=progrc-backend --tail=100 | grep 'INSTANT SCORING'"
echo "  • Start a compliance assessment to see instant scores"
echo ""
echo "🧹 Cleanup (optional):"
echo "  • Delete build Droplet: doctl compute droplet delete <droplet-id>"
echo ""


