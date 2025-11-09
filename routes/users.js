const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const { authenticateToken } = require('../middleware/auth');

// All user routes require authentication
router.get('/profile', authenticateToken, usersController.getProfile);
router.put('/profile', authenticateToken, usersController.updateProfile);

module.exports = router;
