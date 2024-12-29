import { MongoClient, ObjectId } from "mongodb";

interface MongoError {
  message: string;
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const client = new MongoClient(config.mongoUri);
  const id = event.context.params?.id;

  try {
    await client.connect();
    const db = client.db(config.dbName);
    const collection = db.collection("qas");

    await collection.deleteOne({ _id: new ObjectId(id) });
    return { success: true };
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
