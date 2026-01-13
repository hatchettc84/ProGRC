# SSH Connection Troubleshooting

## 🔍 Current Issue

SSH connection is still failing with "Permission denied (publickey,password)".

## 🔧 Troubleshooting Steps

### Step 1: Verify Key Format in DigitalOcean

1. Go to: https://cloud.digitalocean.com/account/security
2. Find your SSH key: `progrc-droplet-key`
3. Click on it to view
4. Verify it matches exactly:
   ```
   ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOeEi8btficCLzA+UZGTmUdYJe/IpH2LGGw/gzyaccm/ progrc-droplet-access
   ```

### Step 2: Verify Key is Added to Droplets

For each droplet:

1. Dashboard → Droplets → Click droplet
2. Settings tab → SSH Keys section
3. Verify `progrc-droplet-key` is:
   - ✅ Listed
   - ✅ Checked/enabled
   - ✅ Not grayed out

### Step 3: Check Key Permissions Locally

```bash
# Should be 600 (read/write for owner only)
ls -la ~/.ssh/progrc_droplet

# If not, fix it:
chmod 600 ~/.ssh/progrc_droplet
chmod 644 ~/.ssh/progrc_droplet.pub
```

### Step 4: Test with Verbose Output

```bash
ssh -v -i ~/.ssh/progrc_droplet root@142.93.183.7
```

Look for:
- `Offering public key` - Key is being sent
- `Server accepts key` - Key is accepted
- `Permission denied` - Key is rejected

### Step 5: Try Adding Key to SSH Agent

```bash
# Start SSH agent
eval "$(ssh-agent -s)"

# Add key to agent
ssh-add ~/.ssh/progrc_droplet

# Test connection
ssh -i ~/.ssh/progrc_droplet root@142.93.183.7
```

### Step 6: Wait for Propagation

- DigitalOcean may need 1-2 minutes to propagate SSH keys
- Try again after waiting

### Step 7: Restart Droplet (if needed)

If key still doesn't work:

1. Dashboard → Droplet → Power → Reboot
2. Wait for droplet to come back online
3. Try SSH again

## 🚀 Alternative: Use DigitalOcean Console

**No SSH needed!**

1. Go to: https://cloud.digitalocean.com/droplets
2. Click on droplet
3. Click **"Access"** tab
4. Click **"Launch Droplet Console"**
5. Terminal opens in browser

This works even if SSH is having issues.

## 🔄 Alternative: Reset Root Password

If you need immediate access:

1. Dashboard → Droplet → **"Access"** tab
2. Click **"Reset Root Password"**
3. Check email for new password
4. Connect with:
   ```bash
   ssh root@142.93.183.7
   # Enter password when prompted
   ```

## 🔍 Verify Key is Correct

### Your Public Key:
```bash
cat ~/.ssh/progrc_droplet.pub
```

Should output:
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOeEi8btficCLzA+UZGTmUdYJe/IpH2LGGw/gzyaccm/ progrc-droplet-access
```

### In DigitalOcean:
- Must be exactly this format (one line)
- No extra spaces or line breaks
- Starts with `ssh-ed25519`

## 📋 Checklist

- [ ] Key added to DigitalOcean account
- [ ] Key added to droplet 142.93.183.7
- [ ] Key added to droplet 64.225.20.65
- [ ] Key format is correct (one line, no breaks)
- [ ] Key permissions are 600
- [ ] Firewall allows SSH (port 22) ✅
- [ ] Waited 1-2 minutes for propagation
- [ ] Tried with verbose output (`ssh -v`)

## 🎯 Next Steps

1. **Try DigitalOcean Console** (easiest, no SSH needed)
2. **Verify key format** matches exactly
3. **Check verbose output** to see what's happening
4. **Try SSH agent** method
5. **Reset password** if urgent access needed

---

**Recommended**: Use DigitalOcean Console for immediate access while troubleshooting SSH.
