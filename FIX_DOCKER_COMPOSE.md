# Fix docker-compose.yml on VPS

## Manual Edit Required

On your VPS, edit `docker-compose.yml`:

```bash
cd /opt/progrc/bff-service-backend-dev
nano docker-compose.yml
```

### 1. Add extra_hosts to app service

Find this section (around line 45-46):
```yaml
    container_name: bff-app
    restart: unless-stopped
    environment:
```

Change to:
```yaml
    container_name: bff-app
    restart: unless-stopped
    extra_hosts:
      - "host.docker.internal:host-gateway"
    environment:
```

### 2. Update Ollama URL default

Find this (around line 102):
```yaml
      OLLAMA_BASE_URL: "http://ollama:11434"
```

Change to:
```yaml
      OLLAMA_BASE_URL: ${OLLAMA_BASE_URL:-http://host.docker.internal:11434}
```

### 3. Disable Gemini (optional but recommended)

Find this (around line 93):
```yaml
      USE_GEMINI: ${USE_GEMINI:-true}
```

Change to:
```yaml
      USE_GEMINI: ${USE_GEMINI:-false}
```

### 4. Save and Apply

```bash
# Save file (Ctrl+O, Enter, Ctrl+X in nano)

# Restart app
docker-compose up -d app

# Test connectivity
docker-compose exec app curl -s http://host.docker.internal:11434/api/tags

# Verify Ollama usage
docker-compose logs app | grep -i "Using Ollama"
```

Should see: "Using Ollama for AI processing (local, no API calls)"
