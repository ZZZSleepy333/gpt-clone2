import { ref, watch } from "vue";

export const useUserPreferences = () => {
  const searchHistory = ref([]);
  const userInterests = ref(new Set());
  const categoryPreferences = ref({});

  const updateUserInterests = (query, selectedResult) => {
    const categories = categorizeQuestion(query);

    Object.entries(categories).forEach(([category, score]) => {
      if (score > 0) {
        if (!categoryPreferences.value[category]) {
          categoryPreferences.value[category] = 1;
        } else {
          categoryPreferences.value[category]++;
        }
      }
    });

    searchHistory.value.push({
      query,
      timestamp: Date.now(),
      category: Object.entries(categories).sort(([, a], [, b]) => b - a)[0][0],
    });

    if (searchHistory.value.length > 50) {
      searchHistory.value.shift();
    }
  };

  const getPersonalizedSuggestions = () => {
    const topCategories = Object.entries(categoryPreferences.value)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([category]) => category);

    return topCategories;
  };

  return {
    searchHistory,
    userInterests,
    categoryPreferences,
    updateUserInterests,
    getPersonalizedSuggestions,
  };
};
