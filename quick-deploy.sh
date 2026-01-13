#!/bin/bash

# Quick Deploy Script for ProGRC to VPS
# Run this from your local machine

VPS_IP="168.231.70.205"
VPS_USER="root"
LOCAL_DIR="/Users/corneliushatchett/Downloads/PRO GRC/bff-service-backend-dev"
REMOTE_DIR="/opt/progrc/bff-service-backend-dev"

echo "=========================================="
echo "ProGRC Quick Deploy to VPS"
echo "=========================================="
echo ""
echo "This script will:"
echo "1. Transfer codebase to VPS"
echo "2. Set up Docker (if needed)"
echo "3. Configure and start services"
echo ""
read -p "Press Enter to continue or Ctrl+C to cancel..."

# Step 1: Fix SSH host key
echo ""
echo "Step 1: Fixing SSH host key..."
ssh-keygen -R $VPS_IP 2>/dev/null || true
echo "✓ Done"

# Step 2: Transfer codebase
echo ""
echo "Step 2: Transferring codebase..."
echo "You'll be prompted for the VPS password..."
rsync -avz --progress \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude 'dist' \
    --exclude 'coverage' \
    --exclude '.env' \
    --exclude '*.log' \
    --exclude '.claude' \
    --exclude '.cursor' \
    "$LOCAL_DIR/" "$VPS_USER@$VPS_IP:$REMOTE_DIR/"

echo "✓ Codebase transferred"

# Step 3: Run setup on VPS
echo ""
echo "Step 3: Running setup on VPS..."
echo "You'll be prompted for the VPS password again..."

ssh $VPS_USER@$VPS_IP << 'ENDSSH'
set -e

cd /opt/progrc/bff-service-backend-dev

# Install Docker if needed
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
fi

# Install Docker Compose if needed
if ! command -v docker-compose &> /dev/null; then
    echo "Installing Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# Install Node.js if needed (for JWT key generation)
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
fi

# Generate JWT keys if .env doesn't exist
if [ ! -f .env ]; then
    echo "Generating JWT keys..."
    if [ -f scripts/generate-jwt-keys.js ]; then
        node scripts/generate-jwt-keys.js || echo "JWT keys may already exist"
    fi
    cp env.sample .env
    echo ""
    echo "⚠ IMPORTANT: Please edit .env file with:"
    echo "  nano .env"
    echo ""
    echo "Key settings to update:"
    echo "  - POSTGRES_PASSWORD (change from default)"
    echo "  - USE_OLLAMA=true"
    echo "  - OLLAMA_BASE_URL=http://168.231.70.205:11434"
    echo "  - OLLAMA_MODEL=llama3.2"
    echo ""
    read -p "Press Enter after you've configured .env file..."
fi

# Update docker-compose.yml with matching password
echo "Updating docker-compose.yml..."
POSTGRES_PASSWORD=$(grep POSTGRES_PASSWORD .env | cut -d '=' -f2)
if [ ! -z "$POSTGRES_PASSWORD" ]; then
    sed -i "s/POSTGRES_PASSWORD:.*/POSTGRES_PASSWORD: $POSTGRES_PASSWORD/" docker-compose.yml || true
fi

# Build and start
echo "Building Docker images (this takes 10-15 minutes)..."
docker-compose build

echo "Starting services..."
docker-compose up -d

echo "Waiting for services to start..."
sleep 30

echo "Checking service status..."
docker-compose ps

echo ""
echo "=========================================="
echo "Deployment Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Check logs: docker-compose logs -f app"
echo "2. Test health: curl http://localhost:3000/api/v1/health"
echo "3. Verify Ollama: docker-compose logs app | grep -i ollama"
echo ""

ENDSSH

echo ""
echo "=========================================="
echo "Deployment script completed!"
echo "=========================================="
echo ""
echo "To check status, SSH into VPS:"
echo "  ssh $VPS_USER@$VPS_IP"
echo "  cd $REMOTE_DIR"
echo "  docker-compose ps"
echo "  docker-compose logs -f app"

