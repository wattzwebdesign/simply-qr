// QR Code Creation/Edit functionality

// Check authentication
const token = localStorage.getItem('token');
if (!token) {
  window.location.href = '/login';
}

// Check if editing
const urlPath = window.location.pathname;
const isEditMode = urlPath.startsWith('/edit/');
const qrId = isEditMode ? urlPath.split('/')[2] : null;

// Generate short code (client-side)
let currentShortCode = null;

function generateShortCode() {
  // Generate 8-character hex string (like backend does)
  const array = new Uint8Array(4);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Initialize short code for new QR codes
if (!isEditMode) {
  currentShortCode = generateShortCode();
  const appUrl = window.location.origin;
  document.getElementById('short-url-value').textContent = `${appUrl}/r/${currentShortCode}`;
}

// Update page title
if (isEditMode) {
  document.getElementById('page-title').textContent = 'Edit QR Code';
  document.getElementById('save-text').textContent = 'Update QR Code';
}

// Elements
const qrForm = document.getElementById('qr-form');
const qrNameInput = document.getElementById('qr-name');
const qrTypeSelect = document.getElementById('qr-type');
const contentFields = document.getElementById('content-fields');
const qrNotesInput = document.getElementById('qr-notes');
const qrTagsInput = document.getElementById('qr-tags');
const qrFolderInput = document.getElementById('qr-folder');
const qrFavoriteInput = document.getElementById('qr-favorite');
const shortUrlDisplay = document.getElementById('short-url-display');
const shortUrlValue = document.getElementById('short-url-value');
const qrColorDark = document.getElementById('qr-color-dark');
const qrColorDarkText = document.getElementById('qr-color-dark-text');
const qrColorLight = document.getElementById('qr-color-light');
const qrColorLightText = document.getElementById('qr-color-light-text');
const qrErrorCorrection = document.getElementById('qr-error-correction');
const qrFrame = document.getElementById('qr-frame');
const qrFrameText = document.getElementById('qr-frame-text');
const frameTextGroup = document.getElementById('frame-text-group');
const previewContainer = document.getElementById('preview-container');
const generatePreviewBtn = document.getElementById('generate-preview-btn');
const alertContainer = document.getElementById('alert-container');
const saveBtn = document.getElementById('save-btn');
const downloadPngBtn = document.getElementById('download-png');
const downloadJpgBtn = document.getElementById('download-jpg');
const downloadSvgBtn = document.getElementById('download-svg');
const downloadPdfBtn = document.getElementById('download-pdf');

// Content field templates
const contentFieldTemplates = {
  url: `
    <div class="form-group">
      <label class="form-label" for="content-url">URL *</label>
      <input
        type="url"
        id="content-url"
        class="input-field"
        placeholder="https://example.com"
        required
      >
      <p class="form-helper">Enter the full URL including https://</p>
    </div>
  `,
  text: `
    <div class="form-group">
      <label class="form-label" for="content-text">Text Content *</label>
      <textarea
        id="content-text"
        class="input-field"
        placeholder="Enter any text you want to encode..."
        required
        rows="5"
      ></textarea>
    </div>
  `,
  vcard: `
    <div class="form-group">
      <label class="form-label" for="content-vcard-name">Full Name *</label>
      <input type="text" id="content-vcard-name" class="input-field" placeholder="John Doe" required>
    </div>
    <div class="form-group">
      <label class="form-label" for="content-vcard-phone">Phone</label>
      <input type="tel" id="content-vcard-phone" class="input-field" placeholder="+1234567890">
    </div>
    <div class="form-group">
      <label class="form-label" for="content-vcard-email">Email</label>
      <input type="email" id="content-vcard-email" class="input-field" placeholder="john@example.com">
    </div>
    <div class="form-group">
      <label class="form-label" for="content-vcard-organization">Organization</label>
      <input type="text" id="content-vcard-organization" class="input-field" placeholder="Company Name">
    </div>
    <div class="form-group">
      <label class="form-label" for="content-vcard-url">Website</label>
      <input type="url" id="content-vcard-url" class="input-field" placeholder="https://example.com">
    </div>
    <div class="form-group">
      <label class="form-label" for="content-vcard-address">Address</label>
      <input type="text" id="content-vcard-address" class="input-field" placeholder="123 Main St, City, State">
    </div>
  `,
  wifi: `
    <div class="form-group">
      <label class="form-label" for="content-wifi-ssid">Network Name (SSID) *</label>
      <input type="text" id="content-wifi-ssid" class="input-field" placeholder="MyWiFiNetwork" required>
    </div>
    <div class="form-group">
      <label class="form-label" for="content-wifi-password">Password *</label>
      <input type="text" id="content-wifi-password" class="input-field" placeholder="WiFi password" required>
    </div>
    <div class="form-group">
      <label class="form-label" for="content-wifi-security">Security Type</label>
      <select id="content-wifi-security" class="input-field">
        <option value="WPA">WPA/WPA2</option>
        <option value="WEP">WEP</option>
        <option value="nopass">None (Open)</option>
      </select>
    </div>
    <div class="form-group">
      <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer;">
        <input type="checkbox" id="content-wifi-hidden">
        <span class="form-label" style="margin: 0;">Hidden Network</span>
      </label>
    </div>
  `,
  email: `
    <div class="form-group">
      <label class="form-label" for="content-email-address">Email Address *</label>
      <input type="email" id="content-email-address" class="input-field" placeholder="recipient@example.com" required>
    </div>
    <div class="form-group">
      <label class="form-label" for="content-email-subject">Subject</label>
      <input type="text" id="content-email-subject" class="input-field" placeholder="Email subject">
    </div>
    <div class="form-group">
      <label class="form-label" for="content-email-body">Message</label>
      <textarea id="content-email-body" class="input-field" placeholder="Email message..." rows="4"></textarea>
    </div>
  `,
  sms: `
    <div class="form-group">
      <label class="form-label" for="content-sms-phone">Phone Number *</label>
      <input type="tel" id="content-sms-phone" class="input-field" placeholder="+1234567890" required>
    </div>
    <div class="form-group">
      <label class="form-label" for="content-sms-message">Message</label>
      <textarea id="content-sms-message" class="input-field" placeholder="SMS message..." rows="4"></textarea>
    </div>
  `,
  phone: `
    <div class="form-group">
      <label class="form-label" for="content-phone-number">Phone Number *</label>
      <input type="tel" id="content-phone-number" class="input-field" placeholder="+1234567890" required>
    </div>
  `
};

// Show alert
function showAlert(message, type = 'success') {
  const alert = document.createElement('div');
  alert.className = `alert alert-${type}`;
  alert.textContent = message;
  alertContainer.innerHTML = '';
  alertContainer.appendChild(alert);

  setTimeout(() => {
    alert.remove();
  }, 5000);

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Update content fields based on type
function updateContentFields() {
  const type = qrTypeSelect.value;
  contentFields.innerHTML = contentFieldTemplates[type] || '';
  lucide.createIcons();
}

// Sync color pickers with text inputs
qrColorDark.addEventListener('input', (e) => {
  qrColorDarkText.value = e.target.value;
});

qrColorDarkText.addEventListener('input', (e) => {
  if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
    qrColorDark.value = e.target.value;
  }
});

qrColorLight.addEventListener('input', (e) => {
  qrColorLightText.value = e.target.value;
});

qrColorLightText.addEventListener('input', (e) => {
  if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
    qrColorLight.value = e.target.value;
  }
});

// Update size value display
// Size is now fixed at 300px

// Visual Type Picker Handler
document.querySelectorAll('.qr-type-card').forEach(card => {
  card.addEventListener('click', function() {
    // Remove active class from all cards
    document.querySelectorAll('.qr-type-card').forEach(c => c.classList.remove('active'));

    // Add active class to clicked card
    this.classList.add('active');

    // Update hidden input value
    const selectedType = this.dataset.type;
    qrTypeSelect.value = selectedType;

    // Update content fields for new type
    updateContentFields();

    // Re-initialize Lucide icons
    lucide.createIcons();
  });
});

// Visual Frame Picker Handler
document.querySelectorAll('.qr-frame-card').forEach(card => {
  card.addEventListener('click', function() {
    // Remove active class from all cards
    document.querySelectorAll('.qr-frame-card').forEach(c => c.classList.remove('active'));

    // Add active class to clicked card
    this.classList.add('active');

    // Update hidden input value
    const selectedFrame = this.dataset.frame;
    qrFrame.value = selectedFrame;

    // Show/hide frame text input
    if (selectedFrame === 'none') {
      frameTextGroup.style.display = 'none';
    } else {
      frameTextGroup.style.display = 'block';
    }

    // Update preview
    schedulePreview();
  });
});

// Type change handler (for programmatic changes)
qrTypeSelect.addEventListener('change', updateContentFields);

// Collect form data
function collectFormData() {
  const type = qrTypeSelect.value;
  let content = '';

  // Build content based on type
  switch (type) {
    case 'url':
      content = document.getElementById('content-url')?.value || '';
      break;

    case 'text':
      content = document.getElementById('content-text')?.value || '';
      break;

    case 'vcard':
      const vcardData = {
        name: document.getElementById('content-vcard-name')?.value || '',
        phone: document.getElementById('content-vcard-phone')?.value || '',
        email: document.getElementById('content-vcard-email')?.value || '',
        organization: document.getElementById('content-vcard-organization')?.value || '',
        url: document.getElementById('content-vcard-url')?.value || '',
        address: document.getElementById('content-vcard-address')?.value || ''
      };
      // Build vCard string
      content = 'BEGIN:VCARD\nVERSION:3.0\n';
      if (vcardData.name) content += `FN:${vcardData.name}\n`;
      if (vcardData.phone) content += `TEL:${vcardData.phone}\n`;
      if (vcardData.email) content += `EMAIL:${vcardData.email}\n`;
      if (vcardData.organization) content += `ORG:${vcardData.organization}\n`;
      if (vcardData.url) content += `URL:${vcardData.url}\n`;
      if (vcardData.address) content += `ADR:;;${vcardData.address}\n`;
      content += 'END:VCARD';
      break;

    case 'wifi':
      const security = document.getElementById('content-wifi-security')?.value || 'WPA';
      const ssid = document.getElementById('content-wifi-ssid')?.value || '';
      const password = document.getElementById('content-wifi-password')?.value || '';
      const hidden = document.getElementById('content-wifi-hidden')?.checked ? 'true' : 'false';
      content = `WIFI:T:${security};S:${ssid};P:${password};H:${hidden};;`;
      break;

    case 'email':
      const email = document.getElementById('content-email-address')?.value || '';
      const subject = document.getElementById('content-email-subject')?.value || '';
      const body = document.getElementById('content-email-body')?.value || '';
      content = `mailto:${email}`;
      if (subject || body) {
        content += '?';
        if (subject) content += `subject=${encodeURIComponent(subject)}`;
        if (subject && body) content += '&';
        if (body) content += `body=${encodeURIComponent(body)}`;
      }
      break;

    case 'sms':
      const smsPhone = document.getElementById('content-sms-phone')?.value || '';
      const smsMessage = document.getElementById('content-sms-message')?.value || '';
      if (smsMessage) {
        content = `sms:${smsPhone}?body=${encodeURIComponent(smsMessage)}`;
      } else {
        content = `sms:${smsPhone}`;
      }
      break;

    case 'phone':
      const phoneNumber = document.getElementById('content-phone-number')?.value || '';
      content = `tel:${phoneNumber}`;
      break;
  }

  // Parse tags
  const tagsString = qrTagsInput.value.trim();
  const tags = tagsString ? tagsString.split(',').map(t => t.trim()).filter(t => t) : [];

  return {
    name: qrNameInput.value,
    type,
    content,
    tags,
    folder: qrFolderInput.value || null,
    notes: qrNotesInput.value || null,
    color_dark: qrColorDark.value,
    color_light: qrColorLight.value,
    size: 300, // Fixed size
    error_correction: qrErrorCorrection.value,
    is_favorite: qrFavoriteInput.checked,
    short_code: currentShortCode,  // Include the generated short code
    frame: qrFrame.value || 'none',
    frame_text: qrFrameText.value || 'SCAN ME'
  };
}

// Client-side preview generation
let previewTimeout = null;
let isGeneratingPreview = false;
let previewRetryCount = 0;

// Apply frame to QR code canvas
function applyFrame(qrCanvas, frameType, frameText) {
  const padding = 40;
  const textHeight = 50;
  const qrSize = qrCanvas.width;

  let totalWidth = qrSize + (padding * 2);
  let totalHeight = qrSize + (padding * 2) + textHeight;

  const framedCanvas = document.createElement('canvas');
  framedCanvas.width = totalWidth;
  framedCanvas.height = totalHeight;
  const ctx = framedCanvas.getContext('2d');

  // Fill background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, totalWidth, totalHeight);

  const centerX = totalWidth / 2;
  const centerY = (totalHeight - textHeight) / 2;

  // Draw frame based on type
  ctx.fillStyle = '#000000';
  switch (frameType) {
    case 'square':
      // Black square frame
      ctx.fillRect(padding - 20, padding - 20, qrSize + 40, qrSize + 40 + textHeight);
      break;

    case 'rounded':
      // Rounded black frame
      ctx.beginPath();
      ctx.roundRect(padding - 20, padding - 20, qrSize + 40, qrSize + 40 + textHeight, 20);
      ctx.fill();
      break;
  }

  // Draw QR code
  ctx.drawImage(qrCanvas, padding, padding, qrSize, qrSize);

  // Draw text
  if (frameText) {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Inter, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(frameText, centerX, padding + qrSize + (textHeight / 2));
  }

  return framedCanvas;
}

function generatePreview(showErrors = true) {
  const data = collectFormData();

  // For new QR codes, always show preview with short URL even if no content yet
  if (!currentShortCode) {
    if (showErrors) {
      previewContainer.innerHTML = '<p style="color: var(--text-tertiary);">Error: No short code generated</p>';
    }
    return;
  }

  if (isGeneratingPreview) return;

  // Check if QRCode library is loaded
  if (typeof QRCode === 'undefined') {
    if (previewRetryCount < 10) {
      if (showErrors) {
        previewContainer.innerHTML = '<p style="color: var(--text-tertiary);">Loading preview...</p>';
      }
      // Retry after a short delay (max 10 times = 1 second)
      previewRetryCount++;
      setTimeout(() => generatePreview(showErrors), 100);
    } else {
      console.error('QRCode library failed to load after 10 retries');
      if (showErrors) {
        previewContainer.innerHTML = '<p style="color: var(--error);">Failed to load QR library</p>';
      }
    }
    return;
  }

  // Reset retry count on successful load
  previewRetryCount = 0;

  isGeneratingPreview = true;
  previewContainer.innerHTML = '<div class="spinner" style="margin: 0 auto;"></div><p style="color: var(--text-tertiary); margin-top: var(--space-md);">Generating preview...</p>';

  try {
    // Generate QR code showing the short URL (dynamic)
    const appUrl = window.location.origin;
    const shortUrl = `${appUrl}/r/${currentShortCode}`;

    // Clear preview container
    previewContainer.innerHTML = '';

    // Create canvas for QR code
    const qrCanvas = document.createElement('canvas');

    // Generate QR code client-side
    QRCode.toCanvas(qrCanvas, shortUrl, {
      width: data.size || 300,
      margin: 2,
      color: {
        dark: data.color_dark || '#000000',
        light: data.color_light || '#ffffff'
      },
      errorCorrectionLevel: data.error_correction || 'Q'
    }, (error) => {
      if (error) {
        console.error('QR generation error:', error);
        if (showErrors) {
          previewContainer.innerHTML = '<p style="color: var(--error);">Failed to generate preview</p>';
        }
        isGeneratingPreview = false;
        return;
      }

      // Apply frame if not "none"
      if (data.frame && data.frame !== 'none') {
        const framedCanvas = applyFrame(qrCanvas, data.frame, data.frame_text);
        previewContainer.appendChild(framedCanvas);
      } else {
        previewContainer.appendChild(qrCanvas);
      }

      isGeneratingPreview = false;
    });

  } catch (error) {
    console.error('Preview error:', error);
    if (showErrors) {
      previewContainer.innerHTML = '<p style="color: var(--error);">Error generating preview</p>';
    }
    isGeneratingPreview = false;
  }
}

// Auto-preview with debounce
function schedulePreview() {
  clearTimeout(previewTimeout);
  previewTimeout = setTimeout(() => {
    generatePreview(false);
  }, 800); // Wait 800ms after user stops typing
}

// Generate preview button
generatePreviewBtn.addEventListener('click', () => {
  clearTimeout(previewTimeout);
  generatePreview(true);
});

// Download functions
async function createDownloadCanvas() {
  const data = collectFormData();
  const appUrl = window.location.origin;
  const shortUrl = `${appUrl}/r/${currentShortCode}`;

  // Generate QR code at high resolution
  const qrCanvas = document.createElement('canvas');
  await new Promise((resolve, reject) => {
    QRCode.toCanvas(qrCanvas, shortUrl, {
      width: 600,
      margin: 2,
      color: {
        dark: data.color_dark || '#000000',
        light: data.color_light || '#ffffff'
      },
      errorCorrectionLevel: data.error_correction || 'Q'
    }, (error) => {
      if (error) reject(error);
      else resolve();
    });
  });

  // Apply frame if selected
  if (data.frame && data.frame !== 'none') {
    return applyFrameHighRes(qrCanvas, data.frame, data.frame_text);
  }

  return qrCanvas;
}

// High-resolution frame application for downloads
function applyFrameHighRes(qrCanvas, frameType, frameText) {
  const padding = 80;
  const textHeight = 100;
  const qrSize = qrCanvas.width;

  let totalWidth = qrSize + (padding * 2);
  let totalHeight = qrSize + (padding * 2) + textHeight;

  const framedCanvas = document.createElement('canvas');
  framedCanvas.width = totalWidth;
  framedCanvas.height = totalHeight;
  const ctx = framedCanvas.getContext('2d');

  // Fill background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, totalWidth, totalHeight);

  const centerX = totalWidth / 2;
  const centerY = (totalHeight - textHeight) / 2;

  // Draw frame based on type
  ctx.fillStyle = '#000000';
  switch (frameType) {
    case 'square':
      ctx.fillRect(padding - 40, padding - 40, qrSize + 80, qrSize + 80 + textHeight);
      break;

    case 'rounded':
      ctx.beginPath();
      ctx.roundRect(padding - 40, padding - 40, qrSize + 80, qrSize + 80 + textHeight, 40);
      ctx.fill();
      break;
  }

  // Draw QR code
  ctx.drawImage(qrCanvas, padding, padding, qrSize, qrSize);

  // Draw text
  if (frameText) {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Inter, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(frameText, centerX, padding + qrSize + (textHeight / 2));
  }

  return framedCanvas;
}

// PNG Download
downloadPngBtn.addEventListener('click', async () => {
  try {
    const canvas = await createDownloadCanvas();
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${currentShortCode}.png`;
      link.click();
      URL.revokeObjectURL(url);
    });
  } catch (error) {
    console.error('PNG download error:', error);
    alert('Failed to download PNG');
  }
});

// JPG Download
downloadJpgBtn.addEventListener('click', async () => {
  try {
    const canvas = await createDownloadCanvas();
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${currentShortCode}.jpg`;
      link.click();
      URL.revokeObjectURL(url);
    }, 'image/jpeg', 0.95);
  } catch (error) {
    console.error('JPG download error:', error);
    alert('Failed to download JPG');
  }
});

// SVG Download - Convert canvas to SVG with embedded image
downloadSvgBtn.addEventListener('click', async () => {
  try {
    const canvas = await createDownloadCanvas();
    const imgData = canvas.toDataURL('image/png');

    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${canvas.width}" height="${canvas.height}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <image width="${canvas.width}" height="${canvas.height}" xlink:href="${imgData}"/>
</svg>`;

    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentShortCode}.svg`;
    link.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('SVG download error:', error);
    alert('Failed to download SVG');
  }
});

// PDF Download
downloadPdfBtn.addEventListener('click', async () => {
  try {
    const canvas = await createDownloadCanvas();
    const imgData = canvas.toDataURL('image/png');

    // Calculate PDF dimensions (A4 or custom)
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = imgWidth / imgHeight;

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
      orientation: ratio > 1 ? 'landscape' : 'portrait',
      unit: 'px',
      format: [imgWidth, imgHeight]
    });

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save(`${currentShortCode}.pdf`);
  } catch (error) {
    console.error('PDF download error:', error);
    alert('Failed to download PDF');
  }
});

// Live preview on input changes
qrNameInput.addEventListener('input', schedulePreview);
qrFrameText.addEventListener('input', schedulePreview);
qrTypeSelect.addEventListener('change', () => {
  updateContentFields();
  schedulePreview();
});
qrColorDark.addEventListener('input', schedulePreview);
qrColorLight.addEventListener('input', schedulePreview);
qrErrorCorrection.addEventListener('change', schedulePreview);

// Listen for content field changes (delegate since they're dynamic)
contentFields.addEventListener('input', schedulePreview);
contentFields.addEventListener('change', schedulePreview);

// Form submission
qrForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = collectFormData();

  saveBtn.disabled = true;
  saveBtn.innerHTML = '<div class="spinner"></div> Saving...';

  try {
    const url = isEditMode ? `/api/qrcodes/${qrId}` : '/api/qrcodes';
    const method = isEditMode ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (result.success) {
      showAlert(isEditMode ? 'QR code updated successfully!' : 'QR code created successfully!', 'success');

      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1500);
    } else {
      showAlert(result.error || 'Failed to save QR code', 'error');
      saveBtn.disabled = false;
      saveBtn.innerHTML = `<i data-lucide="save" style="width: 18px; height: 18px;"></i> <span>${isEditMode ? 'Update' : 'Create'} QR Code</span>`;
      lucide.createIcons();
    }
  } catch (error) {
    console.error('Save error:', error);
    showAlert('Network error. Please try again.', 'error');
    saveBtn.disabled = false;
    saveBtn.innerHTML = `<i data-lucide="save" style="width: 18px; height: 18px;"></i> <span>${isEditMode ? 'Update' : 'Create'} QR Code</span>`;
    lucide.createIcons();
  }
});

// Load existing QR code if editing
async function loadQRCode() {
  if (!isEditMode) return;

  try {
    const response = await fetch(`/api/qrcodes/${qrId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (data.success) {
      const qr = data.qrcode;

      // Populate basic fields
      qrNameInput.value = qr.name;
      qrTypeSelect.value = qr.type;

      // Update visual type picker
      document.querySelectorAll('.qr-type-card').forEach(card => {
        card.classList.remove('active');
        if (card.dataset.type === qr.type) {
          card.classList.add('active');
        }
      });

      updateContentFields();

      // Wait for content fields to be created
      setTimeout(() => {
        // Populate type-specific fields
        switch (qr.type) {
          case 'url':
            document.getElementById('content-url').value = qr.content;
            break;

          case 'text':
            document.getElementById('content-text').value = qr.content;
            break;

          case 'vcard':
            // Parse vCard
            const lines = qr.content.split('\n');
            lines.forEach(line => {
              if (line.startsWith('FN:')) document.getElementById('content-vcard-name').value = line.substring(3);
              if (line.startsWith('TEL:')) document.getElementById('content-vcard-phone').value = line.substring(4);
              if (line.startsWith('EMAIL:')) document.getElementById('content-vcard-email').value = line.substring(6);
              if (line.startsWith('ORG:')) document.getElementById('content-vcard-organization').value = line.substring(4);
              if (line.startsWith('URL:')) document.getElementById('content-vcard-url').value = line.substring(4);
              if (line.startsWith('ADR:')) document.getElementById('content-vcard-address').value = line.substring(5);
            });
            break;

          case 'wifi':
            // Parse WiFi string
            const wifiMatch = qr.content.match(/WIFI:T:([^;]+);S:([^;]+);P:([^;]+);H:([^;]+);;/);
            if (wifiMatch) {
              document.getElementById('content-wifi-security').value = wifiMatch[1];
              document.getElementById('content-wifi-ssid').value = wifiMatch[2];
              document.getElementById('content-wifi-password').value = wifiMatch[3];
              document.getElementById('content-wifi-hidden').checked = wifiMatch[4] === 'true';
            }
            break;

          case 'email':
            const emailMatch = qr.content.match(/mailto:([^?]+)(\?.*)?/);
            if (emailMatch) {
              document.getElementById('content-email-address').value = emailMatch[1];
              if (emailMatch[2]) {
                const params = new URLSearchParams(emailMatch[2]);
                if (params.has('subject')) document.getElementById('content-email-subject').value = params.get('subject');
                if (params.has('body')) document.getElementById('content-email-body').value = params.get('body');
              }
            }
            break;

          case 'sms':
            // Support both old format (smsto:) and new format (sms:)
            let smsPhone = '';
            let smsMessage = '';

            if (qr.content.startsWith('sms:')) {
              // New format: sms:+1234567890?body=message
              const smsMatch = qr.content.match(/sms:([^?]+)(?:\?body=(.+))?/);
              if (smsMatch) {
                smsPhone = smsMatch[1];
                smsMessage = smsMatch[2] ? decodeURIComponent(smsMatch[2]) : '';
              }
            } else {
              // Old format: smsto:+1234567890:message
              const smsMatch = qr.content.match(/smsto:([^:]+):(.+)/);
              if (smsMatch) {
                smsPhone = smsMatch[1];
                smsMessage = smsMatch[2] || '';
              }
            }

            document.getElementById('content-sms-phone').value = smsPhone;
            document.getElementById('content-sms-message').value = smsMessage;
            break;

          case 'phone':
            const phoneMatch = qr.content.match(/tel:(.+)/);
            if (phoneMatch) {
              document.getElementById('content-phone-number').value = phoneMatch[1];
            }
            break;
        }

        // Populate other fields
        qrNotesInput.value = qr.notes || '';
        qrTagsInput.value = qr.tags ? qr.tags.join(', ') : '';
        qrFolderInput.value = qr.folder || '';
        qrFavoriteInput.checked = qr.is_favorite === 1;

        // Set current short code for editing (all QRs are dynamic now)
        if (qr.short_code) {
          currentShortCode = qr.short_code;
          const appUrl = window.location.origin;
          shortUrlValue.textContent = `${appUrl}/r/${qr.short_code}`;

          // For dynamic QR codes, show redirect_url instead of content for URL types
          if (qr.type === 'url' && qr.redirect_url) {
            setTimeout(() => {
              document.getElementById('content-url').value = qr.redirect_url;
            }, 50);
          }
        }

        qrColorDark.value = qr.color_dark;
        qrColorDarkText.value = qr.color_dark;
        qrColorLight.value = qr.color_light;
        qrColorLightText.value = qr.color_light;
        qrErrorCorrection.value = qr.error_correction;

        // Load frame settings
        if (qr.frame) {
          qrFrame.value = qr.frame;

          // Update visual frame picker
          document.querySelectorAll('.qr-frame-card').forEach(card => {
            card.classList.remove('active');
            if (card.dataset.frame === qr.frame) {
              card.classList.add('active');
            }
          });

          // Show/hide frame text input
          if (qr.frame !== 'none') {
            frameTextGroup.style.display = 'block';
            if (qr.frame_text) qrFrameText.value = qr.frame_text;
          }
        }

        // Generate preview after loading data
        setTimeout(() => {
          generatePreview(true);
        }, 200);
      }, 100);
    } else {
      showAlert('Failed to load QR code', 'error');
    }
  } catch (error) {
    console.error('Load error:', error);
    showAlert('Network error', 'error');
  }
}

// Initialize
updateContentFields();
loadQRCode();

// Trigger initial preview immediately (for new QR codes)
if (!isEditMode) {
  setTimeout(() => {
    generatePreview(false);
  }, 100);
}
