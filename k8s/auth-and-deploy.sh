#!/bin/bash

# Authenticate doctl and deploy ProGRC
# Usage: DO_API_TOKEN=your_token ./k8s/auth-and-deploy.sh

set -e

echo "=========================================="
echo "ProGRC DigitalOcean Deployment"
echo "=========================================="
echo ""

# Check for API token
if [ -z "$DO_API_TOKEN" ]; then
    echo "❌ DigitalOcean API token not provided"
    echo ""
    echo "Please provide your API token:"
    echo "  export DO_API_TOKEN=your_token_here"
    echo "  ./k8s/auth-and-deploy.sh"
    echo ""
    echo "Or authenticate interactively:"
    echo "  doctl auth init"
    echo ""
    exit 1
fi

# Authenticate doctl
echo "Step 1: Authenticating doctl..."
echo "$DO_API_TOKEN" | doctl auth init --context default -t - 2>&1 | grep -v "Welcome" || true
echo "✓ Authenticated"
echo ""

# Verify authentication
if ! doctl account get &> /dev/null; then
    echo "❌ Authentication failed. Please check your API token."
    exit 1
fi

echo "✓ Authentication verified"
echo ""

# Now run the setup script
echo "Step 2: Running setup script..."
cd "$(dirname "$0")/.."
./k8s/setup-registry-and-deploy.sh



