export const useSendMessage = () => {
  const newMessage = ref("");
  const isLoading = ref(false);
  const messages = useState("messages", () => [
    {
      userMessage: "",
      botMessage: {
        title: "",
        link: "",
        snippet: "Xin chào, tôi có thể giúp gì được cho bạn",
      },
    },
  ]);

  const sendMessage = (userMessage, botMessage) => {
    messages.value.push({ userMessage: userMessage, botMessage: botMessage });

    newMessage.value = "";
  };

  const formatDetailedResponse = (query, result) => {
    return {
      mainAnswer: {
        content: result.bestMatch.snippet,
        source: result.bestMatch.link,
        confidence: result.bestMatch.score,
      },
      relatedInfo: {
        category: result.additionalInfo.category,
        relatedQuestions: result.additionalInfo.relatedQuestions,
        suggestedDocs: result.additionalInfo.suggestions,
      },
      metadata: {
        timestamp: Date.now(),
        queryType: determineQueryType(query),
        processingTime: result.processingTime,
      },
      actions: generateSuggestedActions(query, result),
    };
  };

  return { sendMessage, newMessage, messages, isLoading };
};
