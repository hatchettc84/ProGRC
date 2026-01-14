# Test Compliance Scoring & Control Statements

## ✅ Status: Ollama Connected

Ollama is now accessible from the Docker container. Next steps:

## Test Workflow

### 1. Verify Database Connection

```bash
docker-compose logs app | grep -i "database\|postgres" | tail -10
```

Should NOT see "password authentication failed" errors.

### 2. Upload Source Document

In the ProGRC UI:
- Go to your application
- Upload a source document (policy, procedure, etc.)
- Wait for processing (check logs: `docker-compose logs app | grep -i "source\|chunk"`)

### 3. Trigger Compliance Sync

In the UI:
- Navigate to Compliance section
- Click "Update Compliance" or "Sync Compliance"
- This calls: `POST /api/v1/compliances/apps/{appId}/sync`

### 4. Watch for Results

**Instant Scoring (immediate):**
- Percentage scores should increase immediately
- Based on chunk relevance scores already computed

**Control Statements (background):**
- Check logs: `docker-compose logs app | grep -i "ollama\|llm\|explanation"`
- Should see "Using Ollama for AI processing"
- Control statements appear in `implementation_explanation` field

### 5. Verify in Database

```bash
# Check percentage updates
docker-compose exec postgres psql -U progrc -d progrc_bff -c "SELECT control_id, percentage_completion, implementation_explanation FROM application_control_mapping WHERE app_id = YOUR_APP_ID LIMIT 5;"

# Check chunk mappings
docker-compose exec postgres psql -U progrc -d progrc_bff -c "SELECT control_id, COUNT(*) as chunks, AVG((reference_data->>'relevance_score')::float) as avg_relevance FROM control_chunk_mapping WHERE app_id = YOUR_APP_ID AND is_active = true GROUP BY control_id LIMIT 5;"
```

## Expected Behavior

1. **Source Upload** → Document chunked and analyzed
2. **Chunk Analysis** → Ollama analyzes chunks against controls
3. **Relevance Scores** → Stored in `ControlChunkMapping.reference_data`
4. **Instant Scoring** → `percentage_completion` calculated from relevance scores
5. **Control Statements** → Ollama generates `implementation_explanation`

## Troubleshooting

**No percentage updates:**
- Check chunks exist: `SELECT COUNT(*) FROM control_chunk_mapping WHERE app_id = X`
- Check relevance scores: `SELECT reference_data FROM control_chunk_mapping WHERE app_id = X LIMIT 1`

**No control statements:**
- Check Ollama logs: `docker-compose logs app | grep -i "ollama"`
- Verify queue processing: `docker-compose logs app | grep -i "queue\|sqs"`
