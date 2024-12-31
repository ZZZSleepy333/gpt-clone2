import { H3Event } from "h3";
import bcrypt from "bcrypt";
import { MongoClient } from "mongodb";

export default defineEventHandler(async (event: H3Event) => {
  const config = useRuntimeConfig();
  let client;

  try {
    const body = await readBody(event);

    // Log để debug
    console.log("Config:", {
      mongoUri: config.MONGODB_URI ? "exists" : "missing",
      dbName: config.MONGODB_DB_NAME,
    });
    console.log("Request body:", {
      username: body.username,
      hasPassword: !!body.newPassword,
    });

    if (!body.username || !body.newPassword) {
      return {
        statusCode: 400,
        body: { message: "Username và mật khẩu mới là bắt buộc" },
      };
    }

    client = new MongoClient(config.MONGODB_URI);
    await client.connect();

    const db = client.db(config.MONGODB_DB_NAME);
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({ username: body.username });

    if (!user) {
      return {
        statusCode: 404,
        body: { message: "Người dùng không tồn tại" },
      };
    }

    const hashedPassword = await bcrypt.hash(body.newPassword, 10);

    const result = await usersCollection.updateOne(
      { username: body.username },
      { $set: { password: hashedPassword } }
    );

    return {
      statusCode: 200,
      body: { message: "Đổi mật khẩu thành công" },
    };
  } catch (error: any) {
    console.error("Server error:", {
      message: error.message,
      stack: error.stack,
    });

    return {
      statusCode: 500,
      body: { message: "Có lỗi xảy ra khi đổi mật khẩu" },
    };
  } finally {
    if (client) {
      await client.close();
    }
  }
});
