# ProGRC Platform - Quick Start Guide

**Goal**: Get the platform running locally or on a VPS in 15-30 minutes.

## Prerequisites

- Docker and Docker Compose installed
- 4GB RAM minimum
- Ports 3000, 5432, 6379 available

## Step 1: Clone and Setup

```bash
# Navigate to backend directory
cd bff-service-backend-dev
```

## Step 2: Generate JWT Keys

```bash
# Install Node.js if needed
# macOS: brew install node
# Linux: curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && apt install -y nodejs

# Generate keys (creates .env file with JWT keys)
node scripts/generate-jwt-keys.js
```

This creates a `.env` file with JWT keys.

## Step 3: Configure Environment

```bash
# Copy sample environment
cp env.sample .env

# Edit .env with your settings
nano .env  # or use your preferred editor
```

**Minimum required changes**:
```bash
POSTGRES_PASSWORD=your_secure_password_here
POSTGRES_DATABASE=progrcdb
```

The JWT keys are already generated from Step 2.

## Step 4: Start Services

```bash
# Build and start all services
docker-compose up -d

# Watch logs
docker-compose logs -f
```

**Expected output**: All containers should start successfully.

## Step 5: Verify Deployment

```bash
# Check container status
docker-compose ps

# Test health endpoint
curl http://localhost:3000/api/v1/health

# Expected response: {"status":"ok"}
```

## Step 6: Access the Application

- **Backend API**: http://localhost:3000
- **API Health**: http://localhost:3000/api/v1/health
- **Swagger Docs**: http://localhost:3000/api/v1/docs (if enabled)

## Step 7: Test Admin User (For Testing Only)

A test admin user is automatically created when migrations run:

- **Email**: `admin@progrc.com`
- **Password**: `adminadmin`
- **Role**: SuperAdmin

⚠️ **WARNING**: This is for **testing only**. Remove before production deployment.

**Important**: After running migrations, restart Docker containers to ensure the user is available:
```bash
docker-compose restart
```

See [TEST_ADMIN_USER.md](TEST_ADMIN_USER.md) for details.

## Database Migrations

Migrations run automatically on container startup. To run manually:

```bash
docker-compose exec app npm run migration:up
```

## Troubleshooting

### Containers won't start
```bash
# Check logs
docker-compose logs

# Restart services
docker-compose restart
```

### Database connection errors
```bash
# Verify database is running
docker-compose ps postgres

# Check database logs
docker-compose logs postgres
```

### Port already in use
```bash
# Find process using port
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Stop conflicting service or change port in docker-compose.yml
```

## Next Steps

- **For Production**: See [VPS Deployment Guide](DEPLOYMENT_VPS.md) or [AWS Deployment Guide](DEPLOYMENT_AWS.md)
- **For Development**: Continue using docker-compose, see development docs
- **For Testing**: Run test suite: `docker-compose exec app npm test`

## Stopping Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ deletes data)
docker-compose down -v
```

---

**Time to Production**: ~15-30 minutes for local setup  
**Next**: Configure SSL, domain, and production settings for VPS deployment

