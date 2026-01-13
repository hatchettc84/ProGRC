# JWT Token Debugging Guide

## Issue
The JWT token doesn't contain `tenant_id` or `customerId` after impersonation, causing organization data not to load.

## Root Cause
The backend JWT guard reads tokens from **cookies first**, then headers. If cookies contain an old token (without `tenant_id`/`customerId`), that token is used instead of the new one from localStorage.

## Flow Analysis

1. **Impersonation starts**: `postImpersonateCustomerAPI` is called
2. **Backend creates token**: `impersonateCustomer` creates JWT with `tenant_id` and `customerId`
3. **Backend sets cookies**: `setAuthCookies` sets `accessToken` and `refreshToken` in cookies
4. **Frontend sets localStorage**: `setJwtToken` stores token in localStorage
5. **Page reloads**: User is redirected to `/dashboard/home`
6. **Frontend makes API call**: `getUserAPI` sends request with `Authorization: Bearer <token>`
7. **Backend reads token**: JWT guard reads from **cookies first**, then headers
8. **Problem**: If cookies have old token, that's used instead of the new one from header!

## Debugging Steps

### 1. Check JWT Token in Browser Console
```javascript
// Check localStorage token
const token = localStorage.getItem('progrc_jwt_token');
if (token) {
  const payload = JSON.parse(atob(token.split('.')[1]));
  console.log('LocalStorage JWT Payload:', payload);
  console.log('tenant_id:', payload.tenant_id);
  console.log('customerId:', payload.customerId);
}

// Check cookies
console.log('Cookies:', document.cookie);
```

### 2. Check Backend Logs
```bash
ssh root@168.231.70.205
cd /root/bff-service-backend-dev
docker compose logs app --tail 200 | grep -iE "JwtAuthGuard|getMe|tenant_id|customerId"
```

Look for:
- `JwtAuthGuard: Token verified, payload extracted` - Should show `tenant_id` and `customerId`
- `getMe: Received userInfo payload` - Should show `tenant_id` and `customerId`
- `getMe: No tenant_id in JWT payload` - This indicates the problem!

### 3. Verify Token Source
The logs will show `tokenSource: 'cookie'` or `tokenSource: 'header'`. If it's 'cookie' and the token doesn't have `tenant_id`/`customerId`, that's the issue.

## Solutions

### Solution 1: Clear Cookies on Impersonation (Recommended)
Clear cookies before setting new token to ensure backend reads from header:

```typescript
// In postImpersonateCustomerAPI or handleImpersonateCustomer
// Clear old cookies
document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
document.cookie = 'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
```

### Solution 2: Ensure Header Token Takes Precedence
Modify JWT guard to prefer header token over cookie token when both exist:

```typescript
private extractTokenFromRequest(request: Request): string | undefined {
  // Prefer header token over cookie token (header is more reliable for impersonation)
  return this.extractTokenFromHeader(request) || this.extractTokenFromCookie(request);
}
```

### Solution 3: Verify Cookie Setting
Ensure cookies are being set correctly during impersonation. Check:
- Cookie domain
- Cookie path
- Cookie secure flag
- Cookie sameSite setting

## Expected Logs After Fix

### Frontend Console
```
getUserAPI: JWT Token Payload {tenant_id: '4f4d5a8a', customerId: '4f4d5a8a', ...}
getUserAPI: Response structure {tenant_id: '4f4d5a8a', customerId: '4f4d5a8a', ...}
checkUser: Received user data from API {tenant_id: '4f4d5a8a', customerId: '4f4d5a8a', ...}
```

### Backend Logs
```
JwtAuthGuard: Token verified, payload extracted {tenant_id: '4f4d5a8a', customerId: '4f4d5a8a', tokenSource: 'header'}
getMe: Received userInfo payload {tenant_id: '4f4d5a8a', customerId: '4f4d5a8a', ...}
getMe: Added tenant_id to response: 4f4d5a8a
getMe: Added customerId to response: 4f4d5a8a
```

## Next Steps

1. Test impersonation again
2. Check browser console for JWT token payload
3. Check backend logs for token source and payload
4. If token source is 'cookie' and doesn't have tenant_id, clear cookies before impersonation
5. If token source is 'header' but still doesn't have tenant_id, check if token is being set correctly in localStorage




