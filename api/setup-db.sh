#!/bin/bash

# Setup script for Meat Lovers CIMS Database
# This script sets up the MySQL database and user

echo "=========================================="
echo "Meat Lovers CIMS - Database Setup"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if MySQL is running
if ! systemctl is-active --quiet mysql && ! systemctl is-active --quiet mariadb; then
    echo -e "${RED}Error: MySQL/MariaDB is not running.${NC}"
    echo "Please start MySQL with: sudo systemctl start mysql"
    exit 1
fi

echo -e "${GREEN}MySQL is running ✓${NC}"
echo ""

# Try to execute the setup SQL script
echo -e "${YELLOW}Setting up database and user...${NC}"
echo "You will be prompted for your MySQL root password."
echo ""

if sudo mysql < setup-database.sql; then
    echo ""
    echo -e "${GREEN}✓ Database setup completed successfully!${NC}"
    echo ""
    echo "Database: meat_lovers_cims"
    echo "User: meat_lovers_user"
    echo "Password: StrongLocalPassword"
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo "1. Run: npm run prisma:migrate"
    echo "2. Run: npm run prisma:seed (if you have seed data)"
    echo "3. Run: npm start"
    echo ""
else
    echo ""
    echo -e "${RED}✗ Database setup failed.${NC}"
    echo ""
    echo "Please try manually:"
    echo "  sudo mysql < setup-database.sql"
    echo ""
    echo "Or connect to MySQL and run the commands manually:"
    echo "  sudo mysql"
    echo "  source setup-database.sql"
    exit 1
fi
