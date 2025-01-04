export const useConversationContext = () => {
  const conversationHistory = ref([]);
  const currentContext = ref(null);

  const addToHistory = (message) => {
    conversationHistory.value.push({
      ...message,
      timestamp: Date.now(),
    });

    if (conversationHistory.value.length > 10) {
      conversationHistory.value.shift();
    }
  };

  const updateContext = (query) => {
    const contextKeywords = {
      academic: ["học phí", "điểm", "học kỳ", "môn học"],
      admission: ["tuyển sinh", "đăng ký", "xét tuyển"],
      student_life: ["ký túc xá", "câu lạc bộ", "hoạt động"],
    };

    for (const [context, keywords] of Object.entries(contextKeywords)) {
      if (keywords.some((keyword) => query.toLowerCase().includes(keyword))) {
        currentContext.value = context;
        break;
      }
    }
  };

  const getRelevantHistory = () => {
    if (!currentContext.value) return [];

    return conversationHistory.value.filter(
      (msg) => msg.context === currentContext.value
    );
  };

  return {
    conversationHistory,
    currentContext,
    addToHistory,
    updateContext,
    getRelevantHistory,
  };
};
