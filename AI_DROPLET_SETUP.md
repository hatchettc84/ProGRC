# ProGRC AI Droplet Setup

## ✅ Droplet Created

**Droplet Details:**
- **Name:** `progrc-ai-droplet`
- **ID:** `543191898`
- **IP Address:** `64.225.20.65`
- **Region:** `nyc3`
- **Size:** `s-4vcpu-8gb` (4 vCPU, 8GB RAM, 160GB Disk)
- **Image:** Ubuntu 22.04

## 🤖 Ollama Configuration

Ollama has been automatically installed and configured with:

1. **Service:** Running on port `11434`, accessible from all interfaces
2. **Models Installed:**
   - `llama3.2:1b` - For text generation and analysis
   - `nomic-embed-text` - For embedding generation (768 dimensions)

3. **Firewall:** Port 11434 is open for external access

## 🔧 Kubernetes Integration

The backend has been configured to use the external Ollama instance:

- **OLLAMA_BASE_URL:** `http://64.225.20.65:11434`
- **OLLAMA_MODEL:** `llama3.2:1b`
- **ConfigMap Updated:** `k8s/base/configmap.yaml`
- **Backend Restarted:** Deployment restarted to pick up new configuration

## 📋 Service Priority

The platform uses AI services in this order:
1. **Gemini** (Primary) - If API key is configured
2. **OpenAI** (Fallback) - If Gemini unavailable
3. **Ollama** (Local) - External droplet at `64.225.20.65:11434`

## 🔍 Verification

To verify Ollama is working:

```bash
# Check if Ollama is accessible
curl http://64.225.20.65:11434/api/tags

# List available models
curl http://64.225.20.65:11434/api/tags | jq '.models[].name'

# Test from Kubernetes pod
kubectl exec -n progrc-dev deployment/progrc-backend -- curl -s http://64.225.20.65:11434/api/tags
```

## 🚀 Next Steps

1. **Verify Setup:** Wait 2-3 minutes for Ollama to finish downloading models, then test connectivity
2. **Monitor Usage:** Check backend logs to see if Ollama is being used
3. **Scale if Needed:** If you need more performance, you can:
   - Upgrade to `s-4vcpu-16gb-amd` (16GB RAM) for larger models
   - Download additional models: `ollama pull llama3.2:3b` or `ollama pull mistral`
   - Add more droplets for load balancing

## 📊 Resource Usage

Current droplet specs:
- **CPU:** 4 vCPU
- **RAM:** 8GB (sufficient for llama3.2:1b and nomic-embed-text)
- **Disk:** 160GB (models take ~1-2GB each)

## 🔐 Security Notes

- Ollama is exposed on the public IP (required for K8s cluster access)
- Consider setting up a firewall rule to only allow access from your K8s cluster IPs
- The droplet is in the same region (nyc3) as your K8s cluster for low latency

## 🛠️ Management Commands

```bash
# SSH into droplet (requires SSH key setup)
ssh root@64.225.20.65

# Check Ollama status
systemctl status ollama

# View Ollama logs
journalctl -u ollama -f

# List models
ollama list

# Pull additional models
ollama pull <model-name>

# Restart Ollama
systemctl restart ollama
```


