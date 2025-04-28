import React, { useState } from "react";
import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

// Set up OpenAI instance
const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey:
    "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",
  dangerouslyAllowBrowser: true,
  defaultHeaders: {
    "HTTP-Referer": "https://yourwebsite.com",
    "X-Title": "My Brainstorm App",
  },
});

const BrainstormChat: React.FC = () => {
  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<ChatCompletionMessageParam[]>([
    {
      role: "assistant",
      content: "Welcome! I'm here to help you brainstorm ideas. 💼",
    },
  ]);
  const [loading, setLoading] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(true); // Chat visibility

  const sanitizeResponse = (content: any): string => {
    if (typeof content === "string") return content.trim();
    if (Array.isArray(content)) {
      return content
        .map((part) => (typeof part === "string" ? part : part?.text || ""))
        .join(" ")
        .trim();
    }
    if (typeof content === "object" && content !== null && "text" in content) {
      return content.text?.trim() || "";
    }
    return String(content).trim();
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessages: ChatCompletionMessageParam[] = [
      ...messages,
      { role: "user", content: input },
    ];

    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await openai.chat.completions.create({
        model: "microsoft/mai-ds-r1:free",
        messages: newMessages,
      });

      const content = response.choices[0].message.content;
      const reply = sanitizeResponse(content);

      setMessages([...newMessages, { role: "assistant", content: reply }]);
    } catch (error) {
      console.error("Error during brainstorming:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <div
      id="chat-container"
      style={{
        position: "fixed",
        bottom: 20,
        right: 20,
        maxWidth: 300,
        padding: 16,
        fontFamily: "Segoe UI, sans-serif",
        backgroundColor: "#ffffff",
        borderRadius: 12,
        boxShadow: "0 0 15px rgba(0, 0, 0, 0.1)",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <h3 style={{ color: "#2e7d32", fontSize: 16, margin: 0 }}>
          💼 Chatbot
        </h3>
        <button
          onClick={() => setVisible(false)}
          style={{
            border: "none",
            background: "#e0e0e0",
            padding: "4px 8px",
            borderRadius: 8,
            fontSize: 14,
            cursor: "pointer",
            color: "#333",
          }}
        >
          ← Back
        </button>
      </div>
      <div
        id="chat-box"
        style={{
          border: "1px solid #ccc",
          padding: 10,
          borderRadius: 8,
          height: 200,
          overflowY: "auto",
          background: "#f9f9f9",
        }}
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            style={{
              margin: "8px 0",
              textAlign: msg.role === "user" ? "right" : "left",
            }}
          >
            <div
              style={{
                display: "inline-block",
                padding: "8px 12px",
                borderRadius: 12,
                background: msg.role === "user" ? "#e3f2fd" : "#f1f8e9",
                color: "#212121",
                maxWidth: "80%",
                wordWrap: "break-word",
              }}
            >
              {sanitizeResponse(msg.content)}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ textAlign: "left", margin: "12px 0" }}>
            <div
              style={{
                display: "inline-block",
                padding: "8px 12px",
                borderRadius: 12,
                background: "#f1f8e9",
                color: "#757575",
                fontStyle: "italic",
              }}
            >
              Typing...
            </div>
          </div>
        )}
      </div>
      <div style={{ marginTop: 10, display: "flex" }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type here..."
          style={{
            flex: 1,
            padding: "8px 12px",
            borderRadius: 10,
            border: "1px solid #bbb",
            fontSize: 14,
            marginRight: 8,
          }}
        />
        <button
          onClick={handleSend}
          disabled={loading}
          style={{
            padding: "8px 16px",
            borderRadius: 10,
            background: "#2e7d32",
            border: "none",
            color: "white",
            fontWeight: "bold",
            fontSize: 14,
          }}
        >
          {loading ? "..." : "Send"}
        </button>
      </div>
    </div>
  );
};

export default BrainstormChat;
