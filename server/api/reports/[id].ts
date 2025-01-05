import { MongoClient, ObjectId } from "mongodb";

interface MongoError {
  message: string;
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const client = new MongoClient(config.mongoUri);
  const id = getRouterParam(event, "id");

  if (!id) {
    throw createError({
      statusCode: 400,
      message: "Missing ID parameter",
    });
  }

  try {
    await client.connect();
    const db = client.db(config.dbName);
    const collection = db.collection("reports");
    const body = await readBody(event);

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { status: body.status } },
      { returnDocument: "after" }
    );

    if (!result?.value) {
      throw createError({
        statusCode: 404,
        message: "Report not found",
      });
    }

    return result?.value;
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
