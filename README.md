# QR Code Manager

A complete web-based QR code management system for personal use. Create, organize, customize, and manage all your QR codes in one beautiful interface.

## Features

### Phase 1 (MVP) - Currently Implemented

- **User Authentication**
  - Secure registration and login
  - JWT-based authentication
  - Password hashing with bcrypt

- **QR Code Management**
  - Create QR codes for multiple types: URL, Text, vCard, WiFi, Email, SMS, Phone
  - Edit existing QR codes
  - Delete QR codes
  - Live preview before saving

- **Organization**
  - Tag-based organization
  - Folder system
  - Favorites marking
  - Search functionality
  - Filter by type
  - Sort by date, name, or scan count

- **Customization**
  - Custom foreground and background colors
  - Adjustable size (100-1000px)
  - Error correction levels (L, M, Q, H)
  - Live preview of customizations

- **Dashboard**
  - Grid view of all QR codes
  - Real-time search and filtering
  - One-click download
  - Quick edit access
  - Visual organization with tags

## Tech Stack

### Backend
- Node.js with Express.js
- SQLite3 database
- JWT authentication
- bcrypt password hashing
- QRCode npm package for generation

### Frontend
- Pure HTML5, CSS3, JavaScript (no frameworks)
- Modern CSS Grid and Flexbox
- Fetch API for HTTP requests
- Lucide Icons
- Responsive design

### Design
- Custom "Emerald Professional" design system
- Modern, clean interface
- Smooth animations and transitions
- Mobile-responsive layout

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd simply-qr
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and update the values:
   ```env
   PORT=3000
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   SESSION_SECRET=your-session-secret-change-this-too
   DB_PATH=./database/qr_manager.db
   QR_CODES_DIR=./public/qr-codes
   APP_URL=http://localhost:3000
   ```

   **IMPORTANT:** Change the JWT_SECRET and SESSION_SECRET to random, secure values in production!

4. **Start the server**
   ```bash
   npm start
   ```

   For development with auto-reload:
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## First Time Use

1. **Register an account**
   - Open the application in your browser
   - Click "Sign Up"
   - Enter your email and password (minimum 8 characters)
   - Click "Create Account"

2. **Create your first QR code**
   - Click "Create QR Code" button
   - Fill in the form with your QR code details
   - Customize colors and size if desired
   - Click "Generate Preview" to see your QR code
   - Click "Create QR Code" to save

3. **Manage your QR codes**
   - View all QR codes in the dashboard
   - Use search and filters to find specific codes
   - Click download to save QR codes
   - Click edit to modify existing codes
   - Mark favorites with the star icon

## Project Structure

```
simply-qr/
├── server.js                 # Main Express application
├── package.json
├── .env.example             # Environment variables template
├── .gitignore
├── README.md
│
├── config/
│   └── database.js          # SQLite database setup
│
├── middleware/
│   └── auth.js              # JWT authentication middleware
│
├── routes/
│   ├── auth.js              # Authentication routes
│   └── qrcodes.js           # QR code CRUD routes
│
├── controllers/
│   ├── authController.js    # Authentication logic
│   └── qrController.js      # QR code business logic
│
├── utils/
│   ├── qrGenerator.js       # QR code generation utilities
│   └── validators.js        # Input validation functions
│
├── public/
│   ├── index.html           # Login/register page
│   ├── dashboard.html       # Main dashboard
│   ├── create.html          # Create/edit QR code page
│   ├── css/
│   │   └── style.css        # Emerald Professional design system
│   ├── js/
│   │   ├── auth.js          # Client-side auth handling
│   │   ├── dashboard.js     # Dashboard functionality
│   │   └── qr-create.js     # QR creation form logic
│   └── qr-codes/            # Generated QR code images
│
└── database/
    └── qr_manager.db        # SQLite database (created on first run)
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Verify JWT token
- `POST /api/auth/logout` - User logout

### QR Codes (All require authentication)
- `GET /api/qrcodes` - List all QR codes
- `GET /api/qrcodes/:id` - Get single QR code
- `POST /api/qrcodes` - Create new QR code
- `PUT /api/qrcodes/:id` - Update QR code
- `DELETE /api/qrcodes/:id` - Delete QR code
- `POST /api/qrcodes/preview` - Generate preview without saving

## QR Code Types

### URL
Create QR codes that link to websites or web pages.

### Text
Encode any plain text message.

### vCard (Contact)
Create digital business cards with name, phone, email, organization, website, and address.

### WiFi
Share WiFi network credentials. Supports WPA/WPA2, WEP, and open networks.

### Email
Generate QR codes that open an email client with pre-filled recipient, subject, and body.

### SMS
Create QR codes that send SMS messages to a phone number.

### Phone
Generate QR codes that dial a phone number when scanned.

## Customization Options

- **Colors**: Custom foreground and background colors (hex color picker)
- **Size**: Adjustable from 100px to 1000px
- **Error Correction**: Four levels (L, M, Q, H) - higher levels allow QR codes to work even when damaged

## Database Schema

The application uses SQLite3 with the following tables:
- `users` - User accounts
- `qr_codes` - QR code data and metadata
- `tags` - Tag management
- `scans` - Analytics tracking (for future features)

## Security Features

- Password hashing with bcrypt (10 salt rounds)
- JWT token-based authentication
- Input validation and sanitization
- Parameterized SQL queries (SQL injection prevention)
- XSS protection
- Secure session management

## Development

### Running in Development Mode
```bash
npm run dev
```

This uses nodemon to automatically restart the server when files change.

### Environment Variables
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `JWT_SECRET` - Secret key for JWT signing
- `SESSION_SECRET` - Secret for session management
- `DB_PATH` - Path to SQLite database file
- `QR_CODES_DIR` - Directory for QR code images
- `APP_URL` - Base URL for the application

## Future Enhancements (Phase 2+)

- Dynamic QR codes with editable redirect URLs
- Analytics dashboard with scan tracking
- Bulk operations (create, delete, export)
- CSV import/export
- QR code templates
- SVG export option
- Bulk QR code download as ZIP
- Advanced filtering and search
- Dark mode support

## Troubleshooting

### Database Issues
If you encounter database errors, try deleting the database file and restarting:
```bash
rm database/qr_manager.db
npm start
```

### Port Already in Use
If port 3000 is already in use, change the PORT in your `.env` file:
```env
PORT=3001
```

### QR Code Images Not Showing
Ensure the `public/qr-codes` directory exists and has write permissions:
```bash
mkdir -p public/qr-codes
chmod 755 public/qr-codes
```

## License

MIT License - Feel free to use this project for personal or commercial purposes.

## Contributing

This is a personal project, but suggestions and bug reports are welcome! Please open an issue on GitHub.

## Support

For issues, questions, or feature requests, please open an issue on the GitHub repository.

---

Built with Node.js, Express, and SQLite. Designed with the Emerald Professional design system.
