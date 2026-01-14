#!/bin/bash

# VPS Services Deployment Script
# This script builds and deploys all ProGRC services on the VPS

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "=========================================="
echo "ProGRC VPS Services Deployment"
echo "=========================================="
echo ""

# Check if running in project directory
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}❌ Error: docker-compose.yml not found${NC}"
    echo "Please run this script from the project root directory"
    exit 1
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ Error: .env file not found${NC}"
    echo "Please run configure-vps-env.sh first"
    exit 1
fi

echo -e "${BLUE}Step 1: Building Docker images...${NC}"
docker-compose build --no-cache
echo -e "${GREEN}✓ Images built${NC}"
echo ""

echo -e "${BLUE}Step 2: Starting services...${NC}"
docker-compose up -d
echo -e "${GREEN}✓ Services started${NC}"
echo ""

echo -e "${BLUE}Step 3: Waiting for services to be healthy...${NC}"
sleep 10

# Check service status
echo -e "${BLUE}Step 4: Checking service status...${NC}"
docker-compose ps
echo ""

# Wait for PostgreSQL to be ready
echo -e "${BLUE}Step 5: Waiting for PostgreSQL to be ready...${NC}"
for i in {1..30}; do
    if docker-compose exec -T postgres pg_isready -U progrc > /dev/null 2>&1; then
        echo -e "${GREEN}✓ PostgreSQL is ready${NC}"
        break
    fi
    echo "  Waiting for PostgreSQL... ($i/30)"
    sleep 2
done

# Wait for Redis to be ready
echo -e "${BLUE}Step 6: Waiting for Redis to be ready...${NC}"
for i in {1..30}; do
    if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Redis is ready${NC}"
        break
    fi
    echo "  Waiting for Redis... ($i/30)"
    sleep 2
done

# Wait for LocalStack to be ready
echo -e "${BLUE}Step 7: Waiting for LocalStack to be ready...${NC}"
for i in {1..30}; do
    if curl -s http://localhost:4566/_localstack/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓ LocalStack is ready${NC}"
        break
    fi
    echo "  Waiting for LocalStack... ($i/30)"
    sleep 2
done

# Wait for Ollama to be ready
echo -e "${BLUE}Step 8: Waiting for Ollama to be ready...${NC}"
for i in {1..30}; do
    if curl -s http://localhost:11435/api/tags > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Ollama is ready${NC}"
        break
    fi
    echo "  Waiting for Ollama... ($i/30)"
    sleep 2
done

# Display summary
echo ""
echo "=========================================="
echo -e "${GREEN}Deployment Complete!${NC}"
echo "=========================================="
echo ""
echo "Service Status:"
docker-compose ps
echo ""
echo "Service URLs:"
echo "  ✓ Backend API: http://localhost:3001/api/v1/health"
echo "  ✓ Frontend: http://localhost:3001"
echo "  ✓ LocalStack: http://localhost:4566"
echo "  ✓ Ollama: http://localhost:11435"
echo "  ✓ Metabase: http://localhost:3002"
echo ""
echo "Next Steps:"
echo "1. Pull Ollama models: ./pull-ollama-models.sh"
echo "2. Run database migrations: ./run-migrations.sh"
echo "3. Verify deployment: ./verify-deployment.sh"
echo ""
