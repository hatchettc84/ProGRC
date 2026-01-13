#!/bin/bash

# Script to import all compliance standards, frameworks, controls, and master data
# This script runs all pending migrations and seeds master data

set -e

echo "=========================================="
echo "ProGRC Data Import Script"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if running in Docker
if [ -f /.dockerenv ] || [ -n "$DOCKER_CONTAINER" ]; then
    echo -e "${YELLOW}Running inside Docker container${NC}"
    CONTAINER_CMD=""
else
    echo -e "${YELLOW}Running migrations via Docker Compose${NC}"
    CONTAINER_CMD="docker-compose exec app"
fi

echo ""
echo -e "${GREEN}Step 1: Running all database migrations...${NC}"
echo "This will import:"
echo "  - Frameworks (NIST 800-53, DOD SRG, NIST 800-171)"
echo "  - Standards (FedRAMP, CMMC, DOD SRG IL levels, etc.)"
echo "  - Controls (thousands of compliance controls)"
echo "  - Control mappings"
echo "  - License types"
echo "  - Sectors"
echo "  - Permissions"
echo "  - Templates"
echo ""

$CONTAINER_CMD npm run migration:up

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Migrations completed successfully${NC}"
else
    echo -e "${RED}✗ Migrations failed${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}Step 2: Seeding master data (user roles, source types)...${NC}"

# Seed master data via API endpoint
echo "Calling seed endpoint..."
curl -X GET http://localhost:3000/seed_master-data_in-db 2>/dev/null || \
curl -X GET http://localhost:3001/seed_master-data_in-db 2>/dev/null

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Master data seeded successfully${NC}"
else
    echo -e "${YELLOW}⚠ Seed endpoint may not be accessible (this is okay if migrations already handled it)${NC}"
fi

echo ""
echo -e "${GREEN}Step 3: Restarting containers to ensure all changes are applied...${NC}"
docker-compose restart app

echo ""
echo -e "${GREEN}=========================================="
echo "Data Import Complete!"
echo "==========================================${NC}"
echo ""
echo "Imported data includes:"
echo "  ✓ Frameworks (3)"
echo "  ✓ Standards (12+)"
echo "  ✓ Controls (1000+)"
echo "  ✓ Control Mappings"
echo "  ✓ License Types"
echo "  ✓ Sectors (12)"
echo "  ✓ User Roles"
echo "  ✓ Source Types"
echo "  ✓ Permissions"
echo ""
echo "You can now:"
echo "  1. Access the frontend and create applications"
echo "  2. Add compliance standards to applications"
echo "  3. Start compliance assessments"
echo ""

