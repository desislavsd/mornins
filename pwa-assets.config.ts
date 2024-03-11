import {
  defineConfig,
  minimal2023Preset,
} from '@vite-pwa/assets-generator/config'

let preset = structuredClone(minimal2023Preset)

;(['maskable', 'apple'] as const).forEach((key) => {
  preset[key].padding = 0.4
})

export default defineConfig({
  preset: {
    ...preset,
  },
  images: ['public/logo.svg'],
})
