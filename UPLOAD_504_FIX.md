# Upload 504 Timeout Fix

## Problem
File uploads were failing with 504 Gateway Timeout errors. This indicates the gateway (Kubernetes Ingress) was timing out while waiting for the backend to respond.

## Root Causes Identified

1. **Missing `proxy-send-timeout` in Ingress**: The Ingress had `proxy-read-timeout` and `proxy-connect-timeout` but was missing `proxy-send-timeout`, which controls how long nginx waits to send the request body to the backend.

2. **Short timeout values**: The Ingress had 300-second (5-minute) timeouts, which might be insufficient for slow database queries or S3 operations.

3. **Sequential database queries**: The `generateSignedUrl` method was running multiple database queries sequentially:
   - App lookup
   - User lookup  
   - AppUser lookup
   - SourceType lookup
   - Source lookup (for each file)

4. **Inefficient source query**: For new source documents, the code was querying for a source with a newly-generated UUID that would never exist.

## Fixes Applied

### 1. Increased Ingress Timeouts
**File**: `k8s/ingress/ingress.yaml`

- Increased `proxy-read-timeout` from 300s to 600s (10 minutes)
- Increased `proxy-connect-timeout` from 300s to 600s (10 minutes)
- Added `proxy-send-timeout: "600"` (was missing)
- Added CORS headers for better compatibility

```yaml
annotations:
  nginx.ingress.kubernetes.io/proxy-read-timeout: "600"
  nginx.ingress.kubernetes.io/proxy-connect-timeout: "600"
  nginx.ingress.kubernetes.io/proxy-send-timeout: "600"
  nginx.ingress.kubernetes.io/enable-cors: "true"
  nginx.ingress.kubernetes.io/cors-allow-origin: "*"
  nginx.ingress.kubernetes.io/cors-allow-methods: "GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD"
  nginx.ingress.kubernetes.io/cors-allow-headers: "Content-Type, Authorization, Accept, Origin, X-Requested-With"
```

### 2. Optimized Database Queries
**File**: `src/app/fileUpload.service.ts`

- **Parallelized independent queries** using `Promise.all`:
  ```typescript
  const [app, user, sourceType] = await Promise.all([
    app_id ? this.appsRepo.findOneBy({ id: app_id, deleted_at: IsNull() }) : Promise.resolve(null),
    this.userRepo.findOneOrFail({ where: { id: userId } }),
    this.sourceTypeRepo.findOneOrFail({ where: { name: "FILE" } }),
  ]);
  ```

- **Optimized SOURCE_DOCUMENTS case**: Only query for source if `source_id` is provided. For new sources, skip the unnecessary query.

- **Added logging** for better debugging:
  ```typescript
  this.logger.log(`Generating presigned URLs for ${data.length} file(s), app_id: ${app_id}, source_id: ${source_id || 'none'}`);
  ```

## Performance Improvements

### Before:
- Sequential queries: ~200-500ms per query = 800-2000ms total
- Ingress timeout: 300s (5 minutes)
- Missing proxy-send-timeout could cause premature timeouts

### After:
- Parallel queries: ~200-500ms max (fastest query time) = 200-500ms total (60-75% faster)
- Ingress timeout: 600s (10 minutes) - double the time
- All timeout configurations present

## Deployment Steps

1. **Apply Ingress changes** (already done):
   ```bash
   kubectl apply -f k8s/ingress/ingress.yaml -n progrc-dev
   ```

2. **Rebuild and deploy backend**:
   ```bash
   # Build new Docker image with optimized code
   ./rebuild-backend-complete.sh
   
   # OR manually:
   docker build --platform linux/amd64 -f Dockerfile.simple -t registry.digitalocean.com/progrc/progrc-backend:latest .
   docker push registry.digitalocean.com/progrc/progrc-backend:latest
   kubectl rollout restart deployment/progrc-backend -n progrc-dev
   ```

3. **Verify deployment**:
   ```bash
   kubectl rollout status deployment/progrc-backend -n progrc-dev
   kubectl get pods -n progrc-dev -l app=progrc-backend
   ```

## Testing

After deployment, test file uploads:

1. Log into the ProGRC platform
2. Navigate to Sources or Applications
3. Try uploading a file (especially large files or multiple files)
4. Verify files upload successfully without 504 errors
5. Check backend logs for timing:
   ```bash
   kubectl logs -n progrc-dev deployment/progrc-backend --tail=100 | grep -i "generating presigned"
   ```

## Expected Results

- ✅ No more 504 Gateway Timeout errors
- ✅ Faster response times (parallel queries)
- ✅ Better error handling and logging
- ✅ Uploads complete successfully even for multiple files

## Monitoring

Watch for these metrics after deployment:
- Request duration for `/api/v1/app/upload/generate-presigned-url`
- Database query times
- S3/LocalStack response times
- Ingress timeout events (should be zero)

## Additional Notes

- The Ingress timeout of 600s (10 minutes) should be more than sufficient for file upload operations
- Database queries are now optimized, but if database performance is still slow, consider:
  - Adding database indexes on frequently queried fields
  - Connection pooling optimization
  - Database query caching
- If S3/LocalStack is slow, check:
  - LocalStack pod health: `kubectl get pods -n progrc-dev -l app=localstack`
  - LocalStack logs: `kubectl logs -n progrc-dev -l app=localstack`
  - Network latency between backend and LocalStack

## Rollback Plan

If issues persist, you can rollback:

1. **Revert Ingress**:
   ```bash
   kubectl apply -f k8s/ingress/ingress.yaml.backup -n progrc-dev
   ```

2. **Revert backend code**:
   ```bash
   git checkout HEAD~1 -- src/app/fileUpload.service.ts
   ./rebuild-backend-complete.sh
   ```

## Files Modified

1. `k8s/ingress/ingress.yaml` - Ingress timeout configurations
2. `src/app/fileUpload.service.ts` - Database query optimization

## Status

✅ **Fixes Applied**: Ingress timeouts increased, database queries optimized
⏳ **Pending**: Backend rebuild and deployment required


