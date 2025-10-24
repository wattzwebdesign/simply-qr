<template>
  <div class="edit-page">
    <div class="container">
      <div v-if="loading && !qrCode" class="loading">Loading QR code...</div>

      <div v-else-if="error && !qrCode" class="error-message">{{ error }}</div>

      <div v-else-if="qrCode">
        <div class="page-header">
          <h1>Edit QR Code</h1>
          <router-link :to="`/qrcodes/${qrCode.id}`" class="btn btn-secondary">
            Cancel
          </router-link>
        </div>

        <div class="edit-form-container">
          <form @submit.prevent="handleUpdate" class="card">
            <div class="input-group">
              <label for="name">QR Code Name *</label>
              <input
                id="name"
                v-model="formData.name"
                type="text"
                required
              />
            </div>

            <div class="input-group">
              <label for="url">Target URL *</label>
              <input
                id="url"
                v-model="formData.url"
                type="url"
                required
              />
              <small>Changing the URL will regenerate the QR code</small>
            </div>

            <div class="input-group">
              <label>
                <input
                  v-model="formData.isActive"
                  type="checkbox"
                />
                Active
              </label>
              <small>Inactive QR codes will not redirect when scanned</small>
            </div>

            <div class="customization-section">
              <h3>Customization</h3>

              <div class="color-group">
                <div class="input-group">
                  <label for="fgColor">Foreground Color</label>
                  <div class="color-input">
                    <input
                      id="fgColor"
                      v-model="formData.foregroundColor"
                      type="color"
                    />
                    <input
                      v-model="formData.foregroundColor"
                      type="text"
                    />
                  </div>
                </div>

                <div class="input-group">
                  <label for="bgColor">Background Color</label>
                  <div class="color-input">
                    <input
                      id="bgColor"
                      v-model="formData.backgroundColor"
                      type="color"
                    />
                    <input
                      v-model="formData.backgroundColor"
                      type="text"
                    />
                  </div>
                </div>
              </div>

              <div class="input-group">
                <label for="size">Size (pixels)</label>
                <input
                  id="size"
                  v-model.number="formData.size"
                  type="number"
                  min="100"
                  max="1000"
                  step="50"
                />
              </div>
              <small>Changing customization will regenerate the QR code</small>
            </div>

            <div v-if="updateError" class="error-message">
              {{ updateError }}
            </div>

            <div v-if="success" class="success-message">
              QR code updated successfully!
            </div>

            <button
              type="submit"
              class="btn btn-primary btn-block"
              :disabled="loading"
            >
              {{ loading ? 'Updating...' : 'Update QR Code' }}
            </button>
          </form>

          <div class="preview-container card">
            <h3>Current QR Code</h3>
            <div class="preview">
              <img :src="qrCode.qrCodeData" :alt="qrCode.name" />
            </div>
            <p class="preview-note">Preview will update after saving changes</p>
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
const formData = ref({
  name: '',
  url: '',
  backgroundColor: '#ffffff',
  foregroundColor: '#000000',
  size: 300,
  isActive: true
})

const loading = ref(false)
const error = ref(null)
const updateError = ref(null)
const success = ref(false)

const loadQRCode = async () => {
  loading.value = true
  error.value = null

  try {
    const response = await api.get(`/qrcodes/${route.params.id}`)
    qrCode.value = response.data.qrCode

    // Populate form
    formData.value = {
      name: qrCode.value.name,
      url: qrCode.value.url,
      backgroundColor: qrCode.value.backgroundColor,
      foregroundColor: qrCode.value.foregroundColor,
      size: qrCode.value.size,
      isActive: qrCode.value.isActive
    }
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to load QR code'
  } finally {
    loading.value = false
  }
}

const handleUpdate = async () => {
  loading.value = true
  updateError.value = null
  success.value = false

  try {
    const response = await api.put(`/qrcodes/${route.params.id}`, formData.value)
    qrCode.value = response.data.qrCode
    success.value = true
    setTimeout(() => {
      router.push(`/qrcodes/${route.params.id}`)
    }, 1000)
  } catch (err) {
    updateError.value = err.response?.data?.error || 'Failed to update QR code'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadQRCode()
})
</script>

<style scoped>
.edit-page {
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

.edit-form-container {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;
}

.input-group small {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.input-group label input[type="checkbox"] {
  width: auto;
  margin-right: 0.5rem;
}

.customization-section {
  border-top: 1px solid var(--border-color);
  padding-top: 1.5rem;
  margin-top: 1.5rem;
}

.customization-section h3 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
}

.color-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.color-input {
  display: flex;
  gap: 0.5rem;
}

.color-input input[type="color"] {
  width: 50px;
  height: 40px;
  border: 1px solid var(--border-color);
  border-radius: 0.375rem;
  cursor: pointer;
}

.color-input input[type="text"] {
  flex: 1;
}

.btn-block {
  width: 100%;
  justify-content: center;
  margin-top: 1.5rem;
}

.preview-container {
  position: sticky;
  top: 2rem;
  height: fit-content;
}

.preview-container h3 {
  margin: 0 0 1rem 0;
}

.preview {
  border-radius: 0.375rem;
  padding: 2rem;
  background: var(--bg-color);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-color);
}

.preview img {
  max-width: 100%;
  height: auto;
}

.preview-note {
  margin-top: 1rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
  text-align: center;
}

@media (max-width: 1024px) {
  .edit-form-container {
    grid-template-columns: 1fr;
  }

  .preview-container {
    position: static;
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .color-group {
    grid-template-columns: 1fr;
  }
}
</style>
