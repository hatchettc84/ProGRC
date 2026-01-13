# Data Import Guide - Compliance Standards & Master Data

This guide explains how to import all compliance standards, frameworks, controls, and master data into your ProGRC platform.

## Overview

The ProGRC platform includes comprehensive compliance data that is imported through:

1. **Database Migrations** - Import frameworks, standards, controls, and mappings
2. **Master Data Seeding** - Import user roles, source types, and other reference data

## What Gets Imported

### Frameworks
- **NIST 800-53** - Comprehensive cybersecurity framework
- **DOD SRG** - Department of Defense Security Requirements Guide
- **NIST 800-171 rev2 Catalog** - CMMC framework

### Standards
- **FedRAMP** (Low, Moderate, High, LI-SaaS)
- **CMMC 2.0** (Level 1, Level 2, Level 3)
- **DOD SRG** (IL4, IL5, IL5-NSS, IL6)
- **NIST 800-53**
- **Palantir FedStart 2.1**

### Controls
- **1000+ compliance controls** with:
  - Control names and descriptions
  - Family classifications
  - Evaluation criteria
  - Source mappings
  - Embeddings for AI-powered matching

### Master Data
- **User Roles** (SuperAdmin, OrgAdmin, OrgMember, CSM, Auditor, etc.)
- **Source Types** (GitHub, AWS, Azure, Kubernetes, etc.)
- **License Types** (Trial, Professional, Enterprise)
- **Sectors** (Technology, Healthcare, Finance, Government, etc.)
- **Permissions** (Feature-level access controls)

## Quick Import (Automated)

### Option 1: Using the Import Script

```bash
# Run the automated import script
./scripts/import-all-data.sh
```

This script will:
1. Run all pending migrations
2. Seed master data
3. Restart containers

### Option 2: Manual Steps

#### Step 1: Run All Migrations

```bash
# If using Docker Compose
docker-compose exec app npm run migration:up

# Or if running locally
npm run migration:up
```

This will execute all migrations in order, including:
- Framework creation
- Standard creation
- Control import (this may take several minutes)
- Control mappings
- License types
- Sectors
- Permissions

#### Step 2: Seed Master Data

```bash
# Call the seed endpoint
curl -X GET http://localhost:3000/seed_master-data_in-db

# Or access via browser
# http://localhost:3000/seed_master-data_in-db
```

This seeds:
- User roles
- Source types

#### Step 3: Restart Containers

```bash
docker-compose restart app
```

## Verification

### Check Frameworks

```bash
# Via API (requires authentication)
curl -X GET http://localhost:3000/api/v1/frameworks \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Check Standards

```bash
curl -X GET http://localhost:3000/api/v1/standards \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Check Database Directly

```bash
# Connect to database
docker-compose exec postgres psql -U progrc -d progrc_bff

# Check frameworks
SELECT id, name, active FROM framework;

# Check standards
SELECT id, name, active FROM standard;

# Check controls count
SELECT COUNT(*) FROM control;

# Check control mappings
SELECT COUNT(*) FROM standard_control_mapping;
```

Expected counts:
- **Frameworks**: 3
- **Standards**: 12+
- **Controls**: 1000+
- **Control Mappings**: 2000+

## Important Migrations

Key migrations that import bulk data:

1. **1742490012265-ResetExistingFrameworkAndDumpNew.ts**
   - Imports frameworks

2. **1742490012266-ResetExistingStandardAndDumpNew.ts**
   - Imports standards

3. **1742490012268-ResetExistingControlsAndDumpNew.ts**
   - Imports all controls (large file, takes time)

4. **1742490012269-ResetExistingStandardControlsMappingAndDumpNew.ts**
   - Imports control-to-standard mappings

5. **1741254135402-AddLicenseRulesData.ts**
   - Imports license types and rules

6. **1742491000002-insertDefaultSectors.ts**
   - Imports industry sectors

## Troubleshooting

### Migrations Fail

If migrations fail, check:

```bash
# View migration logs
docker-compose logs app | grep -i migration

# Check database connection
docker-compose exec postgres psql -U progrc -d progrc_bff -c "SELECT 1;"

# Check if migrations table exists
docker-compose exec postgres psql -U progrc -d progrc_bff -c "SELECT * FROM migrations ORDER BY timestamp DESC LIMIT 10;"
```

### Controls Not Imported

The controls migration is very large. If it fails:

1. Check available disk space
2. Check database memory settings
3. Run migration in smaller batches (may require splitting the migration)

### Master Data Not Seeded

If master data endpoint doesn't work:

1. Check if the endpoint is accessible
2. Verify user roles and source types are in `src/common/metadata.ts`
3. Manually insert data if needed

## Re-importing Data

To re-import data (⚠️ **WARNING**: This will delete existing data):

```bash
# Rollback specific migrations
docker-compose exec app npm run migration:down

# Or reset database (⚠️ DELETES ALL DATA)
docker-compose down -v
docker-compose up -d
docker-compose exec app npm run migration:up
```

## Next Steps

After importing data:

1. **Create an Application** - Use the frontend to create your first application
2. **Add Standards** - Select compliance standards for your application
3. **Start Assessment** - Begin compliance assessment process
4. **Upload Sources** - Connect your infrastructure sources (GitHub, AWS, etc.)

## Support

If you encounter issues:

1. Check the migration logs: `docker-compose logs app`
2. Verify database connectivity
3. Ensure sufficient disk space and memory
4. Review migration files for errors

---

**Note**: The initial data import may take 5-15 minutes depending on your system resources, especially the controls import which contains thousands of records with embeddings.

