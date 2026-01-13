# Instant Scoring Debug Fix

## 🔍 **Problem Identified**

**Issue**: Instant scoring not executing when compliance update is triggered via `/resync` endpoint.

**Root Cause**: The request body might be:
1. Empty `{}`
2. Missing `standardIds` field
3. Using snake_case (`standard_ids`) that isn't being converted properly
4. The condition `if (standardIds && standardIds.length > 0)` is failing silently

## ✅ **Fix Applied**

**File**: `src/compliance/complianceV2.controller.ts`

**Changes**:
1. ✅ Added debug logging to see actual request body
2. ✅ Added fallback to handle `standard_ids` (snake_case) if `standardIds` is missing
3. ✅ Added logging to show `standardIds` value and length before the check

**Code Changes**:
```typescript
async syncComplianceForSubLevel(...) {
    // ✅ DEBUG: Log request body to diagnose instant scoring issue
    this.logger.log(`[RESYNC DEBUG] Request body: ${JSON.stringify(data)}`);
    
    let { standardIds, type, controlIds } = data;
    
    // ✅ FIX: Handle snake_case from frontend (standard_ids) or camelCase (standardIds)
    if (!standardIds && data && (data as any).standard_ids) {
        standardIds = (data as any).standard_ids;
        this.logger.log(`[RESYNC DEBUG] Converted standard_ids to standardIds: ${JSON.stringify(standardIds)}`);
    }
    
    this.logger.log(`[RESYNC DEBUG] standardIds: ${JSON.stringify(standardIds)}, length: ${standardIds?.length || 0}`);
    
    // ✅ OPTIMIZATION: Calculate instant scores first for immediate feedback
    if (standardIds && standardIds.length > 0) {
        // ... instant scoring code
    }
}
```

## 🎯 **What This Will Reveal**

When you run a compliance update again, the logs will show:
1. **Request Body**: What the frontend is actually sending
2. **standardIds Value**: Whether it's present and what it contains
3. **Conversion**: If snake_case conversion happened
4. **Execution**: Whether instant scoring actually runs

## 📝 **Next Steps**

1. **Deploy Complete**: ✅ Build and restart done
2. **Test Again**: Run a compliance update
3. **Check Logs**: Look for `[RESYNC DEBUG]` and `[INSTANT SCORING]` messages
4. **Verify**: Check if scores update immediately in the UI

## 🔍 **How to Check Logs**

```bash
# Watch logs in real-time
kubectl logs -f -n progrc-dev -l app=progrc-backend | grep -E "RESYNC DEBUG|INSTANT SCORING"

# Or check recent logs
kubectl logs -n progrc-dev -l app=progrc-backend --tail=100 | grep -E "RESYNC DEBUG|INSTANT SCORING"
```

## ⚠️ **Expected Behavior**

**If request body has `standardIds`**:
- ✅ Debug logs will show the value
- ✅ Instant scoring will execute
- ✅ Scores will update immediately

**If request body is empty or missing `standardIds`**:
- ⚠️ Debug logs will show empty/undefined
- ⚠️ Instant scoring will be skipped
- ⚠️ Only background LLM processing will run

---

**Status**: ✅ **Deployed** - Ready for testing
