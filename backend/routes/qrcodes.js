const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authenticateToken = require('../middleware/auth');
const QRGenerator = require('../services/qrGenerator');

const router = express.Router();
const prisma = new PrismaClient();

// Create new QR code (PUBLIC - no auth required)
router.post('/', async (req, res) => {
  try {
    const { name, url, backgroundColor, foregroundColor, size } = req.body;

    // Validation
    if (!name || !url) {
      return res.status(400).json({ error: 'Name and URL are required' });
    }

    // URL validation
    const urlRegex = /^https?:\/\/.+/;
    if (!urlRegex.test(url)) {
      return res.status(400).json({ error: 'Invalid URL format. Must start with http:// or https://' });
    }

    // Generate unique short code
    let shortCode;
    let isUnique = false;
    while (!isUnique) {
      shortCode = QRGenerator.generateShortCode();
      const existing = await prisma.qRCode.findUnique({
        where: { shortCode }
      });
      if (!existing) isUnique = true;
    }

    // Generate QR code image
    const qrCodeData = await QRGenerator.generateQRCode(url, {
      size: size || 300,
      backgroundColor: backgroundColor || '#ffffff',
      foregroundColor: foregroundColor || '#000000'
    });

    // Check if user is authenticated
    const token = req.headers['authorization']?.split(' ')[1];
    let qrCode;

    if (token) {
      // Authenticated user - save to database
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId }
        });

        if (user) {
          // Save to database
          qrCode = await prisma.qRCode.create({
            data: {
              userId: user.id,
              name,
              url,
              qrCodeData,
              shortCode,
              backgroundColor: backgroundColor || '#ffffff',
              foregroundColor: foregroundColor || '#000000',
              size: size || 300,
              isActive: true
            }
          });

          return res.status(201).json({
            message: 'QR code created and saved to your account',
            qrCode,
            saved: true
          });
        }
      } catch (err) {
        // Invalid token, treat as anonymous
        console.log('Invalid token, creating anonymous QR code');
      }
    }

    // Anonymous user - just return QR code data without saving
    res.status(201).json({
      message: 'QR code created successfully',
      qrCode: {
        name,
        url,
        qrCodeData,
        shortCode,
        backgroundColor: backgroundColor || '#ffffff',
        foregroundColor: foregroundColor || '#000000',
        size: size || 300
      },
      saved: false,
      notice: 'QR code not saved. Create an account to save and manage your QR codes.'
    });
  } catch (error) {
    console.error('Create QR code error:', error);
    res.status(500).json({ error: 'Failed to create QR code' });
  }
});

// All routes below require authentication
router.use(authenticateToken);

// Get all QR codes for current user
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      userId: req.user.id,
      ...(search && {
        OR: [
          { name: { contains: search } },
          { url: { contains: search } }
        ]
      })
    };

    const [qrCodes, total] = await Promise.all([
      prisma.qRCode.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { scans: true }
          }
        }
      }),
      prisma.qRCode.count({ where })
    ]);

    res.json({
      qrCodes,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get QR codes error:', error);
    res.status(500).json({ error: 'Failed to fetch QR codes' });
  }
});

// Get single QR code by ID
router.get('/:id', async (req, res) => {
  try {
    const qrCode = await prisma.qRCode.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      },
      include: {
        _count: {
          select: { scans: true }
        }
      }
    });

    if (!qrCode) {
      return res.status(404).json({ error: 'QR code not found' });
    }

    res.json({ qrCode });
  } catch (error) {
    console.error('Get QR code error:', error);
    res.status(500).json({ error: 'Failed to fetch QR code' });
  }
});

// Update QR code
router.put('/:id', async (req, res) => {
  try {
    const { name, url, backgroundColor, foregroundColor, size, isActive } = req.body;

    // Check ownership
    const existing = await prisma.qRCode.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!existing) {
      return res.status(404).json({ error: 'QR code not found' });
    }

    // Prepare update data
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (isActive !== undefined) updateData.isActive = isActive;

    // If URL or customization changed, regenerate QR code
    if (url || backgroundColor || foregroundColor || size) {
      const targetUrl = url || existing.url;
      const qrCodeData = await QRGenerator.generateQRCode(targetUrl, {
        size: size || existing.size,
        backgroundColor: backgroundColor || existing.backgroundColor,
        foregroundColor: foregroundColor || existing.foregroundColor
      });

      updateData.qrCodeData = qrCodeData;
      if (url) updateData.url = url;
      if (backgroundColor) updateData.backgroundColor = backgroundColor;
      if (foregroundColor) updateData.foregroundColor = foregroundColor;
      if (size) updateData.size = size;
    }

    const qrCode = await prisma.qRCode.update({
      where: { id: req.params.id },
      data: updateData
    });

    res.json({
      message: 'QR code updated successfully',
      qrCode
    });
  } catch (error) {
    console.error('Update QR code error:', error);
    res.status(500).json({ error: 'Failed to update QR code' });
  }
});

// Delete QR code
router.delete('/:id', async (req, res) => {
  try {
    // Check ownership
    const existing = await prisma.qRCode.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!existing) {
      return res.status(404).json({ error: 'QR code not found' });
    }

    await prisma.qRCode.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'QR code deleted successfully' });
  } catch (error) {
    console.error('Delete QR code error:', error);
    res.status(500).json({ error: 'Failed to delete QR code' });
  }
});

// Get QR code analytics
router.get('/:id/analytics', async (req, res) => {
  try {
    const { period = '30d' } = req.query;

    // Check ownership
    const qrCode = await prisma.qRCode.findFirst({
      where: {
        id: req.params.id,
        userId: req.user.id
      }
    });

    if (!qrCode) {
      return res.status(404).json({ error: 'QR code not found' });
    }

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Get scans within period
    const scans = await prisma.scan.findMany({
      where: {
        qrCodeId: req.params.id,
        scannedAt: { gte: startDate }
      },
      orderBy: { scannedAt: 'desc' }
    });

    // Aggregate analytics
    const totalScans = scans.length;
    const uniqueIPs = new Set(scans.map(s => s.ipAddress).filter(Boolean)).size;

    const scansByDate = scans.reduce((acc, scan) => {
      const date = scan.scannedAt.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    const scansByCountry = scans.reduce((acc, scan) => {
      if (scan.country) {
        acc[scan.country] = (acc[scan.country] || 0) + 1;
      }
      return acc;
    }, {});

    res.json({
      qrCode: {
        id: qrCode.id,
        name: qrCode.name,
        url: qrCode.url,
        shortCode: qrCode.shortCode
      },
      analytics: {
        totalScans,
        uniqueIPs,
        scansByDate,
        scansByCountry,
        recentScans: scans.slice(0, 10)
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

module.exports = router;
