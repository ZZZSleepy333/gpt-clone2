import { MongoClient } from "mongodb";
import * as dotenv from "dotenv";

dotenv.config();

export const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;
  console.log(process.env.MONGODB_URI);

  if (!mongoUri) {
    throw new Error("MONGO_URI is not defined in the environment variables.");
  }

  try {
    const client = new MongoClient(mongoUri);
    await client.connect();
    console.log("MongoDB connected");
    return client.db(); // Trả về database instance
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};
