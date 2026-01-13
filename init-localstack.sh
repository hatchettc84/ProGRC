#!/bin/bash
# Initialize LocalStack S3 buckets for ProGRC
# This script runs inside the LocalStack container

echo "🚀 Initializing LocalStack S3 buckets..."

# Wait for LocalStack to be ready
echo "⏳ Waiting for LocalStack to be ready..."
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

# Create S3 buckets using Python/boto3 (available in LocalStack container)
echo "📦 Creating S3 buckets..."

python3 << 'PYEOF'
import boto3
import sys
import json

s3 = boto3.client("s3", endpoint_url="http://localhost:4566", aws_access_key_id="test", aws_secret_access_key="test")

# Main file uploads bucket
try:
    s3.create_bucket(Bucket="progrc-app-file-uploads")
    print("✅ Bucket progrc-app-file-uploads created")
except Exception as e:
    if "BucketAlreadyOwnedByYou" in str(e) or "BucketAlreadyExists" in str(e):
        print("✅ Bucket progrc-app-file-uploads already exists")
    else:
        print(f"❌ Error creating bucket: {e}")
        sys.exit(1)

# Frontend assets bucket
try:
    s3.create_bucket(Bucket="progrc-app-frontend-dev")
    print("✅ Bucket progrc-app-frontend-dev created")
except Exception as e:
    if "BucketAlreadyOwnedByYou" in str(e) or "BucketAlreadyExists" in str(e):
        print("✅ Bucket progrc-app-frontend-dev already exists")
    else:
        print(f"⚠️  Frontend bucket error (non-critical): {e}")

# Configure CORS for file uploads
print("\n🔧 Configuring CORS for file uploads...")
cors_config = {
    "CORSRules": [
        {
            "AllowedHeaders": ["*"],
            "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD", "OPTIONS"],
            "AllowedOrigins": ["*"],
            "ExposeHeaders": ["ETag", "x-amz-request-id", "x-amz-id-2", "Content-Length"],
            "MaxAgeSeconds": 3000
        }
    ]
}

try:
    s3.put_bucket_cors(Bucket="progrc-app-file-uploads", CORSConfiguration=cors_config)
    print("✅ CORS configured for progrc-app-file-uploads")
except Exception as e:
    print(f"⚠️  CORS configuration warning (may not be critical): {e}")

try:
    s3.put_bucket_cors(Bucket="progrc-app-frontend-dev", CORSConfiguration=cors_config)
    print("✅ CORS configured for progrc-app-frontend-dev")
except Exception as e:
    print(f"⚠️  CORS configuration warning (may not be critical): {e}")

# List all buckets
buckets = s3.list_buckets()
print(f"\n✅ Total buckets: {len(buckets['Buckets'])}")
for b in buckets["Buckets"]:
    print(f"   - {b['Name']}")
PYEOF

echo "✅ S3 buckets initialized successfully!"
