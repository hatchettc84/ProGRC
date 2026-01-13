#!/bin/bash

# Deploy ProGRC to DigitalOcean Kubernetes Cluster
# This script uses the existing progrc-dev namespace and secrets

set -e

NAMESPACE="progrc-dev"
K8S_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=========================================="
echo "ProGRC DigitalOcean Kubernetes Deployment"
echo "=========================================="
echo ""
echo "Namespace: $NAMESPACE"
echo "K8s Directory: $K8S_DIR"
echo ""

# 1. Verify cluster access
echo "1. Verifying cluster access..."
kubectl cluster-info > /dev/null || { echo "❌ Error: Cannot connect to cluster"; exit 1; }
echo "✓ Cluster connected"
echo ""

# 2. Verify namespace exists
echo "2. Verifying namespace..."
if ! kubectl get namespace "$NAMESPACE" > /dev/null 2>&1; then
    echo "Creating namespace $NAMESPACE..."
    kubectl apply -f "$K8S_DIR/base/namespace.yaml"
else
    echo "✓ Namespace $NAMESPACE exists"
fi
echo ""

# 3. Verify secrets exist
echo "3. Verifying secrets..."
if ! kubectl get secret progrc-bff-dev-secrets -n "$NAMESPACE" > /dev/null 2>&1; then
    echo "⚠️  WARNING: Secret 'progrc-bff-dev-secrets' not found!"
    echo "   Please create it with: kubectl create secret generic progrc-bff-dev-secrets -n $NAMESPACE --from-literal=..."
    exit 1
fi
if ! kubectl get secret progrc-bff-db-credentials -n "$NAMESPACE" > /dev/null 2>&1; then
    echo "⚠️  WARNING: Secret 'progrc-bff-db-credentials' not found!"
    echo "   Please create it with: kubectl create secret generic progrc-bff-db-credentials -n $NAMESPACE --from-literal=..."
    exit 1
fi
echo "✓ Secrets verified"
echo ""

# 4. Create/Update ConfigMap
echo "4. Creating/Updating ConfigMap..."
kubectl apply -f "$K8S_DIR/base/configmap.yaml"
echo "✓ ConfigMap created/updated"
echo ""

# 5. Deploy PostgreSQL (if not using managed database)
read -p "Deploy PostgreSQL in cluster? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "5. Deploying PostgreSQL..."
    kubectl apply -f "$K8S_DIR/services/postgres.yaml"
    echo "✓ PostgreSQL deployment started"
    echo "Waiting for PostgreSQL to be ready..."
    kubectl wait --for=condition=ready pod -l app=postgres -n "$NAMESPACE" --timeout=300s || echo "⚠️  PostgreSQL not ready yet"
    echo ""
else
    echo "5. Skipping PostgreSQL deployment (using managed database)"
    echo ""
fi

# 6. Deploy Redis
echo "6. Deploying Redis..."
kubectl apply -f "$K8S_DIR/services/redis.yaml"
echo "✓ Redis deployment started"
echo "Waiting for Redis to be ready..."
kubectl wait --for=condition=ready pod -l app=redis -n "$NAMESPACE" --timeout=120s || echo "⚠️  Redis not ready yet"
echo ""

# 7. Deploy Backend
echo "7. Deploying Backend..."
echo "⚠️  NOTE: Ensure Docker image is built and available:"
echo "   - Image name: progrc-backend:latest"
echo "   - Or update image in k8s/services/backend.yaml"
echo ""
read -p "Continue with backend deployment? (Y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Nn]$ ]]; then
    kubectl apply -f "$K8S_DIR/services/backend.yaml"
    echo "✓ Backend deployment started"
    echo ""
else
    echo "Skipping backend deployment"
    echo ""
fi

# 8. Deploy Metabase
read -p "Deploy Metabase? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "8. Deploying Metabase..."
    kubectl apply -f "$K8S_DIR/services/metabase.yaml"
    echo "✓ Metabase deployment started"
    echo ""
else
    echo "8. Skipping Metabase deployment"
    echo ""
fi

# 9. Deploy Ingress (optional)
read -p "Deploy Ingress? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "9. Deploying Ingress..."
    kubectl apply -f "$K8S_DIR/ingress/ingress.yaml"
    echo "✓ Ingress deployment started"
    echo ""
else
    echo "9. Skipping Ingress deployment"
    echo ""
fi

# 10. Check status
echo "10. Checking deployment status..."
sleep 5
echo ""
echo "Pods:"
kubectl get pods -n "$NAMESPACE"
echo ""
echo "Services:"
kubectl get services -n "$NAMESPACE"
echo ""
echo "Persistent Volume Claims:"
kubectl get pvc -n "$NAMESPACE"
echo ""

echo "=========================================="
echo "Deployment Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Check pod status: kubectl get pods -n $NAMESPACE"
echo "2. View logs: kubectl logs -n $NAMESPACE -l app=progrc-backend -f"
echo "3. Get service endpoints: kubectl get svc -n $NAMESPACE"
echo "4. Port forward for testing: kubectl port-forward -n $NAMESPACE svc/progrc-backend 3001:3000"
echo ""



