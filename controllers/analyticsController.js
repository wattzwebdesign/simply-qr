const { getAsync, allAsync } = require('../config/database');

// Get global analytics overview
async function getGlobalAnalytics(req, res) {
  try {
    const userId = req.user.id;

    // Get total scans across all QR codes
    const totalScans = await getAsync(
      'SELECT SUM(scan_count) as total FROM qr_codes WHERE user_id = ?',
      [userId]
    );

    // Get active QR codes count
    const activeQRs = await getAsync(
      'SELECT COUNT(*) as count FROM qr_codes WHERE user_id = ?',
      [userId]
    );

    // Get scans this month
    const scansThisMonth = await getAsync(
      `SELECT COUNT(*) as count FROM scans s
       INNER JOIN qr_codes q ON s.qr_code_id = q.id
       WHERE q.user_id = ?
       AND s.scanned_at >= DATE_FORMAT(NOW(), '%Y-%m-01')`,
      [userId]
    );

    // Get scans over time (last 30 days, grouped by day)
    const scansOverTime = await allAsync(
      `SELECT DATE(s.scanned_at) as date, COUNT(*) as count
       FROM scans s
       INNER JOIN qr_codes q ON s.qr_code_id = q.id
       WHERE q.user_id = ?
       AND s.scanned_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       GROUP BY DATE(s.scanned_at)
       ORDER BY date ASC`,
      [userId]
    );

    // Get top performing QR codes
    const topQRCodes = await allAsync(
      `SELECT id, name, type, scan_count, short_code
       FROM qr_codes
       WHERE user_id = ?
       ORDER BY scan_count DESC
       LIMIT 10`,
      [userId]
    );

    // Get device breakdown
    const deviceBreakdown = await allAsync(
      `SELECT s.device_type, COUNT(*) as count
       FROM scans s
       INNER JOIN qr_codes q ON s.qr_code_id = q.id
       WHERE q.user_id = ? AND s.device_type IS NOT NULL
       GROUP BY s.device_type`,
      [userId]
    );

    // Get browser breakdown
    const browserBreakdown = await allAsync(
      `SELECT s.browser, COUNT(*) as count
       FROM scans s
       INNER JOIN qr_codes q ON s.qr_code_id = q.id
       WHERE q.user_id = ? AND s.browser IS NOT NULL
       GROUP BY s.browser
       ORDER BY count DESC
       LIMIT 10`,
      [userId]
    );

    // Get OS breakdown
    const osBreakdown = await allAsync(
      `SELECT s.os, COUNT(*) as count
       FROM scans s
       INNER JOIN qr_codes q ON s.qr_code_id = q.id
       WHERE q.user_id = ? AND s.os IS NOT NULL
       GROUP BY s.os
       ORDER BY count DESC
       LIMIT 10`,
      [userId]
    );

    // Get country breakdown
    const countryBreakdown = await allAsync(
      `SELECT s.country_code, s.country_name, COUNT(*) as count
       FROM scans s
       INNER JOIN qr_codes q ON s.qr_code_id = q.id
       WHERE q.user_id = ? AND s.country_code IS NOT NULL
       GROUP BY s.country_code, s.country_name
       ORDER BY count DESC
       LIMIT 10`,
      [userId]
    );

    res.json({
      success: true,
      analytics: {
        totalScans: totalScans.total || 0,
        activeQRCodes: activeQRs.count || 0,
        scansThisMonth: scansThisMonth.count || 0,
        scansOverTime,
        topQRCodes,
        deviceBreakdown,
        browserBreakdown,
        osBreakdown,
        countryBreakdown
      }
    });
  } catch (error) {
    console.error('Get global analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve analytics',
      code: 'ANALYTICS_ERROR'
    });
  }
}

// Get analytics for a specific QR code
async function getQRAnalytics(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify QR code belongs to user
    const qrcode = await getAsync(
      'SELECT * FROM qr_codes WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (!qrcode) {
      return res.status(404).json({
        success: false,
        error: 'QR code not found',
        code: 'NOT_FOUND'
      });
    }

    // Get total scans
    const totalScans = qrcode.scan_count || 0;

    // Get unique IPs
    const uniqueIPs = await getAsync(
      'SELECT COUNT(DISTINCT ip_address) as count FROM scans WHERE qr_code_id = ?',
      [id]
    );

    // Get scans over time (last 30 days by default)
    const scansOverTime = await allAsync(
      `SELECT DATE(scanned_at) as date, COUNT(*) as count
       FROM scans
       WHERE qr_code_id = ?
       AND scanned_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       GROUP BY DATE(scanned_at)
       ORDER BY date ASC`,
      [id]
    );

    // Get device breakdown
    const deviceBreakdown = await allAsync(
      `SELECT device_type, COUNT(*) as count
       FROM scans
       WHERE qr_code_id = ? AND device_type IS NOT NULL
       GROUP BY device_type`,
      [id]
    );

    // Get browser breakdown
    const browserBreakdown = await allAsync(
      `SELECT browser, COUNT(*) as count
       FROM scans
       WHERE qr_code_id = ? AND browser IS NOT NULL
       GROUP BY browser
       ORDER BY count DESC`,
      [id]
    );

    // Get OS breakdown
    const osBreakdown = await allAsync(
      `SELECT os, COUNT(*) as count
       FROM scans
       WHERE qr_code_id = ? AND os IS NOT NULL
       GROUP BY os
       ORDER BY count DESC`,
      [id]
    );

    // Get country breakdown
    const countryBreakdown = await allAsync(
      `SELECT country_code, country_name, city, COUNT(*) as count
       FROM scans
       WHERE qr_code_id = ? AND country_code IS NOT NULL
       GROUP BY country_code, country_name, city
       ORDER BY count DESC`,
      [id]
    );

    // Get recent scans (last 20)
    const recentScans = await allAsync(
      `SELECT id, scanned_at, ip_address, device_type, browser, os, city, country_name
       FROM scans
       WHERE qr_code_id = ?
       ORDER BY scanned_at DESC
       LIMIT 20`,
      [id]
    );

    res.json({
      success: true,
      qrcode: {
        id: qrcode.id,
        name: qrcode.name,
        type: qrcode.type,
        content: qrcode.content,
        short_code: qrcode.short_code,
        last_scanned_at: qrcode.last_scanned_at,
        color: qrcode.color,
        bg_color: qrcode.bg_color
      },
      analytics: {
        totalScans,
        uniqueIPs: uniqueIPs.count || 0,
        scansOverTime,
        deviceBreakdown,
        browserBreakdown,
        osBreakdown,
        countryBreakdown,
        recentScans
      }
    });
  } catch (error) {
    console.error('Get QR analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve QR analytics',
      code: 'ANALYTICS_ERROR'
    });
  }
}

// Get paginated scans for a QR code with date filtering
async function getQRScans(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { startDate, endDate, limit = 50, offset = 0 } = req.query;

    // Verify QR code belongs to user
    const qrcode = await getAsync(
      'SELECT id FROM qr_codes WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (!qrcode) {
      return res.status(404).json({
        success: false,
        error: 'QR code not found',
        code: 'NOT_FOUND'
      });
    }

    // Build query with optional date filtering
    let query = `
      SELECT id, scanned_at, ip_address, user_agent, device_type, browser, os,
             country_code, country_name, city, latitude, longitude
      FROM scans
      WHERE qr_code_id = ?
    `;
    const params = [id];

    if (startDate) {
      query += ` AND scanned_at >= ?`;
      params.push(startDate);
    }

    if (endDate) {
      query += ` AND scanned_at <= ?`;
      params.push(endDate);
    }

    query += ` ORDER BY scanned_at DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    const scans = await allAsync(query, params);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM scans WHERE qr_code_id = ?';
    const countParams = [id];

    if (startDate) {
      countQuery += ` AND scanned_at >= ?`;
      countParams.push(startDate);
    }

    if (endDate) {
      countQuery += ` AND scanned_at <= ?`;
      countParams.push(endDate);
    }

    const totalCount = await getAsync(countQuery, countParams);

    res.json({
      success: true,
      scans,
      pagination: {
        total: totalCount.total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: (parseInt(offset) + scans.length) < totalCount.total
      }
    });
  } catch (error) {
    console.error('Get QR scans error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve scans',
      code: 'SCANS_ERROR'
    });
  }
}

// Export analytics as CSV
async function exportAnalytics(req, res) {
  try {
    const userId = req.user.id;
    const { qrId, startDate, endDate } = req.query;

    let query = `
      SELECT
        q.name as qr_name,
        q.type as qr_type,
        s.scanned_at,
        s.ip_address,
        s.device_type,
        s.browser,
        s.os,
        s.country_name,
        s.city
      FROM scans s
      INNER JOIN qr_codes q ON s.qr_code_id = q.id
      WHERE q.user_id = ?
    `;
    const params = [userId];

    if (qrId) {
      query += ` AND q.id = ?`;
      params.push(qrId);
    }

    if (startDate) {
      query += ` AND s.scanned_at >= ?`;
      params.push(startDate);
    }

    if (endDate) {
      query += ` AND s.scanned_at <= ?`;
      params.push(endDate);
    }

    query += ` ORDER BY s.scanned_at DESC`;

    const scans = await allAsync(query, params);

    // Generate CSV
    const csv = [
      ['QR Name', 'Type', 'Scanned At', 'IP Address', 'Device', 'Browser', 'OS', 'Country', 'City'].join(','),
      ...scans.map(scan => [
        `"${scan.qr_name || ''}"`,
        scan.qr_type || '',
        scan.scanned_at || '',
        scan.ip_address || '',
        scan.device_type || '',
        scan.browser || '',
        scan.os || '',
        scan.country_name || '',
        scan.city || ''
      ].join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="qr-analytics-${Date.now()}.csv"`);
    res.send(csv);
  } catch (error) {
    console.error('Export analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export analytics',
      code: 'EXPORT_ERROR'
    });
  }
}

module.exports = {
  getGlobalAnalytics,
  getQRAnalytics,
  getQRScans,
  exportAnalytics
};
