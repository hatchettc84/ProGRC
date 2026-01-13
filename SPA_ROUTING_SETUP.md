# SPA Routing Setup for KOVR BFF Service

## Problem
The application was getting 404 errors when users tried to access client-side routes directly (e.g., `/dashboard`, `/users/123`, etc.) because the server wasn't configured to handle SPA (Single Page Application) routing.

## Solution
Implemented a comprehensive SPA routing solution using NestJS middleware and catch-all routes.

## Changes Made

### 1. FrontendRewriteMiddleware (`src/frontend/rewrite.middleware.ts`)
- **Purpose**: Rewrites non-asset and non-API requests to the root path (`/`)
- **Logic**: Checks if the request is for static assets, API endpoints, or health checks
- **Result**: Routes like `/dashboard` get rewritten to `/` before reaching the controller

### 2. Updated FrontendModule (`src/frontend/frontend.module.ts`)
- **Added**: `NestModule` interface implementation
- **Added**: Middleware configuration using `configure()` method
- **Applied**: `FrontendRewriteMiddleware` to all routes (`*`)

### 3. Updated FrontendController (`src/frontend/frontend.controller.ts`)
- **Added**: Catch-all route handler (`@All('*')`)
- **Purpose**: Serves `index.html` for any unmatched routes
- **Logic**: Checks if the request is for a static asset, if not, serves the SPA entry point

### 4. Updated SpaRoutingGuard (`src/guards/spa-routing.guard.ts`)
- **Simplified**: Removed redirect logic that was conflicting with middleware
- **Changed**: Now allows all requests to pass through
- **Reason**: Middleware handles URL rewriting, guard just logs requests

## How It Works

### Request Flow
1. **Request comes in**: `/dashboard`
2. **Middleware processes**: Rewrites URL to `/` if it's not an asset/API
3. **Guard allows**: Request passes through
4. **Controller handles**: 
   - If it's `/` → serves `index.html`
   - If it's a static asset → serves the asset
   - If it's anything else → catch-all route serves `index.html`

### URL Patterns Handled

#### ✅ Allowed (No Rewriting)
- `/assets/*` - Static assets
- `/static/*` - Static files
- `/css/*`, `/js/*`, `/images/*`, `/fonts/*` - Asset directories
- `/api/v1/*` - API endpoints
- `/api/*` - Other API routes
- `/health/*` - Health checks
- `/favicon.ico`, `/manifest.json`, `/robots.txt`, `/sitemap.xml` - Common files
- Files with extensions (e.g., `/main.js`, `/styles.css`)

#### 🔄 Rewritten to `/`
- `/dashboard` → `/`
- `/users/123` → `/`
- `/settings/profile` → `/`
- Any other client-side route

## Testing

### Manual Testing
1. Start the application: `npm run start:dev`
2. Test these URLs in your browser:
   - `http://localhost/dashboard` → Should serve index.html
   - `http://localhost/users/123` → Should serve index.html
   - `http://localhost/assets/main.js` → Should serve the actual file
   - `http://localhost/api/v1/users` → Should reach API endpoint

### Automated Testing
Run the test script: `node test-spa-routing.js`

## Configuration

### Environment Variables
- `FRONTEND_PORT`: Port for frontend service (default: 80)
- `FRONTEND_S3_BUCKET`: S3 bucket for frontend assets
- `FRONTEND_S3_BASE_PATH`: Base path in S3 bucket

### S3 Setup
The frontend assets should be uploaded to S3 with the following structure:
```
build_assets/
├── index.html
├── assets/
│   ├── main.js
│   └── styles.css
├── static/
└── ...
```

## Benefits

1. **SEO Friendly**: Direct URL access works
2. **Bookmarkable**: Users can bookmark any route
3. **Shareable**: URLs can be shared and work correctly
4. **Performance**: Static assets are properly cached
5. **Maintainable**: Clean separation of concerns

## Troubleshooting

### Common Issues

1. **404 on client routes**: Check if middleware is properly configured
2. **Static assets not loading**: Verify S3 bucket and path configuration
3. **API calls failing**: Ensure API routes are excluded from rewriting

### Debug Logging
The middleware and guard include console logging to help debug routing issues:
- `[SPA GUARD] Processing request: GET /dashboard`
- `[SPA GUARD] Allowing request: /dashboard`
- `[SPA] Serving SPA route: /dashboard`

## Future Enhancements

1. **Route-specific caching**: Different cache strategies for different route types
2. **Performance optimization**: Pre-compile route patterns
3. **Analytics**: Track which routes are being accessed
4. **Security**: Add rate limiting for SPA routes 