# Droplet Cleanup Guide

## 🔍 **Current Infrastructure**

### **Kubernetes Cluster Nodes** (DO NOT DELETE - Managed by DOKS)
These are automatically managed by DigitalOcean Kubernetes Service:

1. **progrc-dev-cluster-primary-pool-50m67** - `45.55.185.33` (6 days old)
   - Running: Frontend, Redis, LocalStack, 1 Backend pod

2. **progrc-dev-cluster-primary-pool-50ozf** - `142.93.183.7` (6 days old)
   - Running: Completed jobs

3. **progrc-dev-cluster-primary-pool-knv0q** - `159.203.71.170` (16 minutes old) ⚠️ **NEW**
   - Running: 1 Backend pod

4. **progrc-dev-cluster-primary-pool-knvdj** - `159.89.191.112` (18 minutes old) ⚠️ **NEW**
   - Running: 1 Backend pod

### **AI Droplet** (DO NOT DELETE - Required for Ollama)
- **Name**: `progrc-ai-droplet`
- **IP**: `64.225.20.65`
- **Purpose**: Runs Ollama for AI operations (eliminates API calls)
- **Status**: ✅ Required and actively used

---

## ⚠️ **About the New Nodes**

The 2 new Kubernetes nodes (`knv0q` and `knvdj`) were **auto-scaled** by the cluster autoscaler when:
- Building Docker images (Kaniko jobs)
- Pods needed more resources
- Cluster needed more capacity

**Current Status**: They ARE being used (each has a backend pod)

---

## 🎯 **Options for Cleanup**

### **Option 1: Scale Down Node Pool** (Recommended)
If you want to reduce to 2 nodes, you can:

1. **Scale down the node pool** (nodes will be removed automatically):
   ```bash
   # Check current node pool configuration
   doctl kubernetes cluster node-pool list <CLUSTER_ID>
   
   # Scale down to minimum nodes (2)
   doctl kubernetes cluster node-pool update <CLUSTER_ID> <NODE_POOL_ID> --count 2
   ```

2. **Wait for pods to reschedule** to the remaining 2 nodes

3. **Cluster autoscaler will remove unused nodes**

### **Option 2: Let Autoscaler Handle It** (Automatic)
The cluster autoscaler will automatically:
- Remove nodes that are underutilized for 10+ minutes
- Keep nodes that have pods running
- Scale up when needed

**Recommendation**: Wait 10-15 minutes, and the autoscaler may remove the extra nodes if they're not needed.

### **Option 3: Manual Node Removal** (NOT Recommended)
⚠️ **Do NOT manually delete Kubernetes nodes** - they're managed by DOKS. If you delete them:
- They may be automatically recreated
- You may cause pod disruptions
- You may break cluster functionality

---

## 🔍 **Finding Standalone Droplets**

If you see droplets in the DigitalOcean console that are **NOT** listed above, they might be unnecessary.

### **How to Identify Standalone Droplets:**

1. **Check DigitalOcean Console**:
   - Go to: https://cloud.digitalocean.com/droplets
   - Look for droplets that are NOT Kubernetes nodes
   - Look for droplets that are NOT the AI droplet (`64.225.20.65`)

2. **Verify Droplet Purpose**:
   - Check droplet name and tags
   - Check if it has any running services
   - Check if it's referenced in your code/config

3. **Safe to Delete If**:
   - ✅ Not a Kubernetes node (doesn't start with `progrc-dev-cluster-`)
   - ✅ Not the AI droplet (`64.225.20.65`)
   - ✅ No running services
   - ✅ Not referenced in code/config
   - ✅ No important data

---

## 🗑️ **How to Delete Unnecessary Droplets**

### **Via DigitalOcean Console** (Recommended):
1. Go to: https://cloud.digitalocean.com/droplets
2. Find the droplet you want to delete
3. Click the "..." menu → "Destroy"
4. Confirm deletion

### **Via doctl** (Command Line):
```bash
# List all droplets
doctl compute droplet list

# Delete a specific droplet (replace DROPLET_ID)
doctl compute droplet delete <DROPLET_ID>

# Delete multiple droplets
doctl compute droplet delete <DROPLET_ID_1> <DROPLET_ID_2>
```

---

## ✅ **Droplets to KEEP**

**DO NOT DELETE**:
- ✅ Any droplet with name starting with `progrc-dev-cluster-` (Kubernetes nodes)
- ✅ `progrc-ai-droplet` (`64.225.20.65`) - Required for Ollama

---

## 📊 **Cost Impact**

**Current Setup**:
- 4 Kubernetes nodes × $24/month = **$96/month**
- 1 AI Droplet × $48/month = **$48/month**
- **Total**: ~$144/month

**If Scaled to 2 Nodes**:
- 2 Kubernetes nodes × $24/month = **$48/month**
- 1 AI Droplet × $48/month = **$48/month**
- **Total**: ~$96/month

**Savings**: ~$48/month by scaling to 2 nodes

---

## 🎯 **Recommended Action**

1. **Wait 10-15 minutes** - Let cluster autoscaler remove unused nodes automatically
2. **If nodes remain**, check if they're actually needed (pods running on them)
3. **If not needed**, scale down the node pool to 2 nodes
4. **Check for standalone droplets** in DigitalOcean console and delete if unnecessary

---

## ⚠️ **Warnings**

- ❌ **DO NOT** manually delete Kubernetes nodes via `doctl` or console
- ❌ **DO NOT** delete the AI droplet (`64.225.20.65`)
- ✅ **DO** use node pool scaling to reduce node count
- ✅ **DO** let cluster autoscaler handle node management
- ✅ **DO** verify droplet purpose before deletion
