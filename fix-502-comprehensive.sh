#!/bin/bash
# Comprehensive 502 Error Fix

set -e

cd /opt/progrc/bff-service-backend-dev

echo "=========================================="
echo "Comprehensive 502 Error Diagnosis"
echo "=========================================="
echo ""

# 1. Check service status
echo "1. Checking service status..."
docker-compose ps
echo ""

# 2. Check if app container is running
echo "2. Checking app container..."
if docker-compose ps app | grep -q "Up"; then
    echo "✅ App container is running"
else
    echo "❌ App container is not running"
    echo "Starting app..."
    docker-compose up -d app
    sleep 10
fi
echo ""

# 3. Check app logs for errors
echo "3. Checking app logs for errors..."
docker-compose logs app --tail 50 | grep -i "error\|fail\|exception\|crash" | tail -10
echo ""

# 4. Check database connection
echo "4. Checking database connection..."
docker-compose logs app | grep -i "database\|postgres\|connected" | tail -5
echo ""

# 5. Check if app is listening on port 3000
echo "5. Checking if app is listening on port 3000..."
docker-compose exec app netstat -tlnp 2>/dev/null | grep 3000 || \
docker-compose exec app ss -tlnp 2>/dev/null | grep 3000 || \
echo "⚠️  Cannot check port (netstat/ss not available)"
echo ""

# 6. Test health endpoint from inside container
echo "6. Testing health endpoint from inside container..."
docker-compose exec app node -e "
const http = require('http');
http.get('http://localhost:3000/api/v1/health', (res) => {
  console.log('Status:', res.statusCode);
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => console.log('Response:', data));
}).on('error', (e) => console.error('Error:', e.message));
" 2>&1
echo ""

# 7. Test from host
echo "7. Testing from host..."
curl -v http://localhost:3001/api/v1/health 2>&1 | head -20
echo ""

# 8. Check if there are any port conflicts
echo "8. Checking for port conflicts..."
netstat -tlnp 2>/dev/null | grep 3001 || ss -tlnp 2>/dev/null | grep 3001 || echo "Port 3001 check unavailable"
echo ""

# 9. Check app health check status
echo "9. Checking app health check..."
docker inspect bff-app --format='{{.State.Health.Status}}' 2>/dev/null || echo "Health check unavailable"
echo ""

# 10. Restart app if needed
echo "10. Restarting app to ensure clean state..."
docker-compose restart app
sleep 20

# 11. Final check
echo ""
echo "11. Final status check..."
docker-compose ps app
echo ""

echo "12. Final health test..."
curl -s http://localhost:3001/api/v1/health && echo "" || echo "❌ Health check still failing"
echo ""

echo "=========================================="
echo "Diagnosis Complete"
echo "=========================================="
echo ""
echo "If still getting 502, check:"
echo "  - Nginx configuration (if using reverse proxy)"
echo "  - Firewall rules"
echo "  - App logs: docker-compose logs app --tail 100"
echo ""
