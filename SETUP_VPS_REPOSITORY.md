# Setup VPS Repository

## 🚀 **Quick Setup**

The directory exists but needs to be initialized as a git repository. Run these commands on your VPS:

---

## **Option 1: Clone Fresh (Recommended)**

```bash
# Remove existing directory (if empty or not needed)
cd /opt/progrc
rm -rf bff-service-backend-dev

# Clone repository
git clone https://github.com/hatchettc84/ProGRC.git bff-service-backend-dev

# Navigate to project
cd bff-service-backend-dev

# Verify files
ls -la
```

---

## **Option 2: Initialize Existing Directory**

If you have files in the directory you want to keep:

```bash
cd /opt/progrc/bff-service-backend-dev

# Initialize git
git init

# Add remote
git remote add origin https://github.com/hatchettc84/ProGRC.git

# Fetch and merge
git fetch origin
git branch -M main
git reset --hard origin/main

# Verify
ls -la
```

---

## **After Setup**

Once the repository is cloned, proceed with migration:

```bash
cd /opt/progrc/bff-service-backend-dev
chmod +x configure-vps-env.sh deploy-vps-services.sh pull-ollama-models.sh run-migrations.sh configure-nginx.sh verify-deployment.sh final-verification.sh
./configure-vps-env.sh
```

---

**Choose Option 1 (recommended) or Option 2 based on your needs!**
