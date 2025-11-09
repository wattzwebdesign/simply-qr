const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');

// Generate unique filename
function generateFilename(userId, name) {
  const timestamp = Date.now();
  const random = crypto.randomBytes(4).toString('hex');
  const sanitized = name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  return `user${userId}_${sanitized}_${timestamp}_${random}.png`;
}

// Generate short code for dynamic QR codes
function generateShortCode() {
  return crypto.randomBytes(4).toString('hex');
}

// Generate QR code and save to file
async function generateQRCode(options) {
  const {
    content,
    userId,
    name,
    colorDark = '#000000',
    colorLight = '#ffffff',
    size = 300,
    errorCorrectionLevel = 'M'
  } = options;

  try {
    // Create filename
    const filename = generateFilename(userId, name);
    const qrCodesDir = process.env.QR_CODES_DIR || path.join(__dirname, '../public/qr-codes');
    const filePath = path.join(qrCodesDir, filename);

    // Ensure directory exists
    await fs.mkdir(qrCodesDir, { recursive: true });

    // QR code generation options
    const qrOptions = {
      errorCorrectionLevel,
      type: 'image/png',
      quality: 1,
      margin: 2,
      width: size,
      color: {
        dark: colorDark,
        light: colorLight
      }
    };

    // Generate and save QR code
    await QRCode.toFile(filePath, content, qrOptions);

    // Return relative path for database storage
    return `/qr-codes/${filename}`;

  } catch (error) {
    console.error('QR generation error:', error);
    throw new Error('Failed to generate QR code');
  }
}

// Generate QR code as data URL (for preview)
async function generateQRCodeDataURL(options) {
  const {
    content,
    colorDark = '#000000',
    colorLight = '#ffffff',
    size = 300,
    errorCorrectionLevel = 'M'
  } = options;

  try {
    const qrOptions = {
      errorCorrectionLevel,
      type: 'image/png',
      quality: 1,
      margin: 2,
      width: size,
      color: {
        dark: colorDark,
        light: colorLight
      }
    };

    // Generate QR code as data URL
    const dataURL = await QRCode.toDataURL(content, qrOptions);
    return dataURL;

  } catch (error) {
    console.error('QR generation error:', error);
    throw new Error('Failed to generate QR code preview');
  }
}

// Delete QR code file
async function deleteQRCodeFile(filePath) {
  try {
    const fullPath = path.join(__dirname, '../public', filePath);
    await fs.unlink(fullPath);
  } catch (error) {
    // File might not exist, that's okay
    console.error('Error deleting QR code file:', error.message);
  }
}

// Format content based on QR code type
function formatQRContent(type, data) {
  switch (type) {
    case 'url':
      return data.content;

    case 'text':
      return data.content;

    case 'vcard':
      // If content is already formatted vCard string, use it
      if (data.content && data.content.startsWith('BEGIN:VCARD')) {
        return data.content;
      }
      // Otherwise, build vCard from fields
      return buildVCard(data);

    case 'wifi':
      // If content is already formatted WiFi string, use it
      if (data.content && data.content.startsWith('WIFI:')) {
        return data.content;
      }
      // Otherwise, build WiFi string from fields
      return buildWiFiString(data);

    case 'email':
      return data.content || `mailto:${data.email || ''}${data.subject ? '?subject=' + encodeURIComponent(data.subject) : ''}${data.body ? '&body=' + encodeURIComponent(data.body) : ''}`;

    case 'sms':
      return data.content || `smsto:${data.phone || ''}:${data.message || ''}`;

    case 'phone':
      return data.content || `tel:${data.phone || ''}`;

    default:
      return data.content;
  }
}

// Build vCard string
function buildVCard(data) {
  let vcard = 'BEGIN:VCARD\nVERSION:3.0\n';

  if (data.name) vcard += `FN:${data.name}\n`;
  if (data.phone) vcard += `TEL:${data.phone}\n`;
  if (data.email) vcard += `EMAIL:${data.email}\n`;
  if (data.organization) vcard += `ORG:${data.organization}\n`;
  if (data.url) vcard += `URL:${data.url}\n`;
  if (data.address) vcard += `ADR:;;${data.address}\n`;

  vcard += 'END:VCARD';
  return vcard;
}

// Build WiFi string
function buildWiFiString(data) {
  const security = data.security || 'WPA';
  const ssid = data.ssid || '';
  const password = data.password || '';
  const hidden = data.hidden ? 'true' : 'false';

  return `WIFI:T:${security};S:${ssid};P:${password};H:${hidden};;`;
}

module.exports = {
  generateQRCode,
  generateQRCodeDataURL,
  deleteQRCodeFile,
  generateShortCode,
  formatQRContent
};
