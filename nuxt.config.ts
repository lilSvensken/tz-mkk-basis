export default defineNuxtConfig({
  modules: ['@pinia/nuxt', '@nuxt/eslint'],

  ssr: false,

  devtools: { enabled: true },

  app: {
    head: {
      htmlAttrs: { lang: 'ru' },
      title: 'Заметки',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Заметки со списками задач' },
        { name: 'theme-color', content: '#4f46e5' },
      ],
    },
  },

  css: ['~/assets/styles/main.scss'],
  compatibilityDate: '2026-11-01',

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "~/assets/styles/abstracts" as *;\n',
        },
      },
    },
  },

  typescript: {
    strict: true,
    typeCheck: false,
  },

  eslint: {
    config: {
      stylistic: {
        semi: false,
        quotes: 'single',
        commaDangle: 'always-multiline',
      },
    },
  },
})
