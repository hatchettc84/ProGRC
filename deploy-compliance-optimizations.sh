#!/bin/bash

set -e

echo "🚀 Deploying Compliance Scoring Optimizations to DigitalOcean"
echo "=============================================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
REGISTRY="registry.digitalocean.com"
REGISTRY_NAME="progrc"
IMAGE_NAME="progrc-backend"
IMAGE_TAG="latest"
FULL_IMAGE="${REGISTRY}/${REGISTRY_NAME}/${IMAGE_NAME}:${IMAGE_TAG}"
NAMESPACE="progrc-dev"
DEPLOYMENT="progrc-backend"

echo -e "${YELLOW}Step 1: Building TypeScript code...${NC}"
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

echo -e "\n${YELLOW}Step 2: Building Docker image for linux/amd64...${NC}"
docker buildx build --platform linux/amd64 -t ${FULL_IMAGE} -f Dockerfile .
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Docker image built successfully${NC}"
else
    echo -e "${RED}❌ Docker build failed${NC}"
    exit 1
fi

echo -e "\n${YELLOW}Step 3: Logging into DigitalOcean Container Registry...${NC}"
doctl registry login || docker login ${REGISTRY}
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Logged into registry${NC}"
else
    echo -e "${RED}❌ Registry login failed${NC}"
    exit 1
fi

echo -e "\n${YELLOW}Step 4: Pushing Docker image to registry...${NC}"
docker push ${FULL_IMAGE}
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Image pushed successfully${NC}"
else
    echo -e "${RED}❌ Image push failed${NC}"
    exit 1
fi

echo -e "\n${YELLOW}Step 5: Restarting Kubernetes deployment...${NC}"
kubectl rollout restart deployment/${DEPLOYMENT} -n ${NAMESPACE}
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Deployment restarted${NC}"
else
    echo -e "${RED}❌ Deployment restart failed${NC}"
    exit 1
fi

echo -e "\n${YELLOW}Step 6: Waiting for rollout to complete...${NC}"
kubectl rollout status deployment/${DEPLOYMENT} -n ${NAMESPACE} --timeout=5m
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Rollout completed successfully${NC}"
else
    echo -e "${RED}❌ Rollout failed or timed out${NC}"
    exit 1
fi

echo -e "\n${YELLOW}Step 7: Verifying deployment...${NC}"
PODS=$(kubectl get pods -n ${NAMESPACE} -l app=${DEPLOYMENT} --no-headers 2>&1 | awk '{print $1, $3, $2}' | head -5)
if [ -n "$PODS" ]; then
    echo -e "${GREEN}✅ Pods status:${NC}"
    echo "$PODS"
else
    echo -e "${RED}❌ No pods found${NC}"
    exit 1
fi

echo -e "\n${YELLOW}Step 8: Checking logs for instant scoring...${NC}"
POD_NAME=$(kubectl get pods -n ${NAMESPACE} -l app=${DEPLOYMENT} --no-headers 2>&1 | head -1 | awk '{print $1}')
if [ -n "$POD_NAME" ]; then
    echo -e "${GREEN}Checking logs from pod: ${POD_NAME}${NC}"
    kubectl logs -n ${NAMESPACE} ${POD_NAME} --tail=50 | grep -i "instant scoring\|compliance\|error" || echo "No instant scoring logs found yet (this is normal if no requests have been made)"
else
    echo -e "${YELLOW}⚠️  Could not get pod name${NC}"
fi

echo -e "\n${GREEN}=============================================================="
echo -e "✅ Deployment Complete!"
echo -e "==============================================================${NC}"
echo ""
echo "📋 Summary:"
echo "  • Backend built successfully"
echo "  • Docker image built for linux/amd64"
echo "  • Image pushed to ${FULL_IMAGE}"
echo "  • Deployment restarted in namespace ${NAMESPACE}"
echo ""
echo "🧪 Testing:"
echo "  • Start a compliance assessment to see instant scores"
echo "  • Check logs: kubectl logs -n ${NAMESPACE} -l app=${DEPLOYMENT} | grep 'INSTANT SCORING'"
echo ""
echo "📚 Documentation:"
echo "  • See COMPLIANCE_SCORING_OPTIMIZATIONS.md for details"
echo "  • See DEPLOY_COMPLIANCE_OPTIMIZATIONS.md for deployment guide"
echo ""


