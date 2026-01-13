# Frontend Troubleshooting Guide

## Current Status
- ✅ Frontend build deployed to `/var/www/progrc/`
- ✅ Nginx configured and serving static files
- ✅ Backend API accessible at `/api/v1`
- ✅ CORS configured to allow requests from `http://168.231.70.205`
- ✅ Assets (JS/CSS) loading correctly (200 status)

## If You See a Blank Page

### 1. Check Browser Console
Open your browser's developer tools (F12) and check the Console tab for JavaScript errors.

### 2. Check Network Tab
In the Network tab, verify:
- All assets are loading (status 200)
- API calls are being made to `/api/v1/...`
- No CORS errors

### 3. Common Issues

#### Issue: JavaScript Errors
**Solution**: Check the browser console for specific error messages. Common errors:
- `Cannot read property 'X' of undefined` - Usually a configuration issue
- `Failed to fetch` - Network/CORS issue
- `Module not found` - Asset loading issue

#### Issue: API Not Responding
**Test**: Open `http://168.231.70.205/api/v1/app/metadata` in your browser
- Should return JSON data
- If 502/503, backend might be down

#### Issue: CORS Errors
**Test**: Check browser console for CORS errors
- Should see `Access-Control-Allow-Origin: http://168.231.70.205` in response headers
- If not, backend CORS might need updating

### 4. Quick Tests

```bash
# Test frontend HTML
curl http://168.231.70.205/

# Test API
curl http://168.231.70.205/api/v1/app/metadata

# Test JavaScript asset
curl -I http://168.231.70.205/assets/index-B2PhZfDs.js

# Test CSS asset
curl -I http://168.231.70.205/assets/index-DLP5HTUs.css
```

### 5. Verify Configuration

The frontend is configured with:
- **API URL**: `/api/v1` (relative, uses Nginx proxy)
- **Base URL**: `http://168.231.70.205`

### 6. Check Logs

```bash
# Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Backend logs
cd /opt/progrc/bff-service-backend-dev
docker-compose logs app -f
```

### 7. Rebuild and Redeploy

If needed, rebuild and redeploy:

```bash
# On your local machine
cd /Users/corneliushatchett/Downloads/PRO\ GRC/frontend-app-main
VITE_API_URL=/api/v1 yarn build

# Deploy
cd /Users/corneliushatchett/Downloads/PRO\ GRC/bff-service-backend-dev
./deploy-frontend.sh
```

## Expected Behavior

When you visit `http://168.231.70.205`:
1. HTML loads with React app
2. JavaScript bundle loads (`/assets/index-B2PhZfDs.js`)
3. CSS loads (`/assets/index-DLP5HTUs.css`)
4. App initializes and makes API calls to `/api/v1/...`
5. If not authenticated, should redirect to `/auth/login`
6. If authenticated, should show dashboard

## Still Having Issues?

1. **Clear browser cache** (Ctrl+Shift+Delete or Cmd+Shift+Delete)
2. **Try incognito/private mode**
3. **Check browser console for specific errors**
4. **Verify backend is running**: `docker-compose ps` on VPS
5. **Check Nginx is running**: `systemctl status nginx` on VPS

