# VPS Quick File Check

## Run This Command on VPS

```bash
cd /opt/progrc/bff-service-backend-dev && \
echo "Checking essential files..." && \
[ -f docker-compose.yml ] && echo "✅ docker-compose.yml" || echo "❌ docker-compose.yml MISSING" && \
[ -f Dockerfile.simple ] && echo "✅ Dockerfile.simple" || echo "❌ Dockerfile.simple MISSING" && \
[ -f package.json ] && echo "✅ package.json" || echo "❌ package.json MISSING" && \
[ -f init-localstack.sh ] && echo "✅ init-localstack.sh" || echo "❌ init-localstack.sh MISSING" && \
[ -f .env ] && echo "✅ .env" || echo "⚠️  .env (create from env.sample)" && \
[ -d src ] && echo "✅ src/ directory" || echo "❌ src/ MISSING"
```

## Essential Files Needed

1. **docker-compose.yml** - Service configuration
2. **Dockerfile.simple** - Container build
3. **package.json** - Dependencies
4. **init-localstack.sh** - S3 bucket setup
5. **.env** - Environment config (create from env.sample if missing)
6. **src/** - Application source code

## If Files Missing

If any files are missing, you can:
- Copy from your local machine via `scp` or `rsync`
- Or clone fresh: `cd /opt/progrc && rm -rf bff-service-backend-dev && git clone https://github.com/hatchettc84/ProGRC.git bff-service-backend-dev`
