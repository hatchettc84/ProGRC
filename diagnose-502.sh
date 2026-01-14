#!/bin/bash
# Diagnose 502 Error on VPS

set -e

cd /opt/progrc/bff-service-backend-dev

echo "=========================================="
echo "Diagnosing 502 Error"
echo "=========================================="
echo ""

echo "1. Checking backend container status..."
docker-compose ps app
echo ""

echo "2. Checking for database errors..."
docker-compose logs app --tail 50 | grep -i "password\|database\|postgres\|error" | tail -10
echo ""

echo "3. Testing backend health endpoint..."
curl -s http://localhost:3001/api/v1/health || echo "❌ Health endpoint failed"
echo ""

echo "4. Checking recent app logs..."
docker-compose logs app --tail 30
echo ""

echo "5. Checking all services status..."
docker-compose ps
echo ""

echo "=========================================="
echo "If you see 'password authentication failed':"
echo "=========================================="
echo ""
echo "Run this to fix:"
echo "  ENV_PASSWORD=\$(grep \"^POSTGRES_PASSWORD=\" .env | cut -d'=' -f2 | tr -d '\"' | tr -d \"'\")"
echo "  sed -i \"s/POSTGRES_PASSWORD: progrc_dev_password_change_me/POSTGRES_PASSWORD: \${ENV_PASSWORD}/g\" docker-compose.yml"
echo "  docker-compose restart postgres app"
echo ""
