// Global Analytics functionality

// Check authentication
const token = localStorage.getItem('token');
if (!token) {
  window.location.href = '/login';
}

// Elements
const loadingState = document.getElementById('loading-state');
const analyticsContent = document.getElementById('analytics-content');
const alertContainer = document.getElementById('alert-container');

// Chart instances
let scansChart = null;
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

// Load and render analytics
async function loadAnalytics() {
  try {
    const response = await fetch('/api/analytics/overview', {
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
      renderAnalytics(data.analytics);
      loadingState.style.display = 'none';
      analyticsContent.style.display = 'block';
    } else {
      showAlert('Failed to load analytics', 'error');
    }
  } catch (error) {
    console.error('Load analytics error:', error);
    showAlert('Network error. Please refresh.', 'error');
  }
}

// Render analytics data
function renderAnalytics(analytics) {
  // Update summary cards
  document.getElementById('total-scans').textContent = formatNumber(analytics.totalScans);
  document.getElementById('active-qr-codes').textContent = formatNumber(analytics.activeQRCodes);
  document.getElementById('scans-this-month').textContent = formatNumber(analytics.scansThisMonth);

  // Render scans over time chart
  renderScansChart(analytics.scansOverTime);

  // Render top QR codes table
  renderTopQRCodes(analytics.topQRCodes);

  // Render country breakdown
  renderCountryBreakdown(analytics.countryBreakdown);

  // Render device breakdown
  renderDeviceChart(analytics.deviceBreakdown);

  // Render browser breakdown
  renderBrowserChart(analytics.browserBreakdown);

  // Render OS breakdown
  renderOSChart(analytics.osBreakdown);
}

// Render scans over time chart
function renderScansChart(scansOverTime) {
  const ctx = document.getElementById('scans-chart').getContext('2d');

  // Prepare data - fill in missing dates with 0
  const last30Days = [];
  const today = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    last30Days.push(date.toISOString().split('T')[0]);
  }

  const scansByDate = {};
  scansOverTime.forEach(scan => {
    scansByDate[scan.date.split('T')[0]] = scan.count;
  });

  const chartData = last30Days.map(date => scansByDate[date] || 0);
  const labels = last30Days.map(date => {
    const d = new Date(date);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  });

  if (scansChart) {
    scansChart.destroy();
  }

  scansChart = new Chart(ctx, {
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

// Render top QR codes table
function renderTopQRCodes(topQRCodes) {
  const container = document.getElementById('top-qr-codes');

  if (topQRCodes.length === 0) {
    container.innerHTML = '<p style="color: var(--text-tertiary); text-align: center; padding: var(--space-lg);">No QR codes yet</p>';
    return;
  }

  const html = `
    <div style="max-height: 400px; overflow-y: auto;">
      ${topQRCodes.map((qr, index) => `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: var(--space-md); border-bottom: 1px solid var(--border-color); ${index === topQRCodes.length - 1 ? 'border-bottom: none;' : ''}">
          <div style="flex: 1; min-width: 0;">
            <div style="font-weight: var(--font-medium); margin-bottom: var(--space-xs); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(qr.name)}</div>
            <div style="font-size: var(--text-sm); color: var(--text-secondary);">
              <span class="badge badge-${qr.type}" style="font-size: var(--text-xs);">${qr.type.toUpperCase()}</span>
            </div>
          </div>
          <div style="text-align: right; margin-left: var(--space-md);">
            <div style="font-size: var(--text-xl); font-weight: var(--font-bold); color: var(--primary-emerald);">${formatNumber(qr.scan_count)}</div>
            <div style="font-size: var(--text-xs); color: var(--text-tertiary);">scans</div>
          </div>
          <a href="/qr-analytics/${qr.id}" class="btn btn-secondary btn-sm" style="margin-left: var(--space-md);">
            <i data-lucide="bar-chart-2" style="width: 14px; height: 14px;"></i>
            View
          </a>
        </div>
      `).join('')}
    </div>
  `;

  container.innerHTML = html;
  lucide.createIcons();
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

// Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Load analytics on page load
loadAnalytics();
