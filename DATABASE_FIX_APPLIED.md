# Database Naming Fix Applied ✅

## Summary

Fixed the issue where source creation was missing required database fields that were causing upload failures. The issue was introduced when database naming changes were made, and the source creation code wasn't updated to include all required fields.

## Problem

When creating a new source in `updateSourceDocuments`, the following required fields were missing:
- `summary` - Required JSON field
- `created_by` - Required field for tracking who created the source
- `updated_by` - Required field for tracking who last updated the source
- `is_active` - Has a default in DB but should be explicit (optional)

This caused database constraint violations when trying to save new sources.

## Fix Applied

### ✅ 1. Added Missing Required Fields

**File**: `src/app/fileUpload.service.ts`

**Changes**:
- Added `summary: {}` (required JSON field)
- Added `created_by: userId` (matches how sources are created in `sources.service.ts`)
- Added `updated_by: userId` (matches how sources are created in `sources.service.ts`)
- Added `userId` parameter to `updateSourceDocuments` method
- Updated method call to pass `userId` from the calling context

**Code Changes**:
```typescript
// Before: Missing required fields ❌
const source = this.sourceRepo.create({
  customer_id: org_id,
  app_id: app_id,
  source_type: sourceTypeId,
  name: fileName,
  file_bucket_key: fileKey,
  is_available: false,
  uuid: uuid,
  data: {},
  // Missing: summary, created_by, updated_by
});

// After: All required fields included ✅
const source = this.sourceRepo.create({
  customer_id: org_id,
  app_id: app_id,
  source_type: sourceTypeId,
  name: fileName,
  file_bucket_key: fileKey,
  is_available: false,
  uuid: uuid,
  data: {},
  summary: {}, // ✅ Added
  created_by: userId || '', // ✅ Added
  updated_by: userId || '', // ✅ Added
});
```

### ✅ 2. Updated Method Signature

**File**: `src/app/fileUpload.service.ts`

**Changes**:
- Added `userId?: string` parameter to `updateSourceDocuments` method
- Updated call site to pass `userId` from the authenticated user context

```typescript
// Method signature
private async updateSourceDocuments(
  org_id: string,
  app_id: number,
  sourceTypeId: number,
  uuid: string,
  fileName: string,
  fileKey: string,
  source_id?: number,
  isInternal?: boolean,
  version?: number,
  userId?: string // ✅ Added
): Promise<string>

// Call site
s3Response = await this.updateSourceDocuments(
  userInfo["tenant_id"],
  app_id,
  sourceType.id,
  uuid,
  fileRequest.file_name,
  keyName,
  source_id,
  isInternal,
  version,
  userId // ✅ Added - passes userId from authenticated user context
);
```

## Database Schema Reference

### Source Table (`source`)
Based on migrations and entity definition:

- `customer_id` - VARCHAR(255) NOT NULL
- `app_id` - INT8 NOT NULL
- `source_type` - INT4 NOT NULL
- `name` - VARCHAR
- `data` - JSON NOT NULL
- `summary` - JSON (required by entity, nullable in some migrations)
- `is_active` - BOOLEAN DEFAULT true NOT NULL
- `created_by` - UUID (nullable in DB, but should be set)
- `updated_by` - UUID (nullable in DB, but should be set)
- `current_version` - INT4 (nullable, set later after version creation)
- `file_bucket_key` - VARCHAR(255) nullable
- `is_available` - BOOLEAN nullable
- `uuid` - UUID nullable
- `is_deleted` - BOOLEAN DEFAULT false NOT NULL

## Comparison with Working Code

**Reference**: `src/sources/sources.service.ts` (line 510-523)

The fix matches how sources are created elsewhere in the codebase:
```typescript
const newSource = this.sourceRepov1.create({
  name: name,
  customer_id: orgId,
  source_type: srcTypeData.id,
  data: sourceDetails,
  created_at: new Date(),
  created_by: userInfo["userId"], // ✅ Matches our fix
  updated_by: userInfo["userId"], // ✅ Matches our fix
  updated_at: new Date(),
  app_id: appId,
  tags: tags,
  control_mapping: controlIds,
});
```

## Expected Results

- ✅ New sources created successfully without database constraint violations
- ✅ `created_by` and `updated_by` properly track who created/updated the source
- ✅ `summary` field present (required by entity definition)
- ✅ Upload component works as it did before database naming changes

## Testing

1. **Test Source Creation**:
   ```
   1. Navigate to Sources or Applications page
   2. Upload a new file (SOURCE_DOCUMENTS type)
   3. Verify source is created successfully in database
   4. Verify created_by and updated_by are set correctly
   ```

2. **Check Database**:
   ```sql
   SELECT id, name, created_by, updated_by, summary, is_active 
   FROM source 
   ORDER BY created_at DESC 
   LIMIT 5;
   ```

3. **Verify Logs**:
   ```bash
   kubectl logs -n progrc-dev deployment/progrc-backend --tail=100 | grep -i "source\|upload\|error"
   ```

## Files Modified

1. ✅ `src/app/fileUpload.service.ts` - Added required fields to source creation

## Next Steps

1. **Rebuild Backend**:
   ```bash
   ./rebuild-backend-complete.sh
   ```

2. **Test Upload Component**:
   - Upload a new file
   - Verify no database errors
   - Verify source is created correctly

3. **Monitor Logs**:
   - Check for any database constraint violations
   - Verify all fields are being set correctly

## Summary

✅ **Fix Applied**:
- Added missing required fields (`summary`, `created_by`, `updated_by`) to source creation
- Updated method signature to accept `userId` parameter
- Updated call site to pass `userId` from authenticated user context
- Matches how sources are created elsewhere in the codebase

The upload component should now work as it did before the database naming changes.


