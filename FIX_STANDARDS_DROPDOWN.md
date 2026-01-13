# Fix: Target Compliance Standards Dropdown Empty

## Problem

The "Target Compliance Standards" dropdown in the "Create New Application" modal is empty, showing the error: **"At least one standard is required"**.

## Root Cause

The standards endpoint (`/onboarding/standards`) requires:
1. **User must have a `customer_id` (organization)** - The test admin user doesn't have one
2. **Standards must be imported and active** - Standards may not be imported yet
3. **Standards must be linked to the organization** - Even if standards exist, they need to be in `customer_standards` table

## Solution

Two fixes have been implemented:

### Fix 1: Allow SuperAdmin to See All Standards

Updated `src/onboarding/onboarding.service.ts` to allow SuperAdmin users (role_id = 1) to see all active standards even without a customer_id.

### Fix 2: Create Test Organization for Admin

Created migration `1744000000001-CreateTestOrganizationForAdmin.ts` that:
- Creates a test organization
- Links the test admin user to the organization
- Adds all active standards to the organization

## How to Apply the Fix

### Step 1: Run Migrations

```bash
cd /Users/corneliushatchett/Downloads/PRO\ GRC/bff-service-backend-dev
docker-compose exec app npm run migration:up
```

This will:
- Import all frameworks, standards, and controls
- Create test organization for admin user
- Link all active standards to the organization

### Step 2: Restart Application

```bash
docker-compose restart app
```

### Step 3: Refresh Frontend

1. **Logout** from the frontend (if logged in)
2. **Login again** with `admin@progrc.com` / `adminadmin`
3. Try creating a new application
4. The "Target Compliance Standards" dropdown should now be populated

## Verification

### Check Database

```bash
# Check if admin has organization
docker-compose exec postgres psql -U progrc -d progrc_bff -c "
SELECT u.email, u.customer_id, c.organization_name 
FROM users u 
LEFT JOIN customers c ON u.customer_id = c.id 
WHERE u.email = 'admin@progrc.com';
"

# Check active standards
docker-compose exec postgres psql -U progrc -d progrc_bff -c "
SELECT COUNT(*) as active_standards FROM standard WHERE active = true;
"

# Check standards linked to admin's organization
docker-compose exec postgres psql -U progrc -d progrc_bff -c "
SELECT COUNT(*) as org_standards 
FROM customer_standards cs
JOIN users u ON cs.customer_id = u.customer_id
WHERE u.email = 'admin@progrc.com';
"
```

### Check API Endpoint

```bash
# First, get a login token
TOKEN=$(curl -X POST http://localhost:3000/api/v1/jwt-auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@progrc.com","password":"adminadmin"}' \
  | jq -r '.data.accessToken')

# Then check standards endpoint
curl -X GET http://localhost:3000/api/v1/onboarding/standards \
  -H "Authorization: Bearer $TOKEN" \
  | jq '.data | length'
```

Expected: Should return a number > 0 (the count of available standards)

## Expected Result

After applying the fix, when you:
1. Open "Create New Application" modal
2. Click on "Target Compliance Standards" dropdown
3. You should see standards like:
   - FedRamp Low
   - FedRamp Moderate
   - FedRamp High
   - FedRamp Li-SAAS
   - CMMC 2.0 Level 1
   - CMMC 2.0 Level 2
   - NIST 800-53
   - DOD SRG IL4
   - DOD SRG IL5
   - DOD SRG IL5-NSS
   - DOD SRG IL6

## Alternative: Quick Fix Script

Run the automated fix script:

```bash
./scripts/fix-standards-dropdown.sh
```

This script will:
1. Run all migrations
2. Verify standards are imported and active
3. Activate standards if needed
4. Restart the application

## Troubleshooting

### Still Empty After Fix

1. **Check if you're logged in as the test admin**:
   - Email: `admin@progrc.com`
   - Password: `adminadmin`

2. **Check browser console** for API errors:
   - Open browser DevTools (F12)
   - Go to Network tab
   - Look for `/onboarding/standards` request
   - Check if it returns 200 and has data

3. **Verify standards are active**:
   ```bash
   docker-compose exec postgres psql -U progrc -d progrc_bff -c "
   SELECT id, name, active FROM standard WHERE active = true;
   "
   ```

4. **Clear browser cache and cookies**, then login again

### API Returns 401 (Unauthorized)

- Make sure you're logged in
- Check that JWT token is being sent in requests
- Verify the token hasn't expired

### API Returns Empty Array

- Check if admin user has `customer_id` set
- Check if standards are linked to the organization
- Verify standards have `active = true`

---

**Note**: These fixes are for testing/development only. Remove the test organization migration before production deployment.

