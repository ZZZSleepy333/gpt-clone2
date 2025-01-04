import { MongoClient, ObjectId } from "mongodb";
import bcrypt from "bcryptjs";

interface MongoError {
  message: string;
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const client = new MongoClient(config.mongoUri);
  const id = event.context.params?.id;

  try {
    const body = await readBody(event);
    await client.connect();
    const db = client.db(config.dbName);
    const collection = db.collection("users");

    const user = await collection.findOne({ _id: new ObjectId(id) });
    if (!user) {
      throw createError({
        statusCode: 404,
        message: "Không tìm thấy người dùng",
      });
    }

    const validPassword = await bcrypt.compare(
      body.currentPassword,
      user.password
    );
    if (!validPassword) {
      throw createError({
        statusCode: 400,
        message: "Mật khẩu hiện tại không đúng",
      });
    }

    const hashedPassword = await bcrypt.hash(body.newPassword, 10);
    await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { password: hashedPassword } }
    );

    return { success: true };
  } catch (error: any) {
    const mongoError = error as MongoError;
    console.error("MongoDB Error:", mongoError);
    throw createError({
      statusCode: error?.statusCode || 500,
      message: mongoError.message || "Database error",
    });
  } finally {
    await client.close();
  }
});
