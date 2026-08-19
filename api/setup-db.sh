#!/bin/bash

# Setup script for Meat Lovers CIMS Database
# This script provides guidance for PostgreSQL database setup

echo "=========================================="
echo "Meat Lovers CIMS - Database Setup"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}PostgreSQL Database Setup${NC}"
echo ""
echo "This project uses PostgreSQL with Prisma ORM."
echo "Your DATABASE_URL is already configured in .env.example"
echo ""
echo -e "${GREEN}✓ Database configuration completed!${NC}"
echo ""
echo "Database: neondb (Neon PostgreSQL)"
echo "Connection: Configured via DATABASE_URL"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Copy .env.example to .env: cp .env.example .env"
echo "2. Run: npm run prisma:generate"
echo "3. Run: npm run prisma:migrate deploy"
echo "4. Run: npm run prisma:seed (optional - for initial users)"
echo "5. Run: npm start"
echo ""
echo -e "${YELLOW}Note:${NC}"
echo "- The database is hosted on Neon (PostgreSQL)"
echo "- SSL is required for connection"
echo "- No manual database creation needed (Neon handles this)"
echo ""
