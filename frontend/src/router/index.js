import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue'),
    meta: { guestOnly: true }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/qrcodes/create',
    name: 'CreateQRCode',
    component: () => import('../views/CreateQRCode.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/qrcodes/:id',
    name: 'QRCodeDetail',
    component: () => import('../views/QRCodeDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/qrcodes/:id/edit',
    name: 'EditQRCode',
    component: () => import('../views/EditQRCode.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // Initialize auth on first navigation
  if (!authStore.token) {
    authStore.initAuth()
  }

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const guestOnly = to.matched.some(record => record.meta.guestOnly)

  if (requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (guestOnly && authStore.isAuthenticated) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
