# Ollama VPS Integration Guide

This guide explains how to integrate Ollama running on your VPS (168.231.70.205) with the ProGRC platform.

## Overview

Ollama provides local AI capabilities, eliminating the need for OpenAI API calls and reducing costs. The ProGRC platform now supports Ollama with automatic fallback to OpenAI if Ollama is unavailable.

## VPS Information

- **IP Address**: 168.231.70.205
- **SSH Access**: `ssh root@168.231.70.205`
- **Ollama Port**: 11434 (default)

## Prerequisites

1. Ollama installed and running on VPS
2. Ollama accessible from your application server
3. At least one model downloaded (e.g., `llama3.2`, `mistral`, `qwen2.5`)

## Step 1: Verify Ollama on VPS

SSH into your VPS and verify Ollama is running:

```bash
ssh root@168.231.70.205

# Check if Ollama is running
curl http://localhost:11434/api/tags

# Check available models
ollama list

# If no models, pull one:
ollama pull llama3.2
```

## Step 2: Configure Firewall

Ensure port 11434 is accessible from your application server:

```bash
# On VPS
ufw allow 11434/tcp
ufw status
```

## Step 3: Test Ollama Connection

From your application server (or local machine), test the connection:

```bash
# Test if Ollama is accessible
curl http://168.231.70.205:11434/api/tags

# Test a simple generation
curl http://168.231.70.205:11434/api/generate -d '{
  "model": "llama3.2",
  "prompt": "What is GRC?",
  "stream": false
}'
```

## Step 4: Configure ProGRC Application

### Option A: Environment Variables (Recommended)

Add to your `.env` file:

```bash
# Ollama Configuration
USE_OLLAMA=true
OLLAMA_BASE_URL=http://168.231.70.205:11434
OLLAMA_MODEL=llama3.2
```

### Option B: Docker Compose

If using Docker Compose, the environment variables are already configured in `docker-compose.yml`:

```yaml
USE_OLLAMA: ${USE_OLLAMA:-false}
OLLAMA_BASE_URL: ${OLLAMA_BASE_URL:-http://168.231.70.205:11434}
OLLAMA_MODEL: ${OLLAMA_MODEL:-llama3.2}
```

Update your `.env` file with:

```bash
USE_OLLAMA=true
OLLAMA_BASE_URL=http://168.231.70.205:11434
OLLAMA_MODEL=llama3.2
```

## Step 5: Recommended Models for GRC

For Governance, Risk, and Compliance use cases, these models work well:

### 1. Llama 3.2 (Recommended for Speed)
```bash
ollama pull llama3.2
```
- **Size**: ~2GB
- **Speed**: Fast
- **Quality**: Good for general GRC tasks

### 2. Mistral 7B (Recommended for Quality)
```bash
ollama pull mistral
```
- **Size**: ~4GB
- **Speed**: Medium
- **Quality**: Excellent reasoning

### 3. Qwen2.5 7B (Recommended for Technical Content)
```bash
ollama pull qwen2.5:7b
```
- **Size**: ~4.5GB
- **Speed**: Medium
- **Quality**: Great for technical documentation

### 4. CodeLlama (For Code Generation)
```bash
ollama pull codellama
```
- **Size**: ~3.8GB
- **Speed**: Medium
- **Quality**: Best for code-related tasks

## Step 6: Verify Integration

After starting your application, check the logs:

```bash
# Check application logs
docker-compose logs app | grep -i ollama

# You should see:
# Ollama service initialized: http://168.231.70.205:11434, model: llama3.2
```

## Step 7: Test AI Features

1. **ProGPT Chat**: Navigate to the ProGPT feature and send a message
2. **Template Variables**: Use AI-powered template variables
3. **Help Center**: Test the AI help center feature

All should use Ollama if configured correctly.

## Fallback Behavior

The system automatically falls back to OpenAI if:
- Ollama is not enabled (`USE_OLLAMA=false`)
- Ollama server is unreachable
- Ollama request fails

This ensures the platform continues working even if Ollama is down.

## Troubleshooting

### Issue: "Ollama not available"

**Solution**: Check connectivity:
```bash
# From application server
curl http://168.231.70.205:11434/api/tags

# If connection refused, check:
# 1. Ollama is running on VPS
# 2. Firewall allows port 11434
# 3. OLLAMA_BASE_URL is correct
```

### Issue: "Model not found"

**Solution**: Pull the model on VPS:
```bash
ssh root@168.231.70.205
ollama pull llama3.2
```

### Issue: Slow responses

**Solutions**:
1. Use a smaller model (llama3.2 instead of mistral)
2. Increase VPS resources (RAM, CPU)
3. Consider using GPU acceleration

### Issue: Connection timeout

**Solutions**:
1. Check network connectivity between servers
2. Verify firewall rules
3. Check if Ollama is running: `systemctl status ollama` (if using systemd)

## Performance Optimization

### 1. Use GPU (if available)

If your VPS has a GPU, Ollama can use it for faster inference:

```bash
# Check GPU availability
nvidia-smi

# Ollama will automatically use GPU if available
```

### 2. Adjust Model Size

For faster responses, use smaller models:
- `llama3.2` (2GB) - Fastest
- `mistral:7b` (4GB) - Balanced
- `qwen2.5:7b` (4.5GB) - Best quality

### 3. Monitor Resources

```bash
# On VPS, monitor Ollama resource usage
htop
# or
docker stats ollama  # if using Docker
```

## Security Considerations

1. **Network Security**: Consider using a VPN or private network between servers
2. **Firewall**: Only allow port 11434 from your application server IP
3. **Authentication**: Ollama doesn't have built-in auth; use network-level security

## Cost Savings

Using Ollama instead of OpenAI:
- **OpenAI GPT-4**: ~$0.03 per 1K tokens
- **Ollama**: $0 (self-hosted)
- **Estimated Monthly Savings**: $50-500+ depending on usage

## Next Steps

1. ✅ Verify Ollama is running on VPS
2. ✅ Configure environment variables
3. ✅ Test AI features
4. ✅ Monitor performance
5. ✅ Consider adding more models for different use cases

## Support

If you encounter issues:
1. Check application logs: `docker-compose logs app`
2. Check Ollama logs on VPS: `journalctl -u ollama` (if using systemd)
3. Verify network connectivity between servers
4. Test Ollama directly: `curl http://168.231.70.205:11434/api/tags`

---

**Last Updated**: January 2025
**VPS IP**: 168.231.70.205

