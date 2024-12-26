import { useSendMessage } from "~/composables/useSendMessage.js";
import axios from "axios";
import stringSimilarity from "string-similarity";
import { useRuntimeConfig } from "nuxt/app";

export const useFiltering = () => {
  const { sendMessage } = useSendMessage();

  const findBestSnippet = (query, snippets) => {
    // Kiểm tra đầu vào
    if (!snippets || !Array.isArray(snippets) || snippets.length === 0) {
      console.log("No valid snippets found");
      return null;
    }

    // Tiền xử lý văn bản tiếng Việt
    const preprocessText = (text) => {
      if (!text) return "";

      return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Bỏ dấu
        .replace(/[^\w\s]/g, "") // Bỏ ký tự đặc biệt
        .replace(/\s+/g, " ") // Chuẩn hóa khoảng trắng
        .trim();
    };

    // Danh sách stopwords tiếng Việt
    const stopwords = new Set([
      "của",
      "và",
      "các",
      "có",
      "được",
      "cho",
      "trong",
      "với",
      "để",
      "những",
      "một",
      "là",
      "này",
      "từ",
      "đến",
      "theo",
      "về",
      "như",
      "không",
      "phải",
      "tại",
      "trên",
      "đã",
      "đang",
      "sẽ",
      "khi",
      "bởi",
      "vì",
      "nếu",
      "làm",
      "bị",
      "rằng",
      "còn",
      "có thể",
      "cần",
      "hay",
    ]);

    // Loại bỏ stopwords
    const removeStopwords = (text) => {
      return text
        .split(" ")
        .filter((word) => !stopwords.has(word))
        .join(" ");
    };

    // Xử lý query và snippets
    const processedQuery = removeStopwords(preprocessText(query));
    let maxSimilarity = -1;
    let bestMatchIndex = -1;

    // Kiểm tra stringSimilarity tồn tại
    if (!stringSimilarity) {
      console.error("stringSimilarity is not defined");
      return null;
    }

    snippets.forEach((snippet, index) => {
      if (!snippet || !snippet.snippet) return;

      const processedSnippet = removeStopwords(preprocessText(snippet.snippet));
      const processedTitle = snippet.title
        ? removeStopwords(preprocessText(snippet.title))
        : "";

      // Tính độ tương đồng cho cả snippet và title
      const snippetSimilarity = stringSimilarity.compareTwoStrings(
        processedQuery,
        processedSnippet
      );

      const titleSimilarity = processedTitle
        ? stringSimilarity.compareTwoStrings(processedQuery, processedTitle)
        : 0;

      // Tính điểm tổng hợp với trọng số
      // Title có trọng số 0.4, snippet có trọng số 0.6
      let similarity = snippetSimilarity * 0.6 + titleSimilarity * 0.4;

      // Tăng điểm cho các từ khóa quan trọng trong cả title và snippet
      const importantWords = [
        "gì",
        "nào",
        "sao",
        "tại sao",
        "bao nhiêu",
        "khi nào",
        "như thế nào",
        "thế nào",
      ];
      importantWords.forEach((word) => {
        if (query.includes(word)) {
          if (snippet.snippet.includes(word)) similarity += 0.1;
          if (snippet.title && snippet.title.includes(word)) similarity += 0.15; // Boost cao hơn cho title matches
        }
      });

      // Tăng điểm cho câu hỏi cùng loại
      const questionTypes = {
        "là gì": ["định nghĩa", "khái niệm", "là"],
        "tại sao": ["nguyên nhân", "lý do", "bởi vì"],
        "làm sao": ["cách", "phương pháp", "hướng dẫn"],
        "ở đâu": ["địa điểm", "vị trí", "nơi"],
      };

      Object.entries(questionTypes).forEach(([type, keywords]) => {
        if (query.includes(type)) {
          keywords.forEach((keyword) => {
            if (snippet.title?.toLowerCase().includes(keyword))
              similarity += 0.2;
            if (snippet.snippet.toLowerCase().includes(keyword))
              similarity += 0.1;
          });
        }
      });

      if (similarity > maxSimilarity) {
        maxSimilarity = similarity;
        bestMatchIndex = index;
      }
    });

    // Kiểm tra kết quả trước khi trả về
    if (bestMatchIndex === -1 || !snippets[bestMatchIndex]) {
      console.log("No suitable match found");
      return null;
    }

    console.log("Best match found:", snippets[bestMatchIndex]);
    return snippets[bestMatchIndex];
  };

  const fetchAllSnippets = async (query) => {
    const config = useRuntimeConfig();
    console.log(config.public.serpAPI);
    try {
      const response = await axios.get("https://serpapi.com/search", {
        params: {
          q: query,
          api_key: config.public.serpAPI,
        },
        headers: {
          Accept: "application/json",
        },
      });

      const data = response.data;

      // Tạo một array để chứa tất cả snippet
      let snippets = [];

      // Lấy snippet từ featured_snippet (nếu có)
      if (data.answer_box) {
        let snippetText = "";

        // Gộp snippet và list thành một chuỗi
        if (data.answer_box.snippet && data.answer_box.list) {
          // Thêm snippet chính làm tiêu đề
          snippetText = data.answer_box.snippet + "\n\n";

          // Thêm các mục trong list
          snippetText += data.answer_box.list
            .map((item) => item.trim()) // Loại bỏ khoảng trắng thừa
            .filter((item) => item && item !== "...") // Loại bỏ các mục rỗng hoặc chỉ có ...
            .join("\n• "); // Thêm bullet point cho mỗi mục

          // Thêm bullet point cho mục đầu tiên
          snippetText = snippetText.replace(/\n/, "\n• ");
        }
        // Nếu chỉ có list
        else if (data.answer_box.list) {
          snippetText = data.answer_box.list
            .map((item) => item.trim())
            .filter((item) => item && item !== "...")
            .join("\n• ");
          snippetText = "• " + snippetText;
        }
        // Nếu chỉ có snippet
        else if (data.answer_box.snippet) {
          snippetText = data.answer_box.snippet;
        }

        if (snippetText) {
          snippets.push({
            snippet: snippetText,
            title: data.answer_box.title || "",
            link: data.answer_box.link || "",
          });
        }
      } else if (data.related_questions) {
        let combinedSnippet = "";

        // Gộp tất cả các related questions
        data.related_questions.forEach((question, index) => {
          if (question.question && question.snippet) {
            // Thêm dấu phân cách giữa các câu hỏi
            if (index > 0) combinedSnippet += "\n\n";

            // Thêm câu hỏi và câu trả lời
            combinedSnippet += `${question.question}\n`;

            // Xử lý snippet là list (nếu có)
            if (Array.isArray(question.list)) {
              combinedSnippet += question.list
                .map((item) => item.trim())
                .filter((item) => item && item !== "...")
                .map((item) => `• ${item}`)
                .join("\n");
            }
            // Xử lý snippet thông thường
            else if (question.snippet) {
              combinedSnippet += question.snippet;
            }
          }
        });

        if (combinedSnippet) {
          snippets.push({
            snippet: combinedSnippet,
            title: "Các câu hỏi liên quan",
            link: data.related_questions[0]?.link || "",
          });
        }
      } else if (data.organic_results) {
        snippets = [
          ...snippets,
          ...data.organic_results.map((result) => ({
            snippet: result.snippet || "",
            title: result.title || "",
            link: result.link || "",
          })),
        ];
      }

      // Sửa lại điều kiện kiểm tra bestSnippet
      console.log("All Snippets:", snippets);
      const bestSnippet = findBestSnippet(query, snippets);
      console.log("Best Snippets:", bestSnippet);

      if (bestSnippet && bestSnippet !== null) {
        sendMessage(query, bestSnippet);
      } else {
        sendMessage(
          query,
          "Có vẻ như tôi không biết câu trả lời cho câu hỏi này"
        );
      }
    } catch (error) {
      console.error(
        "Error fetching data:",
        error.response ? error.response.data : error.message
      );
      throw new Error(
        "Error fetching data: " + (error.response?.data || error.message)
      );
    }
  };

  // const search = async (searchString, flag) => {
  //   const userQuestion = ref("");
  //   const answer = ref("");
  //   const error = ref("");
  //   console.log(searchString);
  //   try {
  //     error.value = "";
  //     const response = await axios.post("http://127.0.0.1:8000/get_answer", {
  //       user_question: searchString,
  //     });
  //     answer.value = response.data.answer;

  //     console.log(response.data.answer);
  //   } catch (err) {
  //     error.value = "Đã có lỗi xảy ra khi tìm kiếm câu trả lời.";
  //     console.error("Error:", err);
  //   }
  //   if (answer.value !== undefined || answer.value !== null) {
  //     sendMessage(searchString, answer.value);
  //   } else {
  //     sendMessage(
  //       searchString,
  //       "Có vẻ như tôi không biết câu trả lời cho câu hỏi này"
  //     );
  //   }
  // };

  return {
    //search,
    fetchAllSnippets,
  };
};
