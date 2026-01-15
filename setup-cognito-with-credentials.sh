#!/bin/bash
# Setup AWS Cognito with provided credentials
# Run this script on your local machine

set -e

# Set your credentials here (or export them before running)
export AWS_ACCESS_KEY_ID="${AWS_ACCESS_KEY_ID:-AKIAVKP4EJIRV23NAX5U}"
export AWS_SECRET_ACCESS_KEY="${AWS_SECRET_ACCESS_KEY:-/C4rK4LlCLN1sldcqbixqQoYCK67beq1iC/Rm00L}"
export AWS_DEFAULT_REGION="${AWS_DEFAULT_REGION:-us-east-1}"

echo "=========================================="
echo "AWS Cognito Setup"
echo "=========================================="
echo ""

# Verify credentials
echo "Verifying AWS credentials..."
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS credentials verification failed"
    exit 1
fi

echo "✅ AWS credentials verified"
echo ""

# Configuration
USER_POOL_NAME="progrc-user-pool"
CLIENT_NAME="progrc-client"

# Step 1: Create User Pool
echo "1. Creating Cognito User Pool: $USER_POOL_NAME..."
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
    --region "$AWS_DEFAULT_REGION" 2>&1)

if [ $? -ne 0 ]; then
    echo "❌ Failed to create user pool"
    echo "$USER_POOL_RESPONSE"
    exit 1
fi

USER_POOL_ID=$(echo "$USER_POOL_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['UserPool']['Id'])" 2>/dev/null || \
    echo "$USER_POOL_RESPONSE" | grep -oP '"Id":\s*"\K[^"]+' | head -1)

if [ -z "$USER_POOL_ID" ]; then
    echo "❌ Could not extract User Pool ID"
    echo "Full response:"
    echo "$USER_POOL_RESPONSE"
    exit 1
fi

echo "✅ User Pool created: $USER_POOL_ID"
echo ""

# Step 2: Create App Client
echo "2. Creating App Client: $CLIENT_NAME..."
CLIENT_RESPONSE=$(aws cognito-idp create-user-pool-client \
    --user-pool-id "$USER_POOL_ID" \
    --client-name "$CLIENT_NAME" \
    --no-generate-secret \
    --explicit-auth-flows USER_PASSWORD_AUTH \
    --region "$AWS_DEFAULT_REGION" 2>&1)

if [ $? -ne 0 ]; then
    echo "❌ Failed to create app client"
    echo "$CLIENT_RESPONSE"
    exit 1
fi

CLIENT_ID=$(echo "$CLIENT_RESPONSE" | python3 -c "import sys, json; print(json.load(sys.stdin)['UserPoolClient']['ClientId'])" 2>/dev/null || \
    echo "$CLIENT_RESPONSE" | grep -oP '"ClientId":\s*"\K[^"]+' | head -1)

if [ -z "$CLIENT_ID" ]; then
    echo "❌ Could not extract Client ID"
    echo "Full response:"
    echo "$CLIENT_RESPONSE"
    exit 1
fi

echo "✅ App Client created: $CLIENT_ID"
echo ""

# Step 3: Display results
echo "=========================================="
echo "✅ Cognito Setup Complete!"
echo "=========================================="
echo ""
echo "User Pool ID: $USER_POOL_ID"
echo "Client ID: $CLIENT_ID"
echo "Region: $AWS_DEFAULT_REGION"
echo ""

# Step 4: Generate .env configuration
echo "=========================================="
echo "Add these to your .env file on the VPS:"
echo "=========================================="
echo ""
echo "COGNITO_USER_POOL_ID=$USER_POOL_ID"
echo "COGNITO_CLIENT_ID=$CLIENT_ID"
echo "COGNITO_REGION=$AWS_DEFAULT_REGION"
echo ""

# Step 5: Create test user script
echo "=========================================="
echo "To create a test user, run:"
echo "=========================================="
echo ""
echo "aws cognito-idp admin-create-user \\"
echo "  --user-pool-id $USER_POOL_ID \\"
echo "  --username test@example.com \\"
echo "  --user-attributes Name=email,Value=test@example.com Name=email_verified,Value=true \\"
echo "  --temporary-password TempPass123! \\"
echo "  --message-action SUPPRESS \\"
echo "  --region $AWS_DEFAULT_REGION"
echo ""
echo "aws cognito-idp admin-set-user-password \\"
echo "  --user-pool-id $USER_POOL_ID \\"
echo "  --username test@example.com \\"
echo "  --password YourPassword123! \\"
echo "  --permanent \\"
echo "  --region $AWS_DEFAULT_REGION"
echo ""
