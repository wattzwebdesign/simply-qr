// QR Code Creation/Edit functionality

// Check authentication
const token = localStorage.getItem('token');
if (!token) {
  window.location.href = '/';
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
const qrSizeInput = document.getElementById('qr-size');
const sizeValue = document.getElementById('size-value');
const qrErrorCorrection = document.getElementById('qr-error-correction');
const previewContainer = document.getElementById('preview-container');
const generatePreviewBtn = document.getElementById('generate-preview-btn');
const alertContainer = document.getElementById('alert-container');
const saveBtn = document.getElementById('save-btn');

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
qrSizeInput.addEventListener('input', (e) => {
  sizeValue.textContent = e.target.value;
});

// Type change handler
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
      content = `smsto:${smsPhone}:${smsMessage}`;
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
    size: parseInt(qrSizeInput.value),
    error_correction: qrErrorCorrection.value,
    is_favorite: qrFavoriteInput.checked,
    short_code: currentShortCode  // Include the generated short code
  };
}

// Client-side preview generation
let previewTimeout = null;
let isGeneratingPreview = false;
let previewRetryCount = 0;

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

    // Clear preview container and create canvas
    previewContainer.innerHTML = '';
    const canvas = document.createElement('canvas');
    previewContainer.appendChild(canvas);

    // Generate QR code client-side
    QRCode.toCanvas(canvas, shortUrl, {
      width: data.size || 300,
      margin: 2,
      color: {
        dark: data.color_dark || '#000000',
        light: data.color_light || '#ffffff'
      },
      errorCorrectionLevel: data.error_correction || 'M'
    }, (error) => {
      if (error) {
        console.error('QR generation error:', error);
        if (showErrors) {
          previewContainer.innerHTML = '<p style="color: var(--error);">Failed to generate preview</p>';
        }
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

// Live preview on input changes
qrNameInput.addEventListener('input', schedulePreview);
qrTypeSelect.addEventListener('change', () => {
  updateContentFields();
  schedulePreview();
});
qrColorDark.addEventListener('input', schedulePreview);
qrColorLight.addEventListener('input', schedulePreview);
qrSizeInput.addEventListener('input', schedulePreview);
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
            const smsMatch = qr.content.match(/smsto:([^:]+):(.+)/);
            if (smsMatch) {
              document.getElementById('content-sms-phone').value = smsMatch[1];
              document.getElementById('content-sms-message').value = smsMatch[2] || '';
            }
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
        qrSizeInput.value = qr.size;
        sizeValue.textContent = qr.size;
        qrErrorCorrection.value = qr.error_correction;

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
