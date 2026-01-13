# CRITICAL: Frontend Fix Required for Impersonation

## Issue
After impersonation, the frontend is not updating localStorage with the new tokens from the impersonation response. This causes subsequent requests to use the old token (without `tenant_id`/`customerId`), breaking impersonation functionality.

## Root Cause
1. User clicks "Emulate" → Frontend calls `/api/v1/impersonations`
2. Backend generates new tokens with `tenant_id` and `customerId`
3. Backend returns tokens in response: `{ accessToken: "...", refreshToken: "..." }`
4. **PROBLEM**: Frontend is NOT updating localStorage with the new tokens
5. Frontend makes next request → Uses OLD token from localStorage (without `tenant_id`/`customerId`)
6. Backend receives request with old token → No impersonation context

## Required Frontend Fix

### Location: `frontend-app-main/src/views/superadmin/DisplayOrgView/api/postImpersonateCustomerAPI.ts`

**Current behavior (likely):**
```typescript
// Frontend probably just calls the API and doesn't update localStorage
const response = await postImpersonateCustomerAPI(customerId);
// Missing: Update localStorage with new tokens
```

**Required fix:**
```typescript
import { setJwtToken, setRefreshToken } from "@/utils/jwt-token.util";

export const postImpersonateCustomerAPI = async (customerId: string) => {
  const response = await request({
    method: "POST",
    url: "/impersonations",
    data: { customer_id: customerId }
  });

  // CRITICAL: Update localStorage with new tokens from response
  if (response?.data?.data?.accessToken) {
    setJwtToken(response.data.data.accessToken);
  }
  if (response?.data?.data?.refreshToken) {
    setRefreshToken(response.data.data.refreshToken);
  }

  return response;
};
```

### Location: `frontend-app-main/src/utils/axios-request.util.ts`

**Ensure axios interceptor reads from localStorage:**
```typescript
// The axios interceptor should read token from localStorage
// and add it to Authorization header for all requests
instance.interceptors.request.use((config) => {
  const token = getJwtToken(); // Should read from localStorage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## Backend Response Format

The backend returns tokens in this format (wrapped by TransformInterceptor):
```json
{
  "code": "200",
  "message": "Successfully logged in",
  "data": {
    "accessToken": "eyJhbGciOiJSUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

Frontend should read: `response.data.data.accessToken` and `response.data.data.refreshToken`

## Verification Steps

1. Open browser console
2. Call impersonation API
3. Check localStorage: `localStorage.getItem('progrc_jwt_token')`
4. Decode token: `JSON.parse(atob(token.split('.')[1]))`
5. Verify token has `tenant_id` and `customerId`

If token doesn't have `tenant_id`/`customerId`, the frontend is not updating localStorage.

## Temporary Workaround

Until the frontend is fixed, users can manually update localStorage:
1. Open browser console
2. Call impersonation API
3. Copy the `accessToken` from the response
4. Run: `localStorage.setItem('progrc_jwt_token', '<accessToken>')`
5. Refresh the page

## Backend Status

✅ Backend is correctly:
- Generating tokens with `tenant_id` and `customerId`
- Returning tokens in response
- Setting cookies with new tokens
- Clearing old cookies before setting new ones
- Prioritizing header tokens over cookie tokens

❌ Frontend needs to:
- Update localStorage with tokens from impersonation response
- Use new tokens in subsequent requests




