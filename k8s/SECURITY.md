# Security Configuration Guide

This document outlines the security measures implemented for the ProGRC platform on DigitalOcean Kubernetes.

## Security Features Implemented

### 1. Application-Level Security

#### Permission Validator (Default Deny)
- **Fixed**: Changed default behavior from `allow` to `deny` when permission rules are not found
- **Environment Variables**:
  - `ENABLE_PERMISSION_RESTRICTIONS=true` - Enables strict permission checking
  - `ALLOW_UNKNOWN_API_PATHS=false` - Denies access to unknown API paths (default)
  - `ALLOW_EMPTY_PERMISSIONS=false` - Denies access when permissions cache is empty (default)

#### SuperAdmin Audit Logging
- All SuperAdmin actions are now logged with:
  - User ID and email
  - IP address
  - User agent
  - Timestamp
  - Request method and URL
- Access denials for SuperAdmin are also logged

### 2. Kubernetes Security Contexts

#### Backend Deployment
- **Pod Security Context**:
  - `runAsNonRoot: true`
  - `runAsUser: 1000`
  - `fsGroup: 1000`
  - `seccompProfile: RuntimeDefault`

- **Container Security Context**:
  - `allowPrivilegeEscalation: false`
  - `capabilities.drop: ALL`
  - `runAsNonRoot: true`
  - `runAsUser: 1000`

#### Frontend Deployment
- **Pod Security Context**:
  - `runAsNonRoot: true`
  - `runAsUser: 101` (Nginx user)
  - `fsGroup: 101`
  - `seccompProfile: RuntimeDefault`

- **Container Security Context**:
  - `allowPrivilegeEscalation: false`
  - `capabilities.drop: ALL`
  - `capabilities.add: CHOWN` (for log file management)
  - `runAsNonRoot: true`
  - `runAsUser: 101`

### 3. Kubernetes RBAC

#### ServiceAccount
- Created dedicated ServiceAccount: `progrc-backend-sa`
- Minimal permissions:
  - Read ConfigMaps and Secrets (for environment variables)
  - Read Endpoints (for service discovery)

#### Role and RoleBinding
- Role: `progrc-backend-role` (namespace-scoped)
- RoleBinding: `progrc-backend-rolebinding`
- Follows principle of least privilege

### 4. Pod Security Standards

- Namespace labels for Pod Security Standards:
  - `pod-security.kubernetes.io/enforce: restricted`
  - `pod-security.kubernetes.io/audit: restricted`
  - `pod-security.kubernetes.io/warn: restricted`

## Deployment Instructions

### 1. Apply RBAC Resources

```bash
kubectl apply -f k8s/rbac/backend-serviceaccount.yaml
kubectl apply -f k8s/rbac/pod-security-policy.yaml
```

### 2. Update Deployments

```bash
kubectl apply -f k8s/services/backend.yaml
kubectl apply -f k8s/services/frontend.yaml
```

### 3. Verify Security Contexts

```bash
# Check backend pod security context
kubectl get pod -n progrc-dev -l app=progrc-backend -o jsonpath='{.items[0].spec.securityContext}'

# Check backend container security context
kubectl get pod -n progrc-dev -l app=progrc-backend -o jsonpath='{.items[0].spec.containers[0].securityContext}'

# Check ServiceAccount
kubectl get pod -n progrc-dev -l app=progrc-backend -o jsonpath='{.items[0].spec.serviceAccountName}'
```

## Environment Variables for Security

Add these to your ConfigMap or Secret:

```yaml
# Strict permission checking (recommended for production)
ENABLE_PERMISSION_RESTRICTIONS: "true"
ALLOW_UNKNOWN_API_PATHS: "false"
ALLOW_EMPTY_PERMISSIONS: "false"
```

## Monitoring and Alerting

### SuperAdmin Action Monitoring

All SuperAdmin actions are logged with the `[AUDIT]` prefix. To monitor:

```bash
# View SuperAdmin audit logs
kubectl logs -n progrc-dev -l app=progrc-backend | grep "\[AUDIT\]"

# View access denials
kubectl logs -n progrc-dev -l app=progrc-backend | grep "Access denied"
```

## Security Best Practices

1. **Regular Security Audits**: Review audit logs weekly
2. **Rotate Secrets**: Rotate JWT keys and database passwords regularly
3. **Network Policies**: Consider implementing NetworkPolicies to restrict pod communication
4. **Image Scanning**: Scan container images for vulnerabilities
5. **Least Privilege**: Always use the minimum required permissions
6. **MFA**: Require MFA for SuperAdmin operations (future enhancement)

## Troubleshooting

### Permission Denied Errors

If you see "Access Denied" errors after deployment:

1. Check if permission rules exist in the database:
   ```sql
   SELECT * FROM permissions WHERE api_path = '/api/v1/your-endpoint';
   ```

2. Temporarily allow unknown paths (NOT recommended for production):
   ```yaml
   ALLOW_UNKNOWN_API_PATHS: "true"
   ```

3. Check permission cache:
   ```bash
   kubectl logs -n progrc-dev -l app=progrc-backend | grep "Permissions cache"
   ```

### Pod Startup Issues

If pods fail to start with security context errors:

1. Check if the image supports running as non-root
2. Verify user IDs in the image
3. Adjust `runAsUser` if necessary (but prefer fixing the image)

## Future Enhancements

- [ ] Implement NetworkPolicies
- [ ] Add MFA requirement for SuperAdmin operations
- [ ] Implement privilege escalation workflows
- [ ] Add automated security scanning
- [ ] Implement zero-trust architecture
- [ ] Add rate limiting for privileged endpoints



