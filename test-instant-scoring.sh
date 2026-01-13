#!/bin/bash

# Test Script for Instant Scoring Fix
# This script helps verify that instant scoring is working correctly

set -e

echo "=========================================="
echo "Testing Instant Scoring Fix"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check Pod Status
echo "Step 1: Checking backend pods..."
PODS=$(kubectl get pods -n progrc-dev -l app=progrc-backend --no-headers | grep Running | wc -l)
if [ "$PODS" -ge 1 ]; then
    echo -e "${GREEN}✅ Backend pods running: $PODS${NC}"
else
    echo -e "${RED}❌ No backend pods running${NC}"
    exit 1
fi
echo ""

# Step 2: Check Ollama Configuration
echo "Step 2: Checking Ollama configuration..."
OLLAMA_CONFIG=$(kubectl exec -n progrc-dev deployment/progrc-backend -- env | grep -E "USE_OLLAMA|OLLAMA_BASE_URL" | head -2)
if echo "$OLLAMA_CONFIG" | grep -q "USE_OLLAMA=true"; then
    echo -e "${GREEN}✅ Ollama enabled${NC}"
    echo "$OLLAMA_CONFIG" | while read line; do echo "   $line"; done
else
    echo -e "${YELLOW}⚠️  Ollama not configured${NC}"
fi
echo ""

# Step 3: Test Ollama Connectivity
echo "Step 3: Testing Ollama connectivity from cluster..."
OLLAMA_TEST=$(kubectl run test-ollama-$(date +%s) --image=curlimages/curl --rm -i --restart=Never -- curl -s -m 5 http://64.225.20.65:11434/api/tags 2>&1 | grep -o '"name":"[^"]*"' | head -2)
if [ -n "$OLLAMA_TEST" ]; then
    echo -e "${GREEN}✅ Ollama accessible from cluster${NC}"
    echo "$OLLAMA_TEST" | while read line; do echo "   $line"; done
else
    echo -e "${YELLOW}⚠️  Could not verify Ollama connectivity${NC}"
fi
echo ""

# Step 4: Check for Instant Scoring Code
echo "Step 4: Checking for instant scoring code in logs..."
INSTANT_SCORING_LOGS=$(kubectl logs -n progrc-dev -l app=progrc-backend --tail=1000 | grep -c "INSTANT SCORING" || echo "0")
if [ "$INSTANT_SCORING_LOGS" -gt 0 ]; then
    echo -e "${GREEN}✅ Found $INSTANT_SCORING_LOGS instant scoring log entries${NC}"
    echo "   Recent instant scoring activity detected"
else
    echo -e "${YELLOW}⚠️  No instant scoring logs found yet${NC}"
    echo "   This is normal if no compliance assessments have been started"
fi
echo ""

# Step 5: Monitor Logs (Real-time)
echo "Step 5: Setting up log monitoring..."
echo -e "${YELLOW}📊 Monitoring logs for instant scoring activity...${NC}"
echo "   (Press Ctrl+C to stop monitoring)"
echo ""
echo "   When you start a compliance assessment, you should see:"
echo "   - [INSTANT SCORING] Calculating instant scores for app X"
echo "   - [INSTANT SCORING] Updated Y controls for standard Z"
echo "   - [INSTANT SCORING] Completed in Xms for app Y"
echo ""
echo "   Starting log tail (last 50 lines)..."
echo ""

# Tail logs and filter for instant scoring
kubectl logs -n progrc-dev -l app=progrc-backend --tail=50 -f 2>&1 | grep --line-buffered -E "INSTANT SCORING|syncComplianceForApp|calculateInstant" || true
