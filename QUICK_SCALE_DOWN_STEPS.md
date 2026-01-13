# Quick Scale Down Steps - DigitalOcean Console

## 🎯 **Goal**: Scale from 4 nodes → 2 nodes

**Time Required**: 2 minutes to initiate, 5-10 minutes to complete

---

## 📋 **Step-by-Step Instructions**

### **Step 1: Open Kubernetes Dashboard**
1. Go to: **https://cloud.digitalocean.com/kubernetes/clusters**
2. You should see your cluster (likely named `progrc-dev-cluster` or similar)
3. **Click on the cluster name** to open it

### **Step 2: Navigate to Node Pools**
1. In the left sidebar, click **"Node Pools"**
2. You should see your primary node pool listed
3. It should show **"4 nodes"** currently

### **Step 3: Edit Node Pool**
1. Find the **"..."** (three dots) menu on the right side of your node pool row
2. Click the **"..."** menu
3. Select **"Edit"** or **"Scale"**

### **Step 4: Change Node Count**
1. Find the **"Node Count"** or **"Size"** field
2. Change it from **`4`** to **`2`**
3. Click **"Save"** or **"Apply Changes"**

### **Step 5: Confirm**
1. You may see a confirmation dialog
2. Click **"Confirm"** or **"Yes"** to proceed

### **Step 6: Monitor Progress**
1. You'll see the node pool status change to "Scaling"
2. Wait 5-10 minutes for the process to complete
3. The 2 newest nodes (`knv0q` and `knvdj`) will be automatically removed
4. Pods will be rescheduled to the 2 remaining nodes

---

## ✅ **Verification**

After 5-10 minutes, verify the scale down:

```bash
kubectl get nodes
```

You should see only **2 nodes**:
- `progrc-dev-cluster-primary-pool-50m67`
- `progrc-dev-cluster-primary-pool-50ozf`

---

## 📊 **What Happens**

1. **Pods Rescheduled**: Backend pods on the 2 nodes being removed will be moved to the remaining 2 nodes
2. **Nodes Drained**: Kubernetes will gracefully drain the nodes
3. **Nodes Removed**: DigitalOcean will delete the 2 newest droplets
4. **No Downtime**: Your application continues running throughout

---

## 💰 **Cost Savings**

- **Before**: 4 nodes × $24/month = **$96/month**
- **After**: 2 nodes × $24/month = **$48/month**
- **Savings**: **$48/month** (~$576/year)

---

## ⚠️ **Important Notes**

- ✅ **Safe Operation**: This is a standard Kubernetes operation, no risk
- ✅ **No Downtime**: Application continues running
- ✅ **Reversible**: You can scale back up anytime if needed
- ⏱️ **Timing**: Takes 5-10 minutes to complete

---

## 🆘 **If You Can't Find the Option**

1. Make sure you're in the **"Node Pools"** tab (not "Overview" or "Settings")
2. Look for an **"Edit"** button or **"..."** menu on the node pool row
3. If you see **"Scale"** or **"Resize"**, that's the right option
4. The field might be labeled **"Node Count"**, **"Size"**, or **"Instances"**

---

## 📝 **Alternative: Use API**

If you prefer command line and have `doctl` working:

```bash
# Get cluster ID
CLUSTER_ID=$(doctl kubernetes cluster list --format ID,Name --no-header | grep progrc | awk '{print $1}')

# Get node pool ID  
NODE_POOL_ID=$(doctl kubernetes cluster node-pool list $CLUSTER_ID --format ID,Name,Count --no-header | awk '{print $1}')

# Scale down
doctl kubernetes cluster node-pool update $CLUSTER_ID $NODE_POOL_ID --count 2
```

---

**Ready to proceed?** Follow Steps 1-6 above in the DigitalOcean console!
