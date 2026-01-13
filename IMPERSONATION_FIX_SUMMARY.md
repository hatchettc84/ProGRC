# Impersonation Fix Summary

## Issue
System information not loading after clicking "Emulate" button on VPS.

## Root Causes Identified & Fixed

### 1. **Frontend State Management**
- **Issue**: User state wasn't being properly updated with `tenant_id`/`customerId` from API response
- **Fix**: 
  - Removed redundant mapping (`tenant_id: userData.user.tenant_id || userData.user.tenant_id`)
  - Added explicit state updates with proper timing
  - Added delays to ensure state is updated before loading organization

### 2. **Backend JWT Payload Extraction**
- **Issue**: `getMe` endpoint might not always extract `tenant_id`/`customerId` from JWT payload
- **Fix**:
  - Enhanced logging in `getMe` to track JWT payload contents
  - Added support for both `email` and `sub` fields (JWT standard)
  - Always include `tenant_id` and `customerId` from JWT payload in response
  - Fallback to database `customer_id` for non-impersonated users

### 3. **Organization API Call Timing**
- **Issue**: Organization API might be called before user state is fully updated
- **Fix**:
  - Added small delays (50ms) to ensure state updates complete
  - Enhanced error handling to preserve existing organization data on temporary errors
  - Added comprehensive logging throughout the flow

### 4. **Frontend API Response Handling**
- **Issue**: Response structure might not be properly parsed
- **Fix**:
  - Added logging in `getUserAPI` to track response structure
  - Enhanced error messages
  - Better handling of nested response data

## Files Modified

### Backend
1. `src/auth/services/jwt-auth.service.ts`
   - Enhanced `getMe` with comprehensive logging
   - Support for both `email` and `sub` fields
   - Always include `tenant_id`/`customerId` from JWT payload

2. `src/onboarding/onboarding.service.ts`
   - Enhanced `getOrganizationInfo` with logging
   - Support for both `tenant_id` and `customerId`
   - Better error messages

### Frontend
1. `src/store/useAuth/useAuth.store.ts`
   - Fixed redundant `tenant_id`/`customerId` mapping
   - Added state update delays
   - Enhanced error handling in `loadUserOrganizationData`
   - Better organization loading logic

2. `src/App.tsx`
   - Enhanced impersonation detection
   - Added delays for state updates
   - Better organization loading after impersonation

3. `src/api/auth/getUserAPI.ts`
   - Added response structure logging
   - Better error handling

## Testing Checklist

After deployment, test the following:

1. **Login as SuperAdmin**
   - ✅ Should work normally

2. **Click "Emulate" button**
   - ✅ Should show "Access Granted Successfully" toast
   - ✅ Page should reload
   - ✅ Should redirect to `/dashboard/home`

3. **Check Browser Console**
   - ✅ Should see: `🔄 Impersonation detected, forcing fresh user check...`
   - ✅ Should see: `checkUser: Received user data from API` with `tenant_id` and `customerId`
   - ✅ Should see: `loadUserOrganizationData: Loading organization data`
   - ✅ Should see: `loadUserOrganizationData: Organization loaded successfully`

4. **Check Network Tab**
   - ✅ `GET /api/v1/jwt-auth/me` should return user with `tenant_id`/`customerId`
   - ✅ `GET /api/v1/onboarding/organization` should return organization data

5. **Verify System Information**
   - ✅ Organization name should be displayed
   - ✅ License information should be visible
   - ✅ All organization data should load correctly

## Debugging Commands

### Check Backend Logs
```bash
ssh root@168.231.70.205
cd /root/bff-service-backend-dev
docker compose logs app --tail 200 | grep -iE "getMe|getOrganizationInfo|tenant_id|customerId"
```

### Check Frontend
Open browser console and look for:
- `getUserAPI: Response structure` - Should show `tenant_id` and `customerId`
- `checkUser: Received user data from API` - Should show tenant context
- `loadUserOrganizationData: Loading organization data` - Should show tenant_id/customerId

## Expected Flow

1. User clicks "Emulate" → `postImpersonateCustomerAPI` called
2. JWT token set with `tenant_id` and `customerId` in payload
3. localStorage flag set: `progrc_impersonation_just_started = true`
4. Page reloads: `window.location.href = "/dashboard/home"`
5. After reload:
   - App.tsx detects impersonation flag
   - Clears user state
   - Calls `checkUser()`
   - `checkUser` calls `/jwt-auth/me` → Backend extracts `tenant_id`/`customerId` from JWT
   - Response includes `tenant_id` and `customerId` in user object
   - Frontend sets user state with `tenant_id`/`customerId`
   - `loadUserOrganizationData()` called
   - `/onboarding/organization` called with `tenant_id` from JWT
   - Organization data loaded and displayed

## If Issue Persists

1. Check browser console for specific error messages
2. Verify JWT token contains `tenant_id`/`customerId`:
   ```javascript
   const token = localStorage.getItem('progrc_jwt_token');
   const payload = JSON.parse(atob(token.split('.')[1]));
   console.log('JWT Payload:', payload);
   ```
3. Check backend logs for `getMe` and `getOrganizationInfo` calls
4. Verify organization exists in database with the correct ID
5. Test API endpoints directly with the impersonated token




