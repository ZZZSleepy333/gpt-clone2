import { MongoClient, ObjectId } from "mongodb";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const client = new MongoClient(config.public.mongodbUri);
  const id = event.context.params?.id;

  try {
    await client.connect();
    const db = client.db("test");
    const collection = db.collection("users");

    await collection.deleteOne({ _id: new ObjectId(id) });
    return { success: true };
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: "Database error",
    });
  } finally {
    await client.close();
  }
});
