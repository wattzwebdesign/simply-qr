const express = require('express');
const router = express.Router();
const redirectController = require('../controllers/redirectController');

// Public redirect route (no authentication required)
router.get('/:shortCode', redirectController.handleRedirect);

module.exports = router;
