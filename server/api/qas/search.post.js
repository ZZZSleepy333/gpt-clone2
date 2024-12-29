import { MongoClient } from "mongodb";

export default defineEventHandler(async (event) => {
  let client;
  try {
    const config = useRuntimeConfig();
    console.log("Attempting to connect to MongoDB...");

    // Log connection string (remove in production)
    console.log("MongoDB URI:", config.mongoUri);

    client = new MongoClient(config.mongoUri);

    // Đảm bảo kết nối được thiết lập
    console.log("Establishing connection...");
    await client.connect();
    console.log("Connected successfully");

    const db = client.db("chatbot");
    const collection = db.collection("qas");

    const body = await readBody(event);
    const { query } = body;

    console.log("Received query:", query);

    if (!query) {
      throw new Error("Query is required");
    }

    // Thực hiện tìm kiếm
    console.log("Executing search...");
    const results = await collection
      .find({
        $or: [
          { question: { $regex: query, $options: "i" } },
          { keyword: { $regex: query, $options: "i" } },
        ],
      })
      .toArray();

    console.log("Search results:", results.length);

    return results;
  } catch (error) {
    console.error("Detailed error:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });

    throw createError({
      statusCode: 500,
      statusMessage: `Database error: ${error.message}`,
    });
  } finally {
    // Đảm bảo luôn đóng kết nối
    if (client) {
      console.log("Closing connection...");
      await client.close();
    }
  }
});
