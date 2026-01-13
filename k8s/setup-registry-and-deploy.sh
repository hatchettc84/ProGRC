#!/bin/bash

# Setup DigitalOcean Container Registry and Deploy ProGRC
# This script automates the entire process

set -e

echo "=========================================="
echo "ProGRC DigitalOcean Deployment Setup"
echo "=========================================="
echo ""

# Check if doctl is installed
if ! command -v doctl &> /dev/null; then
    echo "❌ doctl is not installed"
    echo ""
    echo "Install it with:"
    echo "  brew install doctl"
    echo "  doctl auth init"
    echo ""
    exit 1
fi

# Check if doctl is authenticated
if ! doctl account get &> /dev/null; then
    echo "❌ doctl is not authenticated"
    echo ""
    echo "Authenticate with:"
    echo "  doctl auth init"
    echo ""
    exit 1
fi

echo "✓ doctl is installed and authenticated"
echo ""

# Registry name
REGISTRY_NAME="progrc-registry"
IMAGE_NAME="progrc-backend"
IMAGE_TAG="latest"

# Step 1: Create or use existing registry
echo "Step 1: Setting up Container Registry..."
if doctl registry get "$REGISTRY_NAME" &> /dev/null; then
    echo "✓ Registry '$REGISTRY_NAME' already exists"
else
    echo "Creating registry '$REGISTRY_NAME'..."
    doctl registry create "$REGISTRY_NAME"
    echo "✓ Registry created"
fi
echo ""

# Step 2: Login to registry
echo "Step 2: Logging into registry..."
doctl registry login
echo "✓ Logged in"
echo ""

# Step 3: Build Docker image
echo "Step 3: Building Docker image..."
cd "$(dirname "$0")/.."
if [ ! -f "Dockerfile.simple" ]; then
    echo "❌ Dockerfile.simple not found"
    exit 1
fi

FULL_IMAGE_NAME="registry.digitalocean.com/$REGISTRY_NAME/$IMAGE_NAME:$IMAGE_TAG"
docker build -f Dockerfile.simple -t "$FULL_IMAGE_NAME" .
echo "✓ Image built: $FULL_IMAGE_NAME"
echo ""

# Step 4: Push image
echo "Step 4: Pushing image to registry..."
docker push "$FULL_IMAGE_NAME"
echo "✓ Image pushed"
echo ""

# Step 5: Update backend.yaml with registry image
echo "Step 5: Updating Kubernetes manifests..."
BACKEND_YAML="k8s/services/backend.yaml"
if grep -q "image:.*progrc-backend" "$BACKEND_YAML"; then
    # Update image in backend.yaml
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s|image:.*progrc-backend.*|image: $FULL_IMAGE_NAME|" "$BACKEND_YAML"
    else
        sed -i "s|image:.*progrc-backend.*|image: $FULL_IMAGE_NAME|" "$BACKEND_YAML"
    fi
    echo "✓ Updated $BACKEND_YAML with image: $FULL_IMAGE_NAME"
else
    echo "⚠️  Could not find image line in $BACKEND_YAML"
fi
echo ""

# Step 6: Create image pull secret (if needed)
echo "Step 6: Creating Kubernetes image pull secret..."
kubectl create secret docker-registry regcred \
    --docker-server=registry.digitalocean.com \
    --docker-username="$(doctl registry get-token)" \
    --docker-password="$(doctl registry get-token)" \
    --docker-email="$(doctl account get --format Email)" \
    --namespace=progrc-dev \
    --dry-run=client -o yaml | kubectl apply -f -
echo "✓ Image pull secret created"
echo ""

# Step 7: Update backend deployment to use image pull secret
if ! grep -q "imagePullSecrets" "$BACKEND_YAML"; then
    echo "Adding imagePullSecrets to backend deployment..."
    # This is a bit complex, so we'll do it manually or via a patch
    echo "⚠️  You may need to manually add imagePullSecrets to backend.yaml:"
    echo "   imagePullSecrets:"
    echo "   - name: regcred"
fi
echo ""

# Step 8: Deploy
echo "Step 7: Ready to deploy!"
echo ""
echo "Run the deployment script:"
echo "  ./k8s/deploy-to-do.sh"
echo ""
echo "Or deploy manually:"
echo "  kubectl apply -f k8s/base/configmap.yaml"
echo "  kubectl apply -f k8s/services/redis.yaml"
echo "  kubectl apply -f k8s/services/backend.yaml"
echo ""

echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "Image: $FULL_IMAGE_NAME"
echo "Registry: $REGISTRY_NAME"
echo ""
echo "Next: Run ./k8s/deploy-to-do.sh to deploy"
echo ""



