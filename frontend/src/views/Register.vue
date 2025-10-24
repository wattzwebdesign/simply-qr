<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="card auth-card">
        <h1>Create Account</h1>
        <p class="subtitle">Start creating QR codes today</p>

        <form @submit.prevent="handleRegister">
          <div class="input-group">
            <label for="username">Username</label>
            <input
              id="username"
              v-model="credentials.username"
              type="text"
              placeholder="Choose a username"
              required
            />
          </div>

          <div class="input-group">
            <label for="email">Email</label>
            <input
              id="email"
              v-model="credentials.email"
              type="email"
              placeholder="your@email.com"
              required
            />
          </div>

          <div class="input-group">
            <label for="password">Password</label>
            <input
              id="password"
              v-model="credentials.password"
              type="password"
              placeholder="Min 8 chars with uppercase, number, symbol"
              required
            />
            <small>Must contain uppercase, lowercase, number, and special character</small>
          </div>

          <div v-if="authStore.error" class="error-message">
            {{ authStore.error }}
          </div>

          <button
            type="submit"
            class="btn btn-primary btn-block"
            :disabled="authStore.loading"
          >
            {{ authStore.loading ? 'Creating account...' : 'Register' }}
          </button>
        </form>

        <p class="auth-footer">
          Already have an account?
          <router-link to="/login">Login here</router-link>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const credentials = ref({
  username: '',
  email: '',
  password: ''
})

const handleRegister = async () => {
  const result = await authStore.register(credentials.value)
  if (result.success) {
    router.push('/dashboard')
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.auth-container {
  width: 100%;
  max-width: 400px;
}

.auth-card {
  text-align: center;
}

.auth-card h1 {
  margin: 0 0 0.5rem 0;
  color: var(--primary-color);
}

.subtitle {
  color: var(--text-secondary);
  margin: 0 0 2rem 0;
}

.auth-card form {
  text-align: left;
}

.input-group small {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.btn-block {
  width: 100%;
  justify-content: center;
  margin-top: 1rem;
}

.auth-footer {
  margin-top: 1.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.auth-footer a {
  color: var(--primary-color);
  text-decoration: none;
  font-weight: 500;
}

.auth-footer a:hover {
  text-decoration: underline;
}
</style>
