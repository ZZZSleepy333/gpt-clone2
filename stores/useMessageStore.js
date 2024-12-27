import { defineStore } from "pinia";
import axios from "axios";

export const useMessageStore = defineStore("messageStore", {
  state: () => ({
    messages: [],
    conversation: [],
  }),
  actions: {
    async deleteConversationByUserID() {
      const userID = localStorage.getItem("chatId");

      if (!userID) {
        console.error("User ID is not available");
        return;
      }

      try {
        const response = await axios.delete("/api/delete", {
          params: { userID: userID },
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });

        console.log(response);

        if (response.data.success) {
          console.log("Conversation deleted successfully");
          this.messages = [];
        } else {
          console.error("Error deleting conversation:", response.data.message);
        }
      } catch (error) {
        console.error("API delete error:", error);
      }
    },
    async fetchMessagesByUserID() {
      const userID = localStorage.getItem("chatId");
      console.log("Fetching messages for userID:", userID);

      if (!userID) {
        console.error("User ID is not available");
        return;
      }

      try {
        const response = await axios.get("/api/get", {
          params: { userID: userID },
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });

        // Log full response for debugging
        console.log("API Response:", response);

        if (response.data.success) {
          this.messages = response.data.messages;
          console.log("Fetched messages:", this.messages);
        } else {
          console.error("Error details:", response.data);
          throw new Error(response.data.error || "Unknown server error");
        }
      } catch (error) {
        console.error(
          "API fetch error:",
          error.response?.data || error.message
        );
        throw error;
      }
    },

    async saveConversation(content) {
      const conversationId = localStorage.getItem("chatId");
      const conversationData = content;

      console.log(conversationId, conversationData);

      try {
        const { data, error } = await useFetch("/api/conversation", {
          method: "POST",
          body: JSON.stringify({ conversationId, conversationData }),
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (error.value) {
          throw new Error(error.value);
        }

        this.conversation = data.value.conversation;
        return data.value;
      } catch (err) {
        console.error("Lỗi khi gọi API:", err);
        return { success: false, error: "Không thể cập nhật hội thoại" };
      }
    },
  },
});
