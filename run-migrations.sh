#!/bin/bash

# Run Database Migrations Script
# This script runs TypeORM migrations on the VPS

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "=========================================="
echo "Running Database Migrations"
echo "=========================================="
echo ""

# Check if app container is running
echo -e "${BLUE}Step 1: Checking app container...${NC}"
if ! docker-compose ps app | grep -q "Up"; then
    echo -e "${RED}❌ Error: App container is not running${NC}"
    echo "Please start services first: docker-compose up -d"
    exit 1
fi
echo -e "${GREEN}✓ App container is running${NC}"
echo ""

# Wait for app to be ready
echo -e "${BLUE}Step 2: Waiting for app to be ready...${NC}"
for i in {1..60}; do
    if docker-compose exec -T app node -e "const http = require('http'); http.get('http://localhost:3000/api/v1/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }).on('error', () => { process.exit(1); });" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ App is ready${NC}"
        break
    fi
    echo "  Waiting for app... ($i/60)"
    sleep 2
done
echo ""

# Run migrations
echo -e "${BLUE}Step 3: Running migrations...${NC}"
docker-compose exec -T app npm run migration:up
echo -e "${GREEN}✓ Migrations completed${NC}"
echo ""

# Show migration status
echo -e "${BLUE}Step 4: Migration status...${NC}"
docker-compose exec -T app npm run typeorm -- migration:show
echo ""

echo "=========================================="
echo -e "${GREEN}Migrations Complete!${NC}"
echo "=========================================="
echo ""
echo "Next Steps:"
echo "1. Verify deployment: ./verify-deployment.sh"
echo "2. Configure Nginx: See MIGRATION_PHASE7_GUIDE.md"
echo ""
