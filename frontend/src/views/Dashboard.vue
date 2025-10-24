<template>
  <div class="dashboard-page">
    <div class="container">
      <div class="page-header">
        <h1>My QR Codes</h1>
        <router-link to="/qrcodes/create" class="btn btn-primary">
          + Create New QR Code
        </router-link>
      </div>

      <div class="search-bar">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search QR codes by name or URL..."
          @input="handleSearch"
        />
      </div>

      <div v-if="loading" class="loading">
        Loading QR codes...
      </div>

      <div v-else-if="error" class="error-message">
        {{ error }}
      </div>

      <div v-else-if="qrCodes.length === 0" class="empty-state">
        <p>No QR codes found.</p>
        <router-link to="/qrcodes/create" class="btn btn-primary">
          Create your first QR code
        </router-link>
      </div>

      <div v-else class="grid grid-2">
        <QRCodeCard
          v-for="qrCode in qrCodes"
          :key="qrCode.id"
          :qrCode="qrCode"
        />
      </div>

      <div v-if="pagination.totalPages > 1" class="pagination">
        <button
          class="btn btn-secondary"
          :disabled="pagination.page === 1"
          @click="loadPage(pagination.page - 1)"
        >
          Previous
        </button>
        <span class="page-info">
          Page {{ pagination.page }} of {{ pagination.totalPages }}
        </span>
        <button
          class="btn btn-secondary"
          :disabled="pagination.page === pagination.totalPages"
          @click="loadPage(pagination.page + 1)"
        >
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'
import QRCodeCard from '../components/QRCodeCard.vue'

const qrCodes = ref([])
const loading = ref(false)
const error = ref(null)
const searchQuery = ref('')
const pagination = ref({
  page: 1,
  limit: 12,
  total: 0,
  totalPages: 0
})

const loadQRCodes = async (page = 1, search = '') => {
  loading.value = true
  error.value = null

  try {
    const response = await api.get('/qrcodes', {
      params: {
        page,
        limit: pagination.value.limit,
        search
      }
    })

    qrCodes.value = response.data.qrCodes
    pagination.value = response.data.pagination
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to load QR codes'
  } finally {
    loading.value = false
  }
}

const loadPage = (page) => {
  loadQRCodes(page, searchQuery.value)
}

let searchTimeout
const handleSearch = () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    loadQRCodes(1, searchQuery.value)
  }, 500)
}

onMounted(() => {
  loadQRCodes()
})
</script>

<style scoped>
.dashboard-page {
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

.search-bar {
  margin-bottom: 2rem;
}

.search-bar input {
  width: 100%;
  max-width: 500px;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 0.375rem;
  font-size: 0.875rem;
}

.search-bar input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-state p {
  margin-bottom: 1.5rem;
  color: var(--text-secondary);
  font-size: 1.125rem;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.page-info {
  color: var(--text-secondary);
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
}
</style>
