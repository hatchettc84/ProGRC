# Identifying Application IP: 143.244.221.38

## 🔍 Analysis

The IP address `143.244.221.38` is serving your ProGRC application at `http://143.244.221.38/`.

## 📊 What We Know

### From Codebase Analysis:

1. **LocalStack Configuration**:
   - `143.244.221.38:4566` is configured as `LOCALSTACK_PUBLIC_ENDPOINT` in `k8s/base/configmap.yaml`
   - This is the public IP for LocalStack (S3 emulation service)

2. **Frontend References**:
   - The frontend code references `http://143.244.221.38` in CSP (Content Security Policy) headers
   - This suggests the application is accessible at this IP

3. **Not a Droplet**:
   - This IP is **NOT** one of your droplets:
     - AI Droplet: `64.225.20.65`
     - Droplet 2: `142.93.183.7`
     - Droplet 3: `45.55.185.33`

## 🎯 Most Likely: Kubernetes LoadBalancer

Based on the evidence, `143.244.221.38` is most likely:

### **A DigitalOcean LoadBalancer IP**

This is the **public IP** assigned to your Kubernetes service/ingress that routes traffic to your backend pods.

### How to Verify:

```bash
# Check Kubernetes services with LoadBalancer type
kubectl get svc -n progrc-dev -o wide

# Check Ingress resources
kubectl get ingress -n progrc-dev -o wide

# Check LoadBalancer details
kubectl describe svc -n progrc-dev | grep -A 10 "LoadBalancer\|EXTERNAL-IP"
```

### Expected Output:

You should see something like:

```
NAME              TYPE           CLUSTER-IP      EXTERNAL-IP      PORT(S)
progrc-backend    LoadBalancer   10.245.x.x     143.244.221.38   80:3xxxx/TCP
```

## 🏗️ Architecture

```
Internet
   │
   ▼
┌─────────────────────────────────┐
│  LoadBalancer (143.244.221.38) │  ← Public IP
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│  Kubernetes Cluster (progrc-dev) │
│  - Backend Pods                 │
│  - Frontend Service             │
│  - LocalStack (port 4566)       │
└─────────────────────────────────┘
```

## 🔍 What's Running Behind This IP

1. **Backend API**: `http://143.244.221.38/api/v1/*`
2. **Frontend Application**: `http://143.244.221.38/`
3. **LocalStack (S3)**: `http://143.244.221.38:4566` (if exposed)

## 📋 Next Steps to Identify

### Option 1: Check Kubernetes Services (Recommended)

```bash
# List all services
kubectl get svc -n progrc-dev

# Get detailed info
kubectl describe svc -n progrc-dev

# Check which pods are behind the service
kubectl get endpoints -n progrc-dev
```

### Option 2: Check DigitalOcean Dashboard

1. Go to: https://cloud.digitalocean.com
2. Navigate to **Networking** → **Load Balancers**
3. Look for a LoadBalancer with IP `143.244.221.38`
4. Check which Kubernetes cluster it's attached to

### Option 3: Check from Inside Cluster

```bash
# Get LoadBalancer IP from service
kubectl get svc -n progrc-dev -o jsonpath='{.items[*].status.loadBalancer.ingress[0].ip}'

# Check ingress resources
kubectl get ingress -n progrc-dev -o yaml
```

## 🎯 Summary

**IP**: `143.244.221.38`  
**Type**: **Kubernetes LoadBalancer** (not a droplet)  
**Purpose**: Public entry point for your ProGRC application  
**Services**: 
- Frontend (port 80)
- Backend API (`/api/v1`)
- LocalStack S3 (port 4566)

**Droplets are NOT serving the application directly** - they are:
- **AI Droplet (64.225.20.65)**: Running Ollama for AI processing
- **Droplet 2 (142.93.183.7)**: Purpose unknown
- **Droplet 3 (45.55.185.33)**: Purpose unknown

The application itself is running in **Kubernetes pods** behind the LoadBalancer.
