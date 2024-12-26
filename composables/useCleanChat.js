import { useFiltering } from "./useFiltering";
import { useSendMessage } from "~/composables/useSendMessage.js";

export const useCleanChat = () => {
  const { sendMessage, messages } = useSendMessage();
  function clearChat() {
    messages.value = [];
    sendMessage("", {
      snippet: "Xin chào, hôm nay tôi có thể giúp gì cho bạn?" || "",
      title: "",
      link: "",
    });
  }
  return { clearChat };
};
