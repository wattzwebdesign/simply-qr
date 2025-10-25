<template>
  <div id="app">
    <AppHeader />
    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { useAuthStore } from './stores/auth'
import AppHeader from './components/AppHeader.vue'

const authStore = useAuthStore()
// Initialize auth on app load
authStore.initAuth()
</script>

<style scoped>
main {
  min-height: calc(100vh - 64px);
}
</style>
