import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import fetch from "node-fetch";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;


mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.error("❌ MongoDB Connection Error:", err));


const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ["user", "assistant"], required: true }, 
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const chatSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  messages: [messageSchema]
});

const User = mongoose.model("User", userSchema);
const Chat = mongoose.model("Chat", chatSchema);


const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};


app.post("/auth/signup", async (req, res) => {
  const { username, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  try {
    await User.create({ username, password: hashed });
    res.json({ message: "Signup successful" });
  } catch (err) {
    res.status(400).json({ error: "Username already exists" });
  }
});

app.post("/auth/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ error: "Invalid credentials" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ error: "Invalid credentials" });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
  res.json({ token });
});


app.get("/history", authMiddleware, async (req, res) => {
  try {
    let chat = await Chat.findOne({ userId: req.userId });
    if (!chat) chat = await Chat.create({ userId: req.userId, messages: [] });
    res.json({ messages: chat.messages });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch history" });
  }
});


app.post("/chat", authMiddleware, async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Message is required" });

  try {
    
    let chat = await Chat.findOne({ userId: req.userId });
    if (!chat) chat = await Chat.create({ userId: req.userId, messages: [] });

    chat.messages.push({ role: "user", content: message });
    await chat.save();

    
    const apiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: "meta-llama/Llama-3.3-8b-instruct:free",
        messages: chat.messages.map(m => ({
          role: m.role,
          content: m.content
        })),
        max_tokens: 200
      })
    });

    const data = await apiRes.json();
    const botReply = data?.choices?.[0]?.message?.content || "Sorry, I couldn't respond.";

   
    chat.messages.push({ role: "assistant", content: botReply });
    await chat.save();

    res.json({ reply: botReply });
  } catch (err) {
    console.error("❌ Chat error:", err);
    res.status(500).json({ error: "Error contacting the AI API" });
  }
});

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
