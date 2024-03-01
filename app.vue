<script setup lang="ts">
// @ts-ignore
import { registerSW } from 'virtual:pwa-register'
import Toaster from '@/components/ui/toast/Toaster.vue'

const updateSW = registerSW({
  onNeedRefresh() {
    if (!confirm('New version available. Refresh?')) return
    updateSW()
  },
  onOfflineReady() {
    console.log('App is offline-ready now.')
  },
})
</script>
<template>
  <NuxtLayout class="mx-auto min-h-screen" />
  <Toaster />
</template>
