#!/bin/bash
# BL-Host Panel Deployment Script for Debian 12 VPS
# Assumes code is pushed to a remote Git repository
# Makes backend run via PM2, frontend served by Nginx, auto-start on boot

set -e  # Exit on any error

echo "=== BL-Host Panel VPS Deployment Script ==="
echo "This script will:"
echo "1. Update system and install dependencies"
echo "2. Install Node.js, Nginx, PM2"
echo "3. Clone your repository"
echo "4. Build and deploy the application"
echo "5. Configure auto-start on boot"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
  echo "Please run as root (use sudo)"
  exit 1
fi

# Ask for repository URL
echo -n "Enter your Git repository URL (e.g., https://github.com/username/bl-host.git): "
read REPO_URL

# Ask for domain or IP
echo -n "Enter your domain name or VPS IP address (e.g., example.com or 123.45.67.89): "
read DOMAIN

# Ask for admin email (for SSL later, optional)
echo -n "Enter admin email for SSL certificates (optional, press enter to skip): "
read ADMIN_EMAIL

echo ""
echo "Starting deployment..."
echo "Repository: $REPO_URL"
echo "Domain/IP: $DOMAIN"
if [ -n "$ADMIN_EMAIL" ]; then
  echo "Admin email: $ADMIN_EMAIL"
fi
echo ""

# Update system
echo "[1/10] Updating system packages..."
apt update && apt upgrade -y

# Install dependencies
echo "[2/10] Installing dependencies (git, curl, nginx, etc)..."
apt install -y git curl nginx

# Install Node.js 20.x LTS
echo "[3/10] Installing Node.js 20.x LTS..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

# Verify installations
echo "[4/10] Verifying installations..."
node --version
npm --version
nginx -v

# Create app user for security
echo "[5/10] Creating application user..."
if ! id "blhost" &>/dev/null; then
  useradd -r -s /bin/false blhost
  echo "Created system user 'blhost'"
else
  echo "User 'blhost' already exists"
fi

# Set up directory structure
echo "[6/10] Setting up directory structure..."
APP_DIR="/home/blhost/app"
mkdir -p "$APP_DIR"
chown blhost:blhost "$APP_DIR"

# Clone repository
echo "[7/10] Cloning repository from $REPO_URL..."
sudo -u blhost git clone "$REPO_URL" "$APP_DIR"
cd "$APP_DIR"

# Install backend dependencies
echo "[8/10] Installing backend dependencies..."
cd backend
npm install --production

# Build frontend
echo "[9/10] Building frontend..."
cd ../frontend
npm install
VITE_API_URL=/api npm run build

# Copy frontend build to Nginx HTML directory
echo "[10/10] Configuring Nginx..."
FRONTEND_DIST="$APP_DIR/frontend/dist"
NGINX_DIR="/var/www/blhost"
mkdir -p "$NGINX_DIR"
cp -r "$FRONTEND_DIST"/* "$NGINX_DIR"/
chown -R www-data:www-data "$NGINX_DIR"

# Create Nginx configuration
NGINX_CONF="/etc/nginx/sites-available/blhost"
cat > "$NGINX_CONF" << EOF
server {
    listen 80;
    server_name $DOMAIN;

    root $NGINX_DIR;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:5000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    # Optional: increase upload limits if needed
    client_max_body_size 10M;
}

# Redirect non-www to www or vice versa (uncomment and adjust as needed)
# server {
#     listen 80;
#     server_name www.$DOMAIN;
#     return 301 \$scheme://$DOMAIN\$request_uri;
# }
EOF

# Enable site and test Nginx
ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx

# Set up PM2 for backend
echo "[11/10] Setting up PM2 process manager..."
npm install -g pm2
cd "$APP_DIR/backend"

# Generate a random JWT secret
JWT_SECRET="blhostsecretkey123_$(openssl rand -hex 12)"

# Create ecosystem.config.js for PM2
cat > ecosystem.config.js << EOF
module.exports = {
  apps : [{
    name: 'BL-Host API',
    script: 'server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 5000,
      DB_NAME: 'blhost',
      DB_USER: 'root',
      DB_PASSWORD: '',
      DB_HOST: 'localhost',
      DIALECT: 'sqlite',
      STORAGE: './database.sqlite',
      JWT_SECRET: '$JWT_SECRET',
      JWT_EXPIRATION: '7d'
    }
  }]
};
EOF

# Start the app with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup systemd -u blhost --hp /home/blhost

# Final setup
echo "[12/10] Finalizing setup..."
# Ensure storage directory exists (SQLite will create the file)
mkdir -p "$APP_DIR/backend"
chown -R blhost:blhost "$APP_DIR/backend"

# Test the API
echo "[13/10] Testing backend API..."
sleep 5  # Give PM2 time to start
if curl -s http://localhost:5000/health | grep -q '"status":"ok"'; then
  echo "✓ Backend API is responding"
else
  echo "⚠ Backend API may not be ready yet - checking logs..."
  pm2 logs BL-Host API --lines 10
fi

echo ""
echo "=== Deployment Complete! ==="
echo ""
echo "Your BL-Host panel should now be accessible at:"
echo "  http://$DOMAIN"
echo ""
echo "Default admin credentials (if seeded):"
echo "  Email: admin@blhost.com"
echo "  Password: admin123"
echo ""
echo "Important next steps:"
echo "1. Configure SSL/TLS certificates (recommended):"
echo "   sudo apt install certbot python3-certbot-nginx"
echo "   sudo certbot --nginx -d $DOMAIN"
echo ""
echo "2. Manage your application with PM2:"
echo "   pm2 status          # View running processes"
echo "   pm2 logs BL-Host API  # View backend logs"
echo "   pm2 restart BL-Host API # Restart backend"
echo ""
echo "3. To update your deployment:"
echo "   cd /home/blhost/app"
echo "   git pull"
echo "   cd backend && npm install --production"
echo "   cd ../frontend && npm install && npm run build"
echo "   cp -r frontend/dist/* /var/www/blhost/"
echo "   pm2 restart BL-Host API"
echo ""
echo "Your panel is now set to start automatically on boot!"
echo "Reboot your VPS to test: sudo reboot"