# Migration Steps: DigitalOcean to VPS

## 🎯 **Quick Reference Guide**

This is a condensed version of the full migration guide. Follow these steps sequentially.

---

## 📋 **Step-by-Step Migration**

### **Phase 1: Backup (15-30 minutes)**

#### **Step 1.1: Backup Kubernetes Configuration**
```bash
# From local machine
cd /Users/corneliushatchett/Downloads/PRO\ GRC/bff-service-backend-dev
./backup-digitalocean.sh
```

This creates a backup directory with:
- ConfigMaps
- Secrets structure
- Environment variables
- Service information
- Database connection info

#### **Step 1.2: Backup Database (If Using Managed PostgreSQL)**

**Option A: Via DigitalOcean Console**
1. Go to DigitalOcean → Databases → Select your PostgreSQL database
2. Click "Backups" → Create manual backup
3. Download backup or note the connection details

**Option B: Via kubectl (if accessible)**
```bash
# Get database connection from ConfigMap
kubectl get configmap -n progrc-dev backend-config -o jsonpath='{.data.DATABASE_HOST}'

# Export database (if you have access)
# Use pg_dump from a pod or external connection
```

---

### **Phase 2: Prepare VPS (30-60 minutes)**

#### **Step 2.1: SSH into VPS**
```bash
ssh root@168.231.70.205
```

#### **Step 2.2: Install Prerequisites**
```bash
# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Install Node.js (for scripts)
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install Nginx
apt install nginx certbot python3-certbot-nginx -y

# Verify
docker --version
docker-compose --version
node --version
```

#### **Step 2.3: Create Directory**
```bash
mkdir -p /opt/progrc/backups
cd /opt/progrc
```

---

### **Phase 3: Transfer Codebase (10-15 minutes)**

#### **Step 3.1: Clone Repository (Recommended)**
```bash
# On VPS
cd /opt/progrc
git clone https://github.com/hatchettc84/ProGRC.git bff-service-backend-dev
cd bff-service-backend-dev
```

#### **Step 3.2: Alternative: Transfer via rsync**
```bash
# From local machine (new terminal, not SSH'd)
cd /Users/corneliushatchett/Downloads/PRO\ GRC/bff-service-backend-dev
rsync -avz --progress \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude 'dist' \
    --exclude 'coverage' \
    --exclude '.env' \
    --exclude '*.log' \
    ./ root@168.231.70.205:/opt/progrc/bff-service-backend-dev/
```

---

### **Phase 4: Configure Environment (30-45 minutes)**

#### **Step 4.1: Create .env File**
```bash
# On VPS
cd /opt/progrc/bff-service-backend-dev
cp env.sample .env
nano .env
```

#### **Step 4.2: Key Configuration Values**

**Database (use Docker Compose PostgreSQL):**
```bash
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_USERNAME=progrc
POSTGRES_PASSWORD=<GENERATE_SECURE_PASSWORD>
POSTGRES_DATABASE=progrc_bff
POSTGRES_SSL=false
```

**Ollama (use Docker Compose Ollama):**
```bash
USE_OLLAMA=true
OLLAMA_BASE_URL=http://ollama:11434
OLLAMA_MODEL=llama3.2:1b
OLLAMA_EMBEDDING_MODEL=nomic-embed-text
USE_GEMINI=false
USE_GRADIENT=false
```

**Application:**
```bash
NODE_ENV=production
PORT=3000
FE_HOST=http://168.231.70.205
CORS_ORIGIN=*
```

#### **Step 4.3: Update docker-compose.yml Password**
```bash
nano docker-compose.yml
# Update POSTGRES_PASSWORD to match .env
```

---

### **Phase 5: Deploy Services (30-60 minutes)**

#### **Step 5.1: Build Images**
```bash
cd /opt/progrc/bff-service-backend-dev
docker-compose build
```

#### **Step 5.2: Start Services**
```bash
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f app
```

#### **Step 5.3: Pull Ollama Models**
```bash
# Wait for Ollama to start
sleep 30

# Pull models
docker-compose exec ollama ollama pull llama3.2:1b
docker-compose exec ollama ollama pull nomic-embed-text

# Verify
docker-compose exec ollama ollama list
```

---

### **Phase 6: Database Setup (15-30 minutes)**

#### **Step 6.1: Wait for Database**
```bash
# Check database is ready
docker-compose ps postgres
docker-compose logs postgres | tail -20
```

#### **Step 6.2: Run Migrations**
```bash
# Run migrations
docker-compose exec app npm run migration:up

# Verify
docker-compose exec app npm run typeorm -- migration:show
```

#### **Step 6.3: Import Database (If Migrating from DigitalOcean)**
```bash
# If you have a backup file
docker-compose exec -T postgres psql -U progrc -d progrc_bff < /opt/progrc/backups/backup.sql
```

---

### **Phase 7: Configure Nginx (15-20 minutes)**

#### **Step 7.1: Create Nginx Config**
```bash
nano /etc/nginx/sites-available/progrc
```

**Add:**
```nginx
server {
    listen 80;
    server_name 168.231.70.205;

    proxy_read_timeout 300s;
    proxy_connect_timeout 300s;
    proxy_send_timeout 300s;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    client_max_body_size 100M;
}
```

#### **Step 7.2: Enable Site**
```bash
ln -s /etc/nginx/sites-available/progrc /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
```

---

### **Phase 8: Verify Deployment (15 minutes)**

#### **Step 8.1: Health Check**
```bash
# Check application
curl http://localhost:3001/api/v1/health
curl http://168.231.70.205/api/v1/health

# Check services
docker-compose ps
docker-compose logs app | tail -50
```

#### **Step 8.2: Verify Ollama**
```bash
# Check Ollama
docker-compose exec ollama ollama list
curl http://localhost:11435/api/tags

# Check backend logs for Ollama usage
docker-compose logs app | grep -i ollama
```

---

### **Phase 9: Disable DigitalOcean (After Verification)**

#### **Step 9.1: Scale Down Services**
```bash
# From local machine (with kubectl)
kubectl scale deployment -n progrc-dev progrc-backend --replicas=0
kubectl scale deployment -n progrc-dev progrc-frontend --replicas=0
```

#### **Step 9.2: Delete Resources (When Ready)**
```bash
# ⚠️ ONLY when VPS is fully working
# kubectl delete deployment -n progrc-dev --all
# kubectl delete service -n progrc-dev --all
```

---

## ✅ **Post-Migration Checklist**

- [ ] All services running on VPS
- [ ] Database migrations completed
- [ ] Application accessible at http://168.231.70.205
- [ ] Ollama working correctly
- [ ] Nginx configured and working
- [ ] Health checks pass
- [ ] AI features working
- [ ] DigitalOcean services scaled down/disabled
- [ ] DNS updated (if using domain)

---

## 📝 **Quick Commands Reference**

### **VPS Management:**
```bash
# View logs
docker-compose logs -f app

# Restart services
docker-compose restart

# Stop services
docker-compose down

# Update code
cd /opt/progrc/bff-service-backend-dev
git pull
docker-compose build
docker-compose up -d
docker-compose exec app npm run migration:up

# Backup database
docker-compose exec -T postgres pg_dump -U progrc progrcdb > /opt/progrc/backups/backup_$(date +%Y%m%d_%H%M%S).sql
```

---

## ⚠️ **Important Notes**

1. **Database Migration**: If using DigitalOcean managed PostgreSQL, export and import the database
2. **DNS Update**: Update DNS records to point to VPS IP (168.231.70.205)
3. **Secrets**: Extract any needed secrets from Kubernetes Secrets manually
4. **SSL**: Setup SSL certificate with Let's Encrypt if using a domain
5. **Monitoring**: Consider setting up monitoring for the VPS deployment

---

## 🔗 **Full Documentation**

- **Complete Guide**: `MIGRATE_TO_VPS_GUIDE.md`
- **VPS Deployment**: `VPS_DEPLOYMENT_STEPS.md`
- **VPS Verification**: `VPS_VERIFICATION_GUIDE.md`

---

**Ready to start? Begin with Phase 1: Backup**
