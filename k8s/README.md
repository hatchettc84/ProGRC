# ProGRC Kubernetes Deployment

This directory contains Kubernetes manifests for deploying the ProGRC platform in a containerized, multi-tenant environment.

## Prerequisites

- Kubernetes cluster (minikube, kind, or cloud provider)
- kubectl configured
- Docker for building images

## Quick Start

### 1. Start Minikube (if using local cluster)

```bash
minikube start --driver=docker --memory=4096 --cpus=2
```

### 2. Build Docker Image

```bash
# Build the backend image
docker build -f Dockerfile.simple -t progrc-backend:latest .

# Load image into minikube (if using minikube)
minikube image load progrc-backend:latest
```

### 3. Deploy to Kubernetes

```bash
# Apply base resources
kubectl apply -f k8s/base/

# Apply services
kubectl apply -f k8s/services/

# Apply ingress (requires ingress controller)
kubectl apply -f k8s/ingress/
```

### 4. Install Ingress Controller (if needed)

For minikube:
```bash
minikube addons enable ingress
```

For other clusters:
```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml
```

## Architecture

### Multi-Tenancy

- **Shared Database**: All tenants share the same PostgreSQL database
- **Row-Level Security**: Tenant isolation via `customer_id` column
- **Tenant Context**: Extracted from JWT tokens in requests
- **Resource Quotas**: Per-tenant resource limits (optional)

### Services

1. **PostgreSQL**: Database with pgvector extension
2. **Redis**: Caching and session storage
3. **Backend**: ProGRC NestJS application (3+ replicas)
4. **Metabase**: Analytics and reporting
5. **LocalStack**: S3-compatible storage (optional)

### Scaling

- **Horizontal Pod Autoscaling**: Automatically scales backend based on CPU/memory
- **Min Replicas**: 3
- **Max Replicas**: 10
- **Target CPU**: 70%
- **Target Memory**: 80%

## Configuration

### Environment Variables

Edit `k8s/base/configmap.yaml` for non-sensitive configuration.

### Secrets

Edit `k8s/base/secret.yaml` for sensitive data (passwords, API keys).

**⚠️ IMPORTANT**: Change all default passwords and secrets before production deployment!

## Accessing the Platform

### Get Ingress IP

```bash
# For minikube
minikube service progrc-backend -n progrc --url

# For cloud providers
kubectl get ingress -n progrc
```

### Port Forwarding (Development)

```bash
# Backend API
kubectl port-forward -n progrc svc/progrc-backend 3001:3000

# Metabase
kubectl port-forward -n progrc svc/metabase 3002:3000

# PostgreSQL (for debugging)
kubectl port-forward -n progrc svc/postgres 5435:5432
```

## Monitoring

### Check Pod Status

```bash
kubectl get pods -n progrc
```

### View Logs

```bash
# Backend logs
kubectl logs -n progrc -l app=progrc-backend -f

# Specific pod
kubectl logs -n progrc <pod-name> -f
```

### Resource Usage

```bash
kubectl top pods -n progrc
kubectl top nodes
```

## Database Migrations

Migrations run automatically on container startup. To run manually:

```bash
kubectl exec -n progrc deployment/progrc-backend -- npm run migration:up
```

## Troubleshooting

### Pods Not Starting

```bash
# Check pod events
kubectl describe pod <pod-name> -n progrc

# Check logs
kubectl logs <pod-name> -n progrc
```

### Database Connection Issues

```bash
# Test database connectivity
kubectl exec -n progrc deployment/progrc-backend -- sh -c "echo 'SELECT 1;' | psql -h postgres -U progrc -d progrc_bff"
```

### Ingress Not Working

```bash
# Check ingress controller
kubectl get pods -n ingress-nginx

# Check ingress status
kubectl describe ingress -n progrc
```

## Production Considerations

1. **Secrets Management**: Use external secret management (AWS Secrets Manager, HashiCorp Vault)
2. **Database**: Use managed database service (RDS, Cloud SQL, etc.)
3. **Storage**: Use managed storage (EBS, Persistent Disks)
4. **Monitoring**: Integrate with Prometheus/Grafana
5. **Logging**: Use centralized logging (ELK, CloudWatch, etc.)
6. **Backup**: Set up automated database backups
7. **SSL/TLS**: Configure TLS certificates (cert-manager)
8. **Network Policies**: Implement network policies for security
9. **Resource Quotas**: Set namespace resource quotas
10. **Pod Disruption Budgets**: Ensure high availability

## Multi-Tenant Security

- All database queries filtered by `customer_id`
- Tenant context extracted from JWT tokens
- Row-Level Security (RLS) policies in PostgreSQL
- Tenant-specific resource quotas (optional)
- Network policies for tenant isolation (optional)



