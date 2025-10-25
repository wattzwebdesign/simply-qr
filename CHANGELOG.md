# Changelog - Simply QR

## Latest Changes

### 🌐 Public Access (No Login Required)

**Date:** October 24, 2024

#### What's New:

✅ **Anyone can create QR codes** - No account needed!
✅ **Beautiful homepage** - Create form right on the landing page
✅ **Optional accounts** - Sign up to save and manage QR codes
✅ **Clean URLs** - No more `#` in URLs (HTML5 History mode)
✅ **nginx support** - Proper configuration for production

#### Features:

**For Everyone (No Login):**
- Create custom QR codes instantly
- Customize colors and sizes
- Download QR code images
- QR codes work immediately but are NOT saved

**For Logged-In Users:**
- All public features PLUS:
- Save QR codes to your account
- View all your QR codes in dashboard
- Edit QR codes later
- Delete QR codes
- View scan analytics
- Track QR code performance

#### How It Works:

1. **Visit homepage** → See QR creation form
2. **Fill in details** → Name, URL, customize colors/size
3. **Click Generate** → Get QR code instantly
4. **Download** → Save the image

**Want to save it?**
- Click "Create an account"
- Login next time
- All your QR codes saved automatically!

#### Routes:

- `/` - Public QR creation (NEW!)
- `/login` - Login page (optional)
- `/register` - Sign up page (optional)
- `/dashboard` - Your saved QR codes (requires login)
- `/qrcodes/:id` - View/edit QR code (requires login)

#### API Changes:

- `POST /api/qrcodes` - Now public! No auth required
- Anonymous users get QR code data without database save
- Authenticated users get QR codes saved to their account
- All other endpoints still require authentication

#### Files Changed:

**Backend:**
- `backend/routes/qrcodes.js` - Public create endpoint
- Database migrations for tables

**Frontend:**
- `frontend/src/views/Home.vue` - NEW public homepage
- `frontend/src/router/index.js` - Updated routing
- `frontend/src/components/AppHeader.vue` - Guest/user navigation
- `frontend/src/App.vue` - Always show header

**Config:**
- `nginx.conf` - Full nginx configuration
- `nginx-snippet.conf` - Quick copy-paste config

#### Deployment Notes:

1. **Backend:** Redeploy to update API routes
2. **Frontend:** Rebuild and re-upload
3. **Nginx:** Add configuration snippet
4. **Database:** Tables already created

---

## Previous Changes

### Database Tables Created
- User table with authentication
- QRCode table with customization options
- Scan table for analytics tracking

### Backend Setup
- Node.js + Express API
- Prisma ORM with MySQL
- JWT authentication
- QR code generation with `qrcode` library
- Short URL redirects

### Frontend Setup
- Vue.js 3 with Composition API
- Pinia state management
- Vue Router with HTML5 History
- Axios for API calls
- Responsive design

### Deployment
- PM2 process management
- Apache .htaccess support
- nginx configuration
- PHP proxy for API routing
- xCloud compatibility
