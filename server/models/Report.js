import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "resolved"],
      default: "pending",
    },
    userMessage: {
      type: String,
      required: true,
    },
    botMessage: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const Report = mongoose.model("Report", reportSchema);
