# Debug Impersonation Issue - Step by Step

## Current Issue
System information not loading after clicking "Emulate" button.

## Debugging Steps

### Step 1: Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Click "Emulate" button
4. Look for these logs in order:

**Expected logs:**
```
🔄 Impersonation detected, forcing fresh user check...
🔄 Calling checkUser (no user found or impersonation detected)...
checkUser: Received user data from API { userId: "...", tenant_id: "...", customerId: "..." }
checkUser: Created user state object { tenant_id: "...", customerId: "..." }
loadUserOrganizationData: Loading organization data { tenant_id: "...", customerId: "..." }
loadUserOrganizationData: Calling getOrganization API...
loadUserOrganizationData: API response received { hasData: true, orgId: "...", orgName: "..." }
loadUserOrganizationData: Organization loaded successfully
```

**If you see:**
- `checkUser: Received user data from API { tenant_id: undefined, customerId: undefined }` → JWT token doesn't contain these fields
- `loadUserOrganizationData: SuperAdmin without tenant_id/customerId, skipping organization load` → User state doesn't have tenant context
- `loadUserOrganizationData: Organization API returned no data` → Backend returned null/error

### Step 2: Check Network Tab
1. Go to Network tab in DevTools
2. Filter by "organization"
3. After clicking Emulate, look for:
   - `GET /api/v1/onboarding/organization`
   - Check Request Headers: Should have `Authorization: Bearer <token>`
   - Check Response: Should have organization data or error message

### Step 3: Verify JWT Token
1. In Console, run:
```javascript
const token = localStorage.getItem('progrc_jwt_token');
if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  console.log('JWT Payload:', payload);
  console.log('Has tenant_id:', !!payload.tenant_id);
  console.log('Has customerId:', !!payload.customerId);
  console.log('tenant_id value:', payload.tenant_id);
  console.log('customerId value:', payload.customerId);
}
```

**Expected:** Should show `tenant_id` and `customerId` with the organization ID.

### Step 4: Check Backend Logs
```bash
ssh root@168.231.70.205
cd /root/bff-service-backend-dev
docker compose logs app --tail 200 | grep -iE "getMe|getOrganizationInfo|tenant_id|customerId"
```

**Look for:**
- `getMe: Received userInfo payload` - Should show tenant_id and customerId
- `getMe: Added tenant_id to response: <id>`
- `getMe: Added customerId to response: <id>`
- `getOrganizationInfo: Fetching organization with ID: <id>`
- `getOrganizationInfo: Successfully found organization: <name>`

### Step 5: Test API Directly
1. Get your JWT token from browser localStorage
2. Test the endpoints:

```bash
# Test /jwt-auth/me
curl -H "Authorization: Bearer <YOUR_TOKEN>" \
  http://168.231.70.205/api/v1/jwt-auth/me | jq

# Test /onboarding/organization
curl -H "Authorization: Bearer <YOUR_TOKEN>" \
  http://168.231.70.205/api/v1/onboarding/organization | jq
```

**Expected responses:**
- `/jwt-auth/me` should return user with `tenant_id` and `customerId`
- `/onboarding/organization` should return organization data

## Common Issues & Fixes

### Issue 1: JWT Token Missing tenant_id/customerId
**Symptom:** `checkUser: Received user data from API { tenant_id: undefined }`

**Cause:** Impersonation service not setting these in JWT payload

**Fix:** Check `impersonate.service.ts` - should set:
```typescript
payload['customerId'] = customerId;
payload['tenant_id'] = customerId;
```

### Issue 2: Backend Not Returning tenant_id/customerId
**Symptom:** Backend logs show "No tenant_id in JWT payload"

**Cause:** JWT guard not passing payload correctly, or payload doesn't have these fields

**Fix:** Check `jwt-auth.guard.ts` - should set `request.user_data = payload`

### Issue 3: Organization API Returns Null
**Symptom:** `getOrganizationInfo: Organization with id <id> not found`

**Cause:** Organization ID doesn't exist in database, or wrong ID

**Fix:** Verify organization exists:
```sql
SELECT id, organization_name FROM customer WHERE id = '<org_id>';
```

### Issue 4: Frontend Not Calling Organization API
**Symptom:** No `GET /onboarding/organization` in Network tab

**Cause:** `loadUserOrganizationData` not being called, or user doesn't have tenant_id

**Fix:** Check frontend logs - should see "loadUserOrganizationData: Loading organization data"

## Quick Test Script

Run this in browser console after clicking Emulate:

```javascript
(async () => {
  const token = localStorage.getItem('progrc_jwt_token');
  if (!token) {
    console.error('No token found');
    return;
  }
  
  // Decode JWT
  const payload = JSON.parse(atob(token.split('.')[1]));
  console.log('JWT Payload:', payload);
  console.log('tenant_id:', payload.tenant_id);
  console.log('customerId:', payload.customerId);
  
  // Test /jwt-auth/me
  try {
    const meResponse = await fetch('/api/v1/jwt-auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const meData = await meResponse.json();
    console.log('/jwt-auth/me response:', meData);
    console.log('User tenant_id:', meData?.data?.user?.tenant_id);
    console.log('User customerId:', meData?.data?.user?.customerId);
  } catch (e) {
    console.error('Error calling /jwt-auth/me:', e);
  }
  
  // Test /onboarding/organization
  try {
    const orgResponse = await fetch('/api/v1/onboarding/organization', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const orgData = await orgResponse.json();
    console.log('/onboarding/organization response:', orgData);
    console.log('Organization data:', orgData?.data?.data);
  } catch (e) {
    console.error('Error calling /onboarding/organization:', e);
  }
})();
```

## Next Steps

1. Run the test script above
2. Share the console output
3. Share the backend logs
4. Share the Network tab responses

This will help identify exactly where the flow is breaking.




