import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Computed
  const isAuthenticated = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.isAdmin || false)

  // Initialize from localStorage
  function initAuth() {
    const storedToken = localStorage.getItem('auth_token')
    const storedUser = localStorage.getItem('user')

    if (storedToken && storedUser) {
      token.value = storedToken
      user.value = JSON.parse(storedUser)
    }
  }

  // Register
  async function register(credentials) {
    loading.value = true
    error.value = null

    try {
      const response = await api.post('/auth/register', credentials)
      const { token: authToken, user: userData } = response.data

      token.value = authToken
      user.value = userData

      localStorage.setItem('auth_token', authToken)
      localStorage.setItem('user', JSON.stringify(userData))

      return { success: true }
    } catch (err) {
      error.value = err.response?.data?.error || 'Registration failed'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // Login
  async function login(credentials) {
    loading.value = true
    error.value = null

    try {
      const response = await api.post('/auth/login', credentials)
      const { token: authToken, user: userData } = response.data

      token.value = authToken
      user.value = userData

      localStorage.setItem('auth_token', authToken)
      localStorage.setItem('user', JSON.stringify(userData))

      return { success: true }
    } catch (err) {
      error.value = err.response?.data?.error || 'Login failed'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  // Logout
  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
  }

  // Get current user profile
  async function fetchProfile() {
    loading.value = true
    error.value = null

    try {
      const response = await api.get('/auth/me')
      user.value = response.data.user
      localStorage.setItem('user', JSON.stringify(response.data.user))
      return { success: true }
    } catch (err) {
      error.value = err.response?.data?.error || 'Failed to fetch profile'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    initAuth,
    register,
    login,
    logout,
    fetchProfile
  }
})
