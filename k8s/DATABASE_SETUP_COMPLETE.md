# Database Setup - Complete Guide

## Current Status

✅ Backend API: Running at `http://134.199.241.75:3000`
⚠️ Database Permissions: Need to be fixed (user `progrc` cannot create tables)
⏳ Migrations: Waiting for permissions to be fixed
⏳ Tables: Not created yet

## Quick Fix (DigitalOcean Console)

### Step 1: Fix Database Permissions

1. **Go to DigitalOcean Console**:
   - Visit: https://cloud.digitalocean.com/databases
   - Find your database cluster (likely named `progrc-dev-db` or similar)

2. **Grant Permissions**:
   - Click on your database cluster
   - Go to **"Users & Databases"** tab
   - Find the user **"progrc"**
   - Click **"Edit"** or check user settings
   - Ensure the user has **"Can create databases"** permission enabled
   - Save changes

   **OR** if you have admin database credentials, connect and run:

   ```sql
   GRANT ALL PRIVILEGES ON SCHEMA public TO progrc;
   GRANT ALL PRIVILEGES ON DATABASE progrc_bff_dev TO progrc;
   ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO progrc;
   ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO progrc;
   ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO progrc;
   ```

### Step 2: Run Setup Script

After fixing permissions, run the automated setup:

```bash
cd /Users/corneliushatchett/Downloads/PRO\ GRC/bff-service-backend-dev
./k8s/setup-database.sh
```

This script will:
1. ✅ Verify permissions are fixed
2. ✅ Run all database migrations
3. ✅ Verify tables were created
4. ✅ Restart backend pods
5. ✅ Test admin login

### Step 3: Manual Steps (if script doesn't work)

If the automated script fails, run these commands manually:

```bash
# 1. Re-run migrations
kubectl delete job -n progrc-dev run-migrations
kubectl apply -f k8s/jobs/run-migrations.yaml

# 2. Monitor migrations
kubectl logs -n progrc-dev -l job-name=run-migrations -f

# 3. Wait for completion (look for "Migrations completed!")

# 4. Restart backend
kubectl rollout restart deployment/progrc-backend -n progrc-dev

# 5. Test login
curl -X POST http://134.199.241.75:3000/api/v1/jwt-auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@progrc.com","password":"adminadmin"}'
```

## Verify Setup

### Check Tables Were Created

```bash
BACKEND_POD=$(kubectl get pods -n progrc-dev -l app=progrc-backend -o jsonpath='{.items[0].metadata.name}')

kubectl exec -n progrc-dev $BACKEND_POD -- node -e "
const {DataSource} = require('typeorm');
const config = require('./dist/config/typeorm.config.js');
const ds = new DataSource(config.dataSourceOptions);
ds.initialize()
  .then(() => ds.query(\"SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY table_name\"))
  .then(r => console.log(JSON.stringify(r, null, 2)))
  .catch(e => console.error(e.message))
  .finally(() => process.exit(0));
"
```

### Test Login

```bash
curl -X POST http://134.199.241.75:3000/api/v1/jwt-auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@progrc.com","password":"adminadmin"}'
```

Expected response:
```json
{
  "access_token": "...",
  "refresh_token": "...",
  "user": { ... }
}
```

## Troubleshooting

### "permission denied for schema public"
- Permissions not fixed yet
- Go back to Step 1 and ensure permissions are granted

### "relation does not exist"
- Migrations haven't run yet
- Run migrations after fixing permissions

### "Migrations completed!" but no tables
- Check migration logs for errors
- Some migrations might have failed silently
- Re-run migrations: `kubectl delete job -n progrc-dev run-migrations && kubectl apply -f k8s/jobs/run-migrations.yaml`

### Login returns 500 error
- Check if `users` table exists
- Verify test admin user was created by migration
- Check backend logs: `kubectl logs -n progrc-dev -l app=progrc-backend --tail=50`

## Database Connection Details

- **Host**: `private-progrc-dev-db-do-user-31609689-0.f.db.ondigitalocean.com`
- **Port**: `25060`
- **Database**: `progrc_bff_dev`
- **Username**: `progrc`
- **SSL**: Required

## Next Steps After Setup

1. ✅ Database tables created
2. ✅ Admin user can login
3. ⏭️ Deploy frontend (optional)
4. ⏭️ Configure domain name (optional)
5. ⏭️ Set up SSL/TLS (optional)



