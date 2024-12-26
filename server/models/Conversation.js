import { MongoClient } from "mongodb";

// Định nghĩa cấu trúc collection (không bắt buộc nhưng giúp code dễ đọc)
const conversationStructure = {
  userId: String, // required, unique
  conversation: [
    {
      userMessage: String,
      botMessage: {
        snippet: String,
        title: String,
        link: String,
      },
    },
  ],
};

export default conversationStructure;
