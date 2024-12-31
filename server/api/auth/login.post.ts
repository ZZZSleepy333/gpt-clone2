// import { MongoClient } from "mongodb";

// export default defineEventHandler(async (event) => {
//   const config = useRuntimeConfig();
//   const client = new MongoClient(config.mongoUri);

//   try {
//     await client.connect();
//     const db = client.db(config.dbName);
//     const collection = db.collection("users");

//     const body = await readBody(event);
//     const user = await collection.findOne({ username: body.username });

//     // ... password validation

//     return {
//       id: user?._id,
//       username: user?.username,
//       displayName: user?.displayName,
//       role: user?.role,
//     };
//   } catch (error: any) {
//     //const mongoError = error as MongoError;
//     console.error("MongoDB Error:", error);
//     throw createError({
//       statusCode: 500,
//       message: error.message || "Database error",
//     });
//   } finally {
//     await client.close();
//   }
// });
