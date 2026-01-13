#!/bin/bash
# Prevent automatic droplet creation by setting fixed node count
# This disables cluster autoscaler from creating new nodes

set -e

echo "=========================================="
echo "Prevent Automatic Droplet Creation"
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

CLUSTER_NAME="progrc-dev-cluster"
TARGET_COUNT=2

print_info "To prevent automatic droplet creation, you need to:"
echo ""
print_info "1. Set node pool to fixed count (2 nodes)"
print_info "2. Disable or limit cluster autoscaler"
echo ""

if ! command -v doctl &> /dev/null; then
    print_warning "doctl not available - use DigitalOcean console method"
    echo ""
    print_info "Method 1: DigitalOcean Console (Recommended)"
    echo "  1. Go to: https://cloud.digitalocean.com/kubernetes/clusters"
    echo "  2. Click your cluster → 'Node Pools' tab"
    echo "  3. Edit node pool → Set count to 2"
    echo "  4. Look for 'Autoscaling' settings and disable it"
    echo "  5. Save changes"
    echo ""
    print_info "Method 2: Set minimum/maximum to same value (2)"
    echo "  This prevents autoscaler from creating new nodes"
    exit 0
fi

# Get cluster ID
print_info "Finding cluster..."
CLUSTER_ID=$(doctl kubernetes cluster list --format ID,Name --no-header 2>/dev/null | grep "$CLUSTER_NAME" | awk '{print $1}' | head -1)

if [ -z "$CLUSTER_ID" ]; then
    print_error "Cluster not found via doctl"
    print_info "Use DigitalOcean console method above"
    exit 1
fi

print_success "Found cluster: $CLUSTER_NAME"

# Get node pool info
NODE_POOL_INFO=$(doctl kubernetes cluster node-pool list "$CLUSTER_ID" --format ID,Name,Count,MinNodes,MaxNodes --no-header 2>/dev/null | head -1)

if [ -z "$NODE_POOL_INFO" ]; then
    print_error "Node pool not found"
    exit 1
fi

NODE_POOL_ID=$(echo "$NODE_POOL_INFO" | awk '{print $1}')
CURRENT_COUNT=$(echo "$NODE_POOL_INFO" | awk '{print $3}')
MIN_NODES=$(echo "$NODE_POOL_INFO" | awk '{print $4}')
MAX_NODES=$(echo "$NODE_POOL_INFO" | awk '{print $5}')

print_info "Current configuration:"
echo "  Node Pool ID: $NODE_POOL_ID"
echo "  Current Count: $CURRENT_COUNT"
echo "  Min Nodes: ${MIN_NODES:-not set}"
echo "  Max Nodes: ${MAX_NODES:-not set}"
echo ""

# Set fixed count and disable autoscaling
print_info "Setting fixed node count to 2 and disabling autoscaling..."
if doctl kubernetes cluster node-pool update "$CLUSTER_ID" "$NODE_POOL_ID" \
    --count 2 \
    --min-nodes 2 \
    --max-nodes 2 2>/dev/null; then
    print_success "Node pool configured to prevent auto-scaling"
    print_info "Min/Max nodes set to 2 - no new droplets will be created"
else
    print_error "Failed to update node pool"
    print_info "Use DigitalOcean console method instead"
    exit 1
fi
