import { connectDB } from "~/server/db";
import { ObjectId } from "mongodb";

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  const body = await readBody(event);

  const db = await connectDB();
  const result = await db
    .collection("reports")
    .findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { status: body.status } },
      { returnDocument: "after" }
    );

  return result?.value;
});
