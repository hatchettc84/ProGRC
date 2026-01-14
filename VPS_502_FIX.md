# Fix 502 Error on VPS

## Option 1: Create Scripts Directly on VPS

Run these commands on your VPS:

```bash
cd /opt/progrc/bff-service-backend-dev

# Create diagnose script
cat > diagnose-502.sh << 'EOF'
#!/bin/bash
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
EOF

# Create fix script
cat > fix-database-connection.sh << 'EOF'
#!/bin/bash
set -e
cd /opt/progrc/bff-service-backend-dev
echo "Fixing database password mismatch..."
ENV_PASSWORD=$(grep "^POSTGRES_PASSWORD=" .env | cut -d'=' -f2 | tr -d '"' | tr -d "'")
if [ -z "$ENV_PASSWORD" ]; then
    echo "❌ POSTGRES_PASSWORD not found in .env"
    exit 1
fi
echo "Found password in .env: ${ENV_PASSWORD:0:10}..."
echo "Updating docker-compose.yml..."
sed -i "s/POSTGRES_PASSWORD: progrc_dev_password_change_me/POSTGRES_PASSWORD: ${ENV_PASSWORD}/g" docker-compose.yml
echo "✅ docker-compose.yml updated"
echo "Restarting services..."
docker-compose restart postgres app
echo "✅ Services restarted"
echo ""
echo "Waiting for services to be healthy..."
sleep 10
echo "Checking status..."
docker-compose ps
echo ""
echo "Testing health endpoint..."
curl -s http://localhost:3001/api/v1/health && echo "" || echo "❌ Health check failed"
echo ""
echo "✅ Database connection fix complete!"
EOF

# Make executable
chmod +x diagnose-502.sh fix-database-connection.sh

# Run diagnostic
./diagnose-502.sh
```

## Option 2: Run Commands Directly (No Scripts)

```bash
cd /opt/progrc/bff-service-backend-dev

# 1. Check backend status
docker-compose ps app

# 2. Check for database errors
docker-compose logs app --tail 50 | grep -i "password\|database\|postgres\|error" | tail -10

# 3. Test health endpoint
curl -s http://localhost:3001/api/v1/health || echo "❌ Health endpoint failed"

# 4. Check recent logs
docker-compose logs app --tail 30

# 5. Fix password mismatch (if needed)
ENV_PASSWORD=$(grep "^POSTGRES_PASSWORD=" .env | cut -d'=' -f2 | tr -d '"' | tr -d "'")
sed -i "s/POSTGRES_PASSWORD: progrc_dev_password_change_me/POSTGRES_PASSWORD: ${ENV_PASSWORD}/g" docker-compose.yml
docker-compose restart postgres app

# 6. Wait and verify
sleep 10
docker-compose ps
curl http://localhost:3001/api/v1/health
```
