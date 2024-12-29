import { useSendMessage } from "~/composables/useSendMessage.js";
import axios from "axios";
import stringSimilarity from "string-similarity";
import { useRuntimeConfig } from "nuxt/app";
import { HfInference } from "@huggingface/inference";
import openai from "../utils/openai";
import { useConversationContext } from "~/composables/useConversationContext.js";
import * as cheerio from "cheerio";

export const useFiltering = () => {
  const { sendMessage } = useSendMessage();
  const config = useRuntimeConfig();
  const hf = new HfInference(config.public.huggingFaceApiKey);
  const { addToHistory, updateContext, getRelevantHistory, currentContext } =
    useConversationContext();

  // Cache system
  const embedCache = new Map();
  const resultCache = new Map();

  const getCachedEmbedding = async (text, retries = 3) => {
    if (embedCache.has(text)) return embedCache.get(text);

    for (let i = 0; i < retries; i++) {
      try {
        const processedText = text.trim().replace(/\s+/g, " ").slice(0, 512);

        const embedding = await hf.featureExtraction({
          model: "VoVanPhuc/sup-SimCSE-VietNamese-phobert-base",
          inputs: processedText,
        });

        embedCache.set(text, embedding);
        return embedding;
      } catch (error) {
        console.error(`Attempt ${i + 1} failed:`, error);
        if (i === retries - 1) return null;
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
    try {
      // Kiểm tra đầu vào
      if (!snippets || !Array.isArray(snippets) || snippets.length === 0) {
        console.log("No valid snippets found");
        return null;
      }

      // Lọc bỏ các snippet từ Facebook
      snippets = snippets.filter((snippet) => {
        if (!snippet || !snippet.link) return false;
        const url = snippet.link.toLowerCase();
        return (
          !url.includes("facebook.com") &&
          !url.includes("fb.com") &&
          !url.includes("fb.watch")
        );
      });

      console.log("Filtered snippets (removed Facebook):", snippets.length);

      const cacheKey = query.toLowerCase().trim();
      if (resultCache.has(cacheKey)) {
        const cached = resultCache.get(cacheKey);
        if (Date.now() - cached.timestamp < 3600000) return cached.result;
      }

      let bestMatch = null;
      let highestScore = -1;

      for (const [index, snippet] of snippets.entries()) {
        if (!snippet || !snippet.snippet) continue;

        let totalScore = 0;
        const snippetLower = snippet.snippet.toLowerCase();

        // 1. Semantic Similarity - Giảm trọng số xuống
        try {
          const queryEmbed = await getCachedEmbedding(query);
          const snippetEmbed = await getCachedEmbedding(snippet.snippet);

          if (
            queryEmbed &&
            snippetEmbed &&
            Array.isArray(queryEmbed) &&
            Array.isArray(snippetEmbed)
          ) {
            const similarityScore = cosineSimilarity(queryEmbed, snippetEmbed);
            if (!isNaN(similarityScore)) {
              totalScore += similarityScore * 0.4; // Giảm từ 0.6 xuống 0.4
            }
          }
        } catch (error) {
          console.error("Error calculating semantic similarity:", error);
          totalScore = 0;
        }

        // 2. Keyword matching - Điều chỉnh cách tính điểm
        const keywords = query.toLowerCase().trim().split(/\s+/);
        let keywordScore = 0;
        keywords.forEach((keyword) => {
          if (keyword.length > 2 && snippetLower.includes(keyword)) {
            keywordScore += 0.15; // Giảm điểm mỗi keyword
          }
        });
        totalScore += Math.min(0.4, keywordScore); // Giới hạn tối đa điểm keyword

        // 3. Length score - Điều chỉnh thang điểm
        const wordCount = snippet.snippet.split(/\s+/).length;
        if (wordCount > 20 && wordCount < 200) {
          totalScore += 0.1; // Giảm từ 0.2 xuống 0.1
        }

        // 4. Thêm điểm cho độ tương đồng chuỗi
        const stringSimilarityScore = stringSimilarity.compareTwoStrings(
          query.toLowerCase(),
          snippetLower
        );
        totalScore += stringSimilarityScore * 0.1;

        console.log(`Snippet ${index} score:`, totalScore.toFixed(2)); // Format số thập phân

        if (totalScore > highestScore) {
          highestScore = totalScore;
          bestMatch = snippet;
        }
      }

      // Điều chỉnh ngưỡng điểm tối thiểu
      if (highestScore < 0.2) {
        console.log("No snippet met minimum score threshold");
        return null;
      }

      if (bestMatch) {
        bestMatch = {
          snippet: bestMatch.snippet,
          link: bestMatch.link,
          title: bestMatch.title,
        };
      }

      resultCache.set(cacheKey, {
        result: bestMatch,
        timestamp: Date.now(),
      });

      return bestMatch;
    } catch (error) {
      console.error("Error in processing:", error);
      return null;
    }
  };

  const validateQuery = (query) => {
    // Danh sách từ khóa bắt buộc (ít nhất 1)
    const requiredKeywords = [
      "đại học sư phạm tphcm",
      "đại học sư phạm tp hcm",
      "đại học sư phạm thành phố hcm",
      "đại học sư phạm tp hồ chí minh",
      "đại học sp tphcm",
      "đại học sp tp hcm",
      "đại học sp thành phố hcm",
      "đại học sp tp hồ chí minh",
      "đh sư phạm tphcm",
      "đh sư phạm tp hcm",
      "đh sư phạm thành phố hcm",
      "đh sư phạm tp hồ chí minh",
      "đh sp tphcm",
      "đh sp tp hcm",
      "đh sp thành phố hcm",
      "đh sp tp hồ chí minh",
      "trường đại học sư phạm tphcm",
      "trường đại học sư phạm tp hcm",
      "trường đại học sư phạm thành phố hcm",
      "trường đại học sư phạm tp hồ chí minh",
      "trường đại học sp tphcm",
      "trường đại học sp tp hcm",
      "trường đại học sp thành phố hcm",
      "trường đại học sp tp hồ chí minh",
      "trường đh sư phạm tphcm",
      "trường đh sư phạm tp hcm",
      "trường đh sư phạm thành phố hcm",
      "trường đh sư phạm tp hồ chí minh",
      "trường đh sp tphcm",
      "trường đh sp tp hcm",
      "trường đh sp thành phố hcm",
      "trường đh sp tp hồ chí minh",
      "hcmue",
    ];

    // Danh sách từ khóa địa điểm (ít nhất 1)

    const queryLower = query.toLowerCase().trim();

    // Kiểm tra xem có ít nhất 1 từ khóa bắt buộc
    const hasRequired = requiredKeywords.some((keyword) =>
      queryLower.includes(keyword)
    );

    // Kiểm tra xem có ít nhất 1 từ khóa địa điểm

    // Trả về kết quả và message tương ứng

    if (!hasRequired) {
      return {
        isValid: false,
        message: "Vui lòng thêm từ khóa liên quan đến Đại học Sư phạm",
      };
    }

    return {
      isValid: true,
      message: "",
    };
  };

  // Thêm hàm tìm kiếm trong collection QAs
  const searchInQAs = async (query) => {
    try {
      const response = await fetch("/api/qas/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();

      // Nếu tìm thấy kết quả
      if (data && data.length > 0) {
        // Tìm kết quả có độ tương đồng cao nhất
        const bestMatch = data.reduce((best, current) => {
          const keywordSimilarity = stringSimilarity.findBestMatch(
            query.toLowerCase(),
            [
              ...current.keyword.map((k) => k.toLowerCase()),
              current.question.toLowerCase(),
            ]
          ).bestMatch.rating;

          if (!best || keywordSimilarity > best.similarity) {
            return { ...current, similarity: keywordSimilarity };
          }
          return best;
        }, null);

        if (bestMatch && bestMatch.similarity > 0.3) {
          // Ngưỡng độ tương đồng
          return {
            snippet: bestMatch.answer,
            title: bestMatch.question,
            link: "", // Có thể thêm link nếu cần
            source: "local", // Đánh dấu nguồn là từ database local
          };
        }
      }

      return null; // Không tìm thấy kết quả phù hợp
    } catch (error) {
      console.error("Error searching in QAs:", error);
      return null;
    }
  };

  const searchInFAQs = async (query) => {
    try {
      // 1. Lấy embedding của query
      const queryEmbed = await getCachedEmbedding(query);

      // 2. Gọi API để lấy tất cả FAQs
      const response = await fetch("/api/faqs/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          embedding: queryEmbed,
        }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const faqs = await response.json();

      if (!faqs || faqs.length === 0) return null;

      // 3. Tính điểm cho mỗi FAQ
      const scoredFaqs = await Promise.all(
        faqs.map(async (faq) => {
          let totalScore = 0;

          // 3.1. Semantic Similarity nếu có embedding
          if (queryEmbed && faq.embedding) {
            const similarityScore = cosineSimilarity(queryEmbed, faq.embedding);
            if (!isNaN(similarityScore)) {
              totalScore += similarityScore * 0.4;
            }
          }

          // 3.2. Keyword Matching
          const keywords = query.toLowerCase().trim().split(/\s+/);
          let keywordScore = 0;

          // Kiểm tra từng keyword trong câu hỏi
          keywords.forEach((keyword) => {
            if (faq.question.toLowerCase().includes(keyword)) {
              keywordScore += 0.15;
            }
            // Kiểm tra trong mảng keyword của FAQ
            if (faq.keyword.some((k) => k.toLowerCase().includes(keyword))) {
              keywordScore += 0.2;
            }
          });
          totalScore += Math.min(0.4, keywordScore);

          // 3.3. String Similarity với câu hỏi
          const questionSimilarity = stringSimilarity.compareTwoStrings(
            query.toLowerCase(),
            faq.question.toLowerCase()
          );
          totalScore += questionSimilarity * 0.2;

          return {
            ...faq,
            score: totalScore,
          };
        })
      );

      // 4. Sắp xếp và lấy kết quả tốt nhất
      const bestMatch = scoredFaqs
        .sort((a, b) => b.score - a.score)
        .find((faq) => faq.score > 0.3); // Ngưỡng điểm tối thiểu

      if (bestMatch) {
        return {
          snippet: bestMatch.answer,
          title: bestMatch.question,
          link: "", // Có thể thêm link nếu có
          source: "faq",
          score: bestMatch.score,
        };
      }

      return null;
    } catch (error) {
      console.error("Error searching in FAQs:", error);
      return null;
    }
  };

  const fetchAllSnippets = async (query) => {
    try {
      const relevantHistory = await getRelevantHistory(query);

      // Validate query trước khi fetch
      const validation = validateQuery(query);
      if (!validation.isValid) {
        sendMessage(query, {
          title: "",
          link: "",
          snippet: validation.message,
        });
        return;
      }

      // Tìm kiếm trong FAQs trước
      const faqResult = await searchInFAQs(query);
      if (faqResult) {
        console.log("Found result in FAQs with score:", faqResult.score);
        sendMessage(query, faqResult);
        return;
      }

      // Nếu không tìm thấy trong FAQs, thông báo cho người dùng
      // Nếu không tìm thấy trong FAQs, tiếp tục với serpAPI
      const config = useRuntimeConfig();
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

      // Xử lý kết quả từ DuckDuckGo
      if (data.organic_results) {
        snippets = data.organic_results.map((result) => ({
          snippet: result.snippet || "",
          title: result.title || "",
          link: result.link || "",
        }));
      }

      // Thêm related_questions nếu có
      if (data.related_questions) {
        snippets = [
          ...snippets,
          ...data.related_questions.map((question) => ({
            snippet: question.answer || "",
            title: question.question || "",
            link: question.link || "",
          })),
        ];
      }

      console.log("All Snippets:", snippets);
      const bestSnippet = await findBestSnippet(query, snippets);
      console.log("Best Snippets:", bestSnippet);

      if (bestSnippet && bestSnippet !== null) {
        const humanizedResponse = await humanizeResponse(
          {
            bestMatch: bestSnippet,
            additionalInfo: {
              relatedQuestions: data.related_questions || [],
              conversationHistory: relevantHistory,
            },
          },
          query
        );

        sendMessage(query, humanizedResponse.bestMatch);
      } else {
        sendMessage(query, {
          title: "",
          link: "",
          snippet: "Có vẻ như tôi không biết câu trả lời cho câu hỏi này",
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      throw new Error(
        "Error fetching data: " + (error.response?.data || error.message)
      );
    }
  };

  const humanizeResponse = async (response, query) => {
    try {
      const greetings = [
        "Để trả lời câu hỏi của bạn,",
        "Tôi xin chia sẻ rằng,",
        "Theo thông tin tôi có,",
        "Tôi hiểu rằng,",
      ];

      const followUps = [
        "Bạn có thêm câu hỏi gì không?",
        "Tôi có thể giúp gì thêm cho bạn?",
        "Bạn muốn biết thêm chi tiết gì không?",
        "Hãy hỏi thêm nếu bạn cần nhé!",
      ];

      const greeting = greetings[Math.floor(Math.random() * greetings.length)];
      const followUp = followUps[Math.floor(Math.random() * followUps.length)];

      let humanizedSnippet = `${greeting} ${response.bestMatch.snippet} \n\n${followUp}`;

      // Thêm câu hỏi liên quan nếu có
      if (response.additionalInfo?.relatedQuestions?.length > 0) {
        humanizedSnippet += "\n\nBạn có thể quan tâm đến:";
        response.additionalInfo.relatedQuestions.slice(0, 3).forEach((q) => {
          humanizedSnippet += `\n• ${q.question}`;
        });
      }

      return {
        ...response,
        bestMatch: {
          ...response.bestMatch,
          snippet: humanizedSnippet,
        },
      };
    } catch (error) {
      console.error("Error in humanizing response:", error);
      return response;
    }
  };

  return {
    //search,
    fetchAllSnippets,
  };
};
