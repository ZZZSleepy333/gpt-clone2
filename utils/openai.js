import OpenAI from "openai";
const config = useRuntimeConfig();

const openai = new OpenAI({
  apiKey: config.public.openaiApiKey,
  dangerouslyAllowBrowser: true,
});

export default openai;
