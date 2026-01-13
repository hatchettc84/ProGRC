# Disabled Modules Investigation Report

**Date:** 2026-01-06
**Status:** Analysis Complete
**Modules Investigated:** QueueModule, FrontendModule, PrivateModule

---

## Executive Summary

Three modules are currently disabled in the ProGRC platform:
1. **QueueModule** - Background job processing (AWS SQS)
2. **FrontendModule** - Frontend static file serving
3. **PrivateModule** - Private/internal API endpoints

**Recommendation:**
- ✅ **QueueModule**: Re-enable with proper AWS SQS configuration
- ⚠️ **FrontendModule**: Keep disabled (frontend served by Nginx)
- ⚠️ **PrivateModule**: Investigate startup hang before re-enabling

---

## Module Analysis

### 1. QueueModule

**Location:** `/root/bff-service-backend-dev/src/queue/queue.module.ts`

**Status:** Disabled in `src/app/app.module.ts` line 182
```typescript
// QueueModule,  // TEMPORARILY DISABLED for initial setup
```

**Purpose:** Background job processing using AWS SQS queues

**Features:**
- App cloning (`AppCloneHandler`)
- Artifact processing (`ArtifactHandler`)
- Assessment generation (`AssessmentHandler`)
- Compliance sync (`ComplianceHandler`)
- Policy processing (`PolicyHandler`)
- PDF generation (`AssessmentPDFHandler`)

**Dependencies:**
- AWS SQS (Amazon Simple Queue Service)
- ApplicationModule, SourcesModule, AssessmentModule, ComplianceModule, PolicyModule

**Why Disabled:**
- Requires AWS SQS configuration (`AWS_SQS_ENABLED`, queue URLs)
- For local development, AWS SQS might not be available
- LocalStack can provide SQS emulation but needs setup

**Current Configuration (docker-compose.yml):**
```yaml
AWS_SQS_ENABLED: 'false'  # Currently disabled
AWS_SQS_ENDPOINT: http://localstack:4566
```

**Impact of Being Disabled:**
- ❌ Background jobs don't process
- ❌ Async operations like app cloning won't work
- ❌ PDF export for assessments won't work
- ❌ Compliance sync background jobs won't run

**Recommendation:** ✅ **RE-ENABLE**

**How to Re-enable:**

1. **Option A: Using LocalStack (Development)**
   ```yaml
   # In docker-compose.yml
   AWS_SQS_ENABLED: 'true'
   AWS_SQS_ENDPOINT: http://localstack:4566
   ```

   Then configure LocalStack to create SQS queues:
   ```bash
   # Add to init-localstack.sh
   awslocal sqs create-queue --queue-name app-clone-queue
   awslocal sqs create-queue --queue-name assessment-queue
   awslocal sqs create-queue --queue-name compliance-queue
   ```

2. **Option B: Using Real AWS SQS (Production)**
   ```yaml
   AWS_SQS_ENABLED: 'true'
   AWS_SQS_REGION: us-east-1
   SQS_COMPLIANCE_QUEUE_URL: https://sqs.us-east-1.amazonaws.com/xxx/compliance-queue
   # ... other queue URLs
   ```

3. **Re-enable in app.module.ts:**
   ```typescript
   import { QueueModule } from 'src/queue/queue.module';

   @Module({
     imports: [
       // ... other modules
       QueueModule,  // ✅ Re-enabled
     ]
   })
   ```

**Testing After Re-enable:**
```bash
# Check if queue services initialize
docker compose logs app | grep -i "queue"

# Test queue connection
curl http://localhost:3001/api/v1/health
```

---

### 2. FrontendModule

**Location:** `/root/bff-service-backend-dev/src/frontend/frontend.module.ts`

**Status:** Disabled in `src/app/app.module.ts` line 184
```typescript
// FrontendModule,  // TEMPORARILY DISABLED for initial setup
```

**Purpose:** Serve frontend static files and handle SPA routing

**Features:**
- Serves frontend build files
- SPA rewrite middleware for client-side routing
- Handles fallback to index.html for non-API routes

**Middleware:**
```typescript
configure(consumer: MiddlewareConsumer) {
  consumer
    .apply(FrontendRewriteMiddleware)
    .forRoutes('*');  // ⚠️ Applies to ALL routes
}
```

**Why Disabled:**
- ⚠️ **Middleware conflict**: `forRoutes('*')` would intercept ALL requests including API calls
- Frontend is served by Nginx (port 80) in production
- Backend API runs on different port (3001)
- Separation of concerns: API ≠ Static File Server

**Current Architecture:**
```
Nginx (Port 80)
├── / → Frontend static files
├── /api/ → Proxy to Backend (Port 3001)
└── /analytics/ → Proxy to Metabase (Port 3002)
```

**Impact of Being Disabled:**
- ✅ None - Frontend is served by Nginx
- ✅ API routes work correctly
- ✅ Clear separation of concerns

**Recommendation:** ⚠️ **KEEP DISABLED**

**Reasons:**
1. Frontend already served by Nginx (confirmed in nginx-progrc.conf)
2. Middleware would conflict with API routes
3. No benefit to serving frontend from NestJS backend
4. Better performance serving static files from Nginx

**Alternative (if needed):**
If you want NestJS to serve frontend:
1. Modify middleware to ONLY apply to non-API routes:
   ```typescript
   configure(consumer: MiddlewareConsumer) {
     consumer
       .apply(FrontendRewriteMiddleware)
       .exclude(
         { path: 'api/(.*)', method: RequestMethod.ALL },
         { path: 'api_docs/(.*)', method: RequestMethod.ALL }
       )
       .forRoutes('*');
   }
   ```

2. Move frontend build to `/dist/frontend/`
3. Update FrontendService to serve from correct path

**But:** This is NOT RECOMMENDED for production. Keep Nginx serving frontend.

---

### 3. PrivateModule

**Location:** `/root/bff-service-backend-dev/src/app-private/app-private.module.ts`

**Status:** Commented out in `src/main.ts` lines 372-392

**Comment:**
```typescript
// else if (initModule === 'Private') {
  // TEMPORARILY DISABLED: Private module causing startup hang
  // TODO: Debug PrivateModule initialization issue
```

**Purpose:** Internal/private API endpoints (likely for admin/internal tools)

**Why Disabled:**
- ⚠️ **Critical issue**: Causes application startup hang
- Blocks entire application from starting
- Root cause unknown

**Investigation Needed:**

1. **Check PrivateModule structure:**
   ```bash
   cat /root/bff-service-backend-dev/src/app-private/app-private.module.ts
   ```

2. **Common causes of startup hangs:**
   - Circular dependency between modules
   - Async operation in module constructor
   - Database connection timeout
   - Missing required environment variables
   - Infinite loop in provider initialization

3. **Debug steps:**
   ```bash
   # Enable debug logging
   NODE_ENV=development nest start --debug

   # Check for circular dependencies
   npm run build 2>&1 | grep -i "circular"

   # Test PrivateModule in isolation
   # Create test file to import only PrivateModule
   ```

**Recommendation:** ⚠️ **INVESTIGATE BEFORE RE-ENABLING**

**Action Plan:**

1. **Phase 1: Investigation (1-2 days)**
   - Read PrivateModule code
   - Identify all dependencies
   - Check for circular dependencies
   - Review module providers and controllers

2. **Phase 2: Testing (1 day)**
   - Create isolated test
   - Enable debug logging
   - Identify exact hang point

3. **Phase 3: Fix (1-2 days)**
   - Fix identified issue
   - Test in development
   - Verify no startup delay

4. **Phase 4: Re-enable (if fixed)**
   - Uncomment in main.ts
   - Deploy to development
   - Monitor startup time
   - Verify functionality

**DO NOT re-enable until investigation complete** - Could break production deployments.

---

## Implementation Plan

### Immediate Actions (Today)

1. ✅ **Re-enable QueueModule**
   - Set `AWS_SQS_ENABLED='true'` in docker-compose.yml
   - Configure LocalStack SQS queues
   - Uncomment QueueModule in app.module.ts
   - Test application startup
   - Verify queues initialize

2. ✅ **Document FrontendModule decision**
   - Keep disabled
   - Update comment: "// FrontendModule - Not needed (served by Nginx)"
   - Remove "TEMPORARILY" from comment

### Short-term (This Week)

3. ⏳ **Investigate PrivateModule** (2-3 days)
   - Read module code
   - Identify dependencies
   - Find circular dependencies
   - Test in isolation
   - Fix startup hang

### Testing Checklist

After re-enabling QueueModule:
- [ ] Application starts without errors
- [ ] Queue services initialize
- [ ] Background jobs can be queued
- [ ] SQS connection established (LocalStack or AWS)
- [ ] No performance degradation
- [ ] Health check passes

---

## Risk Assessment

| Module | Re-enable Risk | Impact if Broken | Priority |
|--------|---------------|------------------|----------|
| QueueModule | LOW | HIGH (background jobs fail) | HIGH - Re-enable |
| FrontendModule | HIGH | MEDIUM (conflicts with Nginx) | LOW - Keep disabled |
| PrivateModule | CRITICAL | CRITICAL (app won't start) | MEDIUM - Investigate first |

---

## Current Status Summary

| Module | Status | Action |
|--------|--------|--------|
| QueueModule | Disabled | ✅ READY TO RE-ENABLE |
| FrontendModule | Disabled | ⚠️ KEEP DISABLED |
| PrivateModule | Disabled | ⚠️ NEEDS INVESTIGATION |

---

## Next Steps

1. Re-enable QueueModule (if AWS SQS or LocalStack configured)
2. Update comments for FrontendModule
3. Schedule PrivateModule investigation
4. Test all changes in development
5. Deploy to staging
6. Monitor for issues

---

## Files to Modify

### To re-enable QueueModule:
```bash
# File: src/app/app.module.ts
- // QueueModule,  // TEMPORARILY DISABLED for initial setup
+ QueueModule,
```

### To update FrontendModule comment:
```bash
# File: src/app/app.module.ts
- // FrontendModule,  // TEMPORARILY DISABLED for initial setup
+ // FrontendModule - Not needed (frontend served by Nginx)
```

### To investigate PrivateModule:
```bash
# Read: src/app-private/app-private.module.ts
# Read: src/main.ts lines 372-392
# Check for circular dependencies
# Test in isolation
```

---

## Conclusion

**Summary:**
- **QueueModule**: Safe to re-enable with proper configuration
- **FrontendModule**: Should remain disabled (architectural decision)
- **PrivateModule**: Requires investigation before re-enabling

**Estimated Time:**
- QueueModule re-enable: 1-2 hours (configuration + testing)
- FrontendModule comment update: 5 minutes
- PrivateModule investigation: 2-3 days

**Priority Order:**
1. Re-enable QueueModule (HIGH - needed for background jobs)
2. Update FrontendModule comment (LOW - documentation)
3. Investigate PrivateModule (MEDIUM - blocking feature but not critical)
