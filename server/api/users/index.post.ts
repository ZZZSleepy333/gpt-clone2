import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

interface MongoError {
  message: string;
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const client = new MongoClient(config.mongoUri);

  try {
    await client.connect();
    const db = client.db(config.dbName);
    const collection = db.collection("users");

    const body = await readBody(event);

    // Kiểm tra username đã tồn tại chưa
    const existingUser = await collection.findOne({ username: body.username });
    if (existingUser) {
      throw createError({
        statusCode: 400,
        message: "Tên đăng nhập đã tồn tại, vui lòng chọn tên khác",
      });
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);

    const result = await collection.insertOne({
      username: body.username,
      displayName: body.displayName,
      password: hashedPassword,
      role: body.role,
      createdAt: new Date(),
    });

    return { success: true, id: result.insertedId };
  } catch (error: any) {
    // Nếu là lỗi từ createError, trả về nguyên vẹn
    if (error.statusCode) {
      throw error;
    }
    // Nếu là lỗi MongoDB, xử lý như cũ
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
