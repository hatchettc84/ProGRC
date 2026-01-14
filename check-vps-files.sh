#!/bin/bash
# Quick check for essential VPS files

cd /opt/progrc/bff-service-backend-dev 2>/dev/null || { echo "❌ Project directory not found"; exit 1; }

echo "Checking essential files..."
MISSING=0

[ -f docker-compose.yml ] && echo "✅ docker-compose.yml" || { echo "❌ docker-compose.yml MISSING"; MISSING=1; }
[ -f Dockerfile.simple ] && echo "✅ Dockerfile.simple" || { echo "❌ Dockerfile.simple MISSING"; MISSING=1; }
[ -f package.json ] && echo "✅ package.json" || { echo "❌ package.json MISSING"; MISSING=1; }
[ -f init-localstack.sh ] && echo "✅ init-localstack.sh" || { echo "❌ init-localstack.sh MISSING"; MISSING=1; }
[ -f .env ] && echo "✅ .env" || echo "⚠️  .env (create from env.sample if needed)"
[ -d src ] && echo "✅ src/ directory" || { echo "❌ src/ MISSING"; MISSING=1; }

[ $MISSING -eq 0 ] && echo "✅ All essential files present" || echo "❌ Some files missing"
exit $MISSING
