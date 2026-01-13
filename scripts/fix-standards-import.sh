#!/bin/bash

# Script to fix "Target Compliance Standards" import failure
# This ensures frameworks are imported before standards

set -e

echo "=========================================="
echo "Fixing Compliance Standards Import"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

CONTAINER_CMD="docker-compose exec app"

echo -e "${YELLOW}Step 1: Checking current database state...${NC}"

# Check if frameworks exist
FRAMEWORK_COUNT=$($CONTAINER_CMD node -e "
const { Client } = require('pg');
const client = new Client({
  host: process.env.POSTGRES_HOST || 'postgres',
  port: process.env.POSTGRES_PORT || 5432,
  user: process.env.POSTGRES_USERNAME || 'progrc',
  password: process.env.POSTGRES_PASSWORD || 'progrc_dev_password_change_me',
  database: process.env.POSTGRES_DATABASE || 'progrc_bff'
});
client.connect().then(() => {
  return client.query('SELECT COUNT(*) FROM framework');
}).then(res => {
  console.log(res.rows[0].count);
  client.end();
}).catch(err => {
  console.error('0');
  client.end();
});
" 2>/dev/null || echo "0")

echo "Frameworks in database: $FRAMEWORK_COUNT"

# Check if standards exist
STANDARD_COUNT=$($CONTAINER_CMD node -e "
const { Client } = require('pg');
const client = new Client({
  host: process.env.POSTGRES_HOST || 'postgres',
  port: process.env.POSTGRES_PORT || 5432,
  user: process.env.POSTGRES_USERNAME || 'progrc',
  password: process.env.POSTGRES_PASSWORD || 'progrc_dev_password_change_me',
  database: process.env.POSTGRES_DATABASE || 'progrc_bff'
});
client.connect().then(() => {
  return client.query('SELECT COUNT(*) FROM standard');
}).then(res => {
  console.log(res.rows[0].count);
  client.end();
}).catch(err => {
  console.error('0');
  client.end();
});
" 2>/dev/null || echo "0")

echo "Standards in database: $STANDARD_COUNT"
echo ""

echo -e "${YELLOW}Step 2: Ensuring frameworks are imported first...${NC}"

# Run framework migration specifically
echo "Running framework migration..."
$CONTAINER_CMD npm run typeorm -- migration:run -d ./src/config/typeorm.config.ts -n ResetExistingFrameworkAndDumpNew1742490012265 2>&1 || {
  echo -e "${YELLOW}Framework migration may have already run or needs full migration run${NC}"
}

echo ""
echo -e "${YELLOW}Step 3: Verifying frameworks exist...${NC}"

# Verify frameworks
$CONTAINER_CMD node -e "
const { Client } = require('pg');
const client = new Client({
  host: process.env.POSTGRES_HOST || 'postgres',
  port: process.env.POSTGRES_PORT || 5432,
  user: process.env.POSTGRES_USERNAME || 'progrc',
  password: process.env.POSTGRES_PASSWORD || 'progrc_dev_password_change_me',
  database: process.env.POSTGRES_DATABASE || 'progrc_bff'
});
client.connect().then(() => {
  return client.query('SELECT id, name FROM framework ORDER BY id');
}).then(res => {
  console.log('Frameworks:');
  res.rows.forEach(row => {
    console.log('  ID:', row.id, '-', row.name);
  });
  if (res.rows.length === 0) {
    console.error('ERROR: No frameworks found!');
    process.exit(1);
  }
  client.end();
}).catch(err => {
  console.error('Database error:', err.message);
  process.exit(1);
});
" 2>&1

if [ $? -ne 0 ]; then
  echo -e "${RED}✗ Framework verification failed${NC}"
  echo ""
  echo -e "${YELLOW}Running full migration to ensure frameworks are created...${NC}"
  $CONTAINER_CMD npm run migration:up
else
  echo -e "${GREEN}✓ Frameworks verified${NC}"
fi

echo ""
echo -e "${YELLOW}Step 4: Running standards migration...${NC}"

# Run standards migration
$CONTAINER_CMD npm run typeorm -- migration:run -d ./src/config/typeorm.config.ts -n ResetExistingStandardAndDumpNew1742490012266 2>&1 || {
  echo -e "${YELLOW}Standards migration may have already run, running full migration...${NC}"
  $CONTAINER_CMD npm run migration:up
}

echo ""
echo -e "${YELLOW}Step 5: Verifying standards import...${NC}"

# Verify standards
$CONTAINER_CMD node -e "
const { Client } = require('pg');
const client = new Client({
  host: process.env.POSTGRES_HOST || 'postgres',
  port: process.env.POSTGRES_PORT || 5432,
  user: process.env.POSTGRES_USERNAME || 'progrc',
  password: process.env.POSTGRES_PASSWORD || 'progrc_dev_password_change_me',
  database: process.env.POSTGRES_DATABASE || 'progrc_bff'
});
client.connect().then(() => {
  return client.query('SELECT id, name, framework_id, active FROM standard ORDER BY id');
}).then(res => {
  console.log('Standards:');
  res.rows.forEach(row => {
    console.log('  ID:', row.id, '-', row.name, '(Framework:', row.framework_id + ', Active:', row.active + ')');
  });
  console.log('Total standards:', res.rows.length);
  if (res.rows.length === 0) {
    console.error('ERROR: No standards found!');
    process.exit(1);
  }
  client.end();
}).catch(err => {
  console.error('Database error:', err.message);
  process.exit(1);
});
" 2>&1

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Standards verified${NC}"
else
  echo -e "${RED}✗ Standards verification failed${NC}"
  exit 1
fi

echo ""
echo -e "${YELLOW}Step 6: Restarting application...${NC}"
docker-compose restart app

echo ""
echo -e "${GREEN}=========================================="
echo "Standards Import Fixed!"
echo "==========================================${NC}"
echo ""
echo "You should now be able to:"
echo "  1. Access the frontend"
echo "  2. Create an application"
echo "  3. Add compliance standards"
echo ""

