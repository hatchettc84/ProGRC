# Migration Phase 3: Configure Environment

## 🎯 **Phase 3: Configure Environment**

This phase configures the environment variables and settings for the VPS deployment.

---

## ✅ **Quick Start**

### **Option 1: Automated Script (Recommended)**

On VPS, run the configuration script:

```bash
# On VPS (SSH'd in or via console)
cd /opt/progrc/bff-service-backend-dev
chmod +x configure-vps-env.sh
./configure-vps-env.sh
```

This script will:
- ✅ Generate secure passwords
- ✅ Create `.env` file with all required variables
- ✅ Update `docker-compose.yml` with database password
- ✅ Configure Ollama as primary LLM (local, no API calls)
- ✅ Configure LocalStack for S3 storage

---

## **Option 2: Manual Configuration**

### **Step 1: Create .env File**

```bash
# On VPS
cd /opt/progrc/bff-service-backend-dev
cp env.sample .env
nano .env
```

### **Step 2: Key Configuration Values**

Update these values in `.env`:

```bash
# Application
NODE_ENV=production
PORT=3000
FE_HOST=http://168.231.70.205
CORS_ORIGIN=*

# Database (Docker Compose PostgreSQL)
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_USERNAME=progrc
POSTGRES_PASSWORD=<GENERATE_SECURE_PASSWORD>
POSTGRES_DATABASE=progrc_bff
POSTGRES_SSL=false

# Redis (Docker Compose)
REDIS_HOST=redis
REDIS_PORT=6379

# Ollama (Primary - local, no API calls)
USE_OLLAMA=true
OLLAMA_BASE_URL=http://ollama:11434
OLLAMA_MODEL=llama3.2:1b
OLLAMA_EMBEDDING_MODEL=nomic-embed-text

# Disable cloud LLM services
USE_GEMINI=false
USE_GRADIENT=false
USE_OPENAI=false

# LocalStack (S3 storage)
USE_LOCALSTACK=true
LOCALSTACK_ENDPOINT=http://localstack:4566
LOCALSTACK_PUBLIC_ENDPOINT=http://168.231.70.205:4566
AWS_S3_ENDPOINT=http://localstack:4566
AWS_S3_REGION=us-east-1
AWS_S3_ACCESS_KEY_ID=test
AWS_S3_SECRET_ACCESS_KEY=test
S3_FILES_BUCKET=progrc-app-file-uploads
FRONTEND_S3_BUCKET=progrc-app-frontend-dev

# JWT (generate secure secrets)
JWT_SECRET=<GENERATE_SECURE_SECRET>
REFRESH_TOKEN_SIGNATURE=<GENERATE_SECURE_SECRET>
```

### **Step 3: Generate Secure Passwords**

```bash
# Generate database password
openssl rand -base64 32 | tr -d "=+/" | cut -c1-25

# Generate JWT secret
openssl rand -hex 32

# Generate refresh token secret
openssl rand -hex 32
```

### **Step 4: Update docker-compose.yml**

Update the `POSTGRES_PASSWORD` in `docker-compose.yml` to match your `.env` file:

```yaml
environment:
  POSTGRES_PASSWORD: <YOUR_GENERATED_PASSWORD>
```

---

## 📋 **Configuration Checklist**

- [ ] `.env` file created
- [ ] Database password generated and set
- [ ] JWT secrets generated and set
- [ ] `docker-compose.yml` updated with database password
- [ ] Ollama configured as primary LLM
- [ ] Cloud LLM services disabled (Gemini, Gradient, OpenAI)
- [ ] LocalStack configured for S3
- [ ] VPS IP set correctly (`168.231.70.205`)
- [ ] All environment variables reviewed

---

## 🔍 **Verification**

After configuration, verify:

```bash
# Check .env file exists
ls -la .env

# Check docker-compose.yml has correct password
grep POSTGRES_PASSWORD docker-compose.yml

# Verify configuration
cat .env | grep -E "(OLLAMA|POSTGRES|REDIS|LOCALSTACK)"
```

---

## ⚠️ **Important Notes**

### **Security**
- ✅ Use strong, randomly generated passwords
- ✅ Never commit `.env` file to Git
- ✅ Keep `.env` file secure (chmod 600)

### **Ollama Configuration**
- ✅ Ollama runs in Docker Compose (local, no API calls)
- ✅ Models will be pulled in Phase 5
- ✅ No external API dependencies

### **Database**
- ✅ PostgreSQL runs in Docker Compose
- ✅ Password must match in both `.env` and `docker-compose.yml`
- ✅ Database will be created automatically on first start

---

## 🔄 **Next Phase**

Once Phase 3 is complete:
- **Phase 4**: Build and deploy services
- **Phase 5**: Pull Ollama models
- **Phase 6**: Run database migrations

---

**Status**: Ready to begin Phase 3 - Configure Environment
