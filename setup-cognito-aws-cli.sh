#!/bin/bash
# Setup AWS Cognito User Pool and App Client using AWS CLI

set -e

echo "=========================================="
echo "AWS Cognito Setup via CLI"
echo "=========================================="
echo ""

# Configuration
REGION="${AWS_REGION:-us-east-1}"
USER_POOL_NAME="progrc-user-pool"
CLIENT_NAME="progrc-client"

# Check AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed"
    echo "Install it with: pip install awscli or brew install awscli"
    exit 1
fi

# Check AWS credentials are configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS credentials not configured"
    echo "Run: aws configure"
    exit 1
fi

echo "✅ AWS CLI is configured"
echo "Region: $REGION"
echo ""

# Step 1: Create User Pool
echo "1. Creating Cognito User Pool..."
USER_POOL_RESPONSE=$(aws cognito-idp create-user-pool \
    --pool-name "$USER_POOL_NAME" \
    --auto-verified-attributes email \
    --policies '{
        "PasswordPolicy": {
            "MinimumLength": 8,
            "RequireUppercase": true,
            "RequireLowercase": true,
            "RequireNumbers": true,
            "RequireSymbols": false
        }
    }' \
    --schema '[
        {
            "Name": "email",
            "AttributeDataType": "String",
            "Required": true,
            "Mutable": true
        },
        {
            "Name": "name",
            "AttributeDataType": "String",
            "Required": false,
            "Mutable": true
        }
    ]' \
    --region "$REGION" 2>&1)

if [ $? -ne 0 ]; then
    echo "❌ Failed to create user pool"
    echo "$USER_POOL_RESPONSE"
    exit 1
fi

USER_POOL_ID=$(echo "$USER_POOL_RESPONSE" | grep -oP '"Id":\s*"\K[^"]+' | head -1)

if [ -z "$USER_POOL_ID" ]; then
    echo "❌ Could not extract User Pool ID from response"
    echo "Response: $USER_POOL_RESPONSE"
    exit 1
fi

echo "✅ User Pool created: $USER_POOL_ID"
echo ""

# Step 2: Create App Client (Public Client, no secret)
echo "2. Creating App Client..."
CLIENT_RESPONSE=$(aws cognito-idp create-user-pool-client \
    --user-pool-id "$USER_POOL_ID" \
    --client-name "$CLIENT_NAME" \
    --no-generate-secret \
    --explicit-auth-flows USER_PASSWORD_AUTH \
    --region "$REGION" 2>&1)

if [ $? -ne 0 ]; then
    echo "❌ Failed to create app client"
    echo "$CLIENT_RESPONSE"
    exit 1
fi

CLIENT_ID=$(echo "$CLIENT_RESPONSE" | grep -oP '"ClientId":\s*"\K[^"]+' | head -1)

if [ -z "$CLIENT_ID" ]; then
    echo "❌ Could not extract Client ID from response"
    echo "Response: $CLIENT_RESPONSE"
    exit 1
fi

echo "✅ App Client created: $CLIENT_ID"
echo ""

# Step 3: Display configuration
echo "=========================================="
echo "Cognito Configuration Complete!"
echo "=========================================="
echo ""
echo "User Pool ID: $USER_POOL_ID"
echo "Client ID: $CLIENT_ID"
echo "Region: $REGION"
echo ""

# Step 4: Generate .env configuration
echo "=========================================="
echo "Add to your .env file:"
echo "=========================================="
echo ""
echo "COGNITO_USER_POOL_ID=$USER_POOL_ID"
echo "COGNITO_CLIENT_ID=$CLIENT_ID"
echo "COGNITO_REGION=$REGION"
echo ""

# Step 5: Create a test user (optional)
echo "=========================================="
echo "Next Steps:"
echo "=========================================="
echo ""
echo "1. Add the above configuration to your .env file on the VPS"
echo ""
echo "2. Create a test user:"
echo "   aws cognito-idp admin-create-user \\"
echo "     --user-pool-id $USER_POOL_ID \\"
echo "     --username test@example.com \\"
echo "     --user-attributes Name=email,Value=test@example.com Name=email_verified,Value=true \\"
echo "     --temporary-password TempPass123! \\"
echo "     --message-action SUPPRESS \\"
echo "     --region $REGION"
echo ""
echo "3. Set permanent password:"
echo "   aws cognito-idp admin-set-user-password \\"
echo "     --user-pool-id $USER_POOL_ID \\"
echo "     --username test@example.com \\"
echo "     --password YourPassword123! \\"
echo "     --permanent \\"
echo "     --region $REGION"
echo ""
echo "4. Restart your app on the VPS:"
echo "   docker-compose restart app"
echo ""
