
"use client";
import axios from "axios";
import React, { useState, useRef, useEffect, useCallback } from "react";

const OllamaChat = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);
  const abortRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  
const toLLMMessages = (msgs) =>
  msgs.map(m => ({
    role: m.sender === "user" ? "user" : "assistant",
    content: m.text
  }));


  const sendMessage = useCallback(async () => {
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput("");

    const userMessage = { sender: "user", text: userText };

    setMessages(prev => [
      ...prev,
      userMessage,
      { sender: "assistant", text: "Thinking..." }
    ]);

    setLoading(true);

    // Cancel previous request if still running
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    try {
      const res = await axiosClient.post(
        `${process.env.NEXT_PUBLIC_CLIMAX_MAIN_URL}/ollama/chatDB`,
        {
          messages: [
            ...toLLMMessages(messages),   // ← FULL HISTORY
            { role: "user", content: userText }
          ]
        },
        { signal: abortRef.current.signal }
      );

      const aiMessage = { sender: "assistant", text: res.data.response };

      setMessages(prev => [...prev.slice(0, -1), aiMessage]);
    } catch (err) {
      if (axiosClient.isCancel(err)) return;

      console.error("Ollama error:", err);

      setMessages(prev => [
        ...prev.slice(0, -1),
        { sender: "assistant", text: "⚠️ Error connecting to AI" }
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chat-container">
      <div className="messages-box">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`bubble ${msg.sender === "user" ? "user" : "assistant"}`}
          >
            <b>{msg.sender === "user" ? "You" : "Odyssey AI"}:</b> {msg.text}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <div className="input-area">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message…"
          className="chat-input"
        />

        <button className="send-btn" disabled={loading} onClick={sendMessage}>
          {loading ? "..." : "Send"}
        </button>

        <button className="clear-btn" onClick={() => setMessages([])}>
          Clear
        </button>
      </div>

      <style jsx>{`
        .chat-container {
          border: 1px solid #ccc;
          padding: 1rem;
          max-width: 600px;
          margin: auto;
          background: #f9f9f9;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          font-family: 'Segoe UI', sans-serif;
        }

        .messages-box {
          height: 65vh;
          overflow-y: auto;
          margin-bottom: 1rem;
          padding: 10px;
          display: flex;
          flex-direction: column;
        }

        .bubble {
          margin-bottom: 10px;
          padding: 12px 16px;
          border-radius: 18px;
          max-width: 80%;
          white-space: pre-wrap;
          box-shadow: 0 1px 3px rgba(0,0,0,0.2);
        }

        .bubble.user {
          background: #4a90e2;
          color: white;
          align-self: flex-end;
          text-align: right;
        }

        .bubble.assistant {
          background: #e5e5ea;
          color: black;
          align-self: flex-start;
        }

        .input-area {
          display: flex;
          gap: 10px;
        }

        .chat-input {
          flex: 1;
          padding: 10px;
          height: 60px;
          resize: none;
          border-radius: 8px;
          border: 1px solid #ccc;
          outline: none;
        }

        .send-btn {
          padding: 0 20px;
          border: none;
          border-radius: 8px;
          background: #4a90e2;
          color: white;
          font-weight: bold;
          cursor: pointer;
        }

        .send-btn:hover {
          background: #357abd;
        }

        .clear-btn {
          padding: 0 15px;
          border-radius: 8px;
          background: white;
          border: 1px solid #ccc;
          cursor: pointer;
        }

        .clear-btn:hover {
          background: #f0f0f0;
        }
      `}</style>
    </div>
  );
};

export default OllamaChat;
