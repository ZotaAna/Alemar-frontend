import React, { useState, useRef, useEffect } from "react";
import "./perfumechat.css";

const SYSTEM_PROMPT = `Ești un consultant expert în parfumuri pentru magazinul Alemar Store. Numele tău este Alemar AI. Răspunzi EXCLUSIV la întrebări despre parfumuri: recomandări, note olfactive, familii olfactive, ocazii, sezoane, longevitate, sillage, EDP vs EDT, îngrijire. Dacă ești întrebat altceva, spui politicos că ajuți doar cu parfumuri. Ești cald, entuziast, vorbești în română. Răspunsuri concise (max 4 propoziții). Folosești ocazional emoji: 🌸 🌿 ✨ 🕯️`;

export default function PerfumeChat({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Bună! Sunt Alemar AI, consultantul tău de parfumuri 🌸 Cu ce te pot ajuta?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const newMessages = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await response.json();
      const reply = data?.content?.[0]?.text || "A apărut o eroare, încearcă din nou!";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Eroare de conexiune 🙏 Încearcă din nou!" }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  if (!isOpen) return null;

  return (
    <div className="pchat-widget">
      <div className="pchat-header">
        <div className="pchat-header-left">
          <div className="pchat-avatar">✨</div>
          <div>
            <div className="pchat-title">Alemar AI</div>
            <div className="pchat-subtitle">Expert în parfumuri</div>
          </div>
        </div>
        <button className="pchat-close" onClick={onClose}>×</button>
      </div>

      <div className="pchat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`pchat-msg pchat-msg--${msg.role}`}>
            {msg.role === "assistant" && <div className="pchat-msg-avatar">✨</div>}
            <div className="pchat-msg-bubble">{msg.content}</div>
          </div>
        ))}
        {loading && (
          <div className="pchat-msg pchat-msg--assistant">
            <div className="pchat-msg-avatar">✨</div>
            <div className="pchat-msg-bubble pchat-typing">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {messages.length === 1 && (
        <div className="pchat-suggestions">
          {["Recomandă-mi un parfum floral 🌸", "Ce parfum e bun cadou?", "Diferența EDP vs EDT?"].map((s) => (
            <button key={s} className="pchat-suggestion" onClick={() => setInput(s)}>{s}</button>
          ))}
        </div>
      )}

      <div className="pchat-input-area">
        <textarea
          ref={inputRef}
          className="pchat-input"
          rows={1}
          placeholder="Întreabă despre parfumuri..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className={`pchat-send ${loading || !input.trim() ? "pchat-send--disabled" : ""}`}
          onClick={sendMessage}
          disabled={loading || !input.trim()}
        >➤</button>
      </div>
    </div>
  );
}