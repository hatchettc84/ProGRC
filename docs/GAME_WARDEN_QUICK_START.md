# Game Warden API Testing - Quick Start

This guide will help you quickly get started with testing your Game Warden APIs.

## Prerequisites

1. **Node.js and npm** installed
2. **Your NestJS application** running locally
3. **Valid JWT token** from your Game Warden environment
4. **jq** (optional, for JSON formatting)

## Quick Setup

### 1. Set Environment Variables

```bash
# Copy the example environment file
cp docs/GAME_WARDEN_ENV_EXAMPLE.env .env

# Edit the .env file with your actual values
KEYCLOAK_JWKS_URL=https://login.afwerx.dso.mil/auth/realms/gamewarden/protocol/openid-connect/certs
JWT_AUDIENCE=your-client-id-here
KEYCLOAK_ISSUER=https://login.afwerx.dso.mil/auth/realms/gamewarden
```

### 2. Get a JWT Token

You need a valid JWT token from your Game Warden environment. This token should be obtained through the normal authentication flow in your application.

### 3. Test with the Provided Script

```bash
# Make the script executable (if not already)
chmod +x scripts/test-game-warden.sh

# Run the test script
export JWT_TOKEN="your-jwt-token-here"
./scripts/test-game-warden.sh

# Or run with command line arguments
./scripts/test-game-warden.sh -u http://localhost:3000 -t "your-jwt-token-here"
```

## Manual Testing with cURL

### Test Public Endpoint

```bash
curl -X GET "http://localhost:3000/auth/game-warden/public-info" \
  -H "Content-Type: application/json"
```

### Test Protected Endpoint

```bash
curl -X GET "http://localhost:3000/auth/game-warden/profile" \
  -H "Authorization: Bearer your-jwt-token-here" \
  -H "Content-Type: application/json"
```

### Test Admin Endpoint

```bash
curl -X GET "http://localhost:3000/auth/game-warden/admin-only" \
  -H "Authorization: Bearer your-jwt-token-here" \
  -H "Content-Type: application/json"
```

## Running Automated Tests

### Unit Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- game-warden-jwt.service.spec.ts

# Run with coverage
npm test -- --coverage
```

### Integration Tests

```bash
# Run e2e tests
npm run test:e2e

# Run specific e2e test
npm run test:e2e -- game-warden.controller.spec.ts
```

## Understanding the JWT Exchange Flow

### How It Works

1. **Client Request**: Your frontend makes a request to your API
2. **Authservice Interception**: Platform One's Authservice intercepts the request
3. **Token Injection**: Authservice adds JWT token to `Authorization: Bearer <token>` header
4. **Your API Processing**:
   - `GameWardenAuthGuard` extracts the token
   - `GameWardenJwtService` validates it using Keycloak's JWKS endpoint
   - User information is extracted from JWT claims
   - Authorization checks are performed
   - User object is attached to the request

### Key Components

- **GameWardenAuthGuard**: Handles authentication
- **GameWardenJwtService**: Validates JWT tokens
- **JWKS Client**: Fetches public keys from Keycloak
- **Authorization Decorators**: Control access based on groups/roles

## Common Test Scenarios

### 1. Authentication Tests

- ✅ Valid token → 200 OK
- ❌ Invalid token → 401 Unauthorized
- ❌ Expired token → 401 Unauthorized
- ❌ Missing token → 401 Unauthorized

### 2. Authorization Tests

- ✅ User with required groups → 200 OK
- ❌ User without required groups → 403 Forbidden
- ✅ Admin user → 200 OK
- ❌ Non-admin user → 403 Forbidden

### 3. Public Endpoint Tests

- ✅ No authentication required → 200 OK

## Troubleshooting

### "Game Warden configuration not found"

Check your environment variables:
```bash
echo $KEYCLOAK_JWKS_URL
echo $JWT_AUDIENCE
echo $KEYCLOAK_ISSUER
```

### "Invalid token format"

Decode your JWT token to check its structure:
```bash
echo "your-jwt-token" | cut -d'.' -f2 | base64 -d | jq .
```

### "Token has expired"

Get a fresh JWT token from your Game Warden environment.

### "JWKS endpoint not accessible"

Test connectivity:
```bash
curl -I "https://login.afwerx.dso.mil/auth/realms/gamewarden/protocol/openid-connect/certs"
```

## Next Steps

1. **Read the full testing guide**: `docs/GAME_WARDEN_TESTING_GUIDE.md`
2. **Review the implementation docs**: `docs/GAME_WARDEN_IMPLEMENTATION.md`
3. **Create your own test cases** based on your specific requirements
4. **Set up CI/CD pipeline** with automated testing

## Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the logs in your application
3. Verify your environment configuration
4. Contact your development team

## Example JWT Token Structure

A typical Game Warden JWT token contains:

```json
{
  "iss": "https://login.afwerx.dso.mil/auth/realms/gamewarden",
  "sub": "123e4567-e89b-12d3-a456-426614174000",
  "aud": "your-client-id",
  "exp": 1703123456,
  "iat": 1703119856,
  "email": "user@example.com",
  "name": "John Doe",
  "groups": ["/Customers/mycompany/developers"],
  "realm_access": {
    "roles": ["user", "developer"]
  }
}
```

This structure is automatically handled by the `GameWardenJwtService` and `GameWardenAuthGuard`. 