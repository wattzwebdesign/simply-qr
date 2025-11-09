# QR Code Manager - Project Specification

## Project Overview
Build a complete web-based QR code management system for personal use. The application should allow a single user to create, store, organize, edit, and download QR codes with advanced features like tagging, search, and customization.

---

## Tech Stack

### Backend
- **Node.js** with **Express.js** framework
- **SQLite3** for database (simple, file-based, perfect for personal use)
- **bcrypt** for password hashing
- **jsonwebtoken (JWT)** for authentication
- **express-session** for session management
- **qrcode** npm package for QR code generation
- **body-parser** for parsing request bodies
- **multer** (optional) for logo upload

### Frontend
- Pure HTML5, CSS3, JavaScript (no framework needed)
- Modern CSS (Flexbox/Grid)
- Fetch API for HTTP requests
- Responsive design for mobile/desktop

### File Storage
- Local filesystem for QR code images
- Store in `./public/qr-codes/` directory

---

## Database Schema

### users table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### qr_codes table
```sql
CREATE TABLE qr_codes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'url', 'text', 'vcard', 'wifi', 'email', 'sms', 'phone'
  content TEXT NOT NULL, -- the actual data to encode
  
  -- Customization options (store as JSON string)
  color_dark TEXT DEFAULT '#000000',
  color_light TEXT DEFAULT '#ffffff',
  size INTEGER DEFAULT 300,
  error_correction TEXT DEFAULT 'M', -- L, M, Q, H
  
  -- Organization
  tags TEXT, -- JSON array: ["company1", "project2"]
  folder TEXT,
  notes TEXT,
  is_favorite INTEGER DEFAULT 0,
  
  -- Dynamic QR features
  is_dynamic INTEGER DEFAULT 0,
  redirect_url TEXT, -- actual URL to redirect to (if dynamic)
  short_code TEXT UNIQUE, -- short code for dynamic URLs
  
  -- Analytics
  scan_count INTEGER DEFAULT 0,
  last_scanned_at DATETIME,
  
  -- File info
  file_path TEXT, -- relative path to saved PNG/SVG file
  
  -- Timestamps
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME,
  
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### tags table (for autocomplete and tag management)
```sql
CREATE TABLE tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#3b82f6',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, name),
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### scans table (for analytics tracking - optional MVP feature)
```sql
CREATE TABLE scans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  qr_code_id INTEGER NOT NULL,
  scanned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  ip_address TEXT,
  user_agent TEXT,
  FOREIGN KEY (qr_code_id) REFERENCES qr_codes(id)
);
```

---

## Project File Structure

```
qr-code-manager/
├── server.js                 # Main Express application
├── package.json             
├── .env.example             # Environment variables template
├── .gitignore
├── README.md                # Setup and usage instructions
│
├── config/
│   └── database.js          # SQLite database setup and initialization
│
├── middleware/
│   └── auth.js              # JWT authentication middleware
│
├── routes/
│   ├── auth.js              # Login, register, logout routes
│   ├── qrcodes.js           # CRUD operations for QR codes
│   ├── tags.js              # Tag management routes
│   └── redirect.js          # Dynamic QR code redirect handler
│
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── qrController.js      # QR code business logic
│   └── tagController.js     # Tag management logic
│
├── utils/
│   ├── qrGenerator.js       # QR code generation utilities
│   └── validators.js        # Input validation functions
│
├── public/
│   ├── index.html           # Login/landing page
│   ├── dashboard.html       # Main QR code dashboard
│   ├── create.html          # Create/edit QR code form
│   ├── css/
│   │   └── style.css        # Main stylesheet
│   ├── js/
│   │   ├── auth.js          # Client-side auth handling
│   │   ├── dashboard.js     # Dashboard functionality
│   │   └── qr-create.js     # QR creation form logic
│   └── qr-codes/            # Generated QR code images stored here
│
└── database/
    └── qr_manager.db        # SQLite database file (created on first run)
```

---

## Core Features & API Endpoints

### Authentication Routes (`/api/auth`)
- **POST** `/api/auth/register` - Create new user account
  - Body: `{ email, password }`
  - Response: `{ success, message, token }`
  
- **POST** `/api/auth/login` - User login
  - Body: `{ email, password }`
  - Response: `{ success, token, user: { id, email } }`
  
- **POST** `/api/auth/logout` - User logout
  - Response: `{ success, message }`
  
- **GET** `/api/auth/verify` - Verify JWT token
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ valid, user }`

### QR Code Routes (`/api/qrcodes`)
All routes require authentication (JWT token in Authorization header)

- **GET** `/api/qrcodes` - List all QR codes for user
  - Query params: `?search=text&tags=tag1,tag2&folder=name&favorite=true&sort=created_at&order=desc`
  - Response: `{ success, qrcodes: [...] }`
  
- **GET** `/api/qrcodes/:id` - Get single QR code details
  - Response: `{ success, qrcode: {...} }`
  
- **POST** `/api/qrcodes` - Create new QR code
  - Body: 
    ```json
    {
      "name": "My Website",
      "type": "url",
      "content": "https://example.com",
      "tags": ["company", "marketing"],
      "folder": "Client Work",
      "notes": "Main landing page",
      "color_dark": "#000000",
      "color_light": "#ffffff",
      "size": 300,
      "error_correction": "M",
      "is_dynamic": false,
      "is_favorite": false
    }
    ```
  - Response: `{ success, qrcode: {...}, file_url }`
  
- **PUT** `/api/qrcodes/:id` - Update existing QR code
  - Body: Same as POST (all fields optional)
  - Response: `{ success, qrcode: {...} }`
  
- **DELETE** `/api/qrcodes/:id` - Delete QR code
  - Response: `{ success, message }`
  
- **POST** `/api/qrcodes/bulk-delete` - Delete multiple QR codes
  - Body: `{ ids: [1, 2, 3] }`
  - Response: `{ success, deleted_count }`
  
- **GET** `/api/qrcodes/:id/download` - Download QR code file
  - Query: `?format=png` (png or svg)
  - Response: File download
  
- **POST** `/api/qrcodes/bulk-export` - Export multiple QR codes as ZIP
  - Body: `{ ids: [1, 2, 3], format: "png" }`
  - Response: ZIP file download

### Tag Routes (`/api/tags`)
- **GET** `/api/tags` - Get all user's tags
  - Response: `{ success, tags: [...] }`
  
- **POST** `/api/tags` - Create new tag
  - Body: `{ name, color }`
  - Response: `{ success, tag: {...} }`
  
- **PUT** `/api/tags/:id` - Update tag
  - Body: `{ name, color }`
  - Response: `{ success, tag: {...} }`
  
- **DELETE** `/api/tags/:id` - Delete tag
  - Response: `{ success, message }`

### Dynamic QR Code Routes (`/r`)
- **GET** `/r/:shortCode` - Redirect to actual URL and track scan
  - Tracks scan in database
  - Redirects to `redirect_url`

---

## QR Code Types Supported

### 1. URL
```javascript
{
  "type": "url",
  "content": "https://example.com"
}
```

### 2. Plain Text
```javascript
{
  "type": "text",
  "content": "Any plain text message"
}
```

### 3. vCard (Contact)
```javascript
{
  "type": "vcard",
  "content": "BEGIN:VCARD\nVERSION:3.0\nFN:John Doe\nTEL:+1234567890\nEMAIL:john@example.com\nEND:VCARD"
}
```

### 4. WiFi
```javascript
{
  "type": "wifi",
  "content": "WIFI:T:WPA;S:NetworkName;P:Password;;"
}
```

### 5. Email
```javascript
{
  "type": "email",
  "content": "mailto:example@example.com?subject=Hello&body=Message"
}
```

### 6. SMS
```javascript
{
  "type": "sms",
  "content": "smsto:+1234567890:Hello there"
}
```

### 7. Phone
```javascript
{
  "type": "phone",
  "content": "tel:+1234567890"
}
```

---

## Frontend Pages

### 1. Login/Register Page (`index.html`)
- Clean login form
- Register new user option
- Client-side validation
- Store JWT token in localStorage
- Redirect to dashboard on success

### 2. Dashboard (`dashboard.html`)
**Layout:**
- Top navigation bar with logout button
- Sidebar with filters:
  - Search box
  - Tag filter (checkboxes)
  - Folder filter (dropdown)
  - Favorites toggle
  - Sort options
- Main content area:
  - Grid/list view of QR codes
  - Each card shows:
    - QR code preview image
    - Name
    - Type badge
    - Tags
    - Created date
    - Favorite star
    - Actions: Edit, Download, Delete
  - Bulk select mode with checkbox selection
  - Bulk actions bar (delete, export)
  
**Features:**
- Real-time search (filter as you type)
- Tag filtering (AND/OR logic)
- Sort by: Name, Date Created, Last Modified, Type
- Grid/List view toggle
- Pagination (show 20 per page)

### 3. Create/Edit Page (`create.html`)
**Form Fields:**
- QR Code Name (text input)
- Type (dropdown: URL, Text, vCard, WiFi, Email, SMS, Phone)
- Content (dynamic form based on type)
  - For URL: Simple text input
  - For vCard: Multiple fields (name, phone, email, etc.)
  - For WiFi: Network name, password, security type
- Tags (multi-select with autocomplete)
- Folder (text input with autocomplete)
- Notes (textarea)
- Favorite (checkbox)
- Dynamic QR code (checkbox)

**Customization Section:**
- Color picker for dark color
- Color picker for light color
- Size slider (100-1000px)
- Error correction level (dropdown: L, M, Q, H)
- Live preview of QR code

**Actions:**
- Save button
- Save & Download button
- Cancel button

---

## Advanced Features (Phase 2 - Optional)

### Dynamic QR Codes
- When creating a dynamic QR code:
  - Generate a short code (e.g., `abc123`)
  - QR code contains: `https://yourdomain.com/r/abc123`
  - Store actual destination in `redirect_url`
  - Can change `redirect_url` without regenerating QR code
  - Track scans in `scans` table

### Analytics Dashboard
- View scan statistics per QR code
- Chart showing scans over time
- Top performing QR codes
- Device/browser breakdown (from user agent)

### Bulk Operations
- CSV import for bulk QR code creation
- Bulk tag assignment
- Bulk folder move
- Export filtered results

### Templates
- Save customization presets
- Quick create from template
- Company branding templates

---

## Environment Variables (.env)

```env
# Server
PORT=3000
NODE_ENV=development

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Session Secret
SESSION_SECRET=your-session-secret-change-this-too

# Database
DB_PATH=./database/qr_manager.db

# File Storage
QR_CODES_DIR=./public/qr-codes

# Application URL (for dynamic QR codes)
APP_URL=http://localhost:3000
```

---

## Security Requirements

1. **Password Security**
   - Hash all passwords with bcrypt (salt rounds: 10)
   - Minimum password length: 8 characters

2. **JWT Authentication**
   - Sign tokens with strong secret
   - Set expiration (e.g., 7 days)
   - Validate on all protected routes

3. **Input Validation**
   - Sanitize all user inputs
   - Validate email format
   - Validate URLs
   - Prevent SQL injection (use parameterized queries)
   - Prevent XSS (escape outputs)

4. **Rate Limiting** (optional)
   - Limit login attempts
   - Limit API requests per user

5. **File Security**
   - Validate file uploads
   - Store files outside public directory if containing sensitive data
   - Generate unique filenames to prevent conflicts

---

## Error Handling

### Backend
- Use try-catch blocks in all async functions
- Return consistent error responses:
  ```json
  {
    "success": false,
    "error": "User-friendly error message",
    "code": "ERROR_CODE"
  }
  ```
- Log errors to console (or file in production)
- Handle database errors gracefully

### Frontend
- Display user-friendly error messages
- Show loading states during API calls
- Handle network errors
- Validate forms before submission

---

## Styling Guidelines

### Color Scheme - "Emerald Professional"

```css
:root {
  /* Primary Colors */
  --primary-emerald: #10b981;
  --primary-emerald-dark: #059669;
  --primary-emerald-light: #34d399;
  
  /* Accent Colors */
  --accent-amber: #f59e0b;
  --accent-rose: #fb7185;
  
  /* Neutral Colors - Light Mode */
  --bg-primary: #ffffff;
  --bg-secondary: #f9fafb;
  --bg-tertiary: #f3f4f6;
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --text-tertiary: #9ca3af;
  --border-color: #e5e7eb;
  
  /* Neutral Colors - Dark Mode (optional) */
  --dark-bg-primary: #0f172a;
  --dark-bg-secondary: #1e293b;
  --dark-bg-tertiary: #334155;
  --dark-text-primary: #f1f5f9;
  --dark-text-secondary: #cbd5e1;
  --dark-text-tertiary: #94a3b8;
  --dark-border-color: #334155;
  
  /* Semantic Colors */
  --success: #10b981;
  --warning: #f59e0b;
  --error: #ef4444;
  --info: #3b82f6;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  
  /* Border Radius */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-full: 9999px;
  
  /* Spacing Scale */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
  --space-2xl: 3rem;
  
  /* Transitions */
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-base: 200ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Typography

**Fonts:**
- **Headings:** 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
- **Body:** 'Inter', system-ui, sans-serif
- **Mono:** 'JetBrains Mono', 'Fira Code', 'Consolas', monospace

**Import in HTML:**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

**Type Scale:**
```css
/* Font Sizes */
--text-xs: 0.75rem;      /* 12px */
--text-sm: 0.875rem;     /* 14px */
--text-base: 1rem;       /* 16px */
--text-lg: 1.125rem;     /* 18px */
--text-xl: 1.25rem;      /* 20px */
--text-2xl: 1.5rem;      /* 24px */
--text-3xl: 1.875rem;    /* 30px */
--text-4xl: 2.25rem;     /* 36px */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;

/* Line Heights */
--leading-tight: 1.25;
--leading-normal: 1.5;
--leading-relaxed: 1.75;
```

### Modern CSS Techniques to Use

1. **CSS Grid for Layouts**
```css
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-lg);
  padding: var(--space-xl);
}
```

2. **Backdrop Filters for Modern Glass Effect**
```css
.glass-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}
```

3. **CSS Custom Properties for Theming**
```css
[data-theme="dark"] {
  --bg-primary: var(--dark-bg-primary);
  --text-primary: var(--dark-text-primary);
  /* etc. */
}
```

4. **Smooth Animations**
```css
.card {
  transition: transform var(--transition-base), 
              box-shadow var(--transition-base);
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl);
}
```

5. **Custom Scrollbars**
```css
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--bg-tertiary);
}

::-webkit-scrollbar-thumb {
  background: var(--text-tertiary);
  border-radius: var(--radius-full);
}

::-webkit-scrollbar-thumb:hover {
  background: var(--text-secondary);
}
```

### Component Styling Patterns

**Buttons:**
```css
.btn {
  padding: 0.625rem 1.25rem;
  font-weight: var(--font-medium);
  border-radius: var(--radius-md);
  transition: all var(--transition-base);
  border: none;
  cursor: pointer;
  font-size: var(--text-sm);
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary-emerald) 0%, var(--primary-emerald-dark) 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.btn-primary:hover {
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4);
  transform: translateY(-2px);
}

.btn-primary:active {
  transform: translateY(0);
}
```

**Cards:**
```css
.qr-card {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  padding: var(--space-lg);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-base);
  position: relative;
  overflow: hidden;
}

.qr-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, var(--primary-emerald), var(--accent-amber));
  opacity: 0;
  transition: opacity var(--transition-base);
}

.qr-card:hover::before {
  opacity: 1;
}

.qr-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
  border-color: var(--primary-emerald-light);
}
```

**Input Fields:**
```css
.input-field {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  font-size: var(--text-base);
  transition: all var(--transition-fast);
  background: var(--bg-primary);
  color: var(--text-primary);
}

.input-field:focus {
  outline: none;
  border-color: var(--primary-emerald);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.input-field::placeholder {
  color: var(--text-tertiary);
}
```

**Tags:**
```css
.tag {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.75rem;
  background: rgba(16, 185, 129, 0.1);
  color: var(--primary-emerald-dark);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  border: 1px solid rgba(16, 185, 129, 0.2);
  transition: all var(--transition-fast);
}

.tag:hover {
  background: rgba(16, 185, 129, 0.15);
  border-color: var(--primary-emerald);
}
```

### Layout Patterns

**Dashboard Header:**
```css
.dashboard-header {
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-color);
  padding: var(--space-lg) var(--space-xl);
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(8px);
  background: rgba(255, 255, 255, 0.95);
}
```

**Sidebar:**
```css
.sidebar {
  width: 280px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  padding: var(--space-xl);
  height: 100vh;
  position: sticky;
  top: 0;
  overflow-y: auto;
}
```

**Main Content Area:**
```css
.main-content {
  flex: 1;
  padding: var(--space-xl);
  max-width: 1400px;
  margin: 0 auto;
}
```

### Micro-interactions

**Loading States:**
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.loading {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

**Success Animations:**
```css
@keyframes slideInUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.toast-notification {
  animation: slideInUp var(--transition-base);
}
```

**Skeleton Loaders:**
```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--bg-tertiary) 25%,
    var(--bg-secondary) 50%,
    var(--bg-tertiary) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
  border-radius: var(--radius-md);
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### Responsive Design

```css
/* Mobile First Approach */

/* Small devices (phones, 640px and up) */
@media (min-width: 640px) {
  .dashboard-grid {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  }
}

/* Medium devices (tablets, 768px and up) */
@media (min-width: 768px) {
  .sidebar {
    display: block;
  }
}

/* Large devices (desktops, 1024px and up) */
@media (min-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}

/* Extra large devices (large desktops, 1280px and up) */
@media (min-width: 1280px) {
  .main-content {
    padding: var(--space-2xl);
  }
}
```

### Dark Mode Toggle

```javascript
// Simple dark mode toggle
function toggleTheme() {
  const html = document.documentElement;
  const currentTheme = html.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
}

// Load saved theme
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
```

### Design Principles

1. **Subtle, Not Flashy** - Use animations sparingly, focus on smooth transitions
2. **Consistent Spacing** - Use the spacing scale for all margins/padding
3. **Hierarchy Through Typography** - Use font size and weight for hierarchy, not excessive colors
4. **Generous White Space** - Don't cram elements together
5. **Focus States** - Always show clear focus states for accessibility
6. **Progressive Enhancement** - Works without JavaScript, better with it
7. **Natural Interactions** - Hover states should feel responsive but not jarring

### Icons

Use **Lucide Icons** (cleaner than Font Awesome, doesn't scream "template"):
```html
<!-- In HTML head -->
<script src="https://unpkg.com/lucide@latest"></script>
<script>
  lucide.createIcons();
</script>

<!-- Usage -->
<i data-lucide="qr-code"></i>
<i data-lucide="tag"></i>
<i data-lucide="download"></i>
```

Or use inline SVG for more control and customization.

---

## Testing & Validation

### Manual Testing Checklist
- [ ] User can register and login
- [ ] User can create QR codes of all types
- [ ] QR codes are saved to database
- [ ] QR code images are generated and saved
- [ ] User can view all their QR codes
- [ ] Search filters QR codes correctly
- [ ] Tag filtering works
- [ ] User can edit QR codes
- [ ] User can delete QR codes
- [ ] User can download QR codes
- [ ] Logout clears session
- [ ] Protected routes reject unauthenticated requests

---

## Setup Instructions to Include in README

```markdown
# QR Code Manager

## Installation

1. Clone the repository
2. Run `npm install`
3. Copy `.env.example` to `.env` and update values
4. Run `node server.js` to start the server
5. Open browser to `http://localhost:3000`

## First Run

1. Register a new account on the home page
2. Login with your credentials
3. Start creating QR codes!

## Features

- Create multiple types of QR codes (URL, Text, vCard, WiFi, etc.)
- Organize with tags and folders
- Customize colors and size
- Search and filter
- Download as PNG or SVG
- Track favorites
- Dynamic QR codes with redirects

## Tech Stack

Node.js, Express, SQLite, QRCode, JWT Authentication
```

---

## MVP Priority Features (Build These First)

### Phase 1 - Core Functionality
1. ✅ Database setup with users and qr_codes tables
2. ✅ User registration and login
3. ✅ JWT authentication middleware
4. ✅ Create QR code (URL type only)
5. ✅ List all QR codes
6. ✅ View single QR code
7. ✅ Delete QR code
8. ✅ Download QR code as PNG
9. ✅ Basic dashboard UI
10. ✅ Basic create form

### Phase 2 - Organization
1. ✅ Tag system (add, filter by tags)
2. ✅ Search functionality
3. ✅ Edit QR codes
4. ✅ Favorites
5. ✅ Folder organization

### Phase 3 - Enhancement
1. ✅ Multiple QR code types (text, vcard, wifi, etc.)
2. ✅ Color customization
3. ✅ Size customization
4. ✅ SVG export option
5. ✅ Better UI/UX with styling

### Phase 4 - Advanced (Optional)
1. Dynamic QR codes
2. Analytics tracking
3. Bulk operations
4. CSV import/export
5. Templates

---

## Code Quality Requirements

1. **Comments:** Add clear comments explaining complex logic
2. **Error Messages:** User-friendly, descriptive
3. **Console Logs:** Helpful for debugging during development
4. **Code Style:** Consistent indentation and naming
5. **Functions:** Keep functions focused and reusable
6. **Validation:** Validate all inputs on both client and server
7. **Security:** Follow all security requirements above

---

## Final Notes

- This is a personal use application (single user is fine)
- Focus on functionality over fancy UI initially
- Can expand features iteratively
- Database is SQLite for simplicity (easy to backup, portable)
- All QR code images stored locally in filesystem
- JWT tokens stored in localStorage on client
- Build it progressively: Auth → Basic CRUD → Tags → Customization → Advanced Features

---

## Deliverables

Please create:
1. Complete project structure with all files
2. Working authentication system
3. Full CRUD API for QR codes
4. Functional dashboard UI
5. QR code creation form with preview
6. README with setup instructions
7. .env.example file
8. .gitignore file
9. Comments in code for clarity
10. Error handling throughout

Start with Phase 1 MVP, then we can iterate and add more features!
