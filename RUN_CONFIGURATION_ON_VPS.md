# Run Configuration Script on VPS

## 🚀 **Step-by-Step Instructions**

Since direct SSH access is not available, follow these steps on your VPS:

---

## **Method 1: Using DigitalOcean Console (Recommended)**

### **Step 1: Access VPS Console**
1. Go to [DigitalOcean Dashboard](https://cloud.digitalocean.com/droplets)
2. Find your VPS droplet (168.231.70.205)
3. Click on it, then click **"Console"** button (or "Access" → "Launch Droplet Console")
4. You'll get a web-based terminal

### **Step 2: Run Configuration Commands**

Copy and paste these commands **one by one** into the console:

```bash
# 1. Navigate to project directory
cd /opt/progrc/bff-service-backend-dev

# 2. Pull latest changes from GitHub (to get the script)
git pull origin main

# 3. Make script executable
chmod +x configure-vps-env.sh

# 4. Run configuration script
./configure-vps-env.sh
```

---

## **Method 2: All-in-One Command Block**

If you want to run everything at once:

```bash
cd /opt/progrc/bff-service-backend-dev && \
git pull origin main && \
chmod +x configure-vps-env.sh && \
./configure-vps-env.sh
```

---

## **Method 3: Manual Configuration (If Script Fails)**

If the script doesn't work, you can configure manually:

### **Step 1: Generate Passwords**

```bash
# Generate database password
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
echo "Database Password: $DB_PASSWORD"

# Generate JWT secret
JWT_SECRET=$(openssl rand -hex 32)
echo "JWT Secret: $JWT_SECRET"

# Generate refresh token secret
REFRESH_TOKEN_SECRET=$(openssl rand -hex 32)
echo "Refresh Token Secret: $REFRESH_TOKEN_SECRET"
```

**Save these values!** You'll need them for the `.env` file.

### **Step 2: Create .env File**

```bash
cd /opt/progrc/bff-service-backend-dev
nano .env
```

Paste this content (replace `<DB_PASSWORD>`, `<JWT_SECRET>`, `<REFRESH_TOKEN_SECRET>` with values from Step 1):

```bash
# Application
NODE_ENV=production
PORT=3000
API_PREFIX=api
CORS_ORIGIN=*
ENVIRONMENT=production

# Frontend URLs
FE_HOST=http://168.231.70.205
USER_INVITATION_URL=/reset-password

# Database (Docker Compose PostgreSQL)
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_USERNAME=progrc
POSTGRES_PASSWORD=<DB_PASSWORD>
POSTGRES_DATABASE=progrc_bff
POSTGRES_SSL=false

# Redis (Docker Compose)
REDIS_HOST=redis
REDIS_PORT=6379

# JWT Configuration
JWT_SECRET=<JWT_SECRET>
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SIGNATURE=<REFRESH_TOKEN_SECRET>

# Token Expiry
RESET_PASSWORD_EXPIRY_TOKEN_HOUR=24
USER_INVITATION_EXPIRY_TOKEN_HOUR=168
IMPERSONATE_TIMEOUT_SECONDS=14400

# AWS SQS (disabled for VPS)
AWS_SQS_ENABLED=false

# AWS S3 Configuration (LocalStack for VPS)
USE_LOCALSTACK=true
LOCALSTACK_ENDPOINT=http://localstack:4566
LOCALSTACK_PUBLIC_ENDPOINT=http://168.231.70.205:4566
AWS_S3_ENDPOINT=http://localstack:4566
AWS_S3_REGION=us-east-1
AWS_S3_ACCESS_KEY_ID=test
AWS_S3_SECRET_ACCESS_KEY=test
S3_FILES_BUCKET=progrc-app-file-uploads
FRONTEND_S3_BUCKET=progrc-app-frontend-dev

# LLM Configuration - Priority: Ollama (local) > Gemini > OpenAI
# Ollama (Primary - local, no API calls)
USE_OLLAMA=true
OLLAMA_BASE_URL=http://ollama:11434
OLLAMA_MODEL=llama3.2:1b
OLLAMA_EMBEDDING_MODEL=nomic-embed-text

# Gemini (Fallback - disabled by default)
USE_GEMINI=false
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.0-flash-exp

# OpenAI (Fallback - disabled by default)
OPENAI_API_KEY=

# Gradient AI (disabled)
USE_GRADIENT=false

# Other Settings
POPULATE_ASSET_DUMMY_DATA=true
```

**Save the file:**
- Press `Ctrl+O` to save
- Press `Enter` to confirm
- Press `Ctrl+X` to exit

### **Step 3: Update docker-compose.yml**

```bash
# Update POSTGRES_PASSWORD in docker-compose.yml
sed -i "s/POSTGRES_PASSWORD: progrc_dev_password_change_me/POSTGRES_PASSWORD: <DB_PASSWORD>/g" docker-compose.yml
```

Replace `<DB_PASSWORD>` with the actual password from Step 1.

---

## **Expected Output**

When the script runs successfully, you should see:

```
==========================================
VPS Environment Configuration
==========================================

✓ Generated secure passwords
✓ .env file created
✓ docker-compose.yml updated

==========================================
Configuration Complete!
==========================================
```

---

## **Verification After Configuration**

Run these commands to verify:

```bash
# Check .env file exists
ls -la .env

# Check configuration values
cat .env | grep -E "(OLLAMA|POSTGRES|REDIS|LOCALSTACK)"

# Check docker-compose.yml has correct password
grep POSTGRES_PASSWORD docker-compose.yml
```

---

## **Troubleshooting**

### **Issue: "Script not found"**
```bash
# Make sure you're in the right directory
cd /opt/progrc/bff-service-backend-dev

# Pull latest from GitHub
git pull origin main

# Check if script exists
ls -la configure-vps-env.sh
```

### **Issue: "Permission denied"**
```bash
# Make script executable
chmod +x configure-vps-env.sh
```

### **Issue: "openssl: command not found"**
```bash
# Install openssl
apt update && apt install -y openssl
```

### **Issue: Script fails partway through**
- Check error message
- Use Method 3 (Manual Configuration) instead
- Or re-run the script (it checks for existing installations)

---

## **Next Steps**

Once configuration is complete:

1. ✅ **Phase 3 Complete**: Environment configured
2. 📋 **Phase 4**: Build and deploy services (`docker-compose up -d`)
3. 📋 **Phase 5**: Pull Ollama models
4. 📋 **Phase 6**: Run database migrations

---

**After running the configuration script successfully, let me know and we'll proceed to Phase 4!**
