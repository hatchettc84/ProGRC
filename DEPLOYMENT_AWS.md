# ProGRC Platform - AWS Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying ProGRC to AWS with cost optimizations.

**Estimated Time**: 2-4 hours  
**Estimated Monthly Cost**: $106-199 (optimized)

## Architecture

### Service Architecture

- **Backend API**: ECS Fargate (serverless containers, low ops overhead)
- **DS Service**: ECS EC2 (long-running compute-heavy tasks)
- **Database**: RDS PostgreSQL with pgvector extension
- **Cache**: ElastiCache Redis
- **Queue**: SQS (managed message queue)
- **Frontend**: S3 + CloudFront (CDN)
- **Load Balancer**: ALB (Application Load Balancer)
- **Secrets**: AWS Secrets Manager

### Why Fargate vs EC2?

The platform uses different ECS launch types for different workloads:

- **Backend (Fargate)**: 
  - Predictable API load patterns
  - Auto-scaling without server management
  - Cost-effective for stateless services
  - No infrastructure management required

- **DS Service (EC2)**: 
  - Long-running ML/compute tasks
  - Potential GPU access requirements
  - More cost-effective for compute-heavy workloads
  - Better control over instance types and configurations

⚠️ **Environment Parity Warning**: AWS deployment uses managed services (Secrets Manager, SQS, ElastiCache) that differ from VPS deployment (environment variables, local processing, container Redis). Some features may behave differently between environments.

## Prerequisites

- [ ] AWS Account with admin access
- [ ] AWS CLI installed and configured
- [ ] Docker installed locally
- [ ] Node.js 18+ and npm installed
- [ ] Domain name (recommended for production)

## Step 1: AWS Account Setup

### 1.1 Install and Configure AWS CLI

```bash
# Install AWS CLI (if not installed)
# macOS:
brew install awscli

# Linux:
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configure AWS credentials
aws configure
# Enter:
# - AWS Access Key ID: [your-key]
# - AWS Secret Access Key: [your-secret]
# - Default region: us-west-2
# - Default output format: json
```

### 1.2 Set Environment Variables

```bash
# Set your AWS account ID
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
export AWS_REGION=us-west-2
export ENVIRONMENT=dev  # or prod, qa

echo "AWS Account ID: $AWS_ACCOUNT_ID"
echo "Region: $AWS_REGION"
```

## Step 2: Create ECR Repositories

```bash
# Create ECR repositories for container images
aws ecr create-repository \
  --repository-name progrc \
  --region $AWS_REGION \
  --image-scanning-configuration scanOnPush=true \
  --encryption-configuration encryptionType=AES256

aws ecr create-repository \
  --repository-name progrc-ds \
  --region $AWS_REGION \
  --image-scanning-configuration scanOnPush=true \
  --encryption-configuration encryptionType=AES256

# Get login token
aws ecr get-login-password --region $AWS_REGION | \
  docker login --username AWS --password-stdin \
  $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com
```

**Cost**: $0.10 per GB/month for storage (first 500MB free)

## Step 3: Create S3 Buckets

```bash
# Create S3 buckets
aws s3 mb s3://progrc-app-frontend-$ENVIRONMENT --region $AWS_REGION
aws s3 mb s3://progrc-app-file-uploads-$ENVIRONMENT --region $AWS_REGION

# Enable versioning (optional, for rollback)
aws s3api put-bucket-versioning \
  --bucket progrc-app-frontend-$ENVIRONMENT \
  --versioning-configuration Status=Enabled

# Set lifecycle policy to reduce costs (delete old versions after 30 days)
cat > /tmp/lifecycle.json <<EOF
{
  "Rules": [
    {
      "Id": "DeleteOldVersions",
      "Status": "Enabled",
      "NoncurrentVersionExpiration": {
        "NoncurrentDays": 30
      }
    }
  ]
}
EOF

aws s3api put-bucket-lifecycle-configuration \
  --bucket progrc-app-frontend-$ENVIRONMENT \
  --lifecycle-configuration file:///tmp/lifecycle.json

rm /tmp/lifecycle.json
```

**Cost**: $0.023 per GB/month (first 5GB free for 12 months)

## Step 4: Create RDS Database (Cost-Optimized)

### 4.1 Get VPC and Subnet Information

```bash
# Get default VPC ID
VPC_ID=$(aws ec2 describe-vpcs --filters "Name=isDefault,Values=true" \
  --query "Vpcs[0].VpcId" --output text)

# Get subnet IDs
SUBNET_IDS=$(aws ec2 describe-subnets --filters "Name=vpc-id,Values=$VPC_ID" \
  --query "Subnets[*].SubnetId" --output text | tr '\t' ',')

# Create DB subnet group
aws rds create-db-subnet-group \
  --db-subnet-group-name progrc-db-subnet-group \
  --db-subnet-group-description "ProGRC DB subnet group" \
  --subnet-ids $SUBNET_IDS \
  --region $AWS_REGION
```

### 4.2 Create Security Group for RDS

```bash
# Create security group
SG_ID=$(aws ec2 create-security-group \
  --group-name progrc-db-sg \
  --description "Security group for ProGRC RDS" \
  --vpc-id $VPC_ID \
  --query 'GroupId' --output text)

# Allow PostgreSQL from VPC
aws ec2 authorize-security-group-ingress \
  --group-id $SG_ID \
  --protocol tcp \
  --port 5432 \
  --cidr $(aws ec2 describe-vpcs --vpc-ids $VPC_ID \
    --query "Vpcs[0].CidrBlock" --output text)
```

### 4.3 Create RDS Instance

🔐 **Security Note**: Never paste passwords directly into terminal history. Use file-based methods.

```bash
# Generate secure password (save this securely!)
DB_PASSWORD=$(openssl rand -base64 32)
echo "Database password: $DB_PASSWORD" > /tmp/db-password.txt
echo "⚠️  Save this password securely: $DB_PASSWORD"
echo "⚠️  Password also saved to /tmp/db-password.txt (delete after use)"

# Create RDS PostgreSQL instance
aws rds create-db-instance \
  --db-instance-identifier progrc-db-$ENVIRONMENT \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 16.1 \
  --master-username progrc \
  --master-user-password "$(cat /tmp/db-password.txt | grep -v '^⚠️')" \
  --allocated-storage 20 \
  --storage-type gp2 \
  --vpc-security-group-ids $SG_ID \
  --db-subnet-group-name progrc-db-subnet-group \
  --backup-retention-period 7 \
  --storage-encrypted \
  --region $AWS_REGION

# Wait for database to be available (10-15 minutes)
echo "Waiting for database to be available..."
aws rds wait db-instance-available \
  --db-instance-identifier progrc-db-$ENVIRONMENT \
  --region $AWS_REGION

# Get database endpoint
DB_ENDPOINT=$(aws rds describe-db-instances \
  --db-instance-identifier progrc-db-$ENVIRONMENT \
  --query 'DBInstances[0].Endpoint.Address' \
  --output text)

echo "Database endpoint: $DB_ENDPOINT"

# Clean up password file
rm /tmp/db-password.txt
```

**Cost Optimization**:
- Use `db.t3.micro` (1 vCPU, 1GB RAM) for dev: **~$15/month**
- Use `db.t3.small` (2 vCPU, 2GB RAM) for production: **~$30/month**

## Step 5: Create ElastiCache Redis

```bash
# Create ElastiCache subnet group
aws elasticache create-cache-subnet-group \
  --cache-subnet-group-name progrc-redis-subnet \
  --cache-subnet-group-description "ProGRC Redis subnet group" \
  --subnet-ids $SUBNET_IDS \
  --region $AWS_REGION

# Create ElastiCache Redis cluster
aws elasticache create-cache-cluster \
  --cache-cluster-id progrc-redis-$ENVIRONMENT \
  --cache-node-type cache.t3.micro \
  --engine redis \
  --num-cache-nodes 1 \
  --cache-subnet-group-name progrc-redis-subnet \
  --security-group-ids $SG_ID \
  --region $AWS_REGION

# Wait for cluster to be available
aws elasticache wait cache-cluster-available \
  --cache-cluster-id progrc-redis-$ENVIRONMENT \
  --region $AWS_REGION
```

**Cost**: **~$12/month** for cache.t3.micro

## Step 6: Create SQS Queues

```bash
# Create required SQS queues
aws sqs create-queue \
  --queue-name progrc-ds-queue-$ENVIRONMENT \
  --region $AWS_REGION

aws sqs create-queue \
  --queue-name progrc-backend-queue-$ENVIRONMENT \
  --region $AWS_REGION

aws sqs create-queue \
  --queue-name ssp-pipeline-input-$ENVIRONMENT \
  --region $AWS_REGION

aws sqs create-queue \
  --queue-name compliance-input-queue-$ENVIRONMENT \
  --region $AWS_REGION

aws sqs create-queue \
  --queue-name assessment-input-queue-$ENVIRONMENT \
  --region $AWS_REGION

# Get queue URLs (save these)
aws sqs get-queue-url \
  --queue-name progrc-ds-queue-$ENVIRONMENT \
  --region $AWS_REGION \
  --query 'QueueUrl' --output text
```

**Cost**: $0.40 per million requests (first 1 million free)

## Step 7: Configure AWS Secrets Manager

🔐 **Security Note**: Never paste secrets directly into terminal history. Use file-based methods.

### 7.1 Generate JWT Keys

```bash
cd bff-service-backend-dev

# Generate JWT keys (creates .env file)
node scripts/generate-jwt-keys.js

# Read keys from .env (securely)
PRIVATE_KEY=$(grep ACCESS_TOKEN_SIGNATURE_PRIVATE .env | cut -d '=' -f2 | tr -d '"')
PUBLIC_KEY=$(grep ACCESS_TOKEN_SIGNATURE_PUBLIC .env | cut -d '=' -f2 | tr -d '"')
REFRESH_SECRET=$(grep REFRESH_TOKEN_SIGNATURE .env | cut -d '=' -f2 | tr -d '"')
```

### 7.2 Store Secrets in Secrets Manager

```bash
# Create database secret using file input (more secure)
cat > /tmp/db-secret.json <<EOF
{
  "host": "$DB_ENDPOINT",
  "port": 5432,
  "username": "progrc",
  "password": "$DB_PASSWORD",
  "database": "progrcdb"
}
EOF

aws secretsmanager create-secret \
  --name progrc/database/$ENVIRONMENT \
  --secret-string file:///tmp/db-secret.json \
  --region $AWS_REGION

# Clean up temp file
rm /tmp/db-secret.json

# Create JWT secret
cat > /tmp/jwt-secret.json <<EOF
{
  "accessTokenPrivate": "$PRIVATE_KEY",
  "accessTokenPublic": "$PUBLIC_KEY",
  "refreshTokenSecret": "$REFRESH_SECRET"
}
EOF

aws secretsmanager create-secret \
  --name progrc/jwt/$ENVIRONMENT \
  --secret-string file:///tmp/jwt-secret.json \
  --region $AWS_REGION

rm /tmp/jwt-secret.json

# Create API keys secret (edit with your actual keys)
cat > /tmp/api-keys-secret.json <<EOF
{
  "openaiApiKey": "sk-your-key-here",
  "internalApiKey": "your-internal-key-here"
}
EOF

aws secretsmanager create-secret \
  --name progrc/api-keys/$ENVIRONMENT \
  --secret-string file:///tmp/api-keys-secret.json \
  --region $AWS_REGION

rm /tmp/api-keys-secret.json
```

**Cost**: $0.40 per secret/month (first 10,000 API calls free)

## Step 8: Build and Push Docker Images

### 8.1 Build Backend Image

```bash
cd bff-service-backend-dev

# Build Docker image
docker build -t progrc-backend:latest .

# Tag for ECR
docker tag progrc-backend:latest \
  $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/progrc:latest

# Push to ECR
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/progrc:latest
```

### 8.2 Build DS Service Image

```bash
cd ds-main

# Build Docker image
docker build -t progrc-ds:latest .

# Tag for ECR
docker tag progrc-ds:latest \
  $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/progrc-ds:latest

# Push to ECR
docker push $AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/progrc-ds:latest
```

## Step 9: Deploy Infrastructure with CDK

### 9.1 Install CDK Dependencies

```bash
cd infra-main
npm install
npm run build
```

### 9.2 Modify CDK for Cost Optimization

Before deploying, modify the CDK stacks to use smaller instance sizes:

**File: `infra-main/lib/infra-dev-backend-stack.ts`**

Find and change:
```typescript
// Change from:
memoryLimitMiB: 8192,
cpu: 2048,

// To (for cost optimization):
memoryLimitMiB: 2048,  // 2GB instead of 8GB
cpu: 1024,              // 1 vCPU instead of 2
```

Also change auto-scaling:
```typescript
// Change from:
minCapacity: 2,

// To:
minCapacity: 1,  // Run only 1 instance minimum
```

**File: `infra-main/lib/infra-dev-ds-stack.ts`**

Apply similar changes for DS service.

### 9.3 Deploy CDK Stacks

```bash
# Bootstrap CDK (first time only)
npx cdk bootstrap aws://$AWS_ACCOUNT_ID/$AWS_REGION

# Synthesize templates (validate)
npx cdk synth

# Deploy all stacks
npx cdk deploy --all

# Or deploy specific stacks
npx cdk deploy InfraDevBackendStack
npx cdk deploy InfraDevCommonStack
npx cdk deploy InfraDevDsStack
```

**Expected Time**: 15-30 minutes for first deployment

## Step 10: Run Database Migrations

After ECS services are running, execute migrations:

```bash
# Get ECS cluster and service names
CLUSTER_NAME=$(aws ecs list-clusters --query 'clusterArns[0]' --output text | cut -d'/' -f2)
SERVICE_NAME=$(aws ecs list-services --cluster $CLUSTER_NAME --query 'serviceArns[0]' --output text | cut -d'/' -f3)

# Get running task
TASK_ARN=$(aws ecs list-tasks --cluster $CLUSTER_NAME --service-name $SERVICE_NAME \
  --query 'taskArns[0]' --output text)

# Execute migration command
aws ecs execute-command \
  --cluster $CLUSTER_NAME \
  --task $TASK_ARN \
  --container bff-container \
  --command "npm run migration:up" \
  --interactive
```

**Alternative**: Migrations may run automatically on container startup (check your startup script in Dockerfile).

**Verify migrations completed**:
```bash
# Check migration logs
aws logs tail /ecs/progrc-backend --follow | grep -i migration
```

## Step 11: Build and Deploy Frontend

```bash
cd frontend-app-main

# Install dependencies
yarn install

# Build frontend
yarn build

# Upload to S3
aws s3 sync dist/ \
  s3://progrc-app-frontend-$ENVIRONMENT/build_assets/ \
  --delete

# Get CloudFront distribution ID (if using CloudFront)
DIST_ID=$(aws cloudfront list-distributions \
  --query "DistributionList.Items[?Comment=='ProGRC Frontend'].Id" \
  --output text)

# Invalidate CloudFront cache
if [ ! -z "$DIST_ID" ]; then
  aws cloudfront create-invalidation \
    --distribution-id $DIST_ID \
    --paths "/*"
fi
```

## Step 12: Verify Deployment

```bash
# Get ALB DNS name
ALB_DNS=$(aws elbv2 describe-load-balancers \
  --query "LoadBalancers[?LoadBalancerName=='dev-app-lb'].DNSName" \
  --output text)

# Test health endpoint
curl https://$ALB_DNS/api/v1/health

# Check ECS service status
aws ecs describe-services \
  --cluster progrc-cluster \
  --services progrc-backend-service \
  --query 'services[0].runningCount'
```

## Step 13: Configure DNS (Optional)

```bash
# Get CloudFront distribution domain
CF_DOMAIN=$(aws cloudfront list-distributions \
  --query "DistributionList.Items[0].DomainName" \
  --output text)

echo "Update your DNS CNAME record:"
echo "app.progrc.com -> $CF_DOMAIN"
```

## Production Readiness Checklist

Before going live, verify:

- [ ] All services are running and healthy
- [ ] Database migrations completed successfully
- [ ] Health endpoints responding: `/api/v1/health`
- [ ] Secrets stored securely in Secrets Manager
- [ ] SSL/TLS certificates configured
- [ ] Backups enabled (RDS automated backups)
- [ ] Monitoring and alerting configured
- [ ] Auto-scaling policies validated
- [ ] Cost monitoring enabled
- [ ] Security groups properly configured
- [ ] IAM roles follow least privilege
- [ ] Logs are being collected (CloudWatch)
- [ ] Frontend assets deployed to S3
- [ ] DNS configured and pointing correctly

## Cost Optimization Summary

| Optimization | Monthly Savings |
|--------------|----------------|
| Smaller ECS instances (2GB/1 vCPU) | ~$30 |
| RDS db.t3.micro (vs medium) | ~$30 |
| Auto-scaling min=1 (vs 2) | ~$30 |
| S3 lifecycle policies | ~$5-10 |
| CloudWatch log retention (7 days) | ~$5-10 |
| **Total Savings** | **~$100-110/month** |

## Troubleshooting

### ECS Tasks Failing to Start

```bash
# Check task logs
aws logs tail /ecs/progrc-backend --follow

# Check task definition
aws ecs describe-task-definition --task-definition progrc-backend

# Check service events
aws ecs describe-services \
  --cluster progrc-cluster \
  --services progrc-backend-service \
  --query 'services[0].events[:5]'
```

### Database Connection Errors

```bash
# Verify security groups allow traffic
aws ec2 describe-security-groups --group-ids $SG_ID

# Test database connectivity from ECS task
aws ecs execute-command \
  --cluster $CLUSTER_NAME \
  --task $TASK_ARN \
  --container bff-container \
  --command "nc -zv $DB_ENDPOINT 5432" \
  --interactive
```

### S3 Access Denied

```bash
# Check IAM role permissions
aws iam get-role-policy \
  --role-name BffECSTaskRole \
  --policy-name S3Access
```

### Migration Errors

```bash
# Check migration logs
aws logs tail /ecs/progrc-backend --follow | grep -i migration

# Run migrations manually
aws ecs execute-command \
  --cluster $CLUSTER_NAME \
  --task $TASK_ARN \
  --container bff-container \
  --command "npm run migration:up" \
  --interactive
```

## Next Steps

- Set up CloudWatch alarms for monitoring
- Configure automated backups
- Set up CI/CD pipeline (GitHub Actions)
- Enable AWS Cost Explorer for cost tracking
- Review and optimize further based on usage

---

**Estimated Total Setup Time**: 2-4 hours  
**Estimated Monthly Cost**: $106-199 (optimized)

