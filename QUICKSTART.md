# Quick Start Guide - Simply QR

## Get Started in 5 Minutes

### Local Development

#### 1. Install Backend

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env` with your database credentials:
```env
DATABASE_URL="mysql://user:password@localhost:3306/database"
JWT_SECRET="your-secret-key"
```

Generate Prisma client and run migrations:
```bash
npx prisma generate
npx prisma migrate dev
npm run dev
```

Backend running on http://localhost:3000

#### 2. Install Frontend

Open a new terminal:
```bash
cd frontend
npm install
npm run dev
```

Frontend running on http://localhost:5173

#### 3. Create Your First Account

1. Open http://localhost:5173
2. Click "Register here"
3. Create account with:
   - Username: your-username
   - Email: your@email.com
   - Password: Strong@Pass123

4. Login and create your first QR code!

---

## Production Deployment to xCloud

### Option 1: Automatic Deployment (Recommended)

1. **Push to Git**:
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Enable Git Auto-Deploy** in xCloud dashboard

3. **Set Deployment Script** to: `.xcloud-deploy.sh`

4. **Done!** xCloud will automatically:
   - Install dependencies
   - Run database migrations
   - Build frontend
   - Start backend with PM2

### Option 2: Manual Deployment

1. **SSH into xCloud server**

2. **Create backend/.env** file:
```bash
nano backend/.env
```

Add:
```env
DATABASE_URL="mysql://u167824_bubbling:jciCsq8SSFUGS98f@localhost:3306/s167824_bubbling"
JWT_SECRET="CHANGE_THIS_TO_SECURE_SECRET"
PORT=3000
NODE_ENV=production
```

Save and exit (Ctrl+X, Y, Enter)

3. **Run deployment script**:
```bash
bash .xcloud-deploy.sh
```

4. **Verify deployment**:
```bash
pm2 status
pm2 logs simply-qr-backend
```

5. **Access your site** at your xCloud domain!

---

## First Steps After Deployment

### 1. Create Admin User

After registering, make yourself an admin:

```bash
# SSH into server
# Access MySQL
mysql -u u167824_bubbling -p s167824_bubbling

# Update user to admin
UPDATE User SET isAdmin = true WHERE username = 'your-username';
exit;
```

### 2. Test QR Code Creation

1. Login to your account
2. Click "Create QR"
3. Fill in:
   - Name: Test QR
   - URL: https://google.com
   - Customize colors (optional)
4. Click "Create QR Code"

### 3. Test QR Code Redirect

1. Get the short code from your QR code details
2. Visit: `https://yourdomain.com/r/[shortcode]`
3. Should redirect to target URL and track the scan!

---

## Common Commands

### Development

```bash
# Backend
cd backend
npm run dev          # Start dev server
npx prisma studio    # Open database GUI

# Frontend
cd frontend
npm run dev          # Start dev server
npm run build        # Build for production
```

### Production (PM2)

```bash
pm2 status                    # Check status
pm2 logs simply-qr-backend   # View logs
pm2 restart simply-qr-backend # Restart
pm2 monit                     # Monitor
```

### Database

```bash
cd backend
npx prisma migrate dev        # Create new migration
npx prisma migrate deploy     # Run migrations (production)
npx prisma studio             # Open database GUI
npx prisma db push            # Push schema without migration
```

---

## Troubleshooting

### Backend won't start?
```bash
# Check logs
pm2 logs simply-qr-backend --err

# Test database connection
cd backend
npx prisma db pull
```

### Frontend not loading?
```bash
# Verify build files exist
ls -la index.html assets/

# Rebuild frontend
cd frontend
npm run build
cd ..
cp -r frontend/dist/* .
```

### API errors?
```bash
# Test API directly
curl http://localhost:3000/health

# Check if PHP proxy works
curl http://yourdomain.com/api.php/health
```

---

## Need Help?

- **Full Documentation**: See `README.md`
- **Deployment Guide**: See `DEPLOYMENT.md`
- **Issues**: Create issue on GitHub
- **API Docs**: See API endpoints in `README.md`

---

## What's Next?

- Customize QR code colors
- Track scan analytics
- Share QR codes with others
- Integrate with your website
- Set up custom domain

Happy QR coding! 🎉
