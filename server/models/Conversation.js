import { MongoClient } from "mongodb";

const conversationStructure = {
  userId: String,
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
