#!/bin/bash
# Debug script - Run this on xCloud and share the output

echo "=== Simply QR Backend Debug Report ==="
echo ""

echo "1. PM2 Status:"
pm2 status
echo ""

echo "2. Backend Error Logs (last 50 lines):"
pm2 logs simply-qr-backend --err --lines 50 --nostream
echo ""

echo "3. Backend Output Logs (last 30 lines):"
pm2 logs simply-qr-backend --out --lines 30 --nostream
echo ""

echo "4. Check if .env file exists:"
if [ -f "backend/.env" ]; then
    echo "✅ backend/.env exists"
    echo "Contents (hiding sensitive data):"
    cat backend/.env | sed 's/=.*/=***HIDDEN***/g'
else
    echo "❌ backend/.env NOT FOUND!"
fi
echo ""

echo "5. Check if node_modules exists:"
if [ -d "backend/node_modules" ]; then
    echo "✅ backend/node_modules exists"
else
    echo "❌ backend/node_modules NOT FOUND!"
fi
echo ""

echo "6. Test database connection:"
cd backend
npx prisma db pull --schema=./prisma/schema.prisma 2>&1 || echo "Database connection failed"
cd ..
echo ""

echo "7. Check if port 3000 is in use:"
netstat -tuln | grep 3000 || echo "Port 3000 is not in use"
echo ""

echo "8. Node.js version:"
node --version
echo ""

echo "9. NPM version:"
npm --version
echo ""

echo "=== End Debug Report ==="
