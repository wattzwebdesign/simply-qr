# Nginx Setup for Simply QR

## Clean URLs (No # in URLs)

The app now uses HTML5 History mode for clean URLs like `/dashboard` instead of `/#/dashboard`.

## Setup Steps

### 1. Configure Nginx

**Option A: Using xCloud's nginx config interface**

Add this to your site's nginx configuration:

```nginx
# API proxy
location /api/ {
    proxy_pass http://localhost:3000/api/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

# QR redirect proxy
location /r/ {
    proxy_pass http://localhost:3000/r/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
}

# Static assets
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# Vue.js SPA routing
location / {
    try_files $uri $uri/ /index.html;
}
```

**Option B: Edit nginx config file directly (if you have SSH)**

```bash
# Find your nginx config (usually here)
sudo nano /etc/nginx/sites-available/bubbling-butterfly-167824.conf

# Add the location blocks above

# Test configuration
sudo nginx -t

# If test passes, reload nginx
sudo systemctl reload nginx
```

### 2. Rebuild Frontend

The router change requires a rebuild:

```bash
# On your LOCAL machine
cd /Users/donaldmcguinn/Documents/GitHub/simply-qr
bash build-frontend-locally.sh

# Upload frontend/dist/* to xCloud root
# (via FTP, SFTP, or xCloud file manager)
```

### 3. Test

Visit these URLs (no # symbol):
- `https://bubbling-butterfly-167824.1wp.site/login`
- `https://bubbling-butterfly-167824.1wp.site/dashboard`
- `https://bubbling-butterfly-167824.1wp.site/qrcodes/create`

All should work!

## How It Works

**Before (Hash History):**
```
URL: https://site.com/#/dashboard
- Browser doesn't send anything after # to server
- Client-side routing only
- Works without server config
```

**After (HTML5 History):**
```
URL: https://site.com/dashboard
- Browser sends full path to server
- Server must return index.html for all routes
- Requires nginx config
```

## Nginx Routing Logic

1. **`/api/*`** → Proxy to Node.js backend (port 3000)
2. **`/r/*`** → Proxy to Node.js backend (QR redirects)
3. **Static files** → Serve directly with caching
4. **Everything else** → Return `index.html` (Vue Router handles it)

## Troubleshooting

### 404 errors on page refresh

**Problem:** Refreshing `/dashboard` gives 404

**Solution:** Nginx config not applied. Check:
```bash
# Check nginx config
sudo nginx -t

# Check if location blocks are in the right server block
sudo cat /etc/nginx/sites-available/your-site.conf
```

### API calls fail

**Problem:** `/api/auth/login` returns 404

**Solution:** API proxy not working. Check:
```bash
# Test API directly
curl http://localhost:3000/api/health

# Test through nginx
curl https://bubbling-butterfly-167824.1wp.site/api/health

# Check nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### Old URLs with # still work

**Problem:** `/#/dashboard` still accessible

**Solution:** This is normal! Old hash URLs redirect to clean URLs automatically. Users' bookmarks won't break.

## Apache Fallback

If nginx isn't available, the `.htaccess` file provides the same functionality for Apache servers.

## Security Note

The nginx config includes:
- Proper proxy headers for API calls
- Static asset caching
- Security headers
- Gzip compression

All configured for production use.
