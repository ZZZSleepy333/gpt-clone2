import { connectDB } from "../db";
import Response from "../models/Response";
import fs from "fs/promises";

export default defineEventHandler(async (event) => {
  await connectDB();

  try {
    const data = await fs.readFile("server/data/data.json", "utf-8");
    const jsonData = JSON.parse(data);

    const result = await Response.insertMany(jsonData);
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    let errorMessage = "";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return {
      success: false,
      message: errorMessage,
    };
  }
});
