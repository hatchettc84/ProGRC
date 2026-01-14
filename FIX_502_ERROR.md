# Fix 502 Error on Login

## Quick Diagnosis

Run these on VPS:

```bash
cd /opt/progrc/bff-service-backend-dev

# 1. Check backend container status
docker-compose ps app

# 2. Check backend health endpoint
curl http://localhost:3001/api/v1/health

# 3. Check recent errors
docker-compose logs app --tail 50 | grep -i "error\|fail\|exception"

# 4. Check database connection
docker-compose logs app | grep -i "database\|postgres" | tail -10

# 5. Check if backend is responding
docker-compose logs app | tail -20
```

## Common Causes

### 1. Database Password Mismatch

If you see "password authentication failed":

```bash
# Get password from .env
ENV_PASSWORD=$(grep "^POSTGRES_PASSWORD=" .env | cut -d'=' -f2 | tr -d '"' | tr -d "'")

# Update docker-compose.yml
sed -i "s/POSTGRES_PASSWORD: progrc_dev_password_change_me/POSTGRES_PASSWORD: ${ENV_PASSWORD}/g" docker-compose.yml

# Restart
docker-compose restart postgres app
```

### 2. Backend Not Healthy

```bash
# Check health
docker-compose exec app node -e "const http = require('http'); http.get('http://localhost:3000/api/v1/health', (res) => { console.log('Status:', res.statusCode); let data = ''; res.on('data', (chunk) => data += chunk); res.on('end', () => console.log(data)); }).on('error', (e) => console.error('Error:', e.message));"

# Restart if needed
docker-compose restart app
```

### 3. Services Not Running

```bash
# Check all services
docker-compose ps

# Start all if needed
docker-compose up -d
```

## After Fix

Test login again. If still 502, check Nginx configuration if using reverse proxy.
