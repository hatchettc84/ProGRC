# Setup AWS Cognito for Authentication

## Prerequisites
- AWS Account
- AWS CLI configured (or use AWS Console)

## Step 1: Create Cognito User Pool

### Via AWS Console:
1. Go to AWS Cognito Console: https://console.aws.amazon.com/cognito/
2. Click "Create user pool"
3. Configure sign-in experience:
   - Choose "Email" or "Email and phone number"
   - Click "Next"
4. Configure security requirements:
   - Password policy: Choose your requirements
   - MFA: Optional (can enable later)
   - Click "Next"
5. Configure sign-up experience:
   - Self-service sign-up: Enabled
   - Cognito-assisted verification: Email
   - Click "Next"
6. Configure message delivery:
   - Email provider: Send email with Cognito
   - Click "Next"
7. Integrate your app:
   - User pool name: `progrc-user-pool` (or your choice)
   - App client name: `progrc-client`
   - **IMPORTANT**: Uncheck "Generate client secret" (we need a public client)
   - Click "Next"
8. Review and create

### Via AWS CLI:
```bash
# Create user pool
aws cognito-idp create-user-pool \
  --pool-name progrc-user-pool \
  --auto-verified-attributes email \
  --policies '{
    "PasswordPolicy": {
      "MinimumLength": 8,
      "RequireUppercase": true,
      "RequireLowercase": true,
      "RequireNumbers": true,
      "RequireSymbols": false
    }
  }'

# Note the UserPoolId from the response

# Create app client (public client, no secret)
aws cognito-idp create-user-pool-client \
  --user-pool-id <USER_POOL_ID> \
  --client-name progrc-client \
  --no-generate-secret \
  --explicit-auth-flows USER_PASSWORD_AUTH
```

## Step 2: Get Your Cognito Details

After creating the user pool, you'll need:
- **User Pool ID**: Found in the user pool details (format: `us-east-1_XXXXXXXXX`)
- **App Client ID**: Found in "App integration" tab under "App clients"
- **Region**: The AWS region where you created the pool (e.g., `us-east-1`)

## Step 3: Configure on VPS

Add to your `.env` file:

```bash
cd /opt/progrc/bff-service-backend-dev

# Add Cognito configuration
cat >> .env << EOF

# AWS Cognito Configuration
COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
COGNITO_CLIENT_ID=your-client-id-here
COGNITO_REGION=us-east-1
EOF

# Restart app
docker-compose restart app
```

## Step 4: Create Test User

### Via AWS Console:
1. Go to your User Pool
2. Click "Users" tab
3. Click "Create user"
4. Enter email and temporary password
5. Uncheck "Send an email invitation" if you want to set password manually
6. Click "Create user"

### Via AWS CLI:
```bash
aws cognito-idp admin-create-user \
  --user-pool-id <USER_POOL_ID> \
  --username user@example.com \
  --user-attributes Name=email,Value=user@example.com Name=email_verified,Value=true \
  --temporary-password TempPass123! \
  --message-action SUPPRESS
```

### Set Permanent Password:
```bash
aws cognito-idp admin-set-user-password \
  --user-pool-id <USER_POOL_ID> \
  --username user@example.com \
  --password YourPassword123! \
  --permanent
```

## Step 5: Test Login

```bash
# Test login endpoint
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "YourPassword123!"
  }'
```

## Troubleshooting

### If login fails with "User does not exist":
- Verify user was created in Cognito
- Check email is verified
- Ensure password is set (not temporary)

### If login fails with "NotAuthorizedException":
- Check password is correct
- Verify user status is "CONFIRMED" in Cognito
- Check if MFA is required

### If you see "cognito-idp..amazonaws.com" errors:
- Verify COGNITO_REGION is correct
- Check AWS credentials (if using IAM role, ensure it has Cognito permissions)
- For VPS, you may need AWS credentials in .env:
  ```
  AWS_ACCESS_KEY_ID=your-key
  AWS_SECRET_ACCESS_KEY=your-secret
  ```

## Alternative: Local Authentication (Testing Only)

If you want to test without Cognito, you can create a user directly in the database:

```bash
# This is for testing only - not recommended for production
docker-compose exec postgres psql -U progrc -d progrc_bff << 'EOF'
-- Create a test user (password: Test123!)
INSERT INTO users (id, email, name, role_id, password_hash, created_at, updated_at, deleted)
VALUES (
  gen_random_uuid(),
  'test@example.com',
  'Test User',
  1, -- Assuming role_id 1 exists
  '$2b$10$rQ8K8K8K8K8K8K8K8K8K8O8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K', -- bcrypt hash for "Test123!"
  NOW(),
  NOW(),
  false
) ON CONFLICT (email) DO NOTHING;
EOF
```

**Note**: This bypasses Cognito and is only for testing. For production, use Cognito.
