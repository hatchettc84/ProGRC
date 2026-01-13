#!/bin/bash

# Quick script to grant database permissions using doadmin
# Usage: ./k8s/grant-permissions-quick.sh YOUR_DOADMIN_PASSWORD

set -e

if [ -z "$1" ]; then
    echo "Usage: $0 <doadmin_password>"
    echo ""
    echo "To get the doadmin password:"
    echo "1. Go to DigitalOcean Console → Databases → Your DB"
    echo "2. Click 'Users & Databases' tab"
    echo "3. Click 'show' next to doadmin password"
    echo "4. Copy the password"
    exit 1
fi

ADMIN_PASSWORD="$1"
PGHOST="private-progrc-dev-db-do-user-31609689-0.f.db.ondigitalocean.com"
PGPORT="25060"
DBNAME="progrc_bff_dev"

echo "Granting permissions using doadmin..."
echo ""

# Create a temporary pod to run the SQL commands
kubectl run grant-permissions-$(date +%s) \
  --image=postgres:16-alpine \
  --rm -i --restart=Never \
  --namespace=progrc-dev \
  --env="PGPASSWORD=$ADMIN_PASSWORD" \
  -- sh -c "
    psql \"host=$PGHOST port=$PGPORT dbname=$DBNAME user=doadmin sslmode=require\" << 'SQL'
    -- Grant schema permissions
    GRANT ALL PRIVILEGES ON SCHEMA public TO progrc;
    GRANT ALL PRIVILEGES ON DATABASE progrc_bff_dev TO progrc;
    
    -- Grant default privileges for future objects
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO progrc;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO progrc;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO progrc;
    
    -- Verify permissions
    SELECT 
      nspname as schema_name,
      has_schema_privilege('progrc', nspname, 'CREATE') as can_create,
      has_schema_privilege('progrc', nspname, 'USAGE') as can_use
    FROM pg_namespace 
    WHERE nspname = 'public';
    
    SELECT 
      datname,
      has_database_privilege('progrc', datname, 'CREATE') as can_create_db
    FROM pg_database 
    WHERE datname = 'progrc_bff_dev';
    SQL
  "

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Permissions granted successfully!"
    echo ""
    echo "Next step: Run database setup"
    echo "  ./k8s/setup-database.sh"
else
    echo ""
    echo "❌ Failed to grant permissions"
    exit 1
fi



