#!/bin/bash

# Script to add SSH (port 22) to DigitalOcean Firewall Rules
# This script helps add SSH access to your firewall

set -e

echo "=========================================="
echo "Add SSH (Port 22) to DigitalOcean Firewall"
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

echo "Step 1: Listing firewalls..."
echo ""

# List all firewalls
FIREWALLS=$(doctl compute firewall list --format ID,Name,Status --no-header 2>&1)

if [ -z "$FIREWALLS" ] || echo "$FIREWALLS" | grep -q "Error"; then
    echo -e "${YELLOW}⚠️  Could not list firewalls via API${NC}"
    echo ""
    echo "Please add SSH rule manually via DigitalOcean Dashboard:"
    echo ""
    echo "1. Go to: https://cloud.digitalocean.com/networking/firewalls"
    echo "2. Click on your firewall"
    echo "3. Click 'Edit' button"
    echo "4. Under 'Inbound Rules', click 'Add Rule'"
    echo "5. Select:"
    echo "   - Type: SSH"
    echo "   - Port: 22"
    echo "   - Sources: 0.0.0.0/0 (or your specific IP)"
    echo "6. Click 'Save Changes'"
    exit 0
fi

echo "$FIREWALLS"
echo ""

# Get firewall IDs
FIREWALL_IDS=$(echo "$FIREWALLS" | awk '{print $1}')

if [ -z "$FIREWALL_IDS" ]; then
    echo -e "${YELLOW}⚠️  No firewalls found${NC}"
    echo "You may need to create a firewall first or add rules via dashboard"
    exit 0
fi

echo "Step 2: Checking current firewall rules..."
echo ""

# Check each firewall for SSH rule
for FIREWALL_ID in $FIREWALL_IDS; do
    FIREWALL_NAME=$(echo "$FIREWALLS" | grep "$FIREWALL_ID" | awk '{print $2}')
    echo "Checking firewall: $FIREWALL_NAME (ID: $FIREWALL_ID)"
    
    # Get current rules
    CURRENT_RULES=$(doctl compute firewall get "$FIREWALL_ID" --format InboundRules 2>&1)
    
    if echo "$CURRENT_RULES" | grep -q "22" || echo "$CURRENT_RULES" | grep -qi "ssh"; then
        echo -e "${GREEN}✅ SSH (port 22) already exists in firewall: $FIREWALL_NAME${NC}"
    else
        echo -e "${YELLOW}⚠️  SSH (port 22) not found in firewall: $FIREWALL_NAME${NC}"
        echo ""
        echo "To add SSH rule, run:"
        echo ""
        echo "doctl compute firewall add-rules $FIREWALL_ID \\"
        echo "  --inbound-rules \"type:ssh,port:22,source_addresses:0.0.0.0/0,::/0\""
        echo ""
        echo "Or add manually via dashboard:"
        echo "https://cloud.digitalocean.com/networking/firewalls/$FIREWALL_ID"
    fi
    echo ""
done

echo "=========================================="
echo "Manual Dashboard Instructions"
echo "=========================================="
echo ""
echo "If the script can't add rules automatically, use the dashboard:"
echo ""
echo "1. Go to: https://cloud.digitalocean.com/networking/firewalls"
echo "2. Click on your firewall"
echo "3. Click 'Edit' button"
echo "4. Under 'Inbound Rules', click 'Add Rule'"
echo "5. Configure:"
echo "   - Type: SSH"
echo "   - Port: 22"
echo "   - Sources:"
echo "     * 0.0.0.0/0,::/0 (allow from anywhere - less secure)"
echo "     * OR your specific IP (more secure)"
echo "6. Click 'Save Changes'"
echo ""
echo "To find your IP:"
echo "  curl ifconfig.me"
echo ""
