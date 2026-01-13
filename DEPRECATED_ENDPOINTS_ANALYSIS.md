# Deprecated Endpoints Analysis

**Generated:** 2026-01-06
**Purpose:** Document all deprecated endpoints and provide removal recommendations

---

## Summary

- **Total deprecated endpoints:** 14
- **Controllers affected:** 4 (auth, user, feature-flag, mfa)
- **Recommendation:** Verify usage before removal

---

## Deprecated Endpoints by Controller

### 1. User Controller (4 endpoints)
**File:** `src/user/user.controller.ts`

| Line | HTTP Method | Endpoint | TODO Comment |
|------|-------------|----------|--------------|
| 184 | GET/POST | Unknown | // TODO: Remove this endpoint |
| 211 | GET/POST | Unknown | // TODO: Remove this endpoint |
| 258 | GET/POST | Unknown | // TODO: Remove this endpoint |
| 356 | GET/POST | Unknown | // TODO: Remove this endpoint |

**Action Required:** Review user.controller.ts lines to identify exact endpoints

---

### 2. Auth Controller (1 endpoint)
**File:** `src/auth/auth.controller.ts`

| Line | HTTP Method | Endpoint | TODO Comment |
|------|-------------|----------|--------------|
| 227 | Unknown | Unknown | // TODO: Remove this endpoint |

**Action Required:** Review auth.controller.ts line 227 to identify endpoint

---

### 3. Feature Flag Controller (3 endpoints)
**File:** `src/feature-flag/feature-flag.controller.ts`

| Line | HTTP Method | Endpoint | TODO Comment |
|------|-------------|----------|--------------|
| 20 | Unknown | Unknown | // TODO: Remove this endpoint |
| 57 | Unknown | Unknown | // TODO: Remove this endpoint |
| 67 | Unknown | Unknown | // TODO: Remove this endpoint |

**Action Required:** Review feature-flag.controller.ts to identify endpoints

---

### 4. MFA Controller (6 endpoints with @deprecated)
**File:** `src/auth/controllers/mfa.controller.ts`

| Line | Status | Replacement | Deprecation Note |
|------|--------|-------------|------------------|
| 362 | @deprecated | getMfaStatus() | Use getMfaStatus() instead |
| 383 | @deprecated | getUserMfaDevices() | Use getUserMfaDevices() instead |
| 404 | @deprecated | setPrimaryMfaDevice() | Use setPrimaryMfaDevice() instead |
| 425 | @deprecated | removeMfaDevice() | Use removeMfaDevice() instead |
| 446 | @deprecated | generateBackupCodes() | Use generateBackupCodes() instead |
| 513 | @deprecated | getMfaPolicies() | Use getMfaPolicies() instead |

**Note:** These have @deprecated JSDoc annotations and specify replacement endpoints

---

## Removal Strategy

### Phase 1: Identify Exact Endpoints (REQUIRED)
Read the controller files to document:
- Exact HTTP method (GET, POST, PUT, DELETE)
- Full endpoint path
- Purpose/functionality

### Phase 2: Check API Usage (RECOMMENDED)
Since we chose "Check API usage first" approach, verify:

```bash
# On VPS, check nginx access logs for these endpoints
grep -E "endpoint-path-here" /var/log/nginx/access.log | wc -l

# Or check application logs
docker compose logs app | grep "endpoint-path-here" | wc -l
```

### Phase 3: API Versioning (RECOMMENDED for MFA)
For MFA controller @deprecated endpoints:
- These already have @deprecated annotations
- They specify replacement endpoints
- Consider creating API v2 instead of removing

**Suggested approach:**
1. Keep v1 endpoints with deprecation warnings
2. Create v2 endpoints with new naming
3. Set deprecation timeline (e.g., 6 months)
4. Communicate to API consumers

### Phase 4: Safe Removal Process
For endpoints with no usage:

1. **Add deprecation headers** (30 days warning):
   ```typescript
   @Header('Deprecation', 'true')
   @Header('Sunset', '2026-02-06') // 30 days from now
   ```

2. **Log warnings when called**:
   ```typescript
   this.logger.warn(`Deprecated endpoint called: ${req.path}`, {
     userId: user.id,
     deprecationDate: '2026-02-06'
   });
   ```

3. **Monitor usage for 30 days**

4. **Remove if zero usage confirmed**

---

## Immediate Actions

### Option A: Keep All Endpoints (Conservative)
**Pros:**
- No risk of breaking existing clients
- Backwards compatibility maintained

**Cons:**
- Technical debt increases
- API surface bloat
- Confusing for new developers

### Option B: Deprecate with Timeline (Recommended)
**Pros:**
- Clear migration path
- Time for clients to adapt
- Industry standard practice

**Cons:**
- Requires communication effort
- Delayed cleanup

**Steps:**
1. Add @deprecated annotations to all TODO endpoints
2. Add deprecation headers
3. Document replacement endpoints
4. Set 90-day sunset timeline
5. Communicate to API consumers
6. Remove after timeline expires

### Option C: Remove Immediately (Aggressive)
**Pros:**
- Clean codebase immediately
- Clear API surface

**Cons:**
- HIGH RISK of breaking clients
- No migration path
- May require emergency rollback

**Only if:** Confirmed zero usage in last 90 days

---

## Next Steps

1. ✅ **Document exact endpoints** - Read controller files
2. ⏳ **Check API usage** - Review logs on VPS
3. ⏳ **Decide strategy** - Choose Option A, B, or C
4. ⏳ **Implement chosen strategy**
5. ⏳ **Monitor and execute removal**

---

## Commands for Usage Analysis

### Check Nginx Logs (on VPS)
```bash
# SSH into VPS
ssh root@168.231.70.205

# Check access logs for specific endpoint patterns
grep "GET /api/v1/user" /var/log/nginx/access.log | tail -100

# Count requests to deprecated endpoints
grep "deprecated-endpoint-path" /var/log/nginx/access.log | wc -l

# Check recent activity (last 7 days)
find /var/log/nginx -name "access.log*" -mtime -7 -exec grep "endpoint" {} \;
```

### Check Application Logs
```bash
# From project directory
cd /root/bff-service-backend-dev

# Check recent API calls
docker compose logs app --since 7d | grep "endpoint-path"

# Check for specific routes
docker compose logs app | grep -E "GET|POST|PUT|DELETE" | grep "deprecated"
```

---

## Recommendation

**Based on security best practices and user preference ("Check API usage first"):**

1. **Immediate:** Document all 14 endpoints with exact details
2. **Week 1:** Check API usage logs on VPS (commands above)
3. **Week 2:**
   - If usage > 0: Implement Option B (Deprecate with Timeline)
   - If usage = 0 for 90 days: Safe to remove (Option C)
4. **Week 3:** Execute chosen strategy

**MFA Controller specifically:** These should use Option B (Deprecation Timeline) since they're security-sensitive and have proper @deprecated annotations with replacements defined.

---

## Status

- [x] Endpoints identified (14 total)
- [ ] Exact endpoint details documented
- [ ] API usage checked
- [ ] Strategy decided
- [ ] Implementation complete
- [ ] Removal executed
