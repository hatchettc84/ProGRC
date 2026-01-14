#!/bin/bash

# Verify Deployment Script
# This script verifies that all services are running correctly

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "=========================================="
echo "Verifying ProGRC Deployment"
echo "=========================================="
echo ""

# Check Docker Compose services
echo -e "${BLUE}Step 1: Checking Docker Compose services...${NC}"
docker-compose ps
echo ""

# Check PostgreSQL
echo -e "${BLUE}Step 2: Checking PostgreSQL...${NC}"
if docker-compose exec -T postgres pg_isready -U progrc > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PostgreSQL is healthy${NC}"
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
    # List S3 buckets
    echo "  S3 Buckets:"
    curl -s http://localhost:4566/s3 | grep -o '<Name>[^<]*</Name>' | sed 's/<Name>\(.*\)<\/Name>/\1/' || echo "  (No buckets found)"
else
    echo -e "${RED}❌ LocalStack is not healthy${NC}"
fi
echo ""

# Check Ollama
echo -e "${BLUE}Step 5: Checking Ollama...${NC}"
if curl -s http://localhost:11435/api/tags > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Ollama is healthy${NC}"
    echo "  Available models:"
    curl -s http://localhost:11435/api/tags | grep -o '"name":"[^"]*"' | sed 's/"name":"\(.*\)"/    - \1/' || echo "    (No models found)"
else
    echo -e "${RED}❌ Ollama is not healthy${NC}"
fi
echo ""

# Check Backend API
echo -e "${BLUE}Step 6: Checking Backend API...${NC}"
if curl -s http://localhost:3001/api/v1/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend API is healthy${NC}"
    echo "  Health check response:"
    curl -s http://localhost:3001/api/v1/health | head -5
else
    echo -e "${RED}❌ Backend API is not healthy${NC}"
    echo "  Checking logs..."
    docker-compose logs app --tail 20
fi
echo ""

# Check Metabase
echo -e "${BLUE}Step 7: Checking Metabase...${NC}"
if curl -s http://localhost:3002/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Metabase is healthy${NC}"
else
    echo -e "${YELLOW}⚠️  Metabase may still be starting (this is normal)${NC}"
fi
echo ""

# Summary
echo "=========================================="
echo -e "${BLUE}Verification Summary${NC}"
echo "=========================================="
echo ""
echo "Service Status:"
docker-compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
echo ""
echo "Service URLs:"
echo "  Backend API: http://localhost:3001/api/v1/health"
echo "  Frontend: http://localhost:3001"
echo "  LocalStack: http://localhost:4566"
echo "  Ollama: http://localhost:11435"
echo "  Metabase: http://localhost:3002"
echo ""
echo "External Access:"
echo "  Backend API: http://168.231.70.205:3001/api/v1/health"
echo "  Frontend: http://168.231.70.205:3001"
echo ""
