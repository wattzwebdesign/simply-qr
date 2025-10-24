import axios from 'axios'

// Detect environment
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'

// Set base URL
const baseURL = isDevelopment
  ? import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
  : window.location.origin

// For nginx environments, check if we need to use api.php proxy
const isNginxEnv = !isDevelopment && window.location.hostname.includes('.1wp.site')

const api = axios.create({
  baseURL: isNginxEnv ? `${baseURL}/api.php` : `${baseURL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // For nginx proxy, adjust the URL
    if (isNginxEnv && config.url) {
      config.params = { ...config.params, endpoint: config.url }
      config.url = ''
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
      window.location.href = '/#/login'
    }
    return Promise.reject(error)
  }
)

export default api
