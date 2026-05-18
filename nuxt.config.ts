// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // ─── Nuxt 4 App Directory ───────────────────────────────────────────────
  future: { compatibilityVersion: 4 },

  experimental: {
    appManifest: false,
  },

  // ─── Route Rules (Hybrid Rendering) ───────────────────────────────────────
  routeRules: {
    // 1. Static Pages (Prerendered saat build time)
    '/about-us': { prerender: true },
    '/contact-us': { prerender: true },
    '/help-faqs': { prerender: true },
    '/privacy-policy': { prerender: true },
    '/terms': { prerender: true },
    '/auth/**': { prerender: true },
    '/discussions': { prerender: true },
    '/discussions/group': { prerender: true },
    '/tools': { prerender: true },

    // 2. Client-Side Only (Meringankan beban server untuk halaman privat)
    '/profile/**': { ssr: false },
    '/setting/**': { ssr: false },
    '/security/**': { ssr: false },
    '/messages/**': { ssr: false },
    '/history/**': { ssr: false },
    '/update/**': { ssr: false },

    // 3. SSR dengan SWR / Caching (Opsional)
    '/food-prices/**': { swr: 3600 },
    '/weathers/**': { swr: 1800 },
  },

  // ─── Modules ─────────────────────────────────────────────────────────────
  modules: [
    '@nuxt/ui',
    '@nuxt/image',
    '@nuxt/fonts',
    '@nuxt/content',
    '@nuxtjs/supabase',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    '@nuxtjs/seo',
    '@vite-pwa/nuxt',
  ],

  // ─── CSS ──────────────────────────────────────────────────────────────────
  css: ['~/assets/css/main.css'],

  // ─── Supabase ─────────────────────────────────────────────────────────────
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
    secretKey: process.env.SUPABASE_SECRET_KEY,
    types: '~/types/database.types.ts',
    redirectOptions: {
      login: '/auth/login',
      callback: '/auth/callback',
      include: ['/profile', '/profile/'],
    },
  },

  // ─── @nuxt/image ──────────────────────────────────────────────────────────
  image: {
    quality: 85,
    format: ['webp', 'avif'],
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      '2xl': 1536,
    },
  },

  // ─── @nuxt/fonts ──────────────────────────────────────────────────────────
  fonts: {
    families: [
      { name: 'Inter', provider: 'google' },
      { name: 'Plus Jakarta Sans', provider: 'google' },
    ],
  },

  // ─── SEO (@nuxtjs/seo) ────────────────────────────────────────────────────
  site: {
    url: process.env.NUXT_SITE_URL || 'https://jurutani.com',
    name: 'JuruTani',
    description: 'Platform penyuluhan pertanian digital untuk petani Indonesia.',
    defaultLocale: 'id',
  },

  // ─── PWA (@vite-pwa/nuxt) ────────────────────────────────────────────────
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'JuruTani',
      short_name: 'JuruTani',
      description: 'Platform penyuluhan pertanian digital Indonesia',
      theme_color: '#16a34a',
      background_color: '#f0fdf4',
      display: 'standalone',
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
    },
    workbox: {
      navigateFallback: null,
      globPatterns: ['**/*.{js,css,html,png,webp,svg,ico}'],
    },
    client: {
      installPrompt: true,
    },
  },

  // ─── Runtime Config ───────────────────────────────────────────────────────
  runtimeConfig: {
    supabaseServiceKey: process.env.SUPABASE_SECRET_KEY,
    geminiApiKey: process.env.NUXT_GEMINI_API_KEY,
    groqApiKey: process.env.NUXT_GROQ_API_KEY,
    openrouterApiKey: process.env.NUXT_OPENROUTER_API_KEY,
    openweatherApiKey: process.env.NUXT_OPENWEATHER_API_KEY,
    openweatherBaseUrl: process.env.NUXT_OPENWEATHER_BASE_URL,
    public: {
      siteUrl: process.env.NUXT_SITE_URL || 'https://jurutani.com',
    },
  },

  // ─── TypeScript ───────────────────────────────────────────────────────────
  typescript: {
    strict: true,
    typeCheck: false, // aktifkan setelah semua types selesai
  },

  // ─── Vite ─────────────────────────────────────────────────────────────────
  vite: {
    optimizeDeps: {
      include: ['chart.js', 'vue-chartjs', 'dayjs', 'leaflet', 'vee-validate', 'zod'],
    },
  },
})
