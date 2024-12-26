import { connectDB } from "../db";
import Conversation from "../models/Conversation";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const { userID } = query;

  if (!userID) {
    return {
      status: 400,
      body: { error: "User ID is required" },
    };
  }

  try {
    await connectDB();

    const result = await Conversation.deleteOne({ userId: userID });

    if (result.deletedCount === 0) {
      return {
        status: 404,
        body: { message: "No conversation found for this user" },
      };
    }

    return {
      status: 200,
      body: { success: true, message: "Conversation deleted successfully" },
    };
  } catch (error) {
    console.error("Error deleting conversation:", error);
    return {
      status: 500,
      body: { error: "Server error" },
    };
  }
});
