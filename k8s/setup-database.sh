#!/bin/bash

# Database Setup Script for ProGRC
# Run this AFTER fixing database permissions

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "=========================================="
echo "ProGRC Database Setup"
echo "=========================================="
echo ""

# Check if permissions are fixed
echo "Step 1: Verifying database permissions..."
kubectl delete job -n progrc-dev check-db-permissions 2>/dev/null || true

cat << 'EOF' | kubectl apply -f -
apiVersion: batch/v1
kind: Job
metadata:
  name: check-db-permissions
  namespace: progrc-dev
spec:
  backoffLimit: 1
  template:
    spec:
      restartPolicy: OnFailure
      containers:
      - name: psql
        image: postgres:16-alpine
        command: ["/bin/sh", "-c"]
        args:
        - |
          PGHOST=$(echo $POSTGRES_HOST | cut -d: -f1)
          PGPORT=${POSTGRES_PORT:-5432}
          
          RESULT=$(psql "host=$PGHOST port=$PGPORT dbname=$POSTGRES_DATABASE user=$POSTGRES_USERNAME password=$POSTGRES_PASSWORD sslmode=require" -t -c "SELECT has_schema_privilege('$POSTGRES_USERNAME', 'public', 'CREATE');")
          
          if [ "$RESULT" = "t" ]; then
            echo "✅ Database permissions are correct!"
            exit 0
          else
            echo "❌ Database permissions are NOT fixed yet."
            echo ""
            echo "Please fix permissions first:"
            echo "1. Go to: https://cloud.digitalocean.com/databases"
            echo "2. Select your database cluster"
            echo "3. Go to 'Users & Databases' tab"
            echo "4. Find 'progrc' user and ensure it has proper permissions"
            echo ""
            echo "Or connect as admin and run:"
            echo "  GRANT ALL PRIVILEGES ON SCHEMA public TO progrc;"
            echo "  GRANT ALL PRIVILEGES ON DATABASE progrc_bff_dev TO progrc;"
            exit 1
          fi
        env:
        - name: POSTGRES_USERNAME
          valueFrom:
            secretKeyRef:
              name: progrc-bff-db-credentials
              key: username
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: progrc-bff-db-credentials
              key: password
        - name: POSTGRES_HOST
          valueFrom:
            secretKeyRef:
              name: progrc-bff-db-credentials
              key: host
        - name: POSTGRES_PORT
          valueFrom:
            secretKeyRef:
              name: progrc-bff-db-credentials
              key: port
        - name: POSTGRES_DATABASE
          valueFrom:
            secretKeyRef:
              name: progrc-bff-db-credentials
              key: database
EOF

echo "Waiting for permission check..."
sleep 10

if kubectl logs -n progrc-dev -l job-name=check-db-permissions 2>&1 | grep -q "✅ Database permissions are correct"; then
    echo -e "${GREEN}✓ Permissions verified!${NC}"
    kubectl delete job -n progrc-dev check-db-permissions
else
    echo -e "${RED}✗ Permissions not fixed yet${NC}"
    kubectl logs -n progrc-dev -l job-name=check-db-permissions
    echo ""
    echo "Please fix database permissions first. See k8s/FIX_DATABASE_PERMISSIONS.md"
    exit 1
fi

echo ""

# Step 2: Run migrations
echo "Step 2: Running database migrations..."
kubectl delete job -n progrc-dev run-migrations 2>/dev/null || true
kubectl apply -f k8s/jobs/run-migrations.yaml

echo "Waiting for migrations to complete..."
echo "Monitoring migration progress (this may take a few minutes)..."
kubectl wait --for=condition=complete --timeout=300s job/run-migrations -n progrc-dev || {
    echo -e "${YELLOW}⚠️  Migrations are taking longer than expected${NC}"
    echo "Check logs with: kubectl logs -n progrc-dev -l job-name=run-migrations -f"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
}

echo ""
echo "Migration logs:"
kubectl logs -n progrc-dev -l job-name=run-migrations --tail=30

if kubectl logs -n progrc-dev -l job-name=run-migrations 2>&1 | grep -q "Migrations completed"; then
    echo -e "${GREEN}✓ Migrations completed successfully!${NC}"
else
    echo -e "${YELLOW}⚠️  Check migration logs for any errors${NC}"
fi

echo ""

# Step 3: Verify tables were created
echo "Step 3: Verifying tables were created..."
BACKEND_POD=$(kubectl get pods -n progrc-dev -l app=progrc-backend -o jsonpath='{.items[0].metadata.name}')

if [ -z "$BACKEND_POD" ]; then
    echo -e "${RED}✗ No backend pods found${NC}"
    exit 1
fi

echo "Checking for tables in database..."
TABLES=$(kubectl exec -n progrc-dev $BACKEND_POD -- node -e "
const {DataSource} = require('typeorm');
const config = require('./dist/config/typeorm.config.js');
const ds = new DataSource(config.dataSourceOptions);
ds.initialize()
  .then(() => ds.query(\"SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name LIMIT 10\"))
  .then(r => {
    console.log(JSON.stringify(r, null, 2));
    if (r && r.length > 0) {
      console.log('SUCCESS: Tables found');
      process.exit(0);
    } else {
      console.log('ERROR: No tables found');
      process.exit(1);
    }
  })
  .catch(e => {
    console.error('ERROR:', e.message);
    process.exit(1);
  })
  .finally(() => process.exit(0));
" 2>&1)

if echo "$TABLES" | grep -q "SUCCESS: Tables found"; then
    echo -e "${GREEN}✓ Tables created successfully!${NC}"
    echo "$TABLES" | grep -A 20 '"table_name"'
else
    echo -e "${RED}✗ No tables found${NC}"
    echo "$TABLES"
    exit 1
fi

echo ""

# Step 4: Restart backend
echo "Step 4: Restarting backend pods..."
kubectl rollout restart deployment/progrc-backend -n progrc-dev
echo "Waiting for pods to be ready..."
kubectl wait --for=condition=ready pod -l app=progrc-backend -n progrc-dev --timeout=120s || true

echo ""

# Step 5: Test login
echo "Step 5: Testing admin login..."
sleep 10
LOGIN_RESPONSE=$(curl -s -X POST http://134.199.241.75:3000/api/v1/jwt-auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@progrc.com","password":"adminadmin"}' 2>&1)

if echo "$LOGIN_RESPONSE" | grep -q "access_token\|token"; then
    echo -e "${GREEN}✓ Login successful!${NC}"
    echo ""
    echo "🎉 Database setup complete!"
    echo ""
    echo "You can now access the platform:"
    echo "  - API: http://134.199.241.75:3000/api/v1"
    echo "  - Login: admin@progrc.com / adminadmin"
else
    echo -e "${YELLOW}⚠️  Login test failed${NC}"
    echo "Response: $LOGIN_RESPONSE"
    echo ""
    echo "This might be normal if the test admin user wasn't created yet."
    echo "Check if the CreateTestAdminUser migration ran successfully."
fi

echo ""
echo "=========================================="
echo -e "${GREEN}Setup Complete!${NC}"
echo "=========================================="



