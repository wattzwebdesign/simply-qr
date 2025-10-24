<template>
  <div class="create-page">
    <div class="container">
      <div class="page-header">
        <h1>Create New QR Code</h1>
        <router-link to="/dashboard" class="btn btn-secondary">
          Back to Dashboard
        </router-link>
      </div>

      <div class="create-form-container">
        <form @submit.prevent="handleCreate" class="card">
          <div class="input-group">
            <label for="name">QR Code Name *</label>
            <input
              id="name"
              v-model="formData.name"
              type="text"
              placeholder="My Website QR Code"
              required
            />
            <small>Give your QR code a descriptive name</small>
          </div>

          <div class="input-group">
            <label for="url">Target URL *</label>
            <input
              id="url"
              v-model="formData.url"
              type="url"
              placeholder="https://example.com"
              required
            />
            <small>The URL users will be redirected to when they scan the QR code</small>
          </div>

          <div class="customization-section">
            <h3>Customization (Optional)</h3>

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
                    placeholder="#000000"
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
                    placeholder="#ffffff"
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
              <small>Recommended: 300-500 pixels</small>
            </div>
          </div>

          <div v-if="error" class="error-message">
            {{ error }}
          </div>

          <div v-if="success" class="success-message">
            QR code created successfully! Redirecting...
          </div>

          <button
            type="submit"
            class="btn btn-primary btn-block"
            :disabled="loading"
          >
            {{ loading ? 'Creating...' : 'Create QR Code' }}
          </button>
        </form>

        <div class="preview-container card">
          <h3>Preview</h3>
          <div class="preview" :style="{ backgroundColor: formData.backgroundColor }">
            <div class="preview-placeholder">
              <p>QR code preview will appear here after creation</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'

const router = useRouter()

const formData = ref({
  name: '',
  url: '',
  backgroundColor: '#ffffff',
  foregroundColor: '#000000',
  size: 300
})

const loading = ref(false)
const error = ref(null)
const success = ref(false)

const handleCreate = async () => {
  loading.value = true
  error.value = null
  success.value = false

  try {
    const response = await api.post('/qrcodes', formData.value)
    success.value = true
    setTimeout(() => {
      router.push(`/qrcodes/${response.data.qrCode.id}`)
    }, 1000)
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to create QR code'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.create-page {
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

.create-form-container {
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
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-color);
}

.preview-placeholder {
  text-align: center;
  color: var(--text-secondary);
}

@media (max-width: 1024px) {
  .create-form-container {
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
