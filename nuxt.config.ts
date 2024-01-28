import { displayName, description } from './package.json'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  devtools: { enabled: false },
  sourcemap: false,
  app: {
    head: {
      title: displayName,
      link: [
        {
          rel: 'apple-touch-icon',
          sizes: '180x180',
          href: '/apple-touch-icon.png',
        },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '32x32',
          href: '/favicon-32x32.png',
        },
        {
          rel: 'icon',
          type: 'image/png',
          sizes: '16x16',
          href: '/favicon-16x16.png',
        },
        { rel: 'manifest', href: '/site.webmanifest' },
        {
          rel: 'mask-icon',
          href: '/safari-pinned-tab.svg',
          color: '#5bbad5',
        },
        {
          rel: 'dns-prefetch',
          href: 'https://fonts.googleapis.com',
        },
        {
          rel: 'dns-prefetch',
          href: 'https://fonts.gstatic.com',
        },
        {
          rel: 'preconnect',
          crossorigin: 'anonymous',
          href: 'https://fonts.googleapis.com',
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: 'anonymous',
        },
        {
          rel: 'stylesheet',
          crossorigin: 'anonymous',
          href: 'https://fonts.googleapis.com/css2?family=Rubik:wght@300;400;700&display=swap',
        },
      ],
      meta: [
        { name: 'description', content: description },
        { name: 'msapplication-TileColor', content: '#ffffff' },
        { name: 'theme-color', content: '#ffffff' },
      ],
    },
  },
  components: [
    {
      path: '~/components/ui',
      extensions: ['.vue'],
      prefix: '',
    },
    {
      path: '~/components',
      extensions: ['.vue', '.tsx'],
      prefix: '',
    },
  ],
  modules: [
    '@unocss/nuxt',
    '@nuxtjs/tailwindcss',
    '@vueuse/nuxt',
    '@nuxtjs/color-mode',
    '@vite-pwa/nuxt',
  ],
  colorMode: {
    classSuffix: '',
    fallback: 'dark',
    storageKey: 'theme',
  },
  unocss: {
    uno: false,
    icons: {
      prefix: 'i-',
      extraProperties: {
        display: 'inline-block',
        'vertical-align': 'middle',
      },
    },
  },
  pwa: {
    registerType: 'prompt',
    workbox: {
      globPatterns: [
        '**/*.{js,css,html,ico,png,webp,jpg,jpeg,svg,zip,txt,json}',
      ],
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts-cache',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 365, // <== 365 days
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
        {
          urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'gstatic-fonts-cache',
            expiration: {
              maxEntries: 10,
              maxAgeSeconds: 60 * 60 * 24 * 365, // <== 365 days
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
      ],
      navigateFallback: '/',
      // additionalManifestEntries: [
      //   { url: '/', revision: new Date().getTime().toString() },
      // ],
    },
    includeAssets: [
      'favicon.ico',
      'apple-touch-icon.png',
      'safari-pinned-tab.svg',
    ],
    manifest: {
      name: displayName,
      short_name: displayName,
      description,
      theme_color: '#ffffff',
      orientation: 'portrait',
      icons: [
        {
          src: 'android-chrome-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: 'android-chrome-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
        {
          src: 'android-chrome-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable',
        },
      ],
    },
    devOptions: {
      enabled: false,
    },
    registerWebManifestInRouteRules: true,
  },
  nitro: {
    prerender: {
      routes: ['/'],
    },
  },
})
