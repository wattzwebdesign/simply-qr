#!/bin/bash
# Backend-Only Deployment for Simply QR
# Use this if frontend build keeps failing

set -e

echo "=== Simply QR Backend-Only Deployment ==="

# Check if backend/.env exists
if [ ! -f "backend/.env" ]; then
    echo "ERROR: backend/.env file not found!"
    exit 1
fi

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
npm install --production

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy

cd ..

# Create logs directory
mkdir -p backend/logs

# Install PM2 if needed
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    npm install -g pm2
fi

# Stop any running backend
pm2 delete simply-qr-backend 2>/dev/null || true

# Start backend with PM2
echo "Starting backend with PM2..."
pm2 start ecosystem.config.js
pm2 save

echo "=== Backend Deployment Complete ==="
echo ""
echo "Backend API: http://localhost:3000"
echo "Health check: curl http://localhost:3000/health"
echo ""
echo "PM2 commands:"
echo "  pm2 status"
echo "  pm2 logs simply-qr-backend"
echo "  pm2 restart simply-qr-backend"
echo ""
echo "Note: Frontend build skipped. Build locally and upload manually."
