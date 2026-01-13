#!/bin/bash
# Fix proxy issue for Docker push to DigitalOcean registry

set -e

echo "=========================================="
echo "Fixing Proxy Issue for Docker Push"
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

# Step 1: Completely disable proxy
echo "Step 1: Disabling proxy settings..."
unset HTTP_PROXY
unset HTTPS_PROXY
unset http_proxy
unset https_proxy
unset NO_PROXY
unset no_proxy

# Also unset in current shell session
export HTTP_PROXY=""
export HTTPS_PROXY=""
export http_proxy=""
export https_proxy=""

print_success "Proxy variables cleared"
print_info "Current proxy settings:"
env | grep -i proxy || print_info "  (none set)"
echo ""

# Step 2: Configure Docker to bypass proxy for DigitalOcean registry
echo "Step 2: Configuring Docker to bypass proxy for registry..."

# Check if Docker Desktop is running
if ! docker ps > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker Desktop first."
    exit 1
fi

# Check Docker config directory
DOCKER_CONFIG_DIR="$HOME/.docker"
if [ ! -d "$DOCKER_CONFIG_DIR" ]; then
    mkdir -p "$DOCKER_CONFIG_DIR"
fi

DOCKER_CONFIG="$DOCKER_CONFIG_DIR/config.json"

# Backup existing config
if [ -f "$DOCKER_CONFIG" ]; then
    cp "$DOCKER_CONFIG" "${DOCKER_CONFIG}.backup.$(date +%Y%m%d_%H%M%S)"
    print_info "Backed up existing Docker config"
fi

# Create or update config.json to skip proxy for DigitalOcean
if [ -f "$DOCKER_CONFIG" ]; then
    # Check if jq is available to modify JSON
    if command -v jq &> /dev/null; then
        print_info "Using jq to update Docker config..."
        jq '.proxies = {"no-proxy": "registry.digitalocean.com,*.digitalocean.com,localhost,127.0.0.1"}' "$DOCKER_CONFIG" > "${DOCKER_CONFIG}.tmp" && mv "${DOCKER_CONFIG}.tmp" "$DOCKER_CONFIG"
        print_success "Docker config updated"
    else
        print_warning "jq not found, will use manual config update"
        print_info "Please manually add proxy bypass in Docker Desktop: Settings → Resources → Proxies → No proxy: registry.digitalocean.com,*.digitalocean.com"
    fi
else
    # Create new config
    cat > "$DOCKER_CONFIG" <<EOF
{
  "proxies": {
    "no-proxy": "registry.digitalocean.com,*.digitalocean.com,localhost,127.0.0.1"
  }
}
EOF
    print_success "Created Docker config with proxy bypass"
fi
echo ""

# Step 3: Increase Docker timeout settings
echo "Step 3: Setting extended timeout settings..."
export DOCKER_CLIENT_TIMEOUT=1200
export COMPOSE_HTTP_TIMEOUT=1200
export DOCKER_BUILDKIT=0  # Disable buildkit for more compatibility
print_success "Timeout set to 1200 seconds (20 minutes)"
print_info "DOCKER_BUILDKIT disabled for compatibility"
echo ""

# Step 4: Verify image exists
echo "Step 4: Verifying image exists locally..."
if docker images "${FULL_IMAGE}" --format "{{.Repository}}:{{.Tag}}" 2>/dev/null | grep -q "${FULL_IMAGE}"; then
    IMAGE_SIZE=$(docker images "${FULL_IMAGE}" --format "{{.Size}}" 2>/dev/null | head -1)
    print_success "Image found locally: ${IMAGE_SIZE}"
else
    print_warning "Image not found with full name, checking short name..."
    if docker images "${IMAGE_NAME}:${IMAGE_TAG}" --format "{{.Repository}}:{{.Tag}}" 2>/dev/null | grep -q "${IMAGE_NAME}:${IMAGE_TAG}"; then
        print_info "Found image with short name, retagging..."
        docker tag "${IMAGE_NAME}:${IMAGE_TAG}" "${FULL_IMAGE}"
        print_success "Image retagged"
    else
        print_error "Image not found locally"
        print_info "You may need to rebuild: docker build --platform linux/amd64 -t ${FULL_IMAGE} -f Dockerfile ."
        exit 1
    fi
fi
echo ""

# Step 5: Test direct connection to registry (bypassing proxy)
echo "Step 5: Testing direct connection to registry..."
print_info "Testing without proxy..."
if curl -s --noproxy "*" -o /dev/null -w "%{http_code}" https://registry.digitalocean.com/v2/ 2>/dev/null | grep -qE "200|401"; then
    print_success "Registry is directly reachable (bypassing proxy)"
else
    print_warning "Direct connection test inconclusive (may still work)"
fi
echo ""

# Step 6: Configure Docker Desktop proxy settings (macOS)
echo "Step 6: Docker Desktop Proxy Configuration (macOS)..."
print_warning "IMPORTANT: You need to manually configure Docker Desktop proxy settings"
echo ""
print_info "Please do the following:"
echo "  1. Open Docker Desktop"
echo "  2. Go to Settings → Resources → Proxies"
echo "  3. In 'No proxy' field, add:"
echo "     registry.digitalocean.com,*.digitalocean.com,localhost,127.0.0.1"
echo "  4. OR disable proxy completely if not needed"
echo "  5. Click 'Apply & Restart'"
echo ""
read -p "Have you updated Docker Desktop proxy settings? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Please update Docker Desktop settings before continuing"
    print_info "After updating, run this script again"
    exit 1
fi
echo ""

# Step 7: Retry push with all fixes applied
echo "Step 7: Pushing image to registry (with proxy bypass)..."
print_info "Image: ${FULL_IMAGE}"
print_info "This may take 10-20 minutes depending on image size..."
print_warning "The push is now bypassing proxy, this should work better"
echo ""

# Use curl to test first, then push
print_info "Testing registry authentication..."
if docker login "${REGISTRY}" --username "$(doctl registry get-token 2>/dev/null | head -1)" --password-stdin <<< "$(doctl registry get-token 2>/dev/null)" 2>/dev/null; then
    print_success "Registry authentication successful"
else
    print_warning "Authentication check skipped, will authenticate during push"
fi
echo ""

# Push with verbose output
print_info "Starting push... (watch for progress)"
if docker push "${FULL_IMAGE}"; then
    print_success ""
    print_success "=========================================="
    print_success "✅ Image Pushed Successfully!"
    print_success "=========================================="
    echo ""
    echo "Next steps:"
    echo "  1. Restart deployment:"
    echo "     kubectl rollout restart deployment/progrc-backend -n progrc-dev"
    echo ""
    echo "  2. Wait for rollout:"
    echo "     kubectl rollout status deployment/progrc-backend -n progrc-dev --timeout=5m"
    echo ""
    echo "  3. Verify pods:"
    echo "     kubectl get pods -n progrc-dev -l app=progrc-backend"
    echo ""
    echo "  4. Check logs for instant scoring:"
    echo "     kubectl logs -n progrc-dev -l app=progrc-backend --tail=100 | grep 'INSTANT SCORING'"
    echo ""
else
    print_error ""
    print_error "Push still failed. Try these additional solutions:"
    echo ""
    echo "  1. Check Docker Desktop proxy settings are saved and Docker is restarted"
    echo "  2. Try pushing from a different network (mobile hotspot, different WiFi)"
    echo "  3. Increase timeout further: export DOCKER_CLIENT_TIMEOUT=1800"
    echo "  4. Check if firewall/antivirus is blocking Docker"
    echo "  5. Try pushing in smaller chunks (rebuild with less compression)"
    echo ""
    print_info "See FIX_PUSH_ERROR.md for detailed troubleshooting"
    exit 1
fi


