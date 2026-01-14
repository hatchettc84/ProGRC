#!/bin/bash
# Fix POSTGRES_PASSWORD in docker-compose.yml

set -e

cd /opt/progrc/bff-service-backend-dev

PASSWORD="progrc_secure_password_1767036704"

echo "Fixing POSTGRES_PASSWORD in docker-compose.yml..."

# Use perl for safer replacement (handles special characters better)
perl -i -pe "s/POSTGRES_PASSWORD: progrc_dev_password_change_me/POSTGRES_PASSWORD: ${PASSWORD}/g" docker-compose.yml

# Verify changes
echo ""
echo "=== Updated POSTGRES_PASSWORD entries ==="
grep -n "POSTGRES_PASSWORD" docker-compose.yml

# Validate YAML syntax
echo ""
echo "Validating YAML syntax..."
if command -v yq &> /dev/null; then
    yq eval . docker-compose.yml > /dev/null && echo "✅ YAML is valid" || echo "❌ YAML validation failed"
elif command -v python3 &> /dev/null; then
    python3 -c "import yaml; yaml.safe_load(open('docker-compose.yml'))" && echo "✅ YAML is valid" || echo "❌ YAML validation failed"
else
    echo "⚠️  No YAML validator found, but file should be fixed"
fi

echo ""
echo "✅ Password updated. Restarting services..."
docker-compose restart postgres app

echo ""
echo "Waiting for services to start..."
sleep 15

echo ""
echo "Checking status..."
docker-compose ps

echo ""
echo "Testing health endpoint..."
curl -s http://localhost:3001/api/v1/health && echo "" || echo "❌ Health check failed"
