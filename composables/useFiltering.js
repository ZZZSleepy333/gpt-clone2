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
  const { messages, getCurrentContext } = useConversationContext();

  const embedCache = new Map();
  const resultCache = new Map();
  const CACHE_TTL = 24 * 60 * 60 * 1000;

  const getEmbedding = async (text, retries = 3) => {
    const cacheKey = text.trim().toLowerCase();

    if (embedCache.has(cacheKey)) {
      const cached = embedCache.get(cacheKey);
      if (Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.embedding;
      }
    }

    for (let i = 0; i < retries; i++) {
      try {
        const processedText = text.trim().replace(/\s+/g, " ").slice(0, 512);
        const embedding = await hf.featureExtraction({
          model: "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2",
          inputs: processedText,
        });

        embedCache.set(cacheKey, {
          embedding,
          timestamp: Date.now(),
        });
        return embedding;
      } catch (error) {
        console.error(`Attempt ${i + 1} failed:`, error);
        if (i === retries - 1) return null;
        await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
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
      if (!snippets || !Array.isArray(snippets) || snippets.length === 0) {
        console.log("No valid snippets found");
        return null;
      }

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
        if (Date.now() - cached.timestamp < CACHE_TTL) return cached.result;
      }

      const queryEmbed = getEmbedding(query);
      const snippetEmbeddings = await Promise.all(
        snippets.map((snippet) =>
          snippet && snippet.snippet ? getEmbedding(snippet.snippet) : null
        )
      );

      const queryEmbedResult = await queryEmbed;

      let bestMatch = null;
      let highestScore = -1;

      const scores = await Promise.all(
        snippets.map(async (snippet, index) => {
          if (!snippet || !snippet.snippet) return null;

          let totalScore = 0;
          const snippetLower = snippet.snippet.toLowerCase();
          const snippetEmbed = snippetEmbeddings[index];

          if (queryEmbedResult && snippetEmbed) {
            const similarityScore = cosineSimilarity(
              queryEmbedResult,
              snippetEmbed
            );
            if (!isNaN(similarityScore)) {
              totalScore += similarityScore * 0.4;
            }
          }

          const keywords = query.toLowerCase().trim().split(/\s+/);
          let keywordScore = 0;
          keywords.forEach((keyword) => {
            if (keyword.length > 2 && snippetLower.includes(keyword)) {
              keywordScore += 0.15;
            }
          });
          totalScore += Math.min(0.4, keywordScore);

          const wordCount = snippet.snippet.split(/\s+/).length;
          if (wordCount > 20 && wordCount < 200) {
            totalScore += 0.1;
          }

          const stringSimilarityScore = stringSimilarity.compareTwoStrings(
            query.toLowerCase(),
            snippetLower
          );
          totalScore += stringSimilarityScore * 0.1;

          if (snippet.source_type === "answer_box") {
            totalScore += 0.2;
          } else if (snippet.source_type === "related_question") {
            totalScore += 0.15;
          }

          const positionBonus = Math.max(0, 0.1 - index * 0.01);
          totalScore += positionBonus;

          console.log(`Snippet ${index} score:`, totalScore.toFixed(2));

          return { score: totalScore, snippet };
        })
      );

      const bestResult = scores
        .filter((result) => result && result.score > 0.2)
        .reduce(
          (best, current) => (current.score > best.score ? current : best),
          { score: -1 }
        );

      if (bestResult.score > -1) {
        bestMatch = {
          snippet: bestResult.snippet.snippet,
          link: bestResult.snippet.link,
          title: bestResult.snippet.title,
        };
      }

      if (bestMatch && bestMatch.score < 0.2) {
        console.log("No snippet met minimum score threshold");
        return null;
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

    const queryLower = query.toLowerCase().trim();
    const hasRequired = requiredKeywords.some((keyword) =>
      queryLower.includes(keyword)
    );

    if (!hasRequired) {
      const randomKeyword =
        requiredKeywords[Math.floor(Math.random() * requiredKeywords.length)];
      return `${query} ${randomKeyword}`;
    }

    return query;
  };

  const searchInFAQs = async (query) => {
    try {
      const queryEmbed = await getEmbedding(query);

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

      const scoredFaqs = await Promise.all(
        faqs.map(async (faq) => {
          let totalScore = 0;

          if (queryEmbed && faq.embedding) {
            const similarityScore = cosineSimilarity(queryEmbed, faq.embedding);
            if (!isNaN(similarityScore)) {
              totalScore += similarityScore * 0.4;
            }
          }

          const keywords = query.toLowerCase().trim().split(/\s+/);
          let keywordScore = 0;
          keywords.forEach((keyword) => {
            if (faq.question.toLowerCase().includes(keyword)) {
              keywordScore += 0.15;
            }
            if (faq.keyword.some((k) => k.toLowerCase().includes(keyword))) {
              keywordScore += 0.2;
            }
          });
          totalScore += Math.min(0.4, keywordScore);

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

      const bestMatch = scoredFaqs
        .sort((a, b) => b.score - a.score)
        .find((faq) => faq.score > 0.3);

      if (bestMatch) {
        return {
          snippet: bestMatch.answer,
          title: "",
          link: "",
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
      const cacheKey = query.toLowerCase().trim();
      if (resultCache.has(cacheKey)) {
        const cached = resultCache.get(cacheKey);
        if (Date.now() - cached.timestamp < CACHE_TTL) {
          sendMessage(query, cached.result);
          return;
        }
      }

      const [faqResult, serpResponse] = await Promise.all([
        searchInFAQs(query),
        axios.get("https://serpapi.com/search", {
          params: {
            q: validateQuery(query),
            engine: "duckduckgo",
            api_key: config.public.serpAPI,
          },
          headers: {
            Accept: "application/json",
          },
        }),
      ]);

      if (faqResult) {
        console.log("Found result in FAQs with score:", faqResult.score);
        sendMessage(query, faqResult);

        return;
      }

      const data = serpResponse.data;
      let snippets = [];

      if (data.organic_results) {
        snippets = data.organic_results.map((result) => ({
          snippet: result.snippet || "",
          title: result.title || "",
          link: result.link || "",
        }));
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
      console.error("Error fetching data:", error);
      throw new Error(
        "Error fetching data: " + (error.response?.data || error.message)
      );
    }
  };

  return {
    fetchAllSnippets,
  };
};
