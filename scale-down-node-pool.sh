#!/bin/bash
# Scale down Kubernetes node pool to reduce costs
# This will automatically remove unused nodes

set -e

echo "=========================================="
echo "Scale Down Node Pool"
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
print_info "Getting cluster information..."

if ! command -v doctl &> /dev/null; then
    print_error "doctl is not installed or not in PATH"
    print_info "Install doctl: https://docs.digitalocean.com/reference/doctl/how-to/install/"
    exit 1
fi

# Get cluster ID
CLUSTER_ID=$(doctl kubernetes cluster list --format ID,Name --no-header | grep "$CLUSTER_NAME" | awk '{print $1}' | head -1)

if [ -z "$CLUSTER_ID" ]; then
    print_error "Cluster '$CLUSTER_NAME' not found"
    exit 1
fi

print_success "Found cluster: $CLUSTER_NAME (ID: $CLUSTER_ID)"

# Get node pool ID
print_info "Getting node pool information..."
NODE_POOL_ID=$(doctl kubernetes cluster node-pool list "$CLUSTER_ID" --format ID,Name,Count --no-header | head -1 | awk '{print $1}')

if [ -z "$NODE_POOL_ID" ]; then
    print_error "Node pool not found"
    exit 1
fi

print_success "Found node pool (ID: $NODE_POOL_ID)"

# Get current node count
CURRENT_COUNT=$(doctl kubernetes cluster node-pool list "$CLUSTER_ID" --format ID,Name,Count --no-header | head -1 | awk '{print $3}')
print_info "Current node count: $CURRENT_COUNT"

# Ask for target count
read -p "Enter target node count (minimum 2, recommended 2-3): " TARGET_COUNT

if ! [[ "$TARGET_COUNT" =~ ^[0-9]+$ ]] || [ "$TARGET_COUNT" -lt 2 ]; then
    print_error "Invalid count. Must be at least 2."
    exit 1
fi

if [ "$TARGET_COUNT" -ge "$CURRENT_COUNT" ]; then
    print_warning "Target count ($TARGET_COUNT) is greater than or equal to current count ($CURRENT_COUNT)"
    print_info "No scaling needed."
    exit 0
fi

print_warning "This will scale down from $CURRENT_COUNT to $TARGET_COUNT nodes"
print_warning "Pods will be rescheduled to remaining nodes"
read -p "Continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    print_info "Cancelled."
    exit 0
fi

# Scale down
print_info "Scaling down node pool..."
doctl kubernetes cluster node-pool update "$CLUSTER_ID" "$NODE_POOL_ID" --count "$TARGET_COUNT"

print_success "Node pool scaling initiated"
print_info "This may take 5-10 minutes to complete"
print_info "Monitor with: kubectl get nodes"
