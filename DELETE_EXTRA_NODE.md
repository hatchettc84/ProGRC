# Delete Extra Kubernetes Node

## 🔍 **Current Status**

**Kubernetes Cluster**: 3 nodes (should be 2)
- ✅ `progrc-dev-cluster-primary-pool-50m67` - 4 pods (KEEP)
- ✅ `progrc-dev-cluster-primary-pool-50ozf` - 3 pods (KEEP)
- ⚠️ `progrc-dev-cluster-primary-pool-knvdj` - 1 pod (REMOVE)

**DigitalOcean Console**: Shows 5 droplets
- 4 Kubernetes nodes (1 already removed from cluster)
- 1 AI droplet (KEEP)

## 🎯 **Action Required**

The node `knvdj` has 1 pod that needs to be moved before deletion.

### **Option 1: Scale Node Pool** (Recommended - Safest)

1. Go to: https://cloud.digitalocean.com/kubernetes/clusters
2. Click your cluster → "Node Pools" tab
3. Edit node pool → Change count from 3 to 2
4. Save (this will automatically move the pod and remove the node)

### **Option 2: Delete Directly** (Faster but manual)

**Step 1: Move the pod from knvdj**
```bash
# Find the pod on knvdj
kubectl get pods -n progrc-dev --field-selector spec.nodeName=progrc-dev-cluster-primary-pool-knvdj

# Delete the pod (it will be recreated on another node)
kubectl delete pod <POD_NAME> -n progrc-dev
```

**Step 2: Wait for pod to reschedule** (30 seconds)

**Step 3: Delete the droplet**
- In DigitalOcean console, find `progrc-dev-cluster-primary-pool-knvdj`
- Click "..." → "Destroy" → Confirm

## ⚠️ **Important**

- The pod on `knvdj` will be automatically rescheduled to one of the other 2 nodes
- No downtime expected
- The droplet will be removed from both Kubernetes and DigitalOcean
