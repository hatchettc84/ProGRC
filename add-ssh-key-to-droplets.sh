#!/bin/bash

# Script to add SSH key to DigitalOcean droplets
# This script automates adding your SSH key to both droplets

set -e

echo "=========================================="
echo "Add SSH Key to DigitalOcean Droplets"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if doctl is installed
if ! command -v doctl &> /dev/null; then
    echo -e "${RED}❌ doctl is not installed${NC}"
    echo "Install it with: brew install doctl"
    exit 1
fi

# Check if authenticated
if ! doctl auth list &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not authenticated with doctl${NC}"
    echo "Run: doctl auth init"
    exit 1
fi

echo "Step 1: Finding SSH key..."
SSH_KEY_ID=$(doctl compute ssh-key list --format ID,Name --no-header 2>&1 | grep -i "progrc-droplet-key" | awk '{print $1}' | head -1)

if [ -z "$SSH_KEY_ID" ]; then
    echo -e "${RED}❌ SSH key 'progrc-droplet-key' not found${NC}"
    echo ""
    echo "Available SSH keys:"
    doctl compute ssh-key list
    echo ""
    echo "Please create the key first or use a different key name"
    exit 1
fi

echo -e "${GREEN}✅ Found SSH key ID: $SSH_KEY_ID${NC}"
echo ""

echo "Step 2: Finding droplets..."
DROPLET_142_ID=$(doctl compute droplet list --format ID,Name,PublicIPv4 --no-header 2>&1 | grep "142.93.183.7" | awk '{print $1}' | head -1)
DROPLET_AI_ID=$(doctl compute droplet list --format ID,Name,PublicIPv4 --no-header 2>&1 | grep "64.225.20.65" | awk '{print $1}' | head -1)

if [ -z "$DROPLET_142_ID" ] && [ -z "$DROPLET_AI_ID" ]; then
    echo -e "${YELLOW}⚠️  Could not find droplets via API${NC}"
    echo ""
    echo "Available droplets:"
    doctl compute droplet list
    echo ""
    echo "Please add keys manually via dashboard or use droplet IDs directly"
    exit 1
fi

echo "Step 3: Adding SSH key to droplets..."
echo ""

if [ -n "$DROPLET_142_ID" ]; then
    echo "Adding key to droplet 142.93.183.7 (ID: $DROPLET_142_ID)..."
    if doctl compute droplet add-ssh-key "$DROPLET_142_ID" --ssh-keys "$SSH_KEY_ID" 2>&1; then
        echo -e "${GREEN}✅ Key added to droplet 142.93.183.7${NC}"
    else
        echo -e "${YELLOW}⚠️  Key may already be added or error occurred${NC}"
    fi
    echo ""
fi

if [ -n "$DROPLET_AI_ID" ]; then
    echo "Adding key to droplet 64.225.20.65 (ID: $DROPLET_AI_ID)..."
    if doctl compute droplet add-ssh-key "$DROPLET_AI_ID" --ssh-keys "$SSH_KEY_ID" 2>&1; then
        echo -e "${GREEN}✅ Key added to droplet 64.225.20.65${NC}"
    else
        echo -e "${YELLOW}⚠️  Key may already be added or error occurred${NC}"
    fi
    echo ""
fi

echo "Step 4: Verifying..."
echo ""
echo "Waiting 10 seconds for changes to propagate..."
sleep 10

echo ""
echo "=========================================="
echo "Test SSH Connection"
echo "=========================================="
echo ""
echo "Try connecting:"
echo "  ssh -i ~/.ssh/progrc_droplet root@142.93.183.7"
echo "  ssh -i ~/.ssh/progrc_droplet root@64.225.20.65"
echo ""
