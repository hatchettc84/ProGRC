# Copy init-localstack.sh to VPS

## Missing File: init-localstack.sh

This file is required for LocalStack S3 bucket initialization.

## Option 1: Copy from Local Machine (Recommended)

From your local machine, run:

```bash
scp init-localstack.sh root@168.231.70.205:/opt/progrc/bff-service-backend-dev/
```

## Option 2: Create on VPS

On your VPS, create the file:

```bash
cd /opt/progrc/bff-service-backend-dev
cat > init-localstack.sh << 'EOF'
#!/bin/bash
# Initialize LocalStack S3 buckets for ProGRC

echo "🚀 Initializing LocalStack S3 buckets..."

# Wait for LocalStack to be ready
for i in {1..30}; do
  if curl -s http://localhost:4566/_localstack/health | grep -q '"s3": "available"'; then
    echo "✅ LocalStack is ready!"
    break
  fi
  if [ $i -eq 30 ]; then
    echo "❌ LocalStack failed to start"
    exit 1
  fi
  sleep 2
done

# Create S3 buckets
python3 << 'PYEOF'
import boto3
import sys

s3 = boto3.client("s3", endpoint_url="http://localhost:4566", aws_access_key_id="test", aws_secret_access_key="test")

buckets = ["progrc-app-file-uploads", "progrc-app-frontend-dev"]
for bucket in buckets:
    try:
        s3.create_bucket(Bucket=bucket)
        print(f"✅ Bucket {bucket} created")
    except Exception as e:
        if "BucketAlreadyOwnedByYou" in str(e) or "BucketAlreadyExists" in str(e):
            print(f"✅ Bucket {bucket} already exists")
        else:
            print(f"⚠️  Error: {e}")

cors_config = {
    "CORSRules": [{
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
        "AllowedOrigins": ["*"],
        "MaxAgeSeconds": 3000
    }]
}

try:
    s3.put_bucket_cors(Bucket="progrc-app-file-uploads", CORSConfiguration=cors_config)
    print("✅ CORS configured")
except Exception as e:
    print(f"⚠️  CORS warning: {e}")

print("✅ S3 buckets initialized!")
PYEOF
EOF

chmod +x init-localstack.sh
```

## Verify

After copying/creating, verify:

```bash
ls -la init-localstack.sh
```

The file should be executable and present.
