# Ollama VPS Integration Verification

## Current Status

✅ **Ollama Service**: Running on VPS (systemd service active)
✅ **Model Available**: `llama3.2:1b` is installed and ready
✅ **Backend Configuration**: Environment variables set correctly
✅ **Network Configuration**: Docker container can reach host Ollama service

## Configuration Details

### Ollama Service (Host)
- **Status**: Active and running
- **Port**: 11434
- **Model**: llama3.2:1b
- **Access**: `http://localhost:11434` (from host) or `http://168.231.70.205:11434` (external)

### Backend Container Configuration
- **USE_OLLAMA**: `true`
- **OLLAMA_BASE_URL**: `http://host.docker.internal:11434`
- **OLLAMA_MODEL**: `llama3.2:1b`

### Network Setup
The Docker container uses `extra_hosts` to map `host.docker.internal` to the host gateway, allowing the container to reach services running on the host (like Ollama).

## Verification Steps

### 1. Check Ollama Service Status
```bash
ssh root@168.231.70.205
systemctl status ollama
curl http://localhost:11434/api/tags
```

### 2. Check Backend Container Environment
```bash
docker compose exec app printenv | grep OLLAMA
```

### 3. Test Connection from Container
```bash
docker compose exec app sh -c 'node -e "const http = require(\"http\"); http.get(\"http://host.docker.internal:11434/api/tags\", (res) => { let data = \"\"; res.on(\"data\", (chunk) => data += chunk); res.on(\"end\", () => console.log(JSON.parse(data).models[0]?.name)); });"'
```

### 4. Check Backend Logs
```bash
docker compose logs app | grep -i ollama
```

You should see:
```
Ollama service initialized: http://host.docker.internal:11434, model: llama3.2:1b
```

## Testing AI Features

### 1. Ask AI / ProGPT
- Navigate to the Ask AI feature in the platform
- Send a test message
- Check backend logs to confirm Ollama is being used

### 2. Template Variables
- Use AI-powered template variables
- Verify responses are generated using Ollama

### 3. Help Center AI
- Test the help center AI feature
- Confirm it uses Ollama for responses

## Troubleshooting

### Issue: Container Cannot Reach Ollama

**Symptoms**: Backend logs show "Ollama not available" warnings

**Solutions**:
1. Verify `extra_hosts` is in docker-compose.yml:
   ```yaml
   extra_hosts:
     - "host.docker.internal:host-gateway"
   ```

2. Check if Ollama is listening on all interfaces:
   ```bash
   netstat -tlnp | grep 11434
   # Should show: 0.0.0.0:11434
   ```

3. Test connection manually:
   ```bash
   docker compose exec app sh -c 'ping -c 2 host.docker.internal'
   ```

### Issue: Model Not Found

**Symptoms**: "Model not found" errors in logs

**Solution**: Pull the model on the VPS:
```bash
ssh root@168.231.70.205
ollama pull llama3.2:1b
```

### Issue: Slow Responses

**Solutions**:
1. Use a smaller/faster model (already using `llama3.2:1b`)
2. Increase timeout in OllamaService (currently 120 seconds)
3. Check VPS resources: `htop` or `docker stats`

### Issue: Fallback to OpenAI

**Symptoms**: Backend falls back to OpenAI even with Ollama enabled

**Check**:
1. Verify `USE_OLLAMA=true` in container:
   ```bash
   docker compose exec app printenv USE_OLLAMA
   ```

2. Check Ollama availability:
   ```bash
   docker compose exec app sh -c 'curl -s http://host.docker.internal:11434/api/tags'
   ```

3. Review backend logs for Ollama errors

## Performance Notes

- **Model**: `llama3.2:1b` is optimized for speed (1.2B parameters)
- **Response Time**: Typically 2-10 seconds depending on prompt complexity
- **Memory Usage**: ~400MB for Ollama service
- **Fallback**: Automatically falls back to OpenAI if Ollama fails

## Next Steps

1. ✅ Ollama is configured and accessible
2. ⏭️ Test AI features in the platform
3. ⏭️ Monitor performance and adjust model if needed
4. ⏭️ Consider adding more models for different use cases

## Model Recommendations

For GRC use cases, consider these models:

1. **llama3.2:1b** (Current) - Fast, good for simple queries
2. **llama3.2:3b** - Better quality, still fast
3. **mistral:7b** - Excellent reasoning, slower
4. **qwen2.5:7b** - Great for technical content

To add a model:
```bash
ssh root@168.231.70.205
ollama pull llama3.2:3b
# Then update OLLAMA_MODEL in docker-compose.yml
```

