import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true }, // ✅ must pass from frontend
    messages: [
      {
        role: { type: String, enum: ["user", "bot"], required: true },
        content: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Chat", chatSchema);
