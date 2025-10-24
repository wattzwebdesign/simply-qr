<template>
  <header class="app-header">
    <div class="container">
      <div class="header-content">
        <div class="logo">
          <h1>Simply QR</h1>
        </div>
        <nav class="nav">
          <router-link to="/dashboard" class="nav-link">Dashboard</router-link>
          <router-link to="/qrcodes/create" class="nav-link">Create QR</router-link>
          <div class="user-menu">
            <span class="username">{{ authStore.user?.username }}</span>
            <button @click="handleLogout" class="btn btn-secondary">Logout</button>
          </div>
        </nav>
      </div>
    </div>
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.app-header {
  background: white;
  border-bottom: 1px solid var(--border-color);
  padding: 1rem 0;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo h1 {
  font-size: 1.5rem;
  color: var(--primary-color);
  margin: 0;
}

.nav {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.nav-link {
  text-decoration: none;
  color: var(--text-secondary);
  font-weight: 500;
  transition: color 0.2s;
}

.nav-link:hover {
  color: var(--primary-color);
}

.nav-link.router-link-active {
  color: var(--primary-color);
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.username {
  color: var(--text-primary);
  font-weight: 500;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 1rem;
  }

  .nav {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
