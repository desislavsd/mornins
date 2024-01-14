<script setup lang="ts">
// @ts-ignore
import { registerSW } from 'virtual:pwa-register'
const updateSW = registerSW({
  onNeedRefresh() {
    if (!confirm('New version available. Refresh?')) return
    updateSW()
  },
  onOfflineReady() {
    console.log('App is offline-ready now.')
  },
})
import Toaster from '@/components/ui/toast/Toaster.vue'
</script>
<template>
  <NuxtLayout class="max-w-lg mx-auto" />
  <Toaster />
</template>
