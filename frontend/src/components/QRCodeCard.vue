<template>
  <div class="qr-card">
    <div class="qr-image">
      <img :src="qrCode.qrCodeData" :alt="qrCode.name" />
    </div>
    <div class="qr-info">
      <h3>{{ qrCode.name }}</h3>
      <p class="qr-url">{{ truncateUrl(qrCode.url) }}</p>
      <div class="qr-stats">
        <span class="stat">
          <strong>{{ qrCode.scanCount }}</strong> scans
        </span>
        <span class="stat" v-if="qrCode.lastScanned">
          Last: {{ formatDate(qrCode.lastScanned) }}
        </span>
      </div>
      <div class="qr-meta">
        <span class="short-code">{{ qrCode.shortCode }}</span>
        <span :class="['status', qrCode.isActive ? 'active' : 'inactive']">
          {{ qrCode.isActive ? 'Active' : 'Inactive' }}
        </span>
      </div>
    </div>
    <div class="qr-actions">
      <router-link :to="`/qrcodes/${qrCode.id}`" class="btn btn-secondary">
        View Details
      </router-link>
      <router-link :to="`/qrcodes/${qrCode.id}/edit`" class="btn btn-primary">
        Edit
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

defineProps({
  qrCode: {
    type: Object,
    required: true
  }
})

const truncateUrl = (url) => {
  return url.length > 40 ? url.substring(0, 40) + '...' : url
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}
</script>

<style scoped>
.qr-card {
  background: var(--card-bg);
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.qr-image {
  display: flex;
  justify-content: center;
  padding: 1rem;
  background: var(--bg-color);
  border-radius: 0.375rem;
}

.qr-image img {
  max-width: 200px;
  height: auto;
}

.qr-info h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.125rem;
  color: var(--text-primary);
}

.qr-url {
  color: var(--text-secondary);
  font-size: 0.875rem;
  margin: 0 0 1rem 0;
  word-break: break-all;
}

.qr-stats {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
}

.stat {
  color: var(--text-secondary);
}

.qr-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.short-code {
  font-family: monospace;
  background: var(--bg-color);
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
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

.qr-actions {
  display: flex;
  gap: 0.75rem;
}

.qr-actions .btn {
  flex: 1;
  justify-content: center;
  text-decoration: none;
}
</style>
