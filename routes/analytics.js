const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authenticateToken } = require('../middleware/auth');

// All analytics routes require authentication
router.use(authenticateToken);

// Analytics routes
router.get('/overview', analyticsController.getGlobalAnalytics);
router.get('/qr/:id', analyticsController.getQRAnalytics);
router.get('/qr/:id/scans', analyticsController.getQRScans);
router.get('/export', analyticsController.exportAnalytics);

module.exports = router;
