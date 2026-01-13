# Game Warden API Testing Guide

This guide provides comprehensive information on how to test your Game Warden APIs and understand the JWT exchange flow.

## Table of Contents

1. [JWT Exchange Flow](#jwt-exchange-flow)
2. [Testing Strategies](#testing-strategies)
3. [Manual Testing with cURL](#manual-testing-with-curl)
4. [Automated Testing](#automated-testing)
5. [Mock Testing](#mock-testing)
6. [Integration Testing](#integration-testing)
7. [Troubleshooting](#troubleshooting)

## JWT Exchange Flow

### How Game Warden Authentication Works

The Game Warden authentication system follows this flow:

```
1. Client Request → 2. Authservice → 3. Keycloak → 4. Your API
```

#### Step-by-Step Flow:

1. **Client Request**: Your frontend/application makes a request to your API
2. **Authservice Interception**: Platform One's Authservice automatically intercepts the request
3. **Token Injection**: Authservice injects a JWT token into the `Authorization: Bearer <token>` header
4. **Your API Processing**:
   - `GameWardenAuthGuard` extracts the token from the Authorization header
   - `GameWardenJwtService` validates the token using Keycloak's JWKS endpoint
   - User information is extracted from JWT claims
   - Authorization checks are performed based on decorators
   - User object is attached to the request

#### Key Components:

- **GameWardenAuthGuard**: NestJS guard that handles authentication
- **GameWardenJwtService**: Service that validates JWT tokens
- **JWKS Client**: Fetches public keys from Keycloak for token verification
- **Authorization Decorators**: Control access based on groups and roles

## Testing Strategies

### 1. Unit Testing
Test individual components in isolation with mocked dependencies.

### 2. Integration Testing
Test the complete authentication flow with real or mocked tokens.

### 3. End-to-End Testing
Test the full flow from client request to API response.

### 4. Manual Testing
Test APIs manually using tools like cURL, Postman, or browser.

## Manual Testing with cURL

### Prerequisites

1. **Get a valid JWT token** from your Game Warden environment
2. **Set up your environment variables**:
   ```bash
   export API_BASE_URL="http://localhost:3000"
   export JWT_TOKEN="your-jwt-token-here"
   ```

### Testing Public Endpoints

```bash
# Test public endpoint (no authentication required)
curl -X GET "http://localhost:3000/auth/game-warden/public-info" \
  -H "Content-Type: application/json"
```

### Testing Protected Endpoints

```bash
# Test profile endpoint (requires authentication)
curl -X GET "${API_BASE_URL}/auth/game-warden/profile" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json"

# Test groups endpoint (requires developers or engineers group)
curl -X GET "${API_BASE_URL}/auth/game-warden/groups" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json"

# Test admin-only endpoint (requires admin role)
curl -X GET "${API_BASE_URL}/auth/game-warden/admin-only" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json"

# Test token validation endpoint (requires validator or admin role)
curl -X POST "${API_BASE_URL}/auth/game-warden/validate-token" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"token": "another-jwt-token-to-validate"}'

# Test customer groups endpoint (requires customers group)
curl -X GET "${API_BASE_URL}/auth/game-warden/customer-groups" \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json"
```

### Testing Error Scenarios

```bash
# Test with invalid token
curl -X GET "${API_BASE_URL}/auth/game-warden/profile" \
  -H "Authorization: Bearer invalid-token" \
  -H "Content-Type: application/json"

# Test with expired token
curl -X GET "${API_BASE_URL}/auth/game-warden/profile" \
  -H "Authorization: Bearer expired-jwt-token" \
  -H "Content-Type: application/json"

# Test without Authorization header
curl -X GET "${API_BASE_URL}/auth/game-warden/profile" \
  -H "Content-Type: application/json"

# Test with insufficient permissions
curl -X GET "${API_BASE_URL}/auth/game-warden/admin-only" \
  -H "Authorization: Bearer non-admin-token" \
  -H "Content-Type: application/json"
```

## Automated Testing

### 1. Unit Tests

Create unit tests for individual components:

```typescript
// game-warden-jwt.service.spec.ts
describe('GameWardenJwtService', () => {
  describe('validateToken', () => {
    it('should validate a valid token and return user', async () => {
      // Test implementation
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      // Test implementation
    });
  });
});
```

### 2. Integration Tests

Test the complete authentication flow:

```typescript
// game-warden.integration.spec.ts
describe('GameWarden Integration', () => {
  it('should authenticate user with valid token', async () => {
    const response = await request(app.getHttpServer())
      .get('/auth/game-warden/profile')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200);

    expect(response.body.data.email).toBe('test@example.com');
  });

  it('should reject invalid token', async () => {
    await request(app.getHttpServer())
      .get('/auth/game-warden/profile')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);
  });
});
```

## Mock Testing

### Creating Mock JWT Tokens

For testing purposes, you can create mock JWT tokens:

```typescript
// test-utils/jwt-helper.ts
import * as jwt from 'jsonwebtoken';

export function createMockJwtToken(payload: any, secret = 'test-secret'): string {
  return jwt.sign(payload, secret, { algorithm: 'HS256' });
}

export const mockUserPayload = {
  iss: 'https://login.afwerx.dso.mil/auth/realms/gamewarden',
  sub: '123e4567-e89b-12d3-a456-426614174000',
  aud: 'test-client-id',
  exp: Math.floor(Date.now() / 1000) + 3600,
  iat: Math.floor(Date.now() / 1000),
  email: 'test@example.com',
  name: 'Test User',
  groups: ['/Customers/mycompany/developers'],
  realm_access: {
    roles: ['user', 'developer'],
  },
};

export const mockAdminPayload = {
  ...mockUserPayload,
  realm_access: {
    roles: ['user', 'admin'],
  },
};
```

### Mock JWKS Client

```typescript
// test-utils/jwks-mock.ts
export const mockJwksClient = {
  getSigningKey: jest.fn().mockResolvedValue({
    getPublicKey: jest.fn().mockReturnValue('mock-public-key'),
  }),
};

jest.mock('jwks-rsa', () => ({
  __esModule: true,
  default: jest.fn(() => mockJwksClient),
}));
```

## Integration Testing

### Testing with Real Game Warden Environment

1. **Set up test environment variables**:
   ```bash
   KEYCLOAK_JWKS_URL=https://login.afwerx.dso.mil/auth/realms/gamewarden/protocol/openid-connect/certs
   JWT_AUDIENCE=your-test-client-id
   KEYCLOAK_ISSUER=https://login.afwerx.dso.mil/auth/realms/gamewarden
   ```

2. **Get real JWT tokens** from your Game Warden environment

3. **Run integration tests**:
   ```bash
   npm run test:e2e
   ```

### Testing Different User Types

```typescript
describe('GameWarden User Types', () => {
  it('should allow developer access to developer endpoints', async () => {
    const developerToken = await getDeveloperToken();
    
    await request(app.getHttpServer())
      .get('/auth/game-warden/groups')
      .set('Authorization', `Bearer ${developerToken}`)
      .expect(200);
  });

  it('should allow admin access to admin endpoints', async () => {
    const adminToken = await getAdminToken();
    
    await request(app.getHttpServer())
      .get('/auth/game-warden/admin-only')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
  });

  it('should deny non-admin access to admin endpoints', async () => {
    const userToken = await getUserToken();
    
    await request(app.getHttpServer())
      .get('/auth/game-warden/admin-only')
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403);
  });
});
```

## Troubleshooting

### Common Issues and Solutions

#### 1. "Game Warden configuration not found"

**Problem**: Configuration not loaded properly
**Solution**: Check environment variables and configuration setup

```bash
# Verify environment variables
echo $KEYCLOAK_JWKS_URL
echo $JWT_AUDIENCE
echo $KEYCLOAK_ISSUER
```

#### 2. "Invalid token format"

**Problem**: JWT token is malformed
**Solution**: Verify token structure

```bash
# Decode JWT token to check structure
echo "your-jwt-token" | cut -d'.' -f2 | base64 -d | jq .
```

#### 3. "Token has expired"

**Problem**: JWT token is expired
**Solution**: Get a fresh token or adjust expiration buffer

```typescript
// Increase token expiration buffer in config
tokenExpirationBuffer: 600, // 10 minutes
```

#### 4. "Insufficient group permissions"

**Problem**: User doesn't have required groups
**Solution**: Check user group membership in Keycloak

```bash
# Check user groups in JWT token
echo "your-jwt-token" | cut -d'.' -f2 | base64 -d | jq '.groups'
```

#### 5. "JWKS endpoint not accessible"

**Problem**: Cannot reach Keycloak JWKS endpoint
**Solution**: Check network connectivity and URL

```bash
# Test JWKS endpoint accessibility
curl -I "https://login.afwerx.dso.mil/auth/realms/gamewarden/protocol/openid-connect/certs"
```

### Debug Logging

Enable debug logging to troubleshoot issues:

```typescript
// In your logger configuration
{
  level: 'debug',
}
```

### Monitoring Authentication

Monitor authentication metrics:

```typescript
// Add metrics collection
this.logger.log('Authentication attempt', {
  success: true,
  userEmail: user.email,
  groups: user.groups,
  roles: user.roles,
  endpoint: request.url,
});
```

## Testing Checklist

### Pre-Testing Setup
- [ ] Environment variables configured
- [ ] Game Warden configuration loaded
- [ ] JWKS endpoint accessible
- [ ] Valid JWT tokens available

### Authentication Testing
- [ ] Public endpoints work without authentication
- [ ] Protected endpoints require valid tokens
- [ ] Invalid tokens are rejected
- [ ] Expired tokens are rejected
- [ ] Missing Authorization header is handled

### Authorization Testing
- [ ] Group-based authorization works
- [ ] Role-based authorization works
- [ ] Admin-only endpoints are properly protected
- [ ] Insufficient permissions return 403

### Error Handling Testing
- [ ] Proper error messages for different failure types
- [ ] HTTP status codes are correct
- [ ] Error logging is working
- [ ] Graceful handling of network issues

### Performance Testing
- [ ] JWKS caching is working
- [ ] Token validation performance is acceptable
- [ ] No memory leaks in long-running tests
- [ ] Concurrent requests are handled properly

## Next Steps

1. **Set up your test environment** with the provided examples
2. **Create comprehensive test suites** for your specific use cases
3. **Implement monitoring and alerting** for authentication failures
4. **Document your testing procedures** for your team
5. **Set up CI/CD pipeline** with automated testing

For additional support, refer to the main Game Warden implementation documentation or contact your development team. 