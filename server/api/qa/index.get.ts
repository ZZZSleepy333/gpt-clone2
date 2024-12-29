import { MongoClient } from "mongodb";

interface MongoError {
  message: string;
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const client = new MongoClient(config.mongoUri);

  try {
    await client.connect();
    const db = client.db(config.dbName);
    const collection = db.collection("qas");

    // Trả về tất cả các trường, bao gồm thông tin người tạo/cập nhật
    const qas = await collection.find({}).sort({ createdAt: -1 }).toArray();

    return qas;
  } catch (error: any) {
    const mongoError = error as MongoError;
    console.error("MongoDB Error:", mongoError);
    throw createError({
      statusCode: 500,
      message: mongoError.message || "Database error",
    });
  } finally {
    await client.close();
  }
});
