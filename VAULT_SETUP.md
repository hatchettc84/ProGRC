# HashiCorp Vault Integration

This document explains how to set up and use HashiCorp Vault for securely storing and retrieving database credentials in the KOVR BFF service.

## Overview

The application can now retrieve database credentials from HashiCorp Vault instead of using environment variables directly. This provides several benefits:

- Centralized secret management
- Secret rotation without application restarts
- Audit trail of secret access
- Reduced risk of credential exposure

## Setup Instructions

### 1. Run Vault locally using Docker

```bash
docker run --name vault -p 8200:8200 -e 'VAULT_DEV_ROOT_TOKEN_ID=dev-only-token' vault
```

This starts Vault in development mode on port 8200 with a root token of "dev-only-token".

### 2. Configure Vault with the setup script

```bash
# Make the script executable
chmod +x scripts/setup-vault.sh

# Edit the script to use your root token
# Open scripts/setup-vault.sh and change VAULT_TOKEN="your-root-token" to VAULT_TOKEN="dev-only-token"

# Run the setup script
./scripts/setup-vault.sh
```

This script will:
- Enable the KV v2 secrets engine
- Create database credentials in Vault
- Set up AppRole authentication
- Create a policy for accessing database secrets
- Configure the AppRole with the specific role_id and secret_id

### 3. Configure your application

Create or update your `.env` file with the following settings:

```
# Database Configuration (fallback if Vault fails)
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USERNAME=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DATABASE=kovrdb
TYPEORM_LOGGING=true

# HashiCorp Vault Configuration
USE_VAULT=true
VAULT_ADDR=http://localhost:8200
VAULT_ROLE_ID=f45a5082-ae1c-28c8-c83a-1baec8a397d7
VAULT_SECRET_ID=626e464a-e876-ad02-40a2-c23439be1aa8
VAULT_MOUNT_PATH=secret
```

## How It Works

1. When the application starts, it checks if `USE_VAULT` is set to `true`
2. If enabled, it authenticates with Vault using AppRole authentication (role_id and secret_id)
3. It retrieves database credentials from Vault at `secret/database/postgres/username` and `secret/database/postgres/password`
4. These credentials are used to connect to the database instead of the environment variables
5. If Vault authentication fails, it falls back to using environment variables

## Logging

The application logs detailed information about the Vault authentication process and credential retrieval:

- Successful authentication with Vault
- Successful retrieval of database credentials
- Errors during authentication or credential retrieval
- Fallback to environment variables if Vault is unavailable

## Production Considerations

For production environments:

1. Use a proper Vault server setup with high availability
2. Implement secret rotation policies
3. Use more restrictive policies for AppRoles
4. Consider using Vault's dynamic database credentials feature
5. Store the role_id and secret_id securely (not in environment variables)
6. Enable audit logging in Vault

## Troubleshooting

If you encounter issues:

1. Check that Vault is running: `curl http://localhost:8200/v1/sys/health`
2. Verify your role_id and secret_id are correct
3. Check the application logs for detailed error messages
4. Ensure the secrets exist in Vault: `VAULT_TOKEN=dev-only-token vault kv get secret/database/postgres/username` 