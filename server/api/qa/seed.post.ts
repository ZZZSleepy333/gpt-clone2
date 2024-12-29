import { MongoClient } from "mongodb";

interface MongoError {
  message: string;
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const client = new MongoClient(config.mongoUri);

  try {
    await client.connect();
    const db = client.db(config.dbName);
    const collection = db.collection("qas");

    // Kiểm tra xem đã có dữ liệu chưa
    const existingQAs = await collection.countDocuments();
    if (existingQAs === 0) {
      const sampleData = [
        {
          question: "Làm thế nào để đặt lịch hẹn?",
          answer:
            "Bạn có thể đặt lịch hẹn bằng cách gọi số hotline hoặc đặt lịch trực tiếp trên website.",
          keyword: ["đặt lịch", "lịch hẹn", "booking"],
          createdBy: "admin",
          createdAt: new Date(),
          updatedBy: "admin",
          updatedAt: new Date(),
        },
        {
          question: "Thời gian làm việc của công ty?",
          answer:
            "Công ty làm việc từ 8h00 - 17h30 các ngày từ thứ 2 đến thứ 6, sáng thứ 7 từ 8h00 - 12h00.",
          keyword: ["giờ làm việc", "thời gian", "working hours"],
          createdBy: "admin",
          createdAt: new Date(),
          updatedBy: "admin",
          updatedAt: new Date(),
        },
        {
          question: "Chính sách bảo hành như thế nào?",
          answer:
            "Sản phẩm được bảo hành 12 tháng kể từ ngày mua. Vui lòng giữ hóa đơn để được hỗ trợ bảo hành.",
          keyword: ["bảo hành", "warranty", "chính sách"],
          createdBy: "admin",
          createdAt: new Date(),
          updatedBy: "admin",
          updatedAt: new Date(),
        },
      ];

      await collection.insertMany(sampleData);
      return { message: "Đã tạo dữ liệu mẫu thành công" };
    }

    return { message: "Dữ liệu mẫu đã tồn tại" };
  } catch (error: any) {
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
