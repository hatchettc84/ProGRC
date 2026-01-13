# Droplet Connection Troubleshooting Guide

## 🔍 Known Droplets

Based on project files, you have these droplets:

1. **AI Droplet**: `64.225.20.65` (progrc-ai-droplet)
2. **Other Droplet**: `142.93.183.7` (purpose unknown)

## ❌ Common Connection Issues

### Issue 1: Connection Timeout

**Symptoms**: `ssh: connect to host X.X.X.X port 22: Operation timed out`

**Possible Causes**:
1. Droplet is powered off
2. Firewall blocking SSH (port 22)
3. Network/VPC restrictions
4. Wrong IP address
5. Droplet was deleted

**Solutions**:

#### A. Check Droplet Status via DigitalOcean Dashboard
1. Go to [DigitalOcean Dashboard](https://cloud.digitalocean.com)
2. Navigate to **Droplets**
3. Find the droplet by IP address
4. Check status:
   - ✅ **Active** = Running
   - ⚠️ **Off** = Powered off (click Power On)
   - ❌ **Archived** = Deleted

#### B. Use DigitalOcean Web Console (No SSH Required)
1. Go to DigitalOcean Dashboard → Droplets
2. Click on the droplet
3. Click **"Access"** tab
4. Click **"Launch Droplet Console"**
5. This opens a web-based terminal (works even if SSH is blocked)

#### C. Check Firewall Rules
1. Go to DigitalOcean Dashboard → **Networking** → **Firewalls**
2. Find firewall attached to your droplet
3. Verify **Inbound Rules** include:
   - **SSH** (port 22) from your IP or `0.0.0.0/0`
4. If missing, add rule:
   - Type: SSH
   - Port: 22
   - Sources: Your IP or `0.0.0.0/0`

#### D. Check Cloud Firewall (if using)
1. Go to DigitalOcean Dashboard → **Networking** → **Cloud Firewalls**
2. Check if firewall is blocking SSH
3. Temporarily disable to test

### Issue 2: TLS Certificate Errors (doctl)

**Symptoms**: `tls: failed to verify certificate: x509: OSStatus -26276`

**Solutions**:

#### A. Update doctl
```bash
# macOS
brew upgrade doctl

# Or download latest
wget https://github.com/digitalocean/doctl/releases/latest/download/doctl-X.X.X-darwin-amd64.tar.gz
tar xf doctl-*.tar.gz
sudo mv doctl /usr/local/bin
```

#### B. Re-authenticate
```bash
doctl auth init
# Enter your API token when prompted
```

#### C. Check System Certificates
```bash
# macOS - Update certificates
brew install ca-certificates
```

### Issue 3: Permission Denied

**Symptoms**: `Permission denied (publickey)`

**Solutions**:

#### A. Check SSH Key
```bash
# List your SSH keys
ls -la ~/.ssh/

# Test SSH key
ssh -i ~/.ssh/your_key -v root@142.93.183.7
```

#### B. Add SSH Key to DigitalOcean
1. Go to DigitalOcean Dashboard → **Settings** → **Security** → **SSH Keys**
2. Add your public key: `cat ~/.ssh/id_rsa.pub`
3. When creating droplet, select this SSH key

#### C. Use Password Authentication (if enabled)
```bash
ssh root@142.93.183.7
# Enter password when prompted
```

## ✅ Alternative Connection Methods

### Method 1: DigitalOcean Web Console (Recommended)

**Best for**: When SSH is blocked or not working

1. Go to [DigitalOcean Dashboard](https://cloud.digitalocean.com)
2. Navigate to **Droplets**
3. Click on the droplet
4. Click **"Access"** tab
5. Click **"Launch Droplet Console"**
6. Web-based terminal opens (no SSH needed)

### Method 2: Use doctl (if working)

```bash
# List all droplets
doctl compute droplet list

# SSH using droplet ID
doctl compute ssh DROPLET_ID

# Or SSH using droplet name
doctl compute ssh progrc-ai-droplet
```

### Method 3: Direct SSH with Verbose Output

```bash
# See detailed connection info
ssh -v root@142.93.183.7

# Or with specific key
ssh -i ~/.ssh/your_key -v root@142.93.183.7
```

### Method 4: Test Connectivity First

```bash
# Test if port 22 is open
nc -zv 142.93.183.7 22

# Or using telnet
telnet 142.93.183.7 22

# Test ping
ping -c 3 142.93.183.7
```

## 🔧 Quick Fixes

### Fix 1: Power On Droplet
1. DigitalOcean Dashboard → Droplets
2. Find droplet → Click **Power On**

### Fix 2: Reset Root Password
1. DigitalOcean Dashboard → Droplets
2. Click droplet → **Access** → **Reset Root Password**
3. Check email for new password
4. Use password to SSH: `ssh root@142.93.183.7`

### Fix 3: Rebuild Droplet (Last Resort)
1. DigitalOcean Dashboard → Droplets
2. Click droplet → **Settings** → **Rebuild**
3. **Warning**: This will delete all data!

### Fix 4: Check VPC/Network Settings
1. DigitalOcean Dashboard → Droplets
2. Click droplet → **Networking** tab
3. Check if in VPC (may need VPC access)
4. Check if private networking is blocking

## 📋 Step-by-Step Diagnostic

Run these commands to diagnose:

```bash
# 1. Test basic connectivity
ping -c 3 142.93.183.7

# 2. Test SSH port
nc -zv 142.93.183.7 22

# 3. Try SSH with verbose output
ssh -v root@142.93.183.7

# 4. Check if droplet exists (if doctl works)
doctl compute droplet list | grep 142.93.183.7
```

## 🎯 Recommended Solution

**If SSH is not working, use DigitalOcean Web Console:**

1. ✅ No SSH configuration needed
2. ✅ Works even if firewall blocks SSH
3. ✅ No network issues
4. ✅ Direct access to droplet

**Steps**:
1. Go to https://cloud.digitalocean.com
2. Droplets → Find droplet (by IP or name)
3. Click **"Access"** → **"Launch Droplet Console"**
4. Terminal opens in browser

## 📞 What to Check in DigitalOcean Dashboard

1. **Droplet Status**: Active/Off/Archived
2. **Firewall Rules**: SSH (22) allowed
3. **SSH Keys**: Your key is added
4. **Network**: VPC settings
5. **IP Address**: Correct IP

## 🔍 For Specific Droplets

### AI Droplet (64.225.20.65)
- **Name**: progrc-ai-droplet
- **Purpose**: Runs Ollama
- **Access**: Should be accessible for Ollama API (port 11434)

### Other Droplet (142.93.183.7)
- **Purpose**: Unknown (check DigitalOcean dashboard)
- **Access**: Standard SSH (port 22)

---

**Next Steps**:
1. Try DigitalOcean Web Console first (easiest)
2. Check droplet status in dashboard
3. Verify firewall rules
4. Test connectivity with ping/nc
5. Try SSH with verbose output for detailed errors
