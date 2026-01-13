#!/usr/bin/expect -f

# Automated deployment script using expect for password handling
set VPS_IP "168.231.70.205"
set VPS_USER "root"
set VPS_PASSWORD "AllhulkDOES15###"
set LOCAL_DIR "/Users/corneliushatchett/Downloads/PRO GRC/bff-service-backend-dev"
set REMOTE_DIR "/opt/progrc/bff-service-backend-dev"

set timeout 300

puts "=========================================="
puts "ProGRC Automated Deployment to VPS"
puts "=========================================="
puts ""

# Step 1: Test connection
puts "Step 1: Testing SSH connection..."
spawn ssh -o StrictHostKeyChecking=no $VPS_USER@$VPS_IP "echo 'Connection successful'"
expect {
    "password:" {
        send "$VPS_PASSWORD\r"
        expect {
            "Connection successful" {
                puts "✓ SSH connection successful"
            }
            timeout {
                puts "✗ Connection failed"
                exit 1
            }
        }
    }
    "Connection successful" {
        puts "✓ SSH connection successful (key-based)"
    }
    timeout {
        puts "✗ Connection timeout"
        exit 1
    }
}

# Step 2: Create directories on VPS
puts ""
puts "Step 2: Creating directory structure on VPS..."
spawn ssh -o StrictHostKeyChecking=no $VPS_USER@$VPS_IP "mkdir -p $REMOTE_DIR && mkdir -p /opt/progrc/backups && echo 'Directories created'"
expect {
    "password:" {
        send "$VPS_PASSWORD\r"
    }
}
expect {
    "Directories created" {
        puts "✓ Directories created"
    }
    timeout {
        puts "⚠ Directory creation may have failed"
    }
}

# Step 3: Transfer codebase using rsync
puts ""
puts "Step 3: Transferring codebase to VPS..."
puts "This may take a few minutes..."

spawn rsync -avz --progress --exclude 'node_modules' --exclude '.git' --exclude 'dist' --exclude 'coverage' --exclude '.env' --exclude '*.log' --exclude '.claude' --exclude '.cursor' "$LOCAL_DIR/" "$VPS_USER@$VPS_IP:$REMOTE_DIR/"
expect {
    "password:" {
        send "$VPS_PASSWORD\r"
    }
}
expect {
    eof {
        puts "✓ Codebase transferred"
    }
    timeout {
        puts "⚠ Transfer may still be in progress"
    }
}

# Step 4: Run setup commands on VPS
puts ""
puts "Step 4: Running setup on VPS..."

spawn ssh -o StrictHostKeyChecking=no $VPS_USER@$VPS_IP
expect {
    "password:" {
        send "$VPS_PASSWORD\r"
    }
    "# " {
        # Already connected
    }
}

# Send setup commands
send "cd $REMOTE_DIR\r"
expect "# "

send "apt update -qq && apt upgrade -y -qq\r"
expect "# "

send "if ! command -v docker &> /dev/null; then curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh; fi\r"
expect "# "

send "if ! command -v docker-compose &> /dev/null; then curl -L \"https://github.com/docker/compose/releases/latest/download/docker-compose-\$(uname -s)-\$(uname -m)\" -o /usr/local/bin/docker-compose && chmod +x /usr/local/bin/docker-compose; fi\r"
expect "# "

send "if ! command -v node &> /dev/null; then curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && apt install -y nodejs; fi\r"
expect "# "

send "if [ ! -f .env ]; then cp env.sample .env && if [ -f scripts/generate-jwt-keys.js ]; then node scripts/generate-jwt-keys.js 2>/dev/null || true; fi; fi\r"
expect "# "

send "echo 'Setup complete. Please configure .env file manually.'\r"
expect "# "

send "exit\r"
expect eof

puts ""
puts "=========================================="
puts "Initial Setup Complete!"
puts "=========================================="
puts ""
puts "Next steps:"
puts "1. SSH into VPS: ssh $VPS_USER@$VPS_IP"
puts "2. Configure .env: cd $REMOTE_DIR && nano .env"
puts "3. Set USE_OLLAMA=true and OLLAMA_BASE_URL=http://168.231.70.205:11434"
puts "4. Run: docker-compose build && docker-compose up -d"
puts ""

