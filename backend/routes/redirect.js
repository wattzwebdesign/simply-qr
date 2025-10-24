const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Redirect route for short codes
router.get('/:shortCode', async (req, res) => {
  try {
    const { shortCode } = req.params;

    // Find QR code by short code
    const qrCode = await prisma.qRCode.findUnique({
      where: { shortCode }
    });

    if (!qrCode) {
      return res.status(404).json({ error: 'QR code not found' });
    }

    if (!qrCode.isActive) {
      return res.status(410).json({ error: 'This QR code has been deactivated' });
    }

    // Track scan analytics
    const ipAddress = req.headers['x-forwarded-for']?.split(',')[0].trim() ||
                      req.connection.remoteAddress ||
                      req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const referer = req.headers['referer'] || req.headers['referrer'];

    // Create scan record (fire and forget - don't block redirect)
    prisma.scan.create({
      data: {
        qrCodeId: qrCode.id,
        ipAddress,
        userAgent,
        referer
      }
    }).catch(err => console.error('Failed to track scan:', err));

    // Update scan count (fire and forget)
    prisma.qRCode.update({
      where: { id: qrCode.id },
      data: {
        scanCount: { increment: 1 },
        lastScanned: new Date()
      }
    }).catch(err => console.error('Failed to update scan count:', err));

    // Redirect to target URL
    res.redirect(302, qrCode.url);
  } catch (error) {
    console.error('Redirect error:', error);
    res.status(500).json({ error: 'Redirect failed' });
  }
});

module.exports = router;
