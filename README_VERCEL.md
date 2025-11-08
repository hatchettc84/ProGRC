# Vercel Deployment Guide

This guide explains how to deploy the AWS NIST Compliance Checker to Vercel as a serverless API.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com) (free tier works)
2. **AWS Credentials**: Access key and secret key for AWS account to check
3. **Vercel CLI** (optional): For command-line deployment

## Quick Start

### Option 1: Deploy via Vercel Dashboard

1. **Connect Repository**:
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository: `https://github.com/hatchettc84/ProGRC.git`
   - Vercel will auto-detect Python settings

2. **Configure Project**:
   - Framework Preset: Other
   - Root Directory: `./` (default)
   - Build Command: Leave empty (Vercel handles Python automatically)
   - Output Directory: Leave empty

3. **Set Environment Variables** (optional):
   - Go to Project Settings > Environment Variables
   - Add `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` if you want to use env vars instead of passing credentials in requests

4. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete

### Option 2: Deploy via CLI

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

4. **Set Environment Variables** (optional):
   ```bash
   vercel env add AWS_ACCESS_KEY_ID
   vercel env add AWS_SECRET_ACCESS_KEY
   ```

## Environment Variables

Set these in Vercel dashboard under **Project Settings > Environment Variables**:

| Variable | Required | Description |
|----------|----------|-------------|
| `AWS_ACCESS_KEY_ID` | Optional | AWS access key (can be passed in request body) |
| `AWS_SECRET_ACCESS_KEY` | Optional | AWS secret key (can be passed in request body) |
| `AWS_SESSION_TOKEN` | Optional | Temporary session token (for temporary credentials) |

**Security Note**: For production, prefer passing credentials in request body rather than environment variables, as env vars are visible in Vercel dashboard.

## API Usage

### Base URL

After deployment, your API will be available at:
```
https://your-project-name.vercel.app/api/
```

### Endpoints

#### 1. Health Check

**GET** `/api/health`

Check if the API is running.

**Example**:
```bash
curl https://your-project.vercel.app/api/health
```

**Response**:
```json
{
  "status": "healthy",
  "service": "AWS Compliance Checker",
  "version": "2.0"
}
```

#### 2. Run Compliance Check

**POST** `/api/run-check`

Run compliance checks against AWS account.

**Request Body**:
```json
{
  "access_key": "AKIAIOSFODNN7EXAMPLE",
  "secret_key": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
  "session_token": "optional-temporary-token",
  "region": "us-east-1",
  "format": "json",
  "checks": [],
  "skip_checks": [],
  "severity": null,
  "all_regions": true,
  "workers": 10,
  "parallel": true
}
```

**Parameters**:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `access_key` | string | Required* | AWS Access Key ID |
| `secret_key` | string | Required* | AWS Secret Access Key |
| `session_token` | string | Optional | AWS Session Token (for temporary credentials) |
| `region` | string | `us-east-1` | AWS region to check |
| `format` | string | `json` | Report format: `json`, `csv`, `nist-53`, `nist-171`, `multi-framework`, `all` |
| `checks` | array | `[]` | Specific check IDs to run (empty = all checks) |
| `skip_checks` | array | `[]` | Check IDs to skip |
| `severity` | string | `null` | Minimum severity: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` |
| `all_regions` | boolean | `true` | Check all regions or just specified region |
| `workers` | number | `10` | Number of parallel workers |
| `parallel` | boolean | `true` | Enable parallel execution |

*Required if not set as environment variables

**Example Request**:
```bash
curl -X POST https://your-project.vercel.app/api/run-check \
  -H "Content-Type: application/json" \
  -d '{
    "access_key": "AKIAIOSFODNN7EXAMPLE",
    "secret_key": "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
    "region": "us-east-1",
    "format": "json",
    "all_regions": false,
    "workers": 5
  }'
```

**Response**:
```json
{
  "account_id": "123456789012",
  "timestamp": "2024-01-15T10:30:00Z",
  "execution_time_seconds": 45.2,
  "summary": {
    "total_checks": 160,
    "passed": 120,
    "failed": 35,
    "errors": 5,
    "pass_percentage": 75.0
  },
  "results": [
    {
      "check_id": "CHECK-001",
      "check_name": "IAM Root Account Usage",
      "status": "PASS",
      "severity": "CRITICAL",
      "findings": [],
      "affected_resources": []
    },
    ...
  ],
  "csv_report": "...",  // If format includes 'csv' or 'all'
  "nist_800_53_report": "...",  // If format includes 'nist-53' or 'all'
  "nist_800_171_report": "...",  // If format includes 'nist-171' or 'all'
  "cross_framework_matrix": "..."  // If format includes 'multi-framework' or 'all'
}
```

### Format Options

- **`json`**: Returns results as JSON (default)
- **`csv`**: Includes CSV report in `csv_report` field
- **`nist-53`**: Includes NIST 800-53 markdown report in `nist_800_53_report` field
- **`nist-171`**: Includes NIST 800-171 markdown report in `nist_800_171_report` field
- **`multi-framework`**: Includes cross-framework matrix CSV in `cross_framework_matrix` field
- **`all`**: Includes all report formats

## Limitations

### Timeout Limits

- **Free Tier**: 10 seconds maximum execution time
- **Pro Tier**: 60 seconds maximum execution time
- **Enterprise**: Up to 300 seconds (5 minutes)

**Recommendations**:
- For free tier, limit checks to specific regions or use `skip_checks` to reduce execution time
- Use `workers: 5` or lower for faster execution
- Set `all_regions: false` to check single region only
- Use `severity: "HIGH"` to run only high-priority checks

### Memory Limits

- **Free Tier**: 1024 MB
- **Pro Tier**: 1024 MB (can be increased)
- **Enterprise**: Up to 3008 MB

### File System

- Vercel functions use an **ephemeral filesystem**
- Reports are returned as strings in JSON response, not saved to disk
- No persistent storage available

## Example Use Cases

### 1. Quick Health Check

```bash
# Check specific high-severity issues in single region
curl -X POST https://your-project.vercel.app/api/run-check \
  -H "Content-Type: application/json" \
  -d '{
    "access_key": "YOUR_KEY",
    "secret_key": "YOUR_SECRET",
    "region": "us-east-1",
    "severity": "HIGH",
    "all_regions": false,
    "workers": 5
  }'
```

### 2. Full Compliance Report

```bash
# Generate all report formats
curl -X POST https://your-project.vercel.app/api/run-check \
  -H "Content-Type: application/json" \
  -d '{
    "access_key": "YOUR_KEY",
    "secret_key": "YOUR_SECRET",
    "format": "all",
    "all_regions": true,
    "workers": 10
  }'
```

### 3. Specific Checks Only

```bash
# Run only IAM-related checks
curl -X POST https://your-project.vercel.app/api/run-check \
  -H "Content-Type: application/json" \
  -d '{
    "access_key": "YOUR_KEY",
    "secret_key": "YOUR_SECRET",
    "checks": ["CHECK-001", "CHECK-002", "CHECK-009", "CHECK-010"],
    "format": "json"
  }'
```

### 4. Using Environment Variables

If you set `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` as environment variables:

```bash
curl -X POST https://your-project.vercel.app/api/run-check \
  -H "Content-Type: application/json" \
  -d '{
    "region": "us-east-1",
    "format": "json"
  }'
```

## Security Best Practices

1. **Never commit AWS credentials** to git
2. **Use temporary session tokens** when possible (set `session_token` in request)
3. **Rotate credentials regularly**
4. **Use IAM roles** with least-privilege permissions
5. **Enable MFA** for AWS accounts
6. **Monitor API usage** in Vercel dashboard
7. **Use HTTPS only** (Vercel provides SSL by default)

## Troubleshooting

### Error: "Function execution timeout"

**Solution**: 
- Reduce `workers` parameter
- Set `all_regions: false`
- Use `severity` filter to run fewer checks
- Upgrade to Vercel Pro for 60-second timeout

### Error: "Failed to connect to AWS"

**Solution**:
- Verify credentials are correct
- Check IAM permissions (see `docs/setup/IAM_PERMISSIONS_REQUIRED.md`)
- Ensure credentials haven't expired
- Check if region is valid

### Error: "Module not found"

**Solution**:
- Ensure `requirements.txt` includes all dependencies
- Check that all Python files are in correct directories
- Verify `vercel.json` configuration is correct

### Error: "Memory limit exceeded"

**Solution**:
- Reduce `workers` parameter
- Set `all_regions: false`
- Use `skip_checks` to exclude resource-intensive checks
- Upgrade to Vercel Pro/Enterprise for more memory

## Monitoring

### Vercel Dashboard

- View function logs: **Project > Functions > Select Function > Logs**
- Monitor execution time and memory usage
- View error rates and success metrics

### API Response Codes

- `200`: Success
- `400`: Bad request (missing credentials or invalid parameters)
- `405`: Method not allowed (use POST for run-check)
- `500`: Internal server error (check logs for details)

## Cost Considerations

### Vercel Pricing

- **Free Tier**: 
  - 100GB bandwidth/month
  - 100 hours execution time/month
  - 10-second function timeout
  
- **Pro Tier** ($20/month):
  - Unlimited bandwidth
  - 1000 hours execution time/month
  - 60-second function timeout
  - Better performance

### AWS API Costs

- Compliance checks make **read-only** API calls
- Typical scan: ~500-2000 API calls
- AWS charges per API call (varies by service)
- Estimate: $0.01-$0.10 per full scan

## Next Steps

1. **Deploy** your application to Vercel
2. **Test** with health check endpoint
3. **Run** a small compliance check to verify
4. **Monitor** logs and performance
5. **Optimize** based on timeout/memory constraints

For more information, see the main [README.md](README.md) file.

