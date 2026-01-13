#!/bin/bash

# Generate SSH Key for DigitalOcean Droplet Access

set -e

echo "=========================================="
echo "Generate SSH Key for DigitalOcean"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Key file path
KEY_NAME="progrc_droplet"
KEY_PATH="$HOME/.ssh/$KEY_NAME"

# Check if key already exists
if [ -f "$KEY_PATH" ]; then
    echo -e "${YELLOW}⚠️  SSH key already exists at: $KEY_PATH${NC}"
    echo ""
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Keeping existing key."
        KEY_PATH_EXISTS=true
    else
        rm -f "$KEY_PATH" "$KEY_PATH.pub"
        KEY_PATH_EXISTS=false
    fi
else
    KEY_PATH_EXISTS=false
fi

if [ "$KEY_PATH_EXISTS" = false ]; then
    echo "Generating new SSH key..."
    echo ""
    
    # Generate ED25519 key (recommended, more secure and faster)
    ssh-keygen -t ed25519 -C "progrc-droplet-access-$(date +%Y%m%d)" -f "$KEY_PATH" -N ""
    
    echo ""
    echo -e "${GREEN}✅ SSH key generated successfully!${NC}"
    echo ""
else
    echo -e "${GREEN}✅ Using existing SSH key${NC}"
    echo ""
fi

# Display public key
echo "=========================================="
echo "Your Public SSH Key:"
echo "=========================================="
echo ""
cat "$KEY_PATH.pub"
echo ""
echo ""

# Display private key location
echo "=========================================="
echo "Key Information:"
echo "=========================================="
echo ""
echo "Private Key: $KEY_PATH"
echo "Public Key:  $KEY_PATH.pub"
echo ""

# Set proper permissions
chmod 600 "$KEY_PATH"
chmod 644 "$KEY_PATH.pub"
echo -e "${GREEN}✅ Permissions set correctly${NC}"
echo ""

# Instructions
echo "=========================================="
echo "Next Steps:"
echo "=========================================="
echo ""
echo "1. Add the public key to DigitalOcean:"
echo ""
echo "   Option A: Via Dashboard (Recommended)"
echo "   - Go to: https://cloud.digitalocean.com/account/security"
echo "   - Click 'Add SSH Key'"
echo "   - Paste the public key above"
echo "   - Give it a name (e.g., 'progrc-droplet-key')"
echo ""
echo "   Option B: Via doctl"
echo "   doctl compute ssh-key create progrc-droplet-key --public-key-file $KEY_PATH.pub"
echo ""
echo "2. Add key to existing droplets:"
echo "   - Dashboard → Droplets → Select droplet"
echo "   - Settings → Add SSH Key"
echo "   - Select your new key"
echo ""
echo "3. Connect using the key:"
echo "   ssh -i $KEY_PATH root@142.93.183.7"
echo "   ssh -i $KEY_PATH root@64.225.20.65"
echo ""
echo "4. Or add to SSH config for easier access:"
echo "   Add to ~/.ssh/config:"
echo ""
echo "   Host progrc-droplet-142"
echo "       HostName 142.93.183.7"
echo "       User root"
echo "       IdentityFile $KEY_PATH"
echo ""
echo "   Host progrc-droplet-ai"
echo "       HostName 64.225.20.65"
echo "       User root"
echo "       IdentityFile $KEY_PATH"
echo ""
echo "   Then connect with: ssh progrc-droplet-142"
echo ""
