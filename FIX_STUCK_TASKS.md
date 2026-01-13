# Fix Stuck Pending Tasks

## Issue
You're getting the message: "You have a pending task. Please wait for it to complete before you can create a new source."

This happens when there are async tasks stuck in `PENDING` or `IN_PROCESS` status, blocking new source creation.

## Solution

### Option 1: Use the API Endpoint (Recommended)

Call the new endpoint to automatically fix stuck tasks:

```bash
# Fix all stuck tasks older than 1 hour
curl -X POST "http://168.231.70.205/api/v1/async_task/fix-stuck-tasks?maxAgeHours=1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Fix stuck tasks for a specific app
curl -X POST "http://168.231.70.205/api/v1/async_task/fix-stuck-tasks?appId=123&maxAgeHours=1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Parameters:**
- `appId` (optional): Fix tasks for a specific application only
- `maxAgeHours` (optional, default: 1): Only fix tasks older than this many hours

### Option 2: Use Browser Console

1. Open browser console (F12)
2. Get your JWT token:
   ```javascript
   const token = localStorage.getItem('progrc_jwt_token');
   ```
3. Call the API:
   ```javascript
   fetch('http://168.231.70.205/api/v1/async_task/fix-stuck-tasks?maxAgeHours=1', {
     method: 'POST',
     headers: {
       'Authorization': `Bearer ${token}`,
       'Content-Type': 'application/json'
     }
   })
   .then(r => r.json())
   .then(data => console.log('Fixed tasks:', data));
   ```

### Option 3: Check Pending Tasks First

Before fixing, check what tasks are stuck:

```bash
curl "http://168.231.70.205/api/v1/async_task/pendings?app_id=YOUR_APP_ID&type=CREATE_ASSETS" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## What the Fix Does

The `fixStuckPendingTasks` method:
1. Finds all tasks with status `PENDING` or `IN_PROCESS` older than the specified time (default: 1 hour)
2. Updates them to `FAILED` status
3. Updates the `updated_at` timestamp
4. Returns the list of fixed tasks

This unblocks source creation while preserving the task history.

## Prevention

There's already a cron job that runs every 2 hours to automatically fix stuck tasks. However, if you need immediate resolution, use the API endpoint above.

## Notes

- Only SuperAdmin and OrgAdmin can call this endpoint
- Tasks are marked as `FAILED`, not deleted, so you can still see them in the history
- The default age is 1 hour - tasks newer than this won't be fixed (to avoid interrupting legitimate processing)




