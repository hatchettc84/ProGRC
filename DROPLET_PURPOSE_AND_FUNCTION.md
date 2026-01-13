# Droplet Purpose and Function Summary

## 📋 Overview

You have **3 DigitalOcean Droplets** in your infrastructure:

1. **AI Droplet** - `64.225.20.65` (progrc-ai-droplet)
2. **Droplet 2** - `142.93.183.7` (purpose to be determined)
3. **Droplet 3** - `45.55.185.33` (purpose to be determined)

**Note**: Your application is accessible at `http://143.244.221.38/` - this is likely a **Kubernetes LoadBalancer IP** (not a droplet), which routes traffic to your backend/frontend services running in the Kubernetes cluster.

---

## 🤖 Droplet 1: AI Droplet (64.225.20.65)

### **Name**: `progrc-ai-droplet`
### **IP Address**: `64.225.20.65`
### **Region**: `nyc3` (same as Kubernetes cluster)
### **Size**: `s-4vcpu-8gb` (4 vCPU, 8GB RAM, 160GB Disk)
### **OS**: Ubuntu 22.04

### **Primary Purpose**:
**Self-hosted AI/LLM service** - Runs Ollama to eliminate external API calls

### **Key Functions**:

1. **Ollama Service**:
   - Runs Ollama on port `11434`
   - Accessible from Kubernetes cluster
   - Listens on all interfaces (`0.0.0.0:11434`)

2. **AI Models Installed**:
   - `llama3.2:1b` (1.3 GB) - Text generation, compliance analysis
   - `nomic-embed-text` (274 MB) - Document embeddings (768 dimensions)

3. **Integration with Backend**:
   - Backend Kubernetes pods connect to this droplet
   - Used for:
     - Compliance scoring and analysis
     - Document processing and chunking
     - AI assistant features (`/ask-ai`)
     - POAM generation
     - Template variable generation
     - Evidence evaluation
     - Control evaluation narratives

4. **Service Priority**:
   - **Primary**: Ollama (this droplet)
   - **Fallback**: Gemini (disabled)
   - **Fallback**: Gradient (disabled)
   - **Fallback**: OpenAI (if Ollama unavailable)

### **Configuration**:
- **OLLAMA_BASE_URL**: `http://64.225.20.65:11434`
- **OLLAMA_MODEL**: `llama3.2:1b`
- **OLLAMA_EMBEDDING_MODEL**: `nomic-embed-text`
- **USE_OLLAMA**: `true`
- **USE_GEMINI**: `false` (disabled)
- **USE_GRADIENT**: `false` (disabled)

### **Cost Savings**:
- **Before**: Variable API costs (Gemini, OpenAI, Gradient)
- **After**: Fixed $48/month (droplet cost only)
- **Savings**: Eliminated variable API costs

### **Management Commands**:
```bash
# Check Ollama status
systemctl status ollama

# List models
ollama list

# Test API
curl http://localhost:11434/api/tags

# Check external access
ss -tlnp | grep 11434
```

---

## 🔍 Droplet 2: 142.93.183.7

### **IP Address**: `142.93.183.7`
### **Purpose**: **Unknown/To Be Determined**

### **Possible Purposes** (needs verification):

Based on project files, this could be:

1. **VPS/Development Server**:
   - May have been used for development/testing
   - Could host Docker Compose setup
   - Might have application files

2. **Backup/Secondary Service**:
   - Could be a backup server
   - Might run additional services

3. **Legacy/Unused**:
   - Could be an old server no longer in use
   - May have been replaced by Kubernetes cluster

### **How to Determine Purpose**:

Once connected, run these commands:

```bash
# Check hostname
hostname

# Check what's running
systemctl list-units --type=service --state=running

# Check for Docker
docker ps
docker-compose ps

# Check for application files
ls -la /var/www
ls -la /opt
ls -la /root

# Check network services
ss -tlnp

# Check disk usage
df -h
du -sh /* | sort -h

# Check recent activity
last
journalctl --since "1 week ago" | head -50
```

### **What to Look For**:

- **Docker containers**: `docker ps`
- **Application files**: `/var/www`, `/opt`, `/root/bff-service-backend-dev`
- **Web server**: Nginx, Apache
- **Database**: PostgreSQL, MySQL
- **Kubernetes**: `kubectl get nodes`
- **Ollama**: `systemctl status ollama`

---

## 🔍 Droplet 3: 45.55.185.33

### **IP Address**: `142.93.183.7`
### **Purpose**: **Unknown/To Be Determined**

### **Possible Purposes** (needs verification):

Based on project files, this could be:

1. **VPS/Development Server**:
   - May have been used for development/testing
   - Could host Docker Compose setup
   - Might have application files

2. **Backup/Secondary Service**:
   - Could be a backup server
   - Might run additional services

3. **Legacy/Unused**:
   - Could be an old server no longer in use
   - May have been replaced by Kubernetes cluster

### **How to Determine Purpose**:

Once connected, run these commands:

```bash
# Check hostname
hostname

# Check what's running
systemctl list-units --type=service --state=running

# Check for Docker
docker ps
docker-compose ps

# Check for application files
ls -la /var/www
ls -la /opt
ls -la /root

# Check network services
ss -tlnp

# Check disk usage
df -h
du -sh /* | sort -h

# Check recent activity
last
journalctl --since "1 week ago" | head -50
```

### **What to Look For**:

- **Docker containers**: `docker ps`
- **Application files**: `/var/www`, `/opt`, `/root/bff-service-backend-dev`
- **Web server**: Nginx, Apache
- **Database**: PostgreSQL, MySQL
- **Kubernetes**: `kubectl get nodes`
- **Ollama**: `systemctl status ollama`

---

## 🏗️ Infrastructure Architecture

### Current Setup:

```
┌─────────────────────────────────────┐
│   DigitalOcean Kubernetes Cluster   │
│   (progrc-dev-cluster)              │
│   - Backend Pods                    │
│   - Uses Ollama from AI Droplet     │
└──────────────┬──────────────────────┘
               │
               │ HTTP requests
               │
┌──────────────▼──────────────────────┐
│   AI Droplet (64.225.20.65)         │
│   - Ollama Service (port 11434)     │
│   - Models: llama3.2:1b,           │
│             nomic-embed-text        │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│   Droplet 2 (142.93.183.7)         │
│   - Purpose: TBD                   │
│   - Status: Unknown                 │
└─────────────────────────────────────┘
```

---

## 📊 Comparison

| Feature | AI Droplet (64.225.20.65) | Droplet 2 (142.93.183.7) | Droplet 3 (45.55.185.33) |
|---------|---------------------------|-------------------------|-------------------------|
| **Purpose** | Ollama AI Service | Unknown | Unknown |
| **Status** | ✅ Active & Configured | ❓ To be determined | ❓ To be determined |
| **Services** | Ollama (port 11434) | Unknown | Unknown |
| **Integration** | ✅ Connected to K8s | ❓ Unknown | ❓ Unknown |
| **Cost** | ~$48/month | Unknown | Unknown |
| **Region** | nyc3 | Unknown | Unknown |

---

## 🎯 Next Steps

### For AI Droplet (64.225.20.65):
- ✅ Already configured and working
- ✅ Connected to Kubernetes cluster
- ✅ Models installed
- ✅ Ready for production use

### For Droplet 2 (142.93.183.7):
1. **Identify Purpose**:
   - Check what services are running
   - Review application files
   - Check logs and history

2. **Determine if Needed**:
   - Is it still in use?
   - Can it be decommissioned?
   - Should it be repurposed?

3. **Document Findings**:
   - Update this document with findings
   - Decide on next steps

### For Droplet 3 (45.55.185.33):
1. **Identify Purpose**:
   - Check what services are running
   - Review application files
   - Check logs and history
   - Compare with droplet 2 to see if duplicate

2. **Determine if Needed**:
   - Is it still in use?
   - Can it be decommissioned?
   - Should it be repurposed?

3. **Document Findings**:
   - Update this document with findings
   - Decide on next steps

---

## 🔍 Quick Identification Commands

Run these on droplet 142.93.183.7 to identify its purpose:

```bash
# System info
hostname
cat /etc/hostname
uname -a

# Running services
systemctl list-units --type=service --state=running

# Docker
docker ps -a
docker-compose ps 2>/dev/null

# Application files
find / -name "bff-service-backend*" -type d 2>/dev/null
find / -name "docker-compose.yml" 2>/dev/null
ls -la /var/www
ls -la /opt
ls -la /root

# Network services
ss -tlnp

# Recent activity
last | head -10
journalctl --since "1 month ago" --no-pager | tail -50
```

---

**Status**: 
- ✅ AI Droplet purpose: **Known** (Ollama service)
- ❓ Droplet 2 (142.93.183.7) purpose: **To be determined**
- ❓ Droplet 3 (45.55.185.33) purpose: **To be determined**

**Next**: Connect to droplets 142.93.183.7 and 45.55.185.33 and run identification commands to determine their purposes.
