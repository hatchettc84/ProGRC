# Manual Method: Add SSH Key to Droplets (No doctl Needed)

## 🎯 Method 1: Via DigitalOcean Console (Easiest)

### Step 1: Access Droplet Console

1. Go to: https://cloud.digitalocean.com/droplets
2. Click on droplet (142.93.183.7 or 64.225.20.65)
3. Click **"Access"** tab
4. Click **"Launch Droplet Console"**
5. Terminal opens in browser

### Step 2: Add SSH Key Manually

Run these commands in the console:

```bash
# Create .ssh directory if it doesn't exist
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Add your public key to authorized_keys
echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOeEi8btficCLzA+UZGTmUdYJe/IpH2LGGw/gzyaccm/ progrc-droplet-access" >> ~/.ssh/authorized_keys

# Set correct permissions
chmod 600 ~/.ssh/authorized_keys
chown root:root ~/.ssh/authorized_keys

# Verify it was added
cat ~/.ssh/authorized_keys
```

### Step 3: Test SSH Connection

From your local machine:

```bash
ssh -i ~/.ssh/progrc_droplet root@142.93.183.7
ssh -i ~/.ssh/progrc_droplet root@64.225.20.65
```

## 🎯 Method 2: Via DigitalOcean Dashboard

### Add Key to Droplets via Dashboard:

1. **Go to Droplets**:
   - https://cloud.digitalocean.com/droplets

2. **For Each Droplet**:
   - Click on droplet (142.93.183.7 or 64.225.20.65)
   - Click **"Settings"** tab (left sidebar)
   - Scroll to **"SSH Keys"** section
   - Click **"Add SSH Key"** button
   - Select: `progrc-droplet-key` (or your key name)
   - Click **"Add SSH Key"**

3. **Wait 10-30 seconds** for changes to propagate

4. **Test Connection**:
   ```bash
   ssh -i ~/.ssh/progrc_droplet root@142.93.183.7
   ```

## 🎯 Method 3: Using curl with DigitalOcean API

If you have your API token, you can use curl:

```bash
# Set your API token
export DO_API_TOKEN="your_api_token_here"

# Get SSH key ID
SSH_KEY_ID=$(curl -s -X GET \
  -H "Authorization: Bearer $DO_API_TOKEN" \
  "https://api.digitalocean.com/v2/account/keys" | \
  jq -r '.ssh_keys[] | select(.name=="progrc-droplet-key") | .id')

# Get droplet IDs
DROPLET_142_ID=$(curl -s -X GET \
  -H "Authorization: Bearer $DO_API_TOKEN" \
  "https://api.digitalocean.com/v2/droplets" | \
  jq -r '.droplets[] | select(.networks.v4[] | .ip_address=="142.93.183.7") | .id')

DROPLET_AI_ID=$(curl -s -X GET \
  -H "Authorization: Bearer $DO_API_TOKEN" \
  "https://api.digitalocean.com/v2/droplets" | \
  jq -r '.droplets[] | select(.networks.v4[] | .ip_address=="64.225.20.65") | .id')

# Add SSH key to droplets
curl -X POST \
  -H "Authorization: Bearer $DO_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"type\":\"assign\",\"resources\":[{\"id\":\"$DROPLET_142_ID\",\"type\":\"droplet\"},{\"id\":\"$DROPLET_AI_ID\",\"type\":\"droplet\"}]}" \
  "https://api.digitalocean.com/v2/account/keys/$SSH_KEY_ID/assign"
```

## ✅ Recommended: Use Method 1 (Console) or Method 2 (Dashboard)

Both are easier and don't require installing anything.

---

**Quickest**: Use DigitalOcean Console to manually add the key to `~/.ssh/authorized_keys`
