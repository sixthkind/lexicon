// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  devtools: { enabled: true },
  css: [
    "~/assets/css/main.css",
    "~/assets/css/components.css",
    "~/assets/css/markdown.css",
    "~/assets/css/animate.css",
    "@fontsource/quicksand/400.css", 
    "@fontsource/quicksand/700.css"
  ],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },

  modules: [
    "@vueform/nuxt",
    "@nuxt/ui"
  ],

  colorMode: {
    preference: 'light'
  },

  runtimeConfig: {
    public: {
      environment: process.env.VITE_ENVIRONMENT,
      pocketbaseURL: process.env.VITE_POCKETBASE_URL,
      openrouterApiKey: process.env.VITE_OPENROUTER_API_KEY,
      appName: 'project-6',
      appURL: 'http://localhost:3000'
    }
  },

  compatibilityDate: "2024-10-16"
});