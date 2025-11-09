// Dashboard functionality

// Check authentication
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user') || '{}');

if (!token) {
  window.location.href = '/login';
}

// Display user email
document.getElementById('user-email').textContent = user.email || '';

// Elements
const logoutBtn = document.getElementById('logout-btn');
const searchInput = document.getElementById('search-input');
const typeFilter = document.getElementById('type-filter');
const favoritesFilter = document.getElementById('favorites-filter');
const sortFilter = document.getElementById('sort-filter');
const qrGrid = document.getElementById('qr-grid');
const loadingState = document.getElementById('loading-state');
const emptyState = document.getElementById('empty-state');
const alertContainer = document.getElementById('alert-container');
const qrCountDisplay = document.getElementById('qr-count-display');

let allQRCodes = [];
let filteredQRCodes = [];
let currentFolder = null; // Track if we're viewing a specific folder

// Logout handler
logoutBtn.addEventListener('click', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
});

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
}

// Fetch QR codes
async function fetchQRCodes() {
  try {
    const response = await fetch('/api/qrcodes', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.status === 401) {
      // Token expired
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return;
    }

    const data = await response.json();

    if (data.success) {
      allQRCodes = data.qrcodes;
      applyFilters();
    } else {
      showAlert('Failed to load QR codes', 'error');
    }
  } catch (error) {
    console.error('Fetch error:', error);
    showAlert('Network error. Please refresh.', 'error');
  }

  loadingState.classList.add('hidden');
}

// Apply filters
function applyFilters() {
  const searchTerm = searchInput.value.toLowerCase();
  const typeValue = typeFilter.value;
  const favoritesOnly = favoritesFilter.checked;
  const [sortField, sortOrder] = sortFilter.value.split(':');

  // Filter
  filteredQRCodes = allQRCodes.filter(qr => {
    // Search filter
    const matchesSearch = !searchTerm ||
      qr.name.toLowerCase().includes(searchTerm) ||
      qr.content.toLowerCase().includes(searchTerm) ||
      (qr.notes && qr.notes.toLowerCase().includes(searchTerm));

    // Type filter
    const matchesType = !typeValue || qr.type === typeValue;

    // Favorites filter
    const matchesFavorites = !favoritesOnly || qr.is_favorite === 1;

    return matchesSearch && matchesType && matchesFavorites;
  });

  // Sort
  filteredQRCodes.sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    // Handle null/undefined
    if (aVal === null || aVal === undefined) aVal = '';
    if (bVal === null || bVal === undefined) bVal = '';

    // String comparison for text fields
    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }

    if (sortOrder === 'ASC') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });

  // Update count
  qrCountDisplay.textContent = `${filteredQRCodes.length} QR code${filteredQRCodes.length !== 1 ? 's' : ''}`;

  renderQRCodes();
}

// Render QR codes with folder organization
function renderQRCodes() {
  if (filteredQRCodes.length === 0) {
    qrGrid.classList.add('hidden');
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');
  qrGrid.classList.remove('hidden');

  // If viewing a specific folder, show breadcrumb and only that folder's contents
  if (currentFolder) {
    const folderQRs = filteredQRCodes.filter(qr => qr.folder === currentFolder);

    let html = `
      <div style="grid-column: 1 / -1; margin-bottom: var(--space-lg);">
        <div style="display: flex; align-items: center; gap: var(--space-sm); margin-bottom: var(--space-md);">
          <button onclick="window.dashboardFunctions.viewAllFolders()" class="btn btn-secondary btn-sm" style="display: flex; align-items: center; gap: var(--space-xs);">
            <i data-lucide="arrow-left" style="width: 14px; height: 14px;"></i>
            Back to All
          </button>
          <i data-lucide="folder" style="width: 20px; height: 20px; color: var(--primary-emerald);"></i>
          <h2 style="font-size: var(--text-xl); font-weight: var(--font-semibold); margin: 0;">${escapeHtml(currentFolder)}</h2>
          <span style="color: var(--text-tertiary); font-size: var(--text-sm);">${folderQRs.length} ${folderQRs.length === 1 ? 'code' : 'codes'}</span>
        </div>
        <div class="dashboard-grid">
          ${folderQRs.map(qr => createQRCard(qr)).join('')}
        </div>
      </div>
    `;

    qrGrid.innerHTML = html;
    lucide.createIcons();
    generateQRCodesOnCanvas();
    attachCardEventListeners();
    return;
  }

  // Group QR codes by folder
  const folderGroups = {};
  const unassigned = [];

  filteredQRCodes.forEach(qr => {
    if (qr.folder && qr.folder.trim()) {
      if (!folderGroups[qr.folder]) {
        folderGroups[qr.folder] = [];
      }
      folderGroups[qr.folder].push(qr);
    } else {
      unassigned.push(qr);
    }
  });

  let html = '';

  // Render folders first as compact rows (like Google Drive)
  const folderNames = Object.keys(folderGroups).sort();
  if (folderNames.length > 0) {
    html += `<div style="margin-bottom: var(--space-xl);">`;
    folderNames.forEach(folderName => {
      const qrCodes = folderGroups[folderName];
      html += `
        <div class="folder-card" onclick="window.dashboardFunctions.openFolder('${escapeHtml(folderName).replace(/'/g, "\\'")}')">
          <i data-lucide="folder" style="width: 20px; height: 20px; color: var(--primary-emerald);"></i>
          <span style="font-weight: var(--font-medium);">${escapeHtml(folderName)}</span>
          <span style="color: var(--text-tertiary); font-size: var(--text-sm);">(${qrCodes.length})</span>
        </div>
      `;
    });
    html += `</div>`;
  }

  // Render unassigned QR codes in a separate section
  if (unassigned.length > 0) {
    html += `<div>`;
    if (folderNames.length > 0) {
      html += `
        <div style="margin-bottom: var(--space-lg); padding-top: var(--space-lg); border-top: 1px solid var(--border-color);">
          <h3 style="font-size: var(--text-lg); font-weight: var(--font-semibold); margin-bottom: var(--space-lg); display: flex; align-items: center; gap: var(--space-sm);">
            <i data-lucide="file" style="width: 20px; height: 20px; color: var(--text-secondary);"></i>
            Unassigned QR Codes
            <span style="color: var(--text-tertiary); font-size: var(--text-sm); font-weight: var(--font-normal);">(${unassigned.length})</span>
          </h3>
        </div>
      `;
    }
    html += `<div class="dashboard-grid">${unassigned.map(qr => createQRCard(qr)).join('')}</div>`;
    html += `</div>`;
  }

  qrGrid.innerHTML = html;

  // Re-initialize Lucide icons
  lucide.createIcons();

  // Generate QR codes on canvases
  generateQRCodesOnCanvas();

  // Attach event listeners
  attachCardEventListeners();
}

// Expose functions for folder navigation
window.dashboardFunctions = {
  openFolder: (folderName) => {
    currentFolder = folderName;
    renderQRCodes();
  },
  viewAllFolders: () => {
    currentFolder = null;
    renderQRCodes();
  }
};

// Generate QR codes on canvas elements
function generateQRCodesOnCanvas(retryCount = 0) {
  // Check if QRCode library is loaded
  if (typeof QRCode === 'undefined') {
    if (retryCount < 10) {
      // Retry after a short delay (max 10 times = 1 second)
      setTimeout(() => generateQRCodesOnCanvas(retryCount + 1), 100);
    } else {
      console.error('QRCode library failed to load after 10 retries');
    }
    return;
  }

  filteredQRCodes.forEach(qr => {
    const canvas = document.getElementById(`qr-canvas-${qr.id}`);
    if (!canvas) return;

    // All QR codes are dynamic, so use short URL
    const appUrl = window.location.origin;
    const shortUrl = `${appUrl}/r/${qr.short_code}`;

    QRCode.toCanvas(canvas, shortUrl, {
      width: 200,
      margin: 1,
      color: {
        dark: qr.color_dark || '#000000',
        light: qr.color_light || '#ffffff'
      },
      errorCorrectionLevel: qr.error_correction || 'M'
    }, (error) => {
      if (error) console.error(`Error generating QR for ${qr.id}:`, error);
    });
  });
}

// Create QR card HTML
function createQRCard(qr) {
  const typeColors = {
    url: 'badge-url',
    text: 'badge-text',
    vcard: 'badge-vcard',
    wifi: 'badge-wifi',
    email: 'badge-email',
    sms: 'badge-sms',
    phone: 'badge-phone'
  };

  const badgeClass = typeColors[qr.type] || 'badge-text';
  const isFavorite = qr.is_favorite === 1;
  const createdDate = new Date(qr.created_at).toLocaleDateString();

  return `
    <div class="qr-card" data-qr-id="${qr.id}">
      <div class="qr-card-image">
        <canvas id="qr-canvas-${qr.id}" width="200" height="200"></canvas>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: var(--space-sm);">
        <h3 class="qr-card-title">${escapeHtml(qr.name)}</h3>
        <i data-lucide="star"
           class="favorite-star ${isFavorite ? 'active' : ''}"
           data-qr-id="${qr.id}"
           style="width: 20px; height: 20px; flex-shrink: 0; ${isFavorite ? 'fill: var(--accent-amber);' : ''}">
        </i>
      </div>

      <div class="qr-card-meta">
        <span class="badge ${badgeClass}">${qr.type.toUpperCase()}</span>
        ${qr.is_dynamic === 1 ? '<span class="badge badge-dynamic">DYNAMIC</span>' : ''}
        ${qr.scan_count > 0 ? `<span style="font-size: var(--text-xs); color: var(--text-tertiary);">${qr.scan_count} scans</span>` : ''}
      </div>

      ${qr.tags && qr.tags.length > 0 ? `
        <div class="qr-card-tags">
          ${qr.tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
        </div>
      ` : ''}

      ${qr.is_dynamic === 1 && qr.short_code ? `
        <div style="margin-bottom: var(--space-md); padding: var(--space-sm); background: rgba(16, 185, 129, 0.05); border-radius: var(--radius-sm); border: 1px solid rgba(16, 185, 129, 0.2);">
          <div style="font-size: var(--text-xs); color: var(--text-secondary); margin-bottom: var(--space-xs);">Short URL:</div>
          <div style="font-family: monospace; font-size: var(--text-xs); color: var(--primary-emerald); word-break: break-all;">
            ${window.location.origin}/r/${qr.short_code}
          </div>
        </div>
      ` : ''}

      <div class="qr-card-date">Created ${createdDate}</div>

      <div class="qr-card-actions">
        <button class="btn btn-secondary btn-sm download-btn" data-qr-id="${qr.id}">
          <i data-lucide="download" style="width: 14px; height: 14px;"></i>
          Download
        </button>
        <a href="/edit/${qr.id}" class="btn btn-secondary btn-sm">
          <i data-lucide="edit" style="width: 14px; height: 14px;"></i>
          Edit
        </a>
        <button class="btn btn-danger btn-sm delete-btn" data-qr-id="${qr.id}">
          <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
          Delete
        </button>
      </div>
    </div>
  `;
}

// Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Attach event listeners to cards
function attachCardEventListeners() {
  // Favorite buttons
  document.querySelectorAll('.favorite-star').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const qrId = e.currentTarget.dataset.qrId;
      const qr = allQRCodes.find(q => q.id == qrId);
      const newFavoriteStatus = qr.is_favorite === 1 ? 0 : 1;

      await toggleFavorite(qrId, newFavoriteStatus);
    });
  });

  // Download buttons
  document.querySelectorAll('.download-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const qrId = e.currentTarget.dataset.qrId;
      await downloadQRCode(qrId);
    });
  });

  // Delete buttons
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const qrId = e.currentTarget.dataset.qrId;
      const qr = allQRCodes.find(q => q.id == qrId);

      if (confirm(`Are you sure you want to delete "${qr.name}"?`)) {
        await deleteQRCode(qrId);
      }
    });
  });
}

// Toggle favorite
async function toggleFavorite(qrId, isFavorite) {
  try {
    const response = await fetch(`/api/qrcodes/${qrId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ is_favorite: isFavorite })
    });

    const data = await response.json();

    if (data.success) {
      // Update local data
      const qr = allQRCodes.find(q => q.id == qrId);
      if (qr) {
        qr.is_favorite = isFavorite;
      }
      applyFilters();
    } else {
      showAlert('Failed to update favorite', 'error');
    }
  } catch (error) {
    console.error('Toggle favorite error:', error);
    showAlert('Network error', 'error');
  }
}

// Download QR code
async function downloadQRCode(qrId) {
  const qr = allQRCodes.find(q => q.id == qrId);
  if (!qr) return;

  // Check if QRCode library is loaded
  if (typeof QRCode === 'undefined') {
    showAlert('QR library not ready, please try again', 'error');
    return;
  }

  // Generate QR code at higher resolution for download
  const canvas = document.createElement('canvas');
  const appUrl = window.location.origin;
  const shortUrl = `${appUrl}/r/${qr.short_code}`;

  QRCode.toCanvas(canvas, shortUrl, {
    width: qr.size || 300,
    margin: 2,
    color: {
      dark: qr.color_dark || '#000000',
      light: qr.color_light || '#ffffff'
    },
    errorCorrectionLevel: qr.error_correction || 'M'
  }, (error) => {
    if (error) {
      console.error('QR generation error:', error);
      showAlert('Failed to generate QR code', 'error');
      return;
    }

    // Convert canvas to blob and download
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${qr.name.replace(/[^a-z0-9]/gi, '_')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showAlert('QR code downloaded!', 'success');
    });
  });
}

// Delete QR code
async function deleteQRCode(qrId) {
  try {
    const response = await fetch(`/api/qrcodes/${qrId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (data.success) {
      // Remove from local data
      allQRCodes = allQRCodes.filter(q => q.id != qrId);
      applyFilters();
      showAlert('QR code deleted successfully', 'success');
    } else {
      showAlert('Failed to delete QR code', 'error');
    }
  } catch (error) {
    console.error('Delete error:', error);
    showAlert('Network error', 'error');
  }
}

// Filter event listeners
searchInput.addEventListener('input', applyFilters);
typeFilter.addEventListener('change', applyFilters);
favoritesFilter.addEventListener('change', applyFilters);
sortFilter.addEventListener('change', applyFilters);

// Initial load
fetchQRCodes();
