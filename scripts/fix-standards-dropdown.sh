#!/bin/bash

# Quick fix script for "Target Compliance Standards" dropdown being empty
# This ensures standards are imported and active

set -e

echo "=========================================="
echo "Fixing Standards Dropdown Issue"
echo "=========================================="
echo ""

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

CONTAINER_CMD="docker-compose exec app"

echo -e "${YELLOW}Step 1: Running all pending migrations...${NC}"
$CONTAINER_CMD npm run migration:up

echo ""
echo -e "${YELLOW}Step 2: Verifying standards are imported and active...${NC}"

# Check and fix standards
$CONTAINER_CMD node -e "
const { Client } = require('pg');
const client = new Client({
  host: process.env.POSTGRES_HOST || 'postgres',
  port: process.env.POSTGRES_PORT || 5432,
  user: process.env.POSTGRES_USERNAME || 'progrc',
  password: process.env.POSTGRES_PASSWORD || 'progrc_dev_password_change_me',
  database: process.env.POSTGRES_DATABASE || 'progrc_bff'
});

async function fixStandards() {
  try {
    await client.connect();
    
    // Check frameworks first
    const frameworks = await client.query('SELECT id, name FROM framework ORDER BY id');
    console.log('Frameworks:', frameworks.rows.length);
    if (frameworks.rows.length === 0) {
      console.error('ERROR: No frameworks found. Run migrations first.');
      process.exit(1);
    }
    
    // Check standards
    const standards = await client.query('SELECT id, name, active, framework_id FROM standard ORDER BY id');
    console.log('Standards found:', standards.rows.length);
    
    if (standards.rows.length === 0) {
      console.error('ERROR: No standards found. Run migrations first.');
      process.exit(1);
    }
    
    // Check active standards
    const activeStandards = standards.rows.filter(s => s.active === true);
    console.log('Active standards:', activeStandards.length);
    
    if (activeStandards.length === 0) {
      console.log('WARNING: No active standards found. Activating standards...');
      // Activate common standards
      await client.query(\`
        UPDATE standard 
        SET active = true 
        WHERE name IN (
          'FedRamp Low',
          'FedRamp Moderate', 
          'FedRamp High',
          'FedRamp Li-SAAS',
          'CMMC 2.0 Level 1',
          'CMMC 2.0 Level 2',
          'NIST 800-53',
          'DOD SRG IL4',
          'DOD SRG IL5',
          'DOD SRG IL5-NSS',
          'DOD SRG IL6'
        )
      \`);
      console.log('✓ Standards activated');
    }
    
    // Final check
    const finalCheck = await client.query('SELECT id, name FROM standard WHERE active = true ORDER BY name');
    console.log('');
    console.log('Active standards available:');
    finalCheck.rows.forEach(s => {
      console.log('  -', s.name, '(ID:', s.id + ')');
    });
    
    await client.end();
    
    if (finalCheck.rows.length === 0) {
      console.error('ERROR: Still no active standards after fix attempt');
      process.exit(1);
    }
    
    console.log('');
    console.log('✓ Standards are ready for the dropdown');
    
  } catch (error) {
    console.error('Database error:', error.message);
    process.exit(1);
  }
}

fixStandards();
" 2>&1

if [ $? -eq 0 ]; then
  echo ""
  echo -e "${YELLOW}Step 3: Restarting application...${NC}"
  docker-compose restart app
  
  echo ""
  echo -e "${GREEN}=========================================="
  echo "Fix Complete!"
  echo "==========================================${NC}"
  echo ""
  echo "The standards dropdown should now work. Try:"
  echo "  1. Refresh your browser"
  echo "  2. Open the 'Create New Application' modal again"
  echo "  3. Click on 'Target Compliance Standards' dropdown"
  echo "  4. You should see standards like:"
  echo "     - FedRamp Low"
  echo "     - FedRamp Moderate"
  echo "     - FedRamp High"
  echo "     - CMMC 2.0 Level 1"
  echo "     - CMMC 2.0 Level 2"
  echo "     - NIST 800-53"
  echo "     - DOD SRG IL4, IL5, IL6"
  echo ""
else
  echo -e "${RED}✗ Fix failed. Check the errors above.${NC}"
  exit 1
fi

