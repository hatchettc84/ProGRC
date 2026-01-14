# Fix Ollama Configuration on VPS

## Issue Found

1. **Ollama not in Docker Compose**: `docker-compose ps ollama` shows "no such service"
2. **Ollama running externally**: `curl http://localhost:11435/api/tags` works (external Ollama)
3. **Wrong .env URL**: Currently `OLLAMA_BASE_URL=http://168.231.70.205:11434` but backend tries `http://ollama:11434`

## Solution

### Option 1: Use External Ollama (Recommended if already running)

Update `.env` to point to external Ollama:

```bash
cd /opt/progrc/bff-service-backend-dev
nano .env
```

Change:
```
OLLAMA_BASE_URL=http://localhost:11435
```

Or if Ollama is on different host:
```
OLLAMA_BASE_URL=http://168.231.70.205:11435
```

Then restart:
```bash
docker-compose restart app
```

### Option 2: Add Ollama to Docker Compose

If you want Ollama in Docker, add to `docker-compose.yml`:

```yaml
  ollama:
    image: ollama/ollama:latest
    container_name: bff-ollama
    restart: unless-stopped
    volumes:
      - ollama_data:/root/.ollama
    ports:
      - "11435:11434"
    networks:
      - bff-network
```

Add to volumes section:
```yaml
  ollama_data:
    driver: local
```

Then:
```bash
docker-compose up -d ollama
docker-compose exec ollama ollama pull llama3.2:1b
docker-compose exec ollama ollama pull nomic-embed-text
```

Update `.env`:
```
OLLAMA_BASE_URL=http://ollama:11434
```

## Verify Fix

```bash
# Check Ollama accessible
curl http://localhost:11435/api/tags

# Restart app
docker-compose restart app

# Check logs
docker-compose logs app | grep -i "ollama\|Using Ollama"
```

Should see: "Using Ollama for AI processing (local, no API calls)"
