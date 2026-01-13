# File Upload Fix Summary

## Problem
File/source uploads were not working on the VPS because S3 configuration was missing.

## Solution
Configured LocalStack (AWS S3 emulator) to provide local S3 storage for file uploads.

## Changes Made

### 1. Added LocalStack Service
- Added `localstack` service to `docker-compose.yml`
- Configured to run S3 service on port 4566
- Enabled persistence for data retention

### 2. Added S3 Environment Variables
Added to the `app` service in `docker-compose.yml`:
```yaml
USE_LOCALSTACK: "true"
LOCALSTACK_ENDPOINT: http://localstack:4566
AWS_S3_ENDPOINT: http://localstack:4566
AWS_S3_REGION: us-east-1
AWS_S3_ACCESS_KEY_ID: test
AWS_S3_SECRET_ACCESS_KEY: test
S3_FILES_BUCKET: progrc-app-file-uploads
FRONTEND_S3_BUCKET: progrc-app-frontend-dev
```

### 3. Created Bucket Initialization Script
- Created `init-localstack.sh` to automatically create S3 buckets
- Sets up CORS configuration for file uploads
- Can be run manually or as part of deployment

### 4. Updated Dependencies
- Added `localstack` as a dependency for the `app` service
- Backend now waits for LocalStack to be healthy before starting

## Verification

### Check LocalStack Status
```bash
docker ps | grep localstack
curl http://localhost:4566/_localstack/health
```

### Check S3 Buckets
```bash
docker compose exec localstack aws --endpoint-url=http://localhost:4566 s3 ls
```

### Test File Upload
1. Log into the ProGRC platform
2. Navigate to Sources or Applications
3. Try uploading a file
4. Check backend logs: `docker compose logs app | grep -i upload`

## Current Status

✅ **LocalStack**: Running and healthy
✅ **S3 Buckets**: Created (`progrc-app-file-uploads`, `progrc-app-frontend-dev`)
✅ **Backend Configuration**: S3 environment variables set
✅ **File Upload**: Ready to use

## Upload Endpoints

- **Source Upload**: `POST /api/v1/app/sources/upload`
- **File Upload**: `POST /api/v1/app/upload_files`
- **Max File Size**: 5MB per file (configurable)
- **Max Files**: 3 files per request

## Troubleshooting

### Issue: Upload fails with "S3 bucket not found"
**Solution**: Run the initialization script:
```bash
cd /root/bff-service-backend-dev
./init-localstack.sh
```

### Issue: LocalStack not accessible from backend
**Solution**: Verify network connectivity:
```bash
docker compose exec app ping -c 2 localstack
```

### Issue: Files not persisting after restart
**Solution**: LocalStack data is stored in Docker volume `localstack_data`. Verify volume exists:
```bash
docker volume ls | grep localstack
```

## Next Steps

1. ✅ LocalStack configured and running
2. ✅ S3 buckets created
3. ⏭️ Test file uploads in the platform
4. ⏭️ Monitor upload functionality
5. ⏭️ Consider migrating to real AWS S3 for production

## Production Migration

For production, replace LocalStack with real AWS S3:
1. Remove LocalStack service from docker-compose.yml
2. Set `USE_LOCALSTACK: "false"`
3. Configure real AWS credentials:
   - `AWS_S3_ACCESS_KEY_ID`: Your AWS access key
   - `AWS_S3_SECRET_ACCESS_KEY`: Your AWS secret key
   - `AWS_S3_REGION`: Your AWS region
4. Create S3 buckets in AWS Console
5. Update `S3_FILES_BUCKET` and `FRONTEND_S3_BUCKET` with real bucket names

