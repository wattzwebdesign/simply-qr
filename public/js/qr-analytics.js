// QR Analytics functionality

// Check authentication
const token = localStorage.getItem('token');
if (!token) {
  window.location.href = '/login';
}

// Extract QR ID from URL
const pathParts = window.location.pathname.split('/');
const qrId = pathParts[pathParts.length - 1];

// Elements
const loadingState = document.getElementById('loading-state');
const analyticsContent = document.getElementById('analytics-content');
const alertContainer = document.getElementById('alert-container');
const exportCsvBtn = document.getElementById('export-csv-btn');

// Chart instances
let timelineChart = null;
let deviceChart = null;
let browserChart = null;
let osChart = null;

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

// Format number with commas
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Format date for display
function formatDate(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
}

// Load and render QR analytics
async function loadQRAnalytics() {
  try {
    const response = await fetch(`/api/analytics/qr/${qrId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return;
    }

    const data = await response.json();

    if (data.success) {
      renderQRAnalytics(data.qrcode, data.analytics);
      loadingState.style.display = 'none';
      analyticsContent.style.display = 'block';
    } else {
      showAlert(data.error || 'Failed to load analytics', 'error');
      loadingState.style.display = 'none';
    }
  } catch (error) {
    console.error('Load analytics error:', error);
    showAlert('Network error. Please refresh.', 'error');
    loadingState.style.display = 'none';
  }
}

// Render QR analytics data
function renderQRAnalytics(qrcode, analytics) {
  // Update page title
  document.title = `${qrcode.name} - Analytics - SimplyQR`;

  // Update QR info
  document.getElementById('qr-name').textContent = qrcode.name;

  // Update QR type badge
  const typeBadge = document.getElementById('qr-type-badge');
  typeBadge.textContent = qrcode.type.toUpperCase();
  typeBadge.className = `badge badge-${qrcode.type}`;

  // Update short URL (only for URL type)
  const shortUrlElement = document.getElementById('qr-short-url');
  if (qrcode.type === 'url' && qrcode.short_code) {
    shortUrlElement.textContent = `${window.location.origin}/r/${qrcode.short_code}`;
  } else {
    shortUrlElement.textContent = 'Static QR Code';
  }

  // Update edit link
  document.getElementById('edit-qr-link').href = `/edit/${qrcode.id}`;

  // Generate QR code preview
  generateQRPreview(qrcode);

  // Update summary cards
  document.getElementById('total-scans').textContent = formatNumber(analytics.totalScans);
  document.getElementById('unique-ips').textContent = formatNumber(analytics.uniqueIPs);

  const lastScannedElement = document.getElementById('last-scanned');
  if (qrcode.last_scanned_at) {
    lastScannedElement.textContent = formatDate(qrcode.last_scanned_at);
    lastScannedElement.style.fontSize = 'var(--text-lg)';
  } else {
    lastScannedElement.textContent = 'Never';
  }

  // Render timeline chart
  renderTimelineChart(analytics.scansOverTime);

  // Render country breakdown
  renderCountryBreakdown(analytics.countryBreakdown);

  // Render device breakdown
  renderDeviceChart(analytics.deviceBreakdown);

  // Render browser breakdown
  renderBrowserChart(analytics.browserBreakdown);

  // Render OS breakdown
  renderOSChart(analytics.osBreakdown);

  // Render recent scans table
  renderRecentScans(analytics.recentScans);
}

// Generate QR code preview
function generateQRPreview(qrCode) {
  const canvas = document.getElementById('qr-canvas');

  let qrContent = '';

  switch (qrCode.type) {
    case 'url':
      qrContent = qrCode.short_code
        ? `${window.location.origin}/r/${qrCode.short_code}`
        : qrCode.content;
      break;
    case 'sms':
      const smsData = JSON.parse(qrCode.content);
      qrContent = `SMSTO:${smsData.phone}:${smsData.message || ''}`;
      break;
    case 'email':
      const emailData = JSON.parse(qrCode.content);
      qrContent = `mailto:${emailData.email}?subject=${encodeURIComponent(emailData.subject || '')}&body=${encodeURIComponent(emailData.body || '')}`;
      break;
    case 'phone':
      qrContent = `tel:${qrCode.content}`;
      break;
    case 'wifi':
      const wifiData = JSON.parse(qrCode.content);
      qrContent = `WIFI:T:${wifiData.encryption};S:${wifiData.ssid};P:${wifiData.password};H:${wifiData.hidden ? 'true' : 'false'};;`;
      break;
    case 'vcard':
      qrContent = qrCode.content;
      break;
    case 'text':
      qrContent = qrCode.content;
      break;
    default:
      qrContent = qrCode.content;
  }

  QRCode.toCanvas(canvas, qrContent, {
    width: 100,
    margin: 1,
    color: {
      dark: qrCode.color || '#000000',
      light: qrCode.bg_color || '#FFFFFF'
    }
  }, function (error) {
    if (error) console.error('QR generation error:', error);
  });
}

// Render timeline chart
function renderTimelineChart(timeline) {
  const ctx = document.getElementById('timeline-chart').getContext('2d');

  // Prepare data - fill in missing dates with 0
  const last30Days = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    last30Days.push(date.toISOString().split('T')[0]);
  }

  const scansByDate = {};
  timeline.forEach(scan => {
    scansByDate[scan.date.split('T')[0]] = scan.count;
  });

  const chartData = last30Days.map(date => scansByDate[date] || 0);
  const labels = last30Days.map(date => {
    const d = new Date(date);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  });

  if (timelineChart) {
    timelineChart.destroy();
  }

  timelineChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Scans',
        data: chartData,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0
          }
        }
      }
    }
  });
}

// Render country breakdown
function renderCountryBreakdown(countryBreakdown) {
  const container = document.getElementById('country-breakdown');

  if (countryBreakdown.length === 0) {
    container.innerHTML = '<p style="color: var(--text-tertiary); text-align: center; padding: var(--space-lg);">No location data yet</p>';
    return;
  }

  const total = countryBreakdown.reduce((sum, country) => sum + country.count, 0);

  const html = `
    <div style="max-height: 400px; overflow-y: auto;">
      ${countryBreakdown.map((country, index) => {
        const percentage = ((country.count / total) * 100).toFixed(1);
        return `
          <div style="padding: var(--space-sm) 0; border-bottom: 1px solid var(--border-color); ${index === countryBreakdown.length - 1 ? 'border-bottom: none;' : ''}">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-xs);">
              <div style="display: flex; align-items: center; gap: var(--space-sm);">
                <i data-lucide="map-pin" style="width: 14px; height: 14px; color: var(--text-tertiary);"></i>
                <span style="font-weight: var(--font-medium);">${country.country_code || 'Unknown'}</span>
              </div>
              <span style="font-size: var(--text-sm); color: var(--text-secondary);">${formatNumber(country.count)} (${percentage}%)</span>
            </div>
            <div style="background: var(--bg-secondary); height: 6px; border-radius: var(--radius-full); overflow: hidden;">
              <div style="background: linear-gradient(90deg, var(--primary-emerald), var(--primary-emerald-dark)); height: 100%; width: ${percentage}%;"></div>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  container.innerHTML = html;
  lucide.createIcons();
}

// Render device breakdown chart
function renderDeviceChart(deviceBreakdown) {
  const ctx = document.getElementById('device-chart').getContext('2d');

  if (deviceBreakdown.length === 0) {
    ctx.canvas.style.display = 'none';
    ctx.canvas.parentElement.innerHTML += '<p style="color: var(--text-tertiary); text-align: center; padding: var(--space-lg);">No device data yet</p>';
    return;
  }

  const labels = deviceBreakdown.map(d => d.device_type || 'Unknown');
  const data = deviceBreakdown.map(d => d.count);
  const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

  if (deviceChart) {
    deviceChart.destroy();
  }

  deviceChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: colors
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}

// Render browser breakdown chart
function renderBrowserChart(browserBreakdown) {
  const ctx = document.getElementById('browser-chart').getContext('2d');

  if (browserBreakdown.length === 0) {
    ctx.canvas.style.display = 'none';
    ctx.canvas.parentElement.innerHTML += '<p style="color: var(--text-tertiary); text-align: center; padding: var(--space-lg);">No browser data yet</p>';
    return;
  }

  const labels = browserBreakdown.map(b => b.browser || 'Unknown');
  const data = browserBreakdown.map(b => b.count);
  const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6'];

  if (browserChart) {
    browserChart.destroy();
  }

  browserChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: colors
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}

// Render OS breakdown chart
function renderOSChart(osBreakdown) {
  const ctx = document.getElementById('os-chart').getContext('2d');

  if (osBreakdown.length === 0) {
    ctx.canvas.style.display = 'none';
    ctx.canvas.parentElement.innerHTML += '<p style="color: var(--text-tertiary); text-align: center; padding: var(--space-lg);">No OS data yet</p>';
    return;
  }

  const labels = osBreakdown.map(o => o.os || 'Unknown');
  const data = osBreakdown.map(o => o.count);
  const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  if (osChart) {
    osChart.destroy();
  }

  osChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: colors
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}

// Render recent scans table
function renderRecentScans(recentScans) {
  const container = document.getElementById('recent-scans-table');

  if (recentScans.length === 0) {
    container.innerHTML = '<p style="color: var(--text-tertiary); text-align: center; padding: var(--space-lg);">No scans yet</p>';
    return;
  }

  const html = `
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr style="border-bottom: 2px solid var(--border-color);">
          <th style="text-align: left; padding: var(--space-md); font-weight: var(--font-semibold); color: var(--text-secondary); font-size: var(--text-sm);">Time</th>
          <th style="text-align: left; padding: var(--space-md); font-weight: var(--font-semibold); color: var(--text-secondary); font-size: var(--text-sm);">Location</th>
          <th style="text-align: left; padding: var(--space-md); font-weight: var(--font-semibold); color: var(--text-secondary); font-size: var(--text-sm);">Device</th>
          <th style="text-align: left; padding: var(--space-md); font-weight: var(--font-semibold); color: var(--text-secondary); font-size: var(--text-sm);">Browser</th>
          <th style="text-align: left; padding: var(--space-md); font-weight: var(--font-semibold); color: var(--text-secondary); font-size: var(--text-sm);">OS</th>
        </tr>
      </thead>
      <tbody>
        ${recentScans.map((scan, index) => `
          <tr style="border-bottom: 1px solid var(--border-color); ${index === recentScans.length - 1 ? 'border-bottom: none;' : ''}">
            <td style="padding: var(--space-md); font-size: var(--text-sm);">${formatDate(scan.scanned_at)}</td>
            <td style="padding: var(--space-md); font-size: var(--text-sm);">
              ${scan.city && scan.country_code
                ? `${scan.city}, ${scan.country_code}`
                : scan.country_code || 'Unknown'}
            </td>
            <td style="padding: var(--space-md); font-size: var(--text-sm);">
              <span class="badge badge-secondary" style="font-size: var(--text-xs);">${scan.device_type || 'Unknown'}</span>
            </td>
            <td style="padding: var(--space-md); font-size: var(--text-sm);">${scan.browser || 'Unknown'}</td>
            <td style="padding: var(--space-md); font-size: var(--text-sm);">${scan.os || 'Unknown'}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  container.innerHTML = html;
}

// Export CSV handler
exportCsvBtn.addEventListener('click', async () => {
  try {
    const response = await fetch(`/api/analytics/export?qrId=${qrId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qr-analytics-${qrId}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showAlert('CSV exported successfully', 'success');
    } else {
      showAlert('Failed to export CSV', 'error');
    }
  } catch (error) {
    console.error('Export error:', error);
    showAlert('Export failed. Please try again.', 'error');
  }
});

// Load analytics on page load
loadQRAnalytics();
