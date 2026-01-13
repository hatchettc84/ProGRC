# Quick Deploy Guide - Multi-Tenant Fixes

## 🚀 Quick Deployment

Run the deployment script:

```bash
./apply-multi-tenant-fixes.sh
```

This script will:
1. ✅ Check prerequisites
2. ✅ Apply ConfigMap changes (security settings)
3. ✅ Apply backend deployment (scale to 3 replicas, change service type)
4. ✅ Wait for pods to be ready
5. ✅ Apply Pod Disruption Budgets
6. ✅ Apply Network Policies
7. ✅ Apply Resource Quotas
8. ✅ Verify all changes

## 📋 Manual Deployment (Alternative)

If you prefer to deploy manually:

```bash
# 1. Apply ConfigMap
kubectl apply -f k8s/base/configmap.yaml

# 2. Apply backend changes
kubectl apply -f k8s/services/backend.yaml

# 3. Apply policies
kubectl apply -f k8s/policies/pod-disruption-budget.yaml
kubectl apply -f k8s/policies/network-policy.yaml
kubectl apply -f k8s/policies/resource-quota.yaml

# 4. Verify
kubectl get pods -n progrc-dev -l app=progrc-backend
kubectl get svc -n progrc-dev
kubectl get pdb -n progrc-dev
kubectl get networkpolicies -n progrc-dev
kubectl get resourcequota -n progrc-dev
```

## ⚡ What Changes

### Before:
- ❌ 1 backend replica (single point of failure)
- ❌ Security restrictions disabled
- ❌ 2 LoadBalancers ($48/month)
- ❌ No pod disruption protection
- ❌ No network isolation
- ❌ No resource limits

### After:
- ✅ 3 backend replicas (high availability)
- ✅ Security restrictions enabled
- ✅ 1 LoadBalancer + Ingress ($24/month savings)
- ✅ Pod Disruption Budgets active
- ✅ Network policies enforced
- ✅ Resource quotas in place

## 🔍 Verification Commands

```bash
# Check backend replicas
kubectl get deployment progrc-backend -n progrc-dev

# Check service type
kubectl get svc progrc-backend -n progrc-dev

# Check pods
kubectl get pods -n progrc-dev -l app=progrc-backend

# Check Pod Disruption Budgets
kubectl get pdb -n progrc-dev

# Check Network Policies
kubectl get networkpolicies -n progrc-dev

# Check Resource Quotas
kubectl get resourcequota -n progrc-dev

# Check ConfigMap security settings
kubectl get configmap progrc-config -n progrc-dev -o yaml | grep -A 3 "Permission"
```

## 🧪 Testing

```bash
# Test backend health
curl http://143.244.221.38/api/v1/health

# Test frontend
curl http://143.244.221.38/

# Check backend logs
kubectl logs -n progrc-dev -l app=progrc-backend -f
```

## ⚠️ Important Notes

1. **Backend Service Type Changed**: Backend is now `ClusterIP` (not `LoadBalancer`)
   - Access via Ingress: `http://143.244.221.38/api/v1/*`
   - No direct external access (more secure)

2. **Security Restrictions Enabled**: 
   - Permission validation is now enforced
   - Test all API endpoints to ensure permissions are correct

3. **Network Policies**: 
   - Restrictive by default
   - If connectivity issues occur, check network policy rules

4. **Backend Scaling**: 
   - Deployment will scale from 1 to 3 replicas
   - This may take 2-5 minutes
   - Monitor with: `kubectl get pods -n progrc-dev -l app=progrc-backend -w`

## 📊 Expected Timeline

- ConfigMap update: ~10 seconds
- Backend deployment update: ~30 seconds
- Pod scaling (1→3): ~2-5 minutes
- Policy application: ~10 seconds
- **Total: ~3-6 minutes**

## 🆘 Troubleshooting

### Backend pods not starting:
```bash
kubectl describe pod -n progrc-dev -l app=progrc-backend
kubectl logs -n progrc-dev -l app=progrc-backend
```

### Network policy blocking traffic:
```bash
kubectl describe networkpolicy -n progrc-dev
# Check if rules need adjustment
```

### Resource quota exceeded:
```bash
kubectl describe resourcequota progrc-dev-quota -n progrc-dev
# Adjust limits in k8s/policies/resource-quota.yaml if needed
```

### Permission errors after security enablement:
- Check user roles and permissions
- Verify API endpoints have permission decorators
- Review application logs

## 📚 More Information

See `DEPLOYMENT_FIXES_APPLIED.md` for detailed documentation.
