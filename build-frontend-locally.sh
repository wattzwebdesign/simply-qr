#!/bin/bash
# Build frontend locally and prepare for manual upload
# Run this on your LOCAL machine, then upload the dist folder

echo "=== Building Frontend Locally ==="

cd frontend

echo "Installing dependencies..."
npm install

echo "Building for production..."
npm run build

echo ""
echo "✅ Build complete!"
echo ""
echo "Files are in: frontend/dist/"
echo ""
echo "To deploy to xCloud:"
echo "1. Upload all files from frontend/dist/ to your xCloud root directory"
echo "2. Make sure .htaccess and api.php are in the root"
echo "3. Backend should already be running via PM2"
echo ""
echo "Or run: scp -r frontend/dist/* user@server:/var/www/yoursite/"
