# Execute Migration - Step by Step

## 🎯 **Master Migration Execution Guide**

This guide walks you through executing the complete migration from DigitalOcean to VPS.

---

## ✅ **Prerequisites**

- ✅ VPS is accessible (168.231.70.205)
- ✅ Phase 1-2 completed (VPS prepared, codebase cloned)
- ✅ Access to DigitalOcean Console or SSH to VPS

---

## 📋 **Execution Steps**

### **Step 1: Access VPS**

**Option A: DigitalOcean Console (Recommended)**
1. Go to [DigitalOcean Dashboard](https://cloud.digitalocean.com/droplets)
2. Find your VPS (168.231.70.205)
3. Click "Console" button

**Option B: SSH**
```bash
ssh root@168.231.70.205
```

---

### **Step 2: Navigate to Project**

```bash
cd /opt/progrc/bff-service-backend-dev
```

---

### **Step 3: Pull Latest Changes**

```bash
git pull origin main
```

This ensures you have all the latest scripts.

---

### **Step 4: Phase 3 - Configure Environment**

```bash
chmod +x configure-vps-env.sh
./configure-vps-env.sh
```

**Expected Output:**
```
==========================================
VPS Environment Configuration
==========================================

✓ Generated secure passwords
✓ .env file created
✓ docker-compose.yml updated

==========================================
Configuration Complete!
==========================================
```

**Verify:**
```bash
ls -la .env
cat .env | grep POSTGRES_PASSWORD
```

---

### **Step 5: Phase 4 - Build & Deploy Services**

```bash
chmod +x deploy-vps-services.sh
./deploy-vps-services.sh
```

**This will:**
- Build Docker images (10-20 minutes first time)
- Start all services
- Wait for services to be healthy

**Expected Output:**
```
==========================================
ProGRC VPS Services Deployment
==========================================

Step 1: Building Docker images...
✓ Images built

Step 2: Starting services...
✓ Services started

Step 3: Waiting for services to be healthy...
✓ PostgreSQL is ready
✓ Redis is ready
✓ LocalStack is ready
✓ Ollama is ready

==========================================
Deployment Complete!
==========================================
```

**Monitor Progress:**
```bash
# In another terminal or after script completes
docker-compose ps
docker-compose logs -f
```

---

### **Step 6: Phase 5 - Pull Ollama Models**

```bash
chmod +x pull-ollama-models.sh
./pull-ollama-models.sh
```

**This will:**
- Pull `llama3.2:1b` model (~1.3 GB)
- Pull `nomic-embed-text` model (~274 MB)
- Verify models are installed

**Expected Output:**
```
==========================================
Pulling Ollama Models
==========================================

Step 1: Checking Ollama service...
✓ Ollama is accessible

Step 2: Pulling llama3.2:1b model...
This may take several minutes (model size: ~1.3 GB)...
✓ llama3.2:1b model pulled

Step 3: Pulling nomic-embed-text model...
This may take a few minutes (model size: ~274 MB)...
✓ nomic-embed-text model pulled

==========================================
Ollama Models Pulled Successfully!
==========================================
```

**Verify:**
```bash
docker-compose exec ollama ollama list
```

---

### **Step 7: Phase 6 - Run Database Migrations**

```bash
chmod +x run-migrations.sh
./run-migrations.sh
```

**Expected Output:**
```
==========================================
Running Database Migrations
==========================================

Step 1: Checking app container...
✓ App container is running

Step 2: Waiting for app to be ready...
✓ App is ready

Step 3: Running migrations...
✓ Migrations completed

Step 4: Migration status...
[Shows migration list]
```

**Verify:**
```bash
docker-compose exec app npm run typeorm -- migration:show
```

---

### **Step 8: Phase 7 - Configure Nginx**

```bash
chmod +x configure-nginx.sh
sudo ./configure-nginx.sh
```

**Expected Output:**
```
==========================================
Nginx Configuration for ProGRC
==========================================

Step 1: Creating Nginx configuration...
✓ Nginx configuration created

Step 2: Enabling Nginx site...
✓ Removed default site
✓ Site enabled

Step 3: Testing Nginx configuration...
✓ Nginx configuration is valid

Step 4: Reloading Nginx...
✓ Nginx reloaded

==========================================
Nginx Configuration Complete!
==========================================
```

**Verify:**
```bash
sudo nginx -t
curl http://168.231.70.205/api/v1/health
```

---

### **Step 9: Phase 8 - Final Verification**

```bash
chmod +x verify-deployment.sh final-verification.sh
./verify-deployment.sh
./final-verification.sh
```

**Expected Output:**
```
==========================================
Verifying ProGRC Deployment
==========================================

Step 1: Checking Docker Compose services...
[Service status table]

Step 2: Checking PostgreSQL...
✓ PostgreSQL is healthy
✓ Database 'progrc_bff' exists

Step 3: Checking Redis...
✓ Redis is healthy

Step 4: Checking LocalStack...
✓ LocalStack is healthy

Step 5: Checking Ollama...
✓ Ollama is healthy
✓ Ollama has models installed (2 models)

Step 6: Checking Backend API...
✓ Backend API is healthy

Step 7: Checking Nginx...
✓ Nginx is running
✓ Nginx proxy is working

Step 8: Checking external access...
✓ External access is working

==========================================
Verification Summary
==========================================
```

---

## 🎉 **Migration Complete!**

Once all steps are complete:

1. **Test Application**: Visit http://168.231.70.205
2. **Test API**: Visit http://168.231.70.205/api/v1/health
3. **Verify Features**: Test login, compliance scoring, file uploads

---

## 🔄 **All-in-One Execution**

If you want to run everything at once (after Step 3):

```bash
cd /opt/progrc/bff-service-backend-dev && \
chmod +x configure-vps-env.sh deploy-vps-services.sh pull-ollama-models.sh run-migrations.sh configure-nginx.sh verify-deployment.sh final-verification.sh && \
./configure-vps-env.sh && \
./deploy-vps-services.sh && \
./pull-ollama-models.sh && \
./run-migrations.sh && \
sudo ./configure-nginx.sh && \
./verify-deployment.sh && \
./final-verification.sh
```

**Note**: This will take 20-40 minutes total. Monitor the output for any errors.

---

## ⚠️ **Troubleshooting**

### **Issue: Script fails at any step**

1. **Check logs:**
   ```bash
   docker-compose logs -f
   ```

2. **Check service status:**
   ```bash
   docker-compose ps
   ```

3. **Restart failed service:**
   ```bash
   docker-compose restart <service-name>
   ```

### **Issue: Out of disk space**

```bash
df -h
docker system prune -a
```

### **Issue: Port conflicts**

```bash
netstat -tlnp | grep <port>
# Stop conflicting service or change port in docker-compose.yml
```

### **Issue: Permission denied**

```bash
# Make scripts executable
chmod +x *.sh

# Run with sudo if needed
sudo ./configure-nginx.sh
```

---

## 📊 **Progress Checklist**

- [ ] Step 1: Access VPS
- [ ] Step 2: Navigate to project
- [ ] Step 3: Pull latest changes
- [ ] Step 4: Phase 3 - Configure environment
- [ ] Step 5: Phase 4 - Build & deploy services
- [ ] Step 6: Phase 5 - Pull Ollama models
- [ ] Step 7: Phase 6 - Run migrations
- [ ] Step 8: Phase 7 - Configure Nginx
- [ ] Step 9: Phase 8 - Final verification
- [ ] Test application
- [ ] Verify all features work

---

## 📞 **Support**

If you encounter issues:

1. Check the specific phase guide:
   - `MIGRATION_PHASE3_GUIDE.md`
   - `MIGRATION_PHASE4_GUIDE.md`
   - `MIGRATION_PHASE7_GUIDE.md`

2. Review logs:
   ```bash
   docker-compose logs -f
   ```

3. Run verification:
   ```bash
   ./verify-deployment.sh
   ```

---

**Ready to execute! Follow the steps above to complete your migration.**
