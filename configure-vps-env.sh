#!/bin/bash

# VPS Environment Configuration Script
# This script helps configure the .env file for VPS deployment

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "=========================================="
echo "VPS Environment Configuration"
echo "=========================================="
echo ""

# Check if running in project directory
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}❌ Error: docker-compose.yml not found${NC}"
    echo "Please run this script from the project root directory"
    exit 1
fi

# Check if .env already exists
if [ -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env file already exists${NC}"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Keeping existing .env file${NC}"
        exit 0
    fi
    echo -e "${YELLOW}Backing up existing .env to .env.backup${NC}"
    cp .env .env.backup
fi

# Get VPS IP (default from docker-compose.yml or prompt)
VPS_IP=${VPS_IP:-"168.231.70.205"}

echo -e "${BLUE}Configuring environment for VPS: $VPS_IP${NC}"
echo ""

# Generate secure passwords
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
JWT_SECRET=$(openssl rand -hex 32)
REFRESH_TOKEN_SECRET=$(openssl rand -hex 32)

echo -e "${GREEN}✓ Generated secure passwords${NC}"
echo ""

# Create .env file
cat > .env << EOF
# ============================================
# ProGRC VPS Environment Configuration
# Generated: $(date)
# ============================================

# Application
NODE_ENV=production
PORT=3000
API_PREFIX=api
CORS_ORIGIN=*
ENVIRONMENT=production

# Frontend URLs
FE_HOST=http://${VPS_IP}
USER_INVITATION_URL=/reset-password

# Database (Docker Compose PostgreSQL)
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_USERNAME=progrc
POSTGRES_PASSWORD=${DB_PASSWORD}
POSTGRES_DATABASE=progrc_bff
POSTGRES_SSL=false

# Redis (Docker Compose)
REDIS_HOST=redis
REDIS_PORT=6379

# JWT Configuration
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SIGNATURE=${REFRESH_TOKEN_SECRET}

# JWT RS256 Keys (for production - generate new keys)
# These are placeholder keys - generate new ones for production
ACCESS_TOKEN_SIGNATURE_PRIVATE=LS0tLS1CRUdJTiBSU0EgUFJJVkFURSBLRVktLS0tLQpNSUlFcFFJQkFBS0NBUUVBNmxNM1hPY1N5OUZ3NHozYUFjcW5aaWdTQkZQS240WTkwVGdlbE0vbXlqdjFlOGNIClhxN095YWdZbzBLcUs2b243VTV5eUNSeUUwRUNpZ0RRamVDWEZYWDFQNzMvRGUxRXE3Q0RxUSs4SWN1bjk1RkQKaDJkVUVJb2JqWWlUOHdBbHlrM0Jqa21PY1Z2eUZYVXNCRm9CTEV0VWVLQWZsYkl1OXhjSG1ZOE1MUFNlWGR3Uwo2OWhoTEFIL2tnTnZaK1AraHRGSmdXNERMM2pEaGRTdUZObUlFYUxickZneUFsTnBITVI0ejVlU01BdzdvSnlPCnUyWExVbmtSVlIyMVM4NjVzTStmNDB6OHd2Y2tPbVBzcDdSYmR5cUdjR0R5MURzdmlDOWZlMUdtZ1JHQjVKT1YKRTZWSitNcFNkQjhDaGtHdTZscC9WUjZOcWlhYVk1b2tmNmdabHdJREFRQUJBb0lCQVFEYVcyZVk1QitvM09nVQphbHZRRlplKzQ1SStoQktxYXo4Snl3RDhiV3hFZ25FMHdmaEZMQ0s0MmpMeldEa1piWHU5Y01BWGI1YjZDRGVrCmdEUFlNalM0SSs3QlVuenQ3bTl5aW85MktKcUk1NjREVGxPZVJ4U1lRUXFCN29ib0IvZ3ZPQndwU3JRNVFKUXIKbUwvRzRsUjdnVXNiQ1NQRnJJQ0ZjdWw3R0VraFRaNFQ0Z0RENXhzZGZCSld3ODA3a2l6aStRTmdFcnlsRWRGbQpvdStBVkY5UVJ4V3hnU21aQWdmL1JMU3pETGZoUVI4Znc0bU51dXBJL0pwdUpDQ1Vtb3RzVkR4NFNmQVFzMEhXCldJOGU0azcyWHZDZVVoMTlpc0ZJQzJFWSsvTnRxT3BlOElwaXZ1OWsxcFF5dUFnREl0M1hwYUEzdE5ZWnllNWQKRGljZlhuaEJBb0dCQVBkRXRYQ2JaTjhSYWRwampic05pUkZZbDhBeFdWNXVmVldoSU96RmxCRHg0aDlIa1BCVQpGZUxjdFRrTTkxMTQ2QW1UMmc1dWFRaktmSERCNGIxcHYxajZpQjlOYnc3NE91dTNYNjQ0VnVrYW9mOW9qNUxPCncxaEcvc2g2WWFyeDF3ZHlSVnErRi9Vc05tQ29lTW1jeVA4UExxUWNKRWVZY0RhdmRDUFlVck9oQW9HQkFQS1oKZ0NiOW03M1BYTTk1eTRRR0RTUUh1MEtHV2hseFplaVI1amhhU0twS2gybWZqcFVhRFVmTm1CdlE5TG53emVyYwpPbURPYWFhOFNmWDJ5dGdlVHhPdi9TQ1U1cXorOXRoNVljN2I0S0I3UUdUdjY5bi9QTzhCcDgwU25UNEtINWlNCmVjSS8wT2MxWkE2SGdvdnlqMUt1a1hJNlpPMTBpUFk2eDZYTEZFSTNBb0dCQVBWdFhFNFYzeXhONDJ3aHJqYkEKZTVFZEJ4cDdvUUhLMTFwYjRRdENIUElvczlGcVBtRmNoSkMxa3FhNnlQZ2RIdXNLdHIvbU5SakZxbmhjNkl3UgozeHdaSjIweWRZNDlNblp1ZjJpMGdRZEVLUkVTbnBjUDVQTEZIUFN1REMwWmQ5M3JQUTJSYXNRdUN4Y3JnU0JVCkgyaVNrQy9Sd3V6UlVHZm5CSGJqcTBxaEFvR0FjRkZOR2NBMHlNNG1oQkE1ZnlobUVSWmJSbE41aDJvTzZud1MKQUdrY1Yyc21BbXJTMG9rN09ORWc2VS8yM2RkMUhwVlRtZG8yNC9Fc3RPbkx3LzlVVVNNYnFHZ0gzSFEyeU1aNQoyQkhJajhSQWJmcitVUEZ3dnA4Zmx6eFUvSkluU3JOTzgvWWp1OGZtU1N2SDd3OGYrQUhHYVFKTUUvdnVKVUhWCmlSYmFqRVVDZ1lFQTEzaVZQYng1UHdySEkyelBMYm5xanBveE5jeGFTaGxiNFVFVnBINkdVVHpmYUo1bWVITVMKL3hvUlliY3ZNUjNBTTg2dlhEOHFoRzVzZThQUFhSSVNtcU5rT3Z1bldZSXVBdUg1OWpUaGdjeXNVdUVXMzRWeQpPOVk3YnY2UWFCZ05aTUMyOVlPc2QwZjIrMVhWY1lSSXVHNzZGcWMvUFlCUXZqczQ5SkxtZ2Q4PQotLS0tLUVORCBSU0EgUFJJVkFURSBLRVktLS0tLQo=
ACCESS_TOKEN_SIGNATURE_PUBLIC=LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUlJQklqQU5CZ2txaGtpRzl3MEJBUUVGQUFPQ0FROEFNSUlCQ2dLQ0FRRUE2bE0zWE9jU3k5Rnc0ejNhQWNxbgpaaWdTQkZQS240WTkwVGdlbE0vbXlqdjFlOGNIWHE3T3lhZ1lvMEtxSzZvbjdVNXl5Q1J5RTBFQ2lnRFFqZUNYCkZYWDFQNzMvRGUxRXE3Q0RxUSs4SWN1bjk1RkRoMmRVRUlvYmpZaVQ4d0FseWszQmprbU9jVnZ5RlhVc0JGb0IKTEV0VWVLQWZsYkl1OXhjSG1ZOE1MUFNlWGR3UzY5aGhMQUgva2dOdlorUCtodEZKZ1c0REwzakRoZFN1Rk5tSQpFYUxickZneUFsTnBITVI0ejVlU01BdzdvSnlPdTJYTFVua1JWUjIxUzg2NXNNK2Y0MHo4d3Zja09tUHNwN1JiCmR5cUdjR0R5MURzdmlDOWZlMUdtZ1JHQjVKT1ZFNlZKK01wU2RCOENoa0d1NmxwL1ZSNk5xaWFhWTVva2Y2Z1oKbHdJREFRQUIKLS0tLS1FTkQgUFVCTElDIEtFWS0tLS0tCg==

# Token Expiry
RESET_PASSWORD_EXPIRY_TOKEN_HOUR=24
USER_INVITATION_EXPIRY_TOKEN_HOUR=168
IMPERSONATE_TIMEOUT_SECONDS=14400

# AWS SQS (disabled for VPS)
AWS_SQS_ENABLED=false

# AWS S3 Configuration (LocalStack for VPS)
USE_LOCALSTACK=true
LOCALSTACK_ENDPOINT=http://localstack:4566
LOCALSTACK_PUBLIC_ENDPOINT=http://${VPS_IP}:4566
AWS_S3_ENDPOINT=http://localstack:4566
AWS_S3_REGION=us-east-1
AWS_S3_ACCESS_KEY_ID=test
AWS_S3_SECRET_ACCESS_KEY=test
S3_FILES_BUCKET=progrc-app-file-uploads
FRONTEND_S3_BUCKET=progrc-app-frontend-dev

# LLM Configuration - Priority: Ollama (local) > Gemini > OpenAI
# Ollama (Primary - local, no API calls)
USE_OLLAMA=true
OLLAMA_BASE_URL=http://ollama:11434
OLLAMA_MODEL=llama3.2:1b
OLLAMA_EMBEDDING_MODEL=nomic-embed-text

# Gemini (Fallback - disabled by default)
USE_GEMINI=false
GEMINI_API_KEY=
GEMINI_MODEL=gemini-2.0-flash-exp

# OpenAI (Fallback - disabled by default)
OPENAI_API_KEY=

# Gradient AI (disabled)
USE_GRADIENT=false

# Other Settings
POPULATE_ASSET_DUMMY_DATA=true
EOF

echo -e "${GREEN}✓ .env file created${NC}"
echo ""

# Update docker-compose.yml with generated password
echo -e "${BLUE}Updating docker-compose.yml with generated password...${NC}"
sed -i "s/POSTGRES_PASSWORD: progrc_dev_password_change_me/POSTGRES_PASSWORD: ${DB_PASSWORD}/g" docker-compose.yml
echo -e "${GREEN}✓ docker-compose.yml updated${NC}"
echo ""

# Display summary
echo "=========================================="
echo -e "${GREEN}Configuration Complete!${NC}"
echo "=========================================="
echo ""
echo "Generated Configuration:"
echo "  ✓ Database Password: ${DB_PASSWORD}"
echo "  ✓ JWT Secret: ${JWT_SECRET:0:20}..."
echo "  ✓ Refresh Token Secret: ${REFRESH_TOKEN_SECRET:0:20}..."
echo ""
echo "Environment Settings:"
echo "  ✓ VPS IP: ${VPS_IP}"
echo "  ✓ Ollama: Enabled (local)"
echo "  ✓ Gemini: Disabled"
echo "  ✓ OpenAI: Disabled"
echo "  ✓ LocalStack: Enabled (S3)"
echo ""
echo "Next Steps:"
echo "1. Review .env file: cat .env"
echo "2. Update docker-compose.yml if needed"
echo "3. Build and start services: docker-compose up -d"
echo ""
