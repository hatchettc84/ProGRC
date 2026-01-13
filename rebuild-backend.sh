#!/bin/bash
# Rebuild Backend Docker Image and Deploy to Kubernetes

set -e

echo "🔨 Rebuilding ProGRC Backend"
echo "============================="
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

# Check if docker is available
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

print_success "Docker found"

# Check if doctl is available (for DigitalOcean registry)
USE_DOCTL=false
if command -v doctl &> /dev/null; then
    USE_DOCTL=true
    print_success "doctl found (will use for registry auth)"
else
    print_warning "doctl not found - you'll need to login to registry manually"
    print_info "Install with: brew install doctl && doctl auth init"
fi

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    print_error "kubectl is not installed. Please install kubectl first."
    exit 1
fi

print_success "kubectl found"

# Check Dockerfile
echo ""
echo "1️⃣  Checking Dockerfile..."
if [ -f "Dockerfile" ]; then
    print_success "Dockerfile found"
    DOCKERFILE="Dockerfile"
elif [ -f "Dockerfile.simple" ]; then
    print_info "Using Dockerfile.simple (faster build)"
    DOCKERFILE="Dockerfile.simple"
else
    print_error "No Dockerfile found. Please check the current directory."
    exit 1
fi

# Check if we need to login to registry
echo ""
echo "2️⃣  Checking registry access..."
if [ "$USE_DOCTL" = true ]; then
    print_info "Logging into DigitalOcean Container Registry with doctl..."
    doctl registry login
    print_success "Logged into registry"
else
    print_warning "Manual registry login may be required"
    print_info "Run: docker login registry.digitalocean.com"
    print_info "Or install doctl: brew install doctl && doctl auth init"
fi

# Build the image
echo ""
echo "3️⃣  Building Docker image..."
print_info "Image: $FULL_IMAGE_NAME"
print_info "Dockerfile: $DOCKERFILE"
print_info "This may take several minutes..."

# Build with platform specification for compatibility
docker buildx build \
  --platform linux/amd64 \
  -f "$DOCKERFILE" \
  -t "$FULL_IMAGE_NAME" \
  --load \
  .

if [ $? -eq 0 ]; then
    print_success "Docker image built successfully"
else
    print_error "Docker build failed"
    exit 1
fi

# Get image size
IMAGE_SIZE=$(docker images "$FULL_IMAGE_NAME" --format "{{.Size}}")
print_info "Image size: $IMAGE_SIZE"

# Push the image
echo ""
echo "4️⃣  Pushing image to DigitalOcean Container Registry..."
print_info "Pushing: $FULL_IMAGE_NAME"
print_info "This may take a few minutes..."

docker push "$FULL_IMAGE_NAME"

if [ $? -eq 0 ]; then
    print_success "Image pushed successfully"
else
    print_error "Failed to push image"
    print_info "Make sure you're logged in to the registry:"
    echo "   docker login registry.digitalocean.com"
    echo "   OR"
    echo "   doctl registry login"
    exit 1
fi

# Verify image in registry
echo ""
echo "5️⃣  Verifying image in registry..."
if [ "$USE_DOCTL" = true ]; then
    REGISTRY_IMAGES=$(doctl registry repository list-tags "$REGISTRY_NAME/${IMAGE_NAME}" 2>/dev/null | grep "$IMAGE_TAG" || echo "")
    if [ -n "$REGISTRY_IMAGES" ]; then
        print_success "Image verified in registry"
    else
        print_warning "Could not verify image in registry (might need to wait a moment)"
    fi
else
    print_info "Skipping registry verification (doctl not available)"
fi

# Verify Kubernetes deployment
echo ""
echo "6️⃣  Verifying Kubernetes deployment..."
if kubectl get deployment "$BACKEND_DEPLOYMENT" -n "$NAMESPACE" > /dev/null 2>&1; then
    CURRENT_IMAGE=$(kubectl get deployment "$BACKEND_DEPLOYMENT" -n "$NAMESPACE" -o jsonpath='{.spec.template.spec.containers[0].image}')
    print_success "Backend deployment found"
    echo "   Current image: $CURRENT_IMAGE"
    
    if [ "$CURRENT_IMAGE" = "$FULL_IMAGE_NAME" ]; then
        print_success "Deployment is configured with correct image"
    else
        print_warning "Deployment image doesn't match:"
        echo "   Expected: $FULL_IMAGE_NAME"
        echo "   Current: $CURRENT_IMAGE"
        print_info "Deployment will use the new image when restarted (imagePullPolicy: Always)"
    fi
else
    print_error "Backend deployment not found"
    print_info "You may need to create it first"
fi

# Restart deployment to pull new image
echo ""
echo "7️⃣  Restarting backend deployment to use new image..."
print_info "Initiating rollout restart..."

kubectl rollout restart deployment/"$BACKEND_DEPLOYMENT" -n "$NAMESPACE"

if [ $? -eq 0 ]; then
    print_success "Backend restart initiated"
    
    echo ""
    print_info "Waiting for rollout to complete (this may take 2-3 minutes)..."
    kubectl rollout status deployment/"$BACKEND_DEPLOYMENT" -n "$NAMESPACE" --timeout=180s
    
    if [ $? -eq 0 ]; then
        print_success "Backend rollout completed successfully"
    else
        print_warning "Rollout status check timed out or failed"
        print_info "Check status manually: kubectl get pods -n $NAMESPACE -l app=$BACKEND_DEPLOYMENT"
    fi
else
    print_error "Failed to restart backend"
    exit 1
fi

# Wait a bit for pods to start
echo ""
print_info "Waiting 15 seconds for pods to initialize..."
sleep 15

# Check pod status
echo ""
echo "8️⃣  Checking pod status..."
PODS=$(kubectl get pods -n "$NAMESPACE" -l app=$BACKEND_DEPLOYMENT -o name 2>/dev/null | head -3)

if [ -n "$PODS" ]; then
    echo "   Backend pods:"
    kubectl get pods -n "$NAMESPACE" -l app=$BACKEND_DEPLOYMENT --no-headers 2>/dev/null | while read line; do
        POD_NAME=$(echo "$line" | awk '{print $1}')
        POD_STATUS=$(echo "$line" | awk '{print $3}')
        POD_READY=$(echo "$line" | awk '{print $2}')
        
        if [ "$POD_STATUS" = "Running" ] && [ "$POD_READY" = "1/1" ]; then
            print_success "Pod $POD_NAME is Running"
        elif [ "$POD_STATUS" = "Running" ]; then
            print_warning "Pod $POD_NAME is Running but not ready yet ($POD_READY)"
        else
            print_warning "Pod $POD_NAME status: $POD_STATUS ($POD_READY)"
        fi
    done
else
    print_warning "No backend pods found"
fi

# Check for image pull errors
echo ""
echo "9️⃣  Checking for image pull errors..."
IMAGE_PULL_ERRORS=$(kubectl get pods -n "$NAMESPACE" -l app=$BACKEND_DEPLOYMENT -o jsonpath='{.items[*].status.containerStatuses[*].state.waiting.reason}' 2>/dev/null | grep -i "image\|pull\|err" || echo "")

if [ -n "$IMAGE_PULL_ERRORS" ]; then
    print_warning "Found potential image pull issues:"
    echo "   $IMAGE_PULL_ERRORS"
    print_info "Check pod events: kubectl describe pod -n $NAMESPACE -l app=$BACKEND_DEPLOYMENT"
else
    print_success "No image pull errors detected"
fi

# Summary
echo ""
echo "==========================================="
echo "📋 Rebuild Summary"
echo "==========================================="
echo ""

print_success "Docker image built and pushed: $FULL_IMAGE_NAME"
print_success "Backend deployment restarted"
echo ""

print_info "Image details:"
echo "   Registry: registry.digitalocean.com"
echo "   Repository: $REGISTRY_NAME/$IMAGE_NAME"
echo "   Tag: $IMAGE_TAG"
echo "   Size: $IMAGE_SIZE"
echo ""

print_info "To check deployment status:"
echo "   kubectl get pods -n $NAMESPACE -l app=$BACKEND_DEPLOYMENT"
echo ""

print_info "To view logs:"
echo "   kubectl logs -n $NAMESPACE deployment/$BACKEND_DEPLOYMENT --tail=100"
echo ""

print_info "To watch rollout in real-time:"
echo "   kubectl rollout status deployment/$BACKEND_DEPLOYMENT -n $NAMESPACE -w"
echo ""

print_success "Backend rebuild and deployment complete! 🚀"


