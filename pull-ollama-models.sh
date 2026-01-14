#!/bin/bash

# Pull Ollama Models Script
# This script pulls the required Ollama models for ProGRC

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "=========================================="
echo "Pulling Ollama Models"
echo "=========================================="
echo ""

# Check if Ollama is running
echo -e "${BLUE}Step 1: Checking Ollama service...${NC}"
if ! curl -s http://localhost:11435/api/tags > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: Ollama is not accessible${NC}"
    echo "Please ensure Ollama service is running: docker-compose ps"
    exit 1
fi
echo -e "${GREEN}✓ Ollama is accessible${NC}"
echo ""

# Pull llama3.2:1b model
echo -e "${BLUE}Step 2: Pulling llama3.2:1b model...${NC}"
echo "This may take several minutes (model size: ~1.3 GB)..."
docker-compose exec -T ollama ollama pull llama3.2:1b
echo -e "${GREEN}✓ llama3.2:1b model pulled${NC}"
echo ""

# Pull nomic-embed-text model
echo -e "${BLUE}Step 3: Pulling nomic-embed-text model...${NC}"
echo "This may take a few minutes (model size: ~274 MB)..."
docker-compose exec -T ollama ollama pull nomic-embed-text
echo -e "${GREEN}✓ nomic-embed-text model pulled${NC}"
echo ""

# Verify models
echo -e "${BLUE}Step 4: Verifying models...${NC}"
docker-compose exec -T ollama ollama list
echo ""

echo "=========================================="
echo -e "${GREEN}Ollama Models Pulled Successfully!${NC}"
echo "=========================================="
echo ""
echo "Available Models:"
docker-compose exec -T ollama ollama list
echo ""
echo "Next Steps:"
echo "1. Run database migrations: ./run-migrations.sh"
echo "2. Verify deployment: ./verify-deployment.sh"
echo ""
