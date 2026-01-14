# Migration Phase 4: Build and Deploy Services

## 🎯 **Phase 4: Build and Deploy Services**

This phase builds Docker images and starts all ProGRC services on the VPS.

---

## ✅ **Quick Start**

### **Option 1: Automated Script (Recommended)**

On VPS, run the deployment script:

```bash
# On VPS (SSH'd in or via console)
cd /opt/progrc/bff-service-backend-dev
chmod +x deploy-vps-services.sh
./deploy-vps-services.sh
```

This script will:
- ✅ Build Docker images
- ✅ Start all services
- ✅ Wait for services to be healthy
- ✅ Verify service status

---

## **Option 2: Manual Deployment**

### **Step 1: Build Images**

```bash
cd /opt/progrc/bff-service-backend-dev
docker-compose build --no-cache
```

**Estimated time**: 10-20 minutes (first build)

### **Step 2: Start Services**

```bash
docker-compose up -d
```

### **Step 3: Check Status**

```bash
docker-compose ps
```

### **Step 4: View Logs**

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f postgres
docker-compose logs -f redis
docker-compose logs -f ollama
docker-compose logs -f localstack
```

---

## 📋 **Services Deployed**

The deployment includes:

1. **PostgreSQL** (port 5435) - Database
2. **Redis** (port 6380) - Caching
3. **LocalStack** (port 4566) - S3 storage
4. **Ollama** (port 11435) - Local LLM
5. **Backend App** (port 3001) - API server
6. **Metabase** (port 3002) - Analytics (optional)

---

## 🔍 **Verification**

After deployment, verify services:

```bash
# Check all services
docker-compose ps

# Check PostgreSQL
docker-compose exec postgres pg_isready -U progrc

# Check Redis
docker-compose exec redis redis-cli ping

# Check LocalStack
curl http://localhost:4566/_localstack/health

# Check Ollama
curl http://localhost:11435/api/tags

# Check Backend API
curl http://localhost:3001/api/v1/health
```

---

## 📋 **Phase 4 Checklist**

- [ ] Docker images built successfully
- [ ] All services started (`docker-compose up -d`)
- [ ] PostgreSQL is healthy
- [ ] Redis is healthy
- [ ] LocalStack is healthy
- [ ] Ollama is healthy
- [ ] Backend API is accessible
- [ ] No error logs in services

---

## ⚠️ **Troubleshooting**

### **Issue: Build fails**
```bash
# Check Docker logs
docker-compose logs build

# Try building individual service
docker-compose build app
```

### **Issue: Service won't start**
```bash
# Check logs
docker-compose logs <service-name>

# Check service status
docker-compose ps

# Restart service
docker-compose restart <service-name>
```

### **Issue: Port already in use**
```bash
# Check what's using the port
netstat -tlnp | grep <port>

# Stop conflicting service or change port in docker-compose.yml
```

### **Issue: Out of disk space**
```bash
# Check disk usage
df -h

# Clean up Docker
docker system prune -a
```

---

## 🔄 **Next Phase**

Once Phase 4 is complete:
- **Phase 5**: Pull Ollama models (`./pull-ollama-models.sh`)
- **Phase 6**: Run database migrations (`./run-migrations.sh`)
- **Phase 7**: Configure Nginx reverse proxy

---

**Status**: Ready to begin Phase 4 - Build and Deploy Services
