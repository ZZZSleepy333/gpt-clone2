import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const client = new MongoClient(config.public.mongodbUri);

  try {
    await client.connect();
    const db = client.db("test");
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

    const userData = {
      id: user._id,
      username: user.username,
      displayName: user.displayName,
      role: user.role,
    };

    event.context.userData = userData;

    return userData;
  } catch (error) {
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "Authentication error",
    });
  } finally {
    await client.close();
  }
});
