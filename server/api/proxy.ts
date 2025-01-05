import axios from "axios";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const url = query.url;

  if (!url) {
    return createError({
      statusCode: 400,
      message: "URL parameter is required",
    });
  }

  try {
    const response = await axios.get(url as string, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });
    return response.data;
  } catch (error: any) {
    return createError({
      statusCode: error.response?.status || 500,
      message: error.message,
    });
  }
});
