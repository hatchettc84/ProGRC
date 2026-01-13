# Vercel Deployment Checklist

## Pre-Deployment Steps

### 1. Verify Git Repository Connection

✅ **Current Repository**: `https://github.com/hatchettc84/ProGRC.git`

To verify:
```bash
git remote -v
```

Should show:
```
origin  https://github.com/hatchettc84/ProGRC.git (fetch)
origin  https://github.com/hatchettc84/ProGRC.git (push)
```

### 2. Commit and Push Changes

Before deploying to Vercel, commit all changes:

```bash
# Check status
git status

# Add all new files
git add .

# Commit changes
git commit -m "Add Vercel deployment configuration and API endpoints"

# Push to GitHub
git push origin main
```

### 3. Verify Required Files Exist

✅ Check that these files exist:
- [x] `vercel.json` - Vercel configuration
- [x] `api/run-check.py` - Main API endpoint
- [x] `api/health.py` - Health check endpoint
- [x] `requirements.txt` - Python dependencies
- [x] `.vercelignore` - Files to exclude from deployment

## Vercel Deployment Steps

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/new
   - Sign in with GitHub

2. **Import Repository**
   - Click "Import Git Repository"
   - Search for: `hatchettc84/ProGRC`
   - Click "Import"

3. **Configure Project**
   - **Framework Preset**: Select "Other" or leave as auto-detected
   - **Root Directory**: `./` (default)
   - **Build Command**: Leave empty (Vercel auto-detects Python)
   - **Output Directory**: Leave empty
   - **Install Command**: Leave empty (uses `requirements.txt` automatically)

4. **Environment Variables** (Optional)
   - Click "Environment Variables"
   - Add if needed:
     - `AWS_ACCESS_KEY_ID` (optional - can pass in request)
     - `AWS_SECRET_ACCESS_KEY` (optional - can pass in request)
     - `AWS_SESSION_TOKEN` (optional - for temporary credentials)

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (~2-5 minutes)

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```
   
   Follow prompts:
   - Link to existing project? No (first time)
   - Project name: `progrc` (or your preferred name)
   - Directory: `./`
   - Override settings? No

4. **Set Environment Variables** (if needed)
   ```bash
   vercel env add AWS_ACCESS_KEY_ID
   vercel env add AWS_SECRET_ACCESS_KEY
   ```

## Post-Deployment Verification

### 1. Test Health Endpoint

```bash
curl https://your-project-name.vercel.app/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "AWS Compliance Checker",
  "version": "2.0"
}
```

### 2. Test Compliance Check Endpoint

```bash
curl -X POST https://your-project-name.vercel.app/api/run-check \
  -H "Content-Type: application/json" \
  -d '{
    "access_key": "YOUR_ACCESS_KEY",
    "secret_key": "YOUR_SECRET_KEY",
    "region": "us-east-1",
    "format": "json",
    "all_regions": false,
    "workers": 5
  }'
```

### 3. Check Vercel Dashboard

- Go to your project dashboard
- Check "Functions" tab for API endpoints
- Review "Logs" for any errors
- Monitor "Analytics" for usage

## Troubleshooting

### Build Fails

1. **Check Logs**: Go to Vercel Dashboard > Deployments > Click failed deployment > View logs
2. **Common Issues**:
   - Missing dependencies in `requirements.txt`
   - Python version mismatch
   - Import errors

### Function Timeout

- **Free Tier**: 10-second limit
- **Solution**: 
  - Reduce `workers` parameter
  - Set `all_regions: false`
  - Use `severity` filter
  - Upgrade to Pro tier (60-second limit)

### API Returns 500 Error

1. Check function logs in Vercel dashboard
2. Verify AWS credentials are correct
3. Check IAM permissions
4. Test with minimal request first

## Continuous Deployment

Vercel automatically deploys on every push to `main` branch:

1. Make changes locally
2. Commit and push to GitHub
3. Vercel automatically builds and deploys
4. Check deployment status in Vercel dashboard

## Production Checklist

- [ ] Set up custom domain (optional)
- [ ] Configure environment variables for production
- [ ] Set up monitoring/alerts
- [ ] Review security settings
- [ ] Test all API endpoints
- [ ] Document API usage for team
- [ ] Set up rate limiting (if needed)

## Useful Commands

```bash
# Check deployment status
vercel ls

# View logs
vercel logs

# Remove deployment
vercel remove

# Link local project to Vercel
vercel link
```

## Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Python Runtime**: https://vercel.com/docs/runtimes/python
- **API Reference**: See `README_VERCEL.md`
- **Project Repository**: https://github.com/hatchettc84/ProGRC

