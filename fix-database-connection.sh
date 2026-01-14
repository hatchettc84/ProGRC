#!/bin/bash
# Fix Database Password Mismatch

set -e

cd /opt/progrc/bff-service-backend-dev

echo "Fixing database password mismatch..."

# Get password from .env
ENV_PASSWORD=$(grep "^POSTGRES_PASSWORD=" .env | cut -d'=' -f2 | tr -d '"' | tr -d "'")

if [ -z "$ENV_PASSWORD" ]; then
    echo "❌ POSTGRES_PASSWORD not found in .env"
    exit 1
fi

echo "Found password in .env: ${ENV_PASSWORD:0:10}..."

# Update docker-compose.yml
echo "Updating docker-compose.yml..."
sed -i "s/POSTGRES_PASSWORD: progrc_dev_password_change_me/POSTGRES_PASSWORD: ${ENV_PASSWORD}/g" docker-compose.yml

echo "✅ docker-compose.yml updated"

# Restart services
echo "Restarting services..."
docker-compose restart postgres app

echo "✅ Services restarted"
echo ""
echo "Waiting for services to be healthy..."
sleep 10

# Check status
echo "Checking status..."
docker-compose ps

echo ""
echo "Testing health endpoint..."
curl -s http://localhost:3001/api/v1/health && echo "" || echo "❌ Health check failed"

echo ""
echo "✅ Database connection fix complete!"
