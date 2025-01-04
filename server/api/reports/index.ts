import { Report } from "~/server/models/Report";

export default defineEventHandler(async (event) => {
  const method = event.method;

  if (method === "GET") {
    return await Report.find().sort({ createdAt: -1 });
  }

  if (method === "POST") {
    const body = await readBody(event);
    const report = new Report({
      userId: body.userId,
      reason: body.reason,
      userMessage: body.userMessage,
      botMessage: body.botMessage,
      status: "pending",
    });
    return await report.save();
  }
});
