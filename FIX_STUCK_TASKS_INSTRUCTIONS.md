# How to Fix Stuck Pending Tasks

## ⚠️ IMPORTANT: Run in Browser Console, NOT SSH Terminal!

The JavaScript code must be run in your **browser's developer console**, not in the SSH terminal.

## Step-by-Step Instructions

### 1. Open Your Browser
- Go to `http://168.231.70.205` (or your VPS URL)
- Make sure you're logged in

### 2. Open Browser Developer Console
- Press **F12** (or right-click → Inspect → Console tab)
- You should see a console window at the bottom

### 3. Copy and Paste This Code

```javascript
const token = localStorage.getItem('progrc_jwt_token');
if (!token) {
  console.error('❌ No token found. Please log in first.');
} else {
  fetch('/api/v1/async_task/fix-stuck-tasks?maxAgeHours=1', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  .then(r => r.json())
  .then(data => {
    console.log('✅ Response:', data);
    if (data.data && data.data.fixed > 0) {
      alert(`✅ Fixed ${data.data.fixed} stuck tasks! Please refresh the page.`);
    } else {
      alert('✅ No stuck tasks found. You can create sources now.');
    }
  })
  .catch(error => {
    console.error('❌ Error:', error);
    alert('Error fixing tasks. Check console for details.');
  });
}
```

### 4. Press Enter
- The code will run and show results in the console
- You'll see an alert with the number of fixed tasks

### 5. Refresh the Page
- After the fix completes, refresh the page (F5)
- Try creating a source again - it should work now!

## Alternative: Use cURL (if you have the JWT token)

If you have your JWT token, you can also use:

```bash
curl -X POST "http://168.231.70.205/api/v1/async_task/fix-stuck-tasks?maxAgeHours=1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

To get your JWT token:
1. Open browser console (F12)
2. Run: `localStorage.getItem('progrc_jwt_token')`
3. Copy the token value

## What This Does

- Finds all tasks with status `PENDING` or `IN_PROCESS` older than 1 hour
- Marks them as `FAILED` to unblock source creation
- Preserves task history (doesn't delete anything)

## Troubleshooting

**If you get "Unauthorized":**
- Make sure you're logged in
- Check that the token exists: `localStorage.getItem('progrc_jwt_token')`

**If you get "Forbidden":**
- Only SuperAdmin and OrgAdmin can use this endpoint
- Make sure you have the right permissions

**If tasks are still stuck:**
- Try increasing `maxAgeHours` to 0.5 (30 minutes) or 0.25 (15 minutes)
- Example: `?maxAgeHours=0.5`




