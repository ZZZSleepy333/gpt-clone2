import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const client = new MongoClient(config.public.mongodbUri);

  try {
    await client.connect();
    const db = client.db("test");
    const collection = db.collection("users");

    // Kiểm tra xem đã có dữ liệu chưa
    const existingUsers = await collection.countDocuments();
    if (existingUsers === 0) {
      // Tạo dữ liệu mẫu
      const sampleData = [
        {
          username: "admin",
          displayName: "Quản trị viên",
          password: await bcrypt.hash("admin123", 10),
          role: "manager",
        },
        {
          username: "staff1",
          displayName: "Nhân viên 1",
          password: await bcrypt.hash("123456", 10),
          role: "staff",
        },
        {
          username: "staff2",
          displayName: "Nhân viên 2",
          password: await bcrypt.hash("123456", 10),
          role: "staff",
        },
      ];

      await collection.insertMany(sampleData);
      return { message: "Đã tạo dữ liệu mẫu thành công" };
    }

    return { message: "Dữ liệu mẫu đã tồn tại" };
  } catch (error) {
    throw createError({
      statusCode: 500,
      message: "Lỗi khi tạo dữ liệu mẫu",
    });
  } finally {
    await client.close();
  }
});
