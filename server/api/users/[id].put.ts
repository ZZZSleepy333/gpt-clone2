import { MongoClient, ObjectId } from "mongodb";
import bcrypt from "bcryptjs";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const client = new MongoClient(config.public.mongodbUri);
  const id = event.context.params?.id;

  try {
    await client.connect();
    const db = client.db("test");
    const collection = db.collection("users");

    const body = await readBody(event);
    const updateData = { ...body };

    // Chỉ hash password nếu có thay đổi password
    if (body.password) {
      updateData.password = await bcrypt.hash(body.password, 10);
    } else {
      delete updateData.password;
    }

    await collection.updateOne({ _id: new ObjectId(id) }, { $set: updateData });

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
