#!/bin/bash
# Verify Backend API is accessible from frontend

set -e

VPS_IP="168.231.70.205"
BACKEND_PORT="3001"

echo "=========================================="
echo "Backend API Verification"
echo "=========================================="
echo ""

# 1. Check backend health from VPS
echo "1. Testing backend health endpoint locally..."
curl -s http://localhost:${BACKEND_PORT}/api/v1/health && echo "" || echo "❌ Local health check failed"
echo ""

# 2. Check if backend is exposed externally
echo "2. Testing backend from external IP..."
curl -s http://${VPS_IP}:${BACKEND_PORT}/api/v1/health && echo "" || echo "❌ External health check failed"
echo ""

# 3. Check Nginx configuration (if using reverse proxy)
echo "3. Checking Nginx configuration..."
if [ -f /etc/nginx/sites-available/progrc ]; then
    echo "✅ Nginx config found"
    echo "Checking backend proxy settings..."
    grep -A 5 "proxy_pass" /etc/nginx/sites-available/progrc | head -10
else
    echo "⚠️  Nginx config not found at /etc/nginx/sites-available/progrc"
fi
echo ""

# 4. Check if backend port is accessible
echo "4. Checking if backend port ${BACKEND_PORT} is accessible..."
netstat -tlnp 2>/dev/null | grep ${BACKEND_PORT} || \
ss -tlnp 2>/dev/null | grep ${BACKEND_PORT} || \
echo "⚠️  Cannot check port (netstat/ss not available)"
echo ""

# 5. Test API endpoint that frontend uses
echo "5. Testing API endpoints frontend might use..."
echo "   Auth endpoint:"
curl -s -X POST http://localhost:${BACKEND_PORT}/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test","password":"test"}' | head -5 || echo "❌ Auth endpoint failed"
echo ""

# 6. Check app logs for API requests
echo "6. Checking recent API requests in logs..."
docker-compose logs app --tail 50 | grep -i "api\|request\|/auth" | tail -10
echo ""

# 7. Check CORS configuration
echo "7. Checking CORS configuration..."
cd /opt/progrc/bff-service-backend-dev
grep -i "CORS\|cors" .env docker-compose.yml 2>/dev/null | head -5
echo ""

echo "=========================================="
echo "Verification Complete"
echo "=========================================="
echo ""
echo "If backend is not accessible externally:"
echo "  1. Check Nginx reverse proxy configuration"
echo "  2. Check firewall rules (ufw status)"
echo "  3. Verify backend is listening on 0.0.0.0:3001"
echo ""
