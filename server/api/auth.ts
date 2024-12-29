import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

const uri = process.env.MONGODB_URI || " ";
const dbName = process.env.MONGODB_DB_NAME;

export default defineEventHandler(async (event) => {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("users");

    if (event.method === "POST") {
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
    }
  } catch (error: any) {
    console.error("Auth error:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "Authentication error",
    });
  } finally {
    await client.close();
  }
});
