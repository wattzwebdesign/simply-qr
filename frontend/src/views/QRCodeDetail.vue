<template>
  <div class="detail-page">
    <div class="container">
      <div v-if="loading" class="loading">Loading QR code details...</div>

      <div v-else-if="error" class="error-message">{{ error }}</div>

      <div v-else-if="qrCode">
        <div class="page-header">
          <h1>{{ qrCode.name }}</h1>
          <div class="header-actions">
            <router-link :to="`/qrcodes/${qrCode.id}/edit`" class="btn btn-primary">
              Edit
            </router-link>
            <button @click="handleDelete" class="btn btn-danger">
              Delete
            </button>
            <router-link to="/dashboard" class="btn btn-secondary">
              Back
            </router-link>
          </div>
        </div>

        <div class="detail-grid">
          <div class="qr-display card">
            <h3>QR Code</h3>
            <div class="qr-image-large">
              <img :src="qrCode.qrCodeData" :alt="qrCode.name" />
            </div>
            <button @click="downloadQR" class="btn btn-primary btn-block">
              Download QR Code
            </button>
          </div>

          <div class="qr-details card">
            <h3>Details</h3>
            <div class="detail-item">
              <label>Target URL:</label>
              <a :href="qrCode.url" target="_blank" rel="noopener">{{ qrCode.url }}</a>
            </div>
            <div class="detail-item">
              <label>Short Code:</label>
              <code>{{ qrCode.shortCode }}</code>
            </div>
            <div class="detail-item">
              <label>Status:</label>
              <span :class="['status', qrCode.isActive ? 'active' : 'inactive']">
                {{ qrCode.isActive ? 'Active' : 'Inactive' }}
              </span>
            </div>
            <div class="detail-item">
              <label>Created:</label>
              <span>{{ formatDate(qrCode.createdAt) }}</span>
            </div>
            <div class="detail-item">
              <label>Last Updated:</label>
              <span>{{ formatDate(qrCode.updatedAt) }}</span>
            </div>
            <div class="detail-item">
              <label>Total Scans:</label>
              <span class="scan-count">{{ qrCode.scanCount }}</span>
            </div>
            <div class="detail-item" v-if="qrCode.lastScanned">
              <label>Last Scanned:</label>
              <span>{{ formatDate(qrCode.lastScanned) }}</span>
            </div>
          </div>

          <div class="qr-customization card">
            <h3>Customization</h3>
            <div class="detail-item">
              <label>Size:</label>
              <span>{{ qrCode.size }}px</span>
            </div>
            <div class="detail-item">
              <label>Foreground Color:</label>
              <div class="color-display">
                <div class="color-swatch" :style="{ backgroundColor: qrCode.foregroundColor }"></div>
                <span>{{ qrCode.foregroundColor }}</span>
              </div>
            </div>
            <div class="detail-item">
              <label>Background Color:</label>
              <div class="color-display">
                <div class="color-swatch" :style="{ backgroundColor: qrCode.backgroundColor }"></div>
                <span>{{ qrCode.backgroundColor }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../services/api'

const route = useRoute()
const router = useRouter()

const qrCode = ref(null)
const loading = ref(false)
const error = ref(null)

const loadQRCode = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await api.get(`/qrcodes/${route.params.id}`)
    qrCode.value = response.data.qrCode
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to load QR code'
  } finally {
    loading.value = false
  }
}

const handleDelete = async () => {
  if (!confirm('Are you sure you want to delete this QR code? This action cannot be undone.')) {
    return
  }

  try {
    await api.delete(`/qrcodes/${route.params.id}`)
    router.push('/dashboard')
  } catch (err) {
    alert(err.response?.data?.error || 'Failed to delete QR code')
  }
}

const downloadQR = () => {
  const link = document.createElement('a')
  link.download = `${qrCode.value.name}.png`
  link.href = qrCode.value.qrCodeData
  link.click()
}

const formatDate = (date) => {
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}

onMounted(() => {
  loadQRCode()
})
</script>

<style scoped>
.detail-page {
  padding: 2rem 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.detail-grid {
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 1.5rem;
}

.card h3 {
  margin: 0 0 1.5rem 0;
  font-size: 1.125rem;
}

.qr-image-large {
  display: flex;
  justify-content: center;
  padding: 2rem;
  background: var(--bg-color);
  border-radius: 0.375rem;
  margin-bottom: 1.5rem;
}

.qr-image-large img {
  max-width: 100%;
  height: auto;
}

.btn-block {
  width: 100%;
  justify-content: center;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border-color);
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-item label {
  font-weight: 500;
  color: var(--text-secondary);
}

.detail-item a {
  color: var(--primary-color);
  text-decoration: none;
}

.detail-item a:hover {
  text-decoration: underline;
}

.detail-item code {
  background: var(--bg-color);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-family: monospace;
  font-size: 0.875rem;
}

.status {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.status.active {
  background: #d1fae5;
  color: #065f46;
}

.status.inactive {
  background: #fee2e2;
  color: #991b1b;
}

.scan-count {
  font-weight: 600;
  color: var(--primary-color);
  font-size: 1.125rem;
}

.color-display {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.color-swatch {
  width: 24px;
  height: 24px;
  border-radius: 0.25rem;
  border: 1px solid var(--border-color);
}

@media (max-width: 1024px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .header-actions {
    width: 100%;
    flex-wrap: wrap;
  }
}
</style>
