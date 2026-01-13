#!/bin/bash
# Build Docker image directly in Kubernetes using kubectl cp + Kaniko
# Uses a temporary namespace with baseline Pod Security for building

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
BUILD_NAMESPACE="progrc-build-$(date +%s)"
BUILD_POD_NAME="backend-builder-prepare"
KANIKO_JOB_NAME="backend-builder-kaniko"
WORKSPACE_PVC_NAME="workspace-pvc"
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

# Check registry secret exists in main namespace
if ! kubectl get secret "$REGISTRY_SECRET" -n "$NAMESPACE" &> /dev/null; then
    print_error "Registry secret '$REGISTRY_SECRET' not found in namespace '$NAMESPACE'"
    exit 1
fi
print_success "Registry secret found"
echo ""

# Step 2: Create temporary build namespace with baseline security
echo "Step 2: Creating temporary build namespace..."
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Namespace
metadata:
  name: ${BUILD_NAMESPACE}
  labels:
    pod-security.kubernetes.io/enforce: baseline
    pod-security.kubernetes.io/audit: baseline
    pod-security.kubernetes.io/warn: baseline
EOF

print_success "Build namespace created: $BUILD_NAMESPACE"

# Copy registry secret to build namespace
echo "Step 2b: Copying registry secret to build namespace..."
kubectl get secret "$REGISTRY_SECRET" -n "$NAMESPACE" -o yaml | \
    sed "s/namespace: ${NAMESPACE}/namespace: ${BUILD_NAMESPACE}/" | \
    kubectl apply -f - > /dev/null 2>&1 || true
print_success "Registry secret copied"

# Step 2c: Create PVC for shared workspace
print_info "Step 2c: Creating PVC for shared workspace..."
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: ${WORKSPACE_PVC_NAME}
  namespace: ${BUILD_NAMESPACE}
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi
  storageClassName: do-block-storage
EOF

# Wait for PVC to be bound
print_info "Waiting for PVC to be bound..."
for i in {1..30}; do
    PVC_STATUS=$(kubectl get pvc "$WORKSPACE_PVC_NAME" -n "$BUILD_NAMESPACE" -o jsonpath='{.status.phase}' 2>/dev/null || echo "Pending")
    if [ "$PVC_STATUS" = "Bound" ]; then
        print_success "PVC is bound"
        break
    fi
    sleep 2
done

if [ "$PVC_STATUS" != "Bound" ]; then
    print_warning "PVC not bound yet, but continuing..."
fi
echo ""

# Step 3: Create code archive
echo "Step 3: Creating code archive..."
cd "$(dirname "$0")"
TAR_FILE="/tmp/progrc-backend-source-$(date +%s).tar.gz"

# Create archive, explicitly including Dockerfile
tar -czf "$TAR_FILE" \
    --exclude='node_modules' \
    --exclude='.git' \
    --exclude='dist' \
    --exclude='*.log' \
    --exclude='.DS_Store' \
    --exclude='k8s/jobs' \
    --exclude='*.md' \
    --exclude='*.sh' \
    --exclude='.env*' \
    --exclude='coverage' \
    --exclude='.nyc_output' \
    --exclude='*.test.js' \
    --exclude='*.spec.ts' \
    --exclude='*.spec.js' \
    --exclude='docs' \
    --exclude='*.pdf' \
    --exclude='*.zip' \
    --exclude='*.tar.gz' \
    --exclude='.idea' \
    --exclude='.vscode' \
    --exclude='*.swp' \
    --exclude='*.swo' \
    --exclude='*~' \
    --exclude='build-via-kubectl*.sh' \
    --exclude='setup-*.sh' \
    --exclude='deploy-*.sh' \
    --exclude='retry-*.sh' \
    --exclude='fix-*.sh' \
    --exclude='test-*.sh' \
    --exclude='verify-*.sh' \
    --exclude='quick-*.sh' \
    --exclude='transfer-*.sh' \
    --exclude='rebuild-*.sh' \
    --exclude='install-*.sh' \
    --exclude='add-*.sh' \
    --exclude='update-*.sh' \
    --exclude='check-*.sh' \
    --exclude='hardening-*.sh' \
    --exclude='init-*.sh' \
    --exclude='ai-droplet-*.sh' \
    .

if [ -f "$TAR_FILE" ]; then
    FILE_SIZE=$(du -h "$TAR_FILE" | cut -f1)
    print_success "Archive created: $FILE_SIZE"
else
    print_error "Failed to create archive"
    kubectl delete namespace "$BUILD_NAMESPACE" --ignore-not-found=true
    exit 1
fi
echo ""

# Step 4: Create build pod with Kaniko (baseline security allows root)
echo "Step 4: Creating build pod with Kaniko..."
# First create pod with just prepare container as initContainer
cat <<EOF | kubectl apply -f -
apiVersion: v1
kind: Pod
metadata:
  name: ${BUILD_POD_NAME}
  namespace: ${BUILD_NAMESPACE}
spec:
  restartPolicy: Never
  containers:
  - name: prepare
    image: alpine:latest
    command: ['sh', '-c']
    args:
    - |
      cd /workspace
      echo "Waiting for source.tar.gz to be copied..."
      # Wait for file to exist and be completely written
      FILE_FOUND=false
      for i in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31 32 33 34 35 36 37 38 39 40 41 42 43 44 45 46 47 48 49 50 51 52 53 54 55 56 57 58 59 60; do
        # Check for marker file first (most reliable indicator)
        if [ -f transfer-complete.marker ] && [ -f source.tar.gz ]; then
          FILE_SIZE=\$(stat -c%s source.tar.gz 2>/dev/null || wc -c < source.tar.gz 2>/dev/null || echo "0")
          if [ "\$FILE_SIZE" != "0" ] && [ "\$FILE_SIZE" != "" ]; then
            echo "Transfer complete! File size: \$FILE_SIZE bytes. Extracting source code..."
            FILE_FOUND=true
            break
          fi
        elif [ -f source.tar.gz ]; then
          # Check if file size is stable (not being written)
          # Alpine Linux uses stat -c%s
          SIZE1=\$(stat -c%s source.tar.gz 2>/dev/null || wc -c < source.tar.gz 2>/dev/null || echo "0")
          sleep 3
          SIZE2=\$(stat -c%s source.tar.gz 2>/dev/null || wc -c < source.tar.gz 2>/dev/null || echo "0")
          if [ "\$SIZE1" = "\$SIZE2" ] && [ "\$SIZE1" != "0" ] && [ "\$SIZE1" != "" ]; then
            echo "File found and size stable (\$SIZE1 bytes)! Extracting source code..."
            FILE_FOUND=true
            break
          else
            echo "File found but still being written (size: \$SIZE1 -> \$SIZE2), waiting..."
          fi
        else
          echo "Waiting for source.tar.gz... ($i/60)"
        fi
        sleep 2
      done
      
      if [ "\$FILE_FOUND" != "true" ]; then
        echo "ERROR: source.tar.gz not found or not complete after 120 seconds"
        if [ -f source.tar.gz ]; then
          echo "File exists but may be incomplete. Size: \$(stat -c%s source.tar.gz 2>/dev/null || wc -c < source.tar.gz 2>/dev/null || echo 'unknown')"
        fi
        exit 1
      fi
      
      # Extract the file
      tar -xzf source.tar.gz || {
        echo "ERROR: Failed to extract tar file"
        echo "File size: \$(stat -c%s source.tar.gz 2>/dev/null || wc -c < source.tar.gz 2>/dev/null || echo 'unknown')"
        echo "File type: \$(file source.tar.gz 2>/dev/null || echo 'unknown')"
        exit 1
      }
      echo "Source code extracted successfully"
      echo "Checking workspace contents..."
      echo "Current directory: \$(pwd)"
      echo "Full directory listing:"
      ls -la
      echo ""
      echo "Checking for Dockerfile..."
      if [ -f Dockerfile ]; then
        echo "✅ Dockerfile found at /workspace/Dockerfile"
        ls -lh Dockerfile
        echo "Dockerfile first few lines:"
        head -5 Dockerfile
      else
        echo "❌ Dockerfile NOT found in /workspace root!"
        echo "Searching for Dockerfile..."
        find . -name "Dockerfile" -type f 2>/dev/null
        echo ""
        echo "Directory structure (first 30 items):"
        find . -maxdepth 3 | head -30
        # Try to find and move Dockerfile to root if it's in a subdirectory
        DOCKERFILE_PATH=\$(find . -name "Dockerfile" -type f 2>/dev/null | head -1)
        if [ -n "\$DOCKERFILE_PATH" ] && [ "\$DOCKERFILE_PATH" != "./Dockerfile" ]; then
          echo "Found Dockerfile at: \$DOCKERFILE_PATH"
          echo "Moving to workspace root..."
          mv "\$DOCKERFILE_PATH" ./Dockerfile
          echo "✅ Dockerfile moved to /workspace/Dockerfile"
          ls -lh Dockerfile
        else
          echo "ERROR: Could not find Dockerfile anywhere"
          echo "All files in workspace:"
          find . -type f | head -50
          exit 1
        fi
      fi
      echo ""
      echo "Final verification - Dockerfile at workspace root:"
      ls -lh /workspace/Dockerfile || echo "ERROR: Dockerfile not at /workspace/Dockerfile"
      echo "Files ready for Kaniko. Extraction complete!"
      echo "✅ Extraction complete - creating marker file for Kaniko"
      # Create marker file to signal Kaniko that extraction is complete
      touch /workspace/extraction-complete.marker
      echo "Marker file created at /workspace/extraction-complete.marker"
      # Keep container alive so workspace persists
      while true; do
        sleep 3600
      done
    resources:
      requests:
        memory: "64Mi"
        cpu: "50m"
      limits:
        memory: "256Mi"
        cpu: "200m"
    volumeMounts:
    - name: workspace
      mountPath: /workspace
  volumes:
  - name: workspace
    persistentVolumeClaim:
      claimName: ${WORKSPACE_PVC_NAME}
  - name: docker-config
    secret:
      secretName: ${REGISTRY_SECRET}
      items:
      - key: .dockerconfigjson
        path: config.json
  securityContext:
    seccompProfile:
      type: RuntimeDefault

EOF

print_info "Waiting for pod to be scheduled and running..."
print_info "This may take 2-5 minutes if the cluster is scaling up nodes..."
sleep 5

# Wait for pod to be running (longer timeout for cluster autoscaler)
POD_SCHEDULED=false
for i in {1..120}; do
    PHASE=$(kubectl get pod "$BUILD_POD_NAME" -n "$BUILD_NAMESPACE" -o jsonpath='{.status.phase}' 2>/dev/null || echo "Unknown")
    if [ "$PHASE" = "Running" ]; then
        print_success "Pod is running"
        POD_SCHEDULED=true
        break
    elif [ "$PHASE" = "Failed" ] || [ "$PHASE" = "Error" ]; then
        print_error "Pod failed to start"
        kubectl describe pod "$BUILD_POD_NAME" -n "$BUILD_NAMESPACE" | tail -40
        kubectl delete namespace "$BUILD_NAMESPACE" --ignore-not-found=true
        exit 1
    elif [ "$PHASE" = "Pending" ]; then
        # Check scheduling status
        REASON=$(kubectl get pod "$BUILD_POD_NAME" -n "$BUILD_NAMESPACE" -o jsonpath='{.status.conditions[?(@.type=="PodScheduled")].reason}' 2>/dev/null || echo "")
        if [ "$REASON" = "Unschedulable" ]; then
            if [ $((i % 20)) -eq 0 ]; then
                print_info "Pod waiting for resources (cluster may be scaling up)..."
                kubectl get nodes 2>/dev/null | head -5
            fi
        fi
    fi
    if [ $((i % 10)) -eq 0 ]; then
        echo -n "."
    fi
    sleep 3
done
echo ""

# Final check
if [ "$POD_SCHEDULED" != "true" ]; then
    PHASE=$(kubectl get pod "$BUILD_POD_NAME" -n "$BUILD_NAMESPACE" -o jsonpath='{.status.phase}' 2>/dev/null || echo "Unknown")
    if [ "$PHASE" = "Pending" ]; then
        print_warning "Pod is still pending after 6 minutes"
        print_info "The cluster autoscaler may still be adding nodes"
        print_info "You can check manually with:"
        echo "  kubectl get pod $BUILD_POD_NAME -n $BUILD_NAMESPACE -w"
        echo "  kubectl get nodes"
        echo "  kubectl describe pod $BUILD_POD_NAME -n $BUILD_NAMESPACE"
        print_warning "The script will exit. Please check manually and re-run when nodes are available."
        kubectl delete namespace "$BUILD_NAMESPACE" --ignore-not-found=true
        exit 1
    else
        print_error "Pod failed to start (phase: $PHASE)"
        kubectl describe pod "$BUILD_POD_NAME" -n "$BUILD_NAMESPACE" | tail -40
        kubectl delete namespace "$BUILD_NAMESPACE" --ignore-not-found=true
        exit 1
    fi
fi
echo ""

# Step 5: Copy code to pod
echo "Step 5: Copying code to pod..."
print_info "This may take a few minutes depending on file size..."

# Wait a moment for prepare container to be ready
sleep 3

# Check if prepare container is still running
PREPARE_READY=$(kubectl get pod "$BUILD_POD_NAME" -n "$BUILD_NAMESPACE" -o jsonpath='{.status.containerStatuses[?(@.name=="prepare")].ready}' 2>/dev/null || echo "false")
if [ "$PREPARE_READY" != "true" ]; then
    print_warning "Prepare container not ready yet, checking logs..."
    kubectl logs "$BUILD_POD_NAME" -n "$BUILD_NAMESPACE" -c prepare --tail=20 2>/dev/null || true
    print_info "Waiting a bit more..."
    sleep 5
fi

# Check file size before copying
FILE_SIZE_MB=$(du -m "$TAR_FILE" | cut -f1)
FILE_SIZE_HUMAN=$(du -h "$TAR_FILE" | cut -f1)
print_info "File size: $FILE_SIZE_HUMAN ($FILE_SIZE_MB MB)"

# Warn if file is very large
if [ "$FILE_SIZE_MB" -gt 500 ]; then
    print_warning "File is very large ($FILE_SIZE_MB MB). This may take 5-10 minutes..."
elif [ "$FILE_SIZE_MB" -gt 200 ]; then
    print_warning "File is moderately large ($FILE_SIZE_MB MB). This may take 2-5 minutes..."
fi

# Copy file using tar streaming with completion marker
print_info "Starting file copy using tar streaming with completion marker..."
print_info "This method uses a marker file to ensure the transfer is complete"

# First, remove any existing marker
kubectl exec -n "$BUILD_NAMESPACE" "$BUILD_POD_NAME" -c prepare -- sh -c 'rm -f /workspace/source.tar.gz /workspace/transfer-complete.marker' 2>/dev/null || true

# Stream the file and create a completion marker when done
if cat "$TAR_FILE" | kubectl exec -i -n "$BUILD_NAMESPACE" "$BUILD_POD_NAME" -c prepare -- sh -c 'cd /workspace && cat > source.tar.gz && echo "complete" > transfer-complete.marker && ls -lh source.tar.gz' 2>&1; then
    print_success "Code copied successfully via tar streaming"
    rm -f "$TAR_FILE"  # Clean up
    COPY_SUCCESS=true
    # Verify the marker file exists
    sleep 1
    if kubectl exec -n "$BUILD_NAMESPACE" "$BUILD_POD_NAME" -c prepare -- test -f /workspace/transfer-complete.marker 2>/dev/null; then
        print_success "Transfer completion verified"
    else
        print_warning "Transfer marker not found, but file may still be valid"
    fi
elif kubectl cp "$TAR_FILE" "$BUILD_NAMESPACE/$BUILD_POD_NAME:/workspace/source.tar.gz" -c prepare 2>&1; then
    # Fallback to kubectl cp if tar streaming fails
    print_success "Code copied successfully (using kubectl cp fallback)"
    # Create marker file
    kubectl exec -n "$BUILD_NAMESPACE" "$BUILD_POD_NAME" -c prepare -- sh -c 'echo "complete" > /workspace/transfer-complete.marker' 2>/dev/null || true
    rm -f "$TAR_FILE"  # Clean up
    COPY_SUCCESS=true
else
    COPY_EXIT_CODE=$?
    COPY_SUCCESS=false
fi

if [ "$COPY_SUCCESS" != "true" ]; then
    COPY_EXIT_CODE=${COPY_EXIT_CODE:-1}
    print_error "Failed to copy code (exit code: $COPY_EXIT_CODE)"
    print_info "Exit code 137 usually means process was killed (file too large or timeout)"
    print_info "File size was: $FILE_SIZE_HUMAN ($FILE_SIZE_MB MB)"
    if [ "$FILE_SIZE_MB" -gt 500 ]; then
        print_warning "File is very large. Consider:"
        print_info "1. Excluding more files (check .dockerignore or script exclusions)"
        print_info "2. Using a different deployment method"
    fi
    print_info "Checking pod status..."
    kubectl get pod "$BUILD_POD_NAME" -n "$BUILD_NAMESPACE" -o wide 2>/dev/null || true
    print_info "Checking prepare container logs..."
    kubectl logs "$BUILD_POD_NAME" -n "$BUILD_NAMESPACE" -c prepare --tail=50 2>/dev/null || true
    print_info "Checking pod events..."
    kubectl describe pod "$BUILD_POD_NAME" -n "$BUILD_NAMESPACE" 2>/dev/null | tail -40 || true
    kubectl delete namespace "$BUILD_NAMESPACE" --ignore-not-found=true
    exit 1
fi
echo ""

# Step 6: Wait for prepare container to extract files
echo "Step 6: Waiting for source code extraction..."
print_info "The prepare container will automatically extract files when they're copied..."
sleep 3

# Check if extraction completed and Dockerfile is ready
EXTRACTION_COMPLETE=false
DOCKERFILE_FOUND=false
for i in {1..60}; do
    EXTRACT_LOGS=$(kubectl logs "$BUILD_POD_NAME" -n "$BUILD_NAMESPACE" -c prepare --tail=20 2>/dev/null || echo "")
    if echo "$EXTRACT_LOGS" | grep -q "Dockerfile found\|Files ready for Kaniko"; then
        print_success "Source code extracted and Dockerfile verified"
        EXTRACTION_COMPLETE=true
        DOCKERFILE_FOUND=true
        break
    elif echo "$EXTRACT_LOGS" | grep -q "Source code extracted successfully"; then
        # Extraction done, but Dockerfile check might still be running
        EXTRACTION_COMPLETE=true
        sleep 2
        continue
    elif echo "$EXTRACT_LOGS" | grep -q "ERROR.*Dockerfile\|Dockerfile NOT found"; then
        print_error "Dockerfile not found after extraction"
        kubectl logs "$BUILD_POD_NAME" -n "$BUILD_NAMESPACE" -c prepare --tail=100
        kubectl delete namespace "$BUILD_NAMESPACE" --ignore-not-found=true
        exit 1
    elif echo "$EXTRACT_LOGS" | grep -q "ERROR\|error"; then
        print_error "Extraction failed"
        kubectl logs "$BUILD_POD_NAME" -n "$BUILD_NAMESPACE" -c prepare --tail=50
        kubectl delete namespace "$BUILD_NAMESPACE" --ignore-not-found=true
        exit 1
    fi
    sleep 2
    echo -n "."
done
echo ""

if [ "$EXTRACTION_COMPLETE" = false ]; then
    print_warning "Extraction check timed out, but continuing (prepare container may still be extracting)..."
    print_info "Check logs: kubectl logs $BUILD_POD_NAME -n $BUILD_NAMESPACE -c prepare"
fi

# Verify Dockerfile exists
print_info "Verifying Dockerfile exists before starting Kaniko..."
sleep 2
if kubectl exec -n "$BUILD_NAMESPACE" "$BUILD_POD_NAME" -c prepare -- test -f /workspace/Dockerfile 2>/dev/null; then
    print_success "Dockerfile confirmed"
    
    # Wait for extraction marker
    print_info "Waiting for extraction marker..."
    for i in {1..30}; do
        if kubectl exec -n "$BUILD_NAMESPACE" "$BUILD_POD_NAME" -c prepare -- test -f /workspace/extraction-complete.marker 2>/dev/null; then
            print_success "Extraction marker found"
            break
        fi
        sleep 2
    done
    
    # Create Kaniko Job
    print_info "Creating Kaniko Job for build..."
    cat <<EOF | kubectl apply -f -
apiVersion: batch/v1
kind: Job
metadata:
  name: ${KANIKO_JOB_NAME}
  namespace: ${BUILD_NAMESPACE}
spec:
  ttlSecondsAfterFinished: 3600
  template:
    spec:
      restartPolicy: Never
      containers:
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
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
        volumeMounts:
        - name: workspace
          mountPath: /workspace
        - name: docker-config
          mountPath: /kaniko/.docker
      volumes:
      - name: workspace
        persistentVolumeClaim:
          claimName: ${WORKSPACE_PVC_NAME}
      - name: docker-config
        secret:
          secretName: ${REGISTRY_SECRET}
          items:
          - key: .dockerconfigjson
            path: config.json
EOF
    
    print_success "Kaniko Job created"
    print_warning "Build is now running (this will take 10-20 minutes)..."
else
    print_error "Dockerfile not found! Checking workspace..."
    kubectl exec -n "$BUILD_NAMESPACE" "$BUILD_POD_NAME" -c prepare -- ls -la /workspace 2>/dev/null | head -30
    kubectl delete namespace "$BUILD_NAMESPACE" --ignore-not-found=true
    exit 1
fi

print_info "You can watch progress with:"
echo "  kubectl logs -f job/$KANIKO_JOB_NAME -n $BUILD_NAMESPACE"
echo ""

# Wait for Kaniko Job to start
print_info "Waiting for Kaniko Job to start..."
sleep 5

# Get the pod name from the job
KANIKO_POD_NAME=""
for i in {1..30}; do
    KANIKO_POD_NAME=$(kubectl get pods -n "$BUILD_NAMESPACE" -l job-name="$KANIKO_JOB_NAME" -o jsonpath='{.items[0].metadata.name}' 2>/dev/null || echo "")
    if [ -n "$KANIKO_POD_NAME" ]; then
        print_success "Kaniko pod found: $KANIKO_POD_NAME"
        break
    fi
    sleep 2
done

if [ -z "$KANIKO_POD_NAME" ]; then
    print_warning "Kaniko pod not found yet, but continuing to monitor..."
fi

# Monitor build progress
print_info "Monitoring build progress..."
BUILD_STARTED=false
for i in {1..60}; do
    # Check Kaniko Job pod logs
    if [ -n "$KANIKO_POD_NAME" ]; then
        KANIKO_LOGS=$(kubectl logs "$KANIKO_POD_NAME" -n "$BUILD_NAMESPACE" --tail=30 2>/dev/null || echo "")
    else
        KANIKO_LOGS=$(kubectl logs -l job-name="$KANIKO_JOB_NAME" -n "$BUILD_NAMESPACE" --tail=30 2>/dev/null || echo "")
    fi
    
    if echo "$KANIKO_LOGS" | grep -q "error\|Error\|ERROR\|failed\|Failed"; then
        print_error "Build error detected!"
        if [ -n "$KANIKO_POD_NAME" ]; then
            kubectl logs "$KANIKO_POD_NAME" -n "$BUILD_NAMESPACE" --tail=100
        else
            kubectl logs -l job-name="$KANIKO_JOB_NAME" -n "$BUILD_NAMESPACE" --tail=100
        fi
        kubectl delete namespace "$BUILD_NAMESPACE" --ignore-not-found=true
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
JOB_STATUS=$(kubectl get job "$KANIKO_JOB_NAME" -n "$BUILD_NAMESPACE" -o jsonpath='{.status.conditions[?(@.type=="Complete")].status}' 2>/dev/null || echo "")
if [ "$JOB_STATUS" = "True" ]; then
    print_success "Kaniko build completed successfully!"
elif [ "$(kubectl get job "$KANIKO_JOB_NAME" -n "$BUILD_NAMESPACE" -o jsonpath='{.status.conditions[?(@.type=="Failed")].status}' 2>/dev/null || echo "")" = "True" ]; then
    print_error "Kaniko build failed"
    if [ -n "$KANIKO_POD_NAME" ]; then
        kubectl logs "$KANIKO_POD_NAME" -n "$BUILD_NAMESPACE" --tail=100
    else
        kubectl logs -l job-name="$KANIKO_JOB_NAME" -n "$BUILD_NAMESPACE" --tail=100
    fi
    kubectl delete namespace "$BUILD_NAMESPACE" --ignore-not-found=true
    exit 1
else
    print_warning "Build still in progress. Check status manually:"
    echo "  kubectl logs -f job/$KANIKO_JOB_NAME -n $BUILD_NAMESPACE"
    echo "  kubectl get job $KANIKO_JOB_NAME -n $BUILD_NAMESPACE"
    read -p "Press Enter after build completes, or Ctrl+C to cancel..."
fi
echo ""

# Step 7: Cleanup build namespace
echo "Step 7: Cleaning up build namespace..."
kubectl delete namespace "$BUILD_NAMESPACE" --ignore-not-found=true --wait=false
print_success "Build namespace deleted"
echo ""

# Step 8: Restart deployment
echo "Step 8: Restarting Kubernetes deployment..."
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

# Step 9: Verify
echo "Step 9: Verifying deployment..."
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
echo "  • Temporary build namespace created (baseline security)"
echo "  • Code transferred via kubectl (no SSH needed)"
echo "  • Docker image built with Kaniko"
echo "  • Image pushed to registry"
echo "  • Build namespace cleaned up"
echo "  • Kubernetes deployment restarted"
echo ""
echo "🧪 Testing:"
echo "  • Check logs: kubectl logs -n $NAMESPACE -l app=progrc-backend --tail=100 | grep 'INSTANT SCORING'"
echo "  • Start a compliance assessment to see instant scores"
echo ""
