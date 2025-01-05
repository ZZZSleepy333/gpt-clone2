export const useConversationContext = () => {
  const { messages } = useSendMessage();
  const MAX_HISTORY = 5;

  const getCurrentContext = () => {
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
