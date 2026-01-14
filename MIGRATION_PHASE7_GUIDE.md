# Migration Phase 7: Configure Nginx

## 🎯 **Phase 7: Configure Nginx Reverse Proxy**

This phase configures Nginx as a reverse proxy for ProGRC services.

---

## ✅ **Quick Start**

### **Option 1: Automated Script (Recommended)**

On VPS, run the Nginx configuration script:

```bash
# On VPS (SSH'd in or via console)
cd /opt/progrc/bff-service-backend-dev
chmod +x configure-nginx.sh
sudo ./configure-nginx.sh
```

This script will:
- ✅ Create Nginx configuration
- ✅ Enable the site
- ✅ Test configuration
- ✅ Reload Nginx

---

## **Option 2: Manual Configuration**

### **Step 1: Create Nginx Configuration**

```bash
sudo nano /etc/nginx/sites-available/progrc
```

Paste this configuration:

```nginx
upstream progrc_backend {
    server localhost:3001;
    keepalive 32;
}

server {
    listen 80;
    server_name 168.231.70.205;

    client_max_body_size 100M;
    proxy_read_timeout 300s;
    proxy_connect_timeout 300s;
    proxy_send_timeout 300s;

    location /api/ {
        proxy_pass http://progrc_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location / {
        proxy_pass http://progrc_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### **Step 2: Enable Site**

```bash
sudo rm /etc/nginx/sites-enabled/default
sudo ln -s /etc/nginx/sites-available/progrc /etc/nginx/sites-enabled/progrc
```

### **Step 3: Test and Reload**

```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## 📋 **SSL Setup (Optional)**

If you have a domain name, you can set up SSL:

```bash
cd /opt/progrc/bff-service-backend-dev
chmod +x setup-ssl.sh
sudo ./setup-ssl.sh
```

Or manually:

```bash
sudo certbot --nginx -d your-domain.com
```

---

## 🔍 **Verification**

After configuration, verify:

```bash
# Check Nginx status
sudo systemctl status nginx

# Test configuration
sudo nginx -t

# Test access
curl http://168.231.70.205/api/v1/health
curl http://168.231.70.205/
```

---

## ⚠️ **Troubleshooting**

### **Issue: "502 Bad Gateway"**
- Check backend is running: `docker-compose ps`
- Check backend logs: `docker-compose logs app`
- Verify port 3001 is accessible: `curl http://localhost:3001/api/v1/health`

### **Issue: "Connection refused"**
- Check firewall: `ufw status`
- Allow HTTP: `sudo ufw allow 80/tcp`
- Allow HTTPS: `sudo ufw allow 443/tcp`

### **Issue: Nginx won't start**
- Check configuration: `sudo nginx -t`
- Check logs: `sudo tail -f /var/log/nginx/error.log`
- Check port conflicts: `netstat -tlnp | grep :80`

---

## 🔄 **Next Phase**

Once Phase 7 is complete:
- **Phase 8**: Final verification (`./final-verification.sh`)
- **Phase 9**: Scale down DigitalOcean services

---

**Status**: Ready to begin Phase 7 - Configure Nginx
