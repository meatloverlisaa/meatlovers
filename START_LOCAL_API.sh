#!/bin/bash

# 🚀 Start Local API Server
# This script starts the MeatLovers API in development mode

echo "🚀 Starting MeatLovers API Server..."
echo ""
echo "📍 Location: /home/the-macharias/MeatLovers/meetlovers/api"
echo "🌐 URL: http://localhost:3001"
echo "📝 Mode: Development (with hot reload)"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""
echo "─────────────────────────────────────────────────────"
echo ""

# Navigate to API directory
cd /home/the-macharias/MeatLovers/meetlovers/api

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
  echo "⚠️  node_modules not found. Installing dependencies..."
  npm install
  echo ""
fi

# Check if .env exists
if [ ! -f ".env" ]; then
  echo "⚠️  .env file not found!"
  echo "📄 Please create .env file with DATABASE_URL and JWT_SECRET"
  echo ""
  exit 1
fi

# Start the API server
npm run start:dev
