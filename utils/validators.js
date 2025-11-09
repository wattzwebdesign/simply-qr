// Email validation
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Password validation
function isValidPassword(password) {
  // Minimum 8 characters
  return password && password.length >= 8;
}

// URL validation
function isValidURL(url) {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}

// Phone number validation (basic)
function isValidPhone(phone) {
  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

// Sanitize user input (basic XSS prevention)
function sanitizeInput(input) {
  if (typeof input !== 'string') return input;

  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Validate QR code type
function isValidQRType(type) {
  const validTypes = ['url', 'text', 'vcard', 'wifi', 'email', 'sms', 'phone'];
  return validTypes.includes(type);
}

// Validate error correction level
function isValidErrorCorrection(level) {
  const validLevels = ['L', 'M', 'Q', 'H'];
  return validLevels.includes(level);
}

// Validate hex color
function isValidHexColor(color) {
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexRegex.test(color);
}

module.exports = {
  isValidEmail,
  isValidPassword,
  isValidURL,
  isValidPhone,
  sanitizeInput,
  isValidQRType,
  isValidErrorCorrection,
  isValidHexColor
};
