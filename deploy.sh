#!/bin/bash

# SimplyQR Deployment Script for xCloud
# This script runs when code is pushed or server is started

echo "======================================"
echo "Starting SimplyQR Deployment"
echo "======================================"

# Exit on any error
set -e

# Install dependencies
echo "Installing dependencies..."
npm install --production

# Build QRCode browser bundle
echo "Building QRCode browser bundle..."
npx browserify -r qrcode -o public/js/qrcode-bundle.js --standalone QRCode

# Initialize database
echo "Initializing database..."
node -e "
const { initializeDatabase } = require('./config/database');
initializeDatabase()
  .then(() => {
    console.log('Database initialized successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Database initialization failed:', error);
    process.exit(1);
  });
"

# Create necessary directories
echo "Creating directories..."
mkdir -p public/qr-codes
chmod 755 public/qr-codes

echo "======================================"
echo "Deployment completed successfully!"
echo "======================================"
echo "Starting server on port ${PORT:-3323}..."

# Start the server
exec node server.js
