# VPS AI Configuration Summary

## ✅ Configuration Complete

The AI components for compliance and source assessment have been successfully configured on the VPS.

## Current Configuration

### AI Services Status

1. **Gemini** (Primary)
   - Status: ✅ Enabled
   - API Key: Configured (default key in docker-compose.yml)
   - Model: `gemini-2.0-flash-exp`
   - Priority: Highest

2. **OpenAI** (Fallback)
   - Status: ⚠️ Not configured (no API key)
   - Priority: Medium

3. **Ollama** (Local Fallback)
   - Status: ✅ Enabled and Running
   - Container: `bff-ollama`
   - URL: `http://ollama:11434` (internal Docker network)
   - Model: `llama3.2:1b` (downloaded)
   - Host Port: `11435:11434` (to avoid conflict with existing Ollama on host)
   - Priority: Lowest

### Service Priority Order

The system will use AI services in this order:
1. **Gemini** → If available and API key valid
2. **OpenAI** → If Gemini unavailable and API key set
3. **Ollama** → If neither Gemini nor OpenAI available

## Prompt Locations

### 1. Source Assessment Prompt (Hardcoded)

**File:** `src/sources/llmDocumentProcessor.service.ts`  
**Lines:** 447-472

This prompt analyzes source documents against compliance control families. It's hardcoded in the service and can be modified by editing the file and rebuilding.

**Key Components:**
- System message: "You are a GRC analyst. Always respond with valid JSON arrays only."
- User prompt: Analyzes document chunks against control families
- Returns: JSON array with `control_id`, `relevance_score`, `evidence`, `is_mentioned`

### 2. Assessment Template Prompts (Database)

**Table:** `prompt_template_variables`  
**Service:** `PromptVariableService`

These prompts are stored in the database and can be managed via:
- API: `/api/v1/prompt-variables`
- Database queries
- Frontend UI (if available)

## Docker Services

### Running Services

```bash
# Check all services
docker compose ps

# Check Ollama specifically
docker compose ps ollama

# Check app logs for AI service selection
docker compose logs app | grep -i "using.*for LLM"
```

### Service URLs

- **App:** `http://168.231.70.205:3001`
- **Ollama (Host):** `http://168.231.70.205:11435`
- **Ollama (Internal):** `http://ollama:11434` (from app container)

## Verification Commands

### Check AI Service Configuration

```bash
# SSH into VPS
ssh root@168.231.70.205
cd /root/bff-service-backend-dev

# Check environment variables
docker compose exec app env | grep -E "USE_GEMINI|USE_OLLAMA|GEMINI_API_KEY|OLLAMA_BASE_URL"

# Check which service is being used
docker compose logs app | grep -i "using.*for LLM processing"

# Test Ollama connection
docker compose exec app curl http://ollama:11434/api/tags
```

### View Source Assessment Prompt

```bash
# View the hardcoded prompt
docker compose exec app cat /home/node/bff-service-backend/src/sources/llmDocumentProcessor.service.ts | grep -A 30 "const prompt ="
```

### View Assessment Template Prompts

```bash
# Query database for stored prompts
docker compose exec postgres psql -U progrc -d progrc_bff -c "SELECT variable_name, display_name, prompt FROM prompt_template_variables WHERE is_active = true LIMIT 10;"
```

## Configuration Files

### docker-compose.yml

**Location:** `/root/bff-service-backend-dev/docker-compose.yml`

**Key Environment Variables:**
```yaml
USE_GEMINI: ${USE_GEMINI:-true}
GEMINI_API_KEY: ${GEMINI_API_KEY:-AIzaSyBbXF6oj-tnf9ofUy1u6Hex2i-Fr5xC69o}
GEMINI_MODEL: ${GEMINI_MODEL:-gemini-2.0-flash-exp}

OPENAI_API_KEY: ${OPENAI_API_KEY:-}

USE_OLLAMA: ${USE_OLLAMA:-true}
OLLAMA_BASE_URL: "http://ollama:11434"
OLLAMA_MODEL: ${OLLAMA_MODEL:-llama3.2:1b}
```

## Next Steps

### To Use a Different Gemini API Key

1. Edit `docker-compose.yml` on VPS:
```bash
ssh root@168.231.70.205
cd /root/bff-service-backend-dev
nano docker-compose.yml
```

2. Update `GEMINI_API_KEY` with your key

3. Restart:
```bash
docker compose up -d app
```

### To Configure OpenAI

1. Get API key from https://platform.openai.com/api-keys

2. Update `docker-compose.yml`:
```yaml
USE_GEMINI: "false"
OPENAI_API_KEY: "sk-your-key-here"
```

3. Restart:
```bash
docker compose up -d app
```

### To Modify Source Assessment Prompt

1. Edit the file:
```bash
ssh root@168.231.70.205
cd /root/bff-service-backend-dev
nano src/sources/llmDocumentProcessor.service.ts
```

2. Find prompt around line 447 and modify

3. Rebuild and restart:
```bash
docker compose build --no-cache app
docker compose up -d app
```

## Troubleshooting

### AI Service Not Working

1. **Check service availability:**
```bash
docker compose logs app | grep -i "using.*for LLM processing"
```

2. **Check API keys:**
```bash
docker compose exec app env | grep API_KEY
```

3. **Test Ollama connection:**
```bash
docker compose exec app curl http://ollama:11434/api/tags
```

### Ollama Not Responding

1. **Check Ollama container:**
```bash
docker compose ps ollama
docker compose logs ollama | tail -20
```

2. **Restart Ollama:**
```bash
docker compose restart ollama
```

3. **Verify model is downloaded:**
```bash
docker compose exec ollama ollama list
```

## Documentation

Full configuration guide available at:
- **Local:** `AI_CONFIGURATION_GUIDE.md`
- **VPS:** `/root/bff-service-backend-dev/AI_CONFIGURATION_GUIDE.md`

## Summary

✅ **Gemini** - Configured and enabled (primary)  
✅ **Ollama** - Running in Docker, model downloaded  
⚠️ **OpenAI** - Not configured (optional fallback)  
✅ **Source Prompts** - Located in `llmDocumentProcessor.service.ts`  
✅ **Assessment Prompts** - Stored in database table `prompt_template_variables`

The system is ready to use AI for compliance analysis and source assessment!




