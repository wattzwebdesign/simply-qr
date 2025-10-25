<template>
  <div class="home-page">
    <div class="container">
      <div class="hero">
        <h1>Create Your QR Code</h1>
        <p>Generate custom QR codes instantly - no account required!</p>
      </div>

      <div class="create-section">
        <div class="card form-card">
          <h2>QR Code Details</h2>

          <form @submit.prevent="handleCreate">
            <div class="input-group">
              <label for="name">Name</label>
              <input
                id="name"
                v-model="formData.name"
                type="text"
                placeholder="My QR Code"
                required
              />
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
              <small>Where users will be redirected when they scan the QR code</small>
            </div>

            <div class="customization">
              <h3>Customize (Optional)</h3>

              <div class="color-row">
                <div class="input-group">
                  <label for="fgColor">QR Color</label>
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
                  <label for="bgColor">Background</label>
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
                <label for="size">Size: {{ formData.size }}px</label>
                <input
                  id="size"
                  v-model.number="formData.size"
                  type="range"
                  min="200"
                  max="800"
                  step="50"
                />
              </div>
            </div>

            <div v-if="error" class="error-message">
              {{ error }}
            </div>

            <button
              type="submit"
              class="btn btn-primary btn-large"
              :disabled="loading"
            >
              {{ loading ? 'Generating...' : 'Generate QR Code' }}
            </button>
          </form>

          <div v-if="!authStore.isAuthenticated" class="account-notice">
            <p>💡 <router-link to="/register">Create an account</router-link> to save and manage your QR codes!</p>
          </div>
        </div>

        <div v-if="qrCode" class="card result-card">
          <h2>Your QR Code</h2>

          <div class="qr-display">
            <img :src="qrCode.qrCodeData" :alt="qrCode.name" />
          </div>

          <div class="qr-info">
            <p><strong>{{ qrCode.name }}</strong></p>
            <p class="url">{{ qrCode.url }}</p>
          </div>

          <button @click="downloadQR" class="btn btn-primary btn-block">
            Download QR Code
          </button>

          <div v-if="!saved" class="save-notice">
            <p>⚠️ This QR code is not saved. <router-link to="/register">Create an account</router-link> to save it!</p>
          </div>

          <button @click="resetForm" class="btn btn-secondary btn-block">
            Create Another
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import api from '../services/api'

const authStore = useAuthStore()

const formData = ref({
  name: '',
  url: '',
  backgroundColor: '#ffffff',
  foregroundColor: '#000000',
  size: 300
})

const loading = ref(false)
const error = ref(null)
const qrCode = ref(null)
const saved = ref(false)

const handleCreate = async () => {
  loading.value = true
  error.value = null
  qrCode.value = null

  try {
    const response = await api.post('/qrcodes', formData.value)
    qrCode.value = response.data.qrCode
    saved.value = response.data.saved || false
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to create QR code'
  } finally {
    loading.value = false
  }
}

const downloadQR = () => {
  const link = document.createElement('a')
  link.download = `${qrCode.value.name.replace(/[^a-z0-9]/gi, '_')}.png`
  link.href = qrCode.value.qrCodeData
  link.click()
}

const resetForm = () => {
  qrCode.value = null
  saved.value = false
  formData.value = {
    name: '',
    url: '',
    backgroundColor: '#ffffff',
    foregroundColor: '#000000',
    size: 300
  }
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  padding: 2rem 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.hero {
  text-align: center;
  color: white;
  margin-bottom: 3rem;
}

.hero h1 {
  font-size: 3rem;
  margin: 0 0 1rem 0;
}

.hero p {
  font-size: 1.25rem;
  opacity: 0.9;
}

.create-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.form-card,
.result-card {
  background: white;
}

.form-card h2,
.result-card h2 {
  margin: 0 0 1.5rem 0;
  color: var(--text-primary);
}

.customization {
  border-top: 1px solid var(--border-color);
  padding-top: 1.5rem;
  margin-top: 1.5rem;
}

.customization h3 {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  color: var(--text-secondary);
}

.color-row {
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

.btn-large {
  padding: 0.875rem 1.5rem;
  font-size: 1rem;
  width: 100%;
  justify-content: center;
  margin-top: 1.5rem;
}

.account-notice {
  margin-top: 1.5rem;
  padding: 1rem;
  background: #f0f9ff;
  border-radius: 0.375rem;
  text-align: center;
}

.account-notice p {
  margin: 0;
  color: var(--text-secondary);
}

.account-notice a {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 600;
}

.account-notice a:hover {
  text-decoration: underline;
}

.qr-display {
  display: flex;
  justify-content: center;
  padding: 2rem;
  background: var(--bg-color);
  border-radius: 0.375rem;
  margin-bottom: 1.5rem;
}

.qr-display img {
  max-width: 100%;
  height: auto;
}

.qr-info {
  margin-bottom: 1.5rem;
  text-align: center;
}

.qr-info p {
  margin: 0.5rem 0;
}

.qr-info .url {
  color: var(--text-secondary);
  font-size: 0.875rem;
  word-break: break-all;
}

.btn-block {
  width: 100%;
  justify-content: center;
  margin-bottom: 0.75rem;
}

.save-notice {
  padding: 1rem;
  background: #fff7ed;
  border-radius: 0.375rem;
  margin: 1.5rem 0;
  text-align: center;
}

.save-notice p {
  margin: 0;
  color: #9a3412;
  font-size: 0.875rem;
}

.save-notice a {
  color: #ea580c;
  text-decoration: none;
  font-weight: 600;
}

.save-notice a:hover {
  text-decoration: underline;
}

@media (max-width: 1024px) {
  .create-section {
    grid-template-columns: 1fr;
  }

  .hero h1 {
    font-size: 2rem;
  }

  .color-row {
    grid-template-columns: 1fr;
  }
}
</style>
