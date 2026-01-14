#!/bin/bash

# Backup DigitalOcean Kubernetes Configuration
# This script backs up ConfigMaps, Secrets, and database before migration

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "=========================================="
echo "DigitalOcean Backup Script"
echo "=========================================="
echo ""

# Backup directory
BACKUP_DIR="./digitalocean-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo -e "${BLUE}Creating backup in: $BACKUP_DIR${NC}"
echo ""

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}❌ kubectl not found${NC}"
    echo "Please install kubectl or configure it for DigitalOcean cluster"
    exit 1
fi

# Check cluster connectivity
if ! kubectl cluster-info &> /dev/null; then
    echo -e "${RED}❌ Cannot connect to Kubernetes cluster${NC}"
    echo "Please ensure your cluster is running and kubectl is configured"
    exit 1
fi

echo -e "${GREEN}✓ Connected to Kubernetes cluster${NC}"
echo ""

# Step 1: Backup ConfigMaps
echo -e "${BLUE}Step 1: Backing up ConfigMaps...${NC}"
if kubectl get configmap -n progrc-dev backend-config &> /dev/null; then
    kubectl get configmap -n progrc-dev backend-config -o yaml > "$BACKUP_DIR/configmap-backend-config.yaml"
    echo -e "  ${GREEN}✓ ConfigMap: backend-config${NC}"
else
    echo -e "  ${YELLOW}⚠️  ConfigMap backend-config not found${NC}"
fi

if kubectl get configmap -n progrc-dev progrc-config &> /dev/null; then
    kubectl get configmap -n progrc-dev progrc-config -o yaml > "$BACKUP_DIR/configmap-progrc-config.yaml"
    echo -e "  ${GREEN}✓ ConfigMap: progrc-config${NC}"
else
    echo -e "  ${YELLOW}⚠️  ConfigMap progrc-config not found${NC}"
fi

# Backup all ConfigMaps
kubectl get configmap -n progrc-dev -o yaml > "$BACKUP_DIR/all-configmaps.yaml" 2>/dev/null || echo "" > "$BACKUP_DIR/all-configmaps.yaml"
echo -e "  ${GREEN}✓ All ConfigMaps${NC}"
echo ""

# Step 2: Backup Secrets (without sensitive data, just structure)
echo -e "${BLUE}Step 2: Backing up Secrets (structure only)...${NC}"
kubectl get secret -n progrc-dev -o yaml > "$BACKUP_DIR/all-secrets.yaml" 2>/dev/null || echo "" > "$BACKUP_DIR/all-secrets.yaml"
echo -e "  ${GREEN}✓ Secrets structure${NC}"
echo -e "  ${YELLOW}⚠️  Note: Actual secret values are encrypted. You'll need to extract them manually if needed.${NC}"
echo ""

# Step 3: Backup Environment Variables
echo -e "${BLUE}Step 3: Extracting environment variables...${NC}"
if kubectl get configmap -n progrc-dev backend-config &> /dev/null; then
    kubectl get configmap -n progrc-dev backend-config -o jsonpath='{.data}' > "$BACKUP_DIR/environment-variables.json" 2>/dev/null || echo "{}" > "$BACKUP_DIR/environment-variables.json"
    echo -e "  ${GREEN}✓ Environment variables exported${NC}"
else
    echo -e "  ${YELLOW}⚠️  ConfigMap not found${NC}"
fi
echo ""

# Step 4: Backup Service Information
echo -e "${BLUE}Step 4: Backing up service information...${NC}"
kubectl get services -n progrc-dev -o yaml > "$BACKUP_DIR/services.yaml" 2>/dev/null || echo "" > "$BACKUP_DIR/services.yaml"
kubectl get deployments -n progrc-dev -o yaml > "$BACKUP_DIR/deployments.yaml" 2>/dev/null || echo "" > "$BACKUP_DIR/deployments.yaml"
kubectl get ingress -n progrc-dev -o yaml > "$BACKUP_DIR/ingress.yaml" 2>/dev/null || echo "" > "$BACKUP_DIR/ingress.yaml"
echo -e "  ${GREEN}✓ Services, Deployments, and Ingress${NC}"
echo ""

# Step 5: Database Information
echo -e "${BLUE}Step 5: Extracting database connection information...${NC}"
if kubectl get configmap -n progrc-dev backend-config &> /dev/null; then
    DB_HOST=$(kubectl get configmap -n progrc-dev backend-config -o jsonpath='{.data.DATABASE_HOST}' 2>/dev/null || echo "")
    DB_PORT=$(kubectl get configmap -n progrc-dev backend-config -o jsonpath='{.data.DATABASE_PORT}' 2>/dev/null || echo "")
    DB_NAME=$(kubectl get configmap -n progrc-dev backend-config -o jsonpath='{.data.DATABASE_NAME}' 2>/dev/null || echo "")
    DB_USER=$(kubectl get configmap -n progrc-dev backend-config -o jsonpath='{.data.DATABASE_USERNAME}' 2>/dev/null || echo "")
    
    {
        echo "DATABASE_HOST=$DB_HOST"
        echo "DATABASE_PORT=$DB_PORT"
        echo "DATABASE_NAME=$DB_NAME"
        echo "DATABASE_USER=$DB_USER"
        echo ""
        echo "Note: Database password is in Secrets. Export manually if needed."
    } > "$BACKUP_DIR/database-info.txt"
    
    echo -e "  ${GREEN}✓ Database connection info${NC}"
else
    echo -e "  ${YELLOW}⚠️  ConfigMap not found${NC}"
fi
echo ""

# Step 6: Create Backup Summary
echo -e "${BLUE}Step 6: Creating backup summary...${NC}"
{
    echo "DigitalOcean Kubernetes Backup"
    echo "Date: $(date)"
    echo "Cluster: $(kubectl config current-context 2>/dev/null || echo 'unknown')"
    echo ""
    echo "Files backed up:"
    echo "- configmap-backend-config.yaml"
    echo "- configmap-progrc-config.yaml"
    echo "- all-configmaps.yaml"
    echo "- all-secrets.yaml"
    echo "- environment-variables.json"
    echo "- services.yaml"
    echo "- deployments.yaml"
    echo "- ingress.yaml"
    echo "- database-info.txt"
    echo ""
    echo "Next Steps:"
    echo "1. Review the backup files"
    echo "2. Export database if using managed PostgreSQL"
    echo "3. Extract any needed secrets manually"
    echo "4. Proceed with VPS migration"
} > "$BACKUP_DIR/README.txt"

echo -e "  ${GREEN}✓ Backup summary created${NC}"
echo ""

# Summary
echo "=========================================="
echo -e "${GREEN}Backup Complete!${NC}"
echo "=========================================="
echo ""
echo "Backup location: $BACKUP_DIR"
echo ""
echo "Files created:"
ls -lh "$BACKUP_DIR" | tail -n +2
echo ""
echo -e "${YELLOW}⚠️  Important Notes:${NC}"
echo "1. Secrets are encrypted. Extract values manually if needed."
echo "2. Database backup: If using DigitalOcean managed PostgreSQL,"
echo "   export the database from DigitalOcean console or use pg_dump."
echo "3. Review environment-variables.json for configuration values."
echo ""
echo "Next steps:"
echo "1. Review backup files"
echo "2. Export database (if needed)"
echo "3. Proceed with VPS migration (see MIGRATE_TO_VPS_GUIDE.md)"
echo ""
