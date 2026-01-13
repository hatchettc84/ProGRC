#!/bin/bash

# Multi-Tenant Configuration Fixes Deployment Script
# This script applies all critical fixes for production-ready multi-tenant configuration

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
NAMESPACE="progrc-dev"
TIMEOUT=300  # 5 minutes timeout for deployments

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Multi-Tenant Configuration Fixes${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Function to print status
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Check prerequisites
echo -e "${BLUE}Step 0: Checking Prerequisites${NC}"
echo "----------------------------------------"

if ! command -v kubectl &> /dev/null; then
    print_error "kubectl is not installed. Please install kubectl first."
    exit 1
fi
print_status "kubectl found"

# Check if kubectl can connect to cluster
if ! kubectl cluster-info &> /dev/null; then
    print_error "Cannot connect to Kubernetes cluster. Please check your kubeconfig."
    exit 1
fi
print_status "Connected to Kubernetes cluster"

# Check if namespace exists
if ! kubectl get namespace "$NAMESPACE" &> /dev/null; then
    print_error "Namespace '$NAMESPACE' does not exist. Please create it first."
    exit 1
fi
print_status "Namespace '$NAMESPACE' exists"

echo ""

# Step 1: Apply ConfigMap changes
echo -e "${BLUE}Step 1: Applying ConfigMap Changes${NC}"
echo "----------------------------------------"
print_info "Updating security settings (ENABLE_PERMISSION_RESTRICTIONS, etc.)..."

if kubectl apply -f k8s/base/configmap.yaml; then
    print_status "ConfigMap updated successfully"
    print_warning "Backend pods will restart to pick up new environment variables"
else
    print_error "Failed to apply ConfigMap"
    exit 1
fi
echo ""

# Step 2: Apply backend deployment changes
echo -e "${BLUE}Step 2: Applying Backend Deployment Changes${NC}"
echo "----------------------------------------"
print_info "Scaling backend from 1 to 3 replicas..."
print_info "Changing backend service from LoadBalancer to ClusterIP..."

if kubectl apply -f k8s/services/backend.yaml; then
    print_status "Backend deployment updated successfully"
    print_info "Deployment will scale to 3 replicas (this may take a few minutes)"
else
    print_error "Failed to apply backend deployment"
    exit 1
fi
echo ""

# Step 3: Wait for backend pods to be ready
echo -e "${BLUE}Step 3: Waiting for Backend Pods${NC}"
echo "----------------------------------------"
print_info "Waiting for backend pods to be ready (timeout: ${TIMEOUT}s)..."

if kubectl wait --for=condition=available --timeout=${TIMEOUT}s deployment/progrc-backend -n "$NAMESPACE" 2>/dev/null; then
    print_status "Backend pods are ready"
else
    print_warning "Backend pods may still be starting. Check status with: kubectl get pods -n $NAMESPACE -l app=progrc-backend"
fi
echo ""

# Step 4: Create policies directory if it doesn't exist
echo -e "${BLUE}Step 4: Creating Policies Directory${NC}"
echo "----------------------------------------"
mkdir -p k8s/policies
print_status "Policies directory ready"
echo ""

# Step 5: Apply Pod Disruption Budgets
echo -e "${BLUE}Step 5: Applying Pod Disruption Budgets${NC}"
echo "----------------------------------------"
if [ -f "k8s/policies/pod-disruption-budget.yaml" ]; then
    if kubectl apply -f k8s/policies/pod-disruption-budget.yaml; then
        print_status "Pod Disruption Budgets applied successfully"
    else
        print_error "Failed to apply Pod Disruption Budgets"
        exit 1
    fi
else
    print_error "Pod Disruption Budget file not found: k8s/policies/pod-disruption-budget.yaml"
    exit 1
fi
echo ""

# Step 6: Apply Network Policies
echo -e "${BLUE}Step 6: Applying Network Policies${NC}"
echo "----------------------------------------"
if [ -f "k8s/policies/network-policy.yaml" ]; then
    if kubectl apply -f k8s/policies/network-policy.yaml; then
        print_status "Network Policies applied successfully"
        print_warning "Network policies are restrictive. If you encounter connectivity issues, check the policy rules."
    else
        print_error "Failed to apply Network Policies"
        exit 1
    fi
else
    print_error "Network Policy file not found: k8s/policies/network-policy.yaml"
    exit 1
fi
echo ""

# Step 7: Apply Resource Quotas
echo -e "${BLUE}Step 7: Applying Resource Quotas${NC}"
echo "----------------------------------------"
if [ -f "k8s/policies/resource-quota.yaml" ]; then
    if kubectl apply -f k8s/policies/resource-quota.yaml; then
        print_status "Resource Quotas applied successfully"
    else
        print_error "Failed to apply Resource Quotas"
        exit 1
    fi
else
    print_error "Resource Quota file not found: k8s/policies/resource-quota.yaml"
    exit 1
fi
echo ""

# Step 8: Verification
echo -e "${BLUE}Step 8: Verification${NC}"
echo "----------------------------------------"

# Check backend replicas
echo -e "\n${BLUE}Backend Deployment Status:${NC}"
BACKEND_REPLICAS=$(kubectl get deployment progrc-backend -n "$NAMESPACE" -o jsonpath='{.spec.replicas}' 2>/dev/null || echo "0")
BACKEND_READY=$(kubectl get deployment progrc-backend -n "$NAMESPACE" -o jsonpath='{.status.readyReplicas}' 2>/dev/null || echo "0")
echo "  Desired Replicas: $BACKEND_REPLICAS"
echo "  Ready Replicas: $BACKEND_READY"

if [ "$BACKEND_REPLICAS" = "3" ] && [ "$BACKEND_READY" = "3" ]; then
    print_status "Backend deployment: 3/3 replicas ready"
elif [ "$BACKEND_REPLICAS" = "3" ]; then
    print_warning "Backend deployment: $BACKEND_READY/3 replicas ready (still scaling)"
else
    print_error "Backend deployment: Expected 3 replicas, got $BACKEND_REPLICAS"
fi

# Check service type
echo -e "\n${BLUE}Backend Service Type:${NC}"
SERVICE_TYPE=$(kubectl get svc progrc-backend -n "$NAMESPACE" -o jsonpath='{.spec.type}' 2>/dev/null || echo "unknown")
echo "  Service Type: $SERVICE_TYPE"
if [ "$SERVICE_TYPE" = "ClusterIP" ]; then
    print_status "Backend service is ClusterIP (using Ingress)"
else
    print_warning "Backend service type is $SERVICE_TYPE (expected ClusterIP)"
fi

# Check Pod Disruption Budgets
echo -e "\n${BLUE}Pod Disruption Budgets:${NC}"
if kubectl get pdb -n "$NAMESPACE" &> /dev/null; then
    kubectl get pdb -n "$NAMESPACE"
    print_status "Pod Disruption Budgets are active"
else
    print_warning "No Pod Disruption Budgets found"
fi

# Check Network Policies
echo -e "\n${BLUE}Network Policies:${NC}"
if kubectl get networkpolicies -n "$NAMESPACE" &> /dev/null; then
    NETPOL_COUNT=$(kubectl get networkpolicies -n "$NAMESPACE" --no-headers 2>/dev/null | wc -l | tr -d ' ')
    if [ "$NETPOL_COUNT" -gt 0 ]; then
        kubectl get networkpolicies -n "$NAMESPACE"
        print_status "Network Policies are active ($NETPOL_COUNT found)"
    else
        print_warning "No Network Policies found"
    fi
else
    print_warning "Network Policies not found or not supported"
fi

# Check Resource Quotas
echo -e "\n${BLUE}Resource Quotas:${NC}"
if kubectl get resourcequota -n "$NAMESPACE" &> /dev/null; then
    QUOTA_COUNT=$(kubectl get resourcequota -n "$NAMESPACE" --no-headers 2>/dev/null | wc -l | tr -d ' ')
    if [ "$QUOTA_COUNT" -gt 0 ]; then
        kubectl get resourcequota -n "$NAMESPACE"
        print_status "Resource Quotas are active ($QUOTA_COUNT found)"
        echo ""
        print_info "Resource Quota Details:"
        kubectl describe resourcequota -n "$NAMESPACE" | grep -A 20 "Resource Quotas:"
    else
        print_warning "No Resource Quotas found"
    fi
else
    print_warning "Resource Quotas not found"
fi

# Check ConfigMap
echo -e "\n${BLUE}ConfigMap Security Settings:${NC}"
ENABLE_PERM=$(kubectl get configmap progrc-config -n "$NAMESPACE" -o jsonpath='{.data.ENABLE_PERMISSION_RESTRICTIONS}' 2>/dev/null || echo "unknown")
ALLOW_UNKNOWN=$(kubectl get configmap progrc-config -n "$NAMESPACE" -o jsonpath='{.data.ALLOW_UNKNOWN_API_PATHS}' 2>/dev/null || echo "unknown")
ALLOW_EMPTY=$(kubectl get configmap progrc-config -n "$NAMESPACE" -o jsonpath='{.data.ALLOW_EMPTY_PERMISSIONS}' 2>/dev/null || echo "unknown")

echo "  ENABLE_PERMISSION_RESTRICTIONS: $ENABLE_PERM"
echo "  ALLOW_UNKNOWN_API_PATHS: $ALLOW_UNKNOWN"
echo "  ALLOW_EMPTY_PERMISSIONS: $ALLOW_EMPTY"

if [ "$ENABLE_PERM" = "true" ] && [ "$ALLOW_UNKNOWN" = "false" ] && [ "$ALLOW_EMPTY" = "false" ]; then
    print_status "Security settings are correctly configured"
else
    print_warning "Security settings may not be correctly configured"
fi

echo ""

# Step 9: Summary
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}Deployment Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${GREEN}✅ Applied Changes:${NC}"
echo "  1. Security restrictions enabled"
echo "  2. Backend replicas: 1 → 3"
echo "  3. Backend service: LoadBalancer → ClusterIP"
echo "  4. Pod Disruption Budgets added"
echo "  5. Network Policies added"
echo "  6. Resource Quotas added"
echo ""
echo -e "${YELLOW}⚠️  Important Notes:${NC}"
echo "  • Backend is now accessible via Ingress at /api/v1/*"
echo "  • Security restrictions are enabled - test permissions"
echo "  • Network policies are restrictive - check connectivity"
echo "  • Backend pods may still be starting (check with kubectl get pods)"
echo ""
echo -e "${BLUE}📊 Cost Savings:${NC}"
echo "  • LoadBalancer reduction: ~\$24/month"
echo ""
echo -e "${BLUE}🔍 Next Steps:${NC}"
echo "  1. Monitor backend pods: kubectl get pods -n $NAMESPACE -l app=progrc-backend -w"
echo "  2. Check logs: kubectl logs -n $NAMESPACE -l app=progrc-backend -f"
echo "  3. Test API: curl http://143.244.221.38/api/v1/health"
echo "  4. Review DEPLOYMENT_FIXES_APPLIED.md for detailed information"
echo ""
echo -e "${GREEN}Deployment complete!${NC}"
echo ""
