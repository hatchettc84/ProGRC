#!/bin/bash

# ProGRC VPS Deployment Script
# This script deploys the ProGRC platform to VPS at 168.231.70.205

set -e

VPS_IP="168.231.70.205"
VPS_USER="root"
VPS_PATH="/opt/progrc"
LOCAL_PATH="/Users/corneliushatchett/Downloads/PRO GRC/bff-service-backend-dev"

echo "=========================================="
echo "ProGRC VPS Deployment Script"
echo "=========================================="
echo "VPS: $VPS_USER@$VPS_IP"
echo "Target Path: $VPS_PATH"
echo ""

# Step 1: Check SSH connectivity
echo "Step 1: Checking SSH connectivity..."
if ssh -o ConnectTimeout=5 -o BatchMode=yes $VPS_USER@$VPS_IP "echo 'Connection successful'" 2>/dev/null; then
    echo "✓ SSH connection successful"
else
    echo "⚠ SSH connection requires password or key setup"
    echo "Please ensure you can SSH manually: ssh $VPS_USER@$VPS_IP"
    read -p "Press Enter to continue after verifying SSH access..."
fi

# Step 2: Create directory structure on VPS
echo ""
echo "Step 2: Creating directory structure on VPS..."
ssh $VPS_USER@$VPS_IP "mkdir -p $VPS_PATH && mkdir -p $VPS_PATH/backups"
echo "✓ Directories created"

# Step 3: Transfer codebase
echo ""
echo "Step 3: Transferring codebase to VPS..."
echo "This may take a few minutes..."

# Exclude unnecessary files
rsync -avz --progress \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude 'dist' \
    --exclude 'coverage' \
    --exclude '.env' \
    --exclude '*.log' \
    --exclude '.claude' \
    --exclude '.cursor' \
    "$LOCAL_PATH/" "$VPS_USER@$VPS_IP:$VPS_PATH/bff-service-backend-dev/"

echo "✓ Codebase transferred"

# Step 4: Check Docker installation
echo ""
echo "Step 4: Checking Docker installation on VPS..."
if ssh $VPS_USER@$VPS_IP "command -v docker &> /dev/null"; then
    echo "✓ Docker is installed"
    ssh $VPS_USER@$VPS_IP "docker --version"
else
    echo "⚠ Docker not found. Installing Docker..."
    ssh $VPS_USER@$VPS_IP "curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh"
    echo "✓ Docker installed"
fi

# Step 5: Check Docker Compose
echo ""
echo "Step 5: Checking Docker Compose..."
if ssh $VPS_USER@$VPS_IP "command -v docker-compose &> /dev/null"; then
    echo "✓ Docker Compose is installed"
    ssh $VPS_USER@$VPS_IP "docker-compose --version"
else
    echo "⚠ Docker Compose not found. Installing..."
    ssh $VPS_USER@$VPS_IP "curl -L \"https://github.com/docker/compose/releases/latest/download/docker-compose-\$(uname -s)-\$(uname -m)\" -o /usr/local/bin/docker-compose && chmod +x /usr/local/bin/docker-compose"
    echo "✓ Docker Compose installed"
fi

# Step 6: Generate JWT keys on VPS
echo ""
echo "Step 6: Generating JWT keys on VPS..."
ssh $VPS_USER@$VPS_IP "cd $VPS_PATH/bff-service-backend-dev && if [ ! -f scripts/generate-jwt-keys.js ]; then echo 'JWT key generation script not found'; else node scripts/generate-jwt-keys.js 2>/dev/null || echo 'JWT keys may already exist'; fi"

# Step 7: Create .env file template
echo ""
echo "Step 7: Setting up environment configuration..."
echo "⚠ IMPORTANT: You'll need to manually configure the .env file on the VPS"
echo "Location: $VPS_PATH/bff-service-backend-dev/.env"

# Step 8: Build and start services
echo ""
echo "Step 8: Building Docker images..."
echo "This will take 10-15 minutes on first build..."
ssh $VPS_USER@$VPS_IP "cd $VPS_PATH/bff-service-backend-dev && docker-compose build"

echo ""
echo "Step 9: Starting services..."
ssh $VPS_USER@$VPS_IP "cd $VPS_PATH/bff-service-backend-dev && docker-compose up -d"

# Step 10: Wait for services to be healthy
echo ""
echo "Step 10: Waiting for services to start..."
sleep 30

# Step 11: Check service status
echo ""
echo "Step 11: Checking service status..."
ssh $VPS_USER@$VPS_IP "cd $VPS_PATH/bff-service-backend-dev && docker-compose ps"

# Step 12: Run migrations
echo ""
echo "Step 12: Running database migrations..."
ssh $VPS_USER@$VPS_IP "cd $VPS_PATH/bff-service-backend-dev && docker-compose exec -T app npm run migration:up || echo 'Migrations may have run automatically'"

echo ""
echo "=========================================="
echo "Deployment Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. SSH into VPS: ssh $VPS_USER@$VPS_IP"
echo "2. Configure .env file: nano $VPS_PATH/bff-service-backend-dev/.env"
echo "3. Set USE_OLLAMA=true and OLLAMA_BASE_URL=http://168.231.70.205:11434"
echo "4. Restart services: cd $VPS_PATH/bff-service-backend-dev && docker-compose restart"
echo "5. Check logs: docker-compose logs -f app"
echo ""
echo "Health check: curl http://$VPS_IP:3001/api/v1/health"

