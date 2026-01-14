#!/bin/bash

# SSL Setup Script (Optional)
# This script sets up SSL certificate using Let's Encrypt

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "=========================================="
echo "SSL Certificate Setup (Let's Encrypt)"
echo "=========================================="
echo ""
echo -e "${YELLOW}⚠️  Note: SSL requires a domain name${NC}"
echo "If you only have an IP address, SSL cannot be configured."
echo ""

read -p "Do you have a domain name pointing to this VPS? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Skipping SSL setup. You can configure it later with a domain name.${NC}"
    exit 0
fi

read -p "Enter your domain name (e.g., progrc.example.com): " DOMAIN

if [ -z "$DOMAIN" ]; then
    echo -e "${RED}❌ Domain name is required${NC}"
    exit 1
fi

# Check if certbot is installed
if ! command -v certbot &> /dev/null; then
    echo -e "${BLUE}Installing certbot...${NC}"
    apt update
    apt install -y certbot python3-certbot-nginx
    echo -e "${GREEN}✓ Certbot installed${NC}"
fi

# Check if domain resolves to this server
echo -e "${BLUE}Verifying domain DNS...${NC}"
SERVER_IP=$(curl -s ifconfig.me)
DOMAIN_IP=$(dig +short $DOMAIN | tail -1)

if [ "$SERVER_IP" != "$DOMAIN_IP" ]; then
    echo -e "${RED}❌ Domain $DOMAIN does not resolve to this server${NC}"
    echo "  Server IP: $SERVER_IP"
    echo "  Domain IP: $DOMAIN_IP"
    echo "Please update your DNS records first."
    exit 1
fi

echo -e "${GREEN}✓ Domain DNS verified${NC}"
echo ""

# Obtain certificate
echo -e "${BLUE}Obtaining SSL certificate...${NC}"
certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN --redirect

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ SSL certificate obtained and configured${NC}"
    echo ""
    echo "SSL is now enabled!"
    echo "  ✓ HTTPS: https://$DOMAIN"
    echo "  ✓ Auto-renewal: Configured"
    echo ""
    echo "Test certificate renewal:"
    echo "  certbot renew --dry-run"
else
    echo -e "${RED}❌ Failed to obtain SSL certificate${NC}"
    exit 1
fi
