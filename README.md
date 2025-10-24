# Simply QR - QR Code Management System

A full-stack QR code creation and management system with analytics tracking.

## Features

- **User Authentication** - Secure login and registration with JWT tokens
- **QR Code Creation** - Generate custom QR codes with color and size options
- **QR Code Management** - Edit, delete, and activate/deactivate QR codes
- **Analytics Tracking** - Track scans, timestamps, IP addresses, and more
- **Redirect Service** - Short URLs that redirect to target destinations
- **Responsive UI** - Mobile-friendly Vue.js interface

## Tech Stack

### Backend
- **Node.js** + **Express.js** - REST API server
- **Prisma ORM** - Database abstraction and migrations
- **MySQL** - Database
- **bcrypt** - Password hashing
- **JWT** - Authentication tokens
- **qrcode** - QR code generation

### Frontend
- **Vue.js 3** - Frontend framework
- **Vue Router** - Client-side routing
- **Pinia** - State management
- **Vite** - Build tool
- **Axios** - HTTP client

### Deployment
- **PM2** - Process management
- **Apache/.htaccess** - Web server routing
- **PHP proxy** - Backend API routing

## Project Structure

```
simply-qr/
├── backend/                    # Node.js backend
│   ├── prisma/                # Database schema & migrations
│   ├── routes/                # API endpoints
│   ├── middleware/            # Auth middleware
│   ├── services/              # Business logic
│   ├── server.js              # Express app entry
│   └── package.json
│
├── frontend/                   # Vue.js frontend
│   ├── src/
│   │   ├── views/            # Page components
│   │   ├── components/       # Reusable components
│   │   ├── stores/           # Pinia stores
│   │   ├── services/         # API client
│   │   └── router/           # Vue Router config
│   ├── public/               # Static assets
│   └── package.json
│
├── .htaccess                   # Apache config
├── api.php                     # PHP proxy
├── ecosystem.config.js         # PM2 config
└── .xcloud-deploy.sh          # Deployment script
```

## Local Development Setup

### Prerequisites
- Node.js 18+
- MySQL database
- npm or yarn

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Update `.env` with your database credentials:
```
DATABASE_URL="mysql://user:password@localhost:3306/database"
JWT_SECRET="your-secret-key-here"
PORT=3000
NODE_ENV=development
```

5. Generate Prisma client:
```bash
npx prisma generate
```

6. Run database migrations:
```bash
npx prisma migrate dev
```

7. Start backend server:
```bash
npm run dev
```

Backend will run on http://localhost:3000

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Start development server:
```bash
npm run dev
```

Frontend will run on http://localhost:5173

## Database Schema

### User
- id (UUID)
- username (unique)
- email (unique)
- password (hashed)
- isAdmin (boolean)
- createdAt, updatedAt

### QRCode
- id (UUID)
- userId (foreign key)
- name
- url (target URL)
- qrCodeData (base64 image)
- shortCode (unique tracking code)
- backgroundColor, foregroundColor, size
- scanCount, lastScanned
- isActive
- createdAt, updatedAt

### Scan
- id (UUID)
- qrCodeId (foreign key)
- scannedAt
- ipAddress, userAgent, referer
- country, city

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile

### QR Codes (Authenticated)
- `POST /api/qrcodes` - Create QR code
- `GET /api/qrcodes` - List QR codes (with pagination & search)
- `GET /api/qrcodes/:id` - Get QR code details
- `PUT /api/qrcodes/:id` - Update QR code
- `DELETE /api/qrcodes/:id` - Delete QR code
- `GET /api/qrcodes/:id/analytics` - Get QR code analytics

### Redirect (Public)
- `GET /r/:shortCode` - Redirect to target URL & track scan

## Production Deployment (xCloud)

### Automatic Deployment

1. Ensure `.env` file exists in `backend/` directory with production credentials

2. Push code to Git repository

3. xCloud will automatically run `.xcloud-deploy.sh` which:
   - Installs dependencies
   - Generates Prisma client
   - Runs database migrations
   - Builds frontend
   - Copies built files to root
   - Starts backend with PM2

### Manual Deployment

1. SSH into your xCloud server

2. Navigate to project directory

3. Run deployment script:
```bash
bash .xcloud-deploy.sh
```

### PM2 Commands

Check backend status:
```bash
pm2 status
```

View logs:
```bash
pm2 logs simply-qr-backend
```

Restart backend:
```bash
pm2 restart simply-qr-backend
```

Monitor processes:
```bash
pm2 monit
```

## Environment Variables

### Backend (.env)

```env
DATABASE_URL="mysql://user:password@host:3306/database"
JWT_SECRET="your-secret-key"
PORT=3000
NODE_ENV=production
```

### Frontend (.env)

Development:
```env
VITE_API_BASE_URL=http://localhost:3000
```

Production (auto-detected):
```env
VITE_API_BASE_URL=https://yourdomain.com
```

## Security Features

- Password hashing with bcrypt (10 rounds)
- JWT-based authentication (7-day expiration)
- Protected API routes with middleware
- Input validation and sanitization
- CORS configuration
- Security headers (X-Content-Type-Options, X-Frame-Options, etc.)
- SQL injection protection via Prisma ORM

## License

ISC

## Support

For issues or questions, please create an issue in the repository.
