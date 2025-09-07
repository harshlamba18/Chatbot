# Student Counseling Chatbot

A student counseling chatbot built with **Node.js**, **Express**, **MongoDB**, and **LLaMA 3 API** via OpenRouter.  
It allows multiple students to interact with the bot individually, stores chat history per student, and provides personalized counseling based on previous conversations.

This project is intended for public institutes to help students with stress, motivation, and academic guidance.

---



## Backend Setup

1. **Clone the repository:**

```bash
git clone https://github.com/harshlamba18/Chatbot.git
cd Chatbot/backend
npm install
```

2. **Create .env file in backend:**
```bash
PORT=5000
MONGO_URI=<Your MongoDB Connection String>
JWT_SECRET=<Your JWT Secret>
OPENROUTER_API_KEY=<Your OpenRouter API Key>
```
3. **Run the backend Server**
```bash
node server.js
```


 
## Frontend Setup
1. **Navigate to the frontend directory:**

```bash
cd Chatbot/frontend
npm install
```

3. **Run the frontend Server**

```bash
npm run dev