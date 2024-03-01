import { readFileSync } from 'fs'
import { resolve } from 'path'
import { displayName, description } from './package.json'
import { FileSystemIconLoader } from '@iconify/utils/lib/loader/node-loaders'
const siteUrl = process.env.NUXT_PUBLIC_SITE_URL

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  devtools: { enabled: process.env.NODE_ENV === 'development' },
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
        { property: 'og:url', content: siteUrl },
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: 'Mornins' },
        { property: 'og:description', content: description },
        { property: 'og:image', content: `${siteUrl}/imgs/og.png` },
        { name: 'twitter:card', content: 'summary_large_image' },
        { property: 'twitter:domain', content: 'mornins.com' },
        { property: 'twitter:url', content: siteUrl },
        { name: 'twitter:title', content: 'Mornins' },
        { name: 'twitter:description', content: description },
        { name: 'twitter:image', content: `${siteUrl}/imgs/og.png` },
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
  plugins: ['~/plugins/i18n', '~/plugins/firebase', '~/plugins/auth/index.ts'],
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
      layer: 'base',
      extraProperties: {
        display: 'inline-block',
        'vertical-align': 'middle',
      },
      collections: {
        sigs: FileSystemIconLoader('./assets/imgs/sigs'),
        // sigs: async (iconName) => {
        //   return readFileSync(
        //     resolve(__dirname, `assets/imgs/sigs/${iconName}.svg`)
        //   ).toString()
        // },
        app: {
          logo: readFileSync(resolve(__dirname, 'public/logo.svg')).toString(),
        },
      },
    },
  },
  pwa: {
    registerType: 'prompt',
    workbox: {
      globPatterns: ['**/*.{js,css,html,ico,png,webp,jpg,jpeg,svg}'],
      runtimeCaching: [
        {
          urlPattern: /\.json$/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'json-cache',
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 60 * 24 * 365, // 365 days
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
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
