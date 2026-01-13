# Delete AI Droplet Instructions

## Manual Deletion via DigitalOcean Control Panel

1. Log in to your DigitalOcean account
2. Navigate to **Droplets** section
3. Find the AI Droplet (IP: `64.225.20.65`)
4. Click on the Droplet name
5. Click **Destroy** tab in the left menu
6. Click **Destroy this Droplet**
7. Type the Droplet name to confirm
8. Click **Destroy Droplet**

## Deletion via CLI (if network access available)

```bash
# List droplets to find the ID
doctl compute droplet list

# Delete the AI droplet (replace DROPLET_ID with actual ID)
doctl compute droplet delete DROPLET_ID
```

## After Deletion

Once the droplet is deleted:
- The IP `64.225.20.65` will be released
- All data on the droplet will be permanently lost
- The backend will automatically fall back to Gradient AI Platform or other LLM services


