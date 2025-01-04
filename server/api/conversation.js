import { MongoClient } from "mongodb";

export default defineEventHandler(async (event) => {
  const { conversationId, conversationData } = await readBody(event);

  try {
    const client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db("test");
    const collection = db.collection("conversations");

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
