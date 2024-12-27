import { MongoClient } from "mongodb";

export default defineEventHandler(async (event) => {
  const { conversationId, conversationData } = await readBody(event);

  try {
    //console.log("Received conversationId:", conversationId);
    //console.log("Received conversationData:", conversationData);

    // Kết nối đến MongoDB
    const client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db("test");
    const collection = db.collection("conversations");

    // Thực hiện update với MongoDB native driver
    const result = await collection.findOneAndUpdate(
      { userId: conversationId },
      { $set: { conversation: conversationData } },
      { upsert: true, returnDocument: "after" }
    );

    await client.close();

    return {
      success: true,
      conversation: result.value,
    };
  } catch (error) {
    console.error("Lỗi khi cập nhật hoặc tạo mới:", error);
    return { success: false, error: "Không thể cập nhật hội thoại" };
  }
});
