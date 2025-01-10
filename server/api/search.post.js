import axios from "axios";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const { query } = await readBody(event);

  const response = await axios.get("https://serpapi.com/search", {
    params: {
      q: query,
      engine: "duckduckgo",
      api_key: config.serpAPI,
      kl: "vn-vi",
    },
    headers: {
      Accept: "application/json",
    },
  });

  return response.data;
});
