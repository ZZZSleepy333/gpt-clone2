import Conversation from "../models/Conversation.js";
export default defineEventHandler(async (event) => {
  const { conversationId, conversationData } = await readBody(event);

  try {
    console.log("Received conversationId:", conversationId);
    console.log("Received conversationData:", conversationData);

    const updatedConversation = await Conversation.findOneAndUpdate(
      { userId: conversationId },
      { $set: { conversation: conversationData } },
      { upsert: true, new: true }
    );

    return { success: true, conversation: updatedConversation };
  } catch (error) {
    console.error("Lỗi khi cập nhật hoặc tạo mới:", error);
    return { success: false, error: "Không thể cập nhật hội thoại" };
  }
});
