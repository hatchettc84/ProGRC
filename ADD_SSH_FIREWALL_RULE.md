# Add SSH (Port 22) to DigitalOcean Firewall

## 🚀 Quick Method: DigitalOcean Dashboard

### Step-by-Step Instructions:

1. **Go to Firewalls**:
   - Navigate to: https://cloud.digitalocean.com/networking/firewalls
   - Or: Dashboard → Networking → Firewalls

2. **Select Your Firewall**:
   - Click on the firewall that's attached to your droplets
   - If you have multiple, check which one is attached to your droplets

3. **Edit Firewall**:
   - Click the **"Edit"** button (top right)

4. **Add SSH Rule**:
   - Scroll to **"Inbound Rules"** section
   - Click **"Add Rule"** button
   - Configure:
     - **Type**: Select **"SSH"** (or Custom)
     - **Port Range**: `22` (or `22-22`)
     - **Sources**: 
       - **Option 1 (Less Secure)**: `0.0.0.0/0,::/0` (allows from anywhere)
       - **Option 2 (More Secure)**: Your specific IP address
         - Find your IP: `curl ifconfig.me`
         - Enter: `YOUR_IP/32`

5. **Save Changes**:
   - Click **"Save Changes"** button
   - Wait for confirmation

6. **Verify**:
   - The firewall should now show SSH (22) in inbound rules
   - Try SSH again: `ssh root@142.93.183.7`

## 🔧 Alternative: Using doctl (Command Line)

If you have `doctl` configured and working:

### Step 1: List Firewalls
```bash
doctl compute firewall list
```

### Step 2: Get Firewall ID
```bash
# Note the ID of the firewall attached to your droplets
doctl compute firewall list --format ID,Name
```

### Step 3: Add SSH Rule
```bash
# Replace FIREWALL_ID with your actual firewall ID
doctl compute firewall add-rules FIREWALL_ID \
  --inbound-rules "type:ssh,port:22,source_addresses:0.0.0.0/0,::/0"
```

### More Secure (Your IP Only):
```bash
# Get your IP first
MY_IP=$(curl -s ifconfig.me)

# Add rule with your IP only
doctl compute firewall add-rules FIREWALL_ID \
  --inbound-rules "type:ssh,port:22,source_addresses:$MY_IP/32"
```

## 📋 Firewall Rule Details

### SSH Rule Configuration:
- **Type**: SSH (or Custom TCP)
- **Port**: 22
- **Protocol**: TCP
- **Sources**:
  - `0.0.0.0/0` (IPv4 - anywhere)
  - `::/0` (IPv6 - anywhere)
  - Or your specific IP: `YOUR_IP/32`

### Security Recommendations:

1. **For Development/Testing**:
   - Use `0.0.0.0/0,::/0` (allows from anywhere)
   - Easier to connect from different locations

2. **For Production**:
   - Use your specific IP address: `YOUR_IP/32`
   - More secure, only allows your IP
   - Find your IP: `curl ifconfig.me`

3. **For Multiple IPs**:
   - Add multiple rules, one per IP
   - Or use IP ranges if you have a static range

## 🔍 Verify Firewall Rules

### Check via Dashboard:
1. Go to Firewall details
2. Check "Inbound Rules" section
3. Should see: **SSH** on port **22**

### Check via doctl:
```bash
doctl compute firewall get FIREWALL_ID --format InboundRules
```

### Test SSH Connection:
```bash
# After adding the rule, test SSH
ssh -v root@142.93.183.7

# Or test port connectivity
nc -zv 142.93.183.7 22
```

## ⚠️ Troubleshooting

### Rule Added But Still Can't Connect?

1. **Check Droplet Status**:
   - Ensure droplet is "Active" (not "Off")
   - Power on if needed

2. **Verify Firewall is Attached**:
   - Dashboard → Droplet → Networking tab
   - Check if firewall is listed

3. **Check Multiple Firewalls**:
   - You might have multiple firewalls
   - Ensure the correct one is attached to your droplet

4. **Wait a Few Seconds**:
   - Firewall rules can take 10-30 seconds to propagate

5. **Check Droplet's Built-in Firewall**:
   - Some droplets have `ufw` enabled
   - SSH into droplet (via console) and check:
     ```bash
     ufw status
     ufw allow 22/tcp
     ```

## 📝 Example: Complete Firewall Setup

### Inbound Rules (Recommended):
- **SSH** (22) - From your IP or `0.0.0.0/0`
- **HTTP** (80) - From `0.0.0.0/0` (if needed)
- **HTTPS** (443) - From `0.0.0.0/0` (if needed)
- **Custom** (11434) - From Kubernetes cluster (for Ollama)

### Outbound Rules:
- Usually allow all (default)

## ✅ Quick Checklist

- [ ] Firewall rule added for SSH (port 22)
- [ ] Source set to your IP or `0.0.0.0/0`
- [ ] Firewall attached to droplet
- [ ] Droplet is "Active"
- [ ] Tested SSH connection

---

**After adding the rule, try SSH again:**
```bash
ssh root@142.93.183.7
```

If it still doesn't work, use the DigitalOcean Web Console to access the droplet and check for any additional firewall configurations.
