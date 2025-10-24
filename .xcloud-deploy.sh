#!/bin/bash
# xCloud Deployment Script for Simply QR
# This script is automatically run by xCloud when code is pushed

set -e  # Exit on error

echo "=== Simply QR Deployment Started ==="

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

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd frontend
npm install

# Build frontend for production
echo "Building frontend..."
npm run build

# Copy built files to root directory
echo "Copying build files to root..."
cd ..
cp -r frontend/dist/* .

# Create logs directory for PM2
echo "Creating logs directory..."
mkdir -p backend/logs

# Install PM2 globally if not installed
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    npm install -g pm2
fi

# Start or restart backend with PM2
echo "Starting backend with PM2..."
pm2 delete simply-qr-backend 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save

echo "=== Deployment Complete ==="
echo "Frontend: Deployed to root directory"
echo "Backend: Running on port 3000 via PM2"
echo ""
echo "Useful PM2 commands:"
echo "  pm2 status                     - Check process status"
echo "  pm2 logs simply-qr-backend    - View logs"
echo "  pm2 restart simply-qr-backend - Restart backend"
echo "  pm2 monit                      - Monitor processes"
