#!/bin/bash
# Fix YAML corruption - remove duplicate password line

set -e

cd /opt/progrc/bff-service-backend-dev

echo "Fixing YAML corruption..."

# Remove lines that contain ONLY the password (no other text)
# This removes duplicate password lines that break YAML
sed -i '/^progrc_secure_password_1767036704$/d' docker-compose.yml

# Verify the fix
echo ""
echo "=== Checking lines 10-15 ==="
sed -n '10,15p' docker-compose.yml

# Validate YAML structure
echo ""
echo "=== Validating YAML ==="
if docker-compose config > /dev/null 2>&1; then
    echo "✅ YAML is valid"
else
    echo "❌ YAML still has errors. Checking for other issues..."
    docker-compose config 2>&1 | head -5
fi

echo ""
echo "Restarting services..."
docker-compose restart postgres app

echo ""
echo "Waiting for services..."
sleep 15

echo ""
echo "Checking status..."
docker-compose ps

echo ""
echo "Testing health..."
curl -s http://localhost:3001/api/v1/health && echo "" || echo "❌ Health check failed"
