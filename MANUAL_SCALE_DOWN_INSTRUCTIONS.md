# Manual Scale Down Instructions

## 🎯 **Goal**: Scale Down from 4 Nodes to 2 Nodes

**Current Status**:
- 4 Kubernetes nodes running
- 2 new nodes (`knv0q` and `knvdj`) created 16-18 minutes ago
- Each new node has only 1 pod (can be safely removed)

**Target**: Scale to 2 nodes to save ~$48/month

---

## 📋 **Method 1: DigitalOcean Console** (Recommended - Easiest)

### **Steps**:

1. **Go to Kubernetes Dashboard**:
   - Visit: https://cloud.digitalocean.com/kubernetes/clusters
   - Click on your cluster (likely named `progrc-dev-cluster` or similar)

2. **Navigate to Node Pools**:
   - Click on "Node Pools" tab in the left sidebar
   - You should see your primary node pool

3. **Edit Node Pool**:
   - Click the "..." menu next to your node pool
   - Select "Edit" or "Scale"
   - Change the node count from **4** to **2**
   - Click "Save" or "Apply"

4. **Wait for Scaling**:
   - The cluster will automatically:
     - Reschedule pods from the 2 nodes being removed
     - Drain the nodes
     - Remove the nodes
   - This takes 5-10 minutes

5. **Verify**:
   ```bash
   kubectl get nodes
   ```
   Should show only 2 nodes after scaling completes.

---

## 📋 **Method 2: Using doctl** (Command Line)

### **Prerequisites**:
- `doctl` installed and authenticated
- API token configured

### **Steps**:

1. **List Clusters**:
   ```bash
   doctl kubernetes cluster list
   ```
   Note your cluster ID.

2. **List Node Pools**:
   ```bash
   doctl kubernetes cluster node-pool list <CLUSTER_ID>
   ```
   Note your node pool ID.

3. **Scale Down**:
   ```bash
   doctl kubernetes cluster node-pool update <CLUSTER_ID> <NODE_POOL_ID> --count 2
   ```

4. **Monitor**:
   ```bash
   kubectl get nodes -w
   ```

---

## ⚠️ **What Happens During Scale Down**

1. **Pod Rescheduling**:
   - Pods on nodes being removed will be gracefully terminated
   - New pods will be created on remaining nodes
   - No downtime (pods are rescheduled before nodes are removed)

2. **Node Drain**:
   - Kubernetes will mark nodes as "unschedulable"
   - Pods will be evicted and rescheduled
   - Node will be drained of all workloads

3. **Node Removal**:
   - DigitalOcean will delete the droplet
   - Node will disappear from `kubectl get nodes`
   - Cluster will continue running on remaining 2 nodes

---

## ✅ **Expected Result**

**Before**:
```
NAME                                    STATUS   ROLES    AGE
progrc-dev-cluster-primary-pool-50m67  Ready    <none>   6d23h
progrc-dev-cluster-primary-pool-50ozf  Ready    <none>   6d17h
progrc-dev-cluster-primary-pool-knv0q  Ready    <none>   16m
progrc-dev-cluster-primary-pool-knvdj  Ready    <none>   18m
```

**After** (5-10 minutes):
```
NAME                                    STATUS   ROLES    AGE
progrc-dev-cluster-primary-pool-50m67  Ready    <none>   6d23h
progrc-dev-cluster-primary-pool-50ozf  Ready    <none>   6d17h
```

---

## 💰 **Cost Savings**

- **Before**: 4 nodes × $24/month = **$96/month**
- **After**: 2 nodes × $24/month = **$48/month**
- **Savings**: **$48/month** (~$576/year)

---

## 🔍 **Verification**

After scaling completes, verify:

```bash
# Check node count
kubectl get nodes

# Check pod distribution
kubectl get pods -n progrc-dev -o wide

# Verify all pods are running
kubectl get pods -n progrc-dev
```

All pods should be running on the 2 remaining nodes.

---

## ⚠️ **Important Notes**

- ✅ **Safe**: This operation is safe - pods will be rescheduled automatically
- ✅ **No Downtime**: Application will continue running during scale down
- ✅ **Reversible**: You can scale back up if needed
- ⚠️ **Timing**: Takes 5-10 minutes to complete
- ⚠️ **Resource Check**: Ensure 2 nodes have enough capacity for all pods

---

## 🆘 **Troubleshooting**

### **If pods fail to reschedule**:
```bash
# Check node resources
kubectl describe nodes

# Check pod status
kubectl get pods -n progrc-dev

# Check events
kubectl get events -n progrc-dev --sort-by='.lastTimestamp'
```

### **If scaling fails**:
- Check DigitalOcean console for error messages
- Verify you have permissions to modify the cluster
- Ensure cluster is not in a maintenance window

---

## 📝 **Next Steps After Scaling**

1. **Monitor for 15-30 minutes** to ensure stability
2. **Check application** is working correctly
3. **Verify resource usage** on remaining nodes
4. **Consider setting minimum node count** to prevent auto-scaling back up unnecessarily
