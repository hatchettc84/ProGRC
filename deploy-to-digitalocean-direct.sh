#!/bin/bash
# Deploy directly to DigitalOcean by building on their platform
# This bypasses local Docker push issues

set -e

echo "=========================================="
echo "Deploy to DigitalOcean - Direct Build"
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

NAMESPACE="progrc-dev"
REGISTRY="registry.digitalocean.com"
REGISTRY_NAME="progrc"
IMAGE_NAME="progrc-backend"
IMAGE_TAG="latest"
FULL_IMAGE="${REGISTRY}/${REGISTRY_NAME}/${IMAGE_NAME}:${IMAGE_TAG}"

# Step 1: Check prerequisites
echo "Step 1: Checking prerequisites..."
if ! command -v kubectl &> /dev/null; then
    print_error "kubectl is not installed"
    exit 1
fi
print_success "kubectl found"

if ! kubectl cluster-info &> /dev/null; then
    print_error "Cannot connect to Kubernetes cluster"
    print_info "Check your kubeconfig: kubectl config current-context"
    exit 1
fi
print_success "Connected to Kubernetes cluster"
echo ""

# Step 2: Create Docker registry secret if it doesn't exist
echo "Step 2: Setting up Docker registry authentication..."
if ! kubectl get secret docker-registry-secret -n "$NAMESPACE" &> /dev/null; then
    print_info "Creating Docker registry secret..."
    
    # Get registry token
    if command -v doctl &> /dev/null; then
        REGISTRY_TOKEN=$(doctl registry get-token 2>/dev/null || echo "")
        if [ -z "$REGISTRY_TOKEN" ]; then
            print_warning "Could not get registry token with doctl"
            print_info "Please provide your DigitalOcean registry token:"
            read -sp "Registry Token: " REGISTRY_TOKEN
            echo
        fi
    else
        print_info "doctl not found, please provide your DigitalOcean registry token:"
        read -sp "Registry Token: " REGISTRY_TOKEN
        echo
    fi
    
    # Create secret
    kubectl create secret docker-registry docker-registry-secret \
        --docker-server="$REGISTRY" \
        --docker-username="$REGISTRY_TOKEN" \
        --docker-password="$REGISTRY_TOKEN" \
        --docker-email="deploy@progrc.com" \
        -n "$NAMESPACE" \
        2>/dev/null || print_info "Secret may already exist or creation failed"
else
    print_success "Docker registry secret already exists"
fi
echo ""

# Step 3: Build source code locally first
echo "Step 3: Building TypeScript source code..."
if npm run build 2>&1 | tail -20; then
    print_success "TypeScript build completed"
else
    print_warning "TypeScript build had issues, but continuing..."
fi
echo ""

# Step 4: Create a tarball of source code
echo "Step 4: Creating source code archive..."
TAR_FILE="/tmp/progrc-backend-source.tar.gz"
tar -czf "$TAR_FILE" \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='dist' \
    --exclude='*.log' \
    --exclude='.DS_Store' \
    -C "$(pwd)" .

if [ -f "$TAR_FILE" ]; then
    FILE_SIZE=$(du -h "$TAR_FILE" | cut -f1)
    print_success "Source archive created: $FILE_SIZE"
else
    print_error "Failed to create source archive"
    exit 1
fi
echo ""

# Step 5: Copy files to a pod that can build
echo "Step 5: Deploying build job on DigitalOcean..."

# Create a ConfigMap with source code (for small deployments)
# For larger deployments, we'll use a different approach

print_info "Option 1: Build using a temporary pod with Docker-in-Docker"
print_info "Creating build pod..."

cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: backend-builder
  namespace: $NAMESPACE
spec:
  restartPolicy: Never
  containers:
  - name: docker
    image: docker:24-dind
    securityContext:
      privileged: true
    volumeMounts:
    - name: docker-sock
      mountPath: /var/run
    env:
    - name: DOCKER_TLS_CERTDIR
      value: ""
  - name: kubectl
    image: bitnami/kubectl:latest
    command: ["sleep", "3600"]
  initContainers:
  - name: copy-source
    image: busybox
    command: ['sh', '-c', 'echo "Source will be copied via kubectl cp"']
  volumes:
  - name: docker-sock
    emptyDir: {}
EOF

sleep 5

# Copy source to pod
print_info "Copying source code to build pod..."
kubectl cp "$TAR_FILE" "$NAMESPACE/backend-builder:/tmp/source.tar.gz" -c kubectl

print_info "Extracting and building in pod..."
kubectl exec -n "$NAMESPACE" backend-builder -c kubectl -- sh -c "
  cd /tmp && 
  tar -xzf source.tar.gz && 
  cd /tmp && 
  echo 'Building Docker image...' &&
  docker build --platform linux/amd64 -t $FULL_IMAGE -f Dockerfile . &&
  echo 'Logging into registry...' &&
  docker login $REGISTRY -u \$(kubectl get secret docker-registry-secret -n $NAMESPACE -o jsonpath='{.data.\.dockerconfigjson}' | base64 -d | jq -r '.auths[\"$REGISTRY\"].username') -p \$(kubectl get secret docker-registry-secret -n $NAMESPACE -o jsonpath='{.data.\.dockerconfigjson}' | base64 -d | jq -r '.auths[\"$REGISTRY\"].password') &&
  echo 'Pushing image...' &&
  docker push $FULL_IMAGE &&
  echo 'Build and push complete!'
"

# Cleanup
print_info "Cleaning up build pod..."
kubectl delete pod backend-builder -n "$NAMESPACE" --ignore-not-found=true

print_success "Build completed on DigitalOcean!"

# Step 6: Restart deployment
echo ""
echo "Step 6: Restarting deployment..."
kubectl rollout restart deployment/progrc-backend -n "$NAMESPACE"
kubectl rollout status deployment/progrc-backend -n "$NAMESPACE" --timeout=5m

print_success "Deployment complete!"


