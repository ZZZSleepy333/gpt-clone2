import { useFetch } from "#app";

export default defineNuxtPlugin(async (nuxtApp) => {
  await useFetch("/api/upload", {
    method: "POST",
  });
});
