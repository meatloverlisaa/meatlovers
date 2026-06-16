#!/bin/bash
# Meat Lovers CIMS powered by YohPal
# Complete Server & Application Environment Auto-Installer

set -e

echo "===================================================================="
echo "      Meat Lovers CIMS powered by YohPal - Installer Script        "
echo "===================================================================="
echo "This script will assist you in installing system packages, "
echo "configuring environment files, initializing the MySQL database, "
echo "installing Node dependencies with pnpm, and compiling frontends."
echo "===================================================================="

# Check OS support
if [ ! -f /etc/debian_version ]; then
    echo "Warning: This installer is designed for Debian/Ubuntu-based systems."
    echo "If you are running another OS, please install packages manually."
    read -p "Do you want to continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Step 1: Install System Dependencies
echo ""
echo ">>> Step 1: Installing System Dependencies (requires sudo)..."
sudo apt-get update
sudo apt-get install -y nginx mysql-server php php-fpm php-mysql php-cli unzip curl git nodejs npm

# Install pnpm globally if not already installed
if ! command -v pnpm &> /dev/null; then
    echo "Installing pnpm globally..."
    sudo npm install -g pnpm
fi

# Step 2: Set up directories
echo ""
echo ">>> Step 2: Preparing local server directories..."
sudo mkdir -p /var/www/meat-lovers-cims
sudo chown -R $USER:$USER /var/www/meat-lovers-cims

# Step 3: Copy files
echo ""
echo ">>> Step 3: Copying project files to /var/www/meat-lovers-cims..."
# Copy regular files and directories
cp -r * /var/www/meat-lovers-cims/
# Copy dotfiles (like .env.example, .gitignore, etc.)
cp -r .[^.]* /var/www/meat-lovers-cims/ 2>/dev/null || true

# Step 4: Environment Configs
echo ""
echo ">>> Step 4: Configuring Environment (.env) files..."
cd /var/www/meat-lovers-cims

if [ ! -f .env ]; then
    cp .env.example .env
    echo "Created root .env file. Please check settings inside it."
fi

# Set up environment files for all four frontends
for app in website admin-web pos-pwa monitoring-web; do
    if [ ! -f "apps/$app/.env" ]; then
        echo "Creating apps/$app/.env..."
        cat <<EOT > apps/$app/.env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_NAME="Meat Lovers CIMS powered by YohPal"
EOT
    fi
done

# Step 5: Database Setup
echo ""
echo ">>> Step 5: Setting up database and running migrations/seeds..."
# Set executable flag on init_db.sh and run it
chmod +x database/init_db.sh
./database/init_db.sh

# Step 6: Frontend Build
echo ""
echo ">>> Step 6: Installing Node packages and building frontends using pnpm..."
pnpm install
pnpm -r build

# Step 7: Configure Nginx
echo ""
echo ">>> Step 7: Configuring Nginx virtual hosts..."
sudo cp deployment/nginx/meat-lovers-cims.conf /etc/nginx/sites-available/meat-lovers-cims
sudo ln -sf /etc/nginx/sites-available/meat-lovers-cims /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx || echo "Nginx could not be restarted automatically. Please start/restart Nginx manually."

# Step 8: Backup Job Setup
echo ""
echo ">>> Step 8: Configuring daily MySQL backup jobs..."
chmod +x deployment/scripts/backup_mysql.sh
# Check if backup cron already exists, if not add it
(crontab -l 2>/dev/null | grep -F "backup_mysql.sh") || (crontab -l 2>/dev/null; echo "0 23 * * * /var/www/meat-lovers-cims/deployment/scripts/backup_mysql.sh") | crontab -

echo ""
echo "===================================================================="
echo "          INSTALLATION AND INITIALIZATION SUCCESSFUL!               "
echo "===================================================================="
echo "Meat Lovers CIMS powered by YohPal is now ready."
echo "Access points (default):"
echo "- Customer Website:   http://localhost"
echo "- Admin Dashboard:    http://localhost/admin"
echo "- Waiter POS App:     http://localhost/pos"
echo "- Monitoring Panel:   http://localhost/monitoring"
echo "- Backend PHP API:    http://localhost/api"
echo ""
echo "Ensure your PHP-FPM service version matches nginx config fastcgi_pass socket path."
echo "Default logins are detailed in docs/SEED_DATA_MANUAL.md"
echo "===================================================================="
