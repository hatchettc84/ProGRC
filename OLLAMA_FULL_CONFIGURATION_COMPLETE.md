# Ollama Full Configuration Complete

## ✅ Configuration Status

Ollama has been fully configured to use the AI Droplet for all LLM operations, eliminating external API calls.

## Configuration Summary

### AI Droplet Details
- **IP Address**: `64.225.20.65`
- **Port**: `11434`
- **Region**: `nyc3` (same as Kubernetes cluster)
- **URL**: `http://64.225.20.65:11434`

### Models Required
- **LLM Model**: `llama3.2:1b` (for text generation, chat, compliance analysis)
- **Embedding Model**: `nomic-embed-text` (for document embeddings, 768 dimensions)

### Current Configuration
- ✅ **USE_OLLAMA**: `true`
- ✅ **OLLAMA_BASE_URL**: `http://64.225.20.65:11434`
- ✅ **OLLAMA_MODEL**: `llama3.2:1b`
- ✅ **OLLAMA_EMBEDDING_MODEL**: `nomic-embed-text`
- ✅ **USE_GEMINI**: `false` (disabled)
- ✅ **USE_GRADIENT**: `false` (disabled)
- ✅ **Backend**: Restarted and configured

## ⚠️ Action Required: Install Models

The models need to be installed on the AI Droplet. You have two options:

### Option 1: Install via SSH (Recommended)

```bash
# SSH into AI Droplet
ssh root@64.225.20.65

# Install models
ollama pull llama3.2:1b
ollama pull nomic-embed-text

# Verify installation
ollama list
```

### Option 2: Use Installation Script

```bash
# Run the installation script (requires SSH access)
./install-ollama-models.sh
```

This script will:
- Connect to AI Droplet via SSH
- Check Ollama installation
- Install both required models
- Verify models are working
- Test functionality

## Verification Steps

### 1. Verify Models on AI Droplet

```bash
# From your local machine
curl http://64.225.20.65:11434/api/tags | jq '.models[].name'

# Should show:
# - llama3.2:1b
# - nomic-embed-text
```

### 2. Test from Kubernetes Cluster

```bash
# Test connectivity
kubectl run test-ollama --image=curlimages/curl --rm -it -- \
  curl -s http://64.225.20.65:11434/api/tags

# Test LLM model
kubectl run test-ollama-llm --image=curlimages/curl --rm -it -- \
  curl -s -X POST http://64.225.20.65:11434/api/chat \
  -H 'Content-Type: application/json' \
  -d '{"model":"llama3.2:1b","messages":[{"role":"user","content":"test"}],"stream":false}'

# Test embedding model
kubectl run test-ollama-embed --image=curlimages/curl --rm -it -- \
  curl -s -X POST http://64.225.20.65:11434/api/embeddings \
  -H 'Content-Type: application/json' \
  -d '{"model":"nomic-embed-text","prompt":"test"}'
```

### 3. Verify Backend Configuration

```bash
# Check environment variables
kubectl exec -n progrc-dev deployment/progrc-backend -- env | grep OLLAMA

# Should show:
# USE_OLLAMA=true
# OLLAMA_BASE_URL=http://64.225.20.65:11434
# OLLAMA_MODEL=llama3.2:1b
# OLLAMA_EMBEDDING_MODEL=nomic-embed-text
```

### 4. Monitor Backend Logs

```bash
# Watch for Ollama usage
kubectl logs -n progrc-dev -l app=progrc-backend -f | grep -i ollama

# Should see:
# - "Ollama service initialized: http://64.225.20.65:11434, model: llama3.2:1b"
# - "Using Ollama for AI processing (local, no API calls)"
# - "Using Ollama for embedding generation (local, no API calls)"
```

## Service Priority

The platform now uses AI services in this order:

1. **Ollama** (Primary) ✅
   - Local, no API calls
   - AI Droplet: `64.225.20.65:11434`
   - Models: `llama3.2:1b`, `nomic-embed-text`

2. **Gemini** (Disabled) ❌
   - `USE_GEMINI: false`

3. **Gradient** (Disabled) ❌
   - `USE_GRADIENT: false`

4. **OpenAI** (Fallback) ⚠️
   - Only if Ollama unavailable and API key configured

## Features Using Ollama

Once models are installed, Ollama will be used for:

1. **Compliance Scoring**
   - Control evaluation
   - Evidence analysis
   - Gap identification

2. **Document Processing**
   - Document chunking
   - Embedding generation
   - Control mapping

3. **AI Assistant** (`/ask-ai`)
   - Chat interface
   - Compliance questions
   - Context-aware responses

4. **POAM Generation**
   - Auto-generate from gaps
   - Remediation suggestions

5. **Recommendations**
   - AI-powered suggestions
   - Control recommendations

6. **Template Variables**
   - Dynamic content generation
   - AI-powered templates

7. **Audit Feedback**
   - Response generation
   - Remediation actions

8. **Comment Analysis**
   - Summarization
   - Action item extraction

## Model Specifications

### llama3.2:1b
- **Size**: ~1.3GB
- **Purpose**: Text generation, chat, analysis
- **Speed**: Fast (1B parameters)
- **Quality**: Good for general GRC tasks
- **Use Cases**: Compliance analysis, chat, POAM generation

### nomic-embed-text
- **Size**: ~274MB
- **Purpose**: Embedding generation
- **Dimensions**: 768
- **Speed**: Fast
- **Use Cases**: Document embeddings, semantic search, control mapping

## Troubleshooting

### Issue: Models not found

**Solution**: Install models on AI Droplet:
```bash
ssh root@64.225.20.65
ollama pull llama3.2:1b
ollama pull nomic-embed-text
```

### Issue: Connection timeout

**Check**:
1. AI Droplet is running: `ping 64.225.20.65`
2. Ollama service is running: `ssh root@64.225.20.65 "systemctl status ollama"`
3. Firewall allows port 11434: `ssh root@64.225.20.65 "ufw status"`

### Issue: Backend cannot connect

**Solution**:
1. Verify network connectivity from cluster to droplet
2. Check backend logs: `kubectl logs -n progrc-dev -l app=progrc-backend | grep -i ollama`
3. Test from backend pod: `kubectl exec -n progrc-dev deployment/progrc-backend -- curl http://64.225.20.65:11434/api/tags`

### Issue: Slow responses

**Solutions**:
1. Check AI Droplet resources: `ssh root@64.225.20.65 "htop"`
2. Consider upgrading droplet size if needed
3. Verify model is loaded: `curl http://64.225.20.65:11434/api/tags`

## Performance Optimization

### Current Droplet Specs
- **CPU**: 4 vCPU
- **RAM**: 8GB
- **Disk**: 160GB

### Recommended for Production
- **CPU**: 4-8 vCPU
- **RAM**: 8-16GB (for larger models if needed)
- **Disk**: 160GB+ (for multiple models)

### Upgrade Droplet (if needed)
```bash
# Via DigitalOcean CLI
doctl compute droplet resize 543191898 --size s-4vcpu-16gb-amd

# Or via DigitalOcean Dashboard
# Navigate to Droplet > Settings > Resize
```

## Cost Analysis

### Current Setup
- **Ollama**: $0 (self-hosted on AI Droplet)
- **AI Droplet**: ~$48/month (s-4vcpu-8gb)
- **Total**: ~$48/month (fixed cost)

### vs Cloud APIs
- **Gemini**: ~$0.03 per 1K tokens
- **OpenAI GPT-4**: ~$0.03 per 1K tokens
- **Estimated monthly**: $50-500+ depending on usage

**Savings**: Eliminates variable API costs, fixed monthly cost only

## Next Steps

1. ✅ **Install Models**: Run `./install-ollama-models.sh` or install manually
2. ✅ **Verify Installation**: Check models are available
3. ✅ **Test Functionality**: Run compliance assessment or document upload
4. ✅ **Monitor Usage**: Watch backend logs for Ollama usage
5. ✅ **Verify No API Calls**: Confirm no Gemini/Gradient/OpenAI usage

## Scripts Created

- `configure-ollama-ai-droplet.sh` - Full configuration script
- `install-ollama-models.sh` - Model installation script
- `switch-to-ai-droplet.sh` - Quick switch script

## Configuration Files Updated

- `k8s/base/configmap.yaml` - Added `OLLAMA_EMBEDDING_MODEL`

---

**Status**: ✅ Fully Configured (models need installation)  
**AI Droplet**: `64.225.20.65:11434`  
**Next Action**: Install models using `./install-ollama-models.sh`
