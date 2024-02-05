import { createI18n } from 'vue-i18n'

import bg from '@/assets/langs/bg.json'
import en from '@/assets/langs/en.json'

const messages = { 'bg-BG': bg, 'en-US': en } as const

const locale = useLocalStorage<keyof typeof messages>('lang', 'bg-BG')

const datetimeFormats = {
  dayShort: {
    weekday: 'narrow',
  },
  dayLong: {
    weekday: 'long',
  },
  month: {
    month: 'long',
  },
}

export const i18n = createI18n({
  locale: unref(locale), // set locale
  fallbackLocale: 'bg-BG', // set fallback locale
  messages,
  legacy: false,
  datetimeFormats: {
    // @ts-ignore
    'en-US': datetimeFormats,
    'bg-BG': datetimeFormats,
  },
})
export const { t, te, d } = i18n.global

export default defineNuxtPlugin((nuxt) => {
  nuxt.vueApp.use(i18n)
  nuxt.hook('app:mounted', () => {
    watchEffect(() => {
      locale.value = i18n.global.locale.value
    })
  })
  return {
    provide: {},
  }
})
