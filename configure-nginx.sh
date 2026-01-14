#!/bin/bash

# Nginx Configuration Script
# This script configures Nginx as a reverse proxy for ProGRC

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

VPS_IP=${VPS_IP:-"168.231.70.205"}

echo "=========================================="
echo "Nginx Configuration for ProGRC"
echo "=========================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}❌ Please run as root${NC}"
    echo "Usage: sudo $0"
    exit 1
fi

# Check if Nginx is installed
if ! command -v nginx &> /dev/null; then
    echo -e "${RED}❌ Nginx is not installed${NC}"
    echo "Please install Nginx first: apt install nginx"
    exit 1
fi

echo -e "${BLUE}Step 1: Creating Nginx configuration...${NC}"

# Create Nginx configuration
cat > /etc/nginx/sites-available/progrc << EOF
# ProGRC Nginx Configuration
# VPS IP: ${VPS_IP}

# Upstream backend
upstream progrc_backend {
    server localhost:3001;
    keepalive 32;
}

# HTTP Server (redirects to HTTPS after SSL setup)
server {
    listen 80;
    server_name ${VPS_IP};

    # Allow large file uploads
    client_max_body_size 100M;
    client_body_timeout 300s;
    proxy_read_timeout 300s;
    proxy_connect_timeout 300s;
    proxy_send_timeout 300s;

    # Backend API
    location /api/ {
        proxy_pass http://progrc_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_buffering off;
    }

    # Frontend (SPA)
    location / {
        proxy_pass http://progrc_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_buffering off;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

echo -e "${GREEN}✓ Nginx configuration created${NC}"
echo ""

# Enable site
echo -e "${BLUE}Step 2: Enabling Nginx site...${NC}"
if [ -f /etc/nginx/sites-enabled/default ]; then
    rm /etc/nginx/sites-enabled/default
    echo -e "${GREEN}✓ Removed default site${NC}"
fi

if [ -L /etc/nginx/sites-enabled/progrc ]; then
    echo -e "${YELLOW}⚠️  Site already enabled${NC}"
else
    ln -s /etc/nginx/sites-available/progrc /etc/nginx/sites-enabled/progrc
    echo -e "${GREEN}✓ Site enabled${NC}"
fi
echo ""

# Test configuration
echo -e "${BLUE}Step 3: Testing Nginx configuration...${NC}"
if nginx -t; then
    echo -e "${GREEN}✓ Nginx configuration is valid${NC}"
else
    echo -e "${RED}❌ Nginx configuration has errors${NC}"
    exit 1
fi
echo ""

# Reload Nginx
echo -e "${BLUE}Step 4: Reloading Nginx...${NC}"
systemctl reload nginx
echo -e "${GREEN}✓ Nginx reloaded${NC}"
echo ""

# Display summary
echo "=========================================="
echo -e "${GREEN}Nginx Configuration Complete!${NC}"
echo "=========================================="
echo ""
echo "Configuration:"
echo "  ✓ Site: /etc/nginx/sites-available/progrc"
echo "  ✓ Enabled: /etc/nginx/sites-enabled/progrc"
echo "  ✓ Status: Active and running"
echo ""
echo "Service URLs:"
echo "  ✓ HTTP: http://${VPS_IP}"
echo "  ✓ Backend API: http://${VPS_IP}/api/v1/health"
echo ""
echo "Next Steps:"
echo "1. Test access: curl http://${VPS_IP}/api/v1/health"
echo "2. Setup SSL (optional): certbot --nginx -d ${VPS_IP}"
echo "3. Verify deployment: ./verify-deployment.sh"
echo ""
