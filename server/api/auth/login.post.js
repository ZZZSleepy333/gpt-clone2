import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const client = new MongoClient(config.public.mongodbUri);

  try {
    await client.connect();
    const db = client.db("test"); // hoặc config.mongodbName
    const collection = db.collection("users");

    const body = await readBody(event);
    const user = await collection.findOne({ username: body.username });

    if (!user) {
      throw createError({
        statusCode: 401,
        message: "Tài khoản không tồn tại",
      });
    }

    const validPassword = await bcrypt.compare(body.password, user.password);
    if (!validPassword) {
      throw createError({
        statusCode: 401,
        message: "Mật khẩu không đúng",
      });
    }

    return {
      id: user._id,
      username: user.username,
      role: user.role,
    };
  } catch (error) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "Authentication error",
    });
  } finally {
    await client.close();
  }
});
