# Meat Lovers CIMS — Complete Setup & Developer Guide

Welcome to **Meat Lovers CIMS (Customer & Inventory Management System)** powered by YohPal. This guide explains how to install system dependencies, configure, build, and run the entire application workspace.

---

## 🛠 Tech Stack Overview

Meat Lovers CIMS is structured as a monorepo containing:
* **PHP Backend API**: A single-entry custom MVC/Router PHP API located in `backend/`.
* **4 React/Vite Frontends**:
  * **Customer Website** (`apps/website`): Public food and drink portal.
  * **Admin Dashboard** (`apps/admin-web`): Core administration panel for managers, finance, assets, and HRM.
  * **Waiter POS App** (`apps/pos-pwa`): Desktop/Mobile order taking and billing workflow.
  * **Monitoring Panel** (`apps/monitoring-web`): Real-time live status and owner dashboard controls.

---

## 📋 System Requirements
Ensure you are using **Ubuntu/Debian-based Linux**. The required system packages are:
* **Web Server**: Nginx
* **Database**: MySQL Server (8.x or newer)
* **Backend Runtime**: PHP 8.x + PHP-FPM, CLI, MySQL bindings
* **Frontend Runtime**: Node.js (v22.x recommended), npm, pnpm (v11+ recommended)
* **Utilities**: curl, unzip, git

---

## 🚀 The Automated Setup (Recommended)

An installer script is provided in the root directory. It automates system checks, prepares server directories, copies files, initializes the database, installs Node dependencies, and compiles the frontends.

Run it using:
```bash
chmod +x setup.sh
./setup.sh
```

---

## ⚙️ Manual Step-by-Step Configuration

If you prefer to configure components manually, follow these steps in order:

### 1. Configure Environment Variables (`.env`)
Copy the root environment example file:
```bash
cp .env.example .env
```
Open the `.env` file and set your credentials:
```ini
DB_DATABASE=meat_lovers_cims
DB_USERNAME=meat_lovers_user
DB_PASSWORD=StrongLocalPassword
JWT_SECRET=change_this_secret_locally
APP_URL=http://localhost
```

Create `.env` files for each frontend app (`apps/website/.env`, `apps/admin-web/.env`, `apps/pos-pwa/.env`, and `apps/monitoring-web/.env`):
```ini
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_NAME="Meat Lovers CIMS powered by YohPal"
```

### 2. Database Initialization
Log in to MySQL and provision the database and user:
```sql
CREATE DATABASE meat_lovers_cims CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'meat_lovers_user'@'localhost' IDENTIFIED BY 'StrongLocalPassword';
GRANT ALL PRIVILEGES ON meat_lovers_cims.* TO 'meat_lovers_user'@'localhost';
FLUSH PRIVILEGES;
```

Run all migrations and seeds in strict numeric order:
```bash
# Apply migrations
for file in database/migrations/*.sql; do
    mysql -u meat_lovers_user -pStrongLocalPassword meat_lovers_cims < "$file"
done

# Load seed data
for file in database/seeds/*.sql; do
    # Skip helper scripts to avoid duplicate seed runs
    if [[ "$(basename "$file")" != *"013_seed_loader.sql"* ]]; then
        mysql -u meat_lovers_user -pStrongLocalPassword meat_lovers_cims < "$file"
    fi
done
```

---

## 💻 Running the Services Locally

### Development Mode (With Hot Reloading)

#### **Frontend Development Servers**
From the **root directory**, start the Vite dev server for all 4 frontends in parallel:
```bash
pnpm dev
```
Vite will automatically assign ports sequentially:
* **Monitoring Panel**: `http://localhost:3000`
* **Admin Dashboard**: `http://localhost:3001`
* **Waiter POS App**: `http://localhost:3002`
* **Customer Website**: `http://localhost:3003`

#### **Backend PHP API Development Server**
Navigate into the `backend/` directory and spin up the PHP dev server:
```bash
cd backend
php -S 0.0.0.0:8000 -t public
```
* **API Dev URL**: `http://localhost:8000/api`

---

### Production Mode (Nginx-Served)
When serving the production bundle locally, Nginx serves the static HTML/JS/CSS from `/var/www/meat-lovers-cims/` and handles routing for the PHP backend.

To build and compile production bundles:
```bash
pnpm build
```

The Nginx configuration file is located at `deployment/nginx/meat-lovers-cims.conf`. Install it to Nginx with:
```bash
sudo cp deployment/nginx/meat-lovers-cims.conf /etc/nginx/sites-available/meat-lovers-cims
sudo ln -sf /etc/nginx/sites-available/meat-lovers-cims /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```
*Note: Make sure to disable the default Nginx virtual host (`sudo rm /etc/nginx/sites-enabled/default`) if they conflict.*

#### Production URLs (Port 80):
* **Customer Website**: `http://localhost`
* **Admin Dashboard**: `http://localhost/admin`
* **Waiter POS App**: `http://localhost/pos`
* **Monitoring Panel**: `http://localhost/monitoring`
* **Backend API**: `http://localhost/api` (automatically served by Nginx + PHP-FPM)

---

## 🔐 Default Access & Seeding Data

Default credentials seeded in the system (`database/seeds/001_users_seed.sql`):

| Role | Username / Email |
| :--- | :--- |
| **Super Admin** | `admin@meatlovers.local` |
| **Manager** | `manager@meatlovers.local` |
| **Cashier** | `cashier@meatlovers.local` |
| **Waiter** | `waiter@meatlovers.local` |
| **Chef** | `chef@meatlovers.local` |
| **Storekeeper** | `store@meatlovers.local` |
| **Barman** | `bar@meatlovers.local` |

> [!WARNING]
> The seeded user passwords are hashes of placeholder strings. For local login testing, verify or overwrite database password values using a valid BCRYPT hash generated in PHP:
> `password_hash('your-password', PASSWORD_BCRYPT);`

---

## 🛠 Troubleshooting & Common Pitfalls

### 1. `ERR_PNPM_IGNORED_BUILDS`
Recent versions of `pnpm` (v10 & v11) block package lifecycle scripts (e.g., `esbuild` compilation step) by default. This project specifies permissions in `pnpm-workspace.yaml` under `allowBuilds`:
```yaml
allowBuilds:
  esbuild: true
```
Ensure you run `pnpm install` rather than direct `npm` / `yarn` scripts to respect the workspace settings.

### 2. Conflicting Nginx Server Configurations
If you see a warning such as `conflicting server name "_" on 0.0.0.0:80, ignored`, remove the default site config:
```bash
sudo rm -f /etc/nginx/sites-enabled/default
sudo systemctl restart nginx
```

### 3. PHP-FPM Sockets Configuration
In `deployment/nginx/meat-lovers-cims.conf`, check the PHP-FPM socket path version matches your system's PHP version:
```nginx
fastcgi_pass unix:/run/php/php8.2-fpm.sock; # Adjust 'php8.2' to your current version (e.g. php8.3-fpm.sock)
```

---

## 🗄 Backup System
To verify or run a manual MySQL database backup:
```bash
chmod +x deployment/scripts/backup_mysql.sh
./deployment/scripts/backup_mysql.sh
```
Check the generated backups under `database/backups/`. A daily cron job is automatically configured at `23:00` by the installer script.
