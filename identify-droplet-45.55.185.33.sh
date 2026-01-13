#!/bin/bash

# Script to identify the purpose of droplet 45.55.185.33
# Run this after SSH'ing into the droplet

echo "=========================================="
echo "Identifying Droplet: 45.55.185.33"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== System Information ===${NC}"
echo ""
hostname
cat /etc/hostname 2>/dev/null || echo "No hostname file"
uname -a
echo ""

echo -e "${BLUE}=== Network Configuration ===${NC}"
echo ""
ip addr show | grep -E "inet |inet6 " | head -5
echo ""

echo -e "${BLUE}=== Running Services ===${NC}"
echo ""
systemctl list-units --type=service --state=running --no-pager | head -20
echo ""

echo -e "${BLUE}=== Listening Ports ===${NC}"
echo ""
ss -tlnp | head -20
echo ""

echo -e "${BLUE}=== Docker Containers ===${NC}"
echo ""
if command -v docker &> /dev/null; then
    docker ps -a
    echo ""
    if command -v docker-compose &> /dev/null; then
        echo "Docker Compose services:"
        docker-compose ps 2>/dev/null || echo "No docker-compose.yml found"
    fi
else
    echo "Docker not installed"
fi
echo ""

echo -e "${BLUE}=== Application Directories ===${NC}"
echo ""
echo "Checking /var/www:"
ls -la /var/www 2>/dev/null | head -10 || echo "Directory doesn't exist or empty"
echo ""
echo "Checking /opt:"
ls -la /opt 2>/dev/null | head -10 || echo "Directory doesn't exist or empty"
echo ""
echo "Checking /root:"
ls -la /root 2>/dev/null | head -10 || echo "Directory doesn't exist or empty"
echo ""

echo -e "${BLUE}=== Looking for BFF Service Files ===${NC}"
echo ""
find / -name "bff-service-backend*" -type d 2>/dev/null | head -5
find / -name "docker-compose.yml" 2>/dev/null | head -5
echo ""

echo -e "${BLUE}=== Disk Usage ===${NC}"
echo ""
df -h
echo ""
echo "Top disk usage:"
du -sh /* 2>/dev/null | sort -h | tail -10
echo ""

echo -e "${BLUE}=== Recent Activity ===${NC}"
echo ""
echo "Last logins:"
last | head -5
echo ""
echo "Recent system logs:"
journalctl --since "1 week ago" --no-pager | tail -20
echo ""

echo -e "${GREEN}=== Summary ===${NC}"
echo ""
echo "Droplet IP: 45.55.185.33"
echo "Hostname: $(hostname)"
echo "OS: $(uname -a | awk '{print $1, $3}')"
echo ""
