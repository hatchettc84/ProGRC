# Add SSH Key Directly to Droplets - Commands

## 🔧 Method 1: Using doctl (Recommended)

### Step 1: Get Your SSH Key ID

```bash
# List all SSH keys in your account
doctl compute ssh-key list

# Look for your key (progrc-droplet-key) and note the ID
```

### Step 2: Get Droplet IDs

```bash
# List all droplets
doctl compute droplet list

# Find the IDs for:
# - Droplet with IP 142.93.183.7
# - Droplet with IP 64.225.20.65 (progrc-ai-droplet)
```

### Step 3: Add SSH Key to Droplets

```bash
# Replace KEY_ID and DROPLET_ID with actual values
doctl compute droplet add-ssh-key DROPLET_ID --ssh-keys KEY_ID

# Example for both droplets:
doctl compute droplet add-ssh-key DROPLET_ID_142 --ssh-keys KEY_ID
doctl compute droplet add-ssh-key DROPLET_ID_AI --ssh-keys KEY_ID
```

### Complete Example:

```bash
# 1. Get SSH key ID
SSH_KEY_ID=$(doctl compute ssh-key list --format ID,Name --no-header | grep "progrc-droplet-key" | awk '{print $1}')

# 2. Get droplet IDs
DROPLET_142_ID=$(doctl compute droplet list --format ID,Name,PublicIPv4 --no-header | grep "142.93.183.7" | awk '{print $1}')
DROPLET_AI_ID=$(doctl compute droplet list --format ID,Name,PublicIPv4 --no-header | grep "64.225.20.65" | awk '{print $1}')

# 3. Add key to both droplets
doctl compute droplet add-ssh-key $DROPLET_142_ID --ssh-keys $SSH_KEY_ID
doctl compute droplet add-ssh-key $DROPLET_AI_ID --ssh-keys $SSH_KEY_ID
```

## 🔧 Method 2: Manual via DigitalOcean Console

If you can access the droplet via DigitalOcean Console:

### Step 1: Access Droplet Console
1. Dashboard → Droplets → Click droplet
2. Access → Launch Droplet Console

### Step 2: Add Key Manually

```bash
# Create .ssh directory if it doesn't exist
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Add your public key to authorized_keys
echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOeEi8btficCLzA+UZGTmUdYJe/IpH2LGGw/gzyaccm/ progrc-droplet-access" >> ~/.ssh/authorized_keys

# Set correct permissions
chmod 600 ~/.ssh/authorized_keys
chown root:root ~/.ssh/authorized_keys
```

### Step 3: Verify

```bash
cat ~/.ssh/authorized_keys
```

## 🔧 Method 3: One-Line Script

```bash
# Get key ID and droplet IDs, then add
SSH_KEY_ID=$(doctl compute ssh-key list --format ID,Name --no-header | grep "progrc-droplet-key" | awk '{print $1}') && \
DROPLET_142=$(doctl compute droplet list --format ID,PublicIPv4 --no-header | grep "142.93.183.7" | awk '{print $1}') && \
DROPLET_AI=$(doctl compute droplet list --format ID,PublicIPv4 --no-header | grep "64.225.20.65" | awk '{print $1}') && \
doctl compute droplet add-ssh-key $DROPLET_142 --ssh-keys $SSH_KEY_ID && \
doctl compute droplet add-ssh-key $DROPLET_AI --ssh-keys $SSH_KEY_ID && \
echo "✅ SSH keys added to both droplets"
```

## 🔧 Method 4: Using DigitalOcean API

If doctl isn't working, use curl with API:

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

## 📋 Quick Reference Commands

### List SSH Keys:
```bash
doctl compute ssh-key list
```

### List Droplets:
```bash
doctl compute droplet list
```

### Add Key to Droplet:
```bash
doctl compute droplet add-ssh-key DROPLET_ID --ssh-keys KEY_ID
```

### Remove Key from Droplet:
```bash
doctl compute droplet remove-ssh-key DROPLET_ID --ssh-keys KEY_ID
```

## ✅ After Adding Key

1. **Wait 10-30 seconds** for changes to propagate
2. **Test connection**:
   ```bash
   ssh -i ~/.ssh/progrc_droplet root@142.93.183.7
   ssh -i ~/.ssh/progrc_droplet root@64.225.20.65
   ```

## 🔍 Verify Key is Added

### Check via doctl:
```bash
doctl compute droplet get DROPLET_ID --format SSHKeys
```

### Check via Dashboard:
- Droplet → Settings → SSH Keys
- Should see `progrc-droplet-key` listed

---

**Most Common Method**: Use `doctl compute droplet add-ssh-key` command
