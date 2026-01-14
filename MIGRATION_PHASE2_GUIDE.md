# Migration Phase 2: Prepare VPS

## 🎯 **Phase 2: Prepare VPS**

This phase prepares your VPS (168.231.70.205) for the ProGRC deployment.

---

## ✅ **Quick Start**

### **Option 1: Automated Script (Recommended)**

1. **SSH into VPS:**
   ```bash
   ssh root@168.231.70.205
   ```

2. **Transfer preparation script:**
   ```bash
   # From local machine (new terminal, not SSH'd)
   cd /Users/corneliushatchett/Downloads/PRO\ GRC/bff-service-backend-dev
   scp prepare-vps.sh root@168.231.70.205:/root/
   ```

3. **Run preparation script on VPS:**
   ```bash
   # On VPS (SSH'd in)
   chmod +x /root/prepare-vps.sh
   /root/prepare-vps.sh
   ```

### **Option 2: Manual Installation**

Follow the manual steps in `VPS_DEPLOYMENT_STEPS.md` (Steps 2-4).

---

## 📋 **What the Script Does**

1. **Updates System**: `apt update && apt upgrade -y`
2. **Installs Docker**: Latest version via Docker's installation script
3. **Installs Docker Compose**: Latest version from GitHub
4. **Installs Node.js**: Version 18.x (LTS)
5. **Installs Nginx**: For reverse proxy and SSL
6. **Creates Directories**: `/opt/progrc` and `/opt/progrc/backups`

---

## 🔍 **Verification**

After running the script, verify installations:

```bash
# Check Docker
docker --version
docker ps  # Should show empty list (no containers yet)

# Check Docker Compose
docker-compose --version

# Check Node.js
node --version
npm --version

# Check Nginx
nginx -v
systemctl status nginx  # Should be active

# Check directories
ls -la /opt/progrc/
ls -la /opt/progrc/backups/
```

---

## ⚠️ **Troubleshooting**

### **Issue: "Permission denied" when running script**
```bash
# Run with sudo
sudo ./prepare-vps.sh
```

### **Issue: "Command not found" after installation**
```bash
# Reload shell
source ~/.bashrc
# or
exec bash
```

### **Issue: Docker daemon not running**
```bash
# Start Docker service
systemctl start docker
systemctl enable docker

# Verify
systemctl status docker
```

### **Issue: Nginx not starting**
```bash
# Check status
systemctl status nginx

# Check configuration
nginx -t

# Start service
systemctl start nginx
systemctl enable nginx
```

---

## ✅ **Phase 2 Checklist**

- [ ] VPS is accessible via SSH
- [ ] Docker installed and running
- [ ] Docker Compose installed
- [ ] Node.js installed (v18.x)
- [ ] NPM installed
- [ ] Nginx installed and running
- [ ] Directories created (`/opt/progrc`, `/opt/progrc/backups`)
- [ ] All installations verified

---

## 🔄 **Next Phase**

Once Phase 2 is complete:
- **Phase 3**: Transfer codebase to VPS
- **Phase 4**: Configure environment
- **Phase 5**: Deploy services

---

**Status**: Ready to begin Phase 2 - Prepare VPS
