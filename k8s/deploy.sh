#!/bin/bash

# ProGRC Kubernetes Deployment Script
# This script deploys the ProGRC platform to a Kubernetes cluster

set -e

echo "=========================================="
echo "ProGRC Kubernetes Deployment"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if kubectl is installed
if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}Error: kubectl is not installed${NC}"
    exit 1
fi

# Check if cluster is accessible
if ! kubectl cluster-info &> /dev/null; then
    echo -e "${RED}Error: Cannot connect to Kubernetes cluster${NC}"
    echo "Please ensure your cluster is running and kubectl is configured"
    exit 1
fi

echo -e "${GREEN}✓ Kubernetes cluster is accessible${NC}"
echo ""

# Step 1: Create namespace
echo "Step 1: Creating namespace..."
kubectl apply -f k8s/base/namespace.yaml
echo -e "${GREEN}✓ Namespace created${NC}"
echo ""

# Step 2: Create ConfigMap
echo "Step 2: Creating ConfigMap..."
kubectl apply -f k8s/base/configmap.yaml
echo -e "${GREEN}✓ ConfigMap created${NC}"
echo ""

# Step 3: Create Secrets
echo "Step 3: Creating Secrets..."
echo -e "${YELLOW}⚠️  WARNING: Using default secrets. Change them in k8s/base/secret.yaml for production!${NC}"
kubectl apply -f k8s/base/secret.yaml
echo -e "${GREEN}✓ Secrets created${NC}"
echo ""

# Step 4: Deploy PostgreSQL
echo "Step 4: Deploying PostgreSQL..."
kubectl apply -f k8s/services/postgres.yaml
echo -e "${GREEN}✓ PostgreSQL deployment started${NC}"
echo "Waiting for PostgreSQL to be ready..."
kubectl wait --for=condition=ready pod -l app=postgres -n progrc --timeout=120s || true
echo ""

# Step 5: Deploy Redis
echo "Step 5: Deploying Redis..."
kubectl apply -f k8s/services/redis.yaml
echo -e "${GREEN}✓ Redis deployment started${NC}"
echo "Waiting for Redis to be ready..."
kubectl wait --for=condition=ready pod -l app=redis -n progrc --timeout=120s || true
echo ""

# Step 6: Deploy Backend
echo "Step 6: Deploying ProGRC Backend..."
echo -e "${YELLOW}⚠️  NOTE: Ensure you have built and loaded the Docker image:${NC}"
echo "   docker build -f Dockerfile.simple -t progrc-backend:latest ."
echo "   minikube image load progrc-backend:latest  # if using minikube"
echo ""
kubectl apply -f k8s/services/backend.yaml
echo -e "${GREEN}✓ Backend deployment started${NC}"
echo ""

# Step 7: Deploy Metabase
echo "Step 7: Deploying Metabase..."
kubectl apply -f k8s/services/metabase.yaml
echo -e "${GREEN}✓ Metabase deployment started${NC}"
echo ""

# Step 8: Deploy Ingress (optional)
read -p "Deploy Ingress? (requires ingress controller) [y/N]: " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Step 8: Deploying Ingress..."
    kubectl apply -f k8s/ingress/ingress.yaml
    echo -e "${GREEN}✓ Ingress created${NC}"
    echo ""
fi

# Wait for deployments
echo "Waiting for all deployments to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/progrc-backend -n progrc || true
kubectl wait --for=condition=available --timeout=300s deployment/metabase -n progrc || true

echo ""
echo "=========================================="
echo -e "${GREEN}Deployment Complete!${NC}"
echo "=========================================="
echo ""
echo "Check status:"
echo "  kubectl get pods -n progrc"
echo ""
echo "View logs:"
echo "  kubectl logs -n progrc -l app=progrc-backend -f"
echo ""
echo "Port forward (for local access):"
echo "  kubectl port-forward -n progrc svc/progrc-backend 3001:3000"
echo "  kubectl port-forward -n progrc svc/metabase 3002:3000"
echo ""



