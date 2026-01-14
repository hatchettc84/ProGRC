#!/bin/bash

# Final Verification Script
# This script performs comprehensive verification of the ProGRC deployment

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

VPS_IP=${VPS_IP:-"168.231.70.205"}

echo "=========================================="
echo "ProGRC Final Deployment Verification"
echo "=========================================="
echo ""

# Check Docker services
echo -e "${BLUE}Step 1: Checking Docker services...${NC}"
cd /opt/progrc/bff-service-backend-dev
docker-compose ps
echo ""

# Check PostgreSQL
echo -e "${BLUE}Step 2: Checking PostgreSQL...${NC}"
if docker-compose exec -T postgres pg_isready -U progrc > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PostgreSQL is healthy${NC}"
    # Check database exists
    if docker-compose exec -T postgres psql -U progrc -lqt | cut -d \| -f 1 | grep -qw progrc_bff; then
        echo -e "${GREEN}✓ Database 'progrc_bff' exists${NC}"
    else
        echo -e "${YELLOW}⚠️  Database 'progrc_bff' not found${NC}"
    fi
else
    echo -e "${RED}❌ PostgreSQL is not healthy${NC}"
fi
echo ""

# Check Redis
echo -e "${BLUE}Step 3: Checking Redis...${NC}"
if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Redis is healthy${NC}"
else
    echo -e "${RED}❌ Redis is not healthy${NC}"
fi
echo ""

# Check LocalStack
echo -e "${BLUE}Step 4: Checking LocalStack...${NC}"
if curl -s http://localhost:4566/_localstack/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ LocalStack is healthy${NC}"
else
    echo -e "${RED}❌ LocalStack is not healthy${NC}"
fi
echo ""

# Check Ollama
echo -e "${BLUE}Step 5: Checking Ollama...${NC}"
if curl -s http://localhost:11435/api/tags > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Ollama is healthy${NC}"
    MODELS=$(curl -s http://localhost:11435/api/tags | grep -o '"name":"[^"]*"' | wc -l)
    if [ "$MODELS" -ge 2 ]; then
        echo -e "${GREEN}✓ Ollama has models installed ($MODELS models)${NC}"
    else
        echo -e "${YELLOW}⚠️  Ollama has fewer models than expected${NC}"
    fi
else
    echo -e "${RED}❌ Ollama is not healthy${NC}"
fi
echo ""

# Check Backend API
echo -e "${BLUE}Step 6: Checking Backend API...${NC}"
if curl -s http://localhost:3001/api/v1/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend API is healthy${NC}"
    HEALTH_RESPONSE=$(curl -s http://localhost:3001/api/v1/health)
    echo "  Response: $HEALTH_RESPONSE"
else
    echo -e "${RED}❌ Backend API is not healthy${NC}"
    echo "  Checking logs..."
    docker-compose logs app --tail 20
fi
echo ""

# Check Nginx
echo -e "${BLUE}Step 7: Checking Nginx...${NC}"
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✓ Nginx is running${NC}"
    if curl -s http://${VPS_IP}/api/v1/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Nginx proxy is working${NC}"
    else
        echo -e "${YELLOW}⚠️  Nginx proxy may not be configured correctly${NC}"
    fi
else
    echo -e "${RED}❌ Nginx is not running${NC}"
fi
echo ""

# Check external access
echo -e "${BLUE}Step 8: Checking external access...${NC}"
if curl -s --max-time 5 http://${VPS_IP}/api/v1/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ External access is working${NC}"
    echo "  URL: http://${VPS_IP}/api/v1/health"
else
    echo -e "${YELLOW}⚠️  External access may not be working${NC}"
    echo "  Check firewall rules and Nginx configuration"
fi
echo ""

# Summary
echo "=========================================="
echo -e "${BLUE}Verification Summary${NC}"
echo "=========================================="
echo ""
echo "Service Status:"
docker-compose ps --format "table {{.Name}}\t{{.Status}}"
echo ""
echo "Access URLs:"
echo "  Local Backend: http://localhost:3001/api/v1/health"
echo "  External API: http://${VPS_IP}/api/v1/health"
echo "  External Frontend: http://${VPS_IP}"
echo ""
echo "Next Steps:"
echo "1. Test login functionality"
echo "2. Verify AI features (compliance scoring)"
echo "3. Check file uploads"
echo "4. Review application logs"
echo ""
