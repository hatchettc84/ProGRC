# Fix Database Permissions

## Issue
The database user `progrc` doesn't have permissions to create tables in the `public` schema. This is preventing migrations from running.

## Solution

### Option 1: Grant Permissions via DigitalOcean Console (Recommended)

1. Go to DigitalOcean Dashboard → Databases → Your Database
2. Click on "Users & Databases" tab
3. Find the `progrc` user
4. Grant the following permissions:
   - **Can create databases**: Yes
   - **Can create roles**: Yes (optional)

### Option 2: Connect as Admin and Grant Permissions

Connect to your DigitalOcean managed database using the admin credentials and run:

```sql
-- Grant all privileges on public schema
GRANT ALL PRIVILEGES ON SCHEMA public TO progrc;
GRANT ALL PRIVILEGES ON DATABASE progrc_bff_dev TO progrc;

-- Allow creating tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO progrc;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO progrc;

-- If tables already exist, grant on existing tables
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO progrc;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO progrc;
```

### Option 3: Use a Different Database User

If you have admin access, create a new user with proper permissions:

```sql
CREATE USER progrc_admin WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE progrc_bff_dev TO progrc_admin;
GRANT ALL PRIVILEGES ON SCHEMA public TO progrc_admin;
```

Then update the Kubernetes secret:
```bash
kubectl create secret generic progrc-bff-db-credentials \
  --from-literal=username=progrc_admin \
  --from-literal=password=your_secure_password \
  --from-literal=host=your-db-host \
  --from-literal=port=25060 \
  --from-literal=database=progrc_bff_dev \
  --namespace=progrc-dev \
  --dry-run=client -o yaml | kubectl apply -f -
```

## After Fixing Permissions

1. Re-run migrations:
```bash
kubectl delete job -n progrc-dev run-migrations
kubectl apply -f k8s/jobs/run-migrations.yaml
```

2. Check migration status:
```bash
kubectl logs -n progrc-dev -l job-name=run-migrations
```

3. Restart backend pods:
```bash
kubectl rollout restart deployment/progrc-backend -n progrc-dev
```

## Verify Tables Were Created

Once migrations succeed, you should see tables like:
- `users`
- `customers`
- `applications`
- `help_center_articles`
- etc.



