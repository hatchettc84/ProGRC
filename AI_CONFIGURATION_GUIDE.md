# AI Configuration Guide for Compliance and Source Assessment

This guide explains how to configure AI services on the VPS for compliance analysis and source assessment.

## Overview

The ProGRC platform uses AI/LLM services to:
1. **Analyze source documents** against compliance controls (`LlmDocumentProcessorService`)
2. **Process assessment templates** with dynamic prompts (`PromptVariableProcessor`)
3. **Generate compliance recommendations** and evidence mapping

## AI Service Priority

The system uses the following priority order:
1. **Gemini** (Google) - Highest priority
2. **OpenAI** - Fallback if Gemini unavailable
3. **Ollama** - Local fallback if neither available

## Location of Prompts

### 1. Source Assessment Prompt (Hardcoded)

**File:** `src/sources/llmDocumentProcessor.service.ts`  
**Lines:** 447-472

This prompt analyzes source documents against compliance control families:

```typescript
const prompt = `You are a GRC (Governance, Risk, and Compliance) analyst. Analyze the following document chunk against the control family "${family.family_name}".

Control Family: ${family.family_name}
Controls in this family:
${controlsDescription}

Document Chunk:
${chunkText.substring(0, 2000)}...

For each control in the family, provide a JSON response with:
1. control_id: The control ID
2. family_name: "${family.family_name}"
3. relevance_score: A number from 0-100 indicating how relevant the chunk is to this control
4. evidence: A brief quote or summary of evidence found in the chunk (empty string if none)
5. is_mentioned: true if the control requirement is mentioned or implemented in the chunk, false otherwise

Return ONLY a valid JSON array of objects, one per control.`;
```

**System Message:** Line 477
```typescript
"You are a GRC analyst. Always respond with valid JSON arrays only."
```

### 2. Assessment Template Prompts (Database)

**Table:** `prompt_template_variables`  
**Entity:** `src/entities/promptTemplateVariable.entity.ts`  
**Service:** `src/prompt-variables/prompt-variable.service.ts`

These prompts are stored in the database and can be managed via:
- API: `/api/v1/prompt-variables`
- Database queries
- Frontend UI (if available)

## Configuration on VPS

### Current Configuration

The VPS uses environment variables in `docker-compose.yml`:

```yaml
# Gemini Configuration (highest priority)
USE_GEMINI: ${USE_GEMINI:-true}
GEMINI_API_KEY: ${GEMINI_API_KEY:-AIzaSyBbXF6oj-tnf9ofUy1u6Hex2i-Fr5xC69o}
GEMINI_MODEL: ${GEMINI_MODEL:-gemini-2.0-flash-exp}

# OpenAI Configuration (fallback)
OPENAI_API_KEY: ${OPENAI_API_KEY:-}

# Ollama Configuration (fallback)
USE_OLLAMA: ${USE_OLLAMA:-true}
OLLAMA_BASE_URL: ${OLLAMA_BASE_URL:-http://host.docker.internal:11434}
OLLAMA_MODEL: ${OLLAMA_MODEL:-llama3.2:1b}
```

### Option 1: Configure Gemini (Recommended)

1. **Get a Gemini API Key:**
   - Visit: https://makersuite.google.com/app/apikey
   - Create a new API key
   - Copy the key

2. **Update docker-compose.yml on VPS:**
```bash
ssh root@168.231.70.205
cd /root/bff-service-backend-dev
nano docker-compose.yml
```

3. **Update the environment variables:**
```yaml
USE_GEMINI: "true"
GEMINI_API_KEY: "your_actual_api_key_here"
GEMINI_MODEL: "gemini-2.0-flash-exp"
```

4. **Restart the application:**
```bash
docker compose up -d app
```

### Option 2: Configure OpenAI

1. **Get an OpenAI API Key:**
   - Visit: https://platform.openai.com/api-keys
   - Create a new secret key
   - Copy the key

2. **Update docker-compose.yml:**
```yaml
USE_GEMINI: "false"
OPENAI_API_KEY: "sk-your-openai-key-here"
```

3. **Restart:**
```bash
docker compose up -d app
```

### Option 3: Configure Ollama (Local)

**Note:** Ollama needs to be running as a Docker service or accessible from the app container.

1. **Add Ollama service to docker-compose.yml** (if not present):
```yaml
  ollama:
    image: ollama/ollama:latest
    container_name: bff-ollama
    restart: unless-stopped
    volumes:
      - ollama_data:/root/.ollama
    ports:
      - "11434:11434"
    networks:
      - bff-network
```

2. **Update Ollama configuration:**
```yaml
USE_OLLAMA: "true"
OLLAMA_BASE_URL: "http://ollama:11434"  # Use service name, not host.docker.internal
OLLAMA_MODEL: "llama3.2:1b"
```

3. **Pull the model:**
```bash
docker compose exec ollama ollama pull llama3.2:1b
```

4. **Restart:**
```bash
docker compose up -d
```

## Verifying Configuration

### Check Which Service is Active

```bash
# SSH into VPS
ssh root@168.231.70.205

# Check environment variables
cd /root/bff-service-backend-dev
docker compose exec app env | grep -E "USE_GEMINI|USE_OLLAMA|OPENAI_API_KEY|GEMINI_API_KEY"

# Check application logs for AI service selection
docker compose logs app | grep -i "gemini\|openai\|ollama" | tail -20
```

### Test AI Service Availability

The system automatically checks availability in this order:
1. Gemini - calls `geminiService.isAvailable()`
2. OpenAI - checks if `OPENAI_API_KEY` is set
3. Ollama - calls `ollamaService.isAvailable()`

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

## Modifying Prompts

### Modify Source Assessment Prompt

1. **Edit the file:**
```bash
ssh root@168.231.70.205
cd /root/bff-service-backend-dev
nano src/sources/llmDocumentProcessor.service.ts
```

2. **Find the prompt around line 447 and modify**

3. **Rebuild and restart:**
```bash
docker compose build --no-cache app
docker compose up -d app
```

### Modify Assessment Template Prompts

**Via API:**
```bash
curl -X GET "http://168.231.70.205/api/v1/prompt-variables" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Via Database:**
```bash
docker compose exec postgres psql -U progrc -d progrc_bff -c "UPDATE prompt_template_variables SET prompt = 'Your new prompt here' WHERE variable_name = 'prompt_variable_name';"
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
curl http://localhost:11434/api/tags
```

### Prompt Not Returning Expected Results

1. **Check prompt format** - Ensure JSON structure is correct
2. **Check temperature settings** - Lower temperature (0.3) for more consistent results
3. **Check max_tokens** - Ensure enough tokens for complete responses
4. **Review logs:**
```bash
docker compose logs app | grep -i "prompt\|llm\|ai" | tail -50
```

## Best Practices

1. **Use Gemini for production** - Best performance and cost
2. **Keep prompts specific** - Include clear instructions and examples
3. **Monitor token usage** - Set appropriate `max_tokens` limits
4. **Test prompts** - Use the test endpoint before deploying
5. **Version control prompts** - Store important prompts in database for easy rollback

## Environment Variables Reference

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `USE_GEMINI` | Enable Gemini service | `false` | No |
| `GEMINI_API_KEY` | Gemini API key | - | Yes (if USE_GEMINI=true) |
| `GEMINI_MODEL` | Gemini model name | `gemini-2.0-flash-exp` | No |
| `OPENAI_API_KEY` | OpenAI API key | - | Yes (if using OpenAI) |
| `USE_OLLAMA` | Enable Ollama service | `false` | No |
| `OLLAMA_BASE_URL` | Ollama server URL | `http://localhost:11434` | Yes (if USE_OLLAMA=true) |
| `OLLAMA_MODEL` | Ollama model name | `llama3.2` | No |

## Quick Setup Commands

### Setup Gemini
```bash
# On VPS
cd /root/bff-service-backend-dev
# Edit docker-compose.yml and set:
# USE_GEMINI: "true"
# GEMINI_API_KEY: "your-key"
docker compose up -d app
```

### Setup OpenAI
```bash
# On VPS
cd /root/bff-service-backend-dev
# Edit docker-compose.yml and set:
# USE_GEMINI: "false"
# OPENAI_API_KEY: "sk-your-key"
docker compose up -d app
```

### Setup Ollama
```bash
# On VPS
cd /root/bff-service-backend-dev
# Add ollama service to docker-compose.yml
# Edit environment:
# USE_OLLAMA: "true"
# OLLAMA_BASE_URL: "http://ollama:11434"
docker compose up -d
docker compose exec ollama ollama pull llama3.2:1b
```




