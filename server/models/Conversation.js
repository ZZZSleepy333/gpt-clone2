import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
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
});

const Conversation = mongoose.model("Conversation", conversationSchema);
export default Conversation;
