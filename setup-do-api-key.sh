#!/bin/bash
# Setup DigitalOcean API Key for kubectl and Docker registry
# Run this script outside the sandbox to properly configure authentication

set -e

echo "=========================================="
echo "DigitalOcean API Key Setup"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_info() { echo -e "ℹ️  $1"; }

API_KEY="${DO_API_KEY:-<YOUR_DIGITALOCEAN_API_KEY>}"
NAMESPACE="progrc-dev"
REGISTRY_SECRET="registry-progrc"
REGISTRY="registry.digitalocean.com"
REGISTRY_NAME="progrc"

# Step 1: Configure doctl
echo "Step 1: Configuring doctl..."
if ! command -v doctl &> /dev/null; then
    print_error "doctl is not installed"
    print_info "Install with: brew install doctl"
    exit 1
fi

print_info "Authenticating doctl with API key..."
if doctl auth init --access-token "$API_KEY" 2>&1; then
    print_success "doctl authenticated"
else
    print_warning "doctl authentication had issues (may be TLS/certificate related)"
    print_info "You can manually set the token:"
    echo "  echo '$API_KEY' | doctl auth init --access-token -"
fi
echo ""

# Step 2: Verify account access
echo "Step 2: Verifying account access..."
if doctl account get &> /dev/null; then
    print_success "Account access verified"
    doctl account get | head -3
else
    print_warning "Could not verify account (may be TLS/certificate related)"
    print_info "This is OK if kubectl is already working"
fi
echo ""

# Step 3: Login to Docker registry
echo "Step 3: Logging into Docker registry..."
if doctl registry login 2>&1; then
    print_success "Docker registry login successful"
else
    print_warning "Registry login had issues, but we'll create the Kubernetes secret manually"
fi
echo ""

# Step 4: Use API key for registry authentication
echo "Step 4: Preparing registry credentials..."
print_info "Using API key for DigitalOcean registry authentication"
print_info "DigitalOcean registry uses the API key as both username and password"
REGISTRY_TOKEN="$API_KEY"
echo ""

# Step 5: Create/update Kubernetes registry secret
echo "Step 5: Creating Kubernetes registry secret..."
print_info "Namespace: $NAMESPACE"
print_info "Secret name: $REGISTRY_SECRET"

# Check if namespace exists
if ! kubectl get namespace "$NAMESPACE" &> /dev/null; then
    print_info "Creating namespace $NAMESPACE..."
    kubectl create namespace "$NAMESPACE"
fi

# Delete existing secret if it exists
if kubectl get secret "$REGISTRY_SECRET" -n "$NAMESPACE" &> /dev/null; then
    print_info "Deleting existing secret to recreate with correct credentials..."
    kubectl delete secret "$REGISTRY_SECRET" -n "$NAMESPACE" --ignore-not-found=true
    sleep 1
fi

# Create the secret using the API key
print_info "Creating registry secret with API key..."
if kubectl create secret docker-registry "$REGISTRY_SECRET" \
    --docker-server="$REGISTRY" \
    --docker-username="$REGISTRY_TOKEN" \
    --docker-password="$REGISTRY_TOKEN" \
    --docker-email="api@digitalocean.com" \
    -n "$NAMESPACE" 2>&1; then
    print_success "Registry secret created"
else
    print_error "Failed to create registry secret"
    exit 1
fi

# Verify the secret was created correctly
print_info "Verifying secret..."
if kubectl get secret "$REGISTRY_SECRET" -n "$NAMESPACE" &> /dev/null; then
    SECRET_TYPE=$(kubectl get secret "$REGISTRY_SECRET" -n "$NAMESPACE" -o jsonpath='{.type}' 2>/dev/null || echo "")
    if [ "$SECRET_TYPE" = "kubernetes.io/dockerconfigjson" ]; then
        print_success "Secret type verified: $SECRET_TYPE"
        
        # Decode and check the credentials
        DOCKER_CONFIG=$(kubectl get secret "$REGISTRY_SECRET" -n "$NAMESPACE" -o jsonpath='{.data.\.dockerconfigjson}' 2>/dev/null | base64 -d 2>/dev/null || echo "")
        if [ -n "$DOCKER_CONFIG" ]; then
            USERNAME=$(echo "$DOCKER_CONFIG" | jq -r '.auths."registry.digitalocean.com".username' 2>/dev/null || echo "")
            PASSWORD=$(echo "$DOCKER_CONFIG" | jq -r '.auths."registry.digitalocean.com".password' 2>/dev/null || echo "")
            
            if [ -n "$USERNAME" ] && [ "$USERNAME" != "null" ] && [ "$USERNAME" = "$API_KEY" ]; then
                print_success "Secret credentials verified: API key matches"
            elif [ -n "$USERNAME" ] && [ ${#USERNAME} -gt 20 ] && [ ${#USERNAME} -lt 200 ]; then
                print_success "Secret credentials appear valid (username length: ${#USERNAME})"
            else
                print_warning "Secret credentials may be invalid"
                print_info "Username length: ${#USERNAME:-0}"
                print_info "If authentication fails, check that the API key is correct"
            fi
        else
            print_warning "Could not decode secret to verify credentials"
        fi
    else
        print_warning "Secret type is $SECRET_TYPE (expected kubernetes.io/dockerconfigjson)"
    fi
else
    print_error "Secret not found after creation"
    exit 1
fi
echo ""

# Step 6: Verify kubectl cluster access
echo "Step 6: Verifying kubectl cluster access..."
if kubectl cluster-info &> /dev/null; then
    print_success "kubectl cluster access verified"
    kubectl cluster-info | head -2
else
    print_error "kubectl cluster access failed"
    exit 1
fi
echo ""

# Step 7: Summary
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
print_success "DigitalOcean API key configured"
print_success "Kubernetes registry secret created: $REGISTRY_SECRET"
print_success "Ready to build and deploy"
echo ""
print_info "Next steps:"
echo "  1. Run the build script:"
echo "     bash build-via-kubectl-baseline.sh"
echo ""
echo "  2. Or manually build and push:"
echo "     docker build -t $REGISTRY/$REGISTRY_NAME/progrc-backend:latest ."
echo "     docker push $REGISTRY/$REGISTRY_NAME/progrc-backend:latest"
echo ""
