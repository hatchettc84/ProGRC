#!/bin/bash

# Script to set up HashiCorp Vault with database credentials
# This script assumes Vault is running locally on port 8200

# Set variables
VAULT_ADDR="http://localhost:8200"
VAULT_TOKEN="your-root-token" # Replace with your actual root token
ROLE_ID="f45a5082-ae1c-28c8-c83a-1baec8a397d7"
SECRET_ID="626e464a-e876-ad02-40a2-c23439be1aa8"

# Check if Vault is running
echo "Checking if Vault is running..."
if ! curl -s "$VAULT_ADDR/v1/sys/health" > /dev/null; then
  echo "Error: Cannot connect to Vault at $VAULT_ADDR"
  echo "Make sure Vault is running with 'docker run -p 8200:8200 vault'"
  exit 1
fi

# Set VAULT_ADDR and VAULT_TOKEN for CLI commands
export VAULT_ADDR=$VAULT_ADDR
export VAULT_TOKEN=$VAULT_TOKEN

echo "Enabling secrets engine..."
vault secrets enable -path=secret kv-v2

echo "Creating database secrets..."
vault kv put secret/database/postgres/username value="postgres"
vault kv put secret/database/postgres/password value="your-secure-password"

echo "Enabling AppRole auth method..."
vault auth enable approle

echo "Creating policy for database access..."
vault policy write db-credentials - <<EOF
path "secret/data/database/*" {
  capabilities = ["read"]
}
EOF

echo "Creating AppRole with specific role_id and secret_id..."
vault write auth/approle/role/db-role \
    role_id="$ROLE_ID" \
    secret_id="$SECRET_ID" \
    secret_id_ttl=0 \
    token_ttl=1h \
    token_max_ttl=4h \
    policies=db-credentials

echo "Setup complete!"
echo ""
echo "To use these credentials in your application:"
echo "1. Set USE_VAULT=true in your .env file"
echo "2. Ensure VAULT_ADDR is set to $VAULT_ADDR"
echo "3. Use the role_id and secret_id in your VaultSecretProvider"
echo ""
echo "Role ID: $ROLE_ID"
echo "Secret ID: $SECRET_ID" 