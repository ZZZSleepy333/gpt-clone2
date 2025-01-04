import { H3Event } from "h3";
import bcrypt from "bcrypt";
import { MongoClient } from "mongodb";

export default defineEventHandler(async (event: H3Event) => {
  const config = useRuntimeConfig();
  let client;

  try {
    const body = await readBody(event);

    if (!config.mongoUri) {
      throw createError({
        statusCode: 500,
        message: "Thiếu cấu hình kết nối database",
      });
    }

    if (!body.username || !body.newPassword) {
      throw createError({
        statusCode: 400,
        message: "Tên đăng nhập và mật khẩu mới là bắt buộc",
      });
    }

    if (body.newPassword.length < 6) {
      throw createError({
        statusCode: 400,
        message: "Mật khẩu phải có ít nhất 6 ký tự",
      });
    }

    client = await MongoClient.connect(config.mongoUri);
    const db = client.db(config.dbName);
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({ username: body.username });

    console.log("User:", user);

    if (!user) {
      return createError({
        statusCode: 404,
        message: "Không tìm thấy tài khoản với tên đăng nhập này",
      });
    }

    const hashedPassword = await bcrypt.hash(body.newPassword, 10);

    console.log("Attempting to update password for user:", body.username);

    const result = await usersCollection.updateOne(
      { username: body.username },
      { $set: { password: hashedPassword } }
    );

    console.log("Update result:", {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      acknowledged: result.acknowledged,
    });

    if (result.modifiedCount === 0) {
      return createError({
        statusCode: 400,
        message: "Không thể cập nhật mật khẩu. Vui lòng thử lại sau",
      });
    }

    return {
      message: "Đổi mật khẩu thành công",
    };
  } catch (error: any) {
    console.error("Reset password error:", error);

    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "Lỗi hệ thống không xác định",
    });
  } finally {
    if (client) {
      await client.close();
    }
  }
});
