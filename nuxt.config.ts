/* https://nuxt.com/docs/api/configuration/nuxt-config */
import { defineNuxtConfig } from 'nuxt/config'
const fontBase = process.env.NUXT_EVERETT_FONT_URL
export default defineNuxtConfig({
  compatibilityDate: '2026-01-11', // Update to today's date

  app: {
    baseURL: '/',
    head: {
      htmlAttrs: {
        lang: 'en',
      },
      meta: [
        {
          name: 'viewport',
          content: 'width=device-width, initial-scale=1.0, viewport-fit=cover',
        },
      ],
    },
  },

  site: {
    url: 'https://thomasthorstensson.com',
    name: 'Thomas Thorstensson • Portfolio',
    description:
      'Interactive developer crafting bespoke websites focused on motion, design, and UX',
    defaultLocale: 'en',
  },

  gtag: {
    id: 'G-257GERX7EP',
  },

  routeRules: {
    '/blog-post/**': { isr: 3600 },
  },

  /* Enhanced SEO Configuration */
  seo: {
    redirectToCanonicalSiteUrl: true,
  },

  /* Sitemap Configuration */
  sitemap: {
    urls: async () => {
      /* Static pages with SEO optimization - use actual last modified dates */
      const staticPages = [
        {
          loc: '/',
          lastmod: '2026-06-10',
          changefreq: 'monthly',
          priority: 1.0,
        },
        {
          loc: '/about',
          lastmod: '2026-00-05',
          changefreq: 'monthly',
          priority: 0.8,
        },
        {
          loc: '/projects',
          lastmod: '2026-00-05',
          changefreq: 'monthly',
          priority: 0.9,
        },
        {
          loc: '/blog',
          lastmod: '2026-00-05',
          changefreq: 'weekly',
          priority: 0.8,
        },
        {
          loc: '/contact',
          lastmod: '2026-00-05',
          changefreq: 'monthly',
          priority: 0.7,
        },
      ] as any

      return staticPages
    },
    /* Additional sitemap configuration for better SEO */
    defaults: {
      changefreq: 'weekly',
      priority: 0.5,
      lastmod: new Date().toISOString(),
    },
  },

  modules: [
    // State first
    '@pinia/nuxt',
    'pinia-plugin-persistedstate/nuxt', // Utilities
    '@vueuse/nuxt', // UI/Assets
    '@nuxt/fonts',
    '@nuxt/image',
    '@nuxt/icon',
    'nuxt-svgo', // SEO (replaces individual robots/sitemap)
    '@nuxtjs/seo',
    '@nuxtjs/color-mode',
    '@nuxtjs/mdc',
    '@stefanobartoletti/nuxt-social-share',
    'nuxt-gtag', // Analytics
  ],

  fonts: {
    defaults: {
      styles: ['normal'],
      subsets: ['latin'],
    },
    families: [
      {
        name: 'Cascadia Mono',
        provider: 'fontsource',
        weights: ['400 600'],
      },
      {
        name: 'Switzer',
        provider: 'none',
        src: `${fontBase}Switzer-Variable.woff2`,
        weights: ['400 600'],
      },
      {
        name: 'TWK Everett',
        provider: 'none',
        src: `${fontBase}TWKEverett-Regular.woff2`,
        weight: 400,
        style: 'normal',
      },
      {
        name: 'TWK Everett',
        provider: 'none',
        src: `${fontBase}TWKEverett-Medium.woff2`,
        weight: 500,
        style: 'normal',
      },
    ],
  },

  colorMode: {
    preference: 'light',
    fallback: 'light',
  },

  mdc: {
    highlight: {
      shikiEngine: 'javascript',
      theme: {
        default: 'everforest-dark',
        dark: 'everforest-dark',
      },
      langs: [
        'js',
        'javascript',
        'ts',
        'typescript',
        'vue',
        'html',
        'css',
        'scss',
        'bash',
        'json',
      ],
      wrapperStyle: true,
      /* No preload: grammars load on-demand, preventing cold-cache block on all blog posts */
    },
    headings: {
      anchorLinks: false,
    },
  },

  socialShare: {
    baseUrl: 'https://thomasthorstensson.com' /* required! */,
    /* other optional module options */
  },

  vite: {
    optimizeDeps: {
      include: ['@mux/mux-player', 'lenis', 'pixi.js', 'split-type', 'three'],
    },
    build: {
      cssCodeSplit: true,
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "@/assets/scss/global.scss" as *;',
        },
      },
    },
  },

  /* Because mux player is a web component */
  vue: {
    compilerOptions: {
      isCustomElement: (tag) => tag === 'mux-player',
    },
  },

  /* GSAP can do with some transpiling, source to source conversion for SSR */
  build: {
    transpile: ['gsap'],
  },

  svgo: {
    autoImportPath: './assets/svg/',
    defaultImport: 'component',
  },

  /* The secret stays on the server with server/api proxy */
  runtimeConfig: {
    openWeatherApiKey:
      '' /* Will be populated from NUXT_OPEN_WEATHER_API_KEY env var */,
    gqlHost: '' /* Will be populated from NUXT_GQL_HOST env var */,
    public: {},
  },

  /* Hygraph base URL for assets */
  image: {
    provider: 'ipx', // Keep this to protect local/asset images
    providers: {
      hygraph: {
        provider: 'hygraph',
        options: {
          baseURL:
            'https://eu-west-2.graphassets.com/cm4tev3k1008n01uo6egngvzu',
        },
      },
    },
  },

  /* Hygraph fix rate limit when testing*/
  nitro: {
    preset: 'netlify',
    experimental: {
      wasm: false,
    },
  },

  plugins: [
    { src: '@/plugins/gsap.client.ts', mode: 'client' },
    { src: '@/plugins/lenis.client.ts', mode: 'client' },
    { src: '@/plugins/mux.client.ts', mode: 'client' },
  ],

  /* @ts-ignore */
  security: {
    headers: {
      crossOriginEmbedderPolicy: 'credentialless',
      crossOriginOpenerPolicy: 'credentialless',
    },
  },

  robots: {
    blockNonSeoBots: true,
    sitemap: 'https://thomasthorstensson.com/sitemap.xml',
    groups: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
  },

  devtools: { enabled: false },
})
