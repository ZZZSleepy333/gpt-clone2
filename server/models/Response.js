// server/models/Response.js
import mongoose from "mongoose";

const ResponseSchema = new mongoose.Schema({
  response: {
    type: String,
  },
  keyword: {
    type: String,
  },
  sets: {
    type: String,
  },
});

export default mongoose.models.Response ||
  mongoose.model("Response", ResponseSchema);
