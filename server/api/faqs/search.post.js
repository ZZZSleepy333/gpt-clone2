import { MongoClient } from "mongodb";

// Hàm lấy FAQs từ MongoDB
const getFaqs = async () => {
  try {
    const client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db(process.env.MONGODB_DB_NAME);
    const collection = db.collection("qas");

    const faqs = await collection.find({}).toArray();

    console.log("Successfully fetched FAQs from MongoDB:");
    console.log(`Total FAQs found: ${faqs.length}`);
    console.log("Sample FAQ:", faqs[0]); // Hiển thị FAQ đầu tiên làm mẫu

    await client.close();
    return faqs;
  } catch (error) {
    console.error("Error fetching FAQs from MongoDB:", error);
    return [];
  }
};

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { query, embedding } = body;

    console.log("Searching for query:", query);

    // Lấy tất cả FAQs từ MongoDB
    const faqs = await getFaqs();

    // Filter sơ bộ để giảm số lượng FAQs cần xử lý
    const filteredFaqs = faqs.filter((faq) => {
      const queryLower = query.toLowerCase();
      // Kiểm tra nếu keyword là undefined thì gán mảng rỗng
      const keywords = faq.keyword || [];
      return (
        keywords.some((k) => queryLower.includes(k.toLowerCase())) ||
        faq.question.toLowerCase().includes(queryLower)
      );
    });

    console.log(`Found ${filteredFaqs.length} matching FAQs after filtering`);
    if (filteredFaqs.length > 0) {
      console.log("First matching FAQ:", filteredFaqs[0]);
    }

    return filteredFaqs;
  } catch (error) {
    console.error("Error in FAQ search:", error);
    throw createError({
      statusCode: 500,
      message: "Internal server error during FAQ search",
    });
  }
});
