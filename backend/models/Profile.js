import mongoose from "mongoose";

const profileSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  summary: { type: String, default: "" },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model("Profile", profileSchema);
