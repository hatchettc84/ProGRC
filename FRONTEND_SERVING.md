# Frontend Serving Configuration

This document explains how the ProGRC BFF service serves the frontend application from S3.

## Overview

The frontend is served from the S3 bucket `s3://progrc-app-frontend-dev/build_assets/` and is accessible at the root path of the API server (e.g., `http://api-server.com/`).

## Configuration

### Environment Variables

The following environment variables control the frontend serving:

- `FRONTEND_S3_BUCKET`: S3 bucket name (default: `progrc-app-frontend-dev`)
- `FRONTEND_S3_BASE_PATH`: Base path within the bucket (default: `build_assets`)
- `AWS_S3_REGION`: AWS region for S3 (default: `us-east-1`)

### Example Configuration

```bash
FRONTEND_S3_BUCKET=progrc-app-frontend-dev
FRONTEND_S3_BASE_PATH=build_assets
AWS_S3_REGION=us-east-1
```

## How It Works

### 1. Static Asset Serving

The service automatically detects and serves static assets (CSS, JS, images, fonts, etc.) from S3:

- **CSS files**: `*.css` - Cached for 1 year
- **JavaScript files**: `*.js` - Cached for 1 year  
- **Images**: `*.png`, `*.jpg`, `*.svg`, `*.ico` - Cached for 1 day
- **Fonts**: `*.woff`, `*.woff2`, `*.ttf` - Cached for 1 hour
- **Other assets**: Cached for 1 hour

### 2. SPA Routing

For non-static asset requests (routes without file extensions), the service serves `index.html` to enable client-side routing:

- `/` → serves `index.html`
- `/dashboard` → serves `index.html` (SPA route)
- `/users/123` → serves `index.html` (SPA route)
- `/api/v1/users` → API route (not affected)

### 3. API Route Protection

API routes starting with `/api/` are protected and will return 404 if not found, preventing them from falling back to the frontend.

## File Structure in S3

Expected structure in the S3 bucket:

```
s3://progrc-app-frontend-dev/build_assets/
├── index.html
├── static/
│   ├── css/
│   ├── js/
│   ├── images/
│   └── fonts/
├── manifest.json
├── robots.txt
└── favicon.ico
```

## Health Check

A health check endpoint is available at `/health/frontend` to verify S3 connectivity and frontend availability.

## Error Handling

- If a static asset is not found in S3, returns 404
- If `index.html` is not found, returns 404 with "Frontend not available" message
- If S3 is unreachable, logs error and returns appropriate error response

## Caching Strategy

- **HTML files**: 1 hour cache (for SPA updates)
- **CSS/JS files**: 1 year cache (with versioning)
- **Images**: 1 day cache
- **Other assets**: 1 hour cache

## Testing

To test the frontend serving:

1. Ensure your frontend build is uploaded to S3
2. Start the API server
3. Visit `http://localhost:3000/` (or your server URL)
4. Test SPA navigation by visiting different routes
5. Check static assets are loading correctly

## Troubleshooting

### Common Issues

1. **Frontend not loading**: Check S3 bucket and path configuration
2. **Static assets 404**: Verify files exist in S3 with correct paths
3. **SPA routing not working**: Ensure `index.html` is being served for non-asset routes
4. **CORS issues**: Check CORS configuration in main.ts

### Debug Endpoints

- `/health/frontend` - Check frontend service health
- Check server logs for S3 connection errors 