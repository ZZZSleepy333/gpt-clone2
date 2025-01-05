import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
    },
    reason: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "resolved"],
      default: "pending",
    },
    userMessage: {
      type: String,
    },
    botMessage: {
      type: String,
    },
  },
  { timestamps: true }
);

export const Report = mongoose.model("Report", reportSchema);
