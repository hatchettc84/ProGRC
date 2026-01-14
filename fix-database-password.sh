#!/bin/bash
# Fix database password mismatch between .env and docker-compose.yml

set -e

cd /opt/progrc/bff-service-backend-dev

echo "Checking database password configuration..."

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
echo ""
echo "Restarting services..."
docker-compose restart postgres app

echo "✅ Services restarted"
echo ""
echo "Check database connection:"
echo "  docker-compose logs app | grep -i 'database\|postgres' | tail -10"
