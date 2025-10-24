# Deployment Guide for Simply QR

## xCloud Deployment Instructions

### Prerequisites

1. **xCloud Account** with:
   - MySQL database access
   - Node.js support
   - PM2 installed
   - Git deployment enabled

2. **Database Credentials**:
   ```
   DB_HOST=localhost
   DB_PORT=3306
   DB_DATABASE=s167824_bubbling
   DB_USERNAME=u167824_bubbling
   DB_PASSWORD=jciCsq8SSFUGS98f
   ```

### Step 1: Prepare Backend Environment

1. Create `backend/.env` file on the server with production settings:

```env
DATABASE_URL="mysql://u167824_bubbling:jciCsq8SSFUGS98f@localhost:3306/s167824_bubbling"
JWT_SECRET="GENERATE_A_SECURE_SECRET_HERE"
PORT=3000
NODE_ENV=production
```

**Important**: Generate a secure JWT_SECRET:
```bash
openssl rand -base64 32
```

### Step 2: Initial Database Setup

The deployment script will run migrations automatically, but you can manually run them if needed:

```bash
cd backend
npx prisma migrate deploy
```

### Step 3: Configure Git Deployment

1. In xCloud, enable Git auto-deploy
2. Set the deployment script to: `.xcloud-deploy.sh`
3. Push your code to the repository

### Step 4: Verify Deployment

1. Check PM2 status:
```bash
pm2 status
```

You should see `simply-qr-backend` running.

2. View logs:
```bash
pm2 logs simply-qr-backend
```

3. Test API health:
```bash
curl http://localhost:3000/health
```

Should return: `{"status":"ok","timestamp":"..."}`

### Step 5: Test Frontend

1. Navigate to your domain in a browser
2. You should see the Simply QR login page
3. Try registering a new account
4. Create a test QR code

### Step 6: Create First Admin User (Optional)

To create an admin user, update the database directly:

```sql
UPDATE User SET isAdmin = true WHERE username = 'your-username';
```

## Manual Deployment

If automatic deployment doesn't work, you can deploy manually:

```bash
# 1. Install backend dependencies
cd backend
npm install --production
npx prisma generate
npx prisma migrate deploy
cd ..

# 2. Build frontend
cd frontend
npm install
npm run build
cd ..

# 3. Copy frontend build to root
cp -r frontend/dist/* .

# 4. Create logs directory
mkdir -p backend/logs

# 5. Start with PM2
pm2 delete simply-qr-backend 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
```

## Troubleshooting

### Backend Not Starting

1. Check logs:
```bash
pm2 logs simply-qr-backend --err
```

2. Check if port 3000 is available:
```bash
netstat -tuln | grep 3000
```

3. Verify database connection:
```bash
cd backend
npx prisma db pull
```

### API Not Responding

1. Check if backend is running:
```bash
pm2 status
curl http://localhost:3000/health
```

2. Check Apache/Nginx logs for proxy errors

3. Verify `.htaccess` file is in the root directory

4. Test PHP proxy directly:
```bash
curl http://yourdomain.com/api.php/health
```

### Database Migration Errors

1. Check database credentials in `backend/.env`

2. Manually run migrations:
```bash
cd backend
npx prisma migrate deploy --schema=./prisma/schema.prisma
```

3. If migrations fail, check MySQL user permissions:
```sql
SHOW GRANTS FOR 'u167824_bubbling'@'localhost';
```

### Frontend Not Loading

1. Verify files are in root directory:
```bash
ls -la index.html assets/
```

2. Check `.htaccess` rewrite rules are working:
```bash
# Create test file
echo "test" > test.txt

# Try accessing it
curl http://yourdomain.com/test.txt
```

3. Check Apache mod_rewrite is enabled

### QR Code Redirects Not Working

1. Test redirect endpoint:
```bash
curl -I http://yourdomain.com/r/test123
```

2. Check `.htaccess` has redirect rules for `/r/*`

3. Verify `api.php` is routing correctly

## PM2 Commands Reference

```bash
# View status
pm2 status

# View logs
pm2 logs simply-qr-backend

# Restart
pm2 restart simply-qr-backend

# Stop
pm2 stop simply-qr-backend

# Start
pm2 start simply-qr-backend

# Monitor
pm2 monit

# View detailed info
pm2 show simply-qr-backend

# Save PM2 process list (auto-start on reboot)
pm2 save
pm2 startup
```

## Performance Optimization

### Enable Gzip Compression

Add to `.htaccess`:
```apache
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/css text/javascript application/javascript application/json
</IfModule>
```

### Enable Browser Caching

Already included in `.htaccess`:
```apache
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

### Database Optimization

Add indexes for frequently queried fields:
```sql
CREATE INDEX idx_qrcode_userid ON QRCode(userId);
CREATE INDEX idx_qrcode_shortcode ON QRCode(shortCode);
CREATE INDEX idx_scan_qrcodeid ON Scan(qrCodeId);
```

## Security Checklist

- [ ] Change default JWT_SECRET to a secure random string
- [ ] Ensure database credentials are not committed to Git
- [ ] Verify `.env` files are in `.gitignore`
- [ ] Enable HTTPS (SSL certificate)
- [ ] Set strong MySQL password
- [ ] Disable directory listing in Apache
- [ ] Keep Node.js and npm packages updated
- [ ] Set up regular database backups
- [ ] Configure firewall rules (only allow ports 80, 443, 22)

## Monitoring

### Set Up PM2 Monitoring

```bash
# Install PM2 logs rotation
pm2 install pm2-logrotate

# Set log rotation to 7 days
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### Database Backups

Set up a cron job for daily backups:

```bash
# Add to crontab
0 2 * * * mysqldump -u u167824_bubbling -p'jciCsq8SSFUGS98f' s167824_bubbling > /backup/simplyqr_$(date +\%Y\%m\%d).sql
```

## Updating the Application

1. Pull latest code:
```bash
git pull origin main
```

2. Run deployment script:
```bash
bash .xcloud-deploy.sh
```

Or manually:
```bash
cd backend
npm install --production
npx prisma generate
npx prisma migrate deploy
cd ../frontend
npm install
npm run build
cd ..
cp -r frontend/dist/* .
pm2 restart simply-qr-backend
```

## Support

For deployment issues:
1. Check PM2 logs: `pm2 logs`
2. Check Apache error logs: `tail -f /var/log/apache2/error.log`
3. Test API directly: `curl http://localhost:3000/health`
4. Verify database connection: `cd backend && npx prisma db pull`
