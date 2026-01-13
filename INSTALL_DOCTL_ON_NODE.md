# Install doctl on Kubernetes Node

## 🔧 Install doctl on the Node

Since you're on a Kubernetes node, install doctl first:

```bash
# Download doctl
cd /tmp
wget https://github.com/digitalocean/doctl/releases/download/v1.104.0/doctl-1.104.0-linux-amd64.tar.gz

# Extract
tar xf doctl-1.104.0-linux-amd64.tar.gz

# Move to /usr/local/bin
sudo mv doctl /usr/local/bin/

# Verify installation
doctl version

# Authenticate (you'll need your API token)
doctl auth init
# Enter your DigitalOcean API token when prompted
```

## 📋 Then Run the Commands

```bash
# Step 1: Get your SSH key ID
doctl compute ssh-key list

# Step 2: Get droplet IDs
doctl compute droplet list

# Step 3: Add key to droplets (replace IDs with actual values)
doctl compute droplet add-ssh-key DROPLET_ID_142 --ssh-keys SSH_KEY_ID
doctl compute droplet add-ssh-key DROPLET_ID_AI --ssh-keys SSH_KEY_ID
```

## 🚀 Alternative: Manual Method (No doctl Needed)

If you don't want to install doctl, use the manual method via DigitalOcean Console.
