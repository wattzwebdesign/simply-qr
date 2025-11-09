const { getAsync, runAsync } = require('../config/database');

// Handle redirect for dynamic QR codes
async function handleRedirect(req, res) {
  try {
    const { shortCode } = req.params;

    // Get QR code by short code
    const qrcode = await getAsync(
      'SELECT id, redirect_url, is_dynamic, name FROM qr_codes WHERE short_code = ?',
      [shortCode]
    );

    if (!qrcode) {
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>QR Code Not Found</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            h1 { color: #ef4444; }
          </style>
        </head>
        <body>
          <h1>QR Code Not Found</h1>
          <p>This QR code does not exist or has been deleted.</p>
        </body>
        </html>
      `);
    }

    // Verify it's a dynamic QR code
    if (!qrcode.is_dynamic) {
      return res.status(400).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invalid QR Code</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            h1 { color: #ef4444; }
          </style>
        </head>
        <body>
          <h1>Invalid QR Code</h1>
          <p>This QR code is not configured for dynamic redirects.</p>
        </body>
        </html>
      `);
    }

    // Check if redirect URL exists
    if (!qrcode.redirect_url) {
      return res.status(500).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>No Destination Set</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            h1 { color: #f59e0b; }
          </style>
        </head>
        <body>
          <h1>No Destination Set</h1>
          <p>This QR code has not been configured with a destination URL yet.</p>
        </body>
        </html>
      `);
    }

    // Get client info for tracking
    const ipAddress = req.headers['x-forwarded-for'] ||
                      req.headers['x-real-ip'] ||
                      req.connection.remoteAddress ||
                      req.socket.remoteAddress ||
                      'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    // Track the scan asynchronously (don't wait for it)
    trackScan(qrcode.id, ipAddress, userAgent).catch(err => {
      console.error('Error tracking scan:', err);
    });

    // Redirect to the target URL
    res.redirect(302, qrcode.redirect_url);

  } catch (error) {
    console.error('Redirect error:', error);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Redirect Error</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
          h1 { color: #ef4444; }
        </style>
      </head>
      <body>
        <h1>Redirect Error</h1>
        <p>An error occurred while processing this QR code.</p>
      </body>
      </html>
    `);
  }
}

// Track scan analytics
async function trackScan(qrCodeId, ipAddress, userAgent) {
  try {
    // Increment scan count and update last scanned time
    await runAsync(
      'UPDATE qr_codes SET scan_count = scan_count + 1, last_scanned_at = NOW() WHERE id = ?',
      [qrCodeId]
    );

    // Log scan details
    await runAsync(
      'INSERT INTO scans (qr_code_id, ip_address, user_agent) VALUES (?, ?, ?)',
      [qrCodeId, ipAddress.substring(0, 45), userAgent.substring(0, 500)]
    );

    console.log(`Scan tracked for QR code ID ${qrCodeId}`);
  } catch (error) {
    console.error('Track scan error:', error);
    // Don't throw - tracking failure shouldn't block the redirect
  }
}

module.exports = {
  handleRedirect
};
