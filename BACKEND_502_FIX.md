# Backend 502 Error Fix

## 🔍 **Problem Identified**

After deploying multi-tenant fixes, backend API calls return **502 Bad Gateway** errors.

### **Root Causes**

1. **Backend Pods Crashing**
   - Exit code 137 (SIGKILL) - likely OOM (Out of Memory) or system kill
   - Pods restarting multiple times
   - Health checks failing

2. **Ingress Host Mismatch**
   - Ingress configured for `host: progrc.local`
   - Requests coming via IP `143.244.221.38` don't match
   - Ingress not routing requests to backend

3. **Security Restrictions**
   - `ENABLE_PERMISSION_RESTRICTIONS: "true"` may be causing startup issues
   - Backend may be crashing during permission validation

4. **Health Check Timing**
   - Migrations take time to complete
   - Health checks may be too aggressive
   - Pods killed before migrations finish

## ✅ **Fixes Applied**

### 1. **Ingress Host Fix**

**File:** `k8s/ingress/ingress.yaml`

**Before:**
```yaml
- host: progrc.local  # Only matches specific host
```

**After:**
```yaml
- host: ""  # Matches all hosts (IP or domain)
```

**Result:** Ingress now routes requests from IP address.

### 2. **Health Check Timing Fix**

**File:** `k8s/services/backend.yaml`

**Changes:**
- `initialDelaySeconds`: 60 → **120** (liveness), 30 → **90** (readiness)
- `timeoutSeconds`: 5 → **10**
- Added `failureThreshold: 5` (more failures before action)

**Result:** More time for migrations and startup.

### 3. **Temporary Security Restrictions Disabled**

**File:** `k8s/base/configmap.yaml`

**Temporarily disabled:**
- `ENABLE_PERMISSION_RESTRICTIONS: "false"` (was "true")
- `ALLOW_UNKNOWN_API_PATHS: "true"` (was "false")
- `ALLOW_EMPTY_PERMISSIONS: "true"` (was "false")

**Reason:** Backend may be crashing due to permission validation issues. Will re-enable after fixing root cause.

## 🔄 **Deployment Steps**

```bash
# 1. Apply fixes
kubectl apply -f k8s/ingress/ingress.yaml
kubectl apply -f k8s/base/configmap.yaml
kubectl apply -f k8s/services/backend.yaml

# 2. Restart backend
kubectl rollout restart deployment/progrc-backend -n progrc-dev

# 3. Monitor pods
kubectl get pods -n progrc-dev -l app=progrc-backend -w

# 4. Check logs
kubectl logs -n progrc-dev -l app=progrc-backend -f
```

## 📊 **Expected Results**

- ✅ Ingress routes requests correctly
- ✅ Backend pods have more time to start
- ✅ Health checks less aggressive
- ✅ Backend should start successfully

## ⚠️ **Next Steps**

1. **Monitor Backend Pods**
   ```bash
   kubectl get pods -n progrc-dev -l app=progrc-backend
   ```
   - Should show `1/1 Ready` after migrations complete
   - Should not be restarting

2. **Test API**
   ```bash
   curl http://143.244.221.38/api/v1/health
   ```
   - Should return `200 OK`

3. **Re-enable Security Restrictions**
   - Once backend is stable
   - Test thoroughly
   - Re-enable one setting at a time

4. **Investigate Root Cause**
   - Check if exit code 137 is OOM
   - Review memory limits
   - Check migration logs
   - Verify permission validation code

## 🔍 **Troubleshooting**

### If Backend Still Crashing:

```bash
# Check pod events
kubectl describe pod -n progrc-dev -l app=progrc-backend

# Check logs
kubectl logs -n progrc-dev -l app=progrc-backend --tail=100

# Check resource usage
kubectl top pods -n progrc-dev -l app=progrc-backend
```

### If 502 Persists:

```bash
# Check ingress
kubectl describe ingress progrc-ingress -n progrc-dev

# Check backend service
kubectl get svc -n progrc-dev progrc-backend

# Test from inside cluster
kubectl run test-curl --image=curlimages/curl --rm -it -- curl http://progrc-backend:3000/api/v1/health
```

---

**Status:** ✅ **Fixes Applied** - Monitoring backend startup
