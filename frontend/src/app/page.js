"use client";

import { useState, useEffect, useRef } from "react";

export default function ChatPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");

  const chatEndRef = useRef(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch chat history after login
  useEffect(() => {
    if (token) {
      fetch("http://localhost:5000/history", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(data => {
          if (data.messages) setHistory(data.messages);
        });
    }
  }, [token]);

  const handleSignup = async () => {
    const res = await fetch("http://localhost:5000/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    alert(data.message || data.error);
  };

  const handleLogin = async () => {
    const res = await fetch("http://localhost:5000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (data.token) {
      setToken(data.token);
      setIsLoggedIn(true);
      // Greeting message
      setMessages([{ role: "assistant", content: `Hello ${username}! How can I help you??` }]);
    } else {
      alert(data.error);
    }
  };

  const sendMessage = async () => {
    if (!message) return;
    setMessages([...messages, { role: "user", content: message }]);
    setMessage("");

    const res = await fetch("http://localhost:5000/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message }),
    });
    const data = await res.json();
    if (data.reply) {
      setMessages(prev => [...prev, { role: "assistant", content: data.reply }]);
    } else {
      alert("Error contacting server");
    }
  };

  if (!isLoggedIn) {
    return (
      <div style={{ maxWidth: "400px", margin: "2rem auto", textAlign: "center" }}>
        <h2>Student Login / Signup</h2>
        <input
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          style={{ width: "100%", padding: "0.5rem", margin: "0.5rem 0" }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={{ width: "100%", padding: "0.5rem", margin: "0.5rem 0" }}
        />
        <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
          <button onClick={handleSignup} style={{ flex: 1, padding: "0.5rem" }}>Signup</button>
          <button onClick={handleLogin} style={{ flex: 1, padding: "0.5rem" }}>Login</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "700px", margin: "2rem auto", padding: "1rem", border: "1px solid #ccc", borderRadius: "8px" }}>
      <h2 style={{ textAlign: "center" }}>Student Counseling Chatbot</h2>

      {/* Tabs */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem", gap: "1rem" }}>
        <button
          style={{ padding: "0.5rem 1rem", borderRadius: "8px", backgroundColor: activeTab === "chat" ? "#007bff" : "#ccc", color: "#fff" }}
          onClick={() => setActiveTab("chat")}
        >
          Chat
        </button>
        <button
          style={{ padding: "0.5rem 1rem", borderRadius: "8px", backgroundColor: activeTab === "history" ? "#007bff" : "#ccc", color: "#fff" }}
          onClick={() => setActiveTab("history")}
        >
          History
        </button>
      </div>

      {/* Chat Tab */}
      {activeTab === "chat" && (
        <>
          <div style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "1rem",
            height: "400px",
            overflowY: "auto",
            marginBottom: "1rem",
            backgroundColor: "#f9f9f9"
          }}>
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                  marginBottom: "0.5rem"
                }}
              >
                <div style={{
                  backgroundColor: msg.role === "user" ? "#DCF8C6" : "#E5E5EA",
                  padding: "0.5rem 1rem",
                  borderRadius: "15px",
                  maxWidth: "70%"
                }}>
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Type your message..."
              style={{ flex: 1, padding: "0.5rem", borderRadius: "8px", border: "1px solid #ccc" }}
              onKeyDown={e => e.key === "Enter" && sendMessage()}
            />
            <button onClick={sendMessage} style={{ padding: "0.5rem 1rem", borderRadius: "8px" }}>Send</button>
          </div>
        </>
      )}

      {/* History Tab */}
      {activeTab === "history" && (
        <div style={{
          border: "1px solid #ddd",
          borderRadius: "8px",
          padding: "1rem",
          height: "400px",
          overflowY: "auto",
          backgroundColor: "#f0f0f0"
        }}>
          {history.length === 0 && <p>No previous chats found.</p>}
          {history.map((msg, i) => (
            <div key={i} style={{ marginBottom: "0.5rem" }}>
              <b>{msg.role === "user" ? "You" : "Bot"}:</b> {msg.content}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
