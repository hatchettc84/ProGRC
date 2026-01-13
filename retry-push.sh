#!/bin/bash
# Retry Docker push with proxy fixes

set -e

echo "=========================================="
echo "Retrying Docker Push with Fixes"
echo "=========================================="
echo ""

REGISTRY="registry.digitalocean.com"
REGISTRY_NAME="progrc"
IMAGE_NAME="progrc-backend"
IMAGE_TAG="latest"
FULL_IMAGE="${REGISTRY}/${REGISTRY_NAME}/${IMAGE_NAME}:${IMAGE_TAG}"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_info() { echo -e "ℹ️  $1"; }

# Step 1: Check current proxy settings
echo "Step 1: Checking proxy settings..."
if [ -n "$HTTP_PROXY" ] || [ -n "$HTTPS_PROXY" ] || [ -n "$http_proxy" ] || [ -n "$https_proxy" ]; then
    print_warning "Proxy settings detected:"
    [ -n "$HTTP_PROXY" ] && echo "  HTTP_PROXY=$HTTP_PROXY"
    [ -n "$HTTPS_PROXY" ] && echo "  HTTPS_PROXY=$HTTPS_PROXY"
    [ -n "$http_proxy" ] && echo "  http_proxy=$http_proxy"
    [ -n "$https_proxy" ] && echo "  https_proxy=$https_proxy"
    
    read -p "Disable proxy for this push? (Y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        print_info "Temporarily disabling proxy..."
        unset HTTP_PROXY
        unset HTTPS_PROXY
        unset http_proxy
        unset https_proxy
        print_success "Proxy disabled for this session"
    fi
else
    print_info "No proxy settings detected"
fi
echo ""

# Step 2: Increase timeout
echo "Step 2: Setting extended timeout..."
export DOCKER_CLIENT_TIMEOUT=600
export COMPOSE_HTTP_TIMEOUT=600
print_success "Timeout set to 600 seconds"
echo ""

# Step 3: Verify image exists
echo "Step 3: Verifying image exists locally..."
if docker images "${FULL_IMAGE}" --format "{{.Repository}}:{{.Tag}}" | grep -q "${FULL_IMAGE}"; then
    IMAGE_SIZE=$(docker images "${FULL_IMAGE}" --format "{{.Size}}")
    print_success "Image found locally: ${IMAGE_SIZE}"
else
    print_error "Image not found locally"
    print_info "You may need to rebuild first: docker build --platform linux/amd64 -t ${FULL_IMAGE} -f Dockerfile ."
    exit 1
fi
echo ""

# Step 4: Test registry connectivity
echo "Step 4: Testing registry connectivity..."
if curl -s -o /dev/null -w "%{http_code}" https://registry.digitalocean.com/v2/ | grep -q "200\|401"; then
    print_success "Registry is reachable"
else
    print_warning "Registry connectivity test failed (this might be okay)"
fi
echo ""

# Step 5: Retry push with extended timeout
echo "Step 5: Pushing image to registry..."
print_info "Image: ${FULL_IMAGE}"
print_info "This may take 5-15 minutes depending on image size..."
print_warning "If this fails, check FIX_PUSH_ERROR.md for more solutions"
echo ""

# Try push with progress
if docker push "${FULL_IMAGE}"; then
    print_success "Image pushed successfully!"
    echo ""
    print_success "=========================================="
    print_success "Push Complete!"
    print_success "=========================================="
    echo ""
    echo "Next steps:"
    echo "  1. Restart deployment: kubectl rollout restart deployment/progrc-backend -n progrc-dev"
    echo "  2. Wait for rollout: kubectl rollout status deployment/progrc-backend -n progrc-dev --timeout=5m"
    echo "  3. Verify: kubectl get pods -n progrc-dev -l app=progrc-backend"
    echo ""
else
    print_error "Push failed again"
    echo ""
    print_warning "Try these solutions:"
    echo "  1. Check Docker Desktop proxy settings (Settings → Resources → Proxies)"
    echo "  2. Try from a different network (mobile hotspot, different WiFi)"
    echo "  3. Increase timeout: export DOCKER_CLIENT_TIMEOUT=1200"
    echo "  4. Check FIX_PUSH_ERROR.md for detailed troubleshooting"
    echo ""
    exit 1
fi


