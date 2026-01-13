# ProGRC Platform - VPS Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying ProGRC on a VPS using Docker Compose.

**Estimated Time**: 1-2 hours  
**Estimated Monthly Cost**: $13-25 (VPS hosting)

## Architecture

- **Backend**: Docker container (NestJS)
- **Database**: PostgreSQL container (pgvector)
- **Cache**: Redis container
- **Frontend**: Served via Nginx or backend
- **Reverse Proxy**: Nginx with SSL
- **Secrets**: Environment variables (`.env` file)

⚠️ **Environment Parity Warning**: VPS deployment uses local containers and environment variables, which differs from AWS's managed services (Secrets Manager, SQS, etc.). Some features may behave differently:
- **Secrets**: `.env` files vs AWS Secrets Manager
- **Queue Processing**: Local processing vs SQS
- **Cache**: Container Redis vs ElastiCache
- **File Storage**: Local volumes vs S3

## Prerequisites

- [ ] VPS with Ubuntu 20.04+ (4GB RAM, 2 vCPU minimum)
- [ ] Root or sudo access
- [ ] Domain name (optional, for SSL)
- [ ] Ports 80, 443, 3000, 5432, 6379 open

## Step 1: Initial VPS Setup

### 1.1 Connect to VPS

```bash
ssh root@your-vps-ip
```

### 1.2 Update System

```bash
apt update && apt upgrade -y
```

### 1.3 Install Docker and Docker Compose

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

### 1.4 Install Nginx and Certbot

```bash
apt install nginx certbot python3-certbot-nginx -y
```

## Step 2: Upload Application Files

### 2.1 Create Application Directory

```bash
mkdir -p /opt/progrc
cd /opt/progrc
```

### 2.2 Upload Files

**Option A: Using SCP (from your local machine)**

```bash
# From your local machine
scp -r bff-service-backend-dev root@your-vps-ip:/opt/progrc/
```

**Option B: Using Git**

```bash
# On VPS
apt install git -y
git clone <your-repo-url> /opt/progrc/bff-service-backend-dev
```

## Step 3: Configure Environment

### 3.1 Generate JWT Keys

```bash
cd /opt/progrc/bff-service-backend-dev

# Install Node.js (if not installed)
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Generate JWT keys
node scripts/generate-jwt-keys.js
```

This creates a `.env` file with JWT keys.

### 3.2 Create Environment File

```bash
cd /opt/progrc/bff-service-backend-dev
cp env.sample .env
nano .env  # or use vi/vim
```

🔐 **Security**: Never commit `.env` files or share them. Use secure file permissions:

```bash
chmod 600 .env
```

**Update these critical values**:

```bash
# Database (will use docker-compose postgres)
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_USERNAME=progrc
POSTGRES_PASSWORD=CHANGE_THIS_SECURE_PASSWORD
POSTGRES_DATABASE=progrcdb
POSTGRES_SSL=false

# Redis (will use docker-compose redis)
REDIS_HOST=redis
REDIS_PORT=6379

# JWT Keys (already generated, verify they're present)
# ACCESS_TOKEN_SIGNATURE_PRIVATE=...
# ACCESS_TOKEN_SIGNATURE_PUBLIC=...
# REFRESH_TOKEN_SIGNATURE=...

# Application
NODE_ENV=production
PORT=3000
FE_HOST=https://your-domain.com  # or http://your-vps-ip
CORS_ORIGIN=https://your-domain.com  # or *

# Email (configure your SMTP)
SES_EMAIL_SENDER=noreply@your-domain.com
HELP_DESK_EMAIL=support@your-domain.com
SES_SMTP_USERNAME=your-smtp-username
SES_SMTP_PASSWORD=your-smtp-password
SES_ENDPOINT=smtp.gmail.com  # or your SMTP server
SES_PORT=587
SES_TYPE=smtp

# Disable AWS-specific features
USE_LOCALSTACK=false
AWS_SQS_ENABLED=false
SECRET_PROVIDER=  # Leave empty to use environment variables
```

### 3.3 Update docker-compose.yml

```bash
nano docker-compose.yml
```

**Update database password** (must match `.env`):
```yaml
postgres:
  environment:
    POSTGRES_PASSWORD: CHANGE_THIS_SECURE_PASSWORD  # Match .env
```

**Verify JWT keys are in docker-compose.yml** (they should be from generated .env):
```yaml
app:
  environment:
    ACCESS_TOKEN_SIGNATURE_PRIVATE: ${ACCESS_TOKEN_SIGNATURE_PRIVATE}
    ACCESS_TOKEN_SIGNATURE_PUBLIC: ${ACCESS_TOKEN_SIGNATURE_PUBLIC}
    REFRESH_TOKEN_SIGNATURE: ${REFRESH_TOKEN_SIGNATURE}
```

## Step 4: Build and Start Services

### 4.1 Build Docker Images

```bash
cd /opt/progrc/bff-service-backend-dev
docker-compose build
```

**Note**: First build may take 10-15 minutes

### 4.2 Start Services

```bash
docker-compose up -d
```

### 4.3 Verify Services

```bash
# Check running containers
docker-compose ps

# Check logs
docker-compose logs -f

# Test health endpoint
curl http://localhost:3000/api/v1/health
```

Expected response: `{"status":"ok"}`

## Step 5: Run Database Migrations

Migrations should run automatically on container startup. To run manually:

```bash
docker-compose exec app npm run migration:up
```

Verify migrations completed:
```bash
docker-compose logs app | grep -i migration
```

## Step 6: Configure Nginx Reverse Proxy

### 6.1 Create Nginx Configuration

```bash
nano /etc/nginx/sites-available/progrc
```

**Add this configuration**:

```nginx
server {
    listen 80;
    server_name your-domain.com;  # or your VPS IP

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

### 6.2 Enable Site

```bash
ln -s /etc/nginx/sites-available/progrc /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default  # Remove default site
nginx -t  # Test configuration
systemctl reload nginx
```

## Step 7: Setup SSL with Let's Encrypt

```bash
# If you have a domain name
certbot --nginx -d your-domain.com

# Follow prompts:
# - Enter email
# - Agree to terms
# - Choose to redirect HTTP to HTTPS
```

Certbot will automatically update your Nginx configuration.

## Step 8: Build and Deploy Frontend

### 8.1 Install Node.js and Yarn

```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install Yarn
npm install -g yarn
```

### 8.2 Build Frontend

```bash
# Upload frontend files or clone repo
cd /opt/progrc
git clone <frontend-repo-url> frontend-app-main
cd frontend-app-main

# Install and build
yarn install
yarn build
```

### 8.3 Serve Frontend via Nginx

```bash
# Copy build files
mkdir -p /var/www/progrc
cp -r dist/* /var/www/progrc/

# Update Nginx config
nano /etc/nginx/sites-available/progrc
```

**Update Nginx config** to serve static files:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Serve static files
    location /static/ {
        alias /var/www/progrc/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Serve index.html for SPA routes
    location / {
        root /var/www/progrc;
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to backend
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Reload Nginx:
```bash
nginx -t
systemctl reload nginx
```

## Step 9: Setup Auto-Start on Reboot

### 9.1 Create Systemd Service

```bash
nano /etc/systemd/system/progrc.service
```

**Add**:

```ini
[Unit]
Description=ProGRC Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/progrc/bff-service-backend-dev
ExecStart=/usr/local/bin/docker-compose up -d
ExecStop=/usr/local/bin/docker-compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

### 9.2 Enable Service

```bash
systemctl daemon-reload
systemctl enable progrc
systemctl start progrc
```

## Step 10: Setup Firewall

```bash
# Install UFW
apt install ufw -y

# Allow SSH
ufw allow 22/tcp

# Allow HTTP/HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# Enable firewall
ufw enable
ufw status
```

## Step 11: Setup Monitoring and Maintenance

### 11.1 View Logs

```bash
# Application logs
docker-compose logs -f app

# Database logs
docker-compose logs -f postgres

# All logs
docker-compose logs -f

# Recent logs (last 100 lines)
docker-compose logs --tail=100 app
```

### 11.2 Backup Database

**Create backup script**:

```bash
nano /opt/progrc/backup-db.sh
```

**Add**:

```bash
#!/bin/bash
BACKUP_DIR="/opt/progrc/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

docker-compose -f /opt/progrc/bff-service-backend-dev/docker-compose.yml \
  exec -T postgres pg_dump -U progrc progrcdb > $BACKUP_DIR/backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/backup_$DATE.sql

# Keep only last 7 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete

echo "Backup completed: backup_$DATE.sql.gz"
```

**Make executable**:

```bash
chmod +x /opt/progrc/backup-db.sh
```

**Add to crontab** (daily backup at 2 AM):

```bash
crontab -e
# Add:
0 2 * * * /opt/progrc/backup-db.sh >> /var/log/progrc-backup.log 2>&1
```

### 11.3 Update Application

```bash
cd /opt/progrc/bff-service-backend-dev

# Pull latest changes
git pull

# Rebuild and restart
docker-compose build
docker-compose up -d

# Run migrations if needed
docker-compose exec app npm run migration:up
```

## Production Readiness Checklist

Before going live, verify:

- [ ] All containers are running: `docker-compose ps`
- [ ] Health endpoint responding: `curl http://localhost:3000/api/v1/health`
- [ ] Database migrations completed
- [ ] SSL certificate installed and working
- [ ] Firewall configured (ports 80, 443 open)
- [ ] Database backups scheduled
- [ ] Logs are accessible
- [ ] Environment variables secured (`.env` file permissions)
- [ ] Frontend assets deployed
- [ ] Nginx configuration tested
- [ ] Auto-start on reboot configured

## Troubleshooting

### Containers Won't Start

```bash
# Check logs
docker-compose logs

# Check container status
docker-compose ps

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

### Port Already in Use

```bash
# Find process using port
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Stop conflicting service or change port in docker-compose.yml
```

### Migration Errors

```bash
# Check migration logs
docker-compose logs app | grep -i migration

# Run migrations manually
docker-compose exec app npm run migration:up

# Check database connection
docker-compose exec app npm run typeorm -- query "SELECT 1"
```

### Nginx 502 Bad Gateway

```bash
# Check if backend is running
docker-compose ps app

# Check backend logs
docker-compose logs app

# Test backend directly
curl http://localhost:3000/api/v1/health

# Check Nginx error logs
tail -f /var/log/nginx/error.log
```

## Cost Summary

| Item | Monthly Cost |
|------|--------------|
| VPS (4GB RAM, 2 vCPU) | $12-24 |
| Domain name | $1-2 |
| **Total** | **$13-25/month** |

## Next Steps

- Set up monitoring (Prometheus, Grafana, or simple health checks)
- Configure automated backups
- Set up log rotation
- Enable fail2ban for security
- Configure email notifications for backups

---

**Estimated Total Setup Time**: 1-2 hours  
**Estimated Monthly Cost**: $13-25

