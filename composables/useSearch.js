import axios from "axios";

export const useSearch = () => {
  const searchGoogle = async (query) => {
    try {
      // Gọi API nội bộ
      const response = await axios.get("/api/search", {
        params: { q: query }, // Truyền tham số query
      });
      console.log("Thành công");
      return response;
    } catch (error) {
      console.error("Error fetching search results:", error);
      throw error;
    }
  };

  return { searchGoogle };
};
