# Fix Compliance Scoring & Control Statements on VPS

## Requirements

1. **Percentage scores increase** when sources are parsed
2. **Control statements generated** via Ollama
3. **Ollama integration working** properly

## Implementation Flow

### Step 1: Source Processing (Creates Chunks)
- Upload source → `LlmDocumentProcessorService.processDocument()`
- Chunks document → Creates `SourceChunkMapping`
- Analyzes chunks against controls → Creates `ControlChunkMapping` with `relevance_score`
- Uses Ollama for chunk analysis

### Step 2: Instant Scoring (Uses Chunk Data)
- Trigger sync → `POST /api/v1/compliances/apps/{appId}/sync`
- `calculateInstantScores()` reads `ControlChunkMapping.reference_data.relevance_score`
- Calculates `percentage_completion = average(relevance_scores)`
- Updates `ApplicationControlMapping.percentage_completion`

### Step 3: Control Statements (LLM Generation)
- Background queue processes controls
- `processStandardControls()` uses Ollama to generate:
  - `implementation_explanation` (control statement)
  - Refined `percentage_completion`
- Updates `ApplicationControlMapping` with statements

## VPS Configuration Checklist

### 1. Verify .env Settings
```bash
cd /opt/progrc/bff-service-backend-dev
grep -E "OLLAMA|USE_GEMINI|USE_GRADIENT" .env
```

Should show:
```
USE_OLLAMA=true
OLLAMA_BASE_URL=http://ollama:11434
OLLAMA_MODEL=llama3.2:1b
OLLAMA_EMBEDDING_MODEL=nomic-embed-text
USE_GEMINI=false
USE_GRADIENT=false
```

### 2. Verify Ollama Service
```bash
docker-compose ps ollama
curl http://localhost:11435/api/tags
docker-compose exec ollama ollama list
```

### 3. Verify Models Installed
```bash
docker-compose exec ollama ollama list
# Must have: llama3.2:1b and nomic-embed-text
```

If missing:
```bash
docker-compose exec ollama ollama pull llama3.2:1b
docker-compose exec ollama ollama pull nomic-embed-text
```

### 4. Restart Services
```bash
docker-compose restart app
docker-compose logs -f app | grep -i ollama
```

Look for: "Using Ollama for AI processing"

## Testing Workflow

1. **Upload Source Document**
   - Upload via UI or API
   - Check logs: `docker-compose logs -f app | grep -i "source\|chunk"`

2. **Wait for Processing**
   - Document chunks created
   - Chunks analyzed against controls
   - `ControlChunkMapping` entries created with `relevance_score`

3. **Trigger Compliance Sync**
   ```bash
   POST /api/v1/compliances/apps/{appId}/sync
   ```

4. **Verify Instant Scores**
   - Check `percentage_completion` increases immediately
   - Check `implementation_explanation` has chunk-based text

5. **Wait for LLM Processing**
   - Background queue processes controls
   - Ollama generates detailed control statements
   - `implementation_explanation` updated with full statements

## Troubleshooting

**No percentage updates:**
- Check `ControlChunkMapping` table: `SELECT control_id, reference_data FROM control_chunk_mapping WHERE app_id = X AND is_active = true`
- Verify `relevance_score > 0` in `reference_data`
- Check source processing completed: `docker-compose logs app | grep "LLM document processing completed"`

**No control statements:**
- Check Ollama logs: `docker-compose logs ollama`
- Check app logs: `docker-compose logs app | grep -i "ollama\|llm\|explanation"`
- Verify queue processing: `docker-compose logs app | grep -i "queue\|sqs"`

**Ollama not responding:**
- Check service: `docker-compose ps ollama`
- Test connection: `curl http://localhost:11435/api/tags`
- Restart: `docker-compose restart ollama`

## Database Queries

**Check chunk mappings:**
```sql
SELECT control_id, COUNT(*) as chunk_count, 
       AVG((reference_data->>'relevance_score')::float) as avg_relevance
FROM control_chunk_mapping 
WHERE app_id = X AND is_active = true 
GROUP BY control_id;
```

**Check percentage updates:**
```sql
SELECT control_id, percentage_completion, implementation_explanation 
FROM application_control_mapping 
WHERE app_id = X 
ORDER BY percentage_completion DESC;
```
