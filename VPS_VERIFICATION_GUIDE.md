# VPS Verification Guide

## 🎯 **Overview**

This guide helps you verify that everything is intact on your VPS infrastructure.

## 📋 **Infrastructure Components**

### **1. VPS (168.231.70.205)**
- **Purpose**: Full application deployment (if deployed)
- **Services**: Docker Compose, Application, Database, Redis, Nginx
- **Status**: ✅ Reachable

### **2. AI Droplet (64.225.20.65)**
- **Purpose**: Ollama service for AI operations
- **Services**: Ollama (port 11434)
- **Models**: `llama3.2:1b`, `nomic-embed-text`
- **Used By**: Kubernetes cluster backend pods
- **Status**: ⚠️ Needs verification

### **3. Kubernetes Cluster (DigitalOcean)**
- **Purpose**: Primary application deployment
- **Services**: Backend (3 pods), Frontend, Redis, PostgreSQL
- **AI Configuration**: Uses AI Droplet (64.225.20.65:11434)
- **Status**: ✅ Running

---

## ✅ **Verification Steps**

### **Step 1: Verify AI Droplet (64.225.20.65)**

#### **SSH into AI Droplet:**
```bash
ssh root@64.225.20.65
```

#### **Check Ollama Service:**
```bash
# Check if Ollama is installed
ollama --version

# Check service status
systemctl status ollama

# Check if Ollama is running
curl http://localhost:11434/api/tags

# List installed models
ollama list

# Verify port is listening
netstat -tlnp | grep 11434
# or
ss -tlnp | grep 11434
```

#### **Expected Output:**
- ✅ Ollama version should be displayed
- ✅ Service should be `active (running)`
- ✅ API should return JSON with models
- ✅ Models should include: `llama3.2:1b`, `nomic-embed-text`
- ✅ Port 11434 should be listening on `0.0.0.0:11434` (all interfaces)

#### **If Ollama is Not Running:**
```bash
# Start Ollama service
systemctl start ollama

# Enable auto-start
systemctl enable ollama

# Check logs
journalctl -u ollama -n 50
```

#### **If Models are Missing:**
```bash
# Pull required models
ollama pull llama3.2:1b
ollama pull nomic-embed-text

# Verify models
ollama list
```

---

### **Step 2: Verify VPS (168.231.70.205) - If Deployed**

#### **SSH into VPS:**
```bash
ssh root@168.231.70.205
```

#### **Check Docker Services:**
```bash
# Navigate to application directory
cd /opt/progrc/bff-service-backend-dev
# or
cd /root/bff-service-backend-dev

# Check running containers
docker compose ps

# Check all services status
docker compose ps --all

# Check application logs
docker compose logs app | tail -50

# Check database status
docker compose ps postgres

# Check Redis status
docker compose ps redis
```

#### **Expected Output:**
- ✅ All containers should be `Up` status
- ✅ Application logs should show no errors
- ✅ Database should be accessible
- ✅ Redis should be running

#### **Health Check:**
```bash
# Check application health
curl http://localhost:3000/api/v1/health

# Check if Nginx is running
systemctl status nginx

# Check Nginx configuration
nginx -t
```

---

### **Step 3: Verify Kubernetes Configuration**

#### **From Local Machine (with kubectl configured):**
```bash
# Check ConfigMap
kubectl get configmap -n progrc-dev backend-config -o yaml

# Verify Ollama configuration
kubectl get configmap -n progrc-dev backend-config -o jsonpath='{.data.OLLAMA_BASE_URL}'
kubectl get configmap -n progrc-dev backend-config -o jsonpath='{.data.OLLAMA_MODEL}'
kubectl get configmap -n progrc-dev backend-config -o jsonpath='{.data.USE_OLLAMA}'

# Check backend pods
kubectl get pods -n progrc-dev -l app=progrc-backend

# Check backend logs for Ollama
kubectl logs -n progrc-dev -l app=progrc-backend | grep -i ollama | tail -20

# Test Ollama connectivity from pod
kubectl exec -n progrc-dev deployment/progrc-backend -- curl -s http://64.225.20.65:11434/api/tags
```

#### **Expected Configuration:**
- ✅ `OLLAMA_BASE_URL`: `http://64.225.20.65:11434`
- ✅ `OLLAMA_MODEL`: `llama3.2:1b`
- ✅ `USE_OLLAMA`: `true`
- ✅ Pods should be `Running`
- ✅ Logs should show: `Using Ollama for AI processing`
- ✅ Pods should be able to reach Ollama API

---

## 🔍 **Quick Verification Commands**

### **Run Verification Script:**
```bash
# From local machine
cd /Users/corneliushatchett/Downloads/PRO\ GRC/bff-service-backend-dev
./verify-vps-setup.sh
```

### **Check AI Droplet from Kubernetes:**
```bash
# Test connectivity
kubectl run test-ollama --image=curlimages/curl --rm -it -- \
  curl -s http://64.225.20.65:11434/api/tags

# Should return JSON with models
```

### **Check Backend Logs:**
```bash
# Real-time monitoring
kubectl logs -n progrc-dev -l app=progrc-backend -f | grep -i ollama

# Look for:
# ✅ "Using Ollama for AI processing"
# ❌ "Ollama availability check failed"
# ❌ "Using Gemini for AI processing (fallback)"
```

---

## ⚠️ **Common Issues and Solutions**

### **Issue 1: Ollama Not Accessible from Kubernetes**

**Symptoms:**
- Pods cannot reach Ollama API
- Backend logs show "Ollama availability check failed"
- System falls back to Gemini/OpenAI

**Solutions:**
1. **Check AI Droplet Firewall:**
   ```bash
   # On AI Droplet
   ufw status
   ufw allow 11434/tcp
   ufw reload
   ```

2. **Verify Ollama is Listening on All Interfaces:**
   ```bash
   # On AI Droplet
   systemctl edit ollama
   # Add: [Service] Environment="OLLAMA_HOST=0.0.0.0"
   systemctl daemon-reload
   systemctl restart ollama
   
   # Verify
   ss -tlnp | grep 11434
   # Should show: 0.0.0.0:11434
   ```

3. **Check Network Connectivity:**
   ```bash
   # From Kubernetes pod
   kubectl exec -n progrc-dev deployment/progrc-backend -- ping -c 3 64.225.20.65
   ```

### **Issue 2: Models Not Found**

**Symptoms:**
- Ollama API returns empty models list
- Backend errors when trying to use AI

**Solutions:**
```bash
# On AI Droplet
ollama pull llama3.2:1b
ollama pull nomic-embed-text
ollama list
```

### **Issue 3: VPS Services Not Running**

**Symptoms:**
- Docker containers not running
- Application not accessible

**Solutions:**
```bash
# On VPS
cd /opt/progrc/bff-service-backend-dev
docker compose ps
docker compose up -d
docker compose logs
```

---

## 📊 **Verification Checklist**

### **AI Droplet (64.225.20.65):**
- [ ] Ollama service is running
- [ ] Port 11434 is accessible
- [ ] Models are installed (`llama3.2:1b`, `nomic-embed-text`)
- [ ] API responds correctly
- [ ] Firewall allows port 11434

### **VPS (168.231.70.205) - If Deployed:**
- [ ] Docker Compose services are running
- [ ] Application is accessible
- [ ] Database is running
- [ ] Redis is running
- [ ] Nginx is configured (if used)

### **Kubernetes Cluster:**
- [ ] Backend pods are running
- [ ] ConfigMap has correct Ollama configuration
- [ ] Pods can reach Ollama API
- [ ] Backend logs show Ollama usage
- [ ] No fallback to cloud services

---

## 🔗 **Useful Documentation**

- **VPS Deployment**: `VPS_DEPLOYMENT_STEPS.md`
- **Ollama Setup**: `OLLAMA_SETUP_SUMMARY.md`
- **Ollama VPS Setup**: `OLLAMA_VPS_SETUP.md`
- **AI Configuration**: `VPS_AI_CONFIGURATION_SUMMARY.md`
- **AI Droplet Setup**: `AI_DROPLET_SETUP.md`

---

## 📝 **Summary**

Based on your current configuration:

1. **Primary Setup**: Kubernetes cluster on DigitalOcean
2. **AI Service**: AI Droplet at `64.225.20.65:11434` (Ollama)
3. **VPS**: `168.231.70.205` (may be for separate deployment)

**Next Steps:**
1. Verify AI Droplet Ollama is running and accessible
2. Verify Kubernetes can reach Ollama
3. Check backend logs to confirm Ollama usage
4. Verify VPS deployment (if applicable)

---

**Status**: Use this guide to verify all components are intact and working correctly.
