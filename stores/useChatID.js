import { defineStore } from "pinia";
import { ref } from "vue";
export const useChatIDStore = defineStore("chatId", {
  state: () => ({
    chatId: "",
  }),
  actions: {
    createNewChatId() {
      const newId = crypto.randomUUID();
      this.chatId = newId;
      localStorage.setItem("chatId", newId);
    },
    getChatId() {
      this.chatId = localStorage.getItem("chatId") || null;
      return chatId;
    },
  },
});
