import { readFileSync } from 'fs'
import { resolve } from 'path'
import { displayName, description } from './package.json'
import { FileSystemIconLoader } from '@iconify/utils/lib/loader/node-loaders'
const siteUrl = process.env.NUXT_PUBLIC_SITE_URL

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  devtools: { enabled: process.env.NODE_ENV === 'development' },
  runtimeConfig: {
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL,
    },
  },
  sourcemap: false,
  app: {
    head: {
      title: displayName,
      link: [
        {
          rel: 'icon',
          href: '/favicon.ico',
          sizes: 'any',
        },
        {
          rel: 'icon',
          href: '/logo.svg',
          type: 'image/svg+xml',
        },
        {
          rel: 'apple-touch-icon',
          href: '/apple-touch-icon-180x180.png',
        },
        { rel: 'manifest', href: '/manifest.webmanifest' },
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
        { property: 'og:title', content: displayName },
        { property: 'og:description', content: description },
        { property: 'og:image', content: `${siteUrl}/imgs/og.png` },
        { name: 'twitter:card', content: 'summary_large_image' },
        {
          property: 'twitter:domain',
          content: siteUrl?.replace(/^https?\/+/, ''),
        },
        { property: 'twitter:url', content: siteUrl },
        { name: 'twitter:title', content: displayName },
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
  plugins: [
    '~/plugins/i18n',
    '~/plugins/pwa',
    '~/plugins/firebase',
    '~/plugins/auth/index.ts',
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
      layer: 'base',
      extraProperties: {
        display: 'inline-block',
        'vertical-align': 'middle',
      },
      collections: {
        sigs: FileSystemIconLoader('./assets/imgs/sigs'),
        app: {
          logo: readFileSync(resolve(__dirname, 'public/logo.svg')).toString(),
        },
      },
    },
  },
  pwa: {
    registerType: 'prompt',
    injectManifest: {
      globPatterns: ['**/*.{js,css,html,ico,png,webp,jpg,jpeg,svg}'],
    },
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
    manifest: {
      name: displayName,
      short_name: displayName,
      description,
      theme_color: '#ffffff',
      orientation: 'portrait',
      icons: [
        {
          src: 'pwa-64x64.png',
          sizes: '64x64',
          type: 'image/png',
        },
        {
          src: 'pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: 'pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
        {
          src: 'maskable-icon-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
      ],
    },
    registerWebManifestInRouteRules: true,
  },
  nitro: {
    prerender: {
      routes: ['/'],
    },
  },
})
