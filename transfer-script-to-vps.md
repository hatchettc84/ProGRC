# Transfer Script to VPS

## ⚠️ **SSH Authentication Issue**

The automatic transfer failed due to SSH authentication. Here are alternative methods:

---

## **Option 1: Manual Copy via GitHub (Recommended)**

Since all files are already on GitHub, you can clone directly on the VPS:

### **On VPS (SSH'd in):**
```bash
# SSH into VPS
ssh root@168.231.70.205

# Clone repository
cd /opt/progrc
git clone https://github.com/hatchettc84/ProGRC.git bff-service-backend-dev
cd bff-service-backend-dev

# Script is now available
ls -la prepare-vps.sh
chmod +x prepare-vps.sh
./prepare-vps.sh
```

---

## **Option 2: Copy Script Content Manually**

### **Step 1: View Script Content**
```bash
# From local machine
cat prepare-vps.sh
```

### **Step 2: Copy Content to VPS**
On VPS, create the file manually:

```bash
# SSH into VPS
ssh root@168.231.70.205

# Create script file
nano /root/prepare-vps.sh
```

**Paste the entire content of `prepare-vps.sh`**, then:
- Press `Ctrl+O` to save
- Press `Enter` to confirm
- Press `Ctrl+X` to exit

```bash
# Make executable
chmod +x /root/prepare-vps.sh

# Run it
/root/prepare-vps.sh
```

---

## **Option 3: Setup SSH Key Authentication**

If you want to enable passwordless SSH:

### **Step 1: Generate SSH Key (if needed)**
```bash
# From local machine
ssh-keygen -t ed25519 -C "vps-access" -f ~/.ssh/vps_key
```

### **Step 2: Copy Public Key to VPS**
```bash
# Display public key
cat ~/.ssh/vps_key.pub
```

### **Step 3: Add Key to VPS**
On VPS (via DigitalOcean console or existing access):
```bash
# On VPS
mkdir -p ~/.ssh
echo "PASTE_PUBLIC_KEY_HERE" >> ~/.ssh/authorized_keys
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

### **Step 4: Use Key for SSH**
```bash
# From local machine
ssh -i ~/.ssh/vps_key root@168.231.70.205
```

---

## **Option 4: Use DigitalOcean Console**

1. Go to DigitalOcean → Droplets → Select VPS (168.231.70.205)
2. Click "Console" to access web terminal
3. Run commands directly on the VPS
4. Clone repository or copy script content

---

## **Recommended: Option 1 (GitHub Clone)**

**Simplest approach:**

1. **SSH into VPS** (using DigitalOcean console or password)
2. **Clone repository:**
   ```bash
   cd /opt/progrc
   git clone https://github.com/hatchettc84/ProGRC.git bff-service-backend-dev
   cd bff-service-backend-dev
   ```
3. **Run preparation script:**
   ```bash
   chmod +x prepare-vps.sh
   ./prepare-vps.sh
   ```

---

## **Quick Commands for VPS**

Once you're on the VPS:

```bash
# Create directory
mkdir -p /opt/progrc
cd /opt/progrc

# Clone repository
git clone https://github.com/hatchettc84/ProGRC.git bff-service-backend-dev
cd bff-service-backend-dev

# Run preparation script
chmod +x prepare-vps.sh
./prepare-vps.sh
```

---

**Choose the option that works best for your VPS access method!**
