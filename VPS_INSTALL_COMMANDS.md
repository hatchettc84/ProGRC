# VPS Installation Commands

## 🚀 **Quick Install - Copy and Paste These Commands**

If you have SSH access to your VPS (168.231.70.205), run these commands sequentially:

---

## **Step 1: Update System**
```bash
apt update && apt upgrade -y
```

---

## **Step 2: Install Docker**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
rm get-docker.sh
docker --version
```

---

## **Step 3: Install Docker Compose**
```bash
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
docker-compose --version
```

---

## **Step 4: Install Node.js 18.x**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs
node --version
npm --version
```

---

## **Step 5: Install Nginx**
```bash
apt install nginx certbot python3-certbot-nginx -y
nginx -v
systemctl enable nginx
systemctl start nginx
```

---

## **Step 6: Create Directories**
```bash
mkdir -p /opt/progrc/backups
cd /opt/progrc
```

---

## **Step 7: Clone Repository**
```bash
cd /opt/progrc
git clone https://github.com/hatchettc84/ProGRC.git bff-service-backend-dev
cd bff-service-backend-dev
ls -la
```

---

## **Step 8: Verify Installations**
```bash
echo "=== Verification ==="
echo "Docker: $(docker --version)"
echo "Docker Compose: $(docker-compose --version)"
echo "Node.js: $(node --version)"
echo "NPM: $(npm --version)"
echo "Nginx: $(nginx -v 2>&1 | cut -d'/' -f2)"
echo "Directory: $(ls -la /opt/progrc/ | head -5)"
```

---

## **All-in-One Command (Copy Entire Block)**

```bash
# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh && rm get-docker.sh

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose && chmod +x /usr/local/bin/docker-compose

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && apt install -y nodejs

# Install Nginx
apt install nginx certbot python3-certbot-nginx -y && systemctl enable nginx && systemctl start nginx

# Create directories
mkdir -p /opt/progrc/backups && cd /opt/progrc

# Clone repository
git clone https://github.com/hatchettc84/ProGRC.git bff-service-backend-dev

# Verify
echo "=== Installation Complete ==="
docker --version
docker-compose --version
node --version
nginx -v
```

---

**After running these commands, proceed to Phase 3: Configure Environment**
