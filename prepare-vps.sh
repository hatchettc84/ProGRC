#!/bin/bash

# VPS Preparation Script
# This script prepares the VPS for ProGRC deployment

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "=========================================="
echo "VPS Preparation Script"
echo "=========================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}❌ Please run as root${NC}"
    echo "Usage: sudo $0"
    exit 1
fi

# Step 1: Update System
echo -e "${BLUE}Step 1: Updating system...${NC}"
apt update && apt upgrade -y
echo -e "${GREEN}✓ System updated${NC}"
echo ""

# Step 2: Install Docker
echo -e "${BLUE}Step 2: Installing Docker...${NC}"
if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    echo -e "  ${YELLOW}⚠️  Docker already installed: $DOCKER_VERSION${NC}"
else
    echo "  Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    echo -e "  ${GREEN}✓ Docker installed${NC}"
fi

# Verify Docker
docker --version
echo ""

# Step 3: Install Docker Compose
echo -e "${BLUE}Step 3: Installing Docker Compose...${NC}"
if command -v docker-compose &> /dev/null; then
    COMPOSE_VERSION=$(docker-compose --version)
    echo -e "  ${YELLOW}⚠️  Docker Compose already installed: $COMPOSE_VERSION${NC}"
else
    echo "  Installing Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    echo -e "  ${GREEN}✓ Docker Compose installed${NC}"
fi

# Verify Docker Compose
docker-compose --version
echo ""

# Step 4: Install Node.js
echo -e "${BLUE}Step 4: Installing Node.js...${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "  ${YELLOW}⚠️  Node.js already installed: $NODE_VERSION${NC}"
else
    echo "  Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
    echo -e "  ${GREEN}✓ Node.js installed${NC}"
fi

# Verify Node.js
node --version
npm --version
echo ""

# Step 5: Install Nginx
echo -e "${BLUE}Step 5: Installing Nginx...${NC}"
if command -v nginx &> /dev/null; then
    NGINX_VERSION=$(nginx -v 2>&1 | cut -d'/' -f2)
    echo -e "  ${YELLOW}⚠️  Nginx already installed: $NGINX_VERSION${NC}"
else
    echo "  Installing Nginx..."
    apt install nginx certbot python3-certbot-nginx -y
    echo -e "  ${GREEN}✓ Nginx installed${NC}"
fi

# Verify Nginx
nginx -v
echo ""

# Step 6: Create Directory Structure
echo -e "${BLUE}Step 6: Creating directory structure...${NC}"
mkdir -p /opt/progrc
mkdir -p /opt/progrc/backups
echo -e "${GREEN}✓ Directories created${NC}"
echo "  /opt/progrc"
echo "  /opt/progrc/backups"
echo ""

# Step 7: Summary
echo "=========================================="
echo -e "${GREEN}VPS Preparation Complete!${NC}"
echo "=========================================="
echo ""
echo "Installed Components:"
echo "  ✓ Docker: $(docker --version)"
echo "  ✓ Docker Compose: $(docker-compose --version)"
echo "  ✓ Node.js: $(node --version)"
echo "  ✓ NPM: $(npm --version)"
echo "  ✓ Nginx: $(nginx -v 2>&1 | cut -d'/' -f2)"
echo ""
echo "Directories Created:"
echo "  ✓ /opt/progrc"
echo "  ✓ /opt/progrc/backups"
echo ""
echo "Next Steps:"
echo "1. Clone repository:"
echo "   cd /opt/progrc"
echo "   git clone https://github.com/hatchettc84/ProGRC.git bff-service-backend-dev"
echo ""
echo "2. Or transfer files via rsync from local machine"
echo ""
echo "3. Continue with migration (see MIGRATE_TO_VPS_GUIDE.md)"
echo ""
