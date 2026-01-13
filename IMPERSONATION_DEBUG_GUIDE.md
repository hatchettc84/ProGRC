# Impersonation/Emulation Debug Guide

## Issue
System information not loading correctly when clicking the "Emulate" button on VPS.

## Debugging Steps

### 1. Check Browser Console
After clicking "Emulate", open browser DevTools (F12) and check the Console tab for:
- `🔄 Impersonation detected, forcing fresh user check...`
- `loadUserOrganizationData: Loading organization data` (should show tenant_id/customerId)
- `loadUserOrganizationData: Organization loaded successfully` (should show orgId and orgName)
- Any error messages

### 2. Check Network Tab
In DevTools → Network tab, filter by "organization" and check:
- `GET /api/v1/onboarding/organization` - Should return 200 with organization data
- Check the request headers - should include `Authorization: Bearer <token>`
- Check the response - should contain organization data with `id`, `organization_name`, etc.

### 3. Verify JWT Token
After impersonation, the JWT token should contain:
- `customerId`: The organization ID being impersonated
- `tenant_id`: Same as customerId
- `impersonateExpTime`: Expiration timestamp

To verify, decode the JWT token at https://jwt.io and check the payload.

### 4. Check Backend Logs
```bash
ssh root@168.231.70.205
cd /root/bff-service-backend-dev
docker compose logs app --tail 200 | grep -iE "getOrganizationInfo|tenant_id|customerId|onboarding/organization"
```

Look for:
- `getOrganizationInfo: Fetching organization with ID: <orgId>`
- `getOrganizationInfo: Successfully found organization: <name>`
- Any warnings about missing tenant_id or customerId

### 5. Test API Directly
```bash
# Get a token after impersonation, then test:
curl -H "Authorization: Bearer <token>" http://168.231.70.205/api/v1/jwt-auth/me
curl -H "Authorization: Bearer <token>" http://168.231.70.205/api/v1/onboarding/organization
```

## Recent Fixes Applied

1. **Backend**: Updated `getOrganizationInfo` to support both `tenant_id` and `customerId`
2. **Backend**: Added logging for organization lookup
3. **Frontend**: Added localStorage flag to track impersonation
4. **Frontend**: Enhanced `App.tsx` to detect impersonation and force fresh checkUser
5. **Frontend**: Updated `checkUser` to not skip if organization is missing
6. **Frontend**: Added comprehensive logging throughout the flow

## Expected Flow After Emulate Click

1. `postImpersonateCustomerAPI` called → Sets JWT and refresh tokens
2. localStorage flag set: `progrc_impersonation_just_started = true`
3. User state cleared: `user = null, organization = null`
4. Page reloads: `window.location.href = "/dashboard/home"`
5. After reload:
   - App.tsx detects impersonation flag
   - Clears user state again
   - Calls `checkUser()`
   - `checkUser` calls `/jwt-auth/me` → Returns user with `tenant_id`/`customerId`
   - `loadUserOrganizationData()` called
   - `/onboarding/organization` called with tenant_id from JWT
   - Organization data loaded and displayed

## Common Issues

1. **JWT token doesn't contain tenant_id/customerId**
   - Check `impersonate.service.ts` - should set both in payload
   - Verify token is being set correctly in `postImpersonateCustomerAPI`

2. **Organization API returns null**
   - Check backend logs for `getOrganizationInfo` warnings
   - Verify organization ID exists in database
   - Check if `tenant_id` is being passed correctly from JWT

3. **checkUser skipping API call**
   - Check skip condition in `checkUser` function
   - Verify user state is cleared before reload
   - Check localStorage flag is being set/cleared correctly

## Next Steps if Issue Persists

1. Check browser console for specific error messages
2. Verify JWT token payload contains customerId/tenant_id
3. Test organization API directly with impersonated token
4. Check backend logs for any errors during organization lookup
5. Verify organization exists in database with the correct ID




