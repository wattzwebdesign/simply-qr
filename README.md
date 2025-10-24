# Simply QR - QR Code Management System

A full-stack QR code creation and management system with analytics tracking.

## Features

- 🔐 **User Authentication** - Secure login/registration with JWT
- 🎨 **Custom QR Codes** - Customize colors and sizes
- 📊 **Analytics Tracking** - Track scans with IP, timestamp, user agent
- 🔗 **Short URLs** - `/r/{code}` redirects to target URLs
- 📱 **Responsive UI** - Mobile-friendly Vue.js interface

## Tech Stack

**Backend:** Node.js + Express + Prisma + MySQL
**Frontend:** Vue.js 3 + Vite + Pinia + Vue Router
**Deployment:** PM2 + Apache + PHP proxy

## Quick Start

### Local Development

```bash
# 1. Install backend
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npx prisma generate
npx prisma migrate dev
npm run dev

# 2. Install frontend (new terminal)
cd frontend
npm install
npm run dev
```

Visit http://localhost:5173

### Production Deployment (xCloud)

```bash
# On server - create .env first
bash setup-env.sh

# Deploy
bash .xcloud-deploy.sh

# Verify
pm2 status
curl http://localhost:3000/health
```

## Environment Setup

### Backend `.env` file:

```env
DATABASE_URL="mysql://u167824_bubbling:jciCsq8SSFUGS98f@localhost:3306/s167824_bubbling"
JWT_SECRET="your-secure-secret-here"
PORT=3000
NODE_ENV=production
```

Generate secure JWT_SECRET:
```bash
openssl rand -base64 32
```

## Database Schema

- **User** - id, username, email, password (hashed), isAdmin
- **QRCode** - id, userId, name, url, qrCodeData, shortCode, colors, size, scanCount, isActive
- **Scan** - id, qrCodeId, scannedAt, ipAddress, userAgent, country, city

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get profile

### QR Codes (authenticated)
- `POST /api/qrcodes` - Create QR code
- `GET /api/qrcodes` - List QR codes
- `GET /api/qrcodes/:id` - Get details
- `PUT /api/qrcodes/:id` - Update QR code
- `DELETE /api/qrcodes/:id` - Delete QR code
- `GET /api/qrcodes/:id/analytics` - Get analytics

### Redirects (public)
- `GET /r/:shortCode` - Redirect & track scan

## Troubleshooting

### Backend won't start?
```bash
pm2 logs simply-qr-backend --err
cd backend && npx prisma db pull
```

### Frontend build fails?
```bash
cd frontend
rm -rf node_modules
npm install
npm run build
```

### Database connection error?
```bash
# Test connection
mysql -u u167824_bubbling -p s167824_bubbling
```

## PM2 Commands

```bash
pm2 status                     # Check status
pm2 logs simply-qr-backend    # View logs
pm2 restart simply-qr-backend # Restart
pm2 monit                      # Monitor
```

## Project Structure

```
simply-qr/
├── backend/           # Node.js + Express API
├── frontend/          # Vue.js 3 SPA
├── .htaccess         # Apache routing
├── api.php           # PHP proxy
├── ecosystem.config.js  # PM2 config
└── .xcloud-deploy.sh   # Deployment script
```

## Support

- Check logs: `pm2 logs simply-qr-backend`
- Test API: `curl http://localhost:3000/health`
- View errors: `tail -f /var/log/apache2/error.log`

## License

ISC
