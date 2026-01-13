# Test Admin User

## Overview

A test admin user has been created for development and testing purposes. This user is created automatically when you run database migrations.

## Credentials

- **Email**: `admin@progrc.com`
- **Password**: `adminadmin`
- **Role**: SuperAdmin (Full access)

## Setup

The test admin user is created automatically when you run database migrations. After running migrations, **restart Docker containers** to ensure the user is available:

```bash
# Run migrations (if not already done)
docker-compose exec app npm run migration:up

# Restart Docker containers to ensure changes are applied
docker-compose restart
```

## Usage

### Login via API

```bash
curl -X POST http://localhost:3000/api/v1/jwt-auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@progrc.com",
    "password": "adminadmin"
  }'
```

### Login via Frontend

1. Navigate to the login page
2. Enter email: `admin@progrc.com`
3. Enter password: `adminadmin`
4. Click Login

## Important Notes

⚠️ **WARNING**: This test user is for **DEVELOPMENT AND TESTING ONLY**.

### Before Production Deployment

1. **Remove the migration**: Delete or disable the migration file:
   - `src/migrations/1744000000000-CreateTestAdminUser.ts`

2. **Remove existing test user** (if already created):
   ```sql
   DELETE FROM password_history WHERE user_id IN (
     SELECT id FROM users WHERE email = 'admin@progrc.com'
   );
   DELETE FROM users WHERE email = 'admin@progrc.com';
   ```

3. **Set up proper authentication**: Configure AWS Cognito or JWT authentication as per your deployment guide.

## Migration Details

The test admin user is created by the migration:
- **File**: `src/migrations/1744000000000-CreateTestAdminUser.ts`
- **Runs**: Automatically when you execute `npm run migration:up`
- **Can be reverted**: Run `npm run migration:down` to remove the user

## Security Considerations

- This user has **SuperAdmin** privileges (full system access)
- The password is weak (`adminadmin`) and should **never** be used in production
- The user is created with:
  - MFA disabled
  - Account unlocked
  - Password reset not required
  - Invite status: JOINED

## Next Steps

After testing, configure proper authentication:
- **AWS Deployment**: See [DEPLOYMENT_AWS.md](DEPLOYMENT_AWS.md) for Cognito setup
- **VPS Deployment**: See [DEPLOYMENT_VPS.md](DEPLOYMENT_VPS.md) for JWT configuration

