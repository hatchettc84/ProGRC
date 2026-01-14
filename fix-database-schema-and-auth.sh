#!/bin/bash
# Fix database schema and authentication setup

set -e

cd /opt/progrc/bff-service-backend-dev

echo "=========================================="
echo "Fixing Database Schema and Auth"
echo "=========================================="
echo ""

# 1. Add missing password_hash column
echo "1. Adding missing password_hash column..."
docker-compose exec postgres psql -U progrc -d progrc_bff << 'EOF'
DO $$ 
BEGIN 
    -- Add password_hash column if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'password_hash'
    ) THEN
        ALTER TABLE "users" ADD COLUMN "password_hash" varchar NULL;
        RAISE NOTICE 'Added password_hash column';
    ELSE
        RAISE NOTICE 'password_hash column already exists';
    END IF;
    
    -- Add other missing auth columns
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'is_locked'
    ) THEN
        ALTER TABLE "users" ADD COLUMN "is_locked" boolean NOT NULL DEFAULT false;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'mfa_enabled'
    ) THEN
        ALTER TABLE "users" ADD COLUMN "mfa_enabled" boolean NOT NULL DEFAULT false;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'last_password_change'
    ) THEN
        ALTER TABLE "users" ADD COLUMN "last_password_change" timestamp NULL;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'password_reset_required'
    ) THEN
        ALTER TABLE "users" ADD COLUMN "password_reset_required" boolean NOT NULL DEFAULT false;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'primary_mfa_type'
    ) THEN
        ALTER TABLE "users" ADD COLUMN "primary_mfa_type" varchar(50) NULL;
    END IF;
END $$;
EOF

echo "✅ Database schema updated"
echo ""

# 2. Check if Cognito is configured
echo "2. Checking Cognito configuration..."
if grep -q "COGNITO_USER_POOL_ID=" .env && ! grep -q "^COGNITO_USER_POOL_ID=$" .env; then
    echo "✅ Cognito is configured"
    COGNITO_CONFIGURED=true
else
    echo "⚠️  Cognito is not configured"
    COGNITO_CONFIGURED=false
fi
echo ""

# 3. Configure LocalStack for AWS services (if not using real AWS)
echo "3. Ensuring LocalStack configuration..."
if ! grep -q "^USE_LOCALSTACK=" .env; then
    echo "USE_LOCALSTACK=true" >> .env
fi

if ! grep -q "^LOCALSTACK_ENDPOINT=" .env; then
    echo "LOCALSTACK_ENDPOINT=http://localstack:4566" >> .env
fi

if ! grep -q "^AWS_S3_ENDPOINT=" .env; then
    echo "AWS_S3_ENDPOINT=http://localstack:4566" >> .env
fi

echo "✅ LocalStack configured"
echo ""

# 4. Restart app to apply changes
echo "4. Restarting app..."
docker-compose restart app

echo ""
echo "5. Waiting for app to start..."
sleep 20

# 6. Check app logs
echo ""
echo "6. Checking app logs..."
docker-compose logs app | grep -i "error\|database\|password_hash" | tail -10

# 7. Test health
echo ""
echo "7. Testing health endpoint..."
curl -s http://localhost:3001/api/v1/health && echo "" || echo "❌ Health check failed"

echo ""
echo "=========================================="
echo "Next Steps:"
echo "=========================================="
if [ "$COGNITO_CONFIGURED" = false ]; then
    echo "1. Configure AWS Cognito:"
    echo "   - Create Cognito User Pool in AWS"
    echo "   - Add to .env:"
    echo "     COGNITO_USER_POOL_ID=your-pool-id"
    echo "     COGNITO_CLIENT_ID=your-client-id"
    echo "     COGNITO_REGION=us-east-1"
    echo ""
fi
echo "2. Test login endpoint"
echo "3. Create a test user if needed"
echo ""
