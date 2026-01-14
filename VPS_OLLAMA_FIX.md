# Fix Ollama Integration on VPS

## Issues to Fix

1. **Percentage scores not increasing** when sources are parsed
2. **Control statements not being generated**
3. **Ollama not being used** for compliance analysis

## Required Configuration

### 1. Verify .env Configuration

On VPS, check `.env` file has:

```bash
USE_OLLAMA=true
OLLAMA_BASE_URL=http://ollama:11434
OLLAMA_MODEL=llama3.2:1b
OLLAMA_EMBEDDING_MODEL=nomic-embed-text
USE_GEMINI=false
USE_GRADIENT=false
AWS_SQS_ENABLED=false
```

### 2. Verify Ollama Service is Running

```bash
docker-compose ps ollama
curl http://localhost:11435/api/tags
```

### 3. Verify Ollama Models are Installed

```bash
docker-compose exec ollama ollama list
# Should show: llama3.2:1b and nomic-embed-text
```

If missing, pull models:
```bash
docker-compose exec ollama ollama pull llama3.2:1b
docker-compose exec ollama ollama pull nomic-embed-text
```

### 4. Restart Backend to Load Configuration

```bash
docker-compose restart app
docker-compose logs -f app | grep -i ollama
```

## How It Works

1. **Source Processing**: When sources are uploaded, `LlmDocumentProcessorService` chunks documents and analyzes against controls using Ollama
2. **Chunk Mapping**: Creates `ControlChunkMapping` entries with `relevance_score` (0-100)
3. **Instant Scoring**: `calculateInstantScores` uses relevance scores to calculate `percentage_completion`
4. **Control Statements**: Full LLM processing generates `implementation_explanation` using Ollama

## Testing

1. Upload a source document
2. Wait for processing (check logs: `docker-compose logs -f app`)
3. Trigger compliance sync: `POST /api/v1/compliances/apps/{appId}/sync`
4. Check percentage_completion increases
5. Check implementation_explanation is generated

## Troubleshooting

**Ollama not responding:**
```bash
docker-compose logs ollama
docker-compose restart ollama
```

**No percentage updates:**
- Check `ControlChunkMapping` table has entries with `relevance_score > 0`
- Verify sources are processed: `docker-compose logs app | grep -i "chunk\|source"`

**No control statements:**
- Check LLM processing: `docker-compose logs app | grep -i "ollama\|llm"`
- Verify Ollama is available: Check logs for "Using Ollama for AI processing"
