# SSH Key Setup for DigitalOcean Droplets

## 🔑 Generate SSH Key

### Option 1: Run the Script (Recommended)
```bash
./generate-ssh-key.sh
```

### Option 2: Manual Generation
```bash
# Generate ED25519 key (recommended - more secure and faster)
ssh-keygen -t ed25519 -C "progrc-droplet-access" -f ~/.ssh/progrc_droplet

# Or generate RSA key (if ED25519 not supported)
ssh-keygen -t rsa -b 4096 -C "progrc-droplet-access" -f ~/.ssh/progrc_droplet
```

**Note**: Press Enter when prompted for passphrase (or set one for extra security)

## 📋 Add Public Key to DigitalOcean

### Method 1: Via Dashboard (Easiest)

1. **Get your public key**:
   ```bash
   cat ~/.ssh/progrc_droplet.pub
   ```

2. **Add to DigitalOcean**:
   - Go to: https://cloud.digitalocean.com/account/security
   - Click **"Add SSH Key"** button
   - Paste the public key (starts with `ssh-ed25519` or `ssh-rsa`)
   - Give it a name: `progrc-droplet-key`
   - Click **"Add SSH Key"**

3. **Add to existing droplets**:
   - Dashboard → Droplets
   - Click on droplet (142.93.183.7 or 64.225.20.65)
   - Click **"Settings"** tab
   - Scroll to **"SSH Keys"** section
   - Click **"Add SSH Key"**
   - Select your key: `progrc-droplet-key`
   - Click **"Add SSH Key"**

### Method 2: Via doctl (Command Line)

```bash
# Add SSH key to DigitalOcean
doctl compute ssh-key create progrc-droplet-key \
  --public-key-file ~/.ssh/progrc_droplet.pub

# Get the key ID
doctl compute ssh-key list

# Add to existing droplet (replace DROPLET_ID and KEY_ID)
doctl compute droplet add-ssh-key DROPLET_ID --ssh-keys KEY_ID
```

## 🔐 Connect Using the Key

### Direct Connection:
```bash
ssh -i ~/.ssh/progrc_droplet root@142.93.183.7
ssh -i ~/.ssh/progrc_droplet root@64.225.20.65
```

### Add to SSH Config (Easier Access):

Edit `~/.ssh/config`:
```bash
nano ~/.ssh/config
```

Add:
```
Host progrc-droplet-142
    HostName 142.93.183.7
    User root
    IdentityFile ~/.ssh/progrc_droplet
    IdentitiesOnly yes

Host progrc-droplet-ai
    HostName 64.225.20.65
    User root
    IdentityFile ~/.ssh/progrc_droplet
    IdentitiesOnly yes
```

Save and set permissions:
```bash
chmod 600 ~/.ssh/config
```

Now connect easily:
```bash
ssh progrc-droplet-142
ssh progrc-droplet-ai
```

## ✅ Verify Setup

### Test Connection:
```bash
# Test with verbose output
ssh -v -i ~/.ssh/progrc_droplet root@142.93.183.7

# Or if using SSH config
ssh -v progrc-droplet-142
```

### Check Key Permissions:
```bash
# Should be 600 (read/write for owner only)
ls -la ~/.ssh/progrc_droplet

# Should be 644 (readable by all)
ls -la ~/.ssh/progrc_droplet.pub
```

If permissions are wrong:
```bash
chmod 600 ~/.ssh/progrc_droplet
chmod 644 ~/.ssh/progrc_droplet.pub
```

## 🔍 Troubleshooting

### Issue: "Permission denied (publickey)"

**Solutions**:
1. **Verify key is added to DigitalOcean**:
   - Dashboard → Account → Security → SSH Keys
   - Ensure your key is listed

2. **Verify key is added to droplet**:
   - Dashboard → Droplet → Settings → SSH Keys
   - Ensure your key is checked

3. **Check key permissions**:
   ```bash
   chmod 600 ~/.ssh/progrc_droplet
   ```

4. **Use correct key path**:
   ```bash
   ssh -i ~/.ssh/progrc_droplet root@142.93.183.7
   ```

5. **Check SSH agent**:
   ```bash
   ssh-add ~/.ssh/progrc_droplet
   ```

### Issue: "Host key verification failed"

**Solution**:
```bash
# Remove old host key
ssh-keygen -R 142.93.183.7
ssh-keygen -R 64.225.20.65

# Or add to known_hosts manually
ssh-keyscan -H 142.93.183.7 >> ~/.ssh/known_hosts
```

## 📝 Quick Reference

### Key Files:
- **Private Key**: `~/.ssh/progrc_droplet` (keep secret!)
- **Public Key**: `~/.ssh/progrc_droplet.pub` (share with DigitalOcean)

### Commands:
```bash
# Generate key
./generate-ssh-key.sh

# View public key
cat ~/.ssh/progrc_droplet.pub

# Connect to droplet
ssh -i ~/.ssh/progrc_droplet root@142.93.183.7

# Or with SSH config
ssh progrc-droplet-142
```

## 🔒 Security Best Practices

1. **Never share your private key** (`~/.ssh/progrc_droplet`)
2. **Only share the public key** (`~/.ssh/progrc_droplet.pub`)
3. **Set proper permissions**: `chmod 600` for private key
4. **Use passphrase** (optional but recommended):
   ```bash
   ssh-keygen -t ed25519 -f ~/.ssh/progrc_droplet
   # Enter passphrase when prompted
   ```
5. **Use different keys** for different purposes/projects

---

**After setup, you can connect to your droplets without passwords!**
