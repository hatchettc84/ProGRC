# Add SSH Key to Individual Droplets

## ⚠️ Important: Key Must Be Added to Each Droplet

Adding the key to your DigitalOcean account is the first step, but you also need to add it to each individual droplet.

## 📋 Step-by-Step: Add Key to Droplets

### For Droplet 142.93.183.7:

1. **Go to Droplet**:
   - Dashboard → Droplets
   - Find droplet with IP `142.93.183.7`
   - Click on the droplet name

2. **Add SSH Key**:
   - Click **"Settings"** tab (left sidebar)
   - Scroll down to **"SSH Keys"** section
   - Click **"Add SSH Key"** button
   - Select: `progrc-droplet-key` (or the name you gave it)
   - Click **"Add SSH Key"**

3. **Wait a moment**:
   - DigitalOcean may need a few seconds to apply the key
   - The droplet doesn't need to be restarted

### For AI Droplet (64.225.20.65):

1. **Go to Droplet**:
   - Dashboard → Droplets
   - Find droplet with IP `64.225.20.65` (or name `progrc-ai-droplet`)
   - Click on the droplet name

2. **Add SSH Key**:
   - Click **"Settings"** tab
   - Scroll to **"SSH Keys"** section
   - Click **"Add SSH Key"**
   - Select: `progrc-droplet-key`
   - Click **"Add SSH Key"**

## 🔍 Verify Key is Added

### Check via Dashboard:
1. Droplet → Settings → SSH Keys
2. You should see `progrc-droplet-key` listed and checked

### Check via doctl (if working):
```bash
doctl compute droplet get DROPLET_ID --format SSHKeys
```

## 🔄 Alternative: Add Key When Creating New Droplets

If you create new droplets in the future:
1. When creating droplet
2. In "Authentication" section
3. Select your SSH key: `progrc-droplet-key`
4. The key will be automatically added

## 🚀 After Adding Key to Droplets

Try connecting again:

```bash
ssh -i ~/.ssh/progrc_droplet root@142.93.183.7
ssh -i ~/.ssh/progrc_droplet root@64.225.20.65
```

## 🔧 If Still Not Working

### Option 1: Use DigitalOcean Console (No SSH Needed)

1. Dashboard → Droplets
2. Click droplet
3. Click **"Access"** tab
4. Click **"Launch Droplet Console"**
5. Terminal opens in browser

### Option 2: Reset Root Password

If you need immediate access:

1. Dashboard → Droplet → **"Access"** tab
2. Click **"Reset Root Password"**
3. Check email for new password
4. Connect with password:
   ```bash
   ssh root@142.93.183.7
   # Enter password when prompted
   ```

### Option 3: Verify Key Format

Make sure the public key was added correctly:

```bash
# View your public key
cat ~/.ssh/progrc_droplet.pub

# Should look like:
# ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOeEi8btficCLzA+UZGTmUdYJe/IpH2LGGw/gzyaccm/ progrc-droplet-access
```

In DigitalOcean, the key should be exactly this format (one line).

## ✅ Quick Checklist

- [ ] SSH key added to DigitalOcean account
- [ ] SSH key added to droplet 142.93.183.7
- [ ] SSH key added to droplet 64.225.20.65
- [ ] Firewall allows SSH (port 22) ✅ (already done)
- [ ] Tested SSH connection

---

**After adding the key to both droplets, try connecting again!**
