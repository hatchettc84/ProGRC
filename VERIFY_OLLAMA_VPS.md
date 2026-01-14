# Verify Ollama on VPS

## Check Ollama Usage

```bash
cd /opt/progrc/bff-service-backend-dev

# Check all Ollama-related logs
docker-compose logs app | grep -i ollama

# Check AI service initialization
docker-compose logs app | grep -i "AI\|LLM\|service initialized"

# Test Ollama from app container (using node instead of curl)
docker-compose exec app node -e "const http = require('http'); http.get('http://host.docker.internal:11434/api/tags', (res) => { let data = ''; res.on('data', (chunk) => data += chunk); res.on('end', () => console.log(data)); }).on('error', (e) => console.error('Error:', e.message));"
```

## Verify Configuration

```bash
# Check .env
grep -E "OLLAMA|USE_GEMINI|USE_GRADIENT" .env

# Check docker-compose environment
docker-compose exec app env | grep -i ollama
```

## Expected Output

If working, you should see:
- "Ollama service initialized"
- "Using Ollama for AI processing"
- JSON response from Ollama API test

## If Not Working

1. Check Ollama is running on host: `curl http://localhost:11434/api/tags`
2. Verify extra_hosts in docker-compose.yml
3. Restart app: `docker-compose restart app`
4. Check logs: `docker-compose logs app | tail -50`
