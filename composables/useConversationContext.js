export const useConversationContext = () => {
  const { messages } = useSendMessage();
  const MAX_HISTORY = 5;

  // Cập nhật context từ messages
  const getCurrentContext = () => {
    // Lấy tối đa MAX_HISTORY tin nhắn gần nhất
    const recentMessages = messages.value.slice(-MAX_HISTORY);

    return recentMessages
      .map(
        (msg) =>
          `User: ${msg.userMessage}\nAssistant: ${msg.botMessage.snippet}`
      )
      .join("\n");
  };

  return {
    messages,
    getCurrentContext,
  };
};
