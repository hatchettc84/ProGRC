# Migration Guide: DigitalOcean to VPS

## 🎯 **Migration Overview**

This guide helps you migrate from DigitalOcean Kubernetes to VPS deployment until you're ready to migrate to AWS.

---

## 📋 **Current Setup**

### **DigitalOcean (To Be Disabled)**
- **Kubernetes Cluster**: `progrc-dev-cluster`
- **Services**: Backend (3 pods), Frontend, Redis, PostgreSQL (managed), Ollama (external droplet)
- **AI Droplet**: `64.225.20.65` (Ollama service)
- **LoadBalancer IP**: `143.244.221.38`

### **VPS (Target Deployment)**
- **IP Address**: `168.231.70.205`
- **Services**: Docker Compose (Backend, Frontend, Redis, PostgreSQL, Ollama)
- **Status**: Needs configuration/deployment

---

## ✅ **Pre-Migration Checklist**

### **Before Starting:**
- [ ] VPS is accessible via SSH
- [ ] Docker and Docker Compose installed on VPS
- [ ] Domain/DNS ready (optional, can use IP directly)
- [ ] Database backup from DigitalOcean (if needed)
- [ ] Environment variables documented
- [ ] SSL certificates ready (optional)

---

## 🔄 **Migration Steps**

### **Step 1: Backup Current Configuration**

#### **1.1 Export Environment Variables from Kubernetes:**
```bash
# From local machine (with kubectl configured)
kubectl get configmap -n progrc-dev backend-config -o yaml > k8s-backup-configmap.yaml

# Export secrets (if needed)
kubectl get secret -n progrc-dev backend-secrets -o yaml > k8s-backup-secrets.yaml

# Export database connection info
kubectl get configmap -n progrc-dev backend-config -o jsonpath='{.data.DATABASE_URL}' > database-connection.txt
```

#### **1.2 Document Current Services:**
- Note all environment variables
- Document database schema/version
- List all services and ports
- Document Ollama configuration

#### **1.3 Backup Database (If Using Managed DB):**
```bash
# If using DigitalOcean managed PostgreSQL
# Export from DigitalOcean console or use pg_dump

# Option: Export via kubectl (if you have access)
kubectl exec -n progrc-dev deployment/progrc-backend -- \
  pg_dump -h <DB_HOST> -U <DB_USER> -d <DB_NAME> > backup_$(date +%Y%m%d).sql
```

---

### **Step 2: Prepare VPS**

#### **2.1 SSH into VPS:**
```bash
ssh root@168.231.70.205
```

#### **2.2 Install Prerequisites:**
```bash
# Update system
apt update && apt upgrade -y

# Install Docker
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
fi

# Install Docker Compose
if ! command -v docker-compose &> /dev/null; then
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# Install Node.js (if needed for scripts)
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
fi

# Install Nginx (for reverse proxy)
apt install nginx certbot python3-certbot-nginx -y

# Verify installations
docker --version
docker-compose --version
node --version
nginx -v
```

#### **2.3 Create Directory Structure:**
```bash
mkdir -p /opt/progrc
mkdir -p /opt/progrc/backups
cd /opt/progrc
```

---

### **Step 3: Transfer Codebase to VPS**

#### **3.1 From Local Machine (in new terminal, not SSH'd):**
```bash
cd /Users/corneliushatchett/Downloads/PRO\ GRC/bff-service-backend-dev

# Transfer files (exclude node_modules, dist, .git)
rsync -avz --progress \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude 'dist' \
    --exclude 'coverage' \
    --exclude '.env' \
    --exclude '*.log' \
    --exclude '.claude' \
    --exclude '.cursor' \
    --exclude 'k8s' \
    ./ root@168.231.70.205:/opt/progrc/bff-service-backend-dev/
```

**Alternative: Using Git (Recommended):**
```bash
# On VPS
cd /opt/progrc
git clone https://github.com/hatchettc84/ProGRC.git bff-service-backend-dev
cd bff-service-backend-dev
```

---

### **Step 4: Configure Environment**

#### **4.1 SSH back into VPS:**
```bash
ssh root@168.231.70.205
cd /opt/progrc/bff-service-backend-dev
```

#### **4.2 Create .env File:**
```bash
cp env.sample .env
nano .env
```

#### **4.3 Configure Environment Variables:**

**Database Configuration:**
```bash
# Use Docker Compose PostgreSQL (recommended)
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_USERNAME=progrc
POSTGRES_PASSWORD=<GENERATE_SECURE_PASSWORD>
POSTGRES_DATABASE=progrc_bff
POSTGRES_SSL=false

# Or use external PostgreSQL (if migrating from DigitalOcean managed DB)
# POSTGRES_HOST=<EXTERNAL_DB_HOST>
# POSTGRES_PORT=25060
# POSTGRES_USERNAME=<DB_USER>
# POSTGRES_PASSWORD=<DB_PASSWORD>
# POSTGRES_DATABASE=progrc_bff
# POSTGRES_SSL=true
```

**Redis Configuration:**
```bash
REDIS_HOST=redis
REDIS_PORT=6379
```

**Application Configuration:**
```bash
NODE_ENV=production
PORT=3000
FE_HOST=http://168.231.70.205
CORS_ORIGIN=*

# JWT Configuration
JWT_SECRET=<GENERATE_SECRET>
JWT_REFRESH_SECRET=<GENERATE_SECRET>
```

**Ollama Configuration:**
```bash
# Option 1: Use Ollama on same VPS (recommended)
USE_OLLAMA=true
OLLAMA_BASE_URL=http://ollama:11434  # Internal Docker network
OLLAMA_MODEL=llama3.2:1b
OLLAMA_EMBEDDING_MODEL=nomic-embed-text

# Option 2: Use existing AI Droplet (64.225.20.65)
# USE_OLLAMA=true
# OLLAMA_BASE_URL=http://64.225.20.65:11434
# OLLAMA_MODEL=llama3.2:1b
# OLLAMA_EMBEDDING_MODEL=nomic-embed-text

# Disable cloud services
USE_GEMINI=false
USE_GRADIENT=false
```

**AWS Configuration (if using S3/Cognito):**
```bash
# Keep AWS credentials if using S3/Cognito
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
AWS_COGNITO_USER_POOL_ID=your-pool-id
AWS_COGNITO_CLIENT_ID=your-client-id

# Disable SQS (use direct processing or local queue)
AWS_SQS_ENABLED=false
```

**Email Configuration:**
```bash
SES_EMAIL_SENDER=noreply@yourdomain.com
HELP_DESK_EMAIL=support@yourdomain.com
SES_SMTP_USERNAME=your-smtp-username
SES_SMTP_PASSWORD=your-smtp-password
SES_ENDPOINT=smtp.gmail.com
SES_PORT=587
SES_TYPE=smtp
```

#### **4.4 Update docker-compose.yml:**
```bash
nano docker-compose.yml
```

**Update PostgreSQL password** (must match .env):
```yaml
postgres:
  environment:
    POSTGRES_PASSWORD: <MATCH_ENV_PASSWORD>
```

---

### **Step 5: Configure Ollama on VPS**

#### **5.1 Option A: Use Ollama in Docker Compose (Recommended)**

The `docker-compose.yml` should include Ollama service. Verify it's configured:

```yaml
ollama:
  image: ollama/ollama:latest
  container_name: bff-ollama
  ports:
    - "11434:11434"
  volumes:
    - ollama_data:/root/.ollama
  environment:
    - OLLAMA_HOST=0.0.0.0
```

#### **5.2 Option B: Use Existing AI Droplet**

If you want to use the existing AI Droplet (64.225.20.65):

1. **Verify AI Droplet is accessible:**
   ```bash
   # From VPS
   curl http://64.225.20.65:11434/api/tags
   ```

2. **Update .env:**
   ```bash
   OLLAMA_BASE_URL=http://64.225.20.65:11434
   ```

3. **Remove Ollama from docker-compose.yml** (if present)

---

### **Step 6: Build and Start Services**

#### **6.1 Build Docker Images:**
```bash
cd /opt/progrc/bff-service-backend-dev

# Build images (takes 10-15 minutes first time)
docker-compose build

# Or build without cache (if issues)
docker-compose build --no-cache
```

#### **6.2 Start Services:**
```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f app
```

#### **6.3 Pull Ollama Models (if using Docker Compose Ollama):**
```bash
# Wait for Ollama container to start
sleep 10

# Pull models
docker-compose exec ollama ollama pull llama3.2:1b
docker-compose exec ollama ollama pull nomic-embed-text

# Verify models
docker-compose exec ollama ollama list
```

---

### **Step 7: Run Database Migrations**

#### **7.1 Wait for Database to be Ready:**
```bash
# Check database is running
docker-compose ps postgres

# Wait for database to be ready
docker-compose exec app sh -c 'until nc -z postgres 5432; do sleep 1; done'
```

#### **7.2 Run Migrations:**
```bash
# Run migrations
docker-compose exec app npm run migration:up

# Verify migrations
docker-compose exec app npm run typeorm -- migration:show
```

#### **7.3 Import Database (if migrating from DigitalOcean):**
```bash
# If you have a backup
docker-compose exec -T postgres psql -U progrc -d progrc_bff < backup_YYYYMMDD.sql
```

---

### **Step 8: Configure Nginx Reverse Proxy**

#### **8.1 Create Nginx Configuration:**
```bash
nano /etc/nginx/sites-available/progrc
```

**Add Configuration:**
```nginx
server {
    listen 80;
    server_name 168.231.70.205;  # or your domain name

    # Increase timeouts for long-running requests
    proxy_read_timeout 300s;
    proxy_connect_timeout 300s;
    proxy_send_timeout 300s;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Increase client body size for file uploads
    client_max_body_size 100M;
}
```

#### **8.2 Enable Site:**
```bash
ln -s /etc/nginx/sites-available/progrc /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
```

#### **8.3 Setup SSL (Optional but Recommended):**
```bash
# If you have a domain name
certbot --nginx -d yourdomain.com

# Auto-renewal is configured by default
```

---

### **Step 9: Verify Deployment**

#### **9.1 Health Check:**
```bash
# Check application health
curl http://localhost:3000/api/v1/health

# Or via Nginx
curl http://168.231.70.205/api/v1/health
```

#### **9.2 Verify Services:**
```bash
# Check all containers
docker-compose ps

# Check application logs
docker-compose logs app | tail -50

# Check Ollama (if using Docker Compose)
docker-compose exec ollama ollama list
curl http://localhost:11434/api/tags

# Check database
docker-compose exec postgres psql -U progrc -d progrc_bff -c "SELECT COUNT(*) FROM users;"
```

#### **9.3 Test AI Features:**
```bash
# Check backend logs for Ollama usage
docker-compose logs app | grep -i ollama

# Should see: "Using Ollama for AI processing"
```

---

### **Step 10: Disable DigitalOcean Services**

#### **10.1 Scale Down Kubernetes Services (Optional):**
```bash
# Scale down deployments to 0 (to save costs)
kubectl scale deployment -n progrc-dev progrc-backend --replicas=0
kubectl scale deployment -n progrc-dev progrc-frontend --replicas=0
```

#### **10.2 Document Current State:**
- Save ConfigMaps and Secrets (already done in Step 1)
- Document LoadBalancer IP
- Note any custom configurations

#### **10.3 Delete Resources (When Ready):**
```bash
# ⚠️ ONLY when you're certain VPS is working
# kubectl delete deployment -n progrc-dev --all
# kubectl delete service -n progrc-dev --all
```

---

## 📋 **Post-Migration Checklist**

### **VPS Deployment:**
- [ ] All services are running
- [ ] Database migrations completed
- [ ] Application is accessible
- [ ] Ollama is working
- [ ] Nginx is configured
- [ ] SSL is set up (if using domain)
- [ ] Health checks pass
- [ ] AI features work correctly

### **DigitalOcean Cleanup:**
- [ ] Services scaled down or deleted
- [ ] ConfigMaps and Secrets backed up
- [ ] Database backup exported (if needed)
- [ ] Documentation updated

---

## 🔧 **Useful Commands**

### **VPS Management:**
```bash
# View logs
docker-compose logs -f app

# Restart services
docker-compose restart

# Stop services
docker-compose down

# Update application
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

1. **Database Migration**: If using DigitalOcean managed PostgreSQL, you'll need to export and import the database, or configure VPS to connect to the managed database.

2. **DNS Update**: Update DNS records to point to VPS IP (168.231.70.205) instead of LoadBalancer IP (143.244.221.38).

3. **SSL Certificates**: If using SSL, you'll need to set up Let's Encrypt on VPS or transfer certificates.

4. **Ollama Models**: If using Ollama on VPS, models need to be downloaded (llama3.2:1b, nomic-embed-text).

5. **AWS Services**: If using AWS S3/Cognito, keep those credentials in .env file.

---

## 🔗 **Related Documentation**

- **VPS Deployment**: `VPS_DEPLOYMENT_STEPS.md`
- **Ollama Setup**: `OLLAMA_VPS_SETUP.md`
- **VPS Verification**: `VPS_VERIFICATION_GUIDE.md`
- **Docker Compose**: `docker-compose.yml`

---

## 📝 **Summary**

This migration involves:

1. **Backup**: Export configuration and database from DigitalOcean
2. **Prepare VPS**: Install prerequisites and create directory structure
3. **Deploy**: Transfer codebase, configure environment, build and start services
4. **Configure**: Setup Nginx, SSL, and verify all services
5. **Verify**: Test application, AI features, and all functionality
6. **Cleanup**: Disable/delete DigitalOcean resources when ready

**Estimated Time**: 2-4 hours (depending on database size and migration complexity)

---

**Status**: Ready to begin migration. Follow steps sequentially and verify each step before proceeding.
