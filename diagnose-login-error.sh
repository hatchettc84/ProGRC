#!/bin/bash
# Diagnose login error

set -e

cd /opt/progrc/bff-service-backend-dev

echo "=========================================="
echo "Login Error Diagnosis"
echo "=========================================="
echo ""

# 1. Check recent app logs for errors
echo "1. Checking recent app logs for errors..."
docker-compose logs app --tail 50 | grep -i "error\|exception\|fail" | tail -20
echo ""

# 2. Check authentication-related logs
echo "2. Checking authentication logs..."
docker-compose logs app --tail 100 | grep -i "auth\|login\|cognito\|jwt" | tail -20
echo ""

# 3. Test login endpoint directly
echo "3. Testing login endpoint..."
curl -v -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}' 2>&1 | head -30
echo ""

# 4. Check if database has users table
echo "4. Checking database schema..."
docker-compose exec postgres psql -U progrc -d progrc_bff -c "\dt" | grep -i user || echo "⚠️  Cannot check tables"
echo ""

# 5. Check Cognito configuration
echo "5. Checking Cognito configuration..."
grep -i "COGNITO\|AWS" .env | head -10 || echo "⚠️  No Cognito config found"
echo ""

# 6. Check if app is still running
echo "6. Checking app status..."
docker-compose ps app
echo ""

# 7. Check for any crash/restart
echo "7. Checking for app restarts..."
docker-compose ps app | grep -i "restart\|exit" || echo "✅ App is stable"
echo ""

echo "=========================================="
echo "Common Issues:"
echo "=========================================="
echo "1. Cognito configuration missing/incorrect"
echo "2. Database migrations not completed"
echo "3. JWT keys not configured"
echo "4. User table doesn't exist"
echo ""
