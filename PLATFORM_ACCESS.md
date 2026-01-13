# ProGRC Platform Access Guide

## Current Status

✅ **Backend API**: Running and accessible at `http://134.199.241.75:3000`
⚠️ **Database**: Tables not created yet (permission issue)
⚠️ **Frontend**: Not deployed yet

## Quick Access

### 1. API Access (Currently Available)

The backend API is accessible at:
- **Base URL**: `http://134.199.241.75:3000`
- **API Endpoint**: `http://134.199.241.75:3000/api/v1`
- **Health Check**: `http://134.199.241.75:3000/api/v1/health`
- **API Docs**: `http://134.199.241.75:3000/api_docs` (Swagger)

### 2. Test Admin Credentials (After Database Setup)

Once database tables are created, you can login with:

- **Email**: `admin@progrc.com`
- **Password**: `adminadmin`
- **Role**: SuperAdmin

### 3. Login Endpoint

```bash
curl -X POST http://134.199.241.75:3000/api/v1/jwt-auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@progrc.com",
    "password": "adminadmin"
  }'
```

## Fixing Database Permissions

**IMPORTANT**: Before you can login, you need to fix database permissions. See `k8s/FIX_DATABASE_PERMISSIONS.md` for detailed instructions.

### Quick Fix (if you have database admin access):

1. Connect to your DigitalOcean managed database
2. Run these SQL commands:

```sql
GRANT ALL PRIVILEGES ON SCHEMA public TO progrc;
GRANT ALL PRIVILEGES ON DATABASE progrc_bff_dev TO progrc;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO progrc;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO progrc;
```

3. Re-run migrations:
```bash
kubectl delete job -n progrc-dev run-migrations
kubectl apply -f k8s/jobs/run-migrations.yaml
```

4. Wait for migrations to complete:
```bash
kubectl logs -n progrc-dev -l job-name=run-migrations -f
```

5. Restart backend:
```bash
kubectl rollout restart deployment/progrc-backend -n progrc-dev
```

## Frontend Deployment

Once database is set up, you can deploy the frontend:

1. Build frontend (if not already built):
```bash
cd /Users/corneliushatchett/Downloads/PRO\ GRC/frontend-app-main
VITE_API_URL=http://134.199.241.75:3000/api/v1 yarn build
```

2. Deploy frontend to Kubernetes (or use the LoadBalancer service)

## Testing Access

### 1. Test API Health
```bash
curl http://134.199.241.75:3000/api/v1/health
```

### 2. Test Login (after database setup)
```bash
curl -X POST http://134.199.241.75:3000/api/v1/jwt-auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@progrc.com","password":"adminadmin"}'
```

### 3. Use JWT Token
After successful login, you'll receive a JWT token. Use it in subsequent requests:

```bash
curl http://134.199.241.75:3000/api/v1/app \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Next Steps

1. ✅ Fix database permissions (see `k8s/FIX_DATABASE_PERMISSIONS.md`)
2. ✅ Run migrations successfully
3. ✅ Test login with admin credentials
4. ⏳ Deploy frontend (optional)
5. ⏳ Configure domain name (optional)

## Troubleshooting

### "relation does not exist" error
- Database tables haven't been created yet
- Fix permissions and re-run migrations

### "permission denied for schema public"
- Database user lacks CREATE permissions
- See `k8s/FIX_DATABASE_PERMISSIONS.md`

### Cannot connect to database
- Check database credentials in secret: `kubectl get secret -n progrc-dev progrc-bff-db-credentials -o yaml`
- Verify database is accessible from Kubernetes cluster



