require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

// Import database (initializes on require)
require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const qrCodeRoutes = require('./routes/qrcodes');
const redirectRoutes = require('./routes/redirect');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/qrcodes', qrCodeRoutes);

// Public redirect routes (for dynamic QR codes)
app.use('/r', redirectRoutes);

// Root route - serve home/landing page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Login/Register route
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Dashboard route
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Create QR code route
app.get('/create', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'create.html'));
});

// Edit QR code route
app.get('/edit/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'create.html'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    code: 'NOT_FOUND'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    code: 'SERVER_ERROR'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════╗
║     QR Code Manager Server Running        ║
╠═══════════════════════════════════════════╣
║  Port: ${PORT.toString().padEnd(36)} ║
║  URL:  http://localhost:${PORT.toString().padEnd(23)} ║
║  Environment: ${(process.env.NODE_ENV || 'development').padEnd(27)} ║
╚═══════════════════════════════════════════╝

Server started successfully!
Visit http://localhost:${PORT} to get started.
  `);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down gracefully...');
  process.exit(0);
});
