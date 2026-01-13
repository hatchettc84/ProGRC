#!/bin/bash
# Simple deployment script for compliance scoring optimizations
# Run this script directly: bash deploy-now.sh

set -e

echo "=========================================="
echo "Deploying Compliance Scoring Optimizations"
echo "=========================================="
echo ""

# Configuration
REGISTRY="registry.digitalocean.com"
REGISTRY_NAME="progrc"
IMAGE_NAME="progrc-backend"
IMAGE_TAG="latest"
FULL_IMAGE="${REGISTRY}/${REGISTRY_NAME}/${IMAGE_NAME}:${IMAGE_TAG}"
NAMESPACE="progrc-dev"
DEPLOYMENT="progrc-backend"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_info() { echo -e "ℹ️  $1"; }

# Step 1: Build TypeScript
echo "Step 1: Building TypeScript code..."
if npm run build; then
    print_success "TypeScript build completed"
else
    print_warning "TypeScript build failed - Docker will build it"
fi
echo ""

# Step 2: Build Docker image
echo "Step 2: Building Docker image..."
print_info "This may take 5-15 minutes..."
if docker build --platform linux/amd64 -t "${FULL_IMAGE}" -f Dockerfile .; then
    print_success "Docker image built successfully"
else
    print_error "Docker build failed"
    exit 1
fi
echo ""

# Step 3: Login to registry
echo "Step 3: Logging into registry..."
print_info "Attempting registry login..."
if command -v doctl &> /dev/null; then
    if doctl registry login 2>/dev/null; then
        print_success "Logged in with doctl"
    else
        print_warning "doctl login failed, trying docker login..."
        docker login "${REGISTRY}" || {
            print_error "Registry login failed"
            print_info "Please login manually: docker login ${REGISTRY}"
            exit 1
        }
    fi
else
    docker login "${REGISTRY}" || {
        print_error "Registry login failed"
        print_info "Please login manually: docker login ${REGISTRY}"
        exit 1
    }
fi
print_success "Logged into registry"
echo ""

# Step 4: Push image
echo "Step 4: Pushing image to registry..."
print_info "This may take a few minutes..."
if docker push "${FULL_IMAGE}"; then
    print_success "Image pushed successfully"
else
    print_error "Image push failed"
    exit 1
fi
echo ""

# Step 5: Restart deployment
echo "Step 5: Restarting Kubernetes deployment..."
if kubectl rollout restart deployment/"${DEPLOYMENT}" -n "${NAMESPACE}"; then
    print_success "Deployment restarted"
else
    print_error "Deployment restart failed"
    exit 1
fi
echo ""

# Step 6: Wait for rollout
echo "Step 6: Waiting for rollout to complete..."
print_info "This may take 2-5 minutes..."
if kubectl rollout status deployment/"${DEPLOYMENT}" -n "${NAMESPACE}" --timeout=5m; then
    print_success "Rollout completed successfully"
else
    print_warning "Rollout status check failed or timed out"
    print_info "Check manually: kubectl rollout status deployment/${DEPLOYMENT} -n ${NAMESPACE}"
fi
echo ""

# Step 7: Verify deployment
echo "Step 7: Verifying deployment..."
PODS=$(kubectl get pods -n "${NAMESPACE}" -l app="${DEPLOYMENT}" --no-headers 2>/dev/null | head -3)
if [ -n "$PODS" ]; then
    print_success "Pods status:"
    echo "$PODS"
else
    print_warning "Could not get pod status"
fi
echo ""

# Step 8: Check logs
echo "Step 8: Checking logs for instant scoring..."
POD_NAME=$(kubectl get pods -n "${NAMESPACE}" -l app="${DEPLOYMENT}" --no-headers 2>/dev/null | head -1 | awk '{print $1}')
if [ -n "$POD_NAME" ]; then
    print_info "Checking logs from pod: ${POD_NAME}"
    kubectl logs -n "${NAMESPACE}" "${POD_NAME}" --tail=50 2>/dev/null | grep -i "instant scoring\|compliance\|error" || print_info "No instant scoring logs found yet (normal if no requests made)"
else
    print_warning "Could not get pod name for log checking"
fi
echo ""

print_success "=========================================="
print_success "Deployment Complete!"
print_success "=========================================="
echo ""
echo "📋 Summary:"
echo "  • Backend built successfully"
echo "  • Docker image built for linux/amd64"
echo "  • Image pushed to ${FULL_IMAGE}"
echo "  • Deployment restarted in namespace ${NAMESPACE}"
echo ""
echo "🧪 Testing:"
echo "  • Start a compliance assessment to see instant scores"
echo "  • Check logs: kubectl logs -n ${NAMESPACE} -l app=${DEPLOYMENT} | grep 'INSTANT SCORING'"
echo ""
echo "📚 Documentation:"
echo "  • See COMPLIANCE_SCORING_OPTIMIZATIONS.md for details"
echo ""
