# ProGRC Platform Deployment Guide

> **Note**: This file has been restructured. Please see the new deployment documentation structure:
> 
> - **[README_DEPLOY.md](README_DEPLOY.md)** - Main deployment guide entry point
> - **[QUICK_START.md](QUICK_START.md)** - Fast setup for developers (15-30 min)
> - **[DEPLOYMENT_AWS.md](DEPLOYMENT_AWS.md)** - Complete AWS deployment guide
> - **[DEPLOYMENT_VPS.md](DEPLOYMENT_VPS.md)** - Complete VPS deployment guide
>
> This file is kept for reference but the new structure provides:
> - Better organization (separate AWS and VPS guides)
> - Security improvements (file-based secrets)
> - Missing steps added (database migrations, Fargate vs EC2 explanation)
> - Environment parity warnings
> - Production readiness checklists

---

## Overview (Legacy - See README_DEPLOY.md)

This guide outlines the proper deployment strategies for the ProGRC platform, which consists of:
- **Backend (BFF)**: NestJS service
- **Frontend**: React/Vite application
- **Data Science (DS)**: Python service
- **Infrastructure**: AWS CDK-based infrastructure

## Deployment Architecture Options

### Option 1: AWS ECS/CDK (Recommended for Production)

This is the **primary production deployment method** used by the platform.

#### Architecture Components:
- **Backend**: ECS Fargate (8GB RAM, 4 vCPU, auto-scaling 2-10 instances)
- **DS Service**: ECS EC2 (T4G.XLARGE, auto-scaling 1-10 instances)
- **Frontend**: S3 + CloudFront
- **Database**: RDS PostgreSQL (pgvector)
- **Cache/Queue**: Redis/ElastiCache + SQS
- **Load Balancers**: ALB (public HTTPS:443, internal HTTP:9000)
- **Secrets**: AWS Secrets Manager
- **Container Registry**: ECR

#### Prerequisites:
1. AWS Account with appropriate IAM roles
2. ECR repositories created:
   - `progrc` (backend image)
   - `progrc-ds` (DS service image)
3. AWS Secrets Manager configured with:
   - Database credentials
   - JWT keys
   - API keys
   - SMTP credentials
   - CloudFront keys
4. S3 buckets:
   - `progrc-app-frontend-dev` (or prod/qa variants)
   - `progrc-app-file-uploads`
5. SQS queues configured
6. Cognito User Pool configured

#### Deployment Steps:

**1. Build and Push Docker Images:**

```bash
# Backend
cd bff-service-backend-dev
docker build -t progrc-backend:latest .
aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin 296062557786.dkr.ecr.us-west-2.amazonaws.com
docker tag progrc-backend:latest 296062557786.dkr.ecr.us-west-2.amazonaws.com/progrc:latest
docker push 296062557786.dkr.ecr.us-west-2.amazonaws.com/progrc:latest

# DS Service
cd ds-main
docker build -t progrc-ds:latest .
docker tag progrc-ds:latest 296062557786.dkr.ecr.us-west-2.amazonaws.com/progrc-ds:latest
docker push 296062557786.dkr.ecr.us-west-2.amazonaws.com/progrc-ds:latest
```

**2. Deploy Infrastructure (CDK):**

```bash
cd infra-main
npm install
npm run build
npx cdk synth  # Validate
npx cdk deploy --all  # Deploy all stacks
```

**3. Deploy Frontend:**

```bash
cd frontend-app-main
yarn install
yarn build
aws s3 sync dist/ s3://progrc-app-frontend-dev/build_assets/ --delete
aws cloudfront create-invalidation --distribution-id <DIST_ID> --paths "/*"
```

**4. Update ECS Services:**

ECS services will automatically pull the latest images from ECR. You can force an update:

```bash
aws ecs update-service --cluster <cluster-name> --service <service-name> --force-new-deployment
```

#### CI/CD Integration:

The platform includes GitHub Actions workflows:
- `.github/workflows/deploy-dev.yml` - Dev environment
- `.github/workflows/deploy-qa.yml` - QA environment
- `.github/workflows/deploy-prod.yml` - Production environment

These workflows:
1. Build Docker images
2. Push to ECR
3. Deploy to ECS (if configured)
4. Update CloudFront distributions

---

### Option 2: Docker Compose (Development/Testing)

For **local development** or **VPS deployment without AWS**.

#### Architecture:
- **Backend**: Docker container
- **Database**: PostgreSQL container (pgvector)
- **Cache**: Redis container
- **Frontend**: Served by backend from S3 (or local build)

#### Prerequisites:
- Docker and Docker Compose installed
- PostgreSQL database accessible
- Redis accessible
- Environment variables configured

#### Deployment Steps:

**1. Configure Environment:**

```bash
cd bff-service-backend-dev
cp env.sample .env
# Edit .env with your configuration
```

**2. Start Services:**

```bash
docker-compose up -d
```

**3. Verify:**

```bash
docker-compose ps
curl http://localhost:3000/api/v1/health
```

#### Key Configuration for VPS:

Update `docker-compose.yml`:
- Set proper database credentials
- Configure Redis connection
- Set JWT keys (generate using `scripts/generate-jwt-keys.js`)
- Configure SMTP settings
- Set `CORS_ORIGIN` to your domain
- Configure `FE_HOST` to your frontend URL

---

### Option 3: Standalone Docker Containers (VPS)

For **VPS deployment** without Docker Compose.

#### Prerequisites:
- Docker installed on VPS
- PostgreSQL database (local or remote)
- Redis (local or remote)
- Nginx (for reverse proxy/SSL)

#### Deployment Steps:

**1. Build Backend Image:**

```bash
cd bff-service-backend-dev
docker build -t progrc-backend:latest .
```

**2. Run Backend Container:**

```bash
docker run -d \
  --name progrc-backend \
  -p 3000:3000 \
  -p 9000:9000 \
  --env-file .env \
  -v /logs_bff:/logs_bff \
  progrc-backend:latest
```

**3. Configure Nginx (Reverse Proxy):**

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**4. Setup SSL (Let's Encrypt):**

```bash
sudo certbot --nginx -d your-domain.com
```

---

## Service-Specific Deployment Details

### Backend (BFF) Service

#### Environment Variables Required:

```bash
# Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USERNAME=progrc
POSTGRES_PASSWORD=<secure-password>
POSTGRES_DATABASE=progrcdb

# JWT
ACCESS_TOKEN_SIGNATURE_PRIVATE=<base64-encoded-private-key>
ACCESS_TOKEN_SIGNATURE_PUBLIC=<base64-encoded-public-key>
REFRESH_TOKEN_SIGNATURE=<secret-string>

# AWS (if using AWS services)
AWS_REGION=us-west-2
AWS_ACCESS_KEY_ID=<key>
AWS_SECRET_ACCESS_KEY=<secret>

# S3
S3_FILES_BUCKET=progrc-app-file-uploads
FRONTEND_S3_BUCKET=progrc-app-frontend-dev

# Email
SES_EMAIL_SENDER=noreply@progrc.com
HELP_DESK_EMAIL=support@progrc.com

# Application
FE_HOST=https://app.progrc.com
NODE_ENV=production
PORT=3000
```

#### Health Checks:
- Public API: `GET /api/v1/health`
- Private API: `GET /api/private/health`
- Frontend: `GET /health/frontend`

#### Database Migrations:

Migrations run automatically on container startup via `startup.js`. To run manually:

```bash
npm run migration:up
```

### Frontend Service

#### Build Process:

```bash
cd frontend-app-main
yarn install
yarn lint
yarn test
yarn build
```

#### Deployment to S3:

```bash
aws s3 sync dist/ s3://progrc-app-frontend-dev/build_assets/ --delete
aws cloudfront create-invalidation --distribution-id <DIST_ID> --paths "/*"
```

#### Environment Configuration:

Frontend reads configuration from:
- Build-time environment variables
- Runtime API configuration
- AWS Cognito configuration

### Data Science (DS) Service

#### Build Process:

```bash
cd ds-main
docker build -t progrc-ds:latest .
```

#### Environment Variables:

```bash
DB_HOST=<postgres-host>
DB_PORT=5432
DB_NAME=progrcdb
DB_USER=progrc
DB_PASSWORD=<password>

# AWS (if using Bedrock)
AWS_REGION=us-west-2
AWS_ACCESS_KEY_ID=<key>
AWS_SECRET_ACCESS_KEY=<secret>

# SQS Queues
SQS_SSP_QUEUE_URL=<queue-url>
SQS_COMPLIANCE_QUEUE_URL=<queue-url>
```

#### Queue Processing:

The DS service processes messages from SQS queues:
- `ssp-pipeline-input`
- `compliance-input-queue`
- `assessment-input-queue`
- `policy-generation-queue`
- `artifacts-listner-queue`

---

## Deployment Checklist

### Pre-Deployment:

- [ ] All code rebranded from KOVR to ProGRC
- [ ] External dependencies removed (`@kovr-ai/app-common` replaced)
- [ ] Environment variables configured
- [ ] Database migrations tested
- [ ] JWT keys generated
- [ ] SSL certificates configured
- [ ] Secrets stored securely (AWS Secrets Manager or equivalent)
- [ ] S3 buckets created and configured
- [ ] SQS queues created
- [ ] CloudFront distribution configured (if using AWS)
- [ ] Cognito User Pool configured
- [ ] Health checks verified

### Build Verification:

- [ ] Backend: `npm install && npm run build` succeeds
- [ ] Frontend: `yarn install && yarn build` succeeds
- [ ] DS: `pip install -r requirements_docker.txt` succeeds
- [ ] Docker images build successfully
- [ ] Docker images start and pass health checks

### Deployment:

- [ ] Docker images pushed to registry (ECR/Docker Hub)
- [ ] Infrastructure deployed (CDK or manual)
- [ ] Services started and healthy
- [ ] Database migrations completed
- [ ] Frontend assets uploaded to S3
- [ ] CloudFront invalidation completed
- [ ] DNS configured and pointing to load balancer
- [ ] SSL certificates active

### Post-Deployment:

- [ ] Health endpoints responding
- [ ] API endpoints accessible
- [ ] Frontend loading correctly
- [ ] Authentication working
- [ ] Database connections stable
- [ ] Queue processing functional
- [ ] Logs accessible
- [ ] Monitoring configured

---

## Troubleshooting

### Common Issues:

1. **Database Connection Errors:**
   - Verify `POSTGRES_HOST`, `POSTGRES_PORT`, credentials
   - Check network connectivity
   - Verify database exists and user has permissions

2. **JWT Token Errors:**
   - Verify JWT keys are correctly base64-encoded
   - Check issuer/audience match between services
   - Verify token expiration settings

3. **S3 Access Errors:**
   - Verify AWS credentials
   - Check bucket names match configuration
   - Verify IAM permissions

4. **Frontend Not Loading:**
   - Check S3 bucket and path configuration
   - Verify CloudFront distribution (if using)
   - Check CORS settings

5. **Queue Processing Issues:**
   - Verify SQS queue URLs
   - Check IAM permissions for queue access
   - Verify queue message format

### Logs:

**Backend:**
```bash
# Docker logs
docker logs progrc-backend

# Application logs
tail -f /logs_bff/*.log
```

**DS Service:**
```bash
docker logs progrc-ds
```

**ECS:**
```bash
aws logs tail /ecs/progrc-backend --follow
```

---

## Security Considerations

1. **Secrets Management:**
   - Never commit secrets to git
   - Use AWS Secrets Manager, HashiCorp Vault, or environment variables
   - Rotate secrets regularly

2. **Network Security:**
   - Use VPCs and security groups
   - Enable SSL/TLS everywhere
   - Restrict database access to application servers only

3. **Container Security:**
   - Use non-root user (UID 65532)
   - Scan images for vulnerabilities
   - Keep base images updated

4. **Application Security:**
   - Enable CORS properly
   - Validate all inputs
   - Use rate limiting
   - Implement proper authentication/authorization

---

## Recommended Deployment Strategy

### For Production:

1. **Use AWS ECS/CDK** (Option 1)
   - Best scalability and reliability
   - Managed infrastructure
   - Auto-scaling built-in
   - Integrated monitoring

2. **Multi-Environment Setup:**
   - Dev: `296062557786.dkr.ecr.us-west-2.amazonaws.com/progrc:latest`
   - QA: `650251729525.dkr.ecr.us-west-2.amazonaws.com/progrc:latest`
   - Prod: `314146328961.dkr.ecr.us-west-2.amazonaws.com/progrc:latest`

3. **CI/CD Pipeline:**
   - Use GitHub Actions workflows
   - Automated testing before deployment
   - Blue-green deployments for zero downtime

### For VPS/On-Premise:

1. **Use Docker Compose** (Option 2)
   - Easier management
   - Single command deployment
   - Good for small to medium deployments

2. **Or Standalone Containers** (Option 3)
   - More control
   - Better for custom configurations
   - Requires more manual setup

---

## Next Steps

1. Choose your deployment option based on your infrastructure
2. Configure environment variables
3. Build and test locally first
4. Deploy to staging/QA environment
5. Verify all functionality
6. Deploy to production
7. Monitor and maintain

---

## Support

For deployment issues:
- Check logs first
- Review this guide
- Verify environment configuration
- Check service health endpoints
- Review infrastructure documentation in `infra-main/infrastructure-overview.md`

