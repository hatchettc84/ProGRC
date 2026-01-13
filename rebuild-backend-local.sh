#!/bin/bash
# Rebuild Backend Docker Image (Local Build - Manual Push)

set -e

echo "🔨 Rebuilding ProGRC Backend (Local Build)"
echo "==========================================="
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

# Check Dockerfile
echo ""
echo "1️⃣  Checking Dockerfile..."
if [ -f "Dockerfile" ]; then
    print_success "Dockerfile found"
    DOCKERFILE="Dockerfile"
    print_info "Using full Dockerfile (includes Chromium and hardening)"
elif [ -f "Dockerfile.simple" ]; then
    print_info "Using Dockerfile.simple (faster build)"
    DOCKERFILE="Dockerfile.simple"
else
    print_error "No Dockerfile found. Please check the current directory."
    exit 1
fi

# Clean previous builds (optional)
echo ""
read -p "Clean previous Docker builds? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Cleaning previous builds..."
    docker system prune -f
    print_success "Cleanup complete"
fi

# Check if we need to build TypeScript first
echo ""
echo "2️⃣  Checking if TypeScript build is needed..."
if [ ! -d "dist" ] || [ -z "$(ls -A dist)" ]; then
    print_warning "dist/ directory is empty or doesn't exist"
    print_info "Building TypeScript first..."
    
    if command -v npm &> /dev/null; then
        print_info "Running npm install..."
        npm ci
        
        print_info "Running npm build..."
        npm run build
        
        if [ $? -eq 0 ]; then
            print_success "TypeScript build completed"
        else
            print_error "TypeScript build failed"
            exit 1
        fi
    else
        print_warning "npm not found - Docker build will handle it"
    fi
else
    print_success "dist/ directory exists with files"
    print_info "Using existing dist/ directory (Dockerfile will rebuild if needed)"
fi

# Build the image
echo ""
echo "3️⃣  Building Docker image..."
print_info "Image: $FULL_IMAGE_NAME"
print_info "Dockerfile: $DOCKERFILE"
print_info "Platform: linux/amd64"
print_warning "This may take 5-15 minutes depending on your system..."

# Build with platform specification for compatibility
docker buildx build \
  --platform linux/amd64 \
  -f "$DOCKERFILE" \
  -t "$FULL_IMAGE_NAME" \
  -t "${IMAGE_NAME}:${IMAGE_TAG}" \
  --load \
  . 2>&1 | tee /tmp/docker-build.log

BUILD_EXIT_CODE=${PIPESTATUS[0]}

if [ $BUILD_EXIT_CODE -eq 0 ]; then
    print_success "Docker image built successfully"
    
    # Get image size
    IMAGE_SIZE=$(docker images "$FULL_IMAGE_NAME" --format "{{.Size}}" 2>/dev/null || docker images "${IMAGE_NAME}:${IMAGE_TAG}" --format "{{.Size}}")
    if [ -n "$IMAGE_SIZE" ]; then
        print_info "Image size: $IMAGE_SIZE"
    fi
else
    print_error "Docker build failed (exit code: $BUILD_EXIT_CODE)"
    print_info "Check build logs above for details"
    print_info "Or check: /tmp/docker-build.log"
    exit 1
fi

# Verify image was created
echo ""
echo "4️⃣  Verifying image..."
if docker images "$FULL_IMAGE_NAME" --format "{{.Repository}}:{{.Tag}}" 2>/dev/null | grep -q "$FULL_IMAGE_NAME" || \
   docker images "${IMAGE_NAME}:${IMAGE_TAG}" --format "{{.Repository}}:{{.Tag}}" 2>/dev/null | grep -q "${IMAGE_NAME}:${IMAGE_TAG}"; then
    print_success "Image verified locally"
    
    # Show image details
    echo ""
    print_info "Image details:"
    docker images "$FULL_IMAGE_NAME" "${IMAGE_NAME}:${IMAGE_TAG}" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}" 2>/dev/null | head -2
else
    print_error "Image not found after build"
    exit 1
fi

# Test image (optional)
echo ""
read -p "Test image locally before pushing? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Testing image locally..."
    print_info "Starting container in background..."
    
    TEST_CONTAINER=$(docker run -d \
      --name progrc-backend-test \
      -p 3001:3000 \
      "$FULL_IMAGE_NAME" 2>&1 || echo "")
    
    if [ -n "$TEST_CONTAINER" ]; then
        print_info "Waiting 10 seconds for container to start..."
        sleep 10
        
        # Check if container is running
        if docker ps | grep -q "progrc-backend-test"; then
            print_success "Container is running"
            print_info "Testing health endpoint..."
            
            HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:3001/health --max-time 5 2>&1 || echo "000")
            HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n 1)
            
            if [ "$HTTP_CODE" = "200" ]; then
                print_success "Health check passed (HTTP 200)"
            else
                print_warning "Health check returned HTTP $HTTP_CODE (container might still be starting)"
            fi
            
            print_info "Stopping test container..."
            docker stop progrc-backend-test 2>/dev/null || true
            docker rm progrc-backend-test 2>/dev/null || true
            print_success "Test container removed"
        else
            print_warning "Container didn't start or stopped immediately"
            docker logs progrc-backend-test 2>/dev/null | tail -20 || true
            docker rm progrc-backend-test 2>/dev/null || true
        fi
    else
        print_warning "Could not start test container"
    fi
fi

# Push to registry
echo ""
echo "5️⃣  Pushing image to DigitalOcean Container Registry..."
print_info "Image: $FULL_IMAGE_NAME"
print_warning "You need to be logged in to the registry first"
echo ""

# Check if already logged in
if docker info 2>/dev/null | grep -q "registry.digitalocean.com"; then
    print_success "Already logged in to registry"
else
    print_info "Logging into DigitalOcean Container Registry..."
    print_info "Options:"
    echo "   1. Use doctl: doctl registry login"
    echo "   2. Use docker: docker login registry.digitalocean.com"
    echo ""
    
    if command -v doctl &> /dev/null; then
        read -p "Use doctl to login? (Y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Nn]$ ]]; then
            doctl registry login || {
                print_error "Failed to login with doctl"
                print_info "Try manual login: docker login registry.digitalocean.com"
                exit 1
            }
        fi
    else
        print_info "doctl not found. Use manual login:"
        echo "   docker login registry.digitalocean.com"
        echo ""
        read -p "Press Enter after you've logged in to continue..." -n 1 -r
        echo
    fi
fi

# Push image
print_info "Pushing image to registry..."
print_warning "This may take a few minutes..."

docker push "$FULL_IMAGE_NAME"

if [ $? -eq 0 ]; then
    print_success "Image pushed successfully to registry"
else
    print_error "Failed to push image"
    print_info "Troubleshooting:"
    echo "   1. Make sure you're logged in: docker login registry.digitalocean.com"
    echo "   2. Verify registry exists: doctl registry list"
    echo "   3. Check registry name: $REGISTRY_NAME"
    echo "   4. Verify image name matches registry: $FULL_IMAGE_NAME"
    exit 1
fi

# Restart Kubernetes deployment
echo ""
echo "6️⃣  Restarting Kubernetes deployment..."
if kubectl get deployment "$BACKEND_DEPLOYMENT" -n "$NAMESPACE" > /dev/null 2>&1; then
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
            print_warning "Rollout status check timed out"
            print_info "Check status: kubectl get pods -n $NAMESPACE -l app=$BACKEND_DEPLOYMENT"
        fi
    else
        print_error "Failed to restart backend"
        exit 1
    fi
else
    print_error "Backend deployment not found"
    print_info "Deploy it first: kubectl apply -f k8s/services/backend.yaml -n $NAMESPACE"
fi

# Wait for pods to start
echo ""
print_info "Waiting 15 seconds for pods to initialize..."
sleep 15

# Check pod status
echo ""
echo "7️⃣  Checking pod status..."
PODS=$(kubectl get pods -n "$NAMESPACE" -l app=$BACKEND_DEPLOYMENT --no-headers 2>/dev/null | head -3)

if [ -n "$PODS" ]; then
    echo "   Backend pods:"
    kubectl get pods -n "$NAMESPACE" -l app=$BACKEND_DEPLOYMENT 2>/dev/null | tail -n +2 | while read line; do
        POD_NAME=$(echo "$line" | awk '{print $1}')
        POD_STATUS=$(echo "$line" | awk '{print $3}')
        POD_READY=$(echo "$line" | awk '{print $2}')
        POD_AGE=$(echo "$line" | awk '{print $5}')
        
        if [ "$POD_STATUS" = "Running" ] && [ "$POD_READY" = "1/1" ]; then
            print_success "Pod $POD_NAME: Running ($POD_AGE old)"
        elif [ "$POD_STATUS" = "Running" ]; then
            print_warning "Pod $POD_NAME: Running but not ready yet ($POD_READY, $POD_AGE old)"
        else
            print_warning "Pod $POD_NAME: Status=$POD_STATUS, Ready=$POD_READY, Age=$POD_AGE"
        fi
    done
else
    print_warning "No backend pods found"
fi

# Check logs for errors
echo ""
echo "8️⃣  Checking recent logs for errors..."
POD_NAME=$(kubectl get pods -n "$NAMESPACE" -l app=$BACKEND_DEPLOYMENT -o jsonpath='{.items[0].metadata.name}' 2>/dev/null)

if [ -n "$POD_NAME" ]; then
    print_info "Checking logs from pod: $POD_NAME"
    
    # Check for errors in last 50 lines
    ERRORS=$(kubectl logs "$POD_NAME" -n "$NAMESPACE" --tail=50 2>/dev/null | grep -iE "error|exception|fatal|crash" | head -5 || echo "")
    
    if [ -n "$ERRORS" ]; then
        print_warning "Found errors in logs:"
        echo "$ERRORS" | sed 's/^/      /'
    else
        print_success "No errors found in recent logs"
    fi
    
    # Check for startup success
    STARTUP_LOGS=$(kubectl logs "$POD_NAME" -n "$NAMESPACE" --tail=100 2>/dev/null | grep -iE "application is running|started|listening" | head -3 || echo "")
    
    if [ -n "$STARTUP_LOGS" ]; then
        print_success "Startup logs found:"
        echo "$STARTUP_LOGS" | sed 's/^/      /'
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
print_success "Image pushed to registry: registry.digitalocean.com"
print_success "Backend deployment restarted"
echo ""

print_info "Image details:"
echo "   Registry: registry.digitalocean.com"
echo "   Repository: $REGISTRY_NAME/$IMAGE_NAME"
echo "   Tag: $IMAGE_TAG"
if [ -n "$IMAGE_SIZE" ]; then
    echo "   Size: $IMAGE_SIZE"
fi
echo ""

print_info "Useful commands:"
echo "   Check pods: kubectl get pods -n $NAMESPACE -l app=$BACKEND_DEPLOYMENT"
echo "   View logs: kubectl logs -n $NAMESPACE deployment/$BACKEND_DEPLOYMENT --tail=100"
echo "   Watch logs: kubectl logs -n $NAMESPACE deployment/$BACKEND_DEPLOYMENT -f"
echo "   Check events: kubectl get events -n $NAMESPACE --sort-by='.lastTimestamp'"
echo ""

print_success "Backend rebuild and deployment complete! 🚀"


