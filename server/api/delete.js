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

    const result = await db
      .collection("conversations")
      .deleteOne({ userId: userID });

    await client.close();

    if (result.deletedCount === 0) {
      return { status: 404, message: "No conversation found for this user" };
    }

    return {
      status: 200,
      success: true,
      message: "Conversation deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting conversation:", error);
    return { status: 500, error: "Server error" };
  }
});
