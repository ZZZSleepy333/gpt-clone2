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
    const collection = db.collection("reports");

    const method = event.method;

    if (method === "GET") {
      const reports = await collection.find().sort({ createdAt: -1 }).toArray();
      return reports;
    }

    if (method === "POST") {
      const body = await readBody(event);
      const result = await collection.insertOne({
        ...body,
        status: "pending",
        createdAt: new Date(),
      });

      return { success: true, id: result.insertedId };
    }
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
