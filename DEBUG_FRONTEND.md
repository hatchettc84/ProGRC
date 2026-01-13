# Frontend Debugging Guide

## Current Issue: White Screen

The frontend is showing a white screen, which typically means:
1. JavaScript is failing to execute
2. React app is not mounting
3. There's a runtime error preventing rendering

## What We've Fixed

1. ✅ CSS class typo (`v-screen` → `w-screen`)
2. ✅ State management when no token exists
3. ✅ Added error boundaries and error handling
4. ✅ Added router null checks
5. ✅ Improved error messages

## How to Debug

### Step 1: Open Browser Developer Tools
1. Press **F12** or right-click → **Inspect**
2. Go to the **Console** tab
3. Look for any red error messages

### Step 2: Check Network Tab
1. In Developer Tools, go to **Network** tab
2. Refresh the page (F5)
3. Check if all files load:
   - `index.html` → Should be 200
   - `index-*.js` → Should be 200
   - `index-*.css` → Should be 200
   - Any API calls → Check their status

### Step 3: Check for Specific Errors

Common errors to look for:

#### Error: "Cannot read property 'X' of undefined"
- **Cause**: Something is trying to access a property that doesn't exist
- **Solution**: Check the console for the exact line number

#### Error: "Failed to fetch" or CORS errors
- **Cause**: API calls are being blocked
- **Solution**: Check if `/api/v1/` endpoints are accessible

#### Error: "Router not found" or "Route not found"
- **Cause**: Router configuration issue
- **Solution**: Check if routes are properly defined

#### No errors but still white screen
- **Cause**: App might be stuck in loading state
- **Solution**: Check if `isInitialLoading` is stuck at `true`

## Quick Tests

### Test 1: Check if HTML loads
```bash
curl http://168.231.70.205/
```
Should return HTML with `<div id="root"></div>`

### Test 2: Check if JS loads
```bash
curl -I http://168.231.70.205/assets/index-*.js
```
Should return `200 OK`

### Test 3: Check if API works
```bash
curl http://168.231.70.205/api/v1/app/metadata
```
Should return JSON data

## Manual Debug Steps

1. **Clear browser cache completely**
   - Chrome: Settings → Privacy → Clear browsing data → All time
   - Or use Incognito mode

2. **Check browser console**
   - Open DevTools (F12)
   - Look for errors in Console tab
   - Check Network tab for failed requests

3. **Test in different browser**
   - Try Chrome, Firefox, or Safari
   - See if issue is browser-specific

4. **Check if JavaScript is enabled**
   - Some browsers/extensions block JavaScript
   - Make sure JavaScript is enabled

## What to Report

If the issue persists, please provide:
1. **Browser console errors** (screenshot or copy-paste)
2. **Network tab** - list of failed requests
3. **Browser and version** (e.g., Chrome 120)
4. **Any error messages** you see

## Current Configuration

- **Frontend URL**: http://168.231.70.205
- **API URL**: http://168.231.70.205/api/v1
- **Build**: Latest with error handling fixes
- **Nginx**: Configured and running

## Next Steps

If you see specific errors in the console, share them and we can fix the root cause.

