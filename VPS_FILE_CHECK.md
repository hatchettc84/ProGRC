# VPS Essential Files Check

## Required Files for Normal Operation

### Core Application Files
- ✅ `package.json` - Dependencies
- ✅ `docker-compose.yml` - Service orchestration
- ✅ `Dockerfile.simple` - App container build
- ✅ `.env` - Environment configuration (create from `env.sample`)

### Required Scripts
- ✅ `init-localstack.sh` - LocalStack S3 bucket initialization

### Source Code
- ✅ `src/` - Application source code
- ✅ `tsconfig.json` - TypeScript configuration
- ✅ `nest-cli.json` - NestJS configuration

## Quick Verification

```bash
# On VPS, check essential files exist
cd /opt/progrc/bff-service-backend-dev
ls -la docker-compose.yml Dockerfile.simple package.json init-localstack.sh .env
ls -d src/ tsconfig.json nest-cli.json
```

## If Missing Files

1. **`.env` file**: Copy from `env.sample` and configure
2. **`init-localstack.sh`**: Required for S3 bucket creation
3. **Source code**: Ensure `src/` directory exists

## Status Check

Run: `docker-compose ps` to verify all services are running.
