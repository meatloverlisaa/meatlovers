# Meat Lovers CIMS powered by YohPal

Meat Lovers CIMS is a premium web-mobile restaurant control and intelligence system powered by YohPal, designed to optimize restaurant operations, eliminate leakage/theft, motivate staff, and drive sales growth.

---

## 🚀 Overview of System Components

The system is organized into a monorepo containing multiple frontends and a unified backend API:

| Component | Directory | Description | Port (Dev) |
|---|---|---|---|
| **PHP Backend API** | `backend/` | Single-entry custom MVC/Router PHP API. Handles authentication, core business logic, audit logs, and data persistence. | `8000` |
| **Customer Website** | `apps/website/` | AI-enabled customer acquisition website featuring food menus, promotions, catering, delivery enquiries, and feedback. | `5173` |
| **Admin Panel** | `apps/admin-web/` | Comprehensive operational dashboard for inventory, HRM, CRM, financials (P&L, snapshots), pricing control, approvals, and audits. | `5174` |
| **Waiter POS PWA** | `apps/pos-pwa/` | Mobile-first waiter ordering and POS app. Designed to run smoothly on tablets and smartphones. | `5175` |
| **Monitoring Panel** | `apps/monitoring-web/` | Live performance monitoring panel for restaurant owners. Real-time sales, inventory alerts, and pending approvals. | `5176` |

---

## 🛠️ Requirements & Prerequisites

To run this application, make sure your system has:
- **PHP** (>= 8.1) with `pdo_mysql` extension
- **MySQL** (>= 8.0)
- **Node.js** (>= 18.0)
- **pnpm** (preferred for workspace dependency installation)

---

## 📦 Automated Quick-Start Installation (Ubuntu/Debian)

If you are running on an Ubuntu or Debian system, you can run the pre-configured root setup script to automatically install requirements, set up directory structures, copy files, configure environment variables, initialize databases, install npm packages, and build assets:

```bash
chmod +x setup.sh
./setup.sh
```

---

## 🧑‍💻 Manual Installation Instructions

If you prefer to perform a manual setup, or are running on a non-Debian system (macOS/Windows/Fedora), follow the detailed steps below:

### 1. Database Setup
Ensure MySQL is running. Create a database and database user:

```sql
CREATE DATABASE meat_lovers_cims CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'meat_lovers_user'@'localhost' IDENTIFIED BY 'StrongLocalPassword';
GRANT ALL PRIVILEGES ON meat_lovers_cims.* TO 'meat_lovers_user'@'localhost';
FLUSH PRIVILEGES;
```

Then initialize the database structure and load the seeds:
```bash
chmod +x database/init_db.sh
./database/init_db.sh
```

*(Note: In case you want to load the seeds manually, run the SQL scripts in `database/migrations/` sequentially, followed by the seeds in `database/seeds/`.)*

### 2. Environment Variables Configuration
Copy the root `.env.example` to `.env`:
```bash
cp .env.example .env
```
Open `.env` and verify database configuration credentials.

Generate the `.env` configuration files for each frontend application:
```bash
for app in website admin-web pos-pwa monitoring-web; do
  cat <<EOT > apps/$app/.env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_APP_NAME="Meat Lovers CIMS powered by YohPal"
EOT
done
```

### 3. Install NPM Dependencies
In the root directory, install workspace node packages using `pnpm`:
```bash
pnpm install
```

---

## 🏃 Running the Applications

### Option A: Running in Development Mode
You can start all frontends and the backend server concurrently.

1. **Start the Backend API Server**:
   ```bash
   cd backend
   php -S 0.0.0.0:8000 -t public
   ```

2. **Start Frontends in Dev Server**:
   In another terminal at the project root:
   - Start the **Customer Website**: `pnpm website:dev` (runs on `http://localhost:5173`)
   - Start the **Admin Panel**: `pnpm admin:dev` (runs on `http://localhost:5174`)
   - Start the **Waiter POS App**: `pnpm pos:dev` (runs on `http://localhost:5175`)
   - Start the **Monitoring Panel**: `pnpm monitoring:dev` (runs on `http://localhost:5176`)

### Option B: Running in Production (Nginx Setup)
To deploy Meat Lovers CIMS onto a local LAN server (e.g. at IP `192.168.1.10`) for live restaurant operations:

1. **Build all frontend assets**:
   ```bash
   pnpm build
   ```

2. **Deploy Nginx configuration**:
   Copy the virtual host configuration file and restart Nginx:
   ```bash
   sudo cp deployment/nginx/meat-lovers-cims.conf /etc/nginx/sites-available/meat-lovers-cims
   sudo ln -sf /etc/nginx/sites-available/meat-lovers-cims /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

3. **Deploy Apache configuration (Alternative)**:
   ```bash
   sudo cp deployment/apache/meat-lovers-cims.conf /etc/httpd/conf.d/meat-lovers-cims.conf
   sudo systemctl restart httpd
   ```

Once deployed via Nginx/Apache, the apps are accessible over the local area network:
- Customer Website: `http://192.168.1.10`
- Admin Dashboard: `http://192.168.1.10/admin`
- Waiter POS App: `http://192.168.1.10/pos`
- Monitoring Panel: `http://192.168.1.10/monitoring`
- Unified REST API: `http://192.168.1.10/api`

---

## 🔐 Default Admin / Staff Logins

The database seeds populate the system with pre-configured staff profiles. Logins can be accessed using the credentials below:

| Role | Default Email / Username | Default Password |
|---|---|---|
| **Super Admin** | `admin@meatlovers.local` | `password` *(or the hash configured in database seeds)* |
| **Manager** | `manager@meatlovers.local` | `password` |
| **Cashier** | `cashier@meatlovers.local` | `password` |
| **Waiter** | `waiter@meatlovers.local` | `password` |
| **Chef** | `chef@meatlovers.local` | `password` |
| **Storekeeper** | `store@meatlovers.local` | `password` |
| **Barman** | `bar@meatlovers.local` | `password` |

*(Refer to `docs/SEED_DATA_MANUAL.md` for passwords rule instructions).*

---

## 💾 Automated Backup Verification
The system contains a cron script to create database dumps every night at 23:00 (11:00 PM). To configure this:

```bash
chmod +x deployment/scripts/backup_mysql.sh
# Open crontab config and insert:
0 23 * * * /var/www/meat-lovers-cims/deployment/scripts/backup_mysql.sh
```

---

*System developed by YohPal. Refer to developer manuals in the `docs/` directory for full specifications.*
