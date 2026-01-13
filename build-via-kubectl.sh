#!/bin/bash
# Build Docker image directly in Kubernetes using kubectl cp + Kaniko
# No SSH needed, no privileged containers needed - uses Kaniko

set -e

echo "=========================================="
echo "Build in Kubernetes via kubectl + Kaniko"
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
BUILD_POD_NAME="backend-builder-$(date +%s)"
REGISTRY="registry.digitalocean.com/progrc/progrc-backend:latest"
REGISTRY_SECRET="registry-progrc"

# Step 1: Check prerequisites
echo "Step 1: Checking prerequisites..."
if ! command -v kubectl &> /dev/null; then
    print_error "kubectl is not installed"
    exit 1
fi
print_success "kubectl found"

if ! kubectl cluster-info &> /dev/null; then
    print_error "Cannot connect to Kubernetes cluster"
    exit 1
fi
print_success "Connected to Kubernetes cluster"

# Check registry secret exists
if ! kubectl get secret "$REGISTRY_SECRET" -n "$NAMESPACE" &> /dev/null; then
    print_error "Registry secret '$REGISTRY_SECRET' not found in namespace '$NAMESPACE'"
    print_info "Please create the registry secret first:"
    echo "  kubectl create secret docker-registry $REGISTRY_SECRET \\"
    echo "    --docker-server=registry.digitalocean.com \\"
    echo "    --docker-username=<token> \\"
    echo "    --docker-password=<token> \\"
    echo "    --docker-email=<email> \\"
    echo "    -n $NAMESPACE"
    exit 1
fi
print_success "Registry secret found"
echo ""

# Step 2: Create code archive
echo "Step 2: Creating code archive..."
cd "$(dirname "$0")"
TAR_FILE="/tmp/progrc-backend-source-$(date +%s).tar.gz"

tar -czf "$TAR_FILE" \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='dist' \
    --exclude='*.log' \
    --exclude='.DS_Store' \
    --exclude='k8s/jobs' \
    .

if [ -f "$TAR_FILE" ]; then
    FILE_SIZE=$(du -h "$TAR_FILE" | cut -f1)
    print_success "Archive created: $FILE_SIZE"
else
    print_error "Failed to create archive"
    exit 1
fi
echo ""

# Step 3: Create build pod with Kaniko (no privileged needed!)
echo "Step 3: Creating build pod with Kaniko..."
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: ${BUILD_POD_NAME}
  namespace: ${NAMESPACE}
spec:
  restartPolicy: Never
  containers:
  - name: prepare
    image: alpine:latest
    command: ['sh', '-c']
    args:
    - |
      set -e
      cd /workspace
      echo "Extracting source code..."
      tar -xzf source.tar.gz
      echo "Source code extracted"
      ls -la
      echo "Waiting for Kaniko to build..."
      sleep 3600
    securityContext:
      allowPrivilegeEscalation: false
      capabilities:
        drop:
        - ALL
      runAsNonRoot: true
      runAsUser: 65532
      seccompProfile:
        type: RuntimeDefault
    volumeMounts:
    - name: workspace
      mountPath: /workspace
  - name: kaniko
    image: gcr.io/kaniko-project/executor:latest
    args:
    - --dockerfile=Dockerfile
    - --context=dir:///workspace
    - --destination=${REGISTRY}
    - --cache=true
    - --cache-ttl=24h
    - --compressed-caching=false
    - --verbosity=info
    - --skip-tls-verify
    - --snapshot-mode=redo
    - --use-new-run
    env:
    - name: DOCKER_CONFIG
      value: /kaniko/.docker
    securityContext:
      allowPrivilegeEscalation: false
      capabilities:
        drop:
        - ALL
      runAsNonRoot: true
      runAsUser: 65532
      seccompProfile:
        type: RuntimeDefault
    volumeMounts:
    - name: workspace
      mountPath: /workspace
    - name: docker-config
      mountPath: /kaniko/.docker
  volumes:
  - name: workspace
    emptyDir: {}
  - name: docker-config
    secret:
      secretName: ${REGISTRY_SECRET}
      items:
      - key: .dockerconfigjson
        path: config.json
  securityContext:
    runAsNonRoot: true
    runAsUser: 65532
    fsGroup: 65532
    seccompProfile:
      type: RuntimeDefault

EOF

print_info "Waiting for pod to be ready..."
sleep 5

# Wait for pod to be running
for i in {1..30}; do
    PHASE=$(kubectl get pod "$BUILD_POD_NAME" -n "$NAMESPACE" -o jsonpath='{.status.phase}' 2>/dev/null || echo "Unknown")
    if [ "$PHASE" = "Running" ]; then
        print_success "Pod is running"
        break
    elif [ "$PHASE" = "Failed" ] || [ "$PHASE" = "Error" ]; then
        print_error "Pod failed to start"
        kubectl describe pod "$BUILD_POD_NAME" -n "$NAMESPACE"
        kubectl delete pod "$BUILD_POD_NAME" -n "$NAMESPACE" --ignore-not-found=true
        exit 1
    fi
    sleep 2
    echo -n "."
done
echo ""

# Check if pod is running
PHASE=$(kubectl get pod "$BUILD_POD_NAME" -n "$NAMESPACE" -o jsonpath='{.status.phase}' 2>/dev/null || echo "Unknown")
if [ "$PHASE" != "Running" ]; then
    print_error "Pod failed to start (phase: $PHASE)"
    kubectl describe pod "$BUILD_POD_NAME" -n "$NAMESPACE"
    kubectl logs "$BUILD_POD_NAME" -n "$NAMESPACE" -c prepare --tail=50
    kubectl delete pod "$BUILD_POD_NAME" -n "$NAMESPACE" --ignore-not-found=true
    exit 1
fi
echo ""

# Step 4: Copy code to pod
echo "Step 4: Copying code to pod..."
print_info "This may take a few minutes..."
if kubectl cp "$TAR_FILE" "$NAMESPACE/$BUILD_POD_NAME:/workspace/source.tar.gz" -c prepare; then
    print_success "Code copied successfully"
    rm -f "$TAR_FILE"  # Clean up
else
    print_error "Failed to copy code"
    kubectl delete pod "$BUILD_POD_NAME" -n "$NAMESPACE" --ignore-not-found=true
    exit 1
fi
echo ""

# Step 5: Trigger Kaniko build
echo "Step 5: Triggering Kaniko build..."
print_info "Extracting source code in pod..."
kubectl exec -n "$NAMESPACE" "$BUILD_POD_NAME" -c prepare -- sh -c "cd /workspace && tar -xzf source.tar.gz" || {
    print_error "Failed to extract code"
    kubectl logs "$BUILD_POD_NAME" -n "$NAMESPACE" -c prepare --tail=50
    kubectl delete pod "$BUILD_POD_NAME" -n "$NAMESPACE" --ignore-not-found=true
    exit 1
}

print_warning "Kaniko build is now running (this will take 10-20 minutes)..."
print_info "You can watch progress with:"
echo "  kubectl logs -f $BUILD_POD_NAME -n $NAMESPACE -c kaniko"
echo ""

# Wait for Kaniko container to start building
sleep 5

# Monitor build progress
print_info "Monitoring build progress..."
BUILD_STARTED=false
for i in {1..60}; do
    KANIKO_LOGS=$(kubectl logs "$BUILD_POD_NAME" -n "$NAMESPACE" -c kaniko --tail=20 2>/dev/null || echo "")
    
    if echo "$KANIKO_LOGS" | grep -q "error\|Error\|ERROR\|failed\|Failed"; then
        print_error "Build error detected!"
        kubectl logs "$BUILD_POD_NAME" -n "$NAMESPACE" -c kaniko --tail=100
        kubectl delete pod "$BUILD_POD_NAME" -n "$NAMESPACE" --ignore-not-found=true
        exit 1
    fi
    
    if echo "$KANIKO_LOGS" | grep -q "Pushing image\|Successfully pushed\|pushed image"; then
        print_success "Build completed and image pushed!"
        BUILD_STARTED=true
        break
    fi
    
    if echo "$KANIKO_LOGS" | grep -q "Building\|Step\|COPY\|RUN"; then
        if [ "$BUILD_STARTED" = false ]; then
            print_success "Build started"
            BUILD_STARTED=true
        fi
        echo -n "."
    fi
    
    sleep 10
done
echo ""

# Check final status
KANIKO_PHASE=$(kubectl get pod "$BUILD_POD_NAME" -n "$NAMESPACE" -o jsonpath='{.status.containerStatuses[?(@.name=="kaniko")].state.terminated.reason}' 2>/dev/null || echo "")
if [ "$KANIKO_PHASE" = "Completed" ]; then
    print_success "Kaniko build completed successfully!"
elif [ "$KANIKO_PHASE" = "Error" ]; then
    print_error "Kaniko build failed"
    kubectl logs "$BUILD_POD_NAME" -n "$NAMESPACE" -c kaniko --tail=100
    kubectl delete pod "$BUILD_POD_NAME" -n "$NAMESPACE" --ignore-not-found=true
    exit 1
else
    print_warning "Build still in progress. Check status manually:"
    echo "  kubectl logs -f $BUILD_POD_NAME -n $NAMESPACE -c kaniko"
    echo "  kubectl get pod $BUILD_POD_NAME -n $NAMESPACE"
    read -p "Press Enter after build completes, or Ctrl+C to cancel..."
fi
echo ""

# Step 6: Cleanup
echo "Step 6: Cleaning up build pod..."
kubectl delete pod "$BUILD_POD_NAME" -n "$NAMESPACE" --ignore-not-found=true
print_success "Build pod deleted"
echo ""

# Step 7: Restart deployment
echo "Step 7: Restarting Kubernetes deployment..."
if kubectl rollout restart deployment/progrc-backend -n "$NAMESPACE"; then
    print_success "Deployment restarted"
else
    print_error "Failed to restart deployment"
    exit 1
fi

print_info "Waiting for rollout to complete (this may take 2-5 minutes)..."
if kubectl rollout status deployment/progrc-backend -n "$NAMESPACE" --timeout=5m; then
    print_success "Rollout completed successfully"
else
    print_warning "Rollout status check timed out, but continuing..."
fi
echo ""

# Step 8: Verify
echo "Step 8: Verifying deployment..."
PODS=$(kubectl get pods -n "$NAMESPACE" -l app=progrc-backend --no-headers 2>/dev/null | head -3)
if [ -n "$PODS" ]; then
    print_success "Pods status:"
    echo "$PODS"
else
    print_warning "Could not get pod status"
fi
echo ""

print_success "=========================================="
print_success "✅ Build and Deployment Complete!"
print_success "=========================================="
echo ""
echo "📋 Summary:"
echo "  • Code transferred via kubectl (no SSH needed)"
echo "  • Docker image built with Kaniko (no privileged containers)"
echo "  • Image pushed to registry"
echo "  • Kubernetes deployment restarted"
echo ""
echo "🧪 Testing:"
echo "  • Check logs: kubectl logs -n $NAMESPACE -l app=progrc-backend --tail=100 | grep 'INSTANT SCORING'"
echo "  • Start a compliance assessment to see instant scores"
echo ""
