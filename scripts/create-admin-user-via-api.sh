#!/bin/bash

# Script to create an admin user via API
# Usage: ./scripts/create-admin-user-via-api.sh <name> <email> <mobile>

set -e

NAME="${1:-Admin User}"
EMAIL="${2:-admin2@progrc.com}"
MOBILE="${3:-+1234567890}"
ROLE_ID=1  # SuperAdmin

echo "=== Creating Admin User ==="
echo "Name: $NAME"
echo "Email: $EMAIL"
echo "Mobile: $MOBILE"
echo "Role ID: $ROLE_ID (SuperAdmin)"
echo ""

# Get the API URL from environment or use default
API_URL="${API_URL:-http://143.244.221.38/api/v1}"

echo "⚠️  Note: This requires authentication."
echo "You need to provide a valid JWT token from your current session."
echo ""
echo "To get your token:"
echo "1. Open browser DevTools (F12)"
echo "2. Go to Application/Storage > Cookies"
echo "3. Copy the 'accessToken' cookie value"
echo ""
echo "Or use the UI instead: Click 'New Account' button in the Privileged Accounts view"
echo ""
echo "If you have the token, you can run:"
echo "curl -X POST $API_URL/internal-users \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -H 'Authorization: Bearer YOUR_TOKEN_HERE' \\"
echo "  -d '{"
echo "    \"name\": \"$NAME\","
echo "    \"email\": \"$EMAIL\","
echo "    \"mobile\": \"$MOBILE\","
echo "    \"role_id\": $ROLE_ID"
echo "  }'"



