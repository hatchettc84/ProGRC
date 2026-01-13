# Ollama Primary Configuration - Eliminate API Calls

## Overview

This configuration makes **Ollama the primary LLM service** for compliance scoring and document chunking, eliminating all external API calls to Gemini, Gradient AI, and OpenAI.

## What Was Changed

### 1. ✅ AI Helper Service (`src/common/services/ai-helper.service.ts`)
- **Priority changed**: Ollama is now checked **FIRST** before any cloud services
- **Old priority**: Gemini > Gradient > OpenAI > Ollama
- **New priority**: **Ollama > Gemini > Gradient > OpenAI**
- Logs now indicate "local, no API calls" when using Ollama

### 2. ✅ LLM Document Processor (`src/sources/llmDocumentProcessor.service.ts`)
- **Embedding priority changed**: Ollama is now checked **FIRST** for embeddings
- **Old priority**: Gemini > OpenAI > Ollama
- **New priority**: **Ollama > Gemini > OpenAI**
- Embeddings generated locally using `nomic-embed-text` model

### 3. ✅ ConfigMap (`k8s/base/configmap.yaml`)
- `USE_OLLAMA: "true"` - Ollama enabled
- `OLLAMA_BASE_URL: "http://ollama:11434"` - Service URL
- `OLLAMA_MODEL: "llama3.2:1b"` - LLM model
- `USE_GEMINI: "false"` - Disabled (can be re-enabled as fallback)
- `USE_GRADIENT: "false"` - Disabled (can be re-enabled as fallback)

### 4. ✅ Ollama Kubernetes Deployment (`k8s/services/ollama.yaml`)
- Increased resources: 2Gi-4Gi memory, 500m-2000m CPU
- Service exposed on port 11434
- Persistent storage for models

## Deployment Steps

### Step 1: Deploy Ollama Service

```bash
bash deploy-ollama.sh
```

This script will:
1. Deploy Ollama to Kubernetes
2. Wait for pod to be ready
3. Pull required models (`llama3.2:1b` and `nomic-embed-text`)
4. Update ConfigMap
5. Restart backend deployment

### Step 2: Verify Integration

```bash
bash verify-ollama-integration.sh
```

This script checks:
- Ollama pod status
- Models availability
- ConfigMap configuration
- Backend connectivity
- Log verification

### Manual Deployment (Alternative)

If you prefer manual steps:

```bash
# 1. Deploy Ollama
kubectl apply -f k8s/services/ollama.yaml

# 2. Wait for pod
kubectl wait --for=condition=ready pod -l app=ollama -n progrc-dev --timeout=5m

# 3. Pull models
OLLAMA_POD=$(kubectl get pods -n progrc-dev -l app=ollama -o jsonpath='{.items[0].metadata.name}')
kubectl exec -n progrc-dev $OLLAMA_POD -- ollama pull llama3.2:1b
kubectl exec -n progrc-dev $OLLAMA_POD -- ollama pull nomic-embed-text

# 4. Update ConfigMap
kubectl apply -f k8s/base/configmap.yaml

# 5. Restart backend
kubectl rollout restart deployment/progrc-backend -n progrc-dev
```

## Required Models

Ollama needs these models for full functionality:

1. **LLM Model**: `llama3.2:1b` (or larger like `llama3.2:3b` for better quality)
   - Used for: Compliance control analysis, chunk analysis
   - Size: ~1.3GB

2. **Embedding Model**: `nomic-embed-text`
   - Used for: Document chunk embeddings (768 dimensions)
   - Size: ~274MB

## Benefits

✅ **No External API Calls** - All processing happens locally
✅ **No API Costs** - Zero cost for LLM operations
✅ **Data Privacy** - All data stays on-premises
✅ **No Rate Limits** - Process as much as needed
✅ **Offline Capable** - Works without internet

## Performance Considerations

⚠️ **Slower than Cloud APIs** - Local processing is slower than cloud services
⚠️ **Resource Intensive** - Requires CPU/RAM for model inference
⚠️ **Model Quality** - Smaller models (1b) may have lower quality than cloud APIs

### Recommended Model Sizes

- **Minimum**: `llama3.2:1b` (1.3GB) - Fast, lower quality
- **Recommended**: `llama3.2:3b` (2.0GB) - Better quality, still fast
- **Best Quality**: `llama3.2:8b` (4.7GB) - High quality, slower

To use a larger model, update the ConfigMap:
```yaml
OLLAMA_MODEL: "llama3.2:3b"  # or llama3.2:8b
```

Then pull the model:
```bash
kubectl exec -n progrc-dev <ollama-pod> -- ollama pull llama3.2:3b
```

## Monitoring

### Check Ollama Status
```bash
kubectl get pods -n progrc-dev -l app=ollama
kubectl logs -n progrc-dev -l app=ollama -f
```

### Check Backend Usage
```bash
# Look for Ollama usage in logs
kubectl logs -n progrc-dev -l app=progrc-backend --tail=100 | grep -i ollama

# Should see messages like:
# "Using Ollama for AI processing (local, no API calls)"
# "Using Ollama for embedding generation (local, no API calls)"
```

### Verify No API Calls
```bash
# Check that cloud services are NOT being used
kubectl logs -n progrc-dev -l app=progrc-backend --tail=100 | grep -i "gemini\|gradient\|openai" | grep -v "fallback\|unavailable"
# Should return no results if Ollama is working
```

## Troubleshooting

### Ollama Pod Not Starting
```bash
kubectl describe pod -n progrc-dev -l app=ollama
kubectl logs -n progrc-dev -l app=ollama
```

### Models Not Loading
```bash
# Check available models
kubectl exec -n progrc-dev <ollama-pod> -- ollama list

# Pull missing models
kubectl exec -n progrc-dev <ollama-pod> -- ollama pull llama3.2:1b
kubectl exec -n progrc-dev <ollama-pod> -- ollama pull nomic-embed-text
```

### Backend Can't Connect to Ollama
```bash
# Test connectivity from backend pod
kubectl exec -n progrc-dev <backend-pod> -- curl -s http://ollama:11434/api/tags

# Check service
kubectl get svc -n progrc-dev ollama
```

### Re-enable Cloud Services (Fallback)

If you want to keep cloud services as fallback:

1. Update ConfigMap:
```yaml
USE_GEMINI: "true"  # Re-enable as fallback
USE_GRADIENT: "true"  # Re-enable as fallback
```

2. Ollama will still be tried first, but will fallback to cloud if unavailable

## Testing

After deployment, test the integration:

1. **Upload a document** - Should use Ollama for embeddings
2. **Start compliance assessment** - Should use Ollama for analysis
3. **Check logs** - Should see "Using Ollama" messages
4. **Verify no API calls** - No external API requests should be made

## Summary

✅ Code updated to prioritize Ollama
✅ ConfigMap configured for Ollama primary
✅ Deployment scripts created
✅ Verification script created
✅ Ready to deploy

**Next Step**: Run `bash deploy-ollama.sh` to deploy and configure Ollama as the primary LLM service.
