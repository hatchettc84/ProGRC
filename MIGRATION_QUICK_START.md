# Migration Quick Start Guide

## 🚀 **Quick Migration Steps**

This is a condensed guide to migrate from DigitalOcean to VPS quickly.

---

## ✅ **Phase 1: Backup - COMPLETE**

Backup already completed. Files saved in `./digitalocean-backup-YYYYMMDD-HHMMSS/`

---

## 📋 **Phase 2: Prepare VPS - CURRENT STEP**

### **Step 1: SSH into VPS**
```bash
ssh root@168.231.70.205
```

### **Step 2: Run Preparation Script**

**From Local Machine (transfer script):**
```bash
cd /Users/corneliushatchett/Downloads/PRO\ GRC/bff-service-backend-dev
scp prepare-vps.sh root@168.231.70.205:/root/
```

**On VPS (run script):**
```bash
chmod +x /root/prepare-vps.sh
/root/prepare-vps.sh
```

This will install:
- ✅ Docker
- ✅ Docker Compose
- ✅ Node.js 18.x
- ✅ Nginx
- ✅ Create directories

---

## 📋 **Phase 3: Transfer Codebase**

### **Option 1: Clone from GitHub (Recommended)**
```bash
# On VPS
cd /opt/progrc
git clone https://github.com/hatchettc84/ProGRC.git bff-service-backend-dev
cd bff-service-backend-dev
```

### **Option 2: Transfer via rsync**
```bash
# From local machine (new terminal, not SSH'd)
cd /Users/corneliushatchett/Downloads/PRO\ GRC/bff-service-backend-dev
rsync -avz --progress \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude 'dist' \
    --exclude 'coverage' \
    --exclude '.env' \
    ./ root@168.231.70.205:/opt/progrc/bff-service-backend-dev/
```

---

## 📋 **Phase 4: Configure Environment**

### **Step 1: Create .env File**
```bash
# On VPS
cd /opt/progrc/bff-service-backend-dev
cp env.sample .env
nano .env
```

### **Step 2: Key Configuration Values**

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

---

## 📋 **Phase 5: Deploy Services**

```bash
# On VPS
cd /opt/progrc/bff-service-backend-dev

# Build images
docker-compose build

# Start services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f app
```

---

## 📋 **Phase 6: Pull Ollama Models**

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

## 📋 **Phase 7: Run Migrations**

```bash
# Run migrations
docker-compose exec app npm run migration:up

# Verify
docker-compose exec app npm run typeorm -- migration:show
```

---

## 📋 **Phase 8: Configure Nginx**

```bash
# Create config
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

```bash
# Enable site
ln -s /etc/nginx/sites-available/progrc /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
```

---

## ✅ **Verification**

```bash
# Health check
curl http://localhost:3001/api/v1/health
curl http://168.231.70.205/api/v1/health

# Check services
docker-compose ps

# Check Ollama
docker-compose exec ollama ollama list
curl http://localhost:11435/api/tags
```

---

## 🔗 **Full Documentation**

- **Complete Guide**: `MIGRATE_TO_VPS_GUIDE.md`
- **Phase 2 Guide**: `MIGRATION_PHASE2_GUIDE.md`
- **Migration Steps**: `MIGRATION_STEPS.md`
- **VPS Deployment**: `VPS_DEPLOYMENT_STEPS.md`

---

**Current Phase**: Phase 2 - Prepare VPS
**Next Action**: SSH into VPS and run preparation script
