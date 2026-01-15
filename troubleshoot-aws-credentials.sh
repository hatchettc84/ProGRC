#!/bin/bash
# Troubleshoot AWS credentials

set -e

export AWS_ACCESS_KEY_ID="${AWS_ACCESS_KEY_ID:-AKIAVKP4EJIRV23NAX5U}"
export AWS_SECRET_ACCESS_KEY="${AWS_SECRET_ACCESS_KEY:-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}"
export AWS_DEFAULT_REGION="${AWS_DEFAULT_REGION:-us-east-1}"

echo "=========================================="
echo "AWS Credentials Troubleshooting"
echo "=========================================="
echo ""

echo "1. Testing AWS credentials with verbose output..."
aws sts get-caller-identity --region us-east-1 2>&1 || {
    echo ""
    echo "❌ Credentials verification failed"
    echo ""
    echo "Common issues:"
    echo "1. Invalid credentials - check Access Key ID and Secret Key"
    echo "2. Credentials don't have necessary permissions"
    echo "3. Network/SSL issues"
    echo "4. AWS CLI not properly configured"
    echo ""
    echo "Try these steps:"
    echo ""
    echo "a) Verify credentials are correct:"
    echo "   echo \$AWS_ACCESS_KEY_ID"
    echo "   echo \$AWS_SECRET_ACCESS_KEY"
    echo ""
    echo "b) Test with a simple AWS command:"
    echo "   aws s3 ls --region us-east-1"
    echo ""
    echo "c) Check if credentials have Cognito permissions:"
    echo "   aws cognito-idp list-user-pools --max-results 1 --region us-east-1"
    echo ""
    exit 1
}

echo "✅ Credentials verified successfully!"
echo ""
