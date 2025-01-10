// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from "nuxt/config";
import { resolve } from "path";
export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: false },

  alias: {
    "@": resolve(__dirname, "/"),
  },

  css: [
    "~/assets/main.css",
    "@fortawesome/fontawesome-free/css/all.min.css",
    "animate.css/animate.min.css",
  ],

  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  ssr: false,

  modules: [
    "@nuxt/content",
    "@nuxt/icon",

    "@nuxt/ui",
    "nuxt-swiper",
    "@pinia/nuxt",
    "@nuxt/image",
  ],
  runtimeConfig: {
    mongoUri: process.env.MONGODB_URI,
    dbName: process.env.MONGODB_DB_NAME || "test",
    serpAPI: process.env.SERP_API_KEY,
    huggingFaceApiKey: process.env.HUGGING_FACE_API_KEY,
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE,
      mongodbUri: process.env.MONGODB_URI,
      openaiApiKey: process.env.OPENAI_API_KEY,
    },
  },
  app: {
    head: {
      link: [
        {
          rel: "search",
          href: "https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css",
        },
        { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
      ],
    },
  },
  nitro: {
    moduleSideEffects: ["nuxt-server-utils", "mongoose"],
    externals: {
      inline: ["@nuxt/kit"],
    },
  },
  build: {
    transpile: ["@huggingface/inference"],
  },
});
