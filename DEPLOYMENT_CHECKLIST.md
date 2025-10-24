# Deployment Checklist ✅

Use this checklist to ensure smooth deployment to xCloud.

## Pre-Deployment (Local)

- [ ] **Test locally first**
  ```bash
  cd backend && npm install && npx prisma generate && npm run dev
  cd ../frontend && npm install && npm run dev
  ```

- [ ] **Verify database connection locally**
  ```bash
  cd backend && npx prisma db pull
  ```

- [ ] **Test all features:**
  - [ ] User registration works
  - [ ] User login works
  - [ ] Create QR code works
  - [ ] Edit QR code works
  - [ ] Delete QR code works
  - [ ] Dashboard loads QR codes

- [ ] **Build frontend successfully**
  ```bash
  cd frontend && npm run build
  ```

- [ ] **Commit all changes**
  ```bash
  git add .
  git commit -m "Ready for deployment"
  ```

## Deployment Setup (xCloud Server)

### Step 1: Create Environment File

Choose ONE method:

**Method A: Use Setup Script (Recommended)**
```bash
# SSH into xCloud
ssh user@server

# Navigate to project
cd /path/to/simply-qr

# Run setup script
bash setup-env.sh

# Verify .env was created
cat backend/.env
```

**Method B: Create Manually**
```bash
# SSH into xCloud
ssh user@server

# Create .env
nano backend/.env
```

Add:
```env
DATABASE_URL="mysql://u167824_bubbling:jciCsq8SSFUGS98f@localhost:3306/s167824_bubbling"
JWT_SECRET="YOUR_SECURE_SECRET_HERE"
PORT=3000
NODE_ENV=production
```

Generate JWT_SECRET:
```bash
openssl rand -base64 32
```

- [ ] **.env file created in backend/ directory**
- [ ] **JWT_SECRET is secure (32+ characters)**
- [ ] **DATABASE_URL matches xCloud credentials**

### Step 2: Initial Database Setup

- [ ] **Test database connection**
  ```bash
  mysql -u u167824_bubbling -p s167824_bubbling
  # Password: jciCsq8SSFUGS98f
  ```

- [ ] **Ensure database exists**
  ```sql
  SHOW DATABASES LIKE 's167824_bubbling';
  ```

- [ ] **Exit MySQL**
  ```sql
  EXIT;
  ```

### Step 3: Run Deployment

- [ ] **Run deployment script**
  ```bash
  bash .xcloud-deploy.sh
  ```

- [ ] **Check for errors in output**
  - Should see: ✔ Generated Prisma Client
  - Should see: ✔ Running database migrations
  - Should see: ✔ Building frontend
  - Should see: ✔ Starting backend with PM2

### Step 4: Verify Backend

- [ ] **Check PM2 status**
  ```bash
  pm2 status
  ```
  Should show: `simply-qr-backend` with status `online`

- [ ] **Check backend logs**
  ```bash
  pm2 logs simply-qr-backend --lines 50
  ```
  Should see: `Simply QR Backend running on port 3000`

- [ ] **Test API health endpoint**
  ```bash
  curl http://localhost:3000/health
  ```
  Should return: `{"status":"ok","timestamp":"..."}`

- [ ] **Test API through proxy**
  ```bash
  curl http://yourdomain.com/api.php/health
  ```

### Step 5: Verify Frontend

- [ ] **Check files in root directory**
  ```bash
  ls -la index.html assets/
  ```

- [ ] **Check .htaccess exists**
  ```bash
  ls -la .htaccess
  ```

- [ ] **Visit domain in browser**
  - URL: http://yourdomain.com
  - Should see: Simply QR login page

### Step 6: Test Application

- [ ] **Register new user**
  - Username: test-user
  - Email: test@example.com
  - Password: Test@Pass123

- [ ] **Login with new user**

- [ ] **Create test QR code**
  - Name: Test QR
  - URL: https://google.com

- [ ] **View QR code details**

- [ ] **Test QR code redirect**
  - Get short code from QR details
  - Visit: http://yourdomain.com/r/{shortcode}
  - Should redirect to target URL

- [ ] **Check scan was tracked**
  - Go back to QR code details
  - Scan count should be 1

### Step 7: Create Admin User (Optional)

- [ ] **Connect to MySQL**
  ```bash
  mysql -u u167824_bubbling -p s167824_bubbling
  ```

- [ ] **Make user admin**
  ```sql
  UPDATE User SET isAdmin = true WHERE username = 'your-username';
  ```

- [ ] **Verify**
  ```sql
  SELECT username, isAdmin FROM User;
  EXIT;
  ```

## Post-Deployment

### Monitoring

- [ ] **Set up PM2 log rotation**
  ```bash
  pm2 install pm2-logrotate
  pm2 set pm2-logrotate:max_size 10M
  pm2 set pm2-logrotate:retain 7
  ```

- [ ] **Save PM2 process list**
  ```bash
  pm2 save
  pm2 startup
  ```

### Security

- [ ] **Verify .env is NOT in Git**
  ```bash
  git status
  # .env should NOT appear in untracked files
  ```

- [ ] **Change default JWT_SECRET**
  - Should be 32+ character random string
  - Not "your-secret-key-here"

- [ ] **Test HTTPS (if SSL enabled)**
  - Visit: https://yourdomain.com
  - Check for SSL certificate

- [ ] **Review security headers**
  ```bash
  curl -I http://yourdomain.com
  ```
  Should see:
  - X-Content-Type-Options: nosniff
  - X-Frame-Options: SAMEORIGIN
  - X-XSS-Protection: 1; mode=block

### Backup

- [ ] **Set up database backup cron job**
  ```bash
  crontab -e
  ```
  Add:
  ```
  0 2 * * * mysqldump -u u167824_bubbling -p'jciCsq8SSFUGS98f' s167824_bubbling > /backup/simplyqr_$(date +\%Y\%m\%d).sql
  ```

## Troubleshooting

### Backend Won't Start

```bash
# Check logs
pm2 logs simply-qr-backend --err

# Check if port 3000 is in use
netstat -tuln | grep 3000

# Restart
pm2 restart simply-qr-backend

# Delete and re-start
pm2 delete simply-qr-backend
pm2 start ecosystem.config.js
```

### Database Connection Error

```bash
# Test connection
cd backend
npx prisma db pull

# Check credentials
cat backend/.env | grep DATABASE_URL

# Test MySQL directly
mysql -u u167824_bubbling -p s167824_bubbling
```

### Frontend Not Loading

```bash
# Check if files exist
ls -la index.html assets/

# Rebuild frontend
cd frontend
npm run build
cd ..
cp -r frontend/dist/* .

# Check .htaccess
cat .htaccess
```

### API Returns 502/503

```bash
# Check if backend is running
pm2 status

# Test direct connection
curl http://localhost:3000/health

# Check PHP proxy
php -l api.php

# View PHP errors
tail -f /var/log/apache2/error.log
```

## Maintenance Commands

```bash
# View status
pm2 status

# View logs (live)
pm2 logs simply-qr-backend

# Restart backend
pm2 restart simply-qr-backend

# Monitor resources
pm2 monit

# Update application
git pull origin main
bash .xcloud-deploy.sh

# Backup database
mysqldump -u u167824_bubbling -p s167824_bubbling > backup.sql

# Restore database
mysql -u u167824_bubbling -p s167824_bubbling < backup.sql
```

## Success Criteria

✅ **Deployment is successful when:**

1. PM2 shows backend as "online"
2. `curl http://localhost:3000/health` returns OK
3. Frontend loads at your domain
4. Can register and login
5. Can create QR codes
6. Can scan QR codes (redirects work)
7. Analytics are tracked
8. No errors in PM2 logs

---

## Need Help?

See:
- `README.md` - Full documentation
- `DEPLOYMENT.md` - Detailed deployment guide
- `DEPLOYMENT_FIX.md` - Common deployment issues
- `QUICKSTART.md` - Quick start guide

Or check logs:
```bash
pm2 logs simply-qr-backend
tail -f /var/log/apache2/error.log
```
