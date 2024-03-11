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

export default defineNuxtPlugin(() => {})
