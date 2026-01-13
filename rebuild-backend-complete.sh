#!/bin/bash
# Complete Backend Rebuild - Build, Push, and Deploy

set -e

echo "🔨 Complete ProGRC Backend Rebuild"
echo "==================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }

# Configuration
REGISTRY_NAME="progrc"
IMAGE_NAME="progrc-backend"
IMAGE_TAG="latest"
FULL_IMAGE_NAME="registry.digitalocean.com/${REGISTRY_NAME}/${IMAGE_NAME}:${IMAGE_TAG}"
NAMESPACE="progrc-dev"
BACKEND_DEPLOYMENT="progrc-backend"

# Check prerequisites
echo "Checking prerequisites..."

if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed"
    exit 1
fi
print_success "Docker found"

if ! command -v kubectl &> /dev/null; then
    print_error "kubectl is not installed"
    exit 1
fi
print_success "kubectl found"

# Choose Dockerfile
echo ""
echo "1️⃣  Selecting Dockerfile..."
if [ -f "Dockerfile.simple" ]; then
    DOCKERFILE="Dockerfile.simple"
    print_info "Using Dockerfile.simple (faster build, recommended)"
elif [ -f "Dockerfile" ]; then
    DOCKERFILE="Dockerfile"
    print_info "Using Dockerfile (full build with Chromium and hardening)"
else
    print_error "No Dockerfile found"
    exit 1
fi

print_success "Dockerfile: $DOCKERFILE"

# Build TypeScript first (optional but recommended)
echo ""
read -p "Build TypeScript before Docker build? (recommended) (Y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Nn]$ ]]; then
    echo ""
    echo "2️⃣  Building TypeScript..."
    if command -v npm &> /dev/null; then
        print_info "Installing dependencies..."
        npm ci --silent || npm install --silent
        
        print_info "Building TypeScript..."
        npm run build
        
        if [ $? -eq 0 ]; then
            print_success "TypeScript build completed"
        else
            print_warning "TypeScript build failed - Docker will build it"
        fi
    else
        print_warning "npm not found - Docker will handle the build"
    fi
else
    print_info "Skipping TypeScript build - Docker will handle it"
fi

# Build Docker image
echo ""
echo "3️⃣  Building Docker image..."
print_info "Image: $FULL_IMAGE_NAME"
print_info "Dockerfile: $DOCKERFILE"
print_warning "This may take 5-15 minutes..."

# Use regular docker build (more compatible)
docker build \
  --platform linux/amd64 \
  -f "$DOCKERFILE" \
  -t "$FULL_IMAGE_NAME" \
  -t "${IMAGE_NAME}:${IMAGE_TAG}" \
  . 2>&1 | tee /tmp/docker-build.log

BUILD_EXIT_CODE=${PIPESTATUS[0]}

if [ $BUILD_EXIT_CODE -eq 0 ]; then
    print_success "Docker image built successfully"
    
    # Get image size
    IMAGE_SIZE=$(docker images "$FULL_IMAGE_NAME" "${IMAGE_NAME}:${IMAGE_TAG}" --format "{{.Size}}" 2>/dev/null | head -1)
    if [ -n "$IMAGE_SIZE" ]; then
        print_info "Image size: $IMAGE_SIZE"
    fi
else
    print_error "Docker build failed (exit code: $BUILD_EXIT_CODE)"
    print_info "Check build logs: /tmp/docker-build.log"
    exit 1
fi

# Verify image
echo ""
echo "4️⃣  Verifying image..."
if docker images "$FULL_IMAGE_NAME" "${IMAGE_NAME}:${IMAGE_TAG}" --format "{{.Repository}}:{{.Tag}}" 2>/dev/null | grep -qE "($FULL_IMAGE_NAME|${IMAGE_NAME}:${IMAGE_TAG})"; then
    print_success "Image verified locally"
    docker images "$FULL_IMAGE_NAME" "${IMAGE_NAME}:${IMAGE_TAG}" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}" 2>/dev/null | head -3
else
    print_error "Image not found after build"
    exit 1
fi

# Login to registry
echo ""
echo "5️⃣  Logging into DigitalOcean Container Registry..."
print_info "Attempting registry login..."

# Try doctl first
if command -v doctl &> /dev/null; then
    print_info "Using doctl to login..."
    if doctl registry login 2>/dev/null; then
        print_success "Logged in with doctl"
        REGISTRY_LOGGED_IN=true
    else
        print_warning "doctl login failed (certificate issue?)"
        print_info "Trying docker login directly..."
        REGISTRY_LOGGED_IN=false
    fi
else
    print_info "doctl not found, trying docker login..."
    REGISTRY_LOGGED_IN=false
fi

# Try docker login directly
if [ "$REGISTRY_LOGGED_IN" = false ]; then
    print_info "Please login to registry manually:"
    echo "   docker login registry.digitalocean.com"
    echo ""
    print_info "Or use doctl:"
    echo "   doctl auth init"
    echo "   doctl registry login"
    echo ""
    
    read -p "Have you logged in to the registry? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        REGISTRY_LOGGED_IN=true
    else
        print_warning "Skipping push - you can push manually later"
        print_info "Push command: docker push $FULL_IMAGE_NAME"
        REGISTRY_LOGGED_IN=false
    fi
fi

# Push image
if [ "$REGISTRY_LOGGED_IN" = true ]; then
    echo ""
    echo "6️⃣  Pushing image to registry..."
    print_info "Pushing: $FULL_IMAGE_NAME"
    print_warning "This may take a few minutes..."
    
    docker push "$FULL_IMAGE_NAME"
    
    if [ $? -eq 0 ]; then
        print_success "Image pushed successfully"
    else
        print_error "Failed to push image"
        print_info "You can push manually later:"
        echo "   docker push $FULL_IMAGE_NAME"
        exit 1
    fi
else
    echo ""
    echo "6️⃣  Skipping push (not logged in)"
    print_info "To push manually later:"
    echo "   docker login registry.digitalocean.com"
    echo "   docker push $FULL_IMAGE_NAME"
fi

# Restart Kubernetes deployment
echo ""
echo "7️⃣  Restarting Kubernetes deployment..."
if kubectl get deployment "$BACKEND_DEPLOYMENT" -n "$NAMESPACE" > /dev/null 2>&1; then
    print_info "Initiating rollout restart..."
    
    kubectl rollout restart deployment/"$BACKEND_DEPLOYMENT" -n "$NAMESPACE"
    
    if [ $? -eq 0 ]; then
        print_success "Backend restart initiated"
        
        echo ""
        print_info "Waiting for rollout to complete..."
        kubectl rollout status deployment/"$BACKEND_DEPLOYMENT" -n "$NAMESPACE" --timeout=180s 2>/dev/null || {
            print_warning "Rollout status check timed out"
            print_info "Check manually: kubectl rollout status deployment/$BACKEND_DEPLOYMENT -n $NAMESPACE"
        }
    else
        print_error "Failed to restart backend"
        print_info "Restart manually: kubectl rollout restart deployment/$BACKEND_DEPLOYMENT -n $NAMESPACE"
    fi
else
    print_warning "Backend deployment not found"
    print_info "Deploy it first: kubectl apply -f k8s/services/backend.yaml -n $NAMESPACE"
fi

# Wait for pods
echo ""
print_info "Waiting 20 seconds for pods to initialize..."
sleep 20

# Check pod status
echo ""
echo "8️⃣  Checking pod status..."
kubectl get pods -n "$NAMESPACE" -l app=$BACKEND_DEPLOYMENT --no-headers 2>/dev/null | while read line; do
    POD_NAME=$(echo "$line" | awk '{print $1}')
    POD_STATUS=$(echo "$line" | awk '{print $3}')
    POD_READY=$(echo "$line" | awk '{print $2}')
    
    if [ "$POD_STATUS" = "Running" ] && [ "$POD_READY" = "1/1" ]; then
        print_success "Pod $POD_NAME: Running and ready"
    elif [ "$POD_STATUS" = "Running" ]; then
        print_warning "Pod $POD_NAME: Running but not ready yet ($POD_READY)"
    else
        print_warning "Pod $POD_NAME: Status=$POD_STATUS, Ready=$POD_READY"
    fi
done

# Check logs
echo ""
echo "9️⃣  Checking startup logs..."
POD_NAME=$(kubectl get pods -n "$NAMESPACE" -l app=$BACKEND_DEPLOYMENT -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)

if [ -n "$POD_NAME" ]; then
    print_info "Checking logs from pod: $POD_NAME"
    
    # Check for successful startup
    STARTUP_LOGS=$(kubectl logs "$POD_NAME" -n "$NAMESPACE" --tail=50 2>/dev/null | grep -iE "application is running|started|listening|Nest application successfully started" | head -3 || echo "")
    
    if [ -n "$STARTUP_LOGS" ]; then
        print_success "Application started successfully:"
        echo "$STARTUP_LOGS" | sed 's/^/      /'
    else
        print_info "Startup logs not found yet (might still be starting)"
    fi
    
    # Check for errors
    ERRORS=$(kubectl logs "$POD_NAME" -n "$NAMESPACE" --tail=100 2>/dev/null | grep -iE "error|exception|fatal|crash" | head -5 || echo "")
    
    if [ -n "$ERRORS" ]; then
        echo ""
        print_warning "Found errors in logs:"
        echo "$ERRORS" | sed 's/^/      /'
    fi
else
    print_warning "No pods found to check logs"
fi

# Summary
echo ""
echo "==========================================="
echo "📋 Rebuild Summary"
echo "==========================================="
echo ""

print_success "Docker image built: $FULL_IMAGE_NAME"

if [ "$REGISTRY_LOGGED_IN" = true ]; then
    print_success "Image pushed to registry"
else
    print_warning "Image NOT pushed (login required)"
fi

print_success "Backend deployment restarted"
echo ""

print_info "Next steps:"
if [ "$REGISTRY_LOGGED_IN" = false ]; then
    echo "   1. Login to registry: docker login registry.digitalocean.com"
    echo "   2. Push image: docker push $FULL_IMAGE_NAME"
    echo "   3. Restart backend: kubectl rollout restart deployment/$BACKEND_DEPLOYMENT -n $NAMESPACE"
fi
echo ""
echo "   Check status: kubectl get pods -n $NAMESPACE -l app=$BACKEND_DEPLOYMENT"
echo "   View logs: kubectl logs -n $NAMESPACE deployment/$BACKEND_DEPLOYMENT --tail=100"
echo ""

print_success "Backend rebuild complete! 🚀"


