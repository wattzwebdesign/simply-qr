# Deployment Fix - Environment File Required

## Error Encountered

```
Error: Environment variable not found: DATABASE_URL.
```

This happens because the `backend/.env` file doesn't exist on the server.

## Quick Fix (Choose One Method)

### Method 1: Create .env via SSH (Recommended)

1. **SSH into your xCloud server:**
```bash
ssh your-username@your-server
cd /path/to/simply-qr
```

2. **Create the .env file:**
```bash
nano backend/.env
```

3. **Add this content:**
```env
DATABASE_URL="mysql://u167824_bubbling:jciCsq8SSFUGS98f@localhost:3306/s167824_bubbling"
JWT_SECRET="REPLACE_WITH_SECURE_SECRET"
PORT=3000
NODE_ENV=production
```

4. **Generate a secure JWT_SECRET:**
```bash
# Run this command to generate a secure secret
openssl rand -base64 32
```

Copy the output and replace `REPLACE_WITH_SECURE_SECRET` in the .env file.

5. **Save and exit:**
- Press `Ctrl+X`
- Press `Y`
- Press `Enter`

6. **Re-run deployment:**
```bash
bash .xcloud-deploy.sh
```

### Method 2: Use FTP/File Manager

1. **Login to xCloud File Manager or FTP**

2. **Navigate to:** `simply-qr/backend/`

3. **Create new file:** `.env`

4. **Add content:**
```env
DATABASE_URL="mysql://u167824_bubbling:jciCsq8SSFUGS98f@localhost:3306/s167824_bubbling"
JWT_SECRET="use-openssl-rand-base64-32-to-generate-this"
PORT=3000
NODE_ENV=production
```

5. **Save the file**

6. **Re-deploy via Git push or run script manually**

### Method 3: Create .env Template Locally and Push

**Note:** This is NOT recommended for security reasons (credentials in Git), but if you must:

1. **Locally, create backend/.env:**
```bash
cd backend
cp .env.example .env
```

2. **Edit backend/.env with production values**

3. **Temporarily remove .env from .gitignore:**
```bash
# Comment out .env in backend/.gitignore
```

4. **Commit and push:**
```bash
git add backend/.env
git commit -m "Add production env (TEMPORARY - will remove)"
git push
```

5. **After deployment, remove from Git:**
```bash
git rm backend/.env
git commit -m "Remove .env from Git"
git push
```

6. **Re-add .env to .gitignore**

**⚠️ IMPORTANT:** Method 3 exposes your credentials in Git history. Only use if you plan to reset the repository or rotate credentials.

## After Creating .env File

The deployment should succeed. You'll see:

```
✓ Generated Prisma Client
✓ Running database migrations
✓ Building frontend
✓ Starting backend with PM2
```

## Verify Deployment

```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs simply-qr-backend

# Test API
curl http://localhost:3000/health
```

Should return:
```json
{"status":"ok","timestamp":"2024-..."}
```

## Test Frontend

Visit your xCloud domain in a browser. You should see the Simply QR login page.

## Security Reminder

**NEVER commit .env files to Git!**

The .env file should always be:
1. Created manually on the server
2. Listed in .gitignore
3. Contain secure, randomly generated secrets

## Generate Secure Secrets

```bash
# Generate JWT_SECRET
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Or online
# Visit: https://generate-secret.vercel.app/32
```

## Still Having Issues?

Check these:

1. **Database connection:**
```bash
cd backend
npx prisma db pull
```

2. **File permissions:**
```bash
chmod 644 backend/.env
```

3. **MySQL credentials:**
```bash
mysql -u u167824_bubbling -p -e "SELECT 1"
# Enter password: jciCsq8SSFUGS98f
```

4. **PM2 logs:**
```bash
pm2 logs simply-qr-backend --err
```

## Next Steps After Successful Deployment

1. Visit your domain
2. Register first user
3. Login
4. Create your first QR code
5. (Optional) Make yourself admin:
```sql
UPDATE User SET isAdmin = true WHERE username = 'your-username';
```
