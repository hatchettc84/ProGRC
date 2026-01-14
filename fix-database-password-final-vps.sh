#!/bin/bash
# Final database password fix - ensure database is recreated with correct password

set -e

cd /opt/progrc/bff-service-backend-dev

PASSWORD="progrc_secure_password_1767036704"

echo "=========================================="
echo "Final Database Password Fix"
echo "=========================================="
echo ""

# 1. Stop all services
echo "1. Stopping all services..."
docker-compose down

# 2. Verify password in docker-compose.yml
echo "2. Verifying password in docker-compose.yml..."
POSTGRES_PASS=$(grep "POSTGRES_PASSWORD:" docker-compose.yml | head -1 | awk '{print $2}')
echo "   Postgres service password: $POSTGRES_PASS"
APP_PASS=$(grep "POSTGRES_PASSWORD:" docker-compose.yml | tail -1 | awk '{print $2}')
echo "   App service password: $APP_PASS"

if [ "$POSTGRES_PASS" != "$APP_PASS" ]; then
    echo "❌ Passwords don't match! Fixing..."
    perl -i -pe "s/POSTGRES_PASSWORD: .*/POSTGRES_PASSWORD: ${PASSWORD}/g" docker-compose.yml
    echo "✅ Passwords synchronized"
else
    echo "✅ Passwords match"
fi

# 3. Remove postgres volume completely
echo ""
echo "3. Removing postgres volume..."
docker volume ls | grep postgres
docker volume rm bff-service-backend-dev_postgres_data 2>/dev/null || \
docker volume rm $(docker volume ls -q | grep postgres) 2>/dev/null || \
echo "⚠️  Volume removal had issues, continuing..."

# 4. Start postgres
echo ""
echo "4. Starting postgres with correct password..."
docker-compose up -d postgres

# 5. Wait for postgres to be healthy
echo ""
echo "5. Waiting for postgres to be ready..."
for i in {1..30}; do
    if docker-compose ps postgres | grep -q "healthy"; then
        echo "✅ Postgres is healthy"
        break
    fi
    echo "   Waiting... ($i/30)"
    sleep 2
done

# 6. Verify postgres is using correct password
echo ""
echo "6. Verifying postgres configuration..."
docker-compose exec postgres env | grep POSTGRES_PASSWORD || echo "⚠️  Cannot check env"

# 7. Start app
echo ""
echo "7. Starting app..."
docker-compose up -d app

# 8. Wait for app to start
echo ""
echo "8. Waiting for app to initialize (this may take 60+ seconds for migrations)..."
sleep 60

# 9. Check logs
echo ""
echo "9. Checking app logs..."
docker-compose logs app | grep -i "database\|connected\|ready\|migration" | tail -15

# 10. Test health
echo ""
echo "10. Testing health endpoint..."
for i in {1..5}; do
    if curl -s http://localhost:3001/api/v1/health > /dev/null 2>&1; then
        echo "✅ Backend is healthy!"
        curl http://localhost:3001/api/v1/health
        break
    else
        echo "   Waiting for backend... ($i/5)"
        sleep 10
    fi
done

echo ""
echo "=========================================="
echo "Fix Complete"
echo "=========================================="
echo ""
echo "If still having issues, check:"
echo "  docker-compose logs app --tail 50"
echo "  docker-compose ps"
echo ""
