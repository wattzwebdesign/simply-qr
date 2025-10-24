const QRCode = require('qrcode');
const { customAlphabet } = require('nanoid');

// Generate short code for tracking URLs
const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 8);

class QRGenerator {
  /**
   * Generate a QR code as base64 data URL
   * @param {string} url - Target URL
   * @param {object} options - QR code customization options
   * @returns {Promise<string>} Base64 data URL
   */
  static async generateQRCode(url, options = {}) {
    const {
      size = 300,
      backgroundColor = '#ffffff',
      foregroundColor = '#000000',
      errorCorrectionLevel = 'M' // L, M, Q, H
    } = options;

    try {
      const qrCodeDataURL = await QRCode.toDataURL(url, {
        width: size,
        margin: 2,
        color: {
          dark: foregroundColor,
          light: backgroundColor
        },
        errorCorrectionLevel
      });

      return qrCodeDataURL;
    } catch (error) {
      console.error('QR code generation error:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  /**
   * Generate unique short code
   * @returns {string} Short code
   */
  static generateShortCode() {
    return nanoid();
  }

  /**
   * Generate tracking URL
   * @param {string} baseUrl - Base domain URL
   * @param {string} shortCode - Short code
   * @returns {string} Full tracking URL
   */
  static generateTrackingUrl(baseUrl, shortCode) {
    return `${baseUrl}/r/${shortCode}`;
  }
}

module.exports = QRGenerator;
