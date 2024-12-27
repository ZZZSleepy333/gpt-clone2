import { MongoClient } from "mongodb";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const { userID } = query;
  if (!userID) {
    return { status: 400, error: "User ID is required" };
  }

  try {
    const client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db(process.env.MONGODB_DB_NAME);

    const conversation = await db
      .collection("conversations")
      .findOne({ userId: userID });

    console.log("Conversation data:", conversation);

    if (!conversation) {
      return { status: 404, message: "No conversation found for this user" };
    }

    await client.close();

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
