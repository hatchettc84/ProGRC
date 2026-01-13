#!/bin/bash
# Script to identify and remove unnecessary droplets
# Only removes standalone droplets, NOT Kubernetes nodes

set -e

echo "=========================================="
echo "Droplet Cleanup Analysis"
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

echo "Step 1: Identifying Kubernetes cluster nodes..."
K8S_NODES=$(kubectl get nodes -o jsonpath='{.items[*].status.addresses[?(@.type=="ExternalIP")].address}')
echo "Kubernetes nodes (DO NOT DELETE):"
for node in $K8S_NODES; do
    echo "  - $node"
done
echo ""

echo "Step 2: Identifying AI Droplet..."
AI_DROPLET_IP="64.225.20.65"
echo "AI Droplet (DO NOT DELETE): $AI_DROPLET_IP"
echo ""

echo "Step 3: Checking for standalone droplets..."
print_warning "To list all droplets, run:"
echo "  doctl compute droplet list --format ID,Name,PublicIPv4,Status,Tags"
echo ""

print_info "Droplets to KEEP:"
echo "  ✅ Kubernetes cluster nodes (managed by DOKS)"
echo "  ✅ AI Droplet: $AI_DROPLET_IP (progrc-ai-droplet)"
echo ""

print_warning "Droplets that MAY be removed:"
echo "  ⚠️  Any standalone droplets not listed above"
echo "  ⚠️  Droplets with no tags or purpose"
echo ""

print_info "To safely remove a droplet:"
echo "  1. Verify it's not a Kubernetes node"
echo "  2. Verify it's not the AI droplet"
echo "  3. Check if it has any running services"
echo "  4. Delete with: doctl compute droplet delete <DROPLET_ID>"
echo ""

print_error "WARNING: Do NOT delete:"
echo "  ❌ Kubernetes cluster nodes (they're managed automatically)"
echo "  ❌ AI Droplet ($AI_DROPLET_IP)"
echo ""
