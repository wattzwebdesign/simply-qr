const express = require('express');
const router = express.Router();
const qrController = require('../controllers/qrController');
const { authenticateToken } = require('../middleware/auth');

// Public route for fetching QR by short code (no auth required)
router.get('/by-code/:shortCode', qrController.getQRCodeByShortCode);

// All other routes require authentication
router.use(authenticateToken);

// QR code routes
router.get('/', qrController.getAllQRCodes);
router.get('/:id', qrController.getQRCode);
router.post('/', qrController.createQRCode);
router.put('/:id', qrController.updateQRCode);
router.delete('/:id', qrController.deleteQRCode);

// Preview route (doesn't save to database)
router.post('/preview', qrController.previewQRCode);

module.exports = router;
