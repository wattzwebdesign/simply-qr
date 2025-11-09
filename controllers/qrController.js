const { getAsync, runAsync, allAsync } = require('../config/database');
const {
  generateQRCode,
  deleteQRCodeFile,
  generateShortCode,
  formatQRContent,
  generateQRCodeDataURL
} = require('../utils/qrGenerator');
const { isValidQRType, isValidErrorCorrection, isValidHexColor } = require('../utils/validators');

// Get all QR codes for a user with filtering
async function getAllQRCodes(req, res) {
  try {
    const userId = req.user.id;
    const { search, tags, folder, favorite, sort = 'created_at', order = 'DESC' } = req.query;

    let sql = 'SELECT * FROM qr_codes WHERE user_id = ?';
    const params = [userId];

    // Add filters
    if (search) {
      sql += ' AND (name LIKE ? OR content LIKE ? OR notes LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    if (folder) {
      sql += ' AND folder = ?';
      params.push(folder);
    }

    if (favorite === 'true') {
      sql += ' AND is_favorite = 1';
    }

    if (tags) {
      // Filter by tags (contains any of the specified tags)
      const tagList = tags.split(',').map(t => t.trim());
      const tagConditions = tagList.map(() => 'tags LIKE ?').join(' OR ');
      sql += ` AND (${tagConditions})`;
      tagList.forEach(tag => params.push(`%"${tag}"%`));
    }

    // Add sorting
    const validSortFields = ['name', 'created_at', 'updated_at', 'type', 'scan_count'];
    const validOrders = ['ASC', 'DESC'];
    const sortField = validSortFields.includes(sort) ? sort : 'created_at';
    const sortOrder = validOrders.includes(order.toUpperCase()) ? order.toUpperCase() : 'DESC';
    sql += ` ORDER BY ${sortField} ${sortOrder}`;

    const qrcodes = await allAsync(sql, params);

    // Parse JSON fields
    qrcodes.forEach(qr => {
      if (qr.tags) {
        try {
          qr.tags = JSON.parse(qr.tags);
        } catch (e) {
          qr.tags = [];
        }
      } else {
        qr.tags = [];
      }
    });

    res.json({
      success: true,
      qrcodes
    });

  } catch (error) {
    console.error('Get QR codes error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve QR codes',
      code: 'GET_QRCODES_ERROR'
    });
  }
}

// Get single QR code
async function getQRCode(req, res) {
  try {
    const userId = req.user.id;
    const qrId = req.params.id;

    const qrcode = await getAsync(
      'SELECT * FROM qr_codes WHERE id = ? AND user_id = ?',
      [qrId, userId]
    );

    if (!qrcode) {
      return res.status(404).json({
        success: false,
        error: 'QR code not found',
        code: 'NOT_FOUND'
      });
    }

    // Parse tags
    if (qrcode.tags) {
      try {
        qrcode.tags = JSON.parse(qrcode.tags);
      } catch (e) {
        qrcode.tags = [];
      }
    } else {
      qrcode.tags = [];
    }

    res.json({
      success: true,
      qrcode
    });

  } catch (error) {
    console.error('Get QR code error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve QR code',
      code: 'GET_QRCODE_ERROR'
    });
  }
}

// Create new QR code
async function createQRCode(req, res) {
  try {
    const userId = req.user.id;
    const {
      name,
      type,
      content,
      tags = [],
      folder,
      notes,
      color_dark = '#000000',
      color_light = '#ffffff',
      size = 300,
      error_correction = 'M',
      is_favorite = false
    } = req.body;

    // Only URL types are dynamic (others like SMS, Email, Phone, WiFi, vCard encode data directly)
    const is_dynamic = type === 'url';

    // Validate required fields
    if (!name || !type || !content) {
      return res.status(400).json({
        success: false,
        error: 'Name, type, and content are required',
        code: 'MISSING_FIELDS'
      });
    }

    // Validate QR type
    if (!isValidQRType(type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid QR code type',
        code: 'INVALID_TYPE'
      });
    }

    // Validate error correction
    if (!isValidErrorCorrection(error_correction)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid error correction level',
        code: 'INVALID_ERROR_CORRECTION'
      });
    }

    // Validate colors
    if (!isValidHexColor(color_dark) || !isValidHexColor(color_light)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid color format',
        code: 'INVALID_COLOR'
      });
    }

    // Format content based on type
    const formattedContent = formatQRContent(type, { content, ...req.body });

    // Always generate short code (all QRs are dynamic now)
    const shortCode = generateShortCode();
    const redirectUrl = formattedContent;

    // No file generation - QR codes are generated client-side on-demand
    const filePath = null;

    // Save to database
    const result = await runAsync(`
      INSERT INTO qr_codes (
        user_id, name, type, content,
        color_dark, color_light, size, error_correction,
        tags, folder, notes, is_favorite,
        is_dynamic, redirect_url, short_code,
        file_path
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      userId, name, type, formattedContent,
      color_dark, color_light, size, error_correction,
      JSON.stringify(tags), folder, notes, is_favorite ? 1 : 0,
      is_dynamic ? 1 : 0, redirectUrl, shortCode,
      filePath
    ]);

    // Get the created QR code
    const qrcode = await getAsync('SELECT * FROM qr_codes WHERE id = ?', [result.id]);

    // Parse tags
    if (qrcode.tags) {
      try {
        qrcode.tags = JSON.parse(qrcode.tags);
      } catch (e) {
        qrcode.tags = [];
      }
    }

    res.status(201).json({
      success: true,
      message: 'QR code created successfully',
      qrcode,
      file_url: filePath
    });

  } catch (error) {
    console.error('Create QR code error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create QR code',
      code: 'CREATE_QRCODE_ERROR'
    });
  }
}

// Update QR code
async function updateQRCode(req, res) {
  try {
    const userId = req.user.id;
    const qrId = req.params.id;
    const updates = req.body;

    // Check if QR code exists and belongs to user
    const existing = await getAsync(
      'SELECT * FROM qr_codes WHERE id = ? AND user_id = ?',
      [qrId, userId]
    );

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'QR code not found',
        code: 'NOT_FOUND'
      });
    }

    // Build update query dynamically
    const allowedFields = [
      'name', 'type', 'content', 'tags', 'folder', 'notes',
      'color_dark', 'color_light', 'size', 'error_correction',
      'is_favorite', 'redirect_url'
    ];

    const updateFields = [];
    const values = [];

    Object.keys(updates).forEach(key => {
      if (allowedFields.includes(key)) {
        updateFields.push(`${key} = ?`);

        // Handle tags as JSON
        if (key === 'tags') {
          values.push(JSON.stringify(updates[key]));
        } else if (key === 'is_favorite') {
          values.push(updates[key] ? 1 : 0);
        } else {
          values.push(updates[key]);
        }
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update',
        code: 'NO_UPDATES'
      });
    }

    // Add updated_at timestamp
    updateFields.push('updated_at = CURRENT_TIMESTAMP');

    // For dynamic QR codes, if content is updated, update redirect_url as well
    if (existing.is_dynamic && updates.content) {
      const newRedirectUrl = formatQRContent(
        existing.type,
        {
          content: updates.content,
          ...updates
        }
      );

      // Update redirect_url field (keep content update too!)
      if (!updateFields.includes('redirect_url = ?')) {
        updateFields.push('redirect_url = ?');
        values.push(newRedirectUrl);
      } else {
        // Replace the existing redirect_url value
        const redirectIndex = updateFields.indexOf('redirect_url = ?');
        values[redirectIndex] = newRedirectUrl;
      }
      // Note: We keep the content field update - both content and redirect_url get updated
    }

    // No QR code regeneration needed - QR codes are generated client-side on-demand
    // Visual changes (colors, size) are stored in the database and applied when rendering

    // Update database
    values.push(qrId, userId);
    await runAsync(
      `UPDATE qr_codes SET ${updateFields.join(', ')} WHERE id = ? AND user_id = ?`,
      values
    );

    // Get updated QR code
    const qrcode = await getAsync('SELECT * FROM qr_codes WHERE id = ?', [qrId]);

    // Parse tags
    if (qrcode.tags) {
      try {
        qrcode.tags = JSON.parse(qrcode.tags);
      } catch (e) {
        qrcode.tags = [];
      }
    }

    res.json({
      success: true,
      message: 'QR code updated successfully',
      qrcode
    });

  } catch (error) {
    console.error('Update QR code error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update QR code',
      code: 'UPDATE_QRCODE_ERROR'
    });
  }
}

// Delete QR code
async function deleteQRCode(req, res) {
  try {
    const userId = req.user.id;
    const qrId = req.params.id;

    // Get QR code to delete file
    const qrcode = await getAsync(
      'SELECT file_path FROM qr_codes WHERE id = ? AND user_id = ?',
      [qrId, userId]
    );

    if (!qrcode) {
      return res.status(404).json({
        success: false,
        error: 'QR code not found',
        code: 'NOT_FOUND'
      });
    }

    // Delete file
    if (qrcode.file_path) {
      await deleteQRCodeFile(qrcode.file_path);
    }

    // Delete from database
    await runAsync('DELETE FROM qr_codes WHERE id = ? AND user_id = ?', [qrId, userId]);

    res.json({
      success: true,
      message: 'QR code deleted successfully'
    });

  } catch (error) {
    console.error('Delete QR code error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete QR code',
      code: 'DELETE_QRCODE_ERROR'
    });
  }
}

// Preview QR code (generate without saving)
async function previewQRCode(req, res) {
  try {
    const {
      content,
      type = 'url',
      color_dark = '#000000',
      color_light = '#ffffff',
      size = 300,
      error_correction = 'M'
    } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        error: 'Content is required',
        code: 'MISSING_CONTENT'
      });
    }

    // Format content
    const formattedContent = formatQRContent(type, { content, ...req.body });

    // Generate preview as data URL
    const dataURL = await generateQRCodeDataURL({
      content: formattedContent,
      colorDark: color_dark,
      colorLight: color_light,
      size: parseInt(size),
      errorCorrectionLevel: error_correction
    });

    res.json({
      success: true,
      preview: dataURL
    });

  } catch (error) {
    console.error('Preview QR code error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate preview',
      code: 'PREVIEW_ERROR'
    });
  }
}

// Get QR code by short code (public, no auth)
async function getQRCodeByShortCode(req, res) {
  try {
    const { shortCode } = req.params;

    const qrcode = await getAsync(
      'SELECT * FROM qr_codes WHERE short_code = ?',
      [shortCode]
    );

    if (!qrcode) {
      return res.status(404).json({
        success: false,
        error: 'QR code not found',
        code: 'NOT_FOUND'
      });
    }

    // Parse tags
    if (qrcode.tags) {
      try {
        qrcode.tags = JSON.parse(qrcode.tags);
      } catch (e) {
        qrcode.tags = [];
      }
    } else {
      qrcode.tags = [];
    }

    res.json({
      success: true,
      qrcode
    });

  } catch (error) {
    console.error('Get QR code by short code error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve QR code',
      code: 'GET_QRCODE_ERROR'
    });
  }
}

// Get all unique folders for the user
async function getFolders(req, res) {
  try {
    const folders = await allAsync(
      `SELECT DISTINCT folder
       FROM qr_codes
       WHERE user_id = ? AND folder IS NOT NULL AND folder != ''
       ORDER BY folder ASC`,
      [req.user.id]
    );

    res.json({
      success: true,
      folders: folders.map(f => f.folder)
    });
  } catch (error) {
    console.error('Get folders error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve folders',
      code: 'GET_FOLDERS_ERROR'
    });
  }
}

module.exports = {
  getAllQRCodes,
  getQRCode,
  createQRCode,
  updateQRCode,
  deleteQRCode,
  previewQRCode,
  getQRCodeByShortCode,
  getFolders
};
