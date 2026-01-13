# Import Compliance Standards - Quick Guide

## Overview

This guide explains how to import all compliance standards, frameworks, controls, and related data into your ProGRC platform.

## What Gets Imported

### Frameworks (3)
- **NIST 800-53** - Comprehensive cybersecurity framework
- **DOD SRG** - Department of Defense Security Requirements Guide  
- **NIST 800-171 rev2 Catalog** - CMMC framework base

### Standards (12+)
- **FedRAMP**: Low, Moderate, High, LI-SaaS
- **CMMC 2.0**: Level 1, Level 2, Level 3
- **DOD SRG**: IL4, IL5, IL5-NSS, IL6
- **NIST 800-53**
- **Palantir FedStart 2.1**

### Controls (1000+)
- Individual compliance controls with:
  - Control names and descriptions
  - Family classifications
  - Evaluation criteria
  - Source mappings
  - AI embeddings for intelligent matching

### Control Mappings (2000+)
- Maps which controls belong to which standards
- Enables compliance assessment functionality

## Quick Import (Automated)

### Run the Import Script

```bash
cd /Users/corneliushatchett/Downloads/PRO\ GRC/bff-service-backend-dev
./scripts/import-compliance-standards.sh
```

This script will:
1. ✅ Run all pending migrations (imports all data)
2. ✅ Seed master data (user roles, source types)
3. ✅ Verify the import was successful
4. ✅ Restart the application

**Time**: 5-15 minutes (depending on system resources)

## Manual Import Steps

If you prefer to run steps manually:

### Step 1: Run Migrations

```bash
docker-compose exec app npm run migration:up
```

This executes migrations in order:
- Creates frameworks
- Creates standards
- Imports controls (large, takes time)
- Creates control mappings
- Creates test organization for admin

### Step 2: Seed Master Data

```bash
curl -X GET http://localhost:3000/seed_master-data_in-db
```

Or access via browser: `http://localhost:3000/seed_master-data_in-db`

### Step 3: Restart Application

```bash
docker-compose restart app
```

## Verification

### Check Database State

```bash
docker-compose exec app node scripts/check-database-state.js
```

This shows:
- Number of frameworks
- Number of standards (active and total)
- Number of controls
- Number of control mappings
- Admin user organization status

### Check via API

```bash
# Login first to get token
TOKEN=$(curl -X POST http://localhost:3000/api/v1/jwt-auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@progrc.com","password":"adminadmin"}' \
  | jq -r '.data.accessToken')

# Get standards
curl -X GET http://localhost:3000/api/v1/onboarding/standards \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.data | length'
```

Expected: Should return a number > 0

### Check in Frontend

1. Login with `admin@progrc.com` / `adminadmin`
2. Click "+ New Application"
3. Click "Target Compliance Standards" dropdown
4. You should see all available standards

## Files Containing Compliance Data

The compliance standards are stored in these migration files:

### Standards
- **`src/migrations/1742490012266-ResetExistingStandardAndDumpNew.ts`**
  - Contains: FedRAMP, CMMC, DOD SRG, NIST 800-53

### Frameworks
- **`src/migrations/1742490012265-ResetExistingFrameworkAndDumpNew.ts`**
  - Contains: NIST 800-53, DOD SRG, NIST 800-171

### Controls
- **`src/migrations/1742490012268-ResetExistingControlsAndDumpNew.ts`**
  - Contains: 1000+ individual controls (very large file)

### Control Mappings
- **`src/migrations/1742490012269-ResetExistingStandardControlsMappingAndDumpNew.ts`**
  - Maps controls to standards

### Additional Standards
- **`src/migrations/1744782184150-insertNewStanadards.ts`**
  - Adds: Palantir FedStart 2.1

## Troubleshooting

### Migrations Fail

**Error**: Foreign key constraint violation
- **Solution**: Ensure frameworks are imported before standards
- Run: `docker-compose exec app npm run migration:up` (runs in correct order)

**Error**: Out of memory
- **Solution**: The controls migration is very large
- Increase Docker memory allocation
- Or run migrations in smaller batches

### Standards Not Showing in Dropdown

1. **Check if standards are active**:
   ```bash
   docker-compose exec postgres psql -U progrc -d progrc_bff -c "
   SELECT id, name, active FROM standard WHERE active = true;
   "
   ```

2. **Check if admin has organization**:
   ```bash
   docker-compose exec postgres psql -U progrc -d progrc_bff -c "
   SELECT u.email, c.organization_name 
   FROM users u 
   LEFT JOIN customers c ON u.customer_id = c.id 
   WHERE u.email = 'admin@progrc.com';
   "
   ```

3. **Check if standards are linked to organization**:
   ```bash
   docker-compose exec postgres psql -U progrc -d progrc_bff -c "
   SELECT COUNT(*) 
   FROM customer_standards cs
   JOIN users u ON cs.customer_id = u.customer_id
   WHERE u.email = 'admin@progrc.com';
   "
   ```

### Still Empty After Import

1. **Logout and login again** in the frontend
2. **Clear browser cache** and cookies
3. **Check browser console** for API errors (F12 → Network tab)
4. **Verify API endpoint** is accessible:
   ```bash
   curl http://localhost:3000/api/v1/health
   ```

## Expected Results

After successful import:

- ✅ **3 frameworks** in database
- ✅ **12+ standards** (with active = true)
- ✅ **1000+ controls** with descriptions
- ✅ **2000+ control mappings**
- ✅ **Test admin user** has organization
- ✅ **All active standards** linked to admin's organization
- ✅ **Standards dropdown** populated in frontend

## Next Steps

After importing standards:

1. **Create Applications** - Use the frontend to create applications
2. **Add Standards** - Select compliance standards for each application
3. **Start Assessments** - Begin compliance assessment process
4. **Upload Sources** - Connect infrastructure sources (GitHub, AWS, etc.)
5. **Review Controls** - View and evaluate compliance controls

---

**Note**: The initial import may take 5-15 minutes. The controls migration is particularly large as it contains thousands of records with vector embeddings for AI-powered matching.

