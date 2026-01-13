# Gradient AI Platform Setup Guide

## Overview

The ProGRC platform has been configured to use DigitalOcean's Gradient AI Platform as a managed LLM service. This replaces the standalone Ollama droplet setup.

## LLM Service Priority

The system now uses LLM services in this priority order:
1. **Gemini** (Google) - Highest priority
2. **Gradient AI** (DigitalOcean) - Second priority
3. **OpenAI** - Fallback if neither available
4. **Ollama** - Local fallback (kept for backward compatibility)

## Configuration

### Kubernetes ConfigMap

The ConfigMap (`k8s/base/configmap.yaml`) has been updated with:

```yaml
USE_GRADIENT: "true"
GRADIENT_API_URL: "https://api.gradient.ai/v1"
GRADIENT_MODEL: "llama-3.1-70b-instruct"
```

### Required Secret

You need to add the Gradient AI API key to your Kubernetes secrets:

```bash
# Create or update the secret
kubectl create secret generic progrc-bff-secrets \
  --from-literal=GRADIENT_API_KEY='your-gradient-api-key-here' \
  --namespace=progrc-dev \
  --dry-run=client -o yaml | kubectl apply -f -
```

Or add it to your existing secret:

```bash
kubectl edit secret progrc-bff-secrets -n progrc-dev
```

Add:
```yaml
data:
  GRADIENT_API_KEY: <base64-encoded-api-key>
```

## Getting Your Gradient AI API Key

1. Log in to your DigitalOcean account
2. Navigate to **Gradient AI Platform**
3. Go to **API Keys** section
4. Create a new API key
5. Copy the key and add it to Kubernetes secrets

## API Endpoint

The default API endpoint is: `https://api.gradient.ai/v1`

If your Gradient AI Platform uses a different endpoint, update the `GRADIENT_API_URL` in the ConfigMap.

## Models

The default model is `llama-3.1-70b-instruct`. You can change this by updating `GRADIENT_MODEL` in the ConfigMap.

Available models depend on your Gradient AI Platform subscription. Check the Gradient AI documentation for available models.

## Verification

After setting up the API key, verify the service is working:

1. Check backend logs for "Gradient AI service initialized"
2. Check logs for "Using Gradient AI for AI processing" when LLM features are used
3. Test AI features in the application (e.g., Ask AI, document analysis)

## Troubleshooting

### Service Not Available

If Gradient AI is not being used:
1. Verify `GRADIENT_API_KEY` is set in Kubernetes secrets
2. Check that `USE_GRADIENT` is set to `"true"` in ConfigMap
3. Verify the API key is valid by checking backend logs
4. Ensure the API endpoint is correct

### API Errors

If you see API errors:
1. Check the API key is valid and has proper permissions
2. Verify the model name is correct for your subscription
3. Check network connectivity from Kubernetes cluster to Gradient AI API
4. Review backend logs for detailed error messages

## Migration from Ollama

The Ollama droplet can now be deleted:
- See `DELETE_AI_DROPLET.md` for instructions
- Ollama service is still available as a fallback but will not be used if Gradient is configured

## Next Steps

1. ✅ Delete the AI droplet (see `DELETE_AI_DROPLET.md`)
2. ✅ Add `GRADIENT_API_KEY` to Kubernetes secrets
3. ✅ Restart backend pods to pick up new configuration
4. ✅ Verify Gradient AI is being used in logs


