#!/bin/bash
set -e

VPS_IP="168.231.70.205"
VPS_USER="root"
VPS_PASSWORD="AllhulkDOES15###"
FRONTEND_DIR="/Users/corneliushatchett/Downloads/PRO GRC/frontend-app-main/dist"

echo "🚀 Deploying frontend to VPS..."

# Install sshpass if not available
if ! command -v sshpass &> /dev/null; then
    echo "Installing sshpass..."
    brew install hudochenkov/sshpass/sshpass 2>/dev/null || echo "Please install sshpass manually"
fi

# Create directory on VPS
echo "📁 Creating directory on VPS..."
export SSHPASS="$VPS_PASSWORD"
sshpass -e ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -T "$VPS_USER@$VPS_IP" << 'EOF'
mkdir -p /var/www/progrc
chmod 755 /var/www/progrc
EOF

# Transfer frontend files
echo "📦 Transferring frontend files..."
cd "$FRONTEND_DIR"
sshpass -e rsync -avz --progress -e "ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null" ./ "$VPS_USER@$VPS_IP:/var/www/progrc/"

# Install and configure Nginx
echo "⚙️  Configuring Nginx..."
sshpass -e ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -T "$VPS_USER@$VPS_IP" << 'EOF'
# Install Nginx if not installed
if ! command -v nginx &> /dev/null; then
    apt-get update
    apt-get install -y nginx
fi

# Create Nginx config
cat > /etc/nginx/sites-available/progrc << 'NGINX_CONFIG'
server {
    listen 80;
    server_name 168.231.70.205;

    root /var/www/progrc;
    index index.html;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        client_max_body_size 100M;
    }

    location /health {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "public, max-age=3600";
    }

    error_page 404 /index.html;
}
NGINX_CONFIG

# Enable site
ln -sf /etc/nginx/sites-available/progrc /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test and reload Nginx
nginx -t && systemctl reload nginx
systemctl status nginx --no-pager | head -5
EOF

echo "✅ Frontend deployment complete!"
echo "🌐 Frontend should be available at: http://$VPS_IP"
echo "🔗 API endpoint: http://$VPS_IP/api/v1"

