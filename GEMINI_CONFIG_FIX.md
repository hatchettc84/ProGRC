# Gemini Configuration Fix

## ⚠️ Issue Found

### Secret Name Mismatch

**Problem:**
- Secret file (`k8s/base/secret.yaml`) uses name: `progrc-secrets`
- Deployment (`k8s/services/backend.yaml`) references: `progrc-bff-dev-secrets`
- **These don't match!** Gemini API key might not be accessible to the backend.

### Current Status

✅ **ConfigMap** (`k8s/base/configmap.yaml`):
- `USE_GEMINI: "true"` ✅ (enabled)
- `GEMINI_MODEL: "gemini-2.0-flash-exp"` ✅ (now added explicitly)

❓ **Secret** (`k8s/base/secret.yaml`):
- Name: `progrc-secrets`
- Has `GEMINI_API_KEY: "AIzaSyBbXF6oj-tnf9ofUy1u6Hex2i-Fr5xC69o"` (looks like placeholder)

❌ **Deployment** (`k8s/services/backend.yaml`):
- References: `progrc-bff-dev-secrets` (different name!)
- This secret may not exist or may not have `GEMINI_API_KEY`

## 🔧 Fix Options

### Option 1: Update Secret Name in secret.yaml (Recommended)

Change the secret name to match what the deployment expects:

```yaml
# k8s/base/secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: progrc-bff-dev-secrets  # Changed from progrc-secrets
  namespace: progrc-dev
```

### Option 2: Update Deployment to Use Correct Secret Name

Change the deployment to use the existing secret:

```yaml
# k8s/services/backend.yaml (line 44-45)
- secretRef:
    name: progrc-secrets  # Changed from progrc-bff-dev-secrets
```

### Option 3: Ensure Both Secrets Exist (If Using Different Secrets)

If you're using `progrc-bff-dev-secrets` for other config, add Gemini API key to it:

```bash
kubectl create secret generic progrc-bff-dev-secrets \
  --from-literal=GEMINI_API_KEY='your-api-key-here' \
  --namespace=progrc-dev \
  --dry-run=client -o yaml | kubectl apply -f -
```

## ✅ Recommended Fix

**Best approach**: Use `progrc-bff-dev-secrets` (as deployment expects) and ensure it has `GEMINI_API_KEY`.

1. **Check which secret actually exists:**
   ```bash
   kubectl get secrets -n progrc-dev | grep progrc
   ```

2. **If `progrc-bff-dev-secrets` exists, add Gemini key:**
   ```bash
   # Get your real API key from: https://makersuite.google.com/app/apikey
   kubectl patch secret progrc-bff-dev-secrets -n progrc-dev \
     --type='json' \
     -p='[{"op": "add", "path": "/data/GEMINI_API_KEY", "value": "'$(echo -n 'your-api-key' | base64)'"}]'
   ```

3. **If `progrc-bff-dev-secrets` doesn't exist, create it:**
   ```bash
   kubectl create secret generic progrc-bff-dev-secrets \
     --from-literal=GEMINI_API_KEY='your-real-api-key' \
     --namespace=progrc-dev
   ```

## 📋 Verification

After fixing, verify:

```bash
# 1. Check secret exists and has key
kubectl get secret progrc-bff-dev-secrets -n progrc-dev -o jsonpath='{.data.GEMINI_API_KEY}' | base64 -d

# 2. Restart backend
kubectl rollout restart deployment/progrc-backend -n progrc-dev

# 3. Check logs
kubectl logs -n progrc-dev deployment/progrc-backend --tail=50 | grep -i gemini
```

Expected logs:
```
Gemini service initialized with model: gemini-2.0-flash-exp
```

If you see:
```
Gemini is enabled but GEMINI_API_KEY is not set
```
→ Secret name mismatch or key missing

## ✅ What I Fixed

1. ✅ Added `GEMINI_MODEL: "gemini-2.0-flash-exp"` to ConfigMap (explicit, not relying on default)
2. ✅ Created verification script: `verify-gemini-config.sh`
3. ✅ Documented the secret name mismatch issue

## 🎯 Next Steps

1. **Fix secret name mismatch** (choose Option 1, 2, or 3 above)
2. **Ensure valid Gemini API key** (not placeholder)
3. **Run verification**: `./verify-gemini-config.sh`
4. **Restart backend**: `kubectl rollout restart deployment/progrc-backend -n progrc-dev`
5. **Check logs** for initialization


