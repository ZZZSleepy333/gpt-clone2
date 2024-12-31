import { MongoClient } from "mongodb";

interface MongoError {
  message: string;
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const client = new MongoClient(config.mongoUri);
  const user = JSON.parse(getHeaders(event).authorization || "{}");

  try {
    await client.connect();
    const db = client.db(config.dbName);
    const collection = db.collection("qas");

    const body = await readBody(event);

    // Ensure keyword is an array
    if (typeof body.keyword === "string") {
      body.keyword = body.keyword.split(",").map((k: any) => k.trim());
    }

    const result = await collection.insertOne({
      ...body,
      createdBy: user.displayName,

      createdAt: new Date(),
      updatedBy: user.displayName,

      updatedAt: new Date(),
    });

    return { success: true, id: result.insertedId };
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
