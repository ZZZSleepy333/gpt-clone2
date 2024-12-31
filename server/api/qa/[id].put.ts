import { MongoClient, ObjectId } from "mongodb";

interface MongoError {
  message: string;
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const client = new MongoClient(config.mongoUri);
  const id = event.context.params?.id;
  const user = JSON.parse(getHeaders(event).authorization || "{}");

  console.log("User object:", user);
  console.log("Authorization header:", getHeaders(event).authorization);
  console.log("Parsed user object:", user);
  console.log("User displayName:", user.displayName);

  try {
    await client.connect();
    const db = client.db(config.dbName);
    const collection = db.collection("qas");

    const body = await readBody(event);

    await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...body,
          updatedBy: user.displayName,
          updatedAt: new Date(),
        },
      }
    );

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
