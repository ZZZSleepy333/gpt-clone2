import { HfInference } from "@huggingface/inference";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();

  if (!config.huggingFaceApiKey) {
    throw createError({
      statusCode: 500,
      message: "HuggingFace API key is not configured",
    });
  }

  try {
    const hf = new HfInference(config.huggingFaceApiKey);
    const { text } = await readBody(event);

    const maxRetries = 3;
    let lastError = null;

    for (let i = 0; i < maxRetries; i++) {
      try {
        const embedding = await hf.featureExtraction({
          model: "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
          inputs: text,
        });
        return embedding;
      } catch (error) {
        lastError = error;
        console.error(`Attempt ${i + 1} failed:`, error);

        if (
          error.message.includes("Please log in") ||
          error.message.includes("unauthorized")
        ) {
          throw error;
        }

        await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
      }
    }

    throw lastError;
  } catch (error) {
    console.error("Embedding API error:", error);
    throw createError({
      statusCode: 500,
      message: error.message || "Error generating embedding",
    });
  }
});
