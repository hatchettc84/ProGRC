# Game Warden P1 SSO Implementation

This document provides comprehensive documentation for the Game Warden Platform One (P1) SSO authentication implementation in the NestJS backend.

## Overview

The Game Warden authentication system integrates with Keycloak through Platform One SSO to provide secure, claims-based authentication and authorization. The system automatically validates JWT tokens injected by Authservice and provides granular access control based on user groups and roles.

## Architecture

### Components

1. **GameWardenJwtService** - Core JWT validation and user extraction
2. **GameWardenAuthGuard** - NestJS guard for authentication and authorization
3. **Authorization Decorators** - Custom decorators for access control
4. **Configuration** - Environment-based configuration management
5. **Controller** - Example endpoints demonstrating usage

### Flow

1. Authservice automatically injects JWT tokens into the `Authorization` header
2. `GameWardenAuthGuard` extracts and validates the token using Keycloak's JWKS endpoint
3. User information is extracted from JWT claims
4. Authorization checks are performed based on decorators
5. User object is attached to the request for use in controllers

## Configuration

### Environment Variables

```bash
# Required
KEYCLOAK_JWKS_URL=https://login.afwerx.dso.mil/auth/realms/gamewarden/protocol/openid-connect/certs
JWT_AUDIENCE=your-client-id-here

# Optional
KEYCLOAK_ISSUER=https://login.afwerx.dso.mil/auth/realms/gamewarden
JWT_EXPIRATION_BUFFER=300
```

### Configuration File

```typescript
// src/config/game-warden.config.ts
export default registerAs('gameWarden', (): GameWardenAuthConfig => ({
  jwksUrl: process.env.KEYCLOAK_JWKS_URL,
  audience: process.env.JWT_AUDIENCE,
  issuer: process.env.KEYCLOAK_ISSUER,
  algorithms: ['RS256'],
  tokenExpirationBuffer: parseInt(process.env.JWT_EXPIRATION_BUFFER || '300', 10),
}));
```

## JWT Claims Structure

Game Warden JWT tokens contain the following claims:

```typescript
interface GameWardenJwtPayload {
  // Standard JWT claims
  iss: string;        // issuer
  sub: string;        // subject (unique Keycloak user ID)
  aud: string;        // audience
  exp: number;        // expiration time
  iat: number;        // issued at
  
  // Game Warden specific claims
  email: string;
  email_verified?: boolean;
  name?: string;
  preferred_username?: string;
  
  // Group memberships (e.g., "/Customers/mycompany/developers")
  groups?: string[];
  
  // Realm access roles
  realm_access?: {
    roles: string[];
  };
  
  // Session info
  session_state?: string;
  acr?: string;
}
```

## Usage

### Basic Authentication

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { GameWardenAuthGuard } from '../guards/game-warden-auth.guard';
import { CurrentUser } from '../decorators/game-warden.decorators';
import { GameWardenUser } from '../interfaces/game-warden.interface';

@Controller('api')
@UseGuards(GameWardenAuthGuard)
export class ApiController {
  @Get('profile')
  async getProfile(@CurrentUser() user: GameWardenUser) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      groups: user.groups,
      roles: user.roles,
    };
  }
}
```

### Group-Based Authorization

```typescript
import { RequireGroups } from '../decorators/game-warden.decorators';

@Controller('api')
@UseGuards(GameWardenAuthGuard)
export class ApiController {
  @Get('developers-only')
  @RequireGroups('developers', 'engineers')
  async developersOnly(@CurrentUser() user: GameWardenUser) {
    return { message: 'Access granted to developers' };
  }
}
```

### Role-Based Authorization

```typescript
import { RequireRoles } from '../decorators/game-warden.decorators';

@Controller('api')
@UseGuards(GameWardenAuthGuard)
export class ApiController {
  @Get('admin-only')
  @RequireRoles('admin', 'administrator')
  async adminOnly(@CurrentUser() user: GameWardenUser) {
    return { message: 'Admin access granted' };
  }
}
```

### Public Endpoints

```typescript
import { Public } from '../decorators/game-warden.decorators';

@Controller('api')
@UseGuards(GameWardenAuthGuard)
export class ApiController {
  @Get('public')
  @Public()
  async publicEndpoint() {
    return { message: 'Public information' };
  }
}
```

### Admin Check

```typescript
import { RequireAdmin } from '../decorators/game-warden.decorators';

@Controller('api')
@UseGuards(GameWardenAuthGuard)
export class ApiController {
  @Get('super-admin')
  @RequireAdmin()
  async superAdminOnly(@CurrentUser() user: GameWardenUser) {
    return { message: 'Super admin access' };
  }
}
```

## API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/auth/game-warden/profile` | Get current user profile | Yes |
| GET | `/auth/game-warden/groups` | Get user groups (requires developers/engineers) | Yes |
| GET | `/auth/game-warden/admin-only` | Admin-only endpoint | Yes (Admin) |
| POST | `/auth/game-warden/validate-token` | Validate JWT token | Yes (Validator/Admin) |
| GET | `/auth/game-warden/public-info` | Public information | No |
| GET | `/auth/game-warden/customer-groups` | Customer-specific groups | Yes (Customers) |

### Response Format

All endpoints return responses in the standard format:

```typescript
{
  success: boolean;
  message: string;
  data: any;
}
```

## Security Features

### JWT Validation

- **Signature Verification**: Uses Keycloak's JWKS endpoint to verify token signatures
- **Expiration Check**: Validates token expiration with configurable buffer
- **Issuer Validation**: Ensures tokens are issued by the correct Keycloak realm
- **Audience Validation**: Verifies tokens are intended for the correct client

### Authorization

- **Group-Based Access Control**: Restrict access based on user group memberships
- **Role-Based Access Control**: Control access using Keycloak roles
- **Admin Detection**: Automatic detection of admin privileges
- **Flexible Matching**: Supports both exact and pattern-based group matching

### Error Handling

- **Comprehensive Logging**: All authentication failures are logged with context
- **Specific Error Messages**: Different error types for different failure scenarios
- **Security Headers**: Proper HTTP status codes for different error types

## Testing

### Unit Tests

Run the test suite:

```bash
npm run test src/auth/services/game-warden-jwt.service.spec.ts
```

### Test Coverage

The test suite covers:

- JWT token validation
- User extraction from claims
- Group and role authorization
- Error handling scenarios
- Admin privilege detection

### Mock JWT Tokens

For testing, you can create mock JWT tokens with the following structure:

```typescript
const mockToken = {
  header: { kid: 'test-key-id' },
  payload: {
    iss: 'https://login.afwerx.dso.mil/auth/realms/gamewarden',
    sub: '123e4567-e89b-12d3-a456-426614174000',
    aud: 'test-client-id',
    exp: Math.floor(Date.now() / 1000) + 3600,
    iat: Math.floor(Date.now() / 1000),
    email: 'test@example.com',
    name: 'Test User',
    groups: ['/Customers/mycompany/developers'],
    realm_access: { roles: ['user', 'developer'] },
  },
};
```

## Integration with Existing System

### Module Integration

The Game Warden authentication is integrated into the existing auth module:

```typescript
// src/auth/auth.module.ts
@Module({
  providers: [
    // ... existing providers
    GameWardenJwtService,
    GameWardenAuthGuard,
  ],
  exports: [
    // ... existing exports
    GameWardenJwtService,
    GameWardenAuthGuard,
  ],
  controllers: [
    // ... existing controllers
    GameWardenController,
  ],
})
export class AuthModule {}
```

### Configuration Integration

Game Warden configuration is loaded alongside existing configurations:

```typescript
// src/app/app.module.ts
ConfigModule.forRoot({
  isGlobal: true,
  load: [platformOneConfig, gameWardenConfig],
}),
```

## Best Practices

### Security

1. **Always validate JWT signatures** using the JWKS endpoint
2. **Check token expiration** with appropriate buffer time
3. **Validate required claims** (sub, email) before processing
4. **Use specific error messages** for different failure types
5. **Log authentication failures** for monitoring and debugging

### Performance

1. **Cache JWKS keys** to reduce HTTP requests
2. **Use efficient group/role matching** algorithms
3. **Minimize token validation overhead** in high-traffic scenarios
4. **Implement proper error handling** to avoid unnecessary processing

### Maintainability

1. **Use TypeScript interfaces** for type safety
2. **Follow NestJS patterns** for consistency
3. **Implement comprehensive testing** for all scenarios
4. **Document configuration options** clearly
5. **Use meaningful error messages** for debugging

## Troubleshooting

### Common Issues

1. **Invalid Token Format**
   - Check that the Authorization header contains a valid Bearer token
   - Verify the token is properly formatted

2. **Token Expired**
   - Check system clock synchronization
   - Verify token expiration buffer configuration

3. **Invalid Signature**
   - Ensure JWKS endpoint is accessible
   - Check that the correct Keycloak realm is configured

4. **Missing Claims**
   - Verify that the JWT contains required claims (sub, email)
   - Check Keycloak user profile configuration

### Debugging

Enable debug logging by setting the log level:

```typescript
// In your logger configuration
{
  level: 'debug',
}
```

### Monitoring

Monitor authentication metrics:

- Token validation success/failure rates
- Authorization failure patterns
- JWKS endpoint response times
- User group/role distribution

## Migration Guide

### From Existing Authentication

If migrating from an existing authentication system:

1. **Update environment variables** with Game Warden configuration
2. **Replace existing guards** with GameWardenAuthGuard where appropriate
3. **Update user extraction** to use @CurrentUser() decorator
4. **Migrate authorization logic** to use new decorators
5. **Update tests** to use mock Game Warden tokens

### Backward Compatibility

The implementation maintains backward compatibility with existing authentication systems by:

- Supporting multiple authentication methods simultaneously
- Providing clear migration paths
- Maintaining existing API contracts where possible

## Support

For issues or questions regarding the Game Warden implementation:

1. Check the troubleshooting section above
2. Review the test cases for usage examples
3. Consult the Keycloak documentation for token format details
4. Contact the development team for additional support 