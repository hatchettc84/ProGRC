#!/bin/bash

# Script to import all compliance standards, frameworks, and controls into the platform
# This ensures all compliance data is available in the database

set -e

echo "=========================================="
echo "Importing Compliance Standards to ProGRC"
echo "=========================================="
echo ""

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

CONTAINER_CMD="docker-compose exec app"

echo -e "${BLUE}This will import:${NC}"
echo "  • Frameworks (NIST 800-53, DOD SRG, NIST 800-171)"
echo "  • Standards (FedRAMP, CMMC, DOD SRG IL levels, NIST 800-53)"
echo "  • Controls (1000+ compliance controls)"
echo "  • Control Mappings (standard-to-control relationships)"
echo "  • Test Organization for Admin User"
echo ""

read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 1
fi

echo ""
echo -e "${YELLOW}Step 1: Running all database migrations...${NC}"
echo "This may take 5-15 minutes for large control imports..."
echo ""

$CONTAINER_CMD npm run migration:up

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Migrations completed successfully${NC}"
else
    echo -e "${RED}✗ Migrations failed${NC}"
    echo "Check the error messages above"
    exit 1
fi

echo ""
echo -e "${YELLOW}Step 2: Seeding master data (user roles, source types)...${NC}"

# Seed master data
curl -s -X GET http://localhost:3000/seed_master-data_in-db > /dev/null 2>&1 || \
curl -s -X GET http://localhost:3001/seed_master-data_in-db > /dev/null 2>&1 || \
echo -e "${YELLOW}⚠ Seed endpoint not accessible (may already be seeded)${NC}"

echo ""
echo -e "${YELLOW}Step 3: Verifying import...${NC}"

# Verify the import
$CONTAINER_CMD node -e "
const { Client } = require('pg');
const client = new Client({
  host: process.env.POSTGRES_HOST || 'postgres',
  port: process.env.POSTGRES_PORT || 5432,
  user: process.env.POSTGRES_USERNAME || 'progrc',
  password: process.env.POSTGRES_PASSWORD || 'progrc_dev_password_change_me',
  database: process.env.POSTGRES_DATABASE || 'progrc_bff'
});

async function verify() {
  try {
    await client.connect();
    
    // Check frameworks
    const frameworks = await client.query('SELECT id, name FROM framework ORDER BY id');
    console.log('Frameworks:', frameworks.rows.length);
    frameworks.rows.forEach(f => console.log('  -', f.name));
    
    // Check standards
    const standards = await client.query('SELECT id, name, active FROM standard WHERE active = true ORDER BY name');
    console.log('');
    console.log('Active Standards:', standards.rows.length);
    standards.rows.forEach(s => console.log('  -', s.name));
    
    // Check controls
    const controls = await client.query('SELECT COUNT(*) as count FROM control');
    console.log('');
    console.log('Controls:', controls.rows[0].count);
    
    // Check control mappings
    const mappings = await client.query('SELECT COUNT(*) as count FROM standard_control_mapping');
    console.log('Control Mappings:', mappings.rows[0].count);
    
    // Check admin organization
    const adminOrg = await client.query(\`
      SELECT u.email, c.organization_name, COUNT(cs.standard_id) as standards_count
      FROM users u
      LEFT JOIN customers c ON u.customer_id = c.id
      LEFT JOIN customer_standards cs ON cs.customer_id = c.id
      WHERE u.email = 'admin@progrc.com'
      GROUP BY u.email, c.organization_name
    \`);
    console.log('');
    if (adminOrg.rows.length > 0 && adminOrg.rows[0].organization_name) {
      console.log('Admin Organization:', adminOrg.rows[0].organization_name);
      console.log('Standards in Organization:', adminOrg.rows[0].standards_count || 0);
    } else {
      console.log('⚠️  Admin user does not have an organization yet');
    }
    
    await client.end();
    
    if (frameworks.rows.length === 0 || standards.rows.length === 0) {
      console.error('');
      console.error('ERROR: Standards or frameworks not imported!');
      process.exit(1);
    }
    
    console.log('');
    console.log('✓ All compliance data imported successfully!');
    
  } catch (error) {
    console.error('Database error:', error.message);
    process.exit(1);
  }
}

verify();
" 2>&1

if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Verification failed${NC}"
    exit 1
fi

echo ""
echo -e "${YELLOW}Step 4: Restarting application...${NC}"
docker-compose restart app

echo ""
echo -e "${GREEN}=========================================="
echo "Compliance Standards Import Complete!"
echo "==========================================${NC}"
echo ""
echo "Next steps:"
echo "  1. Refresh your browser (or logout/login)"
echo "  2. Open 'Create New Application' modal"
echo "  3. Click 'Target Compliance Standards' dropdown"
echo "  4. You should now see all available standards"
echo ""
echo "Available standards include:"
echo "  • FedRamp (Low, Moderate, High, Li-SAAS)"
echo "  • CMMC 2.0 (Level 1, Level 2, Level 3)"
echo "  • DOD SRG (IL4, IL5, IL5-NSS, IL6)"
echo "  • NIST 800-53"
echo "  • Palantir FedStart 2.1"
echo ""

