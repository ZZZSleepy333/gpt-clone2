import { useSendMessage } from "~/composables/useSendMessage.js";
import axios from "axios";
import stringSimilarity from "string-similarity";
import { useRuntimeConfig } from "nuxt/app";
import { HfInference } from "@huggingface/inference";

export const useFiltering = () => {
  const { sendMessage } = useSendMessage();
  const config = useRuntimeConfig();
  const hf = new HfInference(config.public.huggingFaceApiKey);

  // Cache system
  const embedCache = new Map();
  const resultCache = new Map();

  const getCachedEmbedding = async (text, retries = 3) => {
    if (embedCache.has(text)) return embedCache.get(text);

    for (let i = 0; i < retries; i++) {
      try {
        const processedText = text.trim().replace(/\s+/g, " ").slice(0, 512);

        const embedding = await hf.featureExtraction({
          model: "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
          inputs: processedText,
        });

        embedCache.set(text, embedding);
        return embedding;
      } catch (error) {
        console.error(`Attempt ${i + 1} failed:`, error);
        if (i === retries - 1) return null; // Return null after all retries fail
        await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1))); // Exponential backoff
      }
    }
  };

  const cosineSimilarity = (embeddings1, embeddings2) => {
    const dotProduct = embeddings1.reduce(
      (sum, val, i) => sum + val * embeddings2[i],
      0
    );
    const norm1 = Math.sqrt(
      embeddings1.reduce((sum, val) => sum + val * val, 0)
    );
    const norm2 = Math.sqrt(
      embeddings2.reduce((sum, val) => sum + val * val, 0)
    );
    return dotProduct / (norm1 * norm2);
  };

  const findBestSnippet = async (query, snippets) => {
    // Kiểm tra đầu vào
    if (!snippets || !Array.isArray(snippets) || snippets.length === 0) {
      console.log("No valid snippets found");
      return null;
    }

    try {
      const cacheKey = query.toLowerCase().trim();
      if (resultCache.has(cacheKey)) {
        const cached = resultCache.get(cacheKey);
        if (Date.now() - cached.timestamp < 3600000) return cached.result;
      }

      // Từ điển ánh xạ từ viết tắt và tên đầy đủ
      const abbreviationMap = {
        hcmue: [
          "đại học sư phạm tp.hcm",
          "đại học sư phạm thành phố hồ chí minh",
          "đại học sư phạm tphcm",
          "trường đ��i học sư phạm tp.hcm",
          "trường đại học sư phạm thành phố hồ chí minh",
        ],
        đhsp: ["đại học sư phạm"],
        tphcm: ["thành phố hồ chí minh"],
        đrl: ["điểm rèn luyện"],
        // Thêm các mapping khác nếu cần
        "học phí": [
          "học phí",
          "miễn giảm học phí",
          "chế độ học phí",
          "phí học tập",
        ],
        "tín chỉ": ["học phần", "tín chỉ"],
        "điểm rèn luyện": ["điểm rèn luyện"],
        "học phần": ["học phần"],
        đkhp: ["đăng ký học phần"],
        "đk học phần": ["đăng ký học phần"],
      };

      // Kiểm tra exact match với boundary cho viết tắt
      const isExactAbbrevMatch = (text, abbrev) => {
        const regex = new RegExp(`\\b${abbrev}\\b`, "i");
        return regex.test(text);
      };

      const cleanQuery = query.toLowerCase().trim();
      let bestMatch = null;
      let highestScore = -1;

      console.log("Input snippets:", snippets);

      for (const [index, snippet] of snippets.entries()) {
        if (!snippet || !snippet.snippet) continue;

        let totalScore = 0;
        const snippetLower = snippet.snippet.toLowerCase();
        const titleLower = snippet.title ? snippet.title.toLowerCase() : "";

        // 1. Xử lý từ viết tắt
        Object.entries(abbreviationMap).forEach(([abbrev, fullNames]) => {
          if (cleanQuery.includes(abbrev)) {
            // Nếu query chứa từ viết tắt
            if (isExactAbbrevMatch(snippetLower, abbrev)) {
              totalScore += 1.5; // Boost cao cho exact match của từ viết tắt
            }
            // Kiểm tra các tên đầy đủ tương ứng
            fullNames.forEach((name) => {
              if (snippetLower.includes(name)) {
                totalScore += 1.0;
              }
              if (titleLower.includes(name)) {
                totalScore += 0.8;
              }
            });
          }
        });

        // 2. Penalty cho từ viết tắt không liên quan
        Object.keys(abbreviationMap).forEach((abbrev) => {
          if (
            abbrev !== cleanQuery &&
            isExactAbbrevMatch(snippetLower, abbrev)
          ) {
            totalScore -= 0.5; // Giảm điểm nếu có từ viết tắt khác
          }
        });

        // 3. Semantic similarity (giữ nguyên)
        const queryEmbed = await getCachedEmbedding(query);
        const snippetEmbed = await getCachedEmbedding(snippet.snippet);
        if (queryEmbed && snippetEmbed) {
          const similarityScore = cosineSimilarity(queryEmbed, snippetEmbed);
          totalScore += similarityScore * 0.3;
        }

        // 4. Kiểm tra context phù hợp
        // const relevantContext = [
        //   "trường",
        //   "đại học",
        //   "giáo dục",
        //   "sinh viên",
        //   "học",
        // ];
        // relevantContext.forEach((ctx) => {
        //   if (snippetLower.includes(ctx)) {
        //     totalScore += 0.1;
        //   }
        // });

        console.log(`Snippet ${index} score:`, {
          totalScore,
          snippet: snippet.snippet,
          title: snippet.title,
        });

        if (totalScore > highestScore) {
          highestScore = totalScore;
          bestMatch = snippet;
        }
      }

      // Thêm ngưỡng điểm tối thiểu
      if (highestScore < 0.5) {
        return null;
      }

      resultCache.set(cacheKey, {
        result: bestMatch,
        timestamp: Date.now(),
      });

      return bestMatch;
    } catch (error) {
      console.error("Error in ML processing:", error);
      return findBestSnippetLegacy(query, snippets);
    }
  };

  // Legacy method as fallback
  const findBestSnippetLegacy = (query, snippets) => {
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
      let snippets = [];

      // Xử lý featured_snippet (giữ nguyên phần này)
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
      }
      // Sửa lại phần xử lý related_questions
      else if (data.related_questions) {
        // Xử lý mỗi related question riêng biệt
        snippets = data.related_questions.map((question) => {
          let snippetText = question.question + "\n"; // Thêm câu hỏi

          // Nếu có list, gộp list cho question này
          if (Array.isArray(question.list)) {
            snippetText += question.list
              .map((item) => item.trim())
              .filter((item) => item && item !== "...")
              .map((item) => `• ${item}`)
              .join("\n");
          }
          // Nếu chỉ có snippet thông thường
          else if (question.snippet) {
            snippetText += question.snippet;
          }

          return {
            snippet: snippetText,
            title: question.question,
            link: question.link || "",
          };
        });
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

      console.log("All Snippets:", snippets);
      const bestSnippet = await findBestSnippet(query, snippets);
      console.log("Best Snippets:", bestSnippet);

      if (bestSnippet && bestSnippet !== null) {
        sendMessage(query, bestSnippet);
      } else {
        sendMessage(query, {
          title: "",
          link: "",
          snippet: "Có vẻ như tôi không biết câu trả lời cho câu hỏi này",
        });
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
