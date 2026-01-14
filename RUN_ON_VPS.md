# Run Installation Script on VPS

## 🚀 **Step-by-Step Instructions**

Since direct SSH access is not available, follow these steps on your VPS:

---

## **Method 1: Using DigitalOcean Console (Recommended)**

### **Step 1: Access VPS Console**
1. Go to [DigitalOcean Dashboard](https://cloud.digitalocean.com/droplets)
2. Find your VPS droplet (168.231.70.205)
3. Click on it, then click **"Console"** button (or "Access" → "Launch Droplet Console")
4. You'll get a web-based terminal

### **Step 2: Run Installation Commands**

Copy and paste these commands **one by one** into the console:

```bash
# 1. Update system
apt update && apt upgrade -y

# 2. Install Git (if not installed)
apt install -y git curl

# 3. Create directories
mkdir -p /opt/progrc/backups
cd /opt/progrc

# 4. Clone repository
git clone https://github.com/hatchettc84/ProGRC.git bff-service-backend-dev

# 5. Navigate to project directory
cd bff-service-backend-dev

# 6. Make script executable
chmod +x prepare-vps.sh

# 7. Run preparation script
./prepare-vps.sh
```

---

## **Method 2: SSH with Password (If Enabled)**

If password authentication is enabled on your VPS:

```bash
# From local machine terminal
ssh root@168.231.70.205

# Then run the same commands as above
```

---

## **Method 3: All-in-One Command Block**

If you want to run everything at once:

```bash
apt update && apt upgrade -y && \
apt install -y git curl && \
mkdir -p /opt/progrc/backups && \
cd /opt/progrc && \
git clone https://github.com/hatchettc84/ProGRC.git bff-service-backend-dev && \
cd bff-service-backend-dev && \
chmod +x prepare-vps.sh && \
./prepare-vps.sh
```

---

## **What the Script Does**

The `prepare-vps.sh` script will:

1. ✅ Update system packages
2. ✅ Install Docker (latest version)
3. ✅ Install Docker Compose (latest version)
4. ✅ Install Node.js 18.x
5. ✅ Install Nginx
6. ✅ Create directories (`/opt/progrc`, `/opt/progrc/backups`)
7. ✅ Verify all installations

**Estimated time**: 5-10 minutes

---

## **Expected Output**

You should see:

```
==========================================
VPS Preparation Script
==========================================

Step 1: Updating system...
✓ System updated

Step 2: Installing Docker...
✓ Docker installed
Docker version 24.x.x, build xxxxxx

Step 3: Installing Docker Compose...
✓ Docker Compose installed
Docker Compose version v2.x.x

Step 4: Installing Node.js...
✓ Node.js installed
v18.x.x
9.x.x

Step 5: Installing Nginx...
✓ Nginx installed
nginx/1.x.x

Step 6: Creating directory structure...
✓ Directories created

==========================================
VPS Preparation Complete!
==========================================
```

---

## **Verification After Script Completes**

Run these commands to verify installations:

```bash
# Check Docker
docker --version
docker ps

# Check Docker Compose
docker-compose --version

# Check Node.js
node --version
npm --version

# Check Nginx
nginx -v
systemctl status nginx

# Check directories
ls -la /opt/progrc/
```

---

## **Next Steps After Installation**

Once the script completes successfully:

1. ✅ **Phase 2 Complete**: VPS is prepared
2. 📋 **Phase 3**: Configure environment (`.env` file)
3. 📋 **Phase 4**: Build and deploy services

---

## **Troubleshooting**

### **Issue: "Permission denied"**
```bash
# Run with sudo (if not root)
sudo ./prepare-vps.sh
```

### **Issue: "Command not found: git"**
```bash
# Install Git first
apt update && apt install -y git
```

### **Issue: "Connection refused" or "Timeout"**
- Check VPS is running in DigitalOcean dashboard
- Verify firewall rules allow SSH (port 22)
- Try accessing via DigitalOcean Console instead

### **Issue: Script fails partway through**
- Check error message
- Re-run the script (it checks for existing installations)
- Some steps may have already completed

---

## **Quick Reference**

**VPS IP**: `168.231.70.205`  
**Project Directory**: `/opt/progrc/bff-service-backend-dev`  
**Script Location**: `/opt/progrc/bff-service-backend-dev/prepare-vps.sh`

---

**After running the script successfully, let me know and we'll proceed to Phase 3!**
