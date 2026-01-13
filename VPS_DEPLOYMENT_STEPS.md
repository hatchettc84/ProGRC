# VPS Deployment Steps for ProGRC

**VPS IP**: 168.231.70.205  
**SSH**: `ssh root@168.231.70.205`

## Quick Start

Run these commands in order. You'll be prompted for the VPS password when needed.

## Step 1: Fix SSH Host Key (if needed)

```bash
ssh-keygen -R 168.231.70.205
```

## Step 2: Connect to VPS and Check Current State

```bash
ssh root@168.231.70.205
```

Once connected, check what's already installed:

```bash
# Check Docker
docker --version || echo "Docker not installed"

# Check Docker Compose
docker-compose --version || echo "Docker Compose not installed"

# Check Ollama
ollama --version || echo "Ollama not installed"

# Check if ProGRC is already deployed
ls -la /opt/progrc/ 2>/dev/null || echo "ProGRC not yet deployed"
```

## Step 3: Install Prerequisites (if needed)

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

# Install Nginx (for reverse proxy)
apt install nginx certbot python3-certbot-nginx -y

# Verify installations
docker --version
docker-compose --version
```

## Step 4: Create Directory Structure

```bash
mkdir -p /opt/progrc
mkdir -p /opt/progrc/backups
cd /opt/progrc
```

## Step 5: Transfer Codebase from Local Machine

**From your local machine** (in a new terminal, not SSH'd into VPS):

```bash
cd /Users/corneliushatchett/Downloads/PRO\ GRC/bff-service-backend-dev

# Transfer files (you'll be prompted for password)
rsync -avz --progress \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude 'dist' \
    --exclude 'coverage' \
    --exclude '.env' \
    --exclude '*.log' \
    --exclude '.claude' \
    --exclude '.cursor' \
    ./ root@168.231.70.205:/opt/progrc/bff-service-backend-dev/
```

**Alternative: Using SCP**

```bash
scp -r bff-service-backend-dev root@168.231.70.205:/opt/progrc/
```

## Step 6: Configure Environment on VPS

SSH back into VPS:

```bash
ssh root@168.231.70.205
cd /opt/progrc/bff-service-backend-dev
```

### 6.1 Generate JWT Keys

```bash
# Install Node.js if not installed
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
fi

# Generate JWT keys
if [ -f scripts/generate-jwt-keys.js ]; then
    node scripts/generate-jwt-keys.js
else
    echo "JWT key generation script not found. Keys may need to be generated manually."
fi
```

### 6.2 Create .env File

```bash
cp env.sample .env
nano .env
```

**Update these critical values in .env:**

```bash
# Database (using Docker Compose postgres)
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_USERNAME=progrc
POSTGRES_PASSWORD=CHANGE_THIS_SECURE_PASSWORD
POSTGRES_DATABASE=progrc_bff
POSTGRES_SSL=false

# Redis (using Docker Compose redis)
REDIS_HOST=redis
REDIS_PORT=6379

# Application
NODE_ENV=production
PORT=3000
FE_HOST=http://168.231.70.205
CORS_ORIGIN=*

# Ollama Configuration (IMPORTANT!)
USE_OLLAMA=true
OLLAMA_BASE_URL=http://168.231.70.205:11434
OLLAMA_MODEL=llama3.2

# Email (configure your SMTP)
SES_EMAIL_SENDER=noreply@yourdomain.com
HELP_DESK_EMAIL=support@yourdomain.com
SES_SMTP_USERNAME=your-smtp-username
SES_SMTP_PASSWORD=your-smtp-password
SES_ENDPOINT=smtp.gmail.com
SES_PORT=587
SES_TYPE=smtp

# Disable AWS-specific features for VPS
USE_LOCALSTACK=false
AWS_SQS_ENABLED=false
SECRET_PROVIDER=
```

**Update docker-compose.yml password** (must match .env):

```bash
nano docker-compose.yml
```

Find the `postgres` service and update:
```yaml
POSTGRES_PASSWORD: CHANGE_THIS_SECURE_PASSWORD  # Match .env
```

## Step 7: Build and Start Services

```bash
cd /opt/progrc/bff-service-backend-dev

# Build images (takes 10-15 minutes first time)
docker-compose build

# Start services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f app
```

## Step 8: Run Database Migrations

```bash
# Migrations should run automatically, but to run manually:
docker-compose exec app npm run migration:up
```

## Step 9: Verify Services

```bash
# Check health endpoint
curl http://localhost:3000/api/v1/health

# Check if Ollama is accessible
curl http://localhost:11434/api/tags

# Check all containers
docker-compose ps
```

## Step 10: Configure Nginx Reverse Proxy

```bash
nano /etc/nginx/sites-available/progrc
```

Add this configuration:

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

Enable the site:

```bash
ln -s /etc/nginx/sites-available/progrc /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx
```

## Step 11: Setup SSL (Optional but Recommended)

If you have a domain name:

```bash
certbot --nginx -d yourdomain.com
```

## Step 12: Verify Ollama Integration

```bash
# Check application logs for Ollama initialization
docker-compose logs app | grep -i ollama

# You should see:
# Ollama service initialized: http://168.231.70.205:11434, model: llama3.2
```

## Step 13: Test the Application

```bash
# Health check
curl http://168.231.70.205/api/v1/health

# Or if using domain:
curl https://yourdomain.com/api/v1/health
```

## Troubleshooting

### Services Won't Start

```bash
# Check logs
docker-compose logs

# Restart services
docker-compose restart

# Rebuild if needed
docker-compose build --no-cache
docker-compose up -d
```

### Database Connection Errors

```bash
# Verify database is running
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Test connection
docker-compose exec app nc -zv postgres 5432
```

### Ollama Connection Issues

```bash
# Verify Ollama is running
curl http://localhost:11434/api/tags

# Check if Ollama is accessible from app container
docker-compose exec app curl http://168.231.70.205:11434/api/tags

# If not accessible, check firewall
ufw status
ufw allow 11434/tcp
```

### Port Already in Use

```bash
# Find what's using port 3000
lsof -i :3000

# Stop conflicting service or change port in docker-compose.yml
```

## Next Steps

1. ✅ Verify all services are running
2. ✅ Test API endpoints
3. ✅ Configure frontend to point to VPS
4. ✅ Set up automated backups
5. ✅ Configure monitoring
6. ✅ Set up SSL certificate (if using domain)

## Useful Commands

```bash
# View logs
docker-compose logs -f app

# Restart services
docker-compose restart

# Stop services
docker-compose down

# Update application
cd /opt/progrc/bff-service-backend-dev
git pull  # if using git
docker-compose build
docker-compose up -d
docker-compose exec app npm run migration:up

# Backup database
docker-compose exec -T postgres pg_dump -U progrc progrcdb > /opt/progrc/backups/backup_$(date +%Y%m%d_%H%M%S).sql
```

---

**Deployment Complete!** 🎉

Your ProGRC platform should now be running on your VPS with Ollama integration.

