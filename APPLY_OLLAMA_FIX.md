# Apply Ollama Fix on VPS

## Quick Fix Commands

Run these on your VPS:

```bash
cd /opt/progrc/bff-service-backend-dev

# 1. Pull latest docker-compose.yml (or manually add extra_hosts)
git pull origin main

# 2. Update .env to ensure correct settings
nano .env
```

Ensure `.env` has:
```
USE_OLLAMA=true
OLLAMA_BASE_URL=http://host.docker.internal:11434
USE_GEMINI=false
USE_GRADIENT=false
OLLAMA_MODEL=llama3.2:1b
OLLAMA_EMBEDDING_MODEL=nomic-embed-text
```

```bash
# 3. Restart app with new config
docker-compose up -d app

# 4. Test Ollama connectivity from app container
docker-compose exec app curl -s http://host.docker.internal:11434/api/tags

# 5. Verify Ollama is being used
docker-compose logs app | grep -i "Using Ollama"
```

Should see: "Using Ollama for AI processing (local, no API calls)"

## What This Fixes

- **extra_hosts**: Allows app container to reach host Ollama
- **OLLAMA_BASE_URL**: Points to host.docker.internal (host machine)
- **USE_GEMINI=false**: Ensures Ollama is prioritized
- **Percentage scoring**: Will work when sources are processed
- **Control statements**: Will be generated via Ollama
