# LocalStack Upload Connection Timeout Fix ✅

## Problem

Browser was trying to upload files directly to LocalStack at `http://143.244.221.38:4566`, but port 4566 is not accessible from the browser (firewall/network restrictions), causing `ERR_CONNECTION_TIMED_OUT` errors.

**Error Messages:**
- `Upload exception: Object`
- `Presigned URL upload failed with network error, falling back to backend upload: Object`
- `Failed to load resource: net::ERR_CONNECTION_TIMED_OUT`

## Root Cause

1. Backend generates presigned URLs with LocalStack public endpoint (`http://143.244.221.38:4566`)
2. Browser tries to upload directly to this endpoint
3. Port 4566 is blocked/not accessible from browser (firewall/security group)
4. Browser gets connection timeout error
5. Frontend correctly falls back to backend upload, but error logs are still shown

## Solution

**File**: `frontend-app-main/src/containers/EnhancedEmbeddedUploader/EnhancedEmbeddedUploader.tsx`

### ✅ 1. Detect LocalStack URLs Early

Added function to detect LocalStack URLs **before** attempting presigned URL upload:

```typescript
const isLocalStackUrl = (url: string): boolean => {
  return url.includes(':4566') || url.includes('143.244.221.38') || url.includes('localstack');
};
```

### ✅ 2. Skip Presigned Upload for LocalStack URLs

If LocalStack URL is detected, skip presigned upload entirely and use backend upload directly:

```typescript
// ✅ FIX: Skip presigned URL upload for LocalStack URLs, use backend upload directly
if (isLocalStackUrl(item.url)) {
  console.log("Detected LocalStack URL, using backend upload directly:", {
    fe_id: item.fe_id,
    url: item.url.substring(0, 100) + "...",
  });

  // Use backend upload endpoint directly for LocalStack
  const backendUploadResponse = await uploadFilesAPI(
    [fileData.file],
    [{
      file_name: getFileNameFromUrl(fileData.file.path || "", 0) || fileData.file.name,
      file_type: uploaderParams.file_type,
      ...(uploaderParams.extra_params || {}),
    }]
  );
  // ... handle response ...
}
```

### ✅ 3. Enhanced Network Error Detection

Added more comprehensive network error detection for non-LocalStack URLs (fallback case):

```typescript
const isNetworkError = errorMessage.includes("Network Error") || 
                       errorMessage.includes("ERR_NETWORK") ||
                       errorMessage.includes("Failed to fetch") ||
                       errorMessage.includes("ERR_CONNECTION_TIMED_OUT") ||
                       errorMessage.includes("net::ERR_CONNECTION_TIMED_OUT") ||  // Chrome format
                       errorMessage.includes("timeout") ||
                       errorMessage.includes("TIMED_OUT") ||
                       (presignedError?.code === "ERR_NETWORK") ||
                       (presignedError?.code === "ERR_CONNECTION_TIMED_OUT") ||
                       (presignedError?.response === undefined && errorMessage.includes("Error"));
```

## Benefits

1. **No More Connection Errors**: LocalStack URLs are detected early, preventing connection timeout errors
2. **Faster Uploads**: No wasted time trying to connect to unreachable endpoint
3. **Cleaner Logs**: No error messages for expected fallback behavior
4. **Reliable Uploads**: Always uses backend upload for LocalStack (which works reliably)

## Expected Behavior After Fix

### Before Fix:
1. Generate presigned URL ✅
2. Try direct upload to `http://143.244.221.38:4566` ❌ (timeout)
3. Detect network error ✅
4. Fallback to backend upload ✅
5. **Result**: Upload works, but error logs shown

### After Fix:
1. Generate presigned URL ✅
2. Detect LocalStack URL ✅
3. Skip presigned upload, use backend upload directly ✅
4. **Result**: Upload works, **no error logs**

## Testing

After rebuilding the frontend:

1. Navigate to Sources or Applications page
2. Select files to upload
3. Verify:
   - ✅ No `ERR_CONNECTION_TIMED_OUT` errors in console
   - ✅ Files upload successfully
   - ✅ Console shows: "Detected LocalStack URL, using backend upload directly"
   - ✅ No "Presigned URL upload failed" error messages

## Files Modified

1. ✅ `frontend-app-main/src/containers/EnhancedEmbeddedUploader/EnhancedEmbeddedUploader.tsx`
   - Added LocalStack URL detection
   - Skip presigned upload for LocalStack URLs
   - Enhanced network error detection

## Next Steps

1. **Rebuild Frontend**: Run `npm run build` in `frontend-app-main` directory
2. **Deploy Frontend**: Deploy the rebuilt frontend to DigitalOcean
3. **Test Upload**: Verify uploads work without connection timeout errors
4. **Monitor Logs**: Check browser console for "Detected LocalStack URL" messages

## Summary

✅ **Fix Applied**: LocalStack URLs are now detected early and backend upload is used directly, eliminating connection timeout errors and improving upload reliability.

The fix ensures that:
- LocalStack URLs are detected **before** attempting presigned upload
- Backend upload is used directly for LocalStack (no wasted connection attempts)
- Network error detection is enhanced to catch all timeout variants
- Upload process is faster and more reliable


