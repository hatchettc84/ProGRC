#!/bin/bash
# Scale down Kubernetes node pool to 2 nodes (non-interactive)
# This will automatically remove the 2 newest nodes

set -e

echo "=========================================="
echo "Scale Down Node Pool to 2 Nodes"
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

# Get cluster ID
CLUSTER_NAME="progrc-dev-cluster"
TARGET_COUNT=2

print_info "Getting cluster information..."

if ! command -v doctl &> /dev/null; then
    print_error "doctl is not installed or not in PATH"
    print_info "Please run this from a machine with doctl installed"
    print_info "Or use DigitalOcean console: https://cloud.digitalocean.com/kubernetes/clusters"
    exit 1
fi

# Get cluster ID
print_info "Finding cluster: $CLUSTER_NAME"
CLUSTER_ID=$(doctl kubernetes cluster list --format ID,Name --no-header 2>/dev/null | grep "$CLUSTER_NAME" | awk '{print $1}' | head -1)

if [ -z "$CLUSTER_ID" ]; then
    print_error "Cluster '$CLUSTER_NAME' not found"
    print_info "Available clusters:"
    doctl kubernetes cluster list --format ID,Name 2>/dev/null || true
    exit 1
fi

print_success "Found cluster: $CLUSTER_NAME (ID: $CLUSTER_ID)"

# Get node pool ID
print_info "Getting node pool information..."
NODE_POOL_INFO=$(doctl kubernetes cluster node-pool list "$CLUSTER_ID" --format ID,Name,Count --no-header 2>/dev/null | head -1)

if [ -z "$NODE_POOL_INFO" ]; then
    print_error "Node pool not found"
    exit 1
fi

NODE_POOL_ID=$(echo "$NODE_POOL_INFO" | awk '{print $1}')
CURRENT_COUNT=$(echo "$NODE_POOL_INFO" | awk '{print $3}')

print_success "Found node pool (ID: $NODE_POOL_ID)"
print_info "Current node count: $CURRENT_COUNT"
print_info "Target node count: $TARGET_COUNT"

if [ "$CURRENT_COUNT" -le "$TARGET_COUNT" ]; then
    print_warning "Current count ($CURRENT_COUNT) is already at or below target ($TARGET_COUNT)"
    print_info "No scaling needed."
    exit 0
fi

print_warning "This will scale down from $CURRENT_COUNT to $TARGET_COUNT nodes"
print_warning "Pods will be rescheduled to remaining nodes"
print_info "The 2 newest nodes (knv0q and knvdj) will be removed"
echo ""

# Scale down
print_info "Scaling down node pool..."
if doctl kubernetes cluster node-pool update "$CLUSTER_ID" "$NODE_POOL_ID" --count "$TARGET_COUNT" 2>/dev/null; then
    print_success "Node pool scaling initiated"
    print_info "This may take 5-10 minutes to complete"
    print_info "Monitor with: kubectl get nodes"
    print_info "The cluster autoscaler will remove the unused nodes"
else
    print_error "Failed to scale node pool"
    print_info "You may need to:"
    print_info "1. Check doctl authentication: doctl auth init"
    print_info "2. Or use DigitalOcean console: https://cloud.digitalocean.com/kubernetes/clusters"
    exit 1
fi
