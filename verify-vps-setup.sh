#!/bin/bash

# VPS Verification Script
# Verifies that all services and configurations are intact on the VPS

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "=========================================="
echo "VPS Setup Verification"
echo "=========================================="
echo ""

# VPS IP addresses
VPS_IP="168.231.70.205"
AI_DROPLET_IP="64.225.20.65"

# Function to check service
check_service() {
    local service_name=$1
    local command=$2
    
    echo -n "Checking $service_name... "
    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ OK${NC}"
        return 0
    else
        echo -e "${RED}❌ FAILED${NC}"
        return 1
    fi
}

# Function to check VPS connectivity
check_vps_connectivity() {
    echo -e "${BLUE}=== VPS Connectivity Check ===${NC}"
    echo ""
    
    # Check VPS (168.231.70.205)
    echo "Checking VPS ($VPS_IP)..."
    if ping -c 1 -W 2 $VPS_IP > /dev/null 2>&1; then
        echo -e "  ${GREEN}✅ VPS is reachable${NC}"
    else
        echo -e "  ${RED}❌ VPS is not reachable${NC}"
        echo "  Note: This might be normal if VPS is not currently deployed"
    fi
    echo ""
    
    # Check AI Droplet (64.225.20.65)
    echo "Checking AI Droplet ($AI_DROPLET_IP)..."
    if ping -c 1 -W 2 $AI_DROPLET_IP > /dev/null 2>&1; then
        echo -e "  ${GREEN}✅ AI Droplet is reachable${NC}"
        
        # Check Ollama on AI Droplet
        echo "  Checking Ollama service..."
        if curl -s --connect-timeout 5 "http://$AI_DROPLET_IP:11434/api/tags" > /dev/null 2>&1; then
            echo -e "    ${GREEN}✅ Ollama is running and accessible${NC}"
            
            # Get models
            echo "    Checking installed models..."
            MODELS=$(curl -s --connect-timeout 5 "http://$AI_DROPLET_IP:11434/api/tags" 2>/dev/null | grep -o '"name":"[^"]*"' | cut -d'"' -f4 || echo "")
            if [ -n "$MODELS" ]; then
                echo -e "    ${GREEN}✅ Models found:${NC}"
                echo "$MODELS" | while read -r model; do
                    echo "      - $model"
                done
            else
                echo -e "    ${YELLOW}⚠️  No models found (or API error)${NC}"
            fi
        else
            echo -e "    ${RED}❌ Ollama is not accessible${NC}"
        fi
    else
        echo -e "  ${RED}❌ AI Droplet is not reachable${NC}"
    fi
    echo ""
}

# Function to check Kubernetes configuration
check_k8s_config() {
    echo -e "${BLUE}=== Kubernetes Configuration Check ===${NC}"
    echo ""
    
    # Check if kubectl is available
    if ! command -v kubectl &> /dev/null; then
        echo -e "${YELLOW}⚠️  kubectl not found - skipping Kubernetes checks${NC}"
        echo ""
        return
    fi
    
    # Check ConfigMap
    echo "Checking Kubernetes ConfigMap..."
    if kubectl get configmap -n progrc-dev backend-config > /dev/null 2>&1; then
        echo -e "  ${GREEN}✅ ConfigMap exists${NC}"
        
        # Check Ollama configuration
        OLLAMA_URL=$(kubectl get configmap -n progrc-dev backend-config -o jsonpath='{.data.OLLAMA_BASE_URL}' 2>/dev/null || echo "")
        OLLAMA_MODEL=$(kubectl get configmap -n progrc-dev backend-config -o jsonpath='{.data.OLLAMA_MODEL}' 2>/dev/null || echo "")
        USE_OLLAMA=$(kubectl get configmap -n progrc-dev backend-config -o jsonpath='{.data.USE_OLLAMA}' 2>/dev/null || echo "")
        
        if [ -n "$OLLAMA_URL" ]; then
            echo -e "  ${GREEN}✅ Ollama URL: $OLLAMA_URL${NC}"
        else
            echo -e "  ${YELLOW}⚠️  Ollama URL not found in ConfigMap${NC}"
        fi
        
        if [ -n "$OLLAMA_MODEL" ]; then
            echo -e "  ${GREEN}✅ Ollama Model: $OLLAMA_MODEL${NC}"
        else
            echo -e "  ${YELLOW}⚠️  Ollama Model not found in ConfigMap${NC}"
        fi
        
        if [ "$USE_OLLAMA" = "true" ]; then
            echo -e "  ${GREEN}✅ Ollama is enabled${NC}"
        else
            echo -e "  ${YELLOW}⚠️  Ollama is disabled${NC}"
        fi
    else
        echo -e "  ${RED}❌ ConfigMap not found${NC}"
    fi
    echo ""
    
    # Check backend pods
    echo "Checking backend pods..."
    PODS=$(kubectl get pods -n progrc-dev -l app=progrc-backend --no-headers 2>/dev/null | wc -l || echo "0")
    if [ "$PODS" -gt 0 ]; then
        echo -e "  ${GREEN}✅ Backend pods running: $PODS${NC}"
        
        # Check if pods can reach Ollama
        echo "  Testing Ollama connectivity from pods..."
        if kubectl exec -n progrc-dev deployment/progrc-backend -- curl -s --connect-timeout 5 "http://$AI_DROPLET_IP:11434/api/tags" > /dev/null 2>&1; then
            echo -e "    ${GREEN}✅ Pods can reach Ollama${NC}"
        else
            echo -e "    ${RED}❌ Pods cannot reach Ollama${NC}"
        fi
    else
        echo -e "  ${RED}❌ No backend pods found${NC}"
    fi
    echo ""
}

# Function to generate SSH commands for manual verification
generate_ssh_commands() {
    echo -e "${BLUE}=== Manual Verification Commands ===${NC}"
    echo ""
    echo "To verify your VPS setup manually, run these commands:"
    echo ""
    
    echo -e "${YELLOW}# VPS (168.231.70.205)${NC}"
    echo "ssh root@$VPS_IP"
    echo "docker compose ps  # Check running containers"
    echo "docker compose logs app | tail -50  # Check app logs"
    echo "curl http://localhost:3000/api/v1/health  # Health check"
    echo ""
    
    echo -e "${YELLOW}# AI Droplet (64.225.20.65)${NC}"
    echo "ssh root@$AI_DROPLET_IP"
    echo "systemctl status ollama  # Check Ollama service"
    echo "ollama list  # List installed models"
    echo "curl http://localhost:11434/api/tags  # Check Ollama API"
    echo "netstat -tlnp | grep 11434  # Verify port is listening"
    echo ""
}

# Main execution
echo "Starting verification..."
echo ""

# Check connectivity
check_vps_connectivity

# Check Kubernetes configuration (if available)
check_k8s_config

# Generate manual commands
generate_ssh_commands

echo "=========================================="
echo "Verification Complete"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Review the results above"
echo "2. If issues are found, use the manual verification commands"
echo "3. Check documentation: VPS_DEPLOYMENT_STEPS.md, OLLAMA_SETUP_SUMMARY.md"
echo ""
