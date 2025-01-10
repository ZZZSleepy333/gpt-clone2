import { MongoClient, ObjectId } from "mongodb";

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

    if (event.method === "PUT") {
      const body = await readBody(event);

      if (!body.status || !["pending", "resolved"].includes(body.status)) {
        throw createError({
          statusCode: 400,
          message: "Invalid status value",
        });
      }

      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(id) },
        {
          $set: {
            status: body.status,
            updatedAt: new Date(),
          },
        },
        { returnDocument: "after" }
      );

      if (!result) {
        throw createError({
          statusCode: 404,
          message: "Report not found",
        });
      }

      return result;
    }

    if (event.method === "DELETE") {
      const report = await collection.findOne({ _id: new ObjectId(id) });

      if (!report) {
        throw createError({
          statusCode: 404,
          message: "Report not found",
        });
      }

      if (report.status !== "resolved") {
        throw createError({
          statusCode: 400,
          message: "Can only delete resolved reports",
        });
      }

      const result = await collection.findOneAndDelete({
        _id: new ObjectId(id),
      });

      return { message: "Report deleted successfully" };
    }

    throw createError({
      statusCode: 405,
      message: "Method not allowed",
    });
  } catch (error: any) {
    console.error("MongoDB Error:", error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      message: error.message || "Internal Server Error",
    });
  } finally {
    await client.close();
  }
});
