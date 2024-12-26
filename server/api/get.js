import { connectDB } from "../db";
import Conversation from "../models/Conversation";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const { userID } = query;
  if (!userID) {
    return { status: 400, error: "User ID is required" };
  }

  try {
    await connectDB();

    const conversation = await Conversation.findOne({ userId: userID });

    console.log("Conversation data:", conversation);

    if (!conversation) {
      return { status: 404, message: "No conversation found for this user" };
    }

    return {
      status: 200,
      success: true,
      messages: conversation.conversation,
    };
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return { status: 500, error: "Server error" };
  }
});
