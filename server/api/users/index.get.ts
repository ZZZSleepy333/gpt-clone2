import { MongoClient } from "mongodb";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const client = new MongoClient(config.public.mongodbUri);

  try {
    await client.connect();
    const db = client.db("test");
    const collection = db.collection("users");

    const users = await collection
      .find({}, { projection: { password: 0 } })
      .toArray();
    return users;
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: "Database error",
    });
  } finally {
    await client.close();
  }
});
