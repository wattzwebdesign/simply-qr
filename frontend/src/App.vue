<template>
  <div id="app">
    <AppHeader v-if="isAuthenticated" />
    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from './stores/auth'
import AppHeader from './components/AppHeader.vue'

const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.isAuthenticated)
</script>

<style scoped>
main {
  min-height: calc(100vh - 64px);
}
</style>
